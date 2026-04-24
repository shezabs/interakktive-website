'use client';
import { adminFetch } from '../lib-client';

import { useEffect, useState } from 'react';
import { RefreshCw, User, FileText, Download } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Drawer from '../components/Drawer';
import { formatDateTime, formatRelative } from '../components/shared';

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  before_data: any;
  after_data: any;
  ip_address: string | null;
  created_at: string;
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  // Filter state
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  const loadEntries = () => {
    setLoading(true);
    adminFetch('/api/admin/audit')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEntries(d.entries || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEntries(); }, []);

  // Filter entries
  const filtered = entries.filter((e) => {
    if (adminFilter !== 'all' && !e.admin_email.startsWith(adminFilter)) return false;
    if (targetTypeFilter !== 'all' && e.target_type !== targetTypeFilter) return false;
    return true;
  });

  // Collect unique admins and target types for filter chips
  const uniqueAdmins = Array.from(new Set(entries.map((e) => e.admin_email.split('@')[0])));
  const uniqueTargetTypes = Array.from(new Set(entries.map((e) => e.target_type)));

  const columns: Column<AuditEntry>[] = [
    {
      key: 'created_at', header: 'When', sortable: true,
      sortValue: (e) => new Date(e.created_at).getTime(),
      render: (e) => (
        <div className="text-xs">
          <div className="text-gray-300">{formatRelative(e.created_at)}</div>
          <div className="text-gray-600">{formatDateTime(e.created_at)}</div>
        </div>
      ),
    },
    {
      key: 'admin_email', header: 'Admin', sortable: true,
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <User className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-sm text-white">{e.admin_email.split('@')[0]}</span>
        </div>
      ),
    },
    {
      key: 'action', header: 'Action', sortable: true,
      render: (e) => <span className="text-xs font-mono text-sky-400">{e.action}</span>,
    },
    {
      key: 'target_type', header: 'Target type', sortable: true,
      render: (e) => <span className="text-xs text-gray-400 capitalize">{e.target_type}</span>,
    },
    {
      key: 'target_id', header: 'Target ID',
      render: (e) => <span className="text-xs font-mono text-gray-500 truncate block max-w-[160px]">{e.target_id || '—'}</span>,
    },
    {
      key: 'ip_address', header: 'IP',
      render: (e) => <span className="text-xs font-mono text-gray-600">{e.ip_address || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Audit Log</h1>
          <p className="text-sm text-gray-500">Every admin action, with before/after snapshots.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const res = await adminFetch('/api/admin/export?type=audit');
                if (!res.ok) throw new Error('Export failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
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
            onClick={loadEntries}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Admin:</span>
          <button
            onClick={() => setAdminFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              adminFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >All</button>
          {uniqueAdmins.map((a) => (
            <button
              key={a}
              onClick={() => setAdminFilter(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                adminFilter === a
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >{a}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Target:</span>
          <button
            onClick={() => setTargetTypeFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              targetTypeFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >All</button>
          {uniqueTargetTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTargetTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                targetTypeFilter === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 rounded-xl border border-white/10 bg-white/[0.02] text-center">
          <FileText className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No audit entries yet.</p>
          <p className="text-xs text-gray-600 mt-1">Entries appear here every time an admin makes a change.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={setSelected}
          searchFields={(e) => `${e.admin_email} ${e.action} ${e.target_type} ${e.target_id || ''}`}
          searchPlaceholder="Search by admin, action, target..."
          pageSize={100}
        />
      )}

      {/* Entry drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.action || ''}
        subtitle={selected ? `${selected.admin_email} · ${formatDateTime(selected.created_at)}` : ''}
        width="xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Admin</p>
                <p className="text-sm text-white">{selected.admin_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Action</p>
                <p className="text-sm font-mono text-sky-400">{selected.action}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Target type</p>
                <p className="text-sm text-white capitalize">{selected.target_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Target ID</p>
                <p className="text-sm font-mono text-gray-400 break-all">{selected.target_id || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Timestamp</p>
                <p className="text-sm text-white">{formatDateTime(selected.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">IP address</p>
                <p className="text-sm font-mono text-gray-400">{selected.ip_address || '—'}</p>
              </div>
            </div>

            <DiffBlock label="Before" data={selected.before_data} tone="red" />
            <DiffBlock label="After" data={selected.after_data} tone="teal" />
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DiffBlock({ label, data, tone }: { label: string; data: any; tone: 'red' | 'teal' }) {
  const toneClass = tone === 'red' ? 'border-red-500/20 bg-red-500/5' : 'border-teal-500/20 bg-teal-500/5';
  const labelClass = tone === 'red' ? 'text-red-400' : 'text-teal-400';

  if (data === null || data === undefined) {
    return (
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelClass}`}>{label}</p>
        <div className={`p-3 rounded-lg border ${toneClass}`}>
          <p className="text-xs text-gray-500 italic">null (no data)</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelClass}`}>{label}</p>
      <div className={`p-3 rounded-lg border ${toneClass} overflow-auto max-h-80`}>
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
