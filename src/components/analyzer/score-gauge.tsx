"use client";

import { useEffect, useRef } from "react";

const R = 52;
const CIRC = 2 * Math.PI * R;

function toneFor(score: number, limited: boolean) {
  if (limited) return "var(--sky)";
  if (score >= 70) return "var(--moss)";
  if (score >= 45) return "var(--sun)";
  return "var(--coral)";
}

/**
 * Circular percent gauge. The number renders at its real value immediately;
 * only the ring animates (Web Animations API, skipped for reduced motion).
 */
export function ScoreGauge({
  score,
  limited = false,
  caption,
  center,
  className = "size-40",
}: {
  score: number;
  limited?: boolean;
  caption: string;
  /** Replaces the big percentage (e.g. "5/9" when coverage is limited). */
  center?: string;
  className?: string;
}) {
  const ring = useRef<SVGCircleElement>(null);
  const pct = Math.max(0, Math.min(100, score));
  const offset = CIRC * (1 - pct / 100);

  useEffect(() => {
    const el = ring.current;
    if (!el || typeof el.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anim = el.animate([{ strokeDashoffset: CIRC }, { strokeDashoffset: offset }], {
      duration: 900,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    return () => anim.cancel();
  }, [offset]);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`${center ?? `${pct}%`} ${caption}`}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle
          ref={ring}
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={toneFor(pct, limited)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </svg>
      <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl font-semibold leading-none tabular">
          {center ?? (
            <>
              {pct}
              <span className="text-xl text-ink-soft">%</span>
            </>
          )}
        </span>
        <span className="mt-1 max-w-[7rem] text-[11px] font-medium uppercase leading-tight tracking-[0.12em] text-muted">{caption}</span>
      </div>
    </div>
  );
}
