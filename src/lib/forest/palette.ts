/**
 * The forest's limited palette, lit for the season and time of day.
 *
 * Colours are resolved here (pure TS) and handed to the SVG as CSS custom
 * properties on the root, so every reusable <symbol> just says
 * `fill="var(--f-…)"` and automatically picks up dawn, golden hour or night.
 */
import type { TreeSpecies } from "./derive";
import type { Layer } from "./layout";
import type { Season, TimeOfDay } from "./time";

type Tones = readonly [string, string, string];

const SPECIES: Record<Season, Record<TreeSpecies, Tones>> = {
  spring: {
    oak: ["#6fae5a", "#83bd66", "#5d9e52"],
    pine: ["#3f7a52", "#4a8a5c", "#356b48"],
    birch: ["#a3cf6e", "#b6d97c", "#92c262"],
    maple: ["#86b85c", "#e6a9bb", "#78ad55"],
  },
  summer: {
    oak: ["#4f9a4a", "#5ea852", "#448a42"],
    pine: ["#2f6b47", "#3a7a52", "#285e3f"],
    birch: ["#7cb860", "#8cc46a", "#6eaa56"],
    maple: ["#5fa352", "#6db15a", "#51924a"],
  },
  autumn: {
    oak: ["#d98b3a", "#c9a23f", "#b8743a"],
    pine: ["#3a6b4c", "#447856", "#2f5e42"],
    birch: ["#e6c14f", "#efd067", "#d9b143"],
    maple: ["#c8553d", "#de6f42", "#b8473a"],
  },
  winter: {
    oak: ["#8a9f94", "#9aaea2", "#7c9187"],
    pine: ["#2f5d4a", "#3a6a55", "#28513f"],
    birch: ["#b9c6bd", "#c6d1c8", "#aab9b0"],
    maple: ["#9a8f8a", "#a89d96", "#8c827d"],
  },
};

const GOLDEN: Tones = ["#e8bc65", "#f0c873", "#dcaa52"];

const GROUND: Record<Season, { ridge: string; hill: string; meadow: string; clearing: string; path: string; water: string }> = {
  spring: { ridge: "#b7d2bf", hill: "#94c08a", meadow: "#7fb46a", clearing: "#8cc072", path: "#ead8b0", water: "#7fbfdc" },
  summer: { ridge: "#a9c9b3", hill: "#78ab6d", meadow: "#66a156", clearing: "#74ad5f", path: "#e7d2a2", water: "#74b8d8" },
  autumn: { ridge: "#cdbf9b", hill: "#a9a66b", meadow: "#93a35b", clearing: "#a4ad66", path: "#ebd3a3", water: "#7fb8cf" },
  winter: { ridge: "#d3dde4", hill: "#e0e8ec", meadow: "#ecf1f3", clearing: "#f5f8f8", path: "#d9cfc0", water: "#bcd9e4" },
};

const SKY: Record<TimeOfDay, readonly [string, string, string]> = {
  dawn: ["#7f9cc8", "#e9b8b3", "#fde2c3"],
  day: ["#7fbfe3", "#b9e0f0", "#eef7ef"],
  golden: ["#8eaed6", "#f2c38f", "#fbe0a8"],
  dusk: ["#3b3d72", "#9c76a6", "#f0a487"],
  night: ["#0b1430", "#17264a", "#2c3f66"],
};

/** How each time of day tints the world: target colour + strength. */
const LIGHT: Record<TimeOfDay, readonly [string, number]> = {
  dawn: ["#f3b9a0", 0.12],
  day: ["#ffffff", 0],
  golden: ["#f2a35e", 0.15],
  dusk: ["#3f3a6b", 0.34],
  night: ["#0f1d33", 0.56],
};

const CRITTERS = {
  ink: "#273d35",
  cream: "#f5edda",
  fox: "#e07a3f",
  owl: "#8a6a4a",
  owlBelly: "#e2cfa9",
  sloth: "#a08c74",
  slothFace: "#eadfc8",
  frog: "#79b260",
  beaver: "#8a5a3a",
  rabbit: "#d9cbb8",
  raccoon: "#8d9096",
  raccoonDark: "#4a4d55",
  shell: "#6f8f4f",
  shellHi: "#a7b86a",
  hedgehog: "#c49a72",
  spikes: "#6a4f3b",
  otter: "#7a5536",
  moth: "#dcd3ea",
  squirrel: "#b8693a",
  deer: "#b9875a",
  bird: "#34465a",
  stone: "#a9a59a",
  wood: "#a7774c",
  woodDark: "#7a5536",
  trunk: "#7a5536",
  trunkDark: "#5e4129",
  birch: "#efe9dc",
  coral: "#e0674b",
  sun: "#f2a541",
  sky: "#7fbfdc",
  berry: "#a8436b",
  lavender: "#a9a3c9",
  amber: "#e8a33d",
  mushroom: "#d9634a",
  mushroom2: "#e8b56a",
  stem: "#f3e9d6",
  ribbon0: "#e0674b",
  ribbon1: "#7fbfdc",
  ribbon2: "#f2a541",
  ribbon3: "#a8436b",
  ribbon4: "#a9a3c9",
  ribbon5: "#efe9dc",
} as const;

// ── colour maths ─────────────────────────────────────────────────────────────

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Linear mix of two hex colours. t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

export type ScenePalette = {
  sky: readonly [string, string, string];
  vars: Record<string, string>;
  /** Canopy main + shade colour for a tree. */
  tree: (kind: TreeSpecies, tone: 0 | 1 | 2, layer: Layer, golden: boolean) => { c: string; s: string };
  /** Far-edge silhouette colour for overflow trees. */
  edge: string;
};

export function scenePalette(season: Season, timeOfDay: TimeOfDay): ScenePalette {
  const [target, amount] = LIGHT[timeOfDay];
  const lit = (c: string) => (amount ? mix(c, target, amount) : c);
  const sky = SKY[timeOfDay].map((c) => (season === "winter" && timeOfDay === "day" ? mix(c, "#e9eef2", 0.25) : c)) as unknown as readonly [string, string, string];
  const haze = sky[2];
  const g = GROUND[season];
  const night = timeOfDay === "night";

  const vars: Record<string, string> = {
    "--f-ridge": mix(lit(g.ridge), haze, 0.45),
    "--f-hill": mix(lit(g.hill), haze, 0.2),
    "--f-hill-shade": mix(lit(mix(g.hill, "#1d2a1f", 0.12)), haze, 0.2),
    "--f-meadow": lit(g.meadow),
    "--f-meadow-shade": lit(mix(g.meadow, "#1d2a1f", 0.14)),
    "--f-clearing": lit(g.clearing),
    "--f-clearing-shade": lit(mix(g.clearing, "#1d2a1f", 0.1)),
    "--f-path": lit(g.path),
    "--f-water": lit(g.water),
    "--f-water-hi": lit(mix(g.water, "#ffffff", 0.55)),
    "--f-cap": season === "winter" ? lit("#ffffff") : "transparent",
    "--f-dots": season === "spring" ? lit("#f6c7d4") : "transparent",
    "--f-sun": timeOfDay === "golden" || timeOfDay === "dawn" ? "#ffd08a" : "#fff1c4",
    "--f-moon": "#f4efd9",
    "--f-star": "#fff8e1",
    "--f-cloud": night ? "#2f416a" : timeOfDay === "dusk" ? "#d7a7b8" : timeOfDay === "golden" ? "#fde9cf" : "#ffffff",
    "--f-glow": "#ffd27a",
    "--f-glow-o": night ? "0.95" : timeOfDay === "dusk" ? "0.75" : "0.35",
    "--f-window": night || timeOfDay === "dusk" ? "#ffd27a" : lit("#f4e3b8"),
    "--f-mist": night ? "#43557a" : "#ffffff",
    "--f-golden": lit(GOLDEN[0]),
    "--f-golden-shade": lit(mix(GOLDEN[0], "#1d2a1f", 0.2)),
  };
  for (const [k, v] of Object.entries(CRITTERS)) vars[`--k-${k}`] = lit(v);

  const hazeFor = (layer: Layer) => (layer === 0 ? 0.42 : layer === 1 ? 0.08 : 0);
  const cache = new Map<string, { c: string; s: string }>();
  const tree: ScenePalette["tree"] = (kind, tone, layer, golden) => {
    const key = `${kind}${tone}${layer}${golden ? 1 : 0}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const base = golden ? GOLDEN[tone] : SPECIES[season][kind][tone];
    const h = hazeFor(layer);
    const c = mix(lit(base), haze, h);
    const s = mix(lit(mix(base, "#1d2a1f", 0.24)), haze, h);
    const out = { c, s };
    cache.set(key, out);
    return out;
  };

  return { sky, vars, tree, edge: mix(lit(SPECIES[season].pine[0]), haze, 0.55) };
}
