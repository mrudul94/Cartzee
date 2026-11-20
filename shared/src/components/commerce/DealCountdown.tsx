"use client";

import { useEffect, useState } from "react";
import { hms, msUntilMidnightIST } from "@/lib/utils/deals";

/** "13 : 28 : 53 left" until today's deals end (midnight IST). Renders nothing until mounted (no clock mismatch). */
export function DealCountdown({ className }: { className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(msUntilMidnightIST());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return null;
  const [h, m, s] = hms(left);
  const box = "inline-flex min-w-8 justify-center rounded-sm bg-ink px-1 py-0.5 text-sm font-bold tabular-nums text-text-inverse";
  return (
    <span className={className} role="timer" aria-label={`Deals end in ${Number(h)} hours ${Number(m)} minutes`}>
      <span aria-hidden className="inline-flex items-center gap-1 text-sm font-medium text-text-muted">
        <span className={box}>{h}</span>:<span className={box}>{m}</span>:<span className={box}>{s}</span>
        <span className="ml-1">left</span>
      </span>
    </span>
  );
}
