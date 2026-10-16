import Link from "next/link";

import { MASCOTS, Mascot } from "@/components/mascots";
import type { Insight, InsightTone } from "@/lib/stats/insights";

const TONE: Record<InsightTone, { card: string; label: string; mood: "happy" | "cheer" | "think" | "comfort" }> = {
  celebrate: { card: "border-sun/50 bg-gradient-to-br from-card to-sun-soft/70", label: "Nice", mood: "cheer" },
  info: { card: "border-line bg-card", label: "Pattern", mood: "think" },
  nudge: { card: "border-sky/50 bg-gradient-to-br from-card to-sky-soft/70", label: "Next step", mood: "happy" },
  comfort: { card: "border-berry/25 bg-gradient-to-br from-card to-berry-soft/50", label: "Perspective", mood: "comfort" },
};

export function InsightsSection({ insights, headline }: { insights: Insight[]; headline: string }) {
  return (
    <section aria-labelledby="insights-title" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div aria-hidden className="flex shrink-0 -space-x-3">
          <Mascot name="alder" mood="think" className="size-14 sm:size-16" />
          <Mascot name="tuck" mood="happy" className="size-12 translate-y-2 sm:size-14" />
        </div>
        <div className="min-w-0">
          <h2 id="insights-title" className="text-xl font-semibold sm:text-2xl">
            Field notes from Alder &amp; Tuck
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft" aria-live="polite">
            {headline}
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((ins, i) => {
          const tone = TONE[ins.tone];
          const who = MASCOTS[ins.mascot];
          return (
            <li
              key={ins.id}
              className={`flex gap-3 rounded-3xl border p-4 shadow-soft animate-rise sm:p-5 ${tone.card}`}
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <Mascot name={ins.mascot} mood={tone.mood} className="size-11 shrink-0" animate={false} />
              <div className="flex min-w-0 flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {tone.label} · {who.name}
                </p>
                <h3 className="mt-1 text-[17px] font-semibold leading-snug">{ins.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{ins.body}</p>
                {ins.href && ins.cta ? (
                  <Link
                    href={ins.href}
                    className="mt-3 inline-flex min-h-11 items-center gap-1 self-start rounded-full text-sm font-medium text-moss-strong underline-offset-4 hover:underline"
                  >
                    {ins.cta}
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
