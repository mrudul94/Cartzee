"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/utils/report-error";
import "@/styles/globals.css";

/**
 * Last-resort crash screen when even the shop's layout (header/footer) fails. Replaces the whole document,
 * so it brings its own <html>/<body>. Reports the crash to Admin → Site logs.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(`Site crashed (layout): ${error.name}: ${error.message}`, [error.digest ? `digest: ${error.digest}` : "", error.stack ?? ""].filter(Boolean).join("\n"));
  }, [error]);

  return (
    <html lang="en-IN">
      <body className="bg-background font-body text-text">
        <main className="mx-auto flex max-w-prose flex-col items-start gap-4 px-4 py-16">
          <h1 className="font-heading text-3xl font-semibold">Something went wrong</h1>
          <p className="text-text-muted">
            Cartzee didn&apos;t load properly. Please try again in a moment.
            {error.digest && <span className="mt-2 block text-sm">Error code: {error.digest}</span>}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="min-h-11 rounded-md bg-primary px-5 font-semibold text-text-inverse hover:bg-primary-hover">
              Try again
            </button>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-md bg-secondary px-5 font-semibold text-text hover:bg-secondary-strong">
              Go to homepage
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
