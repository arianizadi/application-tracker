"use client";

import { clearAllDrafts } from "@/hooks/use-autosave";
import { logout } from "@/lib/auth/actions";

/** Sign-out button that also wipes this device's autosaved drafts (shared lab and library computers). */
export function SignOutForm({ className }: { className?: string }) {
  return (
    <form action={logout} onSubmit={() => clearAllDrafts()} className={className}>
      <button type="submit" className="whitespace-nowrap rounded-lg px-2 py-1 text-xs text-muted hover:bg-card hover:text-ink">
        Sign out
      </button>
    </form>
  );
}
