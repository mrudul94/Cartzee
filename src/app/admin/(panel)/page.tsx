import Link from "next/link";
import { MarginText, OrderStatusBadge, StatCard } from "@/components/admin/AdminBits";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { adminRepo } from "@/lib/data/admin-repo";
import { daysSince, formatDate, formatINR } from "@/lib/utils/format";
import { markPriceCheckedAction } from "../actions";

export const metadata = { title: "Dashboard" };

const STALE_DAYS = 7;

export default async function AdminDashboard() {
  const [orders, counts, products] = await Promise.all([adminRepo.listOrders(), adminRepo.orderCounts(), adminRepo.listProducts()]);
  const paidStatuses = new Set(["paid", "placed_on_meesho", "shipped", "delivered"]);
  const today = new Date().toISOString().slice(0, 10);
  const last30 = orders.filter((o) => paidStatuses.has(o.status) && daysSince(o.createdAt) < 30);
  const revenue30 = last30.reduce((s, o) => s + o.total, 0);
  const margin30 = last30.reduce((s, o) => s + o.items.reduce((m, i) => m + (i.unitPrice - (i.meeshoPrice ?? 0)) * i.quantity, 0), 0);
  const todayCount = orders.filter((o) => paidStatuses.has(o.status) && o.createdAt.slice(0, 10) === today).length;
  const toPlace = orders.filter((o) => o.status === "paid").slice(0, 5);
  const stale = products.filter((p) => p.isActive && daysSince(p.priceCheckedAt) > STALE_DAYS).sort((a, b) => a.priceCheckedAt.localeCompare(b.priceCheckedAt));
  const lowStock = products.filter((p) => p.isActive && p.stock <= 5);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="To place on Meesho" value={counts.paid} tone={counts.paid > 0 ? "warning" : "default"} hint="Paid orders waiting" />
        <StatCard label="In transit" value={counts.placed_on_meesho + counts.shipped} hint={`${counts.return_requested} return request(s)`} />
        <StatCard label="Paid orders today" value={todayCount} />
        <StatCard label="Revenue (30 days)" value={formatINR(revenue30)} hint={`Est. margin ${formatINR(margin30)}`} tone="success" />
      </section>

      <section aria-labelledby="queue-heading">
        <SectionHeader id="queue-heading" title="Next orders to place" viewAllHref="/admin/orders?status=paid" viewAllLabel="Open queue" />
        <DataTable
          caption="Paid orders waiting to be placed on Meesho"
          rows={toPlace}
          rowKey={(o) => o.id}
          empty="All paid orders have been placed."
          columns={[
            { header: "Order", cell: (o) => <Link className="font-semibold underline-offset-4 hover:underline" href={`/admin/orders/${o.id}`}>{o.number}</Link> },
            { header: "Customer", cell: (o) => `${o.address.name}, ${o.address.city}` },
            { header: "Placed", cell: (o) => formatDate(o.createdAt), hideOnMobile: true },
            { header: "Total", cell: (o) => formatINR(o.total), align: "right" },
            { header: "Status", cell: (o) => <OrderStatusBadge status={o.status} />, hideOnMobile: true },
          ]}
        />
      </section>

      <section aria-labelledby="stale-heading">
        <SectionHeader
          id="stale-heading"
          title={`Meesho price not checked in ${STALE_DAYS} days (${stale.length})`}
          subtitle="Open the Meesho link, confirm the price, then mark it checked. Update the product if the cost changed."
        />
        <DataTable
          caption="Products with stale Meesho price"
          rows={stale}
          rowKey={(p) => p.id}
          empty="All Meesho prices were checked in the last week."
          columns={[
            { header: "Product", cell: (p) => <Link className="hover:underline" href={`/admin/products/${p.id}`}>{p.title}</Link> },
            { header: "Last checked", cell: (p) => <span className="text-warning">{daysSince(p.priceCheckedAt)} days ago</span> },
            { header: "Meesho price", cell: (p) => formatINR(p.meeshoPrice), align: "right", hideOnMobile: true },
            { header: "Margin", cell: (p) => <MarginText price={p.price} cost={p.meeshoPrice} />, align: "right", hideOnMobile: true },
            {
              header: "Actions",
              align: "right",
              cell: (p) => (
                <div className="flex justify-end gap-2">
                  {p.meeshoUrl && (
                    <Button href={p.meeshoUrl} target="_blank" size="sm" variant="outline">
                      Open Meesho
                    </Button>
                  )}
                  <form action={markPriceCheckedAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" size="sm" variant="soft">
                      Mark checked
                    </Button>
                  </form>
                </div>
              ),
            },
          ]}
        />
      </section>

      {lowStock.length > 0 && (
        <section aria-labelledby="stock-heading">
          <SectionHeader id="stock-heading" title={`Low stock (${lowStock.length})`} subtitle="Stock of 0 shows “Sold out” in the store. Check availability on Meesho." />
          <DataTable
            caption="Products with low stock"
            rows={lowStock}
            rowKey={(p) => p.id}
            columns={[
              { header: "Product", cell: (p) => <Link className="hover:underline" href={`/admin/products/${p.id}`}>{p.title}</Link> },
              { header: "Stock", cell: (p) => <span className={p.stock === 0 ? "font-semibold text-error" : "text-warning"}>{p.stock}</span>, align: "right" },
            ]}
          />
        </section>
      )}
    </div>
  );
}
