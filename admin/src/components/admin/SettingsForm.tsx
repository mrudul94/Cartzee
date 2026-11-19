"use client";

import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import type { ActionState } from "@/lib/admin/forms";
import type { Settings } from "@/lib/content/schema";
import { ContentSaveForm, TextField } from "./EditorKit";

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card as="fieldset" padding="md" className="flex flex-col gap-4">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

/**
 * Admin → Settings: contact details, social links, promo strip, delivery and returns.
 * Payment keys, logins and other secrets are deliberately not editable here.
 */
export function SettingsForm({ initial, action }: { initial: Settings; action: (prev: ActionState, fd: FormData) => Promise<ActionState> }) {
  const [s, setS] = useState(initial);
  const set = <K extends keyof Settings>(k: K, patch: Partial<Settings[K]>) => setS((prev) => ({ ...prev, [k]: { ...(prev[k] as object), ...patch } }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <ContentSaveForm contentKey="settings" value={s} action={action}>
      <Group title="Top promo strip" description="The dark bar at the very top of every shop page.">
        <Checkbox id="promo-enabled" label="Show the promo strip" checked={s.promo.enabled} onCheckedChange={(v) => set("promo", { enabled: v })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="promo-text" label="Main offer" value={s.promo.text} onChange={(v) => set("promo", { text: v })} maxLength={90} />
          <TextField id="promo-secondary" label="Second message (desktop)" value={s.promo.secondary} onChange={(v) => set("promo", { secondary: v })} maxLength={90} />
        </div>
      </Group>

      <Group title="Customer care" description="Shown in the footer, contact page, emails, Google data and llms.txt.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="care-phone" label="Phone" value={s.care.phone} onChange={(v) => set("care", { phone: v })} required placeholder="+91 98765 43210" />
          <TextField id="care-email" label="Email" value={s.care.email} onChange={(v) => set("care", { email: v })} required />
          <TextField id="care-hours" label="Hours" value={s.care.hours} onChange={(v) => set("care", { hours: v })} required placeholder="Mon to Sat, 10 AM to 7 PM IST" />
        </div>
      </Group>

      <Group title="Social links" description="Leave empty to hide an icon.">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField id="social-instagram" label="Instagram" value={s.social.instagram} onChange={(v) => set("social", { instagram: v })} placeholder="https://instagram.com/…" />
          <TextField id="social-facebook" label="Facebook" value={s.social.facebook} onChange={(v) => set("social", { facebook: v })} placeholder="https://facebook.com/…" />
          <TextField id="social-youtube" label="YouTube" value={s.social.youtube} onChange={(v) => set("social", { youtube: v })} placeholder="https://youtube.com/@…" />
        </div>
      </Group>

      <Group title="Delivery, returns & offers" description="Changes apply to the cart, checkout and the amount charged immediately.">
        <div className="grid gap-4 md:grid-cols-4">
          <TextField id="delivery-free" label="Free delivery above (₹)" value={String(s.delivery.freeAbove)} onChange={(v) => set("delivery", { freeAbove: num(v.replace(/\D/g, "")) })} />
          <TextField id="delivery-fee" label="Delivery fee below that (₹)" value={String(s.delivery.fee)} onChange={(v) => set("delivery", { fee: num(v.replace(/\D/g, "")) })} />
          <TextField id="returns-days" label="Return window (days)" value={String(s.delivery.returnWindowDays)} onChange={(v) => set("delivery", { returnWindowDays: num(v.replace(/\D/g, "")) })} />
          <TextField id="upi-discount" label="UPI discount shown (%)" hint="Configure the real offer in Razorpay" value={String(s.upiDiscountPercent)} onChange={(v) => setS((p) => ({ ...p, upiDiscountPercent: num(v.replace(/[^\d.]/g, "")) }))} />
        </div>
        <p className="text-sm text-text-muted">Remember to update the Shipping and Returns pages (Admin → Pages) if you change these.</p>
      </Group>

      <p className="flex items-start gap-2 rounded-md bg-background p-4 text-sm text-text-muted">
        <Lock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        Payment keys, database and email settings, admin logins and security options are not editable here. They are stored only on the server.
      </p>
    </ContentSaveForm>
  );
}
