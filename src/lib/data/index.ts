import "server-only";
import type { Repo } from "./repo";
import { seedRepo } from "./seed-repo";

/**
 * Picks the data source. Milestone A ships the seed repository only; Milestone B adds
 * `supabase-repo.ts`, selected when NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 */
export const repo: Repo = seedRepo;

export const isMockMode = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

export type { ProductQuery, NewOrderInput, Repo } from "./repo";
