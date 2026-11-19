# City Seller component registry

> Generated from `registry.json` by `pnpm registry:sync`. Do not edit by hand; edit `registry.json` instead.

**Reuse-first rule:** before creating any UI element, search this list. Reuse via props/variants/tokens, extend an existing
component with a new variant if it is close, and only create a new component (then register it) if nothing similar exists.
Live previews: `/design-system`.

Total entries: **160**

| Name | Category | Path | Description | Variants | Used in |
|---|---|---|---|---|---|
| [Button](#button) | ui/action | `shared/src/components/ui/Button.tsx` | Primary action button used for Add to Cart, Buy Now, forms and links styled as buttons. | primary, secondary, soft, outline, ghost, link, danger, inverse | 41 |
| [CopyButton](#copybutton) | ui/action | `shared/src/components/ui/CopyButton.tsx` | Copies a value to the clipboard with a brief Copied state. | – | 1 |
| [Accordion](#accordion) | ui/disclosure | `shared/src/components/ui/Disclosure.tsx` | Radix accordion for FAQs and mobile nav. | plain, boxed, single, multiple | 2 |
| [Tabs](#tabs) | ui/disclosure | `shared/src/components/ui/Disclosure.tsx` | Radix tabs for grouped content. | – | 0 |
| [Badge](#badge) | ui/display | `shared/src/components/ui/Badge.tsx` | Small status label: discount %, Sold out, Bestseller. | sale, success, warning, error, neutral, outline, dark | 12 |
| [DataTable](#datatable) | ui/display | `shared/src/components/ui/DataTable.tsx` | Generic accessible data table (admin orders/products) with per-column alignment and mobile-hidden columns. | – | 5 |
| [Table](#table) | ui/display | `shared/src/components/ui/Misc.tsx` | Key–value HTML table (product specs, order details). | – | 1 |
| [PageSkeleton](#pageskeleton) | ui/feedback | `shared/src/components/ui/PageSkeleton.tsx` | Route-level loading placeholder shaped like the page that is loading. | home, listing, product, table, account, accountContent, order, checkout | 7 |
| [Skeleton](#skeleton) | ui/feedback | `shared/src/components/ui/Misc.tsx` | Pulse placeholder block sized with token classes. | – | 1 |
| [toast](#toast) | ui/feedback | `shared/src/components/ui/Toast.tsx` | Imperative function to show a toast from client code. | success, error, info | 4 |
| [Toaster](#toaster) | ui/feedback | `shared/src/components/ui/Toast.tsx` | Toast viewport; mount once in root layout. | – | 2 |
| [Checkbox](#checkbox) | ui/form | `shared/src/components/ui/Checkbox.tsx` | Radix checkbox with label row; used in filter facets. | – | 10 |
| [FormField](#formfield) | ui/form | `shared/src/components/ui/FormField.tsx` | Label + control + hint/error wrapper for all form controls. | – | 17 |
| [Input](#input) | ui/form | `shared/src/components/ui/Input.tsx` | Text input sharing fieldVariants with Textarea and Select; optional leading icon. | default, invalid | 20 |
| [PasswordInput](#passwordinput) | ui/form | `shared/src/components/ui/PasswordInput.tsx` | Password field with a show/hide eye toggle; accepts all Input props. | – | 4 |
| [QuantityStepper](#quantitystepper) | ui/form | `shared/src/components/ui/Misc.tsx` | −/+ quantity control. | – | 2 |
| [RadioGroup](#radiogroup) | ui/form | `shared/src/components/ui/Checkbox.tsx` | Radix radio group rendering a list of labelled options; used for budget and rating filters. | – | 1 |
| [Select](#select) | ui/form | `shared/src/components/ui/Input.tsx` | Native select styled with field tokens (best mobile UX); used for sort, state picker. | default, invalid | 9 |
| [Textarea](#textarea) | ui/form | `shared/src/components/ui/Input.tsx` | Multi-line text field with the same look as Input. | default, invalid | 8 |
| [Icon](#icon) | ui/icon | `shared/src/components/ui/Icon.tsx` | Token-sized wrapper for lucide icons. | – | 0 |
| [SocialIcon](#socialicon) | ui/icon | `shared/src/components/ui/Icon.tsx` | Inline brand marks (Instagram, Facebook, YouTube, WhatsApp). | instagram, facebook, youtube, whatsapp | 2 |
| [Card](#card) | ui/layout | `shared/src/components/ui/Card.tsx` | Surface container with padding/elevation variants; polymorphic `as`. | flat, raised, outline, interactive | 24 |
| [ScrollRail](#scrollrail) | ui/layout | `shared/src/components/ui/ScrollRail.tsx` | Sideways-scrolling list with snap and previous/next arrows on larger screens (hidden at the ends). | – | 2 |
| [Separator](#separator) | ui/layout | `shared/src/components/ui/Misc.tsx` | Horizontal or vertical rule. | horizontal, vertical | 0 |
| [ChipNav](#chipnav) | ui/navigation | `shared/src/components/ui/ChipNav.tsx` | Scrolling link chips with optional counts: listing refine chips, budget tiers, admin status filters. | default, active, with count | 4 |
| [Pagination](#pagination) | ui/navigation | `shared/src/components/ui/Misc.tsx` | Crawlable page links with prev/next and ellipsis. | – | 1 |
| [Drawer](#drawer) | ui/overlay | `shared/src/components/ui/Modal.tsx` | Slide-in panel built on the same dialog frame (cart, filters, mobile menu). | left, right, bottom | 3 |
| [Modal](#modal) | ui/overlay | `shared/src/components/ui/Modal.tsx` | Centred Radix dialog (product image zoom, confirmations). | – | 1 |
| [Heading](#heading) | ui/typography | `shared/src/components/ui/Heading.tsx` | Heading with semantic level independent from visual size (keeps one H1 and logical H2/H3). | sm, md, lg, xl, display | 1 |
| [SectionHeader](#sectionheader) | ui/typography | `shared/src/components/ui/SectionHeader.tsx` | Section title row with eyebrow, subtitle and View all link. | left, center | 7 |
| [AddToCartButton](#addtocartbutton) | commerce | `shared/src/components/commerce/AddToCartButton.tsx` | Adds a product to the cart (opens drawer) or Buy Now (goes to checkout); renders Sold out when unavailable. | add, buy, sold-out | 2 |
| [CartButton](#cartbutton) | commerce | `shared/src/components/commerce/CartButton.tsx` | Header cart icon with live count; opens CartDrawer. | – | 1 |
| [CartDrawer](#cartdrawer) | commerce | `shared/src/components/commerce/CartDrawer.tsx` | Slide-in mini cart mounted once in StoreShell. | – | 1 |
| [CartLineItem](#cartlineitem) | commerce | `shared/src/components/commerce/CartLineItem.tsx` | Cart row with thumbnail, price, quantity stepper and remove. | – | 2 |
| [CartView](#cartview) | commerce | `shared/src/components/commerce/CartView.tsx` | Full cart page body. | – | 1 |
| [CategoryBrowser](#categorybrowser) | commerce | `shared/src/components/commerce/CategoryBrowser.tsx` | All-categories browser (app style): category list on the left, compact picture tiles on the right (subcategories, then products with price); remembers the choice in ?c=. | – | 1 |
| [CategoryListing](#categorylisting) | commerce | `shared/src/components/commerce/CategoryListing.tsx` | Client filters (budget, material, colour, rating), sort and pagination with URL state. | – | 1 |
| [CheckoutForm](#checkoutform) | commerce | `shared/src/components/commerce/CheckoutForm.tsx` | Contact + address form (RHF + Zod Indian PIN/phone) and prepaid pay button. | – | 1 |
| [CustomerAuthForm](#customerauthform) | commerce | `shared/src/components/commerce/CustomerAuthForm.tsx` | Shopper sign in / create account / forgot password form (email + password). | – | 1 |
| [DeliveryPromise](#deliverypromise) | commerce | `shared/src/components/commerce/DeliveryPromise.tsx` | Product-page delivery line: 'Get it by <date>' for the saved PIN, plus free delivery or the fee. | – | 1 |
| [FreeDeliveryTag](#freedeliverytag) | commerce | `shared/src/components/commerce/FreeDeliveryTag.tsx` | 'Free delivery' note on product cards when the price reaches the free-delivery threshold from Settings. | – | 1 |
| [FreeShippingProgress](#freeshippingprogress) | commerce | `shared/src/components/commerce/OrderSummary.tsx` | 'Add ₹X more for free delivery' with progress bar. | – | 3 |
| [OrderSelfService](#orderselfservice) | commerce | `shared/src/components/commerce/OrderSelfService.tsx` | Shopper's own order page: Cancel order (before packing, instant refund), Request cancellation (while packing) or Request a return (after delivery, within the return window), each with a reason. | – | 1 |
| [OrderStatusPoller](#orderstatuspoller) | commerce | `shared/src/components/commerce/OrderStatusPoller.tsx` | Refreshes the order success page every few seconds while payment confirmation (webhook) is pending. | – | 1 |
| [OrderSummary](#ordersummary) | commerce | `shared/src/components/commerce/OrderSummary.tsx` | Subtotal / delivery / savings / total breakdown. | – | 4 |
| [PincodeChecker](#pincodechecker) | commerce | `shared/src/components/commerce/PincodeChecker.tsx` | PIN-code delivery estimate (zone table) with remembered PIN. | – | 1 |
| [PrepaidNotice](#prepaidnotice) | commerce | `shared/src/components/commerce/PrepaidNotice.tsx` | States prepaid-only policy and accepted methods. | inline, box | 4 |
| [PriceBlock](#priceblock) | commerce | `shared/src/components/commerce/PriceBlock.tsx` | Sale price, struck MRP and % off. | – | 2 |
| [ProductBuyBox](#productbuybox) | commerce | `shared/src/components/commerce/ProductBuyBox.tsx` | Quantity + Add to Cart + Buy Now; drives the mobile StickyBuyBar. | – | 1 |
| [ProductCard](#productcard) | commerce | `shared/src/components/commerce/ProductCard.tsx` | Product tile: hover second image, discount/sold-out/bestseller badges, title, rating, price, Add to Cart. | default, plain | 4 |
| [ProductGallery](#productgallery) | commerce | `shared/src/components/commerce/ProductGallery.tsx` | Main image, thumbnails, counter, arrows and zoom modal with hover magnify. | – | 1 |
| [PurchaseTracker](#purchasetracker) | commerce | `shared/src/components/commerce/PurchaseTracker.tsx` | Sends the GA4 purchase event once per order on the order success page. | – | 1 |
| [RatingStars](#ratingstars) | commerce | `shared/src/components/commerce/RatingStars.tsx` | Read-only star rating with fractional fill. | – | 3 |
| [ReviewForm](#reviewform) | commerce | `shared/src/components/commerce/ReviewForm.tsx` | Verified-purchase review for one delivered item: tappable 1–5 stars, optional title, review text; held for admin approval. | – | 1 |
| [ReviewList](#reviewlist) | commerce | `shared/src/components/commerce/ReviewList.tsx` | Rating summary with distribution plus reviews with photos. | – | 1 |
| [SearchBox](#searchbox) | commerce | `shared/src/components/commerce/SearchBox.tsx` | GET form to /search (works without JS; SearchAction target). | – | 2 |
| [SetPasswordForm](#setpasswordform) | commerce | `shared/src/components/commerce/SetPasswordForm.tsx` | Choose a new password after a reset link. | – | 1 |
| [StickyBuyBar](#stickybuybar) | commerce | `shared/src/components/commerce/ProductBuyBox.tsx` | Mobile-only fixed bottom bar with price and buy actions. | – | 1 |
| [TrackOrderForm](#trackorderform) | commerce | `shared/src/components/commerce/TrackOrderForm.tsx` | Order number + phone lookup with status timeline. | – | 1 |
| [AccountMenu](#accountmenu) | commerce/account | `shared/src/components/account/AccountMenu.tsx` | Header account control: Login when signed out; 'Hi, name ▾' menu (orders, profile, addresses, track order, sign out) when signed in. Reads the session in the browser so pages stay cached. | – | 1 |
| [AccountNav](#accountnav) | commerce/account | `shared/src/components/account/AccountNav.tsx` | My account sidebar: greeting, orders, profile, saved addresses, track order, change password, help and sign out. | – | 1 |
| [AddressBook](#addressbook) | commerce/account | `shared/src/components/account/AddressBook.tsx` | Saved delivery addresses: add, edit, delete (with confirm), choose default; up to 10. | – | 1 |
| [ProfileForm](#profileform) | commerce/account | `shared/src/components/account/ProfileForm.tsx` | My account → Profile: edit name and mobile; email shown read-only. | – | 1 |
| [AnswerIntro](#answerintro) | section | `shared/src/components/sections/InfoSections.tsx` | H1 + 1–2 sentence direct answer for AEO at the top of listing and info pages. | – | 5 |
| [BrandStory](#brandstory) | section | `shared/src/components/sections/InfoSections.tsx` | 'Why choose City Seller?' story with category blurbs. | – | 1 |
| [CategoryTiles](#categorytiles) | section | `shared/src/components/sections/CategoryTiles.tsx` | Navigational tiles for categories, featured collections and budget tiers. | circle, card, price | 1 |
| [ContentPage](#contentpage) | section | `shared/src/components/sections/ContentPage.tsx` | Policy/info page template from ContentPage data. | – | 2 |
| [CustomerCare](#customercare) | section | `shared/src/components/sections/InfoSections.tsx` | Care block: phone, WhatsApp, email, hours + Track order. | – | 3 |
| [FAQSection](#faqsection) | section | `shared/src/components/sections/InfoSections.tsx` | FAQ accordion with FAQPage JSON-LD. | – | 5 |
| [GuideCards](#guidecards) | section | `shared/src/components/sections/GuideCards.tsx` | Buying-guide card grid. | – | 2 |
| [HeroBanner](#herobanner) | section | `shared/src/components/sections/HeroBanner.tsx` | Homepage hero slide: the finished artwork only (text is in the image), full width at 7:3, never cropped; optional whole-slide link. | – | 1 |
| [HeroCarousel](#herocarousel) | section | `shared/src/components/sections/HeroCarousel.tsx` | Rotating hero for 2–5 slides: auto-advance (paused on hover, focus or the pause button; off for reduced motion), arrows and dots; first slide is the LCP image. | – | 1 |
| [HomeSections](#homesections) | section | `shared/src/components/sections/HomeSections.tsx` | Renders the homepage from Admin → Homepage content: sections in order, skipping hidden or out-of-schedule items, each mapped to an existing section component. | – | 1 |
| [ListingTemplate](#listingtemplate) | section | `shared/src/components/sections/ListingTemplate.tsx` | Shared listing body: breadcrumbs, AnswerIntro, chips, CategoryListing (static fallback grid), FAQs, ItemList JSON-LD. | – | 7 |
| [NotFoundContent](#notfoundcontent) | section | `shared/src/components/sections/NotFoundContent.tsx` | 404 body with search and helpful links. | – | 1 |
| [ProductGrid](#productgrid) | section | `shared/src/components/sections/ProductGrid.tsx` | Titled product section; grid or mobile carousel (Bestsellers, Flash sale, Related). | grid, carousel | 2 |
| [SaleBanner](#salebanner) | section | `shared/src/components/sections/SaleBanner.tsx` | Promo banner with live text over decorative art. | soft, sand, ink | 1 |
| [ValueProps](#valueprops) | section | `shared/src/components/sections/InfoSections.tsx` | Five value propositions (range, pricing, shipping, returns, secure prepaid). | – | 2 |
| [Analytics](#analytics) | layout | `shared/src/components/layout/Analytics.tsx` | Loads GA4 (NEXT_PUBLIC_GA_ID) and Microsoft Clarity (NEXT_PUBLIC_CLARITY_ID) after the page is interactive; shop only, never in the admin. | – | 1 |
| [Breadcrumbs](#breadcrumbs) | layout | `shared/src/components/layout/Breadcrumbs.tsx` | Breadcrumb trail with BreadcrumbList JSON-LD; Home auto-prepended. | – | 18 |
| [BudgetMenu](#budgetmenu) | layout | `shared/src/components/layout/MegaMenu.tsx` | 'Shop by Budget' dropdown of five price tiers. | – | 1 |
| [CategoryNav](#categorynav) | layout | `shared/src/components/layout/MegaMenu.tsx` | Marketplace-style category bar: one hover menu per top category (subcategory columns, View all, category picture); plain link when a category has no subcategories; 4 on laptops, 6 on wide screens, then All categories. | – | 1 |
| [CategoryStrip](#categorystrip) | layout | `shared/src/components/layout/CategoryStrip.tsx` | Phone/tablet header row of sideways-scrolling category bubbles (Flash Sale, Bestsellers, New, then categories). | – | 1 |
| [Container](#container) | layout | `shared/src/components/layout/Container.tsx` | Centred page-width wrapper with standard gutters. | default, narrow, prose, full | 19 |
| [Footer](#footer) | layout | `shared/src/components/layout/Footer.tsx` | Footer: care hours/phone/email, shop, help, policies, socials, business name. | – | 1 |
| [Header](#header) | layout | `shared/src/components/layout/Header.tsx` | Sticky header: logo, search, account, cart, desktop nav row. | – | 1 |
| [Logo](#logo) | layout | `shared/src/components/layout/Logo.tsx` | City Seller wordmark link to home. | default, inverse | 5 |
| [MegaMenu](#megamenu) | layout | `shared/src/components/layout/MegaMenu.tsx` | Data-driven 'Shop by Category' mega-menu (category → subcategory links with thumbnails). | – | 0 |
| [MobileNav](#mobilenav) | layout | `shared/src/components/layout/MobileNav.tsx` | Hamburger + left drawer with category accordion, budget tiers, links and socials. | – | 1 |
| [MobileTabBar](#mobiletabbar) | layout | `shared/src/components/layout/MobileTabBar.tsx` | App-style bottom bar on phones: Home, Categories, Account, Cart (opens the cart drawer with a live count). | – | 1 |
| [MoreMenu](#moremenu) | layout | `shared/src/components/layout/MegaMenu.tsx` | 'More' dropdown at the end of the category bar: Bestsellers, New arrivals, Buying guides, All categories. | – | 1 |
| [NavDropdown](#navdropdown) | layout | `shared/src/components/layout/NavDropdown.tsx` | Disclosure dropdown used by MegaMenu and BudgetMenu (hover + click + Escape). | mega, menu | 1 |
| [Section](#section) | layout | `shared/src/components/layout/Container.tsx` | Full-bleed band with background token and vertical rhythm. | background, surface, secondary, soft, ink | 7 |
| [SettingsProvider](#settingsprovider) | layout | `shared/src/components/layout/SettingsProvider.tsx` | Shares Admin → Settings values with client components (delivery fee, UPI %, contact). Filled by StoreShell. | – | 1 |
| [StoreShell](#storeshell) | layout | `shared/src/components/layout/StoreShell.tsx` | Storefront chrome (skip link, TopBar, Header, Footer, CartDrawer, Organization + WebSite JSON-LD). | – | 2 |
| [AdminShell](#adminshell) | admin | `admin/src/components/admin/AdminShell.tsx` | Admin layout: sidebar (desktop) / scrolling nav (mobile), pending-orders badge, sign-out, dev-mode banner. | – | 1 |
| [BlockEditor](#blockeditor) | admin | `admin/src/components/admin/BlockEditor.tsx` | Structured text editor for pages and guides: headings, paragraphs, bullet lists, product picks (plain text, no HTML). | h2, p, ul, products | 2 |
| [CategoryForm](#categoryform) | admin | `admin/src/components/admin/CategoryForm.tsx` | Add/edit a category or subcategory: name, slug, parent, intro answer, blurb, image, order, visibility, SEO, FAQs; guarded delete. | – | 1 |
| [ContentSaveForm](#contentsaveform) | admin | `admin/src/components/admin/EditorKit.tsx` | Wraps a CMS editor: serialises the edited value to JSON, saves via server action, sticky save bar with result message. | – | 3 |
| [CopyField](#copyfield) | admin | `admin/src/components/admin/AdminBits.tsx` | Label + value + copy button for pasting customer details into Meesho. | – | 1 |
| [DeleteProductCard](#deleteproductcard) | admin | `admin/src/components/admin/DeleteProductCard.tsx` | Remove-product panel on the product editor; confirms first and is disabled when the product is in any order (hide it instead). | – | 1 |
| [FaqEditor](#faqeditor) | admin | `admin/src/components/admin/PageEditors.tsx` | Edit the store-wide FAQs. | – | 1 |
| [HomeEditor](#homeeditor) | admin | `admin/src/components/admin/HomeEditor.tsx` | Admin → Homepage: section list (reorder, show/hide, schedule badge, delete, add) with an edit panel; saves the whole layout. | – | 1 |
| [ImageField](#imagefield) | admin | `admin/src/components/admin/EditorKit.tsx` | Single image picker: preview, upload to Supabase Storage, or paste a site path / https link. | – | 3 |
| [ImageManager](#imagemanager) | admin | `admin/src/components/admin/ImageManager.tsx` | Product photo list: upload to Supabase Storage or add by path, alt text, reorder, remove. | – | 1 |
| [ListEditor](#listeditor) | admin | `admin/src/components/admin/EditorKit.tsx` | Generic reorderable list editor (slides, banners, FAQs, paragraphs, blocks) with add / move / remove. | – | 5 |
| [LoginForm](#loginform) | admin | `admin/src/components/admin/LoginForm.tsx` | Email + password sign-in for partners in public.admins. | – | 1 |
| [MarginText](#margintext) | admin | `admin/src/components/admin/AdminBits.tsx` | Margin in ₹ and % (green ≥ 25%, amber below, red if negative). | – | 4 |
| [MfaForm](#mfaform) | admin | `admin/src/components/admin/MfaForm.tsx` | Admin two-step sign-in: enter the 6-digit code emailed to the admin, or send a new one. | – | 1 |
| [OrderActions](#orderactions) | admin | `admin/src/components/admin/OrderActions.tsx` | Order fulfilment form: Meesho order ID/cost, tracking link, note, refund toggle, one button per allowed status, WhatsApp link. | – | 1 |
| [OrderStatusBadge](#orderstatusbadge) | admin | `admin/src/components/admin/AdminBits.tsx` | Admin status pill using internal labels; needs-action states in warning tone. | pending_payment, paid, placed_on_meesho, shipped, delivered, cancelled_refunded, return_requested, returned_refunded | 3 |
| [OrderTimeline](#ordertimeline) | admin | `admin/src/components/admin/AdminBits.tsx` | Newest-first order event history with time and note. | – | 1 |
| [PageEditor](#pageeditor) | admin | `admin/src/components/admin/PageEditors.tsx` | Edit About / Shipping / Returns / Privacy / Terms: title, answer, meta description, content blocks. | – | 1 |
| [PostForm](#postform) | admin | `admin/src/components/admin/PostForm.tsx` | Write/edit a buying guide: title, slug, summary, cover, content blocks with product picks, FAQs, publish toggle, delete. | – | 1 |
| [ProductForm](#productform) | admin | `admin/src/components/admin/ProductForm.tsx` | Create/edit product: basics, pricing with live margin and discount, Meesho link/price + checked flag, photos, content, visibility, SEO. | – | 2 |
| [ProductPicker](#productpicker) | admin | `admin/src/components/admin/ProductPicker.tsx` | Search and pick products by title, keeping order (hand-picked rows, product blocks in guides). | – | 2 |
| [ProductQuickActions](#productquickactions) | admin | `admin/src/components/admin/ProductQuickActions.tsx` | One-click product changes in the product list: sold out / in stock, hide / show, New badge (auto/on/off), duplicate. | – | 1 |
| [ScheduleFields](#schedulefields) | admin | `admin/src/components/admin/EditorKit.tsx` | Optional show-from / hide-after date-times in IST for offers, slides and sections. | – | 1 |
| [SectionEditor](#sectioneditor) | admin | `admin/src/components/admin/SectionEditor.tsx` | Edit form for one homepage section; fields depend on the type (hero slides, product row, banners, tiles, value props, story, guides, FAQ). | – | 1 |
| [SettingsForm](#settingsform) | admin | `admin/src/components/admin/SettingsForm.tsx` | Admin → Settings: promo strip, customer care, social links, delivery fee and threshold, return days, UPI discount text. Secrets are not editable. | – | 1 |
| [StatCard](#statcard) | admin | `admin/src/components/admin/AdminBits.tsx` | Dashboard KPI card. | default, warning, success | 1 |
| [TeamManager](#teammanager) | admin | `admin/src/components/admin/TeamManager.tsx` | Super Admin team page: add admins, set role and permissions, remove access. | – | 1 |
| [TextField](#textfield) | admin | `admin/src/components/admin/EditorKit.tsx` | Compact controlled text input / textarea with label, hint and character counter for CMS forms. | – | 6 |
| [cartTotals](#carttotals) | hook | `shared/src/hooks/useCart.ts` | Derives count, subtotal, MRP total, savings, shipping and total from cart lines. | – | 5 |
| [useCart](#usecart) | hook | `shared/src/hooks/useCart.ts` | Zustand cart store persisted to localStorage (items, drawer state, add/setQuantity/remove/clear). | – | 7 |
| [useHydrated](#usehydrated) | hook | `shared/src/hooks/useHydrated.ts` | True after client hydration (guards localStorage-backed UI). | – | 5 |
| [usePincode](#usepincode) | hook | `shared/src/hooks/usePincode.ts` | Shopper's remembered delivery PIN (localStorage), shared live across header, product page and PIN checker. | – | 2 |
| [useRazorpay](#userazorpay) | hook | `shared/src/hooks/useRazorpay.ts` | Loads Razorpay Checkout.js on demand and opens it; resolves with the signed success payload or rejects (PaymentDismissedError on close). | – | 1 |
| [useSettings](#usesettings) | hook | `shared/src/components/layout/SettingsProvider.tsx` | Current store settings in client components (defaults outside a provider). | – | 10 |
| [buildCategoryTree](#buildcategorytree) | util | `shared/src/components/layout/MegaMenu.tsx` | Turns flat categories into a top-level tree with children. | – | 5 |
| [calcDiscount](#calcdiscount) | util | `shared/src/lib/utils/format.ts` | Whole-number discount % from MRP and price. | – | 3 |
| [calcMargin](#calcmargin) | util | `shared/src/lib/utils/format.ts` | Margin amount and % of price between selling price and supplier cost. | – | 2 |
| [cleanBlocks](#cleanblocks) | util | `admin/src/components/admin/BlockEditor.tsx` | Removes empty bullet lines from blocks before saving. | – | 1 |
| [cn](#cn) | util | `shared/src/lib/utils/cn.ts` | clsx + tailwind-merge configured for token class names. | – | 54 |
| [daysSince](#dayssince) | util | `shared/src/lib/utils/format.ts` | Whole days since an ISO date (stale Meesho price checks). | – | 3 |
| [estimateDelivery](#estimatedelivery) | util | `shared/src/lib/utils/delivery.ts` | PIN-zone delivery window (dates + region); SHIPPING constant in the same file. | – | 3 |
| [formatBought](#formatbought) | util | `shared/src/lib/utils/format.ts` | Honest 'bought' label from the real paid-order count (10+, 200+, 1.5k+); null below 10. | – | 2 |
| [formatDate](#formatdate) | util | `shared/src/lib/utils/format.ts` | ISO date → '12 Nov 2026' (en-IN). | – | 14 |
| [formatINR](#formatinr) | util | `shared/src/lib/utils/format.ts` | Formats rupees with Indian grouping: 1299 → ₹1,299. | – | 22 |
| [getBudgetTier](#getbudgettier) | util | `shared/src/lib/utils/budget.ts` | Looks up a BUDGET_TIERS entry by slug (BUDGET_TIERS constant lives in the same file). | – | 1 |
| [inBudget](#inbudget) | util | `shared/src/lib/utils/budget.ts` | Whether a price falls inside a budget tier. | – | 0 |
| [isProductNew](#isproductnew) | util | `shared/src/lib/utils/product.ts` | New badge rule: manual override wins; otherwise automatic for 30 days after the product is added. | – | 4 |
| [paths](#paths) | util | `shared/src/lib/utils/paths.ts` | Canonical URL builders (the only place URL shapes are defined). | – | 62 |
| [shippingFor](#shippingfor) | util | `shared/src/lib/utils/delivery.ts` | Delivery fee for a subtotal (free above threshold). | – | 3 |
| [slugify](#slugify) | util | `shared/src/lib/utils/format.ts` | Text → URL slug. | – | 7 |
| [telHref](#telhref) | util | `shared/src/lib/utils/contact.ts` | Phone number → tel: link. | – | 2 |
| [toCardProduct](#tocardproduct) | util | `shared/src/lib/utils/product.ts` | Product → serializable CardProduct for client components. | – | 10 |
| [tokenStyle](#tokenstyle) | util | `shared/src/lib/utils/token-style.ts` | Maps token names to inline CSS-variable styles for width/height/colour props. | – | 2 |
| [track](#track) | util | `shared/src/lib/utils/analytics.ts` | GA4 ecommerce event helper (add_to_cart, begin_checkout, purchase, view_item); no-op when GA is not loaded. | – | 3 |
| [validators](#validators) | util | `shared/src/lib/utils/validators.ts` | Zod schemas: pincodeSchema, phoneSchema, addressSchema, checkoutSchema, trackOrderSchema, INDIAN_STATES. | – | 0 |
| [whatsappHref](#whatsapphref) | util | `shared/src/lib/utils/contact.ts` | WhatsApp click-to-chat link with optional prefilled text. | – | 1 |
| [buildArticleJsonLd](#buildarticlejsonld) | seo | `shared/src/lib/seo/jsonld.ts` | Article JSON-LD for guides. | – | 1 |
| [buildBreadcrumbJsonLd](#buildbreadcrumbjsonld) | seo | `shared/src/lib/seo/jsonld.ts` | BreadcrumbList JSON-LD. | – | 1 |
| [buildFaqJsonLd](#buildfaqjsonld) | seo | `shared/src/lib/seo/jsonld.ts` | FAQPage JSON-LD. | – | 1 |
| [buildItemListJsonLd](#builditemlistjsonld) | seo | `shared/src/lib/seo/jsonld.ts` | ItemList JSON-LD for listing pages. | – | 1 |
| [buildMetadata](#buildmetadata) | seo | `shared/src/lib/seo/metadata.ts` | Unique title/description, canonical, OG and Twitter metadata with DB overrides. | – | 25 |
| [buildOrganizationJsonLd](#buildorganizationjsonld) | seo | `shared/src/lib/seo/jsonld.ts` | OnlineStore/Organization JSON-LD. | – | 1 |
| [buildProductJsonLd](#buildproductjsonld) | seo | `shared/src/lib/seo/jsonld.ts` | Product + Offer (shipping, returns) + AggregateRating JSON-LD. | – | 1 |
| [buildWebSiteJsonLd](#buildwebsitejsonld) | seo | `shared/src/lib/seo/jsonld.ts` | WebSite JSON-LD with SearchAction. | – | 1 |
| [JsonLd](#jsonld) | seo | `shared/src/lib/seo/JsonLdScript.tsx` | Renders JSON-LD script tags safely (escapes <). | – | 6 |

## Button

`shared/src/components/ui/Button.tsx` · ui/action · updated 2026-11-12

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

**Used in:** AddToCartButton, AddressBook, CartDrawer, CartView, CategoryForm, CategoryListing, CheckoutForm, CustomerAuthForm, DeleteProductCard, HomeEditor, ImageManager, LoginForm, MfaForm, MobileNav, NotFoundContent, OrderActions, OrderSelfService, PincodeChecker, PostForm, ProductForm, ProductQuickActions, ProfileForm, ReviewForm, SaleBanner, SetPasswordForm, TeamManager, TrackOrderForm, admin/BlockEditor, admin/EditorKit, admin/PageEditors, admin:/, admin:/categories, admin:/content/home, admin:/guides, admin:/orders/[id], admin:/products, admin:/reviews, sections/InfoSections, shop:/account, shop:/account (layout), shop:/order/[id]

```tsx
<Button variant="primary" size="lg" icon={<ShoppingBag/>}>Add to Cart</Button>
```

## CopyButton

`shared/src/components/ui/CopyButton.tsx` · ui/action · updated 2026-11-12

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

`shared/src/components/ui/Disclosure.tsx` · ui/disclosure · updated 2026-11-12

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

`shared/src/components/ui/Disclosure.tsx` · ui/disclosure · updated 2026-11-12

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

`shared/src/components/ui/Badge.tsx` · ui/display · updated 2026-11-12

Small status label: discount %, Sold out, Bestseller.

**Props**

- `variant`: string
- `size`: sm|md

**Variants:** sale, success, warning, error, neutral, outline, dark

**Sizes:** sm (`px-2 py-0.5 text-xs`), md (`px-3 py-1 text-sm`)

**Tokens:** `color.borderStrong` `color.error` `color.errorSoft` `color.ink` `color.primary` `color.secondary` `color.success` `color.successSoft` `color.surface` `color.text` `color.textInverse` `color.warning` `color.warningSoft` `font.size.sm` `font.size.xs` `font.tracking.wide` `font.weight.semibold` `radius.sm` `space.0.5` `space.1` `space.2` `space.3`

**Accessibility:** Text content conveys meaning; all variants pass AA contrast.

**Used in:** AddressBook, HomeEditor, ProductCard, TeamManager, admin/AdminBits, admin:/categories, admin:/guides, admin:/orders, admin:/products, admin:/reviews, shop:/[category]/[sub]/[product], shop:/account

```tsx
<Badge variant="sale">50% off</Badge>
```

## DataTable

`shared/src/components/ui/DataTable.tsx` · ui/display · updated 2026-11-12

Generic accessible data table (admin orders/products) with per-column alignment and mobile-hidden columns.

**Props**

- `columns`: {header, cell(row), align?, hideOnMobile?}[]
- `rows`: T[]
- `rowKey`: (row)=>string
- `caption`: string (sr-only)
- `empty`: ReactNode

**Tokens:** `color.background` `color.border` `color.surface` `color.textMuted` `font.size.base` `font.size.sm` `font.weight.semibold` `radius.lg` `space.10` `space.3` `space.4`

**Accessibility:** Real table with caption and th scope=col; scrolls horizontally on small screens.

**Used in:** admin:/, admin:/categories, admin:/guides, admin:/orders, admin:/products

```tsx
<DataTable caption="Orders" rows={orders} rowKey={(o)=>o.id} columns={[…]} />
```

## Table

`shared/src/components/ui/Misc.tsx` · ui/display · updated 2026-11-12

Key–value HTML table (product specs, order details).

**Props**

- `rows`: {label,value}[]
- `caption`: string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** Real <table> with th scope=row and caption (AEO: specs as HTML, not images).

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<Table caption="Specifications" rows={specs} />
```

## PageSkeleton

`shared/src/components/ui/PageSkeleton.tsx` · ui/feedback · updated 2026-11-16

Route-level loading placeholder shaped like the page that is loading.

**Props**

- `variant`: home|listing|product|table|account|accountContent|order|checkout
- `bare`: boolean (no Container)

**Variants:** home, listing, product, table, account, accountContent, order, checkout

**Tokens:** `aspect.banner` `aspect.product` `color.border` `color.surface` `maxWidth.modal` `maxWidth.narrow` `maxWidth.prose` `radius.full` `radius.lg` `radius.none` `radius.xl` `space.1` `space.10` `space.11` `space.12` `space.16` `space.2` `space.20` `space.24` `space.3` `space.32` `space.4` `space.40` `space.48` `space.5` `space.6` `space.64` `space.8` `space.80` `space.9`

**Accessibility:** role=status with a visually hidden Loading label.

**Used in:** admin:/loading.tsx, shop:/[category]/[sub]/[product]/loading.tsx, shop:/account (layout), shop:/account/loading.tsx, shop:/checkout/loading.tsx, shop:/loading.tsx, shop:/order/[id]/loading.tsx

```tsx
<PageSkeleton variant="listing" />
```

## Skeleton

`shared/src/components/ui/Misc.tsx` · ui/feedback · updated 2026-11-12

Pulse placeholder block sized with token classes.

**Props**

- `className`: token size classes

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.32` `space.4` `space.5` `space.8` `space.9` `space.px`

**Accessibility:** aria-hidden.

**Used in:** PageSkeleton

```tsx
<Skeleton className="h-4 w-32" />
```

## toast

`shared/src/components/ui/Toast.tsx` · ui/feedback · updated 2026-11-12

Imperative function to show a toast from client code.

**Props**

- `title`: string
- `description`: string
- `tone`: success|error|info

**Variants:** success, error, info

**Tokens:** `color.border` `color.error` `color.success` `color.surface` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0.5` `space.11` `space.2` `space.24` `space.3` `space.4` `space.5` `space.6` `zIndex.toast`

**Accessibility:** Announced politely.

**Used in:** AddToCartButton, CheckoutForm, CustomerAuthForm, Toaster

```tsx
toast({ title: "Added to cart" })
```

## Toaster

`shared/src/components/ui/Toast.tsx` · ui/feedback · updated 2026-11-12

Toast viewport; mount once in root layout.

**Tokens:** `color.border` `color.error` `color.success` `color.surface` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0.5` `space.11` `space.2` `space.24` `space.3` `space.4` `space.5` `space.6` `zIndex.toast`

**Accessibility:** aria-live=polite region; dismiss button 44px.

**Used in:** admin: (layout), shop: (layout)

```tsx
<Toaster />
```

## Checkbox

`shared/src/components/ui/Checkbox.tsx` · ui/form · updated 2026-11-12

Radix checkbox with label row; used in filter facets.

**Props**

- `id`: string
- `label`: ReactNode
- `checked`: boolean
- `onCheckedChange`: (checked:boolean)=>void
- `disabled`: boolean
- `name`: string (form field)
- `defaultChecked`: boolean

**Tokens:** `color.borderStrong` `color.ink` `color.surface` `color.text` `color.textInverse` `duration.fast` `font.size.base` `radius.full` `radius.sm` `shadow.focus` `space.11` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** Whole row is the label (44px min height); visible focus ring; Space toggles.

**Used in:** AddressBook, CategoryForm, CategoryListing, HomeEditor, OrderActions, PostForm, ProductForm, SectionEditor, SettingsForm, TeamManager

```tsx
<Checkbox id="m-steel" label="Steel" checked={on} onCheckedChange={setOn} />
```

## FormField

`shared/src/components/ui/FormField.tsx` · ui/form · updated 2026-11-12

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

**Used in:** AddressBook, CategoryForm, CheckoutForm, CustomerAuthForm, LoginForm, MfaForm, OrderActions, OrderSelfService, PostForm, ProductForm, ProfileForm, ReviewForm, SectionEditor, SetPasswordForm, TeamManager, TrackOrderForm, admin/EditorKit

```tsx
<FormField id="phone" label="Mobile" error={err}><Input id="phone" /></FormField>
```

## Input

`shared/src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

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

**Used in:** AddressBook, CategoryForm, CheckoutForm, CustomerAuthForm, ImageManager, LoginForm, MfaForm, OrderActions, PasswordInput, PincodeChecker, PostForm, ProductForm, ProductPicker, ProfileForm, ReviewForm, SearchBox, TeamManager, TrackOrderForm, admin/EditorKit, admin:/products

```tsx
<Input id="pin" inputMode="numeric" invalid={!!error} />
```

## PasswordInput

`shared/src/components/ui/PasswordInput.tsx` · ui/form · updated 2026-11-14

Password field with a show/hide eye toggle; accepts all Input props.

**Props**

- `...InputProps`: same as Input

**Tokens:** `color.text` `color.textMuted` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.12` `space.5`

**Accessibility:** Toggle is a button with aria-label Show/Hide password and aria-pressed.

**Used in:** CustomerAuthForm, LoginForm, SetPasswordForm, TeamManager

```tsx
<PasswordInput name="password" autoComplete="current-password" />
```

## QuantityStepper

`shared/src/components/ui/Misc.tsx` · ui/form · updated 2026-11-12

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

`shared/src/components/ui/Checkbox.tsx` · ui/form · updated 2026-11-12

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

`shared/src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

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

**Used in:** AddressBook, CategoryForm, CategoryListing, CheckoutForm, HomeEditor, OrderSelfService, ProductForm, SectionEditor, TeamManager

```tsx
<Select id="sort" options={SORT_OPTIONS} value={sort} onChange={…} />
```

## Textarea

`shared/src/components/ui/Input.tsx` · ui/form · updated 2026-11-12

Multi-line text field with the same look as Input.

**Props**

- `invalid`: boolean
- `rows`: number
- `ref`: Ref<HTMLTextAreaElement>

**Variants:** default, invalid

**Tokens:** `color.background` `color.borderStrong` `color.error` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.fast` `font.family.body` `font.size.base` `font.size.lg` `font.size.sm` `radius.md` `shadow.focus` `space.1` `space.10` `space.11` `space.12` `space.3` `space.4` `space.9`

**Accessibility:** aria-invalid; use inside FormField.

**Used in:** CategoryForm, OrderActions, OrderSelfService, PostForm, ProductForm, ReviewForm, admin/EditorKit, admin:/reviews

```tsx
<Textarea id="msg" rows={4} />
```

## Icon

`shared/src/components/ui/Icon.tsx` · ui/icon · updated 2026-11-12

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

`shared/src/components/ui/Icon.tsx` · ui/icon · updated 2026-11-12

Inline brand marks (Instagram, Facebook, YouTube, WhatsApp).

**Props**

- `brand`: instagram|facebook|youtube|whatsapp
- `size`: xs|sm|md|lg|xl

**Variants:** instagram, facebook, youtube, whatsapp

**Tokens:** `space.3` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Decorative; the wrapping link carries aria-label.

**Used in:** Footer, MobileNav

```tsx
<a aria-label="Instagram" href={…}><SocialIcon brand="instagram" /></a>
```

## Card

`shared/src/components/ui/Card.tsx` · ui/layout · updated 2026-11-12

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

**Used in:** AddressBook, CartView, CategoryForm, CheckoutForm, CustomerAuthForm, DeleteProductCard, HomeEditor, OrderSelfService, PostForm, ProductForm, ProfileForm, SetPasswordForm, SettingsForm, TeamManager, TrackOrderForm, admin/AdminBits, admin/PageEditors, admin:/content/pages, admin:/login, admin:/mfa, admin:/orders/[id], admin:/reviews, shop:/account, shop:/order/[id]

```tsx
<Card padding="md" elevation="raised">…</Card>
```

## ScrollRail

`shared/src/components/ui/ScrollRail.tsx` · ui/layout · updated 2026-11-19

Sideways-scrolling list with snap and previous/next arrows on larger screens (hidden at the ends).

**Props**

- `label`: string (list name)
- `children`: <li> items
- `className`: string

**Tokens:** `color.background` `color.border` `color.surface` `color.text` `duration.fast` `radius.full` `shadow.focus` `shadow.md` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `zIndex.raised`

**Accessibility:** Labelled list; arrow buttons have aria-labels; swipe and keyboard scroll work.

**Used in:** CategoryTiles, ProductGrid

```tsx
<ScrollRail label="Bestsellers">{items}</ScrollRail>
```

## Separator

`shared/src/components/ui/Misc.tsx` · ui/layout · updated 2026-11-12

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

`shared/src/components/ui/ChipNav.tsx` · ui/navigation · updated 2026-11-12

Scrolling link chips with optional counts: listing refine chips, budget tiers, admin status filters.

**Props**

- `chips`: {label, href, active?, count?}[]
- `label`: string (nav aria-label)

**Variants:** default, active, with count

**Tokens:** `color.borderStrong` `color.ink` `color.secondary` `color.surface` `color.text` `color.textInverse` `font.size.sm` `font.size.xs` `font.weight.medium` `radius.full` `shadow.focus` `space.11` `space.2` `space.4`

**Accessibility:** nav landmark; aria-current on the active chip; 44px targets.

**Used in:** ListingTemplate, admin:/orders, admin:/products, admin:/reviews

```tsx
<ChipNav label="Refine" chips={[{label:"All",href:"/kitchen",active:true}]} />
```

## Pagination

`shared/src/components/ui/Misc.tsx` · ui/navigation · updated 2026-11-12

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

`shared/src/components/ui/Modal.tsx` · ui/overlay · updated 2026-11-12

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

`shared/src/components/ui/Modal.tsx` · ui/overlay · updated 2026-11-12

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

`shared/src/components/ui/Heading.tsx` · ui/typography · updated 2026-11-12

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

`shared/src/components/ui/SectionHeader.tsx` · ui/typography · updated 2026-11-19

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

**Tokens:** `color.primary` `color.text` `color.textMuted` `font.size.base` `font.size.sm` `font.tracking.wider` `font.weight.semibold` `maxWidth.prose` `space.1` `space.11` `space.2` `space.4` `space.6`

**Accessibility:** View all link includes sr-only section name for unique link text.

**Used in:** CategoryTiles, GuideCards, HomeSections, ProductGrid, admin:/, sections/InfoSections, shop:/[category]/[sub]/[product]

```tsx
<SectionHeader title="Bestsellers" viewAllHref="/bestsellers" />
```

## AddToCartButton

`shared/src/components/commerce/AddToCartButton.tsx` · commerce · updated 2026-11-19

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

**Tokens:** `color.border` `color.primary` `color.surface` `duration.fast` `radius.full` `shadow.focus` `shadow.md` `space.11` `space.4` `space.5`

**Accessibility:** aria-label includes product title; disabled Sold out state.

**Used in:** ProductCard, commerce/ProductBuyBox

```tsx
<AddToCartButton product={card} mode="buy" size="lg" fullWidth />
```

## CartButton

`shared/src/components/commerce/CartButton.tsx` · commerce · updated 2026-11-19

Header cart icon with live count; opens CartDrawer.

**Tokens:** `color.primary` `color.secondary` `color.text` `color.textInverse` `font.size.xs` `font.weight.bold` `radius.full` `radius.md` `shadow.focus` `space.1` `space.11` `space.5` `space.6`

**Accessibility:** aria-label includes item count.

**Used in:** Header

```tsx
<CartButton />
```

## CartDrawer

`shared/src/components/commerce/CartDrawer.tsx` · commerce · updated 2026-11-19

Slide-in mini cart mounted once in StoreShell.

**Tokens:** `color.border` `color.textMuted` `font.size.lg` `font.weight.semibold` `space.12` `space.16` `space.2` `space.3` `space.4`

**Accessibility:** Drawer semantics; empty state with next action.

**Used in:** StoreShell

```tsx
<CartDrawer />
```

## CartLineItem

`shared/src/components/commerce/CartLineItem.tsx` · commerce · updated 2026-11-19

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

`shared/src/components/commerce/CartView.tsx` · commerce · updated 2026-11-19

Full cart page body.

**Tokens:** `color.border` `color.textMuted` `font.size.lg` `font.weight.semibold` `space.12` `space.16` `space.2` `space.24` `space.4` `space.8`

**Accessibility:** Headings and lists.

**Used in:** shop:/cart

```tsx
<CartView />
```

## CategoryBrowser

`shared/src/components/commerce/CategoryBrowser.tsx` · commerce · updated 2026-11-19

All-categories browser (app style): category list on the left, compact picture tiles on the right (subcategories, then products with price); remembers the choice in ?c=.

**Props**

- `categories`: BrowserCategory[]

**Tokens:** `aspect.square` `color.background` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.slow` `font.lineHeight.tight` `font.size.base` `font.size.sm` `font.size.xs` `font.weight.semibold` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.14` `space.2` `space.24` `space.3` `space.32` `space.4`

**Accessibility:** Category list is a labelled nav of buttons with aria-current; tiles are links with visible names.

**Used in:** shop:/categories

```tsx
<CategoryBrowser categories={data} />
```

## CategoryListing

`shared/src/components/commerce/CategoryListing.tsx` · commerce · updated 2026-11-19

Client filters (budget, material, colour, rating), sort and pagination with URL state.

**Props**

- `products`: CardProduct[]
- `hideBudget`: boolean
- `emptyMessage`: string

**Tokens:** `color.border` `color.borderStrong` `color.ink` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.fast` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Fieldsets with legends; result count is aria-live; filters in Drawer on mobile.

**Used in:** ListingTemplate

```tsx
<CategoryListing products={cards} />
```

## CheckoutForm

`shared/src/components/commerce/CheckoutForm.tsx` · commerce · updated 2026-11-19

Contact + address form (RHF + Zod Indian PIN/phone) and prepaid pay button.

**Tokens:** `color.background` `color.primary` `color.success` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.md` `space.10` `space.14` `space.16` `space.24` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Labels, autocomplete tokens, inline errors, fieldset legends.

**Used in:** shop:/checkout

```tsx
<CheckoutForm />
```

## CustomerAuthForm

`shared/src/components/commerce/CustomerAuthForm.tsx` · commerce · updated 2026-11-17

Shopper sign in / create account / forgot password form (email + password).

**Props**

- `signIn`: server action
- `signUp`: server action
- `forgot`: server action
- `next`: string

**Tokens:** `color.border` `color.error` `color.errorSoft` `color.ink` `color.success` `color.successSoft` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `shadow.focus` `space.11` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** Tabs are buttons with aria-pressed; errors announced via role=alert.

**Used in:** shop:/login

```tsx
<CustomerAuthForm signIn={a} signUp={b} forgot={c} next="/checkout" />
```

## DeliveryPromise

`shared/src/components/commerce/DeliveryPromise.tsx` · commerce · updated 2026-11-19

Product-page delivery line: 'Get it by <date>' for the saved PIN, plus free delivery or the fee.

**Props**

- `price`: number
- `className`: string

**Tokens:** `color.success` `color.text` `color.textMuted` `font.size.sm` `space.0.5` `space.2` `space.5`

**Accessibility:** Plain text; updates when the shopper changes their PIN.

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<DeliveryPromise price={p.price} />
```

## FreeDeliveryTag

`shared/src/components/commerce/FreeDeliveryTag.tsx` · commerce · updated 2026-11-19

'Free delivery' note on product cards when the price reaches the free-delivery threshold from Settings.

**Props**

- `price`: number
- `className`: string

**Tokens:** `color.success` `font.size.xs` `font.weight.medium` `space.1` `space.4`

**Accessibility:** Plain text with a decorative icon.

**Used in:** ProductCard

```tsx
<FreeDeliveryTag price={499} />
```

## FreeShippingProgress

`shared/src/components/commerce/OrderSummary.tsx` · commerce · updated 2026-11-12

'Add ₹X more for free delivery' with progress bar.

**Props**

- `subtotal`: number

**Tokens:** `color.border` `color.secondary` `color.success` `color.text` `color.textMuted` `duration.slow` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.bold` `font.weight.semibold` `radius.full` `space.2` `space.3`

**Accessibility:** Bar is aria-hidden; text conveys state.

**Used in:** CartDrawer, CartView, OrderSummary

```tsx
<FreeShippingProgress subtotal={320} />
```

## OrderSelfService

`shared/src/components/commerce/OrderSelfService.tsx` · commerce · updated 2026-11-16

Shopper's own order page: Cancel order (before packing, instant refund), Request cancellation (while packing) or Request a return (after delivery, within the return window), each with a reason.

**Props**

- `orderId`: string
- `options`: customerOrderOptions()
- `cancel`: server action
- `requestCancel`: server action
- `requestReturn`: server action

**Tokens:** `color.error` `color.success` `color.successSoft` `color.text` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.2` `space.3` `space.4`

**Accessibility:** Reason select is labelled and required; results announced via role=status/alert; instant cancel asks for confirmation.

**Used in:** shop:/order/[id]

```tsx
<OrderSelfService orderId={id} options={opts} cancel={a} requestCancel={b} requestReturn={c} />
```

## OrderStatusPoller

`shared/src/components/commerce/OrderStatusPoller.tsx` · commerce · updated 2026-11-12

Refreshes the order success page every few seconds while payment confirmation (webhook) is pending.

**Props**

- `intervalMs`: number (default 3000)
- `maxAttempts`: number (default 20)

**Tokens:** `color.textMuted` `font.size.sm` `space.2` `space.4`

**Accessibility:** role=status live message; spinner is aria-hidden; gives a clear fallback message after the last attempt.

**Used in:** shop:/order/[id]

```tsx
{!paid && <OrderStatusPoller />}
```

## OrderSummary

`shared/src/components/commerce/OrderSummary.tsx` · commerce · updated 2026-11-12

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

**Used in:** CartDrawer, CartView, CheckoutForm, shop:/order/[id]

```tsx
<OrderSummary subtotal={899} shipping={0} total={899} />
```

## PincodeChecker

`shared/src/components/commerce/PincodeChecker.tsx` · commerce · updated 2026-11-19

PIN-code delivery estimate (zone table) with remembered PIN.

**Tokens:** `color.error` `color.success` `color.text` `color.textMuted` `font.size.sm` `space.0.5` `space.2` `space.4`

**Accessibility:** Labelled input, aria-live result, inline error.

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<PincodeChecker />
```

## PrepaidNotice

`shared/src/components/commerce/PrepaidNotice.tsx` · commerce · updated 2026-11-12

States prepaid-only policy and accepted methods.

**Props**

- `variant`: inline|box

**Variants:** inline, box

**Tokens:** `color.background` `color.border` `color.success` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `space.0.5` `space.1` `space.1.5` `space.2` `space.4` `space.5`

**Accessibility:** Plain text; icons decorative.

**Used in:** CartDrawer, CartView, CheckoutForm, shop:/[category]/[sub]/[product]

```tsx
<PrepaidNotice variant="inline" />
```

## PriceBlock

`shared/src/components/commerce/PriceBlock.tsx` · commerce · updated 2026-11-12

Sale price, struck MRP and % off.

**Props**

- `price`: number
- `mrp`: number
- `size`: sm|md|lg
- `showTaxNote`: boolean

**Sizes:** sm (`card`), md (`default`), lg (`product page`)

**Tokens:** `color.success` `color.text` `color.textMuted` `font.family.body` `font.size.3xl` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.bold` `font.weight.semibold` `space.0.5` `space.2`

**Accessibility:** sr-only labels for sale price and MRP.

**Used in:** ProductCard, shop:/[category]/[sub]/[product]

```tsx
<PriceBlock price={449} mrp={899} size="lg" showTaxNote />
```

## ProductBuyBox

`shared/src/components/commerce/ProductBuyBox.tsx` · commerce · updated 2026-11-19

Quantity + Add to Cart + Buy Now; drives the mobile StickyBuyBar.

**Props**

- `product`: CardProduct

**Tokens:** `color.border` `color.borderStrong` `color.error` `color.ink` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.base` `duration.fast` `font.size.lg` `font.size.sm` `font.weight.bold` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.11` `space.2` `space.20` `space.3` `space.4` `zIndex.sticky`

**Accessibility:** Stepper labelled; buttons 48px.

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<ProductBuyBox product={card} />
```

## ProductCard

`shared/src/components/commerce/ProductCard.tsx` · commerce · updated 2026-11-19

Product tile: hover second image, discount/sold-out/bestseller badges, title, rating, price, Add to Cart.

**Props**

- `product`: CardProduct
- `variant`: default|plain
- `priority`: boolean (LCP)
- `headingLevel`: h2|h3

**Variants:** default, plain

**Tokens:** `aspect.product` `color.background` `color.border` `color.success` `color.successSoft` `color.surface` `color.text` `color.textMuted` `duration.base` `duration.slow` `font.lineHeight.snug` `font.size.base` `font.size.sm` `font.size.xs` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.sm` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.2` `space.3` `zIndex.base` `zIndex.raised`

**Accessibility:** Stretched title link makes the card clickable; button sits above it; hover image is aria-hidden.

**Used in:** CategoryListing, ListingTemplate, ProductGrid, shop:/guides/[slug]

```tsx
<ProductCard product={toCardProduct(p)} />
```

## ProductGallery

`shared/src/components/commerce/ProductGallery.tsx` · commerce · updated 2026-11-12

Main image, thumbnails, counter, arrows and zoom modal with hover magnify.

**Props**

- `images`: {src,alt}[]
- `title`: string

**Tokens:** `aspect.product` `aspect.square` `color.background` `color.borderStrong` `color.ink` `color.primary` `color.surface` `color.text` `color.textMuted` `duration.base` `font.size.sm` `radius.full` `radius.lg` `radius.md` `shadow.focus` `shadow.md` `space.0` `space.1` `space.11` `space.16` `space.2` `space.20` `space.3` `space.4` `space.5` `zIndex.base` `zIndex.raised`

**Accessibility:** Arrow keys switch images; labelled buttons; aria-current thumb.

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<ProductGallery images={p.images} title={p.title} />
```

## PurchaseTracker

`shared/src/components/commerce/PurchaseTracker.tsx` · commerce · updated 2026-11-12

Sends the GA4 purchase event once per order on the order success page.

**Props**

- `orderNumber`: string
- `total`: number
- `shipping`: number
- `items`: {id,title,price,quantity}[]

**Accessibility:** Renders no UI.

**Used in:** shop:/order/[id]

```tsx
{paid && <PurchaseTracker orderNumber={o.number} total={o.total} shipping={o.shipping} items={…} />}
```

## RatingStars

`shared/src/components/commerce/RatingStars.tsx` · commerce · updated 2026-11-12

Read-only star rating with fractional fill.

**Props**

- `value`: number 0–5
- `count`: number
- `size`: sm|md|lg
- `showValue`: boolean

**Sizes:** sm (`h-4`), md (`h-5`), lg (`h-6`)

**Tokens:** `color.rating` `color.secondaryStrong` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `space.0` `space.1.5` `space.4` `space.5` `space.6`

**Accessibility:** role=img with text label 'Rated x out of 5 from n reviews'.

**Used in:** ReviewList, admin:/reviews, shop:/[category]/[sub]/[product]

```tsx
<RatingStars value={4.4} count={318} />
```

## ReviewForm

`shared/src/components/commerce/ReviewForm.tsx` · commerce · updated 2026-11-19

Verified-purchase review for one delivered item: tappable 1–5 stars, optional title, review text; held for admin approval.

**Props**

- `orderId`: string
- `productId`: string
- `productTitle`: string
- `action`: server action

**Tokens:** `color.borderStrong` `color.error` `color.success` `color.successSoft` `color.textMuted` `color.warning` `font.size.sm` `font.weight.medium` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.8`

**Accessibility:** Stars are a labelled radio group (keyboard and screen-reader friendly); field errors and result announced.

**Used in:** shop:/order/[id]

```tsx
<ReviewForm orderId={o.id} productId={i.productId} productTitle={i.title} action={submitReviewAction} />
```

## ReviewList

`shared/src/components/commerce/ReviewList.tsx` · commerce · updated 2026-11-19

Rating summary with distribution plus reviews with photos.

**Props**

- `reviews`: Review[]
- `rating`: number
- `reviewCount`: number
- `productTitle`: string

**Tokens:** `color.background` `color.border` `color.primary` `color.rating` `color.secondary` `color.success` `color.text` `color.textMuted` `font.family.heading` `font.size.5xl` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.full` `radius.md` `space.1` `space.1.5` `space.2` `space.20` `space.3` `space.4` `space.6` `space.8`

**Accessibility:** Review photos have descriptive alt text.

**Used in:** shop:/[category]/[sub]/[product]

```tsx
<ReviewList reviews={r} rating={4.4} reviewCount={318} productTitle={t} />
```

## SearchBox

`shared/src/components/commerce/SearchBox.tsx` · commerce · updated 2026-11-12

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

## SetPasswordForm

`shared/src/components/commerce/SetPasswordForm.tsx` · commerce · updated 2026-11-14

Choose a new password after a reset link.

**Props**

- `action`: server action

**Tokens:** `color.error` `color.errorSoft` `color.success` `color.successSoft` `font.size.sm` `radius.md` `space.3` `space.4`

**Accessibility:** Errors announced via role=alert.

**Used in:** shop:/account/password

```tsx
<SetPasswordForm action={setPassword} />
```

## StickyBuyBar

`shared/src/components/commerce/ProductBuyBox.tsx` · commerce · updated 2026-11-19

Mobile-only fixed bottom bar with price and buy actions.

**Props**

- `product`: CardProduct
- `quantity`: number
- `visible`: boolean

**Tokens:** `color.border` `color.borderStrong` `color.error` `color.ink` `color.surface` `color.text` `color.textInverse` `color.textMuted` `duration.base` `duration.fast` `font.size.lg` `font.size.sm` `font.weight.bold` `font.weight.medium` `font.weight.semibold` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.11` `space.2` `space.20` `space.3` `space.4` `zIndex.sticky`

**Accessibility:** aria-hidden when off-screen.

**Used in:** ProductBuyBox

```tsx
<StickyBuyBar product={card} quantity={1} visible />
```

## TrackOrderForm

`shared/src/components/commerce/TrackOrderForm.tsx` · commerce · updated 2026-11-12

Order number + phone lookup with status timeline.

**Props**

- `defaultOrder`: string

**Tokens:** `color.border` `color.error` `color.errorSoft` `color.success` `color.textMuted` `font.family.heading` `font.size.2xl` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.0` `space.1` `space.2` `space.3` `space.4` `space.6`

**Accessibility:** aria-live results; ordered timeline with sr-only state.

**Used in:** shop:/track-order

```tsx
<TrackOrderForm defaultOrder="CS1001" />
```

## AccountMenu

`shared/src/components/account/AccountMenu.tsx` · commerce/account · updated 2026-11-16

Header account control: Login when signed out; 'Hi, name ▾' menu (orders, profile, addresses, track order, sign out) when signed in. Reads the session in the browser so pages stay cached.

**Props**

- `className`: string

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `duration.fast` `font.size.base` `font.size.sm` `font.weight.medium` `radius.md` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `space.6` `space.64` `zIndex.dropdown`

**Accessibility:** Disclosure button with aria-expanded/aria-controls; closes on Escape, outside click, focus leaving and navigation.

**Used in:** Header

```tsx
<AccountMenu />
```

## AccountNav

`shared/src/components/account/AccountNav.tsx` · commerce/account · updated 2026-11-16

My account sidebar: greeting, orders, profile, saved addresses, track order, change password, help and sign out.

**Props**

- `name`: string
- `email`: string

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** nav landmark labelled 'My account'; current page marked with aria-current.

**Used in:** shop:/account (layout)

```tsx
<AccountNav name="Asha" email="asha@example.com" />
```

## AddressBook

`shared/src/components/account/AddressBook.tsx` · commerce/account · updated 2026-11-16

Saved delivery addresses: add, edit, delete (with confirm), choose default; up to 10.

**Props**

- `addresses`: SavedAddress[]
- `save`: server action
- `remove`: server action
- `makeDefault`: server action

**Tokens:** `color.error` `color.success` `color.text` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.weight.semibold` `space.1` `space.2` `space.3` `space.4` `space.5`

**Accessibility:** Each card has labelled actions; delete asks for confirmation; form errors per field.

**Used in:** shop:/account/addresses

```tsx
<AddressBook addresses={a} save={s} remove={r} makeDefault={d} />
```

## ProfileForm

`shared/src/components/account/ProfileForm.tsx` · commerce/account · updated 2026-11-16

My account → Profile: edit name and mobile; email shown read-only.

**Props**

- `name`: string
- `phone`: string
- `email`: string
- `action`: server action

**Tokens:** `color.error` `color.success` `font.size.sm` `space.4`

**Accessibility:** Labelled fields; result announced via role=status/alert.

**Used in:** shop:/account/profile

```tsx
<ProfileForm name={n} phone={p} email={e} action={saveProfile} />
```

## AnswerIntro

`shared/src/components/sections/InfoSections.tsx` · section · updated 2026-11-19

H1 + 1–2 sentence direct answer for AEO at the top of listing and info pages.

**Props**

- `title`: string
- `answer`: string
- `meta`: string

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Provides the page's single H1.

**Used in:** ContentPage, shop:/account (layout), shop:/contact, shop:/faq, shop:/track-order

```tsx
<AnswerIntro title="Kitchen & Dining" answer="…" />
```

## BrandStory

`shared/src/components/sections/InfoSections.tsx` · section · updated 2026-11-19

'Why choose City Seller?' story with category blurbs.

**Props**

- `title`: string
- `paragraphs`: string[]
- `blurbs`: {title,text,href}[]
- `background`: token

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** H2 + H3 blurbs.

**Used in:** HomeSections

```tsx
<BrandStory title="Why choose City Seller?" paragraphs={…} blurbs={…} />
```

## CategoryTiles

`shared/src/components/sections/CategoryTiles.tsx` · section · updated 2026-11-19

Navigational tiles for categories, featured collections and budget tiers.

**Props**

- `title`: string
- `subtitle`: string
- `items`: {label,href,image?,caption?}[]
- `variant`: circle|card|price
- `background`: token
- `spacing`: token

**Variants:** circle, card, price

**Tokens:** `aspect.square` `aspect.tile` `color.border` `color.primary` `color.secondary` `color.surface` `color.text` `color.textMuted` `duration.base` `duration.slow` `font.lineHeight.tight` `font.size.2xl` `font.size.base` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.full` `radius.lg` `shadow.focus` `shadow.md` `space.1` `space.2` `space.20` `space.24` `space.4`

**Accessibility:** Tiles are links with visible text.

**Used in:** HomeSections

```tsx
<CategoryTiles title="Shop by category" items={…} />
```

## ContentPage

`shared/src/components/sections/ContentPage.tsx` · section · updated 2026-11-12

Policy/info page template from ContentPage data.

**Props**

- `page`: ContentPage
- `crumbs`: Crumb[]

**Tokens:** `space.12`

**Accessibility:** Article with H1/H2 outline.

**Used in:** shop:/about, shop:/policies/[slug]

```tsx
<ContentPage page={policies.shipping} crumbs={…} />
```

## CustomerCare

`shared/src/components/sections/InfoSections.tsx` · section · updated 2026-11-19

Care block: phone, WhatsApp, email, hours + Track order.

**Props**

- `care`: Settings.care
- `title`: string
- `subtitle`: string
- `background`: token

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Contact links are real tel:/mailto:.

**Used in:** HomeSections, shop:/contact, shop:/faq

```tsx
<CustomerCare />
```

## FAQSection

`shared/src/components/sections/InfoSections.tsx` · section · updated 2026-11-19

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

**Used in:** ContentPage, HomeSections, shop:/[category]/[sub]/[product], shop:/faq, shop:/guides/[slug]

```tsx
<FAQSection faqs={category.faqs} />
```

## GuideCards

`shared/src/components/sections/GuideCards.tsx` · section · updated 2026-11-12

Buying-guide card grid.

**Props**

- `title`: string
- `posts`: Post[]
- `viewAllHref`: string
- `background`: token
- `asPage`: boolean

**Tokens:** `aspect.banner` `color.background` `color.border` `color.surface` `color.textMuted` `font.family.heading` `font.size.base` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `space.0` `space.2` `space.4` `space.6`

**Accessibility:** Stretched-link cards.

**Used in:** HomeSections, shop:/guides

```tsx
<GuideCards posts={posts} />
```

## HeroBanner

`shared/src/components/sections/HeroBanner.tsx` · section · updated 2026-11-15

Homepage hero slide: the finished artwork only (text is in the image), full width at 7:3, never cropped; optional whole-slide link.

**Props**

- `image`: {src,alt}
- `as`: h1|h2 (screen-reader heading)
- `priority`: boolean (first slide only)
- `href`: string (whole slide link)

**Tokens:** `aspect.hero` `color.secondary` `radius.xl` `shadow.focus`

**Accessibility:** Use as=h1 only once per page.

**Used in:** HeroCarousel

```tsx
<HeroBanner image={{ src, alt }} href="/kitchen" />
```

## HeroCarousel

`shared/src/components/sections/HeroCarousel.tsx` · section · updated 2026-11-15

Rotating hero for 2–5 slides: auto-advance (paused on hover, focus or the pause button; off for reduced motion), arrows and dots; first slide is the LCP image.

**Props**

- `slides`: HeroSlide[]
- `intervalMs`: number

**Tokens:** `color.ink` `color.primary` `color.surface` `color.text` `duration.slide` `radius.full` `shadow.focus` `shadow.md` `space.1` `space.11` `space.2` `space.4` `space.5` `space.6` `space.8` `zIndex.raised`

**Accessibility:** Region with aria-roledescription=carousel; slides labelled n of total; pause control; reduced-motion aware.

**Used in:** HomeSections

```tsx
<HeroCarousel slides={slides} />
```

## HomeSections

`shared/src/components/sections/HomeSections.tsx` · section · updated 2026-11-19

Renders the homepage from Admin → Homepage content: sections in order, skipping hidden or out-of-schedule items, each mapped to an existing section component.

**Props**

- `sections`: HomeSection[]
- `ctx`: {categories, posts, faqs, settings}

**Tokens:** `space.4` `space.6`

**Accessibility:** Guarantees one H1 (screen-reader-only fallback when no hero is live).

**Used in:** shop:/

```tsx
<HomeSections sections={home.sections} ctx={…} />
```

## ListingTemplate

`shared/src/components/sections/ListingTemplate.tsx` · section · updated 2026-11-19

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

**Tokens:** `font.size.2xl` `font.size.3xl` `font.tracking.tight` `font.weight.semibold` `space.3` `space.4` `space.6`

**Accessibility:** Single H1; chips nav labelled Refine.

**Used in:** shop:/[category], shop:/[category]/[sub], shop:/bestsellers, shop:/budget/[tier], shop:/flash-sale, shop:/new-arrivals, shop:/search

```tsx
<ListingTemplate crumbs={…} title="Cleaning" answer={…} products={cards} />
```

## NotFoundContent

`shared/src/components/sections/NotFoundContent.tsx` · section · updated 2026-11-12

404 body with search and helpful links.

**Tokens:** `color.primary` `color.textMuted` `font.family.heading` `font.size.3xl` `font.size.5xl` `font.weight.semibold` `maxWidth.modal` `space.3` `space.4`

**Accessibility:** H1 + search.

**Used in:** shop: (not-found)

```tsx
<NotFoundContent />
```

## ProductGrid

`shared/src/components/sections/ProductGrid.tsx` · section · updated 2026-11-19

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

**Tokens:** `space.0` `space.3` `space.4` `space.40` `space.48`

**Accessibility:** Section labelled by its heading.

**Used in:** HomeSections, shop:/[category]/[sub]/[product]

```tsx
<ProductGrid title="Bestsellers" products={cards} viewAllHref="/bestsellers" />
```

## SaleBanner

`shared/src/components/sections/SaleBanner.tsx` · section · updated 2026-11-12

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

**Used in:** HomeSections

```tsx
<SaleBanner title="Up to 50% off" cta={{label:"Shop",href:"/kitchen"}} />
```

## ValueProps

`shared/src/components/sections/InfoSections.tsx` · section · updated 2026-11-19

Five value propositions (range, pricing, shipping, returns, secure prepaid).

**Props**

- `title`: string
- `items`: {icon (name), title, text}[] (from Admin → Homepage)
- `background`: token
- `hideTitle`: boolean

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.family.heading` `font.lineHeight.relaxed` `font.size.3xl` `font.size.4xl` `font.size.base` `font.size.lg` `font.size.sm` `font.tracking.tight` `font.weight.semibold` `maxWidth.prose` `radius.full` `radius.lg` `space.1` `space.10` `space.12` `space.2` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** Section has aria-label.

**Used in:** HomeSections, shop:/about

```tsx
<ValueProps />
```

## Analytics

`shared/src/components/layout/Analytics.tsx` · layout · updated 2026-11-12

Loads GA4 (NEXT_PUBLIC_GA_ID) and Microsoft Clarity (NEXT_PUBLIC_CLARITY_ID) after the page is interactive; shop only, never in the admin.

**Accessibility:** Renders no UI.

**Used in:** StoreShell

```tsx
<Analytics /> // in StoreShell
```

## Breadcrumbs

`shared/src/components/layout/Breadcrumbs.tsx` · layout · updated 2026-11-12

Breadcrumb trail with BreadcrumbList JSON-LD; Home auto-prepended.

**Props**

- `items`: {label,href?}[]
- `withJsonLd`: boolean
- `home`: Crumb (default Home → /; admin passes Dashboard)

**Tokens:** `color.text` `color.textMuted` `font.size.sm` `space.1` `space.3` `space.9`

**Accessibility:** nav aria-label=Breadcrumb, aria-current=page.

**Used in:** ContentPage, ListingTemplate, admin:/categories/[id], admin:/content/faqs, admin:/content/pages/[slug], admin:/guides/[slug], admin:/orders/[id], admin:/products/[id], admin:/products/new, shop:/[category]/[sub]/[product], shop:/account (layout), shop:/cart, shop:/checkout, shop:/contact, shop:/faq, shop:/guides, shop:/guides/[slug], shop:/track-order

```tsx
<Breadcrumbs items={[{label:"Kitchen",href:"/kitchen"},{label:"Jars"}]} />
```

## BudgetMenu

`shared/src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-19

'Shop by Budget' dropdown of five price tiers.

**Tokens:** `aspect.tile` `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.text` `color.textInverse` `color.textMuted` `duration.slow` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8` `space.9`

**Accessibility:** Links in list.

**Used in:** Header

```tsx
<BudgetMenu />
```

## CategoryNav

`shared/src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-19

Marketplace-style category bar: one hover menu per top category (subcategory columns, View all, category picture); plain link when a category has no subcategories; 4 on laptops, 6 on wide screens, then All categories.

**Props**

- `tree`: NavCategory[]

**Tokens:** `aspect.tile` `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.text` `color.textInverse` `color.textMuted` `duration.slow` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8` `space.9`

**Accessibility:** Each menu is a disclosure button (aria-expanded); closes on Escape, outside click and focus leaving.

**Used in:** Header

```tsx
<CategoryNav tree={tree} />
```

## CategoryStrip

`shared/src/components/layout/CategoryStrip.tsx` · layout · updated 2026-11-19

Phone/tablet header row of sideways-scrolling category bubbles (Flash Sale, Bestsellers, New, then categories).

**Props**

- `tree`: NavCategory[]
- `className`: string

**Tokens:** `color.border` `color.primary` `color.text` `font.lineHeight.tight` `font.size.xs` `font.weight.medium` `font.weight.semibold` `radius.full` `shadow.focus` `space.0` `space.1` `space.2` `space.20`

**Accessibility:** nav landmark 'Categories'; each bubble is a labelled link.

**Used in:** Header

```tsx
<CategoryStrip tree={tree} />
```

## Container

`shared/src/components/layout/Container.tsx` · layout · updated 2026-11-19

Centred page-width wrapper with standard gutters.

**Props**

- `as`: ElementType
- `width`: default|narrow|prose|full

**Variants:** default, narrow, prose, full

**Tokens:** `color.background` `color.ink` `color.primarySoft` `color.secondary` `color.surface` `color.textInverse` `maxWidth.container` `maxWidth.narrow` `maxWidth.prose` `space.0` `space.10` `space.16` `space.4` `space.6`

**Accessibility:** Neutral.

**Used in:** ContentPage, Footer, Header, HeroCarousel, ListingTemplate, PageSkeleton, Section, layout/MegaMenu, shop:/[category]/[sub]/[product], shop:/account (layout), shop:/cart, shop:/checkout, shop:/contact, shop:/faq, shop:/guides, shop:/guides/[slug], shop:/login, shop:/order/[id], shop:/track-order

```tsx
<Container>…</Container>
```

## Footer

`shared/src/components/layout/Footer.tsx` · layout · updated 2026-11-19

Footer: care hours/phone/email, shop, help, policies, socials, business name.

**Props**

- `tree`: NavCategory[]
- `settings`: Settings (care, socials)

**Tokens:** `color.ink` `color.surface` `color.textInverse` `font.family.heading` `font.size.base` `font.size.lg` `font.size.sm` `font.weight.semibold` `radius.md` `space.10` `space.11` `space.12` `space.2` `space.3` `space.4` `space.6` `space.9`

**Accessibility:** Contentinfo landmark; headings per column.

**Used in:** StoreShell

```tsx
<Footer tree={tree} />
```

## Header

`shared/src/components/layout/Header.tsx` · layout · updated 2026-11-19

Sticky header: logo, search, account, cart, desktop nav row.

**Props**

- `tree`: NavCategory[]
- `settings`: Settings

**Tokens:** `color.border` `color.secondary` `color.surface` `color.text` `font.size.base` `font.weight.medium` `maxWidth.narrow` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `zIndex.sticky`

**Accessibility:** Main nav landmark; mobile search row.

**Used in:** StoreShell

```tsx
<Header tree={tree} />
```

## Logo

`shared/src/components/layout/Logo.tsx` · layout · updated 2026-11-15

City Seller wordmark link to home.

**Props**

- `inverse`: boolean

**Variants:** default, inverse

**Tokens:** `space.11` `space.2` `space.6` `space.9`

**Accessibility:** Link aria-label 'City Seller home'.

**Used in:** AdminShell, Footer, Header, admin:/login, admin:/mfa

```tsx
<Logo />
```

## MegaMenu

`shared/src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-19

Data-driven 'Shop by Category' mega-menu (category → subcategory links with thumbnails).

**Props**

- `tree`: NavCategory[]

**Tokens:** `aspect.tile` `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.text` `color.textInverse` `color.textMuted` `duration.slow` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8` `space.9`

**Accessibility:** Links in lists.

```tsx
<MegaMenu tree={tree} />
```

## MobileNav

`shared/src/components/layout/MobileNav.tsx` · layout · updated 2026-11-16

Hamburger + left drawer with category accordion, budget tiers, links and socials.

**Props**

- `tree`: NavCategory[]
- `social`: Settings.social

**Tokens:** `color.border` `color.secondary` `color.text` `color.textMuted` `font.size.base` `font.size.sm` `font.tracking.wider` `font.weight.semibold` `radius.md` `space.1` `space.11` `space.2` `space.4` `space.6`

**Accessibility:** Drawer semantics; nav aria-label=Mobile.

**Used in:** Header

```tsx
<MobileNav tree={tree} />
```

## MobileTabBar

`shared/src/components/layout/MobileTabBar.tsx` · layout · updated 2026-11-19

App-style bottom bar on phones: Home, Categories, Account, Cart (opens the cart drawer with a live count).

**Tokens:** `color.border` `color.primary` `color.primarySoft` `color.surface` `color.textInverse` `color.textMuted` `duration.fast` `font.size.xs` `font.weight.bold` `font.weight.medium` `font.weight.semibold` `radius.full` `radius.lg` `radius.xl` `shadow.focus` `shadow.lg` `space.1` `space.14` `space.2` `space.5` `space.6` `space.8` `zIndex.sticky`

**Accessibility:** nav landmark 'Shortcuts'; active tab marked aria-current; cart button announces the item count.

**Used in:** StoreShell

```tsx
<MobileTabBar />
```

## MoreMenu

`shared/src/components/layout/MegaMenu.tsx` · layout · updated 2026-11-19

'More' dropdown at the end of the category bar: Bestsellers, New arrivals, Buying guides, All categories.

**Tokens:** `aspect.tile` `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.text` `color.textInverse` `color.textMuted` `duration.slow` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8` `space.9`

**Accessibility:** Disclosure button; right-aligned panel of links.

**Used in:** Header

```tsx
<MoreMenu />
```

## NavDropdown

`shared/src/components/layout/NavDropdown.tsx` · layout · updated 2026-11-19

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

`shared/src/components/layout/Container.tsx` · layout · updated 2026-11-19

Full-bleed band with background token and vertical rhythm.

**Props**

- `background`: background|surface|secondary|soft|ink
- `spacing`: none|sm|md|lg
- `containerWidth`: Container width

**Variants:** background, surface, secondary, soft, ink

**Sizes:** none (`py-0`), sm (`py-6 md:py-8`), md (`py-10 md:py-16`), lg (`py-16 md:py-24`)

**Tokens:** `color.background` `color.ink` `color.primarySoft` `color.secondary` `color.surface` `color.textInverse` `maxWidth.container` `maxWidth.narrow` `maxWidth.prose` `space.0` `space.10` `space.16` `space.4` `space.6`

**Accessibility:** Pass aria-labelledby to name the region.

**Used in:** CategoryTiles, GuideCards, HomeSections, NotFoundContent, ProductGrid, sections/InfoSections, shop:/[category]/[sub]/[product]

```tsx
<Section background="surface">…</Section>
```

## SettingsProvider

`shared/src/components/layout/SettingsProvider.tsx` · layout · updated 2026-11-12

Shares Admin → Settings values with client components (delivery fee, UPI %, contact). Filled by StoreShell.

**Props**

- `settings`: Settings
- `children`: ReactNode

**Accessibility:** Renders no UI.

**Used in:** StoreShell

```tsx
<SettingsProvider settings={await getSettings()}>…</SettingsProvider>
```

## StoreShell

`shared/src/components/layout/StoreShell.tsx` · layout · updated 2026-11-19

Storefront chrome (skip link, TopBar, Header, Footer, CartDrawer, Organization + WebSite JSON-LD).

**Props**

- `children`: ReactNode

**Tokens:** `color.surface` `radius.md` `shadow.lg` `space.2` `space.20` `space.4` `zIndex.toast`

**Accessibility:** Skip-to-content link; main landmark.

**Used in:** shop: (layout), shop: (not-found)

```tsx
<StoreShell>{children}</StoreShell>
```

## AdminShell

`admin/src/components/admin/AdminShell.tsx` · admin · updated 2026-11-19

Admin layout: sidebar (desktop) / scrolling nav (mobile), pending-orders badge, sign-out, dev-mode banner.

**Props**

- `email`: string
- `devMode`: boolean
- `pendingCount`: number
- `signOut`: server action
- `children`: ReactNode

**Tokens:** `color.background` `color.border` `color.error` `color.errorSoft` `color.ink` `color.primary` `color.secondary` `color.surface` `color.text` `color.textInverse` `color.textMuted` `color.warning` `color.warningSoft` `font.size.base` `font.size.sm` `font.size.xs` `font.tracking.wide` `font.weight.bold` `font.weight.medium` `font.weight.semibold` `maxWidth.container` `radius.full` `radius.md` `radius.sm` `shadow.focus` `space.0` `space.0.5` `space.1` `space.11` `space.2` `space.3` `space.4` `space.5` `space.6` `space.8`

**Accessibility:** nav aria-label=Admin, aria-current on active link, main landmark.

**Used in:** admin: (layout)

```tsx
<AdminShell email={admin.email} pendingCount={counts.paid}>…</AdminShell>
```

## BlockEditor

`admin/src/components/admin/BlockEditor.tsx` · admin · updated 2026-11-12

Structured text editor for pages and guides: headings, paragraphs, bullet lists, product picks (plain text, no HTML).

**Props**

- `idPrefix`: string
- `blocks`: Block[]
- `onChange`: fn
- `allow`: BlockType[]
- `products`: ProductOption[]

**Variants:** h2, p, ul, products

**Tokens:** `space.2` `space.3` `space.4`

**Used in:** PostForm, admin/PageEditors

```tsx
<BlockEditor blocks={blocks} onChange={setBlocks} allow={["p", "h2", "ul"]} />
```

## CategoryForm

`admin/src/components/admin/CategoryForm.tsx` · admin · updated 2026-11-19

Add/edit a category or subcategory: name, slug, parent, intro answer, blurb, image, order, visibility, SEO, FAQs; guarded delete.

**Props**

- `values`: CategoryFormValues
- `parents`: {slug,name}[]
- `action`: server action
- `deleteAction`: server action
- `upload`: server action

**Tokens:** `color.border` `color.error` `color.errorSoft` `color.success` `color.successSoft` `color.surface` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `radius.md` `space.0` `space.3` `space.4` `space.6` `zIndex.sticky`

**Used in:** admin:/categories/[id]

```tsx
<CategoryForm values={c} parents={tops} action={saveCategoryAction} … />
```

## ContentSaveForm

`admin/src/components/admin/EditorKit.tsx` · admin · updated 2026-11-15

Wraps a CMS editor: serialises the edited value to JSON, saves via server action, sticky save bar with result message.

**Props**

- `contentKey`: settings|home|faqs|page:*
- `value`: unknown
- `action`: server action
- `saveLabel`: string
- `extra`: ReactNode

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.success` `color.surface` `color.text` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.16` `space.2` `space.24` `space.3` `space.4` `space.6` `space.9` `zIndex.sticky`

**Accessibility:** Result announced (status/alert).

**Used in:** HomeEditor, SettingsForm, admin/PageEditors

```tsx
<ContentSaveForm contentKey="faqs" value={{ items }} action={saveContentAction}>…</ContentSaveForm>
```

## CopyField

`admin/src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Label + value + copy button for pasting customer details into Meesho.

**Props**

- `label`: string
- `value`: string
- `multiline`: boolean

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Used in:** admin:/orders/[id]

```tsx
<CopyField label="Phone" value={a.phone} />
```

## DeleteProductCard

`admin/src/components/admin/DeleteProductCard.tsx` · admin · updated 2026-11-15

Remove-product panel on the product editor; confirms first and is disabled when the product is in any order (hide it instead).

**Props**

- `id`: string
- `title`: string
- `orderCount`: number
- `action`: server action

**Tokens:** `color.error` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.weight.semibold` `space.3` `space.4`

**Accessibility:** Confirmation dialog before deleting; result announced via role=alert.

**Used in:** admin:/products/[id]

```tsx
<DeleteProductCard id={p.id} title={p.title} orderCount={n} action={deleteProductAction} />
```

## FaqEditor

`admin/src/components/admin/PageEditors.tsx` · admin · updated 2026-11-12

Edit the store-wide FAQs.

**Props**

- `initial`: Faq[]
- `action`: server action

**Tokens:** `font.family.heading` `font.size.xl` `font.weight.semibold` `space.4`

**Used in:** admin:/content/faqs

```tsx
<FaqEditor initial={faqs} action={saveContentAction} />
```

## HomeEditor

`admin/src/components/admin/HomeEditor.tsx` · admin · updated 2026-11-12

Admin → Homepage: section list (reorder, show/hide, schedule badge, delete, add) with an edit panel; saves the whole layout.

**Props**

- `initial`: HomeContent
- `categories`: …
- `products`: …
- `shopUrl`: string
- `action`: server action
- `upload`: server action

**Tokens:** `color.background` `color.border` `color.error` `color.ink` `color.secondary` `color.text` `color.textMuted` `font.family.heading` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.md` `shadow.focus` `space.0` `space.1` `space.2` `space.3` `space.4` `space.6` `space.9`

**Accessibility:** Ordered list; aria-current on the section being edited; delete asks for confirmation.

**Used in:** admin:/content/home

```tsx
<HomeEditor initial={home} … action={saveContentAction} />
```

## ImageField

`admin/src/components/admin/EditorKit.tsx` · admin · updated 2026-11-15

Single image picker: preview, upload to Supabase Storage, or paste a site path / https link.

**Props**

- `id`: string
- `label`: string
- `value`: string
- `onChange`: (src)=>void
- `upload`: server action
- `folder`: products|banners|categories|guides
- `slug`: string
- `optional`: boolean

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.success` `color.surface` `color.text` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.16` `space.2` `space.24` `space.3` `space.4` `space.6` `space.9` `zIndex.sticky`

**Accessibility:** Labelled input; hidden file input triggered by a labelled button.

**Used in:** CategoryForm, PostForm, SectionEditor

```tsx
<ImageField id="hero-img" label="Image" value={src} onChange={setSrc} upload={uploadImageAction} folder="banners" slug="hero" />
```

## ImageManager

`admin/src/components/admin/ImageManager.tsx` · admin · updated 2026-11-15

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

## ListEditor

`admin/src/components/admin/EditorKit.tsx` · admin · updated 2026-11-15

Generic reorderable list editor (slides, banners, FAQs, paragraphs, blocks) with add / move / remove.

**Props**

- `items`: T[]
- `onChange`: (T[])=>void
- `renderItem`: (item, update, index)=>ReactNode
- `newItem`: ()=>T
- `itemLabel`: (item, i)=>string
- `addLabel`: string
- `min`: number
- `max`: number

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.success` `color.surface` `color.text` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.16` `space.2` `space.24` `space.3` `space.4` `space.6` `space.9` `zIndex.sticky`

**Accessibility:** Each item is a fieldset with a legend; move/remove buttons are labelled with the item name.

**Used in:** CategoryForm, PostForm, SectionEditor, admin/BlockEditor, admin/PageEditors

```tsx
<ListEditor items={faqs} onChange={setFaqs} newItem={() => ({ q: '', a: '' })} … />
```

## LoginForm

`admin/src/components/admin/LoginForm.tsx` · admin · updated 2026-11-14

Email + password sign-in for partners in public.admins.

**Props**

- `action`: server action (prev, FormData) => ActionState

**Tokens:** `color.error` `color.errorSoft` `font.size.sm` `radius.md` `space.3` `space.4`

**Accessibility:** Labelled fields, autocomplete tokens, alert on error.

**Used in:** admin:/login

```tsx
<LoginForm action={signInAction} />
```

## MarginText

`admin/src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Margin in ₹ and % (green ≥ 25%, amber below, red if negative).

**Props**

- `price`: number
- `cost`: number
- `quantity`: number

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Value is text; colour is supplementary.

**Used in:** admin:/, admin:/orders, admin:/orders/[id], admin:/products

```tsx
<MarginText price={449} cost={260} />
```

## MfaForm

`admin/src/components/admin/MfaForm.tsx` · admin · updated 2026-11-15

Admin two-step sign-in: enter the 6-digit code emailed to the admin, or send a new one.

**Props**

- `email`: string
- `verify`: server action
- `resend`: server action
- `sendFailed`: boolean

**Tokens:** `color.error` `color.errorSoft` `color.success` `color.text` `color.textMuted` `font.size.sm` `font.weight.semibold` `radius.md` `space.2` `space.3` `space.4`

**Accessibility:** Code input uses inputMode=numeric and autocomplete=one-time-code.

**Used in:** admin:/mfa

```tsx
<MfaForm email={email} verify={verifyCode} resend={resendCode} />
```

## OrderActions

`admin/src/components/admin/OrderActions.tsx` · admin · updated 2026-11-12

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

**Used in:** admin:/orders/[id]

```tsx
<OrderActions orderId={o.id} next={adminTransitions(o.status)} … />
```

## OrderStatusBadge

`admin/src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Admin status pill using internal labels; needs-action states in warning tone.

**Props**

- `status`: OrderStatus

**Variants:** pending_payment, paid, placed_on_meesho, shipped, delivered, cancelled_refunded, return_requested, returned_refunded

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Text label (colour is not the only signal).

**Used in:** admin:/, admin:/orders, admin:/orders/[id]

```tsx
<OrderStatusBadge status="paid" />
```

## OrderTimeline

`admin/src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Newest-first order event history with time and note.

**Props**

- `events`: OrderEvent[]

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Accessibility:** Ordered list with time elements.

**Used in:** admin:/orders/[id]

```tsx
<OrderTimeline events={order.events} />
```

## PageEditor

`admin/src/components/admin/PageEditors.tsx` · admin · updated 2026-11-12

Edit About / Shipping / Returns / Privacy / Terms: title, answer, meta description, content blocks.

**Props**

- `initial`: PageContent
- `viewHref`: string
- `action`: server action

**Tokens:** `font.family.heading` `font.size.xl` `font.weight.semibold` `space.4`

**Used in:** admin:/content/pages/[slug]

```tsx
<PageEditor initial={page} viewHref="/about" action={saveContentAction} />
```

## PostForm

`admin/src/components/admin/PostForm.tsx` · admin · updated 2026-11-12

Write/edit a buying guide: title, slug, summary, cover, content blocks with product picks, FAQs, publish toggle, delete.

**Props**

- `values`: PostFormValues
- `products`: ProductOption[]
- `action`: server action
- `deleteAction`: server action
- `upload`: server action

**Tokens:** `color.border` `color.error` `color.errorSoft` `color.success` `color.successSoft` `color.surface` `color.textMuted` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `radius.md` `space.0` `space.1` `space.2` `space.3` `space.4` `space.6` `zIndex.sticky`

**Used in:** admin:/guides/[slug]

```tsx
<PostForm values={post} products={opts} action={savePostAction} … />
```

## ProductForm

`admin/src/components/admin/ProductForm.tsx` · admin · updated 2026-11-19

Create/edit product: basics, pricing with live margin and discount, Meesho link/price + checked flag, photos, content, visibility, SEO.

**Props**

- `values`: ProductFormValues
- `categories`: CategoryOption[]
- `action`: server action
- `upload`: server action
- `notice`: string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.errorSoft` `color.ink` `color.success` `color.successSoft` `color.surface` `color.text` `color.textInverse` `color.textMuted` `color.warning` `duration.fast` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.11` `space.2` `space.20` `space.3` `space.4` `space.6` `zIndex.sticky`

**Accessibility:** Fieldsets with legends, inline errors, live margin region, sticky save bar.

**Used in:** admin:/products/[id], admin:/products/new

```tsx
<ProductForm values={toFormValues(p)} categories={cats} action={saveProductAction} upload={uploadImageAction} />
```

## ProductPicker

`admin/src/components/admin/ProductPicker.tsx` · admin · updated 2026-11-12

Search and pick products by title, keeping order (hand-picked rows, product blocks in guides).

**Props**

- `label`: string
- `options`: {slug,title,image}[]
- `value`: string[]
- `onChange`: fn
- `max`: number

**Tokens:** `color.background` `color.border` `color.secondary` `color.surface` `color.text` `color.textMuted` `font.size.sm` `font.weight.medium` `radius.md` `radius.sm` `shadow.focus` `shadow.lg` `space.0` `space.1` `space.11` `space.2` `space.4` `space.8` `space.80` `space.9` `zIndex.dropdown`

**Accessibility:** Labelled search; results with role=listbox; labelled reorder/remove buttons.

**Used in:** SectionEditor, admin/BlockEditor

```tsx
<ProductPicker label="Products" options={opts} value={slugs} onChange={setSlugs} />
```

## ProductQuickActions

`admin/src/components/admin/ProductQuickActions.tsx` · admin · updated 2026-11-15

One-click product changes in the product list: sold out / in stock, hide / show, New badge (auto/on/off), duplicate.

**Props**

- `id`: string
- `title`: string
- `inStock`: boolean
- `isActive`: boolean
- `isNew`: boolean|null
- `showsNew`: boolean
- `action`: server action

**Tokens:** `color.error` `space.1` `space.4`

**Accessibility:** Each button label includes the product title.

**Used in:** admin:/products

```tsx
<ProductQuickActions id={p.id} title={p.title} … action={productQuickAction} />
```

## ScheduleFields

`admin/src/components/admin/EditorKit.tsx` · admin · updated 2026-11-15

Optional show-from / hide-after date-times in IST for offers, slides and sections.

**Props**

- `value`: {startsAt, endsAt} ISO
- `onChange`: fn
- `idPrefix`: string

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.success` `color.surface` `color.text` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.16` `space.2` `space.24` `space.3` `space.4` `space.6` `space.9` `zIndex.sticky`

**Accessibility:** Native datetime-local inputs with labels and hints.

**Used in:** SectionEditor

```tsx
<ScheduleFields idPrefix="b1" value={banner} onChange={update} />
```

## SectionEditor

`admin/src/components/admin/SectionEditor.tsx` · admin · updated 2026-11-19

Edit form for one homepage section; fields depend on the type (hero slides, product row, banners, tiles, value props, story, guides, FAQ).

**Props**

- `section`: HomeSection
- `onChange`: fn
- `categories`: {slug,name,parentSlug}[]
- `products`: ProductOption[]
- `upload`: server action

**Tokens:** `color.border` `color.surface` `color.textMuted` `font.size.sm` `font.weight.medium` `font.weight.semibold` `radius.md` `space.1` `space.2` `space.3` `space.4`

**Used in:** HomeEditor

```tsx
<SectionEditor section={s} onChange={update} … />
```

## SettingsForm

`admin/src/components/admin/SettingsForm.tsx` · admin · updated 2026-11-19

Admin → Settings: promo strip, customer care, social links, delivery fee and threshold, return days, UPI discount text. Secrets are not editable.

**Props**

- `initial`: Settings
- `action`: server action

**Tokens:** `color.background` `color.textMuted` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.semibold` `radius.md` `space.0.5` `space.2` `space.4`

**Used in:** admin:/settings

```tsx
<SettingsForm initial={settings} action={saveContentAction} />
```

## StatCard

`admin/src/components/admin/AdminBits.tsx` · admin · updated 2026-11-12

Dashboard KPI card.

**Props**

- `label`: string
- `value`: ReactNode
- `hint`: ReactNode
- `tone`: default|warning|success

**Variants:** default, warning, success

**Tokens:** `color.border` `color.error` `color.ink` `color.success` `color.text` `color.textMuted` `color.warning` `font.family.heading` `font.size.3xl` `font.size.sm` `font.tracking.normal` `font.weight.medium` `font.weight.regular` `font.weight.semibold` `radius.full` `space.0` `space.1` `space.2` `space.3`

**Used in:** admin:/

```tsx
<StatCard label="To place" value={3} tone="warning" />
```

## TeamManager

`admin/src/components/admin/TeamManager.tsx` · admin · updated 2026-11-15

Super Admin team page: add admins, set role and permissions, remove access.

**Props**

- `team`: TeamMember[]
- `selfId`: string
- `add`: server action
- `update`: server action
- `remove`: server action

**Tokens:** `color.error` `color.success` `color.textMuted` `font.family.heading` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `space.1` `space.2` `space.3` `space.4` `space.6`

**Accessibility:** Permission checkboxes are labelled; destructive remove asks for confirmation.

**Used in:** admin:/team

```tsx
<TeamManager team={t} selfId={id} … />
```

## TextField

`admin/src/components/admin/EditorKit.tsx` · admin · updated 2026-11-15

Compact controlled text input / textarea with label, hint and character counter for CMS forms.

**Props**

- `id`: string
- `label`: string
- `value`: string
- `onChange`: fn
- `multiline`: boolean
- `maxLength`: number
- `required`: boolean

**Tokens:** `color.background` `color.border` `color.borderStrong` `color.error` `color.success` `color.surface` `color.text` `font.size.sm` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.16` `space.2` `space.24` `space.3` `space.4` `space.6` `space.9` `zIndex.sticky`

**Accessibility:** Uses FormField (label + hint).

**Used in:** CategoryForm, PostForm, SectionEditor, SettingsForm, admin/BlockEditor, admin/PageEditors

```tsx
<TextField id="title" label="Title" value={t} onChange={setT} maxLength={90} />
```

## cartTotals

`shared/src/hooks/useCart.ts` · hook · updated 2026-11-19

Derives count, subtotal, MRP total, savings, shipping and total from cart lines.

**Props**

- `items`: CartLine[]

**Used in:** CartButton, CartDrawer, CartView, CheckoutForm, MobileTabBar

```tsx
const { total } = cartTotals(items)
```

## useCart

`shared/src/hooks/useCart.ts` · hook · updated 2026-11-19

Zustand cart store persisted to localStorage (items, drawer state, add/setQuantity/remove/clear).

**Props**

- `returns`: {items,isOpen,add,setQuantity,remove,clear,open,close,setOpen}

**Used in:** AddToCartButton, CartButton, CartDrawer, CartLineItem, CartView, CheckoutForm, MobileTabBar

```tsx
const add = useCart((s) => s.add)
```

## useHydrated

`shared/src/hooks/useHydrated.ts` · hook · updated 2026-11-12

True after client hydration (guards localStorage-backed UI).

**Props**

- `returns`: boolean

**Used in:** CartButton, CartDrawer, CartView, CheckoutForm, MobileTabBar

```tsx
const hydrated = useHydrated()
```

## usePincode

`shared/src/hooks/usePincode.ts` · hook · updated 2026-11-19

Shopper's remembered delivery PIN (localStorage), shared live across header, product page and PIN checker.

**Used in:** DeliveryPromise, PincodeChecker

```tsx
const [pin, setPin] = usePincode();
```

## useRazorpay

`shared/src/hooks/useRazorpay.ts` · hook · updated 2026-11-12

Loads Razorpay Checkout.js on demand and opens it; resolves with the signed success payload or rejects (PaymentDismissedError on close).

**Props**

- `options`: RazorpayCheckoutOptions (from /api/checkout)
- `theme`: { color?: string }
- `returns`: (options, theme) => Promise<RazorpaySuccess>

**Used in:** CheckoutForm

```tsx
const open = useRazorpay(); const result = await open(data.checkout, { color: color.primary });
```

## useSettings

`shared/src/components/layout/SettingsProvider.tsx` · hook · updated 2026-11-12

Current store settings in client components (defaults outside a provider).

**Props**

- `returns`: Settings

**Used in:** CartButton, CartDrawer, CartView, CheckoutForm, DeliveryPromise, FreeDeliveryTag, MobileTabBar, PincodeChecker, PrepaidNotice, commerce/OrderSummary

```tsx
const { delivery } = useSettings()
```

## buildCategoryTree

`shared/src/components/layout/MegaMenu.tsx` · util · updated 2026-11-19

Turns flat categories into a top-level tree with children.

**Props**

- `categories`: Category[]

**Tokens:** `aspect.tile` `color.background` `color.border` `color.ink` `color.primary` `color.secondary` `color.text` `color.textInverse` `color.textMuted` `duration.slow` `font.size.base` `font.size.lg` `font.size.sm` `font.size.xl` `font.weight.medium` `font.weight.semibold` `radius.lg` `radius.md` `shadow.focus` `space.0` `space.1` `space.11` `space.2` `space.3` `space.4` `space.6` `space.8` `space.9`

**Used in:** HomeSections, StoreShell, lib/admin/product-values, shop:/categories, shop:/llms.txt (route)

```tsx
buildCategoryTree(await repo.listCategories())
```

## calcDiscount

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Whole-number discount % from MRP and price.

**Props**

- `mrp`: number
- `price`: number

**Used in:** PriceBlock, ProductCard, ProductForm

```tsx
calcDiscount(899, 449) // 50
```

## calcMargin

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Margin amount and % of price between selling price and supplier cost.

**Props**

- `price`: number
- `cost`: number

**Used in:** ProductForm, admin/AdminBits

```tsx
calcMargin(449, 260) // { amount: 189, percent: 42 }
```

## cleanBlocks

`admin/src/components/admin/BlockEditor.tsx` · util · updated 2026-11-12

Removes empty bullet lines from blocks before saving.

**Props**

- `blocks`: Block[]

**Tokens:** `space.2` `space.3` `space.4`

**Used in:** admin/PageEditors

```tsx
cleanBlocks(page.blocks)
```

## cn

`shared/src/lib/utils/cn.ts` · util · updated 2026-11-12

clsx + tailwind-merge configured for token class names.

**Props**

- `inputs`: ClassValue[]

**Used in:** AccountMenu, AccountNav, AddToCartButton, AdminShell, Badge, Breadcrumbs, Button, Card, CartLineItem, CategoryBrowser, CategoryListing, CategoryStrip, CategoryTiles, ChipNav, CopyButton, CustomerAuthForm, DataTable, DeliveryPromise, FormField, FreeDeliveryTag, Heading, HeroCarousel, HomeEditor, Logo, MobileTabBar, NavDropdown, PasswordInput, PrepaidNotice, PriceBlock, ProductCard, ProductForm, ProductGallery, ProductGrid, RatingStars, ReviewForm, SaleBanner, ScrollRail, SearchBox, SectionHeader, TrackOrderForm, admin/AdminBits, admin/EditorKit, commerce/OrderSummary, commerce/ProductBuyBox, layout/Container, layout/MegaMenu, sections/InfoSections, ui/Checkbox, ui/Disclosure, ui/Icon, ui/Input, ui/Misc, ui/Modal, ui/Toast

```tsx
cn("p-4", active && "bg-ink")
```

## daysSince

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Whole days since an ISO date (stale Meesho price checks).

**Props**

- `iso`: string
- `now`: Date

**Used in:** ProductForm, admin:/, admin:/products

```tsx
daysSince(p.priceCheckedAt) > 7
```

## estimateDelivery

`shared/src/lib/utils/delivery.ts` · util · updated 2026-11-12

PIN-zone delivery window (dates + region); SHIPPING constant in the same file.

**Props**

- `pincode`: string
- `now`: Date

**Used in:** DeliveryPromise, PincodeChecker, shop:/order/[id]

```tsx
estimateDelivery("411001")
```

## formatBought

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Honest 'bought' label from the real paid-order count (10+, 200+, 1.5k+); null below 10.

**Props**

- `count`: number

**Used in:** ProductCard, shop:/[category]/[sub]/[product]

```tsx
formatBought(37) // "30+ bought"
```

## formatDate

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

ISO date → '12 Nov 2026' (en-IN).

**Props**

- `iso`: string|Date

**Used in:** ContentPage, GuideCards, OrderSelfService, ReviewList, TrackOrderForm, admin/AdminBits, admin:/, admin:/content/pages, admin:/guides, admin:/orders, admin:/orders/[id], admin:/reviews, shop:/account, shop:/guides/[slug]

```tsx
formatDate(order.createdAt)
```

## formatINR

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Formats rupees with Indian grouping: 1299 → ₹1,299.

**Props**

- `amount`: number

**Used in:** CartLineItem, CategoryBrowser, CheckoutForm, DeliveryPromise, PincodeChecker, PriceBlock, ProductForm, TrackOrderForm, admin/AdminBits, admin:/, admin:/orders, admin:/orders/[id], admin:/products, commerce/OrderSummary, commerce/ProductBuyBox, lib/admin/whatsapp, lib/orders/service, shop:/[category]/[sub]/[product], shop:/account, shop:/faq, shop:/llms.txt (route), shop:/order/[id]

```tsx
formatINR(1299)
```

## getBudgetTier

`shared/src/lib/utils/budget.ts` · util · updated 2026-11-12

Looks up a BUDGET_TIERS entry by slug (BUDGET_TIERS constant lives in the same file).

**Props**

- `slug`: string

**Used in:** shop:/budget/[tier]

```tsx
getBudgetTier("under-599")
```

## inBudget

`shared/src/lib/utils/budget.ts` · util · updated 2026-11-12

Whether a price falls inside a budget tier.

**Props**

- `price`: number
- `tier`: BudgetTier

```tsx
inBudget(449, tier)
```

## isProductNew

`shared/src/lib/utils/product.ts` · util · updated 2026-11-19

New badge rule: manual override wins; otherwise automatic for 30 days after the product is added.

**Props**

- `p`: {isNew, createdAt}
- `now`: Date

**Used in:** admin:/products, lib/data/seed-repo, lib/data/supabase-repo, toCardProduct

```tsx
isProductNew(product)
```

## paths

`shared/src/lib/utils/paths.ts` · util · updated 2026-11-15

Canonical URL builders (the only place URL shapes are defined).

**Props**

- `category(c)`: string
- `product(p)`: string
- `budget(slug)`: string
- `…`: see file
- `admin(path)`: string (clean URL on the admin host, /admin/… locally)

**Used in:** AccountMenu, AccountNav, AddToCartButton, AdminShell, CartDrawer, CartView, CategoryStrip, CheckoutForm, Footer, GuideCards, Header, HomeSections, MobileNav, NotFoundContent, SectionEditor, admin:/, admin:/actions.ts, admin:/categories, admin:/categories/[id], admin:/cms-actions.ts, admin:/content/faqs, admin:/content/pages, admin:/content/pages/[slug], admin:/guides, admin:/guides/[slug], admin:/orders, admin:/orders/[id], admin:/products, admin:/products/[id], admin:/products/new, admin:/reviews, layout/MegaMenu, lib/admin/product-values, lib/data/admin-content, lib/data/seed-repo, lib/seo/jsonld, lib/utils/product, sections/InfoSections, shop:/[category], shop:/[category]/[sub], shop:/[category]/[sub]/[product], shop:/about, shop:/account, shop:/account (layout), shop:/bestsellers, shop:/budget/[tier], shop:/cart, shop:/categories, shop:/checkout, shop:/contact, shop:/faq, shop:/feeds/google.xml (route), shop:/flash-sale, shop:/guides, shop:/guides/[slug], shop:/llms.txt (route), shop:/new-arrivals, shop:/order/[id], shop:/policies/[slug], shop:/search, shop:/sitemap.ts, shop:/track-order

```tsx
paths.product(p)
```

## shippingFor

`shared/src/lib/utils/delivery.ts` · util · updated 2026-11-12

Delivery fee for a subtotal (free above threshold).

**Props**

- `subtotal`: number

**Used in:** hooks/useCart, lib/data/seed-repo, shop:/feeds/google.xml (route)

```tsx
shippingFor(399) // 49
```

## slugify

`shared/src/lib/utils/format.ts` · util · updated 2026-11-19

Text → URL slug.

**Props**

- `input`: string

**Used in:** CategoryForm, CategoryTiles, PostForm, ProductForm, ProductGrid, lib/admin/forms, sections/InfoSections

```tsx
slugify("Airtight Jar Set (6 pc)")
```

## telHref

`shared/src/lib/utils/contact.ts` · util · updated 2026-11-12

Phone number → tel: link.

**Props**

- `phone`: string

**Used in:** Footer, sections/InfoSections

```tsx
telHref("+91 90000 00000") // tel:+919000000000
```

## toCardProduct

`shared/src/lib/utils/product.ts` · util · updated 2026-11-19

Product → serializable CardProduct for client components.

**Props**

- `p`: Product

**Used in:** HomeSections, shop:/[category], shop:/[category]/[sub], shop:/[category]/[sub]/[product], shop:/bestsellers, shop:/budget/[tier], shop:/flash-sale, shop:/guides/[slug], shop:/new-arrivals, shop:/search

```tsx
products.map(toCardProduct)
```

## tokenStyle

`shared/src/lib/utils/token-style.ts` · util · updated 2026-11-12

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

## track

`shared/src/lib/utils/analytics.ts` · util · updated 2026-11-12

GA4 ecommerce event helper (add_to_cart, begin_checkout, purchase, view_item); no-op when GA is not loaded.

**Props**

- `event`: string
- `params`: { value, transaction_id, shipping, items }

**Used in:** AddToCartButton, CheckoutForm, PurchaseTracker

```tsx
track("add_to_cart", { value: 449, items: [...] })
```

## validators

`shared/src/lib/utils/validators.ts` · util · updated 2026-11-19

Zod schemas: pincodeSchema, phoneSchema, addressSchema, checkoutSchema, trackOrderSchema, INDIAN_STATES.

```tsx
addressSchema.safeParse(body)
```

## whatsappHref

`shared/src/lib/utils/contact.ts` · util · updated 2026-11-12

WhatsApp click-to-chat link with optional prefilled text.

**Props**

- `number`: string (digits)
- `text`: string

**Used in:** lib/admin/whatsapp

```tsx
whatsappHref("919876543210", "Hi")
```

## buildArticleJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

Article JSON-LD for guides.

**Props**

- `post`: Post

**Used in:** shop:/guides/[slug]

```tsx
buildArticleJsonLd(post)
```

## buildBreadcrumbJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

BreadcrumbList JSON-LD.

**Props**

- `items`: Crumb[]

**Used in:** Breadcrumbs

```tsx
buildBreadcrumbJsonLd(crumbs)
```

## buildFaqJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

FAQPage JSON-LD.

**Props**

- `faqs`: Faq[]

**Used in:** sections/InfoSections

```tsx
buildFaqJsonLd(faqs)
```

## buildItemListJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

ItemList JSON-LD for listing pages.

**Props**

- `name`: string
- `items`: {name,url}[]

**Used in:** ListingTemplate

```tsx
buildItemListJsonLd(title, items)
```

## buildMetadata

`shared/src/lib/seo/metadata.ts` · seo · updated 2026-11-12

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

**Used in:** shop:/, shop:/[category], shop:/[category]/[sub], shop:/[category]/[sub]/[product], shop:/about, shop:/account, shop:/account/addresses, shop:/account/password, shop:/account/profile, shop:/bestsellers, shop:/budget/[tier], shop:/cart, shop:/categories, shop:/checkout, shop:/contact, shop:/faq, shop:/flash-sale, shop:/guides, shop:/guides/[slug], shop:/login, shop:/new-arrivals, shop:/order/[id], shop:/policies/[slug], shop:/search, shop:/track-order

```tsx
export const metadata = buildMetadata({ title, description, path: "/" })
```

## buildOrganizationJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

OnlineStore/Organization JSON-LD.

**Used in:** StoreShell

```tsx
buildOrganizationJsonLd()
```

## buildProductJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

Product + Offer (shipping, returns) + AggregateRating JSON-LD.

**Props**

- `p`: Product
- `categoryName`: string

**Used in:** shop:/[category]/[sub]/[product]

```tsx
buildProductJsonLd(p, 'Kitchen > Jars')
```

## buildWebSiteJsonLd

`shared/src/lib/seo/jsonld.ts` · seo · updated 2026-11-15

WebSite JSON-LD with SearchAction.

**Used in:** StoreShell

```tsx
buildWebSiteJsonLd()
```

## JsonLd

`shared/src/lib/seo/JsonLdScript.tsx` · seo · updated 2026-11-12

Renders JSON-LD script tags safely (escapes <).

**Props**

- `data`: object|object[]

**Used in:** Breadcrumbs, ListingTemplate, StoreShell, sections/InfoSections, shop:/[category]/[sub]/[product], shop:/guides/[slug]

```tsx
<JsonLd data={buildFaqJsonLd(faqs)} />
```

