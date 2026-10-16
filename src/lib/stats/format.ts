import type { Rate } from "@/lib/stats/compute";

/** "12%" (or "0.8%" under 1%), "—" when there is no denominator. */
export function pct(value: number | null | undefined, digits?: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const p = value * 100;
  const d = digits ?? (p > 0 && p < 1 ? 1 : 0);
  return `${p.toFixed(d)}%`;
}

/** "12%" for a rate; "—" when there's nothing to divide by. */
export function ratePct(rate: Rate): string {
  return pct(rate.value);
}

/** "7 of 40" */
export function rateFraction(rate: Rate): string {
  return `${rate.num} of ${rate.den}`;
}

/** Signed percentage-point difference, e.g. "+3 pts". */
export function pts(current: number | null, previous: number | null): { text: string; diff: number } | null {
  if (current === null || previous === null) return null;
  const diff = Math.round((current - previous) * 100);
  return { text: `${diff > 0 ? "+" : diff < 0 ? "−" : "±"}${Math.abs(diff)} pts`, diff };
}

export function signed(n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n)}`;
}

export function days(n: number | null): string {
  if (n === null) return "—";
  const r = Math.round(n * 10) / 10;
  return `${r} ${r === 1 ? "day" : "days"}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}K`;
}
