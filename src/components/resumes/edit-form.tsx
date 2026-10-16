"use client";

import { useId, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { updateResume, type ResumeActionState } from "@/lib/resumes/actions";
import { countWords } from "@/lib/resumes/text";

const MAX_TEXT = 60_000;

/**
 * Edits a version's label and notes (and, with `includeText`, its extracted
 * text). Autosaves to this device per version until saved or discarded.
 */
export function EditResumeForm({
  id,
  version,
  label,
  notes,
  text,
  includeText = false,
  onDone,
}: {
  id: string;
  version: number;
  label: string;
  notes: string | null;
  text?: string;
  includeText?: boolean;
  onDone?: () => void;
}) {
  const initial = { label, notes: notes ?? "", text: text ?? "" };
  const { value, setValue, restored, savedAt, clear, reset } = useAutosave(`resume:edit:${id}${includeText ? ":text" : ""}`, initial);
  const [result, setResult] = useState<ResumeActionState>(undefined);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const uid = useId();
  const errors = result?.fieldErrors ?? {};
  const dirty = value.label !== initial.label || value.notes !== initial.notes || (includeText && value.text !== initial.text);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.label.trim()) {
      setResult({ fieldErrors: { label: "Give this version a name Future You will understand." } });
      return;
    }
    const fd = new FormData();
    fd.set("id", id);
    fd.set("label", value.label);
    fd.set("notes", value.notes);
    if (includeText) fd.set("text", value.text);
    startTransition(async () => {
      let res: ResumeActionState;
      try {
        res = await updateResume(undefined, fd);
      } catch {
        res = { error: "Couldn't save — check your connection. Your edits are still here." };
      }
      setResult(res);
      if (!res?.ok) return;
      clear();
      toast({ tone: res.warning ? "warning" : "success", title: `v${version} updated`, body: res.warning ?? "Nib re-filed it neatly." });
      onDone?.();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {restored && dirty ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky/40 bg-sky-soft px-3.5 py-2 text-sm">
          <span>Restored your unsaved edits.</span>
          <button type="button" onClick={reset} className="min-h-11 rounded-lg px-2 font-medium text-ink-soft underline underline-offset-4 hover:text-ink">
            Discard
          </button>
        </div>
      ) : null}

      <Field label="Version name" htmlFor={`${uid}-label`} error={errors.label}>
        <Input
          id={`${uid}-label`}
          value={value.label}
          onChange={(e) => setValue({ label: e.target.value })}
          maxLength={80}
          required
          aria-invalid={Boolean(errors.label)}
          autoComplete="off"
        />
      </Field>
      <Field label="Notes" htmlFor={`${uid}-notes`} error={errors.notes} hint="What changed, who it's for, what you'd tweak next.">
        <Textarea id={`${uid}-notes`} value={value.notes} onChange={(e) => setValue({ notes: e.target.value })} maxLength={2000} rows={3} />
      </Field>
      {includeText ? (
        <Field
          label="Resume text"
          htmlFor={`${uid}-text`}
          error={errors.text}
          hint={`${countWords(value.text).toLocaleString()} words. This is what the analyzer reads — the PDF itself stays untouched.`}
        >
          <Textarea
            id={`${uid}-text`}
            value={value.text}
            onChange={(e) => setValue({ text: e.target.value.slice(0, MAX_TEXT) })}
            maxLength={MAX_TEXT}
            rows={14}
            spellCheck={false}
            aria-invalid={Boolean(errors.text)}
            className="font-mono text-[13px]"
          />
        </Field>
      ) : null}

      {result?.error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral-ink">
          {result.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span aria-live="polite" className="text-center text-xs text-muted sm:text-left">
          {pending ? "Saving…" : savedAt && dirty ? "Draft saved on this device" : " "}
        </span>
        <div className="flex gap-2">
          {onDone ? (
            <Button variant="ghost" onClick={onDone} disabled={pending} className="flex-1 sm:flex-none">
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={pending || !dirty} className="flex-1 sm:flex-none">
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
