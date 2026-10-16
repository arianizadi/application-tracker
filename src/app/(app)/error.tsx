"use client";

import { ErrorView } from "@/components/marketing/error-view";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/home" homeLabel="Back to the clearing" compact />;
}
