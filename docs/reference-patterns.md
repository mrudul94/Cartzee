# Reference UX patterns (structure only)

These are structural notes from a home-needs storefront used as a UX reference. Cartzee does not
reuse its brand, copy, images or visual style. Only the information architecture is borrowed.

| Area | Pattern observed | Cartzee decision |
|---|---|---|
| Top bar | Promo strip (extra % off on prepaid/UPI) | `TopBar`: UPI offer + socials + login |
| Header | Logo, search, login, cart; mobile drawer holds socials | `Header` sticky, `MobileNav` drawer |
| Nav | "Flash Sale" first; 3-level mega-menu (category, group + "View all", leaf links with thumbs) | `MegaMenu` driven by categories data |
| Budget | Five tiers (under 299 / 599 / 999 / 1999, 1999+) as homepage tiles | `BudgetMenu` in nav **and** homepage tiles |
| Home | Category circles, hero carousel, budget tiles, bestsellers | Spec order (hero first) |
| Card | 2 images, title, MRP strike + sale + % off, Add to cart / Sold out, Sale badge | `ProductCard` |
| Collection | Promo images, filters (type, price range), 9-option sort, result count | `CategoryListing` + AEO intro + FAQ |
| Product | Breadcrumb, gallery with counter + thumbs + modal, price block with tax note, prepaid badge, qty, add to cart, trust row, description, key-value specs, related grid | Same plus PIN check, Buy Now, sticky mobile bar, FAQs, reviews |
| Footer | Not captured | Spec section 3 footer |
