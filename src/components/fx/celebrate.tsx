"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Mascot, type MascotMood, type MascotName } from "@/components/mascots";

import { getCelebrationIntensity, prefersReducedMotion } from "./motion";
import {
  resolveOrigin,
  runFx,
  spawnFireflies,
  spawnLeaves,
  spawnRings,
  spawnSprout,
  type Origin,
  type OriginInput,
} from "./particles";
import { RainThenRainbow } from "./rain-rainbow";

export type CelebrationKind = "plant" | "interview" | "offer" | "reject" | "achievement" | "levelup";

export type CelebrateOptions = {
  /** Headline on the celebration card (defaults per kind). */
  title?: string;
  /** Supporting line (defaults per kind). */
  body?: string;
  /** Override the character on the card. */
  mascot?: MascotName;
  mood?: MascotMood;
  /** Where particles burst from: viewport coords or an element (e.g. the clicked button). */
  origin?: OriginInput;
  /** Hide the card and only play particles (e.g. when you already show a toast). */
  quiet?: boolean;
};

export type CelebrateApi = {
  celebrate: (kind: CelebrationKind, options?: CelebrateOptions) => void;
  /** Clear everything on screen right now. */
  dismiss: () => void;
};

type Plan = {
  mascot: MascotName;
  mood: MascotMood;
  title: string;
  body: string;
  /** How long the card stays (ms). */
  hold: number;
  spawn?: (origin: Origin | undefined) => Parameters<typeof runFx>[0];
};

const PLANS: Record<CelebrationKind, Plan> = {
  plant: {
    mascot: "fern",
    mood: "cheer",
    title: "Planted!",
    body: "One more tree in your grove. Future You says thanks.",
    hold: 3000,
    spawn: (o) => [spawnLeaves({ origin: o, count: 40 }), ...(o ? [spawnSprout({ origin: o })] : [])],
  },
  interview: {
    mascot: "pip",
    mood: "cheer",
    title: "Interview unlocked!",
    body: "They want to meet the person behind the PDF.",
    hold: 3600,
    spawn: (o) => [spawnLeaves({ origin: o, count: 44, palette: "petals", power: 1.1 })],
  },
  offer: {
    mascot: "miso",
    mood: "cheer",
    title: "AN OFFER!",
    body: "Please enjoy one full celebratory wiggle. The fine print can wait a minute.",
    hold: 5000,
    spawn: (o) => [spawnFireflies({ origin: o, count: 24 }), spawnLeaves({ origin: o, count: 34, palette: "gold", power: 1.2 })],
  },
  reject: {
    mascot: "prickle",
    mood: "comfort",
    title: "That one stung.",
    body: "One decision. A whole person remains. The tree stays in your forest.",
    hold: 3600,
  },
  achievement: {
    mascot: "acorn",
    mood: "happy",
    title: "Achievement unlocked",
    body: "Logged, timestamped, archived. You did a thing.",
    hold: 3600,
    spawn: (o) => [spawnLeaves({ origin: o, count: 26, palette: "gold", power: 0.75, spread: 160 })],
  },
  levelup: {
    mascot: "alder",
    mood: "cheer",
    title: "Level up!",
    body: "Your forest just grew taller. Hoo-ray. (Sorry. Contractually obligated.)",
    hold: 4200,
    spawn: (o) => [spawnRings({ origin: o }), spawnFireflies({ origin: o, count: 20, radius: 180 })],
  },
};

type Item = {
  id: number;
  kind: CelebrationKind;
  title: string;
  body: string;
  mascot: MascotName;
  mood: MascotMood;
  origin?: Origin;
  calm: boolean;
  quiet: boolean;
};

const CelebrationContext = createContext<CelebrateApi | null>(null);

const FALLBACK: CelebrateApi = {
  celebrate: () => {
    if (process.env.NODE_ENV !== "production") console.warn("useCelebrate(): <CelebrationProvider> is not mounted.");
  },
  dismiss: () => {},
};

/** Mount once near the root (inside <body>). Renders celebrations into a portal on document.body. */
export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [said, setSaid] = useState<{ id: number; text: string } | null>(null);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const dismiss = useCallback(() => setItems([]), []);

  const celebrate = useCallback((kind: CelebrationKind, options: CelebrateOptions = {}) => {
    const plan = PLANS[kind];
    if (!plan) return;
    const intensity = getCelebrationIntensity();
    const title = options.title ?? plan.title;
    const body = options.body ?? plan.body;
    const id = nextId.current++;
    // The rejection overlay announces itself; everything else is announced here.
    if (kind !== "reject" || intensity === "off") setSaid({ id, text: body ? `${title} ${body}` : title });
    if (intensity === "off") return;
    const item: Item = {
      id,
      kind,
      title,
      body,
      mascot: options.mascot ?? plan.mascot,
      mood: options.mood ?? plan.mood,
      // Resolve now: the triggering element may unmount right after (e.g. form submit).
      origin: options.origin ? resolveOrigin(options.origin) : undefined,
      calm: intensity === "calm" || prefersReducedMotion(),
      quiet: options.quiet ?? false,
    };
    // Keep at most three on screen; only one rejection overlay at a time.
    setItems((xs) => [...xs.filter((x) => !(kind === "reject" && x.kind === "reject")).slice(-2), item]);
  }, []);

  const api = useMemo(() => ({ celebrate, dismiss }), [celebrate, dismiss]);

  const hasCards = items.some((i) => i.kind !== "reject");
  useEffect(() => {
    if (!hasCards) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setItems((xs) => xs.filter((x) => x.kind === "reject"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasCards]);

  const cards = items.filter((i) => i.kind !== "reject" && !i.quiet);

  return (
    <CelebrationContext.Provider value={api}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {said ? <p key={said.id}>{said.text}</p> : null}
      </div>
      {items.length > 0
        ? createPortal(
            <>
              {items.map((item) =>
                item.kind === "reject" ? (
                  <RainThenRainbow
                    key={item.id}
                    open
                    calm={item.calm}
                    title={item.title}
                    body={item.body}
                    mascot={item.mascot}
                    onClose={() => remove(item.id)}
                  />
                ) : (
                  <Burst key={item.id} item={item} onDone={remove} />
                ),
              )}
              {cards.length > 0 ? (
                <div className="pointer-events-none fixed inset-x-0 top-0 z-[85] flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:items-end md:pr-6">
                  {cards.slice(-2).map((item) => (
                    <CelebrationCard key={item.id} item={item} onClose={() => remove(item.id)} />
                  ))}
                </div>
              ) : null}
            </>,
            document.body,
          )
        : null}
    </CelebrationContext.Provider>
  );
}

/** Plays the particles for one item and schedules its removal. Renders nothing. */
function Burst({ item, onDone }: { item: Item; onDone: (id: number) => void }) {
  const done = useEffectEvent(() => onDone(item.id));
  const { kind, calm, origin } = item;
  useEffect(() => {
    const plan = PLANS[kind];
    const stop = !calm && plan.spawn ? runFx(plan.spawn(origin)) : () => {};
    const t = window.setTimeout(() => done(), calm ? 2600 : plan.hold);
    return () => {
      window.clearTimeout(t);
      stop();
    };
  }, [kind, calm, origin]);
  return null;
}

function CelebrationCard({ item, onClose }: { item: Item; onClose: () => void }) {
  const tone =
    item.kind === "offer" || item.kind === "levelup"
      ? "border-sun/70 bg-gradient-to-br from-card to-sun-soft"
      : item.kind === "interview"
        ? "border-coral/50 bg-card"
        : "border-moss/40 bg-card";
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm animate-rise items-center gap-3 rounded-3xl border p-2.5 pr-2 shadow-lift ${tone}`}
    >
      <Mascot name={item.mascot} mood={item.mood} animate={!item.calm} className="size-14 shrink-0" />
      <div className="min-w-0 flex-1 py-1">
        <p className="font-display text-lg font-semibold leading-tight">{item.title}</p>
        {item.body ? <p className="mt-0.5 text-sm leading-snug text-ink-soft">{item.body}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="grid size-11 shrink-0 place-items-center self-start rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/**
 * const { celebrate } = useCelebrate();
 * celebrate("plant", { origin: buttonEl });
 * Call it only after the save actually succeeded.
 */
export function useCelebrate(): CelebrateApi {
  return useContext(CelebrationContext) ?? FALLBACK;
}

/**
 * Fire a celebration once when this mounts — handy after a Server Action redirect
 * (e.g. render it when `?celebrate=plant` is present). `onceKey` dedupes across reloads
 * for this tab (sessionStorage), so refreshing doesn't replay it.
 */
export function CelebrateOnMount({ kind, onceKey, ...options }: Omit<CelebrateOptions, "origin"> & { kind: CelebrationKind; onceKey?: string }) {
  const { celebrate } = useCelebrate();
  const fired = useRef(false);
  const fire = useEffectEvent(() => celebrate(kind, options));
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (onceKey) {
      const key = `canopy:celebrated:${onceKey}`;
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
      } catch {
        // Storage blocked: celebrate anyway.
      }
    }
    fire();
  }, [onceKey]);
  return null;
}
