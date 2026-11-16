import { AddressBook } from "@/components/account/AddressBook";
import { listSavedAddresses } from "@/lib/addresses";
import { buildMetadata } from "@/lib/seo/metadata";
import { deleteAddressAction, saveAddressAction, setDefaultAddressAction } from "../actions";

export const metadata = buildMetadata({ title: "Saved addresses", description: "Delivery addresses saved to your account.", path: "/account/addresses", noindex: true });

export default async function AddressesPage() {
  const addresses = await listSavedAddresses();
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Saved addresses</h1>
        <p className="text-text-muted">Your default address is filled in for you at checkout.</p>
      </div>
      <AddressBook addresses={addresses} save={saveAddressAction} remove={deleteAddressAction} makeDefault={setDefaultAddressAction} />
    </>
  );
}
