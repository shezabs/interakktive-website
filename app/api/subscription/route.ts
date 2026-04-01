import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendCancellationEmail } from '@/app/lib/email';

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

        const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];
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
      // Try to cancel on Stripe first, but if Stripe fails (subscription already cancelled, etc.),
      // still update Supabase so the user's dashboard reflects the cancellation
      try {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } catch (stripeErr: any) {
        console.warn(`Stripe cancel warning (proceeding with Supabase update): ${stripeErr.message}`);
        // If the Stripe subscription is already cancelled or doesn't exist,
        // we still want to mark it as cancelled in our database
        if (stripeErr.message?.includes('No such subscription') || 
            stripeErr.message?.includes('cancelled') ||
            stripeErr.message?.includes('canceled')) {
          // Subscription is gone from Stripe — mark as fully cancelled
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscriptionId);
          return NextResponse.json({
            status: 'cancelled',
            message: 'Subscription cancelled.',
          });
        }
        // For other Stripe errors, still try to update Supabase
      }

      // Update Supabase — mark as cancelling but still active until period end
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'cancelling',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Supabase cancel update FAILED:', updateError);
        // If 'cancelling' status fails (constraint issue), try 'cancelled' instead
        const { error: fallbackError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);
        
        if (fallbackError) {
          console.error('Supabase cancel fallback also FAILED:', fallbackError);
          return NextResponse.json({ 
            error: 'Stripe cancelled but database update failed. Please contact support.' 
          }, { status: 500 });
        }
        
        return NextResponse.json({
          status: 'cancelled',
          message: 'Subscription cancelled.',
        });
      }

      console.log(`✅ Cancel: subscription ${subscriptionId} marked as cancelling in Supabase`);

      // Send cancellation email to customer
      const { data: cancelSub } = await supabaseAdmin
        .from('subscriptions')
        .select('user_email, plan, current_period_end')
        .eq('id', subscriptionId)
        .single();
      
      if (cancelSub) {
        await sendCancellationEmail({
          email: cancelSub.user_email,
          plan: cancelSub.plan,
          accessUntil: cancelSub.current_period_end,
        });
      }

      return NextResponse.json({
        status: 'cancelling',
        message: 'Your subscription will be cancelled at the end of your current billing period. You keep full access until then.',
      });
    }

    if (action === 'reactivate') {
      // Try to remove the cancellation on Stripe
      try {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: false,
        });
      } catch (stripeErr: any) {
        console.warn(`Stripe reactivate warning: ${stripeErr.message}`);
        // If Stripe sub is gone, we can't reactivate
        if (stripeErr.message?.includes('No such subscription') || 
            stripeErr.message?.includes('cancelled') ||
            stripeErr.message?.includes('canceled')) {
          return NextResponse.json({ 
            error: 'This subscription has already been fully cancelled and cannot be reactivated. Please purchase a new plan.' 
          }, { status: 400 });
        }
        return NextResponse.json({ error: stripeErr.message || 'Failed to reactivate on Stripe.' }, { status: 500 });
      }

      const { error: reactivateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (reactivateError) {
        console.error('Supabase reactivate update FAILED:', reactivateError);
        return NextResponse.json({ error: 'Stripe reactivated but database update failed. Please contact support.' }, { status: 500 });
      }

      console.log(`✅ Reactivate: subscription ${subscriptionId} marked as active in Supabase`);

      return NextResponse.json({
        status: 'active',
        message: 'Your subscription has been reactivated.',
      });
    }

    if (action === 'upgrade') {
      const { targetPlan: requestedPlan, indicators: requestedIndicators } = body as {
        targetPlan?: string;
        indicators?: string[];
      };

      // Get full subscription from Supabase for plan info
      const { data: fullSub } = await supabaseAdmin
        .from('subscriptions')
        .select('plan, billing, indicators')
        .eq('id', subscriptionId)
        .single();

      if (!fullSub) {
        return NextResponse.json({ error: 'Subscription details not found' }, { status: 404 });
      }

      const currentPlan = fullSub.plan;
      const billing = fullSub.billing;

      // Determine target plan — use requested or default to next tier
      let targetPlan = requestedPlan || (currentPlan === 'starter' ? 'advantage' : 'elite');

      // Validate upgrade direction
      const planOrder: Record<string, number> = { starter: 1, advantage: 2, elite: 3 };
      if ((planOrder[targetPlan] || 0) <= (planOrder[currentPlan] || 0)) {
        return NextResponse.json({ error: 'Can only upgrade to a higher plan' }, { status: 400 });
      }

      // Determine target price
      const priceMap: Record<string, string> = {
        'advantage_monthly': process.env.STRIPE_PRICE_ADVANTAGE_MONTHLY || '',
        'advantage_annual': process.env.STRIPE_PRICE_ADVANTAGE_ANNUAL || '',
        'elite_monthly': process.env.STRIPE_PRICE_ELITE_MONTHLY || '',
        'elite_annual': process.env.STRIPE_PRICE_ELITE_ANNUAL || '',
      };
      const newPriceId = priceMap[`${targetPlan}_${billing}`];
      if (!newPriceId) {
        return NextResponse.json({ error: 'Target price not configured' }, { status: 500 });
      }

      // Determine new indicators
      const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];
      let newIndicators: string[];
      if (targetPlan === 'elite') {
        newIndicators = allIndicators;
      } else if (requestedIndicators && requestedIndicators.length > 0) {
        newIndicators = requestedIndicators;
      } else {
        newIndicators = fullSub.indicators;
      }

      // Validate indicator count
      if (targetPlan === 'advantage' && newIndicators.length !== 2) {
        return NextResponse.json({ error: 'Advantage plan requires exactly 2 indicators' }, { status: 400 });
      }

      if (sub.stripe_subscription_id) {
        // Get the current Stripe subscription to find the item ID
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        const itemId = stripeSub.items.data[0]?.id;

        if (!itemId) {
          return NextResponse.json({ error: 'Could not find subscription item' }, { status: 500 });
        }

        // Update Stripe subscription with proration — Stripe charges the difference automatically
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          items: [{
            id: itemId,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        });
      }

      // Update Supabase
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: targetPlan,
          indicators: newIndicators,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      console.log(`✅ Upgrade: ${currentPlan} → ${targetPlan} | Indicators: ${newIndicators.join(', ')} (${subscriptionId})`);

      return NextResponse.json({
        status: 'upgraded',
        plan: targetPlan,
        indicators: newIndicators,
        message: `Upgraded to ${targetPlan}. The prorated difference has been charged to your card.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
