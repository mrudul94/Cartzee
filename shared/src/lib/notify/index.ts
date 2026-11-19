import "server-only";
import { OUTBOUND_TIMEOUT_MS } from "@/lib/background";
import { site } from "@/lib/site";

/**
 * Outbound notifications. Each channel calls its real API when its env vars are set,
 * and logs to the server console otherwise (mock mode for local development).
 */

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${site.name} <orders@cartzee.in>`;
  if (!key) {
    console.info(`[email:mock] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return { ok: true, mock: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    });
    if (!res.ok) console.error("[email] Resend error", res.status, await res.text());
    return { ok: res.ok, mock: false };
  } catch (e) {
    // Network failure or timeout: never hang the caller.
    console.error("[email] Resend unreachable", e);
    return { ok: false, mock: false };
  }
}

/** New-order alert to the admin Telegram chat (target: within 1 minute of payment). */
export async function notifyAdmins(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.info(`[telegram:mock] ${text}`);
    return { ok: true, mock: true };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
    });
    if (!res.ok) console.error("[telegram] error", res.status, await res.text());
    return { ok: res.ok, mock: false };
  } catch (e) {
    console.error("[telegram] unreachable", e);
    return { ok: false, mock: false };
  }
}
