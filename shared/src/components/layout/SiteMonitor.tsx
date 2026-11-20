"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { describeError, reportError } from "@/lib/utils/report-error";

const PING_MS = 60_000;

function tabId(): string {
  try {
    let id = sessionStorage.getItem("cz_sid");
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      sessionStorage.setItem("cz_sid", id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Invisible: reports uncaught script errors to Admin → Site logs, and pings /api/presence about once a minute
 * while the tab is visible (for "Visitors now"). Hidden tabs don't ping, so they drop out of the count.
 */
export function SiteMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      // Errors from browser extensions or other sites' scripts arrive without a file from this site: skip them.
      if (e.filename && !e.filename.startsWith(location.origin)) return;
      const d = describeError(e.error ?? e.message);
      reportError(d.message || e.message, d.detail || `${e.filename}:${e.lineno}:${e.colno}`);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const d = describeError(e.reason);
      reportError(`Unhandled promise: ${d.message}`, d.detail);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    const sid = tabId();
    if (!sid) return;
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      const body = JSON.stringify({ sid, path: (location.pathname + location.search).slice(0, 500) });
      void fetch("/api/presence", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
    };
    ping();
    const timer = window.setInterval(ping, PING_MS);
    const onVisible = () => document.visibilityState === "visible" && ping();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
