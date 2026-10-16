import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { userTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { countWords, diffResumeText, isObjectId, type ResumeDiff } from "@/lib/resumes/text";

export type ResumeListItem = {
  id: string;
  label: string;
  version: number;
  fileName: string | null;
  sizeBytes: number | null;
  notes: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** True when an original PDF is stored (pasted-text versions have none). */
  hasFile: boolean;
  words: number;
  /** Diff against the previous version (by version number); null for the first. */
  diff: (ResumeDiff & { fromVersion: number }) | null;
};

/**
 * Every resume version for a user, newest first, with derived word counts and
 * consecutive-version diffs. The text itself never leaves this function.
 */
export async function getResumeLibrary(userId: string): Promise<ResumeListItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(userTag(userId, "resumes"));

  const rows = await prisma.resume.findMany({
    where: { userId },
    orderBy: { version: "asc" },
    select: {
      id: true, label: true, version: true, fileName: true, sizeBytes: true, notes: true,
      isDefault: true, createdAt: true, updatedAt: true, text: true,
    },
  });
  const files = rows.length
    ? await prisma.resumeFile.findMany({ where: { resumeId: { in: rows.map((r) => r.id) } }, select: { resumeId: true } })
    : [];
  const withFile = new Set(files.map((f) => f.resumeId));

  const items: ResumeListItem[] = rows.map((row, i) => {
    const prev = i > 0 ? rows[i - 1] : null;
    const { text, ...rest } = row;
    return {
      ...rest,
      hasFile: withFile.has(row.id),
      words: countWords(text),
      diff: prev ? { ...diffResumeText(prev.text, text), fromVersion: prev.version } : null,
    };
  });
  return items.reverse();
}

export type ResumeDetail = Omit<ResumeListItem, "diff"> & {
  text: string;
  mimeType: string | null;
  diff: (ResumeDiff & { fromVersion: number; fromId: string }) | null;
};

/** One version with its full text, scoped to the owner. Null when missing or not theirs. */
export async function getResumeDetail(userId: string, id: string): Promise<ResumeDetail | null> {
  "use cache";
  cacheLife("days");
  cacheTag(userTag(userId, "resumes"));

  if (!isObjectId(id)) return null;
  const row = await prisma.resume.findFirst({
    where: { id, userId },
    select: {
      id: true, label: true, version: true, fileName: true, mimeType: true, sizeBytes: true, notes: true,
      isDefault: true, createdAt: true, updatedAt: true, text: true,
    },
  });
  if (!row) return null;

  const [file, prev] = await Promise.all([
    prisma.resumeFile.findUnique({ where: { resumeId: row.id }, select: { id: true } }),
    prisma.resume.findFirst({
      where: { userId, version: { lt: row.version } },
      orderBy: { version: "desc" },
      select: { id: true, version: true, text: true },
    }),
  ]);

  return {
    ...row,
    hasFile: Boolean(file),
    words: countWords(row.text),
    diff: prev ? { ...diffResumeText(prev.text, row.text), fromVersion: prev.version, fromId: prev.id } : null,
  };
}
