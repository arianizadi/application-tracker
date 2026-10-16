"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useState, type DragEvent, type ReactNode } from "react";

import { COLUMN_EMPTY } from "@/lib/applications/copy";
import type { ApplicationListItem } from "@/lib/applications/types";
import { ACTIVE_STATUSES, CLOSED_STATUSES, STATUS_META } from "@/lib/status";

import { ApplicationCard, DRAG_TYPE, type CardProps } from "./application-card";
import { AppIcon } from "./icons";
import { usePreference } from "./use-preference";

const PAGE = 40;

type Shared = Pick<CardProps, "todayKey" | "timeZone" | "nowMs" | "selectMode" | "onToggleSelect" | "onMove"> & {
  selected: Set<string>;
  highlightId: string | null;
};

export function Board({
  items,
  onDropStatus,
  ...shared
}: Shared & {
  items: ApplicationListItem[];
  onDropStatus: (id: string, status: ApplicationStatus) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<ApplicationStatus | null>(null);
  const [closedPref, setClosedPref] = usePreference("canopy:apps:closed", "collapsed", ["collapsed", "open"] as const);
  const closedOpen = closedPref === "open";

  const byStatus = new Map<ApplicationStatus, ApplicationListItem[]>();
  for (const item of items) {
    const list = byStatus.get(item.status) ?? [];
    list.push(item);
    byStatus.set(item.status, list);
  }
  const closedCount = CLOSED_STATUSES.reduce((n, s) => n + (byStatus.get(s)?.length ?? 0), 0);

  const dropProps = (status: ApplicationStatus) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (over !== status) setOver(status);
    },
    onDragLeave: (e: DragEvent) => {
      if (!(e.currentTarget as Node).contains(e.relatedTarget as Node | null)) setOver((o) => (o === status ? null : o));
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData(DRAG_TYPE) || dragId;
      setOver(null);
      setDragId(null);
      if (id) onDropStatus(id, status);
    },
  });

  const cardProps = (item: ApplicationListItem): CardProps => ({
    item,
    todayKey: shared.todayKey,
    timeZone: shared.timeZone,
    nowMs: shared.nowMs,
    variant: "board",
    selectMode: shared.selectMode,
    selected: shared.selected.has(item.id),
    onToggleSelect: shared.onToggleSelect,
    onMove: shared.onMove,
    highlight: shared.highlightId === item.id,
    draggable: true,
    dragging: dragId === item.id,
    onDragStart: setDragId,
    onDragEnd: () => {
      setDragId(null);
      setOver(null);
    },
  });

  return (
    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-4 [scrollbar-width:thin] snap-x snap-mandatory scroll-px-4 sm:-mx-6 sm:px-6 md:snap-none md:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] lg:-mx-10 lg:px-10">
      <div className="flex w-max gap-3 md:w-full">
        {ACTIVE_STATUSES.map((status) => (
          <Column key={status} status={status} count={byStatus.get(status)?.length ?? 0} isOver={over === status} {...dropProps(status)}>
            <CardList items={byStatus.get(status) ?? []} render={(item) => <ApplicationCard {...cardProps(item)} />} empty={COLUMN_EMPTY[status]} />
          </Column>
        ))}

        {closedOpen ? (
          <section
            aria-label={`Closed, ${closedCount} applications`}
            className="flex w-[min(80vw,19rem)] shrink-0 snap-start flex-col rounded-3xl border border-transparent bg-paper-2/70 md:w-64"
          >
            <header className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
              <h2 className="font-sans text-sm font-semibold tracking-normal">
                Closed <span className="tabular ml-1 text-muted">{closedCount}</span>
              </h2>
              <button
                type="button"
                onClick={() => setClosedPref("collapsed")}
                aria-expanded
                className="flex h-11 items-center rounded-full px-3 text-xs font-medium text-muted hover:bg-card hover:text-ink sm:h-9"
              >
                Collapse
              </button>
            </header>
            <div className="flex flex-col gap-2 p-2">
              {CLOSED_STATUSES.map((status) => {
                const list = byStatus.get(status) ?? [];
                return (
                  <div
                    key={status}
                    {...dropProps(status)}
                    className={`rounded-2xl border-2 border-dashed p-1.5 transition-colors ${
                      over === status ? "border-moss bg-moss-soft/70" : "border-transparent"
                    }`}
                  >
                    <p className="flex items-center gap-2 px-1.5 py-1 text-xs font-semibold text-ink-soft">
                      <span aria-hidden className={`size-2 rounded-full ${STATUS_META[status].dot}`} />
                      {STATUS_META[status].label}
                      <span className="tabular font-normal text-muted">{list.length}</span>
                    </p>
                    <CardList items={list} render={(item) => <ApplicationCard {...cardProps(item)} />} />
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setClosedPref("open")}
            onDragEnter={() => dragId && setClosedPref("open")}
            aria-expanded={false}
            aria-label={`Show closed applications (${closedCount})`}
            className="flex w-14 shrink-0 snap-start flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong bg-paper-2/50 py-4 text-muted transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <AppIcon name="chevron" className="size-4" />
            <span className="text-sm font-medium [writing-mode:vertical-rl]">
              Closed · <span className="tabular">{closedCount}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Column({
  status,
  count,
  isOver,
  children,
  ...drop
}: {
  status: ApplicationStatus;
  count: number;
  isOver: boolean;
  children: ReactNode;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}) {
  const meta = STATUS_META[status];
  return (
    <section
      aria-label={`${meta.label}, ${count} applications`}
      {...drop}
      className={`flex w-[min(80vw,19rem)] shrink-0 snap-start flex-col rounded-3xl border-2 transition-colors md:w-auto md:min-w-[12rem] md:flex-1 xl:min-w-[13.5rem] ${
        isOver ? "border-moss bg-moss-soft/60" : "border-transparent bg-paper-2/70"
      }`}
    >
      <header className="flex items-center gap-2 px-3.5 pb-2 pt-3">
        <span aria-hidden className={`size-2.5 rounded-full ${meta.dot}`} />
        <h2 className="font-sans text-sm font-semibold tracking-normal">{meta.label}</h2>
        <span className="tabular ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">{count}</span>
      </header>
      <div className="flex-1 px-2 pb-2">{children}</div>
    </section>
  );
}

function CardList({
  items,
  render,
  empty,
}: {
  items: ApplicationListItem[];
  render: (item: ApplicationListItem) => ReactNode;
  empty?: string;
}) {
  const [limit, setLimit] = useState(PAGE);
  if (items.length === 0) {
    return empty ? (
      <p className="rounded-2xl border border-dashed border-line-strong/70 px-3 py-6 text-center text-xs leading-relaxed text-muted">{empty}</p>
    ) : null;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.slice(0, limit).map((item) => (
        <li key={item.id}>{render(item)}</li>
      ))}
      {items.length > limit ? (
        <li>
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE * 2)}
            className="h-11 w-full rounded-2xl text-sm font-medium text-ink-soft hover:bg-card"
          >
            Show {Math.min(items.length - limit, PAGE * 2)} more
          </button>
        </li>
      ) : null}
    </ul>
  );
}
