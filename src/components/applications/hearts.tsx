"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

const HEART = "M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z";
const LABELS = ["Meh", "Sure", "Into it", "Really want it", "Dream role"];
const SPARK = "M0 -4Q.6 -.6 4 0Q.6 .6 0 4Q-.6 .6 -4 0Q-.6 -.6 0 -4Z";
/** Four sparkles puffing out diagonally from the fifth heart. */
const SPARKS = [
  { dx: "-15px", dy: "-13px", fill: "var(--sun)" },
  { dx: "15px", dy: "-14px", fill: "var(--berry)" },
  { dx: "16px", dy: "11px", fill: "var(--sun)" },
  { dx: "-14px", dy: "12px", fill: "var(--berry)" },
];

function Heart({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d={HEART}
        fill={filled ? "var(--berry)" : "none"}
        stroke={filled ? "var(--berry)" : "var(--line-strong)"}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only excitement hearts. */
export function Hearts({ value, size = "sm", className = "" }: { value: number; size?: "xs" | "sm"; className?: string }) {
  const cls = size === "xs" ? "size-3" : "size-3.5";
  return (
    <span role="img" aria-label={`Excitement ${value} of 5`} className={`inline-flex items-center gap-px ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Heart key={n} filled={n <= value} className={cls} />
      ))}
    </span>
  );
}

/** Excitement input: a keyboard-friendly radio group of five hearts. */
export function HeartsInput({
  value,
  onChange,
  name,
  id,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  name?: string;
  id?: string;
  /** id of an error or hint that describes the group. */
  describedBy?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // "Dream role" gets a small sparkle puff (500 ms) when you pick it, never on load.
  const [seen, setSeen] = useState({ value, puff: 0 });
  if (seen.value !== value) setSeen({ value, puff: value === 5 ? seen.puff + 1 : seen.puff });

  function onKey(e: KeyboardEvent<HTMLButtonElement>, n: number) {
    let next = n;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, n + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, n - 1);
    else return;
    e.preventDefault();
    onChange(next);
    refs.current[next - 1]?.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label="Excitement" aria-describedby={describedBy} id={id} className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5 — ${LABELS[n - 1]}`}
            tabIndex={value === n ? 0 : -1}
            onClick={() => onChange(n)}
            onKeyDown={(e) => onKey(e, n)}
            className="group relative flex size-11 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
          >
            <Heart filled={n <= value} className={`size-7 transition-transform ${n === value ? "animate-pop" : ""}`} />
            {n === 5 && seen.puff > 0 && value === 5 ? (
              <span key={seen.puff} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
                {SPARKS.map((p, i) => (
                  <svg
                    key={i}
                    viewBox="-4 -4 8 8"
                    className="size-2.5 animate-spark-out [grid-area:1/1]"
                    style={{ "--dx": p.dx, "--dy": p.dy, animationDelay: `${60 + i * 40}ms` } as CSSProperties}
                  >
                    <path d={SPARK} fill={p.fill} />
                  </svg>
                ))}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <span className="text-sm text-muted" aria-hidden>
        {LABELS[value - 1]}
      </span>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
