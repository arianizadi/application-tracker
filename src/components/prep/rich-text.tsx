// Safe renderer for course text. Server-compatible (no hooks); the copy button is a small client island.
// Supports only **bold**, *italic*, `code` and [label](https://url). Everything else renders as plain text,
// and nothing is ever injected as HTML.
import type { ReactNode } from "react";

import type { Block } from "@/content/prep/types";

import { CopyButton } from "./copy-button";
import { PrepIcon, type PrepIconName } from "./icons";

const TOKEN_SOURCE =
  "`([^`\\n]+)`" + // 1: code
  "|\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*" + // 2: bold
  "|\\*(?=[^\\s*])([^*\\n]*?[^\\s*])\\*" + // 3: italic
  "|\\[([^\\]\\n]+)\\]\\(([^()\\s]+(?:\\([^()\\s]*\\)[^()\\s]*)*)\\)"; // 4: label, 5: url

const MAX_DEPTH = 4;

/** Only absolute http(s) URLs become links. */
export function safeHref(raw: string): string | null {
  if (!/^https?:\/\//i.test(raw)) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

type InlineOptions = { links: boolean };

function parseInline(text: string, opts: InlineOptions, depth: number, keyPrefix: string): ReactNode[] {
  if (depth > MAX_DEPTH || !text) return [text];
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(new RegExp(TOKEN_SOURCE, "g"))) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}${n++}`;
    const [, code, bold, italic, label, url] = m;
    if (code !== undefined) {
      out.push(
        <code
          key={key}
          className="rounded-md border border-line bg-paper-2 px-1.5 py-px font-mono text-[0.86em] text-ink [overflow-wrap:anywhere]"
        >
          {code}
        </code>,
      );
    } else if (bold !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {parseInline(bold, opts, depth + 1, `${key}.`)}
        </strong>,
      );
    } else if (italic !== undefined) {
      out.push(<em key={key}>{parseInline(italic, opts, depth + 1, `${key}.`)}</em>);
    } else if (label !== undefined && url !== undefined) {
      const href = safeHref(url);
      const children = parseInline(label, { links: false }, depth + 1, `${key}.`);
      if (href && opts.links) {
        out.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-moss underline decoration-moss/35 decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-moss [overflow-wrap:anywhere]"
          >
            {children}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>,
        );
      } else {
        out.push(<span key={key}>{children}</span>);
      }
    }
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Inline markdown subset → React nodes. Pass `links={false}` inside buttons or other links. */
export function RichText({ text, links = true }: { text: string; links?: boolean }) {
  return <>{parseInline(text, { links }, 0, "t")}</>;
}

/** Strips the inline markup (for aria-labels, titles, search). */
export function plainText(text: string): string {
  return text.replace(new RegExp(TOKEN_SOURCE, "g"), (_all, code?: string, bold?: string, italic?: string, label?: string) =>
    code ?? plainText(bold ?? italic ?? label ?? ""),
  );
}

/* ── Headings / table of contents ─────────────────────────────────────────── */

function slug(text: string): string {
  return (
    plainText(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

export type LessonHeading = { id: string; text: string };

/** Stable, unique ids for the lesson's `h` blocks (same order <Blocks> uses). */
export function lessonHeadings(blocks: readonly Block[]): LessonHeading[] {
  const seen = new Map<string, number>();
  const out: LessonHeading[] = [];
  for (const b of blocks) {
    if (b.type !== "h") continue;
    const base = `s-${slug(b.text)}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    out.push({ id: count === 1 ? base : `${base}-${count}`, text: b.text });
  }
  return out;
}

/* ── Blocks ───────────────────────────────────────────────────────────────── */

type Tone = Extract<Block, { type: "callout" }>["tone"];

const CALLOUT: Record<Tone, { icon: PrepIconName; label: string; box: string; accent: string }> = {
  tip: { icon: "bulb", label: "Tip", box: "border-moss/25 bg-moss-soft/70", accent: "text-moss" },
  interview: { icon: "chat", label: "In the interview", box: "border-berry/25 bg-berry-soft/70", accent: "text-berry" },
  warning: { icon: "alert", label: "Watch out", box: "border-sun/45 bg-sun-soft/80", accent: "text-bark" },
  example: { icon: "flask", label: "Example", box: "border-sky/45 bg-sky-soft/70", accent: "text-ink-soft" },
};

const P = "my-5 text-[16.5px] leading-[1.75] text-ink sm:text-[17.5px] sm:leading-[1.8]";

export function Callout({ tone, title, children }: { tone: Tone; title?: ReactNode; children: ReactNode }) {
  const t = CALLOUT[tone];
  return (
    <div role="note" className={`my-8 rounded-2xl border px-4 py-4 sm:px-5 ${t.box}`}>
      <p className={`mb-1.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] ${t.accent}`}>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card/80 shadow-soft">
          <PrepIcon name={t.icon} className="size-4" />
        </span>
        <span className="min-w-0">{title ?? t.label}</span>
      </p>
      <div className="text-[16px] leading-[1.7] text-ink sm:text-[16.5px]">{children}</div>
    </div>
  );
}

function CodeFigure({ code, lang, caption }: { code: string; lang?: string; caption?: string }) {
  return (
    <figure className="my-8 min-w-0">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper-2">
        <div className="flex items-center justify-between gap-2 border-b border-line py-1 pl-4 pr-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{lang && lang !== "text" ? lang : "output"}</span>
          <CopyButton text={code} />
        </div>
        <pre
          tabIndex={0}
          aria-label={lang ? `${lang} code` : "Code"}
          className="scroll-fade-x overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.65] text-ink focus-visible:outline-offset-[-2px]"
        >
          <code>{code}</code>
        </pre>
      </div>
      {caption ? (
        <figcaption className="mt-2 px-1 text-[13.5px] leading-relaxed text-muted">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function DiagramFigure({ lines, caption }: { lines: string[]; caption: string }) {
  return (
    <figure className="my-8 min-w-0">
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-line-strong bg-card shadow-soft">
        <span aria-hidden className="absolute right-3 top-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
          diagram
        </span>
        <pre
          tabIndex={0}
          aria-label={`Diagram: ${plainText(caption)}`}
          className="scroll-fade-x overflow-x-auto px-4 pb-4 pt-7 font-mono text-[12px] leading-[1.6] text-ink [--scroll-fade-bg:var(--color-card)] sm:px-6 sm:text-[13px] focus-visible:outline-offset-[-2px]"
        >
          {lines.join("\n")}
        </pre>
      </div>
      <figcaption className="mt-2 flex gap-2 px-1 text-[13.5px] leading-relaxed text-muted">
        <span aria-hidden className="mt-[0.55em] h-px w-4 shrink-0 bg-line-strong" />
        <span>
          <RichText text={caption} />
        </span>
      </figcaption>
    </figure>
  );
}

/** Renders a lesson's Block[] with long-form reading typography. Wrap in a ~68ch column. */
export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  const headings = lessonHeadings(blocks);
  let h = 0;
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h": {
            const id = headings[h++]?.id;
            return (
              <h2
                key={i}
                id={id}
                className="mb-4 mt-12 scroll-mt-24 text-[1.55rem] font-semibold leading-tight text-ink first:mt-0 sm:text-[1.85rem]"
              >
                <RichText text={b.text} links={false} />
              </h2>
            );
          }
          case "p":
            return (
              <p key={i} className={P}>
                <RichText text={b.text} />
              </p>
            );
          case "list": {
            const items = b.items.map((item, j) => (
              <li key={j} className="pl-1.5">
                <RichText text={item} />
              </li>
            ));
            const cls = "my-5 space-y-2.5 pl-6 text-[16.5px] leading-[1.7] text-ink sm:text-[17.5px]";
            return b.ordered ? (
              <ol key={i} className={`${cls} list-decimal marker:font-semibold marker:text-moss`}>
                {items}
              </ol>
            ) : (
              <ul key={i} className={`${cls} list-disc marker:text-leaf`}>
                {items}
              </ul>
            );
          }
          case "callout":
            return (
              <Callout key={i} tone={b.tone} title={b.title ? <RichText text={b.title} links={false} /> : undefined}>
                <RichText text={b.text} />
              </Callout>
            );
          case "code":
            return <CodeFigure key={i} code={b.code} lang={b.lang} caption={b.caption} />;
          case "diagram":
            return <DiagramFigure key={i} lines={b.lines} caption={b.caption} />;
        }
      })}
    </>
  );
}
