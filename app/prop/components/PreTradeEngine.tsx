'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield, Target, AlertTriangle, TrendingUp, TrendingDown, Zap,
  Crosshair, BarChart3, AlertCircle, CheckCircle2, XCircle, MinusCircle,
  ChevronDown, ChevronUp, Activity
} from 'lucide-react';

// ── TYPES ────────────────────────────────────────────────────────────────────

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

interface PreTradeInput {
  symbol: string;
  direction: 'long' | 'short';
  entry_price: string;
  stop_price: string;
  tp1_price: string;
  tp2_price: string;
  tp3_price: string;
  notes: string;
}

type Verdict = 'GO' | 'CAUTION' | 'STOP';

interface RuleCheck {
  rule: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

interface PreTradeResult {
  // Trade metrics
  pipDistance: number;
  lotSize: number;
  riskDollars: number;
  riskPct: number;
  // R:R targets
  tp1R: number | null;
  tp2R: number | null;
  tp3R: number | null;
  tp1Pnl: number | null;
  tp2Pnl: number | null;
  tp3Pnl: number | null;
  // DD Impact
  ddAfterLoss: number;
  ddAfterLossPct: number;
  maxDdAfterLoss: number;
  maxDdAfterLossPct: number;
  budgetAfterLoss: number;
  survivalAfterLoss: number;
  // Current state
  currentDdUsed: number;
  currentDdPct: number;
  dailyDdLimit: number;
  maxDdLimit: number;
  budgetLeft: number;
  survivalCount: number;
  tradesLeftToday: number;
  // Rule checks
  rules: RuleCheck[];
  // Verdict
  verdict: Verdict;
  verdictReason: string;
  // Stop validation
  stopValid: boolean;
}

// ── COMMON SYMBOLS ──────────────────────────────────────────────────────────

const POPULAR_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD', 'US30', 'NAS100',
];

// ── HELPER ──────────────────────────────────────────────────────────────────

const fmt = (n: number, d = 2) => n.toFixed(d);

// ── VERDICT BADGE ───────────────────────────────────────────────────────────

function VerdictBadge({ verdict, reason }: { verdict: Verdict; reason: string }) {
  const config = {
    GO: { bg: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: CheckCircle2, label: 'GO', glow: 'shadow-emerald-500/20' },
    CAUTION: { bg: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/40', text: 'text-amber-400', icon: MinusCircle, label: 'CAUTION', glow: 'shadow-amber-500/20' },
    STOP: { bg: 'from-red-600/20 to-red-900/10', border: 'border-red-500/40', text: 'text-red-400', icon: XCircle, label: 'STOP', glow: 'shadow-red-500/20' },
  }[verdict];
  const Icon = config.icon;

  return (
    <div className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-2xl p-6 shadow-xl ${config.glow} transition-all duration-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${config.text} bg-black/30`}>
            <Icon className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <div className={`text-3xl font-black tracking-wider ${config.text}`}>{config.label}</div>
            <div className="text-sm text-gray-400 mt-0.5 max-w-md">{reason}</div>
          </div>
        </div>
        <div className={`text-6xl font-black ${config.text} opacity-10 select-none`}>{verdict === 'GO' ? '✓' : verdict === 'CAUTION' ? '!' : '✕'}</div>
      </div>
    </div>
  );
}

// ── RULE CHECK ROW ──────────────────────────────────────────────────────────

function RuleRow({ rule }: { rule: RuleCheck }) {
  const icon = rule.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
               rule.status === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
               <XCircle className="w-4 h-4 text-red-500" />;
  const bg = rule.status === 'fail' ? 'bg-red-500/5' : rule.status === 'warn' ? 'bg-amber-500/5' : '';
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${bg} transition-colors`}>
      {icon}
      <span className="text-sm text-gray-300 flex-1">{rule.rule}</span>
      <span className={`text-xs font-medium ${rule.status === 'pass' ? 'text-emerald-400' : rule.status === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>
        {rule.message}
      </span>
    </div>
  );
}

// ── IMPACT GAUGE ────────────────────────────────────────────────────────────

function ImpactGauge({ label, before, after, max, unit, invert }: {
  label: string; before: number; after: number; max: number; unit?: string; invert?: boolean;
}) {
  const beforePct = Math.min((before / max) * 100, 100);
  const afterPct = Math.min((after / max) * 100, 100);
  const delta = after - before;
  const dangerZone = invert ? afterPct <= 20 : afterPct >= 80;
  const warnZone = invert ? afterPct <= 40 : afterPct >= 60;
  const barColor = dangerZone ? 'bg-red-500' : warnZone ? 'bg-amber-500' : 'bg-sky-500';
  const deltaColor = dangerZone ? 'text-red-400' : warnZone ? 'text-amber-400' : 'text-gray-400';

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 tabular-nums">{fmt(before, 1)}{unit}</span>
          <span className="text-gray-700">→</span>
          <span className={`text-sm font-bold tabular-nums ${dangerZone ? 'text-red-400' : warnZone ? 'text-amber-400' : 'text-white'}`}>
            {fmt(after, 1)}{unit}
          </span>
          <span className={`text-xs tabular-nums ${deltaColor}`}>
            ({delta >= 0 ? '+' : ''}{fmt(delta, 1)}{unit})
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-800/80 rounded-full overflow-hidden relative">
        {/* Before marker */}
        <div className="absolute h-full w-0.5 bg-gray-500 z-10" style={{ left: `${beforePct}%` }} />
        {/* After bar */}
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${afterPct}%` }} />
        {/* Danger zone indicator */}
        {!invert && <div className="absolute right-0 top-0 h-full w-[20%] bg-red-500/10 rounded-r-full" />}
      </div>
    </div>
  );
}

// ── R:R TARGET ROW ──────────────────────────────────────────────────────────

function TargetRow({ label, rr, pnl, price, currency, active }: {
  label: string; rr: number | null; pnl: number | null; price: string; currency: string; active: boolean;
}) {
  if (rr === null) return null;
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${active ? 'bg-emerald-500/5' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>{label}</span>
        <span className="text-sm text-gray-400 tabular-nums">{price}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-bold tabular-nums ${rr >= 2 ? 'text-emerald-400' : rr >= 1 ? 'text-sky-400' : 'text-gray-400'}`}>
          {fmt(rr)}R
        </span>
        {pnl !== null && (
          <span className="text-sm text-emerald-400/70 tabular-nums">+{currency} {fmt(pnl)}</span>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PreTradeEngine({
  account,
  trades,
  onExecute,
  onClose,
}: {
  account: PropAccount;
  trades: Trade[];
  onExecute: (data: { symbol: string; direction: string; entry_price: number; stop_price: number; lot_size: number; risk_dollars: number; risk_pct: number; notes: string }) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState<PreTradeInput>({
    symbol: 'EURUSD',
    direction: 'long',
    entry_price: '',
    stop_price: '',
    tp1_price: '',
    tp2_price: '',
    tp3_price: '',
    notes: '',
  });
  const [showTargets, setShowTargets] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const upd = (k: keyof PreTradeInput, v: string) => setInput(prev => ({ ...prev, [k]: v }));

  // ── COMPUTE EVERYTHING ──────────────────────────────────────────────────

  const result = useMemo((): PreTradeResult | null => {
    const entry = parseFloat(input.entry_price);
    const stop = parseFloat(input.stop_price);
    if (!entry || !stop || entry === stop) return null;

    // Phase risk multiplier
    const phaseMult = account.phase === 'Phase 1' ? 1 : account.phase === 'Phase 2' ? 0.75 : 0.5;
    const effectiveRisk = account.risk_pct * phaseMult;
    const riskDollars = account.balance * effectiveRisk / 100;

    // Pip distance and lot size
    const dist = Math.abs(entry - stop);
    const pips = dist * 10000; // forex standard
    const lotSize = pips > 0 ? Math.round((riskDollars / (pips * 10)) * 100) / 100 : 0;

    // Stop validation
    const stopValid = input.direction === 'long' ? stop < entry : stop > entry;

    // Current session state
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => new Date(t.opened_at).toDateString() === today);
    const closedToday = todayTrades.filter(t => t.status === 'closed');
    const openTrades = trades.filter(t => t.status === 'open');
    const allClosed = trades.filter(t => t.status === 'closed');
    const sessionPnl = closedToday.reduce((s, t) => s + (t.pnl || 0), 0);
    const totalPnl = allClosed.reduce((s, t) => s + (t.pnl || 0), 0);

    const dailyDdLimit = account.balance * account.daily_dd_pct / 100;
    const maxDdLimit = account.balance * account.max_dd_pct / 100;
    const currentDdUsed = sessionPnl < 0 ? Math.abs(sessionPnl) : 0;
    const currentDdPct = dailyDdLimit > 0 ? (currentDdUsed / dailyDdLimit) * 100 : 0;
    const budgetLeft = Math.max(0, dailyDdLimit - currentDdUsed);
    const survivalCount = riskDollars > 0 ? Math.floor(budgetLeft / riskDollars) : 99;
    const tradesLeftToday = Math.max(0, account.max_trades_per_day - todayTrades.length);

    // DD Impact projection (if this trade hits stop)
    const ddAfterLoss = currentDdUsed + riskDollars;
    const ddAfterLossPct = dailyDdLimit > 0 ? (ddAfterLoss / dailyDdLimit) * 100 : 0;
    const totalPnlAfterLoss = totalPnl - riskDollars;
    const maxDdAfterLoss = totalPnlAfterLoss < 0 ? Math.abs(totalPnlAfterLoss) : 0;
    const maxDdAfterLossPct = maxDdLimit > 0 ? (maxDdAfterLoss / maxDdLimit) * 100 : 0;
    const budgetAfterLoss = Math.max(0, budgetLeft - riskDollars);
    const survivalAfterLoss = riskDollars > 0 ? Math.floor(budgetAfterLoss / riskDollars) : 99;

    // R:R Targets
    const tp1 = parseFloat(input.tp1_price);
    const tp2 = parseFloat(input.tp2_price);
    const tp3 = parseFloat(input.tp3_price);
    const calcR = (tp: number) => {
      if (!tp || !dist) return null;
      const move = input.direction === 'long' ? tp - entry : entry - tp;
      return move / dist;
    };
    const calcPnl = (r: number | null) => r !== null ? r * riskDollars : null;
    const tp1R = calcR(tp1);
    const tp2R = calcR(tp2);
    const tp3R = calcR(tp3);

    // ── RULE CHECKS ───────────────────────────────────────────────────────

    const rules: RuleCheck[] = [];

    // 1. Stop on correct side
    rules.push({
      rule: 'Stop placement',
      status: stopValid ? 'pass' : 'fail',
      message: stopValid ? 'Correct side' : `Stop is on wrong side for ${input.direction}`,
    });

    // 2. Trade count limit
    rules.push({
      rule: 'Daily trade limit',
      status: tradesLeftToday > 1 ? 'pass' : tradesLeftToday === 1 ? 'warn' : 'fail',
      message: tradesLeftToday > 0 ? `${tradesLeftToday} remaining` : 'Max trades reached',
    });

    // 3. Daily DD impact
    rules.push({
      rule: 'Daily drawdown impact',
      status: ddAfterLossPct < 60 ? 'pass' : ddAfterLossPct < 80 ? 'warn' : 'fail',
      message: `${fmt(ddAfterLossPct, 0)}% after loss (limit: ${account.daily_dd_pct}%)`,
    });

    // 4. Max DD impact
    rules.push({
      rule: 'Max drawdown impact',
      status: maxDdAfterLossPct < 60 ? 'pass' : maxDdAfterLossPct < 80 ? 'warn' : 'fail',
      message: `${fmt(maxDdAfterLossPct, 0)}% after loss (limit: ${account.max_dd_pct}%)`,
    });

    // 5. Budget check
    rules.push({
      rule: 'Budget coverage',
      status: riskDollars <= budgetLeft ? (budgetAfterLoss > riskDollars ? 'pass' : 'warn') : 'fail',
      message: riskDollars <= budgetLeft
        ? `${account.currency} ${fmt(budgetLeft)} available (${fmt(budgetAfterLoss)} after)`
        : `Risk ${account.currency} ${fmt(riskDollars)} exceeds budget ${account.currency} ${fmt(budgetLeft)}`,
    });

    // 6. Survival after this trade
    rules.push({
      rule: 'Survival capacity',
      status: survivalAfterLoss >= 3 ? 'pass' : survivalAfterLoss >= 1 ? 'warn' : 'fail',
      message: `${survivalAfterLoss} more losses possible after this trade`,
    });

    // 7. Existing open trades
    rules.push({
      rule: 'Open position check',
      status: openTrades.length === 0 ? 'pass' : openTrades.length < 2 ? 'warn' : 'fail',
      message: openTrades.length === 0 ? 'No open positions' : `${openTrades.length} already open`,
    });

    // 8. Consistency rule (if set)
    if (account.consistency_pct > 0) {
      const byDate: Record<string, number> = {};
      for (const t of allClosed) {
        const d = t.closed_at ? t.closed_at.split('T')[0] : t.opened_at.split('T')[0];
        byDate[d] = (byDate[d] || 0) + (t.pnl || 0);
      }
      const dayPnls = Object.values(byDate);
      if (dayPnls.length > 0) {
        const totalAbs = dayPnls.reduce((s, p) => s + Math.abs(p), 0);
        const maxDay = Math.max(...dayPnls.map(Math.abs));
        const consistencyRatio = totalAbs > 0 ? (maxDay / totalAbs) * 100 : 0;
        rules.push({
          rule: `Consistency rule (${account.consistency_pct}%)`,
          status: consistencyRatio < account.consistency_pct ? 'pass' : 'warn',
          message: `Best day is ${fmt(consistencyRatio, 0)}% of total P&L`,
        });
      }
    }

    // ── VERDICT ─────────────────────────────────────────────────────────────

    const fails = rules.filter(r => r.status === 'fail').length;
    const warns = rules.filter(r => r.status === 'warn').length;

    let verdict: Verdict;
    let verdictReason: string;

    if (!stopValid) {
      verdict = 'STOP';
      verdictReason = 'Stop loss is on the wrong side of entry price.';
    } else if (fails > 0) {
      verdict = 'STOP';
      const failRules = rules.filter(r => r.status === 'fail').map(r => r.rule).join(', ');
      verdictReason = `Rule violation: ${failRules}. Do not take this trade.`;
    } else if (warns >= 3) {
      verdict = 'STOP';
      verdictReason = `${warns} warnings triggered. Too much risk accumulation.`;
    } else if (warns > 0) {
      verdict = 'CAUTION';
      const warnRules = rules.filter(r => r.status === 'warn').map(r => r.rule).join(', ');
      verdictReason = `Proceed with awareness: ${warnRules}.`;
    } else {
      verdict = 'GO';
      verdictReason = 'All rules pass. Trade is within risk parameters.';
    }

    return {
      pipDistance: pips,
      lotSize,
      riskDollars,
      riskPct: effectiveRisk,
      tp1R, tp2R, tp3R,
      tp1Pnl: calcPnl(tp1R), tp2Pnl: calcPnl(tp2R), tp3Pnl: calcPnl(tp3R),
      ddAfterLoss, ddAfterLossPct, maxDdAfterLoss, maxDdAfterLossPct,
      budgetAfterLoss, survivalAfterLoss,
      currentDdUsed, currentDdPct, dailyDdLimit, maxDdLimit, budgetLeft, survivalCount, tradesLeftToday,
      rules, verdict, verdictReason, stopValid,
    };
  }, [input, account, trades]);

  const handleExecute = () => {
    if (!result || result.verdict === 'STOP') return;
    const entry = parseFloat(input.entry_price);
    const stop = parseFloat(input.stop_price);
    if (!entry || !stop) return;
    onExecute({
      symbol: input.symbol,
      direction: input.direction,
      entry_price: entry,
      stop_price: stop,
      lot_size: result.lotSize,
      risk_dollars: result.riskDollars,
      risk_pct: result.riskPct,
      notes: input.notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Pre-Trade Analysis</h2>
            <p className="text-xs text-gray-500 mt-0.5">{account.name} · {account.phase} · {account.currency} {account.balance.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50">
            Cancel
          </button>
        </div>

        {/* ── INPUT SECTION ───────────────────────────────────────────────── */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-6 mb-4">
          {/* Symbol + Direction */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Symbol</label>
              <div className="relative">
                <input type="text" value={input.symbol} onChange={e => upd('symbol', e.target.value.toUpperCase())}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white font-medium focus:border-sky-500 focus:outline-none transition-colors" />
              </div>
              {/* Quick symbols */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'].map(s => (
                  <button key={s} onClick={() => upd('symbol', s)}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${input.symbol === s ? 'bg-sky-500/20 text-sky-400' : 'bg-gray-800/50 text-gray-600 hover:text-gray-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {(['long', 'short'] as const).map(d => (
                  <button key={d} onClick={() => upd('direction', d)}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      input.direction === d
                        ? d === 'long' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}>
                    {d === 'long' ? <><TrendingUp className="w-4 h-4" />LONG</> : <><TrendingDown className="w-4 h-4" />SHORT</>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entry + Stop */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Entry Price</label>
              <input type="number" step="any" placeholder="1.15325" value={input.entry_price}
                onChange={e => upd('entry_price', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Stop Loss</label>
              <input type="number" step="any" placeholder="1.15225" value={input.stop_price}
                onChange={e => upd('stop_price', e.target.value)}
                className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-white tabular-nums focus:outline-none transition-colors ${
                  result && !result.stopValid ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-sky-500'
                }`} />
            </div>
          </div>

          {/* TP Targets (collapsible) */}
          <button onClick={() => setShowTargets(!showTargets)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2">
            <Target className="w-3 h-3" />
            Take Profit Targets (optional)
            {showTargets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showTargets && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[['TP1', 'tp1_price'], ['TP2', 'tp2_price'], ['TP3', 'tp3_price']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-[10px] text-gray-600 mb-1">{label}</label>
                  <input type="number" step="any" placeholder="Price" value={input[key as keyof PreTradeInput]}
                    onChange={e => upd(key as keyof PreTradeInput, e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm tabular-nums focus:border-emerald-500 focus:outline-none" />
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Setup Notes</label>
            <input type="text" placeholder="Why are you taking this trade?" value={input.notes}
              onChange={e => upd('notes', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-sky-500 focus:outline-none" />
          </div>
        </div>

        {/* ── ANALYSIS OUTPUT ─────────────────────────────────────────────── */}
        {result && (
          <>
            {/* VERDICT */}
            <div className="mb-4">
              <VerdictBadge verdict={result.verdict} reason={result.verdictReason} />
            </div>

            {/* TRADE METRICS */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-sky-400" /> Trade Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Pips</div>
                  <div className="text-xl font-bold text-white tabular-nums">{fmt(result.pipDistance, 1)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Lot Size</div>
                  <div className="text-xl font-bold text-white tabular-nums">{fmt(result.lotSize)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Risk</div>
                  <div className="text-xl font-bold text-red-400 tabular-nums">{account.currency} {fmt(result.riskDollars)}</div>
                  <div className="text-[10px] text-gray-600">{fmt(result.riskPct, 1)}% of balance</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Trades Left</div>
                  <div className={`text-xl font-bold tabular-nums ${result.tradesLeftToday <= 1 ? 'text-amber-400' : 'text-white'}`}>{result.tradesLeftToday}</div>
                  <div className="text-[10px] text-gray-600">of {account.max_trades_per_day} today</div>
                </div>
              </div>
            </div>

            {/* R:R TARGETS */}
            {(result.tp1R !== null || result.tp2R !== null || result.tp3R !== null) && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Reward Targets
                </h3>
                <div className="space-y-1">
                  <TargetRow label="TP1" rr={result.tp1R} pnl={result.tp1Pnl} price={input.tp1_price} currency={account.currency} active={!!result.tp1R && result.tp1R >= 1} />
                  <TargetRow label="TP2" rr={result.tp2R} pnl={result.tp2Pnl} price={input.tp2_price} currency={account.currency} active={!!result.tp2R && result.tp2R >= 2} />
                  <TargetRow label="TP3" rr={result.tp3R} pnl={result.tp3Pnl} price={input.tp3_price} currency={account.currency} active={!!result.tp3R && result.tp3R >= 3} />
                </div>
              </div>
            )}

            {/* DD IMPACT PROJECTION */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Impact If Stop Hit
              </h3>
              <div className="space-y-4">
                <ImpactGauge label="Daily Drawdown" before={result.currentDdPct} after={result.ddAfterLossPct} max={100} unit="%" />
                <ImpactGauge label="Max Drawdown" before={result.maxDdLimit > 0 ? ((result.currentDdUsed > 0 ? result.currentDdUsed : 0) / result.maxDdLimit) * 100 : 0} after={result.maxDdAfterLossPct} max={100} unit="%" />
                <ImpactGauge label="Budget Remaining" before={result.budgetLeft} after={result.budgetAfterLoss} max={result.dailyDdLimit} unit={` ${account.currency}`} invert />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-gray-500 uppercase">Survival Now</div>
                    <div className={`text-lg font-bold tabular-nums ${result.survivalCount <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>{result.survivalCount} losses</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-gray-500 uppercase">Survival After</div>
                    <div className={`text-lg font-bold tabular-nums ${result.survivalAfterLoss <= 1 ? 'text-red-400' : result.survivalAfterLoss <= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>{result.survivalAfterLoss} losses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RULE CHECKS */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <button onClick={() => setShowRules(!showRules)}
                className="w-full flex items-center justify-between">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-400" /> Rule Check
                  <span className="text-emerald-400">{result.rules.filter(r => r.status === 'pass').length}✓</span>
                  {result.rules.filter(r => r.status === 'warn').length > 0 && <span className="text-amber-400">{result.rules.filter(r => r.status === 'warn').length}!</span>}
                  {result.rules.filter(r => r.status === 'fail').length > 0 && <span className="text-red-400">{result.rules.filter(r => r.status === 'fail').length}✕</span>}
                </h3>
                {showRules ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </button>
              {showRules && (
                <div className="mt-3 space-y-1">
                  {result.rules.map((r, i) => <RuleRow key={i} rule={r} />)}
                </div>
              )}
            </div>

            {/* EXECUTE BUTTON */}
            <div className="flex items-center justify-between gap-4">
              <button onClick={onClose} className="px-5 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={result.verdict === 'STOP'}
                className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  result.verdict === 'STOP'
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : result.verdict === 'CAUTION'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                }`}>
                {result.verdict === 'STOP' ? (
                  <><XCircle className="w-5 h-5" /> Trade Blocked</>
                ) : result.verdict === 'CAUTION' ? (
                  <><AlertTriangle className="w-5 h-5" /> Execute with Caution</>
                ) : (
                  <><Zap className="w-5 h-5" /> Execute Trade</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
