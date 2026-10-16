import type { Metadata } from "next";
import Link from "next/link";

import { Mascot } from "@/components/mascots";
import { ThemeToggle } from "@/components/theme";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { isValidTimeZone } from "@/lib/settings/validation";
import { DEFAULT_TRACK, isTrack } from "@/lib/tracks";

import { CelebrationControl } from "./celebration-control";
import { DeleteAccountForm, SignOutEverywhereForm } from "./danger-zone";
import { PasswordForm } from "./password-form";
import { ProfileForm, type TimeZoneGroup } from "./profile-form";

export const metadata: Metadata = { title: "Settings" };

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
  { id: "data", label: "Your data" },
  { id: "danger", label: "Danger zone" },
] as const;

function offsetLabel(timeZone: string, now: Date): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value;
    return (part ?? "GMT").replace("-", "−");
  } catch {
    return "GMT";
  }
}

/** IANA zones grouped by region, each with its current UTC offset. */
function timeZoneGroups(current: string, now: Date): TimeZoneGroup[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [];
  }
  const all = new Set(zones);
  all.add("UTC");
  if (isValidTimeZone(current)) all.add(current);

  const groups = new Map<string, TimeZoneGroup["zones"]>();
  for (const tz of [...all].sort()) {
    const region = tz.includes("/") ? tz.split("/")[0] : "Other";
    const list = groups.get(region) ?? [];
    list.push({ value: tz, offset: offsetLabel(tz, now) });
    groups.set(region, list);
  }
  return [...groups.entries()].map(([region, list]) => ({ region, zones: list }));
}

function SectionCard({ id, title, description, children, tone }: {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <Card id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 ${tone === "danger" ? "border-coral/40" : ""}`}>
      <CardHeader title={<span id={`${id}-title`}>{title}</span>} description={description} />
      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const now = new Date();
  const timeZone = isValidTimeZone(user.timeZone) ? user.timeZone : "UTC";
  const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone }).format(user.createdAt);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Make it yours"
        description="Your name, your rhythm, your time zone. Small tweaks, cozier forest."
        action={<Mascot name="moss" mood="idle" className="hidden size-20 sm:block" />}
      />

      <nav aria-label="Settings sections" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm text-ink-soft transition-colors hover:border-moss/40 hover:text-ink"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <SectionCard
          id="profile"
          title="Profile & rhythm"
          description={
            <>
              Signed in as <span className="font-medium text-ink-soft">{user.email}</span> · growing since {memberSince}
            </>
          }
        >
          <ProfileForm
            initial={{
              name: user.name,
              track: isTrack(user.track) ? user.track : DEFAULT_TRACK,
              weeklyGoal: user.weeklyGoal,
              timeZone,
            }}
            timeZones={timeZoneGroups(timeZone, now)}
          />
        </SectionCard>

        <SectionCard id="appearance" title="Appearance" description="Day, night, or follow your device. Dial the confetti up or down.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ThemeToggle className="self-start [&>button]:min-h-10 [&>button]:px-4 [&>button]:text-sm" />
            <p className="text-sm text-muted">Animations automatically calm down when your device asks for reduced motion.</p>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <CelebrationControl />
          </div>
        </SectionCard>

        <SectionCard id="security" title="Password & sessions" description="Changing your password signs out your other devices.">
          <PasswordForm />
          <div className="mt-6 border-t border-line pt-6">
            <SignOutEverywhereForm />
          </div>
        </SectionCard>

        <SectionCard id="data" title="Your data" description="It's yours. Take it with you whenever you like.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Everything, as JSON</p>
                <p className="text-sm text-muted">Profile, applications, resume versions and text, analyses, achievements, prep progress.</p>
              </div>
              <a href="/api/export/all" download className={buttonClass({ variant: "secondary", className: "w-full shrink-0 sm:w-auto" })}>
                Export my data
              </a>
            </div>
            <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Applications, as a spreadsheet</p>
                <p className="text-sm text-muted">A CSV that opens cleanly in Excel, Numbers or Google Sheets.</p>
              </div>
              <a href="/api/export/applications" download className={buttonClass({ variant: "ghost", className: "w-full shrink-0 sm:w-auto" })}>
                Download CSV
              </a>
            </div>
            <p className="rounded-2xl bg-paper-2 px-4 py-3 text-sm text-ink-soft">
              Questions about privacy, the forest, or the internship hunt?{" "}
              <Link href="/faq" className="font-medium text-moss underline-offset-4 hover:underline">
                Read the FAQ
              </Link>
              .
            </p>
          </div>
        </SectionCard>

        <SectionCard id="danger" tone="danger" title="Danger zone" description="Big, permanent buttons live here.">
          <DeleteAccountForm />
        </SectionCard>
      </div>
    </div>
  );
}
