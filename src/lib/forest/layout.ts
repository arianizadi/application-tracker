/**
 * Fixed world geometry and the deterministic planting plan.
 *
 * The scene is authored in a 1200×520 viewBox. On narrow screens it is cropped
 * with `xMidYMax slice`, so everything important lives in the middle band
 * (x ≈ 300–900) and the grove grows outward from the centre.
 */
import { rng, round } from "./random";

export const VIEW_W = 1200;
export const VIEW_H = 520;
/** Horizontal band that stays visible on a 360px-wide phone (aspect ≈ 5:4). */
export const SAFE_X: readonly [number, number] = [300, 900];

/** Far ridge silhouette (no trees, just atmosphere). */
export function farRidgeY(x: number): number {
  return 270 + 16 * Math.sin(x / 150 + 0.6) + 8 * Math.sin(x / 61 + 2);
}

/** Back hills where the distant grove stands. */
export function backHillY(x: number): number {
  return 318 + 13 * Math.sin(x / 190 + 1.3) + 6 * Math.sin(x / 83);
}

/** Top edge of the middle meadow (the main application grove). */
export function meadowY(x: number): number {
  return 382 + 8 * Math.sin(x / 240 + 0.4) + 4 * Math.sin(x / 97 + 1);
}

/** Top edge of the foreground clearing. */
export function clearingY(x: number): number {
  return 434 + 7 * Math.sin(x / 300 + 2) + 3 * Math.sin(x / 71);
}

/** Builds a closed SVG path that follows `fn` across the scene and fills to the bottom. */
export function bandPath(fn: (x: number) => number, step = 40, bottom = VIEW_H): string {
  let d = `M-20 ${round(fn(-20))}`;
  let prevX = -20;
  for (let x = -20 + step; x <= VIEW_W + 20 + step; x += step) {
    const cx = prevX + step / 2;
    d += ` Q${round(cx)} ${round(fn(cx) - 0)} ${round(x)} ${round(fn(x))}`;
    prevX = x;
  }
  d += ` L${VIEW_W + 40} ${bottom} L-20 ${bottom}Z`;
  return d;
}

export type Layer = 0 | 1 | 2; // 0 back hills · 1 middle grove · 2 foreground
export type Slot = { x: number; y: number; layer: Layer; scale: number };

/**
 * The planting plan: a fixed, pre-shuffled list of spots. Application #n (in
 * the order they were planted) always gets slot #n, so adding a tree never
 * moves the others. Spots near the centre fill first so a young forest looks
 * intentional on every screen size.
 */
export const SLOTS: readonly Slot[] = buildSlots();
export const MAX_TREES = 120;

function buildSlots(): Slot[] {
  const r = rng(20251016);
  const out: (Slot & { key: number })[] = [];

  // Middle grove: one row across the meadow.
  const midStep = 33;
  for (let x = 18; x <= VIEW_W - 18; x += midStep) {
    const jx = x + (r() - 0.5) * 12;
    const y = meadowY(jx) + 9 + r() * 16;
    const scale = 0.8 + ((y - 382) / 40) * 0.14 + r() * 0.06;
    out.push({ x: jx, y, layer: 1, scale, key: Math.abs(jx - 600) / 600 });
  }

  // Back hills: two staggered rows.
  for (const row of [0, 1] as const) {
    const step = 26;
    for (let x = 10 + row * 13; x <= VIEW_W - 10; x += step) {
      const jx = x + (r() - 0.5) * 9;
      const y = backHillY(jx) + (row === 0 ? 2 : 15) + r() * 5;
      const scale = row === 0 ? 0.4 + r() * 0.05 : 0.48 + r() * 0.06;
      out.push({ x: jx, y, layer: 0, scale, key: 0.42 + row * 0.04 + (Math.abs(jx - 600) / 600) * 0.9 });
    }
  }

  // Foreground: framing trees at the far sides only (the clearing stays open).
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const x = side < 0 ? 245 - i * 62 - r() * 10 : 955 + i * 62 + r() * 10;
      const y = 492 + r() * 16;
      out.push({ x, y, layer: 2, scale: 1.22 + r() * 0.14, key: 0.6 + i * 0.14 + (side > 0 ? 0.03 : 0) });
    }
  }

  out.sort((a, b) => a.key - b.key || a.x - b.x);
  return out.map(({ x, y, layer, scale }) => ({ x: round(x), y: round(y), layer, scale: round(scale, 3) }));
}
