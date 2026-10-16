"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Tone = "success" | "info" | "warning" | "celebrate";
type Toast = { id: number; title: string; body?: string; tone: Tone };

const ToastContext = createContext<(t: Omit<Toast, "id"> & { tone?: Tone }) => void>(() => {});

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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const push = useCallback((t: Omit<Toast, "id"> & { tone?: Tone }) => {
    const id = next.current++;
    setToasts((all) => [...all.slice(-3), { id, tone: t.tone ?? "success", title: t.title, body: t.body }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.tone === "celebrate" ? 6500 : 4200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lift ${toneClass[t.tone]}`}
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
