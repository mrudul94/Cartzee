const IST_OFFSET_MS = 5.5 * 3_600_000;

/** Milliseconds until the next midnight in India (deals reset daily at 00:00 IST). */
export function msUntilMidnightIST(now: Date = new Date()): number {
  const ist = now.getTime() + IST_OFFSET_MS;
  const day = 86_400_000;
  return day - (((ist % day) + day) % day);
}

/** Splits a duration into zero-padded hours, minutes and seconds. */
export function hms(ms: number): [string, string, string] {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")) as [string, string, string];
}
