import { connection } from "next/server";

import { consume } from "@/lib/auth/rate-limit";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/export/all — everything the signed-in user has stored, as one JSON
 * download: profile, applications (with notes + history), resume metadata and
 * extracted text (not the file bytes), analyses, achievements and prep progress.
 * Every query is scoped to the session's user id; nothing comes from the client.
 */

const NO_STORE = { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" } as const;

function plain(status: number, message: string, extra: Record<string, string> = {}) {
  return new Response(message, { status, headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8", ...extra } });
}

export async function GET() {
  await connection();
  const session = await readSession();
  if (!session) return plain(401, "Sign in to export your data.");

  const userId = session.user.id;
  if (!(await consume("export-all", userId, 20, 60 * 60 * 1000))) {
    return plain(429, "That's a lot of exports. Try again in an hour.", { "Retry-After": "3600" });
  }

  try {
    const [user, applications, resumes, analyses, achievements, progress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, track: true, weeklyGoal: true, timeZone: true, createdAt: true, updatedAt: true },
      }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, company: true, role: true, status: true, location: true, workMode: true, url: true, source: true,
          salary: true, excitement: true, contactName: true, notes: true, deadline: true, followUpAt: true,
          appliedAt: true, resumeId: true, history: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.resume.findMany({
        where: { userId },
        orderBy: { version: "asc" },
        select: {
          id: true, label: true, version: true, fileName: true, mimeType: true, sizeBytes: true, text: true,
          notes: true, isDefault: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, resumeId: true, preset: true, title: true, score: true, found: true, missing: true, createdAt: true },
      }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: "asc" },
        select: { key: true, unlockedAt: true, celebrated: true },
      }),
      prisma.progress.findMany({
        where: { userId },
        orderBy: [{ kind: "asc" }, { itemId: "asc" }],
        select: { kind: true, itemId: true, state: true, createdAt: true, updatedAt: true },
      }),
    ]);
    if (!user) return plain(401, "Sign in to export your data.");

    const now = new Date();
    const payload = {
      format: "canopy-export",
      version: 1,
      exportedAt: now.toISOString(),
      note: "Original resume files are not included; their extracted text is under resumes[].text.",
      profile: user,
      counts: {
        applications: applications.length,
        resumes: resumes.length,
        analyses: analyses.length,
        achievements: achievements.length,
        progress: progress.length,
      },
      applications,
      resumes,
      analyses,
      achievements,
      progress,
    };

    const day = now.toISOString().slice(0, 10);
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        ...NO_STORE,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="canopy-export-${day}.json"`,
      },
    });
  } catch (error) {
    console.error("Full export failed", error instanceof Error ? error.name : "unknown");
    return plain(500, "The export didn't work this time. Please try again in a moment.");
  }
}
