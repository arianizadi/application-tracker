"use client";

import { useActionState, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAutosave } from "@/hooks/use-autosave";
import { updateProfile, type SettingsFormState } from "@/lib/settings/actions";
import { NAME_MAX, WEEKLY_GOAL_MAX, WEEKLY_GOAL_MIN, timeZoneLabel } from "@/lib/settings/validation";
import { TRACKS } from "@/lib/tracks";

export type TimeZoneGroup = { region: string; zones: { value: string; offset: string }[] };

type ProfileValues = { name: string; track: string; weeklyGoal: number; timeZone: string };

function goalCopy(goal: number): string {
  if (goal <= 2) return "Gentle and sustainable. Perfect for exam season.";
  if (goal <= 5) return "A steady rhythm. Most people land right here.";
  if (goal <= 10) return "Ambitious! Remember quality beats quantity.";
  if (goal <= 20) return "Big push energy. Schedule some rest, too.";
  return "Absolute unit. Moss the sloth is a little worried about you.";
}

function sameValues(a: ProfileValues, b: ProfileValues) {
  return a.name === b.name && a.track === b.track && a.weeklyGoal === b.weeklyGoal && a.timeZone === b.timeZone;
}

export function ProfileForm({ initial, timeZones }: { initial: ProfileValues; timeZones: TimeZoneGroup[] }) {
  const toast = useToast();
  const { value, setValue, restored, savedAt, clear, reset } = useAutosave<ProfileValues>("settings:profile", initial);
  const [tzNote, setTzNote] = useState<string | null>(null);
  const goalHintId = useId();

  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(async (prev, formData) => {
    const result = await updateProfile(prev, formData);
    if (result?.ok) {
      clear();
      toast({ title: "Settings saved", body: result.message, tone: "success" });
    }
    return result;
  }, undefined);

  const errors = state?.fieldErrors ?? {};
  const dirty = !sameValues(value, initial);
  const knownZones = timeZones.flatMap((g) => g.zones.map((z) => z.value));

  function detectTimeZone() {
    let detected = "";
    try {
      detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      // Older browsers: fall through to the message below.
    }
    if (detected && knownZones.includes(detected)) {
      setValue({ timeZone: detected });
      setTzNote(detected === value.timeZone ? "Already matches this device." : `Set to ${timeZoneLabel(detected)}. Save to keep it.`);
    } else {
      setTzNote("Couldn't detect this device's time zone. Pick it from the list instead.");
    }
  }

  const goal = Math.min(WEEKLY_GOAL_MAX, Math.max(WEEKLY_GOAL_MIN, Number(value.weeklyGoal) || WEEKLY_GOAL_MIN));

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {restored && dirty ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sun/50 bg-sun-soft px-4 py-3 text-sm">
          <p>Restored your unsaved changes from last time.</p>
          <button type="button" onClick={reset} className="min-h-11 rounded-full px-3 font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Discard
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="settings-name" error={errors.name} hint="Shown on your dashboard. First name is plenty.">
          <Input
            id="settings-name"
            name="name"
            autoComplete="given-name"
            required
            maxLength={NAME_MAX}
            value={value.name}
            onChange={(e) => setValue({ name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "settings-name-error" : "settings-name-hint"}
          />
        </Field>
        <Field label="Track" htmlFor="settings-track" error={errors.track} hint="Tunes analyzer presets and prep suggestions.">
          <Select
            id="settings-track"
            name="track"
            value={value.track}
            onChange={(e) => setValue({ track: e.target.value })}
            aria-invalid={Boolean(errors.track)}
            aria-describedby={errors.track ? "settings-track-error" : "settings-track-hint"}
          >
            {TRACKS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset className="rounded-2xl border border-line bg-paper/60 p-4 sm:p-5">
        <legend className="px-1 text-sm font-medium text-ink-soft">Weekly rhythm</legend>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setValue({ weeklyGoal: Math.max(WEEKLY_GOAL_MIN, goal - 1) })}
            disabled={goal <= WEEKLY_GOAL_MIN}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-card text-xl text-ink transition-colors hover:bg-paper-2 disabled:opacity-40"
            aria-label="One fewer per week"
          >
            −
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="settings-goal" className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold leading-none tabular">{goal}</span>
              <span className="text-sm text-ink-soft">{goal === 1 ? "application" : "applications"} a week</span>
            </label>
            <input
              id="settings-goal"
              name="weeklyGoal"
              type="range"
              min={WEEKLY_GOAL_MIN}
              max={WEEKLY_GOAL_MAX}
              step={1}
              value={goal}
              onChange={(e) => setValue({ weeklyGoal: Number(e.target.value) })}
              aria-describedby={goalHintId}
              aria-valuetext={`${goal} applications a week`}
              className="h-11 w-full cursor-pointer accent-moss"
            />
          </div>
          <button
            type="button"
            onClick={() => setValue({ weeklyGoal: Math.min(WEEKLY_GOAL_MAX, goal + 1) })}
            disabled={goal >= WEEKLY_GOAL_MAX}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-card text-xl text-ink transition-colors hover:bg-paper-2 disabled:opacity-40"
            aria-label="One more per week"
          >
            +
          </button>
        </div>
        <p id={goalHintId} className="mt-2 text-sm text-muted">
          {errors.weeklyGoal ? <span className="text-coral">{errors.weeklyGoal}</span> : goalCopy(goal)} Missing a week never breaks anything.
        </p>
      </fieldset>

      <Field
        label="Time zone"
        htmlFor="settings-tz"
        error={errors.timeZone}
        hint="Sets your forest's day and night, and when your week starts."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            id="settings-tz"
            name="timeZone"
            value={value.timeZone}
            onChange={(e) => {
              setValue({ timeZone: e.target.value });
              setTzNote(null);
            }}
            aria-invalid={Boolean(errors.timeZone)}
            aria-describedby={errors.timeZone ? "settings-tz-error" : "settings-tz-hint"}
            className="sm:flex-1"
          >
            {timeZones.map((group) => (
              <optgroup key={group.region} label={group.region}>
                {group.zones.map((z) => (
                  <option key={z.value} value={z.value}>
                    {timeZoneLabel(z.value)} ({z.offset})
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={detectTimeZone} className="shrink-0">
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <circle cx="10" cy="10" r="3" />
              <path d="M10 2v3M10 15v3M2 10h3M15 10h3" />
            </svg>
            Use this device&apos;s
          </Button>
        </div>
      </Field>
      <p aria-live="polite" className="-mt-4 min-h-5 text-sm text-moss">
        {tzNote}
      </p>

      {state?.error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-center text-xs text-muted sm:text-left">
          {pending ? "Saving…" : dirty && savedAt ? "Draft saved on this device" : dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <Button type="submit" disabled={pending || !dirty}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
