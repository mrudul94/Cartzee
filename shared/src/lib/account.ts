import { z } from "zod";
import { INDIAN_STATES, phoneSchema, pincodeSchema } from "@/lib/utils/validators";

/** A shopper's saved delivery address (table customer_addresses; RLS: own rows only). */
export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export const MAX_SAVED_ADDRESSES = 10;

const optional = (max: number) => z.string().trim().max(max).default("");

export const savedAddressSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  label: optional(30),
  name: z.string().trim().min(2, "Enter the full name").max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(5, "Enter house no., building and street").max(120),
  line2: optional(120),
  landmark: optional(80),
  city: z.string().trim().min(2, "Enter the city").max(60),
  state: z.enum(INDIAN_STATES, { message: "Select the state" }),
  pincode: pincodeSchema,
  isDefault: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.union([z.literal(""), phoneSchema]).default(""),
});
