/**
 * Canopy's gamification engine. `computeGame` is pure and deterministic:
 * the same snapshot, user and `now` always produce the same GameState.
 * Safe to import from Server and Client Components (no server-only deps).
 */
import type { UserSnapshot } from "@/lib/data/snapshot";

import { evaluateAchievements, type AchievementProgress } from "./achievements";
import { levelFor, type Level } from "./levels";
import { pickQuests, type Quest } from "./quests";
import { computeRhythm, computeStats, type GameStats } from "./stats";
import { weekStartDate } from "./time";
import { computeXp, type XpSource } from "./xp";

export type GameUser = {
  weeklyGoal: number;
  timeZone: string;
  createdAt: Date;
  /** Career track key (see src/lib/tracks.ts); tailors quests. */
  track?: string;
};

export type GameState = {
  xp: number;
  level: Level;
  nextLevel: Level | null;
  /** 0–1 progress toward next level. */
  levelProgress: number;
  /** XP earned inside the current level, and the size of this level's span (0 at max level). */
  levelXp: number;
  levelSpan: number;
  /** Consecutive weeks meeting the weekly goal (forgiving: current week counts once met). */
  weekStreak: number;
  bestStreak: number;
  /** Total weeks the goal was met, ever. */
  weeksMet: number;
  /** Freeze tokens held (0–2). One is earned per 4 goal-met weeks in a row and auto-covers a missed week. */
  freezes: number;
  /** Last week was missed but a freeze kept the rhythm alive. */
  frozeLastWeek: boolean;
  thisWeekCount: number;
  weeklyGoal: number;
  /** Monday (local calendar date, at UTC midnight) of the current week. */
  weekStart: Date;
  /** Keys of achievements whose conditions are currently met. */
  unlocked: string[];
  achievementProgress: Record<string, AchievementProgress>;
  quests: Quest[];
  xpBreakdown: XpSource[];
  stats: GameStats;
};

export function computeGame(snapshot: UserSnapshot, user: GameUser, now: Date): GameState {
  const tz = user.timeZone || "UTC";
  const rhythm = computeRhythm(snapshot, user, now);
  const stats = computeStats(snapshot, tz, rhythm);
  const { xp, breakdown } = computeXp(snapshot, tz);
  const { level, nextLevel, levelProgress } = levelFor(xp);
  const achievementProgress = evaluateAchievements(stats);
  const unlocked = Object.keys(achievementProgress).filter((k) => achievementProgress[k].unlocked);
  const quests = pickQuests({ snapshot, stats, rhythm, track: user.track ?? "", tz, now, week: rhythm.currentWeek });

  return {
    xp,
    level,
    nextLevel,
    levelProgress,
    levelXp: xp - level.minXp,
    levelSpan: nextLevel ? nextLevel.minXp - level.minXp : 0,
    weekStreak: rhythm.weekStreak,
    bestStreak: rhythm.bestStreak,
    weeksMet: rhythm.weeksMet,
    freezes: rhythm.freezes,
    frozeLastWeek: rhythm.frozeLastWeek,
    thisWeekCount: rhythm.thisWeekCount,
    weeklyGoal: rhythm.weeklyGoal,
    weekStart: weekStartDate(rhythm.currentWeek),
    unlocked,
    achievementProgress,
    quests,
    xpBreakdown: breakdown,
    stats,
  };
}

export { LEVELS, levelFor, type Level } from "./levels";
export {
  ACHIEVEMENTS,
  ACHIEVEMENT_BY_KEY,
  ACHIEVEMENT_GROUPS,
  GROUP_BLURBS,
  isAchievementKey,
  type AchievementDef,
  type AchievementGroup,
  type AchievementProgress,
  type BadgeMotif,
} from "./achievements";
export type { Quest } from "./quests";
export type { GameStats } from "./stats";
export { XP, type XpSource } from "./xp";
