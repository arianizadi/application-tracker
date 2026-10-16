// Run with: bun test src/lib/resumes/pdf.test.ts
// @ts-expect-error -- bun:test types (@types/bun) aren't installed in this repo; remove this line once they are.
import { afterAll, describe, expect, mock, spyOn, test } from "bun:test";

// "server-only" throws outside the react-server condition; pdf.ts is fine to load here.
mock.module("server-only", () => ({}));
const { extractPdfText, MAX_PDF_PAGES, PdfReadError } = await import("@/lib/resumes/pdf");
const { extractPdfTextDirect } = await import("@/lib/resumes/pdf-extract");

/** Builds a minimal valid PDF with one Helvetica text line per page. */
function makePdf(pageTexts: string[]): Uint8Array {
  const objects: string[] = [];
  const pageIds = pageTexts.map((_, i) => 4 + i * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pageTexts.forEach((text, i) => {
    const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
    objects[pageIds[i]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[i] + 1} 0 R >>`;
    objects[pageIds[i] + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = body.length;
  body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) body += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(body);
}

const errorSpy = spyOn(console, "error");
afterAll(() => errorSpy.mockRestore());

describe("extractPdfText", () => {
  test("reads the text layer through the worker", async () => {
    const pdf = makePdf(["Jane Doe Security Analyst", "Splunk Wireshark Python"]);
    const result = await extractPdfText(pdf, 60_000);
    expect(result.pages).toBe(2);
    expect(result.truncated).toBe(false);
    expect(result.text).toContain("Jane Doe Security Analyst");
    expect(result.text).toContain("Splunk Wireshark Python");
    // The caller's bytes are not detached by the hand-off.
    expect(pdf.byteLength).toBeGreaterThan(0);
    // No boot failure, so the in-process fallback wasn't used.
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("stops collecting pages once maxChars is reached", async () => {
    const result = await extractPdfText(makePdf(["A".repeat(50), "B".repeat(50), "C".repeat(50)]), 40);
    expect(result.truncated).toBe(true);
    expect(result.text.length).toBeLessThanOrEqual(40);
    expect(result.pages).toBe(3);
  });

  test("rejects documents over the page cap", async () => {
    const pages = Array.from({ length: MAX_PDF_PAGES + 1 }, (_, i) => `Page ${i + 1}`);
    const error = await extractPdfText(makePdf(pages), 60_000).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PdfReadError);
    expect((error as InstanceType<typeof PdfReadError>).reason).toBe("too-many-pages");
  });

  test("rejects garbage behind a PDF signature as unreadable", async () => {
    const error = await extractPdfText(new TextEncoder().encode("%PDF-1.4\nnot really a pdf"), 60_000).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PdfReadError);
    expect((error as InstanceType<typeof PdfReadError>).reason).toBe("unreadable");
  });

  test("handles concurrent uploads", async () => {
    const results = await Promise.all(Array.from({ length: 4 }, (_, i) => extractPdfText(makePdf([`Resume ${i}`]), 60_000)));
    results.forEach((result, i) => expect(result.text).toContain(`Resume ${i}`));
  });
});

describe("extractPdfTextDirect", () => {
  test("stops when its signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const error = await extractPdfTextDirect(makePdf(["Hello"]), 60_000, controller.signal).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PdfReadError);
  });
});
