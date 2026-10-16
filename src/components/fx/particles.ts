// Imperative particle engine: plain DOM nodes in a fixed, pointer-events:none layer,
// animated with the Web Animations API on transform/opacity only. Every run removes its
// own layer when the animations finish (or after a safety timeout). Colors are design tokens.
//
// Budget (motion spec §4.1): every particle lives ≤ 2.2 s plus ≤ 300 ms of spawn delay, so a
// whole celebration is over in ~2.5 s. Particles never loop.

export type Origin = { x: number; y: number; /** Top edge of the source element, when known. */ top?: number };
export type OriginInput = Origin | Element | null | undefined;
export type LeafPalette = "leaves" | "petals" | "gold" | "autumn" | "frost";
export type Season = "spring" | "summer" | "autumn" | "winter";

/** Hard cap per effect so low-end phones stay smooth. */
export const MAX_PARTICLES = 40;
/** Longest a particle may live, plus the longest spawn delay (ms). */
export const PARTICLE_MS = 2200;
export const SPAWN_DELAY_MS = 300;

const EASE_ENTER = "cubic-bezier(.22,1,.36,1)";
const EASE_EXIT = "cubic-bezier(.4,0,1,1)";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const clampCount = (n: number) => Math.max(0, Math.min(MAX_PARTICLES, Math.round(n)));

/** Northern-hemisphere season for the device's local date (Canopy's forest uses the same). */
export function currentSeason(d = new Date()): Season {
  const m = d.getMonth();
  return m <= 1 || m === 11 ? "winter" : m <= 4 ? "spring" : m <= 7 ? "summer" : "autumn";
}

/** Leaf colors that match the forest outside the window. */
export function seasonalPalette(season: Season = currentSeason()): LeafPalette {
  return season === "autumn" ? "autumn" : season === "spring" ? "petals" : season === "winter" ? "frost" : "leaves";
}

/**
 * Viewport point to burst from. For an element, prefers its own `[data-fx-origin]` or
 * submit button (e.g. the Plant button inside a quick-add form), else its center.
 */
export function resolveOrigin(o?: OriginInput): Origin {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  if (o && typeof (o as Element).getBoundingClientRect === "function") {
    const el = o as Element;
    const target = el.matches("button, a, [data-fx-origin]")
      ? el
      : (el.querySelector("[data-fx-origin], button[type='submit']") ?? el);
    const r = target.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top };
  }
  if (o && "x" in o) return o;
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.55 };
}

function canAnimate() {
  return typeof document !== "undefined" && typeof document.body?.animate === "function";
}

function createLayer(z: number): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.dataset.canopyFx = "";
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: String(z),
    contain: "strict",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);
  return el;
}

export type Spawner = (layer: HTMLElement) => Animation[];

/**
 * Run one or more spawners in a fresh layer. Returns a cancel function (idempotent).
 * No-op (returns a noop) during SSR or where WAAPI is unavailable.
 */
export function runFx(spawn: Spawner | Spawner[], { z = 30, maxMs = 4000 }: { z?: number; maxMs?: number } = {}): () => void {
  if (!canAnimate()) return () => {};
  const layer = createLayer(z);
  let anims: Animation[] = [];
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    for (const a of anims) a.cancel();
    layer.remove();
  };
  const timer = window.setTimeout(cleanup, maxMs);
  try {
    anims = (Array.isArray(spawn) ? spawn : [spawn]).flatMap((s) => s(layer));
  } catch {
    cleanup();
    return cleanup;
  }
  Promise.all(anims.map((a) => a.finished)).then(cleanup, cleanup);
  return cleanup;
}

function dot(layer: HTMLElement, at: Origin, w: number, h: number, style: Partial<CSSStyleDeclaration>) {
  const el = document.createElement("span");
  Object.assign(el.style, {
    position: "absolute",
    left: `${at.x - w / 2}px`,
    top: `${at.y - h / 2}px`,
    width: `${w}px`,
    height: `${h}px`,
    willChange: "transform, opacity",
    opacity: "0",
    ...style,
  });
  layer.appendChild(el);
  return el;
}

// ── Leaves + petals ───────────────────────────────────────────────────────────

const PALETTES: Record<LeafPalette, readonly string[]> = {
  leaves: ["var(--leaf)", "var(--moss)", "var(--sun)", "color-mix(in oklab, var(--leaf) 55%, var(--sun))", "var(--leaf)"],
  petals: ["var(--berry)", "var(--coral)", "var(--sun)", "color-mix(in oklab, var(--berry) 45%, white)", "color-mix(in oklab, var(--coral) 40%, white)"],
  gold: ["var(--sun)", "color-mix(in oklab, var(--sun) 65%, white)", "color-mix(in oklab, var(--sun) 80%, var(--coral))", "var(--sun)", "color-mix(in oklab, var(--leaf) 45%, var(--sun))"],
  // Amber, rust, ochre, and one late-green straggler.
  autumn: [
    "var(--sun)",
    "color-mix(in oklab, var(--coral) 72%, var(--bark))",
    "color-mix(in oklab, var(--sun) 55%, var(--coral))",
    "var(--coral)",
    "color-mix(in oklab, var(--leaf) 50%, var(--sun))",
  ],
  frost: ["var(--leaf)", "color-mix(in oklab, var(--leaf) 55%, white)", "color-mix(in oklab, var(--sky) 50%, white)", "var(--moss)", "color-mix(in oklab, var(--leaf) 40%, var(--sky))"],
};

const LEAF_RADIUS = "0 100% 0 100%";
const PETAL_RADIUS = "50% 50% 50% 0";
const VEIN = "linear-gradient(45deg, transparent 46%, rgb(255 255 255 / 0.4) 48% 52%, transparent 54%)";

export type LeafOptions = {
  origin?: OriginInput;
  count?: number;
  palette?: LeafPalette;
  /** 0.4 (gentle puff) … 1.2 (big burst). */
  power?: number;
  /** Degrees of the upward fan (default 120). */
  spread?: number;
  /** Downward pull in px/s² (default 900; 600 lets petals float). */
  gravity?: number;
  /** Side-to-side flutter range in px (default 8–26). */
  sway?: readonly [number, number];
  /** Lifetime range in ms (clamped to ≤ 2.2 s). */
  life?: readonly [number, number];
  /** Wait before the first leaf leaves (ms). */
  delay?: number;
};

export function spawnLeaves({
  origin,
  count = 14,
  palette = "leaves",
  power = 1,
  spread = 120,
  gravity = 900,
  sway = [8, 26],
  life = [1500, 2100],
  delay = 0,
}: LeafOptions = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const colors = PALETTES[palette];
    const scale = Math.min(1, window.innerHeight / 820) * power;
    const n = clampCount(count);
    const anims: Animation[] = [];
    const petals = palette === "petals";
    for (let i = 0; i < n; i++) {
      const petal = petals ? Math.random() < 0.7 : Math.random() < 0.15;
      const size = rand(9, 15);
      const el = dot(layer, o, size, petal ? size * 0.9 : size, {
        background: `${petal ? "" : `${VEIN}, `}${pick(colors)}`,
        borderRadius: petal ? PETAL_RADIUS : LEAF_RADIUS,
      });
      // Evenly fanned (with jitter) so a small count still reads as a balanced puff.
      const fan = n > 1 ? -spread / 2 + (spread * (i + rand(0.15, 0.85))) / n : rand(-spread / 2, spread / 2);
      const angle = ((-90 + fan) * Math.PI) / 180;
      const speed = rand(520, 940) * scale;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const k = 1.35;
      const D = Math.min(PARTICLE_MS, rand(life[0], life[1])) / 1000;
      const spin = rand(-240, 240);
      const r0 = rand(0, 360);
      const flip = rand(200, 520) * (Math.random() < 0.5 ? -1 : 1);
      const swayAmp = rand(sway[0], sway[1]);
      const swayFreq = rand(3, 5.5);
      const phase = rand(0, Math.PI * 2);
      const frames: Keyframe[] = [];
      const N = 12;
      for (let s = 0; s <= N; s++) {
        const p = s / N;
        const t = p * D;
        const E = (1 - Math.exp(-k * t)) / k;
        const dx = vx * E + swayAmp * Math.min(1, t * 1.5) * Math.sin(t * swayFreq + phase);
        const dy = vy * E + (gravity / k) * (t - E);
        const sc = s === 0 ? 0.3 : 1;
        frames.push({
          offset: p,
          opacity: p < 0.04 ? 0 : p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1,
          transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(r0 + spin * t).toFixed(1)}deg) rotateX(${(flip * t).toFixed(0)}deg) scale(${sc})`,
        });
      }
      anims.push(
        el.animate(frames, { duration: D * 1000, delay: Math.min(SPAWN_DELAY_MS, delay + rand(0, 90)), easing: "linear", fill: "both" }),
      );
    }
    return anims;
  };
}

// ── Fireflies ─────────────────────────────────────────────────────────────────

export type FireflyOptions = {
  origin?: OriginInput;
  count?: number;
  /** Half-width of the swarm in px. */
  radius?: number;
  /** How far each one drifts up (px). */
  rise?: readonly [number, number];
};

export function spawnFireflies({ origin, count = 10, radius, rise = [40, 90] }: FireflyOptions = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const rx = radius ?? Math.min(window.innerWidth * 0.36, 180);
    const ry = rx * 0.45;
    const n = clampCount(count);
    const glow =
      "radial-gradient(circle, color-mix(in oklab, var(--sun) 60%, white) 0 18%, color-mix(in oklab, var(--sun) 80%, transparent) 34%, transparent 68%)";
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      // Spread around a ring (golden angle) so they never clump.
      const a = i * 2.39996 + rand(-0.3, 0.3);
      const d = Math.sqrt((i + 0.5) / n);
      const start = { x: o.x + Math.cos(a) * rx * d, y: o.y + Math.sin(a) * ry * d };
      const size = rand(14, 22);
      const el = dot(layer, start, size, size, { background: glow, borderRadius: "50%" });
      const up = rand(rise[0], rise[1]);
      const wander = rand(10, 26) * (Math.random() < 0.5 ? -1 : 1);
      // One soft glow-up and fade; a single gentle shimmer (well under 3 flashes/s).
      const ops = [0, 0.9, 1, 0.7, 0.85, 0];
      const frames: Keyframe[] = ops.map((op, s) => {
        const p = s / (ops.length - 1);
        return {
          offset: p,
          opacity: op,
          transform: `translate(${(wander * Math.sin(p * Math.PI * 1.2)).toFixed(1)}px, ${(-up * p).toFixed(1)}px) scale(${(0.55 + 0.45 * Math.sin(p * Math.PI)).toFixed(2)})`,
        };
      });
      anims.push(el.animate(frames, { duration: rand(1600, PARTICLE_MS), delay: rand(0, SPAWN_DELAY_MS), easing: "cubic-bezier(.37,0,.63,1)", fill: "both" }));
    }
    return anims;
  };
}

// ── Rain ──────────────────────────────────────────────────────────────────────

/** A light shower: thin slanted drops across the viewport, spawned over `window` ms. */
export function spawnRain({ count = 24, window: span = 1000 }: { count?: number; window?: number } = {}): Spawner {
  return (layer) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const n = clampCount(count);
    const slant = Math.tan((10 * Math.PI) / 180);
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const h = rand(14, 24);
      // Stratified x so the shower covers the screen evenly.
      const x = ((i + rand(0.1, 0.9)) / n) * (W + 60) - 20;
      const el = dot(layer, { x, y: -30 }, 2.5, h, {
        background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--sky) 85%, var(--ink)))",
        borderRadius: "2px",
      });
      const fall = H * rand(0.55, 0.95);
      anims.push(
        el.animate(
          [
            { opacity: 0, transform: "translate(0, 0) rotate(10deg)" },
            { opacity: 0.5, offset: 0.15 },
            { opacity: 0.5, offset: 0.78 },
            { opacity: 0, transform: `translate(${(-fall * slant).toFixed(1)}px, ${fall.toFixed(1)}px) rotate(10deg)` },
          ],
          { duration: rand(900, 1300), delay: (i / n) * span + rand(-60, 60), easing: "cubic-bezier(.45,0,.85,.55)", fill: "both" },
        ),
      );
    }
    return anims;
  };
}

// ── Rings ─────────────────────────────────────────────────────────────────────

export type RingOptions = {
  origin?: OriginInput;
  /** Diameter at scale 1 (px). */
  size?: number;
  from?: number;
  to?: number;
  duration?: number;
  delay?: number;
  /** "line": a thin ring (level-up, interview). "light": a soft radial glow (offer). */
  look?: "line" | "light";
  color?: string;
  opacity?: number;
};

/** One expanding ring. The glow is static; only transform and opacity animate. */
export function spawnRing({
  origin,
  size = 120,
  from = 0.3,
  to = 2.4,
  duration = 1000,
  delay = 0,
  look = "line",
  color = "var(--sun)",
  opacity = 0.8,
}: RingOptions = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const style: Partial<CSSStyleDeclaration> =
      look === "line"
        ? {
            borderRadius: "50%",
            border: `2.5px solid ${color}`,
            boxShadow: `0 0 18px color-mix(in oklab, ${color} 45%, transparent), inset 0 0 12px color-mix(in oklab, ${color} 30%, transparent)`,
          }
        : {
            borderRadius: "50%",
            background: `radial-gradient(circle, transparent 38%, color-mix(in oklab, ${color} 55%, transparent) 58%, color-mix(in oklab, ${color} 22%, transparent) 66%, transparent 71%)`,
          };
    const el = dot(layer, o, size, size, style);
    return [
      el.animate(
        [
          { opacity: 0, transform: `scale(${from})` },
          { opacity, transform: `scale(${from + (to - from) * 0.12})`, offset: 0.1 },
          { opacity: 0, transform: `scale(${to})` },
        ],
        { duration, delay, easing: EASE_ENTER, fill: "both" },
      ),
    ];
  };
}

/** Small glowing dots flung radially (the level-up "light seeds"). */
export function spawnLightSeeds({ origin, count = 8, distance = [50, 70] as const, delay = 120 }: { origin?: OriginInput; count?: number; distance?: readonly [number, number]; delay?: number } = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const n = clampCount(count);
    const turn = rand(0, Math.PI * 2);
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const a = turn + (i / n) * Math.PI * 2;
      const d = rand(distance[0], distance[1]);
      const el = dot(layer, o, 5, 5, {
        borderRadius: "50%",
        background: "color-mix(in oklab, var(--sun) 70%, white)",
        boxShadow: "0 0 6px var(--sun)",
      });
      anims.push(
        el.animate(
          [
            { opacity: 0, transform: "translate(0,0) scale(.4)" },
            { opacity: 1, transform: `translate(${(Math.cos(a) * d * 0.35).toFixed(1)}px, ${(Math.sin(a) * d * 0.35).toFixed(1)}px) scale(1)`, offset: 0.2 },
            { opacity: 0, transform: `translate(${(Math.cos(a) * d).toFixed(1)}px, ${(Math.sin(a) * d).toFixed(1)}px) scale(.6)` },
          ],
          { duration: 900, delay: delay + i * 25, easing: EASE_ENTER, fill: "both" },
        ),
      );
    }
    return anims;
  };
}

// ── Seed + sprout (planting) ──────────────────────────────────────────────────

const SVG_NS = "http://www.w3.org/2000/svg";

function sproutSvg(size: number) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.style.overflow = "visible";
  const parts: [string, string, string?][] = [
    ["M12 24 C12 19 12 16 12 12", "none"],
    ["M12 14 C7.5 14 4.5 11 4.5 7 C9 7 12 10 12 14 Z", "var(--leaf)", "l"],
    ["M12 12 C12 7.5 15 4.5 19.5 4.5 C19.5 9 16.5 12 12 12 Z", "var(--moss)", "r"],
  ];
  for (const [d, fill, leaf] of parts) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", fill);
    if (fill === "none") {
      p.setAttribute("stroke", "var(--moss)");
      p.setAttribute("stroke-width", "2.2");
      p.setAttribute("stroke-linecap", "round");
    }
    if (leaf) p.dataset.leaf = leaf;
    svg.appendChild(p);
  }
  return svg;
}

/**
 * A sprout that grows from `origin` (its base sits on the point), holds, then fades.
 * `still` = the calm version: no growth, a 200 ms fade in, a hold, a fade out.
 */
export function spawnSprout({
  origin,
  size = 30,
  delay = 0,
  hold = 500,
  still = false,
}: { origin?: OriginInput; size?: number; delay?: number; hold?: number; still?: boolean } = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const wrap = dot(layer, { x: o.x, y: o.y - size / 2 }, size, size, { transformOrigin: "50% 100%" });
    const svg = sproutSvg(size);
    wrap.appendChild(svg);
    if (still) {
      const total = 200 + hold + 240;
      return [
        wrap.animate(
          [
            { opacity: 0 },
            { opacity: 1, offset: 200 / total },
            { opacity: 1, offset: (200 + hold) / total },
            { opacity: 0 },
          ],
          { duration: total, delay, easing: "ease-out", fill: "both" },
        ),
      ];
    }
    const grow = 450;
    const fade = 260;
    const total = grow + hold + fade;
    const at = (ms: number) => ms / total;
    const anims = [
      wrap.animate(
        [
          { opacity: 0, transform: "scale(.2, 0)", easing: "cubic-bezier(.2,.8,.3,1.25)" },
          { opacity: 1, transform: "scale(1.06, 1.1)", offset: at(grow * 0.62), easing: "cubic-bezier(.4,0,.4,1)" },
          { opacity: 1, transform: "scale(1)", offset: at(grow) },
          { opacity: 1, transform: "translateY(-2px) scale(1)", offset: at(grow + hold), easing: EASE_EXIT },
          { opacity: 0, transform: "translateY(-8px) scale(.96)" },
        ],
        { duration: total, delay, fill: "both" },
      ),
    ];
    // The two leaves unfurl just after the stem, from where they join it.
    for (const leaf of svg.querySelectorAll<SVGPathElement>("[data-leaf]")) {
      const left = leaf.dataset.leaf === "l";
      leaf.style.transformBox = "view-box";
      leaf.style.transformOrigin = left ? "12px 14px" : "12px 12px";
      anims.push(
        leaf.animate(
          [
            { transform: `rotate(${left ? 50 : -50}deg) scale(.2)` },
            { transform: `rotate(${left ? -6 : 6}deg) scale(1.05)`, offset: 0.7 },
            { transform: "rotate(0) scale(1)" },
          ],
          { duration: 420, delay: delay + (left ? 120 : 190), easing: EASE_ENTER, fill: "both" },
        ),
      );
    }
    return anims;
  };
}

/**
 * A seed hops out of the Plant button and lands on its top edge with a little squash.
 * Returns where it landed so the sprout and leaf puff can start there.
 */
export function spawnSeed({ origin }: { origin: Origin }): { spawner: Spawner; landing: Origin; ms: number } {
  const ground = origin.top ?? origin.y;
  const landing = { x: origin.x, y: ground };
  const ms = 300;
  const spawner: Spawner = (layer) => {
    const el = dot(layer, landing, 7, 9, {
      borderRadius: "50% 50% 46% 46% / 60% 60% 40% 40%",
      background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--sun) 55%, white), var(--sun) 55%, color-mix(in oklab, var(--sun) 70%, var(--bark)))",
      transformOrigin: "50% 100%",
    });
    // Up out of the button (ease-out), then down onto the soil (ease-in) and a 90 ms squash.
    return [
      el.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(.6)", easing: "cubic-bezier(.2,.7,.4,1)" },
          { opacity: 1, transform: "translateY(-24px) rotate(-14deg) scale(1)", offset: 0.4, easing: EASE_EXIT },
          { opacity: 1, transform: "translateY(-4.5px) rotate(0) scale(1)", offset: 0.7, easing: "ease-out" },
          { opacity: 1, transform: "translateY(-3px) scale(1.3, .7)", offset: 0.85, easing: "ease-in" },
          { opacity: 0, transform: "translateY(-2px) scale(1.1, .4)" },
        ],
        { duration: ms, fill: "both" },
      ),
    ];
  };
  return { spawner, landing, ms };
}
