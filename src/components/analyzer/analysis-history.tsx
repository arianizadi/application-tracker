"use client";

import { useMemo, useState, useTransition } from "react";

import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteAnalysis } from "@/lib/analyzer/actions";

import { Sparkline } from "./sparkline";

export type HistoryAnalysis = {
  id: string;
  preset: string;
  title: string;
  score: number;
  found: string[];
  missing: string[];
  resumeId: string | null;
  createdAt: Date;
};

type ResumeInfo = { id: string; label: string; version: number };

type Group = { key: string; label: string; kind: string; entries: HistoryAnalysis[] };

/** Entries shown per group before "Show all". */
const RECENT_ENTRIES = 10;

const selectClass =
  "min-h-11 w-full rounded-xl border border-line-strong bg-card px-3 text-sm text-ink focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/25";

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted">±0</span>;
  return <span className={value > 0 ? "text-moss" : "text-coral"}>{value > 0 ? `+${value}` : value}</span>;
}

export function AnalysisHistory({
  analyses,
  resumes,
  presetLabels,
  timeZone,
}: {
  analyses: HistoryAnalysis[];
  resumes: ResumeInfo[];
  presetLabels: Record<string, string>;
  timeZone: string;
}) {
  const fmt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone });
    } catch {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    }
  }, [timeZone]);
  const resumeById = useMemo(() => new Map(resumes.map((r) => [r.id, r])), [resumes]);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const a of analyses) {
      const key = a.preset === "custom" ? `custom:${a.title.toLowerCase()}` : a.preset;
      const g = map.get(key) ?? {
        key,
        label: a.preset === "custom" ? a.title : (presetLabels[a.preset] ?? a.preset),
        kind: a.preset === "custom" ? "Job description" : "Role preset",
        entries: [],
      };
      g.entries.push(a);
      map.set(key, g);
    }
    for (const g of map.values()) g.entries.sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
    return [...map.values()].sort(
      (a, b) => new Date(b.entries[b.entries.length - 1].createdAt).getTime() - new Date(a.entries[a.entries.length - 1].createdAt).getTime(),
    );
  }, [analyses, presetLabels]);

  const resumeName = (id: string | null) => {
    if (!id) return "Pasted text";
    const r = resumeById.get(id);
    return r ? `v${r.version} · ${r.label}` : "Deleted version";
  };

  return (
    <section aria-labelledby="history-title" className="rounded-3xl border border-line bg-card shadow-soft">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <h2 id="history-title" className="text-lg font-semibold leading-tight">
          Past checks
        </h2>
        <p className="mt-1 text-sm text-muted">Grouped by target, so scores are only compared under the same rules.</p>
      </div>
      {groups.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <Mascot name="rue" mood="sleepy" className="size-20" />
          <h3 className="mt-3 text-lg font-semibold">No checks yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-soft">Bring a resume and something to compare it with. Rue keeps the case files here.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {groups.map((g) => (
            <HistoryGroup key={g.key} group={g} fmt={fmt} resumeName={resumeName} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryGroup({ group, fmt, resumeName }: { group: Group; fmt: Intl.DateTimeFormat; resumeName: (id: string | null) => string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  // Closed groups render no body: up to 200 checks × 400 keyword chips adds up on mobile.
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const entries = group.entries;
  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;

  // Default comparison: latest vs the most recent earlier check from a different resume version.
  const defaultA = useMemo(() => {
    for (let i = entries.length - 2; i >= 0; i--) if (entries[i].resumeId !== latest.resumeId) return entries[i].id;
    return prev?.id ?? null;
  }, [entries, latest, prev]);
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);
  const a = entries.find((e) => e.id === aId) ?? entries.find((e) => e.id === defaultA) ?? null;
  const b = entries.find((e) => e.id === bId) ?? latest;

  const scores = entries.map((e) => e.score);
  const dates = entries.map((e) => fmt.format(new Date(e.createdAt)));

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteAnalysis(id);
      setConfirmId(null);
      if (!res.ok) toast({ tone: "warning", title: res.error });
      else toast({ tone: "info", title: "Check removed", body: "Acorn filed it under 'never mind'." });
    });
  }

  const newlyFound = open && a ? b.found.filter((t) => !a.found.includes(t)) : [];
  const lost = open && a ? a.found.filter((t) => !b.found.includes(t)) : [];
  const newestFirst = [...entries].reverse();
  const shown = showAll ? newestFirst : newestFirst.slice(0, RECENT_ENTRIES);

  return (
    <li>
      <details className="group" onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-5 py-3 hover:bg-paper-2/40 sm:px-6 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{group.label}</p>
            <p className="text-xs text-muted">
              {group.kind} · {entries.length} {entries.length === 1 ? "check" : "checks"} · last {fmt.format(new Date(latest.createdAt))}
            </p>
          </div>
          <Sparkline values={scores} labels={dates} label={`Score trend: ${scores.join(", ")} percent`} className="hidden h-7 w-24 shrink-0 min-[400px]:block" />
          <div className="w-14 shrink-0 text-right">
            <p className="font-display text-xl font-semibold leading-none tabular">{latest.score}%</p>
            {prev ? (
              <p className="mt-0.5 text-xs tabular">
                <Delta value={latest.score - prev.score} />
              </p>
            ) : null}
          </div>
          <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 4 4 4-4 4" />
          </svg>
        </summary>

        {open ? (
          <div className="flex flex-col gap-5 px-5 pb-5 sm:px-6">
            {entries.length >= 2 && a ? (
              <div className="rounded-2xl border border-line bg-paper-2/40 p-4">
                <h3 className="text-sm font-semibold">Compare versions</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["Before", a, setAId],
                      ["After", b, setBId],
                    ] as const
                  ).map(([label, value, set]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <label htmlFor={`${group.key}-${label}`} className="text-xs font-medium text-ink-soft">
                        {label}
                      </label>
                      <select id={`${group.key}-${label}`} className={selectClass} value={value.id} onChange={(e) => set(e.target.value)}>
                        {newestFirst.map((e) => (
                          <option key={e.id} value={e.id}>
                            {`${fmt.format(new Date(e.createdAt))} · ${resumeName(e.resumeId)} · ${e.score}%`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-card p-2">
                    <p className="text-xs text-muted">Before</p>
                    <p className="font-display text-xl font-semibold tabular">{a.score}%</p>
                  </div>
                  <div className="rounded-xl bg-card p-2">
                    <p className="text-xs text-muted">After</p>
                    <p className="font-display text-xl font-semibold tabular">{b.score}%</p>
                  </div>
                  <div className="rounded-xl bg-card p-2">
                    <p className="text-xs text-muted">Change</p>
                    <p className="font-display text-xl font-semibold tabular">
                      <Delta value={b.score - a.score} />
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">Newly found · {newlyFound.length}</p>
                    {newlyFound.length ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {newlyFound.map((t) => (
                          <li key={t} className="rounded-full bg-moss-soft px-2.5 py-1 text-xs font-medium text-moss-strong">
                            + {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted">No new mentions.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-coral">No longer found · {lost.length}</p>
                    {lost.length ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {lost.map((t) => (
                          <li key={t} className="rounded-full bg-coral-soft px-2.5 py-1 text-xs font-medium text-ink">
                            − {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted">Nothing lost. Nice.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <ul className="flex flex-col gap-2">
              {shown.map((e) => (
                <li key={e.id} className="rounded-2xl border border-line p-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{resumeName(e.resumeId)}</p>
                      <p className="text-xs text-muted">
                        {fmt.format(new Date(e.createdAt))} · {e.found.length} found · {e.missing.length} missing
                      </p>
                    </div>
                    <p className="font-display text-lg font-semibold tabular">{e.score}%</p>
                    {confirmId === e.id ? (
                      <div className="flex gap-1">
                        <Button variant="danger" size="sm" disabled={pending} onClick={() => remove(e.id)}>
                          Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                          Keep
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" aria-label={`Delete check from ${fmt.format(new Date(e.createdAt))}`} onClick={() => setConfirmId(e.id)}>
                        <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
                        </svg>
                      </Button>
                    )}
                  </div>
                  <EntryKeywords found={e.found} missing={e.missing} />
                </li>
              ))}
            </ul>
            {entries.length > shown.length ? (
              <Button variant="secondary" size="sm" className="self-start" onClick={() => setShowAll(true)}>
                Show all {entries.length} checks
              </Button>
            ) : null}
          </div>
        ) : null}
      </details>
    </li>
  );
}

/** An entry's keyword chips, rendered only while expanded. */
function EntryKeywords({ found, missing }: { found: string[]; missing: string[] }) {
  const [open, setOpen] = useState(false);
  if (!found.length && !missing.length) return null;
  return (
    <details className="group/miss mt-2" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
        Show keywords
      </summary>
      {open ? (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {found.map((t) => (
            <span key={`f-${t}`} className="rounded-full bg-moss-soft px-2.5 py-1 text-xs text-moss-strong">
              {t}
            </span>
          ))}
          {missing.map((t) => (
            <span key={`m-${t}`} className="rounded-full bg-coral-soft px-2.5 py-1 text-xs text-ink">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </details>
  );
}
