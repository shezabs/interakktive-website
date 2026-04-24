'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, Trash2, Download, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { adminFetch } from '../lib-client';
import DataTable, { Column } from '../components/DataTable';
import Drawer from '../components/Drawer';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate, formatDateTime, formatRelative } from '../components/shared';

interface PropAccount {
  id: string;
  userId: string;
  userEmail: string | null;
  name: string;
  accountType: string;
  phase: string;
  currency: string;
  startingBalance: number;
  profitTargetPct: number;
  dailyDdPct: number;
  maxDdPct: number;
  isActive: boolean;
  createdAt: string;
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  totalPnl: number;
  totalR: number;
  winRate: number;
}

export default function AdminPropPage() {
  const [accounts, setAccounts] = useState<PropAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PropAccount | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/prop')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAccounts(d.accounts || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAccount = async (acc: PropAccount) => {
    setSelected(acc);
    setDetailLoading(true);
    setDetail(null);
    try {
      const r = await adminFetch(`/api/admin/prop/accounts/${acc.id}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setDetail(d);
    } catch (e: any) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await adminFetch(`/api/admin/prop/accounts/${selected.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setConfirmDelete(false);
      setSelected(null);
      setDetail(null);
      load();
    } catch (e: any) {
      console.error(e);
      setConfirmDelete(false);
    }
  };

  const handleExport = async (kind: 'prop_accounts' | 'prop_trades') => {
    setExportLoading(kind);
    try {
      const res = await adminFetch(`/api/admin/export?type=${kind}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
    } finally {
      setExportLoading(null);
    }
  };

  // Apply filter
  const filtered = accounts.filter((a) => {
    if (typeFilter === 'all') return true;
    return a.accountType === typeFilter;
  });

  // Collect unique account types for filter chips
  const uniqueTypes = Array.from(new Set(accounts.map((a) => a.accountType)));

  // Summary stats
  const totalAccounts = accounts.length;
  const totalTrades = accounts.reduce((s, a) => s + a.totalTrades, 0);
  const totalPnl = accounts.reduce((s, a) => s + a.totalPnl, 0);
  const avgWinRate = accounts.filter(a => a.closedTrades > 0).length > 0
    ? accounts.filter(a => a.closedTrades > 0).reduce((s, a) => s + a.winRate, 0) / accounts.filter(a => a.closedTrades > 0).length
    : 0;

  const columns: Column<PropAccount>[] = [
    {
      key: 'userEmail', header: 'User', sortable: true,
      sortValue: (a) => a.userEmail || '',
      render: (a) => (
        <div className="flex items-center gap-2">
          <span className="text-white truncate max-w-[200px]">{a.userEmail || '—'}</span>
          {a.userId && (
            <Link
              href={`/admin/timeline/${a.userId}`}
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
      key: 'name', header: 'Account', sortable: true,
      render: (a) => <span className="text-sm text-white">{a.name}</span>,
    },
    {
      key: 'accountType', header: 'Type', sortable: true,
      render: (a) => <span className="text-xs text-gray-400 capitalize">{a.accountType.replace('_', ' ')}</span>,
    },
    {
      key: 'phase', header: 'Phase',
      render: (a) => <span className="text-xs text-gray-400">{a.phase || '—'}</span>,
    },
    {
      key: 'startingBalance', header: 'Balance', sortable: true,
      render: (a) => (
        <span className="text-xs text-gray-400">
          {a.currency} {a.startingBalance?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      key: 'totalTrades', header: 'Trades', sortable: true,
      render: (a) => (
        <span className="text-xs text-gray-400">
          {a.closedTrades} <span className="text-gray-600">({a.openTrades} open)</span>
        </span>
      ),
    },
    {
      key: 'winRate', header: 'Win rate', sortable: true,
      render: (a) => (
        a.closedTrades > 0
          ? <span className={`text-xs ${a.winRate >= 50 ? 'text-teal-400' : 'text-red-400'}`}>{a.winRate.toFixed(1)}%</span>
          : <span className="text-xs text-gray-600">—</span>
      ),
    },
    {
      key: 'totalPnl', header: 'P&L', sortable: true,
      render: (a) => (
        a.closedTrades > 0
          ? <span className={`text-xs font-mono ${a.totalPnl >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
              {a.totalPnl >= 0 ? '+' : ''}{a.totalPnl.toFixed(2)}
            </span>
          : <span className="text-xs text-gray-600">—</span>
      ),
    },
    {
      key: 'totalR', header: 'R',
      render: (a) => (
        a.closedTrades > 0
          ? <span className={`text-xs font-mono ${a.totalR >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
              {a.totalR >= 0 ? '+' : ''}{a.totalR.toFixed(2)}R
            </span>
          : <span className="text-xs text-gray-600">—</span>
      ),
    },
    {
      key: 'createdAt', header: 'Created', sortable: true,
      sortValue: (a) => new Date(a.createdAt).getTime(),
      render: (a) => <span className="text-xs text-gray-500">{formatDate(a.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Prop Accounts</h1>
          <p className="text-sm text-gray-500">All prop challenge and funded accounts across users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('prop_accounts')}
            disabled={exportLoading === 'prop_accounts'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export accounts
          </button>
          <button
            onClick={() => handleExport('prop_trades')}
            disabled={exportLoading === 'prop_trades'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export trades
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Total accounts</p>
          <p className="text-xl font-bold text-white">{totalAccounts}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Total trades</p>
          <p className="text-xl font-bold text-white">{totalTrades.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Total P&L</p>
          <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Avg win rate</p>
          <p className="text-xl font-bold text-white">{avgWinRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filter chips */}
      {uniqueTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              typeFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >All</button>
          {uniqueTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                typeFilter === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >{t.replace('_', ' ')}</button>
          ))}
        </div>
      )}

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 rounded-xl border border-white/10 bg-white/[0.02] text-center">
          <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No prop accounts yet.</p>
          <p className="text-xs text-gray-600 mt-1">Accounts appear here once users create them via the prop dashboard.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(a) => a.id}
          onRowClick={openAccount}
          searchFields={(a) => `${a.userEmail || ''} ${a.name} ${a.phase || ''}`}
          searchPlaceholder="Search by email, account name, phase..."
        />
      )}

      <Drawer
        open={!!selected}
        onClose={() => { setSelected(null); setDetail(null); }}
        title={selected?.name || ''}
        subtitle={selected ? `${selected.userEmail} · ${selected.accountType}` : ''}
        width="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selected && detail ? (
          <div className="space-y-6">
            {/* Account info */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Account</h3>
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <Field label="Name" value={selected.name} />
                <Field label="Type" value={selected.accountType.replace('_', ' ')} />
                <Field label="Phase" value={selected.phase || '—'} />
                <Field label="Starting balance" value={`${selected.currency} ${selected.startingBalance?.toLocaleString() || 0}`} />
                <Field label="Profit target" value={selected.profitTargetPct ? `${selected.profitTargetPct}%` : '—'} />
                <Field label="Daily DD" value={selected.dailyDdPct ? `${selected.dailyDdPct}%` : '—'} />
                <Field label="Max DD" value={selected.maxDdPct ? `${selected.maxDdPct}%` : '—'} />
                <Field label="Active" value={selected.isActive ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Performance stats */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <MetricSmall label="Closed" value={selected.closedTrades.toString()} />
                <MetricSmall label="Open" value={selected.openTrades.toString()} />
                <MetricSmall label="Win rate" value={selected.closedTrades > 0 ? `${selected.winRate.toFixed(1)}%` : '—'} tone={selected.winRate >= 50 ? 'positive' : 'negative'} />
                <MetricSmall label="Total R" value={selected.closedTrades > 0 ? `${selected.totalR >= 0 ? '+' : ''}${selected.totalR.toFixed(2)}R` : '—'} tone={selected.totalR >= 0 ? 'positive' : 'negative'} />
              </div>
            </div>

            {/* Recent trades */}
            {detail.trades && detail.trades.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60 mb-3">
                  Recent trades ({detail.trades.length})
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {detail.trades.slice(0, 30).map((t: any) => (
                    <div key={t.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {t.direction === 'long' ? <TrendingUp className="w-3 h-3 text-teal-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                        <span className="font-mono text-gray-300">{t.symbol}</span>
                        <span className="text-gray-500 capitalize">{t.direction}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {t.pnl !== null && (
                          <span className={`font-mono ${t.pnl >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                            {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                          </span>
                        )}
                        {t.r_result !== null && (
                          <span className={`font-mono ${t.r_result >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                            {t.r_result >= 0 ? '+' : ''}{t.r_result.toFixed(2)}R
                          </span>
                        )}
                        <span className="text-gray-600">{formatRelative(t.opened_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link to timeline */}
            {selected.userId && (
              <Link
                href={`/admin/timeline/${selected.userId}`}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm hover:bg-sky-500/20 transition-colors"
              >
                View customer timeline <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete account + all trades
            </button>
          </div>
        ) : null}
      </Drawer>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete prop account?"
        message={`This permanently deletes the account "${selected?.name}", all its trades, and all its sessions. This cannot be undone.`}
        typeToConfirm="DELETE"
        confirmLabel="Delete account"
        destructive
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-white capitalize">{value}</p>
    </div>
  );
}

function MetricSmall({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'positive' | 'negative' }) {
  const toneClass = tone === 'positive' ? 'text-teal-400' : tone === 'negative' ? 'text-red-400' : 'text-white';
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
