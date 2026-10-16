import { useId, type CSSProperties, type ReactNode } from "react";

import type { AchievementDef, AchievementGroup, BadgeMotif } from "@/lib/game";

import styles from "./achievement-badge.module.css";

/** Per-group palette: disc fill, motif accent, motif stroke. Tokens only, so dark mode just works. */
const PALETTE: Record<AchievementGroup, { disc: string; accent: string; stroke: string }> = {
  "Getting started": { disc: "var(--moss-soft)", accent: "var(--leaf)", stroke: "var(--ink)" },
  Momentum: { disc: "var(--sun-soft)", accent: "var(--sun)", stroke: "var(--ink)" },
  Resilience: { disc: "var(--coral-soft)", accent: "var(--coral)", stroke: "var(--ink)" },
  Interviews: { disc: "var(--sky-soft)", accent: "var(--sky)", stroke: "var(--ink)" },
  Craft: { disc: "var(--berry-soft)", accent: "var(--berry)", stroke: "var(--ink)" },
  Prep: { disc: "var(--paper-2)", accent: "var(--moss)", stroke: "var(--ink)" },
  Secret: { disc: "var(--ink)", accent: "var(--sun)", stroke: "var(--paper)" },
};

const RIM: Record<1 | 2 | 3, string> = { 1: "var(--bark)", 2: "var(--sun)", 3: "var(--berry)" };

const LEAF = "M0 -4.6C2.6 -2.2 2.6 2.2 0 4.6C-2.6 2.2 -2.6 -2.2 0 -4.6Z";
const LEAF_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

/** Four-point sparkle centered on 0,0. */
const SPARKLE = "M0 -3.6Q.5 -.5 3.6 0Q.5 .5 0 3.6Q-.5 .5 -3.6 0Q-.5 -.5 0 -3.6Z";
/** Fixed spots around the wreath (angle in degrees from 12 o'clock, radius, size). */
const SPARKLES: { a: number; r: number; s: number }[] = [
  { a: -52, r: 32, s: 1.5 },
  { a: 34, r: 33, s: 1.1 },
  { a: 116, r: 31, s: 1.35 },
  { a: 192, r: 33, s: 1 },
  { a: 262, r: 31, s: 1.2 },
];

function motifArt(motif: BadgeMotif, accent: string): ReactNode {
  switch (motif) {
    case "sprout":
      return (
        <>
          <path d="M32 43V31" />
          <path d="M32 35c-6 0-8.5-4.5-7.5-8.5 4 0 7.5 3 7.5 8.5Z" fill={accent} />
          <path d="M32 31c5.5 0 8.5-3.8 7.5-8.5-4.5 0-7.5 3.5-7.5 8.5Z" fill={accent} />
        </>
      );
    case "acorn":
      return (
        <>
          <path d="M32 24v-3" />
          <path d="M25 30c0 7.5 3.8 11.5 7 13 3.2-1.5 7-5.5 7-13Z" fill={accent} />
          <path d="M23 30c0-6 18-6 18 0Z" fill="var(--bark)" />
        </>
      );
    case "tree":
      return (
        <>
          <path d="M32 44v-8" />
          <circle cx="32" cy="29.5" r="9" fill={accent} />
          <path d="M28.5 30.5 32 33l3-3" />
        </>
      );
    case "grove":
      return (
        <>
          <path d="M21.5 41 26 31l4.5 10Z" fill={accent} />
          <path d="M33.5 41 38 31l4.5 10Z" fill={accent} />
          <path d="M26.5 42 32 23l5.5 19Z" fill={accent} />
        </>
      );
    case "mountain":
      return (
        <>
          <circle cx="39.5" cy="24.5" r="3" fill="var(--sun)" />
          <path d="M20.5 41.5 28.5 28l4.5 6.5 3-4 8 11Z" fill={accent} />
        </>
      );
    case "bubble":
      return (
        <>
          <path d="M24 23h16a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H30l-5 4.5V38h-1a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z" fill={accent} />
          <path d="M27.5 30.5h.01M32 30.5h.01M36.5 30.5h.01" strokeWidth={3} />
        </>
      );
    case "scroll":
      return (
        <>
          <rect x="24.5" y="21.5" width="15" height="21" rx="2.5" fill={accent} />
          <path d="M28 27.5h8M28 32h8M28 36.5h5" />
        </>
      );
    case "lantern":
      return (
        <>
          <path d="M29 21.5h6M32 21.5v3" />
          <rect x="25.5" y="24.5" width="13" height="16" rx="3.5" fill={accent} />
          <path d="M32 29c2 2 2 4.5 0 6-2-1.5-2-4 0-6Z" fill="var(--sun)" />
          <path d="M27 42.5h10" />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M35.5 21.5a10.5 10.5 0 1 0 7 17 8.5 8.5 0 0 1-7-17Z" fill={accent} />
          <path d="M23.5 24.5v3M22 26h3" />
        </>
      );
    case "star":
      return (
        <path
          d="M32 21.5 34.7 28.3 41.9 28.9 36.4 33.6 38.1 40.6 32 36.8 25.9 40.6 27.6 33.6 22.1 28.9 29.3 28.3Z"
          fill={accent}
        />
      );
    case "heart":
      return <path d="M32 41.5c-10-7-10-16-4.5-16 2.5 0 4 2 4.5 3.5.5-1.5 2-3.5 4.5-3.5 5.5 0 5.5 9-4.5 16Z" fill={accent} />;
    case "ghost":
      return (
        <>
          <path d="M24 42.5V31a8 8 0 0 1 16 0v11.5l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2Z" fill={accent} />
          <path d="M29 30.5h.01M35 30.5h.01" strokeWidth={3} />
        </>
      );
    case "magnifier":
      return (
        <>
          <circle cx="30" cy="30" r="7" fill={accent} />
          <path d="m35.2 35.2 6 6" strokeWidth={3} />
        </>
      );
    case "bell":
      return (
        <>
          <path d="M24.5 38h15l-2-3v-5a5.5 5.5 0 0 0-11 0v5Z" fill={accent} />
          <path d="M30 41.5a2.2 2.2 0 0 0 4 0M32 22.5v2" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M32 26c-3.5-2.5-7.5-3-10-2v16c2.5-1 6.5-.5 10 2 3.5-2.5 7.5-3 10-2V24c-2.5-1-6.5-.5-10 2Z" fill={accent} />
          <path d="M32 26v16" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M23.5 41c0-11 7.5-18.5 18-18.5 0 10.5-7 18.5-18 18.5Z" fill={accent} />
          <path d="m23.5 41 11-11" />
        </>
      );
    case "rings":
      return (
        <>
          <circle cx="32" cy="32" r="10" fill={accent} />
          <circle cx="32" cy="32" r="6.5" />
          <circle cx="33" cy="31.5" r="3" />
        </>
      );
    case "sun":
      return (
        <>
          <circle cx="32" cy="32" r="5.5" fill={accent} />
          <path d="M32 21.5v3M32 39.5v3M21.5 32h3M39.5 32h3M24.6 24.6l2.1 2.1M37.3 37.3l2.1 2.1M24.6 39.4l2.1-2.1M37.3 26.7l2.1-2.1" />
        </>
      );
    case "shell":
      return (
        <>
          <path d="M21.5 38c0-9 21-9 21 0Z" fill={accent} />
          <path d="M27 38v-5.5l5-3 5 3V38M24 41l1.5-3M40 41l-1.5-3" />
          <circle cx="44.5" cy="35.5" r="2" />
        </>
      );
    case "key":
      return (
        <>
          <circle cx="27" cy="32" r="5" fill={accent} />
          <path d="M32 32h10.5M38.5 32v4M41.5 32v3" />
        </>
      );
  }
}

export function AchievementBadge({
  def,
  unlocked,
  size = 64,
  className = "",
  decorative = false,
  fresh = false,
  delay = 0,
}: {
  def: AchievementDef;
  unlocked: boolean;
  /** Rendered pixel size (square). */
  size?: number;
  className?: string;
  /** Hide from assistive tech when the name is already printed next to it. */
  decorative?: boolean;
  /** Just unlocked: pop, one sheen sweep and a few sparkles (once, ~1.1 s). */
  fresh?: boolean;
  /** Start the fresh moment later (ms), to stagger several badges that unlocked together. */
  delay?: number;
}) {
  const uid = useId();
  const hidden = def.secret && !unlocked;
  const p = PALETTE[def.group];
  const disc = unlocked ? p.disc : "var(--paper-2)";
  const stroke = unlocked ? p.stroke : "var(--line-strong)";
  const accent = unlocked ? p.accent : "var(--line)";
  const label = hidden ? "Secret badge, locked" : `${def.name} badge${unlocked ? "" : ", locked"}`;
  const sparkle = fresh && unlocked;
  const clipId = `${uid}-disc`;
  const sheenId = `${uid}-sheen`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 ${sparkle ? "overflow-visible" : ""} ${unlocked ? "" : "opacity-80"} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      style={sparkle && delay ? ({ "--badge-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      <g className={sparkle ? styles.pop : undefined}>
      {/* Leaf wreath */}
      <g fill={unlocked ? "var(--leaf)" : "var(--line)"}>
        {LEAF_ANGLES.map((a, i) => (
          <path
            key={a}
            d={LEAF}
            transform={`rotate(${a} 32 32) translate(32 5.5) rotate(${i % 2 ? 28 : -28})`}
            fill={unlocked && i % 2 ? "var(--moss)" : undefined}
          />
        ))}
      </g>
      {/* Wooden rim + disc with growth rings */}
      <circle cx="32" cy="32" r="23" fill={unlocked ? RIM[def.tier] : "var(--line-strong)"} />
      <circle cx="32" cy="32" r="20.5" fill={disc} />
      <g fill="none" stroke={unlocked ? p.accent : "var(--line)"} strokeOpacity={0.28} strokeWidth={1}>
        <circle cx="32" cy="32" r="17.5" />
        <circle cx="32.5" cy="31.5" r="14" />
      </g>
      {hidden ? (
        <text x="32" y="38.5" textAnchor="middle" fontSize="18" fontWeight={700} fill="var(--muted)" className="font-display">
          ?
        </text>
      ) : (
        <g fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {motifArt(def.motif, accent)}
        </g>
      )}
      {unlocked && def.tier === 3 ? (
        <path d="M32 6.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.2-2.4 1.2.5-2.6-1.9-1.8 2.6-.4Z" fill="var(--sun)" />
      ) : null}
      {sparkle ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <circle cx="32" cy="32" r="23" />
            </clipPath>
            <linearGradient id={sheenId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Diagonal sheen, 40% of the disc wide, swept across once. */}
          <g clipPath={`url(#${clipId})`} aria-hidden>
            <g transform="rotate(24 32 32)">
              <rect className={styles.sheen} x="20" y="0" width="18" height="64" fill={`url(#${sheenId})`} />
            </g>
          </g>
        </>
      ) : null}
      </g>
      {sparkle
        ? SPARKLES.map((p, i) => {
            const rad = ((p.a - 90) * Math.PI) / 180;
            const x = 32 + Math.cos(rad) * p.r;
            const y = 32 + Math.sin(rad) * p.r;
            return (
              <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${p.s})`}>
                <path d={SPARKLE} fill={i % 2 ? "var(--sun)" : "var(--leaf)"} className={styles.sparkle} style={{ "--i": i } as CSSProperties} />
              </g>
            );
          })
        : null}
    </svg>
  );
}
