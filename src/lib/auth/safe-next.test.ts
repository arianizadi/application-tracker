// Run with: bun test src/lib/auth/safe-next.test.ts
// @ts-expect-error -- bun:test types (@types/bun) aren't installed in this repo; remove this line once they are.
import { describe, expect, test } from "bun:test";

import { safeNext } from "@/lib/auth/safe-next";

describe("safeNext", () => {
  test("keeps same-origin paths with query and hash", () => {
    expect(safeNext("/applications")).toBe("/applications");
    expect(safeNext("/applications/abc?view=list#notes")).toBe("/applications/abc?view=list#notes");
  });

  test("falls back for missing or non-string values", () => {
    expect(safeNext(null)).toBe("/home");
    expect(safeNext(undefined)).toBe("/home");
    expect(safeNext("")).toBe("/home");
  });

  test.each([
    "https://evil.com",
    "evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r/evil.com",
    "/\u0000/evil.com",
    "/\u007F/evil.com",
    "\t//evil.com",
    "javascript:alert(1)",
  ])("rejects %j", (value: string) => {
    const result = safeNext(value);
    expect(result).toBe("/home");
    expect(new URL(result, "https://canopy.app").origin).toBe("https://canopy.app");
  });

  test("never yields a protocol-relative path", () => {
    expect(safeNext("/.//evil.com").startsWith("//")).toBe(false);
    expect(new URL(safeNext("/.//evil.com"), "https://canopy.app").origin).toBe("https://canopy.app");
  });
});
