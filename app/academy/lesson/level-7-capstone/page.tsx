// app/academy/lesson/level-7-capstone/page.tsx
// ATLAS Academy — Lesson 7.14: Your First 100 Live Trades — Capstone [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7 · CAPSTONE
// GROUNDBREAKING: 100-Trade Go Live Plan Builder (8 interactive sections)
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
// ANIMATION 1: Journey Map — 4 phases, 3 gates, animated progression
// ============================================================
function JourneyMapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2; const progress = Math.min(1, (t % 14) / 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The 100-Trade Journey \u2014 4 Phases, 3 Gates', cx, 16);
    const phases = [{ name: 'DEMO', trades: '1\u201330', icon: '\ud83c\udf93', color: '#3b82f6', desc: 'Prove the model' }, { name: 'MICRO', trades: '31\u201360', icon: '\ud83d\udd2c', color: '#8b5cf6', desc: 'Feel real money' }, { name: 'FULL RISK', trades: '61\u2013100', icon: '\u26a1', color: '#f59e0b', desc: 'Your true edge' }, { name: 'SCALE', trades: '101+', icon: '\ud83d\ude80', color: '#26A69A', desc: 'Proven. Funded.' }];
    const pad = 20; const phaseW = (w - pad * 2) / 4; const midY = h / 2; const nodeR = 28; const activeIdx = Math.min(3, Math.floor(progress * 4.5));
    for (let i = 0; i < 3; i++) { const x1 = pad + (i + 0.5) * phaseW + nodeR + 5; const x2 = pad + (i + 1.5) * phaseW - nodeR - 5; const lit = i < activeIdx; const gx = (x1 + x2) / 2;
      ctx.save(); ctx.translate(gx, midY); ctx.rotate(Math.PI / 4); ctx.fillStyle = lit ? '#f59e0b30' : 'rgba(255,255,255,0.03)'; ctx.fillRect(-8, -8, 16, 16); ctx.strokeStyle = lit ? '#f59e0b60' : 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.strokeRect(-8, -8, 16, 16); ctx.restore();
      ctx.strokeStyle = lit ? phases[i].color + '50' : 'rgba(255,255,255,0.06)'; ctx.lineWidth = lit ? 1.5 : 0.5; ctx.setLineDash(lit ? [] : [3, 3]); ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(gx - 12, midY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(gx + 12, midY); ctx.lineTo(x2, midY); ctx.stroke(); ctx.setLineDash([]);
      if (lit) { ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 6px system-ui'; ctx.textAlign = 'center'; ctx.fillText('GATE', gx, midY - 14); }
    }
    phases.forEach((p, i) => { const x = pad + (i + 0.5) * phaseW; const isActive = i <= activeIdx; const isCurrent = i === activeIdx; const pulse = isCurrent ? Math.sin(t * 3) * 0.1 + 0.9 : 1;
      if (isCurrent) { ctx.beginPath(); ctx.arc(x, midY, nodeR + 8, 0, Math.PI * 2); ctx.fillStyle = p.color + '10'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, midY, nodeR * pulse, 0, Math.PI * 2); ctx.fillStyle = isActive ? p.color + '15' : 'rgba(255,255,255,0.02)'; ctx.fill(); ctx.strokeStyle = isActive ? p.color + '70' : 'rgba(255,255,255,0.06)'; ctx.lineWidth = isCurrent ? 2 : 1; ctx.stroke();
      ctx.font = `${isActive ? 18 : 14}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(p.icon, x, midY + 6);
      ctx.fillStyle = isActive ? p.color : 'rgba(255,255,255,0.15)'; ctx.font = `${isCurrent ? 'bold ' : ''}${isActive ? 9 : 7}px system-ui`; ctx.fillText(p.name, x, midY - nodeR - 10);
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'; ctx.font = '7px system-ui'; ctx.fillText(`Trades ${p.trades}`, x, midY + nodeR + 14);
      if (isCurrent) { ctx.fillStyle = p.color + '90'; ctx.font = '7px system-ui'; ctx.fillText(p.desc, x, midY + nodeR + 28); }
    });
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// ANIMATION 2: Gate Criteria — 3 gate cards, pass/fail reveal
// ============================================================
function GateCriteriaAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('The 3 Gates \u2014 Each Must Be Passed', w / 2, 16);
    const gates = [{ name: 'GATE 1: Demo \u2192 Micro', criteria: ['30+ demo trades', 'WR > 45%', 'EV positive', 'Journal complete'], color: '#3b82f6' }, { name: 'GATE 2: Micro \u2192 Full', criteria: ['30+ micro trades', 'EV still positive', 'No revenge trades', 'Emotions managed'], color: '#8b5cf6' }, { name: 'GATE 3: Full \u2192 Scale', criteria: ['40+ full-risk trades', 'EV > +0.3%', 'Max DD < 8%', 'Compliance > 80%'], color: '#f59e0b' }];
    const pad = 15; const colW = (w - pad * 2) / 3; const activeGate = Math.floor((t % 12) / 4) % 3; const animProgress = Math.min(1, (t % 4) / 3);
    gates.forEach((gate, gi) => { const x = pad + gi * colW; const y = 35; const cardW = colW - 8; const cardH = h - 50; const isActive = gi === activeGate;
      ctx.fillStyle = isActive ? gate.color + '08' : 'rgba(255,255,255,0.01)'; ctx.beginPath(); ctx.roundRect(x + 4, y, cardW, cardH, 8); ctx.fill();
      ctx.strokeStyle = isActive ? gate.color + '40' : 'rgba(255,255,255,0.04)'; ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.beginPath(); ctx.roundRect(x + 4, y, cardW, cardH, 8); ctx.stroke();
      ctx.fillStyle = isActive ? gate.color : 'rgba(255,255,255,0.2)'; ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(gate.name, x + 4 + cardW / 2, y + 20);
      gate.criteria.forEach((c, ci) => { const cy = y + 40 + ci * 28; const revealed = isActive && animProgress > ci * 0.2;
        if (revealed) { ctx.beginPath(); ctx.arc(x + 18, cy, 7, 0, Math.PI * 2); ctx.fillStyle = gate.color + '30'; ctx.fill(); ctx.fillStyle = gate.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('\u2713', x + 18, cy + 3); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left'; ctx.fillText(c, x + 32, cy + 3); }
        else { ctx.beginPath(); ctx.arc(x + 18, cy, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5; ctx.stroke(); }
      });
    });
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// CONTENT DATA
// ============================================================
const fourPhases = [
  { title: '\ud83c\udf93 Phase 1: Demo (Trades 1\u201330)', desc: '<strong>Duration:</strong> 2\u20134 weeks. <strong>Risk:</strong> \u00a30.<br/><br/>Prove the model works with real market data. Build the journaling habit. Make every mistake while it costs nothing.<br/><br/><strong>Gate 1 Criteria:</strong> 30+ trades, WR &gt;45%, EV positive, journal complete for every trade.<br/><br/><strong>The trap:</strong> After 15 wins, demo feels \u201ctoo easy.\u201d The losing streak hasn\u2019t arrived yet. It will.' },
  { title: '\ud83d\udd2c Phase 2: Micro-Risk (Trades 31\u201360)', desc: '<strong>Duration:</strong> 3\u20134 weeks. <strong>Risk:</strong> 0.25%.<br/><br/>Discover how real money changes behaviour. \u00a36.25 losses feel VERY different from demo. This is the phase where loss aversion surfaces.<br/><br/><strong>Gate 2 Criteria:</strong> 30+ micro trades, EV positive with real money, zero revenge trades, emotional state managed.<br/><br/><strong>The trap:</strong> Paralysis after 2\u20133 losses. The hesitation IS the lesson. Stay at micro until it normalises.' },
  { title: '\u26a1 Phase 3: Full Risk (Trades 61\u2013100)', desc: '<strong>Duration:</strong> 4\u20136 weeks. <strong>Risk:</strong> 0.5\u20131.0%.<br/><br/>Your true edge with meaningful risk. This data represents REAL performance. Every metric here is your truth.<br/><br/><strong>Gate 3 Criteria:</strong> 40+ trades, EV &gt;+0.3%, max DD &lt;8%, rule compliance &gt;80%.<br/><br/><strong>The truth:</strong> Not everyone passes Gate 3 first attempt. Go back to micro, diagnose, fix, re-attempt. That\u2019s not failure \u2014 that\u2019s the system working.' },
  { title: '\ud83d\ude80 Phase 4: Scale (Trades 101+)', desc: '<strong>Duration:</strong> Ongoing.<br/><br/>Edge proven. Follow the Scale Ladder (Lesson 7.11). Consider prop challenges (only after 100+ personal trades). Add instruments cautiously (Lesson 7.12). Weekly reviews every Sunday (Lesson 7.13).<br/><br/><strong>You made it:</strong> 100 trades completed. Process proven. Edge quantified. You are a data-driven trader.' },
];

const mindsetShifts = [
  { shift: 'From Outcome to Process', before: '\u201cDid I make money today?\u201d', after: '\u201cDid I follow my process today?\u201d', why: 'Outcomes vary daily. Process quality is the only controllable variable.', color: '#3b82f6' },
  { shift: 'From Individual Trades to Sample Size', before: '\u201cThis trade MUST win.\u201d', after: '\u201cThis trade is 1 of 100. The BATCH determines success.\u201d', why: 'No single trade matters. Your edge only plays out over 100+.', color: '#26A69A' },
  { shift: 'From Speed to Sustainability', before: '\u201cI need \u00a3X this month.\u201d', after: '\u201cI need to survive and compound for 12+ months.\u201d', why: 'Fast money attracts fast losses. Slow and boring wins.', color: '#f59e0b' },
];

const capstoneMistakes = [
  { title: 'Skipping Demo', mistake: '\u201cI already know the strategy.\u201d You know the THEORY. You don\u2019t know the EXECUTION. Demo proves execution quality.', fix: 'Complete 30 demo trades minimum. No exceptions. No shortcuts.' },
  { title: 'Jumping Risk Levels', mistake: '\u201cMicro is too slow.\u201d Micro isn\u2019t about speed \u2014 it\u2019s about psychological calibration to real money.', fix: 'Skip micro and live trading feels like a war zone. Stay at 0.25% until the swings feel normal.' },
  { title: 'Moving the Gates', mistake: '\u201c48% WR after 28 trades, close enough.\u201d Gates are MINIMUM thresholds, not suggestions.', fix: 'If you can\u2019t meet the criteria, you\u2019re not ready. The criteria exist to protect your capital.' },
  { title: 'Comparing to Others', mistake: '\u201cMy friend is already funded after 3 months.\u201d His timeline is completely irrelevant to yours.', fix: '62% of plan-followers survive 12 months. 23% of rushers do. Be in the 62%.' },
];

const planSections = [
  { id: 'strategy', title: 'Strategy Summary', icon: '\ud83e\udded', fields: [{ key: 'instrument', label: 'Primary Instrument', type: 'select' as const, options: ['XAUUSD', 'EUR/USD', 'GBP/USD', 'NASDAQ', 'US30', 'USD/JPY'] }, { key: 'model', label: 'Primary Model', type: 'select' as const, options: ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest'] }, { key: 'session', label: 'Kill Zone', type: 'select' as const, options: ['Asia (00\u201308 UTC)', 'London (07\u201316 UTC)', 'LON-NY Overlap (12\u201316 UTC)', 'New York (12\u201321 UTC)'] }, { key: 'htfBias', label: 'HTF Bias Method', type: 'textarea' as const, placeholder: 'e.g., Daily candle direction + 4H structure...' }] },
  { id: 'demo', title: 'Demo Phase (1\u201330)', icon: '\ud83c\udf93', fields: [{ key: 'demoDuration', label: 'Duration', type: 'select' as const, options: ['2 weeks', '3 weeks', '4 weeks', '6 weeks'] }, { key: 'demoGoal', label: 'Primary Goal', type: 'textarea' as const, placeholder: 'e.g., 30 trades following all rules. Target: positive EV, >45% WR.' }, { key: 'demoGate', label: 'Gate 1 Criteria', type: 'textarea' as const, placeholder: 'e.g., 30 trades, WR >45%, positive EV, complete journal...' }] },
  { id: 'micro', title: 'Micro-Risk Phase (31\u201360)', icon: '\ud83d\udd2c', fields: [{ key: 'microRisk', label: 'Risk Per Trade', type: 'select' as const, options: ['0.10%', '0.25%', '0.50%'] }, { key: 'microFocus', label: 'Focus Area', type: 'textarea' as const, placeholder: 'e.g., Emotional management with real money on the line...' }, { key: 'microGate', label: 'Gate 2 Criteria', type: 'textarea' as const, placeholder: 'e.g., 30 micro trades, EV positive, zero revenge trades...' }] },
  { id: 'full', title: 'Full Risk Phase (61\u2013100)', icon: '\u26a1', fields: [{ key: 'fullRisk', label: 'Risk Per Trade', type: 'select' as const, options: ['0.50%', '0.75%', '1.00%'] }, { key: 'fullTarget', label: 'Performance Targets', type: 'textarea' as const, placeholder: 'e.g., WR >48%, EV >+0.3%, max DD <8%, compliance >80%...' }, { key: 'fullGate', label: 'Gate 3 Criteria', type: 'textarea' as const, placeholder: 'e.g., 40 trades, EV >+0.3%, max DD <8%, compliance >80%...' }] },
  { id: 'walkaway', title: 'Walk-Away Rules', icon: '\ud83d\udeb6', fields: [{ key: 'dailyCap', label: 'Daily Loss Cap', type: 'select' as const, options: ['1% of account', '2% of account', '3% of account'] }, { key: 'dailyMax', label: 'Max Trades Per Day', type: 'select' as const, options: ['1', '2', '3'] }, { key: 'consecLoss', label: 'Consecutive Loss Rule', type: 'select' as const, options: ['2 losses \u2192 stop for day', '3 losses \u2192 stop for day', '2 losses \u2192 halve risk'] }, { key: 'emotionalRule', label: 'Emotional Walk-Away', type: 'textarea' as const, placeholder: 'e.g., If reactive/tilted, close charts immediately...' }] },
  { id: 'scaling', title: 'Scaling Milestones', icon: '\ud83d\udcc8', fields: [{ key: 'scale1', label: 'First Scale-Up', type: 'textarea' as const, placeholder: 'e.g., After 100 trades with +0.3% EV \u2192 increase 0.5% to 0.75%' }, { key: 'scale2', label: 'Second Scale-Up', type: 'textarea' as const, placeholder: 'e.g., After 50 more trades stable \u2192 increase to 1.0%' }, { key: 'scaleDown', label: 'Scale-Down Trigger', type: 'textarea' as const, placeholder: 'e.g., DD >10% \u2192 halve risk. 50 trades to re-qualify.' }] },
  { id: 'prop', title: 'Prop Firm Selection', icon: '\ud83c\udfe2', fields: [{ key: 'propTiming', label: 'When to Attempt', type: 'select' as const, options: ['After 100 personal trades', 'After 200 personal trades', 'After 6 months profitable', 'Not planning prop'] }, { key: 'propCriteria', label: 'Firm Criteria', type: 'textarea' as const, placeholder: 'e.g., 2-step, 8% target, 5% daily DD, no time limit...' }, { key: 'propPlan', label: 'Challenge Strategy', type: 'textarea' as const, placeholder: 'e.g., Same strategy, 1% risk, max 2 trades/day...' }] },
  { id: 'review', title: 'Monthly Review', icon: '\ud83d\udccb', fields: [{ key: 'reviewDay', label: 'Review Day', type: 'select' as const, options: ['1st of month', 'Last day of month', 'First Sunday'] }, { key: 'reviewMetrics', label: 'Metrics to Track', type: 'textarea' as const, placeholder: 'e.g., Total trades, WR, R:R, EV, max DD, compliance %...' }, { key: 'reviewAction', label: 'Monthly Action Process', type: 'textarea' as const, placeholder: 'e.g., Identify weakest dimension, create 30-day action item...' }] },
];

const gameRounds = [
  { scenario: '<strong>Trade 18 of demo.</strong> 11W/7L (61% WR). EV +0.75%. You feel READY for real money. Friend says \u201cyour stats are amazing, why waste time on demo?\u201d', options: [
    { text: 'Go live \u2014 61% WR is exceptional.', correct: false, explain: '18 trades has a confidence interval of \u00b115%. True WR could be 46\u201376%. You haven\u2019t hit a losing streak yet. Complete 30 trades minimum.' },
    { text: 'Complete 30 trades. 61% on 18 has huge confidence interval. Haven\u2019t experienced adversity yet.', correct: true, explain: 'Correct. 18 is promising but unreliable. A 4\u20135 trade losing streak hasn\u2019t happened yet. Experience that in demo where it costs nothing.' },
    { text: 'Go micro at 0.1% for the remaining 12.', correct: false, explain: 'Demo phase exists to build data WITHOUT emotional interference. Even 0.1% introduces real money psychology prematurely.' },
  ]},
  { scenario: '<strong>Micro phase, trade 42.</strong> 0.25% risk. Last 3 trades lost. Account down \u00a318.75. You hesitate on the next valid setup \u2014 mouse hovers but you can\u2019t click.', options: [
    { text: 'Lost confidence in the strategy. Re-backtest everything.', correct: false, explain: 'The strategy hasn\u2019t changed \u2014 YOU have. \u00a318.75 in real losses triggers loss aversion that demo never could.' },
    { text: 'Loss aversion kicked in. Continue at 0.25% \u2014 this discomfort IS the lesson. Journal it.', correct: true, explain: 'The hesitation IS the data. Real money triggers loss aversion. Stay at micro and let your nervous system calibrate. By trade 55\u201360, the swings normalise.' },
    { text: 'Reduce to 0.1% until hesitation passes.', correct: false, explain: 'Reducing avoids the problem. Micro is DESIGNED to feel uncomfortable. At 0.1% the amounts are too small to trigger loss aversion.' },
  ]},
  { scenario: '<strong>Trade 87. Full risk at 0.75%.</strong> 52% WR, 1:1.7 R:R, +0.38% EV, 6.2% max DD, 85% compliance. Prop firm ad: $10K account, $52 fee. Should you start the challenge?', options: [
    { text: 'Yes \u2014 stats are strong, prop multiplies capital.', correct: false, explain: 'Gate 3 requires 40 full-risk trades (you have 27 so far). Prop challenge adds time-limit pressure you haven\u2019t been tested on. Complete 100 first.' },
    { text: 'Not yet \u2014 finish 100 trades. Prop adds pressure you haven\u2019t been tested on.', correct: true, explain: 'You\u2019re 13 trades from completing the plan. Challenge DD rules are stricter than personal trading. Complete 100, evaluate, then challenge from proven competence.' },
    { text: 'Run the challenge alongside personal account.', correct: false, explain: 'Parallel accounts split attention and corrupt data quality. One account, one plan, one focus.' },
  ]},
  { scenario: '<strong>Trade 100 complete.</strong> 49% WR, 1:1.8 R:R, +0.38% EV, 7.8% max DD, 83% compliance. All gates passed. Ready to scale to 1%. But your friend is already at 2%.', options: [
    { text: 'Skip 1%, go to 1.5% to catch up.', correct: false, explain: 'Comparing timelines is how proven edges get destroyed. Your 100-trade proven process is WORTH MORE than his 2% on 40 trades.' },
    { text: 'Follow your plan \u2014 scale to 1.0% with drawdown trigger. Friend\u2019s timeline is irrelevant.', correct: true, explain: 'Perfect discipline. All gates passed. Scale to 1.0% per your plan. In 6 months, the trader who followed the plan will still be trading.' },
    { text: 'Stay at 0.75% for 50 more trades to be absolutely sure.', correct: false, explain: 'All criteria are met. The plan says scale. Staying when data says go is as much a deviation as jumping to 2%.' },
  ]},
  { scenario: '<strong>Month 4.</strong> Months 1\u20132 (demo+micro): steady. Month 3 (full risk): +0.42% EV. Month 4: EV dropped to +0.12%, WR 52%\u219246%, compliance 85%\u219268%, DD hit 9.5%.', options: [
    { text: 'Strategy stopped working. Find a new approach.', correct: false, explain: 'Strategies don\u2019t stop in one month. 68% compliance tells you the PROCESS broke, not the strategy. The compliance drop IS the cause.' },
    { text: 'Scale down to 0.5% immediately. Diagnose: WHICH rules broke? WHEN? Create 30-day action targeting compliance >80%.', correct: true, explain: 'Sequence: (1) Scale down to protect capital. (2) Diagnose which rules broke and when. (3) One action: restore compliance. (4) Re-scale only after compliance >80% and EV >+0.3%.' },
    { text: 'Take a 2-week break to reset mentally.', correct: false, explain: 'Breaks don\u2019t address root cause. You\u2019ll return and repeat the same mistakes. Scale down and investigate WHILE continuing to trade.' },
  ]},
];

const quizQuestions = [
  { q: 'The purpose of the demo phase (trades 1\u201330) is:', opts: ['Make money quickly', 'Prove the model works before risking real money', 'Practice for 1 week then go live', 'Get familiar with the broker platform'], correct: 1, explain: 'Demo proves your model works with real market data \u2014 not theory. It builds the journaling habit and exposes execution issues before they cost real money.' },
  { q: 'Gate 1 (Demo \u2192 Micro) requires:', opts: ['Just 30 trades \u2014 any result', '30+ trades with positive EV, >45% WR, complete journal', 'A winning month in demo', 'Mentor approval'], correct: 1, explain: 'Gate 1 has specific, measurable criteria. 30+ trades provides minimum statistical reliability. Positive EV confirms edge. Journal confirms discipline.' },
  { q: 'During micro-risk (0.25%), you are primarily testing:', opts: ['Whether the strategy works with real money', 'Your emotional response to real gains and losses', 'How fast the account can grow', 'Broker execution quality'], correct: 1, explain: 'Micro calibrates your nervous system to real P&L. Even tiny losses feel different from demo. This emotional calibration is the entire point of the phase.' },
  { q: 'Walk-away rule says \u201c2 consecutive losses \u2192 stop.\u201d You see a perfect setup. You should:', opts: ['Take it \u2014 quality overrides the rule', 'Take it at half risk as a compromise', 'Walk away \u2014 the rule exists because you cannot be objective after 2 losses', 'Ask a trading friend for a second opinion'], correct: 2, explain: 'After 2 losses your emotional state is compromised. You THINK the setup is perfect, but your judgement is biased. Follow the rule. The market will be there tomorrow.' },
  { q: 'After 100 trades: 50% WR, 1:1.6 R:R, +0.30% EV, 7% max DD, 82% compliance. Should you scale?', opts: ['Yes \u2014 all Gate 3 criteria met. Begin 1-step scale-up.', 'No \u2014 50% WR is too low', 'Yes \u2014 jump straight to 2% risk', 'No \u2014 need 200 trades first'], correct: 0, explain: 'All Gate 3 criteria are met: EV >+0.3% \u2713, max DD <8% \u2713, compliance >80% \u2713, 40+ full-risk trades \u2713. Begin scaling via the Scale Ladder \u2014 one step at a time.' },
  { q: 'The biggest risk transitioning demo to micro is:', opts: ['Spread differences between demo and live', 'Loss aversion \u2014 real losses feel heavier than demo, causing hesitation and early closes', 'Slippage on entries', 'Platform latency'], correct: 1, explain: 'Loss aversion is the #1 psychological challenge. Real money triggers emotional responses that demo cannot simulate. This is exactly what micro phase is designed to surface.' },
  { q: 'A prop firm challenge should be attempted:', opts: ['As soon as demo is profitable', 'After proving your strategy with your own money for 100+ trades', 'After watching enough YouTube content', 'Whenever you can afford the fee'], correct: 1, explain: 'Prop challenges add time limits and strict DD rules that amplify existing weaknesses. Prove competence on your own capital first. Then challenge from proven data.' },
  { q: 'Monthly review reveals WR dropped from 52% to 45%. The FIRST thing to check is:', opts: ['Switch to a different strategy', 'Rule compliance \u2014 did process quality drop, or did the market regime change?', 'Immediately reduce risk to minimum', 'Add more instruments for diversification'], correct: 1, explain: 'A WR decline has two possible causes: process breakdown or market regime change. Checking compliance first isolates the variable. If compliance dropped, fix the process. If compliance held, the market changed.' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Level7CapstonePage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Plan Builder
  const [planData, setPlanData] = useState<Record<string, Record<string, string>>>(() => { const init: Record<string, Record<string, string>> = {}; planSections.forEach(s => { init[s.id] = {}; s.fields.forEach(f => { init[s.id][f.key] = ''; }); }); return init; });
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [planComplete, setPlanComplete] = useState(false);
  const updateField = (sid: string, fk: string, val: string) => setPlanData(p => ({ ...p, [sid]: { ...p[sid], [fk]: val } }));
  const sectionPct = (sid: string): number => { const sec = planSections.find(s => s.id === sid); if (!sec) return 0; const filled = sec.fields.filter(f => (planData[sid]?.[f.key] || '').trim().length > 0).length; return Math.round((filled / sec.fields.length) * 100); };
  const totalPct = (): number => { const total = planSections.reduce<number>((s, sec) => s + sec.fields.length, 0); const filled = planSections.reduce<number>((s, sec) => s + sec.fields.filter(f => (planData[sec.id]?.[f.key] || '').trim().length > 0).length, 0); return total > 0 ? Math.round((filled / total) * 100) : 0; };

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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 7 &middot; CAPSTONE</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 7 &middot; Capstone</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Your First 100<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Live Trades</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The final lesson. Build your complete Go Live document: demo plan, micro-risk calibration, full risk targets, walk-away rules, scaling milestones, and prop strategy.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\ud83d\ude80 The Launch Sequence</p>
            <p className="text-gray-400 leading-relaxed mb-4">An astronaut doesn&rsquo;t launch by climbing into a rocket and pressing <strong className="text-amber-400">GO</strong>. There are months of simulation, progressive pressure testing, abort criteria at every stage, and a complete flight plan before anyone touches the ignition.</p>
            <p className="text-gray-400 leading-relaxed">Your first 100 live trades are your launch sequence. Skip a step and you blow up on the pad. <strong className="text-white">Follow the plan and you reach orbit.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">200 new traders tracked over 12 months. <strong className="text-green-400">Plan-followers: 62% still trading after 12 months, 41% profitable.</strong> <strong className="text-red-400">Straight-to-live: 23% still trading, 8% profitable.</strong> The plan didn&rsquo;t make them better traders \u2014 it made them <strong className="text-white">survivors</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Journey Map</p><h2 className="text-2xl font-extrabold mb-4">4 Phases, 3 Gates</h2><p className="text-gray-400 text-sm mb-6">Each gate must be passed. No shortcuts. No exceptions.</p><JourneyMapAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 3 Gates</p><h2 className="text-2xl font-extrabold mb-4">Feelings Don&rsquo;t Pass Gates &mdash; Data Does</h2><p className="text-gray-400 text-sm mb-6">Specific, measurable criteria at each checkpoint.</p><GateCriteriaAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Phases</p><h2 className="text-2xl font-extrabold mb-4">Demo &rarr; Micro &rarr; Full &rarr; Scale</h2><div className="space-y-3">{fourPhases.map((item, i) => (<div key={i}><button onClick={() => toggle(`ph-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ph-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ph-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 3 Mindset Shifts</p><h2 className="text-2xl font-extrabold mb-4">How Your Thinking Must Change</h2><div className="p-6 rounded-2xl glass-card space-y-3">{mindsetShifts.map(item => (<div key={item.shift} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-2" style={{ color: item.color }}>{item.shift}</p><div className="grid grid-cols-2 gap-2 mb-1"><div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-[10px] text-red-400 font-bold">BEFORE</p><p className="text-[11px] text-gray-400 italic">{item.before}</p></div><div className="p-2 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-[10px] text-green-400 font-bold">AFTER</p><p className="text-[11px] text-gray-400 italic">{item.after}</p></div></div><p className="text-[11px] text-gray-500">{item.why}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: 100-Trade Go Live Plan Builder */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">100-Trade Go Live Plan Builder</h2><p className="text-gray-400 text-sm mb-6">Build your complete transition-to-live document. 8 sections. This becomes your Go Live plan.</p>
      <div className="p-6 rounded-2xl glass-card">{!planComplete ? (<div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">{planSections.map((s, i) => { const comp = sectionPct(s.id); return (<button key={s.id} onClick={() => setActivePlanIdx(i)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${activePlanIdx === i ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-500'}`}>{s.icon} {comp === 100 ? '\u2713' : `${comp}%`}</button>); })}</div>
        {(() => { const section = planSections[activePlanIdx]; return (<div className="p-4 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4"><span className="text-lg">{section.icon}</span><div><p className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Section {activePlanIdx + 1} of {planSections.length}</p><p className="text-sm font-bold text-white">{section.title}</p></div></div>
          <div className="space-y-3">{section.fields.map(field => (<div key={field.key}><label className="text-xs font-bold text-gray-300 mb-1.5 block">{field.label}</label>{field.type === 'select' ? (<div className="flex flex-wrap gap-1.5">{field.options?.map(opt => (<button key={opt} onClick={() => updateField(section.id, field.key, opt)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${planData[section.id]?.[field.key] === opt ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt}</button>))}</div>) : (<textarea value={planData[section.id]?.[field.key] || ''} onChange={e => updateField(section.id, field.key, e.target.value)} placeholder={field.placeholder} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none resize-none" rows={2} />)}</div>))}</div>
          <div className="flex gap-2 mt-4">{activePlanIdx > 0 && <button onClick={() => setActivePlanIdx(i => i - 1)} className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300">&larr;</button>}{activePlanIdx < planSections.length - 1 && <button onClick={() => setActivePlanIdx(i => i + 1)} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Next: {planSections[activePlanIdx + 1].title} &rarr;</button>}</div>
        </div>); })()}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-gray-300">Plan Completeness</p><p className="text-sm font-extrabold" style={{ color: totalPct() >= 80 ? '#26A69A' : totalPct() >= 50 ? '#FFB300' : '#ef4444' }}>{totalPct()}%</p></div><div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPct()}%`, background: totalPct() >= 80 ? '#26A69A' : totalPct() >= 50 ? '#FFB300' : '#ef4444' }} /></div>{totalPct() >= 75 && (<button onClick={() => setPlanComplete(true)} className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Complete Go Live Plan &rarr;</button>)}</div>
      </div>) : (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-2xl font-extrabold text-amber-400 mb-1">GO LIVE PLAN COMPLETE \ud83d\ude80</p><p className="text-xs text-gray-400">Screenshot this. Print it. Pin it next to your screen.</p></div>
        {planSections.map(section => (<div key={section.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold text-amber-400 mb-2">{section.icon} {section.title}</p><div className="space-y-1.5">{section.fields.map(field => { const val = planData[section.id]?.[field.key]; return val ? (<div key={field.key}><p className="text-[10px] text-gray-500 font-semibold">{field.label}</p><p className="text-xs text-gray-300">{val}</p></div>) : null; })}</div></div>))}
        <button onClick={() => setPlanComplete(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Edit Plan</button>
      </motion.div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; First Week Survival</p><h2 className="text-2xl font-extrabold mb-4">Day-by-Day Guide</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">DAY 1</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Pre-session routine. ONE trade max (or zero). Goal: experience the process with real money.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">DAY 2\u20133</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Won on Day 1? Guard against overconfidence. Lost? Guard against hesitation. Both are completely normal.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">DAY 4\u20135</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Real emotions are arriving now. Journal them. They are not problems \u2014 they are data points.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">END OF WEEK 1</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Do NOT check P&L. Check PROCESS: trades taken, rules followed, journal completed. That is your scorecard.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Week 1 is about survival, not performance. If you followed your process, Week 1 was a success regardless of P&L.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When to Pause</p><h2 className="text-2xl font-extrabold mb-4">Built-In Pause Triggers</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ec4899]">EMOTIONAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Reactive or tilted for 2+ sessions \u2192 pause 1\u20132 days. Not weeks. Days.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#ef4444]">PERFORMANCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">EV negative for 20+ trades \u2192 drop to micro risk and diagnose the root cause.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">LIFE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">External stress elevated \u2192 reduce risk or pause entirely. The market will be there next week.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">CONFIDENCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Lost all confidence \u2192 take 10 demo trades. If demo works and live doesn\u2019t, the problem is psychological, not strategic.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Errors in the First 100 Trades</h2><div className="space-y-3">{capstoneMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">100-Trade Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">DEMO (1\u201330)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Prove the model. Zero risk. Build journaling habit. Gate: 30 trades, WR &gt;45%, EV positive.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">MICRO (31\u201360)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Feel real money. 0.25% risk. Calibrate nervous system. Gate: EV positive, zero revenge trades.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">FULL RISK (61\u2013100)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your true edge. 0.5\u20131%. Data is real. Gate: EV &gt;+0.3%, DD &lt;8%, compliance &gt;80%.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">SCALE (101+)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Edge proven. Follow the Scale Ladder. Consider prop challenges. Weekly reviews every Sunday.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">62% of plan-followers survive 12 months. 23% of rushers do. The plan IS the edge.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">100-Trade Decision Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Navigate the journey from demo to funded.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '\u2713' : '\u2717'} ${opt.explain}` }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand the journey from demo to funded.' : gameScore >= 3 ? 'Good \u2014 review the gate criteria and scaling decisions.' : 'Re-read the 4 Phases and gate criteria carefully before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\ud83d\ude80</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Your First 100 Live Trades &mdash; Capstone</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Execution Master &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.14-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
