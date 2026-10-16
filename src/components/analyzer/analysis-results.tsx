"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { AnalysisResult } from "@/lib/analyzer/types";

import { KeywordChips } from "./keyword-chips";
import { rueTake, RueSays } from "./rue-says";
import { ScoreGauge } from "./score-gauge";

function CategoryBars({ result }: { result: AnalysisResult }) {
  return (
    <ul className="flex flex-col gap-1">
      {result.categoryScores.map((c) => (
        <li key={c.id}>
          <details className="group rounded-xl px-2 py-1.5 open:bg-paper-2/60">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg [&::-webkit-details-marker]:hidden">
              <span className="w-24 shrink-0 truncate text-sm font-medium text-ink sm:w-44">{c.label}</span>
              <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
                <span
                  className="absolute inset-0 rounded-full bg-moss transition-transform duration-700 ease-out motion-reduce:transition-none"
                  style={{ transform: `translateX(${Math.max(c.pct, c.pct > 0 ? 4 : 0) - 100}%)` }}
                />
              </span>
              {/* The bar shows pct, so the label leads with pct too; the raw count is secondary. */}
              <span className="w-14 shrink-0 text-right text-xs tabular sm:w-20" aria-hidden>
                <span className="font-semibold text-ink">{c.pct}%</span>
                <span className="block text-[11px] text-muted">
                  {c.found} of {c.total}
                </span>
              </span>
              <span className="sr-only">{`${c.pct}% filled, ${c.found} of ${c.total} mentioned. Show tip.`}</span>
              <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-150 group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 4 4 4-4 4" />
              </svg>
            </summary>
            <p className="px-1 pb-2 pt-1 text-sm leading-relaxed text-ink-soft">{c.tip}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function AnalysisResults({
  result,
  analyzedText,
  resumeLabel,
  saved,
}: {
  result: AnalysisResult;
  analyzedText: string;
  resumeLabel: string;
  saved: boolean;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const take = rueTake(result.score, result.limited, result.mode);

  async function copyMissing() {
    const text = result.missing.map((m) => m.term).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({ tone: "info", title: `Copied ${result.missing.length} keywords`, body: "Add them only where they're true." });
    } catch {
      toast({ tone: "warning", title: "Couldn't reach the clipboard", body: "Your browser blocked it. The list is still right there to copy by hand." });
    }
  }

  const requiredMissing = result.missing.filter((m) => m.requirement === "required").length;

  return (
    <article aria-labelledby="analysis-result-title" className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
      <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:px-6">
        <ScoreGauge
          score={result.score}
          limited={result.limited}
          caption={result.limited ? "concepts found" : result.mode === "jd" ? "keyword match" : "coverage"}
          center={result.limited ? `${result.stats.found}/${result.stats.recognized}` : undefined}
          className="mx-auto size-40 sm:mx-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{result.mode === "jd" ? "Job description" : "Role preset"}</p>
          <h2 id="analysis-result-title" className="mt-1 text-2xl font-semibold leading-tight">
            {result.title}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-moss-soft px-2.5 py-1 font-semibold text-moss-strong">{result.grade}</span>
            <span className="text-ink-soft">{result.summary}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            {resumeLabel} · {result.method}
          </p>
          {!saved ? <p className="mt-2 text-sm text-coral">This result didn&apos;t save to your history, but it&apos;s all here.</p> : null}
        </div>
      </div>

      <div className="px-5 pb-6 sm:px-6">
        <RueSays line={take.line} mood={take.mood} />
      </div>

      <Section title={result.mode === "jd" ? "By category" : "Category coverage"}>
        <CategoryBars result={result} />
      </Section>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-line">
        <Section title={`Found in your resume · ${result.found.length}`}>
          <KeywordChips items={result.found} tone="found" empty="Nothing from this list yet. That's a wording gap, not a talent gap." />
        </Section>
        <Section
          title={`Not mentioned · ${result.missing.length}`}
          aside={
            result.missing.length ? (
              <Button variant="secondary" size="sm" onClick={copyMissing} aria-live="polite">
                {copied ? "Copied" : "Copy missing keywords"}
              </Button>
            ) : null
          }
        >
          {requiredMissing ? <p className="mb-3 text-sm text-ink-soft">{requiredMissing} marked required in the posting. They&apos;re listed first.</p> : null}
          <KeywordChips items={result.missing} tone="missing" empty="Every concept on this list shows up. Rue is impressed and slightly suspicious." />
        </Section>
      </div>

      {result.flagged.length ? (
        <Section title="Worth a second look">
          <ul className="flex flex-col gap-2">
            {result.flagged.map((f) => (
              <li key={f.term} className="rounded-2xl border border-sun/50 bg-sun-soft/60 p-3 text-sm">
                <p className="font-semibold">{f.term}</p>
                <p className="mt-1 text-ink-soft">{f.reason}</p>
                <blockquote className="mt-1 border-l-2 border-sun pl-3 text-ink-soft">{f.evidence}</blockquote>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.suggestions.length ? (
        <Section title="Next steps">
          <ol className="flex flex-col gap-3">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sun-soft text-xs font-bold text-ink tabular">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {result.alternatives.length ? (
        <Section title="Either-or groups">
          <p className="mb-2 text-sm text-muted">The posting lists these as alternatives, so any one of them covers the group.</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {result.alternatives.map((g) => (
              <li key={g.join("|")} className="rounded-xl bg-paper-2/60 px-3 py-2">
                {g.join(" / ")}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {result.unrecognized.length ? (
        <Section title="Not in Rue's dictionary">
          <p className="mb-3 text-sm text-muted">Tool-looking words from the posting that weren&apos;t scored. Check them yourself.</p>
          <ul className="flex flex-wrap gap-2">
            {result.unrecognized.map((u) => (
              <li key={u.term} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm">
                {u.term}
                <span className={`text-xs ${u.inResume ? "text-moss" : "text-muted"}`}>{u.inResume ? "· on your resume" : "· not found"}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="border-t border-line px-5 py-2 sm:px-6">
        {result.bonus.length ? (
          <details className="group py-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              Bonus: strong terms on your resume this target didn&apos;t ask for · {result.bonus.length}
              <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 4 4 4-4 4" />
              </svg>
            </summary>
            <ul className="flex flex-wrap gap-2 pb-2 pt-1">
              {result.bonus.map((b) => (
                <li key={b.term} className="rounded-full border border-sky/50 bg-sky-soft px-3 py-1.5 text-sm text-ink">
                  {b.term}
                  <span className="sr-only">{`, ${b.categoryLabel}`}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <details className="group py-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            What Rue read · {result.stats.resumeWords.toLocaleString("en-US")} words
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 4 4 4-4 4" />
            </svg>
          </summary>
          <p className="mb-2 text-xs text-muted">The exact resume text that was checked. If something looks garbled, paste clean text instead.</p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-paper-2/70 p-3 font-sans text-xs leading-relaxed text-ink-soft">
            {analyzedText}
          </pre>
        </details>
      </div>

      <p className="border-t border-line bg-paper-2/40 px-5 py-4 text-sm text-ink-soft sm:px-6">
        <strong className="font-semibold text-ink">Keyword heuristic, not an ATS oracle.</strong> This checks recognized wording only. It can&apos;t judge
        skill, fit or hiring odds. Add a keyword only if you&apos;ve done it. Classes, clubs and personal projects count.
      </p>
    </article>
  );
}
