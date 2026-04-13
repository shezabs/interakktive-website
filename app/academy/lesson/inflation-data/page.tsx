// app/academy/lesson/inflation-data/page.tsx
// ATLAS Academy — Lesson 8.4: Inflation Data (CPI & PPI) [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: CPI Reaction Simulator — predict market reactions to mock CPI releases
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
// ANIMATION 1: CPI Components — weighted pie/bar breakdown
// ============================================================
function CPIComponentsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('What CPI Actually Measures \u2014 Component Weights', cx, 16);
    const components = [
      { name: 'Housing/Shelter', weight: 34.4, color: '#EF5350', sticky: true },
      { name: 'Food', weight: 13.5, color: '#FFB300', sticky: false },
      { name: 'Energy', weight: 6.9, color: '#f59e0b', sticky: false },
      { name: 'Transport', weight: 15.2, color: '#3b82f6', sticky: false },
      { name: 'Medical', weight: 8.5, color: '#8b5cf6', sticky: true },
      { name: 'Education/Comms', weight: 5.8, color: '#26A69A', sticky: false },
      { name: 'Recreation', weight: 5.6, color: '#ec4899', sticky: false },
      { name: 'Other', weight: 10.1, color: '#6b7280', sticky: false },
    ];
    const barTop = 35; const barBot = h - 50; const barH = barBot - barTop; const pad = 25; const barAreaW = w - pad * 2;
    const progress = Math.min(1, (t % 8) / 5);
    const activeIdx = Math.floor((t % 24) / 3) % 8;
    let cumX = pad;
    components.forEach((comp, i) => {
      const cw = (comp.weight / 100) * barAreaW; const revealed = progress > i * 0.1;
      if (revealed) {
        const isActive = i === activeIdx;
        const yOffset = isActive ? -4 : 0;
        ctx.fillStyle = isActive ? comp.color + '40' : comp.color + '20';
        ctx.fillRect(cumX, barTop + yOffset, cw - 1, barH - yOffset);
        ctx.strokeStyle = isActive ? comp.color + '80' : comp.color + '30';
        ctx.lineWidth = isActive ? 1.5 : 0.5;
        ctx.strokeRect(cumX, barTop + yOffset, cw - 1, barH - yOffset);
        if (isActive || cw > 40) {
          ctx.fillStyle = isActive ? comp.color : 'rgba(255,255,255,0.3)';
          ctx.font = `${isActive ? 'bold 8' : '7'}px system-ui`;
          ctx.textAlign = 'center';
          ctx.save(); ctx.translate(cumX + cw / 2, barTop + barH / 2);
          if (cw < 50) ctx.rotate(-Math.PI / 2);
          ctx.fillText(comp.name, 0, -6);
          ctx.fillText(`${comp.weight}%`, 0, 6);
          if (isActive && comp.sticky) { ctx.fillStyle = '#EF535080'; ctx.font = 'bold 6px system-ui'; ctx.fillText('STICKY', 0, 16); }
          ctx.restore();
        }
      }
      cumX += cw;
    });
    // Core vs Headline legend
    ctx.textAlign = 'center'; ctx.font = '8px system-ui';
    ctx.fillStyle = '#FFB300'; ctx.fillText('HEADLINE = Everything', cx - 80, h - 20);
    ctx.fillStyle = '#26A69A'; ctx.fillText('CORE = Excludes Food + Energy', cx + 80, h - 20);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui';
    ctx.fillText('Core is what the Fed watches \u2014 food & energy are too volatile to signal trends', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Inflation → Rates → Currency cascade chain
// ============================================================
function InflationCascadeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const cx = w / 2;
    const isHot = Math.floor(t / 8) % 2 === 0;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(isHot ? 'HOT CPI \u2014 The Chain Reaction' : 'COLD CPI \u2014 The Chain Reaction', cx, 16);
    const chain = isHot ? [
      { label: 'CPI HOTTER\nTHAN EXPECTED', emoji: '\ud83d\udd25', color: '#EF5350' },
      { label: 'RATE HIKE\nEXPECTATIONS RISE', emoji: '\ud83d\udcc8', color: '#EF5350' },
      { label: 'USD\nSTRENGTHENS', emoji: '\ud83d\udcaa', color: '#26A69A' },
      { label: 'GOLD\nDROPS', emoji: '\u2b07\ufe0f', color: '#EF5350' },
      { label: 'EQUITIES\nFALL', emoji: '\ud83d\udcc9', color: '#EF5350' },
    ] : [
      { label: 'CPI COOLER\nTHAN EXPECTED', emoji: '\u2744\ufe0f', color: '#26A69A' },
      { label: 'RATE CUT\nEXPECTATIONS RISE', emoji: '\ud83d\udcc9', color: '#26A69A' },
      { label: 'USD\nWEAKENS', emoji: '\ud83d\udcc9', color: '#EF5350' },
      { label: 'GOLD\nRALLIES', emoji: '\u2b06\ufe0f', color: '#26A69A' },
      { label: 'EQUITIES\nSURGE', emoji: '\ud83d\ude80', color: '#26A69A' },
    ];
    const progress = Math.min(1, (t % 8) / 5);
    const activeCount = Math.floor(progress * 6);
    const nodeW = 70; const gap = (w - 40 - nodeW * 5) / 4; const startX = 20 + nodeW / 2;
    const midY = h / 2 + 5;
    // Arrows
    for (let i = 0; i < 4; i++) {
      const x1 = startX + i * (nodeW + gap) + nodeW / 2 + 2; const x2 = startX + (i + 1) * (nodeW + gap) - nodeW / 2 - 2;
      const lit = activeCount > i + 1;
      ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(x2, midY);
      ctx.strokeStyle = lit ? chain[i].color + '60' : 'rgba(255,255,255,0.06)'; ctx.lineWidth = lit ? 2 : 0.5; ctx.stroke();
      if (lit) { ctx.beginPath(); ctx.moveTo(x2, midY); ctx.lineTo(x2 - 6, midY - 4); ctx.lineTo(x2 - 6, midY + 4); ctx.closePath(); ctx.fillStyle = chain[i + 1].color + '60'; ctx.fill(); }
    }
    // Nodes
    chain.forEach((node, i) => {
      const x = startX + i * (nodeW + gap); const isActive = i < activeCount;
      const isCurrent = i === activeCount - 1; const pulse = isCurrent ? Math.sin(t * 4) * 2 : 0;
      ctx.fillStyle = isActive ? node.color + '10' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(x - nodeW / 2 - pulse, midY - 30 - pulse, nodeW + pulse * 2, 60 + pulse * 2, 8); ctx.fill();
      ctx.strokeStyle = isActive ? node.color + '50' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = isCurrent ? 1.5 : 0.5; ctx.beginPath(); ctx.roundRect(x - nodeW / 2, midY - 30, nodeW, 60, 8); ctx.stroke();
      ctx.textAlign = 'center';
      if (isActive) { ctx.fillStyle = node.color; ctx.font = 'bold 7px system-ui'; const lines = node.label.split('\n'); lines.forEach((l, li) => ctx.fillText(l, x, midY - 6 + li * 11)); }
      else { ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '14px system-ui'; ctx.fillText(node.emoji, x, midY + 5); }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(isHot ? 'Hot inflation \u2192 higher rates expected \u2192 USD up, Gold down, stocks down' : 'Cool inflation \u2192 rate cuts expected \u2192 USD down, Gold up, stocks up', cx, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// CPI REACTION SIMULATOR DATA
// ============================================================
interface CPIScenario { id: number; headline: string; core: string; forecast: string; deviation: string; deviationType: 'hot' | 'cold' | 'inline'; context: string; correctUSD: 'up' | 'down' | 'flat'; correctGold: 'up' | 'down' | 'flat'; correctSP: 'up' | 'down' | 'flat'; explanation: string; }
const cpiScenarios: CPIScenario[] = [
  { id: 1, headline: '3.8%', core: '3.9%', forecast: '3.2% / 3.3%', deviation: '+0.6% / +0.6%', deviationType: 'hot', context: 'Fed has been signalling patience. Market pricing 3 cuts this year.', correctUSD: 'up', correctGold: 'down', correctSP: 'down', explanation: 'Massive hot surprise. +0.6% deviation on both headline and core obliterates the 3-cut narrative. Rate expectations shift immediately from 3 cuts to maybe 1. USD surges as yield differential widens. Gold drops on higher real yields. Equities fall on higher-for-longer rates.' },
  { id: 2, headline: '3.1%', core: '3.2%', forecast: '3.2% / 3.3%', deviation: '-0.1% / -0.1%', deviationType: 'cold', context: 'Fed just said \u201cprogress toward 2%.\u201d Market pricing 2 cuts.', correctUSD: 'down', correctGold: 'up', correctSP: 'up', explanation: 'Mild cool surprise. -0.1% deviation confirms the Fed\u2019s "progress" language. Market shifts from 2 cuts to potentially 3. USD weakens as rate expectations fall. Gold rallies on lower real yields. Equities rise as lower rates boost valuations.' },
  { id: 3, headline: '3.2%', core: '3.3%', forecast: '3.2% / 3.3%', deviation: '0.0% / 0.0%', deviationType: 'inline', context: 'Market calm. No major events this week. Consensus stable.', correctUSD: 'flat', correctGold: 'flat', correctSP: 'flat', explanation: 'Perfectly in-line. No new information. The market already positioned for this exact outcome. Expect 5-15 pip moves at most. The real trade today is NOT this release \u2014 it\u2019s whatever happens next (Fed speakers, other data).' },
  { id: 4, headline: '2.9%', core: '3.4%', forecast: '3.0% / 3.2%', deviation: '-0.1% / +0.2%', deviationType: 'hot', context: 'Headline energy drop. Core services still rising. Mixed signals.', correctUSD: 'up', correctGold: 'down', correctSP: 'down', explanation: 'TRAP scenario. Headline looks cool (-0.1%) but CORE is hot (+0.2%). The Fed watches CORE, not headline. Cheap oil pulled headline down but services inflation accelerated. Market whipsaws initially then settles on the core reading \u2014 hawkish. This is why you wait 15 minutes.' },
  { id: 5, headline: '2.4%', core: '2.6%', forecast: '2.8% / 3.0%', deviation: '-0.4% / -0.4%', deviationType: 'cold', context: 'Following hot PPI yesterday. Market braced for hot CPI.', correctUSD: 'down', correctGold: 'up', correctSP: 'up', explanation: 'Shock cold surprise \u2014 especially after hot PPI. The market had REPOSITIONED for hot CPI based on yesterday\u2019s PPI. The cold print catches shorts off-guard. USD drops violently. Gold surges. Equities rally hard. This is a multi-day move, not just an intraday spike.' },
];

// ============================================================
// CONTENT DATA
// ============================================================
const coreVsHeadline = [
  { title: '\ud83d\udcca Headline CPI', desc: '<strong>Includes EVERYTHING:</strong> Housing, food, energy, transport, medical, recreation, education, apparel.<br/><br/><strong>Why it matters:</strong> This is what consumers actually pay. It\u2019s the politically visible number. Media reports headline CPI.<br/><br/><strong>The problem:</strong> Energy and food prices swing wildly month-to-month. Oil drops 20%? Headline CPI plummets \u2014 but NOTHING in the underlying economy changed. It\u2019s noise disguised as a signal.' },
  { title: '\ud83c\udfaf Core CPI (ex-Food & Energy)', desc: '<strong>Strips out food and energy</strong> \u2014 the two most volatile components.<br/><br/><strong>Why the Fed watches Core:</strong> Core reveals the TREND. If core is rising, the underlying inflation problem is real. If core is falling, genuine progress is being made.<br/><br/><strong>The trading key:</strong> When headline and core diverge, <strong>CORE wins</strong>. Hot headline + cool core = temporary. Cool headline + hot core = the Fed sees a problem. Always check both, always trade core.' },
  { title: '\ud83d\udee2\ufe0f PPI: The Leading Indicator', desc: '<strong>Producer Price Index</strong> measures what FACTORIES and PRODUCERS pay for inputs.<br/><br/><strong>Why it matters for CPI:</strong> Producer costs flow through to consumer prices with a 1-3 month lag. Hot PPI today often means hot CPI next month.<br/><br/><strong>The trading edge:</strong> PPI releases 1-2 days before CPI. A hot PPI pre-loads the market for hot CPI \u2014 if CPI then comes in cool, the surprise is BIGGER because everyone had repositioned. This is the PPI\u2192CPI link from Lesson 8.2.' },
  { title: '\ud83d\udccd Sticky vs Flexible Components', desc: '<strong>Sticky:</strong> Housing/shelter (34.4%), medical care (8.5%), education. These move slowly and are hard to reverse. When sticky inflation is rising, the Fed worries most.<br/><br/><strong>Flexible:</strong> Energy, food, used cars, airfares. These swing fast and self-correct.<br/><br/><strong>Why it matters:</strong> A CPI print driven by flexible components (oil spike) is temporary. A CPI print driven by sticky components (rent acceleration) is structural and MUCH harder to fix. The Fed will stay aggressive longer when sticky inflation is the driver.' },
];

const reactionTimeline = [
  { time: 'T-30 min', what: 'Pre-positioning. Volatility compresses. Spreads start widening.', action: 'Be flat or have very wide stops.', color: '#FFB300' },
  { time: 'T-0 (Release)', what: 'Number drops. 50-150 pip spike in 5 seconds. Algos fire first.', action: 'DO NOT TRADE. Initial spike reverses 60-70% of the time.', color: '#EF5350' },
  { time: 'T+2 min', what: 'Core vs headline parsed. Market digests. Often a partial reversal.', action: 'STILL WAIT. This is the whipsaw zone.', color: '#EF5350' },
  { time: 'T+15 min', what: 'Direction establishing. Spreads normalising. Real flows visible.', action: 'NOW assess. If deviation is clear, this is your entry window.', color: '#26A69A' },
  { time: 'T+60 min', what: 'Full digestion. Any reversal has played out. Trend move continues.', action: 'Normal trading resumes. New structure formed. New bias established.', color: '#26A69A' },
];

const commonMistakes = [
  { title: 'Trading the Headline, Ignoring Core', mistake: 'Headline CPI drops from 3.5% to 3.1%. You go long EUR/USD. Then you see core ROSE from 3.3% to 3.5%. The Fed doesn\u2019t care about cheap oil.', fix: 'Always check BOTH numbers. When they diverge, core wins. The first 2 minutes of price action may trade headline \u2014 the next 58 minutes trade core.' },
  { title: 'Entering on the Spike', mistake: 'CPI drops. Gold spikes $18 in 3 seconds. You buy. Spread is 15 pips. Gold reverses $12 in the next 90 seconds. You\u2019re underwater before you blinked.', fix: 'The initial spike is for algorithms. You are not an algorithm. Wait 15 minutes. The real direction emerges. Your entry will be worse by 20% but your survival rate is 300% better.' },
  { title: 'Ignoring the PPI Signal', mistake: 'PPI came in hot yesterday. You don\u2019t adjust your plan. CPI is hot today. You\u2019re caught in a position because \u201cI didn\u2019t expect it.\u201d', fix: 'PPI is CPI\u2019s advance scout. Hot PPI = prepare for hot CPI. Reduce risk the day before CPI when PPI has already surprised.' },
  { title: 'Treating All CPI Prints Equally', mistake: 'CPI +0.1% above forecast. You trade it like a CPI +0.6% above forecast. The magnitude of deviation determines the magnitude of reaction.', fix: '\u00b10.1% = mild, trade small after settle. \u00b10.3%+ = significant, larger move. \u00b10.5%+ = shock, potential multi-day trend.' },
];

const quizQuestions = [
  { q: 'Headline CPI: 2.9% (forecast 3.0%). Core CPI: 3.5% (forecast 3.2%). The Fed will likely focus on:', opts: ['Headline \u2014 it\u2019s below forecast, inflation is cooling', 'Core \u2014 +0.3% above forecast shows underlying inflation is accelerating', 'Neither \u2014 they only care about PCE', 'Headline because it\u2019s what consumers see'], correct: 1, explain: 'The Fed focuses on Core because food and energy are too volatile. A +0.3% core overshoot with housing and services still hot means the inflation fight is NOT over, regardless of what headline says.' },
  { q: 'PPI releases Tuesday: +0.5% above forecast. CPI releases Wednesday. You should:', opts: ['Trade normally Wednesday \u2014 PPI and CPI are different', 'Expect higher CPI probability and reduce Wednesday risk accordingly', 'Go long USD Tuesday night', 'Ignore PPI \u2014 only CPI matters'], correct: 1, explain: 'PPI is a leading indicator for CPI. Hot PPI significantly raises the probability of hot CPI. Reduce your Wednesday morning risk and be flat well before 13:30 UTC.' },
  { q: 'CPI releases at 13:30. At 13:31, EUR/USD drops 55 pips. At 13:33, it bounces 30 pips back. This reversal happens because:', opts: ['The data was wrong', 'Initial algo spike trades headline, then humans parse core vs headline \u2014 the correction reflects the more nuanced reading', 'Random noise', 'Liquidity providers adjusting'], correct: 1, explain: 'Algorithms react to the headline number in milliseconds. Humans then analyse core vs headline, sticky vs flexible, and the broader context. The 2-3 minute correction is the market\u2019s \u201csecond read.\u201d This is why you wait 15 minutes.' },
  { q: 'Shelter/housing is 34.4% of CPI and is \u201csticky.\u201d This means:', opts: ['It doesn\u2019t matter \u2014 the Fed can\u2019t control rent', 'If shelter inflation is rising, CPI will be structurally elevated for months regardless of other components', 'Housing always goes up', 'Only housing matters'], correct: 1, explain: 'Shelter is the largest CPI component AND the stickiest. Rents are set on 12-month leases \u2014 even if new rent slows, the CPI measure lags by 6-12 months. Rising shelter = elevated CPI for quarters, not weeks.' },
  { q: 'A \u201chot\u201d CPI print means:', opts: ['CPI went up', 'CPI came in HIGHER than the consensus forecast \u2014 the deviation is positive', 'CPI is above 3%', 'CPI is the highest ever recorded'], correct: 1, explain: '"Hot" is relative to forecast, not absolute level. CPI at 2.5% when forecast was 2.2% is hotter than CPI at 4.0% when forecast was 4.1%. It\u2019s always about the SURPRISE.' },
  { q: 'You correctly predict CPI will be hot. The best time to enter a USD long is:', opts: ['30 seconds after release \u2014 ride the spike', '15 minutes after release \u2014 direction confirmed, spreads normalised', '1 hour before \u2014 front-run the data', 'The day before based on PPI'], correct: 1, explain: 'Even with a correct prediction, the initial spike has spread widening (5-10x) and whipsaw risk. At T+15 minutes, spreads normalise, direction is confirmed, and your R:R is dramatically better. Patience pays.' },
  { q: 'Core CPI has been 3.3%, 3.4%, 3.5% for the last 3 months (rising). This month: 3.2%. Your reaction:', opts: ['Inflation is solved \u2014 go dovish', 'One month doesn\u2019t reverse a trend \u2014 the Fed needs 3+ months of declining core to shift policy', 'It doesn\u2019t matter \u2014 one reading is noise', 'Immediately price in rate cuts'], correct: 1, explain: 'One cool print after 3 hot prints is encouraging but not conclusive. The Fed explicitly says they need "several months" of declining data. This is a data point, not a trend change. Trade with reduced conviction \u2014 the NEXT month\u2019s print is critical.' },
  { q: 'CPI headline: 3.1% (forecast 3.2%). Core: 3.3% (forecast 3.3%). Headline is cool, core is in-line. Impact:', opts: ['Major USD weakness \u2014 headline missed', 'Minimal \u2014 headline deviation is tiny (-0.1%) and core is perfectly in-line. No new information.', 'Major USD strength \u2014 core held', 'Depends on PPI'], correct: 1, explain: '-0.1% headline deviation with in-line core is a non-event. No new information for the Fed to act on. Expect 5-15 pip moves at most. Save your trades for days when the deviation is meaningful.' },
];

const gameRounds = [
  { scenario: '<strong>CPI just released.</strong> Headline: 3.8% (forecast 3.2%). Core: 3.9% (forecast 3.3%). Both massively hot. You\u2019re currently flat. Gold drops $20 in the first minute.', options: [
    { text: 'Short Gold immediately \u2014 the data is clear.', correct: false, explain: '\u2717 Right direction but terrible timing. Spreads are 8-12x normal at T+1 minute. Your fill will be awful and Gold often bounces $5-8 before continuing lower. Wait.' },
    { text: 'Wait 15 minutes. At T+15, if Gold is still weak and spreads have normalised, enter short with a structure-based stop.', correct: true, explain: '\u2713 Correct. The data is unambiguously hawkish (+0.6% deviation on both). Direction is clear. But execution at T+1 is suicidal. T+15 gives you normalised spreads and confirmed direction.' },
    { text: 'Buy Gold on the dip \u2014 it\u2019s oversold after $20 drop.', correct: false, explain: '\u2717 Fighting the data. +0.6% core deviation is a multi-day move, not a dip to buy. Gold doesn\u2019t bounce to pre-CPI levels after a shock print.' },
  ]},
  { scenario: '<strong>PPI released yesterday:</strong> +0.4% above forecast (hot). <strong>CPI releases today at 13:30.</strong> You have a GBP/USD long from yesterday, currently +0.6R. It\u2019s 12:50 UTC.', options: [
    { text: 'Hold through CPI \u2014 PPI was hot so CPI probably hot, meaning USD strength, which is already in my position direction... wait, GBP/USD long means I need USD WEAKNESS.', correct: false, explain: '\u2717 You\u2019re long GBP/USD (short USD). Hot PPI suggests hot CPI = USD strength = BAD for your position. You\u2019re holding into a likely adverse event.' },
    { text: 'Close now at +0.6R. Hot PPI suggests hot CPI = USD strength = adverse for GBP/USD long. Lock in profit. Re-enter after CPI settles.', correct: true, explain: '\u2713 Correct. Hot PPI raises hot CPI probability. Hot CPI = USD strength = GBP/USD drops. Your +0.6R could become -1R in seconds. Lock it in. If CPI is cold (surprise), re-enter on the move.' },
    { text: 'Tighten stop to breakeven and hold.', correct: false, explain: '\u2717 CPI can gap through your BE stop with widened spreads. You might get filled at -0.5R instead of BE. Either close or accept the full risk. BE stops are unreliable during news.' },
  ]},
  { scenario: '<strong>CPI released.</strong> Headline: 2.9% (forecast 3.0%). Core: 3.5% (forecast 3.2%). Headline is slightly cool. Core is very hot. Market whipsaws \u2014 EUR/USD spikes up 25 pips then drops 40 pips. It\u2019s been 3 minutes.', options: [
    { text: 'Go long EUR/USD \u2014 headline missed, should be USD weakness.', correct: false, explain: '\u2717 The 25-pip spike UP was the headline algo reaction. The 40-pip reversal DOWN is the core read. Core at +0.3% above forecast is the real story. The Fed watches core.' },
    { text: 'Wait until T+15. The core reading (+0.3%) is significantly hot. If USD strength persists after the settle, look for EUR/USD shorts.', correct: true, explain: '\u2713 This is the headline vs core trap from the lesson. Initial algo trades headline (cool = USD weak = EUR/USD up). Humans then parse core (hot = USD strong = EUR/USD down). Direction reverses. Wait for the real direction to confirm.' },
    { text: 'No trade \u2014 mixed data means no edge.', correct: false, explain: '\u2717 The data isn\u2019t mixed once you understand the hierarchy. Core > Headline. +0.3% core deviation is a clear hawkish signal. The "mix" is only confusing if you weight headline equally.' },
  ]},
  { scenario: '<strong>Monthly trend:</strong> Core CPI has printed 3.3%, 3.4%, 3.5% for 3 consecutive months (rising). This month\u2019s release: 3.2%. Cool surprise. Market celebrates. Gold rallies $15. USD drops 45 pips.', options: [
    { text: 'Buy Gold aggressively \u2014 inflation trend is broken, rate cuts incoming.', correct: false, explain: '\u2717 One print doesn\u2019t reverse a 3-month trend. The Fed needs "several months" of progress. This is encouraging but not conclusive. Entering with full conviction on a single data point is premature.' },
    { text: 'Trade the initial move cautiously (reduced size). One cool print after 3 hot ones is hopeful but not conclusive \u2014 the NEXT month confirms or denies.', correct: true, explain: '\u2713 The cool print IS tradeable in the short term. Gold\u2019s rally is real. But size down because next month\u2019s CPI is now the most important data point. If it\u2019s hot again, this was a false dawn.' },
    { text: 'Fade the move \u2014 3 months hot means this cool print is an anomaly.', correct: false, explain: '\u2717 Fading a legitimate cool print with real deviation is fighting the data. The move is real for now. The question is whether it PERSISTS. Don\u2019t fade \u2014 just trade smaller.' },
  ]},
  { scenario: '<strong>Big picture shift.</strong> CPI has been falling for 6 months: 4.2% \u2192 3.8% \u2192 3.5% \u2192 3.2% \u2192 3.0% \u2192 2.7%. Market is pricing in 4 rate cuts. Today\u2019s CPI: 2.7% (forecast 2.7%). Perfectly in-line.', options: [
    { text: 'Big USD sell \u2014 inflation is clearly falling toward target.', correct: false, explain: '\u2717 The trend IS falling, but today\u2019s in-line print contains NO new information. The 4 cuts are ALREADY priced in. An in-line print doesn\u2019t add or remove conviction.' },
    { text: 'No trade on the release. In-line confirms the trend but provides no new trading catalyst. Focus on the next data point for potential deviation.', correct: true, explain: '\u2713 In-line = no surprise = no new information = no trade on the release. The downtrend in CPI is priced into 4 expected cuts. Only a deviation from forecast creates a tradeable move.' },
    { text: 'Go long USD \u2014 4 cuts is too aggressive, mean reversion.', correct: false, explain: '\u2717 Fighting the trend and the data without a catalyst. The market is pricing 4 cuts BECAUSE of 6 months of falling CPI. An in-line print doesn\u2019t change that thesis. You need a hot surprise to justify this trade.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function InflationDataPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // CPI Reaction Simulator
  const [simIdx, setSimIdx] = useState(0);
  const [simAnswers, setSimAnswers] = useState<Record<string, string>>({});
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simScore, setSimScore] = useState(0);
  const [simHistory, setSimHistory] = useState<number[]>([]);
  const [simComplete, setSimComplete] = useState(false);
  const sc = cpiScenarios[simIdx];
  const handleSimSubmit = () => { if (simSubmitted) return; setSimSubmitted(true); let pts = 0; if (simAnswers.usd === sc.correctUSD) pts++; if (simAnswers.gold === sc.correctGold) pts++; if (simAnswers.sp === sc.correctSP) pts++; setSimScore(s => s + pts); setSimHistory(h => [...h, pts]); };
  const nextSim = () => { if (simIdx < cpiScenarios.length - 1) { setSimIdx(i => i + 1); setSimAnswers({}); setSimSubmitted(false); } else { setSimComplete(true); } };

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

  const dirColors: Record<string, string> = { up: '#26A69A', down: '#EF5350', flat: '#6b7280' };

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Inflation Data<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>CPI &amp; PPI</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The number that rewrites rate expectations in seconds. Understand what it measures, why core matters more than headline, and how to trade the deviation.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">\ud83c\udf21\ufe0f The Market&rsquo;s Temperature Reading</p>
            <p className="text-gray-400 leading-relaxed mb-4">A doctor doesn&rsquo;t just check if you have a fever \u2014 they check <strong className="text-amber-400">which kind</strong>. A fever from a cold (temporary) is treated differently from a fever from an infection (structural). CPI works the same way. Headline CPI is the thermometer reading. <strong className="text-white">Core CPI tells you if the infection is getting worse or better.</strong></p>
            <p className="text-gray-400 leading-relaxed">The Fed doesn&rsquo;t treat a fever caused by an oil spike the same as one caused by rising rents. Neither should you.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">January 2024 CPI. Headline: 3.1% (forecast 2.9%). Core: 3.9% (forecast 3.7%). <strong className="text-red-400">Both hot.</strong> EUR/USD dropped 90 pips. Gold fell $28. NASDAQ shed 1.8%. <strong className="text-white">All in 20 minutes.</strong> One data release. Three months of rate cut hopes \u2014 evaporated. Traders who checked the calendar and flattened beforehand: <strong className="text-green-400">unaffected</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; What CPI Measures</p><h2 className="text-2xl font-extrabold mb-4">The Components and Their Weights</h2><p className="text-gray-400 text-sm mb-6">Not all inflation is equal. Housing alone is 34% of the index.</p><CPIComponentsAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Chain Reaction</p><h2 className="text-2xl font-extrabold mb-4">Hot CPI vs Cold CPI</h2><p className="text-gray-400 text-sm mb-6">Watch how the same data with opposite deviations cascades through markets.</p><InflationCascadeAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Core vs Headline vs PPI</p><h2 className="text-2xl font-extrabold mb-4">Know What the Fed Actually Watches</h2><div className="space-y-3">{coreVsHeadline.map((item, i) => (<div key={i}><button onClick={() => toggle(`cvh-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cvh-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cvh-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The CPI Reaction Timeline</p><h2 className="text-2xl font-extrabold mb-4">Minute-by-Minute After Release</h2><div className="p-6 rounded-2xl glass-card space-y-3">{reactionTimeline.map(item => (<div key={item.time} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.time}</p><p className="text-[11px] text-gray-400 mb-1">{item.what}</p><p className="text-[11px] font-semibold" style={{ color: item.color }}>{item.action}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: CPI Reaction Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">CPI Reaction Simulator</h2><p className="text-gray-400 text-sm mb-6">5 mock CPI releases. Predict the direction of USD, Gold, and S&P 500 for each. Scored against historical averages.</p>
      <div className="p-6 rounded-2xl glass-card">{!simComplete ? (<div className="space-y-4">
        <div className="flex items-center gap-1.5 mb-2">{cpiScenarios.map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < simIdx ? (simHistory[i] === 3 ? 'bg-green-500' : simHistory[i] >= 2 ? 'bg-amber-500' : 'bg-red-500') : i === simIdx ? 'bg-amber-400 scale-125' : 'bg-white/10'}`} />))}<span className="ml-2 text-xs text-gray-500">{simIdx + 1}/5</span></div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">CPI RELEASE #{sc.id}</p><p className="text-[10px] text-gray-500 mb-2">{sc.context}</p><div className="grid grid-cols-2 gap-2"><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">HEADLINE</p><p className="text-sm font-bold text-white">{sc.headline}</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">CORE</p><p className="text-sm font-bold text-white">{sc.core}</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">FORECAST (H/C)</p><p className="text-sm font-bold text-gray-300">{sc.forecast}</p></div><div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[9px] text-gray-500">DEVIATION</p><p className="text-sm font-bold" style={{ color: sc.deviationType === 'hot' ? '#EF5350' : sc.deviationType === 'cold' ? '#26A69A' : '#6b7280' }}>{sc.deviation}</p></div></div></div>
        {!simSubmitted ? (<div className="space-y-3">{[{ key: 'usd', label: 'USD Direction' }, { key: 'gold', label: 'Gold Direction' }, { key: 'sp', label: 'S&P 500 Direction' }].map(item => (<div key={item.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{item.label}</p><div className="grid grid-cols-3 gap-2">{(['up', 'flat', 'down'] as const).map(dir => (<button key={dir} onClick={() => setSimAnswers(p => ({ ...p, [item.key]: dir }))} className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase transition-all ${simAnswers[item.key] === dir ? 'border-2' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'}`} style={simAnswers[item.key] === dir ? { background: dirColors[dir] + '20', borderColor: dirColors[dir] + '50', color: dirColors[dir] } : {}}>{dir === 'up' ? '\u2191 Up' : dir === 'down' ? '\u2193 Down' : '\u2192 Flat'}</button>))}</div></div>))}
          {simAnswers.usd && simAnswers.gold && simAnswers.sp && (<button onClick={handleSimSubmit} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Submit Prediction &rarr;</button>)}
        </div>) : (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">{[{ key: 'usd', label: 'USD', correct: sc.correctUSD }, { key: 'gold', label: 'Gold', correct: sc.correctGold }, { key: 'sp', label: 'S&P', correct: sc.correctSP }].map(item => { const isCorrect = simAnswers[item.key] === item.correct; return (<div key={item.key} className={`p-3 rounded-xl text-center ${isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}><p className="text-[10px] text-gray-500">{item.label}</p><p className="text-xs font-bold" style={{ color: dirColors[item.correct] }}>Correct: {item.correct.toUpperCase()}</p><p className={`text-[10px] ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '\u2713' : `\u2717 You: ${(simAnswers[item.key] || '').toUpperCase()}`}</p></div>); })}</div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs text-gray-400 leading-relaxed">{sc.explanation}</p></div>
          <button onClick={nextSim} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">{simIdx < cpiScenarios.length - 1 ? 'Next Release \u2192' : 'See Results \u2192'}</button>
        </motion.div>)}
      </div>) : (<div className="text-center"><p className="text-3xl font-extrabold mb-2">{simScore}/15</p><p className="text-sm text-gray-400 mb-4">{simScore >= 12 ? 'Outstanding \u2014 you can predict CPI reactions like a macro trader.' : simScore >= 9 ? 'Good \u2014 review the headline vs core trap and in-line scenarios.' : 'Re-read core vs headline and the chain reaction before retrying.'}</p><div className="flex flex-wrap justify-center gap-2">{simHistory.map((pts, i) => (<div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${pts === 3 ? 'bg-green-500/20 text-green-400' : pts >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{pts}/3</div>))}</div><button onClick={() => { setSimIdx(0); setSimAnswers({}); setSimSubmitted(false); setSimScore(0); setSimHistory([]); setSimComplete(false); }} className="mt-6 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/[0.07]">Retry Simulator</button></div>)}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Trend Matters Most</p><h2 className="text-2xl font-extrabold mb-4">Single Print vs Multi-Month Direction</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">3+ MONTHS RISING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Structural inflation problem. Fed will be aggressive. One cool print doesn\u2019t change this. Need 3+ declining months.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">3+ MONTHS FALLING</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Genuine progress. Cuts are coming. One hot print doesn\u2019t reverse it. But watch the NEXT print very carefully.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">CHOPPY / SIDEWAYS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">\u201cSticky inflation.\u201d The Fed\u2019s nightmare. No clear direction = rates stay higher for longer. Trade with less conviction.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Trade the deviation for the day. Trade the TREND for the month. One print = short-term. Three prints = medium-term. Six prints = the Fed acts.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Global CPI \u2014 Not Just US</p><h2 className="text-2xl font-extrabold mb-4">Other Countries&rsquo; Data Matters Too</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">UK CPI</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Drives GBP. Released mid-month. UK has had stickier inflation than US \u2014 BOE stays hawkish longer.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">EU HICP</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Drives EUR. Flash estimate first, then final. ECB watches services inflation specifically.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">JAPAN CPI</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Rising Japanese inflation is HISTORIC \u2014 after decades of deflation. Hot Japan CPI = BOJ tightening risk = JPY strength.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">DIVERGENCE TRADE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">US CPI falling + UK CPI rising = GBP/USD uptrend potential. Inflation divergence drives rate divergence drives forex trends.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 CPI Errors That Cost Traders</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">CPI Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">CORE &gt; HEADLINE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When they diverge, trade core. The Fed watches core. The first 2 mins trade headline. The next 58 trade core.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">PPI \u2192 CPI</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Hot PPI = prepare for hot CPI. Reduce risk the day before. Cold PPI after hot? Bigger surprise = bigger move.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">15-MINUTE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Initial spike reverses 60-70%. Wait for T+15 with normalised spreads and confirmed direction.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">STICKY vs FLEXIBLE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Housing-driven CPI = structural, months to fix. Energy-driven = temporary, self-corrects. Know which is driving the print.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Hot CPI = USD up, Gold down, Equities down. Cold = reverse. In-line = no trade. Deviation size determines move size.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">CPI Trading Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Navigate CPI releases like a macro-informed trader.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding \u2014 you understand CPI trading at a macro level.' : gameScore >= 3 ? 'Good \u2014 review the headline vs core trap and the PPI signal.' : 'Re-read core vs headline and the reaction timeline before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\ud83d\udcca</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Inflation Data (CPI &amp; PPI)</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Inflation Analyst &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
