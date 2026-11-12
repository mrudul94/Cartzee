import { SearchBox } from "@/components/commerce/SearchBox";
import { Section } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { paths } from "@/lib/utils/paths";

/** 404 body: message, search and helpful links. */
export function NotFoundContent() {
  return (
    <Section spacing="lg" containerWidth="narrow">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-heading text-5xl font-semibold text-primary">404</p>
        <h1 className="font-heading text-3xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="text-text-muted">The link may be old or the product may have moved. Try a search or start from our bestsellers.</p>
        <SearchBox id="search-404" size="lg" className="max-w-modal" />
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={paths.home()} variant="secondary">
            Go to homepage
          </Button>
          <Button href={paths.bestsellers()} variant="outline">
            Shop bestsellers
          </Button>
        </div>
      </div>
    </Section>
  );
}
