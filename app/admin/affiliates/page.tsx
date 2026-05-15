'use client';

import { useEffect, useState, useMemo } from 'react';
import { adminFetch } from '../lib-client';
import { useAdmin } from '../admin-context';
import { CheckCircle2, XCircle, RotateCcw, Mail, Loader2, Filter } from 'lucide-react';
import { formatRelative, formatDateTime } from '../components/shared';

// =============================================================================
// /admin/affiliates — application review tab
// =============================================================================
// Lists affiliate program applications. Lets Owner/Operator approve/reject and
// add internal notes. Approval here only sets status='approved' in the
// applications table — the actual affiliate record (referral link, dashboard,
// commission ledger) is provisioned in the next phase.
// =============================================================================

interface Application {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  tv_username: string | null;
  promotion_urls: string;
  audience_size: string;
  niche: string;
  pitch: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  customer_plan: string | null;
  customer_status: string | null;
}

const AUDIENCE_LABEL: Record<string, string> = {
  'under_500': 'Under 500', '500_5k': '500 — 5K', '5k_50k': '5K — 50K',
  '50k_500k': '50K — 500K', '500k_plus': '500K+',
};

const NICHE_LABEL: Record<string, string> = {
  forex: 'Forex', crypto: 'Crypto', indices: 'Indices', commodities: 'Commodities',
  mixed: 'Mixed', educational: 'Educational', other: 'Other',
};

export default function AdminAffiliatesPage() {
  const { can } = useAdmin();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selected, setSelected] = useState<Application | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    adminFetch(`/api/admin/affiliates?status=${filter}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load');
        return r.json();
      })
      .then((d) => setApplications(d.applications || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, total: applications.length };
    applications.forEach((a) => {
      if (a.status === 'pending')  c.pending++;
      if (a.status === 'approved') c.approved++;
      if (a.status === 'rejected') c.rejected++;
    });
    return c;
  }, [applications]);

  const handleAction = async (app: Application, action: 'approve' | 'reject' | 'reset_pending') => {
    setActing(`${app.id}:${action}`);
    try {
      const res = await adminFetch('/api/admin/affiliates', {
        method: 'PATCH',
        body: JSON.stringify({ id: app.id, action, admin_notes: notesDraft || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Action failed');
      }
      const { application } = await res.json();
      // refresh list + drawer
      setApplications((prev) => prev.map((a) => (a.id === app.id ? application : a)));
      setSelected(application);
      setNotesDraft(application.admin_notes || '');
    } catch (e: any) {
      alert(e.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const openDrawer = (app: Application) => {
    setSelected(app);
    setNotesDraft(app.admin_notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Affiliate Applications</h1>
          <p className="text-sm text-gray-400 mt-1">Review and decide on partner program applications.</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === s
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading applications…
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-sm">{error}</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No applications {filter !== 'all' ? `with status: ${filter}` : ''}.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.08]">
              <tr className="text-left text-[10px] font-bold tracking-widest uppercase text-gray-500">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Audience · Niche</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => openDrawer(app)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{app.full_name}</div>
                    <div className="text-xs text-gray-500">{app.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-300">{app.customer_plan || '—'}</div>
                    <div className="text-[10px] text-gray-500">{app.customer_status || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {AUDIENCE_LABEL[app.audience_size] || app.audience_size}
                    <span className="text-gray-600"> · </span>
                    {NICHE_LABEL[app.niche] || app.niche}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatRelative(app.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-gray-500">View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl h-full overflow-y-auto bg-[#0a0f1a] border-l border-white/10 shadow-2xl"
          >
            <div className="sticky top-0 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">{selected.full_name}</h2>
                <p className="text-xs text-gray-500">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <DetailRow label="Status"><StatusPill status={selected.status} /></DetailRow>
              <DetailRow label="Submitted">{formatDateTime(selected.submitted_at)}</DetailRow>
              {selected.reviewed_at && (
                <DetailRow label={`Reviewed by ${selected.reviewed_by || 'admin'}`}>
                  {formatDateTime(selected.reviewed_at)}
                </DetailRow>
              )}
              <DetailRow label="TradingView">{selected.tv_username || '—'}</DetailRow>
              <DetailRow label="Customer">
                <span className="text-gray-300">{selected.customer_plan || '—'} ({selected.customer_status || '—'})</span>
              </DetailRow>
              <DetailRow label="Audience size">{AUDIENCE_LABEL[selected.audience_size] || selected.audience_size}</DetailRow>
              <DetailRow label="Niche">{NICHE_LABEL[selected.niche] || selected.niche}</DetailRow>

              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/80 mb-2">Where they&apos;d promote</p>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 whitespace-pre-wrap font-mono">{selected.promotion_urls}</pre>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/80 mb-2">Their pitch</p>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.pitch}</div>
              </div>

              {/* Admin notes editor */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/80 mb-2">Admin notes (internal)</p>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-amber-400/50 focus:outline-none text-white text-sm transition-colors"
                  placeholder="Optional reasoning, follow-up notes, etc."
                />
              </div>

              {/* Actions */}
              {can('affiliate.review') && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/[0.06]">
                  {selected.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selected, 'approve')}
                      disabled={acting === `${selected.id}:approve`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-sm hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                      {acting === `${selected.id}:approve` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                  )}
                  {selected.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selected, 'reject')}
                      disabled={acting === `${selected.id}:reject`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 font-semibold text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {acting === `${selected.id}:reject` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  )}
                  {selected.status !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selected, 'reset_pending')}
                      disabled={acting === `${selected.id}:reset_pending`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {acting === `${selected.id}:reset_pending` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Reset to pending
                    </button>
                  )}
                </div>
              )}

              <a
                href={`mailto:${selected.email}?subject=Re%3A%20Interakktive%20Affiliate%20Application`}
                className="inline-flex items-center gap-2 text-xs text-amber-300 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> Email {selected.email}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: Application['status'] }) {
  const styles: Record<Application['status'], string> = {
    pending:   'bg-amber-500/10 text-amber-300 border-amber-500/20',
    approved:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    rejected:  'bg-red-500/10 text-red-300 border-red-500/20',
    withdrawn: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-gray-500 text-xs uppercase tracking-wider font-bold flex-shrink-0">{label}</span>
      <span className="text-gray-200 text-right">{children}</span>
    </div>
  );
}
