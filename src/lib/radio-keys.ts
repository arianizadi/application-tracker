import type { KeyboardEvent } from "react";

/**
 * Arrow/Home/End handling for a custom `role="radiogroup"` of `role="radio"`
 * buttons (WAI-ARIA radio pattern): moves the selection and focus together.
 * Pair it with `tabIndex={selected ? 0 : -1}` so the group is one tab stop.
 */
export function radioKeyNav<T>(e: KeyboardEvent<HTMLElement>, values: readonly T[], current: T, set: (value: T) => void) {
  const i = values.indexOf(current);
  let n = -1;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % values.length;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + values.length) % values.length;
  else if (e.key === "Home") n = 0;
  else if (e.key === "End") n = values.length - 1;
  if (n < 0) return;
  e.preventDefault();
  set(values[n]);
  const radios = e.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLElement>('[role="radio"]');
  radios?.[n]?.focus();
}
