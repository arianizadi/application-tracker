"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { inputClass, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { runAnalysis, type RunAnalysisResult } from "@/lib/analyzer/actions";
import type { PresetGroup } from "@/lib/analyzer/presets";

import { AnalysisResults } from "./analysis-results";

export type ResumeOption = { id: string; label: string; version: number; isDefault: boolean };

type Draft = {
  source: "saved" | "paste";
  pastedResume: string;
  mode: "preset" | "jd";
  preset: string;
  jd: string;
  title: string;
  extra: string[];
};

const RESUME_MAX = 60_000;
const JD_MAX = 30_000;
const MIN_TEXT = 40;

function Step({ n, title, children, hint }: { n: number; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-moss text-sm font-bold text-paper tabular">
          {n}
        </span>
        <div className="min-w-0">
          <h2 id={`step-${n}`} className="text-lg font-semibold leading-tight">
            {title}
          </h2>
          {hint ? <p className="mt-0.5 text-sm text-muted">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function radioCard(checked: boolean) {
  return `relative flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus ${
    checked ? "border-moss bg-moss-soft/70" : "border-line hover:border-line-strong hover:bg-paper-2/50"
  }`;
}

function Dot({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-moss" : "border-line-strong"}`}>
      {checked ? <span className="size-2 rounded-full bg-moss" /> : null}
    </span>
  );
}

function SavedNote({ savedAt, show }: { savedAt: number | null; show: boolean }) {
  if (!show || !savedAt) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted" aria-live="polite">
      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 text-moss" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      Draft saved on this device
    </span>
  );
}

export function AnalyzerWorkbench({
  resumes,
  initialResumeId,
  groups,
  defaultPreset,
}: {
  resumes: ResumeOption[];
  initialResumeId: string | null;
  groups: PresetGroup[];
  defaultPreset: string;
}) {
  const toast = useToast();
  const [resumeId, setResumeId] = useState<string | null>(initialResumeId);
  const { value: d, setValue, restored, savedAt, reset } = useAutosave<Draft>("analyzer:target", {
    source: resumes.length ? "saved" : "paste",
    pastedResume: "",
    mode: "preset",
    preset: defaultPreset,
    jd: "",
    title: "",
    extra: [],
  });
  const [extraInput, setExtraInput] = useState("");
  const [outcome, setOutcome] = useState<Extract<RunAnalysisResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement>(null);
  const runCount = useRef(0);
  const [runKey, setRunKey] = useState(0);

  const source = resumes.length ? d.source : "paste";
  const presetKnown = groups.some((g) => g.presets.some((p) => p.key === d.preset));
  const preset = presetKnown ? d.preset : defaultPreset;
  const selectedResume = resumes.find((r) => r.id === resumeId) ?? null;

  const resumeReady = source === "saved" ? Boolean(selectedResume) : d.pastedResume.trim().length >= MIN_TEXT;
  const targetReady = d.mode === "preset" ? Boolean(preset) : d.jd.trim().length >= MIN_TEXT;
  const ready = resumeReady && targetReady && !pending;

  useEffect(() => {
    if (!runKey || !resultsRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    resultsRef.current.focus({ preventScroll: true });
  }, [runKey]);

  function addExtra() {
    const parts = extraInput
      .split(/[,\n]/)
      .map((s) => s.replace(/\s+/g, " ").trim().slice(0, 60))
      .filter(Boolean);
    if (!parts.length) return;
    setValue((prev) => {
      const next = [...prev.extra];
      for (const p of parts) if (!next.some((x) => x.toLowerCase() === p.toLowerCase()) && next.length < 12) next.push(p);
      return { ...prev, extra: next };
    });
    setExtraInput("");
  }

  function run() {
    if (!ready) return;
    setError(null);
    const input = {
      ...(source === "saved" && selectedResume ? { resumeId: selectedResume.id } : { resumeText: d.pastedResume.slice(0, RESUME_MAX) }),
      ...(d.mode === "preset" ? { preset } : { jobDescription: d.jd.slice(0, JD_MAX), title: d.title.trim() || undefined }),
      extraTerms: d.extra.length ? d.extra : undefined,
    };
    startTransition(async () => {
      try {
        const res = await runAnalysis(input);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setOutcome(res);
        runCount.current += 1;
        setRunKey(runCount.current);
        if (!res.id) toast({ tone: "warning", title: "Couldn't save to history", body: "Your result is below. Try again later to keep it." });
      } catch {
        setError("Couldn't reach the server. Your draft is still saved on this device, so try again in a moment.");
      }
    });
  }

  const userGroup = groups[0];
  const otherGroups = groups.slice(1);
  const presetLabel = groups.flatMap((g) => g.presets).find((p) => p.key === preset)?.label;

  return (
    <div className="flex flex-col gap-5">
      {restored ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky/50 bg-sky-soft px-4 py-3 text-sm" role="status">
          <span>Restored your draft from last time.</span>
          <Button variant="ghost" size="sm" onClick={reset}>
            Discard draft
          </Button>
        </div>
      ) : null}

      <Step n={1} title="Pick a resume" hint="Default version is preselected. Pasted text works too.">
        {resumes.length ? (
          <fieldset>
            <legend className="sr-only">Resume source</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {resumes.map((r) => {
                const checked = source === "saved" && resumeId === r.id;
                return (
                  <label key={r.id} className={radioCard(checked)}>
                    <input
                      type="radio"
                      name="resume"
                      className="sr-only"
                      checked={checked}
                      onChange={() => {
                        setResumeId(r.id);
                        setValue({ source: "saved" });
                      }}
                    />
                    <Dot checked={checked} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        v{r.version} · {r.label}
                      </span>
                      {r.isDefault ? <span className="mt-0.5 block text-xs text-moss">Default version</span> : null}
                    </span>
                  </label>
                );
              })}
              <label className={radioCard(source === "paste")}>
                <input type="radio" name="resume" className="sr-only" checked={source === "paste"} onChange={() => setValue({ source: "paste" })} />
                <Dot checked={source === "paste"} />
                <span className="font-medium text-ink">Paste text instead</span>
              </label>
            </div>
          </fieldset>
        ) : (
          <div className="mb-3 flex flex-col gap-3 rounded-2xl bg-paper-2/60 p-4 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
            <p>No saved resume versions yet. Paste your resume text below, or upload a PDF so every check stays linked to a version.</p>
            <ButtonLink href="/resumes" variant="secondary" size="sm" className="shrink-0">
              Upload a resume
            </ButtonLink>
          </div>
        )}
        {source === "paste" ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pasted-resume" className="text-sm font-medium text-ink-soft">
                Resume text
              </label>
              <SavedNote savedAt={savedAt} show={Boolean(d.pastedResume)} />
            </div>
            <Textarea
              id="pasted-resume"
              value={d.pastedResume}
              maxLength={RESUME_MAX}
              onChange={(e) => setValue({ pastedResume: e.target.value })}
              placeholder="Paste the plain text of your resume…"
              className="min-h-48"
            />
            <p className="text-xs text-muted tabular">
              {d.pastedResume.length.toLocaleString("en-US")} / {RESUME_MAX.toLocaleString("en-US")} characters · stays a draft on this device until you run a check
            </p>
          </div>
        ) : null}
      </Step>

      <Step n={2} title="Compare against" hint="A role preset for broad coverage, or a real posting for a weighted match.">
        <div role="group" aria-label="Comparison type" className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-paper-2 p-1">
          {(
            [
              ["preset", "Role preset"],
              ["jd", "Job description"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={d.mode === mode}
              onClick={() => setValue({ mode })}
              className={`min-h-11 rounded-full px-3 text-sm font-semibold transition-colors ${d.mode === mode ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {d.mode === "preset" ? (
          <div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink-soft">{userGroup?.label}</legend>
              <PresetGrid group={userGroup} value={preset} onChange={(key) => setValue({ preset: key })} />
            </fieldset>
            {otherGroups.length ? (
              <details className="group mt-4" open={otherGroups.some((g) => g.presets.some((p) => p.key === preset))}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
                  <svg viewBox="0 0 16 16" aria-hidden className="size-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m6 4 4 4-4 4" />
                  </svg>
                  Other fields
                </summary>
                <div className="mt-2 flex flex-col gap-4">
                  {otherGroups.map((g) => (
                    <fieldset key={g.track}>
                      <legend className="mb-2 text-sm font-semibold text-ink-soft">{g.label}</legend>
                      <PresetGrid group={g} value={preset} onChange={(key) => setValue({ preset: key })} />
                    </fieldset>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="jd-title" className="text-sm font-medium text-ink-soft">
                Title <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="jd-title"
                className={inputClass}
                value={d.title}
                maxLength={120}
                onChange={(e) => setValue({ title: e.target.value })}
                placeholder="e.g. SOC Analyst Intern · Acme"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="jd-text" className="text-sm font-medium text-ink-soft">
                  Job description
                </label>
                <SavedNote savedAt={savedAt} show={Boolean(d.jd)} />
              </div>
              <Textarea
                id="jd-text"
                value={d.jd}
                maxLength={JD_MAX}
                onChange={(e) => setValue({ jd: e.target.value })}
                placeholder="Paste the whole posting. Headings like “Requirements” and “Nice to have” help Rue weigh things."
                className="min-h-56"
                aria-describedby="jd-count"
              />
              <p id="jd-count" className="text-xs text-muted tabular">
                {d.jd.length.toLocaleString("en-US")} / {JD_MAX.toLocaleString("en-US")} characters · autosaved so a closed tab loses nothing
              </p>
            </div>
          </div>
        )}

        <details className="group mt-4 rounded-2xl border border-line px-4 py-1" open={d.extra.length > 0}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
            Check extra phrases {d.extra.length ? `· ${d.extra.length}` : ""}
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 4 4 4-4 4" />
            </svg>
          </summary>
          <div className="pb-3">
            <p className="mb-2 text-sm text-muted">Add a tool or requirement Rue doesn&apos;t know, like &ldquo;Security Onion&rdquo; or &ldquo;Tanium&rdquo;.</p>
            <div className="flex gap-2">
              <label htmlFor="extra-phrase" className="sr-only">
                Extra phrase
              </label>
              <input
                id="extra-phrase"
                className={`${inputClass} min-w-0 flex-1`}
                value={extraInput}
                maxLength={200}
                onChange={(e) => setExtraInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtra();
                  }
                }}
                placeholder="Comma-separated"
              />
              <Button variant="secondary" onClick={addExtra} disabled={!extraInput.trim() || d.extra.length >= 12}>
                Add
              </Button>
            </div>
            {d.extra.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.extra.map((x) => (
                  <li key={x}>
                    <button
                      type="button"
                      onClick={() => setValue((prev) => ({ ...prev, extra: prev.extra.filter((y) => y !== x) }))}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong bg-paper-2 px-3 text-sm hover:border-coral"
                    >
                      {x}
                      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="m4.5 4.5 7 7m0-7-7 7" />
                      </svg>
                      <span className="sr-only">Remove</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      </Step>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {pending
            ? "Checking recognized phrases…"
            : !resumeReady
              ? "Step 1: pick a resume version or paste at least a few lines."
              : !targetReady
                ? "Step 2: paste a bit more of the job description."
                : d.mode === "preset"
                  ? `Ready: ${selectedResume && source === "saved" ? `v${selectedResume.version}` : "pasted text"} vs ${presetLabel ?? "preset"}.`
                  : `Ready: ${selectedResume && source === "saved" ? `v${selectedResume.version}` : "pasted text"} vs your job description.`}
        </p>
        <Button size="lg" onClick={run} disabled={!ready} className="w-full sm:w-auto">
          {pending ? (
            <>
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
              Checking…
            </>
          ) : (
            "Run the check"
          )}
        </Button>
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl border border-coral/40 bg-coral-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      ) : null}

      <div ref={resultsRef} tabIndex={-1} className="scroll-mt-24 outline-none" aria-live="polite" aria-busy={pending}>
        {outcome ? (
          <div className={`transition-opacity duration-150 ${pending ? "opacity-60" : "opacity-100"}`}>
            <AnalysisResults
              key={runKey}
              result={outcome.result}
              analyzedText={outcome.analyzedText}
              resumeLabel={outcome.resume ? `Resume v${outcome.resume.version} · ${outcome.resume.label}` : "Pasted resume text"}
              saved={Boolean(outcome.id)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PresetGrid({ group, value, onChange }: { group: PresetGroup | undefined; value: string; onChange: (key: string) => void }) {
  if (!group) return null;
  return (
    <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
      {group.presets.map((p) => {
        const checked = p.key === value;
        return (
          <label key={p.key} className={radioCard(checked)}>
            <input type="radio" name="preset" className="sr-only" checked={checked} onChange={() => onChange(p.key)} />
            <Dot checked={checked} />
            <span className="min-w-0">
              <span className="block font-medium leading-snug text-ink">{p.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">
                {p.count} concepts · {p.blurb}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
