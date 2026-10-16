import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { ApplicationStatus, WorkMode } from "@prisma/client";

import { userTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

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

export async function getSnapshot(userId: string): Promise<UserSnapshot> {
  "use cache: remote";
  cacheLife("days");
  cacheTag(
    userTag(userId, "applications"),
    userTag(userId, "resumes"),
    userTag(userId, "analyses"),
    userTag(userId, "progress"),
  );

  const [applications, resumes, analyses, progress] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, company: true, role: true, status: true, workMode: true, source: true,
        excitement: true, resumeId: true, appliedAt: true, createdAt: true, updatedAt: true,
        followUpAt: true, deadline: true, history: true,
      },
    }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { version: "asc" },
      select: { id: true, label: true, version: true, isDefault: true, createdAt: true },
    }),
    prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, preset: true, title: true, score: true, found: true, missing: true, resumeId: true, createdAt: true },
    }),
    prisma.progress.findMany({
      where: { userId },
      select: { kind: true, itemId: true, state: true, updatedAt: true },
    }),
  ]);

  return { applications, resumes, analyses, progress };
}
