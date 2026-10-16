import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Keys are hashed so raw emails and IPs are never stored in the counters. */
function keyFor(scope: string, value: string) {
  return `${scope}:${createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 32)}`;
}

/**
 * Fixed-window limiter. Returns true while the caller is under `limit`
 * attempts in the current window, and counts this attempt.
 *
 * Every step is a single conditional write, which MongoDB applies atomically
 * per document, so parallel requests can't all slip past the same count.
 */
export async function consume(scope: string, value: string, limit: number, windowMs: number): Promise<boolean> {
  const key = keyFor(scope, value);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const bump = () =>
    prisma.rateLimit.updateMany({
      where: { key, resetAt: { gt: now }, count: { lt: limit } },
      data: { count: { increment: 1 } },
    });

  // 1. Active window with room left: count this attempt.
  if ((await bump()).count === 1) return true;

  // 2. Expired window: reopen it, but only if it is still expired (one winner).
  const reopened = await prisma.rateLimit.updateMany({
    where: { key, resetAt: { lte: now } },
    data: { count: 1, resetAt },
  });
  if (reopened.count === 1) return true;

  // 3. No counter yet: create it. If it already exists (a parallel create won,
  //    or the window is full), fall back to the conditional increment.
  try {
    await prisma.rateLimit.create({ data: { key, count: 1, resetAt } });
  } catch (error) {
    if ((error as { code?: string }).code !== "P2002") throw error;
    return (await bump()).count === 1;
  }
  // Opportunistic cleanup of stale windows.
  if (Math.random() < 0.05) {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => {});
  }
  return true;
}

export async function reset(scope: string, value: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key: keyFor(scope, value) } });
}
