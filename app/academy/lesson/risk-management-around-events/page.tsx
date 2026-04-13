// app/academy/lesson/risk-management-around-events/page.tsx
// ATLAS Academy — Lesson 8.12: Risk Management Around Events [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Event Risk Calculator — positions + events → risk score + adjustments
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
// ANIMATION 1: Event Risk Timeline — 48h around a major event
// ============================================================
function EventTimelineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.002; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('48 Hours Around a Tier 1 Event', cx, 16);
    const phases = [
      { label: '48h BEFORE', time: 'T\u221248h', action: 'Identify risk.\nMap event to\nyour instruments.', color: '#3b82f6', x: 0.08 },
      { label: '24h BEFORE', time: 'T\u221224h', action: 'Adjust positions.\nReduce size or\nwiden stops.', color: '#FFB300', x: 0.22 },
      { label: '1h BEFORE', time: 'T\u22121h', action: 'Final decision:\nClose, hold wide,\nor flatten.', color: '#EF5350', x: 0.36 },
      { label: 'EVENT', time: 'T\u22120', action: 'NO NEW TRADES.\nWatch. Do not\nreact.', color: '#EF5350', x: 0.5 },
      { label: '15 min AFTER', time: 'T+15m', action: 'Assess direction.\nSpreads normal?\nEnter if clear.', color: '#FFB300', x: 0.64 },
      { label: '1h AFTER', time: 'T+1h', action: 'Normal operations\nresume. New\nstructure formed.', color: '#26A69A', x: 0.78 },
      { label: '24h AFTER', time: 'T+24h', action: 'Review.\nDid your plan\nwork? Journal it.', color: '#26A69A', x: 0.92 },
    ];
    const lineY = h / 2; const pad = 15;
    const progress = Math.min(1, (t % 14) / 10);
    const activeIdx = Math.floor(progress * 7.5);
    // Timeline
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pad, lineY); ctx.lineTo(w - pad, lineY); ctx.stroke();
    // Event marker
    const evtX = pad + 0.5 * (w - pad * 2);
    ctx.fillStyle = '#EF535015'; ctx.fillRect(evtX - 20, 30, 40, h - 45);
    phases.forEach((phase, i) => {
      const px = pad + phase.x * (w - pad * 2); const isActive = i <= activeIdx; const isCurrent = i === activeIdx;
      // Dot
      ctx.beginPath(); ctx.arc(px, lineY, isCurrent ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? phase.color + '60' : 'rgba(255,255,255,0.05)'; ctx.fill();
      ctx.strokeStyle = isActive ? phase.color : 'rgba(255,255,255,0.08)'; ctx.lineWidth = isCurrent ? 2 : 0.5; ctx.stroke();
      // Time label
      ctx.fillStyle = isActive ? phase.color : 'rgba(255,255,255,0.1)';
      ctx.font = `${isCurrent ? 'bold 7' : '6'}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText(phase.time, px, lineY + 16);
      // Phase label
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.08)';
      ctx.font = `${isCurrent ? 'bold 7' : '6'}px system-ui`;
      ctx.fillText(phase.label, px, lineY - 18);
      // Action text (above or below alternating)
      if (isCurrent) {
        const above = i % 2 === 0;
        const ty = above ? 38 : lineY + 30;
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '6px system-ui';
        phase.action.split('\n').forEach((l, li) => ctx.fillText(l, px, ty + li * 9));
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 2: Gap Risk Visualisation — Friday close vs Monday open
// ============================================================
function GapRiskAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Weekend Gap Risk \u2014 Your Stop Doesn\u2019t Work During Gaps', cx, 16);
    const chartL = 40; const chartR = w - 20; const chartW = chartR - chartL;
    const chartT = 40; const chartB = h - 40; const chartH = chartB - chartT;
    const gapX = chartL + 0.55 * chartW;
    // Friday price action
    const fridayClose = 0.45;
    const progress = Math.min(1, (t % 10) / 6);
    const preFriday = Math.min(1, progress * 2);
    // Draw Friday candles
    ctx.strokeStyle = '#26A69A60'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < Math.floor(preFriday * 12); i++) {
      const x = chartL + (i / 20) * chartW;
      const y = chartT + (fridayClose + Math.sin(i * 0.8) * 0.05) * chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Friday close label
    if (progress > 0.3) {
      const fcY = chartT + fridayClose * chartH;
      ctx.strokeStyle = '#FFB30040'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(chartL, fcY); ctx.lineTo(gapX - 5, fcY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#FFB300'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('FRIDAY CLOSE', gapX - 8, fcY - 6);
      ctx.fillText('1.0850', gapX - 8, fcY + 10);
      // Stop loss
      const stopY = fcY + 0.12 * chartH;
      ctx.strokeStyle = '#EF535040'; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(chartL, stopY); ctx.lineTo(gapX - 5, stopY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#EF5350'; ctx.font = '7px system-ui';
      ctx.fillText('STOP: 1.0830 (\u221220 pips)', gapX - 8, stopY + 10);
    }
    // Gap zone
    if (progress > 0.5) {
      ctx.fillStyle = '#EF535008'; ctx.fillRect(gapX - 3, chartT, 30, chartH);
      ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('WEEKEND', gapX + 12, chartT + 12); ctx.fillText('GAP', gapX + 12, chartT + 22);
    }
    // Monday open — gapped below stop
    if (progress > 0.7) {
      const mondayOpen = 0.72; // much lower
      const moY = chartT + mondayOpen * chartH;
      // Gap arrow
      const fcY = chartT + fridayClose * chartH;
      ctx.strokeStyle = '#EF535060'; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(gapX + 5, fcY); ctx.lineTo(gapX + 20, moY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gapX + 20, moY); ctx.lineTo(gapX + 15, moY - 6); ctx.lineTo(gapX + 25, moY); ctx.closePath(); ctx.fillStyle = '#EF5350'; ctx.fill();
      // Monday candles
      ctx.strokeStyle = '#EF535080'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < Math.floor((progress - 0.7) * 3.3 * 8); i++) {
        const x = gapX + 25 + (i / 15) * chartW * 0.3;
        const y = moY + Math.sin(i * 0.5) * 0.02 * chartH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Monday open label
      ctx.fillStyle = '#EF5350'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
      ctx.fillText('MONDAY OPEN', gapX + 28, moY - 8);
      ctx.fillText('1.0780 (\u221270 pips!)', gapX + 28, moY + 8);
      // Stop was at 1.0830 but filled at 1.0780
      ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
      const annX = gapX + 12; const annY = (fcY + moY) / 2;
      ctx.fillText('\u22120.70R', annX, annY - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '6px system-ui';
      ctx.fillText('Stop at \u221220', annX, annY + 8);
      ctx.fillText('Filled at \u221270', annX, annY + 17);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Your 20-pip stop was skipped. Filled at 70 pips loss. Stops do NOT protect during gaps.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// EVENT RISK CALCULATOR DATA
// ============================================================
interface Position { id: number; pair: string; direction: string; stopPips: number; riskPct: number; }
interface EventInput { id: number; name: string; impact: 'high' | 'medium' | 'low'; timing: string; }
const defaultPositions: Position[] = [
  { id: 1, pair: 'EUR/USD', direction: 'Long', stopPips: 25, riskPct: 1.0 },
  { id: 2, pair: 'XAUUSD', direction: 'Short', stopPips: 200, riskPct: 0.75 },
];
const defaultEvents: EventInput[] = [
  { id: 1, name: 'CPI (US)', impact: 'high', timing: 'Wednesday 13:30' },
  { id: 2, name: 'NFP', impact: 'high', timing: 'Friday 13:30' },
];
const avgMoves: Record<string, Record<string, number>> = {
  'EUR/USD': { high: 70, medium: 35, low: 15 },
  'GBP/USD': { high: 60, medium: 30, low: 12 },
  'USD/JPY': { high: 55, medium: 28, low: 10 },
  'XAUUSD': { high: 2200, medium: 800, low: 300 },
  'NASDAQ': { high: 150, medium: 70, low: 30 },
};

// ============================================================
// CONTENT DATA
// ============================================================
const eventRiskBudget = [
  { title: '\ud83d\udcb0 The Event Risk Budget', desc: '<strong>Concept:</strong> Allocate a MAXIMUM percentage of your account to event risk exposure. This is separate from your trade risk.<br/><br/><strong>The math:</strong> If your max event exposure is 3%, and you have a 1% EUR/USD long and a 0.75% XAUUSD short into CPI, your total event exposure is 1.75% (they\u2019re both USD-sensitive). This is within your 3% budget.<br/><br/><strong>If total exposure &gt; budget:</strong> Close the most vulnerable position or reduce both pro-rata. Don\u2019t enter CPI with more event exposure than your budget allows.<br/><br/><strong>Typical budgets:</strong> Conservative: 1.5%. Standard: 3%. Aggressive: 5%. Never exceed your budget regardless of how \u201cgood\u201d your positions look.' },
  { title: '\ud83c\udf19 Overnight &amp; Weekend Risk', desc: '<strong>Overnight gaps:</strong> Most retail brokers close for 1-2 hours daily (22:00-00:00 UTC). Gaps can occur during this window. Less common than weekend gaps but still real.<br/><br/><strong>Weekend gaps:</strong> Markets close Friday 22:00 UTC, reopen Sunday 22:00 UTC. 48 hours of geopolitical risk with no ability to exit. The #1 silent account killer for retail traders.<br/><br/><strong>The rule:</strong> Before Friday close, reduce ALL positions to a level where a 200-pip adverse gap would not damage your account beyond recovery. If you can\u2019t absorb a 200-pip gap, you\u2019re too large.<br/><br/><strong>Gap slippage:</strong> Your stop at 1.0830 means nothing if Monday opens at 1.0750. You\u2019ll be filled at 1.0750 \u2014 an 80-pip loss instead of your planned 20. Stops are requests during gaps, not guarantees.' },
  { title: '\ud83d\udcc8 Earnings Season (Equity Traders)', desc: '<strong>What:</strong> 4 times per year, public companies report quarterly earnings. Individual stocks can gap 5\u201320% overnight on results.<br/><br/><strong>The cascade:</strong> Major tech earnings (AAPL, MSFT, NVDA, AMZN, GOOG) move the entire NASDAQ and S&P. One company\u2019s earnings can shift the index 1\u20132%.<br/><br/><strong>For forex traders:</strong> Earnings season increases equity volatility which affects risk sentiment. Strong earnings = risk-on (USD may weaken, Gold may drop). Weak earnings = risk-off (opposite).<br/><br/><strong>Your action:</strong> If you trade NASDAQ or US30, check earnings calendar. Reduce index positions before mega-cap reports. For forex, earnings season is background awareness, not a flatten trigger.' },
  { title: '\u23f0 Position Sizing BEFORE Events', desc: '<strong>The principle:</strong> Adjust position size BEFORE the event, not during it. Once the event fires, it\u2019s too late to reduce risk \u2014 spreads are extreme and fills are terrible.<br/><br/><strong>24 hours before Tier 1:</strong> Review all open positions. Any position that would suffer from the event\u2019s expected impact should be reduced or closed. Lock in profits. Accept small losses.<br/><br/><strong>The mistake:</strong> \u201cI\u2019ll just tighten my stop before CPI.\u201d A tight stop during CPI = guaranteed stop-out from spread widening + whipsaw. Either widen the stop to survive the range OR close entirely.<br/><br/><strong>The math:</strong> If CPI typically moves EUR/USD 55 pips and your stop is 20 pips, your stop is INSIDE the expected move. It will be hit regardless of whether the event helps or hurts your direction. Either widen to 60+ pips (accepting larger risk) or close.' },
];

const positionAdjustments = [
  { situation: 'In profit, Tier 1 in < 2h', action: 'CLOSE. Lock profit. Re-enter after T+15.', sizing: 'Exit 100%', color: '#26A69A' },
  { situation: 'In loss, Tier 1 in < 2h', action: 'CLOSE. Take the loss. \u22120.5R controlled > \u22122R uncontrolled.', sizing: 'Exit 100%', color: '#EF5350' },
  { situation: 'In profit, Tier 2 today', action: 'HOLD with widened stop OR trail to lock profit.', sizing: 'Hold or trail', color: '#FFB300' },
  { situation: 'Flat, Tier 1 tomorrow', action: 'No new entries after 16:00. Plan for tomorrow.', sizing: 'No new trades', color: '#3b82f6' },
  { situation: 'Multiple positions, Tier 1 in < 2h', action: 'Close MOST correlated position. Keep only the strongest.', sizing: 'Reduce to 1 position', color: '#FFB300' },
  { situation: 'Friday evening, geopolitical tension', action: 'Reduce all positions to gap-survivable levels.', sizing: 'Max 0.5% per position', color: '#EF5350' },
];

const commonMistakes = [
  { title: 'Tightening Stops Before News', mistake: 'CPI in 30 minutes. You tighten your EUR/USD stop from 30 pips to 15 pips \u201cfor protection.\u201d CPI spike hits 15 pips in 2 seconds, stops you out, then reverses back to your entry. You were right, but your tight stop killed you.', fix: 'Before Tier 1: either widen stop to SURVIVE the expected range (55+ pips for EUR/USD CPI) or close entirely. Tight stops during news = guaranteed stop-out from spread widening and whipsaw.' },
  { title: 'No Weekend Gap Plan', mistake: 'You hold 3 positions into Friday close because they\u2019re all in profit. Sunday night: geopolitical escalation. Monday opens with gaps against all 3. Your combined loss is \u22124.2% instead of the \u22121.5% your stops \u201cprotected.\u201d', fix: 'Friday afternoon ritual: scan weekend risk. If tension is elevated, reduce to minimum. If calm, reduce to gap-survivable (each position\u2019s gap risk < 1% of account). Stops don\u2019t work during gaps.' },
  { title: 'Not Calculating Event Exposure', mistake: 'You have 3 positions: EUR/USD long, GBP/USD long, XAUUSD long. All are USD-bearish. CPI is tomorrow. You think you\u2019re risking 3% (1% each). You\u2019re actually risking ~5.5% because of correlation amplification during a USD event.', fix: 'Add up ALL USD-directional exposure before events. Correlated positions compound. EUR+GBP at +0.88 correlation = nearly doubled risk. Your \u201c3% across 3 trades\u201d is really one concentrated USD bet.' },
  { title: 'Holding Through Earnings on Indices', mistake: 'You hold a NASDAQ long. After market close, NVDA reports terrible earnings. NASDAQ futures drop 2% overnight. Your position gaps through your stop.', fix: 'Check the earnings calendar. If AAPL, MSFT, NVDA, AMZN, or GOOG report this week, reduce index exposure the evening before. One mega-cap miss can move the entire index.' },
];

const quizQuestions = [
  { q: 'CPI typically moves EUR/USD 55 pips. Your stop is 20 pips. Before CPI you should:', opts: ['Hold \u2014 the stop will protect you', 'Either widen stop to 60+ pips (accepting larger risk) or close entirely. A 20-pip stop inside a 55-pip expected range will be hit regardless of direction.', 'Tighten stop to 10 pips for less risk', 'Add a trailing stop'], correct: 1, explain: 'If the expected event range is 55 pips and your stop is 20, your stop sits INSIDE the expected move. It will be triggered by spread widening and whipsaw even if price ultimately goes your way. Widen beyond the range or close.' },
  { q: 'Your EUR/USD long is at +1.3R. NFP is in 90 minutes. Best action:', opts: ['Hold \u2014 in good profit', 'Close at +1.3R. NFP can reverse 80+ pips. Your +1.3R could become \u22120.7R. Lock the profit and re-enter after T+15.', 'Move stop to breakeven', 'Add to the winner before the volatility'], correct: 1, explain: '+1.3R is confirmed profit in your account. NFP is the most volatile scheduled event. Holding confirmed profit through a binary event is gambling. Lock it in. The market will produce a new setup after the release.' },
  { q: 'Weekend gap risk means:', opts: ['Markets always gap on Monday', 'Your stop loss does NOT execute during market closure \u2014 if price gaps past your stop, you\u2019re filled at the gap price, potentially far worse than planned', 'Gaps only affect stocks', 'Weekend risk is the same as weekday risk'], correct: 1, explain: 'Markets close Friday 22:00 and reopen Sunday 22:00. During those 48 hours, your stops are inactive. If a geopolitical event shifts sentiment, Monday opens at a different price. Your 20-pip stop could fill at 70+ pips.' },
  { q: 'The "event risk budget" concept means:', opts: ['How much you spend on news services', 'Setting a maximum percentage of account equity that can be exposed to event-driven risk at any one time \u2014 separate from regular trade risk', 'Only trading during events', 'Budgeting for losing trades'], correct: 1, explain: 'Event risk budget is a cap on how much of your account can be affected by a single event. If your budget is 3% and you have 4% exposed to CPI, you need to reduce before the event. This prevents one data release from inflicting unrecoverable damage.' },
  { q: 'You hold 3 USD-bearish positions (EUR/USD long, GBP/USD long, Gold long) each at 1% risk. Your true event exposure before NFP is approximately:', opts: ['3% \u2014 simple addition', '5\u20136% \u2014 correlated positions compound. EUR+GBP at +0.88 nearly doubles. All three are the same directional USD bet.', '1% \u2014 the biggest position', '0% \u2014 they hedge each other'], correct: 1, explain: 'EUR/USD and GBP/USD at +0.88 correlation are nearly the same trade. Gold at +0.55 with EUR adds moderate overlap. All three profit from USD weakness. During NFP, if USD strengthens, all three lose simultaneously. The compounding takes your \u201c3%\u201d to 5-6%.' },
  { q: 'NVDA reports earnings Thursday after market close. You have a NASDAQ long. Best action:', opts: ['Hold \u2014 one stock doesn\u2019t affect the index', 'Reduce or close before Thursday close. NVDA is ~7% of NASDAQ \u2014 a 10% earnings miss could drop the index 0.7\u20131.0% overnight, gapping through your stop.', 'Buy more NASDAQ \u2014 NVDA always beats', 'Switch to US30 instead'], correct: 1, explain: 'Mega-cap stocks have outsized index impact. NVDA at ~7% weighting means a 10% NVDA drop = 0.7% NASDAQ drop at minimum, plus sympathy selling in other tech names. This overnight gap risk is real and common. Reduce before the close.' },
  { q: 'Friday afternoon. Your positions are all in profit. Geopolitical tension is elevated. The correct action:', opts: ['Hold \u2014 they\u2019re all profitable', 'Reduce each position to a level where a 200-pip gap wouldn\u2019t exceed 1% loss per position. Take partial profits. Protect the account.', 'Close everything and go to cash', 'Set tighter stops for protection'], correct: 1, explain: 'You don\u2019t need to close everything \u2014 that\u2019s overcautious. But you need to size each position so a 200-pip adverse gap is survivable. If your 1% risk position could lose 3% in a gap, reduce it. Tighter stops do NOT help during gaps.' },
  { q: 'The most dangerous time for gap risk in forex is:', opts: ['Monday morning', 'Friday close to Sunday open \u2014 48 hours of zero liquidity where geopolitical events, disasters, or policy changes can shift sentiment with no ability to exit', 'During FOMC', 'Around New Year'], correct: 1, explain: 'The weekend is 48 hours of complete market closure (except crypto). Any event during this period \u2014 military escalation, political crisis, natural disaster \u2014 reprices immediately at Sunday open. Your stops are completely inactive.' },
];

const gameRounds = [
  { scenario: '<strong>Wednesday morning.</strong> CPI releases at 13:30 UTC. You hold: EUR/USD long (1% risk, 25-pip stop, currently +0.8R) and GBP/USD long (0.5% risk, 20-pip stop, currently +0.3R). Both are USD-bearish. CPI typically moves EUR/USD 55 pips.', options: [
    { text: 'Hold both \u2014 they\u2019re in profit and stops will protect you.', correct: false, explain: '\u2717 Both stops (25 and 20 pips) are INSIDE the 55-pip expected CPI range. Both will be hit by whipsaw regardless of direction. Plus they\u2019re both USD-bearish = doubled exposure. Hot CPI would stop both.' },
    { text: 'Close both. Lock +0.8R and +0.3R. Total secured: +1.1R combined. Re-enter after T+15 if CPI gives a clear direction. Both stops are inside the expected range, and both are correlated USD bets.', correct: true, explain: '\u2713 Both stops are too tight for the expected 55-pip move. Both positions are the same directional bet (USD weakness). Closing secures +1.1R real profit. After CPI at T+15, if direction is clear, re-enter the better setup.' },
    { text: 'Close EUR/USD, keep GBP/USD at reduced stop.', correct: false, explain: '\u2717 GBP/USD\u2019s 20-pip stop is even MORE vulnerable than EUR/USD\u2019s 25-pip stop during CPI. Keeping the weaker position makes no sense. If you must keep one, keep the wider stop, not the tighter one.' },
  ]},
  { scenario: '<strong>Friday 16:00 UTC.</strong> Weekend approaching. Geopolitical tension in the Middle East has escalated this week. Oil up 5%. VIX at 22. You hold: XAUUSD long at +1.2R (40-pip stop), EUR/USD short at \u22120.3R (20-pip stop).', options: [
    { text: 'Hold both \u2014 Gold benefits from geopolitical risk, EUR/USD short is a USD-strength bet which also benefits from risk-off.', correct: false, explain: '\u2717 Your analysis of direction may be correct, but you\u2019re underestimating GAP risk. A weekend escalation could gap Gold up (good for you) but also gap EUR/USD against your short if markets panic unpredictably. And your EUR/USD stop doesn\u2019t work during the gap.' },
    { text: 'Close EUR/USD (accept \u22120.3R loss). Trail Gold stop to +0.5R. Reduce weekend exposure to one position with locked-in profit.', correct: true, explain: '\u2713 EUR/USD at \u22120.3R with a 20-pip stop is vulnerable to gap risk. Take the small loss. Gold at +1.2R with a trail to +0.5R protects meaningful profit while staying exposed to potential geopolitical Gold rally. One controlled position > two vulnerable ones.' },
    { text: 'Close both and go flat for the weekend.', correct: false, explain: '\u2717 Acceptable but overcautious. Gold is positioned to BENEFIT from the geopolitical risk you\u2019re worried about. Closing a winner that\u2019s aligned with the risk scenario wastes a strong position. Trail it instead.' },
  ]},
  { scenario: '<strong>Your event risk budget is 3%.</strong> Current positions: EUR/USD long (1%), XAUUSD long (0.75%), NASDAQ long (1%). All are risk-on positions. CPI tomorrow at 13:30. What\u2019s your total event exposure and what should you do?', options: [
    { text: 'Total = 2.75%. Within budget. Hold all.', correct: false, explain: '\u2717 Simple addition ignores correlation. EUR/USD + Gold = moderate overlap (both anti-USD). EUR/USD + NASDAQ = mild overlap. All three positions benefit from USD weakness and risk-on sentiment. Effective exposure is closer to 4.5\u20135%.' },
    { text: 'Correlated event exposure is ~4.5\u20135% (all risk-on, USD-sensitive). Exceeds 3% budget. Close NASDAQ (least essential), reduce Gold to 0.5%. New exposure: ~2.5%. Within budget.', correct: true, explain: '\u2713 You correctly identified that all three positions are the same directional bet and that correlation amplifies the exposure. Closing the weakest connection (NASDAQ) and reducing Gold brings you within your 3% event risk budget.' },
    { text: 'Add a USD/CHF long to hedge the exposure.', correct: false, explain: '\u2717 Adding a 4th position to \u201chedge\u201d increases complexity and spread costs. The correct approach is to REDUCE, not to add offsetting positions. Hedging with a 4th correlated position creates a mess, not a solution.' },
  ]},
  { scenario: '<strong>Thursday evening.</strong> NVIDIA reports earnings after the bell tonight. You have a NASDAQ long at +0.6R with a 50-point stop. NVDA is ~7% of NASDAQ. Your XAUUSD position is also open (unrelated).', options: [
    { text: 'Hold both \u2014 NVDA usually beats estimates.', correct: false, explain: '\u2717 \u201cUsually beats\u201d is not a risk management strategy. When NVDA misses, NASDAQ can gap 1\u20132% overnight. Your 50-point stop is useless during the close-to-open gap. Relying on past performance for a binary event is gambling.' },
    { text: 'Close NASDAQ at +0.6R before the earnings release. Hold XAUUSD (unrelated to tech earnings). NVDA earnings are a binary gap risk that your stop cannot protect against.', correct: true, explain: '\u2713 Lock +0.6R on NASDAQ before the binary earnings event. Your stop doesn\u2019t execute between market close and open. If NVDA misses, you\u2019d gap through your stop. XAUUSD is unrelated to tech earnings \u2014 hold it normally.' },
    { text: 'Tighten NASDAQ stop to +0.3R to protect some profit.', correct: false, explain: '\u2717 Tighter stops don\u2019t help during gap risk. If NASDAQ opens 80 points lower tomorrow, your tight stop fills at the gap price, not your stop level. You\u2019d get +0.3R minus the gap overshoot = potentially negative.' },
  ]},
  { scenario: '<strong>Your weekly risk analysis.</strong> This week: PMI Monday, nothing Tuesday, CPI Wednesday 13:30, Claims Thursday, NFP Friday 13:30. You trade EUR/USD. Your typical week produces 3\u20135 trades.', options: [
    { text: 'Trade normally all week. Adjust during events.', correct: false, explain: '\u2717 \u201cAdjust during events\u201d is reactive, not proactive. By the time you\u2019re adjusting during CPI, spreads are already extreme. Risk management happens BEFORE events, not during them.' },
    { text: 'Mon: full size (PMI = medium). Tue: full size (clear). Wed: reduced AM, flat by 13:00, re-enter after T+15 if clear. Thu: full size. Fri: reduced AM, flat by 13:00. Weekly Risk Score: 7/10 (two Tier 1 events).', correct: true, explain: '\u2713 Perfect weekly planning. You mapped every event against your session, identified the two Tier 1 days, built hard exit times, and rated the week\u2019s overall risk. This is what professional event risk management looks like.' },
    { text: 'Skip the week \u2014 too many events.', correct: false, explain: '\u2717 Monday, Tuesday, and Thursday are all clean or low-impact. Skipping an entire week because of 2 event days costs you 3 tradeable days. Plan around the events, don\u2019t surrender the whole week.' },
  ]},
];

// ============================================================
// EVENT RISK CALCULATOR COMPONENT
// ============================================================
function EventRiskCalculator() {
  const [positions, setPositions] = useState<Position[]>(defaultPositions);
  const [events, setEvents] = useState<EventInput[]>(defaultEvents);
  const [calculated, setCalculated] = useState(false);

  const totalRisk = positions.reduce<number>((s, p) => s + p.riskPct, 0);
  const hasHighEvent = events.some(e => e.impact === 'high');
  const correlatedPairs = positions.filter(p => ['EUR/USD', 'GBP/USD', 'AUD/USD', 'NZD/USD'].includes(p.pair)).length;
  const correlationMultiplier = correlatedPairs >= 2 ? 1.6 : 1.0;
  const effectiveExposure = Math.round(totalRisk * correlationMultiplier * 100) / 100;
  const gapRisks = positions.map(p => {
    const moves = avgMoves[p.pair] || { high: 50, medium: 25, low: 10 };
    const worstEvent = events.reduce<number>((max, e) => Math.max(max, moves[e.impact] || 0), 0);
    const gapExceedsStop = worstEvent > p.stopPips;
    return { ...p, expectedMove: worstEvent, gapExceedsStop, potentialLoss: gapExceedsStop ? Math.round(p.riskPct * (worstEvent / p.stopPips) * 100) / 100 : p.riskPct };
  });
  const weeklyScore = Math.min(10, Math.round((events.filter(e => e.impact === 'high').length * 3 + events.filter(e => e.impact === 'medium').length * 1.5 + (correlatedPairs >= 2 ? 2 : 0))));

  return (
    <div className="space-y-4">
      {!calculated ? (<>
        <div><p className="text-xs font-bold text-gray-300 mb-2">Your Open Positions</p>
          <div className="space-y-2">{positions.map((p, i) => (<div key={p.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-4 gap-2 text-[10px]">
            <div><span className="text-gray-500">Pair</span><br/><select value={p.pair} onChange={e => { const np = [...positions]; np[i] = { ...np[i], pair: e.target.value }; setPositions(np); }} className="bg-transparent text-gray-300 text-[11px] font-semibold outline-none">{['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ'].map(pr => <option key={pr} value={pr} className="bg-gray-900">{pr}</option>)}</select></div>
            <div><span className="text-gray-500">Dir</span><br/><span className="text-gray-300 font-semibold">{p.direction}</span></div>
            <div><span className="text-gray-500">Stop</span><br/><span className="text-gray-300 font-semibold">{p.stopPips}p</span></div>
            <div><span className="text-gray-500">Risk</span><br/><span className="text-gray-300 font-semibold">{p.riskPct}%</span></div>
          </div>))}</div>
        </div>
        <div><p className="text-xs font-bold text-gray-300 mb-2">This Week&apos;s Events</p>
          <div className="space-y-2">{events.map(e => (<div key={e.id} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[11px]">
            <span className="text-gray-300 font-semibold">{e.name}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${e.impact === 'high' ? 'bg-red-500/20 text-red-400' : e.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{e.impact.toUpperCase()}</span>
            <span className="text-gray-500">{e.timing}</span>
          </div>))}</div>
        </div>
        <button onClick={() => setCalculated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Calculate Event Risk &rarr;</button>
      </>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="p-4 rounded-xl text-center" style={{ background: weeklyScore >= 7 ? '#EF535010' : weeklyScore >= 4 ? '#FFB30010' : '#26A69A10', border: `1px solid ${weeklyScore >= 7 ? '#EF535030' : weeklyScore >= 4 ? '#FFB30030' : '#26A69A30'}` }}>
          <p className="text-xs text-gray-400">Weekly Risk Score</p>
          <p className="text-3xl font-extrabold" style={{ color: weeklyScore >= 7 ? '#EF5350' : weeklyScore >= 4 ? '#FFB300' : '#26A69A' }}>{weeklyScore}/10</p>
          <p className="text-[10px] text-gray-500">{weeklyScore >= 7 ? 'HIGH RISK WEEK \u2014 Reduce positions before events' : weeklyScore >= 4 ? 'MODERATE RISK \u2014 Adjust around Tier 1 events' : 'LOW RISK \u2014 Trade normally with awareness'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[9px] text-gray-500">SIMPLE EXPOSURE</p><p className="text-sm font-bold text-gray-300">{totalRisk}%</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[9px] text-gray-500">EFFECTIVE (w/ CORR)</p><p className="text-sm font-bold" style={{ color: effectiveExposure > 3 ? '#EF5350' : '#26A69A' }}>{effectiveExposure}%</p></div>
        </div>
        {correlatedPairs >= 2 && (<div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-[10px] font-bold text-red-400">\u26a0 CORRELATION WARNING</p><p className="text-[10px] text-gray-400">{correlatedPairs} correlated USD pairs. Effective exposure is {Math.round(correlationMultiplier * 100 - 100)}% higher than simple addition.</p></div>)}
        <div><p className="text-[10px] font-bold text-gray-300 mb-2">POSITION GAP ANALYSIS</p>{gapRisks.map(g => (<div key={g.id} className={`p-3 rounded-xl mb-1.5 ${g.gapExceedsStop ? 'bg-red-500/5 border border-red-500/15' : 'bg-white/[0.02] border border-white/[0.04]'}`}><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-gray-300">{g.pair} {g.direction}</span><span className={`text-[10px] font-bold ${g.gapExceedsStop ? 'text-red-400' : 'text-green-400'}`}>{g.gapExceedsStop ? '\u26a0 STOP VULNERABLE' : '\u2713 STOP SURVIVES'}</span></div><p className="text-[9px] text-gray-500 mt-1">Expected event move: {g.expectedMove}p | Your stop: {g.stopPips}p | Potential loss: {g.potentialLoss}%</p></div>))}
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">RECOMMENDED ADJUSTMENTS</p><p className="text-xs text-gray-400">{gapRisks.some(g => g.gapExceedsStop) ? `Close or widen stops on ${gapRisks.filter(g => g.gapExceedsStop).map(g => g.pair).join(', ')}. Stop is inside expected event range.` : 'All stops survive expected event range. Monitor but no immediate changes needed.'}{hasHighEvent && correlatedPairs >= 2 ? ' Reduce correlated positions before Tier 1 events.' : ''}</p></div>
        <button onClick={() => setCalculated(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Edit Positions</button>
      </motion.div>)}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function RiskManagementEventsPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 8</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 12</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Risk Management<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Around Events</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Adjust before the storm, not during it. Event risk budgets, gap protection, and the exact position adjustments that separate survivors from casualties.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\ud83c\udfe0 The Storm Shutter System</p>
            <p className="text-gray-400 leading-relaxed mb-4">Florida homeowners don\u2019t install storm shutters <strong className="text-amber-400">during</strong> a hurricane. They install them <strong className="text-white">before hurricane season starts</strong>. When the storm arrives, the shutters are already in place. You check the forecast, decide which windows are most vulnerable, and protect them FIRST.</p>
            <p className="text-gray-400 leading-relaxed">Your positions are windows. Events are storms. <strong className="text-white">Adjust the shutters before the wind arrives.</strong> During the storm, it\u2019s too late \u2014 spreads are extreme, fills are terrible, and panic leads to bad decisions.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Trader holds EUR/USD long + GBP/USD long + XAUUSD long into NFP Friday. Each at 1% risk. Thinks total risk is 3%. NFP beats massively. USD surges. <strong className="text-red-400">All 3 stopped: actual loss \u22124.8%</strong> (correlation amplified). If they\u2019d calculated event exposure beforehand: <strong className="text-green-400">would have closed 2, kept 1 at reduced risk. Loss: \u22120.5%.</strong> The difference: <strong className="text-white">pre-event math vs post-event pain.</strong></p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Event Risk Timeline</p><h2 className="text-2xl font-extrabold mb-4">48 Hours of Preparation</h2><p className="text-gray-400 text-sm mb-6">Every major event has a preparation timeline. Know the phases.</p><EventTimelineAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Weekend Gap Risk</p><h2 className="text-2xl font-extrabold mb-4">Your Stop Doesn&rsquo;t Work During Gaps</h2><p className="text-gray-400 text-sm mb-6">Friday close at 1.0850, stop at 1.0830. Monday opens at 1.0780. You lose 70 pips, not 20.</p><GapRiskAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Event Risk Frameworks</p><h2 className="text-2xl font-extrabold mb-4">Budget, Gaps, Earnings &amp; Sizing</h2><div className="space-y-3">{eventRiskBudget.map((item, i) => (<div key={i}><button onClick={() => toggle(`erb-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`erb-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`erb-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Position Adjustment Matrix</p><h2 className="text-2xl font-extrabold mb-4">What to Do in Every Situation</h2><div className="p-6 rounded-2xl glass-card space-y-3">{positionAdjustments.map(item => (<div key={item.situation} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-[11px] font-bold text-gray-300">{item.situation}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.sizing}</span></div><p className="text-[11px] text-gray-500">{item.action}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Event Risk Calculator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Event Risk Calculator</h2><p className="text-gray-400 text-sm mb-6">Input your positions and this week\u2019s events. Get your Weekly Risk Score, gap analysis, and specific adjustment recommendations.</p>
      <div className="p-6 rounded-2xl glass-card"><EventRiskCalculator /></div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Friday Afternoon Ritual</p><h2 className="text-2xl font-extrabold mb-4">5 Minutes That Save Accounts</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">STEP 1</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">List all open positions with current P&L and stop distances.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">STEP 2</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Scan weekend news: any geopolitical tension, political events, or financial system concerns?</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">STEP 3</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">For each position: can I absorb a 200-pip adverse gap? If not, reduce or close.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">STEP 4</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Trail winners. Close losers. The weekend should not turn a controlled loss into an uncontrolled disaster.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">STEP 5</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Set Sunday night alarm. 60-second headline check before Asian open. Adjust if needed.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Stop Survival Math</p><h2 className="text-2xl font-extrabold mb-4">Is Your Stop Inside the Blast Zone?</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">STOP &gt; EXPECTED RANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your 60-pip stop survives a 55-pip CPI move. Hold is acceptable. The stop has room.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">STOP &lt; EXPECTED RANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your 20-pip stop inside a 55-pip CPI range = guaranteed stop-out. Close or widen. No third option.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">STOP \u2248 EXPECTED RANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your 50-pip stop with a 55-pip expected range = marginal. Might survive, might not. Risk:reward analysis needed.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE FORMULA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If StopPips &lt; AvgEventMove: either widen to 1.2\u00d7 the move OR close. There is no \u201ctighten for protection.\u201d</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Event Risk Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Event Risk Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">STOP vs RANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If your stop &lt; expected event move, it WILL be hit. Widen to 1.2\u00d7 the move or close. No tight stops during news.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">EVENT BUDGET</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Max 3% event exposure. Add up ALL correlated positions. If over budget, reduce before the event, not during.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">FRIDAY RITUAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">5 minutes before close: list positions, scan weekend risk, gap-proof each one. Can each absorb a 200-pip gap?</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">CORRELATION TAX</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 USD-bearish positions at 1% each \u2260 3%. Correlation amplifies to ~5%. Calculate effective exposure, not simple addition.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Adjust BEFORE the storm. During the event: spreads extreme, fills terrible, decisions emotional. Pre-event math &gt; post-event panic.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Event Risk Management Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Protect your account before the data drops.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can protect your account through any event.' : gameScore >= 3 ? 'Good \u2014 review the stop-inside-range and the correlation exposure calculations.' : 'Re-read the event risk budget and the gap risk sections before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\ud83c\udfaf</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Risk Management Around Events</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Event Risk Manager &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
