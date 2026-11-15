import type { Post } from "@/lib/types";

/** Buying guides ("best X for Y") that link to products. Production source: `blog_posts`. */
export const seedPosts: Post[] = [
  {
    slug: "best-storage-containers-for-indian-kitchens",
    title: "Best Storage Containers for Indian Kitchens (2026 Guide)",
    excerpt: "Airtight jars, glass spice sets or steel dabbas? Here is how to pick containers that keep dal, atta and masalas fresh.",
    cover: "/placeholders/guides/storage-containers.svg",
    author: "City Seller Team",
    publishedAt: "2026-10-02",
    updatedAt: "2026-11-01",
    body: [
      { type: "p", text: "The best storage container for an Indian kitchen is airtight, food-safe and sized for how much you buy each month. For most homes that means a set of 1 to 1.5 L airtight jars for staples and small glass jars for spices." },
      { type: "h2", text: "Plastic, glass or steel?" },
      { type: "p", text: "BPA-free PET is light and shows what is inside, which makes it good for staples you refill often. Glass does not hold smells or turmeric stains, so it suits spices. Steel is the most durable but hides contents, so label it." },
      { type: "h2", text: "What to check before you buy" },
      { type: "p", text: "Look for a silicone gasket in the lid, locking clips on all four sides and a square shape that stacks. Check the capacity against your monthly purchase: a 1 kg pack of dal fits in a 1.2 L jar." },
      { type: "products", slugs: ["airtight-jar-set-6pc", "glass-spice-jar-set-12pc"] },
      { type: "h2", text: "Our pick" },
      { type: "p", text: "For a first pantry upgrade, start with a six-jar airtight set for staples, then add a rotating spice rack next to the stove." },
    ],
    faqs: [
      { q: "Are PET containers safe for food?", a: "Yes, food-grade BPA-free PET is safe for dry foods at room temperature." },
      { q: "How do I stop ants getting into sugar?", a: "Use a jar with a silicone gasket and clips on all sides, and wipe the rim before closing." },
      { q: "Should I wash new containers before use?", a: "Yes, wash in warm soapy water and dry fully before filling." },
    ],
  },
  {
    slug: "how-to-choose-a-spin-mop",
    title: "How to Choose a Spin Mop for Indian Floors",
    excerpt: "Steel or plastic spinner, round or flat head, bucket size: what matters when buying a spin mop for tiles and marble.",
    cover: "/placeholders/guides/spin-mop.svg",
    author: "City Seller Team",
    publishedAt: "2026-09-18",
    updatedAt: "2026-10-20",
    body: [
      { type: "p", text: "Choose a spin mop with a stainless steel spinner, a microfibre head and a bucket of at least 8 L. That combination wrings the mop almost dry, which is what keeps tiles and marble streak-free." },
      { type: "h2", text: "Spinner material" },
      { type: "p", text: "Plastic spinners crack after months of daily use. A steel basket lasts longer and spins more smoothly." },
      { type: "h2", text: "Head and refills" },
      { type: "p", text: "Microfibre heads trap dust and hair better than cotton. Buy a set with at least two refills so one can dry while you use the other." },
      { type: "products", slugs: ["spin-mop-bucket-set", "microfibre-cloth-pack-10"] },
    ],
    faqs: [
      { q: "How often should I change the mop head?", a: "Every 2 to 3 months with daily use, or sooner if it smells after washing." },
      { q: "Can I use phenyl in a spin mop bucket?", a: "Yes, dilute it as the label says. Rinse the bucket after use." },
      { q: "Is a spin mop good for wooden floors?", a: "Yes, if you wring it well so the floor is only slightly damp." },
    ],
  },
  {
    slug: "small-bathroom-organisation-ideas",
    title: "7 No-Drill Organisation Ideas for Small Bathrooms",
    excerpt: "Adhesive corner shelves, hooks and matched dispensers that make a small rented bathroom feel bigger.",
    cover: "/placeholders/guides/bathroom.svg",
    author: "City Seller Team",
    publishedAt: "2026-08-30",
    updatedAt: "2026-10-12",
    body: [
      { type: "p", text: "The fastest way to organise a small bathroom without drilling is to use the corners and the back of the door: adhesive corner shelves for bottles, hooks for towels and a single dispenser set to clear the basin." },
      { type: "h2", text: "Use the corners" },
      { type: "p", text: "Two stacked corner shelves next to the shower hold shampoo, conditioner and body wash, and keep the floor clear." },
      { type: "h2", text: "Hang, don't stack" },
      { type: "p", text: "Steel adhesive hooks hold towels, loofahs and bathrobes. Leave the adhesive to set for 24 hours before loading." },
      { type: "products", slugs: ["bathroom-corner-shelf-2pc", "adhesive-wall-hooks-12pc", "ceramic-soap-dispenser-set"] },
    ],
    faqs: [
      { q: "Will adhesive shelves damage tiles?", a: "No. Warm the pad with a hair dryer to remove it cleanly." },
      { q: "How much can a no-drill shelf hold?", a: "Ours hold 5 kg each on smooth tiles." },
      { q: "What is the best bath mat for safety?", a: "One with a rubber backing that grips wet floors." },
    ],
  },
];
