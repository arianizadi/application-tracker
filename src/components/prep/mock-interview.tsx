"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SpeechBubble } from "@/components/mascots";
import type { PracticeQuestion } from "@/content/prep/types";
import { useAutosave } from "@/hooks/use-autosave";
import { isDoneState, type ProgressMap } from "@/lib/prep/progress";
import { seededShuffle } from "@/lib/prep/random";

import { pad2 } from "./bits";
import { PrepIcon } from "./icons";
import { RichText } from "./rich-text";
import { useLocalProgress } from "./use-local-progress";

export type MockQuestion = Pick<PracticeQuestion, "id" | "question" | "answer" | "checking" | "difficulty"> & { moduleId: string };
export type MockModule = { id: string; number: number; title: string };

type Rating = "nailed" | "partly" | "review";

type Session = {
  phase: "idle" | "running" | "summary";
  order: string[];
  index: number;
  revealed: boolean;
  ratings: Record<string, Rating>;
  timer: boolean;
  seed: number;
  startedAt: number;
  endedAt: number;
};

const IDLE: Session = { phase: "idle", order: [], index: 0, revealed: false, ratings: {}, timer: true, seed: 0, startedAt: 0, endedAt: 0 };
const COUNTS = [5, 8, 12] as const;
const THINK_SECONDS = 120;

const RATINGS: { key: Rating; label: string; hint: string; cls: string }[] = [
  { key: "review", label: "Review again", hint: "Missed key parts", cls: "border-sun/60 bg-sun-soft text-ink hover:border-sun" },
  { key: "partly", label: "Partly", hint: "Right idea, rough edges", cls: "border-sky/60 bg-sky-soft text-ink hover:border-sky" },
  { key: "nailed", label: "Nailed it", hint: "Interview-ready", cls: "border-moss bg-moss text-paper hover:bg-moss-strong" },
];

export function MockInterview({
  questions,
  modules,
  initial,
  preselect,
}: {
  questions: MockQuestion[];
  modules: MockModule[];
  initial: ProgressMap;
  preselect: string[];
}) {
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const moduleById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);
  const progress = useLocalProgress("question", initial);
  const { value: saved, setValue: setSession, restored, reset } = useAutosave<Session>("prep:mock", IDLE, 250);

  // Ignore stale ids from older content.
  const session: Session = useMemo(() => {
    const order = saved.order.filter((id) => byId.has(id));
    if (saved.phase !== "idle" && order.length === 0) return IDLE;
    return { ...saved, order, index: Math.min(saved.index, Math.max(0, order.length - 1)) };
  }, [saved, byId]);

  const [picked, setPicked] = useState<string[]>(() => preselect.filter((id) => moduleById.has(id)));
  const [count, setCount] = useState<number>(preselect.length === 1 ? 8 : 5);
  const [timer, setTimer] = useState(true);
  const [startedHere, setStartedHere] = useState(false);

  function start(fromIds?: string[]) {
    const pool = fromIds
      ? questions.filter((q) => fromIds.includes(q.id))
      : questions.filter((q) => picked.length === 0 || picked.includes(q.moduleId));
    // Client-only randomness; the seed is stored so a resumed session keeps its order.
    const seed = Math.floor(Math.random() * 2 ** 31) + 1;
    const rank = (q: MockQuestion) => {
      const s = progress.states[q.id];
      return !s || s === "review" ? 0 : s === "practiced" ? 1 : 2;
    };
    const order = seededShuffle(pool, seed)
      .map((q, i) => ({ q, i }))
      .sort((a, b) => rank(a.q) - rank(b.q) || a.i - b.i)
      .slice(0, fromIds ? fromIds.length : count)
      .map((x) => x.q.id);
    setStartedHere(true);
    setSession({ ...IDLE, phase: "running", order, timer, seed, startedAt: Date.now() });
    window.scrollTo({ top: 0 });
  }

  function rate(rating: Rating) {
    const q = byId.get(session.order[session.index] ?? "");
    if (!q) return;
    const current = progress.states[q.id];
    if (rating === "nailed") void progress.set(q.id, "mastered");
    else if (rating === "partly") void progress.set(q.id, "practiced");
    // "Review again" flags it without taking away earlier practice (and its XP).
    else if (!isDoneState("question", current)) void progress.set(q.id, "review");

    const last = session.index >= session.order.length - 1;
    setSession((s) => ({
      ...s,
      ratings: { ...s.ratings, [q.id]: rating },
      index: last ? s.index : s.index + 1,
      revealed: false,
      phase: last ? "summary" : "running",
      endedAt: last ? Date.now() : s.endedAt,
    }));
  }

  function skip() {
    const last = session.index >= session.order.length - 1;
    setSession((s) => ({ ...s, index: last ? s.index : s.index + 1, revealed: false, phase: last ? "summary" : "running", endedAt: last ? Date.now() : s.endedAt }));
  }

  if (session.phase === "running") {
    const q = byId.get(session.order[session.index] ?? "");
    if (!q) return null;
    const mod = moduleById.get(q.moduleId);
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {restored && !startedHere && session.index > 0 ? (
          <p className="flex items-center gap-2 rounded-2xl border border-sky/50 bg-sky-soft px-4 py-2.5 text-sm text-ink">
            <PrepIcon name="undo" className="size-4 shrink-0" /> Picked up where you left off.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium tabular">
            Question {session.index + 1} <span className="text-muted">of {session.order.length}</span>
          </p>
          <button
            type="button"
            onClick={() => setSession((s) => ({ ...s, phase: "summary", endedAt: Date.now() }))}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
          >
            <PrepIcon name="flag" className="size-4" /> End session
          </button>
        </div>
        <ol aria-hidden className="flex gap-1.5">
          {session.order.map((id, i) => {
            const r = session.ratings[id];
            return (
              <li
                key={id}
                className={`h-1.5 flex-1 rounded-full ${
                  r === "nailed" ? "bg-moss" : r === "partly" ? "bg-sky" : r === "review" ? "bg-sun" : i === session.index ? "bg-ink/40" : "bg-paper-2"
                }`}
              />
            );
          })}
        </ol>

        <article className="rounded-[2rem] border border-line bg-card p-5 shadow-lift sm:p-8" aria-labelledby="mock-q">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {mod ? (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Module {pad2(mod.number)} · {mod.title}
              </p>
            ) : (
              <span />
            )}
            {session.timer ? <ThinkTimer key={q.id + session.index} /> : null}
          </div>
          <h2 id="mock-q" className="mt-4 text-[1.6rem] font-semibold leading-tight sm:text-[2rem]">
            <RichText text={q.question} links={false} />
          </h2>
          {!session.revealed ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setSession((s) => ({ ...s, revealed: true }))}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper shadow-soft hover:opacity-90"
              >
                <PrepIcon name="eye" className="size-4" /> Reveal model answer
              </button>
              <button type="button" onClick={skip} className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
                Skip for now
              </button>
            </div>
          ) : (
            <div className="mt-6 animate-fade space-y-4">
              <div className="rounded-2xl border border-moss/20 bg-moss-soft/50 px-4 py-4 sm:px-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-moss">Model answer</p>
                <p className="text-[16px] leading-[1.75] text-ink">
                  <RichText text={q.answer} />
                </p>
              </div>
              <div className="flex gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-3">
                <PrepIcon name="eye" className="mt-0.5 size-4 shrink-0 text-berry" />
                <p className="text-[14.5px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-berry">What they&apos;re checking: </span>
                  <RichText text={q.checking} />
                </p>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">How did your answer compare?</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {RATINGS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => rate(r.key)}
                      className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition-[background-color,border-color,transform] active:scale-[0.97] ${r.cls}`}
                    >
                      <span className="text-[15px] font-semibold">{r.label}</span>
                      <span className="text-xs opacity-80">{r.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </article>
        <p className="text-center text-xs text-muted">Your session saves on this device, so closing the tab won&apos;t lose your place.</p>
      </div>
    );
  }

  if (session.phase === "summary") {
    return (
      <Summary
        session={session}
        byId={byId}
        moduleById={moduleById}
        onAgain={() => reset()}
        onRetry={(ids) => start(ids)}
      />
    );
  }

  /* ── Setup ─────────────────────────────────────────────────────────────── */
  const pool = questions.filter((q) => picked.length === 0 || picked.includes(q.moduleId));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="flex flex-col gap-6 rounded-[2rem] border border-line bg-card p-5 shadow-soft sm:p-7">
        <fieldset>
          <legend className="text-lg font-semibold">What should we practice?</legend>
          <p className="mt-1 text-sm text-muted">Pick modules, or leave it mixed for a bit of everything.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={picked.length === 0}
              onClick={() => setPicked([])}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                picked.length === 0 ? "border-moss bg-moss text-paper" : "border-line-strong bg-card text-ink-soft hover:text-ink"
              }`}
            >
              <PrepIcon name="shuffle" className="size-4" /> Mixed
            </button>
            {modules.map((m) => {
              const on = picked.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(m.id)}
                  className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border px-3.5 text-left text-sm transition-colors ${
                    on ? "border-moss bg-moss-soft text-ink" : "border-line-strong bg-card text-ink-soft hover:text-ink"
                  }`}
                >
                  <span className={`font-display text-xs font-semibold tabular ${on ? "text-moss" : "text-muted"}`}>{pad2(m.number)}</span>
                  <span className="min-w-0 truncate">{m.title}</span>
                  {on ? <PrepIcon name="check" className="size-4 shrink-0 text-moss" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">How many questions?</legend>
            <div className="inline-flex rounded-full border border-line bg-paper-2/70 p-1">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={count === n}
                  onClick={() => setCount(n)}
                  className={`inline-flex min-h-11 min-w-14 items-center justify-center rounded-full px-4 text-sm font-medium tabular ${count === n ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            role="switch"
            aria-checked={timer}
            onClick={() => setTimer((t) => !t)}
            className="inline-flex min-h-11 items-center gap-3 self-start rounded-full border border-line-strong bg-card px-4 text-sm font-medium text-ink-soft hover:text-ink sm:self-auto"
          >
            <span aria-hidden className={`relative h-5 w-9 rounded-full transition-colors ${timer ? "bg-moss" : "bg-line-strong"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-card shadow-soft transition-[left] ${timer ? "left-[18px]" : "left-0.5"}`} />
            </span>
            2-minute timer
          </button>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {pool.length === 0 ? "No questions in that selection." : `${Math.min(count, pool.length)} questions from a pool of ${pool.length}. Unpracticed ones come first.`}
          </p>
          <button
            type="button"
            disabled={pool.length === 0}
            onClick={() => start()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-moss px-6 text-base font-medium text-paper shadow-soft hover:bg-moss-strong disabled:opacity-50"
          >
            <PrepIcon name="play" className="size-4" /> Start mock interview
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-[2rem] border border-line bg-paper-2/50 p-5">
        <SpeechBubble mascot="pip" mood="happy" size="sm" layout="row" line="Answer out loud, like I'm the interviewer. Pausing to think is allowed. I checked." />
        <ul className="space-y-2.5 text-[14px] leading-snug text-ink-soft">
          {[
            "Say your answer before you reveal anything. Typing doesn't count.",
            "Structure beats volume: definition, example, why it matters.",
            "“I'm not sure, but here's how I'd find out” is a strong answer.",
            "Rate yourself honestly. “Review again” just means it comes back sooner.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <PrepIcon name="leaf" className="mt-0.5 size-4 shrink-0 text-leaf" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ThinkTimer() {
  const [left, setLeft] = useState(THINK_SECONDS);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const done = left === 0;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const frac = left / THINK_SECONDS;
  return (
    <div className="flex items-center gap-2">
      <span
        role="timer"
        aria-label={done ? "Time is up" : `${mm} minutes ${ss} seconds left`}
        className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 font-mono text-sm font-semibold tabular ${
          done ? "border-coral/40 bg-coral-soft text-coral" : left <= 20 ? "border-sun/60 bg-sun-soft text-ink" : "border-line bg-paper text-ink"
        }`}
      >
        <svg viewBox="0 0 20 20" className="size-4 -rotate-90" aria-hidden>
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--line)" strokeWidth="3" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(50.27 * frac).toFixed(2)} 50.27`} />
        </svg>
        {done ? "Time — wrap it up" : `${mm}:${ss}`}
      </span>
      {!done ? (
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause timer" : "Resume timer"}
          className="inline-flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper-2 hover:text-ink"
        >
          <PrepIcon name={running ? "pause" : "play"} className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function Summary({
  session,
  byId,
  moduleById,
  onAgain,
  onRetry,
}: {
  session: Session;
  byId: Map<string, MockQuestion>;
  moduleById: Map<string, MockModule>;
  onAgain: () => void;
  onRetry: (ids: string[]) => void;
}) {
  const rated = session.order.filter((id) => session.ratings[id]);
  const tally = { nailed: 0, partly: 0, review: 0 };
  for (const id of rated) tally[session.ratings[id]]++;
  const weakIds = session.order.filter((id) => session.ratings[id] === "partly" || session.ratings[id] === "review");

  const weakModules = new Map<string, MockQuestion[]>();
  for (const id of weakIds) {
    const q = byId.get(id);
    if (!q) continue;
    weakModules.set(q.moduleId, [...(weakModules.get(q.moduleId) ?? []), q]);
  }
  const weak = [...weakModules.entries()].sort((a, b) => b[1].length - a[1].length);
  const minutes = session.endedAt && session.startedAt ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000)) : null;

  const line =
    rated.length === 0
      ? "No ratings this time, and that's fine. Even reading the questions out loud is practice."
      : tally.nailed === rated.length
        ? "Every single one. I'd hire you, and I'm a fox."
        : tally.nailed >= rated.length / 2
          ? "Strong session. The tricky ones are listed below so you know exactly what to polish."
          : "This is what practice is for. You found the gaps here instead of in the interview.";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section className="rounded-[2rem] border border-line bg-card p-5 shadow-soft sm:p-8" aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-[1.8rem] font-semibold leading-tight sm:text-4xl">
          Session complete
        </h2>
        <p className="mt-1 text-sm text-muted">
          {rated.length} of {session.order.length} questions rated{minutes ? ` · about ${minutes} min` : ""}
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              ["Nailed it", tally.nailed, "bg-moss-soft text-moss"],
              ["Partly", tally.partly, "bg-sky-soft text-ink"],
              ["Review again", tally.review, "bg-sun-soft text-bark"],
            ] as const
          ).map(([label, n, cls]) => (
            <div key={label} className={`flex flex-col-reverse rounded-2xl px-3 py-4 text-center ${cls}`}>
              <dt className="mt-1.5 text-xs font-medium sm:text-sm">{label}</dt>
              <dd className="font-display text-3xl font-semibold leading-none tabular sm:text-4xl">{n}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <SpeechBubble mascot="pip" mood={tally.nailed >= rated.length / 2 && rated.length > 0 ? "cheer" : "comfort"} size="sm" layout="row" line={line} />
        </div>
      </section>

      {weak.length > 0 ? (
        <section aria-labelledby="weak-title" className="rounded-[2rem] border border-line bg-card p-5 shadow-soft sm:p-8">
          <h2 id="weak-title" className="text-2xl font-semibold">
            Worth another look
          </h2>
          <p className="mt-1 text-sm text-muted">Grouped by module. Each link jumps to the question in the lesson.</p>
          <ul className="mt-5 flex flex-col gap-4">
            {weak.map(([moduleId, qs]) => {
              const m = moduleById.get(moduleId);
              return (
                <li key={moduleId} className="rounded-2xl border border-line bg-paper/60 p-4">
                  <Link href={`/prep/${moduleId}#practice`} className="group flex min-h-11 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-moss-soft font-display text-sm font-semibold text-moss">{m ? pad2(m.number) : "?"}</span>
                    <span className="min-w-0 flex-1 font-semibold leading-snug group-hover:text-moss">{m?.title ?? moduleId}</span>
                    <PrepIcon name="arrow-right" className="size-4 shrink-0 text-moss transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <ul className="mt-2 flex flex-col gap-1 pl-12">
                    {qs.map((q) => (
                      <li key={q.id}>
                        <Link href={`/prep/${moduleId}#q-${q.id}`} className="flex min-h-11 items-center gap-2 text-[14px] leading-snug text-ink-soft hover:text-ink">
                          <span aria-hidden className={`size-2 shrink-0 rounded-full ${session.ratings[q.id] === "review" ? "bg-sun" : "bg-sky"}`} />
                          <span className="min-w-0">
                            <RichText text={q.question} links={false} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {weakIds.length > 0 ? (
          <button
            type="button"
            onClick={() => onRetry(weakIds)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-moss px-6 text-sm font-medium text-paper shadow-soft hover:bg-moss-strong"
          >
            <PrepIcon name="undo" className="size-4" /> Retry the {weakIds.length} tricky {weakIds.length === 1 ? "one" : "ones"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-card px-6 text-sm font-medium hover:bg-paper-2"
        >
          <PrepIcon name="play" className="size-4" /> New session
        </button>
        <Link href="/prep" className="inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
          Back to the trail
        </Link>
      </div>
    </div>
  );
}
