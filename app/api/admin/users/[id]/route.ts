import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin, writeAuditLog, getClientIp } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── GET — full user detail with subs, prop accounts, swap history ──
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const userId = params.id;

    // Fetch the user
    const { data: userRes, error: userErr } = await supabase.auth.admin.getUserById(userId);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRes.user;

    // Safely query Academy tables which may not exist — wrap in real async functions
    // so try/catch works properly (Supabase's builder is PromiseLike, not Promise).
    const safeQuery = async (fn: () => any): Promise<{ data: any[] }> => {
      try {
        const res = await fn();
        return { data: res.data || [] };
      } catch {
        return { data: [] };
      }
    };

    // Fetch related data. For subscriptions, match by user_id OR user_email —
    // some subs created before checkout auth have user_id=null, matched only by email.
    // Two separate queries is safer than .or() which can choke on special chars in emails.
    const [subsByIdRes, subsByEmailRes, propRes, swapsRes, certsRes, progressRes] = await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      user.email ? supabase.from('subscriptions').select('*').eq('user_email', user.email).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
      supabase.from('prop_accounts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('swap_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      safeQuery(() => supabase.from('academy_certificates').select('*').eq('user_id', userId).order('issued_at', { ascending: false })),
      safeQuery(() => supabase.from('academy_progress').select('*').eq('user_id', userId).order('updated_at', { ascending: false })),
    ]);

    // Merge sub results, deduping by id (a sub may match both queries)
    const subsSeen = new Set<string>();
    const subsRes = { data: [
      ...(subsByIdRes.data || []),
      ...(subsByEmailRes.data || []),
    ].filter((s: any) => {
      if (subsSeen.has(s.id)) return false;
      subsSeen.add(s.id);
      return true;
    }) };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmed: !!user.email_confirmed_at,
        provider: user.app_metadata?.provider || 'email',
        tradingviewUsername: user.user_metadata?.tradingview_username || null,
        userMetadata: user.user_metadata,
        banned: (user as any).banned_until || null,
      },
      subscriptions: subsRes.data || [],
      propAccounts: propRes.data || [],
      swapHistory: swapsRes.data || [],
      certificates: certsRes.data || [],
      progress: progressRes.data || [],
    });
  } catch (err: any) {
    console.error('User detail error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load user' }, { status: 500 });
  }
}

// ── PATCH — update user metadata (TV username), resend verification, ban/unban ──
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const userId = params.id;
    const body = await req.json();
    const { action, tradingviewUsername, banned } = body;

    // Snapshot before
    const { data: userBefore } = await supabase.auth.admin.getUserById(userId);
    if (!userBefore?.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const beforeSnapshot = {
      email: userBefore.user.email,
      tradingview_username: userBefore.user.user_metadata?.tradingview_username,
      banned_until: (userBefore.user as any).banned_until,
    };

    if (action === 'update_tv_username') {
      const newMeta = { ...userBefore.user.user_metadata, tradingview_username: tradingviewUsername };
      const { error } = await supabase.auth.admin.updateUserById(userId, { user_metadata: newMeta });
      if (error) throw error;

      await writeAuditLog({
        adminEmail,
        action: 'user.update_tv_username',
        targetType: 'user',
        targetId: userId,
        before: beforeSnapshot,
        after: { ...beforeSnapshot, tradingview_username: tradingviewUsername },
        ipAddress: getClientIp(req),
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'resend_verification') {
      // Use the dedicated resend() method — it re-triggers Supabase's
      // existing signup confirmation email template. Simpler and correct
      // for this use case than generateLink(), which requires a password.
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userBefore.user.email!,
      });
      if (error) throw error;

      await writeAuditLog({
        adminEmail,
        action: 'user.resend_verification',
        targetType: 'user',
        targetId: userId,
        before: beforeSnapshot,
        after: beforeSnapshot,
        ipAddress: getClientIp(req),
      });

      return NextResponse.json({ success: true, message: 'Verification email sent.' });
    }

    if (action === 'ban' || action === 'unban') {
      // Supabase supports banning via ban_duration. 'none' to unban.
      const banDuration = action === 'ban' ? '876000h' : 'none'; // ~100 years = permanent, 'none' removes
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      } as any);
      if (error) throw error;

      await writeAuditLog({
        adminEmail,
        action: `user.${action}`,
        targetType: 'user',
        targetId: userId,
        before: beforeSnapshot,
        after: { ...beforeSnapshot, banned_until: action === 'ban' ? 'permanent' : null },
        ipAddress: getClientIp(req),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('User PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}

// ── DELETE — full user delete (cascades through Supabase Auth + related rows) ──
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const userId = params.id;

    // Snapshot user + all their data for audit
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const [subsRes, propRes] = await Promise.all([
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('prop_accounts').select('*').eq('user_id', userId),
    ]);

    const before = {
      user: userData?.user ? { id: userData.user.id, email: userData.user.email, created_at: userData.user.created_at } : null,
      subscriptionCount: subsRes.data?.length || 0,
      propAccountCount: propRes.data?.length || 0,
    };

    // Delete prop data first (trades, sessions, accounts)
    const accountIds = (propRes.data || []).map((a) => a.id);
    if (accountIds.length) {
      await supabase.from('prop_trades').delete().in('account_id', accountIds);
      await supabase.from('prop_sessions').delete().in('account_id', accountIds);
      await supabase.from('prop_accounts').delete().eq('user_id', userId);
    }

    // Delete subscriptions (keep audit trail in audit_log though)
    await supabase.from('subscriptions').delete().eq('user_id', userId);
    await supabase.from('swap_history').delete().eq('user_id', userId);

    // Delete academy data (soft failures OK if table doesn't exist)
    try { await supabase.from('academy_progress').delete().eq('user_id', userId); } catch {}
    try { await supabase.from('academy_certificates').delete().eq('user_id', userId); } catch {}

    // Finally delete the auth user (cascades via FKs anyway, but explicit is better)
    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    await writeAuditLog({
      adminEmail,
      action: 'user.delete',
      targetType: 'user',
      targetId: userId,
      before,
      after: null,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('User DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
