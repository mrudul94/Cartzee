/** Admin roles and permissions (RBAC). Pure functions, safe to import in client components. */

export const ALL_PERMISSIONS = ["orders", "products", "content", "reviews", "settings"] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];
export type AdminRole = "super_admin" | "admin";

export const PERMISSION_LABELS: Record<Permission, string> = {
  orders: "Orders (view, update, refund)",
  products: "Products (add, edit, prices, stock)",
  content: "Homepage, categories, guides & pages",
  reviews: "Reviews",
  settings: "Store settings",
};

/** Super Admins can do everything; other admins only what they were given. */
export function hasPermission(admin: { role: AdminRole; permissions: readonly string[] }, permission: Permission): boolean {
  return admin.role === "super_admin" || admin.permissions.includes(permission);
}
