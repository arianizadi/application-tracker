"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import { dateToKey, formatDateKey } from "@/lib/applications/dates";
import type { SortKey } from "@/lib/applications/filter";
import { WORK_MODE_LABEL } from "@/lib/applications/schema";
import type { ApplicationListItem } from "@/lib/applications/types";
import { STATUS_META } from "@/lib/status";

import { ApplicationCard, isTemp, type CardProps } from "./application-card";
import { DeadlineChip, FollowUpChip } from "./chips";
import { Hearts } from "./hearts";

const PAGE = 100;

type Props = Pick<CardProps, "todayKey" | "nowMs" | "selectMode" | "onMove"> & {
  items: ApplicationListItem[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
  highlightId: string | null;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
};

export function ListView({ items, selected, onToggleSelect, onToggleAll, highlightId, sort, onSort, ...shared }: Props) {
  const [limit, setLimit] = useState(PAGE);
  const shown = items.slice(0, limit);
  const selectable = shown.filter((i) => !isTemp(i.id)).map((i) => i.id);
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.has(id));
  const someSelected = !allSelected && selectable.some((id) => selected.has(id));

  const more =
    items.length > limit ? (
      <button
        type="button"
        onClick={() => setLimit((l) => l + PAGE)}
        className="mt-3 h-11 w-full rounded-2xl border border-line bg-card text-sm font-medium text-ink-soft hover:bg-paper-2"
      >
        Show {Math.min(items.length - limit, PAGE)} more of {items.length}
      </button>
    ) : null;

  return (
    <>
      {/* Phones: cards. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {shown.map((item) => (
          <li key={item.id}>
            <ApplicationCard
              item={item}
              variant="list"
              selected={selected.has(item.id)}
              onToggleSelect={onToggleSelect}
              highlight={highlightId === item.id}
              {...shared}
            />
          </li>
        ))}
      </ul>

      {/* Desktop: a dense table. */}
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-card shadow-soft md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-line bg-paper-2/60 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="w-12 py-3 pl-4">
                <input
                  type="checkbox"
                  aria-label={allSelected ? "Deselect all" : "Select all shown"}
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={() => onToggleAll(selectable, !allSelected)}
                  className="size-4 accent-[var(--moss)]"
                />
              </th>
              <SortHeader label="Company & role" sortKey="company" sort={sort} onSort={onSort} className="w-[34%]" />
              <th scope="col" className="w-36 px-3 py-3">Status</th>
              <SortHeader label="Applied" sortKey="applied" sort={sort} onSort={onSort} className="w-28" />
              <SortHeader label="Next up" sortKey="deadline" sort={sort} onSort={onSort} />
              <SortHeader label="Excitement" sortKey="excitement" sort={sort} onSort={onSort} className="w-32" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((item) => {
              const temp = isTemp(item.id);
              const isSelected = selected.has(item.id);
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${isSelected ? "bg-moss-soft/60" : "hover:bg-paper-2/50"} ${highlightId === item.id ? "animate-fade bg-moss-soft/40" : ""} ${temp ? "opacity-60" : ""}`}
                >
                  <td className="py-3 pl-4 align-top">
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.company} — ${item.role}`}
                      checked={isSelected}
                      disabled={temp}
                      onChange={() => onToggleSelect(item.id)}
                      className="mt-1 size-4 accent-[var(--moss)]"
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    {temp ? (
                      <span className="font-semibold">{item.company}</span>
                    ) : (
                      <Link href={`/applications/${item.id}`} className="font-semibold text-ink hover:text-moss hover:underline hover:underline-offset-4">
                        {item.company}
                      </Link>
                    )}
                    <p className="truncate text-ink-soft">{item.role}</p>
                    <p className="truncate text-xs text-muted">
                      {[item.location, item.workMode ? WORK_MODE_LABEL[item.workMode] : null, item.source].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    {temp || !shared.onMove ? (
                      <StatusPill status={item.status} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => shared.onMove?.(item)}
                        aria-label={`Change status of ${item.company}, currently ${STATUS_META[item.status].label}`}
                        className="rounded-full transition-transform hover:scale-[1.03]"
                      >
                        <StatusPill status={item.status} />
                      </button>
                    )}
                  </td>
                  <td className="tabular px-3 py-3 align-top text-ink-soft">
                    {item.appliedAt ? formatDateKey(dateToKey(item.appliedAt), shared.todayKey) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      <DeadlineChip deadline={item.deadline} status={item.status} todayKey={shared.todayKey} />
                      <FollowUpChip followUpAt={item.followUpAt} status={item.status} todayKey={shared.todayKey} />
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <Hearts value={item.excitement} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {more}
    </>
  );
}

function SortHeader({ label, sortKey, sort, onSort, className = "" }: { label: string; sortKey: SortKey; sort: SortKey; onSort: (s: SortKey) => void; className?: string }) {
  const active = sort === sortKey;
  return (
    <th scope="col" aria-sort={active ? (sortKey === "company" || sortKey === "deadline" ? "ascending" : "descending") : undefined} className={`px-3 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(active ? "recent" : sortKey)}
        className={`-mx-1.5 rounded-md px-1.5 py-0.5 uppercase tracking-[0.08em] hover:text-ink ${active ? "text-moss" : ""}`}
      >
        {label}
        {active ? <span aria-hidden> ↓</span> : null}
      </button>
    </th>
  );
}
