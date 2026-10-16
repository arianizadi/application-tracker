import type { GameStats } from "./stats";

export const ACHIEVEMENT_GROUPS = ["Getting started", "Momentum", "Resilience", "Interviews", "Craft", "Prep", "Secret"] as const;
export type AchievementGroup = (typeof ACHIEVEMENT_GROUPS)[number];

export const GROUP_BLURBS: Record<AchievementGroup, string> = {
  "Getting started": "First steps into the woods.",
  Momentum: "Showing up, week after week.",
  Resilience: "For the hard parts. Never a quota.",
  Interviews: "Conversations, assessments and good news.",
  Craft: "Resumes and keyword sleuthing.",
  Prep: "Practice that quietly compounds.",
  Secret: "Shhh. The forest keeps a few surprises.",
};

export type BadgeMotif =
  | "sprout" | "acorn" | "tree" | "grove" | "mountain" | "bubble" | "scroll" | "lantern" | "moon"
  | "star" | "heart" | "ghost" | "magnifier" | "bell" | "book" | "leaf" | "rings" | "sun" | "shell" | "key";

export type AchievementDef = {
  key: string;
  name: string;
  description: string;
  /** Category for grouping on the achievements page. */
  group: AchievementGroup;
  /** How to unlock it, phrased as a gentle nudge. Hidden for secrets until unlocked. */
  hint: string;
  /** Hidden achievements show "???" until unlocked. */
  secret?: boolean;
  /** Outcome keepsakes (offers, invitations) never show as missing homework. */
  keepsake?: boolean;
  /** Emblem in the badge art. */
  motif: BadgeMotif;
  /** 1 = bronze-ish bark, 2 = sunlit, 3 = berry gold. Affects the badge rim. */
  tier: 1 | 2 | 3;
  /** Unit for progress hints, e.g. "applications". */
  unit?: string;
};

type Rule = (s: GameStats) => [current: number, target: number];

const count = (pick: (s: GameStats) => number, target: number): Rule => (s) => [pick(s), target];
const flag = (pick: (s: GameStats) => boolean): Rule => (s) => [pick(s) ? 1 : 0, 1];

type Entry = AchievementDef & { rule: Rule };

const ENTRIES: Entry[] = [
  // ── Getting started ──────────────────────────────────────────────────────
  { key: "groundbreaking", name: "Groundbreaking", description: "The dirt has been disturbed.", hint: "Submit your first application.", group: "Getting started", motif: "sprout", tier: 1, unit: "application", rule: count((s) => s.submitted, 1) },
  { key: "wishful", name: "Window Shopper", description: "Browsing, but make it career.", hint: "Save a role to your wishlist.", group: "Getting started", motif: "star", tier: 1, unit: "saved role", rule: count((s) => s.wishlistedEver, 1) },
  { key: "paper-trail", name: "Paper Trail", description: "One very portable rectangle.", hint: "Upload your first resume.", group: "Getting started", motif: "scroll", tier: 1, unit: "resume", rule: count((s) => s.resumes, 1) },
  { key: "keyword-detective", name: "Keyword Detective", description: "Enhance. Politely.", hint: "Run your first analyzer report.", group: "Getting started", motif: "magnifier", tier: 1, unit: "report", rule: count((s) => s.analyses, 1) },
  { key: "first-lesson", name: "Voluntary Homework", description: "Nobody assigned this. Iconic.", hint: "Finish any prep item.", group: "Getting started", motif: "book", tier: 1, unit: "prep item", rule: count((s) => s.prepDone, 1) },
  { key: "future-favor", name: "Future Favor", description: "Tomorrow has a helpful note.", hint: "Set a follow-up reminder on an application.", group: "Getting started", motif: "bell", tier: 1, unit: "reminder", rule: count((s) => s.followUps, 1) },
  { key: "receipts-attached", name: "Receipts Attached", description: "Future You says thanks.", hint: "Link a resume version to an application.", group: "Getting started", motif: "key", tier: 1, unit: "linked application", rule: count((s) => s.linkedSubmitted, 1) },
  { key: "heart-eyes", name: "Heart Eyes", description: "Dream job detected. Act natural.", hint: "Give a role the full five hearts.", group: "Getting started", motif: "heart", tier: 1, unit: "dream role", rule: count((s) => s.dreamRoles, 1) },

  // ── Momentum ─────────────────────────────────────────────────────────────
  { key: "threes-a-grove", name: "Three's a Grove", description: "A promising patch.", hint: "Submit three applications.", group: "Momentum", motif: "grove", tier: 1, unit: "applications", rule: count((s) => s.submitted, 3) },
  { key: "high-fivelands", name: "High Fivelands", description: "Five chances planted. Up top.", hint: "Submit five applications.", group: "Momentum", motif: "leaf", tier: 1, unit: "applications", rule: count((s) => s.submitted, 5) },
  { key: "tenacious", name: "Tenacious", description: "Look at all that trying.", hint: "Submit ten applications.", group: "Momentum", motif: "tree", tier: 1, unit: "applications", rule: count((s) => s.submitted, 10) },
  { key: "quarter-forest", name: "Quarter Forest", description: "The squirrels need a map now.", hint: "Submit 25 applications.", group: "Momentum", motif: "acorn", tier: 2, unit: "applications", rule: count((s) => s.submitted, 25) },
  { key: "fifty-shades", name: "Fifty Shades of Green", description: "Every shade of effort.", hint: "Submit 50 applications.", group: "Momentum", motif: "grove", tier: 2, unit: "applications", rule: count((s) => s.submitted, 50) },
  { key: "canopy-club", name: "Canopy Club", description: "Considerable leaf coverage.", hint: "Submit 75 applications.", group: "Momentum", motif: "tree", tier: 3, unit: "applications", rule: count((s) => s.submitted, 75) },
  { key: "hundred-acre-try", name: "Hundred Acre Try", description: "A landscape of showing up.", hint: "Submit 100 applications.", group: "Momentum", motif: "sun", tier: 3, unit: "applications", rule: count((s) => s.submitted, 100) },
  { key: "return-visitor", name: "Return Visitor", description: "Welcome back to your patch.", hint: "Apply in two different weeks.", group: "Momentum", motif: "sprout", tier: 1, unit: "weeks", rule: count((s) => s.distinctWeeksApplied, 2) },
  { key: "wide-net", name: "Wide Net", description: "A diversified portfolio of hope.", hint: "Apply through three different sources.", group: "Momentum", motif: "shell", tier: 1, unit: "sources", rule: count((s) => s.distinctSources, 3) },
  { key: "gentle-rhythm", name: "Gentle Rhythm", description: "A rhythm that fits.", hint: "Meet your weekly goal in two weeks.", group: "Momentum", motif: "leaf", tier: 1, unit: "goal weeks", rule: count((s) => s.weeksMet, 2) },
  { key: "steady-seasons", name: "Steady Seasons", description: "Consistency comes in many speeds.", hint: "Meet your weekly goal in four weeks.", group: "Momentum", motif: "rings", tier: 2, unit: "goal weeks", rule: count((s) => s.weeksMet, 4) },
  { key: "eight-rings", name: "Eight Rings", description: "Growth leaves a record.", hint: "Meet your weekly goal in eight weeks.", group: "Momentum", motif: "rings", tier: 3, unit: "goal weeks", rule: count((s) => s.weeksMet, 8) },

  // ── Resilience ───────────────────────────────────────────────────────────
  { key: "thick-bark", name: "Thick Bark", description: "Compost for something taller.", hint: "Log a rejection. It still counts as growth.", group: "Resilience", motif: "shell", tier: 1, unit: "closed chapter", rule: count((s) => s.rejections, 1) },
  { key: "still-standing", name: "Still Standing", description: "Prickle is proud of you. Quietly.", hint: "Close five chapters with a rejection.", group: "Resilience", motif: "tree", tier: 2, unit: "closed chapters", rule: count((s) => s.rejections, 5) },
  { key: "weatherproof", name: "Weatherproof", description: "Storms happen. Roots hold.", hint: "Keep going through fifteen rejections.", group: "Resilience", motif: "mountain", tier: 3, unit: "closed chapters", rule: count((s) => s.rejections, 15) },
  { key: "ghostbuster", name: "Ghostbuster", description: "Closure: self-administered.", hint: "Mark an application as ghosted.", group: "Resilience", motif: "ghost", tier: 1, unit: "ghost", rule: count((s) => s.ghosted, 1) },
  { key: "bounce-back", name: "Bounce Back", description: "No dramatic comeback required. You just did one anyway.", hint: "Submit an application within two days of a rejection.", group: "Resilience", motif: "sprout", tier: 2, rule: flag((s) => s.bounceBack) },
  { key: "welcome-back", name: "Welcome Back", description: "A fresh week. Your forest is still here.", hint: "Apply again after a break of two weeks or more.", group: "Resilience", motif: "sun", tier: 1, rule: flag((s) => s.welcomeBack) },
  { key: "patient-turtle", name: "Tuck Called It", description: "Slow replies are still replies.", hint: "Hear back on something a month or more after applying.", group: "Resilience", motif: "shell", tier: 2, rule: flag((s) => s.patientTurtle) },

  // ── Interviews ───────────────────────────────────────────────────────────
  { key: "assessment-adventurer", name: "Assessment Adventurer", description: "You did the thing with the timer.", hint: "Reach an online assessment stage.", group: "Interviews", motif: "lantern", tier: 1, unit: "assessment", rule: count((s) => s.assessments, 1) },
  { key: "an-open-door", name: "An Open Door", description: "Someone wants a conversation.", hint: "A keepsake for your first interview.", group: "Interviews", motif: "bubble", tier: 2, keepsake: true, rule: count((s) => s.interviews, 1) },
  { key: "back-in-the-clearing", name: "Back in the Clearing", description: "The room feels more familiar.", hint: "A keepsake for your third interview.", group: "Interviews", motif: "bubble", tier: 2, keepsake: true, rule: count((s) => s.interviews, 3) },
  { key: "interview-circuit", name: "Podcast Guest Energy", description: "Five interviews. You could host by now.", hint: "A keepsake for your fifth interview.", group: "Interviews", motif: "bubble", tier: 3, keepsake: true, rule: count((s) => s.interviews, 5) },
  { key: "a-very-good-email", name: "A Very Good Email", description: "Please enjoy this particular email.", hint: "A keepsake for your first offer.", group: "Interviews", motif: "star", tier: 3, keepsake: true, rule: count((s) => s.offers, 1) },
  { key: "signed-sealed", name: "Signed, Sealed, Sprouted", description: "Miso has been told. Miso is screaming.", hint: "A keepsake for accepting an offer.", group: "Interviews", motif: "heart", tier: 3, keepsake: true, rule: count((s) => s.accepted, 1) },

  // ── Craft ────────────────────────────────────────────────────────────────
  { key: "second-edition", name: "Second Edition", description: "Director's cut. Fewer typos.", hint: "Upload a second resume version.", group: "Craft", motif: "scroll", tier: 1, unit: "versions", rule: count((s) => s.resumes, 2) },
  { key: "version-control", name: "Version Control", description: "The sequel has improvements. git commit -m \"better\".", hint: "Upload a third resume version.", group: "Craft", motif: "scroll", tier: 2, unit: "versions", rule: count((s) => s.resumes, 3) },
  { key: "five-field-notes", name: "Five Field Notes", description: "Patterns are appearing.", hint: "Run five analyzer reports.", group: "Craft", motif: "magnifier", tier: 1, unit: "reports", rule: count((s) => s.analyses, 5) },
  { key: "sharp-match", name: "Sharp Match", description: "Rue is doing a little dance.", hint: "Score 80 or higher in the analyzer.", group: "Craft", motif: "star", tier: 2, unit: "score", rule: (s) => [s.bestScore, 80] },
  { key: "glow-up", name: "Glow Up", description: "Same job, better you.", hint: "Re-run a match and improve it by 10+ points.", group: "Craft", motif: "sun", tier: 2, rule: flag((s) => s.glowUp) },
  { key: "traceable-trails", name: "Traceable Trails", description: "Organized breadcrumbs.", hint: "Link resume versions to ten applications.", group: "Craft", motif: "key", tier: 2, unit: "linked applications", rule: count((s) => s.linkedSubmitted, 10) },
  { key: "preset-explorer", name: "Trying On Hats", description: "Three roles, one very flexible resume.", hint: "Analyze against three different roles or job posts.", group: "Craft", motif: "magnifier", tier: 1, unit: "targets", rule: count((s) => s.distinctAnalysisTargets, 3) },

  // ── Prep ─────────────────────────────────────────────────────────────────
  { key: "know-your-trees", name: "Know Your Trees", description: "Research, now with context.", hint: "Finish three prep modules.", group: "Prep", motif: "book", tier: 2, unit: "modules", rule: count((s) => s.modulesDone, 3) },
  { key: "three-good-questions", name: "Three Good Questions", description: "You're interviewing them, too.", hint: "Practice three interview questions.", group: "Prep", motif: "bubble", tier: 1, unit: "questions", rule: count((s) => s.questionsPracticed, 3) },
  { key: "story-collector", name: "Story Collector", description: "A plot with your name in it.", hint: "Practice ten interview questions.", group: "Prep", motif: "lantern", tier: 2, unit: "questions", rule: count((s) => s.questionsPracticed, 10) },
  { key: "brain-reps", name: "Brain Reps", description: "The neurons did some lifting.", hint: "Mark 25 flashcards as known.", group: "Prep", motif: "acorn", tier: 2, unit: "flashcards", rule: count((s) => s.flashcardsKnown, 25) },
  { key: "librarian", name: "Forest Librarian", description: "Bookmarks, but you actually read them.", hint: "Finish five prep resources.", group: "Prep", motif: "book", tier: 1, unit: "resources", rule: count((s) => s.resourcesDone, 5) },

  // ── Secret ───────────────────────────────────────────────────────────────
  { key: "night-moth", name: "Night Moth", description: "Dot saw that. Dot says the draft will keep. Go to bed.", hint: "Submit an application between midnight and 4am.", group: "Secret", secret: true, motif: "moon", tier: 2, rule: flag((s) => s.nightOwl) },
  { key: "speedrun", name: "Any% Speedrun", description: "Five applications in one day. Frame-perfect.", hint: "Submit five applications in a single day.", group: "Secret", secret: true, motif: "star", tier: 2, rule: (s) => [s.maxPerDay, 5] },
  { key: "deadline-daredevil", name: "Deadline Daredevil", description: "Cutting it close is a lifestyle, apparently.", hint: "Submit within 24 hours of a deadline.", group: "Secret", secret: true, motif: "bell", tier: 2, rule: flag((s) => s.deadlineDaredevil) },
  { key: "same-tree-twice", name: "Same Tree Twice", description: "They can't get rid of you. Respectfully.", hint: "Apply to the same company twice.", group: "Secret", secret: true, motif: "acorn", tier: 2, rule: flag((s) => s.sameCompanyTwice) },
  { key: "weekend-warrior", name: "Sunday Scaries, Defeated", description: "Weekend effort. Moss the sloth demands a nap in exchange.", hint: "Submit an application on a weekend.", group: "Secret", secret: true, motif: "moon", tier: 1, rule: flag((s) => s.weekendApp) },
];

/** All 50 achievements as plain, serializable data (safe to pass to Client Components). */
export const ACHIEVEMENTS: AchievementDef[] = ENTRIES.map(({ rule, ...def }) => (void rule, def));

export const ACHIEVEMENT_BY_KEY: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.key, a]));

export type AchievementProgress = { current: number; target: number; unlocked: boolean };

export function evaluateAchievements(stats: GameStats): Record<string, AchievementProgress> {
  const out: Record<string, AchievementProgress> = {};
  for (const e of ENTRIES) {
    const [current, target] = e.rule(stats);
    out[e.key] = { current: Math.min(current, target), target, unlocked: current >= target };
  }
  return out;
}

export function isAchievementKey(key: string): boolean {
  return Object.hasOwn(ACHIEVEMENT_BY_KEY, key);
}
