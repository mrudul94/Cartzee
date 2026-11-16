import { newSection } from "@/lib/content/new-section";

/** A homepage hero section with one ready-to-save slide (new slides start without a picture). */
export function testHero() {
  const s = newSection("hero");
  if (s.type !== "hero") throw new Error("newSection('hero') must return a hero");
  return { ...s, slides: s.slides.map((sl) => ({ ...sl, image: { src: "/logo/mark.png", alt: "Test hero artwork" } })) };
}
