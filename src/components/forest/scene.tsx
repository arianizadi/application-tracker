/**
 * The forest as a single, server-renderable inline SVG.
 *
 * Reusable art lives once in <defs>; every tree is one <use> plus at most a
 * few decoration <use>s, which keeps ~120 trees well under the node budget.
 * Interactivity (tooltips, keyboard roving) and the one-time grow-ins are
 * layered on by <ForestFrame>, which only reads/writes data-* attributes here.
 *
 * Motion (all CSS, transform/opacity only, see forest.module.css):
 * - one shared 17 s wind: a gust rolls left → right through grass then trees;
 * - clouds drift one way on three depth layers; a small flock crosses rarely;
 * - seasonal leaves / petals / snow, breathing sun and moon, desynced stars,
 *   wandering fireflies, and one small idle per animal.
 * Everything that loops is budgeted (`motionPlan`) so the full scene never has
 * more than ~44 animating pieces, and every duration/delay is derived from a
 * stable hash or table so nothing moves in lockstep and SSR === client.
 */
import type { CSSProperties, ReactNode } from "react";

import type { ForestState, ForestTree } from "@/lib/forest/derive";
import { describeForest } from "@/lib/forest/derive";
import { backHillY, bandPath, clearingY, farRidgeY, meadowY, VIEW_H, VIEW_W } from "@/lib/forest/layout";
import { scenePalette, type ScenePalette } from "@/lib/forest/palette";
import { clamp, rng, round, unit } from "@/lib/forest/random";
import { STATUS_META } from "@/lib/status";

import { FlowerTufts, Leaf, Petal, Tufts } from "./art-ambient";
import { Beaver, Bird, Deer, Fox, Frog, Hedgehog, Moth, Otter, Owl, Rabbit, Raccoon, Sloth, Squirrel, Turtle } from "./art-critters";
import {
  Bench,
  Bridge,
  Bunting,
  EmptyBed,
  Gate,
  PixelButterfly,
  Planter,
  Pond,
  PostLantern,
  SeedPacket,
  Sprout,
  Stream,
  StumpLibrary,
  Treehouse,
  WelcomeSign,
} from "./art-landmarks";
import {
  Birch,
  BLOSSOM_SPOTS,
  Buds,
  CompostBed,
  CompostSprout,
  CrownBody,
  Flower,
  Fog,
  Ghost,
  LanternBody,
  LanternHalo,
  Log,
  Maple,
  Oak,
  Pine,
  Ribbon,
  Sapling,
} from "./art-trees";
import styles from "./forest.module.css";

export type SceneMode = "full" | "mini";

// ── Static geometry (computed once per server process) ─────────────────────

const RIDGE = bandPath(farRidgeY);
const HILL = bandPath(backHillY);
const MEADOW = bandPath(meadowY);
const CLEARING = bandPath(clearingY);
const PATH = "M560 520C590 495 602 468 628 440h24c-10 28 0 55 30 80Z";

/** Five star groups twinkling on out-of-step periods; group 0 holds steady. */
const STAR_BEATS = [0, 3.7, 4.9, 6.1, 7.3] as const;
const STARS = (() => {
  const r = rng(99);
  const groups = ["", "", "", "", ""];
  for (let i = 0; i < 42; i++) {
    const x = round(r() * VIEW_W);
    const y = round(8 + r() * 230);
    const s = round(0.7 + r() * 1.1, 2);
    groups[i % 5] += `M${x - s} ${y}a${s} ${s} 0 1 0 ${round(s * 2, 2)} 0a${s} ${s} 0 1 0 ${-round(s * 2, 2)} 0`;
  }
  return groups;
})();

const RAIN = (() => {
  const r = rng(5);
  let d = "";
  for (let row = -1; row < 9; row++) {
    for (let col = 0; col < 18; col++) {
      const x = round(col * 70 + r() * 50);
      const y = round(row * 60 + r() * 40);
      d += `M${x} ${y}l-3 11`;
    }
  }
  return d;
})();

/**
 * One seamless snow tile per depth (flakes are zero-length round-capped
 * strokes, ~8 bytes each). The tile is drawn three times stacked and the stack
 * slides down by exactly one tile height, so the loop has no seam.
 */
const SNOW_H = 260;
function snowTile(seed: number, count: number): string {
  const r = rng(seed);
  let d = "";
  for (let i = 0; i < count; i++) d += `M${round(r() * VIEW_W)} ${round(r() * SNOW_H)}h0`;
  return d;
}
const SNOW_FAR = snowTile(6, 34);
const SNOW_NEAR = snowTile(16, 12);

/** Fireflies wander small Lissajous loops and glow twice per loop (never faster than one pulse / 2.4 s). */
const FIREFLIES = (() => {
  const r = rng(77);
  return Array.from({ length: 12 }, (_, i) => {
    const dur = round(5 + r() * 4, 2);
    return {
      x: round(320 + r() * 560),
      y: round(372 + r() * 128),
      dur,
      delay: round(-r() * dur, 2),
      ax: round(8 + r() * 6, 1),
      ay: round(5 + r() * 4, 1),
      v: i % 3,
    };
  });
})();

/** Clouds on three depth layers: far ones sit lower, smaller, paler and slower. */
const CLOUD_LAYERS = [
  { s: 1.1, o: 0.92, dur: 120 }, // near
  { s: 0.85, o: 0.85, dur: 180 }, // mid
  { s: 0.6, o: 0.7, dur: 260 }, // far
] as const;
const CLOUDS = [
  { x: 140, y: 66, layer: 0 },
  { x: 610, y: 104, layer: 1 },
  { x: 930, y: 150, layer: 2 },
  { x: 330, y: 168, layer: 2 },
  { x: 1010, y: 86, layer: 1 },
] as const;
const CLOUD_FROM = -220;
const CLOUD_SPAN = 1640; // -220 → 1420

/** A loose V for the flock (leader first), relative to the flock's anchor. */
const FLOCK: readonly (readonly [number, number, number])[] = [
  [0, 0, 1],
  [-17, -7, 0.92],
  [-15, 8, 0.95],
  [-32, -13, 0.86],
  [-30, 15, 0.9],
];

/** Grass clumps along the meadow/clearing edge and the foreground corners (clear of the path and props). */
const TUFT_SPOTS = (() => {
  const r = rng(41);
  const edge = [168, 298, 404, 806, 902, 1036].map((x) => ({ x, y: round(clearingY(x) + 3 + r() * 5), s: round(0.85 + r() * 0.3, 2) }));
  const near = [
    { x: 236, y: 506, s: 1.25 },
    { x: 978, y: 510, s: 1.3 },
  ];
  return [...edge, ...near];
})();
/** Which clumps carry a meadow flower in spring/summer, and its colour. */
const TUFT_FLOWERS: Record<number, string> = { 1: "var(--k-blossom)", 4: "var(--k-sun)", 6: "var(--k-blossom)" };

/** Seasonal fall: particles leave the canopies and settle in the meadow. */
const FALLERS = (() => {
  const r = rng(123);
  return Array.from({ length: 6 }, (_, i) => {
    const dur = round(11 + r() * 5, 1);
    return {
      x: round(170 + (i / 6) * 860 + r() * 110),
      y: round(236 + r() * 70),
      dx: round(26 + r() * 30),
      dy: round(190 + r() * 60),
      dur,
      delay: round(-(i / 6) * dur - r() * 2, 1),
      tone: i % 3,
    };
  });
})();
const LEAF_TONES = ["var(--k-amber)", "var(--k-fox)", "var(--k-rust)"];

function edgePath(count: number): string {
  const r = rng(31);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = round(r() * VIEW_W);
    const h = 12 + r() * 16;
    const w = h * 0.36;
    const y = round(farRidgeY(x) + 5 + r() * 8);
    d += `M${x} ${round(y - h)}L${round(x + w)} ${y}H${round(x - w)}Z`;
  }
  return d;
}

// ── Motion budget ──────────────────────────────────────────────────────────

/**
 * Most concurrently animating SVG pieces in one full scene. The marketing
 * forest shares its page with more motion, so it gets a smaller allowance.
 */
const MOTION_BUDGET = 44;
const DEMO_BUDGET = 34;
/**
 * Every wind-driven thing shares one 17 s gust cycle (see forest.module.css), so
 * gusts stay coherent. This offset makes the first gust arrive ~4 s after load.
 */
const GUST_LEAD = 8.5;

type Plan = {
  wind: Set<string>;
  /** Animals also get their second, smaller idle. */
  detail: boolean;
  /** Ghost-fog drifts that may move. */
  fog: number;
  birds: number;
  stars: number;
  fireflies: number;
  fall: number;
  grass: number;
  lanterns: number;
  pond: boolean;
  stream: boolean;
  smoke: boolean;
};

const NO_MOTION: Plan = { wind: new Set(), detail: false, fog: 0, birds: 0, stars: 0, fireflies: 0, fall: 0, grass: 0, lanterns: 0, pond: false, stream: false, smoke: false };

/**
 * Hands out the motion budget, most-meaningful first: sky + residents, then a
 * core of swaying trees, then the flock, fireflies, stars, seasonal fall,
 * grass and landmark shimmer; whatever is left goes back to the trees.
 * Deterministic (data in, plan out), so server and client agree.
 */
function motionPlan(state: ForestState, clouds: number, starsVisible: boolean, mistBands: number, seasonal: boolean): Plan {
  let left = state.demo ? DEMO_BUDGET : MOTION_BUDGET;
  const take = (want: number) => {
    const n = Math.max(0, Math.min(want, left));
    left -= n;
    return n;
  };
  const A = state.animals;
  const L = state.landmarks;

  take(1); // sun or moon breathing
  take(clouds);
  take(mistBands);
  if (state.weather === "snow") take(2);
  if (L.wateringCan) take(4);
  // Each resident's main idle (one piece each)…
  const residents = [A.deer, A.rabbit, A.owl, A.fox, A.squirrel, A.frog, A.otter, A.sloth, A.turtle, A.hedgehog, A.moth, state.counts.planted >= 64];
  take(residents.filter(Boolean).length);
  // …and the second, smaller one (ear flick, breathing, a tilt) if there's room at the end.
  const details = [A.deer, A.rabbit, A.owl, A.fox, A.frog, A.sloth, A.moth].filter(Boolean).length;

  // Front framing trees first (they're biggest), then a stable hash order.
  const candidates = state.trees.filter((t) => t.sway).sort((a, b) => b.layer - a.layer || a.swayRank - b.swayRank);
  const core = take(Math.min(candidates.length, 14));

  const flock = A.birds > 0 ? Math.min(A.birds + 1, 4) : 0;
  const birds = flock && left >= flock + 2 ? (take(flock + 2), flock) : 0;
  const stars = starsVisible ? take(4) : 0;
  const fireflies = take(Math.min(A.fireflies, state.demo ? 8 : 10));
  const fall = seasonal ? take(6) : 0;
  const grass = take(6);
  const lanterns = take(L.lanterns + (L.picnicLantern ? 1 : 0));
  const pond = L.pond && take(4) === 4;
  const stream = L.bridge && take(1) === 1;
  const smoke = L.treehouse && take(3) === 3;
  const fog = take(Math.min(2, state.trees.filter((t) => t.mark === "fog").length));
  const detail = details > 0 && take(details) === details;
  const extra = take(Math.min(candidates.length, 30) - core);

  return { wind: new Set(candidates.slice(0, core + extra).map((t) => t.id)), detail, fog, birds, stars, fireflies, fall, grass, lanterns, pond, stream, smoke };
}

// ── Pieces ─────────────────────────────────────────────────────────────────

type Ctx = {
  p: string;
  pal: ScenePalette;
  animate: boolean;
  interactive: boolean;
  tabId: string | null;
  newestId: string | null;
  plan: Plan;
  /** Landing intro: every tree grows in on first view (ForestFrame starts it). */
  intro: boolean;
  /** Ghost fogs allowed to drift (budgeted). */
  fogMoves: Set<string>;
};

const vars = (o: Record<string, string | number>) => o as CSSProperties;
const WIND_VARIANT = [styles.windA, styles.windB, styles.windC];

function itemAttrs(
  ctx: Ctx,
  item: { id: string; company: string; role: string; status: ForestTree["status"] },
  days: number | null,
) {
  if (!ctx.interactive) return {};
  const meta = STATUS_META[item.status];
  const when = days == null ? "" : days === 0 ? ", planted today" : `, planted ${days} day${days === 1 ? "" : "s"} ago`;
  return {
    "data-tree": item.id,
    "data-company": item.company,
    "data-role": item.role,
    "data-status": item.status,
    "data-days": days ?? undefined,
    tabIndex: ctx.tabId === item.id ? 0 : -1,
    role: "button",
    "aria-label": `${item.company}, ${item.role}. ${meta.label}${when}.`,
    className: styles.tree,
  } as const;
}

/** Grow-in delay (ms) for the landing intro: back layer first, then left → right. */
const introDelay = (t: ForestTree) => Math.round(150 + t.layer * 140 + (t.x / VIEW_W) * 560);

function TreeNode({ t, ctx }: { t: ForestTree; ctx: Ctx }) {
  const { p, pal, animate } = ctx;
  const golden = t.mark === "lantern" || t.mark === "crown";
  const colors = pal.tree(t.kind, t.tone, t.layer, golden);
  const flip = t.flip ? -1 : 1;
  const attrs = itemAttrs(ctx, t, t.plantedDaysAgo);
  // Only real (interactive) forests track "seen"; the intro grows everything.
  const fresh = animate && ctx.interactive && t.fresh && !ctx.intro;
  const growable = animate && (ctx.intro || fresh);
  const root = {
    transform: `translate(${t.x} ${t.y})`,
    ...attrs,
    ...(fresh ? { "data-fresh": "", "data-x": t.x } : {}),
    ...(ctx.intro && animate ? { "data-grow": "", style: vars({ "--gd": `${introDelay(t)}ms` }) } : {}),
    ...(ctx.interactive && t.id === ctx.newestId ? { "data-newest": "" } : {}),
  };
  const depth = `scale(${t.depth})`;

  if (t.mark === "log") {
    return (
      <g {...root}>
        <g transform={`scale(${round(t.depth * flip, 3)} ${t.depth})`}>
          <use href={`#${p}-log`} className={`${growable ? styles.late : ""} ${styles.logUse}`} />
        </g>
      </g>
    );
  }

  const sapling = t.stage === "sapling";
  let deco: ReactNode = null;
  if (!sapling) {
    if (t.mark === "buds") deco = <use href={`#${p}-buds`} className={styles.deco} />;
    else if (t.mark === "blossoms")
      deco = BLOSSOM_SPOTS.map(([x, y], i) => <use key={i} href={`#${p}-flower`} x={x} y={y} className={styles.deco} style={vars({ "--i": i })} />);
    else if (t.mark === "lantern" || t.mark === "crown")
      deco = (
        <>
          <use href={`#${p}-halo`} className={`${styles.halo} ${styles.haloUse}`} />
          <use href={`#${p}-${t.mark}`} className={`${styles.deco} ${styles.hang}`} style={vars({ "--i": 1 })} />
        </>
      );
  }

  let body: ReactNode = (
    <g transform={`scale(${round(t.scale * flip, 3)} ${t.scale})`}>
      <use href={`#${p}-${sapling ? "sapling" : t.kind}`} style={vars({ "--c": colors.c, "--s": colors.s })} />
      {t.ribbon != null && !sapling && <use href={`#${p}-ribbon`} style={vars({ "--rb": `var(--k-ribbon${t.ribbon})` })} />}
      {deco}
    </g>
  );
  if (growable) {
    body = (
      <>
        <ellipse className={styles.seed} rx={round(3.2 * t.depth, 2)} ry={round(2.2 * t.depth, 2)} cy={-1} fill="var(--k-sun)" />
        <g className={styles.body}>{body}</g>
      </>
    );
  }
  if (ctx.plan.wind.has(t.id)) {
    body = (
      <g
        className={`${styles.wind} ${WIND_VARIANT[t.windVariant]}`}
        style={vars({ "--wa": t.windAmp, "--gs": sapling ? 1.4 : 1, animationDelay: `${round(t.gustDelay - GUST_LEAD, 2)}s` })}
      >
        {body}
      </g>
    );
  }

  const late = growable ? styles.late : "";
  return (
    <g {...root}>
      {t.ghost && (
        <g transform={depth}>
          <use href={`#${p}-ghost`} className={`${late} ${styles.ghostUse}`} />
        </g>
      )}
      {body}
      {t.mark === "compost" && (
        <g transform={depth}>
          <use href={`#${p}-compost${t.mushroom}`} className={`${late} ${styles.compost}`} />
          <use href={`#${p}-sprout`} className={`${late} ${styles.sprout}`} />
        </g>
      )}
      {t.mark === "fog" && (
        <g opacity={t.fog}>
          <g className={animate && ctx.fogMoves.has(t.id) ? styles.mist : undefined}>
            <g transform={depth}>
              <use href={`#${p}-fog`} className={`${late} ${styles.fogUse}`} />
            </g>
          </g>
        </g>
      )}
    </g>
  );
}

function Sky({ state, p, animate, plan }: { state: ForestState; p: string; animate: boolean; plan: Plan }) {
  const tod = state.timeOfDay;
  const hf = state.hour + state.minute / 60;
  const night = tod === "night";
  const starOpacity = night ? 1 : tod === "dusk" ? 0.45 : tod === "dawn" ? 0.15 : 0;

  let celestial: ReactNode = null;
  if (night) {
    const t = clamp(((hf - 20 + 24) % 24) / 9, 0, 1);
    const x = round(1050 - t * 900);
    const y = round(270 - Math.sin(Math.PI * t) * 200);
    celestial = (
      <g transform={`translate(${x} ${y})`}>
        <circle r="48" fill="var(--f-moon)" opacity=".1" className={animate ? styles.moonHalo : undefined} />
        <circle r="20" fill="var(--f-moon)" />
        <path d="M-9-4a4 4 0 1 0 .1 0M4 5a3 3 0 1 0 .1 0M5-9a2 2 0 1 0 .1 0" fill="#d9d1b4" opacity=".6" />
      </g>
    );
  } else {
    const t = clamp((hf - 6) / 13, 0, 1);
    const x = round(150 + t * 900);
    const y = round(305 - Math.sin(Math.PI * t) * 235);
    celestial = (
      <g transform={`translate(${x} ${y})`}>
        <circle r="70" fill={`url(#${p}-sunglow)`} className={animate ? styles.sunGlow : undefined} />
        <circle r="24" fill="var(--f-sun)" />
      </g>
    );
  }

  const cloudCount = cloudsFor(state);
  // One flock, sized by this week's activity; it crosses every 47 s, then the sky stays empty.
  const flock = FLOCK.slice(0, animate ? plan.birds : state.animals.birds > 0 ? Math.min(state.animals.birds + 1, 4) : 0);

  return (
    <g>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${p}-sky)`} />
      {starOpacity > 0 && (
        <g opacity={starOpacity} fill="var(--f-star)">
          {STARS.map((d, i) => {
            const on = animate && i > 0 && i <= plan.stars;
            return (
              <path
                key={i}
                d={d}
                className={on ? styles.twinkle : undefined}
                style={on ? { animationDuration: `${STAR_BEATS[i]}s`, animationDelay: `${round(-STAR_BEATS[i] * 0.37 * i, 2)}s` } : undefined}
              />
            );
          })}
        </g>
      )}
      {night && animate && (
        // At most one shooting star per visit, 25 s in, if you're still here.
        <path
          d="M930 64 760 128"
          pathLength={100}
          stroke="var(--f-star)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="30 100"
          strokeDashoffset="30"
          fill="none"
          className={styles.shoot}
        />
      )}
      {celestial}
      {state.weather === "sunshower" && !night && (
        <g className={animate ? styles.rainbow : undefined} opacity={animate ? undefined : 0.55} fill="none" strokeWidth="8">
          {["var(--k-coral)", "var(--k-sun)", "var(--k-frog)", "var(--k-sky)", "var(--k-lavender)"].map((c, i) => (
            <path key={c} d={`M${760 - 230 + i * 8} 380a${230 - i * 8} ${230 - i * 8} 0 0 1 ${(230 - i * 8) * 2} 0`} stroke={c} />
          ))}
        </g>
      )}
      {CLOUDS.slice(0, cloudCount).map((c, i) => {
        const L = CLOUD_LAYERS[c.layer];
        const dur = round(L.dur * (0.92 + unit(`cloud${i}`) * 0.16), 1);
        return (
          <g
            key={i}
            transform={`translate(${c.x} 0)`}
            className={animate ? styles.cloud : undefined}
            style={animate ? { animationDuration: `${dur}s`, animationDelay: `${round((-(c.x - CLOUD_FROM) / CLOUD_SPAN) * dur, 2)}s` } : undefined}
          >
            <use href={`#${p}-cloud`} transform={`translate(0 ${c.y}) scale(${L.s})`} opacity={round(L.o * (night ? 0.7 : 1), 2)} />
          </g>
        );
      })}
      {flock.length > 0 && (
        <g transform="translate(940 0)" className={animate ? styles.flock : undefined}>
          <g className={animate ? styles.flockBob : undefined}>
            <g transform="translate(0 112)">
              {flock.map(([dx, dy, s], i) => (
                <g key={i} transform={`translate(${dx} ${dy}) scale(${s})`}>
                  <Bird animate={animate} flap={round(0.55 + unit(`bird${i}`) * 0.2, 2)} phase={round(unit(`bird${i}`, 1) * 0.6, 2)} />
                </g>
              ))}
            </g>
          </g>
        </g>
      )}
    </g>
  );
}

function cloudsFor(state: ForestState): number {
  const w = state.weather;
  return w === "mist" || w === "sunshower" || w === "snow" ? 5 : state.timeOfDay === "night" || w === "sunny" ? 2 : 3;
}

/** Leaves (autumn) or petals (spring) drifting down out of the canopies. */
function Seasonal({ state, p, count }: { state: ForestState; p: string; count: number }) {
  if (count <= 0) return null;
  const spring = state.season === "spring";
  return (
    <g pointerEvents="none">
      {FALLERS.slice(0, count).map((f, i) => (
        <use
          key={i}
          href={`#${p}-${spring ? "petal" : "leaf"}`}
          className={styles.fall}
          style={vars({
            "--lx": `${f.x}px`,
            "--ly": `${f.y}px`,
            "--dx": `${f.dx}px`,
            "--dy": `${f.dy}px`,
            "--lc": spring ? "var(--k-blossom)" : LEAF_TONES[f.tone],
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          })}
        />
      ))}
    </g>
  );
}

function Weather({ state, p, animate }: { state: ForestState; p: string; animate: boolean }) {
  const w = state.weather;
  const night = state.timeOfDay === "night";
  const mistBands = w === "mist" || state.timeOfDay === "dawn";
  return (
    <g pointerEvents="none">
      {mistBands && (
        <g opacity={w === "mist" ? 0.75 : 0.5}>
          <ellipse cx="420" cy="398" rx="340" ry="12" fill={`url(#${p}-mist)`} className={animate ? styles.mist : undefined} />
          <ellipse cx="860" cy="340" rx="320" ry="10" fill={`url(#${p}-mist)`} className={animate ? styles.mist : undefined} style={{ animationDelay: "-9s" }} />
          {w === "mist" && <ellipse cx="640" cy="456" rx="380" ry="12" fill={`url(#${p}-mist)`} className={animate ? styles.mist : undefined} style={{ animationDelay: "-4s" }} />}
        </g>
      )}
      {w === "sunshower" && animate && (
        // A short shower that clears (the rainbow stays). At night it's a brief, faint drizzle.
        <g className={styles.shower} style={night ? vars({ "--rain-o": 0.35, animationDuration: "4.5s" }) : undefined}>
          <g className={styles.rain} style={{ animationIterationCount: night ? 5 : 7 }}>
            <path d={RAIN} stroke="var(--k-sky)" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
          </g>
        </g>
      )}
      {w === "snow" && (
        <g stroke="#ffffff" strokeLinecap="round">
          <g className={animate ? styles.snowFall : undefined} style={{ animationDuration: "7s" }}>
            {[-1, 0, 1].map((k) => (
              <use key={k} href={`#${p}-snow-far`} y={k * SNOW_H} />
            ))}
          </g>
          {animate && (
            <g className={`${styles.snowFall} ${styles.snowNear}`} style={{ animationDuration: "4.5s", animationDelay: "-2s" }}>
              {[-1, 0, 1].map((k) => (
                <use key={k} href={`#${p}-snow-near`} y={k * SNOW_H} />
              ))}
            </g>
          )}
        </g>
      )}
    </g>
  );
}

/** Grass clumps that sway on their own and lean into the gust a beat before the trees. */
function Grass({ state, p, animated }: { state: ForestState; p: string; animated: number }) {
  if (state.season === "winter") return null;
  const flowers = state.season === "spring" || state.season === "summer";
  return (
    <g>
      {TUFT_SPOTS.map((s, i) => {
        const flower = flowers ? TUFT_FLOWERS[i] : undefined;
        const on = i < animated;
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <use
              href={`#${p}-${flower ? "ftufts" : "tufts"}`}
              className={on ? styles.grass : undefined}
              style={vars({
                ...(flower ? { "--fc": flower } : {}),
                ...(on ? { "--ga": flower ? 1.2 : 1, animationDelay: `${round((s.x / VIEW_W) * 1.6 - 0.1 - GUST_LEAD, 2)}s` } : {}),
              })}
            />
          </g>
        );
      })}
    </g>
  );
}

// ── Scene ──────────────────────────────────────────────────────────────────

export function ForestScene({
  state,
  prefix = "fx",
  mode = "full",
  interactive = false,
  intro = false,
  className = "",
}: {
  state: ForestState;
  prefix?: string;
  mode?: SceneMode;
  interactive?: boolean;
  /** Grow the whole grove in on first view (landing hero). ForestFrame must also get `intro`. */
  intro?: boolean;
  className?: string;
}) {
  const p = prefix;
  const pal = scenePalette(state.season, state.timeOfDay);
  const animate = mode === "full";
  const full = mode === "full";
  const L = state.landmarks;
  const A = state.animals;
  const tod = state.timeOfDay;
  const night = tod === "night";

  const seasonal = (state.season === "autumn" || state.season === "spring") && tod !== "night";
  const plan = animate
    ? motionPlan(state, cloudsFor(state), night || tod === "dusk" || tod === "dawn", state.weather === "mist" ? 3 : tod === "dawn" ? 2 : 0, seasonal)
    : NO_MOTION;

  const rendered = new Set(state.trees.map((t) => t.id));
  const newestId = state.newestId && rendered.has(state.newestId) ? state.newestId : null;
  const tabId = newestId ?? state.trees[state.trees.length - 1]?.id ?? state.seeds[0]?.id ?? null;
  const fogMoves = new Set(plan.fog > 0 ? state.trees.filter((t) => t.mark === "fog").slice(-plan.fog).map((t) => t.id) : []);
  const ctx: Ctx = { p, pal, animate, interactive: interactive && full, tabId, newestId, plan, intro: intro && full, fogMoves };

  const back = state.trees.filter((t) => t.layer === 0);
  const mid = state.trees.filter((t) => t.layer === 1);
  const front = state.trees.filter((t) => t.layer === 2);
  const treehouseColors = pal.tree("oak", 0, 2, false);

  // Clearing props, painted top-to-bottom so nearer things overlap farther ones.
  const props: { y: number; key: string; node: ReactNode }[] = [];
  let critterIndex = 0;
  const add = (key: string, x: number, y: number, node: ReactNode, opts: { cls?: string; critter?: boolean } = {}) => {
    let inner: ReactNode = opts.cls ? <g className={opts.cls}>{node}</g> : node;
    // Landing intro: residents arrive (fade + small drop) after the trees have grown.
    if (opts.critter && ctx.intro) inner = <g className={styles.critter} style={vars({ "--ci": critterIndex++ })}>{inner}</g>;
    props.push({
      key,
      y,
      // CSS animations set `transform`, so they go on an inner group (never on the positioned one).
      node: (
        <g key={key} transform={`translate(${x} ${y})`}>
          {inner}
        </g>
      ),
    });
  };

  add("sign", 560, 470, <WelcomeSign bell={L.bell} />);
  if (L.wateringCan) add("bed", 600, 490, <EmptyBed animate={animate} />);
  if (L.gate) add("gate", 640, 440, <Gate />);
  if (L.bench) add("bench", 690, 478, <Bench towel={state.counts.planted >= 42} />);
  if (state.counts.planted >= 64) add("pixel", 714, 446, <PixelButterfly />, { cls: animate ? styles.orbit : undefined, critter: true });
  if (L.picnicLantern) add("picnic", 738, 484, <PostLantern tall animate={animate && plan.lanterns > L.lanterns} beat={5} />);
  if (L.library > 0) add("library", 385, 494, <StumpLibrary books={L.library} />);
  if (L.bridge) add("bridge", 812, 476, <Bridge />);
  const lanternSpots: [number, number][] = [
    [586, 502],
    [671, 488],
    [604, 470],
    [662, 462],
    [614, 452],
  ];
  lanternSpots.slice(0, L.lanterns).forEach(([x, y], i) => add(`lamp${i}`, x, y, <PostLantern animate={animate && i < plan.lanterns} beat={i} />));

  // Planter + wishlist seeds.
  if (state.seeds.length > 0 || state.counts.planted > 0) {
    add(
      "planter",
      470,
      508,
      <>
        <Planter />
        {state.seeds.map((s, i) => (
          <g key={s.id} transform={`translate(${-32 + i * 8} 0)`} {...itemAttrs(ctx, { ...s, status: "WISHLIST" }, null)}>
            {s.sprouted ? <Sprout /> : <SeedPacket tone={i} />}
          </g>
        ))}
      </>,
    );
  }

  const critter = { critter: true } as const;
  if (A.fox) {
    add("den", 452, 447, <path d="M-24 0c4-16 44-16 48 0Z M-8 0c0-8 16-8 16 0Z" fill="var(--f-meadow-shade)" />);
    add("fox", 482, 450, <Fox animate={animate} detail={plan.detail} />, critter);
  }
  if (A.owl) add("owl", 560, 428, <Owl animate={animate} detail={plan.detail} />, critter);
  if (A.sloth) add("sloth", L.bench ? 690 : 700, L.bench ? 465 : 500, <Sloth animate={animate} detail={plan.detail} />, critter);
  if (A.rabbit) add("rabbit", 618, 507, <Rabbit animate={animate} detail={plan.detail} />, critter);
  if (A.squirrel) add("squirrel", 528, 510, <Squirrel animate={animate} />, critter);
  if (A.hedgehog) add("hedgehog", 596, 484, <Hedgehog animate={animate} />, critter);
  if (A.turtle) add("turtle", 784, 512, <Turtle animate={animate} />, critter);
  if (A.raccoon) add("raccoon", 722, 509, <Raccoon />, critter);
  if (A.frog) add("frog", L.pond ? 848 : 756, L.pond ? 499 : 514, <Frog animate={animate} detail={plan.detail} />, critter);
  if (A.otter) add("otter", L.pond ? 914 : 762, L.pond ? 496 : 464, <Otter animate={animate} />, critter);
  if (A.beaver) add("beaver", 418, 500, <Beaver />, critter);
  if (A.deer) add("deer", 728, 440, <Deer animate={animate} detail={plan.detail} />, critter);
  if (A.moth) {
    const [mx, my] = L.picnicLantern ? [742, 444] : A.raccoon ? [740, 484] : [574, 424];
    add("moth", mx, my, <Moth animate={animate} />, { cls: animate && plan.detail ? styles.orbit : undefined, critter: true });
  }
  props.sort((a, b) => a.y - b.y);

  const caption = describeForest(state);
  const viewBox = full ? `0 0 ${VIEW_W} ${VIEW_H}` : "150 160 900 360";
  const [sky0, sky1, sky2] = pal.sky;

  return (
    <svg
      viewBox={viewBox}
      width={full ? VIEW_W : 900}
      height={full ? VIEW_H : 360}
      preserveAspectRatio="xMidYMax slice"
      className={`${styles.scene} ${full ? "" : styles.still} ${className}`}
      style={vars(pal.vars)}
      role={ctx.interactive ? "group" : "img"}
      aria-label={ctx.interactive ? `${caption} Use arrow keys to move between trees.` : caption}
    >
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky0} />
          <stop offset=".55" stopColor={sky1} />
          <stop offset=".8" stopColor={sky2} />
        </linearGradient>
        <radialGradient id={`${p}-sunglow`}>
          <stop offset="0" stopColor="var(--f-sun)" stopOpacity=".7" />
          <stop offset="1" stopColor="var(--f-sun)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-mist`}>
          <stop offset="0" stopColor="var(--f-mist)" stopOpacity=".9" />
          <stop offset="1" stopColor="var(--f-mist)" stopOpacity="0" />
        </radialGradient>
        <path id={`${p}-cloud`} d="M0 0h74a14 14 0 0 0-8-26 20 20 0 0 0-36-8 14 14 0 0 0-22 12A12 12 0 0 0 0 0Z" fill="var(--f-cloud)" />
        <g id={`${p}-oak`}><Oak /></g>
        <g id={`${p}-pine`}><Pine /></g>
        <g id={`${p}-birch`}><Birch /></g>
        <g id={`${p}-maple`}><Maple /></g>
        <g id={`${p}-sapling`}><Sapling /></g>
        <g id={`${p}-buds`}><Buds /></g>
        <g id={`${p}-flower`}><Flower /></g>
        <g id={`${p}-halo`}><LanternHalo /></g>
        <g id={`${p}-lantern`}><LanternBody /></g>
        <g id={`${p}-crown`}><CrownBody /></g>
        <g id={`${p}-ribbon`}><Ribbon /></g>
        <g id={`${p}-fog`}><Fog /></g>
        <g id={`${p}-ghost`}><Ghost /></g>
        <g id={`${p}-log`}><Log /></g>
        <g id={`${p}-sprout`}><CompostSprout /></g>
        {([0, 1, 2, 3] as const).map((s) => (
          <g key={s} id={`${p}-compost${s}`}>
            <CompostBed shape={s} />
          </g>
        ))}
        {full && (
          <>
            <g id={`${p}-tufts`}><Tufts /></g>
            <g id={`${p}-ftufts`}><FlowerTufts /></g>
            {plan.fall > 0 && <g id={`${p}-${state.season === "spring" ? "petal" : "leaf"}`}>{state.season === "spring" ? <Petal /> : <Leaf />}</g>}
            {state.weather === "snow" && (
              <>
                <path id={`${p}-snow-far`} d={SNOW_FAR} strokeWidth="2.4" opacity=".75" />
                <path id={`${p}-snow-near`} d={SNOW_NEAR} strokeWidth="4.4" opacity=".9" />
              </>
            )}
          </>
        )}
      </defs>

      <Sky state={state} p={p} animate={animate} plan={plan} />

      {/* Distance */}
      <path d={RIDGE} fill="var(--f-ridge)" />
      {state.overflow > 0 && <path d={edgePath(clamp(state.overflow, 14, 90))} fill={pal.edge} />}
      <path d={HILL} fill="var(--f-hill)" />
      <g>{back.map((t) => <TreeNode key={t.id} t={t} ctx={ctx} />)}</g>

      {/* Middle grove */}
      <path d={MEADOW} fill="var(--f-meadow)" />
      <g>{mid.map((t) => <TreeNode key={t.id} t={t} ctx={ctx} />)}</g>

      {/* Foreground clearing */}
      <path d={CLEARING} fill="var(--f-clearing)" />
      <ellipse cx="600" cy="540" rx="760" ry="44" fill="var(--f-clearing-shade)" />
      <path d={PATH} fill="var(--f-path)" />
      {full && <Grass state={state} p={p} animated={plan.grass} />}
      {L.bridge && <Stream animate={animate && plan.stream} />}
      {L.pond && (
        <g transform="translate(880 502)">
          <Pond animate={animate && plan.pond} />
        </g>
      )}
      {L.treehouse && (
        <g transform="translate(318 478)" style={vars({ "--c": treehouseColors.c, "--s": treehouseColors.s })}>
          <Treehouse animate={animate && plan.smoke} />
        </g>
      )}
      {L.celebration && <Bunting />}
      <g>{front.map((t) => <TreeNode key={t.id} t={t} ctx={ctx} />)}</g>
      {full && <g>{props.map((x) => x.node)}</g>}
      {!full && (
        <g>
          {props
            .filter((x) => !["owl", "moth", "sloth", "rabbit", "frog", "squirrel", "hedgehog", "turtle", "deer", "raccoon", "beaver", "fox", "otter", "pixel"].includes(x.key))
            .map((x) => x.node)}
        </g>
      )}

      {/* Evening life */}
      {full && A.fireflies > 0 && (
        <g fill="var(--f-glow)" stroke="var(--f-glow)" strokeOpacity=".3" strokeWidth="4" pointerEvents="none">
          {FIREFLIES.slice(0, A.fireflies).map((f, i) => {
            const on = i < plan.fireflies;
            return (
              <circle
                key={i}
                cx={f.x}
                cy={f.y}
                r="1.8"
                className={on ? `${styles.firefly} ${[styles.ffA, styles.ffB, styles.ffC][f.v]}` : styles.firefly}
                style={on ? vars({ "--ax": `${f.ax}px`, "--ay": `${f.ay}px`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }) : undefined}
              />
            );
          })}
        </g>
      )}

      {full && animate && plan.fall > 0 && (
        // In the landing intro the leaves wait for the canopies to exist.
        <g className={ctx.intro ? styles.critter : undefined} style={ctx.intro ? vars({ "--ci": 4 }) : undefined}>
          <Seasonal state={state} p={p} count={plan.fall} />
        </g>
      )}
      {full && <Weather state={state} p={p} animate={animate} />}
      {/* opacity={0} is overridden by the .dim rule; it keeps the forest visible if styling ever fails. */}
      <rect className={styles.dim} opacity={0} width={VIEW_W} height={VIEW_H} fill={night ? "#000000" : "#0b1220"} />
    </svg>
  );
}
