// <Mascot/>: renders one character. Server-compatible (no hooks).
import type { CSSProperties, ReactNode } from "react";

import { Acorn } from "./characters/acorn";
import { Alder } from "./characters/alder";
import { Clover } from "./characters/clover";
import { Dot } from "./characters/dot";
import { Fern } from "./characters/fern";
import { Miso } from "./characters/miso";
import { Moss } from "./characters/moss";
import { Nib } from "./characters/nib";
import { Pip } from "./characters/pip";
import { Prickle } from "./characters/prickle";
import { Rue } from "./characters/rue";
import { Tuck } from "./characters/tuck";
import type { MascotMood, MascotName } from "./data";
import type { CharacterProps } from "./parts";
import { MascotStyles } from "./styles";

const CHARACTERS: Record<MascotName, (props: CharacterProps) => ReactNode> = {
  alder: Alder,
  pip: Pip,
  moss: Moss,
  fern: Fern,
  nib: Nib,
  clover: Clover,
  rue: Rue,
  tuck: Tuck,
  prickle: Prickle,
  miso: Miso,
  dot: Dot,
  acorn: Acorn,
};

// Per-character blink periods (s): a prime-ish table so a row of mascots never blinks in
// unison and no two characters share a rhythm. Every other idle loop derives from this.
const BLINK: Record<MascotName, number> = {
  alder: 6.7, pip: 4.3, moss: 9.1, fern: 5.9, nib: 7.3, clover: 4.7,
  rue: 8.3, tuck: 10.1, prickle: 5.3, miso: 4.9, dot: 6.1, acorn: 7.9,
};
/** The lively ones sometimes double-blink. */
const DOUBLE: ReadonlySet<MascotName> = new Set(["pip", "clover", "miso"]);

/** Stable 0..1 from a string (FNV-1a). Same on server and client, so hydration-safe. */
function unit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Negative delays (mid-cycle on first paint), each loop with its own phase. */
function timing(name: MascotName, seed: string | number | undefined): CSSProperties {
  const k = BLINK[name] ?? 6.1;
  const id = `${name}:${seed ?? ""}`;
  const d = (salt: string, period: number) => `${(-unit(id + salt) * period).toFixed(2)}s`;
  return {
    "--cm-k": `${k}s`,
    "--cm-db": d("b", k),
    "--cm-dr": d("r", k * 0.72),
    "--cm-de": d("e", k * 1.53),
    "--cm-dt": d("t", Math.min(6, Math.max(3.2, k * 0.71))),
  } as CSSProperties;
}

/**
 * A hand-drawn character (viewBox 120×120). Size it with `className` (default `size-24`).
 *
 * - `animate`: `true` = subtle idle motion (blink, breathe, ear/tail/wing); `"hover"` = still
 *   until hovered, or until an ancestor `.group` is hovered/focused (use this in grids so a
 *   page never runs more than a few mascots at once); `false` = still.
 *   Always still under prefers-reduced-motion. MotionGate pauses offscreen ones.
 * - `enter`: a one-time 520 ms entrance hop when it first appears (fade under reduced motion).
 * - `react`: play a 240 ms squash whenever `mood` changes (for client-side mood swaps).
 * - `seed`: varies the idle phases when the same character appears more than once.
 *
 * Decorative (aria-hidden) unless `title` is given.
 */
export function Mascot({
  name,
  mood = "idle",
  className = "size-24",
  animate = true,
  enter = false,
  react = false,
  seed,
  title,
}: {
  name: MascotName;
  mood?: MascotMood;
  className?: string;
  animate?: boolean | "hover";
  enter?: boolean;
  react?: boolean;
  seed?: string | number;
  /** Accessible label; decorative (aria-hidden) when omitted. */
  title?: string;
}) {
  const Character = CHARACTERS[name] ?? Alder;
  const mode = animate === "hover" ? " cm-hov" : animate ? " cm-anim" : "";
  const extra = `${DOUBLE.has(name) ? " cm-dbl" : ""}${enter ? " cm-enter" : ""}`;
  return (
    <>
      <MascotStyles />
      <svg
        viewBox="0 0 120 120"
        className={`cm cm-m-${mood}${mode}${extra} ${className}`}
        style={timing(name, seed)}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        focusable="false"
      >
        {react ? (
          <g key={mood} className="cm-react">
            <Character mood={mood} />
          </g>
        ) : (
          <Character mood={mood} />
        )}
      </svg>
    </>
  );
}
