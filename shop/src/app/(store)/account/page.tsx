import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro } from "@/components/sections/InfoSections";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { repo } from "@/lib/data";
import { customerAuthEnabled, getCustomer } from "@/lib/customer";
import { STATUS_LABEL } from "@/lib/orders/status";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { signOutCustomerAction } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "My account", description: "Your orders and account.", path: paths.login(), noindex: true });

/** My account: the signed-in shopper's orders. Signed-out visitors are sent to sign in. */
export default async function AccountPage() {
  if (!customerAuthEnabled) {
    return (
      <Container width="narrow" className="pb-16">
        <Breadcrumbs items={[{ label: "Account" }]} withJsonLd={false} />
        <AnswerIntro title="Your account" answer="Accounts are switched off in this local preview. Use your order number and mobile number to track an order." />
        <Button href={paths.track()} variant="secondary">
          Track an order
        </Button>
      </Container>
    );
  }
  const customer = await getCustomer();
  if (!customer) redirect("/login?next=/account");
  const orders = await repo.listOrdersForUser(customer.id);

  return (
    <Container width="narrow" className="flex flex-col gap-6 pb-16">
      <Breadcrumbs items={[{ label: "My account" }]} withJsonLd={false} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Hi{customer.name ? `, ${customer.name.split(" ")[0]}` : ""}</h1>
          <p className="text-text-muted">{customer.email}</p>
        </div>
        <form action={signOutCustomerAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
      <section aria-labelledby="orders-heading" className="flex flex-col gap-3">
        <h2 id="orders-heading" className="font-heading text-2xl font-semibold">
          My orders
        </h2>
        {orders.length === 0 ? (
          <Card padding="md" className="flex flex-col items-start gap-3">
            <p className="text-text-muted">You haven&apos;t placed an order yet.</p>
            <Button href={paths.bestsellers()} variant="secondary">
              Shop bestsellers
            </Button>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={paths.orderSuccess(o.id)} className="block rounded-lg focus-visible:outline-none focus-visible:shadow-focus">
                  <Card padding="md" interactive className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="block font-semibold">Order {o.number}</span>
                      <span className="text-sm text-text-muted">
                        {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} item(s) · {formatINR(o.total)}
                      </span>
                    </span>
                    <Badge variant={o.status === "delivered" ? "success" : o.status === "pending_payment" ? "neutral" : "outline"}>{STATUS_LABEL[o.status]}</Badge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
