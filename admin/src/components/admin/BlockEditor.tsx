"use client";

import { Heading2, List, Pilcrow, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListEditor, TextField } from "./EditorKit";
import { ProductPicker, type ProductOption } from "./ProductPicker";

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "products"; slugs: string[] };
export type BlockType = Block["type"];

const LABEL: Record<BlockType, string> = { h2: "Heading", p: "Paragraph", ul: "Bullet list", products: "Product picks" };
const ICON = { h2: Heading2, p: Pilcrow, ul: List, products: ShoppingBag };
const blank = (t: BlockType): Block =>
  t === "ul" ? { type: "ul", items: [""] } : t === "products" ? { type: "products", slugs: [] } : { type: t, text: "" };

export type BlockEditorProps<B extends Block> = {
  idPrefix: string;
  blocks: B[];
  onChange: (blocks: B[]) => void;
  /** Block types offered by the "add" buttons. */
  allow: BlockType[];
  products?: ProductOption[];
};

/**
 * Simple structured text editor for pages and guides: headings, paragraphs, bullet lists and
 * (guides only) product picks. Plain text only — no HTML — so content can never inject scripts.
 */
export function BlockEditor<B extends Block>({ idPrefix, blocks, onChange, allow, products = [] }: BlockEditorProps<B>) {
  return (
    <div className="flex flex-col gap-3">
      <ListEditor<Block>
        items={blocks}
        onChange={(b) => onChange(b as B[])}
        min={1}
        max={80}
        addLabel="Add paragraph"
        newItem={() => blank("p")}
        itemLabel={(b, i) => `${i + 1}. ${LABEL[b.type]}${"text" in b && b.text ? `: ${b.text.slice(0, 40)}` : ""}`}
        renderItem={(b, update, i) => {
          const id = `${idPrefix}-${i}`;
          if (b.type === "h2") return <TextField id={id} label="Heading" value={b.text} onChange={(text) => update({ text } as Partial<Block>)} maxLength={120} required />;
          if (b.type === "p") return <TextField id={id} label="Paragraph" value={b.text} onChange={(text) => update({ text } as Partial<Block>)} multiline rows={4} maxLength={3000} required />;
          if (b.type === "ul")
            return (
              <TextField
                id={id}
                label="Bullet points"
                hint="One point per line"
                value={b.items.join("\n")}
                onChange={(v) => update({ items: v.split("\n") } as Partial<Block>)}
                multiline
                rows={4}
              />
            );
          return <ProductPicker label="Products to show" options={products} value={b.slugs} onChange={(slugs) => update({ slugs } as Partial<Block>)} max={6} />;
        }}
      />
      <div className="flex flex-wrap gap-2">
        {allow
          .filter((t) => t !== "p")
          .map((t) => {
            const Glyph = ICON[t];
            return (
              <Button key={t} size="sm" variant="soft" icon={<Glyph aria-hidden className="h-4 w-4" />} onClick={() => onChange([...blocks, blank(t) as B])}>
                Add {LABEL[t].toLowerCase()}
              </Button>
            );
          })}
      </div>
    </div>
  );
}

/** Removes empty bullet lines before saving. */
export function cleanBlocks<B extends Block>(blocks: B[]): B[] {
  return blocks.map((b) => (b.type === "ul" ? ({ ...b, items: b.items.map((x) => x.trim()).filter(Boolean) } as B) : b));
}
