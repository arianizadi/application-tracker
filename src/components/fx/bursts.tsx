"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

import { prefersReducedMotion } from "./motion";
import {
  runFx,
  spawnFireflies,
  spawnLeaves,
  type FireflyOptions,
  type LeafOptions,
  type LeafPalette,
  type Origin,
} from "./particles";

type OriginProp = Origin | RefObject<Element | null> | null | undefined;

const toOrigin = (o: OriginProp) => (o && "current" in o ? o.current : o);

// ── Imperative API (call from any event handler) ──────────────────────────────

/** Leaf + petal burst. No-op under reduced motion. Returns a cancel function. */
export function leafConfetti(options: LeafOptions = {}): () => void {
  if (prefersReducedMotion()) return () => {};
  return runFx(spawnLeaves(options));
}

/** Warm firefly swarm. No-op under reduced motion. Returns a cancel function. */
export function fireflyBurst(options: FireflyOptions = {}): () => void {
  if (prefersReducedMotion()) return () => {};
  return runFx(spawnFireflies(options));
}

// ── Declarative components (render nothing; play when `fire` changes) ─────────

/**
 * <LeafConfetti fire={count} /> plays a burst of leaves and petals every time `fire` changes
 * to a truthy value (also on mount if truthy). `origin` is viewport coords or a ref to an
 * element to burst from (defaults to the middle of the screen).
 */
export function LeafConfetti({
  fire,
  origin,
  count = 40,
  palette = "leaves",
  power = 1,
  onDone,
}: {
  fire: unknown;
  origin?: OriginProp;
  count?: number;
  palette?: LeafPalette;
  power?: number;
  onDone?: () => void;
}) {
  const play = useEffectEvent(() => {
    if (prefersReducedMotion()) {
      onDone?.();
      return () => {};
    }
    const cancel = runFx(spawnLeaves({ origin: toOrigin(origin), count, palette, power }));
    const t = window.setTimeout(() => onDone?.(), 2300);
    return () => {
      window.clearTimeout(t);
      cancel();
    };
  });
  useEffect(() => {
    if (!fire) return;
    return play();
  }, [fire]);
  return null;
}

/** <FireflyBurst fire={n} /> — a glowing swarm for offers and big moments. */
export function FireflyBurst({
  fire,
  origin,
  count = 26,
  onDone,
}: {
  fire: unknown;
  origin?: OriginProp;
  count?: number;
  onDone?: () => void;
}) {
  const play = useEffectEvent(() => {
    if (prefersReducedMotion()) {
      onDone?.();
      return () => {};
    }
    const cancel = runFx(spawnFireflies({ origin: toOrigin(origin), count }));
    const t = window.setTimeout(() => onDone?.(), 3600);
    return () => {
      window.clearTimeout(t);
      cancel();
    };
  });
  useEffect(() => {
    if (!fire) return;
    return play();
  }, [fire]);
  return null;
}
