import type { ApplicationStatus } from "@prisma/client";

import type { SnapshotApplication, SnapshotResume } from "@/lib/data/snapshot";
import { REACHED_INTERVIEW, RESPONDED } from "@/lib/status";

/**
 * Per-resume-version outcomes, derived from the cached snapshot. Observational
 * only: different roles, dates or employers can explain any difference.
 */
export type VersionStats = {
  /** Applications linked to this version (including wishlist). */
  used: number;
  /** Linked applications that were actually submitted. */
  submitted: number;
  /** Submitted applications that ever heard back (OA, interview, offer or rejection). */
  responded: number;
  /** Submitted applications that ever reached an interview. */
  interviews: number;
  /** Submitted applications that ever reached an offer. */
  offers: number;
  /** responded / submitted, or null when nothing was submitted. */
  responseRate: number | null;
  interviewRate: number | null;
};

export type ResumeStatsSummary = {
  byResume: Record<string, VersionStats>;
  /** Submitted applications with no resume linked. */
  unattached: number;
  /** Submitted applications overall. */
  submittedTotal: number;
};

/** Minimum submitted applications before a version can be called a winner. */
export const MIN_SAMPLE = 3;

const OFFERS: ApplicationStatus[] = ["OFFER", "ACCEPTED"];

function everReached(app: SnapshotApplication, set: ApplicationStatus[]): boolean {
  return set.includes(app.status) || app.history.some((e) => set.includes(e.status));
}

function isSubmitted(app: SnapshotApplication): boolean {
  return app.status !== "WISHLIST" || app.appliedAt !== null;
}

export function emptyStats(): VersionStats {
  return { used: 0, submitted: 0, responded: 0, interviews: 0, offers: 0, responseRate: null, interviewRate: null };
}

export function computeResumeStats(applications: SnapshotApplication[], resumes: Pick<SnapshotResume, "id">[]): ResumeStatsSummary {
  const byResume: Record<string, VersionStats> = {};
  for (const r of resumes) byResume[r.id] = emptyStats();

  let unattached = 0;
  let submittedTotal = 0;
  for (const app of applications) {
    const submitted = isSubmitted(app);
    if (submitted) submittedTotal++;
    const stats = app.resumeId ? byResume[app.resumeId] : undefined;
    if (!stats) {
      if (submitted) unattached++;
      continue;
    }
    stats.used++;
    if (!submitted) continue;
    stats.submitted++;
    if (everReached(app, RESPONDED)) stats.responded++;
    if (everReached(app, REACHED_INTERVIEW)) stats.interviews++;
    if (everReached(app, OFFERS)) stats.offers++;
  }

  for (const stats of Object.values(byResume)) {
    if (stats.submitted > 0) {
      stats.responseRate = stats.responded / stats.submitted;
      stats.interviewRate = stats.interviews / stats.submitted;
    }
  }
  return { byResume, unattached, submittedTotal };
}

export type BestVersion =
  | {
      kind: "winner";
      id: string;
      version: number;
      label: string;
      stats: VersionStats;
      /** best rate ÷ pooled rate of all other versions; null when the others have zero replies. */
      multiplier: number | null;
      others: { submitted: number; responded: number };
    }
  | { kind: "too-early"; id: string; version: number; stats: VersionStats }
  | { kind: "none" };

/**
 * Picks the version with the highest reply rate among those with at least
 * MIN_SAMPLE submissions, compared against every other version pooled.
 */
export function findBestVersion(resumes: Pick<SnapshotResume, "id" | "version" | "label">[], summary: ResumeStatsSummary): BestVersion {
  const withData = resumes.filter((r) => (summary.byResume[r.id]?.submitted ?? 0) > 0);
  if (withData.length === 0) return { kind: "none" };

  const eligible = withData.filter((r) => summary.byResume[r.id].submitted >= MIN_SAMPLE);
  if (eligible.length < 2) {
    const most = [...withData].sort((a, b) => summary.byResume[b.id].submitted - summary.byResume[a.id].submitted)[0];
    return { kind: "too-early", id: most.id, version: most.version, stats: summary.byResume[most.id] };
  }

  const best = [...eligible].sort((a, b) => {
    const sa = summary.byResume[a.id];
    const sb = summary.byResume[b.id];
    return (sb.responseRate ?? 0) - (sa.responseRate ?? 0) || sb.interviews - sa.interviews || b.version - a.version;
  })[0];
  const stats = summary.byResume[best.id];

  let submitted = 0;
  let responded = 0;
  for (const r of withData) {
    if (r.id === best.id) continue;
    submitted += summary.byResume[r.id].submitted;
    responded += summary.byResume[r.id].responded;
  }
  const otherRate = submitted > 0 ? responded / submitted : 0;
  const multiplier = otherRate > 0 ? (stats.responseRate ?? 0) / otherRate : null;

  if ((stats.responseRate ?? 0) === 0) return { kind: "too-early", id: best.id, version: best.version, stats };
  return { kind: "winner", id: best.id, version: best.version, label: best.label, stats, multiplier, others: { submitted, responded } };
}

export function formatRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}
