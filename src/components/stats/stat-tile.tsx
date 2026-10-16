import type { ReactNode } from "react";

import { EarlyBadge } from "@/components/stats/chart-card";

export type TileDelta = {
  /** e.g. "+3", "−2 pts". */
  text: string;
  /** e.g. "vs previous 30 days". */
  label: string;
  direction: "up" | "down" | "flat";
  /** Whether this direction is good news. null = neutral. */
  good: boolean | null;
};

const W = 112;
const H = 28;

/** 12-point trend line: de-emphasized history, accented latest point. */
export function Sparkline({ values, label }: { values: (number | null)[]; label: string }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (pts.length < 2) return null;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const span = max - min || 1;
  const x = (i: number) => 4 + (i / (values.length - 1)) * (W - 8);
  const y = (v: number) => (max === min ? H / 2 : H - 4 - ((v - min) / span) * (H - 8));
  const d = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const area = `${d} L${x(pts[pts.length - 1].i).toFixed(1)} ${H} L${x(pts[0].i).toFixed(1)} ${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-28 shrink-0 overflow-visible" role="img" aria-label={label}>
      <path d={area} fill="var(--moss)" opacity="0.1" />
      <path d={d} pathLength={1} className="stats-draw" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r="4" fill="var(--moss)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}

function Arrow({ direction }: { direction: TileDelta["direction"] }) {
  if (direction === "flat") {
    return (
      <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2.5 6h7" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 12 12" className={`size-3 ${direction === "down" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10V2.5M2.8 5.5 6 2.3l3.2 3.2" />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  unit,
  detail,
  delta,
  trend,
  trendLabel,
  early,
  index = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  detail?: ReactNode;
  delta?: TileDelta | null;
  trend?: (number | null)[];
  trendLabel?: string;
  early?: boolean;
  index?: number;
}) {
  const tone =
    delta?.good === true ? "text-moss-strong bg-moss-soft" : delta?.good === false ? "text-ink-soft bg-paper-2" : "text-muted bg-paper-2";
  return (
    <div
      className="flex min-w-0 flex-col justify-between gap-3 rounded-3xl border border-line bg-card p-4 shadow-soft animate-rise sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {early ? <EarlyBadge>Early</EarlyBadge> : null}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <p className="text-3xl font-semibold leading-none tracking-tight text-ink sm:text-[2.1rem]">
          {value}
          {unit ? <span className="ml-1 text-base font-medium text-muted">{unit}</span> : null}
        </p>
        {trend ? <Sparkline values={trend} label={trendLabel ?? `${label}, 12-week trend`} /> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        {delta ? (
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium tabular ${tone}`}>
              <Arrow direction={delta.direction} />
              {delta.text}
            </span>
            <span className="text-muted">{delta.label}</span>
          </p>
        ) : null}
        {detail ? <p className="text-xs leading-relaxed text-muted">{detail}</p> : null}
      </div>
    </div>
  );
}
