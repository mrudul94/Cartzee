import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/AccountNav";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro } from "@/components/sections/InfoSections";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { customerAuthEnabled, getCustomer } from "@/lib/customer";
import { paths } from "@/lib/utils/paths";

export const dynamic = "force-dynamic";

/**
 * My account shell: sidebar (orders, profile, addresses, password, help, sign out) + the chosen page.
 * The account-shaped placeholder shows immediately while the session is checked.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
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
  return (
    <Suspense fallback={<PageSkeleton variant="account" />}>
      <AccountShell>{children}</AccountShell>
    </Suspense>
  );
}

async function AccountShell({ children }: { children: ReactNode }) {
  const customer = await getCustomer();
  if (!customer) redirect("/login?next=/account");
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "My account" }]} withJsonLd={false} />
      <div className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <AccountNav name={customer.name} email={customer.email} />
        </aside>
        <div className="flex min-w-0 flex-col gap-4 md:col-span-3">{children}</div>
      </div>
    </Container>
  );
}
