import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Escape a single CSV cell — quote it if it contains commas, quotes, or newlines.
 */
function csvCell(value: any): string {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape any internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCSV(rows: any[], columns: string[]): string {
  const header = columns.map(csvCell).join(',');
  const body = rows.map((r) => columns.map((col) => csvCell(r[col])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString().split('T')[0];

    // ── USERS ──
    if (type === 'users') {
      const { data: usersList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const users = usersList?.users || [];

      const rows = users.map((u) => ({
        id: u.id,
        email: u.email,
        provider: u.app_metadata?.provider || 'email',
        tradingview_username: u.user_metadata?.tradingview_username || '',
        email_confirmed: u.email_confirmed_at ? 'yes' : 'no',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || '',
      }));

      const csv = rowsToCSV(rows, ['id', 'email', 'provider', 'tradingview_username', 'email_confirmed', 'created_at', 'last_sign_in_at']);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-${now}.csv"`,
        },
      });
    }

    // ── SUBSCRIPTIONS ──
    if (type === 'subscriptions') {
      const { data: subs } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      const rows = (subs || []).map((s) => ({
        id: s.id,
        user_email: s.user_email,
        tradingview_username: s.tradingview_username,
        plan: s.plan,
        billing: s.billing,
        indicators: (s.indicators || []).join(' | '),
        status: s.status,
        is_comp: s.stripe_subscription_id ? 'no' : 'yes',
        tv_invite_sent: s.tv_invite_sent ? 'yes' : 'no',
        current_period_end: s.current_period_end || '',
        created_at: s.created_at,
        updated_at: s.updated_at,
        admin_notes: s.admin_notes || '',
      }));

      const csv = rowsToCSV(rows, [
        'id', 'user_email', 'tradingview_username', 'plan', 'billing', 'indicators',
        'status', 'is_comp', 'tv_invite_sent', 'current_period_end', 'created_at', 'updated_at', 'admin_notes',
      ]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscriptions-${now}.csv"`,
        },
      });
    }

    // ── PROP ACCOUNTS ──
    if (type === 'prop_accounts') {
      const [accountsRes, usersRes] = await Promise.all([
        supabase.from('prop_accounts').select('*').order('created_at', { ascending: false }),
        supabase.auth.admin.listUsers({ perPage: 1000 }),
      ]);
      const users = usersRes.data?.users || [];
      const emailByUserId = new Map(users.filter(u => u.id && u.email).map(u => [u.id, u.email]));

      const rows = (accountsRes.data || []).map((a) => ({
        id: a.id,
        user_email: emailByUserId.get(a.user_id) || '',
        name: a.name,
        account_type: a.account_type || 'prop_challenge',
        phase: a.phase || '',
        currency: a.currency || 'USD',
        starting_balance: a.balance,
        profit_target_pct: a.profit_target_pct,
        daily_dd_pct: a.daily_dd_pct,
        max_dd_pct: a.max_dd_pct,
        is_active: a.is_active ? 'yes' : 'no',
        created_at: a.created_at,
      }));

      const csv = rowsToCSV(rows, [
        'id', 'user_email', 'name', 'account_type', 'phase', 'currency', 'starting_balance',
        'profit_target_pct', 'daily_dd_pct', 'max_dd_pct', 'is_active', 'created_at',
      ]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="prop-accounts-${now}.csv"`,
        },
      });
    }

    // ── PROP TRADES ──
    if (type === 'prop_trades') {
      const { data: trades } = await supabase.from('prop_trades').select('*').order('opened_at', { ascending: false });
      const rows = (trades || []).map((t) => ({
        id: t.id,
        account_id: t.account_id,
        user_id: t.user_id,
        symbol: t.symbol || '',
        direction: t.direction || '',
        pnl: t.pnl ?? '',
        r_result: t.r_result ?? '',
        status: t.status || '',
        opened_at: t.opened_at || '',
        closed_at: t.closed_at || '',
      }));

      const csv = rowsToCSV(rows, [
        'id', 'account_id', 'user_id', 'symbol', 'direction', 'pnl', 'r_result',
        'status', 'opened_at', 'closed_at',
      ]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="prop-trades-${now}.csv"`,
        },
      });
    }

    // ── AUDIT LOG ──
    if (type === 'audit') {
      const { data: entries } = await supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false });
      const rows = (entries || []).map((e) => ({
        id: e.id,
        admin_email: e.admin_email,
        action: e.action,
        target_type: e.target_type,
        target_id: e.target_id || '',
        ip_address: e.ip_address || '',
        created_at: e.created_at,
        // JSON fields collapsed into strings for CSV
        before_data: e.before_data ? JSON.stringify(e.before_data) : '',
        after_data: e.after_data ? JSON.stringify(e.after_data) : '',
      }));

      const csv = rowsToCSV(rows, [
        'id', 'admin_email', 'action', 'target_type', 'target_id', 'ip_address',
        'created_at', 'before_data', 'after_data',
      ]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-log-${now}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
