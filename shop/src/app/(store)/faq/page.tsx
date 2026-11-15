import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro, CustomerCare, FAQSection } from "@/components/sections/InfoSections";
import { getSettings, getStoreFaqs } from "@/lib/data/content-repo";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Frequently asked questions",
  description: "Answers about payment, delivery, returns and order tracking at City Seller.",
  path: paths.faq(),
});

/** Store FAQs, editable in Admin → Pages. */
export default async function FaqPage() {
  const [faqs, { care, delivery }] = await Promise.all([getStoreFaqs(), getSettings()]);
  return (
    <>
      <Container width="narrow">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <AnswerIntro
          title="Frequently asked questions"
          answer={`${site.name} is a prepaid-only online store for home needs. Orders reach most of India in 4 to 8 days, with free delivery above ${formatINR(delivery.freeAbove)} and replacements for damaged items.`}
        />
      </Container>
      <FAQSection title="Orders, payment and delivery" faqs={faqs} spacing="sm" />
      <CustomerCare care={care} />
    </>
  );
}
