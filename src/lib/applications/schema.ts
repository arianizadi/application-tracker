import type { ApplicationStatus, WorkMode } from "@prisma/client";
import { z } from "zod";

import { dateKeyToDate, isDateKey } from "@/lib/applications/dates";
import type { FieldErrors, FieldName, ResumeOption } from "@/lib/applications/types";
import { STATUSES } from "@/lib/status";
import { LIMITS } from "@/lib/tracks";

/** Shared, client-safe validation for applications. Server actions are the source of truth. */

export const WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"] as const satisfies readonly WorkMode[];

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

export const SOURCE_SUGGESTIONS = [
  "LinkedIn", "Handshake", "Company site", "Referral", "Career fair", "Indeed", "Wellfound",
  "Simplify", "Greenhouse", "Lever", "Workday", "Ashby", "SmartRecruiters", "Recruiter reached out", "Other",
];

export const MAX = {
  company: 120,
  role: 160,
  location: 120,
  url: 2048,
  source: 60,
  salary: 80,
  contactName: 120,
  notes: LIMITS.notesChars,
  search: 100,
  bulk: 500,
  history: 200,
} as const;

/** Statuses that mean the application was actually submitted. */
export const SUBMITTED_STATUSES: ApplicationStatus[] = STATUSES.filter((s) => s !== "WISHLIST");

const STATUS_TUPLE = STATUSES as [ApplicationStatus, ...ApplicationStatus[]];

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Unknown application.");
export const statusSchema = z.enum(STATUS_TUPLE, { error: "Pick a status." });

const blankToUndefined = (v: unknown) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v);

/** Optional free text: trimmed, capped, empty → null. */
function optionalText(max: number, label: string) {
  return z.preprocess(
    blankToUndefined,
    z.string().trim().max(max, `${label} can be at most ${max} characters.`).optional(),
  ).transform((v) => v ?? null);
}

function requiredText(max: number, missing: string, label: string) {
  return z.preprocess(
    (v) => (v === null || v === undefined ? "" : v),
    z.string().trim().min(1, missing).max(max, `${label} can be at most ${max} characters.`),
  );
}

/** Adds https:// when someone pastes "jobs.lever.co/..." and rejects anything but http(s). */
export function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}

const urlField = z
  .preprocess(blankToUndefined, z.string().trim().max(MAX.url, "That link is too long.").optional())
  .transform((v, ctx) => {
    if (!v) return null;
    const normalized = normalizeUrl(v);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Links need to start with http:// or https://." });
      return z.NEVER;
    }
    return normalized;
  });

/** "YYYY-MM-DD" (from <input type="date">) → Date at noon UTC, or null. */
const dateField = z
  .preprocess(blankToUndefined, z.string().trim().optional())
  .transform((v, ctx) => {
    if (!v) return null;
    if (!isDateKey(v)) {
      ctx.addIssue({ code: "custom", message: "Use a real date." });
      return z.NEVER;
    }
    const year = +v.slice(0, 4);
    if (year < 2000 || year > 2100) {
      ctx.addIssue({ code: "custom", message: "That date looks off." });
      return z.NEVER;
    }
    return dateKeyToDate(v);
  });

const workModeField = z
  .preprocess(blankToUndefined, z.enum(WORK_MODES, { error: "Pick remote, hybrid or on-site." }).optional())
  .transform((v) => v ?? null);

const excitementField = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? 3 : v),
  z.coerce.number({ error: "Pick 1 to 5 hearts." }).int().min(1, "Pick 1 to 5 hearts.").max(5, "Pick 1 to 5 hearts."),
);

const resumeIdField = z
  .preprocess(blankToUndefined, objectId.optional())
  .transform((v) => v ?? null);

export const applicationFields = {
  company: requiredText(MAX.company, "Which company?", "Company"),
  role: requiredText(MAX.role, "What's the role?", "Role"),
  appliedAt: dateField,
  location: optionalText(MAX.location, "Location"),
  workMode: workModeField,
  url: urlField,
  source: optionalText(MAX.source, "Source"),
  salary: optionalText(MAX.salary, "Pay"),
  excitement: excitementField,
  contactName: optionalText(MAX.contactName, "Contact"),
  notes: optionalText(MAX.notes, "Notes"),
  deadline: dateField,
  followUpAt: dateField,
  resumeId: resumeIdField,
};

export const createApplicationSchema = z.object({
  ...applicationFields,
  status: z.preprocess((v) => blankToUndefined(v) ?? "APPLIED", statusSchema),
});

export const updateApplicationSchema = z.object(applicationFields);

export const quickAddSchema = z.object({
  company: applicationFields.company,
  role: applicationFields.role,
  url: applicationFields.url,
  source: applicationFields.source,
  status: z.preprocess((v) => blankToUndefined(v) ?? "APPLIED", statusSchema),
});

export type QuickAddInput = { company: string; role: string; url?: string; source?: string; status?: ApplicationStatus };

const historyEvent = z.object({ status: statusSchema, at: z.coerce.date() });

/** Validates a record the client sends back for Undo. Same caps as creation. */
export const restoreSchema = z.object({
  ...applicationFields,
  status: statusSchema,
  appliedAt: z.coerce.date().nullable(),
  deadline: z.coerce.date().nullable(),
  followUpAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  history: z.array(historyEvent).max(MAX.history),
});

export const FORM_FIELDS: FieldName[] = [
  "company", "role", "status", "appliedAt", "location", "workMode", "url", "source",
  "salary", "excitement", "contactName", "notes", "deadline", "followUpAt", "resumeId",
];

export function formDataToObject(formData: FormData): Record<string, FormDataEntryValue | null> {
  const out: Record<string, FormDataEntryValue | null> = {};
  for (const key of FORM_FIELDS) out[key] = formData.get(key);
  return out;
}

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "") as FieldName;
    if (FORM_FIELDS.includes(key)) out[key] ??= issue.message;
  }
  return out;
}

/** "v3 — SWE backend" */
export function resumeLabel(r: Pick<ResumeOption, "label" | "version">): string {
  return `v${r.version} — ${r.label}`;
}
