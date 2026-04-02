'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowLeft, TrendingUp, TrendingDown, Shield, Target, AlertTriangle,
  X, Check, Loader2, Trash2, RotateCcw, ChevronDown, ChevronUp,
  DollarSign, Crosshair, BarChart3, Clock, Zap
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
}

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  entry_price: number;
  stop_price: number;
  close_price: number | null;
  lot_size: number | null;
  risk_dollars: number | null;
  risk_pct: number | null;
  pnl: number | null;
  r_result: number | null;
  status: string;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

function fmtMoney(n: number, currency: string) {
  return `${currency} ${n >= 0 ? '+' : ''}${fmt(n)}`;
}

// ── GAUGE COMPONENT ──────────────────────────────────────────────────────────

function Gauge({ value, max, label, color = 'bg-sky-500' }: { value: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : color;
  const textColor = pct >= 80 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-gray-300';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={textColor}>{fmt(pct, 0)}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────────────────────

function Stat({ label, value, color = 'text-white', sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TradeDesk() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [account, setAccount] = useState<PropAccount | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // New trade form
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    symbol: 'EURUSD',
    direction: 'long',
    entry_price: '',
    stop_price: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Close trade
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [closePrice, setClosePrice] = useState('');
  const [closing, setClosing] = useState(false);

  // ── LOAD DATA ────────────────────────────────────────────────────────────

  const loadData = useCallback(async (userId: string) => {
    const [accountRes, tradesRes] = await Promise.all([
      supabase.from('prop_accounts').select('*').eq('id', accountId).eq('user_id', userId).single(),
      supabase.from('prop_trades').select('*').eq('account_id', accountId).eq('user_id', userId).order('opened_at', { ascending: false }).limit(50),
    ]);
    if (accountRes.data) setAccount(accountRes.data);
    if (tradesRes.data) setTrades(tradesRes.data);
  }, [accountId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      await loadData(u.id);
      setLoading(false);
    };
    init();
  }, [router, loadData]);

  // ── CALCULATIONS ─────────────────────────────────────────────────────────

  const todayTrades = trades.filter(t => {
    const d = new Date(t.opened_at).toDateString();
    return d === new Date().toDateString();
  });

  const closedToday = todayTrades.filter(t => t.status === 'closed');
  const openTrades = trades.filter(t => t.status === 'open');
  const sessionPnl = closedToday.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const sessionR = closedToday.reduce((sum, t) => sum + (t.r_result || 0), 0);
  const wins = closedToday.filter(t => (t.pnl || 0) > 0).length;
  const losses = closedToday.filter(t => (t.pnl || 0) <= 0).length;
  const avgR = closedToday.length > 0 ? sessionR / closedToday.length : 0;

  const dailyDdLimit = account ? account.balance * account.daily_dd_pct / 100 : 0;
  const ddUsed = sessionPnl < 0 ? Math.abs(sessionPnl) : 0;
  const ddPct = dailyDdLimit > 0 ? (ddUsed / dailyDdLimit) * 100 : 0;
  const budgetLeft = Math.max(0, dailyDdLimit - ddUsed);
  const targetDollars = account ? account.balance * account.profit_target_pct / 100 : 0;
  const progressPct = targetDollars > 0 ? Math.max(0, sessionPnl) / targetDollars * 100 : 0;

  const ddStatus = ddPct >= 100 ? 'BREACHED' : ddPct >= 80 ? 'DANGER' : ddPct >= 60 ? 'WARNING' : 'SAFE';
  const ddColor = ddStatus === 'BREACHED' || ddStatus === 'DANGER' ? 'text-red-400' : ddStatus === 'WARNING' ? 'text-amber-400' : 'text-emerald-400';

  // ── OPEN TRADE ───────────────────────────────────────────────────────────

  const openTrade = async () => {
    if (!user || !account) return;
    const entry = parseFloat(tradeForm.entry_price);
    const stop = parseFloat(tradeForm.stop_price);
    if (!entry || !stop || entry <= 0 || stop <= 0) return;

    setSubmitting(true);
    const stopDist = Math.abs(entry - stop);
    const riskDollars = account.balance * account.risk_pct / 100;
    const lotSize = stopDist > 0 ? riskDollars / (stopDist * 10000) : 0; // Simplified for forex

    const { error } = await supabase.from('prop_trades').insert({
      account_id: account.id,
      user_id: user.id,
      symbol: tradeForm.symbol,
      direction: tradeForm.direction,
      entry_price: entry,
      stop_price: stop,
      lot_size: Math.round(lotSize * 100) / 100,
      risk_dollars: Math.round(riskDollars * 100) / 100,
      risk_pct: account.risk_pct,
      notes: tradeForm.notes || null,
      status: 'open',
    });

    if (!error) {
      await loadData(user.id);
      setShowNewTrade(false);
      setTradeForm({ symbol: 'EURUSD', direction: 'long', entry_price: '', stop_price: '', notes: '' });
    }
    setSubmitting(false);
  };

  // ── CLOSE TRADE ──────────────────────────────────────────────────────────

  const closeTrade = async (tradeId: string) => {
    if (!user || !account) return;
    const price = parseFloat(closePrice);
    if (!price || price <= 0) return;

    setClosing(true);
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) { setClosing(false); return; }

    const move = trade.direction === 'long' ? price - trade.entry_price : trade.entry_price - price;
    const stopDist = Math.abs(trade.entry_price - trade.stop_price);
    const rResult = stopDist > 0 ? move / stopDist : 0;
    const pnl = move * (trade.lot_size || 0) * 10000; // Simplified for forex

    const { error } = await supabase.from('prop_trades').update({
      close_price: price,
      pnl: Math.round(pnl * 100) / 100,
      r_result: Math.round(rResult * 100) / 100,
      status: 'closed',
      closed_at: new Date().toISOString(),
    }).eq('id', tradeId);

    if (!error) {
      await loadData(user.id);
      setClosingTradeId(null);
      setClosePrice('');
    }
    setClosing(false);
  };

  // ── DELETE TRADE ─────────────────────────────────────────────────────────

  const deleteTrade = async (tradeId: string) => {
    if (!user || !confirm('Delete this trade?')) return;
    await supabase.from('prop_trades').delete().eq('id', tradeId);
    await loadData(user.id);
  };

  // ── RENDER ───────────────────────────────────────────────────────────────

  if (loading || !account) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const phaseColor = account.phase === 'Funded' ? 'text-emerald-400 bg-emerald-500/10' : account.phase === 'Phase 2' ? 'text-amber-400 bg-amber-500/10' : 'text-sky-400 bg-sky-500/10';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/50 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prop" className="text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{account.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phaseColor}`}>{account.phase}</span>
              </div>
              <p className="text-xs text-gray-500">{account.currency} {account.balance.toLocaleString()} · {account.daily_dd_pct}% daily / {account.max_dd_pct}% max · {account.max_dd_type}</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewTrade(true)}
            disabled={todayTrades.length >= account.max_trades_per_day}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            New Trade
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Stat
            label="Session P&L"
            value={fmtMoney(sessionPnl, account.currency)}
            color={sessionPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
            sub={`${wins}W ${losses}L · ${fmt(avgR)}R avg`}
          />
          <Stat
            label="Daily DD"
            value={`${fmt(ddPct, 0)}% ${ddStatus}`}
            color={ddColor}
            sub={`${fmtMoney(-ddUsed, account.currency)} of ${account.currency} ${fmt(dailyDdLimit, 0)}`}
          />
          <Stat
            label="Budget Left"
            value={`${account.currency} ${fmt(budgetLeft, 0)}`}
            color={budgetLeft > dailyDdLimit * 0.5 ? 'text-emerald-400' : budgetLeft > 0 ? 'text-amber-400' : 'text-red-400'}
          />
          <Stat
            label="Trades Today"
            value={`${todayTrades.length} / ${account.max_trades_per_day}`}
            color={todayTrades.length >= account.max_trades_per_day ? 'text-red-400' : 'text-white'}
          />
          <Stat
            label="Target Progress"
            value={`${fmt(progressPct, 0)}% of ${account.profit_target_pct}%`}
            color={progressPct >= 100 ? 'text-emerald-400' : 'text-amber-400'}
            sub={`Need ${account.currency} ${fmt(Math.max(0, targetDollars - Math.max(0, sessionPnl)), 0)}`}
          />
          <Stat
            label="Open Positions"
            value={`${openTrades.length}`}
            color={openTrades.length > 0 ? 'text-sky-400' : 'text-gray-500'}
          />
        </div>

        {/* ── DRAWDOWN GAUGES ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4">
            <Gauge value={ddUsed} max={dailyDdLimit} label={`Daily Drawdown · ${account.daily_dd_calc}`} color="bg-sky-500" />
            <div className="mt-2">
              <Gauge value={ddUsed} max={account.balance * account.max_dd_pct / 100} label={`Max Drawdown · ${account.max_dd_type}`} color="bg-purple-500" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4">
            <Gauge value={Math.max(0, sessionPnl)} max={targetDollars} label={`Challenge Target: ${account.profit_target_pct}%`} color="bg-emerald-500" />
            <div className="mt-3 text-xs text-gray-500">
              {account.phase === 'Funded' ? 'Survival mode — capital preservation' : account.phase === 'Phase 2' ? 'Protect your progress — reduced risk' : 'Hit the target — controlled aggression'}
            </div>
          </div>
        </div>

        {/* ── OPEN TRADES ───────────────────────────────────────────────────── */}
        {openTrades.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Open Positions
            </h2>
            <div className="space-y-2">
              {openTrades.map(trade => {
                const isLong = trade.direction === 'long';
                const stopDist = Math.abs(trade.entry_price - trade.stop_price);
                return (
                  <div key={trade.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${isLong ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isLong ? '▲ LONG' : '▼ SHORT'}
                        </span>
                        <span className="text-white font-medium">{trade.symbol}</span>
                        <span className="text-xs text-gray-500">@ {trade.entry_price}</span>
                        <span className="text-xs text-gray-600">SL {trade.stop_price}</span>
                        <span className="text-xs text-gray-600">{trade.lot_size} lots</span>
                        <span className="text-xs text-gray-600">{account.currency} {trade.risk_dollars} risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {closingTradeId === trade.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="Close price"
                              value={closePrice}
                              onChange={e => setClosePrice(e.target.value)}
                              className="w-32 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-sky-500 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => closeTrade(trade.id)}
                              disabled={closing}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              {closing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                            </button>
                            <button
                              onClick={() => { setClosingTradeId(null); setClosePrice(''); }}
                              className="p-1 text-gray-500 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setClosingTradeId(trade.id)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              Close Trade
                            </button>
                            <button
                              onClick={() => deleteTrade(trade.id)}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRADE JOURNAL ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Trade Journal — Today
          </h2>
          {closedToday.length === 0 ? (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No closed trades today. Open a trade to get started.</p>
            </div>
          ) : (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">#</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">DIR</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">SYMBOL</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">ENTRY</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">EXIT</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">P&L</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">R</th>
                    <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium">TIME</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {closedToday.map((trade, i) => {
                    const pnlColor = (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
                    const dirIcon = trade.direction === 'long' ? '▲' : '▼';
                    const dirColor = trade.direction === 'long' ? 'text-emerald-400' : 'text-red-400';
                    const time = trade.closed_at ? new Date(trade.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                    return (
                      <tr key={trade.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                        <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                        <td className={`px-4 py-2.5 font-medium ${dirColor}`}>{dirIcon} {trade.direction.toUpperCase()}</td>
                        <td className="px-4 py-2.5 text-gray-300">{trade.symbol}</td>
                        <td className="px-4 py-2.5 text-right text-gray-300 tabular-nums">{trade.entry_price}</td>
                        <td className="px-4 py-2.5 text-right text-gray-300 tabular-nums">{trade.close_price}</td>
                        <td className={`px-4 py-2.5 text-right font-medium tabular-nums ${pnlColor}`}>
                          {(trade.pnl || 0) >= 0 ? '+' : ''}{account.currency} {fmt(trade.pnl || 0)}
                        </td>
                        <td className={`px-4 py-2.5 text-right tabular-nums ${pnlColor}`}>
                          {(trade.r_result || 0) >= 0 ? '+' : ''}{fmt(trade.r_result || 0)}R
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600 text-xs">{time}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => deleteTrade(trade.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary row */}
                  <tr className="bg-gray-900/50">
                    <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-gray-400 font-medium">
                      {wins}W {losses}L · {closedToday.length} trades
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${sessionPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {sessionPnl >= 0 ? '+' : ''}{account.currency} {fmt(sessionPnl)}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${sessionR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {sessionR >= 0 ? '+' : ''}{fmt(sessionR)}R
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── NEW TRADE MODAL ─────────────────────────────────────────────────── */}
      {showNewTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-800/50 p-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Open Trade</h2>
              <button onClick={() => setShowNewTrade(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Symbol */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                <input
                  type="text"
                  value={tradeForm.symbol}
                  onChange={e => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                  placeholder="EURUSD"
                />
              </div>

              {/* Direction */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeForm({ ...tradeForm, direction: 'long' })}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      tradeForm.direction === 'long'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" /> LONG
                  </button>
                  <button
                    onClick={() => setTradeForm({ ...tradeForm, direction: 'short' })}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      tradeForm.direction === 'short'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" /> SHORT
                  </button>
                </div>
              </div>

              {/* Entry + Stop */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    value={tradeForm.entry_price}
                    onChange={e => setTradeForm({ ...tradeForm, entry_price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                    placeholder="1.15325"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stop Price</label>
                  <input
                    type="number"
                    step="any"
                    value={tradeForm.stop_price}
                    onChange={e => setTradeForm({ ...tradeForm, stop_price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                    placeholder="1.15225"
                  />
                </div>
              </div>

              {/* Calculated Risk Info */}
              {tradeForm.entry_price && tradeForm.stop_price && (
                <div className="bg-gray-900/80 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Risk</span>
                    <span className="text-red-400">{account.currency} {fmt(account.balance * account.risk_pct / 100)} ({account.risk_pct}%)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Stop Distance</span>
                    <span className="text-gray-300">{fmt(Math.abs(parseFloat(tradeForm.entry_price) - parseFloat(tradeForm.stop_price)) * 10000, 1)} pips</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Lot Size</span>
                    <span className="text-white font-medium">
                      {fmt(Math.abs(parseFloat(tradeForm.entry_price) - parseFloat(tradeForm.stop_price)) > 0
                        ? (account.balance * account.risk_pct / 100) / (Math.abs(parseFloat(tradeForm.entry_price) - parseFloat(tradeForm.stop_price)) * 10000)
                        : 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={tradeForm.notes}
                  onChange={e => setTradeForm({ ...tradeForm, notes: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-sky-500 focus:outline-none transition-colors"
                  placeholder="Setup reason, confluence, etc."
                />
              </div>
            </div>

            <div className="border-t border-gray-800/50 p-5 flex justify-end gap-3">
              <button onClick={() => setShowNewTrade(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={openTrade}
                disabled={submitting || !tradeForm.entry_price || !tradeForm.stop_price}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Open Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
