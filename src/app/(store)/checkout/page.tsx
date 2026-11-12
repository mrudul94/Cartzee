import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { allowMockPayments, config } from "@/lib/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({ title: "Secure checkout", description: "Enter your delivery address and pay securely.", path: paths.checkout(), noindex: true });

export default function CheckoutPage() {
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
      <CheckoutForm />
    </Container>
  );
}
