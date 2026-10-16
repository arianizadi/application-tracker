/**
 * "Your rhythm": a weekly streak drawn as a plant that grows with consecutive
 * goal-met weeks. Seed → sprout → seedling → sapling → little tree.
 */

function stageFor(weeks: number): 0 | 1 | 2 | 3 | 4 {
  if (weeks <= 0) return 0;
  if (weeks <= 2) return 1;
  if (weeks <= 5) return 2;
  if (weeks <= 11) return 3;
  return 4;
}

function Plant({ stage }: { stage: 0 | 1 | 2 | 3 | 4 }) {
  const leafA = "var(--leaf)";
  const leafB = "var(--moss)";
  switch (stage) {
    case 0:
      return (
        <g>
          <ellipse cx="24" cy="45" rx="4.5" ry="3.5" fill="var(--sun)" />
          <path d="M24 42.5v-2" stroke="var(--leaf)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 1:
      return (
        <g>
          <path d="M24 47V35" stroke={leafB} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 39c-5 0-7.5-3.5-6.5-7 3.5 0 6.5 2.8 6.5 7Z" fill={leafA} />
          <path d="M24 36.5c4.5 0 7-3.2 6.5-7-3.6 0-6.5 2.8-6.5 7Z" fill={leafB} />
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M24 47V22" stroke={leafB} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 42c-6 0-8.5-4-7.5-8 4 0 7.5 3 7.5 8Z" fill={leafA} />
          <path d="M24 37c6 0 8.5-4 7.5-8-4 0-7.5 3-7.5 8Z" fill={leafB} />
          <path d="M24 31c-5 0-7-3.5-6.2-7 3.4 0 6.2 2.7 6.2 7Z" fill={leafB} />
          <path d="M24 26c4.5 0 6.5-3 5.8-6.5-3.2 0-5.8 2.5-5.8 6.5Z" fill={leafA} />
        </g>
      );
    case 3:
      return (
        <g>
          <path d="M24 47V27M24 34l-4-3.5" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="17" cy="25" r="6.5" fill={leafB} />
          <circle cx="31" cy="25" r="6.5" fill={leafB} />
          <circle cx="24" cy="18.5" r="9" fill={leafA} />
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M24 47V26M24 36l-5-4M24 33l5-4" stroke="var(--bark)" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="14" cy="23" r="7.5" fill={leafB} />
          <circle cx="34" cy="23" r="7.5" fill={leafB} />
          <circle cx="24" cy="14" r="10.5" fill={leafA} />
          <circle cx="19" cy="12" r="1.6" fill="var(--berry)" />
          <circle cx="29" cy="16" r="1.6" fill="var(--berry)" />
          <circle cx="15" cy="24" r="1.6" fill="var(--berry)" />
          <circle cx="33" cy="21" r="1.6" fill="var(--berry)" />
        </g>
      );
  }
}

export function StreakFlame({
  weeks,
  freezes = 0,
  best,
  size = 56,
  showLabel = true,
  className = "",
}: {
  /** Consecutive goal-met weeks (GameState.weekStreak). */
  weeks: number;
  /** Rain checks held (GameState.freezes). */
  freezes?: number;
  /** Best run ever (GameState.bestStreak). */
  best?: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const stage = stageFor(weeks);
  const title = weeks > 0 ? `${weeks}-week rhythm` : "Rhythm starts this week";

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 48 56"
        width={size}
        height={size * (56 / 48)}
        role="img"
        aria-label={`${title}${freezes ? `, ${freezes} rain check${freezes === 1 ? "" : "s"} saved` : ""}`}
        className="shrink-0 overflow-visible"
      >
        <path d="M5 50.5Q24 40 43 50.5Z" fill="var(--bark)" opacity="0.85" />
        <g className="origin-bottom animate-sway [transform-box:fill-box]">
          <Plant stage={stage} />
        </g>
        {Array.from({ length: Math.min(freezes, 2) }, (_, i) => (
          <path
            key={i}
            d="M0 -4.5C2.5 -1.5 3 0.4 3 1.4a3 3 0 0 1-6 0c0-1 .5-2.9 3-5.9Z"
            transform={`translate(${41 - i * 7} 9)`}
            fill="var(--sky)"
            stroke="var(--card)"
            strokeWidth="0.8"
          />
        ))}
      </svg>
      {showLabel ? (
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight">
            {weeks > 0 ? (
              <>
                <span className="tabular">{weeks}</span>-week rhythm
              </>
            ) : (
              "Fresh week"
            )}
          </p>
          <p className="text-xs text-muted">
            {weeks > 0
              ? best && best > weeks
                ? `Best: ${best} weeks`
                : "Keep it gentle."
              : "Your forest is still here."}
            {freezes > 0 ? ` · ${freezes} rain check${freezes === 1 ? "" : "s"}` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Alias with a more forest-y name. */
export const StreakSprout = StreakFlame;
