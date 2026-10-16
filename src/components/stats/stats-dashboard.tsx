import { ActivityCalendar } from "@/components/stats/activity-calendar";
import { BenchmarksSection } from "@/components/stats/benchmarks";
import { BreakdownCard } from "@/components/stats/breakdown";
import { FunnelChart } from "@/components/stats/funnel";
import { InsightsSection } from "@/components/stats/insights";
import { StatsMotion } from "@/components/stats/motion";
import { PipelineCard } from "@/components/stats/pipeline";
import { ResponseTimeChart } from "@/components/stats/response-time";
import { StatTile, type TileDelta } from "@/components/stats/stat-tile";
import { WeeklyChart } from "@/components/stats/weekly-chart";
import { MATURE_DAYS, MIN_SAMPLE, type Rate, type RateDelta, type Stats } from "@/lib/stats/compute";
import { days, pct, plural, pts, signed } from "@/lib/stats/format";
import { getInsights, headline } from "@/lib/stats/insights";

function countDelta(current: number, previous: number, label: string): TileDelta {
  const diff = current - previous;
  return {
    text: signed(diff),
    label,
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
    good: diff > 0 ? true : diff < 0 ? false : null,
  };
}

function rateDelta(d: RateDelta | null, trend: (number | null)[]): TileDelta | null {
  if (d) {
    if (d.current.lowSample || d.previous.lowSample) return null;
    const p = pts(d.current.value, d.previous.value);
    if (!p) return null;
    return { text: p.text, label: d.label, direction: p.diff > 0 ? "up" : p.diff < 0 ? "down" : "flat", good: p.diff > 0 ? true : p.diff < 0 ? false : null };
  }
  const now = trend[trend.length - 1] ?? null;
  const then = trend[trend.length - 5] ?? null;
  const p = pts(now, then);
  if (!p) return null;
  return { text: p.text, label: "vs 4 weeks ago", direction: p.diff > 0 ? "up" : p.diff < 0 ? "down" : "flat", good: p.diff > 0 ? true : p.diff < 0 ? false : null };
}

function rateValue(rate: Rate): string {
  return rate.den === 0 ? "—" : pct(rate.value);
}

export function StatsDashboard({ stats, track, preview = false }: { stats: Stats; track: string; preview?: boolean }) {
  const { totals, rates, compare } = stats;
  const insights = getInsights(stats);
  const referral = stats.breakdowns.source.find((r) => r.key === "referral");
  const medianDelta: TileDelta | null = compare.medianDays
    ? (() => {
        const diff = Math.round(compare.medianDays.current - compare.medianDays.previous);
        return {
          text: `${signed(diff)}d`,
          label: compare.medianDays.label,
          direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
          good: diff < 0 ? true : diff > 0 ? false : null,
        };
      })()
    : null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <StatsMotion />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          index={0}
          label="Applications sent"
          value={String(totals.submitted)}
          trend={stats.trends.submitted}
          trendLabel="Applications sent per week, last 12 weeks"
          delta={countDelta(compare.submitted.current, compare.submitted.previous, compare.submitted.label)}
          detail={`${totals.active} active now${totals.wishlist ? ` · ${totals.wishlist} on wishlist` : ""}`}
        />
        <StatTile
          index={1}
          label="Reply rate"
          value={rateValue(rates.reply)}
          early={rates.reply.lowSample}
          trend={stats.trends.reply}
          trendLabel="Reply rate over the last 12 weeks"
          delta={rateDelta(compare.reply, stats.trends.reply)}
          detail={rates.reply.den ? `${rates.reply.num} of ${rates.reply.den} heard back, rejections included` : "Replies show up once apps age a bit"}
        />
        <StatTile
          index={2}
          label="Interview rate"
          value={rateValue(rates.interview)}
          early={rates.interview.lowSample}
          trend={stats.trends.interview}
          trendLabel="Interview rate over the last 12 weeks"
          delta={rateDelta(compare.interview, stats.trends.interview)}
          detail={rates.interview.den ? `${rates.interview.num} of ${rates.interview.den} reached a real human` : "Your first interview will show here"}
        />
        <StatTile
          index={3}
          label="Typical reply time"
          value={stats.responseTime.median === null ? "—" : String(Math.round(stats.responseTime.median))}
          unit={stats.responseTime.median === null ? undefined : Math.round(stats.responseTime.median) === 1 ? "day" : "days"}
          early={stats.responseTime.lowSample}
          delta={medianDelta}
          detail={`Median of ${plural(stats.responseTime.n, "reply", "replies")}${stats.responseTime.pending ? ` · ${stats.responseTime.pending} still waiting` : ""}`}
        />
      </section>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-3xl border border-line bg-paper-2/50 px-5 py-4 text-sm sm:grid-cols-4">
        {[
          { k: "Positive next steps", v: rateValue(rates.positive), s: `${rates.positive.num} OAs, interviews or offers` },
          { k: "OA → interview", v: rateValue(rates.oaToInterview), s: rates.oaToInterview.den ? `${rates.oaToInterview.num} of ${rates.oaToInterview.den} assessments` : "No OAs yet" },
          { k: "Offers", v: String(totals.offers), s: rates.interviewToOffer.den ? `${rates.interviewToOffer.num} of ${rates.interviewToOffer.den} interviews` : "All time" },
          { k: "Ghosted", v: rateValue(rates.ghost), s: rates.ghost.den ? `${rates.ghost.num} of ${rates.ghost.den}, their loss` : "Nobody yet" },
        ].map((f) => (
          <div key={f.k} className="min-w-0">
            <dt className="text-xs text-muted">{f.k}</dt>
            <dd className="mt-0.5 text-lg font-semibold leading-tight">{f.v}</dd>
            <dd className="truncate text-xs text-muted">{f.s}</dd>
          </div>
        ))}
      </dl>

      {!preview ? <InsightsSection insights={insights} headline={headline(stats)} /> : null}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        <WeeklyChart weekly={stats.weekly} className="lg:col-span-3" />
        <PipelineCard pipeline={stats.pipeline} wishlist={totals.wishlist} className="lg:col-span-2" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <FunnelChart stages={stats.funnel} rangeLabel={stats.rangeLabel} />
        <ResponseTimeChart responseTime={stats.responseTime} />
      </div>

      {!preview ? (
        <>
          <BenchmarksSection interview={rates.interview} referralInterview={referral?.interview ?? null} reply={rates.reply} track={track} />

          <section aria-labelledby="breakdowns-title" className="flex flex-col gap-4">
            <div>
              <h2 id="breakdowns-title" className="text-xl font-semibold sm:text-2xl">What&apos;s working</h2>
              <p className="mt-1 max-w-2xl text-sm text-ink-soft">
                Same applications, sliced different ways. These show what happened, not why. Different roles and timing can explain a lot, so treat them as hints.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <BreakdownCard
                id="by-source"
                title="By source"
                description="Where you found the role."
                groupLabel="Source"
                rows={stats.breakdowns.source}
                empty="Add a source (LinkedIn, Handshake, referral…) when you log applications to see this."
              />
              <BreakdownCard
                id="by-resume"
                title="By resume version"
                description="Which version you sent."
                groupLabel="Resume"
                rows={stats.breakdowns.resume}
                empty="Link a resume version to applications to compare them."
              />
              <BreakdownCard id="by-mode" title="By work mode" description="Remote, hybrid or on-site." groupLabel="Work mode" rows={stats.breakdowns.workMode} empty="No work modes recorded yet." />
              <BreakdownCard id="by-excitement" title="By excitement" description="How many hearts you gave it." groupLabel="Excitement" rows={stats.breakdowns.excitement} empty="No applications in this window." />
            </div>
          </section>

          <ActivityCalendar calendar={stats.calendar} />

          <details className="group rounded-3xl border border-line bg-card px-5 py-1 text-sm sm:px-6">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
              How we count
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </summary>
            <dl className="grid gap-x-6 gap-y-3 pb-5 pt-1 text-ink-soft sm:grid-cols-2">
              <div><dt className="font-medium text-ink">Sent</dt><dd>Anything with an applied date or that ever moved past the wishlist. The range filters by the date you applied.</dd></div>
              <div><dt className="font-medium text-ink">Reply</dt><dd>An OA, interview, offer or rejection. Rejections count: a no is still a reply. Ghosting doesn&apos;t.</dd></div>
              <div><dt className="font-medium text-ink">Interview &amp; offer rates</dt><dd>Applications that ever reached that stage, from your status history. A rejection after an interview still counts as an interview.</dd></div>
              <div><dt className="font-medium text-ink">Fair denominators</dt><dd>Applications under {MATURE_DAYS} days old only count toward a rate once they hit the milestone, so brand-new apps never drag your numbers down.</dd></div>
              <div><dt className="font-medium text-ink">Early data</dt><dd>Rates with fewer than {MIN_SAMPLE} counted applications are marked early. Small numbers swing a lot.</dd></div>
              <div><dt className="font-medium text-ink">Reply time</dt><dd>Median days from applying to the first reply, using the dates status changes were logged ({days(stats.responseTime.median)} for this range).</dd></div>
            </dl>
          </details>
        </>
      ) : null}
    </div>
  );
}
