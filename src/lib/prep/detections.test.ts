// Run with: bun test src/lib/prep/detections.test.ts
// @ts-expect-error -- bun:test types (@types/bun) aren't installed in this repo; remove this line once they are.
import { describe, expect, test } from "bun:test";

import { RESOURCES } from "@/content/prep/resources";
import { prepModule as behavioral } from "@/content/prep/modules/behavioral-security-interviews";
import { prepModule as blueTeam } from "@/content/prep/modules/blue-team-soc";
import { prepModule as cloudIdentity } from "@/content/prep/modules/cloud-and-identity";
import { prepModule as grc } from "@/content/prep/modules/grc-and-risk";
import { prepModule as networking } from "@/content/prep/modules/networking-fundamentals";
import { prepModule as offensive } from "@/content/prep/modules/offensive-security-basics";
import { prepModule as osSecurity } from "@/content/prep/modules/operating-systems-security";
import { prepModule as portfolio } from "@/content/prep/modules/portfolio-and-projects";
import { prepModule as automation } from "@/content/prep/modules/security-automation";
import { prepModule as fundamentals } from "@/content/prep/modules/security-fundamentals";
import { prepModule as hiring } from "@/content/prep/modules/security-internship-hiring";
import { prepModule as scenarios } from "@/content/prep/modules/technical-scenarios";
import { prepModule as threats } from "@/content/prep/modules/threats-and-frameworks";
import { prepModule as webApp } from "@/content/prep/modules/web-application-security";
import type { SnapshotAnalysis, SnapshotApplication, SnapshotProgress, UserSnapshot } from "@/lib/data/snapshot";

import {
  COURSE,
  KEYWORD_RESOURCES,
  MAX_RECOMMENDATIONS,
  MOCK_INTERVIEW_CHECKLIST,
  RULES,
  getRecommendations,
  matchRoleGroups,
  normalizeKeyword,
  referencedIds,
  stageEnteredAt,
  type Recommendation,
} from "./detections";

// ── Fixtures ────────────────────────────────────────────────────────────────

const MODULES = [
  behavioral, blueTeam, cloudIdentity, grc, networking, offensive, osSecurity,
  portfolio, automation, fundamentals, hiring, scenarios, threats, webApp,
];
const MODULE_IDS = new Set(MODULES.map((m) => m.id));
const RESOURCE_IDS = new Set(RESOURCES.map((r) => r.id));

const NOW = new Date("2026-10-16T15:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY);
const daysAhead = (n: number) => new Date(NOW.getTime() + n * DAY);

let seq = 0;
const nextId = () => (++seq).toString(16).padStart(24, "0");

type AppInput = Partial<SnapshotApplication> & { status?: SnapshotApplication["status"] };

function app(input: AppInput = {}): SnapshotApplication {
  const status = input.status ?? "APPLIED";
  const created = input.createdAt ?? daysAgo(5);
  return {
    id: input.id ?? nextId(),
    company: input.company ?? "Acme",
    role: input.role ?? "Security Intern",
    status,
    workMode: null,
    source: input.source ?? null,
    excitement: 3,
    resumeId: null,
    appliedAt: input.appliedAt !== undefined ? input.appliedAt : status === "WISHLIST" ? null : created,
    createdAt: created,
    updatedAt: input.updatedAt ?? created,
    followUpAt: input.followUpAt ?? null,
    deadline: input.deadline ?? null,
    history: input.history ?? [],
  };
}

function analysis(input: Partial<SnapshotAnalysis> = {}): SnapshotAnalysis {
  return {
    id: input.id ?? nextId(),
    preset: input.preset ?? "soc",
    title: input.title ?? "SOC Analyst",
    score: input.score ?? 60,
    found: input.found ?? [],
    missing: input.missing ?? [],
    resumeId: null,
    createdAt: input.createdAt ?? daysAgo(1),
  };
}

function done(kind: "module" | "resource", itemId: string): SnapshotProgress {
  return { kind, itemId, state: "done", updatedAt: daysAgo(1) };
}

function snap(input: Partial<UserSnapshot> = {}): UserSnapshot {
  return { applications: input.applications ?? [], resumes: input.resumes ?? [], analyses: input.analyses ?? [], progress: input.progress ?? [] };
}

const recs = (s: UserSnapshot, track = "cybersecurity") => getRecommendations(s, track, NOW);
const ids = (list: Recommendation[]) => list.map((r) => r.id);
const find = (list: Recommendation[], id: string) => list.find((r) => r.id === id);

/** Interviewing at a role; history says it moved to INTERVIEW `enteredDaysAgo` days ago. */
function interviewing(role: string, company = "Acme", enteredDaysAgo = 10): SnapshotApplication {
  return app({
    role,
    company,
    status: "INTERVIEW",
    createdAt: daysAgo(enteredDaysAgo + 10),
    history: [
      { status: "APPLIED", at: daysAgo(enteredDaysAgo + 10) },
      { status: "INTERVIEW", at: daysAgo(enteredDaysAgo) },
    ],
  });
}

function expectValidIds(list: Recommendation[]) {
  for (const r of list) {
    for (const m of r.moduleIds) expect(MODULE_IDS.has(m)).toBe(true);
    for (const id of r.resourceIds) expect(RESOURCE_IDS.has(id)).toBe(true);
  }
}

// ── Content id validity ─────────────────────────────────────────────────────

describe("referenced content ids", () => {
  test("every module id referenced by a rule exists", () => {
    const { moduleIds } = referencedIds();
    expect(moduleIds.length).toBeGreaterThan(0);
    for (const id of moduleIds) expect({ id, ok: MODULE_IDS.has(id) }).toEqual({ id, ok: true });
  });

  test("every resource id referenced by a rule or keyword exists", () => {
    const { resourceIds } = referencedIds();
    expect(resourceIds.length).toBeGreaterThan(20);
    for (const id of resourceIds) expect({ id, ok: RESOURCE_IDS.has(id) }).toEqual({ id, ok: true });
  });

  test("COURSE mirrors the module files (ids, numbers, titles)", () => {
    expect(COURSE.length).toBe(MODULES.length);
    for (const c of COURSE) {
      const m = MODULES.find((x) => x.id === c.id);
      expect(m).toBeDefined();
      expect(m!.number).toBe(c.number);
      expect(m!.title).toBe(c.title);
    }
    expect(COURSE.map((c) => c.number)).toEqual([...COURSE.map((c) => c.number)].sort((a, b) => a - b));
  });

  test("keyword → resource mappings point at the intended library entries", () => {
    const title = (id: string) => RESOURCES.find((r) => r.id === id)?.title ?? "";
    expect(title(RULES["missing-splunk-repeat"].resourceIds[0]!)).toMatch(/Splunk/);
    expect(title(RULES["missing-wireshark"].resourceIds[0]!)).toMatch(/Wireshark/);
    expect(title(RULES["missing-nmap"].resourceIds[0]!)).toMatch(/Nmap/);
    expect(title(RULES["missing-python"].resourceIds[0]!)).toMatch(/Python/);
    expect(title(RULES["missing-powershell"].resourceIds[0]!)).toMatch(/PowerShell/);
    expect(title(RULES["missing-sigma"].resourceIds[0]!)).toMatch(/Sigma/);
    expect(title(RULES["missing-attack"].resourceIds[0]!)).toMatch(/ATT&CK/);
    expect(title(RULES["missing-incident-response"].resourceIds[0]!)).toMatch(/800-61/);
    expect(title(RULES["missing-aws"].resourceIds[0]!)).toMatch(/AWS/);
    expect(title(RULES["soc-interview"].resourceIds[0]!)).toMatch(/LetsDefend/);
    const kql = KEYWORD_RESOURCES.find((k) => k.label === "KQL")!;
    expect(title(kql.resourceIds[0]!)).toMatch(/Sentinel/);
    const ad = KEYWORD_RESOURCES.find((k) => k.label === "Active Directory")!;
    expect(title(ad.resourceIds[0]!)).toMatch(/Active Directory/);
  });

  test("a busy snapshot only produces valid ids", () => {
    const s = snap({
      applications: [
        interviewing("SOC Analyst Intern", "Acme"),
        interviewing("Cloud Security Intern", "Nimbus", 1),
        app({ status: "ASSESSMENT", company: "Quiz Co", deadline: daysAhead(2) }),
        app({ status: "OFFER", company: "Offer Inc" }),
        ...Array.from({ length: 6 }, (_, i) => app({ status: "WISHLIST", company: `W${i}`, createdAt: daysAgo(30) })),
      ],
      analyses: [analysis({ missing: ["SIEM", "Splunk", "KQL", "Python"] }), analysis({ missing: ["Splunk"], createdAt: daysAgo(3) })],
    });
    const out = recs(s);
    expect(out.length).toBeGreaterThan(0);
    expectValidIds(out);
  });
});

// ── Role matching ───────────────────────────────────────────────────────────

describe("matchRoleGroups", () => {
  const cases: [string, string[]][] = [
    ["SOC Analyst Intern", ["SOC"]],
    ["Security Operations Center Intern", ["SOC"]],
    ["Cyber Defense Analyst", ["SOC"]],
    ["soc analyst (summer 2027)", ["SOC"]],
    ["Pen-Test Intern", ["OFF"]],
    ["Penetration Tester", ["OFF"]],
    ["Red Team Intern", ["OFF"]],
    ["Offensive Security Intern", ["OFF"]],
    ["AppSec Intern", ["APP"]],
    ["Application Security Analyst", ["APP"]],
    ["Cloud Security Intern", ["CLOUD"]],
    ["AWS Security Intern", ["CLOUD"]],
    ["GRC Analyst Intern", ["GRC"]],
    ["IT Audit Intern", ["GRC"]],
    ["DFIR Intern", ["DFIR"]],
    ["Incident Responder", ["DFIR"]],
    ["Digital Forensics Intern", ["DFIR"]],
    ["Threat Intelligence Intern", ["CTI"]],
    ["CTI Analyst", ["CTI"]],
    ["Detection Engineer Intern", ["DET"]],
    ["Threat Hunting Intern", ["DET"]],
    ["IAM Intern", ["IAM"]],
    ["Identity and Access Management Intern", ["IAM"]],
  ];
  for (const [role, expected] of cases) {
    test(`"${role}" → ${expected.join(",")}`, () => {
      const got = matchRoleGroups(role, "cybersecurity");
      for (const g of expected) expect(got).toContain(g as never);
    });
  }

  test("product security engineer is both AppSec and engineering", () => {
    expect(matchRoleGroups("Product Security Engineer Intern").sort()).toEqual(["APP", "ENG"]);
  });

  test("SOC 2 is GRC, not a SOC analyst role", () => {
    const got = matchRoleGroups("SOC 2 Compliance Intern", "cybersecurity");
    expect(got).toContain("GRC");
    expect(got).not.toContain("SOC");
  });

  test("word boundaries: no 'soc' inside other words, no 'cti' inside 'practice'", () => {
    expect(matchRoleGroups("Social Media Intern", "business")).toEqual([]);
    expect(matchRoleGroups("Associate Product Manager", "product")).toEqual([]);
    expect(matchRoleGroups("Practice Operations Intern", "business")).toEqual([]);
    expect(matchRoleGroups("Software Engineering Intern", "software")).toEqual([]);
  });

  test("ambiguous words need a security context", () => {
    expect(matchRoleGroups("Credit Risk Intern", "business")).toEqual([]);
    expect(matchRoleGroups("Forensic Accounting Intern", "business")).toEqual([]);
    expect(matchRoleGroups("Credit Risk Intern", "cybersecurity")).toEqual(["GRC"]);
    expect(matchRoleGroups("Security Risk Intern", "business")).toEqual(["GRC"]);
  });

  test("empty role matches nothing", () => {
    expect(matchRoleGroups("", "cybersecurity")).toEqual([]);
  });
});

describe("helpers", () => {
  test("normalizeKeyword treats analyzer spellings as the same key", () => {
    expect(normalizeKeyword("MITRE ATT&CK")).toBe(normalizeKeyword("mitre att & ck"));
    expect(normalizeKeyword("TCP/IP")).toBe(normalizeKeyword("tcp ip"));
    expect(normalizeKeyword("  Incident   Response ")).toBe("incident response");
  });

  test("stageEnteredAt prefers history, then appliedAt, then createdAt", () => {
    const withHistory = app({ status: "APPLIED", appliedAt: daysAgo(50), history: [{ status: "APPLIED", at: daysAgo(40) }] });
    expect(stageEnteredAt(withHistory)).toBe(daysAgo(40).getTime());
    const noHistory = app({ status: "APPLIED", appliedAt: daysAgo(33), createdAt: daysAgo(35) });
    expect(stageEnteredAt(noHistory)).toBe(daysAgo(33).getTime());
    const wish = app({ status: "WISHLIST", createdAt: daysAgo(20) });
    expect(stageEnteredAt(wish)).toBe(daysAgo(20).getTime());
  });
});

// ── Stage rules ─────────────────────────────────────────────────────────────

describe("interview rules by specialty", () => {
  const table: [string, string, string[]][] = [
    ["soc-interview", "SOC Analyst Intern", ["blue-team-soc", "technical-scenarios"]],
    ["engineering-interview", "Security Engineering Intern", ["operating-systems-security"]],
    ["pentest-interview", "Penetration Testing Intern", ["offensive-security-basics"]],
    ["appsec-interview", "Application Security Intern", ["web-application-security"]],
    ["cloud-interview", "Cloud Security Intern", ["cloud-and-identity"]],
    ["iam-interview", "IAM Analyst Intern", ["cloud-and-identity", "security-fundamentals"]],
    ["grc-interview", "GRC Intern", ["grc-and-risk"]],
    ["dfir-interview", "Incident Response Intern", ["blue-team-soc"]],
    ["cti-interview", "Threat Intelligence Intern", ["threats-and-frameworks"]],
    ["detection-interview", "Detection Engineering Intern", ["blue-team-soc", "threats-and-frameworks"]],
  ];

  for (const [ruleId, role, modules] of table) {
    test(`${ruleId} triggers for an active "${role}" interview`, () => {
      const out = recs(snap({ applications: [interviewing(role, "Acme")] }));
      const r = find(out, ruleId);
      expect(r).toBeDefined();
      expect(r!.message).toContain("Acme");
      expect(r!.message).toMatch(/interview at Acme/);
      for (const m of modules) expect(r!.moduleIds).toContain(m);
      expect(r!.priority).toBeGreaterThanOrEqual(90);
      expect(r!.tone).toBe("interview");
      expect(r!.mascot).toBe("pip");
    });

    test(`${ruleId} does not trigger when "${role}" is only applied`, () => {
      const out = recs(snap({ applications: [app({ role, status: "APPLIED" })] }));
      expect(find(out, ruleId)).toBeUndefined();
    });
  }

  test("SOC interview message reads naturally and names the company", () => {
    const r = find(recs(snap({ applications: [interviewing("SOC Analyst Intern", "Acme")] })), "soc-interview")!;
    expect(r.message).toStartWith("You have a SOC interview at Acme.");
    expect(r.message).toMatch(/alert investigation out loud/);
  });

  test("an incident response interview uses 'an'", () => {
    const r = find(recs(snap({ applications: [interviewing("Incident Response Intern", "Beta")] })), "dfir-interview")!;
    expect(r.message).toStartWith("You have an incident response interview at Beta.");
  });

  test("two SOC interviews collapse into one recommendation naming both", () => {
    const out = recs(snap({ applications: [interviewing("SOC Analyst", "Acme"), interviewing("Security Operations Intern", "Beta")] }));
    expect(out.filter((r) => r.id === "soc-interview")).toHaveLength(1);
    expect(find(out, "soc-interview")!.message).toContain("Acme and Beta");
    expect(find(out, "soc-interview")!.applicationIds).toHaveLength(2);
  });

  test("general-interview covers roles with no specialty (cyber track)", () => {
    const out = recs(snap({ applications: [interviewing("IT Support Intern", "Campus IT")] }));
    const r = find(out, "general-interview")!;
    expect(r).toBeDefined();
    expect(r.moduleIds).toContain("security-fundamentals");
    expect(r.message).toContain("Campus IT");
  });

  test("general-interview for a non-cyber track uses behavioral + portfolio", () => {
    const out = recs(snap({ applications: [interviewing("Software Engineering Intern", "Widgets")] }), "software");
    const r = find(out, "general-interview")!;
    expect(r.moduleIds).toEqual(["behavioral-security-interviews", "portfolio-and-projects"]);
    expect(r.resourceIds).toEqual([]);
  });
});

describe("assessment-active", () => {
  test("triggers with company and due date, and outranks interviews", () => {
    const out = recs(snap({
      applications: [
        app({ status: "ASSESSMENT", company: "Quiz Co", deadline: daysAhead(2) }),
        interviewing("SOC Analyst", "Acme"),
      ],
    }));
    const r = find(out, "assessment-active")!;
    expect(r.message).toContain("Quiz Co");
    expect(r.message).toContain("due in 2 days");
    expect(r.priority).toBeGreaterThan(find(out, "soc-interview")!.priority);
    expect(out[0]!.id).toBe("assessment-active");
  });

  test("does not trigger without an assessment", () => {
    expect(find(recs(snap({ applications: [app()] })), "assessment-active")).toBeUndefined();
  });

  test("counts calendar days in the user's zone, not hours from now", () => {
    // 3 AM in Los Angeles on Oct 16; deadlines are stored at noon UTC of their day.
    const now = new Date("2026-10-16T10:00:00.000Z");
    const tomorrow = new Date("2026-10-17T12:00:00.000Z");
    const yesterday = new Date("2026-10-15T12:00:00.000Z");
    const due = (deadline: Date, at: Date, todayKey: string) =>
      find(getRecommendations(snap({ applications: [app({ status: "ASSESSMENT", company: "Quiz Co", deadline })] }), "cybersecurity", at, todayKey), "assessment-active")!.message;
    expect(due(tomorrow, now, "2026-10-16")).toContain("due tomorrow");
    // 1 AM in Los Angeles on Oct 16 is still within 24h of yesterday's deadline, but it has passed.
    const late = due(yesterday, new Date("2026-10-16T08:00:00.000Z"), "2026-10-16");
    expect(late).not.toContain("due today");
    expect(late).not.toContain("due in");
  });
});

describe("interview-new-stage", () => {
  test("triggers when INTERVIEW was entered within three days", () => {
    const out = recs(snap({ applications: [interviewing("SOC Analyst", "Acme", 2)] }));
    const r = find(out, "interview-new-stage")!;
    expect(r).toBeDefined();
    expect(r.message).toContain("Acme just moved to interviews");
    expect(r.moduleIds).toEqual(["behavioral-security-interviews"]);
  });

  test("does not trigger for an older interview", () => {
    expect(find(recs(snap({ applications: [interviewing("SOC Analyst", "Acme", 5)] })), "interview-new-stage")).toBeUndefined();
  });

  test("does not trigger without recorded history", () => {
    const a = app({ status: "INTERVIEW", role: "SOC Analyst", history: [] });
    expect(find(recs(snap({ applications: [a] })), "interview-new-stage")).toBeUndefined();
  });
});

describe("multiple-interviews, offer-stage, accepted-stage", () => {
  test("multiple-interviews needs two current interviews", () => {
    expect(find(recs(snap({ applications: [interviewing("SOC", "A"), interviewing("GRC Intern", "B")] })), "multiple-interviews")).toBeDefined();
    expect(find(recs(snap({ applications: [interviewing("SOC", "A")] })), "multiple-interviews")).toBeUndefined();
  });

  test("offer-stage triggers on a current offer with deadline", () => {
    const out = recs(snap({ applications: [app({ status: "OFFER", company: "Offer Inc", deadline: daysAhead(5) })] }));
    const r = find(out, "offer-stage")!;
    expect(r.message).toContain("Offer Inc made you an offer");
    expect(r.message).toContain("5 days");
    expect(r.mascot).toBe("miso");
    expect(find(recs(snap({ applications: [app()] })), "offer-stage")).toBeUndefined();
  });

  test("accepted-stage triggers and turns off application-volume nudges", () => {
    const out = recs(snap({
      applications: [
        app({ status: "ACCEPTED", company: "Dream Co" }),
        app({ status: "APPLIED", appliedAt: daysAgo(40), createdAt: daysAgo(40) }),
        ...Array.from({ length: 6 }, (_, i) => app({ status: "WISHLIST", company: `W${i}`, createdAt: daysAgo(30) })),
      ],
    }));
    expect(find(out, "accepted-stage")!.message).toContain("Dream Co");
    for (const id of ["application-gap", "wishlist-backlog", "stale-applied-review", "first-application"]) {
      expect(find(out, id)).toBeUndefined();
    }
  });
});

// ── Wording (missing keyword) rules ─────────────────────────────────────────

describe("missing-splunk-repeat", () => {
  const socTarget = app({ role: "SOC Analyst Intern" });

  test("triggers when Splunk is missing in two saved analyses with a SOC target", () => {
    const out = recs(snap({
      applications: [socTarget],
      analyses: [analysis({ missing: ["Splunk"], createdAt: daysAgo(2) }), analysis({ missing: ["Splunk"], createdAt: daysAgo(10) })],
    }));
    const r = find(out, "missing-splunk-repeat")!;
    expect(r).toBeDefined();
    expect(r.message).toContain("2 of your recent résumé checks");
    expect(r.message).toContain("wording signal");
    expect(r.resourceIds).toContain("r21");
  });

  test("one analysis is not a repeat", () => {
    const out = recs(snap({ applications: [socTarget], analyses: [analysis({ missing: ["Splunk"] })] }));
    expect(find(out, "missing-splunk-repeat")).toBeUndefined();
  });

  test("does not nag once the latest analysis finds Splunk", () => {
    const out = recs(snap({
      applications: [socTarget],
      analyses: [
        analysis({ found: ["Splunk"], createdAt: daysAgo(1) }),
        analysis({ missing: ["Splunk"], createdAt: daysAgo(5) }),
        analysis({ missing: ["Splunk"], createdAt: daysAgo(9) }),
      ],
    }));
    expect(find(out, "missing-splunk-repeat")).toBeUndefined();
  });

  test("needs a SOC or detection target", () => {
    const out = recs(snap({
      applications: [app({ role: "GRC Intern" })],
      analyses: [analysis({ preset: "grc", title: "GRC", missing: ["Splunk"] }), analysis({ preset: "grc", title: "GRC", missing: ["Splunk"], createdAt: daysAgo(4) })],
    }));
    expect(find(out, "missing-splunk-repeat")).toBeUndefined();
  });

  test("ignores analyses older than 60 days", () => {
    const out = recs(snap({
      applications: [socTarget],
      analyses: [analysis({ missing: ["Splunk"], createdAt: daysAgo(70) }), analysis({ missing: ["Splunk"], createdAt: daysAgo(80) })],
    }));
    expect(find(out, "missing-splunk-repeat")).toBeUndefined();
  });
});

describe("single-keyword wording rules", () => {
  // [ruleId, stored term, triggering role, non-triggering role, expected module]
  const table: [string, string, string, string, string][] = [
    ["missing-siem", "SIEM", "SOC Analyst Intern", "AppSec Intern", "blue-team-soc"],
    ["missing-python", "Python", "Security Engineer Intern", "GRC Intern", "security-automation"],
    ["missing-powershell", "PowerShell", "IAM Intern", "AppSec Intern", "security-automation"],
    ["missing-linux", "Linux", "Penetration Testing Intern", "GRC Intern", "operating-systems-security"],
    ["missing-wireshark", "Wireshark", "DFIR Intern", "GRC Intern", "networking-fundamentals"],
    ["missing-nmap", "Nmap", "Red Team Intern", "SOC Analyst", "offensive-security-basics"],
    ["missing-aws", "AWS", "AWS Security Intern", "Azure Security Intern", "cloud-and-identity"],
    ["missing-incident-response", "Incident response", "SOC Analyst Intern", "AppSec Intern", "blue-team-soc"],
    ["missing-attack", "MITRE ATT&CK", "Threat Intelligence Intern", "GRC Intern", "threats-and-frameworks"],
    ["missing-sigma", "Sigma", "Detection Engineering Intern", "SOC Analyst Intern", "blue-team-soc"],
  ];

  // Use a JD analysis ("custom") whose title has no group so only applications define targets.
  const jd = (input: Partial<SnapshotAnalysis>) => analysis({ preset: "custom", title: "Pasted posting", ...input });

  for (const [ruleId, term, yesRole, noRole, moduleId] of table) {
    test(`${ruleId}: triggers when the latest analysis misses "${term}" and a matching target exists`, () => {
      const out = recs(snap({ applications: [app({ role: yesRole, company: "Target Co" })], analyses: [jd({ missing: [term] })] }));
      const r = find(out, ruleId);
      expect(r).toBeDefined();
      expect(r!.moduleIds).toContain(moduleId);
      expect(r!.message).toContain("Pasted posting");
      expect(r!.message).toContain("wording signal");
      expect(r!.tone).toBe("wording");
    });

    test(`${ruleId}: no trigger without a matching target`, () => {
      const out = recs(snap({ applications: [app({ role: noRole })], analyses: [jd({ missing: [term] })] }));
      expect(find(out, ruleId)).toBeUndefined();
    });

    test(`${ruleId}: no trigger when the latest analysis found it`, () => {
      const out = recs(snap({
        applications: [app({ role: yesRole })],
        analyses: [jd({ found: [term], createdAt: daysAgo(1) }), jd({ missing: [term], createdAt: daysAgo(6) })],
      }));
      expect(find(out, ruleId)).toBeUndefined();
    });
  }

  test("case and spelling variants of stored terms still match", () => {
    const out = recs(snap({ applications: [app({ role: "Threat Intel Intern" })], analyses: [jd({ missing: ["mitre att & ck"] })] }));
    expect(find(out, "missing-attack")).toBeDefined();
  });

  test("an analyzer preset counts as a target (SOC preset → SIEM)", () => {
    const out = recs(snap({ analyses: [analysis({ preset: "soc", title: "SOC Analyst", missing: ["SIEM"] })] }));
    expect(find(out, "missing-siem")).toBeDefined();
  });

  test("a job-description analysis title can name the target", () => {
    const out = recs(snap({ analyses: [analysis({ preset: "custom", title: "Detection Engineer @ Hooli", missing: ["Sigma"] })] }));
    expect(find(out, "missing-sigma")).toBeDefined();
  });

  test("missing-powershell also triggers for a Windows security role", () => {
    const out = recs(snap({ applications: [app({ role: "Windows Endpoint Security Intern" })], analyses: [jd({ missing: ["PowerShell"] })] }));
    expect(find(out, "missing-powershell")).toBeDefined();
  });

  test("a term the latest analysis never evaluated does not count as missing", () => {
    const out = recs(snap({ applications: [app({ role: "SOC Analyst" })], analyses: [jd({ missing: ["Python"] })] }));
    expect(find(out, "missing-siem")).toBeUndefined();
  });
});

describe("missing-risk-language", () => {
  const grcApp = app({ role: "GRC Analyst Intern" });
  const jd = (input: Partial<SnapshotAnalysis>) => analysis({ preset: "custom", title: "Posting", ...input });

  test("triggers when both risk assessment and audit evidence are missing", () => {
    const out = recs(snap({ applications: [grcApp], analyses: [jd({ missing: ["Risk assessment", "Auditing"] })] }));
    expect(find(out, "missing-risk-language")).toBeDefined();
  });

  test("does not trigger when only one is missing", () => {
    const out = recs(snap({ applications: [grcApp], analyses: [jd({ missing: ["Risk assessment"], found: ["Auditing"] })] }));
    expect(find(out, "missing-risk-language")).toBeUndefined();
  });

  test("does not trigger without a GRC target", () => {
    const out = recs(snap({ applications: [app({ role: "AppSec Intern" })], analyses: [jd({ missing: ["Risk assessment", "Auditing"] })] }));
    expect(find(out, "missing-risk-language")).toBeUndefined();
  });
});

describe("missing-keywords bundle", () => {
  test("groups other mapped terms into one gentle pointer", () => {
    const out = recs(snap({
      applications: [app({ role: "SOC Analyst Intern" })],
      analyses: [analysis({ preset: "custom", title: "Posting", missing: ["KQL", "Active Directory", "Microsoft Sentinel", "Elastic Stack"] })],
    }));
    const r = find(out, "missing-keywords")!;
    expect(r).toBeDefined();
    expect(r.message).toContain("KQL");
    expect(r.message).toContain("wording signal");
    expect(r.resourceIds).toContain("r23");
    expect(r.moduleIds.length).toBeLessThanOrEqual(2);
    expect(r.resourceIds.length).toBeLessThanOrEqual(4);
  });

  test("ignores terms irrelevant to every target", () => {
    const out = recs(snap({ applications: [app({ role: "GRC Intern" })], analyses: [analysis({ preset: "custom", title: "Posting", missing: ["KQL"] })] }));
    expect(find(out, "missing-keywords")).toBeUndefined();
  });

  test("non-cyber users without security targets get no cyber keyword nudges", () => {
    const out = recs(snap({ applications: [app({ role: "Software Engineering Intern" })], analyses: [analysis({ preset: "swe", title: "SWE", missing: ["Python", "DNS"] })] }), "software");
    expect(out.some((r) => r.tone === "wording")).toBe(false);
  });
});

// ── Habit rules ─────────────────────────────────────────────────────────────

describe("first-application", () => {
  test("triggers when the first application landed this week", () => {
    const out = recs(snap({ applications: [app({ company: "First Co", role: "Security Intern", appliedAt: daysAgo(1), createdAt: daysAgo(1) })] }));
    const r = find(out, "first-application")!;
    expect(r.message).toContain("First Co");
    expect(r.moduleIds).toContain("security-internship-hiring");
  });

  test("does not trigger when the first application was weeks ago", () => {
    const out = recs(snap({ applications: [app({ appliedAt: daysAgo(20), createdAt: daysAgo(20) })] }));
    expect(find(out, "first-application")).toBeUndefined();
  });

  test("a wishlist entry is not an application", () => {
    const out = recs(snap({ applications: [app({ status: "WISHLIST", appliedAt: null })] }));
    expect(find(out, "first-application")).toBeUndefined();
  });
});

describe("wishlist-backlog", () => {
  const wish = (n: number, age: number) => Array.from({ length: n }, (_, i) => app({ status: "WISHLIST", company: `W${i}`, createdAt: daysAgo(age) }));

  test("triggers for five wishlist roles waiting 14+ days", () => {
    const r = find(recs(snap({ applications: wish(5, 20) })), "wishlist-backlog")!;
    expect(r.message).toContain("5 saved roles");
  });
  test("four is not a backlog", () => {
    expect(find(recs(snap({ applications: wish(4, 20) })), "wishlist-backlog")).toBeUndefined();
  });
  test("fresh wishlist entries are not a backlog", () => {
    expect(find(recs(snap({ applications: wish(6, 10) })), "wishlist-backlog")).toBeUndefined();
  });
});

describe("application-gap", () => {
  test("triggers 14+ days after the last application", () => {
    const r = find(recs(snap({ applications: [app({ company: "Last Co", appliedAt: daysAgo(20), createdAt: daysAgo(20) })] })), "application-gap")!;
    expect(r.message).toContain("20 days");
    expect(r.message).toContain("Last Co");
  });
  test("no trigger with a recent application", () => {
    expect(find(recs(snap({ applications: [app({ appliedAt: daysAgo(30) }), app({ appliedAt: daysAgo(3) })] })), "application-gap")).toBeUndefined();
  });
  test("no trigger without any application", () => {
    expect(find(recs(snap({ applications: [app({ status: "WISHLIST", appliedAt: null, createdAt: daysAgo(40) })] })), "application-gap")).toBeUndefined();
  });
});

describe("burst-without-interviews", () => {
  const burst = (extra: SnapshotApplication[] = []) => [
    ...Array.from({ length: 10 }, (_, i) => app({ company: `Old${i}`, appliedAt: daysAgo(20), createdAt: daysAgo(20) })),
    ...Array.from({ length: 6 }, (_, i) => app({ company: `New${i}`, appliedAt: daysAgo(3), createdAt: daysAgo(3) })),
    ...extra,
  ];
  test("triggers on 15+ in 28 days, 10+ aged, no interviews", () => {
    const r = find(recs(snap({ applications: burst() })), "burst-without-interviews")!;
    expect(r.message).toContain("16 applications");
  });
  test("no trigger once any record has interview history", () => {
    const withInterview = app({ status: "REJECTED", history: [{ status: "INTERVIEW", at: daysAgo(10) }, { status: "REJECTED", at: daysAgo(5) }] });
    expect(find(recs(snap({ applications: burst([withInterview]) })), "burst-without-interviews")).toBeUndefined();
  });
  test("no trigger below 15 applications", () => {
    const few = Array.from({ length: 12 }, (_, i) => app({ company: `C${i}`, appliedAt: daysAgo(20), createdAt: daysAgo(20) }));
    expect(find(recs(snap({ applications: few })), "burst-without-interviews")).toBeUndefined();
  });
});

describe("rejection patterns", () => {
  const rejected = (afterInterview: boolean, ago: number) =>
    app({
      status: "REJECTED",
      appliedAt: daysAgo(ago + 10),
      createdAt: daysAgo(ago + 10),
      history: [
        { status: "APPLIED", at: daysAgo(ago + 10) },
        ...(afterInterview ? [{ status: "INTERVIEW" as const, at: daysAgo(ago + 4) }] : []),
        { status: "REJECTED", at: daysAgo(ago) },
      ],
    });

  test("preinterview-rejections: five recent pre-interview decisions", () => {
    const out = recs(snap({ applications: Array.from({ length: 5 }, () => rejected(false, 10)) }));
    const r = find(out, "preinterview-rejections")!;
    expect(r).toBeDefined();
    expect(r.message).not.toMatch(/\d/); // never quotes a rejection count
  });
  test("preinterview-rejections: four is not enough; old ones don't count", () => {
    expect(find(recs(snap({ applications: Array.from({ length: 4 }, () => rejected(false, 10)) })), "preinterview-rejections")).toBeUndefined();
    expect(find(recs(snap({ applications: Array.from({ length: 6 }, () => rejected(false, 90)) })), "preinterview-rejections")).toBeUndefined();
  });
  test("preinterview-rejections excludes decisions after an interview", () => {
    const out = recs(snap({ applications: [...Array.from({ length: 4 }, () => rejected(false, 10)), rejected(true, 10)] }));
    expect(find(out, "preinterview-rejections")).toBeUndefined();
  });

  test("postinterview-rejections: three after interviews, with the mock checklist", () => {
    const r = find(recs(snap({ applications: Array.from({ length: 3 }, () => rejected(true, 20)) })), "postinterview-rejections")!;
    expect(r).toBeDefined();
    expect(r.steps).toEqual([...MOCK_INTERVIEW_CHECKLIST]);
    expect(r.message).not.toMatch(/\d/);
    expect(r.moduleIds).toContain("behavioral-security-interviews");
  });
  test("postinterview-rejections: two is not a pattern", () => {
    expect(find(recs(snap({ applications: Array.from({ length: 2 }, () => rejected(true, 20)) })), "postinterview-rejections")).toBeUndefined();
  });
});

describe("stale-applied-review", () => {
  test("triggers 30+ days after entering APPLIED (history)", () => {
    const a = app({ company: "Quiet Co", appliedAt: daysAgo(35), createdAt: daysAgo(35), history: [{ status: "APPLIED", at: daysAgo(35) }] });
    const r = find(recs(snap({ applications: [a, app({ appliedAt: daysAgo(1) })] })), "stale-applied-review")!;
    expect(r.message).toStartWith("Quiet Co has been at Applied for 30+ days");
    expect(r.applicationIds).toEqual([a.id]);
  });
  test("uses the latest stage entry, not the first", () => {
    const a = app({
      appliedAt: daysAgo(60),
      createdAt: daysAgo(60),
      history: [{ status: "APPLIED", at: daysAgo(60) }, { status: "ASSESSMENT", at: daysAgo(30) }, { status: "APPLIED", at: daysAgo(5) }],
    });
    expect(find(recs(snap({ applications: [a] })), "stale-applied-review")).toBeUndefined();
  });
  test("no trigger for a recent application", () => {
    expect(find(recs(snap({ applications: [app({ appliedAt: daysAgo(10), createdAt: daysAgo(10) })] })), "stale-applied-review")).toBeUndefined();
  });
});

describe("ghosted-pattern", () => {
  const ghost = (ago: number) => app({ status: "GHOSTED", history: [{ status: "GHOSTED", at: daysAgo(ago) }] });
  test("five explicit ghosted records in 90 days", () => {
    expect(find(recs(snap({ applications: Array.from({ length: 5 }, () => ghost(30)) })), "ghosted-pattern")).toBeDefined();
  });
  test("four, or old ones, do not trigger", () => {
    expect(find(recs(snap({ applications: Array.from({ length: 4 }, () => ghost(30)) })), "ghosted-pattern")).toBeUndefined();
    expect(find(recs(snap({ applications: Array.from({ length: 5 }, () => ghost(120)) })), "ghosted-pattern")).toBeUndefined();
  });
});

describe("broad-track-spread", () => {
  const spread = ["SOC Analyst Intern", "AppSec Intern", "GRC Intern", "Cloud Security Intern"].map((role, i) =>
    app({ role, company: `S${i}`, appliedAt: daysAgo(5), createdAt: daysAgo(5) }),
  );
  test("triggers for four specialties in 28 days", () => {
    const r = find(recs(snap({ applications: spread })), "broad-track-spread")!;
    expect(r.message).toContain("4 specialties");
  });
  test("three specialties is fine", () => {
    expect(find(recs(snap({ applications: spread.slice(0, 3) })), "broad-track-spread")).toBeUndefined();
  });
  test("suppressed while an interview is active", () => {
    expect(find(recs(snap({ applications: [...spread, interviewing("Security Intern")] })), "broad-track-spread")).toBeUndefined();
  });
});

// ── Onboarding, fallbacks, suppression ──────────────────────────────────────

describe("new users and fallbacks", () => {
  test("empty cyber snapshot → onboarding with hiring + networking", () => {
    const out = recs(snap());
    expect(out[0]!.id).toBe("onboarding");
    expect(out[0]!.moduleIds).toEqual(["security-internship-hiring", "networking-fundamentals"]);
    expect(out[0]!.href).toBe("/prep/security-internship-hiring");
    expectValidIds(out);
  });

  test("empty non-cyber snapshot → onboarding plus generic behavioral fallback", () => {
    const out = recs(snap(), "software");
    expect(out[0]!.id).toBe("onboarding");
    expect(out[0]!.moduleIds).toEqual(["security-internship-hiring", "portfolio-and-projects"]);
    expect(ids(out)).toContain("generic-behavioral");
    expect(out.some((r) => r.moduleIds.includes("networking-fundamentals"))).toBe(false);
  });

  test("non-cyber track with a quiet board gets the generic fallbacks", () => {
    const out = recs(snap({ applications: [app({ role: "Marketing Intern", appliedAt: daysAgo(3) })] }), "business");
    expect(ids(out)).toEqual(expect.arrayContaining(["generic-behavioral", "generic-portfolio"]));
  });

  test("cyber track with a quiet board suggests the next unfinished module", () => {
    const out = recs(snap({
      applications: [app({ appliedAt: daysAgo(3) })],
      progress: [done("module", "security-internship-hiring"), done("module", "networking-fundamentals")],
    }));
    const r = find(out, "next-module")!;
    expect(r.moduleIds).toEqual(["operating-systems-security"]);
    expect(r.title).toContain("Module 3");
  });
});

describe("completed-module suppression", () => {
  test("drops a habit rule once its modules and resources are done", () => {
    const wish = Array.from({ length: 5 }, (_, i) => app({ status: "WISHLIST", company: `W${i}`, createdAt: daysAgo(20) }));
    const out = recs(snap({ applications: wish, progress: [done("module", "security-internship-hiring"), done("resource", "r53")] }));
    expect(find(out, "wishlist-backlog")).toBeUndefined();
  });

  test("keeps a wording rule with only its resources when the module is done", () => {
    const out = recs(snap({
      applications: [app({ role: "SOC Analyst" })],
      analyses: [analysis({ missing: ["SIEM"] })],
      progress: [done("module", "blue-team-soc")],
    }));
    const r = find(out, "missing-siem")!;
    expect(r.moduleIds).toEqual([]);
    expect(r.resourceIds.length).toBeGreaterThan(0);
    expect(r.href).toBe("/prep/resources");
  });

  test("filters out finished modules from a partially done rule", () => {
    const out = recs(snap({ applications: [interviewing("SOC Analyst", "Acme")], progress: [done("module", "blue-team-soc")] }));
    const r = find(out, "soc-interview")!;
    expect(r.moduleIds).toEqual(["technical-scenarios"]);
    expect(r.practice).toBeUndefined();
  });

  test("active interview with every module done switches to practice questions", () => {
    const out = recs(snap({
      applications: [interviewing("SOC Analyst", "Acme")],
      progress: [done("module", "blue-team-soc"), done("module", "technical-scenarios")],
    }));
    const r = find(out, "soc-interview")!;
    expect(r.practice).toBe(true);
    expect(r.moduleIds).toEqual(["blue-team-soc", "technical-scenarios"]);
    expect(r.href).toBe("/prep/blue-team-soc#practice");
    expect(r.message).toContain("practice questions");
  });

  test("finished resources are removed from suggestions", () => {
    const out = recs(snap({ applications: [interviewing("SOC Analyst", "Acme")], progress: [done("resource", "r25")] }));
    expect(find(out, "soc-interview")!.resourceIds).toEqual(["r21"]);
  });

  test("onboarding disappears when both modules are done", () => {
    const out = recs(snap({ progress: [done("module", "security-internship-hiring"), done("module", "networking-fundamentals"), done("resource", "r53"), done("resource", "r01")] }));
    expect(find(out, "onboarding")).toBeUndefined();
    expect(find(out, "next-module")).toBeDefined();
  });
});

// ── Prioritization, dedupe, cap, determinism ────────────────────────────────

describe("prioritization and shape", () => {
  const busy = () =>
    snap({
      applications: [
        interviewing("SOC Analyst Intern", "Acme", 1),
        interviewing("GRC Intern", "Ledger", 8),
        app({ status: "ASSESSMENT", company: "Quiz Co", deadline: daysAhead(6) }),
        app({ status: "OFFER", company: "Offer Inc" }),
        app({ status: "APPLIED", company: "Quiet Co", appliedAt: daysAgo(40), createdAt: daysAgo(40), history: [{ status: "APPLIED", at: daysAgo(40) }] }),
        ...Array.from({ length: 6 }, (_, i) => app({ status: "WISHLIST", company: `W${i}`, createdAt: daysAgo(30) })),
      ],
      analyses: [
        analysis({ missing: ["SIEM", "Splunk", "Incident response", "KQL"], createdAt: daysAgo(1) }),
        analysis({ missing: ["Splunk"], createdAt: daysAgo(4) }),
      ],
    });

  test("is capped, sorted by priority, and has unique ids", () => {
    const out = recs(busy());
    expect(out.length).toBe(MAX_RECOMMENDATIONS);
    const priorities = out.map((r) => r.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => b - a));
    expect(new Set(ids(out)).size).toBe(out.length);
  });

  test("active stages outrank track prep, which outranks habits", () => {
    const all = getRecommendations(busy(), "cybersecurity", NOW);
    const stage = all.filter((r) => r.tone === "interview" || r.tone === "assessment" || r.tone === "celebrate");
    expect(stage.length).toBeGreaterThan(0);
    expect(all[0]!.tone === "interview" || all[0]!.tone === "assessment" || all[0]!.tone === "celebrate").toBe(true);

    const prepVsHabit = recs(snap({
      applications: [app({ role: "SOC Analyst", appliedAt: daysAgo(40), createdAt: daysAgo(40) })],
      analyses: [analysis({ missing: ["SIEM"] })],
    }));
    const siem = prepVsHabit.findIndex((r) => r.id === "missing-siem");
    const gap = prepVsHabit.findIndex((r) => r.id === "application-gap");
    expect(siem).toBeGreaterThanOrEqual(0);
    expect(gap).toBeGreaterThan(siem);
  });

  test("no two recommendations suggest the exact same content", () => {
    const out = recs(busy());
    const keys = out.map((r) => `${[...r.moduleIds].sort()}|${[...r.resourceIds].sort()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("every recommendation is complete and links somewhere", () => {
    for (const r of recs(busy())) {
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.message.length).toBeGreaterThan(20);
      expect(r.href).toMatch(/^\/prep/);
      expect(r.ruleId).toBe(r.id);
      expect(r.moduleIds.length + r.resourceIds.length).toBeGreaterThan(0);
    }
  });

  test("deterministic for the same input", () => {
    const s = busy();
    expect(getRecommendations(s, "cybersecurity", NOW)).toEqual(getRecommendations(s, "cybersecurity", NOW));
  });

  test("tolerates string dates from a serialized snapshot", () => {
    const s = busy();
    const serialized = JSON.parse(JSON.stringify(s)) as UserSnapshot;
    expect(ids(getRecommendations(serialized, "cybersecurity", NOW))).toEqual(ids(getRecommendations(s, "cybersecurity", NOW)));
  });

  test("never shames: no rejection counts or blame words in any message", () => {
    const rejected = Array.from({ length: 6 }, () =>
      app({ status: "REJECTED", history: [{ status: "INTERVIEW", at: daysAgo(12) }, { status: "REJECTED", at: daysAgo(10) }] }),
    );
    for (const r of recs(snap({ applications: rejected }))) {
      expect(r.message).not.toMatch(/\b(fail|failed|failure|bad|weak|lacking)\b/i);
      if (r.id.includes("rejection")) expect(r.message).not.toMatch(/\d/);
    }
  });
});
