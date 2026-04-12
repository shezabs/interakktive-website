// app/academy/lesson/level-7-capstone/page.tsx
// ATLAS Academy — Lesson 7.14: Your First 100 Live Trades — Capstone [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 7
// GROUNDBREAKING: 100-Trade Go Live Plan Builder — 8-section interactive document
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
// ANIMATION 1: The 100-Trade Journey Map
// 4 phases: Demo → Micro → Full → Scale, connected by gates
// ============================================================
function JourneyMapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    const cx = w / 2;
    const progress = Math.min(1, (t % 14) / 10);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 100-Trade Journey — 4 Phases, 3 Gates', cx, 16);

    const phases = [
      { name: 'DEMO', trades: '1-30', duration: '2-4 weeks', icon: '🎓', color: '#3b82f6', desc: 'Prove the model works' },
      { name: 'MICRO', trades: '31-60', duration: '3-4 weeks', icon: '🔬', color: '#8b5cf6', desc: '0.25% risk — learn to feel real money' },
      { name: 'FULL RISK', trades: '61-100', duration: '4-6 weeks', icon: '⚡', color: '#f59e0b', desc: '0.5-1% risk — your true edge' },
      { name: 'SCALE', trades: '101+', duration: 'Ongoing', icon: '🚀', color: '#26A69A', desc: 'Proven. Funded. Scaling.' },
    ];

    const pad = 20;
    const phaseW = (w - pad * 2) / 4;
    const midY = h / 2;
    const nodeR = 28;
    const activeIdx = Math.min(3, Math.floor(progress * 4.5));

    // Connection lines
    for (let i = 0; i < 3; i++) {
      const x1 = pad + (i + 0.5) * phaseW + nodeR + 5;
      const x2 = pad + (i + 1.5) * phaseW - nodeR - 5;
      const lit = i < activeIdx;

      // Gate diamond
      const gx = (x1 + x2) / 2;
      ctx.save();
      ctx.translate(gx, midY);
      ctx.rotate(Math.PI / 4);
      const gateSize = 8;
      ctx.fillStyle = lit ? '#f59e0b30' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(-gateSize, -gateSize, gateSize * 2, gateSize * 2);
      ctx.strokeStyle = lit ? '#f59e0b60' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-gateSize, -gateSize, gateSize * 2, gateSize * 2);
      ctx.restore();

      // Lines to gate
      ctx.strokeStyle = lit ? phases[i].color + '50' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = lit ? 1.5 : 0.5;
      ctx.setLineDash(lit ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(gx - 12, midY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 12, midY); ctx.lineTo(x2, midY); ctx.stroke();
      ctx.setLineDash([]);

      // Gate label
      if (lit) {
        ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 6px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('GATE', gx, midY - 14);
      }
    }

    // Phase nodes
    phases.forEach((p, i) => {
      const x = pad + (i + 0.5) * phaseW;
      const isActive = i <= activeIdx;
      const isCurrent = i === activeIdx;
      const pulse = isCurrent ? Math.sin(t * 3) * 0.1 + 0.9 : 1;

      // Glow
      if (isCurrent) {
        ctx.beginPath(); ctx.arc(x, midY, nodeR + 8, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '10'; ctx.fill();
      }

      // Circle
      ctx.beginPath(); ctx.arc(x, midY, nodeR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? p.color + '15' : 'rgba(255,255,255,0.02)';
      ctx.fill();
      ctx.strokeStyle = isActive ? p.color + '70' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      // Icon
      ctx.font = `${isActive ? 18 : 14}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText(p.icon, x, midY + 6);

      // Phase name
      ctx.fillStyle = isActive ? p.color : 'rgba(255,255,255,0.15)';
      ctx.font = `${isCurrent ? 'bold ' : ''}${isActive ? 9 : 7}px system-ui`;
      ctx.fillText(p.name, x, midY - nodeR - 10);

      // Trade range
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
      ctx.font = '7px system-ui';
      ctx.fillText(`Trades ${p.trades}`, x, midY + nodeR + 14);

      // Duration
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)';
      ctx.font = '7px system-ui';
      ctx.fillText(p.duration, x, midY + nodeR + 26);

      // Description (current only)
      if (isCurrent) {
        ctx.fillStyle = p.color + '90'; ctx.font = '7px system-ui';
        ctx.fillText(p.desc, x, midY + nodeR + 40);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: The Gate Criteria — Pass/Fail Checkpoints
// ============================================================
function GateCriteriaAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The 3 Gates — Each Must Be Passed Before Advancing', w / 2, 16);

    const gates = [
      { name: 'GATE 1: Demo → Micro', criteria: ['30+ demo trades', 'WR > 45%', 'EV positive', 'Journal complete'], color: '#3b82f6' },
      { name: 'GATE 2: Micro → Full', criteria: ['30+ micro trades', 'EV still positive', 'No revenge trades', 'Emotions managed'], color: '#8b5cf6' },
      { name: 'GATE 3: Full → Scale', criteria: ['40+ full-risk trades', 'EV > +0.3%', 'Max DD < 8%', 'Rule compliance > 80%'], color: '#f59e0b' },
    ];

    const pad = 15;
    const colW = (w - pad * 2) / 3;
    const animProgress = Math.min(1, (t % 8) / 5);
    const activeGate = Math.floor((t % 12) / 4) % 3;

    gates.forEach((gate, gi) => {
      const x = pad + gi * colW;
      const y = 35;
      const cardW = colW - 8;
      const cardH = h - 50;
      const isActive = gi === activeGate;

      // Card
      ctx.fillStyle = isActive ? gate.color + '08' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(x + 4, y, cardW, cardH, 8); ctx.fill();
      ctx.strokeStyle = isActive ? gate.color + '40' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.roundRect(x + 4, y, cardW, cardH, 8); ctx.stroke();

      // Gate name
      ctx.fillStyle = isActive ? gate.color : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText(gate.name, x + 4 + cardW / 2, y + 20);

      // Criteria
      gate.criteria.forEach((c, ci) => {
        const cy = y + 40 + ci * 28;
        const revealed = isActive && animProgress > ci * 0.2;

        if (revealed) {
          const checkX = x + 18;
          // Checkmark circle
          ctx.beginPath(); ctx.arc(checkX, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = gate.color + '30'; ctx.fill();
          ctx.fillStyle = gate.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
          ctx.fillText('✓', checkX, cy + 3);

          // Text
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
          ctx.fillText(c, checkX + 14, cy + 3);
        } else {
          const checkX = x + 18;
          ctx.beginPath(); ctx.arc(checkX, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      });
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// 100-TRADE PLAN BUILDER
// ============================================================
interface PlanSection {
  id: string;
  title: string;
  icon: string;
  fields: { key: string; label: string; type: 'text' | 'select' | 'textarea' | 'number'; options?: string[]; placeholder?: string }[];
}

const planSections: PlanSection[] = [
  { id: 'strategy', title: 'Strategy Summary', icon: '🧭', fields: [
    { key: 'instrument', label: 'Primary Instrument', type: 'select', options: ['XAUUSD', 'EUR/USD', 'GBP/USD', 'NASDAQ', 'US30', 'USD/JPY', 'Other'] },
    { key: 'model', label: 'Primary Model', type: 'select', options: ['OB Pullback', 'Liquidity Sweep', 'BOS Continuation', 'FVG Entry', 'Breaker Retest', 'Other'] },
    { key: 'session', label: 'Kill Zone', type: 'select', options: ['Asia (00-08 UTC)', 'London (07-16 UTC)', 'LON-NY Overlap (12-16 UTC)', 'New York (12-21 UTC)'] },
    { key: 'htfBias', label: 'HTF Bias Method', type: 'textarea', placeholder: 'e.g., Daily candle direction + 4H structure...' },
  ]},
  { id: 'demo', title: 'Demo Phase (Trades 1-30)', icon: '🎓', fields: [
    { key: 'demoDuration', label: 'Planned Duration', type: 'select', options: ['2 weeks', '3 weeks', '4 weeks', '6 weeks'] },
    { key: 'demoGoal', label: 'Primary Goal', type: 'textarea', placeholder: 'e.g., Execute 30 trades following all rules. Target: positive EV and >45% WR.' },
    { key: 'demoMaxTrades', label: 'Max Trades Per Day', type: 'select', options: ['1', '2', '3'] },
    { key: 'demoGate', label: 'Gate 1 Criteria (to advance)', type: 'textarea', placeholder: 'e.g., 30 trades, WR >45%, positive EV, complete journal...' },
  ]},
  { id: 'micro', title: 'Micro-Risk Phase (Trades 31-60)', icon: '🔬', fields: [
    { key: 'microRisk', label: 'Risk Per Trade', type: 'select', options: ['0.10%', '0.25%', '0.50%'] },
    { key: 'microDuration', label: 'Planned Duration', type: 'select', options: ['3 weeks', '4 weeks', '6 weeks'] },
    { key: 'microFocus', label: 'Focus Area', type: 'textarea', placeholder: 'e.g., Emotional management with real money. Track: do losses feel different than demo?' },
    { key: 'microGate', label: 'Gate 2 Criteria (to advance)', type: 'textarea', placeholder: 'e.g., 30 micro trades, EV still positive, zero revenge trades...' },
  ]},
  { id: 'full', title: 'Full Risk Phase (Trades 61-100)', icon: '⚡', fields: [
    { key: 'fullRisk', label: 'Risk Per Trade', type: 'select', options: ['0.50%', '0.75%', '1.00%'] },
    { key: 'fullDuration', label: 'Planned Duration', type: 'select', options: ['4 weeks', '6 weeks', '8 weeks'] },
    { key: 'fullTarget', label: 'Performance Targets', type: 'textarea', placeholder: 'e.g., WR >48%, EV >+0.3%, max DD <8%, rule compliance >80%...' },
    { key: 'fullGate', label: 'Gate 3 Criteria (to scale)', type: 'textarea', placeholder: 'e.g., 40 trades, EV >+0.3%, max DD <8%, compliance >80%...' },
  ]},
  { id: 'walkaway', title: 'Walk-Away Rules', icon: '🚪', fields: [
    { key: 'dailyCap', label: 'Daily Loss Cap', type: 'select', options: ['1% of account', '2% of account', '3% of account'] },
    { key: 'dailyMax', label: 'Max Trades Per Day', type: 'select', options: ['1', '2', '3'] },
    { key: 'consecLoss', label: 'Consecutive Loss Limit', type: 'select', options: ['2 losses → stop for day', '3 losses → stop for day', '2 losses → halve risk'] },
    { key: 'emotionalRule', label: 'Emotional Walk-Away Rule', type: 'textarea', placeholder: 'e.g., If emotional state is reactive/tilted, close charts immediately. No exceptions.' },
  ]},
  { id: 'scaling', title: 'Scaling Milestones', icon: '📈', fields: [
    { key: 'scale1', label: 'Milestone 1: First Scale-Up', type: 'textarea', placeholder: 'e.g., After 100 trades with +0.3% EV and <8% DD → increase risk from 0.5% to 0.75%' },
    { key: 'scale2', label: 'Milestone 2: Second Scale-Up', type: 'textarea', placeholder: 'e.g., After 50 more trades at 0.75% with stable EV → increase to 1.0%' },
    { key: 'scaleDown', label: 'Scale-Down Trigger', type: 'textarea', placeholder: 'e.g., If DD exceeds 10% at any level → halve risk immediately. 50 trades to re-qualify.' },
  ]},
  { id: 'prop', title: 'Prop Firm Selection', icon: '🏢', fields: [
    { key: 'propTiming', label: 'When to Attempt Prop', type: 'select', options: ['After 100 personal trades', 'After 200 personal trades', 'After 6 months profitable', 'Not planning prop trading'] },
    { key: 'propBudget', label: 'Challenge Budget', type: 'select', options: ['$50-100', '$100-200', '$200-500', 'Not yet decided'] },
    { key: 'propCriteria', label: 'Firm Selection Criteria', type: 'textarea', placeholder: 'e.g., 2-step challenge, 8% profit target, 5% daily DD, no time limit, XAUUSD available...' },
    { key: 'propPlan', label: 'Challenge Strategy', type: 'textarea', placeholder: 'e.g., Same strategy as personal account. 1% risk. Max 2 trades/day. No changes to approach.' },
  ]},
  { id: 'review', title: 'Monthly Review Template', icon: '📋', fields: [
    { key: 'reviewDay', label: 'Review Day', type: 'select', options: ['1st of month', 'Last day of month', 'First Sunday of month'] },
    { key: 'reviewMetrics', label: 'Monthly Metrics to Track', type: 'textarea', placeholder: 'e.g., Total trades, WR, avg R:R, EV, max DD, rule compliance %, best/worst trade, session breakdown...' },
    { key: 'reviewAction', label: 'Monthly Action Process', type: 'textarea', placeholder: 'e.g., Identify the ONE weakest dimension. Create a specific 30-day action item. Review previous month\'s action compliance.' },
  ]},
];

// ============================================================
// QUIZ & GAME DATA
// ============================================================
const quizQuestions = [
  { q: 'The purpose of the demo phase (trades 1-30) is:', opts: ['To make money quickly and fund a prop account', 'To prove the model works in live conditions and build a data foundation before risking real money', 'To practice for 1 week and then go live', 'To get a feel for the platform interface'], correct: 1 },
  { q: 'Gate 1 (Demo → Micro) requires:', opts: ['Just 30 trades — any result is fine', '30+ trades with positive EV, >45% WR, and complete journal', 'A winning month in demo', 'Approval from a mentor'], correct: 1 },
  { q: 'During the micro-risk phase (0.25% risk), the PRIMARY thing you are testing is:', opts: ['Whether the strategy works with real money', 'Your emotional response to real gains and losses — does real money change your behaviour?', 'How fast you can grow the account', 'Whether the broker fills your orders correctly'], correct: 1 },
  { q: 'Your walk-away rule says "2 consecutive losses → stop for the day." You hit 2 losses but see a perfect setup forming. You should:', opts: ['Take it — the setup quality overrides the rule', 'Take it at half risk — compromise between rule and opportunity', 'Walk away — the rule exists because you cannot objectively evaluate setups after 2 losses', 'Ask a fellow trader for their opinion'], correct: 2 },
  { q: 'You complete 100 trades: 50% WR, 1:1.6 R:R, +0.30% EV, 7% max DD, 82% rule compliance. Should you start scaling?', opts: ['Yes — all Gate 3 criteria are met. Begin 1-step scale-up.', 'Not yet — 50% WR is too low for scaling', 'Yes — but jump straight to 2% risk', 'Not yet — need 200 trades before any scaling'], correct: 0 },
  { q: 'The biggest risk when transitioning from demo to micro is:', opts: ['The spread difference between demo and live accounts', 'Loss aversion — treating £2.50 losses on micro as if they were £250, leading to early closes and wide stops', 'Slippage destroying the edge', 'The platform being different'], correct: 1 },
  { q: 'A prop firm challenge should be attempted:', opts: ['As soon as you have a profitable strategy in demo', 'After proving the strategy works with your own money for 100+ trades with consistent positive EV', 'After watching YouTube videos about passing challenges', 'When you can afford the challenge fee'], correct: 1 },
  { q: 'Your monthly review reveals WR dropped from 52% to 45% over the last month. The FIRST thing to check is:', opts: ['Whether to change strategies', 'Rule compliance — did process quality drop, or did the market change?', 'Whether to reduce risk', 'Whether to add more instruments'], correct: 1 },
];

const gameRounds = [
  { scenario: '<strong>Trade 18 of your demo phase.</strong> You\'ve been demo trading for 10 days. 18 trades logged: 11 wins, 7 losses (61% WR). Average R:R: 1:1.9. EV: +0.75%. You feel READY to go live with real money. A friend says "your stats are amazing, why waste time on demo?" Should you skip the remaining 12 demo trades?', options: [{ text: 'Yes — 61% WR and +0.75% EV is exceptional. Go live now.', correct: false, explain: '18 trades is a tiny sample. Your confidence interval on that 61% WR is roughly ±15%. The true WR could be anywhere from 46% to 76%. You need the full 30 trades minimum to narrow that confidence band. More importantly, your 10-day demo hasn\'t encountered a losing streak yet. When it comes (and it will), you need to handle it in demo FIRST.' }, { text: 'No — complete 30 trades. The 61% WR on 18 trades has a huge confidence interval. You haven\'t experienced adversity yet.', correct: true, explain: 'Correct. 18 trades is promising but statistically unreliable. You haven\'t hit a 4-5 trade losing streak yet, which WILL happen. Experiencing that in demo — where it doesn\'t cost real money — is the entire point. The plan says 30 trades. Follow the plan. If the edge is real, it will still be there at trade 30.' }, { text: 'Compromise — go micro at 0.1% risk for the remaining 12 trades.', correct: false, explain: 'This is rationalising a plan deviation. The demo phase exists to build data WITHOUT emotional interference. Even 0.1% risk introduces real money psychology. Finish demo. Then go micro. The gates exist for a reason.' }] },
  { scenario: '<strong>Micro phase, trade 42.</strong> You\'re at 0.25% risk. Your last 3 trades were losses. Account is down £18.75 total. You notice yourself hesitating on the next valid setup — the mouse hovers over the button but you can\'t click it. Your body is telling you something has changed since demo. What\'s happening and what should you do?', options: [{ text: 'You\'ve lost confidence in the strategy. Take a break and re-backtest.', correct: false, explain: 'The strategy hasn\'t changed — YOU have changed. £18.75 in real losses feels different from demo losses. This is exactly what the micro phase is designed to surface. The strategy doesn\'t need re-testing. Your relationship with real money needs adjustment.' }, { text: 'Loss aversion has kicked in. Real £18.75 feels heavier than demo £18.75. Continue at 0.25% — this discomfort IS the lesson. Journal the feeling. It normalises over 10-20 more trades.', correct: true, explain: 'Exactly. This is the most important moment in the micro phase. The hesitation IS the data. Real money triggers loss aversion — even at £18.75. The solution isn\'t to retreat to demo — it\'s to STAY at micro and let your nervous system calibrate to real P&L. Journal every trade. By trade 55-60, the £6.25 per-trade swings will feel normal. That normalisation is the graduation criterion.' }, { text: 'Reduce risk to 0.1% until the hesitation passes.', correct: false, explain: 'Reducing risk avoids the problem instead of solving it. The micro phase is DESIGNED to feel uncomfortable. At 0.1%, the amounts are so small they won\'t trigger loss aversion — which means you won\'t learn to manage it. Stay at 0.25% and push through.' }] },
  { scenario: '<strong>Trade 87. Full risk phase at 0.75%.</strong> Your stats: 52% WR, 1:1.7 R:R, +0.38% EV, 6.2% max DD, 85% rule compliance. You see an advertisement for a prop firm challenge (2-step, $10K account, $52 fee). You calculate: "At this rate, I\'ll make more with a $10K prop account than my personal £2,000 account." Should you start the challenge now?', options: [{ text: 'Yes — your stats are strong and the prop firm multiplies your capital instantly.', correct: false, explain: 'Your stats are strong at trade 87, but Gate 3 requires 40 full-risk trades (you have 27). The prop challenge adds psychological pressure (time limits, DD rules) that you haven\'t been tested on. Completing 100 personal trades first builds the psychological foundation that survives challenge pressure.' }, { text: 'Not yet — finish 100 trades first. A prop challenge adds pressure you haven\'t been tested on. Complete your plan THEN challenge.', correct: true, explain: 'Correct. You\'re 13 trades from completing your 100-trade plan. Rushing to prop saves 2-3 weeks but adds significant risk: challenge DD rules are stricter than your personal account, time pressure changes your decision-making, and you haven\'t passed Gate 3 yet. Complete 100 → evaluate → then challenge from a position of proven competence.' }, { text: 'Start the challenge alongside your personal account — run them in parallel.', correct: false, explain: 'Running parallel accounts splits your attention and corrupts your data. Your personal account EV might drop because you\'re psychologically focused on the challenge. One account, one plan, one focus. Finish the 100 first.' }] },
  { scenario: '<strong>Trade 100 complete.</strong> Final stats: 49% WR, 1:1.8 R:R, +0.38% EV, max DD 7.8%, rule compliance 83%. All Gate 3 criteria passed. You\'re ready to scale from 0.75% to 1%. But your friend, who started at the same time, is already at 2% risk and bragging about his monthly returns. You feel behind. How do you respond?', options: [{ text: 'Accelerate — skip 1% and go straight to 1.5% to catch up.', correct: false, explain: 'Comparing your journey to someone else\'s is the fastest way to destroy a proven edge. Your friend\'s 2% risk on an unproven edge is a ticking time bomb. Your 100-trade proven process at 0.75% is WORTH MORE than his 2% on 40 trades. Skipping the Scale Ladder violates everything you learned in Lesson 7.11.' }, { text: 'Follow your plan — scale to 1.0% with a drawdown trigger. Your friend\'s timeline is irrelevant. Your PROCESS is proven; his may not be.', correct: true, explain: 'Perfect discipline. 100 trades, all gates passed, criteria met. Scale to 1.0% per your plan with a pre-set drawdown trigger (e.g., 10% DD → back to 0.75%). Your friend\'s speed is not your benchmark — your process metrics are. In 6 months, the trader who followed the plan will be the one still trading.' }, { text: 'Stay at 0.75% for another 50 trades to be absolutely sure.', correct: false, explain: 'This is the opposite extreme — excessive caution. You passed all Gate 3 criteria. The plan says scale. Staying at 0.75% when the data says you\'re ready is as much a plan deviation as jumping to 2%. Trust the process. Scale.' }] },
  { scenario: '<strong>Month 4 of your journey.</strong> Your monthly review shows: Months 1-2 (demo+micro): steady improvement. Month 3 (full risk): strong, +0.42% EV. Month 4: EV dropped to +0.12%, WR dropped from 52% to 46%, rule compliance dropped from 85% to 68%. Max DD hit 9.5%. You need to diagnose what happened and create a plan. What\'s the right approach?', options: [{ text: 'The strategy stopped working. Find a new approach.', correct: false, explain: 'Strategies don\'t stop working in one month. The 68% rule compliance tells you the PROCESS broke down, not the strategy. When compliance drops 17 percentage points, the trader changed — not the market. The EV and WR decline are SYMPTOMS of the compliance drop.' }, { text: 'Scale down to 0.5% risk immediately. Diagnose the compliance drop: WHICH rules were broken? When did the slide start? What external factors contributed? Create a 30-day action plan targeting compliance back to >80% before re-scaling.', correct: true, explain: 'Correct. The sequence: (1) Scale down to protect capital while the process is compromised. (2) Diagnose — not "what went wrong" but specifically WHICH rules broke and WHEN. Usually there\'s a trigger event (personal stress, overconfidence from Month 3, lifestyle change). (3) One action item: restore compliance to >80% over the next 30 trades. (4) Only re-scale after compliance is restored and EV is back above +0.3%.' }, { text: 'Take a 2-week break from trading to reset.', correct: false, explain: 'Breaks can help psychological reset, but they don\'t address the root cause. You\'ll return after 2 weeks and likely repeat the same pattern. The compliance drop needs DIAGNOSIS and a specific action plan — not avoidance. Scale down and investigate while continuing to trade.' }] },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Level7CapstonePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const totalSections = 12;
  const toggle = (id: string) => { setOpenSections(p => { const n = { ...p, [id]: !p[id] }; const c = Object.values(n).filter(Boolean).length; setProgress(Math.round((c / totalSections) * 100)); return n; }); };

  // Plan Builder state
  const [planData, setPlanData] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    planSections.forEach(s => { initial[s.id] = {}; s.fields.forEach(f => { initial[s.id][f.key] = ''; }); });
    return initial;
  });
  const [activePlanSection, setActivePlanSection] = useState(0);
  const [planComplete, setPlanComplete] = useState(false);

  const updatePlanField = (sectionId: string, fieldKey: string, value: string) => {
    setPlanData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [fieldKey]: value } }));
  };

  const getSectionCompleteness = (sectionId: string): number => {
    const section = planSections.find(s => s.id === sectionId);
    if (!section) return 0;
    const filled = section.fields.filter(f => (planData[sectionId]?.[f.key] || '').trim().length > 0).length;
    return Math.round((filled / section.fields.length) * 100);
  };

  const getTotalCompleteness = (): number => {
    const totalFields = planSections.reduce<number>((s, sec) => s + sec.fields.length, 0);
    const filledFields = planSections.reduce<number>((s, sec) => {
      return s + sec.fields.filter(f => (planData[sec.id]?.[f.key] || '').trim().length > 0).length;
    }, 0);
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px] font-bold tracking-wider text-amber-400">PRO &middot; LEVEL 7 &middot; CAPSTONE</span></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">Your First 100 Live Trades</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">The final lesson. Build your complete Go Live document: demo plan, micro-risk phase, full risk, walk-away rules, scaling milestones, and prop firm strategy. This is your launch pad.</p>
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div>
          <p className="text-right text-[10px] text-gray-600 mt-1">{progress}% complete</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-start gap-3 mb-4"><span className="text-xl">🔍</span><h2 className="text-xl font-extrabold">First — Why This Matters</h2></div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-gray-300 leading-relaxed mb-4">An astronaut doesn&rsquo;t launch by climbing into a rocket and pressing <strong className="text-white">GO</strong>. There are <strong className="text-white">months of simulation</strong>, progressive pressure testing, abort criteria at every stage, and a complete flight plan before ignition. Your first 100 live trades are your launch sequence. Skip a step and you blow up on the pad. Follow the plan and you reach orbit.</p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-2">Real Scenario</p>
              <p className="text-sm text-gray-300 leading-relaxed">Tracked 200 new traders. <strong className="text-[#26A69A]">Those who followed a structured 100-trade plan: 62% were still trading after 12 months, 41% were profitable.</strong> <strong className="text-[#ef4444]">Those who went straight to live: 23% still trading after 12 months, 8% profitable.</strong> The plan didn&rsquo;t make them better traders — it made them <strong className="text-white">survivors</strong>. And survivors eventually become profitable.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S01 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 100-Trade Journey Map</h2>
          <JourneyMapAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">4 phases, 3 gates. Each gate must be passed before advancing. No shortcuts.</p>
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 3 Gates</h2>
          <GateCriteriaAnimation />
          <p className="text-xs text-gray-500 mt-2 text-center">Each gate has specific, measurable criteria. Feelings don&rsquo;t pass gates — data does.</p>
        </motion.div>
      </section>

      {/* S03 — The 4 Phases Explained */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">The 4 Phases — Explained</h2>
          <div className="space-y-3">
            {[
              { id: 's03a', num: '01', title: '🎓 Phase 1: Demo (Trades 1-30)', content: '<strong>Duration:</strong> 2-4 weeks. <strong>Risk:</strong> £0.<br/><br/><strong>Purpose:</strong> Prove the model works in live market conditions. Build your journaling habit. Learn your kill zone rhythm. Make every mistake while it costs nothing.<br/><br/><strong>Gate 1 Criteria:</strong> 30+ trades completed, WR >45%, EV positive, journal 100% complete, able to articulate your model in one paragraph.<br/><br/><strong>The trap:</strong> Demo feels "too easy" after 15 winning trades. You want to skip ahead. DON\'T. The losing streak hasn\'t arrived yet.' },
              { id: 's03b', num: '02', title: '🔬 Phase 2: Micro-Risk (Trades 31-60)', content: '<strong>Duration:</strong> 3-4 weeks. <strong>Risk:</strong> 0.25%.<br/><br/><strong>Purpose:</strong> Discover how real money changes your behaviour. £6.25 losses at 0.25% on a £2,500 account feel VERY different from demo losses. This phase calibrates your nervous system to real P&L.<br/><br/><strong>Gate 2 Criteria:</strong> 30+ trades, EV still positive after introducing real money, zero revenge trades, emotional state logged for every trade, no rule violations driven by loss aversion.<br/><br/><strong>The trap:</strong> Feeling paralysed after 2-3 losses. This IS the lesson. Push through.' },
              { id: 's03c', num: '03', title: '⚡ Phase 3: Full Risk (Trades 61-100)', content: '<strong>Duration:</strong> 4-6 weeks. <strong>Risk:</strong> 0.5-1.0%.<br/><br/><strong>Purpose:</strong> Establish your true edge with meaningful risk. Losses hurt. Wins feel good. Your data now represents your REAL performance — not demo or micro approximations.<br/><br/><strong>Gate 3 Criteria:</strong> 40+ trades at full risk, EV >+0.3%, max DD <8%, rule compliance >80%. These are your GO criteria.<br/><br/><strong>The truth:</strong> Not everyone passes Gate 3 on the first attempt. That\'s okay. Go back to micro, diagnose, fix, and re-attempt. The gate protects your capital.' },
              { id: 's03d', num: '04', title: '🚀 Phase 4: Scale (Trades 101+)', content: '<strong>Duration:</strong> Ongoing. <strong>Risk:</strong> Follows the Scale Ladder from Lesson 7.11.<br/><br/><strong>Purpose:</strong> You\'ve proven the edge. Now grow it. Follow the Scale Ladder: increase risk by 0.25-0.5% per step with stabilisation periods. Consider prop firm challenges. Add a second instrument (per Lesson 7.12 criteria). Weekly reviews (Lesson 7.13) every Sunday.<br/><br/><strong>You made it:</strong> 100 trades completed. Process proven. Edge quantified. You are now a data-driven trader.' },
            ].map(item => (
              <div key={item.id} className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
                <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Mental Models */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <button onClick={() => toggle('s04')} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">03</span><span className="flex-1 text-sm font-semibold text-gray-200">The 3 Mindset Shifts for Going Live</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections['s04'] ? 'rotate-180' : ''}`} /></button>
            <AnimatePresence>{openSections['s04'] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5 space-y-3">
              {[
                { shift: 'From Outcome to Process', before: '"Did I make money today?"', after: '"Did I follow my process today?"', why: 'Outcomes vary daily. Process quality is controllable. A profitable week with broken rules is WORSE than a losing week with perfect compliance.', color: '#3b82f6' },
                { shift: 'From Individual Trades to Sample Size', before: '"This trade MUST win."', after: '"This trade is 1 of 100. The BATCH determines success."', why: 'No single trade matters. Your edge plays out over 100+ trades. Removing emotional attachment from individual trades is the most important psychological shift.', color: '#26A69A' },
                { shift: 'From Speed to Sustainability', before: '"I need to make £X this month."', after: '"I need to survive and compound for 12+ months."', why: 'Fast money attracts fast losses. Slow, boring, process-driven trading is what separates the 62% who survive from the 77% who don\'t.', color: '#f59e0b' },
              ].map(item => (
                <div key={item.shift} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold mb-2" style={{ color: item.color }}>{item.shift}</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-[10px] text-red-400 font-bold mb-0.5">BEFORE</p><p className="text-[11px] text-gray-400 italic">{item.before}</p></div>
                    <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-[10px] text-green-400 font-bold mb-0.5">AFTER</p><p className="text-[11px] text-gray-400 italic">{item.after}</p></div>
                  </div>
                  <p className="text-[11px] text-gray-500">{item.why}</p>
                </div>
              ))}
            </div></motion.div>)}</AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* S05 — 🎯 GROUNDBREAKING: 100-Trade Go Live Plan Builder */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎯</span><h2 className="text-xl font-extrabold">100-Trade Go Live Plan Builder</h2></div>
          <p className="text-sm text-gray-400 mb-6">Build your complete transition plan. Fill every section — this becomes your Go Live document. Screenshot it or print it.</p>

          {!planComplete ? (
            <div className="space-y-4">
              {/* Section tabs */}
              <div className="flex flex-wrap gap-1.5">
                {planSections.map((s, i) => {
                  const comp = getSectionCompleteness(s.id);
                  return (
                    <button key={s.id} onClick={() => setActivePlanSection(i)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${activePlanSection === i ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.02] border border-white/10 text-gray-500'}`}>
                      {s.icon} {comp === 100 ? '✓' : `${comp}%`}
                    </button>
                  );
                })}
              </div>

              {/* Active section */}
              {(() => {
                const section = planSections[activePlanSection];
                return (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{section.icon}</span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Section {activePlanSection + 1} of {planSections.length}</p>
                        <p className="text-sm font-bold text-white">{section.title}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {section.fields.map(field => (
                        <div key={field.key}>
                          <label className="text-xs font-bold text-gray-300 mb-1.5 block">{field.label}</label>
                          {field.type === 'select' ? (
                            <div className="flex flex-wrap gap-1.5">
                              {field.options?.map(opt => (
                                <button key={opt} onClick={() => updatePlanField(section.id, field.key, opt)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${planData[section.id]?.[field.key] === opt ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:border-white/20'}`}>{opt}</button>
                              ))}
                            </div>
                          ) : field.type === 'textarea' ? (
                            <textarea value={planData[section.id]?.[field.key] || ''} onChange={e => updatePlanField(section.id, field.key, e.target.value)} placeholder={field.placeholder} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none resize-none" rows={2} />
                          ) : (
                            <input type="text" value={planData[section.id]?.[field.key] || ''} onChange={e => updatePlanField(section.id, field.key, e.target.value)} placeholder={field.placeholder} className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/30 outline-none" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2 mt-4">
                      {activePlanSection > 0 && <button onClick={() => setActivePlanSection(i => i - 1)} className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300">&larr;</button>}
                      {activePlanSection < planSections.length - 1 && <button onClick={() => setActivePlanSection(i => i + 1)} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next: {planSections[activePlanSection + 1].title} →</button>}
                    </div>
                  </div>
                );
              })()}

              {/* Completeness */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-300">Plan Completeness</p>
                  <p className="text-sm font-extrabold" style={{ color: getTotalCompleteness() >= 80 ? '#26A69A' : getTotalCompleteness() >= 50 ? '#FFB300' : '#ef4444' }}>{getTotalCompleteness()}%</p>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${getTotalCompleteness()}%`, background: getTotalCompleteness() >= 80 ? '#26A69A' : getTotalCompleteness() >= 50 ? '#FFB300' : '#ef4444' }} /></div>
                {getTotalCompleteness() >= 75 && (
                  <button onClick={() => setPlanComplete(true)} className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Complete Go Live Plan →</button>
                )}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-2xl font-extrabold text-amber-400 mb-1">GO LIVE PLAN COMPLETE 🚀</p>
                <p className="text-xs text-gray-400">Screenshot this document. Print it. Pin it next to your trading screen.</p>
              </div>

              {planSections.map(section => (
                <div key={section.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold text-amber-400 mb-2">{section.icon} {section.title}</p>
                  <div className="space-y-1.5">
                    {section.fields.map(field => {
                      const val = planData[section.id]?.[field.key];
                      return val ? (
                        <div key={field.key}>
                          <p className="text-[10px] text-gray-500 font-semibold">{field.label}</p>
                          <p className="text-xs text-gray-300">{val}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}

              <button onClick={() => setPlanComplete(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:border-amber-500/30 transition-all">← Edit Plan</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S06-S08 */}
      {[
        { id: 's06', num: '04', title: 'The First Week Survival Guide', content: '<strong>Day 1:</strong> Execute your pre-session routine. Take ONE trade maximum (or zero). The goal is to EXPERIENCE the process, not make money.<br/><br/><strong>Day 2-3:</strong> If Day 1 was a win, guard against overconfidence. If it was a loss, guard against hesitation. Both are normal.<br/><br/><strong>Day 4-5:</strong> By now you\'ve felt real emotions. Journal them. They are data. This is the micro phase doing its job.<br/><br/><strong>End of Week 1:</strong> Do NOT check your P&L. Check your PROCESS metrics: trades taken, rules followed, journal completed, emotional states logged. P&L is noise at this sample size.' },
        { id: 's07', num: '05', title: 'When to Pause the Plan', content: 'The plan has built-in pause triggers:<br/><br/><strong>Emotional:</strong> If you feel reactive or tilted for 2+ consecutive sessions → pause for 1-2 days. Not weeks. Days.<br/><strong>Performance:</strong> If your EV goes negative for 20+ consecutive trades → drop to micro risk and diagnose.<br/><strong>Life:</strong> If external stress (work, family, health) is elevated → reduce risk or pause. The market will be there next week.<br/><strong>Confidence:</strong> If you\'ve lost ALL confidence in the strategy → go back to demo for 10 trades. If demo works and live doesn\'t, the problem is psychological, not strategic.' },
        { id: 's08', num: '06', title: 'Common Mistakes in the First 100 Trades', content: '<strong>1. Skipping demo.</strong> "I already know the strategy." You know the THEORY. You don\'t know the EXECUTION. Demo proves execution quality.<br/><br/><strong>2. Jumping risk levels.</strong> "Micro is too slow." Micro isn\'t about speed — it\'s about psychological calibration. Skip it and live trading will feel like a war zone.<br/><br/><strong>3. Moving gates.</strong> "I\'m at 48% WR after 28 trades, close enough to 30 and >45%." The gates are MINIMUM thresholds. If you can\'t pass them, you\'re not ready. Period.<br/><br/><strong>4. Comparing to others.</strong> "My friend is already funded." Your friend\'s timeline is irrelevant. 62% of plan-followers survive. 23% of rushers survive. Be in the 62%.' },
      ].map(item => (
        <section key={item.id} className="max-w-2xl mx-auto px-5 py-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <button onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 p-4 text-left"><span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-xs font-bold text-amber-400/60">{item.num}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} /></button>
              <AnimatePresence>{openSections[item.id] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} /></div></motion.div>)}</AnimatePresence>
            </div>
          </motion.div>
        </section>
      ))}

      {/* S09 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-xl font-extrabold mb-4">Cheat Sheet</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: '4 Phases', content: 'Demo (30) → Micro (30) → Full Risk (40) → Scale (∞). Each phase has a gate. No shortcuts.', color: '#f59e0b' },
              { title: '3 Gates', content: 'G1: WR >45%, EV+. G2: EV+, zero revenge. G3: EV >0.3%, DD <8%, compliance >80%.', color: '#3b82f6' },
              { title: '3 Mindsets', content: 'Process > outcome. Sample size > single trade. Sustainability > speed.', color: '#26A69A' },
              { title: 'Walk Away', content: 'Daily cap. Max trades. Consecutive loss limit. Emotional rule. ALL non-negotiable.', color: '#ef4444' },
              { title: 'Survival Rate', content: '62% of plan-followers survive 12 months. 23% of rushers do. Be in the 62%.', color: '#a855f7' },
              { title: 'The Plan', content: 'Build it today. Follow it tomorrow. Review it weekly. Adjust it monthly. Trust it always.', color: '#FFB300' },
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
          <p className="text-gray-400 text-sm mb-6">5 journey scenarios. Navigate the 100-trade plan.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you are ready to execute the 100-trade plan with discipline and clarity.' : gameScore >= 3 ? 'Good — review the gate criteria and the difference between process metrics and outcome metrics.' : 'Re-read the 4 Phases and the 3 Mindset Shifts, then retry.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-2">Final Quiz — Level 7 Capstone</h2>
          <p className="text-gray-400 text-sm mb-6">8 questions — 66% to earn your Level 7 Capstone certificate.</p>
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
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Level 7 Capstone Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(139,92,246,0.06),transparent,rgba(38,166,154,0.04),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-red-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/40">🚀</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Level 7 Capstone Certificate</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 7: Execution Mastery</strong><br />All 14 lessons at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Execution Master &mdash;</p>
                  <p className="text-xs text-gray-500 mt-2 mb-3">You are ready for your first 100 live trades.</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L7.14-CAPSTONE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
