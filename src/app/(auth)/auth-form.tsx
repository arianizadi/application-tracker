"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { login, signup, type AuthFormState } from "@/lib/auth/actions";
import { TRACKS } from "@/lib/tracks";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  // React resets uncontrolled forms after an action. Remember the non-secret
  // fields and feed them back as defaults so a typo only costs the password.
  const [values, setValues] = useState<{ name?: string; email?: string; track?: string }>({});
  const [state, action, pending] = useActionState<AuthFormState, FormData>(async (prev, formData) => {
    setValues({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      track: String(formData.get("track") ?? "cybersecurity"),
    });
    return (mode === "login" ? login : signup)(prev, formData);
  }, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const timeZoneRef = useRef<HTMLInputElement>(null);
  const errors = state?.fieldErrors ?? {};

  // New accounts start in this device's time zone (the server validates it and
  // falls back to the default), so dates and the forest's sky are local from day one.
  useEffect(() => {
    if (!timeZoneRef.current) return;
    try {
      timeZoneRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
  }, [mode]);

  // After a failed attempt, put the cursor where the fix goes.
  useEffect(() => {
    if (!state) return;
    const field = state.fieldErrors?.name ? "name" : state.fieldErrors?.email ? "email" : "password";
    if (state.error || state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>(`#${field}`)?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode === "signup" ? <input ref={timeZoneRef} type="hidden" name="timeZone" /> : null}
      {mode === "signup" ? (
        <Field label="Your first name" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" autoComplete="given-name" defaultValue={values.name} required maxLength={60} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} placeholder="Sam" />
        </Field>
      ) : null}
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={values.email} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} placeholder="you@school.edu" />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        error={errors.password}
        hint={mode === "signup" ? "At least 10 characters. A short phrase works great." : undefined}
      >
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 10 : undefined}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : mode === "signup" ? "password-hint" : undefined}
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-1.5 my-auto h-10 rounded-lg px-3 text-xs font-medium text-muted hover:text-ink sm:right-2 sm:h-8 sm:px-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>
      {mode === "login" ? (
        <Link
          href="/faq#forgot-password"
          className="-mt-2 self-end text-xs font-medium text-muted underline-offset-4 hover:text-moss hover:underline"
        >
          Forgot password?
        </Link>
      ) : null}
      {mode === "signup" ? (
        <Field label="What are you applying for?" htmlFor="track" hint="Tunes the resume analyzer and prep suggestions. Change it anytime.">
          <Select id="track" name="track" defaultValue={values.track ?? "cybersecurity"}>
            {TRACKS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {state?.error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral-ink">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "One sec…" : mode === "login" ? "Sign in" : "Plant my first seed"}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-moss underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already growing?{" "}
            <Link href="/login" className="font-medium text-moss underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
