"use client";

import { useSyncExternalStore } from "react";

import { radioKeyNav } from "@/lib/radio-keys";

const KEY = "canopy:theme";
type Theme = "light" | "dark" | "system";

/** Runs before paint so the saved theme never flashes. */
export function ThemeScript() {
  const code = `try{var t=localStorage.getItem(${JSON.stringify(KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setTheme(theme: Theme) {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {}
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "system");
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "Day" },
    { value: "system", label: "Auto" },
    { value: "dark", label: "Night" },
  ];
  return (
    <div role="radiogroup" aria-label="Color theme" className={`inline-flex rounded-full border border-line bg-paper-2 p-1 text-xs ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={theme === o.value}
          tabIndex={theme === o.value ? 0 : -1}
          onClick={() => setTheme(o.value)}
          onKeyDown={(e) => radioKeyNav(e, options.map((x) => x.value), theme, setTheme)}
          className={`rounded-full px-3 py-2.5 font-medium transition-colors sm:py-1.5 ${
            theme === o.value ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
