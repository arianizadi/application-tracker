import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { pad2, SectionTitle, TrackChips } from "@/components/prep/bits";
import { PrepIcon } from "@/components/prep/icons";
import {
  LessonToc,
  ModuleCompleteButton,
  ModuleCompleteSkeleton,
  ModuleDoneBadge,
  ModuleProgressMeter,
  ModuleProgressMeterSkeleton,
  ObjectivesChecklist,
  QuestionCard,
  ResourceProgressActions,
  TermsGlossary,
  type TocItem,
} from "@/components/prep/lesson-islands";
import { PrepProgressProvider } from "@/components/prep/progress-context";
import { ResourceCard } from "@/components/prep/resource-card";
import { Blocks, lessonHeadings, plainText, RichText, safeHref } from "@/components/prep/rich-text";
import { Mascot } from "@/components/mascots";
import { getAdjacentModules, getModule, MODULE_IDS, MODULES, RESOURCE_BY_ID } from "@/content/prep";
import { loadProgressMap } from "@/lib/prep/queries";

export function generateStaticParams() {
  return MODULE_IDS.map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({ params }: PageProps<"/prep/[moduleId]">): Promise<Metadata> {
  const { moduleId } = await params;
  const mod = getModule(moduleId);
  if (!mod) return { title: "Interview prep" };
  return { title: `${mod.title} · Interview prep`, description: plainText(mod.hook) };
}

export default async function ModulePage({ params }: PageProps<"/prep/[moduleId]">) {
  const { moduleId } = await params;
  const mod = getModule(moduleId);
  if (!mod) notFound();

  const questionIds = mod.questions.map((q) => q.id);
  const resourceIds = new Set([...mod.resourceIds, ...mod.lab.resourceIds]);
  const itemIds = new Set(questionIds);
  // Started here, unwrapped by client islands inside their own <Suspense>, so the lesson itself prerenders.
  const progress = loadProgressMap(["module", "question", "resource"], (kind, id) =>
    kind === "module" ? id === mod.id : kind === "question" ? itemIds.has(id) : resourceIds.has(id),
  );

  const { prev, next } = getAdjacentModules(mod.id);
  const headings = lessonHeadings(mod.lesson);
  const toc: TocItem[] = [
    { id: "objectives", label: "What you'll learn" },
    ...headings.map((h) => ({ id: h.id, label: h.text, sub: true })),
    { id: "say-it", label: "Say it like this" },
    { id: "terms", label: "Key terms" },
    { id: "practice", label: "Practice questions" },
    { id: "lab", label: "Hands-on lab" },
    { id: "resources", label: "Resources" },
    { id: "finish", label: "Finish the module" },
  ];
  const resources = mod.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter((r) => r !== undefined);
  const labResources = mod.lab.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter((r) => r !== undefined);

  return (
    <PrepProgressProvider progress={progress}>
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link href="/prep" className="inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-ink-soft hover:text-ink">
          <PrepIcon name="arrow-left" className="size-4" /> Interview prep
        </Link>
      </nav>

      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-line bg-card px-5 pb-6 pt-6 shadow-soft sm:px-8 sm:pb-8 sm:pt-8">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-moss-soft/70 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -right-2 bottom-0 hidden font-display text-[9rem] font-semibold leading-none text-paper-2 sm:block">
          {pad2(mod.number)}
        </div>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              Module {pad2(mod.number)} of {MODULES.length}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              <PrepIcon name="clock" className="size-3.5" /> about {mod.hours} {mod.hours === 1 ? "hour" : "hours"}
            </span>
            <Suspense fallback={null}>
              <ModuleDoneBadge moduleId={mod.id} />
            </Suspense>
          </div>
          <h1 className="mt-3 max-w-3xl text-[2.1rem] font-semibold leading-[1.08] sm:text-5xl">{mod.title}</h1>
          <p className="mt-3 max-w-2xl font-display text-lg italic leading-snug text-ink-soft sm:text-xl">
            <RichText text={mod.hook} />
          </p>
          <TrackChips tracks={mod.tracks} className="mt-4" />
          <div className="mt-6 max-w-md">
            <Suspense fallback={<ModuleProgressMeterSkeleton />}>
              <ModuleProgressMeter questionIds={questionIds} />
            </Suspense>
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        <aside className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-8 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:pb-6">
            <LessonToc items={toc} />
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <section id="objectives" aria-labelledby="objectives-title" className="mb-12 scroll-mt-24 rounded-3xl border border-line bg-paper-2/50 p-4 sm:p-6">
            <h2 id="objectives-title" className="mb-1 px-2 text-xl font-semibold">
              By the end, you can…
            </h2>
            <p className="mb-3 px-2 text-sm text-muted">Tick them off as they click. These checks live on this device only.</p>
            <ObjectivesChecklist moduleId={mod.id} objectives={mod.objectives} />
          </section>

          <div className="max-w-[68ch]">
            <Blocks blocks={mod.lesson} />
          </div>

          <section id="say-it" aria-labelledby="say-it-title" className="mt-16 scroll-mt-24">
            <div className="relative overflow-hidden rounded-[2rem] border border-berry/25 bg-gradient-to-br from-berry-soft via-card to-card p-5 shadow-soft sm:p-8">
              <span aria-hidden className="absolute -left-1 -top-8 font-display text-[8rem] leading-none text-berry/15">
                &ldquo;
              </span>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-berry">Interview-ready summary</p>
                <h2 id="say-it-title" className="mt-1 text-[1.55rem] font-semibold leading-tight sm:text-[1.85rem]">
                  Say it like this
                </h2>
                <blockquote className="mt-4 max-w-[64ch] font-display text-[18px] leading-[1.7] text-ink sm:text-[19.5px]">
                  <RichText text={mod.sayItLikeThis} />
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <Mascot name="pip" mood="happy" animate={false} className="size-12 shrink-0" />
                  <p className="text-sm text-ink-soft">
                    Pip&apos;s tip: read it aloud twice, then say it in your own words without looking. Under a minute is perfect.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="terms" aria-labelledby="terms-title" className="mt-16 scroll-mt-24">
            <SectionTitle id="terms-title" icon="book" title="Key terms" />
            <TermsGlossary terms={mod.terms} />
          </section>

          <section id="practice" aria-labelledby="practice-title" className="mt-16 scroll-mt-24">
            <SectionTitle id="practice-title" icon="mic" title="Practice questions" kicker={`${mod.questions.length} questions`} />
            <p className="mb-5 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">
              Answer out loud first (really, out loud), then reveal the model answer. Mark <strong className="text-ink">Practiced</strong> once you&apos;ve had a go and{" "}
              <strong className="text-ink">Confident</strong> when you could answer it in an interview tomorrow.
            </p>
            <ol className="flex flex-col gap-4">
              {mod.questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} />
              ))}
            </ol>
            <p className="mt-5 text-sm text-ink-soft">
              Want it under pressure?{" "}
              <Link href={`/prep/mock?modules=${encodeURIComponent(mod.id)}`} className="font-medium text-moss underline decoration-moss/35 underline-offset-[3px] hover:decoration-moss">
                Run a timed mock with these questions
              </Link>
              .
            </p>
          </section>

          <section id="lab" aria-labelledby="lab-title" className="mt-16 scroll-mt-24">
            <SectionTitle id="lab-title" icon="flask" title="Hands-on lab" kicker="Build something you can talk about" />
            <div className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-7">
              <h3 className="text-xl font-semibold leading-snug">
                <RichText text={mod.lab.title} links={false} />
              </h3>
              <ol className="mt-5 space-y-0">
                {mod.lab.steps.map((step, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < mod.lab.steps.length - 1 ? (
                      <span aria-hidden className="absolute left-[15px] top-9 bottom-1 w-0.5 border-l-2 border-dotted border-line-strong" />
                    ) : null}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bark/15 font-mono text-[13px] font-semibold text-bark">
                      {i + 1}
                    </span>
                    <p className="min-w-0 pt-1 text-[15.5px] leading-[1.7] text-ink">
                      <RichText text={step} />
                    </p>
                  </li>
                ))}
              </ol>
              {labResources.length > 0 || mod.lab.links.length > 0 ? (
                <div className="mt-6 border-t border-line pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Use these</p>
                  <ul className="flex flex-col gap-1">
                    {[...labResources.map((r) => ({ title: r.title, url: r.url, meta: r.time })), ...mod.lab.links.map((l) => ({ title: l.title, url: l.url, meta: null }))].map((l) => (
                      <ExternalRow key={l.url + l.title} title={l.title} url={l.url} meta={l.meta} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <section id="resources" aria-labelledby="resources-title" className="mt-16 scroll-mt-24">
            <SectionTitle id="resources-title" icon="bookmark" title="Resources" kicker="Go deeper" />
            {resources.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {resources.map((r) => (
                  <li key={r.id}>
                    <ResourceCard resource={r} actions={<ResourceProgressActions resource={{ id: r.id, title: r.title }} />} />
                  </li>
                ))}
              </ul>
            ) : null}
            {mod.extraLinks.length > 0 ? (
              <div className="mt-6 rounded-3xl border border-line bg-paper-2/50 p-4 sm:p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Also worth a look</p>
                <ul className="flex flex-col gap-1">
                  {mod.extraLinks.map((l) => (
                    <ExternalRow key={l.url + l.title} title={l.title} url={l.url} />
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-4 text-sm text-muted">
              More in the{" "}
              <Link href="/prep/resources" className="font-medium text-moss underline decoration-moss/35 underline-offset-[3px] hover:decoration-moss">
                resource library
              </Link>
              .
            </p>
          </section>

          <section id="finish" aria-label="Finish the module" className="mt-16 scroll-mt-24 rounded-[2rem] border border-line bg-card px-5 py-8 shadow-soft sm:px-8">
            <Suspense fallback={<ModuleCompleteSkeleton />}>
              <ModuleCompleteButton
                moduleId={mod.id}
                title={mod.title}
                questionIds={questionIds}
                next={next ? { href: `/prep/${next.id}`, title: next.title } : null}
              />
            </Suspense>
          </section>

          <nav aria-label="Module navigation" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/prep/${prev.id}`}
                className="group flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-card px-4 py-3 shadow-soft transition-colors hover:border-moss/40"
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <PrepIcon name="arrow-left" className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Module {pad2(prev.number)}
                </span>
                <span className="mt-0.5 font-display text-[17px] font-semibold leading-snug">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={`/prep/${next.id}`}
                className="group flex min-h-16 flex-col items-end justify-center rounded-2xl border border-line bg-card px-4 py-3 text-right shadow-soft transition-colors hover:border-moss/40"
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  Module {pad2(next.number)} <PrepIcon name="arrow-right" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-0.5 font-display text-[17px] font-semibold leading-snug">{next.title}</span>
              </Link>
            ) : (
              <Link
                href="/prep/mock"
                className="group flex min-h-16 flex-col items-end justify-center rounded-2xl border border-moss/30 bg-moss-soft/60 px-4 py-3 text-right transition-colors hover:border-moss/60"
              >
                <span className="text-xs font-medium text-moss">End of the trail</span>
                <span className="mt-0.5 font-display text-[17px] font-semibold leading-snug">Try a full mock interview →</span>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </PrepProgressProvider>
  );
}

function ExternalRow({ title, url, meta }: { title: string; url: string; meta?: string | null }) {
  const href = safeHref(url);
  if (!href) return null;
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {}
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-11 items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-paper-2"
      >
        <PrepIcon name="external" className="size-4 shrink-0 text-muted group-hover:text-moss" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium leading-snug text-ink group-hover:text-moss">
            <RichText text={title} links={false} />
          </span>
          <span className="block truncate text-xs text-muted">
            {host}
            {meta ? ` · ${meta}` : ""}
          </span>
        </span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </li>
  );
}
