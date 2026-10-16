import type { TrackKey } from "@/lib/tracks";

/** 1 = nice to mention, 2 = commonly asked for, 3 = core to the role. */
export type Weight = 1 | 2 | 3;

export type CategoryKind = "languages" | "tools" | "skills" | "concepts" | "frameworks" | "certs" | "soft";

export const KIND_LABELS: Record<CategoryKind | "custom", string> = {
  languages: "Languages",
  tools: "Tools",
  skills: "Skills",
  concepts: "Concepts",
  frameworks: "Frameworks",
  certs: "Certifications",
  soft: "Soft skills",
  custom: "Your phrases",
};

/** `[canonical term, weight, optional keyword-specific tip]` */
export type TermEntry = readonly [term: string, weight: Weight, tip?: string];

export type PresetCategory = {
  id: string;
  label: string;
  kind: CategoryKind;
  /** How to add this credibly: a project, lab, cert or coursework. */
  tip: string;
  terms: readonly TermEntry[];
};

export type Preset = {
  key: string;
  track: TrackKey;
  label: string;
  blurb: string;
  categories: readonly PresetCategory[];
};

/**
 * Rules for short or ambiguous aliases ("Go", "R", "AD", "Sigma"…).
 * All present conditions must pass.
 */
export type Guard = {
  /** Original-case spellings that count (e.g. ["Go", "GO"]); other casings are ignored. */
  cased?: readonly string[];
  /** At least one of these normalized tokens must appear within a few tokens. */
  near?: readonly string[];
  /** Reject when the previous token is one of these (e.g. "six" before "sigma"). */
  notAfter?: readonly string[];
  /** Reject when the next token is one of these (e.g. "injection" after "sql"). */
  notBefore?: readonly string[];
};

export type ConceptDef = {
  aliases?: readonly string[];
  /** Guards keyed by alias spelling (the canonical term itself may be guarded too). */
  guards?: Readonly<Record<string, Guard>>;
  /** Disable automatic singular/plural variants. */
  exact?: boolean;
  tip?: string;
};

export type Requirement = "required" | "mentioned" | "preferred";

export type FoundTerm = {
  id: string;
  term: string;
  category: string;
  categoryLabel: string;
  weight: Weight;
  /** The exact words in the resume that matched (may be an alias). */
  matchedAs: string;
  /** The resume line it came from, trimmed. */
  evidence: string;
  requirement?: Requirement;
  /** Credited because an alternative in an "X or Y" group was found. */
  viaAlternative?: string;
};

export type MissingTerm = {
  id: string;
  term: string;
  category: string;
  categoryLabel: string;
  weight: Weight;
  tip: string;
  requirement?: Requirement;
};

export type FlaggedTerm = { term: string; evidence: string; reason: string };

export type BonusTerm = { term: string; categoryLabel: string; matchedAs: string };

export type CategoryScore = {
  id: string;
  label: string;
  found: number;
  total: number;
  /** 0–100 */
  pct: number;
  tip: string;
};

export type AnalysisResult = {
  mode: "preset" | "jd";
  /** Preset key, or "custom" for a job description. */
  preset: string;
  title: string;
  score: number;
  grade: string;
  /** Too few recognized concepts for a meaningful percentage. */
  limited: boolean;
  summary: string;
  /** One-line explanation of how the number was computed. */
  method: string;
  found: FoundTerm[];
  missing: MissingTerm[];
  flagged: FlaggedTerm[];
  bonus: BonusTerm[];
  categoryScores: CategoryScore[];
  suggestions: string[];
  /** "Python or Java"-style groups recognized in a job description. */
  alternatives: string[][];
  /** Tool-looking words in the job description that aren't in the dictionary. */
  unrecognized: { term: string; inResume: boolean }[];
  stats: { recognized: number; found: number; resumeWords: number };
};

/** `fromPdf`: the resume text was extracted from an uploaded PDF (changes the short-text advice). */
export type AnalyzeInput =
  | { mode: "preset"; resumeText: string; presetKey: string; extraTerms?: string[]; title?: string; fromPdf?: boolean }
  | { mode: "jd"; resumeText: string; jobDescription: string; extraTerms?: string[]; title?: string; fromPdf?: boolean };
