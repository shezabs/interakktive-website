import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey);
}

const PRICE_MAP: Record<string, string | undefined> = {
  'starter_monthly': process.env.STRIPE_PRICE_STARTER_MONTHLY,
  'starter_annual': process.env.STRIPE_PRICE_STARTER_ANNUAL,
  'advantage_monthly': process.env.STRIPE_PRICE_ADVANTAGE_MONTHLY,
  'advantage_annual': process.env.STRIPE_PRICE_ADVANTAGE_ANNUAL,
  'elite_monthly': process.env.STRIPE_PRICE_ELITE_MONTHLY,
  'elite_annual': process.env.STRIPE_PRICE_ELITE_ANNUAL,
};

const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 50, annual: 500 },
  advantage: { monthly: 75, annual: 750 },
  elite: { monthly: 100, annual: 1000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, targetPlan, indicators, billing, isBillingSwitch } = body as {
      subscriptionId: string;
      targetPlan: 'starter' | 'advantage' | 'elite';
      indicators: string[];
      billing: 'monthly' | 'annual';
      isBillingSwitch?: boolean;
    };

    if (!subscriptionId || !targetPlan || !indicators || !billing) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate indicators
    const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO'];
    if (targetPlan === 'advantage' && indicators.length !== 2) {
      return NextResponse.json({ error: 'Advantage plan requires exactly 2 indicators' }, { status: 400 });
    }
    if (targetPlan === 'elite' && indicators.length !== 4) {
      return NextResponse.json({ error: 'Elite plan requires all 4 indicators' }, { status: 400 });
    }
    if (targetPlan === 'starter' && indicators.length !== 1) {
      return NextResponse.json({ error: 'Starter plan requires exactly 1 indicator' }, { status: 400 });
    }
    if (!indicators.every(i => allIndicators.includes(i))) {
      return NextResponse.json({ error: 'Invalid indicator selection' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get current subscription
    const { data: currentSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (!currentSub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Validate upgrade direction — allow same plan only if billing is changing
    const planOrder: Record<string, number> = { starter: 1, advantage: 2, elite: 3 };
    const isSamePlan = targetPlan === currentSub.plan;
    const isBillingChange = billing !== currentSub.billing;
    
    if (isSamePlan && !isBillingChange) {
      return NextResponse.json({ error: 'You are already on this plan with this billing cycle' }, { status: 400 });
    }
    if (!isSamePlan && (planOrder[targetPlan] || 0) < (planOrder[currentSub.plan] || 0)) {
      return NextResponse.json({ error: 'Can only upgrade to a higher or equal plan' }, { status: 400 });
    }

    // Get target price ID
    const priceId = PRICE_MAP[`${targetPlan}_${billing}`];
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured for this plan' }, { status: 500 });
    }

    const stripe = getStripe();

    // DO NOT cancel old subscription here — only after new payment succeeds
    // Store old subscription info in metadata so webhook can handle the swap

    // Create new Stripe checkout session for the upgrade
    const planIdMap: Record<string, string> = { advantage: 'duo', elite: 'suite' };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: currentSub.user_email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        plan: planIdMap[targetPlan] || targetPlan,
        billing,
        tradingview_username: currentSub.tradingview_username,
        selected_indicators: indicators.join(','),
        is_upgrade: 'true',
        previous_plan: currentSub.plan,
        previous_subscription_id: subscriptionId, // Supabase row ID
        previous_stripe_subscription_id: currentSub.stripe_subscription_id || '',
      },
      subscription_data: {
        metadata: {
          plan: planIdMap[targetPlan] || targetPlan,
          tradingview_username: currentSub.tradingview_username,
          selected_indicators: indicators.join(','),
        },
      },
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&upgrade=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Upgrade error:', error);
    return NextResponse.json({ error: error.message || 'Upgrade failed' }, { status: 500 });
  }
}
