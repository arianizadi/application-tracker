import Link from "next/link";

import type { ResumeListItem } from "@/lib/resumes/queries";
import { formatRate, type VersionStats } from "@/lib/resumes/stats";
import { formatBytes, type ResumeDiff } from "@/lib/resumes/text";

import { formatDate, relativeTime } from "./format";
import { VersionActions } from "./version-actions";

export function DiffSummary({ diff, fromVersion, compact = false }: { diff: ResumeDiff; fromVersion: number; compact?: boolean }) {
  const unchanged = diff.wordsAdded === 0 && diff.wordsRemoved === 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-soft">
        <span className="text-muted">Since v{fromVersion}: </span>
        {unchanged ? (
          "same words, new file"
        ) : (
          <>
            <span className="font-medium text-moss-strong tabular">+{diff.wordsAdded.toLocaleString()}</span>
            <span className="text-muted"> / </span>
            <span className="font-medium text-coral tabular">−{diff.wordsRemoved.toLocaleString()}</span>
            <span className="text-muted"> words</span>
          </>
        )}
      </p>
      {diff.topAdded.length || diff.topRemoved.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={`Top term changes since v${fromVersion}`}>
          {diff.topAdded.slice(0, compact ? 4 : 6).map((t) => (
            <li key={`a-${t}`} className="rounded-full bg-moss-soft px-2.5 py-0.5 font-mono text-xs text-moss-strong">
              <span className="sr-only">added </span>+{t}
            </li>
          ))}
          {diff.topRemoved.slice(0, compact ? 3 : 6).map((t) => (
            <li key={`r-${t}`} className="rounded-full bg-coral-soft px-2.5 py-0.5 font-mono text-xs text-coral line-through decoration-coral/50">
              <span className="sr-only">removed </span>−{t}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function StatGrid({ stats }: { stats: VersionStats }) {
  const items = [
    { label: "Used in", value: stats.used.toString(), sub: stats.used === 1 ? "application" : "applications" },
    { label: "Reply rate", value: formatRate(stats.responseRate), sub: stats.submitted ? `${stats.responded} of ${stats.submitted}` : "no data yet" },
    { label: "Interviews", value: stats.interviews.toString(), sub: stats.submitted ? formatRate(stats.interviewRate) : "—" },
    { label: "Offers", value: stats.offers.toString(), sub: stats.offers ? "let's go" : "—" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-paper-2/70 px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{item.label}</dt>
          <dd className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold tabular">{item.value}</span>
            <span className="truncate text-xs text-muted">{item.sub}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Newest-first timeline of resume versions with stats, diffs and actions. */
export function VersionTimeline({
  items,
  stats,
  leaderId,
  timeZone,
  now,
}: {
  items: ResumeListItem[];
  stats: Record<string, VersionStats>;
  leaderId: string | null;
  timeZone: string;
  now: Date;
}) {
  return (
    <ol className="flex flex-col gap-4" aria-label="Resume versions, newest first">
      {items.map((item, index) => {
        const s = stats[item.id];
        const lead = item.id === leaderId;
        const last = index === items.length - 1;
        return (
          <li key={item.id} className="relative pl-12 sm:pl-14">
            {!last ? <span aria-hidden className="absolute bottom-[-1rem] left-5 top-12 w-px bg-line-strong sm:left-[1.375rem]" /> : null}
            <span
              aria-hidden
              className={`absolute left-0 top-4 grid size-10 place-items-center rounded-full border-2 font-display text-sm font-semibold tabular sm:size-11 ${
                lead ? "border-sun bg-sun-soft text-ink" : item.isDefault ? "border-moss bg-moss-soft text-moss-strong" : "border-line-strong bg-card text-ink-soft"
              }`}
            >
              v{item.version}
            </span>
            <article className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5" aria-labelledby={`resume-${item.id}`}>
              <header className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id={`resume-${item.id}`} className="min-w-0 text-lg font-semibold leading-snug">
                    <Link href={`/resumes/${item.id}`} className="hover:underline hover:underline-offset-4">
                      <span className="sr-only">Version {item.version}: </span>
                      {item.label}
                    </Link>
                  </h3>
                  {item.isDefault ? (
                    <span className="rounded-full border border-moss/30 bg-moss-soft px-2.5 py-0.5 text-xs font-medium text-moss-strong">Default</span>
                  ) : null}
                  {lead ? <span className="rounded-full border border-sun/60 bg-sun-soft px-2.5 py-0.5 text-xs font-medium text-ink">Most replies</span> : null}
                </div>
                <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted">
                  <time dateTime={item.createdAt.toISOString()} title={formatDate(item.createdAt, timeZone)}>
                    {formatDate(item.createdAt, timeZone)} · {relativeTime(item.createdAt, now)}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{item.hasFile ? `PDF ${formatBytes(item.sizeBytes)}` : "Pasted text"}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular">{item.words.toLocaleString()} words</span>
                </p>
              </header>

              {item.notes ? <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{item.notes}</p> : null}

              <div className="mt-4">
                <StatGrid stats={s} />
              </div>

              {item.diff ? (
                <div className="mt-4 border-t border-dashed border-line pt-3">
                  <DiffSummary diff={item.diff} fromVersion={item.diff.fromVersion} compact />
                </div>
              ) : null}

              <div className="mt-4">
                <VersionActions
                  id={item.id}
                  version={item.version}
                  label={item.label}
                  notes={item.notes}
                  isDefault={item.isDefault}
                  hasFile={item.hasFile}
                  usedCount={s.used}
                  showDetails
                />
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
