// app/academy/lesson/macd-deep-dive/page.tsx
// ATLAS Academy — Lesson 5.7: MACD & Histogram Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT
// ============================================================
function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawFn(ctx, rect.width, rect.height, frameRef.current);
      frameRef.current++;
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

// ============================================================
// ANIMATION 1: MACD Anatomy — All 3 components labelled
// Top: price with 12 EMA (fast) and 26 EMA (slow)
// Bottom: MACD line, signal line, histogram bars
// ============================================================
function MACDAnatomyAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const pts = 80;
    const padL = 25;
    const padR = w - 15;
    const topPanel = { t: 24, b: h * 0.42 };
    const botPanel = { t: h * 0.50, b: h - 14 };

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MACD Anatomy — Three Components', w / 2, 14);

    // Generate price
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) prices.push(100 + Math.sin(t + i * 0.06) * 20 + Math.sin(t * 0.4 + i * 0.12) * 12 + Math.cos(i * 0.18) * 5);

    // EMAs
    const calcEMA = (d: number[], p: number) => { const k = 2 / (p + 1); const e = [d[0]]; for (let i = 1; i < d.length; i++) e.push(d[i] * k + e[i - 1] * (1 - k)); return e; };
    const ema12 = calcEMA(prices, 12);
    const ema26 = calcEMA(prices, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = calcEMA(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    const xStep = (padR - padL) / (pts - 1);

    // Scale price
    const pMin = Math.min(...prices, ...ema12, ...ema26);
    const pMax = Math.max(...prices, ...ema12, ...ema26);
    const pRange = pMax - pMin || 1;
    const toYP = (v: number) => topPanel.b - ((v - pMin) / pRange) * (topPanel.b - topPanel.t - 10) - 5;

    // Draw price (thin, dim)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYP(v)) : ctx.lineTo(x, toYP(v)); });
    ctx.stroke();

    // 12 EMA (fast — sky blue)
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ema12.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYP(v)) : ctx.lineTo(x, toYP(v)); });
    ctx.stroke();

    // 26 EMA (slow — amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ema26.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYP(v)) : ctx.lineTo(x, toYP(v)); });
    ctx.stroke();

    // Labels
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ea5e9'; ctx.fillText('12 EMA (fast)', padL, topPanel.t + 8);
    ctx.fillStyle = '#f59e0b'; ctx.fillText('26 EMA (slow)', padL + 80, topPanel.t + 8);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, (topPanel.b + botPanel.t) / 2); ctx.lineTo(padR, (topPanel.b + botPanel.t) / 2); ctx.stroke();

    // Bottom panel — MACD
    const mMax = Math.max(...macdLine.map(Math.abs), ...signalLine.map(Math.abs), ...histogram.map(Math.abs)) || 1;
    const botMid = (botPanel.t + botPanel.b) / 2;
    const botH = (botPanel.b - botPanel.t) / 2 - 5;
    const toYM = (v: number) => botMid - (v / mMax) * botH;

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(padL, botMid); ctx.lineTo(padR, botMid); ctx.stroke();

    // Histogram bars
    histogram.forEach((v, i) => {
      const x = padL + i * xStep;
      const bH = (v / mMax) * botH;
      ctx.fillStyle = v >= 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
      ctx.fillRect(x - 1.5, botMid, 3, -bH);
    });

    // MACD line (blue)
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    macdLine.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYM(v)) : ctx.lineTo(x, toYM(v)); });
    ctx.stroke();

    // Signal line (red/orange)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    signalLine.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYM(v)) : ctx.lineTo(x, toYM(v)); });
    ctx.stroke();
    ctx.setLineDash([]);

    // Bottom labels
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ea5e9'; ctx.fillText('MACD Line', padL, botPanel.t + 6);
    ctx.fillStyle = '#ef4444'; ctx.fillText('Signal Line', padL + 60, botPanel.t + 6);
    ctx.fillStyle = 'rgba(34,197,94,0.6)'; ctx.fillText('Histogram', padL + 125, botPanel.t + 6);

    // Callout labels with arrows
    const lastIdx = pts - 1;
    const lastX = padL + lastIdx * xStep;
    const lastMACD = toYM(macdLine[lastIdx]);
    const lastSig = toYM(signalLine[lastIdx]);
    const lastHist = histogram[lastIdx];

    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0ea5e9'; ctx.fillText(`MACD: ${macdLine[lastIdx].toFixed(1)}`, lastX - 5, lastMACD - 5);
    ctx.fillStyle = '#ef4444'; ctx.fillText(`Signal: ${signalLine[lastIdx].toFixed(1)}`, lastX - 5, lastSig + 12);
    ctx.fillStyle = lastHist >= 0 ? '#22c55e' : '#ef4444'; ctx.fillText(`Hist: ${lastHist.toFixed(2)}`, lastX - 5, botMid + (lastHist >= 0 ? -3 : 12));
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: Histogram Acceleration
// Shows histogram bars with arrows indicating growing/shrinking
// Growing = accelerating momentum, shrinking = decelerating
// ============================================================
function HistogramAccelerationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Histogram = Acceleration of Momentum', w / 2, 14);

    const midY = h * 0.5;
    const numBars = 40;
    const barW = (w - 50) / numBars;
    const maxH = h * 0.32;

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(w - 20, midY); ctx.stroke();

    // Generate histogram values with clear phases
    const bars: number[] = [];
    for (let i = 0; i < numBars; i++) {
      const phase = (i / numBars + t * 0.08) % 1;
      // Creates growing then shrinking phases
      const envelope = Math.sin(phase * Math.PI * 2);
      bars.push(envelope * 0.8 + Math.sin(i * 0.3 + t) * 0.15);
    }

    let prevBar = 0;
    bars.forEach((v, i) => {
      const x = 25 + i * barW;
      const bH = v * maxH;
      const isGrowing = Math.abs(v) > Math.abs(prevBar);
      const isPositive = v >= 0;

      // Bar colour: brighter when growing, dimmer when shrinking
      if (isPositive) {
        ctx.fillStyle = isGrowing ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.25)';
      } else {
        ctx.fillStyle = isGrowing ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)';
      }
      ctx.fillRect(x, midY, barW - 2, -bH);

      // Growing/shrinking arrows (every 4th bar)
      if (i > 0 && i % 4 === 0 && Math.abs(v) > 0.15) {
        const arrowY = midY - bH + (isPositive ? -12 : 12);
        ctx.fillStyle = isGrowing ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.5)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        if (isPositive) {
          ctx.fillText(isGrowing ? '▲' : '▽', x + barW / 2, arrowY);
        } else {
          ctx.fillText(isGrowing ? '▼' : '△', x + barW / 2, arrowY);
        }
      }
      prevBar = v;
    });

    // Phase labels
    const phases = [
      { x: 0.12, label: 'ACCELERATING', sub: 'Bars growing', color: '#22c55e' },
      { x: 0.35, label: 'PEAK', sub: 'Max momentum', color: '#f59e0b' },
      { x: 0.55, label: 'DECELERATING', sub: 'Bars shrinking', color: '#ef4444' },
      { x: 0.78, label: 'CROSSING', sub: 'Momentum shift', color: '#d946ef' },
    ];

    phases.forEach(p => {
      const px = 25 + p.x * (w - 50);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, px, h - 20);
      ctx.fillStyle = `${p.color}80`;
      ctx.font = '7px system-ui';
      ctx.fillText(p.sub, px, h - 10);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// MACD STATES
// ============================================================
const macdStates = [
  { state: 'MACD above zero + Histogram growing', meaning: 'Bullish momentum is ACCELERATING. The fast EMA is pulling away from the slow EMA and the rate of divergence is increasing. This is the strongest bullish phase.', action: 'Hold longs. Add on pullbacks. Trail stops to lock in profit.', color: 'text-green-400', emoji: '🚀' },
  { state: 'MACD above zero + Histogram shrinking', meaning: 'Bullish momentum is DECELERATING. The fast EMA is still above the slow EMA but the gap is narrowing. The engine is losing power. Price may still be rising but with less force.', action: 'Tighten stops. Stop adding new longs. Watch for a signal line crossover or structural break.', color: 'text-amber-400', emoji: '⚡' },
  { state: 'MACD crosses below zero', meaning: 'The fast EMA has dropped below the slow EMA. Short-term average price is now below longer-term average price. The trend regime has shifted from bullish to bearish in this timeframe.', action: 'Exit remaining longs. Begin watching for short setups if structure aligns. Do NOT short the crossover alone.', color: 'text-red-400', emoji: '🔻' },
  { state: 'MACD below zero + Histogram growing (more negative)', meaning: 'Bearish momentum is ACCELERATING. The fast EMA is pulling further below the slow EMA. The selloff is gaining intensity.', action: 'Hold shorts. Do not try to catch the bottom. Let the histogram show deceleration before considering longs.', color: 'text-red-400', emoji: '📉' },
  { state: 'MACD below zero + Histogram shrinking (less negative)', meaning: 'Bearish momentum is DECELERATING. The selloff is losing force. The fast EMA is converging back toward the slow EMA. Potential bottom forming or consolidation starting.', action: 'Tighten short stops. Watch for a bullish divergence. If structure breaks up (BOS), consider long entries.', color: 'text-amber-400', emoji: '⏸️' },
  { state: 'MACD crosses above zero', meaning: 'The fast EMA has risen above the slow EMA. Short-term momentum has overtaken longer-term momentum. The regime has shifted from bearish to bullish in this timeframe.', action: 'Close shorts. Begin watching for long setups. The crossover itself is NOT the entry &mdash; structure + session + volume provide the entry.', color: 'text-green-400', emoji: '🔺' },
];

// ============================================================
// ADVANCED TECHNIQUES
// ============================================================
const techniques = [
  { name: 'Histogram Divergence', detail: 'Price makes a higher high but the MACD histogram peak is smaller than the previous one. This is divergence at the ACCELERATION level &mdash; even more advanced than standard MACD line divergence. It means momentum is not just fading, it&apos;s fading FASTER. <strong class="text-white">This is the earliest MACD warning signal available.</strong>', color: 'text-amber-400' },
  { name: 'Zero-Line Rejection', detail: 'MACD approaches the zero line from above but bounces without crossing. In a strong uptrend, this is a continuation signal &mdash; the pullback wasn&apos;t strong enough to shift the regime. Like a car slowing near a stop sign but accelerating away before stopping. <strong class="text-white">Especially powerful when price bounces off a moving average at the same time.</strong>', color: 'text-green-400' },
  { name: 'Signal Line Crossover in Context', detail: 'A MACD crossing above the signal line is a standard &ldquo;bullish signal.&rdquo; But on its own it happens constantly and is mostly noise. The crossover becomes meaningful when: (a) it occurs near the zero line (regime boundary), (b) it occurs after a divergence warning, or (c) it aligns with a structural level. <strong class="text-white">Context transforms a noise event into a signal event.</strong>', color: 'text-sky-400' },
  { name: 'MACD Trend Assessment', detail: 'Instead of looking for crossover &ldquo;signals,&rdquo; professionals use MACD to assess trend health. MACD above zero with growing histogram = healthy trend. MACD above zero but histogram shrinking for 5+ bars = weakening trend. This is used for REGIME assessment, not entry/exit timing.', color: 'text-purple-400' },
  { name: 'Multi-Timeframe MACD', detail: 'Check MACD on the higher timeframe FIRST. If the 4H MACD is above zero with growing histogram (strong bullish regime), then 1H MACD pullbacks to the signal line become buy opportunities. <strong class="text-white">Higher TF MACD sets the regime. Lower TF MACD finds the entries within that regime.</strong> This is one of the most powerful multi-timeframe frameworks.', color: 'text-accent-400' },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'MACD is above zero. The histogram has been shrinking for 6 consecutive bars. Price is still making higher highs. A trader says: &ldquo;MACD is still positive so the trend is fine &mdash; keep buying.&rdquo; What is wrong with this analysis?',
    options: [
      { text: 'Nothing wrong &mdash; MACD above zero confirms the uptrend', correct: false, explain: 'MACD above zero confirms the REGIME (bullish), but the shrinking histogram tells you momentum is DECELERATING. Six consecutive shrinking bars is significant &mdash; the engine is losing power. Price making higher highs on fading momentum is a divergence warning. The correct response is to tighten stops and reduce new longs, not to keep buying aggressively.' },
      { text: 'MACD above zero confirms regime but 6 shrinking histogram bars = decelerating momentum. This is a divergence warning. Tighten stops and reduce new entries rather than buying aggressively.', correct: true, explain: 'Exactly. The trader was reading only ONE component (MACD position) and ignoring the other (histogram trend). All three MACD components matter: position (above/below zero), direction (MACD line slope), and acceleration (histogram trend). When they conflict, the histogram usually warns of a shift before the MACD line confirms it.' },
    ],
  },
  {
    scenario: 'MACD approaches the zero line from above during a pullback in a strong uptrend. It touches &minus;0.3 but then turns back up. Price simultaneously bounces off the 50 EMA. What happened?',
    options: [
      { text: 'MACD broke below zero which confirms the trend has reversed. Go short.', correct: false, explain: 'MACD briefly touching &minus;0.3 is not a clean zero-line break. A strong zero-line rejection (approaching zero but bouncing) in the context of a strong uptrend is a CONTINUATION signal. Price bouncing off the 50 EMA at the same time provides structural confluence. This is one of the strongest MACD continuation setups &mdash; momentum retested the regime boundary and held.' },
      { text: 'Zero-line rejection + 50 EMA bounce = strong continuation signal. MACD tested the regime boundary and held. This is a high-quality pullback entry zone.', correct: true, explain: 'Correct. The zero line is the regime boundary. MACD above zero = bullish regime. When it dips toward zero but bounces, the regime held. Combined with price bouncing off the 50 EMA, this is double confirmation that the pullback is complete and the trend is ready to resume. This is the kind of confluence that turns a B setup into an A+ setup.' },
    ],
  },
  {
    scenario: 'A beginner sees a MACD crossover (MACD line crosses above signal line) on the 15-minute EUR/USD chart at 4am GMT. They say: &ldquo;Bullish crossover confirmed! Going long.&rdquo; What are the problems?',
    options: [
      { text: 'No problems &mdash; MACD crossovers are reliable entry signals', correct: false, explain: 'Multiple problems: (1) 15-minute MACD crossovers happen 5&ndash;10 times per day &mdash; most are noise. (2) 4am GMT is the Asian session for EUR/USD &mdash; no institutional flow. (3) No structural context was mentioned (no demand zone, no key level). (4) No higher timeframe confirmation. This is a noise trade dressed up as a &ldquo;confirmed signal.&rdquo;' },
      { text: 'Low TF crossovers happen constantly (noise), Asian session has no EUR/USD institutional flow, no structural context, no higher TF confirmation. This is noise, not a signal.', correct: true, explain: 'Exactly right. A MACD crossover is a MEASUREMENT (fast average overtook slow average), not a signal. To become a signal it needs: (1) higher TF regime alignment, (2) structural context (key level), (3) session timing (institutional flow), and (4) additional confluence (volume, RSI). Without all of those, it&apos;s just two moving averages crossing on a noisy timeframe.' },
    ],
  },
  {
    scenario: 'The 4H MACD is above zero with a growing histogram (strong bullish regime). On the 1H chart, MACD has pulled back to the signal line and the histogram briefly went negative (&minus;0.1). What is the professional interpretation?',
    options: [
      { text: 'The 1H MACD going negative means the trend has reversed. Close all longs.', correct: false, explain: 'The 1H is the LOWER timeframe. Its MACD going briefly negative during a pullback within a strong 4H bullish regime is NORMAL and expected. The 4H MACD (dominant regime) is still strongly bullish. The 1H pullback is creating a potential ENTRY opportunity within the 4H trend, not a reversal signal. This is the multi-timeframe MACD framework in action.' },
      { text: 'The 4H regime is dominant (bullish). The 1H MACD pullback to negative within that regime is creating a potential re-entry opportunity. Look for 1H histogram to turn positive again with structural confluence for a long entry.', correct: true, explain: 'Correct. Higher TF sets regime. Lower TF finds entries. The 4H MACD says &ldquo;we are in a bullish environment.&rdquo; The 1H MACD pulling back says &ldquo;within that bullish environment, momentum has cooled briefly.&rdquo; When the 1H histogram starts growing again (momentum resuming), that is the entry zone &mdash; if structure and volume confirm.' },
    ],
  },
  {
    scenario: 'Price makes a new high. The MACD LINE also makes a new high. But the HISTOGRAM peak is smaller than the last histogram peak. Is there divergence?',
    options: [
      { text: 'No divergence &mdash; the MACD line confirmed the new high', correct: false, explain: 'There IS divergence &mdash; but at the ACCELERATION level, not the momentum level. The MACD line (momentum) confirmed the new price high. But the histogram (acceleration of momentum) was weaker. This means momentum is still rising but the RATE of increase is slowing. It&apos;s a subtler, earlier warning than standard MACD divergence. Think of it as the car still accelerating but the engine starting to strain.' },
      { text: 'Yes &mdash; histogram divergence. Momentum (MACD line) confirmed the high but ACCELERATION (histogram) was weaker. This is an early warning that momentum growth is slowing, even though momentum itself is still positive.', correct: true, explain: 'Exactly. Histogram divergence is the most advanced MACD signal. It detects changes at the acceleration level before they appear at the momentum level. MACD line divergence is a stronger warning, but histogram divergence comes FIRST. It&apos;s the earliest possible MACD-based warning of trend weakening.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'The MACD histogram measures:', opts: ['The difference between price and a moving average', 'The difference between the MACD line and the signal line &mdash; the ACCELERATION of momentum', 'The total volume in the market', 'Whether to buy or sell'], correct: 1, explain: 'Histogram = MACD Line &minus; Signal Line. Since MACD is already the difference between fast and slow EMAs, the histogram measures how fast that difference is changing. It is the rate of change of momentum &mdash; acceleration.' },
  { q: 'MACD above zero with a growing histogram indicates:', opts: ['Overbought conditions &mdash; time to sell', 'Bullish momentum that is ACCELERATING &mdash; the strongest bullish phase', 'The trend is about to reverse', 'Volume is increasing'], correct: 1, explain: 'MACD above zero = fast EMA above slow EMA (bullish regime). Growing histogram = the gap is WIDENING (accelerating). This is the most powerful bullish phase &mdash; momentum is strong AND getting stronger.' },
  { q: 'A zero-line rejection (MACD approaches zero from above but bounces back) during an uptrend is:', opts: ['A sell signal because MACD nearly went negative', 'A continuation signal &mdash; the regime boundary held', 'Meaningless noise', 'A sign the indicator is broken'], correct: 1, explain: 'The zero line is the regime boundary. MACD approaching it but bouncing means the pullback wasn&apos;t strong enough to shift the regime from bullish to bearish. This is a continuation signal, especially when combined with a structural bounce (50 EMA, demand zone).' },
  { q: 'Why is a MACD crossover on a 5-minute chart unreliable as a trade signal?', opts: ['Because MACD doesn&apos;t work on lower timeframes', 'Because crossovers on low TFs happen 5&ndash;10 times daily and most are noise &mdash; they need higher TF regime, structure, session, and volume to filter', 'Because the 5-minute chart uses different maths', 'Because crossovers are always unreliable on any timeframe'], correct: 1, explain: 'Low TF crossovers are extremely frequent and noisy. Without higher TF regime alignment, structural significance, session timing, and volume confirmation, the vast majority are meaningless oscillations.' },
  { q: 'In the multi-timeframe MACD framework, the higher timeframe provides:', opts: ['Entry signals', 'The REGIME (bullish/bearish) while the lower timeframe finds entries within that regime', 'Stop-loss levels', 'Exact take-profit targets'], correct: 1, explain: 'Higher TF MACD tells you the dominant regime. Lower TF MACD pullbacks within that regime create entry opportunities. The higher TF sets the direction. The lower TF finds the timing.' },
  { q: 'Histogram divergence (price new high, histogram smaller peak) warns you that:', opts: ['Price will crash immediately', 'Momentum is still positive but its RATE OF INCREASE is slowing &mdash; an early acceleration-level warning', 'The MACD indicator is broken', 'You should double your position'], correct: 1, explain: 'Histogram divergence is the earliest MACD warning. Momentum (MACD line) still confirmed the high, but acceleration (histogram) was weaker. The engine is still running but straining. This precedes MACD line divergence.' },
  { q: 'The three components of MACD, in order from slowest to fastest signal, are:', opts: ['Histogram, Signal Line, MACD Line', 'MACD Line position (above/below zero), MACD Line crossover of Signal Line, Histogram trend change', 'Signal Line, MACD Line, Volume', 'All three react at the same speed'], correct: 1, explain: 'Fastest = histogram trend (acceleration changes first). Middle = MACD/signal crossover (momentum shift). Slowest = zero-line cross (regime change). Professional traders read all three in this order &mdash; acceleration → momentum → regime.' },
  { q: 'MACD is below zero. The histogram has been shrinking (less negative) for 4 bars. This means:', opts: ['The downtrend is accelerating &mdash; add to shorts', 'Bearish momentum is DECELERATING &mdash; the selloff is losing force. Watch for a structural shift but don&apos;t buy yet.', 'The market is neutral', 'MACD will cross zero on the next bar'], correct: 1, explain: 'MACD below zero = bearish regime. Histogram less negative = deceleration. The selloff is losing steam. This does NOT mean &ldquo;buy&rdquo; &mdash; it means the PACE of selling is slowing. Wait for a MACD zero-line cross AND structural confirmation before considering longs.' },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current; c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const pieces = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff'][Math.floor(Math.random() * 5)], vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1 }));
    let frames = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); frames++; if (frames < 250) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function MACDDeepDiveLesson() {
  const [openState, setOpenState] = useState<number | null>(null);
  const [openTech, setOpenTech] = useState<number | null>(null);
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const u = [...gameAnswers]; u[gameRound] = oi; setGameAnswers(u); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u); if (u.every(a => a !== null)) { const c = u.filter((a, i) => a === quizQuestions[i].correct).length; const pct = Math.round((c / quizQuestions.length) * 100); setQuizScore(pct); setQuizDone(true); if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800); } };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Trading every MACD crossover as an entry signal', right: 'Crossovers happen constantly. Filter with: higher TF regime alignment, structural context (key level), session timing, and volume. Without all four, a crossover is noise.', icon: '❌' },
    { wrong: 'Ignoring the histogram and only watching the MACD line', right: 'The histogram is the FASTEST component. It shows acceleration changes before the MACD line shows momentum changes. Reading MACD without the histogram is like reading a speedometer without the accelerator pedal.', icon: '📊' },
    { wrong: 'Assuming MACD below zero means &ldquo;sell everything&rdquo;', right: 'MACD below zero means the fast EMA is below the slow EMA &mdash; bearish REGIME. But regime shifts are slow. A brief dip below zero during a pullback in a strong uptrend is normal, not a sell signal.', icon: '🔻' },
    { wrong: 'Using MACD on the 1-minute chart for swing trade decisions', right: 'Match MACD timeframe to your trading style. 1-minute MACD = scalping noise. 1H/4H MACD = swing trade regime. Use higher TF for regime, lower TF for entries within that regime.', icon: '⏱️' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 5</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">MACD &amp; Histogram<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Deep Dive</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Three components, three layers of intelligence. The MACD line tells you momentum. The signal line tells you its trend. The histogram tells you its acceleration.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Most Misused Indicator in Trading</p>
            <p className="text-gray-400 leading-relaxed mb-4">MACD is the second most popular indicator after RSI. And like RSI, <strong className="text-amber-400">90% of traders use about 10% of what it can do</strong>. They watch for crossovers, see a little arrow, and click buy or sell. That&apos;s like owning a Formula 1 car and only driving it in the car park.</p>
            <p className="text-gray-400 leading-relaxed mb-4">MACD is not one indicator &mdash; it is <strong className="text-white">three indicators layered on top of each other</strong>. The MACD line measures momentum (speed). The signal line measures the trend of momentum (direction of speed). The histogram measures acceleration (is speed increasing or decreasing?).</p>
            <p className="text-gray-400 leading-relaxed">When you learn to read all three together, MACD transforms from a crossover generator into a three-dimensional momentum intelligence system.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A quantitative study of <strong className="text-white">5 years of S&amp;P 500 data</strong> found that raw MACD crossover signals produced a <strong className="text-red-400">Sharpe ratio of 0.12</strong> (barely above random). But MACD crossovers filtered by histogram direction + zero-line position + higher TF regime produced a <strong className="text-green-400">Sharpe ratio of 1.34</strong>. Same indicator. Same data. Context multiplied the edge by 11&times;.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: MACD Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Components</p>
          <h2 className="text-2xl font-extrabold mb-4">See All Three Working Together</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Top panel: price with the fast EMA (blue, 12-period) and slow EMA (amber, 26-period). Bottom panel: MACD line (blue), signal line (red dashed), and histogram (green/red bars). Watch how the histogram leads the MACD line, which leads the zero-line cross.</p>
          <MACDAnatomyAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Three Layers</p>
            <p className="text-sm text-gray-400"><strong className="text-sky-400">MACD Line</strong> = fast EMA &minus; slow EMA (momentum). <strong className="text-red-400">Signal Line</strong> = 9 EMA of MACD Line (momentum&apos;s trend). <strong className="text-green-400">Histogram</strong> = MACD Line &minus; Signal Line (momentum&apos;s acceleration).</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Histogram Acceleration === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Histogram Secret</p>
          <h2 className="text-2xl font-extrabold mb-4">Histogram = Acceleration</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The histogram is NOT just &ldquo;the difference between two lines.&rdquo; It measures the <strong className="text-white">acceleration of momentum</strong>. Growing bars = speeding up. Shrinking bars = slowing down. This is the fastest-reacting component &mdash; it changes FIRST.</p>
          <HistogramAccelerationAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-extrabold text-green-400 mb-1">Growing (Brighter)</p>
              <p className="text-[11px] text-gray-400">Momentum is ACCELERATING. Each bar is larger than the last. The gap between MACD and signal is widening. Maximum energy.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Shrinking (Dimmer)</p>
              <p className="text-[11px] text-gray-400">Momentum is DECELERATING. Each bar is smaller. The MACD and signal lines are converging. Energy fading.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03: The Six MACD States === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Six States</p>
          <h2 className="text-2xl font-extrabold mb-2">Every MACD Reading Falls Into One of Six States</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Instead of looking for crossovers, learn to identify which STATE MACD is in right now. Each state has a specific meaning and a specific professional response.</p>
          <div className="space-y-3">
            {macdStates.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenState(openState === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-lg">{s.emoji}</span><p className={`text-sm font-extrabold ${s.color}`}>{s.state}</p></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openState === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openState === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: s.meaning }} />
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Professional Response</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: s.action }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S04: Speed Hierarchy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Speed Hierarchy</p>
          <h2 className="text-2xl font-extrabold mb-2">Which Component Changes First?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Understanding the order of MACD component changes is crucial. The histogram moves FIRST, the crossover happens SECOND, and the zero-line cross happens LAST. Professionals read them in this order.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 font-extrabold text-lg">1</div>
                <div><p className="text-sm font-extrabold text-green-400">Histogram Direction Change</p><p className="text-xs text-gray-400">FASTEST. Growing → shrinking = first sign of deceleration. Often leads other signals by 3&ndash;8 candles.</p></div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-extrabold text-lg">2</div>
                <div><p className="text-sm font-extrabold text-amber-400">Signal Line Crossover</p><p className="text-xs text-gray-400">MEDIUM. MACD line crosses signal line = momentum trend has shifted. Useful with context, useless alone.</p></div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-extrabold text-lg">3</div>
                <div><p className="text-sm font-extrabold text-red-400">Zero-Line Cross</p><p className="text-xs text-gray-400">SLOWEST. Fast EMA crosses slow EMA = regime has officially shifted. By this point, the move is well underway. Confirmation, not entry.</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05: Advanced Techniques === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Advanced Techniques</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Professional MACD Techniques</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond crossovers. These are the techniques that institutional traders use daily.</p>
          <div className="space-y-3">
            {techniques.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenTech(openTech === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${tech.color}`}>{tech.name}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTech === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openTech === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tech.detail }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S06: MACD + RSI Together === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; MACD + RSI</p>
          <h2 className="text-2xl font-extrabold mb-2">The Power Combination</h2>
          <p className="text-gray-400 leading-relaxed mb-6">RSI (Lesson 5.6) and MACD are both momentum tools but they measure DIFFERENT aspects. RSI measures the ratio of gains to losses (relative strength). MACD measures the gap between fast and slow averages (convergence/divergence). When both show the same thing, the signal is stronger.</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-green-400 mb-2">Maximum Confluence</p><p className="text-sm text-gray-400">RSI showing bullish divergence at a demand zone + MACD histogram turning from negative to positive + price at the 50 EMA. Three independent momentum readings all pointing to the same conclusion. Add session timing and this is an A+ setup.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-amber-400 mb-2">Warning: Redundancy Trap</p><p className="text-sm text-gray-400">RSI and MACD are RELATED (both measure momentum). They are not fully independent like momentum + volume. Using both is better than using one, but it is NOT the same as combining momentum with volume or trend. For maximum independence, add a VOLUME indicator as the third tool.</p></div>
          </div>
        </motion.div>
      </section>

      {/* === S07: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">What to Avoid</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenMistake(openMistake === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3"><span className="text-lg">{m.icon}</span><p className="text-sm font-extrabold text-red-400" dangerouslySetInnerHTML={{ __html: m.wrong }} /></div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMistake === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Do This Instead</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S08: Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">MACD Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Above zero + growing histogram</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Strongest bullish phase. Hold and trail.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Above zero + shrinking histogram</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Decelerating. Tighten stops. Reduce new longs.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">Zero-line rejection (bounce)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Regime held. Continuation. Add at structure.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-red-400">Below zero + growing (more negative)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Strongest bearish phase. Do not fight it.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">Histogram divergence</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Earliest warning. Acceleration fading before momentum shows it.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">MACD Deep Dive Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 advanced scenarios. Can you read all three components together?</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You see all three layers. MACD has no secrets from you.' : gameScore >= 3 ? 'Good — the histogram concept takes practice. Review the acceleration section.' : 'Review the six states and the speed hierarchy, then try again.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S10: Quiz + Certificate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📈</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: MACD &amp; Histogram Deep Dive</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; MACD Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
