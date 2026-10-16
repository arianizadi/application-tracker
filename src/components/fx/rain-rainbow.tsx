"use client";

import { useEffect, useEffectEvent, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Mascot, MASCOTS, type MascotName } from "@/components/mascots";

import { useIsClient, useReducedMotion } from "./motion";
import { runFx, spawnRain } from "./particles";

const BANDS = ["var(--coral)", "var(--sun)", "var(--leaf)", "var(--sky)", "var(--berry)"];

function Rainbow({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 104" className={className} style={style} aria-hidden>
      <g fill="none" strokeLinecap="round" strokeWidth="8.5" opacity="0.9">
        {BANDS.map((c, i) => {
          const r = 88 - i * 9.5;
          return <path key={c} d={`M${100 - r} 100 A${r} ${r} 0 0 1 ${100 + r} 100`} stroke={c} />;
        })}
      </g>
      <g fill="var(--card)" stroke="var(--line)" strokeWidth="1.5">
        <path d="M2 100 a9 9 0 0 1 10 -12 a12 12 0 0 1 22 2 a8 8 0 0 1 6 10 Z" />
        <path d="M160 100 a8 8 0 0 1 6 -10 a12 12 0 0 1 22 -2 a9 9 0 0 1 10 12 Z" />
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
 * Gentle rejection overlay: a short soft rain, then a small rainbow behind Prickle with a
 * comforting line. A toast-like note, not a modal: the page underneath stays clickable and
 * focus isn't moved. Auto-closes after `duration` (paused while hovered/focused), and closes
 * on Escape or the button. Reduced motion / `calm`: no rain, static rainbow.
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
  duration = 3600,
  calm = false,
  children,
}: RainProps) {
  const reduced = useReducedMotion();
  const still = calm || reduced;
  const [pinned, setPinned] = useState(false);
  const close = useEffectEvent(() => onClose());

  // Rain (once per open).
  useEffect(() => {
    if (still) return;
    return runFx(spawnRain({ count: 36 }), { z: 89, maxMs: 3200 });
  }, [still]);

  // Auto-close unless the person is reading/interacting.
  useEffect(() => {
    if (pinned) return;
    const t = window.setTimeout(() => close(), duration);
    return () => window.clearTimeout(t);
  }, [pinned, duration]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const info = MASCOTS[mascot];
  const delay = still ? "0ms" : "1100ms";

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 animate-fade bg-paper/60 backdrop-blur-[2px]" />
      <section
        aria-label={`A note from ${info.name}`}
        className="pointer-events-auto relative flex w-full max-w-sm flex-col items-center text-center"
        onPointerEnter={() => setPinned(true)}
        onFocusCapture={() => setPinned(true)}
      >
        <Rainbow className="-mb-10 w-60 animate-rise sm:w-72" style={{ animationDelay: delay, animationDuration: "800ms" }} />
        <div
          className="relative w-full animate-rise rounded-3xl border border-line bg-card px-5 pb-5 pt-4 shadow-lift"
          style={{ animationDelay: still ? "0ms" : "350ms" }}
        >
          <Mascot name={mascot} mood="comfort" animate={!still} className="mx-auto -mt-12 size-20" />
          <div role="status" aria-live="polite">
            <p className="mt-1 font-display text-xl font-semibold leading-tight">{title}</p>
            {body ? <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{body}</p> : null}
          </div>
          {children ? <div className="mt-3">{children}</div> : null}
          <button
            type="button"
            onClick={() => onClose()}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-line-strong bg-card px-5 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
          >
            {dismissLabel ?? `Thanks, ${info.name}`}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
