"use client";

import { Mascot } from "@/components/mascots";
import { GHOST_AFTER_DAYS } from "@/lib/applications/filter";
import type { ApplicationListItem } from "@/lib/applications/types";

import { usePreference } from "./use-preference";

const SNOOZE_DAYS = 7;

/**
 * Suggests (never decides) closing out applications with no update for 30+
 * days. One tap marks them all ghosted; "Keep waiting" hides it for a week.
 */
export function GhostBanner({
  items,
  nowMs,
  onGhostAll,
  onReview,
}: {
  items: ApplicationListItem[];
  nowMs: number;
  onGhostAll: () => void;
  onReview: () => void;
}) {
  const [snoozedUntil, setSnoozedUntil] = usePreference<string>("canopy:apps:ghost-snooze", "0");
  if (items.length === 0 || nowMs < Number(snoozedUntil)) return null;

  const names = items.slice(0, 2).map((i) => i.company);
  const rest = items.length - names.length;
  const who = rest > 0 ? `${names.join(", ")} and ${rest} more` : names.join(" and ");
  const n = items.length;

  return (
    <section aria-label="Ghost check" className="flex animate-rise flex-col gap-4 rounded-3xl border border-line bg-paper-2/70 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Mascot name="tuck" mood="think" className="size-12 shrink-0" />
        <div className="min-w-0">
          <h2 className="font-sans text-[15px] font-semibold tracking-normal">
            Ghost check: {n} {n === 1 ? "application has" : "applications have"} been quiet for {GHOST_AFTER_DAYS}+ days
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {who}. Silence isn&apos;t a verdict — want to close {n === 1 ? "it" : "them"} out, or keep waiting?
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
        <button type="button" onClick={onGhostAll} className="h-11 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-transform active:scale-[0.97]">
          Mark {n === 1 ? "it" : `all ${n}`} ghosted
        </button>
        <button type="button" onClick={onReview} className="h-11 rounded-full border border-line-strong bg-card px-4 text-sm font-medium hover:bg-paper-2">
          Review
        </button>
        <button
          type="button"
          onClick={() => setSnoozedUntil(String(nowMs + SNOOZE_DAYS * 86_400_000))}
          className="h-11 rounded-full px-3 text-sm font-medium text-muted hover:text-ink"
        >
          Keep waiting
        </button>
      </div>
    </section>
  );
}
