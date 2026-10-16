import type { ReactNode } from "react";

import { MASCOTS, pickLine, type MascotMood, type MascotName } from "./data";
import { Mascot } from "./mascot";

const SIZES = {
  sm: "size-14 sm:size-16",
  md: "size-20 sm:size-24",
  lg: "size-24 sm:size-32",
} as const;

/**
 * A character with a speech bubble. On first paint the character hops in, the bubble scales
 * in from its tail 120 ms later, then the words fade up (CSS only; no typewriter). Pass
 * `enter={false}` to skip the entrance (e.g. a bubble that re-renders in place). Stacks (mascot above, tail pointing up) on mobile and
 * sits side-by-side (tail pointing left) from `sm` up. `layout="row"` keeps it side-by-side
 * everywhere (good for compact cards), `layout="stack"` always stacks.
 *
 * Pass `line` (string or rich content) or let it pick a deterministic line via `seed`.
 */
export function SpeechBubble({
  mascot,
  line,
  mood = "idle",
  seed = 0,
  size = "md",
  layout = "responsive",
  showName = true,
  animate = true,
  enter,
  action,
  className = "",
}: {
  mascot: MascotName;
  line?: ReactNode;
  mood?: MascotMood;
  /** Rotation seed for pickLine when `line` is omitted (event count, date key, id...). */
  seed?: number | string;
  size?: keyof typeof SIZES;
  layout?: "responsive" | "row" | "stack";
  showName?: boolean;
  animate?: boolean | "hover";
  /** Entrance hop + bubble reveal on mount (default: on when `animate` is true). */
  enter?: boolean;
  /** Optional button/link rendered under the text inside the bubble. */
  action?: ReactNode;
  className?: string;
}) {
  const info = MASCOTS[mascot];
  const text = line ?? pickLine(mascot, seed);

  const wrap =
    layout === "row"
      ? "flex-row items-end"
      : layout === "stack"
        ? "flex-col items-center text-center"
        : "flex-col items-center text-center sm:flex-row sm:items-end sm:text-left";

  // Tail: up (stacked) vs left (row). A rotated square sharing the bubble's border.
  const tailUp = "-top-[7px] left-1/2 -ml-[6px] border-l border-t";
  const tailLeft = "bottom-6 -left-[7px] border-b border-l";
  const tail =
    layout === "row"
      ? tailLeft
      : layout === "stack"
        ? tailUp
        : `${tailUp} sm:top-auto sm:bottom-6 sm:left-[-7px] sm:ml-0 sm:border-t-0 sm:border-b`;
  // The bubble grows out of its tail (full class names so Tailwind can see them).
  const origin =
    layout === "row"
      ? "origin-[0_calc(100%-1.9rem)]"
      : layout === "stack"
        ? "origin-top"
        : "origin-top sm:origin-[0_calc(100%-1.9rem)]";
  const reveal = enter ?? animate === true;

  return (
    <figure className={`flex gap-3 sm:gap-4 ${wrap} ${className}`}>
      <Mascot name={mascot} mood={mood} animate={animate} enter={reveal} seed={seed} className={`${SIZES[size]} shrink-0`} />
      <div className={`relative min-w-0 max-w-md rounded-2xl border border-line bg-card px-4 py-3 shadow-soft ${reveal ? `cm-bub ${origin}` : ""}`}>
        <span aria-hidden className={`absolute size-3 rotate-45 border-line bg-card ${tail}`} />
        {showName ? (
          <figcaption className="mb-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {info.name} <span className="font-medium normal-case tracking-normal">the {info.species}</span>
          </figcaption>
        ) : (
          <figcaption className="sr-only">{`${info.name} the ${info.species} says`}</figcaption>
        )}
        <blockquote
          key={typeof text === "string" ? text : undefined}
          className={`relative text-[15px] leading-relaxed text-ink ${reveal ? "cm-bub-line" : ""}`}
        >
          {text}
        </blockquote>
        {action ? <div className={`relative mt-3 ${reveal ? "cm-bub-act" : ""}`}>{action}</div> : null}
      </div>
    </figure>
  );
}
