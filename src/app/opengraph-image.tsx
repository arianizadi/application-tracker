import { ImageResponse } from "next/og";

export const alt = "Canopy: every application plants a tree. A cozy, gamified internship tracker.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens from globals.css (light theme). Satori can't read CSS variables.
const C = {
  paper: "#f8f4ea",
  paper2: "#f0e9d9",
  ink: "#1d2a1f",
  soft: "#46574a",
  moss: "#3d6b3a",
  mossStrong: "#2a4f28",
  leaf: "#7fb069",
  sun: "#f2a541",
  coral: "#e0674b",
  bark: "#7a5536",
};

const TREES = [
  { x: 720, s: 0.8, tone: C.leaf },
  { x: 820, s: 1.15, tone: C.moss },
  { x: 930, s: 0.95, tone: C.leaf },
  { x: 1040, s: 1.3, tone: C.mossStrong },
  { x: 1140, s: 0.85, tone: C.moss },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: C.paper }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <circle cx="1060" cy="130" r="64" fill={C.sun} opacity="0.9" />
          <path d="M600 560C760 470 940 450 1200 480V630H600Z" fill={C.paper2} />
          {TREES.map((t) => (
            <g key={t.x} transform={`translate(${t.x} ${560 - 150 * t.s}) scale(${t.s})`}>
              <rect x="-6" y="96" width="12" height="60" rx="4" fill={C.bark} />
              <path d="M0 0C-34 40-56 62-56 96a56 56 0 0 0 112 0C56 62 34 40 0 0Z" fill={t.tone} />
            </g>
          ))}
          <path d="M626 560c0-14 9-22 18-22s18 8 18 22Z" fill={C.coral} />
          <path d="M0 556C300 540 700 548 1200 552V630H0Z" fill={C.moss} />
          <path d="M0 576C320 566 760 572 1200 574V630H0Z" fill={C.mossStrong} />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="64" height="64" viewBox="0 0 40 40">
              <rect width="40" height="40" rx="12" fill={C.moss} />
              <path d="M20 8c-5 6-9 9.5-9 14.5a9 9 0 0 0 18 0C29 17.5 25 14 20 8Z" fill={C.leaf} />
              <path d="M20 31V20m0 4.5 4-3.5m-4 1-3-2.5" stroke={C.paper} strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="29.5" cy="10.5" r="3" fill={C.sun} />
            </svg>
            <div style={{ fontSize: 44, color: C.ink, letterSpacing: -1 }}>Canopy</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 64, fontSize: 92, lineHeight: 1, letterSpacing: -3.5, color: C.ink }}>
            <div>Every application</div>
            <div style={{ color: C.moss, marginTop: 8 }}>plants a tree.</div>
          </div>

          <div style={{ marginTop: 36, fontSize: 32, lineHeight: 1.35, color: C.soft, maxWidth: 560 }}>
            The cozy internship tracker that makes you want to apply. Rejections become compost.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
