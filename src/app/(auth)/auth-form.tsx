"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { login, signup, type AuthFormState } from "@/lib/auth/actions";
import { TRACKS } from "@/lib/tracks";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(mode === "login" ? login : signup, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode === "signup" ? (
        <Field label="Your first name" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" autoComplete="given-name" required maxLength={60} aria-invalid={Boolean(errors.name)} placeholder="Sam" />
        </Field>
      ) : null}
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} placeholder="you@school.edu" />
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
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-lg px-2 text-xs font-medium text-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>
      {mode === "signup" ? (
        <Field label="What are you applying for?" htmlFor="track" hint="Tunes the resume analyzer and prep suggestions. Change it anytime.">
          <Select id="track" name="track" defaultValue="cybersecurity">
            {TRACKS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {state?.error ? (
        <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
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
