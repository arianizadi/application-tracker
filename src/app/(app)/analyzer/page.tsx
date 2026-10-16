import type { Metadata } from "next";

import { AnalysisHistory } from "@/components/analyzer/analysis-history";
import { AnalyzerWorkbench } from "@/components/analyzer/analyzer-workbench";
import { PageHeader } from "@/components/ui/card";
import { defaultPresetFor, PRESETS, presetGroups } from "@/lib/analyzer/presets";
import { requireUser } from "@/lib/auth/dal";
import { getSnapshot } from "@/lib/data/snapshot";
import { DEFAULT_TRACK, isTrack } from "@/lib/tracks";

export const metadata: Metadata = {
  title: "Resume analyzer",
  description: "Check how much of a role's recognized keywords appear in your resume.",
};

export default async function AnalyzerPage({ searchParams }: PageProps<"/analyzer">) {
  const user = await requireUser();
  const [params, snapshot] = await Promise.all([searchParams, getSnapshot(user.id)]);

  const track = isTrack(user.track) ? user.track : DEFAULT_TRACK;
  const resumes = [...snapshot.resumes].sort((a, b) => b.version - a.version);
  const requested = typeof params.resume === "string" ? params.resume : null;
  const initialResumeId =
    resumes.find((r) => r.id === requested)?.id ?? resumes.find((r) => r.isDefault)?.id ?? resumes[0]?.id ?? null;

  const presetLabels: Record<string, string> = Object.fromEntries(PRESETS.map((p) => [p.key, p.label]));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Analyzer"
        title="Keyword match"
        description="How much of the recognized language in a target appears in your resume. Rue checks wording and shows the evidence. It's not a hiring verdict."
      />
      <AnalyzerWorkbench
        resumes={resumes.map((r) => ({ id: r.id, label: r.label, version: r.version, isDefault: r.isDefault }))}
        initialResumeId={initialResumeId}
        groups={presetGroups(track)}
        defaultPreset={defaultPresetFor(track)}
      />
      <AnalysisHistory
        analyses={snapshot.analyses}
        resumes={resumes.map((r) => ({ id: r.id, label: r.label, version: r.version }))}
        presetLabels={presetLabels}
        timeZone={user.timeZone}
      />
    </div>
  );
}
