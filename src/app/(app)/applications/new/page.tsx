import type { Metadata } from "next";
import Link from "next/link";

import { ApplicationForm } from "@/components/applications/application-form";
import { emptyFormValues } from "@/lib/applications/types";
import { AppIcon } from "@/components/applications/icons";
import { PageHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { dateKeyInZone } from "@/lib/applications/dates";
import { getResumeOptions } from "@/lib/applications/queries";
import { MAX, normalizeUrl } from "@/lib/applications/schema";
import { ACTIVE_STATUSES } from "@/lib/status";

export const metadata: Metadata = { title: "New application" };

const str = (v: string | string[] | undefined, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default async function NewApplicationPage({ searchParams }: PageProps<"/applications/new">) {
  const user = await requireUser();
  const [resumes, params] = await Promise.all([getResumeOptions(user.id), searchParams]);
  const todayKey = dateKeyInZone(new Date(), user.timeZone);

  // Deep links: /applications/new?status=WISHLIST&company=Acme&role=SOC%20Intern&url=...
  const status = ACTIVE_STATUSES.find((s) => s === str(params.status, 20).toUpperCase()) ?? "APPLIED";
  const defaultResume = resumes.find((r) => r.isDefault)?.id ?? "";
  const initial = {
    ...emptyFormValues(todayKey, status === "WISHLIST" ? "" : defaultResume),
    status,
    company: str(params.company, MAX.company),
    role: str(params.role, MAX.role),
    url: normalizeUrl(str(params.url, MAX.url)) ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/applications" className="-ml-2 mb-4 inline-flex h-10 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted hover:text-ink">
        <AppIcon name="back" className="size-4" /> Applications
      </Link>
      <PageHeader
        eyebrow={status === "WISHLIST" ? "Save for later" : "Just applied?"}
        title={status === "WISHLIST" ? "Save a role for later" : "Plant an application"}
        description="Only company and role are required. The details can catch up — and your draft saves on this device as you type."
      />
      <ApplicationForm mode="create" initial={initial} resumes={resumes} todayKey={todayKey} autosaveKey="application:new" />
    </div>
  );
}
