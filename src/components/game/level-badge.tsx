import type { CSSProperties } from "react";

import type { GameState } from "@/lib/game";

const SIZES = { sm: 44, md: 64, lg: 112 } as const;

/** Level number inside a growing progress ring, with the level name beside it. */
export function LevelBadge({
  game,
  size = "md",
  showName = true,
  className = "",
}: {
  game: Pick<GameState, "level" | "nextLevel" | "levelProgress">;
  size?: keyof typeof SIZES;
  showName?: boolean;
  className?: string;
}) {
  const px = SIZES[size];
  const pct = Math.round(game.levelProgress * 100);
  const label = game.nextLevel
    ? `Level ${game.level.index}, ${game.level.name}. ${pct}% of the way to ${game.nextLevel.name}.`
    : `Level ${game.level.index}, ${game.level.name}. Top level reached.`;

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`} role="img" aria-label={label}>
      <div className="relative shrink-0" style={{ width: px, height: px }}>
        <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="20" fill="var(--card)" stroke="var(--moss-soft)" strokeWidth="4.5" />
          {pct > 0 ? (
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--moss)"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              style={{ "--off": 100 - pct } as CSSProperties}
              className="transition-[stroke-dashoffset] duration-1000 ease-out [stroke-dashoffset:var(--off)] starting:[stroke-dashoffset:100] motion-reduce:transition-none"
            />
          ) : null}
        </svg>
        <span
          aria-hidden
          className={`absolute inset-0 grid place-items-center font-display font-semibold tabular text-ink ${
            size === "lg" ? "text-4xl" : size === "md" ? "text-xl" : "text-base"
          }`}
        >
          {game.level.index}
        </span>
        {size !== "sm" ? (
          <svg viewBox="0 0 16 16" aria-hidden className="absolute -right-1 -top-1 size-5 animate-sway text-leaf">
            <path d="M3 13C3 7 7 3 13 3c0 6-4 10-10 10Z" fill="currentColor" />
            <path d="M3 13 9 7" stroke="var(--moss-strong)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : null}
      </div>
      {showName ? (
        <div aria-hidden className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Level {game.level.index}</p>
          <p className={`truncate font-display font-semibold leading-tight ${size === "lg" ? "text-2xl" : "text-base"}`}>{game.level.name}</p>
        </div>
      ) : null}
    </div>
  );
}
