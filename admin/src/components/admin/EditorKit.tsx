"use client";

import { keepFormValues } from "@/hooks/useKeepFormValues";
import Image from "next/image";
import { useActionState, useRef, useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import { ImageCropper } from "./ImageCropper";
import { cn } from "@/lib/utils/cn";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-surface text-text hover:bg-background disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-focus";

/* ==================================================================== ListEditor */

export type ListEditorProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  /** Renders the editable fields for one item; call `update` with a partial change. */
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  newItem: () => T;
  itemLabel: (item: T, index: number) => string;
  addLabel: string;
  min?: number;
  max?: number;
  className?: string;
};

/** Reorderable list of editable items (slides, banners, FAQs, paragraphs, blocks…) with add / move / remove. */
export function ListEditor<T>({ items, onChange, renderItem, newItem, itemLabel, addLabel, min = 0, max = 50, className }: ListEditorProps<T>) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const [it] = next.splice(i, 1);
    next.splice(i + d, 0, it!);
    onChange(next);
  };
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => (
        <fieldset key={i} className="rounded-md border border-border bg-background p-3">
          <legend className="sr-only">{itemLabel(item, i)}</legend>
          <div className="mb-3 flex items-center gap-2">
            <p className="flex-1 truncate text-sm font-semibold">{itemLabel(item, i)}</p>
            <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${itemLabel(item, i)} up`}>
              <ArrowUp aria-hidden className="h-4 w-4" />
            </button>
            <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${itemLabel(item, i)} down`}>
              <ArrowDown aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(iconBtn, "text-error")}
              onClick={() => onChange(items.filter((_, n) => n !== i))}
              disabled={items.length <= min}
              aria-label={`Remove ${itemLabel(item, i)}`}
            >
              <Trash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">{renderItem(item, (patch) => onChange(items.map((x, n) => (n === i ? { ...x, ...patch } : x))), i)}</div>
        </fieldset>
      ))}
      {items.length < max && (
        <Button variant="soft" size="sm" className="self-start" icon={<Plus aria-hidden className="h-4 w-4" />} onClick={() => onChange([...items, newItem()])}>
          {addLabel}
        </Button>
      )}
    </div>
  );
}

/* ==================================================================== ImageField */

export type ImageFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (src: string) => void;
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
  folder: "products" | "banners" | "categories" | "guides";
  /** Used to group uploads in storage (e.g. section or category slug). */
  slug: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Starting crop shape; defaults by folder (categories/guides 16:9, banners 7:3 hero, products square). */
  cropAspect?: number | null;
};

const FOLDER_ASPECT: Record<ImageFieldProps["folder"], number> = { products: 1, categories: 16 / 9, banners: 7 / 3, guides: 16 / 9 };

/** Single image: preview, crop then upload (Supabase Storage), or paste a site path / https URL. */
export function ImageField({ id, label, value, onChange, upload, folder, slug, hint, error, optional, cropAspect }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const reset = () => {
    setPicked(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const onFile = (file?: File) => {
    if (!file) return;
    setPicked(null);
    setUploadError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("slug", slug);
      fd.set("folder", folder);
      const res = await upload(fd);
      if (res.error) setUploadError(res.error);
      else if (res.src) onChange(res.src);
      if (fileRef.current) fileRef.current.value = "";
    });
  };
  return (
    <FormField id={id} label={label} hint={hint ?? "Upload a picture, or paste an https:// link"} error={uploadError ?? error} required={!optional}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-background">
          {value && <Image src={value} alt="" fill sizes="96px" unoptimized className="object-cover" />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input id={id} size="sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" invalid={Boolean(error)} />
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} aria-label={`Upload ${label}`} onChange={(e) => setPicked(e.target.files?.[0] ?? null)} />
            <ImageCropper file={picked} aspect={cropAspect === undefined ? FOLDER_ASPECT[folder] : cropAspect} onDone={onFile} onCancel={reset} />
            <Button size="sm" variant="outline" loading={pending} icon={<ImagePlus aria-hidden className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
              Upload
            </Button>
            {optional && value && (
              <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormField>
  );
}

/* ==================================================================== ScheduleFields */

const IST_MS = 330 * 60 * 1000;
/** ISO (any offset) → "YYYY-MM-DDTHH:mm" in IST for <input type="datetime-local">. */
export const isoToIstInput = (iso: string) => (iso ? new Date(new Date(iso).getTime() + IST_MS).toISOString().slice(0, 16) : "");
/** "YYYY-MM-DDTHH:mm" (IST) → ISO with +05:30 offset. */
export const istInputToIso = (v: string) => (v ? `${v}:00+05:30` : "");

/** Optional start/end date-time (IST) for anything that should appear only during an offer. */
export function ScheduleFields({ value, onChange, idPrefix }: { value: { startsAt: string; endsAt: string }; onChange: (v: { startsAt: string; endsAt: string }) => void; idPrefix: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FormField id={`${idPrefix}-start`} label="Show from (IST, optional)" hint="Leave empty to show now">
        <Input id={`${idPrefix}-start`} size="sm" type="datetime-local" value={isoToIstInput(value.startsAt)} onChange={(e) => onChange({ ...value, startsAt: istInputToIso(e.target.value) })} />
      </FormField>
      <FormField id={`${idPrefix}-end`} label="Hide after (IST, optional)" hint="Leave empty to keep showing">
        <Input id={`${idPrefix}-end`} size="sm" type="datetime-local" value={isoToIstInput(value.endsAt)} onChange={(e) => onChange({ ...value, endsAt: istInputToIso(e.target.value) })} />
      </FormField>
    </div>
  );
}

/* ==================================================================== ContentSaveForm */

export type ContentSaveFormProps = {
  /** site_content key: "settings" | "home" | "faqs" | "page:about" … */
  contentKey: string;
  value: unknown;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  saveLabel?: string;
  /** Extra controls in the save bar (preview link, reset…). */
  extra?: ReactNode;
};

/** Wraps a CMS editor: serialises the edited value as JSON, saves via a server action, shows the result. */
export function ContentSaveForm({ contentKey, value, action, children, saveLabel = "Save changes", extra }: ContentSaveFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  // Fixed id (one save form per page): useId() can differ between server and browser in dev and cause a hydration warning.
  const id = `content-${contentKey.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <form action={formAction} onSubmit={keepFormValues(formAction)} className="flex flex-col gap-6" aria-describedby={`${id}-status`} noValidate>
      <input type="hidden" name="key" value={contentKey} />
      <input type="hidden" name="value" value={JSON.stringify(value)} />
      {children}
      <div className="sticky bottom-0 z-sticky -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 md:mx-0 md:rounded-lg md:border">
        <Button type="submit" variant="secondary" size="lg" loading={pending}>
          {saveLabel}
        </Button>
        {extra}
        <p id={`${id}-status`} role={state.message ? (state.ok ? "status" : "alert") : undefined} className={cn("text-sm", state.ok ? "text-success" : "text-error")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}

/* ==================================================================== TextField (compact controlled input) */

export function TextField({
  id, label, value, onChange, hint, multiline = false, rows = 3, required = false, maxLength, placeholder,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; hint?: string; multiline?: boolean; rows?: number; required?: boolean; maxLength?: number; placeholder?: string;
}) {
  const counter = maxLength ? `${value.length}/${maxLength}` : undefined;
  return (
    <FormField id={id} label={label} hint={[hint, counter].filter(Boolean).join(" · ") || undefined} required={required}>
      {multiline ? (
        <Textarea id={id} rows={rows} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} size="sm" value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </FormField>
  );
}
