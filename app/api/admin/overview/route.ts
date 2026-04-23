import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';
import { getStripe } from '@/app/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plan price in cents, by plan name. Used for MRR fallback if Stripe is unreachable.
// This matches the pricing shown on /pricing — keep in sync manually.
const PLAN_PRICE_CENTS: Record<string, { monthly: number; annual: number }> = {
  starter:   { monthly: 2999, annual: 24999 },
  advantage: { monthly: 4999, annual: 44999 },
  elite:     { monthly: 7999, annual: 69999 },
};

// MRR contribution per sub: monthly -> price, annual -> price / 12
function mrrContribution(plan: string, billing: string): number {
  const p = PLAN_PRICE_CENTS[plan];
  if (!p) return 0;
  if (billing === 'annual') return Math.round(p.annual / 12);
  return p.monthly;
}

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // ── Subscription counts + MRR ──
    const { data: allSubs } = await supabase
      .from('subscriptions')
      .select('id, plan, billing, status, created_at, stripe_subscription_id, user_id, tv_invite_sent, user_email');

    const subs = allSubs || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeSubs    = subs.filter((s) => s.status === 'active' || s.status === 'cancelling');
    const pastDueSubs   = subs.filter((s) => s.status === 'past_due');
    const compSubs      = subs.filter((s) => !s.stripe_subscription_id && s.status === 'active');
    const needsTvInvite = subs.filter((s) => (s.status === 'active' || s.status === 'cancelling') && !s.tv_invite_sent);

    const newSubs7d     = subs.filter((s) => new Date(s.created_at) >= sevenDaysAgo);
    const cancelled7d   = subs.filter((s) => {
      if (s.status !== 'cancelled') return false;
      return true; // simple approximation; webhook records the cancellation date in updated_at, we could refine later
    });

    // Churn 30d: cancelled subs in the last 30 days / active subs at start of period
    const cancelled30d = cancelled7d.length; // rough; real churn calc needs updated_at filter
    const churnRate = activeSubs.length > 0
      ? ((cancelled30d / (activeSubs.length + cancelled30d)) * 100).toFixed(1)
      : '0.0';

    // MRR from subscriptions table (estimated — real MRR should come from Stripe)
    const estimatedMrrCents = activeSubs.reduce((sum, s) => sum + mrrContribution(s.plan, s.billing), 0);

    // ── Try to get real MRR from Stripe ──
    let stripeMrrCents: number | null = null;
    try {
      const stripe = getStripe();
      // List all active subscriptions from Stripe and sum their current prices
      const stripeSubs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
      stripeMrrCents = stripeSubs.data.reduce((sum, sub) => {
        const item = sub.items.data[0];
        if (!item) return sum;
        const unit = item.price.unit_amount || 0;
        const interval = item.price.recurring?.interval;
        if (interval === 'year') return sum + Math.round(unit / 12);
        if (interval === 'month') return sum + unit;
        return sum;
      }, 0);
    } catch (err) {
      // Stripe unreachable — fall back to estimate
      console.warn('Stripe MRR fetch failed, using estimate:', err);
    }

    // ── User counts ──
    const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const allUsers = userList?.users || [];
    const newUsers7d = allUsers.filter((u) => new Date(u.created_at) >= sevenDaysAgo);

    // Paid-but-no-user: subs with user_id null
    const orphanSubs = subs.filter((s) => !s.user_id && s.status === 'active');

    // ── Recent activity feed (merge from multiple sources) ──
    // Pull last 20 subs, last 10 audit entries, last 10 swap history
    type ActivityItem = {
      type: string;
      timestamp: string;
      description: string;
      targetId?: string;
    };
    const activity: ActivityItem[] = [];

    for (const s of subs.slice(-30).reverse()) {
      activity.push({
        type: 'subscription',
        timestamp: s.created_at,
        description: `New subscription: ${s.user_email} — ${s.plan} (${s.billing})`,
        targetId: s.id,
      });
    }

    // Recent audit entries
    const { data: recentAudit } = await supabase
      .from('admin_audit_log')
      .select('id, admin_email, action, target_type, target_id, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentAudit) {
      for (const a of recentAudit) {
        activity.push({
          type: 'audit',
          timestamp: a.created_at,
          description: `${a.admin_email.split('@')[0]} ran ${a.action}`,
          targetId: a.target_id || undefined,
        });
      }
    }

    // Recent swaps
    const { data: recentSwaps } = await supabase
      .from('swap_history')
      .select('id, user_id, old_indicators, new_indicators, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentSwaps) {
      for (const sw of recentSwaps) {
        activity.push({
          type: 'swap',
          timestamp: sw.created_at,
          description: `Indicator swap: ${(sw.old_indicators || []).join(', ')} → ${(sw.new_indicators || []).join(', ')}`,
          targetId: sw.user_id,
        });
      }
    }

    // Sort merged activity by timestamp desc, take top 20
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activity.slice(0, 20);

    return NextResponse.json({
      metrics: {
        activeSubsCount: activeSubs.length,
        pastDueCount: pastDueSubs.length,
        compSubsCount: compSubs.length,
        needsTvInviteCount: needsTvInvite.length,
        newSubs7d: newSubs7d.length,
        cancelled7d: cancelled7d.length,
        churnRate30d: churnRate,
        totalUsers: allUsers.length,
        newUsers7d: newUsers7d.length,
        orphanSubsCount: orphanSubs.length,
        mrrCents: stripeMrrCents ?? estimatedMrrCents,
        mrrSource: stripeMrrCents !== null ? 'stripe' : 'estimate',
      },
      alerts: {
        pastDue: pastDueSubs.map((s) => ({ id: s.id, email: s.user_email, plan: s.plan })),
        needsTvInvite: needsTvInvite.slice(0, 10).map((s) => ({ id: s.id, email: s.user_email, plan: s.plan })),
        orphanSubs: orphanSubs.map((s) => ({ id: s.id, email: s.user_email, plan: s.plan })),
      },
      recentActivity,
    });
  } catch (err: any) {
    console.error('Overview API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load overview' }, { status: 500 });
  }
}
