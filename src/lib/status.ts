import type { ApplicationStatus } from "@prisma/client";

export const STATUSES: ApplicationStatus[] = [
  "WISHLIST", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED", "GHOSTED", "WITHDRAWN",
];

/** Pipeline order for boards and funnels (closed states last). */
export const ACTIVE_STATUSES: ApplicationStatus[] = ["WISHLIST", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER"];
export const CLOSED_STATUSES: ApplicationStatus[] = ["ACCEPTED", "REJECTED", "GHOSTED", "WITHDRAWN"];

/** Statuses that mean a company responded with something other than silence. */
export const RESPONDED: ApplicationStatus[] = ["ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"];
/** Statuses that reached a real conversation with a human. */
export const REACHED_INTERVIEW: ApplicationStatus[] = ["INTERVIEW", "OFFER", "ACCEPTED"];

export const STATUS_META: Record<ApplicationStatus, { label: string; short: string; hint: string; pill: string; dot: string; color: string }> = {
  WISHLIST: { label: "Wishlist", short: "Wish", hint: "Saved to apply later", pill: "bg-paper-2 text-ink-soft border-line-strong", dot: "bg-muted", color: "var(--muted)" },
  APPLIED: { label: "Applied", short: "Applied", hint: "Submitted and planted", pill: "bg-moss-soft text-moss-strong border-moss/30", dot: "bg-moss", color: "var(--moss)" },
  ASSESSMENT: { label: "Assessment", short: "OA", hint: "Online assessment or take-home", pill: "bg-sky-soft text-ink border-sky/50", dot: "bg-sky", color: "var(--sky)" },
  INTERVIEW: { label: "Interviewing", short: "Interview", hint: "Talking to humans", pill: "bg-sun-soft text-ink border-sun/60", dot: "bg-sun", color: "var(--sun)" },
  OFFER: { label: "Offer", short: "Offer", hint: "They want you!", pill: "bg-berry-soft text-berry border-berry/40", dot: "bg-berry", color: "var(--berry)" },
  ACCEPTED: { label: "Accepted", short: "Accepted", hint: "Signed and celebrated", pill: "bg-berry text-white border-berry", dot: "bg-berry", color: "var(--berry)" },
  REJECTED: { label: "Rejected", short: "No", hint: "Compost for the next one", pill: "bg-coral-soft text-coral border-coral/30", dot: "bg-coral", color: "var(--coral)" },
  GHOSTED: { label: "Ghosted", short: "Ghosted", hint: "No reply in a long while", pill: "bg-paper-2 text-muted border-line", dot: "bg-line-strong", color: "var(--line-strong)" },
  WITHDRAWN: { label: "Withdrawn", short: "Withdrew", hint: "You chose to step away", pill: "bg-paper-2 text-muted border-line", dot: "bg-muted", color: "var(--muted)" },
};

export function isStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}
