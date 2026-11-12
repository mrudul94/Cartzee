import "server-only";

/**
 * Runtime mode switches, derived only from environment variables.
 * Every integration falls back to a local mock when its keys are missing.
 */
const env = (k: string) => {
  const v = process.env[k];
  return v && v.trim() ? v.trim() : undefined;
};

export const config = {
  supabase: {
    url: env("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
  },
  razorpay: {
    keyId: env("RAZORPAY_KEY_ID"),
    keySecret: env("RAZORPAY_KEY_SECRET"),
    webhookSecret: env("RAZORPAY_WEBHOOK_SECRET"),
  },
} as const;

export const isSupabaseConfigured = Boolean(config.supabase.url && config.supabase.anonKey && config.supabase.serviceRoleKey);
export const isRazorpayConfigured = Boolean(config.razorpay.keyId && config.razorpay.keySecret);

/**
 * Simulated payments are only ever allowed when Razorpay is NOT configured, and never in a
 * production build unless explicitly enabled for a staging demo (ALLOW_MOCK_PAYMENTS=true).
 * This prevents a misconfigured production deploy from marking orders paid for free.
 */
export const allowMockPayments =
  !isRazorpayConfigured && (process.env.NODE_ENV !== "production" || env("ALLOW_MOCK_PAYMENTS") === "true");
