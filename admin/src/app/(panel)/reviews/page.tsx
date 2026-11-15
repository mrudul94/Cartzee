import Image from "next/image";
import Link from "next/link";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { RatingStars } from "@/components/commerce/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipNav } from "@/components/ui/ChipNav";
import { contentAdmin } from "@/lib/data/admin-content";
import { formatDate } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { reviewAction } from "../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Reviews" };

type Props = { searchParams: Promise<{ show?: string }> };

/** Approve, hide or delete customer reviews. Only approved reviews appear on product pages. */
export default async function AdminReviewsPage({ searchParams }: Props) {
  await requirePermission("reviews");
  const show = (await searchParams).show === "approved" ? "approved" : "pending";
  const all = await contentAdmin.listReviews();
  const pending = all.filter((r) => !r.isApproved);
  const rows = show === "pending" ? pending : all.filter((r) => r.isApproved);

  const act = (id: string, op: "approve" | "hide" | "delete", label: string, icon: React.ReactNode, variant: "secondary" | "outline" | "ghost") => (
    <form action={reviewAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <Button type="submit" size="sm" variant={variant} icon={icon} className={op === "delete" ? "text-error" : undefined}>
        {label}
      </Button>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Reviews</h1>
        <p className="text-text-muted">Only approved reviews show on product pages. Product star ratings are set on each product.</p>
      </div>
      <ChipNav
        label="Filter reviews"
        chips={[
          { label: "Waiting for approval", href: paths.admin("/reviews"), active: show === "pending", count: pending.length },
          { label: "Approved", href: paths.admin("/reviews?show=approved"), active: show === "approved", count: all.length - pending.length },
        ]}
      />
      {rows.length === 0 ? (
        <Card padding="lg" className="text-center text-text-muted">
          {show === "pending" ? "No reviews waiting for approval." : "No approved reviews yet."}
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card padding="md" className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <RatingStars value={r.rating} />
                  <span className="font-semibold">{r.title}</span>
                  {r.isApproved ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
                </div>
                <p>{r.body}</p>
                {r.photos.length > 0 && (
                  <ul className="flex gap-2">
                    {r.photos.map((src, i) => (
                      <li key={src + i} className="relative h-16 w-16 overflow-hidden rounded-md bg-background">
                        <Image src={src} alt={`Photo ${i + 1} from ${r.author}`} fill sizes="64px" className="object-cover" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-text-muted">
                  {r.author}, {r.city} · {formatDate(r.createdAt)} · on{" "}
                  {r.productPath ? (
                    <Link href={r.productPath} target="_blank" className="underline">
                      {r.productTitle}
                    </Link>
                  ) : (
                    r.productTitle
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!r.isApproved && act(r.id, "approve", "Approve", <Check aria-hidden className="h-4 w-4" />, "secondary")}
                  {r.isApproved && act(r.id, "hide", "Hide", <EyeOff aria-hidden className="h-4 w-4" />, "outline")}
                  {act(r.id, "delete", "Delete", <Trash2 aria-hidden className="h-4 w-4" />, "ghost")}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
