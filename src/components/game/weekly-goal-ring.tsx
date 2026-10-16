import type { CSSProperties } from "react";

import type { GameState } from "@/lib/game";

/**
 * Weekly goal as a ring of moss-covered pebbles (one per application in the
 * goal). Falls back to a smooth ring for very large goals.
 */
export function WeeklyGoalRing({
  game,
  size = 112,
  showCaption = true,
  className = "",
}: {
  game: Pick<GameState, "thisWeekCount" | "weeklyGoal">;
  size?: number;
  showCaption?: boolean;
  className?: string;
}) {
  const goal = Math.max(1, game.weeklyGoal);
  const count = game.thisWeekCount;
  const met = count >= goal;
  const extra = Math.max(0, count - goal);
  const usePebbles = goal <= 12;
  const pebble = goal <= 6 ? 8 : goal <= 9 ? 6.5 : 5.2;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="size-full"
          role="img"
          aria-label={`${count} of ${goal} applications this week${met ? ", goal met" : ""}`}
        >
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 4" />
          {usePebbles ? (
            Array.from({ length: goal }, (_, i) => {
              const a = (i / goal) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(a) * 38;
              const y = 50 + Math.sin(a) * 38;
              const filled = i < count;
              return (
                <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
                  <ellipse
                    rx={pebble}
                    ry={pebble * 0.82}
                    fill={filled ? "var(--bark)" : "var(--paper-2)"}
                    stroke={filled ? "none" : "var(--line-strong)"}
                    strokeWidth="1.2"
                  />
                  {filled ? (
                    <path
                      d={`M${-pebble * 0.95} ${-pebble * 0.1}Q0 ${-pebble * 1.25} ${pebble * 0.95} ${-pebble * 0.1}Q0 ${-pebble * 0.45} ${-pebble * 0.95} ${-pebble * 0.1}Z`}
                      fill="var(--leaf)"
                      className="animate-pop"
                      style={{ animationDelay: `${i * 70}ms` }}
                    />
                  ) : null}
                </g>
              );
            })
          ) : (
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="var(--moss)"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              transform="rotate(-90 50 50)"
              style={{ "--off": 100 - Math.min(100, Math.round((count / goal) * 100)) } as CSSProperties}
              className="transition-[stroke-dashoffset] duration-1000 ease-out [stroke-dashoffset:var(--off)] starting:[stroke-dashoffset:100] motion-reduce:transition-none"
            />
          )}
        </svg>
        <div aria-hidden className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl font-semibold leading-none tabular">
              {Math.min(count, goal)}
              <span className="text-base text-muted">/{goal}</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {extra > 0 ? `+${extra} bonus` : "this week"}
            </p>
          </div>
        </div>
      </div>
      {showCaption ? (
        <p className="text-center text-xs text-ink-soft">
          {met ? "Goal met. Anything extra is bonus sunshine." : `${goal - count} more to meet your goal`}
        </p>
      ) : null}
    </div>
  );
}
