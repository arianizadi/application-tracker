import { ChartCard, EarlyBadge } from "@/components/stats/chart-card";
import { TipLayer } from "@/components/stats/tip-layer";
import type { Stats } from "@/lib/stats/compute";
import { days, plural } from "@/lib/stats/format";

export function ResponseTimeChart({ responseTime, className = "" }: { responseTime: Stats["responseTime"]; className?: string }) {
  const { buckets, median, n, pending } = responseTime;
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const peak = buckets.reduce((best, b, i) => (b.count > buckets[best].count ? i : best), 0);

  return (
    <ChartCard
      id="response-time"
      title="How long replies take"
      description="Days from sending to the first real reply (OA, interview, offer or rejection)."
      action={responseTime.lowSample ? <EarlyBadge /> : undefined}
      className={className}
      table={{
        caption: "Time to first reply",
        head: ["Wait", "Replies"],
        rows: [...buckets.map((b) => [b.label, b.count] as (string | number)[]), ["Still waiting", pending]],
      }}
    >
      <div className="mb-5 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-xs text-muted">Typical wait (median)</p>
          <p className="text-2xl font-semibold leading-tight">{median === null ? "—" : days(median)}</p>
        </div>
        <p className="text-sm text-ink-soft">
          From {plural(n, "reply", "replies")}
          {pending ? <> · {pending} still waiting</> : null}
        </p>
      </div>
      {n === 0 ? (
        <p className="rounded-2xl bg-paper-2/70 p-4 text-sm text-ink-soft">
          No replies with dates yet. Tuck says: slow replies are still replies. When you move an app to OA, interview or rejected, it lands here.
        </p>
      ) : (
        <TipLayer>
          <ul className="grid grid-cols-5 gap-2" aria-label="Replies by wait time">
            {buckets.map((b, i) => (
              <li key={b.label} tabIndex={0} data-tip={`${b.label}: ${plural(b.count, "reply", "replies")}`} className="flex flex-col items-center gap-1.5 rounded-lg outline-none">
                <span className="relative flex h-32 w-full items-end justify-center">
                  {b.count > 0 ? (
                    <>
                      <span
                        className={`stats-grow-y block w-3/5 max-w-6 rounded-t-[4px] ${i === peak ? "bg-moss" : "bg-moss/55"}`}
                        style={{ height: `${(b.count / max) * 100}%`, ["--i" as string]: i }}
                      />
                      {i === peak ? (
                        <span aria-hidden className="absolute text-xs font-semibold tabular" style={{ bottom: `calc(${(b.count / max) * 100}% + 4px)` }}>
                          {b.count}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="h-0.5 w-3/5 max-w-6 rounded-full bg-line-strong" />
                  )}
                </span>
                <span className="w-full border-t border-line pt-1.5 text-center text-[11px] leading-tight text-muted">{b.label}</span>
              </li>
            ))}
          </ul>
        </TipLayer>
      )}
    </ChartCard>
  );
}
