import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CODES = [
  'too_expensive',
  'not_using',
  'found_competitor',
  'missing_feature',
  'tech_issues',
  'temporary_break',
  'other',
];

/**
 * Public endpoint — called by the cancel flow (customer side).
 * Records a reason for cancellation before the actual cancel action fires.
 *
 * Uses the caller's own Bearer token so RLS applies and a user can only
 * record a reason for their own cancellation.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, reasonCode, reasonText } = await req.json();

    if (!reasonCode || !VALID_CODES.includes(reasonCode)) {
      return NextResponse.json({ error: 'Invalid reason code' }, { status: 400 });
    }

    // Validate the user via their token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const user = userData.user;

    // Look up the sub (with service role so we can fetch regardless of RLS)
    // to snapshot plan/billing at cancel time
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let plan = 'unknown';
    let billing = 'unknown';
    if (subscriptionId) {
      const { data: sub } = await service
        .from('subscriptions')
        .select('plan, billing, user_id, user_email')
        .eq('id', subscriptionId)
        .single();
      if (sub) {
        // Guard: the sub must belong to this user
        const belongsTo = sub.user_id === user.id || sub.user_email?.toLowerCase() === user.email!.toLowerCase();
        if (!belongsTo) {
          return NextResponse.json({ error: 'Subscription does not belong to you' }, { status: 403 });
        }
        plan = sub.plan;
        billing = sub.billing;
      }
    }

    const { error: insertErr } = await service.from('churn_reasons').insert({
      user_id: user.id,
      user_email: user.email!.toLowerCase(),
      subscription_id: subscriptionId || null,
      plan,
      billing,
      reason_code: reasonCode,
      reason_text: reasonText || null,
    });

    if (insertErr) {
      console.error('Churn reason insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to record reason' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Churn reason error:', err);
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
