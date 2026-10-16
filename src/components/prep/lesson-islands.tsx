"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useId, useMemo, useState, useSyncExternalStore, type MouseEvent } from "react";

import { useCelebrate } from "@/components/fx";
import type { PracticeQuestion, Resource } from "@/content/prep/types";
import { XP } from "@/lib/game/xp";
import { isDoneState, progressKey } from "@/lib/prep/progress";

import { PrepIcon } from "./icons";
import { useProgressItem, useProgressMap } from "./progress-context";
import { ResourceToggles, ResourceTogglesSkeleton } from "./resource-card";
import { RichText } from "./rich-text";

/* ── Practice questions ───────────────────────────────────────────────────── */

const DIFFICULTY: Record<NonNullable<PracticeQuestion["difficulty"]>, { label: string; cls: string }> = {
  warmup: { label: "Warm-up", cls: "border-leaf/40 bg-moss-soft text-moss" },
  core: { label: "Core", cls: "border-sky/50 bg-sky-soft text-ink" },
  stretch: { label: "Stretch", cls: "border-berry/30 bg-berry-soft text-berry" },
};

export function QuestionCard({ q, index }: { q: PracticeQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const diff = q.difficulty ? DIFFICULTY[q.difficulty] : null;

  return (
    <li id={`q-${q.id}`} className="scroll-mt-24 list-none rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-ink px-2 font-mono text-xs font-semibold text-paper">
          Q{index + 1}
        </span>
        {diff ? (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 ${diff.cls}`}>{diff.label}</span>
        ) : null}
        <Suspense fallback={null}>
          <QuestionStateChip id={q.id} />
        </Suspense>
      </div>

      <p className="mt-3 font-display text-[19px] font-medium leading-snug text-ink sm:text-[21px]">
        <RichText text={q.question} />
      </p>

      {open ? (
        <div id={panelId} className="mt-4 animate-fade space-y-4">
          <div className="rounded-2xl border border-moss/20 bg-moss-soft/50 px-4 py-3.5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-moss">Model answer</p>
            <p className="text-[15.5px] leading-[1.7] text-ink">
              <RichText text={q.answer} />
            </p>
          </div>
          <div className="flex gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3">
            <PrepIcon name="eye" className="mt-0.5 size-4 shrink-0 text-berry" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-berry">What they&apos;re checking</p>
              <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink-soft">
                <RichText text={q.checking} />
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
            open ? "text-ink-soft hover:bg-paper-2" : "border border-dashed border-moss/50 bg-paper text-moss hover:bg-moss-soft"
          }`}
        >
          <PrepIcon name={open ? "x" : "eye"} className="size-4" />
          {open ? "Hide answer" : "Think first, then reveal"}
        </button>
        <Suspense fallback={<QuestionButtonsSkeleton />}>
          <QuestionButtons id={q.id} />
        </Suspense>
      </div>
    </li>
  );
}

function QuestionStateChip({ id }: { id: string }) {
  const { state } = useProgressItem("question", id);
  if (state !== "review") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sun/50 bg-sun-soft px-2 py-0.5 text-[11px] font-medium leading-5 text-ink">
      <PrepIcon name="flag" className="size-3" /> Flagged for review
    </span>
  );
}

function QuestionButtons({ id }: { id: string }) {
  const { state, set } = useProgressItem("question", id);
  const btn =
    "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,transform] active:scale-[0.97] sm:flex-none";
  const practiced = state === "practiced";
  const confident = state === "mastered";
  return (
    <div className="flex gap-2" role="group" aria-label="How did that go?">
      <button
        type="button"
        aria-pressed={practiced}
        onClick={() => void set(practiced ? null : "practiced")}
        className={`${btn} ${practiced ? "border-sky bg-sky-soft text-ink" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2 hover:text-ink"}`}
      >
        <PrepIcon name="check" className="size-4" /> Practiced
      </button>
      <button
        type="button"
        aria-pressed={confident}
        onClick={() => void set(confident ? null : "mastered")}
        className={`${btn} ${confident ? "border-moss bg-moss text-paper" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2 hover:text-ink"}`}
      >
        <PrepIcon name="sparkle" className="size-4" /> Confident
      </button>
    </div>
  );
}

function QuestionButtonsSkeleton() {
  return (
    <div aria-hidden className="flex gap-2">
      <span className="h-11 flex-1 animate-pulse rounded-full bg-paper-2 sm:w-28 sm:flex-none" />
      <span className="h-11 flex-1 animate-pulse rounded-full bg-paper-2 sm:w-28 sm:flex-none" />
    </div>
  );
}

/* ── Module progress + completion ─────────────────────────────────────────── */

function useModuleCounts(questionIds: readonly string[]) {
  const map = useProgressMap();
  let practiced = 0;
  let confident = 0;
  for (const id of questionIds) {
    const s = map[progressKey("question", id)];
    if (isDoneState("question", s)) practiced++;
    if (s === "mastered") confident++;
  }
  return { practiced, confident, total: questionIds.length };
}

/** "4 of 11 questions practiced" with a slim bar. Wrap in <Suspense>. */
export function ModuleProgressMeter({ questionIds, compact = false }: { questionIds: readonly string[]; compact?: boolean }) {
  const { practiced, confident, total } = useModuleCounts(questionIds);
  const pct = total ? Math.round((practiced / total) * 100) : 0;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium text-ink">
          <span className="tabular">{practiced}</span> of <span className="tabular">{total}</span> questions practiced
        </span>
        {!compact && confident > 0 ? <span className="text-muted tabular">{confident} confident</span> : null}
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2"
        role="progressbar"
        aria-label="Practice questions practiced"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={practiced}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-leaf to-moss transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ModuleProgressMeterSkeleton() {
  return (
    <div aria-hidden className="min-w-0">
      <div className="h-4 w-44 animate-pulse rounded bg-paper-2" />
      <div className="mt-1.5 h-2 animate-pulse rounded-full bg-paper-2" />
    </div>
  );
}

/** Small "Completed" pill for headers. Wrap in <Suspense fallback={null}>. */
export function ModuleDoneBadge({ moduleId }: { moduleId: string }) {
  const { state } = useProgressItem("module", moduleId);
  if (state !== "done") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-moss/30 bg-moss-soft px-2.5 py-0.5 text-xs font-semibold text-moss">
      <PrepIcon name="check" className="size-3.5" /> Completed
    </span>
  );
}

export function ModuleCompleteButton({
  moduleId,
  title,
  questionIds,
  next,
}: {
  moduleId: string;
  title: string;
  questionIds: readonly string[];
  next: { href: string; title: string } | null;
}) {
  const { state, set, pending } = useProgressItem("module", moduleId);
  const { practiced, total } = useModuleCounts(questionIds);
  const { celebrate } = useCelebrate();
  const done = state === "done";

  async function complete(e: MouseEvent<HTMLButtonElement>) {
    const origin = e.currentTarget;
    const ok = await set("done");
    if (ok) {
      celebrate("achievement", {
        title: "Module complete!",
        body: `“${title}” is officially in your toolkit. +${XP.prep.module} XP for the canopy.`,
        mascot: "alder",
        mood: "cheer",
        origin,
      });
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-16 animate-pop place-items-center rounded-full bg-moss text-paper shadow-lift">
          <PrepIcon name="check" className="size-8" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold">Module complete</p>
          <p className="mt-1 text-[15px] text-ink-soft">
            Nice work. {practiced < total ? `${total - practiced} practice question${total - practiced === 1 ? "" : "s"} left whenever you want more reps.` : "Every practice question done, too."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {next ? (
            <Link href={next.href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-moss px-5 text-sm font-medium text-paper shadow-soft hover:bg-moss-strong">
              Next: {next.title} <PrepIcon name="arrow-right" className="size-4" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void set(null)}
            disabled={pending}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
          >
            <PrepIcon name="undo" className="size-4" /> Mark as not done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-[15px] text-ink-soft">
        {practiced === 0
          ? "Read it, try a few questions out loud, then mark it done. You can always come back."
          : `${practiced} of ${total} questions practiced. Ready to call it?`}
      </p>
      <button
        type="button"
        onClick={complete}
        disabled={pending}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-moss px-6 text-base font-medium text-paper shadow-soft transition-[background-color,transform] hover:bg-moss-strong active:scale-[0.97] disabled:opacity-60"
      >
        <PrepIcon name="check" className="size-5" /> Mark module complete
      </button>
    </div>
  );
}

export function ModuleCompleteSkeleton() {
  return <div aria-hidden className="mx-auto h-24 w-full max-w-sm animate-pulse rounded-3xl bg-paper-2" />;
}

/* ── Resources on a lesson page ───────────────────────────────────────────── */

export function ResourceProgressActions({ resource }: { resource: Pick<Resource, "id" | "title"> }) {
  return (
    <Suspense fallback={<ResourceTogglesSkeleton />}>
      <ConnectedToggles resource={resource} />
    </Suspense>
  );
}

function ConnectedToggles({ resource }: { resource: Pick<Resource, "id" | "title"> }) {
  const { state, pending, set } = useProgressItem("resource", resource.id);
  return <ResourceToggles state={state} pending={pending} onChange={(n) => void set(n)} title={resource.title} />;
}

/* ── Objectives checklist (per-device, localStorage) ──────────────────────── */

const OBJ_EVENT = "canopy:prep-objectives";

function readStorage(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function useLocalString(key: string): [string, (v: string) => void] {
  const subscribe = useCallback((cb: () => void) => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(OBJ_EVENT, cb);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(OBJ_EVENT, cb);
    };
  }, [key]);
  const value = useSyncExternalStore(subscribe, () => readStorage(key), () => "");
  const set = useCallback(
    (v: string) => {
      try {
        window.localStorage.setItem(key, v);
      } catch {
        // Storage blocked: checks just won't persist.
      }
      window.dispatchEvent(new Event(OBJ_EVENT));
    },
    [key],
  );
  return [value, set];
}

export function ObjectivesChecklist({ moduleId, objectives }: { moduleId: string; objectives: readonly string[] }) {
  const [raw, setRaw] = useLocalString(`canopy:prep:objectives:${moduleId}`);
  const checked = useMemo(() => new Set(raw.split(",").filter(Boolean).map(Number)), [raw]);
  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setRaw([...next].sort((a, b) => a - b).join(","));
  };

  return (
    <ul className="space-y-1">
      {objectives.map((o, i) => {
        const on = checked.has(i);
        return (
          <li key={i}>
            <label className="group flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-paper-2/70">
              <input type="checkbox" checked={on} onChange={() => toggle(i)} className="peer sr-only" />
              <span
                aria-hidden
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                  on ? "border-moss bg-moss text-paper" : "border-line-strong bg-card"
                }`}
              >
                {on ? <PrepIcon name="check" className="size-3.5" strokeWidth={2.6} /> : null}
              </span>
              <span className={`text-[15px] leading-snug transition-colors ${on ? "text-muted line-through decoration-line-strong" : "text-ink"}`}>
                <RichText text={o} links={false} />
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Key terms ────────────────────────────────────────────────────────────── */

export function TermsGlossary({ terms }: { terms: readonly { term: string; definition: string }[] }) {
  const [quiz, setQuiz] = useState(false);
  const [shown, setShown] = useState<Set<number>>(() => new Set());

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{terms.length} terms worth being able to say out loud.</p>
        <button
          type="button"
          role="switch"
          aria-checked={quiz}
          onClick={() => {
            setQuiz((q) => !q);
            setShown(new Set());
          }}
          className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <span aria-hidden className={`relative h-5 w-9 rounded-full transition-colors ${quiz ? "bg-moss" : "bg-line-strong"}`}>
            <span className={`absolute top-0.5 size-4 rounded-full bg-card shadow-soft transition-[left] ${quiz ? "left-[18px]" : "left-0.5"}`} />
          </span>
          Quiz me
        </button>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {terms.map((t, i) => {
          const hidden = quiz && !shown.has(i);
          return (
            <div key={t.term} className="flex min-w-0 flex-col rounded-2xl border border-line bg-card px-4 py-3.5">
              <dt className="font-display text-[17px] font-semibold leading-snug text-ink">
                <RichText text={t.term} links={false} />
              </dt>
              {hidden ? (
                <dd className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShown((s) => new Set(s).add(i))}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm font-medium text-moss hover:bg-moss-soft/60"
                  >
                    <PrepIcon name="eye" className="size-4" /> Say it, then tap to check
                  </button>
                </dd>
              ) : (
                <dd className={`mt-1 text-[14.5px] leading-relaxed text-ink-soft ${quiz ? "animate-fade" : ""}`}>
                  <RichText text={t.definition} />
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/* ── Table of contents ────────────────────────────────────────────────────── */

export type TocItem = { id: string; label: string; sub?: boolean };

function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        if (visible.size > 0) {
          const first = ids.find((id) => visible.has(id));
          if (first) setActive(first);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function LessonToc({ items }: { items: readonly TocItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);
  const list = (closeOnPick: boolean) => (
    <ol className="space-y-0.5">
      {items.map((item) => {
        const on = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={closeOnPick ? (e) => e.currentTarget.closest("details")?.removeAttribute("open") : undefined}
              aria-current={on ? "location" : undefined}
              className={`flex min-h-11 items-center rounded-xl border-l-2 py-1.5 pr-2 text-[14px] leading-snug transition-colors lg:min-h-9 ${
                item.sub ? "pl-5" : "pl-3 font-medium"
              } ${on ? "border-moss bg-moss-soft/60 text-ink" : "border-transparent text-ink-soft hover:bg-paper-2 hover:text-ink"}`}
            >
              <RichText text={item.label} links={false} />
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details className="group rounded-2xl border border-line bg-card shadow-soft lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <PrepIcon name="list" className="size-4 text-moss" /> On this page
          </span>
          <PrepIcon name="chevron-down" className="size-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <nav aria-label="Lesson sections" className="border-t border-line px-2 py-2">
          {list(true)}
        </nav>
      </details>
      <nav aria-label="Lesson sections" className="hidden lg:block">
        <p className="mb-2 pl-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">On this page</p>
        {list(false)}
      </nav>
    </>
  );
}
