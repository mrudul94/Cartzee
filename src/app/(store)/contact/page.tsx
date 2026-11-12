import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro, CustomerCare } from "@/components/sections/InfoSections";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({
  title: "Contact customer care",
  description: `Contact City Seller by phone, WhatsApp or email, ${site.care.hours}.`,
  path: paths.contact(),
});

export default function ContactPage() {
  return (
    <>
      <Container width="narrow">
        <Breadcrumbs items={[{ label: "Contact us" }]} />
        <AnswerIntro
          title="Contact us"
          answer={`Reach City Seller customer care on ${site.care.phone}, on WhatsApp or at ${site.care.email}, ${site.care.hours}. Keep your order number handy for faster help.`}
        />
      </Container>
      <CustomerCare />
    </>
  );
}
