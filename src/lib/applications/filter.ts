import type { ApplicationStatus, WorkMode } from "@prisma/client";

import { dateToKey, daysBetweenKeys } from "@/lib/applications/dates";
import { MAX, WORK_MODES } from "@/lib/applications/schema";
import type { ApplicationListItem } from "@/lib/applications/types";
import { CLOSED_STATUSES, isStatus } from "@/lib/status";

/** Pure filtering/sorting shared by the server query and the instant client-side filters. */

export const SORTS = [
  { key: "recent", label: "Recently updated" },
  { key: "applied", label: "Applied date" },
  { key: "company", label: "Company A–Z" },
  { key: "excitement", label: "Most exciting" },
  { key: "deadline", label: "Deadline soonest" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export const QUICK_FLAGS = [
  { key: "followup", label: "Follow-up due" },
  { key: "deadline", label: "Deadline this week" },
  { key: "quiet", label: "Quiet 30+ days" },
] as const;

export type QuickFlag = (typeof QUICK_FLAGS)[number]["key"];

export type ApplicationFilters = {
  q?: string;
  statuses?: ApplicationStatus[];
  workModes?: WorkMode[];
  source?: string;
  flag?: QuickFlag;
  sort?: SortKey;
};

export const GHOST_AFTER_DAYS = 30;

export function isSortKey(value: unknown): value is SortKey {
  return SORTS.some((s) => s.key === value);
}

function isFlag(value: unknown): value is QuickFlag {
  return QUICK_FLAGS.some((f) => f.key === value);
}

function normalize(text: string): string {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** When the company last gave a signal: the latest status event, else applied/created. */
export function lastActivityAt(item: Pick<ApplicationListItem, "history" | "appliedAt" | "createdAt">): Date {
  const last = item.history.length ? item.history[item.history.length - 1].at : null;
  const candidates = [last, item.appliedAt, item.createdAt].filter(Boolean) as Date[];
  return new Date(Math.max(...candidates.map((d) => new Date(d).getTime())));
}

export function isQuiet(item: ApplicationListItem, nowMs: number, days = GHOST_AFTER_DAYS): boolean {
  return item.status === "APPLIED" && nowMs - lastActivityAt(item).getTime() >= days * 86_400_000;
}

export function isFollowUpDue(item: Pick<ApplicationListItem, "followUpAt" | "status">, todayKey: string): boolean {
  if (!item.followUpAt || CLOSED_STATUSES.includes(item.status)) return false;
  return daysBetweenKeys(todayKey, dateToKey(item.followUpAt)) <= 0;
}

export function isDeadlineSoon(item: Pick<ApplicationListItem, "deadline" | "status">, todayKey: string, days = 7): boolean {
  if (!item.deadline || CLOSED_STATUSES.includes(item.status)) return false;
  const diff = daysBetweenKeys(todayKey, dateToKey(item.deadline));
  return diff >= 0 && diff <= days;
}

export function filterApplications(
  items: ApplicationListItem[],
  filters: ApplicationFilters,
  ctx: { todayKey: string; nowMs: number },
): ApplicationListItem[] {
  const tokens = normalize(filters.q?.trim() ?? "").split(/\s+/).filter(Boolean);
  const statuses = filters.statuses?.length ? new Set(filters.statuses) : null;
  const modes = filters.workModes?.length ? new Set(filters.workModes) : null;
  const source = filters.source ? normalize(filters.source) : null;

  return items.filter((item) => {
    if (statuses && !statuses.has(item.status)) return false;
    if (modes && (!item.workMode || !modes.has(item.workMode))) return false;
    if (source && normalize(item.source ?? "") !== source) return false;
    if (filters.flag === "followup" && !isFollowUpDue(item, ctx.todayKey)) return false;
    if (filters.flag === "deadline" && !isDeadlineSoon(item, ctx.todayKey)) return false;
    if (filters.flag === "quiet" && !isQuiet(item, ctx.nowMs)) return false;
    if (tokens.length) {
      const haystack = normalize(`${item.company} ${item.role} ${item.location ?? ""} ${item.source ?? ""}`);
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });
}

const time = (d: Date | null | undefined) => (d ? new Date(d).getTime() : null);

export function sortApplications(items: ApplicationListItem[], sort: SortKey = "recent"): ApplicationListItem[] {
  const out = [...items];
  const byRecent = (a: ApplicationListItem, b: ApplicationListItem) => (time(b.updatedAt) ?? 0) - (time(a.updatedAt) ?? 0);
  switch (sort) {
    case "applied":
      return out.sort((a, b) => (time(b.appliedAt) ?? -Infinity) - (time(a.appliedAt) ?? -Infinity) || byRecent(a, b));
    case "company":
      return out.sort((a, b) => a.company.localeCompare(b.company, undefined, { sensitivity: "base" }) || a.role.localeCompare(b.role));
    case "excitement":
      return out.sort((a, b) => b.excitement - a.excitement || byRecent(a, b));
    case "deadline":
      return out.sort((a, b) => (time(a.deadline) ?? Infinity) - (time(b.deadline) ?? Infinity) || byRecent(a, b));
    default:
      return out.sort(byRecent);
  }
}

type RawParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(",") : []);

/** Reads deep-link filters like /applications?status=INTERVIEW&q=acme&flag=followup. */
export function filtersFromSearchParams(params: RawParams): ApplicationFilters & { view?: "board" | "list" } {
  const q = typeof params.q === "string" ? params.q.slice(0, MAX.search) : undefined;
  const statuses = list(params.status).map((s) => s.toUpperCase()).filter(isStatus);
  const workModes = list(params.mode)
    .map((s) => s.toUpperCase())
    .filter((s): s is WorkMode => (WORK_MODES as readonly string[]).includes(s));
  const source = typeof params.source === "string" ? params.source.slice(0, MAX.source) : undefined;
  const flag = isFlag(params.flag) ? params.flag : undefined;
  const sort = isSortKey(params.sort) ? params.sort : undefined;
  const view = params.view === "board" || params.view === "list" ? params.view : undefined;
  return { q, statuses, workModes, source, flag, sort, view };
}
