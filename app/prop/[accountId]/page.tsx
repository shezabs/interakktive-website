'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowLeft, TrendingUp, TrendingDown, Shield, Target, AlertTriangle,
  X, Check, Loader2, Trash2, DollarSign, Crosshair, BarChart3, Zap, Heart, Activity, AlertCircle
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

function SurvivalBar({ remaining, total, currency, budgetLeft }: { remaining: number; total: number; currency: string; budgetLeft: number }) {
  const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 100;
  const segments = Math.min(Math.max(total, 1), 10);
  const filled = Math.min(Math.max(remaining, 0), segments);
  const grad = pct > 60 ? 'from-emerald-600 to-emerald-400' : pct > 30 ? 'from-amber-600 to-amber-400' : 'from-red-600 to-red-400';
  const tc = pct > 60 ? 'text-emerald-400' : pct > 30 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className={`bg-[#0d0d14] border-b border-gray-800/50 px-4 py-2.5 ${pct <= 30 ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2"><Heart className={`w-4 h-4 ${tc}`} /><span className="text-xs text-gray-400">Survival</span></div>
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: segments }).map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-sm transition-all duration-300 ${i < filled ? `bg-gradient-to-r ${grad}` : 'bg-gray-800'}`} />
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className={`font-bold tabular-nums ${tc}`}>{remaining} trade{remaining !== 1 ? 's' : ''} left</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Budget: <span className={`font-medium ${tc}`}>{currency} {fmt(budgetLeft, 0)}</span></span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-white', sub, icon: Icon }: { label: string; value: string; color?: string; sub?: string; icon?: any }) {
  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-4 hover:border-gray-700/50 transition-all">
      <div className="flex items-center gap-2 mb-2">{Icon && <Icon className="w-3.5 h-3.5 text-gray-600" />}<span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span></div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

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

  const loadData = useCallback(async (uid: string) => {
    const [a, t] = await Promise.all([
      supabase.from('prop_accounts').select('*').eq('id', accountId).eq('user_id', uid).single(),
      supabase.from('prop_trades').select('*').eq('account_id', accountId).eq('user_id', uid).order('opened_at', { ascending: false }).limit(100),
    ]);
    if (a.data) setAccount(a.data);
    if (t.data) setTrades(t.data);
  }, [accountId]);

  useEffect(() => { (async () => { const { data: { user: u } } = await supabase.auth.getUser(); if (!u) { router.push('/signin'); return; } setUser(u); await loadData(u.id); setLoading(false); })(); }, [router, loadData]);

  const c = useMemo(() => {
    if (!account) return null;
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(t.opened_at).toDateString() === today);
    const closedToday = todayTrades.filter(t => t.status === 'closed');
    const openTrades = trades.filter(t => t.status === 'open');
    const sessionPnl = closedToday.reduce((s, t) => s + (t.pnl || 0), 0);
    const sessionR = closedToday.reduce((s, t) => s + (t.r_result || 0), 0);
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
    const progressPct = targetD > 0 ? Math.max(0, sessionPnl) / targetD * 100 : 0;
    const survivalCount = effectiveRiskD > 0 ? Math.floor(budgetLeft / effectiveRiskD) : 99;
    const tradesLeft = Math.max(0, account.max_trades_per_day - todayTrades.length);
    return { todayTrades, closedToday, openTrades, sessionPnl, sessionR, wins, losses, avgR, effectiveRisk, effectiveRiskD, riskD, dailyDdLimit, maxDdLimit, ddUsed, ddPct, budgetLeft, targetD, progressPct, survivalCount, tradesLeft };
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

  if (loading || !account || !c) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  const danger = c.ddPct >= 80;
  const warn = c.ddPct >= 60;
  const hBorder = danger ? 'border-red-500/50' : warn ? 'border-amber-500/30' : 'border-gray-800/50';
  const pColor = account.phase === 'Funded' ? 'bg-emerald-500/10 text-emerald-400' : account.phase === 'Phase 2' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400';

  // Session narrative
  const narr: string[] = [account.phase];
  if (c.wins + c.losses > 0) narr.push(`${c.wins}W ${c.losses}L`);
  narr.push(fmtM(c.sessionPnl, account.currency));
  if (c.ddPct >= 80) narr.push('DD DANGER'); else if (c.ddPct >= 60) narr.push(`DD ${fmt(c.ddPct, 0)}%`);
  if (c.tradesLeft === 0) narr.push('NO TRADES LEFT'); else if (c.tradesLeft === 1) narr.push('1 trade left');
  if (c.progressPct >= 100) narr.push('TARGET REACHED');
  const narrBg = danger ? 'bg-red-500/10 border-red-500/30' : warn ? 'bg-amber-500/10 border-amber-500/30' : c.sessionPnl > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-sky-500/10 border-sky-500/30';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className={`border-b ${hBorder} bg-[#0d0d14] transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/prop" className="text-gray-500 hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{account.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pColor}`}>{account.phase}</span>
                {danger && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">DANGER</span>}
              </div>
              <p className="text-xs text-gray-500">{account.currency} {account.balance.toLocaleString()} · {account.daily_dd_pct}%/{account.max_dd_pct}% · {account.daily_dd_calc} · {account.max_dd_type}</p>
            </div>
          </div>
          <button onClick={() => setShowNewTrade(true)} disabled={c.tradesLeft <= 0 || c.ddPct >= 100}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${c.tradesLeft <= 0 || c.ddPct >= 100 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'}`}>
            <Zap className="w-4 h-4" /> New Trade
          </button>
        </div>
      </div>

      <SurvivalBar remaining={c.survivalCount} total={Math.max(Math.floor(c.dailyDdLimit / c.effectiveRiskD), 1)} currency={account.currency} budgetLeft={c.budgetLeft} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`${narrBg} border rounded-lg px-4 py-2 mb-6`}><p className="text-sm text-center text-gray-300">{narr.join('  ·  ')}</p></div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Session P&L" icon={DollarSign} value={fmtM(c.sessionPnl, account.currency)} color={c.sessionPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} sub={c.wins + c.losses > 0 ? `${c.wins}W ${c.losses}L · ${fmt(c.avgR)}R avg` : 'No trades yet'} />
          <StatCard label="Daily DD" icon={Shield} value={`${fmt(c.ddPct, 0)}%`} color={danger ? 'text-red-400' : warn ? 'text-amber-400' : 'text-emerald-400'} sub={`${account.currency} ${fmt(c.ddUsed, 0)} / ${fmt(c.dailyDdLimit, 0)}`} />
          <StatCard label="Budget" icon={Target} value={`${account.currency} ${fmt(c.budgetLeft, 0)}`} color={c.budgetLeft > c.dailyDdLimit * 0.5 ? 'text-emerald-400' : c.budgetLeft > 0 ? 'text-amber-400' : 'text-red-400'} />
          <StatCard label="Trades" icon={BarChart3} value={`${c.todayTrades.length} / ${account.max_trades_per_day}`} color={c.tradesLeft <= 0 ? 'text-red-400' : 'text-white'} sub={`${c.tradesLeft} remaining`} />
          <StatCard label="Target" icon={Crosshair} value={`${fmt(c.progressPct, 0)}%`} color={c.progressPct >= 100 ? 'text-emerald-400' : 'text-amber-400'} sub={`Need ${account.currency} ${fmt(Math.max(0, c.targetD - Math.max(0, c.sessionPnl)), 0)}`} />
          <StatCard label="Risk/Trade" icon={AlertTriangle} value={`${fmt(c.effectiveRisk, 1)}%`} color="text-sky-400" sub={`${account.currency} ${fmt(c.effectiveRiskD, 0)} · ${account.phase === 'Funded' ? '50%' : account.phase === 'Phase 2' ? '75%' : 'Full'}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Shield className="w-4 h-4 text-sky-400" /> Drawdown Monitor</h3>
            <DDGauge value={c.ddUsed} max={c.dailyDdLimit} label="Daily Drawdown" sublabel={`${account.daily_dd_calc}`} />
            <DDGauge value={c.ddUsed} max={c.maxDdLimit} label="Max Drawdown" sublabel={`${account.max_dd_type} · Floor: ${account.currency} ${fmt(account.balance - c.maxDdLimit, 0)}`} />
            {c.ddPct >= 60 && <div className={`flex items-start gap-2 p-3 rounded-lg ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}><AlertCircle className={`w-4 h-4 mt-0.5 ${danger ? 'text-red-400' : 'text-amber-400'}`} /><p className={`text-xs ${danger ? 'text-red-300' : 'text-amber-300'}`}>{danger ? 'Stop trading. Protect the account.' : 'Caution — reduce size or stop.'}</p></div>}
          </div>
          <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> Challenge Progress</h3>
            <DDGauge value={Math.max(0, c.sessionPnl)} max={c.targetD} label={`Target: ${account.profit_target_pct}%`} sublabel={`${account.currency} ${fmt(c.targetD, 0)} needed`} variant="progress" />
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Strategy</span><span className={account.phase === 'Funded' ? 'text-emerald-400' : 'text-sky-400'}>{account.phase === 'Funded' ? 'Survival' : account.phase === 'Phase 2' ? '75% risk' : 'Full risk'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Survival</span><span className={c.survivalCount <= 2 ? 'text-red-400' : 'text-emerald-400'}>{c.survivalCount} losses before breach</span></div>
            </div>
          </div>
        </div>

        {c.openTrades.length > 0 && <div className="mb-6"><h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Open Positions</h3>
          {c.openTrades.map(t => <div key={t.id} className="bg-[#12121a] border border-sky-500/20 rounded-xl p-4 flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`text-sm font-bold px-2 py-1 rounded ${t.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{t.direction === 'long' ? '▲ LONG' : '▼ SHORT'}</span>
              <span className="font-medium">{t.symbol}</span><span className="text-sm text-gray-400">@ {t.entry_price}</span><span className="text-xs text-gray-600">SL {t.stop_price}</span><span className="text-xs text-gray-600">{t.lot_size} lots</span>
            </div>
            <div className="flex items-center gap-2">
              {closingTradeId === t.id ? <div className="flex items-center gap-2">
                <input type="number" step="any" placeholder="Exit price" value={closePrice} onChange={e => setClosePrice(e.target.value)} className="w-32 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none" autoFocus />
                <button onClick={() => closeTrade(t.id)} disabled={closing} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium">{closing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Close & Log'}</button>
                <button onClick={() => { setClosingTradeId(null); setClosePrice(''); }} className="p-1 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div> : <>
                <button onClick={() => setClosingTradeId(t.id)} className="px-4 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-xs font-medium">Close Trade</button>
                <button onClick={() => deleteTrade(t.id)} className="p-1.5 text-gray-700 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </>}
            </div>
          </div>)}
        </div>}

        <div><h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Trade Journal</h3>
          {c.closedToday.length === 0 ? <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-12 text-center"><Crosshair className="w-8 h-8 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 text-sm">No closed trades today</p></div>
          : <div className="bg-[#12121a] border border-gray-800/30 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-gray-800/50 bg-gray-900/30">
            {['#','DIR','SYMBOL','ENTRY','EXIT','P&L','R','TIME',''].map(h => <th key={h} className={`px-4 py-3 text-xs text-gray-600 font-medium uppercase tracking-wider ${['ENTRY','EXIT','P&L','R','TIME'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>)}
          </tr></thead><tbody>
            {c.closedToday.map((t, i) => { const pc = (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'; const rb = (t.pnl || 0) >= 0 ? 'hover:bg-emerald-500/5' : 'hover:bg-red-500/5'; const tm = t.closed_at ? new Date(t.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; return (
              <tr key={t.id} className={`border-b border-gray-800/20 ${rb}`}>
                <td className="px-4 py-3 text-gray-600">{i+1}</td>
                <td className={`px-4 py-3 font-medium ${t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{t.direction === 'long' ? '▲' : '▼'} {t.direction.toUpperCase()}</td>
                <td className="px-4 py-3 text-gray-300">{t.symbol}</td>
                <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{t.entry_price}</td>
                <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{t.close_price}</td>
                <td className={`px-4 py-3 text-right font-bold tabular-nums ${pc}`}>{(t.pnl||0)>=0?'+':''}{account.currency} {fmt(t.pnl||0)}</td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${pc}`}>{(t.r_result||0)>=0?'+':''}{fmt(t.r_result||0)}R</td>
                <td className="px-4 py-3 text-right text-gray-700 text-xs">{tm}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => deleteTrade(t.id)} className="text-gray-800 hover:text-red-400"><Trash2 className="w-3 h-3" /></button></td>
              </tr>); })}
            <tr className="bg-gray-900/50"><td colSpan={5} className="px-4 py-3 text-right text-xs text-gray-500">{c.wins}W {c.losses}L · {fmt(c.avgR)}R avg</td>
              <td className={`px-4 py-3 text-right font-bold text-lg tabular-nums ${c.sessionPnl>=0?'text-emerald-400':'text-red-400'}`}>{c.sessionPnl>=0?'+':''}{account.currency} {fmt(c.sessionPnl)}</td>
              <td className={`px-4 py-3 text-right font-bold tabular-nums ${c.sessionR>=0?'text-emerald-400':'text-red-400'}`}>{c.sessionR>=0?'+':''}{fmt(c.sessionR)}R</td><td colSpan={2}></td></tr>
          </tbody></table></div>}
        </div>
      </div>

      {showNewTrade && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="border-b border-gray-800/50 p-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Open Trade</h2><p className="text-xs text-gray-500 mt-0.5">Risk: {account.currency} {fmt(c.effectiveRiskD)} ({fmt(c.effectiveRisk, 1)}%) · Budget: {account.currency} {fmt(c.budgetLeft, 0)} · {c.tradesLeft} left</p></div><button onClick={() => setShowNewTrade(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3"><div><label className="block text-xs text-gray-400 mb-1.5">Symbol</label><input type="text" value={tradeForm.symbol} onChange={e => setTradeForm({...tradeForm, symbol: e.target.value.toUpperCase()})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-sky-500 focus:outline-none" /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-400 mb-1.5">Direction</label><div className="grid grid-cols-2 gap-2">{['long','short'].map(d => <button key={d} onClick={() => setTradeForm({...tradeForm, direction: d})} className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${tradeForm.direction===d ? d==='long' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>{d==='long'?<><TrendingUp className="w-4 h-4"/>LONG</>:<><TrendingDown className="w-4 h-4"/>SHORT</>}</button>)}</div></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-gray-400 mb-1.5">Entry Price</label><input type="number" step="any" placeholder="1.15325" value={tradeForm.entry_price} onChange={e => setTradeForm({...tradeForm, entry_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-400 mb-1.5">Stop Price</label><input type="number" step="any" placeholder="1.15225" value={tradeForm.stop_price} onChange={e => setTradeForm({...tradeForm, stop_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" /></div></div>
          {tradeForm.entry_price && tradeForm.stop_price && (() => { const e=parseFloat(tradeForm.entry_price),s=parseFloat(tradeForm.stop_price); if(!e||!s) return null; const d=Math.abs(e-s),p=d*10000,l=p>0?c.effectiveRiskD/(p*10):0,bp=c.dailyDdLimit>0?(c.effectiveRiskD/c.dailyDdLimit)*100:0,v=tradeForm.direction==='long'?s<e:s>e;
            return <div className={`rounded-xl p-4 space-y-2 ${v?'bg-gray-900/80 border border-gray-800/50':'bg-red-500/10 border border-red-500/30'}`}>
              {!v && <div className="flex items-center gap-2 text-red-400 text-xs mb-2"><AlertTriangle className="w-3.5 h-3.5"/>Stop wrong side for {tradeForm.direction}</div>}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Pips</span><span className="text-gray-300 tabular-nums">{fmt(p,1)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Lots</span><span className="text-white font-bold tabular-nums">{fmt(l)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Risk</span><span className="text-red-400">{account.currency} {fmt(c.effectiveRiskD)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Budget</span><span className={bp>40?'text-amber-400':'text-gray-300'}>{fmt(bp,0)}%</span></div>
              </div></div>; })()}
          <div><label className="block text-xs text-gray-400 mb-1.5">Notes</label><input type="text" placeholder="Setup reason..." value={tradeForm.notes} onChange={e => setTradeForm({...tradeForm, notes: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-sky-500 focus:outline-none" /></div>
        </div>
        <div className="border-t border-gray-800/50 p-5 flex justify-end gap-3"><button onClick={() => setShowNewTrade(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={openTrade} disabled={submitting||!tradeForm.entry_price||!tradeForm.stop_price} className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-sky-600/20">{submitting?<Loader2 className="w-4 h-4 animate-spin"/>:<Zap className="w-4 h-4"/>}Execute Trade</button></div>
      </div></div>}
    </div>
  );
}
