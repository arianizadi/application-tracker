import Link from "next/link";

import { Mascot } from "@/components/mascots";
import { Card } from "@/components/ui/card";
import { formatRate, MIN_SAMPLE, type BestVersion, type ResumeStatsSummary } from "@/lib/resumes/stats";

type Version = { id: string; version: number; label: string };

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function Headline({ best }: { best: BestVersion }) {
  if (best.kind === "winner") {
    const { stats, others } = best;
    const otherRate = others.submitted ? others.responded / others.submitted : 0;
    return (
      <>
        <p className="font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">
          {best.multiplier !== null && best.multiplier >= 1.05 ? (
            <>
              v{best.version} gets <span className="text-moss">{best.multiplier.toFixed(1)}x</span> more replies
            </>
          ) : best.multiplier !== null ? (
            <>v{best.version} is neck and neck with the rest</>
          ) : (
            <>v{best.version} is the only version getting replies so far</>
          )}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          In your recorded applications, v{best.version} heard back on {stats.responded} of {stats.submitted} ({formatRate(stats.responseRate)})
          {others.submitted ? ` vs ${others.responded} of ${others.submitted} (${formatRate(otherRate)}) for your other versions` : ""}.{" "}
          <span className="text-muted">Different roles, timing or companies can explain some of that — it&apos;s a clue, not a verdict.</span>
        </p>
      </>
    );
  }
  if (best.kind === "too-early") {
    return (
      <>
        <p className="font-display text-2xl font-semibold leading-tight">Too early to crown a winner</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          v{best.version} has {plural(best.stats.responded, "reply")} from {plural(best.stats.submitted, "application")}. A few leaves don&apos;t make a
          trend yet — once two versions each have {MIN_SAMPLE}+ submissions, Nib will compare them properly.
        </p>
      </>
    );
  }
  return (
    <>
      <p className="font-display text-2xl font-semibold leading-tight">No scores yet</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Pick a resume version when you log an application and Nib will start keeping score: replies, interviews and offers per version.
      </p>
    </>
  );
}

/**
 * Headline insight plus a small hand-rolled bar chart of reply rate per version.
 * Single series, the leader emphasized; values are always printed so identity
 * and magnitude never depend on color.
 */
export function PerformanceCard({ versions, summary, best }: { versions: Version[]; summary: ResumeStatsSummary; best: BestVersion }) {
  const rows = versions.filter((v) => (summary.byResume[v.id]?.submitted ?? 0) > 0);
  const maxRate = Math.max(0, ...rows.map((v) => summary.byResume[v.id].responseRate ?? 0));
  // Round the scale up to the next 10% (min 20%) so small rates stay readable but honest.
  const scale = Math.min(1, Math.max(0.2, Math.ceil(maxRate * 10) / 10));
  const leaderId = best.kind === "winner" ? best.id : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">Version scoreboard</p>
          <Headline best={best} />
        </div>
        <Mascot name="nib" mood={best.kind === "winner" ? "cheer" : "think"} className="hidden size-20 shrink-0 sm:block" />
      </div>

      {rows.length ? (
        <figure className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <figcaption className="mb-3 flex items-baseline justify-between gap-2 text-xs text-muted">
            <span>Reply rate by version</span>
            <span className="tabular">scale 0–{Math.round(scale * 100)}%</span>
          </figcaption>
          <ul className="flex flex-col gap-2.5" aria-hidden>
            {rows.map((v) => {
              const s = summary.byResume[v.id];
              const rate = s.responseRate ?? 0;
              const pct = Math.min(100, (rate / scale) * 100);
              const lead = v.id === leaderId;
              return (
                <li key={v.id} className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3">
                  <span className={`text-sm font-semibold tabular ${lead ? "text-ink" : "text-ink-soft"}`}>v{v.version}</span>
                  <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-3 w-full overflow-visible">
                    <title>{`v${v.version} · ${v.label}: ${s.responded} of ${s.submitted} replied (${formatRate(s.responseRate)})`}</title>
                    <rect x="0" y="0" width="100" height="12" rx="1.5" ry="6" fill="var(--paper-2)" />
                    {pct > 0 ? <rect x="0" y="0" width={Math.max(pct, 2)} height="12" rx="1.5" ry="6" fill={lead ? "var(--moss)" : "var(--line-strong)"} /> : null}
                  </svg>
                  <span className="text-right text-xs tabular text-ink-soft">
                    <span className="font-semibold text-ink">{formatRate(s.responseRate)}</span>
                    <span className="text-muted"> · {s.responded}/{s.submitted}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <table className="sr-only">
            <caption>Reply rate by resume version</caption>
            <thead>
              <tr>
                <th scope="col">Version</th>
                <th scope="col">Submitted</th>
                <th scope="col">Replies</th>
                <th scope="col">Interviews</th>
                <th scope="col">Offers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const s = summary.byResume[v.id];
                return (
                  <tr key={v.id}>
                    <th scope="row">{`v${v.version} ${v.label}`}</th>
                    <td>{s.submitted}</td>
                    <td>{`${s.responded} (${formatRate(s.responseRate)})`}</td>
                    <td>{`${s.interviews} (${formatRate(s.interviewRate)})`}</td>
                    <td>{s.offers}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </figure>
      ) : (
        <div className="h-5 sm:h-6" />
      )}

      {summary.unattached > 0 ? (
        <p className="border-t border-line bg-paper/60 px-5 py-3 text-sm text-ink-soft sm:px-6">
          {plural(summary.unattached, "submitted application")} {summary.unattached === 1 ? "doesn't" : "don't"} have a resume version yet.{" "}
          <Link href="/applications" className="font-medium text-moss underline underline-offset-4">
            Tag them
          </Link>{" "}
          to sharpen these numbers.
        </p>
      ) : null}
    </Card>
  );
}
