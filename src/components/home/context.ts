/**
 * Pure helpers for the home page: greeting, which mascot speaks, what needs
 * attention, and the recent-activity feed. No I/O and no ambient clock: every
 * function takes `now` so the page can compute it after awaiting user data.
 */
import type { ApplicationStatus } from "@prisma/client";

import type { MascotMood, MascotName } from "@/components/mascots";
import { pickLine } from "@/components/mascots";
import { dateToKey, daysBetweenKeys, longDuration } from "@/lib/applications/dates";
import { GHOST_AFTER_DAYS, isDeadlineSoon, isFollowUpDue, lastActivityAt } from "@/lib/applications/filter";
import type { SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";
import type { ForestState } from "@/lib/forest/derive";

const DAY_MS = 86_400_000;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function safeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

/** Small stable hash for rotating copy deterministically. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pickFrom<T>(list: readonly T[], seed: string): T {
  return list[hash(seed) % list.length];
}

// ─── Greeting ────────────────────────────────────────────────────────────────

export function firstName(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first) return "friend";
  return first.length > 24 ? `${first.slice(0, 23)}…` : first;
}

/** Time-of-day greeting in the user's local hour (0–23). */
export function greeting(hour: number, name: string): string {
  if (hour < 4) return `Still up, ${name}?`;
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

/** "Friday, Oct 16" in the user's zone. */
export function todayLabel(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(now);
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** One honest line under the greeting (uses real totals, not the 120 drawn trees). */
export function forestSummary(state: ForestState): string {
  const c = state.counts;
  if (c.planted === 0) {
    return c.wishlist
      ? `${plural(c.wishlist, "seed")} waiting in the planter. Your clearing is ready whenever you are.`
      : "Your clearing is ready. You don't need a whole plan to take one step.";
  }
  const bits = [`${plural(c.planted, "tree")} growing`];
  if (c.interview) bits.push(`${c.interview} in bloom`);
  if (c.offer + c.accepted) bits.push(`${c.offer + c.accepted} glowing gold`);
  if (c.wishlist) bits.push(`${plural(c.wishlist, "seed")} saved`);
  return `${bits.join(" · ")}.`;
}

// ─── Mascot of the moment ────────────────────────────────────────────────────

export type HomeMascot = {
  mascot: MascotName;
  mood: MascotMood;
  line: string;
  action?: { href: string; label: string };
  /** Why this mascot was picked (for analytics-free debugging and tests). */
  reason: "welcome" | "first-step" | "offer-fresh" | "rejection" | "late-night" | "interview" | "offer" | "rest" | "goal-met" | "tip";
  /** Set when a fresh offer should be celebrated once. */
  celebrateOffer?: { id: string; company: string };
};

/** When an application last entered `status` (history), else its updatedAt. */
function enteredAt(app: SnapshotApplication, status: ApplicationStatus): Date {
  for (let i = app.history.length - 1; i >= 0; i--) {
    if (app.history[i].status === status) return toDate(app.history[i].at);
  }
  return toDate(app.updatedAt);
}

function latestIn(apps: SnapshotApplication[], statuses: ApplicationStatus[]): { app: SnapshotApplication; at: Date } | null {
  let best: { app: SnapshotApplication; at: Date } | null = null;
  for (const app of apps) {
    if (!statuses.includes(app.status)) continue;
    const at = enteredAt(app, app.status);
    if (!best || at > best.at) best = { app, at };
  }
  return best;
}

/**
 * Context rules, most specific first:
 *  1. no applications → Clover (fresh sign-up) or Fern (first step)
 *  2. offer/acceptance in the last 14 days → Miso (+ a one-time celebration)
 *  3. rejection in the last 3 days → Prickle (comfort, no lesson required)
 *  4. after 11pm / before 4am local → Dot (drafts are saved, tomorrow works)
 *  5. an interview in progress → Pip
 *  6. an older offer still open → Miso
 *  7. nothing logged for 7+ days → Moss (welcome back, zero guilt)
 *  8. weekly goal met → Alder says you can stop here
 *  9. otherwise → Alder's tip of the day
 */
export function pickHomeMascot({
  snapshot,
  forest,
  now,
  todayKey,
  welcome,
}: {
  snapshot: UserSnapshot;
  forest: ForestState;
  now: Date;
  todayKey: string;
  welcome: boolean;
}): HomeMascot {
  const apps = snapshot.applications;
  const nowMs = now.getTime();
  const daysSince = (d: Date) => (nowMs - d.getTime()) / DAY_MS;

  if (apps.length === 0) {
    if (welcome) {
      return {
        reason: "welcome",
        mascot: "clover",
        mood: "cheer",
        line: "Hi! I'm Clover. I make adding an application take about ten seconds: company, role, Enter. That's the whole ritual.",
        action: { href: "/applications/new", label: "Plant your first tree" },
      };
    }
    return {
      reason: "first-step",
      mascot: "fern",
      mood: "happy",
      line: "You don't need a whole plan to take one step. One application, one tree. I'll be right here on my lily pad.",
      action: { href: "/applications/new", label: "Plant your first tree" },
    };
  }

  const offer = latestIn(apps, ["OFFER", "ACCEPTED"]);
  if (offer && daysSince(offer.at) <= 14) {
    const accepted = offer.app.status === "ACCEPTED";
    return {
      reason: "offer-fresh",
      mascot: "miso",
      mood: "cheer",
      line: accepted
        ? `${offer.app.company}: accepted. A new chapter has a start date, and I've already planned the snacks.`
        : `An offer from ${offer.app.company}! Take a moment before the next spreadsheet. You earned this one.`,
      action: { href: `/applications/${offer.app.id}`, label: accepted ? "See the details" : "Open the offer" },
      celebrateOffer: { id: offer.app.id, company: offer.app.company },
    };
  }

  const rejection = latestIn(apps, ["REJECTED"]);
  if (rejection && daysSince(rejection.at) <= 3) {
    const lines = [
      `${rejection.app.company} passed. The tree stays. No inspirational speech required.`,
      `That one hurt. You can take a minute. ${rejection.app.company}'s decision belongs to one application, not to you.`,
      `A mushroom has arrived under the ${rejection.app.company} tree. It's compost now: the next two you plant grow faster.`,
      `You don't have to find the lesson today. Closing this chapter is enough.`,
    ];
    return {
      reason: "rejection",
      mascot: "prickle",
      mood: "comfort",
      line: pickFrom(lines, `${rejection.app.id}:${todayKey}`),
    };
  }

  if (forest.hour >= 23 || forest.hour < 4) {
    return {
      reason: "late-night",
      mascot: "dot",
      mood: "sleepy",
      line: pickFrom(
        [
          "It's late. Your drafts are saved on this device. Tomorrow works.",
          "Night shift, huh? Log the one thing, then let the forest keep watch.",
          "The lamp's on, the drafts are safe, and nothing here expires tonight.",
        ],
        todayKey,
      ),
    };
  }

  const interviewing = apps.filter((a) => a.status === "INTERVIEW");
  if (interviewing.length > 0) {
    const first = interviewing[hash(todayKey) % interviewing.length];
    return {
      reason: "interview",
      mascot: "pip",
      mood: "happy",
      line:
        interviewing.length === 1
          ? `Interviewing with ${first.company}! They want to meet the person behind the PDF. Three stories, three questions: one cozy prep session.`
          : `${interviewing.length} interviews in bloom, including ${first.company}. Want to warm up three stories together?`,
      action: { href: "/prep", label: "Practice with Pip" },
    };
  }

  if (offer) {
    return {
      reason: "offer",
      mascot: "miso",
      mood: "happy",
      line: `${offer.app.company}'s offer is still glowing. Your priorities get a vote, and you can be excited and still ask questions.`,
      action: { href: `/applications/${offer.app.id}`, label: "Open the offer" },
    };
  }

  const idle = forest.activity.lastActiveDaysAgo;
  if (idle !== null && idle >= 7) {
    return {
      reason: "rest",
      mascot: "moss",
      mood: "sleepy",
      line: pickFrom(
        [
          "Welcome back. No explanation required. The forest kept growing while you were away.",
          "Oh hey. I was napping too. Nothing here needed you, and nothing expired.",
          "Rest counts. When you feel like it, one tiny step is plenty.",
        ],
        todayKey,
      ),
    };
  }

  if (forest.activity.weeklyGoal > 0 && forest.activity.appliedThisWeek >= forest.activity.weeklyGoal) {
    return {
      reason: "goal-met",
      mascot: "alder",
      mood: "happy",
      line: "Your plan for this week is complete. You can stop here. Anything extra is a bonus, not a debt.",
    };
  }

  return { reason: "tip", mascot: "alder", mood: "idle", line: pickLine("alder", todayKey) };
}

// ─── Needs attention ─────────────────────────────────────────────────────────

export type AttentionKind = "interview" | "followup" | "deadline" | "assessment" | "ghost";

export type AttentionItem = {
  key: string;
  id: string;
  company: string;
  role: string;
  kind: AttentionKind;
  detail: string;
  /** Lower sorts first. */
  rank: number;
};

/** Follow-ups due, deadlines in the next week, interviews and OAs in flight, and quiet 30+ day applications. */
export function needsAttention(apps: SnapshotApplication[], todayKey: string, now: Date): AttentionItem[] {
  const items: AttentionItem[] = [];
  const nowMs = now.getTime();

  for (const app of apps) {
    const base = { id: app.id, company: app.company, role: app.role };

    if (app.status === "INTERVIEW") {
      const days = Math.max(0, Math.floor((nowMs - enteredAt(app, "INTERVIEW").getTime()) / DAY_MS));
      items.push({
        ...base,
        key: `${app.id}:interview`,
        kind: "interview",
        detail: days === 0 ? "Interview stage, as of today. Prep a story or two." : `Interview stage for ${longDuration(days)}. Prep a story or two.`,
        rank: 0 + days / 1000,
      });
    }

    if (isFollowUpDue(app, todayKey) && app.followUpAt) {
      const diff = daysBetweenKeys(todayKey, dateToKey(toDate(app.followUpAt)));
      items.push({
        ...base,
        key: `${app.id}:followup`,
        kind: "followup",
        detail: diff === 0 ? "Follow-up planned for today." : `Follow-up was planned ${longDuration(-diff)} ago. Send it, or snooze it.`,
        rank: 1 + diff / 1000,
      });
    }

    if (isDeadlineSoon(app, todayKey, 7) && app.deadline) {
      const diff = daysBetweenKeys(todayKey, dateToKey(toDate(app.deadline)));
      items.push({
        ...base,
        key: `${app.id}:deadline`,
        kind: "deadline",
        detail: diff === 0 ? "Deadline is today." : diff === 1 ? "Deadline is tomorrow." : `Deadline in ${diff} days.`,
        rank: 2 + diff / 100,
      });
    }

    if (app.status === "ASSESSMENT") {
      items.push({
        ...base,
        key: `${app.id}:assessment`,
        kind: "assessment",
        detail: "Assessment in progress. The timer doesn't own your whole afternoon.",
        rank: 3,
      });
    }

    if (app.status === "APPLIED") {
      const quietDays = Math.floor((nowMs - lastActivityAt(app).getTime()) / DAY_MS);
      if (quietDays >= GHOST_AFTER_DAYS) {
        items.push({
          ...base,
          key: `${app.id}:ghost`,
          kind: "ghost",
          detail: `No reply in ${longDuration(quietDays)}. Follow up, keep waiting, or close it out.`,
          rank: 4 - quietDays / 10_000,
        });
      }
    }
  }

  return items.sort((a, b) => a.rank - b.rank);
}

// ─── Recent activity ─────────────────────────────────────────────────────────

export type ActivityKind = ApplicationStatus | "RESUME" | "ANALYSIS";

export type ActivityItem = {
  key: string;
  kind: ActivityKind;
  href: string;
  /** Sentence parts: lead verb + bold subject + optional trailing text. */
  lead: string;
  subject: string;
  tail?: string;
  at: Date;
};

const STATUS_VERB: Record<ApplicationStatus, { lead: string; tail?: (role: string) => string }> = {
  WISHLIST: { lead: "Saved a seed for", tail: (r) => r },
  APPLIED: { lead: "Planted", tail: (r) => r },
  ASSESSMENT: { lead: "Assessment from", tail: () => "buds forming" },
  INTERVIEW: { lead: "Interview with", tail: () => "in bloom" },
  OFFER: { lead: "Offer from", tail: () => "lantern lit" },
  ACCEPTED: { lead: "Accepted", tail: () => "a new chapter" },
  REJECTED: { lead: "Closed a chapter with", tail: () => "the tree stays" },
  GHOSTED: { lead: "Moved on from", tail: () => "silence, not a verdict" },
  WITHDRAWN: { lead: "Stepped away from", tail: () => "your call" },
};

export function recentActivity(snapshot: UserSnapshot, limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const app of snapshot.applications) {
    app.history.forEach((ev, i) => {
      const verb = STATUS_VERB[ev.status];
      items.push({
        key: `${app.id}:${i}`,
        kind: ev.status,
        href: `/applications/${app.id}`,
        lead: verb.lead,
        subject: app.company,
        tail: verb.tail?.(app.role),
        at: toDate(ev.at),
      });
    });
  }
  for (const r of snapshot.resumes) {
    items.push({
      key: `resume:${r.id}`,
      kind: "RESUME",
      href: `/resumes/${r.id}`,
      lead: "Saved resume",
      subject: `v${r.version}`,
      tail: r.label,
      at: toDate(r.createdAt),
    });
  }
  for (const a of snapshot.analyses.slice(0, limit)) {
    items.push({
      key: `analysis:${a.id}`,
      kind: "ANALYSIS",
      href: "/analyzer",
      lead: "Rue checked",
      subject: a.title || "a resume",
      tail: `${Math.round(a.score)}% coverage`,
      at: toDate(a.createdAt),
    });
  }
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

/** "just now", "12m ago", "3h ago", "yesterday", "4d ago", "Sep 30". */
export function timeAgo(at: Date, now: Date, timeZone: string): string {
  const diff = Math.max(0, now.getTime() - at.getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    month: "short",
    day: "numeric",
    ...(days > 300 ? { year: "numeric" } : {}),
  }).format(at);
}

export function isoString(at: Date): string {
  return Number.isNaN(at.getTime()) ? "" : at.toISOString();
}
