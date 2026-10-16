import { Card, CardHeader } from "@/components/ui/card";
import type { BreakdownRow, Rate } from "@/lib/stats/compute";
import { pct } from "@/lib/stats/format";

function RateCell({ rate, label }: { rate: Rate; label: string }) {
  const value = rate.value ?? 0;
  return (
    <div className="flex min-w-0 items-center gap-2.5" aria-label={`${label}: ${rate.den ? `${pct(rate.value)}, ${rate.num} of ${rate.den}` : "no data"}${rate.lowSample && rate.den ? ", early data" : ""}`}>
      <span aria-hidden className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-paper-2">
        {rate.den > 0 && value > 0 ? (
          <span className={`stats-grow-x block h-full rounded-full ${rate.lowSample ? "bg-moss/40" : "bg-moss"}`} style={{ width: `${Math.max(6, value * 100)}%` }} />
        ) : null}
      </span>
      <span aria-hidden className="tabular whitespace-nowrap">
        <span className={rate.lowSample ? "text-ink-soft" : "font-semibold text-ink"}>{rate.den ? pct(rate.value) : "—"}</span>
        {rate.den ? <span className="ml-1 text-xs text-muted">{rate.num}/{rate.den}</span> : null}
      </span>
    </div>
  );
}

export function BreakdownCard({
  id,
  title,
  description,
  groupLabel,
  rows,
  empty,
}: {
  id: string;
  title: string;
  description: string;
  groupLabel: string;
  rows: BreakdownRow[];
  empty: string;
}) {
  const anyEarly = rows.some((r) => r.reply.lowSample);
  return (
    <Card aria-labelledby={`${id}-title`} className="flex flex-col">
      <CardHeader title={<span id={`${id}-title`}>{title}</span>} description={description} />
      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {rows.length === 0 ? (
          <p className="rounded-2xl bg-paper-2/70 p-4 text-sm text-ink-soft">{empty}</p>
        ) : (
          <>
            {/* Desktop/tablet: a real table. */}
            <table className="hidden w-full border-collapse text-left text-sm md:table">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">{groupLabel}</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Sent</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Reply rate</th>
                  <th scope="col" className="py-2 font-medium">Interview rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-line/60 last:border-0">
                    <th scope="row" className={`max-w-[12rem] truncate py-2.5 pr-3 font-medium ${r.unrecorded ? "text-muted" : "text-ink"}`} title={r.label}>
                      {r.label}
                    </th>
                    <td className="py-2.5 pr-3 text-right tabular">{r.apps}</td>
                    <td className="py-2.5 pr-3"><RateCell rate={r.reply} label="Reply rate" /></td>
                    <td className="py-2.5"><RateCell rate={r.interview} label="Interview rate" /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phones: cards. */}
            <ul className="flex flex-col gap-2.5 md:hidden">
              {rows.map((r) => (
                <li key={r.key} className="rounded-2xl border border-line bg-paper/50 p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={`min-w-0 truncate font-medium ${r.unrecorded ? "text-muted" : "text-ink"}`}>{r.label}</p>
                    <p className="shrink-0 text-xs text-muted tabular">{r.apps} sent</p>
                  </div>
                  <dl className="mt-2.5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="mb-1 text-xs text-muted">Replies</dt>
                      <dd><RateCell rate={r.reply} label="Reply rate" /></dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-xs text-muted">Interviews</dt>
                      <dd><RateCell rate={r.interview} label="Interview rate" /></dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            {anyEarly ? (
              <p className="mt-3 text-xs text-muted">Faded bars have fewer than 10 counted applications, so treat them as early hints, not conclusions.</p>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
}
