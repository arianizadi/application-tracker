/**
 * Interview prep course content types. Content lives in src/content/prep/.
 * Inline text in strings supports a tiny safe markdown subset rendered by the app:
 * **bold**, *italic*, `code`, and [label](https://url). No raw HTML.
 */

export type TrackCode = "ALL" | "SOC" | "ENG" | "OFF" | "APP" | "CLOUD" | "GRC" | "DFIR" | "CTI" | "DET" | "IAM";

export type ResourceType =
  | "course" | "lab" | "book" | "video" | "cheatsheet" | "cert" | "community"
  | "ctf" | "newsletter" | "podcast" | "tool" | "reference" | "program" | "guide";

export type Resource = {
  /** "r01".."r87" matching the R-number in the research doc. */
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  cost: "free" | "freemium" | "paid";
  /** e.g. "Exam ~$404 (verify current price)" */
  costNote?: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "beginner–intermediate" | "intermediate–advanced" | "all levels";
  /** Human estimate, e.g. "3–6 hours". */
  time: string;
  tracks: TrackCode[];
  /** Section of the library, e.g. "Networking, operating systems, and scripting". */
  category: string;
  why: string;
  tags: string[];
  /** Caveats such as "price unverified" or "applications not currently open". */
  note?: string;
};

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "tip" | "interview" | "warning" | "example"; title?: string; text: string }
  | { type: "code"; lang?: string; code: string; caption?: string }
  | { type: "diagram"; caption: string; lines: string[] };

export type PracticeQuestion = {
  /** "<moduleId>-q1" ... */
  id: string;
  question: string;
  answer: string;
  /** What the interviewer is really checking. */
  checking: string;
  difficulty?: "warmup" | "core" | "stretch";
};

export type ExternalLink = { title: string; url: string };

export type Module = {
  id: string;
  number: number;
  title: string;
  hook: string;
  hours: number;
  tracks: TrackCode[];
  objectives: string[];
  lesson: Block[];
  /** One-paragraph "how to say it in an interview" summary. */
  sayItLikeThis: string;
  terms: { term: string; definition: string }[];
  questions: PracticeQuestion[];
  lab: { title: string; steps: string[]; resourceIds: string[]; links: ExternalLink[] };
  resourceIds: string[];
  /** Linked URLs that are not in the resource library. */
  extraLinks: ExternalLink[];
};

export type Flashcard = {
  /** "fc01".."fc50" */
  id: string;
  front: string;
  back: string;
  tags: string[];
  moduleId?: string;
};
