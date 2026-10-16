/**
 * Sanity checks for the cybersecurity analyzer presets.
 *
 * Runs under `bun test src/lib/analyzer/presets/cybersecurity.test.ts` or as a
 * plain script: `bun src/lib/analyzer/presets/cybersecurity.test.ts`.
 * (No bun-types in this repo, so `bun:test` is loaded dynamically.)
 */
import assert from "node:assert/strict";

import { RESOURCES } from "@/content/prep/resources";

import { CONCEPTS } from "../dictionary";
import { analyze } from "../engine";
import { KIND_LABELS, type AnalysisResult, type CategoryKind } from "../types";
import { CYBER_CONCEPTS, CYBER_PRESETS, CYBER_TIP_RESOURCES } from "./cybersecurity";

// ── Tiny runner: bun:test when available, otherwise a console runner ─────────

type TestFn = (name: string, fn: () => void) => void;

async function loadRunner(): Promise<TestFn> {
  if (process.env.NODE_ENV === "test") {
    const specifier = "bun:test";
    try {
      const mod = (await import(specifier)) as { test?: TestFn };
      if (mod.test) return mod.test;
    } catch {
      // fall through to the console runner
    }
  }
  return (name, fn) => {
    try {
      fn();
      console.log(`  ok  ${name}`);
    } catch (err) {
      process.exitCode = 1;
      console.error(`  FAIL ${name}\n${err instanceof Error ? err.message : String(err)}`);
    }
  };
}

const test = await loadRunner();

// ── Sample resumes ───────────────────────────────────────────────────────────

const SOC_RESUME = `
Jordan Rivera
Cybersecurity B.S. candidate, State University (expected May 2028)

SKILLS
Splunk, Wazuh, Microsoft Sentinel (KQL), Wireshark, CrowdStrike Falcon (lab), Python, PowerShell, Linux, Windows
CompTIA Security+ (in progress, expected March 2027)

PROJECTS
Home SOC lab
- Built a home lab with Wazuh, Sysmon and a Windows 10 VM; forwarded Windows event logs to Splunk.
- Wrote SPL searches to flag repeated failed logons (Event ID 4625) and mapped detections to MITRE ATT&CK techniques.
- Followed NIST 800-61 phases to write an incident response report for a simulated ransomware case.

LetsDefend and TryHackMe practice
- Triaged 60+ simulated alerts, escalating true positives with notes on IOCs (hashes, domains) found in VirusTotal.
- Performed phishing analysis on suspicious emails, checking SPF, DKIM and DMARC results and attachment hashes.
- Practiced threat hunting with KQL against sample authentication logs.

Python IOC enricher
- Python script that enriches IOCs from a CSV via the VirusTotal API and outputs a triage summary.

EXPERIENCE
Student IT Help Desk, State University
- Resolved 30+ support tickets per week for password resets, MFA enrollment and network issues.
- Documented recurring fixes in the help desk knowledge base.
- Go-to person on the team for first-year onboarding questions; added a checklist for new hires.

ACTIVITIES
National Cyber League (NCL) competitor, Fall 2026: log analysis and network traffic analysis brackets.
Attended career networking events; first place in the club CTF.
`;

const APPSEC_RESUME = `
Priya Nair
Computer Science B.S., minor in Cybersecurity (expected 2027)

SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Security: Burp Suite, OWASP ZAP, Semgrep, CodeQL, Snyk, GitHub Actions
Standards: OWASP Top 10, OWASP ASVS, OWASP WSTG, CVSS

PROJECTS
Juice Shop security review
- Performed a secure code review of OWASP Juice Shop and wrote up 12 findings (XSS, SQL injection, broken access control / IDOR, SSRF, CSRF) with CVSS scores and remediation guidance.
- Fixed vulnerabilities in a fork with parameterized queries, output encoding and server-side authorization checks; added unit tests that prove each fix.

Secure pipeline for a React + Node.js app
- Added Semgrep and CodeQL (SAST) plus Dependabot dependency scanning to a CI/CD pipeline in GitHub Actions; blocked merges on high-severity findings.
- Threat modeling with STRIDE in OWASP Threat Dragon for the login and payments flows; documented trust boundaries.
- Reviewed OAuth 2.0 and JWT handling for the API and added rate limiting as part of API security testing.

PortSwigger Web Security Academy
- Completed 70+ labs across access control, authentication, SSRF and injection topics.

EXPERIENCE
Teaching Assistant, Intro to Programming
- Partnered with developers on the course autograder team to fix an input validation bug; explained the risk to non-security students.

Bug bounty: 2 accepted reports on HackerOne (one duplicate, one low-severity IDOR).
`;

const CLOUD_RESUME = `
Sam Okafor
Information Technology B.S. (expected December 2027)

SKILLS
AWS (IAM, S3, EC2, Lambda, KMS, CloudTrail, GuardDuty, Security Hub), Azure, Google Cloud, Terraform, Docker, Kubernetes (EKS), Python (boto3), Bash
AWS Certified Cloud Practitioner

PROJECTS
Secure AWS landing zone
- Wrote Terraform for a multi-account AWS sandbox with least-privilege IAM policies and IAM roles for service accounts (IRSA) on EKS.
- Enabled CloudTrail, VPC Flow Logs and CloudWatch alarms; wrote Athena queries for cloud log analysis of suspicious API calls.
- Moved application secrets into AWS Secrets Manager and encrypted S3 buckets with customer-managed KMS keys and key rotation.
- Ran Prowler and fixed misconfigurations (public S3 buckets, open security groups) against the CIS AWS Foundations Benchmark.

Infrastructure as code guardrails
- Added Checkov and Trivy container scanning to GitHub Actions so CI/CD blocks risky Terraform and images.
- Wrote a Python automation that disables unused IAM access keys and posts a report.

flaws.cloud and flaws2.cloud
- Completed attacker and defender tracks; wrote a summary of the shared responsibility model for my club.

EXPERIENCE
Cloud Lab Assistant, University IT
- Documented VPC and security group designs and collaborated with the networking team.
`;

const TRAPS = `
Go-to person for the team. Added new features and first-year mentoring.
Attended networking events and an industry networking night.
Built an IR sensor array for a robotics security project.
Migrated users to Azure AD and Azure Active Directory groups.
Sold tickets at the campus box office.
Fine tuning a language model; customer segmentation analysis for a marketing class.
Provisioning EC2 instances with Terraform.
President of the Student Federation of Engineers.
Marketing campaign analysis for a local cafe.
Implemented route prefetch in a Next.js app.
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const KINDS = new Set<CategoryKind>(Object.keys(KIND_LABELS).filter((k) => k !== "custom") as CategoryKind[]);

function scoreAll(resume: string): { key: string; score: number; result: AnalysisResult }[] {
  return CYBER_PRESETS.map((p) => {
    const result = analyze({ mode: "preset", resumeText: resume, presetKey: p.key });
    return { key: p.key, score: result.score, result };
  }).sort((a, b) => b.score - a.score);
}

function foundTerms(resume: string, presetKey: string): Set<string> {
  return new Set(analyze({ mode: "preset", resumeText: resume, presetKey }).found.map((f) => f.term));
}

function table(rows: { key: string; score: number }[]): string {
  return rows.map((r) => `${r.key}=${r.score}`).join(", ");
}

// ── Structure ────────────────────────────────────────────────────────────────

test("every cyber preset has 30–45 keywords with valid categories and weights", () => {
  const keys = new Set<string>();
  for (const p of CYBER_PRESETS) {
    assert.equal(p.track, "cybersecurity", `${p.key} track`);
    assert.ok(!keys.has(p.key), `duplicate preset key ${p.key}`);
    keys.add(p.key);
    const count = p.categories.reduce((n, c) => n + c.terms.length, 0);
    assert.ok(count >= 30 && count <= 45, `${p.key} has ${count} keywords`);
    const catIds = new Set<string>();
    const terms = new Set<string>();
    for (const c of p.categories) {
      assert.ok(!catIds.has(c.id), `${p.key}: duplicate category ${c.id}`);
      catIds.add(c.id);
      assert.ok(KINDS.has(c.kind), `${p.key}/${c.id}: bad kind ${c.kind}`);
      assert.ok(c.tip.trim().length > 20, `${p.key}/${c.id}: tip too short`);
      assert.ok(c.terms.length > 0, `${p.key}/${c.id}: empty category`);
      for (const [term, weight, tip] of c.terms) {
        assert.ok([1, 2, 3].includes(weight), `${p.key}: ${term} weight ${weight}`);
        assert.ok(!terms.has(term.toLowerCase()), `${p.key}: duplicate term ${term}`);
        terms.add(term.toLowerCase());
        if (tip !== undefined) assert.ok(tip.trim().length > 10, `${p.key}: ${term} tip too short`);
      }
    }
    const core = p.categories.flatMap((c) => c.terms).filter(([, w]) => w === 3).length;
    assert.ok(core >= 3, `${p.key}: only ${core} weight-3 terms`);
  }
  assert.equal(CYBER_PRESETS.length, 11);
});

test("cyber concepts are merged into the dictionary without being overridden", () => {
  for (const [key, def] of Object.entries(CYBER_CONCEPTS)) {
    assert.equal(CONCEPTS[key], def, `dictionary overrides cyber concept "${key}"`);
    for (const alias of Object.keys(def.guards ?? {})) {
      const spellings = [key, ...(def.aliases ?? [])].map((s) => s.toLowerCase());
      assert.ok(spellings.includes(alias.toLowerCase()), `${key}: guard for unknown spelling "${alias}"`);
    }
  }
});

test("tip resources point at real library entries", () => {
  const ids = new Set(RESOURCES.map((r) => r.id));
  for (const [presetKey, cats] of Object.entries(CYBER_TIP_RESOURCES)) {
    const preset = CYBER_PRESETS.find((p) => p.key === presetKey);
    assert.ok(preset, `unknown preset ${presetKey}`);
    for (const [catId, list] of Object.entries(cats)) {
      assert.ok(preset.categories.some((c) => c.id === catId), `${presetKey}: unknown category ${catId}`);
      for (const id of list) assert.ok(ids.has(id), `${presetKey}/${catId}: unknown resource ${id}`);
    }
  }
});

// ── Scoring ──────────────────────────────────────────────────────────────────

test("SOC-focused resume scores highest on the SOC preset", () => {
  const rows = scoreAll(SOC_RESUME);
  assert.equal(rows[0].key, "soc", table(rows));
  const soc = rows[0].score;
  assert.ok(soc >= 55, `SOC score ${soc} too low: ${table(rows)}`);
  const appsec = rows.find((r) => r.key === "appsec")!.score;
  const cloud = rows.find((r) => r.key === "cloudsec")!.score;
  assert.ok(soc - appsec >= 20 && soc - cloud >= 20, `SOC should clearly beat AppSec/Cloud: ${table(rows)}`);
});

test("AppSec-focused resume scores highest on the AppSec preset", () => {
  const rows = scoreAll(APPSEC_RESUME);
  assert.equal(rows[0].key, "appsec", table(rows));
  assert.ok(rows[0].score >= 60, `AppSec score too low: ${table(rows)}`);
  const soc = rows.find((r) => r.key === "soc")!.score;
  assert.ok(rows[0].score - soc >= 20, `AppSec should clearly beat SOC: ${table(rows)}`);
});

test("cloud-focused resume scores highest on the Cloud Security preset", () => {
  const rows = scoreAll(CLOUD_RESUME);
  assert.equal(rows[0].key, "cloudsec", table(rows));
  assert.ok(rows[0].score >= 60, `Cloud score too low: ${table(rows)}`);
  const soc = rows.find((r) => r.key === "soc")!.score;
  assert.ok(rows[0].score - soc >= 20, `Cloud should clearly beat SOC: ${table(rows)}`);
});

test("expected keywords are credited", () => {
  const soc = foundTerms(SOC_RESUME, "soc");
  for (const t of ["SIEM", "Splunk", "Microsoft Sentinel", "EDR", "Alert triage", "Phishing analysis", "Incident response", "Windows event logs", "MITRE ATT&CK", "NIST 800-61", "KQL", "SPL", "Email security", "Security+", "Ticketing"]) {
    assert.ok(soc.has(t), `SOC resume should credit ${t}`);
  }
  const app = foundTerms(APPSEC_RESUME, "appsec");
  for (const t of ["XSS", "SQL injection", "SSRF", "CSRF", "Authentication & authorization", "Secure code review", "Threat modeling", "Vulnerability remediation", "SAST", "SCA", "OWASP ZAP", "OWASP ASVS", "OWASP WSTG", "Bug bounty", "Collaboration"]) {
    assert.ok(app.has(t), `AppSec resume should credit ${t}`);
  }
  const cloud = foundTerms(CLOUD_RESUME, "cloudsec");
  for (const t of ["AWS", "Azure", "GCP", "Cloud IAM", "Least privilege", "Secrets management", "Misconfigurations", "Key management", "Workload identity", "Cloud logging", "CloudTrail", "Prowler", "CIS Benchmarks", "Shared responsibility model", "Infrastructure as code", "Container security"]) {
    assert.ok(cloud.has(t), `Cloud resume should credit ${t}`);
  }
});

// ── False positives ──────────────────────────────────────────────────────────

test("no obviously false matches from everyday words", () => {
  const all = new Set<string>();
  for (const p of CYBER_PRESETS) for (const t of foundTerms(TRAPS, p.key)) all.add(t);
  const forbidden = [
    "Go", // "Go-to", "google"
    "Active Directory", // "added", "Azure AD"
    "Incident response", // "first", "IR sensor"
    "Networking", // "networking events"
    "Ticketing", // "sold tickets"
    "Alert tuning", // "fine tuning"
    "Network segmentation", // "customer segmentation"
    "Provisioning", // "provisioning EC2 instances"
    "Federation", // "Student Federation"
    "Campaign analysis", // marketing
    "Windows artifacts", // "route prefetch"
  ];
  for (const t of forbidden) assert.ok(!all.has(t), `false positive: ${t} (found ${[...all].join(", ")})`);
  // The genuine identity product is still recognized.
  assert.ok(foundTerms(TRAPS, "iam").has("Microsoft Entra ID"), "Azure AD should still count as Entra ID");
});

test("short tokens never match inside longer words", () => {
  const text = "Google first-year adding addresses goals irregular adware.";
  for (const p of CYBER_PRESETS) {
    const found = foundTerms(text, p.key);
    assert.equal(found.size, 0, `${p.key} matched ${[...found].join(", ")}`);
  }
});

test("context-guarded short forms still match in context", () => {
  const text = "Languages: Python, Go, Bash. Administered AD users and groups on a Windows Server domain. Wrote IR playbooks for the SOC.";
  const found = new Set<string>();
  for (const p of CYBER_PRESETS) for (const t of foundTerms(text, p.key)) found.add(t);
  for (const t of ["Go", "Active Directory", "Incident response"]) assert.ok(found.has(t), `should credit ${t}`);
});

if (process.env.NODE_ENV !== "test") {
  for (const [label, resume] of [["SOC", SOC_RESUME], ["AppSec", APPSEC_RESUME], ["Cloud", CLOUD_RESUME]] as const) {
    console.log(`${label.padEnd(6)} ${table(scoreAll(resume))}`);
  }
}
