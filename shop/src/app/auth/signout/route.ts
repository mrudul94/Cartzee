import { NextResponse } from "next/server";
import { customerAuthEnabled, customerClient } from "@/lib/customer";

/** Sign-out from the header menu and account sidebar (plain form POST, same-site only). */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const origin = req.headers.get("origin");
  if (origin && origin !== url.origin) return new NextResponse("Forbidden", { status: 403 });
  if (customerAuthEnabled) await (await customerClient()).auth.signOut();
  return NextResponse.redirect(new URL("/", url.origin), 303);
}
