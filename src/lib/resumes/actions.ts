"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireUser } from "@/lib/auth/dal";
import { consume } from "@/lib/auth/rate-limit";
import { invalidate } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { extractPdfText, hasPdfMagic, PDF_MIME_TYPES, PdfReadError } from "@/lib/resumes/pdf";
import { isObjectId, normalizeResumeText } from "@/lib/resumes/text";
import { LIMITS } from "@/lib/tracks";

export type ResumeField = "label" | "notes" | "text" | "file";

export type ResumeActionState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Partial<Record<ResumeField, string>>;
      /** Saved, but something deserves a heads-up (e.g. scanned PDF with no text layer). */
      warning?: string;
      resumeId?: string;
      version?: number;
      /** True when this was the user's first resume version. */
      first?: boolean;
      pages?: number;
      words?: number;
    }
  | undefined;

export type ResumeMutationResult = { ok: true; message?: string } | { ok: false; error: string };

/** Extracted text shorter than this usually means a scanned (image-only) PDF. */
const MIN_EXTRACTED_CHARS = 200;
const MIN_PASTED_CHARS = 80;
const MAX_ATTEMPTS = 5;

const labelSchema = z
  .string()
  .trim()
  .min(1, "Give this version a name Future You will understand.")
  .max(80, "Keep the name under 80 characters.");
const notesSchema = z
  .string()
  .trim()
  .max(2000, "Notes max out at 2,000 characters.")
  .transform((v) => (v.length ? v : null));

const uploadSchema = z.object({
  mode: z.enum(["file", "text"]),
  label: labelSchema,
  notes: notesSchema,
  text: z.string().max(LIMITS.resumeTextChars * 2, "That's a lot of text. Trim it under 60,000 characters."),
  makeDefault: z.boolean(),
});

const updateSchema = z.object({
  id: z.string().refine(isObjectId, "Unknown resume."),
  label: labelSchema,
  notes: notesSchema,
  text: z.string().max(LIMITS.resumeTextChars * 2, "That's a lot of text. Trim it under 60,000 characters.").optional(),
});

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function fieldErrors(error: z.ZodError): Partial<Record<ResumeField, string>> {
  const out: Partial<Record<ResumeField, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "") as ResumeField;
    if (["label", "notes", "text", "file"].includes(key)) out[key] ??= issue.message;
  }
  return out;
}

function isRetryable(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034");
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Saves a new resume version from an uploaded PDF or pasted text.
 * useActionState-compatible: (prevState, formData) => state.
 *
 * FormData: mode ("file" | "text"), file (PDF), text, label, notes, makeDefault ("on").
 */
export async function uploadResume(_state: ResumeActionState, formData: FormData): Promise<ResumeActionState> {
  const user = await requireUser();

  const parsed = uploadSchema.safeParse({
    mode: str(formData.get("mode")) || "file",
    label: str(formData.get("label")),
    notes: str(formData.get("notes")),
    text: str(formData.get("text")),
    makeDefault: formData.get("makeDefault") === "on",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const { mode, label, notes, makeDefault } = parsed.data;

  if (!(await consume("resume-upload", user.id, 30, 60 * 60 * 1000))) {
    return { error: "That's a lot of uploads in an hour. Nib needs a snack break — try again soon." };
  }

  const existing = await prisma.resume.count({ where: { userId: user.id } });
  if (existing >= LIMITS.resumes) {
    return { error: `You've got ${LIMITS.resumes} versions saved — the max. Delete an old one to make room.` };
  }

  let bytes: Uint8Array | null = null;
  let fileName: string | null = null;
  let text: string;
  let pages: number | undefined;
  let warning: string | undefined;

  if (mode === "file") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { fieldErrors: { file: "Pick a PDF to upload (or switch to pasting text)." } };
    if (file.size > LIMITS.resumeBytes) return { fieldErrors: { file: "That PDF is over 4 MB. Try “Save as PDF” again or compress it." } };
    if (!PDF_MIME_TYPES.has(file.type)) return { fieldErrors: { file: "Only PDF files for now. Export your resume as a PDF and try again." } };

    bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfMagic(bytes)) return { fieldErrors: { file: "That file says it's a PDF but doesn't look like one inside." } };
    fileName = file.name.slice(0, 200) || null;

    try {
      const extracted = await extractPdfText(bytes, LIMITS.resumeTextChars);
      text = extracted.text;
      pages = extracted.pages;
      if (extracted.truncated) warning = "That's a long one — we kept the first 60,000 characters of text.";
    } catch (error) {
      if (error instanceof PdfReadError) return { fieldErrors: { file: error.message } };
      throw error;
    }
    if (text.length < MIN_EXTRACTED_CHARS) {
      warning =
        "Saved! But we could barely read any text — this might be a scanned PDF. Edit this version and paste your resume text so the analyzer can read it.";
    }
  } else {
    const normalized = normalizeResumeText(parsed.data.text, LIMITS.resumeTextChars);
    if (normalized.text.length < MIN_PASTED_CHARS) {
      return { fieldErrors: { text: "Paste your full resume text — that's looking a little short." } };
    }
    text = normalized.text;
    if (normalized.truncated) warning = "We kept the first 60,000 characters.";
  }

  let created: { id: string; version: number } | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && !created; attempt++) {
    try {
      created = await prisma.$transaction(
        async (tx) => {
          const [last, currentDefault] = await Promise.all([
            tx.resume.findFirst({ where: { userId: user.id }, orderBy: { version: "desc" }, select: { version: true } }),
            tx.resume.findFirst({ where: { userId: user.id, isDefault: true }, select: { id: true } }),
          ]);
          const isDefault = makeDefault || !currentDefault;
          if (isDefault && currentDefault) {
            await tx.resume.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
          }
          const resume = await tx.resume.create({
            data: {
              userId: user.id,
              label,
              notes,
              text,
              version: (last?.version ?? 0) + 1,
              isDefault,
              fileName,
              mimeType: bytes ? "application/pdf" : null,
              sizeBytes: bytes ? bytes.byteLength : null,
            },
            select: { id: true, version: true },
          });
          if (bytes) {
            await tx.resumeFile.create({ data: { resumeId: resume.id, data: Buffer.from(bytes) } });
          }
          return resume;
        },
        { maxWait: 5_000, timeout: 20_000 },
      );
    } catch (error) {
      if (!isRetryable(error) || attempt === MAX_ATTEMPTS - 1) {
        console.error("uploadResume failed", error);
        return { error: "Couldn't save that version. Your draft is still here — try again in a moment." };
      }
      await pause(40 * (attempt + 1) + Math.random() * 60);
    }
  }
  if (!created) return { error: "Couldn't save that version. Try again in a moment." };

  invalidate(user.id, "resumes");
  return {
    ok: true,
    resumeId: created.id,
    version: created.version,
    first: existing === 0,
    pages,
    words: text.match(/\S+/g)?.length ?? 0,
    warning,
  };
}

/**
 * Edits a version's label/notes and, when a `text` field is present, its text.
 * FormData: id, label, notes, text?.
 */
export async function updateResume(_state: ResumeActionState, formData: FormData): Promise<ResumeActionState> {
  const user = await requireUser();
  const hasText = formData.has("text");
  const parsed = updateSchema.safeParse({
    id: str(formData.get("id")),
    label: str(formData.get("label")),
    notes: str(formData.get("notes")),
    text: hasText ? str(formData.get("text")) : undefined,
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return Object.keys(errors).length ? { fieldErrors: errors } : { error: "That resume doesn't exist anymore." };
  }
  const { id, label, notes } = parsed.data;

  const data: Prisma.ResumeUpdateManyMutationInput = { label, notes };
  let warning: string | undefined;
  if (parsed.data.text !== undefined) {
    const normalized = normalizeResumeText(parsed.data.text, LIMITS.resumeTextChars);
    if (normalized.text.length < MIN_PASTED_CHARS) {
      return { fieldErrors: { text: "The resume text looks almost empty. Paste the full text so the analyzer can read it." } };
    }
    data.text = normalized.text;
    if (normalized.truncated) warning = "We kept the first 60,000 characters.";
  }

  const result = await prisma.resume.updateMany({ where: { id, userId: user.id }, data });
  if (result.count === 0) return { error: "That resume doesn't exist anymore." };

  invalidate(user.id, "resumes");
  return { ok: true, resumeId: id, warning };
}

/** Makes one version the default for new applications. Unsets all others for this user. */
export async function setDefaultResume(id: string): Promise<ResumeMutationResult> {
  const user = await requireUser();
  if (!isObjectId(id)) return { ok: false, error: "Unknown resume." };

  try {
    const found = await prisma.$transaction(async (tx) => {
      const target = await tx.resume.findFirst({ where: { id, userId: user.id }, select: { id: true, version: true } });
      if (!target) return null;
      await tx.resume.updateMany({ where: { userId: user.id, isDefault: true, NOT: { id } }, data: { isDefault: false } });
      await tx.resume.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } });
      return target;
    });
    if (!found) return { ok: false, error: "That resume doesn't exist anymore." };
    invalidate(user.id, "resumes");
    return { ok: true, message: `v${found.version} is your go-to now.` };
  } catch (error) {
    console.error("setDefaultResume failed", error);
    return { ok: false, error: "Couldn't change the default. Try again?" };
  }
}

/**
 * Deletes a version and its file. Applications and analyses that used it keep
 * existing; their resume link is cleared. If it was the default, the newest
 * remaining version becomes the default.
 */
export async function deleteResume(id: string): Promise<ResumeMutationResult> {
  const user = await requireUser();
  if (!isObjectId(id)) return { ok: false, error: "Unknown resume." };

  try {
    const deleted = await prisma.$transaction(
      async (tx) => {
        const target = await tx.resume.findFirst({ where: { id, userId: user.id }, select: { id: true, version: true, isDefault: true } });
        if (!target) return null;
        // Explicit SetNull/cascade rather than relying on Prisma's MongoDB referential-action emulation.
        await tx.application.updateMany({ where: { userId: user.id, resumeId: id }, data: { resumeId: null } });
        await tx.analysis.updateMany({ where: { userId: user.id, resumeId: id }, data: { resumeId: null } });
        await tx.resumeFile.deleteMany({ where: { resumeId: id } });
        await tx.resume.deleteMany({ where: { id, userId: user.id } });
        if (target.isDefault) {
          const next = await tx.resume.findFirst({ where: { userId: user.id }, orderBy: { version: "desc" }, select: { id: true } });
          if (next) await tx.resume.update({ where: { id: next.id }, data: { isDefault: true } });
        }
        return target;
      },
      { maxWait: 5_000, timeout: 15_000 },
    );
    if (!deleted) return { ok: false, error: "That resume was already gone." };
    invalidate(user.id, "resumes", "applications", "analyses");
    return { ok: true, message: `v${deleted.version} deleted. Applications that used it are still safe.` };
  } catch (error) {
    console.error("deleteResume failed", error);
    return { ok: false, error: "Couldn't delete that version. Try again?" };
  }
}
