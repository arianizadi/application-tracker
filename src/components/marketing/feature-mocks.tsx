import { StatusPill } from "@/components/ui/status-pill";

/*
 * Small, static UI vignettes for the landing page. They are illustrations of
 * the product (decorative, aria-hidden) built from real design tokens, so they
 * follow light/dark mode and cost no images.
 */

function MockFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none select-none rounded-2xl border border-line bg-paper p-4 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function QuickAddMock() {
  return (
    <MockFrame>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quick add</p>
        <span className="rounded-full bg-moss-soft px-2 py-0.5 text-[11px] font-medium text-moss-strong tabular">saved in 8s</span>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="rounded-xl border border-line-strong bg-card px-3 py-2 text-sm">
          <span className="text-muted">Company · </span>Hollow Oak Bank
        </div>
        <div className="rounded-xl border border-line-strong bg-card px-3 py-2 text-sm">
          <span className="text-muted">Role · </span>Security Analyst Intern
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusPill status="WISHLIST" className="opacity-60" />
        <StatusPill status="APPLIED" className="ring-2 ring-moss/40" />
        <StatusPill status="ASSESSMENT" className="opacity-60" />
        <StatusPill status="INTERVIEW" className="opacity-60" />
      </div>
    </MockFrame>
  );
}

const RESUMES = [
  { v: 3, label: "SOC analyst focus", apps: 14, star: true },
  { v: 2, label: "Cloud security", apps: 9, star: false },
  { v: 1, label: "General", apps: 6, star: false },
];

export function ResumeMock() {
  return (
    <MockFrame>
      <ul className="flex flex-col gap-2">
        {RESUMES.map((r) => (
          <li key={r.v} className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sun-soft font-mono text-xs font-semibold text-bark">
              v{r.v}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{r.label}</span>
              <span className="block text-xs text-muted tabular">used for {r.apps} applications</span>
            </span>
            {r.star ? (
              <span className="rounded-full bg-moss-soft px-2 py-0.5 text-[11px] font-medium text-moss-strong">default</span>
            ) : null}
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

export function AnalyzerMock() {
  const pct = 78;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <MockFrame className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="size-24 shrink-0 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--moss)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
        />
        <text x="40" y="46" textAnchor="middle" transform="rotate(90 40 40)" fontSize="18" fontWeight="600" fill="var(--ink)" className="font-display">
          {pct}%
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Found</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["SIEM", "Python", "incident response", "TCP/IP"].map((k) => (
            <span key={k} className="rounded-full bg-moss-soft px-2 py-0.5 text-xs text-moss-strong">
              {k}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Not mentioned</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["Splunk", "IAM"].map((k) => (
            <span key={k} className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-xs text-ink-soft">
              {k}
            </span>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}

const FUNNEL = [
  { label: "Applied", n: 42, color: "bg-moss" },
  { label: "Heard back", n: 13, color: "bg-sky" },
  { label: "Interviews", n: 5, color: "bg-sun" },
  { label: "Offers", n: 1, color: "bg-berry" },
];

export function StatsMock() {
  return (
    <MockFrame>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">This season</p>
        <p className="text-xs text-muted">
          response rate <span className="font-semibold text-ink tabular">31%</span>
        </p>
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {FUNNEL.map((row) => (
          <li key={row.label} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 text-xs">
            <span className="text-ink-soft">{row.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-2">
              <span className={`block h-full rounded-full ${row.color}`} style={{ width: `${Math.max(4, (row.n / 42) * 100)}%` }} />
            </span>
            <span className="text-right font-semibold tabular">{row.n}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

const MODULES = [
  { label: "Networking: TCP/IP, DNS, TLS", state: "done" },
  { label: "Linux, logs & the command line", state: "done" },
  { label: "Web vulns (OWASP Top 10)", state: "half" },
  { label: "Incident response stories", state: "todo" },
  { label: "Home lab show-and-tell", state: "todo" },
] as const;

export function PrepMock() {
  return (
    <MockFrame>
      <div className="flex items-center justify-between text-xs">
        <p className="font-semibold uppercase tracking-[0.14em] text-muted">Cyber interview prep</p>
        <p className="text-muted tabular">2.5 / 5</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full w-1/2 rounded-full bg-moss" />
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {MODULES.map((m) => (
          <li key={m.label} className="flex items-center gap-2.5 text-sm">
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                m.state === "done" ? "border-moss bg-moss text-paper" : m.state === "half" ? "border-sun bg-sun-soft" : "border-line-strong"
              }`}
            >
              {m.state === "done" ? (
                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2.5 6.5 2.2 2L9.5 3.5" />
                </svg>
              ) : m.state === "half" ? (
                <span className="size-2 rounded-full bg-sun" />
              ) : null}
            </span>
            <span className={m.state === "done" ? "text-muted line-through decoration-line-strong" : ""}>{m.label}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

const BADGES = [
  { label: "First seed", tone: "bg-moss-soft text-moss-strong", glyph: "M12 20v-7m0 0c0-4 3-6 6-6 0 4-3 6-6 6Zm0 0c0-3-2-5-5-5 0 3 2 5 5 5Z" },
  { label: "A whole grove", tone: "bg-sun-soft text-bark", glyph: "M7 20v-4m10 4v-5M12 20v-7M7 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm10 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm-5-3a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" },
  { label: "Brave inbox", tone: "bg-coral-soft text-coral", glyph: "M6 14c0-4 3-7 6-7s6 3 6 7H6Zm4 0v5m4-5v5M9 10.5h.01M14 9.5h.01" },
  { label: "Follow-up fox", tone: "bg-berry-soft text-berry", glyph: "M5 6l3 3 4-3 4 3 3-3v8a7 7 0 0 1-14 0V6Z" },
];

export function AchievementsMock() {
  return (
    <MockFrame>
      <div className="flex items-center justify-between text-xs">
        <p className="font-semibold text-ink">
          Level 4 · <span className="font-display italic">Sapling grove</span>
        </p>
        <p className="text-muted tabular">320 / 400 XP</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-leaf to-sun" />
      </div>
      <ul className="mt-4 grid grid-cols-4 gap-2">
        {BADGES.map((b) => (
          <li key={b.label} className="flex flex-col items-center gap-1.5 text-center">
            <span className={`grid size-11 place-items-center rounded-2xl ${b.tone}`}>
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={b.glyph} />
              </svg>
            </span>
            <span className="text-[11px] leading-tight text-ink-soft">{b.label}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

/** Soil cross-section: a fallen leaf turning into mushrooms and a new sprout. */
export function CompostArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden>
      <defs>
        <symbol id="mk-shroom" viewBox="0 0 40 40">
          <path d="M17 22h6l1.5 15h-9Z" fill="var(--card)" stroke="var(--line-strong)" strokeWidth="1.2" />
          <path d="M4 23c0-9 7-15 16-15s16 6 16 15Z" fill="var(--coral)" />
          <circle cx="13" cy="16" r="2.2" fill="var(--card)" />
          <circle cx="24" cy="13" r="1.8" fill="var(--card)" />
          <circle cx="29" cy="19" r="1.5" fill="var(--card)" />
        </symbol>
      </defs>
      <rect x="0" y="120" width="320" height="80" rx="18" fill="var(--bark)" opacity="0.28" />
      <rect x="0" y="150" width="320" height="50" rx="18" fill="var(--bark)" opacity="0.38" />
      <g fill="var(--bark)" opacity="0.55">
        <circle cx="40" cy="168" r="3" />
        <circle cx="96" cy="182" r="2" />
        <circle cx="160" cy="172" r="2.5" />
        <circle cx="232" cy="186" r="2" />
        <circle cx="286" cy="166" r="3" />
      </g>
      <path d="M0 122c40-8 80-6 120-1s90 7 130 0 50-4 70-2" fill="none" stroke="var(--moss)" strokeWidth="3" strokeLinecap="round" />
      {/* fallen leaf (the rejection), already softening into the soil */}
      <path d="M50 122c6-14 26-20 42-14-6 14-24 20-42 14Z" fill="var(--sun)" opacity="0.8" />
      <path d="M52 121c12-3 24-7 38-12" stroke="var(--bark)" strokeWidth="1.2" fill="none" />
      <use href="#mk-shroom" x="110" y="86" width="40" height="40" />
      <use href="#mk-shroom" x="138" y="98" width="26" height="26" />
      {/* the new sprout */}
      <g className="origin-bottom animate-sway" style={{ transformBox: "fill-box" }}>
        <path d="M232 122V70" stroke="var(--moss)" strokeWidth="4" strokeLinecap="round" />
        <path d="M232 92c0-16 12-26 30-26 0 16-12 26-30 26Z" fill="var(--leaf)" />
        <path d="M232 80c0-14-10-22-24-22 0 14 10 22 24 22Z" fill="var(--moss)" />
      </g>
      <path d="M232 122c-6 10-14 16-24 22m24-22c4 12 12 18 22 22m-22-22v26" stroke="var(--bark)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
      <circle cx="292" cy="34" r="14" fill="var(--sun)" opacity="0.9" />
    </svg>
  );
}
