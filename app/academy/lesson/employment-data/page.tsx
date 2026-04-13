// app/academy/lesson/employment-data/page.tsx
// ATLAS Academy — Lesson 8.5: Employment Data (NFP & Jobs) [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: NFP Decision Framework — input deviation, get direction + confidence + action
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
// ANIMATION 1: NFP Trifecta — the 3 numbers that matter
// ============================================================
function NFPTrifectaAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The NFP Trifecta \u2014 3 Numbers, 1 Release', cx, 16);
    const numbers = [
      { label: 'JOBS ADDED', value: '+263K', forecast: '+180K', deviation: '+83K', direction: '\u2191 USD', color: '#26A69A', icon: '\ud83d\udcbc', desc: 'More jobs = stronger economy\n= Fed stays hawkish = USD up', yDir: 'up' },
      { label: 'UNEMPLOYMENT', value: '3.5%', forecast: '3.7%', deviation: '-0.2%', direction: '\u2191 USD', color: '#3b82f6', icon: '\ud83d\udcc9', desc: 'Lower unemployment = tight labour\n= wage pressure = hawkish', yDir: 'up' },
      { label: 'AVG HOURLY EARNINGS', value: '+0.6%', forecast: '+0.3%', deviation: '+0.3%', direction: '\u2191 USD', color: '#EF5350', icon: '\ud83d\udcb0', desc: 'Higher wages = inflation fuel\n= THE number the Fed fears most', yDir: 'up' },
    ];
    const activeIdx = Math.floor((t % 12) / 4) % 3;
    const cardW = (w - 50) / 3; const cardH = h - 55; const topY = 35;

    numbers.forEach((num, i) => {
      const x = 15 + i * (cardW + 7); const isActive = i === activeIdx;
      const pulse = isActive ? Math.sin(t * 3) * 2 : 0;
      ctx.fillStyle = isActive ? num.color + '10' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(x - pulse, topY - pulse, cardW + pulse * 2, cardH + pulse * 2, 8); ctx.fill();
      ctx.strokeStyle = isActive ? num.color + '50' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.beginPath(); ctx.roundRect(x, topY, cardW, cardH, 8); ctx.stroke();

      const textX = x + cardW / 2; ctx.textAlign = 'center';
      // Icon
      ctx.font = `${isActive ? 22 : 16}px system-ui`; ctx.fillText(num.icon, textX, topY + 25);
      // Label
      ctx.fillStyle = isActive ? num.color : 'rgba(255,255,255,0.2)';
      ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`; ctx.fillText(num.label, textX, topY + 42);
      if (isActive) {
        // Value + forecast
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px system-ui'; ctx.fillText(num.value, textX, topY + 62);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui'; ctx.fillText(`Forecast: ${num.forecast}`, textX, topY + 76);
        // Deviation
        ctx.fillStyle = num.color; ctx.font = 'bold 10px system-ui'; ctx.fillText(`Dev: ${num.deviation}`, textX, topY + 94);
        // Direction
        ctx.fillStyle = num.color + '80'; ctx.font = 'bold 8px system-ui'; ctx.fillText(num.direction, textX, topY + 112);
        // Description
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px system-ui';
        const lines = num.desc.split('\n');
        lines.forEach((l, li) => ctx.fillText(l, textX, topY + 128 + li * 11));
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Wages is the sleeper \u2014 it drives inflation expectations more than jobs or unemployment', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: NFP Price Action Replay — compression→spike→fake→real
// ============================================================
function NFPPriceReplayAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Typical NFP Price Action \u2014 EUR/USD', cx, 16);
    const progress = Math.min(1, (t % 12) / 8);
    const chartL = 30; const chartR = w - 15; const chartW = chartR - chartL;
    const chartT = 40; const chartB = h - 35; const chartH = chartB - chartT;

    // Time labels
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    const times = ['13:15', '13:25', '13:30', '13:31', '13:35', '13:45', '14:00'];
    const timeX = times.map((_, i) => chartL + (i / (times.length - 1)) * chartW);
    times.forEach((label, i) => ctx.fillText(label, timeX[i], chartB + 12));

    // Price path segments
    const segments = [
      // Pre-NFP compression (13:15-13:30)
      { x1: 0, x2: 0.28, y1: 0.5, y2: 0.5, phase: 'compress' },
      // Spike DOWN (13:30-13:31)
      { x1: 0.28, x2: 0.35, y1: 0.5, y2: 0.85, phase: 'spike' },
      // Fake reversal UP (13:31-13:35)
      { x1: 0.35, x2: 0.5, y1: 0.85, y2: 0.55, phase: 'fake' },
      // Real direction DOWN (13:35-13:45)
      { x1: 0.5, x2: 0.72, y1: 0.55, y2: 0.9, phase: 'real' },
      // Continuation (13:45-14:00)
      { x1: 0.72, x2: 1.0, y1: 0.9, y2: 0.95, phase: 'continue' },
    ];

    const totalSegments = segments.length;
    const visibleProgress = progress * totalSegments;

    // NFP release line
    const nfpX = chartL + 0.28 * chartW;
    ctx.strokeStyle = '#EF535030'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(nfpX, chartT); ctx.lineTo(nfpX, chartB); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center'; ctx.fillText('\u26a0 NFP', nfpX, chartT - 4);

    // Draw price line
    ctx.beginPath(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    let started = false;
    segments.forEach((seg, si) => {
      if (si >= visibleProgress) return;
      const segProgress = Math.min(1, visibleProgress - si);
      const points = 20;
      for (let p = 0; p <= points * segProgress; p++) {
        const frac = p / points;
        const x = chartL + (seg.x1 + (seg.x2 - seg.x1) * frac) * chartW;
        const baseY = seg.y1 + (seg.y2 - seg.y1) * frac;
        const noise = seg.phase === 'compress' ? (Math.sin(p * 2 + si) * 0.02) : seg.phase === 'spike' ? (Math.sin(p * 5) * 0.03) : (Math.sin(p * 1.5 + si * 3) * 0.015);
        const y = chartT + (baseY + noise) * chartH;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Phase labels
    const phases = [
      { x: 0.14, label: 'COMPRESSION', color: '#FFB300', minProgress: 0.5 },
      { x: 0.32, label: 'SPIKE', color: '#EF5350', minProgress: 1.5 },
      { x: 0.43, label: 'FAKE REVERSAL', color: '#a855f7', minProgress: 2.5 },
      { x: 0.61, label: 'REAL DIRECTION', color: '#26A69A', minProgress: 3.5 },
      { x: 0.86, label: 'CONTINUATION', color: '#26A69A', minProgress: 4.5 },
    ];
    phases.forEach(phase => {
      if (visibleProgress >= phase.minProgress) {
        ctx.fillStyle = phase.color; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(phase.label, chartL + phase.x * chartW, chartT + 12);
      }
    });

    // 15-min rule marker
    if (visibleProgress >= 3) {
      const ruleX = chartL + 0.5 * chartW;
      ctx.strokeStyle = '#26A69A30'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ruleX, chartT); ctx.lineTo(ruleX, chartB); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#26A69A'; ctx.font = 'bold 7px system-ui'; ctx.fillText('15-MIN ENTRY WINDOW', ruleX + 40, chartT + 25);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The initial spike reverses 68% of the time \u2014 the REAL direction appears after 15 minutes', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// NFP DECISION FRAMEWORK DATA
// ============================================================
interface NFPScenario { id: number; jobs: string; jobsForecast: string; unemployment: string; unempForecast: string; wages: string; wagesForecast: string; context: string; usdDirection: string; confidence: string; action: string; historicalWR: string; trap: string; verdict: 'strong_usd' | 'mild_usd' | 'neutral' | 'mild_usd_weak' | 'strong_usd_weak'; }
const nfpFramework: NFPScenario[] = [
  { id: 1, jobs: '+340K', jobsForecast: '+180K', unemployment: '3.5%', unempForecast: '3.7%', wages: '+0.5%', wagesForecast: '+0.3%', context: 'Fed signalling patience. Market pricing 3 cuts this year.', usdDirection: 'STRONG USD BULLISH', confidence: 'Very High (95%)', action: 'Wait 15 mins. Then look for EUR/USD shorts, USD/JPY longs. Gold short after 30 min settle.', historicalWR: '89% USD strength when all 3 beat forecast this aggressively', trap: 'Initial EUR/USD spike DOWN may partially reverse at T+3 min. DO NOT enter during the reversal \u2014 it\u2019s the fakeout. Real direction resumes by T+15.', verdict: 'strong_usd' },
  { id: 2, jobs: '+120K', jobsForecast: '+180K', unemployment: '4.0%', unempForecast: '3.8%', wages: '+0.1%', wagesForecast: '+0.3%', context: 'Economy showing signs of slowing. Bond market already pricing 4 cuts.', usdDirection: 'STRONG USD BEARISH', confidence: 'Very High (92%)', action: 'Wait 15 mins. Then EUR/USD longs, Gold longs. Avoid USD/JPY (BOJ risk compounds).', historicalWR: '86% USD weakness when all 3 miss this badly', trap: 'Initial reaction may be MUTED if bond market already priced in weakness. The follow-through comes as equity traders interpret the data \u2014 give it 20-30 mins.', verdict: 'strong_usd_weak' },
  { id: 3, jobs: '+200K', jobsForecast: '+180K', unemployment: '3.7%', unempForecast: '3.7%', wages: '+0.4%', wagesForecast: '+0.3%', context: 'Stable environment. No major policy shifts expected.', usdDirection: 'MILDLY USD BULLISH', confidence: 'Moderate (65%)', action: 'Small deviation. Wait 15 mins. If direction is clear, trade with reduced size. If choppy, skip entirely.', historicalWR: '62% USD strength when jobs slightly beat, wages slightly hot', trap: 'Small deviations cause CHOPPY price action. The market can\u2019t decide. If EUR/USD isn\u2019t clearly directional by T+20, there\u2019s no trade here.', verdict: 'mild_usd' },
  { id: 4, jobs: '+250K', jobsForecast: '+180K', unemployment: '3.6%', unempForecast: '3.7%', wages: '+0.1%', wagesForecast: '+0.3%', context: 'Fed focused on wage inflation as key inflation driver.', usdDirection: 'MIXED \u2014 CONFLICTING SIGNALS', confidence: 'Low (45%)', action: 'NO TRADE. Jobs strong but wages weak. The market will whipsaw as algos trade jobs (USD up) then humans trade wages (USD uncertain). Wait for next data point.', historicalWR: '48% either direction \u2014 essentially a coin flip', trap: 'This is the WORST scenario to trade. Strong jobs = hawkish. Weak wages = dovish. The market fights itself. 2-3 reversals within 30 mins are common. Sit out.', verdict: 'neutral' },
  { id: 5, jobs: '+150K', jobsForecast: '+180K', unemployment: '3.8%', unempForecast: '3.7%', wages: '+0.5%', wagesForecast: '+0.3%', context: 'Inflation remains elevated. Fed watching wages as primary concern.', usdDirection: 'USD BULLISH (wages dominate)', confidence: 'Moderate-High (72%)', action: 'Wait 15 mins. Initial reaction may be USD WEAK on jobs miss. Then reverses as wage data sinks in. Enter on the reversal.', historicalWR: '71% USD strength when wages significantly beat, even with soft jobs', trap: 'The TRAP is entering on the initial spike. Algos read jobs first (miss = USD weak). Then the wage data overrides within 5-10 mins. The reversal is the real trade.', verdict: 'mild_usd' },
];

const [selectedNFP, setSelectedNFPState] = [0, () => {}]; // placeholder, real state below

// ============================================================
// CONTENT DATA
// ============================================================
const trifectaDeep = [
  { title: '\ud83d\udcbc Jobs Added (Non-Farm Payrolls)', desc: '<strong>What:</strong> How many new jobs were created in the US (excluding farms) last month.<br/><br/><strong>Bullish USD:</strong> Higher than forecast = strong economy = Fed stays hawkish.<br/><strong>Bearish USD:</strong> Lower than forecast = economy slowing = Fed considers cuts.<br/><br/><strong>The nuance:</strong> The REVISION matters too. Last month\u2019s number often gets revised by \u00b150K. If this month beats forecast but last month was revised down \u221280K, the net picture is weaker than the headline suggests. Always check the revision.' },
  { title: '\ud83d\udcc9 Unemployment Rate', desc: '<strong>What:</strong> Percentage of the labour force without work and actively looking.<br/><br/><strong>Bullish USD:</strong> Lower than forecast = tight labour market = wage pressure = hawkish.<br/><strong>Bearish USD:</strong> Higher than forecast = labour market loosening = dovish.<br/><br/><strong>The threshold:</strong> The Fed has an implicit \u201cpain threshold\u201d \u2014 when unemployment rises above ~4.0-4.2%, they shift from fighting inflation to protecting employment. Crossing this line is a regime change signal.' },
  { title: '\ud83d\udcb0 Average Hourly Earnings (Wages)', desc: '<strong>What:</strong> Month-over-month change in average worker pay.<br/><br/><strong>Why it\u2019s the MOST important number:</strong> Wages feed directly into inflation. Higher wages = higher spending = higher prices = higher inflation. The Fed can tolerate strong jobs. They CANNOT tolerate runaway wages.<br/><br/><strong>The sleeper:</strong> Many traders skip straight to jobs. Pros read wages first. A jobs miss with hot wages is HAWKISH. A jobs beat with weak wages is less hawkish than it looks. <strong>Wages > Jobs > Unemployment</strong> for market impact in the current cycle.' },
];

const goodNewsBadNews = [
  { scenario: 'Strong jobs + strong wages', reaction: 'USD BULLISH', why: 'Economy booming + inflation pressure = Fed stays hawkish or hikes more. Clear directional signal.', color: '#26A69A' },
  { scenario: 'Strong jobs + weak wages', reaction: 'MIXED / MILDLY USD', why: 'Economy strong but no inflation fuel. Fed can be patient. Market indecisive. Often choppy.', color: '#FFB300' },
  { scenario: 'Weak jobs + strong wages', reaction: 'MIXED (leans USD)', why: 'STAGFLATION signal \u2014 economy slowing but inflation rising. Fed\u2019s worst nightmare. Uncertainty dominates.', color: '#FFB300' },
  { scenario: 'Weak jobs + weak wages', reaction: 'USD BEARISH', why: 'Economy AND inflation cooling. Rate cuts coming. Clear directional signal.', color: '#EF5350' },
];

const commonMistakes = [
  { title: 'Only Reading the Jobs Number', mistake: 'You see +300K and go long USD. But unemployment ticked up and wages missed. The market reverses within 10 minutes.', fix: 'Read ALL THREE numbers. Jobs, unemployment, AND wages. The combination determines the reaction, not any single number.' },
  { title: 'Entering in the First 60 Seconds', mistake: 'Gold drops $15 at 13:30:01. You short at 13:30:45. At 13:32, it bounces $10. Your stop is hit. Then it drops $20 more without you.', fix: 'The 60-90 second fakeout is the most reliable pattern in NFP trading. Wait 15 minutes. Every. Single. Time.' },
  { title: 'Ignoring the Revision', mistake: 'This month: +250K (beat). But last month revised from +220K to +140K (\u221280K revision). Net: the economy added FEWER jobs than last month\u2019s headline suggested.', fix: 'Always check the revision. A +250K print with a \u221280K revision is really +170K net. The market sees this \u2014 and prices accordingly.' },
  { title: '"Good News Is Bad News" Confusion', mistake: 'Strong jobs report. Stocks FALL. You\u2019re confused. \u201cIsn\u2019t a strong economy good for stocks?\u201d', fix: 'In a hiking cycle: strong jobs = higher rates = lower stock valuations. Good economic news is bad for rate-sensitive assets. The relationship FLIPS depending on the monetary policy cycle.' },
];

const quizQuestions = [
  { q: 'NFP: +350K (forecast +180K). Unemployment: 3.5% (forecast 3.7%). Wages: +0.5% (forecast +0.3%). All three beat. The reaction:', opts: ['Unclear \u2014 too much data to parse', 'Strongly USD bullish \u2014 all three beating forecast is unambiguously hawkish', 'USD bearish \u2014 too many jobs means a bubble', 'No reaction \u2014 it was expected'], correct: 1, explain: 'When all three components beat forecast simultaneously, the signal is unambiguous. Strong economy + tight labour + wage pressure = the Fed has zero reason to cut. USD surges. Gold drops. Equities fall on higher-for-longer rates.' },
  { q: 'NFP: +250K (beat). But previous month revised from +220K to +140K. The market focuses on:', opts: ['The +250K beat \u2014 a beat is a beat', 'The net picture \u2014 after revision, the jobs market is weaker than last month\u2019s headline suggested', 'Only this month\u2019s number', 'The revision doesn\u2019t matter'], correct: 1, explain: 'The revision tells the market that last month\u2019s strength was overstated by 80K jobs. This month\u2019s beat is partially offset. Smart money reads the net \u2014 not just the headline.' },
  { q: 'In the current Fed hiking cycle, a very strong jobs report is:', opts: ['Bullish for stocks \u2014 strong economy', 'Bearish for stocks \u2014 strong jobs = Fed keeps rates higher = lower stock valuations', 'Neutral for stocks', 'Only affects bonds'], correct: 1, explain: '"Good news is bad news" in a hiking cycle. Strong economy means the Fed has no reason to cut rates. Higher rates compress stock valuations (especially growth/tech). The relationship flips when the Fed pivots to cutting.' },
  { q: 'Which of the three NFP components does the Fed fear MOST in an inflationary environment?', opts: ['Jobs added \u2014 more jobs means more spending', 'Unemployment rate \u2014 lower means tighter market', 'Average hourly earnings (wages) \u2014 wages feed directly into inflation through consumer spending', 'All equal'], correct: 2, explain: 'Wages are the direct inflation fuel. Higher wages = higher disposable income = higher spending = higher prices. The Fed can tolerate strong job creation. They cannot tolerate a wage-price spiral.' },
  { q: 'NFP at 13:30. EUR/USD spikes DOWN 45 pips, then at 13:32 bounces UP 30 pips. At 13:35 it starts falling again. The pattern is:', opts: ['Random volatility', 'The classic NFP fakeout: algo spike \u2192 partial reversal \u2192 real direction resumes. The 15-minute rule exists for this.', 'The second move was correct', 'Broker manipulation'], correct: 1, explain: 'This is the most common NFP pattern. Algos fire on the headline (spike down). Then profit-taking and contra-side liquidity cause a partial reversal. Then real institutional flow establishes the actual direction. The 15-minute rule prevents you from being caught in the middle.' },
  { q: 'Jobs: +150K (miss). Wages: +0.5% (big beat). USD initially drops, then reverses higher. Why?', opts: ['Random', 'Algos read jobs first (miss = USD weak). Humans then parse wages (hot = inflation = hawkish). Wages override jobs in the current inflation-focused environment.', 'The unemployment rate caused it', 'A separate news event'], correct: 1, explain: 'Algorithms process the headline jobs number in milliseconds (miss = sell USD). But wages are the Fed\u2019s primary concern. Hot wages override weak jobs because wage inflation is what drives Fed policy. The reversal is the real trade.' },
  { q: 'It\u2019s NFP Friday. You have an open XAUUSD short at +1.5R from Wednesday. It\u2019s 12:55 UTC. Best action:', opts: ['Hold \u2014 you\u2019re in good profit', 'Close at +1.5R. NFP can move Gold $15-25 in seconds. A surprise dovish print could wipe your entire profit.', 'Tighten stop to +0.5R', 'Add to the short before NFP'], correct: 1, explain: '+1.5R is real money in your account. NFP is the most volatile scheduled event for Gold. Even with correct bias, spread widening and whipsaw risk mean your +1.5R can become \u22121R in seconds. Lock the profit. Re-enter after the settle.' },
  { q: 'ADP Private Payrolls (Wednesday) showed +320K. NFP is Friday. You should:', opts: ['Go long USD Thursday night \u2014 ADP predicts NFP', 'ADP has low correlation with NFP \u2014 prepare for the possibility of strong NFP but don\u2019t position on ADP alone', 'ADP makes NFP irrelevant', 'Ignore both'], correct: 1, explain: 'ADP and NFP have a correlation of only ~0.3-0.4. ADP can show +320K while NFP prints +120K. ADP provides a directional HINT, not a prediction. Use it to inform your risk plan, not your position.' },
];

const gameRounds = [
  { scenario: '<strong>NFP just released at 13:30 UTC.</strong> Jobs: +340K (forecast +180K). Unemployment: 3.5% (forecast 3.7%). Wages: +0.5% (forecast +0.3%). ALL three beat massively. EUR/USD drops 65 pips instantly. It\u2019s 13:31.', options: [
    { text: 'Short EUR/USD now \u2014 the data is as clear as it gets.', correct: false, explain: '\u2717 The data IS clear, but at T+1 minute: spreads are 6-8x normal, the 68% reversal pattern hasn\u2019t played out yet, and your fill will be the worst price of the day. Wait.' },
    { text: 'Wait until 13:45. If EUR/USD is still in a downtrend with normalised spreads, enter short with a structure-based stop.', correct: true, explain: '\u2713 All three beating forecast is the clearest signal possible. But execution timing is everything. At 13:45: spreads normal, direction confirmed, fakeout completed. Your entry is 20 pips worse but your survival rate is 300% better.' },
    { text: 'Buy EUR/USD \u2014 it\u2019s oversold after 65 pips.', correct: false, explain: '\u2717 Fighting a triple-beat NFP is financial suicide. This isn\u2019t oversold \u2014 it\u2019s repricing. The move can extend another 40-80 pips over the next hour.' },
  ]},
  { scenario: '<strong>NFP data:</strong> Jobs: +250K (beat). Wages: +0.1% (miss). Unemployment: 3.7% (in-line). EUR/USD spikes down 25 pips on the jobs beat, then bounces to flat within 3 minutes. Market is choppy.', options: [
    { text: 'Short EUR/USD \u2014 jobs beat is clear.', correct: false, explain: '\u2717 Jobs beat but wages missed significantly. This is the MIXED scenario. The market can\u2019t decide because the data is conflicting. The chop IS the answer \u2014 there\u2019s no clean trade here.' },
    { text: 'No trade. Strong jobs + weak wages = conflicting signals. The chop after 3 minutes confirms there\u2019s no consensus. Wait for next week\u2019s data.', correct: true, explain: '\u2713 This is the hardest NFP decision: doing nothing. Conflicting data = conflicting flows = whipsaw. Historical WR on mixed NFP is ~48% either direction. That\u2019s a coin flip. Sit out.' },
    { text: 'Long EUR/USD \u2014 wages miss is dovish, should weaken USD.', correct: false, explain: '\u2717 You\u2019re cherry-picking the dovish number and ignoring the hawkish one. The market is processing BOTH \u2014 hence the chop. Don\u2019t pick a side when the data doesn\u2019t.' },
  ]},
  { scenario: '<strong>Wednesday ADP: +310K</strong> (strong). <strong>Thursday Jobless Claims: +245K</strong> (above expectations \u2014 rising). <strong>It\u2019s now Thursday evening.</strong> NFP is tomorrow. Your EUR/USD position is flat.', options: [
    { text: 'Go short EUR/USD tonight \u2014 ADP was strong, NFP will be too.', correct: false, explain: '\u2717 ADP-to-NFP correlation is only 0.3-0.4. And rising jobless claims contradict ADP\u2019s strength. These mixed pre-signals mean you have NO edge positioning before the data.' },
    { text: 'Stay flat. ADP and Claims are conflicting. Position AFTER NFP data, not before. Use the signals to inform your risk plan: be prepared for anything.', correct: true, explain: '\u2713 ADP says strong, Claims say weakening. Conflicting pre-signals = stay flat. Let the actual NFP data resolve the conflict. Position after T+15, not the night before on speculation.' },
    { text: 'Go long EUR/USD \u2014 rising claims signals weakening, NFP will miss.', correct: false, explain: '\u2717 Same mistake, opposite direction. Claims provide a HINT, not a guarantee. And ADP contradicts it. Don\u2019t gamble on conflicting signals.' },
  ]},
  { scenario: '<strong>NFP: +120K (miss). Unemployment: 4.1% (above forecast 3.8%). Wages: +0.1% (miss).</strong> All three missed. The market has been pricing 2 cuts this year. It\u2019s 13:45 \u2014 15 minutes after release. EUR/USD has risen 70 pips and Gold is up $18.', options: [
    { text: 'Long EUR/USD and Gold \u2014 clear USD weakness, the moves have room to run.', correct: true, explain: '\u2713 Triple miss with unemployment crossing 4.0% is a potential regime change signal. At T+15, direction is confirmed, spreads normalised. The market will reprice from 2 cuts to 3-4. This is a multi-session move, not just an intraday pop.' },
    { text: 'Fade the move \u2014 70 pips is overextended.', correct: false, explain: '\u2717 Triple misses with unemployment crossing the Fed\u2019s pain threshold don\u2019t mean-revert quickly. This is fundamental repricing. The move can extend for days as rate expectations shift.' },
    { text: 'Wait for Monday \u2014 let it settle over the weekend.', correct: false, explain: '\u2717 By Monday, the bulk of the repricing is done. Friday afternoon and the following Asian/London sessions are where the continuation happens. Weekend gaps rarely add to your advantage here.' },
  ]},
  { scenario: '<strong>It\u2019s 13:30.</strong> NFP: +180K (forecast +180K). Unemployment: 3.7% (forecast 3.7%). Wages: +0.3% (forecast +0.3%). PERFECTLY in-line. All three match. EUR/USD moves 8 pips down, then 5 pips up. Flat.', options: [
    { text: 'No trade. In-line NFP = no new information = no catalyst. Save your capital for a day when the data actually surprises.', correct: true, explain: '\u2713 Perfect. When all three components match forecast exactly, the market has nothing to reprice. The 8-pip wiggle is noise. Your edge is in deviation \u2014 and today there is none.' },
    { text: 'Short EUR/USD \u2014 steady jobs = Fed stays hawkish.', correct: false, explain: '\u2717 The market already priced in steady jobs. An in-line print doesn\u2019t change expectations. You\u2019d be entering a trade with no catalyst and paying the spread for nothing.' },
    { text: 'Long EUR/USD \u2014 no surprise means relief, should bounce.', correct: false, explain: '\u2717 \u201cRelief rally\u201d on in-line data is a myth. In-line = flat. There\u2019s no pent-up pressure being released when the data matches expectations exactly.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function EmploymentDataPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // NFP Decision Framework
  const [nfpIdx, setNfpIdx] = useState(0);
  const [nfpRevealed, setNfpRevealed] = useState(false);
  const nfpSc = nfpFramework[nfpIdx];

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

  const verdictColors: Record<string, string> = { strong_usd: '#26A69A', mild_usd: '#26A69A', neutral: '#FFB300', mild_usd_weak: '#EF5350', strong_usd_weak: '#EF5350' };

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 5</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Employment Data<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>NFP &amp; Jobs</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The first Friday of every month. The most volatile scheduled event in forex. Three numbers that rewrite rate expectations in seconds.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\ud83c\udfdf\ufe0f Super Bowl Friday</p>
            <p className="text-gray-400 leading-relaxed mb-4">In American football, the Super Bowl is one day that determines the champion. In forex, <strong className="text-amber-400">NFP Friday</strong> is the monthly Super Bowl. Every participant prepares for it. Every institution positions around it. The entire month\u2019s volatility compresses into <strong className="text-white">90 seconds</strong>.</p>
            <p className="text-gray-400 leading-relaxed">But here\u2019s the twist: it\u2019s not one number. It\u2019s <strong className="text-white">three numbers released simultaneously</strong>. And when they conflict \u2014 strong jobs but weak wages \u2014 the market fights itself. That\u2019s when accounts blow up.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">NFP Feb 2024: +353K vs +180K forecast. <strong className="text-red-400">Wages: +0.6% vs +0.3%.</strong> All three beat. EUR/USD dropped <strong className="text-red-400">105 pips in 25 minutes</strong>. Gold fell <strong className="text-red-400">$32</strong>. NASDAQ shed <strong className="text-red-400">1.2%</strong>. Three rate cut expectations evaporated in one release. Traders who were flat: <strong className="text-green-400">unaffected</strong>. Traders who entered after 15 mins in the right direction: <strong className="text-green-400">+2R by market close</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The 3 Numbers</p><h2 className="text-2xl font-extrabold mb-4">Jobs, Unemployment, Wages</h2><p className="text-gray-400 text-sm mb-6">Three numbers released at the same time. The combination determines the reaction.</p><NFPTrifectaAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The NFP Pattern</p><h2 className="text-2xl font-extrabold mb-4">Compression \u2192 Spike \u2192 Fakeout \u2192 Real Direction</h2><p className="text-gray-400 text-sm mb-6">The most predictable price action pattern in forex. The initial spike reverses 68% of the time.</p><NFPPriceReplayAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Trifecta Deep Dive</p><h2 className="text-2xl font-extrabold mb-4">What Each Number Really Tells You</h2><div className="space-y-3">{trifectaDeep.map((item, i) => (<div key={i}><button onClick={() => toggle(`td-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`td-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`td-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Good News = Bad News?</p><h2 className="text-2xl font-extrabold mb-4">The Jobs-Wages Matrix</h2><div className="p-6 rounded-2xl glass-card space-y-3">{goodNewsBadNews.map(item => (<div key={item.scenario} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-xs font-bold text-gray-300">{item.scenario}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.reaction}</span></div><p className="text-[11px] text-gray-500">{item.why}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: NFP Decision Framework */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">NFP Decision Framework</h2><p className="text-gray-400 text-sm mb-6">5 NFP scenarios. Review the data, predict the outcome, then reveal the framework\u2019s analysis.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center gap-1.5">{nfpFramework.map((_, i) => (<button key={i} onClick={() => { setNfpIdx(i); setNfpRevealed(false); }} className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${nfpIdx === i ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-500'}`}>{i + 1}</button>))}</div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-2">NFP RELEASE #{nfpSc.id}</p><p className="text-[10px] text-gray-500 mb-3">{nfpSc.context}</p>
          <div className="grid grid-cols-3 gap-2"><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">JOBS</p><p className="text-sm font-bold text-white">{nfpSc.jobs}</p><p className="text-[9px] text-gray-600">F: {nfpSc.jobsForecast}</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">UNEMPLOYMENT</p><p className="text-sm font-bold text-white">{nfpSc.unemployment}</p><p className="text-[9px] text-gray-600">F: {nfpSc.unempForecast}</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">WAGES (MoM)</p><p className="text-sm font-bold text-white">{nfpSc.wages}</p><p className="text-[9px] text-gray-600">F: {nfpSc.wagesForecast}</p></div></div></div>
        {!nfpRevealed ? (<button onClick={() => setNfpRevealed(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Reveal Framework Analysis &rarr;</button>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="p-4 rounded-xl border" style={{ background: verdictColors[nfpSc.verdict] + '10', borderColor: verdictColors[nfpSc.verdict] + '30' }}><p className="text-xs font-bold" style={{ color: verdictColors[nfpSc.verdict] }}>{nfpSc.usdDirection}</p><p className="text-[10px] text-gray-400 mt-1">Confidence: {nfpSc.confidence}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-green-400 mb-1">RECOMMENDED ACTION</p><p className="text-xs text-gray-400">{nfpSc.action}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">HISTORICAL WIN RATE</p><p className="text-xs text-gray-400">{nfpSc.historicalWR}</p></div>
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-[10px] font-bold text-red-400 mb-1">\u26a0 THE TRAP</p><p className="text-xs text-gray-400">{nfpSc.trap}</p></div>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Hierarchy</p><h2 className="text-2xl font-extrabold mb-4">Wages &gt; Jobs &gt; Unemployment</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">#1 WAGES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Direct inflation fuel. The Fed\u2019s primary concern. Hot wages override everything else in the current cycle.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">#2 JOBS ADDED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Economic strength indicator. The headline number. Check the REVISION too \u2014 it can change the entire story.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">#3 UNEMPLOYMENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Lagging indicator. Matters when it crosses thresholds (4.0%, 4.5%). Otherwise less impactful month-to-month.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">THE REVISION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Last month\u2019s number revised. Often \u00b150K. A beat with a \u221280K revision nets weaker than headline suggests.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When all 3 align: high conviction trade. When they conflict: NO TRADE. Never force a direction on mixed data.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Pre-Indicators</p><h2 className="text-2xl font-extrabold mb-4">What Comes Before NFP</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">ADP (Wednesday)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Private payrolls. Correlation with NFP: ~0.3-0.4. Directional HINT, not prediction. Don\u2019t position on ADP alone.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">JOBLESS CLAIMS (Thursday)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Weekly pulse. Rising claims = weakening labour. But weekly data is noisy \u2014 look at the 4-week average.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">ISM EMPLOYMENT (earlier in week)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Survey-based. Above 50 = expansion. Historically one of the better NFP predictors.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Pre-indicators inform risk planning, NOT positioning. Use them to set expectations, not trades.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 NFP Errors That Destroy Accounts</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">NFP Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE TRIFECTA</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Jobs + Unemployment + Wages. All 3 align = high conviction. Conflict = no trade.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">WAGES FIRST</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Wages &gt; Jobs &gt; Unemployment in the current cycle. Hot wages override weak jobs.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">15-MINUTE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Initial spike reverses 68%. Wait for T+15. Every. Single. Time. No exceptions.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">CHECK THE REVISION</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Last month\u2019s number often revised \u00b150K. A beat + negative revision = weaker than headline.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">First Friday of every month, 13:30 UTC. Be flat 30 min before. Re-enter 15 min after. This is non-negotiable.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">NFP Trading Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Navigate the most volatile day in forex.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you can navigate NFP Fridays with confidence.' : gameScore >= 3 ? 'Good \u2014 review the mixed-signal scenario and the ADP correlation.' : 'Re-read the trifecta hierarchy and the 15-minute rule before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\ud83d\udcc8</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Employment Data (NFP &amp; Jobs)</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Employment Decoder &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
