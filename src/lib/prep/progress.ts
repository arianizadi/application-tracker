/**
 * Prep progress vocabulary. Client-safe (no content or server imports).
 *
 * States line up with the game engine's done-states (src/lib/game/stats.ts `isPrepDone`):
 * "done", "practiced", "mastered" and "known" earn XP; "started", "saved", "review" and
 * "learning" are bookmarks that never count as finished.
 */

export const PROGRESS_KINDS = ["module", "resource", "question", "flashcard"] as const;
export type ProgressKind = (typeof PROGRESS_KINDS)[number];

export const PROGRESS_STATES = {
  module: ["done", "started"],
  resource: ["saved", "done"],
  /** "mastered" is shown as "Confident" in the UI; "review" means "seen it, needs another pass". */
  question: ["practiced", "mastered", "review"],
  flashcard: ["known", "learning"],
} as const satisfies Record<ProgressKind, readonly string[]>;

export type ProgressState<K extends ProgressKind = ProgressKind> = (typeof PROGRESS_STATES)[K][number];
export type ModuleState = ProgressState<"module">;
export type ResourceState = ProgressState<"resource">;
export type QuestionState = ProgressState<"question">;
export type FlashcardState = ProgressState<"flashcard">;

export function isProgressKind(value: unknown): value is ProgressKind {
  return typeof value === "string" && (PROGRESS_KINDS as readonly string[]).includes(value);
}

export function isStateFor<K extends ProgressKind>(kind: K, state: unknown): state is ProgressState<K> {
  return typeof state === "string" && (PROGRESS_STATES[kind] as readonly string[]).includes(state);
}

/** Map key for one progress row. */
export function progressKey(kind: ProgressKind, itemId: string): string {
  return `${kind}:${itemId}`;
}

/** `{ "question:web-application-security-q1": "practiced", ... }` */
export type ProgressMap = Record<string, string>;

export function toProgressMap(rows: readonly { kind: string; itemId: string; state: string }[], kinds?: readonly ProgressKind[]): ProgressMap {
  const map: ProgressMap = {};
  for (const r of rows) {
    if (!isProgressKind(r.kind)) continue;
    if (kinds && !kinds.includes(r.kind)) continue;
    map[progressKey(r.kind, r.itemId)] = r.state;
  }
  return map;
}

/** Done-states (mirrors the game engine) for the four prep kinds. */
const DONE: Record<ProgressKind, readonly string[]> = {
  module: ["done"],
  resource: ["done"],
  question: ["practiced", "mastered"],
  flashcard: ["known"],
};

export function isDoneState(kind: ProgressKind, state: string | null | undefined): boolean {
  return !!state && DONE[kind].includes(state);
}

export type CourseTotals = { modules: number; questions: number; flashcards: number; resources: number };

export type CourseProgress = {
  modulesDone: number;
  questionsPracticed: number;
  questionsConfident: number;
  flashcardsKnown: number;
  resourcesDone: number;
  resourcesSaved: number;
};

export function summarizeProgress(map: ProgressMap): CourseProgress {
  const out: CourseProgress = { modulesDone: 0, questionsPracticed: 0, questionsConfident: 0, flashcardsKnown: 0, resourcesDone: 0, resourcesSaved: 0 };
  for (const [key, state] of Object.entries(map)) {
    const kind = key.slice(0, key.indexOf(":"));
    if (kind === "module" && state === "done") out.modulesDone++;
    else if (kind === "question" && (state === "practiced" || state === "mastered")) {
      out.questionsPracticed++;
      if (state === "mastered") out.questionsConfident++;
    } else if (kind === "flashcard" && state === "known") out.flashcardsKnown++;
    else if (kind === "resource") {
      if (state === "done") out.resourcesDone++;
      else if (state === "saved") out.resourcesSaved++;
    }
  }
  return out;
}

export const QUESTION_STATE_LABEL: Record<QuestionState, string> = {
  practiced: "Practiced",
  mastered: "Confident",
  review: "Review again",
};
