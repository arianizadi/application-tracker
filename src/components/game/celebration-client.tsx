"use client";

import { useEffect, useRef } from "react";

import { getCelebrationIntensity, useCelebrate } from "@/components/fx";
import { useToast } from "@/components/ui/toast";
import { markCelebrated } from "@/lib/game/actions";

export type PendingCelebration = { key: string; name: string; description: string };

/** More than this many at once collapses into one summary toast (e.g. imported history). */
const SUMMARY_THRESHOLD = 5;

export function CelebrationClient({
  userId,
  pending,
  level,
}: {
  userId: string;
  pending: PendingCelebration[];
  level: { index: number; name: string; blurb: string };
}) {
  const toast = useToast();
  const { celebrate } = useCelebrate();
  const handled = useRef(new Set<string>());

  useEffect(() => {
    const queue: { title: string; body: string; kind: "achievement" | "levelup" }[] = [];

    // Level-ups: remember the highest level this browser has seen. First visit records silently.
    const storageKey = `canopy:level:${userId}`;
    let seen: number | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      seen = raw === null ? null : Number(raw);
    } catch {
      seen = null;
    }
    const levelToken = `level:${level.index}`;
    if (seen !== null && Number.isFinite(seen) && level.index > seen && !handled.current.has(levelToken)) {
      queue.push({ kind: "levelup", title: `Level ${level.index}: ${level.name}`, body: `${level.blurb} New title unlocked.` });
    }
    handled.current.add(levelToken);
    if (seen === null || !Number.isFinite(seen) || level.index > seen) {
      try {
        window.localStorage.setItem(storageKey, String(level.index));
      } catch {
        /* storage blocked: celebrations just won't track level-ups */
      }
    }

    const fresh = pending.filter((p) => !handled.current.has(p.key));
    for (const p of fresh) handled.current.add(p.key);
    if (fresh.length > SUMMARY_THRESHOLD) {
      queue.push({
        kind: "achievement",
        title: `${fresh.length} badges unlocked!`,
        body: "Your forest has been busy. Visit Achievements to admire the shelf.",
      });
    } else {
      for (const p of fresh) queue.push({ kind: "achievement", title: `Badge unlocked: ${p.name}`, body: p.description });
    }

    // Timers intentionally aren't cleared on cleanup: the toast host lives in the root
    // layout, and keys are de-duplicated above, so a StrictMode re-run can't double up.
    queue.forEach((t, i) => {
      window.setTimeout(() => {
        // One voice at a time: the celebration layer shows one card, merges unlocks that land
        // while it's up into it as a line, and queues the rest. With celebrations Off the
        // words still arrive, as quiet toasts.
        if (getCelebrationIntensity() !== "off") celebrate(t.kind, { title: t.title, body: t.body });
        else toast({ title: t.title, body: t.body, tone: "celebrate" });
      }, 500 + i * 1400);
    });

    if (fresh.length > 0) {
      const keys = fresh.map((p) => p.key);
      markCelebrated(keys).catch(() => {
        // Let a later render retry.
        for (const k of keys) handled.current.delete(k);
      });
    }
  }, [pending, level, userId, toast, celebrate]);

  return null;
}
