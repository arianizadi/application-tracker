// Run with: bun test src/lib/game/game.test.ts
// @ts-expect-error -- bun:test types (@types/bun) aren't installed in this repo; remove this line once they are.
import { describe, expect, test } from "bun:test";

import type { SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";

import { computeGame, type GameUser } from ".";

const NOW = new Date("2026-10-14T18:00:00Z"); // a Wednesday
const USER: GameUser = { weeklyGoal: 3, timeZone: "UTC", createdAt: new Date("2026-01-01T00:00:00Z"), track: "cybersecurity" };
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

function app(i: number, input: Partial<SnapshotApplication> = {}): SnapshotApplication {
  const appliedAt = input.appliedAt === undefined ? daysAgo(20) : input.appliedAt;
  return {
    id: `a${i}`,
    company: `Co ${i}`,
    role: "SOC Analyst",
    status: "APPLIED",
    workMode: null,
    source: null,
    excitement: 3,
    resumeId: null,
    appliedAt,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
    followUpAt: null,
    deadline: null,
    history: appliedAt ? [{ status: "APPLIED", at: appliedAt }] : [],
    ...input,
  };
}

const snap = (input: Partial<UserSnapshot> = {}): UserSnapshot => ({
  applications: input.applications ?? [],
  resumes: input.resumes ?? [],
  analyses: input.analyses ?? [],
  progress: input.progress ?? [],
});

describe("quests", () => {
  test("a pinned quest stays (and shows done) after its task is finished", () => {
    const before = computeGame(snap({ applications: [app(1)] }), USER, NOW);
    const memory = { xpBest: 0, quests: before.questPick };
    const resume = { id: "r1", label: "Main", version: 1, isDefault: true, createdAt: daysAgo(0) };
    const after = computeGame(snap({ applications: [app(1)], resumes: [resume] }), USER, NOW, memory);

    expect(before.questPick.ids).toContain("first-resume");
    expect(after.quests.map((q) => q.id)).toEqual(before.quests.map((q) => q.id));
    expect(after.quests.find((q) => q.id.startsWith("first-resume:"))?.done).toBe(true);
    // Without the pin, the finished quest would be swapped out for another one.
    const unpinned = computeGame(snap({ applications: [app(1)], resumes: [resume] }), USER, NOW);
    expect(unpinned.questPick.ids).not.toContain("first-resume");
  });

  test("a pick from another week is ignored", () => {
    const game = computeGame(snap(), USER, NOW, { xpBest: 0, quests: { week: 1, ids: ["status-tidy"] } });
    expect(game.quests.some((q) => q.id.startsWith("status-tidy:"))).toBe(false);
    expect(game.questPick.week).not.toBe(1);
  });

  test("pinned quests that can no longer be built drop off and are topped up", () => {
    const week = computeGame(snap(), USER, NOW).questPick.week;
    const game = computeGame(snap(), USER, NOW, { xpBest: 0, quests: { week, ids: ["analyze-newest", "prep-module"] } });
    expect(game.quests).toHaveLength(3);
    expect(game.quests.some((q) => q.id.startsWith("analyze-newest:"))).toBe(false);
    expect(game.quests.some((q) => q.id.startsWith("prep-module:"))).toBe(true);
  });
});

describe("xp", () => {
  test("never drops below the remembered best, so the level holds", () => {
    const full = computeGame(snap({ applications: [app(1), app(2), app(3)] }), USER, NOW);
    const trimmed = computeGame(snap({ applications: [app(1)] }), USER, NOW, { xpBest: full.xp, quests: null });
    expect(trimmed.xp).toBe(full.xp);
    expect(trimmed.level.index).toBe(full.level.index);
    expect(trimmed.xpBreakdown.reduce((sum, r) => sum + r.xp, 0)).toBe(full.xp);
  });

  test("grows past the remembered best", () => {
    const game = computeGame(snap({ applications: [app(1), app(2)] }), USER, NOW, { xpBest: 10, quests: null });
    expect(game.xp).toBeGreaterThan(10);
    expect(game.xpBreakdown.some((r) => r.key === "kept")).toBe(false);
  });
});
