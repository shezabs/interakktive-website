'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, CreditCard, AlertTriangle, Clock, DollarSign, UserPlus, XCircle } from 'lucide-react';
import { MetricCard, Section, PlanBadge, formatCurrency, formatRelative } from './components/shared';

interface OverviewData {
  metrics: {
    activeSubsCount: number;
    pastDueCount: number;
    compSubsCount: number;
    needsTvInviteCount: number;
    newSubs7d: number;
    cancelled7d: number;
    churnRate30d: string;
    totalUsers: number;
    newUsers7d: number;
    orphanSubsCount: number;
    mrrCents: number;
    mrrSource: string;
  };
  alerts: {
    pastDue: Array<{ id: string; email: string; plan: string }>;
    needsTvInvite: Array<{ id: string; email: string; plan: string }>;
    orphanSubs: Array<{ id: string; email: string; plan: string }>;
  };
  recentActivity: Array<{
    type: string;
    timestamp: string;
    description: string;
    targetId?: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400">
        <p className="font-semibold mb-1">Failed to load overview</p>
        <p className="text-sm text-red-300/80">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const { metrics, alerts, recentActivity } = data;
  const hasAlerts = alerts.pastDue.length > 0 || alerts.needsTvInvite.length > 0 || alerts.orphanSubs.length > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Overview</h1>
        <p className="text-sm text-gray-500">Snapshot of the current admin state.</p>
      </div>

      {/* Alert strip */}
      {hasAlerts && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-amber-400">Needs your attention</p>
              <div className="space-y-1 text-sm text-gray-300">
                {alerts.pastDue.length > 0 && (
                  <p>&middot; <strong className="text-red-400">{alerts.pastDue.length}</strong> past due — payment failed, access should be reviewed</p>
                )}
                {alerts.needsTvInvite.length > 0 && (
                  <p>&middot; <strong className="text-amber-400">{alerts.needsTvInvite.length}</strong> awaiting TradingView invite</p>
                )}
                {alerts.orphanSubs.length > 0 && (
                  <p>&middot; <strong className="text-amber-400">{alerts.orphanSubs.length}</strong> paid subs with no matched user account</p>
                )}
              </div>
              <Link href="/admin/subscriptions" className="inline-block text-xs text-amber-400 hover:text-amber-300 mt-1">
                Review in Subscriptions &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top metrics */}
      <Section title="Revenue & growth">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="MRR"
            value={formatCurrency(metrics.mrrCents)}
            sublabel={metrics.mrrSource === 'stripe' ? 'Live from Stripe' : 'Estimated (Stripe unreachable)'}
            tone="positive"
            icon={DollarSign}
          />
          <MetricCard
            label="Active subs"
            value={metrics.activeSubsCount}
            sublabel={`${metrics.compSubsCount} comp`}
            icon={CreditCard}
          />
          <MetricCard
            label="New subs · 7d"
            value={metrics.newSubs7d}
            tone={metrics.newSubs7d > 0 ? 'positive' : 'default'}
            icon={TrendingUp}
          />
          <MetricCard
            label="Churn · 30d"
            value={`${metrics.churnRate30d}%`}
            tone={parseFloat(metrics.churnRate30d) > 5 ? 'warning' : 'default'}
            icon={XCircle}
          />
        </div>
      </Section>

      <Section title="Users & health">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total users"
            value={metrics.totalUsers}
            icon={Users}
          />
          <MetricCard
            label="New users · 7d"
            value={metrics.newUsers7d}
            tone={metrics.newUsers7d > 0 ? 'positive' : 'default'}
            icon={UserPlus}
          />
          <MetricCard
            label="Past due"
            value={metrics.pastDueCount}
            tone={metrics.pastDueCount > 0 ? 'negative' : 'default'}
            icon={AlertTriangle}
          />
          <MetricCard
            label="Needs TV invite"
            value={metrics.needsTvInviteCount}
            tone={metrics.needsTvInviteCount > 0 ? 'warning' : 'default'}
            icon={Clock}
          />
        </div>
      </Section>

      {/* Recent activity */}
      <Section title="Recent activity"
        right={<span className="text-xs text-gray-500">Latest 20 events</span>}
      >
        <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No recent activity.</div>
          ) : (
            recentActivity.map((item, i) => (
              <div key={i} className="p-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${
                  item.type === 'subscription' ? 'bg-teal-400' :
                  item.type === 'audit' ? 'bg-amber-400' :
                  item.type === 'swap' ? 'bg-sky-400' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{item.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{formatRelative(item.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Alert detail lists */}
      {alerts.needsTvInvite.length > 0 && (
        <Section title="Waiting for TradingView invite"
          right={<Link href="/admin/subscriptions?filter=needs_invite" className="text-xs text-amber-400 hover:text-amber-300">View all &rarr;</Link>}
        >
          <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
            {alerts.needsTvInvite.slice(0, 5).map((s) => (
              <Link key={s.id} href={`/admin/subscriptions?open=${s.id}`} className="p-3 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                <span className="text-sm text-gray-300">{s.email}</span>
                <PlanBadge plan={s.plan} />
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
