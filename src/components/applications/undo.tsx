"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";

import { useToast } from "@/components/ui/toast";
import { useBottomUi } from "@/hooks/use-bottom-ui";
import { restoreApplications } from "@/lib/applications/actions";
import type { DeletedApplication } from "@/lib/applications/types";

import { AppIcon } from "./icons";

/**
 * In-memory Undo for deletes. Lives at module scope so it survives client-side
 * navigation (delete on the detail page → Undo appears on the list).
 */
type UndoEntry = { records: DeletedApplication[]; label: string; id: number };

let entry: UndoEntry | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function offerUndo(records: DeletedApplication[], label: string) {
  entry = { records, label, id: nextId++ };
  emit();
}

function dismiss(id?: number) {
  if (id !== undefined && entry?.id !== id) return;
  entry = null;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const UNDO_MS = 10_000;

export function UndoBar() {
  const current = useSyncExternalStore(subscribe, () => entry, () => null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const barRef = useRef<HTMLDivElement>(null);
  useBottomUi(barRef, Boolean(current));

  // Keep the last entry on screen for its exit (180 ms) after it's dismissed.
  const [shown, setShown] = useState<UndoEntry | null>(current);
  if (current && current !== shown) setShown(current);
  const leaving = !current && shown !== null;

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => dismiss(current.id), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [current]);

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setShown(null), 180);
    return () => window.clearTimeout(t);
  }, [leaving]);

  if (!shown) return null;

  const restore = () =>
    startTransition(async () => {
      const res = await restoreApplications(shown.records);
      dismiss(shown.id);
      if (res.ok) {
        toast({ title: "Restored", body: res.data.count === 1 ? "Right back where it was." : `${res.data.count} applications are back.`, tone: "success" });
      } else {
        toast({ title: "Couldn't undo", body: res.error, tone: "warning" });
      }
    });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--dock-bottom)+0.75rem)] z-[55] flex justify-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:bottom-6">
      <div
        ref={barRef}
        role="status"
        aria-live="polite"
        className={`flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-2.5 text-sm text-paper shadow-lift ${
          leaving ? "pointer-events-none animate-leave" : "pointer-events-auto animate-[rise-sm_360ms_var(--ease-enter)_both]"
        }`}
      >
        <AppIcon name="trash" className="size-4 shrink-0 opacity-70" />
        <p className="min-w-0 flex-1 truncate">{shown.label}</p>
        <button
          type="button"
          onClick={restore}
          disabled={pending}
          className="flex h-10 items-center gap-1.5 rounded-full bg-paper/15 px-3.5 font-semibold text-paper hover:bg-paper/25 disabled:opacity-60"
        >
          <AppIcon name="undo" className="size-4" />
          {pending ? "Restoring…" : "Undo"}
        </button>
        <button type="button" onClick={() => dismiss(shown.id)} aria-label="Dismiss" className="flex size-10 items-center justify-center rounded-full opacity-70 hover:bg-paper/15 hover:opacity-100">
          <AppIcon name="x" className="size-4" />
        </button>
      </div>
    </div>
  );
}
