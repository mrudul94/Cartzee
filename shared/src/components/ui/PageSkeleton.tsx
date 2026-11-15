import { Container } from "@/components/layout/Container";
import { Skeleton } from "./Misc";

export type PageSkeletonProps = {
  /** listing: heading + product grid · product: gallery + details · table: admin list · home: hero + grid */
  variant?: "home" | "listing" | "product" | "table";
  /** Admin pages render inside their own layout container. */
  bare?: boolean;
};

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Skeleton className="aspect-product w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

const grid = (n: number) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
    {Array.from({ length: n }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

/** Placeholder shown by loading.tsx while a page loads (same shapes as the real layout, so nothing jumps). */
export function PageSkeleton({ variant = "listing", bare = false }: PageSkeletonProps) {
  const body = (() => {
    switch (variant) {
      case "home":
        return (
          <div className="flex flex-col gap-10 py-6">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-48" />
              </div>
              <Skeleton className="aspect-banner w-full rounded-xl" />
            </div>
            <Skeleton className="h-8 w-48" />
            {grid(4)}
          </div>
        );
      case "product":
        return (
          <div className="grid gap-8 py-6 md:grid-cols-2">
            <Skeleton className="aspect-product w-full rounded-lg" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        );
      case "table":
        return (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-11 w-full max-w-modal" />
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-6 py-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-full max-w-prose" />
            {grid(8)}
          </div>
        );
    }
  })();
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {bare ? body : <Container>{body}</Container>}
    </div>
  );
}
