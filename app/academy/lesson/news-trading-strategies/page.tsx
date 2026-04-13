// app/academy/lesson/news-trading-strategies/page.tsx
// ATLAS Academy — Lesson 8.11: News Trading Strategies [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: News Strategy Decision Tool — situation-based action recommender
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
// ANIMATION 1: Three Strategies on the Same NFP Chart
// ============================================================
function ThreeStrategiesAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('3 Approaches to the Same NFP Release', cx, 16);
    // Shared price path
    const chartL = 25; const chartR = w - 15; const chartW = chartR - chartL;
    const chartT = 40; const chartB = h - 45; const chartH = chartB - chartT;
    const progress = Math.min(1, (t % 12) / 8);
    const segments = [
      { x1: 0, x2: 0.25, y1: 0.5, y2: 0.5 },    // pre-compression
      { x1: 0.25, x2: 0.32, y1: 0.5, y2: 0.82 },  // spike down
      { x1: 0.32, x2: 0.42, y1: 0.82, y2: 0.58 },  // fakeout reversal
      { x1: 0.42, x2: 0.65, y1: 0.58, y2: 0.88 },  // real direction
      { x1: 0.65, x2: 1.0, y1: 0.88, y2: 0.92 },   // continuation
    ];
    // NFP line
    const nfpX = chartL + 0.25 * chartW;
    ctx.strokeStyle = '#EF535020'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(nfpX, chartT); ctx.lineTo(nfpX, chartB); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.fillText('NFP', nfpX, chartT - 4);
    // 15-min line
    const fifteenX = chartL + 0.42 * chartW;
    ctx.strokeStyle = '#26A69A20'; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(fifteenX, chartT); ctx.lineTo(fifteenX, chartB); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#26A69A'; ctx.fillText('T+15', fifteenX, chartT - 4);
    // Price line
    ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#f59e0b80';
    const totalSegs = segments.length; const visP = progress * totalSegs;
    let started = false;
    segments.forEach((seg, si) => {
      if (si >= visP) return;
      const sp = Math.min(1, visP - si); const pts = 15;
      for (let p = 0; p <= pts * sp; p++) {
        const frac = p / pts;
        const x = chartL + (seg.x1 + (seg.x2 - seg.x1) * frac) * chartW;
        const noise = Math.sin(p * 2 + si * 5) * 0.01;
        const y = chartT + (seg.y1 + (seg.y2 - seg.y1) * frac + noise) * chartH;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
    }); ctx.stroke();
    // Strategy markers
    const strategies = [
      { name: 'AVOID', x: 0.12, y: 0.45, color: '#6b7280', emoji: '\ud83d\udeab', desc: 'Stayed flat.\nProtected capital.\n\u00a30 risk, \u00a30 P&L.' },
      { name: 'FADE', x: 0.48, y: 0.65, color: '#a855f7', emoji: '\ud83d\udd04', desc: 'Entered long at T+15\non reversal candle.\nTargeting the fakeout bounce.' },
      { name: 'RIDE', x: 0.55, y: 0.78, color: '#26A69A', emoji: '\ud83c\udfc4', desc: 'Entered short at T+15\nin the real direction.\nRiding the continuation.' },
    ];
    const activeStrat = Math.floor((t % 12) / 4) % 3;
    strategies.forEach((strat, i) => {
      const sx = chartL + strat.x * chartW; const sy = chartT + strat.y * chartH;
      const isActive = i === activeStrat;
      if (isActive && visP > 2) {
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = strat.color + '40'; ctx.fill();
        ctx.strokeStyle = strat.color; ctx.lineWidth = 2; ctx.stroke();
        // Card
        const cardX = i === 0 ? sx + 12 : i === 2 ? sx - 92 : sx + 12;
        ctx.fillStyle = strat.color + '10'; ctx.beginPath(); ctx.roundRect(cardX, sy - 30, 80, 55, 6); ctx.fill();
        ctx.strokeStyle = strat.color + '40'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.roundRect(cardX, sy - 30, 80, 55, 6); ctx.stroke();
        ctx.fillStyle = strat.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
        ctx.fillText(strat.emoji + ' ' + strat.name, cardX + 5, sy - 18);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '6px system-ui';
        strat.desc.split('\n').forEach((l, li) => ctx.fillText(l, cardX + 5, sy - 6 + li * 9));
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Avoid = safest. Ride = highest reward. Fade = counter-trend (advanced). All are valid strategies.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: Spread Widening Visualisation
// ============================================================
function SpreadWideningAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Spread Widening During News \u2014 The Hidden Cost', cx, 16);
    const barY = 55; const maxBarW = w * 0.7; const barH = 28; const startX = (w - maxBarW) / 2;
    const phases = [
      { label: 'NORMAL', spread: '1.2 pips', width: 0.08, color: '#26A69A', rr: '1:2.0 R:R', cost: '\u00a31.20' },
      { label: 'PRE-NEWS (T-5)', spread: '3.5 pips', width: 0.23, color: '#FFB300', rr: '1:1.6 R:R', cost: '\u00a33.50' },
      { label: 'AT RELEASE', spread: '12 pips', width: 0.8, color: '#EF5350', rr: '1:0.6 R:R', cost: '\u00a312.00' },
      { label: 'T+5 MINUTES', spread: '8 pips', width: 0.53, color: '#EF5350', rr: '1:0.9 R:R', cost: '\u00a38.00' },
      { label: 'T+15 MINUTES', spread: '2 pips', width: 0.13, color: '#26A69A', rr: '1:1.9 R:R', cost: '\u00a32.00' },
    ];
    const activeIdx = Math.floor((t % 15) / 3) % 5;
    phases.forEach((phase, i) => {
      const y = barY + i * (barH + 12); const isActive = i === activeIdx;
      const bw = phase.width * maxBarW;
      // Label
      ctx.fillStyle = isActive ? phase.color : 'rgba(255,255,255,0.2)'; ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
      ctx.textAlign = 'right'; ctx.fillText(phase.label, startX - 8, y + barH / 2 + 3);
      // Bar
      ctx.fillStyle = isActive ? phase.color + '30' : phase.color + '08';
      ctx.beginPath(); ctx.roundRect(startX, y, bw, barH, 4); ctx.fill();
      ctx.strokeStyle = isActive ? phase.color + '60' : phase.color + '15'; ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.roundRect(startX, y, bw, barH, 4); ctx.stroke();
      // Spread value
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.15)'; ctx.font = `${isActive ? 'bold 10' : '8'}px system-ui`;
      ctx.textAlign = 'left'; ctx.fillText(phase.spread, startX + bw + 8, y + barH / 2 + 4);
      // R:R impact
      if (isActive) {
        ctx.fillStyle = phase.color; ctx.font = '8px system-ui'; ctx.textAlign = 'right';
        ctx.fillText(`${phase.rr} | Cost: ${phase.cost}`, startX + maxBarW, y + barH / 2 + 4);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('At release: spread 10x normal. Your 1:2 R:R becomes 1:0.6. Wait for T+15 to restore R:R.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// NEWS STRATEGY DECISION TOOL DATA
// ============================================================
interface Situation { id: number; title: string; position: string; event: string; impact: string; timing: string; stopDistance: string; recommendation: string; reasoning: string; riskLevel: string; color: string; }
const situations: Situation[] = [
  { id: 1, title: 'Flat Before Tier 1 Event', position: 'No open positions', event: 'NFP / CPI / FOMC', impact: 'High', timing: '30+ minutes before', stopDistance: 'N/A', recommendation: 'STAY FLAT. Wait for T+15 after release. If deviation is clear and direction established, enter with standard risk. If mixed/in-line, skip entirely.', reasoning: 'No exposure means no risk. This is the optimal position before Tier 1 events. Your edge comes AFTER the data, not before it.', riskLevel: 'PROTECTED', color: '#26A69A' },
  { id: 2, title: 'In a Trade, In Profit Before Tier 1', position: 'Open position at +0.5R to +2R', event: 'NFP / CPI / FOMC', impact: 'High', timing: '30 minutes before', stopDistance: 'Standard', recommendation: 'CLOSE the position. Lock in profit. +0.8R in the bank is worth more than a potential +2R that could become \u22121.5R in 30 seconds. Re-enter after settle.', reasoning: 'Tier 1 events can move your instrument 50\u2013250 pips with spread widening that makes stops unreliable. Your profit is real. The event outcome is unknown.', riskLevel: 'CLOSE & PROTECT', color: '#FFB300' },
  { id: 3, title: 'In a Trade, At a Loss Before Tier 1', position: 'Open position at \u22120.3R to \u22120.8R', event: 'NFP / CPI / FOMC', impact: 'High', timing: '30 minutes before', stopDistance: 'Standard', recommendation: 'CLOSE now. Take the small loss. A \u22120.5R controlled loss is infinitely better than a \u22122R uncontrolled gap through your stop. The event may help or hurt \u2014 you don\u2019t know which.', reasoning: 'Holding a losing position into a Tier 1 event is gambling, not trading. You\u2019re hoping the event moves in your favour. Hope is not a strategy.', riskLevel: 'CLOSE & ACCEPT', color: '#EF5350' },
  { id: 4, title: 'Post-Release: Clear Deviation', position: 'Flat, watching', event: 'Any high-impact', impact: 'High', timing: 'T+15 to T+30', stopDistance: 'N/A', recommendation: 'ENTER in the direction of the deviation. Spreads have normalised. Direction is confirmed. Structure-based stop. Full risk if macro aligns. This is your window.', reasoning: 'At T+15, the fakeout has played out, spreads are normal, and the real institutional flow is visible. This is the highest-probability news trade entry point.', riskLevel: 'ENTER', color: '#26A69A' },
  { id: 5, title: 'Post-Release: In-Line / No Deviation', position: 'Flat, watching', event: 'Any', impact: 'Any', timing: 'T+15', stopDistance: 'N/A', recommendation: 'NO TRADE. In-line data provides no new information and no catalyst. The market will chop. Save your capital for a session where the data surprises.', reasoning: 'In-line = priced in = no new information = no edge. The 5\u201315 pip wiggle after in-line data is noise, not signal. Trading noise destroys accounts slowly.', riskLevel: 'SKIP', color: '#6b7280' },
  { id: 6, title: 'Medium-Impact Event During Session', position: 'Open position', event: 'PMI / GDP / Retail', impact: 'Medium', timing: 'During release', stopDistance: 'Wide (30+ pips)', recommendation: 'HOLD if stop is wide enough (30+ pips for major pairs). Medium events move 20\u201350 pips. If your stop survives the expected range, the position is safe. If stop is tight (<20 pips), tighten or close.', reasoning: 'Medium events don\u2019t warrant flattening like Tier 1. But a 15-pip stop during a 40-pip PMI move is still a problem. The key is whether your stop can absorb the expected volatility range.', riskLevel: 'HOLD IF WIDE', color: '#3b82f6' },
];

// ============================================================
// CONTENT DATA
// ============================================================
const threeApproaches = [
  { title: '\ud83d\udeab AVOID \u2014 Stay Flat, Stay Safe', desc: '<strong>The approach:</strong> No positions before, during, or immediately after the event. Re-enter when volatility normalises (T+30 to T+60).<br/><br/><strong>Who it\u2019s for:</strong> Beginners. Risk-averse traders. Anyone who doesn\u2019t want to deal with news volatility. There is ZERO shame in this approach.<br/><br/><strong>Win rate:</strong> 100% survival rate. 0% of traders who avoid news blow accounts on news. The maths is unbeatable.<br/><br/><strong>The cost:</strong> You miss some of the best post-news setups. The market often trends strongly after major deviations. By avoiding entirely, you leave the continuation move on the table.<br/><br/><strong>Best for:</strong> FOMC (most dangerous), NFP on instruments you don\u2019t normally trade, any event you don\u2019t fully understand.' },
  { title: '\ud83c\udfc4 RIDE \u2014 Trade the Continuation', desc: '<strong>The approach:</strong> Wait for T+15. Identify the real direction (post-fakeout). Enter in the direction the deviation implies. Ride the continuation move.<br/><br/><strong>The logic:</strong> Hot NFP = USD strong. At T+15, if EUR/USD is still falling after the fakeout bounce, enter short. You\u2019re riding the institutional flow that\u2019s repricing the new data.<br/><br/><strong>Win rate:</strong> ~55\u201362% when the deviation is significant (\u00b10.3%+ on CPI, \u00b180K+ on NFP). Much lower on small deviations.<br/><br/><strong>Entry rules:</strong> Wait full 15 minutes. Spreads must be normalised (<3x normal). Direction must be clear (not chopping). Deviation must be meaningful. If ANY of these fail, default to AVOID.<br/><br/><strong>Best for:</strong> Clear NFP/CPI deviations on instruments you normally trade (EUR/USD, Gold, NASDAQ).' },
  { title: '\ud83d\udd04 FADE \u2014 Trade the Reversal (Advanced)', desc: '<strong>The approach:</strong> After a strong initial spike, look for signs of exhaustion and reversal. Enter AGAINST the spike direction. Targeting the mean reversion.<br/><br/><strong>The logic:</strong> The initial spike overshoots 60\u201370% of the time. The fakeout is the most reliable pattern. If you can identify the exhaustion candle, entering the fade captures the reversal.<br/><br/><strong>Win rate:</strong> ~50\u201355% \u2014 lower than riding but with potentially better R:R because you\u2019re entering at the extreme.<br/><br/><strong>DANGER:</strong> This is the most dangerous approach. If the spike is the START of a genuine repricing (not a fakeout), your fade trade gets destroyed. Only for experienced traders who can read candle exhaustion signals in real-time.<br/><br/><strong>Best for:</strong> In-line data that spikes on algo misread. Small deviations where the initial move overshoots. NEVER use on shock deviations (\u00b10.5%+ CPI, \u00b1150K+ NFP) \u2014 those are genuine repricing, not fakeouts.' },
];

const fifteenMinRule = [
  { time: 'T+0 to T+1 min', what: 'Algo spike. 80% of the initial move happens here. Spreads at 5\u201315x. DO NOT ENTER.', color: '#EF5350' },
  { time: 'T+1 to T+5 min', what: 'The fakeout zone. Price partially reverses. Retail traders who entered at T+0 get stopped. STILL DO NOT ENTER.', color: '#EF5350' },
  { time: 'T+5 to T+10 min', what: 'Direction battles. Core vs headline parsed. Institutional desks begin positioning. Spreads starting to normalise.', color: '#FFB300' },
  { time: 'T+10 to T+15 min', what: 'Real direction establishing. Fakeout completed. Spreads near normal. Your entry WINDOW is opening.', color: '#FFB300' },
  { time: 'T+15 to T+30 min', what: 'ENTRY ZONE. Direction confirmed. Spreads normal. Place your trade with a structure-based stop. THIS is when news traders make money.', color: '#26A69A' },
];

const commonMistakes = [
  { title: 'Entering at T+0', mistake: 'You see CPI drop, EUR/USD spikes 50 pips, you enter at T+30 seconds. Spread is 12 pips. Price reverses 25 pips. You\u2019re stopped before the real move even starts.', fix: 'The T+0 spike is for algorithms. You are not an algorithm. Your reaction time, spread cost, and slippage make T+0 entries negative EV for humans. Wait 15 minutes. Every time.' },
  { title: 'Fading a Shock Deviation', mistake: 'CPI +0.6% above forecast. Gold drops $25. You buy Gold on the \u201cdip.\u201d It drops another $15 over the next hour. Shock deviations don\u2019t fakeout \u2014 they reprice.', fix: 'NEVER fade a shock deviation (\u00b10.5%+ CPI, \u00b1150K+ NFP, surprise rate decision). These are genuine repricing events, not fakeouts. The fade strategy ONLY works on small-to-moderate deviations.' },
  { title: 'Trading Every News Event', mistake: 'You trade NFP, CPI, PMI, GDP, Retail Sales, Claims, Consumer Confidence, BOE, ECB, and BOJ. By Friday you\u2019ve taken 6 news trades and 4 were losses.', fix: 'Pick 1\u20132 events per month that you understand deeply. Quality over quantity. NFP and CPI are enough for most traders. Add FOMC if you understand central bank language from Lesson 8.3.' },
  { title: 'No Pre-Defined Plan', mistake: 'News drops. You freeze. Then panic. Then enter 3 minutes late at a terrible price. Then move your stop. Classic.', fix: 'BEFORE the event: \u201cIf deviation is X, I will wait 15 min then enter Y direction on Z instrument with this stop and this target.\u201d Write it down. Follow it. No improvisation during chaos.' },
];

const quizQuestions = [
  { q: 'The 3 news trading approaches are:', opts: ['Buy, Sell, Hold', 'Avoid (stay flat), Ride (trade continuation after T+15), Fade (counter-trend reversal) \u2014 each valid for different scenarios', 'Scalp, Swing, Position', 'Pre-position, Straddle, Close'], correct: 1, explain: 'Avoid = safest (100% survival). Ride = highest reward (enter in deviation direction after T+15). Fade = advanced counter-trend (only on small deviations, never on shocks). All three are legitimate strategies.' },
  { q: 'Why does the 15-minute rule exist?', opts: ['Markets are closed for 15 minutes', 'The initial spike overshoots and reverses 60\u201370% of the time. Spreads are 5\u201315x normal. Direction is unclear. T+15 allows fakeout completion, spread normalisation, and real direction confirmation.', 'Brokers require a waiting period', 'Technical indicators need 15 minutes to update'], correct: 1, explain: 'Three reasons: (1) The algo spike overshoots and triggers a fakeout. (2) Spreads are extreme, destroying your R:R. (3) Core vs headline parsing takes time. At T+15, all three issues resolve and the real direction is visible.' },
  { q: 'Normal EUR/USD spread: 1.2 pips. During NFP: 12 pips. Your planned 1:2 R:R with a 20-pip stop becomes:', opts: ['Still 1:2', 'Approximately 1:0.6 \u2014 the 12-pip spread entry cost plus the 20-pip stop means your risk is 32 pips while your target minus spread is only ~28 pips', 'Better \u2014 more volatility', 'Depends on the direction'], correct: 1, explain: 'Spread adds direct cost to entry. With a 12-pip spread, you\u2019re immediately \u22120.6R the moment you enter. Your 20-pip stop effectively means only 8 pips of \u201creal\u201d room. The R:R math collapses. This is why T+15 matters \u2014 spreads return to 2 pips.' },
  { q: 'CPI: +0.6% above forecast (shock deviation). Gold drops $22 in 2 minutes. The correct FADE trade is:', opts: ['Buy Gold now \u2014 it\u2019s oversold', 'DO NOT FADE. Shock deviations are genuine repricing, not fakeouts. The \u201cdip\u201d is the beginning of the move, not the end.', 'Buy Gold at T+5', 'Set a limit order at the pre-CPI price'], correct: 1, explain: 'Shock deviations (\u00b10.5%+) are fundamentally different from mild surprises. They represent genuine repricing of rate expectations. Fading a shock is fighting institutional repositioning. Only fade SMALL deviations where the overshoot is likely temporary.' },
  { q: 'You have an open EUR/USD long at +1.2R. NFP is in 25 minutes. Best action:', opts: ['Hold \u2014 you\u2019re in profit and protected', 'Close at +1.2R. NFP can move EUR/USD 80+ pips. Your profit could become a loss in seconds. Lock it in. Re-enter after T+15 if direction supports.', 'Move stop to breakeven', 'Add to the position before the news'], correct: 1, explain: '+1.2R is real, confirmed profit. NFP is an unknown. Holding real profit through a binary event is gambling. Close, secure +1.2R, and re-enter after the dust settles. You\u2019ll likely get a better entry anyway at T+15.' },
  { q: 'PMI releases during your session. Your open position has a 35-pip stop. PMI typically moves EUR/USD 20\u201350 pips. You should:', opts: ['Close immediately \u2014 any event is dangerous', 'Hold \u2014 your 35-pip stop can absorb the typical PMI range. Medium events don\u2019t warrant flattening if your stop is wide enough.', 'Tighten stop to 15 pips for protection', 'Add to the position'], correct: 1, explain: 'PMI is medium-impact, not Tier 1. A 35-pip stop can survive the 20\u201350 pip typical range (with some risk at the upper end). The correct response to medium events is: hold if stop is wide, close if stop is tight. You don\u2019t need to flatten for every data release.' },
  { q: 'Your pre-news plan was: "If NFP beats by 100K+, wait 15 min, then short EUR/USD." NFP beats by 120K. At T+15, EUR/USD has dropped 65 pips and direction is clear. You should:', opts: ['Skip \u2014 65 pips already happened, too late', 'Execute your plan. Enter short with a structure-based stop. The 65-pip move establishes direction. The continuation over the next 2\u20134 hours typically adds another 30\u201360 pips on big deviations.', 'Go long \u2014 bounce incoming', 'Wait for T+60 to be really sure'], correct: 1, explain: 'Your plan was clear and the conditions were met. The 65-pip move isn\u2019t \u201ctoo late\u201d \u2014 it\u2019s the SETUP for the continuation. Big NFP deviations trend for hours. T+15 is the entry, not the end. Following your pre-defined plan is exactly how news trading works.' },
  { q: 'The best news trading strategy for a beginner is:', opts: ['Fade \u2014 the reversal seems easier', 'Avoid \u2014 100% survival rate. Zero accounts blown by staying flat. Learn by watching before trading news events.', 'Pre-position based on forecasts', 'Straddle (pending orders both sides)'], correct: 1, explain: 'AVOID is the only zero-risk news strategy. Watch the events. Study the reactions. Journal the patterns. After 3\u20136 months of observation, try RIDE on one clear deviation. Fade requires experience and should not be attempted until you\u2019re consistently profitable.' },
];

const gameRounds = [
  { scenario: '<strong>NFP releases in 20 minutes.</strong> You\u2019re completely flat. Your pre-session plan says: \u201cIf NFP beats by 80K+, wait 15 min, enter short EUR/USD. If mixed or in-line, skip.\u201d You feel confident and want to pre-position short before the release.', options: [
    { text: 'Pre-position short \u2014 you\u2019re confident it will beat.', correct: false, explain: '\u2717 Pre-positioning before news is pure gambling. You have no edge on whether NFP will beat, miss, or hit. Even \u201cconfident\u201d predictions are wrong 40-50% of the time. Stick to your plan: wait for the data.' },
    { text: 'Stick to the plan. Stay flat. Wait for the data. If it beats by 80K+, execute at T+15. If not, skip. No improvisation.', correct: true, explain: '\u2713 The plan exists for exactly this moment. Confidence is not data. Execute the plan as written. If NFP beats big, you\u2019ll enter at T+15 with confirmed direction and normalised spreads. If not, you saved capital.' },
    { text: 'Set pending orders both sides (straddle).', correct: false, explain: '\u2717 Straddles get whipsawed by the fakeout. The initial spike triggers one side. The reversal triggers the other. You end up with two losing positions. Straddles have negative expected value during high-impact events.' },
  ]},
  { scenario: '<strong>CPI just released.</strong> Headline: 3.1% (forecast 3.2%). Core: 3.3% (forecast 3.3%). Headline slightly cool, core in-line. EUR/USD wiggled 12 pips up then back to flat. It\u2019s T+15. Market is dead quiet.', options: [
    { text: 'Long EUR/USD \u2014 cool headline is USD bearish.', correct: false, explain: '\u2717 -0.1% headline with in-line core is a non-event. There\u2019s no meaningful deviation to trade. The 12-pip wiggle is noise. Entering here is paying spread for zero edge.' },
    { text: 'No trade. In-line core + tiny headline miss = no new information. The market agrees \u2014 it\u2019s flat. Save your capital for a day with a real deviation.', correct: true, explain: '\u2713 Perfect restraint. In-line data = priced in = no catalyst. The best trade is no trade. Your capital is preserved for the next event where the deviation is meaningful.' },
    { text: 'Short EUR/USD \u2014 it failed to rally on the cool print, that\u2019s bearish.', correct: false, explain: '\u2717 \u201cFailed to rally on good news\u201d is a valid PATTERN reading, but not on a 12-pip move after a 0.1% deviation. You\u2019re reading phantom signals in noise.' },
  ]},
  { scenario: '<strong>NFP released 4 minutes ago.</strong> Jobs: +340K (forecast +180K). MASSIVE beat. EUR/USD spiked down 70 pips. Then bounced 25 pips. Now it\u2019s dropping again. Spreads are still 6x normal. Your friend messages: \u201cGo short NOW before you miss it!\u201d', options: [
    { text: 'Enter now \u2014 direction is clearly bearish and the bounce is over.', correct: false, explain: '\u2717 It\u2019s T+4 minutes. Spreads are 6x. The \u201cbounce is over\u201d is your interpretation at a moment when the market is still digesting. At 6x spread your entry cost alone eats 40% of a standard stop. Wait.' },
    { text: 'Wait until T+15. The deviation is huge and direction will persist. At T+15: spreads normalised, fakeout completed, institutional flow visible. Your entry will be 20 pips \u201cworse\u201d but your survival rate is 300% better.', correct: true, explain: '\u2713 A 160K beat will trend for hours. Missing 20 pips at T+4 vs T+15 is irrelevant when the continuation move is 60-100 pips. Your patience costs 20 pips and saves you from a potential 6x-spread stop-out.' },
    { text: 'Buy EUR/USD \u2014 fade the spike.', correct: false, explain: '\u2717 NEVER fade a 160K deviation. This is genuine repricing, not a fakeout. Buying against a +160K NFP beat is fighting institutional repositioning. The \u201cbounce\u201d was retail getting caught, not a reversal signal.' },
  ]},
  { scenario: '<strong>FOMC tonight at 19:00.</strong> You trade the London session (07:00-16:00). At 14:30, a clean EUR/USD bearish OB setup appears. Your macro bias is neutral. The setup grade is A.', options: [
    { text: 'Enter \u2014 FOMC is 4.5 hours away and the setup is A grade.', correct: false, explain: '\u2717 FOMC pre-positioning begins 2-3 hours before the decision. By 16:30, volatility compression will have moved your trade into an unpredictable zone. An A setup today is a C setup with FOMC pre-positioning as a backdrop.' },
    { text: 'Enter at 50% risk with a HARD close at 16:00. You have 90 minutes for the setup to play out. If it hasn\u2019t hit TP by 16:00, close regardless \u2014 no holding into FOMC evening.', correct: true, explain: '\u2713 Smart compromise. The setup is valid and FOMC is far enough for a short-duration trade. Reduced risk + hard close time = controlled exposure. You\u2019re taking the opportunity while respecting the event constraint.' },
    { text: 'Skip entirely \u2014 FOMC day means no trading after lunch.', correct: false, explain: '\u2717 You have 90 minutes of tradeable time. With reduced size and a hard close, you can extract value from a clean setup without FOMC exposure. Blanket \u201cno trading\u201d loses opportunities unnecessarily.' },
  ]},
  { scenario: '<strong>Post-NFP, T+20.</strong> NFP missed badly (\u221260K deviation). EUR/USD rallied 55 pips. Direction is clearly bullish. Spreads are back to 2 pips. You enter long EUR/USD at 1% risk with a 25-pip stop. 30 minutes later, you\u2019re at +1.8R. The move seems to be stalling.', options: [
    { text: 'Close at +1.8R \u2014 great trade, take the money.', correct: false, explain: '\u2717 Acceptable but sub-optimal. Big NFP misses trend for hours, not minutes. +1.8R in 30 minutes suggests strong institutional flow. A trailing stop captures more while protecting profit.' },
    { text: 'Trail stop to +1R and let it run. Big deviation trends persist. If it stalls and reverses, you lock +1R. If it continues, you capture +2.5R or more.', correct: true, explain: '\u2713 Big deviations create multi-hour trends. Trailing to +1R protects significant profit while keeping upside open. The \u201cstall\u201d at +1.8R may just be a consolidation before the next leg. Let the market decide.' },
    { text: 'Add to the position \u2014 double down on the trend.', correct: false, explain: '\u2717 Adding at +1.8R increases your average entry price and concentrates risk at the extended point of the move. If it reverses from here, you lose on both the original and the add. Trail, don\u2019t add.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function NewsTradingStrategiesPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // News Strategy Decision Tool
  const [activeSituation, setActiveSituation] = useState(0);

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

  const sit = situations[activeSituation];

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 11</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">News Trading<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Strategies</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Three approaches to the most volatile moments in trading. Avoid, Ride, or Fade. Know when each applies and you&rsquo;ll never be caught off-guard by a data release again.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\u26a1 The 3 Playbooks for Chaos</p>
            <p className="text-gray-400 leading-relaxed mb-4">A fire station has 3 response protocols: <strong className="text-amber-400">small fire</strong> (one truck), <strong className="text-white">house fire</strong> (full crew), and <strong className="text-amber-400">wildfire</strong> (evacuate). They don\u2019t decide which protocol to use DURING the emergency. They decide <strong className="text-white">before the alarm sounds</strong>.</p>
            <p className="text-gray-400 leading-relaxed">News events are your alarm. <strong className="text-white">Avoid</strong> (evacuate), <strong className="text-white">Ride</strong> (full crew, fight the fire in the confirmed direction), or <strong className="text-white">Fade</strong> (advanced counter-attack). The decision is made BEFORE the data drops.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">3 traders, same NFP release (+160K beat). <strong className="text-gray-500">Trader A (Avoid): \u00a30 P&L. Capital protected.</strong> <strong className="text-green-400">Trader B (Ride): Entered EUR/USD short at T+15. Captured 65-pip continuation. +1.8R.</strong> <strong className="text-red-400">Trader C (no strategy): Entered at T+0, got faked out, re-entered, got stopped again. \u22121.7R.</strong> The difference: <strong className="text-white">a pre-defined plan vs improvisation under pressure</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 3 Approaches</p><h2 className="text-2xl font-extrabold mb-4">Avoid, Ride, or Fade</h2><p className="text-gray-400 text-sm mb-6">Three strategies on the same NFP chart. Each enters (or doesn\u2019t) at a different point.</p><ThreeStrategiesAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Hidden Cost</p><h2 className="text-2xl font-extrabold mb-4">Spread Widening Destroys R:R</h2><p className="text-gray-400 text-sm mb-6">Your 1:2 R:R plan becomes 1:0.6 during the release. Here\u2019s why timing is everything.</p><SpreadWideningAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Deep Dive: Each Strategy</p><h2 className="text-2xl font-extrabold mb-4">Avoid, Ride &amp; Fade Explained</h2><div className="space-y-3">{threeApproaches.map((item, i) => (<div key={i}><button onClick={() => toggle(`ta-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ta-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ta-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 15-Minute Rule in Detail</p><h2 className="text-2xl font-extrabold mb-4">Minute-by-Minute After Release</h2><div className="p-6 rounded-2xl glass-card space-y-3">{fifteenMinRule.map(item => (<div key={item.time} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.time}</p><p className="text-[11px] text-gray-400">{item.what}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: News Strategy Decision Tool */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">News Strategy Decision Tool</h2><p className="text-gray-400 text-sm mb-6">6 common pre/post-news situations. Select your scenario and get the recommended action with reasoning.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex flex-wrap gap-1.5">{situations.map((s, i) => (<button key={s.id} onClick={() => setActiveSituation(i)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeSituation === i ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-500'}`}>{s.id}. {s.title.split(' ').slice(0, 3).join(' ')}...</button>))}</div>
        <motion.div key={sit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm font-bold text-white mb-2">{sit.title}</p><div className="grid grid-cols-2 gap-2 text-[10px]"><div><span className="text-gray-500">Position:</span> <span className="text-gray-300">{sit.position}</span></div><div><span className="text-gray-500">Event:</span> <span className="text-gray-300">{sit.event}</span></div><div><span className="text-gray-500">Impact:</span> <span className="text-gray-300">{sit.impact}</span></div><div><span className="text-gray-500">Timing:</span> <span className="text-gray-300">{sit.timing}</span></div></div></div>
          <div className="p-4 rounded-xl" style={{ background: sit.color + '10', border: `1px solid ${sit.color}30` }}><p className="text-[10px] font-bold mb-1" style={{ color: sit.color }}>{sit.riskLevel}</p><p className="text-xs text-gray-300 font-semibold leading-relaxed">{sit.recommendation}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">REASONING</p><p className="text-xs text-gray-400 leading-relaxed">{sit.reasoning}</p></div>
        </motion.div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Pre-News Checklist</p><h2 className="text-2xl font-extrabold mb-4">Write This BEFORE Every Event</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">1. EVENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">What releases? What time? What\u2019s the forecast? What\u2019s the consensus expectation?</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">2. MY STRATEGY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Am I avoiding, riding, or fading? Decide NOW, not when the data drops.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">3. IF BEATS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">If deviation is positive: which instrument? Which direction? What stop? What target?</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">4. IF MISSES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Mirror of \u201cif beats\u201d but opposite direction. Same planning, same discipline.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">5. IF IN-LINE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">NO TRADE. Walk away. The market will produce a better opportunity on another day.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When NOT to Fade</p><h2 className="text-2xl font-extrabold mb-4">The Fade Kill List</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">SHOCK CPI (\u00b10.5%+)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Genuine repricing. Not a fakeout. Fading this = fighting institutional repositioning.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">MASSIVE NFP (\u00b1150K+)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">All 3 numbers align in one direction. This is a trend, not an overshoot. Do NOT fade.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">SURPRISE RATE DECISION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Market expected hold, got a cut (or vice versa). The entire rate path is repriced. Irreversible.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">FADE IS ONLY FOR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Small deviations (\u00b10.1-0.2%) where the initial spike clearly overshoots. Even then: tight stop, small size, accept the trade may fail.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 News Trading Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">News Trading Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#6b7280]">AVOID</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">100% survival. Best for beginners, FOMC, and events you don\u2019t understand. Zero shame in sitting out.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">RIDE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Enter at T+15 in deviation direction. Highest reward. Requires clear deviation + normalised spreads + confirmed direction.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">FADE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Advanced only. Counter-trend on small deviations. NEVER on shocks. Tight stop. Small size. Accept failure.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE 15-MIN RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Spike → fakeout → real direction. T+15 = spreads normal, direction clear, fakeout complete. THIS is your entry.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Write your plan BEFORE the data. \u201cIf beats: X. If misses: Y. If in-line: skip.\u201d No improvisation during chaos.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">News Trading Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Execute the right strategy at the right time.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can navigate news events like a professional.' : gameScore >= 3 ? 'Good \u2014 review the in-line skip and the FOMC day compromise.' : 'Re-read the 3 approaches and the 15-minute rule before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\u26a1</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: News Trading Strategies</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; News Tactician &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
