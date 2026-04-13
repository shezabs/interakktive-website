// app/academy/lesson/sentiment-positioning/page.tsx
// ATLAS Academy — Lesson 8.13: Sentiment & Positioning [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 8
// GROUNDBREAKING: Sentiment Consensus Board — 5 inputs, confirm/contradict verdict
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
// ANIMATION 1: COT Position Bars — Commercial vs Large Spec vs Retail
// ============================================================
function COTPositionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('COT Report — Who Is Positioned Where?', cx, 16);
    const scenarios = [
      { pair: 'EUR/USD', commercial: -65, largeSpec: 55, retail: 72, signal: 'Retail 72% LONG → Contrarian: BEARISH EUR', color: '#EF5350' },
      { pair: 'XAUUSD', commercial: -30, largeSpec: 80, retail: 68, signal: 'Large Specs + Retail both LONG → Crowded: CAUTION', color: '#FFB300' },
      { pair: 'USD/JPY', commercial: 40, largeSpec: -55, retail: -78, signal: 'Retail 78% SHORT → Contrarian: BULLISH USD/JPY', color: '#26A69A' },
    ];
    const activeIdx = Math.floor((t % 12) / 4) % 3; const sc = scenarios[activeIdx];
    const barY = 45; const barH = 30; const maxBarW = w * 0.35; const centerX = cx;
    const groups = [
      { label: 'COMMERCIALS', value: sc.commercial, desc: 'Hedgers (banks, corps)', y: barY },
      { label: 'LARGE SPECS', value: sc.largeSpec, desc: 'Funds, institutions', y: barY + barH + 18 },
      { label: 'RETAIL', value: sc.retail, desc: 'Individual traders', y: barY + (barH + 18) * 2 },
    ];
    // Pair label
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(sc.pair, cx, 36);
    // Centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(centerX, barY - 5); ctx.lineTo(centerX, barY + (barH + 18) * 3 - 15); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '6px system-ui';
    ctx.fillText('SHORT', centerX - maxBarW / 2, barY - 8);
    ctx.fillText('LONG', centerX + maxBarW / 2, barY - 8);
    groups.forEach(g => {
      const barW = (Math.abs(g.value) / 100) * maxBarW;
      const isLong = g.value > 0;
      const bx = isLong ? centerX : centerX - barW;
      const color = isLong ? '#26A69A' : '#EF5350';
      // Bar
      ctx.fillStyle = color + '30'; ctx.beginPath(); ctx.roundRect(bx, g.y, barW, barH, 4); ctx.fill();
      ctx.strokeStyle = color + '60'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, g.y, barW, barH, 4); ctx.stroke();
      // Value
      ctx.fillStyle = color; ctx.font = 'bold 10px system-ui';
      ctx.textAlign = isLong ? 'left' : 'right';
      ctx.fillText(`${g.value > 0 ? '+' : ''}${g.value}%`, isLong ? centerX + barW + 5 : centerX - barW - 5, g.y + barH / 2 + 4);
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px system-ui';
      ctx.textAlign = isLong ? 'right' : 'left';
      ctx.fillText(g.label, isLong ? centerX - 5 : centerX + 5, g.y + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '6px system-ui';
      ctx.fillText(g.desc, isLong ? centerX - 5 : centerX + 5, g.y + 22);
    });
    // Signal
    ctx.fillStyle = sc.color; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(sc.signal, cx, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Retail Sentiment Contrarian Gauge
// ============================================================
function RetailSentimentGauge() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.003; const cx = w / 2; const cy = h * 0.48;
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Retail Sentiment — When the Crowd Is Wrong', cx, 16);
    const R = Math.min(w * 0.3, h * 0.32);
    // Gauge arc
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 22; ctx.stroke();
    // Colour zones
    const zones = [
      { start: 0, end: 0.25, color: '#26A69A', label: 'EXTREME\nSHORT' },
      { start: 0.25, end: 0.4, color: '#26A69A40' },
      { start: 0.4, end: 0.6, color: '#6b728040' },
      { start: 0.6, end: 0.75, color: '#EF535040' },
      { start: 0.75, end: 1.0, color: '#EF5350', label: 'EXTREME\nLONG' },
    ];
    zones.forEach(z => { ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI + z.start * Math.PI, Math.PI + z.end * Math.PI); ctx.strokeStyle = z.color; ctx.lineWidth = 20; ctx.stroke(); });
    // Labels
    ctx.fillStyle = '#26A69A'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('EXTREME SHORT', cx - R - 5, cy + 12);
    ctx.fillStyle = '#EF5350'; ctx.textAlign = 'left';
    ctx.fillText('EXTREME LONG', cx + R + 5, cy + 12);
    // Animated needle
    const readings = [0.72, 0.35, 0.82, 0.55, 0.18];
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAUUSD', 'AUD/USD'];
    const activeIdx = Math.floor((t % 15) / 3) % 5;
    const reading = readings[activeIdx];
    const needleAngle = Math.PI + reading * Math.PI;
    const pulse = Math.sin(t * 4) * 0.02;
    const nx = cx + Math.cos(needleAngle + pulse) * (R - 5);
    const ny = cy + Math.sin(needleAngle + pulse) * (R - 5);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
    ctx.strokeStyle = reading > 0.7 ? '#EF5350' : reading < 0.3 ? '#26A69A' : '#FFB300';
    ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = reading > 0.7 ? '#EF5350' : reading < 0.3 ? '#26A69A' : '#FFB300'; ctx.fill();
    // Reading info
    const pctLong = Math.round(reading * 100);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px system-ui';
    ctx.fillText(`${pctLong}% LONG`, cx, cy + 30);
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px system-ui';
    ctx.fillText(pairs[activeIdx], cx, cy + 46);
    const contrarian = pctLong > 70 ? 'CONTRARIAN: BEARISH' : pctLong < 30 ? 'CONTRARIAN: BULLISH' : 'NEUTRAL — no signal';
    const cColor = pctLong > 70 ? '#EF5350' : pctLong < 30 ? '#26A69A' : '#6b7280';
    ctx.fillStyle = cColor; ctx.font = 'bold 9px system-ui';
    ctx.fillText(contrarian, cx, cy + 62);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '7px system-ui';
    ctx.fillText('When 70%+ of retail is one side, the market often reverses. Be the contrarian.', cx, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// SENTIMENT CONSENSUS BOARD DATA
// ============================================================
interface SentInput { key: string; label: string; icon: string; options: { value: string; label: string; bullScore: number; bearScore: number; extreme: boolean }[]; }
const sentInputs: SentInput[] = [
  { key: 'cot', label: 'COT Large Spec Positioning', icon: '📜', options: [{ value: 'extreme_long', label: 'Extreme net long', bullScore: -1, bearScore: 2, extreme: true }, { value: 'long', label: 'Moderately net long', bullScore: 0, bearScore: 1, extreme: false }, { value: 'neutral', label: 'Near neutral', bullScore: 0, bearScore: 0, extreme: false }, { value: 'short', label: 'Moderately net short', bullScore: 1, bearScore: 0, extreme: false }, { value: 'extreme_short', label: 'Extreme net short', bullScore: 2, bearScore: -1, extreme: true }] },
  { key: 'retail', label: 'Retail Sentiment', icon: '👥', options: [{ value: 'extreme_long', label: '>70% long', bullScore: -2, bearScore: 2, extreme: true }, { value: 'long', label: '55–70% long', bullScore: -1, bearScore: 1, extreme: false }, { value: 'balanced', label: '45–55% (balanced)', bullScore: 0, bearScore: 0, extreme: false }, { value: 'short', label: '55–70% short', bullScore: 1, bearScore: -1, extreme: false }, { value: 'extreme_short', label: '>70% short', bullScore: 2, bearScore: -2, extreme: true }] },
  { key: 'vix', label: 'VIX (Fear Index)', icon: '📉', options: [{ value: 'low', label: 'Below 15 (complacent)', bullScore: -1, bearScore: 1, extreme: true }, { value: 'normal', label: '15–20 (normal)', bullScore: 0, bearScore: 0, extreme: false }, { value: 'elevated', label: '20–30 (elevated)', bullScore: 1, bearScore: -1, extreme: false }, { value: 'extreme', label: 'Above 30 (panic)', bullScore: 2, bearScore: -2, extreme: true }] },
  { key: 'putcall', label: 'Put/Call Ratio', icon: '📊', options: [{ value: 'low', label: '<0.7 (bullish excess)', bullScore: -1, bearScore: 1, extreme: true }, { value: 'normal', label: '0.7–1.0 (normal)', bullScore: 0, bearScore: 0, extreme: false }, { value: 'elevated', label: '1.0–1.3 (hedging)', bullScore: 1, bearScore: -1, extreme: false }, { value: 'extreme', label: '>1.3 (extreme fear)', bullScore: 2, bearScore: -2, extreme: true }] },
  { key: 'buzz', label: 'Social Media / News Buzz', icon: '📢', options: [{ value: 'euphoria', label: 'Euphoric — “can’t lose”', bullScore: -2, bearScore: 2, extreme: true }, { value: 'bullish', label: 'Generally bullish', bullScore: -1, bearScore: 1, extreme: false }, { value: 'mixed', label: 'Mixed / no consensus', bullScore: 0, bearScore: 0, extreme: false }, { value: 'fearful', label: 'Generally fearful', bullScore: 1, bearScore: -1, extreme: false }, { value: 'panic', label: 'Panic — “market is crashing”', bullScore: 2, bearScore: -2, extreme: true }] },
];

const getSentimentVerdict = (bullScore: number, bearScore: number, extremeCount: number): { verdict: string; color: string; desc: string; action: string } => {
  const net = bullScore - bearScore;
  if (extremeCount >= 3) return { verdict: 'EXTREME CONSENSUS — MAJOR CONTRARIAN ALERT', color: '#EF5350', desc: '3+ indicators at extremes. The crowd is overwhelmingly positioned one way. Historically, this is when reversals begin. Maximum contrarian signal.', action: 'If your technical bias AGREES with the crowd: REDUCE size or skip. You’re joining a crowded trade. If your technical bias is OPPOSITE the crowd: increase conviction — you have contrarian wind at your back.' };
  if (extremeCount >= 2) return { verdict: 'ELEVATED CONSENSUS — CONTRARIAN LEAN', color: '#FFB300', desc: '2 indicators at extremes. The crowd is leaning heavily. Not guaranteed reversal, but the risk of a crowded-trade unwind is elevated.', action: 'Trade with awareness. If joining the crowd, reduce size. If going against the crowd, this supports your thesis. Monitor for the unwind trigger.' };
  if (net > 3) return { verdict: 'SENTIMENT LEANS BULLISH (contrarian bearish)', color: '#EF5350', desc: 'Multiple indicators suggest bullish positioning. From a contrarian perspective, this is mildly bearish — too many buyers already in.', action: 'Bearish technical setups get a sentiment boost. Bullish setups are fighting a positioning headwind. Not extreme enough to override technicals alone.' };
  if (net < -3) return { verdict: 'SENTIMENT LEANS BEARISH (contrarian bullish)', color: '#26A69A', desc: 'Multiple indicators suggest bearish positioning or fear. From a contrarian perspective, this is mildly bullish — sellers are exhausted.', action: 'Bullish technical setups get a sentiment boost. Bearish setups are fighting a contrarian headwind.' };
  return { verdict: 'NO STRONG SIGNAL — NEUTRAL', color: '#6b7280', desc: 'Sentiment is balanced or mixed. No contrarian signal. Indicators don’t agree. This is the majority of the time — and that’s fine.', action: 'Trade your technicals normally. Sentiment provides no additional edge today. Focus on macro and chart structure.' };
};

// ============================================================
// CONTENT DATA
// ============================================================
const sentimentSources = [
  { title: '📜 COT (Commitment of Traders)', desc: '<strong>What:</strong> Weekly CFTC report showing positioning of Commercials (hedgers), Large Speculators (funds), and Small Speculators (retail) in futures markets.<br/><br/><strong>Released:</strong> Friday afternoon for the previous Tuesday’s data. 3-day lag.<br/><br/><strong>How to read it:</strong> Large Spec positioning is the key. When Large Specs are at EXTREME net long, they’ve already bought. Who’s left to buy? Nobody. Reversal risk is maximum.<br/><br/><strong>The contrarian signal:</strong> Extreme Large Spec positioning has preceded every major currency reversal in the last 20 years. Not a timing tool — but a DIRECTION warning. Extreme long = bearish risk building. Extreme short = bullish risk building.<br/><br/><strong>Where to find it:</strong> CFTC.gov (raw data), TradingView COT indicator, various free COT analysis websites.' },
  { title: '👥 Retail Sentiment Indicators', desc: '<strong>What:</strong> Broker-reported data showing what percentage of retail traders are long vs short on each instrument.<br/><br/><strong>Where:</strong> IG Client Sentiment (most popular), Myfxbook, DailyFX Sentiment. Some brokers display this on their platforms.<br/><br/><strong>The contrarian logic:</strong> Retail traders are wrong at extremes. When 75% of retail is long EUR/USD, the pair tends to fall. Why? Because retail traders hold losers, add to losers, and the “crowd” represents exhausted demand — everyone who wanted to buy has already bought.<br/><br/><strong>The threshold:</strong> Below 60% or above 60% one side = no signal. Above 70% one side = contrarian alert. Above 80% = strong contrarian signal.<br/><br/><strong>Important:</strong> Retail sentiment is a FILTER, not a trigger. Don’t short just because retail is long. Use it to ADD or REDUCE conviction on setups you already have from technicals + macro.' },
  { title: '📉 VIX (Volatility Index) as Sentiment', desc: '<strong>What:</strong> Measures expected 30-day volatility of the S&P 500. Often called the “Fear Index.”<br/><br/><strong>Reading:</strong> Below 15 = extreme calm (complacency). 15–20 = normal. 20–30 = elevated fear. Above 30 = panic.<br/><br/><strong>The contrarian angle:</strong> VIX below 12–13 = maximum complacency. Everyone is fully invested and not hedging. This is when shocks hurt most. VIX above 35–40 = maximum fear. Everyone has sold or is hedged. This is when bottoms form.<br/><br/><strong>The nuance:</strong> VIX spikes are mean-reverting. VIX at 40 doesn’t stay at 40 — it drops back toward 15–20 as panic fades. The fade from extreme VIX is tradeable. But VIX at 12 CAN stay at 12 for months. Low VIX is a warning, not a timing signal.' },
  { title: '📢 Social Media &amp; News Buzz', desc: '<strong>What:</strong> The qualitative “feel” of financial social media, news headlines, and trader forums.<br/><br/><strong>Euphoria indicators:</strong> “Market can only go up.” FOMO everywhere. TikTok traders showing gains. New all-time highs celebrated as inevitable. This is the PEAK sentiment marker.<br/><br/><strong>Panic indicators:</strong> “This is 2008.” Crash predictions dominate. Fear is the only emotion. Mainstream media runs recession stories daily. This is the BOTTOM sentiment marker.<br/><br/><strong>The difficulty:</strong> Social buzz is the hardest sentiment indicator to quantify. It’s subjective. But the EXTREMES are obvious. When your barber tells you to buy Bitcoin or when taxi drivers discuss the market crash — those are genuine sentiment extremes.<br/><br/><strong>The rule:</strong> Use social buzz for extreme readings only. Ignore it during normal conditions. When sentiment is extreme, it’s the most powerful contrarian indicator available.' },
];

const contrarianRules = [
  { reading: 'Retail > 75% LONG', signal: 'CONTRARIAN BEARISH', why: 'Everyone who wanted to buy has bought. No new buyers. Price drops to find sellers. The “crowd is always wrong at extremes.”', action: 'Look for SHORT setups. This doesn’t mean short blindly — wait for a technical trigger that agrees with the contrarian signal.', color: '#EF5350' },
  { reading: 'Retail > 75% SHORT', signal: 'CONTRARIAN BULLISH', why: 'Everyone who wanted to sell has sold. No new sellers. Price rises to find buyers. The mirror image of the long extreme.', action: 'Look for LONG setups. Same principle — the contrarian signal adds conviction to a technical entry.', color: '#26A69A' },
  { reading: 'VIX > 35 + Retail panicking', signal: 'BOTTOM FORMING', why: 'Maximum fear = maximum selling already done. Institutions start accumulating. The bottom is a process that begins during peak fear.', action: 'Start building long equity/risk-on positions. Don’t try to catch the exact bottom — build gradually as fear fades and technicals confirm.', color: '#26A69A' },
  { reading: 'VIX < 13 + Euphoria', signal: 'TOP FORMING', why: 'Maximum complacency. Everyone is invested. No hedging. The slightest shock creates an outsized reaction because nobody is prepared.', action: 'Tighten ALL stops. Take partial profits. Don’t add to positions. The top could be weeks or months away — but when it comes, complacent traders get crushed.', color: '#EF5350' },
];

const commonMistakes = [
  { title: 'Trading ONLY on Sentiment', mistake: 'Retail is 78% long EUR/USD. You short immediately. No technical setup, no macro check, no trigger. Pure contrarian. EUR/USD continues rising for 2 weeks before reversing.', fix: 'Sentiment is a FILTER, not a trigger. It adds or reduces conviction on setups you already have. 78% long means shorts are HIGHER conviction when they appear — not that you should short NOW.' },
  { title: 'Ignoring Extreme Readings', mistake: '“Sentiment doesn’t work. I’m a pure technician.” Meanwhile, retail is 82% long and you enter a long. Your setup gets destroyed by the crowded-trade unwind.', fix: 'You don’t need to trade on sentiment. But EXTREME readings (>75% one side) should at minimum make you pause before joining the crowd. 2 minutes of checking saves you from joining the wrong side of a crowded trade.' },
  { title: 'Confusing COT with Real-Time Data', mistake: 'You use Friday’s COT report to enter a trade Monday morning. COT data is from the PREVIOUS Tuesday. It’s 6 days old. A lot can change in 6 days.', fix: 'COT is for DIRECTIONAL bias, not timing. Use it to confirm your weekly macro lean. Don’t use it as a trigger for specific entries. Combine with real-time retail sentiment for a more complete picture.' },
  { title: 'Fighting a Trend Because Sentiment Is Extreme', mistake: 'EUR/USD has been falling for 3 months. Retail is 80% long (contrarian bearish). You keep trying to buy because “it must reverse.” It falls another 300 pips.', fix: 'Extreme sentiment confirms EXISTING trends, not reversals. 80% retail long in a downtrend means retail is catching a falling knife. The reversal comes when the LAST retail buyer gives up and the sentiment SHIFTS — not when it’s at the extreme.' },
];

const quizQuestions = [
  { q: 'Retail traders are 78% long EUR/USD. From a contrarian perspective, this is:', opts: ['Bullish — if everyone is buying, price should go up', 'Bearish signal — extreme retail positioning (>70% one side) historically precedes reversals against the crowd', 'Meaningless — retail doesn’t move markets', 'Confirmation of the uptrend'], correct: 1, explain: 'When 78% of retail is long, most of the buying is done. No new buyers remain. This creates a bearish skew — any selling pressure finds no support. Historically, extreme retail positioning is a reliable contrarian indicator.' },
  { q: 'COT shows Large Speculators at extreme net long on EUR. This means:', opts: ['EUR will rise further — smart money is bullish', 'Crowded long position — hedge funds have already bought aggressively. If they start unwinding, EUR could drop sharply. Contrarian bearish warning.', 'Buy EUR immediately', 'COT data is useless'], correct: 1, explain: 'Large Specs at extreme net long = the buying is done. If these funds decide to take profit or the macro shifts, the unwind creates a sharp reversal. This is a WARNING, not a timing signal. The reversal could be days or weeks away.' },
  { q: 'VIX at 12 for 3 months. Social media: "stocks only go up." Put/Call ratio at 0.6 (low hedging). This combination signals:', opts: ['Strong bull market — enjoy it', 'Extreme complacency — nobody is hedging, everyone is fully invested. A shock will cause an outsized reaction. Contrarian warning: the top may be forming.', 'VIX at 12 is normal', 'Perfect time to add leverage'], correct: 1, explain: 'Low VIX + low put/call + euphoric social media = maximum complacency. This doesn’t mean crash tomorrow, but it means the market is VULNERABLE. Any negative surprise causes disproportionate panic because nobody is prepared.' },
  { q: 'Your technical analysis says long EUR/USD. Retail sentiment: 72% short EUR/USD. This means:', opts: ['Don’t take the trade — sentiment contradicts', 'INCREASE conviction. Your technical long is supported by contrarian sentiment — retail is heavily short, meaning the short side is crowded and vulnerable to a squeeze.', 'Reverse to short', 'Sentiment and technicals are unrelated'], correct: 1, explain: 'Retail 72% short = contrarian bullish. Your technical analysis says long. Both agree. This is the highest-conviction setup: technicals + contrarian sentiment aligned. The short squeeze adds fuel to your long entry.' },
  { q: 'When is retail sentiment MOST useful as a signal?', opts: ['Always', 'Only at extremes (>70% one side) — moderate readings (55-65%) provide no actionable signal', 'Only during news events', 'Only on Gold'], correct: 1, explain: 'Retail sentiment in the 55-65% range is noise. The contrarian edge ONLY appears at extremes. Above 70% long = contrarian bearish. Above 70% short = contrarian bullish. Below these thresholds, sentiment is just background information.' },
  { q: 'VIX spikes from 15 to 38 in one week. Retail is panicking. COT shows Large Specs reducing longs. The market is:', opts: ['Entering a long-term bear market', 'At or near a short-term bottom — maximum fear = maximum selling already done. VIX spikes are mean-reverting. Don’t buy at 38, but prepare for a recovery entry.', 'Random noise', 'Perfectly normal'], correct: 1, explain: 'VIX spikes are mean-reverting — they don’t sustain above 30 for long. Maximum fear (VIX 38 + retail panic + fund deleveraging) is the environment where bottoms form. Not the exact bottom, but the zone. Prepare for contrarian entry as fear fades.' },
  { q: 'The proper role of sentiment in your trading process is:', opts: ['Primary signal for entries', 'A FILTER that adds or reduces conviction on setups identified by macro + technicals. Not a trigger, not a replacement — an enhancer.', 'Replace technicals entirely', 'Check once a month'], correct: 1, explain: 'Sentiment sits alongside macro and technicals as the third pillar of complete market analysis. It’s not a signal generator — it’s a conviction modifier. Extreme sentiment makes good setups great (or bad setups dangerous).' },
  { q: 'EUR/USD has fallen 400 pips over 2 months. Retail is 82% long. A “contrarian” trader buys EUR/USD. This is:', opts: ['Smart — extreme sentiment means reversal', 'WRONG application. Extreme sentiment in a strong trend CONFIRMS the trend, not a reversal. 82% long means retail is catching a falling knife. The reversal comes when sentiment SHIFTS, not when it’s extreme.', 'Moderate risk', 'Guaranteed profit'], correct: 1, explain: 'Extreme retail positioning DURING a trend means retail is fighting the trend and losing. The contrarian signal says “don’t join the 82%.” It does NOT say “buy.” The reversal comes when retail GIVES UP (sentiment shifts from 82% long to 50% or below) — that’s the capitulation signal.' },
];

const gameRounds = [
  { scenario: '<strong>Your EUR/USD chart shows a bearish OB setup at OTE.</strong> Macro: neutral (no events today, DXY stable). You check retail sentiment: <strong>76% of retail is LONG EUR/USD.</strong> COT: Large Specs moderately net long.', options: [
    { text: 'Skip — retail is long, so price should go up.', correct: false, explain: '✗ You’re reading retail sentiment as confirmation instead of contrarian. 76% retail long is a BEARISH signal — the crowd is overextended. Your bearish technical setup is SUPPORTED by contrarian sentiment.' },
    { text: 'Take the short with increased conviction. Technicals say short + retail 76% long (contrarian bearish) = aligned signals. Full size, standard stop.', correct: true, explain: '✓ Perfect application. Your technical bearish setup gets a conviction boost from contrarian sentiment. 76% retail long means the long side is crowded and vulnerable to a selloff. Double alignment = higher probability.' },
    { text: 'Go long instead — follow the retail crowd.', correct: false, explain: '✗ Joining 76% retail long is joining the crowded side. Retail is wrong at extremes. Your own technical analysis said short. Sentiment confirms the short, not the long.' },
  ]},
  { scenario: '<strong>VIX: 11.5 (extreme low). Put/Call: 0.58 (extreme low hedging). Social media: euphoric.</strong> S&P at all-time highs. Your equity longs have been working for weeks. NASDAQ setup appears for another long entry.', options: [
    { text: 'Enter the NASDAQ long — everything is bullish.', correct: false, explain: '✗ VIX at 11.5 + put/call at 0.58 + euphoric social = TRIPLE extreme complacency. Adding long exposure at maximum complacency is when drawdowns begin. Not necessarily tomorrow, but the risk/reward has shifted dramatically against new longs.' },
    { text: 'SKIP the new long. Tighten stops on existing equity positions. Three sentiment extremes simultaneously = the market is at maximum vulnerability. Don’t add, protect.', correct: true, explain: '✓ Triple extreme complacency is the strongest contrarian warning. You don’t need to go short, but you absolutely should NOT add long exposure here. Tighten existing stops. Take partial profits. Wait for sentiment to normalise.' },
    { text: 'Sell everything — the crash is imminent.', correct: false, explain: '✗ Extreme complacency can persist for weeks or months. VIX at 11.5 doesn’t mean “crash tomorrow.” It means “vulnerable.” Tighten stops, don’t liquidate. The crash may not come for months — but when it does, you’re protected.' },
  ]},
  { scenario: '<strong>VIX just spiked to 36.</strong> Retail is panicking — selling everything. COT shows Large Specs have reduced longs. Headlines: “Worst selloff since 2020.” S&P down 8% in 2 weeks. Gold up $60.', options: [
    { text: 'Go maximum risk-off — the panic is justified.', correct: false, explain: '✗ The panic may have been justified 2 weeks ago. At VIX 36 with universal panic, the SELLING is largely done. Institutions are deleveraged. Retail has panic-sold. This is the environment where bottoms form, not where selling accelerates.' },
    { text: 'Begin building contrarian positions. VIX 36 + retail panic + fund deleveraging = peak fear zone. Don’t buy aggressively — build 25% size now, add as fear fades and technicals confirm.', correct: true, explain: '✓ Peak fear is where contrarian returns are generated. You don’t need to catch the exact bottom. Build gradually: 25% now, add when VIX drops below 28, full size when technicals confirm the trend change. Maximum fear = maximum future opportunity.' },
    { text: 'Buy everything at maximum size — this is the bottom.', correct: false, explain: '✗ VIX at 36 is the ZONE, not the exact bottom. It could go to 42 before turning. Full size immediately exposes you to further downside. Build gradually. Contrarian doesn’t mean reckless.' },
  ]},
  { scenario: '<strong>EUR/USD has been falling for 6 weeks.</strong> Retail sentiment: 81% LONG EUR/USD. COT: Large Specs turning net short. Your technical analysis shows bearish continuation — no reversal signals yet.', options: [
    { text: 'Buy EUR/USD — retail at 81% long means a reversal is imminent.', correct: false, explain: '✗ This is the most common contrarian mistake. 81% retail long in a 6-week downtrend means retail is catching a falling knife, not that a reversal is coming. The contrarian signal says “don’t join the 81%” — NOT “buy.”' },
    { text: 'Continue looking for SHORT setups. 81% retail long in a downtrend CONFIRMS the trend — retail is trapped long. The reversal comes when retail CAPITULATES (sentiment drops to 50% or below), not at the extreme.', correct: true, explain: '✓ Extreme retail positioning DURING a trend confirms the trend, not the reversal. Large Specs turning net short confirms institutional agreement. The bearish continuation is supported by technicals, COT, AND retail capitulation hasn’t happened yet.' },
    { text: 'Fade the downtrend with tight stops — 81% is too extreme to ignore.', correct: false, explain: '✗ 81% retail long during a strong downtrend can go to 85%, 88%, 90%. Extreme sentiment during trends PERSISTS until capitulation. Fading this with tight stops = repeated stop-outs as the trend continues.' },
  ]},
  { scenario: '<strong>Sentiment check before your session:</strong> COT: neutral positioning. Retail: 52% long (balanced). VIX: 17 (normal). Put/Call: 0.85 (normal). Social: mixed opinions. Your GBP/USD chart shows a bullish OB at OTE.', options: [
    { text: 'Skip — no sentiment signal means no edge.', correct: false, explain: '✗ Neutral sentiment doesn’t mean no edge — it means sentiment provides no additional information today. Your edge comes from technicals and macro, which are independent. Neutral sentiment = trade normally.' },
    { text: 'Trade the setup normally. Sentiment is neutral — no contrarian boost, no contrarian headwind. Your conviction comes from technicals + macro. This is the majority of trading days.', correct: true, explain: '✓ Most days, sentiment is neutral. That’s fine. Sentiment is only actionable at extremes. On neutral days, your standard macro + technical process drives the decision. The setup stands on its own merits.' },
    { text: 'Wait until sentiment gives a signal before entering.', correct: false, explain: '✗ If you waited for extreme sentiment before every trade, you’d trade 3-4 times per MONTH. Sentiment extremes are rare. Normal sentiment = trade your normal process. Sentiment is a bonus filter, not a prerequisite.' },
  ]},
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SentimentPositioningPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  // Sentiment Consensus Board
  const [sentValues, setSentValues] = useState<Record<string, string>>({});
  const [sentGenerated, setSentGenerated] = useState(false);
  const allSentFilled = sentInputs.every(s => sentValues[s.key]);
  const sentResult = (() => {
    if (!allSentFilled) return null;
    let bull = 0; let bear = 0; let extremes = 0;
    sentInputs.forEach(input => {
      const opt = input.options.find(o => o.value === sentValues[input.key]);
      if (opt) { bull += opt.bullScore; bear += opt.bearScore; if (opt.extreme) extremes++; }
    });
    return getSentimentVerdict(bull, bear, extremes);
  })();

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 8 &middot; Lesson 13</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Sentiment &amp;<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Positioning</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">When everyone agrees, the market is about to disagree. Learn to read what the crowd is doing &mdash; and why doing the opposite at extremes is one of the most powerful edges in trading.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">🎪 The Crowded Theatre</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine a theatre where <strong className="text-amber-400">everyone is sitting on one side</strong>. The floor is stable — until someone shouts “fire.” Then everyone rushes to the same exit at the same time. The stampede is worse than the fire ever was.</p>
            <p className="text-gray-400 leading-relaxed">Financial markets work the same way. When 80% of retail traders are long a pair, the <strong className="text-white">buying is done</strong>. Any selling pressure triggers a cascade as everyone runs for the exit simultaneously. <strong className="text-white">The crowd creates the reversal by being the crowd.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">Q4 2023, EUR/USD. Retail sentiment: <strong className="text-red-400">78% long</strong>. Large Specs: net long at 3-year extreme. Social media: “EUR/USD to 1.15!” <strong className="text-white">EUR/USD dropped 350 pips over the next 6 weeks.</strong> The crowded long unwound. Traders who read the sentiment and traded with a bearish bias: <strong className="text-green-400">captured the move from the right side.</strong></p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Who Is Positioned Where?</p><h2 className="text-2xl font-extrabold mb-4">COT: Commercials, Funds &amp; Retail</h2><p className="text-gray-400 text-sm mb-6">The Commitment of Traders report shows institutional and retail positioning side by side.</p><COTPositionAnimation /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Contrarian Gauge</p><h2 className="text-2xl font-extrabold mb-4">When 70%+ of Retail Is One Side</h2><p className="text-gray-400 text-sm mb-6">Extreme retail positioning is the most accessible contrarian signal available.</p><RetailSentimentGauge /></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 4 Sentiment Sources</p><h2 className="text-2xl font-extrabold mb-4">COT, Retail, VIX &amp; Social Buzz</h2><div className="space-y-3">{sentimentSources.map((item, i) => (<div key={i}><button onClick={() => toggle(`ss-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`ss-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`ss-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} /></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Contrarian Rules</p><h2 className="text-2xl font-extrabold mb-4">When to Fade the Crowd</h2><div className="p-6 rounded-2xl glass-card space-y-3">{contrarianRules.map(item => (<div key={item.reading} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><div className="flex items-center justify-between mb-1"><p className="text-[11px] font-bold text-gray-300">{item.reading}</p><span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: item.color + '20', color: item.color }}>{item.signal}</span></div><p className="text-[11px] text-gray-500 mb-1">{item.why}</p><p className="text-[10px] font-semibold" style={{ color: item.color }}>{item.action}</p></div>))}</div></motion.div></section>

      {/* S05 — GROUNDBREAKING: Sentiment Consensus Board */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Challenge</p><h2 className="text-2xl font-extrabold mb-2">Sentiment Consensus Board</h2><p className="text-gray-400 text-sm mb-6">Input 5 sentiment readings. Get an overall verdict: confirming or contradicting your technical bias, with a contrarian alert at extremes.</p>
      <div className="p-6 rounded-2xl glass-card space-y-4">
        {!sentGenerated ? (<><div className="space-y-3">{sentInputs.map(input => (<div key={input.key}><p className="text-xs font-bold text-gray-300 mb-1.5">{input.icon} {input.label}</p><div className="flex flex-wrap gap-1.5">{input.options.map(opt => (<button key={opt.value} onClick={() => setSentValues(p => ({ ...p, [input.key]: opt.value }))} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${sentValues[input.key] === opt.value ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:bg-white/[0.07]'}`}>{opt.label}</button>))}</div></div>))}</div>
        {allSentFilled && (<button onClick={() => setSentGenerated(true)} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95">Read Sentiment &rarr;</button>)}
        {!allSentFilled && (<p className="text-xs text-gray-600 text-center">Select a reading for each indicator to generate the sentiment verdict.</p>)}</>) : sentResult && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl text-center" style={{ background: sentResult.color + '10', border: `1px solid ${sentResult.color}30` }}><p className="text-lg font-extrabold" style={{ color: sentResult.color }}>{sentResult.verdict}</p></div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-1">ASSESSMENT</p><p className="text-xs text-gray-400 leading-relaxed">{sentResult.desc}</p></div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-[10px] font-bold text-amber-400 mb-1">TRADING ACTION</p><p className="text-xs text-gray-400 leading-relaxed">{sentResult.action}</p></div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-[10px] font-bold text-gray-300 mb-2">YOUR INPUTS</p><div className="space-y-1">{sentInputs.map(s => { const opt = s.options.find(o => o.value === sentValues[s.key]); return (<div key={s.key} className="flex items-center justify-between"><span className="text-[10px] text-gray-500">{s.icon} {s.label}</span><span className={`text-[10px] font-semibold ${opt?.extreme ? 'text-red-400' : 'text-gray-300'}`}>{opt?.label}{opt?.extreme ? ' ⚠' : ''}</span></div>); })}</div></div>
          <button onClick={() => { setSentGenerated(false); setSentValues({}); }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/[0.07]">&larr; Rescan</button>
        </motion.div>)}
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Sentiment Hierarchy</p><h2 className="text-2xl font-extrabold mb-4">Which Source Matters Most?</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">#1 COT (INSTITUTIONAL)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Biggest players. Slowest to change. When Large Specs shift, the move is real. Most reliable but 3-day lag.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">#2 RETAIL SENTIMENT</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Real-time. Best contrarian signal. 70%+ one side = fade. Most actionable for daily trading decisions.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">#3 VIX / PUT-CALL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Market-wide fear gauge. Best for regime assessment (risk-on vs risk-off). Extremes mark cycle turning points.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#6b7280]">#4 SOCIAL BUZZ</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Least reliable but most dramatic at extremes. Euphoria and panic are the only useful signals. Ignore the noise between.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Sentiment During Trends</p><h2 className="text-2xl font-extrabold mb-4">Extreme Sentiment ≠ Immediate Reversal</h2><div className="p-6 rounded-2xl glass-card space-y-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">EXTREME IN A TREND</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Retail 80% long during a downtrend = retail is fighting the trend. The contrarian signal says “don’t join them,” not “buy.”</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">CAPITULATION = REVERSAL</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The reversal comes when retail GIVES UP. Sentiment shifts from 80% long to 50% or below. THAT is capitulation. Trade the shift, not the extreme.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">EXTREME IN A RANGE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">75%+ one side in a range = the contrarian signal is strongest. The breakout is LIKELY in the direction opposite the retail crowd.</span></p></div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Sentiment extremes during trends CONFIRM the trend. Sentiment extremes in ranges PREDICT the breakout. Context determines interpretation.</span></p></div>
      </div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p><h2 className="text-2xl font-extrabold mb-4">4 Sentiment Errors</h2><div className="space-y-3">{commonMistakes.map((item, i) => (<div key={i}><button onClick={() => toggle(`cm-${i}`)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between"><span className="text-sm font-bold text-gray-200">{item.title}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSections[`cm-${i}`] ? 'rotate-180' : ''}`} /></button><AnimatePresence>{openSections[`cm-${i}`] && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 rounded-b-xl bg-white/[0.02] border-x border-b border-white/[0.05]"><p className="text-xs text-red-400 mb-2">&#10060; {item.mistake}</p><p className="text-xs text-green-400">&#10004; {item.fix}</p></div></motion.div>)}</AnimatePresence></div>))}</div></motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cheat Sheet</p><h2 className="text-2xl font-extrabold mb-4">Sentiment Quick Reference</h2><div className="p-6 rounded-2xl glass-card space-y-3"><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#EF5350]">RETAIL &gt;70% ONE SIDE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Contrarian alert. The crowd is overextended. Look for setups OPPOSITE to the retail majority.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#FFB300]">COT EXTREME</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Large Specs at extreme = the institutional buying/selling is done. Reversal risk elevated. Direction warning.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#26A69A]">VIX EXTREMES</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">VIX &lt;13 = complacency (top forming). VIX &gt;35 = panic (bottom forming). Mean-reverting. Trade the fade.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-[#a855f7]">FILTER, NOT TRIGGER</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Sentiment adds or reduces conviction. It doesn’t generate entries. Always combine with technicals + macro.</span></p></div><div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">THE RULE</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">When everyone agrees, the market is about to disagree. The crowd creates the reversal by being the crowd.</span></p></div></div></motion.div></section>

      {/* S10 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Test Your Understanding</p><h2 className="text-2xl font-extrabold mb-2">Sentiment Reading Game</h2><p className="text-gray-400 text-sm mb-6">5 scenario-based rounds. Read the crowd and make the contrarian call.</p>
      <div className="p-6 rounded-2xl glass-card"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div><p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} /><div className="space-y-2">{gameRounds[gameRound].options.map((opt, oi) => { const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: opt.explain }} /></motion.div>)}</div>); })}</div>{gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}{gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding — you can read the crowd like a contrarian pro.' : gameScore >= 3 ? 'Good — review the trend-vs-range distinction and the neutral sentiment scenario.' : 'Re-read the contrarian rules and the sentiment hierarchy before proceeding.'}</p></motion.div>)}</div></motion.div></section>

      {/* S11 — Quiz + Certificate */}
      <section className="max-w-2xl mx-auto px-5 py-16"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Knowledge Check</p><h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
      <div className="space-y-6">{quizQuestions.map((q, qi) => (<div key={qi} className="p-5 rounded-2xl glass-card"><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p><p className="text-sm font-semibold text-white mb-4">{q.q}</p><div className="space-y-2">{q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt}</button>; })}</div>{quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}</div>))}</div>
      {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScoreVal}%</p><p className="text-sm text-gray-400">{quizScoreVal >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
      {certUnlocked && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10"><div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}><div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} /><div className="relative z-10 text-center"><div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🧠</div><p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p><p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 8: Sentiment &amp; Positioning</strong><br />at ATLAS Academy by Interakktive</p><p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Sentiment Reader &mdash;</p><p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L8.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p></div></div></motion.div>)}</motion.div></section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center"><Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link></section>
    </div>
  );
}
