import type { Metadata } from "next";
import { Suspense } from "react";

import { QuestList } from "@/components/game/quest-list";
import { ActivityFeed } from "@/components/home/activity-feed";
import { AttentionList } from "@/components/home/attention-list";
import {
  firstName,
  forestSummary,
  greeting,
  needsAttention,
  pickHomeMascot,
  recentActivity,
  todayLabel,
} from "@/components/home/context";
import { ForestGuide, HomeHero } from "@/components/home/hero";
import { HomeQuickAdd } from "@/components/home/home-quick-add";
import { MascotNote } from "@/components/home/mascot-note";
import { MiniStats } from "@/components/home/mini-stats";
import { OfferCelebration } from "@/components/home/offer-celebration";
import { PrepRecommendations } from "@/components/home/prep-recs";
import { ProgressStrip } from "@/components/home/progress-strip";
import { WelcomeCard } from "@/components/home/welcome-card";
import { PrepProgressCard } from "@/components/prep/progress-card";
import { Card, CardHeader, Skeleton } from "@/components/ui/card";
import { dateKeyInZone } from "@/lib/applications/dates";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { deriveForest } from "@/lib/forest/derive";
import { computeGame } from "@/lib/game";
import { getGameMemory } from "@/lib/game/memory";
import { getRecommendations } from "@/lib/prep/detections";
import { computeStats } from "@/lib/stats/compute";

export const metadata: Metadata = {
  title: "Home",
  description: "Your forest, this week's quests, and what needs attention.",
};

const SEASON_LABEL = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" } as const;

export default function HomePage({ searchParams }: PageProps<"/home">) {
  // Everything here is per-user, so the page-specific skeleton is the static shell.
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

/** Mirrors the home layout: hero, field guide, then the two-column grid. */
function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading your forest" className="flex flex-col gap-6 lg:gap-8">
      <div>
        <div className="relative -mx-4 -mt-6 sm:mx-0 sm:mt-0">
          <div className="h-[55svh] min-h-[340px] max-h-[620px] animate-pulse bg-paper-2 sm:aspect-[2/1] sm:h-auto sm:min-h-0 sm:max-h-none sm:rounded-[2rem] lg:aspect-[1200/520]" />
        </div>
        <Skeleton className="mt-4 h-12 rounded-3xl" />
      </div>
      <Skeleton className="h-24 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6 lg:gap-8">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <div className="flex flex-col gap-6 lg:gap-8">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/home">["searchParams"] }) {
  const user = await requireUser();
  const [snapshot, memory, params] = await Promise.all([getSnapshot(user.id), getGameMemory(user.id), searchParams]);
  // Runtime data has been awaited, so reading the clock is allowed here.
  const now = new Date();
  const timeZone = user.timeZone || "UTC";
  const todayKey = dateKeyInZone(now, timeZone);
  const welcomeParam = Array.isArray(params.welcome) ? params.welcome[0] : params.welcome;
  const welcome = welcomeParam === "1";

  const forest = deriveForest(snapshot, now, timeZone, { weeklyGoal: user.weeklyGoal });
  const game = computeGame(snapshot, user, now, memory);
  const stats = computeStats(snapshot, now, timeZone, { weeklyGoal: user.weeklyGoal });
  const recommendations = getRecommendations(snapshot, user.track, now, todayKey);
  const note = pickHomeMascot({ snapshot, forest, now, todayKey, welcome });
  const attention = needsAttention(snapshot.applications, todayKey, now);
  const activity = recentActivity(snapshot);

  const name = firstName(user.name);
  const steps = {
    plant: snapshot.applications.length > 0,
    resume: snapshot.resumes.length > 0,
    explore: snapshot.analyses.length > 0 || snapshot.progress.length > 0,
  };
  const showWelcome = welcome || snapshot.applications.length === 0;
  const season = (SEASON_LABEL as Record<string, string>)[forest.season] ?? "";

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div>
        <HomeHero
          forest={forest}
          title={greeting(forest.hour, name)}
          eyebrow={[todayLabel(now, timeZone), season].filter(Boolean).join(" · ")}
          summary={forestSummary(forest)}
        />
        <MascotNote note={note} />
        <div className="mt-4">
          <ForestGuide forest={forest} />
        </div>
      </div>

      {note.celebrateOffer ? <OfferCelebration id={note.celebrateOffer.id} company={note.celebrateOffer.company} /> : null}

      {showWelcome ? <WelcomeCard steps={steps} force={welcome} name={name} /> : null}

      {/* Mobile: one column in priority order (order-*). Desktop: two columns. */}
      <div className="order-2 lg:order-none">
        <ProgressStrip game={game} />
      </div>

      <div className="contents lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="contents lg:flex lg:flex-col lg:gap-8">
          <div className="order-1 lg:order-none">
            <HomeQuickAdd />
          </div>
          <div className="order-3 lg:order-none">
            <AttentionList items={attention} />
          </div>
          <div className="order-7 lg:order-none">
            <ActivityFeed items={activity} now={now} timeZone={timeZone} />
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-8">
          <div className="order-4 lg:order-none">
            <Card aria-labelledby="quests-heading">
              <CardHeader
                title={<span id="quests-heading">This week&apos;s quests</span>}
                description="Optional, no penalties. They reshuffle every Monday."
              />
              <QuestList quests={game.quests} className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6" />
            </Card>
          </div>
          {recommendations.length > 0 ? (
            <div className="order-5 lg:order-none">
              <PrepRecommendations items={recommendations} />
            </div>
          ) : null}
          <div className="order-6 lg:order-none">
            <PrepProgressCard snapshot={snapshot} />
          </div>
          <div className="order-8 lg:order-none">
            <MiniStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
