'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  Plus, Shield, TrendingUp, AlertTriangle, ChevronRight, Trash2,
  Target, BarChart3, Clock, ArrowLeft, X, Check, Loader2, Settings
} from 'lucide-react';

// ── TYPES ────────────────────────────────────────────────────────────────────

interface PropAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  daily_dd_pct: number;
  daily_dd_calc: string;
  max_dd_pct: number;
  max_dd_type: string;
  trail_lock: boolean;
  trail_lock_pct: number;
  profit_target_pct: number;
  phase: string;
  min_days: number;
  consistency_pct: number;
  risk_pct: number;
  max_trades_per_day: number;
  is_active: boolean;
  created_at: string;
}

interface DaySummary {
  total_pnl: number;
  trades_count: number;
  wins: number;
  losses: number;
}

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];
const DD_CALC_TYPES = ['Balance-Based', 'Equity-Based', 'Intraday Trailing'];
const DD_TYPES = ['Static', 'EOD Trailing', 'Intraday Trailing'];
const PHASES = ['Phase 1', 'Phase 2', 'Funded'];

const DEFAULT_ACCOUNT: Omit<PropAccount, 'id' | 'created_at' | 'is_active'> = {
  name: '',
  balance: 100000,
  currency: 'USD',
  daily_dd_pct: 5,
  daily_dd_calc: 'Balance-Based',
  max_dd_pct: 10,
  max_dd_type: 'Static',
  trail_lock: false,
  trail_lock_pct: 10,
  profit_target_pct: 8,
  phase: 'Phase 1',
  min_days: 0,
  consistency_pct: 0,
  risk_pct: 1,
  max_trades_per_day: 3,
};

// ── GAUGE COMPONENT ──────────────────────────────────────────────────────────

function Gauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : color;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={pct >= 80 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-gray-300'}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PropDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [accounts, setAccounts] = useState<PropAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAccount, setNewAccount] = useState(DEFAULT_ACCOUNT);
  const [todaySummaries, setTodaySummaries] = useState<Record<string, DaySummary>>({});

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      await loadAccounts(u.id);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const loadAccounts = async (userId: string) => {
    const { data } = await supabase
      .from('prop_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setAccounts(data);

    // Load today's summaries for each account
    if (data && data.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions } = await supabase
        .from('prop_sessions')
        .select('account_id, total_pnl, trades_count, wins, losses')
        .eq('user_id', userId)
        .eq('session_date', today);
      if (sessions) {
        const map: Record<string, DaySummary> = {};
        sessions.forEach(s => {
          map[s.account_id] = { total_pnl: s.total_pnl, trades_count: s.trades_count, wins: s.wins, losses: s.losses };
        });
        setTodaySummaries(map);
      }
    }
  };

  const createAccount = async () => {
    if (!user || !newAccount.name.trim()) return;
    setCreating(true);
    const { error } = await supabase.from('prop_accounts').insert({
      ...newAccount,
      user_id: user.id,
      is_active: true,
    });
    if (!error) {
      await loadAccounts(user.id);
      setShowCreate(false);
      setNewAccount(DEFAULT_ACCOUNT);
    }
    setCreating(false);
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;
    if (!confirm('Delete this account and all its trades? This cannot be undone.')) return;
    await supabase.from('prop_accounts').delete().eq('id', id);
    await loadAccounts(user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/50 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-sky-400">ATLAS</span> Prop Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Prop Firm Survival Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">{user?.email}</span>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {accounts.length === 0 && !showCreate ? (
          /* ── EMPTY STATE ──────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Prop Accounts Yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Add your first prop firm account to start tracking trades, managing drawdown, and monitoring challenge progress.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Account
            </button>
          </div>
        ) : (
          /* ── ACCOUNT CARDS ────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map(account => {
              const summary = todaySummaries[account.id];
              const todayPnl = summary?.total_pnl || 0;
              const todayTrades = summary?.trades_count || 0;
              const ddFloor = account.balance * (1 - account.max_dd_pct / 100);
              const dailyLimit = account.balance * account.daily_dd_pct / 100;
              const ddUsed = todayPnl < 0 ? Math.abs(todayPnl) : 0;
              const progressPct = account.profit_target_pct > 0 ? Math.max(0, todayPnl) / (account.balance * account.profit_target_pct / 100) * 100 : 0;

              return (
                <div
                  key={account.id}
                  className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-all group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-white">{account.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {account.currency} {account.balance.toLocaleString()} · {account.phase}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          account.phase === 'Funded' ? 'bg-emerald-500/10 text-emerald-400' :
                          account.phase === 'Phase 2' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-sky-500/10 text-sky-400'
                        }`}>
                          {account.phase}
                        </span>
                      </div>
                    </div>

                    {/* Today's P&L */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className={`text-2xl font-bold tabular-nums ${todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {todayPnl >= 0 ? '+' : ''}{account.currency} {todayPnl.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">today</span>
                      {todayTrades > 0 && (
                        <span className="text-xs text-gray-600">{summary?.wins}W {summary?.losses}L</span>
                      )}
                    </div>

                    {/* Gauges */}
                    <div className="space-y-3">
                      <Gauge value={ddUsed} max={dailyLimit} label="Daily Drawdown" color="bg-sky-500" />
                      <Gauge value={Math.max(0, progressPct)} max={100} label={`Target: ${account.profit_target_pct}%`} color="bg-emerald-500" />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-gray-800/50 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {account.daily_dd_pct}% / {account.max_dd_pct}%
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {todayTrades} / {account.max_trades_per_day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAccount(account.id); }}
                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/prop/${account.id}`}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                      >
                        Trade Desk
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE ACCOUNT MODAL ────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#12121a] border-b border-gray-800/50 p-5 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Add Prop Account</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. FTMO 100K Challenge"
                  value={newAccount.name}
                  onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Balance + Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Balance</label>
                  <input
                    type="number"
                    value={newAccount.balance}
                    onChange={e => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                  <select
                    value={newAccount.currency}
                    onChange={e => setNewAccount({ ...newAccount, currency: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Drawdown Rules */}
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Drawdown Rules
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Daily Loss Limit (%)</label>
                    <input
                      type="number" step="0.5"
                      value={newAccount.daily_dd_pct}
                      onChange={e => setNewAccount({ ...newAccount, daily_dd_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">DD Calculation</label>
                    <select
                      value={newAccount.daily_dd_calc}
                      onChange={e => setNewAccount({ ...newAccount, daily_dd_calc: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    >
                      {DD_CALC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max Drawdown (%)</label>
                    <input
                      type="number" step="0.5"
                      value={newAccount.max_dd_pct}
                      onChange={e => setNewAccount({ ...newAccount, max_dd_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max DD Type</label>
                    <select
                      value={newAccount.max_dd_type}
                      onChange={e => setNewAccount({ ...newAccount, max_dd_type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    >
                      {DD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Challenge */}
              <div>
                <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Challenge Phase
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Profit Target (%)</label>
                    <input
                      type="number" step="0.5"
                      value={newAccount.profit_target_pct}
                      onChange={e => setNewAccount({ ...newAccount, profit_target_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Phase</label>
                    <select
                      value={newAccount.phase}
                      onChange={e => setNewAccount({ ...newAccount, phase: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    >
                      {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Risk Per Trade (%)</label>
                    <input
                      type="number" step="0.1"
                      value={newAccount.risk_pct}
                      onChange={e => setNewAccount({ ...newAccount, risk_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max Trades / Day</label>
                    <input
                      type="number"
                      value={newAccount.max_trades_per_day}
                      onChange={e => setNewAccount({ ...newAccount, max_trades_per_day: parseInt(e.target.value) || 1 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#12121a] border-t border-gray-800/50 p-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createAccount}
                disabled={creating || !newAccount.name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
