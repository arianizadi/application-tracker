"use client";

import { useState } from "react";

import { useToast } from "@/components/ui/toast";

import { EditResumeForm } from "./edit-form";
import { RIcon } from "./icons";

/** Collapsible monospace view of a version's extracted text, with copy and edit. */
export function ResumeTextPanel({
  id,
  version,
  label,
  notes,
  text,
  words,
  defaultOpen = false,
}: {
  id: string;
  version: number;
  label: string;
  notes: string | null;
  text: string;
  words: number;
  defaultOpen?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast({ tone: "success", title: "Copied", body: `${words.toLocaleString()} words on your clipboard.` });
    } catch {
      toast({ tone: "warning", title: "Couldn't copy", body: "Your browser blocked clipboard access." });
    }
  }

  return (
    <details id="text" open={defaultOpen || undefined} className="group scroll-mt-24 rounded-3xl border border-line bg-card shadow-soft">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-display text-lg font-semibold leading-tight">Extracted text</span>
          <span className="block text-sm text-muted">
            {text.length ? `${words.toLocaleString()} words — what the analyzer reads` : "No text yet — paste it so the analyzer can help"}
          </span>
        </span>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-line px-5 pb-5 pt-4 sm:px-6">
        {editing ? (
          <EditResumeForm id={id} version={version} label={label} notes={notes} text={text} includeText onDone={() => setEditing(false)} />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                disabled={!text.length}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium hover:bg-paper-2 disabled:opacity-50 sm:h-10"
              >
                <RIcon name="copy" />
                Copy text
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink sm:h-10"
              >
                <RIcon name="pencil" />
                Fix the text
              </button>
            </div>
            {text.length ? (
              <pre className="max-h-[60dvh] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-paper-2 p-4 font-mono text-[13px] leading-relaxed text-ink-soft">
                {text}
              </pre>
            ) : (
              <p className="rounded-2xl bg-paper-2 p-4 text-sm text-muted">
                This PDF didn&apos;t have a readable text layer (scanned, probably). Tap “Fix the text” and paste it in.
              </p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
