import type { ApplicationStatus } from "@prisma/client";
import Link from "next/link";

import { ChartCard } from "@/components/stats/chart-card";
import { TipLayer } from "@/components/stats/tip-layer";
import type { Stats } from "@/lib/stats/compute";
import { pct, plural } from "@/lib/stats/format";
import { STATUS_META } from "@/lib/status";

/**
 * Four groups, in this order, validated for adjacent CVD separation in both
 * themes (sky → sun → berry → neutral). Labels + counts always accompany color.
 */
const GROUPS = [
  { key: "waiting", label: "Waiting to hear", color: "var(--sky)", statuses: ["APPLIED"] },
  { key: "progress", label: "In progress", color: "var(--sun)", statuses: ["ASSESSMENT", "INTERVIEW"] },
  { key: "offers", label: "Offers", color: "var(--berry)", statuses: ["OFFER", "ACCEPTED"] },
  { key: "closed", label: "Closed", color: "var(--line-strong)", statuses: ["REJECTED", "GHOSTED", "WITHDRAWN"] },
] as const;

const CLOSED = new Set<ApplicationStatus>(["REJECTED", "GHOSTED", "WITHDRAWN"]);

export function PipelineCard({ pipeline, wishlist, className = "" }: { pipeline: Stats["pipeline"]; wishlist: number; className?: string }) {
  const count = (s: string) => pipeline.statuses.find((x) => x.status === s)?.count ?? 0;
  const groups = GROUPS.map((g) => ({ ...g, count: g.statuses.reduce((sum, s) => sum + count(s), 0) }));
  const total = groups.reduce((s, g) => s + g.count, 0);
  const visible = groups.filter((g) => g.count > 0);
  const maxStatus = Math.max(1, ...pipeline.statuses.filter((s) => s.status !== "WISHLIST").map((s) => s.count));
  const ageMax = Math.max(1, ...pipeline.pendingAge.map((b) => b.count));

  return (
    <ChartCard
      id="pipeline"
      title="Pipeline right now"
      description={`Where all ${plural(total, "submitted application")} stand today${wishlist ? `, plus ${wishlist} on the wishlist` : ""}.`}
      className={className}
      table={{
        caption: "Applications by current status",
        head: ["Status", "Applications"],
        rows: pipeline.statuses.map((s) => [STATUS_META[s.status].label, s.count]),
      }}
    >
      {total > 0 ? (
        <TipLayer>
          <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={visible.map((g) => `${g.label}: ${g.count}`).join(", ")}>
            {visible.map((g, i) => (
              <div
                key={g.key}
                data-tip={`${g.label}\n${g.count} · ${pct(g.count / total)}`}
                className="stats-grow-x h-full first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(g.count / total) * 100}%`, background: g.color, minWidth: 6, ["--i" as string]: i }}
              />
            ))}
          </div>
        </TipLayer>
      ) : null}
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {groups.map((g) => (
          <li key={g.key} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: g.color }} />
            <span className="truncate text-ink-soft">{g.label}</span>
            <span className="ml-auto font-medium text-ink tabular">{g.count}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="text-sm font-semibold">By status</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {pipeline.statuses
            .filter((s) => s.status !== "WISHLIST")
            .map((s, i) => (
              <li key={s.status} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="flex items-center gap-2 truncate text-ink-soft">
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${STATUS_META[s.status].dot}`} />
                  {STATUS_META[s.status].label}
                </span>
                <span aria-hidden className="h-2 rounded-full bg-paper-2">
                  {s.count > 0 ? (
                    <span
                      className="stats-grow-x block h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (s.count / maxStatus) * 100)}%`,
                        background: STATUS_META[s.status].color,
                        // Closed outcomes stay quieter than the live pipeline.
                        opacity: CLOSED.has(s.status) ? 0.6 : 1,
                        ["--i" as string]: i,
                      }}
                    />
                  ) : null}
                </span>
                <span className="text-right font-medium tabular">{s.count}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="text-sm font-semibold">How long they&apos;ve been waiting</h3>
        <p className="mt-1 text-xs text-muted">Applications still marked Applied, by days since you sent them.</p>
        <TipLayer>
          <ul className="mt-3 grid grid-cols-4 gap-2" aria-label="Waiting applications by age">
            {pipeline.pendingAge.map((b, i) => (
              <li key={b.label} className="flex flex-col items-center gap-1.5" data-tip={`${b.label}: ${plural(b.count, "application")}`}>
                <span className="flex h-14 w-full items-end justify-center rounded-xl bg-paper-2/60">
                  {b.count > 0 ? (
                    <span
                      className={`stats-grow-y block w-1/2 max-w-6 rounded-t-[4px] ${i >= 2 ? "bg-sun" : "bg-sky"}`}
                      style={{ height: `${(b.count / ageMax) * 100}%`, ["--i" as string]: i }}
                    />
                  ) : null}
                </span>
                <span className="text-sm font-semibold tabular">{b.count}</span>
                <span className="text-center text-[11px] leading-tight text-muted">{b.label}</span>
              </li>
            ))}
          </ul>
        </TipLayer>
      </div>

      {pipeline.followUpsDue.length > 0 || pipeline.waiting.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-sun/50 bg-sun-soft/60 p-4">
          <h3 className="text-sm font-semibold">Worth a follow-up</h3>
          <ul className="mt-2 flex flex-col divide-y divide-line/70 text-sm">
            {[...pipeline.followUpsDue.map((f) => ({ ...f, why: f.days === 0 ? "follow-up due today" : `follow-up due ${plural(f.days, "day")} ago` })), ...pipeline.waiting.map((f) => ({ ...f, why: `waiting ${f.days} days` }))]
              .slice(0, 5)
              .map((f) => (
                <li key={f.id}>
                  <Link href={`/applications/${f.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg py-1.5 hover:text-moss-strong">
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{f.company}</span>
                      <span className="text-muted"> · {f.role}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-soft">{f.why}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </ChartCard>
  );
}
