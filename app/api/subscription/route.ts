import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
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
    const { subscriptionId, action } = body as {
      subscriptionId: string;
      action: 'cancel' | 'reactivate' | 'upgrade';
    };

    if (!subscriptionId || !action) {
      return NextResponse.json({ error: 'Missing subscriptionId or action' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the subscription from Supabase to find the Stripe subscription ID
    const { data: sub, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (!sub.stripe_subscription_id) {
      // No Stripe subscription ID — manual subscription, update Supabase directly
      if (action === 'cancel') {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);
        return NextResponse.json({ status: 'cancelled', message: 'Subscription cancelled.' });
      }
      if (action === 'upgrade') {
        // Get current plan
        const { data: fullSub } = await supabaseAdmin
          .from('subscriptions')
          .select('plan, indicators')
          .eq('id', subscriptionId)
          .single();
        if (!fullSub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO'];
        const targetPlan = fullSub.plan === 'starter' ? 'advantage' : 'elite';
        const newIndicators = targetPlan === 'elite' ? allIndicators : fullSub.indicators;

        await supabaseAdmin
          .from('subscriptions')
          .update({ plan: targetPlan, indicators: newIndicators, updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);

        return NextResponse.json({ status: 'upgraded', plan: targetPlan, message: `Upgraded to ${targetPlan}. Contact support for billing adjustment.` });
      }
      if (action === 'reactivate') {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', subscriptionId);
        return NextResponse.json({ status: 'active', message: 'Subscription reactivated.' });
      }
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const stripe = getStripe();

    if (action === 'cancel') {
      // Cancel at end of current period (user keeps access until then)
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Update Supabase — mark as cancelling but still active until period end
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'cancelling',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      return NextResponse.json({
        status: 'cancelling',
        message: 'Your subscription will be cancelled at the end of your current billing period. You keep full access until then.',
      });
    }

    if (action === 'reactivate') {
      // Remove the cancellation
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      return NextResponse.json({
        status: 'active',
        message: 'Your subscription has been reactivated.',
      });
    }

    if (action === 'upgrade') {
      // Get full subscription from Supabase for plan info
      const { data: fullSub } = await supabaseAdmin
        .from('subscriptions')
        .select('plan, billing, indicators')
        .eq('id', subscriptionId)
        .single();

      if (!fullSub) {
        return NextResponse.json({ error: 'Subscription details not found' }, { status: 404 });
      }

      // Determine target plan and price
      const currentPlan = fullSub.plan;
      const billing = fullSub.billing;
      let targetPlan: string;
      let targetPriceEnv: string;

      if (currentPlan === 'starter') {
        targetPlan = 'advantage';
        targetPriceEnv = billing === 'annual' ? 'STRIPE_PRICE_ADVANTAGE_ANNUAL' : 'STRIPE_PRICE_ADVANTAGE_MONTHLY';
      } else if (currentPlan === 'advantage') {
        targetPlan = 'elite';
        targetPriceEnv = billing === 'annual' ? 'STRIPE_PRICE_ELITE_ANNUAL' : 'STRIPE_PRICE_ELITE_MONTHLY';
      } else {
        return NextResponse.json({ error: 'Already on the highest plan' }, { status: 400 });
      }

      const newPriceId = process.env[targetPriceEnv];
      if (!newPriceId) {
        return NextResponse.json({ error: 'Target price not configured' }, { status: 500 });
      }

      if (sub.stripe_subscription_id) {
        // Get the current Stripe subscription to find the item ID
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        const itemId = stripeSub.items.data[0]?.id;

        if (!itemId) {
          return NextResponse.json({ error: 'Could not find subscription item' }, { status: 500 });
        }

        // Update Stripe subscription with proration
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          items: [{
            id: itemId,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        });
      }

      // Update Supabase
      const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO'];
      const newIndicators = targetPlan === 'elite' ? allIndicators : fullSub.indicators;

      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: targetPlan,
          indicators: newIndicators,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      console.log(`✅ Upgrade: ${currentPlan} → ${targetPlan} (${subscriptionId})`);

      return NextResponse.json({
        status: 'upgraded',
        plan: targetPlan,
        message: `Upgraded to ${targetPlan}. Stripe will prorate the charge.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
