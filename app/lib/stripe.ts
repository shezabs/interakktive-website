import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// ==========================================================================
// PRICE IDs — new pricing (2026-06-14): ATLAS PRO + ATLAS MAX.
// Create these 4 prices in Stripe (USD) and set the matching Vercel env vars.
// FREE has no price (sign-up only).
// ==========================================================================
export const PRICE_IDS: Record<string, string> = {
  pro_weekly: process.env.STRIPE_PRICE_PRO_WEEKLY || '',
  pro_biweekly: process.env.STRIPE_PRICE_PRO_BIWEEKLY || '',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  max_monthly: process.env.STRIPE_PRICE_MAX_MONTHLY || '',
  max_annual: process.env.STRIPE_PRICE_MAX_ANNUAL || '',
};

export type PlanId = 'pro' | 'max';
export type BillingInterval = 'weekly' | 'biweekly' | 'monthly' | 'annual';

export function getPriceId(plan: PlanId, billing: BillingInterval): string {
  const key = `${plan}_${billing}`;
  return PRICE_IDS[key] || '';
}
