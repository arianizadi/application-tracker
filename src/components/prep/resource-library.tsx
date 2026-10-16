"use client";

import { useDeferredValue, useId, useMemo, useState, type ReactNode } from "react";

import { RESOURCE_CATEGORIES, RESOURCES } from "@/content/prep/resources";
import type { Resource, TrackCode } from "@/content/prep/types";
import type { ProgressMap } from "@/lib/prep/progress";
import { matchesTrack, TRACK_FILTER_ORDER, TRACK_LABELS } from "@/lib/prep/tracks";

import { PrepIcon } from "./icons";
import { chipClass, RESOURCE_TYPE_LABELS, ResourceCard, ResourceToggles } from "./resource-card";
import { plainText } from "./rich-text";
import { useLocalProgress } from "./use-local-progress";

type Tab = "all" | "saved" | "done";
type Level = "" | "beginner" | "intermediate" | "advanced";
type Filters = { category: string; track: TrackCode | ""; type: Resource["type"] | ""; cost: Resource["cost"] | ""; level: Level };

const EMPTY: Filters = { category: "", track: "", type: "", cost: "", level: "" };

const LEVELS: Record<Exclude<Level, "">, { label: string; matches: Resource["difficulty"][] }> = {
  beginner: { label: "Beginner-friendly", matches: ["beginner", "beginner–intermediate", "all levels"] },
  intermediate: { label: "Intermediate", matches: ["beginner–intermediate", "intermediate", "intermediate–advanced", "all levels"] },
  advanced: { label: "Advanced", matches: ["intermediate–advanced", "advanced", "all levels"] },
};

const SEARCH_INDEX = new Map(
  RESOURCES.map((r) => [r.id, [r.title, plainText(r.why), r.category, r.type, RESOURCE_TYPE_LABELS[r.type], ...r.tags, ...r.tracks.map((t) => TRACK_LABELS[t])].join(" \u0000 ").toLowerCase()]),
);

const TYPES = [...new Set(RESOURCES.map((r) => r.type))].sort((a, b) => RESOURCE_TYPE_LABELS[a].localeCompare(RESOURCE_TYPE_LABELS[b]));

export function ResourceLibrary({ initial, recommendedIds, isSecurityTrack }: { initial: ProgressMap; recommendedIds: string[]; isSecurityTrack: boolean }) {
  const { states, pending, set } = useLocalProgress("resource", initial);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [showFilters, setShowFilters] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());
  const filterPanel = useId();

  const recommended = useMemo(() => new Set(recommendedIds), [recommendedIds]);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const counts = useMemo(() => {
    let saved = 0;
    let done = 0;
    for (const s of Object.values(states)) {
      if (s === "saved") saved++;
      else if (s === "done") done++;
    }
    return { saved, done };
  }, [states]);

  const results = useMemo(() => {
    const terms = q.split(/\s+/).filter(Boolean);
    const list = RESOURCES.filter((r) => {
      if (tab === "saved" && states[r.id] !== "saved") return false;
      if (tab === "done" && states[r.id] !== "done") return false;
      if (filters.category && r.category !== filters.category) return false;
      if (filters.track && !matchesTrack(r.tracks, filters.track)) return false;
      if (filters.type && r.type !== filters.type) return false;
      if (filters.cost && r.cost !== filters.cost) return false;
      if (filters.level && !LEVELS[filters.level].matches.includes(r.difficulty)) return false;
      if (terms.length) {
        const hay = SEARCH_INDEX.get(r.id) ?? "";
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    // Recommended-now first; otherwise keep the curated order.
    return list.map((r, i) => ({ r, i })).sort((a, b) => Number(recommended.has(b.r.id)) - Number(recommended.has(a.r.id)) || a.i - b.i).map((x) => x.r);
  }, [q, tab, filters, states, recommended]);

  const grouped = tab === "all" && !q && activeFilters === 0;
  const groups = useMemo(() => {
    if (!grouped) return null;
    const recs = results.filter((r) => recommended.has(r.id));
    const out: { title: string; items: Resource[] }[] = [];
    if (recs.length) out.push({ title: "Recommended for you right now", items: recs });
    for (const c of RESOURCE_CATEGORIES) {
      const items = results.filter((r) => r.category === c && !recommended.has(r.id));
      if (items.length) out.push({ title: c, items });
    }
    return out;
  }, [grouped, results, recommended]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const renderCard = (r: Resource) => (
    <li key={r.id}>
      <ResourceCard
        resource={r}
        headingLevel={groups ? 3 : 2}
        state={states[r.id] ?? null}
        badge={
          recommended.has(r.id) ? (
            <span className={`${chipClass} border-coral/30 bg-coral-soft text-coral`}>
              <PrepIcon name="sparkle" className="size-3" /> For you now
            </span>
          ) : null
        }
        actions={<ResourceToggles state={states[r.id] ?? null} pending={!!pending[r.id]} onChange={(n) => void set(r.id, n)} title={r.title} />}
      />
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      {!isSecurityTrack ? (
        <p className="flex gap-3 rounded-2xl border border-line bg-paper-2/60 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          <PrepIcon name="info" className="mt-0.5 size-4 shrink-0 text-muted" />
          <span>
            This library is curated for cybersecurity internships. The <strong className="text-ink">interview, résumé and portfolio</strong> section is useful for any track.
          </span>
        </p>
      ) : null}

      {/* Tabs */}
      <div role="group" aria-label="Library view" className="inline-flex w-full rounded-full border border-line bg-paper-2/70 p-1 sm:w-auto sm:self-start">
        {(
          [
            ["all", "Library", RESOURCES.length],
            ["saved", "Saved", counts.saved],
            ["done", "Done", counts.done],
          ] as const
        ).map(([key, label, n]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors sm:flex-none ${
              tab === key ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
            <span className={`rounded-full px-1.5 text-xs tabular ${tab === key ? "bg-paper-2 text-ink-soft" : "text-muted"}`}>{n}</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search resources</span>
            <PrepIcon name="search" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Splunk, OWASP, free labs…"
              className="h-12 w-full rounded-full border border-line-strong bg-card pl-11 pr-4 text-[15px] text-ink placeholder:text-muted"
            />
          </label>
          <button
            type="button"
            aria-expanded={showFilters}
            aria-controls={filterPanel}
            onClick={() => setShowFilters((s) => !s)}
            className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              showFilters || activeFilters ? "border-moss/50 bg-moss-soft text-moss" : "border-line-strong bg-card text-ink-soft hover:text-ink"
            }`}
          >
            <PrepIcon name="filter" className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters ? <span className="grid size-5 place-items-center rounded-full bg-moss text-[11px] font-semibold text-paper tabular">{activeFilters}</span> : null}
          </button>
        </div>

        <div id={filterPanel} hidden={!showFilters} className="rounded-3xl border border-line bg-card p-4 shadow-soft">
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
            <Select label="Category" value={filters.category} onChange={(v) => setFilter("category", v)}>
              <option value="">Any category</option>
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select label="Track" value={filters.track} onChange={(v) => setFilter("track", v as TrackCode | "")}>
              <option value="">Any track</option>
              {TRACK_FILTER_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TRACK_LABELS[t]}
                </option>
              ))}
            </Select>
            <Select label="Type" value={filters.type} onChange={(v) => setFilter("type", v as Resource["type"] | "")}>
              <option value="">Any type</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {RESOURCE_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            <Select label="Cost" value={filters.cost} onChange={(v) => setFilter("cost", v as Resource["cost"] | "")}>
              <option value="">Any cost</option>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </Select>
            <Select label="Difficulty" value={filters.level} onChange={(v) => setFilter("level", v as Level)}>
              <option value="">Any level</option>
              {(Object.keys(LEVELS) as Exclude<Level, "">[]).map((l) => (
                <option key={l} value={l}>
                  {LEVELS[l].label}
                </option>
              ))}
            </Select>
          </div>
          {activeFilters ? (
            <button type="button" onClick={() => setFilters(EMPTY)} className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
              <PrepIcon name="x" className="size-4" /> Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        {results.length === RESOURCES.length ? `${results.length} resources` : `${results.length} of ${RESOURCES.length} resources`}
        {tab === "saved" ? " saved for later" : tab === "done" ? " done" : ""}
      </p>

      {results.length === 0 ? (
        <EmptyResults
          tab={tab}
          onReset={() => {
            setQuery("");
            setFilters(EMPTY);
            setTab("all");
          }}
        />
      ) : groups ? (
        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.title} aria-label={g.title}>
              <h2 className={`mb-4 text-xl font-semibold leading-snug sm:text-2xl ${g.title.startsWith("Recommended") ? "text-coral" : ""}`}>{g.title}</h2>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{g.items.map(renderCard)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map(renderCard)}</ul>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full appearance-none truncate rounded-xl border bg-paper pl-3 pr-8 text-sm ${value ? "border-moss/50 text-ink" : "border-line-strong text-ink-soft"}`}
        >
          {children}
        </select>
        <PrepIcon name="chevron-down" className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}

function EmptyResults({ tab, onReset }: { tab: Tab; onReset: () => void }) {
  const text =
    tab === "saved"
      ? "Nothing saved yet. Tap Save on anything you want to come back to."
      : tab === "done"
        ? "Nothing marked done yet. Finished a course or read a guide? Mark it and it counts toward your XP."
        : "Nothing matches those filters. Try fewer filters or a broader word.";
  return (
    <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-line-strong px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-sky-soft text-ink-soft">
        <PrepIcon name={tab === "saved" ? "bookmark" : tab === "done" ? "check" : "search"} className="size-6" />
      </span>
      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">{text}</p>
      <button type="button" onClick={onReset} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line-strong bg-card px-5 text-sm font-medium hover:bg-paper-2">
        Browse the whole library
      </button>
    </div>
  );
}
