import type { MascotName } from "@/components/mascots";
import type { UserSnapshot } from "@/lib/data/snapshot";

import { isPrepDone, type GameStats, type Rhythm } from "./stats";
import { DAY_MS, weekOf } from "./time";
import { XP } from "./xp";

export type Quest = {
  id: string;
  title: string;
  detail: string;
  progress: number;
  target: number;
  /** XP the underlying actions earn (quests never add bonus XP on top). */
  xp: number;
  href?: string;
  done: boolean;
  mascot: MascotName;
};

/** Role keywords per career track, used for the "apply to N <track> roles" quest. */
const TRACK_ROLES: Record<string, { label: string; pattern: RegExp }> = {
  cybersecurity: {
    label: "security",
    pattern: /secur|\bsoc\b|cyber|threat|incident|\bgrc\b|pen ?test|penetration|vulnerab|red team|blue team|forensic|infosec|\biam\b|detection|malware/i,
  },
  software: { label: "software", pattern: /software|develop|engineer|\bswe\b|back.?end|front.?end|full.?stack|devops|\bsre\b|mobile|platform/i },
  data: { label: "data", pattern: /data|analytic|machine learning|\bml\b|\bai\b|scien|statistic|\bbi\b/i },
  product: { label: "product or design", pattern: /product|design|\bux\b|\bui\b|\bpm\b|research/i },
  business: { label: "business", pattern: /financ|consult|business|marketing|operations|strategy|account|banking|sales/i },
};

type Ctx = {
  snapshot: UserSnapshot;
  stats: GameStats;
  rhythm: Rhythm;
  track: string;
  tz: string;
  now: Date;
  week: number;
};

type Template = {
  id: string;
  kind: "apply" | "other";
  relevant: (c: Ctx) => boolean;
  build: (c: Ctx) => Omit<Quest, "id" | "done">;
};

const thisWeek = (c: Ctx, d: Date | null | undefined) => !!d && weekOf(new Date(d), c.tz) === c.week;

const TEMPLATES: Template[] = [
  {
    id: "apply-track",
    kind: "apply",
    relevant: (c) => c.track in TRACK_ROLES,
    build: (c) => {
      const { label, pattern } = TRACK_ROLES[c.track];
      const target = c.track === "cybersecurity" ? 3 : 2;
      const progress = c.snapshot.applications.filter((a) => thisWeek(c, a.appliedAt) && pattern.test(a.role)).length;
      return {
        title: c.track === "cybersecurity" ? `Apply to ${target} SOC or security roles` : `Apply to ${target} ${label} roles`,
        detail: "Aim the effort where your heart (and your coursework) already is.",
        progress, target, xp: target * XP.submitted, href: "/applications/new", mascot: "clover",
      };
    },
  },
  {
    id: "apply-goal",
    kind: "apply",
    relevant: () => true,
    build: (c) => ({
      title: c.rhythm.weeklyGoal === 1 ? "Plant one application this week" : `Plant ${c.rhythm.weeklyGoal} applications this week`,
      detail: "Your weekly rhythm. All on Sunday night counts too. No judgment.",
      progress: c.rhythm.thisWeekCount, target: c.rhythm.weeklyGoal, xp: c.rhythm.weeklyGoal * XP.submitted, href: "/applications/new", mascot: "fern",
    }),
  },
  {
    id: "wishlist-convert",
    kind: "apply",
    relevant: (c) => c.stats.wishlistNow > 0,
    build: (c) => ({
      title: "Turn one wishlist role into a real application",
      detail: `${c.stats.wishlistNow} saved ${c.stats.wishlistNow === 1 ? "role is" : "roles are"} waiting. Pick the one that still sparks joy.`,
      progress: Math.min(1, c.snapshot.applications.filter((a) => thisWeek(c, a.appliedAt) && a.history.some((h) => h.status === "WISHLIST")).length),
      target: 1, xp: XP.submitted, href: "/applications?status=WISHLIST", mascot: "alder",
    }),
  },
  {
    id: "dream-role",
    kind: "apply",
    relevant: (c) => c.snapshot.applications.some((a) => a.status === "WISHLIST" && a.excitement >= 4),
    build: (c) => ({
      title: "Shoot your shot at a dream role",
      detail: "Apply to one role you rated four or five hearts. Worst case: a story.",
      progress: Math.min(1, c.snapshot.applications.filter((a) => thisWeek(c, a.appliedAt) && a.excitement >= 4).length),
      target: 1, xp: XP.submitted, href: "/applications?status=WISHLIST", mascot: "miso",
    }),
  },
  {
    id: "follow-up",
    kind: "other",
    relevant: (c) =>
      c.snapshot.applications.some(
        (a) => a.status === "APPLIED" && a.appliedAt && !a.followUpAt && c.now.getTime() - new Date(a.appliedAt).getTime() > 10 * DAY_MS,
      ),
    build: (c) => {
      const progress = c.snapshot.applications.filter(
        (a) =>
          a.followUpAt && a.appliedAt && thisWeek(c, a.updatedAt) &&
          new Date(a.updatedAt).getTime() - new Date(a.appliedAt).getTime() > 10 * DAY_MS,
      ).length;
      return {
        title: "Follow up on 2 apps older than 10 days",
        detail: "A short, polite nudge. Tuck the turtle says slow replies are still replies.",
        progress: Math.min(progress, 2), target: 2, xp: 2 * XP.followUp, href: "/applications?status=APPLIED", mascot: "tuck",
      };
    },
  },
  {
    id: "analyze-newest",
    kind: "other",
    relevant: (c) => c.snapshot.resumes.length > 0,
    build: (c) => {
      const newest = [...c.snapshot.resumes].sort((a, b) => b.version - a.version)[0];
      const done = c.snapshot.analyses.some((a) => a.resumeId === newest.id && thisWeek(c, a.createdAt));
      return {
        title: "Run the analyzer on your newest resume",
        detail: `Let Rue sniff out missing keywords in v${newest.version}.`,
        progress: done ? 1 : 0, target: 1, xp: XP.analysis, href: "/analyzer", mascot: "rue",
      };
    },
  },
  {
    id: "first-resume",
    kind: "other",
    relevant: (c) => c.snapshot.resumes.length === 0,
    build: (c) => ({
      title: "Upload your resume",
      detail: "One upload unlocks the analyzer and version tracking. Nib has the tools ready.",
      progress: c.snapshot.resumes.length > 0 ? 1 : 0, target: 1, xp: XP.resume, href: "/resumes", mascot: "nib",
    }),
  },
  {
    id: "fresh-version",
    kind: "other",
    relevant: (c) => {
      const latest = c.snapshot.resumes.reduce((m, r) => Math.max(m, new Date(r.createdAt).getTime()), 0);
      return latest > 0 && c.now.getTime() - latest > 30 * DAY_MS;
    },
    build: (c) => ({
      title: "Ship a fresh resume version",
      detail: "It's been a month. Add that new project or cert while it's fresh.",
      progress: Math.min(1, c.snapshot.resumes.filter((r) => thisWeek(c, r.createdAt)).length), target: 1, xp: XP.resume, href: "/resumes", mascot: "nib",
    }),
  },
  {
    id: "prep-module",
    kind: "other",
    relevant: () => true,
    build: (c) => ({
      title: "Finish one prep module",
      detail: "Twenty focused minutes. Future interview-you sends thanks.",
      progress: Math.min(1, c.snapshot.progress.filter((p) => p.kind === "module" && isPrepDone(p.state) && thisWeek(c, p.updatedAt)).length),
      target: 1, xp: XP.prep.module, href: "/prep", mascot: "alder",
    }),
  },
  {
    id: "practice-questions",
    kind: "other",
    relevant: (c) => c.stats.assessments + c.stats.interviews > 0 || c.stats.submitted >= 5,
    build: (c) => ({
      title: "Practice 3 interview questions",
      detail: "Out loud counts double (emotionally, not in XP).",
      progress: Math.min(3, c.snapshot.progress.filter((p) => p.kind === "question" && isPrepDone(p.state) && thisWeek(c, p.updatedAt)).length),
      target: 3, xp: 3 * XP.prep.question, href: "/prep/mock", mascot: "pip",
    }),
  },
  {
    id: "flashcards",
    kind: "other",
    relevant: (c) => c.stats.flashcardsKnown > 0 || c.track === "cybersecurity",
    build: (c) => ({
      title: "Learn 10 flashcards",
      detail: c.track === "cybersecurity" ? "Ports, protocols, that one acronym you always forget." : "Small reps, big recall.",
      progress: Math.min(10, c.snapshot.progress.filter((p) => p.kind === "flashcard" && isPrepDone(p.state) && thisWeek(c, p.updatedAt)).length),
      target: 10, xp: 10 * XP.prep.flashcard, href: "/prep/flashcards", mascot: "acorn",
    }),
  },
  {
    id: "status-tidy",
    kind: "other",
    relevant: (c) => c.stats.waiting >= 3,
    build: (c) => {
      let progress = 0;
      for (const a of c.snapshot.applications) {
        for (const h of a.history) if (h.status !== "WISHLIST" && h.status !== "APPLIED" && thisWeek(c, h.at)) progress++;
      }
      return {
        title: "Log 2 status updates",
        detail: "Heard back? Got ghosted? Updating keeps your forest honest and your brain lighter.",
        progress: Math.min(progress, 2), target: 2, xp: 10, href: "/applications", mascot: "acorn",
      };
    },
  },
];

/** FNV-1a: tiny deterministic hash for stable weekly rotation. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickQuests(c: Ctx, count = 3): Quest[] {
  const relevant = TEMPLATES.filter((t) => t.relevant(c));
  const rank = (t: Template) => hash(`${c.week}:${t.id}`);
  const apply = relevant.filter((t) => t.kind === "apply").sort((a, b) => rank(a) - rank(b));
  const others = relevant.filter((t) => t.kind === "other").sort((a, b) => rank(a) - rank(b));
  const chosen = [...apply.slice(0, 1), ...others.slice(0, count - 1)];
  // Top up if there weren't enough "other" quests this week.
  for (const t of [...apply.slice(1), ...others.slice(count - 1)]) {
    if (chosen.length >= count) break;
    chosen.push(t);
  }
  return chosen.map((t) => {
    const q = t.build(c);
    return { ...q, id: `${t.id}:${c.week}`, done: q.progress >= q.target };
  });
}

export type { Ctx as QuestContext };
