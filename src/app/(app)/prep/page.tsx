import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SpeechBubble } from "@/components/mascots";
import { pad2, ProgressRing } from "@/components/prep/bits";
import { PrepIcon, type PrepIconName } from "@/components/prep/icons";
import { ModuleTrail } from "@/components/prep/module-trail";
import { RichText, safeHref } from "@/components/prep/rich-text";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { getModule, RESOURCE_BY_ID } from "@/content/prep";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { courseOverview, type CourseOverview } from "@/lib/prep/course";
import { getRecommendations, type Recommendation } from "@/lib/prep/detections";
import { toProgressMap } from "@/lib/prep/progress";

export const metadata: Metadata = {
  title: "Interview prep",
  description: "A cybersecurity internship interview course: 14 modules, practice questions, flashcards, resources and mock interviews.",
};

export default function PrepPage() {
  return (
    <>
      <PageHeader
        eyebrow="Interview prep"
        title="The prep trail"
        description="Fourteen short modules for security internship interviews. Read a little, say it out loud, practice the questions. Every step counts."
      />
      <Suspense fallback={<PrepSkeleton />}>
        <PrepContent />
      </Suspense>
    </>
  );
}

async function PrepContent() {
  const user = await requireUser();
  const snapshot = await getSnapshot(user.id);
  // Clock reads come after runtime data under Cache Components.
  const now = new Date();
  const overview = courseOverview(toProgressMap(snapshot.progress));
  const recs = [...getRecommendations(snapshot, user.track, now)].sort((a, b) => b.priority - a.priority).slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      <CourseHero overview={overview} />
      {recs.length > 0 ? <Recommendations items={recs} /> : null}
      <QuickLinks overview={overview} />
      {user.track !== "cybersecurity" ? (
        <p className="flex gap-3 rounded-2xl border border-line bg-paper-2/60 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          <PrepIcon name="info" className="mt-0.5 size-4 shrink-0 text-muted" />
          <span>
            This course is built for cybersecurity internships. The hiring, behavioral and portfolio modules (1, 12 and 14) carry over to any track.
          </span>
        </p>
      ) : null}
      <section aria-labelledby="trail-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="trail-heading" className="text-2xl font-semibold sm:text-3xl">
              The modules
            </h2>
            <p className="mt-1 text-sm text-muted">In order, or wherever your next interview needs you.</p>
          </div>
          <p className="text-sm text-muted tabular">
            {overview.modules.reduce((n, m) => n + m.hours, 0)} hours total
          </p>
        </div>
        <ModuleTrail modules={overview.modules} upNextId={overview.upNext?.id ?? null} />
      </section>
    </div>
  );
}

function CourseHero({ overview }: { overview: CourseOverview }) {
  const { progress, totals, upNext } = overview;
  const allDone = progress.modulesDone === totals.modules;
  const fresh = progress.modulesDone === 0 && progress.questionsPracticed === 0;
  const line = allDone
    ? "Every module done. Now it's reps: mock interviews and flashcards keep it fresh."
    : fresh
      ? "Start with module one. It explains what security interviewers actually look for, so the rest makes more sense."
      : progress.modulesDone === 0
        ? "You've started practicing. Finish a module to light up the first stone on the trail."
        : `${progress.modulesDone} down, ${totals.modules - progress.modulesDone} to go. A small plan beats a large panic.`;

  return (
    <section aria-label="Your course progress" className="relative overflow-hidden rounded-[2rem] border border-line bg-card shadow-soft">
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-moss-soft/80 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 size-64 rounded-full bg-sun-soft/80 blur-3xl" />
      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,18rem)] lg:items-center lg:gap-10">
        <div className="flex items-center gap-4 sm:gap-6 lg:block">
          <ProgressRing value={progress.modulesDone} max={totals.modules} size={128} stroke={9} label={`${progress.modulesDone} of ${totals.modules} modules complete`}>
            <span>
              <span className="block font-display text-4xl font-semibold leading-none tabular">{progress.modulesDone}</span>
              <span className="mt-1 block text-xs font-medium text-muted">of {totals.modules} modules</span>
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1 lg:hidden">
            <HeroCta upNext={upNext} />
          </div>
        </div>

        <div className="min-w-0">
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            <Stat label="Questions practiced" value={progress.questionsPracticed} total={totals.questions} tone="bg-sky" />
            <Stat label="Flashcards known" value={progress.flashcardsKnown} total={totals.flashcards} tone="bg-sun" />
            <Stat label="Resources done" value={progress.resourcesDone} total={totals.resources} tone="bg-berry" />
          </dl>
          <div className="mt-5 hidden lg:block">
            <HeroCta upNext={upNext} />
          </div>
        </div>

        <SpeechBubble mascot="alder" mood={allDone ? "cheer" : fresh ? "idle" : "happy"} size="sm" layout="row" line={line} />
      </div>
    </section>
  );
}

function HeroCta({ upNext }: { upNext: CourseOverview["upNext"] }) {
  if (!upNext) {
    return (
      <Link href="/prep/mock" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-moss px-5 text-sm font-medium text-paper shadow-soft hover:bg-moss-strong">
        <PrepIcon name="mic" className="size-4" /> Start a mock interview
      </Link>
    );
  }
  return (
    <Link
      href={`/prep/${upNext.id}`}
      className="group inline-flex min-h-12 max-w-full items-center gap-3 rounded-[1.75rem] bg-moss py-2 pl-2 pr-4 text-paper shadow-soft transition-colors hover:bg-moss-strong sm:pr-5"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper/15 font-display text-sm font-semibold">{pad2(upNext.number)}</span>
      <span className="min-w-0 text-left">
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">{upNext.started ? "Continue" : "Start here"}</span>
        <span className="line-clamp-2 block text-sm font-semibold leading-snug">{upNext.title}</span>
      </span>
      <PrepIcon name="arrow-right" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Stat({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-paper/70 px-3 py-3 sm:px-4">
      <dt className="text-[11.5px] font-medium leading-tight text-muted sm:text-xs">{label}</dt>
      <dd className="mt-1.5">
        <span className="font-display text-xl font-semibold leading-none tabular sm:text-3xl">{value}</span>
        <span className="text-xs text-muted tabular"> / {total}</span>
        <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper-2">
          <span className={`block h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
        </span>
      </dd>
    </div>
  );
}

function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <section aria-labelledby="recs-heading">
      <h2 id="recs-heading" className="sr-only">
        Recommended for you right now
      </h2>
      <SpeechBubble
        mascot="pip"
        mood="think"
        size="sm"
        layout="row"
        line={
          <>
            <span className="font-semibold">Recommended for you right now.</span> Picked from what&apos;s actually on your board, so the prep matches the interviews coming up.
          </>
        }
        className="mb-4"
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((rec) => {
          const modules = rec.moduleIds.map((id) => getModule(id)).filter((m) => m !== undefined);
          const resources = rec.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter((r) => r !== undefined);
          return (
            <li key={rec.id} className="flex flex-col rounded-3xl border border-coral/25 bg-gradient-to-br from-coral-soft/60 via-card to-card p-5 shadow-soft">
              <h3 className="text-lg font-semibold leading-snug">{rec.title}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">
                <RichText text={rec.message} />
              </p>
              {modules.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-1.5">
                  {modules.map((m) => (
                    <li key={m.id}>
                      <Link href={`/prep/${m.id}`} className="group flex min-h-11 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2 hover:border-moss/40">
                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-moss-soft font-display text-sm font-semibold text-moss">{pad2(m.number)}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.title}</span>
                        <PrepIcon name="arrow-right" className="size-4 shrink-0 text-moss transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              {resources.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-0.5">
                  {resources.map((r) => {
                    const href = safeHref(r.url);
                    if (!href) return null;
                    return (
                      <li key={r.id}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="group flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-sm text-ink-soft hover:bg-paper-2 hover:text-ink">
                          <PrepIcon name="external" className="size-3.5 shrink-0 text-muted group-hover:text-moss" />
                          <span className="min-w-0 flex-1 truncate">{r.title}</span>
                          <span className="shrink-0 text-xs text-muted">{r.time}</span>
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function QuickLinks({ overview }: { overview: CourseOverview }) {
  const { progress, totals } = overview;
  const links: { href: string; icon: PrepIconName; title: string; body: string; tint: string }[] = [
    {
      href: "/prep/flashcards",
      icon: "cards",
      title: "Flashcards",
      body: `${progress.flashcardsKnown} of ${totals.flashcards} known. Five minutes between classes.`,
      tint: "bg-sun-soft text-bark",
    },
    {
      href: "/prep/mock",
      icon: "mic",
      title: "Mock interview",
      body: "Timed questions, model answers, and an honest self-rating.",
      tint: "bg-coral-soft text-coral",
    },
    {
      href: "/prep/resources",
      icon: "book",
      title: "Resource library",
      body: `${totals.resources} curated picks${progress.resourcesSaved ? `, ${progress.resourcesSaved} saved` : ""}. Free-first, with honest costs.`,
      tint: "bg-sky-soft text-ink",
    },
  ];
  return (
    <nav aria-label="Practice tools">
      <ul className="grid gap-3 sm:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex h-full min-h-20 items-start gap-3 rounded-3xl border border-line bg-card p-4 shadow-soft transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-lift"
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${l.tint}`}>
                <PrepIcon name={l.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-display text-lg font-semibold leading-tight">
                  {l.title}
                  <PrepIcon name="arrow-right" className="size-4 text-moss opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-soft">{l.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PrepSkeleton() {
  return (
    <div role="status" aria-label="Loading your prep" className="flex flex-col gap-10">
      <Skeleton className="h-64 rounded-[2rem]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
      <div className="flex flex-col gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-[3.25rem_1fr] gap-3 sm:grid-cols-[4rem_1fr] sm:gap-5">
            <Skeleton className="mx-auto size-12 rounded-full sm:size-14" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
