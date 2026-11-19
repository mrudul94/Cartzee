# Cartzee

An Indian home-needs store with prepaid-only checkout (Razorpay). Orders are fulfilled through Meesho.
Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 3 driven by design tokens, Radix UI, Supabase,
Razorpay and Resend.

> **Status:** all four milestones are done: A (design system + storefront), B (database, payments, emails),
> C (admin panel) and D (two websites, SEO/AI-search files, analytics, Cloudflare deployment).

## Two websites, three folders

```
shop/     cartzee.in        Next.js app for customers (Cloudflare Worker "cartzee-shop")
admin/    admin.cartzee.in  Next.js app for you and your team (Worker "cartzee-admin")
shared/   design system, components and data code used by both (compiled by each app, no build step)
```

| | Shop | Admin |
|---|---|---|
| Address | `cartzee.in` (`www` redirects here) | `admin.cartzee.in` |
| For | Customers | You and your team |
| Access | Browse freely; sign in (email + password) to place an order | Optional Cloudflare Access → password → 6-digit code by email → role permissions |
| Search engines | Indexed (sitemap, robots, llms.txt, feed) | Blocked (`Disallow: /`, `noindex`) |

Both use the same Supabase database and deploy independently. Admin-only code is never bundled into the shop.
When an admin saves, the admin calls the shop's `/api/revalidate` (protected by `REVALIDATE_SECRET`) so the shop shows the change immediately.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # optional: leave values empty for mock mode
pnpm dev                     # shop http://localhost:3000, admin http://localhost:3001
```

Each integration switches on when its variables are set and is mocked otherwise:

| Integration | Variables | Without them |
|---|---|---|
| Supabase (catalogue, orders) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Empty shop (no demo data); orders kept in memory |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Simulated payment (development only) |
| Resend email | `RESEND_API_KEY`, `EMAIL_FROM` | Emails printed to the server console |
| Telegram admin alert | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Alert printed to the server console |

Locally both apps read the root `.env.local`; an app's own `shop/.env.local` or `admin/.env.local` overrides it.
For deployment each app gets only its own variables (`shop/.env.example`, `admin/.env.example`). The admin never gets Razorpay keys.

In mock mode (no Supabase) each app keeps its own in-memory data, so an edit made in the admin does not appear in the shop.
Connect Supabase to see both sides working together. Customer accounts also need Supabase; without it checkout stays open for local testing.

A production build with no Razorpay keys **refuses checkout**. It does not fall back to simulated payments,
unless `ALLOW_MOCK_PAYMENTS=true` is set for a staging demo.

## Set up Supabase

1. Create a project at supabase.com (region: Mumbai `ap-south-1`).
2. In the SQL editor, run the files in `supabase/migrations/` in order (`0001` … `0006`). If you use the Supabase CLI instead, run `supabase link` then `supabase db push`.
   The database starts empty: add your categories and products in the admin.
3. Copy the project URL, the anon key and the service-role key into `.env.local`.
4. **Customer accounts.** In Authentication → Providers keep *Email* on with "Confirm email" enabled.
   In Authentication → URL Configuration set *Site URL* to `https://cartzee.in` and add `https://cartzee.in/auth/callback`
   and `http://localhost:3000/auth/callback` to *Redirect URLs* (used by sign-up confirmation and password reset).


The security model is in `0003_security.sql`:

- The storefront reads the catalogue with the anon key.
- RLS limits what the anon key can read, and column grants hide `meesho_url` and `meesho_price` from it.
- Orders and customers are reachable only through server code that uses the service-role key.
  A signed-in customer can additionally read only their own orders (`0005_accounts_rbac.sql`).
- Admin access comes only from the `admins` table, which no browser key can write. Customer accounts can never become admins.
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

## Admin panel (`admin.cartzee.in`)

**Pages**

- **Dashboard:** paid orders waiting to be placed, in-transit count, today's orders, 30-day revenue and margin. It also lists products whose Meesho price hasn't been checked in 7 days (each with an Open Meesho button and a Mark checked button), and products with low stock.
- **Orders:** status filters with counts. The default view is paid orders, newest first. Each order screen has:
  - Copy buttons for the customer's name, phone, address and PIN, ready to paste into Meesho ("Reselling the order? → Yes").
  - A Meesho link for each item, with the expected margin.
  - Fields for the Meesho order ID, the amount paid on Meesho and the courier tracking link.
  - Buttons for the next allowed statuses only.
  - A prefilled WhatsApp message to the customer.
  - The order's full history.
- **Products:** search plus filters for price check due, sold out and hidden. The add/edit form shows the margin and the discount % as you type, takes the Meesho link and price, and has an "I checked the Meesho price today" option. You can upload photos (to Supabase Storage), edit alt text and reorder photos. Content, visibility and SEO overrides are also in the form. Saving refreshes the store.

**Order statuses**

`paid → placed_on_meesho → shipped → delivered`, plus cancel/refund and the return flow.

- Each change is logged with the admin's email and emails the customer, except "placed on Meesho".
- Placing an order requires the Meesho order ID and cost. Shipping it requires the tracking link.
- Cancelling or completing a return can refund the customer in full through Razorpay.
- An order can only become "paid" through a confirmed payment. There is no manual button for it.

**Editing the shop (no developer needed)**

| Admin menu | What you can change |
|---|---|
| **Homepage** | Hero slides (up to 5; more than one becomes a carousel; each can be switched off, or made clickable to open a category or link), offer banners, banner grids, product rows (bestsellers, flash sale, new arrivals, a category, or hand-picked), category tiles, budget tiles, "why shop with us", customer care, brand story, guides and FAQ sections. You can reorder, show/hide, add or delete sections, and schedule any section, slide or banner with show-from / hide-after dates (IST). "Reset to original layout" restores the built-in homepage. |
| **Products** | Everything on a product, plus one-click **Sold out / In stock**, **Hide / Show**, **New badge** (automatic for 30 days after adding, or always / never) and **Duplicate**. New products appear on `/new-arrivals`. |
| **Categories** | Add or edit categories and subcategories: name, URL, image, intro answer, blurb, order, visibility, SEO and FAQs. A category that still has products can't be deleted; hide it instead. |
| **Guides** | Write buying guides with headings, paragraphs and product picks, a cover image and FAQs. Publish or keep as a draft. |
| **Pages** | About, Shipping, Returns, Privacy, Terms, and the store FAQs. |
| **Reviews** | Approve, hide or delete reviews. Only approved reviews show on product pages. |
| **Settings** | Promo strip, phone, WhatsApp (plus the floating WhatsApp chat button: on/off and its message), email, hours, social links, free-delivery threshold and fee (checkout charges these), return days, and the UPI discount text. |

Saving refreshes the shop immediately, and the dashboard's **Recent changes** list shows who changed what and when.
Links may only be site paths (`/kitchen`) or `https://` addresses, and all content is plain text, so nothing typed into the admin can run scripts on the shop.
Secrets (payment, database and email keys) and security settings are deliberately **not** editable in the admin. They live only in server environment variables.
Content is stored in the `site_content` table (`supabase/migrations/0004_cms.sql`). In local mock mode it's kept in memory.

**Admin sign-in and team**

- There is no public sign-up. Sign-in needs the password **and** a 6-digit code emailed to the admin (expires in 10 minutes,
  5 tries, one new code per minute). A verified sign-in lasts 12 hours, then a new code is needed. The code works only in the browser that signed in.
- Codes are sent with Resend, so set `RESEND_API_KEY` and `EMAIL_FROM` on the admin site (the sending domain must be verified in Resend).
  In local development the code is also printed in the terminal running `pnpm dev`. Run `supabase/migrations/0006_admin_email_otp.sql`.
- 5 wrong passwords for an account (or 20 from one network) lock sign-in for 15 minutes. Attempts are logged.
- Sessions are HttpOnly, Secure cookies; signing out ends the session on every device.
- **Roles:** *Super Admin* can do everything, including managing the team. *Admin* can only use the areas ticked for them
  (Orders, Products, Content, Reviews, Settings). Every page and action checks this on the server.
- Sign-ins, failed or locked attempts, sign-in codes, team changes and all edits are recorded in **Recent changes** (Super Admins).

**First Super Admin** (once): in Supabase, Authentication → Users → Add user (tick "Auto confirm"), then in the SQL editor:
`insert into public.admins (user_id, role) select id, 'super_admin' from auth.users where email = 'you@example.com';`

**Add more people:** sign in as a Super Admin and open **Team**. Enter their email, a temporary password, the role and permissions.
Emails that already have a customer account are refused, so shoppers can never be promoted by accident.

Without Supabase, `pnpm dev` opens the admin as a local Super Admin without sign-in, and a banner says so.
A production build without Supabase locks the panel completely. The style guide is available to admins at `/design-system`.

## Commands

| Command | What it does |
|---|---|
| `pnpm test` | Vitest: migrations, RLS and SQL functions on in-process Postgres (PGlite), plus payment routes and utilities |
| `pnpm lint` | ESLint + token guard + registry check |
| `pnpm check:tokens` | Fails on raw hex/rgb/px or arbitrary Tailwind values in `shared/src/components` and `admin/src/components` |
| `pnpm registry:sync` | Recomputes `usedIn` / `tokensUsed` and regenerates `COMPONENTS.md` |
| `pnpm check:registry` | Fails if an export is unregistered or lacks a `/design-system` demo |
| `pnpm logo` | Rebuilds the logo files and favicons from `shop/public/logo/logo-master.png` |
| `pnpm build` | Token and registry checks, then production builds of both apps |
| `pnpm deploy:shop` / `pnpm deploy:admin` | Lint + tests, then builds and deploys that one website to Cloudflare |

## Design system

- Tokens: `shared/src/design-system/tokens.ts`. This is the only place visual values live. Tailwind's default theme is replaced by these tokens.
- Registry: `shared/src/design-system/registry.json` + generated `COMPONENTS.md`. Reuse or extend components before creating new ones.
- Living style guide: `/design-system` in the admin (signed-in admins only).

## SEO, answer engines and analytics

| URL | What it is |
|---|---|
| `/sitemap.xml` | Every indexable page, with product images (cart, checkout, search, admin excluded) |
| `/robots.txt` | Allows search and AI crawlers (Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot…), blocks private paths |
| `/llms.txt` | Markdown summary of the store for AI assistants: policies, categories, bestsellers, guides, FAQ (generated from live data) |
| `/feeds/google.xml` | Google Merchant Center feed. Add it in Merchant Center → Products → Feeds → Scheduled fetch |
| `/og?title=…` | Generated 1200×630 PNG share image, used when a page has no photo |

Every page also has a unique title, a meta description, a canonical URL, Open Graph tags and JSON-LD.
Analytics load on the shop only, and only when their IDs are set:

- **GA4** (`NEXT_PUBLIC_GA_ID`) receives the `add_to_cart`, `begin_checkout` and `purchase` events.
- **Microsoft Clarity** (`NEXT_PUBLIC_CLARITY_ID`) records sessions.
- **Search Console** verification uses `NEXT_PUBLIC_GSC_VERIFICATION`.

## Deploy to Cloudflare

**One-time setup**

1. **Domain.** Add `cartzee.in` to Cloudflare (Websites → Add a site) and switch your registrar's nameservers to Cloudflare.
2. **Cache storage.** Run `pnpm wrangler login`. Both sites cache pages and refresh tags in Workers KV (free plan, no card); the namespace IDs are already in each `wrangler.jsonc`. On a new Cloudflare account, create them with `pnpm wrangler kv namespace create cartzee-<shop|admin>-<cache|tags>` and paste the IDs in.
3. **Server secrets.** Stored on each Worker, never in Git. Run `npx wrangler secret put <NAME>` inside that app's folder:
   ```
   shop/   SUPABASE_SERVICE_ROLE_KEY  RAZORPAY_KEY_ID  RAZORPAY_KEY_SECRET  RAZORPAY_WEBHOOK_SECRET  REVALIDATE_SECRET
           RESEND_API_KEY  TELEGRAM_BOT_TOKEN  TELEGRAM_CHAT_ID  NEXT_PUBLIC_SUPABASE_URL  NEXT_PUBLIC_SUPABASE_ANON_KEY
   admin/  SUPABASE_SERVICE_ROLE_KEY  REVALIDATE_SECRET  RESEND_API_KEY  TELEGRAM_BOT_TOKEN  TELEGRAM_CHAT_ID
           CF_ACCESS_TEAM_DOMAIN  CF_ACCESS_AUD  NEXT_PUBLIC_SUPABASE_URL  NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   `REVALIDATE_SECRET` must be the same long random value in both. The Supabase URL and anon key are not secret, but server code reads them at runtime.
4. **Build-time values.** `NEXT_PUBLIC_SITE_URL=https://cartzee.in` (both apps), the Supabase URL and anon key, and the analytics IDs (shop)
   go in `shop/.env.production.local` / `admin/.env.production.local` for a manual deploy, or in GitHub repository variables for automatic deploys.
5. **Cloudflare Access for the admin.**
   1. In Zero Trust → Access → Applications, add a *Self-hosted* application for `admin.cartzee.in`.
   2. Add an *Allow* policy with your partners' emails, using login method *One-time PIN*.
   3. Copy the application's *AUD tag* into `CF_ACCESS_AUD`, and your team domain (`<team>.cloudflareaccess.com`) into `CF_ACCESS_TEAM_DOMAIN`.
6. **Rate limiting.** In Security → WAF → Rate limiting rules, limit `/api/track`, `/api/checkout` and `/login` (both sites) to about 20 requests per minute per IP.
7. **Razorpay webhook.** Point it at `https://cartzee.in/api/razorpay/webhook`.

**Deploying**

- **Manual:** `pnpm deploy:shop` or `pnpm deploy:admin`. Each runs lint and tests, then builds and deploys only that website.
  The `routes` in each `wrangler.jsonc` attach `cartzee.in` + `www.cartzee.in` (shop) and `admin.cartzee.in` (admin).
- **Automatic (Cloudflare Workers Builds):** each site is a Worker connected to this GitHub repo (Workers & Pages → Import a repository).
  Root directory `shop` or `admin`; build command `cd .. && pnpm install --frozen-lockfile && cd <app> && npx opennextjs-cloudflare build`;
  deploy command `npx opennextjs-cloudflare deploy`. `NEXT_PUBLIC_*` values go in the Worker's *Build* variables; secrets in *Variables and Secrets*.
  `ci.yml` still checks every pull request.

**Test phase (now):** both `wrangler.jsonc` files serve the free `*.workers.dev` address and send email from Resend's test sender.
At launch: set `"workers_dev": false`, restore the commented `routes`, and set `EMAIL_FROM` to your verified domain.

At launch, `workers_dev` and preview URLs are disabled, so the admin can't be reached through a side address.
The project uses pnpm's hoisted `node_modules` layout (`pnpm-workspace.yaml`), because the Cloudflare bundler can't copy pnpm's symlinks on Windows.

## Before launch

- Add your categories and products with real photos (the site ships with no demo data), and replace the placeholder phone, WhatsApp number (+91 90000 00000, in Admin → Settings) and email.
- The 5% UPI discount is advertised in the top bar. Configure it as a Razorpay offer, or remove the text.
- Switch from Razorpay test keys to live keys, and update the webhook secret to match.
- Use JPG, PNG or WebP product photos: Google Merchant Center and social apps do not accept SVG images.
- After the first deploy, submit `https://cartzee.in/sitemap.xml` in Search Console, then run the Rich Results Test and a Lighthouse mobile check on the home, a category and a product page.
