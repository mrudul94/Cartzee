import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { repo } from "@/lib/data";
import { getCustomer } from "@/lib/customer";
import { STATUS_LABEL } from "@/lib/orders/status";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({ title: "My orders", description: "Your City Seller orders.", path: paths.login(), noindex: true });

/** My account → My orders (the layout guarantees a signed-in shopper). */
export default async function AccountOrdersPage() {
  const customer = await getCustomer();
  const orders = customer ? await repo.listOrdersForUser(customer.id) : [];
  return (
    <section aria-labelledby="orders-heading" className="flex flex-col gap-3">
      <h1 id="orders-heading" className="font-heading text-2xl font-semibold">
        My orders
      </h1>
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
  );
}
