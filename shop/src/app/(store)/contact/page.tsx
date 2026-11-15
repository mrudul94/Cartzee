import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro, CustomerCare } from "@/components/sections/InfoSections";
import { getSettings } from "@/lib/data/content-repo";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { care } = await getSettings();
  return buildMetadata({
    title: "Contact customer care",
    description: `Contact ${site.name} by phone, WhatsApp or email, ${care.hours}.`,
    path: paths.contact(),
  });
}

export default async function ContactPage() {
  const { care } = await getSettings();
  return (
    <>
      <Container width="narrow">
        <Breadcrumbs items={[{ label: "Contact us" }]} />
        <AnswerIntro
          title="Contact us"
          answer={`Reach ${site.name} customer care on ${care.phone}, on WhatsApp or at ${care.email}, ${care.hours}. Keep your order number handy for faster help.`}
        />
      </Container>
      <CustomerCare care={care} />
    </>
  );
}
