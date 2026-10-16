// Run with: bun test src/lib/analyzer/engine.test.ts
// @ts-expect-error -- bun:test types (@types/bun) aren't installed in this repo; remove this line once they are.
import { describe, expect, test } from "bun:test";

import { analyze, normalizeText } from "./engine";

const JD = `Security Engineering Intern
Requirements:
- Splunk and centralized logging
- Python, Java and Kubernetes experience`;

function jd(resumeText: string) {
  const result = analyze({ mode: "jd", resumeText, jobDescription: JD });
  return {
    found: new Set(result.found.map((f) => f.term)),
    flagged: new Set(result.flagged.map((f) => f.term)),
    suggestions: result.suggestions,
  };
}

describe("normalizeText", () => {
  test("repairs PDF line-break hyphenation", () => {
    expect(normalizeText("exam-\n ple")).toBe("example");
    expect(normalizeText("Built a de-\ntection pipeline")).toBe("Built a detection pipeline");
  });

  test("keeps real hyphens and short fragments", () => {
    expect(normalizeText("ci-cd")).toBe("ci-cd");
    expect(normalizeText("a-\nb")).toBe("a-\nb");
  });

  test("stays linear on one long token", () => {
    const started = performance.now();
    normalizeText("a".repeat(60_000));
    expect(performance.now() - started).toBeLessThan(100);
  });
});

describe("negation", () => {
  test("still flags first-person negations", () => {
    expect(jd("No experience with Java.").flagged.has("Java")).toBe(true);
    expect(jd("I have never used Kubernetes.").flagged.has("Kubernetes")).toBe(true);
  });

  test("doesn't flag achievements that mention a lack or someone else's inexperience", () => {
    const fixed = jd("Addressed lack of centralized logging by deploying Splunk.");
    expect(fixed.found.has("Logging")).toBe(true);
    expect(fixed.found.has("Splunk")).toBe(true);
    expect(fixed.flagged.size).toBe(0);

    const mentored = jd("Mentored students with no prior experience in Python.");
    expect(mentored.found.has("Python")).toBe(true);
    expect(mentored.flagged.size).toBe(0);
  });
});

describe("short-text advice", () => {
  test("only blames PDF extraction for PDF resumes", () => {
    const resumeText = "Built Python scripts and Splunk dashboards in a home lab.";
    const pasted = analyze({ mode: "jd", resumeText, jobDescription: JD }).suggestions.join(" ");
    const pdf = analyze({ mode: "jd", resumeText, jobDescription: JD, fromPdf: true }).suggestions.join(" ");
    expect(pasted).not.toContain("PDF");
    expect(pasted).toContain("Paste the full resume");
    expect(pdf).toContain("the PDF may not have extracted cleanly");
  });
});
