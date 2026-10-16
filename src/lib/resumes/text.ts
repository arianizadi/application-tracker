/**
 * Pure text helpers for resume versions. No server-only imports, so these are
 * safe to use from client components too (e.g. word counts while pasting).
 */

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** MongoDB ObjectId shape check. Run before any query that takes an id from the client. */
export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID.test(value);
}

/**
 * Normalizes extracted or pasted resume text: unifies newlines, strips control
 * characters, collapses runs of spaces, trims each line and keeps at most one
 * blank line in a row. Returns the text and whether it was truncated to `maxChars`.
 */
export function normalizeResumeText(raw: string, maxChars: number): { text: string; truncated: boolean } {
  const cleaned = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[    - 　]/g, " ")
    .replace(/[​-‍﻿]/g, "")
    // Control characters except tab and newline.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\t/g, " ")
    .split("\n")
    .map((line) => line.replace(/ {2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= maxChars) return { text: cleaned, truncated: false };
  return { text: cleaned.slice(0, maxChars).trimEnd(), truncated: true };
}

export function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’+#./-]*/gu);
  return matches ? matches.length : 0;
}

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can for from has have i in into is it its me my of on or our over so " +
    "than that the their them then there these they this to too up us was we were what when where which while who " +
    "will with within without you your via per etc also using used use including include includes across about " +
    "more most other such through under both each all any via am pm jan feb mar apr may jun jul aug sep sept oct nov dec " +
    "january february march april june july august september october november december present"
  ).split(" "),
);

/** Lowercased content terms (keeps tech-ish tokens like c++, node.js, ci/cd). */
export function terms(text: string): string[] {
  const out: string[] = [];
  const re = /[\p{L}\p{N}][\p{L}\p{N}+#./-]*/gu;
  for (const match of text.toLowerCase().matchAll(re)) {
    const term = match[0].replace(/[./-]+$/, "");
    if (term.length < 2 || term.length > 40) continue;
    if (/^[\d.,/-]+$/.test(term)) continue; // bare numbers and dates
    if (STOPWORDS.has(term)) continue;
    out.push(term);
  }
  return out;
}

export type ResumeDiff = {
  /** Total words added/removed (multiset difference over content terms). */
  wordsAdded: number;
  wordsRemoved: number;
  /** Most frequent terms that are brand-new / gone entirely, most frequent first. */
  topAdded: string[];
  topRemoved: string[];
};

function tally(list: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of list) map.set(t, (map.get(t) ?? 0) + 1);
  return map;
}

/** Simple word-set diff between two versions of a resume's text. */
export function diffResumeText(previous: string, next: string, top = 6): ResumeDiff {
  const before = tally(terms(previous));
  const after = tally(terms(next));
  let wordsAdded = 0;
  let wordsRemoved = 0;
  const added: [string, number][] = [];
  const removed: [string, number][] = [];

  for (const [term, n] of after) {
    const old = before.get(term) ?? 0;
    if (n > old) wordsAdded += n - old;
    if (old === 0) added.push([term, n]);
  }
  for (const [term, n] of before) {
    const now = after.get(term) ?? 0;
    if (n > now) wordsRemoved += n - now;
    if (now === 0) removed.push([term, n]);
  }

  const rank = (a: [string, number], b: [string, number]) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]);
  return {
    wordsAdded,
    wordsRemoved,
    topAdded: added.sort(rank).slice(0, top).map(([t]) => t),
    topRemoved: removed.sort(rank).slice(0, top).map(([t]) => t),
  };
}

/** A download-safe ASCII file name ending in .pdf. */
export function safePdfFileName(name: string | null | undefined, fallback: string): string {
  const base = (name ?? "")
    .split(/[\\/]/)
    .pop()!
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9 ._()-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[\s._-]+|[\s._-]+$/g, "")
    .slice(0, 90);
  const fb = fallback.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "resume";
  return `${base || fb}.pdf`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
