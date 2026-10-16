/** Time-zone aware helpers for the forest (pure; no reliance on the server's zone). */

export type Season = "spring" | "summer" | "autumn" | "winter";
export type TimeOfDay = "dawn" | "day" | "golden" | "dusk" | "night";

export type LocalParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Returns a reusable converter from Date → local calendar parts in `timeZone` (falls back to UTC). */
export function localClock(timeZone: string) {
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23",
    });
  } catch {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23",
    });
  }

  function parts(date: Date): LocalParts {
    const out: LocalParts = { year: 1970, month: 1, day: 1, hour: 0, minute: 0, weekday: 1 };
    for (const p of fmt.formatToParts(date)) {
      if (p.type === "year") out.year = Number(p.value);
      else if (p.type === "month") out.month = Number(p.value);
      else if (p.type === "day") out.day = Number(p.value);
      else if (p.type === "hour") out.hour = Number(p.value) % 24;
      else if (p.type === "minute") out.minute = Number(p.value);
      else if (p.type === "weekday") out.weekday = WEEKDAYS[p.value] ?? 1;
    }
    return out;
  }

  /** Days since the epoch for the local calendar date (great for "same day" / week math). */
  function dayNumber(date: Date): number {
    const p = parts(date);
    return Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86_400_000);
  }

  return { parts, dayNumber };
}

/** Meteorological seasons, northern hemisphere. */
export function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function timeOfDayOf(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "golden";
  if (hour >= 19 && hour < 21) return "dusk";
  return "night";
}

/** Accepts Date or ISO string (cached snapshots may round-trip through serialization). */
export function toTime(value: Date | string | null | undefined): number | null {
  if (value == null) return null;
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}
