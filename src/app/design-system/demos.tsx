import Link from "next/link";
import type { ReactNode } from "react";
import { Search, ShoppingBag, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { CartButton } from "@/components/commerce/CartButton";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { CartLineItem } from "@/components/commerce/CartLineItem";
import { CartView } from "@/components/commerce/CartView";
import { CategoryListing } from "@/components/commerce/CategoryListing";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { FreeShippingProgress, OrderSummary } from "@/components/commerce/OrderSummary";
import { PincodeChecker } from "@/components/commerce/PincodeChecker";
import { PrepaidNotice } from "@/components/commerce/PrepaidNotice";
import { PriceBlock } from "@/components/commerce/PriceBlock";
import { ProductBuyBox, StickyBuyBar } from "@/components/commerce/ProductBuyBox";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { RatingStars } from "@/components/commerce/RatingStars";
import { ReviewList } from "@/components/commerce/ReviewList";
import { SearchBox } from "@/components/commerce/SearchBox";
import { TrackOrderForm } from "@/components/commerce/TrackOrderForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, Section } from "@/components/layout/Container";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Logo } from "@/components/layout/Logo";
import { BudgetMenu, buildCategoryTree, MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { TopBar } from "@/components/layout/TopBar";
import { CategoryTiles } from "@/components/sections/CategoryTiles";
import { ContentPage } from "@/components/sections/ContentPage";
import { GuideCards } from "@/components/sections/GuideCards";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { AnswerIntro, BrandStory, CustomerCare, FAQSection, ValueProps } from "@/components/sections/InfoSections";
import { NotFoundContent } from "@/components/sections/NotFoundContent";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { SaleBanner } from "@/components/sections/SaleBanner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, RadioGroup } from "@/components/ui/Checkbox";
import { Accordion, Tabs } from "@/components/ui/Disclosure";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";
import { Icon, SocialIcon } from "@/components/ui/Icon";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Pagination, Separator, Skeleton, Table } from "@/components/ui/Misc";
import { Drawer, Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { policies } from "@/lib/content/pages";
import { seedCategories } from "@/lib/seed/categories";
import { seedPosts } from "@/lib/seed/posts";
import { seedProducts } from "@/lib/seed/products";
import { seedReviews } from "@/lib/seed/reviews";
import { toCardProduct } from "@/lib/utils/product";
import { QuantityStepperDemo, ToastDemo } from "./ClientDemos";

const tree = buildCategoryTree(seedCategories);
const products = seedProducts.map(toCardProduct);
const product = products[0]!;
const soldOut = products.find((p) => !p.inStock) ?? product;
const row = "flex flex-wrap items-center gap-3";
const sampleLine = { productId: product.id, slug: product.slug, path: product.path, title: product.title, image: product.image.src, price: product.price, mrp: product.mrp, quantity: 2, maxQty: 10 };

/**
 * Live examples for every registered UI/commerce/section/layout entry.
 * `pnpm check:registry` fails if a registry entry has no key here.
 */
export const demos: Record<string, ReactNode> = {
  /* ---------------- ui */
  Button: (
    <div className="flex flex-col gap-4">
      <div className={row}>
        <Button>Add to Cart</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="danger">Danger</Button>
        <span className="rounded-md bg-ink p-2"><Button variant="inverse">Inverse</Button></span>
      </div>
      <div className={row}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg" icon={<ShoppingBag className="h-4 w-4" />}>Large with icon</Button>
        <Button size="icon" variant="outline" aria-label="Search"><Search className="h-5 w-5" /></Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" color="success" width={64}>Token override</Button>
        <Button href="/bestsellers" variant="outline" icon={<Truck className="h-4 w-4" />} iconPosition="right">As link</Button>
      </div>
      <Button fullWidth variant="secondary">Full width</Button>
    </div>
  ),
  Input: (
    <div className="grid max-w-modal gap-3">
      <Input placeholder="Medium (default)" aria-label="Demo input" />
      <Input size="sm" placeholder="Small" aria-label="Demo small" />
      <Input size="lg" placeholder="Large" aria-label="Demo large" />
      <Input leadingIcon={<Search className="h-4 w-4" />} placeholder="With icon" aria-label="Demo icon" />
      <Input invalid defaultValue="12345" aria-label="Demo invalid" />
    </div>
  ),
  Textarea: <Textarea aria-label="Demo textarea" placeholder="Write a message" className="max-w-modal" />,
  Select: <Select aria-label="Demo select" className="max-w-80" options={[{ value: "a", label: "Featured" }, { value: "b", label: "Price: low to high" }]} />,
  FormField: (
    <div className="grid max-w-modal gap-4">
      <FormField id="ff-1" label="PIN code" hint="6 digits" required><Input id="ff-1" /></FormField>
      <FormField id="ff-2" label="Mobile number" error="Enter a valid 10-digit mobile number" required><Input id="ff-2" invalid /></FormField>
    </div>
  ),
  Checkbox: (
    <div>
      <Checkbox id="cb-1" label="Steel" />
      <Checkbox id="cb-2" label="Plastic" checked />
      <Checkbox id="cb-3" label="Disabled" disabled />
    </div>
  ),
  RadioGroup: <RadioGroup name="demo-radio" label="Rating" options={[{ value: "4", label: "4★ & above" }, { value: "3", label: "3★ & above" }]} />,
  Badge: (
    <div className={row}>
      {(["sale", "success", "warning", "error", "neutral", "outline", "dark"] as const).map((v) => (
        <Badge key={v} variant={v}>{v}</Badge>
      ))}
      <Badge size="md" variant="sale">50% off</Badge>
    </div>
  ),
  Card: (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>Flat card</Card>
      <Card elevation="raised">Raised card</Card>
      <Card elevation="outline" interactive background="secondary">Interactive, secondary background</Card>
    </div>
  ),
  Heading: (
    <div className="flex flex-col gap-2">
      {(["display", "xl", "lg", "md", "sm"] as const).map((s) => (
        <Heading key={s} as="p" size={s}>Heading {s}</Heading>
      ))}
    </div>
  ),
  SectionHeader: <SectionHeader as="h3" eyebrow="Limited stock" title="Flash sale" subtitle="Deep discounts while stock lasts." viewAllHref="/flash-sale" />,
  Icon: (
    <div className={row}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <Icon key={s} icon={Truck} size={s} />)}
    </div>
  ),
  SocialIcon: (
    <div className={row}>
      {(["instagram", "facebook", "youtube", "whatsapp"] as const).map((b) => <SocialIcon key={b} brand={b} size="lg" />)}
    </div>
  ),
  Modal: (
    <Modal title="Example modal" description="Dialogs trap focus and close on Escape." trigger={<Button variant="outline">Open modal</Button>}>
      <p>Modal content.</p>
    </Modal>
  ),
  Drawer: (
    <div className={row}>
      <Drawer title="Right drawer" trigger={<Button variant="outline">Right drawer</Button>}><p>Drawer content.</p></Drawer>
      <Drawer side="left" title="Left drawer" trigger={<Button variant="outline">Left drawer</Button>}><p>Drawer content.</p></Drawer>
      <Drawer side="bottom" title="Bottom sheet" trigger={<Button variant="outline">Bottom sheet</Button>}><p>Sheet content.</p></Drawer>
    </div>
  ),
  Accordion: (
    <div className="grid gap-6 md:grid-cols-2">
      <Accordion items={[{ id: "a", title: "Plain item", content: "Answer text." }, { id: "b", title: "Second item", content: "More text." }]} headingLevel="h4" />
      <Accordion variant="boxed" type="single" items={[{ id: "c", title: "Boxed item", content: "Answer text." }, { id: "d", title: "Second item", content: "More text." }]} headingLevel="h4" />
    </div>
  ),
  Tabs: <Tabs items={[{ value: "a", label: "Details", content: "Details content" }, { value: "b", label: "Care", content: "Care content" }]} />,
  Toaster: <p className="text-text-muted">Mounted once in the root layout; see toast below.</p>,
  toast: <ToastDemo />,
  Skeleton: (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-32" />
    </div>
  ),
  Separator: (
    <div className="flex h-12 items-center gap-4">
      <span>A</span><Separator orientation="vertical" /><span>B</span>
      <Separator className="flex-1" />
    </div>
  ),
  Pagination: <Pagination page={4} totalPages={9} hrefFor={(n) => `/design-system?page=${n}`} />,
  Table: <Table caption="Example specs" rows={seedProducts[0]!.specs.slice(0, 3)} className="max-w-modal" />,
  QuantityStepper: <QuantityStepperDemo />,

  /* ---------------- commerce */
  RatingStars: (
    <div className="flex flex-col gap-2">
      <RatingStars value={4.4} count={318} />
      <RatingStars value={3.6} size="md" showValue />
      <RatingStars value={5} size="lg" />
    </div>
  ),
  PriceBlock: (
    <div className="flex flex-col gap-3">
      <PriceBlock price={449} mrp={899} size="sm" />
      <PriceBlock price={449} mrp={899} />
      <PriceBlock price={449} mrp={899} size="lg" showTaxNote />
    </div>
  ),
  AddToCartButton: (
    <div className={row}>
      <AddToCartButton product={product} />
      <AddToCartButton product={product} mode="buy" />
      <AddToCartButton product={soldOut} />
    </div>
  ),
  ProductCard: (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <li><ProductCard product={product} /></li>
      <li><ProductCard product={soldOut} /></li>
      <li><ProductCard product={products[3]!} variant="plain" /></li>
    </ul>
  ),
  PrepaidNotice: (
    <div className="flex flex-col gap-4">
      <PrepaidNotice />
      <PrepaidNotice variant="inline" />
    </div>
  ),
  PincodeChecker: <PincodeChecker className="max-w-modal" />,
  ProductGallery: <ProductGallery images={seedProducts[0]!.images} title={seedProducts[0]!.title} className="max-w-modal" />,
  ReviewList: <ReviewList reviews={seedReviews.filter((r) => r.productId === "prd_001")} rating={4.4} reviewCount={318} productTitle="Jar set" />,
  CartLineItem: <ul className="max-w-modal"><CartLineItem line={sampleLine} /></ul>,
  OrderSummary: <OrderSummary subtotal={898} shipping={0} total={898} savings={900} showFreeShippingHint className="max-w-modal" />,
  FreeShippingProgress: <FreeShippingProgress subtotal={320} className="max-w-modal" />,
  CartDrawer: (
    <div className={row}>
      <CartDrawer />
      <p className="text-text-muted">Open with the cart button below (add an item first via AddToCartButton).</p>
    </div>
  ),
  CartButton: <CartButton />,
  CartView: <CartView />,
  ProductBuyBox: <ProductBuyBox product={product} className="max-w-modal" />,
  StickyBuyBar: <p className="text-text-muted">Mobile only: scroll past the buy buttons on a product page to see it. Rendered by ProductBuyBox.<span hidden><StickyBuyBar product={product} quantity={1} visible={false} /></span></p>,
  SearchBox: (
    <div className="grid max-w-modal gap-3">
      <SearchBox id="ds-search-sm" size="sm" />
      <SearchBox id="ds-search-md" />
      <SearchBox id="ds-search-lg" size="lg" />
    </div>
  ),
  CategoryListing: <CategoryListing products={products.slice(0, 6)} />,
  CheckoutForm: <CheckoutForm />,
  TrackOrderForm: <TrackOrderForm />,

  /* ---------------- sections */
  HeroBanner: (
    <HeroBanner
      as="h2"
      eyebrow="Eyebrow"
      title="Hero title"
      text="Supporting copy for the hero banner."
      image={{ src: "/placeholders/banners/hero.svg", alt: "Example hero art" }}
      primaryCta={{ label: "Primary", href: "#" }}
      secondaryCta={{ label: "Secondary", href: "#" }}
      highlights={["Chip one", "Chip two"]}
    />
  ),
  ProductGrid: <ProductGrid title="Product grid demo" products={products.slice(0, 4)} viewAllHref="/bestsellers" spacing="sm" />,
  CategoryTiles: (
    <>
      <CategoryTiles title="Circle tiles" items={tree.map((c) => ({ label: c.name, href: `/${c.slug}`, image: c.image }))} spacing="sm" />
      <CategoryTiles title="Price tiles" variant="price" spacing="sm" items={[{ label: "₹299", href: "#a" }, { label: "₹599", href: "#b" }, { label: "₹1,999+", caption: "Premium", href: "#c" }]} />
    </>
  ),
  SaleBanner: (
    <div className="grid gap-4 md:grid-cols-3">
      <SaleBanner tone="sand" title="Sand" cta={{ label: "Shop", href: "#" }} image="/placeholders/banners/kitchen.svg" />
      <SaleBanner tone="soft" title="Soft" cta={{ label: "Shop", href: "#" }} />
      <SaleBanner tone="ink" title="Ink" eyebrow="Eyebrow" cta={{ label: "Shop", href: "#" }} />
    </div>
  ),
  ValueProps: <ValueProps />,
  CustomerCare: <CustomerCare />,
  BrandStory: <BrandStory title="Brand story" paragraphs={["Paragraph one."]} blurbs={tree.slice(0, 2).map((c) => ({ title: c.name, text: c.blurb, href: `/${c.slug}` }))} />,
  FAQSection: <FAQSection title="FAQ demo" faqs={seedCategories[0]!.faqs} withJsonLd={false} spacing="sm" />,
  AnswerIntro: <AnswerIntro title="Answer intro" answer="One or two sentences that directly answer what this page is about." meta="Meta line" />,
  GuideCards: <GuideCards posts={seedPosts} />,
  ListingTemplate: <p className="text-text-muted">Used by category, subcategory, budget, flash-sale, bestsellers and search pages; e.g. <Link className="underline" href="/kitchen">/kitchen</Link>.</p>,
  ContentPage: <ContentPage page={policies.shipping} crumbs={[{ label: "Demo" }]} />,
  NotFoundContent: <NotFoundContent />,

  /* ---------------- layout */
  Container: <Container className="rounded-md bg-secondary py-4">Container (max-w-container + gutters)</Container>,
  Section: (
    <div className="flex flex-col gap-2">
      {(["background", "surface", "secondary", "soft", "ink"] as const).map((b) => (
        <Section key={b} background={b} spacing="sm">background=&quot;{b}&quot;</Section>
      ))}
    </div>
  ),
  Breadcrumbs: <Breadcrumbs items={[{ label: "Kitchen & Dining", href: "/kitchen" }, { label: "Storage Containers" }]} withJsonLd={false} />,
  Logo: (
    <div className={row}>
      <Logo />
      <span className="rounded-md bg-ink p-2"><Logo inverse /></span>
    </div>
  ),
  TopBar: <TopBar />,
  NavDropdown: <NavDropdown label="Dropdown"><p className="p-4">Panel content</p></NavDropdown>,
  MegaMenu: <div className="relative"><MegaMenu tree={tree} /></div>,
  BudgetMenu: <BudgetMenu />,
  MobileNav: <MobileNav tree={tree} />,
  Header: <div className="relative"><Header tree={tree} /></div>,
  Footer: <Footer tree={tree} />,
  StoreShell: <p className="text-text-muted">Wraps every storefront page (TopBar, Header, Footer, CartDrawer, site JSON-LD). See <Link className="underline" href="/">the homepage</Link>.</p>,
};

