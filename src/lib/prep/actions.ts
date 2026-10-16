"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { FLASHCARD_BY_ID, getModule, QUESTION_BY_ID, RESOURCE_BY_ID } from "@/content/prep";
import { requireUser } from "@/lib/auth/dal";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

import { isStateFor, PROGRESS_KINDS, type ProgressKind } from "./progress";

export type ProgressResult = { ok: true } | { ok: false; error: string };

const kindSchema = z.enum(PROGRESS_KINDS);
const itemIdSchema = z.string().min(1).max(80);

function itemExists(kind: ProgressKind, itemId: string): boolean {
  switch (kind) {
    case "module":
      return getModule(itemId) !== undefined;
    case "resource":
      return Object.prototype.hasOwnProperty.call(RESOURCE_BY_ID, itemId);
    case "question":
      return Object.prototype.hasOwnProperty.call(QUESTION_BY_ID, itemId);
    case "flashcard":
      return Object.prototype.hasOwnProperty.call(FLASHCARD_BY_ID, itemId);
  }
}

/**
 * Records the signed-in user's progress on one course item. Item ids must exist in the
 * course content, so the number of rows per user is bounded by the content itself.
 */
export async function setProgress(kind: ProgressKind, itemId: string, state: string): Promise<ProgressResult> {
  const user = await requireUser();
  const parsed = z.object({ kind: kindSchema, itemId: itemIdSchema, state: z.string().min(1).max(20) }).safeParse({ kind, itemId, state });
  if (!parsed.success) return { ok: false, error: "That doesn't look like a course item." };
  const data = parsed.data;
  if (!itemExists(data.kind, data.itemId)) return { ok: false, error: "That course item doesn't exist." };
  if (!isStateFor(data.kind, data.state)) return { ok: false, error: "That progress state isn't allowed here." };

  const where = { userId: user.id, kind: data.kind, itemId: data.itemId };
  try {
    await prisma.progress.upsert({
      where: { userId_kind_itemId: where },
      create: { ...where, state: data.state },
      update: { state: data.state },
    });
  } catch (error) {
    // Two quick taps can race the create; the loser just updates the row the winner made.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      console.error("[prep] setProgress failed", error);
      return { ok: false, error: "Couldn't save that just now. Try again in a moment." };
    }
    await prisma.progress.updateMany({ where, data: { state: data.state } });
  }
  invalidate(user.id, "progress");
  return { ok: true };
}

/** Removes the signed-in user's progress on one course item (e.g. un-marking a module). */
export async function clearProgress(kind: ProgressKind, itemId: string): Promise<ProgressResult> {
  const user = await requireUser();
  const parsed = z.object({ kind: kindSchema, itemId: itemIdSchema }).safeParse({ kind, itemId });
  if (!parsed.success) return { ok: false, error: "That doesn't look like a course item." };
  if (!itemExists(parsed.data.kind, parsed.data.itemId)) return { ok: false, error: "That course item doesn't exist." };

  await prisma.progress.deleteMany({ where: { userId: user.id, kind: parsed.data.kind, itemId: parsed.data.itemId } });
  invalidate(user.id, "progress");
  return { ok: true };
}
