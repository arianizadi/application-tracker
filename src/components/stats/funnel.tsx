import { ChartCard } from "@/components/stats/chart-card";
import { TipLayer } from "@/components/stats/tip-layer";
import type { FunnelStage } from "@/lib/stats/compute";
import { pct, plural } from "@/lib/stats/format";

/** Ordered stages use one hue; depth reads from bar length, not color. */
export function FunnelChart({ stages, rangeLabel, className = "" }: { stages: FunnelStage[]; rangeLabel: string; className?: string }) {
  const top = stages[0]?.count ?? 0;
  return (
    <ChartCard
      id="funnel"
      title="From sent to offer"
      description={`What happened to the applications you sent (${rangeLabel.toLowerCase()}). Uses history, so a rejection after an interview still counts as an interview.`}
      className={className}
      table={{
        caption: "Application funnel",
        head: ["Stage", "Applications", "% of sent", "From previous"],
        rows: stages.map((s) => [s.label, s.count, pct(s.ofSubmitted), s.ofPrevious === null ? "—" : pct(s.ofPrevious)]),
      }}
    >
      {top === 0 ? (
        <p className="rounded-2xl bg-paper-2/70 p-4 text-sm text-ink-soft">Nothing sent in this window yet. Widen the range or add an application.</p>
      ) : (
        <TipLayer>
          <ol className="flex flex-col gap-3">
            {stages.map((s, i) => {
              const w = top ? (s.count / top) * 100 : 0;
              const tip = `${s.label}: ${plural(s.count, "application")}\n${pct(s.ofSubmitted)} of sent${s.ofPrevious !== null && i > 1 ? ` · ${pct(s.ofPrevious)} of ${s.key === "offer" ? "interviews" : "replies"}` : ""}`;
              return (
                <li key={s.key} className={s.optional ? "pl-4 sm:pl-6" : ""}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      {s.optional ? (
                        <svg aria-hidden viewBox="0 0 12 12" className="size-3 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                          <path d="M2 1v5a3 3 0 0 0 3 3h5" />
                        </svg>
                      ) : null}
                      <span className="truncate font-medium text-ink">{s.label}</span>
                      {s.optional ? <span className="hidden text-xs text-muted sm:inline">optional branch</span> : null}
                    </span>
                    <span className="shrink-0 tabular">
                      <span className="font-semibold">{s.count}</span>
                      {i > 0 ? <span className="ml-1.5 text-xs text-muted">{pct(s.ofSubmitted)}</span> : null}
                    </span>
                  </div>
                  <div
                    role="img"
                    tabIndex={0}
                    data-tip={tip}
                    aria-label={tip.replace("\n", ". ")}
                    className="h-6 rounded-md bg-paper-2/70 outline-none focus-visible:ring-2 focus-visible:ring-moss"
                  >
                    {s.count > 0 ? (
                      <div
                        className={`stats-grow-x h-full rounded-r-[4px] rounded-l-[2px] ${s.optional ? "bg-moss/45" : "bg-moss"}`}
                        style={{ width: `${Math.max(1.5, w)}%`, ["--i" as string]: i }}
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">{s.hint}</p>
                </li>
              );
            })}
          </ol>
        </TipLayer>
      )}
    </ChartCard>
  );
}
