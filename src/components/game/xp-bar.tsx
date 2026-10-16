import type { CSSProperties } from "react";

import type { GameState } from "@/lib/game";

/**
 * XP progress toward the next level. Fill animates in on first paint with
 * CSS @starting-style (no JS), and respects reduced motion.
 */
export function XpBar({
  game,
  showLabels = true,
  className = "",
}: {
  game: Pick<GameState, "xp" | "level" | "nextLevel" | "levelProgress" | "levelXp" | "levelSpan">;
  showLabels?: boolean;
  className?: string;
}) {
  const pct = Math.round(game.levelProgress * 1000) / 10;
  const remaining = game.nextLevel ? game.nextLevel.minXp - game.xp : 0;

  return (
    <div className={`min-w-0 ${className}`}>
      {showLabels ? (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold tabular">
            {game.xp.toLocaleString("en-US")} <span className="font-normal text-muted">XP</span>
          </span>
          <span className="truncate text-right text-muted tabular">
            {game.nextLevel ? (
              <>
                {remaining.toLocaleString("en-US")} to <span className="text-ink-soft">{game.nextLevel.name}</span>
              </>
            ) : (
              "Max level. XP keeps growing."
            )}
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={game.nextLevel ? `Progress to ${game.nextLevel.name}` : "Level progress"}
        aria-valuemin={0}
        aria-valuemax={game.levelSpan || 1}
        aria-valuenow={game.nextLevel ? game.levelXp : 1}
        aria-valuetext={game.nextLevel ? `${game.levelXp} of ${game.levelSpan} XP` : "Top level reached"}
        className="relative h-3.5 overflow-hidden rounded-full bg-moss-soft ring-1 ring-inset ring-moss/15"
      >
        <div
          style={{ "--xp": `${pct}%` } as CSSProperties}
          className="relative h-full w-(--xp) rounded-full bg-gradient-to-r from-moss to-leaf transition-[width] duration-1000 ease-out starting:w-0 motion-reduce:transition-none"
        >
          <span aria-hidden className="absolute inset-y-0.5 left-1.5 right-1.5 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
