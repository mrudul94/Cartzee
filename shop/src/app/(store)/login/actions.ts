"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clientIpHash, isLocked, recordAttempt, WINDOW_MIN } from "@/lib/auth/rate-limit";
import { customerAuthEnabled, customerClient, safeNext } from "@/lib/customer";
import { site } from "@/lib/site";

export type AuthState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password") });
const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email,
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

const errs = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]));
const off: AuthState = { message: "Accounts are not available in this preview." };

export async function signInCustomerAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!customerAuthEnabled) return off;
  const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { errors: errs(parsed.error) };
  const key = `customer:${parsed.data.email}`;
  const ip = await clientIpHash(await headers());
  if (await isLocked(key, ip)) return { message: `Too many attempts. Please wait ${WINDOW_MIN} minutes and try again.` };

  const { error } = await (await customerClient()).auth.signInWithPassword(parsed.data);
  if (error) {
    await recordAttempt(key, ip, false);
    return { message: /confirm/i.test(error.message) ? "Please confirm your email first (check your inbox)." : "Email or password is incorrect." };
  }
  await recordAttempt(key, ip, true);
  redirect(safeNext(fd.get("next")));
}

export async function signUpCustomerAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!customerAuthEnabled) return off;
  const parsed = signUpSchema.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { errors: errs(parsed.error) };
  const next = safeNext(fd.get("next"));
  const { data, error } = await (await customerClient()).auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name }, emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { message: /registered|exists/i.test(error.message) ? "An account with this email already exists. Sign in instead." : error.message };
  if (!data.session) return { ok: true, message: "Account created. Check your email and click the link to confirm, then sign in." };
  redirect(next);
}

export async function forgotPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!customerAuthEnabled) return off;
  const parsed = email.safeParse(fd.get("email"));
  if (!parsed.success) return { errors: { email: "Enter your email above first" } };
  await (await customerClient()).auth.resetPasswordForEmail(parsed.data, { redirectTo: `${site.url}/auth/callback?next=/account/password` });
  // Same answer whether or not the account exists (no account enumeration).
  return { ok: true, message: "If an account exists for this email, we've sent a link to reset the password." };
}

export async function setPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!customerAuthEnabled) return off;
  const pw = z.string().min(8, "Use at least 8 characters").max(72).safeParse(fd.get("password"));
  if (!pw.success) return { errors: { password: pw.error.issues[0]!.message } };
  const { error } = await (await customerClient()).auth.updateUser({ password: pw.data });
  if (error) return { message: "Your reset link has expired. Request a new one from the sign-in page." };
  return { ok: true, message: "Password updated." };
}

export async function signOutCustomerAction() {
  if (customerAuthEnabled) await (await customerClient()).auth.signOut();
  redirect("/");
}
