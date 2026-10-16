/**
 * Pure statistics for the /stats dashboard. No I/O, no clock reads: callers
 * pass `now` and the user's time zone, so the same snapshot always yields the
 * same numbers (and this is trivially testable).
 *
 * Definitions (also shown to the user under "How we count"):
 * - Submitted: has an applied date, or ever reached a post-wishlist status
 *   (Applied, OA, Interview, Offer, Accepted, Rejected, Ghosted), and is not
 *   back on the wishlist right now (undoing an accidental "Applied").
 * - Reply: ever reached OA, Interview, Offer, Accepted or Rejected
 *   (a rejection *is* a reply; silence and ghosting are not).
 * - Positive next step: ever reached OA, Interview, Offer or Accepted.
 * - Interview / offer: ever reached that stage, from history, never inferred
 *   from current status alone. A rejected app may still have interviewed.
 * - Fair denominators: an application younger than 7 days only counts toward
 *   a rate once it has hit that milestone, so brand-new apps never drag a rate
 *   down before a company could reasonably have read them.
 * - Small samples: any rate with fewer than 10 counted applications is
 *   flagged `lowSample` and shown as "not enough data yet".
 */
import type { ApplicationStatus, WorkMode } from "@prisma/client";

import type { SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";
import { dateKeyInZone, dateToKey, daysBetweenKeys } from "@/lib/applications/dates";
import { STATUSES } from "@/lib/status";
import {
  DAY_MS,
  WEEKDAYS,
  dateOnlyIndex,
  dayIndex,
  dayLabel,
  dayLongLabel,
  dayOfMonth,
  monthLabel,
  weekdayOf,
  weekStart,
} from "@/lib/stats/time";

export const MIN_SAMPLE = 10;
export const MATURE_DAYS = 7;
export const WAITING_DAYS = 14;
export const TREND_WEEKS = 12;
export const CALENDAR_WEEKS = 26;

export type StatsRange = "30d" | "90d" | "all";

export const STATS_RANGES: { key: StatsRange; label: string; short: string; days: number | null }[] = [
  { key: "30d", label: "Last 30 days", short: "30 days", days: 30 },
  { key: "90d", label: "Last 90 days", short: "90 days", days: 90 },
  { key: "all", label: "All time", short: "All time", days: null },
];

export const DEFAULT_RANGE: StatsRange = "all";

export function parseRange(value: unknown): StatsRange {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "30d" || v === "90d" || v === "all" ? v : DEFAULT_RANGE;
}

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type Rate = {
  num: number;
  den: number;
  /** num / den, or null when den is 0. */
  value: number | null;
  /** den < MIN_SAMPLE: show counts, not a verdict. */
  lowSample: boolean;
  /** Fair rates only: submitted apps left out because they're too new to judge. */
  excluded?: number;
};

export type AppFacts = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  workMode: WorkMode | null;
  source: string | null;
  excitement: number;
  resumeId: string | null;
  submitted: boolean;
  /** Local day index of submission (or creation for wishlist items). */
  anchorDay: number;
  submittedDay: number | null;
  ageDays: number | null;
  mature: boolean;
  responded: boolean;
  positive: boolean;
  assessed: boolean;
  interviewed: boolean;
  offered: boolean;
  rejected: boolean;
  ghosted: boolean;
  /** Day the first reply arrived (history; falls back to last update). */
  respondedDay: number | null;
  interviewDay: number | null;
  rejectedDay: number | null;
  /** Whole days from submission to first reply; null when not precisely known. */
  responseDays: number | null;
  followUpAt: Date | null;
};

export type WeekBucket = {
  start: number;
  label: string;
  rangeLabel: string;
  submitted: number;
  current: boolean;
  metGoal: boolean;
};

export type FunnelStage = {
  key: "submitted" | "replied" | "assessment" | "interview" | "offer";
  label: string;
  hint: string;
  count: number;
  /** Share of submitted applications. */
  ofSubmitted: number | null;
  /** Share of the previous main stage (OA is an optional branch, so interview compares to replies). */
  ofPrevious: number | null;
  optional?: boolean;
};

export type BreakdownRow = {
  key: string;
  label: string;
  apps: number;
  replies: number;
  interviews: number;
  offers: number;
  reply: Rate;
  interview: Rate;
  unrecorded?: boolean;
};

export type FollowUpItem = { id: string; company: string; role: string; days: number };

export type CalendarDay = {
  index: number;
  label: string;
  actions: number;
  submitted: number;
  /** 0 = no activity, 1–4 = sequential intensity. */
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
};

export type Delta = { current: number; previous: number; label: string };
export type RateDelta = { current: Rate; previous: Rate; label: string };

export type Stats = {
  range: StatsRange;
  rangeLabel: string;
  rangeStartDay: number | null;
  todayIndex: number;
  totals: {
    all: number;
    wishlist: number;
    /** Submitted within the selected range. */
    submitted: number;
    submittedAllTime: number;
    /** Current status counts, all time ("right now" view). */
    byStatus: Record<ApplicationStatus, number>;
    active: number;
    closed: number;
    offers: number;
  };
  rates: {
    reply: Rate;
    positive: Rate;
    interview: Rate;
    offer: Rate;
    ghost: Rate;
    interviewToOffer: Rate;
    oaToInterview: Rate;
  };
  /** Submitted in range, under 7 days old, no reply yet. */
  fresh: number;
  /** Submitted in range, under 14 days old. */
  recent: number;
  responseTime: {
    median: number | null;
    n: number;
    pending: number;
    lowSample: boolean;
    buckets: { label: string; min: number; max: number | null; count: number }[];
  };
  weekly: {
    weeks: WeekBucket[];
    goal: number;
    thisWeek: number;
    goalWeeksMet: number;
    goalStreak: number;
    activeWeeks: number;
    max: number;
  };
  weekdays: { short: string; long: string; count: number }[];
  bestDay: { short: string; long: string; plural: string; count: number; share: number } | null;
  funnel: FunnelStage[];
  pipeline: {
    statuses: { status: ApplicationStatus; count: number }[];
    pendingAge: { label: string; count: number }[];
    followUpsDue: FollowUpItem[];
    waiting: FollowUpItem[];
  };
  breakdowns: {
    source: BreakdownRow[];
    workMode: BreakdownRow[];
    resume: BreakdownRow[];
    excitement: BreakdownRow[];
  };
  calendar: {
    weeks: CalendarDay[][];
    months: { col: number; label: string }[];
    max: number;
    totalActions: number;
    activeDays: number;
  };
  compare: {
    submitted: Delta;
    reply: RateDelta | null;
    interview: RateDelta | null;
    medianDays: Delta | null;
  };
  /** Weekly series for sparklines (oldest → newest, TREND_WEEKS points). */
  trends: {
    submitted: number[];
    reply: (number | null)[];
    interview: (number | null)[];
  };
  resilience: { rejections: number; sentAfterFirstRejection: number };
  missingResume: number;
  daysSinceLastSubmission: number | null;
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const SUBMITTED_STATES: ApplicationStatus[] = ["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED", "GHOSTED"];
const REPLY_STATES: ApplicationStatus[] = ["ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"];
const POSITIVE_STATES: ApplicationStatus[] = ["ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED"];
const INTERVIEW_STATES: ApplicationStatus[] = ["INTERVIEW", "OFFER", "ACCEPTED"];
const OFFER_STATES: ApplicationStatus[] = ["OFFER", "ACCEPTED"];
const PIPELINE_ACTIVE: ApplicationStatus[] = ["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER"];

export function makeRate(num: number, den: number): Rate {
  return { num, den, value: den > 0 ? num / den : null, lowSample: den < MIN_SAMPLE };
}

function sumRates(rates: Rate[]): Rate {
  return {
    ...makeRate(
      rates.reduce((s, r) => s + r.num, 0),
      rates.reduce((s, r) => s + r.den, 0),
    ),
    excluded: rates.reduce((s, r) => s + (r.excluded ?? 0), 0),
  };
}

/** Fair rate: young applications only count once they've hit the milestone. */
function fairRate(facts: AppFacts[], hit: (f: AppFacts) => boolean): Rate {
  let num = 0;
  let den = 0;
  let excluded = 0;
  for (const f of facts) {
    if (!f.submitted) continue;
    const h = hit(f);
    if (h) num++;
    if (h || f.mature) den++;
    else excluded++;
  }
  return { ...makeRate(num, den), excluded };
}

/**
 * True when a rate can't say anything yet: nothing counted, or a small sample
 * made only of hits because every non-hit is still too new (a "5 of 5" that is
 * really 5 of 10 sent). Showing 100% there would read as reality.
 */
export function isTooEarly(rate: Rate): boolean {
  return rate.den === 0 || (rate.lowSample && rate.num === rate.den && (rate.excluded ?? 0) > 0);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function firstAt(history: { status: ApplicationStatus; at: Date }[], states: ApplicationStatus[]): Date | null {
  let best: Date | null = null;
  for (const h of history) {
    if (states.includes(h.status) && (!best || h.at < best)) best = h.at;
  }
  return best;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Derive per-application facts (exported for tests and other pure modules). */
export function deriveFacts(app: SnapshotApplication, todayIndex: number, timeZone: string): AppFacts {
  const history = (app.history ?? [])
    .map((h) => ({ status: h.status, at: toDate(h.at) }))
    .filter((h): h is { status: ApplicationStatus; at: Date } => h.at !== null);
  const reached = new Set<ApplicationStatus>([app.status, ...history.map((h) => h.status)]);
  const has = (states: ApplicationStatus[]) => states.some((s) => reached.has(s));

  const appliedAt = toDate(app.appliedAt);
  const createdAt = toDate(app.createdAt) ?? new Date(0);
  const updatedAt = toDate(app.updatedAt) ?? createdAt;

  // Moving an app back to the wishlist undoes an accidental "Applied" (appliedAt
  // is cleared, but the APPLIED event stays in history), so it isn't counted.
  const submitted = app.status !== "WISHLIST" && (appliedAt !== null || has(SUBMITTED_STATES));
  const submittedAt = submitted ? (appliedAt ?? firstAt(history, SUBMITTED_STATES) ?? createdAt) : null;
  // appliedAt is a calendar day (stored at noon UTC); history events are real instants.
  const submittedDay = !submittedAt ? null : appliedAt ? dateOnlyIndex(appliedAt) : dayIndex(submittedAt, timeZone);
  const anchorDay = submittedDay ?? dayIndex(createdAt, timeZone);

  const responded = submitted && has(REPLY_STATES);
  const replyAt = firstAt(history, REPLY_STATES);
  const interviewed = submitted && has(INTERVIEW_STATES);
  const interviewAt = firstAt(history, INTERVIEW_STATES);
  const rejected = has(["REJECTED"]);
  const rejectedAt = firstAt(history, ["REJECTED"]);

  let responseDays: number | null = null;
  if (responded && replyAt && submittedAt) {
    responseDays = Math.max(0, Math.round((replyAt.getTime() - submittedAt.getTime()) / DAY_MS));
  }

  const ageDays = submittedDay === null ? null : Math.max(0, todayIndex - submittedDay);
  const fallbackDay = dayIndex(updatedAt, timeZone);

  return {
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    workMode: app.workMode,
    source: app.source,
    excitement: app.excitement,
    resumeId: app.resumeId,
    submitted,
    anchorDay,
    submittedDay,
    ageDays,
    mature: ageDays !== null && ageDays >= MATURE_DAYS,
    responded,
    positive: submitted && has(POSITIVE_STATES),
    assessed: submitted && reached.has("ASSESSMENT"),
    interviewed,
    offered: submitted && has(OFFER_STATES),
    rejected,
    ghosted: app.status === "GHOSTED",
    respondedDay: responded ? (replyAt ? dayIndex(replyAt, timeZone) : fallbackDay) : null,
    interviewDay: interviewed ? (interviewAt ? dayIndex(interviewAt, timeZone) : fallbackDay) : null,
    rejectedDay: rejected ? (rejectedAt ? dayIndex(rejectedAt, timeZone) : fallbackDay) : null,
    responseDays,
    followUpAt: toDate(app.followUpAt),
  };
}

/** Fair rate as it stood at the end of `endDay`, for apps submitted by then. */
function fairRateAsOf(facts: AppFacts[], endDay: number, hitDay: (f: AppFacts) => number | null): Rate {
  let num = 0;
  let den = 0;
  for (const f of facts) {
    if (f.submittedDay === null || f.submittedDay > endDay) continue;
    const d = hitDay(f);
    const h = d !== null && d <= endDay;
    if (h) num++;
    if (h || endDay - f.submittedDay >= MATURE_DAYS) den++;
  }
  return makeRate(num, den);
}

/* ── Breakdowns ────────────────────────────────────────────────────────────── */

function breakdown(
  facts: AppFacts[],
  keyOf: (f: AppFacts) => { key: string; label: string; unrecorded?: boolean },
): BreakdownRow[] {
  const groups = new Map<string, { label: string; unrecorded?: boolean; items: AppFacts[] }>();
  for (const f of facts) {
    if (!f.submitted) continue;
    const k = keyOf(f);
    const g = groups.get(k.key);
    if (g) g.items.push(f);
    else groups.set(k.key, { label: k.label, unrecorded: k.unrecorded, items: [f] });
  }
  return [...groups.entries()]
    .map(([key, g]) => ({
      key,
      label: g.label,
      unrecorded: g.unrecorded,
      apps: g.items.length,
      replies: g.items.filter((f) => f.responded).length,
      interviews: g.items.filter((f) => f.interviewed).length,
      offers: g.items.filter((f) => f.offered).length,
      reply: fairRate(g.items, (f) => f.responded),
      interview: fairRate(g.items, (f) => f.interviewed),
    }))
    .sort((a, b) => Number(a.unrecorded ?? false) - Number(b.unrecorded ?? false) || b.apps - a.apps || a.label.localeCompare(b.label));
}

function mergeRows(rows: BreakdownRow[], key: string, label: string): BreakdownRow {
  return {
    key,
    label,
    apps: rows.reduce((s, r) => s + r.apps, 0),
    replies: rows.reduce((s, r) => s + r.replies, 0),
    interviews: rows.reduce((s, r) => s + r.interviews, 0),
    offers: rows.reduce((s, r) => s + r.offers, 0),
    reply: sumRates(rows.map((r) => r.reply)),
    interview: sumRates(rows.map((r) => r.interview)),
  };
}

/** Keep the top `max` recorded groups; fold the tail into "Other". */
function capRows(rows: BreakdownRow[], max: number): BreakdownRow[] {
  const recorded = rows.filter((r) => !r.unrecorded);
  const unrecorded = rows.filter((r) => r.unrecorded);
  if (recorded.length <= max) return rows;
  const head = recorded.slice(0, max - 1);
  const tail = recorded.slice(max - 1);
  return [...head, mergeRows(tail, "__other", `Other (${tail.length})`), ...unrecorded];
}

/** Canonical source key: "LinkedIn " / "linkedin" merge; any "referral"/"referred" → Referral. */
export function sourceKey(source: string | null): { key: string; label: string; unrecorded?: boolean } {
  const raw = (source ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  if (!raw) return { key: "__none", label: "Not recorded", unrecorded: true };
  const lower = raw.toLowerCase();
  if (/\brefer/.test(lower)) return { key: "referral", label: "Referral" };
  return { key: lower, label: raw };
}

const WORK_MODE_LABEL: Record<WorkMode, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site" };

/* ── Main ──────────────────────────────────────────────────────────────────── */

export function computeStats(
  snapshot: UserSnapshot,
  now: Date,
  timeZone: string,
  options: { range?: StatsRange; weeklyGoal?: number } = {},
): Stats {
  const range = options.range ?? DEFAULT_RANGE;
  const rangeMeta = STATS_RANGES.find((r) => r.key === range) ?? STATS_RANGES[2];
  const goal = Math.max(0, Math.round(options.weeklyGoal ?? 0));
  const today = dayIndex(now, timeZone);
  const rangeStart = rangeMeta.days === null ? null : today - rangeMeta.days + 1;

  const all = snapshot.applications.map((a) => deriveFacts(a, today, timeZone));
  const submittedAll = all.filter((f) => f.submitted);
  const inRange = (day: number | null) => day !== null && (rangeStart === null || day >= rangeStart) && day <= today;
  const ranged = submittedAll.filter((f) => inRange(f.submittedDay));

  /* Totals (status counts are a "right now" view across everything). */
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  for (const f of all) byStatus[f.status]++;

  /* Rates over the range cohort. */
  const assessedRanged = ranged.filter((f) => f.assessed);
  const interviewedRanged = ranged.filter((f) => f.interviewed);
  const rates = {
    reply: fairRate(ranged, (f) => f.responded),
    positive: fairRate(ranged, (f) => f.positive),
    interview: fairRate(ranged, (f) => f.interviewed),
    offer: fairRate(ranged, (f) => f.offered),
    ghost: fairRate(ranged, (f) => f.ghosted),
    interviewToOffer: makeRate(interviewedRanged.filter((f) => f.offered).length, interviewedRanged.length),
    oaToInterview: makeRate(assessedRanged.filter((f) => f.interviewed).length, assessedRanged.length),
  };

  /* Response time. */
  const times = ranged.map((f) => f.responseDays).filter((d): d is number => d !== null);
  const bucketDefs: { label: string; min: number; max: number | null }[] = [
    { label: "0–3 days", min: 0, max: 3 },
    { label: "4–7 days", min: 4, max: 7 },
    { label: "1–2 weeks", min: 8, max: 14 },
    { label: "2–4 weeks", min: 15, max: 30 },
    { label: "31+ days", min: 31, max: null },
  ];
  const responseTime = {
    median: median(times),
    n: times.length,
    pending: ranged.filter((f) => !f.responded && f.status === "APPLIED").length,
    lowSample: times.length < 3,
    buckets: bucketDefs.map((b) => ({
      ...b,
      count: times.filter((t) => t >= b.min && (b.max === null || t <= b.max)).length,
    })),
  };

  /* Weekly series (always the last TREND_WEEKS weeks). */
  const currentWeek = weekStart(today);
  const weeks: WeekBucket[] = [];
  for (let i = TREND_WEEKS - 1; i >= 0; i--) {
    const start = currentWeek - i * 7;
    const count = submittedAll.filter((f) => f.submittedDay! >= start && f.submittedDay! < start + 7).length;
    weeks.push({
      start,
      label: dayLabel(start),
      rangeLabel: `${dayLabel(start)} – ${dayLabel(start + 6)}`,
      submitted: count,
      current: i === 0,
      metGoal: goal > 0 && count >= goal,
    });
  }
  let goalStreak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].metGoal) goalStreak++;
    else if (weeks[i].current) continue; // an unfinished week doesn't break the streak
    else break;
  }
  const weekly = {
    weeks,
    goal,
    thisWeek: weeks[weeks.length - 1]?.submitted ?? 0,
    goalWeeksMet: weeks.filter((w) => w.metGoal).length,
    goalStreak,
    activeWeeks: weeks.filter((w) => w.submitted > 0).length,
    max: Math.max(goal, ...weeks.map((w) => w.submitted), 1),
  };

  /* Weekday rhythm. */
  const weekdayCounts = WEEKDAYS.map((w) => ({ short: w.short, long: w.long, count: 0 }));
  for (const f of ranged) weekdayCounts[weekdayOf(f.submittedDay!)].count++;
  let bestDay: Stats["bestDay"] = null;
  if (ranged.length >= 5) {
    const top = weekdayCounts.reduce((best, w, i) => (w.count > weekdayCounts[best].count ? i : best), 0);
    const sorted = [...weekdayCounts].sort((a, b) => b.count - a.count);
    if (sorted[0].count > sorted[1].count) {
      bestDay = { ...WEEKDAYS[top], count: weekdayCounts[top].count, share: weekdayCounts[top].count / ranged.length };
    }
  }

  /* Funnel (counts, so no maturity filter). */
  const n = ranged.length;
  const replied = ranged.filter((f) => f.responded).length;
  const assessed = assessedRanged.length;
  const interviewed = interviewedRanged.length;
  const offered = ranged.filter((f) => f.offered).length;
  const share = (a: number, b: number) => (b > 0 ? a / b : null);
  const funnel: FunnelStage[] = [
    { key: "submitted", label: "Submitted", hint: "Applications you sent", count: n, ofSubmitted: n ? 1 : null, ofPrevious: null },
    { key: "replied", label: "Got a reply", hint: "Any decision or next step, rejections included", count: replied, ofSubmitted: share(replied, n), ofPrevious: share(replied, n) },
    { key: "assessment", label: "Online assessment", hint: "Optional branch: not every process has one", count: assessed, ofSubmitted: share(assessed, n), ofPrevious: share(assessed, replied), optional: true },
    { key: "interview", label: "Interview", hint: "Talked to a human", count: interviewed, ofSubmitted: share(interviewed, n), ofPrevious: share(interviewed, replied) },
    { key: "offer", label: "Offer", hint: "They want you", count: offered, ofSubmitted: share(offered, n), ofPrevious: share(offered, interviewed) },
  ];

  /* Pipeline right now. */
  const awaiting = all.filter((f) => f.status === "APPLIED" && f.ageDays !== null);
  const pendingAge = [
    { label: "0–7 days", lo: 0, hi: 7 },
    { label: "8–14 days", lo: 8, hi: 14 },
    { label: "15–30 days", lo: 15, hi: 30 },
    { label: "31+ days", lo: 31, hi: Infinity },
  ].map((b) => ({ label: b.label, count: awaiting.filter((f) => f.ageDays! >= b.lo && f.ageDays! <= b.hi).length }));

  // Follow-up dates are calendar days: compare date keys, like the board and Home do.
  const todayKey = dateKeyInZone(now, timeZone);
  const followUpsDue = all
    .flatMap((f) => {
      if (!f.followUpAt || !PIPELINE_ACTIVE.includes(f.status)) return [];
      const overdue = daysBetweenKeys(dateToKey(f.followUpAt), todayKey);
      return overdue >= 0 ? [{ id: f.id, company: f.company, role: f.role, days: overdue }] : [];
    })
    .sort((a, b) => b.days - a.days);
  const waiting = awaiting
    .filter((f) => f.ageDays! >= WAITING_DAYS && !f.followUpAt) // dated follow-ups are tracked above
    .map((f) => ({ id: f.id, company: f.company, role: f.role, days: f.ageDays! }))
    .sort((a, b) => b.days - a.days);

  const pipelineOrder: ApplicationStatus[] = ["WISHLIST", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED", "GHOSTED", "WITHDRAWN"];

  /* Breakdowns over the range cohort. */
  const resumes = new Map(snapshot.resumes.map((r) => [r.id, r]));
  const breakdowns = {
    source: capRows(breakdown(ranged, (f) => sourceKey(f.source)), 7),
    workMode: breakdown(ranged, (f) =>
      f.workMode ? { key: f.workMode, label: WORK_MODE_LABEL[f.workMode] } : { key: "__none", label: "Not set", unrecorded: true },
    ),
    resume: breakdown(ranged, (f) => {
      if (!f.resumeId) return { key: "__none", label: "No resume linked", unrecorded: true };
      const r = resumes.get(f.resumeId);
      return r ? { key: r.id, label: `v${r.version} · ${r.label}`.slice(0, 80) } : { key: "__deleted", label: "Deleted resume" };
    }),
    excitement: breakdown(ranged, (f) => {
      const e = Math.min(5, Math.max(1, Math.round(f.excitement || 3)));
      return { key: String(e), label: `${e} of 5` };
    }).sort((a, b) => Number(b.key) - Number(a.key)),
  };

  /* Activity calendar: last CALENDAR_WEEKS weeks of actions (status events). */
  const calStart = currentWeek - (CALENDAR_WEEKS - 1) * 7;
  const actions = new Map<number, number>();
  const subs = new Map<number, number>();
  const bump = (m: Map<number, number>, k: number) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const app of snapshot.applications) {
    const events = (app.history ?? []).map((h) => toDate(h.at)).filter((d): d is Date => d !== null);
    if (events.length === 0) {
      const appliedAt = toDate(app.appliedAt);
      bump(actions, appliedAt ? dateOnlyIndex(appliedAt) : dayIndex(toDate(app.createdAt) ?? now, timeZone));
    }
    for (const at of events) bump(actions, dayIndex(at, timeZone));
  }
  for (const f of submittedAll) bump(subs, f.submittedDay!);
  let calMax = 0;
  for (let d = calStart; d <= today; d++) calMax = Math.max(calMax, actions.get(d) ?? 0);
  const levelFor = (count: number): CalendarDay["level"] => {
    if (count <= 0 || calMax === 0) return 0;
    return Math.min(4, Math.max(1, Math.ceil((count / calMax) * 4))) as CalendarDay["level"];
  };
  const calWeeks: CalendarDay[][] = [];
  const months: { col: number; label: string }[] = [];
  let totalActions = 0;
  let activeDays = 0;
  for (let c = 0; c < CALENDAR_WEEKS; c++) {
    const col: CalendarDay[] = [];
    for (let r = 0; r < 7; r++) {
      const index = calStart + c * 7 + r;
      const future = index > today;
      const count = future ? 0 : (actions.get(index) ?? 0);
      if (count > 0) {
        totalActions += count;
        activeDays++;
      }
      col.push({ index, label: dayLongLabel(index), actions: count, submitted: future ? 0 : (subs.get(index) ?? 0), level: levelFor(count), future });
      if (dayOfMonth(index) === 1 || (c === 0 && r === 0)) {
        if (!months.some((m) => m.col === c)) months.push({ col: c, label: monthLabel(index) });
      }
    }
    calWeeks.push(col);
  }
  // Drop a leading partial-month label if the next one is too close to fit.
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();

  /* Period comparison. */
  let compare: Stats["compare"];
  if (rangeMeta.days !== null && rangeStart !== null) {
    const len = rangeMeta.days;
    const prev = submittedAll.filter((f) => f.submittedDay! >= rangeStart - len && f.submittedDay! < rangeStart);
    const label = `vs previous ${len} days`;
    const prevTimes = prev.map((f) => f.responseDays).filter((d): d is number => d !== null);
    const curMedian = responseTime.median;
    const prevMedian = median(prevTimes);
    compare = {
      submitted: { current: ranged.length, previous: prev.length, label },
      // Judge the previous cohort as it stood at the end of its own window, so
      // older apps don't look better just because they've had longer to hear back.
      reply: { current: rates.reply, previous: fairRateAsOf(prev, rangeStart - 1, (f) => f.respondedDay), label },
      interview: { current: rates.interview, previous: fairRateAsOf(prev, rangeStart - 1, (f) => f.interviewDay), label },
      medianDays: curMedian !== null && prevMedian !== null && times.length >= 3 && prevTimes.length >= 3 ? { current: curMedian, previous: prevMedian, label } : null,
    };
  } else {
    const last30 = submittedAll.filter((f) => f.submittedDay! > today - 30).length;
    const prev30 = submittedAll.filter((f) => f.submittedDay! > today - 60 && f.submittedDay! <= today - 30).length;
    compare = {
      submitted: { current: last30, previous: prev30, label: "last 30 days vs the 30 before" },
      reply: null,
      interview: null,
      medianDays: null,
    };
  }

  /* Trend sparklines: cumulative, as it stood at the end of each week. */
  const trends = {
    submitted: weeks.map((w) => w.submitted),
    reply: weeks.map((w) => fairRateAsOf(submittedAll, Math.min(today, w.start + 6), (f) => f.respondedDay).value),
    interview: weeks.map((w) => fairRateAsOf(submittedAll, Math.min(today, w.start + 6), (f) => f.interviewDay).value),
  };

  /* Resilience: applications sent after the first rejection. */
  const rejectionDays = submittedAll.map((f) => f.rejectedDay).filter((d): d is number => d !== null);
  const firstRejection = rejectionDays.length ? Math.min(...rejectionDays) : null;
  const resilience = {
    rejections: submittedAll.filter((f) => f.rejected).length,
    sentAfterFirstRejection: firstRejection === null ? 0 : submittedAll.filter((f) => f.submittedDay! > firstRejection).length,
  };

  const lastSubmission = submittedAll.reduce<number | null>((m, f) => (m === null || f.submittedDay! > m ? f.submittedDay : m), null);

  return {
    range,
    rangeLabel: rangeMeta.label,
    rangeStartDay: rangeStart,
    todayIndex: today,
    totals: {
      all: all.length,
      wishlist: byStatus.WISHLIST,
      submitted: ranged.length,
      submittedAllTime: submittedAll.length,
      byStatus,
      active: PIPELINE_ACTIVE.reduce((s, st) => s + byStatus[st], 0),
      closed: byStatus.ACCEPTED + byStatus.REJECTED + byStatus.GHOSTED + byStatus.WITHDRAWN,
      offers: submittedAll.filter((f) => f.offered).length,
    },
    rates,
    fresh: ranged.filter((f) => !f.mature && !f.responded).length,
    recent: ranged.filter((f) => (f.ageDays ?? 0) < WAITING_DAYS).length,
    responseTime,
    weekly,
    weekdays: weekdayCounts,
    bestDay,
    funnel,
    pipeline: {
      statuses: pipelineOrder.map((status) => ({ status, count: byStatus[status] })),
      pendingAge,
      followUpsDue,
      waiting,
    },
    breakdowns,
    calendar: { weeks: calWeeks, months, max: calMax, totalActions, activeDays },
    compare,
    trends,
    resilience,
    missingResume: ranged.filter((f) => !f.resumeId).length,
    daysSinceLastSubmission: lastSubmission === null ? null : today - lastSubmission,
  };
}
