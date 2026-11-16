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
import { OrderStatusPoller } from "@/components/commerce/OrderStatusPoller";
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
import { demoCategories, demoPosts, demoProducts, demoReviews } from "./demo-data";
import { toCardProduct } from "@/lib/utils/product";
import { QuantityStepperDemo, ToastDemo } from "./ClientDemos";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { DEFAULT_HOME } from "@/lib/content/schema";
import { demoFormAction, demoUploadAction } from "./demo-actions";
import { ContentSaveForm } from "@/components/admin/EditorKit";
import { HomeEditor } from "@/components/admin/HomeEditor";
import { FaqEditor, PageEditor } from "@/components/admin/PageEditors";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PostForm } from "@/components/admin/PostForm";
import { ProductQuickActions } from "@/components/admin/ProductQuickActions";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { SettingsProvider } from "@/components/layout/SettingsProvider";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { HomeSections } from "@/components/sections/HomeSections";
import { DEFAULT_PAGES } from "@/lib/content/schema";
import { defaultStoreFaqs } from "@/lib/content/store-faqs";
import { BlockEditorDemo, ImageFieldDemo, ListEditorDemo, ProductPickerDemo, ScheduleFieldsDemo, SectionEditorDemo, TextFieldDemo } from "./ClientDemos";
import { demoVoidAction } from "./demo-actions";

import { AdminShell } from "@/components/admin/AdminShell";
import { CopyField, MarginText, OrderStatusBadge, OrderTimeline, StatCard } from "@/components/admin/AdminBits";
import { ImageManagerDemo } from "./ClientDemos";
import { LoginForm } from "@/components/admin/LoginForm";
import { DeleteProductCard } from "@/components/admin/DeleteProductCard";
import { MfaForm } from "@/components/admin/MfaForm";
import { TeamManager } from "@/components/admin/TeamManager";
import { CustomerAuthForm } from "@/components/commerce/CustomerAuthForm";
import { SetPasswordForm } from "@/components/commerce/SetPasswordForm";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { OrderActions } from "@/components/admin/OrderActions";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChipNav } from "@/components/ui/ChipNav";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable } from "@/components/ui/DataTable";
import { ORDER_STATUSES } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";

const tree = buildCategoryTree(demoCategories);
const DEMO_VALUE_PROPS = (() => {
  const s = DEFAULT_HOME.sections.find((x) => x.type === "valueProps");
  return s?.type === "valueProps" ? s.items : [];
})();
const products = demoProducts.map(toCardProduct);
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
  Table: <Table caption="Example specs" rows={demoProducts[0]!.specs.slice(0, 3)} className="max-w-modal" />,
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
  ProductGallery: <ProductGallery images={demoProducts[0]!.images} title={demoProducts[0]!.title} className="max-w-modal" />,
  ReviewList: <ReviewList reviews={demoReviews} rating={4.2} reviewCount={12} productTitle="Example product 1" />,
  CartLineItem: <ul className="max-w-modal"><CartLineItem line={sampleLine} /></ul>,
  OrderSummary: <OrderSummary subtotal={898} shipping={0} total={898} savings={900} showFreeShippingHint className="max-w-modal" />,
  FreeShippingProgress: <FreeShippingProgress subtotal={320} className="max-w-modal" />,
  OrderStatusPoller: <OrderStatusPoller maxAttempts={0} />,
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
<HeroBanner as="h2" priority={false} image={{ src: "/logo/logo-full.png", alt: "Example hero artwork" }} href="#" />
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
      <SaleBanner tone="sand" title="Sand" cta={{ label: "Shop", href: "#" }} image="/logo/mark.png" />
      <SaleBanner tone="soft" title="Soft" cta={{ label: "Shop", href: "#" }} />
      <SaleBanner tone="ink" title="Ink" eyebrow="Eyebrow" cta={{ label: "Shop", href: "#" }} />
    </div>
  ),
  ValueProps: <ValueProps items={DEMO_VALUE_PROPS} />,
  CustomerCare: <CustomerCare care={DEFAULT_SETTINGS.care} />,
  BrandStory: <BrandStory title="Brand story" paragraphs={["Paragraph one."]} blurbs={tree.slice(0, 2).map((c) => ({ title: c.name, text: c.blurb, href: `/${c.slug}` }))} />,
  FAQSection: <FAQSection title="FAQ demo" faqs={demoCategories[0]!.faqs} withJsonLd={false} spacing="sm" />,
  AnswerIntro: <AnswerIntro title="Answer intro" answer="One or two sentences that directly answer what this page is about." meta="Meta line" />,
  GuideCards: <GuideCards posts={demoPosts} />,
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
  TopBar: <TopBar settings={DEFAULT_SETTINGS} />,
  NavDropdown: <NavDropdown label="Dropdown"><p className="p-4">Panel content</p></NavDropdown>,
  MegaMenu: <div className="relative"><MegaMenu tree={tree} /></div>,
  BudgetMenu: <BudgetMenu />,
  MobileNav: <MobileNav tree={tree} social={DEFAULT_SETTINGS.social} />,
  Header: <div className="relative"><Header tree={tree} settings={DEFAULT_SETTINGS} /></div>,
  Footer: <Footer tree={tree} settings={DEFAULT_SETTINGS} />,
  DataTable: (
    <DataTable
      caption="Demo table"
      rows={demoProducts.slice(0, 3)}
      rowKey={(p) => p.id}
      columns={[
        { header: "Product", cell: (p) => p.title },
        { header: "Price", cell: (p) => formatINR(p.price), align: "right" },
        { header: "Stock", cell: (p) => p.stock, align: "right", hideOnMobile: true },
      ]}
    />
  ),
  CopyButton: <CopyButton value="9876543210" label="Phone" />,
  ChipNav: <ChipNav label="Demo chips" chips={[{ label: "All", href: "#all", active: true, count: 20 }, { label: "Paid", href: "#paid", count: 3 }, { label: "Shipped", href: "#shipped" }]} />,

  /* ---------------- admin */
  AdminShell: (
    <div className="overflow-hidden rounded-lg border border-border">
      <AdminShell email="partner@example.com" pendingCount={3} devMode>
        <p>Admin page content</p>
      </AdminShell>
    </div>
  ),
  LoginForm: <div className="max-w-narrow"><LoginForm action={demoFormAction} /></div>,
  OrderActions: (
    <OrderActions orderId="demo" next={["placed_on_meesho", "cancelled_refunded"]} defaults={{}} canRefund whatsappHref="https://wa.me/919876543210" action={demoFormAction} />
  ),
  ImageManager: <ImageManagerDemo images={demoProducts[0]!.images.slice(0, 2)} />,
  ProductForm: (
    <ProductForm
      values={{ ...demoProducts[0]!, meeshoUrl: demoProducts[0]!.meeshoUrl ?? "", meeshoPrice: demoProducts[0]!.meeshoPrice ?? 0, isActive: true, isNew: null, id: undefined }}
      categories={tree.map((c) => ({ slug: c.slug, name: c.name, children: c.children.map((x) => ({ slug: x.slug, name: x.name })) }))}
      action={demoFormAction}
      upload={demoUploadAction}
    />
  ),
  OrderStatusBadge: <div className={row}>{ORDER_STATUSES.map((st) => <OrderStatusBadge key={st} status={st} />)}</div>,
  StatCard: (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="To place on Meesho" value={3} tone="warning" hint="Paid orders waiting" />
      <StatCard label="In transit" value={7} />
      <StatCard label="Revenue (30 days)" value={formatINR(48210)} tone="success" />
    </div>
  ),
  MarginText: (
    <div className={row}>
      <MarginText price={449} cost={260} />
      <MarginText price={449} cost={380} />
      <MarginText price={449} cost={480} />
    </div>
  ),
  CopyField: (
    <div className="max-w-modal">
      <CopyField label="Name" value="Test Buyer" />
      <CopyField label="Address" value={["12 MG Road, Flat 4B", "Pune, Maharashtra - 411001"].join("\n")} multiline />
    </div>
  ),
  OrderTimeline: (
    <OrderTimeline
      events={[
        { status: "pending_payment", at: "2026-11-10T05:00:00Z", note: "Order created" },
        { status: "paid", at: "2026-11-10T05:02:00Z", note: "Payment captured" },
        { status: "placed_on_meesho", at: "2026-11-10T09:30:00Z", note: "by partner@example.com" },
      ]}
    />
  ),
  Analytics: <p className="text-text-muted">Loads GA4 and Microsoft Clarity when their IDs are set. Mounted in StoreShell only; renders nothing.</p>,
  PurchaseTracker: <p className="text-text-muted">Fires the GA4 purchase event once on the order success page; renders nothing.</p>,
  /* ---------------- CMS (admin) */
  ListEditor: <ListEditorDemo />,
  ImageField: <ImageFieldDemo />,
  ScheduleFields: <ScheduleFieldsDemo />,
  TextField: <TextFieldDemo />,
  ContentSaveForm: (
    <ContentSaveForm contentKey="faqs" value={{ items: defaultStoreFaqs }} action={demoFormAction}>
      <p className="text-text-muted">Editor fields go here; the bar below saves them.</p>
    </ContentSaveForm>
  ),
  ProductPicker: <ProductPickerDemo />,
  PasswordInput: <PasswordInput name="demo-password" aria-label="Password" defaultValue="hunter2-example" />,
  PageSkeleton: <PageSkeleton variant="listing" bare />,
  WhatsAppButton: (
    <div className="relative h-24 overflow-hidden rounded-md border border-border transform">
      <WhatsAppButton number={DEFAULT_SETTINGS.care.whatsapp} message="Hi" />
    </div>
  ),
  CustomerAuthForm: <CustomerAuthForm next="/checkout" signIn={demoFormAction} signUp={demoFormAction} forgot={demoFormAction} />,
  SetPasswordForm: <SetPasswordForm action={demoFormAction} />,
  DeleteProductCard: (
    <div className="flex flex-col gap-4">
      <DeleteProductCard id="demo" title="Demo product" orderCount={0} action={demoFormAction} />
      <DeleteProductCard id="demo-2" title="Ordered product" orderCount={3} action={demoFormAction} />
    </div>
  ),
  MfaForm: <MfaForm email="owner@example.com" verify={demoFormAction} resend={demoFormAction} />,
  TeamManager: (
    <TeamManager
      members={[
        { userId: "u1", email: "owner@example.com", role: "super_admin", permissions: [], isMe: true },
        { userId: "u2", email: "packer@example.com", role: "admin", permissions: ["orders"], isMe: false },
      ]}
      add={demoFormAction}
      update={demoFormAction}
      remove={demoFormAction}
    />
  ),
  SectionEditor: <SectionEditorDemo section={DEFAULT_HOME.sections.find((x) => x.type === "hero")!} />,
  HomeEditor: (
    <HomeEditor
      initial={DEFAULT_HOME}
      categories={demoCategories.map((c) => ({ slug: c.slug, name: c.name, parentSlug: c.parentSlug }))}
      products={demoProducts.slice(0, 6).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.src ?? "" }))}
      shopUrl="/"
      action={demoFormAction}
      upload={demoUploadAction}
    />
  ),
  BlockEditor: <BlockEditorDemo />,
  PageEditor: <PageEditor initial={DEFAULT_PAGES.returns} viewHref="/policies/returns" action={demoFormAction} />,
  FaqEditor: <FaqEditor initial={defaultStoreFaqs.slice(0, 2)} action={demoFormAction} />,
  CategoryForm: (
    <CategoryForm
      values={{ ...demoCategories[0]!, isActive: true, productCount: 4, childCount: 3 }}
      parents={demoCategories.filter((c) => !c.parentSlug).map((c) => ({ slug: c.slug, name: c.name }))}
      action={demoFormAction}
      deleteAction={demoFormAction}
      upload={demoUploadAction}
    />
  ),
  PostForm: (
    <PostForm
      values={{ ...demoPosts[0]!, originalSlug: demoPosts[0]!.slug, isPublished: true }}
      products={demoProducts.slice(0, 6).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.src ?? "" }))}
      action={demoFormAction}
      upload={demoUploadAction}
    />
  ),
  ProductQuickActions: <ProductQuickActions id="demo" title="Demo product" inStock isActive isNew={null} showsNew action={demoVoidAction} />,
  SettingsForm: <SettingsForm initial={DEFAULT_SETTINGS} action={demoFormAction} />,
  SettingsProvider: (
    <SettingsProvider settings={{ ...DEFAULT_SETTINGS, upiDiscountPercent: 7 }}>
      <PrepaidNotice variant="inline" />
    </SettingsProvider>
  ),
  HeroCarousel: (
    <HeroCarousel
      slides={[
        { id: "a", image: { src: "/logo/logo-full.png", alt: "Demo hero" }, href: "#" },
        { id: "b", image: { src: "/logo/mark.png", alt: "Demo banner" } },
      ]}
    />
  ),
  HomeSections: (
    <HomeSections
      sections={DEFAULT_HOME.sections.filter((x) => x.type === "budgetTiles" || x.type === "valueProps")}
      ctx={{ categories: demoCategories, posts: demoPosts, faqs: defaultStoreFaqs, settings: DEFAULT_SETTINGS }}
    />
  ),

  StoreShell: <p className="text-text-muted">Wraps every storefront page (TopBar, Header, Footer, CartDrawer, site JSON-LD). See <Link className="underline" href="/">the homepage</Link>.</p>,
};

