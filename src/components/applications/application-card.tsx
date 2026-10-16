"use client";

import Link from "next/link";
import type { DragEvent } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import { dateKeyInZone, dateToKey, daysBetween, daysBetweenKeys, shortDuration } from "@/lib/applications/dates";
import { isQuiet, lastActivityAt } from "@/lib/applications/filter";
import { WORK_MODE_LABEL } from "@/lib/applications/schema";
import type { ApplicationListItem } from "@/lib/applications/types";
import { STATUS_META } from "@/lib/status";

import { DeadlineChip, FollowUpChip, WaitingChip } from "./chips";
import { Hearts } from "./hearts";
import { AppIcon } from "./icons";

export const DRAG_TYPE = "application/x-canopy-id";

export function isTemp(id: string) {
  return id.startsWith("temp:");
}

export type CardProps = {
  item: ApplicationListItem;
  todayKey: string;
  /** The user's zone, for real instants like createdAt. */
  timeZone: string;
  nowMs: number;
  /** Board cards hide the status pill (the column says it); list cards show it. */
  variant?: "board" | "list";
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onMove?: (item: ApplicationListItem) => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  highlight?: boolean;
};

function appliedLabel(item: ApplicationListItem, todayKey: string, timeZone: string): string | null {
  // Wishlist items, and ones withdrawn before they were ever sent, only have a save date.
  if (item.status === "WISHLIST" || !item.appliedAt) {
    // createdAt is a real instant (its day depends on the zone); appliedAt is a stored calendar day.
    const days = daysBetweenKeys(dateKeyInZone(new Date(item.createdAt), timeZone), todayKey);
    return days <= 0 ? "Saved today" : `Saved ${shortDuration(days)} ago`;
  }
  const days = daysBetweenKeys(dateToKey(item.appliedAt), todayKey);
  return days <= 0 ? "Applied today" : `Applied ${shortDuration(days)} ago`;
}

export function ApplicationCard({
  item,
  todayKey,
  timeZone,
  nowMs,
  variant = "board",
  selectMode = false,
  selected = false,
  onToggleSelect,
  onMove,
  draggable = false,
  dragging = false,
  onDragStart,
  onDragEnd,
  highlight = false,
}: CardProps) {
  const temp = isTemp(item.id);
  const quiet = isQuiet(item, nowMs);
  const applied = appliedLabel(item, todayKey, timeZone);
  const meta = [applied, item.workMode ? WORK_MODE_LABEL[item.workMode] : null, item.source].filter(Boolean).join(" · ");
  const name = `${item.company} — ${item.role}`;

  function handleDragStart(e: DragEvent<HTMLElement>) {
    e.dataTransfer.setData(DRAG_TYPE, item.id);
    e.dataTransfer.setData("text/plain", name);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(item.id);
  }

  return (
    <article
      draggable={draggable && !temp && !selectMode}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      aria-busy={temp || undefined}
      className={`group relative rounded-2xl border bg-card p-3.5 shadow-soft transition-[box-shadow,transform,opacity,border-color] duration-150 ${
        selected ? "border-moss ring-2 ring-moss/30" : "border-line hover:border-line-strong hover:shadow-lift"
      } ${dragging ? "rotate-1 opacity-50" : ""} ${temp ? "opacity-70" : ""} ${highlight ? "animate-pop ring-2 ring-leaf/60" : ""} ${
        draggable && !temp && !selectMode ? "md:cursor-grab md:active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {selectMode ? (
          <span
            aria-hidden
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              selected ? "border-moss bg-moss text-paper" : "border-line-strong bg-card"
            }`}
          >
            {selected ? <AppIcon name="check" className="size-3.5" /> : null}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 title={item.company} className="truncate font-sans text-[15px] font-semibold leading-snug tracking-normal">
            {selectMode || temp ? (
              item.company
            ) : (
              <Link
                href={`/applications/${item.id}`}
                draggable={false}
                className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
              >
                {item.company}
              </Link>
            )}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink-soft">{item.role}</p>
        </div>
        {selectMode ? (
          <button
            type="button"
            aria-pressed={selected}
            aria-label={`Select ${name}`}
            onClick={() => onToggleSelect?.(item.id)}
            className="absolute inset-0 rounded-2xl focus-visible:outline-offset-2"
          />
        ) : onMove && !temp ? (
          variant === "list" ? (
            <button
              type="button"
              onClick={() => onMove(item)}
              data-move-id={item.id}
              aria-label={`Change status of ${name}, currently ${STATUS_META[item.status].label}`}
              className="relative z-10 -my-1 -mr-1 flex min-h-11 items-center rounded-full px-1"
            >
              <StatusPill status={item.status} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMove(item)}
              data-move-id={item.id}
              aria-label={`Move ${name} to another stage`}
              title="Move to…"
              className="relative z-10 -mr-1.5 -mt-1.5 flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink md:size-9 md:opacity-60 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <AppIcon name="move" className="size-4" />
            </button>
          )
        ) : null}
      </div>

      {temp ? (
        <p className="mt-2 text-xs text-muted">Planting…</p>
      ) : (
        <>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 empty:hidden">
            <DeadlineChip deadline={item.deadline} status={item.status} todayKey={todayKey} />
            <FollowUpChip followUpAt={item.followUpAt} status={item.status} todayKey={todayKey} compact />
            {quiet ? <WaitingChip days={daysBetween(lastActivityAt(item), nowMs)} /> : null}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs text-muted">{meta}</p>
            <Hearts value={item.excitement} size="xs" className="shrink-0" />
          </div>
        </>
      )}
    </article>
  );
}
