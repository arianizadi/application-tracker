import type { ApplicationStatus } from "@prisma/client";

import { dateToKey, daysBetweenKeys, formatDateKey, shortDuration } from "@/lib/applications/dates";
import { CLOSED_STATUSES } from "@/lib/status";

import { AppIcon } from "./icons";

const chip = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap";

/** "Due in 3d" / "Due today" / "Closed 2d ago" — only while the application is still open. */
export function DeadlineChip({ deadline, status, todayKey }: { deadline: Date | null; status: ApplicationStatus; todayKey: string }) {
  if (!deadline || CLOSED_STATUSES.includes(status)) return null;
  const key = dateToKey(deadline);
  const days = daysBetweenKeys(todayKey, key);
  // Once applied, a passed application deadline stops mattering.
  if (days < 0 && status !== "WISHLIST") return null;
  const tone =
    days < 0 ? "border-line bg-paper-2 text-muted" : days <= 3 ? "border-coral/30 bg-coral-soft text-coral-ink" : days <= 7 ? "border-sun/50 bg-sun-soft text-ink" : "border-line bg-paper-2 text-ink-soft";
  const text = days < 0 ? `Closed ${shortDuration(days)} ago` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${shortDuration(days)}`;
  return (
    <span className={`${chip} ${tone}`} title={`Deadline ${formatDateKey(key, todayKey)}`}>
      <AppIcon name="calendar" className="size-3" />
      {text}
    </span>
  );
}

/** "Follow up today" / "Follow up in 4d" / "Follow-up 3d overdue". */
export function FollowUpChip({ followUpAt, status, todayKey, compact = false }: { followUpAt: Date | null; status: ApplicationStatus; todayKey: string; compact?: boolean }) {
  if (!followUpAt || CLOSED_STATUSES.includes(status)) return null;
  const key = dateToKey(followUpAt);
  const days = daysBetweenKeys(todayKey, key);
  if (compact && days > 7) return null;
  const due = days <= 0;
  const tone = due ? "border-sky/60 bg-sky-soft text-ink" : "border-line bg-paper-2 text-ink-soft";
  const text = days < 0 ? `Follow up · ${shortDuration(days)} late` : days === 0 ? "Follow up today" : `Follow up in ${shortDuration(days)}`;
  return (
    <span className={`${chip} ${tone}`} title={`Follow up on ${formatDateKey(key, todayKey)}`}>
      <AppIcon name="bell" className={`size-3 ${due ? "origin-top animate-wiggle" : ""}`} />
      {text}
    </span>
  );
}

export function WaitingChip({ days }: { days: number }) {
  return (
    <span className={`${chip} border-line bg-paper-2 text-muted`} title={`No update for ${days} days`}>
      Quiet {shortDuration(days)}
    </span>
  );
}
