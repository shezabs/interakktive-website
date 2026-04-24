'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, DollarSign, TrendingUp, Users, Download } from 'lucide-react';
import { adminFetch } from '../lib-client';
import { formatCurrency, formatDate, formatRelative } from '../components/shared';

interface RevenueData {
  mrrTrend: { month: string; mrrCents: number; activeCount: number }[];
  cohortRetention: { cohort: string; size: number; retention: (number | null)[] }[];
  ltvByPlan: Record<string, { avgLifetimeMonths: number; avgMonthlyValueCents: number; ltvCents: number; subCount: number }>;
  billingMix: { monthly: number; annual: number; totalActive: number };
  churnReasons: { code: string; count: number }[];
  recentChurn: any[];
  totalChurnCount: number;
}

const REASON_LABELS: Record<string, string> = {
  too_expensive:   'Too expensive',
  not_using:       'Not using it enough',
  found_competitor:'Found a competitor',
  missing_feature: 'Missing a feature',
  tech_issues:     'Technical issues',
  temporary_break: 'Just taking a break',
  other:           'Other',
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/revenue')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
        {error || 'Failed to load revenue data'}
      </div>
    );
  }

  // MRR trend: find max for scaling
  const maxMRR = Math.max(...data.mrrTrend.map((m) => m.mrrCents), 1);
  const currentMRR = data.mrrTrend[data.mrrTrend.length - 1]?.mrrCents || 0;
  const previousMRR = data.mrrTrend[data.mrrTrend.length - 2]?.mrrCents || 0;
  const mrrChange = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  // Churn total
  const totalChurn = data.churnReasons.reduce((s, r) => s + r.count, 0);
  const maxChurnCount = Math.max(...data.churnReasons.map((r) => r.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Revenue</h1>
          <p className="text-sm text-gray-500">MRR growth, cohort retention, LTV by plan, and churn analysis.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ── MRR TREND ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">MRR trend · last 12 months</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white font-bold">{formatCurrency(currentMRR)}</span>
            {previousMRR > 0 && (
              <span className={`text-xs ${mrrChange >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {mrrChange >= 0 ? '+' : ''}{mrrChange.toFixed(1)}% MoM
              </span>
            )}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          {data.mrrTrend.every((m) => m.mrrCents === 0) ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No MRR history yet. Chart populates as subscriptions accumulate.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-40">
                {data.mrrTrend.map((m, i) => {
                  const height = maxMRR > 0 ? (m.mrrCents / maxMRR) * 100 : 0;
                  const isLast = i === data.mrrTrend.length - 1;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[10px] font-mono text-gray-500 group-hover:text-amber-400 transition-colors">
                        {m.mrrCents > 0 ? formatCurrency(m.mrrCents) : ''}
                      </div>
                      <div
                        className={`w-full rounded-t transition-colors ${
                          m.mrrCents === 0
                            ? 'bg-white/[0.03] hover:bg-white/10'
                            : isLast
                              ? 'bg-amber-400/60 hover:bg-amber-400'
                              : 'bg-teal-400/40 hover:bg-teal-400/60'
                        }`}
                        style={{ height: m.mrrCents === 0 ? '1px' : `${Math.max(height, 4)}%` }}
                        title={`${m.month}: ${formatCurrency(m.mrrCents)} · ${m.activeCount} subs`}
                      />
                    </div>
                  );
                })}
              </div>
              {/* Month labels */}
              <div className="flex gap-1">
                {data.mrrTrend.map((m) => (
                  <div key={m.month} className="flex-1 text-center text-[10px] text-gray-500">
                    {m.month.slice(5)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── LTV PER PLAN ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">LTV per plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['starter', 'advantage', 'elite'] as const).map((plan) => {
            const stats = data.ltvByPlan[plan];
            if (!stats) {
              return (
                <div key={plan} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 capitalize">{plan}</p>
                  <p className="text-sm text-gray-600">No subscriptions yet</p>
                </div>
              );
            }
            return (
              <div key={plan} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 capitalize">{plan}</p>
                <p className="text-2xl font-extrabold text-teal-400 mb-3">{formatCurrency(stats.ltvCents)}</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Avg lifetime</span>
                    <span className="text-white font-mono">{stats.avgLifetimeMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg monthly value</span>
                    <span className="text-white font-mono">{formatCurrency(stats.avgMonthlyValueCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subscriptions</span>
                    <span className="text-white font-mono">{stats.subCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 italic">
          LTV = avg monthly value × avg lifetime. Active subs contribute lower-bound lifetime (still growing).
        </p>
      </section>

      {/* ── COHORT RETENTION ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Cohort retention</h2>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 overflow-x-auto">
          {data.cohortRetention.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No cohorts yet.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-2 pr-4 text-gray-400 font-medium">Cohort</th>
                  <th className="text-right pb-2 pr-4 text-gray-400 font-medium">Size</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="text-center pb-2 px-1 text-gray-400 font-medium w-12">M{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohortRetention.map((row) => (
                  <tr key={row.cohort} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-white font-mono">{row.cohort}</td>
                    <td className="py-2 pr-4 text-right text-gray-400">{row.size}</td>
                    {row.retention.map((r, i) => (
                      <td key={i} className="py-2 px-1 text-center">
                        {r === null ? (
                          <span className="text-gray-700">—</span>
                        ) : (
                          <div
                            className="rounded py-1 text-[10px] font-mono"
                            style={{
                              backgroundColor: `rgba(45, 212, 191, ${Math.max(0.05, (r / 100) * 0.5)})`,
                              color: r >= 50 ? '#fff' : '#9ca3af',
                            }}
                          >
                            {r}%
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-gray-600 italic mt-3">
            Each row: users who first subscribed in that month. M0 = signup month (100%). Mx = % of that cohort still paying x months later.
          </p>
        </div>
      </section>

      {/* ── BILLING MIX ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Billing mix · active subs</h2>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          {data.billingMix.totalActive === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">No active subscriptions yet.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly: <span className="text-white font-bold">{data.billingMix.monthly}</span></span>
                <span className="text-gray-400">Annual: <span className="text-white font-bold">{data.billingMix.annual}</span></span>
              </div>
              <div className="h-6 rounded-full overflow-hidden bg-white/5 flex">
                <div
                  className="bg-sky-500/70 h-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${(data.billingMix.monthly / data.billingMix.totalActive) * 100}%` }}
                >
                  {data.billingMix.totalActive > 0 && ((data.billingMix.monthly / data.billingMix.totalActive) * 100) > 10 && (
                    <span>{Math.round((data.billingMix.monthly / data.billingMix.totalActive) * 100)}%</span>
                  )}
                </div>
                <div
                  className="bg-purple-500/70 h-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${(data.billingMix.annual / data.billingMix.totalActive) * 100}%` }}
                >
                  {data.billingMix.totalActive > 0 && ((data.billingMix.annual / data.billingMix.totalActive) * 100) > 10 && (
                    <span>{Math.round((data.billingMix.annual / data.billingMix.totalActive) * 100)}%</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CHURN REASONS ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Churn reasons</h2>
          <span className="text-xs text-gray-500">{totalChurn} cancellations with reasons</span>
        </div>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          {data.churnReasons.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No churn reasons recorded yet. Reasons start capturing once the cancel flow is deployed.
            </div>
          ) : (
            <div className="space-y-2">
              {data.churnReasons.map((r) => {
                const pct = totalChurn > 0 ? (r.count / totalChurn) * 100 : 0;
                return (
                  <div key={r.code} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">{REASON_LABELS[r.code] || r.code}</span>
                      <span className="text-gray-400 font-mono">{r.count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-amber-400/50"
                        style={{ width: `${(r.count / maxChurnCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── RECENT CHURN DETAIL ── */}
      {data.recentChurn.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">Recent cancellations</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
            {data.recentChurn.map((c: any) => (
              <div key={c.id} className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{c.user_email}</span>
                  <span className="text-xs text-gray-500">{formatRelative(c.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {REASON_LABELS[c.reason_code] || c.reason_code}
                  </span>
                  <span>{c.plan} · {c.billing}</span>
                </div>
                {c.reason_text && (
                  <p className="text-xs text-gray-500 italic mt-1">"{c.reason_text}"</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
