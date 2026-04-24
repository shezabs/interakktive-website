import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog, getClientIp, requireCapability } from '@/app/lib/admin-auth';
import { getStripe } from '@/app/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET — returns the diff between Stripe and our DB (read-only preview)
 * POST — applies Stripe's state to our DB (after admin confirms)
 */

interface DiffField {
  field: string;
  dbValue: any;
  stripeValue: any;
  willChange: boolean;
}

async function buildDiff(subscriptionId: string) {
  const supabase = getSupabaseAdmin();
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();
  if (error || !sub) return { error: 'Subscription not found' as const };
  if (!sub.stripe_subscription_id) {
    return { error: 'This is a comp sub (no Stripe record). Nothing to sync.' as const };
  }

  let stripeSub: any;
  try {
    stripeSub = await getStripe().subscriptions.retrieve(sub.stripe_subscription_id);
  } catch (err: any) {
    return { error: `Stripe fetch failed: ${err.message}` as const };
  }

  // Map Stripe status → our DB status vocabulary
  const cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
  let dbStatus: string;
  if (stripeSub.status === 'active' && cancelAtPeriodEnd) dbStatus = 'cancelling';
  else if (stripeSub.status === 'active') dbStatus = 'active';
  else if (stripeSub.status === 'canceled') dbStatus = 'cancelled';
  else if (stripeSub.status === 'past_due') dbStatus = 'past_due';
  else dbStatus = stripeSub.status;

  const stripePeriodStart = stripeSub.current_period_start
    ? new Date(stripeSub.current_period_start * 1000).toISOString()
    : null;
  const stripePeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000).toISOString()
    : null;

  const diffs: DiffField[] = [
    { field: 'status', dbValue: sub.status, stripeValue: dbStatus, willChange: sub.status !== dbStatus },
    { field: 'current_period_start', dbValue: sub.current_period_start, stripeValue: stripePeriodStart, willChange: sub.current_period_start !== stripePeriodStart },
    { field: 'current_period_end', dbValue: sub.current_period_end, stripeValue: stripePeriodEnd, willChange: sub.current_period_end !== stripePeriodEnd },
  ];

  return {
    subscription: sub,
    stripeStatus: stripeSub.status,
    stripeCancelAtPeriodEnd: cancelAtPeriodEnd,
    diffs,
    anyChanges: diffs.some((d) => d.willChange),
    newValues: {
      status: dbStatus,
      current_period_start: stripePeriodStart,
      current_period_end: stripePeriodEnd,
    },
  };
}

// ── GET — preview the diff (no writes) ──
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireCapability('sub.stripe_sync');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit Stripe sync' : 'Unauthorized' },
      { status: check.status }
    );
  }

  const result = await buildDiff(params.id);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}

// ── POST — apply the sync (write Stripe's state into DB) ──
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireCapability('sub.stripe_sync');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit Stripe sync' : 'Unauthorized' },
      { status: check.status }
    );
  }
  const adminEmail = check.email;

  const result = await buildDiff(params.id);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (!result.anyChanges) {
    return NextResponse.json({ success: true, message: 'Already in sync, nothing to update.' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: after, error } = await supabase
      .from('subscriptions')
      .update({
        ...result.newValues,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;

    await writeAuditLog({
      adminEmail,
      action: 'subscription.stripe_sync',
      targetType: 'subscription',
      targetId: params.id,
      before: result.subscription,
      after,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, subscription: after });
  } catch (err: any) {
    console.error('Stripe sync error:', err);
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
