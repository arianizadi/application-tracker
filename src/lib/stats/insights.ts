/**
 * Deterministic insight cards: plain rules over computed stats, never generated
 * advice. Comparison rules follow the brief: show raw counts, require 20+
 * counted applications per group before stating a ratio (and still call it
 * preliminary), never compute a ratio against zero, and never claim causation.
 */
import type { MascotName } from "@/components/mascots";
import { BENCHMARKS } from "@/lib/stats/benchmarks";
import type { BreakdownRow, Rate, Stats } from "@/lib/stats/compute";
import { days, pct, plural } from "@/lib/stats/format";

export type InsightTone = "celebrate" | "info" | "nudge" | "comfort";

export type Insight = {
  id: string;
  tone: InsightTone;
  mascot: MascotName;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  priority: number;
};

const RATIO_MIN = 20;
const COUNTS_MIN = 5;

function ratioText(a: number, b: number, noun: string, other: string): string {
  const r = a / b;
  if (r >= 1.95) return `${Math.round(r * 10) / 10}x the ${noun} of ${other}`;
  return `${Math.round((r - 1) * 100)}% more ${noun} than ${other}`;
}

/** Compare the two strongest-evidence groups; null when evidence is thin. */
function compareRows(
  rows: BreakdownRow[],
  metric: "reply" | "interview",
  name: (r: BreakdownRow) => string,
  noun: string,
  pluralSubject = false,
): { title: string; body: string; strong: boolean } | null {
  const v = pluralSubject
    ? { is: "are", isnt: "aren't", gets: "get" }
    : { is: "is", isnt: "isn't", gets: "gets" };
  const usable = rows.filter((r) => !r.unrecorded && r.key !== "__other" && r[metric].den >= COUNTS_MIN);
  if (usable.length < 2) return null;
  const [x, y] = [...usable].sort((a, b) => b[metric].den - a[metric].den).slice(0, 2);
  const [a, b] = (x[metric].value ?? 0) >= (y[metric].value ?? 0) ? [x, y] : [y, x];
  const ra: Rate = a[metric];
  const rb: Rate = b[metric];
  if (ra.value === null || rb.value === null || ra.value === rb.value) return null;
  const counts = `${name(a)}: ${ra.num}/${ra.den} · ${name(b)}: ${rb.num}/${rb.den}`;

  if (ra.den >= RATIO_MIN && rb.den >= RATIO_MIN) {
    if (rb.value === 0) {
      return {
        title: `${name(a)} ${v.is} getting ${noun} and ${name(b)} ${v.isnt} (yet)`,
        body: `${counts}. Still preliminary, and different roles or timing could explain some of it.`,
        strong: true,
      };
    }
    const gapPts = Math.round((ra.value - rb.value) * 100);
    if (gapPts < 3) return null;
    return {
      title: `${name(a)} ${v.gets} ${ratioText(ra.value, rb.value, noun, name(b))}`,
      body: `${counts}. Preliminary, and different roles, dates or employers may explain part of the gap. Worth leaning into.`,
      strong: true,
    };
  }
  return {
    title: `${name(a)} ${v.is} ahead so far, but it's early`,
    body: `${counts}. Too early to crown a winner. Keep logging which one you use.`,
    strong: false,
  };
}

export function getInsights(stats: Stats, options: { limit?: number } = {}): Insight[] {
  const limit = options.limit ?? 6;
  const out: Insight[] = [];
  const { rates, totals, pipeline, weekly, breakdowns } = stats;
  const submitted = totals.submitted;

  /* Follow-ups. */
  if (pipeline.followUpsDue.length > 0) {
    const n = pipeline.followUpsDue.length;
    out.push({
      id: "followups-due",
      tone: "nudge",
      mascot: "tuck",
      title: `${plural(n, "follow-up")} ${n === 1 ? "is" : "are"} due`,
      body: `${pipeline.followUpsDue.slice(0, 2).map((f) => f.company).join(" and ")}${n > 2 ? ` and ${n - 2} more` : ""}. A two-line check-in is polite, normal, and takes five minutes.`,
      href: "/applications",
      cta: "Open applications",
      priority: 92,
    });
  }
  if (pipeline.waiting.length >= 2) {
    const n = pipeline.waiting.length;
    out.push({
      id: "waiting",
      tone: "nudge",
      mascot: "tuck",
      title: `${n} apps waiting 14+ days. Follow up?`,
      body: `Slow replies are still replies. A short, friendly nudge to a recruiter is totally normal. Worst case: still quiet. Best case: you float to the top of the pile.`,
      href: "/applications",
      cta: "See who's waiting",
      priority: 80,
    });
  }

  /* Weekly goal. */
  if (weekly.goal > 0 && weekly.thisWeek >= weekly.goal) {
    out.push({
      id: "goal-met",
      tone: "celebrate",
      mascot: "miso",
      title: "This week's goal: done",
      body:
        weekly.goalStreak >= 2
          ? `${weekly.goalStreak} weeks in a row. Anything else this week is a bonus, not a requirement.`
          : "Your plan for this week is complete. Anything else is optional. Go touch grass (or a CTF).",
      priority: 85,
    });
  }

  /* Interview rate vs reference. */
  const bench = BENCHMARKS.interview;
  if (!rates.interview.lowSample && rates.interview.value !== null && rates.interview.value > bench.high) {
    out.push({
      id: "interview-strong",
      tone: "celebrate",
      mascot: "pip",
      title: `${pct(rates.interview.value)} of your apps reach interviews`,
      body: `${rates.interview.num} of ${rates.interview.den}. A broad recruiting study saw ${bench.rangeText}. Different population, but that's a genuinely good sign.`,
      priority: 76,
    });
  }

  /* OA → interview conversion. */
  if (rates.oaToInterview.den >= 3 && (rates.oaToInterview.value ?? 0) >= 0.4) {
    out.push({
      id: "oa-strong",
      tone: "celebrate",
      mascot: "pip",
      title: "Your OAs turn into interviews",
      body: `${rates.oaToInterview.num} of ${rates.oaToInterview.den} assessments led to an interview. Whatever your prep routine is, it works.`,
      priority: 66,
    });
  } else if (rates.oaToInterview.den >= 4 && rates.oaToInterview.num === 0) {
    out.push({
      id: "oa-practice",
      tone: "info",
      mascot: "alder",
      title: "OAs are your bottleneck right now",
      body: `${rates.oaToInterview.den} assessments, no interviews yet. That's very fixable: a couple of timed practice sets a week usually shifts this.`,
      href: "/prep",
      cta: "Open prep",
      priority: 64,
    });
  }

  /* Resume version comparison. */
  const resumeCmp = compareRows(breakdowns.resume, "reply", (r) => r.label.split(" · ")[0], "replies");
  if (resumeCmp) {
    out.push({ id: "resume-compare", tone: "info", mascot: "nib", ...resumeCmp, priority: resumeCmp.strong ? 72 : 44 });
  }

  /* Referral vs everything else. */
  const referral = breakdowns.source.find((r) => r.key === "referral");
  const others = breakdowns.source.filter((r) => r.key !== "referral" && !r.unrecorded);
  if (referral && referral.reply.den >= COUNTS_MIN && others.length) {
    const rest: BreakdownRow = {
      key: "rest",
      label: "Everything else",
      apps: others.reduce((s, r) => s + r.apps, 0),
      replies: 0,
      interviews: 0,
      offers: 0,
      reply: (() => {
        const num = others.reduce((s, r) => s + r.reply.num, 0);
        const den = others.reduce((s, r) => s + r.reply.den, 0);
        return { num, den, value: den ? num / den : null, lowSample: den < 10 };
      })(),
      interview: { num: 0, den: 0, value: null, lowSample: true },
    };
    const cmp = compareRows([referral, rest], "reply", (r) => (r.key === "referral" ? "Referral apps" : "other apps"), "replies", true);
    if (cmp && (referral.reply.value ?? 0) > (rest.reply.value ?? 0)) {
      out.push({
        id: "referral",
        tone: "info",
        mascot: "alder",
        title: cmp.title.charAt(0).toUpperCase() + cmp.title.slice(1),
        body: `${cmp.body} Referred candidates are pre-screened, so it's not magic, but it's a strong reason to ask one more person.`,
        priority: cmp.strong ? 70 : 46,
      });
    }
  } else if (!referral && submitted >= 15) {
    out.push({
      id: "no-referrals",
      tone: "info",
      mascot: "alder",
      title: "No referral apps logged yet",
      body: "In broad recruiting data, referred applications reached interviews far more often than cold ones (~40% vs ~3%), partly because they're pre-screened. One message to a classmate, TA, or club alum can be worth ten cold apps.",
      priority: 42,
    });
  }

  /* Source with most interviews. */
  const totalInterviews = breakdowns.source.reduce((s, r) => s + r.interviews, 0);
  const topSource = [...breakdowns.source].filter((r) => !r.unrecorded).sort((a, b) => b.interviews - a.interviews)[0];
  if (topSource && totalInterviews >= 3 && topSource.interviews / totalInterviews >= 0.5 && topSource.key !== "referral") {
    out.push({
      id: "source-interviews",
      tone: "info",
      mascot: "rue",
      title: `${topSource.label} brought ${topSource.interviews} of your ${totalInterviews} interviews`,
      body: `From ${plural(topSource.apps, "application")}. Not proof it's the best channel, but it's clearly a good one for you.`,
      priority: 58,
    });
  }

  /* Most apps are brand new. */
  if (submitted >= 3 && stats.recent / submitted > 0.5) {
    out.push({
      id: "mostly-new",
      tone: "comfort",
      mascot: "tuck",
      title: "Most of your apps are still brand new",
      body: `${stats.recent} of ${submitted} are under two weeks old. Companies often take one to three weeks, so these numbers will settle as they age. Silence this early isn't a verdict.`,
      priority: 60,
    });
  }

  /* Rejection resilience. */
  if (stats.resilience.rejections >= 3) {
    const { rejections, sentAfterFirstRejection } = stats.resilience;
    out.push({
      id: "resilience",
      tone: "comfort",
      mascot: "prickle",
      title: `${rejections} rejections, and you kept going`,
      body:
        sentAfterFirstRejection > 0
          ? `You've sent ${plural(sentAfterFirstRejection, "application")} since your first no. Every rejection is compost. It feeds the next thing that grows.`
          : "Each one stings. Each one is also a reply, which beats silence. You're still growing.",
      priority: 54,
    });
  }

  /* Ghosting. */
  if (!rates.ghost.lowSample && (rates.ghost.value ?? 0) >= 0.4) {
    out.push({
      id: "ghosts",
      tone: "comfort",
      mascot: "tuck",
      title: "Lots of ghosting. That's a them problem.",
      body: `${rates.ghost.num} of ${rates.ghost.den} went quiet. Many companies simply never close the loop on internship applications. It says more about their inbox than about you.`,
      priority: 50,
    });
  }

  /* Response time. */
  if (stats.responseTime.n >= 3 && stats.responseTime.median !== null) {
    const sameDay = stats.responseTime.median < 1;
    out.push({
      id: "response-time",
      tone: "info",
      mascot: "tuck",
      title: sameDay ? "Your replies have come within a day" : `Replies take about ${days(stats.responseTime.median)} for you`,
      body: sameDay
        ? `Median across ${stats.responseTime.n} replies. That's quick; most companies take longer, so a quiet week after applying is still normal.`
        : `Median across ${stats.responseTime.n} replies. So a quiet week after applying is normal, not a sign.`,
      priority: 40,
    });
  }

  /* Weekday rhythm. */
  if (stats.bestDay && stats.bestDay.share >= 0.25) {
    out.push({
      id: "best-day",
      tone: "info",
      mascot: "alder",
      title: `You apply most on ${stats.bestDay.plural}`,
      body: `${stats.bestDay.count} of your ${submitted} applications. ${stats.bestDay.long}-you is carrying the team. Maybe block 30 minutes on another day too, so it's not all on one sitting.`,
      priority: 38,
    });
  }

  /* Excitement vs replies. */
  const hi = breakdowns.excitement.filter((r) => Number(r.key) >= 4);
  const lo = breakdowns.excitement.filter((r) => Number(r.key) <= 3);
  const hiDen = hi.reduce((s, r) => s + r.reply.den, 0);
  const loDen = lo.reduce((s, r) => s + r.reply.den, 0);
  if (hiDen >= 10 && loDen >= 10) {
    const hiRate = hi.reduce((s, r) => s + r.reply.num, 0) / hiDen;
    const loRate = lo.reduce((s, r) => s + r.reply.num, 0) / loDen;
    if (hiRate - loRate >= 0.08) {
      out.push({
        id: "excitement",
        tone: "info",
        mascot: "alder",
        title: "Apps you're excited about hear back more",
        body: `${pct(hiRate)} reply rate for 4–5 heart apps vs ${pct(loRate)} for the rest. Maybe excitement shows in the effort. Fewer, better-fit apps could pay off.`,
        priority: 36,
      });
    }
  }

  /* Missing resume versions. */
  if (stats.missingResume >= 3 && submitted >= 5) {
    out.push({
      id: "missing-resume",
      tone: "nudge",
      mascot: "nib",
      title: `${plural(stats.missingResume, "application")} ${stats.missingResume === 1 ? "has" : "have"} no resume version`,
      body: "Linking the resume you used is how we'll tell you which version actually gets replies.",
      href: "/applications",
      cta: "Add versions",
      priority: 34,
    });
  }

  /* Milestones. */
  if (totals.submittedAllTime >= 10 && totals.submittedAllTime < 15) {
    out.push({
      id: "ten",
      tone: "celebrate",
      mascot: "acorn",
      title: `${totals.submittedAllTime} applications recorded`,
      body: "Your forest now has enough trees to need directions. Patterns start showing up around here.",
      priority: 48,
    });
  }

  /* Break. */
  if (stats.daysSinceLastSubmission !== null && stats.daysSinceLastSubmission >= 14) {
    out.push({
      id: "break",
      tone: "comfort",
      mascot: "moss",
      title: "Quiet couple of weeks",
      body: "Your records are right here. Rest counts. When you're ready, start with whichever application matters most now. One is plenty.",
      href: "/applications/new",
      cta: "Add one",
      priority: 62,
    });
  }

  if (out.length === 0) {
    out.push({
      id: "keep-going",
      tone: "info",
      mascot: "alder",
      title: "Patterns are still sprouting",
      body: "Log a few more applications (with source and resume version) and I'll start pointing out what works for you.",
      href: "/applications/new",
      cta: "Add an application",
      priority: 1,
    });
  }

  return out.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

/** One plain-language sentence answering "am I doing OK?". */
export function headline(stats: Stats): string {
  const { totals, rates } = stats;
  if (totals.submitted === 0) {
    return totals.submittedAllTime > 0
      ? "Nothing sent in this window. Try a wider range, or treat this as your rest stop."
      : "No applications yet. The first one is the hardest, and it's also just one.";
  }
  if (rates.interview.lowSample) {
    return `Early days: ${plural(totals.submitted, "application")} counted. Real patterns usually show up around 10 to 20. You're building the dataset.`;
  }
  const v = rates.interview.value ?? 0;
  if (v > BENCHMARKS.interview.high) return "Honestly? You're doing well. Your interview rate is above the usual reference range.";
  if (v >= BENCHMARKS.interview.low) return "You're right on track. Interviews are landing at a normal clip, which is how most offers start.";
  if ((rates.reply.value ?? 0) > 0) return "You're putting in the reps and companies are replying. A few tweaks could turn more of those into interviews.";
  return "You're putting in the reps. Silence is common early on. Let's look at what to tweak.";
}
