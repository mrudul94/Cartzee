/**
 * Browser-side crash reporting for Admin → Site logs. Safe to call anywhere in client code: it never throws,
 * sends at most MAX_PER_PAGE reports per page load and skips repeats of the same message.
 */
const MAX_PER_PAGE = 5;
let sent = 0;
const seen = new Set<string>();

export function reportError(message: string, detail = "", level: "error" | "warn" = "error"): void {
  try {
    if (typeof window === "undefined" || sent >= MAX_PER_PAGE) return;
    const key = `${message}|${location.pathname}`;
    if (seen.has(key)) return;
    seen.add(key);
    sent++;
    const body = JSON.stringify({
      level,
      message: message.slice(0, 1000),
      detail: detail.slice(0, 8000),
      path: (location.pathname + location.search).slice(0, 500),
    });
    // sendBeacon survives the page being closed; fetch keepalive is the fallback.
    if (!navigator.sendBeacon?.("/api/log", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/log", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* reporting must never break the page */
  }
}

export function describeError(e: unknown): { message: string; detail: string } {
  if (e instanceof Error) return { message: `${e.name}: ${e.message}`, detail: e.stack ?? "" };
  try {
    return { message: typeof e === "string" ? e : JSON.stringify(e), detail: "" };
  } catch {
    return { message: String(e), detail: "" };
  }
}
