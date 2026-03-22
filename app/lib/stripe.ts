import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

// Price IDs — set these after creating products in Stripe Dashboard
// Format: price_xxxxxxxxxxxxx
export const PRICE_IDS = {
  single_monthly: process.env.STRIPE_PRICE_SINGLE_MONTHLY || '',
  single_annual: process.env.STRIPE_PRICE_SINGLE_ANNUAL || '',
  duo_monthly: process.env.STRIPE_PRICE_DUO_MONTHLY || '',
  duo_annual: process.env.STRIPE_PRICE_DUO_ANNUAL || '',
  suite_monthly: process.env.STRIPE_PRICE_SUITE_MONTHLY || '',
  suite_annual: process.env.STRIPE_PRICE_SUITE_ANNUAL || '',
} as const;

export type PlanId = 'single' | 'duo' | 'suite';
export type BillingInterval = 'monthly' | 'annual';

export function getPriceId(plan: PlanId, billing: BillingInterval): string {
  const key = `${plan}_${billing}` as keyof typeof PRICE_IDS;
  return PRICE_IDS[key];
}
