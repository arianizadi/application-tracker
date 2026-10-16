"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

import { getCelebrationIntensity, prefersReducedMotion } from "./motion";
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

/** Particles only at Full intensity and without OS reduced motion (§4.8). */
const particlesAllowed = () => !prefersReducedMotion() && getCelebrationIntensity() === "full";

// ── Imperative API (call from any event handler) ──────────────────────────────

/** Leaf + petal puff. No-op under reduced motion or Calm/Off. Returns a cancel function. */
export function leafConfetti(options: LeafOptions = {}): () => void {
  if (!particlesAllowed()) return () => {};
  return runFx(spawnLeaves(options));
}

/** A few warm fireflies drifting up. No-op under reduced motion or Calm/Off. Returns a cancel function. */
export function fireflyBurst(options: FireflyOptions = {}): () => void {
  if (!particlesAllowed()) return () => {};
  return runFx(spawnFireflies(options));
}

// ── Declarative components (render nothing; play when `fire` changes) ─────────

/**
 * <LeafConfetti fire={count} /> plays a small puff of leaves and petals every time `fire` changes
 * to a truthy value (also on mount if truthy). `origin` is viewport coords or a ref to an
 * element to burst from (defaults to the middle of the screen).
 */
export function LeafConfetti({
  fire,
  origin,
  count = 14,
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
    if (!particlesAllowed()) {
      onDone?.();
      return () => {};
    }
    const cancel = runFx(spawnLeaves({ origin: toOrigin(origin), count, palette, power }));
    const t = window.setTimeout(() => onDone?.(), 2400);
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

/** <FireflyBurst fire={n} /> — a few rising fireflies for offers and big moments. */
export function FireflyBurst({
  fire,
  origin,
  count = 10,
  onDone,
}: {
  fire: unknown;
  origin?: OriginProp;
  count?: number;
  onDone?: () => void;
}) {
  const play = useEffectEvent(() => {
    if (!particlesAllowed()) {
      onDone?.();
      return () => {};
    }
    const cancel = runFx(spawnFireflies({ origin: toOrigin(origin), count }));
    const t = window.setTimeout(() => onDone?.(), 2500);
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
