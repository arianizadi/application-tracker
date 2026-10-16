"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";

/** Short reference that matches server logs. Never the message or stack. */
function digestOf(error: unknown): string | undefined {
  if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string") {
    return error.digest.slice(0, 32);
  }
  return undefined;
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/**
 * Friendly error UI for error.tsx boundaries. Shows no stack traces or raw
 * messages; offers a retry and a way home.
 */
export function ErrorView({
  error,
  retry,
  homeHref = "/",
  homeLabel = "Go home",
  compact = false,
}: {
  error: unknown;
  retry: () => void;
  homeHref?: string;
  homeLabel?: string;
  compact?: boolean;
}) {
  const [retrying, setRetrying] = useState(false);
  const digest = digestOf(error);
  const offline = useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false);

  useEffect(() => {
    // Logged for local debugging; production errors arrive with only a digest.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className={`mx-auto flex w-full max-w-lg flex-col items-center text-center ${compact ? "py-12" : "min-h-[70dvh] justify-center px-4 py-16"}`}
    >
      <Mascot name="moss" mood="comfort" className="size-28 sm:size-32" />
      <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
        {offline ? "You seem to be offline." : "Something tripped over a root."}
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
        {offline
          ? "Keep drafting if you like. Your drafts stay on this device, and account saves will work again once you're back online."
          : "That wasn't you. Your saved work is safe. Give it another try, and if it keeps happening, take a breather and come back in a bit."}
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button
          size="lg"
          disabled={retrying}
          onClick={() => {
            setRetrying(true);
            retry();
            window.setTimeout(() => setRetrying(false), 1500);
          }}
        >
          {retrying ? "Trying again…" : "Try again"}
        </Button>
        <Link
          href={homeHref}
          className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-card px-6 text-base font-medium text-ink transition-colors hover:bg-paper-2"
        >
          {homeLabel}
        </Link>
      </div>
      {digest ? (
        <p className="mt-6 text-xs text-muted">
          Reference code: <span className="font-mono">{digest}</span>
        </p>
      ) : null}
    </div>
  );
}
