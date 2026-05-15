import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin, writeAuditLog, getClientIp } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── GET — list applications ──
// Optional filter: ?status=pending|approved|rejected|withdrawn|all (default 'all')
export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('affiliate_applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (status !== 'all' && ['pending', 'approved', 'rejected', 'withdrawn'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ applications: data || [] });
  } catch (err: any) {
    console.error('admin/affiliates GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load applications' }, { status: 500 });
  }
}

// ── PATCH — update an application status / notes ──
// Body: { id, action: 'approve' | 'reject' | 'reset_pending', admin_notes? }
export async function PATCH(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { id, action, admin_notes } = body || {};
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
  }
  if (!['approve', 'reject', 'reset_pending'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Verify application exists
    const { data: existing, error: fetchErr } = await supabase
      .from('affiliate_applications')
      .select('id, email, full_name, status')
      .eq('id', id)
      .single();
    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const newStatus =
      action === 'approve' ? 'approved' :
      action === 'reject'  ? 'rejected' :
      'pending';

    const updates: any = {
      status: newStatus,
      reviewed_at: action === 'reset_pending' ? null : new Date().toISOString(),
      reviewed_by: action === 'reset_pending' ? null : adminEmail,
    };
    if (typeof admin_notes === 'string') {
      updates.admin_notes = admin_notes;
    }

    const { data: updated, error: updErr } = await supabase
      .from('affiliate_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (updErr) throw updErr;

    // Audit
    await writeAuditLog({
      adminEmail: adminEmail,
      action: `affiliate_application_${action}`,
      targetType: 'affiliate_application',
      targetId: id,
      before: { status: existing.status, email: existing.email },
      after:  { status: newStatus, email: existing.email },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ application: updated });
  } catch (err: any) {
    console.error('admin/affiliates PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
