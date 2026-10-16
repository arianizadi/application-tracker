/**
 * Tiny reusable pieces for the forest's ambient life: drifting leaves and
 * petals, grass tufts that catch the wind, meadow flowers. Each is drawn once
 * in <defs> and placed with <use>, so a whole meadow costs a handful of nodes.
 * Anchors: particles are centred on (0,0); tufts stand on (0,0).
 */

/** A falling leaf (~9 × 6). Colour via --lc on the <use>. */
export function Leaf() {
  return <path d="M-4.6 0C-3-3.4 2.4-3.6 4.6 0 2.4 3.6-3 3.4-4.6 0Z M-4.6 0H4" fill="var(--lc)" stroke="var(--lc)" strokeWidth=".6" />;
}

/** A blossom petal (~5 × 6). Colour via --lc on the <use>. */
export function Petal() {
  return <path d="M0-3C2.6-3 2.4 1.2 0 3-2.4 1.2-2.6-3 0-3Z" fill="var(--lc)" />;
}

const BLADES =
  "M-13 0q-1-5-3.5-8M-11 0q0-7 1-10.5M-9 0q1-5 4-7" +
  "M-2 0q-1-6-3-9.5M0 0q0-8 1.2-12.5M2 0q1-6 4-8.5" +
  "M9 0q-1-4-2.5-6.5M11 0q0-6 1-9M13 0q1-4 3-6";

/** Three grass tufts in a little clump (~30 wide), standing on (0,0). */
export function Tufts() {
  return <path d={BLADES} stroke="var(--f-meadow-shade)" strokeWidth="1.6" strokeLinecap="round" fill="none" />;
}

/** A clump with one meadow flower; head colour via --fc. */
export function FlowerTufts() {
  return (
    <g>
      <Tufts />
      <path d="M4 0q1.5-7-1-14.5" stroke="var(--f-meadow-shade)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M3-17.4h0M5.2-15.8h0M4.4-13.3h0M1.6-13.3h0M.8-15.8h0" stroke="var(--fc)" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M3-15.2h0" stroke="var(--k-cream)" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}
