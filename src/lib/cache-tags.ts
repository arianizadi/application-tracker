import "server-only";

import { updateTag } from "next/cache";

/**
 * Per-user cache tags. Every cached read of user data tags itself with the
 * relevant kinds; every Server Action that mutates calls `invalidate`.
 */
export type CacheKind = "applications" | "resumes" | "analyses" | "progress" | "achievements" | "profile";

export function userTag(userId: string, kind: CacheKind): string {
  return `user:${userId}:${kind}`;
}

/** Read-your-own-writes invalidation. Server Actions only (uses updateTag). */
export function invalidate(userId: string, ...kinds: CacheKind[]): void {
  for (const kind of kinds) updateTag(userTag(userId, kind));
}
