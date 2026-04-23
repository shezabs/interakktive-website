import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin, writeAuditLog, getClientIp } from '@/app/lib/admin-auth';
import { getStripe } from '@/app/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── GET — full subscription detail including Stripe live data ──
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();

    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', params.id)
      .single();
    if (error || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Related: swap history for this user
    const { data: swaps } = sub.user_id
      ? await supabase.from('swap_history').select('*').eq('user_id', sub.user_id).order('created_at', { ascending: false })
      : { data: [] };

    // Stripe live data (optional — fails gracefully)
    let stripeData: any = null;
    if (sub.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        const stripeSub: any = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
          expand: ['default_payment_method', 'latest_invoice'],
        });
        const pm = stripeSub.default_payment_method;
        const invoice = stripeSub.latest_invoice;
        stripeData = {
          status: stripeSub.status,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodStart: stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000).toISOString() : null,
          currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
          cardBrand: pm?.card?.brand || null,
          cardLast4: pm?.card?.last4 || null,
          latestInvoiceAmount: invoice?.amount_due || null,
          latestInvoiceStatus: invoice?.status || null,
          latestInvoiceUrl: invoice?.hosted_invoice_url || null,
          customerDashboardUrl: `https://dashboard.stripe.com/customers/${sub.stripe_customer_id}`,
        };
      } catch (err: any) {
        console.warn('Stripe retrieve failed:', err.message);
        stripeData = { error: err.message };
      }
    }

    return NextResponse.json({
      subscription: sub,
      swapHistory: swaps || [],
      stripe: stripeData,
    });
  } catch (err: any) {
    console.error('Sub detail error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load subscription' }, { status: 500 });
  }
}

// ── PATCH — various update actions ──
// Body must include { action, ... }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { action } = body;

    // Fetch current sub
    const { data: before, error: fetchErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', params.id)
      .single();
    if (fetchErr || !before) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // ── Change plan directly (bypass Stripe or sync based on flag) ──
    if (action === 'change_plan') {
      const { plan, indicators } = body;
      if (!['starter', 'advantage', 'elite'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];
      let newIndicators = indicators;
      if (plan === 'elite') newIndicators = allIndicators;
      if (plan === 'starter' && (!newIndicators || newIndicators.length !== 1)) {
        return NextResponse.json({ error: 'Starter requires exactly 1 indicator' }, { status: 400 });
      }
      if (plan === 'advantage' && (!newIndicators || newIndicators.length !== 2)) {
        return NextResponse.json({ error: 'Advantage requires exactly 2 indicators' }, { status: 400 });
      }

      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ plan, indicators: newIndicators, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;

      await writeAuditLog({
        adminEmail, action: 'subscription.change_plan', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Change indicators only (keeps plan) ──
    if (action === 'change_indicators') {
      const { indicators } = body;
      if (!Array.isArray(indicators) || indicators.length === 0) {
        return NextResponse.json({ error: 'Indicators required' }, { status: 400 });
      }
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ indicators, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;

      await writeAuditLog({
        adminEmail, action: 'subscription.change_indicators', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Force cancel (with Stripe sync) ──
    if (action === 'force_cancel') {
      const { immediate } = body; // if true, cancel now; else end of period
      if (before.stripe_subscription_id) {
        try {
          const stripe = getStripe();
          if (immediate) {
            await stripe.subscriptions.cancel(before.stripe_subscription_id);
          } else {
            await stripe.subscriptions.update(before.stripe_subscription_id, { cancel_at_period_end: true });
          }
        } catch (stripeErr: any) {
          console.warn('Stripe cancel warning:', stripeErr.message);
        }
      }

      const newStatus = immediate ? 'cancelled' : 'cancelling';
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;

      await writeAuditLog({
        adminEmail, action: `subscription.force_cancel${immediate ? '_immediate' : ''}`,
        targetType: 'subscription', targetId: params.id, before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Reactivate ──
    if (action === 'reactivate') {
      if (before.stripe_subscription_id) {
        try {
          const stripe = getStripe();
          await stripe.subscriptions.update(before.stripe_subscription_id, { cancel_at_period_end: false });
        } catch (stripeErr: any) {
          console.warn('Stripe reactivate warning:', stripeErr.message);
        }
      }
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: 'subscription.reactivate', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Reset swap ──
    if (action === 'reset_swap') {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ swap_used: false, swap_reset_date: resetDate.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: 'subscription.reset_swap', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Extend period (add N days to current_period_end) ──
    if (action === 'extend_period') {
      const { days } = body;
      if (!days || typeof days !== 'number' || days <= 0) {
        return NextResponse.json({ error: 'Valid days (positive number) required' }, { status: 400 });
      }
      const currentEnd = before.current_period_end ? new Date(before.current_period_end) : new Date();
      const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ current_period_end: newEnd.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: 'subscription.extend_period', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Mark TV invite sent ──
    if (action === 'mark_tv_invite') {
      const { sent } = body;
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ tv_invite_sent: !!sent, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: `subscription.mark_tv_invite_${sent ? 'sent' : 'unsent'}`,
        targetType: 'subscription', targetId: params.id, before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Update admin notes ──
    if (action === 'update_notes') {
      const { notes } = body;
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: 'subscription.update_notes', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    // ── Update TV username on sub ──
    if (action === 'update_tv_username') {
      const { tradingviewUsername } = body;
      const { data: after, error } = await supabase
        .from('subscriptions')
        .update({ tradingview_username: tradingviewUsername, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();
      if (error) throw error;
      await writeAuditLog({
        adminEmail, action: 'subscription.update_tv_username', targetType: 'subscription', targetId: params.id,
        before, after, ipAddress: getClientIp(req),
      });
      return NextResponse.json({ subscription: after });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Sub PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}

// ── DELETE — remove a subscription row entirely ──
// Does NOT cancel Stripe automatically (could be an orphan cleanup)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const { data: before } = await supabase.from('subscriptions').select('*').eq('id', params.id).single();
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { error } = await supabase.from('subscriptions').delete().eq('id', params.id);
    if (error) throw error;

    await writeAuditLog({
      adminEmail, action: 'subscription.delete', targetType: 'subscription', targetId: params.id,
      before, after: null, ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Sub DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
