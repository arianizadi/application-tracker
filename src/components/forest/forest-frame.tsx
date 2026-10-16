"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { getCelebrationIntensity, prefersReducedMotion } from "@/components/fx/motion";
import { StatusPill } from "@/components/ui/status-pill";
import { isStatus } from "@/lib/status";

import styles from "./forest.module.css";

// ── "While you were away" ───────────────────────────────────────────────────
// Each device remembers which trees it has seen (id → status). A tree it has
// never seen grows in from a seed the next time the forest is on screen; a tree
// whose status changed plays a small beat (blossoms open, a lantern lights, a
// mushroom pops). Everything plays once per device, then the forest is still.

const SEEN_KEY = "canopy:forest:seen";
const SEEN_CAP = 400;
/** At most this many trees grow / change at once; the rest simply appear. */
const MAX_BEATS = 6;
const BEAT: Partial<Record<string, string>> = {
  ASSESSMENT: "buds",
  INTERVIEW: "blossoms",
  OFFER: "lantern",
  ACCEPTED: "lantern",
  REJECTED: "compost",
  GHOSTED: "fog",
  WITHDRAWN: "log",
};

type Seen = Record<string, string>;

/** undefined = storage unavailable, null = nothing recorded on this device yet. */
function readSeen(): Seen | null | undefined {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t?: Seen };
    return parsed && typeof parsed.t === "object" && parsed.t ? parsed.t : {};
  } catch {
    return undefined;
  }
}

function treeNodes(root: HTMLElement): SVGGElement[] {
  return Array.from(root.querySelectorAll<SVGGElement>("[data-tree][data-status]")).filter((n) => n.dataset.status !== "WISHLIST");
}

function writeSeen(root: HTMLElement) {
  try {
    const seen = readSeen() ?? {};
    for (const n of treeNodes(root)) {
      const id = n.dataset.tree!;
      delete seen[id]; // re-insert so current trees are the newest entries
      seen[id] = n.dataset.status!;
    }
    const ids = Object.keys(seen);
    for (const id of ids.slice(0, Math.max(0, ids.length - SEEN_CAP))) delete seen[id];
    window.localStorage.setItem(SEEN_KEY, JSON.stringify({ v: 1, t: seen }));
  } catch {
    // Storage blocked: next visit grows only the newest tree again.
  }
}

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
 * - pauses ambient animation while offscreen or in a hidden tab,
 * - grows in trees this device hasn't seen yet (and plays status beats) once
 *   the forest is on screen; or, with `intro`, grows the whole grove once,
 * - (interactive) hover / tap / keyboard tooltips for trees and seeds,
 *   with roving focus via arrow keys.
 * It never re-renders the SVG; it only reads data-* attributes from it.
 */
export function ForestFrame({
  children,
  className = "",
  interactive = false,
  linkTrees = false,
  intro = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  linkTrees?: boolean;
  /** Landing intro: the whole grove grows in once, the first time it is ≥40% on screen. */
  intro?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeEl = useRef<Element | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const go = useRef(false);
  const handled = useRef(new Map<string, string>());

  // Decide what grows / changes, before paint (so nothing flashes). Re-runs when
  // the server sends a new forest (e.g. right after planting), so a tree you just
  // added grows in front of you.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const intensity = getCelebrationIntensity();
    el.toggleAttribute("data-calm", intensity === "calm");
    if (!intro) {
      const seen = readSeen();
      const nodes = treeNodes(el);
      const known = handled.current;
      let growers: SVGGElement[] = [];
      const changes: [SVGGElement, string][] = [];
      for (const n of nodes) {
        const id = n.dataset.tree!;
        const status = n.dataset.status!;
        const before = known.get(id) ?? seen?.[id];
        known.set(id, status);
        if (n.hasAttribute("data-grow")) continue;
        if (before == null) {
          // Never seen here. Without storage we can't tell, so only the newest grows.
          if (n.hasAttribute("data-fresh") && (seen !== undefined || n.hasAttribute("data-newest"))) growers.push(n);
        } else if (before !== status && BEAT[status]) {
          changes.push([n, BEAT[status]!]);
        }
      }
      // First visit on this device with a grown-up forest: only the newest tree grows.
      if (seen === null && !go.current && nodes.length > MAX_BEATS) growers = growers.filter((n) => n.hasAttribute("data-newest"));
      if (intensity === "off") {
        growers = [];
        changes.length = 0;
      }
      growers
        .sort((a, b) => Number(a.dataset.x) - Number(b.dataset.x))
        .slice(0, MAX_BEATS)
        .forEach((n, i) => {
          n.style.setProperty("--gd", `${i * 140}ms`);
          n.setAttribute("data-grow", "");
        });
      const after = Math.min(growers.length, MAX_BEATS) * 140 + (growers.length ? 500 : 0);
      changes.slice(0, MAX_BEATS).forEach(([n, beat], i) => {
        n.style.setProperty("--gd", `${after + i * 180}ms`);
        n.setAttribute("data-change", beat);
      });
      if (go.current) writeSeen(el);
    }
    el.setAttribute("data-ready", "");
  }, [children, intro]);

  // Start the grow-ins once the forest is properly on screen, and pause all
  // ambient motion while it is offscreen or the tab is hidden.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let onScreen = true;
    let timer = 0;
    const need = intro ? 0.4 : 0.5;
    const start = () => {
      if (go.current) return;
      go.current = true;
      el.setAttribute("data-go", "");
      if (!intro) writeSeen(el);
    };
    const sync = () => el.toggleAttribute("data-paused", !onScreen || document.hidden);
    document.addEventListener("visibilitychange", sync);
    // Reduced motion: the landing grove is simply there.
    if ((intro && prefersReducedMotion()) || typeof IntersectionObserver === "undefined") start();
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([e]) => {
              onScreen = e.isIntersecting;
              sync();
              const tall = e.boundingClientRect.height > window.innerHeight;
              const seen = e.intersectionRatio >= need - 0.01 || (tall && e.intersectionRect.height >= window.innerHeight * need);
              if (!go.current && !timer && seen) timer = window.setTimeout(start, intro ? 0 : 400);
              else if (!seen && timer && !go.current) {
                window.clearTimeout(timer);
                timer = 0;
              }
            },
            { threshold: [0, need] },
          );
    io?.observe(el);
    return () => {
      io?.disconnect();
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [intro]);

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
      <div ref={ref} className={`${styles.frame} relative ${className}`} data-intro={intro ? "" : undefined}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${styles.frame} relative ${className}`}
      data-intro={intro ? "" : undefined}
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
