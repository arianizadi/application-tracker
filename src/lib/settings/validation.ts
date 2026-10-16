/** Shared, isomorphic helpers for settings (safe to import from client components). */

export const WEEKLY_GOAL_MIN = 1;
export const WEEKLY_GOAL_MAX = 30;
export const NAME_MAX = 60;
/** Mirrors the `timeZone` default in prisma/schema.prisma (used before a zone is detected or chosen). */
export const DEFAULT_TIME_ZONE = "America/Los_Angeles";

/** True when `tz` is an IANA time zone this runtime understands. */
export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || tz.length === 0 || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "America/Los_Angeles" → "America / Los Angeles" */
export function timeZoneLabel(tz: string): string {
  return tz.replace(/_/g, " ").replace(/\//g, " / ");
}
