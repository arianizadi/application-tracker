import type { TrackCode } from "@/content/prep/types";

/** Short chip labels for course track codes. Client-safe (no content imports). */
export const TRACK_LABELS: Record<TrackCode, string> = {
  ALL: "Everyone",
  SOC: "SOC",
  ENG: "Security eng.",
  OFF: "Offensive",
  APP: "AppSec",
  CLOUD: "Cloud",
  GRC: "GRC",
  DFIR: "DFIR",
  CTI: "Threat intel",
  DET: "Detection eng.",
  IAM: "IAM",
};

/** Longer names for tooltips and screen readers. */
export const TRACK_NAMES: Record<TrackCode, string> = {
  ALL: "Every security track",
  SOC: "Security operations (SOC)",
  ENG: "Security engineering",
  OFF: "Offensive security / pentesting",
  APP: "Application security",
  CLOUD: "Cloud security",
  GRC: "Governance, risk & compliance",
  DFIR: "Digital forensics & incident response",
  CTI: "Cyber threat intelligence",
  DET: "Detection engineering",
  IAM: "Identity & access management",
};

/** Order used by filter chips ("ALL" is the implicit "every track" option). */
export const TRACK_FILTER_ORDER: Exclude<TrackCode, "ALL">[] = ["SOC", "APP", "CLOUD", "GRC", "OFF", "ENG", "DFIR", "DET", "CTI", "IAM"];

export function isTrackCode(value: unknown): value is TrackCode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(TRACK_LABELS, value);
}

/** True when content tagged with `tracks` is relevant to the `filter` track ("ALL" content matches everything). */
export function matchesTrack(tracks: readonly TrackCode[], filter: TrackCode | null): boolean {
  if (!filter || filter === "ALL") return true;
  return tracks.includes("ALL") || tracks.includes(filter);
}
