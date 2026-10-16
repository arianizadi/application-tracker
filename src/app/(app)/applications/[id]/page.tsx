import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/applications/application-form";
import { DetailActions } from "@/components/applications/detail-actions";
import { FollowUpPanel } from "@/components/applications/follow-up-panel";
import { Hearts } from "@/components/applications/hearts";
import { AppIcon } from "@/components/applications/icons";
import { StatusPanel } from "@/components/applications/status-panel";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { dateKeyInZone, dateToKey, daysBetweenKeys, formatDateKey, formatInstant } from "@/lib/applications/dates";
import { getApplication, getResumeOptions } from "@/lib/applications/queries";
import { WORK_MODE_LABEL, resumeLabel } from "@/lib/applications/schema";
import type { ApplicationDetail, ApplicationFormValues } from "@/lib/applications/types";

export const metadata: Metadata = { title: "Application" };

function toFormValues(app: ApplicationDetail): ApplicationFormValues {
  return {
    company: app.company,
    role: app.role,
    status: app.status,
    appliedAt: dateToKey(app.appliedAt),
    location: app.location ?? "",
    workMode: app.workMode ?? "",
    url: app.url ?? "",
    source: app.source ?? "",
    salary: app.salary ?? "",
    excitement: String(app.excitement),
    contactName: app.contactName ?? "",
    notes: app.notes ?? "",
    deadline: dateToKey(app.deadline),
    followUpAt: dateToKey(app.followUpAt),
    resumeId: app.resumeId ?? "",
  };
}

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const [app, resumes] = await Promise.all([getApplication(id, user.id), getResumeOptions(user.id)]);
  if (!app) notFound();

  const now = new Date();
  const todayKey = dateKeyInZone(now, user.timeZone);
  const appliedKey = dateToKey(app.appliedAt);
  const appliedDays = appliedKey ? daysBetweenKeys(appliedKey, todayKey) : null;
  const facts = [
    app.location ? { icon: "pin" as const, text: app.location } : null,
    app.workMode ? { icon: "board" as const, text: WORK_MODE_LABEL[app.workMode] } : null,
    app.source ? { icon: "link" as const, text: `via ${app.source}` } : null,
    appliedKey
      ? { icon: "calendar" as const, text: `Applied ${formatDateKey(appliedKey, todayKey)}${appliedDays ? ` · ${appliedDays}d ago` : " · today"}` }
      : null,
  ].filter((f): f is { icon: "pin" | "board" | "link" | "calendar"; text: string } => Boolean(f));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/applications" className="-ml-2 inline-flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
          <AppIcon name="back" className="size-4" /> Applications
        </Link>
        <header className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-semibold leading-[1.1] sm:text-4xl">{app.company}</h1>
            <p className="mt-1.5 break-words text-lg text-ink-soft">{app.role}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {facts.map((f) => (
                <span key={f.text} className="inline-flex min-w-0 max-w-full items-center gap-1.5 [overflow-wrap:anywhere]">
                  <AppIcon name={f.icon} className="size-4 shrink-0" />
                  <span className="min-w-0">{f.text}</span>
                </span>
              ))}
              <Hearts value={app.excitement} />
            </div>
          </div>
          <DetailActions id={app.id} company={app.company} url={app.url} />
        </header>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card className="p-5 sm:p-6">
          <StatusPanel
            id={app.id}
            company={app.company}
            status={app.status}
            history={app.history}
            timeZone={user.timeZone}
            nowMs={now.getTime()}
            todayKey={todayKey}
            minDateKey={appliedKey || dateKeyInZone(app.createdAt, user.timeZone)}
          />
        </Card>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="p-5">
            <FollowUpPanel
              id={app.id}
              followUpAt={app.followUpAt}
              status={app.status}
              todayKey={todayKey}
              company={app.company}
              role={app.role}
              appliedAt={app.appliedAt}
              contactName={app.contactName}
            />
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold leading-tight">Resume sent</h2>
            {app.resume ? (
              <Link href={`/resumes/${app.resume.id}`} className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-paper-2/60 p-3 transition-colors hover:border-line-strong">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-bark">
                  <AppIcon name="file" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{resumeLabel(app.resume)}</span>
                  <span className="block text-xs text-muted">Open in Resumes</span>
                </span>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                None linked yet. Pick the version you sent under <span className="font-medium">Resume version</span> below — future you will thank you.
              </p>
            )}
          </Card>
          <p className="px-1 text-xs text-muted">
            Added {formatInstant(app.createdAt, user.timeZone)} · Updated {formatInstant(app.updatedAt, user.timeZone, true)}
          </p>
        </aside>

        <div className="flex flex-col gap-3 lg:col-start-1">
          <div className="px-1">
            <h2 className="text-xl font-semibold">Details</h2>
            <p className="mt-1 text-sm text-muted">Edits stay as a draft on this device until you save.</p>
          </div>
          <ApplicationForm
            key={app.updatedAt.getTime()}
            mode="edit"
            id={app.id}
            initial={toFormValues(app)}
            resumes={resumes}
            todayKey={todayKey}
            autosaveKey={`application:${app.id}`}
          />
        </div>
      </div>
    </div>
  );
}
