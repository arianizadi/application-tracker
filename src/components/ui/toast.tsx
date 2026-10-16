"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Tone = "success" | "info" | "warning" | "celebrate";
type Toast = { id: number; title: string; body?: string; tone: Tone; leaving?: boolean };

const ToastContext = createContext<(t: Omit<Toast, "id" | "leaving"> & { tone?: Tone }) => void>(() => {});

const toneClass: Record<Tone, string> = {
  success: "border-moss/40",
  info: "border-sky/50",
  warning: "border-sun/60",
  celebrate: "border-sun bg-gradient-to-br from-card to-sun-soft",
};

const toneDot: Record<Tone, string> = {
  success: "bg-moss",
  info: "bg-sky",
  warning: "bg-sun",
  celebrate: "bg-sun",
};

/** Exit length; matches `animate-leave` (--t-quick). */
const LEAVE_MS = 180;
/** At most this many on screen; the oldest steps aside for a newcomer. */
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const lastTop = useRef(new Map<number, number>());

  // Two-step exit: mark leaving (plays `animate-leave`), then remove.
  const remove = useCallback((id: number) => {
    setToasts((all) => (all.some((x) => x.id === id && !x.leaving) ? all.map((x) => (x.id === id ? { ...x, leaving: true } : x)) : all));
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), LEAVE_MS);
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id" | "leaving"> & { tone?: Tone }) => {
      const id = next.current++;
      const toast: Toast = { id, tone: t.tone ?? "success", title: t.title, body: t.body };
      setToasts((all) => {
        // Same words already showing (e.g. a celebration card's toast twin): say it once.
        if (all.some((x) => !x.leaving && x.title === toast.title && x.body === toast.body)) return all;
        const live = all.filter((x) => !x.leaving);
        const overflow = new Set(live.slice(0, Math.max(0, live.length - (MAX_VISIBLE - 1))).map((x) => x.id));
        for (const oid of overflow) window.setTimeout(() => setToasts((a) => a.filter((x) => x.id !== oid)), LEAVE_MS);
        return [...all.map((x) => (overflow.has(x.id) ? { ...x, leaving: true } : x)), toast];
      });
      window.setTimeout(() => remove(id), toast.tone === "celebrate" ? 6500 : 4200);
    },
    [remove],
  );

  // FLIP: when the stack changes, slide survivors from where they were (transform only, never height).
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new Map<number, number>();
    for (const [id, el] of nodes.current) {
      const top = el.getBoundingClientRect().top;
      seen.set(id, top);
      const before = lastTop.current.get(id);
      if (reduce || before === undefined) continue;
      const dy = before - top;
      if (Math.abs(dy) < 1) continue;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        composite: "add",
      });
    }
    lastTop.current = seen;
  }, [toasts]);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--dock-bottom)+0.75rem+var(--bottom-ui-h,0px))] z-[60] flex flex-col items-center gap-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:bottom-[calc(1.5rem+var(--bottom-ui-h,0px))] md:items-end md:pr-[max(1.5rem,env(safe-area-inset-right))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            ref={(el) => {
              if (el) nodes.current.set(t.id, el);
              else nodes.current.delete(t.id);
            }}
            role="status"
            className={`flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lift ${toneClass[t.tone]} ${
              t.leaving ? "animate-leave" : "animate-[rise-sm_360ms_var(--ease-enter)_90ms_both]"
            }`}
          >
            <span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${toneDot[t.tone]}`} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body ? <p className="mt-0.5 text-sm text-ink-soft">{t.body}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
