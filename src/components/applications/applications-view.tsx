"use client";

import type { ApplicationStatus, WorkMode } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useDeferredValue, useLayoutEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";

import { FirstPlanting } from "@/components/art";
import { useCelebrate } from "@/components/fx";
import { Mascot } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useBottomUi } from "@/hooks/use-bottom-ui";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { bulkDeleteApplications, bulkUpdateStatus, updateStatus } from "@/lib/applications/actions";
import { STATUS_TOAST } from "@/lib/applications/copy";
import { dateKeyToDate } from "@/lib/applications/dates";
import {
  QUICK_FLAGS,
  SORTS,
  filterApplications,
  isDeadlineSoon,
  isFollowUpDue,
  isQuiet,
  isSortKey,
  sortApplications,
  type ApplicationFilters,
  type QuickFlag,
  type SortKey,
} from "@/lib/applications/filter";
import { WORK_MODES, WORK_MODE_LABEL } from "@/lib/applications/schema";
import type { ApplicationListItem } from "@/lib/applications/types";
import { radioKeyNav } from "@/lib/radio-keys";
import { CLOSED_STATUSES, REACHED_INTERVIEW, STATUSES, STATUS_META } from "@/lib/status";

import { isTemp } from "./application-card";
import { Board } from "./board";
import { GhostBanner } from "./ghost-banner";
import { AppIcon } from "./icons";
import { ListView } from "./list-view";
import { QuickAdd } from "./quick-add";
import { ConfirmSheet, StatusSheet } from "./sheet";
import { celebrateStatus } from "./status-celebration";
import { UndoBar, offerUndo } from "./undo";
import { usePreference } from "./use-preference";

type View = "board" | "list";
const VIEWS = ["board", "list"] as const satisfies readonly View[];

type Optimistic =
  | { type: "status"; ids: string[]; status: ApplicationStatus; at: Date; today: Date }
  | { type: "remove"; ids: string[] }
  | { type: "add"; item: ApplicationListItem };

function reduce(state: ApplicationListItem[], action: Optimistic): ApplicationListItem[] {
  switch (action.type) {
    case "status": {
      const ids = new Set(action.ids);
      return state.map((item) =>
        ids.has(item.id) && item.status !== action.status
          ? {
              ...item,
              status: action.status,
              updatedAt: action.at,
              // Withdrawing from the wishlist isn't applying; only real moves stamp appliedAt.
              appliedAt: action.status === "WISHLIST" ? null : action.status === "WITHDRAWN" ? item.appliedAt : (item.appliedAt ?? action.today),
              history: [...item.history, { status: action.status, at: action.at }],
            }
          : item,
      );
    }
    case "remove": {
      const ids = new Set(action.ids);
      return state.filter((item) => !ids.has(item.id));
    }
    case "add":
      return [action.item, ...state];
  }
}

type MoveTarget = { ids: string[]; current?: ApplicationStatus; title: string };

export function ApplicationsView({
  items,
  todayKey,
  timeZone,
  nowMs,
  initialFilters,
}: {
  items: ApplicationListItem[];
  todayKey: string;
  timeZone: string;
  nowMs: number;
  initialFilters: ApplicationFilters & { view?: View };
}) {
  const router = useRouter();
  const toast = useToast();
  const { celebrate } = useCelebrate();
  const [optimistic, applyOptimistic] = useOptimistic(items, reduce);
  const [, startTransition] = useTransition();

  const [view, setView] = usePreference<View>("canopy:apps:view", initialFilters.view ?? "board", VIEWS);
  const [storedSort, setStoredSort] = usePreference<SortKey>("canopy:apps:sort", "recent", SORTS.map((s) => s.key));
  const [sortOverride, setSortOverride] = useState<SortKey | undefined>(initialFilters.sort);
  const sort: SortKey = sortOverride ?? storedSort;
  const changeSort = (next: SortKey) => {
    setSortOverride(undefined);
    setStoredSort(next);
  };

  const [q, setQ] = useState(initialFilters.q ?? "");
  const deferredQ = useDeferredValue(q);
  const [statuses, setStatuses] = useState<ApplicationStatus[]>(initialFilters.statuses ?? []);
  const [workModes, setWorkModes] = useState<WorkMode[]>(initialFilters.workModes ?? []);
  const [source, setSource] = useState(initialFilters.source ?? "");
  const [flag, setFlag] = useState<QuickFlag | undefined>(initialFilters.flag);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const quickRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  // Card whose Move button opened the sheet; focus returns to it after it re-renders elsewhere.
  const refocus = useRef<{ id: string; until: number } | null>(null);

  const ctx = useMemo(() => ({ todayKey, nowMs }), [todayKey, nowMs]);
  const filters: ApplicationFilters = { q: deferredQ, statuses, workModes, source: source || undefined, flag };
  const visible = useMemo(
    () => sortApplications(filterApplications(optimistic, { q: deferredQ, statuses, workModes, source: source || undefined, flag }, ctx), sort),
    [optimistic, deferredQ, statuses, workModes, source, flag, ctx, sort],
  );
  const filtering = Boolean(filters.q?.trim() || statuses.length || workModes.length || source || flag);

  const counts = useMemo(() => {
    const byStatus = new Map<ApplicationStatus, number>();
    let followUps = 0;
    let deadlines = 0;
    let quiet = 0;
    for (const item of optimistic) {
      byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1);
      if (isFollowUpDue(item, todayKey)) followUps++;
      if (isDeadlineSoon(item, todayKey)) deadlines++;
      if (isQuiet(item, nowMs)) quiet++;
    }
    const active = optimistic.length - CLOSED_STATUSES.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0);
    const interviewing = REACHED_INTERVIEW.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0);
    return { byStatus, active, interviewing, flags: { followup: followUps, deadline: deadlines, quiet } satisfies Record<QuickFlag, number> };
  }, [optimistic, todayKey, nowMs]);

  const sources = useMemo(() => {
    const set = new Map<string, string>();
    for (const item of optimistic) if (item.source) set.set(item.source.toLowerCase(), item.source);
    return [...set.values()].sort((a, b) => a.localeCompare(b));
  }, [optimistic]);

  const quietItems = useMemo(() => optimistic.filter((i) => !isTemp(i.id) && isQuiet(i, nowMs)), [optimistic, nowMs]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  function changeStatus(ids: string[], status: ApplicationStatus) {
    const real = ids.filter((id) => !isTemp(id));
    const changing = real.filter((id) => optimistic.find((i) => i.id === id)?.status !== status);
    if (changing.length === 0) return;
    const single = changing.length === 1 ? optimistic.find((i) => i.id === changing[0]) : null;
    startTransition(async () => {
      const now = new Date();
      applyOptimistic({ type: "status", ids: changing, status, at: now, today: dateKeyToDate(todayKey) });
      const res = changing.length === 1 ? await updateStatus(changing[0], status) : await bulkUpdateStatus(changing, status);
      if (!res.ok) {
        toast({ title: "That didn't stick", body: res.error, tone: "warning" });
        return;
      }
      const copy = STATUS_TOAST[status];
      const replaced = single ? celebrateStatus(celebrate, status, { company: single.company }) : false;
      if (!replaced) toast(
        single
          ? { title: copy.title, body: `${single.company}: ${copy.body}`, tone: copy.tone }
          : { title: `Moved ${changing.length} to ${STATUS_META[status].label}`, body: copy.body, tone: copy.tone === "celebrate" ? "celebrate" : "success" },
      );
      if (single) setHighlightId(single.id);
      if (changing.length > 1 || inSelectMode) {
        setSelected(new Set());
        setSelectMode(false);
      }
    });
  }

  function deleteIds(ids: string[]) {
    const real = ids.filter((id) => !isTemp(id));
    if (!real.length) return;
    const first = optimistic.find((i) => i.id === real[0]);
    setConfirmDelete(null);
    startTransition(async () => {
      applyOptimistic({ type: "remove", ids: real });
      const res = await bulkDeleteApplications(real);
      if (!res.ok) {
        toast({ title: "Couldn't delete", body: res.error, tone: "warning" });
        return;
      }
      setSelected(new Set());
      setSelectMode(false);
      offerUndo(res.data.deleted, real.length === 1 && first ? `Deleted ${first.company}` : `Deleted ${res.data.deleted.length} applications`);
    });
  }

  function toggleSelect(id: string) {
    if (isTemp(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[], select: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (select) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function clearFilters() {
    setQ("");
    setStatuses([]);
    setWorkModes([]);
    setSource("");
    setFlag(undefined);
  }

  const hotkeys = useMemo(
    () => ({
      n: () => router.push("/applications/new"),
      a: () => quickRef.current?.focus(),
      "/": () => searchRef.current?.focus(),
      b: () => setView("board"),
      l: () => setView("list"),
    }),
    [router, setView],
  );
  useHotkeys(hotkeys);

  const selectedIds = [...selected].filter((id) => optimistic.some((i) => i.id === id));
  const inSelectMode = selectMode || selectedIds.length > 0;
  const total = optimistic.length;

  useBottomUi(toolbarRef, inSelectMode);

  // A status change can move the card to another column (or row), which remounts
  // it and drops focus to <body>. Put focus back on its Move button.
  useLayoutEffect(() => {
    const target = refocus.current;
    if (!target || moveTarget) return;
    if (Date.now() > target.until) {
      refocus.current = null;
      return;
    }
    const active = document.activeElement;
    // Still on the original button: the card may yet move, so keep watching.
    if (active instanceof HTMLElement && active.dataset.moveId === target.id) return;
    if (active && active !== document.body) {
      refocus.current = null;
      return;
    }
    // The list renders a phone and a desktop variant; pick the one that's visible.
    const el = [...document.querySelectorAll<HTMLElement>(`[data-move-id="${CSS.escape(target.id)}"]`)].find((b) => b.getClientRects().length > 0);
    if (el) {
      el.focus();
      refocus.current = null;
    }
  }, [optimistic, moveTarget]);

  const shared = {
    todayKey,
    timeZone,
    nowMs,
    selectMode: inSelectMode,
    selected,
    onToggleSelect: toggleSelect,
    onMove: (item: ApplicationListItem) => {
      refocus.current = { id: item.id, until: Date.now() + 5000 };
      setMoveTarget({ ids: [item.id], current: item.status, title: `Move ${item.company} to…` });
    },
    highlightId,
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Applications</p>
        <h1 className="text-3xl font-semibold leading-[1.1] sm:text-4xl">Your grove</h1>
        <p className="tabular text-[15px] text-ink-soft" aria-live="polite">
          {total === 0 ? (
            "Nothing planted yet — that changes in about ten seconds."
          ) : (
            <>
              <strong className="font-semibold text-ink">{total}</strong> {total === 1 ? "application" : "applications"} ·{" "}
              <strong className="font-semibold text-ink">{counts.active}</strong> active
              {counts.interviewing ? (
                <>
                  {" "}
                  · <strong className="font-semibold text-ink">{counts.interviewing}</strong> reached interviews
                </>
              ) : null}
            </>
          )}
        </p>
      </header>

      <QuickAdd
        companyRef={quickRef}
        onOptimisticAdd={(item) => applyOptimistic({ type: "add", item })}
        onAdded={(item, plantButton) => {
          setHighlightId(item.id);
          if (item.status !== "WISHLIST") celebrate("plant", { quiet: true, origin: plantButton ?? undefined });
        }}
      />

      {quietItems.length > 0 ? (
        <GhostBanner
          items={quietItems}
          nowMs={nowMs}
          onGhostAll={() => changeStatus(quietItems.map((i) => i.id), "GHOSTED")}
          onReview={() => {
            clearFilters();
            setFlag("quiet");
            setView("list");
          }}
        />
      ) : null}

      {total > 0 ? (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 basis-56">
                <label htmlFor="apps-search" className="sr-only">
                  Search applications
                </label>
                <AppIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  ref={searchRef}
                  id="apps-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value.slice(0, 100))}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setQ("");
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="Search applications…"
                  className="h-11 w-full rounded-full border border-line-strong bg-card pl-10 pr-10 text-[15px] text-ink placeholder:text-muted/80 focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/25"
                />
                <kbd aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-paper-2 px-1.5 font-mono text-[11px] text-muted sm:block">
                  /
                </kbd>
              </div>

              <div role="radiogroup" aria-label="View" className="inline-flex h-11 rounded-full border border-line bg-paper-2 p-1">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={view === v}
                    tabIndex={view === v ? 0 : -1}
                    onClick={() => setView(v)}
                    onKeyDown={(e) => radioKeyNav(e, VIEWS, view, setView)}
                    title={v === "board" ? "Board (B)" : "List (L)"}
                    className={`flex items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${
                      view === v ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"
                    }`}
                  >
                    <AppIcon name={v} className="size-4" />
                    <span className="hidden sm:inline">{v === "board" ? "Board" : "List"}</span>
                    <span className="sr-only sm:hidden">{v === "board" ? "Board" : "List"}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-pressed={inSelectMode}
                onClick={() => {
                  if (inSelectMode) {
                    setSelectMode(false);
                    setSelected(new Set());
                  } else setSelectMode(true);
                }}
                className={`flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                  inSelectMode ? "border-moss bg-moss-soft text-moss-strong" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2"
                }`}
              >
                <AppIcon name="select" className="size-4" />
                {inSelectMode ? "Done" : "Select"}
              </button>

              <label htmlFor="apps-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="apps-sort"
                value={sort}
                onChange={(e) => isSortKey(e.target.value) && changeSort(e.target.value)}
                className="h-11 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium text-ink-soft focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/25"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>

              <a
                href="/api/export/applications"
                download
                className="flex h-11 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
                title="Download a spreadsheet-safe CSV of every application"
              >
                <AppIcon name="download" className="size-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sr-only sm:hidden">Export CSV</span>
              </a>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
              <div className="flex w-max items-center gap-1.5 sm:w-auto sm:flex-wrap" role="group" aria-label="Filters">
                {STATUSES.filter((s) => (counts.byStatus.get(s) ?? 0) > 0 || statuses.includes(s)).map((s) => (
                  <FilterChip
                    key={s}
                    pressed={statuses.includes(s)}
                    onClick={() => setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                    dot={STATUS_META[s].dot}
                    count={counts.byStatus.get(s) ?? 0}
                  >
                    {STATUS_META[s].label}
                  </FilterChip>
                ))}
                <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
                {WORK_MODES.map((m) => (
                  <FilterChip key={m} pressed={workModes.includes(m)} onClick={() => setWorkModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))}>
                    {WORK_MODE_LABEL[m]}
                  </FilterChip>
                ))}
                {QUICK_FLAGS.filter((f) => counts.flags[f.key] > 0 || flag === f.key).map((f) => (
                  <FilterChip key={f.key} pressed={flag === f.key} onClick={() => setFlag((prev) => (prev === f.key ? undefined : f.key))} count={counts.flags[f.key]} tone="sun">
                    {f.label}
                  </FilterChip>
                ))}
                {sources.length > 1 ? (
                  <>
                    <label htmlFor="apps-source" className="sr-only">
                      Source
                    </label>
                    <select
                      id="apps-source"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className={`h-11 rounded-full border px-3 text-xs font-medium focus:outline-none sm:h-9 focus:ring-2 focus:ring-moss/25 ${
                        source ? "border-moss bg-moss-soft text-moss-strong" : "border-line bg-card text-ink-soft"
                      }`}
                    >
                      <option value="">Any source</option>
                      {sources.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                {filtering ? (
                  <button type="button" onClick={clearFilters} className="h-11 rounded-full px-3 text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline sm:h-9">
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {filtering ? (
            <p className="sr-only" aria-live="polite">
              {visible.length} {visible.length === 1 ? "match" : "matches"}
            </p>
          ) : null}

          {visible.length === 0 ? (
            <EmptyState
              art={<Mascot name="acorn" mood="think" enter className="size-24" title="Acorn the squirrel, looking behind a stump" />}
              title="Nothing on this trail"
              action={
                <button type="button" onClick={clearFilters} className="h-11 rounded-full border border-line-strong bg-card px-5 text-sm font-medium hover:bg-paper-2">
                  Clear filters
                </button>
              }
            >
              No applications match those filters. Acorn checked behind every stump.
            </EmptyState>
          ) : view === "board" ? (
            <Board items={visible} onDropStatus={(id, status) => changeStatus([id], status)} {...shared} />
          ) : (
            <ListView items={visible} sort={sort} onSort={changeSort} onToggleAll={toggleAll} {...shared} />
          )}
        </>
      ) : (
        <EmptyState
          art={<FirstPlanting title="Fern the frog beside an empty planting bed" />}
          title="Every forest starts somewhere"
          action={
            <ButtonLink href="/applications/new" variant="secondary">
              Use the full form instead
            </ButtonLink>
          }
        >
          Add your first application above — just a company and a role. The details can catch up. You don&apos;t need a whole plan to take one step.
        </EmptyState>
      )}

      {inSelectMode ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--dock-bottom)+0.75rem)] z-[45] flex justify-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:bottom-6 md:pl-[calc(16rem+env(safe-area-inset-left))]">
          <div ref={toolbarRef} role="toolbar" aria-label="Bulk actions" className="pointer-events-auto flex w-full max-w-xl animate-rise items-center gap-2 rounded-2xl border border-line bg-card p-2 pl-4 shadow-lift">
            <p className="tabular min-w-0 flex-1 truncate text-sm font-medium" aria-live="polite">
              {selectedIds.length ? `${selectedIds.length} selected` : "Tap cards to select"}
            </p>
            <button
              type="button"
              onClick={() => toggleAll(visible.filter((i) => !isTemp(i.id)).map((i) => i.id), true)}
              className="hidden h-10 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-paper-2 sm:block"
            >
              Select all
            </button>
            <button
              type="button"
              disabled={!selectedIds.length}
              onClick={() => {
                refocus.current = null;
                setMoveTarget({ ids: selectedIds, title: `Move ${selectedIds.length} ${selectedIds.length === 1 ? "application" : "applications"} to…` });
              }}
              className="flex h-10 items-center gap-1.5 rounded-full bg-moss px-4 text-sm font-medium text-paper hover:bg-moss-strong disabled:opacity-50"
            >
              <AppIcon name="move" className="size-4" /> Move
            </button>
            <button
              type="button"
              disabled={!selectedIds.length}
              onClick={() => setConfirmDelete(selectedIds)}
              aria-label="Delete selected"
              className="flex size-10 items-center justify-center rounded-full text-coral hover:bg-coral-soft disabled:opacity-50"
            >
              <AppIcon name="trash" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(new Set());
                setSelectMode(false);
              }}
              aria-label="Exit selection"
              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
            >
              <AppIcon name="x" className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <StatusSheet
        open={Boolean(moveTarget)}
        onClose={() => setMoveTarget(null)}
        title={moveTarget?.title ?? "Move to…"}
        description={moveTarget && moveTarget.ids.length > 1 ? "Each one gets a dated entry in its history." : undefined}
        current={moveTarget?.current}
        exclude={moveTarget && moveTarget.ids.length > 1 ? ["WISHLIST"] : []}
        onPick={(status) => moveTarget && changeStatus(moveTarget.ids, status)}
      />

      <ConfirmSheet
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.length ?? 0} ${confirmDelete?.length === 1 ? "application" : "applications"}?`}
        description="Their history goes too. You'll have a few seconds to undo."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && deleteIds(confirmDelete)}
      />

      <UndoBar />
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
  count,
  dot,
  tone = "moss",
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  dot?: string;
  tone?: "moss" | "sun";
}) {
  const on = tone === "sun" ? "border-sun bg-sun-soft text-ink" : "border-moss bg-moss-soft text-moss-strong";
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:h-9 ${
        pressed ? on : "border-line bg-card text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {dot ? <span aria-hidden className={`size-2 rounded-full ${dot}`} /> : null}
      {children}
      {count !== undefined ? <span className="tabular text-muted">{count}</span> : null}
    </button>
  );
}
