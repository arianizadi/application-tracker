"use client";

import { useEffect, type RefObject } from "react";

/*
 * Fixed or sticky bars at the bottom of the screen (Undo, bulk toolbar, form
 * save bar) register their height here; the total is published as
 * `--bottom-ui-h` on <html> so toasts can stack above them instead of on top.
 */
const heights = new Map<symbol, number>();
const GAP_PX = 8;

function publish() {
  const total = [...heights.values()].reduce((sum, h) => sum + h, 0);
  if (total) document.documentElement.style.setProperty("--bottom-ui-h", `${total}px`);
  else document.documentElement.style.removeProperty("--bottom-ui-h");
}

/** Reserves room above `ref`'s element for toasts while it is mounted and `active`. */
export function useBottomUi(ref: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const id = Symbol("bottom-ui");
    const measure = () => {
      heights.set(id, el.offsetHeight ? el.offsetHeight + GAP_PX : 0);
      publish();
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      heights.delete(id);
      publish();
    };
  }, [ref, active]);
}
