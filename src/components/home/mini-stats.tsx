import Link from "next/link";

import { isTooEarly, type Stats } from "@/lib/stats/compute";
import { ratePct } from "@/lib/stats/format";

/** Three honest numbers with their denominators; the whole card opens /stats. */
export function MiniStats({ stats }: { stats: Stats }) {
  const reply = stats.rates.reply;
  const interview = stats.rates.interview;
  // Same rule as the /stats tiles: a tiny all-hits sample with newer apps left out reads as "—".
  const replyEarly = isTooEarly(reply);

  const tiles = [
    {
      label: "Submitted",
      value: stats.totals.submittedAllTime.toLocaleString("en-US"),
      hint: stats.weekly.thisWeek ? `${stats.weekly.thisWeek} this week` : "all time",
    },
    {
      label: "Response rate",
      value: replyEarly ? "—" : ratePct(reply),
      hint: reply.den === 0 ? "Needs a week or so" : replyEarly ? `${reply.num} heard back so far` : `${reply.num} of ${reply.den} replied`,
    },
    {
      label: "Interviews",
      value: interview.num.toLocaleString("en-US"),
      hint: interview.num ? "real conversations" : "chairs are ready",
    },
  ];

  return (
    <Link
      href="/stats"
      aria-label={`Open stats. ${tiles.map((t) => `${t.label}: ${t.value}, ${t.hint}`).join(". ")}.`}
      className="group block rounded-3xl border border-line bg-card p-5 shadow-soft transition-shadow hover:shadow-lift sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">At a glance</h2>
        <span className="text-sm font-medium text-moss">
          Stats <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
        {tiles.map((t) => (
          <div key={t.label} className="flex min-w-0 flex-col rounded-2xl bg-paper-2 px-2.5 py-3 sm:px-3">
            <dt className="text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-muted sm:text-[11px]">{t.label}</dt>
            <dd className="mt-auto pt-1.5 font-display text-2xl font-semibold leading-none tabular sm:text-3xl">{t.value}</dd>
            <dd className="mt-1.5 text-[11px] leading-snug text-muted">{t.hint}</dd>
          </div>
        ))}
      </dl>
      {reply.lowSample && reply.den > 0 && !replyEarly ? (
        <p className="mt-3 text-xs text-muted">A few leaves don&apos;t make a trend yet. Counts first, percentages later.</p>
      ) : null}
    </Link>
  );
}
