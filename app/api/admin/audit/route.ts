import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    const adminFilter = searchParams.get('admin');
    const actionFilter = searchParams.get('action');
    const targetType = searchParams.get('target_type');

    if (adminFilter) query = query.eq('admin_email', adminFilter);
    if (actionFilter) query = query.eq('action', actionFilter);
    if (targetType) query = query.eq('target_type', targetType);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (err: any) {
    console.error('Audit log error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load audit log' }, { status: 500 });
  }
}
