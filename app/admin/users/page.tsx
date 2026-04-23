'use client';
import { adminFetch } from '../lib-client';

import { useEffect, useState } from 'react';
import { Mail, Ban, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Drawer from '../components/Drawer';
import ConfirmModal from '../components/ConfirmModal';
import { StatusBadge, PlanBadge, formatDate, formatDateTime, formatRelative } from '../components/shared';

interface UserRow {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  provider: string;
  tradingviewUsername: string | null;
  subscriptionCount: number;
  currentPlan: string | null;
  propAccountCount: number;
  certsEarned: number;
}

interface UserDetail {
  user: any;
  subscriptions: any[];
  propAccounts: any[];
  swapHistory: any[];
  certificates: any[];
  progress: any[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [editingTv, setEditingTv] = useState(false);
  const [tvDraft, setTvDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    adminFetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setUsers(d.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const openUser = async (u: UserRow) => {
    setSelectedUser(u);
    setDetailLoading(true);
    setUserDetail(null);
    setActionMsg(null);
    setEditingTv(false);
    try {
      const r = await adminFetch(`/api/admin/users/${u.id}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setUserDetail(d);
      setTvDraft(d.user?.tradingviewUsername || '');
    } catch (err: any) {
      setActionMsg(`Failed to load: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setUserDetail(null);
    setActionMsg(null);
    setEditingTv(false);
  };

  const runAction = async (action: string, body: any = {}) => {
    if (!selectedUser) return;
    setActionLoading(action);
    setActionMsg(null);
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Action failed');
      setActionMsg(d.message || 'Done.');
      // Reload detail
      await openUser(selectedUser);
      // Reload list to reflect changes
      loadUsers();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Delete failed');
      setConfirmDelete(false);
      closeDrawer();
      loadUsers();
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
      setConfirmDelete(false);
    }
  };

  const columns: Column<UserRow>[] = [
    {
      key: 'email', header: 'Email', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <span className="text-white truncate max-w-[220px]">{u.email}</span>
          {!u.emailConfirmed && <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
        </div>
      ),
    },
    {
      key: 'tradingviewUsername', header: 'TV Username',
      sortValue: (u) => u.tradingviewUsername || '',
      render: (u) => u.tradingviewUsername || <span className="text-gray-600 text-xs">—</span>,
    },
    {
      key: 'provider', header: 'Method', sortable: true,
      render: (u) => <span className="text-xs text-gray-400 capitalize">{u.provider}</span>,
    },
    {
      key: 'currentPlan', header: 'Plan', sortable: true,
      sortValue: (u) => u.currentPlan || '',
      render: (u) => u.currentPlan ? <PlanBadge plan={u.currentPlan} /> : <span className="text-xs text-gray-600">None</span>,
    },
    {
      key: 'propAccountCount', header: 'Prop', sortable: true,
      render: (u) => <span className="text-xs text-gray-400">{u.propAccountCount}</span>,
    },
    {
      key: 'certsEarned', header: 'Certs', sortable: true,
      render: (u) => <span className="text-xs text-gray-400">{u.certsEarned}</span>,
    },
    {
      key: 'createdAt', header: 'Signed up', sortable: true,
      sortValue: (u) => new Date(u.createdAt).getTime(),
      render: (u) => <span className="text-xs text-gray-500">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'lastSignInAt', header: 'Last seen', sortable: true,
      sortValue: (u) => u.lastSignInAt ? new Date(u.lastSignInAt).getTime() : 0,
      render: (u) => <span className="text-xs text-gray-500">{formatRelative(u.lastSignInAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Users</h1>
          <p className="text-sm text-gray-500">All registered accounts in Supabase Auth.</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
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
          rows={users}
          rowKey={(u) => u.id}
          onRowClick={openUser}
          searchFields={(u) => `${u.email} ${u.tradingviewUsername || ''} ${u.currentPlan || ''}`}
          searchPlaceholder="Search by email or TV username..."
          emptyMessage="No users yet."
        />
      )}

      {/* Detail drawer */}
      <Drawer
        open={!!selectedUser}
        onClose={closeDrawer}
        title={selectedUser?.email || ''}
        subtitle={selectedUser ? `Signed up ${formatDate(selectedUser.createdAt)}` : ''}
        width="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : userDetail ? (
          <div className="space-y-6">
            {actionMsg && (
              <div className={`p-3 rounded-lg text-sm ${
                actionMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
              }`}>{actionMsg}</div>
            )}

            {/* Summary */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Account</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Email" value={userDetail.user.email} />
                <Field label="Provider" value={userDetail.user.provider} />
                <Field label="Email verified" value={userDetail.user.emailConfirmed ? 'Yes' : 'No'} tone={userDetail.user.emailConfirmed ? 'positive' : 'negative'} />
                <Field label="Last sign-in" value={userDetail.user.lastSignInAt ? formatDateTime(userDetail.user.lastSignInAt) : 'Never'} />
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">TradingView username</p>
                  {editingTv ? (
                    <div className="flex gap-2">
                      <input
                        value={tvDraft}
                        onChange={(e) => setTvDraft(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                        placeholder="TradingView username"
                      />
                      <button
                        onClick={() => runAction('update_tv_username', { tradingviewUsername: tvDraft })}
                        disabled={actionLoading === 'update_tv_username'}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/30 disabled:opacity-50"
                      >Save</button>
                      <button
                        onClick={() => { setEditingTv(false); setTvDraft(userDetail.user.tradingviewUsername || ''); }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10"
                      >Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-sm text-white font-mono">{userDetail.user.tradingviewUsername || <span className="text-gray-600">not set</span>}</span>
                      <button onClick={() => setEditingTv(true)} className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  icon={Mail}
                  label="Resend verification"
                  onClick={() => runAction('resend_verification')}
                  loading={actionLoading === 'resend_verification'}
                />
                {userDetail.user.banned ? (
                  <ActionButton
                    icon={CheckCircle2}
                    label="Unban user"
                    tone="positive"
                    onClick={() => runAction('unban')}
                    loading={actionLoading === 'unban'}
                  />
                ) : (
                  <ActionButton
                    icon={Ban}
                    label="Ban user"
                    tone="warning"
                    onClick={() => runAction('ban')}
                    loading={actionLoading === 'ban'}
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  label="Delete user"
                  tone="destructive"
                  onClick={() => setConfirmDelete(true)}
                />
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">
                Subscriptions ({userDetail.subscriptions.length})
              </h3>
              {userDetail.subscriptions.length === 0 ? (
                <p className="text-sm text-gray-500">No subscriptions.</p>
              ) : (
                <div className="space-y-2">
                  {userDetail.subscriptions.map((s: any) => (
                    <div key={s.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <PlanBadge plan={s.plan} />
                          <StatusBadge status={s.status} />
                          <span className="text-xs text-gray-500">{s.billing}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(s.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{(s.indicators || []).join(' · ')}</p>
                      {s.admin_notes && <p className="text-xs text-amber-400/60 mt-1">&middot; {s.admin_notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prop accounts */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">
                Prop accounts ({userDetail.propAccounts.length})
              </h3>
              {userDetail.propAccounts.length === 0 ? (
                <p className="text-sm text-gray-500">No prop accounts.</p>
              ) : (
                <div className="space-y-2">
                  {userDetail.propAccounts.map((p: any) => (
                    <div key={p.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-semibold">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.account_type} &middot; {p.currency} {p.balance?.toLocaleString()}</p>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(p.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap history */}
            {userDetail.swapHistory.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">
                  Swap history ({userDetail.swapHistory.length})
                </h3>
                <div className="space-y-1">
                  {userDetail.swapHistory.map((s: any) => (
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

            {/* Academy */}
            {(userDetail.certificates.length > 0 || userDetail.progress.length > 0) && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">
                  Academy &middot; {userDetail.certificates.length} certs &middot; {userDetail.progress.length} lessons touched
                </h3>
                <p className="text-xs text-gray-500">Full Academy management lands in Round 2.</p>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this user?"
        message={
          `This permanently deletes the user, all their subscriptions, prop accounts, trades, swap history, and Academy progress.\n\nThis cannot be undone.`
        }
        typeToConfirm="DELETE"
        confirmLabel="Delete user"
        destructive
      />
    </div>
  );
}

// ── SMALL HELPERS ──
function Field({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' | 'default' }) {
  const toneClass = tone === 'positive' ? 'text-teal-400' : tone === 'negative' ? 'text-red-400' : 'text-white';
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm ${toneClass}`}>{value}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon, label, onClick, loading, tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  loading?: boolean;
  tone?: 'default' | 'positive' | 'warning' | 'destructive';
}) {
  const toneMap = {
    default:     'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10',
    positive:    'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20',
    warning:     'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
    destructive: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${toneMap[tone]}`}
    >
      <Icon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}
