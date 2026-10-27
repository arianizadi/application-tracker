import "server-only";

import { Worker } from "node:worker_threads";

import { PdfReadError, type PdfExtraction } from "@/lib/resumes/pdf-extract";
import type { PdfWorkerRequest, PdfWorkerResponse } from "@/lib/resumes/pdf-worker";

export { MAX_PDF_PAGES, PdfReadError } from "@/lib/resumes/pdf-extract";

/** Wall-clock budget for one PDF, including worker start-up. */
const EXTRACT_TIMEOUT_MS = 10_000;
/** Heap cap for the extraction worker; pdf.js text extraction of a real resume needs a fraction of this. */
const WORKER_HEAP_MB = 192;
/** Extractions running at once per server instance; the rest wait in line. */
const MAX_CONCURRENT = 2;
const MAX_WAITING = 8;

export const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);

/** True when the bytes start with the PDF signature "%PDF-". */
export function hasPdfMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

const timeoutError = () => new PdfReadError("timeout", "Reading the PDF took too long.");
const tooComplexError = () => new PdfReadError("unreadable", "That PDF is too complex for us to read. Try exporting it again, or paste the text instead.");

let active = 0;
const waiting: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  if (waiting.length >= MAX_WAITING) {
    throw new PdfReadError("busy", "We're reading a lot of PDFs right now. Give it a minute and try again.");
  }
  // release() hands its slot straight to the next waiter, so `active` stays put.
  await new Promise<void>((resolve) => waiting.push(resolve));
}

function releaseSlot() {
  const next = waiting.shift();
  if (next) next();
  else active--;
}

const WORKER_UNAVAILABLE = Symbol("worker-unavailable");

/**
 * Runs extraction in a worker thread with a capped heap and terminates it on
 * timeout, which also stops synchronous parse/inflate work. Resolves
 * WORKER_UNAVAILABLE when the worker itself can't start.
 */
function extractInWorker(bytes: Uint8Array, maxChars: number): Promise<PdfExtraction | typeof WORKER_UNAVAILABLE> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./pdf-worker.ts", import.meta.url), {
        resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB, maxYoungGenerationSizeMb: 32 },
      });
    } catch (error) {
      console.error("PDF worker failed to start", error);
      resolve(WORKER_UNAVAILABLE);
      return;
    }

    let booted = false;
    let settled = false;
    const finish = (settle: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      settle();
    };
    const crashed = (error?: unknown) => {
      if (booted) return finish(() => reject(tooComplexError()));
      console.error("PDF worker failed to boot", error);
      finish(() => resolve(WORKER_UNAVAILABLE));
    };
    const timer = setTimeout(() => finish(() => reject(timeoutError())), EXTRACT_TIMEOUT_MS);

    worker.on("message", (message: PdfWorkerResponse) => {
      if (message.type === "ready") booted = true;
      else if (message.type === "done") finish(() => resolve(message.result));
      else finish(() => reject(new PdfReadError(message.reason, message.message)));
    });
    // Out-of-memory (ERR_WORKER_OUT_OF_MEMORY) and uncaught errors land here.
    worker.on("error", crashed);
    worker.on("exit", () => crashed());

    // The copy's buffer is ours alone, so hand it over instead of cloning it.
    const request: PdfWorkerRequest = { bytes, maxChars };
    worker.postMessage(request, [bytes.buffer as ArrayBuffer]);
  });
}

/**
 * Extracts plain text from a PDF's text layer. Scanned PDFs (images only) return
 * little or no text; callers decide how to warn about that.
 */
export async function extractPdfText(bytes: Uint8Array, maxChars: number): Promise<PdfExtraction> {
  // pdf.js (and the worker hand-off) detach the buffer they are given, so use a copy.
  const copy = new Uint8Array(bytes);

  await acquireSlot();
  try {
    const result = await extractInWorker(copy, maxChars);
    if (result === WORKER_UNAVAILABLE) {
      // A timer cannot interrupt synchronous pdf.js parsing on this thread.
      // Keep the heap/time isolation boundary even if a deployment is missing
      // its worker chunk. Retry worker startup on the next upload so a transient
      // failure does not permanently disable PDF uploads for this process.
      throw new PdfReadError("unavailable", "PDF reading is temporarily unavailable. Try again, or paste your resume text instead.");
    }
    return result;
  } finally {
    releaseSlot();
  }
}
