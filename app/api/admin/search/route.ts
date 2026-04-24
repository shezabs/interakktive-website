import { NextRequest, NextResponse } from 'next/server';
import { getAdminEmail, getSupabaseAdmin } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchResult {
  type: 'user' | 'subscription' | 'prop_account' | 'audit';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  matchField: string;
}

export async function GET(req: NextRequest) {
  const adminEmail = await getAdminEmail(req);
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Pull broad datasets; filter client-side.
    // For <1000 users/subs, this is fast enough. When scale hits 10k+, switch to indexed text search.
    const [usersRes, subsRes, propRes, auditRes] = await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from('subscriptions').select('id, user_id, user_email, tradingview_username, plan, status, stripe_subscription_id').limit(1000),
      supabase.from('prop_accounts').select('id, user_id, name, phase, account_type, balance, currency').limit(1000),
      supabase.from('admin_audit_log').select('id, admin_email, action, target_type, target_id, created_at').order('created_at', { ascending: false }).limit(200),
    ]);

    const users = usersRes.data?.users || [];
    const subs = subsRes.data || [];
    const prop = propRes.data || [];
    const audit = auditRes.data || [];

    // Build email lookup for enriching prop/audit results
    const emailByUserId = new Map<string, string>();
    for (const u of users) if (u.id && u.email) emailByUserId.set(u.id, u.email);

    const results: SearchResult[] = [];

    // Users
    for (const u of users) {
      const email = (u.email || '').toLowerCase();
      const tvUser = (u.user_metadata?.tradingview_username || '').toLowerCase();
      if (email.includes(q) || tvUser.includes(q) || u.id.includes(q)) {
        results.push({
          type: 'user',
          id: u.id,
          title: u.email || u.id,
          subtitle: tvUser ? `TV: ${u.user_metadata.tradingview_username}` : (u.app_metadata?.provider || 'user'),
          href: `/admin/timeline/${u.id}`,
          matchField: email.includes(q) ? 'email' : tvUser.includes(q) ? 'tv_username' : 'id',
        });
      }
    }

    // Subscriptions
    for (const s of subs) {
      const email = (s.user_email || '').toLowerCase();
      const tv = (s.tradingview_username || '').toLowerCase();
      const stripeId = (s.stripe_subscription_id || '').toLowerCase();
      if (email.includes(q) || tv.includes(q) || s.id.includes(q) || stripeId.includes(q)) {
        results.push({
          type: 'subscription',
          id: s.id,
          title: `${s.plan} — ${s.user_email}`,
          subtitle: `${s.status}${tv ? ` · TV: ${s.tradingview_username}` : ''}`,
          href: `/admin/subscriptions?open=${s.id}`,
          matchField: email.includes(q) ? 'email' : tv.includes(q) ? 'tv_username' : stripeId.includes(q) ? 'stripe_id' : 'id',
        });
      }
    }

    // Prop accounts
    for (const p of prop) {
      const name = (p.name || '').toLowerCase();
      const ownerEmail = (emailByUserId.get(p.user_id) || '').toLowerCase();
      if (name.includes(q) || ownerEmail.includes(q) || p.id.includes(q)) {
        results.push({
          type: 'prop_account',
          id: p.id,
          title: p.name || 'Unnamed account',
          subtitle: `${emailByUserId.get(p.user_id) || 'unknown'} · ${p.phase || p.account_type || 'account'}`,
          href: `/admin/prop`,
          matchField: name.includes(q) ? 'name' : ownerEmail.includes(q) ? 'owner_email' : 'id',
        });
      }
    }

    // Audit entries — only show recent matching ones
    for (const a of audit) {
      const action = (a.action || '').toLowerCase();
      const admin = (a.admin_email || '').toLowerCase();
      const target = (a.target_id || '').toLowerCase();
      if (action.includes(q) || admin.includes(q) || target.includes(q)) {
        results.push({
          type: 'audit',
          id: a.id,
          title: a.action,
          subtitle: `${a.admin_email.split('@')[0]} → ${a.target_type} · ${new Date(a.created_at).toLocaleDateString()}`,
          href: `/admin/audit`,
          matchField: action.includes(q) ? 'action' : admin.includes(q) ? 'admin' : 'target',
        });
      }
    }

    // Cap each type at 10 results to avoid giant payloads
    const capped: SearchResult[] = [];
    const typeCounts: Record<string, number> = {};
    for (const r of results) {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
      if (typeCounts[r.type] <= 10) capped.push(r);
    }

    return NextResponse.json({
      results: capped,
      totalMatches: results.length,
      capped: results.length > capped.length,
    });
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}
