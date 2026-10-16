import Link from "next/link";

import { STATS_RANGES, type StatsRange } from "@/lib/stats/compute";

/** Segmented range control. Plain links, so it works without JS and is shareable. */
export function RangeTabs({ value }: { value: StatsRange }) {
  return (
    <nav aria-label="Time range" className="inline-flex rounded-full border border-line bg-paper-2/70 p-1">
      {STATS_RANGES.map((r) => {
        const active = r.key === value;
        return (
          <Link
            key={r.key}
            href={`/stats?range=${r.key}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium transition-colors ${
              active ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"
            }`}
          >
            {r.short}
          </Link>
        );
      })}
    </nav>
  );
}
