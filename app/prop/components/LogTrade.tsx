'use client';

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, X, Check, Loader2, AlertTriangle, BookOpen, DollarSign
} from 'lucide-react';

interface PropAccount {
  id: string; name: string; balance: number; currency: string;
  phase: string; risk_pct: number; max_trades_per_day: number;
}

const fmt = (n: number, d = 2) => n.toFixed(d);

export default function LogTrade({
  account, onLog, onClose,
}: {
  account: PropAccount;
  onLog: (data: {
    symbol: string; direction: string;
    entry_price: number; stop_price: number; close_price: number | null;
    lot_size: number; risk_dollars: number; risk_pct: number;
    pnl: number | null; r_result: number | null;
    commission: number; swap: number;
    status: string; notes: string;
  }) => void;
  onClose: () => void;
}) {
  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryStr, setEntryStr] = useState('');
  const [stopStr, setStopStr] = useState('');
  const [exitStr, setExitStr] = useState('');
  const [lotStr, setLotStr] = useState('');
  const [riskStr, setRiskStr] = useState('');
  const [commissionStr, setCommissionStr] = useState('');
  const [swapStr, setSwapStr] = useState('');
  const [notes, setNotes] = useState('');
  const [tradeStatus, setTradeStatus] = useState<'open' | 'closed'>('open');
  const [submitting, setSubmitting] = useState(false);

  const entry = parseFloat(entryStr);
  const stop = parseFloat(stopStr);
  const exit = parseFloat(exitStr);
  const lots = parseFloat(lotStr) || 0;
  const riskD = parseFloat(riskStr) || 0;
  const commission = parseFloat(commissionStr) || 0;
  const swap = parseFloat(swapStr) || 0;

  // Auto-calc P&L if closed and we have exit + lots
  const dist = entry && stop ? Math.abs(entry - stop) : 0;
  const hasExit = tradeStatus === 'closed' && exit && entry;
  const move = hasExit ? (direction === 'long' ? exit - entry : entry - exit) : null;
  const rR = move !== null && dist > 0 ? move / dist : null;

  // Gross P&L from price movement (simplified — user can override)
  // This is approximate; the actual P&L depends on contract size
  // For forex: pnl = move * lots * 100000
  // But we let the user enter their actual P&L from broker too
  const [pnlOverride, setPnlOverride] = useState('');
  const grossPnl = pnlOverride ? parseFloat(pnlOverride) : (move !== null && lots ? move * lots * 100000 : null);
  const netPnl = grossPnl !== null ? grossPnl - commission - swap : null;

  const stopValid = entry && stop ? (direction === 'long' ? stop < entry : stop > entry) : true;
  const canSubmit = entry && stop && symbol && lots > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    onLog({
      symbol,
      direction,
      entry_price: entry,
      stop_price: stop,
      close_price: hasExit ? exit : null,
      lot_size: lots,
      risk_dollars: riskD || (account.balance * account.risk_pct / 100 * (account.phase === 'Phase 1' ? 1 : account.phase === 'Phase 2' ? 0.75 : 0.5)),
      risk_pct: riskD ? (riskD / account.balance) * 100 : account.risk_pct,
      pnl: tradeStatus === 'closed' ? (netPnl !== null ? Math.round(netPnl * 100) / 100 : null) : null,
      r_result: tradeStatus === 'closed' ? (rR !== null ? Math.round(rR * 100) / 100 : null) : null,
      commission,
      swap,
      status: tradeStatus,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Log Trade</h2>
              <p className="text-xs text-gray-500">Record your actual trade from the broker</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50">Cancel</button>
        </div>

        <div className="bg-[#12121a] border border-gray-800/50 rounded-2xl p-5 space-y-5">
          {/* Trade Status */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Trade Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTradeStatus('open')}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${tradeStatus === 'open' ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>
                Open (still running)
              </button>
              <button onClick={() => setTradeStatus('closed')}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${tradeStatus === 'closed' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}>
                Closed (completed)
              </button>
            </div>
          </div>

          {/* Symbol + Direction */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Symbol</label>
              <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white font-medium focus:border-sky-500 focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {(['long','short'] as const).map(d => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      direction === d ? d === 'long' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}>{d === 'long' ? <><TrendingUp className="w-4 h-4" />LONG</> : <><TrendingDown className="w-4 h-4" />SHORT</>}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Entry + Stop */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Entry Price</label>
              <input type="number" step="any" placeholder="Actual entry" value={entryStr} onChange={e => setEntryStr(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Stop Loss</label>
              <input type="number" step="any" placeholder="Actual stop" value={stopStr} onChange={e => setStopStr(e.target.value)}
                className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-white tabular-nums focus:outline-none ${!stopValid ? 'border-red-500/50' : 'border-gray-700 focus:border-sky-500'}`} />
            </div>
          </div>

          {/* Exit (only if closed) */}
          {tradeStatus === 'closed' && (
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Exit Price</label>
              <input type="number" step="any" placeholder="Actual exit" value={exitStr} onChange={e => setExitStr(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
            </div>
          )}

          {/* Lots + Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Actual Lot Size</label>
              <input type="number" step="any" placeholder="From broker" value={lotStr} onChange={e => setLotStr(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Risk ({account.currency})</label>
              <input type="number" step="any" placeholder="Optional" value={riskStr} onChange={e => setRiskStr(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
              <div className="text-[10px] text-gray-600 mt-1">Leave blank for auto-calc</div>
            </div>
          </div>

          {/* Commission + Swap */}
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Broker Costs
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-600 mb-1">Commission ({account.currency})</label>
                <input type="number" step="any" placeholder="0.00" value={commissionStr} onChange={e => setCommissionStr(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm tabular-nums focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-1">Swap / Overnight ({account.currency})</label>
                <input type="number" step="any" placeholder="0.00" value={swapStr} onChange={e => setSwapStr(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm tabular-nums focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* P&L Override (for closed trades) */}
          {tradeStatus === 'closed' && (
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Gross P&L ({account.currency}) — from broker</label>
              <input type="number" step="any" placeholder="Leave blank for auto-calc, or enter broker's P&L" value={pnlOverride} onChange={e => setPnlOverride(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white tabular-nums focus:border-sky-500 focus:outline-none" />
              <div className="text-[10px] text-gray-600 mt-1">Enter the exact P&L shown on your broker for accuracy</div>
            </div>
          )}

          {/* P&L Summary (if closed) */}
          {tradeStatus === 'closed' && netPnl !== null && (
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gross P&L</span>
                <span className={`tabular-nums font-medium ${(grossPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(grossPnl || 0) >= 0 ? '+' : ''}{account.currency} {fmt(grossPnl || 0)}
                </span>
              </div>
              {(commission > 0 || swap > 0) && (
                <>
                  {commission > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission</span>
                      <span className="text-red-400/70 tabular-nums">-{account.currency} {fmt(commission)}</span>
                    </div>
                  )}
                  {swap > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Swap</span>
                      <span className="text-red-400/70 tabular-nums">-{account.currency} {fmt(swap)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-800/50 pt-2 flex justify-between text-sm">
                    <span className="text-gray-300 font-medium">Net P&L</span>
                    <span className={`font-bold tabular-nums ${netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {netPnl >= 0 ? '+' : ''}{account.currency} {fmt(netPnl)}
                    </span>
                  </div>
                </>
              )}
              {rR !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Result</span>
                  <span className={`font-bold tabular-nums ${rR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {rR >= 0 ? '+' : ''}{fmt(rR)}R
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
            <input type="text" placeholder="Setup, lessons, emotions..." value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white text-sm focus:border-sky-500 focus:outline-none" />
          </div>

          {/* Stop warning */}
          {!stopValid && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Stop is on the wrong side for {direction}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <button onClick={onClose} className="px-5 py-3 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={!canSubmit || submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-600/20">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Log Trade
          </button>
        </div>
      </div>
    </div>
  );
}
