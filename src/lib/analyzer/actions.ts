"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { consume } from "@/lib/auth/rate-limit";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { LIMITS } from "@/lib/tracks";

import { analyze } from "./engine";
import { isPresetKey } from "./presets";
import type { AnalysisResult } from "./types";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "That resume version wasn't found.");
const MIN_TEXT = 40;

const runSchema = z
  .object({
    resumeId: objectId.optional(),
    resumeText: z
      .string()
      .max(LIMITS.resumeTextChars, `Resume text is capped at ${LIMITS.resumeTextChars.toLocaleString()} characters.`)
      .optional(),
    preset: z.string().max(40).optional(),
    jobDescription: z
      .string()
      .max(LIMITS.jobDescriptionChars, `Job descriptions are capped at ${LIMITS.jobDescriptionChars.toLocaleString()} characters. Trimming the benefits section usually does it.`)
      .optional(),
    title: z.string().trim().max(120, "Keep the title under 120 characters.").optional(),
    extraTerms: z.array(z.string().trim().min(1).max(60)).max(12, "Up to 12 extra phrases.").optional(),
  })
  .refine((v) => Boolean(v.resumeId) !== Boolean(v.resumeText?.trim()), { message: "Pick a resume version or paste resume text." })
  .refine((v) => Boolean(v.preset) !== Boolean(v.jobDescription?.trim()), { message: "Pick a role preset or paste a job description." });

export type RunAnalysisInput = z.input<typeof runSchema>;

export type RunAnalysisResult =
  | {
      ok: true;
      /** Saved Analysis id, or null if the history save failed (the result is still valid). */
      id: string | null;
      result: AnalysisResult;
      /** Exactly what the engine read (truncated for display). */
      analyzedText: string;
      resume: { id: string; label: string; version: number } | null;
    }
  | { ok: false; error: string };

/**
 * Run a keyword analysis for the signed-in user and save it to history.
 * Never trusts a client-sent user id; resume text is loaded only if the
 * resume belongs to the caller.
 */
export async function runAnalysis(input: RunAnalysisInput): Promise<RunAnalysisResult> {
  const user = await requireUser();

  const parsed = runSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Something about that input didn't look right." };
  const data = parsed.data;

  if (data.preset && !isPresetKey(data.preset)) return { ok: false, error: "That role preset doesn't exist anymore. Pick another one." };

  if (!(await consume("analyzer", user.id, 120, 60 * 60 * 1000))) {
    return { ok: false, error: "That's a lot of checks in one hour. Rue needs a snack break. Try again in a bit." };
  }

  let resumeText = data.resumeText ?? "";
  let resume: { id: string; label: string; version: number } | null = null;
  if (data.resumeId) {
    const row = await prisma.resume.findFirst({
      where: { id: data.resumeId, userId: user.id },
      select: { id: true, label: true, version: true, text: true },
    });
    if (!row) return { ok: false, error: "That resume version wasn't found." };
    resume = { id: row.id, label: row.label, version: row.version };
    resumeText = row.text.slice(0, LIMITS.resumeTextChars);
  }

  if (resumeText.trim().length < MIN_TEXT) {
    return {
      ok: false,
      error: data.resumeId
        ? "I couldn't read enough text from that resume version. Paste the text instead to continue."
        : "Paste a bit more of your resume. There isn't enough text to check yet.",
    };
  }
  if (data.jobDescription !== undefined && data.jobDescription.trim().length < MIN_TEXT) {
    return { ok: false, error: "Paste a bit more of the job description. There isn't enough to compare against yet." };
  }

  const result = data.preset
    ? analyze({ mode: "preset", resumeText, presetKey: data.preset, extraTerms: data.extraTerms, title: data.title })
    : analyze({ mode: "jd", resumeText, jobDescription: data.jobDescription!, extraTerms: data.extraTerms, title: data.title });

  let id: string | null = null;
  try {
    const saved = await prisma.analysis.create({
      data: {
        userId: user.id,
        resumeId: resume?.id ?? null,
        preset: result.preset,
        title: result.title.slice(0, 120),
        score: result.score,
        found: result.found.map((f) => f.term).slice(0, 200),
        missing: result.missing.map((m) => m.term).slice(0, 200),
      },
      select: { id: true },
    });
    id = saved.id;

    const overflow = await prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: LIMITS.analyses,
      select: { id: true },
    });
    if (overflow.length) {
      await prisma.analysis.deleteMany({ where: { userId: user.id, id: { in: overflow.map((o) => o.id) } } });
    }
    invalidate(user.id, "analyses", "achievements");
  } catch (error) {
    console.error("[analyzer] failed to save analysis", error);
  }

  return { ok: true, id, result, analyzedText: resumeText.slice(0, 8000), resume };
}

export type DeleteAnalysisResult = { ok: true } | { ok: false; error: string };

export async function deleteAnalysis(analysisId: string): Promise<DeleteAnalysisResult> {
  const user = await requireUser();
  const parsed = objectId.safeParse(analysisId);
  if (!parsed.success) return { ok: false, error: "That check wasn't found." };
  const { count } = await prisma.analysis.deleteMany({ where: { id: parsed.data, userId: user.id } });
  if (!count) return { ok: false, error: "That check wasn't found." };
  invalidate(user.id, "analyses", "achievements");
  return { ok: true };
}
