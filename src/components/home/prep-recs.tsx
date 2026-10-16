import Link from "next/link";

import { Mascot } from "@/components/mascots";
import { Card, CardHeader } from "@/components/ui/card";
import type { Recommendation, RecommendationTone } from "@/lib/prep/detections";

const MAX = 3;

const TONE: Record<RecommendationTone, { label: string; chip: string }> = {
  assessment: { label: "Assessment", chip: "bg-sun-soft text-bark" },
  interview: { label: "Interview", chip: "bg-coral-soft text-ink" },
  celebrate: { label: "Offer", chip: "bg-sun-soft text-bark" },
  prep: { label: "Prep", chip: "bg-moss-soft text-moss" },
  wording: { label: "Resume wording", chip: "bg-sky-soft text-ink" },
  habit: { label: "Rhythm", chip: "bg-berry-soft text-berry" },
  welcome: { label: "Start here", chip: "bg-moss-soft text-moss" },
  course: { label: "Course", chip: "bg-paper-2 text-ink-soft" },
};

function hrefOf(rec: Recommendation): string {
  if (rec.href) return rec.href;
  const moduleId = rec.moduleIds[0];
  if (moduleId) return `/prep/${encodeURIComponent(moduleId)}`;
  return rec.resourceIds.length > 0 ? "/prep/resources" : "/prep";
}

function ctaOf(rec: Recommendation): string {
  if (rec.practice) return "Practice";
  if (rec.moduleIds.length === 0 && rec.resourceIds.length > 0) return "Read";
  return "Start";
}

/** Prep suggestions picked from what's actually in the pipeline. Render nothing when empty. */
export function PrepRecommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) return null;
  const shown = [...items].sort((a, b) => b.priority - a.priority).slice(0, MAX);

  return (
    <Card aria-labelledby="prep-heading">
      <CardHeader
        title={<span id="prep-heading">Recommended prep</span>}
        description="Picked from what's on your board right now."
        action={
          <Link href="/prep" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-moss hover:bg-moss-soft">
            All prep
          </Link>
        }
      />
      <ul className="mt-3 flex flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        {shown.map((rec) => {
          const tone = rec.tone ? TONE[rec.tone] : undefined;
          const evidence = rec.evidence?.[0];
          return (
            <li key={rec.id}>
              <Link
                href={hrefOf(rec)}
                className="group flex min-h-14 items-start gap-3 rounded-2xl border border-line bg-paper px-3.5 py-3 transition-colors hover:border-moss/40 hover:bg-moss-soft/50 sm:px-4"
              >
                <Mascot name={rec.mascot ?? "pip"} mood="think" animate={false} className="-ml-1 size-11 shrink-0" />
                <span className="min-w-0 flex-1">
                  {tone || evidence ? (
                    <span className="mb-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      {tone ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${tone.chip}`}>{tone.label}</span>
                      ) : null}
                      {evidence ? <span className="min-w-0 truncate text-xs text-muted">{evidence}</span> : null}
                    </span>
                  ) : null}
                  <span className="block font-semibold leading-snug">{rec.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{rec.message}</span>
                </span>
                <span className="mt-0.5 shrink-0 text-sm font-medium text-moss" aria-hidden>
                  {ctaOf(rec)} <span className="inline-block transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
