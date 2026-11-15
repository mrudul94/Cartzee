import { z } from "zod";

/** Indian PIN code: 6 digits, cannot start with 0. */
export const pincodeSchema = z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code");

/** Indian mobile: 10 digits starting 6–9; tolerates +91 / 91 / 0 prefix and spaces. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"));

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email"),
  line1: z.string().trim().min(5, "Enter house no., building and street").max(120),
  line2: optionalText(120),
  landmark: optionalText(80),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.enum(INDIAN_STATES, { message: "Select your state" }),
  pincode: pincodeSchema,
});

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  items: z.array(cartLineSchema).min(1, "Your cart is empty").max(30),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(4, "Enter your order number").max(20),
  phone: phoneSchema,
});

export type AddressFormValues = z.input<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type TrackOrderValues = z.input<typeof trackOrderSchema>;
