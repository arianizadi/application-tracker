// Compact course summary for other pages (e.g. /home). Server Component: pass the user's snapshot.
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { UserSnapshot } from "@/lib/data/snapshot";
import { courseOverview } from "@/lib/prep/course";
import { toProgressMap } from "@/lib/prep/progress";

import { pad2, ProgressRing } from "./bits";
import { PrepIcon } from "./icons";

export function PrepProgressCard({ snapshot, className = "" }: { snapshot: Pick<UserSnapshot, "progress">; className?: string }) {
  const { progress, totals, upNext } = courseOverview(toProgressMap(snapshot.progress));
  const fresh = progress.modulesDone === 0 && progress.questionsPracticed === 0 && progress.flashcardsKnown === 0;

  return (
    <Card aria-labelledby="prep-progress-heading" className={className}>
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <ProgressRing value={progress.modulesDone} max={totals.modules} size={76} stroke={11} label={`${progress.modulesDone} of ${totals.modules} prep modules complete`}>
          <span className="font-display text-lg font-semibold leading-none tabular">
            {progress.modulesDone}
            <span className="text-xs text-muted">/{totals.modules}</span>
          </span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <h2 id="prep-progress-heading" className="text-lg font-semibold leading-tight">
            Interview prep
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">
            {fresh ? (
              `${totals.modules} short modules, ${totals.flashcards} flashcards and mock interviews. Start anywhere.`
            ) : (
              <>
                <span className="tabular">{progress.questionsPracticed}</span> {progress.questionsPracticed === 1 ? "question" : "questions"} practiced ·{" "}
                <span className="tabular">{progress.flashcardsKnown}</span> {progress.flashcardsKnown === 1 ? "card" : "cards"} known
              </>
            )}
          </p>
        </div>
      </div>
      <div className="border-t border-line px-3 py-3 sm:px-4">
        <Link
          href={upNext ? `/prep/${upNext.id}` : "/prep/mock"}
          className="group flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-paper-2"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-moss-soft font-display text-sm font-semibold text-moss">
            {upNext ? pad2(upNext.number) : <PrepIcon name="mic" className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted">{upNext ? (upNext.started ? "Continue" : "Up next") : "Every module done"}</span>
            <span className="block truncate text-sm font-semibold">{upNext ? upNext.title : "Run a mock interview"}</span>
          </span>
          <PrepIcon name="arrow-right" className="size-4 shrink-0 text-moss transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
