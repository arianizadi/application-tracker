/**
 * Worker-thread entry for PDF text extraction. pdf.js parses and inflates streams
 * synchronously, so the only way to bound a hostile PDF is to run it here, where
 * the parent can cap the heap and terminate() the thread on timeout.
 *
 * Protocol: posts { type: "ready" } once pdf.js is loaded, then handles exactly
 * one PdfWorkerRequest and replies with a PdfWorkerResponse.
 */
import { parentPort } from "node:worker_threads";

import { getResolvedPDFJS } from "unpdf";

import { extractPdfTextDirect, PdfReadError, type PdfExtraction, type PdfReadReason } from "@/lib/resumes/pdf-extract";

export type PdfWorkerRequest = { bytes: Uint8Array; maxChars: number };
export type PdfWorkerResponse =
  | { type: "ready" }
  | { type: "done"; result: PdfExtraction }
  | { type: "failed"; reason: PdfReadReason; message: string };

const port = parentPort;
if (port) {
  const post = (message: PdfWorkerResponse) => port.postMessage(message);

  // Load pdf.js before announcing readiness, so a broken deployment (missing
  // module) surfaces as a boot failure rather than as an "unreadable" PDF.
  void getResolvedPDFJS().then(() => {
    port.once("message", async ({ bytes, maxChars }: PdfWorkerRequest) => {
      try {
        post({ type: "done", result: await extractPdfTextDirect(bytes, maxChars) });
      } catch (error) {
        const failure = error instanceof PdfReadError ? error : new PdfReadError("unreadable", "We couldn't read the text in that PDF.");
        post({ type: "failed", reason: failure.reason, message: failure.message });
      }
    });
    post({ type: "ready" });
  });
}
