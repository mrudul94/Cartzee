import { NextResponse } from "next/server";
import { z } from "zod";
import { background } from "@/lib/background";
import { recordPresence } from "@/lib/site-log";

/**
 * POST /api/presence — an open shop tab says "still here" about once a minute (see PresencePing).
 * Feeds "Visitors now" in Admin → Site logs. Stores only a random per-tab id and the page path.
 */
const schema = z.object({
  sid: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  path: z.string().max(500).default("/"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (parsed.success) await background("presence", () => recordPresence(parsed.data.sid, parsed.data.path));
  return new NextResponse(null, { status: 204 });
}
