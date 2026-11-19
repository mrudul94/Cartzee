import "server-only";
import { svc } from "@/lib/data/supabase-clients";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";

/**
 * Admin two-step sign-in by email code. Each code belongs to one Supabase login session
 * (the session_id claim), so a code or a verified state can't be reused from another browser,
 * and signing out (which ends the session) always requires a new code.
 */
/**
 * TESTING ONLY: set ADMIN_EMAIL_CODE=off to pause the emailed code (password-only admin sign-in).
 * Every admin page shows a warning while paused. Remove the setting before launch.
 */
export function emailCodePaused(): boolean {
  return process.env.ADMIN_EMAIL_CODE?.trim().toLowerCase() === "off";
}

export const CODE_TTL_MIN = 10;
export const MAX_CODE_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SEC = 60;
/** A verified session must enter a fresh code again after this long. */
export const VERIFIED_TTL_HOURS = 12;

type Row = { session_id: string; user_id: string; code_hash: string; sent_at: string; expires_at: string; attempts: number; verified_at: string | null };

const table = () => svc().from("admin_login_codes");

async function hashCode(sessionId: string, code: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${sessionId}:${code}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Uniform random 6-digit code (rejection sampling avoids modulo bias). */
export function newCode(): string {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / 1_000_000) * 1_000_000;
  do crypto.getRandomValues(buf);
  while (buf[0]! >= limit);
  return String(buf[0]! % 1_000_000).padStart(6, "0");
}

async function row(sessionId: string): Promise<Row | null> {
  const { data, error } = await table().select("*").eq("session_id", sessionId).maybeSingle();
  if (error) throw new Error(`Login code lookup failed: ${error.message}`);
  return (data as Row | null) ?? null;
}

/** True when this login session has entered a valid emailed code recently. */
export async function isSessionVerified(sessionId: string): Promise<boolean> {
  const r = await row(sessionId);
  return Boolean(r?.verified_at && Date.now() - Date.parse(r.verified_at) < VERIFIED_TTL_HOURS * 3_600_000);
}

export type SendResult = { ok: true } | { ok: false; reason: "cooldown"; waitSec: number } | { ok: false; reason: "send-failed" };

/** Create (or replace) the code for this session and email it. Rate limited to one per minute. */
export async function sendLoginCode(sessionId: string, userId: string, email: string): Promise<SendResult> {
  const existing = await row(sessionId);
  if (existing && !existing.verified_at) {
    const waitSec = Math.ceil(RESEND_COOLDOWN_SEC - (Date.now() - Date.parse(existing.sent_at)) / 1000);
    if (waitSec > 0) return { ok: false, reason: "cooldown", waitSec };
  }
  const code = newCode();
  const now = new Date();
  const { error } = await table().upsert({
    session_id: sessionId,
    user_id: userId,
    code_hash: await hashCode(sessionId, code),
    sent_at: now.toISOString(),
    expires_at: new Date(now.getTime() + CODE_TTL_MIN * 60_000).toISOString(),
    attempts: 0,
    verified_at: null,
  });
  if (error) throw new Error(`Could not save login code: ${error.message}`);
  // Local development: also print the code so sign-in works before an email provider is set up.
  if (process.env.NODE_ENV !== "production") console.info(`[admin-login-code] ${email}: ${code}`);
  const sent = await sendEmail({
    to: email,
    subject: `${code} is your ${site.name} admin sign-in code`,
    text: `Your ${site.name} admin sign-in code is ${code}.\n\nIt expires in ${CODE_TTL_MIN} minutes. If you didn't try to sign in, change your password now.`,
    html: `<p>Your ${site.name} admin sign-in code is</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>It expires in ${CODE_TTL_MIN} minutes. If you didn't try to sign in, change your password now.</p>`,
  });
  return sent.ok ? { ok: true } : { ok: false, reason: "send-failed" };
}

export type VerifyResult = "ok" | "wrong" | "expired" | "too-many" | "missing";

/** Check a code for this session. Wrong guesses count; after 5 the code is dead and a new one must be sent. */
export async function verifyLoginCode(sessionId: string, code: string): Promise<VerifyResult> {
  const r = await row(sessionId);
  if (!r) return "missing";
  if (r.verified_at) return "ok";
  if (r.attempts >= MAX_CODE_ATTEMPTS) return "too-many";
  if (Date.parse(r.expires_at) < Date.now()) return "expired";
  if ((await hashCode(sessionId, code)) !== r.code_hash) {
    await table().update({ attempts: r.attempts + 1 }).eq("session_id", sessionId);
    return r.attempts + 1 >= MAX_CODE_ATTEMPTS ? "too-many" : "wrong";
  }
  const { error } = await table().update({ verified_at: new Date().toISOString() }).eq("session_id", sessionId);
  if (error) throw new Error(`Could not verify login code: ${error.message}`);
  return "ok";
}

/** Forget every login code for a user (on sign-out). */
export async function clearLoginCodes(userId: string) {
  await table().delete().eq("user_id", userId);
}
