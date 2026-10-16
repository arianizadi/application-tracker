"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import { isStatus } from "@/lib/status";

import styles from "./forest.module.css";

type Tip = {
  id: string;
  company: string;
  role: string;
  status: string;
  days: number | null;
  left: number;
  top: number;
  below: boolean;
  pinned: boolean;
};

const TIP_HALF = 112; // half of max tooltip width (14rem) for edge clamping

/**
 * Thin client wrapper around the server-rendered forest SVG:
 * - pauses ambient animation while offscreen,
 * - (interactive) hover / tap / keyboard tooltips for trees and seeds,
 *   with roving focus via arrow keys.
 * It never re-renders the SVG; it only reads data-* attributes from it.
 */
export function ForestFrame({
  children,
  className = "",
  interactive = false,
  linkTrees = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  linkTrees?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeEl = useRef<Element | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  // Pause motion when the forest scrolls offscreen (saves battery on long pages).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.removeAttribute("data-paused");
      else el.setAttribute("data-paused", "");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mark = useCallback((el: Element | null) => {
    activeEl.current?.removeAttribute("data-active");
    activeEl.current = el;
    el?.setAttribute("data-active", "");
  }, []);

  const show = useCallback(
    (el: Element, pinned: boolean) => {
      const root = ref.current;
      if (!root) return;
      const box = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const d = (el as HTMLElement | SVGElement).dataset;
      const centre = r.left + r.width / 2 - box.left;
      const half = Math.min(TIP_HALF, box.width / 2 - 4);
      const left = Math.max(half + 4, Math.min(box.width - half - 4, centre));
      const below = r.top - box.top < 96;
      mark(el);
      setTip({
        id: d.tree ?? "",
        company: d.company ?? "",
        role: d.role ?? "",
        status: d.status ?? "",
        days: d.days != null && d.days !== "" ? Number(d.days) : null,
        left,
        top: below ? r.bottom - box.top + 8 : r.top - box.top - 8,
        below,
        pinned,
      });
    },
    [mark],
  );

  const hide = useCallback(() => {
    mark(null);
    setTip(null);
  }, [mark]);

  useEffect(() => {
    if (!tip?.pinned) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [tip?.pinned, hide]);

  const items = () => {
    const nodes = Array.from(ref.current?.querySelectorAll<SVGGElement>("[data-tree]") ?? []);
    return nodes
      .map((n) => ({ n, x: n.getBoundingClientRect().left }))
      .sort((a, b) => a.x - b.x)
      .map((o) => o.n);
  };

  const target = (e: { target: EventTarget | null }) => (e.target as Element | null)?.closest?.("[data-tree]") ?? null;

  if (!interactive) {
    return (
      <div ref={ref} className={`${styles.frame} relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${styles.frame} relative ${className}`}
      onPointerOver={(e) => {
        if (e.pointerType !== "mouse") return;
        if (tip?.pinned) return;
        const el = target(e);
        if (el) {
          if (el !== activeEl.current) show(el, false);
        } else if (tip && !(e.target as Element).closest?.("[data-forest-tip]")) {
          hide();
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !tip?.pinned) hide();
      }}
      onClick={(e) => {
        const el = target(e);
        if (el) show(el, true);
        else if (!(e.target as Element).closest("[data-forest-tip]")) hide();
      }}
      onFocus={(e) => {
        const el = target(e);
        if (el) show(el, false);
      }}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) hide();
      }}
      onKeyDown={(e) => {
        const el = target(e);
        if (e.key === "Escape") {
          hide();
          return;
        }
        if (!el) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show(el, true);
          return;
        }
        const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (!keys.includes(e.key)) return;
        e.preventDefault();
        const list = items();
        const i = list.indexOf(el as SVGGElement);
        const next =
          e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(0, i - 1) : Math.min(list.length - 1, i + 1);
        const to = list[next];
        if (!to || to === el) return;
        el.setAttribute("tabindex", "-1");
        to.setAttribute("tabindex", "0");
        (to as SVGGElement).focus();
      }}
    >
      {children}
      {tip && (
        <div
          data-forest-tip=""
          className="animate-fade absolute z-10 w-max max-w-56 rounded-2xl border border-line bg-card/95 px-3.5 py-2.5 text-left shadow-lift backdrop-blur-sm"
          style={{ left: tip.left, top: tip.top, transform: `translate(-50%, ${tip.below ? "0" : "-100%"})` }}
        >
          <p className="truncate font-display text-[15px] font-semibold leading-tight text-ink">{tip.company}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{tip.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isStatus(tip.status) && <StatusPill status={tip.status} />}
            {tip.days != null && (
              <span className="tabular text-[11px] text-muted">
                {tip.days === 0 ? "planted today" : `${tip.days}d old`}
              </span>
            )}
          </div>
          {linkTrees && tip.pinned && tip.id && (
            <Link
              href={`/applications/${encodeURIComponent(tip.id)}`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-moss-strong underline-offset-4 hover:underline"
            >
              Open application →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
