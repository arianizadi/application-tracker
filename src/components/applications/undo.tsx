"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";

import { useToast } from "@/components/ui/toast";
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

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => dismiss(current.id), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [current]);

  if (!current) return null;

  const restore = () =>
    startTransition(async () => {
      const res = await restoreApplications(current.records);
      dismiss(current.id);
      if (res.ok) {
        toast({ title: "Restored", body: res.data.count === 1 ? "Right back where it was." : `${res.data.count} applications are back.`, tone: "success" });
      } else {
        toast({ title: "Couldn't undo", body: res.error, tone: "warning" });
      }
    });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[55] flex justify-center px-4 md:bottom-6">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink px-4 py-2.5 text-sm text-paper shadow-lift"
      >
        <AppIcon name="trash" className="size-4 shrink-0 opacity-70" />
        <p className="min-w-0 flex-1 truncate">{current.label}</p>
        <button
          type="button"
          onClick={restore}
          disabled={pending}
          className="flex h-10 items-center gap-1.5 rounded-full bg-paper/15 px-3.5 font-semibold text-paper hover:bg-paper/25 disabled:opacity-60"
        >
          <AppIcon name="undo" className="size-4" />
          {pending ? "Restoring…" : "Undo"}
        </button>
        <button type="button" onClick={() => dismiss(current.id)} aria-label="Dismiss" className="flex size-10 items-center justify-center rounded-full opacity-70 hover:bg-paper/15 hover:opacity-100">
          <AppIcon name="x" className="size-4" />
        </button>
      </div>
    </div>
  );
}
