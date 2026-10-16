import type { Metadata } from "next";

import { Mascot, MASCOTS } from "@/components/mascots";
import { monthName } from "@/components/resumes/format";
import { PerformanceCard } from "@/components/resumes/performance";
import { UploadCard } from "@/components/resumes/upload-card";
import { VersionTimeline } from "@/components/resumes/version-timeline";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { getResumeLibrary } from "@/lib/resumes/queries";
import { computeResumeStats, findBestVersion } from "@/lib/resumes/stats";
import { TRACKS } from "@/lib/tracks";

export const metadata: Metadata = { title: "Resumes" };

const TRACK_SHORT: Record<string, string> = {
  cybersecurity: "Security",
  software: "SWE",
  data: "Data",
  product: "Product",
  business: "Business",
  other: "General",
};

export default async function ResumesPage() {
  const user = await requireUser();
  const [library, snapshot] = await Promise.all([getResumeLibrary(user.id), getSnapshot(user.id)]);
  const now = new Date();

  const summary = computeResumeStats(snapshot.applications, library);
  const best = findBestVersion(library, summary);
  const nextVersion = (library[0]?.version ?? 0) + 1;
  const track = TRACK_SHORT[user.track] ?? TRACKS.find((t) => t.key === user.track)?.label ?? "General";
  const suggestedLabel = `${track} — ${monthName(now, user.timeZone)}`;

  const upload = <UploadCard userId={user.id} suggestedLabel={suggestedLabel} nextVersion={nextVersion} hasVersions={library.length > 0} />;

  if (library.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Resume workshop" title="Resume versions" description="Save every version you send, then see which one actually gets replies." />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <Card>
            <EmptyState
              art={<Mascot name="nib" mood="happy" className="size-32 animate-float" title="Nib the beaver holding a blank plant marker" />}
              title="Give your next application a paper trail."
            >
              <p>
                Upload a PDF (or paste the text) and name it something Future You will understand. Link it when you log applications and Nib will
                tell you which version gets the most replies.
              </p>
              <p className="mt-3 text-sm italic text-muted">“{MASCOTS.nib.lines[0]}” — Nib</p>
            </EmptyState>
          </Card>
          {upload}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Resume workshop"
        title="Resume versions"
        description={`${library.length} version${library.length === 1 ? "" : "s"} on file. Every one you send gets a score, so you can keep what works.`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="lg:sticky lg:top-6 lg:order-last">{upload}</aside>
        <div className="flex min-w-0 flex-col gap-6">
          <PerformanceCard versions={library} summary={summary} best={best} />
          <section aria-labelledby="versions-heading" className="flex flex-col gap-4">
            <h2 id="versions-heading" className="text-xl font-semibold">
              Version history
            </h2>
            <VersionTimeline
              items={library}
              stats={summary.byResume}
              leaderId={best.kind === "winner" ? best.id : null}
              timeZone={user.timeZone}
              now={now}
            />
          </section>
        </div>
      </div>
    </>
  );
}
