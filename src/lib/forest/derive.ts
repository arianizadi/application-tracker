// CONTRACT STUB — replaced by the forest implementation. Keep the exported names and signatures stable.
import type { UserSnapshot } from "@/lib/data/snapshot";

/** Everything the <Forest> scene needs to render. Serializable (plain data). */
export type ForestState = {
  /** 0–23 in the user's time zone; drives sky palette. */
  hour: number;
  season: "spring" | "summer" | "autumn" | "winter";
  trees: { id: string; kind: string; x: number; scale: number; growth: number }[];
  [key: string]: unknown;
};

export function deriveForest(snapshot: UserSnapshot, now: Date, timeZone: string): ForestState {
  void snapshot;
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone }).format(now));
  return { hour, season: "autumn", trees: [] };
}

/** A pleasant sample forest for the marketing page and empty previews. */
export function demoForest(hour = 17): ForestState {
  return { hour, season: "autumn", trees: [] };
}
