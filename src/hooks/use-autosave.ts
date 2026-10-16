"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const PREFIX = "canopy:draft:";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

/** `b` is the baseline the draft started from, so a restore only re-applies fields the user actually edited. */
type Stored<T> = { v: T; b?: T; t: number };

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Rebuilds a draft on top of the current `initial`: only fields the user edited
 * (v differs from the baseline b) are re-applied, and an edited field that also
 * changed elsewhere since the draft started (b differs from initial) is dropped
 * and reported as a conflict. Drafts saved without a baseline override everything.
 */
function mergeDraft<T extends Record<string, unknown>>(initial: T, stored: Stored<T>): { value: T; edited: boolean; conflicts: (keyof T)[] } {
  const value = { ...initial };
  const conflicts: (keyof T)[] = [];
  let edited = false;
  for (const k of Object.keys(stored.v) as (keyof T)[]) {
    if (!(k in initial)) continue;
    const b = stored.b;
    if (b && same(stored.v[k], b[k])) continue;
    if (b && !same(b[k], initial[k])) {
      if (!same(stored.v[k], initial[k])) conflicts.push(k);
      continue;
    }
    value[k] = stored.v[k];
    if (!same(stored.v[k], initial[k])) edited = true;
  }
  return { value, edited, conflicts };
}

/*
 * Drafts are scoped to the signed-in account (`canopy:draft:<userId>:<key>`) so
 * a shared lab or library computer never restores one person's draft into
 * another person's form. The signed-in layout publishes the user id through
 * `setDraftScope`; until it does, drafts are neither restored nor written.
 */
let scope: string | null = null;
const listeners = new Set<() => void>();

/** Called by the signed-in layout with the session's user id (null on unmount). */
export function setDraftScope(userId: string | null) {
  if (userId) {
    // Drop drafts this account can't read: another person's on a shared device,
    // and unscoped ones saved before drafts were per-account.
    const own = `${PREFIX}${userId}:`;
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith(PREFIX) && !k.startsWith(own)) localStorage.removeItem(k);
      }
    } catch {}
  }
  if (scope === userId) return;
  scope = userId;
  for (const listener of listeners) listener();
}

function subscribeScope(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getScope = () => scope;
const getServerScope = () => null;

function storageKey(key: string, uid: string | null = scope): string | null {
  return uid ? `${PREFIX}${uid}:${key}` : null;
}

function safeGet<T>(fullKey: string | null): Stored<T> | null {
  if (!fullKey) return null;
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored<T>;
    if (!parsed || typeof parsed.t !== "number" || Date.now() - parsed.t > MAX_AGE_MS) {
      localStorage.removeItem(fullKey);
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
  const uid = useSyncExternalStore(subscribeScope, getScope, getServerScope);
  const fullKey = storageKey(key, uid);
  const [value, setValueState] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<(keyof T)[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const dirty = useRef(false);
  // The latest edit not yet written (debounce in flight, or account scope not known yet).
  const pending = useRef<T | null>(null);
  // The values the current draft started from (see mergeDraft).
  const base = useRef(initial);

  // Restore after mount (localStorage is unavailable during SSR) and once the
  // account scope is known. Never clobber edits made before the scope arrived.
  useEffect(() => {
    if (dirty.current) return;
    const stored = safeGet<T>(fullKey);
    if (stored && fullKey) {
      // Re-base the draft on what the server has now, so values changed
      // elsewhere (another tab, a panel on the same page) aren't reverted.
      const merged = mergeDraft(initial, stored);
      base.current = initial;
      try {
        if (merged.edited) localStorage.setItem(fullKey, JSON.stringify({ v: merged.value, b: initial, t: stored.t }));
        else localStorage.removeItem(fullKey);
      } catch {}
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      setConflicts(merged.conflicts);
      if (merged.edited) {
        setValueState(merged.value);
        setRestored(true);
        setSavedAt(stored.t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  /** Writes `next` now; false if the account scope isn't known yet. */
  const writeNow = useCallback(
    (next: T) => {
      if (!fullKey) return false;
      try {
        const t = Date.now();
        localStorage.setItem(fullKey, JSON.stringify({ v: next, b: base.current, t }));
        setSavedAt(t);
      } catch {
        // Storage full or blocked: the form still works, it just isn't backed up.
      }
      return true;
    },
    [fullKey],
  );

  const persist = useCallback(
    (next: T) => {
      pending.current = next;
      window.clearTimeout(timer.current);
      // Without a scope the edit stays pending and is written once the scope arrives.
      if (!fullKey) return;
      timer.current = window.setTimeout(() => {
        pending.current = null;
        writeNow(next);
      }, delayMs);
    },
    [fullKey, writeNow, delayMs],
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
    // Drop any unsaved edit too, or a later flush would bring the draft back.
    pending.current = null;
    try {
      if (fullKey) localStorage.removeItem(fullKey);
    } catch {}
    setRestored(false);
    setSavedAt(null);
    setConflicts([]);
  }, [fullKey]);

  const reset = useCallback(() => {
    clear();
    base.current = initial;
    setValueState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);

  // Write the pending edit immediately when the tab is hidden, closed or
  // navigated away (mobile Safari often skips pagehide, so also watch
  // visibilitychange), on unmount, and once the account scope arrives.
  useEffect(() => {
    const flush = () => {
      if (!dirty.current || pending.current === null) return;
      window.clearTimeout(timer.current);
      if (writeNow(pending.current)) pending.current = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [writeNow]);

  return { value, setValue, restored, savedAt, conflicts, clear, reset };
}

/** True if the signed-in account has a draft for `key` (e.g. to show a "resume draft" badge). */
export function hasDraft(key: string): boolean {
  if (typeof window === "undefined") return false;
  return safeGet(storageKey(key)) !== null;
}

/** Removes the signed-in account's draft for `key` (e.g. after deleting the record it edits). */
export function clearDraft(key: string) {
  const fullKey = storageKey(key);
  if (!fullKey) return;
  try {
    localStorage.removeItem(fullKey);
  } catch {}
}

/**
 * Removes every Canopy draft on this device, for every account. Returns a
 * function that puts them back, for flows that might fail after clearing
 * (e.g. deleting the account with a mistyped password).
 */
export function clearAllDrafts(): () => void {
  const removed: [string, string][] = [];
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      const v = localStorage.getItem(k);
      if (v !== null) removed.push([k, v]);
      localStorage.removeItem(k);
    }
  } catch {}
  return () => {
    try {
      for (const [k, v] of removed) localStorage.setItem(k, v);
    } catch {}
  };
}
