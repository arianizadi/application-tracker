// Pure analyzer API (safe for server, client, and tests). Server actions live in ./actions.
export { analyze, extractTerms, gradeFor, guessTitle, normalizeText, tokenize, ENGINE_VERSION, CATEGORY_FILL, SPARSE_MIN } from "./engine";
export type { ExtractedTerm, Token } from "./engine";
export { PRESETS, defaultPresetFor, getPreset, isPresetKey, presetGroups, presetLabel, summarizePreset } from "./presets";
export type { PresetGroup, PresetSummary } from "./presets";
export * from "./types";
