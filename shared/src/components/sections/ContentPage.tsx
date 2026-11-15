import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import type { ContentPage as Page } from "@/lib/content/pages";
import type { Crumb } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/utils/format";
import { AnswerIntro, FAQSection } from "./InfoSections";

/** Template for policy and info pages: breadcrumb, H1 + direct answer, prose blocks, optional FAQs. */
export function ContentPage({ page, crumbs }: { page: Page; crumbs: Crumb[] }) {
  return (
    <>
      <Container width="narrow" className="pb-12">
        <Breadcrumbs items={crumbs} />
        <AnswerIntro title={page.title} answer={page.answer} meta={`Last updated ${formatDate(page.updated)}`} />
        <article className="prose-body">
          {page.blocks.map((b, i) =>
            b.type === "h2" ? (
              <h2 key={i}>{b.text}</h2>
            ) : b.type === "p" ? (
              <p key={i}>{b.text}</p>
            ) : (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            ),
          )}
        </article>
      </Container>
      {page.faqs && <FAQSection faqs={page.faqs} />}
    </>
  );
}
