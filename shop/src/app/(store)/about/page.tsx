import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/ContentPage";
import { ValueProps } from "@/components/sections/InfoSections";
import { DEFAULT_HOME } from "@/lib/content/schema";
import { getHome, getPage } from "@/lib/data/content-repo";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return buildMetadata({ title: page.title, description: page.description, path: paths.about() });
}

/** About page: text from Admin → Pages, value props from the homepage's "Why shop with us" section. */
export default async function AboutPage() {
  const [page, home] = await Promise.all([getPage("about"), getHome()]);
  const props = [...home.sections, ...DEFAULT_HOME.sections].find((s) => s.type === "valueProps");
  return (
    <>
      <ContentPage page={page} crumbs={[{ label: "About us" }]} />
      {props?.type === "valueProps" && <ValueProps items={props.items} />}
    </>
  );
}
