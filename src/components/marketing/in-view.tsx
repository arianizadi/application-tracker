"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Marks its element `data-inview` the first time it is at least `threshold`
 * visible, and `data-offscreen` whenever it has fully left the viewport. CSS
 * keys one-shot entrances and offscreen pauses off them:
 *
 *   .stage[data-armed]:not([data-inview]) .thing { animation-play-state: paused }
 *   .stage[data-offscreen] .loop { animation-play-state: paused }
 *
 * `data-armed` is only set once JS runs, so without JS (or before hydration)
 * entrances simply play on load and nothing is ever stuck hidden.
 */
export function InView({
  as: Tag = "div",
  threshold = 0.4,
  className,
  style,
  children,
  ...rest
}: {
  as?: "div" | "section";
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-inview", "");
      return;
    }
    el.setAttribute("data-armed", "");
    // Attributes are written only from this effect (after hydration), never rendered.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= threshold || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * 0.5)) {
          el.setAttribute("data-inview", "");
        }
        el.toggleAttribute("data-offscreen", !e.isIntersecting);
      },
      { threshold: [0, threshold] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as never} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
