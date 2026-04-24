import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog, getClientIp, requireCapability } from '@/app/lib/admin-auth';
import { getStripe } from '@/app/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET — list refundable charges for this subscription
 * POST — create a refund
 */

// ── GET ──
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireCapability('sub.refund');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit refunds' : 'Unauthorized' },
      { status: check.status }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', params.id).single();
    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    if (!sub.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer — comp sub cannot be refunded' }, { status: 400 });
    }

    // List last 10 invoices for this customer, filter to this subscription
    const stripe = getStripe();
    const invoices = await stripe.invoices.list({
      customer: sub.stripe_customer_id,
      subscription: sub.stripe_subscription_id || undefined,
      limit: 10,
    });

    // For each invoice, pull the charge so we know the refundable amount
    const charges: any[] = [];
    for (const inv of invoices.data) {
      if (!inv.charge || inv.status !== 'paid') continue;
      const chargeId = typeof inv.charge === 'string' ? inv.charge : inv.charge.id;
      try {
        const charge = await stripe.charges.retrieve(chargeId);
        charges.push({
          chargeId: charge.id,
          invoiceId: inv.id,
          invoiceNumber: inv.number,
          amount: charge.amount,
          amountRefunded: charge.amount_refunded,
          amountRefundable: charge.amount - charge.amount_refunded,
          currency: charge.currency.toUpperCase(),
          paidAt: charge.created ? new Date(charge.created * 1000).toISOString() : null,
          status: charge.status,
          refunded: charge.refunded,
          invoiceUrl: inv.hosted_invoice_url || null,
        });
      } catch (err) {
        console.warn(`Could not fetch charge ${chargeId}:`, err);
      }
    }

    return NextResponse.json({ charges });
  } catch (err: any) {
    console.error('Refund list error:', err);
    return NextResponse.json({ error: err.message || 'Failed to list refundable charges' }, { status: 500 });
  }
}

// ── POST — create refund ──
// Body: { chargeId, amountCents?, reason? }
// If amountCents omitted → full refund
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireCapability('sub.refund');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit refunds' : 'Unauthorized' },
      { status: check.status }
    );
  }
  const adminEmail = check.email;

  try {
    const supabase = getSupabaseAdmin();
    const { chargeId, amountCents, reason } = await req.json();
    if (!chargeId) return NextResponse.json({ error: 'chargeId required' }, { status: 400 });

    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', params.id).single();
    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

    const stripe = getStripe();
    // Validate charge belongs to this customer
    const charge = await stripe.charges.retrieve(chargeId);
    if (charge.customer !== sub.stripe_customer_id) {
      return NextResponse.json({ error: 'Charge does not belong to this subscription customer' }, { status: 400 });
    }

    // Create the refund
    const refundParams: any = {
      charge: chargeId,
      reason: reason && ['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason) ? reason : 'requested_by_customer',
    };
    if (amountCents && typeof amountCents === 'number' && amountCents > 0) {
      refundParams.amount = amountCents;
    }

    const refund = await stripe.refunds.create(refundParams);

    await writeAuditLog({
      adminEmail,
      action: 'subscription.refund',
      targetType: 'subscription',
      targetId: params.id,
      before: null,
      after: {
        refund_id: refund.id,
        charge_id: chargeId,
        amount_cents: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
        status: refund.status,
      },
    });
  } catch (err: any) {
    console.error('Refund create error:', err);
    return NextResponse.json({ error: err.message || 'Refund failed' }, { status: 500 });
  }
}
