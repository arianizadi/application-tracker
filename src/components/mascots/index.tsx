// CONTRACT STUB — replaced by the mascots implementation. Keep these exports and prop types stable.
export type MascotName =
  | "alder" | "pip" | "moss" | "fern" | "nib" | "clover"
  | "rue" | "tuck" | "prickle" | "miso" | "dot" | "acorn";

export type MascotMood = "idle" | "happy" | "cheer" | "think" | "sleepy" | "comfort";

export type MascotInfo = {
  name: string;
  species: string;
  role: string;
  /** Short, supportive, funny lines this character says. */
  lines: string[];
};

export const MASCOTS: Record<MascotName, MascotInfo> = {
  alder: { name: "Alder", species: "owl", role: "Practical mentor", lines: ["One good application beats five rushed ones."] },
  pip: { name: "Pip", species: "fox", role: "Interview friend", lines: ["Interviews are just conversations with snacks missing."] },
  moss: { name: "Moss", species: "sloth", role: "Guardian of breaks", lines: ["Rest is part of the plan."] },
  fern: { name: "Fern", species: "frog", role: "Tiny-step specialist", lines: ["Just one tiny hop today."] },
  nib: { name: "Nib", species: "beaver", role: "Resume workshop lead", lines: ["Let's build a sturdier resume."] },
  clover: { name: "Clover", species: "rabbit", role: "Quick-add concierge", lines: ["Ten seconds. Go!"] },
  rue: { name: "Rue", species: "raccoon", role: "Keyword detective", lines: ["I found some shiny keywords."] },
  tuck: { name: "Tuck", species: "turtle", role: "Keeper of long timelines", lines: ["Slow replies are still replies."] },
  prickle: { name: "Prickle", species: "hedgehog", role: "Rejection companion", lines: ["That one stung. You're still growing."] },
  miso: { name: "Miso", species: "otter", role: "Celebration host", lines: ["WE LOVE AN INTERVIEW!"] },
  dot: { name: "Dot", species: "moth", role: "Evening desk friend", lines: ["Late night? Save it and sleep."] },
  acorn: { name: "Acorn", species: "squirrel", role: "Progress archivist", lines: ["Filed it. Every one counts."] },
};

export function Mascot({
  name,
  mood = "idle",
  className = "size-24",
  animate = true,
  title,
}: {
  name: MascotName;
  mood?: MascotMood;
  className?: string;
  animate?: boolean;
  /** Accessible label; decorative (aria-hidden) when omitted. */
  title?: string;
}) {
  void mood;
  void animate;
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <circle cx="50" cy="55" r="35" fill="var(--bark)" />
      <text x="50" y="62" textAnchor="middle" fontSize="22" fill="var(--paper)">{MASCOTS[name].name[0]}</text>
    </svg>
  );
}
