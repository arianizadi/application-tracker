// @ts-expect-error -- bun:test types aren't installed in this repo.
import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

// Keep builtin-module mocks in isolated processes so the ordinary PDF tests
// still exercise real workers and pdf.js, regardless of test discovery order.
for (const failure of ["constructor", "boot"] as const) {
  test(`PDF extraction fails closed after worker ${failure} failure`, () => {
    const result = spawnSync(process.execPath, ["--eval", `
      import { mock } from "bun:test";
      import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
      import { tmpdir } from "node:os";
      import { join } from "node:path";
      import { pathToFileURL } from "node:url";
      mock.module("server-only", () => ({}));
      let unsafeParses = 0;
      mock.module("unpdf", () => ({ getResolvedPDFJS() {
        unsafeParses++;
        throw new Error("Main-thread PDF parsing must never run");
      }}));
      const folder = mkdtempSync(join(tmpdir(), "canopy-worker-failure-"));
      const fixture = join(folder, "broken-worker.js");
      writeFileSync(fixture, 'throw new Error("Test worker failed to boot");');
      const OriginalURL = globalThis.URL;
      let attempts = 0;
      globalThis.URL = class extends OriginalURL {
        constructor(input, base) {
          if (input === "./pdf-worker.ts") {
            attempts++;
            input = ${JSON.stringify(failure)} === "constructor"
              ? "https://worker.invalid/pdf-worker.js"
              : pathToFileURL(fixture).href;
          }
          super(input, base);
        }
      };
      console.error = () => {};
      const { extractPdfText, PdfReadError } = await import("./src/lib/resumes/pdf");
      for (let i = 0; i < 2; i++) {
        try {
          await extractPdfText(new TextEncoder().encode("%PDF-1.4\\n"), 60000);
          throw new Error("Extraction unexpectedly succeeded");
        } catch (error) {
          if (!(error instanceof PdfReadError) || error.reason !== "unavailable") throw error;
        }
      }
      if (unsafeParses !== 0 || attempts !== 2) {
        throw new Error("Isolation fallback or retry invariant failed");
      }
      rmSync(folder, { recursive: true, force: true });
      console.log("isolated worker failure handled");
    `], { cwd: process.cwd(), encoding: "utf8", timeout: 10_000 });
    expect(result.error).toBeUndefined();
    if (result.status !== 0) throw new Error(result.stderr);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("isolated worker failure handled");
  });
}
