"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { useToast } from "@/components/ui/toast";
import { clearProgress, setProgress } from "@/lib/prep/actions";
import { progressKey, type ProgressKind, type ProgressMap } from "@/lib/prep/progress";

type Local = Record<string, string | null>;

type Ctx = {
  base: Promise<ProgressMap>;
  local: Local;
  pending: Record<string, boolean>;
  update: (kind: ProgressKind, itemId: string, state: string | null) => Promise<boolean>;
};

const ProgressContext = createContext<Ctx | null>(null);

/**
 * Holds the signed-in user's prep progress for a page. `progress` is a promise started
 * on the server (so static lesson content prerenders while progress streams in);
 * consumers unwrap it with `use()` and must sit inside their own <Suspense>.
 * Writes are optimistic and roll back with a toast if the server says no.
 */
export function PrepProgressProvider({ progress, children }: { progress: Promise<ProgressMap>; children: ReactNode }) {
  const [local, setLocalState] = useState<Local>({});
  const localRef = useRef<Local>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const seq = useRef(new Map<string, number>());
  const toast = useToast();

  const setLocal = useCallback((fn: (l: Local) => Local) => {
    localRef.current = fn(localRef.current);
    setLocalState(localRef.current);
  }, []);

  const update = useCallback(
    async (kind: ProgressKind, itemId: string, state: string | null) => {
      const key = progressKey(kind, itemId);
      const mine = (seq.current.get(key) ?? 0) + 1;
      seq.current.set(key, mine);
      const previous = Object.prototype.hasOwnProperty.call(localRef.current, key) ? localRef.current[key] : undefined;
      setLocal((l) => ({ ...l, [key]: state }));
      setPending((p) => ({ ...p, [key]: true }));

      let ok = false;
      try {
        const res = state === null ? await clearProgress(kind, itemId) : await setProgress(kind, itemId, state);
        ok = res.ok;
        if (!res.ok) toast({ tone: "warning", title: "Not saved", body: res.error });
      } catch {
        toast({ tone: "warning", title: "Not saved", body: "Looks like you're offline. Try again in a moment." });
      }

      // Only the latest write for a key may settle it.
      if (seq.current.get(key) === mine) {
        if (!ok) {
          setLocal((l) => {
            const next = { ...l };
            if (previous === undefined) delete next[key];
            else next[key] = previous;
            return next;
          });
        }
        setPending((p) => {
          const next = { ...p };
          delete next[key];
          return next;
        });
      }
      return ok;
    },
    [toast, setLocal],
  );

  const value = useMemo(() => ({ base: progress, local, pending, update }), [progress, local, pending, update]);
  return <ProgressContext value={value}>{children}</ProgressContext>;
}

function useCtx(): Ctx {
  const ctx = use(ProgressContext);
  if (!ctx) throw new Error("Prep progress hooks need <PrepProgressProvider>.");
  return ctx;
}

/** One item's state (suspends until the server progress arrives). */
export function useProgressItem(kind: ProgressKind, itemId: string) {
  const { base, local, pending, update } = useCtx();
  const map = use(base);
  const key = progressKey(kind, itemId);
  const state = Object.prototype.hasOwnProperty.call(local, key) ? local[key] : (map[key] ?? null);
  const set = useCallback((next: string | null) => update(kind, itemId, next), [update, kind, itemId]);
  return { state, pending: !!pending[key], set };
}

/** The merged progress map (suspends until the server progress arrives). */
export function useProgressMap(): ProgressMap {
  const { base, local } = useCtx();
  const map = use(base);
  return useMemo(() => {
    const out: ProgressMap = { ...map };
    for (const [k, v] of Object.entries(local)) {
      if (v === null) delete out[k];
      else out[k] = v;
    }
    return out;
  }, [map, local]);
}
