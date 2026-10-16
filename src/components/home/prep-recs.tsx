import Link from "next/link";

import { Mascot } from "@/components/mascots";
import { Card, CardHeader } from "@/components/ui/card";
import type { Recommendation } from "@/lib/prep/detections";

const MAX = 3;

/** Prep suggestions picked from what's actually in the pipeline. Render nothing when empty. */
export function PrepRecommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) return null;
  const shown = [...items].sort((a, b) => b.priority - a.priority).slice(0, MAX);

  return (
    <Card aria-labelledby="prep-heading">
      <CardHeader
        title={<span id="prep-heading">Recommended prep</span>}
        description="Picked from what's on your board right now."
        action={<Mascot name="pip" mood="think" animate={false} className="-my-2 size-12" />}
      />
      <ul className="mt-3 flex flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        {shown.map((rec) => {
          const moduleId = rec.moduleIds[0];
          const href = moduleId ? `/prep/${encodeURIComponent(moduleId)}` : "/prep";
          return (
            <li key={rec.id}>
              <Link
                href={href}
                className="group flex min-h-14 items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3 transition-colors hover:border-moss/40 hover:bg-moss-soft/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{rec.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{rec.message}</span>
                </span>
                <span className="mt-0.5 shrink-0 text-sm font-medium text-moss" aria-hidden>
                  Start <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
