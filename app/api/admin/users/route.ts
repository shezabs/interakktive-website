import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Fetch all users (Supabase caps at 1000 per call; for larger bases we'd paginate)
    const { data: userList, error: userErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (userErr) throw userErr;

    const users = userList?.users || [];

    // Fetch subs + prop accounts + certs in bulk for enrichment
    const [subsRes, propRes, certsRes] = await Promise.all([
      supabase.from('subscriptions').select('id, user_id, user_email, plan, status, tradingview_username'),
      supabase.from('prop_accounts').select('id, user_id'),
      supabase.from('academy_certificates').select('user_id').then(r => r).catch(() => ({ data: [], error: null })),
    ]);

    const subsByUser    = new Map<string, any[]>();
    const subsByEmail   = new Map<string, any[]>();
    const propCountByUser = new Map<string, number>();
    const certsCountByUser = new Map<string, number>();

    (subsRes.data || []).forEach((s) => {
      if (s.user_id) {
        if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
        subsByUser.get(s.user_id)!.push(s);
      }
      if (s.user_email) {
        if (!subsByEmail.has(s.user_email)) subsByEmail.set(s.user_email, []);
        subsByEmail.get(s.user_email)!.push(s);
      }
    });

    (propRes.data || []).forEach((p) => {
      if (p.user_id) {
        propCountByUser.set(p.user_id, (propCountByUser.get(p.user_id) || 0) + 1);
      }
    });

    (certsRes.data || []).forEach((c: any) => {
      if (c.user_id) {
        certsCountByUser.set(c.user_id, (certsCountByUser.get(c.user_id) || 0) + 1);
      }
    });

    const enriched = users.map((u) => {
      const userSubs = subsByUser.get(u.id) || subsByEmail.get(u.email || '') || [];
      const activeSub = userSubs.find((s) => s.status === 'active' || s.status === 'cancelling');
      return {
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        emailConfirmed: !!u.email_confirmed_at,
        provider: u.app_metadata?.provider || 'email',
        tradingviewUsername: u.user_metadata?.tradingview_username || null,
        subscriptionCount: userSubs.length,
        currentPlan: activeSub?.plan || null,
        propAccountCount: propCountByUser.get(u.id) || 0,
        certsEarned: certsCountByUser.get(u.id) || 0,
      };
    });

    return NextResponse.json({ users: enriched });
  } catch (err: any) {
    console.error('Users list error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load users' }, { status: 500 });
  }
}
