"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed preference (view mode, sticky defaults, dismissed
 * banners). Server render and first paint use `fallback`; never throws if
 * storage is blocked.
 */
const EVENT = "canopy:pref";
/** Keeps preferences working for this tab even when storage is blocked. */
const memory = new Map<string, string>();

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePreference<T extends string>(key: string, fallback: T, allowed?: readonly T[]): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const value = raw !== null && (!allowed || (allowed as readonly string[]).includes(raw)) ? (raw as T) : fallback;

  const set = useCallback(
    (next: T) => {
      memory.set(key, next);
      try {
        localStorage.setItem(key, next);
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [value, set];
}
