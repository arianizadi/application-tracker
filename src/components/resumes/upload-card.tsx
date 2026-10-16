"use client";

import Link from "next/link";
import { useId, useRef, useState, useTransition, type DragEvent, type FormEvent } from "react";

import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { uploadResume, type ResumeActionState } from "@/lib/resumes/actions";
import { countWords, formatBytes } from "@/lib/resumes/text";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_TEXT = 60_000;

type Draft = { mode: "file" | "text"; label: string; notes: string; text: string; makeDefault: boolean };
const EMPTY: Draft = { mode: "file", label: "", notes: "", text: "", makeDefault: false };

function checkFile(file: File): string | null {
  const looksPdf = file.type === "application/pdf" || file.type === "application/x-pdf" || (!file.type && /\.pdf$/i.test(file.name));
  if (!looksPdf) return "Only PDFs for now. Export your resume as a PDF and try again.";
  if (file.size > MAX_BYTES) return `That PDF is ${formatBytes(file.size)} — the limit is 4 MB. Try “Save as PDF” again or compress it.`;
  if (file.size === 0) return "That file is empty.";
  return null;
}

function savedLabel(savedAt: number | null) {
  if (!savedAt) return null;
  return new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * New-version uploader: drag & drop / pick a PDF, or paste text. Label, notes
 * and pasted text autosave to this device so a closed tab loses nothing.
 */
export function UploadCard({
  suggestedLabel,
  nextVersion,
  hasVersions,
}: {
  suggestedLabel: string;
  nextVersion: number;
  hasVersions: boolean;
}) {
  const { value, setValue, restored, savedAt, reset } = useAutosave<Draft>("resume:new", EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ResumeActionState>(undefined);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const id = useId();

  const errors = result?.fieldErrors ?? {};
  const hasDraft = restored && Boolean(value.label || value.notes || value.text);
  const open = expanded || !hasVersions || hasDraft;
  const textWords = value.mode === "text" ? countWords(value.text) : 0;

  function pick(next: File | null | undefined) {
    if (!next) return;
    const problem = checkFile(next);
    setFileError(problem);
    setFile(problem ? null : next);
    setResult(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const label = value.label.trim();
    const local: NonNullable<ResumeActionState>["fieldErrors"] = {};
    if (!label) local.label = "Give this version a name Future You will understand.";
    if (value.mode === "file" && !file) local.file = "Pick a PDF to upload (or switch to pasting text).";
    if (value.mode === "text" && value.text.trim().length < 80) local.text = "Paste your full resume text — that's looking a little short.";
    if (Object.keys(local).length) {
      setResult({ fieldErrors: local });
      return;
    }

    const fd = new FormData();
    fd.set("mode", value.mode);
    fd.set("label", label);
    fd.set("notes", value.notes);
    if (value.makeDefault) fd.set("makeDefault", "on");
    if (value.mode === "file" && file) fd.set("file", file);
    else fd.set("text", value.text);

    startTransition(async () => {
      let res: ResumeActionState;
      try {
        res = await uploadResume(undefined, fd);
      } catch {
        res = { error: "Upload failed — check your connection. Your draft is still here." };
      }
      setResult(res);
      if (!res?.ok) return;
      reset();
      setFile(null);
      setExpanded(false);
      const detail = [res.pages ? `${res.pages} page${res.pages === 1 ? "" : "s"}` : null, res.words ? `${res.words.toLocaleString()} words` : null]
        .filter(Boolean)
        .join(" · ");
      if (res.warning) {
        toast({ tone: "warning", title: `v${res.version} saved — with a heads-up`, body: res.warning });
      } else if (res.first) {
        toast({ tone: "celebrate", title: "Paper trail started!", body: "v1 is saved and set as your default. One very portable rectangle." });
      } else {
        toast({ tone: "success", title: `v${res.version} is in the workshop`, body: detail || "Saved before the next brilliant tweak." });
      }
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className={`flex items-center gap-3 px-5 pt-5 sm:px-6 ${open ? "" : "pb-5"}`}>
        <Mascot name="nib" mood={pending ? "think" : "idle"} className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-tight">{hasVersions ? `Save v${nextVersion}` : "Add your first resume"}</h2>
          <p className="text-sm text-muted">PDF up to 4 MB, or paste the text.</p>
        </div>
        {hasVersions && !open ? (
          <Button size="sm" onClick={() => setExpanded(true)} aria-expanded={false} aria-controls={`${id}-form`}>
            New version
          </Button>
        ) : null}
      </div>

      {result?.ok && result.warning ? (
        <div role="status" className="mx-5 mt-4 rounded-2xl border border-sun/60 bg-sun-soft px-3.5 py-3 text-sm sm:mx-6">
          <p>{result.warning}</p>
          {result.resumeId ? (
            <Link href={`/resumes/${result.resumeId}#text`} className="mt-1 inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4">
              Paste text for v{result.version}
            </Link>
          ) : null}
        </div>
      ) : null}

      <form id={`${id}-form`} onSubmit={onSubmit} noValidate className={`flex flex-col gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 ${open ? "" : "hidden"}`}>
        {hasDraft ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky/40 bg-sky-soft px-3.5 py-2 text-sm">
            <span>Restored your draft{savedAt ? ` from ${savedLabel(savedAt)}` : ""}.</span>
            <button type="button" onClick={reset} className="min-h-11 rounded-lg px-2 font-medium text-ink-soft underline underline-offset-4 hover:text-ink">
              Discard
            </button>
          </div>
        ) : null}

        <div role="group" aria-label="How to add this version" className="grid grid-cols-2 gap-1 rounded-full border border-line bg-paper-2 p-1">
          {(["file", "text"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={value.mode === mode}
              onClick={() => {
                setValue({ mode });
                setResult(undefined);
              }}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors ${
                value.mode === mode ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"
              }`}
            >
              {mode === "file" ? "Upload PDF" : "Paste text"}
            </button>
          ))}
        </div>

        {value.mode === "file" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${id}-file`}
              onDragOver={(e) => {
                e.preventDefault();
                if (!dragging) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`group relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:border-moss ${
                dragging ? "border-moss bg-moss-soft" : errors.file || fileError ? "border-coral/60 bg-coral-soft/40" : "border-line-strong bg-paper hover:border-moss/60 hover:bg-moss-soft/40"
              }`}
            >
              <input
                ref={inputRef}
                id={`${id}-file`}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                aria-describedby={`${id}-file-hint`}
                aria-invalid={Boolean(errors.file || fileError)}
                onChange={(e) => pick(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <span className="grid size-11 place-items-center rounded-xl bg-moss-soft text-moss-strong">
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                      <path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                      <path d="M14 3v4h4M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted">{formatBytes(file.size)} · tap to swap</span>
                </>
              ) : (
                <>
                  <span className={`grid size-11 place-items-center rounded-xl bg-card text-moss shadow-soft transition-transform ${dragging ? "-translate-y-1" : "group-hover:-translate-y-0.5"}`}>
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 15V4" />
                      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
                      <path d="M5 19h14" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">
                    <span className="hidden sm:inline">Drop your PDF here or </span>
                    <span className="text-moss underline underline-offset-4">choose a file</span>
                  </span>
                  <span className="text-xs text-muted">We&apos;ll read the text so the analyzer can use it.</span>
                </>
              )}
            </label>
            {file ? (
              <button type="button" onClick={() => setFile(null)} className="self-start min-h-11 px-1 text-sm text-muted underline underline-offset-4 hover:text-ink">
                Remove file
              </button>
            ) : null}
            <p id={`${id}-file-hint`} role={errors.file || fileError ? "alert" : undefined} className={`text-xs ${errors.file || fileError ? "text-coral" : "text-muted"}`}>
              {errors.file ?? fileError ?? "Files aren't part of the autosaved draft — just the details below."}
            </p>
          </div>
        ) : (
          <Field
            label="Resume text"
            htmlFor={`${id}-text`}
            error={errors.text}
            hint={value.text ? `${textWords.toLocaleString()} words · ${value.text.length.toLocaleString()} / ${MAX_TEXT.toLocaleString()} characters` : "Copy everything from your doc and paste it here."}
          >
            <Textarea
              id={`${id}-text`}
              value={value.text}
              onChange={(e) => setValue({ text: e.target.value.slice(0, MAX_TEXT) })}
              maxLength={MAX_TEXT}
              rows={8}
              spellCheck={false}
              aria-invalid={Boolean(errors.text)}
              className="font-mono text-[13px]"
              placeholder={"Jordan Rivera\nCybersecurity · jordan@school.edu\n\nEXPERIENCE\n…"}
            />
          </Field>
        )}

        <Field
          label="Version name"
          htmlFor={`${id}-label`}
          error={errors.label}
          hint={
            value.label ? undefined : (
              <>
                Try something like{" "}
                <button type="button" onClick={() => setValue({ label: suggestedLabel })} className="font-medium text-moss underline underline-offset-4">
                  {suggestedLabel}
                </button>{" "}
                — not resume_final_FINAL2.
              </>
            )
          }
        >
          <Input
            id={`${id}-label`}
            value={value.label}
            onChange={(e) => setValue({ label: e.target.value })}
            maxLength={80}
            required
            aria-invalid={Boolean(errors.label)}
            placeholder={suggestedLabel}
            autoComplete="off"
          />
        </Field>

        <Field label="What changed? (optional)" htmlFor={`${id}-notes`} error={errors.notes}>
          <Textarea
            id={`${id}-notes`}
            value={value.notes}
            onChange={(e) => setValue({ notes: e.target.value })}
            maxLength={2000}
            rows={2}
            className="min-h-16"
            placeholder="Moved projects up, added the CTF writeups…"
          />
        </Field>

        {hasVersions ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={value.makeDefault}
              onChange={(e) => setValue({ makeDefault: e.target.checked })}
              className="size-5 rounded accent-[var(--moss)]"
            />
            Make this my default for new applications
          </label>
        ) : null}

        {result?.error ? (
          <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral-ink">
            {result.error}
          </p>
        ) : null}

        <div aria-live="polite">
          {pending ? (
            <div className="flex flex-col gap-2">
              <div className="h-1.5 animate-pulse overflow-hidden rounded-full bg-moss/40" />
              <p className="text-sm text-muted">{value.mode === "file" ? "Nib is reading your PDF…" : "Filing it in the workshop…"}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center text-xs text-muted sm:text-left">{savedAt && !pending ? `Draft saved on this device · ${savedLabel(savedAt)}` : " "}</span>
          <div className="flex gap-2">
            {hasVersions && !hasDraft ? (
              <Button variant="ghost" onClick={() => setExpanded(false)} disabled={pending} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
              {pending ? "Saving…" : `Save v${nextVersion}`}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
