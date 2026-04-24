'use client';
import { adminFetch } from '../lib-client';
import { useAdmin } from '../admin-context';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, RefreshCw, Send, XCircle, CheckCircle2, Trash2, Calendar, RotateCcw, Edit3, ExternalLink, Download, RefreshCcw, DollarSign } from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '../components/DataTable';
import Drawer from '../components/Drawer';
import ConfirmModal from '../components/ConfirmModal';
import { StatusBadge, PlanBadge, formatDate, formatDateTime, daysUntil, formatCurrency } from '../components/shared';

const ALL_INDICATORS = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];

interface Subscription {
  id: string;
  user_id: string | null;
  user_email: string;
  tradingview_username: string;
  plan: 'starter' | 'advantage' | 'elite';
  billing: 'monthly' | 'annual';
  indicators: string[];
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  swap_used: boolean;
  swap_reset_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  tv_invite_sent: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminSubscriptionsPage() {
  const { can } = useAdmin();
  const searchParams = useSearchParams();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [confirmForceCancel, setConfirmForceCancel] = useState<'period' | 'immediate' | null>(null);
  // Phase 3C: Stripe sync + refund modals
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [extendDays, setExtendDays] = useState<string>('7');
  const [editingPlan, setEditingPlan] = useState(false);
  const [planDraft, setPlanDraft] = useState<{ plan: string; indicators: string[] }>({ plan: 'starter', indicators: [] });
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const loadSubs = () => {
    setLoading(true);
    adminFetch('/api/admin/subscriptions')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSubs(d.subscriptions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSubs(); }, []);

  // Auto-open a sub if ?open=<id> in URL (from Overview alerts)
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && subs.length > 0 && !selected) {
      const target = subs.find((s) => s.id === openId);
      if (target) openSub(target);
    }
    // Apply filter from URL
    const filter = searchParams.get('filter');
    if (filter === 'needs_invite') setStatusFilter('needs_invite');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs]);

  const openSub = async (s: Subscription) => {
    setSelected(s);
    setDetailLoading(true);
    setDetail(null);
    setActionMsg(null);
    setEditingPlan(false);
    setEditingNotes(false);
    setPlanDraft({ plan: s.plan, indicators: s.indicators || [] });
    setNotesDraft(s.admin_notes || '');
    try {
      const r = await adminFetch(`/api/admin/subscriptions/${s.id}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setDetail(d);
    } catch (err: any) {
      setActionMsg(`Failed to load: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelected(null);
    setDetail(null);
    setActionMsg(null);
    setEditingPlan(false);
    setEditingNotes(false);
  };

  const runAction = async (action: string, body: any = {}) => {
    if (!selected) return;
    setActionLoading(action);
    setActionMsg(null);
    try {
      const res = await adminFetch(`/api/admin/subscriptions/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Action failed');
      setActionMsg('Done.');
      // Update selected + detail with returned data
      if (d.subscription) {
        setSelected(d.subscription);
        // Reload detail to get fresh Stripe data
        await openSub(d.subscription);
      }
      loadSubs();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await adminFetch(`/api/admin/subscriptions/${selected.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      setConfirmDelete(false);
      closeDrawer();
      loadSubs();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
      setConfirmDelete(false);
    }
  };

  // Filter subs by status
  const filtered = subs.filter((s) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'needs_invite') return (s.status === 'active' || s.status === 'cancelling') && !s.tv_invite_sent;
    if (statusFilter === 'comp') return !s.stripe_subscription_id && s.status === 'active';
    return s.status === statusFilter;
  });

  const columns: Column<Subscription>[] = [
    {
      key: 'user_email', header: 'Email', sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <span className="text-white truncate max-w-[200px]">{s.user_email}</span>
          {!s.user_id && <span className="text-xs text-amber-400/60" title="No linked user">⚠</span>}
          {s.user_id && (
            <Link
              href={`/admin/timeline/${s.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-amber-400 hover:text-amber-300"
              title="View timeline"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      ),
    },
    {
      key: 'tradingview_username', header: 'TV User',
      render: (s) => <span className="text-xs font-mono text-gray-400">{s.tradingview_username || '—'}</span>,
    },
    {
      key: 'plan', header: 'Plan', sortable: true,
      render: (s) => <div className="flex items-center gap-1"><PlanBadge plan={s.plan} /><span className="text-xs text-gray-500">{s.billing}</span></div>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'tv_invite_sent', header: 'TV Invite', sortable: true,
      sortValue: (s) => s.tv_invite_sent ? 1 : 0,
      render: (s) => s.tv_invite_sent
        ? <CheckCircle2 className="w-4 h-4 text-teal-400" />
        : <span className="text-xs text-amber-400/80">pending</span>,
    },
    {
      key: 'indicators', header: 'Indicators',
      render: (s) => <span className="text-xs text-gray-400">{(s.indicators || []).length}</span>,
    },
    {
      key: 'current_period_end', header: 'Renews', sortable: true,
      sortValue: (s) => s.current_period_end ? new Date(s.current_period_end).getTime() : 0,
      render: (s) => {
        if (!s.current_period_end) return <span className="text-xs text-gray-600">—</span>;
        const days = daysUntil(s.current_period_end);
        return (
          <div className="text-xs">
            <div className="text-gray-400">{formatDate(s.current_period_end)}</div>
            {days !== null && <div className={`text-xs ${days < 0 ? 'text-red-400' : days < 7 ? 'text-amber-400' : 'text-gray-600'}`}>
              {days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
            </div>}
          </div>
        );
      },
    },
    {
      key: 'created_at', header: 'Created', sortable: true,
      sortValue: (s) => new Date(s.created_at).getTime(),
      render: (s) => <span className="text-xs text-gray-500">{formatDate(s.created_at)}</span>,
    },
  ];

  const togglePlanIndicator = (ind: string) => {
    const current = planDraft.indicators;
    const newArr = current.includes(ind) ? current.filter((i) => i !== ind) : [...current, ind];
    setPlanDraft({ ...planDraft, indicators: newArr });
  };

  const savePlan = async () => {
    if (planDraft.plan === 'elite') {
      await runAction('change_plan', { plan: 'elite', indicators: ALL_INDICATORS });
    } else {
      await runAction('change_plan', { plan: planDraft.plan, indicators: planDraft.indicators });
    }
    setEditingPlan(false);
  };

  const saveNotes = async () => {
    await runAction('update_notes', { notes: notesDraft });
    setEditingNotes(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Subscriptions</h1>
          <p className="text-sm text-gray-500">All subscription records with full management.</p>
        </div>
        <div className="flex items-center gap-2">
          {can('sub.grant_comp') && (
            <button
              onClick={() => setShowGrantModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Grant comp
            </button>
          )}
          <button
            onClick={async () => {
              try {
                const res = await adminFetch('/api/admin/export?type=subscriptions');
                if (!res.ok) throw new Error('Export failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (e: any) {
                console.error(e);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={loadSubs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'cancelling', label: 'Cancelling' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'past_due', label: 'Past Due' },
          { id: 'needs_invite', label: 'Needs TV Invite' },
          { id: 'comp', label: 'Comp' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(s) => s.id}
          onRowClick={openSub}
          searchFields={(s) => `${s.user_email} ${s.tradingview_username || ''} ${s.plan}`}
          searchPlaceholder="Search by email, TV username, plan..."
        />
      )}

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={closeDrawer}
        title={selected?.user_email || ''}
        subtitle={selected ? `${selected.plan} · ${selected.billing}` : ''}
        width="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selected && detail ? (
          <div className="space-y-6">
            {actionMsg && (
              <div className={`p-3 rounded-lg text-sm ${
                actionMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
              }`}>{actionMsg}</div>
            )}

            {/* Status bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <StatusBadge status={selected.status} />
              <PlanBadge plan={selected.plan} />
              <span className="text-xs text-gray-400 capitalize">{selected.billing}</span>
              {!selected.stripe_subscription_id && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">Comp</span>
              )}
              {!selected.tv_invite_sent && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Needs TV Invite</span>
              )}
            </div>

            {/* Indicators / plan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Plan & Indicators</h3>
                {!editingPlan && can('sub.change_plan') && <button onClick={() => setEditingPlan(true)} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"><Edit3 className="w-3 h-3" /> Edit</button>}
              </div>
              {editingPlan ? (
                <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="flex gap-2">
                    {(['starter', 'advantage', 'elite'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlanDraft({ plan: p, indicators: p === 'elite' ? ALL_INDICATORS : planDraft.indicators })}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          planDraft.plan === p
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}
                      >{p}</button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {planDraft.plan === 'starter' && 'Pick 1 indicator'}
                    {planDraft.plan === 'advantage' && 'Pick 2 indicators'}
                    {planDraft.plan === 'elite' && 'All 5 indicators (automatic)'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_INDICATORS.map((ind) => {
                      const checked = planDraft.indicators.includes(ind);
                      const disabled = planDraft.plan === 'elite';
                      return (
                        <button
                          key={ind}
                          disabled={disabled}
                          onClick={() => togglePlanIndicator(ind)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                            checked
                              ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                              : 'bg-white/5 border border-white/10 text-gray-400'
                          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >{ind}</button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={savePlan}
                      disabled={actionLoading === 'change_plan'}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/30 disabled:opacity-50"
                    >Save</button>
                    <button
                      onClick={() => { setEditingPlan(false); setPlanDraft({ plan: selected.plan, indicators: selected.indicators || [] }); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    {(selected.indicators || []).map((ind) => (
                      <div key={ind} className="px-2 py-1 rounded-md bg-teal-500/5 border border-teal-500/10 text-xs text-teal-400">{ind}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stripe live data */}
            {detail.stripe && !detail.stripe.error && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Stripe live</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Stripe status" value={detail.stripe.status || '—'} />
                  <Field label="Card" value={detail.stripe.cardBrand ? `${detail.stripe.cardBrand.toUpperCase()} •••• ${detail.stripe.cardLast4}` : '—'} />
                  <Field label="Next invoice" value={detail.stripe.latestInvoiceAmount ? formatCurrency(detail.stripe.latestInvoiceAmount) : '—'} />
                  <Field label="Last invoice status" value={detail.stripe.latestInvoiceStatus || '—'} />
                </div>
                {detail.stripe.customerDashboardUrl && (
                  <a href={detail.stripe.customerDashboardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-2">
                    Open in Stripe <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Periods */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Dates</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Created" value={formatDateTime(selected.created_at)} />
                <Field label="Current period ends" value={selected.current_period_end ? formatDateTime(selected.current_period_end) : '—'} />
                <Field label="Last updated" value={formatDateTime(selected.updated_at)} />
                <Field label="Swap reset" value={selected.swap_reset_date ? formatDateTime(selected.swap_reset_date) : '—'} />
              </div>
            </div>

            {/* Admin notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Admin notes</h3>
                {!editingNotes && <button onClick={() => setEditingNotes(true)} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"><Edit3 className="w-3 h-3" /> Edit</button>}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    placeholder="Internal notes..."
                  />
                  <div className="flex gap-2">
                    <button onClick={saveNotes} disabled={actionLoading === 'update_notes'} className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/30 disabled:opacity-50">Save</button>
                    <button onClick={() => { setEditingNotes(false); setNotesDraft(selected.admin_notes || ''); }} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 p-3 rounded-lg bg-white/[0.02] border border-white/10 min-h-[2.5rem]">
                  {selected.admin_notes || <span className="text-gray-600">No notes yet.</span>}
                </p>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  icon={Send}
                  label={selected.tv_invite_sent ? 'Mark invite unsent' : 'Mark TV invite sent'}
                  tone={selected.tv_invite_sent ? 'default' : 'positive'}
                  onClick={() => runAction('mark_tv_invite', { sent: !selected.tv_invite_sent })}
                  loading={actionLoading === 'mark_tv_invite'}
                />
                <ActionBtn
                  icon={RotateCcw}
                  label="Reset swap"
                  onClick={() => runAction('reset_swap')}
                  loading={actionLoading === 'reset_swap'}
                />
                {selected.status === 'active' && (
                  <>
                    {can('sub.cancel_period_end') && (
                      <ActionBtn
                        icon={XCircle}
                        label="Cancel at period end"
                        tone="warning"
                        onClick={() => setConfirmForceCancel('period')}
                      />
                    )}
                    {can('sub.cancel_immediate') && (
                      <ActionBtn
                        icon={XCircle}
                        label="Cancel immediately"
                        tone="destructive"
                        onClick={() => setConfirmForceCancel('immediate')}
                      />
                    )}
                  </>
                )}
                {selected.status === 'cancelling' && (
                  <>
                    {can('sub.reactivate') && (
                      <ActionBtn
                        icon={CheckCircle2}
                        label="Reactivate"
                        tone="positive"
                        onClick={() => runAction('reactivate')}
                        loading={actionLoading === 'reactivate'}
                      />
                    )}
                    {can('sub.cancel_immediate') && (
                      <ActionBtn
                        icon={XCircle}
                        label="Cancel now (skip period)"
                        tone="destructive"
                        onClick={() => setConfirmForceCancel('immediate')}
                      />
                    )}
                  </>
                )}
                {selected.status === 'cancelled' && (
                  <ActionBtn
                    icon={CheckCircle2}
                    label="Reactivate"
                    tone="positive"
                    onClick={() => runAction('reactivate')}
                    loading={actionLoading === 'reactivate'}
                  />
                )}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Extend period by</span>
                  <input
                    type="number"
                    value={extendDays}
                    onChange={(e) => setExtendDays(e.target.value)}
                    className="w-16 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <span className="text-xs text-gray-400">days</span>
                  <button
                    onClick={() => runAction('extend_period', { days: parseInt(extendDays, 10) })}
                    disabled={actionLoading === 'extend_period' || !parseInt(extendDays, 10)}
                    className="ml-auto px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/30 disabled:opacity-50"
                  >Apply</button>
                </div>
              </div>

              {/* Stripe sync + refund (owner-only for refund, configurable capability) */}
              {selected.stripe_subscription_id && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {can('sub.stripe_sync') && (
                    <button
                      onClick={() => setSyncModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/5 border border-sky-500/20 text-sky-400 text-xs hover:bg-sky-500/10 transition-colors"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> Sync from Stripe
                    </button>
                  )}
                  {can('sub.refund') && (
                    <button
                      onClick={() => setRefundModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/10 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Issue refund
                    </button>
                  )}
                </div>
              )}

              {can('sub.delete_record') && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete subscription record
                </button>
              )}
            </div>

            {/* Swap history */}
            {detail.swapHistory && detail.swapHistory.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Swap history</h3>
                <div className="space-y-1">
                  {detail.swapHistory.map((s: any) => (
                    <div key={s.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                      <p className="font-mono text-gray-400">
                        {(s.old_indicators || []).join(', ')} <span className="text-amber-400">&rarr;</span> {(s.new_indicators || []).join(', ')}
                      </p>
                      <p className="text-gray-600 mt-0.5">{formatDateTime(s.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Grant comp modal */}
      <GrantCompModal open={showGrantModal} onClose={() => setShowGrantModal(false)} onGranted={loadSubs} />

      {/* Stripe sync modal */}
      {selected && (
        <StripeSyncModal
          open={syncModalOpen}
          onClose={() => setSyncModalOpen(false)}
          subscriptionId={selected.id}
          onSynced={() => { loadSubs(); if (selected) openSub(selected); }}
        />
      )}

      {/* Refund modal */}
      {selected && (
        <RefundModal
          open={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          subscriptionId={selected.id}
          customerEmail={selected.user_email}
        />
      )}

      {/* Confirm force cancel */}
      <ConfirmModal
        open={!!confirmForceCancel}
        onClose={() => setConfirmForceCancel(null)}
        onConfirm={async () => {
          await runAction('force_cancel', { immediate: confirmForceCancel === 'immediate' });
          setConfirmForceCancel(null);
        }}
        title={confirmForceCancel === 'immediate' ? 'Cancel immediately?' : 'Cancel at period end?'}
        message={confirmForceCancel === 'immediate'
          ? 'User loses access right now. Stripe subscription will be cancelled immediately. No refund is issued automatically.'
          : 'User keeps access until the current period ends, then the subscription stops renewing.'}
        confirmLabel={confirmForceCancel === 'immediate' ? 'Cancel now' : 'Schedule cancellation'}
        destructive={confirmForceCancel === 'immediate'}
      />

      {/* Confirm delete */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete subscription record?"
        message="This removes the subscription row from the database entirely. It does NOT cancel the Stripe subscription — use 'Cancel' for that first. Use this only for orphan rows or corrections."
        typeToConfirm="DELETE"
        confirmLabel="Delete record"
        destructive
      />
    </div>
  );
}

// ── GRANT COMP MODAL ──
function GrantCompModal({ open, onClose, onGranted }: { open: boolean; onClose: () => void; onGranted: () => void }) {
  const [email, setEmail] = useState('');
  const [tvUsername, setTvUsername] = useState('');
  const [plan, setPlan] = useState<'starter' | 'advantage' | 'elite'>('elite');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [indicators, setIndicators] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail(''); setTvUsername(''); setPlan('elite'); setBilling('annual');
      setIndicators([]); setNote(''); setLoading(false); setErr(null);
    }
  }, [open]);

  const toggleInd = (ind: string) => {
    setIndicators((prev) => prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]);
  };

  const handleSubmit = async () => {
    if (!email.trim()) { setErr('Email required'); return; }
    setLoading(true); setErr(null);
    try {
      const payload: any = { email: email.trim(), plan, billing, note, tradingviewUsername: tvUsername.trim() };
      if (plan !== 'elite') payload.indicators = indicators;
      const res = await adminFetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      onGranted();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Grant complimentary subscription</h3>
            <p className="text-sm text-gray-500">No Stripe charge. Creates an active sub linked to the email.</p>
          </div>

          {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Customer email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">TradingView username (optional)</label>
            <input value={tvUsername} onChange={(e) => setTvUsername(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Plan</label>
            <div className="flex gap-2">
              {(['starter', 'advantage', 'elite'] as const).map((p) => (
                <button key={p} onClick={() => { setPlan(p); if (p === 'elite') setIndicators(ALL_INDICATORS); }} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${plan === p ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Billing cycle</label>
            <div className="flex gap-2">
              {(['monthly', 'annual'] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${billing === b ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{b}</button>
              ))}
            </div>
          </div>

          {plan !== 'elite' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Indicators {plan === 'starter' && '(pick 1)'} {plan === 'advantage' && '(pick 2)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_INDICATORS.map((ind) => {
                  const checked = indicators.includes(ind);
                  return (
                    <button key={ind} onClick={() => toggleInd(ind)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${checked ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'bg-white/5 border border-white/10 text-gray-400'}`}>{ind}</button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Influencer partnership Q2" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>

        <div className="flex gap-2 p-4 bg-white/[0.02] border-t border-white/5">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-50">
            {loading ? 'Granting...' : 'Grant subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, loading, tone = 'default' }: {
  icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void;
  loading?: boolean; tone?: 'default' | 'positive' | 'warning' | 'destructive';
}) {
  const toneMap = {
    default:     'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10',
    positive:    'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20',
    warning:     'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
    destructive: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
  };
  return (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${toneMap[tone]}`}>
      <Icon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}

// ── STRIPE SYNC MODAL ──
function StripeSyncModal({
  open, onClose, subscriptionId, onSynced,
}: {
  open: boolean; onClose: () => void; subscriptionId: string; onSynced: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [diff, setDiff] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDiff(null); setErr(null); setSuccess(null); return;
    }
    setLoading(true);
    adminFetch(`/api/admin/subscriptions/${subscriptionId}/stripe-sync`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setDiff(d);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open, subscriptionId]);

  const applySync = async () => {
    setSyncing(true); setErr(null);
    try {
      const res = await adminFetch(`/api/admin/subscriptions/${subscriptionId}/stripe-sync`, { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Sync failed');
      setSuccess(d.message || 'Sync complete. Your DB now matches Stripe.');
      onSynced();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Sync from Stripe</h3>
          </div>
          <p className="text-xs text-gray-500">
            Pulls the current state from Stripe and shows what would change in your DB. Nothing is written until you confirm.
          </p>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}
          {success && <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm">{success}</div>}

          {diff && !success && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-xs">
                <p className="text-gray-400 mb-2">Stripe reports:</p>
                <p className="text-white">
                  Status: <span className="font-mono text-sky-400">{diff.stripeStatus}</span>
                  {diff.stripeCancelAtPeriodEnd && <span className="ml-2 text-amber-400">(cancel at period end)</span>}
                </p>
              </div>

              {diff.anyChanges ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-400 font-semibold">Fields that will change:</p>
                  {diff.diffs.filter((d: any) => d.willChange).map((d: any) => (
                    <div key={d.field} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                      <p className="text-gray-400 font-mono">{d.field}</p>
                      <div className="flex items-center gap-2 mt-1 font-mono">
                        <span className="text-red-400 line-through truncate">{String(d.dbValue ?? 'null')}</span>
                        <span className="text-gray-600">→</span>
                        <span className="text-teal-400 truncate">{String(d.stripeValue ?? 'null')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-teal-400">Already in sync. Nothing to change.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 bg-white/[0.02] border-t border-white/5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
            {success ? 'Close' : 'Cancel'}
          </button>
          {diff?.anyChanges && !success && (
            <button onClick={applySync} disabled={syncing} className="flex-1 px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-semibold hover:bg-sky-500/30 transition-colors disabled:opacity-50">
              {syncing ? 'Applying...' : 'Apply Stripe state'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REFUND MODAL ──
function RefundModal({
  open, onClose, subscriptionId, customerEmail,
}: {
  open: boolean; onClose: () => void; subscriptionId: string; customerEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const [charges, setCharges] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCharge, setSelectedCharge] = useState<string | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('requested_by_customer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCharges([]); setErr(null); setSuccess(null); setSelectedCharge(null);
      setRefundType('full'); setPartialAmount(''); setReason('requested_by_customer');
      return;
    }
    setLoading(true);
    adminFetch(`/api/admin/subscriptions/${subscriptionId}/refund`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else {
          setCharges(d.charges || []);
          if (d.charges && d.charges.length > 0) setSelectedCharge(d.charges[0].chargeId);
        }
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [open, subscriptionId]);

  const submitRefund = async () => {
    if (!selectedCharge) return;
    setSubmitting(true); setErr(null);
    try {
      const charge = charges.find((c) => c.chargeId === selectedCharge);
      if (!charge) throw new Error('Charge not found');

      const body: any = { chargeId: selectedCharge, reason };
      if (refundType === 'partial') {
        const amountCents = Math.round(parseFloat(partialAmount) * 100);
        if (!amountCents || amountCents <= 0 || amountCents > charge.amountRefundable) {
          throw new Error(`Partial amount must be between 0.01 and ${(charge.amountRefundable / 100).toFixed(2)}`);
        }
        body.amountCents = amountCents;
      }

      const res = await adminFetch(`/api/admin/subscriptions/${subscriptionId}/refund`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Refund failed');
      setSuccess(`Refund issued: ${d.refund.currency} ${(d.refund.amount / 100).toFixed(2)}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  const selected = charges.find((c) => c.chargeId === selectedCharge);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Issue refund</h3>
          </div>
          <p className="text-xs text-gray-500">For <span className="text-white">{customerEmail}</span></p>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{err}</div>}
          {success && <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm">{success}</div>}

          {!success && charges.length === 0 && !loading && !err && (
            <p className="text-sm text-gray-500">No refundable charges found for this subscription.</p>
          )}

          {!success && charges.length > 0 && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Choose invoice to refund:</label>
                <div className="space-y-1 max-h-44 overflow-y-auto">
                  {charges.map((c) => (
                    <button
                      key={c.chargeId}
                      onClick={() => setSelectedCharge(c.chargeId)}
                      disabled={c.amountRefundable === 0}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        selectedCharge === c.chargeId
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      } ${c.amountRefundable === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{c.invoiceNumber || c.chargeId.slice(-10)}</span>
                        <span className="text-white font-semibold">{c.currency} {(c.amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-0.5 text-gray-500">
                        <span>{c.paidAt ? new Date(c.paidAt).toLocaleDateString() : ''}</span>
                        <span>
                          {c.amountRefunded > 0 && `Refunded: ${(c.amountRefunded / 100).toFixed(2)} · `}
                          Refundable: {(c.amountRefundable / 100).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selected && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Refund amount:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRefundType('full')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          refundType === 'full'
                            ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}
                      >
                        Full ({selected.currency} {(selected.amountRefundable / 100).toFixed(2)})
                      </button>
                      <button
                        onClick={() => setRefundType('partial')}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          refundType === 'partial'
                            ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}
                      >
                        Partial
                      </button>
                    </div>
                  </div>

                  {refundType === 'partial' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Amount in {selected.currency} (max {(selected.amountRefundable / 100).toFixed(2)})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="requested_by_customer">Requested by customer</option>
                      <option value="duplicate">Duplicate charge</option>
                      <option value="fraudulent">Fraudulent</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 p-4 bg-white/[0.02] border-t border-white/5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && charges.length > 0 && (
            <button
              onClick={submitRefund}
              disabled={submitting || !selectedCharge}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold hover:bg-purple-500/30 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Processing...' : 'Issue refund'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
