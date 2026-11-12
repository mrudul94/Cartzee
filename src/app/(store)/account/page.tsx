import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro } from "@/components/sections/InfoSections";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({ title: "Your account", description: "Track orders and manage your details.", path: paths.login(), noindex: true });

/** Placeholder until Supabase Auth (Milestone B/C). Checkout and tracking already work without an account. */
export default function AccountPage() {
  return (
    <Container width="narrow" className="pb-16">
      <Breadcrumbs items={[{ label: "Account" }]} withJsonLd={false} />
      <AnswerIntro title="Your account" answer="You don't need an account to shop or track orders. Use your order number and mobile number to check status anytime." />
      <div className="flex flex-wrap gap-3">
        <Button href={paths.track()} variant="secondary">
          Track an order
        </Button>
        <Button href={paths.contact()} variant="outline">
          Contact customer care
        </Button>
      </div>
    </Container>
  );
}
