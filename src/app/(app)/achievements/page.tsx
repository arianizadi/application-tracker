import type { Metadata } from "next";
import Link from "next/link";

import { AchievementBadge } from "@/components/game/achievement-badge";
import { LevelBadge } from "@/components/game/level-badge";
import { QuestList } from "@/components/game/quest-list";
import { StreakFlame } from "@/components/game/streak";
import { WeeklyGoalRing } from "@/components/game/weekly-goal-ring";
import { XpBar } from "@/components/game/xp-bar";
import { Mascot } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import {
  ACHIEVEMENT_GROUPS,
  ACHIEVEMENTS,
  GROUP_BLURBS,
  LEVELS,
  computeGame,
  isAchievementKey,
  type AchievementDef,
  type AchievementProgress,
} from "@/lib/game";
import { getEarnedAchievements } from "@/lib/game/queries";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Your level, XP, weekly rhythm and badge shelf.",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unlocked", label: "Earned" },
  { key: "locked", label: "Still growing" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

function parseFilter(value: string | string[] | undefined): Filter {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "unlocked" || v === "locked" ? v : "all";
}

function dateFormatter(timeZone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone });
  } catch {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }
}

export default async function AchievementsPage({ searchParams }: PageProps<"/achievements">) {
  const user = await requireUser();
  const [snapshot, earned, params] = await Promise.all([getSnapshot(user.id), getEarnedAchievements(user.id), searchParams]);
  const now = new Date();
  const game = computeGame(snapshot, user, now);
  const filter = parseFilter(params.show);
  const fmt = dateFormatter(user.timeZone);

  const earnedAt = new Map(earned.map((e) => [e.key, e.unlockedAt]));
  // Earned badges are forever, even if the data behind them later changes.
  const unlocked = new Set([...game.unlocked, ...earned.map((e) => e.key)].filter(isAchievementKey));
  const unlockedCount = unlocked.size;
  const lockedCount = ACHIEVEMENTS.length - unlockedCount;

  const visible = ACHIEVEMENTS.filter((a) =>
    filter === "unlocked" ? unlocked.has(a.key) : filter === "locked" ? !unlocked.has(a.key) : true,
  );

  const recent = [...earned]
    .filter((e) => isAchievementKey(e.key))
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())[0];
  const recentDef = recent ? ACHIEVEMENTS.find((a) => a.key === recent.key) : undefined;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        eyebrow="Achievements"
        title="Your badge shelf"
        description="XP comes from things you control: applying, updating, practicing. Rejections earn resilience, never penalties. Badges are forever."
      />

      {/* ── Hero: level, XP, next level ─────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <LevelBadge game={game} size="lg" showName={false} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Level {game.level.index} of {LEVELS.length}</p>
                <h2 className="mt-1 text-3xl font-semibold leading-tight">{game.level.name}</h2>
                <p className="mt-1 text-[15px] text-ink-soft">{game.level.blurb}</p>
              </div>
            </div>
            <XpBar game={game} />
            {game.nextLevel ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-paper-2/60 p-3.5">
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-card font-display text-lg font-semibold text-muted">
                  {game.nextLevel.index}
                </span>
                <p className="min-w-0 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Next up: {game.nextLevel.name}</span> at{" "}
                  <span className="tabular">{game.nextLevel.minXp.toLocaleString("en-US")}</span> XP. Adds {game.nextLevel.accent} to your forest.
                </p>
              </div>
            ) : (
              <p className="rounded-2xl bg-sun-soft p-3.5 text-sm text-ink">
                You reached the top of the trail. XP keeps counting, and nobody is asking for more.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-start">
            <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl bg-paper-2/70 p-4 sm:col-span-1 lg:col-span-2">
              <StreakFlame weeks={game.weekStreak} freezes={game.freezes} best={game.bestStreak} size={48} />
            </div>
            <div className="col-span-2 flex justify-center rounded-2xl bg-paper-2/70 p-4 sm:col-span-1 lg:col-span-2">
              <WeeklyGoalRing game={game} size={104} />
            </div>
            <Stat value={unlockedCount} label={unlockedCount === 1 ? "badge earned" : "badges earned"} />
            <Stat value={game.weeksMet} label={game.weeksMet === 1 ? "goal week" : "goal weeks"} />
          </div>
        </div>
        {game.frozeLastWeek ? (
          <p className="border-t border-line bg-sky-soft px-5 py-3 text-sm text-ink sm:px-6">
            Last week got away from you, so a rain check covered it. Your rhythm is safe.
          </p>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="This week's quests" description="Optional, cozy, and they reset every Monday." />
          <div className="p-5 pt-4 sm:p-6 sm:pt-4">
            <QuestList quests={game.quests} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Where your XP grew from" description="Effort counts. Outcomes don't decide your worth." />
          <div className="p-5 pt-4 sm:p-6 sm:pt-4">
            {game.xpBreakdown.length === 0 ? (
              <div className="flex items-center gap-4">
                <Mascot name="fern" mood="happy" className="size-16 shrink-0" />
                <p className="text-sm text-ink-soft">
                  Nothing yet, which just means the first XP is the easiest. Adding one role earns 5, submitting it earns 40.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {game.xpBreakdown.slice(0, 7).map((row) => (
                  <li key={row.key} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-ink-soft">
                      {row.label} <span className="text-muted tabular">×{row.count}</span>
                    </span>
                    <span className="font-semibold tabular">+{row.xp.toLocaleString("en-US")}</span>
                  </li>
                ))}
              </ul>
            )}
            {recentDef && recent ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sun-soft/70 p-3">
                <AchievementBadge def={recentDef} unlocked size={44} decorative />
                <p className="min-w-0 text-sm">
                  <span className="text-muted">Latest badge · </span>
                  <span className="font-semibold">{recentDef.name}</span>
                  <span className="text-muted"> · {fmt.format(new Date(recent.unlockedAt))}</span>
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* ── Badge shelf ──────────────────────────────────────────────────── */}
      <section aria-labelledby="badges-heading" className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="badges-heading" className="text-2xl font-semibold">Badges</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {unlockedCount === 0
                ? "Your first one is closer than you think."
                : `${unlockedCount} earned. Collect them at your own pace; none of these are homework.`}
            </p>
          </div>
          <nav aria-label="Filter badges" className="flex gap-1 self-start rounded-full border border-line bg-card p-1 sm:self-auto">
            {FILTERS.map((f) => {
              const n = f.key === "all" ? ACHIEVEMENTS.length : f.key === "unlocked" ? unlockedCount : lockedCount;
              const active = filter === f.key;
              return (
                <Link
                  key={f.key}
                  href={f.key === "all" ? "/achievements" : `/achievements?show=${f.key}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors sm:min-h-9 ${
                    active ? "bg-moss text-paper" : "text-ink-soft hover:bg-paper-2 hover:text-ink"
                  }`}
                >
                  {f.label}
                  <span className={`text-xs tabular ${active ? "text-paper/80" : "text-muted"}`}>{n}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {visible.length === 0 ? (
          <Card>
            {filter === "unlocked" ? (
              <EmptyState
                art={<Mascot name="fern" mood="happy" className="size-24" />}
                title="No badges yet. Plenty of potential."
                action={<ButtonLink href="/applications/new">Add an application</ButtonLink>}
              >
                Your first badge is one submitted application away. Fern believes in tiny hops.
              </EmptyState>
            ) : (
              <EmptyState art={<Mascot name="miso" mood="cheer" className="size-24" />} title="You found every badge!">
                Miso is doing backflips. Honestly, take the rest of the day off.
              </EmptyState>
            )}
          </Card>
        ) : (
          ACHIEVEMENT_GROUPS.map((group) => {
            const defs = visible.filter((a) => a.group === group);
            if (defs.length === 0) return null;
            const all = ACHIEVEMENTS.filter((a) => a.group === group);
            const got = all.filter((a) => unlocked.has(a.key)).length;
            return (
              <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <div className="min-w-0">
                    <h3 id={`group-${group}`} className="text-lg font-semibold">{group}</h3>
                    <p className="text-xs text-muted">{GROUP_BLURBS[group]}</p>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-muted tabular">
                    {got} of {all.length}
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {defs.map((def) => (
                    <BadgeCard
                      key={def.key}
                      def={def}
                      unlocked={unlocked.has(def.key)}
                      unlockedAt={earnedAt.get(def.key)}
                      progress={game.achievementProgress[def.key]}
                      fmt={fmt}
                    />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </section>

      {/* ── The trail of levels ─────────────────────────────────────────── */}
      <Card>
        <details className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-display text-lg font-semibold">The trail of levels</span>
              <span className="block text-sm text-muted">Eighteen stops. Nobody has to visit them all.</span>
            </span>
            <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </summary>
          <ol className="grid gap-2 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-3">
            {LEVELS.map((lvl) => {
              const reached = game.xp >= lvl.minXp;
              const current = lvl.index === game.level.index;
              return (
                <li
                  key={lvl.index}
                  aria-current={current ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    current ? "border-moss bg-moss-soft" : reached ? "border-line bg-card" : "border-dashed border-line bg-paper-2/50"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-semibold tabular ${
                      reached ? "bg-moss text-paper" : "bg-paper-2 text-muted ring-1 ring-inset ring-line"
                    }`}
                  >
                    {lvl.index}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-semibold ${reached ? "" : "text-muted"}`}>{lvl.name}</span>
                    <span className="block text-xs text-muted tabular">
                      {lvl.minXp.toLocaleString("en-US")} XP{current ? " · you are here" : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </details>
      </Card>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-paper-2/70 p-4">
      <p className="font-display text-3xl font-semibold leading-none tabular">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function BadgeCard({
  def,
  unlocked,
  unlockedAt,
  progress,
  fmt,
}: {
  def: AchievementDef;
  unlocked: boolean;
  unlockedAt: Date | undefined;
  progress: AchievementProgress | undefined;
  fmt: Intl.DateTimeFormat;
}) {
  const hidden = def.secret && !unlocked;
  const name = hidden ? "???" : def.name;
  const showMeter = !unlocked && !hidden && !def.keepsake && progress && progress.target > 1;

  return (
    <li
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center sm:p-4 ${
        unlocked ? "border-line bg-card shadow-soft" : "border-dashed border-line bg-paper-2/40"
      }`}
    >
      <AchievementBadge def={def} unlocked={unlocked} size={72} className={unlocked ? "animate-pop" : ""} />
      <p className={`font-display text-[15px] font-semibold leading-tight ${unlocked ? "" : "text-ink-soft"}`}>{name}</p>
      <p className="text-xs leading-relaxed text-ink-soft">
        {hidden ? "A secret. Keep exploring the forest." : unlocked ? def.description : def.hint}
      </p>
      <div className="mt-auto w-full pt-1">
        {unlocked ? (
          <p className="text-[11px] font-medium text-moss">
            {unlockedAt ? `Earned ${fmt.format(new Date(unlockedAt))}` : "Just earned"}
          </p>
        ) : def.keepsake ? (
          <p className="text-[11px] text-muted">Keepsake · arrives when it arrives</p>
        ) : showMeter && progress ? (
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.round((progress.current / progress.target) * 100)}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted tabular">
              {progress.current}/{progress.target}
              {def.unit ? ` ${def.unit}` : ""}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-muted">{hidden ? "Hidden" : "Not yet"}</p>
        )}
      </div>
    </li>
  );
}
