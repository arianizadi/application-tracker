/**
 * Detections → recommendations.
 *
 * Looks at what is actually on the board (applications, stage history, résumé
 * analyses, course progress) and suggests one small, specific prep step with a
 * "why now" that names the user's own data. Implements every rule in Part C of
 * docs/design/codex-cyber-research.md.
 *
 * Ground rules (Part C, "Interpretation and delivery rules"):
 * - These suggest preparation. They never diagnose ability or predict outcomes.
 * - A missing analyzer keyword is a wording signal, not proof of a skill gap.
 * - Dates that are unknown suppress date-dependent rules.
 * - Active interviews and assessments first, track prep next, habits after.
 * - Rejection counts are never used as a score or quoted back at the user.
 *
 * Pure and deterministic: no I/O, no clock reads (pass `now`), safe in tests.
 */
import type { MascotName } from "@/components/mascots/data";
import { dateKeyInZone, dateToKey, daysBetweenKeys } from "@/lib/applications/dates";
import type { SnapshotAnalysis, SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";

// ── Public types ────────────────────────────────────────────────────────────

/** Visual/semantic flavor of a recommendation, for chips and accents. */
export type RecommendationTone = "interview" | "assessment" | "celebrate" | "prep" | "wording" | "habit" | "welcome" | "course";

export type Recommendation = {
  id: string;
  title: string;
  /** Friendly, specific explanation of why this is recommended now. */
  message: string;
  /** Prep course module ids (routes: /prep/<moduleId>). */
  moduleIds: string[];
  /** Resource ids from the prep resource library. */
  resourceIds: string[];
  /** Higher = more important. Interviews/assessments ≥ 90, track prep 55–79, habits 30–54, fallbacks < 30. */
  priority: number;
  /** Part C rule id (e.g. "soc-interview"), or a Canopy fallback id. */
  ruleId?: string;
  tone?: RecommendationTone;
  /** Which Canopy character should deliver it. */
  mascot?: MascotName;
  /** Short facts from the user's data that triggered this (for a "why am I seeing this" disclosure). */
  evidence?: string[];
  /** Applications this is about, so the UI can deep-link. */
  applicationIds?: string[];
  /** True when the module reading is already done and the step is practice questions / a mock. */
  practice?: boolean;
  /** Suggested link: /prep/<moduleId>, /prep/<moduleId>#practice, or /prep/resources. */
  href?: string;
  /** Optional checklist (e.g. the mock-interview checklist). */
  steps?: string[];
};

/** Cybersecurity specialty groups (Part A/C track codes, minus "ALL"). */
export type TrackGroup = "SOC" | "ENG" | "OFF" | "APP" | "CLOUD" | "GRC" | "DFIR" | "CTI" | "DET" | "IAM";

export const MAX_RECOMMENDATIONS = 6;

// ── Time helpers ────────────────────────────────────────────────────────────

const DAY = 24 * 60 * 60 * 1000;

/** Milliseconds, or null for missing/invalid dates (cached snapshots may carry strings). */
function ms(value: Date | string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

// ── Text helpers ────────────────────────────────────────────────────────────

/** Lowercase, Unicode-normalize, turn separators into spaces. Keeps & + # (att&ck, c#). */
function normalizeRole(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}&+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keyword key as stored by the analyzer (canonical term) → comparable key. */
export function normalizeKeyword(term: string): string {
  return term
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s*&\s*/g, "&")
    .replace(/[^\p{L}\p{N}&+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, max = 40): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** "Acme", "Acme and Beta", "Acme, Beta, and 2 more". */
function nameList(names: string[], show = 2): string {
  const uniq = [...new Set(names.map((n) => clip(n)).filter(Boolean))];
  if (uniq.length === 0) return "a company";
  if (uniq.length === 1) return uniq[0]!;
  if (uniq.length === 2 && show >= 2) return `${uniq[0]} and ${uniq[1]}`;
  const head = uniq.slice(0, show);
  const rest = uniq.length - head.length;
  return rest > 0 ? `${head.join(", ")}, and ${rest} more` : `${head.slice(0, -1).join(", ")}, and ${head[head.length - 1]}`;
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

// ── Role → track group matching ─────────────────────────────────────────────

/** Words that make an ambiguous title ("Risk Analyst", "Identity Intern") security-flavored. */
const SECURITY_CONTEXT = /\b(?:security|secops|cyber|cybersecurity|infosec|information assurance|soc|siem|grc|appsec|devsecops)\b/;

type GroupPatterns = { strong: RegExp[]; weak?: RegExp[] };

/**
 * Case-insensitive, word-bounded synonyms. "strong" phrases always count;
 * "weak" ones only with a security context (role text or a cybersecurity track),
 * so "Credit Risk Intern" isn't read as GRC for a finance student.
 */
const GROUP_PATTERNS: Record<TrackGroup, GroupPatterns> = {
  SOC: {
    strong: [
      /\bsoc\b(?!\s*(?:1|2|i|ii|one|two)\b)/,
      /\bsecurity operations?\b/,
      /\bsecops\b/,
      /\bcyber ?defen[cs]e\b/,
      /\bblue team(?:er|ing)?\b/,
      /\bsecurity monitoring\b/,
    ],
  },
  ENG: {
    strong: [/\bsecurity engineer(?:s|ing)?\b/, /\bdevsecops\b/, /\binfrastructure security\b/, /\bsecurity software engineer/],
  },
  OFF: {
    strong: [
      /\bpen ?test(?:er|ers|ing)?\b/,
      /\bpenetration\b/,
      /\bred team(?:er|ers|ing)?\b/,
      /\boffensive\b/,
      /\bethical hack(?:er|ers|ing)\b/,
    ],
  },
  APP: {
    strong: [/\bappsec\b/, /\bapplication security\b/, /\bproduct security\b/, /\bsoftware security\b/, /\bprodsec\b/],
  },
  CLOUD: {
    strong: [/\bcloud ?sec(?:urity)?\b/, /\b(?:aws|azure|gcp|google cloud) security\b/],
    weak: [/\bcloud\b/],
  },
  GRC: {
    strong: [
      /\bgrc\b/,
      /\bsoc (?:1|2|i|ii)\b/,
      /\b(?:security|it|cyber|cybersecurity|information security|infosec) (?:audit(?:or|ors|ing)?|compliance|risk|governance)\b/,
      /\bcyber ?risk\b/,
      /\bgovernance risk (?:and |& )?compliance\b/,
    ],
    weak: [/\bgovernance\b/, /\brisk\b/, /\bcompliance\b/, /\baudit(?:or|ors|ing|s)?\b/],
  },
  DFIR: {
    strong: [/\bdfir\b/, /\bdigital forensics?\b/, /\bincident respon(?:se|der|ders)\b/, /\bc?sirt\b/, /\bcirt\b/],
    weak: [/\bforensics?\b/],
  },
  CTI: {
    strong: [/\bthreat intel(?:ligence)?\b/, /\bcyber intel(?:ligence)?\b/, /\bcti\b/],
  },
  DET: {
    strong: [/\bdetection engineer(?:s|ing)?\b/, /\bthreat hunt(?:er|ers|ing)?\b/, /\bdetection (?:and|&) response\b/],
    weak: [/\bdetections?\b/],
  },
  IAM: {
    strong: [/\biam\b/, /\bidentity (?:and|&) access\b/, /\bprivileged access\b/, /\bidentity security\b/],
    weak: [/\bidentity\b/, /\baccess management\b/, /\bpam\b/],
  },
};

export const TRACK_GROUPS: readonly TrackGroup[] = ["SOC", "DET", "DFIR", "CTI", "ENG", "APP", "OFF", "CLOUD", "IAM", "GRC"];

export const GROUP_LABELS: Record<TrackGroup, string> = {
  SOC: "SOC",
  ENG: "security engineering",
  OFF: "penetration testing",
  APP: "application security",
  CLOUD: "cloud security",
  GRC: "GRC",
  DFIR: "incident response",
  CTI: "threat intelligence",
  DET: "detection",
  IAM: "identity and access",
};

/** Which specialty groups a role title belongs to (case-insensitive, word-bounded, synonym-aware). */
export function matchRoleGroups(role: string, track?: string): TrackGroup[] {
  const text = normalizeRole(role ?? "");
  if (!text) return [];
  const securityContext = track === "cybersecurity" || SECURITY_CONTEXT.test(text);
  const out: TrackGroup[] = [];
  for (const group of TRACK_GROUPS) {
    const p = GROUP_PATTERNS[group];
    if (p.strong.some((re) => re.test(text)) || (securityContext && p.weak?.some((re) => re.test(text)))) out.push(group);
  }
  return out;
}

/** Windows-focused security role (for the PowerShell wording rule). */
function isWindowsSecurityRole(role: string, track: string): boolean {
  const text = normalizeRole(role);
  return /\b(?:windows|active directory|endpoint)\b/.test(text) && (track === "cybersecurity" || SECURITY_CONTEXT.test(text));
}

/** Analyzer preset key → group (src/lib/analyzer/presets/cybersecurity.ts). */
const PRESET_GROUPS: Record<string, TrackGroup> = {
  soc: "SOC",
  "sec-eng": "ENG",
  pentest: "OFF",
  appsec: "APP",
  cloudsec: "CLOUD",
  grc: "GRC",
  dfir: "DFIR",
  cti: "CTI",
  detection: "DET",
  iam: "IAM",
};

// ── Course data the rules reference ─────────────────────────────────────────

/** Course order with titles (validated against the module files in tests). */
export const COURSE: readonly { id: string; number: number; title: string }[] = [
  { id: "security-internship-hiring", number: 1, title: "How Security Internship Hiring Works" },
  { id: "networking-fundamentals", number: 2, title: "Follow the Packet" },
  { id: "operating-systems-security", number: 3, title: "Understand the Host" },
  { id: "security-fundamentals", number: 4, title: "Explain the Security Building Blocks" },
  { id: "web-application-security", number: 5, title: "Find and Fix Web Security Problems" },
  { id: "blue-team-soc", number: 6, title: "Investigate Alerts and Handle Incidents" },
  { id: "threats-and-frameworks", number: 7, title: "Turn Threat Information into Decisions" },
  { id: "offensive-security-basics", number: 8, title: "Test Systems with Permission and Purpose" },
  { id: "cloud-and-identity", number: 9, title: "Secure Access in the Cloud" },
  { id: "security-automation", number: 10, title: "Automate Carefully" },
  { id: "grc-and-risk", number: 11, title: "Connect Controls to Business Risk" },
  { id: "behavioral-security-interviews", number: 12, title: "Tell Credible Security Stories" },
  { id: "technical-scenarios", number: 13, title: "Reason Through Unfamiliar Evidence" },
  { id: "portfolio-and-projects", number: 14, title: "Make Your Work Easy to Evaluate" },
];

/** Mock interview checklist (Part C) for rejection-pattern recommendations. */
export const MOCK_INTERVIEW_CHECKLIST: readonly string[] = [
  "Use a real target posting.",
  "Practice a 60-second introduction.",
  "Explain one technical concept without jargon.",
  "Work through one scenario aloud.",
  "Deliver two truthful STAR stories.",
  "Walk through one project, including a limitation.",
  "Ask the reviewer where the answer became unclear.",
  "Select one improvement for the next attempt.",
];

type RuleKind = "stage" | "prep" | "wording" | "habit" | "welcome" | "course";

type RuleDef = {
  title: string;
  kind: RuleKind;
  priority: number;
  moduleIds: string[];
  resourceIds: string[];
  mascot: MascotName;
  tone: RecommendationTone;
};

/**
 * Every rule's static mapping. Resource ids were looked up by title in
 * src/content/prep/resources.ts (see comments); tests verify they all exist.
 */
export const RULES = {
  // Active stages: interviews and assessments first.
  "assessment-active": { title: "Understand the assessment", kind: "stage", priority: 97, moduleIds: ["security-internship-hiring", "technical-scenarios"], resourceIds: ["r63" /* Jassics questions */], mascot: "pip", tone: "assessment" },
  "offer-stage": { title: "Prepare final discussions", kind: "stage", priority: 96, moduleIds: ["security-internship-hiring", "behavioral-security-interviews"], resourceIds: [], mascot: "miso", tone: "celebrate" },
  "soc-interview": { title: "SOC interview preparation", kind: "stage", priority: 95, moduleIds: ["blue-team-soc", "technical-scenarios"], resourceIds: ["r25" /* LetsDefend */, "r21" /* Splunk Free Training */], mascot: "pip", tone: "interview" },
  "detection-interview": { title: "Validate a detection", kind: "stage", priority: 95, moduleIds: ["blue-team-soc", "threats-and-frameworks", "security-automation"], resourceIds: ["r36" /* Sigma */, "r37" /* Atomic Red Team */], mascot: "pip", tone: "interview" },
  "dfir-interview": { title: "Preserve and reconstruct", kind: "stage", priority: 95, moduleIds: ["blue-team-soc", "technical-scenarios", "operating-systems-security"], resourceIds: ["r29" /* SANS DFIR poster */, "r30" /* Volatility 3 */], mascot: "pip", tone: "interview" },
  "cti-interview": { title: "Evidence and confidence", kind: "stage", priority: 95, moduleIds: ["threats-and-frameworks"], resourceIds: ["r39" /* MITRE CTI Training */, "r40" /* MISP */], mascot: "pip", tone: "interview" },
  "engineering-interview": { title: "Engineering foundations", kind: "stage", priority: 95, moduleIds: ["operating-systems-security", "security-automation", "portfolio-and-projects"], resourceIds: ["r04" /* Missing Semester */], mascot: "pip", tone: "interview" },
  "appsec-interview": { title: "Explain the fix", kind: "stage", priority: 95, moduleIds: ["web-application-security", "technical-scenarios"], resourceIds: ["r12" /* PortSwigger */, "r13" /* OWASP Cheat Sheets */], mascot: "pip", tone: "interview" },
  "pentest-interview": { title: "Offensive methodology", kind: "stage", priority: 95, moduleIds: ["offensive-security-basics", "web-application-security"], resourceIds: ["r14" /* WSTG */, "r83" /* SANS RoE worksheet */], mascot: "pip", tone: "interview" },
  "cloud-interview": { title: "Cloud responsibility and access", kind: "stage", priority: 95, moduleIds: ["cloud-and-identity", "technical-scenarios"], resourceIds: ["r43" /* AWS Security Training */, "r45" /* Google Cloud security */], mascot: "pip", tone: "interview" },
  "iam-interview": { title: "Identity lifecycle", kind: "stage", priority: 95, moduleIds: ["cloud-and-identity", "security-fundamentals"], resourceIds: ["r44" /* Microsoft Entra */, "r84" /* NIST 800-63B */], mascot: "pip", tone: "interview" },
  "grc-interview": { title: "Risk and evidence", kind: "stage", priority: 95, moduleIds: ["grc-and-risk", "behavioral-security-interviews"], resourceIds: ["r50" /* NIST CSF 2.0 */, "r52" /* AICPA SOC */], mascot: "pip", tone: "interview" },
  "general-interview": { title: "Prepare for your interview", kind: "stage", priority: 93, moduleIds: ["security-fundamentals", "technical-scenarios", "behavioral-security-interviews"], resourceIds: ["r61" /* Miessler 60 questions */, "r63" /* Jassics */], mascot: "pip", tone: "interview" },
  "interview-new-stage": { title: "Prepare the story bank", kind: "stage", priority: 94, moduleIds: ["behavioral-security-interviews"], resourceIds: [], mascot: "pip", tone: "interview" },
  "multiple-interviews": { title: "Consolidate preparation", kind: "stage", priority: 92, moduleIds: ["behavioral-security-interviews", "technical-scenarios", "portfolio-and-projects"], resourceIds: [], mascot: "pip", tone: "interview" },
  "accepted-stage": { title: "Shift to internship readiness", kind: "stage", priority: 90, moduleIds: ["operating-systems-security", "security-fundamentals", "behavioral-security-interviews"], resourceIds: [], mascot: "miso", tone: "celebrate" },

  // Track-specific preparation.
  "first-application": { title: "Start the preparation loop", kind: "prep", priority: 78, moduleIds: ["security-internship-hiring"], resourceIds: ["r64" /* Harvard résumé */, "r53" /* NICE Framework */], mascot: "fern", tone: "prep" },
  "missing-splunk-repeat": { title: "Splunk wording check", kind: "wording", priority: 72, moduleIds: ["blue-team-soc"], resourceIds: ["r21" /* Splunk Free Training */], mascot: "rue", tone: "wording" },
  "missing-siem": { title: "Describe SIEM work", kind: "wording", priority: 71, moduleIds: ["blue-team-soc"], resourceIds: ["r22" /* Elastic Security */, "r23" /* Sentinel */], mascot: "rue", tone: "wording" },
  "missing-incident-response": { title: "Response vocabulary", kind: "wording", priority: 70, moduleIds: ["blue-team-soc"], resourceIds: ["r28" /* NIST SP 800-61r3 */], mascot: "rue", tone: "wording" },
  "missing-attack": { title: "Map behavior to ATT&CK", kind: "wording", priority: 69, moduleIds: ["threats-and-frameworks"], resourceIds: ["r35" /* MITRE ATT&CK */, "r39" /* MITRE CTI Training */], mascot: "rue", tone: "wording" },
  "missing-risk-language": { title: "Risk and evidence wording", kind: "wording", priority: 69, moduleIds: ["grc-and-risk"], resourceIds: ["r50" /* NIST CSF 2.0 */], mascot: "rue", tone: "wording" },
  "missing-sigma": { title: "Detection portability", kind: "wording", priority: 68, moduleIds: ["blue-team-soc"], resourceIds: ["r36" /* Sigma */], mascot: "rue", tone: "wording" },
  "missing-aws": { title: "AWS-specific preparation", kind: "wording", priority: 68, moduleIds: ["cloud-and-identity"], resourceIds: ["r43" /* AWS Security Training */, "r48" /* AWS Shared Responsibility */], mascot: "rue", tone: "wording" },
  "missing-python": { title: "Automation evidence", kind: "wording", priority: 67, moduleIds: ["security-automation"], resourceIds: ["r07" /* Python Tutorial */], mascot: "rue", tone: "wording" },
  "missing-linux": { title: "Terminal foundations", kind: "wording", priority: 66, moduleIds: ["operating-systems-security"], resourceIds: ["r03" /* Intro to Linux */, "r18" /* Bandit */], mascot: "rue", tone: "wording" },
  "missing-wireshark": { title: "Packet evidence", kind: "wording", priority: 65, moduleIds: ["networking-fundamentals"], resourceIds: ["r02" /* Wireshark User's Guide */], mascot: "rue", tone: "wording" },
  "missing-nmap": { title: "Explain scan results", kind: "wording", priority: 64, moduleIds: ["offensive-security-basics"], resourceIds: ["r10" /* Nmap Reference Guide */], mascot: "rue", tone: "wording" },
  "missing-powershell": { title: "Windows automation", kind: "wording", priority: 63, moduleIds: ["security-automation", "operating-systems-security"], resourceIds: ["r09" /* PowerShell 101 */], mascot: "rue", tone: "wording" },
  "missing-keywords": { title: "A few wording checks", kind: "wording", priority: 56, moduleIds: [], resourceIds: [], mascot: "rue", tone: "wording" },
  "broad-track-spread": { title: "Pick a preparation priority", kind: "prep", priority: 55, moduleIds: ["security-internship-hiring"], resourceIds: ["r53" /* NICE Framework */], mascot: "alder", tone: "prep" },

  // Application habits.
  "postinterview-rejections": { title: "Improve interview explanations", kind: "habit", priority: 52, moduleIds: ["behavioral-security-interviews", "technical-scenarios"], resourceIds: ["r63" /* Jassics */], mascot: "prickle", tone: "habit" },
  "preinterview-rejections": { title: "Review document match", kind: "habit", priority: 50, moduleIds: ["security-internship-hiring", "portfolio-and-projects"], resourceIds: ["r64" /* Harvard */, "r53" /* NICE */], mascot: "nib", tone: "habit" },
  "burst-without-interviews": { title: "Review targeting", kind: "habit", priority: 48, moduleIds: ["security-internship-hiring", "portfolio-and-projects"], resourceIds: ["r64" /* Harvard */], mascot: "alder", tone: "habit" },
  "ghosted-pattern": { title: "Diversify the next step", kind: "habit", priority: 44, moduleIds: ["security-internship-hiring", "portfolio-and-projects"], resourceIds: ["r67" /* r/cybersecurity */, "r69" /* HTB Community */], mascot: "tuck", tone: "habit" },
  "stale-applied-review": { title: "Check the application record", kind: "habit", priority: 42, moduleIds: ["security-internship-hiring"], resourceIds: [], mascot: "tuck", tone: "habit" },
  "wishlist-backlog": { title: "Turn research into a decision", kind: "habit", priority: 40, moduleIds: ["security-internship-hiring"], resourceIds: ["r53" /* NICE */], mascot: "clover", tone: "habit" },
  "application-gap": { title: "Restart with a small step", kind: "habit", priority: 38, moduleIds: ["security-internship-hiring"], resourceIds: ["r74" /* Microsoft students */, "r76" /* Amazon Security Careers */], mascot: "fern", tone: "habit" },

  // Canopy fallbacks.
  onboarding: { title: "Your first prep steps", kind: "welcome", priority: 60, moduleIds: ["security-internship-hiring", "networking-fundamentals"], resourceIds: ["r53" /* NICE */, "r01" /* Cisco Networking Basics */], mascot: "alder", tone: "welcome" },
  "next-module": { title: "Next in the course", kind: "course", priority: 22, moduleIds: [], resourceIds: [], mascot: "acorn", tone: "course" },
  "generic-hiring": { title: "How internship hiring works", kind: "course", priority: 20, moduleIds: ["security-internship-hiring"], resourceIds: ["r64" /* Harvard */], mascot: "alder", tone: "course" },
  "generic-behavioral": { title: "Build your story bank", kind: "course", priority: 19, moduleIds: ["behavioral-security-interviews"], resourceIds: [], mascot: "pip", tone: "course" },
  "generic-portfolio": { title: "Make your work easy to evaluate", kind: "course", priority: 18, moduleIds: ["portfolio-and-projects"], resourceIds: ["r65" /* GitHub profile */], mascot: "nib", tone: "course" },
} satisfies Record<string, RuleDef>;

export type RuleId = keyof typeof RULES;

const RULE_ORDER = new Map(Object.keys(RULES).map((id, i) => [id, i]));

/** Interview rule per specialty group. */
const INTERVIEW_RULE: Record<TrackGroup, RuleId> = {
  SOC: "soc-interview",
  DET: "detection-interview",
  DFIR: "dfir-interview",
  CTI: "cti-interview",
  ENG: "engineering-interview",
  APP: "appsec-interview",
  OFF: "pentest-interview",
  CLOUD: "cloud-interview",
  IAM: "iam-interview",
  GRC: "grc-interview",
};

const INTERVIEW_ADVICE: Record<TrackGroup, string> = {
  SOC: "Practice one alert investigation out loud and explain how you would document and escalate it.",
  DET: "Prepare a detection hypothesis, the telemetry it needs, a positive test, and a benign case.",
  DFIR: "Practice building a timeline and explaining how you preserve evidence before changing a system.",
  CTI: "Choose one report. Explain three supported behaviors, one uncertainty, and one defensive recommendation.",
  ENG: "Prepare to explain systems, automation, and one engineering tradeoff from your own work.",
  APP: "Practice explaining the root cause and fix for an access-control issue and an injection issue.",
  OFF: "Walk through scope, enumeration, safe validation, and reporting for one authorized lab finding.",
  CLOUD: "Review shared responsibility, effective permissions, exposed secrets, and the logs you would investigate.",
  IAM: "Prepare a joiner–mover–leaver example and explain authentication, authorization, and provisioning separately.",
  GRC: "Practice a concrete risk statement and explain what evidence would support a control claim.",
};

// ── Keyword → resource mapping (analyzer canonical terms) ───────────────────

type KeywordRule = {
  /** Spellings as the analyzer may store them (canonical term first). */
  keys: string[];
  label: string;
};

/** Keywords that have their own Part C rule. */
const KW = {
  splunk: { keys: ["Splunk"], label: "Splunk" },
  siem: { keys: ["SIEM", "Security information and event management"], label: "SIEM" },
  python: { keys: ["Python"], label: "Python" },
  powershell: { keys: ["PowerShell"], label: "PowerShell" },
  linux: { keys: ["Linux"], label: "Linux" },
  wireshark: { keys: ["Wireshark"], label: "Wireshark" },
  nmap: { keys: ["Nmap"], label: "Nmap" },
  aws: { keys: ["AWS", "Amazon Web Services"], label: "AWS" },
  ir: { keys: ["Incident response", "Cyber incident response"], label: "incident response" },
  attack: { keys: ["MITRE ATT&CK", "MITRE ATTACK", "ATT&CK"], label: "MITRE ATT&CK" },
  sigma: { keys: ["Sigma", "Sigma rules"], label: "Sigma" },
  riskAssessment: { keys: ["Risk assessment"], label: "risk assessment" },
  auditEvidence: { keys: ["Audit evidence", "Auditing", "Audit"], label: "audit evidence" },
} satisfies Record<string, KeywordRule>;

type ExtraKeyword = KeywordRule & {
  resourceIds: string[];
  moduleId: string;
  /** Relevant when any of these groups is a target; empty = any cybersecurity context. */
  groups: TrackGroup[];
};

/**
 * Other analyzer keywords worth a gentle pointer, grouped into one
 * "missing-keywords" recommendation. Ids looked up by title in resources.ts.
 */
export const KEYWORD_RESOURCES: readonly ExtraKeyword[] = [
  { keys: ["KQL", "Kusto Query Language"], label: "KQL", resourceIds: ["r23" /* Sentinel */], moduleId: "blue-team-soc", groups: ["SOC", "DET"] },
  { keys: ["Microsoft Sentinel", "Azure Sentinel"], label: "Microsoft Sentinel", resourceIds: ["r23"], moduleId: "blue-team-soc", groups: ["SOC", "DET"] },
  { keys: ["Elastic Stack", "Elastic Security", "Elastic SIEM"], label: "Elastic", resourceIds: ["r22" /* Intro to Elastic Security */], moduleId: "blue-team-soc", groups: ["SOC", "DET"] },
  { keys: ["Alert triage", "Security alert triage"], label: "alert triage", resourceIds: ["r25" /* LetsDefend */], moduleId: "blue-team-soc", groups: ["SOC", "DET"] },
  { keys: ["Log analysis", "Security log analysis"], label: "log analysis", resourceIds: ["r24" /* Blue Team Labs Online */], moduleId: "blue-team-soc", groups: ["SOC", "DFIR", "DET"] },
  { keys: ["Phishing analysis", "Phishing investigation"], label: "phishing analysis", resourceIds: ["r25"], moduleId: "blue-team-soc", groups: ["SOC"] },
  { keys: ["Windows event logs"], label: "Windows event logs", resourceIds: ["r06" /* Sysinternals */], moduleId: "operating-systems-security", groups: ["SOC", "DET", "DFIR"] },
  { keys: ["Sysmon"], label: "Sysmon", resourceIds: ["r06"], moduleId: "operating-systems-security", groups: ["SOC", "DET", "DFIR"] },
  { keys: ["Active Directory"], label: "Active Directory", resourceIds: ["r05" /* MS Learn AD DS */], moduleId: "operating-systems-security", groups: ["OFF", "IAM", "DFIR", "SOC"] },
  { keys: ["Bash"], label: "Bash", resourceIds: ["r08" /* GNU Bash manual */, "r18" /* Bandit */], moduleId: "operating-systems-security", groups: ["OFF", "ENG", "CLOUD"] },
  { keys: ["Memory forensics"], label: "memory forensics", resourceIds: ["r30" /* Volatility 3 */], moduleId: "blue-team-soc", groups: ["DFIR"] },
  { keys: ["Volatility"], label: "Volatility", resourceIds: ["r30"], moduleId: "blue-team-soc", groups: ["DFIR"] },
  { keys: ["Digital forensics"], label: "digital forensics", resourceIds: ["r31" /* Autopsy */, "r32" /* CFReDS */], moduleId: "blue-team-soc", groups: ["DFIR"] },
  { keys: ["YARA"], label: "YARA", resourceIds: ["r42" /* YARA-X */], moduleId: "threats-and-frameworks", groups: ["DFIR", "CTI", "DET"] },
  { keys: ["MISP"], label: "MISP", resourceIds: ["r40"], moduleId: "threats-and-frameworks", groups: ["CTI"] },
  { keys: ["Threat hunting", "Cyber threat hunting"], label: "threat hunting", resourceIds: ["r35" /* ATT&CK */, "r37" /* Atomic Red Team */], moduleId: "threats-and-frameworks", groups: ["DET", "SOC", "CTI"] },
  { keys: ["Atomic Red Team"], label: "Atomic Red Team", resourceIds: ["r37"], moduleId: "threats-and-frameworks", groups: ["DET"] },
  { keys: ["OWASP Top 10", "OWASP Top Ten"], label: "OWASP Top 10", resourceIds: ["r11" /* OWASP Top 10:2025 */], moduleId: "web-application-security", groups: ["APP", "OFF", "ENG"] },
  { keys: ["Burp Suite"], label: "Burp Suite", resourceIds: ["r12" /* PortSwigger */], moduleId: "web-application-security", groups: ["APP", "OFF"] },
  { keys: ["SQL injection", "SQLi"], label: "SQL injection", resourceIds: ["r12"], moduleId: "web-application-security", groups: ["APP", "OFF"] },
  { keys: ["XSS", "Cross-site scripting"], label: "XSS", resourceIds: ["r12", "r15" /* Juice Shop */], moduleId: "web-application-security", groups: ["APP", "OFF"] },
  { keys: ["Penetration testing", "Pentesting"], label: "penetration testing", resourceIds: ["r14" /* WSTG */], moduleId: "offensive-security-basics", groups: ["OFF"] },
  { keys: ["Threat modeling", "Threat modelling"], label: "threat modeling", resourceIds: ["r85" /* OWASP Threat Modeling */], moduleId: "web-application-security", groups: ["APP", "ENG"] },
  { keys: ["Vulnerability management"], label: "vulnerability management", resourceIds: ["r86" /* CISA KEV */], moduleId: "security-fundamentals", groups: ["ENG", "SOC", "CLOUD"] },
  { keys: ["Shared responsibility model", "Shared responsibility"], label: "shared responsibility", resourceIds: ["r48" /* AWS Shared Responsibility */], moduleId: "cloud-and-identity", groups: ["CLOUD"] },
  { keys: ["Azure", "Microsoft Azure"], label: "Azure", resourceIds: ["r44" /* Entra */], moduleId: "cloud-and-identity", groups: ["CLOUD", "IAM"] },
  { keys: ["Microsoft Entra ID", "Azure AD"], label: "Microsoft Entra ID", resourceIds: ["r44"], moduleId: "cloud-and-identity", groups: ["IAM", "CLOUD"] },
  { keys: ["MFA", "Multi-factor authentication"], label: "MFA", resourceIds: ["r84" /* NIST 800-63B */], moduleId: "security-fundamentals", groups: ["IAM"] },
  { keys: ["NIST CSF", "NIST Cybersecurity Framework"], label: "NIST CSF", resourceIds: ["r50"], moduleId: "grc-and-risk", groups: ["GRC"] },
  { keys: ["ISO 27001", "ISO/IEC 27001"], label: "ISO 27001", resourceIds: ["r51" /* ISO 27001 overview */], moduleId: "grc-and-risk", groups: ["GRC"] },
  { keys: ["SOC 2"], label: "SOC 2", resourceIds: ["r52" /* AICPA SOC */], moduleId: "grc-and-risk", groups: ["GRC"] },
  { keys: ["TCP/IP", "TCP IP"], label: "TCP/IP", resourceIds: ["r01" /* Cisco Networking Basics */], moduleId: "networking-fundamentals", groups: [] },
  { keys: ["Networking"], label: "networking", resourceIds: ["r01"], moduleId: "networking-fundamentals", groups: [] },
  { keys: ["DNS", "Domain Name System"], label: "DNS", resourceIds: ["r01"], moduleId: "networking-fundamentals", groups: [] },
  { keys: ["Cryptography"], label: "cryptography", resourceIds: ["r49" /* Crypto 101 */, "r20" /* CryptoHack */], moduleId: "security-fundamentals", groups: [] },
];

/** Every module/resource id referenced anywhere in this file (for validation tests). */
export function referencedIds(): { moduleIds: string[]; resourceIds: string[] } {
  const moduleIds = new Set<string>(COURSE.map((m) => m.id));
  const resourceIds = new Set<string>();
  for (const r of Object.values(RULES) as RuleDef[]) {
    r.moduleIds.forEach((m) => moduleIds.add(m));
    r.resourceIds.forEach((id) => resourceIds.add(id));
  }
  for (const k of KEYWORD_RESOURCES) {
    moduleIds.add(k.moduleId);
    k.resourceIds.forEach((id) => resourceIds.add(id));
  }
  return { moduleIds: [...moduleIds], resourceIds: [...resourceIds] };
}

// ── Snapshot facts ──────────────────────────────────────────────────────────

/** How far back analyses count for wording rules. */
const ANALYSIS_WINDOW_DAYS = 60;

type Facts = {
  now: number;
  /** The user's calendar day ("YYYY-MM-DD"), for day-granular fields like deadlines. */
  todayKey: string;
  track: string;
  cyber: boolean;
  apps: SnapshotApplication[];
  /** Analyses inside the window, newest first. */
  analyses: SnapshotAnalysis[];
  doneModules: Set<string>;
  doneResources: Set<string>;
  groupsByApp: Map<string, TrackGroup[]>;
  targets: Set<TrackGroup>;
  targetText: string[];
  hasAccepted: boolean;
  interviewing: SnapshotApplication[];
};

const DONE_STATES = new Set(["done", "complete", "completed"]);

/** When an application entered its current status, or null if unknown. */
export function stageEnteredAt(app: SnapshotApplication): number | null {
  let latest: number | null = null;
  for (const h of app.history ?? []) {
    if (h.status !== app.status) continue;
    const t = ms(h.at);
    if (t !== null && (latest === null || t > latest)) latest = t;
  }
  if (latest !== null) return latest;
  if (app.status === "APPLIED") {
    const applied = ms(app.appliedAt);
    if (applied !== null) return applied;
  }
  // No transitions recorded: the record was created in this status.
  if (!app.history || app.history.length === 0) return ms(app.createdAt);
  // Fallback only; unrelated edits may move updatedAt.
  return ms(app.updatedAt);
}

/** True if an INTERVIEW event precedes `before` (or exists at all when `before` is unknown). */
function hadInterviewBefore(app: SnapshotApplication, before: number | null): boolean {
  return (app.history ?? []).some((h) => {
    if (h.status !== "INTERVIEW") return false;
    const t = ms(h.at);
    return before === null || t === null || t <= before;
  });
}

function everInterviewed(app: SnapshotApplication): boolean {
  return app.status === "INTERVIEW" || app.status === "OFFER" || app.status === "ACCEPTED" || (app.history ?? []).some((h) => h.status === "INTERVIEW");
}

function collectFacts(snapshot: UserSnapshot, track: string, now: Date, todayKey: string): Facts {
  const nowMs = now.getTime();
  const cyber = track === "cybersecurity";
  const apps = snapshot.applications ?? [];
  const since = nowMs - ANALYSIS_WINDOW_DAYS * DAY;
  const analyses = (snapshot.analyses ?? [])
    .filter((a) => {
      const t = ms(a.createdAt);
      return t !== null && t >= since && t <= nowMs + DAY;
    })
    .sort((a, b) => (ms(b.createdAt) ?? 0) - (ms(a.createdAt) ?? 0) || a.id.localeCompare(b.id));

  const doneModules = new Set<string>();
  const doneResources = new Set<string>();
  for (const p of snapshot.progress ?? []) {
    if (!DONE_STATES.has(p.state)) continue;
    if (p.kind === "module") doneModules.add(p.itemId);
    else if (p.kind === "resource") doneResources.add(p.itemId);
  }

  const groupsByApp = new Map<string, TrackGroup[]>();
  const targets = new Set<TrackGroup>();
  const targetText: string[] = [];
  for (const app of apps) {
    const groups = matchRoleGroups(app.role, track);
    groupsByApp.set(app.id, groups);
    if (app.status === "WITHDRAWN") continue;
    groups.forEach((g) => targets.add(g));
    targetText.push(app.role);
  }
  for (const a of analyses) {
    const g = PRESET_GROUPS[a.preset];
    if (g) targets.add(g);
    else if (a.preset === "custom" && a.title) {
      // Job-description analyses: the title usually names the role.
      matchRoleGroups(a.title, track).forEach((x) => targets.add(x));
      targetText.push(a.title);
    }
  }

  return {
    now: nowMs,
    todayKey,
    track,
    cyber,
    apps,
    analyses,
    doneModules,
    doneResources,
    groupsByApp,
    targets,
    targetText,
    hasAccepted: apps.some((a) => a.status === "ACCEPTED"),
    interviewing: apps.filter((a) => a.status === "INTERVIEW"),
  };
}

/** Calendar days from today to a day-granular date (negative when past), or null if unknown. */
function daysUntil(f: Facts, value: Date | string | null | undefined): number | null {
  const key = dateToKey(value);
  return key ? daysBetweenKeys(f.todayKey, key) : null;
}

function hasTarget(f: Facts, ...groups: TrackGroup[]): boolean {
  return groups.some((g) => f.targets.has(g));
}

type KeywordStatus = {
  /** The most recent analysis that evaluated this keyword at all. */
  latest: SnapshotAnalysis | null;
  latestMissing: boolean;
  /** Distinct analyses in the window that reported it missing. */
  missingCount: number;
  evaluatedCount: number;
};

/** Normalized found/missing terms per analysis, computed once and shared by every keyword rule. */
const normalizedTerms = new WeakMap<SnapshotAnalysis, { found: Set<string>; missing: Set<string> }>();

function termSets(a: SnapshotAnalysis): { found: Set<string>; missing: Set<string> } {
  let sets = normalizedTerms.get(a);
  if (!sets) {
    sets = { found: new Set((a.found ?? []).map(normalizeKeyword)), missing: new Set((a.missing ?? []).map(normalizeKeyword)) };
    normalizedTerms.set(a, sets);
  }
  return sets;
}

function keywordStatus(f: Facts, keys: string[]): KeywordStatus {
  const wanted = keys.map(normalizeKeyword);
  let latest: SnapshotAnalysis | null = null;
  let latestMissing = false;
  let missingCount = 0;
  let evaluatedCount = 0;
  for (const a of f.analyses) {
    const terms = termSets(a);
    const missing = wanted.some((k) => terms.missing.has(k));
    const found = wanted.some((k) => terms.found.has(k));
    if (!missing && !found) continue;
    evaluatedCount += 1;
    if (missing && !found) missingCount += 1;
    if (!latest) {
      latest = a;
      latestMissing = missing && !found;
    }
  }
  return { latest, latestMissing, missingCount, evaluatedCount };
}

function analysisName(a: SnapshotAnalysis): string {
  return `“${clip(a.title || "résumé check", 48)}”`;
}

// ── Candidates ──────────────────────────────────────────────────────────────

type Candidate = {
  ruleId: RuleId;
  message: string;
  evidence?: string[];
  applicationIds?: string[];
  moduleIds?: string[];
  resourceIds?: string[];
  title?: string;
  priority?: number;
  steps?: string[];
};

const WORDING_NOTE = "That's a wording signal, not a verdict on your skills.";

function appLabel(app: SnapshotApplication): string {
  const role = clip(app.role || "Role", 48);
  const company = clip(app.company || "a company");
  return `${role} at ${company}`;
}

function detectStages(f: Facts): Candidate[] {
  const out: Candidate[] = [];

  // assessment-active
  const assessing = f.apps.filter((a) => a.status === "ASSESSMENT");
  if (assessing.length) {
    let days: number | null = null;
    for (const a of assessing) {
      const d = daysUntil(f, a.deadline);
      if (d !== null && d >= 0 && (days === null || d < days)) days = d;
    }
    let due = "";
    let priority = RULES["assessment-active"].priority;
    if (days !== null) {
      due = days === 0 ? " It's due today." : days === 1 ? " It's due tomorrow." : days <= 14 ? ` It's due in ${days} days.` : "";
      if (days <= 3) priority += 2;
    }
    const subject = assessing.length === 1
      ? `Your assessment for ${clip(assessing[0]!.company)} is open.`
      : `You have assessments open for ${nameList(assessing.map((a) => a.company))}.`;
    out.push({
      ruleId: "assessment-active",
      priority,
      message: `${subject}${due} Before starting, confirm the format, deadline, permitted tools, and assistance policy. Then rehearse one relevant task.`,
      evidence: assessing.map(appLabel),
      applicationIds: assessing.map((a) => a.id),
    });
  }

  // Interview rules by specialty group.
  const byGroup = new Map<TrackGroup, SnapshotApplication[]>();
  const unmatched: SnapshotApplication[] = [];
  for (const app of f.interviewing) {
    const groups = f.groupsByApp.get(app.id) ?? [];
    if (groups.length === 0) unmatched.push(app);
    for (const g of groups) byGroup.set(g, [...(byGroup.get(g) ?? []), app]);
  }
  for (const group of TRACK_GROUPS) {
    const list = byGroup.get(group);
    if (!list) continue;
    const label = GROUP_LABELS[group];
    out.push({
      ruleId: INTERVIEW_RULE[group],
      message: `You have ${article(label)} ${label} interview at ${nameList(list.map((a) => a.company))}. ${INTERVIEW_ADVICE[group]}`,
      evidence: list.map(appLabel),
      applicationIds: list.map((a) => a.id),
    });
  }
  if (unmatched.length) {
    const where = nameList(unmatched.map((a) => a.company));
    out.push(
      f.cyber
        ? {
            ruleId: "general-interview",
            message: `You have an interview at ${where}. Review the security building blocks, then reason through one unfamiliar scenario out loud.`,
            evidence: unmatched.map(appLabel),
            applicationIds: unmatched.map((a) => a.id),
          }
        : {
            ruleId: "general-interview",
            message: `You have an interview at ${where}. Prepare two true STAR stories and a two-minute walkthrough of one project, including what you'd do differently.`,
            evidence: unmatched.map(appLabel),
            applicationIds: unmatched.map((a) => a.id),
            moduleIds: ["behavioral-security-interviews", "portfolio-and-projects"],
            resourceIds: [],
          },
    );
  }

  // interview-new-stage: entered INTERVIEW within the past three days.
  const fresh = f.apps.filter((a) =>
    (a.history ?? []).some((h) => {
      if (h.status !== "INTERVIEW") return false;
      const t = ms(h.at);
      return t !== null && t <= f.now + 60_000 && f.now - t <= 3 * DAY;
    }),
  );
  if (fresh.length) {
    out.push({
      ruleId: "interview-new-stage",
      message: `${fresh.length === 1 ? `${clip(fresh[0]!.company)} just moved to interviews` : `${nameList(fresh.map((a) => a.company))} just moved to interviews`}. Nice. Prepare six short stories about teamwork, mistakes, learning, disagreement, prioritization, and ethics.`,
      evidence: fresh.map(appLabel),
      applicationIds: fresh.map((a) => a.id),
    });
  }

  // multiple-interviews
  if (f.interviewing.length >= 2) {
    out.push({
      ruleId: "multiple-interviews",
      message: `You have ${f.interviewing.length} interviews active (${nameList(f.interviewing.map((a) => a.company))}). Build one reusable story bank, then add a short role-specific checklist for each interview.`,
      evidence: f.interviewing.map(appLabel),
      applicationIds: f.interviewing.map((a) => a.id),
    });
  }

  // offer-stage
  const offers = f.apps.filter((a) => a.status === "OFFER");
  if (offers.length) {
    let deadline = "";
    const days = offers
      .map((a) => daysUntil(f, a.deadline))
      .filter((d): d is number => d !== null && d >= 0)
      .sort((a, b) => a - b)[0];
    if (days !== undefined) {
      deadline = days === 0 ? " The response deadline is today." : ` You have ${plural(days, "day")} until the response deadline.`;
    }
    out.push({
      ruleId: "offer-stage",
      message: `${nameList(offers.map((a) => a.company))} made you an offer.${deadline} Review the written role, learning opportunities, supervision, dates, and response deadline, and prepare questions about anything unclear.`,
      evidence: offers.map(appLabel),
      applicationIds: offers.map((a) => a.id),
    });
  }

  // accepted-stage
  const accepted = f.apps.filter((a) => a.status === "ACCEPTED");
  if (accepted.length) {
    out.push({
      ruleId: "accepted-stage",
      message: `Congratulations on accepting ${clip(accepted[0]!.company)}'s offer. Shift preparation toward the team's tools, safe handling of access, and a realistic learning plan.`,
      evidence: accepted.map(appLabel),
      applicationIds: accepted.map((a) => a.id),
    });
  }

  return out;
}

function detectWording(f: Facts): Candidate[] {
  const out: Candidate[] = [];
  if (f.analyses.length === 0) return out;

  const latestMissing = (kw: KeywordRule) => {
    const s = keywordStatus(f, kw.keys);
    return s.latestMissing && s.latest ? s.latest : null;
  };
  const say = (a: SnapshotAnalysis, label: string) => `Your latest résumé check (${analysisName(a)}) didn't find ${label}. ${WORDING_NOTE}`;

  // missing-splunk-repeat: two or more saved analyses, still missing in the latest.
  {
    const s = keywordStatus(f, KW.splunk.keys);
    if (s.missingCount >= 2 && s.latestMissing && hasTarget(f, "SOC", "DET")) {
      out.push({
        ruleId: "missing-splunk-repeat",
        message: `Splunk didn't show up in ${s.missingCount} of your recent résumé checks. ${WORDING_NOTE} If it's relevant, try a free lesson; add it only after you can explain what you did with it.`,
        evidence: [`Splunk missing in ${s.missingCount} of ${s.evaluatedCount} analyses (last ${ANALYSIS_WINDOW_DAYS} days)`],
      });
    }
  }

  const simple: { ruleId: RuleId; kw: KeywordRule; when: () => boolean; advice: string }[] = [
    { ruleId: "missing-siem", kw: KW.siem, when: () => hasTarget(f, "SOC", "DET"), advice: "A target track values SIEM work. If you've searched logs in a lab, describe the event-to-investigation workflow you followed." },
    { ruleId: "missing-incident-response", kw: KW.ir, when: () => hasTarget(f, "SOC", "DFIR"), advice: "Review how investigation connects to containment and recovery. Add a response-related bullet only if you have supporting work." },
    { ruleId: "missing-attack", kw: KW.attack, when: () => hasTarget(f, "CTI", "DET"), advice: "Practice mapping one observed behavior to a technique and explaining your confidence." },
    { ruleId: "missing-sigma", kw: KW.sigma, when: () => hasTarget(f, "DET"), advice: "Study one Sigma rule's log source, fields, and false positives. Understand the rule before adding it to your résumé." },
    { ruleId: "missing-aws", kw: KW.aws, when: () => f.targetText.some((t) => /\baws\b/i.test(normalizeRole(t))), advice: "One of your target roles names AWS. Review IAM, logging, and shared responsibility, then describe any relevant experience accurately." },
    { ruleId: "missing-python", kw: KW.python, when: () => hasTarget(f, "ENG", "DET", "CTI", "CLOUD"), advice: "If you already use Python, describe the actual task and result rather than adding the word alone. If not, a small structured-data exercise is a good start." },
    { ruleId: "missing-linux", kw: KW.linux, when: () => hasTarget(f, "OFF", "CLOUD", "ENG"), advice: "Check whether your résumé explains any Linux work. If not, start with permissions and process basics in a legal lab." },
    { ruleId: "missing-wireshark", kw: KW.wireshark, when: () => hasTarget(f, "SOC", "DFIR", "OFF"), advice: "Try one packet-analysis exercise and explain what the capture reveals. List Wireshark only if you can discuss that work." },
    { ruleId: "missing-nmap", kw: KW.nmap, when: () => hasTarget(f, "OFF"), advice: "Review authorized enumeration and what scan states mean. A discovered service is a lead, not a vulnerability finding." },
    {
      ruleId: "missing-powershell",
      kw: KW.powershell,
      when: () => hasTarget(f, "IAM", "DFIR") || f.targetText.some((t) => isWindowsSecurityRole(t, f.track)),
      advice: "A Windows-focused role may value evidence of object-based administration or event analysis.",
    },
  ];
  for (const r of simple) {
    const a = latestMissing(r.kw);
    if (!a || !r.when()) continue;
    out.push({ ruleId: r.ruleId, message: `${say(a, r.kw.label)} ${r.advice}`, evidence: [`${r.kw.label} missing in ${analysisName(a)}`] });
  }

  // missing-risk-language: both "risk assessment" and "audit evidence" absent.
  if (hasTarget(f, "GRC")) {
    const risk = keywordStatus(f, KW.riskAssessment.keys);
    const audit = keywordStatus(f, KW.auditEvidence.keys);
    const both = risk.latestMissing && audit.latestMissing && risk.latest && audit.latest;
    if (both) {
      out.push({
        ruleId: "missing-risk-language",
        message: `Your latest résumé check didn't find risk assessment or audit evidence wording. ${WORDING_NOTE} Check whether your projects describe a risk scenario or an evidence review; a short fictional assessment is good practice.`,
        evidence: ["risk assessment and audit evidence missing"],
      });
    }
  }

  // missing-keywords: other mapped terms, bundled into one gentle pointer.
  const anyCyberContext = f.cyber || f.targets.size > 0;
  const extras: ExtraKeyword[] = [];
  let latestFor: SnapshotAnalysis | null = null;
  for (const k of KEYWORD_RESOURCES) {
    const relevant = k.groups.length === 0 ? anyCyberContext : hasTarget(f, ...k.groups);
    if (!relevant) continue;
    const a = latestMissing(k);
    if (!a) continue;
    if (extras.some((e) => e.label === k.label)) continue;
    extras.push(k);
    if (!latestFor || (ms(a.createdAt) ?? 0) > (ms(latestFor.createdAt) ?? 0)) latestFor = a;
  }
  if (extras.length && latestFor) {
    const top = extras.slice(0, 3);
    const labels = top.map((k) => k.label);
    const list = labels.length === 1 ? labels[0]! : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
    out.push({
      ruleId: "missing-keywords",
      message: `Recent résumé checks didn't find ${list}. ${WORDING_NOTE} If you've done the work, name it plainly next to what you did; if not, these free resources are a good place to start.`,
      evidence: top.map((k) => `${k.label} missing`),
      moduleIds: [...new Set(top.map((k) => k.moduleId))].slice(0, 2),
      resourceIds: [...new Set(top.flatMap((k) => k.resourceIds))].slice(0, 4),
    });
  }

  return out;
}

function detectHabits(f: Facts): Candidate[] {
  const out: Candidate[] = [];
  const applied = f.apps
    .map((a) => ({ app: a, at: ms(a.appliedAt) }))
    .filter((x): x is { app: SnapshotApplication; at: number } => x.at !== null && x.at <= f.now + DAY);

  // first-application: the first real application landed in the last week.
  if (applied.length) {
    const first = applied.reduce((a, b) => (b.at < a.at ? b : a));
    if (f.now - first.at <= 7 * DAY && applied.length <= 3) {
      out.push({
        ruleId: "first-application",
        message: `Your first application is in (${appLabel(first.app)}). Spend 20 minutes preparing a short introduction and matching this role to one project.`,
        evidence: [appLabel(first.app)],
        applicationIds: [first.app.id],
        resourceIds: f.cyber ? undefined : ["r64"],
      });
    }
  }

  // broad-track-spread: four+ specialty groups in 28 days, no active interview.
  if (f.interviewing.length === 0) {
    const groups = new Set<TrackGroup>();
    for (const { app, at } of applied) {
      if (f.now - at > 28 * DAY) continue;
      (f.groupsByApp.get(app.id) ?? []).forEach((g) => groups.add(g));
    }
    if (groups.size >= 4) {
      const names = TRACK_GROUPS.filter((g) => groups.has(g)).map((g) => GROUP_LABELS[g]);
      out.push({
        ruleId: "broad-track-spread",
        message: `Your recent applications span ${groups.size} specialties (${names.slice(0, 4).join(", ")}${names.length > 4 ? ", …" : ""}). Exploring is fine; pick one primary preparation track this week while keeping suitable applications open.`,
        evidence: names,
      });
    }
  }

  // postinterview-rejections: 3+ in 90 days with a prior interview.
  const rejected = f.apps.filter((a) => a.status === "REJECTED").map((a) => ({ app: a, at: stageEnteredAt(a) }));
  const post = rejected.filter((r) => r.at !== null && f.now - r.at <= 90 * DAY && hadInterviewBefore(r.app, r.at));
  if (post.length >= 3) {
    out.push({
      ruleId: "postinterview-rejections",
      message: "You are reaching interviews, which is real progress. Jot down the questions you remember and practice concise technical and behavioral answers in a mock interview. The outcome alone doesn't reveal the cause.",
      evidence: ["Several recent decisions came after an interview"],
      steps: [...MOCK_INTERVIEW_CHECKLIST],
    });
  }

  // preinterview-rejections: 5+ in 60 days with no prior interview.
  const pre = rejected.filter((r) => r.at !== null && f.now - r.at <= 60 * DAY && !hadInterviewBefore(r.app, r.at));
  if (pre.length >= 5) {
    out.push({
      ruleId: "preinterview-rejections",
      message: "Several decisions arrived before an interview. That's common in internship season. Review eligibility, role fit, and how clearly your résumé shows relevant work for one target posting.",
      evidence: ["Several recent decisions came before an interview"],
      resourceIds: f.cyber ? undefined : ["r64"],
    });
  }

  // burst-without-interviews
  const recent = applied.filter((x) => f.now - x.at <= 28 * DAY);
  const aged = applied.filter((x) => f.now - x.at >= 14 * DAY);
  if (recent.length >= 15 && aged.length >= 10 && !f.apps.some(everInterviewed)) {
    out.push({
      ruleId: "burst-without-interviews",
      message: `You've sent ${recent.length} applications in the last four weeks. That's enough activity for a useful review, although employer timing varies. Compare a few postings with your résumé and check eligibility and evidence.`,
      evidence: [`${recent.length} applications in 28 days`],
    });
  }

  // ghosted-pattern: 5+ explicitly GHOSTED in 90 days.
  const ghosted = f.apps.filter((a) => {
    if (a.status !== "GHOSTED") return false;
    const t = stageEnteredAt(a);
    return t !== null && f.now - t <= 90 * DAY;
  });
  if (ghosted.length >= 5) {
    out.push({
      ruleId: "ghosted-pattern",
      message: "A quiet process can be discouraging. Review a few target roles and consider campus recruiting or a reputable professional community for your next step.",
      evidence: ["Several applications marked ghosted in the last 90 days"],
      resourceIds: f.cyber ? undefined : [],
    });
  }

  // stale-applied-review: current APPLIED for 30+ days by stage entry.
  const stale = f.apps
    .filter((a) => a.status === "APPLIED")
    .map((a) => ({ app: a, at: stageEnteredAt(a) }))
    .filter((x): x is { app: SnapshotApplication; at: number } => x.at !== null && f.now - x.at >= 30 * DAY)
    .sort((a, b) => a.at - b.at);
  if (stale.length) {
    const names = nameList(stale.map((s) => s.app.company));
    out.push({
      ruleId: "stale-applied-review",
      message: `${names} ${stale.length === 1 ? "has" : "have"} been at Applied for 30+ days. Check whether there's been an update or a stated timeline, keep the record accurate, and keep other applications moving.`,
      evidence: stale.map((s) => appLabel(s.app)),
      applicationIds: stale.map((s) => s.app.id),
    });
  }

  // wishlist-backlog: 5+ wishlist entries sitting 14+ days.
  const waiting = f.apps.filter((a) => {
    if (a.status !== "WISHLIST") return false;
    const t = stageEnteredAt(a);
    return t !== null && f.now - t >= 14 * DAY;
  });
  if (waiting.length >= 5) {
    out.push({
      ruleId: "wishlist-backlog",
      message: `${waiting.length} saved roles have been on your wishlist for two weeks or more. Choose one to apply to, archive, or research further, and let its requirements pick your next lesson.`,
      evidence: [`${waiting.length} wishlist roles waiting 14+ days`],
      applicationIds: waiting.map((a) => a.id),
      resourceIds: f.cyber ? undefined : [],
    });
  }

  // application-gap: 14+ days since the last application, nothing accepted.
  if (applied.length) {
    const last = applied.reduce((a, b) => (b.at > a.at ? b : a));
    const days = Math.floor((f.now - last.at) / DAY);
    if (days >= 14) {
      out.push({
        ruleId: "application-gap",
        message: `It's been ${days} days since your last application (${clip(last.app.company)}). If you're still searching, choose one suitable role and take the next step. You can keep learning while applying.`,
        evidence: [`Last application: ${appLabel(last.app)}`],
        resourceIds: f.cyber ? undefined : [],
      });
    }
  }

  return out;
}

/** Application-volume nudges that an accepted offer turns off for the cycle. */
const VOLUME_RULES = new Set<RuleId>([
  "first-application",
  "broad-track-spread",
  "preinterview-rejections",
  "burst-without-interviews",
  "ghosted-pattern",
  "stale-applied-review",
  "wishlist-backlog",
  "application-gap",
]);

// ── Assembly ────────────────────────────────────────────────────────────────

function hrefFor(moduleIds: string[], resourceIds: string[], practice: boolean): string {
  const m = moduleIds[0];
  if (m) return `/prep/${encodeURIComponent(m)}${practice ? "#practice" : ""}`;
  if (resourceIds.length) return "/prep/resources";
  return "/prep";
}

function finalize(f: Facts, c: Candidate): Recommendation | null {
  const def: RuleDef = RULES[c.ruleId];
  const baseModules = c.moduleIds ?? def.moduleIds;
  const baseResources = c.resourceIds ?? def.resourceIds;
  const resourceIds = baseResources.filter((id) => !f.doneResources.has(id));
  let moduleIds = baseModules.filter((id) => !f.doneModules.has(id));
  let message = c.message;
  let practice = false;

  if (def.kind === "stage") {
    // Active stage: never drop it. If the reading is done, point at practice.
    if (moduleIds.length === 0 && baseModules.length > 0) {
      moduleIds = [...baseModules];
      practice = true;
      message += " You've already finished the reading, so go straight to the practice questions and answer two out loud.";
    }
  } else if (moduleIds.length === 0 && resourceIds.length === 0) {
    // Everything this rule would suggest is already done.
    return null;
  }

  return {
    id: c.ruleId,
    ruleId: c.ruleId,
    title: c.title ?? def.title,
    message,
    moduleIds,
    resourceIds,
    priority: c.priority ?? def.priority,
    tone: def.tone,
    mascot: def.mascot,
    evidence: c.evidence,
    applicationIds: c.applicationIds,
    practice: practice || undefined,
    href: hrefFor(moduleIds, resourceIds, practice),
    steps: c.steps,
  };
}

function contentKey(r: Recommendation): string {
  return `${[...r.moduleIds].sort().join(",")}|${[...r.resourceIds].sort().join(",")}`;
}

function onboarding(f: Facts): Candidate[] {
  if (f.apps.length > 0) return [];
  return [
    f.cyber
      ? {
          ruleId: "onboarding",
          message: "Welcome in. Start with how security internship hiring actually works, then follow a packet through a network. Add your first application whenever you're ready, even a wishlist one.",
        }
      : {
          ruleId: "onboarding",
          message: "Welcome in. Start with how internship hiring works, then make one project easy to evaluate. Add your first application whenever you're ready, even a wishlist one.",
          moduleIds: ["security-internship-hiring", "portfolio-and-projects"],
          resourceIds: ["r64"],
        },
  ];
}

function fallbacks(f: Facts, taken: Recommendation[]): Candidate[] {
  const out: Candidate[] = [];
  const used = new Set(taken.flatMap((r) => r.moduleIds));

  if (f.cyber) {
    const next = COURSE.find((m) => !f.doneModules.has(m.id) && !used.has(m.id));
    if (next) {
      const doneCount = COURSE.filter((m) => f.doneModules.has(m.id)).length;
      out.push({
        ruleId: "next-module",
        title: `Module ${next.number}: ${next.title}`,
        message: doneCount
          ? `You've finished ${plural(doneCount, "module")}. Keep the streak gentle: one lesson from Module ${next.number} is plenty for today.`
          : `A steady place to start: Module ${next.number}. One lesson is plenty for today.`,
        moduleIds: [next.id],
        resourceIds: [],
      });
    }
  } else {
    const generic: { ruleId: RuleId; module: string; message: string }[] = [
      { ruleId: "generic-hiring", module: "security-internship-hiring", message: "Most internship hiring follows the same shape: screen, interviews, decision. Knowing the stages makes each one less mysterious." },
      { ruleId: "generic-behavioral", module: "behavioral-security-interviews", message: "Every interview has a behavioral part. Draft a few true STAR stories now so they're ready when an invite lands." },
      { ruleId: "generic-portfolio", module: "portfolio-and-projects", message: "Make one project easy to evaluate: a clear README, what you did, and one honest limitation." },
    ];
    for (const g of generic) if (!used.has(g.module)) out.push({ ruleId: g.ruleId, message: g.message });
  }
  return out;
}

/**
 * Deduped, prioritized prep recommendations (highest priority first, at most
 * MAX_RECOMMENDATIONS). Deterministic for a given snapshot, track, `now` and
 * `todayKey` (the user's calendar day; deadlines are compared by day, not instant).
 */
export function getRecommendations(
  snapshot: UserSnapshot,
  track: string,
  now: Date,
  todayKey: string = dateKeyInZone(now, "UTC"),
): Recommendation[] {
  const f = collectFacts(snapshot, track, now, todayKey);

  let candidates = [...detectStages(f), ...detectWording(f), ...detectHabits(f), ...onboarding(f)];
  if (f.hasAccepted) candidates = candidates.filter((c) => !VOLUME_RULES.has(c.ruleId));

  const sortRecs = (list: Recommendation[]) =>
    list.sort((a, b) => b.priority - a.priority || (RULE_ORDER.get(a.id) ?? 999) - (RULE_ORDER.get(b.id) ?? 999));

  const dedupe = (list: Recommendation[]) => {
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const out: Recommendation[] = [];
    for (const r of sortRecs(list)) {
      if (seenIds.has(r.id)) continue;
      const key = contentKey(r);
      if (seenContent.has(key)) continue;
      seenIds.add(r.id);
      seenContent.add(key);
      out.push(r);
    }
    return out;
  };

  let recs = dedupe(candidates.map((c) => finalize(f, c)).filter((r): r is Recommendation => r !== null));

  if (recs.length < 3) {
    const extra = fallbacks(f, recs)
      .map((c) => finalize(f, c))
      .filter((r): r is Recommendation => r !== null);
    recs = dedupe([...recs, ...extra]);
  }

  return recs.slice(0, MAX_RECOMMENDATIONS);
}
