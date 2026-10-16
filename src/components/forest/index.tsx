/**
 * The living forest. Server-renderable; only <ForestFrame> (tooltips, offscreen
 * pause) ships client JS.
 *
 *   <Forest state={deriveForest(snapshot, now, user.timeZone, { weeklyGoal })} interactive fit="responsive" />
 *   <MiniForest state={state} className="h-24 w-full rounded-2xl" />
 *   <ForestLegend state={state} />
 */
import type { ForestState } from "@/lib/forest/derive";

import { ForestFrame } from "./forest-frame";
import { ForestScene } from "./scene";

export { ForestLegend } from "./legend";
export type { ForestState } from "@/lib/forest/derive";

export type ForestFit =
  /** Full 1200×520 scene at its natural aspect ratio (width-driven). Default. */
  | "natural"
  /** Taller on phones (5:4 → 16:8 → 1200:520), cropped from the sides; keeps the clearing centred. */
  | "responsive"
  /** Fills whatever box you give it via className (set a height!), cropping from the sides. */
  | "fill";

export function Forest({
  state,
  className = "",
  interactive = false,
  fit = "natural",
  linkTrees,
  idPrefix = "fx",
}: {
  state: ForestState;
  className?: string;
  /** Hover/tap/keyboard tooltips for trees and seeds. */
  interactive?: boolean;
  fit?: ForestFit;
  /** Show an "Open application" link in pinned tooltips. Defaults to true for real (non-demo) forests. */
  linkTrees?: boolean;
  /** Unique per page if you render more than one full forest. */
  idPrefix?: string;
}) {
  const frame =
    fit === "natural"
      ? className
      : fit === "responsive"
        ? `aspect-[5/4] overflow-hidden sm:aspect-[2/1] lg:aspect-[1200/520] ${className}`
        : `overflow-hidden ${className}`;
  const svg = fit === "natural" ? "block h-auto w-full" : "absolute inset-0 block size-full";
  return (
    <ForestFrame className={frame} interactive={interactive} linkTrees={linkTrees ?? !state.demo}>
      <ForestScene state={state} prefix={idPrefix} interactive={interactive} className={svg} />
    </ForestFrame>
  );
}

/** Static thumbnail for cards: centre of the forest, no animals or motion. Size it with className. */
export function MiniForest({ state, className = "", idPrefix = "fxm" }: { state: ForestState; className?: string; idPrefix?: string }) {
  return (
    <div className={`relative overflow-hidden ${className || "aspect-[5/2]"}`}>
      <ForestScene state={state} prefix={idPrefix} mode="mini" className="absolute inset-0 block size-full" />
    </div>
  );
}
