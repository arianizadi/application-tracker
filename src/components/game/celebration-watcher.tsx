import { getCurrentUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { computeGame } from "@/lib/game";
import { syncAchievements } from "@/lib/game/sync";

import { CelebrationClient, type PendingCelebration } from "./celebration-client";

/**
 * Persists newly earned achievements and hands the uncelebrated ones (plus the
 * current level) to a tiny client component that celebrates them once.
 * Mount inside <Suspense fallback={null}> in the authed layout.
 */
export async function CelebrationWatcher() {
  const user = await getCurrentUser();
  if (!user) return null;

  const snapshot = await getSnapshot(user.id);
  const game = computeGame(snapshot, user, new Date());

  let pending: PendingCelebration[] = [];
  try {
    const defs = await syncAchievements(user.id, game.unlocked);
    pending = defs.map(({ key, name, description }) => ({ key, name, description }));
  } catch (error) {
    // Celebrations are a nicety; never break the page over them.
    console.error("[achievements] sync failed", error);
  }

  return (
    <CelebrationClient
      userId={user.id}
      pending={pending}
      level={{ index: game.level.index, name: game.level.name, blurb: game.level.blurb }}
    />
  );
}
