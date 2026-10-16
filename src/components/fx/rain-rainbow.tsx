"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Mascot, MASCOTS, type MascotName } from "@/components/mascots";

import styles from "./fx.module.css";
import { useIsClient, useReducedMotion } from "./motion";
import { runFx, spawnRain } from "./particles";

const BANDS = ["var(--coral)", "var(--sun)", "var(--leaf)", "var(--sky)", "var(--berry)"];
/** The rainbow starts drawing as the shower thins out (ms). */
const RAINBOW_AT = 900;

/** Five arcs that draw outer → inner, then two clouds slide in to hold the ends. */
function Rainbow({ still, className = "" }: { still: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 200 104" className={`${still ? styles.static : ""} ${className}`} aria-hidden>
      <g fill="none" strokeLinecap="round" strokeWidth="6.5" opacity="0.72">
        {BANDS.map((c, i) => {
          const r = 88 - i * 9.5;
          return (
            <path
              key={c}
              className={styles.band}
              pathLength={100}
              d={`M${100 - r} 100 A${r} ${r} 0 0 1 ${100 + r} 100`}
              stroke={c}
              style={{ animationDelay: `${RAINBOW_AT + i * 90}ms` }}
            />
          );
        })}
      </g>
      <g fill="var(--card)" stroke="var(--line)" strokeWidth="1.5">
        <path className={styles.cloudL} style={{ animationDelay: `${RAINBOW_AT + 150}ms` }} d="M2 100 a9 9 0 0 1 10 -12 a12 12 0 0 1 22 2 a8 8 0 0 1 6 10 Z" />
        <path className={styles.cloudR} style={{ animationDelay: `${RAINBOW_AT + 230}ms` }} d="M160 100 a8 8 0 0 1 6 -10 a12 12 0 0 1 22 -2 a9 9 0 0 1 10 12 Z" />
      </g>
    </svg>
  );
}

type RainProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  body?: ReactNode;
  mascot?: MascotName;
  dismissLabel?: string;
  duration?: number;
  calm?: boolean;
  /** Extra content under the text (e.g. a "Write a quick reflection" link). */
  children?: ReactNode;
};

/**
 * Gentle rejection overlay (§4.7): a short light shower, then a rainbow that draws band by
 * band behind Prickle with a comforting line. A toast-like note, not a modal: the page
 * underneath stays clickable and focus isn't moved. Auto-closes after `duration` (paused
 * while hovered/focused), and closes on Escape or the button. Reduced motion / `calm`: no
 * rain, a static rainbow, and the card fades in.
 */
export function RainThenRainbow(props: RainProps) {
  const isClient = useIsClient();
  // Mount the overlay only while open so its state (pinned, timers) resets each time.
  return props.open && isClient ? <RainOverlay {...props} /> : null;
}

function RainOverlay({
  onClose,
  title = "That one stung.",
  body = "One decision. A whole person remains. The tree stays in your forest.",
  mascot = "prickle",
  dismissLabel,
  duration = 4200,
  calm = false,
  children,
}: RainProps) {
  const reduced = useReducedMotion();
  const still = calm || reduced;
  const [pinned, setPinned] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leave = useEffectEvent(() => setLeaving(true));
  const close = useEffectEvent(() => onClose());

  // A light shower (once per open), above the scrim so it reads, below the card.
  useEffect(() => {
    if (still) return;
    return runFx(spawnRain({ count: 24, window: 1000 }), { z: 89, maxMs: 3000 });
  }, [still]);

  // Auto-close unless the person is reading/interacting.
  useEffect(() => {
    if (pinned || leaving) return;
    const t = window.setTimeout(() => leave(), duration);
    return () => window.clearTimeout(t);
  }, [pinned, leaving, duration]);

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => close(), 220);
    return () => window.clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const info = MASCOTS[mascot];

  return createPortal(
    <>
      {/* Plain scrim (no backdrop blur: a full-viewport filter is heavy on phones). */}
      <div aria-hidden className={`${leaving ? styles.scrimLeave : styles.scrim} pointer-events-none fixed inset-0 z-[88] bg-paper/70`} />
      <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4">
        <section
          aria-label={`A note from ${info.name}`}
          className={`${styles.card} ${leaving ? styles.leave : ""} pointer-events-auto relative flex w-full max-w-sm flex-col items-center text-center`}
          onPointerEnter={() => setPinned(true)}
          onFocusCapture={() => setPinned(true)}
        >
          <Rainbow still={still} className="-mb-10 w-60 sm:w-72" />
          <div
            className={`${still ? styles.fade : styles.rise} relative w-full rounded-3xl border border-line bg-card px-5 pb-5 pt-4 shadow-lift`}
            style={still ? undefined : { animationDelay: "120ms" }}
          >
            <Mascot name={mascot} mood="comfort" animate={!still} enter={!still} className="mx-auto -mt-12 size-20" />
            <div role="status" aria-live="polite">
              <p className="mt-1 font-display text-xl font-semibold leading-tight">{title}</p>
              {body ? <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{body}</p> : null}
            </div>
            {children ? <div className="mt-3">{children}</div> : null}
            <button
              type="button"
              onClick={() => setLeaving(true)}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-line-strong bg-card px-5 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
            >
              {dismissLabel ?? `Thanks, ${info.name}`}
            </button>
          </div>
        </section>
      </div>
    </>,
    document.body,
  );
}
