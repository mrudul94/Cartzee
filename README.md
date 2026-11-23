# Cartzee

An Indian home-needs store with prepaid-only checkout (Razorpay). Orders are fulfilled through Meesho.
Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 3 driven by design tokens, and Radix UI.

> **Status: Milestone A** (design system + full storefront on seed data, mock payments).
> Next milestones: B (Supabase + Razorpay + Resend), C (admin panel), D (SEO feeds, llms.txt, Cloudflare deploy docs).

## Run locally

```bash
pnpm install
pnpm dev                # http://localhost:3000
```

Without any `.env.local` the site runs in **mock mode**:

- Data comes from `src/lib/seed/*`.
- Checkout simulates a successful payment, and no money is charged.
- Orders are kept in memory and are lost on server restart.
- The confirmation email and the admin Telegram alert are printed to the server console.

## Key commands

| Command | What it does |
|---|---|
| `pnpm lint` | ESLint + token guard + registry check |
| `pnpm check:tokens` | Fails on raw hex/rgb/px or arbitrary Tailwind values inside `src/components` |
| `pnpm registry:sync` | Recomputes `usedIn` / `tokensUsed` in `registry.json` and regenerates `COMPONENTS.md` |
| `pnpm check:registry` | Fails if any component/hook/util/seo export is unregistered or lacks a `/design-system` demo |
| `pnpm placeholders` | Regenerates the SVG placeholder images in `public/placeholders` |
| `pnpm build` | Runs the token and registry checks, then builds |

## Design system

- Tokens: `src/design-system/tokens.ts`. This is the only place visual values live. `tailwind.config.ts` turns the tokens into CSS variables and *replaces* Tailwind's default theme.
- Registry: `src/design-system/registry.json` + generated `COMPONENTS.md`. Read it before building UI, and reuse or extend existing components.
- Living style guide: `/design-system`. Available in dev, or in production with `DESIGN_SYSTEM_PUBLIC=true`.

## Before launch

- Replace the seed products, **sample ratings and reviews**, the placeholder phone number and email in `src/lib/site.ts`, and the SVG placeholders with real data and photos.
- The 5% UPI discount is advertised in the top bar. Configure it as a Razorpay offer, or remove the text.
