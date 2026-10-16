import Link from "next/link";

import { Logo } from "@/components/shell/logo";
import { ButtonLink } from "@/components/ui/button";

/**
 * Header for public pages (landing, FAQ, 404). Fully static: it never reads
 * cookies, so it always offers both "Sign in" and "Get started". Signed-in
 * visitors who tap "Sign in" are bounced to /home by the proxy.
 */
export function PublicHeader({ current }: { current?: "home" | "faq" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-lift"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="Canopy home">
          <Logo className="size-9" />
          <span className="font-display text-xl font-semibold tracking-tight">Canopy</span>
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/faq"
            aria-current={current === "faq" ? "page" : undefined}
            className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink aria-[current=page]:text-moss sm:inline-flex"
          >
            FAQ
          </Link>
          <ButtonLink href="/login" variant="ghost" size="sm" className="min-h-11 sm:min-h-0">
            Sign in
          </ButtonLink>
          <ButtonLink href="/signup" size="sm" className="min-h-11 sm:min-h-0">
            Get started
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
