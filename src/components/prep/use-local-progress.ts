"use client";

import { useCallback, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast";
import { clearProgress, setProgress } from "@/lib/prep/actions";
import type { ProgressKind, ProgressMap } from "@/lib/prep/progress";

/**
 * Optimistic progress for one kind, seeded from a server-loaded map. Writes go
 * straight to the server action; failures roll back and show a toast.
 */
export function useLocalProgress(kind: ProgressKind, initial: ProgressMap) {
  const toast = useToast();
  const [states, setStates] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    const prefix = `${kind}:`;
    for (const [k, v] of Object.entries(initial)) if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
    return out;
  });
  const statesRef = useRef(states);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const seq = useRef(new Map<string, number>());

  const write = useCallback((fn: (s: Record<string, string>) => Record<string, string>) => {
    statesRef.current = fn(statesRef.current);
    setStates(statesRef.current);
  }, []);

  const set = useCallback(
    async (itemId: string, next: string | null): Promise<boolean> => {
      const prev = statesRef.current[itemId];
      const mine = (seq.current.get(itemId) ?? 0) + 1;
      seq.current.set(itemId, mine);
      write((s) => {
        const out = { ...s };
        if (next === null) delete out[itemId];
        else out[itemId] = next;
        return out;
      });
      setPending((p) => ({ ...p, [itemId]: true }));

      let ok = false;
      try {
        const res = next === null ? await clearProgress(kind, itemId) : await setProgress(kind, itemId, next);
        ok = res.ok;
        if (!res.ok) toast({ tone: "warning", title: "Not saved", body: res.error });
      } catch {
        toast({ tone: "warning", title: "Not saved", body: "Looks like you're offline. Try again in a moment." });
      }
      if (seq.current.get(itemId) === mine) {
        if (!ok) {
          write((s) => {
            const out = { ...s };
            if (prev === undefined) delete out[itemId];
            else out[itemId] = prev;
            return out;
          });
        }
        setPending((p) => {
          const out = { ...p };
          delete out[itemId];
          return out;
        });
      }
      return ok;
    },
    [kind, toast, write],
  );

  return { states, pending, set };
}
