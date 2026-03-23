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
      action: 'cancel' | 'reactivate';
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
      return NextResponse.json({ error: 'Cannot reactivate a manual subscription' }, { status: 400 });
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
