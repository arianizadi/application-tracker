"use server";

import type { ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { dateKeyInZone, dateKeyToDate, dateToKey, isDateKey, noonInZone } from "@/lib/applications/dates";
import {
  DIRTY_FIELDS,
  MAX,
  createApplicationSchema,
  formDataToObject,
  isEditableField,
  objectId,
  quickAddSchema,
  restoreSchema,
  statusSchema,
  toFieldErrors,
  updateApplicationSchema,
  type EditableField,
  type QuickAddInput,
} from "@/lib/applications/schema";
import type {
  ActionResult,
  ApplicationFormState,
  ApplicationListItem,
  DeletedApplication,
} from "@/lib/applications/types";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { LIMITS } from "@/lib/tracks";

/*
 * Every action: authenticates with requireUser() (never trusts a client userId),
 * validates with zod, scopes every query by userId, enforces LIMITS, then
 * invalidates the user's "applications" cache tag for read-your-writes.
 */

const LIST_SELECT = {
  id: true, company: true, role: true, status: true, workMode: true, location: true, source: true,
  url: true, excitement: true, deadline: true, followUpAt: true, appliedAt: true, resumeId: true,
  createdAt: true, updatedAt: true, history: true,
} as const;

const FULL_SELECT = {
  company: true, role: true, status: true, workMode: true, location: true, source: true, url: true,
  excitement: true, deadline: true, followUpAt: true, appliedAt: true, resumeId: true, createdAt: true,
  history: true, salary: true, contactName: true, notes: true,
} as const;

/** Stages that prove an application was submitted (so it can't go back to the wishlist). */
const BEYOND_APPLIED: ApplicationStatus[] = ["ASSESSMENT", "INTERVIEW", "OFFER", "ACCEPTED"];

const LIMIT_MESSAGE = `You've reached ${LIMITS.applications.toLocaleString()} applications — the most one account can hold. Export or tidy up old ones to keep going.`;

function today(timeZone: string): Date {
  return dateKeyToDate(dateKeyInZone(new Date(), timeZone));
}

async function underLimit(userId: string, adding = 1): Promise<boolean> {
  const count = await prisma.application.count({ where: { userId } });
  return count + adding <= LIMITS.applications;
}

/** Returns the resumeId only if that resume belongs to the user. */
async function ownedResumeId(userId: string, resumeId: string | null): Promise<string | null | false> {
  if (!resumeId) return null;
  const found = await prisma.resume.count({ where: { id: resumeId, userId } });
  return found ? resumeId : false;
}

/** Submitted applications (mirrors isSubmitted in lib/game/stats), for planting milestones. */
function submittedCount(userId: string): Promise<number> {
  return prisma.application.count({
    where: { userId, OR: [{ status: { notIn: ["WISHLIST", "WITHDRAWN"] } }, { appliedAt: { not: null } }] },
  });
}

async function defaultResumeId(userId: string): Promise<string | null> {
  const r = await prisma.resume.findFirst({ where: { userId, isDefault: true }, select: { id: true } });
  return r?.id ?? null;
}

/** Initial status history for a new record. Backdated applications get an APPLIED event on their real date. */
function initialHistory(status: ApplicationStatus, appliedAt: Date | null, now: Date) {
  if (status === "WISHLIST") return [{ status, at: now }];
  const applied = { status: "APPLIED" as const, at: appliedAt && appliedAt < now ? appliedAt : now };
  return status === "APPLIED" ? [applied] : [applied, { status, at: now }];
}

const idsSchema = z.array(objectId).min(1, "Pick at least one application.").max(MAX.bulk, `At most ${MAX.bulk} at a time.`);

// ─── Create ──────────────────────────────────────────────────────────────────

/** Full form create. useActionState-compatible: (prevState, formData). */
export async function createApplication(_prev: ApplicationFormState, formData: FormData): Promise<ApplicationFormState> {
  const user = await requireUser();
  const parsed = createApplicationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, error: "A couple of fields need a look.", fieldErrors: toFieldErrors(parsed.error) };
  const input = parsed.data;

  if (!(await underLimit(user.id))) return { ok: false, error: LIMIT_MESSAGE };
  const resumeId = await ownedResumeId(user.id, input.resumeId);
  if (resumeId === false) return { ok: false, fieldErrors: { resumeId: "That resume version isn't available anymore." } };

  const now = new Date();
  const submitted = input.status !== "WISHLIST";
  const appliedAt = submitted ? (input.appliedAt ?? today(user.timeZone)) : null;

  const created = await prisma.application.create({
    data: {
      ...input,
      userId: user.id,
      resumeId,
      appliedAt,
      history: initialHistory(input.status, appliedAt, now),
    },
    select: { id: true },
  });
  invalidate(user.id, "applications");
  return { ok: true, id: created.id, submitted: submitted ? await submittedCount(user.id) : undefined };
}

/** The under-ten-seconds flow: company + role (+ optional link/source/status). */
export async function quickAddApplication(input: QuickAddInput): Promise<ActionResult<{ item: ApplicationListItem; total: number }>> {
  const user = await requireUser();
  const parsed = quickAddSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the company and role." };
  const { company, role, url, source, status } = parsed.data;

  const count = await prisma.application.count({ where: { userId: user.id } });
  if (count >= LIMITS.applications) return { ok: false, error: LIMIT_MESSAGE };

  const now = new Date();
  const appliedAt = status === "WISHLIST" ? null : today(user.timeZone);
  const item = await prisma.application.create({
    data: {
      userId: user.id,
      company,
      role,
      url,
      source,
      status,
      appliedAt,
      resumeId: status === "WISHLIST" ? null : await defaultResumeId(user.id),
      history: initialHistory(status, appliedAt, now),
    },
    select: LIST_SELECT,
  });
  invalidate(user.id, "applications");
  // `total` drives the milestone toast, so count submitted applications, not wishlist saves.
  return { ok: true, data: { item, total: await submittedCount(user.id) } };
}

// ─── Update ──────────────────────────────────────────────────────────────────

/** Edit form save. Bind the id: `updateApplication.bind(null, id)`. Status changes go through updateStatus. */
export async function updateApplication(id: string, _prev: ApplicationFormState, formData: FormData): Promise<ApplicationFormState> {
  const user = await requireUser();
  const idOk = objectId.safeParse(id);
  if (!idOk.success) return { ok: false, error: "We couldn't find that application." };

  // Only write the fields the form says were edited, so a stale form can't revert
  // a follow-up, resume link or date changed elsewhere. Without the list, write all.
  const raw = formDataToObject(formData);
  const dirty = formData.get(DIRTY_FIELDS);
  const keys = typeof dirty === "string" ? dirty.split(",").filter(isEditableField) : (Object.keys(updateApplicationSchema.shape) as EditableField[]);
  if (keys.length === 0) return { ok: true, id, message: "Nothing to save." };
  const parsed = updateApplicationSchema.partial().safeParse(Object.fromEntries(keys.map((k) => [k, raw[k]])));
  if (!parsed.success) return { ok: false, error: "A couple of fields need a look.", fieldErrors: toFieldErrors(parsed.error) };
  const input = parsed.data;

  const existing = await prisma.application.findFirst({ where: { id, userId: user.id }, select: { status: true } });
  if (!existing) return { ok: false, error: "We couldn't find that application." };

  const data: Prisma.ApplicationUncheckedUpdateManyInput = { ...input };
  if (input.resumeId !== undefined) {
    const resumeId = await ownedResumeId(user.id, input.resumeId);
    if (resumeId === false) return { ok: false, fieldErrors: { resumeId: "That resume version isn't available anymore." } };
    data.resumeId = resumeId;
  }

  // Wishlist items have no applied date; submitted ones keep theirs unless edited.
  if (existing.status === "WISHLIST") data.appliedAt = null;
  else if (!input.appliedAt) delete data.appliedAt;

  const res = await prisma.application.updateMany({ where: { id, userId: user.id }, data });
  if (res.count === 0) return { ok: false, error: "We couldn't find that application." };
  invalidate(user.id, "applications");
  return { ok: true, id, message: "Saved to your account." };
}

export type StatusChange = { id: string; status: ApplicationStatus; previous: ApplicationStatus; appliedAt: Date | null; at: Date };

const dateKeySchema = z
  .string()
  .refine((v) => isDateKey(v) && +v.slice(0, 4) >= 2000 && +v.slice(0, 4) <= 2100, "Use a real date.");

/** Withdrawing from the wishlist ("I decided not to apply") isn't applying. */
function stampsAppliedAt(status: ApplicationStatus): boolean {
  return status !== "WISHLIST" && status !== "WITHDRAWN";
}

/**
 * Moves one application to a new stage: adds {status, at} to history and
 * stamps appliedAt the first time it's submitted. Light guard: anything that
 * reached an assessment or beyond can't go back to the wishlist.
 *
 * `dateKey` ("YYYY-MM-DD", optional) backdates the change to that day, for
 * replies logged a few days late. It's clamped to [applied day, today]. The
 * event is placed in date order; the newest event decides the current status,
 * so backfilling an earlier step only adds it to the timeline.
 */
export async function updateStatus(id: string, status: ApplicationStatus, dateKey?: string | null): Promise<ActionResult<StatusChange>> {
  const user = await requireUser();
  const parsed = z
    .object({ id: objectId, status: statusSchema, dateKey: dateKeySchema.nullish() })
    .safeParse({ id, status, dateKey });
  if (!parsed.success) return { ok: false, error: "That status change didn't make sense." };

  const app = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { status: true, appliedAt: true, createdAt: true, history: true },
  });
  if (!app) return { ok: false, error: "We couldn't find that application." };

  const now = new Date();
  if (app.status === status) {
    return { ok: true, data: { id, status, previous: app.status, appliedAt: app.appliedAt, at: now } };
  }
  if (status === "WISHLIST" && (BEYOND_APPLIED.includes(app.status) || app.history.some((h) => BEYOND_APPLIED.includes(h.status)))) {
    return { ok: false, error: "This one is past the wishlist stage — try Withdrawn instead." };
  }

  // When it happened: now, or noon on the chosen day in the user's zone.
  const todayKey = dateKeyInZone(now, user.timeZone);
  const floorKey = app.appliedAt ? dateToKey(app.appliedAt) : dateKeyInZone(app.createdAt, user.timeZone);
  let dayKey = parsed.data.dateKey ?? todayKey;
  if (dayKey > todayKey) dayKey = todayKey;
  if (dayKey < floorKey) dayKey = floorKey < todayKey ? floorKey : todayKey;
  const at = dayKey === todayKey ? now : noonInZone(dayKey, user.timeZone);

  const event = { status, at };
  const sorted = [...app.history, event].sort((a, b) => +a.at - +b.at).slice(-MAX.history);
  const latest = sorted[sorted.length - 1] === event;
  const current = latest ? status : app.status;
  const data: Prisma.ApplicationUpdateManyMutationInput = {
    status: current,
    history: latest && app.history.length < MAX.history ? { push: event } : { set: sorted },
  };
  let appliedAt = app.appliedAt;
  if (stampsAppliedAt(status) && !app.appliedAt) {
    appliedAt = dateKeyToDate(dayKey);
    data.appliedAt = appliedAt;
  } else if (current === "WISHLIST") {
    // Undoing an accidental "applied".
    appliedAt = null;
    data.appliedAt = null;
  }

  const res = await prisma.application.updateMany({ where: { id, userId: user.id }, data });
  if (res.count === 0) return { ok: false, error: "We couldn't find that application." };
  invalidate(user.id, "applications");
  return { ok: true, data: { id, status: current, previous: app.status, appliedAt, at } };
}

/** Moves many applications at once (not to the wishlist). Skips ones already in that stage. */
export async function bulkUpdateStatus(ids: string[], status: ApplicationStatus): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();
  const parsed = z.object({ ids: idsSchema, status: statusSchema }).safeParse({ ids, status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "That bulk change didn't make sense." };
  if (status === "WISHLIST") return { ok: false, error: "Bulk moves can't send applications back to the wishlist." };

  const unique = [...new Set(parsed.data.ids)];
  const now = new Date();
  const event = { status, at: now };
  const base = { id: { in: unique }, userId: user.id, status: { not: status } };

  // First stamp appliedAt on any that never had one (unless they're being withdrawn), then move the rest.
  const stamped = stampsAppliedAt(status)
    ? await prisma.application.updateMany({
        where: { ...base, appliedAt: null },
        data: { status, appliedAt: today(user.timeZone), history: { push: event } },
      })
    : { count: 0 };
  const moved = await prisma.application.updateMany({
    where: base,
    data: { status, history: { push: event } },
  });
  const count = stamped.count + moved.count;
  if (count > 0) invalidate(user.id, "applications");
  return { ok: true, data: { count } };
}

/** Sets or clears the follow-up date. `dateKey` is "YYYY-MM-DD" or null to clear. */
export async function setFollowUp(id: string, dateKey: string | null): Promise<ActionResult<{ followUpAt: Date | null }>> {
  const user = await requireUser();
  const parsed = z
    .object({ id: objectId, followUpAt: updateApplicationSchema.shape.followUpAt })
    .safeParse({ id, followUpAt: dateKey });
  if (!parsed.success) return { ok: false, error: "Pick a real date." };

  const followUpAt = parsed.data.followUpAt;
  const res = await prisma.application.updateMany({ where: { id, userId: user.id }, data: { followUpAt } });
  if (res.count === 0) return { ok: false, error: "We couldn't find that application." };
  invalidate(user.id, "applications");
  return { ok: true, data: { followUpAt } };
}

// ─── Duplicate ───────────────────────────────────────────────────────────────

/** Copies an application into a fresh wishlist entry (same company, role, details; no history). */
export async function duplicateApplication(id: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  if (!objectId.safeParse(id).success) return { ok: false, error: "We couldn't find that application." };
  const app = await prisma.application.findFirst({ where: { id, userId: user.id }, select: FULL_SELECT });
  if (!app) return { ok: false, error: "We couldn't find that application." };
  if (!(await underLimit(user.id))) return { ok: false, error: LIMIT_MESSAGE };

  const now = new Date();
  const copy = await prisma.application.create({
    data: {
      userId: user.id,
      company: app.company,
      role: app.role,
      location: app.location,
      workMode: app.workMode,
      url: app.url,
      source: app.source,
      salary: app.salary,
      excitement: app.excitement,
      contactName: app.contactName,
      notes: app.notes,
      deadline: app.deadline,
      resumeId: app.resumeId,
      status: "WISHLIST",
      appliedAt: null,
      history: [{ status: "WISHLIST", at: now }],
    },
    select: { id: true },
  });
  invalidate(user.id, "applications");
  return { ok: true, data: { id: copy.id } };
}

// ─── Delete & undo ───────────────────────────────────────────────────────────

/**
 * Deletes and returns the full record so the client can offer Undo
 * (restoreApplications). The record only ever goes back to its owner.
 */
export async function deleteApplication(id: string): Promise<ActionResult<{ deleted: DeletedApplication[] }>> {
  return bulkDeleteApplications([id]);
}

export async function bulkDeleteApplications(ids: string[]): Promise<ActionResult<{ deleted: DeletedApplication[] }>> {
  const user = await requireUser();
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Nothing to delete." };

  const unique = [...new Set(parsed.data)];
  const deleted = await prisma.application.findMany({ where: { id: { in: unique }, userId: user.id }, select: FULL_SELECT });
  if (deleted.length === 0) return { ok: false, error: "We couldn't find those applications." };
  await prisma.application.deleteMany({ where: { id: { in: unique }, userId: user.id } });
  invalidate(user.id, "applications");
  return { ok: true, data: { deleted } };
}

/** Recreates deleted applications (Undo). Re-validated like any new input; ids are newly assigned. */
export async function restoreApplications(records: DeletedApplication[]): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();
  const parsed = z.array(restoreSchema).min(1).max(MAX.bulk).safeParse(records);
  if (!parsed.success) return { ok: false, error: "We couldn't restore that — the data looked off." };
  if (!(await underLimit(user.id, parsed.data.length))) return { ok: false, error: LIMIT_MESSAGE };

  const resumeIds = [...new Set(parsed.data.map((r) => r.resumeId).filter((v): v is string => Boolean(v)))];
  const owned = new Set(
    resumeIds.length
      ? (await prisma.resume.findMany({ where: { id: { in: resumeIds }, userId: user.id }, select: { id: true } })).map((r) => r.id)
      : [],
  );

  const now = Date.now();
  await prisma.application.createMany({
    data: parsed.data.map((r) => ({
      ...r,
      userId: user.id,
      resumeId: r.resumeId && owned.has(r.resumeId) ? r.resumeId : null,
      createdAt: r.createdAt.getTime() > now ? new Date(now) : r.createdAt,
    })),
  });
  invalidate(user.id, "applications");
  return { ok: true, data: { count: parsed.data.length } };
}
