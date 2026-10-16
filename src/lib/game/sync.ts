import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { ACHIEVEMENT_BY_KEY, isAchievementKey, type AchievementDef } from "./achievements";

/**
 * Persists newly met achievements (once each, forever — earned badges are never
 * taken away) and returns every earned-but-not-yet-celebrated definition.
 * Call from Server Components only with the authenticated user's id.
 */
export async function syncAchievements(userId: string, unlockedKeys: string[]): Promise<AchievementDef[]> {
  const wanted = [...new Set(unlockedKeys.filter(isAchievementKey))];

  const existing = await prisma.achievement.findMany({
    where: { userId },
    select: { key: true, celebrated: true },
  });
  const have = new Set(existing.map((a) => a.key));
  const fresh = wanted.filter((k) => !have.has(k));

  if (fresh.length > 0) {
    try {
      await prisma.achievement.createMany({ data: fresh.map((key) => ({ userId, key })) });
    } catch (error) {
      // A concurrent render inserted some of these first (unique userId+key). Fall back to one-by-one.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
      await Promise.all(
        fresh.map((key) =>
          prisma.achievement.create({ data: { userId, key } }).catch((e: unknown) => {
            if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
          }),
        ),
      );
    }
  }

  const pending = [...existing.filter((a) => !a.celebrated).map((a) => a.key), ...fresh];
  return [...new Set(pending)].flatMap((k) => (isAchievementKey(k) ? [ACHIEVEMENT_BY_KEY[k]] : []));
}
