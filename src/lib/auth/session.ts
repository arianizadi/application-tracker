import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "at_session";
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
/** Extend a session's expiry at most once per day to avoid a write per request. */
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function writeCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, userAgent },
  });
  await writeCookie(token, expiresAt);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  weeklyGoal: number;
  timeZone: string;
  track: string;
  createdAt: Date;
};

/** Validates the session cookie against the database. Never trusts the cookie alone. */
export async function readSession(): Promise<{ sessionId: string; user: SessionUser } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: {
        select: { id: true, email: true, name: true, weeklyGoal: true, timeZone: true, track: true, createdAt: true },
      },
    },
  });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (now - session.lastSeenAt.getTime() > REFRESH_AFTER_MS) {
    // Sliding expiry. Cookie writes are only allowed in actions/route handlers,
    // so extend the database record here; the cookie is refreshed on next sign-in.
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date(now), expiresAt: new Date(now + SESSION_MS) } })
      .catch(() => {});
  }

  return { sessionId: session.id, user: session.user };
}

export async function deleteCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export async function deleteAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
