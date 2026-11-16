import "server-only";
import type { SavedAddress } from "@/lib/account";
import { customerAuthEnabled, customerClient } from "@/lib/customer";

type Row = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export const toSavedAddress = (r: Row): SavedAddress => ({
  id: r.id,
  label: r.label,
  name: r.name,
  phone: r.phone,
  line1: r.line1,
  line2: r.line2,
  landmark: r.landmark,
  city: r.city,
  state: r.state,
  pincode: r.pincode,
  isDefault: r.is_default,
});

/** The signed-in shopper's saved addresses (default first). Uses their own session, so RLS limits it to their rows. */
export async function listSavedAddresses(): Promise<SavedAddress[]> {
  if (!customerAuthEnabled) return [];
  const { data, error } = await (await customerClient())
    .from("customer_addresses")
    .select("id, label, name, phone, line1, line2, landmark, city, state, pincode, is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) {
    // Table missing until migration 0008 runs: show an empty address book instead of failing the page.
    console.error("[addresses] list failed", error.message);
    return [];
  }
  return (data as Row[]).map(toSavedAddress);
}
