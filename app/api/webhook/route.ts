import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs raw body for signature verification
export const runtime = 'nodejs';

async function sendNotificationEmail(data: {
  email: string;
  tradingViewUsername: string;
  plan: string;
  billing: string;
  indicators: string;
  amount: string;
  stripeCustomerId: string;
  subscriptionId: string;
}) {
  // Send notification via Supabase Edge Function, or a simple email service
  // For now, log to console — replace with actual email sending
  console.log('=== NEW SUBSCRIPTION ===');
  console.log(`Email: ${data.email}`);
  console.log(`TradingView Username: ${data.tradingViewUsername}`);
  console.log(`Plan: ${data.plan} (${data.billing})`);
  console.log(`Indicators: ${data.indicators || 'Full Suite'}`);
  console.log(`Amount: ${data.amount}`);
  console.log(`Stripe Customer: ${data.stripeCustomerId}`);
  console.log(`Subscription: ${data.subscriptionId}`);
  console.log('========================');

  // TODO: Replace with actual email notification
  // Options:
  // 1. Resend (resend.com) — simple API, free tier
  // 2. Supabase Edge Function that sends email
  // 3. Stripe's built-in email receipts (already enabled by default)
  //
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'ATLAS <notifications@interakktive.com>',
  //   to: process.env.ADMIN_EMAIL || 'shezab@interakktive.com',
  //   subject: `New Subscription: ${data.tradingViewUsername} — ${data.plan}`,
  //   html: `
  //     <h2>New ATLAS Pro Subscription</h2>
  //     <p><strong>TradingView Username:</strong> ${data.tradingViewUsername}</p>
  //     <p><strong>Email:</strong> ${data.email}</p>
  //     <p><strong>Plan:</strong> ${data.plan} (${data.billing})</p>
  //     <p><strong>Indicators:</strong> ${data.indicators || 'Full Suite'}</p>
  //     <p><strong>Amount:</strong> ${data.amount}</p>
  //     <p>Grant TradingView access now.</p>
  //   `,
  // });
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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const tradingViewUsername = session.metadata?.tradingview_username || 'NOT PROVIDED';
      const plan = session.metadata?.plan || 'unknown';
      const billing = session.metadata?.billing || 'unknown';
      const indicators = session.metadata?.selected_indicators || '';

      await sendNotificationEmail({
        email: session.customer_email || 'unknown',
        tradingViewUsername,
        plan,
        billing,
        indicators,
        amount: session.amount_total
          ? `$${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}`
          : 'unknown',
        stripeCustomerId: typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id || 'unknown',
        subscriptionId: typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id || 'unknown',
      });

      // TODO: Update Supabase with subscription data
      // await supabase.from('customers').upsert({
      //   email: session.customer_email,
      //   tradingview_username: tradingViewUsername,
      //   stripe_customer_id: session.customer,
      //   stripe_subscription_id: session.subscription,
      //   plan,
      //   billing,
      //   status: 'active',
      //   indicators: indicators,
      // });

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription updated: ${subscription.id} — Status: ${subscription.status}`);

      // TODO: Update Supabase subscription status
      // await supabase.from('customers')
      //   .update({ status: subscription.status })
      //   .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription cancelled: ${subscription.id}`);

      // TODO: Update Supabase subscription status
      // await supabase.from('customers')
      //   .update({ status: 'cancelled' })
      //   .eq('stripe_subscription_id', subscription.id);

      // TODO: Send email to admin to revoke TradingView access

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Payment failed for invoice: ${invoice.id}`);

      // TODO: Notify admin and/or customer

      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
