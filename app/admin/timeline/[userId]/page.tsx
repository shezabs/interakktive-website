'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, UserPlus, CheckCircle, LogIn, CreditCard, XCircle, AlertTriangle,
  Send, BarChart3, RotateCw, Shield, Award, BookOpen, Mail, Calendar
} from 'lucide-react';
import { adminFetch } from '../../lib-client';
import { formatDateTime, formatRelative, formatDate } from '../../components/shared';

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  description: string;
  icon: string;
  tone: 'positive' | 'negative' | 'warning' | 'neutral' | 'info';
  meta?: any;
}

interface TimelineData {
  user: {
    id: string;
    email: string;
    createdAt: string;
    lastSignInAt: string | null;
    emailConfirmed: boolean;
    provider: string;
    tradingviewUsername: string | null;
  };
  events: TimelineEvent[];
  totalEvents: number;
}

// Icon name → component map
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus, CheckCircle, LogIn, CreditCard, XCircle, AlertTriangle,
  Send, BarChart3, RotateCw, Shield, Award, BookOpen, Mail, Calendar,
};

// Tone → color classes
const TONES = {
  positive: { dot: 'bg-teal-400', bg: 'bg-teal-500/5', border: 'border-teal-500/20', text: 'text-teal-400' },
  negative: { dot: 'bg-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400' },
  warning:  { dot: 'bg-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
  neutral:  { dot: 'bg-gray-400', bg: 'bg-gray-500/5', border: 'border-gray-500/20', text: 'text-gray-400' },
  info:     { dot: 'bg-sky-400', bg: 'bg-sky-500/5', border: 'border-sky-500/20', text: 'text-sky-400' },
};

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    adminFetch(`/api/admin/timeline/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // Event type filter
  const filtered = (data?.events || []).filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'subs') return e.type.startsWith('subscription') || e.type === 'tv_invite_sent';
    if (filter === 'prop') return e.type.startsWith('prop_');
    if (filter === 'academy') return e.type === 'certificate_earned' || e.type === 'lesson_completed';
    if (filter === 'admin') return e.type === 'admin_action';
    if (filter === 'auth') return e.type === 'signup' || e.type === 'email_confirmed' || e.type === 'last_signin';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
          {error || 'Failed to load timeline'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1">{data.user.email}</h1>
            <p className="text-sm text-gray-500">
              {data.totalEvents} {data.totalEvents === 1 ? 'event' : 'events'} · Member since {formatDate(data.user.createdAt)}
            </p>
          </div>
          <Link
            href={`/admin/users?open=${data.user.id}`}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Edit user &rarr;
          </Link>
        </div>
      </div>

      {/* User summary card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">TV username</p>
          <p className="text-sm font-mono text-white truncate">{data.user.tradingviewUsername || '—'}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Provider</p>
          <p className="text-sm text-white capitalize">{data.user.provider}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Email verified</p>
          <p className={`text-sm ${data.user.emailConfirmed ? 'text-teal-400' : 'text-red-400'}`}>
            {data.user.emailConfirmed ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-gray-500">Last sign-in</p>
          <p className="text-sm text-white">{formatRelative(data.user.lastSignInAt)}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: 'All events' },
          { id: 'auth', label: 'Auth' },
          { id: 'subs', label: 'Subscriptions' },
          { id: 'prop', label: 'Prop' },
          { id: 'academy', label: 'Academy' },
          { id: 'admin', label: 'Admin actions' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >{f.label}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 pl-8 py-8">No events match this filter.</p>
          ) : filtered.map((event) => {
            const Icon = ICONS[event.icon] || CheckCircle;
            const tone = TONES[event.tone];
            return (
              <div key={event.id} className="relative flex items-start gap-4 pl-0">
                {/* Dot */}
                <div className={`relative z-10 shrink-0 w-6 h-6 rounded-full ${tone.bg} border-2 ${tone.border} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${tone.text}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{formatRelative(event.timestamp)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
