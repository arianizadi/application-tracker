import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FlashcardDeck } from "@/components/prep/flashcard-deck";
import { PrepIcon } from "@/components/prep/icons";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { FLASHCARDS, MODULES } from "@/content/prep";
import { loadProgressMap } from "@/lib/prep/queries";

export const metadata: Metadata = {
  title: "Flashcards · Interview prep",
  description: "Rapid-fire security interview flashcards. Flip, mark what you know, and come back to what you're still learning.",
};

export default function FlashcardsPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/prep" className="inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-ink-soft hover:text-ink">
          <PrepIcon name="arrow-left" className="size-4" /> Interview prep
        </Link>
      </nav>
      <PageHeader
        eyebrow="Flashcards"
        title="Quick reps"
        description={`${FLASHCARDS.length} cards for the definitions interviewers love to ask. Say the answer out loud, flip, then be honest with yourself.`}
      />
      <Suspense fallback={<DeckSkeleton />}>
        <Deck />
      </Suspense>
    </>
  );
}

async function Deck() {
  const progress = await loadProgressMap(["flashcard"]);
  const withCards = new Set(FLASHCARDS.map((f) => f.moduleId).filter(Boolean));
  const modules = MODULES.filter((m) => withCards.has(m.id)).map((m) => ({ id: m.id, number: m.number, title: m.title }));
  return <FlashcardDeck initial={progress} modules={modules} />;
}

function DeckSkeleton() {
  return (
    <div role="status" aria-label="Loading flashcards" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-12 w-full rounded-full sm:w-80" />
        <Skeleton className="h-11 w-full rounded-full sm:w-72" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="mx-auto h-[23rem] w-full max-w-2xl rounded-[2rem] sm:h-[21rem]" />
      <Skeleton className="mx-auto h-12 w-full max-w-2xl rounded-full" />
    </div>
  );
}
