// Character data for the Canopy cast. Pure data + helpers; safe on server and client.

export type MascotName =
  | "alder" | "pip" | "moss" | "fern" | "nib" | "clover"
  | "rue" | "tuck" | "prickle" | "miso" | "dot" | "acorn";

export type MascotMood = "idle" | "happy" | "cheer" | "think" | "sleepy" | "comfort";

/** Design-token color a character "owns" (for chips, rings, bubble accents). */
export type MascotAccent = "moss" | "leaf" | "sun" | "coral" | "sky" | "berry" | "bark";

export type MascotInfo = {
  name: string;
  species: string;
  role: string;
  /** One-line personality. */
  personality: string;
  /** When this character shows up in the product. */
  appearsWhen: string;
  accent: MascotAccent;
  /** Short, supportive, funny lines this character says (8+ each). */
  lines: string[];
};

export const MASCOT_NAMES: readonly MascotName[] = [
  "alder", "pip", "moss", "fern", "nib", "clover",
  "rue", "tuck", "prickle", "miso", "dot", "acorn",
] as const;

export const MASCOT_MOODS: readonly MascotMood[] = ["idle", "happy", "cheer", "think", "sleepy", "comfort"] as const;

export const MASCOTS: Record<MascotName, MascotInfo> = {
  alder: {
    name: "Alder",
    species: "owl",
    role: "Practical mentor",
    personality: "Patient, observant, quietly funny. Explains things without pretending to read recruiters' minds.",
    appearsWhen: "Onboarding, stat explanations, the first weekly review, and whenever you ask for a tip.",
    accent: "moss",
    lines: [
      "A small plan beats a large panic.",
      "Let's give Future You fewer tabs.",
      "Your job today is the next step. Just the one.",
      "I brought perspective. And excellent night vision.",
      "That number needs context. Conveniently, I have some.",
      "You can be new at this and still belong here.",
      "Least privilege, maximum rest: only do what today actually requires.",
      "Apply to the role you're 70% qualified for. The other 30% is what internships are for.",
      "Recruiters skim. Put the impressive part at the start of each bullet.",
      "Hoo's applying today? Sorry. Contractually obligated.",
    ],
  },
  pip: {
    name: "Pip",
    species: "fox",
    role: "Interview friend",
    personality: "Excited and genuinely useful, never overwhelming. Thinks you're more ready than you think you are.",
    appearsWhen: "Interview invites, prep checklists, interview-day reminders, and post-interview check-ins.",
    accent: "coral",
    lines: [
      "They want to meet the person behind the PDF.",
      "Interview unlocked. Shoes optional until the camera turns on.",
      "You do not need to become a different person for this.",
      "Let's prep three stories and one good question.",
      "A pause before answering is allowed. I checked.",
      "You showed up. That part is yours.",
      "If they ask about the CIA triad, they mean confidentiality, not spies. Probably.",
      "\"I don't know yet, but here's how I'd find out\" is a genuinely great answer.",
      "Tell them about the homelab. Interviewers love a homelab.",
      "Water nearby, notes off-screen, main-character energy on.",
    ],
  },
  moss: {
    name: "Moss",
    species: "sloth",
    role: "Guardian of breaks",
    personality: "Unhurried, cozy, dryly funny. Shows up because rest is supported, never as punishment.",
    appearsWhen: "Break mode, \"done for today\", coming back after time away, and gentle late-night nudges.",
    accent: "leaf",
    lines: [
      "Rest is a scheduled activity now.",
      "The forest has an excellent unattended mode.",
      "We can pick this up after a sandwich.",
      "Your applications do not need a midnight supervisor.",
      "Welcome back. No explanation required.",
      "A sustainable pace is still a pace.",
      "Burnout is not a prerequisite for this internship.",
      "Logging off is a valid security practice. Ask any session token.",
      "I've been hanging here for hours. Highly recommend.",
    ],
  },
  fern: {
    name: "Fern",
    species: "frog",
    role: "Tiny-step specialist",
    personality: "Cheerful and direct. Delighted by small, manageable beginnings.",
    appearsWhen: "Your first quick-add, first application, the last task of the day, and the first step after a break.",
    accent: "leaf",
    lines: [
      "One hop. That's the whole plan.",
      "Company, role, save. We can decorate later.",
      "This counts even if it took three tries to start.",
      "A small step is suspiciously good at becoming progress.",
      "One application is one more than the blank page had.",
      "We're doing the next tiny thing.",
      "Tiny hop, big ripple. That's just pond physics.",
      "Open the tab. That's it. That's the task. Ribbit.",
      "You don't need momentum to start. Starting makes momentum.",
    ],
  },
  nib: {
    name: "Nib",
    species: "beaver",
    role: "Resume workshop lead",
    personality: "Practical and specific. Firmly opposed to polishing forever.",
    appearsWhen: "Resume uploads, version naming, picking a resume for an application, and version comparisons.",
    accent: "bark",
    lines: [
      "A version name now saves detective work later.",
      "Strong bullet. Could we give it a result?",
      "Built something? Say what changed because of it.",
      "The resume is ready enough to leave the workshop.",
      "We are editing a document, not carving a marble statue.",
      "Let's save this version before the next brilliant tweak.",
      "\"Responsible for\" is doing nothing for you. Try \"built\", \"hardened\", \"automated\".",
      "CTF placements count. So does the home SOC you set up at 2 a.m.",
      "One page. We're building a dam, not a novel.",
      "Numbers make bullets sturdy: \"cut alert noise 40%\" beats \"helped with alerts\".",
    ],
  },
  clover: {
    name: "Clover",
    species: "rabbit",
    role: "Quick-add concierge",
    personality: "Brisk, organized, and determined to keep every form short.",
    appearsWhen: "Quick-add, draft restores, pasting a job link, and whenever optional fields can wait.",
    accent: "berry",
    lines: [
      "Two fields. One saved application. Lovely.",
      "The details can catch up.",
      "I kept your draft warm.",
      "We can turn this tab into a plan.",
      "Less form. More forward.",
      "Paste the link. I'll hold the rest.",
      "Ten seconds. Go! (Nine is also acceptable.)",
      "Speedrunning paperwork is a legitimate skill.",
      "Optional fields are optional. I'm very serious about that.",
    ],
  },
  rue: {
    name: "Rue",
    species: "raccoon",
    role: "Keyword detective",
    personality: "Curious, evidence-driven, and suspicious of impressive-looking percentages.",
    appearsWhen: "Analyzer results, missing-keyword explanations, and when a PDF refuses to give up its text.",
    accent: "sky",
    lines: [
      "I found keywords. I did not find your entire potential.",
      "A match score is a clue, not a hiring decision.",
      "Only add it if you can back it up in an interview.",
      "Different wording, same skill. Classic.",
      "Your resume says \"Wireshark\" zero times. Suspicious.",
      "\"Security+\" and \"Sec+\" are the same cert. I contain multitudes. So does your PDF.",
      "No keyword confetti in the margins, please. White-text tricks are a whole incident.",
      "Found \"SIEM\". Found \"Splunk\". Found... a Comic Sans bullet? Investigating.",
      "Let's investigate the missing category.",
      "I dig through trash for a living. Your resume is not trash. Huge compliment.",
    ],
  },
  tuck: {
    name: "Tuck",
    species: "turtle",
    role: "Keeper of long timelines",
    personality: "Calm and concrete. Never promises a reply, always has a next step.",
    appearsWhen: "Follow-up reminders, long silences, and reviewing applications that are still pending.",
    accent: "moss",
    lines: [
      "Silence gives us limited information.",
      "We can follow up once and keep moving.",
      "Their timeline does not need to become your whole day.",
      "Still waiting is a status. It is not a personal review.",
      "A reminder can hold this thought for you.",
      "Let's put this somewhere you don't have to keep remembering it.",
      "Hiring pipelines have the latency of a dial-up modem. Not your fault.",
      "I once waited six weeks for a reply. Also for a lettuce leaf. Both arrived.",
      "Slow replies are still replies. Ghosts are still data.",
    ],
  },
  prickle: {
    name: "Prickle",
    species: "hedgehog",
    role: "Rejection companion",
    personality: "Warm, candid, and comfortable sitting with disappointment. No forced silver linings.",
    appearsWhen: "When a rejection is recorded, optional reflections, and coming back after a rough update.",
    accent: "coral",
    lines: [
      "That stings. You can just let it sting.",
      "One decision. A whole person remains.",
      "You do not owe this rejection a productivity arc.",
      "The effort stays. So does your place here.",
      "We can close the tab and try again another day.",
      "I brought a mushroom. It has no career advice.",
      "One \"no\" is a single failed login, not an account lockout.",
      "Their loss is tragically under-documented. I'll make a note.",
      "The tree stays. Your grove doesn't shrink.",
    ],
  },
  miso: {
    name: "Miso",
    species: "otter",
    role: "Celebration host",
    personality: "Delighted and grounded. Remembers that good news can still involve choices.",
    appearsWhen: "Offers, interview milestones, comparing offers, and accepting or declining one.",
    accent: "sun",
    lines: [
      "An offer! Please enjoy one full celebratory wiggle.",
      "You get to ask questions, too.",
      "We can celebrate before opening another spreadsheet.",
      "Salary, team, learning, location. Your priorities get a vote.",
      "Declining can also be a good decision.",
      "Someone should tell the pond. It's me. I'm telling the pond.",
      "WE LOVE AN INTERVIEW. We love YOU at an interview.",
      "Access granted. Privileges escalated to: Intern.",
      "Screenshot this moment. For morale. And the group chat.",
    ],
  },
  dot: {
    name: "Dot",
    species: "moth",
    role: "Evening desk friend",
    personality: "Cozy and observant. Quietly protective of your sleep.",
    appearsWhen: "Evening theme, late-night nudges, and saving a draft before you head out.",
    accent: "berry",
    lines: [
      "The draft will still be here tomorrow.",
      "Even excellent tabs can be closed.",
      "You can stop at saved.",
      "A very respectable amount of effort has occurred.",
      "The lamp is on. The pressure is off.",
      "Tomorrow You appreciates the autosave.",
      "Late-night applications are like late-night commits. Review them in daylight.",
      "Recruiters are asleep. Be like recruiters.",
      "I'm drawn to the light. You can be drawn to your pillow.",
    ],
  },
  acorn: {
    name: "Acorn",
    species: "squirrel",
    role: "Progress archivist",
    personality: "Loves concrete progress, tidy records, and tiny rituals.",
    appearsWhen: "Weekly reviews, achievements, application milestones, and exports.",
    accent: "sun",
    lines: [
      "I kept the receipts. They say you did things.",
      "This week had progress in it.",
      "A broken streak does not erase a single application.",
      "Ten applications. That is a whole grove situation.",
      "You remembered less because the tracker remembered more.",
      "Your progress has excellent archival value.",
      "Logged, timestamped, immutable. Your effort has an audit trail.",
      "Stashing this one for winter. By winter I mean your next pep talk.",
      "Every application is an acorn. I have opinions about acorns. All positive.",
    ],
  },
};

/** Which character owns which product moment. */
export const MASCOT_FOR = {
  onboarding: "alder",
  tip: "alder",
  stats: "alder",
  interview: "pip",
  rest: "moss",
  returning: "moss",
  firstStep: "fern",
  resume: "nib",
  quickAdd: "clover",
  draft: "clover",
  analyzer: "rue",
  waiting: "tuck",
  followUp: "tuck",
  rejection: "prickle",
  offer: "miso",
  celebration: "miso",
  lateNight: "dot",
  milestone: "acorn",
  achievement: "acorn",
  weeklyReview: "acorn",
} as const satisfies Record<string, MascotName>;

export type MascotMoment = keyof typeof MASCOT_FOR;

/** Stable 32-bit string hash (FNV-1a). */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministically pick one of a character's lines. Same (name, seed) → same line,
 * so server and client render identically. Use an event count, a date key
 * ("2026-10-16"), or an application id as the seed to rotate dialogue.
 */
export function pickLine(name: MascotName, seed: number | string = 0): string {
  const lines = MASCOTS[name].lines;
  const n = typeof seed === "number" && Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : hash(`${name}:${seed}`);
  return lines[n % lines.length];
}

export function isMascotName(value: unknown): value is MascotName {
  return typeof value === "string" && (MASCOT_NAMES as readonly string[]).includes(value);
}
