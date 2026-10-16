// Imperative particle engine: plain DOM nodes in a fixed, pointer-events:none layer,
// animated with the Web Animations API on transform/opacity only. Every run removes its
// own layer when the animations finish (or after a safety timeout). Colors are design tokens.

export type Origin = { x: number; y: number };
export type OriginInput = Origin | Element | null | undefined;
export type LeafPalette = "leaves" | "petals" | "gold";

/** Hard cap per effect so low-end phones stay smooth. */
export const MAX_PARTICLES = 60;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const clampCount = (n: number) => Math.max(0, Math.min(MAX_PARTICLES, Math.round(n)));

export function resolveOrigin(o?: OriginInput): Origin {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  if (o && typeof (o as Element).getBoundingClientRect === "function") {
    const r = (o as Element).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
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

type Spawner = (layer: HTMLElement) => Animation[];

/**
 * Run one or more spawners in a fresh layer. Returns a cancel function (idempotent).
 * No-op (returns a noop) during SSR or where WAAPI is unavailable.
 */
export function runFx(spawn: Spawner | Spawner[], { z = 30, maxMs = 7000 }: { z?: number; maxMs?: number } = {}): () => void {
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
  petals: ["var(--berry)", "var(--coral)", "var(--sun)", "var(--sky)", "color-mix(in oklab, var(--berry) 45%, white)"],
  gold: ["var(--sun)", "color-mix(in oklab, var(--sun) 65%, white)", "var(--leaf)", "var(--coral)", "var(--sun)"],
};

const LEAF_RADIUS = "0 100% 0 100%";
const PETAL_RADIUS = "50% 50% 50% 0";
const VEIN = "linear-gradient(45deg, transparent 46%, rgb(255 255 255 / 0.4) 48% 52%, transparent 54%)";

export type LeafOptions = {
  origin?: OriginInput;
  count?: number;
  palette?: LeafPalette;
  /** 0.4 (gentle puff) … 1.4 (big burst). */
  power?: number;
  /** Degrees of the upward fan (default 130). */
  spread?: number;
};

export function spawnLeaves({ origin, count = 40, palette = "leaves", power = 1, spread = 130 }: LeafOptions = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const colors = PALETTES[palette];
    const scale = Math.min(1, window.innerHeight / 820) * power;
    const n = clampCount(count);
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const petal = palette === "petals" ? Math.random() < 0.7 : Math.random() < 0.18;
      const size = rand(9, 16);
      const el = dot(layer, o, size, petal ? size * 0.9 : size, {
        background: `${petal ? "" : `${VEIN}, `}${pick(colors)}`,
        borderRadius: petal ? PETAL_RADIUS : LEAF_RADIUS,
      });
      const angle = ((-90 + rand(-spread / 2, spread / 2)) * Math.PI) / 180;
      const speed = rand(520, 980) * scale;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const k = 1.35;
      const g = 900;
      const D = rand(1.5, 2.3);
      const spin = rand(-260, 260);
      const r0 = rand(0, 360);
      const flip = rand(220, 560) * (Math.random() < 0.5 ? -1 : 1);
      const swayAmp = rand(8, 26);
      const swayFreq = rand(3, 6);
      const phase = rand(0, Math.PI * 2);
      const frames: Keyframe[] = [];
      const N = 10;
      for (let s = 0; s <= N; s++) {
        const p = s / N;
        const t = p * D;
        const E = (1 - Math.exp(-k * t)) / k;
        const dx = vx * E + swayAmp * Math.min(1, t * 1.5) * Math.sin(t * swayFreq + phase);
        const dy = vy * E + (g / k) * (t - E);
        const sc = s === 0 ? 0.3 : 1;
        frames.push({
          offset: p,
          opacity: p < 0.04 ? 0 : p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.28) : 1,
          transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(r0 + spin * t).toFixed(1)}deg) rotateX(${(flip * t).toFixed(0)}deg) scale(${sc})`,
        });
      }
      anims.push(el.animate(frames, { duration: D * 1000, delay: rand(0, 90), easing: "linear", fill: "both" }));
    }
    return anims;
  };
}

// ── Fireflies ─────────────────────────────────────────────────────────────────

export type FireflyOptions = { origin?: OriginInput; count?: number; /** Half-width of the swarm in px. */ radius?: number };

export function spawnFireflies({ origin, count = 26, radius }: FireflyOptions = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const rx = radius ?? Math.min(window.innerWidth * 0.42, 260);
    const ry = rx * 0.55;
    const n = clampCount(count);
    const glow =
      "radial-gradient(circle, color-mix(in oklab, var(--sun) 30%, white) 0 18%, color-mix(in oklab, var(--sun) 90%, transparent) 32%, transparent 70%)";
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const d = Math.sqrt(Math.random());
      const start = { x: o.x + Math.cos(a) * rx * d, y: o.y + Math.sin(a) * ry * d };
      const size = rand(15, 26);
      const el = dot(layer, start, size, size, { background: glow, borderRadius: "50%" });
      const rise = rand(50, 150);
      const wander = rand(14, 40) * (Math.random() < 0.5 ? -1 : 1);
      const ops = [0, 1, 0.35, 1, 0.55, 0];
      const frames: Keyframe[] = ops.map((op, s) => {
        const p = s / (ops.length - 1);
        return {
          offset: p,
          opacity: op,
          transform: `translate(${(wander * Math.sin(p * Math.PI * 1.5)).toFixed(1)}px, ${(-rise * p).toFixed(1)}px) scale(${(0.5 + 0.5 * Math.sin(p * Math.PI) + 0.2).toFixed(2)})`,
        };
      });
      anims.push(el.animate(frames, { duration: rand(2200, 3400), delay: rand(0, 650), easing: "ease-in-out", fill: "both" }));
    }
    return anims;
  };
}

// ── Rain ──────────────────────────────────────────────────────────────────────

export function spawnRain({ count = 36, window: span = 1300 }: { count?: number; window?: number } = {}): Spawner {
  return (layer) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const n = clampCount(count);
    const slant = Math.tan((12 * Math.PI) / 180);
    const anims: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const h = rand(12, 22);
      const el = dot(layer, { x: rand(-20, W + 40), y: -30 }, 2.5, h, {
        background: "linear-gradient(to bottom, transparent, var(--sky))",
        borderRadius: "2px",
      });
      const fall = H * rand(0.5, 0.9);
      anims.push(
        el.animate(
          [
            { opacity: 0, transform: "translate(0, 0) rotate(12deg)" },
            { opacity: 0.85, offset: 0.15 },
            { opacity: 0.85, offset: 0.8 },
            { opacity: 0, transform: `translate(${(-fall * slant).toFixed(1)}px, ${fall.toFixed(1)}px) rotate(12deg)` },
          ],
          { duration: rand(650, 1000), delay: rand(0, span), easing: "cubic-bezier(.5,0,.9,.6)", fill: "both" },
        ),
      );
    }
    return anims;
  };
}

// ── Light rings (level up) ────────────────────────────────────────────────────

export function spawnRings({ origin, rings = 2 }: { origin?: OriginInput; rings?: number } = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const anims: Animation[] = [];
    for (let i = 0; i < Math.min(rings, 3); i++) {
      const el = dot(layer, o, 120, 120, {
        borderRadius: "50%",
        border: "3px solid var(--sun)",
        boxShadow: "0 0 24px color-mix(in oklab, var(--sun) 50%, transparent)",
      });
      anims.push(
        el.animate(
          [
            { opacity: 0.9, transform: "scale(0.2)" },
            { opacity: 0, transform: "scale(2.8)" },
          ],
          { duration: 1100, delay: i * 240, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" },
        ),
      );
    }
    return anims;
  };
}

// ── Sprout (grows from a point) ───────────────────────────────────────────────

const SVG_NS = "http://www.w3.org/2000/svg";

function sproutSvg(size: number) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  const parts: [string, string][] = [
    ["M12 23 C12 18 12 15 12 11", "none"],
    ["M12 13 C7 13 4 10 4 6 C9 6 12 9 12 13 Z", "var(--leaf)"],
    ["M12 11 C12 6 15 3 20 3 C20 8 17 11 12 11 Z", "var(--moss)"],
  ];
  for (const [d, fill] of parts) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", fill);
    if (fill === "none") {
      p.setAttribute("stroke", "var(--moss)");
      p.setAttribute("stroke-width", "2.2");
      p.setAttribute("stroke-linecap", "round");
    }
    svg.appendChild(p);
  }
  return svg;
}

export function spawnSprout({ origin, size = 34 }: { origin?: OriginInput; size?: number } = {}): Spawner {
  return (layer) => {
    const o = resolveOrigin(origin);
    const wrap = dot(layer, { x: o.x, y: o.y - size / 2 }, size, size, { transformOrigin: "50% 100%" });
    wrap.appendChild(sproutSvg(size));
    return [
      wrap.animate(
        [
          { opacity: 0, transform: "translateY(4px) scale(0.1, 0)" },
          { opacity: 1, transform: "translateY(0) scale(1.08, 1.12)", offset: 0.35 },
          { opacity: 1, transform: "translateY(0) scale(0.97, 0.96)", offset: 0.5 },
          { opacity: 1, transform: "translateY(-6px) scale(1)", offset: 0.8 },
          { opacity: 0, transform: "translateY(-14px) scale(1)" },
        ],
        { duration: 1100, easing: "cubic-bezier(.3,.8,.3,1)", fill: "both" },
      ),
    ];
  };
}
