import "server-only";

import { getCurrentUser } from "@/lib/auth/dal";
import { getSnapshotProgress } from "@/lib/data/snapshot";

import { toProgressMap, type ProgressKind, type ProgressMap } from "./progress";

/**
 * The signed-in user's prep progress as a flat map (cached under the user's
 * "progress" tag only, so it never loads applications or analyses). Reads the session, so call it inside a <Suspense> boundary,
 * or start it there and hand the promise to <PrepProgressProvider>.
 * Returns an empty map when signed out (the proxy normally prevents that).
 */
export async function loadProgressMap(kinds?: readonly ProgressKind[], filter?: (kind: ProgressKind, itemId: string) => boolean): Promise<ProgressMap> {
  const user = await getCurrentUser();
  if (!user) return {};
  const map = toProgressMap(await getSnapshotProgress(user.id), kinds);
  if (!filter) return map;
  const out: ProgressMap = {};
  for (const [key, state] of Object.entries(map)) {
    const i = key.indexOf(":");
    if (filter(key.slice(0, i) as ProgressKind, key.slice(i + 1))) out[key] = state;
  }
  return out;
}
