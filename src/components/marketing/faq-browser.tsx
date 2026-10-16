"use client";

import Link from "next/link";
import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { useHotkeys } from "@/hooks/use-hotkeys";

import type { FaqGroup } from "./faq-data";

function normalize(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps search terms in <mark>. Plain text in, React nodes out (no HTML injection). */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-sun-soft px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Renders answer text: blank-line separated paragraphs, "• " lines as a list. */
function Answer({ text }: { text: string }) {
  const blocks = text.split("\n\n");
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const bullets = lines.filter((l) => l.startsWith("• "));
        const lead = lines.filter((l) => !l.startsWith("• ")).join(" ");
        return (
          <Fragment key={i}>
            {lead ? <p>{lead}</p> : null}
            {bullets.length > 0 ? (
              <ul className="flex flex-col gap-2 pl-1">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-leaf" />
                    <span>{b.slice(2)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

export function FaqBrowser({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const hotkeys = useMemo(() => ({ "/": () => inputRef.current?.focus() }), []);
  useHotkeys(hotkeys);

  // Open the question linked from a URL hash, e.g. /faq#referrals.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      el.scrollIntoView({ block: "start" });
    }
  }, []);

  const terms = useMemo(
    () =>
      normalize(deferred)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .slice(0, 8),
    [deferred],
  );

  const filtered = useMemo(() => {
    if (terms.length === 0) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const haystack = normalize(`${g.title} ${item.q} ${item.a}`);
          return terms.every((t) => haystack.includes(t));
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, terms]);

  const searching = terms.length > 0;
  const matchCount = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-line/70 bg-paper/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <label htmlFor="faq-search" className="sr-only">
          Search questions
        </label>
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3.5 3.5" />
          </svg>
          <input
            ref={inputRef}
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder="Search: referrals, Security+, ghosting…"
            autoComplete="off"
            enterKeyHint="search"
            className={`${inputClass} h-12 rounded-full pl-10 pr-16`}
          />
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line-strong px-1.5 font-mono text-xs text-muted sm:block">
            /
          </kbd>
        </div>
        {!searching ? (
          <nav aria-label="FAQ sections" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-line bg-card px-3.5 text-sm text-ink-soft transition-colors hover:border-moss/40 hover:text-ink"
              >
                {g.title}
              </a>
            ))}
          </nav>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {searching ? `${matchCount} ${matchCount === 1 ? "answer matches" : "answers match"} your search.` : ""}
      </p>

      {searching && matchCount > 0 ? (
        <p className="mt-6 text-sm text-muted">
          {matchCount} {matchCount === 1 ? "answer" : "answers"} for &ldquo;{deferred.trim()}&rdquo;
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <Mascot name="acorn" mood="think" className="size-28" />
          <h2 className="mt-4 text-2xl font-semibold">Nothing on this trail.</h2>
          <p className="mt-2 max-w-sm text-ink-soft">
            Acorn checked behind every stump. Try a different word, or browse all the questions.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-14">
          {filtered.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-40">
              <h2 id={`${group.id}-title`} className="text-2xl font-semibold sm:text-3xl">
                {group.title}
              </h2>
              <p className="mt-1 text-[15px] text-muted">{group.blurb}</p>
              <div className="mt-5 flex flex-col gap-3">
                {group.items.map((item) => (
                  <details
                    key={`${item.id}-${searching ? "s" : "b"}`}
                    id={item.id}
                    open={searching && matchCount <= 6 ? true : undefined}
                    className="group scroll-mt-40 rounded-2xl border border-line bg-card shadow-soft transition-colors open:border-line-strong"
                  >
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-medium leading-snug [&::-webkit-details-marker]:hidden">
                      <span>
                        <Highlight text={item.q} terms={terms} />
                      </span>
                      <span
                        aria-hidden
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-paper-2 text-muted transition-transform duration-200 group-open:rotate-45 group-open:bg-moss-soft group-open:text-moss"
                      >
                        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M8 3v10M3 8h10" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink-soft">
                      <Answer text={item.a} />
                      {item.links?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-moss-soft px-3.5 text-sm font-medium text-moss-strong hover:bg-moss/15"
                            >
                              {link.label}
                              <span aria-hidden>→</span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
