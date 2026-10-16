import type { Metadata } from "next";
import { Suspense } from "react";

import { StatsEmptyPreview } from "@/components/stats/empty-preview";
import { RangeTabs } from "@/components/stats/range-tabs";
import { StatsDashboard } from "@/components/stats/stats-dashboard";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { computeStats, parseRange, STATS_RANGES } from "@/lib/stats/compute";

export const metadata: Metadata = {
  title: "Stats",
  description: "How your internship search is going: reply rates, interviews, rhythm and what's working.",
};

export default function StatsPage({ searchParams }: PageProps<"/stats">) {
  return (
    <>
      <PageHeader
        eyebrow="Stats & insights"
        title="How's the hunt going?"
        description="Your numbers, honest context, and what seems to be working. No judgment, just a clearer map."
      />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function StatsContent({ searchParams }: { searchParams: PageProps<"/stats">["searchParams"] }) {
  const user = await requireUser();
  const [snapshot, params] = await Promise.all([getSnapshot(user.id), searchParams]);
  const range = parseRange(params.range);
  // Clock reads must come after runtime data under Cache Components.
  const now = new Date();
  const stats = computeStats(snapshot, now, user.timeZone, { range, weeklyGoal: user.weeklyGoal });

  if (stats.totals.submittedAllTime < 3) {
    return (
      <StatsEmptyPreview
        submitted={stats.totals.submittedAllTime}
        wishlist={stats.totals.wishlist}
        now={now}
        timeZone={user.timeZone}
        track={user.track}
      />
    );
  }

  const rangeMeta = STATS_RANGES.find((r) => r.key === range);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RangeTabs value={range} />
        <p className="text-sm text-muted">
          {range === "all" ? "Everything you've sent." : `Applications sent in the ${rangeMeta?.label.toLowerCase()}.`} Pipeline shows everything right now; weekly rhythm and canopy cover recent weeks.
        </p>
      </div>
      <StatsDashboard stats={stats} track={user.track} />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div role="status" aria-label="Loading stats" className="flex flex-col gap-6">
      <Skeleton className="h-12 w-64 rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-3xl" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-3xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
      </div>
    </div>
  );
}
