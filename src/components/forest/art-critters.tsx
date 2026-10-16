/**
 * The forest's residents, drawn small and simple (they live ~30–45 units tall
 * in the scene). Each is anchored at its feet (0,0) and faces right. Colours
 * come from the scene palette (--k-*), so they're lit for the time of day.
 */
import styles from "./forest.module.css";

const INK = "var(--k-ink)";
const CREAM = "var(--k-cream)";

/** Pip the fox. Scarf points the wrong way in the wind, as tradition demands. */
export function Fox() {
  return (
    <g>
      <path d="M-8-4C-26-2-30-18-22-24-18-14-12-10-4-10Z" fill="var(--k-fox)" />
      <path d="M-22-24c-5 4-5 10-2 14 2-4 3-9 2-14Z" fill={CREAM} />
      <path d="M-8 0c-4-10-2-22 8-26 8 4 10 16 8 26Z" fill="var(--k-fox)" />
      <path d="M-3-6c-1-8 1-14 5-16 3 6 3 12 1 16Z" fill={CREAM} />
      <path d="M-7-30c0-8 10-10 14-6l10 6c-5 4-11 6-17 6-4 0-7-2-7-6ZM-5-35l1-10 5 8ZM2-37l4-9 2 10Z" fill="var(--k-fox)" />
      <path d="M17-30a1.6 1.6 0 1 0 .1 0M6-32a1.2 1.2 0 1 0 .1 0" fill={INK} />
      <path d="M-6-24c6 3 12 3 15 0v3c-5 3-11 3-15 0ZM-4-22l-9 5 3 2Z" fill="var(--k-coral)" />
    </g>
  );
}

/** Alder the owl. */
export function Owl() {
  return (
    <g>
      <path d="M-11 0c-3-12-1-26 11-28 12 2 14 16 11 28Z" fill="var(--k-owl)" />
      <ellipse cx="0" cy="-9" rx="7" ry="8" fill="var(--k-owlBelly)" />
      <path d="M-10-24-12-32l7 5ZM10-24l2-8-7 5ZM-11-6c-3-8-1-14 2-16 1 8 1 12-2 16Z" fill="var(--k-trunkDark)" />
      <path d="M-9.5-20a4.5 4.5 0 1 0 .1 0M.5-20a4.5 4.5 0 1 0 .1 0" fill={CREAM} />
      <path d="M-7-20a2 2 0 1 0 .1 0M3-20a2 2 0 1 0 .1 0" fill={INK} />
      <path d="M-1.5-17h3L0-13Z" fill="var(--k-amber)" />
    </g>
  );
}

/** Moss the sloth, napping. Not lazy: strategically recharging. */
export function Sloth({ animate = true }: { animate?: boolean }) {
  return (
    <g>
      <path d="M-22 0c-2-10 8-16 22-15 14-1 22 5 20 15Z" fill="var(--k-sloth)" />
      <circle cx="-20" cy="-9" r="8" fill="var(--k-sloth)" />
      <ellipse cx="-21" cy="-9" rx="6" ry="4.5" fill="var(--k-slothFace)" />
      <path d="M-25-10q2 1.5 4 0M-19-10q2 1.5 4 0M-23-6q2 1.5 4 0" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M-6-2c-2 6 2 8 4 8" stroke="var(--k-sloth)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path
        d="M-14-24h5l-5 5h5M-6-32h4l-4 4h4M1-38h3l-3 3h3"
        stroke={INK}
        strokeWidth="1.3"
        fill="none"
        strokeLinejoin="round"
        className={animate ? styles.zzz : undefined}
      />
    </g>
  );
}

/** Fern the frog. */
export function Frog() {
  return (
    <g>
      <path d="M-12 0c-2-10 4-16 12-16S14-10 12 0Z" fill="var(--k-frog)" />
      <path d="M-10.5-15a4.5 4.5 0 1 0 .1 0M1.5-15a4.5 4.5 0 1 0 .1 0" fill="var(--k-frog)" />
      <path d="M-8.6-16a2.6 2.6 0 1 0 .1 0M3.4-16a2.6 2.6 0 1 0 .1 0" fill={CREAM} />
      <path d="M-7.2-16a1.2 1.2 0 1 0 .1 0M4.8-16a1.2 1.2 0 1 0 .1 0" fill={INK} />
      <path d="M-5-8q5 4 10 0" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-3" rx="7" ry="2.6" fill={CREAM} opacity=".5" />
    </g>
  );
}

/** Nib the beaver, with a pencil that is slightly too large. */
export function Beaver() {
  return (
    <g>
      <path d="M-8-2c-14 2-18-4-16-8 6 2 12 2 16 2Z" fill="var(--k-woodDark)" />
      <path d="M-8 0c-4-12 2-24 12-24 8 2 10 14 6 24Z" fill="var(--k-beaver)" />
      <ellipse cx="3" cy="-9" rx="5" ry="7" fill="var(--k-owlBelly)" />
      <circle cx="6" cy="-26" r="7" fill="var(--k-beaver)" />
      <path d="M9-21h3v4H9Z" fill={CREAM} />
      <path d="M8-28a1.2 1.2 0 1 0 .1 0M13-24a1.4 1.4 0 1 0 .1 0" fill={INK} />
      <path d="M8-6 30-30l3 3L11-3Z" fill="var(--k-sun)" />
      <path d="M30-30l5-5-2 8Z" fill="var(--k-stem)" />
    </g>
  );
}

/** Clover the rabbit. */
export function Rabbit() {
  return (
    <g>
      <ellipse cx="0" cy="-8" rx="10" ry="8" fill="var(--k-rabbit)" />
      <circle cx="8" cy="-16" r="6" fill="var(--k-rabbit)" />
      <path d="M5-20c-2-12 1-16 3-14 1 4 0 10 0 14ZM9-20c1-12 5-15 6-12 0 4-3 9-4 12Z" fill="var(--k-rabbit)" />
      <circle cx="-10" cy="-8" r="3.5" fill={CREAM} />
      <path d="M10-17a1.1 1.1 0 1 0 .1 0" fill={INK} />
      <path d="M14-15a1 1 0 1 0 .1 0" fill="var(--k-coral)" />
    </g>
  );
}

/** Rue the raccoon, keyword detective, carrying a lantern. */
export function Raccoon() {
  return (
    <g>
      <path d="M-8-4c-12 0-16-10-12-16 4 6 8 10 14 10Z" fill="var(--k-raccoon)" />
      <path d="M-18-8l3-3M-20-13l3-2" stroke="var(--k-raccoonDark)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-9 0c-3-12 1-22 9-22s12 10 9 22Z" fill="var(--k-raccoon)" />
      <path d="M-8-24c0-8 16-8 16 0 0 6-16 6-16 0ZM-7-29l1-5 4 3ZM7-29l-1-5-4 3Z" fill="var(--k-raccoon)" />
      <path d="M-8-26c4-2 12-2 16 0v3c-4-1-12-1-16 0Z" fill="var(--k-raccoonDark)" />
      <path d="M-4.7-25a1.2 1.2 0 1 0 .1 0M2.3-25a1.2 1.2 0 1 0 .1 0" fill={CREAM} />
      <path d="M-1-21h2l-1 1.5Z" fill={INK} />
      <path d="M8-12l6-4v4" stroke="var(--k-woodDark)" strokeWidth="1.4" fill="none" />
      <circle cx="14" cy="-6" r="10" fill="var(--f-glow)" className={styles.halo} />
      <path d="M11-11h6v8h-6Z" fill="var(--f-glow)" />
      <path d="M10.5-11h7M10.5-3h7" stroke="var(--k-woodDark)" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

/** Tuck the turtle, keeper of long timelines. */
export function Turtle() {
  return (
    <g>
      <path d="M-11-1a3 2 0 1 0 .1 0M7-1a3 2 0 1 0 .1 0" fill="var(--k-shellHi)" />
      <path d="M12-6c4-6 12-4 11 2-3 2-7 2-11 1Z" fill="var(--k-shellHi)" />
      <path d="M-14-2c0-14 28-14 28 0Z" fill="var(--k-shell)" />
      <path d="M-7-5l3-5h6l3 5" stroke="var(--k-shellHi)" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M19-6a1 1 0 1 0 .1 0" fill={INK} />
    </g>
  );
}

/** Prickle the hedgehog, rejection companion, holding a leaf umbrella. */
export function Hedgehog() {
  return (
    <g>
      <path d="M-14-2-16-8l4-2-1-6h5l2-5 4 3 4-4 2 5 5-2v6l5 2-2 6Z" fill="var(--k-spikes)" />
      <path d="M8-12c4 0 10 4 11 7-3 3-9 4-13 3Z" fill="var(--k-hedgehog)" />
      <path d="M12-9a1.1 1.1 0 1 0 .1 0" fill={INK} />
      <path d="M19-5a1.3 1.3 0 1 0 .1 0" fill={INK} />
      <path d="M6-10 2-26" stroke="var(--k-woodDark)" strokeWidth="1.2" />
      <path d="M-6-25q8-9 16 0-8 3-16 0Z" fill="var(--k-frog)" />
    </g>
  );
}

/** Miso the otter, celebration host, arms up on a rock. */
export function Otter() {
  return (
    <g>
      <path d="M-18 2c-2-10 10-14 20-13 12-1 18 5 16 13Z" fill="var(--k-stone)" />
      <path d="M6-12c6 0 10 2 12 6" stroke="var(--k-otter)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-6-10c-2-10 0-20 6-22 6 2 8 12 6 22Z" fill="var(--k-otter)" />
      <ellipse cx="0" cy="-18" rx="4" ry="7" fill="var(--k-owlBelly)" />
      <circle cx="0" cy="-34" r="6" fill="var(--k-otter)" />
      <ellipse cx="0" cy="-32" rx="4" ry="3" fill="var(--k-owlBelly)" />
      <path d="M-2.5-35a1 1 0 1 0 .1 0M2.5-35a1 1 0 1 0 .1 0M0-32.5a1 1 0 1 0 .1 0" fill={INK} />
      <path d="M-5-24-11-34M5-24l6-10" stroke="var(--k-otter)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Dot the moth, evening desk friend. */
export function Moth({ animate = true }: { animate?: boolean }) {
  return (
    <g>
      <path
        d="M0 0C-8-8-12-2-10 2-8 5-3 3 0 0ZM0 0C8-8 12-2 10 2 8 5 3 3 0 0Z"
        fill="var(--k-moth)"
        className={animate ? styles.flutter : undefined}
      />
      <ellipse cx="0" cy="1" rx="1.6" ry="4" fill="var(--k-sloth)" />
      <path d="M-1-3-3-7M1-3l2-4" stroke="var(--k-sloth)" strokeWidth=".8" />
    </g>
  );
}

/** Acorn the squirrel, archivist of every application. */
export function Squirrel() {
  return (
    <g>
      <path d="M-4-4c-16 0-18-20-8-28 8-6 16 0 12 6-6-2-10 4-6 12Z" fill="var(--k-squirrel)" />
      <path d="M-6 0c-2-10 2-18 8-18 6 2 7 10 5 18Z" fill="var(--k-squirrel)" />
      <ellipse cx="2" cy="-7" rx="3" ry="5" fill="var(--k-owlBelly)" />
      <circle cx="5" cy="-21" r="5.5" fill="var(--k-squirrel)" />
      <path d="M2-25l1-5 3 4Z" fill="var(--k-squirrel)" />
      <path d="M6-22a1 1 0 1 0 .1 0M10-20a.9.9 0 1 0 .1 0" fill={INK} />
      <ellipse cx="9" cy="-11" rx="2.5" ry="3" fill="var(--k-wood)" />
      <path d="M6.5-13h5a2.5 1.6 0 0 0-5 0Z" fill="var(--k-woodDark)" />
    </g>
  );
}

/** A visiting deer: the weekly goal was met. */
export function Deer() {
  return (
    <g>
      <path d="M-14-18-15 0M-9-18-9 0M5-18 6 0M9-19l2 19" stroke="var(--k-deer)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-18-22c0-8 28-8 30 0 0 4-28 6-30 0Z" fill="var(--k-deer)" />
      <path d="M8-26l6-14c2-4 8-4 10-1l-2 3c-3 0-4 2-5 6l-4 10Z" fill="var(--k-deer)" />
      <path d="M17-43l-2-8-3-2M15-51l3-3M20-43l2-8 3-2" stroke="var(--k-woodDark)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M-18-26l-3-2 1 4ZM-8.8-25a1.2 1.2 0 1 0 .1 0M-2.8-26a1.2 1.2 0 1 0 .1 0M3.2-24a1.2 1.2 0 1 0 .1 0" fill={CREAM} />
      <path d="M19.6-40a.9.9 0 1 0 .1 0" fill={INK} />
    </g>
  );
}

/** A small bird in flight (wings only). */
export function Bird({ animate = true }: { animate?: boolean }) {
  return (
    <path
      d="M-8 0Q-4-5 0 0Q4-5 8 0"
      stroke="var(--k-bird)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      className={animate ? styles.flap : undefined}
    />
  );
}
