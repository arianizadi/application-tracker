"use client";

import Link from "next/link";
import { useState } from "react";

import type { TrackCode } from "@/content/prep/types";
import { matchesTrack, TRACK_FILTER_ORDER, TRACK_LABELS, TRACK_NAMES } from "@/lib/prep/tracks";

import { pad2 } from "./bits";
import { PrepIcon } from "./icons";
import { plainText } from "./rich-text";

export type TrailModule = {
  id: string;
  number: number;
  title: string;
  hook: string;
  hours: number;
  tracks: TrackCode[];
  questionsTotal: number;
  practiced: number;
  done: boolean;
  started: boolean;
};

/** The course as a forest trail of stepping stones, with track filter chips. */
export function ModuleTrail({ modules, upNextId }: { modules: TrailModule[]; upNextId: string | null }) {
  const [track, setTrack] = useState<TrackCode | null>(null);
  const shown = modules.filter((m) => matchesTrack(m.tracks, track));
  const available = TRACK_FILTER_ORDER.filter((t) => modules.some((m) => m.tracks.includes(t)));

  return (
    <div>
      <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0">
        <div role="group" aria-label="Filter modules by track" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <FilterChip active={track === null} onClick={() => setTrack(null)} label="All tracks" />
          {available.map((t) => (
            <FilterChip key={t} active={track === t} onClick={() => setTrack(track === t ? null : t)} label={TRACK_LABELS[t]} title={TRACK_NAMES[t]} />
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {track ? `Showing ${shown.length} of ${modules.length} modules for ${TRACK_NAMES[track]}.` : `Showing all ${modules.length} modules.`}
      </p>
      {track ? (
        <p className="mb-4 text-sm text-muted">
          {shown.length} of {modules.length} modules for {TRACK_NAMES[track]}. Modules for everyone stay on the path.
        </p>
      ) : null}

      <ol className="relative">
        {shown.map((m, i) => (
          <TrailStep key={m.id} m={m} first={i === 0} last={i === shown.length - 1} upNext={m.id === upNextId} index={i} />
        ))}
      </ol>
    </div>
  );
}

function FilterChip({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
        active ? "border-moss bg-moss text-paper shadow-soft" : "border-line-strong bg-card text-ink-soft hover:border-moss/40 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

// Organic pebble outlines so the stones don't look like UI dots.
const PEBBLES = [
  "48% 52% 46% 54% / 55% 47% 53% 45%",
  "55% 45% 52% 48% / 46% 56% 44% 54%",
  "44% 56% 58% 42% / 52% 44% 56% 48%",
];

function TrailStep({ m, first, last, upNext, index }: { m: TrailModule; first: boolean; last: boolean; upNext: boolean; index: number }) {
  const pct = m.questionsTotal ? Math.round((m.practiced / m.questionsTotal) * 100) : 0;
  const status = m.done ? "Completed" : m.started ? "In progress" : "Not started";
  const tracks = m.tracks.filter((t) => t !== "ALL");

  return (
    <li className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-5">
      <div aria-hidden className="relative flex justify-center">
        {/* The path: dotted soil between stones. */}
        {first && last ? null : (
          <span
            className={`absolute left-1/2 -ml-[2px] w-0 border-l-[4px] border-dotted ${m.done ? "border-moss/45" : "border-line-strong"} ${
              first ? "top-7 bottom-0" : last ? "top-0 h-8" : "inset-y-0"
            }`}
          />
        )}
        {index % 4 === 1 && !last ? (
          <svg viewBox="0 0 20 20" className="absolute -right-0.5 top-[4.25rem] size-4 text-leaf/70 sm:right-1">
            <path d="M3 17C3 9 8 4 17 3c-1 9-6 14-14 14Z" fill="currentColor" />
          </svg>
        ) : null}
        <span
          className={`relative mt-1 grid size-12 place-items-center shadow-soft transition-transform sm:size-14 ${
            m.done
              ? "bg-moss text-paper"
              : upNext
                ? "border-2 border-sun bg-sun-soft text-ink"
                : m.started
                  ? "border-2 border-leaf bg-card text-ink"
                  : "border border-line-strong bg-paper-2 text-ink-soft"
          }`}
          style={{ borderRadius: PEBBLES[m.number % PEBBLES.length] }}
        >
          {m.done ? (
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <span className="font-display text-lg font-semibold tabular">{pad2(m.number)}</span>
          )}
        </span>
      </div>

      <Link
        href={`/prep/${m.id}`}
        className={`group block min-w-0 rounded-3xl border bg-card p-4 shadow-soft transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift sm:p-5 ${
          upNext ? "border-sun/60 ring-4 ring-sun-soft" : m.done ? "border-moss/25" : "border-line hover:border-moss/40"
        }`}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted">
          <span className="font-semibold uppercase tracking-[0.12em] text-moss">Module {pad2(m.number)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <PrepIcon name="clock" className="size-3.5" /> {m.hours}h
          </span>
          {upNext ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-sun px-2 py-0.5 text-[11px] font-semibold text-night">Up next</span>
          ) : m.done ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-moss-soft px-2 py-0.5 text-[11px] font-semibold text-moss">Done</span>
          ) : null}
        </span>
        <span className="mt-1.5 block font-display text-[19px] font-semibold leading-snug text-ink group-hover:text-moss sm:text-[21px]">
          {m.title}
        </span>
        <span className="mt-1 block text-[14.5px] leading-relaxed text-ink-soft">{plainText(m.hook)}</span>
        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {tracks.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {tracks.map((t) => (
                <span key={t} className="rounded-full border border-moss/25 bg-moss-soft px-2 py-0.5 text-[11px] font-semibold leading-5 text-moss">
                  {TRACK_LABELS[t]}
                </span>
              ))}
            </span>
          ) : (
            <span className="rounded-full border border-line bg-paper-2 px-2 py-0.5 text-[11px] font-semibold leading-5 text-ink-soft">Everyone</span>
          )}
          <span className="ml-auto flex min-w-[9rem] flex-1 items-center gap-2 sm:max-w-[13rem]">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-2">
              <span className="block h-full rounded-full bg-gradient-to-r from-leaf to-moss" style={{ width: `${pct}%` }} />
            </span>
            <span className="shrink-0 text-xs text-muted tabular">
              {m.practiced}/{m.questionsTotal}
            </span>
          </span>
        </span>
        <span className="sr-only">
          {status}. {m.practiced} of {m.questionsTotal} practice questions practiced.
        </span>
      </Link>
    </li>
  );
}
