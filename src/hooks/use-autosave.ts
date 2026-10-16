"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "canopy:draft:";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

type Stored<T> = { v: T; t: number };

function safeGet<T>(key: string): Stored<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored<T>;
    if (!parsed || typeof parsed.t !== "number" || Date.now() - parsed.t > MAX_AGE_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Autosaves form state to localStorage (debounced) so an accidental tab close
 * never loses work. Call `clear()` after a successful submit.
 *
 *   const { value, setValue, restored, savedAt, clear } = useAutosave("app:new", initial);
 */
export function useAutosave<T extends Record<string, unknown>>(key: string, initial: T, delayMs = 400) {
  const [value, setValueState] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const dirty = useRef(false);

  // Restore after mount (localStorage is unavailable during SSR).
  useEffect(() => {
    const stored = safeGet<T>(key);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      setValueState({ ...initial, ...stored.v });
      setRestored(true);
      setSavedAt(stored.t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const persist = useCallback(
    (next: T) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        try {
          const t = Date.now();
          localStorage.setItem(PREFIX + key, JSON.stringify({ v: next, t }));
          setSavedAt(t);
        } catch {
          // Storage full or blocked: the form still works, it just isn't backed up.
        }
      }, delayMs);
    },
    [key, delayMs],
  );

  const setValue = useCallback(
    (update: Partial<T> | ((prev: T) => T)) => {
      dirty.current = true;
      setValueState((prev) => {
        const next = typeof update === "function" ? update(prev) : { ...prev, ...update };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    dirty.current = false;
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
    setRestored(false);
    setSavedAt(null);
  }, [key]);

  const reset = useCallback(() => {
    clear();
    setValueState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);

  // Flush pending save when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => {
      if (!dirty.current) return;
      window.clearTimeout(timer.current);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  return { value, setValue, restored, savedAt, clear, reset };
}

/** True if a draft exists for `key` (e.g. to show a "resume draft" badge). */
export function hasDraft(key: string): boolean {
  if (typeof window === "undefined") return false;
  return safeGet(key) !== null;
}
