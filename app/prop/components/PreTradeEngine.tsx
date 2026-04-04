'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield, Target, AlertTriangle, TrendingUp, TrendingDown,
  Crosshair, AlertCircle, CheckCircle2, XCircle, MinusCircle,
  ChevronDown, ChevronUp, Calculator
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
  id: string; pnl: number | null; r_result: number | null; status: string;
  opened_at: string; closed_at: string | null; direction: string; symbol: string;
  entry_price: number; stop_price: number;
}

type Verdict = 'GO' | 'CAUTION' | 'STOP';
interface RuleCheck { rule: string; status: 'pass' | 'warn' | 'fail'; message: string; }

const fmt = (n: number, d = 2) => n.toFixed(d);

// ── INSTRUMENT DETECTION ────────────────────────────────────────────────────

function getInstrumentInfo(sym: string, entry: number) {
  const s = sym.toUpperCase();
  const jpyPairs = ['USDJPY','EURJPY','GBPJPY','AUDJPY','CADJPY','NZDJPY','CHFJPY'];

  if (jpyPairs.includes(s))
    return { type: 'forex_jpy', pipSize: 0.01, pipValue: 1000 / entry, label: 'Pips', lotLabel: 'std lots' };
  if (s === 'XAUUSD' || s === 'GOLD')
    return { type: 'gold', pipSize: 0.1, pipValue: 10, label: 'Pips', lotLabel: '× 100 oz' };
  if (s === 'XAGUSD' || s === 'SILVER')
    return { type: 'silver', pipSize: 0.01, pipValue: 50, label: 'Pips', lotLabel: '× 5000 oz' };
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('XRP') || s.includes('ADA'))
    return { type: 'crypto', pipSize: 1, pipValue: 1, label: 'Points', lotLabel: 'units' };
  if (['US30','NAS100','SPX500','US500','DE40','UK100','JP225','USTEC','DJ30'].includes(s))
    return { type: 'index', pipSize: 1, pipValue: 1, label: 'Points', lotLabel: 'contracts' };
  if (['USOIL','UKOIL','WTI','BRENT','XTIUSD','XBRUSD'].includes(s))
    return { type: 'oil', pipSize: 0.01, pipValue: 10, label: 'Pips', lotLabel: '× 1000 bbl' };
  return { type: 'forex', pipSize: 0.0001, pipValue: 10, label: 'Pips', lotLabel: 'std lots' };
}

// ── VERDICT BADGE ───────────────────────────────────────────────────────────

function VerdictBadge({ verdict, reason }: { verdict: Verdict; reason: string }) {
  const cfg = {
    GO:      { bg: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: CheckCircle2, glow: 'shadow-emerald-500/20' },
    CAUTION: { bg: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/40', text: 'text-amber-400', icon: MinusCircle, glow: 'shadow-amber-500/20' },
    STOP:    { bg: 'from-red-600/20 to-red-900/10', border: 'border-red-500/40', text: 'text-red-400', icon: XCircle, glow: 'shadow-red-500/20' },
  }[verdict];
  const Icon = cfg.icon;
  return (
    <div className={`bg-gradient-to-r ${cfg.bg} border ${cfg.border} rounded-2xl p-5 shadow-xl ${cfg.glow}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cfg.text} bg-black/30`}>
          <Icon className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <div>
          <div className={`text-2xl font-black tracking-wider ${cfg.text}`}>{verdict}</div>
          <div className="text-sm text-gray-400 mt-0.5">{reason}</div>
        </div>
      </div>
    </div>
  );
}

// ── RULE ROW ────────────────────────────────────────────────────────────────

function RuleRow({ rule }: { rule: RuleCheck }) {
  const icon = rule.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
               rule.status === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
               <XCircle className="w-4 h-4 text-red-500" />;
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${rule.status === 'fail' ? 'bg-red-500/5' : rule.status === 'warn' ? 'bg-amber-500/5' : ''}`}>
      {icon}
      <span className="text-sm text-gray-300 flex-1">{rule.rule}</span>
      <span className={`text-xs font-medium ${rule.status === 'pass' ? 'text-emerald-400' : rule.status === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>{rule.message}</span>
    </div>
  );
}

// ── IMPACT GAUGE ────────────────────────────────────────────────────────────

function ImpactGauge({ label, before, after, max, unit, invert }: {
  label: string; before: number; after: number; max: number; unit?: string; invert?: boolean;
}) {
  const afterPct = Math.min((after / Math.max(max, 0.01)) * 100, 100);
  const delta = after - before;
  const danger = invert ? afterPct <= 20 : afterPct >= 80;
  const warn = invert ? afterPct <= 40 : afterPct >= 60;
  const bar = danger ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-sky-500';
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 tabular-nums">{fmt(before, 1)}{unit}</span>
          <span className="text-gray-700">→</span>
          <span className={`text-sm font-bold tabular-nums ${danger ? 'text-red-400' : warn ? 'text-amber-400' : 'text-white'}`}>{fmt(after, 1)}{unit}</span>
          <span className={`text-xs tabular-nums ${danger ? 'text-red-400' : warn ? 'text-amber-400' : 'text-gray-500'}`}>({delta >= 0 ? '+' : ''}{fmt(delta, 1)}{unit})</span>
        </div>
      </div>
      <div className="h-2 bg-gray-800/80 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${afterPct}%` }} />
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PreTradeCalculator({
  account, trades, onClose, onSendToLog,
}: {
  account: PropAccount; trades: Trade[]; onClose: () => void;
  onSendToLog?: (data: { symbol: string; direction: string; entry: string; stop: string; lots: string; risk: string }) => void;
}) {
  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryStr, setEntryStr] = useState('');
  const [stopStr, setStopStr] = useState('');
  const [tp1Str, setTp1Str] = useState('');
  const [tp2Str, setTp2Str] = useState('');
  const [tp3Str, setTp3Str] = useState('');
  const [showTargets, setShowTargets] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const result = useMemo(() => {
    const entry = parseFloat(entryStr);
    const stop = parseFloat(stopStr);
    if (!entry || !stop || entry === stop) return null;

    const effectiveRisk = account.risk_pct;
    const riskDollars = account.balance * effectiveRisk / 100;
    const inst = getInstrumentInfo(symbol, entry);
    const dist = Math.abs(entry - stop);
    const pips = dist / inst.pipSize;
    const riskPerLot = pips * inst.pipValue;
    const lotSize = riskPerLot > 0 ? Math.round((riskDollars / riskPerLot) * (inst.type === 'crypto' ? 10000 : 100)) / (inst.type === 'crypto' ? 10000 : 100) : 0;
    const stopValid = direction === 'long' ? stop < entry : stop > entry;

    // Session state
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
    const tradesLeft = Math.max(0, account.max_trades_per_day - todayTrades.length);

    // DD impact projection
    const ddAfterLoss = currentDdUsed + riskDollars;
    const ddAfterLossPct = dailyDdLimit > 0 ? (ddAfterLoss / dailyDdLimit) * 100 : 0;
    const totalAfterLoss = totalPnl - riskDollars;
    const maxDdAfterLoss = totalAfterLoss < 0 ? Math.abs(totalAfterLoss) : 0;
    const maxDdAfterLossPct = maxDdLimit > 0 ? (maxDdAfterLoss / maxDdLimit) * 100 : 0;
    const budgetAfterLoss = Math.max(0, budgetLeft - riskDollars);
    const survivalAfterLoss = riskDollars > 0 ? Math.floor(budgetAfterLoss / riskDollars) : 99;

    // R:R targets
    const calcR = (tpStr: string) => {
      const tp = parseFloat(tpStr);
      if (!tp || !dist) return null;
      const move = direction === 'long' ? tp - entry : entry - tp;
      return move / dist;
    };
    const tp1R = calcR(tp1Str), tp2R = calcR(tp2Str), tp3R = calcR(tp3Str);
    const calcPnl = (r: number | null) => r !== null ? r * riskDollars : null;

    // Rule checks
    const rules: RuleCheck[] = [];
    rules.push({ rule: 'Stop placement', status: stopValid ? 'pass' : 'fail', message: stopValid ? 'Correct side' : `Wrong side for ${direction}` });
    rules.push({ rule: 'Daily trade limit', status: tradesLeft > 1 ? 'pass' : tradesLeft === 1 ? 'warn' : 'fail', message: tradesLeft > 0 ? `${tradesLeft} remaining` : 'Max reached' });
    rules.push({ rule: 'Daily DD impact', status: ddAfterLossPct < 60 ? 'pass' : ddAfterLossPct < 80 ? 'warn' : 'fail', message: `${fmt(ddAfterLossPct, 0)}% after loss (limit ${account.daily_dd_pct}%)` });
    rules.push({ rule: 'Max DD impact', status: maxDdAfterLossPct < 60 ? 'pass' : maxDdAfterLossPct < 80 ? 'warn' : 'fail', message: `${fmt(maxDdAfterLossPct, 0)}% after loss (limit ${account.max_dd_pct}%)` });
    rules.push({ rule: 'Budget coverage', status: riskDollars <= budgetLeft ? (budgetAfterLoss > riskDollars ? 'pass' : 'warn') : 'fail', message: riskDollars <= budgetLeft ? `${account.currency} ${fmt(budgetAfterLoss)} after` : 'Exceeds budget' });
    rules.push({ rule: 'Survival capacity', status: survivalAfterLoss >= 3 ? 'pass' : survivalAfterLoss >= 1 ? 'warn' : 'fail', message: `${survivalAfterLoss} losses possible after` });
    rules.push({ rule: 'Open positions', status: openTrades.length === 0 ? 'pass' : openTrades.length < 2 ? 'warn' : 'fail', message: openTrades.length === 0 ? 'None' : `${openTrades.length} open` });

    const fails = rules.filter(r => r.status === 'fail').length;
    const warns = rules.filter(r => r.status === 'warn').length;
    let verdict: Verdict, verdictReason: string;
    if (!stopValid) { verdict = 'STOP'; verdictReason = 'Stop is on the wrong side.'; }
    else if (fails > 0) { verdict = 'STOP'; verdictReason = `Rule violation: ${rules.filter(r => r.status === 'fail').map(r => r.rule).join(', ')}.`; }
    else if (warns >= 3) { verdict = 'STOP'; verdictReason = `${warns} warnings. Too much risk.`; }
    else if (warns > 0) { verdict = 'CAUTION'; verdictReason = `Caution: ${rules.filter(r => r.status === 'warn').map(r => r.rule).join(', ')}.`; }
    else { verdict = 'GO'; verdictReason = 'All rules pass. Trade is within risk parameters.'; }

    return {
      pips, lotSize, riskDollars, riskPct: effectiveRisk, inst,
      tp1R, tp2R, tp3R, tp1Pnl: calcPnl(tp1R), tp2Pnl: calcPnl(tp2R), tp3Pnl: calcPnl(tp3R),
      ddAfterLossPct, maxDdAfterLossPct, currentDdPct, budgetLeft, budgetAfterLoss,
      dailyDdLimit, maxDdLimit, currentDdUsed, survivalCount, survivalAfterLoss, tradesLeft,
      rules, verdict, verdictReason, stopValid,
    };
  }, [symbol, direction, entryStr, stopStr, tp1Str, tp2Str, tp3Str, account, trades]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Pre-Trade Calculator</h2>
              <p className="text-xs text-gray-500">{account.name} · {account.phase} · {account.currency} {account.balance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50">Close</button>
        </div>

        {/* Input */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Symbol</label>
              <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white font-medium focus:border-sky-500 focus:outline-none" />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['EURUSD','GBPUSD','XAUUSD','BTCUSD','US30'].map(s => (
                  <button key={s} onClick={() => setSymbol(s)}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${symbol === s ? 'bg-sky-500/20 text-sky-400' : 'bg-gray-800/50 text-gray-600 hover:text-gray-400'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {(['long','short'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      direction === d ? d === 'long' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}>{d === 'long' ? <><TrendingUp className="w-4 h-4" />LONG</> : <><TrendingDown className="w-4 h-4" />SHORT</>}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Entry Price</label>
              <input type="number" step="any" placeholder="1.15325" value={entryStr} onChange={e => setEntryStr(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Stop Loss</label>
              <input type="number" step="any" placeholder="1.15225" value={stopStr} onChange={e => setStopStr(e.target.value)}
                className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-white tabular-nums focus:outline-none ${result && !result.stopValid ? 'border-red-500/50' : 'border-gray-700 focus:border-sky-500'}`} />
            </div>
          </div>
          <button onClick={() => setShowTargets(!showTargets)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-2">
            <Target className="w-3 h-3" /> Take Profit Targets (optional) {showTargets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showTargets && (
            <div className="grid grid-cols-3 gap-3">
              {[['TP1', tp1Str, setTp1Str], ['TP2', tp2Str, setTp2Str], ['TP3', tp3Str, setTp3Str]].map(([label, val, setter]) => (
                <div key={label as string}>
                  <label className="block text-[10px] text-gray-600 mb-1">{label as string}</label>
                  <input type="number" step="any" placeholder="Price" value={val as string} onChange={e => (setter as any)(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm tabular-nums focus:border-emerald-500 focus:outline-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Output */}
        {result && (
          <>
            <div className="mb-4"><VerdictBadge verdict={result.verdict} reason={result.verdictReason} /></div>

            {/* Trade Metrics */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Crosshair className="w-3.5 h-3.5 text-sky-400" /> Trade Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">{result.inst.label}</div>
                  <div className="text-xl font-bold text-white tabular-nums">{fmt(result.pips, 1)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Lot Size</div>
                  <div className="text-xl font-bold text-white tabular-nums">{result.inst.type === 'crypto' ? fmt(result.lotSize, 4) : fmt(result.lotSize)}</div>
                  <div className="text-[10px] text-gray-600">{result.inst.lotLabel}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Risk</div>
                  <div className="text-xl font-bold text-red-400 tabular-nums">{account.currency} {fmt(result.riskDollars)}</div>
                  <div className="text-[10px] text-gray-600">{fmt(result.riskPct, 1)}% of balance</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 uppercase">Trades Left</div>
                  <div className={`text-xl font-bold tabular-nums ${result.tradesLeft <= 1 ? 'text-amber-400' : 'text-white'}`}>{result.tradesLeft}</div>
                  <div className="text-[10px] text-gray-600">of {account.max_trades_per_day} today</div>
                </div>
              </div>
            </div>

            {/* R:R Targets */}
            {(result.tp1R !== null || result.tp2R !== null || result.tp3R !== null) && (
              <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Target className="w-3.5 h-3.5 text-emerald-400" /> Reward Targets</h3>
                {[['TP1', result.tp1R, result.tp1Pnl, tp1Str], ['TP2', result.tp2R, result.tp2Pnl, tp2Str], ['TP3', result.tp3R, result.tp3Pnl, tp3Str]].map(([label, rr, pnl, price]) => {
                  if (rr === null) return null;
                  const r = rr as number;
                  return (
                    <div key={label as string} className={`flex items-center justify-between py-2 px-3 rounded-lg ${r >= 1 ? 'bg-emerald-500/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${r >= 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>{label as string}</span>
                        <span className="text-sm text-gray-400 tabular-nums">{price as string}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-bold tabular-nums ${r >= 2 ? 'text-emerald-400' : r >= 1 ? 'text-sky-400' : 'text-gray-400'}`}>{fmt(r)}R</span>
                        {pnl !== null && <span className="text-sm text-emerald-400/70 tabular-nums">+{account.currency} {fmt(pnl as number)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DD Impact */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-amber-400" /> Impact If Stop Hit</h3>
              <div className="space-y-4">
                <ImpactGauge label="Daily Drawdown" before={result.currentDdPct} after={result.ddAfterLossPct} max={100} unit="%" />
                <ImpactGauge label="Max Drawdown" before={result.maxDdLimit > 0 ? (result.currentDdUsed / result.maxDdLimit) * 100 : 0} after={result.maxDdAfterLossPct} max={100} unit="%" />
                <ImpactGauge label="Budget" before={result.budgetLeft} after={result.budgetAfterLoss} max={result.dailyDdLimit} unit={` ${account.currency}`} invert />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-gray-500 uppercase">Survival Now</div>
                    <div className={`text-lg font-bold tabular-nums ${result.survivalCount <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>{result.survivalCount} losses</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-gray-500 uppercase">After This Trade</div>
                    <div className={`text-lg font-bold tabular-nums ${result.survivalAfterLoss <= 1 ? 'text-red-400' : result.survivalAfterLoss <= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>{result.survivalAfterLoss} losses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 mb-4">
              <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-400" /> Rule Check
                  <span className="text-emerald-400">{result.rules.filter(r => r.status === 'pass').length}✓</span>
                  {result.rules.filter(r => r.status === 'warn').length > 0 && <span className="text-amber-400">{result.rules.filter(r => r.status === 'warn').length}!</span>}
                  {result.rules.filter(r => r.status === 'fail').length > 0 && <span className="text-red-400">{result.rules.filter(r => r.status === 'fail').length}✕</span>}
                </h3>
                {showRules ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </button>
              {showRules && <div className="mt-3 space-y-1">{result.rules.map((r, i) => <RuleRow key={i} rule={r} />)}</div>}
            </div>

            {/* Info box — not an execute button */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-gray-900/30 border border-gray-800/30 rounded-xl p-3">
                <p className="text-xs text-gray-500">Calculator only — execute on your broker, then log it.</p>
              </div>
              {onSendToLog && result.verdict !== 'STOP' && (
                <button onClick={() => {
                  onSendToLog({ symbol, direction, entry: entryStr, stop: stopStr, lots: String(result.lotSize), risk: String(result.riskDollars) });
                }} className="flex items-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-600/20 whitespace-nowrap">
                  Send to Log →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
