/**
 * Calendar helpers for the game engine. Everything is computed in the user's
 * chosen IANA time zone with Monday-start weeks, and is pure/deterministic for
 * a given (date, timeZone) pair.
 */

const DAY_MS = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatters.get(timeZone);
  if (fmt) return fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    });
  } catch {
    fmt = formatterFor("UTC");
  }
  formatters.set(timeZone, fmt);
  return fmt;
}

export type LocalParts = {
  /** Days since 1970-01-01 in the local calendar. */
  dayNum: number;
  /** Monday-start week index (week 0 contains 1970-01-01). */
  week: number;
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  /** 0–23 local hour. */
  hour: number;
};

export function localParts(date: Date, timeZone: string): LocalParts {
  const parts = formatterFor(timeZone).formatToParts(date);
  let y = 1970, m = 1, d = 1, h = 0;
  for (const p of parts) {
    if (p.type === "year") y = Number(p.value);
    else if (p.type === "month") m = Number(p.value);
    else if (p.type === "day") d = Number(p.value);
    else if (p.type === "hour") h = Number(p.value) % 24;
  }
  const dayNum = Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
  return { dayNum, week: weekOfDay(dayNum), weekday: (((dayNum + 3) % 7) + 7) % 7, hour: h };
}

/** 1970-01-01 was a Thursday, so shifting by 3 makes weeks start on Monday. */
export function weekOfDay(dayNum: number): number {
  return Math.floor((dayNum + 3) / 7);
}

/**
 * Day-granular fields (appliedAt, deadline, followUpAt) are stored at 12:00 UTC
 * of their calendar day, so they are a *day*, not an instant: the UTC day is
 * the user's day. Running them through a time zone would shift UTC+12…+14 users
 * a day forward, and their hour of day is meaningless.
 */
export function dayNumOfDateOnly(date: Date | string): number {
  return Math.floor(new Date(date).getTime() / DAY_MS);
}

export function partsOfDateOnly(date: Date | string): Omit<LocalParts, "hour"> {
  const dayNum = dayNumOfDateOnly(date);
  return { dayNum, week: weekOfDay(dayNum), weekday: (((dayNum + 3) % 7) + 7) % 7 };
}

export function weekOf(date: Date, timeZone: string): number {
  return localParts(date, timeZone).week;
}

/** The local calendar date (as a UTC-midnight Date) of the Monday that starts `week`. */
export function weekStartDate(week: number): Date {
  return new Date((week * 7 - 3) * DAY_MS);
}

export { DAY_MS };
