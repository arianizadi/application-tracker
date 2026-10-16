import type { ApplicationStatus, WorkMode } from "@prisma/client";

/** What the board and list render. Never includes notes so list payloads stay small. */
export type ApplicationListItem = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  workMode: WorkMode | null;
  location: string | null;
  source: string | null;
  url: string | null;
  excitement: number;
  deadline: Date | null;
  followUpAt: Date | null;
  appliedAt: Date | null;
  resumeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  history: { status: ApplicationStatus; at: Date }[];
};

/** Full record for the detail page. */
export type ApplicationDetail = ApplicationListItem & {
  salary: string | null;
  contactName: string | null;
  notes: string | null;
  resume: { id: string; label: string; version: number } | null;
};

/** A deleted application, returned so the client can offer Undo via restoreApplications(). */
export type DeletedApplication = Omit<ApplicationDetail, "id" | "resume" | "updatedAt">;

export type ResumeOption = { id: string; label: string; version: number; isDefault: boolean };

export type FieldName =
  | "company" | "role" | "status" | "appliedAt" | "location" | "workMode" | "url" | "source"
  | "salary" | "excitement" | "contactName" | "notes" | "deadline" | "followUpAt" | "resumeId";

export type FieldErrors = Partial<Record<FieldName, string>>;

/** useActionState-compatible result for the full create/edit forms. */
export type ApplicationFormState =
  | { ok: true; id: string; message?: string }
  | { ok: false; error?: string; fieldErrors?: FieldErrors }
  | undefined;

/** Result shape for programmatic (non-form) actions. */
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

/** Form values as strings, the shape the client form edits and autosaves. */
export type ApplicationFormValues = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
  location: string;
  workMode: "" | WorkMode;
  url: string;
  source: string;
  salary: string;
  excitement: string;
  contactName: string;
  notes: string;
  deadline: string;
  followUpAt: string;
  resumeId: string;
};

/** Blank create-form values. Lives here (not in the client form) so Server Components can call it. */
export function emptyFormValues(todayKey: string, defaultResumeId = ""): ApplicationFormValues {
  return {
    company: "", role: "", status: "APPLIED", appliedAt: todayKey, location: "", workMode: "", url: "", source: "",
    salary: "", excitement: "3", contactName: "", notes: "", deadline: "", followUpAt: "", resumeId: defaultResumeId,
  };
}
