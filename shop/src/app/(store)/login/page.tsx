import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/components/commerce/CustomerAuthForm";
import { Container } from "@/components/layout/Container";
import { getCustomer, customerAuthEnabled, safeNext } from "@/lib/customer";
import { buildMetadata } from "@/lib/seo/metadata";
import { forgotPasswordAction, signInCustomerAction, signUpCustomerAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "Sign in or create an account", description: "Sign in to place orders and see your order history.", path: "/login", noindex: true });

type Props = { searchParams: Promise<{ next?: string; mode?: string; error?: string }> };

const LINK_ERRORS: Record<string, string> = {
  link: "That email link has expired or was already used. Request a new one below.",
  admin: "This email belongs to a Cartzee admin account, which can't be used for shopping. Please use a different email.",
};

/** Shopper sign-in. Browsing never needs an account; it's required only to place an order. */
export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getCustomer()) redirect(next);
  return (
    <Container width="narrow" className="flex flex-col gap-6 py-10">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-semibold">Your Cartzee account</h1>
        <p className="text-text-muted">{next === "/checkout" ? "Sign in or create a free account to place your order." : "Sign in to see your orders."}</p>
      </div>
      {sp.error && LINK_ERRORS[sp.error] && (
        <p role="alert" className="rounded-md bg-error-soft p-3 text-sm text-error">
          {LINK_ERRORS[sp.error]}
        </p>
      )}
      {customerAuthEnabled ? (
        <CustomerAuthForm next={next} signIn={signInCustomerAction} signUp={signUpCustomerAction} forgot={forgotPasswordAction} initialMode={sp.mode === "signup" ? "signup" : "signin"} />
      ) : (
        <p className="rounded-md bg-warning-soft p-4 text-warning">Accounts are switched off in this local preview (no Supabase). You can check out as a guest.</p>
      )}
    </Container>
  );
}
