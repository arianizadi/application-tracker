import type { UserSnapshot } from "@/lib/data/snapshot";

import { isPrepDone, isSubmitted, reachedStatuses } from "./stats";
import { weekOf } from "./time";

/** XP values. Effort he controls earns XP; closed chapters earn gentle resilience XP; nothing ever subtracts. */
export const XP = {
  added: 5,
  submitted: 40,
  followUp: 10,
  resume: 15,
  analysis: 10,
  status: { ASSESSMENT: 30, INTERVIEW: 40, OFFER: 20, ACCEPTED: 20 } as const,
  resilience: { REJECTED: 15, GHOSTED: 10, WITHDRAWN: 5 } as const,
  prep: { module: 30, question: 8, flashcard: 3, resource: 5, other: 5 } as const,
} as const;

/** Anti-grind caps: XP from these actions counts at most N per week. */
const WEEKLY_CAP = { resume: 3, analysis: 5 } as const;

export type XpSource = { key: string; label: string; count: number; xp: number };

export function computeXp(snapshot: UserSnapshot, timeZone: string): { xp: number; breakdown: XpSource[] } {
  const rows = new Map<string, XpSource>();
  const add = (key: string, label: string, xp: number, n = 1) => {
    if (n <= 0) return;
    const row = rows.get(key) ?? { key, label, count: 0, xp: 0 };
    row.count += n;
    row.xp += xp * n;
    rows.set(key, row);
  };

  for (const app of snapshot.applications) {
    add("added", "Roles saved or added", XP.added);
    if (isSubmitted(app)) add("submitted", "Applications submitted", XP.submitted);
    if (app.followUpAt) add("followUp", "Follow-ups planned", XP.followUp);
    const reached = reachedStatuses(app);
    if (reached.has("ASSESSMENT")) add("assessment", "Assessments tackled", XP.status.ASSESSMENT);
    if (reached.has("INTERVIEW")) add("interview", "Interviews attended", XP.status.INTERVIEW);
    if (reached.has("OFFER")) add("offer", "Offers logged", XP.status.OFFER);
    if (reached.has("ACCEPTED")) add("accepted", "Offers accepted", XP.status.ACCEPTED);
    let resilience = 0;
    for (const s of ["REJECTED", "GHOSTED", "WITHDRAWN"] as const) if (reached.has(s)) resilience += XP.resilience[s];
    if (resilience) add("resilience", "Resilience (chapters closed)", resilience);
  }

  const capped = <T extends { createdAt: Date }>(items: T[], cap: number) => {
    const perWeek = new Map<number, number>();
    let n = 0;
    for (const item of [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())) {
      const w = weekOf(new Date(item.createdAt), timeZone);
      const used = perWeek.get(w) ?? 0;
      if (used < cap) {
        perWeek.set(w, used + 1);
        n++;
      }
    }
    return n;
  };
  add("resume", "Resume versions", XP.resume, capped(snapshot.resumes, WEEKLY_CAP.resume));
  add("analysis", "Analyzer reports", XP.analysis, capped(snapshot.analyses, WEEKLY_CAP.analysis));

  for (const p of snapshot.progress) {
    if (!isPrepDone(p.state)) continue;
    const kind = p.kind.toLowerCase();
    if (kind === "module") add("prep-module", "Prep modules finished", XP.prep.module);
    else if (kind === "question") add("prep-question", "Interview questions practiced", XP.prep.question);
    else if (kind === "flashcard") add("prep-flashcard", "Flashcards learned", XP.prep.flashcard);
    else if (kind === "resource") add("prep-resource", "Resources read", XP.prep.resource);
    else add("prep-other", "Other prep", XP.prep.other);
  }

  const breakdown = [...rows.values()].sort((a, b) => b.xp - a.xp);
  return { xp: breakdown.reduce((sum, r) => sum + r.xp, 0), breakdown };
}
