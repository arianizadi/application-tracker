"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { Mascot } from "@/components/mascots";

const KEY = "canopy:home:welcome-dismissed";
const EVENT = "canopy:home:welcome";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readDismissed(): "yes" | "no" {
  try {
    return localStorage.getItem(KEY) === "1" ? "yes" : "no";
  } catch {
    return "no";
  }
}

export type WelcomeSteps = { plant: boolean; resume: boolean; explore: boolean };

type Step = { key: keyof WelcomeSteps; title: string; body: string; links: { href: string; label: string }[] };

const STEPS: Step[] = [
  {
    key: "plant",
    title: "Plant your first application",
    body: "Company and role is enough. Ten seconds, tops. Wishlist roles count as seeds.",
    links: [{ href: "/applications/new", label: "Add one" }],
  },
  {
    key: "resume",
    title: "Upload a resume version",
    body: "So later you'll know which version opened which doors. Nib keeps the library.",
    links: [{ href: "/resumes", label: "Upload" }],
  },
  {
    key: "explore",
    title: "Run the analyzer or start interview prep",
    body: "Rue checks keywords against real cyber roles; Pip runs gentle practice.",
    links: [
      { href: "/analyzer", label: "Analyzer" },
      { href: "/prep", label: "Prep" },
    ],
  },
];

/**
 * Three-step welcome with checkmarks derived from real data. Dismissal lives in
 * localStorage (per device). `force` (?welcome=1 right after sign-up) shows it
 * even if it was dismissed on this device before.
 */
export function WelcomeCard({ steps, force, name }: { steps: WelcomeSteps; force: boolean; name: string }) {
  // Server render: show when forced; otherwise wait for the client to know about dismissal.
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => (force ? "no" : "unknown"));
  const [hidden, setHidden] = useState(false);
  if (hidden || dismissed === "unknown" || (dismissed === "yes" && !force)) return null;

  const done = STEPS.filter((s) => steps[s.key]).length;
  const allDone = done === STEPS.length;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Storage blocked: hide for this view only.
    }
    setHidden(true);
    window.dispatchEvent(new Event(EVENT));
    // Drop ?welcome=1 so the card stays hidden on refresh.
    if (force) window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative animate-rise overflow-hidden rounded-3xl border border-moss/25 bg-linear-to-br from-moss-soft via-card to-sun-soft p-5 shadow-soft sm:p-7"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-card hover:text-ink"
        aria-label="Hide the welcome checklist"
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
        <Mascot name="alder" mood={allDone ? "cheer" : "happy"} className="size-20 shrink-0 sm:size-28" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Welcome to Canopy</p>
          <h2 id="welcome-heading" className="mt-1 pr-10 text-2xl font-semibold leading-tight sm:text-3xl">
            {allDone ? `You're all set, ${name}.` : "You handle the applying. This place remembers the work."}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            {allDone
              ? "Every step done. From here it's one tree at a time, at whatever pace your semester allows."
              : "Three small steps, in any order, whenever. Skip any of them. Your forest grows either way."}
          </p>

          <p className="mt-4 text-sm font-medium text-ink-soft" aria-live="polite">
            <span className="tabular">{done}</span> of {STEPS.length} done
          </p>
          <div className="mt-1.5 flex gap-1.5" aria-hidden>
            {STEPS.map((s) => (
              <span key={s.key} className={`h-1.5 flex-1 rounded-full ${steps[s.key] ? "bg-moss" : "bg-line"}`} />
            ))}
          </div>

          <ol className="mt-4 flex flex-col gap-2">
            {STEPS.map((s, i) => {
              const ok = steps[s.key];
              return (
                <li key={s.key} className={`flex items-start gap-3 rounded-2xl border p-3 sm:p-4 ${ok ? "border-moss/25 bg-moss-soft/60" : "border-line bg-card"}`}>
                  <span
                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                      ok ? "bg-moss text-paper" : "border border-line-strong bg-paper text-ink-soft"
                    }`}
                  >
                    {ok ? (
                      <svg viewBox="0 0 16 16" className="size-4 animate-pop" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                    ) : (
                      <span aria-hidden>{i + 1}</span>
                    )}
                    <span className="sr-only">{ok ? "Done:" : "To do:"}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold leading-snug ${ok ? "text-moss-strong" : ""}`}>{s.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{s.body}</p>
                    {!ok ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.links.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className="inline-flex h-11 items-center rounded-full border border-line-strong bg-card px-4 text-sm font-medium transition-colors hover:bg-paper-2 sm:h-9"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={dismiss}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            {allDone ? "Put the checklist away" : "I'll explore on my own"}
          </button>
        </div>
      </div>
    </section>
  );
}
