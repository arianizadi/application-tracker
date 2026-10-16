/**
 * Time-zone aware calendar helpers. Everything is expressed as a "day index":
 * whole days since 1970-01-01 of the *local* calendar date in the user's zone,
 * so weeks and heatmaps line up with the user's own midnight, not UTC's.
 */

export const DAY_MS = 86_400_000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached) return cached;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" });
  } catch {
    fmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", year: "numeric", month: "numeric", day: "numeric" });
  }
  formatters.set(timeZone, fmt);
  return fmt;
}

/** Local calendar day of `date` in `timeZone`, as days since the epoch. */
export function dayIndex(date: Date, timeZone: string): number {
  const parts = formatterFor(timeZone).formatToParts(date);
  let y = 1970;
  let m = 1;
  let d = 1;
  for (const p of parts) {
    if (p.type === "year") y = Number(p.value);
    else if (p.type === "month") m = Number(p.value);
    else if (p.type === "day") d = Number(p.value);
  }
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

/**
 * Day index of a day-granular stored date (appliedAt, deadline, followUpAt).
 * Those are saved at 12:00 UTC of their calendar day, so the UTC day *is* the
 * user's day; converting them through a time zone would shift UTC+12…+14 users.
 */
export function dateOnlyIndex(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

/** 0 = Monday … 6 = Sunday (1970-01-01 was a Thursday). */
export function weekdayOf(index: number): number {
  return (((index + 3) % 7) + 7) % 7;
}

/** Day index of the Monday that starts the week containing `index`. */
export function weekStart(index: number): number {
  return index - weekdayOf(index);
}

const labelFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" });
const longFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" });

/** "Oct 6" for a day index. */
export function dayLabel(index: number): string {
  return labelFmt.format(new Date(index * DAY_MS));
}

/** "Mon, Oct 6, 2026" for a day index. */
export function dayLongLabel(index: number): string {
  return longFmt.format(new Date(index * DAY_MS));
}

/** "Oct" for a day index. */
export function monthLabel(index: number): string {
  return monthFmt.format(new Date(index * DAY_MS));
}

/** Day-of-month (1–31) for a day index. */
export function dayOfMonth(index: number): number {
  return new Date(index * DAY_MS).getUTCDate();
}

export const WEEKDAYS = [
  { short: "Mon", long: "Monday", plural: "Mondays" },
  { short: "Tue", long: "Tuesday", plural: "Tuesdays" },
  { short: "Wed", long: "Wednesday", plural: "Wednesdays" },
  { short: "Thu", long: "Thursday", plural: "Thursdays" },
  { short: "Fri", long: "Friday", plural: "Fridays" },
  { short: "Sat", long: "Saturday", plural: "Saturdays" },
  { short: "Sun", long: "Sunday", plural: "Sundays" },
] as const;
