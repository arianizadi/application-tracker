"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { RIcon } from "./icons";

/**
 * Native <dialog> that is a bottom sheet on phones and a centered modal from
 * `sm` up. Escape, the close button and a backdrop tap all close it.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: "md" | "xl";
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
      className={`mx-0 mb-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-night/55 backdrop:backdrop-blur-[2px] open:animate-rise sm:m-auto sm:rounded-3xl ${
        size === "xl" ? "sm:max-w-5xl" : "sm:max-w-lg"
      }`}
    >
      {open ? (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 pb-3 pt-4 sm:px-6">
            <div className="min-w-0">
              <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong sm:hidden" />
              <h2 id={titleId} className="text-lg font-semibold leading-tight">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
              aria-label="Close"
            >
              <RIcon name="x" className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
