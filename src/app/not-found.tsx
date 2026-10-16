import type { Metadata } from "next";
import Link from "next/link";

import { Mascot } from "@/components/mascots";
import { TrailSign } from "@/components/marketing/trail-sign";
import { Logo } from "@/components/shell/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trail not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="grain flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          <Logo className="size-8" />
          <span className="font-display text-lg font-semibold">Canopy</span>
        </Link>
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="relative w-full max-w-sm">
            <TrailSign className="h-auto w-full" />
            <Mascot
              name="tuck"
              mood="think"
              className="absolute -bottom-2 left-0 size-24 sm:size-28"
              title="Tuck the turtle, studying the trail sign"
            />
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">Error 404</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            This trail goes nowhere.
          </h1>
          <p className="mt-3 text-lg text-ink-soft">Your applications are still where you left them.</p>
          <p className="mt-1 animate-fade text-sm italic text-muted [animation-delay:1.6s]">Tuck has filed a map correction.</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/home" size="lg" prefetch={false}>
              Back to the clearing
            </ButtonLink>
            <ButtonLink href="/applications" variant="secondary" size="lg" prefetch={false}>
              View applications
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted">
            New here?{" "}
            <Link href="/" className="font-medium text-moss underline-offset-4 hover:underline">
              Visit the Canopy homepage
            </Link>{" "}
            or{" "}
            <Link href="/faq" className="font-medium text-moss underline-offset-4 hover:underline">
              read the FAQ
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
