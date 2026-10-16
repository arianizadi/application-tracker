import Link from "next/link";

import { Card, CardHeader } from "@/components/ui/card";
import { STATUS_META, isStatus } from "@/lib/status";

import { isoString, timeAgo, type ActivityItem } from "./context";

function dotFor(kind: ActivityItem["kind"]): string {
  if (isStatus(kind)) return STATUS_META[kind].dot;
  return kind === "RESUME" ? "bg-bark" : "bg-sky";
}

/** The trail you left: status changes, resume versions and analyzer runs, newest first. */
export function ActivityFeed({ items, now, timeZone }: { items: ActivityItem[]; now: Date; timeZone: string }) {
  return (
    <Card aria-labelledby="activity-heading">
      <CardHeader title={<span id="activity-heading">Recent activity</span>} description="Acorn files everything, however it went." />
      {items.length === 0 ? (
        <p className="px-5 pb-6 pt-3 text-sm text-ink-soft sm:px-6">
          Your trail starts with your first tree. Every update lands here, newest first.
        </p>
      ) : (
        <ol className="relative mx-5 mb-5 mt-4 border-l border-dashed border-line-strong sm:mx-6">
          {items.map((item) => (
            <li key={item.key} className="relative pl-5">
              <span aria-hidden className={`absolute -left-[5px] top-[1.15rem] size-2.5 rounded-full ring-4 ring-card ${dotFor(item.kind)}`} />
              <Link href={item.href} className="-mx-2 flex min-h-12 items-baseline gap-3 rounded-xl px-2 py-2.5 hover:bg-paper-2">
                <span className="min-w-0 flex-1 text-sm leading-snug">
                  <span className="text-ink-soft">{item.lead} </span>
                  <span className="font-semibold text-ink">{item.subject}</span>
                  {item.tail ? <span className="block truncate text-[13px] text-muted">{item.tail}</span> : null}
                </span>
                <time dateTime={isoString(item.at)} className="shrink-0 text-xs text-muted tabular">
                  {timeAgo(item.at, now, timeZone)}
                </time>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
