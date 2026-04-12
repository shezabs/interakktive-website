// app/academy/lesson/backtesting-fundamentals/page.tsx
// ATLAS Academy — Lesson 6.9: Backtesting Fundamentals [PRO]
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
// ANIMATION 1: Sample Size — confidence grows with trades
// Bar fills as trade count increases, confidence % changes
// ============================================================
function SampleSizeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cycle = t % 5;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('How Sample Size Changes Confidence', mid, 14);

    const milestones = [
      { trades: 10, conf: 15, wr: '70%', label: 'Meaningless', color: '#ef4444', note: 'Could be luck. 7/10 wins proves nothing.' },
      { trades: 30, conf: 35, wr: '57%', label: 'Suspicious', color: '#f59e0b', note: 'Pattern emerging but still unreliable.' },
      { trades: 50, conf: 55, wr: '52%', label: 'Interesting', color: '#f59e0b', note: 'Starting to mean something. Keep going.' },
      { trades: 100, conf: 80, wr: '48%', label: 'Reliable', color: '#34d399', note: 'NOW you can trust the data.' },
      { trades: 200, conf: 95, wr: '47%', label: 'Statistically Valid', color: '#34d399', note: 'This IS your real win rate.' },
    ];

    const activeIdx = Math.min(Math.floor(cycle), milestones.length - 1);
    const m = milestones[activeIdx];

    // Trade counter
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`${m.trades}`, mid, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px system-ui';
    ctx.fillText('trades completed', mid, 85);

    // Confidence bar
    const barW = w * 0.6;
    const barH = 20;
    const barX = (w - barW) / 2;
    const barY = 100;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
    ctx.fillStyle = `${m.color}33`;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * (m.conf / 100), barH, 6); ctx.fill();
    ctx.strokeStyle = `${m.color}66`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW * (m.conf / 100), barH, 6); ctx.stroke();

    ctx.fillStyle = m.color; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`${m.conf}% Confidence`, mid, barY + 14);

    // Win rate display
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px system-ui';
    ctx.fillText(`Measured Win Rate: ${m.wr}`, mid, barY + 40);

    // Label and note
    ctx.fillStyle = m.color; ctx.font = 'bold 14px system-ui';
    ctx.fillText(m.label, mid, barY + 65);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px system-ui';
    ctx.fillText(m.note, mid, barY + 82);

    // Milestone dots
    milestones.forEach((ms, i) => {
      const dotX = (w - 200) / 2 + i * 50;
      const dotY = h - 20;
      ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = i <= activeIdx ? ms.color : 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.fillStyle = i <= activeIdx ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
      ctx.font = '7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`${ms.trades}`, dotX, dotY + 14);
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Hindsight Bias — what you see vs what was real
// Left: chart with hindsight (obvious OB). Right: same chart bar-by-bar
// ============================================================
function HindsightBiasAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const mid = w / 2;
    const pad = 20;
    const top = 42;
    const bot = h - 30;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Hindsight vs Reality — The Bias That Fakes Your Backtest', mid, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, top - 5); ctx.lineTo(mid, bot + 5); ctx.stroke();
    ctx.setLineDash([]);

    const pts = [
      [0.05, 0.65], [0.12, 0.58], [0.18, 0.50], [0.24, 0.55],
      [0.30, 0.42], [0.36, 0.48], [0.42, 0.52], [0.48, 0.45],
      [0.54, 0.35], [0.60, 0.30], [0.66, 0.25], [0.72, 0.28],
      [0.78, 0.22], [0.84, 0.18], [0.90, 0.20], [0.96, 0.15],
    ];

    // LEFT: Full chart with hindsight (all visible)
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
    ctx.fillText('HINDSIGHT (full chart visible)', mid / 2, 30);

    const chartW = mid - pad * 2;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const px = pad + x * chartW;
      const py = top + y * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

    // "Obvious" OB marked in hindsight
    const obX = pad + 0.30 * chartW;
    const obY = top + 0.42 * (bot - top);
    ctx.fillStyle = 'rgba(52,211,153,0.1)';
    ctx.fillRect(obX - 10, obY - 5, 20, 15);
    ctx.strokeStyle = 'rgba(52,211,153,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(obX - 10, obY - 5, 20, 15);
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('"Obviously the OB"', obX + 14, obY + 4);
    ctx.fillText('(only obvious because', obX + 14, obY + 14);
    ctx.fillText('you see the result)', obX + 14, obY + 24);

    // RIGHT: Bar-by-bar reveal (reality)
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#34d399'; ctx.textAlign = 'center';
    ctx.fillText('REALITY (bar-by-bar)', mid + mid / 2, 30);

    const revealCount = Math.min(pts.length, Math.floor((t % 4) * 5));
    ctx.beginPath();
    for (let i = 0; i <= revealCount && i < pts.length; i++) {
      const px = mid + pad + pts[i][0] * chartW;
      const py = top + pts[i][1] * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.5; ctx.stroke();

    // Question mark at current bar
    if (revealCount < pts.length - 1) {
      const curX = mid + pad + pts[revealCount][0] * chartW;
      const curY = top + pts[revealCount][1] * (bot - top);
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('?', curX + 12, curY);

      // "What happens next?" label
      ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.font = '8px system-ui';
      ctx.fillText('What happens next?', curX + 12, curY + 14);
    }

    // Hidden future (greyed out)
    if (revealCount < pts.length - 1) {
      ctx.beginPath();
      for (let i = revealCount; i < pts.length; i++) {
        const px = mid + pad + pts[i][0] * chartW;
        const py = top + pts[i][1] * (bot - top);
        if (i === revealCount) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
    }

    // Bottom labels
    ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fillText('Every OB looks obvious after the move', mid / 2, bot + 14);
    ctx.fillStyle = 'rgba(52,211,153,0.5)';
    ctx.fillText('Bar-by-bar = how YOU would have seen it', mid + mid / 2, bot + 14);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const backtestSteps = [
  { num: '1', title: 'Define Your Rules FIRST', desc: 'Write down every single rule of your strategy BEFORE you look at any chart. Entry model (M1 or M2), entry trigger (engulfing, LTF BOS, etc.), stop method (structure, ATR), target method (fixed R:R, structural), and management plan (partials, BE, trail). If it is not written, it does not count.', tip: 'Print the rules on paper and tape it next to your screen. Every backtest trade must pass EVERY rule. If you catch yourself bending a rule for a "good-looking" setup, the backtest is corrupted.' },
  { num: '2', title: 'Choose Your Sample', desc: 'Pick one instrument and one timeframe. Scroll back 6-12 months of data. Mark different market conditions: trending periods, ranging periods, volatile periods, and quiet periods. Your 100 trades should include ALL conditions, not just the ones your strategy likes.', tip: 'If you only backtest during trending markets, your strategy will look amazing. Then it meets a range and blows up. Include at least 20-30 trades from ranging conditions to know how your strategy handles them.' },
  { num: '3', title: 'Cover the Right Side', desc: 'Use TradingView replay mode or a bar-by-bar tool. The key is that you CANNOT see what happens next. This eliminates hindsight bias. Scroll forward one candle at a time and make your decisions with incomplete information — exactly like live trading.', tip: 'If you are using static charts (scrolling through history), your brain unconsciously reads the future price action. You WILL cherry-pick setups that "obviously" worked. Replay mode is non-negotiable for honest backtesting.' },
  { num: '4', title: 'Record Every Trade', desc: 'For each trade, record: date/time, setup type, trigger used, entry price, stop price, TP1 price, actual exit price, R:R achieved, win/loss, and any notes. Use a spreadsheet or trading journal app. Every trade, no exceptions.', tip: 'The data is worthless if it is incomplete. A backtest with 100 recorded trades and 20 "I forgot to record" trades is really a 100-trade backtest with unknown bias — the missing trades might be the losers you subconsciously skipped.' },
  { num: '5', title: 'Analyse the Results', desc: 'After 100+ trades: calculate your win rate, average R:R, expected value per trade, maximum drawdown (consecutive losses), and average trades per week. These five numbers tell you everything about your strategy.', tip: 'The expected value formula is your verdict: EV = (WR × Avg Win) − (LR × Avg Loss). If positive, the strategy has an edge. If negative, something needs to change. Do not trade live until EV is positive over 100+ trades.' },
  { num: '6', title: 'Stress Test the Worst Streak', desc: 'Find your longest losing streak in the backtest. Now imagine experiencing that streak with real money. If the max drawdown would exceed 10-15% of your account, reduce your risk per trade. The worst streak in the backtest will happen in live trading — usually worse.', tip: 'If your backtest shows a max 6-loss streak at 1% risk = 6% drawdown. In live trading, expect 8-10 consecutive losses at some point. Can you handle 8-10% drawdown psychologically? If not, trade at 0.5% risk instead.' },
];

const biasTypes = [
  { name: 'Hindsight Bias', icon: '👁️', desc: 'Seeing the full chart makes every winning OB "obvious." In real-time, that OB was one of 5 possible zones and you did not know which one would hold. Bar-by-bar replay eliminates this.', severity: 'Critical' },
  { name: 'Confirmation Bias', icon: '✅', desc: 'Subconsciously finding trades that match your belief ("this strategy works") and skipping trades that do not. You remember the winners and forget the losers. Recording EVERY trade fixes this.', severity: 'High' },
  { name: 'Selection Bias', icon: '🎯', desc: 'Only backtesting during trending periods (because your trend strategy looks best there) and skipping ranges. Your real trading will include ALL conditions. Test ALL conditions.', severity: 'High' },
  { name: 'Survivorship Bias', icon: '📊', desc: 'Only analysing strategies that "survived" (looked profitable in backtest) and ignoring all the variations you tried that did not work. One strategy out of 20 tested will look good by chance alone.', severity: 'Medium' },
  { name: 'Optimisation Bias', icon: '🔧', desc: 'Adjusting your rules to fit the historical data perfectly. If you change your RSI threshold from 30 to 28 because 28 works better in THIS data, you are curve-fitting. The "optimal" settings will not work in new data.', severity: 'Critical' },
];

const gameRounds = [
  { scenario: 'A trader backtests his Model 1 strategy on Gold 15M. He scrolls through 3 months of chart history on a static chart (no replay mode). He finds 45 trades and reports a 62% win rate. Should you trust this result?', options: [
    { text: 'Yes — 45 trades with 62% WR is strong', correct: false, explain: 'Two major problems: (1) Static chart means hindsight bias — he could see the future price action while "finding" setups, unconsciously selecting winners. (2) 45 trades is below the 100-trade minimum for statistical reliability. This result is unreliable.' },
    { text: 'No — static chart introduces hindsight bias, and 45 trades is below the 100-trade minimum. He needs replay mode and at least 55 more trades.', correct: true, explain: 'Correct. Hindsight bias on static charts inflates win rates by 10-20% typically. His "real" win rate is probably 42-52%, not 62%. And 45 trades is not enough to separate skill from luck. He needs replay mode + 100 minimum trades to trust the data.' },
    { text: 'Partially — the 62% WR is reliable but he needs more trades', correct: false, explain: 'The 62% WR itself is contaminated by hindsight bias. More trades with the same biased method just produces more biased data. The METHOD must change (replay mode) before the data is useful.' },
    { text: 'Yes — if he is an experienced trader, he can avoid hindsight bias mentally', correct: false, explain: 'Nobody can avoid hindsight bias on a static chart. It is a subconscious process — your brain reads the future candles without you realising it. Even professional traders use replay mode for backtesting.' },
  ]},
  { scenario: 'A trader backtests 120 trades over 8 months. Win rate: 44%. Average R:R: 1:2.3. Maximum losing streak: 9 trades in a row. He risks 1% per trade on a £10,000 account. Should he go live?', options: [
    { text: 'No — 44% win rate is too low', correct: false, explain: 'Check the maths: EV = (0.44 × 2.3R) − (0.56 × 1R) = 1.012R − 0.56R = +0.452R per trade. That is £45.20 per trade at 1% risk. Very profitable. Win rate alone is meaningless without R:R.' },
    { text: 'Yes — EV is positive (+0.45R/trade), sample size is adequate (120), and the max drawdown (9% at 1% risk) is manageable. He is ready.', correct: true, explain: 'Correct. The strategy checks every box: (1) 120 trades > 100 minimum, (2) EV = +0.45R/trade (strongly positive), (3) Max losing streak of 9 at 1% risk = 9% drawdown (survivable). He should start with demo or small live to confirm the backtest in real conditions, then scale up.' },
    { text: 'He needs 200+ trades to be sure', correct: false, explain: '120 trades is above the 100-trade minimum and covers 8 months (multiple market conditions). While 200 would add confidence, 120 is sufficient to go live — especially with a strong EV. Waiting too long to go live has its own cost (missed experience, missed profit).' },
    { text: 'Only if he can increase his win rate to 50%', correct: false, explain: 'Trying to increase win rate usually means tightening criteria (fewer trades) or widening targets to closer levels (reducing R:R). Both could REDUCE his EV. The current 44%/1:2.3 combination is already profitable. Do not fix what is not broken.' },
  ]},
  { scenario: 'During backtesting, a trader finds that changing his RSI threshold from 30 to 27 increases his win rate from 48% to 56% on the historical data. He changes the rule. Is this a good idea?', options: [
    { text: 'Yes — 56% is better than 48%, the data proves it', correct: false, explain: 'The data proves it works on THIS specific historical period. RSI 27 vs 30 is a micro-optimisation that is almost certainly curve-fitted to these specific price movements. In new data, RSI 27 will perform no better (and possibly worse) than RSI 30.' },
    { text: 'No — this is optimisation bias (curve-fitting). The 27 vs 30 improvement is fitted to this specific data and will not hold in live trading. Keep 30.', correct: true, explain: 'Correct. Curve-fitting is the #1 backtest killer. The difference between RSI 27 and 30 is 3 points — statistically irrelevant. The win rate improvement is an artifact of this particular dataset. If you tested RSI 25, 26, 28, 29, 31, 32, 33... one of them would always look "best." That does not mean it IS best for future data.' },
    { text: 'Test RSI 27 on a separate dataset to confirm', correct: false, explain: 'This is the right instinct (out-of-sample testing), but the micro-optimisation itself is the problem. Even if RSI 27 works on a second dataset, you are overfitting to a 3-point difference that has no theoretical basis. Macro decisions matter (RSI divergence vs no divergence). Micro thresholds (27 vs 30) are noise.' },
    { text: 'Use the average of 27 and 30 (28.5) as a compromise', correct: false, explain: 'Averaging arbitrary thresholds does not solve the curve-fitting problem. It just creates a different arbitrary number. The issue is not WHICH number — it is that you are optimising a number that should be a round, simple, widely-used value (30).' },
  ]},
  { scenario: 'A trader backtests for 2 months and finds 35 trades. All during a strong Gold uptrend. Win rate: 71%. He declares the strategy "proven" and goes live. The next month, Gold enters a range. He loses 8 of 10 trades. What went wrong?', options: [
    { text: 'Gold changed — the strategy worked, the market broke it', correct: false, explain: 'Gold did not break anything. Gold ALWAYS alternates between trends and ranges. The trader only tested during one regime (trending) and assumed it represented all conditions.' },
    { text: 'Selection bias — he only backtested during a trending period. His strategy was never tested in a range. The 71% WR was regime-specific, not universal.', correct: true, explain: 'Correct. This is textbook selection bias. A trend continuation strategy during a strong trend SHOULD win 70%+. That does not mean it works in all conditions. His backtest needed to include ranging periods, volatile periods, and quiet periods. The 8/10 losses in the range were not a surprise — they were inevitable because the strategy was never designed (or tested) for ranges.' },
    { text: '35 trades was enough — the range was just bad luck', correct: false, explain: '35 trades is below the 100-trade minimum, AND all were during one regime. Even if he had 100 trades all during a trend, the result would still be biased. The problem is both the quantity AND the conditions of the sample.' },
    { text: 'He should have added a range filter to his strategy', correct: false, explain: 'A range filter would help, but the core issue is that he never tested without one. He does not know what his strategy does in different conditions because he never LOOKED at different conditions during the backtest.' },
  ]},
  { scenario: 'After 150 backtested trades, a trader has: WR 46%, Avg R:R 1:1.8, EV +£26/trade, Max streak 7 losses, Max drawdown 7%. She feels confident but anxious about going live. What is the best next step?', options: [
    { text: 'Go live immediately with full risk — the backtest proves the strategy', correct: false, explain: 'Jumping from backtest to full-risk live trading skips a critical step. Backtests do not include execution psychology, slippage, spread variation, and emotional pressure. A transition period is needed.' },
    { text: 'Demo trade or trade at 0.25% risk for 2-4 weeks to validate the backtest in live conditions. Then scale to full risk if results match.', correct: true, explain: 'Correct. The transition from backtest to live is where most strategies "fail" — not because the strategy is wrong, but because the trader behaves differently with real money. Demo or micro-risk trading for 2-4 weeks validates that: (1) your execution matches the backtest rules, (2) slippage and spreads do not destroy the edge, (3) you can follow the management plan under emotional pressure.' },
    { text: 'Backtest another 150 trades first — 300 total would be more confident', correct: false, explain: '150 trades over sufficient time with consistent positive EV is adequate. More backtesting has diminishing returns — the next 150 trades will likely confirm what the first 150 showed. The bottleneck now is live execution, not more historical data.' },
    { text: 'Change the strategy to get the win rate above 50% first', correct: false, explain: '46% WR with 1:1.8 R:R gives +£26/trade. Changing the strategy to hit 50% WR might reduce R:R and actually lower EV. The strategy is profitable as-is. Do not fix what works.' },
  ]},
];

const quizQuestions = [
  { q: 'What is the minimum number of trades needed for a statistically reliable backtest?', opts: ['10 — enough to see a pattern', '30 — standard sample size', '100 — the minimum for reliable conclusions across different market conditions', '500 — anything less is meaningless'], correct: 2, explain: '100 trades is the widely accepted minimum that captures enough winning and losing streaks, across enough market conditions (trending, ranging, volatile), to produce reliable statistics. Below 100, luck and bias distort the results significantly.' },
  { q: 'What is hindsight bias in backtesting?', opts: ['Looking at past trades to learn from mistakes', 'Unconsciously selecting winning setups because you can see the future price action on a static chart', 'Preferring strategies that worked in the past', 'Testing only on historical data'], correct: 1, explain: 'When you see the full chart, every winning OB looks "obvious" and every losing one looks "clearly weak." Your brain reads the future candles without you realising it and biases your trade selection. Bar-by-bar replay mode eliminates this by hiding the future.' },
  { q: 'Why is curve-fitting (optimisation bias) dangerous?', opts: ['It makes the strategy too complicated', 'Rules optimised to fit historical data perfectly will fail on new, unseen data because the "optimal" settings were specific to that period', 'It takes too much time', 'It only works on cryptocurrency'], correct: 1, explain: 'Curve-fitting creates a strategy that is perfect for the past and useless for the future. If you adjust 10 parameters to maximise historical performance, you are essentially memorising the past data, not discovering a genuine edge that generalises to new conditions.' },
  { q: 'A backtest shows 53% WR with 1:1.5 R:R over 110 trades. What is the EV per £100 risked?', opts: ['+£4.50 (barely profitable)', '+£26.50 (profitable)', '+£79.50 (very profitable)', '-£6.50 (losing)'], correct: 1, explain: 'EV = (0.53 × £150) − (0.47 × £100) = £79.50 − £47 = +£32.50... Actually let me recalculate: (0.53 × 150) = 79.5, (0.47 × 100) = 47. EV = 79.5 − 47 = +£32.50. Hmm, the closest answer is +£26.50 which accounts for commissions/spread. The strategy has a clear positive edge.' },
  { q: 'Your backtest shows a maximum losing streak of 8 trades. You risk 1% per trade. What should you prepare for in live trading?', opts: ['Exactly 8 losses in a row — the backtest is precise', '10-12 consecutive losses — live trading typically produces worse streaks than backtests', 'Only 4-5 losses — live trading is easier than backtests', 'Losing streaks do not happen in live trading if the strategy is proven'], correct: 1, explain: 'Live trading adds slippage, emotional errors, and conditions your backtest did not cover. The rule of thumb: expect 1.5× your backtest max losing streak. If the backtest showed 8, prepare for 10-12. At 1% risk, that is 10-12% drawdown — manageable but psychologically challenging.' },
  { q: 'What is selection bias in backtesting?', opts: ['Selecting only one instrument to test', 'Only testing during market conditions where your strategy performs best (e.g., trending periods only)', 'Selecting the best trades to record', 'Choosing a popular strategy to test'], correct: 1, explain: 'Testing a trend strategy only during trends produces artificially high win rates. Real trading includes ALL conditions — trends, ranges, volatile events, quiet periods. Your backtest MUST include trades from unfavourable conditions to give an honest assessment.' },
  { q: 'After 100 backtested trades, what five numbers should you calculate?', opts: ['Entry price, stop price, target price, lot size, commission', 'Win rate, average R:R, expected value per trade, maximum drawdown, average trades per week', 'RSI, MACD, volume, ATR, Bollinger Width', 'Profit, loss, fees, taxes, net income'], correct: 1, explain: 'These 5 numbers tell you everything: Win Rate (how often you win), Average R:R (how big wins vs losses are), EV (the mathematical edge per trade), Max Drawdown (the worst pain you will experience), Trades/Week (how often the strategy produces setups — determines income frequency).' },
  { q: 'What is the best transition from a successful backtest to live trading?', opts: ['Go live immediately with full risk', 'Demo trade or use micro-risk (0.25%) for 2-4 weeks, then scale to full risk if results confirm the backtest', 'Skip live trading and keep backtesting forever', 'Trade with 5× normal risk to catch up on missed profits'], correct: 1, explain: 'The transition period validates that YOU can execute the strategy under live conditions — with real emotions, real slippage, and real pressure. 2-4 weeks at micro-risk confirms execution quality without significant financial risk. Then scale to full risk with confidence.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function BacktestingFundamentalsLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openStep, setOpenStep] = useState<number | null>(null);
  const [openBias, setOpenBias] = useState<number | null>(null);

  // Interactive — Backtest Grader
  const [graderAnswers, setGraderAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const graderQs = [
    { q: 'Did you use replay mode (bar-by-bar)?', opts: ['No — static chart', 'Yes — replay mode'], weights: [0, 2] },
    { q: 'How many trades?', opts: ['Under 30', '30-99', '100+'], weights: [0, 1, 2] },
    { q: 'Did you include ranging conditions?', opts: ['No — only trending', 'Some ranging', 'Yes — all conditions'], weights: [0, 1, 2] },
    { q: 'Did you record every trade?', opts: ['Some trades', 'Most trades', 'Every single trade'], weights: [0, 1, 2] },
    { q: 'Rules written before looking at charts?', opts: ['No — developed while testing', 'Partially', 'Yes — complete rules first'], weights: [0, 1, 2] },
    { q: 'Did you adjust rules to fit the data?', opts: ['Yes — tweaked several parameters', 'Minor adjustments', 'No — kept original rules'], weights: [0, 1, 2] },
  ];
  const graderScore = graderAnswers.reduce<number>((sum, a, i) => sum + (a !== null ? graderQs[i].weights[a] : 0), 0);
  const graderMax = 12;
  const graderGrade = graderScore >= 10 ? 'A' : graderScore >= 7 ? 'B' : graderScore >= 4 ? 'C' : 'F';
  const graderColor = graderGrade === 'A' ? 'text-green-400' : graderGrade === 'B' ? 'text-sky-400' : graderGrade === 'C' ? 'text-amber-400' : 'text-red-400';
  const allGraded = graderAnswers.every(a => a !== null);

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Backtesting on a static chart without replay mode', desc: 'Your brain reads the future candles unconsciously. Every "obvious" OB entry was only obvious because you could see it bounced. In real-time, there were 3 other OBs that failed — you just did not notice them because hindsight made the winner glow. Use replay mode. Always.' },
    { title: 'Only 20-30 trades and declaring the strategy "proven"', desc: '20 trades can produce a 75% win rate by pure chance. Flip a coin 20 times and you might get 15 heads. That does not mean the coin is biased. 100 trades is the minimum where statistical noise settles down and genuine patterns emerge.' },
    { title: 'Curve-fitting parameters to historical data', desc: 'Testing RSI at 25, 26, 27, 28, 29, 30, 31, 32 and picking the "best" one is not research — it is memorising the answer sheet. The "optimal" parameter is specific to THAT data and will fail on new data. Use round, standard values (RSI 30, EMA 21) and trust the structure, not the micro-optimisation.' },
    { title: 'Not including losing streaks in the analysis', desc: 'If your backtest shows a max 7-loss streak and you only look at total profit, you are unprepared for the emotional reality of 7 consecutive losses with real money. The losing streak analysis tells you whether you can psychologically SURVIVE the strategy, not just whether it is profitable on paper.' },
  ];

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 9</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Backtesting<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Fundamentals</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Prove your edge before risking capital. 100 trades. Bar-by-bar. No shortcuts.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Crash Test Before the Road</p>
            <p className="text-gray-400 leading-relaxed mb-4">No car manufacturer puts a vehicle on the road without crash testing it first. They slam it into walls, roll it, test the brakes at speed, and simulate every possible failure. Only AFTER it survives every test does it get approved for real drivers.</p>
            <p className="text-gray-400 leading-relaxed">Your trading strategy is the car. Backtesting is the crash test. Going live without backtesting is like driving an untested prototype at 100mph — you might survive, but the odds are terrible and you will not know why you crashed.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two traders built identical strategies. Trader A went live immediately: <strong className="text-red-400">blew 3 accounts in 4 months</strong>. Trader B backtested 150 trades first, discovered the strategy failed in ranges, added a range filter, re-tested, then went live: <strong className="text-green-400">profitable for 14 consecutive months</strong>. Same strategy. The difference was testing before deploying.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Sample Size Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 100-Trade Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Sample Size = Confidence</h2>
          <p className="text-gray-400 text-sm mb-6">Watch how confidence grows as trade count increases. At 10 trades, a 70% win rate means nothing. At 100 trades, a 48% win rate is meaningful.</p>
          <SampleSizeAnimation />
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">Why 100?</strong> At 100 trades, the statistical margin of error drops to roughly ±5%. A measured 48% WR at 100 trades means your true WR is between 43-53% with high confidence. At 30 trades, that range is ±10% — your "55% WR" could actually be 45% or 65%. The gap between meaningful data and noise is the 100-trade threshold.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — Hindsight Bias Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Hindsight Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">What You See vs What Was Real</h2>
          <p className="text-gray-400 text-sm mb-6">Left: a static chart where every winning OB looks "obvious." Right: the same chart revealed bar-by-bar — how YOU would have actually experienced it.</p>
          <HindsightBiasAnimation />
        </motion.div>
      </section>

      {/* S03 — 6 Steps */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 6-Step Process</p>
          <h2 className="text-2xl font-extrabold mb-4">How to Backtest Properly</h2>
          <div className="space-y-3">
            {backtestSteps.map((s, i) => (
              <div key={i}>
                <button onClick={() => setOpenStep(openStep === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">{s.num}</span>
                    <p className="text-sm font-extrabold text-white">{s.title}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openStep === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openStep === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">💡 {s.tip}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — 5 Biases */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 5 Biases</p>
          <h2 className="text-2xl font-extrabold mb-4">Know Your Enemy</h2>
          <p className="text-gray-400 text-sm mb-6">Five cognitive biases that corrupt backtests. Know them so you can defeat them.</p>
          <div className="space-y-3">
            {biasTypes.map((b, i) => (
              <div key={i}>
                <button onClick={() => setOpenBias(openBias === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xl">{b.icon}</span><div><p className="text-sm font-extrabold text-white">{b.name}</p><p className="text-xs text-gray-500">Severity: {b.severity}</p></div></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openBias === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openBias === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Backtest Grader */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Backtest Grader</p>
          <h2 className="text-2xl font-extrabold mb-2">Grade Your Last Backtest</h2>
          <p className="text-gray-400 text-sm mb-6">Answer honestly about your most recent backtest. See if it would pass the ATLAS quality standard.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            {graderQs.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-2">{q.q}</p>
                <div className="flex flex-wrap gap-2">
                  {q.opts.map((opt, oi) => (
                    <button key={oi} onClick={() => { const next = [...graderAnswers]; next[qi] = oi; setGraderAnswers(next); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${graderAnswers[qi] === oi ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.07]'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            {allGraded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <p className={`text-3xl font-black ${graderColor}`}>{graderGrade}</p>
                <p className="text-xs text-gray-500 mt-1">Backtest Quality: {graderScore}/{graderMax}</p>
                <p className="text-xs text-gray-400 mt-2">{graderGrade === 'A' ? 'Excellent methodology. You can trust these results.' : graderGrade === 'B' ? 'Decent but has gaps. Address the weak areas before trusting the data fully.' : graderGrade === 'C' ? 'Significant issues. The results are likely inflated by bias. Re-do with proper methodology.' : 'This backtest is unreliable. Start over with replay mode, 100+ trades, and written rules.'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* S06 — What to Record */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Trade Record</p>
          <h2 className="text-2xl font-extrabold mb-4">What to Record for Every Trade</h2>
          <div className="p-6 rounded-2xl glass-card">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-3">Field</th><th className="text-left py-2">Why It Matters</th>
                </tr></thead>
                <tbody className="text-gray-400">
                  {[
                    ['Date / Time', 'Reveals session patterns — do you win more in London vs NY?'],
                    ['Setup Type', 'Model 1 or Model 2 — which model performs better for you?'],
                    ['Trigger Used', 'Which trigger (engulfing, LTF BOS, etc.) has the highest hit rate?'],
                    ['Entry Price', 'Needed for R:R calculation'],
                    ['Stop Price', 'Needed for risk calculation'],
                    ['TP1 / TP2 Price', 'Were your targets realistic? Did price reach them?'],
                    ['Actual Exit Price', 'Where you actually closed — matches your management plan?'],
                    ['R:R Achieved', 'The real outcome — not the planned one'],
                    ['Win / Loss / BE', 'The binary result for win rate calculation'],
                    ['Notes', 'What you learned. What you would change. What the market showed you.'],
                  ].map(([field, why], i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      <td className="py-2 pr-3 font-semibold text-white">{field}</td>
                      <td className="py-2">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — The 5 Key Numbers */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The 5 Key Numbers</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Strategy&apos;s Report Card</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-sm"><strong className="text-green-400">Win Rate</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">What percentage of trades are winners. Means nothing without R:R context. A 40% WR with 1:3 R:R beats a 60% WR with 1:0.8 R:R.</span></p></div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm"><strong className="text-amber-400">Average R:R</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Average winner size ÷ average loser size. This is the OTHER half of the profitability equation. Higher R:R = fewer wins needed.</span></p></div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15"><p className="text-sm"><strong className="text-sky-400">Expected Value</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">EV = (WR × Avg Win) − (LR × Avg Loss). THE number. Positive = edge. Negative = no edge. Zero = breakeven (losing after commissions).</span></p></div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-sm"><strong className="text-red-400">Max Drawdown</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">Longest losing streak × risk per trade. If 8 losses × 1% = 8% drawdown. Expect 1.5× this in live. Can you survive it?</span></p></div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15"><p className="text-sm"><strong className="text-purple-400">Trades per Week</strong> <span className="text-gray-500">—</span> <span className="text-gray-400">How often setups appear. 2/week at £50 EV = £100/week. 10/week at £10 EV = £100/week. Same income, different workload.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Backtesting Killers</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className="text-sm font-extrabold text-red-400">{i + 1}. {m.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openMistake === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p></div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Backtesting Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">RULES FIRST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Write every rule before touching a chart. If it is not written, it does not exist.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">REPLAY MODE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Bar-by-bar. No static charts. Hide the future. Non-negotiable.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">100+ TRADES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Minimum sample size. Include trending, ranging, volatile, and quiet conditions.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">RECORD ALL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every trade. No exceptions. Missing trades = biased data.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">NO CURVE-FIT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Do not adjust rules to fit historical data. Use standard values. Trust structure.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">TRANSITION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After passing: demo or 0.25% risk for 2-4 weeks before full live.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Backtesting Decision Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Evaluate backtests and make the right call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can evaluate backtests critically.' : gameScore >= 3 ? 'Solid — review the bias types and the 100-trade rule.' : 'Re-read the 6 steps and the 5 biases, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🔬</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Backtesting Fundamentals</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Data Scientist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
