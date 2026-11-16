import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { allowMockPayments, config } from "@/lib/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { redirect } from "next/navigation";
import { listSavedAddresses } from "@/lib/addresses";
import { customerAuthEnabled, getCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({ title: "Secure checkout", description: "Enter your delivery address and pay securely.", path: paths.checkout(), noindex: true });

/** Checkout: shoppers must be signed in to place an order (browsing stays open). */
export default async function CheckoutPage() {
  const customer = await getCustomer();
  if (customerAuthEnabled && !customer) redirect("/login?next=/checkout");
  const testKey = config.razorpay.keyId?.startsWith("rzp_test_");
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "Cart", href: paths.cart() }, { label: "Checkout" }]} withJsonLd={false} />
      <h1 className="mb-2 font-heading text-3xl font-semibold">Secure checkout</h1>
      <p className="mb-6 text-text-muted">Prepaid orders only. Your order is confirmed as soon as payment succeeds.</p>
      {(allowMockPayments || testKey) && (
        <p role="note" className="mb-6 rounded-md bg-warning-soft p-4 text-warning">
          {allowMockPayments
            ? "Test mode: Razorpay keys are not configured, so payment is simulated and no money is charged."
            : "Razorpay test mode: use Razorpay test cards or UPI success@razorpay. No real money is charged."}
        </p>
      )}
      <CheckoutForm defaultName={customer?.name} defaultEmail={customer?.email} defaultPhone={customer?.phone} savedAddresses={customer ? await listSavedAddresses() : []} />
    </Container>
  );
}
