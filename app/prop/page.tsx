'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  Plus, Shield, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Trash2,
  Target, BarChart3, Clock, ArrowLeft, X, Check, Loader2, Settings,
  Activity, DollarSign, Zap, Award, Calendar, LineChart
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
  account_type?: string;
}

interface AccountStats {
  total_pnl: number;
  total_r: number;
  total_trades: number;
  wins: number;
  losses: number;
  trading_days: number;
  best_day: number;
  worst_day: number;
  current_streak: number;
  streak_type: 'win' | 'loss' | 'none';
  last_trade_date: string | null;
  today_pnl: number;
  today_trades: number;
  today_wins: number;
  today_losses: number;
  open_trades: number;
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
  account_type: 'prop_challenge',
};

// ── MINI EQUITY SPARKLINE ───────────────────────────────────────────────────

function EquitySparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const fillPts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`);
  fillPts.push(`${w},${h}`, `0,${h}`);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts.join(' ')} fill={`url(#spark-${id})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── GAUGE COMPONENT ─────────────────────────────────────────────────────────

function Gauge({ value, max, label, color, variant }: { value: number; max: number; label: string; color: string; variant?: string }) {
  const pct = Math.min((Math.abs(value) / Math.max(max, 0.01)) * 100, 100);
  const isP = variant === 'progress';
  const barColor = isP
    ? (pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-sky-400' : 'bg-sky-600')
    : (pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : color);
  const textColor = isP
    ? (pct >= 80 ? 'text-emerald-400' : 'text-sky-400')
    : (pct >= 80 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-gray-300');

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={textColor}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`} style={{ width: `${pct}%` }} />
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
  const [accountStats, setAccountStats] = useState<Record<string, AccountStats>>({});
  const [equityData, setEquityData] = useState<Record<string, number[]>>({});

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
    if (data) {
      setAccounts(data);
      await loadAllStats(userId, data);
    }
  };

  const loadAllStats = async (userId: string, accs: PropAccount[]) => {
    if (accs.length === 0) return;
    const { data: allTrades } = await supabase
      .from('prop_trades')
      .select('account_id, pnl, r_result, status, direction, opened_at, closed_at')
      .eq('user_id', userId)
      .in('account_id', accs.map(a => a.id))
      .order('closed_at', { ascending: true });
    if (!allTrades) return;

    const today = new Date().toISOString().split('T')[0];
    const statsMap: Record<string, AccountStats> = {};
    const eqMap: Record<string, number[]> = {};

    for (const acc of accs) {
      const trades = allTrades.filter(t => t.account_id === acc.id);
      const closed = trades.filter(t => t.status === 'closed' && t.pnl !== null);
      const open = trades.filter(t => t.status === 'open');
      const todayClosed = closed.filter(t => t.closed_at && t.closed_at.startsWith(today));

      const byDate: Record<string, number> = {};
      for (const t of closed) {
        const d = t.closed_at ? t.closed_at.split('T')[0] : t.opened_at.split('T')[0];
        byDate[d] = (byDate[d] || 0) + (t.pnl || 0);
      }
      const sortedDates = Object.keys(byDate).sort();

      let cumPnl = 0;
      const eqPoints = [0];
      for (const d of sortedDates) {
        cumPnl += byDate[d];
        eqPoints.push(cumPnl);
      }
      eqMap[acc.id] = eqPoints;

      let streak = 0;
      let streakType: 'win' | 'loss' | 'none' = 'none';
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        const dayType = byDate[sortedDates[i]] >= 0 ? 'win' : 'loss';
        if (i === sortedDates.length - 1) { streakType = dayType; streak = 1; }
        else if (dayType === streakType) streak++;
        else break;
      }

      const wins = closed.filter(t => (t.pnl || 0) > 0).length;
      const losses = closed.filter(t => (t.pnl || 0) <= 0).length;

      statsMap[acc.id] = {
        total_pnl: closed.reduce((s, t) => s + (t.pnl || 0), 0),
        total_r: closed.reduce((s, t) => s + (t.r_result || 0), 0),
        total_trades: closed.length,
        wins, losses,
        trading_days: sortedDates.length,
        best_day: sortedDates.length > 0 ? Math.max(...Object.values(byDate)) : 0,
        worst_day: sortedDates.length > 0 ? Math.min(...Object.values(byDate)) : 0,
        current_streak: streak,
        streak_type: streakType,
        last_trade_date: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
        today_pnl: todayClosed.reduce((s, t) => s + (t.pnl || 0), 0),
        today_trades: todayClosed.length,
        today_wins: todayClosed.filter(t => (t.pnl || 0) > 0).length,
        today_losses: todayClosed.filter(t => (t.pnl || 0) <= 0).length,
        open_trades: open.length,
      };
    }

    setAccountStats(statsMap);
    setEquityData(eqMap);
  };

  const createAccount = async () => {
    if (!user || !newAccount.name.trim()) return;
    setCreating(true);
    const { error } = await supabase.from('prop_accounts').insert({ ...newAccount, user_id: user.id, is_active: true });
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
    await supabase.from('prop_trades').delete().eq('account_id', id);
    await supabase.from('prop_sessions').delete().eq('account_id', id);
    await supabase.from('prop_accounts').delete().eq('id', id);
    await loadAccounts(user.id);
  };

  const globalStats = Object.values(accountStats);
  const totalPnl = globalStats.reduce((s, st) => s + st.total_pnl, 0);
  const totalTrades = globalStats.reduce((s, st) => s + st.total_trades, 0);
  const totalWins = globalStats.reduce((s, st) => s + st.wins, 0);
  const totalOpen = globalStats.reduce((s, st) => s + st.open_trades, 0);
  const winRate = totalTrades > 0 ? (totalWins / totalTrades * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-gray-600 text-sm">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/50 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="text-sky-400">ATLAS</span> Trading Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Trading Intelligence & Risk Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 hidden sm:inline">{user?.email}</span>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-sky-600/10 hover:shadow-sky-500/20">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── GLOBAL STATS BAR ─────────────────────────────────────────────── */}
      {accounts.length > 0 && totalTrades > 0 && (
        <div className="border-b border-gray-800/30 bg-[#0b0b12]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto text-xs scrollbar-none">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <DollarSign className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-500">Total P&L</span>
              <span className={`font-bold tabular-nums ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-800 flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <BarChart3 className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-500">Trades</span>
              <span className="font-medium text-gray-300 tabular-nums">{totalTrades}</span>
            </div>
            <div className="w-px h-4 bg-gray-800 flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Target className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-500">Win Rate</span>
              <span className={`font-medium tabular-nums ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{winRate.toFixed(0)}%</span>
            </div>
            {totalOpen > 0 && (
              <>
                <div className="w-px h-4 bg-gray-800 flex-shrink-0" />
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-sky-400 font-medium">{totalOpen} open</span>
                </div>
              </>
            )}
            <div className="w-px h-4 bg-gray-800 flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-500">Accounts</span>
              <span className="text-gray-300 font-medium">{accounts.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {accounts.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Prop Accounts Yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Add your first prop firm account to start tracking trades, managing drawdown, and monitoring challenge progress.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-sky-600/20">
              <Plus className="w-5 h-5" /> Create Your First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {accounts.map((account) => {
              const stats = accountStats[account.id];
              const eq = equityData[account.id] || [];
              const totalPnlAcc = stats?.total_pnl || 0;
              const todayPnl = stats?.today_pnl || 0;
              const ddLimit = account.balance * account.daily_dd_pct / 100;
              const ddUsed = todayPnl < 0 ? Math.abs(todayPnl) : 0;
              const targetD = account.balance * account.profit_target_pct / 100;
              const pColor = totalPnlAcc >= 0 ? '#34d399' : '#f87171';
              const wr = stats && stats.total_trades > 0 ? (stats.wins / stats.total_trades * 100) : 0;
              const avgR = stats && stats.total_trades > 0 ? stats.total_r / stats.total_trades : 0;

              return (
                <div key={account.id}
                  className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-all group">
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-white truncate">{account.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {account.currency} {account.balance.toLocaleString()}
                          {(account.account_type === 'prop_challenge' || account.account_type === 'funded' || !account.account_type) ? ` · ${account.phase}` : ''}
                        </p>
                      </div>
                      {(() => {
                        const at = account.account_type || 'prop_challenge';
                        const isPropType = at === 'prop_challenge' || at === 'funded';
                        if (isPropType) {
                          return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${
                            account.phase === 'Funded' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            account.phase === 'Phase 2' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>{account.phase}</span>;
                        }
                        const typeLabels: Record<string, [string, string]> = {
                          'personal': ['Personal', 'bg-purple-500/10 text-purple-400 border border-purple-500/20'],
                          'futures': ['Futures', 'bg-orange-500/10 text-orange-400 border border-orange-500/20'],
                          'spread_bet': ['Spread Bet', 'bg-pink-500/10 text-pink-400 border border-pink-500/20'],
                          'demo': ['Demo', 'bg-gray-500/10 text-gray-400 border border-gray-500/20'],
                        };
                        const [label, cls] = typeLabels[at] || ['Account', 'bg-gray-500/10 text-gray-400 border border-gray-500/20'];
                        return <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0 ${cls}`}>{label}</span>;
                      })()}
                    </div>

                    <div className="flex items-end justify-between mb-1">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Total P&L</div>
                        <span className={`text-2xl font-bold tabular-nums ${totalPnlAcc >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {totalPnlAcc >= 0 ? '+' : ''}{account.currency} {totalPnlAcc.toFixed(2)}
                        </span>
                      </div>
                      {eq.length > 2 && (
                        <div className="w-24 opacity-70">
                          <EquitySparkline data={eq} color={pColor} id={account.id} />
                        </div>
                      )}
                    </div>

                    {stats && (stats.today_trades > 0 || stats.open_trades > 0) && (
                      <div className="flex items-center gap-3 text-xs mt-1 mb-3">
                        {stats.today_trades > 0 && (
                          <span className="text-gray-500">
                            Today: <span className={`font-medium ${todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {todayPnl >= 0 ? '+' : ''}{account.currency} {todayPnl.toFixed(2)}
                            </span>
                            <span className="text-gray-600 ml-1">({stats.today_wins}W {stats.today_losses}L)</span>
                          </span>
                        )}
                        {stats.open_trades > 0 && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Activity className="w-3 h-3" />{stats.open_trades} open
                          </span>
                        )}
                      </div>
                    )}

                    {stats && stats.total_trades > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4 mt-3">
                        <div className="bg-gray-900/40 rounded-lg px-3 py-2 text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Trades</div>
                          <div className="text-sm font-bold text-gray-200 tabular-nums">{stats.total_trades}</div>
                        </div>
                        <div className="bg-gray-900/40 rounded-lg px-3 py-2 text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                          <div className={`text-sm font-bold tabular-nums ${wr >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{wr.toFixed(0)}%</div>
                        </div>
                        <div className="bg-gray-900/40 rounded-lg px-3 py-2 text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Avg R</div>
                          <div className={`text-sm font-bold tabular-nums ${avgR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{avgR >= 0 ? '+' : ''}{avgR.toFixed(2)}</div>
                        </div>
                      </div>
                    )}

                    {stats && stats.current_streak >= 2 && (
                      <div className={`flex items-center gap-1.5 text-xs mb-3 ${stats.streak_type === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <Zap className="w-3 h-3" />
                        {stats.current_streak}-day {stats.streak_type === 'win' ? 'winning' : 'losing'} streak
                      </div>
                    )}

                    <div className="space-y-3">
                      <Gauge value={ddUsed} max={ddLimit} label={`Daily DD (${account.daily_dd_pct}%)`} color="bg-sky-500" />
                      <Gauge value={Math.max(0, totalPnlAcc)} max={targetD} label={`Target: ${account.profit_target_pct}%`} color="bg-emerald-500" variant="progress" />
                    </div>

                    {stats && stats.trading_days > 0 && (
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{stats.trading_days} days</span>
                        {stats.last_trade_date && (
                          <span>Last: {new Date(stats.last_trade_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-800/50 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{account.daily_dd_pct}% / {account.max_dd_pct}%</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{stats?.today_trades || 0} / {account.max_trades_per_day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/prop/${account.id}/analytics`} className="p-1.5 text-gray-600 hover:text-sky-400 transition-colors" title="Analytics">
                        <LineChart className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); deleteAccount(account.id); }}
                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors" title="Delete account">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/prop/${account.id}`}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">
                        Trade Desk <ChevronRight className="w-4 h-4" />
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
      {showCreate && (() => {
        const acType = (newAccount as any).account_type || 'prop_challenge';
        const isProp = acType === 'prop_challenge' || acType === 'funded';
        const isDemo = acType === 'demo';
        const showDD = !isDemo;
        const showChallenge = acType === 'prop_challenge';
        const showPhase = isProp;

        return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`.create-scroll::-webkit-scrollbar { width: 6px; } .create-scroll::-webkit-scrollbar-track { background: transparent; } .create-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; } .create-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }`}</style>
          <div className="create-scroll bg-[#12121a] border border-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#12121a] border-b border-gray-800/50 p-5 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Add Account</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Type</label>
                <select value={acType} onChange={e => setNewAccount({ ...newAccount, account_type: e.target.value } as any)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors">
                  <option value="prop_challenge">Prop Firm Challenge</option>
                  <option value="funded">Funded Account</option>
                  <option value="personal">Personal (Forex/CFD)</option>
                  <option value="futures">Personal (Futures)</option>
                  <option value="spread_bet">Spread Betting</option>
                  <option value="demo">Demo / Paper</option>
                </select>
                <div className="text-[10px] text-gray-600 mt-1">
                  {acType === 'prop_challenge' ? 'Track challenge rules, DD limits, profit targets.' :
                   acType === 'funded' ? 'Funded account with payout tracking.' :
                   acType === 'personal' ? 'Your own capital. Set your own risk rules.' :
                   acType === 'futures' ? 'Contract-based. Tick values and margin.' :
                   acType === 'spread_bet' ? '£/point trading. Tax-free (UK).' :
                   'Paper trading for practice.'}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Account Name</label>
                <input type="text" placeholder={isProp ? 'e.g. FTMO 100K Challenge' : acType === 'personal' ? 'e.g. IC Markets Live' : 'e.g. My Demo Account'}
                  value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none transition-colors" />
              </div>

              {/* Balance + Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">{isDemo ? 'Starting Balance' : 'Balance'}</label>
                  <input type="number" value={newAccount.balance} onChange={e => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                  <select value={newAccount.currency} onChange={e => setNewAccount({ ...newAccount, currency: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
              </div>

              {/* Drawdown Rules */}
              {showDD && (
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {isProp ? 'Drawdown Rules' : 'Risk Limits'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-400 mb-1">Daily Loss Limit (%)</label>
                    <input type="number" step="0.5" value={newAccount.daily_dd_pct} onChange={e => setNewAccount({ ...newAccount, daily_dd_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors" /></div>
                  {isProp && (
                  <div><label className="block text-xs text-gray-400 mb-1">DD Calculation</label>
                    <select value={newAccount.daily_dd_calc} onChange={e => setNewAccount({ ...newAccount, daily_dd_calc: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors">
                      {DD_CALC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  )}
                  <div><label className="block text-xs text-gray-400 mb-1">Max Drawdown (%)</label>
                    <input type="number" step="0.5" value={newAccount.max_dd_pct} onChange={e => setNewAccount({ ...newAccount, max_dd_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors" /></div>
                  {isProp && (
                  <div><label className="block text-xs text-gray-400 mb-1">Max DD Type</label>
                    <select value={newAccount.max_dd_type} onChange={e => setNewAccount({ ...newAccount, max_dd_type: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors">
                      {DD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  )}
                </div>
              </div>
              )}

              {/* Challenge / Risk */}
              <div>
                <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> {showChallenge ? 'Challenge & Risk' : 'Risk Settings'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {showChallenge && (
                  <div><label className="block text-xs text-gray-400 mb-1">Profit Target (%)</label>
                    <input type="number" step="0.5" value={newAccount.profit_target_pct} onChange={e => setNewAccount({ ...newAccount, profit_target_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors" /></div>
                  )}
                  {showPhase && (
                  <div><label className="block text-xs text-gray-400 mb-1">Phase</label>
                    <select value={newAccount.phase} onChange={e => setNewAccount({ ...newAccount, phase: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors">
                      {acType === 'funded' ? ['Funded'].map(p => <option key={p} value={p}>{p}</option>) : PHASES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  )}
                  <div><label className="block text-xs text-gray-400 mb-1">Risk Per Trade (%)</label>
                    <input type="number" step="0.1" value={newAccount.risk_pct} onChange={e => setNewAccount({ ...newAccount, risk_pct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Max Trades / Day</label>
                    <input type="number" value={newAccount.max_trades_per_day} onChange={e => setNewAccount({ ...newAccount, max_trades_per_day: parseInt(e.target.value) || 1 })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors" /></div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#12121a] border-t border-gray-800/50 p-5 flex items-center justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">Cancel</button>
              <button onClick={createAccount} disabled={creating || !newAccount.name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-sky-600/20">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Create Account
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
