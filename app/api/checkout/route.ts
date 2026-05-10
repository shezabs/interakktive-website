import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId, PlanId, BillingInterval } from '@/app/lib/stripe';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billing, email, tradingViewUsername, indicators } = body as {
      plan: PlanId;
      billing: BillingInterval;
      email: string;
      tradingViewUsername: string;
      indicators?: string[];
    };

    // Validate required fields
    if (!plan || !billing || !email || !tradingViewUsername) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, billing, email, tradingViewUsername' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!['single', 'duo', 'suite'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be single, duo, or suite.' },
        { status: 400 }
      );
    }

    // Validate billing
    if (!['monthly', 'annual'].includes(billing)) {
      return NextResponse.json(
        { error: 'Invalid billing interval. Must be monthly or annual.' },
        { status: 400 }
      );
    }

    // Validate indicator selection against plan rules.
    // - Starter (single): exactly 1 indicator, from the 4 core indicators only.
    // - Advantage (duo): exactly 2 indicators, from the 4 core indicators only.
    // - Elite (suite): selection ignored on backend (full suite is granted by webhook).
    const CORE_INDICATORS = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO'];
    const ELITE_ONLY = ['OPTIONS PRO'];

    if (plan === 'single' || plan === 'duo') {
      const expected = plan === 'single' ? 1 : 2;
      const provided = Array.isArray(indicators) ? indicators : [];

      if (provided.length !== expected) {
        return NextResponse.json(
          { error: `${plan === 'single' ? 'Starter' : 'Advantage'} plan requires exactly ${expected} indicator${expected > 1 ? 's' : ''}.` },
          { status: 400 }
        );
      }

      // Reject any indicator that is not in the core 4
      const invalid = provided.filter(name => !CORE_INDICATORS.includes(name));
      if (invalid.length > 0) {
        const offending = invalid.join(', ');
        const isEliteOnly = invalid.some(name => ELITE_ONLY.includes(name));
        return NextResponse.json(
          {
            error: isEliteOnly
              ? `${offending} is only available on the Elite plan. Starter and Advantage select from CIPHER PRO, PHANTOM PRO, PULSE PRO, or RADAR PRO.`
              : `Invalid indicator selection: ${offending}. Choose from CIPHER PRO, PHANTOM PRO, PULSE PRO, or RADAR PRO.`,
          },
          { status: 400 }
        );
      }

      // Reject duplicates (e.g. user submits ['CIPHER PRO', 'CIPHER PRO'] for duo)
      if (new Set(provided).size !== provided.length) {
        return NextResponse.json(
          { error: 'Duplicate indicator selection. Please choose distinct indicators.' },
          { status: 400 }
        );
      }
    }

    // Check for existing active subscription with this email
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, plan, status')
      .eq('user_email', email)
      .in('status', ['active', 'cancelling'])
      .limit(1)
      .single();

    if (existingSub) {
      return NextResponse.json(
        { error: `This email already has an active subscription (${existingSub.plan} plan). Please sign in and use the dashboard to manage your subscription.` },
        { status: 409 }
      );
    }

    const priceId = getPriceId(plan, billing);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan. Please contact support.' },
        { status: 500 }
      );
    }

    // Plan display names for the checkout
    const planNames: Record<PlanId, string> = {
      single: 'ATLAS PRO — Starter',
      duo: 'ATLAS PRO — Advantage',
      suite: 'ATLAS PRO — Elite',
    };

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        billing,
        tradingview_username: tradingViewUsername,
        selected_indicators: indicators ? indicators.join(',') : '',
      },
      subscription_data: {
        metadata: {
          plan,
          tradingview_username: tradingViewUsername,
          selected_indicators: indicators ? indicators.join(',') : '',
        },
      },
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/checkout/cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
