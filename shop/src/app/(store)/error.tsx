"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { reportError } from "@/lib/utils/report-error";

/**
 * Shown when a shop page crashes (header and footer stay). Reports the crash to Admin → Site logs.
 * For server crashes the browser only gets a short "digest" code; the full error is logged by the server
 * (instrumentation.ts) under the same digest.
 */
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(`Page crashed: ${error.name}: ${error.message}`, [error.digest ? `digest: ${error.digest}` : "", error.stack ?? ""].filter(Boolean).join("\n"));
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-4 py-16">
      <h1 className="font-heading text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-prose text-text-muted">
        This page didn&apos;t load properly. Please try again; your cart is safe.
        {error.digest && <span className="mt-2 block text-sm">Error code: {error.digest}</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="soft">
          Go to homepage
        </Button>
      </div>
    </Container>
  );
}
