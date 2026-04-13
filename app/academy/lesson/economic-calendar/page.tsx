// app/academy/lesson/economic-calendar/page.tsx
// ATLAS Academy — Lesson 8.2: The Economic Calendar [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Weekly Calendar Planner — personalised event schedule for your instruments
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
// ANIMATION 1: Weekly Event Strip — 5-day calendar with impact icons
// ============================================================
function WeeklyEventStripAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('A Typical Trading Week — Know Before You Trade', w / 2, 16);
    const days = [
      { name: 'MON', events: [{ time: '09:30', name: 'PMI', impact: 'med' }, { time: '15:00', name: 'ISM', impact: 'med' }] },
      { name: 'TUE', events: [{ time: '10:00', name: 'Jobs Data', impact: 'low' }] },
      { name: 'WED', events: [{ time: '13:30', name: 'CPI', impact: 'high' }, { time: '19:00', name: 'FOMC', impact: 'high' }] },
      { name: 'THU', events: [{ time: '13:30', name: 'PPI', impact: 'med' }, { time: '13:30', name: 'Claims', impact: 'low' }] },
      { name: 'FRI', events: [{ time: '13:30', name: 'NFP', impact: 'high' }] },
    ];
    const pad = 10; const dayW = (w - pad * 2) / 5; const dayH = h - 55; const topY = 35;
    const activeDay = Math.floor((t % 10) / 2) % 5;
    const impactColor: Record<string, string> = { high: '#EF5350', med: '#FFB300', low: '#26A69A' };

    days.forEach((day, di) => {
      const x = pad + di * dayW; const isActive = di === activeDay;
      // Day column
      ctx.fillStyle = isActive ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.01)';
      ctx.beginPath(); ctx.roundRect(x + 2, topY, dayW - 4, dayH, 6); ctx.fill();
      ctx.strokeStyle = isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = isActive ? 1 : 0.5; ctx.beginPath(); ctx.roundRect(x + 2, topY, dayW - 4, dayH, 6); ctx.stroke();
      // Day label
      ctx.fillStyle = isActive ? '#f59e0b' : 'rgba(255,255,255,0.3)'; ctx.font = `${isActive ? 'bold ' : ''}9px system-ui`;
      ctx.textAlign = 'center'; ctx.fillText(day.name, x + dayW / 2, topY + 16);
      // Events
      day.events.forEach((evt, ei) => {
        const ey = topY + 30 + ei * 40; const col = impactColor[evt.impact];
        if (isActive) {
          ctx.fillStyle = col + '15'; ctx.beginPath(); ctx.roundRect(x + 6, ey, dayW - 12, 30, 4); ctx.fill();
          ctx.strokeStyle = col + '40'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.roundRect(x + 6, ey, dayW - 12, 30, 4); ctx.stroke();
        }
        ctx.fillStyle = isActive ? col : 'rgba(255,255,255,0.15)'; ctx.font = `${isActive ? 'bold ' : ''}7px system-ui`;
        ctx.textAlign = 'center'; ctx.fillText(evt.name, x + dayW / 2, ey + 13);
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'; ctx.font = '6px system-ui';
        ctx.fillText(evt.time + ' UTC', x + dayW / 2, ey + 24);
        // Impact dot
        ctx.beginPath(); ctx.arc(x + dayW - 10, ey + 6, 3, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? col : col + '30'; ctx.fill();
      });
    });
    // Danger zone highlight on Wed
    if (activeDay === 2) {
      ctx.fillStyle = '#EF535008'; ctx.fillRect(pad + 2 * dayW, topY, dayW, dayH);
      ctx.fillStyle = '#EF5350'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('⚠ DANGER DAY — CPI + FOMC', pad + 2 * dayW + dayW / 2, h - 15);
    }
    // Legend
    ctx.textAlign = 'left'; ctx.font = '7px system-ui';
    const legY = h - 8; const legX = 15;
    ctx.beginPath(); ctx.arc(legX, legY - 2, 3, 0, Math.PI * 2); ctx.fillStyle = '#EF5350'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('High', legX + 7, legY);
    ctx.beginPath(); ctx.arc(legX + 35, legY - 2, 3, 0, Math.PI * 2); ctx.fillStyle = '#FFB300'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('Medium', legX + 42, legY);
    ctx.beginPath(); ctx.arc(legX + 85, legY - 2, 3, 0, Math.PI * 2); ctx.fillStyle = '#26A69A'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('Low', legX + 92, legY);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Deviation Meter — forecast vs actual
// ============================================================
function DeviationMeterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.004; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('The Deviation Is What Moves Markets', cx, 16);
    const scenarios = [
      { event: 'NFP', forecast: '+180K', actual: '+350K', deviation: '+170K', label: 'MASSIVE BEAT', zone: 'shock', color: '#EF5350', needle: 0.95, reaction: 'USD surges, Gold drops $22' },
      { event: 'CPI', forecast: '3.2%', actual: '3.1%', deviation: '-0.1%', label: 'SLIGHT MISS', zone: 'mild', color: '#FFB300', needle: 0.4, reaction: 'Minor USD weakness, Gold +$5' },
      { event: 'FOMC', forecast: 'Hold', actual: 'Hold', deviation: 'In-line', label: 'AS EXPECTED', zone: 'inline', color: '#26A69A', needle: 0.5, reaction: 'Presser language matters more' },
      { event: 'GDP', forecast: '2.1%', actual: '3.4%', deviation: '+1.3%', label: 'BIG BEAT', zone: 'shock', color: '#EF5350', needle: 0.85, reaction: 'Rate hike fears spike, equities drop' },
    ];
    const activeIdx = Math.floor((t % 16) / 4) % 4; const s = scenarios[activeIdx];
    // Gauge
    const gaugeY = h * 0.45; const gaugeR = Math.min(w * 0.3, h * 0.3);
    // Arc background
    ctx.beginPath(); ctx.arc(cx, gaugeY, gaugeR, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 20; ctx.stroke();
    // Colour zones
    const zones = [{ start: 0, end: 0.2, color: '#26A69A' }, { start: 0.2, end: 0.4, color: '#26A69A80' }, { start: 0.4, end: 0.6, color: '#FFB30060' }, { start: 0.6, end: 0.8, color: '#EF535080' }, { start: 0.8, end: 1, color: '#EF5350' }];
    zones.forEach(z => { ctx.beginPath(); ctx.arc(cx, gaugeY, gaugeR, Math.PI + z.start * Math.PI, Math.PI + z.end * Math.PI); ctx.strokeStyle = z.color; ctx.lineWidth = 18; ctx.stroke(); });
    // Zone labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '6px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('In-line', cx - gaugeR * 0.7, gaugeY + 12);
    ctx.fillText('Mild', cx - gaugeR * 0.2, gaugeY - gaugeR * 0.6);
    ctx.fillText('Shock', cx + gaugeR * 0.7, gaugeY + 12);
    // Needle
    const needleAngle = Math.PI + s.needle * Math.PI;
    const pulse = Math.sin(t * 4) * 0.02;
    const nx = cx + Math.cos(needleAngle + pulse) * (gaugeR - 5);
    const ny = gaugeY + Math.sin(needleAngle + pulse) * (gaugeR - 5);
    ctx.beginPath(); ctx.moveTo(cx, gaugeY); ctx.lineTo(nx, ny);
    ctx.strokeStyle = s.color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, gaugeY, 5, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill();
    // Event info
    ctx.textAlign = 'center';
    ctx.fillStyle = s.color; ctx.font = 'bold 12px system-ui'; ctx.fillText(s.event, cx, gaugeY + 30);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '9px system-ui';
    ctx.fillText(`Forecast: ${s.forecast}   Actual: ${s.actual}`, cx, gaugeY + 48);
    ctx.fillStyle = s.color; ctx.font = 'bold 10px system-ui';
    ctx.fillText(`Deviation: ${s.deviation} — ${s.label}`, cx, gaugeY + 65);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '8px system-ui';
    ctx.fillText(s.reaction, cx, gaugeY + 82);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// WEEKLY CALENDAR PLANNER DATA
// ============================================================
const availablePairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'AUD/USD', 'USD/CAD'];
const availableSessions = ['Asia (00–08 UTC)', 'London (07–16 UTC)', 'New York (12–21 UTC)'];

interface CalendarEvent { day: string; time: string; name: string; impact: 'high' | 'med' | 'low'; affects: string[]; action: string; }
const weeklyEvents: CalendarEvent[] = [
  { day: 'Monday', time: '09:00', name: 'EU PMI', impact: 'med', affects: ['EUR/USD', 'GBP/USD'], action: 'Reduce risk on EUR pairs during release' },
  { day: 'Monday', time: '15:00', name: 'ISM Manufacturing', impact: 'med', affects: ['USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'EUR/USD', 'GBP/USD'], action: 'Reduce risk 50%. Watch for USD reaction.' },
  { day: 'Tuesday', time: '10:00', name: 'UK Employment', impact: 'med', affects: ['GBP/USD'], action: 'Reduce GBP risk. Widen stops if holding.' },
  { day: 'Tuesday', time: '15:00', name: 'JOLTS Job Openings', impact: 'low', affects: ['EUR/USD', 'USD/JPY', 'XAUUSD'], action: 'Trade normally. Be aware.' },
  { day: 'Wednesday', time: '13:30', name: 'CPI (US)', impact: 'high', affects: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'AUD/USD', 'USD/CAD'], action: 'FLATTEN 30 mins before. No entries during. Wait 15 mins after.' },
  { day: 'Wednesday', time: '19:00', name: 'FOMC Decision', impact: 'high', affects: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'AUD/USD', 'USD/CAD'], action: 'FLATTEN all USD positions. Wait for press conference to settle (45-60 mins).' },
  { day: 'Thursday', time: '12:00', name: 'BOE Decision', impact: 'high', affects: ['GBP/USD'], action: 'FLATTEN GBP positions. Same rules as FOMC for GBP.' },
  { day: 'Thursday', time: '13:30', name: 'PPI + Jobless Claims', impact: 'med', affects: ['EUR/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ'], action: 'Reduce risk. PPI is a CPI leading indicator.' },
  { day: 'Friday', time: '13:30', name: 'NFP', impact: 'high', affects: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'NASDAQ', 'US30', 'AUD/USD', 'USD/CAD'], action: 'FLATTEN 30 mins before. No entries for 15-30 mins after. Gold needs 30 mins.' },
  { day: 'Friday', time: '15:00', name: 'Consumer Sentiment', impact: 'low', affects: ['EUR/USD', 'NASDAQ', 'US30'], action: 'Trade normally. Minor impact unless extreme deviation.' },
];

// ============================================================
// CONTENT DATA
// ============================================================
const calendarAnatomy = [
  { title: '📅 The 3 Numbers: Previous, Forecast, Actual', desc: '<strong>Previous:</strong> Last month’s confirmed reading. The baseline.<br/><br/><strong>Forecast:</strong> The consensus expectation from economists. This is what the market has ALREADY priced in.<br/><br/><strong>Actual:</strong> The real number released at the scheduled time.<br/><br/><strong>The key insight:</strong> Markets do NOT react to the actual number. They react to the <strong>gap between forecast and actual</strong>. If NFP forecast is +180K and actual is +180K, the market barely moves — it was already priced in. If actual is +350K, the deviation (+170K) causes the explosion.' },
  { title: '🚨 Impact Ratings: High, Medium, Low', desc: '<strong>High Impact (Red):</strong> FOMC, NFP, CPI. Can move your instrument 50-250 pips in minutes. Flatten or don’t trade.<br/><br/><strong>Medium Impact (Orange):</strong> PMI, GDP, PPI, Retail Sales. Can move 20-60 pips. Reduce risk, widen stops.<br/><br/><strong>Low Impact (Yellow):</strong> Consumer Confidence, Housing, Trade Balance. Usually 5-15 pips. Trade normally but be aware.<br/><br/><strong>The mistake:</strong> Treating all red events the same. NFP on the first Friday is more volatile than US GDP, even though both are “high impact.” Context matters within tiers.' },
  { title: '⏰ Timing: When to Check, When to Act', desc: '<strong>Sunday night:</strong> Scan the full week. Identify all high-impact events for YOUR instruments.<br/><br/><strong>Pre-session (daily):</strong> Check today’s events. Any high-impact during your session? Adjust plan.<br/><br/><strong>30 minutes before high-impact:</strong> Final decision — flatten, reduce, or hold with wide stop.<br/><br/><strong>During release:</strong> NO new entries. Watch, don’t trade.<br/><br/><strong>15-60 minutes after:</strong> Assess. Spreads normalised? Direction clear? THEN consider entries.' },
  { title: '🌍 Country-Specific Events: Know Your Pairs', desc: '<strong>USD pairs</strong> (EUR/USD, GBP/USD, XAUUSD, NASDAQ): React to US data (NFP, CPI, FOMC, GDP).<br/><br/><strong>GBP pairs:</strong> React to UK data (BOE, UK CPI, UK Employment) AND US data.<br/><br/><strong>JPY pairs:</strong> React to BOJ, Japanese GDP, AND US data heavily.<br/><br/><strong>Commodity pairs</strong> (AUD, CAD, NZD): React to commodity prices, Chinese data, AND their own central banks.<br/><br/><strong>Gold:</strong> Reacts to EVERYTHING — US data, geopolitical risk, USD strength, real yields. The most sensitive instrument to macro events.' },
];

const deviationRules = [
  { range: 'In-Line (±0.1%)', reaction: 'Minimal. 5-15 pip move. Often the press conference or forward guidance matters more.', action: 'Trade normally. Focus on language and tone, not the number.', color: '#26A69A' },
  { range: 'Mild Surprise (±0.1-0.3%)', reaction: 'Moderate. 20-50 pip move. Direction usually clear within 5-10 minutes.', action: 'Wait 10 mins for settle. Then trade the confirmed direction with normal risk.', color: '#FFB300' },
  { range: 'Big Surprise (±0.3-0.5%)', reaction: 'Significant. 50-100 pip move. Spreads widen 3-5x. Stops may slip.', action: 'Wait 15 mins minimum. Reduced risk on first entry. Watch for partial reversal.', color: '#EF5350' },
  { range: 'Shock (>±0.5%)', reaction: 'Violent. 100-250 pip move. Spreads 5-15x. Multiple false reversals.', action: 'Wait 30-60 mins. First move often partially reverses. Enter on the second wave.', color: '#EF5350' },
];

const commonMistakes = [
  { title: 'Only Checking on the Day', mistake: 'You open your charts Monday morning and discover NFP is Friday. But you didn’t plan for Wednesday’s CPI.', fix: 'Check the FULL week on Sunday. Every high-impact event mapped before a single trade is taken.' },
  { title: 'Treating Forecast as Fact', mistake: '“Forecast is +180K so it’ll be around there.” The forecast is WRONG more often than it’s right. It’s a guess, not a guarantee.', fix: 'Forecast tells you what’s priced in. Actual tells you what happened. The gap is what you manage.' },
  { title: 'Trading Through Every Event', mistake: '“I’ll just widen my stop.” A 30-pip stop doesn’t help when Gold moves $25 in 4 seconds with 15-pip spreads.', fix: 'High-impact events: flatten. Period. Your edge doesn’t exist during these moments.' },
  { title: 'Ignoring the Calendar Completely', mistake: '“I’m a technical trader, fundamentals don’t matter.” Level 8.1 proved this wrong with data.', fix: 'Spending 3 minutes on the calendar saves you from blowing a week of profits on one avoidable news trade.' },
];

const quizQuestions = [
  { q: 'NFP forecast is +180K. Actual is +175K. The market reaction will likely be:', opts: ['Massive — 175K is a lot of jobs', 'Minimal — the deviation of -5K is tiny, already priced in', 'Bearish for USD — it missed the forecast', 'Unpredictable — no way to assess'], correct: 1, explain: 'A 5K deviation is essentially in-line. The market had already priced in “around 180K.” The reaction will be minimal — likely 5-15 pips. The press language or wage data may matter more.' },
  { q: 'CPI forecast is 3.2%. Actual comes in at 3.8%. This is:', opts: ['In-line — both are around 3%', 'A shock deviation (+0.6%) — expect 100+ pip moves and extreme spread widening', 'Slightly above — minor impact', 'Irrelevant — CPI doesn’t matter'], correct: 1, explain: 'A +0.6% deviation on CPI is enormous. This signals much hotter inflation than expected, will shift rate expectations dramatically, and can move EUR/USD 80-120 pips with spreads widening 5-10x.' },
  { q: 'The best time to check the economic calendar is:', opts: ['Monday morning before trading', 'Sunday evening — map the full week before any trades are taken', '5 minutes before each release', 'You don’t need to — just trade the technicals'], correct: 1, explain: 'Sunday planning is non-negotiable. You map every high-impact event for the week, note which affect your instruments, and build your risk plan BEFORE the week starts.' },
  { q: 'You trade EUR/USD and XAUUSD. Which event does NOT directly affect both?', opts: ['US CPI', 'NFP', 'BOE Rate Decision', 'FOMC'], correct: 2, explain: 'BOE primarily affects GBP pairs. While there can be indirect USD effects, BOE is not a direct driver for EUR/USD or Gold. CPI, NFP, and FOMC all directly impact both instruments through USD.' },
  { q: 'FOMC decision matches forecast (rates held). The market barely moves. Then during the press conference, EUR/USD drops 60 pips. Why?', opts: ['The decision was wrong', 'The press conference language was more hawkish than expected — tone and guidance matter more than the rate itself', 'Random noise', 'Algorithm error'], correct: 1, explain: 'Rate decisions are often priced in weeks before. The real information comes from the language: “inflation remains elevated” (hawkish) vs “inflation is moderating” (dovish). Forward guidance moves markets more than the decision.' },
  { q: 'You have an open XAUUSD long at +1.2R. CPI releases in 25 minutes. Best action:', opts: ['Hold — you’re in profit', 'Close and lock in +1.2R. Re-evaluate after CPI settles.', 'Set stop to breakeven', 'Add to the position before the move'], correct: 1, explain: '+1.2R is real profit. CPI can move Gold $15-25 in seconds. A hot CPI print would wipe your profit and push you negative. Lock it in and re-enter after the settle.' },
  { q: 'What does “priced in” mean?', opts: ['The broker has set the price', 'The market has already adjusted to reflect the expected outcome — only deviations from expectation cause movement', 'The event doesn’t matter', 'Traders are waiting to react'], correct: 1, explain: 'If the market expects a rate hold, prices have already adjusted for that outcome. The hold itself won’t move markets. Only a surprise (deviation from consensus) creates new information that requires repricing.' },
  { q: 'PPI releases Tuesday. CPI releases Wednesday. Why does PPI matter for your Wednesday plan?', opts: ['PPI and CPI are the same thing', 'PPI is a leading indicator for CPI — a hot PPI makes a hot CPI more likely, which pre-positions the market', 'PPI doesn’t matter', 'Only if you trade commodities'], correct: 1, explain: 'PPI measures producer prices which flow through to consumer prices. A hot PPI on Tuesday shifts market expectations for Wednesday’s CPI, potentially front-running the move and changing the “priced in” consensus.' },
];

const gameRounds = [
  { scenario: '<strong>Sunday evening.</strong> You scan the calendar. This week: PMI Monday, CPI Wednesday 13:30, FOMC Wednesday 19:00, NFP Friday 13:30. You trade EUR/USD in the London session (07:00–16:00 UTC).', options: [
    { text: 'Normal trading all week — London session ends before most US releases.', correct: false, explain: '✗ CPI at 13:30 falls WITHIN your London session. FOMC at 19:00 is after, but the pre-positioning volatility starts earlier. NFP at 13:30 on Friday is also in your session.' },
    { text: 'Monday/Tuesday: normal. Wednesday: reduced risk AM, flatten by 13:00. Thursday: normal. Friday: flatten by 13:00.', correct: true, explain: '✓ Correct. You identified that CPI and NFP both fall within your session. Wednesday needs early risk reduction. Thursday is clear. Friday needs same protection as Wednesday.' },
    { text: 'Skip the entire week — too many events.', correct: false, explain: '✗ Monday, Tuesday, and Thursday are all tradeable. Skipping 3 clean days because of 2 event days is leaving money on the table.' },
  ]},
  { scenario: '<strong>Wednesday 13:30 UTC.</strong> CPI just released. Forecast: 3.2%. Actual: 3.2%. Exactly in-line. EUR/USD moves 8 pips then settles. Your setup still looks valid.', options: [
    { text: 'Enter immediately — in-line means no disruption.', correct: false, explain: '✗ Spreads are still elevated for 5-10 minutes after any release, even in-line. And FOMC is at 19:00 today — you’re entering a trade with another Tier 1 event hours away.' },
    { text: 'Enter with reduced risk. CPI was in-line, but FOMC is at 19:00 — close the trade before 18:30 regardless.', correct: true, explain: '✓ Smart. CPI in-line clears the immediate risk, but FOMC tonight means any new trade has a hard expiry time. Reduced risk + early close = controlled exposure.' },
    { text: 'Skip entirely — FOMC tonight means no trading at all today.', correct: false, explain: '✗ You have ~5 hours between CPI settle and pre-FOMC risk. That’s tradeable with a clear exit time. Don’t waste a clear window.' },
  ]},
  { scenario: '<strong>Friday 13:30 UTC.</strong> NFP just released. Forecast: +180K. Actual: +340K. Massive beat. USD surges. EUR/USD drops 75 pips in 3 minutes. Your pre-session analysis was bullish EUR/USD.', options: [
    { text: 'Buy the dip — my analysis says bullish and this is a huge discount.', correct: false, explain: '✗ Your morning analysis didn’t include a +160K deviation. The macro environment just shifted. Hot jobs = Fed stays hawkish = USD strength. Your bullish thesis is invalidated.' },
    { text: 'Wait 15-30 minutes. Then reassess: your bullish thesis is likely invalidated by hot NFP. Look for SHORT setups instead.', correct: true, explain: '✓ Correct sequence: (1) Wait for settle. (2) Acknowledge the deviation invalidates your prior bias. (3) Rebuild bias using the new information. Hot NFP = USD bullish = EUR/USD bearish.' },
    { text: 'Short EUR/USD right now — the direction is clear.', correct: false, explain: '✗ Right direction, wrong timing. Spreads are still 5-8x normal 3 minutes after release. Your fill will be terrible and the initial spike partially reverses 68% of the time.' },
  ]},
  { scenario: '<strong>Thursday 13:30 UTC.</strong> PPI released: 3.6% vs 3.2% forecast — a hot print. Tomorrow is CPI at 13:30. You’re currently flat with no positions. Your plan was to trade normally tomorrow morning.', options: [
    { text: 'Trade normally tomorrow — PPI is a separate event.', correct: false, explain: '✗ PPI is a LEADING indicator for CPI. Hot PPI significantly increases the probability of a hot CPI tomorrow. The market is already repositioning tonight.' },
    { text: 'Adjust tomorrow’s plan: expect elevated volatility pre-CPI. Reduce morning position sizes. Flatten by 13:00.', correct: true, explain: '✓ Hot PPI pre-loads CPI expectations. Tomorrow’s session will have extra tension. Reduce risk in the morning and be flat well before 13:30. The market may also front-run the expected hot CPI overnight.' },
    { text: 'Go short USD tonight — hot PPI means the move is already done.', correct: false, explain: '✗ Hot PPI is USD BULLISH (higher inflation = higher rates). And the CPI reaction tomorrow could add fuel. Going short tonight is fighting the data.' },
  ]},
  { scenario: '<strong>Pre-session Monday.</strong> You check the calendar: nothing high-impact until Wednesday. Your EUR/USD setup from the weekend analysis shows a clean BOS + OB pullback forming on the 4H.', options: [
    { text: 'Trade it with full conviction. No event risk for 48 hours. This is where your edge lives.', correct: true, explain: '✓ Perfect. This is exactly the kind of clear macro window where technical setups have their statistical edge. No events, clean structure, full conviction. This is what calendar awareness enables.' },
    { text: 'Reduce risk anyway — can never be too careful.', correct: false, explain: '✗ Over-caution on clean days costs you money. The whole point of checking the calendar is to KNOW when to trade full size. Monday and Tuesday are green lights.' },
    { text: 'Wait for closer to Wednesday to see if the setup is still valid.', correct: false, explain: '✗ The setup is valid NOW with no event risk. By Wednesday, it may have played out without you. Don’t wait for risk when the window is currently clear.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function EconomicCalendarPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Calendar Planner
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [planGenerated, setPlanGenerated] = useState(false);
  const togglePair = (p: string) => { setSelectedPairs(prev => prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 4 ? [...prev, p] : prev); setPlanGenerated(false); };
  const toggleSession = (s: string) => { setSelectedSessions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); setPlanGenerated(false); };
  const relevantEvents = weeklyEvents.filter(evt => evt.affects.some(a => selectedPairs.includes(a)));
  const getDayAction = (day: string): { action: string; color: string } => {
    const dayEvents = relevantEvents.filter(e => e.day === day);
    if (dayEvents.some(e => e.impact === 'high')) return { action: 'FLATTEN before release', color: '#EF5350' };
    if (dayEvents.some(e => e.impact === 'med')) return { action: 'REDUCE risk 50%', color: '#FFB300' };
    if (dayEvents.length > 0) return { action: 'AWARE — trade normally', color: '#26A69A' };
    return { action: 'CLEAR — full conviction', color: '#26A69A' };
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
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 8</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 2</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The Economic<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Calendar</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Your weekly danger map. Three minutes every Sunday saves you from blowing a month of profits on one avoidable news trade.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">📅 The Pilot&rsquo;s Flight Plan</p>
            <p className="text-gray-400 leading-relaxed mb-4">A pilot doesn&rsquo;t take off and <em>then</em> check for thunderstorms. The weather briefing happens <strong className="text-amber-400">before the engine starts</strong>. The economic calendar is your weather briefing. It tells you exactly when turbulence is expected, how severe it will be, and whether you should reroute or stay on the ground.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-white">3 minutes on Sunday = an entire week of clarity.</strong> You know which days to trade aggressively, which to be cautious, and which to sit out entirely.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Traders who check the calendar weekly: <strong className="text-green-400">average 2.1 fewer losing trades per month from avoidable news hits</strong>. At 1% risk per trade, that’s <strong className="text-green-400">2.1% saved monthly</strong> — worth <strong className="text-white">&pound;2,520/year on a &pound;10K account</strong>. Just from checking a free website for 3 minutes on Sunday.</p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Trading Week</p><h2 className="text-2xl font-extrabold mb-4">Events Drive the Rhythm</h2><p className="text-gray-400 text-sm mb-6">Every week has a shape. Learn to read it before Monday.</p><WeeklyEventStripAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Deviation Is Everything</p><h2 className="text-2xl font-extrabold mb-4">Markets React to Surprise, Not the Number</h2><p className="text-gray-400 text-sm mb-6">Forecast vs Actual. The gap determines the reaction.</p><DeviationMeterAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Calendar Anatomy</p><h2 className="text-2xl font-extrabold mb-4">How to Read It Like a Pro</h2><div className="space-y-3">{calendarAnatomy.map((item, i) => (<div key={i}><button onClick={() => toggle(`ca-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ca-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ca-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Deviation Zones</p><h2 className="text-2xl font-extrabold mb-4">How Big Is the Surprise?</h2><div className="p-6 rounded-2xl glass-card space-y-3">{deviationRules.map(item => (<div key={item.range} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.range}</p><p className="text-[11px] text-gray-400 mb-1"><strong className="text-gray-300">Reaction:</strong> {item.reaction}</p><p className="text-[11px] text-green-400"><strong>Action:</strong> {item.action}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Weekly Calendar Planner */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Weekly Calendar Planner</h2><p className="text-gray-400 text-sm mb-6">Select your instruments and sessions. Get a personalised weekly risk plan.</p>
      <div className="p-6 rounded-2xl glass-card space-y-5">
        <div><p className="text-xs font-bold text-gray-300 mb-2">Your Instruments (max 4)</p><div className="flex flex-wrap gap-2">{availablePairs.map(p => (<button key={p} onClick={() => togglePair(p)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${selectedPairs.includes(p) ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{p}</button>))}</div></div>
        <div><p className="text-xs font-bold text-gray-300 mb-2">Your Sessions</p><div className="flex flex-wrap gap-2">{availableSessions.map(s => (<button key={s} onClick={() => toggleSession(s)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${selectedSessions.includes(s) ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{s}</button>))}</div></div>
        {selectedPairs.length > 0 && selectedSessions.length > 0 && !planGenerated && (<button onClick={() => setPlanGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Generate Weekly Plan &rarr;</button>)}
        {planGenerated && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"><p className="text-xs font-bold text-amber-400 mb-1">YOUR WEEKLY PLAN</p><p className="text-[10px] text-gray-400">Instruments: {selectedPairs.join(', ')} | Sessions: {selectedSessions.map(s => s.split(' (')[0]).join(', ')}</p></div>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => { const dayEvts = relevantEvents.filter(e => e.day === day); const dayAct = getDayAction(day); return (<div key={day} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between mb-2"><p className="text-sm font-bold text-white">{day}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: dayAct.color + '20', color: dayAct.color }}>{dayAct.action}</span></div>
            {dayEvts.length === 0 ? (<p className="text-xs text-gray-500">No events affecting your instruments. Full conviction.</p>) : (<div className="space-y-1.5">{dayEvts.map((evt, i) => (<div key={i} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${evt.impact === 'high' ? 'bg-red-500' : evt.impact === 'med' ? 'bg-amber-500' : 'bg-green-500'}`} /><span className="text-xs text-gray-300 font-semibold">{evt.time} UTC</span><span className="text-xs text-gray-400">{evt.name}</span><span className="text-[10px] text-gray-500 ml-auto">{evt.impact.toUpperCase()}</span></div>))}<p className="text-[10px] text-gray-500 mt-2 italic">{dayEvts[0]?.action}</p></div>)}
          </div>); })}
          <button onClick={() => setPlanGenerated(false)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Change Instruments</button>
        </motion.div>)}
        {(selectedPairs.length === 0 || selectedSessions.length === 0) && (<p className="text-xs text-gray-600 text-center">Select at least 1 instrument and 1 session to generate your plan.</p>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Sunday Ritual</p><h2 className="text-2xl font-extrabold mb-4">Your 3-Minute Calendar Check</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">STEP 1 (30 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Open Forex Factory or TradingView calendar. Filter by HIGH and MEDIUM impact.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">STEP 2 (60 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Mark which events affect YOUR instruments. Ignore events for pairs you don’t trade.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#8b5cf6]">STEP 3 (60 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Label each day: GREEN (no events), AMBER (medium — reduce risk), RED (high — flatten).</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">STEP 4 (30 sec)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Write it down. Pin it next to your screen. Refer to it every morning before pre-session routine.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Calendar Resources</p><h2 className="text-2xl font-extrabold mb-4">Where to Get Your Data</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#f59e0b]">FOREX FACTORY</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">forexfactory.com/calendar — The gold standard. Filter by impact. Customise timezone. Free.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">TRADINGVIEW</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Built-in economic calendar on the platform. Convenient if you’re already charting. Filter by country.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">INVESTING.COM</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">investing.com/economic-calendar — Detailed historical data. Shows previous, forecast, and actual for past releases.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Use ONE source consistently. Don’t switch between 3 calendars. Pick one and master it.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Calendar Errors That Cost Money</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Calendar Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">DEVIATION RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Forecast vs Actual gap = volatility. In-line = calm. Surprise = chaos. Shock = untradeable.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">SUNDAY RITUAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">3 minutes. Scan the week. Label days: GREEN / AMBER / RED. Pin it to your desk.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">PPI → CPI LINK</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Hot PPI often means hot CPI the next day. Adjust Wednesday’s plan based on Tuesday’s data.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#3b82f6]">PRICED IN</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The forecast IS the market’s position. Only deviations from forecast create new moves.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Trade aggressively on GREEN days. Reduce on AMBER. Flatten on RED. 3 mins of planning = 3 fewer blown trades per month.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Calendar Navigation Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Navigate the weekly calendar like a pro.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent — you can navigate any trading week with confidence.' : gameScore >= 3 ? 'Good — review the PPI→CPI link and deviation responses.' : 'Re-read the calendar anatomy and deviation zones before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📅</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: The Economic Calendar</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Calendar Commander &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
