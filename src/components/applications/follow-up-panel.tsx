"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useOptimistic, useState, useTransition } from "react";

import { Mascot } from "@/components/mascots";
import { useToast } from "@/components/ui/toast";
import { setFollowUp } from "@/lib/applications/actions";
import { followUpTemplate } from "@/lib/applications/copy";
import { addDaysToKey, dateToKey, daysBetweenKeys, formatDateKey, relativeDays } from "@/lib/applications/dates";
import { CLOSED_STATUSES } from "@/lib/status";

import { AppIcon } from "./icons";

export function FollowUpPanel({
  id,
  followUpAt,
  status,
  todayKey,
  company,
  role,
  appliedAt,
  contactName,
}: {
  id: string;
  followUpAt: Date | null;
  status: ApplicationStatus;
  todayKey: string;
  company: string;
  role: string;
  appliedAt: Date | null;
  contactName: string | null;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [optimisticKey, setOptimisticKey] = useOptimistic(dateToKey(followUpAt));
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);
  const closed = CLOSED_STATUSES.includes(status);

  function schedule(key: string | null, message?: { title: string; body: string; tone: "success" }) {
    startTransition(async () => {
      setOptimisticKey(key ?? "");
      const res = await setFollowUp(id, key);
      if (!res.ok) {
        toast({ title: "Couldn't set that reminder", body: res.error, tone: "warning" });
        return;
      }
      toast(
        message ?? (key
          ? { title: "Reminder set", body: `We'll flag ${company} ${relativeDays(daysBetweenKeys(todayKey, key))}. One less thing to hold in your head.`, tone: "success" }
          : { title: "Reminder cleared", body: "Nothing you need to remember here right now.", tone: "info" }),
      );
    });
  }

  async function copyTemplate() {
    const appliedOn = appliedAt ? formatDateKey(dateToKey(appliedAt), todayKey) : undefined;
    try {
      await navigator.clipboard.writeText(followUpTemplate({ company, role, appliedOn, contact: contactName }));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      toast({ title: "Copied", body: "Paste it into your email and make it yours.", tone: "info" });
    } catch {
      toast({ title: "Couldn't copy", body: "Your browser blocked the clipboard.", tone: "warning" });
    }
  }

  const days = optimisticKey ? daysBetweenKeys(todayKey, optimisticKey) : null;
  const due = days !== null && days <= 0;

  return (
    <div>
      <div className="flex items-start gap-3">
        <Mascot name="tuck" mood={due ? "happy" : "idle"} className="size-12 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight">Follow-up</h2>
          <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
            {optimisticKey ? (
              <>
                {due ? <span className="font-semibold text-ink">Time to check in. </span> : null}
                {formatDateKey(optimisticKey, todayKey)} · {relativeDays(days ?? 0)}
              </>
            ) : closed ? (
              "This one's closed — no reminders needed."
            ) : (
              "No reminder set. We'll hold the date so you don't have to."
            )}
          </p>
        </div>
      </div>

      {!closed ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "In 3 days", days: 3 },
              { label: "In a week", days: 7 },
              { label: "In 2 weeks", days: 14 },
            ].map((o) => (
              <button
                key={o.days}
                type="button"
                disabled={pending}
                onClick={() => schedule(addDaysToKey(todayKey, o.days))}
                className="flex h-11 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium hover:bg-paper-2 disabled:opacity-60"
              >
                <AppIcon name="bell" className="size-3.5 text-muted" />
                {o.label}
              </button>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (custom) schedule(custom);
            }}
          >
            <label htmlFor="follow-custom" className="sr-only">
              Pick a follow-up date
            </label>
            <input
              id="follow-custom"
              type="date"
              min={todayKey}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-card px-3 text-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/25"
            />
            <button type="submit" disabled={!custom || pending} className="h-11 rounded-full bg-moss px-4 text-sm font-medium text-paper hover:bg-moss-strong disabled:opacity-50">
              Set
            </button>
          </form>
          {optimisticKey ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {due ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => schedule(addDaysToKey(todayKey, 7), { title: "Logged your follow-up", body: "Nice. Next check-in in a week if they stay quiet.", tone: "success" })}
                  className="h-10 rounded-full bg-sky-soft px-3.5 text-sm font-medium text-ink hover:brightness-95"
                >
                  I followed up
                </button>
              ) : null}
              <button type="button" disabled={pending} onClick={() => schedule(null)} className="h-10 rounded-full px-3 text-sm font-medium text-muted hover:bg-paper-2 hover:text-ink">
                Clear reminder
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {status !== "WISHLIST" && !closed ? (
        <button
          type="button"
          onClick={copyTemplate}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
        >
          <AppIcon name={copied ? "check" : "copy"} className="size-4" />
          {copied ? "Copied!" : "Copy a follow-up email"}
        </button>
      ) : null}
    </div>
  );
}
