import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { GuideCards } from "@/components/sections/GuideCards";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;
export const metadata = buildMetadata({
  title: "Home Buying Guides",
  description: "Practical buying guides for Indian homes: storage containers, spin mops, bathroom organisation and more.",
  path: paths.guides(),
});

export default async function GuidesPage() {
  const posts = await repo.listPosts();
  return (
    <>
      <Container>
        <Breadcrumbs items={[{ label: "Guides" }]} />
      </Container>
      <GuideCards title="Home buying guides" posts={posts} asPage />
    </>
  );
}
