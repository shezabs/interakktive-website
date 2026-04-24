import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/lib/supabase-server';
import { getAdminEmail, writeAuditLog, getClientIp, requireCapability } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const check = await requireCapability('settings.change_own_password');
  if (!check.ok) {
    return NextResponse.json(
      { error: check.status === 403 ? 'Your role does not permit this' : 'Unauthorized' },
      { status: check.status }
    );
  }
  const adminEmail = check.email;

  try {
    const { newPassword } = await req.json();

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Server client already has the user's session from cookies.
    // updateUser() modifies the authenticated user's password.
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await writeAuditLog({
      adminEmail,
      action: 'admin.change_password',
      targetType: 'user',
      targetId: data.user?.id || null,
      before: null,
      after: { changed_at: new Date().toISOString() },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: err.message || 'Password change failed' }, { status: 500 });
  }
}
