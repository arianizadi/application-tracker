import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type EarnedAchievement = { key: string; unlockedAt: Date; celebrated: boolean };

/**
 * Persisted achievement rows for one user (unlock dates). Deliberately not "use cache":
 * CelebrationWatcher inserts rows during render, where tags can't be invalidated, so a
 * cached copy would show stale unlock dates. It's one small indexed query per request.
 */
export const getEarnedAchievements = cache(async (userId: string): Promise<EarnedAchievement[]> => {
  return prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "asc" },
    select: { key: true, unlockedAt: true, celebrated: true },
  });
});
