/**
 * Date helpers shared by server and client.
 *
 * Day-granular fields (appliedAt, deadline, followUpAt) are stored at 12:00 UTC
 * of their calendar day and always formatted in UTC, so "Oct 16" stays Oct 16 in
 * every time zone. Real instants (status history) are formatted in the user's zone.
 */

const DAY_MS = 86_400_000;
const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function safeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

/** Calendar day ("YYYY-MM-DD") of an instant in a time zone. */
export function dateKeyInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Milliseconds the zone is ahead of UTC at `date`. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant of 12:00 local time on `key` in `timeZone` (a stable "that day" for backdated events). */
export function noonInZone(key: string, timeZone: string): Date {
  const guess = dateKeyToDate(key);
  return new Date(guess.getTime() - zoneOffsetMs(guess, timeZone));
}

export function isDateKey(value: string): boolean {
  const m = KEY_RE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** "YYYY-MM-DD" → Date at 12:00 UTC of that day. */
export function dateKeyToDate(key: string): Date {
  const m = KEY_RE.exec(key);
  if (!m) throw new Error("Invalid date key");
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
}

/** Day-granular stored Date → "YYYY-MM-DD" (UTC calendar day). */
export function dateToKey(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both "YYYY-MM-DD"). Positive when `to` is later. */
export function daysBetweenKeys(from: string, to: string): number {
  return Math.round((dateKeyToDate(to).getTime() - dateKeyToDate(from).getTime()) / DAY_MS);
}

export function addDaysToKey(key: string, days: number): string {
  return dateToKey(new Date(dateKeyToDate(key).getTime() + days * DAY_MS));
}

/** Whole days between two instants (floored, never negative). */
export function daysBetween(from: Date, to: Date | number): number {
  const end = typeof to === "number" ? to : to.getTime();
  return Math.max(0, Math.floor((end - from.getTime()) / DAY_MS));
}

/** "Oct 16" (adds the year when it differs from `todayKey`'s year). */
export function formatDateKey(key: string, todayKey?: string): string {
  if (!key) return "";
  const sameYear = todayKey ? key.slice(0, 4) === todayKey.slice(0, 4) : true;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(dateKeyToDate(key));
}

/** Format a real instant in the user's zone, e.g. "Oct 16, 3:42 PM". */
export function formatInstant(date: Date, timeZone: string, withTime = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

/** "today", "tomorrow", "in 3 days", "yesterday", "5 days ago". */
export function relativeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${-days} days ago`;
}

/** "3d", "2w", "4mo" for compact chips. */
export function shortDuration(days: number): string {
  const d = Math.abs(days);
  if (d < 14) return `${d}d`;
  if (d < 60) return `${Math.round(d / 7)}w`;
  return `${Math.round(d / 30)}mo`;
}

/** "12 days", "1 day", "3 weeks" for prose. */
export function longDuration(days: number): string {
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) {
    const w = Math.round(days / 7);
    return `${w} ${w === 1 ? "week" : "weeks"}`;
  }
  const m = Math.round(days / 30);
  return `${m} ${m === 1 ? "month" : "months"}`;
}
