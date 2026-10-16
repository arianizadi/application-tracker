"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

import { isAchievementKey } from "./achievements";

const keysSchema = z.array(z.string().min(1).max(64)).max(100);

/** Marks the signed-in user's achievements as celebrated so they never pop up again. */
export async function markCelebrated(keys: string[]): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const parsed = keysSchema.safeParse(keys);
  if (!parsed.success) return { ok: false };
  const valid = [...new Set(parsed.data.filter(isAchievementKey))];
  if (valid.length === 0) return { ok: true };

  await prisma.achievement.updateMany({
    where: { userId: user.id, key: { in: valid }, celebrated: false },
    data: { celebrated: true },
  });
  invalidate(user.id, "achievements");
  return { ok: true };
}
