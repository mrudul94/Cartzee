import { HomeSections } from "@/components/sections/HomeSections";
import { repo } from "@/lib/data";
import { getHome, getSettings, getStoreFaqs } from "@/lib/data/content-repo";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Kitchen, Storage & Cleaning Essentials Online",
  description: site.description,
  path: "/",
});

/** Homepage: sections, banners and their order come from Admin → Homepage. */
export default async function HomePage() {
  const [home, categories, posts, faqs, settings] = await Promise.all([getHome(), repo.listCategories(), repo.listPosts(), getStoreFaqs(), getSettings()]);
  return <HomeSections sections={home.sections} autoCategoryRows={!home.categoryRowsManaged} ctx={{ categories, posts, faqs, settings }} />;
}
