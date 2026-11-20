"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Re-runs the page's server queries every `seconds` while the tab is visible (live numbers without a reload). */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [at, setAt] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setAt(new Date());
    }, seconds * 1000);
    return () => window.clearInterval(t);
  }, [router, seconds]);
  return (
    <p className="text-sm text-text-muted" aria-live="off">
      Updates every {seconds} seconds · last {at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
    </p>
  );
}
