"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { changePassword, type AuthFormState } from "@/lib/auth/actions";

/** Change password. Deliberately NOT autosaved: passwords never touch localStorage. */
export function PasswordForm() {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(async (prev, formData) => {
    const result = await changePassword(prev, formData);
    if (result?.ok) {
      formRef.current?.reset();
      toast({ title: "Password updated", body: "Other devices were signed out.", tone: "success" });
    }
    return result;
  }, undefined);
  const errors = state?.fieldErrors ?? {};
  const type = show ? "text" : "password";

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
      {/* Lets password managers associate the new password with this account. */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <Field label="Current password" htmlFor="pw-current" error={errors.current}>
        <Input
          id="pw-current"
          name="current"
          type={type}
          autoComplete="current-password"
          required
          maxLength={200}
          aria-invalid={Boolean(errors.current)}
          aria-describedby={errors.current ? "pw-current-error" : undefined}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="pw-new" error={errors.password} hint="At least 10 characters. A short phrase works great.">
          <Input
            id="pw-new"
            name="password"
            type={type}
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={200}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "pw-new-error" : "pw-new-hint"}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
          <Input
            id="pw-confirm"
            name="confirm"
            type={type}
            autoComplete="new-password"
            required
            maxLength={200}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? "pw-confirm-error" : undefined}
          />
        </Field>
      </div>
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 self-start text-sm text-ink-soft">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-moss" />
        Show passwords
      </label>
      <div aria-live="polite">
        {state?.error ? (
          <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral-ink">
            {state.error}
          </p>
        ) : state?.ok ? (
          <p className="rounded-xl border border-moss/30 bg-moss-soft px-3.5 py-2.5 text-sm text-moss-strong">{state.message}</p>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
