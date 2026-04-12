// app/academy/lesson/scaling-when-and-how/page.tsx
// ATLAS Academy — Lesson 7.11: Scaling: When and How [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Triple Equity Curve + Scaling Readiness Calculator
// TEMPLATE: Matches Level 6 Lesson 8 (trade-management) gold standard exactly
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ChevronDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (<div className="fixed inset-0 pointer-events-none z-50">{Array.from({ length: 60 }).map((_, i) => (<motion.div key={i} initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }} animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, rotate: Math.random() * 720, opacity: 0 }} transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }} className="absolute w-2 h-2 rounded-sm" style={{ background: ['#f59e0b', '#d946ef', '#34d399', '#3b82f6', '#ef4444'][i % 5] }} />))}</div>);
}

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const frameRef = useRef(0); const animRef = useRef(0);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); }; loop(); return () => cancelAnimationFrame(animRef.current); }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: Triple Equity Curve — 0.5%, 1%, 2%
// ============================================================
function TripleEquityCurveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const progress = Math.min(1, (t % 12) / 9);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Same Strategy. Same 200 Trades. Different Risk %.', w / 2, 16);
    const pad = 35; const chartL = pad + 5; const chartR = w - pad; const chartW = chartR - chartL; const top = 40; const bot = h - 40; const chartH = bot - top;
    const seed = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const totalTrades = 200; const visTrades = Math.floor(progress * totalTrades);
    const risks = [0.5, 1, 2]; const colors = ['#3b82f6', '#26A69A', '#f59e0b']; const labels = ['0.5% Risk', '1% Risk', '2% Risk'];
    const curves: number[][] = [[], [], []]; const balances = [10000, 10000, 10000]; const maxDDs = [0, 0, 0]; const peaks = [10000, 10000, 10000];
    for (let i = 0; i <= totalTrades; i++) { curves[0].push(balances[0]); curves[1].push(balances[1]); curves[2].push(balances[2]); if (i < totalTrades) { const rng = seed(i * 3 + 7); const win = rng < 0.52; const rrM = win ? (1.4 + seed(i * 5) * 0.8) : -1; for (let r = 0; r < 3; r++) { const riskAmt = balances[r] * (risks[r] / 100); balances[r] += riskAmt * rrM; if (balances[r] > peaks[r]) peaks[r] = balances[r]; const dd = (peaks[r] - balances[r]) / peaks[r] * 100; if (dd > maxDDs[r]) maxDDs[r] = dd; } } }
    let allMin = Infinity; let allMax = -Infinity; curves.forEach(c => c.forEach(v => { if (v < allMin) allMin = v; if (v > allMax) allMax = v; }));
    const yRange = allMax - allMin || 1; const py = (v: number) => bot - ((v - allMin) / yRange) * chartH;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5; for (let i = 0; i <= 4; i++) { const y = top + (i / 4) * chartH; ctx.beginPath(); ctx.moveTo(chartL, y); ctx.lineTo(chartR, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(chartL, py(10000)); ctx.lineTo(chartR, py(10000)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'right'; ctx.fillText('£10,000', chartL - 3, py(10000) + 3);
    for (let r = 2; r >= 0; r--) { ctx.beginPath(); for (let i = 0; i <= visTrades; i++) { const x = chartL + (i / totalTrades) * chartW; const y = py(curves[r][i]); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.strokeStyle = colors[r]; ctx.lineWidth = r === 1 ? 2 : 1.5; ctx.stroke(); if (visTrades > 10) { const endX = chartL + (visTrades / totalTrades) * chartW; const endY = py(curves[r][visTrades]); ctx.fillStyle = colors[r]; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`${labels[r]}: £${Math.round(curves[r][visTrades]).toLocaleString()}`, endX + 5, endY + (r - 1) * 14); } }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`Trade ${visTrades} of ${totalTrades}`, w / 2, bot + 14);
    if (progress > 0.95) { ctx.font = '8px system-ui'; ctx.textAlign = 'center'; for (let r = 0; r < 3; r++) { const x = chartL + ((r + 1) / 4) * chartW; ctx.fillStyle = colors[r]; ctx.fillText(`Max DD: ${maxDDs[r].toFixed(1)}%`, x, bot + 28); } }
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Drawdown Recovery Trap
// ============================================================
function DrawdownDevastationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The Drawdown Recovery Trap', cx, 16);
    const rows = [{ dd: 5, recovery: 5.3, label: 'Minor', color: '#26A69A' }, { dd: 10, recovery: 11.1, label: 'Moderate', color: '#3b82f6' }, { dd: 20, recovery: 25.0, label: 'Serious', color: '#FFB300' }, { dd: 30, recovery: 42.9, label: 'Severe', color: '#f97316' }, { dd: 40, recovery: 66.7, label: 'Critical', color: '#ef4444' }, { dd: 50, recovery: 100.0, label: 'FATAL', color: '#ef4444' }];
    const pad = 15; const colLabelW = 55; const colDDW = 50; const barAreaL = pad + colLabelW + colDDW; const barAreaR = w - pad - 40; const barMaxW = barAreaR - barAreaL; const barH = 28; const gap = 8; const startY = 38;
    const animProgress = Math.min(1, (t % 8) / 5);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center'; ctx.fillText('SEVERITY', pad + colLabelW / 2, startY - 6); ctx.fillText('DRAWDOWN', pad + colLabelW + colDDW / 2, startY - 6); ctx.fillText('% GAIN NEEDED TO RECOVER', (barAreaL + barAreaR) / 2, startY - 6);
    rows.forEach((row, i) => { const y = startY + i * (barH + gap); const barProgress = Math.max(0, Math.min(1, animProgress * 2 - i * 0.2)); const barW = (row.recovery / 110) * barMaxW * barProgress; ctx.fillStyle = row.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(row.label, pad + colLabelW / 2, y + barH / 2 + 3); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '9px system-ui'; ctx.fillText(`-${row.dd}%`, pad + colLabelW + colDDW / 2, y + barH / 2 + 3); ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.beginPath(); ctx.roundRect(barAreaL, y, barMaxW, barH, 4); ctx.fill(); if (barW > 0) { ctx.fillStyle = row.color + '50'; ctx.beginPath(); ctx.roundRect(barAreaL, y, barW, barH, 4); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`+${row.recovery.toFixed(1)}%`, barAreaL + barW + 4, y + barH / 2 + 3); } });
    if (animProgress > 0.8) { ctx.fillStyle = 'rgba(239,68,68,0.8)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('A 50% drawdown needs +100% gain to recover. Scale too fast → you never recover.', cx, h - 10); }
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// DATA
// ============================================================
const scaleLadder = [
  { title: 'Step 1: 0.25-0.5% Risk (Proving Ground)', desc: '<strong>Duration:</strong> First 100 trades (3+ months).<br/><br/><strong>Purpose:</strong> Prove the edge exists. Your ONLY goal is data quality — not profit. At 0.5%, a 10-trade losing streak costs 5%. Survivable. Zero emotional pressure.<br/><br/><strong>Advance when:</strong> 100+ trades, positive EV over last 50, max consecutive losses recorded, 3+ months at this level.' },
  { title: 'Step 2: 0.75-1% Risk (Building Phase)', desc: '<strong>Duration:</strong> 50-100 trades (2-3 months).<br/><br/><strong>Purpose:</strong> Test psychology at meaningful risk. Losses feel real now. Track management compliance %.<br/><br/><strong>Advance when:</strong> 50+ trades at this level, stable EV, management compliance &gt;80%, max DD survived and recovered.' },
  { title: 'Step 3: 1.5% Risk (Growth Phase)', desc: '<strong>Duration:</strong> 50+ trades (2+ months).<br/><br/><strong>Purpose:</strong> Compounding becomes visible. Losses at 1.5% HURT. This is where most traders discover their true risk tolerance. Some belong here permanently. That is not failure.<br/><br/><strong>Advance when:</strong> 50+ trades, EV stable, max DD &lt;12%, emotional state consistently calm, zero revenge trades.' },
  { title: 'Step 4: 2% Risk (Performance Phase)', desc: '<strong>Duration:</strong> Ongoing (or permanent ceiling).<br/><br/><strong>Purpose:</strong> Maximum compounding for most strategies. At 2%, a 7-trade losing streak = 14% drawdown. This is the CEILING for most retail traders.<br/><br/><strong>The truth:</strong> Many elite traders never go above 1.5%. Finding your optimal risk is more important than reaching 2%.' },
];

const scaleDownTriggers = [
  { trigger: 'Drawdown exceeds 10%', action: 'Immediately reduce risk by 50%. Stabilise for 50 trades before re-scaling.', color: '#ef4444' },
  { trigger: 'EV turns negative over 30 trades', action: 'Scale to minimum risk (0.25-0.5%). Diagnose whether edge changed or variance.', color: '#ef4444' },
  { trigger: 'Emotional state consistently reactive (3+ sessions)', action: 'Reduce risk to where trading feels "boring". Risk is too high for current psychology.', color: '#FFB300' },
  { trigger: 'New market conditions (regime change)', action: 'Reduce to proven level. Re-prove edge in new conditions before re-scaling.', color: '#FFB300' },
];

const ceilingSigns = ['You check P&L during trades (didn\'t before scaling)', 'You close winners earlier than planned', 'You feel relief after a trade instead of indifference', 'You think about open positions outside market hours', 'Management compliance % has dropped since scaling'];

const scalingMistakes = [
  { title: 'Scaling Based on Results, Not Process', mistake: '"I made 15% last month, time to double risk." One winning month is not validation. You need 100+ trades and 3+ months.', fix: 'Scale based on the 5 criteria, not recent P&L.' },
  { title: 'Scaling During a Winning Streak', mistake: 'Feeling invincible after 8 wins and doubling risk. The streak WILL end — first loss at double risk wipes 2 wins.', fix: 'Never scale based on streaks. Streaks are variance, not edge improvement.' },
  { title: 'No Scale-Down Plan', mistake: 'Knowing when to scale UP but not DOWN. Drawdown arrives and you "hope" through it at elevated risk.', fix: 'Every scale-up must have a pre-defined drawdown trigger for scaling back.' },
  { title: 'Comparing Risk to Others', mistake: '"He trades at 3% and is profitable." His psychology, strategy, and tolerance are NOT yours.', fix: 'Your risk ceiling is personal. Compare stats to your criteria — not to other people.' },
];

const quizQuestions = [
  { q: 'You have 45 trades with 55% WR and 1:2 R:R. Should you scale from 0.5% to 1%?', opts: ['Yes — stats are strong', 'No — 45 trades is insufficient (need 100+)', 'Yes — but only if no drawdown this month', 'Depends on consecutive losses'], correct: 1, explain: '45 trades is below the 100-trade minimum for statistical reliability. The confidence interval on a 55% WR at 45 trades is roughly &plusmn;15%. Complete the 100-trade sample first.' },
  { q: 'The #1 reason traders blow up after scaling is:', opts: ['Bad strategy', 'They scale during a drawdown', 'They scale too slowly', 'They scale based on results, not process metrics'], correct: 3, explain: 'Scaling based on a profitable month or winning streak rather than process metrics (EV stability, sample size, drawdown history) is the most common cause of post-scaling blowups.' },
  { q: 'At 2% risk with 48% WR, how many consecutive losses before 10% drawdown?', opts: ['10 losses', '5 losses', 'About 5 (5 &times; 2% = ~10%)', '3 losses'], correct: 2, explain: 'At 2% risk per trade, 5 consecutive losses would produce approximately 10% drawdown (slightly less due to compounding). This is a realistic scenario that WILL occur eventually.' },
  { q: 'Which metric is MOST important before scaling?', opts: ['Win rate', 'Average R:R', 'Expected Value stability over 100+ trades', 'Monthly profit in £'], correct: 2, explain: 'EV stability over a large sample is the only reliable indicator. Win rate and R:R are components of EV. Monthly profit can be luck. Stable EV over 100+ trades = proven edge.' },
  { q: 'You scale from 1% to 2% and hit 4 consecutive losses. Correct response:', opts: ['Stay at 2% — 4 losses is normal', 'Scale back to 1% and re-evaluate after 50 more trades', 'Scale to 0.5% — strategy is broken', 'Double to 3% to recover'], correct: 1, explain: 'The drawdown trigger should fire. Scale back to 1%, stabilise for 50 trades to confirm the edge is intact, then re-scale only if all criteria are met again.' },
  { q: 'A trader with 200 trades, 54% WR, 1:1.9 R:R, max 6 consec losses, 0% DD wants to go from 1% to 2%. Assessment:', opts: ['Ready — all criteria met', 'Not ready — max consec losses too high', 'Ready — but scale to 1.5% first as intermediate step', 'Need more data'], correct: 2, explain: 'Stats are strong but jumping from 1% to 2% (doubling) violates the Scale Ladder. 1% &rarr; 1.5% &rarr; 2% with stabilisation periods is how professionals scale.' },
  { q: 'The "Scale Ladder" approach means:', opts: ['Jumping from 0.5% to 2% once profitable', 'Increasing by 0.25-0.5% at a time with mandatory stabilisation periods', 'Scaling based on account balance milestones', 'Reducing after losses, increasing after wins'], correct: 1, explain: 'The Scale Ladder is incremental: each step is 0.25-0.5% increase with a mandatory stabilisation period (50+ trades) before the next step. No skipping.' },
  { q: 'If you experience 15% drawdown at 2% risk, you should:', opts: ['Scale to 1% until recovered, then stabilise 50 trades before re-scaling', 'Stay at 2% — drawdowns are normal', 'Scale to 3% to recover faster', 'Stop trading for a month'], correct: 0, explain: 'The scale-down trigger fires at 10%+ DD. At 15%, scale back to 1% immediately. Recover the drawdown at reduced risk, then stabilise for 50 trades before considering re-scaling.' },
];

const gameRounds = [
  { scenario: '<strong>87 trades at 0.5% risk.</strong> 51% WR. 1:1.6 R:R. EV: +0.29%. Max consecutive losses: 5. Current DD: 2%. 3 months trading. Want to scale to 1%.', options: [
    { text: 'Yes — 87 trades is close enough, stats look good', correct: false, explain: '87 is NOT 100. More importantly, EV of +0.29% is thin — a few bad trades could flip it negative. Complete the 100-trade sample, then reassess.' },
    { text: 'Not yet — complete 100 trades first. Edge is positive but thin (+0.29% EV).', correct: true, explain: 'Three criteria unmet: sample below 100, EV is marginal, only 3 months of data. Finish the 100, track EV stability across the last 50, then decide.' },
    { text: 'Scale to 0.75% as a compromise', correct: false, explain: 'Scaling before completing 100 trades is premature regardless of the level. The issue is data quality, not risk level. Finish the sample FIRST.' },
  ]},
  { scenario: '<strong>150 trades at 1%.</strong> 54% WR. 1:2.0 R:R. EV: +0.62%. Max consec losses: 4. Last 50 trades EV: +0.58% (stable). DD: 0%. Ready for 1.5%.', options: [
    { text: 'Switch to 1.5% on next trade, evaluate after 50', correct: false, explain: 'Correct destination, wrong process. Need a drawdown trigger. If you hit X% DD at 1.5%, scale back immediately.' },
    { text: 'Scale to 1.5% with drawdown trigger: 8% DD → back to 1%. Evaluate after 50 trades.', correct: true, explain: 'Perfect process. At 1.5%, 5 consecutive losses = 7.5% DD — your 8% trigger gives slightly more room. After 50 stable trades, reassess for 2%.' },
    { text: 'Go straight to 2% — stats are strong enough to skip 1.5%', correct: false, explain: 'Doubling from 1% to 2% violates the Scale Ladder. The psychological impact of doubled losses is real. 1% → 1.5% → 2% with stabilisation.' },
  ]},
  { scenario: '<strong>Scaled to 2% three weeks ago.</strong> First two weeks: +6.2%. This week: 5 consecutive losses. Account &minus;4.8% from peak. Frustrated. Next setup looks A-grade.', options: [
    { text: 'Take the A-grade at 2% — setup quality matters, not recent results', correct: false, explain: 'Setup is fine but YOUR state is compromised. 5 losses at 2% = frustration. Frustration will influence management.' },
    { text: 'Scale back to 1% immediately. Take the setup at 1%. Stabilise 50 trades before returning to 2%.', correct: true, explain: 'The drawdown trigger should have fired at &minus;4.8%. Scale back, stabilise emotional state, execute at 1% until 50 clean trades confirm the edge. This is risk management.' },
    { text: 'Skip this trade. Wait until next week to reset.', correct: false, explain: 'Skipping A-grade setups due to recent losses is fear. The correct action is scale DOWN, not stop trading. Reduced risk maintains data flow and process.' },
  ]},
  { scenario: '<strong>Your friend says:</strong> "I went from 1% to 3% last month, account grew 18%. You\'re still at 0.5% — leaving money on the table." He has 60 trades logged.', options: [
    { text: '"Great results! I should scale faster too."', correct: false, explain: '60 trades at 3% means 3 consecutive losses = 9% DD, 5 losses = 15%. Sample too small. His 18% gain proves nothing about process quality.' },
    { text: '"60 trades isn\'t enough. One bad streak at 3% could wipe everything."', correct: true, explain: 'At 3% risk, 7 consecutive losses (which WILL happen) = 21% DD. Needs +26.6% to recover. His sample has not encountered max adversity yet.' },
    { text: '"Depends on win rate and R:R — if stats are strong, 3% is fine"', correct: false, explain: 'No stats make 3% appropriate on 60 trades. The issue is confidence interval — 60 trades means true WR could be &plusmn;7% from observed.' },
  ]},
  { scenario: '<strong>100 trades at 2%.</strong> 53% WR, 1:1.9 R:R, EV +0.55%. Max DD was 11.2% (recovered). Max consecutive losses: 7. Want to go to 2.5%. At 2.5%, 7 consec losses = 17.5% DD.', options: [
    { text: 'Scale to 2.5% — EV is positive and max DD was recovered', correct: false, explain: 'Your SAME max consecutive streak at 2.5% would create 17.5% DD — 56% deeper than your worst ever. Recovery at +0.55% EV/trade = ~38 trades minimum.' },
    { text: 'Stay at 2%. The math shows 2.5% would create a max DD you may not survive.', correct: true, explain: '2% may be your ceiling for this strategy. The strategy did not get better — you just made the downside 56% worse. Optimal risk matters more than maximum risk.' },
    { text: 'Scale to 2.25% as a compromise', correct: false, explain: '2.25% &times; 7 consecutive losses = 15.75% DD. Still significantly worse than your max ever DD (11.2%). The issue is recognising 2% may be optimal.' },
  ]},
];

// ============================================================
// SCALING CALCULATOR
// ============================================================
interface ScalingInputs { currentRisk: number; winRate: number; avgRR: number; totalTrades: number; maxConsecLosses: number; currentDD: number; monthsTrading: number; targetRisk: number; }
const defaultInputs: ScalingInputs = { currentRisk: 0.5, winRate: 52, avgRR: 1.8, totalTrades: 0, maxConsecLosses: 0, currentDD: 0, monthsTrading: 0, targetRisk: 1 };

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ScalingWhenAndHowPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Calculator
  const [inputs, setInputs] = useState<ScalingInputs>(defaultInputs);
  const [calcDone, setCalcDone] = useState(false);
  const updateInput = (field: keyof ScalingInputs, value: number) => { setInputs(p => ({ ...p, [field]: value })); setCalcDone(false); };
  const getEV = (): number => { const wr = inputs.winRate / 100; return (wr * inputs.avgRR) - ((1 - wr) * 1); };
  const getAssessment = () => {
    const ev = getEV(); const maxDDAtTarget = inputs.maxConsecLosses * inputs.targetRisk;
    const criteria = [
      { name: 'Sample Size (100+ trades)', met: inputs.totalTrades >= 100, detail: inputs.totalTrades >= 100 ? `${inputs.totalTrades} trades — sufficient.` : `Only ${inputs.totalTrades} — need ${100 - inputs.totalTrades} more.`, weight: 25 },
      { name: 'Positive EV (>0.2%/trade)', met: ev > 0.2, detail: ev > 0.2 ? `EV: +${(ev * inputs.currentRisk).toFixed(2)}% — edge confirmed.` : `EV: ${(ev * inputs.currentRisk).toFixed(2)}% — too thin or negative.`, weight: 25 },
      { name: 'Drawdown Survivability', met: maxDDAtTarget < 15, detail: maxDDAtTarget < 15 ? `Worst-case DD at ${inputs.targetRisk}%: ${maxDDAtTarget.toFixed(1)}% — survivable.` : `Worst-case DD at ${inputs.targetRisk}%: ${maxDDAtTarget.toFixed(1)}% — DANGEROUS.`, weight: 20 },
      { name: 'Not Currently in Drawdown', met: inputs.currentDD < 3, detail: inputs.currentDD < 3 ? `Current DD: ${inputs.currentDD}% — near highs.` : `Current DD: ${inputs.currentDD}% — NEVER scale during DD.`, weight: 15 },
      { name: '3+ Months at Current Risk', met: inputs.monthsTrading >= 3, detail: inputs.monthsTrading >= 3 ? `${inputs.monthsTrading} months — stability demonstrated.` : `Only ${inputs.monthsTrading} month(s) — need 3+.`, weight: 15 },
    ];
    const score = criteria.reduce<number>((s, c) => s + (c.met ? c.weight : 0), 0);
    let verdict = ''; let color = '';
    if (score >= 90) { verdict = 'READY TO SCALE'; color = '#26A69A'; } else if (score >= 70) { verdict = 'ALMOST READY'; color = '#FFB300'; } else if (score >= 50) { verdict = 'NOT READY'; color = '#f97316'; } else { verdict = 'DO NOT SCALE'; color = '#ef4444'; }
    return { criteria, score, verdict, color, maxDDAtTarget };
  };

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };
  const quizDone = quizAnswers.every(a => a !== null);
  const quizScoreVal = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && quizScoreVal >= 66;
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Lesson 11</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Scaling: When<br /><span className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>and How</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The difference between 0.5% and 2% risk over 200 trades is life-changing compounding. But scale too soon and you never recover.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
        <div className="p-6 rounded-2xl glass-card mb-6">
          <p className="text-xl font-extrabold mb-3">🔍 The Speed Trap</p>
          <p className="text-gray-400 leading-relaxed mb-4">Two drivers in identical cars on the same road. One drives at <strong className="text-amber-400">50 mph</strong> — safe, controlled, arrives in good time. The other drives at <strong className="text-amber-400">120 mph</strong> — much faster, but one sharp corner and the car is in the barrier. The destination is the same. <strong className="text-white">The speed determines whether you arrive.</strong></p>
          <p className="text-gray-400 leading-relaxed">Scaling risk is choosing your speed. Too slow and you waste time. Too fast and you never arrive.</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
          <p className="text-sm text-gray-400 leading-relaxed">Three traders, same 200 trades (52% WR, 1:1.8 R:R). <strong className="text-[#3b82f6]">0.5% risk: &pound;10K &rarr; &pound;11,800</strong> (+18%). <strong className="text-[#26A69A]">1% risk: &pound;10K &rarr; &pound;14,200</strong> (+42%). <strong className="text-[#f59e0b]">2% risk: &pound;10K &rarr; &pound;19,600</strong> (+96%). But 2% also hit <strong className="text-red-400">22% max drawdown</strong> vs 0.5%&apos;s 5.8%.</p>
        </div>
      </motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Compounding Divergence</p><h2 className="text-2xl font-extrabold mb-4">Same Trades, Different Risk</h2><p className="text-gray-400 text-sm mb-6">Same 200 trades, same win rate, same R:R. Only risk % differs. The gap is exponential.</p><TripleEquityCurveAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Recovery Trap</p><h2 className="text-2xl font-extrabold mb-4">Drawdown Recovery Is Exponential</h2><p className="text-gray-400 text-sm mb-6">A 50% loss needs a 100% gain to recover. This is why scaling too fast is fatal.</p><DrawdownDevastationAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Scale Ladder</p><h2 className="text-2xl font-extrabold mb-4">Four Steps to Full Risk</h2><div className="space-y-3">{scaleLadder.map((item, i) => (<div key={i}><button onClick={() => toggle(`sl-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sl-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sl-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 5 Scaling Criteria</p><h2 className="text-2xl font-extrabold mb-4">ALL 5 Must Be Met</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        {[{ n: '1', t: '100+ Trades at Current Risk', d: 'Statistical reliability requires sample size. Below 100, your WR could shift &plusmn;5-7%.', c: '#3b82f6' }, { n: '2', t: 'Positive EV >0.2% Per Trade', d: 'Your EV must be positive AND stable across the last 50 trades.', c: '#26A69A' }, { n: '3', t: 'Drawdown Survivability Check', d: 'Max consecutive losses &times; target risk % must be &lt;15% DD.', c: '#FFB300' }, { n: '4', t: 'Not Currently in Drawdown', d: 'NEVER scale during a drawdown. Recover to new highs first.', c: '#ef4444' }, { n: '5', t: 'Minimum 3 Months at Current Risk', d: 'Different conditions test your edge differently. 3 months minimum.', c: '#a855f7' }].map(c => (<div key={c.n} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong style={{ color: c.c }}>{c.n}. {c.t}</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">{c.d}</span></p></div>))}
      </div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Scaling Readiness Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Scaling Readiness Calculator</h2><p className="text-gray-400 text-sm mb-6">Input your stats. The calculator assesses whether you are ready to scale.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="grid grid-cols-2 gap-3">{[{ k: 'currentRisk' as const, l: 'Current Risk %', s: 0.25 }, { k: 'targetRisk' as const, l: 'Target Risk %', s: 0.25 }, { k: 'winRate' as const, l: 'Win Rate %', s: 1 }, { k: 'avgRR' as const, l: 'Avg R:R', s: 0.1 }, { k: 'totalTrades' as const, l: 'Total Trades', s: 1 }, { k: 'maxConsecLosses' as const, l: 'Max Consec Losses', s: 1 }, { k: 'currentDD' as const, l: 'Current DD %', s: 0.5 }, { k: 'monthsTrading' as const, l: 'Months at Current', s: 1 }].map(f => (<div key={f.k}><label className="text-xs font-bold text-gray-300 mb-1 block">{f.l}</label><input type="number" step={f.s} value={inputs[f.k]} onChange={e => updateInput(f.k, parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" /></div>))}</div>
        <button onClick={() => setCalcDone(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Assess Readiness &rarr;</button>
        {calcDone && (() => { const a = getAssessment(); const ev = getEV(); const recoveryNeeded = (1 / (1 - a.maxDDAtTarget / 100) - 1) * 100; return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center border" style={{ borderColor: a.color + '30', background: a.color + '08' }}><p className="text-2xl font-black mb-1" style={{ color: a.color }}>{a.score}%</p><p className="text-sm font-bold" style={{ color: a.color }}>{a.verdict}</p></div>
          <div className="grid grid-cols-3 gap-2">{[{ v: `${(ev * inputs.currentRisk).toFixed(2)}%`, l: 'EV/Trade', c: ev > 0.2 ? '#26A69A' : '#ef4444' }, { v: `${a.maxDDAtTarget.toFixed(1)}%`, l: 'Worst-Case DD', c: a.maxDDAtTarget < 15 ? '#26A69A' : '#ef4444' }, { v: `${recoveryNeeded.toFixed(1)}%`, l: 'Recovery Needed', c: recoveryNeeded < 20 ? '#26A69A' : '#ef4444' }].map((m, i) => (<div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"><p className="text-lg font-black" style={{ color: m.c }}>{m.v}</p><p className="text-[9px] text-gray-500">{m.l}</p></div>))}</div>
          <div className="space-y-2">{a.criteria.map((c, i) => (<div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${c.met ? 'bg-green-500/5 border-green-500/15' : 'bg-red-500/5 border-red-500/15'}`}><span className={`text-sm mt-0.5 ${c.met ? 'text-green-400' : 'text-red-400'}`}>{c.met ? '✓' : '✗'}</span><div><p className={`text-xs font-bold ${c.met ? 'text-green-400' : 'text-red-400'}`}>{c.name}</p><p className="text-[11px] text-gray-400">{c.detail}</p></div></div>))}</div>
        </motion.div>); })()}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; When to Scale DOWN</p><h2 className="text-2xl font-extrabold mb-4">The Scale-Down Triggers</h2><div className="space-y-3">{scaleDownTriggers.map((item, i) => (<div key={i}><button onClick={() => toggle(`sd-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold" style={{ color: item.color }}>⚠️ {item.trigger}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sd-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sd-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400">&rarr; {item.action}</p></div></motion.div>)}</AnimatePresence></div>))}</div><p className="text-xs text-gray-500 italic mt-3">Scaling down is NOT failure. It is risk management. The best traders scale down faster than they scale up.</p></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Your Risk Ceiling</p><h2 className="text-2xl font-extrabold mb-4">Signs You Have Passed It</h2><div className="p-6 rounded-2xl glass-card"><p className="text-sm text-gray-400 mb-4">Your risk ceiling is where increasing risk <strong className="text-white">stops improving results</strong> and starts degrading execution:</p><div className="space-y-2">{ceilingSigns.map((sign, i) => (<div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"><span className="text-red-400 text-xs">⚠️</span><p className="text-xs text-gray-400">{sign}</p></div>))}</div><p className="text-sm text-gray-400 mt-4">If 2+ of these apply, scale back to where trading felt <strong className="text-white">boring</strong>. Boring is profitable.</p></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Scaling Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors That End Careers</h2><div className="space-y-3">{scalingMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`sm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`sm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`sm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Scaling Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">SCALE LADDER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">0.5% &rarr; 1% &rarr; 1.5% &rarr; 2%. Each step: 50+ trades, stable EV, pre-set DD trigger.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">5 CRITERIA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">100+ trades, EV &gt;0.2%, DD survivable, not in DD, 3+ months. ALL five.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">DD RECOVERY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&minus;10% needs +11.1%. &minus;20% needs +25%. &minus;50% needs +100%. Scale too fast = never recover.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">SCALE DOWN FAST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">10%+ DD = halve risk immediately. Negative EV over 30 = minimum risk. No debate.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">YOUR CEILING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If trading stops being boring, you passed it. Scale back to indifference.</span></p></div>
      </div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Scaling Decision Game</h2><p className="text-gray-400 text-sm mb-6">5 scaling scenarios. Apply the criteria.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — professional risk manager.' : gameScore >= 3 ? 'Good — review DD survivability and Scale Ladder rules.' : 'Re-read the 5 Criteria and Scale Down triggers.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} /><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 via-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30">📈</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Scaling: When and How</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Risk Architect &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
