'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Users, CreditCard, AlertTriangle, Clock, DollarSign, UserPlus, XCircle,
  CheckCircle2, ArrowRight, BarChart3, Target, Zap,
} from 'lucide-react';
import { adminFetch } from './lib-client';
import { useAdmin } from './admin-context';
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
  const { user } = useAdmin();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/overview')
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

  // Build the "Things to do" action list
  const todoItems: Array<{
    icon: React.ComponentType<{ className?: string }>;
    tone: 'urgent' | 'warning' | 'info';
    title: string;
    description: string;
    href: string;
  }> = [];

  if (metrics.pastDueCount > 0) {
    todoItems.push({
      icon: AlertTriangle,
      tone: 'urgent',
      title: `${metrics.pastDueCount} ${metrics.pastDueCount === 1 ? 'payment has' : 'payments have'} failed`,
      description: 'Reach out before these customers churn',
      href: '/admin/subscriptions?filter=past_due',
    });
  }
  if (metrics.needsTvInviteCount > 0) {
    todoItems.push({
      icon: Clock,
      tone: 'warning',
      title: `${metrics.needsTvInviteCount} awaiting TradingView invite`,
      description: 'Grant access on TradingView, then mark as sent here',
      href: '/admin/subscriptions?filter=needs_invite',
    });
  }
  if (metrics.orphanSubsCount > 0) {
    todoItems.push({
      icon: AlertTriangle,
      tone: 'warning',
      title: `${metrics.orphanSubsCount} paid ${metrics.orphanSubsCount === 1 ? 'sub has' : 'subs have'} no user account`,
      description: 'Customer paid but never signed up — needs manual linking',
      href: '/admin/subscriptions',
    });
  }

  const toneStyles = {
    urgent:  { bg: 'bg-red-500/5',    border: 'border-red-500/20',    text: 'text-red-400',    iconBg: 'bg-red-500/10' },
    warning: { bg: 'bg-amber-500/5',  border: 'border-amber-500/20',  text: 'text-amber-400',  iconBg: 'bg-amber-500/10' },
    info:    { bg: 'bg-sky-500/5',    border: 'border-sky-500/20',    text: 'text-sky-400',    iconBg: 'bg-sky-500/10' },
  };

  // Greeting — personalized
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.email?.split('@')[0].split('.')[0] || 'there';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening at Interakktive right now.
        </p>
      </div>

      {/* ── Things to do ── */}
      {todoItems.length > 0 ? (
        <Section
          title="Things to do"
          right={<span className="text-xs text-gray-500">Prioritised</span>}
        >
          <div className="space-y-2">
            {todoItems.map((item, i) => {
              const Icon = item.icon;
              const style = toneStyles[item.tone];
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${style.bg} ${style.border} hover:bg-opacity-20 transition-colors group`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${style.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${style.text}`}>{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${style.text} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </Link>
              );
            })}
          </div>
        </Section>
      ) : (
        <div className="p-5 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-teal-400">You're all caught up</p>
            <p className="text-xs text-gray-400">No urgent items need your attention right now.</p>
          </div>
        </div>
      )}

      {/* ── Today's money ── */}
      <Section title="Today's money">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="MRR"
            value={formatCurrency(metrics.mrrCents)}
            sublabel={metrics.mrrSource === 'stripe' ? 'Live from Stripe' : 'Estimated'}
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
            label="New · 7d"
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

      {/* ── Today's health ── */}
      <Section title="Today's health">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            label="TV invites pending"
            value={metrics.needsTvInviteCount}
            tone={metrics.needsTvInviteCount > 0 ? 'warning' : 'default'}
            icon={Clock}
          />
        </div>
      </Section>

      {/* ── Quick links ── */}
      <Section title="Jump to">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLink href="/admin/revenue" icon={BarChart3} label="Revenue analytics" />
          <QuickLink href="/admin/users" icon={Users} label="All users" />
          <QuickLink href="/admin/subscriptions" icon={CreditCard} label="Subscriptions" />
          <QuickLink href="/admin/audit" icon={Target} label="Audit log" />
        </div>
      </Section>

      {/* ── Recent activity ── */}
      <Section
        title="Recent activity"
        right={<span className="text-xs text-gray-500">Latest 20 events</span>}
      >
        <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
          {recentActivity.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nothing to show yet.</p>
              <p className="text-xs text-gray-600 mt-1">Activity appears here as users subscribe, cancel, or swap indicators.</p>
            </div>
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

      {/* Hint footer */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-600">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-500">?</kbd> for keyboard shortcuts
          · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-500">⌘K</kbd> to search
        </p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      href={href}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/5 hover:border-amber-500/30 transition-colors group"
    >
      <Icon className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors mb-2" />
      <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</p>
    </Link>
  );
}
