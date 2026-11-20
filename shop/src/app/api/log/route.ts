import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIpHash } from "@/lib/auth/rate-limit";
import { background } from "@/lib/background";
import { recordLog, tooManyReports } from "@/lib/site-log";

/**
 * POST /api/log — a shopper's browser reports a crash or script error (see ErrorReporter / error pages).
 * Public, so input is size-limited and each visitor (hashed IP) is capped per 10 minutes.
 * Always answers 204 so a broken page never gets a second error from its own report.
 */
const schema = z.object({
  level: z.enum(["error", "warn"]).default("error"),
  message: z.string().max(1000),
  detail: z.string().max(8000).optional(),
  path: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const text = await req.text().catch(() => "");
  if (text.length > 12_000) return new NextResponse(null, { status: 204 });
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* ignored below */
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const ipHash = await clientIpHash(req.headers);
  const userAgent = req.headers.get("user-agent") ?? "";
  await background("browser error log", async () => {
    if (await tooManyReports(ipHash)) return;
    await recordLog({ ...parsed.data, source: "browser", userAgent, ipHash });
  });
  return new NextResponse(null, { status: 204 });
}
