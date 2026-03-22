# Interakktive Website — Full Update Summary
## March 2026 — Brand + Content + Pricing + Stripe

---

### Files Modified (12)

| File | What Changed |
|------|-------------|
| `tailwind.config.ts` | Brand colours → Teal (#26A69A) / Magenta (#EF5350) / Amber (#FFB300) |
| `app/lib/indicators-data.ts` | All 4 Pro indicators + Sessions+ free + pricing tiers (Single/Duo/Suite) |
| `app/page.tsx` | Full homepage rewrite — "Intelligence You Can See", suite showcase, philosophy |
| `app/atlas-pro/page.tsx` | Complete rewrite — all 4 products with features, tech details, anchor links |
| `app/components/Navigation.tsx` | Nav order: ATLAS Suite → Pricing → Free Indicators → About |
| `app/components/Footer.tsx` | Copyright → Interakktive Ltd, tagline update, Pricing link added |
| `app/components/animations.tsx` | Added `id` prop to SectionWrapper |
| `app/layout.tsx` | Metadata: removed AI/ML claims, updated SEO |
| `app/indicators/page.tsx` | CTA text updated to match new branding |
| `app/signup/page.tsx` | TradingView username now required, copy updated |
| `package.json` | Added stripe, @stripe/stripe-js dependencies |
| `package-lock.json` | Lockfile updated |

### Files Added (9)

| File | Purpose |
|------|---------|
| `app/pricing/page.tsx` | Pricing page — 3 tiers, monthly/annual toggle, FAQ |
| `app/checkout/start/page.tsx` | Pre-checkout form — collects email + TV username, redirects to Stripe |
| `app/checkout/success/page.tsx` | Post-payment success page with next steps |
| `app/checkout/cancel/page.tsx` | Payment cancelled page |
| `app/api/checkout/route.ts` | Stripe Checkout Session creation API |
| `app/api/webhook/route.ts` | Stripe webhook handler — logs new subs, handles cancellations |
| `app/lib/stripe.ts` | Stripe server config + price ID mapping |
| `.env.example` | Environment variables template |
| `WEBSITE_UPDATE_SUMMARY.md` | This file |

---

### Payment Flow

```
Pricing Page → "Get Started" button
    ↓
/checkout/start?plan=duo&billing=annual
    ↓
User enters email + TradingView username
    ↓
POST /api/checkout → creates Stripe Checkout Session
    ↓
Redirect to Stripe hosted checkout (stripe.com)
    ↓
Payment success → /checkout/success (thank you page)
Payment cancel  → /checkout/cancel
    ↓
Stripe webhook fires → POST /api/webhook
    ↓
Logs subscription details (email, TV username, plan)
    ↓
Shezab manually grants TradingView access
```

---

### Pricing Structure

| Tier | Monthly | Annual | Annual Per Month |
|------|---------|--------|-----------------|
| Single (any 1 indicator) | $29.99 | $249.99 | $20.83 |
| Duo (any 2 indicators) | $49.99 | $449.99 | $37.50 |
| Full Suite (all 4 + future) | $79.99 | $699.99 | $58.33 |

---

### Setup Steps to Go Live

#### 1. Stripe Dashboard Setup
1. Go to https://dashboard.stripe.com
2. Create 3 Products:
   - "ATLAS Pro — Single Indicator" → add Monthly ($29.99) + Annual ($249.99) recurring prices
   - "ATLAS Pro — Duo Pack" → add Monthly ($49.99) + Annual ($449.99) recurring prices
   - "ATLAS Pro — Full Suite" → add Monthly ($79.99) + Annual ($699.99) recurring prices
3. Copy each price ID (starts with `price_`)
4. Set up webhook endpoint:
   - URL: `https://www.interakktive.com/api/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the webhook signing secret

#### 2. Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SINGLE_MONTHLY=price_...
STRIPE_PRICE_SINGLE_ANNUAL=price_...
STRIPE_PRICE_DUO_MONTHLY=price_...
STRIPE_PRICE_DUO_ANNUAL=price_...
STRIPE_PRICE_SUITE_MONTHLY=price_...
STRIPE_PRICE_SUITE_ANNUAL=price_...
```

#### 3. Deploy
```bash
git add -A
git commit -m "Full website update: brand, products, pricing, Stripe checkout"
git push origin main
```
Vercel auto-deploys on push.

#### 4. Test
- Use Stripe test mode first (sk_test_ / pk_test_ keys)
- Test card: 4242 4242 4242 4242, any future expiry, any CVC
- Verify webhook fires and logs the TV username
- Switch to live keys when ready

---

### Still TODO (Future Sessions)

1. **Email notifications** — Wire up Resend or similar to email you when someone subscribes (currently console.log only). Template is in webhook route, just needs API key.
2. **Supabase schema** — Create customers table for subscription tracking. SQL and upsert code are stubbed in the webhook.
3. **Product screenshots** — Replace `/images/Screenshot.png` with real screenshots for each Pro indicator.
4. **About page** — Update content to match new messaging.
5. **Supabase connection fix** — Verify env vars are set correctly in Vercel.
6. **Customer portal** — Stripe Customer Portal for self-service subscription management (cancel, update payment).
7. **Dashboard page** — Show subscription status, indicator access, billing info.
