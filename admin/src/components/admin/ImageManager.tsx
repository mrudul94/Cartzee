"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type ManagedImage = { src: string; alt: string };

export type ImageManagerProps = {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  /** Server action that stores the file and returns its public URL. */
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
  slug: string;
  defaultAlt: string;
  error?: string;
};

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-surface text-text hover:bg-background disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-focus";

/** Product photos: upload (Supabase Storage) or add by path, edit alt text, reorder, remove. First image is the main one. */
export function ImageManager({ images, onChange, upload, slug, defaultAlt, error }: ImageManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const urlId = useId();
  const [url, setUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const update = (i: number, patch: Partial<ManagedImage>) => onChange(images.map((img, n) => (n === i ? { ...img, ...patch } : img)));
  const move = (i: number, d: number) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    next.splice(i + d, 0, item!);
    onChange(next);
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    start(async () => {
      const added: ManagedImage[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("slug", slug);
        const res = await upload(fd);
        if (res.error) {
          setUploadError(res.error);
          break;
        }
        if (res.src) added.push({ src: res.src, alt: `${defaultAlt}, view ${images.length + added.length + 1}` });
      }
      if (added.length) onChange([...images, ...added]);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <ul className="flex flex-col gap-3">
          {images.map((img, i) => (
            <li key={`${img.src}-${i}`} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-2">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-background">
                <Image src={img.src} alt="" fill sizes="64px" unoptimized className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <label htmlFor={`alt-${i}`} className="text-sm text-text-muted">
                  {i === 0 ? "Main image · alt text" : `Image ${i + 1} · alt text`}
                </label>
                <Input id={`alt-${i}`} size="sm" value={img.alt} onChange={(e) => update(i, { alt: e.target.value })} invalid={img.alt.trim().length < 3} />
              </div>
              <div className="flex gap-1">
                <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`}>
                  <ArrowUp aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`Move image ${i + 1} down`}>
                  <ArrowDown aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" className={`${iconBtn} text-error`} onClick={() => onChange(images.filter((_, n) => n !== i))} aria-label={`Remove image ${i + 1}`}>
                  <Trash2 aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" id="image-upload" aria-label="Upload product photos" tabIndex={-1} onChange={(e) => onFiles(e.target.files)} />
        <Button variant="outline" loading={pending} icon={<ImagePlus aria-hidden className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
          Upload photos
        </Button>
        <span className="text-sm text-text-muted">JPG, PNG, WebP or AVIF, up to 5 MB. Use a plain light background.</span>
      </div>
      <div className="flex gap-2">
        <label htmlFor={urlId} className="sr-only">
          Image URL or path
        </label>
        <Input id={urlId} size="sm" placeholder="…or paste an image URL / path" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button
          size="sm"
          variant="soft"
          disabled={!url.trim()}
          onClick={() => {
            onChange([...images, { src: url.trim(), alt: `${defaultAlt}, view ${images.length + 1}` }]);
            setUrl("");
          }}
        >
          Add
        </Button>
      </div>
      {(uploadError || error) && (
        <p role="alert" className="text-sm text-error">
          {uploadError ?? error}
        </p>
      )}
    </div>
  );
}
