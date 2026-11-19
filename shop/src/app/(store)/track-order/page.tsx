import { TrackOrderForm } from "@/components/commerce/TrackOrderForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro } from "@/components/sections/InfoSections";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({
  title: "Track your order",
  description: "Track your Cartzee order with your order number and mobile number. No login needed.",
  path: paths.track(),
});

type Props = { searchParams: Promise<{ order?: string }> };

export default async function TrackOrderPage({ searchParams }: Props) {
  const order = (await searchParams).order?.slice(0, 20) ?? "";
  return (
    <Container width="narrow" className="pb-16">
      <Breadcrumbs items={[{ label: "Track order" }]} />
      <AnswerIntro
        title="Track your order"
        answer="Enter your order number (it starts with CS and is in your confirmation email) and the mobile number you used at checkout to see your order's latest status."
      />
      <TrackOrderForm defaultOrder={order} />
    </Container>
  );
}
