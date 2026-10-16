const FALLBACK = "/home";
const BASE = "http://canopy.invalid";

/**
 * Only allow same-origin, path-relative redirects after sign-in.
 *
 * Browsers strip tabs and newlines while parsing URLs, so "/\t/evil.com"
 * resolves to "https://evil.com/". Reject control characters and backslashes
 * outright, then resolve against a fixed base and make sure the origin did
 * not change and the result is not protocol-relative.
 */
export function safeNext(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  if (!raw.startsWith("/") || /[\u0000-\u001F\u007F\\]/.test(raw)) return FALLBACK;
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return FALLBACK;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("//") ? FALLBACK : path;
  } catch {
    return FALLBACK;
  }
}
