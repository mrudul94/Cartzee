import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import type { Repo } from "./repo";
import { seedRepo } from "./seed-repo";
import { supabaseRepo } from "./supabase-repo";

/**
 * Data source: Supabase when NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
 * SUPABASE_SERVICE_ROLE_KEY are all set; otherwise the in-memory seed repository.
 */
export const repo: Repo = isSupabaseConfigured ? supabaseRepo : seedRepo;

if (!isSupabaseConfigured && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
  console.warn("[cartzee] Supabase is not configured: serving seed data and keeping orders in memory.");
}

export { OrderError } from "./repo";
export type { NewOrderInput, NewReviewInput, PaymentConfirmation, ProductQuery, Repo } from "./repo";
