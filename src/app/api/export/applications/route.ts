import { connection } from "next/server";

import { dateKeyInZone, dateToKey } from "@/lib/applications/dates";
import { WORK_MODE_LABEL } from "@/lib/applications/schema";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { STATUS_META } from "@/lib/status";

/**
 * GET /api/export/applications — the signed-in user's applications as a
 * spreadsheet-safe CSV. Cells that a spreadsheet would treat as a formula are
 * prefixed with an apostrophe; every cell is quoted.
 */

const HEADERS = [
  "Company", "Role", "Status", "Applied", "Location", "Work mode", "Source", "Link", "Pay",
  "Excitement (1-5)", "Contact", "Deadline", "Follow up", "Resume version", "Notes",
  "Status history", "Created", "Updated",
];

const BATCH = 250;

function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  // Formula-injection guard (CSV injection): =, +, -, @, tab and CR start formulas in Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function row(values: unknown[]): string {
  return `${values.map(csvCell).join(",")}\r\n`;
}

export async function GET() {
  await connection();
  const session = await readSession();
  if (!session) {
    return new Response("Sign in to export your applications.", {
      status: 401,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const { id: userId, timeZone } = session.user;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // BOM so Excel opens UTF-8 correctly.
        controller.enqueue(encoder.encode(`﻿${row(HEADERS)}`));
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.application.findMany({
            where: { userId },
            orderBy: { id: "asc" },
            take: BATCH,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            select: {
              id: true, company: true, role: true, status: true, appliedAt: true, location: true, workMode: true,
              source: true, url: true, salary: true, excitement: true, contactName: true, deadline: true,
              followUpAt: true, notes: true, history: true, createdAt: true, updatedAt: true,
              resume: { select: { label: true, version: true } },
            },
          });
          let chunk = "";
          for (const a of batch) {
            chunk += row([
              a.company,
              a.role,
              STATUS_META[a.status].label,
              dateToKey(a.appliedAt),
              a.location,
              a.workMode ? WORK_MODE_LABEL[a.workMode] : "",
              a.source,
              a.url,
              a.salary,
              a.excitement,
              a.contactName,
              dateToKey(a.deadline),
              dateToKey(a.followUpAt),
              a.resume ? `v${a.resume.version} — ${a.resume.label}` : "",
              a.notes,
              a.history.map((h) => `${STATUS_META[h.status].label} ${dateKeyInZone(h.at, timeZone)}`).join(" → "),
              dateKeyInZone(a.createdAt, timeZone),
              dateKeyInZone(a.updatedAt, timeZone),
            ]);
          }
          if (chunk) controller.enqueue(encoder.encode(chunk));
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1].id;
        }
        controller.close();
      } catch (error) {
        console.error("CSV export failed", error);
        controller.error(error);
      }
    },
  });

  const day = dateKeyInZone(new Date(), timeZone);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="canopy-applications-${day}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
