import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();

    // Pull all prop accounts + their trades for stats
    const [accountsRes, tradesRes, usersRes] = await Promise.all([
      supabase.from('prop_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('prop_trades').select('account_id, user_id, pnl, r_result, status, opened_at, closed_at'),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    if (accountsRes.error) throw accountsRes.error;

    const accounts = accountsRes.data || [];
    const trades = tradesRes.data || [];
    const users = usersRes.data?.users || [];

    // Build a map of user_id → email for quick lookup
    const emailByUserId = new Map<string, string>();
    for (const u of users) if (u.id && u.email) emailByUserId.set(u.id, u.email);

    // Group trades by account for stats
    const tradesByAccount = new Map<string, typeof trades>();
    for (const t of trades) {
      if (!tradesByAccount.has(t.account_id)) tradesByAccount.set(t.account_id, []);
      tradesByAccount.get(t.account_id)!.push(t);
    }

    // Enrich each account with derived stats
    const enriched = accounts.map((a) => {
      const accountTrades = tradesByAccount.get(a.id) || [];
      const closed = accountTrades.filter((t: any) => t.status === 'closed');
      const wins = closed.filter((t: any) => (t.pnl || 0) > 0);
      const totalPnl = closed.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
      const totalR = closed.reduce((sum: number, t: any) => sum + (t.r_result || 0), 0);
      const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

      return {
        id: a.id,
        userId: a.user_id,
        userEmail: emailByUserId.get(a.user_id) || null,
        name: a.name,
        accountType: a.account_type || 'prop_challenge',
        phase: a.phase,
        currency: a.currency || 'USD',
        startingBalance: a.balance,
        profitTargetPct: a.profit_target_pct,
        dailyDdPct: a.daily_dd_pct,
        maxDdPct: a.max_dd_pct,
        isActive: a.is_active,
        createdAt: a.created_at,
        // Computed
        totalTrades: accountTrades.length,
        closedTrades: closed.length,
        openTrades: accountTrades.length - closed.length,
        totalPnl,
        totalR,
        winRate,
      };
    });

    return NextResponse.json({ accounts: enriched });
  } catch (err: any) {
    console.error('Prop list error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load prop accounts' }, { status: 500 });
  }
}
