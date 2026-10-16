import { ChartCard } from "@/components/stats/chart-card";
import { TipLayer } from "@/components/stats/tip-layer";
import type { Stats } from "@/lib/stats/compute";
import { plural } from "@/lib/stats/format";

function niceMax(n: number): number {
  if (n <= 4) return 4;
  if (n <= 6) return 6;
  if (n <= 10) return 10;
  const step = n <= 20 ? 5 : n <= 50 ? 10 : 25;
  return Math.ceil(n / step) * step;
}

export function WeeklyChart({ weekly, className = "" }: { weekly: Stats["weekly"]; className?: string }) {
  const { weeks, goal } = weekly;
  const max = niceMax(Math.max(weekly.max, goal));
  const ticks = [0, max / 2, max];
  const total = weeks.reduce((s, w) => s + w.submitted, 0);
  const description = goal
    ? `Applications sent per week. The dashed line is your goal of ${goal}.`
    : "Applications sent per week. Set a weekly goal in Settings to see a target line.";

  const summary =
    goal > 0
      ? `${plural(weekly.goalWeeksMet, "week")} of the last 12 hit your goal${weekly.goalStreak >= 2 ? `, ${weekly.goalStreak} in a row right now` : ""}.`
      : `${plural(total, "application")} over ${plural(weekly.activeWeeks, "active week")}.`;

  return (
    <ChartCard
      id="weekly"
      title="Weekly rhythm"
      description={description}
      className={className}
      table={{
        caption: "Applications per week, last 12 weeks",
        head: ["Week", "Sent", ...(goal ? ["Goal met"] : [])],
        rows: weeks.map((w) => [w.rangeLabel + (w.current ? " (this week)" : ""), w.submitted, ...(goal ? [w.metGoal ? "Yes" : "No"] : [])]),
      }}
    >
      <p className="mb-4 text-sm text-ink-soft">{summary}</p>
      <TipLayer>
        <div className="flex gap-2">
          {/* y-axis ticks */}
          <div aria-hidden className="relative h-44 w-6 shrink-0 text-right text-[11px] text-muted tabular sm:h-52">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: `${(t / max) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative h-44 sm:h-52">
              {ticks.map((t) => (
                <div key={t} aria-hidden className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(t / max) * 100}%` }} />
              ))}
              {goal > 0 ? (
                <div aria-hidden className="absolute inset-x-0 z-10 border-t-2 border-dashed border-ink-soft/60" style={{ bottom: `${(goal / max) * 100}%` }}>
                  <span className="absolute -top-5 right-0 rounded-full bg-card px-1.5 text-[11px] font-medium text-ink-soft">Goal {goal}</span>
                </div>
              ) : null}
              <ul className="absolute inset-0 flex items-end" aria-label="Applications per week">
                {weeks.map((w, i) => {
                  const h = (w.submitted / max) * 100;
                  const tip = `${w.rangeLabel}${w.current ? " (this week)" : ""}\n${plural(w.submitted, "application")}${goal ? (w.metGoal ? " · goal met" : ` · goal ${goal}`) : ""}`;
                  return (
                    <li
                      key={w.start}
                      tabIndex={0}
                      data-tip={tip}
                      aria-label={tip.replace("\n", ": ")}
                      className="group relative flex h-full flex-1 items-end justify-center rounded-lg outline-none focus-visible:bg-moss-soft/60 hover:bg-paper-2/70"
                    >
                      {w.submitted > 0 ? (
                        <div
                          className={`stats-grow-y relative w-[62%] max-w-6 rounded-t-[4px] ${w.current ? "bg-moss-strong" : "bg-moss"}`}
                          style={{ height: `${h}%`, ["--i" as string]: i }}
                        >
                          {w.metGoal ? (
                            <svg aria-hidden viewBox="0 0 12 12" className="absolute -top-4 left-1/2 size-3 -translate-x-1/2 text-leaf">
                              <path d="M6 1c3 1.4 4 4.8 0 10C2 5.8 3 2.4 6 1Z" fill="currentColor" />
                            </svg>
                          ) : null}
                        </div>
                      ) : (
                        <div className="h-0.5 w-[62%] max-w-6 rounded-full bg-line-strong" />
                      )}
                      {w.current && w.submitted > 0 ? (
                        <span
                          aria-hidden
                          className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-ink tabular"
                          style={{ bottom: `calc(${h}% + ${w.metGoal ? 18 : 4}px)` }}
                        >
                          {w.submitted}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div aria-hidden className="mt-2 flex text-[11px] text-muted">
              {weeks.map((w, i) => (
                <span
                  key={w.start}
                  className={`flex min-w-0 flex-1 justify-center whitespace-nowrap ${w.current ? "font-semibold text-ink-soft" : ""} ${i % 2 === (weeks.length - 1) % 2 ? "" : "invisible sm:visible"}`}
                >
                  {w.current ? "Now" : w.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </TipLayer>
    </ChartCard>
  );
}
