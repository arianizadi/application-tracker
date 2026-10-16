"use client";

import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type PointerEvent } from "react";

import { useToast } from "@/components/ui/toast";
import { FLASHCARDS } from "@/content/prep/flashcards";
import type { Flashcard } from "@/content/prep/types";
import { setProgress } from "@/lib/prep/actions";
import { progressKey, type FlashcardState, type ProgressMap } from "@/lib/prep/progress";
import { seededShuffle } from "@/lib/prep/random";

import styles from "./flashcard.module.css";
import { PrepIcon } from "./icons";
import { plainText, RichText } from "./rich-text";

type Filter = "all" | "unknown" | "learning";
type States = Record<string, FlashcardState | undefined>;
export type DeckModuleOption = { id: string; number: number; title: string };

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All cards" },
  { key: "unknown", label: "To learn" },
  { key: "learning", label: "Learning" },
];

const SAVE_DELAY = 700;
const SWIPE_PX = 70;

function initialStates(map: ProgressMap): States {
  const out: States = {};
  for (const f of FLASHCARDS) {
    const s = map[progressKey("flashcard", f.id)];
    if (s === "known" || s === "learning") out[f.id] = s;
  }
  return out;
}

function buildDeck(filter: Filter, moduleId: string, seed: number, states: States): string[] {
  const cards = FLASHCARDS.filter((f) => {
    if (moduleId && f.moduleId !== moduleId) return false;
    const s = states[f.id];
    if (filter === "unknown") return s !== "known";
    if (filter === "learning") return s === "learning";
    return true;
  });
  return seededShuffle(cards, seed).map((f) => f.id);
}

const BY_ID: Record<string, Flashcard> = Object.fromEntries(FLASHCARDS.map((f) => [f.id, f]));

export function FlashcardDeck({ initial, modules }: { initial: ProgressMap; modules: DeckModuleOption[] }) {
  const toast = useToast();
  const [states, setStates] = useState<States>(() => initialStates(initial));
  const [filter, setFilter] = useState<Filter>("all");
  const [moduleId, setModuleId] = useState("");
  const [seed, setSeed] = useState(0);
  const [deck, setDeck] = useState<string[]>(() => buildDeck("all", "", 0, initialStates(initial)));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dx, setDx] = useState(0);
  const [announce, setAnnounce] = useState("");

  const moduleTitle = useMemo(() => Object.fromEntries(modules.map((m) => [m.id, m.title])), [modules]);
  const card = deck.length ? BY_ID[deck[Math.min(index, deck.length - 1)]] : undefined;
  const position = deck.length ? Math.min(index, deck.length - 1) : 0;
  const knownInDeck = deck.filter((id) => states[id] === "known").length;
  const knownTotal = FLASHCARDS.filter((f) => states[f.id] === "known").length;

  /* ── Debounced, optimistic saving ─────────────────────────────────────── */
  const queue = useRef(new Map<string, { next: FlashcardState; prev: FlashcardState | undefined }>());
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const batch = [...queue.current.entries()];
    queue.current.clear();
    if (batch.length === 0) return;
    void Promise.all(
      batch.map(async ([id, { next, prev }]) => {
        try {
          const res = await setProgress("flashcard", id, next);
          return res.ok ? null : { id, prev };
        } catch {
          return { id, prev };
        }
      }),
    ).then((results) => {
      const failed = results.filter((r): r is { id: string; prev: FlashcardState | undefined } => r !== null);
      if (failed.length === 0) return;
      setStates((s) => {
        const out = { ...s };
        for (const f of failed) out[f.id] = f.prev;
        return out;
      });
      toast({ tone: "warning", title: "Some cards weren't saved", body: "Check your connection and mark them again." });
    });
  }, [toast]);

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, [flush]);

  /* ── Actions ──────────────────────────────────────────────────────────── */
  const go = useCallback(
    (delta: number) => {
      if (deck.length === 0) return;
      setFlipped(false);
      setIndex((i) => (Math.min(i, deck.length - 1) + delta + deck.length) % deck.length);
    },
    [deck.length],
  );

  const mark = useCallback(
    (next: FlashcardState) => {
      if (!card) return;
      const prev = states[card.id];
      if (prev !== next) {
        setStates((s) => ({ ...s, [card.id]: next }));
        const queued = queue.current.get(card.id);
        queue.current.set(card.id, { next, prev: queued ? queued.prev : prev });
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(flush, SAVE_DELAY);
      }
      setAnnounce(next === "known" ? "Marked as known." : "Marked as still learning.");
      if (position < deck.length - 1) go(1);
      else {
        setFlipped(false);
        setAnnounce(`${next === "known" ? "Marked as known." : "Marked as still learning."} That was the last card in this deck.`);
      }
    },
    [card, states, flush, go, position, deck.length],
  );

  const rebuild = (f: Filter, m: string, s: number) => {
    setDeck(buildDeck(f, m, s, states));
    setIndex(0);
    setFlipped(false);
  };

  /* ── Keyboard ─────────────────────────────────────────────────────────── */
  // Single-key shortcuts only fire while focus is inside the deck (WCAG 2.1.4),
  // and never from the filter/module controls, where arrows and letters mean something else.
  const root = useRef<HTMLDivElement>(null);
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target instanceof HTMLElement ? e.target : null;
    if (!t || !root.current?.contains(t)) return;
    if (t.closest("input, textarea, select, [contenteditable='true'], [role='group']")) return;
    // Space on a focused button already clicks it (the card's click flips it).
    if (e.key === " " && t?.closest("button, a, summary")) return;
    if (e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "k" || e.key === "K") mark("known");
    else if (e.key === "l" || e.key === "L") mark("learning");
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Swipe (pointer events) ───────────────────────────────────────────── */
  const drag = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.moved && Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) setDx(mx);
  }
  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.moved) return;
    suppressClick.current = true;
    const mx = e.clientX - d.x;
    setDx(0);
    if (mx <= -SWIPE_PX) go(1);
    else if (mx >= SWIPE_PX) go(-1);
  }

  const pct = deck.length ? Math.round((knownInDeck / deck.length) * 100) : 0;
  const state = card ? states[card.id] : undefined;

  return (
    <div ref={root} className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div role="group" aria-label="Which cards" className="inline-flex w-full rounded-full border border-line bg-paper-2/70 p-1 sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                rebuild(f.key, moduleId, seed);
              }}
              className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                filter === f.key ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">Module</span>
            <select
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                rebuild(filter, e.target.value, seed);
              }}
              className="h-11 w-full appearance-none truncate rounded-full border border-line-strong bg-card pl-4 pr-9 text-sm font-medium text-ink sm:w-60"
            >
              <option value="">Every module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {String(m.number).padStart(2, "0")} · {m.title}
                </option>
              ))}
            </select>
            <PrepIcon name="chevron-down" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          </label>
          <button
            type="button"
            onClick={() => {
              const s = seed + 1;
              setSeed(s);
              rebuild(filter, moduleId, s);
              setAnnounce(`Shuffled. Order number ${s}.`);
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line-strong bg-card px-4 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <PrepIcon name="shuffle" className="size-4" /> Shuffle{seed > 0 ? <span className="text-muted tabular">#{seed}</span> : null}
          </button>
          {seed > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSeed(0);
                rebuild(filter, moduleId, 0);
              }}
              aria-label="Back to the original order"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-2 hover:text-ink"
            >
              <PrepIcon name="undo" className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium tabular">{deck.length ? `Card ${position + 1} of ${deck.length}` : "No cards"}</span>
          <span className="text-muted tabular">
            {knownInDeck} known here · {knownTotal}/{FLASHCARDS.length} overall
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-paper-2"
          role="progressbar"
          aria-label="Cards known in this deck"
          aria-valuemin={0}
          aria-valuemax={deck.length}
          aria-valuenow={knownInDeck}
        >
          <div
            className="h-full w-full rounded-full bg-gradient-to-r from-sun to-leaf transition-transform duration-500 motion-reduce:transition-none"
            style={{ transform: `translateX(${pct - 100}%)` }}
          />
        </div>
      </div>

      {card ? (
        <>
          <div className={`${styles.scene} mx-auto w-full max-w-2xl`}>
            <div
              className={`${styles.drag} h-[23rem] sm:h-[21rem]`}
              style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 30}deg)` : undefined, transition: dx ? "none" : "transform 220ms ease-out" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
            >
              <button
                type="button"
                data-flashcard
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  setFlipped((f) => !f);
                }}
                className="block size-full rounded-[2rem] text-left focus-visible:outline-offset-4"
              >
                <span className={styles.card} data-flipped={flipped}>
                  <span
                    aria-hidden={flipped}
                    className={`${styles.face} ${styles.front} flex flex-col rounded-[2rem] border border-line bg-card p-6 shadow-lift sm:p-8`}
                  >
                    <CardMeta card={card} moduleTitle={moduleTitle} state={state} />
                    <span className="my-auto block py-4 text-center font-display text-[1.6rem] font-semibold leading-tight text-ink sm:text-[2rem]">
                      <RichText text={card.front} links={false} />
                    </span>
                    <span className="block text-center text-xs font-medium text-muted">Tap or press Space to flip</span>
                  </span>
                  <span
                    aria-hidden={!flipped}
                    className={`${styles.face} ${styles.back} flex flex-col rounded-[2rem] border border-moss/25 bg-gradient-to-br from-moss-soft via-card to-card p-6 shadow-lift sm:p-8`}
                  >
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-moss">Answer</span>
                    <span className="mt-2 min-h-0 flex-1 overflow-y-auto">
                      <span className="block text-[16.5px] leading-[1.7] text-ink sm:text-[17.5px]">
                        <RichText text={card.back} links={false} />
                      </span>
                    </span>
                    <span className="mt-3 block truncate text-xs text-muted">{plainText(card.front)}</span>
                    <span className="sr-only">Activate to see the question again.</span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mx-auto flex w-full max-w-2xl items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous card"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-card text-ink-soft hover:text-ink"
            >
              <PrepIcon name="arrow-left" className="size-5" />
            </button>
            <button
              type="button"
              aria-pressed={state === "learning"}
              onClick={() => mark("learning")}
              className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-2 text-sm font-semibold transition-colors sm:px-3 ${
                state === "learning" ? "border-sun bg-sun-soft text-ink" : "border-line-strong bg-card text-ink-soft hover:text-ink"
              }`}
            >
              <PrepIcon name="leaf" className="hidden size-4 sm:block" />
              <span className="sm:hidden">Learning</span>
              <span className="hidden sm:inline">Still learning</span>
              <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] text-muted sm:inline">L</kbd>
            </button>
            <button
              type="button"
              aria-pressed={state === "known"}
              onClick={() => mark("known")}
              className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-2 text-sm font-semibold transition-colors sm:px-3 ${
                state === "known" ? "border-moss bg-moss text-paper" : "border-moss/40 bg-moss-soft text-moss hover:bg-moss hover:text-paper"
              }`}
            >
              <PrepIcon name="check" className="hidden size-4 sm:block" /> Know it
              <kbd className="hidden rounded border border-current/30 px-1 font-mono text-[10px] opacity-70 sm:inline">K</kbd>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next card"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-card text-ink-soft hover:text-ink"
            >
              <PrepIcon name="arrow-right" className="size-5" />
            </button>
          </div>
          <p className="hidden text-center text-xs text-muted sm:block">
            With the card focused: <kbd className="font-mono">Space</kbd> flip · <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> move · <kbd className="font-mono">K</kbd> know it ·{" "}
            <kbd className="font-mono">L</kbd> still learning
          </p>
          <p className="text-center text-xs text-muted sm:hidden">Swipe left or right to move between cards.</p>
        </>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border border-dashed border-line-strong px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-moss-soft text-moss">
            <PrepIcon name="sparkle" className="size-7" />
          </span>
          <p className="mt-4 font-display text-xl font-semibold">{filter === "learning" ? "Nothing marked “still learning”" : "Every card here is known"}</p>
          <p className="mt-1 text-sm text-ink-soft">Nice. Switch filters or shuffle the whole deck for a quick refresh.</p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setModuleId("");
              rebuild("all", "", seed);
            }}
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-moss px-5 text-sm font-medium text-paper hover:bg-moss-strong"
          >
            Show all cards
          </button>
        </div>
      )}

      {card?.moduleId && moduleTitle[card.moduleId] ? (
        <p className="text-center text-sm text-ink-soft">
          From{" "}
          <Link href={`/prep/${card.moduleId}`} className="font-medium text-moss underline decoration-moss/35 underline-offset-[3px] hover:decoration-moss">
            {moduleTitle[card.moduleId]}
          </Link>
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

function CardMeta({ card, moduleTitle, state }: { card: Flashcard; moduleTitle: Record<string, string>; state: FlashcardState | undefined }) {
  return (
    <span className="flex items-start justify-between gap-3">
      <span className="min-w-0 truncate text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
        {card.moduleId ? (moduleTitle[card.moduleId] ?? "Flashcard") : (card.tags[0] ?? "Flashcard")}
      </span>
      {state ? (
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            state === "known" ? "bg-moss-soft text-moss" : "bg-sun-soft text-bark"
          }`}
        >
          {state === "known" ? "Known" : "Learning"}
        </span>
      ) : null}
    </span>
  );
}
