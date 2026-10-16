/**
 * Maps a user's real job-hunt data to the living forest on the home page.
 *
 * `deriveForest` is PURE and deterministic: no Math.random, no ambient clock,
 * no I/O. Everything is seeded from application ids, so the same data always
 * grows the same forest (and server/client renders match). The result is plain
 * serialisable data — safe to pass to Client Components or cache.
 */
import type { ApplicationStatus } from "@prisma/client";

import type { UserSnapshot } from "@/lib/data/snapshot";

import { MAX_TREES, SLOT_COST, SLOTS, type Layer } from "./layout";
import { clamp, pick, round, unit } from "./random";
import { localClock, seasonOf, timeOfDayOf, toTime, type Season, type TimeOfDay } from "./time";

export type { Season, TimeOfDay } from "./time";
export type { Layer } from "./layout";

export type TreeSpecies = "oak" | "pine" | "birch" | "maple";
export type TreeStage = "sapling" | "young" | "mature";
/** The one status decoration a tree wears. */
export type TreeMark =
  | "none" // applied, waiting
  | "buds" // assessment: amber buds
  | "blossoms" // interviewing: lavender blossoms
  | "lantern" // offer: golden canopy + a hanging lantern
  | "crown" // accepted: golden canopy, lantern and a pennant
  | "compost" // rejected: tree stays, mushrooms + sprouts at its roots
  | "fog" // ghosted: soft wisps that thin out over time
  | "log"; // withdrawn: a mossy fallen log (you chose to step away)
export type Weather = "clear" | "sunny" | "sunshower" | "mist" | "snow";

export type ForestTree = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  /** Tree species (silhouette). */
  kind: TreeSpecies;
  /** Colour variant 0–2 within the species palette. */
  tone: 0 | 1 | 2;
  /** Ground anchor (base of trunk) in the 1200×520 viewBox. */
  x: number;
  y: number;
  layer: Layer;
  /** Depth scale of the slot (perspective only). */
  depth: number;
  /** Final render scale = depth × growth size. */
  scale: number;
  /** 0 (just planted) → 1 (fully grown). Never decreases. */
  growth: number;
  stage: TreeStage;
  plantedDaysAgo: number;
  mark: TreeMark;
  /** Mushroom shape 0–3 (button, shelf, inkcap, chanterelle) for compost trees. */
  mushroom: 0 | 1 | 2 | 3;
  /** Ghost-fog opacity 0–1 (fades as the silence gets older). */
  fog: number;
  /** A friendly, confused ghost peeks out for recent ghostings. */
  ghost: boolean;
  /** Resume ribbon colour index 0–5 (null when no resume was attached). */
  ribbon: number | null;
  /** Grew a little faster thanks to a nearby rejection's compost. */
  fertilized: boolean;
  flip: boolean;
  sway: boolean;
  /** Negative animation delay in seconds, to desync the swaying. */
  swayDelay: number;
  /** The newest tree (planted ≤3 days ago) plays a grow-in animation. */
  isNew: boolean;
};

export type ForestSeed = { id: string; company: string; role: string; sprouted: boolean };

export type ForestLandmarks = {
  /** Empty-clearing props shown before the first tree. */
  wateringCan: boolean;
  welcomeSign: boolean; // 1 tree
  bench: boolean; // 5 trees
  gate: boolean; // 10 trees
  bridge: boolean; // 25 trees
  pond: boolean; // 50 trees
  treehouse: boolean; // 100 trees
  /** Ever reached an interview: a bronze bell on the welcome sign. */
  bell: boolean;
  /** Ever got an offer: a keepsake picnic lantern. */
  picnicLantern: boolean;
  /** Accepted an offer: bunting across the clearing. */
  celebration: boolean;
  /** Books on Nib's stump library (resume versions, capped at 6). */
  library: number;
  /** Rue's little path lanterns (analyses, capped at 5). */
  lanterns: number;
};

export type ForestAnimals = {
  birds: number; // 0–3, active this week (daytime)
  deer: boolean; // weekly goal met
  owl: boolean; // Alder, dusk & night
  fireflies: number; // 0–12, evenings (not winter)
  sloth: boolean; // Moss naps when nothing happened for 7+ days
  rabbit: boolean; // Clover: activity on 3+ of the last 7 days
  squirrel: boolean; // Acorn the archivist: 3+ trees
  fox: boolean; // Pip: an interview is in progress
  otter: boolean; // Miso: pond unlocked or an offer
  hedgehog: boolean; // Prickle: a rejection in the last 7 days (comfort)
  turtle: boolean; // Tuck: something has waited 21+ days
  moth: boolean; // Dot: late night (22:00–03:59)
  frog: boolean; // Fern: something done today
  beaver: boolean; // Nib: resumes uploaded
  raccoon: boolean; // Rue: resume analyses run
};

export type ForestCounts = Record<Lowercase<ApplicationStatus>, number> & {
  /** All applications, wishlist included. */
  total: number;
  /** Applications that left the wishlist (= trees, rendered or not). */
  planted: number;
  resumes: number;
  analyses: number;
};

export type ForestMilestone = { at: number; key: keyof ForestLandmarks; name: string };

/** Everything the <Forest> scene needs to render. Serializable (plain data). */
export type ForestState = {
  /** True for the marketing/sample forest (trees are not real records). */
  demo: boolean;
  /** 0–23 in the user's time zone; drives sky palette. */
  hour: number;
  minute: number;
  timeOfDay: TimeOfDay;
  season: Season;
  weather: Weather;
  /** Rendered trees (≤120, most recent), in paint order (back → front). */
  trees: ForestTree[];
  /** Trees not drawn individually; shown as a denser forest edge on the far ridge. */
  overflow: number;
  /** Wishlist seeds in the nursery planter (≤9 shown; see counts.wishlist). */
  seeds: ForestSeed[];
  landmarks: ForestLandmarks;
  animals: ForestAnimals;
  counts: ForestCounts;
  activity: {
    /** Whole days since the last thing you did (null = never). */
    lastActiveDaysAgo: number | null;
    /** Applications submitted since Monday (local time). */
    appliedThisWeek: number;
    weeklyGoal: number;
    /** Distinct local days with activity in the last 7 days. */
    activeDaysLast7: number;
    plantedToday: number;
    /** Rejections in the last 2 days (drives the sunshower → rainbow). */
    recentRejections: number;
  };
  /** The next landmark to unlock, if any. */
  nextMilestone: (ForestMilestone & { remaining: number }) | null;
  newestId: string | null;
};

export const FOREST_MILESTONES: readonly ForestMilestone[] = [
  { at: 1, key: "welcomeSign", name: "Welcome sign" },
  { at: 5, key: "bench", name: "Bench" },
  { at: 10, key: "gate", name: "Trail gate" },
  { at: 25, key: "bridge", name: "Creek bridge" },
  { at: 50, key: "pond", name: "Lily pond" },
  { at: 100, key: "treehouse", name: "Treehouse" },
];

const DAY = 86_400_000;
const SPECIES: readonly TreeSpecies[] = ["oak", "pine", "birch", "maple"];
const MARKS: Record<ApplicationStatus, TreeMark> = {
  WISHLIST: "none",
  APPLIED: "none",
  ASSESSMENT: "buds",
  INTERVIEW: "blossoms",
  OFFER: "lantern",
  ACCEPTED: "crown",
  REJECTED: "compost",
  GHOSTED: "fog",
  WITHDRAWN: "log",
};

function roleSpecies(role: string): TreeSpecies | null {
  const r = role.toLowerCase();
  if (/secur|cyber|\bsoc\b|threat|pen ?test|penetration|red team|blue team|\bgrc\b|forensic|incident|vuln|malware/.test(r)) return "pine";
  if (/data|analyt|machine learning|\bml\b|\bai\b|research|scien|quant/.test(r)) return "birch";
  if (/product|design|\bux\b|\bui\b|business|financ|consult|market|strategy/.test(r)) return "maple";
  if (/software|engineer|develop|\bswe\b|backend|frontend|full.?stack|devops|cloud|\bit\b|systems/.test(r)) return "oak";
  return null;
}

function speciesFor(id: string, company: string, role: string): TreeSpecies {
  const preferred = roleSpecies(role);
  if (preferred && unit(id, 11) < 0.55) return preferred;
  // Same company → same species, so repeat applications look like a family.
  return pick(SPECIES, unit(company.trim().toLowerCase() || id, 12));
}

export function deriveForest(
  snapshot: UserSnapshot,
  now: Date,
  timeZone: string,
  options: { weeklyGoal?: number } = {},
): ForestState {
  const nowMs = now.getTime();
  const clock = localClock(timeZone);
  const local = clock.parts(now);
  const today = clock.dayNumber(now);
  const monday = today - (local.weekday - 1);
  const weeklyGoal = Math.max(0, Math.round(options.weeklyGoal ?? 3));
  const timeOfDay = timeOfDayOf(local.hour);
  const season = seasonOf(local.month);
  const daysAgo = (t: number) => Math.max(0, (nowMs - t) / DAY);

  const resumeIndex = new Map(snapshot.resumes.map((r, i) => [r.id, i % 6]));

  // ── Activity ──────────────────────────────────────────────────────────────
  let lastActive: number | null = null;
  const activeDays = new Set<number>();
  const touch = (value: Date | string | null | undefined) => {
    const t = toTime(value);
    if (t == null || t > nowMs + DAY) return;
    if (lastActive == null || t > lastActive) lastActive = t;
    const d = clock.dayNumber(new Date(t));
    if (d > today - 7) activeDays.add(d);
  };

  type Planted = { app: UserSnapshot["applications"][number]; plantedAt: number; appliedAt: number };
  const planted: Planted[] = [];
  const counts = {
    wishlist: 0, applied: 0, assessment: 0, interview: 0, offer: 0, accepted: 0, rejected: 0, ghosted: 0, withdrawn: 0,
  } as Record<Lowercase<ApplicationStatus>, number>;
  let everInterview = false;
  let everOffer = false;
  let appliedThisWeek = 0;
  let plantedToday = 0;
  let recentRejections = 0;
  let weekRejections = 0;
  let longWait = false;
  const wishlist: UserSnapshot["applications"] = [];

  for (const app of snapshot.applications) {
    counts[app.status.toLowerCase() as Lowercase<ApplicationStatus>]++;
    touch(app.createdAt);
    touch(app.updatedAt);
    touch(app.appliedAt);
    for (const h of app.history ?? []) touch(h.at);

    const statuses = new Set<ApplicationStatus>([app.status, ...(app.history ?? []).map((h) => h.status)]);
    if (statuses.has("INTERVIEW") || statuses.has("OFFER") || statuses.has("ACCEPTED")) everInterview = true;
    if (statuses.has("OFFER") || statuses.has("ACCEPTED")) everOffer = true;

    if (app.status === "WISHLIST") {
      wishlist.push(app);
      continue;
    }
    // Withdrawn straight from the wishlist ("decided not to apply") was never planted.
    if (app.status === "WITHDRAWN" && !app.appliedAt && !(app.history ?? []).some((h) => h.status !== "WISHLIST" && h.status !== "WITHDRAWN")) continue;

    const created = toTime(app.createdAt) ?? nowMs;
    // "Entered the forest" = first non-wishlist event; keeps slots stable when a wish becomes an application.
    let plantedAt: number | null = null;
    for (const h of app.history ?? []) {
      if (h.status === "WISHLIST") continue;
      const t = toTime(h.at);
      if (t != null && (plantedAt == null || t < plantedAt)) plantedAt = t;
    }
    plantedAt ??= created;
    const appliedAt = toTime(app.appliedAt) ?? plantedAt;
    planted.push({ app, plantedAt, appliedAt });

    const appliedDay = clock.dayNumber(new Date(appliedAt));
    if (appliedDay >= monday && appliedDay <= today) appliedThisWeek++;
    if (clock.dayNumber(new Date(plantedAt)) === today) plantedToday++;

    const lastEvent = Math.max(
      toTime(app.updatedAt) ?? created,
      ...(app.history ?? []).map((h) => toTime(h.at) ?? 0),
    );
    if (app.status === "REJECTED") {
      const rejectedAt = latestEvent(app, "REJECTED") ?? lastEvent;
      if (daysAgo(rejectedAt) <= 2) recentRejections++;
      if (daysAgo(rejectedAt) <= 7) weekRejections++;
    }
    if ((app.status === "APPLIED" || app.status === "ASSESSMENT") && daysAgo(lastEvent) >= 21) longWait = true;
  }
  for (const r of snapshot.resumes) touch(r.createdAt);
  for (const a of snapshot.analyses) touch(a.createdAt);
  for (const p of snapshot.progress) touch(p.updatedAt);

  planted.sort((a, b) => a.plantedAt - b.plantedAt || (a.app.id < b.app.id ? -1 : 1));
  const total = planted.length;
  const lastActiveDaysAgo = lastActive == null ? null : Math.floor(daysAgo(lastActive));
  const activeDaysLast7 = activeDays.size;

  // ── Trees ─────────────────────────────────────────────────────────────────
  // Compost: the two trees planted after a rejection grow a little faster.
  const fertilizedIdx = new Set<number>();
  planted.forEach((p, i) => {
    if (p.app.status === "REJECTED") {
      fertilizedIdx.add(i + 1);
      fertilizedIdx.add(i + 2);
    }
  });

  const start = Math.max(0, total - MAX_TREES);
  const newest = planted[total - 1];
  const trees: ForestTree[] = [];
  let swaying = 0;
  // Each tree's spot comes from its id, not its rank: a weighted draw over the
  // free slots (exponential race, biased to the centre by SLOT_COST), claimed
  // oldest-first. Adding a tree never moves the others, and deleting one only
  // shifts trees that had wanted its spot — the forest grows instead of
  // reshuffling. At most MAX_TREES trees are placed, so a free slot always exists.
  const used = new Set<number>();
  const slotOf = (id: string) => {
    let best = 0;
    let bestScore = Infinity;
    for (let s = 0; s < MAX_TREES; s++) {
      if (used.has(s)) continue;
      const score = -Math.log(1 - unit(id, 100 + s)) * SLOT_COST[s];
      if (score < bestScore) {
        bestScore = score;
        best = s;
      }
    }
    used.add(best);
    return SLOTS[best];
  };
  for (let i = start; i < total; i++) {
    const { app, plantedAt, appliedAt } = planted[i];
    const slot = slotOf(app.id);
    const age = daysAgo(appliedAt);
    const mark = MARKS[app.status];
    const fertilized = fertilizedIdx.has(i);
    let growth = clamp(0.28 + (age / 21) * 0.72 + (fertilized ? 0.12 : 0), 0.28, 1);
    if (mark === "blossoms" || mark === "lantern" || mark === "crown") growth = Math.max(growth, 0.78);
    if (mark === "buds") growth = Math.max(growth, 0.55);
    const stage: TreeStage = growth < 0.42 ? "sapling" : growth < 0.82 ? "young" : "mature";
    const size = stage === "sapling" ? 1.2 : 0.58 + growth * 0.42;

    let fog = 0;
    let ghost = false;
    if (mark === "fog") {
      const ghostedAt = latestEvent(app, "GHOSTED") ?? toTime(app.updatedAt) ?? plantedAt;
      const d = daysAgo(ghostedAt);
      fog = round(clamp(0.62 - d / 50, 0.18, 0.62), 2);
      ghost = d < 14;
    }

    const sway = mark !== "log" && slot.layer > 0 && (slot.layer === 2 || unit(app.id, 5) < 0.6) && swaying < 30;
    if (sway) swaying++;

    trees.push({
      id: app.id,
      company: app.company,
      role: app.role,
      status: app.status,
      kind: speciesFor(app.id, app.company, app.role),
      tone: Math.floor(unit(app.id, 3) * 3) as 0 | 1 | 2,
      x: slot.x,
      y: slot.y,
      layer: slot.layer,
      depth: slot.scale,
      scale: round(slot.scale * size, 3),
      growth: round(growth, 3),
      stage,
      plantedDaysAgo: Math.floor(daysAgo(plantedAt)),
      mark,
      mushroom: Math.floor(unit(app.id, 7) * 4) as 0 | 1 | 2 | 3,
      fog,
      ghost,
      ribbon: app.resumeId ? (resumeIndex.get(app.resumeId) ?? null) : null,
      fertilized,
      flip: unit(app.id, 4) < 0.5,
      sway,
      swayDelay: round(-unit(app.id, 6) * 7, 2),
      isNew: app === newest?.app && daysAgo(plantedAt) <= 3,
    });
  }
  // Paint order: back layer first, then by baseline so lower trees overlap higher ones.
  trees.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);

  // ── Seeds (wishlist) ─────────────────────────────────────────────────────
  const seeds: ForestSeed[] = wishlist
    .slice(-9)
    .map((w) => ({ id: w.id, company: w.company, role: w.role, sprouted: (w.excitement ?? 0) >= 4 }));

  // ── Landmarks ────────────────────────────────────────────────────────────
  const landmarks: ForestLandmarks = {
    wateringCan: total === 0,
    welcomeSign: total >= 1,
    bench: total >= 5,
    gate: total >= 10,
    bridge: total >= 25,
    pond: total >= 50,
    treehouse: total >= 100,
    bell: everInterview,
    picnicLantern: everOffer,
    celebration: counts.accepted > 0,
    library: Math.min(6, snapshot.resumes.length),
    lanterns: Math.min(5, snapshot.analyses.length),
  };

  // ── Animals ──────────────────────────────────────────────────────────────
  const isNight = timeOfDay === "night";
  const activeThisWeek = lastActiveDaysAgo != null && lastActiveDaysAgo < 7;
  const animals: ForestAnimals = {
    birds: activeThisWeek && !isNight && timeOfDay !== "dusk" ? (appliedThisWeek >= 3 ? 3 : appliedThisWeek >= 1 ? 2 : 1) : 0,
    deer: weeklyGoal > 0 && appliedThisWeek >= weeklyGoal,
    owl: isNight || timeOfDay === "dusk",
    fireflies: season === "winter" ? 0 : isNight ? 12 : timeOfDay === "dusk" ? 8 : timeOfDay === "golden" && season === "summer" ? 4 : 0,
    sloth: total > 0 && (lastActiveDaysAgo ?? 0) >= 7,
    rabbit: activeDaysLast7 >= 3,
    squirrel: total >= 3,
    fox: counts.interview > 0,
    otter: landmarks.pond || counts.offer + counts.accepted > 0,
    hedgehog: weekRejections > 0,
    turtle: longWait,
    moth: local.hour >= 22 || local.hour < 4,
    frog: lastActiveDaysAgo === 0 && activeDays.has(today),
    beaver: snapshot.resumes.length > 0,
    raccoon: snapshot.analyses.length > 0,
  };

  // ── Weather (decorative, never a judgement) ──────────────────────────────
  let weather: Weather = "clear";
  if (recentRejections > 0) weather = "sunshower";
  else if (season === "winter") weather = "snow";
  else if (total > 0 && (lastActiveDaysAgo ?? 0) >= 7) weather = "mist";
  else if (activeThisWeek) weather = "sunny";

  const next = FOREST_MILESTONES.find((m) => total < m.at) ?? null;

  return {
    demo: false,
    hour: local.hour,
    minute: local.minute,
    timeOfDay,
    season,
    weather,
    trees,
    overflow: start,
    seeds,
    landmarks,
    animals,
    counts: {
      ...counts,
      total: snapshot.applications.length,
      planted: total,
      resumes: snapshot.resumes.length,
      analyses: snapshot.analyses.length,
    },
    activity: { lastActiveDaysAgo, appliedThisWeek, weeklyGoal, activeDaysLast7, plantedToday, recentRejections },
    nextMilestone: next ? { ...next, remaining: next.at - total } : null,
    newestId: newest?.app.id ?? null,
  };
}

function latestEvent(app: UserSnapshot["applications"][number], status: ApplicationStatus): number | null {
  let best: number | null = null;
  for (const h of app.history ?? []) {
    if (h.status !== status) continue;
    const t = toTime(h.at);
    if (t != null && (best == null || t > best)) best = t;
  }
  return best;
}

// ── Captions ────────────────────────────────────────────────────────────────

const TOD_WORDS: Record<TimeOfDay, string> = {
  dawn: "at dawn",
  day: "in daylight",
  golden: "at golden hour",
  dusk: "at dusk",
  night: "at night",
};

/** One plain-language sentence describing the scene (used as the SVG's accessible label). */
export function describeForest(state: ForestState): string {
  const c = state.counts;
  if (c.planted === 0) {
    const seeds = c.wishlist ? ` ${c.wishlist} seed${c.wishlist === 1 ? "" : "s"} waiting in the planter.` : "";
    return `An empty, sunny clearing ${TOD_WORDS[state.timeOfDay]}, ready for your first tree.${seeds}`;
  }
  const bits: string[] = [`${c.planted} tree${c.planted === 1 ? "" : "s"}`];
  if (c.interview) bits.push(`${c.interview} blooming with interviews`);
  if (c.offer + c.accepted) bits.push(`${c.offer + c.accepted} golden with offers`);
  if (c.assessment) bits.push(`${c.assessment} budding with assessments`);
  if (c.rejected) bits.push(`${c.rejected} with mushrooms (rejections turned to compost)`);
  if (c.wishlist) bits.push(`${c.wishlist} seed${c.wishlist === 1 ? "" : "s"} in the planter`);
  const season = state.season[0].toUpperCase() + state.season.slice(1);
  return `${season} forest ${TOD_WORDS[state.timeOfDay]}: ${bits.join(", ")}.`;
}

// ── Demo ───────────────────────────────────────────────────────────────────

const DEMO_COMPANIES = [
  "Owlpine Security", "Lanternworks", "Bramble Bank", "Mosscloud", "Fernway Labs", "Cinder Systems",
  "Hollow Hill Health", "Kestrel Data", "Riverstone", "Thimble AI", "Quillbyte", "Juniper Grid",
  "Copperleaf", "Northwind Rail", "Saltmarsh Analytics", "Pebble Pay", "Starling Cyber", "Acorn Energy",
];
const DEMO_ROLES = [
  "Security Analyst Intern", "SOC Intern", "Cybersecurity Intern", "Software Engineering Intern",
  "Threat Intel Intern", "Cloud Security Intern", "Data Analyst Intern", "GRC Intern", "Penetration Testing Intern",
  "IT Security Intern", "Detection Engineering Intern",
];
// 31 planted + 4 wishlist ≈ 35 applications worth.
const DEMO_STATUSES: ApplicationStatus[] = [
  "REJECTED", "APPLIED", "GHOSTED", "REJECTED", "INTERVIEW", "APPLIED", "REJECTED", "ASSESSMENT", "APPLIED",
  "WITHDRAWN", "REJECTED", "APPLIED", "OFFER", "GHOSTED", "APPLIED", "REJECTED", "ASSESSMENT", "APPLIED",
  "INTERVIEW", "APPLIED", "REJECTED", "APPLIED", "GHOSTED", "APPLIED", "ASSESSMENT", "APPLIED", "INTERVIEW",
  "REJECTED", "APPLIED", "APPLIED", "APPLIED",
];

/** A lush sample forest for the marketing page and empty previews (deterministic). */
export function demoForest(hour = 17, season?: Season): ForestState {
  const h = clamp(Math.floor(hour), 0, 23);
  // Fixed calendar so the demo never changes between builds: mid-October.
  const now = new Date(Date.UTC(2026, 9, 14, h, 20));
  const at = (daysBack: number) => new Date(now.getTime() - daysBack * DAY);

  const applications: UserSnapshot["applications"] = DEMO_STATUSES.map((status, i) => {
    const n = DEMO_STATUSES.length;
    // A busy current week (weekly goal met), older ones spread over ~2 months.
    const back = i >= n - 4 ? [2, 1, 1, 0][i - (n - 4)] : Math.round((n - i) * 2.1 + (i % 3));
    const applied = at(back);
    const history: { status: ApplicationStatus; at: Date }[] = [{ status: "APPLIED", at: applied }];
    // Rejections are at least 3 days old so the demo stays sunny (no sunshower).
    const eventBack = status === "REJECTED" ? Math.max(3, back - 4) : Math.max(0, back - 6);
    if (status !== "APPLIED") history.push({ status, at: at(eventBack) });
    return {
      id: `demo-${i.toString(36)}-${(i * 7919).toString(36)}`,
      company: DEMO_COMPANIES[(i * 7) % DEMO_COMPANIES.length],
      role: DEMO_ROLES[(i * 5) % DEMO_ROLES.length],
      status,
      workMode: null,
      source: null,
      excitement: 3,
      resumeId: i % 2 === 0 ? `demo-resume-${i % 3}` : null,
      appliedAt: applied,
      createdAt: applied,
      updatedAt: history[history.length - 1].at,
      followUpAt: null,
      deadline: null,
      history,
    };
  });
  for (let i = 0; i < 4; i++) {
    applications.push({
      id: `demo-wish-${i}`,
      company: DEMO_COMPANIES[(i * 5 + 3) % DEMO_COMPANIES.length],
      role: DEMO_ROLES[(i * 3 + 1) % DEMO_ROLES.length],
      status: "WISHLIST",
      workMode: null,
      source: null,
      excitement: i % 2 ? 5 : 3,
      resumeId: null,
      appliedAt: null,
      createdAt: at(i),
      updatedAt: at(i),
      followUpAt: null,
      deadline: null,
      history: [],
    });
  }
  const resumes = [0, 1, 2].map((v) => ({
    id: `demo-resume-${v}`,
    label: ["General", "Security focus", "Cloud"][v],
    version: v + 1,
    isDefault: v === 2,
    createdAt: at(60 - v * 20),
  }));
  const analyses = [0, 1, 2, 3].map((v) => ({
    id: `demo-analysis-${v}`,
    preset: "cybersecurity",
    title: "Sample",
    score: 70 + v * 5,
    found: [],
    missing: [],
    resumeId: null,
    createdAt: at(30 - v * 7),
  }));

  const state = deriveForest({ applications, resumes, analyses, progress: [] }, now, "UTC", { weeklyGoal: 3 });
  const s = season ?? state.season;
  if (s !== state.season) {
    state.season = s;
    if (s === "winter") state.weather = "snow";
    else if (state.weather === "snow") state.weather = "sunny";
    if (s === "winter") state.animals.fireflies = 0;
  }
  return { ...state, demo: true };
}
