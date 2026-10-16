import Link from "next/link";

import { Logo } from "@/components/shell/logo";

const LINKS = [
  { href: "/signup", label: "Create an account" },
  { href: "/login", label: "Sign in" },
  { href: "/faq", label: "FAQ" },
  { href: "/faq#privacy-security", label: "Privacy & security" },
] as const;

/** Footer for public pages. Static (no dates, no cookies) so pages prerender. */
export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-paper-2/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-10">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-display text-lg font-semibold">Canopy</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            You handle the applying. This place remembers the work. A cozy internship tracker for students who are tired of
            spreadsheets.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:flex sm:gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted sm:px-6 lg:px-10">
        Made with care (and an unreasonable number of mushrooms). No ads. Your data is never sold.
      </p>
    </footer>
  );
}
