import "server-only";
import { after } from "next/server";

/** Outside services (email, Telegram, the shop's refresh endpoint) get this long before we give up. */
export const OUTBOUND_TIMEOUT_MS = 8000;

/**
 * Runs slow follow-up work (emails, alerts, cache refresh on the other site) after the response is sent,
 * so buttons in the admin and shop return immediately. Outside a request (tests, scripts) it runs inline.
 * Errors are logged, never thrown, so a failed email can't break the action that triggered it.
 */
export async function background(label: string, work: () => Promise<unknown>): Promise<void> {
  const run = async () => {
    try {
      await work();
    } catch (e) {
      console.error(`[background] ${label} failed`, e);
    }
  };
  try {
    after(run);
  } catch {
    await run();
  }
}
