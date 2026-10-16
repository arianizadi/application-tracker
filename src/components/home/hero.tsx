import { Forest, ForestLegend } from "@/components/forest";
import type { ForestState } from "@/lib/forest/derive";

/**
 * Full-bleed forest with the greeting laid over the sky. The SVG is server
 * rendered; the only client JS is the forest's own tooltip frame.
 */
export function HomeHero({
  forest,
  title,
  eyebrow,
  summary,
}: {
  forest: ForestState;
  title: string;
  eyebrow: string;
  summary: string;
}) {
  return (
    <section aria-labelledby="home-greeting" className="relative -mx-4 -mt-6 sm:mx-0 sm:mt-0">
      <div className="relative overflow-hidden bg-night shadow-soft sm:rounded-[2rem] sm:border sm:border-line">
        <Forest
          state={forest}
          interactive
          fit="fill"
          idPrefix="home"
          className="h-[55svh] min-h-[340px] max-h-[620px] sm:h-auto sm:min-h-0 sm:max-h-none sm:aspect-[2/1] lg:aspect-[1200/520]"
        />

        {/* Scrim keeps the greeting legible against any sky (dawn to midnight). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-3/5 bg-linear-to-b from-night/65 via-night/25 to-transparent sm:h-1/2"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.35)] sm:text-xs">
            {eyebrow}
          </p>
          <h1
            id="home-greeting"
            className="mt-1.5 max-w-[18ch] text-[2rem] font-semibold leading-[1.05] text-white [text-shadow:0_2px_18px_rgb(0_0_0/0.35)] sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.45)] sm:text-base">
            {summary}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Collapsible field guide under the hero. Native <details>: keyboard and screen-reader friendly, zero JS. */
export function ForestGuide({ forest }: { forest: ForestState }) {
  return (
    <details className="group rounded-3xl border border-line bg-card shadow-soft open:pb-1">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-5 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <svg viewBox="0 0 20 20" className="size-5 text-moss" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4.5c2.5-1 4.5-1 7 .5 2.5-1.5 4.5-1.5 7-.5v11c-2.5-1-4.5-1-7 .5-2.5-1.5-4.5-1.5-7-.5z" />
            <path d="M10 5v11" />
          </svg>
          What&apos;s in my forest?
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <span className="group-open:hidden">Field guide</span>
          <span className="hidden group-open:inline">Close</span>
          <svg viewBox="0 0 16 16" className="size-4 transition-transform group-open:rotate-180" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-4 pt-1 sm:px-6">
        <ForestLegend state={forest} />
      </div>
    </details>
  );
}
