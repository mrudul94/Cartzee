"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ActionState } from "@/lib/admin/forms";
import type { PageContent } from "@/lib/content/schema";
import type { Faq } from "@/lib/types";
import { BlockEditor, cleanBlocks } from "./BlockEditor";
import { ContentSaveForm, ListEditor, TextField } from "./EditorKit";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;
const today = () => new Date().toISOString().slice(0, 10);

/** Edit an info page (About, Shipping, Returns, Privacy, Terms). "Last updated" is set to today on save. */
export function PageEditor({ initial, viewHref, action }: { initial: PageContent; viewHref: string; action: Action }) {
  const [page, setPage] = useState(initial);
  const set = (patch: Partial<PageContent>) => setPage((p) => ({ ...p, ...patch }));
  return (
    <ContentSaveForm
      contentKey={`page:${initial.slug}`}
      value={{ ...page, blocks: cleanBlocks(page.blocks), updated: today() }}
      action={action}
      extra={
        <Button href={viewHref} target="_blank" variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right">
          View page
        </Button>
      }
    >
      <Card padding="md" className="flex flex-col gap-4">
        <TextField id="page-title" label="Page title (H1)" value={page.title} onChange={(title) => set({ title })} maxLength={80} required />
        <TextField
          id="page-answer"
          label="Short answer at the top"
          hint="1–2 sentences that directly answer what this page is about (used by Google and AI assistants)"
          value={page.answer}
          onChange={(answer) => set({ answer })}
          multiline
          maxLength={400}
          required
        />
        <TextField id="page-desc" label="Meta description (search results)" value={page.description} onChange={(description) => set({ description })} maxLength={170} required />
      </Card>
      <Card padding="md">
        <h2 className="mb-4 font-heading text-xl font-semibold">Page content</h2>
        <BlockEditor idPrefix="page-block" blocks={page.blocks} onChange={(blocks) => set({ blocks })} allow={["p", "h2", "ul"]} />
      </Card>
    </ContentSaveForm>
  );
}

/** Edit the store-wide FAQs (homepage FAQ section, /faq page, llms.txt, FAQ structured data). */
export function FaqEditor({ initial, action }: { initial: Faq[]; action: Action }) {
  const [items, setItems] = useState(initial);
  return (
    <ContentSaveForm contentKey="faqs" value={{ items }} action={action}>
      <Card padding="md">
        <ListEditor
          items={items}
          onChange={setItems}
          min={1}
          max={30}
          addLabel="Add question"
          newItem={() => ({ q: "", a: "" })}
          itemLabel={(f, i) => `Q${i + 1}: ${f.q || "New question"}`}
          renderItem={(f, update, i) => (
            <>
              <TextField id={`faq-q-${i}`} label="Question" value={f.q} onChange={(q) => update({ q })} maxLength={200} required />
              <TextField id={`faq-a-${i}`} label="Answer" value={f.a} onChange={(a) => update({ a })} multiline maxLength={1000} required />
            </>
          )}
        />
      </Card>
    </ContentSaveForm>
  );
}
