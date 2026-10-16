import type { ApplicationStatus } from "@prisma/client";

import { STATUS_META } from "@/lib/status";

export function StatusPill({ status, className = "" }: { status: ApplicationStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.pill} ${className}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
