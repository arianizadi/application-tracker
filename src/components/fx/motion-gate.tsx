"use client";

import { useEffect } from "react";

/**
 * <MotionGate/>: one tiny island (mounted once in the root layout) that keeps ambient motion
 * off the CPU when nobody can see it (motion spec §3.6).
 *
 * - Mascots (`.cm-anim`): one IntersectionObserver (100 px margin). Offscreen mascots have
 *   their CSS animations paused through the Web Animations API (no DOM attribute writes, so
 *   it can't fight hydration) and resume where they left off.
 * - At most MAX_LIVE mascots animate at once. Celebration cards (`[data-motion-priority]`)
 *   go first, then the biggest on screen; the rest are reset to their rest pose (cancel,
 *   not pause, so nobody freezes mid-blink) until a slot frees up.
 * - Anything else marked `[data-ambient]` gets a `data-paused` attribute while offscreen;
 *   pair it with `[data-paused] * { animation-play-state: paused }` in that component's CSS.
 *
 * Without JS everything simply animates; under prefers-reduced-motion nothing does anyway.
 */
const MAX_LIVE = 4;
const SEL = ".cm-anim, [data-ambient]";

export function MotionGate() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || typeof Element.prototype.getAnimations !== "function") return;

    const visible = new Set<Element>();
    const observed = new Set<Element>();
    const state = new WeakMap<Element, "live" | "paused" | "still">();
    // Animations this gate paused or cancelled, so it resumes exactly those (and never
    // restarts a one-shot entrance that already finished on its own).
    const held = new WeakMap<Element, Animation[]>();
    let frame = 0;

    const setState = (el: Element, next: "live" | "paused" | "still") => {
      const prev = state.get(el) ?? "live";
      if (prev === next) return;
      state.set(el, next);
      for (const a of held.get(el) ?? []) if (a.playState === "paused" || a.playState === "idle") a.play();
      held.delete(el);
      if (next === "live") return;
      const all = el.getAnimations({ subtree: true }).filter((a) => a.playState === "running");
      if (next === "paused") {
        for (const a of all) a.pause();
        held.set(el, all);
      } else {
        // Only loops; one-shot entrances and hops are allowed to finish.
        const loops = all.filter((a) => a.effect?.getTiming().iterations === Infinity);
        for (const a of loops) a.cancel();
        held.set(el, loops);
      }
    };

    const apply = () => {
      frame = 0;
      const mascots: Element[] = [];
      for (const el of observed) {
        if (!el.isConnected) {
          observed.delete(el);
          visible.delete(el);
          io.unobserve(el);
          continue;
        }
        if (el.classList.contains("cm-anim")) mascots.push(el);
        else if (el.classList.contains("cm")) {
          // A mascot switched to animate={false}: nothing to manage any more.
          setState(el, "live");
          observed.delete(el);
          visible.delete(el);
          io.unobserve(el);
        } else if (visible.has(el)) el.removeAttribute("data-paused");
        else el.setAttribute("data-paused", "");
      }
      const onScreen = mascots
        .filter((el) => visible.has(el))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, rank: (el.closest("[data-motion-priority]") ? 1e9 : 0) + r.width * r.height };
        })
        .sort((a, b) => b.rank - a.rank);
      const live = new Set(onScreen.slice(0, MAX_LIVE).map((x) => x.el));
      for (const el of mascots) setState(el, live.has(el) ? "live" : visible.has(el) ? "still" : "paused");
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        schedule();
      },
      { rootMargin: "100px" },
    );

    const watch = (root: ParentNode) => {
      const found = root instanceof Element && root.matches(SEL) ? [root] : [];
      for (const el of [...found, ...root.querySelectorAll(SEL)]) {
        if (observed.has(el)) continue;
        observed.add(el);
        io.observe(el);
      }
    };
    watch(document);

    const mo = new MutationObserver((records) => {
      let dirty = false;
      for (const r of records) {
        if (r.type === "attributes") {
          // A mood change swaps classes and starts fresh CSS animations: re-check the cap.
          const el = r.target as Element;
          if (el.classList?.contains("cm")) {
            setState(el, "live");
            watch(el);
            dirty = true;
          }
          continue;
        }
        if (r.removedNodes.length) dirty = true;
        for (const n of r.addedNodes) {
          if (n.nodeType === 1) {
            watch(n as Element);
            dirty = true;
          }
        }
      }
      if (dirty) schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      mo.disconnect();
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      for (const el of observed) {
        setState(el, "live");
        el.removeAttribute("data-paused");
      }
    };
  }, []);

  return null;
}
