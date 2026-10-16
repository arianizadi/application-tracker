"use client";

import { useRef, useState, type ReactNode } from "react";

type Tip = { text: string; x: number; y: number; width: number };

/**
 * One lightweight hover/focus tooltip for a server-rendered chart. Any
 * descendant with `data-tip` shows its text on pointer hover, tap, or keyboard
 * focus. Tooltips only enhance: every value is also in the chart's data table.
 */
export function TipLayer({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  function show(target: EventTarget | null) {
    const box = ref.current;
    const el = target instanceof Element ? target.closest("[data-tip]") : null;
    if (!box || !el || !box.contains(el)) {
      setTip(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    setTip({ text: el.getAttribute("data-tip") ?? "", x: r.left + r.width / 2 - b.left, y: r.top - b.top, width: b.width });
  }

  const half = 88;
  const left = tip ? Math.min(Math.max(tip.x, Math.min(half, tip.width / 2)), Math.max(tip.width - half, tip.width / 2)) : 0;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onPointerOver={(e) => show(e.target)}
      onPointerLeave={() => setTip(null)}
      onFocus={(e) => show(e.target)}
      onBlur={() => setTip(null)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setTip(null);
      }}
    >
      {children}
      {tip && tip.text ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 w-max max-w-[11rem] -translate-x-1/2 -translate-y-full whitespace-pre-line rounded-xl border border-line bg-card px-3 py-2 text-xs leading-snug text-ink shadow-lift animate-fade tabular"
          style={{ left, top: tip.y - 8 }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  );
}
