import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { notifyNewSubscription, notifyCancellation, sendWelcomeEmail } from '@/app/lib/email';

export const runtime = 'nodejs';

// Use service role key for webhook — bypasses RLS
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars for webhook');
  }
  return createClient(url, serviceKey);
}

// Map Stripe plan IDs to our plan names
function getPlanFromPriceId(priceId: string): { plan: string; billing: string } | null {
  const map: Record<string, { plan: string; billing: string }> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY || '']: { plan: 'starter', billing: 'monthly' },
    [process.env.STRIPE_PRICE_STARTER_ANNUAL || '']: { plan: 'starter', billing: 'annual' },
    [process.env.STRIPE_PRICE_ADVANTAGE_MONTHLY || '']: { plan: 'advantage', billing: 'monthly' },
    [process.env.STRIPE_PRICE_ADVANTAGE_ANNUAL || '']: { plan: 'advantage', billing: 'annual' },
    [process.env.STRIPE_PRICE_ELITE_MONTHLY || '']: { plan: 'elite', billing: 'monthly' },
    [process.env.STRIPE_PRICE_ELITE_ANNUAL || '']: { plan: 'elite', billing: 'annual' },
  };
  return map[priceId] || null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    // ── CHECKOUT COMPLETED — Create subscription in Supabase ──
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_email || '';
      const tradingViewUsername = session.metadata?.tradingview_username || '';
      const plan = session.metadata?.plan || 'starter';
      const billing = session.metadata?.billing || 'monthly';
      const indicatorsRaw = session.metadata?.selected_indicators || '';
      const indicators = indicatorsRaw ? indicatorsRaw.split(',').map(s => s.trim()) : [];

      // If elite, ensure all 4 indicators
      const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO'];
      const finalIndicators = plan === 'suite' || plan === 'elite' ? allIndicators : indicators;

      const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || '';
      const stripeSubscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id || '';

      // Try to find the Supabase user by email
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const matchedUser = userList?.users?.find(u => u.email === email);

      // Calculate period end
      const now = new Date();
      const periodEnd = new Date(now);
      if (billing === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Normalise plan name (checkout sends 'single'/'duo'/'suite', db expects 'starter'/'advantage'/'elite')
      const planMap: Record<string, string> = { single: 'starter', duo: 'advantage', suite: 'elite' };
      const normalisedPlan = planMap[plan] || plan;

      // Calculate swap reset date — always 1 month from now regardless of billing cycle
      // First month: swap_used = true (they just chose their indicators)
      // After 1 month: swap resets, they can swap once
      const swapResetDate = new Date(now);
      swapResetDate.setMonth(swapResetDate.getMonth() + 1);

      // Insert subscription
      const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
        user_id: matchedUser?.id || null,
        user_email: email,
        tradingview_username: tradingViewUsername,
        plan: normalisedPlan,
        billing,
        indicators: finalIndicators,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status: 'active',
        swap_used: true, // First month — they already chose their indicators
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        swap_reset_date: swapResetDate.toISOString(), // Resets monthly, not at billing cycle
      });

      if (insertError) {
        console.error('Failed to insert subscription:', insertError);
      } else {
        console.log(`✅ Subscription created: ${email} — ${normalisedPlan} (${billing}) — ${finalIndicators.join(', ')}`);
        
        // Send email notifications
        await notifyNewSubscription({
          email,
          tradingviewUsername: tradingViewUsername,
          plan: normalisedPlan,
          billing,
          indicators: finalIndicators,
          isUpgrade,
        });
        await sendWelcomeEmail({
          email,
          plan: normalisedPlan,
          indicators: finalIndicators,
        });
      }

      // Handle upgrade: cancel old subscription after new one is created
      const isUpgrade = session.metadata?.is_upgrade === 'true';
      if (isUpgrade) {
        const prevSubId = session.metadata?.previous_subscription_id;
        const prevStripeSubId = session.metadata?.previous_stripe_subscription_id;

        // Cancel old Stripe subscription with proration refund
        if (prevStripeSubId) {
          try {
            await getStripe().subscriptions.cancel(prevStripeSubId, {
              prorate: true,
            });
            console.log(`✅ Old Stripe subscription cancelled: ${prevStripeSubId}`);
          } catch (err) {
            console.error('Failed to cancel old Stripe subscription:', err);
          }
        }

        // Mark old Supabase subscription as cancelled
        if (prevSubId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', prevSubId);
          console.log(`✅ Old subscription cancelled in Supabase: ${prevSubId}`);
        }
      }

      // Log for admin notification
      console.log('=== NEW SUBSCRIPTION ===');
      console.log(`Email: ${email}`);
      console.log(`TradingView: ${tradingViewUsername}`);
      console.log(`Plan: ${normalisedPlan} (${billing})`);
      console.log(`Indicators: ${finalIndicators.join(', ')}`);
      console.log(`Stripe Customer: ${stripeCustomerId}`);
      console.log(`Subscription: ${stripeSubscriptionId}`);
      console.log('========================');

      break;
    }

    // ── SUBSCRIPTION UPDATED — Sync status + reset swap on renewal ──
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubId = subscription.id;
      const stripeStatus = subscription.status;
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;

      // Get period end from Stripe
      const subObj = subscription as any;
      const periodEnd = new Date((subObj.current_period_end || Math.floor(Date.now() / 1000)) * 1000);
      const periodStart = new Date((subObj.current_period_start || Math.floor(Date.now() / 1000)) * 1000);

      // Guard: if period start and end are the same (100% coupon), calculate correct end
      // Stripe sometimes sets both to the same timestamp for $0 subscriptions
      let correctedPeriodEnd = periodEnd;
      const diffMs = Math.abs(periodEnd.getTime() - periodStart.getTime());
      if (diffMs < 60000) { // Less than 1 minute apart — treat as identical
        // Look up the billing cycle from our database to calculate correct end
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('billing, current_period_end')
          .eq('stripe_subscription_id', stripeSubId)
          .single();
        
        if (existingSub) {
          // If our DB already has a correct period end (set by checkout handler), keep it
          const existingEnd = new Date(existingSub.current_period_end);
          if (existingEnd > periodStart) {
            correctedPeriodEnd = existingEnd;
          } else {
            // Calculate from billing cycle
            correctedPeriodEnd = new Date(periodStart);
            if (existingSub.billing === 'annual') {
              correctedPeriodEnd.setFullYear(correctedPeriodEnd.getFullYear() + 1);
            } else {
              correctedPeriodEnd.setMonth(correctedPeriodEnd.getMonth() + 1);
            }
          }
        }
      }

      // Determine the correct status for our database
      // If Stripe says active but cancel_at_period_end is true, keep as 'cancelling'
      let dbStatus: string;
      if (cancelAtPeriodEnd) {
        dbStatus = 'cancelling';
      } else if (stripeStatus === 'active') {
        dbStatus = 'active';
      } else if (stripeStatus === 'past_due') {
        dbStatus = 'past_due';
      } else {
        dbStatus = stripeStatus;
      }

      // Safeguard: don't overwrite a subscription that was just created by checkout handler
      // This prevents race conditions where subscription.updated fires right after checkout.completed
      if (dbStatus === 'cancelling') {
        const { data: currentRow } = await supabaseAdmin
          .from('subscriptions')
          .select('status, created_at')
          .eq('stripe_subscription_id', stripeSubId)
          .single();
        
        if (currentRow) {
          const createdAt = new Date(currentRow.created_at);
          const ageMs = Date.now() - createdAt.getTime();
          // If subscription was created less than 2 minutes ago and is currently active,
          // don't overwrite to cancelling — the checkout handler just set it to active
          if (ageMs < 120000 && currentRow.status === 'active') {
            console.log(`⚠️ Skipping cancelling status for newly created subscription: ${stripeSubId} (age: ${Math.round(ageMs/1000)}s)`);
            dbStatus = 'active';
          }
        }
      }

      // Update subscription status and period
      // NOTE: swap_used and swap_reset_date are NOT updated here
      // Swap resets are handled by the dashboard based on swap_reset_date
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: dbStatus,
          current_period_start: periodStart.toISOString(),
          current_period_end: correctedPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubId);

      if (updateError) {
        console.error('Failed to update subscription:', updateError);
      } else {
        console.log(`✅ Subscription updated: ${stripeSubId} — ${dbStatus} (stripe: ${stripeStatus}, cancel_at_period_end: ${cancelAtPeriodEnd})`);
      }

      break;
    }

    // ── SUBSCRIPTION CANCELLED ──
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // Get subscription details before updating
      const { data: cancelledSub } = await supabaseAdmin
        .from('subscriptions')
        .select('user_email, tradingview_username, plan')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      const { error: cancelError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (cancelError) {
        console.error('Failed to cancel subscription:', cancelError);
      } else {
        console.log(`❌ Subscription cancelled: ${subscription.id}`);
        
        // Send cancellation email to admin
        if (cancelledSub) {
          await notifyCancellation({
            email: cancelledSub.user_email,
            tradingviewUsername: cancelledSub.tradingview_username,
            plan: cancelledSub.plan,
          });
        }
      }

      break;
    }

    // ── PAYMENT FAILED ──
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceObj = invoice as any;
      const stripeSubId = typeof invoiceObj.subscription === 'string'
        ? invoiceObj.subscription
        : invoiceObj.subscription?.id || '';

      if (stripeSubId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubId);
      }

      console.log(`⚠️ Payment failed: ${invoice.id}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
