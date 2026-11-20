"use client";

import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";

/** Crop shapes offered in the cropper. `null` keeps the photo's own shape. */
export const CROP_SHAPES = [
  { label: "Square", aspect: 1, hint: "Product photos, category circles" },
  { label: "Wide 16:9", aspect: 16 / 9, hint: "Collection cards, banners, guides" },
  { label: "Hero 7:3", aspect: 7 / 3, hint: "Homepage hero slides" },
  { label: "Portrait 4:5", aspect: 4 / 5, hint: "Tall product shots" },
  { label: "Original", aspect: null, hint: "Keep the photo's shape" },
] as const;

const MAX_SIDE = 2000;

/** Draws the chosen area of an image file into a new file (same type; large photos scaled down to 2000px). */
export async function cropImageFile(file: File, area: Area): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This picture couldn't be opened."));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(area.width, area.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(area.width * scale);
    canvas.height = Math.round(area.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cropping isn't supported in this browser.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    // AVIF can't be written by most browsers: save those as WebP.
    const type = file.type === "image/png" || file.type === "image/webp" ? file.type : file.type === "image/avif" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
    if (!blob) throw new Error("Couldn't save the cropped picture.");
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "image"}-cropped.${ext}`, { type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ImageCropperProps = {
  /** The picked file; the cropper opens while this is set. */
  file: File | null;
  /** Starting shape (e.g. 1 for products, 16/9 for banners). */
  aspect?: number | null;
  /** "2 of 3" when cropping several photos in a row. */
  progress?: string;
  /** Called with the cropped file, or the original when "Use full photo" is chosen. */
  onDone: (file: File) => void;
  onCancel: () => void;
};

/**
 * Crop step before an image upload: drag to position, zoom with the slider (or pinch on a phone), pick a shape.
 * "Use full photo" uploads it uncropped.
 */
export function ImageCropper({ file, aspect = 1, progress, onDone, onCancel }: ImageCropperProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [shape, setShape] = useState<number | null>(aspect);
  const [natural, setNatural] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setSrc(null);
    const url = URL.createObjectURL(file);
    setSrc(url);
    setShape(aspect);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file, aspect]);

  const apply = async () => {
    if (!file || !area) return;
    setBusy(true);
    setError(null);
    try {
      onDone(await cropImageFile(file, area));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't crop this picture.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(file)}
      onOpenChange={(open) => !open && !busy && onCancel()}
      title={progress ? `Crop picture (${progress})` : "Crop picture"}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => file && onDone(file)} disabled={busy}>
            Use full photo
          </Button>
          <Button variant="secondary" onClick={apply} loading={busy} icon={<Crop aria-hidden className="h-4 w-4" />}>
            Crop &amp; upload
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-ink md:h-96">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={shape ?? natural}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
              onMediaLoaded={(m) => setNatural(m.naturalWidth / m.naturalHeight)}
              objectFit="contain"
            />
          )}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <ZoomIn aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
          <span className="sr-only">Zoom</span>
          <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-primary" aria-label="Zoom" />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Shape</legend>
          <div className="flex flex-wrap gap-2">
            {CROP_SHAPES.map((s) => {
              const on = shape === s.aspect;
              return (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={on}
                  title={s.hint}
                  onClick={() => setShape(s.aspect)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-sm focus-visible:outline-none focus-visible:shadow-focus",
                    on ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border bg-surface text-text hover:border-border-strong",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-text-muted">{CROP_SHAPES.find((s) => s.aspect === shape)?.hint} · Drag the picture to position it.</p>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
