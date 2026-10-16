import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { ApplicationStatus, WorkMode } from "@prisma/client";

import { userTag } from "@/lib/cache-tags";
import { GAME_PROGRESS_KIND } from "@/lib/game/memory";
import { prisma } from "@/lib/prisma";
import { LIMITS } from "@/lib/tracks";

/**
 * A compact, cache-friendly view of everything gamification, stats, the forest
 * and prep recommendations need. Never includes notes, files or resume text.
 */
export type SnapshotApplication = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  workMode: WorkMode | null;
  source: string | null;
  excitement: number;
  resumeId: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  followUpAt: Date | null;
  deadline: Date | null;
  history: { status: ApplicationStatus; at: Date }[];
};

export type SnapshotResume = { id: string; label: string; version: number; isDefault: boolean; createdAt: Date };

export type SnapshotAnalysis = {
  id: string;
  preset: string;
  title: string;
  score: number;
  found: string[];
  missing: string[];
  resumeId: string | null;
  createdAt: Date;
};

export type SnapshotProgress = { kind: string; itemId: string; state: string; updatedAt: Date };

export type UserSnapshot = {
  applications: SnapshotApplication[];
  resumes: SnapshotResume[];
  analyses: SnapshotAnalysis[];
  progress: SnapshotProgress[];
};

/*
 * One remote cache entry per collection, each tagged only with its own kind, so a
 * write (e.g. rating a flashcard → "progress") re-queries just that collection
 * instead of every application and analysis.
 */

export async function getSnapshotApplications(userId: string): Promise<SnapshotApplication[]> {
  "use cache: remote";
  cacheLife("days");
  cacheTag(userTag(userId, "applications"));
  return prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, company: true, role: true, status: true, workMode: true, source: true,
      excitement: true, resumeId: true, appliedAt: true, createdAt: true, updatedAt: true,
      followUpAt: true, deadline: true, history: true,
    },
  });
}

export async function getSnapshotResumes(userId: string): Promise<SnapshotResume[]> {
  "use cache: remote";
  cacheLife("days");
  cacheTag(userTag(userId, "resumes"));
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { version: "asc" },
    select: { id: true, label: true, version: true, isDefault: true, createdAt: true },
  });
}

export async function getSnapshotAnalyses(userId: string): Promise<SnapshotAnalysis[]> {
  "use cache: remote";
  cacheLife("days");
  cacheTag(userTag(userId, "analyses"));
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    // Every report the analyzer keeps, so XP from older reports doesn't fall out of the window.
    take: LIMITS.analyses,
    select: { id: true, preset: true, title: true, score: true, found: true, missing: true, resumeId: true, createdAt: true },
  });
}

export async function getSnapshotProgress(userId: string): Promise<SnapshotProgress[]> {
  "use cache: remote";
  cacheLife("days");
  cacheTag(userTag(userId, "progress"));
  return prisma.progress.findMany({
    // Game memory rows aren't course progress (see src/lib/game/memory.ts).
    where: { userId, kind: { not: GAME_PROGRESS_KIND } },
    select: { kind: true, itemId: true, state: true, updatedAt: true },
  });
}

/** Everything at once. Not cached itself: each part is cached and invalidated on its own. */
export async function getSnapshot(userId: string): Promise<UserSnapshot> {
  const [applications, resumes, analyses, progress] = await Promise.all([
    getSnapshotApplications(userId),
    getSnapshotResumes(userId),
    getSnapshotAnalyses(userId),
    getSnapshotProgress(userId),
  ]);
  return { applications, resumes, analyses, progress };
}
