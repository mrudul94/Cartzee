import type { Review } from "@/lib/types";

/** SAMPLE reviews for development only. Delete before launch; real reviews come from the `reviews` table. */
type Seed = Omit<Review, "id" | "verified" | "photos"> & { photos?: number };

const seeds: Seed[] = [
  { productId: "prd_001", author: "Priya S.", city: "Pune", rating: 5, title: "Pantry finally looks neat", body: "Lids lock firmly and the jars stack well. Sugar has stayed ant-free for a month.", createdAt: "2026-10-12", photos: 2 },
  { productId: "prd_001", author: "Arjun M.", city: "Indore", rating: 4, title: "Good value", body: "Sturdy for the price. Took a minute to get used to the clips.", createdAt: "2026-09-30" },
  { productId: "prd_001", author: "Kavya R.", city: "Kochi", rating: 4, title: "Clear and light", body: "Easy to see what is running low. Hand washing is a bit of effort but fine.", createdAt: "2026-09-02", photos: 1 },
  { productId: "prd_003", author: "Lakshmi N.", city: "Chennai", rating: 5, title: "Dosas come off easily", body: "Even heating on induction. Used it daily for three weeks without sticking.", createdAt: "2026-10-20" },
  { productId: "prd_003", author: "Rohit K.", city: "Jaipur", rating: 4, title: "Nice tawa", body: "Works on gas too. Handle stays cool.", createdAt: "2026-08-14" },
  { productId: "prd_004", author: "Sneha P.", city: "Nagpur", rating: 5, title: "Saves so much time", body: "Onions chopped in five pulls, no tears. Blades are sharp so be careful while washing.", createdAt: "2026-10-28", photos: 1 },
  { productId: "prd_004", author: "Imran A.", city: "Lucknow", rating: 4, title: "Works well", body: "Great for chutney bases. Wish the bowl were a little bigger.", createdAt: "2026-09-11" },
  { productId: "prd_005", author: "Meera D.", city: "Ahmedabad", rating: 4, title: "Almirah sorted", body: "Six boxes hold all our winter clothes. The window helps find things fast.", createdAt: "2026-10-05", photos: 1 },
  { productId: "prd_009", author: "Anita G.", city: "Delhi", rating: 5, title: "Best mop we have used", body: "Wringer leaves the mop nearly dry, so floors dry quickly. Wheels are handy.", createdAt: "2026-10-18", photos: 2 },
  { productId: "prd_009", author: "Suresh B.", city: "Bhopal", rating: 4, title: "Good, solid build", body: "Steel spinner feels durable. Handle locks firmly.", createdAt: "2026-09-21" },
  { productId: "prd_010", author: "Divya T.", city: "Bengaluru", rating: 5, title: "Streak-free glass", body: "Use them for windows and the car. Still soft after many washes.", createdAt: "2026-10-01" },
  { productId: "prd_013", author: "Farah Z.", city: "Hyderabad", rating: 4, title: "Holding up well", body: "Two months on tiles, still firm with shampoo bottles. Followed the 24 hour rule.", createdAt: "2026-09-15", photos: 1 },
  { productId: "prd_017", author: "Nikita J.", city: "Mumbai", rating: 5, title: "Looks lovely", body: "Earthy colours suit our living room. Packed very safely.", createdAt: "2026-10-09", photos: 1 },
  { productId: "prd_019", author: "Vikram S.", city: "Chandigarh", rating: 4, title: "Strong hooks", body: "Holding towels in the bathroom for weeks now.", createdAt: "2026-10-22" },
];

export const seedReviews: Review[] = seeds.map((r, i) => ({
  ...r,
  id: `rev_${String(i + 1).padStart(3, "0")}`,
  verified: true,
  photos: Array.from({ length: r.photos ?? 0 }, (_, n) => `/placeholders/reviews/review-${(i + n) % 4 + 1}.svg`),
}));
