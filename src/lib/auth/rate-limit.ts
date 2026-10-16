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
 */
export async function consume(scope: string, value: string, limit: number, windowMs: number): Promise<boolean> {
  const key = keyFor(scope, value);
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.resetAt <= now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    // Opportunistic cleanup of stale windows.
    if (Math.random() < 0.05) {
      await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => {});
    }
    return true;
  }

  if (existing.count >= limit) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export async function reset(scope: string, value: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key: keyFor(scope, value) } });
}
