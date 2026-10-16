"use client";

import { useEffect, useEffectEvent } from "react";

import { useCelebrate } from "@/components/fx";

/**
 * Celebrates a fresh offer exactly once per application on this device
 * (localStorage), the first time home is opened after it was recorded.
 * Respects the user's celebration intensity and reduced motion via the FX layer.
 */
export function OfferCelebration({ id, company }: { id: string; company: string }) {
  const { celebrate } = useCelebrate();
  const fire = useEffectEvent(() =>
    celebrate("offer", {
      title: `An offer from ${company}!`,
      body: "Take a moment before the next spreadsheet. Miso brought snacks.",
      mascot: "miso",
      mood: "cheer",
    }),
  );

  useEffect(() => {
    const key = `canopy:home:offer-celebrated:${id}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      return; // Storage blocked: skip rather than replay on every visit.
    }
    // Mark as celebrated only once it actually plays (StrictMode re-runs effects).
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(key, "1");
      } catch {}
      fire();
    }, 600);
    return () => window.clearTimeout(t);
  }, [id]);

  return null;
}
