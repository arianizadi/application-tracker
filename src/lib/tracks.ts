/** Career tracks a user can pick. Analyzer presets and prep suggestions key off these. */
export const TRACKS = [
  { key: "cybersecurity", label: "Cybersecurity" },
  { key: "software", label: "Software engineering" },
  { key: "data", label: "Data & AI" },
  { key: "product", label: "Product & design" },
  { key: "business", label: "Business, finance & consulting" },
  { key: "other", label: "Something else" },
] as const;

export type TrackKey = (typeof TRACKS)[number]["key"];
export const DEFAULT_TRACK: TrackKey = "cybersecurity";

export function isTrack(value: unknown): value is TrackKey {
  return TRACKS.some((t) => t.key === value);
}

/** Per-account caps so open sign-up can't be used to exhaust storage. */
export const LIMITS = {
  applications: 3000,
  resumes: 40,
  resumeBytes: 4 * 1024 * 1024,
  resumeTextChars: 60_000,
  analyses: 500,
  notesChars: 10_000,
  jobDescriptionChars: 30_000,
} as const;
