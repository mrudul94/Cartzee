import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { repo } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/orders/status";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { estimateDelivery } from "@/lib/utils/delivery";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "Order confirmed", description: "Thank you for your order.", path: "/order", noindex: true });

type Props = { params: Promise<{ id: string }> };

/** Order success page. The order id is an unguessable random token, so no login is needed. */
export default async function OrderPage({ params }: Props) {
  const order = await repo.getOrder((await params).id);
  if (!order) notFound();
  const paid = order.status !== "pending_payment";
  const eta = estimateDelivery(order.address.pincode, new Date(order.createdAt));

  return (
    <Container width="narrow" className="flex flex-col gap-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 aria-hidden className={paid ? "h-16 w-16 text-success" : "h-16 w-16 text-warning"} />
        <h1 className="font-heading text-3xl font-semibold">{paid ? "Thank you, your order is confirmed!" : "Waiting for payment confirmation"}</h1>
        <p className="text-text-muted">
          Order <strong className="text-text">{order.number}</strong> · {STATUS_LABEL[order.status]}
        </p>
        {paid && (
          <p className="text-text">
            A confirmation has been sent to <strong>{order.address.email}</strong>.
            {eta && (
              <>
                {" "}
                Expected delivery: <strong>{eta.from}</strong> to <strong>{eta.to}</strong>.
              </>
            )}
          </p>
        )}
      </div>

      <Card padding="md">
        <h2 className="mb-3 font-heading text-xl font-semibold">Items</h2>
        <ul className="mb-4 flex flex-col gap-3">
          {order.items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
                <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="flex-1">
                {i.title} <span className="text-text-muted">× {i.quantity}</span>
              </span>
              <span className="font-semibold">{formatINR(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} />
      </Card>

      <Card padding="md">
        <h2 className="mb-2 font-heading text-xl font-semibold">Delivering to</h2>
        <address className="not-italic text-text-muted">
          {order.address.name}
          <br />
          {order.address.line1}
          {order.address.line2 && `, ${order.address.line2}`}
          <br />
          {order.address.city}, {order.address.state} {order.address.pincode}
        </address>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href={`${paths.track()}?order=${order.number}`} variant="secondary">
          Track this order
        </Button>
        <Button href={paths.home()} variant="outline">
          Continue shopping
        </Button>
      </div>
      <p className="text-center text-sm text-text-muted">
        Questions? Call {site.care.phone} or email {site.care.email} ({site.care.hours}).
      </p>
    </Container>
  );
}
