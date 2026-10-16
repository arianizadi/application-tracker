import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { userTag } from "@/lib/cache-tags";
import { getSnapshot } from "@/lib/data/snapshot";
import { filterApplications, sortApplications, type ApplicationFilters } from "@/lib/applications/filter";
import type { ApplicationDetail, ApplicationListItem, ResumeOption } from "@/lib/applications/types";
import { prisma } from "@/lib/prisma";

const LIST_SELECT = {
  id: true, company: true, role: true, status: true, workMode: true, location: true, source: true,
  url: true, excitement: true, deadline: true, followUpAt: true, appliedAt: true, resumeId: true,
  createdAt: true, updatedAt: true, history: true,
} as const;

async function getAllApplications(userId: string): Promise<ApplicationListItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(userTag(userId, "applications"));
  return prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: LIST_SELECT,
  });
}

/**
 * Every application for the user (no notes), optionally filtered and sorted.
 * Filtering runs on the cached list, so changing filters never hits the database.
 */
export async function listApplications(userId: string, filters?: ApplicationFilters & { todayKey?: string; nowMs?: number }): Promise<ApplicationListItem[]> {
  const all = await getAllApplications(userId);
  if (!filters) return all;
  const ctx = { todayKey: filters.todayKey ?? new Date().toISOString().slice(0, 10), nowMs: filters.nowMs ?? Date.now() };
  return sortApplications(filterApplications(all, filters, ctx), filters.sort);
}

async function getApplicationCached(id: string, userId: string): Promise<ApplicationDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(userTag(userId, "applications"), userTag(userId, "resumes"));
  return prisma.application.findFirst({
    where: { id, userId },
    select: {
      ...LIST_SELECT,
      salary: true,
      contactName: true,
      notes: true,
      resume: { select: { id: true, label: true, version: true } },
    },
  });
}

/** One application, only if it belongs to `userId`. Returns null for unknown or foreign ids. */
export async function getApplication(id: string, userId: string): Promise<ApplicationDetail | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return getApplicationCached(id, userId);
}

/** Resume versions for pickers, newest first ("v3 — SWE backend"). */
export async function getResumeOptions(userId: string): Promise<ResumeOption[]> {
  const { resumes } = await getSnapshot(userId);
  return resumes
    .map((r) => ({ id: r.id, label: r.label, version: r.version, isDefault: r.isDefault }))
    .sort((a, b) => b.version - a.version);
}
