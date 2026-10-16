import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { userTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

export type EarnedAchievement = { key: string; unlockedAt: Date; celebrated: boolean };

/** Persisted achievement rows for one user (unlock dates). Invalidated via invalidate(userId, "achievements"). */
export async function getEarnedAchievements(userId: string): Promise<EarnedAchievement[]> {
  "use cache";
  cacheLife("days");
  cacheTag(userTag(userId, "achievements"));

  return prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "asc" },
    select: { key: true, unlockedAt: true, celebrated: true },
  });
}
