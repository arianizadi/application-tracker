"use client";

import { ErrorView } from "@/components/marketing/error-view";

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main" className="grain">
      <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Back to the homepage" />
    </main>
  );
}
