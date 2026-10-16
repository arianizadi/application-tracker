"use client";

import { useCelebrationIntensity, type CelebrationIntensity } from "@/components/fx";

const OPTIONS: { value: CelebrationIntensity; label: string; hint: string }[] = [
  { value: "full", label: "Full", hint: "Leaves, fireflies, mascot cards." },
  { value: "calm", label: "Calm", hint: "Mascot cards, no particles." },
  { value: "off", label: "Off", hint: "Just quiet toasts." },
];

/** Per-device celebration intensity (stored in this browser). */
export function CelebrationControl() {
  const [value, setValue] = useCelebrationIntensity();
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium" id="celebrations-label">Celebrations</p>
        <p className="text-sm text-muted" aria-live="polite">{current.hint} Saved on this device.</p>
      </div>
      <div
        role="radiogroup"
        aria-labelledby="celebrations-label"
        className="inline-flex self-start rounded-full border border-line bg-paper-2 p-1 text-sm"
      >
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => setValue(o.value)}
            className={`min-h-10 rounded-full px-4 font-medium transition-colors ${
              value === o.value ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
