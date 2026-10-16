"use client";

import { useEffect, useRef, useState } from "react";

import { PrepIcon } from "./icons";

/** Copies `text` to the clipboard with a short "Copied" confirmation. */
export function CopyButton({ text, label = "Copy code" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-soft transition-colors hover:bg-card hover:text-ink sm:min-h-9"
      aria-label={state === "copied" ? "Copied" : label}
    >
      <PrepIcon name={state === "copied" ? "check" : "copy"} className="size-3.5" />
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl+C" : "Copy"}</span>
    </button>
  );
}
