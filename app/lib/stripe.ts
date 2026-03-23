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

// Price IDs — set in Vercel environment variables
export const PRICE_IDS = {
  single_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
  single_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
  duo_monthly: process.env.STRIPE_PRICE_ADVANTAGE_MONTHLY || '',
  duo_annual: process.env.STRIPE_PRICE_ADVANTAGE_ANNUAL || '',
  suite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || '',
  suite_annual: process.env.STRIPE_PRICE_ELITE_ANNUAL || '',
} as const;

export type PlanId = 'single' | 'duo' | 'suite';
export type BillingInterval = 'monthly' | 'annual';

export function getPriceId(plan: PlanId, billing: BillingInterval): string {
  const key = `${plan}_${billing}` as keyof typeof PRICE_IDS;
  return PRICE_IDS[key];
}
