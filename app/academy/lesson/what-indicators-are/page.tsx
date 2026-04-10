// app/academy/lesson/what-indicators-are/page.tsx
// ATLAS Academy — Lesson 5.1: What Indicators Actually Are [PRO]
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
// ANIMATION 1: Thermometer vs Crystal Ball
// Split screen — Left: crystal ball with floating "?" (WRONG)
// Right: thermometer with oscillating mercury measuring NOW (RIGHT)
// ============================================================
function ThermometerVsCrystalBall() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const mid = w / 2;
    const t = f * 0.02;

    // --- LEFT SIDE: Crystal Ball (WRONG) ---
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('WRONG: "Crystal Ball"', mid / 2, 22);

    const ballX = mid / 2;
    const ballY = h * 0.48;
    const r = Math.min(50, h * 0.22);
    // Glow
    const glow = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, r * 1.5);
    glow.addColorStop(0, `rgba(168, 85, 247, ${0.08 + Math.sin(t) * 0.04})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(ballX - r * 2, ballY - r * 2, r * 4, r * 4);
    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.12 + Math.sin(t) * 0.06})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Floating question marks
    ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + Math.sin(t * 1.5) * 0.3})`;
    ctx.font = 'bold 28px system-ui';
    ctx.fillText('?', ballX, ballY + 10);
    ctx.font = '16px system-ui';
    ctx.fillText('?', ballX - 25, ballY - 20 + Math.sin(t * 2) * 5);
    ctx.fillText('?', ballX + 28, ballY + 20 + Math.cos(t * 2) * 5);
    ctx.font = '12px system-ui';
    ctx.fillText('?', ballX + 15, ballY - 30 + Math.sin(t * 3) * 4);
    // Base
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.beginPath();
    ctx.ellipse(ballX, ballY + r + 6, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Labels below
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('"Predicts the future"', ballX, h - 28);
    // X mark
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ballX - 8, h - 52); ctx.lineTo(ballX + 8, h - 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ballX + 8, h - 52); ctx.lineTo(ballX - 8, h - 40); ctx.stroke();
    ctx.lineCap = 'butt';

    // --- DIVIDER ---
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mid, 10); ctx.lineTo(mid, h - 10); ctx.stroke();
    ctx.setLineDash([]);

    // --- RIGHT SIDE: Thermometer (RIGHT) ---
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RIGHT: "Thermometer"', mid + mid / 2, 22);

    const thX = mid + mid / 2;
    const thTop = 42;
    const thBot = h - 60;
    const thW = 18;
    // Tube outer
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(thX - thW / 2 - 2, thTop - 2, thW + 4, thBot - thTop + 4, 10);
    ctx.fill();
    // Tube inner
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(thX - thW / 2, thTop, thW, thBot - thTop, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Mercury level (oscillates — measuring current state)
    const level = 0.4 + Math.sin(t * 0.8) * 0.25;
    const mercTop = thBot - (thBot - thTop) * level;
    const grad = ctx.createLinearGradient(0, thBot, 0, mercTop);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(thX - thW / 2 + 3, mercTop, thW - 6, thBot - mercTop - 3, 4);
    ctx.fill();
    // Bulb
    ctx.beginPath();
    ctx.arc(thX, thBot + 6, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    // Tick marks + labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const labels = ['LOW', '', 'MID', '', 'HIGH'];
    for (let i = 0; i < 5; i++) {
      const y = thTop + ((thBot - thTop) * (4 - i)) / 4;
      ctx.fillRect(thX + thW / 2 + 4, y, 6, 1);
      if (labels[i]) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '7px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(labels[i], thX + thW / 2 + 14, y + 3);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
      }
    }
    // Value readout
    const temp = Math.round(30 + level * 40);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${temp}°`, thX - 28, mercTop + 5);
    // Label
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('"Measures what IS"', thX, h - 28);
    // Checkmark
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(thX - 8, h - 46);
    ctx.lineTo(thX - 2, h - 38);
    ctx.lineTo(thX + 10, h - 54);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Four-Gauge Dashboard
// Like a car dashboard: Momentum, Volume, Volatility, Trend
// Each gauge has animated needle + value readout
// ============================================================
function DashboardDiagnostic() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Indicators = Your Trading Dashboard', w / 2, 20);

    const gauges = [
      { label: 'MOMENTUM', value: 0.5 + Math.sin(t) * 0.35, color: '#f59e0b', unit: 'RSI' },
      { label: 'VOLUME', value: 0.3 + Math.sin(t * 0.7 + 1) * 0.25, color: '#22c55e', unit: 'OBV' },
      { label: 'VOLATILITY', value: 0.6 + Math.sin(t * 0.5 + 2) * 0.3, color: '#ef4444', unit: 'ATR' },
      { label: 'TREND', value: 0.4 + Math.sin(t * 0.9 + 3) * 0.35, color: '#d946ef', unit: 'MA' },
    ];

    const gW = (w - 40) / 4;
    const gY = h * 0.46;
    const gR = Math.min(gW * 0.42, 42);

    gauges.forEach((g, i) => {
      const gX = 20 + gW * i + gW / 2;

      // Outer glow
      const gl = ctx.createRadialGradient(gX, gY, gR * 0.8, gX, gY, gR * 1.4);
      gl.addColorStop(0, `${g.color}08`);
      gl.addColorStop(1, 'transparent');
      ctx.fillStyle = gl;
      ctx.fillRect(gX - gR * 1.5, gY - gR * 1.5, gR * 3, gR * 3);

      // Arc background
      ctx.beginPath();
      ctx.arc(gX, gY, gR, Math.PI * 0.8, Math.PI * 2.2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Arc value
      const startAngle = Math.PI * 0.8;
      const endAngle = startAngle + (Math.PI * 1.4) * Math.max(0, Math.min(1, g.value));
      ctx.beginPath();
      ctx.arc(gX, gY, gR, startAngle, endAngle);
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Needle
      const needleAngle = startAngle + (Math.PI * 1.4) * g.value;
      const nLen = gR - 10;
      ctx.beginPath();
      ctx.moveTo(gX, gY);
      ctx.lineTo(gX + Math.cos(needleAngle) * nLen, gY + Math.sin(needleAngle) * nLen);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(gX, gY, 4, 0, Math.PI * 2);
      ctx.fillStyle = g.color;
      ctx.fill();

      // Value
      ctx.fillStyle = g.color;
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(g.value * 100)}`, gX, gY + gR * 0.42);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(g.label, gX, gY + gR * 0.68);

      // Unit tag
      ctx.fillStyle = g.color;
      ctx.font = '9px system-ui';
      ctx.fillText(g.unit, gX, gY + gR * 0.88);
    });

    // Bottom
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Each gauge measures a DIFFERENT dimension — just like a car dashboard', w / 2, h - 14);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// MYTH DATA
// ============================================================
const myths = [
  { myth: 'Indicators predict the future', truth: 'Indicators measure the PRESENT and PAST. They are diagnostic tools, like a thermometer. A thermometer doesn&apos;t make you ill &mdash; it tells you that you ARE ill. RSI doesn&apos;t predict a reversal &mdash; it tells you momentum is currently stretched.', icon: '🔮' },
  { myth: 'More indicators = better trading', truth: 'Most traders stack 5+ indicators and get MORE confused. Each indicator adds noise. The key is 2&ndash;3 indicators that measure DIFFERENT things (momentum, volume, trend) &mdash; not 3 that all measure momentum.', icon: '📊' },
  { myth: 'Indicators work on their own', truth: 'An indicator signal without context is meaningless. RSI at 30 means nothing alone. RSI at 30 + demand zone + session open + rising volume = a setup. Indicators CONFIRM &mdash; they don&apos;t generate the idea.', icon: '🔧' },
  { myth: 'Professional traders don&apos;t use indicators', truth: 'Institutional desks use indicators constantly &mdash; they just use them DIFFERENTLY. They measure regime, momentum health, and volatility state rather than looking for &ldquo;buy/sell&rdquo; signals.', icon: '🏦' },
  { myth: 'The default settings are always best', truth: 'Default settings (e.g. RSI 14) were designed decades ago for daily stock charts. Different assets, timeframes, and strategies often require adjusted parameters. What matters is understanding WHAT the setting changes, not blindly accepting defaults.', icon: '⚙️' },
];

// ============================================================
// INDICATOR TYPE DATA
// ============================================================
const indicatorTypes = [
  { type: 'Trend Indicators', what: 'Is price going UP, DOWN, or SIDEWAYS?', examples: 'Moving Averages, ADX, Ichimoku', analogy: 'Like a compass &mdash; tells you which direction you&apos;re heading. Does NOT tell you when to turn.', deepUse: 'Professionals use trend indicators to determine REGIME. A trending market needs trending strategies (breakouts, pullbacks). A ranging market needs range strategies (fade extremes). Using the wrong strategy in the wrong regime is the #1 cause of indicator failure.', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { type: 'Momentum Indicators', what: 'How FAST is price moving? Is it speeding up or slowing down?', examples: 'RSI, MACD, Stochastic, CCI', analogy: 'Like a speedometer &mdash; tells you how fast the car is going. Does NOT tell you where the car is heading.', deepUse: 'Momentum divergence is the real power here. When price makes a higher high but RSI makes a lower high, momentum is WEAKENING even though price looks strong. That divergence often precedes reversals by several candles &mdash; giving you a head start.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { type: 'Volume Indicators', what: 'How many people are participating in this move?', examples: 'OBV, Volume Profile, VWAP', analogy: 'Like counting how many people are in a queue &mdash; a busy queue means the shop is popular. An empty queue means something might be wrong.', deepUse: 'Volume confirms conviction. A breakout on high volume is far more likely to hold than one on low volume. Smart money always leaves footprints in volume &mdash; they can hide their direction but they can&apos;t hide their participation.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { type: 'Volatility Indicators', what: 'How WILD are the price swings right now?', examples: 'ATR, Bollinger Bands, Keltner Channels', analogy: 'Like a weather forecast for turbulence &mdash; tells you whether the road ahead is smooth or bumpy. Doesn&apos;t tell you which way the road goes.', deepUse: 'Volatility cycles between expansion and contraction. Low volatility (BB squeeze) is ALWAYS followed by high volatility &mdash; the question is WHEN and which DIRECTION. High volatility warns you to widen stops and reduce size. It&apos;s risk management intelligence.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

// ============================================================
// GAME DATA — 5 rounds
// ============================================================
const gameRounds = [
  {
    scenario: 'RSI hits 75 on EUR/USD during London session. Your friend says: &ldquo;RSI is overbought &mdash; price HAS to drop. Sell now!&rdquo; What do you do?',
    options: [
      { text: 'Sell immediately &mdash; RSI says overbought, price must fall', correct: false, explain: 'RSI at 75 means momentum is CURRENTLY strong to the upside. In a trending market, RSI can stay above 70 for hours or days. &ldquo;Overbought&rdquo; does NOT mean &ldquo;must reverse.&rdquo; You just sold into a trend with no structural reason.' },
      { text: 'RSI measures current momentum, not the future &mdash; I need structure, session, and volume context before any decision', correct: true, explain: 'Exactly. RSI at 75 tells you momentum is strong RIGHT NOW. To trade, you need confluence: is there a resistance level? A supply zone? Is volume fading? What session are we in? An indicator reading alone is NEVER a trade.' },
    ],
  },
  {
    scenario: 'A YouTube guru recommends stacking RSI + Stochastic + CCI together because &ldquo;3 indicators are better than 1.&rdquo; You notice all three are momentum oscillators. What&apos;s the problem?',
    options: [
      { text: 'Nothing wrong &mdash; more data means better decisions', correct: false, explain: 'RSI, Stochastic, and CCI are ALL momentum oscillators. They measure the SAME dimension in slightly different mathematical ways. Using 3 of them is like checking 3 speedometers &mdash; you get 3 versions of the same reading, not 3 pieces of new information. This is called redundancy.' },
      { text: 'All three measure momentum &mdash; they&apos;re redundant, not complementary. I need indicators from DIFFERENT families', correct: true, explain: 'Exactly right. For genuine confluence, you need indicators from DIFFERENT categories: one for momentum (RSI), one for volume (OBV), one for trend (MA), one for volatility (ATR). Four independent data streams beats three redundant ones every time.' },
    ],
  },
  {
    scenario: 'MACD shows a bullish crossover on the 1H chart. A beginner says: &ldquo;MACD crossover = guaranteed long trade.&rdquo; How do you evaluate this?',
    options: [
      { text: 'Correct &mdash; MACD crossovers are reliable buy signals backed by the maths', correct: false, explain: 'MACD crossovers happen dozens of times per day across timeframes. Most lead to small, insignificant moves. Without structural context (where is price relative to key levels?), session context (is it London or Asian range?), and volume context (is participation rising?), a crossover is noise.' },
      { text: 'A crossover is a measurement showing short-term momentum has overtaken longer-term momentum &mdash; useful context, but not a trade signal by itself', correct: true, explain: 'Correct. The crossover tells you momentum dynamics have shifted. That is useful INFORMATION. But information alone does not equal a trade. You need a reason (structure), a trigger (price action), AND confirmation (indicator alignment). Three legs, not one.' },
    ],
  },
  {
    scenario: 'Bollinger Bands are extremely narrow on Gold (known as a &ldquo;squeeze&rdquo;). A trader in your Discord says: &ldquo;Squeeze means price is about to explode upward &mdash; long now!&rdquo; What is wrong with this logic?',
    options: [
      { text: 'They&apos;re right &mdash; a squeeze always leads to an upward breakout because buyers are accumulating', correct: false, explain: 'A Bollinger squeeze tells you ONE thing: volatility is abnormally low. Statistically, low volatility is followed by high volatility &mdash; a big move IS likely. But the DIRECTION is completely unknown. Price could explode up OR down. The squeeze measures compression, not direction.' },
      { text: 'The squeeze only measures compressed volatility &mdash; it says a big move is likely but gives ZERO information about direction', correct: true, explain: 'Exactly. Bollinger Band width is a volatility measurement. Narrow bands = compressed energy. The breakout direction requires OTHER tools: market structure, order flow, session bias. Assuming direction from a volatility indicator is a category error &mdash; like using a fuel gauge to navigate.' },
    ],
  },
  {
    scenario: 'A professional prop trader has 2 indicators on her chart: a 50 EMA and ATR. Her colleague has 7 indicators and can barely see the candles. Who is likely to make better decisions and why?',
    options: [
      { text: 'The colleague with 7 indicators &mdash; more tools means more information and better analysis', correct: false, explain: 'More indicators usually means more noise, more conflicting signals, and analysis paralysis. The colleague likely has 3&ndash;4 redundant momentum tools plus overlapping trend indicators. More data does NOT mean better data if it&apos;s measuring the same thing multiple times.' },
      { text: 'The professional with 2 &mdash; a trend tool (EMA) and a volatility tool (ATR) give her two independent dimensions without clutter or redundancy', correct: true, explain: 'Correct. The 50 EMA tells her DIRECTION and dynamic support/resistance. ATR tells her current VOLATILITY for stop placement and position sizing. Two independent diagnostic streams. Clean chart, clear thinking, faster decisions. Quality over quantity &mdash; always.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'What is the correct way to think about trading indicators?', opts: ['Crystal balls that predict future price moves', 'Random mathematical lines that look impressive', 'Diagnostic tools that measure current market conditions', 'Automatic trading signals that replace human analysis'], correct: 2, explain: 'Indicators are diagnostic tools. They measure what IS happening &mdash; momentum, trend, volume, volatility &mdash; not what WILL happen.' },
  { q: 'A thermometer reads 39&deg;C. What does this tell you?', opts: ['You will definitely get sicker tomorrow', 'Your temperature is currently elevated right now', 'You should immediately take medication', 'The thermometer is causing your fever'], correct: 1, explain: 'A thermometer measures CURRENT state. It does not predict the future or prescribe action. It gives you information to make your own decision. Indicators work identically.' },
  { q: 'RSI reads 80 on a stock in a strong uptrend. What does this mean?', opts: ['The stock MUST reverse downward very soon', 'Upward momentum is currently very strong', 'The stock is guaranteed to keep rising forever', 'RSI is malfunctioning and should be removed'], correct: 1, explain: 'RSI at 80 means momentum is strong to the upside. In trending markets, RSI can stay elevated for extended periods (days or weeks). It is a measurement of NOW, not a prediction of NEXT.' },
  { q: 'Which indicator combination provides the MOST independent information?', opts: ['RSI + Stochastic + CCI (three momentum tools)', 'MACD + RSI + Stochastic (momentum heavy)', 'Moving Average + RSI + Volume (trend + momentum + participation)', 'CCI + MACD + Momentum oscillator (triple momentum)'], correct: 2, explain: 'MA (trend) + RSI (momentum) + Volume (participation) measure three completely different market dimensions. Every other option stacks momentum on momentum &mdash; redundant data dressed up as confluence.' },
  { q: 'What is the #1 mistake retail traders make with indicators?', opts: ['Using any indicators at all', 'Using them as standalone entry signals without structural context', 'Changing the period settings from defaults', 'Looking at multiple timeframes simultaneously'], correct: 1, explain: 'Indicators are CONFIRMATION tools. Using them as standalone entry signals (&ldquo;RSI overbought = sell&rdquo;) without price structure, session timing, or volume context is the single biggest retail mistake.' },
  { q: 'A Bollinger Band squeeze (extremely narrow bands) tells you:', opts: ['Price will definitely move upward soon', 'Price will definitely move downward soon', 'Volatility is compressed and a large move may follow in either direction', 'The Bollinger Bands indicator is broken'], correct: 2, explain: 'A squeeze measures compressed volatility. It signals that a big move is statistically likely &mdash; but says NOTHING about which direction. Direction requires separate analysis (structure, order flow, bias).' },
  { q: 'Professional institutional traders primarily use indicators to:', opts: ['Generate exact entry and exit price levels', 'Assess market regime, momentum health, and volatility conditions', 'Determine whether to buy or sell each asset', 'Calculate how much profit they will make on each trade'], correct: 1, explain: 'Institutional traders use indicators as diagnostic instruments &mdash; to understand the market&apos;s current state (regime, momentum health, volatility). They inform the decision, they don&apos;t make it.' },
  { q: 'The four main families of indicators measure:', opts: ['Speed, Distance, Time, and Altitude', 'Trend, Momentum, Volume, and Volatility', 'Buy signals, Sell signals, Hold signals, and Exit signals', 'Simple data, Complex data, Advanced data, and Expert data'], correct: 1, explain: 'Trend (direction), Momentum (speed/acceleration), Volume (participation), Volatility (risk/range) &mdash; four independent diagnostic dimensions. Using one from each family gives you true confluence.' },
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
export default function WhatIndicatorsAreLesson() {
  const [openMyth, setOpenMyth] = useState<number | null>(null);
  const [openType, setOpenType] = useState<number | null>(null);
  const [openMistake, setOpenMistake] = useState<number | null>(null);
  const [openPro, setOpenPro] = useState<number | null>(null);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  // Interactive diagnostic
  const [demoMomentum, setDemoMomentum] = useState(65);
  const [demoVolume, setDemoVolume] = useState(40);
  const [demoTrend, setDemoTrend] = useState(72);
  const [demoVolatility, setDemoVolatility] = useState(30);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGameAnswer = (optIdx: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const updated = [...gameAnswers];
    updated[gameRound] = optIdx;
    setGameAnswers(updated);
    if (gameRounds[gameRound].options[optIdx].correct) setGameScore(prev => prev + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const updated = [...quizAnswers];
    updated[qi] = oi;
    setQuizAnswers(updated);
    if (updated.every(a => a !== null)) {
      const correct = updated.filter((a, i) => a === quizQuestions[i].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(pct);
      setQuizDone(true);
      if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800);
    }
  };

  const getDiagnostic = () => {
    if (demoTrend > 60 && demoMomentum > 60 && demoVolume > 50 && demoVolatility < 60) return { text: 'Strong bullish conditions &mdash; trend, momentum, and volume aligned with manageable volatility. High-probability environment for trend-following entries.', color: 'text-green-400', grade: 'A+' };
    if (demoTrend > 60 && demoMomentum > 60 && demoVolume > 50 && demoVolatility >= 60) return { text: 'Bullish but turbulent &mdash; trend and momentum aligned but high volatility means wider stops needed. Reduce position size to compensate for larger swings.', color: 'text-yellow-400', grade: 'B+' };
    if (demoTrend < 40 && demoMomentum < 40 && demoVolume > 50) return { text: 'Strong bearish conditions &mdash; trend and momentum pointing down with participation. Look for short entries WITH the downtrend, not against it.', color: 'text-red-400', grade: 'A+ (Short)' };
    if (demoVolatility > 75) return { text: 'Extreme volatility regime &mdash; wild swings, unpredictable moves. Professional response: reduce size by 50% or stand aside entirely. This is a capital preservation environment.', color: 'text-red-400', grade: 'D' };
    if (demoVolatility < 20) return { text: 'Ultra-low volatility &mdash; deep compression phase. A significant breakout is building but direction is unknown. Set alerts on key levels and wait for the expansion.', color: 'text-amber-400', grade: 'C (Wait)' };
    if (demoVolume < 25) return { text: 'Low participation &mdash; moves on thin volume are unreliable. Any breakout is likely to fail. Wait for volume to confirm before committing capital.', color: 'text-amber-400', grade: 'C-' };
    const avg = (demoMomentum + demoVolume + demoTrend) / 3;
    if (avg > 40 && avg < 60) return { text: 'Mixed signals &mdash; no clear edge across dimensions. This is a NO-TRADE zone. Wait for alignment before risking capital. Patience is a position.', color: 'text-gray-400', grade: 'F (No Trade)' };
    return { text: 'Partial alignment &mdash; some dimensions favour a move but not all four. Higher risk setup. Reduce size or wait for the missing dimension to confirm.', color: 'text-yellow-400', grade: 'C+' };
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  // Common mistakes
  const mistakes = [
    { wrong: 'Using RSI &ldquo;overbought&rdquo; as a standalone sell signal', right: 'RSI above 70 means momentum is currently strong upside. In a trend, it can stay there for days. Always check structure (supply zone?), session (kill zone?), and volume (fading?) before acting.', icon: '📉' },
    { wrong: 'Stacking 4+ momentum oscillators for &ldquo;extra confirmation&rdquo;', right: 'Three RSI-like tools giving the same reading is not confirmation &mdash; it&apos;s redundancy. Use ONE momentum tool and combine with trend, volume, and volatility for genuine multi-dimensional confirmation.', icon: '📊' },
    { wrong: 'Treating MACD crossover as an automatic entry signal', right: 'A crossover is a momentum measurement, not a trading instruction. Combine it with structural context (where is price?), session timing (is smart money active?), and volume (is participation rising?).', icon: '❌' },
    { wrong: 'Removing an indicator after a single losing trade', right: 'No diagnostic tool works 100% of the time. A thermometer can read 37&deg;C and you still feel ill. Judge indicator effectiveness over a minimum of 50&ndash;100 trades, not a single outcome. One trade is noise. Fifty trades is data.', icon: '🗑️' },
  ];

  // Professional use cases
  const proUseCases = [
    { q: 'What regime are we in?', detail: 'Trending or ranging? High or low volatility? This determines WHICH strategy to deploy today. A breakout strategy in a ranging market gets chopped to pieces. A mean-reversion strategy in a trending market gets steamrolled. Regime identification is the FIRST diagnostic question &mdash; before anything else.', color: 'text-amber-400' },
    { q: 'Does this confirm my thesis?', detail: 'Professionals form a thesis FIRST from structure, levels, and price action. Then they check indicators to see if the data SUPPORTS the thesis. The thesis comes from the chart. The indicator provides the confidence check. Never the other way around.', color: 'text-accent-400' },
    { q: 'Is there divergence between dimensions?', detail: 'When trend is up but momentum is fading and volume is dropping &mdash; that&apos;s a warning sign most retail traders miss. Cross-dimensional divergence reveals hidden weakness (or strength) that single-dimension analysis cannot detect. This is the professional edge.', color: 'text-green-400' },
    { q: 'What is the volatility environment telling me about risk?', detail: 'Before choosing position size or stop distance, professionals check ATR/volatility state. High volatility = wider stops = smaller position. Low volatility = tighter stops = larger position. The volatility reading directly controls risk management parameters &mdash; it&apos;s not optional.', color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />

      {/* === PROGRESS BAR === */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      {/* === NAV (PRO style — Crown + PRO · LEVEL 5) === */}
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
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 1</p>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-black leading-[1.1] tracking-tight mb-5">
            What Indicators<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Actually Are</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            They don&apos;t predict the future. They never have. Understanding this one truth will make you a better trader than 90% of the market.
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
            <p className="text-xl font-extrabold mb-3">The Single Biggest Lie in Retail Trading</p>
            <p className="text-gray-400 leading-relaxed mb-4">Imagine going to the doctor with a fever. The doctor puts a <strong className="text-amber-400">thermometer</strong> in your mouth. It reads 39&deg;C. Does the thermometer tell you what WILL happen tomorrow? No. It tells you what IS happening &mdash; your temperature is elevated <em>right now</em>.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Now imagine a fortune teller with a <strong className="text-purple-400">crystal ball</strong>. She gazes into it and says: &ldquo;Tomorrow your fever will break.&rdquo; That&apos;s a prediction. It might be right. It might be wrong. It&apos;s a guess dressed in mystical language.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Every indicator you&apos;ve ever seen is a thermometer.</strong> Not a crystal ball. Yet 90% of retail traders use them as crystal balls &mdash; and that single misunderstanding is responsible for more blown accounts than almost any other mistake in trading.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A prop firm&apos;s training programme tracked <strong className="text-white">340 new traders</strong> over 6 months. The #1 reason for account termination? <strong className="text-white">&ldquo;Entered based on indicator signal alone&rdquo;</strong> &mdash; 47% of all blown accounts cited a single indicator reading (usually RSI &ldquo;overbought/oversold&rdquo;) as their entry reason. Zero of these traders had ANY structural context. The traders who survived? They used indicators as <em>confirmation</em>, not <em>signals</em>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: The Thermometer, Not the Crystal Ball === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Core Truth</p>
          <h2 className="text-2xl font-extrabold mb-4">The Thermometer, Not the Crystal Ball</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the single most important concept in the entire Indicator Intelligence level. If you internalise nothing else from 22 lessons, internalise this:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-extrabold text-red-400 mb-3">&#10060; What Retail Traders Think</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;RSI is at 75 &mdash; price WILL drop.&rdquo;</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;MACD crossed &mdash; price WILL rise.&rdquo;</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;BB squeeze &mdash; price WILL explode.&rdquo;</p>
              <p className="text-sm text-gray-400">&ldquo;Stochastic oversold &mdash; MUST bounce.&rdquo;</p>
            </div>
            <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-sm font-extrabold text-green-400 mb-3">&#9989; What Indicators Actually Say</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;Momentum IS strong right now.&rdquo;</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;Short-term HAS overtaken long-term.&rdquo;</p>
              <p className="text-sm text-gray-400 mb-1">&ldquo;Volatility IS compressed right now.&rdquo;</p>
              <p className="text-sm text-gray-400">&ldquo;Selling pressure IS dominant right now.&rdquo;</p>
            </div>
          </div>
          <ThermometerVsCrystalBall />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Think of it this way</p>
            <p className="text-sm text-gray-400">A speedometer in your car reads 120 km/h. Does that mean you WILL crash? No. It means you ARE going fast <em>right now</em>. What happens next depends on the road, the weather, the traffic, and your driving. The speedometer gives you information. YOU make the decision.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: The Four Families === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Four Families</p>
          <h2 className="text-2xl font-extrabold mb-2">Four Dimensions, Four Indicator Types</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every indicator ever invented falls into one of four families. Each family measures a completely different dimension of the market. Understanding these families is how you avoid the redundancy trap that kills most retail setups.</p>
          <div className="space-y-3">
            {indicatorTypes.map((ind, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenType(openType === i ? null : i)} className={`w-full flex items-center justify-between p-4 rounded-xl border text-left ${ind.bg}`}>
                  <div>
                    <p className={`text-sm font-extrabold ${ind.color}`}>{ind.type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ind.what}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openType === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openType === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <p className="text-sm text-gray-400"><strong className="text-white">Examples:</strong> {ind.examples}</p>
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Analogy</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: ind.analogy }} />
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-xs font-bold text-green-400 mb-1">&#128640; Professional Deep Dive</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: ind.deepUse }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Golden Rule of Indicator Selection</p>
            <p className="text-sm text-gray-400">Never use two indicators from the same family. RSI + Stochastic = two speedometers. RSI + Volume = a speedometer and a fuel gauge. The second combination gives you genuinely new information. The first just gives you the same data twice with extra noise.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Your Trading Dashboard === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Dashboard</p>
          <h2 className="text-2xl font-extrabold mb-4">Your Trading Dashboard</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A pilot doesn&apos;t fly with just a speedometer. They have an altimeter (height), compass (direction), fuel gauge (capacity), and weather radar (conditions). Each instrument measures something DIFFERENT. Together they create <strong className="text-white">situational awareness</strong> &mdash; a complete picture that no single gauge can provide. Your trading indicators are no different.</p>
          <DashboardDiagnostic />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The ATLAS Philosophy</p>
            <p className="text-sm text-gray-400">This is exactly why the ATLAS suite was built as separate tools: <strong className="text-white">CIPHER</strong> (signal intelligence), <strong className="text-white">PHANTOM</strong> (structure intelligence), <strong className="text-white">PULSE</strong> (momentum intelligence), <strong className="text-white">RADAR</strong> (screening intelligence), <strong className="text-white">OPTIONS PRO</strong> (volatility intelligence). Each measures a different dimension. Together &mdash; complete situational awareness.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Myth Busters === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Myths Busted</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Myths That Destroy Accounts</h2>
          <p className="text-gray-400 leading-relaxed mb-6">These beliefs are so common they feel like facts. They&apos;re not. Each one has cost traders billions collectively.</p>
          <div className="space-y-3">
            {myths.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenMyth(openMyth === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <p className="text-sm font-extrabold text-red-400">&ldquo;{m.myth}&rdquo;</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openMyth === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMyth === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-xs font-bold text-green-400 mb-1">&#9989; The Truth</p>
                        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.truth }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S05: Interactive Market Diagnostic Tool === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Try It Yourself</p>
          <h2 className="text-2xl font-extrabold mb-2">Interactive Market Diagnostic</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Drag the four sliders to simulate different market conditions. Watch the diagnostic change in real time. This is <em>exactly</em> how indicators work &mdash; they describe what IS so you can decide what to do. They don&apos;t tell you to buy or sell.</p>
          <div className="p-6 rounded-2xl glass-card space-y-5">
            {[
              { label: 'Momentum (RSI)', value: demoMomentum, set: setDemoMomentum, color: '#f59e0b', desc: '0 = extreme bearish momentum, 100 = extreme bullish momentum' },
              { label: 'Volume (OBV)', value: demoVolume, set: setDemoVolume, color: '#22c55e', desc: '0 = no participation, 100 = massive participation' },
              { label: 'Trend (MA)', value: demoTrend, set: setDemoTrend, color: '#d946ef', desc: '0 = strong downtrend, 100 = strong uptrend' },
              { label: 'Volatility (ATR)', value: demoVolatility, set: setDemoVolatility, color: '#ef4444', desc: '0 = dead calm, 100 = extreme turbulence' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <input type="range" min={0} max={100} value={s.value} onChange={e => s.set(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: s.color, background: `linear-gradient(to right, ${s.color} ${s.value}%, rgba(255,255,255,0.1) ${s.value}%)` }} />
                <p className="text-[10px] text-gray-600 mt-0.5">{s.desc}</p>
              </div>
            ))}
            <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-400">&#128202; DIAGNOSTIC READOUT</p>
                <span className={`text-xs font-mono font-bold ${getDiagnostic().color}`}>{getDiagnostic().grade}</span>
              </div>
              <p className={`text-sm font-semibold ${getDiagnostic().color}`} dangerouslySetInnerHTML={{ __html: getDiagnostic().text }} />
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Notice</p>
            <p className="text-sm text-gray-400">The diagnostic DESCRIBES the current conditions and suggests an appropriate RESPONSE. It never says &ldquo;BUY&rdquo; or &ldquo;SELL.&rdquo; The decision is always yours. That&apos;s the difference between a diagnostic tool and a crystal ball.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: How Professionals Use Indicators === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Professional Approach</p>
          <h2 className="text-2xl font-extrabold mb-2">How Professionals Actually Use Indicators</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Retail traders ask: &ldquo;What signal is the indicator giving me?&rdquo; Professionals ask four completely different questions:</p>
          <div className="space-y-3">
            {proUseCases.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenPro(openPro === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${p.color}`}>{i + 1}. &ldquo;{p.q}&rdquo;</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openPro === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openPro === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <p className="text-sm text-gray-400">{p.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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

      {/* === S08: The ATLAS Suite Preview === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; What&apos;s Ahead</p>
          <h2 className="text-2xl font-extrabold mb-2">The ATLAS Indicator Suite</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Throughout Level 5, you&apos;ll master every indicator in the ATLAS suite &mdash; 9 free tools and 5 PRO tools, each built on the diagnostic philosophy you just learned. No crystal balls. No black boxes. Every tool shows you <strong className="text-white">WHY</strong>, not just what.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-2xl font-extrabold text-amber-400">9</p>
              <p className="text-xs text-gray-500">Free Indicators</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-2xl font-extrabold text-accent-400">5</p>
              <p className="text-xs text-gray-500">PRO Indicators</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-2xl font-extrabold text-green-400">4</p>
              <p className="text-xs text-gray-500">Diagnostic Dimensions</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-2xl font-extrabold text-red-400">0</p>
              <p className="text-xs text-gray-500">Crystal Balls</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128640; Your Level 5 Journey</p>
            <p className="text-sm text-gray-400">Lessons 5.1&ndash;5.4 teach you the <em>philosophy</em>. Lessons 5.5&ndash;5.13 give you deep masterclasses on every free ATLAS tool. Lessons 5.14&ndash;5.18 unlock the PRO suite. Lessons 5.19&ndash;5.22 teach you to COMBINE them for A+ setups. By the end, you&apos;ll have your own personal Indicator Playbook.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Indicator Intelligence Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real-world scenarios. Can you think like a diagnostic trader &mdash; or are you still chasing crystal ball signals?</p>

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
                <button onClick={() => setGameRound(prev => prev + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">
                  Next Round &rarr;
                </button>
              </motion.div>
            )}

            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p>
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Excellent diagnostic thinking! You see indicators for what they truly are.' : gameScore >= 3 ? 'Good understanding — the crystal ball instinct is hard to shake. Keep practising!' : 'Review the lesson — unlearning crystal ball thinking takes deliberate effort.'}</p>
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

          {/* Score */}
          {quizDone && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizScore}%</p>
              <p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}

          {/* PRO Certificate */}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🌡️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 5: What Indicators Actually Are</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Diagnostic Thinker &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
