import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

/** Header account menu: whether a shopper is signed in, and their first name. Never cached. */
export async function GET() {
  const customer = await getCustomer().catch(() => null);
  return NextResponse.json(customer ? { signedIn: true, name: customer.name } : { signedIn: false }, { headers: { "Cache-Control": "private, no-store" } });
}
