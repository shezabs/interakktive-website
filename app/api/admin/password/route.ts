import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAdminEmail, writeAuditLog, getClientIp } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newPassword } = await req.json();

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Use the user's OWN auth session (not service role) so Supabase
    // updates the password for the authenticated admin only.
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit log the change (never log the password itself)
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
