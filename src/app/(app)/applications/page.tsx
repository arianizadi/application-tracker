import type { Metadata } from "next";

import { ApplicationsView } from "@/components/applications/applications-view";
import { requireUser } from "@/lib/auth/dal";
import { dateKeyInZone } from "@/lib/applications/dates";
import { filtersFromSearchParams } from "@/lib/applications/filter";
import { listApplications } from "@/lib/applications/queries";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  const user = await requireUser();
  const [items, params] = await Promise.all([listApplications(user.id), searchParams]);
  // Runtime data is awaited above, so reading the clock here is allowed.
  const now = new Date();

  return (
    <ApplicationsView
      items={items}
      todayKey={dateKeyInZone(now, user.timeZone)}
      nowMs={now.getTime()}
      initialFilters={filtersFromSearchParams(params)}
    />
  );
}
