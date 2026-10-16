import type { ComponentProps, ReactNode } from "react";

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`rounded-3xl border border-line bg-card shadow-soft ${className}`} {...props} />;
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold leading-[1.1] sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}

/** Loading placeholder: shows after 250 ms, then a soft shimmer sweeps across (static under reduced motion). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-2xl ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <Skeleton className="h-10 w-2/3 max-w-sm" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export function EmptyState({ art, title, children, action }: { art?: ReactNode; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {art ? <div className="mb-5">{art}</div> : null}
      <h3 className="text-xl font-semibold">{title}</h3>
      {children ? <div className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">{children}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
