"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useState } from "react";

import { STATUS_META } from "@/lib/status";

const LABEL_IN_DELAY = "[animation-delay:120ms]";

/**
 * StatusPill for places where the status changes in front of you (detail
 * panel, application cards). When `status` changes, the old label slides up
 * and out while the new one rises in, the dot pops and the colors cross-fade.
 * The first render is static, and width changes instantly (no layout animation).
 * Reduced motion: the global switch collapses this to a color change.
 */
export function LiveStatusPill({ status, className = "" }: { status: ApplicationStatus; className?: string }) {
  // Previous status is kept in state (React's "adjust state while rendering"
  // pattern) so the morph only plays on a real change, never on mount.
  const [shown, setShown] = useState<{ status: ApplicationStatus; prev: ApplicationStatus | null; gen: number }>({
    status,
    prev: null,
    gen: 0,
  });
  if (shown.status !== status) setShown({ status, prev: shown.status, gen: shown.gen + 1 });

  const meta = STATUS_META[status];
  const changed = shown.gen > 0;
  const gen = shown.gen;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-[240ms] ease-out ${meta.pill} ${className}`}
    >
      <span key={`dot-${gen}`} aria-hidden className={`size-1.5 rounded-full ${meta.dot} ${changed ? "animate-dot-pop" : ""}`} />
      <span className="inline-grid">
        {shown.prev ? (
          <span
            key={`out-${gen}`}
            aria-hidden
            onAnimationEnd={() => setShown((s) => (s.gen === gen ? { ...s, prev: null } : s))}
            className="animate-label-out [grid-area:1/1]"
          >
            {STATUS_META[shown.prev].label}
          </span>
        ) : null}
        <span key={`in-${gen}`} className={`[grid-area:1/1] ${changed ? `animate-label-in ${LABEL_IN_DELAY}` : ""}`}>
          {meta.label}
        </span>
      </span>
    </span>
  );
}
