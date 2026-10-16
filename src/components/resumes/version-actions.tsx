"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteResume, setDefaultResume } from "@/lib/resumes/actions";

import { EditResumeForm } from "./edit-form";
import { RIcon } from "./icons";
import { Sheet } from "./sheet";

type Props = {
  id: string;
  version: number;
  label: string;
  notes: string | null;
  isDefault: boolean;
  hasFile: boolean;
  /** Applications currently linked, shown in the delete confirmation. */
  usedCount: number;
  /** Show a "Details" link (on the list page). */
  showDetails?: boolean;
  /** Where to go after deleting (detail page sends you back to the list). */
  afterDeleteHref?: string;
};

type Panel = "none" | "preview" | "edit" | "delete" | "more";

const chip = buttonClass({ variant: "secondary", size: "sm", className: "h-11 sm:h-10" });
const ghostChip = buttonClass({ variant: "ghost", size: "sm", className: "h-11 sm:h-10" });

/** Download, preview, analyze, set default, edit and delete for one version. */
export function VersionActions({ id, version, label, notes, isDefault, hasFile, usedCount, showDetails = false, afterDeleteHref }: Props) {
  const [panel, setPanel] = useState<Panel>("none");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const fileUrl = `/api/resumes/${id}/file`;
  const close = () => {
    setPanel("none");
    setError(null);
  };

  function openPreview(e: MouseEvent<HTMLAnchorElement>) {
    // Phones get the browser's own PDF viewer in a new tab; larger screens get an in-page preview.
    if (window.matchMedia("(min-width: 768px)").matches) {
      e.preventDefault();
      setPanel("preview");
    }
  }

  function makeDefault() {
    startTransition(async () => {
      const res = await setDefaultResume(id).catch(() => ({ ok: false as const, error: "Couldn't reach the server. Try again?" }));
      if (res.ok) {
        toast({ tone: "success", title: "New default", body: res.message });
        close();
      } else toast({ tone: "warning", title: "Hmm", body: res.error });
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteResume(id).catch(() => ({ ok: false as const, error: "Couldn't reach the server. Try again?" }));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      try {
        localStorage.removeItem(`canopy:draft:resume:edit:${id}`);
        localStorage.removeItem(`canopy:draft:resume:edit:${id}:text`);
      } catch {}
      toast({ tone: "info", title: "Version deleted", body: res.message });
      close();
      if (afterDeleteHref) router.replace(afterDeleteHref);
    });
  }

  const secondary = (
    <>
      {!isDefault ? (
        <button type="button" className={ghostChip} onClick={makeDefault} disabled={pending}>
          <RIcon name="star" />
          Make default
        </button>
      ) : null}
      <button type="button" className={ghostChip} onClick={() => setPanel("edit")}>
        <RIcon name="pencil" />
        Edit
      </button>
      <button type="button" className={`${ghostChip} text-coral hover:bg-coral-soft hover:text-coral`} onClick={() => setPanel("delete")}>
        <RIcon name="trash" />
        Delete
      </button>
    </>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasFile ? (
          <>
            <a href={`${fileUrl}?inline=1`} target="_blank" rel="noopener" onClick={openPreview} className={chip}>
              <RIcon name="eye" />
              Preview
            </a>
            <a href={fileUrl} download className={chip}>
              <RIcon name="download" />
              <span className="sr-only sm:not-sr-only">Download</span>
            </a>
          </>
        ) : null}
        <Link href={`/analyzer?resume=${id}`} className={chip}>
          <RIcon name="target" />
          Analyze
        </Link>
        {showDetails ? (
          <Link href={`/resumes/${id}`} className={`${chip} hidden sm:inline-flex`}>
            Details
          </Link>
        ) : null}
        <div className="hidden flex-wrap items-center gap-1 sm:flex">{secondary}</div>
        <button type="button" className={`${ghostChip} sm:hidden`} onClick={() => setPanel("more")} aria-label={`More actions for v${version}`}>
          <RIcon name="more" className="size-5" />
        </button>
      </div>

      <Sheet open={panel === "more"} onClose={close} title={`v${version} · ${label}`}>
        <div className="flex flex-col gap-1 pb-2 [&>*]:w-full [&>*]:justify-start">
          {showDetails ? (
            <Link href={`/resumes/${id}`} className={ghostChip}>
              <RIcon name="arrow" />
              Details, text &amp; history
            </Link>
          ) : null}
          {secondary}
        </div>
      </Sheet>

      <Sheet
        open={panel === "preview"}
        onClose={close}
        size="xl"
        title={`Preview · v${version}`}
        description={
          <a href={`${fileUrl}?inline=1`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline underline-offset-4">
            Open in a new tab <RIcon name="external" className="size-3.5" />
          </a>
        }
      >
        <iframe src={`${fileUrl}?inline=1`} title={`PDF preview of ${label} (v${version})`} className="h-[75dvh] w-full rounded-2xl border border-line bg-paper-2" />
      </Sheet>

      <Sheet open={panel === "edit"} onClose={close} title={`Edit v${version}`} description="Rename it or jot down what changed.">
        <EditResumeForm id={id} version={version} label={label} notes={notes} onDone={close} />
      </Sheet>

      <Sheet open={panel === "delete"} onClose={close} title={`Delete v${version}?`}>
        <div className="flex flex-col gap-4">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            “{label}” and its PDF will be gone for good.
            {usedCount > 0
              ? ` The ${usedCount} application${usedCount === 1 ? "" : "s"} that used it stay put — they'll just show “no resume linked.”`
              : " No applications are using it."}
            {isDefault ? " Your newest remaining version becomes the default." : ""}
          </p>
          {error ? (
            <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close} disabled={pending}>
              Keep it
            </Button>
            <Button variant="danger" onClick={remove} disabled={pending}>
              {pending ? "Deleting…" : `Delete v${version}`}
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
