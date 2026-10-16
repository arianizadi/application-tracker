// Shared drawing primitives so all twelve characters share one visual language:
// same eye construction, same mouth set, same blush, same arm strokes, same mood effects.
import type { CSSProperties, ReactNode } from "react";

import type { MascotMood } from "./data";

export type P = readonly [number, number];
export type CharacterProps = { mood: MascotMood };

const INK = "var(--m-ink)";
const f = (n: number) => Math.round(n * 100) / 100;

/** Origin helper for view-box transform-origin (CSS px == viewBox units). */
export const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` });

/** Soft ground shadow. */
export function Ground({ cx = 60, cy = 110, rx = 28, ry = 4 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--m-shadow)" />;
}

/** Light sheen for soft volume. */
export function Sheen({ cx, cy, rx, ry, rotate = -24 }: { cx: number; cy: number; rx: number; ry: number; rotate?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--m-sheen)" transform={`rotate(${rotate} ${cx} ${cy})`} />;
}

function OpenEye({ at, s, look, sparkle, sclera }: { at: P; s: number; look: P; sparkle: boolean; sclera?: string }) {
  const [x, y] = at;
  const px = x + look[0];
  const py = y + look[1];
  return (
    <>
      {sclera ? <circle cx={x} cy={y} r={f(s * 1.55)} fill={sclera} /> : null}
      <ellipse cx={px} cy={py} rx={f(s * 0.86)} ry={s} fill={INK} />
      <circle cx={f(px - s * 0.3)} cy={f(py - s * 0.38)} r={f(s * 0.36)} fill="var(--m-white)" />
      {sparkle ? <circle cx={f(px + s * 0.34)} cy={f(py + s * 0.36)} r={f(s * 0.17)} fill="var(--m-white)" /> : null}
    </>
  );
}

/**
 * Eyes for every mood.
 * idle: round + highlight (blinks) · happy: ^ ^ · cheer: big sparkly · think: glance up-right, one brow up
 * sleepy: closed, relaxed · comfort: soft eyes, brows tilted up in the middle.
 */
export function Eyes({
  mood,
  l,
  r,
  size = 4.6,
  sclera,
  closedColor = INK,
  browColor = INK,
  brows = true,
}: {
  mood: MascotMood;
  l: P;
  r: P;
  size?: number;
  /** Fill for an eye-white disc behind each pupil (for eyes on dark patches). */
  sclera?: string;
  /** Stroke for closed eyes (^ ^ or sleepy lids); use a light color on dark fur. */
  closedColor?: string;
  browColor?: string;
  brows?: boolean;
}) {
  const s = size;
  if (mood === "happy" || mood === "sleepy") {
    const arc = ([x, y]: P) =>
      mood === "happy"
        ? `M${f(x - s)} ${f(y + s * 0.55)} Q${x} ${f(y - s * 1.15)} ${f(x + s)} ${f(y + s * 0.55)}`
        : `M${f(x - s)} ${f(y - s * 0.1)} Q${x} ${f(y + s * 0.85)} ${f(x + s)} ${f(y - s * 0.1)}`;
    return (
      <g fill="none" stroke={closedColor} strokeWidth={f(s * 0.5)} strokeLinecap="round">
        <path d={arc(l)} />
        <path d={arc(r)} />
      </g>
    );
  }
  const big = mood === "cheer" ? 1.15 : 1;
  const look: P = mood === "think" ? [s * 0.28, -s * 0.32] : [0, 0];
  const ss = s * big;
  return (
    <>
      <g className="cm-blink">
        <OpenEye at={l} s={ss} look={look} sparkle={mood === "cheer" || mood === "comfort"} sclera={sclera} />
        <OpenEye at={r} s={ss} look={look} sparkle={mood === "cheer" || mood === "comfort"} sclera={sclera} />
      </g>
      {brows && mood === "think" ? (
        <g fill="none" stroke={browColor} strokeWidth={f(s * 0.36)} strokeLinecap="round" opacity={0.85}>
          <path d={`M${f(l[0] - s)} ${f(l[1] - s * 1.75)} L${f(l[0] + s * 0.9)} ${f(l[1] - s * 1.9)}`} />
          <path d={`M${f(r[0] - s * 0.9)} ${f(r[1] - s * 2.05)} Q${r[0]} ${f(r[1] - s * 2.9)} ${f(r[0] + s)} ${f(r[1] - s * 2.2)}`} />
        </g>
      ) : null}
      {brows && mood === "comfort" ? (
        <g fill="none" stroke={browColor} strokeWidth={f(s * 0.34)} strokeLinecap="round" opacity={0.8}>
          <path d={`M${f(l[0] - s)} ${f(l[1] - s * 1.6)} L${f(l[0] + s * 0.8)} ${f(l[1] - s * 2.25)}`} />
          <path d={`M${f(r[0] + s)} ${f(r[1] - s * 1.6)} L${f(r[0] - s * 0.8)} ${f(r[1] - s * 2.25)}`} />
        </g>
      ) : null}
    </>
  );
}

/** Mouth set shared by the cast. `w` is the mouth width in viewBox units. */
export function Mouth({ mood, at, w = 7, color = INK }: { mood: MascotMood; at: P; w?: number; color?: string }) {
  const [x, y] = at;
  const stroke = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (mood) {
    case "cheer":
      return (
        <g>
          <path d={`M${f(x - w * 0.62)} ${y} Q${x} ${f(y + w * 1.3)} ${f(x + w * 0.62)} ${y} Z`} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={1} />
          <ellipse cx={x} cy={f(y + w * 0.42)} rx={f(w * 0.26)} ry={f(w * 0.14)} fill="var(--m-blush)" />
        </g>
      );
    case "happy":
      return <path d={`M${f(x - w * 0.62)} ${y} Q${x} ${f(y + w * 0.75)} ${f(x + w * 0.62)} ${y}`} {...stroke} />;
    case "think":
      return <path d={`M${f(x - w * 0.4)} ${f(y + 0.4)} Q${f(x - w * 0.2)} ${f(y - 1.1)} ${x} ${f(y + 0.2)} Q${f(x + w * 0.2)} ${f(y + 1.3)} ${f(x + w * 0.4)} ${y}`} {...stroke} />;
    case "sleepy":
      return <ellipse cx={x} cy={f(y + 0.8)} rx={1.5} ry={1.9} fill={color} />;
    case "comfort":
      return <path d={`M${f(x - w * 0.4)} ${y} Q${x} ${f(y + w * 0.35)} ${f(x + w * 0.4)} ${y}`} {...stroke} />;
    default:
      return <path d={`M${f(x - w * 0.5)} ${y} Q${x} ${f(y + w * 0.5)} ${f(x + w * 0.5)} ${y}`} {...stroke} />;
  }
}

export function Cheeks({ mood, l, r, rx = 4.2, ry = 2.6 }: { mood: MascotMood; l: P; r: P; rx?: number; ry?: number }) {
  const o = mood === "happy" || mood === "cheer" ? 0.75 : mood === "sleepy" ? 0.35 : 0.55;
  return (
    <g fill="var(--m-blush)" opacity={o}>
      <ellipse cx={l[0]} cy={l[1]} rx={rx} ry={ry} />
      <ellipse cx={r[0]} cy={r[1]} rx={rx} ry={ry} />
    </g>
  );
}

export type ArmPose = { l: P; r: P };

/**
 * Two rounded arm strokes from shoulders to paws. Targets per mood are derived from the
 * character's rest pose, chin and chest; any mood can be overridden with `pose`.
 */
export function Arms({
  mood,
  shoulders,
  rest,
  chin,
  chest,
  color,
  paw,
  w = 7,
  pose,
}: {
  mood: MascotMood;
  shoulders: ArmPose;
  rest: ArmPose;
  chin: P;
  chest: P;
  color: string;
  paw?: string;
  w?: number;
  pose?: Partial<Record<MascotMood, Partial<ArmPose> | null>>;
}) {
  const { l: sl, r: sr } = shoulders;
  const defaults: Record<MascotMood, ArmPose> = {
    idle: rest,
    sleepy: { l: [rest.l[0] + 1, rest.l[1] + 2], r: [rest.r[0] - 1, rest.r[1] + 2] },
    happy: { l: rest.l, r: [sr[0] + 11, sr[1] - 15] },
    cheer: { l: [sl[0] - 11, sl[1] - 17], r: [sr[0] + 11, sr[1] - 17] },
    think: { l: rest.l, r: chin },
    comfort: { l: [chest[0] - 3.5, chest[1]], r: [chest[0] + 3.5, chest[1] + 1] },
  };
  const override = pose?.[mood];
  if (override === null) return null;
  const end: ArmPose = { ...defaults[mood], ...override };
  const arm = (s: P, e: P, side: -1 | 1) => {
    const mx = (s[0] + e[0]) / 2 + side * 4;
    const my = (s[1] + e[1]) / 2 + 2;
    return (
      <>
        <path d={`M${s[0]} ${s[1]} Q${f(mx)} ${f(my)} ${e[0]} ${e[1]}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
        <circle cx={e[0]} cy={e[1]} r={f(w * 0.62)} fill={paw ?? color} />
      </>
    );
  };
  const waving = mood === "happy" && !override?.r;
  return (
    <g>
      <g>{arm(sl, end.l, -1)}</g>
      <g className={waving ? "cm-wave" : undefined} style={waving ? origin(sr[0], sr[1]) : undefined}>
        {arm(sr, end.r, 1)}
      </g>
    </g>
  );
}

function sparklePath(s: number) {
  const k = f(s * 0.26);
  return `M0 ${-s} L${k} ${-k} L${s} 0 L${k} ${k} L0 ${s} L${-k} ${k} L${-s} 0 L${-k} ${-k} Z`;
}

function Sparkle({ x, y, s, color = "var(--m-honey)", delay = 0 }: { x: number; y: number; s: number; color?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="cm-fx-twinkle" d={sparklePath(s)} fill={color} style={delay ? { animationDelay: `${delay}s` } : undefined} />
    </g>
  );
}

/** Mood flourishes around the head. `at` is the top-right anchor (mirrored for the left side). */
export function MoodFx({ mood, at }: { mood: MascotMood; at: P }) {
  const [x, y] = at;
  switch (mood) {
    case "cheer":
      return (
        <g aria-hidden>
          <Sparkle x={x} y={y} s={5.5} />
          <Sparkle x={x + 9} y={y + 13} s={3.2} color="var(--m-sky)" delay={-0.5} />
          <Sparkle x={120 - x} y={y + 5} s={4.4} delay={-1} />
        </g>
      );
    case "happy":
      return (
        <g aria-hidden>
          <Sparkle x={x} y={y + 2} s={4} />
          <Sparkle x={x + 8} y={y + 12} s={2.6} color="var(--m-sky)" delay={-0.8} />
        </g>
      );
    case "think":
      return (
        <g aria-hidden fill="var(--m-gray)">
          <circle className="cm-fx-dot" cx={x - 5} cy={y + 9} r={1.6} />
          <circle className="cm-fx-dot" cx={x - 1} cy={y + 3} r={2.3} style={{ animationDelay: ".3s" }} />
          <circle className="cm-fx-dot" cx={x + 5} cy={y - 4} r={3.1} style={{ animationDelay: ".6s" }} />
        </g>
      );
    case "sleepy":
      return (
        <g aria-hidden fill="none" stroke="var(--m-lav-d)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path className="cm-fx-z" d={`M${x - 4} ${y + 6} h4 l-4 4.5 h4`} />
          <path className="cm-fx-z" d={`M${x + 3} ${y - 4} h6 l-6 6.5 h6`} style={{ animationDelay: "1.5s" }} />
        </g>
      );
    case "comfort":
      return (
        <g aria-hidden transform={`translate(${x} ${y})`}>
          <path
            className="cm-fx-heart"
            d="M0 4 C-6.5 -1 -5 -7.6 0 -4.6 C5 -7.6 6.5 -1 0 4 Z"
            fill="var(--m-blush)"
          />
        </g>
      );
    default:
      return null;
  }
}

/** Convenience wrapper for the breathing/hopping body group. */
export function Root({ children }: { children: ReactNode }) {
  return <g className="cm-root">{children}</g>;
}
