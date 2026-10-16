import "server-only";

import { Prisma } from "@prisma/client";
import { cache } from "react";

import type { GameMemory, GameState } from "@/lib/game";
import { prisma } from "@/lib/prisma";

/**
 * Game memory lives in Progress rows under this reserved kind (no schema change needed).
 * Prep actions only accept course kinds, so users can't write these rows, and getSnapshot
 * excludes them so they never count as course progress.
 */
export const GAME_PROGRESS_KIND = "game";

const XP_BEST = "xp-best";
const QUESTS = "quests";

/** Zero-padded so the database's string comparison matches numeric order. */
const encodeXp = (xp: number) => String(Math.max(0, Math.floor(xp))).padStart(12, "0");

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

function parseQuests(state: string): GameMemory["quests"] {
  const sep = state.indexOf(":");
  const week = Number(state.slice(0, sep));
  if (sep < 0 || !Number.isInteger(week)) return null;
  return { week, ids: state.slice(sep + 1).split(",").filter(Boolean) };
}

/**
 * What the game remembers for one user. Uncached (tiny indexed read), deduped per request.
 * Returns null if it can't be read: callers fall back to plain derived values and skip saving.
 */
export const getGameMemory = cache(async (userId: string): Promise<GameMemory | null> => {
  let rows: { itemId: string; state: string }[];
  try {
    rows = await prisma.progress.findMany({
      where: { userId, kind: GAME_PROGRESS_KIND },
      select: { itemId: true, state: true },
    });
  } catch (error) {
    console.error("[game] memory read failed", error);
    return null;
  }
  const memory: GameMemory = { xpBest: 0, quests: null };
  for (const row of rows) {
    if (row.itemId === XP_BEST) {
      const xp = Number(row.state);
      if (Number.isFinite(xp)) memory.xpBest = xp;
    } else if (row.itemId === QUESTS) {
      memory.quests = parseQuests(row.state);
    }
  }
  return memory;
});

/** Raises the stored best, never lowers it (safe against concurrent renders). */
async function raiseXpBest(userId: string, xp: number): Promise<void> {
  const where = { userId, kind: GAME_PROGRESS_KIND, itemId: XP_BEST };
  const state = encodeXp(xp);
  const { count } = await prisma.progress.updateMany({ where: { ...where, state: { lt: state } }, data: { state } });
  if (count > 0) return;
  try {
    await prisma.progress.create({ data: { ...where, state } });
  } catch (error) {
    // The row exists and already holds an equal or higher value.
    if (!isUniqueViolation(error)) throw error;
  }
}

async function pinQuests(userId: string, pick: GameState["questPick"]): Promise<void> {
  const where = { userId, kind: GAME_PROGRESS_KIND, itemId: QUESTS };
  const state = `${pick.week}:${pick.ids.join(",")}`;
  try {
    await prisma.progress.upsert({ where: { userId_kind_itemId: where }, create: { ...where, state }, update: { state } });
  } catch (error) {
    // A concurrent render created the row first; the loser just updates it.
    if (!isUniqueViolation(error)) throw error;
    await prisma.progress.updateMany({ where, data: { state } });
  }
}

/**
 * Remembers what this render showed: a new XP high-water mark, and this week's quests the
 * first time they are picked. Call from Server Components only with the authenticated user's id.
 */
export async function saveGameMemory(
  userId: string,
  memory: GameMemory,
  game: Pick<GameState, "xp" | "questPick">,
): Promise<void> {
  const writes: Promise<void>[] = [];
  if (game.xp > memory.xpBest) writes.push(raiseXpBest(userId, game.xp));
  if (memory.quests?.week !== game.questPick.week) writes.push(pinQuests(userId, game.questPick));
  await Promise.all(writes);
}
