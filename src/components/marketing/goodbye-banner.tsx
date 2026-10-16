"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Shown on "/" after account deletion (`/?goodbye=1`). Reads search params on
 * the client, so wrap it in <Suspense fallback={null}> to keep the page static.
 */
export function GoodbyeBanner() {
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (params.get("goodbye") !== "1" || dismissed) return null;

  return (
    <div role="status" className="border-b border-line bg-sun-soft">
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-3 sm:items-center sm:px-6 lg:px-10">
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-semibold">Your account and everything in it has been deleted.</span>{" "}
          Thanks for growing something with us. Good luck out there, and the door stays open.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-card hover:text-ink"
          aria-label="Dismiss message"
        >
          <svg viewBox="0 0 20 20" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
