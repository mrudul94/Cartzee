import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PAGE_SLUGS } from "@/lib/content/schema";
import { getPage } from "@/lib/data/content-repo";
import { formatDate } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Pages" };

function Tile({ href, icon, title, note }: { href: string; icon: ReactNode; title: string; note: string }) {
  return (
    <Link href={href} className="block h-full rounded-lg focus-visible:outline-none focus-visible:shadow-focus">
      <Card padding="md" interactive className="flex h-full items-start gap-3">
        {icon}
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="text-sm text-text-muted">{note}</span>
        </span>
      </Card>
    </Link>
  );
}

export default async function AdminPagesList() {
  await requirePermission("content");
  const pages = await Promise.all(PAGE_SLUGS.map((s) => getPage(s)));
  const icon = "mt-1 h-5 w-5 shrink-0 text-text-muted";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Pages</h1>
        <p className="text-text-muted">About us, policies and the store FAQs.</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {pages.map((p) => (
          <li key={p.slug}>
            <Tile href={paths.admin(`/content/pages/${p.slug}`)} icon={<FileText aria-hidden className={icon} />} title={p.title} note={`Last updated ${formatDate(p.updated)}`} />
          </li>
        ))}
        <li>
          <Tile href={paths.admin("/content/faqs")} icon={<HelpCircle aria-hidden className={icon} />} title="Store FAQs" note="Homepage FAQ section and the /faq page" />
        </li>
      </ul>
    </div>
  );
}
