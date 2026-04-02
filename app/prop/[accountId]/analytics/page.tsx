'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  ArrowLeft, Loader2, TrendingUp, TrendingDown, Target, Shield, BarChart3,
  Calendar, Zap, Award, DollarSign, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';

interface PropAccount {
  id: string; name: string; balance: number; currency: string;
  daily_dd_pct: number; max_dd_pct: number; profit_target_pct: number; phase: string;
  risk_pct: number; max_trades_per_day: number;
}

interface Trade {
  id: string; symbol: string; direction: string;
  entry_price: number; stop_price: number; close_price: number | null;
  pnl: number | null; r_result: number | null;
  status: string; notes: string | null;
  opened_at: string; closed_at: string | null;
}

const fmt = (n: number, d = 2) => n.toFixed(d);

// ── EQUITY CURVE (SVG) ─────────────────────────────────────────────────────

function EquityCurve({ data, currency }: { data: { date: string; cumPnl: number }[]; currency: string }) {
  if (data.length < 2) return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-12 text-center">
      <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Need at least 2 trading days for equity curve</p>
    </div>
  );

  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: number } | null>(null);
  const W = 800, H = 300, PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const values = data.map(d => d.cumPnl);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(0, ...values);
  const range = maxV - minV || 1;

  const scaleX = (i: number) => PAD.left + (i / (data.length - 1)) * cW;
  const scaleY = (v: number) => PAD.top + cH - ((v - minV) / range) * cH;

  const linePoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.cumPnl)}`).join(' ');
  const fillPoints = [...data.map((d, i) => `${scaleX(i)},${scaleY(d.cumPnl)}`), `${scaleX(data.length - 1)},${scaleY(0)}`, `${scaleX(0)},${scaleY(0)}`].join(' ');

  const zeroY = scaleY(0);
  const lastVal = values[values.length - 1];
  const lineColor = lastVal >= 0 ? '#34d399' : '#f87171';
  const fillColor = lastVal >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)';

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => minV + (range * i) / (tickCount - 1));

  // X-axis labels (show ~6 evenly)
  const labelCount = Math.min(6, data.length);
  const xLabels = Array.from({ length: labelCount }, (_, i) => {
    const idx = Math.round((i / (labelCount - 1)) * (data.length - 1));
    return { idx, label: new Date(data[idx].date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) };
  });

  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-sky-400" /> Equity Curve</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setTooltip(null)}>
          {/* Grid lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={scaleY(v)} x2={W - PAD.right} y2={scaleY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={PAD.left - 8} y={scaleY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="monospace">
                {v >= 0 ? '+' : ''}{fmt(v, 0)}
              </text>
            </g>
          ))}
          {/* Zero line */}
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4,4" />
          {/* X labels */}
          {xLabels.map(({ idx, label }) => (
            <text key={idx} x={scaleX(idx)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10">{label}</text>
          ))}
          {/* Fill area */}
          <polygon points={fillPoints} fill={fillColor} />
          {/* Line */}
          <polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hover zones */}
          {data.map((d, i) => (
            <rect key={i} x={scaleX(i) - cW / data.length / 2} y={PAD.top} width={cW / data.length} height={cH}
              fill="transparent" className="cursor-crosshair"
              onMouseEnter={() => setTooltip({ x: scaleX(i), y: scaleY(d.cumPnl), date: d.date, value: d.cumPnl })} />
          ))}
          {/* Tooltip dot */}
          {tooltip && (
            <>
              <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + cH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={tooltip.x} cy={tooltip.y} r="4" fill={lineColor} stroke="#0a0a0f" strokeWidth="2" />
            </>
          )}
        </svg>
        {/* Tooltip label */}
        {tooltip && (
          <div className="absolute top-2 right-2 bg-gray-900/90 border border-gray-700/50 rounded-lg px-3 py-2 text-xs pointer-events-none">
            <div className="text-gray-400">{new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            <div className={`font-bold tabular-nums ${tooltip.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tooltip.value >= 0 ? '+' : ''}{currency} {fmt(tooltip.value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CALENDAR HEATMAP ────────────────────────────────────────────────────────

function CalendarHeatmap({ dayData, currency }: { dayData: Record<string, number>; currency: string }) {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = (firstDay + 6) % 7; // Monday start

  const allVals = Object.values(dayData);
  const maxAbs = Math.max(1, ...allVals.map(Math.abs));

  const getColor = (pnl: number) => {
    const intensity = Math.min(Math.abs(pnl) / maxAbs, 1);
    if (pnl > 0) return `rgba(52, 211, 153, ${0.15 + intensity * 0.6})`;
    if (pnl < 0) return `rgba(248, 113, 113, ${0.15 + intensity * 0.6})`;
    return 'rgba(255,255,255,0.03)';
  };

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));
  const monthLabel = viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(<div key={`pad-${i}`} className="aspect-square" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const pnl = dayData[dateStr];
    const hasTrades = pnl !== undefined;
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    cells.push(
      <div key={dateStr} className={`aspect-square rounded-md flex flex-col items-center justify-center relative group cursor-default transition-all ${isToday ? 'ring-1 ring-sky-500/50' : ''}`}
        style={{ backgroundColor: hasTrades ? getColor(pnl) : 'rgba(255,255,255,0.02)' }}>
        <span className={`text-[10px] ${hasTrades ? 'text-white/80' : 'text-gray-700'}`}>{d}</span>
        {hasTrades && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <span className={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pnl >= 0 ? '+' : ''}{currency} {fmt(pnl)}</span>
          </div>
        )}
      </div>
    );
  }

  // Monthly totals
  const monthDates = Object.keys(dayData).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const monthPnl = monthDates.reduce((s, d) => s + dayData[d], 0);
  const monthDays = monthDates.length;

  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-400" /> Calendar</h3>
        <div className="flex items-center gap-3">
          {monthDays > 0 && (
            <span className={`text-xs font-medium tabular-nums ${monthPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {monthPnl >= 0 ? '+' : ''}{currency} {fmt(monthPnl)} ({monthDays}d)
            </span>
          )}
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 text-gray-500 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs text-gray-400 w-28 text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="p-1 text-gray-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-600 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}

// ── R DISTRIBUTION ──────────────────────────────────────────────────────────

function RDistribution({ trades }: { trades: Trade[] }) {
  const rValues = trades.filter(t => t.r_result !== null).map(t => t.r_result!);
  if (rValues.length === 0) return null;

  const buckets: Record<string, number> = {};
  const labels = ['< -2R', '-2R', '-1R', '-0.5R', 'BE', '+0.5R', '+1R', '+2R', '+3R', '> 3R'];
  labels.forEach(l => buckets[l] = 0);

  for (const r of rValues) {
    if (r < -2) buckets['< -2R']++;
    else if (r < -1) buckets['-2R']++;
    else if (r < -0.5) buckets['-1R']++;
    else if (r < -0.1) buckets['-0.5R']++;
    else if (r <= 0.1) buckets['BE']++;
    else if (r < 1) buckets['+0.5R']++;
    else if (r < 2) buckets['+1R']++;
    else if (r < 3) buckets['+2R']++;
    else if (r < 4) buckets['+3R']++;
    else buckets['> 3R']++;
  }

  const max = Math.max(1, ...Object.values(buckets));

  return (
    <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" /> R Distribution</h3>
      <div className="flex items-end gap-1 h-32">
        {labels.map(label => {
          const count = buckets[label];
          const pct = (count / max) * 100;
          const isNeg = label.startsWith('-') || label.startsWith('< -');
          const isPos = label.startsWith('+') || label.startsWith('> ');
          const color = isNeg ? 'bg-red-500/60' : isPos ? 'bg-emerald-500/60' : 'bg-gray-600/60';
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 group relative">
              {count > 0 && (
                <span className="text-[10px] text-gray-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
              )}
              <div className={`w-full rounded-t ${color} transition-all duration-500`} style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }} />
              <span className="text-[9px] text-gray-600 whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STAT BOX ────────────────────────────────────────────────────────────────

function StatBox({ label, value, color = 'text-white', sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── MAIN ANALYTICS PAGE ─────────────────────────────────────────────────────

export default function Analytics() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [account, setAccount] = useState<PropAccount | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (uid: string) => {
    const [a, t] = await Promise.all([
      supabase.from('prop_accounts').select('*').eq('id', accountId).eq('user_id', uid).single(),
      supabase.from('prop_trades').select('*').eq('account_id', accountId).eq('user_id', uid).eq('status', 'closed').order('closed_at', { ascending: true }),
    ]);
    if (a.data) setAccount(a.data);
    if (t.data) setTrades(t.data);
  }, [accountId]);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      await loadData(u.id);
      setLoading(false);
    })();
  }, [router, loadData]);

  const stats = useMemo(() => {
    if (!account || trades.length === 0) return null;

    const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
    const totalR = trades.reduce((s, t) => s + (t.r_result || 0), 0);
    const wins = trades.filter(t => (t.pnl || 0) > 0);
    const losses = trades.filter(t => (t.pnl || 0) <= 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length * 100) : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length : 0;
    const avgR = trades.length > 0 ? totalR / trades.length : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? (avgWin * wins.length) / Math.abs(avgLoss * losses.length) : wins.length > 0 ? Infinity : 0;

    // By date
    const byDate: Record<string, number> = {};
    for (const t of trades) {
      const d = t.closed_at ? t.closed_at.split('T')[0] : t.opened_at.split('T')[0];
      byDate[d] = (byDate[d] || 0) + (t.pnl || 0);
    }
    const sortedDates = Object.keys(byDate).sort();
    const tradingDays = sortedDates.length;
    const winDays = sortedDates.filter(d => byDate[d] > 0).length;
    const bestDay = sortedDates.length > 0 ? Math.max(...Object.values(byDate)) : 0;
    const worstDay = sortedDates.length > 0 ? Math.min(...Object.values(byDate)) : 0;

    // Equity curve
    let cumPnl = 0;
    const eqCurve = sortedDates.map(d => {
      cumPnl += byDate[d];
      return { date: d, cumPnl };
    });

    // Max drawdown from equity curve
    let peak = 0, maxDD = 0;
    for (const pt of eqCurve) {
      if (pt.cumPnl > peak) peak = pt.cumPnl;
      const dd = peak - pt.cumPnl;
      if (dd > maxDD) maxDD = dd;
    }

    // Win/Loss streaks
    let maxWinStreak = 0, maxLossStreak = 0, curWin = 0, curLoss = 0;
    for (const t of trades) {
      if ((t.pnl || 0) > 0) { curWin++; curLoss = 0; maxWinStreak = Math.max(maxWinStreak, curWin); }
      else { curLoss++; curWin = 0; maxLossStreak = Math.max(maxLossStreak, curLoss); }
    }

    // By symbol
    const bySymbol: Record<string, { pnl: number; count: number; wins: number }> = {};
    for (const t of trades) {
      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { pnl: 0, count: 0, wins: 0 };
      bySymbol[t.symbol].pnl += t.pnl || 0;
      bySymbol[t.symbol].count++;
      if ((t.pnl || 0) > 0) bySymbol[t.symbol].wins++;
    }
    const symbolStats = Object.entries(bySymbol).sort((a, b) => b[1].count - a[1].count).slice(0, 8);

    // By direction
    const longs = trades.filter(t => t.direction === 'long');
    const shorts = trades.filter(t => t.direction === 'short');
    const longPnl = longs.reduce((s, t) => s + (t.pnl || 0), 0);
    const shortPnl = shorts.reduce((s, t) => s + (t.pnl || 0), 0);

    return {
      totalPnl, totalR, wins: wins.length, losses: losses.length, winRate, avgWin, avgLoss, avgR, profitFactor,
      tradingDays, winDays, bestDay, worstDay, eqCurve, maxDD, byDate,
      maxWinStreak, maxLossStreak,
      symbolStats, longs: longs.length, shorts: shorts.length, longPnl, shortPnl,
    };
  }, [account, trades]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;
  if (!account) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-500">Account not found</div>;

  const pColor = account.phase === 'Funded' ? 'bg-emerald-500/10 text-emerald-400' : account.phase === 'Phase 2' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/prop/${account.id}`} className="text-gray-500 hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{account.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pColor}`}>{account.phase}</span>
              </div>
              <p className="text-xs text-gray-500">Analytics & Performance</p>
            </div>
          </div>
          <Link href={`/prop/${account.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm transition-all">
            <Activity className="w-4 h-4" /> Trade Desk
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!stats ? (
          <div className="flex flex-col items-center justify-center py-32">
            <BarChart3 className="w-12 h-12 text-gray-700 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-400">No Trade Data Yet</h2>
            <p className="text-gray-600 text-sm mb-6">Close some trades on the Trade Desk to see analytics here.</p>
            <Link href={`/prop/${account.id}`} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium">
              Go to Trade Desk
            </Link>
          </div>
        ) : (
          <>
            {/* ── TOP STATS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <StatBox label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}${account.currency} ${fmt(stats.totalPnl)}`} color={stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} sub={`${stats.totalR >= 0 ? '+' : ''}${fmt(stats.totalR)}R total`} />
              <StatBox label="Win Rate" value={`${fmt(stats.winRate, 0)}%`} color={stats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'} sub={`${stats.wins}W ${stats.losses}L`} />
              <StatBox label="Profit Factor" value={stats.profitFactor === Infinity ? '∞' : fmt(stats.profitFactor)} color={stats.profitFactor >= 1.5 ? 'text-emerald-400' : stats.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'} />
              <StatBox label="Avg R" value={`${stats.avgR >= 0 ? '+' : ''}${fmt(stats.avgR)}`} color={stats.avgR >= 0 ? 'text-emerald-400' : 'text-red-400'} sub={`${trades.length} trades`} />
              <StatBox label="Max Drawdown" value={`${account.currency} ${fmt(stats.maxDD)}`} color={stats.maxDD > account.balance * account.max_dd_pct / 100 * 0.5 ? 'text-red-400' : 'text-gray-300'} sub={`${fmt(stats.maxDD / account.balance * 100, 1)}% of balance`} />
              <StatBox label="Trading Days" value={`${stats.tradingDays}`} color="text-sky-400" sub={`${stats.winDays} green / ${stats.tradingDays - stats.winDays} red`} />
            </div>

            {/* ── EQUITY CURVE ────────────────────────────────────────────── */}
            <div className="mb-6">
              <EquityCurve data={stats.eqCurve} currency={account.currency} />
            </div>

            {/* ── CALENDAR + R DISTRIBUTION ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <CalendarHeatmap dayData={stats.byDate} currency={account.currency} />
              <RDistribution trades={trades} />
            </div>

            {/* ── DETAILED STATS ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Win/Loss */}
              <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400" /> Win / Loss</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Avg Win</span><span className="text-emerald-400 tabular-nums">+{account.currency} {fmt(stats.avgWin)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Avg Loss</span><span className="text-red-400 tabular-nums">{account.currency} {fmt(stats.avgLoss)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Best Day</span><span className="text-emerald-400 tabular-nums">+{account.currency} {fmt(stats.bestDay)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Worst Day</span><span className="text-red-400 tabular-nums">{account.currency} {fmt(stats.worstDay)}</span></div>
                  <div className="border-t border-gray-800/30 pt-3 flex justify-between text-sm">
                    <span className="text-gray-400">Max Win Streak</span>
                    <span className="text-emerald-400 flex items-center gap-1"><Zap className="w-3 h-3" />{stats.maxWinStreak}</span>
                  </div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Max Loss Streak</span><span className="text-red-400">{stats.maxLossStreak}</span></div>
                </div>
              </div>

              {/* Direction */}
              <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-sky-400" /> By Direction</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-emerald-400">▲ Long ({stats.longs})</span>
                      <span className={`tabular-nums ${stats.longPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.longPnl >= 0 ? '+' : ''}{account.currency} {fmt(stats.longPnl)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${trades.length > 0 ? (stats.longs / trades.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-red-400">▼ Short ({stats.shorts})</span>
                      <span className={`tabular-nums ${stats.shortPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.shortPnl >= 0 ? '+' : ''}{account.currency} {fmt(stats.shortPnl)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${trades.length > 0 ? (stats.shorts / trades.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* By Symbol */}
              <div className="bg-[#12121a] border border-gray-800/30 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-amber-400" /> By Symbol</h3>
                {stats.symbolStats.length === 0 ? (
                  <p className="text-gray-600 text-sm">No data</p>
                ) : (
                  <div className="space-y-2">
                    {stats.symbolStats.map(([sym, data]) => (
                      <div key={sym} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 font-medium">{sym}</span>
                          <span className="text-[10px] text-gray-600">{data.count}t · {data.count > 0 ? fmt(data.wins / data.count * 100, 0) : 0}%</span>
                        </div>
                        <span className={`tabular-nums font-medium ${data.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {data.pnl >= 0 ? '+' : ''}{fmt(data.pnl)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
