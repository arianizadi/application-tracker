"use client";

import { useEffect, useRef } from "react";

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A sapling that grows from its ground anchor once on mount (450 ms), then
 * settles. Remount with a new `key` to replay. Decorative.
 */
export function Sprout({ className = "size-6", play = true }: { className?: string; play?: boolean }) {
  const stem = useRef<SVGGElement>(null);
  const leftLeaf = useRef<SVGPathElement>(null);
  const rightLeaf = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!play || reducedMotion()) return;
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const anims = [
      stem.current?.animate(
        [{ transform: "scaleY(0.05)" }, { transform: "scaleY(1.06)", offset: 0.75 }, { transform: "scaleY(1)" }],
        { duration: 450, easing: ease },
      ),
      leftLeaf.current?.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 320, delay: 220, easing: ease, fill: "backwards" }),
      rightLeaf.current?.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 320, delay: 300, easing: ease, fill: "backwards" }),
    ];
    return () => anims.forEach((a) => a?.cancel());
  }, [play]);

  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <ellipse cx="16" cy="28" rx="8" ry="2" fill="var(--bark)" opacity="0.35" />
      <g ref={stem} style={{ transformOrigin: "16px 28px", transformBox: "view-box" }}>
        <path d="M16 28V13" stroke="var(--moss)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path
          ref={leftLeaf}
          d="M16 19c-1-4.5-4.5-6.5-9-6 .3 4.4 3.8 6.8 9 6Z"
          fill="var(--leaf)"
          style={{ transformOrigin: "16px 19px", transformBox: "view-box" }}
        />
        <path
          ref={rightLeaf}
          d="M16 15c.8-4.8 4.3-7.4 9.5-7.2-.3 4.8-4 7.6-9.5 7.2Z"
          fill="var(--moss)"
          style={{ transformOrigin: "16px 15px", transformBox: "view-box" }}
        />
      </g>
    </svg>
  );
}

/** Eight leaves that rise and fade once (offers, interviews). Renders nothing with reduced motion. */
export function LeafBurst({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || reducedMotion()) return;
    const leaves = Array.from(root.querySelectorAll<SVGUseElement>("use"));
    const anims = leaves.map((leaf, i) => {
      const dx = (i - 3.5) * 9;
      return leaf.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: `translate(${dx}px,-35px) rotate(${i % 2 ? 300 : -300}deg)`, opacity: 0 },
        ],
        { duration: 900, delay: i * 30, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
      );
    });
    return () => anims.forEach((a) => a.cancel());
  }, []);

  return (
    <svg ref={ref} viewBox="-50 -50 100 100" aria-hidden className={`pointer-events-none ${className}`}>
      <defs>
        <path id="canopy-burst-leaf" d="M0 -5c3 1 4.5 4 0 9-4.5-5-3-8 0-9Z" />
      </defs>
      {Array.from({ length: 8 }, (_, i) => (
        <use
          key={i}
          href="#canopy-burst-leaf"
          x={0}
          y={10}
          fill={["var(--leaf)", "var(--sun)", "var(--moss)", "var(--berry)"][i % 4]}
          style={{ transformBox: "fill-box", transformOrigin: "center", opacity: 0 }}
        />
      ))}
    </svg>
  );
}
