import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin, writeAuditLog, getClientIp, requireCapability } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── GET — list all subscriptions ──
export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscriptions: subs || [] });
  } catch (err: any) {
    console.error('Subscriptions list error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load subscriptions' }, { status: 500 });
  }
}

// ── POST — grant a comp (complimentary) subscription ──
// Body: { email, plan, billing, indicators, tradingviewUsername, note }
export async function POST(req: NextRequest) {
  const check = await requireCapability('sub.grant_comp');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit granting comp subs' : 'Unauthorized' },
      { status: check.status }
    );
  }
  const adminEmail = check.email;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { email, plan, billing, indicators, tradingviewUsername, note } = body;

    if (!email || !plan || !billing) {
      return NextResponse.json({ error: 'Missing required fields: email, plan, billing' }, { status: 400 });
    }
    if (!['starter', 'advantage', 'elite'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!['monthly', 'annual'].includes(billing)) {
      return NextResponse.json({ error: 'Invalid billing' }, { status: 400 });
    }

    // Normalise indicators
    const allIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];
    let finalIndicators: string[];
    if (plan === 'elite') {
      finalIndicators = allIndicators;
    } else if (Array.isArray(indicators) && indicators.length > 0) {
      finalIndicators = indicators;
    } else {
      return NextResponse.json({ error: 'Indicators required for non-elite plans' }, { status: 400 });
    }

    if (plan === 'starter' && finalIndicators.length !== 1) {
      return NextResponse.json({ error: 'Starter plan requires exactly 1 indicator' }, { status: 400 });
    }
    if (plan === 'advantage' && finalIndicators.length !== 2) {
      return NextResponse.json({ error: 'Advantage plan requires exactly 2 indicators' }, { status: 400 });
    }

    // Try to match an existing auth user by email
    const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const matchedUser = userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    // Calculate period end
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const swapResetDate = new Date(now);
    swapResetDate.setMonth(swapResetDate.getMonth() + 1);

    const newRow = {
      user_id: matchedUser?.id || null,
      user_email: email.toLowerCase(),
      tradingview_username: tradingviewUsername || '',
      plan,
      billing,
      indicators: finalIndicators,
      stripe_customer_id: null,
      stripe_subscription_id: null, // comp sub — no Stripe record
      status: 'active',
      swap_used: true, // choose indicators now, no swap until reset
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      swap_reset_date: swapResetDate.toISOString(),
      tv_invite_sent: false,
      admin_notes: note || 'Comp subscription granted by admin',
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('subscriptions')
      .insert(newRow)
      .select()
      .single();

    if (insertErr) throw insertErr;

    await writeAuditLog({
      adminEmail,
      action: 'subscription.grant_comp',
      targetType: 'subscription',
      targetId: inserted.id,
      before: null,
      after: inserted,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ subscription: inserted });
  } catch (err: any) {
    console.error('Grant comp sub error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create subscription' }, { status: 500 });
  }
}
