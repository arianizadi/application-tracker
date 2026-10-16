import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Mascot } from "@/components/mascots";
import { formatDate, relativeTime } from "@/components/resumes/format";
import { RIcon } from "@/components/resumes/icons";
import { ResumeTextPanel } from "@/components/resumes/text-panel";
import { VersionActions } from "@/components/resumes/version-actions";
import { DiffSummary, StatGrid } from "@/components/resumes/version-timeline";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { getResumeDetail } from "@/lib/resumes/queries";
import { computeResumeStats, emptyStats } from "@/lib/resumes/stats";
import { formatBytes } from "@/lib/resumes/text";

export const metadata: Metadata = { title: "Resume version" };

export default async function ResumeDetailPage({ params }: PageProps<"/resumes/[id]">) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  const [detail, snapshot] = await Promise.all([getResumeDetail(user.id, id), getSnapshot(user.id)]);
  if (!detail) notFound();
  const now = new Date();

  const stats = computeResumeStats(snapshot.applications, [detail]).byResume[detail.id] ?? emptyStats();
  const linked = snapshot.applications
    .filter((a) => a.resumeId === detail.id)
    .sort((a, b) => (b.appliedAt ?? b.createdAt).getTime() - (a.appliedAt ?? a.createdAt).getTime());
  const weakText = detail.text.length < 200;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/resumes" className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          <RIcon name="back" />
          All versions
        </Link>
      </div>

      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className={`grid size-14 shrink-0 place-items-center rounded-2xl border-2 font-display text-lg font-semibold ${
              detail.isDefault ? "border-moss bg-moss-soft text-moss-strong" : "border-line-strong bg-card text-ink-soft"
            }`}
          >
            v{detail.version}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              Version {detail.version}
              {detail.isDefault ? " · Default" : ""}
            </p>
            <h1 className="mt-1 break-words text-3xl font-semibold leading-[1.1] sm:text-4xl">{detail.label}</h1>
            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-muted">
              <time dateTime={detail.createdAt.toISOString()}>
                Saved {formatDate(detail.createdAt, user.timeZone)} ({relativeTime(detail.createdAt, now)})
              </time>
              <span aria-hidden>·</span>
              <span>{detail.hasFile ? `PDF ${formatBytes(detail.sizeBytes)}` : "Pasted text"}</span>
              <span aria-hidden>·</span>
              <span className="tabular">{detail.words.toLocaleString()} words</span>
            </p>
            {detail.fileName ? <p className="mt-1 truncate font-mono text-xs text-muted">{detail.fileName}</p> : null}
          </div>
        </div>
        <VersionActions
          id={detail.id}
          version={detail.version}
          label={detail.label}
          notes={detail.notes}
          isDefault={detail.isDefault}
          hasFile={detail.hasFile}
          usedCount={stats.used}
          afterDeleteHref="/resumes"
        />
      </header>

      {weakText ? (
        <div role="note" className="flex items-start gap-3 rounded-3xl border border-sun/60 bg-sun-soft p-4">
          <Mascot name="nib" mood="think" className="size-12 shrink-0" />
          <p className="text-sm leading-relaxed">
            We could barely read any text from this PDF — it might be scanned. Open <strong>Extracted text</strong> below and paste your resume so the
            analyzer can actually help.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="pb-5 sm:pb-6">
            <CardHeader title="How it's doing" description="From applications you've linked to this version." />
            <div className="px-5 pt-4 sm:px-6">
              <StatGrid stats={stats} />
              {stats.submitted > 0 && stats.submitted < 3 ? (
                <p className="mt-3 text-sm text-muted">Only {stats.submitted} sent so far — too early to read much into the rates.</p>
              ) : null}
            </div>
          </Card>

          <ResumeTextPanel
            id={detail.id}
            version={detail.version}
            label={detail.label}
            notes={detail.notes}
            text={detail.text}
            words={detail.words}
            defaultOpen={weakText}
          />

          <Card className="pb-2">
            <CardHeader title="Sent with this version" description={linked.length ? `${linked.length} linked` : undefined} />
            {linked.length ? (
              <ul className="mt-3 divide-y divide-line">
                {linked.slice(0, 50).map((app) => (
                  <li key={app.id}>
                    <Link
                      href={`/applications/${app.id}`}
                      className="flex min-h-14 items-center justify-between gap-3 px-5 py-3 hover:bg-paper-2/60 sm:px-6"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{app.company}</span>
                        <span className="block truncate text-sm text-muted">{app.role}</span>
                      </span>
                      <StatusPill status={app.status} className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-4 pt-3 text-sm text-ink-soft sm:px-6">
                Nothing linked yet. Pick this version when you{" "}
                <Link href="/applications/new" className="font-medium text-moss underline underline-offset-4">
                  log an application
                </Link>{" "}
                and its scoreboard starts filling in.
              </p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Notes</h2>
            {detail.notes ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{detail.notes}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">No notes yet. Use Edit to jot down what changed in this version.</p>
            )}
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold">What changed</h2>
            <div className="mt-2">
              {detail.diff ? (
                <>
                  <DiffSummary diff={detail.diff} fromVersion={detail.diff.fromVersion} />
                  <Link href={`/resumes/${detail.diff.fromId}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-moss underline underline-offset-4">
                    View v{detail.diff.fromVersion}
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted">This is the first version — the one that started the paper trail.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
