import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin, writeAuditLog, getClientIp, requireCapability } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();

    const { data: account, error } = await supabase
      .from('prop_accounts')
      .select('*')
      .eq('id', params.id)
      .single();
    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Fetch related data — trades, sessions, user email
    const [tradesRes, sessionsRes, userRes] = await Promise.all([
      supabase.from('prop_trades').select('*').eq('account_id', params.id).order('opened_at', { ascending: false }),
      supabase.from('prop_sessions').select('*').eq('account_id', params.id).order('created_at', { ascending: false }),
      supabase.auth.admin.getUserById(account.user_id),
    ]);

    return NextResponse.json({
      account,
      trades: tradesRes.data || [],
      sessions: sessionsRes.data || [],
      user: userRes.data?.user ? { id: userRes.data.user.id, email: userRes.data.user.email } : null,
    });
  } catch (err: any) {
    console.error('Prop detail error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load account' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireCapability('prop.delete_account');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Only Owner role can delete prop accounts' : 'Unauthorized' },
      { status: check.status }
    );
  }
  const adminEmail = check.email;

  try {
    const supabase = getSupabaseAdmin();

    const { data: before } = await supabase.from('prop_accounts').select('*').eq('id', params.id).single();
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cascade delete — trades first, then sessions, then account
    await supabase.from('prop_trades').delete().eq('account_id', params.id);
    await supabase.from('prop_sessions').delete().eq('account_id', params.id);
    const { error } = await supabase.from('prop_accounts').delete().eq('id', params.id);
    if (error) throw error;

    await writeAuditLog({
      adminEmail,
      action: 'prop_account.delete',
      targetType: 'prop_account',
      targetId: params.id,
      before,
      after: null,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Prop DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
