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

// Per-character phase offsets so a row of mascots never blinks in unison.
const PHASE: Record<MascotName, string> = {
  alder: "-0.4s", pip: "-1.9s", moss: "-3.1s", fern: "-0.9s", nib: "-2.6s", clover: "-1.3s",
  rue: "-3.7s", tuck: "-2.2s", prickle: "-0.2s", miso: "-1.6s", dot: "-2.9s", acorn: "-4.1s",
};

/**
 * A hand-drawn character (viewBox 120×120). Size it with `className` (default `size-24`).
 * `animate` enables subtle idle motion (blink, breathe, ear/tail/wing); always off under
 * prefers-reduced-motion. Decorative (aria-hidden) unless `title` is given.
 */
export function Mascot({
  name,
  mood = "idle",
  className = "size-24",
  animate = true,
  title,
}: {
  name: MascotName;
  mood?: MascotMood;
  className?: string;
  animate?: boolean;
  /** Accessible label; decorative (aria-hidden) when omitted. */
  title?: string;
}) {
  const Character = CHARACTERS[name] ?? Alder;
  return (
    <>
      <MascotStyles />
      <svg
        viewBox="0 0 120 120"
        className={`cm cm-m-${mood}${animate ? " cm-anim" : ""} ${className}`}
        style={{ "--cm-d": PHASE[name] ?? "0s" } as CSSProperties}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        focusable="false"
      >
        <Character mood={mood} />
      </svg>
    </>
  );
}
