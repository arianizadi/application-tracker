/**
 * The forest as a single, server-renderable inline SVG.
 *
 * Reusable art lives once in <defs>; every tree is one <use> plus at most a
 * few decoration <use>s, which keeps ~120 trees well under the node budget.
 * Interactivity (tooltips, keyboard roving) is layered on by <ForestFrame>,
 * which only reads the data-* attributes rendered here.
 */
import type { CSSProperties, ReactNode } from "react";

import type { ForestState, ForestTree } from "@/lib/forest/derive";
import { describeForest } from "@/lib/forest/derive";
import { backHillY, bandPath, clearingY, farRidgeY, meadowY, VIEW_H, VIEW_W } from "@/lib/forest/layout";
import { scenePalette, type ScenePalette } from "@/lib/forest/palette";
import { clamp, rng, round } from "@/lib/forest/random";
import { STATUS_META } from "@/lib/status";

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
import { Birch, Blossoms, Buds, Compost, Crown, Fog, Ghost, Lantern, Log, Maple, Oak, Pine, Ribbon, Sapling } from "./art-trees";
import styles from "./forest.module.css";

export type SceneMode = "full" | "mini";

// ── Static geometry (computed once per server process) ─────────────────────

const RIDGE = bandPath(farRidgeY);
const HILL = bandPath(backHillY);
const MEADOW = bandPath(meadowY);
const CLEARING = bandPath(clearingY);
const PATH = "M560 520C590 495 602 468 628 440h24c-10 28 0 55 30 80Z";

const STARS = (() => {
  const r = rng(99);
  const groups = ["", "", ""];
  for (let i = 0; i < 42; i++) {
    const x = round(r() * VIEW_W);
    const y = round(8 + r() * 230);
    const s = round(0.7 + r() * 1.1, 2);
    groups[i % 3] += `M${x - s} ${y}a${s} ${s} 0 1 0 ${round(s * 2, 2)} 0a${s} ${s} 0 1 0 ${-round(s * 2, 2)} 0`;
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

const SNOW = (() => {
  const r = rng(6);
  let d = "";
  for (let row = -1; row < 7; row++) {
    for (let col = 0; col < 18; col++) {
      const x = round(col * 70 + r() * 60);
      const y = round(row * 80 + r() * 60);
      const s = round(1 + r() * 1.4, 1);
      d += `M${x - s} ${y}a${s} ${s} 0 1 0 ${s * 2} 0a${s} ${s} 0 1 0 ${-s * 2} 0`;
    }
  }
  return d;
})();

const FIREFLIES = (() => {
  const r = rng(77);
  return Array.from({ length: 12 }, () => ({ x: round(320 + r() * 560), y: round(372 + r() * 128), d: round(-r() * 3.2, 2) }));
})();

const CLOUDS = [
  { x: 120, y: 92, s: 1 },
  { x: 560, y: 58, s: 0.8 },
  { x: 880, y: 112, s: 1.15 },
  { x: 330, y: 150, s: 0.6 },
  { x: 1040, y: 46, s: 0.7 },
];

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

// ── Pieces ─────────────────────────────────────────────────────────────────

type Ctx = { p: string; pal: ScenePalette; animate: boolean; interactive: boolean; tabId: string | null };

const vars = (o: Record<string, string | number>) => o as CSSProperties;

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

function TreeNode({ t, ctx }: { t: ForestTree; ctx: Ctx }) {
  const { p, pal, animate } = ctx;
  const golden = t.mark === "lantern" || t.mark === "crown";
  const colors = pal.tree(t.kind, t.tone, t.layer, golden);
  const flip = t.flip ? -1 : 1;
  const attrs = itemAttrs(ctx, t, t.plantedDaysAgo);

  if (t.mark === "log") {
    return (
      <g transform={`translate(${t.x} ${t.y})`} {...attrs}>
        <use href={`#${p}-log`} transform={`scale(${round(t.depth * flip, 3)} ${t.depth})`} />
      </g>
    );
  }

  const sapling = t.stage === "sapling";
  const deco =
    sapling ? null : t.mark === "buds" ? "buds" : t.mark === "blossoms" ? "blossoms" : t.mark === "lantern" ? "lantern" : t.mark === "crown" ? "crown" : null;

  let body: ReactNode = (
    <>
      <use href={`#${p}-${sapling ? "sapling" : t.kind}`} style={vars({ "--c": colors.c, "--s": colors.s })} />
      {t.ribbon != null && !sapling && <use href={`#${p}-ribbon`} style={vars({ "--rb": `var(--k-ribbon${t.ribbon})` })} />}
      {deco && <use href={`#${p}-${deco}`} />}
    </>
  );
  if (animate && t.sway) {
    body = (
      <g className={styles.sway} style={{ animationDelay: `${t.swayDelay}s`, animationDuration: `${6 + (t.tone + 1) * 0.9}s` }}>
        {body}
      </g>
    );
  }
  if (animate && t.isNew) body = <g className={styles.grow}>{body}</g>;

  const depth = `scale(${t.depth})`;
  return (
    <g transform={`translate(${t.x} ${t.y})`} {...attrs}>
      {t.ghost && <use href={`#${p}-ghost`} transform={depth} />}
      <g transform={`scale(${round(t.scale * flip, 3)} ${t.scale})`}>{body}</g>
      {t.mark === "compost" && <use href={`#${p}-compost${t.mushroom}`} transform={depth} />}
      {t.mark === "fog" && (
        <g opacity={t.fog}>
          <g className={animate ? styles.mist : undefined}>
            <use href={`#${p}-fog`} transform={depth} />
          </g>
        </g>
      )}
    </g>
  );
}

function Sky({ state, p, animate }: { state: ForestState; p: string; animate: boolean }) {
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
        <circle r="48" fill="var(--f-moon)" opacity=".1" />
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
        <circle r="70" fill={`url(#${p}-sunglow)`} />
        <circle r="24" fill="var(--f-sun)" />
      </g>
    );
  }

  const cloudCount =
    state.weather === "mist" || state.weather === "sunshower" || state.weather === "snow" ? 5 : night ? 2 : state.weather === "sunny" ? 2 : 3;

  return (
    <g>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${p}-sky)`} />
      {starOpacity > 0 && (
        <g opacity={starOpacity} fill="var(--f-star)">
          {STARS.map((d, i) => (
            <path key={i} d={d} className={animate && i > 0 ? styles.twinkle : undefined} style={animate ? { animationDelay: `${-i * 1.3}s` } : undefined} />
          ))}
        </g>
      )}
      {celestial}
      {state.weather === "sunshower" && !night && (
        <g className={animate ? styles.rainbow : undefined} opacity={animate ? undefined : 0.55} fill="none" strokeWidth="8">
          {["var(--k-coral)", "var(--k-sun)", "var(--k-frog)", "var(--k-sky)", "var(--k-lavender)"].map((c, i) => (
            <path key={c} d={`M${760 - 230 + i * 8} 380a${230 - i * 8} ${230 - i * 8} 0 0 1 ${(230 - i * 8) * 2} 0`} stroke={c} />
          ))}
        </g>
      )}
      {CLOUDS.slice(0, cloudCount).map((c, i) => (
        <g key={i} className={animate ? styles.drift : undefined} style={animate ? vars({ "--dur": `${70 + i * 23}s`, "--dx": `${i % 2 ? -110 : 130}px`, animationDelay: `${-i * 17}s` }) : undefined}>
          <use href={`#${p}-cloud`} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} opacity={night ? 0.7 : 0.92} />
        </g>
      ))}
      {Array.from({ length: state.animals.birds }, (_, i) => (
        <g key={i} className={animate ? styles.fly : undefined} style={animate ? vars({ "--dur": `${34 + i * 7}s`, animationDelay: `${-i * 11 - 6}s` }) : undefined}>
          <g transform={`translate(${430 + i * 150} ${110 + ((i * 37) % 70)}) scale(${1 - i * 0.12})`}>
            <Bird animate={animate} />
          </g>
        </g>
      ))}
    </g>
  );
}

function Weather({ state, p, animate }: { state: ForestState; p: string; animate: boolean }) {
  const w = state.weather;
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
        <g className={styles.shower}>
          <g className={styles.fall}>
            <path d={RAIN} stroke="var(--k-sky)" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
          </g>
        </g>
      )}
      {w === "snow" && (
        <g className={animate ? styles.snow : undefined}>
          <path d={SNOW} fill="#ffffff" opacity=".85" />
        </g>
      )}
    </g>
  );
}

// ── Scene ──────────────────────────────────────────────────────────────────

export function ForestScene({
  state,
  prefix = "fx",
  mode = "full",
  interactive = false,
  className = "",
}: {
  state: ForestState;
  prefix?: string;
  mode?: SceneMode;
  interactive?: boolean;
  className?: string;
}) {
  const p = prefix;
  const pal = scenePalette(state.season, state.timeOfDay);
  const animate = mode === "full";
  const full = mode === "full";
  const L = state.landmarks;
  const A = state.animals;
  const night = state.timeOfDay === "night";

  const rendered = new Set(state.trees.map((t) => t.id));
  const tabId =
    state.newestId && rendered.has(state.newestId) ? state.newestId : (state.trees[state.trees.length - 1]?.id ?? state.seeds[0]?.id ?? null);
  const ctx: Ctx = { p, pal, animate, interactive: interactive && full, tabId };

  const back = state.trees.filter((t) => t.layer === 0);
  const mid = state.trees.filter((t) => t.layer === 1);
  const front = state.trees.filter((t) => t.layer === 2);
  const treehouseColors = pal.tree("oak", 0, 2, false);

  // Clearing props, painted top-to-bottom so nearer things overlap farther ones.
  const props: { y: number; key: string; node: ReactNode }[] = [];
  const add = (key: string, x: number, y: number, node: ReactNode, cls?: string) =>
    props.push({
      key,
      y,
      // CSS animations set `transform`, so they go on an inner group (never on the positioned one).
      node: (
        <g key={key} transform={`translate(${x} ${y})`}>
          {cls ? <g className={cls}>{node}</g> : node}
        </g>
      ),
    });

  add("sign", 560, 470, <WelcomeSign bell={L.bell} />);
  if (L.wateringCan) add("bed", 600, 490, <EmptyBed animate={animate} />);
  if (L.gate) add("gate", 640, 440, <Gate />);
  if (L.bench) add("bench", 690, 478, <Bench towel={state.counts.planted >= 42} />);
  if (state.counts.planted >= 64) add("pixel", 714, 446, <PixelButterfly />, animate ? styles.orbit : undefined);
  if (L.picnicLantern) add("picnic", 738, 484, <PostLantern tall animate={animate} />);
  if (L.library > 0) add("library", 385, 494, <StumpLibrary books={L.library} />);
  if (L.bridge) add("bridge", 812, 476, <Bridge />);
  const lanternSpots: [number, number][] = [
    [586, 502],
    [671, 488],
    [604, 470],
    [662, 462],
    [614, 452],
  ];
  lanternSpots.slice(0, L.lanterns).forEach(([x, y], i) => add(`lamp${i}`, x, y, <PostLantern animate={animate} />));

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

  if (A.fox) {
    add("den", 452, 447, <path d="M-24 0c4-16 44-16 48 0Z M-8 0c0-8 16-8 16 0Z" fill="var(--f-meadow-shade)" />);
    add("fox", 482, 450, <Fox />, animate ? styles.bob : undefined);
  }
  if (A.owl) add("owl", 560, 428, <Owl />, animate ? styles.bob : undefined);
  if (A.sloth) add("sloth", L.bench ? 690 : 700, L.bench ? 465 : 500, <Sloth animate={animate} />);
  if (A.rabbit) add("rabbit", 618, 507, <Rabbit />, animate ? styles.hop : undefined);
  if (A.squirrel) add("squirrel", 528, 510, <Squirrel />, animate ? styles.bob : undefined);
  if (A.hedgehog) add("hedgehog", 596, 484, <Hedgehog />);
  if (A.turtle) add("turtle", 784, 512, <Turtle />);
  if (A.raccoon) add("raccoon", 722, 509, <Raccoon />);
  if (A.frog) add("frog", L.pond ? 848 : 756, L.pond ? 499 : 514, <Frog />, animate ? styles.hop : undefined);
  if (A.otter) add("otter", L.pond ? 914 : 762, L.pond ? 496 : 464, <Otter />, animate ? styles.bob : undefined);
  if (A.beaver) add("beaver", 418, 500, <Beaver />);
  if (A.deer) add("deer", 728, 440, <Deer />, animate ? styles.bob : undefined);
  if (A.moth) {
    const [mx, my] = L.picnicLantern ? [742, 444] : A.raccoon ? [740, 484] : [574, 424];
    add("moth", mx, my, <Moth animate={animate} />, animate ? styles.orbit : undefined);
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
        <g id={`${p}-blossoms`}><Blossoms /></g>
        <g id={`${p}-lantern`}><Lantern /></g>
        <g id={`${p}-crown`}><Crown /></g>
        <g id={`${p}-ribbon`}><Ribbon /></g>
        <g id={`${p}-fog`}><Fog /></g>
        <g id={`${p}-ghost`}><Ghost /></g>
        <g id={`${p}-log`}><Log /></g>
        {([0, 1, 2, 3] as const).map((s) => (
          <g key={s} id={`${p}-compost${s}`}>
            <Compost shape={s} />
          </g>
        ))}
      </defs>

      <Sky state={state} p={p} animate={animate} />

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
      {L.bridge && <Stream animate={animate} />}
      {L.pond && (
        <g transform="translate(880 502)">
          <Pond animate={animate} />
        </g>
      )}
      {L.treehouse && (
        <g transform="translate(318 478)" style={vars({ "--c": treehouseColors.c, "--s": treehouseColors.s })}>
          <Treehouse animate={animate} />
        </g>
      )}
      {L.celebration && <Bunting />}
      <g>{front.map((t) => <TreeNode key={t.id} t={t} ctx={ctx} />)}</g>
      {full && <g>{props.map((x) => x.node)}</g>}
      {!full && (
        <g>
          {props
            .filter((x) => !["owl", "moth", "sloth", "rabbit", "frog", "squirrel", "hedgehog", "turtle", "deer", "raccoon", "beaver", "fox", "otter"].includes(x.key))
            .map((x) => x.node)}
        </g>
      )}

      {/* Evening life */}
      {full && A.fireflies > 0 && (
        <g fill="var(--f-glow)" stroke="var(--f-glow)" strokeOpacity=".3" strokeWidth="4" pointerEvents="none">
          {FIREFLIES.slice(0, A.fireflies).map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r="1.8" className={animate ? styles.blink : undefined} style={animate ? { animationDelay: `${f.d}s` } : undefined} />
          ))}
        </g>
      )}

      {full && <Weather state={state} p={p} animate={animate} />}
      <rect className={styles.dim} width={VIEW_W} height={VIEW_H} fill={night ? "#000000" : "#0b1220"} />
    </svg>
  );
}
