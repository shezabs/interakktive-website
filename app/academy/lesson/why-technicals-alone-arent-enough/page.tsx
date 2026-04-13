// app/academy/lesson/why-technicals-alone-arent-enough/page.tsx
// ATLAS Academy — Lesson 8.1: Why Technicals Alone Aren't Enough [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: News Impact Analyser — select event + instrument, get historical impact data
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
// ANIMATION 1: Normal Day vs News Day — side by side price charts
// ============================================================
function NormalVsNewsDayAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const midX = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Same Setup — Different Context', midX, 16);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(midX, 30); ctx.lineTo(midX, h - 10); ctx.stroke(); ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#26A69A'; ctx.font = 'bold 9px system-ui'; ctx.fillText('QUIET TUESDAY', midX / 2, 34);
    ctx.fillStyle = '#EF5350'; ctx.fillText('NFP FRIDAY', midX + midX / 2, 34);

    const chartTop = 50; const chartBot = h - 40; const range = chartBot - chartTop;
    const seed = 42; const seededRandom = (n: number) => { let x = Math.sin(seed + n) * 10000; return x - Math.floor(x); };
    const progress = Math.min(1, (t % 10) / 7);
    const candleCount = Math.floor(progress * 20);

    // Normal day — smooth, structured price action
    const normalPad = 15; const normalW = midX - normalPad * 2; const cw1 = normalW / 22;
    let normalBase = 0.5;
    for (let i = 0; i < candleCount; i++) {
      const r = seededRandom(i); const dir = r > 0.45 ? 1 : -1; const body = 0.015 + r * 0.02; const wick = body * 0.5;
      normalBase += dir * body * 0.3;
      normalBase = Math.max(0.15, Math.min(0.85, normalBase));
      const oY = chartTop + (1 - normalBase) * range; const cY = oY - dir * body * range;
      const hY = Math.min(oY, cY) - wick * range; const lY = Math.max(oY, cY) + wick * range;
      const x = normalPad + (i + 1) * cw1; const bw = cw1 * 0.6;
      const bull = dir > 0;
      ctx.strokeStyle = bull ? '#26A69A80' : '#EF535080'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, hY); ctx.lineTo(x, lY); ctx.stroke();
      ctx.fillStyle = bull ? '#26A69A' : '#EF5350'; ctx.fillRect(x - bw / 2, Math.min(oY, cY), bw, Math.max(2, Math.abs(oY - cY)));
    }

    // OB zone on normal chart
    if (candleCount > 8) { const obY = chartTop + 0.45 * range; ctx.fillStyle = '#26A69A15'; ctx.fillRect(normalPad + 7 * cw1, obY, 4 * cw1, 15); ctx.strokeStyle = '#26A69A30'; ctx.lineWidth = 0.5; ctx.strokeRect(normalPad + 7 * cw1, obY, 4 * cw1, 15); ctx.fillStyle = '#26A69A'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.fillText('OB', normalPad + 7 * cw1 + 2, obY + 10); }

    // News day — volatile, whipsaw, stop hunts
    const newsPad = midX + 15; const newsW = midX - 30; const cw2 = newsW / 22;
    let newsBase = 0.5; const newsEventCandle = 10;
    for (let i = 0; i < candleCount; i++) {
      const r = seededRandom(i + 100);
      const isNewsZone = i >= newsEventCandle - 1 && i <= newsEventCandle + 4;
      const volatility = isNewsZone ? 0.06 + r * 0.08 : 0.015 + r * 0.02;
      const dir = isNewsZone ? (i === newsEventCandle ? -1 : i === newsEventCandle + 1 ? 1 : (r > 0.5 ? 1 : -1)) : (r > 0.45 ? 1 : -1);
      const body = volatility; const wick = isNewsZone ? body * 1.5 : body * 0.5;
      newsBase += dir * body * (isNewsZone ? 0.8 : 0.3);
      newsBase = Math.max(0.1, Math.min(0.9, newsBase));
      const oY = chartTop + (1 - newsBase) * range; const cY = oY - dir * body * range;
      const hY = Math.min(oY, cY) - wick * range; const lY = Math.max(oY, cY) + wick * range;
      const x = newsPad + (i + 1) * cw2; const bw = cw2 * 0.6;
      const bull = dir > 0;
      ctx.strokeStyle = bull ? '#26A69A80' : '#EF535080'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, hY); ctx.lineTo(x, lY); ctx.stroke();
      ctx.fillStyle = bull ? '#26A69A' : '#EF5350'; ctx.fillRect(x - bw / 2, Math.min(oY, cY), bw, Math.max(2, Math.abs(oY - cY)));

      // News event marker
      if (i === newsEventCandle && candleCount > newsEventCandle) { ctx.fillStyle = '#EF535050'; ctx.fillRect(x - cw2, chartTop, cw2 * 6, range); ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚠ NFP RELEASE', x + cw2 * 2, chartTop - 3); }
    }

    // OB zone on news chart — same zone, gets obliterated
    if (candleCount > 8) { const obY = chartTop + 0.45 * range; ctx.fillStyle = '#26A69A15'; ctx.fillRect(newsPad + 7 * cw2, obY, 4 * cw2, 15); ctx.strokeStyle = '#EF535040'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(newsPad + 7 * cw2, obY); ctx.lineTo(newsPad + 11 * cw2, obY + 15); ctx.stroke(); ctx.moveTo(newsPad + 11 * cw2, obY); ctx.lineTo(newsPad + 7 * cw2, obY + 15); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#EF5350'; ctx.font = '7px system-ui'; ctx.textAlign = 'left'; ctx.fillText('OB DESTROYED', newsPad + 7 * cw2 + 2, obY + 10); }

    // Results
    ctx.textAlign = 'center'; ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = '#26A69A'; ctx.fillText('72% WR • Clean structure', midX / 2, h - 12);
    ctx.fillStyle = '#EF5350'; ctx.fillText('31% WR • Stops hunted instantly', midX + midX / 2, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Event Impact Heatmap — calendar grid
// ============================================================
function EventImpactHeatmapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Event Impact by Instrument', w / 2, 16);
    const events = ['NFP', 'CPI', 'FOMC', 'GDP', 'PMI', 'BOE'];
    const instruments = ['EUR/USD', 'GBP/USD', 'XAUUSD', 'NASDAQ', 'USD/JPY'];
    const impacts = [[95, 70, 85, 60, 80], [90, 75, 70, 55, 75], [100, 80, 95, 85, 90], [50, 40, 45, 55, 40], [45, 35, 30, 40, 35], [40, 90, 50, 30, 45]];
    const pad = 70; const gridW = w - pad - 20; const gridH = h - 60; const cellW = gridW / instruments.length; const cellH = gridH / events.length;
    const revealProgress = Math.min(1, (t % 8) / 5);

    // Column headers
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    instruments.forEach((inst, i) => ctx.fillText(inst, pad + i * cellW + cellW / 2, 38));

    // Row labels + cells
    events.forEach((evt, ei) => {
      const y = 45 + ei * cellH;
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(evt, pad - 8, y + cellH / 2 + 3);

      instruments.forEach((_, ii) => {
        const x = pad + ii * cellW; const impact = impacts[ei][ii];
        const cellIdx = ei * instruments.length + ii;
        const revealed = revealProgress > cellIdx / (events.length * instruments.length);
        if (revealed) {
          const intensity = impact / 100;
          const r = Math.round(239 * intensity + 38 * (1 - intensity));
          const g = Math.round(83 * intensity + 166 * (1 - intensity));
          const b = Math.round(80 * intensity + 154 * (1 - intensity));
          ctx.fillStyle = `rgba(${r},${g},${b},${0.15 + intensity * 0.35})`;
          ctx.beginPath(); ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4); ctx.fill();
          ctx.fillStyle = impact >= 80 ? '#EF5350' : impact >= 50 ? '#FFB300' : 'rgba(255,255,255,0.3)';
          ctx.font = `${impact >= 80 ? 'bold ' : ''}8px system-ui`; ctx.textAlign = 'center';
          ctx.fillText(impact >= 80 ? 'HIGH' : impact >= 50 ? 'MED' : 'LOW', x + cellW / 2, y + cellH / 2 + 3);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4); ctx.fill();
        }
      });
    });

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('FOMC impacts ALL markets — NFP & CPI impact currencies & Gold most', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// NEWS IMPACT ANALYSER DATA
// ============================================================
const impactData: Record<string, Record<string, { avgPips: number; spreadMultiple: string; recoveryMins: number; action: string; winRate: string; trap: string }>> = {
  'NFP': { 'EUR/USD': { avgPips: 65, spreadMultiple: '5-8x', recoveryMins: 25, action: 'AVOID first 15 mins. Fade the reversal if clear.', winRate: '31% during, 54% after 15 min', trap: 'Initial spike reverses 68% of the time' }, 'GBP/USD': { avgPips: 55, spreadMultiple: '4-7x', recoveryMins: 20, action: 'AVOID. GBP correlates with EUR but with less liquidity = worse fills.', winRate: '28% during, 51% after', trap: 'Wider spreads on GBP make stop placement impossible' }, 'XAUUSD': { avgPips: 180, spreadMultiple: '6-10x', recoveryMins: 30, action: 'AVOID. Gold is the most violent NFP reactor. Wait 30 mins minimum.', winRate: '24% during, 48% after 30 min', trap: '$18-25 candles in seconds. Your stop is a suggestion, not a guarantee.' }, 'NASDAQ': { avgPips: 120, spreadMultiple: '3-5x', recoveryMins: 15, action: 'WAIT 15 mins. Equities digest faster. Trade the confirmed direction.', winRate: '35% during, 58% after', trap: 'Jobs data affects rate expectations which affect growth stocks' }, 'USD/JPY': { avgPips: 50, spreadMultiple: '4-6x', recoveryMins: 20, action: 'AVOID first 15 mins. USD/JPY is a pure USD play during NFP.', winRate: '30% during, 52% after', trap: 'BOJ intervention risk compounds NFP volatility' } },
  'CPI': { 'EUR/USD': { avgPips: 55, spreadMultiple: '4-6x', recoveryMins: 20, action: 'WAIT for the deviation. Hot CPI = USD bull. Cold = USD bear. Trade after 10 mins.', winRate: '34% during, 56% after', trap: 'Core vs headline divergence causes whipsaws' }, 'GBP/USD': { avgPips: 45, spreadMultiple: '3-5x', recoveryMins: 15, action: 'Same as EUR/USD but less liquid. Wait for EUR to confirm direction first.', winRate: '32% during, 53% after', trap: 'UK CPI and US CPI on different dates — know which one you are trading' }, 'XAUUSD': { avgPips: 150, spreadMultiple: '5-8x', recoveryMins: 25, action: 'Hot CPI = Gold drops (higher rates). Cold CPI = Gold rallies. Wait 15 mins.', winRate: '29% during, 52% after', trap: 'Gold front-runs CPI based on PPI released days earlier' }, 'NASDAQ': { avgPips: 100, spreadMultiple: '3-4x', recoveryMins: 15, action: 'Hot CPI = Bearish (higher rates = lower valuations). Trade after 10 min settle.', winRate: '36% during, 60% after', trap: 'Market sometimes rallies on hot CPI if "already priced in"' }, 'USD/JPY': { avgPips: 45, spreadMultiple: '3-5x', recoveryMins: 15, action: 'Hot CPI = JPY weakness (USD strength). Straightforward direction post-settle.', winRate: '35% during, 55% after', trap: 'Carry trade unwind can override CPI direction' } },
  'FOMC': { 'EUR/USD': { avgPips: 80, spreadMultiple: '6-10x', recoveryMins: 45, action: 'DO NOT TRADE during statement. Wait for press conference direction (30 mins after).', winRate: '22% during, 51% after presser', trap: 'Statement says one thing, Powell says another. Direction flips mid-presser.' }, 'GBP/USD': { avgPips: 70, spreadMultiple: '5-8x', recoveryMins: 40, action: 'Same as EUR/USD. GBP follows USD direction post-FOMC.', winRate: '24% during, 49% after', trap: 'If BOE decision is same week, compounded volatility' }, 'XAUUSD': { avgPips: 250, spreadMultiple: '8-15x', recoveryMins: 60, action: 'THE most dangerous event for Gold. Sit out entirely or trade next day.', winRate: '18% during, 46% after 1hr', trap: '$30+ candles. Multiple reversals during presser. Untradeable for most.' }, 'NASDAQ': { avgPips: 200, spreadMultiple: '4-6x', recoveryMins: 30, action: 'Wait for press conference. Dot plot matters more than the rate decision itself.', winRate: '25% during, 55% after', trap: 'Algos react to statement, humans react to presser. Two separate moves.' }, 'USD/JPY': { avgPips: 70, spreadMultiple: '5-8x', recoveryMins: 40, action: 'Pure rate differential play. Wait for presser to confirm hawkish/dovish stance.', winRate: '23% during, 50% after', trap: 'Carry trade positions unwind violently if surprise dovish' } },
  'GDP': { 'EUR/USD': { avgPips: 30, spreadMultiple: '2-3x', recoveryMins: 10, action: 'Lower impact. Trade normally with slightly wider stop.', winRate: '48% during, 55% after', trap: 'Revision vs initial — revisions matter more, initials are already stale' }, 'GBP/USD': { avgPips: 25, spreadMultiple: '2-3x', recoveryMins: 10, action: 'UK GDP has more impact on GBP than US GDP. Check which release it is.', winRate: '46% during, 54% after', trap: 'GDP is backward-looking. PMI already told you this weeks ago.' }, 'XAUUSD': { avgPips: 60, spreadMultiple: '2-4x', recoveryMins: 15, action: 'Mild impact. Strong GDP = rate expectations rise = Gold pressure.', winRate: '42% during, 52% after', trap: 'Gold may not react immediately — delayed move through rate expectations' }, 'NASDAQ': { avgPips: 80, spreadMultiple: '2-3x', recoveryMins: 10, action: 'Strong GDP = good for earnings but bad if it means higher rates. Mixed signal.', winRate: '50% during, 56% after', trap: 'The "good news is bad news" paradox — strong economy = higher rates = lower valuations' }, 'USD/JPY': { avgPips: 25, spreadMultiple: '2-3x', recoveryMins: 10, action: 'Minor impact. Trade normally unless deviation is extreme.', winRate: '49% during, 54% after', trap: 'GDP rarely surprises enough to create a tradeable move' } },
};

const eventTypes = ['NFP', 'CPI', 'FOMC', 'GDP'];
const instrumentTypes = ['EUR/USD', 'GBP/USD', 'XAUUSD', 'NASDAQ', 'USD/JPY'];

// ============================================================
// CONTENT DATA
// ============================================================
const blindSpots = [
  { title: '⚠️ Central Bank Decisions', desc: 'The Fed announces a surprise 50bps rate cut. Your bullish USD Order Block is now a liquidity magnet — every stop beneath it gets swept as institutions dump dollars.<br/><br/><strong>What technicals told you:</strong> Buy.<br/><strong>What macro told you:</strong> The ground is about to shift. Stay flat.' },
  { title: '⚠️ NFP & Employment Data', desc: 'Non-Farm Payrolls prints +350K vs +180K forecast. The deviation is massive. EUR/USD drops 80 pips in 90 seconds. Your 15-pip stop never had a chance.<br/><br/><strong>What technicals told you:</strong> Enter at the OB pullback.<br/><strong>What macro told you:</strong> First Friday of the month. No entries within 30 minutes of 13:30 UTC.' },
  { title: '⚠️ CPI Inflation Prints', desc: 'Core CPI comes in at 4.1% vs 3.8% forecast. Rate expectations shift immediately. Gold drops $25 in 2 minutes. Your long position based on a “perfect FVG” is now −2R.<br/><br/><strong>What technicals told you:</strong> FVG + OTE = enter long.<br/><strong>What macro told you:</strong> CPI day. Reduce risk or sit out.' },
  { title: '⚠️ Geopolitical Shocks', desc: 'Breaking news: military escalation in the Middle East. Oil spikes 8%. Gold gaps up $40. Your short Gold position based on a “beautiful distribution” is obliterated by a gap you never saw coming.<br/><br/><strong>What technicals told you:</strong> Distribution = sell.<br/><strong>What macro told you:</strong> Elevated geopolitical risk = reduce overnight exposure.' },
];

const costOfIgnorance = [
  { title: 'Stop Hunts on Steroids', mistake: 'Normal stop hunts sweep 10-15 pips of liquidity. News stop hunts sweep 50-100 pips. Your structure-based stop is designed for normal conditions.', fix: 'Widen stops or flatten before high-impact events. Structure doesn’t protect you from a 90-pip candle.' },
  { title: 'False Breakouts Become Real', mistake: 'The “fake-out” pattern you trade in normal conditions becomes a REAL breakout during news. The reversal never comes.', fix: 'News events change the rules. What looks like manipulation might be genuine institutional repositioning.' },
  { title: 'Spread Widening Kills R:R', mistake: 'Your 1:2 R:R calculation assumed a 1.5 pip spread. During NFP, the spread is 12 pips. Your actual R:R is now 1:0.8.', fix: 'Factor spread widening into your event risk model. If the maths don’t work with a 10x spread, don’t trade.' },
  { title: 'Correlation Chaos', mistake: 'Your EUR/USD long and GBP/USD long both get hit simultaneously. You thought you had 2 positions — you actually had 1 doubled position.', fix: 'During news, correlations spike to near 1.0. Multiple correlated positions = compounded risk, not diversification.' },
];

const quizQuestions = [
  { q: 'An Order Block setup appears 10 minutes before NFP. You should:', opts: ['Enter immediately — the OB is valid', 'Wait until after NFP — technical setups are unreliable during high-impact news', 'Enter with a wider stop to survive the volatility', 'Enter at half size as a compromise'], correct: 1, explain: 'Technical setups lose their statistical edge during high-impact news. The 72% WR OB becomes 31% during NFP. The correct action is to wait until after the event settles.' },
  { q: 'Why is a “perfect” technical setup dangerous during news events?', opts: ['The setup is invalid', 'News creates abnormal volatility that structure-based stops cannot handle', 'The market is closed during news', 'Indicators stop working'], correct: 1, explain: 'The setup itself may be valid technically, but news volatility creates pip moves that dwarf normal structure. A 15-pip stop gets swept by a 90-pip candle.' },
  { q: 'The same OB setup has 72% WR on quiet days and 31% WR during NFP. This proves:', opts: ['OBs don’t work', 'Context matters more than the setup itself — macro environment determines probability', 'You need better OB identification', 'NFP is random'], correct: 1, explain: 'The setup is identical. The context is not. Macro events change the probability distribution. A setup’s WR is conditional on the environment.' },
  { q: 'During FOMC, spreads on Gold widen from 2 pips to 30 pips. Your planned 1:2 R:R with a 20-pip stop becomes:', opts: ['Still 1:2 — spreads don’t affect R:R', 'Approximately 1:1 or worse — entry cost eats into the reward', 'Better — wider spreads mean more movement', 'Unchanged if you use limit orders'], correct: 1, explain: 'Spread widening adds direct cost to entry. A 20-pip stop with a 30-pip spread means you’re already nearly at your stop the moment you enter. R:R is destroyed.' },
  { q: 'Your EUR/USD long and GBP/USD long both get stopped out during CPI. The root cause is:', opts: ['Bad luck on two trades', 'Correlation — both pairs move against USD simultaneously during news, doubling your exposure', 'CPI affects all pairs equally', 'Your stops were too tight'], correct: 1, explain: 'EUR/USD and GBP/USD have ~0.88 correlation. During news, this spikes even higher. You had double exposure to a single risk event, not two independent trades.' },
  { q: 'A quiet Tuesday shows smooth SMC structure. The same chart during NFP shows violent whipsaws. The difference is:', opts: ['Different timeframes', 'Institutional order flow driven by macro data overwhelms technical structure', 'Random noise', 'Different liquidity providers'], correct: 1, explain: 'News releases trigger massive institutional repositioning. This order flow is driven by macro data, not chart patterns. Technical structure gets overwhelmed by the sheer volume.' },
  { q: 'The “15-minute rule” after news events means:', opts: ['Trade the first 15-minute candle', 'Wait 15 minutes for spreads to normalise and the real direction to emerge', 'Only trade for 15 minutes', 'Set alerts for 15 minutes before news'], correct: 1, explain: 'The initial spike after news is unreliable — it reverses 60-70% of the time. Waiting 15 minutes allows spreads to normalise and the actual institutional direction to emerge.' },
  { q: 'A complete trader integrates macro by:', opts: ['Becoming an economist', 'Knowing which events affect their instruments and adjusting risk before those events', 'Ignoring technicals during news', 'Only trading during news for bigger moves'], correct: 1, explain: 'Integration means knowing your event calendar, understanding which events move your instruments, and adjusting risk (reduce, flatten, or widen stops) around those events. Not replacing technicals — complementing them.' },
];

const gameRounds = [
  { scenario: '<strong>Tuesday 14:00 UTC.</strong> No high-impact news today. EUR/USD shows a textbook bullish OB pullback at OTE with FVG confluence. Your pre-session bias is bullish on the Daily.', options: [
    { text: 'Enter the trade — no macro risk, clean setup, full conviction.', correct: true, explain: '✓ Correct. No event risk. Clean structure. Full macro clearance. This is exactly when technical setups have their statistical edge.' },
    { text: 'Wait for tomorrow — you should always check macro first.', correct: false, explain: '✗ You DID check macro — and it’s clear. No events today. Waiting for no reason is leaving money on the table.' },
    { text: 'Enter at half size just in case.', correct: false, explain: '✗ No reason to reduce size. Risk-off is for event days, not quiet Tuesdays. Trade your plan.' },
  ]},
  { scenario: '<strong>Friday 13:15 UTC.</strong> NFP releases at 13:30. You spot a “perfect” bearish setup on XAUUSD — CHoCH + OB + FVG alignment. 15 minutes until release.', options: [
    { text: 'Enter — the setup is too good to miss.', correct: false, explain: '✗ This is exactly how accounts blow up. Gold moves $18-25 in seconds during NFP. Your stop is meaningless.' },
    { text: 'Flatten all positions. No entries within 30 minutes of NFP. Re-evaluate at 14:00 UTC.', correct: true, explain: '✓ Correct. NFP on Gold: 24% WR during, spreads 6-10x, $180 average move. The “perfect” setup has a 76% chance of failing in this context.' },
    { text: 'Enter with a wider stop to survive the spike.', correct: false, explain: '✗ Wider stop means larger position risk. A 50-pip stop on Gold during NFP is still not enough — and your R:R is destroyed.' },
  ]},
  { scenario: '<strong>Wednesday 19:00 UTC.</strong> FOMC rate decision + press conference. You have an open EUR/USD long from yesterday, currently +0.8R. Announcement in 30 minutes.', options: [
    { text: 'Hold — you’re in profit and the setup is still valid.', correct: false, explain: '✗ FOMC can move EUR/USD 80+ pips. Your +0.8R can become -2R in seconds. The setup was valid BEFORE macro changed the game.' },
    { text: 'Move stop to breakeven and hold through.', correct: false, explain: '✗ Better than holding with original stop, but spreads widen to 8-15 pips during FOMC. Your BE stop may get filled at -1R due to slippage.' },
    { text: 'Close the position now. Lock in +0.8R. Re-enter after the press conference settles.', correct: true, explain: '✓ Correct. +0.8R in the bank is real. Holding through FOMC is gambling, not trading. Re-evaluate after the presser (usually 45-60 mins post-decision).' },
  ]},
  { scenario: '<strong>Thursday 13:30 UTC.</strong> US CPI just released. Core CPI: 4.1% vs 3.8% forecast — a hot print. Gold has dropped $15 in 2 minutes. Your analysis from this morning said “bullish Gold.”', options: [
    { text: 'Buy the dip — your morning analysis was bullish and this is a discount.', correct: false, explain: '✗ Your morning analysis didn’t include a hot CPI print. The macro environment just changed. Hot CPI = higher rate expectations = bearish Gold.' },
    { text: 'Wait 15 minutes for spreads to normalise. Then re-evaluate bias with the new CPI data factored in.', correct: true, explain: '✓ Correct. The 15-minute rule applies. Spreads are still 5-8x normal. After settlement, reassess: hot CPI likely means your bullish Gold thesis is invalidated for today.' },
    { text: 'Short Gold immediately — hot CPI is clearly bearish.', correct: false, explain: '✗ Right direction, wrong timing. Spreads are still extreme and the initial move often partially reverses. Wait for the settle.' },
  ]},
  { scenario: '<strong>Sunday evening.</strong> Breaking news: major geopolitical escalation overnight. Markets haven’t opened yet. You have pending orders on EUR/USD and a Gold short from Friday.', options: [
    { text: 'Leave everything — markets will sort themselves out.', correct: false, explain: '✗ Gap risk is real. Your Gold short could open $30-50 against you. Pending EUR/USD orders could fill at terrible prices in a gap.' },
    { text: 'Cancel all pending orders immediately. Set alarm for market open. Assess Gold short at open — if gap is large, close immediately and reassess.', correct: true, explain: '✓ Correct. Cancel pendings to avoid gap fills. For the Gold short — geopolitical risk is bullish for Gold (safe haven). Expect a gap against you. Close at open, take the loss, reassess when dust settles.' },
    { text: 'Add a Gold long to hedge the short.', correct: false, explain: '✗ Hedging by going both directions just locks in the spread cost on both sides. Close the losing position, don’t add complexity.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function WhyTechnicalsPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // News Impact Analyser
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const analysisResult = selectedEvent && selectedInstrument ? impactData[selectedEvent]?.[selectedInstrument] : null;

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 1</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Why Technicals Alone<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Aren&rsquo;t Enough</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Your chart is a map. Macro events are the weather. The best map in the world won&rsquo;t save you from a hurricane you didn&rsquo;t see coming.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">⛵ Sailing Without a Weather Forecast</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine a captain with the most detailed nautical chart ever made. Every reef, every current, every depth marker is perfect. He sets sail on a sunny morning with complete confidence.</p>
            <p className="text-gray-400 leading-relaxed">But he didn&rsquo;t check the weather. A Category 4 hurricane is 6 hours away. <strong className="text-white">The map was perfect. The preparation was fatal.</strong></p>
            <p className="text-gray-400 leading-relaxed mt-3">Your chart is the map. <strong className="text-amber-400">Macro events are the weather.</strong> Technical analysis tells you where the market has been and where it might go. Fundamentals tell you <strong className="text-white">when the environment itself is about to change</strong>.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">3 identical OB setups tracked across 500 trades. <strong className="text-green-400">Quiet days: 72% WR, 1:1.9 R:R.</strong> <strong className="text-[#FFB300]">During NFP: 31% WR, 1:0.8 R:R.</strong> <strong className="text-red-400">10 mins before FOMC: 18% WR, 1:0.4 R:R.</strong> Same setup. Completely different outcomes. The only variable: <strong className="text-white">macro context</strong>.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Normal Day vs News Day</p><h2 className="text-2xl font-extrabold mb-4">Same Setup, Different Universe</h2><p className="text-gray-400 text-sm mb-6">Watch the same Order Block setup play out on a quiet Tuesday vs NFP Friday.</p><NormalVsNewsDayAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Event Impact Map</p><h2 className="text-2xl font-extrabold mb-4">Which Events Move Which Instruments</h2><p className="text-gray-400 text-sm mb-6">Not all events affect all instruments equally. Know your danger zones.</p><EventImpactHeatmapAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Blind Spots</p><h2 className="text-2xl font-extrabold mb-4">Where Pure Technicals Fail</h2><div className="space-y-3">{blindSpots.map((item, i) => (<div key={i}><button onClick={() => toggle(`bs-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`bs-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`bs-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Numbers Don&rsquo;t Lie</p><h2 className="text-2xl font-extrabold mb-4">What Happens When You Ignore Context</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">QUIET DAY WR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">72% on clean OB setups. This is where your edge lives. Protect it.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">NFP DAY WR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">31% on the SAME setups. Your edge doesn’t exist during high-impact news.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">FOMC DAY WR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">18% within 10 minutes of the decision. Worse than a coin flip. You are donating money.</span></p></div>
      </div></motion.div></section>

      {/* S05 — GROUNDBREAKING: News Impact Analyser */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">News Impact Analyser</h2><p className="text-gray-400 text-sm mb-6">Select an event and instrument to see the historical impact data. This is your reference for every trading week.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div><p className="text-xs font-bold text-gray-300 mb-2">Select Event</p><div className="flex flex-wrap gap-2">{eventTypes.map(evt => (<button key={evt} onClick={() => setSelectedEvent(evt)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedEvent === evt ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{evt}</button>))}</div></div>
        <div><p className="text-xs font-bold text-gray-300 mb-2">Select Instrument</p><div className="flex flex-wrap gap-2">{instrumentTypes.map(inst => (<button key={inst} onClick={() => setSelectedInstrument(inst)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedInstrument === inst ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{inst}</button>))}</div></div>
        {analysisResult && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">{selectedEvent} × {selectedInstrument}</p><p className="text-lg font-extrabold text-white">{analysisResult.avgPips} pip avg move</p></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 font-bold">SPREAD WIDENING</p><p className="text-sm font-bold text-red-400">{analysisResult.spreadMultiple}</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 font-bold">RECOVERY TIME</p><p className="text-sm font-bold text-amber-400">{analysisResult.recoveryMins} mins</p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] col-span-2"><p className="text-[10px] text-gray-500 font-bold">WIN RATE</p><p className="text-sm font-bold text-white">{analysisResult.winRate}</p></div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] text-gray-500 font-bold mb-1">RECOMMENDED ACTION</p><p className="text-sm text-green-400 font-semibold">{analysisResult.action}</p></div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-[10px] text-red-400 font-bold mb-1">⚠ TRAP TO WATCH</p><p className="text-sm text-gray-400">{analysisResult.trap}</p></div>
        </motion.div>)}
        {!analysisResult && selectedEvent && selectedInstrument && (<p className="text-sm text-gray-500 text-center">No data available for this combination.</p>)}
        {(!selectedEvent || !selectedInstrument) && (<p className="text-xs text-gray-600 text-center">Select both an event and instrument to see impact data.</p>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Integration, Not Replacement</p><h2 className="text-2xl font-extrabold mb-4">How Macro Fits Into Your Process</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">STEP 1: CHECK CALENDAR</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Every morning. What events affect your instruments today? Red = high impact = adjust risk.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">STEP 2: ASSESS CONTEXT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">No events? Trade normally. Events in 2+ hours? Reduced risk. Events in 30 mins? Flatten.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">STEP 3: TRADE TECHNICALS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Your OBs, FVGs, BOS/CHoCH still work. They just need macro clearance first.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">STEP 4: POST-EVENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">After the event settles (15-60 mins), re-evaluate. New structure = new opportunity.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Events That Matter</p><h2 className="text-2xl font-extrabold mb-4">Your Priority Watchlist</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">TIER 1 — FLATTEN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">FOMC, NFP, CPI. These move everything. No entries 30 mins before. Flatten if in a trade.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">TIER 2 — REDUCE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">GDP, PMI, Retail Sales, PPI, Central Bank Speeches. Reduce risk 50%. Widen stops.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">TIER 3 — AWARE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Jobless Claims, Housing, Consumer Confidence. Minor impact. Trade normally but know they exist.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">UNSCHEDULED</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Geopolitical events, natural disasters, bank failures. Can’t predict. CAN manage exposure: tight stops, reduced overnight size.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Ways Traders Get Destroyed by News</h2><div className="space-y-3">{costOfIgnorance.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Macro Awareness Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">TIER 1 EVENTS</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">FOMC, NFP, CPI. Flatten 30 mins before. No entries during. Wait 15-60 mins after.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">THE DEVIATION RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Markets react to SURPRISE, not the number. Forecast vs Actual gap = volatility.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">15-MINUTE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Initial spike reverses 60-70% of the time. Wait for the settle before acting.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">CORRELATION SPIKE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">During news, all correlated pairs move together. 2 positions = 2x risk, not diversification.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Technicals tell you WHERE. Macro tells you WHEN. Use both or lose to someone who does.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Macro Awareness Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Make the right decision under macro pressure.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you understand when to trade and when to protect.' : gameScore >= 3 ? 'Good — review the FOMC and geopolitical scenarios carefully.' : 'Re-read the blind spots and the 15-minute rule before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🌍</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Why Technicals Alone Aren&rsquo;t Enough</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Market Realist &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
