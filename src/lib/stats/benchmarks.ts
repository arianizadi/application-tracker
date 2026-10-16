/**
 * Reference ranges, honestly labeled. These are rough context from broader
 * recruiting data, NOT internship-specific targets: they vary by field,
 * season, school, eligibility and how completely someone tracks replies.
 * Never phrase a comparison as "below average"; say what was observed.
 */
import type { Rate } from "@/lib/stats/compute";
import { pct } from "@/lib/stats/format";

export type BenchmarkSource = {
  name: string;
  url: string;
  published: string;
  period: string;
  population: string;
  definition: string;
};

export type Benchmark = {
  key: "interview" | "referral";
  label: string;
  /** Short label for the user's own matching metric. */
  yours: string;
  low: number;
  high: number;
  rangeText: string;
  source: BenchmarkSource;
  caveat: string;
};

export const BENCHMARK_DISCLAIMER =
  "Rough ranges, not targets. They come from broader recruiting data and vary a lot by field, season, school, eligibility and how carefully replies get logged.";

export const BENCHMARKS: Record<Benchmark["key"], Benchmark> = {
  interview: {
    key: "interview",
    label: "Application → interview",
    yours: "Your interview rate",
    low: 0.03,
    high: 0.05,
    rangeText: "about 3–5%",
    source: {
      name: "Ashby Talent Trends",
      url: "https://www.ashbyhq.com/talent-trends-report/reports/2023-recruiter-productivity-trends-report",
      published: "April 2026",
      period: "2021 – March 2026 (Q1 2026 figures: 3.6% technical, 4.7% business)",
      population: "109M+ applications across 247K jobs, all levels, not just internships",
      definition: "Applications that progressed to an interview ÷ applications received",
    },
    caveat: "Broader recruiting data, not internship-specific. Its applicants and roles differ from yours.",
  },
  referral: {
    key: "referral",
    label: "Referred applications → interview",
    yours: "Your referral interview rate",
    low: 0.3,
    high: 0.45,
    rangeText: "roughly 40% (vs ~3% for inbound)",
    source: {
      name: "Ashby referral analysis",
      url: "https://www.ashbyhq.com/talent-trends-report/reports/referrals",
      published: "2025",
      period: "2025 analysis",
      population: "Applications on Ashby, all levels",
      definition: "Referred vs inbound applications that progressed to an interview",
    },
    caveat: "Referred candidates are pre-filtered, so this doesn't mean a referral alone multiplies your odds 13×. It does mean referrals are worth asking for.",
  },
};

/** Metrics where no trustworthy public benchmark exists. Say so instead of inventing one. */
export const NO_BENCHMARK: { key: "reply" | "offer"; label: string; note: string }[] = [
  {
    key: "reply",
    label: "Reply rate",
    note: "There's no reliable published reply rate for internship applications, so we won't make one up. Compare against past-you instead: the trend line on your reply-rate tile.",
  },
  {
    key: "offer",
    label: "Offer rate",
    note: "You'll see a “62% offer rate” quoted online. That's NACE's rate of full-time offers to existing interns, a totally different thing from landing an internship. Don't let it mess with your head.",
  },
];

export const MARKET_CONTEXT: { text: string; source: string; url: string }[] = [
  {
    text: "Internship postings on Handshake fell more than 15% between January 2023 and January 2025. If it feels harder than it did for older friends, that's because it is.",
    source: "Handshake Internships Index, 2025",
    url: "https://joinhandshake.com/research/economic-research/handshake-internships-index-2025/",
  },
];

/** Track-specific context (not numbers, just honest framing). */
export const TRACK_NOTES: Record<string, { title: string; points: string[] }> = {
  cybersecurity: {
    title: "Cybersecurity internships specifically",
    points: [
      "The market is competitive and many security teams hire few interns, so single-digit interview rates from cold applications are common.",
      "Referrals, a cert like Security+, and proof of hands-on work (a home lab, CTF writeups, a GitHub project) tend to move the needle more than volume alone.",
      "Government and defense roles often run on slow, clearance-driven timelines. Long silences there are normal.",
    ],
  },
};

export type Verdict = {
  level: "early" | "below" | "typical" | "above";
  title: string;
  text: string;
};

/** Friendly, non-judgmental comparison of an observed rate to a reference range. */
export function verdict(rate: Rate, bench: Pick<Benchmark, "low" | "high" | "rangeText">): Verdict {
  if (rate.value === null || rate.lowSample) {
    return {
      level: "early",
      title: "Too early to compare",
      text: `Comparisons need at least 10 applications that are a week old or have heard back. You have ${rate.den}. Keep planting.`,
    };
  }
  const observed = `${pct(rate.value)} (${rate.num} of ${rate.den})`;
  if (rate.value > bench.high) {
    return {
      level: "above",
      title: "Above typical",
      text: `${observed}, above the ${bench.rangeText} reference. Whatever you're doing, keep doing it.`,
    };
  }
  if (rate.value >= bench.low) {
    return {
      level: "typical",
      title: "In the typical range",
      text: `${observed}, right inside the ${bench.rangeText} reference. Steady and normal, which is exactly how most offers start.`,
    };
  }
  return {
    level: "below",
    title: "Under the reference so far",
    text: `${observed} against roughly ${bench.rangeText}. Small numbers swing a lot. Change one thing at a time (resume version, where you apply, asking for referrals) and watch this move.`,
  };
}
