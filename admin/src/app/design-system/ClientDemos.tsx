"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/Misc";
import { toast } from "@/components/ui/Toast";
import { ImageManager } from "@/components/admin/ImageManager";
import { demoUploadAction } from "./demo-actions";
import { BlockEditor, type Block } from "@/components/admin/BlockEditor";
import { ImageField, ListEditor, ScheduleFields, TextField } from "@/components/admin/EditorKit";
import { ProductPicker } from "@/components/admin/ProductPicker";
import { SectionEditor } from "@/components/admin/SectionEditor";
import type { HomeSection } from "@/lib/content/schema";

/** Stateful demos that need client-side handlers (style guide only). */
export function QuantityStepperDemo() {
  const [q, setQ] = useState(2);
  return (
    <div className="flex items-center gap-4">
      <QuantityStepper value={q} onChange={setQ} />
      <QuantityStepper value={q} onChange={setQ} size="sm" />
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => toast({ title: "Added to cart", description: "Airtight Storage Jar Set" })}>
        Success toast
      </Button>
      <Button variant="outline" onClick={() => toast({ tone: "error", title: "Payment not completed" })}>
        Error toast
      </Button>
      <Button variant="outline" onClick={() => toast({ tone: "info", title: "Prices include all taxes" })}>
        Info toast
      </Button>
    </div>
  );
}

/** ImageManager needs local state for its controlled image list. */
export function ImageManagerDemo({ images }: { images: { src: string; alt: string }[] }) {
  const [list, setList] = useState(images);
  return <ImageManager images={list} onChange={setList} upload={demoUploadAction} slug="demo" defaultAlt="Demo product" />;
}

/* ---------------- CMS editor demos (local state only; nothing is saved) */

const demoProducts = [
  { slug: "airtight-jar-set-6pc", title: "Airtight Storage Jar Set, 6 pc (1.2 L)", image: "/placeholders/products/airtight-jar-set-6pc-1.svg" },
  { slug: "spin-mop-bucket-set", title: "Spin Mop with Bucket and 2 Microfibre Refills", image: "/placeholders/products/spin-mop-bucket-set-1.svg" },
  { slug: "ceramic-vase-set-3pc", title: "Ceramic Vase Set, 3 pc (Terracotta and Beige)", image: "/placeholders/products/ceramic-vase-set-3pc-1.svg" },
];

export function ListEditorDemo() {
  const [items, setItems] = useState([{ q: "Do you deliver to Goa?", a: "Yes, all over India." }]);
  return (
    <ListEditor
      items={items}
      onChange={setItems}
      addLabel="Add question"
      newItem={() => ({ q: "", a: "" })}
      itemLabel={(x, i) => `Q${i + 1}: ${x.q || "New"}`}
      renderItem={(x, update, i) => <TextField id={`demo-q-${i}`} label="Question" value={x.q} onChange={(q) => update({ q })} />}
    />
  );
}

export function ImageFieldDemo() {
  const [src, setSrc] = useState("/placeholders/banners/hero.svg");
  return <ImageField id="demo-image" label="Banner image" value={src} onChange={setSrc} upload={demoUploadAction} folder="banners" slug="demo" />;
}

export function ScheduleFieldsDemo() {
  const [v, setV] = useState({ startsAt: "", endsAt: "" });
  return <ScheduleFields idPrefix="demo-sched" value={v} onChange={setV} />;
}

export function TextFieldDemo() {
  const [t, setT] = useState("Everyday home needs, honestly priced");
  return <TextField id="demo-text" label="Title" value={t} onChange={setT} maxLength={90} required />;
}

export function ProductPickerDemo() {
  const [v, setV] = useState(["airtight-jar-set-6pc"]);
  return <ProductPicker label="Products" options={demoProducts} value={v} onChange={setV} max={6} />;
}

export function SectionEditorDemo({ section }: { section: HomeSection }) {
  const [s, setS] = useState(section);
  return <SectionEditor section={s} onChange={setS} categories={[{ slug: "kitchen", name: "Kitchen & Dining", parentSlug: null }]} products={demoProducts} upload={demoUploadAction} />;
}

export function BlockEditorDemo() {
  const [b, setB] = useState<Block[]>([{ type: "h2", text: "What to check before you buy" }, { type: "p", text: "Look for a silicone gasket." }]);
  return <BlockEditor idPrefix="demo-block" blocks={b} onChange={setB} allow={["p", "h2", "ul", "products"]} products={demoProducts} />;
}
