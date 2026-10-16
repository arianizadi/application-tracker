import { ArtFade } from "@/components/art";
import { Mascot } from "@/components/mascots";
import { StatsDashboard } from "@/components/stats/stats-dashboard";
import { ButtonLink } from "@/components/ui/button";
import { computeStats } from "@/lib/stats/compute";
import { sampleSnapshot } from "@/lib/stats/sample";

/**
 * Shown until there are at least 3 submitted applications: an honest
 * "this is what it'll look like" preview built from obviously-sample data.
 */
export function StatsEmptyPreview({ submitted, wishlist, now, timeZone, track }: { submitted: number; wishlist: number; now: Date; timeZone: string; track: string }) {
  const sample = computeStats(sampleSnapshot(now), now, timeZone, { range: "all", weeklyGoal: 4 });
  const toGo = Math.max(0, 3 - submitted);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card via-card to-moss-soft p-6 shadow-soft sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex shrink-0 -space-x-4">
            <Mascot name="alder" mood="happy" enter className="size-20 sm:size-24" title="Alder the owl" />
            <Mascot name="tuck" mood="idle" enter className="size-16 translate-y-3 sm:size-20" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold sm:text-3xl">Your stats are still seedlings</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              {submitted === 0
                ? "Once you've sent a few applications, this page turns into your scoreboard: reply rates, interview rates, what's working, and honest context on whether you're on track."
                : `${toGo} more ${toGo === 1 ? "application" : "applications"} and the real charts switch on. Until then, here's a peek at what's coming.`}
              {wishlist ? ` You've got ${wishlist} on your wishlist, so one of those could be next.` : ""}
            </p>
            <p className="mt-2 text-sm text-muted">Alder&apos;s take: one good application beats five rushed ones. Tuck&apos;s take: no rush at all.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href="/applications/new">Add an application</ButtonLink>
              {wishlist ? (
                <ButtonLink href="/applications" variant="secondary">
                  Open wishlist
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <ArtFade delay={220} className="relative">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          <span aria-hidden className="h-px flex-1 bg-line" />
          Preview with sample data
          <span aria-hidden className="h-px flex-1 bg-line" />
        </p>
        <div
          inert
          aria-hidden
          className="pointer-events-none select-none opacity-55 grayscale-[35%] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        >
          <StatsDashboard stats={sample} track={track} preview />
        </div>
      </ArtFade>
    </div>
  );
}
