// app/academy/lesson/execution-gap/page.tsx
// ATLAS Academy — Lesson 7.1: The Execution Gap [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Backtest vs Live — side-by-side equity curves
// showing the gap between paper results and live execution
// ============================================================
function BacktestVsLiveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const pad = 30;
    const top = 45;
    const bot = h - 30;
    const midX = w / 2;
    const progress = Math.min(1, (t % 5) / 4);
    const seed = (n: number) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5;
    const totalBars = 100;
    const visBars = Math.floor(progress * totalBars);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Backtest Equity', midX / 2, 14);
    ctx.fillText('Live Equity — Same Strategy', midX + midX / 2, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(midX, top - 10); ctx.lineTo(midX, bot + 10); ctx.stroke();
    ctx.setLineDash([]);

    // Backtest curve — smooth, profitable
    ctx.beginPath();
    let btBal = 10000;
    const btBals: number[] = [];
    for (let i = 0; i <= visBars; i++) {
      const win = seed(i * 7) < 0.52;
      btBal += win ? 220 : -100;
      btBals.push(btBal);
      const px = pad + (i / totalBars) * (midX - pad * 2);
      const py = bot - ((btBal - 8000) / 8000) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.stroke();

    // Live curve — same seed but with execution erosion
    ctx.beginPath();
    let liveBal = 10000;
    const liveBals: number[] = [];
    for (let i = 0; i <= visBars; i++) {
      const baseWin = seed(i * 7) < 0.52;
      // Erosion factors: hesitation (misses some wins), spread, slippage, emotional overrides
      const hesitate = seed(i * 13) < 0.12; // 12% trades missed/entered late
      const emotional = seed(i * 19) < 0.08; // 8% emotional overrides
      let win = baseWin;
      if (hesitate) win = false; // Late entry = reduced R:R → loss
      if (emotional && !baseWin) liveBal -= 50; // Revenge trade adds extra loss
      const spread = 8; // cost per trade
      liveBal += win ? (220 - spread - (hesitate ? 80 : 0)) : (-100 - spread);
      liveBals.push(liveBal);
      const px = midX + pad + (i / totalBars) * (midX - pad * 2);
      const py = bot - ((liveBal - 8000) / 8000) * (bot - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();

    // P&L labels
    if (visBars > 10) {
      const btPnl = btBals[visBars] - 10000;
      const livePnl = liveBals[visBars] - 10000;
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`£${btPnl > 0 ? '+' : ''}${btPnl.toLocaleString()}`, midX / 2, bot + 18);
      ctx.fillStyle = livePnl >= 0 ? '#f59e0b' : '#ef4444';
      ctx.fillText(`£${livePnl > 0 ? '+' : ''}${livePnl.toLocaleString()}`, midX + midX / 2, bot + 18);
    }

    // Gap arrow
    if (visBars >= totalBars) {
      const btFinal = btBals[totalBars];
      const liveFinal = liveBals[totalBars];
      const gap = btFinal - liveFinal;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(245,158,11,${0.6 + pulse * 0.4})`;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`⚠ EXECUTION GAP: £${gap.toLocaleString()}`, w / 2, top - 5);
    }

    // Labels
    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'left';
    ctx.fillText('£10,000 start', pad, bot + 18);
    ctx.textAlign = 'right';
    ctx.fillText('£10,000 start', w - pad, bot + 18);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Erosion Factor Decomposition
// Shows 5 factors eating into your edge
// ============================================================
function ErosionFactorsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const cycle = t % 6;
    const pad = 20;
    const barH = 28;
    const gap = 10;
    const startY = 50;
    const maxBarW = w - pad * 2 - 140;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Where Your Backtest Edge Goes to Die', w / 2, 16);

    const factors = [
      { name: 'Gross Backtest EV', value: 50, color: '#34d399', pct: 100 },
      { name: 'After Spread', value: 42, color: '#34d399', pct: 84 },
      { name: 'After Slippage', value: 36, color: '#f59e0b', pct: 72 },
      { name: 'After Hesitation', value: 28, color: '#f59e0b', pct: 56 },
      { name: 'After Emotions', value: 18, color: '#ef4444', pct: 36 },
      { name: 'Net Live EV', value: 18, color: '#ef4444', pct: 36 },
    ];

    const visCount = Math.min(factors.length, Math.floor(cycle * 1.2));

    for (let i = 0; i < visCount; i++) {
      const fac = factors[i];
      const y = startY + i * (barH + gap);
      const barW = (fac.pct / 100) * maxBarW;
      const appear = Math.min(1, (cycle - i / 1.2) * 2);
      if (appear <= 0) continue;

      ctx.globalAlpha = appear;

      // Bar
      ctx.fillStyle = fac.color;
      ctx.beginPath();
      ctx.roundRect(pad + 120, y, barW * appear, barH, 6);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(fac.name, pad + 115, y + barH / 2 + 4);

      // Value
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`£${fac.value}/trade`, pad + 125 + barW * appear, y + barH / 2 + 4);

      // Erosion arrow
      if (i > 0 && i < factors.length - 1) {
        const prev = factors[i - 1];
        const lost = prev.value - fac.value;
        ctx.fillStyle = 'rgba(239,68,68,0.6)';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`−£${lost}`, pad + 120 + barW + 45, y - 2);
      }

      ctx.globalAlpha = 1;
    }

    // Bottom summary
    if (visCount >= factors.length) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(239,68,68,${0.6 + pulse * 0.4})`;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('64% of your edge gets eaten before you see a penny of profit', w / 2, h - 10);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// DATA
// ============================================================
const erosionFactors = [
  { name: 'Spread & Commission', impact: 'HIGH', desc: 'Every trade costs money before it moves. A 1-pip spread on EUR/USD costs ~£10/lot per entry. Over 100 trades, that is £1,000 your backtest never deducted.', fix: 'Include realistic spread + commission in every backtest. Use the EXACT figures from your broker — not the "typical" spread. Add 0.5 pips for slippage.', emoji: '💰' },
  { name: 'Slippage', impact: 'MEDIUM', desc: 'Your backtest entered at the exact price. Your live order fills 0.3-2 pips worse during news or fast moves. Slippage is invisible on charts but devastating to R:R.', fix: 'Assume 0.3-0.5 pips slippage per trade as a baseline. Avoid trading the first 30 seconds of London/NY open. Use limit orders, not market orders.', emoji: '⚡' },
  { name: 'Hesitation & Late Entries', impact: 'CRITICAL', desc: 'Your backtest entered the exact candle the trigger formed. In live trading, you hesitate 2-5 seconds. You re-check the chart. You wait for "one more candle." By the time you enter, your R:R has degraded from 1:2.0 to 1:1.3.', fix: 'Pre-define your entry: "When I see X, I click within 3 seconds." Use alerts. Practise with a demo until speed is automatic. Track entry delay in your journal.', emoji: '⏱️' },
  { name: 'Emotional Overrides', impact: 'CRITICAL', desc: 'Your backtest followed rules 100% of the time. You — a human — override your rules when scared (skip valid setups) or greedy (enter invalid ones). The gap between your rules and your actions is the largest execution gap of all.', fix: 'Journal every rule break. Quantify the cost: "Skipped 3 valid entries this week = missed +£420." Use walk-away rules from Level 6. The plan trades, not you.', emoji: '🧠' },
  { name: 'Missed Trades', impact: 'HIGH', desc: 'Your backtest never missed a signal. You have a job, a family, meals, sleep. You physically cannot be at the screen for every valid setup. Missing even 20% of trades can halve your monthly EV.', fix: 'Track how many setups you MISS vs how many you TAKE. Calculate EV on taken trades only. Accept a realistic trade frequency — 3-5/week is sustainable for most people.', emoji: '👁️' },
];

const gapComparison = [
  { metric: 'Win Rate', backtest: '52%', live: '44-48%', reason: 'Hesitation, missed setups, emotional skips' },
  { metric: 'Average R:R', backtest: '1:2.0', live: '1:1.4-1.7', reason: 'Late entries, early exits, slippage' },
  { metric: 'EV per trade', backtest: '£50', live: '£12-28', reason: 'All factors combined' },
  { metric: 'Trades/week', backtest: '12', live: '4-8', reason: 'Missed setups, hesitation, life' },
  { metric: 'Monthly income', backtest: '£2,400', live: '£200-900', reason: 'Fewer trades × lower EV = reality' },
];

const gameRounds = [
  { scenario: 'Your backtest shows 54% WR with 1:2 R:R over 200 trades (EV = +£62/trade). You go live and after 50 trades your stats are: 46% WR, 1:1.5 R:R, EV = +£14/trade. What is the most likely PRIMARY cause?',
    options: [
      { text: 'The strategy does not work — backtest was lucky', correct: false, explain: 'Incorrect. 200 trades is a valid sample. A working strategy does not become broken overnight — the EXECUTION changed, not the strategy.' },
      { text: 'Hesitation and late entries degrading R:R from 1:2.0 to 1:1.5', correct: true, explain: 'Correct! The R:R dropped from 1:2.0 to 1:1.5 — that is the fingerprint of late entries. The WR drop (54→46%) follows naturally because worse entries give price less room to hit TP before hitting SL.' },
      { text: 'The market changed since the backtest period', correct: false, explain: 'Possible but unlikely in just 50 trades. The R:R degradation (1:2.0 → 1:1.5) points to execution quality, not market conditions.' },
      { text: 'You need to increase position size to recover faster', correct: false, explain: 'Dangerous. Increasing size during an execution problem compounds losses. Fix the process first, then the size takes care of itself.' },
    ]
  },
  { scenario: 'You review your journal and find that 8 out of 50 trades were "revenge trades" — entries taken without a valid setup after a loss. These 8 trades went 1W/7L. Without those 8 trades, your stats on the remaining 42 trades are: 48% WR, 1:1.8 R:R, EV = +£36/trade. What should you do?',
    options: [
      { text: 'Accept the revenge trades as part of trading — everyone does it', correct: false, explain: 'No. "Everyone does it" does not make it acceptable. Those 8 trades cost you approximately £560 (7 losses × ~£80). That is more than a month of edge.' },
      { text: 'Eliminate revenge trades using walk-away rules — your real stats are already solid', correct: true, explain: 'Correct! Without revenge trades, your stats are healthy (48% WR, 1:1.8 R:R, +£36 EV). The EXECUTION GAP is coming from emotional overrides, not from the strategy. Apply the 3-loss walk-away rule from Level 6.' },
      { text: 'Lower your risk so the revenge trades hurt less', correct: false, explain: 'This treats the symptom, not the cause. Lower risk means the good trades ALSO earn less. Eliminate the bad trades entirely.' },
      { text: 'Backtest more — 200 trades was not enough', correct: false, explain: '200 trades is a valid sample. The problem is not the backtest — it is the 8 unplanned trades you added in live execution.' },
    ]
  },
  { scenario: 'Your broker charges 0.8 pip spread on EUR/USD. Your average stop is 10 pips. Your backtest did NOT include spread. How much is spread ALONE costing you per trade as a percentage of risk?',
    options: [
      { text: '2% of risk — negligible, ignore it', correct: false, explain: 'You are underestimating. 0.8 pip out of a 10-pip stop = 8% of your risk is consumed by spread alone. Over 100 trades at £100 risk, that is £800 gone before a single candle prints.' },
      { text: '8% of risk — significant but manageable', correct: true, explain: 'Correct! 0.8 ÷ 10 = 8% of your risk per trade. Over 100 trades at £100 risk, spread costs £800. If your backtest EV was £30/trade (£3,000 over 100), spread alone eats 27% of your total profits.' },
      { text: '15% of risk — you should switch brokers immediately', correct: false, explain: 'Overestimated. 0.8 out of 10 pips = 8%. But you are right to be concerned — this IS a significant erosion factor.' },
      { text: 'It depends on the session — Asia spread is higher', correct: false, explain: 'True that Asia spread is higher, but the question asks about the BASE cost. 0.8/10 = 8%. In Asia it could be 1.2-1.5 pips, making it 12-15% of risk — another reason to avoid low-liquidity sessions.' },
    ]
  },
  { scenario: 'You tracked your entry timing for 30 trades. Your TRIGGER formed at price X. Your actual FILL was: on time for 18 trades (60%), 1-2 candles late for 9 trades (30%), and 3+ candles late for 3 trades (10%). Late entries reduced average R:R from 1:2.0 to 1:1.2. What is the COST of this timing leak?',
    options: [
      { text: 'Roughly 10% of total profits — minor issue', correct: false, explain: 'Much worse. 40% of your trades had degraded R:R. Those 12 late trades with 1:1.2 R:R instead of 1:2.0 represent a 40% reduction in reward on 40% of your trades. That compounds to approximately 25-30% of total expected profit lost.' },
      { text: 'Roughly 25-30% of total profits — this is a priority fix', correct: true, explain: 'Correct! 12 out of 30 trades (40%) entered late, each with ~40% lower reward potential. Combined: ~25-30% of your total expected profit evaporates from hesitation alone. Set alerts so you are READY when the trigger forms, not scrambling.' },
      { text: 'Cannot be calculated — need more data', correct: false, explain: '30 trades with clear timing data IS enough to identify the pattern. 40% late entries with quantified R:R degradation gives a reliable cost estimate.' },
      { text: 'The 3 very late trades are the only concern — ignore the 1-2 candle delays', correct: false, explain: '1-2 candle delays still cost R:R. On a 10-pip stop, entering even 3 pips late turns 1:2.0 into 1:1.6. Those 9 trades matter.' },
    ]
  },
  { scenario: 'After 3 months of live trading, your execution gap has narrowed: backtest EV was £50/trade, live EV is now £32/trade (was £14 in month 1). What is the SINGLE best action to continue closing the gap?',
    options: [
      { text: 'Increase position size now — £32 EV is profitable enough', correct: false, explain: 'Premature. Your execution is improving but the gap is still 36%. Scale size AFTER the gap stabilises below 20% for 2+ months.' },
      { text: 'Keep journaling and identify the remaining £18 leak with specific data', correct: true, explain: 'Correct! You have gone from £14 to £32 — excellent progress. The remaining £18 gap has specific causes (spread? timing? emotions?) that your journal can isolate. Fix the biggest remaining leak, then reassess. The gap may never reach zero, but £32-40 EV is realistic and profitable.' },
      { text: 'Switch to a new strategy — the gap should be zero', correct: false, explain: 'The gap will NEVER be zero. Spread, slippage, and missed trades are permanent costs. A £32 live EV from a £50 backtest EV (64% retention) is actually very good. Most traders retain only 30-50%.' },
      { text: 'Go back to demo until the gap closes completely', correct: false, explain: 'Demo cannot close the execution gap because demo does not have the psychological pressure that CAUSES the gap. You need to trade live with appropriate risk to develop execution skills.' },
    ]
  },
];

const quizQuestions = [
  { q: 'What is the execution gap?', opts: ['The time between placing an order and it being filled', 'The difference between backtest performance and live trading performance', 'The spread charged by your broker', 'The delay in your internet connection'], correct: 1 },
  { q: 'Which execution gap factor is typically the LARGEST for retail traders?', opts: ['Spread costs', 'Slippage', 'Hesitation and emotional overrides combined', 'Commission fees'], correct: 2 },
  { q: 'Your backtest shows EV of £40/trade. In live trading, what is a REALISTIC percentage of that EV you should expect to capture?', opts: ['95-100% — a good strategy should perform identically', '80-90% — minor friction only', '50-70% — execution costs are significant', '20-30% — most edge gets destroyed'], correct: 2 },
  { q: 'You enter a trade 2 candles after your trigger on a 15M chart. Your stop was 12 pips. Price moved 4 pips in your direction during those 2 candles. What is the impact?', opts: ['No impact — the trade is still valid', 'Your effective R:R dropped because your entry is 4 pips worse', 'You should increase your target to compensate', 'Your stop should be moved to account for the late entry'], correct: 1 },
  { q: 'What is the correct response when you discover revenge trades in your journal?', opts: ['Reduce position size on all trades', 'Accept them as normal human behaviour', 'Implement walk-away rules and eliminate them from your execution', 'Take more trades to offset the losses'], correct: 2 },
  { q: 'Your broker shows "typical spread 0.6 pips" on EUR/USD. When should you expect HIGHER spread?', opts: ['During London session only', 'During Asian session, news events, and low-liquidity periods', 'Only during NFP', 'Spread is always fixed at the typical rate'], correct: 1 },
  { q: 'After closing the execution gap from £14 to £32 EV (backtest £50), when is it appropriate to increase position size?', opts: ['Immediately — £32 is profitable', 'After 2+ months of stable EV above £30 with consistent execution', 'Only when EV matches the full backtest £50', 'After 10 consecutive winning trades'], correct: 1 },
  { q: 'Which of these is NOT a component of the execution gap?', opts: ['Market volatility causing your strategy to stop working', 'Spread and commission costs', 'Hesitation leading to late entries', 'Missing valid setups because you were away from the screen'], correct: 0 },
];

// ============================================================
// Confetti
// ============================================================
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function ExecutionGapLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openFactor, setOpenFactor] = useState<number | null>(null);

  // Interactive — Execution Gap Calculator
  const [egBacktestEV, setEgBacktestEV] = useState('50');
  const [egSpread, setEgSpread] = useState('8');
  const [egSlippage, setEgSlippage] = useState('4');
  const [egHesitation, setEgHesitation] = useState('15');
  const [egEmotional, setEgEmotional] = useState('10');
  const [egMissed, setEgMissed] = useState('20');
  const [egTradesPerWeek, setEgTradesPerWeek] = useState('5');

  const btEV = parseFloat(egBacktestEV) || 0;
  const spreadCost = (parseFloat(egSpread) || 0) / 100;
  const slippageCost = (parseFloat(egSlippage) || 0) / 100;
  const hesitationCost = (parseFloat(egHesitation) || 0) / 100;
  const emotionalCost = (parseFloat(egEmotional) || 0) / 100;
  const missedPct = (parseFloat(egMissed) || 0) / 100;
  const tradesPerWeek = parseFloat(egTradesPerWeek) || 0;

  const afterSpread = btEV * (1 - spreadCost);
  const afterSlippage = afterSpread * (1 - slippageCost);
  const afterHesitation = afterSlippage * (1 - hesitationCost);
  const afterEmotional = afterHesitation * (1 - emotionalCost);
  const netLiveEV = afterEmotional;
  const effectiveTradesPerWeek = tradesPerWeek * (1 - missedPct);
  const weeklyBT = btEV * tradesPerWeek;
  const weeklyLive = netLiveEV * effectiveTradesPerWeek;
  const totalErosion = btEV > 0 ? ((btEV - netLiveEV) / btEV * 100) : 0;
  const retentionPct = 100 - totalErosion;

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const next = [...gameAnswers]; next[gameRound] = optIdx; setGameAnswers(next); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizDone) return; const next = [...quizAnswers]; next[qi] = oi; setQuizAnswers(next); };
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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 7</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 1</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The Execution<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Gap</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Your backtest says £4,200/month. Your live account says −£800. The space between those numbers has a name — and it can be measured, diagnosed, and closed.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🔍 The Blueprint vs The Building</p>
            <p className="text-gray-400 leading-relaxed mb-4">An architect designs a perfect house. Clean lines, optimal layout, beautiful finish. Then the builders arrive. It rains for 3 weeks. A supplier delivers the wrong tiles. The electrician calls in sick. The finished house is still a house — but it is not the blueprint. It never is.</p>
            <p className="text-gray-400 leading-relaxed">Your backtest is the blueprint. Your live trading is the building. The weather is your emotions. The wrong tiles are slippage. The sick electrician is the trade you missed because your daughter needed help with homework. The execution gap is the space between the perfect plan and the messy reality. Every trader has one. The question is whether you measure it — or pretend it does not exist.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm study tracked <strong className="text-white">1,847 traders</strong> who passed demo evaluations. Their demo stats: <strong className="text-green-400">53% WR, 1:1.9 R:R</strong>. The same traders on funded accounts: <strong className="text-red-400">44% WR, 1:1.3 R:R</strong>. The strategy did not change. The rules did not change. The only thing that changed was <em>real money was on the line</em>. Average backtest-to-live EV retention across the group: <strong className="text-amber-400">38%</strong>. The top 10% retained <strong className="text-green-400">65-72%</strong> — they had measured and trained for the gap.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Backtest vs Live Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Two Equity Curves</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Strategy. Different Results.</h2>
          <p className="text-gray-400 text-sm mb-6">Left: your backtest — perfect execution, every signal taken, no emotions. Right: your live account — same strategy, same rules, but now it is real money. Watch the gap open.</p>
          <BacktestVsLiveAnimation />
        </motion.div>
      </section>

      {/* S02 — Erosion Factors Animation */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 5 Erosion Factors</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Your Edge Goes to Die</h2>
          <p className="text-gray-400 text-sm mb-6">Your backtest EV of £50/trade gets eaten alive — layer by layer — before you see any profit. Each factor takes a bite.</p>
          <ErosionFactorsAnimation />
        </motion.div>
      </section>

      {/* S03 — 5 Factors Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 5 Execution Killers</p>
          <h2 className="text-2xl font-extrabold mb-4">Diagnose Your Leaks</h2>
          <p className="text-gray-400 text-sm mb-6">Each factor has a measurable impact and a specific fix. Expand each to understand what it costs you and how to close it.</p>
          <div className="space-y-3">
            {erosionFactors.map((fac, i) => (
              <div key={i} className="rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setOpenFactor(openFactor === i ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm flex-shrink-0">{fac.emoji}</span>
                    <div className="text-left"><p className="text-sm font-bold text-white">{fac.name}</p><p className="text-xs text-gray-500 mt-0.5">Impact: <span className={fac.impact === 'CRITICAL' ? 'text-red-400' : fac.impact === 'HIGH' ? 'text-amber-400' : 'text-yellow-400'}>{fac.impact}</span></p></div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFactor === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openFactor === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-4 pb-4 space-y-3"><div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-red-400 mb-1">The Problem</p><p className="text-sm text-gray-400 leading-relaxed">{fac.desc}</p></div><div className="p-3 rounded-lg bg-white/[0.02]"><p className="text-xs font-bold text-green-400 mb-1">The Fix</p><p className="text-sm text-gray-400 leading-relaxed">{fac.fix}</p></div></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The Gap in Numbers */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Gap in Numbers</p>
          <h2 className="text-2xl font-extrabold mb-4">Backtest vs Live — A Typical Comparison</h2>
          <p className="text-gray-400 text-sm mb-6">This is what the gap looks like across 5 key metrics for a typical retail trader with a genuinely profitable strategy.</p>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-white/5">
              <div className="p-3 bg-gray-900/50"><p className="text-xs font-bold text-gray-500">Metric</p></div>
              <div className="p-3 bg-gray-900/50"><p className="text-xs font-bold text-green-400">Backtest</p></div>
              <div className="p-3 bg-gray-900/50"><p className="text-xs font-bold text-red-400">Live</p></div>
              <div className="p-3 bg-gray-900/50"><p className="text-xs font-bold text-amber-400">Why</p></div>
            </div>
            {gapComparison.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-px bg-white/5">
                <div className="p-3 bg-gray-900/30"><p className="text-xs text-white font-medium">{row.metric}</p></div>
                <div className="p-3 bg-gray-900/30"><p className="text-xs text-green-400">{row.backtest}</p></div>
                <div className="p-3 bg-gray-900/30"><p className="text-xs text-red-400">{row.live}</p></div>
                <div className="p-3 bg-gray-900/30"><p className="text-xs text-gray-500">{row.reason}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-400">💡 The monthly income gap: £2,400 → £200-900 (63-92% reduction). This is why traders quit — not because their strategy fails, but because they expected the backtest number and got the live number.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Execution Gap Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Your Execution Gap Calculator</p>
          <h2 className="text-2xl font-extrabold mb-4">Measure YOUR Gap</h2>
          <p className="text-gray-400 text-sm mb-6">Input your backtest EV and estimated erosion factors. See exactly how much of your edge survives the journey from paper to live.</p>
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            {[
              { label: 'Backtest EV per trade (£)', val: egBacktestEV, set: setEgBacktestEV },
              { label: 'Spread/Commission erosion (%)', val: egSpread, set: setEgSpread },
              { label: 'Slippage erosion (%)', val: egSlippage, set: setEgSlippage },
              { label: 'Hesitation/late entry cost (%)', val: egHesitation, set: setEgHesitation },
              { label: 'Emotional override cost (%)', val: egEmotional, set: setEgEmotional },
              { label: 'Missed trades (%)', val: egMissed, set: setEgMissed },
              { label: 'Trades per week', val: egTradesPerWeek, set: setEgTradesPerWeek },
            ].map((inp, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <label className="text-xs text-gray-400 flex-1">{inp.label}</label>
                <input type="number" value={inp.val} onChange={e => inp.set(e.target.value)} className="w-24 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white text-right focus:outline-none focus:border-amber-500/50" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-xs text-gray-500 mb-3">Erosion Waterfall</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Backtest EV</span><span className="text-green-400 font-bold">£{btEV.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">After spread/commission</span><span className="text-green-400">£{afterSpread.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">After slippage</span><span className="text-amber-400">£{afterSlippage.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">After hesitation</span><span className="text-amber-400">£{afterHesitation.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">After emotional overrides</span><span className={netLiveEV > 0 ? 'text-amber-400' : 'text-red-400'}>£{afterEmotional.toFixed(2)}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between"><span className="text-white font-bold">Net Live EV</span><span className={`font-bold ${netLiveEV > 0 ? 'text-green-400' : 'text-red-400'}`}>£{netLiveEV.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-xs text-gray-500 mb-1">Edge Retained</p>
                <p className={`text-2xl font-black ${retentionPct >= 60 ? 'text-green-400' : retentionPct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{retentionPct.toFixed(0)}%</p>
                <p className="text-[10px] text-gray-600 mt-1">{retentionPct >= 60 ? 'Excellent — top 10%' : retentionPct >= 40 ? 'Typical — room to improve' : 'Critical — fix execution first'}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Erosion</p>
                <p className="text-2xl font-black text-red-400">{totalErosion.toFixed(0)}%</p>
                <p className="text-[10px] text-gray-600 mt-1">£{(btEV - netLiveEV).toFixed(2)} lost per trade</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-xs text-gray-500 mb-1">Weekly (Backtest)</p>
                <p className="text-lg font-bold text-green-400">£{weeklyBT.toFixed(0)}</p>
                <p className="text-[10px] text-gray-600">{tradesPerWeek} trades × £{btEV.toFixed(0)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-xs text-gray-500 mb-1">Weekly (Live Reality)</p>
                <p className={`text-lg font-bold ${weeklyLive > 0 ? 'text-amber-400' : 'text-red-400'}`}>£{weeklyLive.toFixed(0)}</p>
                <p className="text-[10px] text-gray-600">{effectiveTradesPerWeek.toFixed(1)} trades × £{netLiveEV.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Closing the Gap */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Closing the Gap</p>
          <h2 className="text-2xl font-extrabold mb-4">The 5-Step Execution Improvement Plan</h2>
          <p className="text-gray-400 text-sm mb-6">You cannot close the gap in a day. But you can close it systematically — one factor at a time — over 4-8 weeks.</p>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Measure the gap', desc: 'Trade live for 30 trades while tracking backtest EV and live EV separately. You cannot fix what you have not measured.', icon: '📏' },
              { step: 2, title: 'Identify the biggest leak', desc: 'Use your journal to categorise every trade: was the entry on time? Was it a rule-based trade? Was spread deducted in the backtest? The biggest single leak is your first target.', icon: '🔍' },
              { step: 3, title: 'Fix ONE factor', desc: 'If hesitation is your biggest leak, practise speed drills on demo. If emotional overrides dominate, implement walk-away rules. One factor at a time — exactly like the One-Change Rule from Level 6.', icon: '🔧' },
              { step: 4, title: 'Re-measure after 30 trades', desc: 'Did the gap narrow? If your live EV went from £14 to £28 after fixing late entries, that one change was worth £14/trade. Quantify your improvement.', icon: '📊' },
              { step: 5, title: 'Repeat for the next leak', desc: 'Once the biggest leak is sealed, the second-biggest becomes the new priority. Keep iterating until your live EV stabilises at 50-70% of backtest EV.', icon: '🔁' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                <div><p className="text-sm font-bold text-white mb-1">Step {s.step}: {s.title}</p><p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — The Retention Spectrum */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Retention Spectrum</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Do You Sit?</h2>
          <p className="text-gray-400 text-sm mb-6">Most traders retain only 20-40% of their backtest edge. The elite retain 60-75%. Nobody retains 100% — that is a mathematical impossibility because spread and missed trades are permanent costs.</p>
          <div className="space-y-3">
            {[
              { range: '0-20%', label: 'Broken Execution', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', desc: 'Emotional overrides dominate. Revenge trades, skipped setups, late entries on nearly every trade. The strategy works on paper but the trader is not executing it.' },
              { range: '20-40%', label: 'Typical Retail', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', desc: 'The majority. Strategy is valid but execution leaks are unidentified and unmeasured. Usually profitable but underperforming significantly.' },
              { range: '40-60%', label: 'Developing Pro', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', desc: 'Actively tracking execution quality. Main leaks identified. Walk-away rules in place. Emotional trades are rare, not eliminated.' },
              { range: '60-75%', label: 'Elite Execution', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', desc: 'The top 10%. Execution is a trained skill, not an afterthought. Every leak has been quantified and addressed. The remaining gap is structural (spread, missed trades, slippage).' },
            ].map((tier, i) => (
              <div key={i} className={`p-4 rounded-xl border ${tier.bg}`}>
                <div className="flex items-center gap-3 mb-2"><span className={`text-sm font-bold ${tier.color}`}>{tier.range}</span><span className="text-xs font-bold text-gray-500">{tier.label}</span></div>
                <p className="text-xs text-gray-400 leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">What NOT to Do</h2>
          <div className="space-y-3">
            {[
              { mistake: 'Blaming the strategy when the gap opens', fix: 'The strategy is the blueprint. If the building looks different, check the builders (you) before blaming the architect (the system). Measure execution FIRST.' },
              { mistake: 'Expecting backtest results in live trading', fix: 'If your backtest says £3,000/month, plan for £1,000-1,800 and be pleasantly surprised if you beat it. Unrealistic expectations cause frustration, which causes emotional overrides, which widens the gap.' },
              { mistake: 'Trying to close the gap by trading MORE', fix: 'More trades with poor execution = more erosion. Fix execution quality FIRST, then increase frequency. Quality × Quantity, not Quantity alone.' },
              { mistake: 'Ignoring the gap and hoping it closes naturally', fix: 'It does not. Without deliberate measurement and improvement, the gap stays the same or widens as bad habits compound. You must actively track and fix.' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm font-bold text-red-400 mb-2">❌ {m.mistake}</p>
                <p className="text-xs text-gray-400 leading-relaxed">✅ {m.fix}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Execution Gap Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'The 5 Erosion Factors', body: 'Spread, Slippage, Hesitation, Emotions, Missed Trades', color: 'border-red-500/20 bg-red-500/5' },
              { title: 'Realistic Retention', body: '50-70% of backtest EV is elite. 20-40% is typical. 0-20% means execution is broken.', color: 'border-amber-500/20 bg-amber-500/5' },
              { title: 'The Fix Formula', body: 'Measure → Identify biggest leak → Fix ONE factor → Re-measure → Repeat', color: 'border-green-500/20 bg-green-500/5' },
              { title: 'NEVER', body: 'Never blame the strategy before checking execution. Never expect 100% retention. Never try to outrun bad execution with volume.', color: 'border-purple-500/20 bg-purple-500/5' },
              { title: 'The Real Number', body: 'Live Income = Net EV × Effective Frequency. Both are lower than backtest. Plan for it.', color: 'border-sky-500/20 bg-sky-500/5' },
              { title: 'Timeline', body: '4-8 weeks to close the biggest leak. 3-6 months to reach stable 50%+ retention. It is a skill, not a switch.', color: 'border-pink-500/20 bg-pink-500/5' },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-xl border ${card.color}`}>
                <p className="text-xs font-bold text-white mb-1">{card.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Execution Gap Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real execution gap scenarios. Diagnose the cause and choose the best action.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2.5">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can diagnose execution leaks like a pro.' : gameScore >= 3 ? 'Good — review the erosion factors and the retention spectrum.' : 'Re-read the 5 factors and the gap comparison table, then try again.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Final Quiz</h2>
          <p className="text-gray-400 text-sm mb-6">8 questions — 66% to earn your certificate.</p>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm text-gray-300 mb-4">{q.q}</p>
                <div className="space-y-2">{q.opts.map((opt, oi) => { const chosen = quizAnswers[qi] === oi; const isRight = oi === q.correct; const cls = quizAnswers[qi] === null ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isRight ? 'bg-green-500/10 border border-green-500/30' : chosen ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={quizAnswers[qi] !== null} className={`w-full text-left p-3 rounded-xl text-sm transition-all ${cls}`}>{opt}</button>; })}</div>
              </div>
            ))}
          </div>
          {quizAnswers.every(a => a !== null) && !quizDone && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center"><button onClick={() => setQuizDone(true)} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-transform">Submit Quiz</button></motion.div>)}
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🏗️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: The Execution Gap</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Gap Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
