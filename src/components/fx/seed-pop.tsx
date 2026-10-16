"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "./motion";

/**
 * A tiny sprout that pops up from this spot each time `trigger` changes (never on mount).
 * Drop it inside a button next to the label:
 *   <Button onClick={() => setN(n + 1)}><SeedPop trigger={n} />Save</Button>
 * Zero layout impact (0×0 inline anchor); decorative; skipped under reduced motion.
 */
export function SeedPop({ trigger, className = "" }: { trigger: unknown; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const prev = useRef(trigger);

  useEffect(() => {
    if (Object.is(prev.current, trigger)) return;
    prev.current = trigger;
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof el.animate !== "function") return;
    const a = el.animate(
      [
        { opacity: 0, transform: "translateY(8px) scale(0.2, 0)" },
        { opacity: 1, transform: "translateY(-4px) scale(1.12, 1.15)", offset: 0.32 },
        { opacity: 1, transform: "translateY(-6px) scale(0.96, 0.95)", offset: 0.5 },
        { opacity: 1, transform: "translateY(-10px) scale(1)", offset: 0.78 },
        { opacity: 0, transform: "translateY(-16px) scale(1)" },
      ],
      { duration: 800, easing: "cubic-bezier(.3,.8,.3,1)" },
    );
    return () => a.cancel();
  }, [trigger]);

  return (
    <span aria-hidden className={`pointer-events-none relative inline-block size-0 align-middle ${className}`}>
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        className="absolute -left-3 -top-8 size-6 opacity-0"
        style={{ transformOrigin: "50% 100%" }}
      >
        <path d="M12 23 C12 18 12 15 12 11" fill="none" stroke="var(--moss)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 13 C7 13 4 10 4 6 C9 6 12 9 12 13 Z" fill="var(--leaf)" />
        <path d="M12 11 C12 6 15 3 20 3 C20 8 17 11 12 11 Z" fill="var(--moss)" />
      </svg>
    </span>
  );
}
