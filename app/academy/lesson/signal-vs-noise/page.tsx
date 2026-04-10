// app/academy/lesson/signal-vs-noise/page.tsx
// ATLAS Academy — Lesson 5.4: Signal vs Noise [PRO]
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
// ANIMATION 1: Radio Static — Raw vs Filtered Signal
// Left: chaotic wave with tons of spikes (all "signals")
// Right: clean wave with only the big moves highlighted
// ============================================================
function RadioStaticAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;
    const mid = w / 2;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same market data — two very different approaches', w / 2, 16);

    // --- LEFT: Unfiltered (all signals) ---
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('UNFILTERED: Every signal acted on', mid / 2, 34);

    const leftY = h * 0.55;
    const amp = h * 0.25;

    // Chaotic waveform with lots of noise
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 15; x < mid - 15; x++) {
      const noise = Math.sin(x * 0.3 + t) * 8 + Math.sin(x * 0.7 + t * 2.3) * 12 + Math.sin(x * 1.5 + t * 0.7) * 6 + Math.cos(x * 0.15 + t * 0.5) * 20;
      const y = leftY + noise;
      x === 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Many small triangles marking every crossing (noise signals)
    const signals1: number[] = [];
    for (let i = 0; i < 18; i++) {
      const sx = 20 + i * ((mid - 40) / 18);
      const sy = leftY + Math.sin(sx * 0.3 + t) * 8 + Math.sin(sx * 0.7 + t * 2.3) * 12;
      signals1.push(sx);
      ctx.fillStyle = `rgba(239,68,68,${0.3 + Math.sin(t + i) * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx - 4, sy - 2);
      ctx.lineTo(sx + 4, sy - 2);
      ctx.closePath();
      ctx.fill();
    }

    // Stats
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('18 signals / week', mid / 2, h - 28);
    ctx.font = '9px system-ui';
    ctx.fillText('~70% are noise → net loss', mid / 2, h - 14);

    // --- DIVIDER ---
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mid, 28);
    ctx.lineTo(mid, h - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- RIGHT: Filtered (quality signals only) ---
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FILTERED: Only quality signals acted on', mid + mid / 2, 34);

    const rightBase = mid + 15;
    const rightEnd = w - 15;

    // Same underlying waveform but smoother representation
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = rightBase; x < rightEnd; x++) {
      const relX = x - rightBase;
      const clean = Math.cos(relX * 0.04 + t * 0.5) * 25 + Math.sin(relX * 0.08 + t * 0.3) * 10;
      const y = leftY + clean;
      x === rightBase ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Only 3 strong signals — bigger, bolder markers
    const goodSignals = [0.2, 0.52, 0.82];
    goodSignals.forEach((pct, i) => {
      const sx = rightBase + (rightEnd - rightBase) * pct;
      const relX = sx - rightBase;
      const sy = leftY + Math.cos(relX * 0.04 + t * 0.5) * 25 + Math.sin(relX * 0.08 + t * 0.3) * 10;

      // Glow
      const gl = ctx.createRadialGradient(sx, sy - 12, 0, sx, sy - 12, 16);
      gl.addColorStop(0, 'rgba(34,197,94,0.15)');
      gl.addColorStop(1, 'transparent');
      ctx.fillStyle = gl;
      ctx.fillRect(sx - 16, sy - 28, 32, 32);

      // Triangle
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 16);
      ctx.lineTo(sx - 6, sy - 6);
      ctx.lineTo(sx + 6, sy - 6);
      ctx.closePath();
      ctx.fill();

      // A+ label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('A+', sx, sy - 20);
    });

    // Stats
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('3 signals / week', mid + mid / 2, h - 28);
    ctx.font = '9px system-ui';
    ctx.fillText('~65% win rate → net profit', mid + mid / 2, h - 14);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 2: Funnel Filter
// Many dots enter from top (raw signals), pass through filters,
// only a few emerge at the bottom (quality setups)
// ============================================================
function FunnelFilterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const cx = w / 2;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Quality Filter — From 100 signals to 3 setups', cx, 16);

    // Funnel shape
    const funnelTop = 40;
    const funnelBot = h - 30;
    const topW = w * 0.7;
    const botW = w * 0.12;

    // Funnel outline
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, funnelTop);
    ctx.lineTo(cx - botW / 2, funnelBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + topW / 2, funnelTop);
    ctx.lineTo(cx + botW / 2, funnelBot);
    ctx.stroke();

    // Funnel gradient fill
    const fGrad = ctx.createLinearGradient(0, funnelTop, 0, funnelBot);
    fGrad.addColorStop(0, 'rgba(239,68,68,0.04)');
    fGrad.addColorStop(0.5, 'rgba(245,158,11,0.03)');
    fGrad.addColorStop(1, 'rgba(34,197,94,0.04)');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, funnelTop);
    ctx.lineTo(cx + topW / 2, funnelTop);
    ctx.lineTo(cx + botW / 2, funnelBot);
    ctx.lineTo(cx - botW / 2, funnelBot);
    ctx.closePath();
    ctx.fill();

    // Filter lines
    const filters = [
      { y: 0.22, label: 'Structure?', color: 'rgba(239,68,68,0.3)' },
      { y: 0.42, label: 'Session?', color: 'rgba(245,158,11,0.3)' },
      { y: 0.62, label: 'Volume?', color: 'rgba(14,165,233,0.3)' },
      { y: 0.80, label: 'Confluence?', color: 'rgba(34,197,94,0.3)' },
    ];

    filters.forEach(fl => {
      const fy = funnelTop + (funnelBot - funnelTop) * fl.y;
      const frac = fl.y;
      const lw = topW * (1 - frac) + botW * frac;
      ctx.strokeStyle = fl.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - lw / 2, fy);
      ctx.lineTo(cx + lw / 2, fy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = fl.color.replace('0.3', '0.6');
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(fl.label, cx - lw / 2 - 5, fy + 3);
    });

    // Falling dots — many at top, few at bottom
    for (let i = 0; i < 30; i++) {
      const seed = i * 137.508 + t * 40;
      const baseY = (seed % (funnelBot - funnelTop + 60)) + funnelTop - 20;
      const progress = (baseY - funnelTop) / (funnelBot - funnelTop);

      // Dots get eliminated as they descend
      const surviveChance = 1 - progress * 0.9;
      const seedHash = Math.sin(i * 12.9898) * 43758.5453;
      const survive = (seedHash % 1 + 1) % 1 < surviveChance;

      if (!survive && progress > 0.2) continue;

      const maxSpread = (topW * (1 - progress) + botW * progress) / 2 - 8;
      const dx = Math.sin(i * 2.3 + t * 0.5) * maxSpread * 0.7;

      const dotR = progress > 0.75 ? 4 : 2.5;
      const alpha = progress > 0.75 ? 0.8 : 0.25 + progress * 0.2;

      if (progress > 0.75) {
        // Surviving dots — green, larger
        ctx.fillStyle = `rgba(34,197,94,${alpha})`;
      } else if (progress > 0.4) {
        ctx.fillStyle = `rgba(245,158,11,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(cx + dx, baseY, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('~100 raw indicator signals', cx, funnelTop - 5);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('2–3 quality setups', cx, funnelBot + 16);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// FILTER RULES
// ============================================================
const filterRules = [
  { name: 'Filter 1: Structure', question: 'Is price at a meaningful level?', detail: 'An RSI divergence at random price is noise. An RSI divergence at a demand zone, order block, or key support level is a signal. <strong class="text-white">The indicator reading only matters if the LOCATION matters.</strong> This single filter eliminates 60%+ of false signals.', icon: '🏗️', color: 'text-red-400', stat: '~60% of signals eliminated' },
  { name: 'Filter 2: Session Timing', question: 'Is smart money active right now?', detail: 'A MACD crossover at 3am during the Asian session on EUR/USD is noise. The same crossover at London open is meaningful because institutional volume is present. <strong class="text-white">Indicators are only reliable when the market participants that move price are actually trading.</strong>', icon: '🕐', color: 'text-amber-400', stat: '~20% more eliminated' },
  { name: 'Filter 3: Volume Confirmation', question: 'Is participation backing this move?', detail: 'A breakout with RSI above 60 but volume at 50% of average is suspicious. The same breakout with volume at 200% of average has conviction behind it. <strong class="text-white">Volume is the lie detector of the market.</strong> Moves without volume are moves without commitment.', icon: '📊', color: 'text-sky-400', stat: '~10% more eliminated' },
  { name: 'Filter 4: Multi-Dimensional Confluence', question: 'Do indicators from DIFFERENT families agree?', detail: 'RSI says momentum is strong (momentum family). Volume is rising (volume family). Price is above the 50 EMA (trend family). Three independent data streams all pointing the same direction. That is genuine confluence &mdash; not three momentum tools saying the same thing.', icon: '🎯', color: 'text-green-400', stat: '~7% more eliminated' },
  { name: 'Filter 5: Timeframe Alignment', question: 'Does the higher timeframe support this?', detail: 'A bullish RSI signal on the 15-minute chart means nothing if the 4-hour chart is in a clear downtrend. <strong class="text-white">Always trade in the direction of the higher timeframe.</strong> The 15-minute signal should CONFIRM the 4-hour bias, not contradict it.', icon: '🔭', color: 'text-accent-400', stat: 'Final ~3% eliminated → only A+ setups remain' },
];

// ============================================================
// NOISE TYPES
// ============================================================
const noiseTypes = [
  { type: 'Random Oscillation Noise', desc: 'RSI crosses above 50 then immediately dips below. MACD histogram flickers between positive and negative. These tiny oscillations around boundaries generate dozens of &ldquo;signals&rdquo; per day that mean absolutely nothing.', fix: 'Wait for a SUSTAINED move past the boundary, not just a single-candle touch. Require 2&ndash;3 candles of confirmation.', icon: '📉' },
  { type: 'Flat Market Noise', desc: 'When price is ranging in a tight 20-pip channel, oscillators will cycle between overbought and oversold constantly. Every cycle looks like a &ldquo;signal&rdquo; but price is going nowhere. The indicator is reacting to noise within a sideways box.', fix: 'Check the higher timeframe. If the 4H or Daily is ranging, lower-timeframe indicator signals in BOTH directions are likely noise. Wait for the range to break.', icon: '📦' },
  { type: 'News Spike Noise', desc: 'A single massive candle from a news event sends RSI from 45 to 85 in one candle. This is not a genuine momentum signal &mdash; it&apos;s a one-bar anomaly that will likely be retraced. The indicator reading is technically accurate but contextually meaningless.', fix: 'Avoid trading indicator signals within 30 minutes of high-impact news releases. Let the dust settle. Genuine momentum shifts from news will be visible in the following candles, not just the spike.', icon: '📰' },
  { type: 'Low Timeframe Chaos', desc: 'On the 1-minute chart, RSI will cross 70 and 30 dozens of times per day. Each crossing is a mathematically valid &ldquo;signal&rdquo; but statistically worthless. The lower the timeframe, the higher the noise ratio.', fix: 'Use indicators on the 1H or 4H chart for signal quality. Use lower timeframes only for ENTRY TIMING after the higher timeframe has given the direction.', icon: '⏱️' },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'RSI crosses above 50 on the EUR/USD 15-minute chart at 2:30am GMT (Asian session). There is no support/resistance level nearby. Volume is below average. What is this signal?',
    options: [
      { text: 'A valid bullish signal &mdash; RSI confirmed upward momentum', correct: false, explain: 'This fails every filter. No structure (random price level), wrong session (Asian = low liquidity for EUR/USD), low volume (no institutional participation), no confluence, and no higher timeframe alignment was checked. This is textbook noise &mdash; a random oscillation in a quiet market.' },
      { text: 'Noise &mdash; fails structure, session, volume, and confluence filters. Not tradeable.', correct: true, explain: 'Exactly. An RSI cross above 50 happens multiple times per day. Without structural significance, session timing, volume confirmation, and multi-dimensional confluence, it is just a number passing through a line. The five filters exist to protect you from exactly this kind of &ldquo;signal.&rdquo;' },
    ],
  },
  {
    scenario: 'RSI shows bullish divergence at a 4H demand zone during London open. Volume is rising. The daily trend is bullish. MACD histogram is turning positive. How many quality filters does this pass?',
    options: [
      { text: 'Two filters &mdash; RSI and MACD', correct: false, explain: 'Count again: (1) Structure = demand zone ✓, (2) Session = London open ✓, (3) Volume = rising ✓, (4) Confluence = RSI divergence + MACD histogram + volume from different families ✓, (5) Timeframe = daily trend is bullish ✓. That&apos;s all 5 filters passed. This is an A+ setup.' },
      { text: 'All five &mdash; structure, session, volume, multi-dimensional confluence, and timeframe alignment. This is an A+ setup.', correct: true, explain: 'Exactly right. Structure (demand zone), session (London), volume (rising), confluence (RSI + MACD + volume from 3 different families), timeframe (daily bullish). When all five filters align, the signal-to-noise ratio is extremely high. These setups are rare &mdash; maybe 2&ndash;3 per week &mdash; but they are the ones that make money.' },
    ],
  },
  {
    scenario: 'On a Monday morning, you look at your chart and count 47 RSI crossovers on the 5-minute chart over the past 24 hours. How many of these are likely tradeable signals?',
    options: [
      { text: 'All 47 &mdash; each crossover is a valid signal that should be evaluated', correct: false, explain: '47 RSI crossovers on a 5-minute chart in 24 hours is approximately one every 30 minutes. The vast majority are noise &mdash; random oscillations in a low-timeframe environment. After applying all five filters (structure, session, volume, confluence, timeframe), you would likely have 0&ndash;2 tradeable setups from those 47 raw signals. That is a 95%+ noise rate.' },
      { text: 'Probably 0&ndash;2 after applying quality filters. The 5-minute timeframe generates extreme noise &mdash; most crossovers are meaningless.', correct: true, explain: 'Correct. Lower timeframes amplify noise exponentially. A 5-minute RSI crosses 50 roughly every 15&ndash;30 minutes. After filtering for structure, session, volume, confluence, and higher-TF alignment, perhaps 1&ndash;2 per day survive &mdash; and even those need careful evaluation. Quantity of signals is the enemy of quality.' },
    ],
  },
  {
    scenario: 'A trader uses 3 filters: (1) RSI overbought/oversold, (2) Stochastic overbought/oversold, and (3) CCI extreme reading. They call this &ldquo;triple confluence filtering.&rdquo; What is the problem?',
    options: [
      { text: 'Nothing &mdash; three filters means triple the protection against noise', correct: false, explain: 'RSI, Stochastic, and CCI are all momentum oscillators. They measure the same dimension of the market in slightly different mathematical ways. When RSI says overbought, Stochastic and CCI will ALMOST ALWAYS agree because they are calculated from the same underlying data. This is not triple filtering &mdash; it is the same filter applied three times. Zero noise reduction.' },
      { text: 'All three are momentum oscillators &mdash; they measure the same dimension. This is redundancy disguised as filtering. Real filtering requires checks from different categories: structure, session, volume, trend.', correct: true, explain: 'Exactly. Genuine noise filtering requires INDEPENDENT checks. Structure (is there a level?), session (is smart money present?), volume (is there participation?), and trend (does the higher TF agree?) are independent. Three momentum readings are correlated &mdash; they rise and fall together. Correlated filters do not reduce noise.' },
    ],
  },
  {
    scenario: 'NFP (Non-Farm Payrolls) just released. A massive candle sends RSI from 48 to 82 in one bar. A trader says: &ldquo;RSI just gave a strong bullish signal &mdash; momentum is confirmed!&rdquo; Is this a quality signal?',
    options: [
      { text: 'Yes &mdash; RSI jumped to 82 which confirms very strong upward momentum', correct: false, explain: 'A single news candle distorts all oscillator readings. RSI jumped to 82 because one bar had an enormous gain relative to the previous 13. This is a one-candle anomaly, not a sustained momentum shift. The price spike is often retraced within minutes. Trading oscillator readings during news events is one of the highest-noise environments possible.' },
      { text: 'No &mdash; a single news candle distorts RSI. This is a one-bar anomaly, not sustained momentum. Wait 30+ minutes for the dust to settle before trusting any indicator reading.', correct: true, explain: 'Correct. News candles are outliers that break the statistical assumptions behind every oscillator. RSI assumes relatively normal candle-to-candle changes. A 50-pip spike in 1 second is not normal. Let the market digest the news, then re-evaluate. Genuine momentum from news will show sustained follow-through, not just one spike.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'If an indicator produces 20 signals per week and only 3 are profitable, what is the noise ratio?', opts: ['15%', '85%', '3%', '20%'], correct: 1, explain: '17 out of 20 signals were noise (unprofitable). 17/20 = 85% noise ratio. This is typical of unfiltered indicator signals on lower timeframes.' },
  { q: 'Which is the MOST effective single filter for reducing indicator noise?', opts: ['Using a shorter lookback period', 'Adding more indicators of the same type', 'Requiring structural significance (key level) before acting on any signal', 'Switching to a 1-minute timeframe for precision'], correct: 2, explain: 'Structural context (is price at a meaningful level?) is the single most powerful noise filter. It eliminates 60%+ of false signals by requiring the indicator reading to occur at a location where the market has shown it cares.' },
  { q: 'A MACD crossover at 3am GMT on EUR/USD during Asian session is likely:', opts: ['A strong signal because MACD is a reliable indicator', 'Noise &mdash; institutional EUR/USD participants are not active during Asian hours', 'A guaranteed reversal because it happened at night', 'More reliable than a London session crossover because there is less manipulation'], correct: 1, explain: 'EUR/USD is driven by European and American institutional flow. During the Asian session, volume and liquidity are low. Indicator signals in low-liquidity environments are predominantly noise.' },
  { q: 'True confluence filtering requires indicators from:', opts: ['The same family (e.g., 3 momentum oscillators) for confirmation', 'Different families (e.g., momentum + volume + trend) for independent verification', 'Only one family, used on multiple timeframes', 'As many families as possible, regardless of relevance'], correct: 1, explain: 'Genuine confluence means independent data streams agreeing. Momentum + Volume + Trend each measure a different market dimension. Three momentum tools measure the same thing &mdash; that is redundancy, not confluence.' },
  { q: 'Why do lower timeframes (1m, 5m) produce more noise than higher timeframes (1H, 4H)?', opts: ['Lower timeframes have broken mathematical formulas', 'Each candle contains less price information, so oscillator calculations are less stable and cross boundaries more frequently', 'Lower timeframes are designed for noise', 'Higher timeframes are always more profitable'], correct: 1, explain: 'A 5-minute candle contains very little price movement data. Small random fluctuations cause oscillators to swing dramatically. A 4-hour candle contains 48x more data, producing smoother, more meaningful oscillator readings.' },
  { q: 'A signal passes structure, session, and volume filters but contradicts the higher timeframe trend. You should:', opts: ['Take the trade anyway &mdash; 3 out of 5 filters is enough', 'Skip the trade &mdash; higher timeframe alignment is critical for probability', 'Double your position size because 3 filters passed', 'Remove the higher timeframe from your analysis'], correct: 1, explain: 'Higher timeframe alignment is the final and often most important filter. Trading against the 4H or Daily trend means you are fighting the dominant order flow. Even with structure, session, and volume, the probability is significantly lower without TF alignment.' },
  { q: 'What is the approximate noise ratio of raw (unfiltered) RSI signals on a 15-minute chart?', opts: ['About 20% noise', 'About 50% noise', 'About 80&ndash;90% noise', 'About 5% noise'], correct: 2, explain: 'On a 15-minute chart, RSI will generate dozens of overbought/oversold and centreline crossover signals per day. After rigorous filtering, perhaps 1&ndash;3 per day are actionable. That is an 80&ndash;90% noise rate &mdash; entirely normal for unfiltered lower-timeframe signals.' },
  { q: 'The purpose of filtering indicator signals is to:', opts: ['Eliminate all losing trades', 'Reduce the number of trades while dramatically increasing the quality of each one', 'Make indicators predict the future more accurately', 'Confirm every indicator reading is correct'], correct: 1, explain: 'Filtering does not eliminate losses &mdash; losses are a cost of doing business. Filtering reduces QUANTITY while increasing QUALITY. Fewer trades, higher win rate, better risk-reward. 3 quality trades per week beats 20 noise trades per week every time.' },
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
export default function SignalVsNoiseLesson() {
  const [openFilter, setOpenFilter] = useState<number | null>(null);
  const [openNoise, setOpenNoise] = useState<number | null>(null);
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
  // Interactive filter demo
  const [fStructure, setFStructure] = useState(false);
  const [fSession, setFSession] = useState(false);
  const [fVolume, setFVolume] = useState(false);
  const [fConfluence, setFConfluence] = useState(false);
  const [fTimeframe, setFTimeframe] = useState(false);

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

  // Filter demo calculations
  const filtersOn = [fStructure, fSession, fVolume, fConfluence, fTimeframe].filter(Boolean).length;
  const rawSignals = 100;
  const surviving = filtersOn === 0 ? 100 : filtersOn === 1 ? 40 : filtersOn === 2 ? 18 : filtersOn === 3 ? 8 : filtersOn === 4 ? 4 : 2;
  const winRate = filtersOn === 0 ? 28 : filtersOn === 1 ? 38 : filtersOn === 2 ? 46 : filtersOn === 3 ? 54 : filtersOn === 4 ? 60 : 67;
  const expectancy = filtersOn === 0 ? -0.44 : filtersOn === 1 ? -0.12 : filtersOn === 2 ? 0.14 : filtersOn === 3 ? 0.38 : filtersOn === 4 ? 0.52 : 0.74;

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Acting on every indicator signal without filtering', right: 'Apply the 5-filter checklist: structure, session, volume, confluence, timeframe alignment. If a signal fails any filter, it is noise.', icon: '📢' },
    { wrong: 'Using 3 momentum oscillators as &ldquo;triple confirmation&rdquo;', right: 'RSI + Stoch + CCI agreeing is one measurement repeated 3 times. Genuine filtering requires INDEPENDENT dimensions: structure, volume, trend.', icon: '📊' },
    { wrong: 'Trading lower timeframes (1m, 5m) for &ldquo;more signals&rdquo;', right: 'More signals = more noise. Quality lives on the 1H and 4H. Use lower TFs only for entry precision AFTER the higher TF gives direction.', icon: '⏱️' },
    { wrong: 'Trading indicator signals during major news events', right: 'News candles are outliers that distort all oscillator calculations. Wait 30+ minutes after high-impact releases. Let the market show sustained behaviour before trusting any reading.', icon: '📰' },
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
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-black leading-[1.1] tracking-tight mb-5">
            Signal vs<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Noise</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Indicators produce hundreds of signals per week. Only 2&ndash;3 are worth trading. This lesson teaches you to tell the difference &mdash; and ignore everything else.
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
            <p className="text-xl font-extrabold mb-3">The 97% Problem</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine a radio station broadcasting your favourite song. But between every note, there are 30 seconds of static. If you tried to listen to every sound &mdash; song AND static &mdash; you&apos;d go insane and hear nothing useful.</p>
            <p className="text-gray-400 leading-relaxed mb-4">That is exactly what happens when you act on raw indicator signals. <strong className="text-amber-400">On a typical 15-minute chart, RSI alone generates 15&ndash;20 &ldquo;signals&rdquo; per day.</strong> MACD adds another 10&ndash;15. Stochastic adds 10 more. That&apos;s 35&ndash;45 raw signals per day. Maybe 1&ndash;2 are tradeable. The rest are static.</p>
            <p className="text-gray-400 leading-relaxed">The skill is not finding signals. Any indicator can find signals. <strong className="text-white">The skill is filtering noise.</strong> That single ability separates profitable traders from the 90% who lose.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trader journalled <strong className="text-white">6 months of trades</strong> (412 total). He categorised each entry as &ldquo;filtered&rdquo; (met all 5 quality criteria) or &ldquo;unfiltered&rdquo; (took the indicator signal alone). Result: <strong className="text-green-400">filtered trades = 58% WR, +0.72R expectancy</strong>. <strong className="text-red-400">Unfiltered trades = 31% WR, &minus;0.38R expectancy</strong>. Same trader. Same indicators. Same market. The ONLY difference was noise filtering.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Radio Static === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Problem Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">18 Signals vs 3 Signals &mdash; Same Market</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Left: a trader who acts on EVERY indicator signal. Right: a trader who filters for quality. Same market, same week, drastically different results.</p>
          <RadioStaticAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Maths</p>
            <p className="text-sm text-gray-400">18 trades &times; 30% WR &times; 1:2 R:R = <strong className="text-red-400">&minus;1.8R per week</strong>. 3 trades &times; 65% WR &times; 1:2 R:R = <strong className="text-green-400">+2.85R per week</strong>. Fewer trades, more profit. Always.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: The Funnel === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Quality Funnel</p>
          <h2 className="text-2xl font-extrabold mb-4">From 100 Raw Signals to 2&ndash;3 Setups</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every raw indicator signal must pass through five independent filters. Each filter eliminates a percentage of noise. Only the signals that survive ALL five filters become tradeable setups.</p>
          <FunnelFilterAnimation />
        </motion.div>
      </section>

      {/* === S03: The Five Filters === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Five Filters</p>
          <h2 className="text-2xl font-extrabold mb-2">Your Noise Elimination Checklist</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before acting on ANY indicator signal, it must pass ALL five of these independent checks. Fail one = noise. Pass all five = potential A+ setup.</p>
          <div className="space-y-3">
            {filterRules.map((fr, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenFilter(openFilter === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fr.icon}</span>
                    <div>
                      <p className={`text-sm font-extrabold ${fr.color}`}>{fr.name}</p>
                      <p className="text-xs text-gray-500">{fr.question}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFilter === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: fr.detail }} />
                        <p className="text-xs font-mono text-gray-600">{fr.stat}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S04: Interactive Filter Demo === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Try It Yourself</p>
          <h2 className="text-2xl font-extrabold mb-2">Interactive Signal Filter</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Toggle each filter on and off. Watch how the number of surviving signals, win rate, and expectancy change. Start with all filters OFF to see the raw noise problem.</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            {[
              { label: 'Structure', on: fStructure, set: setFStructure, color: '#ef4444' },
              { label: 'Session', on: fSession, set: setFSession, color: '#f59e0b' },
              { label: 'Volume', on: fVolume, set: setFVolume, color: '#0ea5e9' },
              { label: 'Confluence', on: fConfluence, set: setFConfluence, color: '#d946ef' },
              { label: 'Timeframe', on: fTimeframe, set: setFTimeframe, color: '#22c55e' },
            ].map((f, i) => (
              <button key={i} onClick={() => f.set(!f.on)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${f.on ? 'bg-white/[0.06] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${f.on ? 'border-green-400 bg-green-500/20' : 'border-gray-600'}`}>
                    {f.on && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                  <span className="text-sm font-bold" style={{ color: f.color }}>{f.label}</span>
                </div>
                <span className="text-xs text-gray-500">{f.on ? 'ON' : 'OFF'}</span>
              </button>
            ))}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-gray-500">Signals / Week</p>
                <p className={`text-xl font-extrabold ${surviving > 20 ? 'text-red-400' : surviving > 8 ? 'text-amber-400' : 'text-green-400'}`}>{surviving}</p>
                <p className="text-[10px] text-gray-600">of {rawSignals} raw</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-gray-500">Win Rate</p>
                <p className={`text-xl font-extrabold ${winRate < 40 ? 'text-red-400' : winRate < 55 ? 'text-amber-400' : 'text-green-400'}`}>{winRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-gray-500">Expectancy (R)</p>
                <p className={`text-xl font-extrabold ${expectancy < 0 ? 'text-red-400' : expectancy < 0.3 ? 'text-amber-400' : 'text-green-400'}`}>{expectancy > 0 ? '+' : ''}{expectancy.toFixed(2)}R</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">{filtersOn === 0 ? 'All filters OFF — pure noise. This is how most retail traders operate.' : filtersOn < 3 ? 'Some filtering but not enough. Keep adding filters.' : filtersOn < 5 ? 'Getting closer to A+ quality. Every filter added dramatically improves results.' : 'All 5 filters ON — maximum quality. Fewer trades, much higher expectancy.'}</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Four Types of Noise === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Know Your Enemy</p>
          <h2 className="text-2xl font-extrabold mb-2">Four Types of Indicator Noise</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not all noise is the same. Understanding WHERE noise comes from helps you avoid it before you even look at the indicator.</p>
          <div className="space-y-3">
            {noiseTypes.map((n, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenNoise(openNoise === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{n.icon}</span>
                    <p className="text-sm font-extrabold text-amber-400">{n.type}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openNoise === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openNoise === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: n.desc }} />
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-xs font-bold text-green-400 mb-1">&#9989; The Fix</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: n.fix }} />
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

      {/* === S06: The Maths of Filtering === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Maths</p>
          <h2 className="text-2xl font-extrabold mb-2">Why Fewer Trades = More Profit</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This feels counterintuitive until you see the numbers. Let&apos;s compare two traders over one month (20 trading days):</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-sm font-extrabold text-red-400 mb-3">Trader A: No Filter</p>
                <p className="text-xs text-gray-400 mb-1">80 trades / month</p>
                <p className="text-xs text-gray-400 mb-1">28% win rate</p>
                <p className="text-xs text-gray-400 mb-1">1:2 risk-reward</p>
                <p className="text-xs text-gray-400 mb-3">1% risk per trade</p>
                <p className="text-xs text-gray-500">Wins: 22 &times; 2R = +44R</p>
                <p className="text-xs text-gray-500">Losses: 58 &times; 1R = &minus;58R</p>
                <p className="text-sm font-extrabold text-red-400 mt-2">Net: &minus;14R (&minus;14%)</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="text-sm font-extrabold text-green-400 mb-3">Trader B: 5-Filter System</p>
                <p className="text-xs text-gray-400 mb-1">12 trades / month</p>
                <p className="text-xs text-gray-400 mb-1">62% win rate</p>
                <p className="text-xs text-gray-400 mb-1">1:2 risk-reward</p>
                <p className="text-xs text-gray-400 mb-3">1% risk per trade</p>
                <p className="text-xs text-gray-500">Wins: 7 &times; 2R = +14R</p>
                <p className="text-xs text-gray-500">Losses: 5 &times; 1R = &minus;5R</p>
                <p className="text-sm font-extrabold text-green-400 mt-2">Net: +9R (+9%)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Same indicators. Same market. Same risk. <strong className="text-white">The only difference is noise filtering.</strong> 23% monthly swing between the two approaches.</p>
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

      {/* === S08: The Golden Rule === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Golden Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">If In Doubt, It&apos;s Noise</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the single most profitable rule you will ever learn:</p>
          <div className="p-6 rounded-2xl glass-card text-center">
            <p className="text-lg font-extrabold text-amber-400 mb-3">&ldquo;If you have to convince yourself it&apos;s a setup, it isn&apos;t.&rdquo;</p>
            <p className="text-sm text-gray-400 leading-relaxed">A+ setups are obvious. They jump off the chart. You don&apos;t need to squint, overlay 5 indicators, or ask Discord whether it&apos;s valid. If you find yourself rationalising, justifying, or reaching for extra confirmation &mdash; <strong className="text-white">that is your brain trying to turn noise into signal</strong>. Walk away. The next A+ setup is coming.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15 text-center">
              <p className="text-sm font-extrabold text-green-400 mb-1">A+ Setup Feels Like</p>
              <p className="text-xs text-gray-400">&ldquo;I see it immediately. Structure, session, volume, confluence all check out. This is a trade.&rdquo;</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-sm font-extrabold text-red-400 mb-1">Noise Feels Like</p>
              <p className="text-xs text-gray-400">&ldquo;Well, RSI is kind of oversold, and if I squint the MACD might cross, and maybe that&apos;s a demand zone...&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Signal or Noise Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real scenarios. Can you separate the A+ setups from the static?</p>

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
                    <button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>
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
                <button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p>
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Your noise filter is calibrated. Trust it.' : gameScore >= 3 ? 'Getting there — some noise still slipping through.' : 'The static is still loud. Re-read the five filters and try again.'}</p>
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
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📡</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 5: Signal vs Noise</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Noise Eliminator &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
