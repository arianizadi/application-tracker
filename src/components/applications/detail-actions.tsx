"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useToast } from "@/components/ui/toast";
import { clearDraft } from "@/hooks/use-autosave";
import { deleteApplication, duplicateApplication } from "@/lib/applications/actions";

import { AppIcon } from "./icons";
import { ConfirmSheet } from "./sheet";
import { offerUndo } from "./undo";

export function DetailActions({ id, company, url }: { id: string; company: string; url: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const duplicate = () =>
    startTransition(async () => {
      const res = await duplicateApplication(id);
      if (!res.ok) {
        toast({ title: "Couldn't duplicate", body: res.error, tone: "warning" });
        return;
      }
      toast({ title: "Duplicated", body: `A fresh wishlist copy of ${company}. Tweak the role and go.`, tone: "success" });
      router.push(`/applications/${res.data.id}`);
    });

  // Navigate first so the delete's re-render lands on the list (not a 404 for
  // the page we're leaving); the list then shows an Undo bar.
  const remove = () => {
    setConfirm(false);
    router.push("/applications");
    startTransition(async () => {
      const res = await deleteApplication(id);
      if (!res.ok) {
        toast({ title: "Couldn't delete", body: res.error, tone: "warning" });
        return;
      }
      clearDraft(`application:${id}`);
      offerUndo(res.data.deleted, `Deleted ${company}`);
    });
  };

  const btn = "flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-4 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink disabled:opacity-60";

  return (
    <div className="flex flex-wrap gap-2">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer nofollow" className={btn}>
          <AppIcon name="external" className="size-4" /> Posting
        </a>
      ) : null}
      <button type="button" onClick={duplicate} disabled={pending} className={btn}>
        <AppIcon name="copy" className="size-4" /> Duplicate
      </button>
      <button type="button" onClick={() => setConfirm(true)} disabled={pending} aria-label={`Delete ${company}`} className={`${btn} text-coral hover:bg-coral-soft hover:text-coral`}>
        <AppIcon name="trash" className="size-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>
      <ConfirmSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Delete ${company}?`}
        description="Its notes and timeline go with it. You'll get a few seconds to undo."
        confirmLabel="Delete application"
        onConfirm={remove}
        pending={pending}
      />
    </div>
  );
}
