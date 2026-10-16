import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { readSession, type SessionUser } from "@/lib/auth/session";

/** Request-deduplicated session lookup. Call from Server Components inside <Suspense>. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await readSession();
  return session?.user ?? null;
});

/**
 * For pages and Server Actions that require a signed-in user.
 * Redirects through /api/auth/expired so a stale cookie is cleared rather
 * than bouncing between /login and /home.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/expired");
  return user;
}
