import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Forest } from "@/components/forest";
import {
  AchievementsMock,
  AnalyzerMock,
  CompostArt,
  PrepMock,
  QuickAddMock,
  ResumeMock,
  StatsMock,
} from "@/components/marketing/feature-mocks";
import { GoodbyeBanner } from "@/components/marketing/goodbye-banner";
import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";
import { Mascot, MASCOTS, type MascotName } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";
import { demoForest } from "@/lib/forest/derive";

export const metadata: Metadata = {
  title: { absolute: "Canopy — grow your internship search" },
  description:
    "A cozy, gamified internship tracker. Log applications in seconds, keep resume versions straight, check keyword match, prep for cybersecurity interviews, and watch a forest grow from your effort.",
  openGraph: {
    title: "Canopy — every application plants a tree",
    description: "The internship tracker that makes you want to apply. Free, private, and kind about rejections.",
    type: "website",
    siteName: "Canopy",
  },
};

const FEATURES: {
  mascot: MascotName;
  eyebrow: string;
  title: string;
  body: string;
  mock: React.ReactNode;
  span: string;
}[] = [
  {
    mascot: "clover",
    eyebrow: "Track",
    title: "Log an application in about ten seconds.",
    body: "Company and role is enough. Deadlines, links, contacts and notes can wait until you feel like it. Drafts save themselves, so closing the tab never costs you anything.",
    mock: <QuickAddMock />,
    span: "lg:col-span-7",
  },
  {
    mascot: "nib",
    eyebrow: "Resumes",
    title: "Know exactly which resume went where.",
    body: "Keep every version, tag a default, and see which one actually gets replies.",
    mock: <ResumeMock />,
    span: "lg:col-span-5",
  },
  {
    mascot: "rue",
    eyebrow: "Analyzer",
    title: "See your % match before you hit submit.",
    body: "Paste a job description and get a transparent keyword check: what's there, what's missing, and the evidence. A wording check, never a verdict.",
    mock: <AnalyzerMock />,
    span: "lg:col-span-5",
  },
  {
    mascot: "alder",
    eyebrow: "Stats",
    title: "Numbers that are honest and kind.",
    body: "Response rates, time-to-reply, which sources work, and how your weeks are trending, with benchmarks labeled for what they are.",
    mock: <StatsMock />,
    span: "lg:col-span-7",
  },
  {
    mascot: "pip",
    eyebrow: "Interview prep",
    title: "A cybersecurity prep course, built in.",
    body: "Fundamentals refreshers, practice questions, flashcards, and behavioral story prep, with progress that sticks around between sessions.",
    mock: <PrepMock />,
    span: "lg:col-span-7",
  },
  {
    mascot: "miso",
    eyebrow: "Achievements",
    title: "XP for the parts you control.",
    body: "Applying, following up, prepping, tidying your resume. Levels and badges reward effort, never outcomes that depend on a stranger's inbox.",
    mock: <AchievementsMock />,
    span: "lg:col-span-5",
  },
];

const STEPS: { n: string; mascot: MascotName; title: string; body: string }[] = [
  {
    n: "01",
    mascot: "fern",
    title: "Plant",
    body: "Add an application the moment you submit it. One tap on your phone, two fields, done. A tree goes in the ground.",
  },
  {
    n: "02",
    mascot: "tuck",
    title: "Tend",
    body: "Canopy remembers follow-ups and deadlines so you don't have to. Prep a little, tweak a resume, check the match.",
  },
  {
    n: "03",
    mascot: "miso",
    title: "Grow",
    body: "Interviews bring visitors, offers light lanterns, and your forest keeps a beautiful record of every time you showed up.",
  },
];

const PRIVACY: { title: string; body: string; icon: string }[] = [
  {
    title: "Only you can see it",
    body: "Every record is scoped to your account on the server. No public profiles, no leaderboards with your name.",
    icon: "M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  },
  {
    title: "Passwords done right",
    body: "Hashed with scrypt, never stored in plain text. Sessions use random tokens in httpOnly cookies.",
    icon: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Zm6 4v2",
  },
  {
    title: "No ads, no data sales",
    body: "Your job search is not a product. Nothing is shared with advertisers or recruiters.",
    icon: "M4 4l16 16M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6-.4.9-1.2 2.1-2.3 3.2M6.3 7.6C4.6 8.8 3.3 10.5 2.5 12c1 2 4.5 6 9.5 6 1.3 0 2.5-.3 3.6-.7",
  },
  {
    title: "No mystery AI",
    body: "The analyzer uses transparent keyword matching and shows its evidence. Your resume isn't sent off to a chatbot.",
    icon: "M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 14h9",
  },
  {
    title: "Export everything",
    body: "Download all of your applications, resume text, analyses and progress as JSON, whenever you like.",
    icon: "M12 4v11m0 0-4-4m4 4 4-4M5 19h14",
  },
  {
    title: "Delete means delete",
    body: "Closing your account removes your data right away. No 30-day guilt trip, no 'are you sure you're sure' maze.",
    icon: "M5 7h14M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  },
];

const CREW_ORDER: MascotName[] = ["alder", "pip", "moss", "fern", "nib", "clover", "rue", "tuck", "prickle", "miso", "dot", "acorn"];

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold leading-[1.05] sm:text-5xl">{title}</h2>
      {children ? <p className="mt-4 text-lg leading-relaxed text-ink-soft">{children}</p> : null}
    </div>
  );
}

function Toast({ mascot, title, body, className }: { mascot: MascotName; title: string; body: string; className: string }) {
  return (
    <div aria-hidden className={`absolute flex max-w-[15rem] items-center gap-3 rounded-2xl border border-line bg-card/95 p-2.5 pr-4 shadow-lift backdrop-blur ${className}`}>
      <Mascot name={mascot} mood="happy" className="size-11 shrink-0" animate={false} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted">{body}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <PublicHeader current="home" />
      <Suspense fallback={null}>
        <GoodbyeBanner />
      </Suspense>

      <main id="main" className="overflow-x-clip">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="grain relative">
          <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-20 lg:px-10 lg:pt-24">
            <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1 text-xs font-medium text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-leaf" />
              The internship tracker that&apos;s on your side
            </p>
            <h1
              className="mt-6 animate-rise text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.03em] sm:text-7xl lg:text-[6.5rem]"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1', animationDelay: "60ms" }}
            >
              Every application
              <br />
              <span className="italic text-moss">plants a tree.</span>
            </h1>
            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
              <p className="animate-rise text-lg leading-relaxed text-ink-soft sm:text-xl lg:col-span-7" style={{ animationDelay: "120ms" }}>
                Applying for internships is a lot. Canopy makes the boring parts fast and the progress visible: log an
                application in seconds, keep your resume versions straight, prep for interviews, and watch a forest grow from
                your effort. Even the rejections become compost.
              </p>
              <div className="flex animate-rise flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end" style={{ animationDelay: "180ms" }}>
                <ButtonLink href="/signup" size="lg">
                  Start growing — it&apos;s free
                </ButtonLink>
                <ButtonLink href="/login" variant="secondary" size="lg">
                  Sign in
                </ButtonLink>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted lg:text-right">No credit card. No streak guilt. Export everything, anytime.</p>
          </div>

          {/* Forest window */}
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-line bg-sky-soft shadow-lift">
                <div className="relative left-1/2 w-[175%] -translate-x-1/2 sm:w-[125%] lg:w-full">
                  <Forest state={demoForest(17)} className="block h-auto w-full" />
                </div>
              </div>
              <Mascot
                name="alder"
                mood="idle"
                className="absolute -top-10 right-6 size-20 drop-shadow-sm sm:-top-14 sm:right-12 sm:size-28"
                title="Alder the owl, perched on the forest frame"
              />
              <Toast
                mascot="clover"
                title="Planted! +10 XP"
                body="Security Analyst Intern · Hollow Oak Bank"
                className="-bottom-6 left-3 animate-float sm:left-8"
              />
              <Toast
                mascot="miso"
                title="An interview!"
                body="They want to meet the person behind the PDF."
                className="right-8 top-10 hidden animate-float md:flex [animation-delay:1.2s]"
              />
              <Toast
                mascot="prickle"
                title="A mushroom appeared"
                body="That one stung. The tree stays."
                className="bottom-10 right-1/3 hidden animate-float lg:flex [animation-delay:2.4s]"
              />
            </div>
          </div>
        </section>

        {/* ── What counts ─────────────────────────────────────────────────── */}
        <section aria-label="Everything counts" className="border-y border-line bg-paper-2/60">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-sm text-ink-soft sm:px-6 lg:px-10">
            {["Applications", "Follow-ups", "Online assessments", "Interviews", "Resume versions", "Prep sessions", "Rejections, too"].map(
              (item, i) => (
                <li key={item} className="flex items-center gap-6">
                  {i > 0 ? <span aria-hidden className="text-leaf">✦</span> : null}
                  <span className={item === "Rejections, too" ? "font-display italic text-ink" : ""}>{item}</span>
                </li>
              ),
            )}
          </ul>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <SectionHeading eyebrow="How it works" title="Three steps. Zero spreadsheets.">
            You handle the applying. Canopy remembers the work.
          </SectionHeading>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl font-semibold leading-none text-line-strong tabular" aria-hidden>
                    {step.n}
                  </span>
                  <Mascot name={step.mascot} mood="happy" className="size-20 -mr-1 -mt-1" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">
                  <span className="sr-only">Step {step.n}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-10">
          <SectionHeading eyebrow="What's inside" title={<>Everything the hunt needs, <span className="italic text-moss">nothing it doesn&apos;t.</span></>}>
            Built with cybersecurity students in mind, and useful for any internship search.
          </SectionHeading>
          <div className="mt-12 grid gap-5 lg:grid-cols-12">
            {FEATURES.map((f) => (
              <article key={f.eyebrow} className={`flex flex-col gap-6 rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-7 ${f.span}`}>
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{f.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight">{f.title}</h3>
                  </div>
                  <Mascot name={f.mascot} mood="idle" className="size-16 shrink-0" />
                </div>
                <p className="-mt-2 leading-relaxed text-ink-soft">{f.body}</p>
                <div className="mt-auto">{f.mock}</div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Compost ──────────────────────────────────────────────────────── */}
        <section className="border-y border-line bg-paper-2/70">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">About rejections</p>
              <h2 className="mt-3 text-4xl font-semibold leading-[1.05] sm:text-5xl">
                Rejections become <span className="italic">compost.</span>
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-lg leading-relaxed text-ink-soft">
                <p>
                  A &ldquo;no&rdquo; belongs to one application, not to you. In Canopy, a rejected application doesn&apos;t vanish
                  or wilt. The tree stays, a few mushrooms pop up beneath it, and the soil gets a little richer for whatever you
                  plant next.
                </p>
                <p>
                  Prickle the hedgehog will keep you company. No forced silver linings, no inspirational speech required. You
                  can take a minute.
                </p>
              </div>
            </div>
            <div className="relative rounded-[2rem] border border-line bg-card p-6 shadow-soft sm:p-8">
              <CompostArt className="h-auto w-full" />
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-paper-2 p-3">
                <Mascot name="prickle" mood="comfort" className="size-14 shrink-0" title="Prickle the hedgehog" />
                <p className="text-sm leading-snug text-ink-soft">
                  &ldquo;That one stung. Your effort did not become imaginary.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The crew ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
          <SectionHeading eyebrow="Meet the crew" title="Twelve small friends, each with one job.">
            They show up at the right moments with a useful nudge or a tiny celebration, then get out of your way.
          </SectionHeading>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {CREW_ORDER.map((key) => {
              const m = MASCOTS[key];
              return (
                <li key={key} className="group flex flex-col rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
                  <Mascot name={key} mood="idle" className="size-20 self-center transition-transform duration-300 group-hover:-translate-y-1 sm:size-24" />
                  <p className="mt-3 font-display text-lg font-semibold leading-tight">{m.name}</p>
                  <p className="text-xs capitalize text-muted">
                    {m.species} · {m.role}
                  </p>
                  {m.lines[0] ? <p className="mt-2 text-sm leading-snug text-ink-soft">&ldquo;{m.lines[0]}&rdquo;</p> : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Privacy ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-10">
          <SectionHeading eyebrow="Privacy & security" title="Your job search is nobody else's business.">
            Designed with a security mindset from the first line of code. Here&apos;s the short version.
          </SectionHeading>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIVACY.map((p) => (
              <li key={p.title} className="flex gap-4 rounded-3xl border border-line bg-card p-5 sm:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-moss-soft text-moss">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={p.icon} />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{p.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-moss px-6 py-14 text-paper shadow-lift sm:px-12 sm:py-20">
            <div aria-hidden className="absolute -right-10 -top-10 size-56 rounded-full bg-leaf/30 blur-2xl" />
            <div aria-hidden className="absolute -bottom-16 left-1/3 size-64 rounded-full bg-sun/20 blur-3xl" />
            <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-4xl font-semibold leading-[1.05] sm:text-6xl" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
                  Your forest is waiting.
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed opacity-90">
                  You don&apos;t need a whole plan to take one step. Plant one application today and let Canopy hold the rest.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/signup" variant="sun" size="lg">
                    Plant my first seed
                  </ButtonLink>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-paper/40 px-6 text-base font-medium text-paper transition-colors hover:bg-paper/10"
                  >
                    I already have a forest
                  </Link>
                </div>
              </div>
              <Mascot name="fern" mood="cheer" className="mx-auto size-36 sm:size-44" title="Fern the frog, cheering you on" />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
