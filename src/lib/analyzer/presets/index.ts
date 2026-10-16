import { TRACKS, type TrackKey } from "@/lib/tracks";

import type { Preset } from "../types";
import { BUSINESS_PRESETS } from "./business";
import { CYBER_PRESETS } from "./cybersecurity";
import { DATA_PRESETS } from "./data";
import { PRODUCT_PRESETS } from "./product";
import { SOFTWARE_PRESETS } from "./software";

export const PRESETS: readonly Preset[] = [
  ...CYBER_PRESETS,
  ...SOFTWARE_PRESETS,
  ...DATA_PRESETS,
  ...PRODUCT_PRESETS,
  ...BUSINESS_PRESETS,
];

const BY_KEY = new Map(PRESETS.map((p) => [p.key, p]));

export function getPreset(key: string): Preset | undefined {
  return BY_KEY.get(key);
}

export function isPresetKey(key: unknown): key is string {
  return typeof key === "string" && BY_KEY.has(key);
}

/** Serializable preset metadata for the client picker. */
export type PresetSummary = { key: string; label: string; blurb: string; track: TrackKey; count: number };

export type PresetGroup = { track: TrackKey; label: string; presets: PresetSummary[] };

export function summarizePreset(p: Preset): PresetSummary {
  return {
    key: p.key,
    label: p.label,
    blurb: p.blurb,
    track: p.track,
    count: p.categories.reduce((n, c) => n + c.terms.length, 0),
  };
}

/** Presets grouped by track, with `first` (the user's track) leading. Empty tracks are omitted. */
export function presetGroups(first?: TrackKey): PresetGroup[] {
  const order = [...TRACKS].sort((a, b) => (a.key === first ? -1 : b.key === first ? 1 : 0));
  return order
    .map((t) => ({ track: t.key, label: t.label, presets: PRESETS.filter((p) => p.track === t.key).map(summarizePreset) }))
    .filter((g) => g.presets.length > 0);
}

/** The preset to preselect for a track. */
export function defaultPresetFor(track: TrackKey): string {
  return PRESETS.find((p) => p.track === track)?.key ?? PRESETS[0].key;
}

/** Display label for a stored Analysis.preset value. */
export function presetLabel(key: string): string {
  if (key === "custom") return "Job description";
  return BY_KEY.get(key)?.label ?? key;
}
