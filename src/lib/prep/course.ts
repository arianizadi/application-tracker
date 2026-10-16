import { FLASHCARDS, MODULES, QUESTIONS, RESOURCES } from "@/content/prep";

import { isDoneState, progressKey, summarizeProgress, type CourseProgress, type CourseTotals, type ProgressMap } from "./progress";

export const COURSE_TOTALS: CourseTotals = {
  modules: MODULES.length,
  questions: QUESTIONS.length,
  flashcards: FLASHCARDS.length,
  resources: RESOURCES.length,
};

export type ModuleStatus = {
  id: string;
  number: number;
  title: string;
  hook: string;
  hours: number;
  tracks: (typeof MODULES)[number]["tracks"];
  questionsTotal: number;
  practiced: number;
  done: boolean;
  /** Any progress at all (module "started", a practiced question or a touched resource). */
  started: boolean;
};

export type CourseOverview = {
  progress: CourseProgress;
  totals: CourseTotals;
  modules: ModuleStatus[];
  /** The module to continue: the first started-but-unfinished one, else the first unfinished one. */
  upNext: ModuleStatus | null;
};

export function courseOverview(map: ProgressMap): CourseOverview {
  const modules: ModuleStatus[] = MODULES.map((m) => {
    let practiced = 0;
    let touched = false;
    for (const q of m.questions) {
      const s = map[progressKey("question", q.id)];
      if (s) touched = true;
      if (isDoneState("question", s)) practiced++;
    }
    const moduleState = map[progressKey("module", m.id)];
    if (!touched) touched = m.resourceIds.some((r) => map[progressKey("resource", r)] !== undefined);
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      hook: m.hook,
      hours: m.hours,
      tracks: m.tracks,
      questionsTotal: m.questions.length,
      practiced,
      done: moduleState === "done",
      started: moduleState === "started" || moduleState === "done" || touched,
    };
  });
  const upNext = modules.find((m) => m.started && !m.done) ?? modules.find((m) => !m.done) ?? null;
  return { progress: summarizeProgress(map), totals: COURSE_TOTALS, modules, upNext };
}
