// Resource card. Server-compatible; interactive buttons arrive through the `actions` slot.
import type { ReactNode } from "react";

import type { Resource } from "@/content/prep/types";
import { TRACK_LABELS } from "@/lib/prep/tracks";

import { PrepIcon } from "./icons";
import { RichText, safeHref } from "./rich-text";

const COST: Record<Resource["cost"], { label: string; cls: string }> = {
  free: { label: "Free", cls: "border-moss/30 bg-moss-soft text-moss" },
  freemium: { label: "Freemium", cls: "border-sky/50 bg-sky-soft text-ink" },
  paid: { label: "Paid", cls: "border-sun/50 bg-sun-soft text-ink" },
};

export const RESOURCE_TYPE_LABELS: Record<Resource["type"], string> = {
  course: "Course",
  lab: "Lab",
  book: "Book",
  video: "Video",
  cheatsheet: "Cheat sheet",
  cert: "Certification",
  community: "Community",
  ctf: "CTF",
  newsletter: "Newsletter",
  podcast: "Podcast",
  tool: "Tool",
  reference: "Reference",
  program: "Program",
  guide: "Guide",
};

export const chipClass = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap";

export function ResourceCard({
  resource: r,
  actions,
  badge,
  state,
  headingLevel = 3,
}: {
  resource: Resource;
  actions?: ReactNode;
  /** e.g. "Recommended now" */
  badge?: ReactNode;
  /** Visual state ("saved" | "done" | null) for the card frame. */
  state?: string | null;
  headingLevel?: 2 | 3 | 4;
}) {
  const href = safeHref(r.url);
  const cost = COST[r.cost];
  const H = `h${headingLevel}` as "h3";
  const tracks = r.tracks.filter((t) => t !== "ALL");

  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-3xl border bg-card p-4 shadow-soft transition-colors sm:p-5 ${
        state === "done" ? "border-moss/35" : state === "saved" ? "border-sun/50" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${chipClass} border-line bg-paper-2 text-ink-soft`}>{RESOURCE_TYPE_LABELS[r.type]}</span>
        <span className={`${chipClass} ${cost.cls}`}>{cost.label}</span>
        {badge}
        {state === "done" ? (
          <span className={`${chipClass} ml-auto border-moss/30 bg-moss-soft text-moss`}>
            <PrepIcon name="check" className="size-3" /> Done
          </span>
        ) : null}
      </div>

      <H className="mt-3 text-[17px] font-semibold leading-snug">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline decoration-moss/40 decoration-[1.5px] underline-offset-[3px] hover:text-moss hover:underline"
          >
            {r.title}
            <PrepIcon name="external" className="ml-1 inline size-3.5 -translate-y-px text-muted transition-colors group-hover:text-moss" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          r.title
        )}
      </H>

      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">
        <RichText text={r.why} />
      </p>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Time</dt>
          <PrepIcon name="clock" className="size-3.5 text-muted" />
          <dd>{r.time}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Difficulty</dt>
          <PrepIcon name="leaf" className="size-3.5 text-muted" />
          <dd className="capitalize">{r.difficulty}</dd>
        </div>
        {r.costNote ? (
          <div className="flex min-w-0 basis-full items-start gap-1.5">
            <dt className="sr-only">Cost details</dt>
            <span aria-hidden className="mt-px text-muted">$</span>
            <dd className="min-w-0">
              <RichText text={r.costNote} />
            </dd>
          </div>
        ) : null}
      </dl>

      {tracks.length > 0 || r.tags.length > 0 ? (
        <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-muted">
          {tracks.map((t) => (
            <span key={t} className="font-semibold text-moss">
              {TRACK_LABELS[t]}
            </span>
          ))}
          {r.tags.slice(0, 5).map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </p>
      ) : null}

      {r.note ? (
        <p className="mt-3 flex gap-1.5 rounded-xl bg-paper-2/70 px-3 py-2 text-[12.5px] leading-relaxed text-muted">
          <PrepIcon name="info" className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0">
            <RichText text={r.note} />
          </span>
        </p>
      ) : null}

      {actions ? <div className="mt-auto pt-4">{actions}</div> : null}
    </article>
  );
}

/** Save / Done toggles. Presentational: the caller owns state and persistence. */
export function ResourceToggles({
  state,
  pending = false,
  onChange,
  title,
}: {
  state: string | null;
  pending?: boolean;
  onChange: (next: "saved" | "done" | null) => void;
  title: string;
}) {
  const saved = state === "saved";
  const done = state === "done";
  const base =
    "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-[background-color,border-color,color,transform] active:scale-[0.97] sm:flex-none";
  return (
    <div className="flex gap-2" aria-busy={pending || undefined}>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `Unsave ${title}` : `Save ${title} for later`}
        onClick={() => onChange(saved ? null : "saved")}
        className={`${base} ${saved ? "border-sun/60 bg-sun-soft text-ink" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2 hover:text-ink"}`}
      >
        <PrepIcon name={saved ? "bookmark-filled" : "bookmark"} className={`size-4 ${saved ? "text-sun" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        aria-pressed={done}
        aria-label={done ? `Mark ${title} as not done` : `Mark ${title} as done`}
        onClick={() => onChange(done ? null : "done")}
        className={`${base} ${done ? "border-moss bg-moss text-paper" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2 hover:text-ink"}`}
      >
        <PrepIcon name="check" className="size-4" />
        {done ? "Done" : "Mark done"}
      </button>
    </div>
  );
}

/** Placeholder with the same footprint while progress streams in. */
export function ResourceTogglesSkeleton() {
  return (
    <div aria-hidden className="flex gap-2">
      <span className="h-11 flex-1 animate-pulse rounded-full bg-paper-2 sm:w-24 sm:flex-none" />
      <span className="h-11 flex-1 animate-pulse rounded-full bg-paper-2 sm:w-28 sm:flex-none" />
    </div>
  );
}
