// app/academy/lesson/common-strategy-killers/page.tsx
// ATLAS Academy — Lesson 6.12: Common Strategy Killers [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown,  ChevronDown } from 'lucide-react';

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop(); return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: Strategy Decay — equity curve dying over time
// Healthy start → gradual erosion from multiple killers
// ============================================================
function StrategyDecayAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;
    const pad = 25;
    const top = 42;
    const bot = h - 35;
    const chartW = w - pad * 2;
    const progress = Math.min(1, (t % 4) / 3.5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('How Strategy Killers Erode a Working Edge Over Time', w / 2, 14);

    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalBars = 100;
    const visBars = Math.floor(progress * totalBars);

    // Equity curve that starts healthy then decays
    ctx.beginPath();
    let bal = 0;
    let maxBal = 0;
    const phases = [
      { start: 0, end: 30, wr: 0.52, rr: 2.0, label: 'Healthy Edge' },
      { start: 30, end: 50, wr: 0.50, rr: 1.8, label: 'Curve-fitting creeps in' },
      { start: 50, end: 70, wr: 0.46, rr: 1.5, label: 'Regime changes ignored' },
      { start: 70, end: 100, wr: 0.40, rr: 1.2, label: 'Emotional overrides' },
    ];

    for (let i = 0; i <= visBars; i++) {
      const phase = phases.find(p => i >= p.start && i < p.end) || phases[3];
      const win = seed(i * 3) < phase.wr;
      bal += win ? 100 * phase.rr : -100;
      maxBal = Math.max(maxBal, bal);

      const px = pad + (i / totalBars) * chartW;
      const py = bot - ((bal + 500) / 2500) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }

    // Colour gradient: green → amber → red
    const visPhase = visBars < 30 ? 0 : visBars < 50 ? 1 : visBars < 70 ? 2 : 3;
    const colors = ['#34d399', '#f59e0b', '#f97316', '#ef4444'];
    ctx.strokeStyle = colors[visPhase];
    ctx.lineWidth = 2; ctx.stroke();

    // Phase labels
    phases.forEach((p, i) => {
      const px = pad + ((p.start + p.end) / 2 / totalBars) * chartW;
      if (visBars > p.start + 5) {
        ctx.fillStyle = `${colors[i]}66`;
        ctx.font = '8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(p.label, px, bot + 12);
      }
    });

    // Killer markers
    const killerMarks = [
      { bar: 32, label: '🔧 Over-optimised', color: '#f59e0b' },
      { bar: 52, label: '📊 Regime shift missed', color: '#f97316' },
      { bar: 72, label: '😤 Rules broken', color: '#ef4444' },
    ];
    killerMarks.forEach(km => {
      if (visBars > km.bar) {
        const px = pad + (km.bar / totalBars) * chartW;
        ctx.fillStyle = km.color;
        ctx.font = '8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(km.label, px, top - 2);
        ctx.strokeStyle = `${km.color}33`; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(px, top + 5); ctx.lineTo(px, bot); ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Bottom note
    if (visBars > 90) {
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('The strategy was never "broken" — the trader broke it.', w / 2, bot + 26);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: 10 Killers ranked by severity — threat meter
// Horizontal bars showing impact level for each killer
// ============================================================
function KillerRankAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const pad = 15;
    const top = 32;
    const barH = 22;
    const gap = 4;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('10 Strategy Killers — Ranked by Severity', w / 2, 14);

    const killers = [
      { name: 'Curve-fitting / Over-optimisation', severity: 95, color: '#ef4444' },
      { name: 'Regime change blindness', severity: 90, color: '#ef4444' },
      { name: 'Emotional rule-breaking', severity: 88, color: '#ef4444' },
      { name: 'Strategy hopping after losses', severity: 85, color: '#f97316' },
      { name: 'Ignoring commissions / spread', severity: 75, color: '#f97316' },
      { name: 'Insufficient sample size', severity: 70, color: '#f59e0b' },
      { name: 'No journal / no review', severity: 65, color: '#f59e0b' },
      { name: 'Moving stops during trades', severity: 60, color: '#f59e0b' },
      { name: 'Wrong position sizing', severity: 55, color: '#eab308' },
      { name: 'Trading outside kill zones', severity: 45, color: '#eab308' },
    ];

    const reveal = Math.min(killers.length, Math.floor((t % 5) * 2.5));
    const maxBarW = w - pad * 2 - 200;

    killers.forEach((k, i) => {
      if (i >= reveal) return;
      const y = top + i * (barH + gap);
      const barW = (k.severity / 100) * maxBarW;

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath(); ctx.roundRect(pad + 180, y, maxBarW, barH, 3); ctx.fill();

      // Bar fill
      ctx.fillStyle = `${k.color}33`;
      ctx.beginPath(); ctx.roundRect(pad + 180, y, barW, barH, 3); ctx.fill();
      ctx.strokeStyle = `${k.color}66`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(pad + 180, y, barW, barH, 3); ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(k.name, pad + 175, y + barH / 2 + 3);

      // Severity %
      ctx.fillStyle = k.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(`${k.severity}%`, pad + 182 + barW + 4, y + barH / 2 + 3);
    });
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const killers = [
  { num: 1, icon: '🔧', name: 'Curve-Fitting / Over-Optimisation', severity: 'CRITICAL', desc: 'Adjusting your rules to perfectly match historical data. RSI 27 instead of 30 because it backtested 3% better. EMA 19 instead of 21. Stop at 7.3 pips instead of 8. These micro-tweaks memorise past data instead of discovering genuine patterns.', fix: 'Use round, standard values (RSI 30, EMA 21, 1% risk). If your strategy only works with RSI at exactly 27.4, it does not have an edge — it has a coincidence. A real edge works across a RANGE of parameters, not at one magic number.', example: 'A trader tested RSI thresholds from 20-40 and found 27 was "optimal." In live trading, RSI 27 performed the same as RSI 30. The "optimisation" was noise in the historical data.' },
  { num: 2, icon: '🌊', name: 'Regime Change Blindness', severity: 'CRITICAL', desc: 'Markets alternate between trending, ranging, volatile, and quiet periods. Your strategy works in ONE of these regimes. When the regime changes and your strategy keeps losing, you blame the strategy instead of recognising the regime shift.', fix: 'Add a regime filter: ADX > 25 for trend strategies, ADX < 20 for range strategies. Track which regime you are in and STOP trading when your strategy does not match. "No trade" IS a valid position.', example: 'A trend continuation trader was profitable for 3 months during a Gold uptrend. Gold entered a range. He kept trading the same setups and lost 12% in 6 weeks. The strategy was fine — the regime changed.' },
  { num: 3, icon: '😤', name: 'Emotional Rule-Breaking', severity: 'CRITICAL', desc: 'Moving stops, skipping triggers, entering without setups, closing early, revenge trading. Every rule break feels justified in the moment. Over 100 trades, rule-breaking trades lose at 75-85% rate while rule-following trades perform at backtest levels.', fix: 'Write your rules on paper. Tape it next to your screen. Before every trade, check each rule. After every trade, record whether you followed all rules. Your journal should track "followed rules Y/N" as a separate metric.', example: 'A trader\'s journal showed 11 of 80 trades broke rules. 9 of those 11 lost. If he had followed rules on all 80 trades, his profit would have been 34% higher.' },
  { num: 4, icon: '🔄', name: 'Strategy Hopping', severity: 'HIGH', desc: 'Switching strategies after every losing streak. 2 weeks on SMC, then switching to supply/demand, then ICT, then Wyckoff. You never reach the 100-trade sample size where any strategy\'s edge materialises. Every switch restarts the learning curve.', fix: 'Commit to ONE strategy for 100 trades minimum. If after 100 trades the EV is negative, THEN consider changes. A losing streak of 5-8 trades is NORMAL for any positive-EV strategy. The strategy needs TIME to prove itself.', example: 'A trader switched strategies 6 times in 4 months. Each time, he had fewer than 25 trades before switching. He never discovered that his first strategy had a +£32 EV per trade — he just never gave it enough trades to show.' },
  { num: 5, icon: '💸', name: 'Ignoring Commissions and Spread', severity: 'HIGH', desc: 'Backtesting without accounting for spread and commissions. A strategy that shows +£15/trade in backtest might be -£5/trade in live after the £8 spread + £4 commission on each trade. The tighter the stop, the worse this gets.', fix: 'Add realistic spread and commission to EVERY backtest trade. For Gold: 0.3-0.5 pip spread + $7-10 round trip commission. For EUR/USD: 0.1-0.3 pip spread + $5-7 commission. If the edge disappears after costs, the edge was never real.', example: 'A scalper\'s backtest showed +£18/trade. After adding 0.5 pip spread + $8 commission (≈£12 per trade), the real edge was +£6 — barely alive. One slip and it is negative.' },
  { num: 6, icon: '📊', name: 'Insufficient Sample Size', severity: 'HIGH', desc: 'Declaring a strategy "proven" after 20-30 trades. At this sample, random chance can produce a 70% win rate. You need 100+ trades across multiple market conditions to separate edge from luck.', fix: 'The 100-trade rule from Lesson 6.9. No exceptions. Include trending, ranging, and volatile conditions. If your 100 trades are all from one regime, the result is biased.', example: 'A trader backtested 25 trades during a trending market: 72% WR. He went live. The trend ended. His real WR settled at 47% over 150 trades — the 72% was regime-specific luck.' },
  { num: 7, icon: '📓', name: 'No Journal / No Review', severity: 'MEDIUM', desc: 'Trading without tracking means you cannot identify what is working and what is not. You repeat the same mistakes because you have no system to detect them. Improvement is random instead of systematic.', fix: 'Lesson 6.11 covers this in detail. At minimum: record entry/exit, R:R achieved, win/loss, emotional state, and lessons learned. Review weekly.', example: 'A trader felt "something was wrong" with his strategy for 3 months. After finally starting a journal, he discovered in 2 weeks that his Asian session trades were -£180/month. The fix took 5 seconds: stop trading Asia.' },
  { num: 8, icon: '🚫', name: 'Moving Stops During Trades', severity: 'MEDIUM', desc: 'Widening your stop because price is approaching it. Every pip you add is risk you did not plan for. If the OB breaks, your thesis is wrong — moving the stop further just means being wrong with a bigger loss.', fix: 'Lesson 6.6 rules: NEVER move a stop further from entry. The stop is set before entry when you are calm. During the trade, you are emotional. Trust the pre-trade plan.', example: 'A trader moved his Gold stop from 2,325 to 2,320 because "it needs more room." Price hit 2,320 anyway. Instead of a 7-pip planned loss, he took a 12-pip unplanned loss. The extra room did not save the trade — it just made the loss 71% bigger.' },
  { num: 9, icon: '⚖️', name: 'Wrong Position Sizing', severity: 'MEDIUM', desc: 'Using the same lot size regardless of stop distance. A 10-pip stop and a 30-pip stop at the same lot size means you risk 3× more on the wider stop. Alternatively, risking 5% per trade because you are "confident" — one losing streak wipes you out.', fix: 'Lesson 6.6 formula: Lots = (Account × Risk%) ÷ (Stop Distance × Pip Value). Calculate for EVERY trade. Never deviate based on confidence or feelings.', example: 'A trader used 1.0 lots on every Gold trade. Some trades had 8-pip stops (£80 risk), others had 25-pip stops (£250 risk). His risk swung wildly between 0.8% and 2.5% despite thinking he was "risking 1%."' },
  { num: 10, icon: '⏰', name: 'Trading Outside Kill Zones', severity: 'LOW-MEDIUM', desc: 'Taking setups during Asian session on Gold, or at 3 AM on EUR/USD. The setup criteria might be met but the volume is not there for follow-through. Your win rate drops 15-25% outside active sessions.', fix: 'Add a session filter. Gold: London + NY only. EUR/USD: London + Early NY. NASDAQ: NY open first 2-3 hours. If the setup appears outside these windows, set an alert and wait.', example: 'A trader\'s journal showed: London WR = 57%, NY WR = 51%, Asia WR = 31%. Eliminating Asia trades immediately lifted his blended WR from 46% to 54%.' },
];

const gameRounds = [
  { scenario: 'A trader\'s backtest shows 54% WR with 1:2 R:R over 120 trades. He goes live and after 60 trades: 44% WR, 1:1.6 R:R. He decides the strategy is "broken" and starts looking for a new one. What strategy killer is at work?', options: [
    { text: 'The strategy genuinely stopped working — he should switch', correct: false, explain: 'Let us check: Live EV = (0.44 × 1.6R) − (0.56 × 1R) = 0.704R − 0.56R = +0.144R per trade. It is STILL profitable. The decline from backtest is expected edge erosion (spread, commissions, slippage, mistakes). The strategy works — he is about to commit Strategy Hopping.' },
    { text: 'Strategy Hopping — the live results are still positive EV (+0.14R/trade). The decline from backtest is normal edge erosion, not strategy failure. Switching now wastes a proven edge.', correct: true, explain: 'Correct. +0.14R per trade at £100 risk = +£14/trade. Over 200 trades/year = +£2,800. Not spectacular, but PROFITABLE. Switching to an untested strategy resets everything. The killer here is impatience — he expected backtest-perfect results in live and panicked when reality was 60% of the backtest.' },
    { text: 'He needs a bigger sample — 60 trades is too few', correct: false, explain: '60 trades does show the erosion pattern clearly (WR and R:R both declined). More data would increase confidence but the pattern is already visible. The real issue is his reaction to the data, not the data itself.' },
    { text: 'Curve-fitting — the backtest was over-optimised', correct: false, explain: 'Possible, but the live results are still positive. If the backtest was curve-fitted, you would expect negative live EV. The erosion from +0.54R to +0.14R is typical of real-world costs, not curve-fitting.' },
  ]},
  { scenario: 'Gold has been in a strong uptrend for 6 weeks. A trader\'s Model 1 strategy is performing brilliantly — 62% WR. Then Gold enters a tight range. His next 15 trades: 4 wins, 11 losses (27% WR). He has no regime filter. What is the killer?', options: [
    { text: 'Emotional rule-breaking — he should have been more disciplined', correct: false, explain: 'He followed his Model 1 rules perfectly. The problem is not discipline — it is that Model 1 does not work in ranges. He was disciplined in applying the WRONG tool for the conditions.' },
    { text: 'Regime Change Blindness — his trend continuation strategy does not apply in a range. Without a regime filter, he kept trading a trend strategy in a ranging market and got punished.', correct: true, explain: 'Correct. The strategy did not break. The MARKET changed. Model 1 (trend continuation) requires a trend. In a range, there is no trend to continue — BOS signals are just range noise. An ADX filter (only trade when ADX > 25) or a simple "is the market making HH/HL?" check would have prevented all 15 losing trades.' },
    { text: 'He needs to add more indicators to filter range conditions', correct: false, explain: 'He needs ONE filter: a regime check. More indicators add complexity without solving the core problem. A simple ADX > 25 threshold or visual HH/HL confirmation is sufficient.' },
    { text: 'The strategy was always bad — the 62% WR was luck', correct: false, explain: '62% WR over 6 weeks of trending Gold with Model 1 is expected performance — that is what trend continuation is designed for. The 27% in the range is also expected — trend strategies fail in ranges by design.' },
  ]},
  { scenario: 'A trader backtested 200 trades with +£38 EV per trade. In live trading over 100 trades, his EV is +£12. He calculates: spread costs £8/trade, commissions £5/trade, slippage £3/trade, and he estimates he loses £10/trade from emotional mistakes (closing early, entering late). What does this reveal?', options: [
    { text: 'The strategy is broken — £12 is too low', correct: false, explain: '£12/trade is still positive. Over 500 trades/year that is £6,000. Not broken — eroded. And the erosion is clearly decomposed into fixable components.' },
    { text: 'Edge erosion is well-documented: £8 spread + £5 commission + £3 slippage + £10 mistakes = £26 erosion. The £10 from mistakes is the only controllable item — fixing execution could recover £10/trade, pushing EV from £12 to £22.', correct: true, explain: 'Correct. Spread (£8) and commission (£5) are fixed costs — you cannot reduce them without changing broker or instrument. Slippage (£3) is partially reducible with limit orders. But mistakes (£10) are entirely within his control. Better discipline = +£10/trade recovered = 83% increase in net edge. The journal quantifies exactly where the money goes.' },
    { text: 'He should change brokers to reduce spread', correct: false, explain: 'Changing brokers might save £1-2/trade on spread. The emotional mistakes cost £10/trade — 5× more impact. Fix the biggest leak first.' },
    { text: 'He should increase position size to offset the erosion', correct: false, explain: 'Increasing size amplifies BOTH the edge and the erosion. If he doubles size, his £12 EV becomes £24 but his mistakes cost £20 instead of £10. The ratio stays the same. Fix the leak, do not compensate around it.' },
  ]},
  { scenario: 'A new trader tested 5 different strategies over 3 months, spending 2-3 weeks on each. None of them "worked." His longest test was 28 trades. He concludes: "Trading doesn\'t work — all strategies fail." What is really happening?', options: [
    { text: 'He is right — trading is not for everyone', correct: false, explain: 'He has not given a SINGLE strategy enough trades to prove itself. You cannot conclude "trading does not work" from five 25-trade samples.' },
    { text: 'Strategy Hopping + Insufficient Sample Size. None of his tests reached 100 trades. A positive-EV strategy can easily lose money over 28 trades due to variance. He abandoned 5 potentially profitable strategies before they had a chance to prove themselves.', correct: true, explain: 'Correct. At 28 trades, variance can make a +£30 EV strategy show a loss of £500. He was testing in the "noise zone" where luck dominates and edge is invisible. He needs to pick ONE strategy, commit to 100 trades, and THEN evaluate. The problem is not that trading does not work — it is that he never tested long enough to find out.' },
    { text: 'He should test all 5 simultaneously to save time', correct: false, explain: 'Running 5 strategies simultaneously creates confusion, splits focus, and makes journaling nearly impossible. One strategy at a time, 100 trades minimum.' },
    { text: 'He should find a 6th strategy from a new YouTube channel', correct: false, explain: 'Adding strategy #6 to the graveyard of abandoned strategies is the definition of strategy hopping. He needs commitment, not variety.' },
  ]},
  { scenario: 'A funded trader passes her evaluation with a Model 1 strategy on EUR/USD (52% WR, 1:2 R:R). During her funded phase, she starts "improving" the strategy: changes RSI from 30 to 26, switches from engulfing trigger to LTF BOS only, and adds a MACD filter. After 40 trades, her WR drops to 38%. What went wrong?', options: [
    { text: 'The funded account has different market dynamics', correct: false, explain: 'Funded accounts trade the same markets. The market did not change — her strategy did.' },
    { text: 'Over-optimisation — she changed 3 parameters simultaneously on a strategy that was ALREADY WORKING. Each change was untested in combination. She curve-fitted her way from a proven edge to an unknown strategy.', correct: true, explain: 'Correct. She had a proven strategy (52% WR, 1:2 R:R = +0.54R EV). Then she changed RSI threshold + trigger type + added a new filter — THREE simultaneous changes. She now has a completely different, untested strategy. The original strategy would have continued working. The "improvements" destroyed a working edge. Rule: NEVER change a winning strategy without isolated testing of each change.' },
    { text: 'She should add more filters to recover the edge', correct: false, explain: 'Adding MORE changes on top of 3 failed changes compounds the problem. She should REVERT to the original strategy that passed the evaluation.' },
    { text: 'LTF BOS is a worse trigger than engulfing — switch back to engulfing only', correct: false, explain: 'LTF BOS might actually be better — but she cannot know because she changed 3 things at once. The issue is the simultaneous changes, not any individual change. Revert all changes, then test ONE at a time.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the MOST dangerous strategy killer?', opts: ['Trading outside kill zones', 'Wrong position sizing', 'Curve-fitting / Over-optimisation — creating rules that memorise the past instead of discovering genuine patterns', 'Not having a journal'], correct: 2, explain: 'Curve-fitting is the most dangerous because it creates FALSE CONFIDENCE. You believe you have a proven edge (the backtest looks amazing) but the "edge" is just memorised historical data. In live trading, the curve-fitted strategy fails and you do not understand why — because the backtest told you it worked.' },
  { q: 'A strategy worked for 4 months then lost money for 6 weeks. What should you check FIRST?', opts: ['Whether the strategy was ever profitable', 'Whether the market regime changed — trending to ranging, or volatile to quiet', 'Whether you need more indicators', 'Whether the broker is cheating'], correct: 1, explain: 'The most common reason a working strategy "stops working" is a regime change. A trend strategy fails in ranges. A range strategy fails in trends. Check the regime FIRST. If the regime changed, the strategy might be fine — you just need to wait for the right conditions or add a regime filter.' },
  { q: 'A trader changes 4 parameters of his strategy and results improve. Can he trust the improvement?', opts: ['Yes — the results speak for themselves', 'No — with 4 simultaneous changes, he cannot know which change helped. The improvement might be luck, or 1 change helped while 3 hurt and the net happened to be positive.', 'Yes — more changes means more improvement', 'Only if the sample is over 50 trades'], correct: 1, explain: 'Changing 4 variables simultaneously makes it impossible to attribute the improvement. One change might have added +£20 EV while the other three subtracted £5 each, netting +£5 that LOOKS like all changes helped. The one-change rule (Lesson 6.11) exists precisely for this reason.' },
  { q: 'How does edge erosion typically affect backtest-to-live performance?', opts: ['Live is always better than backtest', 'Live EV is typically 30-60% lower than backtest EV due to spread, commissions, slippage, and execution mistakes', 'There is no difference between backtest and live', 'Live is always exactly 50% of backtest'], correct: 1, explain: 'The 30-60% erosion range is well-documented. A +£50 backtest EV becomes +£20-35 in live. This is normal and expected. If your backtest EV is barely positive (+£5), it will likely be negative in live after costs. Plan for erosion when evaluating backtest results.' },
  { q: 'What is "strategy hopping" and why is it destructive?', opts: ['Testing multiple strategies simultaneously — it is actually efficient', 'Switching strategies after every losing streak before reaching the 100-trade minimum — it prevents any strategy from proving itself', 'Trading multiple instruments — it is fine if managed properly', 'Using different timeframes — it is called multi-timeframe analysis'], correct: 1, explain: 'Every strategy has losing streaks. A +EV strategy might lose 5-8 trades in a row. If you switch after 5 losses and 20 total trades, you abandon a potentially profitable strategy during its normal variance. You then start a NEW strategy, which also has losing streaks. After 5 switches, you have zero proven strategies and zero data.' },
  { q: 'A strategy has +£30 EV in backtest. After adding commission (£4) and spread (£6), the net EV is +£20. Is this strategy viable?', opts: ['No — the erosion is too high', 'Yes — +£20 net EV is still a meaningful edge. The £10 cost is the price of doing business.', 'Only if the trader can negotiate lower commissions', 'Impossible to tell without 500+ trades'], correct: 1, explain: '+£20 net EV means you earn £20 on average for every trade. At 10 trades/week, that is £200/week or ~£10,000/year. The strategy is viable. The £10 erosion (33%) is within the normal range. What matters is the NET number, not the gross-to-net ratio.' },
  { q: 'What is the correct response when you detect regime change?', opts: ['Switch to a different strategy immediately', 'Stop trading the current strategy in this regime. Either wait for the regime to return, or use a strategy designed for the new regime.', 'Add more indicators to adapt', 'Trade with bigger position size to recover losses'], correct: 1, explain: 'When the regime shifts, your strategy stops working — by design. The correct response is to STOP, not adapt on the fly. Either wait for the regime to return (Gold will trend again eventually), or have a second strategy designed for the new regime (a range strategy for ranging markets). Do not force a trend strategy to work in a range.' },
  { q: 'Which of these is NOT a strategy killer?', opts: ['Having a 42% win rate', 'Curve-fitting parameters to historical data', 'Strategy hopping after every losing streak', 'Ignoring commissions in backtests'], correct: 0, explain: 'A 42% win rate is NOT a strategy killer — it is a statistic that means nothing without context. At 1:3 R:R, 42% WR = +0.68R per trade (very profitable). Win rate alone tells you nothing. All the other options are genuine strategy killers that destroy working edges.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function CommonStrategyKillersLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openKiller, setOpenKiller] = useState<number | null>(null);

  // Interactive — Strategy Health Diagnostic
  const [diagAnswers, setDiagAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const diagQs = [
    { q: 'Did you change any strategy parameters recently?', opts: ['Yes — multiple', 'Yes — one', 'No changes'], weights: [0, 1, 2], killer: 'Curve-fitting' },
    { q: 'Has the market regime changed since your strategy last worked?', opts: ['Not sure', 'Possibly', 'Yes — I checked'], weights: [0, 1, 2], killer: 'Regime blindness' },
    { q: 'Have you broken your rules in the last 10 trades?', opts: ['Several times', 'Once or twice', 'Zero rule breaks'], weights: [0, 1, 2], killer: 'Emotional breaking' },
    { q: 'How many trades in your current sample?', opts: ['Under 30', '30-99', '100+'], weights: [0, 1, 2], killer: 'Sample size' },
    { q: 'Do you account for spread and commission in results?', opts: ['No', 'Approximately', 'Exact calculation'], weights: [0, 1, 2], killer: 'Cost blindness' },
    { q: 'How many strategies have you tried in the last 3 months?', opts: ['3+', '2', '1 (committed)'], weights: [0, 1, 2], killer: 'Strategy hopping' },
    { q: 'Do you journal and review weekly?', opts: ['No', 'Journal but no review', 'Journal + weekly review'], weights: [0, 1, 2], killer: 'No journal' },
    { q: 'Do you trade outside your asset\'s active sessions?', opts: ['Frequently', 'Sometimes', 'Never — KZ only'], weights: [0, 1, 2], killer: 'Session leaks' },
  ];
  const diagScore = diagAnswers.reduce<number>((sum, a, i) => sum + (a !== null ? diagQs[i].weights[a] : 0), 0);
  const diagMax = 16;
  const diagGrade = diagScore >= 14 ? 'HEALTHY' : diagScore >= 10 ? 'AT RISK' : diagScore >= 6 ? 'CRITICAL' : 'TERMINAL';
  const diagColor = diagGrade === 'HEALTHY' ? 'text-green-400' : diagGrade === 'AT RISK' ? 'text-amber-400' : diagGrade === 'CRITICAL' ? 'text-orange-400' : 'text-red-400';
  const allDiag = diagAnswers.every(a => a !== null);
  const activeKillers = diagAnswers.map((a, i) => a === 0 ? diagQs[i].killer : null).filter(Boolean);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScore = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => { if (certUnlocked) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }}, [certUnlocked]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 6</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 12</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Common Strategy<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Killers</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Why good strategies fail in practice. 10 killers that destroy working edges &mdash; and how to defend against each one.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 Death by a Thousand Cuts</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most strategies do not die in a dramatic explosion. They die slowly &mdash; a curve-fitted parameter here, a broken rule there, a missed regime shift, a few extra trades outside kill zones. Each one is small. Together, they bleed your edge dry until a profitable strategy becomes a breakeven strategy, then a losing one.</p>
            <p className="text-gray-400 leading-relaxed">The worst part: you often do not notice until it is too late. Your win rate drops from 52% to 46% over 3 months and you blame the market. In reality, YOU changed — the market is the same. This lesson identifies the 10 killers so you can defend against each one before they compound.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm analysed 3,200 funded traders over 18 months. Of those who eventually failed, <strong className="text-red-400">72% had profitable strategies on entry</strong>. They did not fail because their strategy was bad &mdash; they failed because they gradually destroyed their own edge through the killers in this lesson. The strategy survived. The trader did not.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Strategy Decay Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Slow Death</p>
          <h2 className="text-2xl font-extrabold mb-4">How a Healthy Edge Decays</h2>
          <p className="text-gray-400 text-sm mb-6">Watch a profitable equity curve gradually erode as each killer takes its toll. The strategy was never broken — the trader broke it.</p>
          <StrategyDecayAnimation />
        </motion.div>
      </section>

      {/* S02 — Killer Rank Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Threat Ranking</p>
          <h2 className="text-2xl font-extrabold mb-4">10 Killers by Severity</h2>
          <KillerRankAnimation />
        </motion.div>
      </section>

      {/* S03 — 10 Killers Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 10 Killers</p>
          <h2 className="text-2xl font-extrabold mb-4">Each One Explained + The Fix</h2>
          <div className="space-y-3">
            {killers.map((k, i) => (
              <div key={i}>
                <button onClick={() => setOpenKiller(openKiller === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{k.icon}</span>
                    <div><p className="text-sm font-extrabold text-white">{k.num}. {k.name}</p><p className="text-xs text-gray-500">Severity: <span className={k.severity === 'CRITICAL' ? 'text-red-400' : k.severity === 'HIGH' ? 'text-orange-400' : 'text-amber-400'}>{k.severity}</span></p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openKiller === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openKiller === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{k.desc}</p>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-xs text-green-400">✓ <strong>The Fix:</strong> {k.fix}</p></div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">📌 <strong>Example:</strong> {k.example}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Compound Effect */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Compound Effect</p>
          <h2 className="text-2xl font-extrabold mb-4">Killers Multiply, Not Add</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">Each killer alone reduces your edge by 5-15%. But they COMPOUND. Two killers do not cost 20% — they cost 25-30%. Three killers cost 40-50%. By the time four killers are active, your +£40 EV edge is zero or negative.</p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                  <th className="text-left py-2">Active Killers</th><th className="text-left py-2">Edge Remaining</th><th className="text-left py-2">£40 EV becomes</th>
                </tr></thead>
                <tbody className="text-gray-400">
                  <tr className="border-b border-white/[0.03]"><td className="py-2">0</td><td className="text-green-400">100%</td><td>£40</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2">1</td><td className="text-green-400">85-90%</td><td>£34-36</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2">2</td><td className="text-amber-400">70-75%</td><td>£28-30</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2">3</td><td className="text-orange-400">50-60%</td><td>£20-24</td></tr>
                  <tr className="border-b border-white/[0.03]"><td className="py-2">4</td><td className="text-red-400">30-40%</td><td>£12-16</td></tr>
                  <tr><td className="py-2">5+</td><td className="text-red-400">0-20%</td><td>£0-8 (likely negative after costs)</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Leaky Bucket Analogy:</strong> Your edge is water flowing into a bucket. Each killer is a hole. One small hole is manageable. Five holes and the bucket empties faster than it fills — even though water (edge) is still flowing in.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Strategy Health Diagnostic */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Strategy Health Diagnostic</p>
          <h2 className="text-2xl font-extrabold mb-2">Is YOUR Strategy Under Attack?</h2>
          <p className="text-gray-400 text-sm mb-6">Answer honestly about your current trading. See which killers are active.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            {diagQs.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-2">{q.q}</p>
                <div className="flex flex-wrap gap-2">
                  {q.opts.map((opt, oi) => (
                    <button key={oi} onClick={() => { const next = [...diagAnswers]; next[qi] = oi; setDiagAnswers(next); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${diagAnswers[qi] === oi ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            {allDiag && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                <p className={`text-2xl font-black ${diagColor}`}>{diagGrade}</p>
                <p className="text-xs text-gray-500">Health Score: {diagScore}/{diagMax}</p>
                {activeKillers.length > 0 && (
                  <div className="text-left p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                    <p className="text-xs text-red-400 font-bold mb-1">Active threats detected:</p>
                    {activeKillers.map((k, i) => (<p key={i} className="text-xs text-red-400">⚠️ {k}</p>))}
                  </div>
                )}
                <p className="text-xs text-gray-400">{diagGrade === 'HEALTHY' ? 'Your strategy is well-defended. Keep these practices consistent.' : diagGrade === 'AT RISK' ? 'Some killers are present. Address the flagged issues before they compound.' : diagGrade === 'CRITICAL' ? 'Multiple killers active. Your edge is being eroded significantly. Prioritise fixes NOW.' : 'Your edge is likely already destroyed. STOP trading. Fix the flagged issues. Re-backtest. Then resume.'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — Defence Playbook */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Defence Playbook</p>
          <h2 className="text-2xl font-extrabold mb-4">5 Rules That Block Most Killers</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">1. Use standard parameters.</strong> <span className="text-gray-400">RSI 30, EMA 21/50/200, 1% risk. Round numbers that work across a range. Kills curve-fitting.</span></p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">2. Add a regime filter.</strong> <span className="text-gray-400">ADX &gt; 25 for trend strategies, range boundaries for range strategies. Know WHEN your strategy applies. Kills regime blindness.</span></p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">3. Journal every trade + weekly review.</strong> <span className="text-gray-400">Catches emotional rule-breaking, reveals session leaks, quantifies every killer. The diagnostic system.</span></p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">4. 100-trade minimum before ANY judgement.</strong> <span className="text-gray-400">Prevents strategy hopping and sample-size delusion. Commit to the data.</span></p></div>
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">5. Calculate net EV (after costs) before going live.</strong> <span className="text-gray-400">If gross EV minus spread minus commission minus estimated mistakes is still positive, the strategy is viable. If not, fix it first.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S07 — When to Actually Change Strategy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When to ACTUALLY Change</p>
          <h2 className="text-2xl font-extrabold mb-4">Legitimate vs Emotional Reasons</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm font-extrabold text-green-400 mb-2">Legitimate reasons to change:</p>
              <p className="text-xs text-gray-400">Net EV is negative over 100+ live trades (after costs). The market structure has fundamentally changed (new regulations, new instruments). Your lifestyle has changed and the strategy no longer fits your schedule. The journal reveals a specific, quantified problem that a rule change would fix.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-extrabold text-red-400 mb-2">Emotional reasons (NOT valid):</p>
              <p className="text-xs text-gray-400">"I lost 5 trades in a row." "My friend makes more money with a different strategy." "I saw a YouTube video about a better method." "I am bored with my current strategy." "The market is broken." "I think I can do better."</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes (meta) */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Meta-Mistake</p>
          <h2 className="text-2xl font-extrabold mb-4">Knowing the Killers but Not Defending</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">The biggest irony: most traders who read this lesson will nod at every killer, agree with every fix, and then continue doing the same things. Knowledge without implementation is entertainment, not education.</p>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Reading about curve-fitting</strong> does not prevent it. Having written rules with standard parameters does.</p></div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Knowing about regime changes</strong> does not help. Having an ADX filter that blocks trades in the wrong regime does.</p></div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm text-gray-400"><strong className="text-red-400">Understanding emotional rule-breaking</strong> does not stop it. A pre-trade checklist and a journal that tracks rule compliance does.</p></div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">The Implementation Test:</strong> For each of the 10 killers, write down your SPECIFIC defence. If you cannot write a concrete defence (not "I will try harder" but "I use ADX &gt; 25 as a regime filter"), that killer is currently active in your trading.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Killer Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">CRITICAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Curve-fitting, Regime blindness, Emotional rule-breaking. Fix these FIRST.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-orange-400">HIGH</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Strategy hopping, Ignoring costs, Insufficient sample size. Fix after the criticals.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">MEDIUM</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No journal, Moving stops, Wrong sizing. Important but less urgent.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">DEFENCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Standard params + Regime filter + Journal + 100-trade rule + Net EV calculation.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">COMPOUND</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Each killer reduces edge 5-15%. 3+ killers active = edge near zero. Fix the biggest leak first.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Strategy Killer Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Identify the killer and the fix.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can identify and defend against the killers.' : gameScore >= 3 ? 'Solid — review the 3 CRITICAL killers and their specific fixes.' : 'Re-read the 10 killers section carefully, then try again.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">🛡️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Common Strategy Killers</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-red-400 via-purple-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Edge Defender &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>
    </div>
  );
}
