import type { CSSProperties } from "react";

import { Mascot } from "@/components/mascots";

import styles from "./art.module.css";

/**
 * An empty planting bed: a soil mound with one sprout, a blank plant marker
 * waiting for a company name, a dashed "plant here" ring, and a watering can
 * that tips every so often. Decorative; ~20 SVG nodes, no defs.
 */
export function PlantingBed({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 184 116" className={`${styles.bed} ${className}`} aria-hidden focusable="false">
      {/* ground shadow */}
      <ellipse cx="96" cy="106" rx="82" ry="7" fill="var(--line)" opacity=".75" />

      {/* "plant here" ring, behind the mound */}
      <g className={styles.ring}>
        <ellipse cx="82" cy="99" rx="50" ry="10.5" fill="none" stroke="var(--moss)" strokeWidth="1.6" strokeDasharray="3 5" strokeLinecap="round" />
      </g>

      {/* soil mound */}
      <path d="M36 105c5-13 22-19 46-19s41 6 46 19Z" fill="var(--soil)" />
      <path d="M50 93c9-4 20-6 32-6s23 2 32 6c-9-2-20-3-32-3s-23 1-32 3Z" fill="var(--soil-hi)" opacity=".7" />
      <path d="M58 99h4M97 95.5h5M73 102h3M110 101h4M84 98.5h2" stroke="var(--soil-d)" strokeWidth="1.6" strokeLinecap="round" />

      {/* blank plant marker */}
      <path d="M55 104V80" stroke="var(--stake)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="43.5" y="69" width="23" height="13.5" rx="2.5" fill="var(--card)" stroke="var(--line-strong)" strokeWidth="1.2" />
      <path d="M48.5 75.75h13" stroke="var(--line-strong)" strokeWidth="1.2" strokeDasharray="2 2.5" strokeLinecap="round" />

      {/* the sprout */}
      <g className={styles.sprout}>
        <path d="M84 88.5c0-5 .2-9 1.2-13" stroke="var(--moss)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M84.6 79.5c-2.6-6-9.6-8.4-14-5.4 2 6.2 9 8.4 14 5.4Z" fill="var(--leaf)" />
        <path d="M85.4 76.2c2-7.2 10-10.4 15.4-7.4-1.8 7-10 9.6-15.4 7.4Z" fill="var(--leaf)" />
        <path d="M84 78.6c-3-1.6-6-2.6-9-3M86.4 75.4c3-2 6.4-3.6 10-4.2" stroke="var(--moss)" strokeWidth=".9" fill="none" strokeLinecap="round" opacity=".45" />
      </g>

      {/* droplets fall from where the rose ends up when the can is tipped */}
      <g fill="var(--drop)">
        {[
          [98.5, 82.5, 0],
          [101.5, 84, 90],
          [96, 85, 180],
        ].map(([x, y, d]) => (
          <path key={d} className={styles.drop} style={{ "--d": `${d}ms` } as CSSProperties} d={`M${x} ${y - 2.4}c1 1.4 1.5 2.2 1.5 2.9a1.5 1.5 0 0 1-3 0c0-.7.5-1.5 1.5-2.9Z`} />
        ))}
      </g>

      {/* watering can: pivots on its front heel */}
      <g className={styles.can}>
        <path d="M135 90 110 70.6l-2.4 3.2L134 99Z" fill="var(--can)" />
        <path d="M105.4 70.2l5.6-3.6 1.8 2.6-5.6 3.6Z" fill="var(--can-d)" />
        <path d="M165 85c10.5 0 10.5 15 0 15" stroke="var(--can-d)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M138 79c4-10.5 20-10.5 24 0" stroke="var(--can-d)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M134 104h29l3-24h-35Z" fill="var(--can)" />
        <rect x="129.5" y="77" width="38" height="5" rx="2.5" fill="var(--can-d)" />
        <path d="M139 86v13" stroke="var(--can-hi)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Fern beside the empty bed: the "every forest starts somewhere" moment. */
export function FirstPlanting({ title, className = "" }: { title?: string; className?: string }) {
  return (
    <div className={`flex items-end ${className}`}>
      <Mascot name="fern" mood="happy" enter className="relative z-10 -mr-5 size-24 sm:-mr-6 sm:size-28" title={title} />
      <PlantingBed className={`${styles.fadeIn} w-44 sm:w-52`} />
    </div>
  );
}
