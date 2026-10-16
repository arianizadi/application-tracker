"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { NAME_MAX, WEEKLY_GOAL_MAX, WEEKLY_GOAL_MIN, isValidTimeZone } from "@/lib/settings/validation";
import { isTrack } from "@/lib/tracks";

export type SettingsField = "name" | "track" | "weeklyGoal" | "timeZone";

export type SettingsFormState =
  | {
      ok?: boolean;
      message?: string;
      error?: string;
      fieldErrors?: Partial<Record<SettingsField, string>>;
    }
  | undefined;

const nameSchema = z.string().trim().min(1, "What should we call you?").max(NAME_MAX, `Keep it under ${NAME_MAX} characters.`);
const trackSchema = z.string().trim().max(40).refine(isTrack, "Pick one of the tracks.");
const weeklyGoalSchema = z.coerce
  .number({ error: "Pick a number." })
  .int("Whole numbers only.")
  .min(WEEKLY_GOAL_MIN, `At least ${WEEKLY_GOAL_MIN} a week.`)
  .max(WEEKLY_GOAL_MAX, `${WEEKLY_GOAL_MAX} a week is the max. Be kind to yourself.`);
const timeZoneSchema = z.string().trim().max(64).refine(isValidTimeZone, "That time zone isn't recognized.");

const profileSchema = z.object({
  name: nameSchema,
  track: trackSchema,
  weeklyGoal: weeklyGoalSchema,
  timeZone: timeZoneSchema,
});

const preferencesSchema = z
  .object({
    name: nameSchema.optional(),
    track: trackSchema.optional(),
    weeklyGoal: weeklyGoalSchema.optional(),
    timeZone: timeZoneSchema.optional(),
  })
  .strict();

export type PreferencesInput = z.input<typeof preferencesSchema>;

function fieldErrors(error: z.ZodError): Partial<Record<SettingsField, string>> {
  const out: Partial<Record<SettingsField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "track" || key === "weeklyGoal" || key === "timeZone") out[key] ??= issue.message;
  }
  return out;
}

/**
 * Settings form (useActionState-compatible): name, track, weekly goal and
 * time zone in one save. The session user is read fresh from the database on
 * every request, so `refresh()` is enough for the whole UI to pick it up.
 */
export async function updateProfile(_state: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    track: formData.get("track"),
    weeklyGoal: formData.get("weeklyGoal"),
    timeZone: formData.get("timeZone"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  } catch (error) {
    console.error("Profile update failed", error instanceof Error ? error.name : "unknown");
    return { error: "Your changes didn't save. Your edits are still here, so try again in a moment." };
  }
  invalidate(user.id, "profile");
  refresh();
  return { ok: true, message: "Saved. Canopy is tuned to you." };
}

/**
 * Programmatic partial update for other features (e.g. onboarding, a weekly
 * goal stepper on the home page, or "use my device time zone" prompts).
 *
 *   await updatePreferences({ weeklyGoal: 3 })
 *   await updatePreferences({ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
 */
export async function updatePreferences(input: PreferencesInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Those settings don't look right." };
  }
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  if (Object.keys(data).length === 0) return { ok: true };

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (error) {
    console.error("Preferences update failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "That didn't save. Please try again." };
  }
  invalidate(user.id, "profile");
  refresh();
  return { ok: true };
}
