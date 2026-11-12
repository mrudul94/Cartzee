# City Seller component registry

> Generated from `registry.json` by `pnpm registry:sync`. Do not edit by hand; edit `registry.json` instead.

**Reuse-first rule:** before creating any UI element, search this list. Reuse via props/variants/tokens, extend an existing
component with a new variant if it is close, and only create a new component (then register it) if nothing similar exists.
Live previews: `/design-system`.

Total entries: **112**

| Name | Category | Path | Description | Variants | Used in |
|---|---|---|---|---|---|
| [Button](#button) | ui/action | `components/ui/Button.tsx` | Primary action button used for Add to Cart, Buy Now, forms and links styled as buttons. | primary, secondary, soft, outline, ghost, link, danger, inverse | 21 |
| [CopyButton](#copybutton) | ui/action | `components/ui/CopyButton.tsx` | Copies a value to the clipboard with a brief Copied state. | – | 1 |
| [Accordion](#accordion) | ui/disclosure | `components/ui/Disclosure.tsx` | Radix accordion for FAQs and mobile nav. | plain, boxed, single, multiple | 2 |
| [Tabs](#tabs) | ui/disclosure | `components/ui/Disclosure.tsx` | Radix tabs for grouped content. | – | 0 |
| [Badge](#badge) | ui/display | `components/ui/Badge.tsx` | Small status label: discount %, Sold out, Bestseller. | sale, success, warning, error, neutral, outline, dark | 4 |
| [DataTable](#datatable) | ui/display | `components/ui/DataTable.tsx` | Generic accessible data table (admin orders/products) with per-column alignment and mobile-hidden columns. | – | 3 |
| [Table](#table) | ui/display | `components/ui/Misc.tsx` | Key–value HTML table (product specs, order details). | – | 1 |
| [Skeleton](#skeleton) | ui/feedback | `components/ui/Misc.tsx` | Pulse placeholder block sized with token classes. | – | 0 |
| [toast](#toast) | ui/feedback | `components/ui/Toast.tsx` | Imperative function to show a toast from client code. | success, error, info | 3 |
| [Toaster](#toaster) | ui/feedback | `components/ui/Toast.tsx` | Toast viewport; mount once in root layout. | – | 1 |
| [Checkbox](#checkbox) | ui/form | `components/ui/Checkbox.tsx` | Radix checkbox with label row; used in filter facets. | – | 3 |
| [FormField](#formfield) | ui/form | `components/ui/FormField.tsx` | Label + control + hint/error wrapper for all form controls. | – | 5 |
| [Input](#input) | ui/form | `components/ui/Input.tsx` | Text input sharing fieldVariants with Textarea and Select; optional leading icon. | default, invalid | 9 |
| [QuantityStepper](#quantitystepper) | ui/form | `components/ui/Misc.tsx` | −/+ quantity control. | – | 2 |
| [RadioGroup](#radiogroup) | ui/form | `components/ui/Checkbox.tsx` | Radix radio group rendering a list of labelled options; used for budget and rating filters. | – | 1 |
| [Select](#select) | ui/form | `components/ui/Input.tsx` | Native select styled with field tokens (best mobile UX); used for sort, state picker. | default, invalid | 3 |
| [Textarea](#textarea) | ui/form | `components/ui/Input.tsx` | Multi-line text field with the same look as Input. | default, invalid | 2 |
| [Icon](#icon) | ui/icon | `components/ui/Icon.tsx` | Token-sized wrapper for lucide icons. | – | 0 |
| [SocialIcon](#socialicon) | ui/icon | `components/ui/Icon.tsx` | Inline brand marks (Instagram, Facebook, YouTube, WhatsApp). | instagram, facebook, youtube, whatsapp | 3 |
| [Card](#card) | ui/layout | `components/ui/Card.tsx` | Surface container with padding/elevation variants; polymorphic `as`. | flat, raised, outline, interactive | 8 |
| [Separator](#separator) | ui/layout | `components/ui/Misc.tsx` | Horizontal or vertical rule. | horizontal, vertical | 0 |
| [ChipNav](#chipnav) | ui/navigation | `components/ui/ChipNav.tsx` | Scrolling link chips with optional counts: listing refine chips, budget tiers, admin status filters. | default, active, with count | 3 |
| [Pagination](#pagination) | ui/navigation | `components/ui/Misc.tsx` | Crawlable page links with prev/next and ellipsis. | – | 1 |
| [Drawer](#drawer) | ui/overlay | `components/ui/Modal.tsx` | Slide-in panel built on the same dialog frame (cart, filters, mobile menu). | left, right, bottom | 3 |
| [Modal](#modal) | ui/overlay | `components/ui/Modal.tsx` | Centred Radix dialog (product image zoom, confirmations). | – | 1 |
| [Heading](#heading) | ui/typography | `components/ui/Heading.tsx` | Heading with semantic level independent from visual size (keeps one H1 and logical H2/H3). | sm, md, lg, xl, display | 1 |
| [SectionHeader](#sectionheader) | ui/typography | `components/ui/SectionHeader.tsx` | Section title row with eyebrow, subtitle and View all link. | left, center | 7 |
| [AddToCartButton](#addtocartbutton) | commerce | `components/commerce/AddToCartButton.tsx` | Adds a product to the cart (opens drawer) or Buy Now (goes to checkout); renders Sold out when unavailable. | add, buy, sold-out | 2 |
| [CartButton](#cartbutton) | commerce | `components/commerce/CartButton.tsx` | Header cart icon with live count; opens CartDrawer. | – | 1 |
| [CartDrawer](#cartdrawer) | commerce | `components/commerce/CartDrawer.tsx` | Slide-in mini cart mounted once in StoreShell. | – | 1 |
| [CartLineItem](#cartlineitem) | commerce | `components/commerce/CartLineItem.tsx` | Cart row with thumbnail, price, quantity stepper and remove. | – | 2 |
| [CartView](#cartview) | commerce | `components/commerce/CartView.tsx` | Full cart page body. | – | 1 |
| [CategoryListing](#categorylisting) | commerce | `components/commerce/CategoryListing.tsx` | Client filters (budget, material, colour, rating), sort and pagination with URL state. | – | 1 |
| [CheckoutForm](#checkoutform) | commerce | `components/commerce/CheckoutForm.tsx` | Contact + address form (RHF + Zod Indian PIN/phone) and prepaid pay button. | – | 1 |
| [FreeShippingProgress](#freeshippingprogress) | commerce | `components/commerce/OrderSummary.tsx` | 'Add ₹X more for free delivery' with progress bar. | – | 3 |
| [OrderStatusPoller](#orderstatuspoller) | commerce | `components/commerce/OrderStatusPoller.tsx` | Refreshes the order success page every few seconds while payment confirmation (webhook) is pending. | – | 1 |
| [OrderSummary](#ordersummary) | commerce | `components/commerce/OrderSummary.tsx` | Subtotal / delivery / savings / total breakdown. | – | 4 |
| [PincodeChecker](#pincodechecker) | commerce | `components/commerce/PincodeChecker.tsx` | PIN-code delivery estimate (zone table) with remembered PIN. | – | 1 |
| [PrepaidNotice](#prepaidnotice) | commerce | `components/commerce/PrepaidNotice.tsx` | States prepaid-only policy and accepted methods. | inline, box | 4 |
| [PriceBlock](#priceblock) | commerce | `components/commerce/PriceBlock.tsx` | Sale price, struck MRP and % off. | – | 2 |
| [ProductBuyBox](#productbuybox) | commerce | `components/commerce/ProductBuyBox.tsx` | Quantity + Add to Cart + Buy Now; drives the mobile StickyBuyBar. | – | 1 |
| [ProductCard](#productcard) | commerce | `components/commerce/ProductCard.tsx` | Product tile: hover second image, discount/sold-out/bestseller badges, title, rating, price, Add to Cart. | default, plain | 4 |
| [ProductGallery](#productgallery) | commerce | `components/commerce/ProductGallery.tsx` | Main image, thumbnails, counter, arrows and zoom modal with hover magnify. | – | 1 |
| [RatingStars](#ratingstars) | commerce | `components/commerce/RatingStars.tsx` | Read-only star rating with fractional fill. | – | 3 |
| [ReviewList](#reviewlist) | commerce | `components/commerce/ReviewList.tsx` | Rating summary with distribution plus reviews with photos. | – | 1 |
| [SearchBox](#searchbox) | commerce | `components/commerce/SearchBox.tsx` | GET form to /search (works without JS; SearchAction target). | – | 2 |
| [StickyBuyBar](#stickybuybar) | commerce | `components/commerce/ProductBuyBox.tsx` | Mobile-only fixed bottom bar with price and buy actions. | – | 1 |
| [TrackOrderForm](#trackorderform) | commerce | `components/commerce/TrackOrderForm.tsx` | Order number + phone lookup with status timeline. | – | 1 |
| [AnswerIntro](#answerintro) | section | `components/sections/InfoSections.tsx` | H1 + 1–2 sentence direct answer for AEO at the top of listing and info pages. | – | 6 |
| [BrandStory](#brandstory) | section | `components/sections/InfoSections.tsx` | 'Why choose City Seller?' story with category blurbs. | – | 1 |
| [CategoryTiles](#categorytiles) | section | `components/sections/CategoryTiles.tsx` | Navigational tiles for categories, featured collections and budget tiers. | circle, card, price | 1 |
| [ContentPage](#contentpage) | section | `components/sections/ContentPage.tsx` | Policy/info page template from ContentPage data. | – | 2 |
| [CustomerCare](#customercare) | section | `components/sections/InfoSections.tsx` | Care block: phone, WhatsApp, email, hours + Track order. | – | 3 |
| [FAQSection](#faqsection) | section | `components/sections/InfoSections.tsx` | FAQ accordion with FAQPage JSON-LD. | – | 6 |
| [GuideCards](#guidecards) | section | `components/sections/GuideCards.tsx` | Buying-guide card grid. | – | 2 |
| [HeroBanner](#herobanner) | section | `components/sections/HeroBanner.tsx` | Offer hero with copy, CTAs, highlight chips and priority image (LCP). | – | 1 |
| [ListingTemplate](#listingtemplate) | section | `components/sections/ListingTemplate.tsx` | Shared listing body: breadcrumbs, AnswerIntro, chips, CategoryListing (static fallback grid), FAQs, ItemList JSON-LD. | – | 6 |
| [NotFoundContent](#notfoundcontent) | section | `components/sections/NotFoundContent.tsx` | 404 body with search and helpful links. | – | 1 |
| [ProductGrid](#productgrid) | section | `components/sections/ProductGrid.tsx` | Titled product section; grid or mobile carousel (Bestsellers, Flash sale, Related). | grid, carousel | 2 |
| [SaleBanner](#salebanner) | section | `components/sections/SaleBanner.tsx` | Promo banner with live text over decorative art. | soft, sand, ink | 1 |
| [ValueProps](#valueprops) | section | `components/sections/InfoSections.tsx` | Five value propositions (range, pricing, shipping, returns, secure prepaid). | – | 2 |
| [Breadcrumbs](#breadcrumbs) | layout | `components/layout/Breadcrumbs.tsx` | Breadcrumb trail with BreadcrumbList JSON-LD; Home auto-prepended. | – | 14 |
| [BudgetMenu](#budgetmenu) | layout | `components/layout/MegaMenu.tsx` | 'Shop by Budget' dropdown of five price tiers. | – | 1 |
| [Container](#container) | layout | `components/layout/Container.tsx` | Centred page-width wrapper with standard gutters. | default, narrow, prose, full | 18 |
| [Footer](#footer) | layout | `components/layout/Footer.tsx` | Footer: care hours/phone/email, shop, help, policies, socials, business name. | – | 1 |
| [Header](#header) | layout | `components/layout/Header.tsx` | Sticky header: logo, search, account, cart, desktop nav row. | – | 1 |
| [Logo](#logo) | layout | `components/layout/Logo.tsx` | City Seller wordmark link to home. | default, inverse | 4 |
| [MegaMenu](#megamenu) | layout | `components/layout/MegaMenu.tsx` | Data-driven 'Shop by Category' mega-menu (category → subcategory links with thumbnails). | – | 1 |
| [MobileNav](#mobilenav) | layout | `components/layout/MobileNav.tsx` | Hamburger + left drawer with category accordion, budget tiers, links and socials. | – | 1 |
| [NavDropdown](#navdropdown) | layout | `components/layout/NavDropdown.tsx` | Disclosure dropdown used by MegaMenu and BudgetMenu (hover + click + Escape). | mega, menu | 1 |
| [Section](#section) | layout | `components/layout/Container.tsx` | Full-bleed band with background token and vertical rhythm. | background, surface, secondary, soft, ink | 7 |
| [StoreShell](#storeshell) | layout | `components/layout/StoreShell.tsx` | Storefront chrome (skip link, TopBar, Header, Footer, CartDrawer, Organization + WebSite JSON-LD). | – | 2 |
| [TopBar](#topbar) | layout | `components/layout/TopBar.tsx` | Promo strip with socials, Track order and Login. | – | 1 |
| [AdminShell](#adminshell) | admin | `components/admin/AdminShell.tsx` | Admin layout: sidebar (desktop) / scrolling nav (mobile), pending-orders badge, sign-out, dev-mode banner. | – | 1 |
| [CopyField](#copyfield) | admin | `components/admin/AdminBits.tsx` | Label + value + copy button for pasting customer details into Meesho. | – | 1 |
| [ImageManager](#imagemanager) | admin | `components/admin/ImageManager.tsx` | Product photo list: upload to Supabase Storage or add by path, alt text, reorder, remove. | – | 1 |
| [LoginForm](#loginform) | admin | `components/admin/LoginForm.tsx` | Email + password sign-in for partners in public.admins. | – | 1 |
| [MarginText](#margintext) | admin | `components/admin/AdminBits.tsx` | Margin in ₹ and % (green ≥ 25%, amber below, red if negative). | – | 4 |
| [OrderActions](#orderactions) | admin | `components/admin/OrderActions.tsx` | Order fulfilment form: Meesho order ID/cost, tracking link, note, refund toggle, one button per allowed status, WhatsApp link. | – | 1 |
| [OrderStatusBadge](#orderstatusbadge) | admin | `components/admin/AdminBits.tsx` | Admin status pill using internal labels; needs-action states in warning tone. | pending_payment, paid, placed_on_meesho, shipped, delivered, cancelled_refunded, return_requested, returned_refunded | 3 |
| [OrderTimeline](#ordertimeline) | admin | `components/admin/AdminBits.tsx` | Newest-first order event history with time and note. | – | 1 |
| [ProductForm](#productform) | admin | `components/admin/ProductForm.tsx` | Create/edit product: basics, pricing with live margin and discount, Meesho link/price + checked flag, photos, content, visibility, SEO. | – | 2 |
| [StatCard](#statcard) | admin | `components/admin/AdminBits.tsx` | Dashboard KPI card. | default, warning, success | 1 |
| [cartTotals](#carttotals) | hook | `hooks/useCart.ts` | Derives count, subtotal, MRP total, savings, shipping and total from cart lines. | – | 4 |
| [useCart](#usecart) | hook | `hooks/useCart.ts` | Zustand cart store persisted to localStorage (items, drawer state, add/setQuantity/remove/clear). | – | 6 |
| [useHydrated](#usehydrated) | hook | `hooks/useHydrated.ts` | True after client hydration (guards localStorage-backed UI). | – | 4 |
| [useRazorpay](#userazorpay) | hook | `hooks/useRazorpay.ts` | Loads Razorpay Checkout.js on demand and opens it; resolves with the signed success payload or rejects (PaymentDismissedError on close). | – | 1 |
| [buildCategoryTree](#buildcategorytree) | util | `components/layout/MegaMenu.tsx` | Turns flat categories into a top-level tree with children. | – | 3 |
| [calcDiscount](#calcdiscount) | util | `lib/utils/format.ts` | Whole-number discount % from MRP and price. | – | 3 |
| [calcMargin](#calcmargin) | util | `lib/utils/format.ts` | Margin amount and % of price between selling price and supplier cost. | – | 2 |
| [cn](#cn) | util | `lib/utils/cn.ts` | clsx + tailwind-merge configured for token class names. | – | 38 |
| [daysSince](#dayssince) | util | `lib/utils/format.ts` | Whole days since an ISO date (stale Meesho price checks). | – | 3 |
| [estimateDelivery](#estimatedelivery) | util | `lib/utils/delivery.ts` | PIN-zone delivery window (dates + region); SHIPPING constant in the same file. | – | 2 |
| [formatDate](#formatdate) | util | `lib/utils/format.ts` | ISO date → '12 Nov 2026' (en-IN). | – | 9 |
| [formatINR](#formatinr) | util | `lib/utils/format.ts` | Formats rupees with Indian grouping: 1299 → ₹1,299. | – | 18 |
| [getBudgetTier](#getbudgettier) | util | `lib/utils/budget.ts` | Looks up a BUDGET_TIERS entry by slug (BUDGET_TIERS constant lives in the same file). | – | 1 |
| [inBudget](#inbudget) | util | `lib/utils/budget.ts` | Whether a price falls inside a budget tier. | – | 0 |
| [paths](#paths) | util | `lib/utils/paths.ts` | Canonical URL builders (the only place URL shapes are defined). | – | 35 |
| [shippingFor](#shippingfor) | util | `lib/utils/delivery.ts` | Delivery fee for a subtotal (free above threshold). | – | 2 |
| [slugify](#slugify) | util | `lib/utils/format.ts` | Text → URL slug. | – | 5 |
| [toCardProduct](#tocardproduct) | util | `lib/utils/product.ts` | Product → serializable CardProduct for client components. | – | 9 |
| [tokenStyle](#tokenstyle) | util | `lib/utils/token-style.ts` | Maps token names to inline CSS-variable styles for width/height/colour props. | – | 2 |
| [validators](#validators) | util | `lib/utils/validators.ts` | Zod schemas: pincodeSchema, phoneSchema, addressSchema, checkoutSchema, trackOrderSchema, INDIAN_STATES. | – | 0 |
| [buildArticleJsonLd](#buildarticlejsonld) | seo | `lib/seo/jsonld.ts` | Article JSON-LD for guides. | – | 1 |
| [buildBreadcrumbJsonLd](#buildbreadcrumbjsonld) | seo | `lib/seo/jsonld.ts` | BreadcrumbList JSON-LD. | – | 1 |
| [buildFaqJsonLd](#buildfaqjsonld) | seo | `lib/seo/jsonld.ts` | FAQPage JSON-LD. | – | 1 |
| [buildItemListJsonLd](#builditemlistjsonld) | seo | `lib/seo/jsonld.ts` | ItemList JSON-LD for listing pages. | – | 1 |
| [buildMetadata](#buildmetadata) | seo | `lib/seo/metadata.ts` | Unique title/description, canonical, OG and Twitter metadata with DB overrides. | – | 19 |
| [buildOrganizationJsonLd](#buildorganizationjsonld) | seo | `lib/seo/jsonld.ts` | OnlineStore/Organization JSON-LD. | – | 1 |
| [buildProductJsonLd](#buildproductjsonld) | seo | `lib/seo/jsonld.ts` | Product + Offer (shipping, returns) + AggregateRating JSON-LD. | – | 1 |
| [buildWebSiteJsonLd](#buildwebsitejsonld) | seo | `lib/seo/jsonld.ts` | WebSite JSON-LD with SearchAction. | – | 1 |
| [JsonLd](#jsonld) | seo | `lib/seo/JsonLdScript.tsx` | Renders JSON-LD script tags safely (escapes <). | – | 6 |

## Button

`src/components/ui/Button.tsx` · ui/action · updated 2026-11-12

Primary action button used for Add to Cart, Buy Now, forms and links styled as buttons.

**Props**

- `variant`: primary|secondary|soft|outline|ghost|link|danger|inverse
- `size`: sm|md|lg|icon
- `fullWidth`: boolean
- `width`: space token|auto|full
- `height`: space token|auto|full
- `color`: color token (background override)
- `textColor`: color token
- `icon`: ReactNode
- `iconPosition`: left|right
- `loading`: boolean
- `disabled`: boolean
- `href`: string (renders next/link)
- `onClick`: function
- `type`: button|submit|reset

**Variants:** primary, secondary, soft, outline, ghost, link, danger, inverse

**Sizes:** sm (`h-9 px-3 text-sm`), md (`h-11 px-5 text-base`), lg (`h-12 px-6 text-lg`), icon (`h-11 w-11`)

**Tokens:** `color.background` `color.borderStrong` `color.error` `color.ink` `color.primary` `color.primaryHover` `color.secondary` `color.secondaryStrong` `color.surface` `color.text` `color.textInverse` `duration.fast` `font.family.body` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `space.0` `space.11` `space.12` `space.2` `space.3` `space.4` `space.5` `space.6` `space.9`

**Accessibility:** Focus ring (shadow-focus); aria-busy while loading; md/lg/icon sizes meet 44px touch target; primary colour reserved for buy actions.

**Used in:** AddToCartButton, CartDrawer, CartView, CategoryListing, CheckoutForm, HeroBanner, ImageManager, LoginForm, MobileNav, NotFoundContent, OrderActions, PincodeChecker, ProductForm, SaleBanner, TrackOrderForm, app:/account, app:/admin, app:/admin/orders/[id], app:/admin/products, app:/order/[id], sections/InfoSections

```tsx
<Button variant="primary" size="lg" icon={<ShoppingBag/>}>Add to Cart</Button>
```

## CopyButton

`src/components/ui/CopyButton.tsx` · ui/action · updated 2026-11-12

Copies a value to the clipboard with a brief Copied state.

**Props**

- `value`: string
- `label`: string (what is copied)

**Tokens:** `color.background` `color.borderStrong` `color.success` `color.surface` `color.text` `font.size.sm` `radius.md` `shadow.focus` `space.1` `space.2` `space.4` `space.9`

**Accessibility:** aria-label names the value; state change announced via aria-live.

**Used in:** admin/AdminBits

```tsx
<CopyButton value={phone} label="Phone" />
```

## Accordion

`src/components/ui/Disclosure.tsx` · ui/disclosure · updated 2026-11-12

Radix accordion for FAQs and mobile nav.

**Props**

- `items`: {id,title,content}[]
- `type`: single|multiple
- `defaultOpen`: string[]
- `variant`: plain|boxed
- `headingLevel`: h2|h3|h4

**Variants:** plain, boxed, single, multiple

**Tokens:** `color.border` `color.ink` `color.surface` `color.text` `color.textMuted` `duration.base` `duration.fast` `font.family.body` `font.lineHeight.relaxed` `font.size.base` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.3` `space.4` `space.5` `space.6`

**Accessibility:** Triggers are buttons inside headings; aria-expanded; content in DOM for crawlers when open.

**Used in:** MobileNav, sections/InfoSections

```tsx
<Accordion items={faqs.map(…)} />
```

## Tabs

`src/components/ui/Disclosure.tsx` · ui/disclosure · updated 2026-11-12

Radix tabs for grouped content.

**Props**

- `items`: {value,label,content}[]
- `defaultValue`: string

**Tokens:** `color.border` `color.ink` `color.surface` `color.text` `color.textMuted` `duration.base` `duration.fast` `font.family.body` `font.lineHeight.relaxed` `font.size.base` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.3` `space.4` `space.5` `space.6`

**Accessibility:** Arrow keys move between tabs; roving tabindex.

```tsx
<Tabs items={[{value:'a',label:'Details',content:…}]} />
```

## Badge

`src/components/ui/Badge.tsx` · ui/display · updated 2026-11-12

Small status label: discount %, Sold out, Bestseller.

**Props**

- `variant`: string
- `size`: sm|md

**Variants:** sale, success, warning, error, neutral, outline, dark

**Sizes:** sm (`px-2 py-0.5 text-xs`), md (`px-3 py-1 text-sm`)

**Tokens:** `color.borderStrong` `color.error` `color.errorSoft` `color.ink` `color.primary` `color.secondary` `color.success` `color.successSoft` `color.surface` `color.text` `color.textInverse` `color.warning` `color.warningSoft` `font.size.sm` `font.size.xs` `font.tracking.wide` `font.weight.semibold` `radius.sm` `space.0.5` `space.1` `space.2` `space.3`

**Accessibility:** Text content conveys meaning; all variants pass AA contrast.

**Used in:** ProductCard, admin/AdminBits, app:/[category]/[sub]/[product], app:/admin/products

```tsx
<Badge variant="sale">50% off</Badge>
```

## DataTable

`src/components/ui/DataTable.tsx` · ui/display · updated 2026-11-12

Generic accessible data table (admin orders/products) with per-column alignment and mobile-hidden columns.

**Props**

- `columns`: {header, cell(row), align?, hideOnMobile?}[]
- `rows`: T[]
- `rowKey`: (row)=>string
- `caption`: string (sr-only)
- `empty`: ReactNode

**Tokens:** `color.background` `color.border` `color.surface` `color.textMuted` `font.size.base` `font.size.sm` `font.weight.semibold` `radius.lg` `space.10` `space.3` `space.4`

**Accessibility:** Real table with caption and th scope=col; scrolls horizontally on small screens.

**Used in:** app:/admin, app:/admin/orders, app:/admin/products

```tsx
<DataTable caption="Orders" rows={orders} rowKey={(o)=>o.id} columns={[…]} />
```

## Table

`src/components/ui/Misc.tsx` · ui/display · updated 2026-11-12

Key–value HTML table (product specs, order details).

**Props**

- `rows`: {label,value}[]
- `caption`: string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** Real <table> with th scope=row and caption (AEO: specs as HTML, not images).

**Used in:** app:/[category]/[sub]/[product]

```tsx
<Table caption="Specifications" rows={specs} />
```

## Skeleton

`src/components/ui/Misc.tsx` · ui/feedback · updated 2026-11-12

Pulse placeholder block sized with token classes.

**Props**

- `className`: token size classes

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** aria-hidden.

```tsx
<Skeleton className="h-4 w-32" />
```

## toast

`src/components/ui/Toast.tsx` · ui/feedback · updated 2026-11-12

Imperative function to show a toast from client code.

**Props**

- `title`: string
- `description`: string
- `tone`: success|error|info

**Variants:** success, error, info

**Tokens:** `color.border` `color.error` `color.success` `color.surface` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0.5` `space.11` `space.2` `space.24` `space.3` `space.4` `space.5` `space.6` `zIndex.toast`

**Accessibility:** Announced politely.

**Used in:** AddToCartButton, CheckoutForm, Toaster

```tsx
toast({ title: "Added to cart" })
```

## Toaster

`src/components/ui/Toast.tsx` · ui/feedback · updated 2026-11-12

Toast viewport; mount once in root layout.

**Tokens:** `color.border` `color.error` `color.success` `color.surface` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0.5` `space.11` `space.2` `space.24` `space.3` `space.4` `space.5` `space.6` `zIndex.toast`

**Accessibility:** aria-live=polite region; dismiss button 44px.

**Used in:** app: (layout)

```tsx
<Toaster />
```

## Checkbox

`src/components/ui/Checkbox.tsx` · ui/form · updated 2026-11-12

Radix checkbox with label row; used in filter facets.

**Props**

- `id`: string
- `label`: ReactNode
- `checked`: boolean
- `onCheckedChange`: (checked:boolean)=>void
- `disabled`: boolean

**Tokens:** `color.borderStrong` `color.ink` `color.surface` `color.text` `color.textInverse` `duration.fast` `font.size.base` `radius.full` `radius.sm` `shadow.focus` `space.11` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** Whole row is the label (44px min height); visible focus ring; Space toggles.

**Used in:** CategoryListing, OrderActions, ProductForm

```tsx
<Checkbox id="m-steel" label="Steel" checked={on} onCheckedChange={setOn} />
```

## FormField

`src/components/ui/FormField.tsx` · ui/form · updated 2026-11-12

Label + control + hint/error wrapper for all form controls.

**Props**

- `id`: string
- `label`: string
- `hint`: string
- `error`: string
- `required`: boolean
- `hideLabel`: boolean
- `children`: ReactNode

**Tokens:** `color.error` `color.text` `color.textMuted` `font.size.sm` `font.weight.medium` `space.1.5`

**Accessibility:** Visible label bound with htmlFor; error rendered with role=alert at `${id}-desc` for aria-describedby.

**Used in:** CheckoutForm, LoginForm, OrderActions, ProductForm, TrackOrderForm

```tsx
<FormField id="phone" label="Mobile" error={err}><Input id="phone" /></FormField>
```

## Input

`src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

Text input sharing fieldVariants with Textarea and Select; optional leading icon.

**Props**

- `size`: sm|md|lg
- `invalid`: boolean
- `leadingIcon`: ReactNode
- `ref`: Ref<HTMLInputElement>
- `...input`: native input attributes

**Variants:** default, invalid

**Sizes:** sm (`h-9 px-3 text-sm`), md (`h-11 px-4`), lg (`h-12 px-4 text-lg`)

**Tokens:** `color.background` `color.borderStrong` `color.error` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.fast` `font.family.body` `font.size.base` `font.size.lg` `font.size.sm` `radius.md` `shadow.focus` `space.1` `space.10` `space.11` `space.12` `space.3` `space.4` `space.9`

**Accessibility:** aria-invalid when invalid; pair with FormField for label and described-by error.

**Used in:** CheckoutForm, ImageManager, LoginForm, OrderActions, PincodeChecker, ProductForm, SearchBox, TrackOrderForm, app:/admin/products

```tsx
<Input id="pin" inputMode="numeric" invalid={!!error} />
```

## QuantityStepper

`src/components/ui/Misc.tsx` · ui/form · updated 2026-11-12

−/+ quantity control.

**Props**

- `value`: number
- `onChange`: (n)=>void
- `min`: number
- `max`: number
- `size`: sm|md
- `label`: string

**Sizes:** sm (`h-9 w-9 buttons`), md (`h-11 w-11 buttons`)

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** role=group with label; live output; buttons labelled and disabled at limits.

**Used in:** CartLineItem, commerce/ProductBuyBox

```tsx
<QuantityStepper value={q} onChange={setQ} max={10} />
```

## RadioGroup

`src/components/ui/Checkbox.tsx` · ui/form · updated 2026-11-12

Radix radio group rendering a list of labelled options; used for budget and rating filters.

**Props**

- `name`: string
- `value`: string
- `onValueChange`: (v)=>void
- `options`: {value,label}[]
- `label`: string (aria-label)

**Tokens:** `color.borderStrong` `color.ink` `color.surface` `color.text` `color.textInverse` `duration.fast` `font.size.base` `radius.full` `radius.sm` `shadow.focus` `space.11` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** Arrow-key navigation, roving focus, 44px rows.

**Used in:** CategoryListing

```tsx
<RadioGroup name="rating" options={[…]} value={v} onValueChange={setV} />
```

## Select

`src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

Native select styled with field tokens (best mobile UX); used for sort, state picker.

**Props**

- `options`: {value,label}[]
- `placeholder`: string
- `size`: sm|md|lg
- `invalid`: boolean
- `ref`: Ref<HTMLSelectElement>

**Variants:** default, invalid

**Sizes:** sm (`h-9`), md (`h-11`), lg (`h-12`)

**Tokens:** `color.background` `color.borderStrong` `color.error` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.fast` `font.family.body` `font.size.base` `font.size.lg` `font.size.sm` `radius.md` `shadow.focus` `space.1` `space.10` `space.11` `space.12` `space.3` `space.4` `space.9`

**Accessibility:** Native semantics and keyboard; label via FormField or sr-only label.

**Used in:** CategoryListing, CheckoutForm, ProductForm

```tsx
<Select id="sort" options={SORT_OPTIONS} value={sort} onChange={…} />
```

## Textarea

`src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

Multi-line text field with the same look as Input.

**Props**

- `invalid`: boolean
- `rows`: number
- `ref`: Ref<HTMLTextAreaElement>

**Variants:** default, invalid

**Tokens:** `color.background` `color.borderStrong` `color.error` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.fast` `font.family.body` `font.size.base` `font.size.lg` `font.size.sm` `radius.md` `shadow.focus` `space.1` `space.10` `space.11` `space.12` `space.3` `space.4` `space.9`

**Accessibility:** aria-invalid; use inside FormField.

**Used in:** OrderActions, ProductForm

```tsx
<Textarea id="msg" rows={4} />
```

## Icon

`src/components/ui/Icon.tsx` · ui/icon · updated 2026-11-12

Token-sized wrapper for lucide icons.

**Props**

- `icon`: LucideIcon
- `size`: xs|sm|md|lg|xl
- `label`: string (omit for decorative)

**Sizes:** xs (`h-3 w-3`), sm (`h-4 w-4`), md (`h-5 w-5`), lg (`h-6 w-6`), xl (`h-8 w-8`)

**Tokens:** `space.3` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** aria-hidden unless label given (then role=img + aria-label).

```tsx
<Icon icon={Truck} size="md" />
```

## SocialIcon

`src/components/ui/Icon.tsx` · ui/icon · updated 2026-11-12

Inline brand marks (Instagram, Facebook, YouTube, WhatsApp).

**Props**

- `brand`: instagram|facebook|youtube|whatsapp
- `size`: xs|sm|md|lg|xl

**Variants:** instagram, facebook, youtube, whatsapp

**Tokens:** `space.3` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Decorative; the wrapping link carries aria-label.

**Used in:** Footer, MobileNav, TopBar

```tsx
<a aria-label="Instagram" href={…}><SocialIcon brand="instagram" /></a>
```

## Card

`src/components/ui/Card.tsx` · ui/layout · updated 2026-11-12

Surface container with padding/elevation variants; polymorphic `as`.

**Props**

- `as`: ElementType
- `padding`: none|sm|md|lg
- `elevation`: flat|raised|outline
- `interactive`: boolean
- `background`: color token

**Variants:** flat, raised, outline, interactive

**Sizes:** none (`p-0`), sm (`p-3`), md (`p-4 md:p-6`), lg (`p-6 md:p-8`)

**Tokens:** `color.border` `color.borderStrong` `color.surface` `color.text` `duration.base` `radius.lg` `shadow.lg` `shadow.md` `space.0` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Use as="fieldset"/"section" when grouping semantics are needed.

**Used in:** CartView, CheckoutForm, ProductForm, TrackOrderForm, admin/AdminBits, app:/admin/login, app:/admin/orders/[id], app:/order/[id]

```tsx
<Card padding="md" elevation="raised">…</Card>
```

## Separator

`src/components/ui/Misc.tsx` · ui/layout · updated 2026-11-12

Horizontal or vertical rule.

**Props**

- `orientation`: horizontal|vertical

**Variants:** horizontal, vertical

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** role=separator.

```tsx
<Separator />
```

## ChipNav

`src/components/ui/ChipNav.tsx` · ui/navigation · updated 2026-11-12

Scrolling link chips with optional counts: listing refine chips, budget tiers, admin status filters.

**Props**

- `chips`: {label, href, active?, count?}[]
- `label`: string (nav aria-label)

**Variants:** default, active, with count

**Tokens:** `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `font.size.sm` `font.size.xs` `font.weight.medium` `radius.full` `shadow.focus` `space.11` `space.2` `space.4`

**Accessibility:** nav landmark; aria-current on the active chip; 44px targets.

**Used in:** ListingTemplate, app:/admin/orders, app:/admin/products

```tsx
<ChipNav label="Refine" chips={[{label:"All",href:"/kitchen",active:true}]} />
```

## Pagination

`src/components/ui/Misc.tsx` · ui/navigation · updated 2026-11-12

Crawlable page links with prev/next and ellipsis.

**Props**

- `page`: number
- `totalPages`: number
- `hrefFor`: (page)=>string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** nav landmark, aria-current=page, rel prev/next, 44px targets.

**Used in:** CategoryListing

```tsx
<Pagination page={2} totalPages={5} hrefFor={(n)=>`?page=${n}`} />
```

## Drawer

`src/components/ui/Modal.tsx` · ui/overlay · updated 2026-11-12

Slide-in panel built on the same dialog frame (cart, filters, mobile menu).

**Props**

- `side`: left|right|bottom
- `open`: boolean
- `onOpenChange`: fn
- `trigger`: ReactNode
- `title`: string
- `footer`: ReactNode

**Variants:** left, right, bottom

**Tokens:** `color.border` `color.overlay` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `maxWidth.container` `maxWidth.drawer` `maxWidth.menu` `maxWidth.modal` `maxWidth.narrow` `radius.lg` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `zIndex.modal` `zIndex.overlay`

**Accessibility:** Same as Modal.

**Used in:** CartDrawer, CategoryListing, MobileNav

```tsx
<Drawer side="right" title="Your cart" open={isOpen} onOpenChange={setOpen}>…</Drawer>
```

## Modal

`src/components/ui/Modal.tsx` · ui/overlay · updated 2026-11-12

Centred Radix dialog (product image zoom, confirmations).

**Props**

- `open`: boolean
- `onOpenChange`: (open)=>void
- `trigger`: ReactNode
- `title`: string
- `hideTitle`: boolean
- `description`: string
- `footer`: ReactNode
- `size`: sm|md|lg|full

**Sizes:** sm (`max-w-narrow`), md (`max-w-modal`), lg (`max-w-menu`), full (`max-w-container`)

**Tokens:** `color.border` `color.overlay` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `maxWidth.container` `maxWidth.drawer` `maxWidth.menu` `maxWidth.modal` `maxWidth.narrow` `radius.lg` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `zIndex.modal` `zIndex.overlay`

**Accessibility:** Focus trap, Escape closes, scroll lock, labelled by title, 44px close button.

**Used in:** ProductGallery

```tsx
<Modal open={o} onOpenChange={setO} title="Zoom">…</Modal>
```

## Heading

`src/components/ui/Heading.tsx` · ui/typography · updated 2026-11-12

Heading with semantic level independent from visual size (keeps one H1 and logical H2/H3).

**Props**

- `as`: h1|h2|h3|h4|p
- `size`: sm|md|lg|xl|display

**Variants:** sm, md, lg, xl, display

**Tokens:** `color.text` `font.family.heading` `font.size.2xl` `font.size.3xl` `font.size.4xl` `font.size.5xl` `font.size.lg` `font.size.xl` `font.tracking.tight` `font.weight.semibold`

**Accessibility:** Choose `as` for document outline, `size` for look.

**Used in:** SectionHeader

```tsx
<Heading as="h2" size="lg">Bestsellers</Heading>
```

## SectionHeader

`src/components/ui/SectionHeader.tsx` · ui/typography · updated 2026-11-12

Section title row with eyebrow, subtitle and View all link.

**Props**

- `title`: string
- `id`: string
- `subtitle`: string
- `eyebrow`: string
- `viewAllHref`: string
- `viewAllLabel`: string
- `align`: left|center
- `as`: h1|h2|h3

**Variants:** left, center

**Tokens:** `color.primary` `color.text` `color.textMuted` `font.size.base` `font.size.sm` `font.tracking.wider` `font.weight.semibold` `maxWidth.prose` `space.1` `space.11` `space.2` `space.4` `space.6` `space.8`

**Accessibility:** View all link includes sr-only section name for unique link text.

**Used in:** CategoryTiles, GuideCards, ProductGrid, app:/, app:/[category]/[sub]/[product], app:/admin, sections/InfoSections

```tsx
<SectionHeader title="Bestsellers" viewAllHref="/bestsellers" />
```

## AddToCartButton

`src/components/commerce/AddToCartButton.tsx` · commerce · updated 2026-11-12

Adds a product to the cart (opens drawer) or Buy Now (goes to checkout); renders Sold out when unavailable.

**Props**

- `product`: CardProduct subset
- `quantity`: number
- `mode`: add|buy
- `label`: string
- `showIcon`: boolean
- `size`: Button size
- `fullWidth`: boolean
- `variant`: Button variant override

**Variants:** add, buy, sold-out

**Tokens:** `space.4`

**Accessibility:** aria-label includes product title; disabled Sold out state.

**Used in:** ProductCard, commerce/ProductBuyBox

```tsx
<AddToCartButton product={card} mode="buy" size="lg" fullWidth />
```

## CartButton

`src/components/commerce/CartButton.tsx` · commerce · updated 2026-11-12

Header cart icon with live count; opens CartDrawer.

**Tokens:** `color.primary` `color.secondary` `color.text` `color.textInverse` `font.size.xs` `font.weight.bold` `radius.full` `radius.md` `shadow.focus` `space.0.5` `space.1` `space.11` `space.5` `space.6`

**Accessibility:** aria-label includes item count.

**Used in:** Header

```tsx
<CartButton />
```

## CartDrawer

`src/components/commerce/CartDrawer.tsx` · commerce · updated 2026-11-12

Slide-in mini cart mounted once in StoreShell.

**Tokens:** `color.border` `color.textMuted` `font.size.lg` `font.weight.semibold` `space.12` `space.16` `space.2` `space.3` `space.4`

**Accessibility:** Drawer semantics; empty state with next action.

**Used in:** StoreShell

```tsx
<CartDrawer />
```

## CartLineItem

`src/components/commerce/CartLineItem.tsx` · commerce · updated 2026-11-12

Cart row with thumbnail, price, quantity stepper and remove.

**Props**

- `line`: CartLine
- `size`: sm|md

**Sizes:** sm (`drawer`), md (`cart page`)

**Tokens:** `color.background` `color.error` `color.text` `color.textMuted` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.20` `space.24` `space.3` `space.4`

**Accessibility:** Remove button labelled with product title.

**Used in:** CartDrawer, CartView

```tsx
<CartLineItem line={l} />
```

## CartView

`src/components/commerce/CartView.tsx` · commerce · updated 2026-11-12

Full cart page body.

**Tokens:** `color.border` `color.textMuted` `font.size.lg` `font.weight.semibold` `space.12` `space.16` `space.2` `space.24` `space.4` `space.8`

**Accessibility:** Headings and lists.

**Used in:** app:/cart

```tsx
<CartView />
```

## CategoryListing

`src/components/commerce/CategoryListing.tsx` · commerce · updated 2026-11-12

Client filters (budget, material, colour, rating), sort and pagination with URL state.

**Props**

- `products`: CardProduct[]
- `hideBudget`: boolean
- `emptyMessage`: string

**Tokens:** `color.border` `color.surface` `color.textMuted` `font.weight.semibold` `radius.lg` `space.1` `space.2` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Fieldsets with legends; result count is aria-live; filters in Drawer on mobile.

**Used in:** ListingTemplate

```tsx
<CategoryListing products={cards} />
```

## CheckoutForm

`src/components/commerce/CheckoutForm.tsx` · commerce · updated 2026-11-12

Contact + address form (RHF + Zod Indian PIN/phone) and prepaid pay button.

**Tokens:** `color.background` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.md` `space.14` `space.16` `space.24` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Labels, autocomplete tokens, inline errors, fieldset legends.

**Used in:** app:/checkout

```tsx
<CheckoutForm />
```

## FreeShippingProgress

`src/components/commerce/OrderSummary.tsx` · commerce · updated 2026-11-12

'Add ₹X more for free delivery' with progress bar.

**Props**

- `subtotal`: number

**Tokens:** `color.border` `color.secondary` `color.success` `color.text` `color.textMuted` `duration.slow` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.bold` `font.weight.semibold` `radius.full` `space.2` `space.3`

**Accessibility:** Bar is aria-hidden; text conveys state.

**Used in:** CartDrawer, CartView, OrderSummary

```tsx
<FreeShippingProgress subtotal={320} />
```

## OrderStatusPoller

`src/components/commerce/OrderStatusPoller.tsx` · commerce · updated 2026-11-12

Refreshes the order success page every few seconds while payment confirmation (webhook) is pending.

**Props**

- `intervalMs`: number (default 3000)
- `maxAttempts`: number (default 20)

**Tokens:** `color.textMuted` `font.size.sm` `space.2` `space.4`

**Accessibility:** role=status live message; spinner is aria-hidden; gives a clear fallback message after the last attempt.

**Used in:** app:/order/[id]

```tsx
{!paid && <OrderStatusPoller />}
```

## OrderSummary

`src/components/commerce/OrderSummary.tsx` · commerce · updated 2026-11-12

Subtotal / delivery / savings / total breakdown.

**Props**

- `subtotal`: number
- `shipping`: number
- `total`: number
- `savings`: number
- `showFreeShippingHint`: boolean
- `title`: string

**Tokens:** `color.border` `color.secondary` `color.success` `color.text` `color.textMuted` `duration.slow` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.bold` `font.weight.semibold` `radius.full` `space.2` `space.3`

**Accessibility:** Definition list semantics.

**Used in:** CartDrawer, CartView, CheckoutForm, app:/order/[id]

```tsx
<OrderSummary subtotal={899} shipping={0} total={899} />
```

## PincodeChecker

`src/components/commerce/PincodeChecker.tsx` · commerce · updated 2026-11-12

PIN-code delivery estimate (zone table) with remembered PIN.

**Tokens:** `color.error` `color.success` `color.text` `color.textMuted` `font.size.sm` `space.0.5` `space.2` `space.4`

**Accessibility:** Labelled input, aria-live result, inline error.

**Used in:** app:/[category]/[sub]/[product]

```tsx
<PincodeChecker />
```

## PrepaidNotice

`src/components/commerce/PrepaidNotice.tsx` · commerce · updated 2026-11-12

States prepaid-only policy and accepted methods.

**Props**

- `variant`: inline|box

**Variants:** inline, box

**Tokens:** `color.background` `color.border` `color.success` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `space.0.5` `space.1` `space.1.5` `space.2` `space.4` `space.5`

**Accessibility:** Plain text; icons decorative.

**Used in:** CartDrawer, CartView, CheckoutForm, app:/[category]/[sub]/[product]

```tsx
<PrepaidNotice variant="inline" />
```

## PriceBlock

`src/components/commerce/PriceBlock.tsx` · commerce · updated 2026-11-12

Sale price, struck MRP and % off.

**Props**

- `price`: number
- `mrp`: number
- `size`: sm|md|lg
- `showTaxNote`: boolean

**Sizes:** sm (`card`), md (`default`), lg (`product page`)

**Tokens:** `color.success` `color.text` `color.textMuted` `font.family.body` `font.size.3xl` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.bold` `font.weight.semibold` `space.0.5` `space.2`

**Accessibility:** sr-only labels for sale price and MRP.

**Used in:** ProductCard, app:/[category]/[sub]/[product]

```tsx
<PriceBlock price={449} mrp={899} size="lg" showTaxNote />
```

## ProductBuyBox

`src/components/commerce/ProductBuyBox.tsx` · commerce · updated 2026-11-12

Quantity + Add to Cart + Buy Now; drives the mobile StickyBuyBar.

**Props**

- `product`: CardProduct

**Tokens:** `color.border` `color.surface` `color.textMuted` `duration.base` `font.size.lg` `font.size.sm` `font.weight.bold` `font.weight.medium` `shadow.lg` `space.0` `space.3` `space.4` `zIndex.sticky`

**Accessibility:** Stepper labelled; buttons 48px.

**Used in:** app:/[category]/[sub]/[product]

```tsx
<ProductBuyBox product={card} />
```

## ProductCard

`src/components/commerce/ProductCard.tsx` · commerce · updated 2026-11-12

Product tile: hover second image, discount/sold-out/bestseller badges, title, rating, price, Add to Cart.

**Props**

- `product`: CardProduct
- `variant`: default|plain
- `priority`: boolean (LCP)
- `headingLevel`: h2|h3

**Variants:** default, plain

**Tokens:** `aspect.product` `color.background` `color.border` `color.surface` `color.text` `duration.slow` `font.lineHeight.snug` `font.size.base` `font.weight.medium` `radius.lg` `shadow.focus` `space.0` `space.1` `space.2` `space.3` `space.4` `zIndex.base` `zIndex.raised`

**Accessibility:** Stretched title link makes the card clickable; button sits above it; hover image is aria-hidden.

**Used in:** CategoryListing, ListingTemplate, ProductGrid, app:/guides/[slug]

```tsx
<ProductCard product={toCardProduct(p)} />
```

## ProductGallery

`src/components/commerce/ProductGallery.tsx` · commerce · updated 2026-11-12

Main image, thumbnails, counter, arrows and zoom modal with hover magnify.

**Props**

- `images`: {src,alt}[]
- `title`: string

**Tokens:** `aspect.product` `aspect.square` `color.background` `color.borderStrong` `color.ink` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.base` `font.size.sm` `radius.full` `radius.lg` `radius.md` `shadow.focus` `shadow.md` `space.0` `space.1` `space.11` `space.16` `space.2` `space.20` `space.3` `space.4` `space.5` `zIndex.base` `zIndex.raised`

**Accessibility:** Arrow keys switch images; labelled buttons; aria-current thumb.

**Used in:** app:/[category]/[sub]/[product]

```tsx
<ProductGallery images={p.images} title={p.title} />
```

## RatingStars

`src/components/commerce/RatingStars.tsx` · commerce · updated 2026-11-12

Read-only star rating with fractional fill.

**Props**

- `value`: number 0–5
- `count`: number
- `size`: sm|md|lg
- `showValue`: boolean

**Sizes:** sm (`h-4`), md (`h-5`), lg (`h-6`)

**Tokens:** `color.rating` `color.secondaryStrong` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `space.0` `space.1.5` `space.4` `space.5` `space.6`

**Accessibility:** role=img with text label 'Rated x out of 5 from n reviews'.

**Used in:** ProductCard, ReviewList, app:/[category]/[sub]/[product]

```tsx
<RatingStars value={4.4} count={318} />
```

## ReviewList

`src/components/commerce/ReviewList.tsx` · commerce · updated 2026-11-12

Rating summary with distribution plus reviews with photos.

**Props**

- `reviews`: Review[]
- `rating`: number
- `reviewCount`: number
- `productTitle`: string

**Tokens:** `color.background` `color.border` `color.rating` `color.secondary` `color.success` `color.text` `color.textMuted` `font.family.heading` `font.size.5xl` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.full` `radius.md` `space.1` `space.1.5` `space.2` `space.20` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Review photos have descriptive alt text.

**Used in:** app:/[category]/[sub]/[product]

```tsx
<ReviewList reviews={r} rating={4.4} reviewCount={318} productTitle={t} />
```

## SearchBox

`src/components/commerce/SearchBox.tsx` · commerce · updated 2026-11-12

GET form to /search (works without JS; SearchAction target).

**Props**

- `defaultValue`: string
- `size`: sm|md|lg
- `placeholder`: string
- `id`: string

**Sizes:** sm (`h-9`), md (`h-11`), lg (`h-12`)

**Tokens:** `color.background` `radius.full` `space.4`

**Accessibility:** role=search, sr-only label.

**Used in:** Header, NotFoundContent

```tsx
<SearchBox />
```

## StickyBuyBar

`src/components/commerce/ProductBuyBox.tsx` · commerce · updated 2026-11-12

Mobile-only fixed bottom bar with price and buy actions.

**Props**

- `product`: CardProduct
- `quantity`: number
- `visible`: boolean

**Tokens:** `color.border` `color.surface` `color.textMuted` `duration.base` `font.size.lg` `font.size.sm` `font.weight.bold` `font.weight.medium` `shadow.lg` `space.0` `space.3` `space.4` `zIndex.sticky`

**Accessibility:** aria-hidden when off-screen.

**Used in:** ProductBuyBox

```tsx
<StickyBuyBar product={card} quantity={1} visible />
```

## TrackOrderForm

`src/components/commerce/TrackOrderForm.tsx` · commerce · updated 2026-11-12

Order number + phone lookup with status timeline.

**Props**

- `defaultOrder`: string

**Tokens:** `color.border` `color.error` `color.errorSoft` `color.success` `color.textMuted` `font.family.heading` `font.size.2xl` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.0` `space.1` `space.2` `space.3` `space.4` `space.6`

**Accessibility:** aria-live results; ordered timeline with sr-only state.

**Used in:** app:/track-order

```tsx
<TrackOrderForm defaultOrder="CS1001" />
```

## AnswerIntro

`src/components/sections/InfoSections.tsx` · section · updated 2026-11-12

H1 + 1–2 sentence direct answer for AEO at the top of listing and info pages.

**Props**

- `title`: string
- `answer`: string
- `meta`: string

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Provides the page's single H1.

**Used in:** ContentPage, ListingTemplate, app:/account, app:/contact, app:/faq, app:/track-order

```tsx
<AnswerIntro title="Kitchen & Dining" answer="…" />
```

## BrandStory

`src/components/sections/InfoSections.tsx` · section · updated 2026-11-12

'Why choose City Seller?' story with category blurbs.

**Props**

- `title`: string
- `paragraphs`: string[]
- `blurbs`: {title,text,href}[]
- `background`: token

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** H2 + H3 blurbs.

**Used in:** app:/

```tsx
<BrandStory title="Why choose City Seller?" paragraphs={…} blurbs={…} />
```

## CategoryTiles

`src/components/sections/CategoryTiles.tsx` · section · updated 2026-11-12

Navigational tiles for categories, featured collections and budget tiers.

**Props**

- `title`: string
- `subtitle`: string
- `items`: {label,href,image?,caption?}[]
- `variant`: circle|card|price
- `background`: token
- `spacing`: token

**Variants:** circle, card, price

**Tokens:** `aspect.square` `aspect.tile` `color.border` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.base` `duration.slow` `font.family.heading` `font.size.2xl` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.full` `radius.lg` `shadow.focus` `shadow.md` `space.1` `space.2` `space.24` `space.4`

**Accessibility:** Tiles are links with visible text.

**Used in:** app:/

```tsx
<CategoryTiles title="Shop by category" items={…} />
```

## ContentPage

`src/components/sections/ContentPage.tsx` · section · updated 2026-11-12

Policy/info page template from ContentPage data.

**Props**

- `page`: ContentPage
- `crumbs`: Crumb[]

**Tokens:** `space.12`

**Accessibility:** Article with H1/H2 outline.

**Used in:** app:/about, app:/policies/[slug]

```tsx
<ContentPage page={policies.shipping} crumbs={…} />
```

## CustomerCare

`src/components/sections/InfoSections.tsx` · section · updated 2026-11-12

Care block: phone, WhatsApp, email, hours + Track order.

**Props**

- `background`: token

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Contact links are real tel:/mailto:.

**Used in:** app:/, app:/contact, app:/faq

```tsx
<CustomerCare />
```

## FAQSection

`src/components/sections/InfoSections.tsx` · section · updated 2026-11-12

FAQ accordion with FAQPage JSON-LD.

**Props**

- `title`: string
- `faqs`: Faq[]
- `withJsonLd`: boolean
- `background`: token
- `spacing`: token
- `bare`: boolean

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Questions are h3 buttons.

**Used in:** ContentPage, ListingTemplate, app:/, app:/[category]/[sub]/[product], app:/faq, app:/guides/[slug]

```tsx
<FAQSection faqs={category.faqs} />
```

## GuideCards

`src/components/sections/GuideCards.tsx` · section · updated 2026-11-12

Buying-guide card grid.

**Props**

- `title`: string
- `posts`: Post[]
- `viewAllHref`: string
- `background`: token
- `asPage`: boolean

**Tokens:** `aspect.banner` `color.background` `color.border` `color.surface` `color.textMuted` `font.family.heading` `font.size.base` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `space.0` `space.2` `space.4` `space.6`

**Accessibility:** Stretched-link cards.

**Used in:** app:/, app:/guides

```tsx
<GuideCards posts={posts} />
```

## HeroBanner

`src/components/sections/HeroBanner.tsx` · section · updated 2026-11-12

Offer hero with copy, CTAs, highlight chips and priority image (LCP).

**Props**

- `eyebrow`: string
- `title`: string
- `text`: string
- `image`: {src,alt}
- `primaryCta`: {label,href}
- `secondaryCta`: {label,href}
- `highlights`: string[]
- `background`: Section background token
- `as`: h1|h2

**Tokens:** `aspect.banner` `color.primary` `color.surface` `color.text` `font.family.heading` `font.size.4xl` `font.size.5xl` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.tracking.wider` `font.weight.medium` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.xl` `space.1` `space.12` `space.2` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Use as=h1 only once per page.

**Used in:** app:/

```tsx
<HeroBanner title="…" text="…" image={…} primaryCta={…} />
```

## ListingTemplate

`src/components/sections/ListingTemplate.tsx` · section · updated 2026-11-12

Shared listing body: breadcrumbs, AnswerIntro, chips, CategoryListing (static fallback grid), FAQs, ItemList JSON-LD.

**Props**

- `crumbs`: Crumb[]
- `title`: string
- `answer`: string
- `products`: CardProduct[]
- `chips`: {label,href,active}[]
- `faqs`: Faq[]
- `hideBudget`: boolean
- `emptyMessage`: string

**Tokens:** `space.3` `space.6`

**Accessibility:** Single H1; chips nav labelled Refine.

**Used in:** app:/[category], app:/[category]/[sub], app:/bestsellers, app:/budget/[tier], app:/flash-sale, app:/search

```tsx
<ListingTemplate crumbs={…} title="Cleaning" answer={…} products={cards} />
```

## NotFoundContent

`src/components/sections/NotFoundContent.tsx` · section · updated 2026-11-12

404 body with search and helpful links.

**Tokens:** `color.primary` `color.textMuted` `font.family.heading` `font.size.3xl` `font.size.5xl` `font.weight.semibold` `maxWidth.modal` `space.3` `space.4`

**Accessibility:** H1 + search.

**Used in:** app: (not-found)

```tsx
<NotFoundContent />
```

## ProductGrid

`src/components/sections/ProductGrid.tsx` · section · updated 2026-11-12

Titled product section; grid or mobile carousel (Bestsellers, Flash sale, Related).

**Props**

- `title`: string
- `subtitle`: string
- `eyebrow`: string
- `products`: CardProduct[]
- `viewAllHref`: string
- `layout`: grid|carousel
- `columns`: 3|4
- `background`: token
- `spacing`: none|sm|md|lg
- `priorityCount`: number

**Variants:** grid, carousel

**Tokens:** `space.0` `space.2` `space.3` `space.4` `space.6` `space.64`

**Accessibility:** Section labelled by its heading.

**Used in:** app:/, app:/[category]/[sub]/[product]

```tsx
<ProductGrid title="Bestsellers" products={cards} viewAllHref="/bestsellers" />
```

## SaleBanner

`src/components/sections/SaleBanner.tsx` · section · updated 2026-11-12

Promo banner with live text over decorative art.

**Props**

- `eyebrow`: string
- `title`: string
- `text`: string
- `cta`: {label,href}
- `image`: string
- `tone`: soft|sand|ink
- `headingLevel`: h2|h3

**Variants:** soft, sand, ink

**Tokens:** `color.ink` `color.primary` `color.primarySoft` `color.secondary` `color.text` `color.textInverse` `font.family.heading` `font.size.2xl` `font.size.3xl` `font.size.base` `font.size.sm` `font.tracking.wider` `font.weight.semibold` `radius.xl` `space.2` `space.48` `space.6` `space.8` `zIndex.base` `zIndex.raised`

**Accessibility:** Text never baked into images; image alt empty (decorative).

**Used in:** app:/

```tsx
<SaleBanner title="Up to 50% off" cta={{label:"Shop",href:"/kitchen"}} />
```

## ValueProps

`src/components/sections/InfoSections.tsx` · section · updated 2026-11-12

Five value propositions (range, pricing, shipping, returns, secure prepaid).

**Props**

- `title`: string
- `items`: {icon,title,text}[]
- `background`: token
- `hideTitle`: boolean

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Section has aria-label.

**Used in:** app:/, app:/about

```tsx
<ValueProps />
```

## Breadcrumbs

`src/components/layout/Breadcrumbs.tsx` · layout · updated 2026-11-12

Breadcrumb trail with BreadcrumbList JSON-LD; Home auto-prepended.

**Props**

- `items`: {label,href?}[]
- `withJsonLd`: boolean

**Tokens:** `color.text` `color.textMuted` `font.size.sm` `space.1` `space.3` `space.9`

**Accessibility:** nav aria-label=Breadcrumb, aria-current=page.

**Used in:** ContentPage, ListingTemplate, app:/[category]/[sub]/[product], app:/account, app:/admin/orders/[id], app:/admin/products/[id], app:/admin/products/new, app:/cart, app:/checkout, app:/contact, app:/faq, app:/guides, app:/guides/[slug], app:/track-order

```tsx
<Breadcrumbs items={[{label:"Kitchen",href:"/kitchen"},{label:"Jars"}]} />
```

## BudgetMenu

`src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-12

'Shop by Budget' dropdown of five price tiers.

**Tokens:** `color.background` `color.primary` `color.text` `color.textMuted` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.1` `space.11` `space.2` `space.3` `space.8` `space.9`

**Accessibility:** Links in list.

**Used in:** Header

```tsx
<BudgetMenu />
```

## Container

`src/components/layout/Container.tsx` · layout · updated 2026-11-12

Centred page-width wrapper with standard gutters.

**Props**

- `as`: ElementType
- `width`: default|narrow|prose|full

**Variants:** default, narrow, prose, full

**Tokens:** `color.background` `color.ink` `color.primarySoft` `color.secondary` `color.surface` `color.textInverse` `maxWidth.container` `maxWidth.narrow` `maxWidth.prose` `space.0` `space.10` `space.16` `space.24` `space.4` `space.6` `space.8`

**Accessibility:** Neutral.

**Used in:** ContentPage, Footer, Header, HeroBanner, ListingTemplate, Section, TopBar, app:/[category]/[sub]/[product], app:/account, app:/cart, app:/checkout, app:/contact, app:/faq, app:/guides, app:/guides/[slug], app:/order/[id], app:/track-order, layout/MegaMenu

```tsx
<Container>…</Container>
```

## Footer

`src/components/layout/Footer.tsx` · layout · updated 2026-11-12

Footer: care hours/phone/email, shop, help, policies, socials, business name.

**Props**

- `tree`: NavCategory[]

**Tokens:** `color.ink` `color.surface` `color.textInverse` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.10` `space.11` `space.12` `space.2` `space.3` `space.4` `space.6` `space.9`

**Accessibility:** Contentinfo landmark; headings per column.

**Used in:** StoreShell

```tsx
<Footer tree={tree} />
```

## Header

`src/components/layout/Header.tsx` · layout · updated 2026-11-12

Sticky header: logo, search, account, cart, desktop nav row.

**Props**

- `tree`: NavCategory[]

**Tokens:** `color.border` `color.primary` `color.secondary` `color.surface` `color.text` `font.size.base` `font.weight.medium` `maxWidth.narrow` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `zIndex.sticky`

**Accessibility:** Main nav landmark; mobile search row.

**Used in:** StoreShell

```tsx
<Header tree={tree} />
```

## Logo

`src/components/layout/Logo.tsx` · layout · updated 2026-11-12

City Seller wordmark link to home.

**Props**

- `inverse`: boolean

**Variants:** default, inverse

**Tokens:** `color.primary` `color.surface` `color.text` `color.textInverse` `font.family.heading` `font.size.xl` `font.tracking.tight` `font.weight.bold` `space.11` `space.2` `space.8`

**Accessibility:** Link aria-label 'City Seller home'.

**Used in:** AdminShell, Footer, Header, app:/admin/login

```tsx
<Logo />
```

## MegaMenu

`src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-12

Data-driven 'Shop by Category' mega-menu (category → subcategory links with thumbnails).

**Props**

- `tree`: NavCategory[]

**Tokens:** `color.background` `color.primary` `color.text` `color.textMuted` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.1` `space.11` `space.2` `space.3` `space.8` `space.9`

**Accessibility:** Links in lists.

**Used in:** Header

```tsx
<MegaMenu tree={tree} />
```

## MobileNav

`src/components/layout/MobileNav.tsx` · layout · updated 2026-11-12

Hamburger + left drawer with category accordion, budget tiers, links and socials.

**Props**

- `tree`: NavCategory[]

**Tokens:** `color.border` `color.secondary` `color.text` `color.textMuted` `font.size.base` `font.size.sm` `font.tracking.wider` `font.weight.semibold` `radius.md` `space.1` `space.11` `space.2` `space.4` `space.6`

**Accessibility:** Drawer semantics; nav aria-label=Mobile.

**Used in:** Header

```tsx
<MobileNav tree={tree} />
```

## NavDropdown

`src/components/layout/NavDropdown.tsx` · layout · updated 2026-11-12

Disclosure dropdown used by MegaMenu and BudgetMenu (hover + click + Escape).

**Props**

- `label`: string
- `panel`: mega|menu
- `children`: ReactNode

**Variants:** mega, menu

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `duration.fast` `font.size.base` `font.weight.medium` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.11` `space.3` `space.4` `space.64` `zIndex.dropdown`

**Accessibility:** Button with aria-expanded/aria-controls; Escape and outside click close.

**Used in:** layout/MegaMenu

```tsx
<NavDropdown label="Shop by Budget">…</NavDropdown>
```

## Section

`src/components/layout/Container.tsx` · layout · updated 2026-11-12

Full-bleed band with background token and vertical rhythm.

**Props**

- `background`: background|surface|secondary|soft|ink
- `spacing`: none|sm|md|lg
- `containerWidth`: Container width

**Variants:** background, surface, secondary, soft, ink

**Sizes:** none (`py-0`), sm (`py-6 md:py-8`), md (`py-10 md:py-16`), lg (`py-16 md:py-24`)

**Tokens:** `color.background` `color.ink` `color.primarySoft` `color.secondary` `color.surface` `color.textInverse` `maxWidth.container` `maxWidth.narrow` `maxWidth.prose` `space.0` `space.10` `space.16` `space.24` `space.4` `space.6` `space.8`

**Accessibility:** Pass aria-labelledby to name the region.

**Used in:** CategoryTiles, GuideCards, NotFoundContent, ProductGrid, app:/, app:/[category]/[sub]/[product], sections/InfoSections

```tsx
<Section background="surface">…</Section>
```

## StoreShell

`src/components/layout/StoreShell.tsx` · layout · updated 2026-11-12

Storefront chrome (skip link, TopBar, Header, Footer, CartDrawer, Organization + WebSite JSON-LD).

**Props**

- `children`: ReactNode

**Tokens:** `color.surface` `radius.md` `shadow.lg` `space.2` `space.4` `zIndex.toast`

**Accessibility:** Skip-to-content link; main landmark.

**Used in:** app: (layout), app: (not-found)

```tsx
<StoreShell>{children}</StoreShell>
```

## TopBar

`src/components/layout/TopBar.tsx` · layout · updated 2026-11-12

Promo strip with socials, Track order and Login.

**Tokens:** `color.ink` `color.surface` `color.textInverse` `font.size.sm` `font.weight.semibold` `radius.md` `space.1` `space.2` `space.4` `space.9`

**Accessibility:** Social links labelled.

**Used in:** StoreShell

```tsx
<TopBar />
```

## AdminShell

`src/components/admin/AdminShell.tsx` · admin · updated 2026-11-12

Admin layout: sidebar (desktop) / scrolling nav (mobile), pending-orders badge, sign-out, dev-mode banner.

**Props**

- `email`: string
- `devMode`: boolean
- `pendingCount`: number
- `signOut`: server action
- `children`: ReactNode

**Tokens:** `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `color.warning` `color.warningSoft` `font.size.base` `font.size.sm` `font.size.xs` `font.tracking.wide` `font.weight.bold` `font.weight.medium` `font.weight.semibold` `maxWidth.container` `radius.full` `radius.md` `radius.sm` `shadow.focus` `space.0` `space.0.5` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** nav aria-label=Admin, aria-current on active link, main landmark.

**Used in:** app:/admin (layout)

```tsx
<AdminShell email={admin.email} pendingCount={counts.paid}>…</AdminShell>
```

## CopyField

`src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Label + value + copy button for pasting customer details into Meesho.

**Props**

- `label`: string
- `value`: string
- `multiline`: boolean

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Used in:** app:/admin/orders/[id]

```tsx
<CopyField label="Phone" value={a.phone} />
```

## ImageManager

`src/components/admin/ImageManager.tsx` · admin · updated 2026-11-12

Product photo list: upload to Supabase Storage or add by path, alt text, reorder, remove.

**Props**

- `images`: {src,alt}[]
- `onChange`: (images)=>void
- `upload`: server action (FormData) => {src?, error?}
- `slug`: string
- `defaultAlt`: string
- `error`: string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.surface` `color.text` `color.textMuted` `font.size.sm` `radius.md` `shadow.focus` `space.0` `space.1` `space.16` `space.2` `space.3` `space.4` `space.9`

**Accessibility:** Alt text required per image; labelled reorder/remove buttons.

**Used in:** ProductForm

```tsx
<ImageManager images={imgs} onChange={setImgs} upload={uploadImageAction} slug={slug} defaultAlt={title} />
```

## LoginForm

`src/components/admin/LoginForm.tsx` · admin · updated 2026-11-12

Email + password sign-in for partners in public.admins.

**Props**

- `action`: server action (prev, FormData) => ActionState

**Tokens:** `color.error` `color.errorSoft` `font.size.sm` `radius.md` `space.3` `space.4`

**Accessibility:** Labelled fields, autocomplete tokens, alert on error.

**Used in:** app:/admin/login

```tsx
<LoginForm action={signInAction} />
```

## MarginText

`src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Margin in ₹ and % (green ≥ 25%, amber below, red if negative).

**Props**

- `price`: number
- `cost`: number
- `quantity`: number

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Value is text; colour is supplementary.

**Used in:** app:/admin, app:/admin/orders, app:/admin/orders/[id], app:/admin/products

```tsx
<MarginText price={449} cost={260} />
```

## OrderActions

`src/components/admin/OrderActions.tsx` · admin · updated 2026-11-12

Order fulfilment form: Meesho order ID/cost, tracking link, note, refund toggle, one button per allowed status, WhatsApp link.

**Props**

- `orderId`: string
- `next`: OrderStatus[]
- `defaults`: {meeshoOrderId?, meeshoCost?, trackingUrl?}
- `canRefund`: boolean
- `whatsappHref`: string
- `action`: server action

**Tokens:** `color.error` `color.errorSoft` `color.success` `color.successSoft` `color.textMuted` `font.size.sm` `radius.md` `space.2` `space.3` `space.4`

**Accessibility:** Inline field errors; destructive actions confirm first; result announced.

**Used in:** app:/admin/orders/[id]

```tsx
<OrderActions orderId={o.id} next={adminTransitions(o.status)} … />
```

## OrderStatusBadge

`src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Admin status pill using internal labels; needs-action states in warning tone.

**Props**

- `status`: OrderStatus

**Variants:** pending_payment, paid, placed_on_meesho, shipped, delivered, cancelled_refunded, return_requested, returned_refunded

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Text label (colour is not the only signal).

**Used in:** app:/admin, app:/admin/orders, app:/admin/orders/[id]

```tsx
<OrderStatusBadge status="paid" />
```

## OrderTimeline

`src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Newest-first order event history with time and note.

**Props**

- `events`: OrderEvent[]

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Ordered list with time elements.

**Used in:** app:/admin/orders/[id]

```tsx
<OrderTimeline events={order.events} />
```

## ProductForm

`src/components/admin/ProductForm.tsx` · admin · updated 2026-11-12

Create/edit product: basics, pricing with live margin and discount, Meesho link/price + checked flag, photos, content, visibility, SEO.

**Props**

- `values`: ProductFormValues
- `categories`: CategoryOption[]
- `action`: server action
- `upload`: server action
- `notice`: string

**Tokens:** `color.background` `color.border` `color.error` `color.errorSoft` `color.success` `color.successSoft` `color.surface` `color.textMuted` `color.warning` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `radius.md` `space.0` `space.3` `space.4` `space.6` `zIndex.sticky`

**Accessibility:** Fieldsets with legends, inline errors, live margin region, sticky save bar.

**Used in:** app:/admin/products/[id], app:/admin/products/new

```tsx
<ProductForm values={toFormValues(p)} categories={cats} action={saveProductAction} upload={uploadImageAction} />
```

## StatCard

`src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Dashboard KPI card.

**Props**

- `label`: string
- `value`: ReactNode
- `hint`: ReactNode
- `tone`: default|warning|success

**Variants:** default, warning, success

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Used in:** app:/admin

```tsx
<StatCard label="To place" value={3} tone="warning" />
```

## cartTotals

`src/hooks/useCart.ts` · hook · updated 2026-11-12

Derives count, subtotal, MRP total, savings, shipping and total from cart lines.

**Props**

- `items`: CartLine[]

**Used in:** CartButton, CartDrawer, CartView, CheckoutForm

```tsx
const { total } = cartTotals(items)
```

## useCart

`src/hooks/useCart.ts` · hook · updated 2026-11-12

Zustand cart store persisted to localStorage (items, drawer state, add/setQuantity/remove/clear).

**Props**

- `returns`: {items,isOpen,add,setQuantity,remove,clear,open,close,setOpen}

**Used in:** AddToCartButton, CartButton, CartDrawer, CartLineItem, CartView, CheckoutForm

```tsx
const add = useCart((s) => s.add)
```

## useHydrated

`src/hooks/useHydrated.ts` · hook · updated 2026-11-12

True after client hydration (guards localStorage-backed UI).

**Props**

- `returns`: boolean

**Used in:** CartButton, CartDrawer, CartView, CheckoutForm

```tsx
const hydrated = useHydrated()
```

## useRazorpay

`src/hooks/useRazorpay.ts` · hook · updated 2026-11-12

Loads Razorpay Checkout.js on demand and opens it; resolves with the signed success payload or rejects (PaymentDismissedError on close).

**Props**

- `options`: RazorpayCheckoutOptions (from /api/checkout)
- `theme`: { color?: string }
- `returns`: (options, theme) => Promise<RazorpaySuccess>

**Used in:** CheckoutForm

```tsx
const open = useRazorpay(); const result = await open(data.checkout, { color: color.primary });
```

## buildCategoryTree

`src/components/layout/MegaMenu.tsx` · util · updated 2026-11-12

Turns flat categories into a top-level tree with children.

**Props**

- `categories`: Category[]

**Tokens:** `color.background` `color.primary` `color.text` `color.textMuted` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.1` `space.11` `space.2` `space.3` `space.8` `space.9`

**Used in:** StoreShell, app:/, lib/admin/product-values

```tsx
buildCategoryTree(await repo.listCategories())
```

## calcDiscount

`src/lib/utils/format.ts` · util · updated 2026-11-12

Whole-number discount % from MRP and price.

**Props**

- `mrp`: number
- `price`: number

**Used in:** PriceBlock, ProductCard, ProductForm

```tsx
calcDiscount(899, 449) // 50
```

## calcMargin

`src/lib/utils/format.ts` · util · updated 2026-11-12

Margin amount and % of price between selling price and supplier cost.

**Props**

- `price`: number
- `cost`: number

**Used in:** ProductForm, admin/AdminBits

```tsx
calcMargin(449, 260) // { amount: 189, percent: 42 }
```

## cn

`src/lib/utils/cn.ts` · util · updated 2026-11-12

clsx + tailwind-merge configured for token class names.

**Props**

- `inputs`: ClassValue[]

**Used in:** AdminShell, Badge, Breadcrumbs, Button, Card, CartLineItem, CategoryListing, CategoryTiles, ChipNav, CopyButton, DataTable, FormField, Heading, HeroBanner, Logo, NavDropdown, PrepaidNotice, PriceBlock, ProductCard, ProductGallery, ProductGrid, RatingStars, SaleBanner, SearchBox, SectionHeader, TrackOrderForm, admin/AdminBits, commerce/OrderSummary, commerce/ProductBuyBox, layout/Container, sections/InfoSections, ui/Checkbox, ui/Disclosure, ui/Icon, ui/Input, ui/Misc, ui/Modal, ui/Toast

```tsx
cn("p-4", active && "bg-ink")
```

## daysSince

`src/lib/utils/format.ts` · util · updated 2026-11-12

Whole days since an ISO date (stale Meesho price checks).

**Props**

- `iso`: string
- `now`: Date

**Used in:** ProductForm, app:/admin, app:/admin/products

```tsx
daysSince(p.priceCheckedAt) > 7
```

## estimateDelivery

`src/lib/utils/delivery.ts` · util · updated 2026-11-12

PIN-zone delivery window (dates + region); SHIPPING constant in the same file.

**Props**

- `pincode`: string
- `now`: Date

**Used in:** PincodeChecker, app:/order/[id]

```tsx
estimateDelivery("411001")
```

## formatDate

`src/lib/utils/format.ts` · util · updated 2026-11-12

ISO date → '12 Nov 2026' (en-IN).

**Props**

- `iso`: string|Date

**Used in:** ContentPage, GuideCards, ReviewList, TrackOrderForm, admin/AdminBits, app:/admin, app:/admin/orders, app:/admin/orders/[id], app:/guides/[slug]

```tsx
formatDate(order.createdAt)
```

## formatINR

`src/lib/utils/format.ts` · util · updated 2026-11-12

Formats rupees with Indian grouping: 1299 → ₹1,299.

**Props**

- `amount`: number

**Used in:** CartLineItem, CheckoutForm, PincodeChecker, PriceBlock, ProductForm, TrackOrderForm, admin/AdminBits, app:/[category]/[sub]/[product], app:/admin, app:/admin/orders, app:/admin/orders/[id], app:/admin/products, app:/order/[id], commerce/OrderSummary, commerce/ProductBuyBox, lib/admin/whatsapp, lib/orders/service, sections/InfoSections

```tsx
formatINR(1299)
```

## getBudgetTier

`src/lib/utils/budget.ts` · util · updated 2026-11-12

Looks up a BUDGET_TIERS entry by slug (BUDGET_TIERS constant lives in the same file).

**Props**

- `slug`: string

**Used in:** app:/budget/[tier]

```tsx
getBudgetTier("under-599")
```

## inBudget

`src/lib/utils/budget.ts` · util · updated 2026-11-12

Whether a price falls inside a budget tier.

**Props**

- `price`: number
- `tier`: BudgetTier

```tsx
inBudget(449, tier)
```

## paths

`src/lib/utils/paths.ts` · util · updated 2026-11-12

Canonical URL builders (the only place URL shapes are defined).

**Props**

- `category(c)`: string
- `product(p)`: string
- `budget(slug)`: string
- `…`: see file

**Used in:** AddToCartButton, CartDrawer, CartView, CheckoutForm, Footer, GuideCards, Header, MobileNav, NotFoundContent, TopBar, app:/, app:/[category], app:/[category]/[sub], app:/[category]/[sub]/[product], app:/about, app:/account, app:/bestsellers, app:/budget/[tier], app:/cart, app:/checkout, app:/contact, app:/faq, app:/flash-sale, app:/guides, app:/guides/[slug], app:/order/[id], app:/policies/[slug], app:/search, app:/track-order, layout/MegaMenu, lib/admin/product-values, lib/data/seed-repo, lib/seo/jsonld, sections/InfoSections, toCardProduct

```tsx
paths.product(p)
```

## shippingFor

`src/lib/utils/delivery.ts` · util · updated 2026-11-12

Delivery fee for a subtotal (free above threshold).

**Props**

- `subtotal`: number

**Used in:** hooks/useCart, lib/data/seed-repo

```tsx
shippingFor(399) // 49
```

## slugify

`src/lib/utils/format.ts` · util · updated 2026-11-12

Text → URL slug.

**Props**

- `input`: string

**Used in:** CategoryTiles, ProductForm, ProductGrid, lib/admin/forms, sections/InfoSections

```tsx
slugify("Airtight Jar Set (6 pc)")
```

## toCardProduct

`src/lib/utils/product.ts` · util · updated 2026-11-12

Product → serializable CardProduct for client components.

**Props**

- `p`: Product

**Used in:** app:/, app:/[category], app:/[category]/[sub], app:/[category]/[sub]/[product], app:/bestsellers, app:/budget/[tier], app:/flash-sale, app:/guides/[slug], app:/search

```tsx
products.map(toCardProduct)
```

## tokenStyle

`src/lib/utils/token-style.ts` · util · updated 2026-11-12

Maps token names to inline CSS-variable styles for width/height/colour props.

**Props**

- `width`: SizeProp
- `height`: SizeProp
- `bg`: ColorToken
- `fg`: ColorToken

**Used in:** Button, Card

```tsx
tokenStyle({ width: "12", bg: "success" })
```

## validators

`src/lib/utils/validators.ts` · util · updated 2026-11-12

Zod schemas: pincodeSchema, phoneSchema, addressSchema, checkoutSchema, trackOrderSchema, INDIAN_STATES.

```tsx
addressSchema.safeParse(body)
```

## buildArticleJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

Article JSON-LD for guides.

**Props**

- `post`: Post

**Used in:** app:/guides/[slug]

```tsx
buildArticleJsonLd(post)
```

## buildBreadcrumbJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

BreadcrumbList JSON-LD.

**Props**

- `items`: Crumb[]

**Used in:** Breadcrumbs

```tsx
buildBreadcrumbJsonLd(crumbs)
```

## buildFaqJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

FAQPage JSON-LD.

**Props**

- `faqs`: Faq[]

**Used in:** sections/InfoSections

```tsx
buildFaqJsonLd(faqs)
```

## buildItemListJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

ItemList JSON-LD for listing pages.

**Props**

- `name`: string
- `items`: {name,url}[]

**Used in:** ListingTemplate

```tsx
buildItemListJsonLd(title, items)
```

## buildMetadata

`src/lib/seo/metadata.ts` · seo · updated 2026-11-12

Unique title/description, canonical, OG and Twitter metadata with DB overrides.

**Props**

- `title`: string
- `description`: string
- `path`: string
- `image`: string
- `seoTitle`: string
- `seoDescription`: string
- `type`: website|article
- `noindex`: boolean

**Used in:** app:/, app:/[category], app:/[category]/[sub], app:/[category]/[sub]/[product], app:/about, app:/account, app:/bestsellers, app:/budget/[tier], app:/cart, app:/checkout, app:/contact, app:/faq, app:/flash-sale, app:/guides, app:/guides/[slug], app:/order/[id], app:/policies/[slug], app:/search, app:/track-order

```tsx
export const metadata = buildMetadata({ title, description, path: "/" })
```

## buildOrganizationJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

OnlineStore/Organization JSON-LD.

**Used in:** StoreShell

```tsx
buildOrganizationJsonLd()
```

## buildProductJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

Product + Offer (shipping, returns) + AggregateRating JSON-LD.

**Props**

- `p`: Product
- `categoryName`: string

**Used in:** app:/[category]/[sub]/[product]

```tsx
buildProductJsonLd(p, 'Kitchen > Jars')
```

## buildWebSiteJsonLd

`src/lib/seo/jsonld.ts` · seo · updated 2026-11-12

WebSite JSON-LD with SearchAction.

**Used in:** StoreShell

```tsx
buildWebSiteJsonLd()
```

## JsonLd

`src/lib/seo/JsonLdScript.tsx` · seo · updated 2026-11-12

Renders JSON-LD script tags safely (escapes <).

**Props**

- `data`: object|object[]

**Used in:** Breadcrumbs, ListingTemplate, StoreShell, app:/[category]/[sub]/[product], app:/guides/[slug], sections/InfoSections

```tsx
<JsonLd data={buildFaqJsonLd(faqs)} />
```

