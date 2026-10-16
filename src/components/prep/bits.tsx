// Small server-compatible building blocks shared across prep pages.
import type { ReactNode } from "react";

import type { TrackCode } from "@/content/prep/types";
import { TRACK_LABELS, TRACK_NAMES } from "@/lib/prep/tracks";

import { PrepIcon, type PrepIconName } from "./icons";

export function TrackChips({ tracks, className = "" }: { tracks: readonly TrackCode[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Tracks">
      {tracks.map((t) => (
        <li
          key={t}
          title={TRACK_NAMES[t]}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-5 ${
            t === "ALL" ? "border-line bg-paper-2 text-ink-soft" : "border-moss/25 bg-moss-soft text-moss"
          }`}
        >
          {TRACK_LABELS[t]}
        </li>
      ))}
    </ul>
  );
}

/** A soft ring with a label in the middle. `value`/`max` drive the arc. */
export function ProgressRing({
  value,
  max,
  size = 120,
  stroke = 10,
  label,
  children,
  tone = "moss",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label: string;
  children?: ReactNode;
  tone?: "moss" | "sun" | "berry" | "sky";
}) {
  const r = (100 - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const color = { moss: "var(--moss)", sun: "var(--sun)", berry: "var(--berry)", sky: "var(--sky)" }[tone];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={label}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--paper-2)" strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="1.5 4" />
        {frac > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(c * frac).toFixed(2)} ${c.toFixed(2)}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        ) : null}
      </svg>
      {children ? <div className="absolute inset-0 grid place-items-center text-center">{children}</div> : null}
    </div>
  );
}

/** Section heading used on lesson pages: icon disc + Fraunces title. */
export function SectionTitle({ id, icon, title, kicker }: { id: string; icon: PrepIconName; title: ReactNode; kicker?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-2xl bg-moss-soft text-moss">
        <PrepIcon name={icon} className="size-5" />
      </span>
      <div className="min-w-0">
        {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{kicker}</p> : null}
        <h2 id={id} className="scroll-mt-24 text-[1.55rem] font-semibold leading-tight sm:text-[1.85rem]">
          {title}
        </h2>
      </div>
    </div>
  );
}

/** Two-digit module number for trail stones and eyebrows. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
