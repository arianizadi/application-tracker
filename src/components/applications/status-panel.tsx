"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useOptimistic, useState, useTransition } from "react";

import { useCelebrate } from "@/components/fx";
import { Mascot, type MascotName } from "@/components/mascots";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { updateStatus } from "@/lib/applications/actions";
import { STATUS_TOAST } from "@/lib/applications/copy";
import { daysBetween, daysBetweenKeys, formatDateKey, formatInstant, longDuration, noonInZone, relativeDays } from "@/lib/applications/dates";
import { ACTIVE_STATUSES, CLOSED_STATUSES, STATUS_META } from "@/lib/status";

import { AppIcon } from "./icons";
import { StatusSheet } from "./sheet";
import { LeafBurst } from "./sprout";
import { celebrateStatus } from "./status-celebration";

type Event = { status: ApplicationStatus; at: Date };

/** The most likely next moves for each stage; everything else is under "Other…". */
const NEXT: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["ASSESSMENT", "INTERVIEW", "REJECTED", "GHOSTED"],
  ASSESSMENT: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  OFFER: ["ACCEPTED", "WITHDRAWN"],
  ACCEPTED: ["WITHDRAWN"],
  REJECTED: ["INTERVIEW", "APPLIED"],
  GHOSTED: ["ASSESSMENT", "INTERVIEW", "REJECTED"],
  WITHDRAWN: ["APPLIED"],
};

const COMPANION: Partial<Record<ApplicationStatus, { name: MascotName; line: string }>> = {
  WISHLIST: { name: "acorn", line: "Filed for later. No pressure." },
  APPLIED: { name: "tuck", line: "Slow replies are still replies." },
  ASSESSMENT: { name: "fern", line: "One problem at a time. You're allowed to think." },
  INTERVIEW: { name: "pip", line: "Interviews are just conversations with snacks missing." },
  OFFER: { name: "miso", line: "WE LOVE AN OFFER! Take your time deciding." },
  ACCEPTED: { name: "miso", line: "You did it. Every application before this one counted." },
  REJECTED: { name: "prickle", line: "That one stung. The tree stays." },
  GHOSTED: { name: "tuck", line: "Silence gives us limited information. The effort remains." },
  WITHDRAWN: { name: "moss", line: "Your priorities get a vote." },
};

export function StatusPanel({
  id,
  company,
  status,
  history,
  timeZone,
  nowMs,
  todayKey,
  minDateKey,
}: {
  id: string;
  company: string;
  status: ApplicationStatus;
  history: Event[];
  timeZone: string;
  nowMs: number;
  /** Today in the user's zone; status changes can't be dated later. */
  todayKey: string;
  /** Earliest day a change can be dated (the applied day, or when it was saved). */
  minDateKey: string;
}) {
  const toast = useToast();
  const { celebrate } = useCelebrate();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  // Replies often get logged days later; this dates the next change.
  const [whenKey, setWhenKey] = useState(todayKey);
  const [optimistic, setOptimistic] = useOptimistic({ status, history }, (state, next: Event) => {
    const events = [...state.history, next].sort((a, b) => +new Date(a.at) - +new Date(b.at));
    // The newest event decides the current status (backfilled steps only join the timeline).
    return { status: events[events.length - 1] === next ? next.status : state.status, history: events };
  });

  function move(next: ApplicationStatus) {
    if (next === optimistic.status) return;
    const dateKey = whenKey < minDateKey ? minDateKey : whenKey > todayKey ? todayKey : whenKey;
    startTransition(async () => {
      setOptimistic({ status: next, at: dateKey === todayKey ? new Date() : noonInZone(dateKey, timeZone) });
      const res = await updateStatus(id, next, dateKey === todayKey ? null : dateKey);
      if (!res.ok) {
        toast({ title: "That didn't stick", body: res.error, tone: "warning" });
        return;
      }
      setWhenKey(todayKey);
      if (res.data.status !== next) {
        toast({ title: "Added to the timeline", body: `${STATUS_META[next].label} on ${formatDateKey(dateKey, todayKey)}. The newer step stays current.`, tone: "info" });
        return;
      }
      const copy = STATUS_TOAST[next];
      // The panel already plays its own LeafBurst for good news; only rejections need the overlay.
      const replaced = next === "REJECTED" ? celebrateStatus(celebrate, next, { company }) : false;
      if (!replaced) toast({ title: copy.title, body: copy.body, tone: copy.tone });
      if (next === "OFFER" || next === "ACCEPTED" || next === "INTERVIEW") setBurst((b) => b + 1);
    });
  }

  const current = optimistic.status;
  const events = optimistic.history.length ? optimistic.history : [{ status: current, at: new Date(nowMs) }];
  const reached = new Set(events.map((e) => e.status));
  reached.add(current);
  const furthest = Math.max(...ACTIVE_STATUSES.map((s, i) => (reached.has(s) ? i : -1)));
  const closed = CLOSED_STATUSES.includes(current);
  const firstAt = (s: ApplicationStatus) => events.find((e) => e.status === s)?.at;
  const last = events[events.length - 1];
  const waiting = daysBetween(new Date(last.at), nowMs);
  const companion = COMPANION[current];

  return (
    <div className="relative">
      {burst ? <LeafBurst key={burst} className="absolute left-1/2 top-0 size-40 -translate-x-1/2 -translate-y-1/4" /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Progress</h2>
        <StatusPill status={current} />
      </div>

      {/* Stepper */}
      <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Pipeline">
        {ACTIVE_STATUSES.map((s, i) => {
          const done = i <= furthest;
          const isCurrent = s === current;
          const at = firstAt(s);
          return (
            <li key={s} aria-current={isCurrent ? "step" : undefined} className="flex min-w-0 flex-col items-center text-center">
              <div className="relative flex w-full items-center justify-center">
                {i > 0 ? <span aria-hidden className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${i <= furthest ? "bg-moss" : "bg-line"}`} /> : null}
                <span
                  className={`relative z-10 flex size-7 items-center justify-center rounded-full border-2 transition-colors ${
                    isCurrent ? "border-moss bg-moss text-paper" : done ? "border-moss bg-moss-soft text-moss" : "border-line-strong bg-card text-muted"
                  }`}
                >
                  {done && !isCurrent ? <AppIcon name="check" className="size-3.5" /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
                </span>
              </div>
              <span className={`mt-1.5 w-full truncate text-[11px] font-medium sm:text-xs ${done ? "text-ink" : "text-muted"}`}>{STATUS_META[s].short}</span>
              <span className="tabular w-full truncate text-[10px] text-muted sm:text-[11px]">{at ? formatInstant(new Date(at), timeZone).replace(/, \d{4}$/, "") : " "}</span>
            </li>
          );
        })}
      </ol>
      {closed ? (
        <p className="mt-3 rounded-xl bg-paper-2 px-3 py-2 text-center text-xs text-ink-soft">
          Closed as <span className="font-semibold text-ink">{STATUS_META[current].label}</span>. {STATUS_META[current].hint}.
        </p>
      ) : null}

      {/* Quick moves */}
      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-ink-soft">Update status</p>
          <WhenInput value={whenKey} onChange={setWhenKey} min={minDateKey} max={todayKey} id="status-when" />
        </div>
        <div className="flex flex-wrap gap-2">
          {NEXT[current].map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => move(s)}
              className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-4 text-sm font-medium transition-[background-color,transform] hover:bg-paper-2 active:scale-[0.97] disabled:opacity-60"
            >
              <span aria-hidden className={`size-2 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-muted hover:bg-paper-2 hover:text-ink"
          >
            Other…
          </button>
        </div>
      </div>

      {companion ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-paper-2/70 p-3">
          <Mascot name={companion.name} mood={current === "REJECTED" ? "comfort" : current === "OFFER" || current === "ACCEPTED" ? "cheer" : "idle"} className="size-11 shrink-0" />
          <p className="text-sm text-ink-soft">{companion.line}</p>
        </div>
      ) : null}

      {/* Timeline */}
      <div className="mt-6">
        <h3 className="mb-3 font-sans text-sm font-semibold tracking-normal text-ink-soft">Timeline</h3>
        <ol className="relative flex flex-col">
          {events.map((e, i) => {
            const prev = events[i - 1];
            const gap = prev ? daysBetween(new Date(prev.at), new Date(e.at)) : null;
            return (
              <li key={`${e.status}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                {i < events.length - 1 ? <span aria-hidden className="absolute left-[5px] top-4 h-full w-0.5 bg-line" /> : null}
                <span aria-hidden className={`relative mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-card ${STATUS_META[e.status].dot}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{STATUS_META[e.status].label}</p>
                  <p className="tabular text-xs text-muted">
                    {formatInstant(new Date(e.at), timeZone)}
                    {gap !== null && gap > 0 ? ` · waited ${longDuration(gap)}` : gap === 0 && i > 0 ? " · same day" : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        {!closed && current !== "WISHLIST" && waiting > 0 ? (
          <p className="mt-3 text-xs text-muted">
            {waiting} {waiting === 1 ? "day" : "days"} since the last update.{" "}
            {waiting >= 14 ? "A friendly follow-up is totally normal." : "Still waiting is a status, not a review."}
          </p>
        ) : null}
      </div>

      <StatusSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`Move ${company} to…`}
        current={current}
        onPick={move}
      >
        <WhenInput value={whenKey} onChange={setWhenKey} min={minDateKey} max={todayKey} id="status-when-sheet" />
      </StatusSheet>
    </div>
  );
}

/** "Happened today" by default; pick an earlier day for changes logged late. */
function WhenInput({ id, value, onChange, min, max }: { id: string; value: string; onChange: (key: string) => void; min: string; max: string }) {
  const days = daysBetweenKeys(max, value);
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs text-muted">
      <span>When did it happen?</span>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        required
        onChange={(e) => onChange(e.target.value || max)}
        aria-describedby={`${id}-hint`}
        className="h-11 rounded-full border border-line-strong bg-card px-3 text-xs font-medium text-ink focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/25 sm:h-9"
      />
      <span id={`${id}-hint`} className="sr-only">
        {days === 0 ? "Today" : relativeDays(days)}
      </span>
    </label>
  );
}
