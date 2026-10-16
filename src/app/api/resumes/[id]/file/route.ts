import type { NextRequest } from "next/server";

import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isObjectId, safePdfFileName } from "@/lib/resumes/text";

const NO_STORE = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } as const;

function notFound() {
  return new Response("Not found", { status: 404, headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" } });
}

/**
 * GET /api/resumes/:id/file — streams the original PDF to its owner.
 * Attachment by default; `?inline=1` for in-browser preview.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/resumes/[id]/file">) {
  const { id } = await ctx.params;
  if (!isObjectId(id)) return notFound();

  const session = await readSession();
  if (!session) {
    return new Response("Sign in to download this file.", { status: 401, headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" } });
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { version: true, label: true, fileName: true, file: { select: { data: true } } },
  });
  if (!resume?.file) return notFound();

  const bytes = resume.file.data;
  const name = safePdfFileName(resume.fileName, `${resume.label}-v${resume.version}`);
  const inline = request.nextUrl.searchParams.get("inline") === "1";

  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      ...NO_STORE,
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
