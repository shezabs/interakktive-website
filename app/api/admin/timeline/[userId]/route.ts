import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const safeQuery = async (fn: () => any): Promise<{ data: any[] }> => {
  try {
    const res = await fn();
    return { data: res.data || [] };
  } catch {
    return { data: [] };
  }
};

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  description: string;
  icon: string;
  tone: 'positive' | 'negative' | 'warning' | 'neutral' | 'info';
  meta?: any;
}

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const userId = params.userId;

    // Fetch the user
    const { data: userRes } = await supabase.auth.admin.getUserById(userId);
    if (!userRes?.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const user = userRes.user;

    // Pull every type of event about this user
    const [subsByIdRes, subsByEmailRes, propAccountsRes, swapsRes, auditRes, certsRes, progressRes] = await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      user.email ? supabase.from('subscriptions').select('*').eq('user_email', user.email) : Promise.resolve({ data: [] }),
      supabase.from('prop_accounts').select('*').eq('user_id', userId),
      supabase.from('swap_history').select('*').eq('user_id', userId),
      supabase.from('admin_audit_log').select('*').eq('target_id', userId).order('created_at', { ascending: false }),
      safeQuery(() => supabase.from('academy_certificates').select('*').eq('user_id', userId)),
      safeQuery(() => supabase.from('academy_progress').select('*').eq('user_id', userId)),
    ]);

    const events: TimelineEvent[] = [];

    // Signup event (always first)
    events.push({
      id: `signup-${user.id}`,
      type: 'signup',
      timestamp: user.created_at,
      title: 'Account created',
      description: `Signed up via ${user.app_metadata?.provider || 'email'}`,
      icon: 'UserPlus',
      tone: 'positive',
      meta: { provider: user.app_metadata?.provider },
    });

    // Email confirmed
    if (user.email_confirmed_at) {
      events.push({
        id: `email-confirmed-${user.id}`,
        type: 'email_confirmed',
        timestamp: user.email_confirmed_at,
        title: 'Email verified',
        description: 'Email address confirmed',
        icon: 'CheckCircle',
        tone: 'positive',
      });
    }

    // Last sign in
    if (user.last_sign_in_at) {
      events.push({
        id: `last-signin-${user.id}`,
        type: 'last_signin',
        timestamp: user.last_sign_in_at,
        title: 'Last sign-in',
        description: 'Signed into the site',
        icon: 'LogIn',
        tone: 'neutral',
      });
    }

    // Subscriptions (merge by id to dedupe)
    const allSubs = [
      ...(subsByIdRes.data || []),
      ...(subsByEmailRes.data || []),
    ];
    const seenSubs = new Set<string>();
    for (const sub of allSubs) {
      if (seenSubs.has(sub.id)) continue;
      seenSubs.add(sub.id);

      events.push({
        id: `sub-created-${sub.id}`,
        type: 'subscription_created',
        timestamp: sub.created_at,
        title: `Subscribed to ${sub.plan} plan`,
        description: `${sub.billing} billing · ${(sub.indicators || []).join(', ')}${sub.stripe_subscription_id ? '' : ' · Comp'}`,
        icon: 'CreditCard',
        tone: 'positive',
        meta: { subscriptionId: sub.id, plan: sub.plan, billing: sub.billing },
      });

      if (sub.status === 'cancelling' || sub.status === 'cancelled') {
        events.push({
          id: `sub-cancelled-${sub.id}`,
          type: 'subscription_cancelled',
          timestamp: sub.updated_at,
          title: sub.status === 'cancelled' ? 'Subscription cancelled' : 'Subscription set to cancel',
          description: sub.status === 'cancelled' ? 'Access revoked' : `Access until ${new Date(sub.current_period_end).toLocaleDateString()}`,
          icon: 'XCircle',
          tone: 'negative',
          meta: { subscriptionId: sub.id },
        });
      }

      if (sub.status === 'past_due') {
        events.push({
          id: `sub-past-due-${sub.id}`,
          type: 'subscription_past_due',
          timestamp: sub.updated_at,
          title: 'Payment failed',
          description: 'Subscription marked past due',
          icon: 'AlertTriangle',
          tone: 'negative',
          meta: { subscriptionId: sub.id },
        });
      }

      if (sub.tv_invite_sent) {
        events.push({
          id: `tv-invite-${sub.id}`,
          type: 'tv_invite_sent',
          timestamp: sub.updated_at,
          title: 'TradingView invite sent',
          description: `Granted access to ${(sub.indicators || []).join(', ')}`,
          icon: 'Send',
          tone: 'positive',
          meta: { subscriptionId: sub.id },
        });
      }
    }

    // Prop accounts
    for (const acc of propAccountsRes.data || []) {
      events.push({
        id: `prop-${acc.id}`,
        type: 'prop_account_created',
        timestamp: acc.created_at,
        title: `Created prop account: ${acc.name}`,
        description: `${acc.account_type || 'prop_challenge'} · ${acc.currency || 'USD'} ${acc.balance?.toLocaleString()}`,
        icon: 'BarChart3',
        tone: 'info',
        meta: { accountId: acc.id },
      });
    }

    // Indicator swaps
    for (const swap of swapsRes.data || []) {
      events.push({
        id: `swap-${swap.id}`,
        type: 'indicator_swap',
        timestamp: swap.created_at,
        title: 'Indicator swap',
        description: `${(swap.old_indicators || []).join(', ')} → ${(swap.new_indicators || []).join(', ')}`,
        icon: 'RotateCw',
        tone: 'info',
      });
    }

    // Audit log entries targeting this user
    for (const entry of auditRes.data || []) {
      events.push({
        id: `audit-${entry.id}`,
        type: 'admin_action',
        timestamp: entry.created_at,
        title: `Admin action: ${entry.action}`,
        description: `${entry.admin_email.split('@')[0]} ran ${entry.action}`,
        icon: 'Shield',
        tone: 'warning',
        meta: { auditId: entry.id },
      });
    }

    // Academy certificates
    for (const cert of certsRes.data || []) {
      events.push({
        id: `cert-${cert.id}`,
        type: 'certificate_earned',
        timestamp: cert.issued_at,
        title: 'Academy certificate earned',
        description: `Lesson: ${cert.lesson_id}`,
        icon: 'Award',
        tone: 'positive',
      });
    }

    // Academy lesson completions
    for (const prog of progressRes.data || []) {
      if (prog.completed_at) {
        events.push({
          id: `lesson-${prog.id}`,
          type: 'lesson_completed',
          timestamp: prog.completed_at,
          title: 'Academy lesson completed',
          description: `${prog.lesson_id} · Score: ${prog.quiz_score || 'n/a'}%`,
          icon: 'BookOpen',
          tone: 'positive',
        });
      }
    }

    // Sort all events chronologically (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmed: !!user.email_confirmed_at,
        provider: user.app_metadata?.provider || 'email',
        tradingviewUsername: user.user_metadata?.tradingview_username || null,
      },
      events,
      totalEvents: events.length,
    });
  } catch (err: any) {
    console.error('Timeline error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load timeline' }, { status: 500 });
  }
}
