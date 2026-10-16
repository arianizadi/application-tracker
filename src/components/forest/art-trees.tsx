/**
 * Hand-authored tree art. Every shape is anchored at the base of the trunk
 * (0,0) and grows upward (negative y); a mature tree is ~120 units tall.
 * Colours come from CSS custom properties: --c (canopy), --s (canopy shade)
 * and the scene palette (--k-*, --f-*), so one <use> per tree is enough.
 */

import styles from "./forest.module.css";

const SHADE = "var(--s)";
const CANOPY = "var(--c)";
const TRUNK = "var(--k-trunk)";

export function Oak() {
  return (
    <g>
      <path d="M-6 0C-5-14-4-30-3-46h6c1 16 2 32 3 46Z" fill={TRUNK} />
      <path d="M-1-32-13-48M1-36 11-52" stroke={TRUNK} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M-40-58C-48-80-30-100-14-98-8-116 18-118 26-100 44-100 50-78 42-62 46-46 30-36 16-42 6-34-10-34-18-42-34-38-46-46-40-58Z"
        fill={CANOPY}
      />
      <path d="M42-62C46-46 30-36 16-42 6-34-10-34-18-42-6-46 10-48 22-58 30-64 38-66 42-62Z" fill={SHADE} />
      <path d="M-22-76q4-4 8 0M4-90q4-4 8 0M14-66q4-4 8 0M-30-58q3-3 6 0" stroke={SHADE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M-14-98C-8-116 18-118 26-100 16-104 4-101-3-106-6-100-10-98-14-98Z" fill="var(--f-cap)" />
      <path d="M-24-70a3 3 0 1 0 .1 0M0-98a3 3 0 1 0 .1 0M28-80a3 3 0 1 0 .1 0M10-60a2.5 2.5 0 1 0 .1 0" fill="var(--f-dots)" />
    </g>
  );
}

export function Pine() {
  return (
    <g>
      <path d="M-4 0-3-22h6l1 22Z" fill={TRUNK} />
      <path d="M0-62 34-18Q0-10-34-18ZM0-88 28-46Q0-38-28-46ZM0-120 20-72Q0-66-20-72Z" fill={CANOPY} />
      <path d="M0-62 34-18Q17-14 0-14ZM0-88 28-46Q14-42 0-42ZM0-120 20-72Q10-69 0-69Z" fill={SHADE} />
      <path d="M0-120 8-102Q0-99-8-102ZM0-88 10-74Q0-71-10-74ZM0-62 11-48Q0-45-11-48Z" fill="var(--f-cap)" />
      <path d="M-14-30a2.5 2.5 0 1 0 .1 0M12-56a2.5 2.5 0 1 0 .1 0M-6-84a2.5 2.5 0 1 0 .1 0" fill="var(--f-dots)" />
    </g>
  );
}

export function Birch() {
  return (
    <g>
      <path d="M-4 0-3-72h6l1 72Z" fill="var(--k-birch)" />
      <path d="M-4-12h4M1-26h3M-3-40h4M0-54h3" stroke="var(--k-ink)" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <path d="M0-124C22-114 30-86 26-64 22-44-22-44-26-64-30-86-22-114 0-124Z" fill={CANOPY} />
      <path d="M0-124C22-114 30-86 26-64 22-50 8-46 0-46 10-62 12-98 0-124Z" fill={SHADE} />
      <path d="M-12-90q3-3 6 0M-14-66q3-3 6 0M8-78q3-3 6 0" stroke={SHADE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M0-124C12-119 18-110 21-102 12-106-12-106-21-102-18-110-12-119 0-124Z" fill="var(--f-cap)" />
      <path d="M-12-74a2.5 2.5 0 1 0 .1 0M6-100a2.5 2.5 0 1 0 .1 0M14-62a2.5 2.5 0 1 0 .1 0" fill="var(--f-dots)" />
    </g>
  );
}

export function Maple() {
  return (
    <g>
      <path d="M-6 0C-5-16-4-26-10-40l6-2c3 8 4 12 5 6l3-10 5 2C5-30 5-16 6 0Z" fill={TRUNK} />
      <path
        d="M-52-56C-60-74-40-88-24-84-18-100 10-104 22-90 38-96 58-84 52-66 62-56 50-40 34-44 22-36 2-38-6-44-20-38-40-38-44-46-52-46-56-50-52-56Z"
        fill={CANOPY}
      />
      <path d="M52-66C62-56 50-40 34-44 22-36 2-38-6-44 6-50 22-50 34-58 42-64 48-68 52-66Z" fill={SHADE} />
      <path d="M-34-62q4-4 8 0M-6-80q4-4 8 0M20-70q4-4 8 0" stroke={SHADE} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M-24-84C-18-100 10-104 22-90 12-92 0-90-8-94-14-88-20-86-24-84Z" fill="var(--f-cap)" />
      <path d="M-36-58a3 3 0 1 0 .1 0M-10-88a3 3 0 1 0 .1 0M30-76a3 3 0 1 0 .1 0M8-56a2.5 2.5 0 1 0 .1 0" fill="var(--f-dots)" />
    </g>
  );
}

export function Sapling() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="10" ry="2.6" fill="var(--k-woodDark)" opacity=".45" />
      <path d="M0 0C0-9-1-17 0-27M-5 0q5-3 10 0" stroke={TRUNK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M0-24C-3-33-12-38-17-34-16-27-8-23 0-24Z" fill={CANOPY} />
      <path d="M0-24C3-33 12-38 17-34 16-27 8-23 0-24Z" fill={SHADE} />
      <path d="M0-26C-3-31-2-37 0-39 2-37 3-31 0-26Z" fill={CANOPY} />
    </g>
  );
}

/** Amber buds: an assessment is in progress. */
export function Buds() {
  return (
    <g>
      <path d="M-18-74a4.5 4.5 0 1 0 .1 0M12-94a4.5 4.5 0 1 0 .1 0M22-62a4.5 4.5 0 1 0 .1 0" fill="var(--k-amber)" />
      <path d="M-19-76a1.4 1.4 0 1 0 .1 0M11-96a1.4 1.4 0 1 0 .1 0M21-64a1.4 1.4 0 1 0 .1 0" fill="var(--k-cream)" />
    </g>
  );
}

/** Where the five interview blossoms sit on a mature canopy (tree-local units). */
export const BLOSSOM_SPOTS: readonly (readonly [number, number])[] = [
  [-26, -68],
  [-6, -96],
  [18, -84],
  [26, -58],
  [0, -62],
];

/** One lavender blossom centred on (0,0). The scene places five per tree so each can open on its own beat. */
export function Flower() {
  return (
    <g>
      <path d="M-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0" fill="var(--k-lavender)" />
      <path d="M-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0" fill="var(--k-cream)" />
    </g>
  );
}

/** Five lavender blossoms: interviewing. */
export function Blossoms() {
  const petals = BLOSSOM_SPOTS.map(([x, y]) => `M${x - 5} ${y}a5 5 0 1 0 10 0a5 5 0 1 0-10 0`).join("");
  const centres = BLOSSOM_SPOTS.map(([x, y]) => `M${x - 1.8} ${y}a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0`).join("");
  return (
    <g>
      <path d={petals} fill="var(--k-lavender)" />
      <path d={centres} fill="var(--k-cream)" />
    </g>
  );
}

/** The lantern's warm halo on its own, so the scene can light it separately. */
export function LanternHalo() {
  return <circle cx="24" cy="-42" r="18" fill="var(--f-glow)" />;
}

/** The hanging lantern without its halo. */
export function LanternBody() {
  return (
    <g>
      <path d="M24-62v12" stroke="var(--k-woodDark)" strokeWidth="1.5" />
      <path d="M19-50h10l2 4v10l-2 3H19l-2-3v-10Z" fill="var(--f-glow)" />
      <path d="M18-50h12M18-33h12" stroke="var(--k-woodDark)" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/** A warm lantern hanging from a branch: an offer. */
export function Lantern() {
  return (
    <g>
      <path d="M24-62v12" stroke="var(--k-woodDark)" strokeWidth="1.5" />
      <circle cx="24" cy="-42" r="18" fill="var(--f-glow)" className={styles.halo} />
      <path d="M19-50h10l2 4v10l-2 3H19l-2-3v-10Z" fill="var(--f-glow)" />
      <path d="M18-50h12M18-33h12" stroke="var(--k-woodDark)" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Pennant() {
  return (
    <>
      <path d="M0-112v-30" stroke="var(--k-woodDark)" strokeWidth="2" strokeLinecap="round" />
      <path d="M1-142 22-135 1-128Z" fill="var(--k-coral)" />
      <path d="M-30-104l3-6 3 6-3 6ZM34-96l2-4 2 4-2 4ZM-40-76l2-4 2 4-2 4Z" fill="var(--f-glow)" />
    </>
  );
}

/** Accepted, without the halo (the scene lights that separately). */
export function CrownBody() {
  return (
    <g>
      <LanternBody />
      <Pennant />
    </g>
  );
}

/** Accepted: lantern plus a celebratory pennant on top. */
export function Crown() {
  return (
    <g>
      <Lantern />
      <Pennant />
    </g>
  );
}

/** Resume ribbon tied around the trunk; colour via --rb. */
export function Ribbon() {
  return (
    <g>
      <path d="M-6-18h12v5H-6Z" fill="var(--rb)" />
      <path d="M2-13l-3 9 4-2 1 3 2-9Z" fill="var(--rb)" />
    </g>
  );
}

/** Rejection compost: mushrooms + leaf litter + a fresh sprout. Four shapes. */
export function Compost({ shape }: { shape: 0 | 1 | 2 | 3 }) {
  return (
    <g>
      <CompostBed shape={shape} />
      <CompostSprout />
    </g>
  );
}

/** The sprout that compost feeds ("rejections are fertilizer"); grows on its own beat. */
export function CompostSprout() {
  return (
    <g>
      <path d="M-10 0v-6" stroke="var(--f-meadow-shade)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-10-5c-4-1-6-4-5-6 3 0 5 2 5 6ZM-10-6c3-3 6-3 7-1-2 2-4 2-7 1Z" fill="var(--k-frog)" />
    </g>
  );
}

/** Mushrooms and leaf litter, without the sprout. */
export function CompostBed({ shape }: { shape: 0 | 1 | 2 | 3 }) {
  return (
    <g>
      <ellipse cx="8" cy="0" rx="22" ry="3.2" fill="var(--k-woodDark)" opacity=".4" />
      {shape === 0 && (
        // button mushrooms
        <>
          <path d="M11 0v-6h4v6ZM21 0v-4h3v4Z" fill="var(--k-stem)" />
          <path d="M7-5a6 5 0 0 1 12 0ZM18-3.5a4 3.5 0 0 1 8.5 0Z" fill="var(--k-mushroom)" />
          <path d="M11-7.5a1 1 0 1 0 .1 0M15-8a1 1 0 1 0 .1 0M21.5-5a.8.8 0 1 0 .1 0" fill="var(--k-cream)" />
        </>
      )}
      {shape === 1 && (
        // shelf fungi on a little stump of compost
        <>
          <path d="M8 0c0-6 1-10 4-12h6c2 3 2 7 2 12Z" fill="var(--k-trunk)" />
          <path d="M18-9h7a3.5 2.5 0 0 1-7 0ZM18-4h9a4.5 3 0 0 1-9 0Z" fill="var(--k-mushroom2)" />
        </>
      )}
      {shape === 2 && (
        // inkcaps
        <>
          <path d="M12 0v-6h2v6ZM20 0v-4h2v4Z" fill="var(--k-stem)" />
          <path d="M9.5-5c0-6 2-9 3.5-9s3.5 3 3.5 9ZM18-3c0-4 1.5-7 3-7s3 3 3 7Z" fill="var(--k-stem)" />
          <path d="M9.5-5h7M18-3h6" stroke="var(--k-raccoonDark)" strokeWidth="1.2" />
        </>
      )}
      {shape === 3 && (
        // chanterelles
        <>
          <path d="M10-8c2 2 3 5 3 8h2c0-3 1-6 3-8ZM19-5c1 1 2 3 2 5h2c0-2 1-4 2-5Z" fill="var(--k-mushroom2)" />
        </>
      )}
      <path d="M2 0l3-2 2 2ZM28 0l2-2 3 2Z" fill="var(--k-amber)" opacity=".8" />
    </g>
  );
}

/** Soft ghosting fog that hugs the ground. Opacity is set per tree. */
export function Fog() {
  return (
    <g>
      <ellipse cx="0" cy="-6" rx="38" ry="8" fill="var(--f-mist)" />
      <ellipse cx="12" cy="-16" rx="22" ry="5" fill="var(--f-mist)" />
    </g>
  );
}

/** A friendly, mildly confused ghost with leaf ears, peeking from behind the trunk. */
export function Ghost() {
  return (
    <g>
      <path d="M6-16c0-14 18-14 18 0v14l-3-3-3 3-3-3-3 3-3-3-3 3Z" fill="#ffffff" opacity=".92" />
      <path d="M9-26c-3-4-2-7 1-7 1 2 1 4-1 7ZM21-26c3-4 2-7-1-7-1 2-1 4 1 7Z" fill="var(--k-frog)" />
      <path d="M11.5-17a1.4 1.6 0 1 0 .1 0M17.5-17.5a1.4 1.6 0 1 0 .1 0" fill="var(--k-ink)" />
      <path d="M13-11q2-1.5 4 0" stroke="var(--k-ink)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Withdrawn: a mossy fallen log. Small life keeps going on it. */
export function Log() {
  return (
    <g>
      <ellipse cx="-2" cy="0" rx="40" ry="3" fill="var(--k-woodDark)" opacity=".35" />
      <path d="M-34-1h60a7 8 0 0 0 0-16h-60a7 8 0 0 0 0 16Z" fill="var(--k-wood)" />
      <ellipse cx="26" cy="-9" rx="6" ry="8" fill="var(--k-stem)" />
      <path d="M26-13a3 4 0 1 0 .1 0" stroke="var(--k-wood)" strokeWidth="1.2" fill="none" />
      <path d="M-34-16c6-6 14-5 20-1 6-5 14-4 18 1Z" fill="var(--f-meadow)" />
      <path d="M-20-10h14M-6-6h12" stroke="var(--k-woodDark)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8-17v-6" stroke="var(--f-meadow-shade)" strokeWidth="1.5" />
      <path d="M8-22c-3-1-5-3-4-5 2 0 4 2 4 5ZM8-23c2-2 5-2 5 0-1 1-3 1-5 0Z" fill="var(--k-frog)" />
    </g>
  );
}

export const SPECIES_ART = { oak: Oak, pine: Pine, birch: Birch, maple: Maple } as const;
