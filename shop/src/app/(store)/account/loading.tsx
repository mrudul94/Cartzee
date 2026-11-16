import { PageSkeleton } from "@/components/ui/PageSkeleton";

/** Switching between account pages: the sidebar stays, only the content area shows a placeholder. */
export default function Loading() {
  return <PageSkeleton variant="accountContent" bare />;
}
