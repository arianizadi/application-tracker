import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PrepIcon } from "@/components/prep/icons";
import { MockInterview, type MockModule, type MockQuestion } from "@/components/prep/mock-interview";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { MODULES, QUESTIONS } from "@/content/prep";
import { loadProgressMap } from "@/lib/prep/queries";

export const metadata: Metadata = {
  title: "Mock interview · Interview prep",
  description: "Timed practice with real security interview questions, model answers and honest self-rating.",
};

const MOCK_MODULES: MockModule[] = MODULES.map((m) => ({ id: m.id, number: m.number, title: m.title }));
const MOCK_QUESTIONS: MockQuestion[] = QUESTIONS.map((q) => ({
  id: q.id,
  moduleId: q.moduleId,
  question: q.question,
  answer: q.answer,
  checking: q.checking,
  difficulty: q.difficulty,
}));

export default function MockPage({ searchParams }: PageProps<"/prep/mock">) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/prep" className="inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-ink-soft hover:text-ink">
          <PrepIcon name="arrow-left" className="size-4" /> Interview prep
        </Link>
      </nav>
      <PageHeader
        eyebrow="Mock interview"
        title="Practice like it's real"
        description="A short run of interview questions with an optional two-minute timer. Answer out loud, reveal the model answer, then rate yourself honestly."
      />
      <Suspense fallback={<MockSkeleton />}>
        <Mock searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Mock({ searchParams }: { searchParams: PageProps<"/prep/mock">["searchParams"] }) {
  const [params, progress] = await Promise.all([searchParams, loadProgressMap(["question"])]);
  const raw = typeof params.modules === "string" ? params.modules : "";
  const known = new Set(MOCK_MODULES.map((m) => m.id));
  const preselect = raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => known.has(id))
    .slice(0, MOCK_MODULES.length);
  return <MockInterview questions={MOCK_QUESTIONS} modules={MOCK_MODULES} initial={progress} preselect={preselect} />;
}

function MockSkeleton() {
  return (
    <div role="status" aria-label="Loading mock interview" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Skeleton className="h-96 rounded-[2rem]" />
      <Skeleton className="h-72 rounded-[2rem]" />
    </div>
  );
}
