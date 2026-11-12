import { ContentPage } from "@/components/sections/ContentPage";
import { ValueProps } from "@/components/sections/InfoSections";
import { aboutPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({ title: aboutPage.title, description: aboutPage.description, path: paths.about() });

export default function AboutPage() {
  return (
    <>
      <ContentPage page={aboutPage} crumbs={[{ label: "About us" }]} />
      <ValueProps />
    </>
  );
}
