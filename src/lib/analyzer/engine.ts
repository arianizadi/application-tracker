/**
 * Canopy resume analyzer: a transparent, deterministic keyword heuristic.
 *
 * Pure module (no server-only imports) so it can run in tests, on the server,
 * or in the browser. It recognizes language; it does not judge competence,
 * fit, or what an ATS will do.
 */
import { CONCEPTS } from "./dictionary";
import { PRESETS, getPreset } from "./presets";
import {
  KIND_LABELS,
  type AnalysisResult,
  type AnalyzeInput,
  type BonusTerm,
  type CategoryKind,
  type CategoryScore,
  type FlaggedTerm,
  type FoundTerm,
  type Guard,
  type MissingTerm,
  type Requirement,
  type Weight,
} from "./types";

export const ENGINE_VERSION = 1;

/** In preset mode a category is "full" once this share of its weighted ideas is mentioned. */
export const CATEGORY_FILL = 0.5;
/** Fewer recognized job-description concepts than this → "limited dictionary coverage". */
export const SPARSE_MIN = 6;

const MULTIPLIER: Record<Requirement, number> = { required: 3, mentioned: 2, preferred: 1 };
const REQUIREMENT_RANK: Record<Requirement, number> = { preferred: 0, mentioned: 1, required: 2 };

// ── Normalization & tokenization ─────────────────────────────────────────────

/** Unicode-normalize, unify punctuation variants, and repair PDF line-break hyphenation. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[​-‍⁠﻿­]/g, "")
    .replace(/[‘’‚‛′ʼ`´]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐-―−﹘﹣－]/g, "-")
    .replace(/[  -   　\t\f\v]/g, " ")
    .replace(/\r\n?/g, "\n")
    // Lookarounds (not captures) keep this linear on long hyphen-free letter runs.
    .replace(/(?<=[A-Za-z]{2})-[ ]*\n[ ]*(?=[a-z]{2})/g, "")
    .replace(/ & /g, " and ");
}

export type Token = { raw: string; norm: string; at: number; end: number };

/**
 * Tokens keep technical punctuation that matters (c++, c#, .net, node.js,
 * security+, att&ck) and split on hyphens/slashes, so "CI/CD", "ci-cd" and
 * "ci cd" all become ["ci", "cd"]. Aliases go through the same function.
 */
const TOKEN_RE = /\.?[\p{L}\p{N}][\p{L}\p{N}+#&]*(?:[.'][\p{L}\p{N}+#&]+)*/gu;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    let raw = m[0].replace(/'/g, "");
    let at = m.index ?? 0;
    const end = at + m[0].length;
    if (raw.startsWith(".") && raw.toLowerCase() !== ".net") {
      raw = raw.slice(1);
      at += 1;
    }
    if (raw) out.push({ raw, norm: raw.toLowerCase(), at, end });
  }
  return out;
}

function keyOf(phrase: string): string {
  return tokenize(normalizeText(phrase))
    .map((t) => t.norm)
    .join(" ");
}

const SEGMENT_SPLIT = /\n+|[•●▪◦‣∙·|]+|(?<=[.!?;])\s+(?=[A-Z0-9("'])/;

function segmentsOf(text: string): string[] {
  return normalizeText(text)
    .split(SEGMENT_SPLIT)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// ── Concept index ────────────────────────────────────────────────────────────

type ConceptInfo = { id: string; term: string; kind: CategoryKind; weight: Weight; tip: string };
type AliasEntry = { conceptId: string; guard?: Guard };
type PhraseIndex = { phrases: Map<string, AliasEntry[]>; maxN: number };

const KIND_TIPS: Record<CategoryKind, string> = {
  languages: "Name the language next to a project you built with it and what it did.",
  tools: "Use it in a project or free lab, then name it next to what you did with it.",
  skills: "Describe one time you did this: the situation, what you did, and what changed.",
  concepts: "Show the concept inside a project bullet or coursework, not just a skills list.",
  frameworks: "Mention the framework as the yardstick you worked against in a project or class.",
  certs: "List it only if earned or in progress, with an expected date while you study.",
  soft: "Show it with a concrete example rather than an adjective.",
};

/** Kind for dictionary concepts that no preset lists. */
const DICTIONARY_ONLY_KIND: Record<string, CategoryKind> = {
  Leadership: "soft",
  "Time management": "soft",
  Curiosity: "soft",
  "Customer service": "soft",
  Evasion: "skills",
  "Password cracking": "skills",
  "Machine learning": "skills",
  "Data visualization": "skills",
  "Data analysis": "skills",
  "Web application security": "concepts",
  Misconfigurations: "concepts",
  "Network security": "skills",
  GitHub: "tools",
};

function conceptId(term: string): string {
  return keyOf(term) || term.toLowerCase();
}

function wordVariants(tokens: string[]): string[][] {
  const last = tokens[tokens.length - 1];
  if (!last || !/^[a-z]+$/.test(last)) return [];
  const out: string[] = [];
  if (last.length >= 4 && !last.endsWith("s")) {
    if (/[^aeiou]y$/.test(last)) out.push(`${last.slice(0, -1)}ies`);
    else if (/(x|ch|sh)$/.test(last)) out.push(`${last}es`);
    else out.push(`${last}s`);
  }
  if (last.length >= 5) {
    if (last.endsWith("ies")) out.push(`${last.slice(0, -3)}y`);
    else if (/(xes|ches|shes|sses)$/.test(last)) out.push(last.slice(0, -2));
    else if (last.endsWith("s") && !/(ss|us|is)$/.test(last)) out.push(last.slice(0, -1));
  }
  return out.map((v) => [...tokens.slice(0, -1), v]);
}

function addPhrase(index: PhraseIndex, key: string, entry: AliasEntry) {
  if (!key) return;
  const list = index.phrases.get(key);
  if (list) {
    if (!list.some((e) => e.conceptId === entry.conceptId && e.guard === entry.guard)) list.push(entry);
  } else index.phrases.set(key, [entry]);
  index.maxN = Math.max(index.maxN, key.split(" ").length);
}

function indexConcept(index: PhraseIndex, id: string, term: string) {
  const def = CONCEPTS[term];
  const guards = new Map<string, Guard>();
  for (const [alias, g] of Object.entries(def?.guards ?? {})) guards.set(keyOf(alias), g);
  const spellings = [term, ...(def?.aliases ?? [])];
  for (const spelling of spellings) {
    const key = keyOf(spelling);
    const guard = guards.get(key);
    addPhrase(index, key, { conceptId: id, guard });
    if (!guard && !def?.exact) {
      for (const v of wordVariants(key.split(" "))) {
        const vk = v.join(" ");
        if (!guards.has(vk)) addPhrase(index, vk, { conceptId: id });
      }
    }
  }
}

type GlobalIndex = PhraseIndex & { concepts: Map<string, ConceptInfo> };
let GLOBAL: GlobalIndex | null = null;

function globalIndex(): GlobalIndex {
  if (GLOBAL) return GLOBAL;
  const concepts = new Map<string, ConceptInfo>();
  for (const preset of PRESETS) {
    for (const cat of preset.categories) {
      for (const [term, weight, tip] of cat.terms) {
        const id = conceptId(term);
        const existing = concepts.get(id);
        if (existing) {
          if (weight > existing.weight) existing.weight = weight;
          if (tip && existing.tip === KIND_TIPS[existing.kind]) existing.tip = tip;
        } else {
          concepts.set(id, { id, term, kind: cat.kind, weight, tip: tip ?? CONCEPTS[term]?.tip ?? cat.tip });
        }
      }
    }
  }
  for (const term of Object.keys(CONCEPTS)) {
    const id = conceptId(term);
    if (concepts.has(id)) continue;
    const kind = DICTIONARY_ONLY_KIND[term] ?? "tools";
    concepts.set(id, { id, term, kind, weight: 2, tip: CONCEPTS[term]?.tip ?? KIND_TIPS[kind] });
  }
  const index: GlobalIndex = { phrases: new Map(), maxN: 1, concepts };
  for (const c of concepts.values()) indexConcept(index, c.id, c.term);
  index.maxN = Math.min(index.maxN, 8);
  GLOBAL = index;
  return index;
}

// ── Scanning ─────────────────────────────────────────────────────────────────

type Match = { conceptId: string; seg: number; start: number; end: number; matchedAs: string; negated: boolean };
type Scan = { segments: string[]; tokens: Token[][]; matches: Match[]; words: number };

function guardPasses(g: Guard, toks: Token[], start: number, end: number): boolean {
  if (g.cased) {
    const raw = toks
      .slice(start, end)
      .map((t) => t.raw)
      .join(" ");
    if (!g.cased.includes(raw)) return false;
  }
  if (g.notAfter && start > 0 && g.notAfter.includes(toks[start - 1].norm)) return false;
  if (g.notBefore && end < toks.length && g.notBefore.includes(toks[end].norm)) return false;
  if (g.near) {
    const lo = Math.max(0, start - 8);
    const hi = Math.min(toks.length, end + 8);
    let ok = false;
    for (let i = lo; i < hi && !ok; i++) if ((i < start || i >= end) && g.near.includes(toks[i].norm)) ok = true;
    if (!ok) return false;
  }
  return true;
}

const NEGATION_TRIGGERS: string[][] = [
  ["no", "experience"],
  ["no", "prior", "experience"],
  ["never", "used"],
  ["never", "worked"],
  ["not", "familiar"],
  ["unfamiliar"],
  ["no", "knowledge"],
  ["no", "exposure"],
  ["not", "proficient"],
];
const CONTRAST = new Set(["but", "however", "although", "though", "yet", "while", "whereas"]);
/** A trigger only counts when it's about the writer: at the start of a line or after one of these. */
const SELF = new Set(["i", "have", "had", "has", "but", "still", "currently", "yet"]);
/** Words that start a new clause, so a trigger before them doesn't reach the concept after. */
const CLAUSE_BREAK = new Set(["by", "using", "via", "through", "deploying", "implementing", "building", "and", "to", "for"]);

function isNegated(toks: Token[], start: number): boolean {
  const lo = Math.max(0, start - 7);
  for (let i = lo; i < start; i++) {
    if (i > 0 && !SELF.has(toks[i - 1].norm)) continue;
    for (const trig of NEGATION_TRIGGERS) {
      if (i + trig.length > start) continue;
      if (!trig.every((w, k) => toks[i + k]?.norm === w)) continue;
      const between = toks.slice(i + trig.length, start);
      if (between.some((t) => CONTRAST.has(t.norm) || CLAUSE_BREAK.has(t.norm))) continue;
      return true;
    }
  }
  return false;
}

function scan(text: string, index: PhraseIndex, detectNegation: boolean): Scan {
  const segments = segmentsOf(text);
  const tokens = segments.map(tokenize);
  const matches: Match[] = [];
  let words = 0;
  tokens.forEach((toks, seg) => {
    words += toks.length;
    const text = segments[seg];
    const norms = toks.map((t) => t.norm);
    for (let i = 0; i < toks.length; i++) {
      const maxN = Math.min(index.maxN, toks.length - i);
      for (let n = maxN; n >= 1; n--) {
        const entries = index.phrases.get(norms.slice(i, i + n).join(" "));
        if (!entries) continue;
        for (const e of entries) {
          if (e.guard && !guardPasses(e.guard, toks, i, i + n)) continue;
          matches.push({
            conceptId: e.conceptId,
            seg,
            start: i,
            end: i + n,
            matchedAs: text.slice(toks[i].at, toks[i + n - 1].end),
            negated: detectNegation && isNegated(toks, i),
          });
        }
      }
    }
  });
  return { segments, tokens, matches, words };
}

function snippet(scanned: Scan, m: Match): string {
  const seg = scanned.segments[m.seg];
  if (seg.length <= 180) return seg;
  const at = scanned.tokens[m.seg][m.start]?.at ?? 0;
  let from = Math.max(0, at - 70);
  let to = Math.min(seg.length, at + 110);
  if (from > 0) from = seg.indexOf(" ", from) + 1 || from;
  if (to < seg.length) to = seg.lastIndexOf(" ", to) > from ? seg.lastIndexOf(" ", to) : to;
  return `${from > 0 ? "…" : ""}${seg.slice(from, to).trim()}${to < seg.length ? "…" : ""}`;
}

type Hit = { matchedAs: string; evidence: string };

/** First non-negated hit per concept, plus negated-only concepts. */
function collectHits(scanned: Scan): { hits: Map<string, Hit>; negated: Map<string, Hit> } {
  const hits = new Map<string, Hit>();
  const negated = new Map<string, Hit>();
  for (const m of scanned.matches) {
    if (m.negated) {
      if (!negated.has(m.conceptId)) negated.set(m.conceptId, { matchedAs: m.matchedAs, evidence: snippet(scanned, m) });
    } else if (!hits.has(m.conceptId)) {
      hits.set(m.conceptId, { matchedAs: m.matchedAs, evidence: snippet(scanned, m) });
    }
  }
  for (const id of hits.keys()) negated.delete(id);
  return { hits, negated };
}

// ── Custom phrases ───────────────────────────────────────────────────────────

type Custom = { id: string; term: string };

function buildCustom(extraTerms: string[] | undefined): { index: PhraseIndex; terms: Custom[] } {
  const index: PhraseIndex = { phrases: new Map(), maxN: 1 };
  const terms: Custom[] = [];
  const seen = new Set<string>();
  for (const raw of extraTerms ?? []) {
    const term = raw.replace(/\s+/g, " ").trim().slice(0, 60);
    const key = keyOf(term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const id = `custom:${key}`;
    terms.push({ id, term });
    addPhrase(index, key, { conceptId: id });
    for (const v of wordVariants(key.split(" "))) addPhrase(index, v.join(" "), { conceptId: id });
    if (terms.length >= 12) break;
  }
  return { index, terms };
}

const CUSTOM_TIP = "You added this phrase. If it's true, say where you did it: a project, class, job or lab.";

// ── Grades & copy ────────────────────────────────────────────────────────────

export function gradeFor(score: number, limited = false): string {
  if (limited) return "Limited dictionary coverage";
  if (score >= 85) return "Strong match";
  if (score >= 70) return "Solid match";
  if (score >= 50) return "Getting there";
  if (score >= 30) return "Some gaps";
  return "Early draft";
}

function listTerms(terms: string[], max = 3): string {
  const t = terms.slice(0, max);
  if (t.length <= 1) return t.join("");
  return `${t.slice(0, -1).join(", ")} or ${t[t.length - 1]}`;
}

function sortByWeight<T extends { weight: number; term: string }>(items: T[]): T[] {
  return items.sort((a, b) => b.weight - a.weight || a.term.localeCompare(b.term));
}

function commonSuggestions(flagged: FlaggedTerm[], words: number, fromPdf = false): string[] {
  const out: string[] = [];
  if (flagged.length) {
    out.push(
      `You wrote "${flagged[0].evidence.slice(0, 90)}". Resumes don't need to list what you haven't done. Cut it and let your real skills carry the line.`,
    );
  }
  if (words < 150) {
    out.push(
      fromPdf
        ? `Only ${words} words of resume text were analyzed. If that seems low, the PDF may not have extracted cleanly. Check "What Rue read" below or paste the text.`
        : `Your resume text is short (${words} words). Paste the full resume for a fairer match.`,
    );
  }
  return out;
}

function bonusFrom(hits: Map<string, Hit>, exclude: Set<string>): BonusTerm[] {
  const { concepts } = globalIndex();
  const out: (BonusTerm & { weight: number })[] = [];
  for (const [id, hit] of hits) {
    if (exclude.has(id) || id.startsWith("custom:")) continue;
    const c = concepts.get(id);
    if (!c || c.weight < 2 || c.kind === "soft") continue;
    out.push({ term: c.term, categoryLabel: KIND_LABELS[c.kind], matchedAs: hit.matchedAs, weight: c.weight });
  }
  return sortByWeight(out)
    .slice(0, 12)
    .map(({ term, categoryLabel, matchedAs }) => ({ term, categoryLabel, matchedAs }));
}

// ── Preset mode: category coverage ───────────────────────────────────────────

function analyzePreset(resumeText: string, presetKey: string, extraTerms: string[] | undefined, title?: string, fromPdf = false): AnalysisResult {
  const preset = getPreset(presetKey);
  if (!preset) throw new Error(`Unknown preset: ${presetKey}`);
  const index = globalIndex();
  const resume = scan(resumeText, index, true);
  const { hits, negated } = collectHits(resume);
  const custom = buildCustom(extraTerms);
  const customHits = collectHits(scan(resumeText, custom.index, true));

  const found: FoundTerm[] = [];
  const missing: MissingTerm[] = [];
  const categoryScores: CategoryScore[] = [];
  const presetIds = new Set<string>();
  const flagged: FlaggedTerm[] = [];
  let weightedFill = 0;
  let totalWeight = 0;
  let totalTerms = 0;

  type Cat = { id: string; label: string; tip: string; terms: { id: string; term: string; weight: Weight; tip: string }[] };
  const cats: Cat[] = preset.categories.map((c) => ({
    id: c.id,
    label: c.label,
    tip: c.tip,
    terms: c.terms.map(([term, weight, tip]) => ({ id: conceptId(term), term, weight, tip: tip ?? CONCEPTS[term]?.tip ?? c.tip })),
  }));
  if (custom.terms.length) {
    cats.push({ id: "custom", label: KIND_LABELS.custom, tip: CUSTOM_TIP, terms: custom.terms.map((t) => ({ ...t, weight: 2 as Weight, tip: CUSTOM_TIP })) });
  }

  for (const cat of cats) {
    let catTotal = 0;
    let catFound = 0;
    let foundCount = 0;
    for (const t of cat.terms) {
      presetIds.add(t.id);
      totalTerms++;
      catTotal += t.weight;
      const hit = (cat.id === "custom" ? customHits.hits : hits).get(t.id);
      if (hit) {
        catFound += t.weight;
        foundCount++;
        found.push({ id: t.id, term: t.term, category: cat.id, categoryLabel: cat.label, weight: t.weight, matchedAs: hit.matchedAs, evidence: hit.evidence });
      } else {
        missing.push({ id: t.id, term: t.term, category: cat.id, categoryLabel: cat.label, weight: t.weight, tip: t.tip });
        const neg = (cat.id === "custom" ? customHits.negated : negated).get(t.id);
        if (neg && !flagged.some((f) => f.term === t.term)) {
          flagged.push({ term: t.term, evidence: neg.evidence, reason: "Mentioned with a negative phrase, so it wasn't credited." });
        }
      }
    }
    // The custom category has no "half fills it" allowance: you asked for these exact phrases.
    const fill = catTotal ? Math.min(1, catFound / ((cat.id === "custom" ? 1 : CATEGORY_FILL) * catTotal)) : 0;
    weightedFill += fill * catTotal;
    totalWeight += catTotal;
    categoryScores.push({ id: cat.id, label: cat.label, found: foundCount, total: cat.terms.length, pct: Math.round(fill * 100), tip: cat.tip });
  }

  const score = totalWeight ? Math.round((100 * weightedFill) / totalWeight) : 0;

  sortByWeight(found);
  sortByWeight(missing);

  const suggestions: string[] = [];
  const gaps = categoryScores
    .filter((c) => c.pct < 100)
    .map((c) => ({ c, weight: cats.find((x) => x.id === c.id)!.terms.reduce((n, t) => n + t.weight, 0) * (1 - c.pct / 100) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
  for (const { c } of gaps) {
    const ideas = missing.filter((m) => m.category === c.id).map((m) => m.term);
    if (ideas.length) suggestions.push(`${c.label}: if it's true, mention ${listTerms(ideas)}. ${c.tip}`);
  }
  suggestions.push(...commonSuggestions(flagged, resume.words, fromPdf));
  if (score >= 85) suggestions.unshift("Strong coverage. Next, make sure each keyword sits next to proof: a project, a number or a result.");

  return {
    mode: "preset",
    preset: preset.key,
    title: title?.trim() || preset.label,
    score,
    grade: gradeFor(score),
    limited: false,
    summary: `${found.length} of ${totalTerms} concepts mentioned.`,
    method: `Coverage across ${cats.length} categories. Mentioning about half of a category's weighted ideas fills it, because nobody needs every tool on the list.`,
    found,
    missing,
    flagged,
    bonus: bonusFrom(hits, presetIds),
    categoryScores,
    suggestions: suggestions.slice(0, 4),
    alternatives: [],
    unrecognized: [],
    stats: { recognized: totalTerms, found: found.length, resumeWords: resume.words },
  };
}

// ── Job-description mode: weighted keyword match ────────────────────────────

const PREF_HEAD = /\b(preferred|nice[- ]to[- ]haves?|bonus|pluses|a plus|desired|good to have|extra credit|ideally|optional)\b/i;
const REQ_HEAD =
  /\b(requirements?|required|qualifications?|must[- ]haves?|what you(?:'?ll)? (?:need|bring)|who you are|minimum|basic qualifications|you have|you bring|looking for|skills)\b/i;
const NEUTRAL_HEAD = /\b(responsibilities|what you(?:'?ll)? do|about (?:us|you|the (?:role|team|company|job))|the role|day[- ]to[- ]day|benefits|perks|compensation|salary|equal opportunity|eeo)\b/i;
const REQ_LINE = /\b(required|must|requires|mandatory|need to have|minimum of|essential)\b/i;
const PREF_LINE = /\b(preferred|nice to have|a plus|bonus|desired|familiarity with|exposure to|ideally|optional|is a plus|are a plus)\b/i;
const NOT_REQUIRED = /\b(not|no)\b[^.]{0,40}\brequired\b|\brequired\b[^.]{0,6}\bnot\b/i;

function classifySegments(segments: string[]): Requirement[] {
  let section: Requirement = "mentioned";
  return segments.map((seg) => {
    const words = seg.split(" ").length;
    const heading = seg.endsWith(":") || (words <= 6 && !/[.!?]$/.test(seg));
    if (heading) {
      if (PREF_HEAD.test(seg)) section = "preferred";
      else if (REQ_HEAD.test(seg)) section = "required";
      else if (NEUTRAL_HEAD.test(seg)) section = "mentioned";
    }
    if (NOT_REQUIRED.test(seg)) return "preferred";
    const req = REQ_LINE.test(seg);
    const pref = PREF_LINE.test(seg);
    if (req && !pref) return "required";
    if (pref && !req) return "preferred";
    return section;
  });
}

/** Maximal matches grouped into span "slots", in order, for one segment. */
function slotsOf(matches: Match[]): { start: number; end: number; ids: string[] }[] {
  const sorted = [...matches].sort((a, b) => a.start - b.start || b.end - a.end);
  const maximal = sorted.filter((m) => !sorted.some((o) => o !== m && o.start <= m.start && o.end >= m.end && o.end - o.start > m.end - m.start));
  const slots: { start: number; end: number; ids: string[] }[] = [];
  for (const m of maximal) {
    const last = slots[slots.length - 1];
    if (last && last.start === m.start && last.end === m.end) {
      if (!last.ids.includes(m.conceptId)) last.ids.push(m.conceptId);
    } else if (!last || m.start >= last.end) {
      slots.push({ start: m.start, end: m.end, ids: [m.conceptId] });
    }
  }
  return slots;
}

/** "Python or Java", "Splunk, QRadar, or Sentinel" → alternative groups. */
function alternativeRuns(jd: Scan): { runs: string[][]; inRun: Set<string>; standalone: Set<string> } {
  const runs: string[][] = [];
  const inRun = new Set<string>();
  const standalone = new Set<string>();
  const bySeg = new Map<number, Match[]>();
  for (const m of jd.matches) bySeg.set(m.seg, [...(bySeg.get(m.seg) ?? []), m]);
  for (const [seg, ms] of bySeg) {
    const toks = jd.tokens[seg];
    const slots = slotsOf(ms);
    let run = [slots[0]];
    let hasOr = false;
    let hasAnd = false;
    const flush = () => {
      const ids = [...new Set(run.flatMap((s) => s.ids))];
      if (run.length >= 2 && hasOr && !hasAnd) {
        runs.push(ids);
        ids.forEach((id) => inRun.add(id));
      } else ids.forEach((id) => standalone.add(id));
    };
    for (let i = 1; i < slots.length; i++) {
      const gap = toks.slice(slots[i - 1].end, slots[i].start).map((t) => t.norm);
      const connected = gap.length <= 2 && gap.every((g) => g === "or" || g === "and");
      if (connected) {
        if (gap.includes("or")) hasOr = true;
        if (gap.length === 1 && gap[0] === "and") hasAnd = true;
        run.push(slots[i]);
      } else {
        flush();
        run = [slots[i]];
        hasOr = false;
        hasAnd = false;
      }
    }
    if (slots.length) flush();
  }
  return { runs, inRun, standalone };
}

const UNRECOGNIZED_STOP = new Set(
  (
    "US USA EEO EOE CEO CTO CFO COO CISO VP HR PTO LLC INC AND THE OR FAQ BS BA MS MBA PHD UK EU NYC AM PM ET PT EST PST CST MST ID IT GPA OK TBD FT WFH DEI ADA " +
    "NA IN ON AT OF TO FOR WE YOU OUR YOUR LGBTQ CA NY TX VA DC WA MD CO MA FL IL GA NC NJ PA OH AZ UT MI MN WI Q1 Q2 Q3 Q4 USD HQ STEM " +
    "JOB ROLE TEAM ABOUT REQUIREMENTS RESPONSIBILITIES QUALIFICATIONS SKILLS BENEFITS NOTE NOTES APPLY NEW"
  ).split(" "),
);

function unrecognizedTerms(jd: Scan, resumeText: string): { term: string; inResume: boolean }[] {
  const covered = new Set<string>();
  for (const m of jd.matches) for (let i = m.start; i < m.end; i++) covered.add(`${m.seg}:${i}`);
  const counts = new Map<string, { term: string; n: number }>();
  jd.tokens.forEach((toks, seg) =>
    toks.forEach((t, i) => {
      if (covered.has(`${seg}:${i}`) || i === 0) return;
      const looksLikeTool = /^[A-Z][a-z]+[A-Z][A-Za-z]+$/.test(t.raw) || /^[A-Z]{2,6}[0-9]?$/.test(t.raw) || /^[A-Za-z]+[0-9]+[A-Za-z0-9]*$/.test(t.raw);
      if (!looksLikeTool || UNRECOGNIZED_STOP.has(t.raw.toUpperCase())) return;
      const c = counts.get(t.norm);
      if (c) c.n++;
      else counts.set(t.norm, { term: t.raw, n: 1 });
    }),
  );
  const resumeNorms = new Set(tokenize(normalizeText(resumeText)).map((t) => t.norm));
  return [...counts.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[1].term.localeCompare(b[1].term))
    .slice(0, 10)
    .map(([norm, c]) => ({ term: c.term, inResume: resumeNorms.has(norm) }));
}

export type ExtractedTerm = { id: string; term: string; kind: CategoryKind; weight: Weight; requirement: Requirement; mentions: number; tip: string };

/** Recognized concepts in a job description with requirement level and mention count. */
export function extractTerms(jobDescription: string): { terms: ExtractedTerm[]; alternatives: string[][]; scan: Scan } {
  const index = globalIndex();
  const jd = scan(jobDescription, index, false);
  const levels = classifySegments(jd.segments);
  const byId = new Map<string, ExtractedTerm>();
  const seenSpan = new Set<string>();
  for (const m of jd.matches) {
    const c = index.concepts.get(m.conceptId);
    if (!c) continue;
    const level = levels[m.seg];
    const span = `${m.conceptId}:${m.seg}:${m.start}`;
    const existing = byId.get(m.conceptId);
    if (existing) {
      if (REQUIREMENT_RANK[level] > REQUIREMENT_RANK[existing.requirement]) existing.requirement = level;
      if (!seenSpan.has(span)) existing.mentions++;
    } else {
      byId.set(m.conceptId, { id: c.id, term: c.term, kind: c.kind, weight: c.weight, requirement: level, mentions: 1, tip: c.tip });
    }
    seenSpan.add(span);
  }
  const alt = alternativeRuns(jd);
  const alternatives = alt.runs
    .map((ids) => ids.filter((id) => !alt.standalone.has(id)))
    .filter((ids) => ids.length >= 2)
    .map((ids) => ids.map((id) => byId.get(id)!.term));
  return { terms: [...byId.values()], alternatives, scan: jd };
}

function analyzeJobDescription(
  resumeText: string,
  jobDescription: string,
  extraTerms: string[] | undefined,
  title?: string,
  fromPdf = false,
): AnalysisResult {
  const index = globalIndex();
  const { terms, alternatives: altTerms, scan: jd } = extractTerms(jobDescription);
  const resume = scan(resumeText, index, true);
  const { hits, negated } = collectHits(resume);
  const custom = buildCustom(extraTerms);
  const customHits = collectHits(scan(resumeText, custom.index, true));

  type Unit = { members: ExtractedTerm[]; weight: number; kind: CategoryKind | "custom" };
  const termByName = new Map(terms.map((t) => [t.term, t]));
  const grouped = new Set<string>();
  const units: Unit[] = [];
  const unitWeight = (t: ExtractedTerm) => t.weight * MULTIPLIER[t.requirement] * (1 + 0.25 * Math.min(t.mentions - 1, 2));

  for (const names of altTerms) {
    const members = names.map((n) => termByName.get(n)!).filter((m) => m && !grouped.has(m.id));
    if (members.length < 2) continue;
    members.forEach((m) => grouped.add(m.id));
    units.push({ members, weight: Math.max(...members.map(unitWeight)), kind: members[0].kind });
  }
  for (const t of terms) if (!grouped.has(t.id)) units.push({ members: [t], weight: unitWeight(t), kind: t.kind });
  for (const c of custom.terms) {
    units.push({
      members: [{ id: c.id, term: c.term, kind: "skills", weight: 2, requirement: "mentioned", mentions: 1, tip: CUSTOM_TIP }],
      weight: 2 * MULTIPLIER.mentioned,
      kind: "custom",
    });
  }

  const found: FoundTerm[] = [];
  const missing: MissingTerm[] = [];
  const flagged: FlaggedTerm[] = [];
  const catTotals = new Map<string, { total: number; got: number; n: number; f: number }>();
  let total = 0;
  let got = 0;
  let foundUnits = 0;

  for (const u of units) {
    const cat = u.kind;
    const label = KIND_LABELS[cat];
    const isCustom = cat === "custom";
    const lookup = (id: string) => (isCustom ? customHits.hits : hits).get(id);
    const foundMembers = u.members.filter((m) => lookup(m.id));
    const ok = foundMembers.length > 0;
    total += u.weight;
    if (ok) {
      got += u.weight;
      foundUnits++;
    }
    const agg = catTotals.get(cat) ?? { total: 0, got: 0, n: 0, f: 0 };
    agg.total += u.weight;
    agg.n++;
    if (ok) {
      agg.got += u.weight;
      agg.f++;
    }
    catTotals.set(cat, agg);

    for (const m of u.members) {
      const hit = lookup(m.id);
      if (hit) {
        found.push({ id: m.id, term: m.term, category: cat, categoryLabel: label, weight: m.weight, matchedAs: hit.matchedAs, evidence: hit.evidence, requirement: m.requirement });
      } else if (!ok) {
        missing.push({ id: m.id, term: m.term, category: cat, categoryLabel: label, weight: m.weight, tip: m.tip, requirement: m.requirement });
        const neg = (isCustom ? customHits.negated : negated).get(m.id);
        if (neg) flagged.push({ term: m.term, evidence: neg.evidence, reason: "Mentioned with a negative phrase, so it wasn't credited." });
      }
    }
    if (ok && u.members.length > 1) {
      for (const m of u.members) {
        const f = found.find((x) => x.id === m.id);
        if (f) f.viaAlternative = u.members.filter((x) => x.id !== m.id).map((x) => x.term).join(" / ");
      }
    }
  }

  const reqRank = (r?: Requirement) => (r ? REQUIREMENT_RANK[r] : 0);
  found.sort((a, b) => reqRank(b.requirement) - reqRank(a.requirement) || b.weight - a.weight || a.term.localeCompare(b.term));
  missing.sort((a, b) => reqRank(b.requirement) - reqRank(a.requirement) || b.weight - a.weight || a.term.localeCompare(b.term));

  const kindsPresent = new Set(units.filter((u) => u.kind !== "custom").map((u) => u.kind));
  const limited = units.length < SPARSE_MIN || kindsPresent.size <= 1;
  const score = total ? Math.round((100 * got) / total) : 0;

  const order: (CategoryKind | "custom")[] = ["languages", "tools", "skills", "concepts", "frameworks", "certs", "soft", "custom"];
  const categoryScores: CategoryScore[] = order
    .filter((k) => catTotals.has(k))
    .map((k) => {
      const a = catTotals.get(k)!;
      return {
        id: k,
        label: KIND_LABELS[k],
        found: a.f,
        total: a.n,
        pct: a.total ? Math.round((100 * a.got) / a.total) : 0,
        tip: k === "custom" ? CUSTOM_TIP : KIND_TIPS[k],
      };
    });

  const suggestions: string[] = [];
  const requiredMissing = missing.filter((m) => m.requirement === "required").map((m) => m.term);
  if (requiredMissing.length) {
    suggestions.push(
      `The posting marks ${listTerms(requiredMissing, 4)} as required. If you've touched any of them in a class, lab or project, give it a bullet with what you did.`,
    );
  }
  const gaps = categoryScores
    .filter((c) => c.pct < 100)
    .sort((a, b) => (catTotals.get(b.id)!.total - catTotals.get(b.id)!.got) - (catTotals.get(a.id)!.total - catTotals.get(a.id)!.got))
    .slice(0, 2);
  for (const c of gaps) {
    const ideas = missing.filter((m) => m.category === c.id && m.requirement !== "required").map((m) => m.term);
    if (ideas.length) suggestions.push(`${c.label}: ${listTerms(ideas)} ${ideas.length === 1 ? "appears" : "appear"} in the posting but not your resume. ${missing.find((m) => m.term === ideas[0])?.tip ?? c.tip}`);
  }
  suggestions.push(...commonSuggestions(flagged, resume.words, fromPdf));
  if (limited) suggestions.unshift("There isn't enough recognized detail for a useful percentage. Use the found and missing lists as a checklist instead.");
  else if (score >= 85) suggestions.unshift("This resume already speaks the posting's language. Next, check that each match sits next to proof.");

  const targetIds = new Set(terms.map((t) => t.id));
  return {
    mode: "jd",
    preset: "custom",
    title: title?.trim() || guessTitle(jobDescription),
    score,
    grade: gradeFor(score, limited),
    limited,
    summary: `${foundUnits} of ${units.length} recognized job concepts appear in this resume.`,
    method: "Weighted match: required ×3, unlabeled ×2, preferred ×1, with a small bump for repeated mentions. \"X or Y\" counts once.",
    found,
    missing,
    flagged,
    bonus: bonusFrom(hits, targetIds),
    categoryScores,
    suggestions: suggestions.slice(0, 4),
    alternatives: altTerms,
    unrecognized: unrecognizedTerms(jd, resumeText),
    stats: { recognized: units.length, found: foundUnits, resumeWords: resume.words },
  };
}

/** A readable title from the first meaningful line of a job description. */
export function guessTitle(jobDescription: string): string {
  const lines = normalizeText(jobDescription)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 3 && !/^[•●▪◦‣∙·*-]/.test(l));
  const line = lines.find((l) => l.length <= 90 && !REQ_HEAD.test(l) && !NEUTRAL_HEAD.test(l) && !PREF_HEAD.test(l));
  return line ? line.replace(/[:\-–|]+$/, "").trim().slice(0, 80) : "Pasted job description";
}

// ── Public entry point ───────────────────────────────────────────────────────

export function analyze(input: AnalyzeInput): AnalysisResult {
  if (input.mode === "preset") return analyzePreset(input.resumeText, input.presetKey, input.extraTerms, input.title, input.fromPdf);
  return analyzeJobDescription(input.resumeText, input.jobDescription, input.extraTerms, input.title, input.fromPdf);
}

/** The canonical concept term for an id, if known (used to label stored history). */
export function conceptTerm(id: string): string | undefined {
  return globalIndex().concepts.get(id)?.term;
}
