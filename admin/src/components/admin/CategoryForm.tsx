"use client";

import { useActionState, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import type { Faq } from "@/lib/types";
import { slugify } from "@/lib/utils/format";
import { ImageField, ListEditor, TextField } from "./EditorKit";

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  intro: string;
  blurb: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  hasSizes?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  faqs: Faq[];
  productCount?: number;
  childCount?: number;
  viewHref?: string;
};

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/** Add / edit a category or subcategory: name, URL, parent, intro answer, image, order, visibility, SEO, FAQs. */
export function CategoryForm({
  values: v,
  parents,
  action,
  deleteAction,
  upload,
  notice,
}: {
  values: CategoryFormValues;
  parents: { slug: string; name: string }[];
  action: Action;
  deleteAction?: Action;
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(action, notice ? { ok: true, message: notice } : {});
  const noop: Action = async () => ({});
  const [delState, delAction, deleting] = useActionState<ActionState, FormData>(deleteAction ?? noop, {});
  const e = state.errors ?? {};
  const [name, setName] = useState(v.name);
  const [image, setImage] = useState(v.image);
  const [faqs, setFaqs] = useState<Faq[]>(v.faqs);
  const f = (n: string) => ({ id: `cat-${n}`, name: n, invalid: Boolean(e[n]) });

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-6" noValidate>
        {v.id && <input type="hidden" name="id" value={v.id} />}
        <input type="hidden" name="image" value={image} />
        <input type="hidden" name="faqs" value={JSON.stringify(faqs.filter((x) => x.q.trim() || x.a.trim()))} />
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-md bg-success-soft p-4 text-success" : "rounded-md bg-error-soft p-4 text-error"}>
            {state.message}
          </p>
        )}

        <Card as="fieldset" padding="md" className="flex flex-col gap-4">
          <legend className="sr-only">Basics</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="cat-name" label="Name" error={e.name} required>
              <Input {...f("name")} value={name} onChange={(ev) => setName(ev.target.value)} />
            </FormField>
            <FormField id="cat-slug" label="URL slug" error={e.slug} hint={`Empty = “${slugify(name) || "…"}”. Changing it changes the page address.`}>
              <Input {...f("slug")} defaultValue={v.slug} placeholder={slugify(name)} />
            </FormField>
            <FormField id="cat-parentSlug" label="Parent" error={e.parentSlug} hint={v.childCount ? "Has subcategories, so it must stay a main category" : undefined}>
              <Select
                {...f("parentSlug")}
                defaultValue={v.parentSlug ?? ""}
                disabled={Boolean(v.childCount)}
                options={[{ value: "", label: "None (main category)" }, ...parents.filter((p) => p.slug !== v.slug).map((p) => ({ value: p.slug, label: p.name }))]}
              />
            </FormField>
            <FormField id="cat-sortOrder" label="Order" hint="Lower numbers show first" error={e.sortOrder}>
              <Input {...f("sortOrder")} inputMode="numeric" defaultValue={v.sortOrder} />
            </FormField>
          </div>
          <FormField id="cat-intro" label="Intro answer (top of the category page)" hint="1–2 sentences: what's in this category and who it's for" error={e.intro} required>
            <Textarea {...f("intro")} rows={3} defaultValue={v.intro} />
          </FormField>
          <FormField id="cat-blurb" label="Short blurb (homepage story cards)" hint="Optional; the intro is used if empty" error={e.blurb}>
            <Input {...f("blurb")} defaultValue={v.blurb} />
          </FormField>
          <ImageField id="cat-image-src" label="Image" value={image} onChange={setImage} upload={upload} folder="categories" slug={v.slug || slugify(name)} error={e.image} optional />
          <Checkbox id="cat-isActive" name="isActive" defaultChecked={v.isActive} label="Visible in the shop" />
          <Checkbox
            id="cat-hasSizes"
            name="hasSizes"
            defaultChecked={v.hasSizes}
            label="Clothing: products come in sizes (Admin → Products then asks for sizes, and shoppers pick one)"
          />
        </Card>

        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">FAQs (bottom of the category page)</h2>
          <ListEditor
            items={faqs}
            onChange={setFaqs}
            max={10}
            addLabel="Add question"
            newItem={() => ({ q: "", a: "" })}
            itemLabel={(x, i) => `Q${i + 1}: ${x.q || "New question"}`}
            renderItem={(x, update, i) => (
              <>
                <TextField id={`cat-faq-q-${i}`} label="Question" value={x.q} onChange={(q) => update({ q })} maxLength={200} />
                <TextField id={`cat-faq-a-${i}`} label="Answer" value={x.a} onChange={(a) => update({ a })} multiline maxLength={1000} />
              </>
            )}
          />
          {e.faqs && <p className="text-sm text-error">{e.faqs}</p>}
        </Card>

        <Card as="fieldset" padding="md" className="flex flex-col gap-4">
          <legend className="sr-only">Search appearance</legend>
          <h2 className="font-heading text-xl font-semibold">Search appearance (optional)</h2>
          <FormField id="cat-seoTitle" label="SEO title" error={e.seoTitle}>
            <Input {...f("seoTitle")} defaultValue={v.seoTitle} />
          </FormField>
          <FormField id="cat-seoDescription" label="Meta description" error={e.seoDescription}>
            <Textarea {...f("seoDescription")} rows={2} defaultValue={v.seoDescription} />
          </FormField>
        </Card>

        <div className="sticky bottom-0 z-sticky -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 md:mx-0 md:rounded-lg md:border">
          <Button type="submit" variant="secondary" size="lg" loading={pending}>
            {v.id ? "Save changes" : "Create category"}
          </Button>
          {v.viewHref && (
            <Button href={v.viewHref} target="_blank" variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right">
              View in shop
            </Button>
          )}
        </div>
      </form>

      {v.id && deleteAction && (
        <Card padding="md" className="flex flex-col gap-3 border-error">
          <h2 className="font-heading text-lg font-semibold">Delete category</h2>
          <p className="text-sm text-text-muted">
            {v.productCount ? `${v.productCount} product(s) use this category, so it can't be deleted. Untick “Visible in the shop” to hide it instead.` : "This can't be undone."}
          </p>
          <form
            action={delAction}
            onSubmit={(ev) => {
              if (!window.confirm(`Delete “${v.name}”?`)) ev.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={v.id} />
            <Button type="submit" variant="danger" size="sm" loading={deleting} disabled={Boolean(v.productCount || v.childCount)} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
              Delete
            </Button>
          </form>
          {delState.message && (
            <p role="alert" className="text-sm text-error">
              {delState.message}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
