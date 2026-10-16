// CONTRACT STUB — replaced by the gamification engine. Keep the exported names and types stable.
import type { UserSnapshot } from "@/lib/data/snapshot";

export type GameUser = { weeklyGoal: number; timeZone: string; createdAt: Date };

export type Level = { index: number; name: string; minXp: number };

export type AchievementDef = {
  key: string;
  name: string;
  description: string;
  /** Category for grouping on the achievements page. */
  group: string;
  /** Optional hidden achievements show "???" until unlocked. */
  secret?: boolean;
};

export type Quest = { id: string; title: string; detail: string; progress: number; target: number; xp: number; href?: string };

export type GameState = {
  xp: number;
  level: Level;
  nextLevel: Level | null;
  /** 0–1 progress toward next level. */
  levelProgress: number;
  /** Consecutive weeks meeting the weekly goal (forgiving: current week counts once met). */
  weekStreak: number;
  thisWeekCount: number;
  weeklyGoal: number;
  unlocked: string[];
  quests: Quest[];
};

export const ACHIEVEMENTS: AchievementDef[] = [];
export const LEVELS: Level[] = [{ index: 1, name: "Seed", minXp: 0 }];

export function computeGame(snapshot: UserSnapshot, user: GameUser, now: Date): GameState {
  void user;
  void now;
  return {
    xp: snapshot.applications.length * 10,
    level: LEVELS[0],
    nextLevel: null,
    levelProgress: 0,
    weekStreak: 0,
    thisWeekCount: 0,
    weeklyGoal: user.weeklyGoal,
    unlocked: [],
    quests: [],
  };
}
