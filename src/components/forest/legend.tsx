import type { CSSProperties, ReactNode } from "react";

import { FOREST_MILESTONES, type ForestAnimals, type ForestState } from "@/lib/forest/derive";
import { scenePalette } from "@/lib/forest/palette";

import { Beaver, Deer, Fox, Frog, Hedgehog, Moth, Otter, Owl, Rabbit, Raccoon, Sloth, Squirrel, Turtle } from "./art-critters";
import { Planter, SeedPacket, Sprout } from "./art-landmarks";
import { Blossoms, Buds, Compost, Crown, Fog, Ghost, Lantern, Log, Oak, Ribbon, Sapling } from "./art-trees";

function Icon({ viewBox, children, style }: { viewBox: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper-2" aria-hidden>
      <svg viewBox={viewBox} className="size-9" style={style}>
        {children}
      </svg>
    </span>
  );
}

type Entry = { key: string; icon: ReactNode; title: string; body: string; count?: number; show: boolean };

const ANIMAL_COPY: { key: keyof ForestAnimals; title: string; body: string; art: ReactNode; vb?: string }[] = [
  { key: "fox", title: "Pip the fox", body: "An interview is in progress. Pip is very proud of you.", art: <Fox />, vb: "-32 -50 52 54" },
  { key: "deer", title: "A deer", body: "Weekly goal met. Deer only visit calm, productive forests.", art: <Deer />, vb: "-24 -56 52 58" },
  { key: "rabbit", title: "Clover the rabbit", body: "You showed up on 3+ days this week. Hop hop.", art: <Rabbit /> },
  { key: "frog", title: "Fern the frog", body: "You did something today. Tiny steps count.", art: <Frog />, vb: "-16 -24 32 26" },
  { key: "squirrel", title: "Acorn the squirrel", body: "Archivist. Files every application, no matter how it went.", art: <Squirrel /> },
  { key: "beaver", title: "Nib the beaver", body: "Minding your resume library (one book per version).", art: <Beaver />, vb: "-26 -40 64 44" },
  { key: "raccoon", title: "Rue the raccoon", body: "Lanterns along the path, one per resume analysis.", art: <Raccoon /> },
  { key: "otter", title: "Miso the otter", body: "Celebration host. Shows up for ponds and offers.", art: <Otter /> },
  { key: "hedgehog", title: "Prickle the hedgehog", body: "Keeping you company after a recent no. It's their loss.", art: <Hedgehog />, vb: "-18 -30 40 32" },
  { key: "turtle", title: "Tuck the turtle", body: "Something has waited 3+ weeks. A friendly follow-up might help.", art: <Turtle />, vb: "-16 -20 42 22" },
  { key: "sloth", title: "Moss the sloth", body: "Napping, because nothing's changed in a week. Rest counts. Come back whenever.", art: <Sloth animate={false} />, vb: "-30 -40 54 44" },
  { key: "owl", title: "Alder the owl", body: "Works the night shift so you don't have to.", art: <Owl /> },
  { key: "moth", title: "Dot the moth", body: "It's late. Save your draft and get some sleep?", art: <Moth animate={false} />, vb: "-14 -12 28 20" },
];

/**
 * Explains what everything in the forest means. Shows only what's in this
 * forest (pass `showAll` for an FAQ-style full key).
 */
export function ForestLegend({ state, showAll = false, className = "" }: { state: ForestState; showAll?: boolean; className?: string }) {
  const pal = scenePalette(state.season === "winter" ? "summer" : state.season, "day");
  const c = state.counts;
  const tone = (kind: "oak" | "pine", golden = false) => {
    const t = pal.tree(kind, 0, 2, golden);
    return { "--c": t.c, "--s": t.s } as CSSProperties;
  };
  const always = showAll || c.planted === 0;
  const hasRibbon = state.trees.some((t) => t.ribbon != null);

  const entries: Entry[] = [
    {
      key: "tree",
      icon: (
        <Icon viewBox="-48 -124 96 128" style={tone("oak")}>
          <Oak />
        </Icon>
      ),
      title: "Application sent",
      body: "Every application plants a tree. Saplings fill out over about three weeks.",
      count: c.planted,
      show: true,
    },
    {
      key: "sapling",
      icon: (
        <Icon viewBox="-20 -46 40 50" style={tone("oak")}>
          <Sapling />
        </Icon>
      ),
      title: "Fresh sapling",
      body: "Planted in the last few days. Give it a minute, it's doing its best.",
      count: state.trees.filter((t) => t.stage === "sapling").length,
      show: showAll || state.trees.some((t) => t.stage === "sapling"),
    },
    {
      key: "seed",
      icon: (
        <Icon viewBox="-46 -36 92 40">
          <Planter />
          <g transform="translate(-14 0)">
            <SeedPacket tone={1} />
          </g>
          <g transform="translate(12 0)">
            <Sprout />
          </g>
        </Icon>
      ),
      title: "Wishlist seeds",
      body: "Saved roles wait in the planter. The ones you're most excited about are already sprouting.",
      count: c.wishlist,
      show: always || c.wishlist > 0,
    },
    {
      key: "buds",
      icon: (
        <Icon viewBox="-48 -124 96 128" style={tone("oak")}>
          <Oak />
          <Buds />
        </Icon>
      ),
      title: "Assessment",
      body: "Amber buds: an online assessment or take-home is in play.",
      count: c.assessment,
      show: showAll || c.assessment > 0,
    },
    {
      key: "blossoms",
      icon: (
        <Icon viewBox="-48 -124 96 128" style={tone("oak")}>
          <Oak />
          <Blossoms />
        </Icon>
      ),
      title: "Interviewing",
      body: "Lavender blossoms. Pip the fox drops by while it's happening.",
      count: c.interview,
      show: showAll || c.interview > 0,
    },
    {
      key: "offer",
      icon: (
        <Icon viewBox="-48 -124 96 128" style={tone("oak", true)}>
          <Oak />
          <Lantern />
        </Icon>
      ),
      title: "Offer",
      body: "The tree turns golden and hangs a lantern. It glows at night.",
      count: c.offer,
      show: showAll || c.offer > 0,
    },
    {
      key: "accepted",
      icon: (
        <Icon viewBox="-48 -146 96 150" style={tone("oak", true)}>
          <Oak />
          <Crown />
        </Icon>
      ),
      title: "Accepted",
      body: "A pennant goes up and bunting crosses the clearing. Party time.",
      count: c.accepted,
      show: showAll || c.accepted > 0,
    },
    {
      key: "compost",
      icon: (
        <Icon viewBox="-18 -18 52 22">
          <Compost shape={0} />
        </Icon>
      ),
      title: "Rejection, composted",
      body: "The tree stays. Mushrooms pop up and the next two trees grow faster. Rejections are fertilizer.",
      count: c.rejected,
      show: showAll || c.rejected > 0,
    },
    {
      key: "fog",
      icon: (
        <Icon viewBox="-40 -36 80 40">
          <g opacity=".7">
            <Fog />
          </g>
          <Ghost />
        </Icon>
      ),
      title: "Ghosted",
      body: "Silence is just fog. It thins out on its own, and the ghost is more confused than you are.",
      count: c.ghosted,
      show: showAll || c.ghosted > 0,
    },
    {
      key: "log",
      icon: (
        <Icon viewBox="-44 -28 84 32">
          <Log />
        </Icon>
      ),
      title: "Withdrawn",
      body: "You chose to step away. It becomes a mossy log, which the critters fully support.",
      count: c.withdrawn,
      show: showAll || c.withdrawn > 0,
    },
    {
      key: "ribbon",
      icon: (
        <Icon viewBox="-14 -34 28 36" style={tone("pine")}>
          <path d="M-4 0-3-34h6l1 34Z" fill="var(--k-trunk)" />
          <g style={{ "--rb": "var(--k-ribbon0)" } as CSSProperties}>
            <Ribbon />
          </g>
        </Icon>
      ),
      title: "Resume ribbon",
      body: "The ribbon's colour matches the resume version you sent.",
      show: showAll || hasRibbon,
    },
    {
      key: "edge",
      icon: (
        <Icon viewBox="-30 -26 60 30">
          <path d="M-20-22-12 0h-16ZM0-24 8 0H-8ZM18-20l7 20H11Z" fill="var(--f-hill-shade)" />
        </Icon>
      ),
      title: "Forest edge",
      body: `${state.overflow} older ${state.overflow === 1 ? "tree lives" : "trees live"} in the far tree line. Still counted, just further away.`,
      count: state.overflow,
      show: state.overflow > 0,
    },
  ];

  const animals = ANIMAL_COPY.filter((a) => showAll || state.animals[a.key]);
  const extras: string[] = [];
  if (state.animals.birds > 0) extras.push("birds (you've been active this week)");
  if (state.animals.fireflies > 0) extras.push("fireflies (it's evening)");

  const earned = FOREST_MILESTONES.filter((m) => c.planted >= m.at);
  const next = state.nextMilestone;

  return (
    <div className={`flex flex-col gap-6 ${className}`} style={pal.vars as CSSProperties}>
      <section aria-label="Field guide">
        <h3 className="text-base font-semibold">
          Field guide
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {entries
            .filter((e) => e.show)
            .map((e) => (
              <li key={e.key} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3">
                {e.icon}
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2 text-sm font-semibold text-ink">
                    {e.title}
                    {e.count != null && e.count > 0 && <span className="tabular text-xs font-medium text-muted">×{e.count}</span>}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{e.body}</p>
                </div>
              </li>
            ))}
        </ul>
      </section>

      {(earned.length > 0 || next) && (
        <section aria-label="Landmarks">
          <h3 className="text-base font-semibold">
            Landmarks
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {FOREST_MILESTONES.map((m) => {
              const got = c.planted >= m.at;
              if (!got && !showAll && m !== FOREST_MILESTONES.find((x) => x.at === next?.at)) return null;
              return (
                <li
                  key={m.key}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${
                    got ? "border-moss/30 bg-moss-soft text-moss-strong" : "border-dashed border-line-strong text-muted"
                  }`}
                >
                  <span aria-hidden>{got ? "✓" : "○"}</span>
                  {m.name}
                  <span className="tabular text-muted">· {m.at}</span>
                  {!got && next?.at === m.at && <span className="sr-only">, next landmark, {next.remaining} to go</span>}
                </li>
              );
            })}
          </ul>
          {next && (
            <p className="mt-2 text-[13px] text-ink-soft">
              {next.remaining === 1 ? "One more tree" : `${next.remaining} more trees`} until the {next.name.toLowerCase()}.
            </p>
          )}
        </section>
      )}

      {(animals.length > 0 || extras.length > 0) && (
        <section aria-label={showAll ? "Who lives here" : "Around right now"}>
          <h3 className="text-base font-semibold">
            {showAll ? "Who lives here" : "Around right now"}
          </h3>
          {animals.length > 0 && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {animals.map((a) => (
                <li key={a.key} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3">
                  <Icon viewBox={a.vb ?? "-26 -46 52 50"}>{a.art}</Icon>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{a.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {extras.length > 0 && <p className="mt-2 text-[13px] text-ink-soft">Also: {extras.join(" and ")}.</p>}
        </section>
      )}
    </div>
  );
}
