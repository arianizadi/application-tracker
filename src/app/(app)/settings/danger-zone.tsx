"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { deleteAccount, signOutEverywhere, type AuthFormState } from "@/lib/auth/actions";

const PHRASE = "delete my forest";

function PendingSubmit({ children, pendingLabel, variant = "secondary", disabled = false }: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "secondary" | "danger";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function SignOutEverywhereForm() {
  return (
    <form action={signOutEverywhere} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-ink-soft">
        Lost a phone or used a library computer? This signs out every device, including this one.
      </p>
      <PendingSubmit pendingLabel="Signing out…">Sign out everywhere</PendingSubmit>
    </form>
  );
}

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [state, formAction] = useActionState<AuthFormState, FormData>(deleteAccount, undefined);
  const errors = state?.fieldErrors ?? {};
  const matches = phrase.trim().toLowerCase() === PHRASE;

  if (!open) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-soft">
          Permanently delete your account, applications, resumes, analyses, achievements and prep progress. This can&apos;t be
          undone, so consider exporting first.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)} className="w-full shrink-0 sm:w-auto">
          Delete account…
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-coral/40 bg-coral-soft/60 p-4 sm:p-5" noValidate>
      <div>
        <h3 className="text-lg font-semibold">Are you sure?</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Everything goes, immediately: every tree, every note, every resume version. Prickle will miss you.
        </p>
      </div>
      <Field
        label={
          <>
            Type <span className="font-mono font-semibold text-coral">{PHRASE}</span> to confirm
          </>
        }
        htmlFor="delete-phrase"
      >
        <Input
          id="delete-phrase"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={40}
        />
      </Field>
      <Field label="Your password" htmlFor="delete-password" error={errors.current}>
        <Input
          id="delete-password"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          aria-invalid={Boolean(errors.current)}
          aria-describedby={errors.current ? "delete-password-error" : undefined}
        />
      </Field>
      {state?.error ? (
        <p role="alert" className="text-sm text-coral">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setPhrase("");
          }}
          className="w-full sm:w-auto"
        >
          Keep my forest
        </Button>
        <PendingSubmit variant="danger" pendingLabel="Deleting…" disabled={!matches}>
          Delete everything
        </PendingSubmit>
      </div>
    </form>
  );
}
