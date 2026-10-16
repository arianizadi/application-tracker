"use client";

import { useId, useState } from "react";

import type { FoundTerm, MissingTerm, Requirement } from "@/lib/analyzer/types";

const REQ_LABEL: Record<Requirement, string> = { required: "Required", mentioned: "Mentioned", preferred: "Nice to have" };

function WeightDots({ weight, tone }: { weight: number; tone: "found" | "missing" }) {
  return (
    <span aria-hidden className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`size-1.5 rounded-full ${n <= weight ? (tone === "found" ? "bg-moss" : "bg-coral") : tone === "found" ? "bg-moss/25" : "bg-coral/25"}`}
        />
      ))}
    </span>
  );
}

type Chip = (FoundTerm & { kind: "found" }) | (MissingTerm & { kind: "missing" });

/**
 * Keyword chips. Tap one to open its detail (evidence for found terms, a tip
 * for missing ones) in a single panel under the list. Works by keyboard and
 * touch, with no hover-only UI.
 */
export function KeywordChips({ items, tone, empty }: { items: (FoundTerm | MissingTerm)[]; tone: "found" | "missing"; empty: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const panelId = useId();
  const chips = items.map((i) => ({ ...i, kind: tone }) as Chip);
  const open = chips.find((c) => c.id === openId) ?? null;

  if (chips.length === 0) return <p className="text-sm text-muted">{empty}</p>;

  return (
    <div>
      <ul className="flex animate-fade flex-wrap gap-2 [animation-duration:160ms]">
        {chips.map((c) => {
          const selected = c.id === openId;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-expanded={selected}
                aria-controls={panelId}
                onClick={() => setOpenId(selected ? null : c.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  tone === "found"
                    ? selected
                      ? "border-moss bg-moss text-paper"
                      : "border-moss/30 bg-moss-soft text-moss-strong hover:border-moss"
                    : selected
                      ? "border-coral bg-coral text-white"
                      : "border-coral/35 bg-coral-soft text-ink hover:border-coral"
                }`}
              >
                {tone === "found" ? (
                  <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                ) : null}
                <span>{c.term}</span>
                {c.requirement === "required" ? (
                  <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${selected ? "bg-white/20" : tone === "found" ? "bg-moss/15" : "bg-coral/20"}`}>
                    req
                  </span>
                ) : null}
                {!selected ? <WeightDots weight={c.weight} tone={tone} /> : null}
                <span className="sr-only">
                  {`, weight ${c.weight} of 3${c.requirement ? `, ${REQ_LABEL[c.requirement]}` : ""}. Show ${tone === "found" ? "evidence" : "tip"}.`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div id={panelId} aria-live="polite">
        {open ? (
          <div
            className={`mt-3 animate-rise rounded-2xl border p-4 text-sm [animation-duration:200ms] ${open.kind === "found" ? "border-moss/30 bg-moss-soft/60" : "border-coral/30 bg-coral-soft/60"}`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="font-semibold text-ink">{open.term}</p>
              <span className="text-xs text-muted">
                {open.categoryLabel}
                {open.requirement ? ` · ${REQ_LABEL[open.requirement]}` : ""} · weight {open.weight}/3
              </span>
            </div>
            {open.kind === "found" ? (
              <>
                <p className="mt-2 text-ink-soft">
                  Matched as <mark className="rounded bg-sun-soft px-1 text-ink">{open.matchedAs}</mark>
                  {open.viaAlternative ? <> · covers the either-or with {open.viaAlternative}</> : null}
                </p>
                <blockquote className="mt-2 border-l-2 border-moss/40 pl-3 text-ink-soft">{open.evidence}</blockquote>
              </>
            ) : (
              <>
                <p className="mt-2 text-ink-soft">{open.tip}</p>
                <p className="mt-2 text-xs text-muted">Not mentioned here. Add it only if it&apos;s true.</p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
