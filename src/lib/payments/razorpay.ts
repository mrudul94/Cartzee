import "server-only";
import { config } from "@/lib/config";

/**
 * Razorpay via REST + WebCrypto (no Node SDK) so it runs on Node and Cloudflare Workers alike.
 * Docs: Orders API, Checkout signature verification, Webhook signature verification.
 */

const API = "https://api.razorpay.com/v1";
const enc = new TextEncoder();

export type RazorpayOrder = { id: string; amount: number; currency: string; receipt: string; status: string };

/** ₹ → paise, avoiding float drift (449.1 → 44910). */
export const toPaise = (rupees: number) => Math.round(rupees * 100);

export async function createRazorpayOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }): Promise<RazorpayOrder> {
  const { keyId, keySecret } = config.razorpay;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: input.amountPaise, currency: "INR", receipt: input.receipt, notes: input.notes, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as RazorpayOrder;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export async function verifyPaymentSignature(p: { orderId: string; paymentId: string; signature: string }, secret = config.razorpay.keySecret): Promise<boolean> {
  if (!secret || !p.signature) return false;
  return safeEqual(await hmacHex(secret, `${p.orderId}|${p.paymentId}`), p.signature);
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook secret) in X-Razorpay-Signature. */
export async function verifyWebhookSignature(rawBody: string, signature: string | null, secret = config.razorpay.webhookSecret): Promise<boolean> {
  if (!secret || !signature) return false;
  return safeEqual(await hmacHex(secret, rawBody), signature);
}

/** Exposed for tests and local webhook simulation. */
export const signForTest = hmacHex;
