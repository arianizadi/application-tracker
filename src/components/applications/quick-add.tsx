"use client";

import { useState, useTransition, type ClipboardEvent, type FormEvent, type RefObject } from "react";

import { Mascot } from "@/components/mascots";
import { inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { quickAddApplication } from "@/lib/applications/actions";
import { plantedMessage } from "@/lib/applications/copy";
import { MAX } from "@/lib/applications/schema";
import type { ApplicationListItem } from "@/lib/applications/types";
import { looksLikeUrl, parseJobUrl, type JobUrlGuess } from "@/lib/applications/url-parse";
import { radioKeyNav } from "@/lib/radio-keys";

import { AppIcon } from "./icons";
import { Sprout } from "./sprout";
import { usePreference } from "./use-preference";

type QuickStatus = "APPLIED" | "WISHLIST";
const QUICK_STATUSES = ["APPLIED", "WISHLIST"] as const satisfies readonly QuickStatus[];
const EMPTY = { company: "", role: "", url: "" };

/**
 * Company + role + optional link, Enter to save. Pasting a job link into any
 * field files it under "link" and fills what the URL reveals.
 */
export function QuickAdd({
  companyRef,
  onOptimisticAdd,
  onAdded,
}: {
  companyRef: RefObject<HTMLInputElement | null>;
  onOptimisticAdd: (item: ApplicationListItem) => void;
  onAdded: (item: ApplicationListItem) => void;
}) {
  const { value, setValue, restored, savedAt, reset } = useAutosave("application:quick", EMPTY);
  const [status, setStatus] = usePreference<QuickStatus>("canopy:quickadd:status", "APPLIED", QUICK_STATUSES);
  const [guess, setGuess] = useState<JobUrlGuess | null>(null);
  const [error, setError] = useState<{ field: "company" | "role" | "form"; message: string } | null>(null);
  const [plantKey, setPlantKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function applyUrl(text: string) {
    const g = parseJobUrl(text);
    if (!g) {
      setValue({ url: text.trim() });
      return;
    }
    setGuess(g);
    setValue((prev) => ({
      ...prev,
      url: g.url,
      company: prev.company.trim() ? prev.company : (g.company ?? prev.company),
      role: prev.role.trim() ? prev.role : (g.role ?? prev.role),
    }));
  }

  function onPasteLink(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (looksLikeUrl(text)) {
      e.preventDefault();
      applyUrl(text);
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const company = value.company.trim();
    const role = value.role.trim();
    if (!company) {
      setError({ field: "company", message: "Which company?" });
      companyRef.current?.focus();
      return;
    }
    if (!role) {
      setError({ field: "role", message: "What's the role?" });
      document.getElementById("qa-role")?.focus();
      return;
    }
    setError(null);

    const now = new Date();
    const temp: ApplicationListItem = {
      id: `temp:${now.getTime()}`,
      company,
      role,
      status,
      workMode: null,
      location: null,
      source: guess?.source ?? null,
      url: value.url || null,
      excitement: 3,
      deadline: null,
      followUpAt: null,
      appliedAt: status === "APPLIED" ? now : null,
      resumeId: null,
      createdAt: now,
      updatedAt: now,
      history: [{ status, at: now }],
    };

    startTransition(async () => {
      onOptimisticAdd(temp);
      const res = await quickAddApplication({ company, role, url: value.url || undefined, source: guess?.source, status });
      if (!res.ok) {
        setError({ field: "form", message: res.error });
        toast({ title: "Couldn't plant that one", body: `${res.error} Your entry is still in the form.`, tone: "warning" });
        return;
      }
      reset();
      setGuess(null);
      setPlantKey((k) => k + 1);
      onAdded(res.data.item);
      toast(
        status === "WISHLIST"
          ? { title: "Saved to your wishlist", body: "A seed for later. Acorn filed it.", tone: "success" }
          : plantedMessage(res.data.total, res.data.total),
      );
      companyRef.current?.focus();
    });
  }

  const savedTime = savedAt ? new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const hasText = Boolean(value.company || value.role || value.url);

  return (
    <form onSubmit={submit} noValidate aria-label="Quick add an application" className="rounded-3xl border border-line bg-card p-3 shadow-soft sm:p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <Mascot name="clover" mood={pending ? "think" : plantKey ? "cheer" : "idle"} className="size-9 shrink-0" animate={false} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Quick add</p>
          <p className="line-clamp-2 text-xs leading-snug text-muted sm:truncate">Company, role, Enter. Paste a job link and we&apos;ll fill what we can.</p>
        </div>
        <div role="radiogroup" aria-label="Status for quick add" className="inline-flex shrink-0 rounded-full border border-line bg-paper-2 p-0.5 text-xs">
          {QUICK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={status === s}
              tabIndex={status === s ? 0 : -1}
              onClick={() => setStatus(s)}
              onKeyDown={(e) => radioKeyNav(e, QUICK_STATUSES, status, setStatus)}
              className={`h-10 rounded-full px-3 font-medium transition-colors sm:h-8 ${status === s ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"}`}
            >
              {s === "APPLIED" ? "Applied" : "Wishlist"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.15fr_auto]">
        <div>
          <label htmlFor="qa-company" className="sr-only">
            Company
          </label>
          <input
            ref={companyRef}
            id="qa-company"
            value={value.company}
            onChange={(e) => setValue({ company: e.target.value })}
            onPaste={onPasteLink}
            placeholder="Company"
            autoComplete="off"
            maxLength={MAX.company}
            aria-invalid={error?.field === "company" || undefined}
            aria-describedby={error?.field === "company" ? "qa-error" : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="qa-role" className="sr-only">
            Role
          </label>
          <input
            id="qa-role"
            value={value.role}
            onChange={(e) => setValue({ role: e.target.value })}
            onPaste={onPasteLink}
            placeholder="Role"
            autoComplete="off"
            maxLength={MAX.role}
            aria-invalid={error?.field === "role" || undefined}
            aria-describedby={error?.field === "role" ? "qa-error" : undefined}
            className={inputClass}
          />
        </div>
        <div className="relative col-span-2 sm:col-span-1">
          <label htmlFor="qa-url" className="sr-only">
            Job link (optional)
          </label>
          <AppIcon name="link" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="qa-url"
            value={value.url}
            onChange={(e) => {
              setValue({ url: e.target.value });
              if (guess) setGuess(null);
            }}
            onPaste={onPasteLink}
            onBlur={() => value.url && !guess && applyUrl(value.url)}
            placeholder="Paste a job link (optional)"
            inputMode="url"
            autoComplete="off"
            maxLength={MAX.url}
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-moss px-5 text-sm font-semibold text-paper shadow-soft transition-[background-color,transform] hover:bg-moss-strong active:scale-[0.97] disabled:opacity-70 sm:col-span-1 sm:h-auto"
        >
          <Sprout key={plantKey} play={plantKey > 0} className="-my-1 size-6" />
          {pending ? "Planting…" : "Plant"}
        </button>
      </div>

      <div className="mt-2 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs" aria-live="polite">
        {error ? (
          <p id="qa-error" role="alert" className="text-coral-ink">
            {error.message}
          </p>
        ) : guess?.platform ? (
          <p className="text-moss">
            <AppIcon name="sparkle" className="mr-1 inline size-3.5 align-[-2px]" />
            Recognized {guess.platform}
            {guess.company ? " — filled in the company" : ""}
            {guess.role ? " and role" : ""}. Double-check it.
          </p>
        ) : null}
        {restored && hasText ? (
          <p className="text-muted">
            I kept your draft warm.{" "}
            <button
              type="button"
              onClick={reset}
              className="relative font-medium text-ink-soft underline underline-offset-2 after:absolute after:-inset-3 after:content-[''] hover:text-ink"
            >
              Discard
            </button>
          </p>
        ) : savedTime && hasText ? (
          <p className="text-muted">Draft saved on this device</p>
        ) : null}
        <p className="ml-auto hidden text-muted sm:block">
          <kbd className="rounded border border-line bg-paper-2 px-1 font-mono text-[10px]">N</kbd> full form ·{" "}
          <kbd className="rounded border border-line bg-paper-2 px-1 font-mono text-[10px]">/</kbd> search
        </p>
      </div>
    </form>
  );
}
