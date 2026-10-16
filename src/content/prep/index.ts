/**
 * Interview prep course aggregator. Server-side convenience: importing this pulls in
 * every module's lesson text, so Client Components should import the specific file
 * they need (./resources, ./flashcards) or receive data as props instead.
 */
import { FLASHCARDS } from "./flashcards";
import { prepModule as behavioralSecurityInterviews } from "./modules/behavioral-security-interviews";
import { prepModule as blueTeamSoc } from "./modules/blue-team-soc";
import { prepModule as cloudAndIdentity } from "./modules/cloud-and-identity";
import { prepModule as grcAndRisk } from "./modules/grc-and-risk";
import { prepModule as networkingFundamentals } from "./modules/networking-fundamentals";
import { prepModule as offensiveSecurityBasics } from "./modules/offensive-security-basics";
import { prepModule as operatingSystemsSecurity } from "./modules/operating-systems-security";
import { prepModule as portfolioAndProjects } from "./modules/portfolio-and-projects";
import { prepModule as securityAutomation } from "./modules/security-automation";
import { prepModule as securityFundamentals } from "./modules/security-fundamentals";
import { prepModule as securityInternshipHiring } from "./modules/security-internship-hiring";
import { prepModule as technicalScenarios } from "./modules/technical-scenarios";
import { prepModule as threatsAndFrameworks } from "./modules/threats-and-frameworks";
import { prepModule as webApplicationSecurity } from "./modules/web-application-security";
import { RESOURCE_CATEGORIES, RESOURCES } from "./resources";
import type { Flashcard, Module, PracticeQuestion, Resource } from "./types";

export type { Block, ExternalLink, Flashcard, Module, PracticeQuestion, Resource, ResourceType, TrackCode } from "./types";
export { TRACK_LABELS, TRACK_NAMES } from "@/lib/prep/tracks";
export { FLASHCARDS, RESOURCE_CATEGORIES, RESOURCES };

/** All 14 course modules, ordered by module number. */
export const MODULES: readonly Module[] = [
  securityInternshipHiring,
  networkingFundamentals,
  operatingSystemsSecurity,
  securityFundamentals,
  webApplicationSecurity,
  blueTeamSoc,
  threatsAndFrameworks,
  offensiveSecurityBasics,
  cloudAndIdentity,
  securityAutomation,
  grcAndRisk,
  behavioralSecurityInterviews,
  technicalScenarios,
  portfolioAndProjects,
].sort((a, b) => a.number - b.number);

export const MODULE_IDS: readonly string[] = MODULES.map((m) => m.id);

const MODULE_BY_ID = new Map<string, Module>(MODULES.map((m) => [m.id, m]));

export function getModule(id: string): Module | undefined {
  return MODULE_BY_ID.get(id);
}

export const RESOURCE_BY_ID: Readonly<Record<string, Resource>> = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));

export const FLASHCARD_BY_ID: Readonly<Record<string, Flashcard>> = Object.fromEntries(FLASHCARDS.map((f) => [f.id, f]));

/** Every practice question with the module it belongs to. */
export const QUESTIONS: readonly (PracticeQuestion & { moduleId: string })[] = MODULES.flatMap((m) =>
  m.questions.map((q) => ({ ...q, moduleId: m.id })),
);

export const QUESTION_BY_ID: Readonly<Record<string, PracticeQuestion & { moduleId: string }>> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

/** Neighbours on the course trail (by number). */
export function getAdjacentModules(id: string): { prev: Module | null; next: Module | null } {
  const i = MODULES.findIndex((m) => m.id === id);
  if (i < 0) return { prev: null, next: null };
  return { prev: MODULES[i - 1] ?? null, next: MODULES[i + 1] ?? null };
}
