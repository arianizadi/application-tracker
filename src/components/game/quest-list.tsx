import Link from "next/link";
import type { CSSProperties } from "react";

import { Mascot } from "@/components/mascots";
import type { Quest } from "@/lib/game";

/** This week's quests: small, optional, no penalties. */
export function QuestList({ quests, className = "" }: { quests: Quest[]; className?: string }) {
  if (quests.length === 0) {
    return <p className={`text-sm text-muted ${className}`}>No quests this week. You&apos;re caught up. You can leave it here.</p>;
  }

  return (
    <ul className={`flex flex-col gap-3 ${className}`}>
      {quests.map((q) => {
        const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));
        const body = (
          <>
            <Mascot name={q.mascot} mood={q.done ? "cheer" : "idle"} animate={false} className="size-12 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-[15px] font-semibold leading-snug ${q.done ? "text-moss-strong" : ""}`}>{q.title}</p>
                <span className="shrink-0 rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-semibold text-ink tabular">
                  ~{q.xp} XP
                </span>
              </div>
              <p className="mt-0.5 text-sm text-ink-soft">{q.detail}</p>
              <div className="mt-2.5 flex items-center gap-3">
                {q.target <= 5 ? (
                  <div className="flex flex-1 gap-1" aria-hidden>
                    {Array.from({ length: q.target }, (_, i) => (
                      <span key={i} className={`h-2 flex-1 rounded-full ${i < q.progress ? "bg-moss" : "bg-paper-2 ring-1 ring-inset ring-line"}`} />
                    ))}
                  </div>
                ) : (
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2 ring-1 ring-inset ring-line" aria-hidden>
                    <div
                      style={{ "--q": `${pct}%` } as CSSProperties}
                      className="h-full w-full translate-x-[calc(var(--q)-100%)] rounded-full bg-moss transition-transform delay-150 duration-[900ms] ease-enter starting:-translate-x-full motion-reduce:transition-none"
                    />
                  </div>
                )}
                <span className="shrink-0 text-xs font-medium text-muted tabular">
                  {q.done ? (
                    <span className="inline-flex items-center gap-1 text-moss">
                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                      Done
                    </span>
                  ) : (
                    `${q.progress}/${q.target}`
                  )}
                </span>
              </div>
              <span className="sr-only">
                {q.done ? "Quest complete." : `Progress ${q.progress} of ${q.target}.`}
              </span>
            </div>
          </>
        );
        const cardClass = `flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 ${
          q.done ? "border-moss/30 bg-moss-soft/60" : "border-line bg-card"
        }`;
        return (
          <li key={q.id}>
            {q.href && !q.done ? (
              <Link href={q.href} className={`${cardClass} transition-colors hover:border-line-strong hover:bg-paper-2/50`}>
                {body}
              </Link>
            ) : (
              <div className={cardClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
