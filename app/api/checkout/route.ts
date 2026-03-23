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
