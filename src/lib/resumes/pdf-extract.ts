/**
 * The pdf.js side of resume text extraction. Kept free of "server-only" so it can
 * run inside the extraction worker (src/lib/resumes/pdf-worker.ts) as well as
 * in-process. Callers should go through `extractPdfText` in ./pdf.ts.
 */
import { getResolvedPDFJS } from "unpdf";

import { normalizeResumeText } from "@/lib/resumes/text";

/** Resumes longer than this are almost certainly the wrong file. */
export const MAX_PDF_PAGES = 30;

export type PdfReadReason = "unreadable" | "too-many-pages" | "timeout" | "busy";

export class PdfReadError extends Error {
  constructor(
    public reason: PdfReadReason,
    message: string,
  ) {
    super(message);
    this.name = "PdfReadError";
  }
}

export type PdfExtraction = { text: string; pages: number; truncated: boolean };

/**
 * Reads the text layer page by page and stops as soon as `maxChars` are collected,
 * so later pages are never parsed or inflated. Aborting `signal` destroys the
 * pdf.js document, which makes any pending pdf.js work reject instead of running on.
 */
export async function extractPdfTextDirect(bytes: Uint8Array, maxChars: number, signal?: AbortSignal): Promise<PdfExtraction> {
  const throwIfAborted = () => {
    if (signal?.aborted) throw new PdfReadError("timeout", "Reading the PDF took too long.");
  };
  throwIfAborted();
  const { getDocument } = await getResolvedPDFJS();
  const task = getDocument({ data: bytes, useSystemFonts: true });
  const destroy = () => task.destroy().catch(() => {});
  signal?.addEventListener("abort", destroy, { once: true });

  try {
    let pdf: Awaited<typeof task.promise>;
    try {
      pdf = await task.promise;
    } catch {
      throw new PdfReadError("unreadable", "That PDF couldn't be opened. It may be password-protected or damaged.");
    }
    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new PdfReadError("too-many-pages", `That PDF has ${pdf.numPages} pages. Resumes here max out at ${MAX_PDF_PAGES}.`);
    }

    const pages: string[] = [];
    let length = 0;
    for (let n = 1; n <= pdf.numPages && length < maxChars; n++) {
      throwIfAborted();
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const text = content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : "")).join("");
      page.cleanup();
      pages.push(text);
      length += text.length;
    }
    return { ...normalizeResumeText(pages.join("\n"), maxChars), pages: pdf.numPages };
  } catch (error) {
    if (error instanceof PdfReadError) throw error;
    throw new PdfReadError("unreadable", "We couldn't read the text in that PDF.");
  } finally {
    signal?.removeEventListener("abort", destroy);
    await destroy();
  }
}
