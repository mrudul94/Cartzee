import type { Instrumentation } from "next";

/**
 * Server crashes (pages, API routes, server actions) → Admin → Site logs.
 * `digest` matches the "Error code" shoppers see on the crash screen, so a report can be traced to its log.
 * Note: Cloudflare-level failures (e.g. "exceeded CPU time limit") stop the Worker before this runs;
 * those appear only in the Cloudflare dashboard (Workers → cartzee-shop → Logs).
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { recordLog } = await import("@/lib/site-log");
    const e = (err instanceof Error ? err : new Error(String(err))) as Error & { digest?: string };
    // Next's redirect()/notFound() are thrown on purpose and are not crashes.
    if (e.digest?.startsWith("NEXT_REDIRECT") || e.digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK") || e.digest === "NEXT_NOT_FOUND") return;
    const headers = request.headers as Record<string, string | string[] | undefined>;
    const ua = headers["user-agent"];
    await recordLog({
      level: "error",
      source: "server",
      path: request.path,
      message: `${e.name}: ${e.message}`,
      detail: [
        e.digest ? `digest: ${e.digest}` : "",
        `${request.method} ${context.routeType} ${context.routePath} (${context.routerKind}${context.renderSource ? `, ${context.renderSource}` : ""})`,
        e.stack ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
      userAgent: Array.isArray(ua) ? ua[0] : ua,
    });
  } catch (e) {
    console.error("[instrumentation] could not record error", e);
  }
};
