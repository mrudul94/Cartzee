"use client";

import { useActionState, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import type { Faq, PostBlock } from "@/lib/types";
import { slugify } from "@/lib/utils/format";
import { BlockEditor } from "./BlockEditor";
import { ImageField, ListEditor, TextField } from "./EditorKit";
import type { ProductOption } from "./ProductPicker";

export type PostFormValues = {
  originalSlug?: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  author: string;
  isPublished: boolean;
  body: PostBlock[];
  faqs: Faq[];
  viewHref?: string;
};

/** Write or edit a buying guide: headings, paragraphs and product picks, cover image, FAQs, publish toggle. */
export function PostForm({
  values: v,
  products,
  action,
  deleteAction,
  upload,
  notice,
}: {
  values: PostFormValues;
  products: ProductOption[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  deleteAction?: (fd: FormData) => Promise<void>;
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(action, notice ? { ok: true, message: notice } : {});
  const e = state.errors ?? {};
  const [title, setTitle] = useState(v.title);
  const [cover, setCover] = useState(v.cover);
  const [body, setBody] = useState<PostBlock[]>(v.body);
  const [faqs, setFaqs] = useState<Faq[]>(v.faqs);
  const f = (n: string) => ({ id: `post-${n}`, name: n, invalid: Boolean(e[n]) });

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-6" noValidate>
        {v.originalSlug && <input type="hidden" name="originalSlug" value={v.originalSlug} />}
        <input type="hidden" name="cover" value={cover} />
        <input type="hidden" name="body" value={JSON.stringify(body)} />
        <input type="hidden" name="faqs" value={JSON.stringify(faqs.filter((x) => x.q.trim() || x.a.trim()))} />
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-md bg-success-soft p-4 text-success" : "rounded-md bg-error-soft p-4 text-error"}>
            {state.message}
          </p>
        )}

        <Card as="fieldset" padding="md" className="flex flex-col gap-4">
          <legend className="sr-only">Basics</legend>
          <FormField id="post-title" label="Title" hint="e.g. “Best storage containers for Indian kitchens”" error={e.title} required>
            <Input {...f("title")} value={title} onChange={(ev) => setTitle(ev.target.value)} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="post-slug" label="URL slug" error={e.slug} hint={`Empty = “${slugify(title) || "…"}”`}>
              <Input {...f("slug")} defaultValue={v.slug} placeholder={slugify(title)} />
            </FormField>
            <FormField id="post-author" label="Author" error={e.author}>
              <Input {...f("author")} defaultValue={v.author} />
            </FormField>
          </div>
          <FormField id="post-excerpt" label="Summary" hint="Shown on guide cards and in search results" error={e.excerpt} required>
            <Textarea {...f("excerpt")} rows={2} defaultValue={v.excerpt} />
          </FormField>
          <ImageField id="post-cover-src" label="Cover image" value={cover} onChange={setCover} upload={upload} folder="guides" slug={v.slug || slugify(title)} error={e.cover} />
          <Checkbox id="post-isPublished" name="isPublished" defaultChecked={v.isPublished} label="Published (visible in the shop)" />
        </Card>

        <Card padding="md">
          <h2 className="mb-1 font-heading text-xl font-semibold">Guide content</h2>
          <p className="mb-4 text-sm text-text-muted">Start with a 1–2 sentence direct answer, then headings and paragraphs. Add product picks to link to products.</p>
          <BlockEditor idPrefix="post-block" blocks={body} onChange={setBody} allow={["p", "h2", "products"]} products={products} />
          {e.body && <p className="mt-2 text-sm text-error">{e.body}</p>}
        </Card>

        <Card padding="md" className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">FAQs</h2>
          <ListEditor
            items={faqs}
            onChange={setFaqs}
            max={10}
            addLabel="Add question"
            newItem={() => ({ q: "", a: "" })}
            itemLabel={(x, i) => `Q${i + 1}: ${x.q || "New question"}`}
            renderItem={(x, update, i) => (
              <>
                <TextField id={`post-faq-q-${i}`} label="Question" value={x.q} onChange={(q) => update({ q })} maxLength={200} />
                <TextField id={`post-faq-a-${i}`} label="Answer" value={x.a} onChange={(a) => update({ a })} multiline maxLength={1000} />
              </>
            )}
          />
        </Card>

        <div className="sticky bottom-0 z-sticky -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 md:mx-0 md:rounded-lg md:border">
          <Button type="submit" variant="secondary" size="lg" loading={pending}>
            {v.originalSlug ? "Save guide" : "Create guide"}
          </Button>
          {v.viewHref && (
            <Button href={v.viewHref} target="_blank" variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right">
              View in shop
            </Button>
          )}
        </div>
      </form>

      {v.originalSlug && deleteAction && (
        <form
          action={deleteAction}
          onSubmit={(ev) => {
            if (!window.confirm(`Delete the guide “${v.title}”? This can't be undone.`)) ev.preventDefault();
          }}
        >
          <input type="hidden" name="slug" value={v.originalSlug} />
          <Button type="submit" variant="ghost" size="sm" className="text-error" icon={<Trash2 aria-hidden className="h-4 w-4" />}>
            Delete guide
          </Button>
        </form>
      )}
    </div>
  );
}
