import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PrepIcon } from "@/components/prep/icons";
import { ResourceLibrary } from "@/components/prep/resource-library";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { getModule, RESOURCE_BY_ID, RESOURCES } from "@/content/prep";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { courseOverview } from "@/lib/prep/course";
import { getRecommendations } from "@/lib/prep/detections";
import { toProgressMap } from "@/lib/prep/progress";

export const metadata: Metadata = {
  title: "Resource library · Interview prep",
  description: "Curated, free-first security learning resources with honest costs and time estimates.",
};

export default function ResourcesPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/prep" className="inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-ink-soft hover:text-ink">
          <PrepIcon name="arrow-left" className="size-4" /> Interview prep
        </Link>
      </nav>
      <PageHeader
        eyebrow="Resource library"
        title="Good stuff to learn from"
        description={`${RESOURCES.length} hand-picked courses, labs, references and programs. Free first, costs stated honestly. Prices change, so double-check before paying for anything.`}
      />
      <Suspense fallback={<LibrarySkeleton />}>
        <Library />
      </Suspense>
    </>
  );
}

async function Library() {
  const user = await requireUser();
  const snapshot = await getSnapshot(user.id);
  const now = new Date();
  const map = toProgressMap(snapshot.progress, ["resource", "module", "question"]);

  // "For you now": the detector's picks, then the resources of the module you're on.
  const ids: string[] = [];
  const add = (id: string) => {
    if (RESOURCE_BY_ID[id] && !ids.includes(id)) ids.push(id);
  };
  for (const rec of [...getRecommendations(snapshot, user.track, now)].sort((a, b) => b.priority - a.priority)) rec.resourceIds.forEach(add);
  const upNext = courseOverview(map).upNext;
  if (upNext) getModule(upNext.id)?.resourceIds.slice(0, 3).forEach(add);

  return <ResourceLibrary initial={toProgressMap(snapshot.progress, ["resource"])} recommendedIds={ids.slice(0, 9)} isSecurityTrack={user.track === "cybersecurity"} />;
}

function LibrarySkeleton() {
  return (
    <div role="status" aria-label="Loading the library" className="flex flex-col gap-6">
      <Skeleton className="h-12 w-full rounded-full sm:w-80" />
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
