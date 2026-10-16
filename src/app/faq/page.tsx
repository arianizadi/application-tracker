import type { Metadata } from "next";

import { FaqBrowser } from "@/components/marketing/faq-browser";
import { FAQ_COUNT, FAQ_GROUPS } from "@/components/marketing/faq-data";
import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";
import { Mascot } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Canopy (the forest, XP, resumes, the analyzer, privacy) plus practical internship search tips for cybersecurity students: when to apply, referrals, home labs, Security+ and clearances.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a.replace(/\n+/g, " ").replace(/• /g, "") },
    })),
  ),
};

export default function FaqPage() {
  return (
    <>
      <PublicHeader current="faq" />
      <main id="main" className="grain">
        <script
          type="application/ld+json"
          // Static, author-controlled content; "<" is escaped so it can never close the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
          <header className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Help & FAQ</p>
              <h1 className="mt-3 text-5xl font-semibold leading-[1] sm:text-6xl" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
                Questions, <span className="italic text-moss">answered.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
                {FAQ_COUNT} answers about how Canopy works, how your data is handled, and how to make the internship hunt a
                little less brutal.
              </p>
            </div>
            <Mascot name="alder" mood="think" className="hidden size-28 shrink-0 sm:block" title="Alder the owl, thinking" />
          </header>

          <div className="mt-10">
            <FaqBrowser groups={FAQ_GROUPS} />
          </div>

          <aside className="mt-16 flex flex-col items-start gap-5 rounded-3xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:p-8">
            <Mascot name="fern" mood="happy" className="size-20 shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Ready to plant something?</h2>
              <p className="mt-1 text-ink-soft">It takes about a minute to start, and your first tree takes ten seconds.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <ButtonLink href="/signup">Get started</ButtonLink>
              <ButtonLink href="/home" variant="ghost" prefetch={false}>
                Open Canopy
              </ButtonLink>
            </div>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
