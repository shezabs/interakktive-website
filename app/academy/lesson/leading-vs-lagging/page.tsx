// app/academy/lesson/leading-vs-lagging/page.tsx
// ATLAS Academy — Lesson 5.2: Leading vs Lagging — The Truth [PRO]
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
// ANIMATION 1: Timeline — Past ← NOW → Future
// Shows price bars flowing left (past/known) through NOW line
// Lagging indicators point LEFT (measuring what happened)
// "Leading" indicators also point LEFT (measuring current momentum)
// Only predictions point RIGHT (unknown/foggy)
// ============================================================
function TimelineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const nowX = w * 0.55;

    // Timeline base
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, h * 0.5);
    ctx.lineTo(w - 30, h * 0.5);
    ctx.stroke();

    // NOW marker — pulsing vertical line
    ctx.strokeStyle = `rgba(245,158,11,${0.5 + Math.sin(t * 2) * 0.3})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX, 35);
    ctx.lineTo(nowX, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', nowX, 28);

    // PAST label (left)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('← KNOWN (Past)', 35, 28);

    // FUTURE label (right) — foggy
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.textAlign = 'right';
    ctx.fillText('UNKNOWN (Future) →', w - 35, 28);

    // Fog gradient on right side
    const fog = ctx.createLinearGradient(nowX + 20, 0, w, 0);
    fog.addColorStop(0, 'rgba(6,10,18,0)');
    fog.addColorStop(0.4, 'rgba(6,10,18,0.5)');
    fog.addColorStop(1, 'rgba(6,10,18,0.85)');
    ctx.fillStyle = fog;
    ctx.fillRect(nowX + 20, 35, w - nowX - 50, h - 60);

    // Price bars flowing (past side — visible, clear)
    const barW = 6;
    const barGap = 10;
    const baseY = h * 0.5;
    for (let i = 0; i < 20; i++) {
      const x = nowX - 15 - i * barGap;
      if (x < 25) break;
      const barH = 8 + Math.sin(t + i * 0.4) * 15 + Math.cos(i * 0.7) * 10;
      const isGreen = Math.sin(t * 0.3 + i * 0.5) > 0;
      ctx.fillStyle = isGreen ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
      ctx.fillRect(x - barW / 2, baseY - Math.abs(barH) / 2, barW, Math.abs(barH));
    }

    // Future bars — ghostly, uncertain
    for (let i = 0; i < 8; i++) {
      const x = nowX + 25 + i * barGap;
      if (x > w - 35) break;
      const barH = 8 + Math.sin(t + i * 0.6) * 12;
      const alpha = Math.max(0.03, 0.15 - i * 0.015);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(x - barW / 2, baseY - Math.abs(barH) / 2, barW, Math.abs(barH));
    }

    // Question marks in the fog
    ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(t * 1.5) * 0.04})`;
    ctx.font = '20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('?', nowX + 80, h * 0.4 + Math.sin(t) * 5);
    ctx.fillText('?', nowX + 130, h * 0.6 + Math.cos(t * 1.3) * 4);
    ctx.font = '14px system-ui';
    ctx.fillText('?', nowX + 100, h * 0.55 + Math.sin(t * 2) * 3);

    // LAGGING arrow (points left from NOW — measuring past)
    const lagY = h * 0.25;
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LAGGING (e.g. MA, MACD)', nowX - 70, lagY - 8);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowX - 5, lagY);
    ctx.lineTo(nowX - 120, lagY);
    ctx.stroke();
    // Arrow head pointing left
    ctx.beginPath();
    ctx.moveTo(nowX - 120, lagY);
    ctx.lineTo(nowX - 112, lagY - 5);
    ctx.lineTo(nowX - 112, lagY + 5);
    ctx.closePath();
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    // "LEADING" arrow (ALSO points left/at NOW — measuring current state)
    const leadY = h * 0.75;
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('"LEADING" (e.g. RSI, Stoch)', nowX - 50, leadY - 8);
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowX - 5, leadY);
    ctx.lineTo(nowX - 80, leadY);
    ctx.stroke();
    // Arrow pointing left (shorter — more recent data)
    ctx.beginPath();
    ctx.moveTo(nowX - 80, leadY);
    ctx.lineTo(nowX - 72, leadY - 5);
    ctx.lineTo(nowX - 72, leadY + 5);
    ctx.closePath();
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();

    // Key insight at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Both arrows point LEFT — neither predicts the future. "Leading" just uses less past data.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Rearview Mirror vs Windshield
// Left: car with wide rearview mirror (lagging = lots of past data)
// Right: car with narrow rearview mirror (leading = recent data only)
// Both look BACKWARDS — neither can see around the next corner
// ============================================================
function MirrorAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const mid = w / 2;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Both types look BACKWARDS — just different window sizes', w / 2, 18);

    // --- LEFT: Wide Rearview (Lagging) ---
    const lx = mid * 0.5;
    const ly = h * 0.5;

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LAGGING (e.g. 200 MA)', lx, 38);
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.font = '9px system-ui';
    ctx.fillText('Wide mirror — sees far back', lx, 50);

    // Wide mirror shape
    const mw1 = Math.min(120, mid * 0.7);
    const mh1 = 55;
    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.strokeStyle = 'rgba(34,197,94,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lx - mw1 / 2, ly - mh1 / 2, mw1, mh1, 8);
    ctx.fill();
    ctx.stroke();

    // Bars inside mirror (many — represents lots of historical data)
    const bars1 = 18;
    for (let i = 0; i < bars1; i++) {
      const bx = lx - mw1 / 2 + 8 + i * ((mw1 - 16) / bars1);
      const bh = 6 + Math.sin(t * 0.5 + i * 0.3) * 12 + Math.cos(i * 0.8) * 6;
      ctx.fillStyle = `rgba(34,197,94,${0.2 + (i / bars1) * 0.3})`;
      ctx.fillRect(bx, ly - Math.abs(bh) / 2, 3, Math.abs(bh));
    }

    // Smooth line through bars (the average)
    ctx.strokeStyle = 'rgba(34,197,94,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < bars1; i++) {
      const bx = lx - mw1 / 2 + 8 + i * ((mw1 - 16) / bars1);
      const by = ly + Math.sin(t * 0.3 + i * 0.15) * 8;
      i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.font = '9px system-ui';
    ctx.fillText('200 candles of data → very smooth, very late', lx, ly + mh1 / 2 + 18);

    // --- DIVIDER ---
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mid, 30);
    ctx.lineTo(mid, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- RIGHT: Narrow Rearview ("Leading") ---
    const rx = mid + mid * 0.5;
    const ry = h * 0.5;

    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('"LEADING" (e.g. RSI 14)', rx, 38);
    ctx.fillStyle = 'rgba(14,165,233,0.15)';
    ctx.font = '9px system-ui';
    ctx.fillText('Narrow mirror — sees only recent', rx, 50);

    // Narrow mirror
    const mw2 = Math.min(60, mid * 0.35);
    const mh2 = 55;
    ctx.fillStyle = 'rgba(14,165,233,0.06)';
    ctx.strokeStyle = 'rgba(14,165,233,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rx - mw2 / 2, ry - mh2 / 2, mw2, mh2, 8);
    ctx.fill();
    ctx.stroke();

    // Fewer bars inside (recent data only)
    const bars2 = 7;
    for (let i = 0; i < bars2; i++) {
      const bx = rx - mw2 / 2 + 6 + i * ((mw2 - 12) / bars2);
      const bh = 8 + Math.sin(t + i * 0.5) * 14;
      ctx.fillStyle = `rgba(14,165,233,${0.3 + (i / bars2) * 0.4})`;
      ctx.fillRect(bx, ry - Math.abs(bh) / 2, 3, Math.abs(bh));
    }

    // Jagged line (more reactive)
    ctx.strokeStyle = 'rgba(14,165,233,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < bars2; i++) {
      const bx = rx - mw2 / 2 + 6 + i * ((mw2 - 12) / bars2);
      const by = ry + Math.sin(t * 1.2 + i * 0.4) * 12;
      i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(14,165,233,0.5)';
    ctx.font = '9px system-ui';
    ctx.fillText('14 candles of data → responsive, more noise', rx, ry + mh2 / 2 + 18);

    // Bottom insight
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('KEY: Neither mirror shows what is AHEAD. Both look at what already happened.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// INDICATOR CLASSIFICATION DATA
// ============================================================
const indicators = [
  { name: 'RSI (14)', label: '"Leading"', reality: 'Measures the ratio of recent gains to recent losses over 14 candles. All 14 candles are in the PAST. It reacts faster than a 200 MA because it uses less historical data &mdash; not because it sees the future.', lookback: 14, family: 'Momentum' },
  { name: '200 SMA', label: 'Lagging', reality: 'Averages the last 200 closing prices. It is extremely smooth and extremely slow. By the time it turns, the trend has been running for weeks. More data = smoother = slower.', lookback: 200, family: 'Trend' },
  { name: 'MACD (12, 26, 9)', label: '"Leading"', reality: 'The difference between a 12-period EMA and a 26-period EMA, smoothed by a 9-period signal line. Every single input is historical. The &ldquo;crossover signal&rdquo; arrives AFTER momentum has already shifted.', lookback: 26, family: 'Momentum' },
  { name: 'Stochastic (14, 3, 3)', label: '"Leading"', reality: 'Measures where the current close sits relative to the high-low range over 14 periods. It oscillates between 0&ndash;100. Faster than RSI because of the %K smoothing, but still measuring PAST price position.', lookback: 14, family: 'Momentum' },
  { name: 'ATR (14)', label: 'Lagging', reality: 'Averages the True Range (high-low or gap) over 14 periods. It tells you how volatile price HAS BEEN, not how volatile it WILL BE. Useful for setting stops based on recent conditions.', lookback: 14, family: 'Volatility' },
  { name: 'Bollinger Bands (20, 2)', label: 'Lagging', reality: 'A 20-period SMA plus/minus 2 standard deviations. The squeeze measures current compression. The bands measure PAST volatility. Width changes FOLLOW volatility shifts, they don&apos;t precede them.', lookback: 20, family: 'Volatility' },
];

// ============================================================
// DEEP TRUTHS
// ============================================================
const deepTruths = [
  { title: 'There is no such thing as a truly leading indicator', detail: 'The term &ldquo;leading indicator&rdquo; was invented by marketing, not mathematics. Every indicator uses PAST data. Some use 14 candles (RSI), some use 200 candles (SMA). The ones using fewer candles react faster &mdash; but &ldquo;faster reaction&rdquo; is not the same as &ldquo;prediction.&rdquo; A car with sensitive brakes stops faster than a truck, but neither can see around the corner.', color: 'text-amber-400' },
  { title: 'Responsiveness is NOT prediction', detail: 'RSI &ldquo;reacts&rdquo; quickly because it only looks at 14 candles. That makes it responsive to recent changes. A 200 MA &ldquo;reacts&rdquo; slowly because it averages 200 candles. The fast one feels like it&apos;s predicting because it moves before the slow one &mdash; but it&apos;s just MEASURING current conditions with a smaller dataset. Imagine two journalists reporting on the same event. One files the story in 5 minutes (responsive). The other takes 3 hours (thorough). Neither predicted the event.', color: 'text-sky-400' },
  { title: 'The lookback period is the ONLY difference', detail: 'Every indicator has a lookback period &mdash; how many candles of historical data it examines. Short lookback (5&ndash;14) = fast, noisy, reactive. Long lookback (50&ndash;200) = slow, smooth, reliable. The trade-off is always the same: speed vs smoothness. You cannot have both. This is why professionals use BOTH a fast and a slow indicator &mdash; the fast one catches turns, the slow one confirms trends.', color: 'text-green-400' },
  { title: 'Why this matters for your trading', detail: 'If you believe RSI &ldquo;predicts&rdquo; reversals, you will enter trades based on RSI alone and lose consistently. If you understand that RSI MEASURES current momentum strength, you will use it as ONE piece of evidence alongside structure, session, and volume. The difference between these two mindsets is the difference between a 30% and a 55% win rate.', color: 'text-red-400' },
  { title: 'The only thing that is genuinely forward-looking', detail: 'Price action itself. A break of structure (BOS), a liquidity sweep, or a manipulation pattern (from Level 3) are the closest things to &ldquo;forward-looking&rdquo; because they represent real orders being placed by institutions. These aren&apos;t indicators &mdash; they are direct observations of market behaviour. That&apos;s why SMC (Level 3) + Indicators (Level 5) together are more powerful than either alone.', color: 'text-accent-400' },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'A trading course advertises: &ldquo;Our LEADING indicator predicts market tops and bottoms BEFORE they happen!&rdquo; What should you think?',
    options: [
      { text: 'Amazing &mdash; finally an indicator that can see the future. Sign me up.', correct: false, explain: 'No indicator can predict the future. What they are likely selling is a short-lookback oscillator (like RSI 7 or Stochastic 5) that reacts quickly to price changes. It feels predictive in hindsight because it turns before slower indicators &mdash; but it&apos;s just measuring recent data faster. It will also produce many more false signals.' },
      { text: 'No indicator uses future data. It&apos;s likely a fast oscillator that REACTS quickly, not one that PREDICTS. And fast = more false signals.', correct: true, explain: 'Exactly. &ldquo;Leading&rdquo; is a marketing term, not a mathematical truth. Every indicator calculates from historical data. Shorter lookback = faster reaction = more noise. There is no free lunch &mdash; speed always comes at the cost of reliability.' },
    ],
  },
  {
    scenario: 'RSI (14-period) crosses above 50 on the 1H chart. A trader says: &ldquo;RSI is LEADING price higher &mdash; momentum has turned bullish BEFORE price confirmed it.&rdquo; Is this correct?',
    options: [
      { text: 'Yes &mdash; RSI turned bullish before the moving average confirmed it, proving RSI leads price', correct: false, explain: 'RSI didn&apos;t LEAD anything. It calculated the ratio of gains to losses over the last 14 candles and the result crossed 50. That means recent gains have been slightly larger than recent losses. It appeared to &ldquo;lead&rdquo; the MA because it uses 14 candles vs the MA&apos;s 50+. It just measured faster, not earlier.' },
      { text: 'No &mdash; RSI measured that recent gains slightly exceed recent losses. It reacted faster than the MA because it uses less data, not because it sees the future.', correct: true, explain: 'Correct. RSI crossing 50 tells you that over the last 14 candles, buying pressure has been marginally stronger. The 50 MA hasn&apos;t turned yet because it averages 50 candles. RSI isn&apos;t leading &mdash; it&apos;s using a smaller rearview mirror.' },
    ],
  },
  {
    scenario: 'A 200-period SMA finally turns upward after weeks of downtrend. Is this a BUY signal?',
    options: [
      { text: 'Yes &mdash; the 200 MA turning up confirms the new uptrend. Time to go long.', correct: false, explain: 'By the time a 200 MA turns up, price has typically been rising for weeks or months already. You&apos;d be buying well after the move started. The 200 MA confirms that a trend EXISTS (useful) but it&apos;s far too slow for timing entries. It&apos;s a regime identifier, not an entry signal.' },
      { text: 'Not a signal &mdash; the 200 MA confirms a trend that has been running for weeks. Useful for regime identification but far too slow for entries.', correct: true, explain: 'Exactly. The 200 MA is a lagging trend CONFIRMATION tool. It tells you the regime: are we in an uptrend or a downtrend? Use it for context (trade with the trend) not timing (when to enter). Entry timing requires faster tools + structure.' },
    ],
  },
  {
    scenario: 'You want the most responsive momentum reading possible. You set RSI to a 3-period lookback instead of the default 14. What happens?',
    options: [
      { text: 'Perfect &mdash; RSI-3 will predict reversals even faster than RSI-14, giving me earlier entries', correct: false, explain: 'RSI-3 doesn&apos;t predict better &mdash; it just oscillates wildly. With only 3 candles of data, a single large candle can send RSI from 20 to 80. You get more signals but far more of them are noise. The speed/reliability trade-off is extreme at RSI-3. Most signals will be false.' },
      { text: 'RSI-3 will be extremely noisy &mdash; faster reaction but far more false signals. The speed/reliability trade-off makes it nearly unusable on its own.', correct: true, explain: 'Correct. RSI-3 is so reactive that it produces signals almost every candle. Most are noise. Professional traders rarely use extreme short lookbacks alone &mdash; if they do, they heavily filter with structure and confirmation. Speed without reliability is just noise.' },
    ],
  },
  {
    scenario: 'Your indicator setup includes RSI-14 (&ldquo;leading&rdquo;) and 50 EMA (lagging). RSI shows overbought but price is above the 50 EMA in a strong uptrend. Which indicator do you trust?',
    options: [
      { text: 'RSI &mdash; it&apos;s the leading indicator so it&apos;s more accurate. Overbought means price will drop.', correct: false, explain: 'Calling RSI &ldquo;leading&rdquo; doesn&apos;t make it more accurate or more important. In a strong trend, RSI can stay overbought for days or weeks while price keeps rising. The 50 EMA is telling you the trend is intact. Ignoring trend confirmation because you believe a &ldquo;leading&rdquo; indicator is superior is exactly the mistake this lesson warns against.' },
      { text: 'Neither one is more &ldquo;trustworthy&rdquo; &mdash; they measure different things. RSI says momentum is extended (caution), EMA says trend is intact (context). I need structure and volume to resolve the conflict.', correct: true, explain: 'Exactly right. The two indicators aren&apos;t conflicting &mdash; they&apos;re measuring different dimensions. RSI says &ldquo;momentum is hot.&rdquo; EMA says &ldquo;trend is bullish.&rdquo; The correct response is to look for structural reasons (supply zone? liquidity target?) and volume (fading?) to determine if the trend will continue or if this is exhaustion. No single indicator wins the tie-break.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'What does &ldquo;leading indicator&rdquo; actually mean in practice?', opts: ['An indicator that predicts future price moves before they happen', 'An indicator that uses a shorter lookback period, making it more reactive to recent data', 'An indicator invented after lagging indicators, making it more advanced', 'An indicator only professionals have access to'], correct: 1, explain: '&ldquo;Leading&rdquo; indicators simply use fewer candles of past data, making them react faster. They do NOT see the future. RSI-14 is &ldquo;leading&rdquo; compared to a 200 SMA only because 14 &lt; 200.' },
  { q: 'RSI reads 80. A lagging 200 SMA is still pointing up. What is the correct interpretation?', opts: ['RSI predicts a reversal is imminent &mdash; sell immediately', 'Momentum is currently strong (RSI) and the broader trend is bullish (SMA) &mdash; no contradiction, just two measurements', 'The indicators are broken because they disagree', 'Always trust the leading indicator over the lagging one'], correct: 1, explain: 'RSI at 80 measures strong current momentum. The 200 SMA confirms a bullish trend. These are two compatible measurements of different dimensions. No conflict exists.' },
  { q: 'Why does a 5-period RSI appear to &ldquo;lead&rdquo; a 50-period SMA?', opts: ['Because RSI uses a secret predictive algorithm', 'Because 5 candles of data reacts faster than 50 candles of data', 'Because momentum always moves before trend', 'Because oscillators are inherently more accurate than moving averages'], correct: 1, explain: 'Simple maths: 5 candles of data responds to changes faster than 50 candles. It appears to &ldquo;lead&rdquo; only because it measures a smaller window. Both are looking backwards.' },
  { q: 'What is the trade-off when you shorten an indicator&apos;s lookback period?', opts: ['You get more accurate predictions with no downside', 'Faster reaction but significantly more false signals (noise)', 'Slower reaction but better accuracy', 'No change in behaviour at all'], correct: 1, explain: 'Shorter lookback = faster reaction = more noise. Longer lookback = smoother = slower. You cannot escape this trade-off. Every setting is a choice between speed and reliability.' },
  { q: 'A 200-period Moving Average finally turns bullish after a long downtrend. This tells you:', opts: ['It&apos;s the perfect time to buy because the trend just started', 'A trend has been developing for weeks/months and is now confirmed &mdash; useful for regime, not timing', 'Price will continue rising for at least 200 more candles', 'The previous downtrend was a false signal'], correct: 1, explain: 'A 200 MA turning bullish confirms a trend that started long ago. It&apos;s a regime identifier (&ldquo;we are now in an uptrend&rdquo;), not an entry signal. Entry timing requires faster tools.' },
  { q: 'Which statement about &ldquo;leading&rdquo; and &ldquo;lagging&rdquo; indicators is TRUE?', opts: ['Leading indicators predict the future, lagging indicators measure the past', 'Both measure past data &mdash; &ldquo;leading&rdquo; ones just use a shorter lookback window', 'Leading indicators are always better than lagging ones', 'Professionals only use leading indicators'], correct: 1, explain: 'Both types calculate from historical price data. The label &ldquo;leading/lagging&rdquo; describes lookback window size, not predictive ability. Professionals use both.' },
  { q: 'What is the ONLY thing in trading that is genuinely forward-looking?', opts: ['RSI divergence', 'MACD histogram', 'Price action itself &mdash; actual orders, structure breaks, and liquidity events', 'Bollinger Band squeeze'], correct: 2, explain: 'Price action represents real orders being executed. A break of structure, a liquidity sweep, or a manipulation pattern shows what market participants ARE DOING right now. No mathematical indicator can match direct market observation.' },
  { q: 'Why do professionals use BOTH fast and slow indicators together?', opts: ['Because more indicators always means better analysis', 'Fast indicators catch turns early (but with noise), slow indicators confirm trends (but with lag) &mdash; together they balance speed and reliability', 'It looks more professional on the chart', 'Brokers require it for compliance reasons'], correct: 1, explain: 'Fast + slow gives you the best of both worlds: early detection of changes (fast) with trend confirmation (slow). The two together resolve the speed/reliability trade-off that neither can solve alone.' },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2,
      color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff'][Math.floor(Math.random() * 5)],
      vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1,
    }));
    let frames = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      frames++;
      if (frames < 250) requestAnimationFrame(draw);
    };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LeadingVsLaggingLesson() {
  const [openTruth, setOpenTruth] = useState<number | null>(null);
  const [openInd, setOpenInd] = useState<number | null>(null);
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

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const u = [...gameAnswers]; u[gameRound] = oi; setGameAnswers(u);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u);
    if (u.every(a => a !== null)) {
      const c = u.filter((a, i) => a === quizQuestions[i].correct).length;
      const pct = Math.round((c / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Believing &ldquo;leading&rdquo; indicators predict the future', right: 'They measure current conditions using LESS historical data. Faster reaction &ne; prediction. A fast car doesn&apos;t see around corners better than a slow one.', icon: '🔮' },
    { wrong: 'Dismissing lagging indicators as &ldquo;too slow to be useful&rdquo;', right: 'Lagging indicators confirm trends and regimes. The 200 MA tells you whether you should be looking for longs or shorts TODAY. That context is priceless.', icon: '🐢' },
    { wrong: 'Setting lookback periods to extreme lows (RSI-3, MA-5) for &ldquo;speed&rdquo;', right: 'Extreme short lookbacks create extreme noise. Every candle looks like a signal. If you want speed, use structure (price action) not ultra-short indicator settings.', icon: '⚡' },
    { wrong: 'Trusting &ldquo;leading&rdquo; indicators MORE than &ldquo;lagging&rdquo; ones in a conflict', right: 'Neither is more trustworthy. They measure different things on different timeframes. Conflicts between fast and slow indicators require ADDITIONAL context (structure, volume, session) to resolve.', icon: '⚖️' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />

      {/* === PROGRESS BAR === */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      {/* === NAV === */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
          ATLAS ACADEMY
        </Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 5</span>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 2</p>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-black leading-[1.1] tracking-tight mb-5">
            Leading vs Lagging<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Truth</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The most misunderstood concept in all of indicator trading. What if we told you that &ldquo;leading&rdquo; indicators don&apos;t actually lead?
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === S00: First — Why This Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Words That Misled a Generation of Traders</p>
            <p className="text-gray-400 leading-relaxed mb-4">Someone, decades ago, decided to label indicators as either <strong className="text-sky-400">&ldquo;leading&rdquo;</strong> or <strong className="text-green-400">&ldquo;lagging.&rdquo;</strong> It sounded intuitive. Leading means ahead. Lagging means behind. So naturally, every beginner concluded: leading indicators see the future, lagging indicators are slow and useless.</p>
            <p className="text-gray-400 leading-relaxed mb-4">This terminology has caused more damage to retail traders than almost any other concept in technical analysis. It created a false belief that certain mathematical formulas can <strong className="text-white">predict</strong> where price will go next.</p>
            <p className="text-gray-400 leading-relaxed">The truth? <strong className="text-amber-400">Both types look backwards.</strong> Both use historical data. The only difference is how FAR back they look. And that difference changes everything about how you should use them.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading forum analysed <strong className="text-white">1,200 trade journals</strong> from members over 12 months. Traders who described their entries as &ldquo;RSI predicted a reversal&rdquo; or &ldquo;Stochastic predicted a bounce&rdquo; had an average win rate of <strong className="text-red-400">31%</strong>. Traders who wrote &ldquo;RSI confirmed momentum shift at a demand zone&rdquo; averaged <strong className="text-green-400">52%</strong>. Same indicator. Completely different understanding.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: The Timeline === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Timeline</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Indicator Lives on This Timeline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The left side is KNOWN (past data). The right side is UNKNOWN (the future). Every indicator &mdash; without exception &mdash; draws its arrows pointing LEFT. The future is fog. No formula can penetrate it.</p>
          <TimelineAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Key Insight</p>
            <p className="text-sm text-gray-400">&ldquo;Leading&rdquo; indicators use a SHORTER arrow (less historical data). &ldquo;Lagging&rdquo; indicators use a LONGER arrow (more historical data). Neither arrow points to the right. Neither penetrates the fog.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: The Rearview Mirror === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Rearview Mirror</p>
          <h2 className="text-2xl font-extrabold mb-4">Wide Mirror vs Narrow Mirror</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Imagine driving a car. A &ldquo;lagging&rdquo; indicator is like a wide rearview mirror &mdash; you can see far behind you with great clarity. A &ldquo;leading&rdquo; indicator is like a narrow mirror &mdash; you see only what just happened, and it&apos;s less smooth. <strong className="text-white">But both mirrors point backwards.</strong> Neither shows you what&apos;s around the next corner.</p>
          <MirrorAnimation />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm font-extrabold text-green-400 mb-1">Wide Mirror (Lagging)</p>
              <p className="text-xs text-gray-400">200 SMA, 50 EMA, MACD (26-period). Smooth, reliable, slow to react. Tells you where the trend HAS BEEN. Best for: regime identification, trend confirmation.</p>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <p className="text-sm font-extrabold text-sky-400 mb-1">Narrow Mirror (&ldquo;Leading&rdquo;)</p>
              <p className="text-xs text-gray-400">RSI (14), Stochastic (14), CCI (20). Reactive, noisy, fast to respond. Tells you what momentum IS doing now. Best for: spotting turns, measuring current conditions.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03: The Lookback Spectrum === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Lookback Spectrum</p>
          <h2 className="text-2xl font-extrabold mb-2">Classify Any Indicator in 5 Seconds</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every indicator sits on a spectrum from &ldquo;fast and noisy&rdquo; to &ldquo;slow and smooth.&rdquo; The position is determined by one thing: <strong className="text-amber-400">lookback period</strong>. Tap each indicator to see the truth behind the label.</p>
          <div className="space-y-3">
            {indicators.map((ind, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenInd(openInd === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-amber-400">{ind.lookback}</span>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">{ind.name}</p>
                      <p className="text-xs text-gray-500">{ind.family} &middot; Label: {ind.label}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openInd === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openInd === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <div>
                          <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What It Actually Does</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: ind.reality }} />
                        </div>
                        {/* Lookback bar */}
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Lookback: {ind.lookback} candles</p>
                          <div className="w-full h-2 rounded-full bg-white/[0.05]">
                            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-green-500" style={{ width: `${Math.min(100, (ind.lookback / 200) * 100)}%` }} />
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-[9px] text-sky-400">Fast / Noisy</span>
                            <span className="text-[9px] text-green-400">Slow / Smooth</span>
                          </div>
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

      {/* === S04: The Five Deep Truths === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Deep Truths</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Truths That Change Everything</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Once you internalise these, you will never misuse an indicator again.</p>
          <div className="space-y-3">
            {deepTruths.map((dt, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenTruth(openTruth === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${dt.color}`}>{dt.title}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTruth === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openTruth === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <p className="text-sm text-gray-400 leading-relaxed">{dt.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S05: The Speed vs Reliability Trade-Off === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Trade-Off</p>
          <h2 className="text-2xl font-extrabold mb-2">Speed vs Reliability &mdash; You Cannot Have Both</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the fundamental law of all indicators. Every time you increase speed (shorter lookback), you sacrifice reliability (more false signals). Every time you increase reliability (longer lookback), you sacrifice speed (later signals).</p>
          <div className="p-6 rounded-2xl glass-card mb-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs mb-5">
              <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/15">
                <p className="font-extrabold text-sky-400 text-lg mb-1">RSI-3</p>
                <p className="text-gray-500">Ultra-fast</p>
                <p className="text-sky-400 font-bold">~40 signals/week</p>
                <p className="text-red-400">~70% false</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <p className="font-extrabold text-amber-400 text-lg mb-1">RSI-14</p>
                <p className="text-gray-500">Default</p>
                <p className="text-amber-400 font-bold">~8 signals/week</p>
                <p className="text-yellow-400">~45% false</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15">
                <p className="font-extrabold text-green-400 text-lg mb-1">RSI-50</p>
                <p className="text-gray-500">Ultra-smooth</p>
                <p className="text-green-400 font-bold">~1 signal/week</p>
                <p className="text-green-400">~20% false</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Same indicator (RSI). Same chart. Same timeframe. Only the lookback changes. The trade-off is inescapable.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Professional Solution</p>
            <p className="text-sm text-gray-400">Use a FAST indicator to detect potential changes AND a SLOW indicator to confirm them. RSI-14 says momentum is shifting? Wait for the 50 EMA to agree. Now you have speed AND reliability &mdash; not from one tool, but from the combination of two.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: How to Actually Use Both === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Practical Application</p>
          <h2 className="text-2xl font-extrabold mb-2">The Professional Fast + Slow Framework</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Here&apos;s exactly how professionals combine fast and slow indicators. It&apos;s not about choosing one over the other &mdash; it&apos;s about giving them different JOBS.</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-green-400 mb-2">Step 1: Slow Indicator Sets the Regime</p>
              <p className="text-sm text-gray-400">&ldquo;Price is above the 50 EMA &rarr; I am only looking for LONGS today.&rdquo; The slow indicator tells you WHAT you&apos;re looking for. It does not tell you WHEN to enter.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-sky-400 mb-2">Step 2: Fast Indicator Detects Opportunity</p>
              <p className="text-sm text-gray-400">&ldquo;RSI pulled back to 40 within a bullish regime &rarr; momentum has cooled, potential pullback entry.&rdquo; The fast indicator tells you WHEN conditions are favourable. It still doesn&apos;t tell you to enter.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">Step 3: Structure Provides the Trigger</p>
              <p className="text-sm text-gray-400">&ldquo;RSI at 40 + price at a demand zone from Level 3 + London session open &rarr; NOW I have a trade.&rdquo; The actual entry comes from PRICE ACTION, not from any indicator. Indicators set the stage. Structure pulls the trigger.</p>
            </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <p className="text-sm font-extrabold text-red-400" dangerouslySetInnerHTML={{ __html: m.wrong }} />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMistake === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMistake === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-xs font-bold text-green-400 mb-1">&#9989; Do This Instead</p>
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S08: The Maths === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Maths</p>
          <h2 className="text-2xl font-extrabold mb-2">Why &ldquo;Leading&rdquo; Is a Marketing Term</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Let&apos;s put it in concrete numbers to make the point undeniable.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm font-extrabold text-sky-400 mb-2">RSI-14 &ldquo;Leading&rdquo; Indicator</p>
              <p className="text-sm text-gray-400">Uses the last <strong className="text-white">14 candles</strong>. On a 1H chart, that&apos;s 14 hours of data. On a Daily chart, 14 days. Every value RSI displays was calculated from data that <em>already happened</em>. The &ldquo;leading&rdquo; label means it reacts to the last 14 hours faster than a tool watching the last 200 hours. That&apos;s it.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm font-extrabold text-green-400 mb-2">200 SMA &ldquo;Lagging&rdquo; Indicator</p>
              <p className="text-sm text-gray-400">Uses the last <strong className="text-white">200 candles</strong>. On a 1H chart, that&apos;s 200 hours (~8.3 days). On a Daily chart, ~10 months. It averages 200 data points, producing a very smooth line that changes direction slowly. The &ldquo;lagging&rdquo; label means it takes longer to respond because it has more data to average.</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm font-extrabold text-amber-400 mb-2">&#128161; The Punchline</p>
              <p className="text-sm text-gray-400">Both use <strong className="text-white">past candle data</strong>. RSI-14 uses 14 candles of the past. SMA-200 uses 200 candles of the past. Neither uses a single candle from the future. The difference between &ldquo;leading&rdquo; and &ldquo;lagging&rdquo; is literally just the number of historical candles in the formula. That&apos;s all.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Leading vs Lagging Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios that will prove whether you&apos;ve truly unlearned the myth.</p>

          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span>
              <span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />

            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={oi}>
                    <button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}>
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">
                  Next Round &rarr;
                </button>
              </motion.div>
            )}

            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p>
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'The myth is dead. You understand the truth.' : gameScore >= 3 ? 'Good — the old terminology is sticky. Keep reinforcing the correct mental model.' : 'The leading/lagging myth runs deep. Re-read sections 01–04 and try again.'}</p>
              </motion.div>
            )}
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
                  {q.opts.map((opt, oi) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />;
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {quizDone && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizScore}%</p>
              <p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}

          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🪞</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 5: Leading vs Lagging &mdash; The Truth</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Myth Destroyer &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* === Back to Academy === */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          &larr; Back to Academy
        </Link>
      </section>
    </div>
  );
}
