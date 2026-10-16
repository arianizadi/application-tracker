import Link from "next/link";

import { AppIcon, type AppIconName } from "@/components/applications/icons";
import { Mascot } from "@/components/mascots";
import { Card, CardHeader } from "@/components/ui/card";

import type { AttentionItem, AttentionKind } from "./context";

const KIND: Record<AttentionKind, { label: string; icon: AppIconName; chip: string }> = {
  interview: { label: "Interview", icon: "sparkle", chip: "bg-sun-soft text-ink ring-sun/50" },
  followup: { label: "Follow-up", icon: "bell", chip: "bg-sky-soft text-ink ring-sky/50" },
  deadline: { label: "Deadline", icon: "calendar", chip: "bg-coral-soft text-coral-ink ring-coral/30" },
  assessment: { label: "Assessment", icon: "file", chip: "bg-sky-soft text-ink ring-sky/50" },
  ghost: { label: "Quiet 30+ days", icon: "pin", chip: "bg-paper-2 text-muted ring-line-strong" },
};

const VISIBLE = 6;

/** Things worth a look today. A finite list with a clear "you're caught up" ending. */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  const shown = items.slice(0, VISIBLE);
  const more = items.length - shown.length;

  return (
    <Card aria-labelledby="attention-heading">
      <CardHeader
        title={<span id="attention-heading">Needs attention</span>}
        description={items.length ? "A short list. Do one, and you've done today." : undefined}
        action={
          items.length ? (
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-moss-soft px-2 text-xs font-semibold text-moss-strong tabular">
              {items.length}
            </span>
          ) : null
        }
      />
      {shown.length === 0 ? (
        <div className="flex items-center gap-4 px-5 pb-6 pt-4 sm:px-6">
          <Mascot name="tuck" mood="happy" animate={false} className="size-16 shrink-0" />
          <div>
            <p className="font-semibold">Nothing needs you right now.</p>
            <p className="mt-0.5 text-sm text-ink-soft">No follow-ups due, no deadlines this week. Tuck is holding the reminders.</p>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-3 flex flex-col px-2 pb-2 sm:px-3">
            {shown.map((item) => {
              const k = KIND[item.kind];
              return (
                <li key={item.key}>
                  <Link
                    href={`/applications/${item.id}`}
                    className="group flex min-h-14 items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-paper-2"
                  >
                    <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${k.chip}`} aria-hidden>
                      <AppIcon name={k.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="truncate font-semibold">{item.company}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{k.label}</span>
                      </span>
                      <span className="block truncate text-sm text-ink-soft">{item.role}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{item.detail}</span>
                    </span>
                    <AppIcon name="chevron" className="mt-2 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
          {more > 0 ? (
            <div className="border-t border-line px-5 py-3 sm:px-6">
              <Link href="/applications" className="inline-flex min-h-11 items-center text-sm font-medium text-moss hover:underline">
                {more} more in applications <span aria-hidden className="ml-1">→</span>
              </Link>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
