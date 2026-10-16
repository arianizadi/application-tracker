/**
 * Milestone landmarks and clearing props, anchored at their base (0,0).
 * Placement lives in scene.tsx.
 */
import styles from "./forest.module.css";

const WOOD = "var(--k-wood)";
const WOOD_DARK = "var(--k-woodDark)";

export function WelcomeSign({ bell }: { bell: boolean }) {
  return (
    <g>
      <path d="M-2-34h4V0h-4Z" fill={WOOD_DARK} />
      <rect x="-22" y="-42" width="44" height="17" rx="3" fill={WOOD} />
      <path d="M-6-33.5q6-6 12 0-6 6-12 0Z" fill={WOOD_DARK} opacity=".55" />
      <path d="M-17-30h6M11-30h6" stroke={WOOD_DARK} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      {bell && (
        <g>
          <path d="M16-25v5" stroke={WOOD_DARK} strokeWidth="1.2" />
          <path d="M11.5-13c0-5 2-7.5 4.5-7.5s4.5 2.5 4.5 7.5Z" fill="var(--k-amber)" />
          <circle cx="16" cy="-12" r="1.4" fill={WOOD_DARK} />
        </g>
      )}
    </g>
  );
}

/** First-visit props: a watering can and a "plant here" bed. */
export function EmptyBed({ animate }: { animate: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="34" ry="6" fill={WOOD_DARK} opacity=".5" />
      <ellipse
        cx="0"
        cy="-1"
        rx="44"
        ry="10"
        fill="none"
        stroke="var(--k-cream)"
        strokeWidth="2"
        strokeDasharray="4 5"
        className={animate ? styles.ring : undefined}
      />
      <path d="M-4-2q4-6 8 0" stroke="var(--k-frog)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g transform="translate(58 6)">
        <path d="M-10 0h18l2-14h-22Z" fill="var(--k-sky)" />
        <path d="M10-10 22-18l1 2-11 10Z" fill="var(--k-sky)" />
        <path d="M-7-14q4-10 12 0" stroke="var(--k-raccoonDark)" strokeWidth="1.6" fill="none" />
        <path d="M23-17l3-2M24-14l4 0" stroke="var(--k-sky)" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Bench({ towel }: { towel: boolean }) {
  return (
    <g>
      <path d="M-20-8v8M20-8v8M-20-20v8M20-20v8" stroke={WOOD_DARK} strokeWidth="4" strokeLinecap="round" />
      <rect x="-27" y="-13" width="54" height="5" rx="2" fill={WOOD} />
      <rect x="-27" y="-24" width="54" height="5" rx="2" fill={WOOD} />
      {towel && (
        <g>
          {/* 42 applications: you know where your towel is. */}
          <path d="M6-13h14v-3H6Z" fill="var(--k-sky)" />
          <path d="M9-16v3M14-16v3" stroke="var(--k-cream)" strokeWidth="1.2" />
        </g>
      )}
    </g>
  );
}

/** Trail gate with ten carved leaves. */
export function Gate() {
  const leaves = Array.from({ length: 10 }, (_, i) => {
    const t = (i + 0.5) / 10;
    const x = -28 + t * 56;
    const y = -46 - Math.sin(t * Math.PI) * 14;
    return `M${x.toFixed(1)} ${y.toFixed(1)}m-2.2 0a2.2 1.4 0 1 0 4.4 0a2.2 1.4 0 1 0-4.4 0`;
  }).join("");
  return (
    <g>
      <path d="M-26 0v-46M26 0v-46" stroke={WOOD_DARK} strokeWidth="5" strokeLinecap="round" />
      <path d="M-31-44Q0-66 31-44" stroke={WOOD} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={leaves} fill="var(--k-frog)" />
    </g>
  );
}

export function Stream({ animate }: { animate: boolean }) {
  return (
    <g>
      <path
        d="M748 440c18 18 40 28 52 44 12 16 38 26 48 36h46c-14-14-48-28-62-42-14-16-40-28-60-38Z"
        fill="var(--f-water)"
      />
      <path
        d="M770 452q8 4 14 2M806 482q8 6 16 6M842 506q6 4 14 4"
        stroke="var(--f-water-hi)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className={animate ? styles.shimmer : undefined}
      />
      <path d="M740 442a5 3 0 1 0 .1 0M786 440a4 2.5 0 1 0 .1 0" fill="var(--k-stone)" />
    </g>
  );
}

export function Bridge() {
  return (
    <g>
      <path d="M-30 2v-10M30 2v-10M-14-6v-10M14-6v-10" stroke={WOOD_DARK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-34 4Q0-18 34 4" stroke={WOOD} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M-34 4Q0-18 34 4" stroke={WOOD_DARK} strokeWidth="7" fill="none" strokeDasharray="1.2 6" opacity=".45" />
      <path d="M-30-6Q0-26 30-6" stroke={WOOD_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Pond({ animate }: { animate: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="80" ry="18" fill="var(--f-water)" />
      <path
        d="M-40-4q10 3 20 0M10 6q12 3 24 0M30-8q8 2 14 0"
        stroke="var(--f-water-hi)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className={animate ? styles.shimmer : undefined}
      />
      <path d="M-34 4a9 3.6 0 1 0 .1 0ZM-6-6a7 3 0 1 0 .1 0Z" fill="var(--k-frog)" />
      <path d="M-30 2l6-1-6-1ZM-3-6l4-1-4-1Z" fill="var(--f-water)" />
      <path d="M-72-2q-2-16 2-26M-66 0q1-14 5-22M-60-2q0-10 2-16" stroke="var(--k-shell)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** 100 applications: a treehouse with a warm window and a chimney. */
export function Treehouse({ animate }: { animate: boolean }) {
  return (
    <g>
      <path d="M-16 0c4-40 4-80 6-122h20c2 42 2 82 6 122Z" fill="var(--k-trunk)" />
      <path
        d="M-70-118c-14-30 10-60 40-56 10-26 60-28 70 2 30-4 46 30 30 54 10 24-20 40-44 30-14 12-48 12-60 0-26 8-50-8-36-30Z"
        fill="var(--c)"
      />
      <path d="M-10-91v86M-2-91v86" stroke="var(--k-stem)" strokeWidth="1.4" />
      <path d="M-10-80h8M-10-66h8M-10-52h8M-10-38h8M-10-24h8M-10-10h8" stroke="var(--k-stem)" strokeWidth="1.4" />
      <rect x="-42" y="-97" width="84" height="6" rx="2" fill={WOOD_DARK} />
      <rect x="-26" y="-126" width="52" height="29" rx="2" fill={WOOD} />
      <path d="M-33-124 0-150l33 26Z" fill="var(--k-coral)" />
      <path d="M14-150h7v-14h-7Z" fill={WOOD_DARK} />
      <rect x="-8" y="-120" width="14" height="12" rx="2" fill="var(--f-window)" />
      <path d="M-1-120v12M-8-114h14" stroke={WOOD_DARK} strokeWidth="1.4" />
      {animate && (
        <g>
          <circle cx="17" cy="-168" r="4" fill="var(--k-cream)" className={styles.smoke} />
          <circle cx="17" cy="-168" r="4" fill="var(--k-cream)" className={styles.smoke} style={{ animationDelay: "1.5s" }} />
          <circle cx="17" cy="-168" r="4" fill="var(--k-cream)" className={styles.smoke} style={{ animationDelay: "3s" }} />
        </g>
      )}
    </g>
  );
}

/** Nib's stump library: one book per resume version (≤6). */
export function StumpLibrary({ books }: { books: number }) {
  const spines = Array.from({ length: books }, (_, i) => {
    const h = 9 + ((i * 7) % 4);
    const x = -11 + i * 3.8;
    return <rect key={i} x={x} y={-22 - h} width="3.4" height={h} rx=".6" fill={`var(--k-ribbon${i})`} />;
  });
  return (
    <g>
      <path d="M-16 0c1-8 1-16 2-22h28c1 6 1 14 2 22Z" fill="var(--k-trunk)" />
      <ellipse cx="0" cy="-22" rx="14" ry="4" fill={WOOD} />
      <ellipse cx="0" cy="-22" rx="7" ry="2" fill="none" stroke={WOOD_DARK} strokeWidth="1" />
      {spines}
    </g>
  );
}

/** A small post lantern (Rue's analyses, and the keepsake picnic lantern). */
export function PostLantern({ tall = false, animate }: { tall?: boolean; animate: boolean }) {
  const h = tall ? 30 : 14;
  return (
    <g>
      <path d={`M0 0v-${h}`} stroke={WOOD_DARK} strokeWidth={tall ? 2.4 : 1.6} />
      <circle cx="0" cy={-h - 4} r={tall ? 16 : 9} fill="var(--f-glow)" className={animate ? styles.glow : styles.halo} />
      <rect x={tall ? -4.5 : -3} y={-h - (tall ? 10 : 7)} width={tall ? 9 : 6} height={tall ? 10 : 7} rx="1.5" fill="var(--f-glow)" />
      <path d={`M${tall ? -5 : -3.5} ${-h - (tall ? 10 : 7)}h${tall ? 10 : 7}`} stroke={WOOD_DARK} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

/** Accepted an offer: bunting across the clearing. */
export function Bunting() {
  const flags: string[][] = [[], [], []];
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const x = 470 + t * 290;
    const y = 428 + Math.sin(t * Math.PI) * 18 - t * 4;
    flags[i % 3].push(`M${(x - 5).toFixed(1)} ${y.toFixed(1)}h10l-5 9Z`);
  }
  return (
    <g>
      <path d="M470 428Q615 466 760 424" stroke="var(--k-stem)" strokeWidth="1.2" fill="none" />
      <path d={flags[0].join("")} fill="var(--k-coral)" />
      <path d={flags[1].join("")} fill="var(--k-sun)" />
      <path d={flags[2].join("")} fill="var(--k-sky)" />
    </g>
  );
}

/** Wishlist nursery planter. Seeds are drawn by the scene (they can be interactive). */
export function Planter() {
  return (
    <g>
      <path d="M-42 0h84l-5-17h-74Z" fill={WOOD} />
      <path d="M-40-7h80" stroke={WOOD_DARK} strokeWidth="1.2" opacity=".5" />
      <path d="M-37-17h74v-3h-74Z" fill={WOOD_DARK} />
    </g>
  );
}

export function SeedPacket({ tone }: { tone: number }) {
  return (
    <g>
      <rect x="-3.5" y="-29" width="7" height="10" rx="1" fill={`var(--k-ribbon${tone % 5})`} />
      <rect x="-3.5" y="-25" width="7" height="2.4" fill="var(--k-cream)" />
      <path d="M0-19v-1" stroke={WOOD_DARK} />
    </g>
  );
}

export function Sprout() {
  return (
    <g>
      <path d="M0-19v-10" stroke="var(--f-meadow-shade)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M0-25c-5-1-8-5-6-8 4 0 6 3 6 8ZM0-27c4-4 8-4 9-1-3 3-6 3-9 1Z" fill="var(--k-frog)" />
    </g>
  );
}

/** 64 applications: a tiny blocky butterfly. The pixels are the whole joke. */
export function PixelButterfly() {
  return <path d="M-6-6h4v4h-4ZM2-6h4v4H2ZM-4-2h3v3h-3ZM1-2h3v3H1ZM-1-5h2v7h-2Z" fill="var(--k-berry)" />;
}
