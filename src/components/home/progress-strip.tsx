import Link from "next/link";

import { LevelBadge } from "@/components/game/level-badge";
import { StreakFlame } from "@/components/game/streak";
import { WeeklyGoalRing } from "@/components/game/weekly-goal-ring";
import { XpBar } from "@/components/game/xp-bar";
import type { GameState } from "@/lib/game";

/** Level + XP, the weekly pebble ring, and the rhythm sprout in one calm strip. */
export function ProgressStrip({ game }: { game: GameState }) {
  const goal = Math.max(1, game.weeklyGoal);
  const left = Math.max(0, goal - game.thisWeekCount);
  const weekLine =
    left === 0
      ? "Weekly plan complete. You can stop here."
      : game.thisWeekCount === 0
        ? `${goal} this week, whenever it fits.`
        : `${left} more and this week is done.`;

  return (
    <section aria-labelledby="progress-heading" className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="progress-heading" className="text-lg font-semibold">
          Your growth
        </h2>
        <Link
          href="/achievements"
          className="-mr-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-moss hover:bg-moss-soft"
        >
          Badges <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_auto_minmax(0,1fr)] md:items-center md:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <LevelBadge game={game} size="md" />
          <XpBar game={game} />
        </div>

        <div className="grid grid-cols-2 items-center gap-4 border-t border-line pt-5 md:contents md:border-0 md:pt-0">
          <div className="flex flex-col items-center gap-1">
            <WeeklyGoalRing game={game} size={92} showCaption={false} />
            <p className="max-w-[18ch] text-center text-xs leading-snug text-muted">{weekLine}</p>
          </div>
          <StreakFlame
            weeks={game.weekStreak}
            freezes={game.freezes}
            best={game.bestStreak}
            size={48}
            className="flex-col items-start! min-[400px]:flex-row min-[400px]:items-center! md:border-l md:border-line md:pl-8"
          />
        </div>
      </div>
    </section>
  );
}
