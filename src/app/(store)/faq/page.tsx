import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AnswerIntro, CustomerCare, FAQSection } from "@/components/sections/InfoSections";
import { storeFaqs } from "@/lib/seed/faqs";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({
  title: "Frequently asked questions",
  description: "Answers about payment, delivery, returns and order tracking at City Seller.",
  path: paths.faq(),
});

export default function FaqPage() {
  return (
    <>
      <Container width="narrow">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <AnswerIntro
          title="Frequently asked questions"
          answer="City Seller is a prepaid-only online store for home needs. Orders reach most of India in 4 to 8 days, with free delivery above ₹499 and replacements for damaged items."
        />
      </Container>
      <FAQSection title="Orders, payment and delivery" faqs={storeFaqs} spacing="sm" />
      <CustomerCare />
    </>
  );
}
