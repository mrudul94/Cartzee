import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CopyField, MarginText, OrderStatusBadge, OrderTimeline } from "@/components/admin/AdminBits";
import { OrderActions } from "@/components/admin/OrderActions";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { whatsappLink } from "@/lib/admin/whatsapp";
import { repo } from "@/lib/data";
import { adminTransitions } from "@/lib/orders/status";
import { formatDate, formatINR } from "@/lib/utils/format";
import { updateOrderAction } from "../../../actions";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const order = await repo.getOrder((await params).id);
  return { title: order ? `Order ${order.number}` : "Order" };
}

/**
 * Order work screen: copy-ready customer details for Meesho ("Reselling the order? → Yes"),
 * Meesho links per item, expected margin, fulfilment fields, status buttons and history.
 */
export default async function AdminOrderPage({ params }: Props) {
  await requirePermission("orders");
  const order = await repo.getOrder((await params).id);
  if (!order) notFound();
  const a = order.address;
  const fullAddress = [a.line1, a.line2, a.landmark && `Landmark: ${a.landmark}`, `${a.city}, ${a.state} - ${a.pincode}`].filter(Boolean).join("\n");
  const revenue = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const expectedCost = order.items.reduce((s, i) => s + i.meeshoPrice * i.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Orders", href: paths.admin("/orders") }, { label: order.number }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-semibold">Order {order.number}</h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-text-muted">Placed {formatDate(order.createdAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card padding="md">
            <h2 className="mb-1 font-heading text-xl font-semibold">Items to order on Meesho</h2>
            <p className="mb-4 text-sm text-text-muted">On Meesho choose “Reselling the order? → Yes” and enter the customer details below.</p>
            <ul className="flex flex-col divide-y divide-border">
              {order.items.map((i) => (
                <li key={i.productId} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
                    <Image src={i.image || "/placeholders/og-default.svg"} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={i.path} target="_blank" className="font-medium hover:underline">
                      {i.title}
                    </Link>
                    <p className="text-sm text-text-muted">
                      Qty {i.quantity} · sold at {formatINR(i.unitPrice)} · Meesho {formatINR(i.meeshoPrice)} ·{" "}
                      <MarginText price={i.unitPrice} cost={i.meeshoPrice} quantity={i.quantity} className="text-sm" />
                    </p>
                  </div>
                  {i.meeshoUrl ? (
                    <Button href={i.meeshoUrl} target="_blank" size="sm" variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right">
                      Meesho
                    </Button>
                  ) : (
                    <span className="text-sm text-warning">No Meesho link</span>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-base md:grid-cols-4">
              <div>
                <dt className="text-sm text-text-muted">Customer paid</dt>
                <dd className="font-semibold">{formatINR(order.total)}</dd>
              </div>
              <div>
                <dt className="text-sm text-text-muted">Delivery charged</dt>
                <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
              </div>
              <div>
                <dt className="text-sm text-text-muted">Expected Meesho cost</dt>
                <dd>{formatINR(expectedCost)}</dd>
              </div>
              <div>
                <dt className="text-sm text-text-muted">Expected margin</dt>
                <dd>
                  <MarginText price={revenue} cost={expectedCost} />
                </dd>
              </div>
            </dl>
            {order.meeshoCost !== undefined && (
              <p className="mt-2 text-sm">
                Actual Meesho cost {formatINR(order.meeshoCost)} · actual margin{" "}
                <MarginText price={order.total} cost={order.meeshoCost} className="text-sm" />
              </p>
            )}
          </Card>

          <Card padding="md">
            <h2 className="mb-4 font-heading text-xl font-semibold">Update order</h2>
            <OrderActions
              orderId={order.id}
              next={adminTransitions(order.status)}
              defaults={{ meeshoOrderId: order.meeshoOrderId, meeshoCost: order.meeshoCost, trackingUrl: order.trackingUrl }}
              canRefund={Boolean(order.razorpayPaymentId)}
              whatsappHref={whatsappLink(order)}
              action={updateOrderAction}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card padding="md">
            <h2 className="font-heading text-xl font-semibold">Customer (copy to Meesho)</h2>
            <CopyField label="Name" value={a.name} />
            <CopyField label="Phone" value={a.phone} />
            <CopyField label="Address" value={fullAddress} multiline />
            <CopyField label="PIN code" value={a.pincode} />
            <CopyField label="Email" value={a.email} />
          </Card>
          <Card padding="md">
            <h2 className="mb-2 font-heading text-xl font-semibold">Payment & fulfilment</h2>
            <dl className="flex flex-col gap-1 text-base">
              <div className="flex justify-between gap-2"><dt className="text-text-muted">Razorpay payment</dt><dd className="break-all text-right">{order.razorpayPaymentId ?? "–"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-text-muted">Meesho order</dt><dd className="text-right">{order.meeshoOrderId ?? "–"}</dd></div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Tracking</dt>
                <dd className="text-right">{order.trackingUrl ? <a className="underline" href={order.trackingUrl} target="_blank" rel="noopener noreferrer">Open</a> : "–"}</dd>
              </div>
            </dl>
          </Card>
          <Card padding="md">
            <h2 className="mb-4 font-heading text-xl font-semibold">History</h2>
            <OrderTimeline events={order.events} />
          </Card>
        </div>
      </div>
    </div>
  );
}
