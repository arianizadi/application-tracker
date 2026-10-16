/**
 * Paste-a-link heuristics. Pure string parsing — nothing is fetched.
 * Recognizes common applicant-tracking hosts and suggests a company, a role
 * (only where the URL actually spells it out) and a source.
 */

export type JobUrlGuess = {
  url: string;
  company?: string;
  role?: string;
  source?: string;
  /** Human-readable name of the platform we recognized, e.g. "Greenhouse". */
  platform?: string;
};

const SMALL_WORDS = new Set(["and", "of", "the", "for", "at", "in", "on", "de"]);
const UPPER_WORDS = new Set(["ai", "ml", "it", "hr", "qa", "ui", "ux", "us", "usa", "llc", "inc", "io", "nyc", "sf", "soc", "devsecops", "grc", "iam", "api", "sre"]);

/** "palo-alto-networks" → "Palo Alto Networks". */
export function prettifySlug(slug: string): string {
  const cleaned = safeDecode(slug)
    .replace(/[_+]+/g, " ")
    .replace(/-+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (UPPER_WORDS.has(lower)) return lower === "devsecops" ? "DevSecOps" : lower.toUpperCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      // Keep words that already have intentional capitals (e.g. "CrowdStrike").
      if (/[A-Z]/.test(word.slice(1))) return word[0].toUpperCase() + word.slice(1);
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .slice(0, 120);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function looksLikeId(segment: string): boolean {
  return /^\d+$/.test(segment) || /^[a-f\d-]{20,}$/i.test(segment) || /^[A-Z]{0,3}[-_]?\d{4,}$/i.test(segment);
}

/** True when a pasted string is (probably) a link rather than a company name. */
export function looksLikeUrl(text: string): boolean {
  const t = text.trim();
  if (!t || /\s/.test(t)) return false;
  return /^https?:\/\//i.test(t) || /^(www\.)?[a-z\d-]+(\.[a-z\d-]+)+\/\S*/i.test(t);
}

export function parseJobUrl(input: string): JobUrlGuess | null {
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  const guess: JobUrlGuess = { url: url.toString() };

  // Greenhouse: boards.greenhouse.io/{company}/jobs/123, job-boards.greenhouse.io/{company}/..., embed?for=company
  if (host.endsWith("greenhouse.io")) {
    guess.platform = "Greenhouse";
    guess.source = "Greenhouse";
    const forParam = url.searchParams.get("for");
    const slug = forParam ?? (parts[0] && parts[0] !== "embed" ? parts[0] : undefined);
    if (slug) guess.company = prettifySlug(slug);
    return guess;
  }

  // Lever: jobs.lever.co/{company}/{uuid}
  if (host.endsWith("lever.co")) {
    guess.platform = "Lever";
    guess.source = "Lever";
    if (parts[0]) guess.company = prettifySlug(parts[0]);
    return guess;
  }

  // Ashby: jobs.ashbyhq.com/{company}/{uuid}
  if (host.endsWith("ashbyhq.com")) {
    guess.platform = "Ashby";
    guess.source = "Ashby";
    if (parts[0]) guess.company = prettifySlug(parts[0]);
    return guess;
  }

  // Workday: {company}.wd5.myworkdayjobs.com/{locale?}/{site}/job/{location}/{Title_R123}
  if (host.endsWith("myworkdayjobs.com") || host.endsWith("myworkdaysite.com")) {
    guess.platform = "Workday";
    guess.source = "Workday";
    const sub = host.split(".")[0];
    if (sub && !/^wd\d+$/.test(sub)) guess.company = prettifySlug(sub);
    const jobIdx = parts.indexOf("job");
    const titleSeg = jobIdx >= 0 ? parts[parts.length - 1] : undefined;
    if (titleSeg && jobIdx < parts.length - 1) {
      const title = titleSeg.replace(/_[A-Z]*-?\d[\w-]*$/i, "");
      if (title && !looksLikeId(title)) guess.role = prettifySlug(title);
    }
    return guess;
  }

  // SmartRecruiters: jobs.smartrecruiters.com/{Company}/{id-title}
  if (host.endsWith("smartrecruiters.com")) {
    guess.platform = "SmartRecruiters";
    guess.source = "SmartRecruiters";
    if (parts[0] && !/^(oneclick-ui|company)$/i.test(parts[0])) guess.company = prettifySlug(parts[0]);
    const job = parts[1]?.replace(/^\d+-/, "");
    if (job && !looksLikeId(job)) guess.role = prettifySlug(job);
    return guess;
  }

  // LinkedIn: linkedin.com/jobs/view/{title-at-company-123} or /jobs/view/123
  if (host.endsWith("linkedin.com")) {
    guess.platform = "LinkedIn";
    guess.source = "LinkedIn";
    const viewIdx = parts.indexOf("view");
    const slug = viewIdx >= 0 ? parts[viewIdx + 1] : undefined;
    if (slug && !looksLikeId(slug)) {
      const withoutId = slug.replace(/-\d+$/, "");
      const at = withoutId.lastIndexOf("-at-");
      if (at > 0) {
        guess.role = prettifySlug(withoutId.slice(0, at));
        guess.company = prettifySlug(withoutId.slice(at + 4));
      }
    }
    return guess;
  }

  // Handshake: app.joinhandshake.com/jobs/123 or {school}.joinhandshake.com
  if (host.endsWith("joinhandshake.com")) {
    guess.platform = "Handshake";
    guess.source = "Handshake";
    return guess;
  }

  if (host.endsWith("wellfound.com") || host.endsWith("angel.co")) {
    guess.platform = "Wellfound";
    guess.source = "Wellfound";
    const companyIdx = parts.indexOf("company");
    if (companyIdx >= 0 && parts[companyIdx + 1]) guess.company = prettifySlug(parts[companyIdx + 1]);
    return guess;
  }

  if (host.endsWith("indeed.com")) {
    guess.platform = "Indeed";
    guess.source = "Indeed";
    return guess;
  }

  if (host.endsWith("simplify.jobs")) {
    guess.platform = "Simplify";
    guess.source = "Simplify";
    return guess;
  }

  // careers.acme.com / jobs.acme.com / acme.com/careers → company site.
  const labels = host.split(".");
  const registrable = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
  const careersHost = labels.length > 2 && /^(careers?|jobs?)$/.test(labels[0]);
  const careersPath = parts.some((p) => /^(careers?|jobs?)$/i.test(p));
  if (careersHost || careersPath) {
    guess.source = "Company site";
    if (registrable && registrable.length > 1) guess.company = prettifySlug(registrable);
  }
  return guess;
}
