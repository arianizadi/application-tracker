import { getCurrentUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { computeGame } from "@/lib/game";
import { getGameMemory, saveGameMemory } from "@/lib/game/memory";
import { syncAchievements } from "@/lib/game/sync";

import { CelebrationClient, type PendingCelebration } from "./celebration-client";

/**
 * Persists newly earned achievements and the game's memory (XP high-water mark,
 * this week's pinned quests), then hands the uncelebrated badges (plus the
 * current level) to a tiny client component that celebrates them once.
 * Mount inside <Suspense fallback={null}> in the authed layout.
 */
export async function CelebrationWatcher() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [snapshot, memory] = await Promise.all([getSnapshot(user.id), getGameMemory(user.id)]);
  const game = computeGame(snapshot, user, new Date(), memory);

  let pending: PendingCelebration[] = [];
  const [synced, saved] = await Promise.allSettled([
    syncAchievements(user.id, game.unlocked),
    memory ? saveGameMemory(user.id, memory, game) : Promise.resolve(),
  ]);
  if (synced.status === "fulfilled") {
    pending = synced.value.map(({ key, name, description }) => ({ key, name, description }));
  } else {
    // Celebrations are a nicety; never break the page over them.
    console.error("[achievements] sync failed", synced.reason);
  }
  if (saved.status === "rejected") console.error("[game] memory save failed", saved.reason);

  return (
    <CelebrationClient
      userId={user.id}
      pending={pending}
      level={{ index: game.level.index, name: game.level.name, blurb: game.level.blurb }}
    />
  );
}
