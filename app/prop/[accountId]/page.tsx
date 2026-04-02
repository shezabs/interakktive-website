'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowLeft, TrendingUp, TrendingDown, Shield, Target, AlertTriangle,
  X, Check, Loader2, Trash2, DollarSign, Crosshair, BarChart3, Zap, Heart, Activity,
  AlertCircle, Settings, ChevronDown, ChevronUp, LineChart, Calendar, Tv, Minimize2, Maximize2
} from 'lucide-react';

interface PropAccount {
  id: string; name: string; balance: number; currency: string;
  daily_dd_pct: number; daily_dd_calc: string; max_dd_pct: number; max_dd_type: string;
  trail_lock: boolean; trail_lock_pct: number;
  profit_target_pct: number; phase: string; min_days: number; consistency_pct: number;
  risk_pct: number; max_trades_per_day: number;
}

interface Trade {
  id: string; symbol: string; direction: string;
  entry_price: number; stop_price: number; close_price: number | null;
  lot_size: number | null; risk_dollars: number | null; risk_pct: number | null;
  pnl: number | null; r_result: number | null;
  status: string; notes: string | null;
  opened_at: string; closed_at: string | null;
}

const fmt = (n: number, d = 2) => n.toFixed(d);
const fmtM = (n: number, c: string) => `${c} ${n >= 0 ? '+' : ''}${fmt(n)}`;

// ── SURVIVAL BAR ────────────────────────────────────────────────────────────

function SurvivalBar({ remaining, total, currency, budgetLeft }: { remaining: number; total: number; currency: string; budgetLeft: number }) {
  const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 100;
  const segments = Math.min(Math.max(total, 1), 10);
  const filled = Math.min(Math.max(remaining, 0), segments);
  const grad = pct > 60 ? 'from-emerald-600 to-emerald-400' : pct > 30 ? 'from-amber-600 to-amber-400' : 'from-red-600 to-red-400';
  const tc = pct > 60 ? 'text-emerald-400' : pct > 30 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className={`bg-[#0d0d14] border-b border-gray-800/50 px-4 py-2.5 ${pct <= 30 ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0"><Heart className={`w-4 h-4 ${tc}`} /><span className="text-xs text-gray-400 hidden sm:inline">Survival</span></div>
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-sm transition-all duration-300 ${i < filled ? `bg-gradient-to-r ${grad}` : 'bg-gray-800'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-xs flex-shrink-0">
          <span className={`font-bold tabular-nums ${tc}`}>{remaining} left</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-gray-400 hidden sm:inline">Budget: <span className={`font-medium ${tc}`}>{currency} {fmt(budgetLeft, 0)}</span></span>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color = 'text-white', sub, icon: Icon }: { label: string; value: string; color?: string; sub?: string; icon?: any }) {
  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-3 sm:p-4 hover:border-gray-700/50 transition-all">
      <div className="flex items-center gap-2 mb-1.5">{Icon && <Icon className="w-3.5 h-3.5 text-gray-600" />}<span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{label}</span></div>
      <div className={`text-lg sm:text-xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── DD GAUGE ────────────────────────────────────────────────────────────────

function DDGauge({ value, max, label, sublabel, variant = 'default' }: { value: number; max: number; label: string; sublabel?: string; variant?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isP = variant === 'progress';
  const bar = isP ? (pct >= 80 ? 'bg-emerald-400' : 'bg-sky-500') : (pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-sky-500');
  const tc = isP ? (pct >= 80 ? 'text-emerald-400' : 'text-sky-400') : (pct >= 80 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-gray-400');
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline"><span className="text-sm text-gray-300">{label}</span><span className={`text-sm font-bold tabular-nums ${tc}`}>{fmt(pct, 1)}%</span></div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${pct}%` }} /></div>
      {sublabel && <div className="text-xs text-gray-600">{sublabel}</div>}
    </div>
  );
}

// ── JOURNAL DAY GROUP ───────────────────────────────────────────────────────

function JournalDayGroup({ date, trades, currency, onDelete, isToday }: {
  date: string; trades: Trade[]; currency: string; onDelete: (id: string) => void; isToday: boolean;
}) {
  const [expanded, setExpanded] = useState(isToday);
  const dayPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const dayR = trades.reduce((s, t) => s + (t.r_result || 0), 0);
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  const losses = trades.filter(t => (t.pnl || 0) <= 0).length;
  const dateObj = new Date(date + 'T00:00:00');
  const dateLabel = isToday ? 'Today' : dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-900/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isToday ? 'text-sky-400' : 'text-gray-300'}`}>{dateLabel}</span>
          <span className="text-xs text-gray-600">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
          <span className="text-xs text-gray-600">{wins}W {losses}L</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold tabular-nums ${dayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {dayPnl >= 0 ? '+' : ''}{currency} {fmt(dayPnl)}
          </span>
          <span className={`text-xs tabular-nums ${dayR >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
            {dayR >= 0 ? '+' : ''}{fmt(dayR)}R
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-800/30">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50 bg-gray-900/30">
                  {['#', 'DIR', 'SYMBOL', 'ENTRY', 'EXIT', 'P&L', 'R', 'TIME', ''].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-[10px] text-gray-600 font-medium uppercase tracking-wider ${['ENTRY', 'EXIT', 'P&L', 'R', 'TIME'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => {
                  const pc = (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
                  const tm = t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <tr key={t.id} className={`border-b border-gray-800/20 ${(t.pnl || 0) >= 0 ? 'hover:bg-emerald-500/5' : 'hover:bg-red-500/5'}`}>
                      <td className="px-4 py-2.5 text-gray-600">{i + 1}</td>
                      <td className={`px-4 py-2.5 font-medium ${t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{t.direction === 'long' ? '▲' : '▼'} {t.direction.toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-gray-300">{t.symbol}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">{t.entry_price}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">{t.close_price}</td>
                      <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${pc}`}>{(t.pnl || 0) >= 0 ? '+' : ''}{currency} {fmt(t.pnl || 0)}</td>
                      <td className={`px-4 py-2.5 text-right font-medium tabular-nums ${pc}`}>{(t.r_result || 0) >= 0 ? '+' : ''}{fmt(t.r_result || 0)}R</td>
                      <td className="px-4 py-2.5 text-right text-gray-700 text-xs">{tm}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => onDelete(t.id)} className="text-gray-800 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-900/50">
                  <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-gray-500">{wins}W {losses}L · {trades.length > 0 ? fmt(dayR / trades.length) : '0.00'}R avg</td>
                  <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${dayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{dayPnl >= 0 ? '+' : ''}{currency} {fmt(dayPnl)}</td>
                  <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${dayR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{dayR >= 0 ? '+' : ''}{fmt(dayR)}R</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-800/20">
            {trades.map((t, i) => {
              const pc = (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
              const tm = t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${t.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {t.direction === 'long' ? '▲' : '▼'}
                    </span>
                    <div>
                      <span className="text-sm text-gray-300">{t.symbol}</span>
                      <span className="text-xs text-gray-600 ml-2">{tm}</span>
                      {t.notes && <div className="text-[10px] text-gray-600 mt-0.5 truncate max-w-[200px]">{t.notes}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold tabular-nums ${pc}`}>{(t.pnl || 0) >= 0 ? '+' : ''}{currency} {fmt(t.pnl || 0)}</div>
                    <div className={`text-xs tabular-nums ${pc}`}>{(t.r_result || 0) >= 0 ? '+' : ''}{fmt(t.r_result || 0)}R</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SYMBOL MAPPING (trade symbol → TradingView format) ──────────────────────

const TV_SYMBOL_MAP: Record<string, string> = {
  'EURUSD': 'FX:EURUSD', 'GBPUSD': 'FX:GBPUSD', 'USDJPY': 'FX:USDJPY', 'USDCHF': 'FX:USDCHF',
  'AUDUSD': 'FX:AUDUSD', 'USDCAD': 'FX:USDCAD', 'NZDUSD': 'FX:NZDUSD', 'EURGBP': 'FX:EURGBP',
  'EURJPY': 'FX:EURJPY', 'GBPJPY': 'FX:GBPJPY', 'AUDNZD': 'FX:AUDNZD', 'EURCHF': 'FX:EURCHF',
  'AUDCAD': 'FX:AUDCAD', 'GBPCAD': 'FX:GBPCAD', 'GBPCHF': 'FX:GBPCHF', 'CADJPY': 'FX:CADJPY',
  'XAUUSD': 'OANDA:XAUUSD', 'GOLD': 'OANDA:XAUUSD', 'XAGUSD': 'OANDA:XAGUSD',
  'BTCUSD': 'BITSTAMP:BTCUSD', 'ETHUSD': 'BITSTAMP:ETHUSD', 'BTCUSDT': 'BINANCE:BTCUSDT',
  'US30': 'TVC:DJI', 'NAS100': 'NASDAQ:NDX', 'SPX500': 'SP:SPX', 'US500': 'SP:SPX',
  'DE40': 'XETR:DAX', 'UK100': 'TVC:UKX', 'JP225': 'TVC:NI225',
  'USOIL': 'TVC:USOIL', 'UKOIL': 'TVC:UKOIL',
};

function getTvSymbol(symbol: string): string {
  const upper = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (TV_SYMBOL_MAP[upper]) return TV_SYMBOL_MAP[upper];
  // Fallback: try FX: prefix for 6-char forex pairs
  if (upper.length === 6) return `FX:${upper}`;
  return upper;
}

// ── TRADINGVIEW CHART COMPONENT ─────────────────────────────────────────────

function TradingViewChart({ symbol, height = 400 }: { symbol: string; height?: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    wrapper.appendChild(widgetDiv);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span style="color: rgba(255,255,255,0.2); font-size: 11px;">Chart by TradingView</span></a>';
    wrapper.appendChild(copyright);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: getTvSymbol(symbol),
      interval: '15',
      timezone: 'exchange',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(10, 10, 15, 1)',
      gridColor: 'rgba(255, 255, 255, 0.03)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      calendar: false,
      withdateranges: false,
      allow_symbol_change: true,
      details: false,
      hotlist: false,
      support_host: 'https://www.tradingview.com',
    });
    wrapper.appendChild(script);

    containerRef.current.appendChild(wrapper);
    widgetRef.current = wrapper;

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol]);

  return (
    <div ref={containerRef} style={{ height: `${height}px` }} className="rounded-xl overflow-hidden border border-gray-800/30" />
  );
}

// ── MAIN TRADE DESK ─────────────────────────────────────────────────────────

export default function TradeDesk() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [account, setAccount] = useState<PropAccount | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [tradeForm, setTradeForm] = useState({ symbol: 'EURUSD', direction: 'long', entry_price: '', stop_price: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [closePrice, setClosePrice] = useState('');
  const [closing, setClosing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editAccount, setEditAccount] = useState<PropAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [journalView, setJournalView] = useState<'today' | 'all'>('today');
  const [showChart, setShowChart] = useState(true);
  const [chartHeight, setChartHeight] = useState(400);
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({});
  const [priceLoading, setPriceLoading] = useState(false);

  const loadData = useCallback(async (uid: string) => {
    const [a, t] = await Promise.all([
      supabase.from('prop_accounts').select('*').eq('id', accountId).eq('user_id', uid).single(),
      supabase.from('prop_trades').select('*').eq('account_id', accountId).eq('user_id', uid).order('opened_at', { ascending: false }).limit(500),
    ]);
    if (a.data) setAccount(a.data);
    if (t.data) setTrades(t.data);
  }, [accountId]);

  useEffect(() => { (async () => { const { data: { user: u } } = await supabase.auth.getUser(); if (!u) { router.push('/signin'); return; } setUser(u); await loadData(u.id); setLoading(false); })(); }, [router, loadData]);

  // Live price polling for open positions
  useEffect(() => {
    const openTrades = trades.filter(t => t.status === 'open');
    if (openTrades.length === 0) return;

    const symbols = [...new Set(openTrades.map(t => t.symbol))];

    const fetchPrices = async () => {
      try {
        const res = await fetch(`/api/price?symbols=${symbols.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.prices) setLivePrices(data.prices);
        }
      } catch { /* silent fail */ }
    };

    fetchPrices(); // initial fetch
    const interval = setInterval(fetchPrices, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [trades]);

  const c = useMemo(() => {
    if (!account) return null;
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(t.opened_at).toDateString() === today);
    const closedToday = todayTrades.filter(t => t.status === 'closed');
    const openTrades = trades.filter(t => t.status === 'open');
    const allClosed = trades.filter(t => t.status === 'closed');
    const sessionPnl = closedToday.reduce((s, t) => s + (t.pnl || 0), 0);
    const sessionR = closedToday.reduce((s, t) => s + (t.r_result || 0), 0);
    const totalPnl = allClosed.reduce((s, t) => s + (t.pnl || 0), 0);
    const totalR = allClosed.reduce((s, t) => s + (t.r_result || 0), 0);
    const wins = closedToday.filter(t => (t.pnl || 0) > 0).length;
    const losses = closedToday.filter(t => (t.pnl || 0) <= 0 && t.pnl !== null).length;
    const avgR = closedToday.length > 0 ? sessionR / closedToday.length : 0;
    const phaseMult = account.phase === 'Phase 1' ? 1 : account.phase === 'Phase 2' ? 0.75 : 0.5;
    const effectiveRisk = account.risk_pct * phaseMult;
    const effectiveRiskD = account.balance * effectiveRisk / 100;
    const riskD = account.balance * account.risk_pct / 100;
    const dailyDdLimit = account.balance * account.daily_dd_pct / 100;
    const maxDdLimit = account.balance * account.max_dd_pct / 100;
    const ddUsed = sessionPnl < 0 ? Math.abs(sessionPnl) : 0;
    const ddPct = dailyDdLimit > 0 ? (ddUsed / dailyDdLimit) * 100 : 0;
    const budgetLeft = Math.max(0, dailyDdLimit - ddUsed);
    const targetD = account.balance * account.profit_target_pct / 100;
    const progressPct = targetD > 0 ? Math.max(0, totalPnl) / targetD * 100 : 0;
    const survivalCount = effectiveRiskD > 0 ? Math.floor(budgetLeft / effectiveRiskD) : 99;
    const tradesLeft = Math.max(0, account.max_trades_per_day - todayTrades.length);

    // Group closed trades by date for journal
    const closedByDate: Record<string, Trade[]> = {};
    for (const t of allClosed) {
      const d = t.closed_at ? t.closed_at.split('T')[0] : t.opened_at.split('T')[0];
      if (!closedByDate[d]) closedByDate[d] = [];
      closedByDate[d].push(t);
    }
    const sortedDates = Object.keys(closedByDate).sort().reverse();

    return { todayTrades, closedToday, openTrades, allClosed, sessionPnl, sessionR, totalPnl, totalR, wins, losses, avgR, effectiveRisk, effectiveRiskD, riskD, dailyDdLimit, maxDdLimit, ddUsed, ddPct, budgetLeft, targetD, progressPct, survivalCount, tradesLeft, closedByDate, sortedDates };
  }, [account, trades]);

  const openTrade = async () => {
    if (!user || !account || !c) return;
    const entry = parseFloat(tradeForm.entry_price), stop = parseFloat(tradeForm.stop_price);
    if (!entry || !stop) return;
    setSubmitting(true);
    const dist = Math.abs(entry - stop);
    const pips = dist * 10000;
    const lots = pips > 0 ? c.effectiveRiskD / (pips * 10) : 0;
    await supabase.from('prop_trades').insert({ account_id: account.id, user_id: user.id, symbol: tradeForm.symbol, direction: tradeForm.direction, entry_price: entry, stop_price: stop, lot_size: Math.round(lots * 100) / 100, risk_dollars: Math.round(c.effectiveRiskD * 100) / 100, risk_pct: c.effectiveRisk, notes: tradeForm.notes || null, status: 'open' });
    await loadData(user.id);
    setShowNewTrade(false);
    setTradeForm({ symbol: 'EURUSD', direction: 'long', entry_price: '', stop_price: '', notes: '' });
    setSubmitting(false);
  };

  const closeTrade = async (tid: string) => {
    if (!user) return;
    const price = parseFloat(closePrice);
    if (!price) return;
    setClosing(true);
    const trade = trades.find(t => t.id === tid);
    if (!trade) { setClosing(false); return; }
    const move = trade.direction === 'long' ? price - trade.entry_price : trade.entry_price - price;
    const dist = Math.abs(trade.entry_price - trade.stop_price);
    const rR = dist > 0 ? move / dist : 0;
    const pnl = move * (trade.lot_size || 0) * 100000;
    await supabase.from('prop_trades').update({ close_price: price, pnl: Math.round(pnl * 100) / 100, r_result: Math.round(rR * 100) / 100, status: 'closed', closed_at: new Date().toISOString() }).eq('id', tid);
    await loadData(user.id);
    setClosingTradeId(null); setClosePrice('');
    setClosing(false);
  };

  const deleteTrade = async (tid: string) => {
    if (!user || !confirm('Delete this trade?')) return;
    await supabase.from('prop_trades').delete().eq('id', tid);
    await loadData(user.id);
  };

  const saveSettings = async () => {
    if (!user || !editAccount) return;
    setSaving(true);
    await supabase.from('prop_accounts').update({
      name: editAccount.name, balance: editAccount.balance, currency: editAccount.currency,
      daily_dd_pct: editAccount.daily_dd_pct, daily_dd_calc: editAccount.daily_dd_calc,
      max_dd_pct: editAccount.max_dd_pct, max_dd_type: editAccount.max_dd_type,
      trail_lock: editAccount.trail_lock, trail_lock_pct: editAccount.trail_lock_pct,
      profit_target_pct: editAccount.profit_target_pct, phase: editAccount.phase,
      min_days: editAccount.min_days, consistency_pct: editAccount.consistency_pct,
      risk_pct: editAccount.risk_pct, max_trades_per_day: editAccount.max_trades_per_day,
      profit_split: (editAccount as any).profit_split ?? 80,
      challenge_fee: (editAccount as any).challenge_fee ?? 0,
    }).eq('id', editAccount.id);
    await loadData(user.id);
    setShowSettings(false);
    setSaving(false);
  };

  if (loading || !account || !c) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  const danger = c.ddPct >= 80;
  const warn = c.ddPct >= 60;
  const hBorder = danger ? 'border-red-500/50' : warn ? 'border-amber-500/30' : 'border-gray-800/50';
  const pColor = account.phase === 'Funded' ? 'bg-emerald-500/10 text-emerald-400' : account.phase === 'Phase 2' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400';

  const narr: string[] = [account.phase];
  if (c.wins + c.losses > 0) narr.push(`${c.wins}W ${c.losses}L`);
  narr.push(fmtM(c.sessionPnl, account.currency));
  if (c.ddPct >= 80) narr.push('DD DANGER'); else if (c.ddPct >= 60) narr.push(`DD ${fmt(c.ddPct, 0)}%`);
  if (c.tradesLeft === 0) narr.push('NO TRADES LEFT'); else if (c.tradesLeft === 1) narr.push('1 trade left');
  if (c.progressPct >= 100) narr.push('TARGET REACHED');
  const narrBg = danger ? 'bg-red-500/10 border-red-500/30' : warn ? 'bg-amber-500/10 border-amber-500/30' : c.sessionPnl > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-sky-500/10 border-sky-500/30';

  const todayStr = new Date().toISOString().split('T')[0];
  const journalDates = journalView === 'today' ? c.sortedDates.filter(d => d === todayStr) : c.sortedDates;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className={`border-b ${hBorder} bg-[#0d0d14] transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/prop" className="text-gray-500 hover:text-gray-300 flex-shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold truncate">{account.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pColor}`}>{account.phase}</span>
                {danger && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">DANGER</span>}
              </div>
              <p className="text-xs text-gray-500 truncate">{account.currency} {account.balance.toLocaleString()} · {account.daily_dd_pct}%/{account.max_dd_pct}% · {account.daily_dd_calc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/prop/${account.id}/analytics`}
              className="p-2.5 text-gray-500 hover:text-sky-400 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all" title="Analytics">
              <LineChart className="w-4 h-4" />
            </Link>
            <button onClick={() => { setEditAccount({...account}); setShowSettings(true); }}
              className="p-2.5 text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setShowNewTrade(true)} disabled={c.tradesLeft <= 0 || c.ddPct >= 100}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${c.tradesLeft <= 0 || c.ddPct >= 100 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'}`}>
              <Zap className="w-4 h-4" /> <span className="hidden sm:inline">New Trade</span>
            </button>
          </div>
        </div>
      </div>

      <SurvivalBar remaining={c.survivalCount} total={Math.max(Math.floor(c.dailyDdLimit / c.effectiveRiskD), 1)} currency={account.currency} budgetLeft={c.budgetLeft} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`${narrBg} border rounded-lg px-4 py-2 mb-6`}><p className="text-sm text-center text-gray-300">{narr.join('  ·  ')}</p></div>

        {/* ── STATS GRID ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Session P&L" icon={DollarSign} value={fmtM(c.sessionPnl, account.currency)} color={c.sessionPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} sub={c.wins + c.losses > 0 ? `${c.wins}W ${c.losses}L · ${fmt(c.avgR)}R avg` : 'No trades yet'} />
          <StatCard label="Daily DD" icon={Shield} value={`${fmt(c.ddPct, 0)}%`} color={danger ? 'text-red-400' : warn ? 'text-amber-400' : 'text-emerald-400'} sub={`${account.currency} ${fmt(c.ddUsed, 0)} / ${fmt(c.dailyDdLimit, 0)}`} />
          <StatCard label="Budget" icon={Target} value={`${account.currency} ${fmt(c.budgetLeft, 0)}`} color={c.budgetLeft > c.dailyDdLimit * 0.5 ? 'text-emerald-400' : c.budgetLeft > 0 ? 'text-amber-400' : 'text-red-400'} />
          <StatCard label="Trades" icon={BarChart3} value={`${c.todayTrades.length} / ${account.max_trades_per_day}`} color={c.tradesLeft <= 0 ? 'text-red-400' : 'text-white'} sub={`${c.tradesLeft} remaining`} />
          <StatCard label="Target" icon={Crosshair} value={`${fmt(c.progressPct, 0)}%`} color={c.progressPct >= 100 ? 'text-emerald-400' : 'text-amber-400'} sub={`${account.currency} ${fmt(c.totalPnl)} / ${fmt(c.targetD)}`} />
          <StatCard label="Risk/Trade" icon={AlertTriangle} value={`${fmt(c.effectiveRisk, 1)}%`} color="text-sky-400" sub={`${account.currency} ${fmt(c.effectiveRiskD, 0)} · ${account.phase === 'Funded' ? '50%' : account.phase === 'Phase 2' ? '75%' : 'Full'}`} />
        </div>

        {/* ── TRADINGVIEW CHART ────────────────────────────────────────────── */}
        {(() => {
          const chartSymbol = c.openTrades.length > 0
            ? c.openTrades[0].symbol
            : trades.length > 0
              ? trades[0].symbol
              : 'EURUSD';
          return (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                    <Tv className="w-4 h-4 text-sky-400" /> Chart
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded">{chartSymbol}</span>
                  {c.openTrades.length > 0 && c.openTrades.length > 1 && (
                    <div className="flex items-center gap-1">
                      {c.openTrades.map(t => (
                        <span key={t.id} className="text-[10px] text-gray-600 bg-gray-800/50 px-1.5 py-0.5 rounded cursor-default">{t.symbol}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setChartHeight(h => h === 400 ? 550 : 400)}
                    className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors" title={chartHeight === 400 ? 'Expand chart' : 'Collapse chart'}>
                    {chartHeight === 400 ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setShowChart(!showChart)}
                    className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
                    {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {showChart && <TradingViewChart symbol={chartSymbol} height={chartHeight} />}
            </div>
          );
        })()}

        {/* ── DD & PROGRESS PANELS ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Shield className="w-4 h-4 text-sky-400" /> Drawdown Monitor</h3>
            <DDGauge value={c.ddUsed} max={c.dailyDdLimit} label="Daily Drawdown" sublabel={`${account.daily_dd_calc}`} />
            <DDGauge value={c.ddUsed} max={c.maxDdLimit} label="Max Drawdown" sublabel={`${account.max_dd_type} · Floor: ${account.currency} ${fmt(account.balance - c.maxDdLimit, 0)}`} />
            {c.ddPct >= 60 && <div className={`flex items-start gap-2 p-3 rounded-lg ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}><AlertCircle className={`w-4 h-4 mt-0.5 ${danger ? 'text-red-400' : 'text-amber-400'}`} /><p className={`text-xs ${danger ? 'text-red-300' : 'text-amber-300'}`}>{danger ? 'Stop trading. Protect the account.' : 'Caution — reduce size or stop.'}</p></div>}
          </div>
          <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> Challenge Progress</h3>
            <DDGauge value={Math.max(0, c.totalPnl)} max={c.targetD} label={`Target: ${account.profit_target_pct}%`} sublabel={`${account.currency} ${fmt(c.targetD, 0)} needed`} variant="progress" />
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Total P&L</span><span className={c.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtM(c.totalPnl, account.currency)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total R</span><span className={c.totalR >= 0 ? 'text-emerald-400' : 'text-red-400'}>{c.totalR >= 0 ? '+' : ''}{fmt(c.totalR)}R</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Risk Mode</span><span className={account.phase === 'Funded' ? 'text-emerald-400' : 'text-sky-400'}>{account.phase === 'Funded' ? `Funded · ${fmt(c.effectiveRisk, 1)}% per trade` : account.phase === 'Phase 2' ? `P2 · ${fmt(c.effectiveRisk, 1)}% per trade` : `P1 · ${fmt(c.effectiveRisk, 1)}% per trade`}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Survival</span><span className={c.survivalCount <= 2 ? 'text-red-400' : 'text-emerald-400'}>{c.survivalCount} losses before breach</span></div>
            </div>
          </div>
        </div>

        {/* ── OPEN POSITIONS ──────────────────────────────────────────────── */}
        {c.openTrades.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Open Positions
              {Object.values(livePrices).some(p => p !== null) && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500/60 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
              )}
            </h3>
            {c.openTrades.map(t => {
              const livePrice = livePrices[t.symbol];
              const hasLive = livePrice !== null && livePrice !== undefined;
              const move = hasLive
                ? (t.direction === 'long' ? livePrice - t.entry_price : t.entry_price - livePrice)
                : null;
              const dist = Math.abs(t.entry_price - t.stop_price);
              const unrealizedR = move !== null && dist > 0 ? move / dist : null;
              const unrealizedPnl = move !== null ? move * (t.lot_size || 0) * 100000 : null;
              const pnlColor = unrealizedPnl !== null ? (unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500';
              const pnlBorder = unrealizedPnl !== null ? (unrealizedPnl >= 0 ? 'border-emerald-500/20' : 'border-red-500/20') : 'border-sky-500/20';

              return (
                <div key={t.id} className={`bg-[#12121a] border ${pnlBorder} rounded-xl p-4 mb-2 transition-colors`}>
                  {/* Row 1: Direction, Symbol, Entry, SL, Lots */}
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-sm font-bold px-2 py-1 rounded ${t.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {t.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                      </span>
                      <span className="font-medium">{t.symbol}</span>
                      <span className="text-sm text-gray-400">@ {t.entry_price}</span>
                      <span className="text-xs text-gray-600">SL {t.stop_price}</span>
                      <span className="text-xs text-gray-600">{t.lot_size} lots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {closingTradeId === t.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <input type="number" step="any" placeholder="Exit price" value={closePrice} onChange={e => setClosePrice(e.target.value)}
                            className="w-28 sm:w-32 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none" autoFocus />
                          <button onClick={() => closeTrade(t.id)} disabled={closing}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium">
                            {closing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Close & Log'}
                          </button>
                          <button onClick={() => { setClosingTradeId(null); setClosePrice(''); }} className="p-1 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          {hasLive && (
                            <button onClick={() => { setClosingTradeId(t.id); setClosePrice(String(livePrice)); }}
                              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                              title={`Close at live price ${livePrice}`}>
                              Close @ {livePrice}
                            </button>
                          )}
                          <button onClick={() => setClosingTradeId(t.id)} className="px-4 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-xs font-medium">
                            {hasLive ? 'Custom' : 'Close Trade'}
                          </button>
                          <button onClick={() => deleteTrade(t.id)} className="p-1.5 text-gray-700 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Row 2: Live Price + Unrealized P&L */}
                  {hasLive && (
                    <div className="flex items-center gap-4 pl-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase">Live</span>
                        <span className="text-sm font-bold text-white tabular-nums">{livePrice}</span>
                      </div>
                      <div className="w-px h-4 bg-gray-800" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase">Unrealized</span>
                        <span className={`text-sm font-bold tabular-nums ${pnlColor}`}>
                          {unrealizedPnl !== null ? `${unrealizedPnl >= 0 ? '+' : ''}${account.currency} ${fmt(unrealizedPnl)}` : '—'}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-gray-800" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase">R</span>
                        <span className={`text-sm font-bold tabular-nums ${pnlColor}`}>
                          {unrealizedR !== null ? `${unrealizedR >= 0 ? '+' : ''}${fmt(unrealizedR)}R` : '—'}
                        </span>
                      </div>
                      {unrealizedPnl !== null && Math.abs(unrealizedPnl) > 0 && (
                        <>
                          <div className="w-px h-4 bg-gray-800" />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase">Pips</span>
                            <span className={`text-xs tabular-nums ${pnlColor}`}>
                              {move !== null ? `${move >= 0 ? '+' : ''}${fmt(move * 10000, 1)}` : '—'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {!hasLive && (
                    <div className="pl-1 text-[10px] text-gray-600">Price feed loading...</div>
                  )}
                </div>
              );
            })}
            ))}
          </div>
        )}

        {/* ── TRADE JOURNAL ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Trade Journal</h3>
            <div className="flex items-center bg-gray-900/50 rounded-lg p-0.5">
              <button onClick={() => setJournalView('today')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${journalView === 'today' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                Today
              </button>
              <button onClick={() => setJournalView('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${journalView === 'all' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                All History
              </button>
            </div>
          </div>

          {journalDates.length === 0 ? (
            <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-12 text-center">
              <Crosshair className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{journalView === 'today' ? 'No closed trades today' : 'No trade history yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journalDates.map(date => (
                <JournalDayGroup
                  key={date}
                  date={date}
                  trades={c.closedByDate[date]}
                  currency={account.currency}
                  onDelete={deleteTrade}
                  isToday={date === todayStr}
                />
              ))}
              {journalView === 'all' && c.allClosed.length > 0 && (
                <div className="bg-gray-900/30 border border-gray-800/20 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {c.allClosed.length} total trades across {c.sortedDates.length} days
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${c.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    All-time: {c.totalPnl >= 0 ? '+' : ''}{account.currency} {fmt(c.totalPnl)} ({c.totalR >= 0 ? '+' : ''}{fmt(c.totalR)}R)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── NEW TRADE MODAL ──────────────────────────────────────────────── */}
      {showNewTrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="border-b border-gray-800/50 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Open Trade</h2>
                <p className="text-xs text-gray-500 mt-0.5">Risk: {account.currency} {fmt(c.effectiveRiskD)} ({fmt(c.effectiveRisk, 1)}%) · Budget: {account.currency} {fmt(c.budgetLeft, 0)} · {c.tradesLeft} left</p>
              </div>
              <button onClick={() => setShowNewTrade(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Symbol</label>
                  <input type="text" value={tradeForm.symbol} onChange={e => setTradeForm({...tradeForm, symbol: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['long', 'short'].map(d => (
                      <button key={d} onClick={() => setTradeForm({...tradeForm, direction: d})}
                        className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                          tradeForm.direction === d
                            ? d === 'long' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'bg-gray-800 text-gray-500 hover:text-white'
                        }`}>
                        {d === 'long' ? <><TrendingUp className="w-4 h-4" />LONG</> : <><TrendingDown className="w-4 h-4" />SHORT</>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1.5">Entry Price</label>
                  <input type="number" step="any" placeholder="1.15325" value={tradeForm.entry_price} onChange={e => setTradeForm({...tradeForm, entry_price: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1.5">Stop Price</label>
                  <input type="number" step="any" placeholder="1.15225" value={tradeForm.stop_price} onChange={e => setTradeForm({...tradeForm, stop_price: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" /></div>
              </div>
              {tradeForm.entry_price && tradeForm.stop_price && (() => {
                const e = parseFloat(tradeForm.entry_price), s = parseFloat(tradeForm.stop_price);
                if (!e || !s) return null;
                const d = Math.abs(e - s), p = d * 10000, l = p > 0 ? c.effectiveRiskD / (p * 10) : 0, bp = c.dailyDdLimit > 0 ? (c.effectiveRiskD / c.dailyDdLimit) * 100 : 0;
                const v = tradeForm.direction === 'long' ? s < e : s > e;
                return (
                  <div className={`rounded-xl p-4 space-y-2 ${v ? 'bg-gray-900/80 border border-gray-800/50' : 'bg-red-500/10 border border-red-500/30'}`}>
                    {!v && <div className="flex items-center gap-2 text-red-400 text-xs mb-2"><AlertTriangle className="w-3.5 h-3.5" />Stop wrong side for {tradeForm.direction}</div>}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Pips</span><span className="text-gray-300 tabular-nums">{fmt(p, 1)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Lots</span><span className="text-white font-bold tabular-nums">{fmt(l)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Risk</span><span className="text-red-400">{account.currency} {fmt(c.effectiveRiskD)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget</span><span className={bp > 40 ? 'text-amber-400' : 'text-gray-300'}>{fmt(bp, 0)}%</span></div>
                    </div>
                  </div>
                );
              })()}
              <div><label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <input type="text" placeholder="Setup reason..." value={tradeForm.notes} onChange={e => setTradeForm({...tradeForm, notes: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
            </div>
            <div className="border-t border-gray-800/50 p-5 flex justify-end gap-3">
              <button onClick={() => setShowNewTrade(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={openTrade} disabled={submitting || !tradeForm.entry_price || !tradeForm.stop_price}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-sky-600/20">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Execute Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ───────────────────────────────────────────────── */}
      {showSettings && editAccount && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`.modal-scroll::-webkit-scrollbar { width: 6px; } .modal-scroll::-webkit-scrollbar-track { background: transparent; } .modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; } .modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }`}</style>
          <div className="modal-scroll bg-[#12121a] border border-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#12121a] border-b border-gray-800/50 p-5 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Account Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1.5">Account Name</label>
                  <input type="text" value={editAccount.name} onChange={e => setEditAccount({...editAccount, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1.5">Balance</label>
                  <input type="number" value={editAccount.balance} onChange={e => setEditAccount({...editAccount, balance: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1.5">Currency</label>
                  <select value={editAccount.currency} onChange={e => setEditAccount({...editAccount, currency: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none">
                    {['USD','EUR','GBP','JPY','AUD','CAD','CHF'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-xs text-gray-400 mb-1.5">Phase</label>
                  <select value={editAccount.phase} onChange={e => setEditAccount({...editAccount, phase: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none">
                    {['Phase 1','Phase 2','Funded'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Drawdown Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-400 mb-1">Daily Loss Limit (%)</label>
                    <input type="number" step="0.5" value={editAccount.daily_dd_pct} onChange={e => setEditAccount({...editAccount, daily_dd_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">DD Calculation</label>
                    <select value={editAccount.daily_dd_calc} onChange={e => setEditAccount({...editAccount, daily_dd_calc: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none">
                      {['Balance-Based','Equity-Based','Intraday Trailing'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Max Drawdown (%)</label>
                    <input type="number" step="0.5" value={editAccount.max_dd_pct} onChange={e => setEditAccount({...editAccount, max_dd_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Max DD Type</label>
                    <select value={editAccount.max_dd_type} onChange={e => setEditAccount({...editAccount, max_dd_type: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none">
                      {['Static','EOD Trailing','Intraday Trailing'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Trailing DD Locks at BE</label>
                    <select value={editAccount.trail_lock ? 'Yes' : 'No'} onChange={e => setEditAccount({...editAccount, trail_lock: e.target.value === 'Yes'})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none">
                      <option value="No">No</option><option value="Yes">Yes</option>
                    </select></div>
                  {editAccount.trail_lock && <div><label className="block text-xs text-gray-400 mb-1">Lock Threshold (%)</label>
                    <input type="number" step="1" value={editAccount.trail_lock_pct} onChange={e => setEditAccount({...editAccount, trail_lock_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2"><Target className="w-4 h-4" /> Challenge & Risk</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-400 mb-1">Profit Target (%)</label>
                    <input type="number" step="0.5" value={editAccount.profit_target_pct} onChange={e => setEditAccount({...editAccount, profit_target_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Min Trading Days</label>
                    <input type="number" value={editAccount.min_days} onChange={e => setEditAccount({...editAccount, min_days: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Consistency Rule (%)</label>
                    <input type="number" step="5" value={editAccount.consistency_pct} onChange={e => setEditAccount({...editAccount, consistency_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Risk Per Trade (%)</label>
                    <input type="number" step="0.1" value={editAccount.risk_pct} onChange={e => setEditAccount({...editAccount, risk_pct: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Max Trades / Day</label>
                    <input type="number" value={editAccount.max_trades_per_day} onChange={e => setEditAccount({...editAccount, max_trades_per_day: parseInt(e.target.value) || 1})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Payout & Fees</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-400 mb-1">Profit Split (%)</label>
                    <input type="number" step="5" value={(editAccount as any).profit_split ?? 80} onChange={e => setEditAccount({...editAccount, profit_split: parseFloat(e.target.value) || 80} as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">Challenge Fee ({account.currency})</label>
                    <input type="number" step="10" value={(editAccount as any).challenge_fee ?? 0} onChange={e => setEditAccount({...editAccount, challenge_fee: parseFloat(e.target.value) || 0} as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#12121a] border-t border-gray-800/50 p-5 flex items-center justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={saveSettings} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
