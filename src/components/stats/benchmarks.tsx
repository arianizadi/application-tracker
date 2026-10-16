import { Card, CardHeader } from "@/components/ui/card";
import {
  BENCHMARK_DISCLAIMER,
  BENCHMARKS,
  MARKET_CONTEXT,
  NO_BENCHMARK,
  TRACK_NOTES,
  verdict,
  type Benchmark,
  type Verdict,
} from "@/lib/stats/benchmarks";
import type { Rate } from "@/lib/stats/compute";
import { pct } from "@/lib/stats/format";

const VERDICT_STYLE: Record<Verdict["level"], { chip: string; icon: React.ReactNode }> = {
  early: {
    chip: "bg-paper-2 text-ink-soft",
    icon: <path d="M6 10.5V5.5M6 7c0-2 1.2-3.2 3.5-3.5C9.3 5.6 8 7 6 7Z" />,
  },
  below: {
    chip: "bg-sky-soft text-ink",
    icon: <path d="M2 8.5 5 5.5l2 2 3-3.5" />,
  },
  typical: {
    chip: "bg-moss-soft text-moss-strong",
    icon: <path d="m2.5 6.2 2.3 2.3 4.7-5" />,
  },
  above: {
    chip: "bg-sun-soft text-ink",
    icon: <path d="M6 1.5 7.3 4.5l3.2.3-2.4 2.1.7 3.1L6 8.4 3.2 10l.7-3.1-2.4-2.1 3.2-.3Z" />,
  },
};

function SourceDetails({ bench }: { bench: Benchmark }) {
  const s = bench.source;
  return (
    <details className="mt-3 text-xs text-muted">
      <summary className="inline-flex min-h-8 cursor-pointer items-center font-medium text-ink-soft hover:text-ink">Where this number comes from</summary>
      <dl className="mt-2 grid gap-x-4 gap-y-1 rounded-xl bg-paper-2/60 p-3 sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-ink-soft">Source</dt>
        <dd>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
            {s.name}
          </a>{" "}
          ({s.published})
        </dd>
        <dt className="font-medium text-ink-soft">Period</dt>
        <dd>{s.period}</dd>
        <dt className="font-medium text-ink-soft">Population</dt>
        <dd>{s.population}</dd>
        <dt className="font-medium text-ink-soft">Metric</dt>
        <dd>{s.definition}</dd>
      </dl>
    </details>
  );
}

function Comparison({ bench, rate, empty }: { bench: Benchmark; rate: Rate | null; empty?: string }) {
  const v = rate ? verdict(rate, bench) : null;
  const value = rate?.value ?? null;
  const showMarker = rate !== null && value !== null && !rate.lowSample;
  const scaleMax = Math.max(0.1, bench.high * 1.6, showMarker ? value * 1.15 : 0);
  const at = (x: number) => `${Math.min(100, (x / scaleMax) * 100)}%`;
  const style = v ? VERDICT_STYLE[v.level] : null;

  return (
    <div className="rounded-2xl border border-line bg-paper/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold">{bench.label}</h3>
        <p className="text-sm text-muted">
          Reference: <span className="font-medium text-ink-soft">{bench.rangeText}</span>
        </p>
      </div>

      <div
        className="relative mt-7 h-3 rounded-full bg-paper-2"
        role="img"
        aria-label={`Reference range ${pct(bench.low)} to ${pct(bench.high)}${showMarker ? `; yours is ${pct(value)}` : ""}.`}
      >
        <div className="absolute inset-y-0 rounded-full bg-moss/25" style={{ left: at(bench.low), width: `calc(${at(bench.high)} - ${at(bench.low)})` }} />
        {showMarker ? (
          <>
            <span
              aria-hidden
              className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-1.5 text-[11px] font-semibold leading-4 text-paper tabular"
              style={{ left: `clamp(1.9rem, ${at(value)}, calc(100% - 1.9rem))` }}
            >
              You {pct(value)}
            </span>
            <span aria-hidden className="absolute -top-2 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-ink" style={{ left: at(value) }} />
          </>
        ) : null}
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between text-[11px] text-muted tabular">
        <span>0%</span>
        <span>{pct(scaleMax)}</span>
      </div>

      {v && style ? (
        <div className="mt-3 flex items-start gap-2.5">
          <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${style.chip}`}>
            <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {style.icon}
            </svg>
            {v.title}
          </span>
        </div>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v ? v.text : empty}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{bench.caveat}</p>
      <SourceDetails bench={bench} />
    </div>
  );
}

export function BenchmarksSection({
  interview,
  referralInterview,
  reply,
  track,
}: {
  interview: Rate;
  referralInterview: Rate | null;
  reply: Rate;
  track: string;
}) {
  const trackNote = TRACK_NOTES[track];
  return (
    <Card aria-labelledby="benchmarks-title">
      <CardHeader
        title={<span id="benchmarks-title">How you compare (roughly)</span>}
        description={BENCHMARK_DISCLAIMER}
      />
      <div className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 lg:grid-cols-2">
        <Comparison bench={BENCHMARKS.interview} rate={interview} />
        <Comparison
          bench={BENCHMARKS.referral}
          rate={referralInterview && referralInterview.den > 0 ? referralInterview : null}
          empty="No referral applications logged yet. When you get one, set its source to “Referral” and it'll show up here. Asking a classmate, TA, club alum or past manager counts."
        />

        <div className="rounded-2xl border border-line bg-paper/50 p-4 sm:p-5">
          <h3 className="text-base font-semibold">Numbers without a fair benchmark</h3>
          <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
            {NO_BENCHMARK.map((n) => (
              <li key={n.key}>
                <span className="font-medium text-ink">{n.label}{n.key === "reply" && reply.den ? ` (yours: ${pct(reply.value)}, ${reply.num} of ${reply.den})` : ""}.</span>{" "}
                {n.note}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-paper/50 p-4 sm:p-5">
          <h3 className="text-base font-semibold">{trackNote ? trackNote.title : "Market context"}</h3>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-moss">
            {trackNote?.points.map((p) => <li key={p}>{p}</li>)}
            {MARKET_CONTEXT.map((m) => (
              <li key={m.source}>
                {m.text}{" "}
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {m.source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
