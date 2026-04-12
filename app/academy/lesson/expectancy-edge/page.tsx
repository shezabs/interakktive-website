// app/academy/lesson/expectancy-edge/page.tsx
// ATLAS Academy — Lesson 6.10: Expectancy & Edge [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 6
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: EV Formula — visual breakdown
// Two scales: wins side vs losses side, tipping toward profit
// ============================================================
function EVScaleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;
    const pivotY = h * 0.45;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Expected Value = The Balance of Wins vs Losses', mid, 14);

    // Cycle through 3 scenarios
    const scenario = Math.floor(t * 0.3) % 3;
    const scenarios = [
      { wr: 55, rr: 1.0, label: '55% WR × 1:1 R:R', ev: '+£10', tilt: -3, color: '#34d399' },
      { wr: 42, rr: 2.5, label: '42% WR × 1:2.5 R:R', ev: '+£47', tilt: -8, color: '#34d399' },
      { wr: 60, rr: 0.7, label: '60% WR × 1:0.7 R:R', ev: '-£18', tilt: 5, color: '#ef4444' },
    ];
    const s = scenarios[scenario];
    const tiltAngle = (s.tilt * Math.PI) / 180;

    // Pivot point
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(mid - 6, pivotY + 8); ctx.lineTo(mid + 6, pivotY + 8); ctx.lineTo(mid, pivotY - 2); ctx.fill();

    // Beam
    const beamLen = w * 0.35;
    const lx = mid - beamLen * Math.cos(tiltAngle);
    const ly = pivotY - beamLen * Math.sin(tiltAngle);
    const rx = mid + beamLen * Math.cos(tiltAngle);
    const ry = pivotY + beamLen * Math.sin(tiltAngle);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();

    // Left pan — WINS
    const panW = 70;
    const panH = 50;
    ctx.fillStyle = 'rgba(52,211,153,0.1)';
    ctx.beginPath(); ctx.roundRect(lx - panW / 2, ly + 5, panW, panH, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(52,211,153,0.3)'; ctx.lineWidth = 1; ctx.stroke();

    const winAmt = s.wr * s.rr;
    ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('WINS', lx, ly + 22);
    ctx.font = '9px system-ui'; ctx.fillStyle = 'rgba(52,211,153,0.7)';
    ctx.fillText(`${s.wr}% × ${s.rr}R`, lx, ly + 36);
    ctx.fillText(`= ${winAmt.toFixed(1)}R`, lx, ly + 48);

    // Right pan — LOSSES
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    ctx.beginPath(); ctx.roundRect(rx - panW / 2, ry + 5, panW, panH, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 1; ctx.stroke();

    const lossAmt = (100 - s.wr) * 1;
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('LOSSES', rx, ry + 22);
    ctx.font = '9px system-ui'; ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.fillText(`${100 - s.wr}% × 1R`, rx, ry + 36);
    ctx.fillText(`= ${lossAmt.toFixed(1)}R`, rx, ry + 48);

    // Scenario label
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(s.label, mid, 32);

    // EV result
    ctx.fillStyle = s.color; ctx.font = 'bold 18px system-ui';
    ctx.fillText(`EV = ${s.ev}/trade`, mid, h - 35);

    const verdict = s.tilt < 0 ? 'PROFITABLE — wins outweigh losses' : 'LOSING — losses outweigh wins';
    ctx.fillStyle = `${s.color}88`; ctx.font = '10px system-ui';
    ctx.fillText(verdict, mid, h - 18);

    // Dots
    scenarios.forEach((_, i) => {
      ctx.beginPath(); ctx.arc(mid - 20 + i * 20, h - 6, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === scenario ? scenarios[i].color : 'rgba(255,255,255,0.1)'; ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 2: Edge Erosion — how commissions/slippage eat edge
// Bar chart showing gross EV → commissions → slippage → net EV
// ============================================================
function EdgeErosionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const mid = w / 2;
    const top = 45;
    const bot = h - 45;
    const barArea = bot - top;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Edge Erosion — What Eats Your Profit', mid, 14);

    const items = [
      { label: 'Gross EV', value: 50, color: '#34d399' },
      { label: 'After Spread', value: 42, color: '#22d3ee' },
      { label: 'After Commission', value: 36, color: '#f59e0b' },
      { label: 'After Slippage', value: 31, color: '#f97316' },
      { label: 'After Mistakes', value: 22, color: '#ef4444' },
    ];

    const maxVal = 60;
    const barW = 50;
    const totalW = items.length * (barW + 15) - 15;
    const startX = (w - totalW) / 2;

    const reveal = Math.min(items.length, Math.floor((t % 4) * 1.5));

    items.forEach((item, i) => {
      if (i > reveal) return;
      const x = startX + i * (barW + 15);
      const barH = (item.value / maxVal) * barArea;
      const y = bot - barH;

      // Bar
      ctx.fillStyle = `${item.color}22`;
      ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.fill();
      ctx.strokeStyle = `${item.color}66`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y, barW, barH, 4); ctx.stroke();

      // Fill (animated)
      const fillH = barH * Math.min(1, (t % 4 - i * 0.3) * 2);
      if (fillH > 0) {
        ctx.fillStyle = `${item.color}44`;
        ctx.beginPath(); ctx.roundRect(x, bot - fillH, barW, fillH, 4); ctx.fill();
      }

      // Value
      ctx.fillStyle = item.color; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`£${item.value}`, x + barW / 2, y - 6);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px system-ui';
      ctx.fillText(item.label, x + barW / 2, bot + 12);

      // Erosion arrow
      if (i > 0 && i <= reveal) {
        const diff = items[i - 1].value - item.value;
        const ax = x - 7;
        ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '8px system-ui';
        ctx.fillText(`-£${diff}`, ax, y + barH / 2);
      }
    });

    // Bottom note
    if (reveal >= 4) {
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('£50 gross edge → £22 net edge. 56% of your edge gets eaten.', mid, bot + 30);
    }
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// DATA
// ============================================================
const edgeComponents = [
  { icon: '🎯', title: 'Win Rate (WR)', desc: 'The percentage of trades that close in profit. A 48% WR means you win 48 out of every 100 trades. By itself, WR tells you NOTHING about profitability — a 70% WR with 1:0.3 R:R loses money.', formula: 'WR = Winning Trades ÷ Total Trades × 100' },
  { icon: '📏', title: 'Risk:Reward (R:R)', desc: 'The average size of your winners divided by the average size of your losers. A 1:2 R:R means each win is twice the size of each loss. By itself, R:R tells you NOTHING — a 1:10 R:R with 5% WR loses money.', formula: 'R:R = Average Winner ÷ Average Loser' },
  { icon: '⚖️', title: 'Expected Value (EV)', desc: 'The COMBINATION of WR and R:R that tells you whether you have an edge. EV is the average amount you make (or lose) per trade over a large sample. Positive EV = edge. Negative EV = no edge. THIS is the only number that matters.', formula: 'EV = (WR × Avg Win) − (LR × Avg Loss)' },
  { icon: '💀', title: 'Edge Erosion', desc: 'Your gross EV gets reduced by 4 real-world costs: spread (the bid-ask gap on every trade), commission (broker fees), slippage (fills worse than expected in fast markets), and execution mistakes (entering late, exiting early, skipping management). A £50 gross edge can become £20 net edge.', formula: 'Net EV = Gross EV − Spread − Commission − Slippage − Mistakes' },
];

const breakEvenTable = [
  { rr: '1:0.5', beWR: '67%', verdict: 'Very hard — need to win 2 of every 3 trades' },
  { rr: '1:1', beWR: '50%', verdict: 'Coin flip territory — commissions push you negative' },
  { rr: '1:1.5', beWR: '40%', verdict: 'Achievable — this is the minimum viable R:R' },
  { rr: '1:2', beWR: '33%', verdict: 'Comfortable — miss 2 of 3 and still break even' },
  { rr: '1:3', beWR: '25%', verdict: 'Strong edge territory — 1 in 4 wins covers everything' },
  { rr: '1:5', beWR: '17%', verdict: 'Reversal territory — 1 in 6 wins still profitable' },
];

const gameRounds = [
  { scenario: 'Trader A: 62% WR, average win £80, average loss £120. Trader B: 41% WR, average win £280, average loss £90. Who is more profitable per 100 trades?', options: [
    { text: 'Trader A — higher win rate means more money', correct: false, explain: 'Trader A EV = (0.62 × £80) − (0.38 × £120) = £49.60 − £45.60 = +£4 per trade. Over 100 trades = +£400. Trader B EV = (0.41 × £280) − (0.59 × £90) = £114.80 − £53.10 = +£61.70 per trade. Over 100 trades = +£6,170. Trader B makes 15× more money despite winning less than half the time.' },
    { text: 'Trader B — the R:R compensates massively for the lower win rate, producing +£61.70/trade vs Trader A\'s +£4/trade', correct: true, explain: 'Correct. Trader A: EV = +£4/trade (barely profitable). Trader B: EV = +£61.70/trade (extremely profitable). Win rate is HALF the equation. The SIZE of wins vs losses is the other half — and in this case, Trader B\'s 3:1 R:R crushes Trader A\'s 0.67:1 R:R despite A winning more often.' },
    { text: 'They are roughly equal — the differences cancel out', correct: false, explain: 'Not even close. +£4 vs +£61.70 per trade is a 15× difference. The R:R gap overwhelms the WR gap. Trader A barely survives after commissions. Trader B thrives.' },
    { text: 'Neither — both are losing money', correct: false, explain: 'Both have positive EV. But the difference in magnitude is what matters — Trader B\'s edge is 15× stronger than Trader A\'s.' },
  ]},
  { scenario: 'A trader\'s backtest shows: 50% WR, 1:1.5 R:R, EV = +£25/trade. He goes live and after 80 trades his live results show: 46% WR, 1:1.3 R:R, EV = +£10/trade. What happened to his edge?', options: [
    { text: 'The strategy stopped working — he should switch strategies', correct: false, explain: 'The strategy still has positive EV (+£10/trade). It did not "stop working." The edge was ERODED by real-world costs that backtests do not capture.' },
    { text: 'Edge erosion — spread, commissions, slippage, and execution mistakes reduced his gross edge by 60%. The strategy works but the net edge is smaller than the backtest suggested.', correct: true, explain: 'Correct. The 4% WR drop and 0.2 R:R drop are typical real-world erosion. Backtests do not account for: (1) spread eating into tight stops, (2) commissions on every trade, (3) slippage on fast entries, (4) emotional mistakes (closing early, entering late). A 60% erosion from backtest to live is common. The strategy is STILL profitable — the edge is just smaller than on paper.' },
    { text: 'He needs more trades — 80 is not enough to judge', correct: false, explain: '80 trades is meaningful enough to see the erosion pattern, especially since the DIRECTION of all metrics moved against him (WR down, R:R down). More trades will likely confirm the erosion, not reverse it.' },
    { text: 'He should increase his position size to compensate for the lower edge', correct: false, explain: 'Increasing position size to compensate for a WEAKER edge is the opposite of what you should do. If anything, the lower net EV means you should be MORE conservative with sizing until the live results stabilise.' },
  ]},
  { scenario: 'A strategy has +£30 EV per trade. The trader takes 15 trades per month. His monthly income should be £450. But last month he only made £180. He took 15 trades. What likely happened?', options: [
    { text: 'The EV calculation is wrong', correct: false, explain: 'EV is an AVERAGE over hundreds of trades, not a guarantee per month. 15 trades is a small sample — variance is high.' },
    { text: 'Normal variance — EV is the long-term average, not a monthly guarantee. 15 trades per month has huge variance. Some months will be +£900, some will be +£180, some might be -£200. This is mathematically normal.', correct: true, explain: 'Correct. EV = +£30 means OVER TIME you earn £30/trade on average. In any given 15-trade sample, the actual result can vary wildly. This is called variance — the natural noise around the mean. At 15 trades/month, you need 6-12 months before the average converges on the true EV. One below-average month is not a signal that anything is broken.' },
    { text: 'He should take more trades per month to hit £450', correct: false, explain: 'Taking more trades only works if additional setups EXIST that meet his criteria. Forcing trades to hit a monthly target is how strategies get corrupted — he starts taking lower-quality setups just for volume.' },
    { text: 'The strategy has degraded and needs updating', correct: false, explain: 'One below-average month out of a +EV strategy is noise, not degradation. If 3-4 consecutive months are consistently below expectation, THEN investigate. One month means nothing.' },
  ]},
  { scenario: 'A trader discovers his strategy has a breakeven WR of 33% (1:2 R:R). His actual WR is 38%. He says "I only need to win 33% so my 38% gives me a 5% edge." Is this analysis complete?', options: [
    { text: 'Yes — 5% above breakeven is a solid edge', correct: false, explain: 'The 5% buffer BEFORE costs might be eaten entirely by commissions, spread, and slippage. The real question is whether 38% WR survives AFTER real-world costs.' },
    { text: 'No — he has not accounted for edge erosion. Spread, commissions, and slippage could reduce his effective WR or R:R enough to push him below the 33% breakeven. He needs to calculate NET EV, not just gross EV.', correct: true, explain: 'Correct. A 5% buffer above breakeven sounds comfortable, but typical edge erosion is 3-8% of WR equivalent. If commissions + spread effectively reduce his WR from 38% to 34%, his "5% edge" is now a 1% edge — barely surviving. He needs to factor in ALL costs and calculate the NET expected value, not the theoretical one.' },
    { text: 'Yes but he should aim for 50% WR to be safe', correct: false, explain: 'At 1:2 R:R, 50% WR would give a very strong edge — but it may not be achievable with his setup criteria. The issue is not his target WR; it is whether he has accounted for the real costs that erode the existing edge.' },
    { text: 'The breakeven WR does not matter — only total profit matters', correct: false, explain: 'The breakeven WR is critical because it tells you HOW CLOSE to failure your strategy operates. A strategy running at 38% vs 33% breakeven has a thin margin. Understanding that margin and what erodes it is essential for survival.' },
  ]},
  { scenario: 'Two strategies on your backtest results: Strategy A: EV = +£55/trade, 3 trades/week. Strategy B: EV = +£18/trade, 12 trades/week. Which generates more income?', options: [
    { text: 'Strategy A — higher EV per trade', correct: false, explain: 'Strategy A: £55 × 3 = £165/week. Strategy B: £18 × 12 = £216/week. Strategy B generates 31% more weekly income despite lower per-trade EV.' },
    { text: 'Strategy B — £18 × 12 trades = £216/week beats Strategy A\'s £55 × 3 = £165/week. Trade frequency × EV = income.', correct: true, explain: 'Correct. Income = EV per trade × Trades per period. A lower EV with higher frequency can outperform a higher EV with lower frequency. This is why "trades per week" is one of the 5 key backtest numbers — it determines how quickly your edge compounds into actual money.' },
    { text: 'They are about equal', correct: false, explain: '£165/week vs £216/week is a 31% difference — not equal. And over a year, that gap compounds: Strategy A = £8,580 vs Strategy B = £11,232.' },
    { text: 'Strategy A because fewer trades means less risk', correct: false, explain: 'Fewer trades does not mean less risk. Both strategies risk the same per trade (the risk % is independent of frequency). More trades with positive EV actually REDUCES variance because you reach the statistical average faster.' },
  ]},
];

const quizQuestions = [
  { q: 'What does a positive Expected Value (EV) mean?', opts: ['You win every trade', 'On average, each trade contributes profit over a large sample — you have a mathematical edge', 'Your win rate is above 50%', 'Your R:R is above 1:1'], correct: 1, explain: 'Positive EV means that over hundreds of trades, the money you make from winners exceeds the money you lose from losers. You will still have losing trades, losing days, and losing weeks — but the AVERAGE across the full sample is positive. That average IS your edge.' },
  { q: 'A strategy has 45% WR and 1:2 R:R. What is the EV per £100 risked?', opts: ['-£10 (losing)', '+£5 (barely profitable)', '+£35 (profitable)', '+£90 (very profitable)'], correct: 2, explain: 'EV = (0.45 × £200) − (0.55 × £100) = £90 − £55 = +£35 per trade. At 45% WR, you lose more often than you win — but each win is twice the size of each loss, more than compensating.' },
  { q: 'What is the breakeven win rate for a strategy with 1:3 R:R?', opts: ['50%', '33%', '25%', '10%'], correct: 2, explain: 'Breakeven WR = 1 ÷ (1 + R:R) = 1 ÷ (1 + 3) = 25%. At 1:3 R:R, you only need to win 1 out of every 4 trades to break even. Any WR above 25% is profitable. This is why high-R:R strategies (Model 2 reversals) can be very profitable despite low win rates.' },
  { q: 'What are the 4 sources of "edge erosion" that reduce backtest EV in live trading?', opts: ['Bad entries, bad exits, bad timing, bad luck', 'Spread, commissions, slippage, and execution mistakes', 'Taxes, broker fees, platform costs, internet speed', 'News events, market crashes, flash crashes, halts'], correct: 1, explain: 'Spread (bid-ask gap), commissions (broker fees), slippage (fills at worse prices in fast markets), and execution mistakes (emotional errors like closing early or entering late). These 4 costs typically reduce backtest EV by 30-60% in live trading.' },
  { q: 'Strategy A: EV +£40/trade, 4 trades/week. Strategy B: EV +£15/trade, 14 trades/week. Which earns more per week?', opts: ['Strategy A (£160/week)', 'Strategy B (£210/week)', 'They are equal', 'Cannot determine without more data'], correct: 1, explain: 'A: £40 × 4 = £160/week. B: £15 × 14 = £210/week. Strategy B earns 31% more. Weekly income = EV × frequency. A low-EV, high-frequency strategy can outperform a high-EV, low-frequency one. Both are valid — the choice depends on your lifestyle and screen time.' },
  { q: 'A trader has a 60% WR with 1:0.7 R:R. Is this strategy profitable?', opts: ['Yes — 60% WR is great', 'No — EV = (0.60 × £70) − (0.40 × £100) = £42 − £40 = +£2. Barely surviving. After commissions, likely negative.', 'Yes — any WR above 50% is profitable', 'Cannot tell without more data'], correct: 1, explain: 'EV = +£2 per trade. That is a razor-thin edge that will be erased by commissions (~£3-5/trade on most brokers). This strategy LOOKS profitable because of the high WR, but the tiny R:R means each win does not cover enough losses. The trader is working hard for nothing.' },
  { q: 'Why is a 70% win rate with 1:0.5 R:R worse than a 40% win rate with 1:3 R:R?', opts: ['It is not — 70% is always better', 'Because the 40%/1:3 strategy makes +£62/trade vs the 70%/1:0.5 strategy making only +£0/trade (breakeven)', 'Because win rate does not matter at all', 'Because 1:3 takes less time'], correct: 1, explain: '70% WR × 1:0.5: EV = (0.70 × £50) − (0.30 × £100) = £35 − £30 = +£5 (barely alive after costs). 40% WR × 1:3: EV = (0.40 × £300) − (0.60 × £100) = £120 − £60 = +£60. The 40% strategy makes 12× more money despite winning less than half the time. R:R is the multiplier that makes WR meaningful.' },
  { q: 'Your strategy has +£25 EV per trade. Last month (18 trades), you made +£120 instead of the expected £450. Should you change the strategy?', opts: ['Yes — it underperformed by 73%', 'No — this is normal variance. 18 trades is too small a sample for EV to converge. Give it 3-6 months of consistent data.', 'Yes — reduce your position size immediately', 'Run another backtest to verify'], correct: 1, explain: 'EV converges over HUNDREDS of trades, not 18. A single below-average month (or even 2-3) is mathematically expected. At 18 trades/month, you need 6+ months (100+ live trades) before the average stabilises around the true EV. One bad month is noise, not signal.' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

export default function ExpectancyEdgeLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openComp, setOpenComp] = useState<number | null>(null);

  // Interactive — Edge Calculator with erosion
  const [calcWR, setCalcWR] = useState('48');
  const [calcAvgWin, setCalcAvgWin] = useState('220');
  const [calcAvgLoss, setCalcAvgLoss] = useState('100');
  const [calcSpread, setCalcSpread] = useState('5');
  const [calcComm, setCalcComm] = useState('3');
  const [calcSlippage, setCalcSlippage] = useState('2');
  const [calcMistakes, setCalcMistakes] = useState('5');
  const [calcFreq, setCalcFreq] = useState('8');

  const wr = parseFloat(calcWR) / 100 || 0;
  const avgWin = parseFloat(calcAvgWin) || 0;
  const avgLoss = parseFloat(calcAvgLoss) || 0;
  const spread = parseFloat(calcSpread) || 0;
  const comm = parseFloat(calcComm) || 0;
  const slip = parseFloat(calcSlippage) || 0;
  const mistakePct = parseFloat(calcMistakes) / 100 || 0;
  const freq = parseFloat(calcFreq) || 0;

  const grossEV = (wr * avgWin) - ((1 - wr) * avgLoss);
  const costPerTrade = spread + comm + slip;
  const afterCosts = grossEV - costPerTrade;
  const afterMistakes = afterCosts * (1 - mistakePct);
  const weeklyIncome = afterMistakes * freq;
  const monthlyIncome = weeklyIncome * 4.33;
  const rr = avgLoss > 0 ? avgWin / avgLoss : 0;
  const beWR = rr > 0 ? (1 / (1 + rr)) * 100 : 0;

  // Mistakes
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const mistakes = [
    { title: 'Obsessing over win rate and ignoring R:R', desc: 'A 70% WR with 1:0.5 R:R makes +£5/trade (dead after commissions). A 40% WR with 1:3 R:R makes +£60/trade. The trader with the "worse" win rate makes 12× more money. Stop chasing win rate. Chase EV.' },
    { title: 'Not accounting for edge erosion in projections', desc: 'A backtest showing +£50/trade does NOT mean you will make £50 per live trade. After spread, commissions, slippage, and mistakes, you might net +£20-25. Planning your income around gross EV leads to disappointment and dangerous risk decisions.' },
    { title: 'Changing strategy after a bad month', desc: 'One month of below-average results is normal variance. At 15 trades/month, you need 6+ months for EV to converge. Changing strategies after one bad month means you never reach the sample size where your edge materialises. Stick with positive-EV strategies through the noise.' },
    { title: 'Confusing EV with guaranteed monthly income', desc: 'EV = +£30/trade does not mean every trade makes £30. Some make +£200, some make -£100. The AVERAGE over hundreds of trades is +£30. In any given month, you might make £500 or lose £200. Both are normal. The guarantee only exists over the long term.' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 6 &middot; Lesson 10</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Expectancy<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>&amp; Edge</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The only number that determines whether you make money or lose it. Everything else is noise.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Casino&apos;s Secret</p>
            <p className="text-gray-400 leading-relaxed mb-4">A casino does not know if the next hand will win or lose. It does not care. It knows that across thousands of hands, the house edge of 1-5% guarantees profit. The casino does not gamble &mdash; it operates a mathematical system. Expected Value is positive, volume is high, and time does the rest.</p>
            <p className="text-gray-400 leading-relaxed">Your trading strategy works identically. You do not need to know if the NEXT trade will win. You need to know that across 100+ trades, your Expected Value is positive. If it is, you are the casino. If it is not, you are the gambler. This lesson teaches you how to calculate, measure, and protect your edge.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader was losing money with a <strong className="text-red-400">58% win rate</strong>. His wins averaged £75, his losses averaged £130. EV = (0.58 × £75) − (0.42 × £130) = £43.50 − £54.60 = <strong className="text-red-400">−£11.10 per trade</strong>. He was winning MORE often but losing MORE per loss. The fix: tighter stops (smaller losses) + wider targets (bigger wins). New stats: 49% WR, £160 avg win, £100 avg loss. EV = <strong className="text-green-400">+£27.40/trade</strong>. Lower win rate, higher profit.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — EV Scale Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The EV Balance</p>
          <h2 className="text-2xl font-extrabold mb-4">Wins vs Losses on the Scale</h2>
          <p className="text-gray-400 text-sm mb-6">Watch the scale tip. When wins outweigh losses (positive EV), you are the casino. When losses outweigh wins, you are the gambler.</p>
          <EVScaleAnimation />
        </motion.div>
      </section>

      {/* S02 — Edge Erosion Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Edge Erosion</p>
          <h2 className="text-2xl font-extrabold mb-4">What Eats Your Profit</h2>
          <p className="text-gray-400 text-sm mb-6">Your gross edge gets taxed at every step. See how a £50 edge becomes £22 after real-world costs.</p>
          <EdgeErosionAnimation />
        </motion.div>
      </section>

      {/* S03 — 4 Components */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Components</p>
          <h2 className="text-2xl font-extrabold mb-4">What Makes an Edge</h2>
          <div className="space-y-3">
            {edgeComponents.map((c, i) => (
              <div key={i}>
                <button onClick={() => setOpenComp(openComp === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-xl">{c.icon}</span><p className="text-sm font-extrabold text-white">{c.title}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openComp === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openComp === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05] space-y-3">
                      <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400 font-mono">{c.formula}</p></div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Breakeven WR Table */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Breakeven Win Rates</p>
          <h2 className="text-2xl font-extrabold mb-4">How R:R Changes the Game</h2>
          <div className="p-4 rounded-2xl glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-white/[0.06]">
                <th className="text-left py-2 pr-3">R:R</th><th className="text-left py-2 pr-3">Breakeven WR</th><th className="text-left py-2">Verdict</th>
              </tr></thead>
              <tbody className="text-gray-400">
                {breakEvenTable.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-3 font-semibold text-white">{r.rr}</td>
                    <td className={`py-2 pr-3 font-bold ${i >= 2 ? 'text-green-400' : i === 1 ? 'text-amber-400' : 'text-red-400'}`}>{r.beWR}</td>
                    <td className="py-2">{r.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-sky-400">The formula:</strong> Breakeven WR = 1 ÷ (1 + R:R). At 1:2, you need 33%. At 1:3, you need 25%. At 1:5, you need 17%. The higher your R:R, the less you need to win. This is why Model 2 (reversals at 1:3-5) works despite low win rates.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Edge Calculator with Erosion */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Edge Calculator</p>
          <h2 className="text-2xl font-extrabold mb-2">Calculate Your Real Edge</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your stats. See gross EV, edge erosion, and net income.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-gray-500 mb-1">Win Rate (%)</p><input type="number" value={calcWR} onChange={e => setCalcWR(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Avg Win (£)</p><input type="number" value={calcAvgWin} onChange={e => setCalcAvgWin(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Avg Loss (£)</p><input type="number" value={calcAvgLoss} onChange={e => setCalcAvgLoss(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-xs text-gray-500 mb-1">Trades / Week</p><input type="number" value={calcFreq} onChange={e => setCalcFreq(e.target.value)} className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-amber-500/30 outline-none" /></div>
            </div>
            <p className="text-xs text-gray-500 font-bold mt-2">Edge Erosion Costs (per trade):</p>
            <div className="grid grid-cols-4 gap-2">
              <div><p className="text-[10px] text-gray-600 mb-1">Spread (£)</p><input type="number" value={calcSpread} onChange={e => setCalcSpread(e.target.value)} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-[10px] text-gray-600 mb-1">Commission (£)</p><input type="number" value={calcComm} onChange={e => setCalcComm(e.target.value)} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-[10px] text-gray-600 mb-1">Slippage (£)</p><input type="number" value={calcSlippage} onChange={e => setCalcSlippage(e.target.value)} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-amber-500/30 outline-none" /></div>
              <div><p className="text-[10px] text-gray-600 mb-1">Mistakes (%)</p><input type="number" value={calcMistakes} onChange={e => setCalcMistakes(e.target.value)} className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:border-amber-500/30 outline-none" /></div>
            </div>

            <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">R:R</p><p className="text-sm font-bold text-white">1:{rr.toFixed(1)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">BE Win Rate</p><p className="text-sm font-bold text-amber-400">{beWR.toFixed(0)}%</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Gross EV</p><p className={`text-sm font-bold ${grossEV >= 0 ? 'text-green-400' : 'text-red-400'}`}>{grossEV >= 0 ? '+' : ''}£{grossEV.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Net EV</p><p className={`text-sm font-bold ${afterMistakes >= 0 ? 'text-green-400' : 'text-red-400'}`}>{afterMistakes >= 0 ? '+' : ''}£{afterMistakes.toFixed(0)}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Weekly Income</p><p className={`text-sm font-bold ${weeklyIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>{weeklyIncome >= 0 ? '+' : ''}£{weeklyIncome.toFixed(0)}</p></div>
                <div className="p-3 rounded-lg bg-white/[0.03] text-center"><p className="text-[10px] text-gray-500 uppercase">Monthly Income</p><p className={`text-sm font-bold ${monthlyIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>{monthlyIncome >= 0 ? '+' : ''}£{monthlyIncome.toFixed(0)}</p></div>
              </div>
              {grossEV > 0 && afterMistakes > 0 && (
                <p className="text-xs text-gray-400 text-center">Edge erosion: £{(grossEV - afterMistakes).toFixed(0)} lost per trade ({((1 - afterMistakes / grossEV) * 100).toFixed(0)}% of gross edge)</p>
              )}
              {grossEV > 0 && afterMistakes <= 0 && (
                <p className="text-xs text-red-400 text-center">Warning: your gross edge is positive but erosion kills it. Reduce costs or increase R:R.</p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — The Income Equation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Income Equation</p>
          <h2 className="text-2xl font-extrabold mb-4">Income = EV &times; Frequency</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-lg font-mono font-bold text-amber-400">Weekly Income = Net EV &times; Trades per Week</p>
            </div>
            <p className="text-gray-400 leading-relaxed">Two levers control your trading income: how much you make per trade (EV) and how often you trade (frequency). You can optimise either one — but never sacrifice EV for frequency (forcing low-quality trades to increase volume).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-sm font-extrabold text-green-400 mb-2">High EV, Low Frequency</p>
                <p className="text-xs text-gray-400">+£50/trade &times; 3/week = £150/week. Selective, high-quality setups. Less screen time. Better for part-time traders.</p>
              </div>
              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
                <p className="text-sm font-extrabold text-sky-400 mb-2">Lower EV, High Frequency</p>
                <p className="text-xs text-gray-400">+£15/trade &times; 12/week = £180/week. More setups, smaller edge each. More screen time. Better for full-time traders.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Variance */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Variance: The Noise Around the Edge</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Good Strategies Have Bad Months</h2>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <p className="text-gray-400 leading-relaxed">EV is a long-term average, not a per-trade guarantee. In any small sample (one day, one week, one month), actual results bounce around the EV like a ball on a trampoline. This bouncing is variance.</p>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-purple-400">The Coin Flip Analogy:</strong> A fair coin has 50% heads EV. But if you flip it 10 times, getting 7 heads and 3 tails is completely normal — even though 50% would predict 5/5. At 1,000 flips, the ratio will be very close to 50/50. Trading is the same: at 10 trades, anything can happen. At 200 trades, the average converges on the true EV.</p>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-white">10 trades:</strong> Wildly unpredictable. A +EV strategy can easily lose money. Tells you nothing.</p></div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-white">50 trades:</strong> Pattern emerging but still noisy. Might be +£800 or -£200 on a +£25 EV strategy.</p></div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm text-gray-400"><strong className="text-white">200 trades:</strong> The average is converging. You can trust the numbers. Variance is smoothing out.</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Edge Killers</h2>
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
          <h2 className="text-2xl font-extrabold mb-4">Expectancy Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">EV FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">(WR &times; Avg Win) &minus; (LR &times; Avg Loss). Positive = edge. Negative = no edge.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">BE FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Breakeven WR = 1 &divide; (1 + R:R). At 1:2, need 33%. At 1:3, need 25%.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">INCOME</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Net EV &times; Trades per week. Two levers: EV size and frequency.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">EROSION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Spread + Commission + Slippage + Mistakes. Expect 30-60% erosion from backtest to live.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">VARIANCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Bad months are normal. EV converges over 200+ trades. Trust the maths, not the month.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Expectancy Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Calculate, compare, and decide.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you think in expected value, not win rate.' : gameScore >= 3 ? 'Solid — review the erosion and variance sections.' : 'Re-read the EV formula and breakeven table, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30">⚖️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 6: Expectancy &amp; Edge</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-green-400 via-purple-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Edge Master &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L6.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
