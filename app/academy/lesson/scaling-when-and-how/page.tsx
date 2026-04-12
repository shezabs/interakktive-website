// app/academy/lesson/scaling-when-and-how/page.tsx
// ATLAS Academy — Lesson 7.11: Scaling: When and How [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: Triple Equity Curve Animation + Interactive Scaling Calculator + Risk Readiness Assessment
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
// ANIMATION 1: Triple Equity Curve — 0.5%, 1%, 2% Risk
// Same 200 trades, same 52% WR, same 1:1.8 R:R — MASSIVE difference
// ============================================================
function TripleEquityCurveAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    const progress = Math.min(1, (t % 12) / 9);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Same Strategy. Same 200 Trades. Different Risk %.', w / 2, 16);

    const pad = 35;
    const chartL = pad + 5;
    const chartR = w - pad;
    const chartW = chartR - chartL;
    const top = 40;
    const bot = h - 40;
    const chartH = bot - top;

    // Seeded pseudo-random for consistent results
    const seed = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    // Generate 200 trade outcomes (52% WR, 1:1.8 avg R:R)
    const totalTrades = 200;
    const visTrades = Math.floor(progress * totalTrades);
    const risks = [0.5, 1, 2];
    const colors = ['#3b82f6', '#26A69A', '#f59e0b'];
    const labels = ['0.5% Risk', '1% Risk', '2% Risk'];

    // Calculate equity curves
    const curves: number[][] = [[], [], []];
    const starts = [10000, 10000, 10000];
    const balances = [...starts];
    const maxDDs = [0, 0, 0];
    const peaks = [...starts];

    for (let i = 0; i <= totalTrades; i++) {
      curves[0].push(balances[0]);
      curves[1].push(balances[1]);
      curves[2].push(balances[2]);

      if (i < totalTrades) {
        const rng = seed(i * 3 + 7);
        const win = rng < 0.52;
        const rrMultiple = win ? (1.4 + seed(i * 5) * 0.8) : -1;

        for (let r = 0; r < 3; r++) {
          const riskAmt = balances[r] * (risks[r] / 100);
          balances[r] += riskAmt * rrMultiple;
          if (balances[r] > peaks[r]) peaks[r] = balances[r];
          const dd = (peaks[r] - balances[r]) / peaks[r] * 100;
          if (dd > maxDDs[r]) maxDDs[r] = dd;
        }
      }
    }

    // Find min/max for Y scaling
    let allMin = Infinity; let allMax = -Infinity;
    curves.forEach(c => {
      c.forEach(v => { if (v < allMin) allMin = v; if (v > allMax) allMax = v; });
    });
    const yRange = allMax - allMin || 1;
    const py = (v: number) => bot - ((v - allMin) / yRange) * chartH;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = top + (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(chartL, y); ctx.lineTo(chartR, y); ctx.stroke();
    }

    // Starting line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(chartL, py(10000)); ctx.lineTo(chartR, py(10000)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('£10,000', chartL - 3, py(10000) + 3);

    // Draw curves (back to front so 2% draws first, 0.5% on top)
    for (let r = 2; r >= 0; r--) {
      const curve = curves[r];
      ctx.beginPath();
      for (let i = 0; i <= visTrades; i++) {
        const x = chartL + (i / totalTrades) * chartW;
        const y = py(curve[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colors[r];
      ctx.lineWidth = r === 1 ? 2 : 1.5;
      ctx.stroke();

      // End label
      if (visTrades > 10) {
        const endX = chartL + (visTrades / totalTrades) * chartW;
        const endY = py(curve[visTrades]);
        ctx.fillStyle = colors[r];
        ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
        const finalVal = `£${Math.round(curve[visTrades]).toLocaleString()}`;
        ctx.fillText(`${labels[r]}: ${finalVal}`, endX + 5, endY + (r - 1) * 14);
      }
    }

    // Trade count label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`Trade ${visTrades} of ${totalTrades}`, w / 2, bot + 14);

    // Max drawdown labels at the end
    if (progress > 0.95) {
      ctx.font = '8px system-ui'; ctx.textAlign = 'center';
      const ddY = bot + 28;
      for (let r = 0; r < 3; r++) {
        const x = chartL + ((r + 1) / 4) * chartW;
        ctx.fillStyle = colors[r];
        ctx.fillText(`Max DD: ${maxDDs[r].toFixed(1)}%`, x, ddY);
      }
    }
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 2: Drawdown Devastation — The Recovery Math
// Shows how drawdown requires exponentially more recovery
// ============================================================
function DrawdownDevastationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const cx = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Drawdown Recovery Trap', cx, 16);

    const rows = [
      { dd: 5, recovery: 5.3, trades: 3, color: '#26A69A', label: 'Minor' },
      { dd: 10, recovery: 11.1, trades: 7, color: '#3b82f6', label: 'Moderate' },
      { dd: 20, recovery: 25.0, trades: 15, color: '#FFB300', label: 'Serious' },
      { dd: 30, recovery: 42.9, trades: 25, color: '#f97316', label: 'Severe' },
      { dd: 40, recovery: 66.7, trades: 40, color: '#ef4444', label: 'Critical' },
      { dd: 50, recovery: 100.0, trades: 60, color: '#ef4444', label: 'FATAL' },
    ];

    const animProgress = Math.min(1, (t % 8) / 5);
    const pad = 15;
    const colLabelW = 55;
    const colDDW = 50;
    const barAreaL = pad + colLabelW + colDDW;
    const barAreaR = w - pad - 40;
    const barMaxW = barAreaR - barAreaL;
    const barH = 28;
    const gap = 8;
    const startY = 38;

    // Headers
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SEVERITY', pad + colLabelW / 2, startY - 6);
    ctx.fillText('DRAWDOWN', pad + colLabelW + colDDW / 2, startY - 6);
    ctx.fillText('% GAIN NEEDED TO RECOVER', (barAreaL + barAreaR) / 2, startY - 6);

    rows.forEach((row, i) => {
      const y = startY + i * (barH + gap);
      const barProgress = Math.max(0, Math.min(1, animProgress * 2 - i * 0.2));
      const barW = (row.recovery / 110) * barMaxW * barProgress;

      // Label
      ctx.fillStyle = row.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(row.label, pad + colLabelW / 2, y + barH / 2 + 3);

      // DD %
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '9px system-ui';
      ctx.fillText(`-${row.dd}%`, pad + colLabelW + colDDW / 2, y + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath(); ctx.roundRect(barAreaL, y, barMaxW, barH, 4); ctx.fill();

      // Bar fill
      if (barW > 0) {
        ctx.fillStyle = row.color + '50';
        ctx.beginPath(); ctx.roundRect(barAreaL, y, barW, barH, 4); ctx.fill();

        // Recovery %
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(`+${row.recovery.toFixed(1)}%`, barAreaL + barW + 4, y + barH / 2 + 3);
      }
    });

    // Insight
    if (animProgress > 0.8) {
      ctx.fillStyle = 'rgba(239,68,68,0.8)';
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('A 50% drawdown needs +100% gain to recover. Scale too fast → you never recover.', cx, h - 10);
    }
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// SCALING CALCULATOR
// ============================================================
interface ScalingInputs {
  currentRisk: number;
  winRate: number;
  avgRR: number;
  totalTrades: number;
  maxConsecLosses: number;
  currentDD: number;
  monthsTrading: number;
  targetRisk: number;
}

const defaultInputs: ScalingInputs = {
  currentRisk: 0.5,
  winRate: 52,
  avgRR: 1.8,
  totalTrades: 0,
  maxConsecLosses: 0,
  currentDD: 0,
  monthsTrading: 0,
  targetRisk: 1,
};

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'You have 45 trades logged with a 55% win rate and 1:2 R:R. Should you scale from 0.5% to 1% risk?', opts: ['Yes — the win rate and R:R are strong', 'No — 45 trades is insufficient sample size (need 100+)', 'Yes — but only if no drawdown this month', 'Depends on how many consecutive losses you\'ve had'], correct: 1 },
  { q: 'The #1 reason traders blow up after scaling is:', opts: ['Bad strategy — the edge disappears at higher risk', 'They scale during a drawdown, compounding losses', 'They scale too slowly and miss the compounding effect', 'They scale based on results, not process metrics'], correct: 3 },
  { q: 'At 2% risk per trade with a 48% win rate, how many consecutive losses can occur before hitting a 10% drawdown?', opts: ['10 losses', '5 losses', 'About 5 losses (5 × 2% = ~10%)', '3 losses'], correct: 2 },
  { q: 'Which metric is MOST important before deciding to scale risk?', opts: ['Win rate — higher WR means you can take more risk', 'Average R:R — bigger R:R compensates for losses', 'Expected Value stability over 100+ trades', 'Monthly profit in £ — if profitable, scale up'], correct: 2 },
  { q: 'You scale from 1% to 2% and immediately hit 4 consecutive losses. The correct response is:', opts: ['Stay at 2% — 4 losses is normal variance', 'Scale back to 1% immediately and re-evaluate after 50 more trades at 1%', 'Scale down to 0.5% — clearly the strategy is broken', 'Double down to 3% to recover the losses faster'], correct: 1 },
  { q: 'A trader with 200 trades, 54% WR, 1:1.9 R:R, max 6 consecutive losses, and 0% current drawdown wants to go from 1% to 2%. Your assessment:', opts: ['Ready — all criteria met, scale up', 'Not ready — max consecutive losses too high for 2%', 'Ready — but scale to 1.5% first as an intermediate step', 'Need more data — 200 trades is not enough'], correct: 2 },
  { q: 'The "Scale Ladder" approach means:', opts: ['Jumping from 0.5% to 2% once profitable', 'Increasing risk by 0.25-0.5% at a time with mandatory stabilisation periods between steps', 'Scaling based on account balance milestones', 'Reducing risk after losses and increasing after wins'], correct: 1 },
  { q: 'If you experience a 15% drawdown at 2% risk, you should:', opts: ['Scale down to 1% until drawdown is recovered, then stabilise for 50 trades before re-scaling', 'Stay at 2% — drawdowns are normal', 'Scale to 3% to recover faster', 'Stop trading for a month'], correct: 0 },
];

const gameRounds = [
  { scenario: '<strong>Scenario:</strong> You\'ve been trading for 3 months at 0.5% risk. 87 trades logged. Win rate: 51%. Average R:R: 1:1.6. EV per trade: +0.29%. Max consecutive losses: 5. Current drawdown: 2%. You want to scale to 1%. Should you?', options: [{ text: 'Yes — 87 trades is close enough to 100, and the stats look good.', correct: false, explain: '87 is NOT 100. The minimum sample is 100 trades for statistical reliability. You\'re 13 trades short. More importantly, your EV per trade is +0.29% — positive but thin. At 1% risk, 5 consecutive losses would put you at -5% drawdown. Complete the 100-trade sample, then reassess.' }, { text: 'Not yet — complete 100 trades first, then reassess. The edge is positive but thin (0.29% EV).', correct: true, explain: 'Correct. Three criteria aren\'t fully met: (1) sample size is below 100, (2) EV of 0.29% is marginal — a few bad trades could flip it negative, (3) only 3 months of data means you haven\'t traded through different market conditions. Finish the 100, track EV stability across the last 50 trades, then decide.' }, { text: 'Scale to 0.75% as a compromise — not 1%, but growth.', correct: false, explain: 'Scaling to 0.75% before completing 100 trades is premature in a different way. The issue isn\'t the risk level — it\'s the data quality. Finish the sample FIRST, then use the Scale Ladder properly.' }] },
  { scenario: '<strong>Scenario:</strong> 150 trades at 1% risk. Win rate: 54%. R:R: 1:2.0. EV per trade: +0.62%. Max consecutive losses: 4. Last 50 trades EV: +0.58% (stable). Current drawdown: 0%. You\'re ready to scale to 1.5%. What\'s the correct process?', options: [{ text: 'Switch to 1.5% on your next trade and evaluate after 50 trades.', correct: false, explain: 'Correct destination, wrong process. You need a "stabilisation window" at the new level. 50 trades is the minimum at 1.5% before considering 2%. But the switch should also include a drawdown trigger — if you hit X% drawdown at the new level, scale back immediately.' }, { text: 'Scale to 1.5% with a drawdown trigger: if you hit 8% DD at 1.5%, immediately scale back to 1%. Evaluate after 50 trades at 1.5%.', correct: true, explain: 'Perfect process. The drawdown trigger is the safety net. At 1.5% risk, 5 consecutive losses = 7.5% drawdown — so your 8% trigger gives you slightly more room than a max consecutive loss streak. After 50 stable trades, reassess for 2%.' }, { text: 'Go straight to 2% — your stats are strong enough to skip 1.5%.', correct: false, explain: 'Doubling risk from 1% to 2% violates the Scale Ladder. The psychological impact of seeing losses doubled is real — even if the math works. 1% → 1.5% → 2% with stabilisation periods is how professionals scale.' }] },
  { scenario: '<strong>Scenario:</strong> You scaled from 1% to 2% three weeks ago. First two weeks were great (+6.2%). This week: 5 consecutive losses. Account is now -4.8% from peak. You feel frustrated. Your next setup looks A-grade. What do you do?', options: [{ text: 'Take the A-grade setup at 2% — the setup quality is what matters, not recent results.', correct: false, explain: 'The setup quality is fine, but YOUR state is compromised. 5 consecutive losses at 2% risk = frustration. The frustration will influence your management (closing too early, moving stops). The issue isn\'t the setup — it\'s you.' }, { text: 'Scale back to 1% immediately. Take the setup at 1%. Stabilise for 50 trades before returning to 2%.', correct: true, explain: 'Correct. The drawdown trigger should have fired at -4.8%. Scale back, stabilise your emotional state, execute at 1% until 50 clean trades confirm the edge is intact. Then — and only then — re-scale. This isn\'t weakness. This is risk management.' }, { text: 'Skip this trade entirely. Wait until next week to reset psychologically.', correct: false, explain: 'Skipping A-grade setups because of recent losses is a fear response, not a strategic one. The correct action is scale DOWN, not stop trading. Continuing to execute at reduced risk maintains the data flow and process while protecting capital.' }] },
  { scenario: '<strong>Scenario:</strong> Your trading friend tells you: "I went from 1% to 3% risk last month and my account grew 18%. You\'re still at 0.5% — you\'re leaving money on the table." He has 60 trades logged. What do you tell him?', options: [{ text: '"Great results! I should scale faster too."', correct: false, explain: 'His 18% gain proves nothing about process quality. 60 trades at 3% risk means 3 consecutive losses = 9% drawdown. 5 losses = 15%. His sample is too small to know if the edge is real, and 3% risk on an unproven edge is Russian roulette.' }, { text: '"60 trades isn\'t enough to know if your edge is real. One bad streak at 3% could wipe out everything."', correct: true, explain: 'Correct. At 3% risk, 7 consecutive losses (which WILL happen eventually) = 21% drawdown. He needs +26.6% just to recover. His 60-trade sample hasn\'t encountered a max adversity period yet. When it does, at 3% risk, the account won\'t survive it.' }, { text: '"It depends on your win rate and R:R — if the stats are strong, 3% is fine."', correct: false, explain: 'No win rate or R:R makes 3% risk appropriate on 60 trades. The issue isn\'t the STATS — it\'s the CONFIDENCE INTERVAL. 60 trades means the true WR could be ±7% from observed. A 52% observed WR could be 45% true WR — and 3% risk on a 45% WR is a guaranteed blowup.' }] },
  { scenario: '<strong>Scenario:</strong> You\'ve been at 2% risk for 100 trades. Stats: 53% WR, 1:1.9 R:R, EV +0.55%. Max DD was 11.2% (recovered). You want to go to 2.5%. But your max consecutive losses ever recorded is 7. At 2.5% risk, 7 consecutive losses = 17.5% drawdown. You need +21.2% to recover from that. Assessment?', options: [{ text: 'Scale to 2.5% — your EV is positive and the max DD of 11.2% was recovered.', correct: false, explain: 'The recovery from 11.2% at 2% risk took time and psychological capital. At 2.5%, your SAME max consecutive loss streak (7) would create a 17.5% hole — 56% deeper than your worst-ever drawdown. You\'d need +21.2% to recover. Your EV of +0.55% per trade means that recovery takes ~38 trades minimum. That\'s 2-3 months of just getting back to even.' }, { text: 'Stay at 2%. The math shows 2.5% would create a max DD you may not survive psychologically or mathematically.', correct: true, explain: 'Correct. This is where compounding math meets reality. Your max consecutive loss streak of 7 AT YOUR CURRENT RISK already created an 11.2% drawdown. Scaling to 2.5% makes that same streak create 17.5%. The strategy didn\'t get better — you just made the downside 56% worse. 2% may be your ceiling for this strategy.' }, { text: 'Scale to 2.25% as a compromise — slightly higher but not 2.5%.', correct: false, explain: '2.25% means 7 consecutive losses = 15.75% drawdown. Still significantly worse than your max ever DD (11.2%). The issue isn\'t finding the "right" number above 2% — it\'s recognising that 2% may be the optimal risk level for this strategy\'s profile.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ScalingWhenAndHowPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Scaling Calculator state
  const [inputs, setInputs] = useState<ScalingInputs>(defaultInputs);
  const [calcDone, setCalcDone] = useState(false);

  const updateInput = (field: keyof ScalingInputs, value: number) => {
    setInputs(p => ({ ...p, [field]: value }));
    setCalcDone(false);
  };

  const getEV = (): number => {
    const wr = inputs.winRate / 100;
    return (wr * inputs.avgRR) - ((1 - wr) * 1);
  };

  const getScalingAssessment = (): { criteria: { name: string; met: boolean; detail: string; weight: number }[]; score: number; verdict: string; color: string } => {
    const ev = getEV();
    const maxDDAtTarget = inputs.maxConsecLosses * inputs.targetRisk;

    const criteria = [
      { name: 'Sample Size (100+ trades)', met: inputs.totalTrades >= 100, detail: inputs.totalTrades >= 100 ? `${inputs.totalTrades} trades — sufficient data.` : `Only ${inputs.totalTrades} trades — need ${100 - inputs.totalTrades} more. Statistical confidence requires 100+ trades.`, weight: 25 },
      { name: 'Positive EV (>0.2% per trade)', met: ev > 0.2, detail: ev > 0.2 ? `EV per trade: +${(ev * inputs.currentRisk).toFixed(2)}% — edge confirmed.` : `EV per trade: ${(ev * inputs.currentRisk).toFixed(2)}% — edge too thin or negative. Do not scale.`, weight: 25 },
      { name: 'Drawdown Survivability', met: maxDDAtTarget < 15, detail: maxDDAtTarget < 15 ? `Worst-case DD at ${inputs.targetRisk}%: ${maxDDAtTarget.toFixed(1)}% — survivable.` : `Worst-case DD at ${inputs.targetRisk}%: ${maxDDAtTarget.toFixed(1)}% — DANGEROUS. ${inputs.maxConsecLosses} consecutive losses × ${inputs.targetRisk}% = ${maxDDAtTarget.toFixed(1)}%.`, weight: 20 },
      { name: 'Not Currently in Drawdown', met: inputs.currentDD < 3, detail: inputs.currentDD < 3 ? `Current DD: ${inputs.currentDD}% — account near highs.` : `Current DD: ${inputs.currentDD}% — NEVER scale during a drawdown. Recover first.`, weight: 15 },
      { name: 'Minimum 3 Months at Current Risk', met: inputs.monthsTrading >= 3, detail: inputs.monthsTrading >= 3 ? `${inputs.monthsTrading} months at ${inputs.currentRisk}% — stability demonstrated.` : `Only ${inputs.monthsTrading} month(s) at ${inputs.currentRisk}%. Need 3+ months to encounter different market conditions.`, weight: 15 },
    ];

    const score = criteria.reduce<number>((s, c) => s + (c.met ? c.weight : 0), 0);
    let verdict = '';
    let color = '';
    if (score >= 90) { verdict = 'READY TO SCALE'; color = '#26A69A'; }
    else if (score >= 70) { verdict = 'ALMOST READY — address remaining criteria'; color = '#FFB300'; }
    else if (score >= 50) { verdict = 'NOT READY — multiple criteria unmet'; color = '#f97316'; }
    else { verdict = 'DO NOT SCALE — fundamental requirements missing'; color = '#ef4444'; }

    return { criteria, score, verdict, color };
  };

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(gameRounds.map(() => null));
  const [gameScore, setGameScore] = useState(0);
  const handleGameAnswer = (optIdx: number) => { if (gameAnswers[gameRound] !== null) return; const newA = [...gameAnswers]; newA[gameRound] = optIdx; setGameAnswers(newA); if (gameRounds[gameRound].options[optIdx].correct) setGameScore(s => s + 1); };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const [quizDone, setQuizDone] = useState(false);
  const quizScore = quizDone ? Math.round(quizAnswers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0) / quizQuestions.length * 100) : 0;
  const certUnlocked = quizDone && quizScore >= 66;
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const n = [...quizAnswers]; n[qi] = oi; setQuizAnswers(n); };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/academy" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">&larr; Back to Academy</Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">Scaling: When and How</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">The difference between 0.5% and 2% risk over 200 trades is the difference between steady growth and life-changing compounding. But scale too soon and you&rsquo;ll never recover.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">Imagine two drivers in identical cars on the same road. One drives at <strong className="text-white">50 mph</strong> — safe, controlled, arrives in good time. The other drives at <strong className="text-white">120 mph</strong> — much faster, but one sharp corner and the car is in the barrier. The destination is the same. The speed determines whether you arrive. Scaling risk is choosing your speed. Too slow and you waste time. <strong className="text-white">Too fast and you never arrive.</strong></p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">Three traders ran the same strategy over 200 trades (52% WR, 1:1.8 R:R). Trader A at <strong className="text-[#3b82f6]">0.5% risk: £10,000 → £11,800</strong> (+18%). Trader B at <strong className="text-[#26A69A]">1% risk: £10,000 → £14,200</strong> (+42%). Trader C at <strong className="text-[#f59e0b]">2% risk: £10,000 → £19,600</strong> (+96%). But Trader C also experienced a <strong className="text-red-400">22% max drawdown</strong> vs Trader A&rsquo;s 5.8%. One bad month at 2% and Trader C nearly quit. Trader A never sweated.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 — Animation 1: Triple Equity Curve */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Compounding Divergence</h2>
          <TripleEquityCurveAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Same 200 trades, same win rate, same R:R. Only the risk % differs. The gap is exponential.</p>
        </motion.div>
      </section>

      {/* S02 — Animation 2: Drawdown Recovery */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Drawdown Recovery Trap</h2>
          <DrawdownDevastationAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Drawdown recovery is exponential. A 50% loss needs a 100% gain. This is why scaling too fast is fatal.</p>
        </motion.div>
      </section>

      {/* S03 — The Scale Ladder */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The Scale Ladder</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: 'Step 1: 0.25-0.5% Risk (Proving Ground)', content: '<strong>Duration:</strong> First 100 trades minimum (3+ months).<br/><br/><strong>Purpose:</strong> Prove the edge exists in live conditions. Your ONLY goal is data quality — not profit. At 0.5%, a 10-trade losing streak costs 5%. Survivable. Learnable. Zero emotional pressure.<br/><br/><strong>Criteria to advance:</strong> 100+ trades, positive EV over last 50, max consecutive losses recorded, 3+ months at this level.' },
              { id: 's03b', num: '02', title: 'Step 2: 0.75-1% Risk (Building Phase)', content: '<strong>Duration:</strong> 50-100 trades (2-3 months).<br/><br/><strong>Purpose:</strong> Test your psychology at meaningful risk. At 1%, losses feel real. Your management quality is now being tested — not just your setup selection. Track management compliance %.<br/><br/><strong>Criteria to advance:</strong> 50+ trades at this level with stable EV, management compliance >80%, max DD survived and recovered, 2+ months at this level.' },
              { id: 's03c', num: '03', title: 'Step 3: 1.5% Risk (Growth Phase)', content: '<strong>Duration:</strong> 50+ trades (2+ months).<br/><br/><strong>Purpose:</strong> Compounding becomes visible. The psychological pressure increases — losses at 1.5% HURT. This is where most traders discover their true risk tolerance. Some belong here permanently. That is not a failure.<br/><br/><strong>Criteria to advance:</strong> 50+ trades, EV stable, max DD < 12%, emotional state consistently calm, zero revenge trades.' },
              { id: 's03d', num: '04', title: 'Step 4: 2% Risk (Performance Phase)', content: '<strong>Duration:</strong> Ongoing (or permanent ceiling).<br/><br/><strong>Purpose:</strong> Maximum compounding for most strategies. At 2%, a 7-trade losing streak = 14% drawdown. This is the CEILING for most retail traders and many professionals. Going beyond 2% requires exceptional win rates (>55%) and R:R (>2.0).<br/><br/><strong>The truth:</strong> Many elite traders never go above 1.5%. Finding your optimal risk is more important than reaching 2%.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — The 5 Scaling Criteria */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 5 Scaling Criteria</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">ALL 5 Must Be Met Before Scaling</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-2">
              {[
                { num: '1', title: '100+ Trades at Current Risk', desc: 'Statistical reliability requires sample size. Below 100, your WR and R:R could shift by ±5-7%. Build the data first.', color: '#3b82f6' },
                { num: '2', title: 'Positive EV >0.2% Per Trade', desc: 'Your Expected Value must be positive AND stable across the last 50 trades. A thin edge (0.1%) can flip negative with minor changes.', color: '#26A69A' },
                { num: '3', title: 'Drawdown Survivability Check', desc: 'Max consecutive losses × target risk % must be <15% drawdown. If 7 losses × 2% = 14% — survivable. If 7 × 3% = 21% — fatal.', color: '#FFB300' },
                { num: '4', title: 'Not Currently in Drawdown', desc: 'NEVER scale during a drawdown. You are compounding losses, not gains. Recover to new equity highs first, then stabilise.', color: '#ef4444' },
                { num: '5', title: '3+ Months at Current Risk Level', desc: 'Different market conditions (trending, ranging, volatile, dead) test your edge differently. 3 months minimum exposure.', color: '#a855f7' },
              ].map(c => (
                <div key={c.num} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: c.color + '20', color: c.color }}>{c.num}</span>
                    <p className="text-xs font-bold text-white">{c.title}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 pl-7">{c.desc}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: Interactive Scaling Calculator + Risk Readiness Assessment */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">Scaling Readiness Calculator</h2></div>
          <p className="text-sm text-gray-400 mb-6">Input your current stats. The calculator assesses whether you&rsquo;re ready to scale and identifies what&rsquo;s holding you back.</p>

          <div className="space-y-4">
            {/* Input grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Current Risk %</label>
                <input type="number" step="0.25" min="0.25" max="5" value={inputs.currentRisk} onChange={e => updateInput('currentRisk', parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Target Risk %</label>
                <input type="number" step="0.25" min="0.5" max="5" value={inputs.targetRisk} onChange={e => updateInput('targetRisk', parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Win Rate %</label>
                <input type="number" step="1" min="0" max="100" value={inputs.winRate} onChange={e => updateInput('winRate', parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Avg R:R (e.g. 1.8)</label>
                <input type="number" step="0.1" min="0" max="10" value={inputs.avgRR} onChange={e => updateInput('avgRR', parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Total Trades Logged</label>
                <input type="number" step="1" min="0" value={inputs.totalTrades} onChange={e => updateInput('totalTrades', parseInt(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Max Consecutive Losses</label>
                <input type="number" step="1" min="0" value={inputs.maxConsecLosses} onChange={e => updateInput('maxConsecLosses', parseInt(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Current Drawdown %</label>
                <input type="number" step="0.5" min="0" value={inputs.currentDD} onChange={e => updateInput('currentDD', parseFloat(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">Months at Current Risk</label>
                <input type="number" step="1" min="0" value={inputs.monthsTrading} onChange={e => updateInput('monthsTrading', parseInt(e.target.value) || 0)} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:border-amber-500/30 outline-none" />
              </div>
            </div>

            <button onClick={() => setCalcDone(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Assess Scaling Readiness →</button>

            {/* Results */}
            {calcDone && (() => {
              const assessment = getScalingAssessment();
              const ev = getEV();
              const maxDDAtTarget = inputs.maxConsecLosses * inputs.targetRisk;
              const recoveryNeeded = (1 / (1 - maxDDAtTarget / 100) - 1) * 100;
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Verdict */}
                  <div className="p-5 rounded-2xl text-center border" style={{ borderColor: assessment.color + '30', background: assessment.color + '08' }}>
                    <p className="text-2xl font-black mb-1" style={{ color: assessment.color }}>{assessment.score}%</p>
                    <p className="text-sm font-bold" style={{ color: assessment.color }}>{assessment.verdict}</p>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-lg font-black" style={{ color: ev > 0.2 ? '#26A69A' : ev > 0 ? '#FFB300' : '#ef4444' }}>{(ev * inputs.currentRisk).toFixed(2)}%</p>
                      <p className="text-[10px] text-gray-500">EV/Trade</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-lg font-black" style={{ color: maxDDAtTarget < 10 ? '#26A69A' : maxDDAtTarget < 15 ? '#FFB300' : '#ef4444' }}>{maxDDAtTarget.toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-500">Worst-Case DD</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-lg font-black" style={{ color: recoveryNeeded < 20 ? '#26A69A' : recoveryNeeded < 30 ? '#FFB300' : '#ef4444' }}>{recoveryNeeded.toFixed(1)}%</p>
                      <p className="text-[10px] text-gray-500">Recovery Needed</p>
                    </div>
                  </div>

                  {/* Criteria checklist */}
                  <div className="space-y-2">
                    {assessment.criteria.map((c, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${c.met ? 'bg-green-500/5 border-green-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                        <span className={`text-sm mt-0.5 ${c.met ? 'text-green-400' : 'text-red-400'}`}>{c.met ? '✓' : '✗'}</span>
                        <div>
                          <p className={`text-xs font-bold ${c.met ? 'text-green-400' : 'text-red-400'}`}>{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* S06 — Scaling Down Rules */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">When to Scale DOWN</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s06')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">04</span><span className="flex-1 text-sm font-semibold text-gray-200">The Scale-Down Triggers (Non-Negotiable)</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s06'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s06'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { trigger: 'Drawdown exceeds 10% at current risk level', action: 'Immediately reduce risk by 50% (e.g., 2% → 1%). Stabilise for 50 trades before re-scaling.', color: '#ef4444' },
                { trigger: 'EV turns negative over last 30 trades', action: 'Scale to minimum risk (0.25-0.5%). Diagnose whether the edge has changed or it\'s variance.', color: '#ef4444' },
                { trigger: 'Emotional state consistently reactive (3+ consecutive sessions)', action: 'Reduce risk to the level where you can trade "boringly". The risk is too high for your current psychology.', color: '#FFB300' },
                { trigger: 'New market conditions (major regime change, different volatility)', action: 'Reduce to your "proven" risk level. Re-prove the edge in new conditions before re-scaling.', color: '#FFB300' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-1" style={{ color: item.color }}>⚠️ {item.trigger}</p>
                  <p className="text-xs text-gray-400">→ {item.action}</p>
                </div>
              ))}
              <p className="text-xs text-gray-500 italic">Scaling down is NOT failure. It is risk management. The best traders scale down faster than they scale up.</p>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S07 — The Risk Ceiling */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Finding Your Risk Ceiling</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s07')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">05</span><span className="flex-1 text-sm font-semibold text-gray-200">Why Your Optimal Risk Might Be Lower Than You Think</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s07'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s07'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              <p className="text-sm text-gray-400 leading-relaxed">Your risk ceiling is the point where increasing risk <strong className="text-white">stops improving results</strong> and starts degrading your execution quality. Signs you&rsquo;ve passed it:</p>
              <div className="space-y-2">
                {[
                  'You check P&L during trades (didn\'t before scaling)',
                  'You close winners earlier than planned',
                  'You feel relief after a trade instead of indifference',
                  'You think about open positions outside market hours',
                  'Your management compliance % has dropped since scaling',
                ].map((sign, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-xs text-gray-400">{sign}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">If you experience 2+ of these, you&rsquo;ve passed your ceiling. Scale back to where trading felt <strong className="text-white">boring</strong>. Boring is profitable. Exciting is expensive.</p>
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S08 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Common Scaling Mistakes</h2>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s08')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">06</span><span className="flex-1 text-sm font-semibold text-gray-200">4 Scaling Errors That End Careers</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s08'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s08'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { title: 'Scaling Based on Results, Not Process', mistake: '"I made 15% last month, time to double my risk." One winning month is not validation. You need 100+ trades and 3+ months.', fix: 'Scale based on the 5 criteria, not recent P&L.' },
                { title: 'Scaling During a Winning Streak', mistake: 'Feeling invincible after 8 consecutive winners and doubling risk. The winning streak WILL end — and the first loss at double risk will wipe out 2 wins.', fix: 'Never scale based on streaks. Streaks are variance, not edge improvement.' },
                { title: 'Not Having a Scale-Down Plan', mistake: 'Knowing when to scale UP but not when to scale DOWN. The drawdown arrives and you "hope" through it at elevated risk.', fix: 'Every scale-up must have a pre-defined drawdown trigger for scaling back. No trigger = no scaling.' },
                { title: 'Comparing Your Risk to Others', mistake: '"He trades at 3% and is profitable." His sample size, psychology, strategy, and drawdown tolerance are NOT yours. His risk is irrelevant.', fix: 'Your risk ceiling is personal. Compare your current stats to your criteria — not to other people.' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white mb-2">{item.title}</p>
                  <p className="text-xs text-red-400 mb-2">❌ {item.mistake}</p>
                  <p className="text-xs text-green-400">✓ {item.fix}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Scale Ladder', content: '0.5% → 1% → 1.5% → 2%. Each step: 50+ trades, stable EV, pre-set drawdown trigger.', color: '#f59e0b' },
              { title: '5 Criteria', content: '100+ trades, EV >0.2%, DD survivable, not in DD, 3+ months. ALL five before scaling.', color: '#26A69A' },
              { title: 'DD Recovery', content: '-10% needs +11.1%. -20% needs +25%. -50% needs +100%. Scale too fast = never recover.', color: '#ef4444' },
              { title: 'Scale Down Fast', content: '10%+ DD = halve risk immediately. Negative EV over 30 trades = minimum risk. No debate.', color: '#3b82f6' },
              { title: 'Your Ceiling', content: 'If trading stops being boring, you passed your ceiling. Scale back to where it felt indifferent.', color: '#a855f7' },
              { title: 'The Rule', content: 'Scale based on PROCESS metrics, never on recent P&L or winning streaks. Data > feelings.', color: '#FFB300' },
            ].map((card, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-bold mb-1" style={{ color: card.color }}>{card.title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-2">Test Your Knowledge</h2>
          <p className="text-gray-400 text-sm mb-6">5 scaling decision scenarios. Apply the criteria.</p>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-xs tracking-widest uppercase text-amber-400 font-bold mb-3">Round {gameRound + 1} of {gameRounds.length}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-3">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                const cls = !answered ? 'bg-white/[0.03] border border-white/10 hover:border-amber-500/30' : isCorrect ? 'bg-green-500/10 border border-green-500/30' : selected ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.02] border border-white/5 opacity-50';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you understand risk scaling like a professional risk manager.' : gameScore >= 3 ? 'Good — review the drawdown survivability math and Scale Ladder stabilisation rules.' : 'Re-read the 5 Criteria and the Scale Down triggers, then retry.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 via-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30">📈</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Scaling: When and How</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Risk Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
