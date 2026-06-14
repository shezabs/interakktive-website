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
// PRICE IDs — CLEARED 2026-06-14 for pricing rebuild.
// Old single/duo/suite (Starter/Advantage/Elite) map removed.
// Repopulate this map with the new tiers' Stripe price IDs (set as Vercel
// env vars) once the new structure is defined.
// ==========================================================================
export const PRICE_IDS: Record<string, string> = {
  // e.g. newtier_monthly: process.env.STRIPE_PRICE_NEWTIER_MONTHLY || '',
};

// Plan + billing types — repopulate union members for the new tiers.
export type PlanId = string;
export type BillingInterval = 'monthly' | 'annual';

export function getPriceId(plan: PlanId, billing: BillingInterval): string {
  const key = `${plan}_${billing}`;
  return PRICE_IDS[key] || '';
}
