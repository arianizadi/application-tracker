import type { ApplicationStatus } from "@prisma/client";

/**
 * Short, warm copy for moments in the tracker. Matches the emotional weight of
 * the event; no inspirational speeches.
 */

type Tone = "success" | "info" | "warning" | "celebrate";

export const STATUS_TOAST: Record<ApplicationStatus, { title: string; body: string; tone: Tone }> = {
  WISHLIST: { title: "Saved for later", body: "A place for the possibilities.", tone: "info" },
  APPLIED: { title: "Sent!", body: "The effort is yours, whatever happens next.", tone: "success" },
  ASSESSMENT: { title: "Assessment unlocked", body: "One timer, one afternoon. You've got this.", tone: "success" },
  INTERVIEW: { title: "Interview!", body: "They want to meet the person behind the PDF.", tone: "celebrate" },
  OFFER: { title: "An offer!", body: "Take a moment before the next spreadsheet.", tone: "celebrate" },
  ACCEPTED: { title: "Accepted. You did it.", body: "Every application before this one counted.", tone: "celebrate" },
  REJECTED: { title: "That one hurt", body: "You can take a minute. The tree stays.", tone: "info" },
  GHOSTED: { title: "Moved out of your queue", body: "Silence isn't a verdict. The effort remains.", tone: "info" },
  WITHDRAWN: { title: "Withdrawn", body: "Your priorities get a vote.", tone: "info" },
};

const PLANTED = [
  "Recorded. One less thing to keep in your head.",
  "Another seed in the ground.",
  "Two fields. One saved application. Lovely.",
  "The details can catch up.",
  "Less form. More forward.",
];

/** Rotating quick-add confirmation; `n` is the user's total so milestones get a nod. */
export function plantedMessage(n: number, seed: number): { title: string; body: string; tone: Tone } {
  if (n === 1) return { title: "Your first tree is planted", body: "You don't need a whole plan to take one step.", tone: "celebrate" };
  if (n === 3) return { title: "A small grove is forming", body: "Three applications in. Nice rhythm.", tone: "celebrate" };
  if (n === 10) return { title: "Ten applications!", body: "That is a whole grove situation.", tone: "celebrate" };
  if (n === 25) return { title: "Twenty-five chances planted", body: "Bridge-worthy.", tone: "celebrate" };
  if (n === 50) return { title: "Fifty!", body: "Half a hundred records of showing up.", tone: "celebrate" };
  if (n === 100) return { title: "A hundred applications", body: "A hundred records of showing up.", tone: "celebrate" };
  return { title: "Planted!", body: PLANTED[Math.abs(seed) % PLANTED.length], tone: "success" };
}

/** Empty-column copy for the board. */
export const COLUMN_EMPTY: Partial<Record<ApplicationStatus, string>> = {
  WISHLIST: "A place for the possibilities.",
  APPLIED: "Nothing waiting. Plant one above.",
  ASSESSMENT: "No timers running. Enjoy it.",
  INTERVIEW: "The chairs are ready when you need them.",
  OFFER: "This can wait. Your work is still growing.",
};

export function followUpTemplate({ company, role, appliedOn, contact }: { company: string; role: string; appliedOn?: string; contact?: string | null }) {
  const greeting = contact ? `Hi ${contact.split(" ")[0]},` : "Hi there,";
  const when = appliedOn ? `, submitted on ${appliedOn}` : "";
  return `${greeting}\n\nI'm following up on my application for the ${role} role at ${company}${when}. I'm still very interested and would appreciate any update you can share.\n\nThank you for your time!`;
}
