"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { ACTIVE_STATUSES, CLOSED_STATUSES, STATUS_META } from "@/lib/status";

import { AppIcon } from "./icons";

/**
 * Accessible modal built on <dialog>: a bottom sheet on phones, a centered
 * card on larger screens. Esc and backdrop taps close it; focus is trapped by
 * the browser.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 mt-auto max-h-[88dvh] w-full max-w-full overflow-y-auto rounded-t-3xl border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-night/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:w-[28rem] sm:rounded-3xl"
    >
      {open ? (
        <div className="pb-safe animate-rise px-5 pt-3 sm:px-6 sm:pt-6">
          <div aria-hidden className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold leading-snug">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
            >
              <AppIcon name="x" className="size-5" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

/** "Move to…" picker used by cards, the list, bulk actions and keyboard users. */
export function StatusSheet({
  open,
  onClose,
  title,
  description,
  current,
  exclude = [],
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  current?: ApplicationStatus;
  exclude?: ApplicationStatus[];
  onPick: (status: ApplicationStatus) => void;
}) {
  const groups: { label: string; statuses: ApplicationStatus[] }[] = [
    { label: "In progress", statuses: ACTIVE_STATUSES.filter((s) => !exclude.includes(s)) },
    { label: "Closed", statuses: CLOSED_STATUSES.filter((s) => !exclude.includes(s)) },
  ];

  return (
    <Sheet open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col gap-4 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.statuses.map((status) => {
                const meta = STATUS_META[status];
                const isCurrent = status === current;
                return (
                  <li key={status}>
                    <button
                      type="button"
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => {
                        onPick(status);
                        onClose();
                      }}
                      className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${
                        isCurrent ? "bg-moss-soft" : "hover:bg-paper-2"
                      }`}
                    >
                      <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${meta.dot}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">{meta.label}</span>
                        <span className="block text-xs text-muted">{meta.hint}</span>
                      </span>
                      {isCurrent ? <AppIcon name="check" className="size-5 text-moss" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

/** Small confirm dialog for destructive actions. */
export function ConfirmSheet({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col-reverse gap-2 pb-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-full border border-line-strong bg-card px-5 text-sm font-medium hover:bg-paper-2"
        >
          Keep it
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="h-11 rounded-full bg-coral px-5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
