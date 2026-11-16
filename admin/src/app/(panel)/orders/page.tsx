import Link from "next/link";
import { MarginText, OrderStatusBadge } from "@/components/admin/AdminBits";
import { Badge } from "@/components/ui/Badge";
import { ChipNav } from "@/components/ui/ChipNav";
import { DataTable } from "@/components/ui/DataTable";
import { adminRepo } from "@/lib/data/admin-repo";
import { ADMIN_STATUS_LABEL, customerOrderOptions } from "@/lib/orders/status";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string }> };

const revenue = (o: Order) => o.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
const supplierCost = (o: Order) => o.items.reduce((s, i) => s + i.meeshoPrice * i.quantity, 0);

/** Order queue: defaults to paid orders (newest first) that still need placing on Meesho. */
export default async function AdminOrdersPage({ searchParams }: Props) {
  await requirePermission("orders");
  const raw = (await searchParams).status ?? "paid";
  const status = raw === "all" ? undefined : (ORDER_STATUSES as readonly string[]).includes(raw) ? (raw as OrderStatus) : "paid";
  const [orders, counts] = await Promise.all([adminRepo.listOrders(status), adminRepo.orderCounts()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold">Orders</h1>
      <ChipNav
        label="Filter orders by status"
        chips={[
          ...ORDER_STATUSES.map((s) => ({ label: ADMIN_STATUS_LABEL[s], href: paths.admin(`/orders?status=${s}`), active: status === s, count: counts[s] })),
          { label: "All", href: paths.admin("/orders?status=all"), active: !status, count: total },
        ]}
      />
      <DataTable
        caption={status ? `Orders: ${ADMIN_STATUS_LABEL[status]}` : "All orders"}
        rows={orders}
        rowKey={(o) => o.id}
        empty={status === "paid" ? "No paid orders waiting. Nice work!" : "No orders in this status."}
        columns={[
          {
            header: "Order",
            cell: (o) => (
              <Link href={paths.admin(`/orders/${o.id}`)} className="font-semibold text-primary underline underline-offset-4 hover:no-underline" title="Open order: copy address, Meesho links, update status">
                {o.number}
              </Link>
            ),
          },
          { header: "Date", cell: (o) => formatDate(o.createdAt), hideOnMobile: true },
          {
            header: "Customer",
            cell: (o) => (
              <>
                {o.address.name}
                <span className="block text-sm text-text-muted">
                  {o.address.city} {o.address.pincode}
                </span>
              </>
            ),
          },
          { header: "Items", cell: (o) => o.items.reduce((n, i) => n + i.quantity, 0), align: "right", hideOnMobile: true },
          { header: "Total", cell: (o) => formatINR(o.total), align: "right" },
          {
            header: "Est. margin",
            cell: (o) => <MarginText price={revenue(o)} cost={supplierCost(o)} />,
            align: "right",
            hideOnMobile: true,
          },
          {
            header: "Status",
            cell: (o) => (
              <span className="flex flex-wrap items-center gap-1">
                <OrderStatusBadge status={o.status} />
                {customerOrderOptions(o, 0).cancelRequested && <Badge variant="error">Cancel requested</Badge>}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
