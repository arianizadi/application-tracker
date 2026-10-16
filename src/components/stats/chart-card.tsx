import type { ReactNode } from "react";

import { Card, CardHeader } from "@/components/ui/card";

export type TableSpec = {
  caption: string;
  head: string[];
  rows: (string | number)[][];
};

/** The table-view twin every chart ships with, tucked into a <details>. */
export function DataTable({ caption, head, rows }: TableSpec) {
  return (
    <details className="group mt-4 rounded-2xl border border-line bg-paper/60 text-sm">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 font-medium text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
        <span>Show the numbers</span>
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </summary>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full min-w-[16rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              {head.map((h, i) => (
                <th key={h} scope="col" className={`py-2 pr-3 font-medium ${i > 0 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular">
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-line/60 last:border-0">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="py-2 pr-3 font-normal text-ink-soft">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="py-2 pr-3 text-right text-ink">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function ChartCard({
  id,
  title,
  description,
  action,
  table,
  children,
  className = "",
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  table?: TableSpec;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`flex flex-col ${className}`}>
      <CardHeader title={<span id={id ? `${id}-title` : undefined}>{title}</span>} description={description} action={action} />
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {children}
        {table ? <DataTable {...table} /> : null}
      </div>
    </Card>
  );
}

/** Small "not enough data yet" badge. */
export function EarlyBadge({ children = "Early data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-muted">
      <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M6 10.5V5.5" />
        <path d="M6 7c0-2 1.2-3.2 3.5-3.5C9.3 5.6 8 7 6 7Z" />
        <path d="M6 6.2C6 4.6 5 3.6 3 3.4c.2 1.7 1.2 2.8 3 2.8Z" />
      </svg>
      {children}
    </span>
  );
}
