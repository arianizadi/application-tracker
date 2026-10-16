"use client";

import type { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState, type ClipboardEvent, type ReactNode } from "react";

import { useCelebrate } from "@/components/fx";
import { Mascot } from "@/components/mascots";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { useBottomUi } from "@/hooks/use-bottom-ui";
import { createApplication, updateApplication } from "@/lib/applications/actions";
import { STATUS_TOAST, plantedMessage } from "@/lib/applications/copy";
import { addDaysToKey, daysBetweenKeys, formatDateKey, relativeDays } from "@/lib/applications/dates";
import { DIRTY_FIELDS, MAX, SOURCE_SUGGESTIONS, WORK_MODES, WORK_MODE_LABEL, resumeLabel } from "@/lib/applications/schema";
import type { ApplicationFormState, ApplicationFormValues, FieldErrors, ResumeOption } from "@/lib/applications/types";
import { looksLikeUrl, parseJobUrl, type JobUrlGuess } from "@/lib/applications/url-parse";
import { ACTIVE_STATUSES, STATUS_META } from "@/lib/status";

import { HeartsInput } from "./hearts";
import { AppIcon } from "./icons";

const FIELDS = Object.keys({
  company: 0, role: 0, status: 0, appliedAt: 0, location: 0, workMode: 0, url: 0, source: 0, salary: 0,
  excitement: 0, contactName: 0, notes: 0, deadline: 0, followUpAt: 0, resumeId: 0,
} satisfies Record<keyof ApplicationFormValues, 0>) as (keyof ApplicationFormValues)[];

const FIELD_LABEL: Record<keyof ApplicationFormValues, string> = {
  company: "Company", role: "Role", status: "Status", appliedAt: "Applied on", location: "Location", workMode: "Work setup",
  url: "Job link", source: "Found it on", salary: "Pay", excitement: "Excitement", contactName: "Contact", notes: "Notes",
  deadline: "Deadline", followUpAt: "Follow-up", resumeId: "Resume",
};

function listLabels(keys: (keyof ApplicationFormValues)[]): string {
  const labels = keys.map((k) => FIELD_LABEL[k]);
  return labels.length <= 1 ? (labels[0] ?? "") : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * Full create/edit form. Every keystroke is kept as a draft on this device
 * (useAutosave) until the server save succeeds, so closing the tab loses nothing.
 */
export function ApplicationForm({
  mode,
  id,
  initial,
  resumes,
  todayKey,
  autosaveKey,
  cancelHref = "/applications",
}: {
  mode: "create" | "edit";
  id?: string;
  initial: ApplicationFormValues;
  resumes: ResumeOption[];
  todayKey: string;
  autosaveKey: string;
  cancelHref?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { celebrate } = useCelebrate();
  const { value: v, setValue, restored, savedAt, conflicts, clear, reset } = useAutosave<ApplicationFormValues>(autosaveKey, initial);
  const [guess, setGuess] = useState<JobUrlGuess | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveBarRef = useRef<HTMLDivElement>(null);
  // Toasts ("Saved") stack above the save bar instead of covering it.
  useBottomUi(saveBarRef);

  // Only edited fields are written on save, so values changed elsewhere stay put.
  const dirtyFields = useMemo(() => FIELDS.filter((k) => v[k] !== initial[k]), [v, initial]);
  const dirty = dirtyFields.length > 0;

  const [state, formAction, pending] = useActionState<ApplicationFormState, FormData>(async (prev, formData) => {
    const res = mode === "create" ? await createApplication(prev, formData) : await updateApplication(id ?? "", prev, formData);
    if (res?.ok) {
      clear();
      if (mode === "create") {
        const planted = v.status === "WISHLIST" ? null : plantedMessage(res.submitted ?? 0, res.submitted ?? 0);
        if (planted?.tone === "celebrate") toast(planted);
        else {
          toast({
            title: v.status === "WISHLIST" ? "Saved to your wishlist" : "Planted!",
            body: v.status === "APPLIED" ? "Sent. The effort is yours, whatever happens next." : STATUS_TOAST[v.status].body,
            tone: "celebrate",
          });
        }
        if (v.status !== "WISHLIST") celebrate("plant", { quiet: true });
        router.push(`/applications/${res.id}`);
      } else {
        toast({ title: "Saved", body: "Saved to your account. You may close the tab with confidence.", tone: "success" });
      }
    }
    return res;
  }, undefined);

  const errors: FieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const formError = state && !state.ok ? state.error : undefined;

  // Server errors render near the top of a long form; bring the first one into view.
  useEffect(() => {
    if (!state || state.ok) return;
    const form = formRef.current;
    const el =
      form?.querySelector<HTMLElement>(':is(input, select, textarea)[aria-invalid="true"]') ?? form?.querySelector<HTMLElement>("[data-form-error]");
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [state]);

  function applyUrl(text: string) {
    const g = parseJobUrl(text);
    if (!g) return;
    setGuess(g);
    setValue((prev) => ({
      ...prev,
      url: g.url,
      company: prev.company.trim() ? prev.company : (g.company ?? ""),
      role: prev.role.trim() ? prev.role : (g.role ?? ""),
      source: prev.source.trim() ? prev.source : (g.source ?? ""),
    }));
  }

  function onPasteUrl(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (looksLikeUrl(text)) {
      e.preventDefault();
      applyUrl(text);
    }
  }

  const err = (name: keyof FieldErrors) => ({
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const savedTime = savedAt ? new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  const followDays = v.followUpAt ? daysBetweenKeys(todayKey, v.followUpAt) : null;
  const deadlineDays = v.deadline ? daysBetweenKeys(todayKey, v.deadline) : null;
  const submitted = v.status !== "WISHLIST";

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
      {mode === "edit" ? <input type="hidden" name={DIRTY_FIELDS} value={dirtyFields.join(",")} /> : null}

      {conflicts.length ? (
        <p role="status" className="rounded-2xl border border-sky/50 bg-sky-soft px-4 py-3 text-sm text-ink">
          <span className="font-semibold">{listLabels(conflicts)} changed since your draft</span>, so I kept the newer saved value
          {conflicts.length === 1 ? "" : "s"}. Re-enter your edit if you still want it.
        </p>
      ) : null}

      {restored && dirty ? (
        <div role="status" className="flex animate-rise items-center gap-3 rounded-2xl border border-sun/50 bg-sun-soft px-4 py-3">
          <Mascot name="clover" mood="happy" className="size-10 shrink-0" />
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">I kept your draft warm.</span>{" "}
            <span className="text-ink-soft">{savedTime ? `Restored from ${savedTime}. ` : ""}It isn&apos;t saved to your account yet.</span>
          </p>
          <button type="button" onClick={reset} className="h-10 shrink-0 rounded-full px-3 text-sm font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline">
            Discard
          </button>
        </div>
      ) : null}

      {formError ? (
        <p role="alert" data-form-error tabIndex={-1} className="rounded-2xl border border-coral/30 bg-coral-soft px-4 py-3 text-sm text-coral-ink focus:outline-none">
          {formError} Your draft is still saved on this device.
        </p>
      ) : null}

      <Section title="The basics" description="Only these two are required.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company" error={errors.company}>
            <Input
              id="company"
              name="company"
              required
              maxLength={MAX.company}
              autoComplete="organization"
              value={v.company}
              onChange={(e) => setValue({ company: e.target.value })}
              onPaste={onPasteUrl}
              placeholder="e.g. CrowdStrike"
              {...err("company")}
            />
          </Field>
          <Field label="Role" htmlFor="role" error={errors.role}>
            <Input
              id="role"
              name="role"
              required
              maxLength={MAX.role}
              autoComplete="off"
              value={v.role}
              onChange={(e) => setValue({ role: e.target.value })}
              onPaste={onPasteUrl}
              placeholder="e.g. Security Engineering Intern"
              {...err("role")}
            />
          </Field>
        </div>

        {mode === "create" ? (
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium text-ink-soft">Where is it at?</legend>
            <div className="flex flex-wrap gap-2">
              {ACTIVE_STATUSES.map((s) => (
                <ChoiceChip key={s} name="status" value={s} checked={v.status === s} onChange={() => setValue({ status: s as ApplicationStatus })} dot={STATUS_META[s].dot}>
                  {STATUS_META[s].label}
                </ChoiceChip>
              ))}
            </div>
          </fieldset>
        ) : null}

        {submitted ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Applied on"
              htmlFor="appliedAt"
              error={errors.appliedAt}
              hint={v.appliedAt === todayKey ? "Marked as applied today." : v.appliedAt ? `That was ${relativeDays(daysBetweenKeys(todayKey, v.appliedAt))}.` : "Leave blank for today."}
            >
              <Input id="appliedAt" name="appliedAt" type="date" max={todayKey} value={v.appliedAt} onChange={(e) => setValue({ appliedAt: e.target.value })} {...err("appliedAt")} />
            </Field>
          </div>
        ) : (
          <input type="hidden" name="appliedAt" value="" />
        )}
      </Section>

      <Section title="The posting" description="Paste the link and we'll fill in what it reveals.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Job link"
            htmlFor="url"
            error={errors.url}
            hint={guess?.platform ? `Recognized ${guess.platform}${guess.company ? " — filled in the company" : ""}. Double-check it.` : "Optional. Greenhouse, Lever, Workday, Ashby, LinkedIn and Handshake links get extra help."}
            className="sm:col-span-2"
          >
            <Input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              maxLength={MAX.url}
              value={v.url}
              onChange={(e) => {
                setValue({ url: e.target.value });
                if (guess) setGuess(null);
              }}
              onPaste={onPasteUrl}
              onBlur={() => v.url && !guess && applyUrl(v.url)}
              placeholder="https://"
              {...err("url")}
            />
          </Field>
          <Field label="Location" htmlFor="location" error={errors.location}>
            <Input id="location" name="location" maxLength={MAX.location} value={v.location} onChange={(e) => setValue({ location: e.target.value })} placeholder="e.g. Austin, TX" {...err("location")} />
          </Field>
          <Field label="Found it on" htmlFor="source" error={errors.source}>
            <Input id="source" name="source" list="source-options" maxLength={MAX.source} value={v.source} onChange={(e) => setValue({ source: e.target.value })} placeholder="LinkedIn, referral, career fair…" {...err("source")} />
            <datalist id="source-options">
              {SOURCE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <fieldset className="sm:col-span-2" aria-describedby={errors.workMode ? "workMode-error" : undefined}>
            <legend className="mb-2 text-sm font-medium text-ink-soft">Work setup</legend>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m) => (
                <ChoiceChip key={m} name="workMode" value={m} checked={v.workMode === m} onChange={() => setValue({ workMode: m })}>
                  {WORK_MODE_LABEL[m]}
                </ChoiceChip>
              ))}
              <ChoiceChip name="workMode" value="" checked={v.workMode === ""} onChange={() => setValue({ workMode: "" })}>
                Not sure
              </ChoiceChip>
            </div>
            {errors.workMode ? (
              <p id="workMode-error" className="mt-1.5 text-sm text-coral-ink">
                {errors.workMode}
              </p>
            ) : null}
          </fieldset>
          <Field label="Pay" htmlFor="salary" error={errors.salary} hint="Optional. Hourly, stipend, whatever they listed.">
            <Input id="salary" name="salary" maxLength={MAX.salary} value={v.salary} onChange={(e) => setValue({ salary: e.target.value })} placeholder="e.g. $32/hr" {...err("salary")} />
          </Field>
          <Field label="Contact or recruiter" htmlFor="contactName" error={errors.contactName}>
            <Input id="contactName" name="contactName" maxLength={MAX.contactName} value={v.contactName} onChange={(e) => setValue({ contactName: e.target.value })} placeholder="e.g. Jordan from campus recruiting" {...err("contactName")} />
          </Field>
        </div>
      </Section>

      <Section title="How excited are you?" description="Be honest. It helps you prioritize, not judge.">
        <HeartsInput
          name="excitement"
          value={Number(v.excitement) || 3}
          onChange={(n) => setValue({ excitement: String(n) })}
          describedBy={errors.excitement ? "excitement-error" : undefined}
        />
        {errors.excitement ? (
          <p id="excitement-error" className="mt-1.5 text-sm text-coral-ink">
            {errors.excitement}
          </p>
        ) : null}
      </Section>

      <Section title="Dates & reminders" description="Unknown is a valid answer. Leave them blank.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Application deadline"
            htmlFor="deadline"
            error={errors.deadline}
            hint={deadlineDays !== null ? `${formatDateKey(v.deadline, todayKey)} — ${relativeDays(deadlineDays)}.` : "If they listed one."}
          >
            <Input id="deadline" name="deadline" type="date" value={v.deadline} onChange={(e) => setValue({ deadline: e.target.value })} {...err("deadline")} />
          </Field>
          <Field
            label="Follow up on"
            htmlFor="followUpAt"
            error={errors.followUpAt}
            hint={followDays !== null ? `${formatDateKey(v.followUpAt, todayKey)} — ${relativeDays(followDays)}.` : "We'll flag it on the board when it's time."}
          >
            <Input id="followUpAt" name="followUpAt" type="date" value={v.followUpAt} onChange={(e) => setValue({ followUpAt: e.target.value })} {...err("followUpAt")} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Remind me in</span>
          {[
            { label: "1 week", days: 7 },
            { label: "2 weeks", days: 14 },
            { label: "3 weeks", days: 21 },
          ].map((o) => (
            <button
              key={o.days}
              type="button"
              onClick={() => setValue({ followUpAt: addDaysToKey(todayKey, o.days) })}
              className={`h-11 rounded-full border px-3 text-xs font-medium transition-colors sm:h-9 ${
                v.followUpAt === addDaysToKey(todayKey, o.days) ? "border-moss bg-moss-soft text-moss-strong" : "border-line bg-card text-ink-soft hover:border-line-strong"
              }`}
            >
              {o.label}
            </button>
          ))}
          {v.followUpAt ? (
            <button type="button" onClick={() => setValue({ followUpAt: "" })} className="h-11 rounded-full px-2 text-xs font-medium text-muted hover:text-ink sm:h-9">
              Clear
            </button>
          ) : null}
        </div>
      </Section>

      <Section title="Resume version" description="Know exactly which resume you sent when they call.">
        {resumes.length ? (
          <Field label="Resume sent" htmlFor="resumeId" error={errors.resumeId}>
            <Select id="resumeId" name="resumeId" value={v.resumeId} onChange={(e) => setValue({ resumeId: e.target.value })} {...err("resumeId")}>
              <option value="">{submitted ? "I don't remember / none" : "Decide later"}</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {resumeLabel(r)}
                  {r.isDefault ? " (default)" : ""}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
            <input type="hidden" name="resumeId" value="" />
            No resume versions yet.
            <Link href="/resumes" className="font-medium text-moss underline-offset-4 hover:underline">
              Add one in Resumes
            </Link>
            to link it here.
          </p>
        )}
      </Section>

      <Section title="Notes" description="Interview questions, people you met, why you want it.">
        <Field label="Notes" htmlFor="notes" error={errors.notes} hint={`${v.notes.length.toLocaleString("en-US")} / ${MAX.notes.toLocaleString("en-US")}`}>
          <Textarea id="notes" name="notes" rows={6} maxLength={MAX.notes} value={v.notes} onChange={(e) => setValue({ notes: e.target.value })} placeholder="Anything future-you will want to remember." {...err("notes")} />
        </Field>
      </Section>

      <div ref={saveBarRef} className="sticky bottom-[calc(var(--dock-bottom)+0.5rem)] z-30 -mx-1 flex items-center gap-3 rounded-2xl border border-line bg-card/95 p-2.5 pl-4 shadow-lift backdrop-blur-md md:bottom-4">
        <p className="min-w-0 flex-1 truncate text-xs text-muted" aria-live="polite">
          {pending ? (
            "Saving…"
          ) : dirty && savedTime ? (
            <>
              <AppIcon name="check" className="mr-1 inline size-3.5 align-[-2px] text-moss" />
              Draft saved on this device · {savedTime}
            </>
          ) : dirty ? (
            "Unsaved changes"
          ) : mode === "edit" ? (
            "All changes saved to your account"
          ) : (
            "Drafts save on this device as you type"
          )}
        </p>
        <Link href={cancelHref} className="hidden h-11 items-center rounded-full px-4 text-sm font-medium text-ink-soft hover:bg-paper-2 sm:flex">
          {mode === "create" ? "Cancel" : "Back"}
        </Link>
        <button
          type="submit"
          disabled={pending || (mode === "edit" && !dirty)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-moss px-5 text-sm font-semibold text-paper shadow-soft transition-[background-color,transform] hover:bg-moss-strong active:scale-[0.97] disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? (v.status === "WISHLIST" ? "Save to wishlist" : "Plant it") : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
      <h2 className="text-lg font-semibold leading-tight">{title}</h2>
      {description ? <p className="mb-4 mt-1 text-sm text-muted">{description}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

function ChoiceChip({
  name,
  value,
  checked,
  onChange,
  dot,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  dot?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
        checked ? "border-moss bg-moss-soft text-moss-strong" : "border-line-strong bg-card text-ink-soft hover:bg-paper-2"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {dot ? <span aria-hidden className={`size-2 rounded-full ${dot}`} /> : null}
      {children}
    </label>
  );
}
