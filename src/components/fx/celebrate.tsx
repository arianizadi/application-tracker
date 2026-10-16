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
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { Mascot, type MascotMood, type MascotName } from "@/components/mascots";
import { useBottomUi } from "@/hooks/use-bottom-ui";

import styles from "./fx.module.css";
import { getCelebrationIntensity, prefersReducedMotion } from "./motion";
import {
  PARTICLE_MS,
  resolveOrigin,
  runFx,
  seasonalPalette,
  spawnFireflies,
  spawnLeaves,
  spawnLightSeeds,
  spawnRing,
  spawnSeed,
  spawnSprout,
  type Origin,
  type OriginInput,
  type Spawner,
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
  /** Clear everything on screen (and anything queued) right now. */
  dismiss: () => void;
};

// ── Plans ─────────────────────────────────────────────────────────────────────

type Plan = {
  mascot: MascotName;
  mood: MascotMood;
  title: string;
  body: string;
  /** Full intensity: particles. `o` is the burst point (button, or the card's mascot). */
  fx?: (o: Origin) => Spawner[];
  /** Full intensity: particles drawn above the card (e.g. light seeds leaving its mascot). */
  fxTop?: (o: Origin) => Spawner[];
  /** Calm / reduced motion: a still flourish instead of particles (optional). */
  calmFx?: (o: Origin) => Spawner[];
};

const PLANS: Record<CelebrationKind, Plan> = {
  // §4.2 Seed into soil: a seed hops out of the Plant button, a sprout grows where it
  // lands, and a small seasonal puff of 14 leaves follows.
  plant: {
    mascot: "fern",
    mood: "cheer",
    title: "Planted!",
    body: "One more tree in your grove. Future You says thanks.",
    fx: (o) => {
      const palette = seasonalPalette();
      if (o.top === undefined) return [spawnLeaves({ origin: o, count: 14, power: 0.75, spread: 90, palette })];
      const seed = spawnSeed({ origin: o });
      return [
        seed.spawner,
        spawnSprout({ origin: seed.landing, delay: 260, hold: 500 }),
        spawnLeaves({ origin: { x: seed.landing.x, y: seed.landing.y - 10 }, count: 14, power: 0.75, spread: 90, palette, delay: 400 }),
      ];
    },
    calmFx: (o) => (o.top === undefined ? [] : [spawnSprout({ origin: { x: o.x, y: o.top }, still: true, hold: 900 })]),
  },
  // §4.3 Petals that float rather than fall, and one soft ring.
  interview: {
    mascot: "pip",
    mood: "cheer",
    title: "Interview unlocked!",
    body: "They want to meet the person behind the PDF.",
    fx: (o) => [
      spawnRing({ origin: o, size: 110, from: 0.35, to: 1.9, duration: 1000, color: "color-mix(in oklab, var(--sun) 50%, var(--berry))", opacity: 0.6 }),
      spawnLeaves({ origin: o, count: 22, palette: "petals", power: 0.85, spread: 130, gravity: 600, sway: [14, 30], life: [1800, 2200], delay: 80 }),
    ],
  },
  // §4.4 Golden hour: one slow ring of light, gold leaves, a few rising fireflies. ≤ 2.4 s.
  offer: {
    mascot: "miso",
    mood: "cheer",
    title: "AN OFFER!",
    body: "Please enjoy one full celebratory wiggle. The fine print can wait a minute.",
    fx: (o) => [
      spawnRing({ origin: o, look: "light", size: 150, from: 0.4, to: 2.3, duration: 1400, opacity: 0.9 }),
      spawnLeaves({ origin: o, count: 18, palette: "gold", power: 1, spread: 120, delay: 120 }),
      spawnFireflies({ origin: o, count: 10, rise: [40, 90] }),
    ],
  },
  reject: {
    mascot: "prickle",
    mood: "comfort",
    title: "That one stung.",
    body: "One decision. A whole person remains. The tree stays in your forest.",
  },
  // §4.5 The card does the sparkle sweep; particles stay a small gold puff.
  achievement: {
    mascot: "acorn",
    mood: "happy",
    title: "Achievement unlocked",
    body: "Logged, timestamped, archived. You did a thing.",
    fx: (o) => [spawnLeaves({ origin: o, count: 10, palette: "gold", power: 0.6, spread: 140, delay: 200 })],
  },
  // §4.6 One ring, eight light seeds.
  levelup: {
    mascot: "alder",
    mood: "cheer",
    title: "Level up!",
    body: "Your forest just grew taller. Hoo-ray. (Sorry. Contractually obligated.)",
    fx: (o) => [spawnRing({ origin: o, size: 90 })],
    fxTop: (o) => [spawnLightSeeds({ origin: o, count: 8 })],
  },
};

/** Kinds that show the medallion (badge sweep) on their card. */
const MEDAL: ReadonlySet<CelebrationKind> = new Set(["achievement", "levelup"]);
/** After one moment's particles finish, the next waits this long (§4.1). */
const GAP_MS = 1400;
/** A particles-only moment that has waited this long has lost its "because you just did X". */
const STALE_MS = 2600;
const FX_TOTAL_MS = PARTICLE_MS + 300;

/** Card hold from reading time: clamp(2800, words × 260, 4500) ms (§4.1). */
function readingHold(...texts: (string | undefined)[]): number {
  const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(2800, Math.min(4500, words * 260));
}

/** "Badge unlocked: An Open Door" → "+ Badge: An Open Door". */
function extraLine(kind: CelebrationKind, title: string): string {
  const m = /^badge unlocked:\s*(.+)$/i.exec(title);
  if (m) return `+ Badge: ${m[1]}`;
  if (kind === "levelup") return `+ ${title}`;
  return `+ ${title}`;
}

type Item = {
  id: number;
  kind: CelebrationKind;
  title: string;
  body: string;
  mascot: MascotName;
  mood: MascotMood;
  origin?: Origin;
  /** Calm setting or OS reduced motion: no particles, fades, still mascot, sprig. */
  calm: boolean;
  quiet: boolean;
  /** Lines merged in from badges/levels that unlocked during this moment. */
  extras: string[];
  /** When it was requested (ms epoch). */
  at: number;
};

const CelebrationContext = createContext<CelebrateApi | null>(null);

const FALLBACK: CelebrateApi = {
  celebrate: () => {
    if (process.env.NODE_ENV !== "production") console.warn("useCelebrate(): <CelebrationProvider> is not mounted.");
  },
  dismiss: () => {},
};

/**
 * Mount once in the signed-in layout (src/app/(app)/layout.tsx). Renders celebrations into a
 * portal on document.body.
 *
 * One voice at a time (§4.1): a single moment plays at once; the rest wait in a short queue
 * and start 1.4 s after the previous particles finish. Badges or level-ups that unlock while
 * a card is up merge into it as a line instead of stacking a second card. Settings (§4.8):
 * Full = particles + rising card + hopping mascot; Calm (or OS reduced motion) = no
 * particles, the card fades in with a still mascot and a small sprig; Off = screen-reader
 * announcement only.
 */
export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Item | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  /**
   * Particles-only moments anchored to what was just pressed (Plant) play right away when no
   * other particles are in flight, even while a card is resting on screen: the card sits in a
   * corner, the seed pops from the button, and waiting would cut "because you just did X".
   */
  const [spark, setSpark] = useState<Item | null>(null);
  const sparkRef = useRef<Item | null>(null);
  const [said, setSaid] = useState<{ id: number; text: string } | null>(null);
  const nextId = useRef(1);
  const currentRef = useRef<Item | null>(null);
  const startedAt = useRef(0);
  const gateAt = useRef(0);
  /** Id of a card that has started its exit (too late to merge a line into). */
  const closing = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);
  useEffect(() => {
    sparkRef.current = spark;
  }, [spark]);

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

    const quiet = kind === "reject" ? false : (options.quiet ?? false);
    const cur = currentRef.current;

    // A badge/level that unlocks while a card is up joins that card as a line.
    if ((kind === "achievement" || kind === "levelup") && !quiet && cur && !cur.quiet && cur.kind !== "reject" && closing.current !== cur.id) {
      const line = extraLine(kind, title);
      setCurrent((c) => (c && c.id === cur.id && !c.extras.includes(line) ? { ...c, extras: [...c.extras, line] } : c));
      return;
    }

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
      quiet,
      extras: [],
      at: Date.now(),
    };

    // Immediate lane: a button-anchored burst plays right away, even while a card rests in the
    // corner (they never share space). Only another burst or the rejection note holds it back.
    if (quiet && item.origin && !sparkRef.current && (!cur || (!cur.quiet && cur.kind !== "reject"))) {
      sparkRef.current = item;
      setSpark(item);
      return;
    }

    setQueue((q) => {
      // The same particles-only moment twice in a row (rapid quick-adds) plays once.
      if (quiet && ((cur?.quiet && cur.kind === kind) || sparkRef.current?.kind === kind || q.some((x) => x.quiet && x.kind === kind))) return q;
      // Only one rejection note waits at a time.
      const rest = kind === "reject" ? q.filter((x) => x.kind !== "reject") : q;
      return [...rest, item].slice(-4);
    });
  }, []);

  const dismiss = useCallback(() => {
    setQueue([]);
    setCurrent(null);
    gateAt.current = Date.now() + 300;
  }, []);

  // Start the next moment once nothing is playing and the gap has passed.
  useEffect(() => {
    if (current || spark || queue.length === 0) return;
    const wait = Math.max(0, gateAt.current - Date.now());
    const t = window.setTimeout(() => {
      const now = Date.now();
      const fresh = queue.filter((i) => !(i.quiet && now - i.at > STALE_MS + wait));
      const [head, ...rest] = fresh;
      setQueue(rest);
      if (head) {
        startedAt.current = now;
        setCurrent(head);
      }
    }, wait);
    return () => window.clearTimeout(t);
  }, [current, spark, queue]);

  const finish = useCallback((id: number) => {
    setCurrent((c) => {
      if (!c || c.id !== id) return c;
      const hadFx = !c.calm && !!PLANS[c.kind].fx;
      const fxEnd = startedAt.current + (hadFx ? FX_TOTAL_MS : 0);
      gateAt.current = Math.max(hadFx ? fxEnd + GAP_MS : 0, Date.now() + 300);
      return null;
    });
  }, []);

  const sparkDone = useCallback((id: number) => {
    setSpark((s) => {
      if (!s || s.id !== id) return s;
      gateAt.current = Math.max(gateAt.current, Date.now() + 300);
      return null;
    });
  }, []);

  const leaving = useCallback((id: number) => {
    closing.current = id;
  }, []);

  const api = useMemo(() => ({ celebrate, dismiss }), [celebrate, dismiss]);

  return (
    <CelebrationContext.Provider value={api}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {said ? <p key={said.id}>{said.text}</p> : null}
      </div>
      {current ? createPortal(<Moment key={current.id} item={current} onDone={finish} onLeaving={leaving} />, document.body) : null}
      {spark ? <Moment key={spark.id} item={spark} onDone={sparkDone} onLeaving={leaving} /> : null}
    </CelebrationContext.Provider>
  );
}

/** Plays one moment: particles, and the card or rejection note. */
function Moment({ item, onDone, onLeaving }: { item: Item; onDone: (id: number) => void; onLeaving: (id: number) => void }) {
  const medalRef = useRef<HTMLDivElement>(null);
  const { id } = item;
  const close = useCallback(() => onDone(id), [onDone, id]);
  const leaving = useCallback(() => onLeaving(id), [onLeaving, id]);
  const done = useEffectEvent(() => close());
  const { kind, calm, quiet, origin } = item;

  // Particles (or the calm flourish). Without an explicit origin they come from the card's mascot.
  useEffect(() => {
    if (kind === "reject") return;
    const plan = PLANS[kind];
    const spawn = calm ? plan.calmFx : plan.fx;
    let stop = () => {};
    // Wait a frame so the card has laid out before measuring its mascot.
    const raf = window.requestAnimationFrame(() => {
      const from = origin ?? resolveOrigin(medalRef.current && !quiet ? medalRef.current : undefined);
      const stops = [spawn ? runFx(spawn(from), { z: 80 }) : null, !calm && plan.fxTop ? runFx(plan.fxTop(from), { z: 86 }) : null];
      stop = () => stops.forEach((s) => s?.());
    });
    // Particles-only moments end when their particles do.
    const t = quiet ? window.setTimeout(() => done(), calm ? 1400 : FX_TOTAL_MS) : 0;
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
      stop();
    };
  }, [kind, calm, quiet, origin]);

  if (kind === "reject") {
    return (
      <RainThenRainbow
        open
        calm={calm}
        title={item.title}
        body={item.body}
        mascot={item.mascot}
        duration={1200 + readingHold(item.title, item.body)}
        onClose={close}
      />
    );
  }
  if (quiet) return null;
  return <CardDock item={item} medalRef={medalRef} onLeaving={leaving} onDone={close} />;
}

/** Desktop: top-right. Phones: docked above the tab bar (so it never covers the page title). */
type CardProps = { item: Item; medalRef: RefObject<HTMLDivElement | null>; onLeaving: () => void; onDone: () => void };

function CardDock({ item, medalRef, onLeaving, onDone }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Client-only (rendered into a portal after an event), so reading the window here is safe.
  const [narrow] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  // Sit above whatever bottom UI is already up (undo bar, save bar); toasts then stack above us.
  const [below] = useState(
    () => (narrow && getComputedStyle(document.documentElement).getPropertyValue("--bottom-ui-h").trim()) || "0px",
  );
  useBottomUi(ref, narrow);
  return (
    <div
      data-motion-priority=""
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--dock-bottom)+0.75rem+var(--fx-below,0px))] z-[85] flex justify-center px-4 md:top-0 md:bottom-auto md:justify-end md:pr-6 md:pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ "--fx-below": below } as CSSProperties}
    >
      <div ref={ref} className="w-full max-w-sm">
        <CelebrationCard item={item} medalRef={medalRef} onLeaving={onLeaving} onDone={onDone} />
      </div>
    </div>
  );
}

const SPARKLES = [
  { a: -150, d: 0 },
  { a: -95, d: 70 },
  { a: -40, d: 140 },
  { a: 20, d: 210 },
  { a: 160, d: 280 },
] as const;

function CelebrationCard({ item, medalRef, onLeaving, onDone }: CardProps) {
  const [leaving, setLeaving] = useState(false);
  const [pinned, setPinned] = useState(false);
  const leave = useEffectEvent(() => setLeaving(true));
  const finish = useEffectEvent(() => onDone());
  const announceLeaving = useEffectEvent(() => onLeaving());
  const { kind, calm } = item;
  const hold = Math.min(6000, readingHold(item.title, item.body, ...item.extras) + item.extras.length * 900);

  // Hold for reading time; hovering or focusing the card pauses it.
  useEffect(() => {
    if (pinned || leaving) return;
    const t = window.setTimeout(() => leave(), hold);
    return () => window.clearTimeout(t);
  }, [pinned, leaving, hold]);

  useEffect(() => {
    if (!leaving) return;
    announceLeaving();
    const t = window.setTimeout(() => finish(), 200);
    return () => window.clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const medal = MEDAL.has(kind);
  const tone =
    kind === "offer" || kind === "levelup"
      ? "border-sun/70 bg-gradient-to-br from-card to-sun-soft"
      : kind === "interview"
        ? "border-coral/50 bg-card"
        : "border-moss/40 bg-card";

  return (
    <div
      className={`${styles.card} ${leaving ? styles.leave : calm ? styles.fade : styles.rise} pointer-events-auto flex w-full items-center gap-3 rounded-3xl border p-2.5 pr-2 shadow-lift ${tone}`}
      onPointerEnter={() => setPinned(true)}
      onPointerLeave={() => setPinned(false)}
      onFocusCapture={() => setPinned(true)}
      onBlurCapture={() => setPinned(false)}
    >
      <div
        ref={medalRef}
        className={`${styles.medal} ${medal && !calm ? styles.pop : ""} grid size-14 shrink-0 place-items-center ${medal ? "bg-sun-soft ring-1 ring-sun/40" : ""}`}
      >
        <Mascot
          name={item.mascot}
          mood={item.mood}
          animate={!calm}
          enter={!calm && !medal}
          className={medal ? "size-12" : "size-14"}
        />
        {medal && !calm ? (
          <>
            <span aria-hidden className={styles.sheenClip}>
              <span className={styles.sheen} />
            </span>
            {SPARKLES.map((s) => {
              const r = (s.a * Math.PI) / 180;
              return (
                <svg
                  key={s.a}
                  aria-hidden
                  viewBox="-6 -6 12 12"
                  className={styles.sparkle}
                  style={{ left: `${50 + Math.cos(r) * 58}%`, top: `${50 + Math.sin(r) * 58}%`, animationDelay: `${300 + s.d}ms` }}
                >
                  <path d="M0-6 L1.4-1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4-1.4Z" fill="currentColor" />
                </svg>
              );
            })}
          </>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="flex items-center gap-1.5 font-display text-lg font-semibold leading-tight">
          <span className="min-w-0">{item.title}</span>
          {calm ? <Sprig /> : null}
        </p>
        {item.body ? <p className="mt-0.5 text-sm leading-snug text-ink-soft">{item.body}</p> : null}
        {item.extras.map((line) => (
          <p key={line} className={`${styles.extra} mt-1 text-sm font-medium leading-snug text-moss`}>
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLeaving(true)}
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

/** The calm flourish: a 14 px leaf sprig beside the title. */
function Sprig() {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className={`${styles.sprig} size-3.5 shrink-0`}>
      <path d="M3 13 C4.5 9.5 6.5 7 11 4" fill="none" stroke="var(--moss)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.2 8.6 C4.4 8.9 2.6 7.9 2.1 6 C4 5.6 5.8 6.6 6.2 8.6 Z" fill="var(--leaf)" />
      <path d="M8.6 6.4 C8.2 4.6 9.2 2.8 11.2 2.1 C11.7 4 10.6 5.9 8.6 6.4 Z" fill="var(--leaf)" />
    </svg>
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
 * (e.g. render it when `?celebrate=plant` is present). `onceKey` makes it play once per
 * device (localStorage), so reloads and new sessions don't replay it.
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
        if (window.localStorage.getItem(key)) return;
        window.localStorage.setItem(key, "1");
      } catch {
        // Storage blocked: celebrate anyway.
      }
    }
    fire();
  }, [onceKey]);
  return null;
}
