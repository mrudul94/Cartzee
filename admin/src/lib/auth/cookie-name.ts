/**
 * The admin session uses its own cookie name, separate from the shop's customer session.
 * Browsers share cookies across ports on localhost (and could across subdomains), so this keeps
 * an admin sign-in from ever appearing as a shop login, and vice versa.
 */
export const ADMIN_AUTH_COOKIE = { name: "cs-admin-auth" } as const;
