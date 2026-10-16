import type { ApplicationStatus } from "@prisma/client";

import type { SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";

import { DAY_MS, localParts, partsOfDateOnly, weekOf } from "./time";

/** Maximum freeze tokens held at once. */
export const MAX_FREEZES = 2;
/** Consecutive goal-met weeks needed to earn one freeze token. */
export const WEEKS_PER_FREEZE = 4;

const DONE_STATES = new Set(["done", "completed", "complete", "practiced", "known", "mastered", "read"]);

export function isPrepDone(state: string): boolean {
  return DONE_STATES.has(state.toLowerCase());
}

/** Everything achievements, quests and XP need, derived once from the snapshot. Plain data only. */
export type GameStats = {
  added: number;
  submitted: number;
  wishlistedEver: number;
  wishlistNow: number;
  waiting: number;
  assessments: number;
  interviews: number;
  offers: number;
  accepted: number;
  rejections: number;
  ghosted: number;
  withdrawn: number;
  followUps: number;
  linkedSubmitted: number;
  dreamRoles: number;
  distinctSources: number;
  distinctWeeksApplied: number;
  maxPerDay: number;
  resumes: number;
  analyses: number;
  bestScore: number;
  distinctAnalysisTargets: number;
  glowUp: boolean;
  modulesDone: number;
  questionsPracticed: number;
  flashcardsKnown: number;
  resourcesDone: number;
  prepDone: number;
  weeksMet: number;
  bestStreak: number;
  bounceBack: boolean;
  welcomeBack: boolean;
  patientTurtle: boolean;
  nightOwl: boolean;
  weekendApp: boolean;
  deadlineDaredevil: boolean;
  sameCompanyTwice: boolean;
};

export type Rhythm = {
  weekStreak: number;
  bestStreak: number;
  weeksMet: number;
  freezes: number;
  /** True when last week's miss was covered by a freeze token. */
  frozeLastWeek: boolean;
  thisWeekCount: number;
  weeklyGoal: number;
  currentWeek: number;
};

/**
 * Submitted means it has an appliedAt, or (legacy rows without one) left the
 * wishlist for a real stage. Withdrawing a wishlist item isn't applying.
 */
export function isSubmitted(app: SnapshotApplication): boolean {
  return app.appliedAt !== null || (app.status !== "WISHLIST" && app.status !== "WITHDRAWN");
}

/**
 * The real instant the user logged the submission. appliedAt is only a
 * calendar day, so use the first post-wishlist status change instead (skipping
 * one stamped exactly at appliedAt, which is a backfilled day, not a time).
 */
function loggedAt(app: SnapshotApplication): Date {
  const applied = app.appliedAt ? new Date(app.appliedAt).getTime() : null;
  const event = app.history.find((h) => h.status !== "WISHLIST" && new Date(h.at).getTime() !== applied);
  return new Date(event?.at ?? app.createdAt);
}

/** Best guess at when an application was submitted. */
export function submittedAt(app: SnapshotApplication): Date {
  if (app.appliedAt) return new Date(app.appliedAt);
  const firstOut = app.history.find((h) => h.status !== "WISHLIST");
  return new Date(firstOut?.at ?? app.createdAt);
}

export function reachedStatuses(app: SnapshotApplication): Set<ApplicationStatus> {
  const set = new Set<ApplicationStatus>(app.history.map((h) => h.status));
  set.add(app.status);
  return set;
}

function analysisTarget(a: { preset: string; title: string }): string {
  return a.preset === "custom" ? `custom:${a.title.trim().toLowerCase()}` : a.preset;
}

export function computeRhythm(
  snapshot: UserSnapshot,
  user: { weeklyGoal: number; timeZone: string; createdAt: Date },
  now: Date,
): Rhythm {
  const tz = user.timeZone || "UTC";
  const goal = Math.min(50, Math.max(1, Math.round(user.weeklyGoal || 1)));
  const currentWeek = weekOf(now, tz);

  const perWeek = new Map<number, number>();
  for (const app of snapshot.applications) {
    if (!app.appliedAt) continue;
    const w = partsOfDateOnly(app.appliedAt).week;
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }

  let start = weekOf(new Date(user.createdAt), tz);
  for (const w of perWeek.keys()) if (w < start) start = w;
  start = Math.max(start, currentWeek - 520);

  let run = 0, best = 0, freezes = 0, met = 0, sinceEarn = 0, frozeLastWeek = false;
  for (let w = start; w < currentWeek; w++) {
    if ((perWeek.get(w) ?? 0) >= goal) {
      run++;
      met++;
      sinceEarn++;
      if (sinceEarn >= WEEKS_PER_FREEZE) {
        freezes = Math.min(MAX_FREEZES, freezes + 1);
        sinceEarn = 0;
      }
      frozeLastWeek = false;
    } else if (run > 0 && freezes > 0) {
      // A freeze preserves the run without counting as a completed week.
      freezes--;
      frozeLastWeek = w === currentWeek - 1;
    } else {
      run = 0;
      sinceEarn = 0;
      frozeLastWeek = false;
    }
    best = Math.max(best, run);
  }

  const thisWeekCount = perWeek.get(currentWeek) ?? 0;
  // The week in progress never breaks the run; it joins it once the goal is met.
  const currentMet = thisWeekCount >= goal;
  const weekStreak = run + (currentMet ? 1 : 0);
  if (currentMet) met++;
  best = Math.max(best, weekStreak);

  return { weekStreak, bestStreak: best, weeksMet: met, freezes, frozeLastWeek, thisWeekCount, weeklyGoal: goal, currentWeek };
}

export function computeStats(snapshot: UserSnapshot, timeZone: string, rhythm: Rhythm): GameStats {
  const tz = timeZone || "UTC";
  const apps = snapshot.applications;

  let submitted = 0, wishlistedEver = 0, wishlistNow = 0, waiting = 0;
  let assessments = 0, interviews = 0, offers = 0, accepted = 0, rejections = 0, ghosted = 0, withdrawn = 0;
  let followUps = 0, linkedSubmitted = 0, dreamRoles = 0;
  let patientTurtle = false, nightOwl = false, weekendApp = false, deadlineDaredevil = false;
  const sources = new Set<string>();
  const weeks = new Set<number>();
  const perDay = new Map<number, number>();
  const companies = new Map<string, number>();
  const submitTimes: number[] = [];
  /** Local day → latest instant a submission for that day was logged. */
  const submitDays = new Map<number, number>();
  const rejectionDays: { day: number; at: number }[] = [];
  const addRejection = (at: Date) => rejectionDays.push({ day: localParts(at, tz).dayNum, at: at.getTime() });

  for (const app of apps) {
    const reached = reachedStatuses(app);
    if (reached.has("WISHLIST")) wishlistedEver++;
    if (app.status === "WISHLIST") wishlistNow++;
    if (app.status === "APPLIED") waiting++;
    if (reached.has("ASSESSMENT")) assessments++;
    if (reached.has("INTERVIEW")) interviews++;
    if (reached.has("OFFER") || reached.has("ACCEPTED")) offers++;
    if (reached.has("ACCEPTED")) accepted++;
    if (reached.has("REJECTED")) rejections++;
    if (reached.has("GHOSTED")) ghosted++;
    if (reached.has("WITHDRAWN")) withdrawn++;
    if (app.followUpAt) followUps++;
    if (app.excitement >= 5) dreamRoles++;
    for (const h of app.history) if (h.status === "REJECTED") addRejection(new Date(h.at));
    if (app.status === "REJECTED" && !app.history.some((h) => h.status === "REJECTED")) {
      addRejection(new Date(app.updatedAt));
    }

    if (!isSubmitted(app)) continue;
    submitted++;
    if (app.resumeId) linkedSubmitted++;
    if (app.source?.trim()) sources.add(app.source.trim().toLowerCase());
    const company = app.company.trim().toLowerCase();
    if (company) companies.set(company, (companies.get(company) ?? 0) + 1);

    const at = submittedAt(app);
    const t = at.getTime();
    submitTimes.push(t);
    // appliedAt is a calendar day; only history/createdAt are real instants.
    const local = app.appliedAt ? partsOfDateOnly(app.appliedAt) : localParts(at, tz);
    const logged = app.appliedAt ? loggedAt(app) : at;
    weeks.add(local.week);
    perDay.set(local.dayNum, (perDay.get(local.dayNum) ?? 0) + 1);
    submitDays.set(local.dayNum, Math.max(submitDays.get(local.dayNum) ?? -Infinity, logged.getTime()));
    if (app.appliedAt) {
      // Logged in the small hours, for that day or the one before (not a backdated entry).
      const loggedLocal = localParts(logged, tz);
      const lag = loggedLocal.dayNum - local.dayNum;
      if (loggedLocal.hour < 4 && lag >= 0 && lag <= 1) nightOwl = true;
    }
    if (local.weekday >= 5) weekendApp = true;
    if (app.deadline) {
      const d = new Date(app.deadline).getTime();
      if (t <= d && d - t <= DAY_MS) deadlineDaredevil = true;
    }
    const responded = app.history.some(
      (h) => !["WISHLIST", "APPLIED", "GHOSTED", "WITHDRAWN"].includes(h.status) && new Date(h.at).getTime() - t >= 30 * DAY_MS,
    );
    if (responded) patientTurtle = true;
  }

  submitTimes.sort((a, b) => a - b);
  let welcomeBack = false;
  for (let i = 1; i < submitTimes.length; i++) {
    if (submitTimes[i] - submitTimes[i - 1] >= 14 * DAY_MS) {
      welcomeBack = true;
      break;
    }
  }

  // A submission within two calendar days of a rejection. Submission days are
  // dates, not times, so a same-day one only counts if it was logged afterwards.
  const bounceBack = rejectionDays.some(
    (r) => submitDays.has(r.day + 1) || submitDays.has(r.day + 2) || (submitDays.get(r.day) ?? -Infinity) > r.at,
  );

  let bestScore = 0;
  const byTarget = new Map<string, { at: number; score: number }[]>();
  for (const a of snapshot.analyses) {
    bestScore = Math.max(bestScore, a.score);
    const key = analysisTarget(a);
    const list = byTarget.get(key) ?? [];
    list.push({ at: new Date(a.createdAt).getTime(), score: a.score });
    byTarget.set(key, list);
  }
  let glowUp = false;
  for (const list of byTarget.values()) {
    list.sort((a, b) => a.at - b.at);
    let min = Infinity;
    for (const { score } of list) {
      if (score - min >= 10) glowUp = true;
      min = Math.min(min, score);
    }
  }

  let modulesDone = 0, questionsPracticed = 0, flashcardsKnown = 0, resourcesDone = 0, prepDone = 0;
  for (const p of snapshot.progress) {
    if (!isPrepDone(p.state)) continue;
    prepDone++;
    const kind = p.kind.toLowerCase();
    if (kind === "module") modulesDone++;
    else if (kind === "question") questionsPracticed++;
    else if (kind === "flashcard") flashcardsKnown++;
    else if (kind === "resource") resourcesDone++;
  }

  let maxPerDay = 0;
  for (const n of perDay.values()) maxPerDay = Math.max(maxPerDay, n);
  let sameCompanyTwice = false;
  for (const n of companies.values()) if (n >= 2) sameCompanyTwice = true;

  return {
    added: apps.length,
    submitted,
    wishlistedEver,
    wishlistNow,
    waiting,
    assessments,
    interviews,
    offers,
    accepted,
    rejections,
    ghosted,
    withdrawn,
    followUps,
    linkedSubmitted,
    dreamRoles,
    distinctSources: sources.size,
    distinctWeeksApplied: weeks.size,
    maxPerDay,
    resumes: snapshot.resumes.length,
    analyses: snapshot.analyses.length,
    bestScore,
    distinctAnalysisTargets: byTarget.size,
    glowUp,
    modulesDone,
    questionsPracticed,
    flashcardsKnown,
    resourcesDone,
    prepDone,
    weeksMet: rhythm.weeksMet,
    bestStreak: rhythm.bestStreak,
    bounceBack,
    welcomeBack,
    patientTurtle,
    nightOwl,
    weekendApp,
    deadlineDaredevil,
    sameCompanyTwice,
  };
}
