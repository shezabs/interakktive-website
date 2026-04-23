'use client';

import { ReactNode } from 'react';

// ── STATUS BADGE ──────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    active:     { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   label: 'Active'     },
    cancelling: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Cancelling' },
    cancelled:  { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/20',   label: 'Cancelled'  },
    past_due:   { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Past Due'   },
    pending:    { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Pending'    },
    approved:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   label: 'Approved'   },
    rejected:   { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Rejected'   },
  };
  const style = map[status] || { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      {style.label}
    </span>
  );
}

// ── PLAN BADGE ────────────────────────────────────────
export function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    starter:   { bg: 'bg-sky-500/10',    text: 'text-sky-400',    label: 'Starter'   },
    advantage: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Advantage' },
    elite:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  label: 'Elite'     },
  };
  const style = map[plan] || { bg: 'bg-white/5', text: 'text-gray-400', label: plan };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// ── METRIC CARD ───────────────────────────────────────
export function MetricCard({
  label,
  value,
  sublabel,
  tone = 'default',
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const toneMap = {
    default:  'text-white',
    positive: 'text-teal-400',
    negative: 'text-red-400',
    warning:  'text-amber-400',
  };
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
      </div>
      <p className={`text-2xl font-extrabold ${toneMap[tone]}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  );
}

// ── SECTION ──────────────────────────────────────────
export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400/60">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

// ── FORMATTERS ────────────────────────────────────────
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function formatDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', opts || { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr  = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 30) return formatDate(iso);
    if (day > 0) return `${day}d ago`;
    if (hr > 0)  return `${hr}h ago`;
    if (min > 0) return `${min}m ago`;
    return 'just now';
  } catch {
    return iso;
  }
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  try {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
