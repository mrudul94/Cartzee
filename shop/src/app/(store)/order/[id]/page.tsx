import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderStatusPoller } from "@/components/commerce/OrderStatusPoller";
import { PurchaseTracker } from "@/components/commerce/PurchaseTracker";
import { OrderSelfService } from "@/components/commerce/OrderSelfService";
import { ReviewForm } from "@/components/commerce/ReviewForm";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { repo } from "@/lib/data";
import { getCustomer } from "@/lib/customer";
import { customerOrderOptions, STATUS_LABEL } from "@/lib/orders/status";
import { cancelOrderAction, requestCancellationAction, requestReturnAction, submitReviewAction } from "./actions";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/data/content-repo";
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
  const [{ care, delivery }, customer] = await Promise.all([getSettings(), getCustomer().catch(() => null)]);
  const paid = order.status !== "pending_payment";
  const closed = order.status === "cancelled_refunded" || order.status === "returned_refunded";
  // Cancel/return buttons only for the signed-in shopper who placed this order.
  const isOwner = Boolean(customer && order.customerUserId === customer.id);
  const options = isOwner ? customerOrderOptions(order, delivery.returnWindowDays) : null;
  // Reviews: the shopper who received this order can rate each item once.
  const canReview = isOwner && ["delivered", "return_requested", "returned_refunded"].includes(order.status);
  const reviewed = canReview ? new Set(await repo.reviewedProductIds(order.id)) : new Set<string>();
  const eta = estimateDelivery(order.address.pincode, new Date(order.createdAt));

  return (
    <Container width="narrow" className="flex flex-col gap-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 aria-hidden className={closed ? "h-16 w-16 text-text-muted" : paid ? "h-16 w-16 text-success" : "h-16 w-16 text-warning"} />
        <h1 className="font-heading text-3xl font-semibold">
          {!paid ? "Waiting for payment confirmation" : order.status === "paid" ? "Thank you, your order is confirmed!" : `Order ${order.number}: ${STATUS_LABEL[order.status]}`}
        </h1>
        <p className="text-text-muted">
          Order <strong className="text-text">{order.number}</strong> · {STATUS_LABEL[order.status]}
        </p>
        {!paid && <OrderStatusPoller />}
        {paid && (
          <PurchaseTracker
            orderNumber={order.number}
            total={order.total}
            shipping={order.shipping}
            items={order.items.map((i) => ({ id: i.productId, title: i.title, price: i.unitPrice, quantity: i.quantity }))}
          />
        )}
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
            <li key={`${i.productId}-${i.size ?? ""}`} className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
                <Image src={i.image || "/logo/mark.png"} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="flex-1">
                {i.title}{i.size && <span className="text-text-muted"> · Size {i.size}</span>} <span className="text-text-muted">× {i.quantity}</span>
              </span>
              <span className="font-semibold">{formatINR(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} />
      </Card>

      {canReview && (
        <Card padding="md" id="review" className="flex flex-col gap-4 scroll-mt-32">
          <div>
            <h2 className="font-heading text-xl font-semibold">Rate your purchase</h2>
            <p className="text-sm text-text-muted">Your review helps other shoppers. It appears with a &quot;Verified purchase&quot; badge after a quick check.</p>
          </div>
          <ul className="flex flex-col gap-6">
            {order.items.filter((i, n, all) => all.findIndex((x) => x.productId === i.productId) === n).map((i) => (
              <li key={i.productId} className="flex flex-col gap-3 border-t border-border pt-4 first:border-0 first:pt-0">
                <p className="flex items-center gap-3 font-semibold">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-background">
                    <Image src={i.image || "/logo/mark.png"} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  {i.title}
                </p>
                {reviewed.has(i.productId) ? (
                  <p className="text-sm text-success">✓ Thanks for your review!</p>
                ) : (
                  <ReviewForm orderId={order.id} productId={i.productId} productTitle={i.title} action={submitReviewAction} />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {options && (
        <OrderSelfService
          orderId={order.id}
          options={options}
          cancel={cancelOrderAction}
          requestCancel={requestCancellationAction}
          requestReturn={requestReturnAction}
        />
      )}

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
        Questions? Call {care.phone} or email {care.email} ({care.hours}).
      </p>
    </Container>
  );
}
