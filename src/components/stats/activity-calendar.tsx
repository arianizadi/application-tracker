import { ChartCard } from "@/components/stats/chart-card";
import { TipLayer } from "@/components/stats/tip-layer";
import type { CalendarDay, Stats } from "@/lib/stats/compute";
import { plural } from "@/lib/stats/format";

const CELL = 14;
const GUTTER = 20;
const LEVEL_OPACITY = [1, 0.3, 0.52, 0.76, 1] as const;
const LEAF = "M6 .9C9.7 2.3 10.7 6.7 6 11.2 1.3 6.7 2.3 2.3 6 .9Z";

function Leaf({ day, symbolId, i }: { day: CalendarDay; symbolId: string; i: number }) {
  const tilt = ((day.index % 5) - 2) * 9;
  const tip = `${day.label}\n${day.actions ? `${plural(day.actions, "update")}${day.submitted ? ` · ${day.submitted} sent` : ""}` : "No activity"}`;
  return (
    <g data-tip={tip} transform={`translate(${Math.floor(i / 7) * CELL + 1} ${(i % 7) * CELL + 1})`}>
      <rect width={CELL} height={CELL} x={-1} y={-1} fill="transparent" />
      {day.level === 0 ? (
        <use href={`#${symbolId}`} fill="var(--line)" transform={`rotate(${tilt} 6 6)`} />
      ) : (
        <g className="stats-sprout" style={{ ["--i" as string]: i }}>
          <use href={`#${symbolId}`} fill="var(--moss)" opacity={LEVEL_OPACITY[day.level]} transform={`rotate(${tilt} 6 6)`} />
        </g>
      )}
    </g>
  );
}

export function ActivityCalendar({ calendar, idPrefix = "cal" }: { calendar: Stats["calendar"]; idPrefix?: string }) {
  const symbolId = `${idPrefix}-leaf`;
  const cols = calendar.weeks.length;
  const width = GUTTER + cols * CELL;
  const height = 7 * CELL;
  const days = calendar.weeks.flat();

  return (
    <ChartCard
      id={`${idPrefix}-activity`}
      title="Your canopy"
      description="Every leaf is a day in the last six months. Greener means more happened: applications sent, OAs, interviews, any status update."
      table={{
        caption: "Activity by week, last 26 weeks",
        head: ["Week of", "Updates", "Sent"],
        rows: calendar.weeks
          .filter((w) => !w[0].future)
          .map((w) => [w[0].label, w.reduce((s, d) => s + d.actions, 0), w.reduce((s, d) => s + d.submitted, 0)])
          .reverse(),
      }}
    >
      <p className="mb-4 text-sm text-ink-soft">
        {calendar.totalActions
          ? `${plural(calendar.totalActions, "update")} across ${plural(calendar.activeDays, "day")}. Every leaf counts, even the small ones.`
          : "No leaves yet. Your first application will grow the first one."}
      </p>
      <TipLayer className="mx-auto w-full max-w-[44rem]">
        <div aria-hidden className="relative h-5 text-[10px] text-muted">
          {calendar.months.map((m) => (
            <span key={m.col} className="absolute top-0" style={{ left: `${((GUTTER + m.col * CELL) / width) * 100}%` }}>
              {m.label}
            </span>
          ))}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label={`Activity over the last 26 weeks: ${plural(calendar.totalActions, "update")} on ${plural(calendar.activeDays, "day")}. Full numbers in the table below.`}>
          <defs>
            <symbol id={symbolId} viewBox="0 0 12 12" width="12" height="12">
              <path d={LEAF} />
              <path d="M6 3.2v7" stroke="var(--card)" strokeOpacity=".35" strokeWidth=".8" fill="none" />
            </symbol>
          </defs>
          <g aria-hidden fontSize="7" fill="var(--muted)">
            {[["Mon", 0], ["Wed", 2], ["Fri", 4]].map(([d, r]) => (
              <text key={d} x={0} y={Number(r) * CELL + 9.5}>
                {d}
              </text>
            ))}
          </g>
          <g transform={`translate(${GUTTER} 0)`}>
            {days.map((d, i) => (d.future ? null : <Leaf key={d.index} day={d} symbolId={symbolId} i={i} />))}
          </g>
        </svg>
      </TipLayer>
      <div aria-hidden className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <svg key={l} viewBox="0 0 12 12" className="size-3">
            <path d={LEAF} fill={l === 0 ? "var(--line)" : "var(--moss)"} opacity={l === 0 ? 1 : LEVEL_OPACITY[l]} />
          </svg>
        ))}
        <span>More</span>
      </div>
    </ChartCard>
  );
}
