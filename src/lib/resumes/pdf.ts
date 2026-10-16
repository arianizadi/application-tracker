import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

import { normalizeResumeText } from "@/lib/resumes/text";

/** Resumes longer than this are almost certainly the wrong file. */
export const MAX_PDF_PAGES = 30;
const EXTRACT_TIMEOUT_MS = 20_000;

export const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);

/** True when the bytes start with the PDF signature "%PDF-". */
export function hasPdfMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

export class PdfReadError extends Error {
  constructor(
    public reason: "unreadable" | "too-many-pages" | "timeout",
    message: string,
  ) {
    super(message);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PdfReadError("timeout", "Reading the PDF took too long.")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Extracts plain text from a PDF's text layer. Scanned PDFs (images only) return
 * little or no text; callers decide how to warn about that.
 */
export async function extractPdfText(bytes: Uint8Array, maxChars: number): Promise<{ text: string; pages: number; truncated: boolean }> {
  // pdf.js may transfer (detach) the buffer it is given, so hand it a copy.
  const copy = new Uint8Array(bytes);

  const run = async () => {
    let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;
    try {
      pdf = await getDocumentProxy(copy);
    } catch {
      throw new PdfReadError("unreadable", "That PDF couldn't be opened. It may be password-protected or damaged.");
    }
    try {
      if (pdf.numPages > MAX_PDF_PAGES) {
        throw new PdfReadError("too-many-pages", `That PDF has ${pdf.numPages} pages. Resumes here max out at ${MAX_PDF_PAGES}.`);
      }
      const { text, totalPages } = await extractText(pdf, { mergePages: true });
      const merged = Array.isArray(text) ? text.join("\n\n") : text;
      return { ...normalizeResumeText(merged, maxChars), pages: totalPages };
    } catch (error) {
      if (error instanceof PdfReadError) throw error;
      throw new PdfReadError("unreadable", "We couldn't read the text in that PDF.");
    } finally {
      await pdf.loadingTask.destroy().catch(() => {});
    }
  };

  return withTimeout(run(), EXTRACT_TIMEOUT_MS);
}
