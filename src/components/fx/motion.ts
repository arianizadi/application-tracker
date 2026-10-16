"use client";

import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Imperative check, safe to call during SSR (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED).matches;
}

function subscribeReduced(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Live prefers-reduced-motion (false on the server and first hydration pass). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false);
}

const noopSubscribe = () => () => {};
/** True only after hydration on the client (safe guard for portals). */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// ── Celebration intensity (per-device preference) ─────────────────────────────

export type CelebrationIntensity = "full" | "calm" | "off";

const INTENSITY_KEY = "canopy:celebrations";
const INTENSITY_EVENT = "canopy:celebrations-change";

export function getCelebrationIntensity(): CelebrationIntensity {
  try {
    const v = window.localStorage.getItem(INTENSITY_KEY);
    return v === "calm" || v === "off" ? v : "full";
  } catch {
    return "full";
  }
}

export function setCelebrationIntensity(value: CelebrationIntensity) {
  try {
    window.localStorage.setItem(INTENSITY_KEY, value);
  } catch {
    // Storage blocked: the preference just won't persist.
  }
  window.dispatchEvent(new Event(INTENSITY_EVENT));
}

function subscribeIntensity(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === INTENSITY_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(INTENSITY_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(INTENSITY_EVENT, onChange);
  };
}

/** For a settings control: `const [intensity, setIntensity] = useCelebrationIntensity()`. */
export function useCelebrationIntensity(): [CelebrationIntensity, (v: CelebrationIntensity) => void] {
  const value = useSyncExternalStore(subscribeIntensity, getCelebrationIntensity, () => "full" as const);
  return [value, setCelebrationIntensity];
}
