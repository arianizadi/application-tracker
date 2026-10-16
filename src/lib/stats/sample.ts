/**
 * A deterministic, obviously-fake snapshot used to preview the dashboard
 * before someone has enough applications. Dates are relative to `now`.
 */
import type { ApplicationStatus, WorkMode } from "@prisma/client";

import type { SnapshotApplication, UserSnapshot } from "@/lib/data/snapshot";
import { DAY_MS } from "@/lib/stats/time";

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const COMPANIES = ["Acme Security", "Northwind", "Blue Harbor", "Pinecrest Labs", "Lumen Bank", "Cedar Health", "Orbit Systems", "Fable Games", "Quarry Data", "Maple Gov"];
const SOURCES = ["Handshake", "LinkedIn", "Company site", "Referral", "Career fair"];
const MODES: WorkMode[] = ["ONSITE", "HYBRID", "REMOTE"];

export function sampleSnapshot(now: Date): UserSnapshot {
  const rand = rng(20261016);
  const t0 = now.getTime();
  const resumes = [
    { id: "sample-r1", label: "General", version: 1, isDefault: false, createdAt: new Date(t0 - 100 * DAY_MS) },
    { id: "sample-r2", label: "Security focus", version: 2, isDefault: true, createdAt: new Date(t0 - 50 * DAY_MS) },
  ];
  const applications: SnapshotApplication[] = [];
  for (let i = 0; i < 34; i++) {
    const daysAgo = Math.floor(rand() * 84) + 1;
    const appliedAt = new Date(t0 - daysAgo * DAY_MS);
    const source = SOURCES[Math.floor(rand() * SOURCES.length)];
    const referral = source === "Referral";
    const roll = rand();
    const history: { status: ApplicationStatus; at: Date }[] = [{ status: "APPLIED", at: appliedAt }];
    let status: ApplicationStatus = "APPLIED";
    const at = (d: number) => new Date(Math.min(t0, appliedAt.getTime() + d * DAY_MS));
    if (daysAgo > 6) {
      if (roll < (referral ? 0.35 : 0.1)) {
        history.push({ status: "ASSESSMENT", at: at(5) });
        status = "ASSESSMENT";
        if (rand() < 0.6 && daysAgo > 12) {
          history.push({ status: "INTERVIEW", at: at(12) });
          status = "INTERVIEW";
          if (rand() < 0.3 && daysAgo > 25) {
            history.push({ status: "OFFER", at: at(25) });
            status = "OFFER";
          }
        }
      } else if (roll < 0.45) {
        history.push({ status: "REJECTED", at: at(3 + Math.floor(rand() * 20)) });
        status = "REJECTED";
      } else if (roll < 0.62 && daysAgo > 35) {
        history.push({ status: "GHOSTED", at: at(35) });
        status = "GHOSTED";
      }
    }
    applications.push({
      id: `sample-${i}`,
      company: COMPANIES[i % COMPANIES.length],
      role: "Security intern",
      status,
      workMode: MODES[Math.floor(rand() * MODES.length)],
      source,
      excitement: 1 + Math.floor(rand() * 5),
      resumeId: daysAgo > 50 ? "sample-r1" : "sample-r2",
      appliedAt,
      createdAt: appliedAt,
      updatedAt: history[history.length - 1].at,
      followUpAt: null,
      deadline: null,
      history,
    });
  }
  return { applications, resumes, analyses: [], progress: [] };
}
