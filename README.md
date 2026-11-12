# City Seller

An Indian home-needs store with prepaid-only checkout (Razorpay). Orders are fulfilled through Meesho.
Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 3 driven by design tokens, Radix UI, Supabase,
Razorpay and Resend.

> **Status:** Milestone A (design system + storefront) and Milestone B (database, payments, emails) are done.
> Next: Milestone C (admin panel), then Milestone D (SEO feeds, llms.txt, Cloudflare deploy).

## Run locally

```bash
pnpm install
cp .env.example .env.local   # optional: leave values empty for mock mode
pnpm dev                     # http://localhost:3000
```

Each integration switches on when its variables are set and is mocked otherwise:

| Integration | Variables | Without them |
|---|---|---|
| Supabase (catalogue, orders) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Seed data; orders kept in memory |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Simulated payment (development only) |
| Resend email | `RESEND_API_KEY`, `EMAIL_FROM` | Emails printed to the server console |
| Telegram admin alert | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Alert printed to the server console |

A production build with no Razorpay keys **refuses checkout**. It does not fall back to simulated payments,
unless `ALLOW_MOCK_PAYMENTS=true` is set for a staging demo.

## Set up Supabase

1. Create a project at supabase.com (region: Mumbai `ap-south-1`).
2. In the SQL editor, run the files in `supabase/migrations/` in order (`0001`, `0002`, `0003`), then
   `supabase/seed.sql`. If you use the Supabase CLI instead, run `supabase link` then `supabase db push`.
3. Copy the project URL, the anon key and the service-role key into `.env.local`.

To regenerate `seed.sql` after editing `src/lib/seed/*`, run `pnpm db:seed-sql`.

The security model is in `0003_security.sql`:

- The storefront reads the catalogue with the anon key.
- RLS limits what the anon key can read, and column grants hide `meesho_url` and `meesho_price` from it.
- Orders and customers are reachable only through server code that uses the service-role key.
- Order creation and payment confirmation are Postgres functions:
  - `create_order` re-prices every item from the database and checks stock.
  - `mark_order_paid` locks the order row. It is idempotent and checks the paid amount.

## Set up Razorpay

1. Get your API keys from Dashboard → Account & Settings → API Keys. Start with the `rzp_test_…` keys.
2. Add a webhook in Dashboard → Webhooks:
   - URL: `https://<your-domain>/api/razorpay/webhook`
   - Events: `payment.captured` and `order.paid`
   - Secret: choose one, then set the same value as `RAZORPAY_WEBHOOK_SECRET`.
3. Make a test payment with a Razorpay test card, or UPI `success@razorpay`. After you pay:
   - Checkout calls `/api/checkout/verify`, which checks the payment signature and confirms the order immediately.
   - The webhook confirms the order independently. Both paths are safe to run twice.
   - The customer gets one confirmation email and the admins get one Telegram alert.

To test webhooks on your local machine, expose it with a tunnel (for example `cloudflared tunnel --url http://localhost:3000`).
Then use the tunnel URL as the webhook URL in Razorpay.

## Set up email and alerts

- **Resend:** verify your sending domain, then set `RESEND_API_KEY` and `EMAIL_FROM`.
- **Telegram:** create a bot with @BotFather. Send the bot a message, then open
  `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your chat id. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

## Commands

| Command | What it does |
|---|---|
| `pnpm test` | Vitest: migrations, RLS and SQL functions on in-process Postgres (PGlite), plus payment routes and utilities |
| `pnpm lint` | ESLint + token guard + registry check |
| `pnpm check:tokens` | Fails on raw hex/rgb/px or arbitrary Tailwind values in `src/components` |
| `pnpm registry:sync` | Recomputes `usedIn` / `tokensUsed` and regenerates `COMPONENTS.md` |
| `pnpm check:registry` | Fails if an export is unregistered or lacks a `/design-system` demo |
| `pnpm db:seed-sql` | Regenerates `supabase/seed.sql` from the TypeScript seed data |
| `pnpm placeholders` | Regenerates the SVG placeholder images |

## Design system

- Tokens: `src/design-system/tokens.ts`. This is the only place visual values live. Tailwind's default theme is replaced by these tokens.
- Registry: `src/design-system/registry.json` + generated `COMPONENTS.md`. Reuse or extend components before creating new ones.
- Living style guide: `/design-system`. Available in dev, or in production with `DESIGN_SYSTEM_PUBLIC=true`.

## Before launch

- Replace the seed products, **sample ratings and reviews**, the placeholder phone number and email in `src/lib/site.ts`, and the SVG placeholders with real data and photos.
- The 5% UPI discount is advertised in the top bar. Configure it as a Razorpay offer, or remove the text.
- Switch from Razorpay test keys to live keys, and update the webhook secret to match.
