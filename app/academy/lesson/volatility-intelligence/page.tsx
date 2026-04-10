// app/academy/lesson/volatility-intelligence/page.tsx
// ATLAS Academy — Lesson 5.11: Volatility Intelligence [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

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
// ANIMATION 1: Volatility Cycle — Compression → Expansion → Compression
// Bollinger Bands breathing: squeeze then explode then squeeze again
// ============================================================
function VolatilityCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Volatility Cycle — Compression → Expansion → Compression', w / 2, 14);

    const pts = 100;
    const pad = 20;
    const dx = (w - pad * 2) / pts;
    const mid = h * 0.5;

    // Price and band data with phases
    const prices: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < pts; i++) {
      // Cycle through phases
      const phase = (i + f * 0.3) % pts;
      let vol: number;
      if (phase < 30) vol = 5 + phase * 0.2; // slow build
      else if (phase < 45) vol = 11 + (phase - 30) * 2.5; // expansion
      else if (phase < 60) vol = 48 - (phase - 45) * 2; // peak to contraction
      else vol = 18 - (phase - 60) * 0.3; // slow compression

      const trend = Math.sin((i + f * 0.3) * 0.04) * 30;
      const noise = Math.sin(i * 0.5 + t * 2) * vol * 0.3;
      const price = mid + trend + noise;
      prices.push(price);
      upper.push(price - vol);
      lower.push(price + vol);
    }

    // Fill between bands
    for (let i = 1; i < pts; i++) {
      const x0 = pad + (i - 1) * dx;
      const x1 = pad + i * dx;
      const spread = lower[i] - upper[i];
      const maxSpread = 96;
      const intensity = Math.min(spread / maxSpread, 1);
      const isExpanding = spread > 40;
      ctx.fillStyle = isExpanding ? `rgba(239,83,80,${0.02 + intensity * 0.06})` : `rgba(245,158,11,${0.02 + (1 - intensity) * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(x0, upper[i - 1]); ctx.lineTo(x1, upper[i]);
      ctx.lineTo(x1, lower[i]); ctx.lineTo(x0, lower[i - 1]);
      ctx.closePath(); ctx.fill();
    }

    // Upper band
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    upper.forEach((y, i) => { const x = pad + i * dx; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Lower band
    ctx.beginPath();
    lower.forEach((y, i) => { const x = pad + i * dx; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((y, i) => { const x = pad + i * dx; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Phase labels
    const labelY = h - 10;
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('SQUEEZE', pad + 15 * dx, labelY);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.fillText('EXPANSION', pad + 42 * dx, labelY);
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('CONTRACTION', pad + 72 * dx, labelY);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: ATR Stop Placement Visualiser
// Shows candles with ATR-based stops vs fixed-pip stops
// ============================================================
function ATRStopAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ATR Stops vs Fixed Stops', w / 2, 14);

    const mid = w / 2;
    const bars = 12;
    const halfW = (mid - 30) / bars;

    // Left side: High volatility with fixed stop
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Fixed 20-Pip Stop (High Vol)', mid * 0.5, 28);

    const entryY = h * 0.35;
    const fixedStop = 20; // pixels representing 20 pips
    const atrStop = 45; // pixels representing 1.5× ATR

    for (let i = 0; i < bars; i++) {
      const x = 15 + i * halfW;
      const vol = 25 + Math.sin(i * 0.7 + t) * 15; // High vol candles
      const open = entryY + Math.sin(i * 1.3 + t * 0.5) * vol * 0.4;
      const close = entryY + Math.cos(i * 0.9 + t * 0.3) * vol * 0.4;
      const high = Math.min(open, close) - vol * 0.5;
      const low = Math.max(open, close) + vol * 0.5;
      const bull = close < open;

      ctx.fillStyle = bull ? 'rgba(38,166,154,0.6)' : 'rgba(239,83,80,0.6)';
      ctx.fillRect(x + halfW * 0.2, Math.min(open, close), halfW * 0.6, Math.abs(close - open) || 1);
      ctx.strokeStyle = bull ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + halfW * 0.5, high); ctx.lineTo(x + halfW * 0.5, low); ctx.stroke();
    }

    // Fixed stop line (too tight)
    ctx.strokeStyle = 'rgba(239,83,80,0.7)';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(15, entryY + fixedStop); ctx.lineTo(mid - 15, entryY + fixedStop); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,83,80,0.7)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Stop: 20 pips ✗', 15, entryY + fixedStop + 12);
    ctx.fillStyle = 'rgba(239,83,80,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText('Wicks constantly hit stop', 15, entryY + fixedStop + 23);

    // Entry line left
    ctx.strokeStyle = 'rgba(96,165,250,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(15, entryY); ctx.lineTo(mid - 15, entryY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(96,165,250,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText('Entry', 15, entryY - 5);

    // Right side: Same volatility with ATR stop
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('1.5× ATR Stop (High Vol)', mid + mid * 0.5, 28);

    for (let i = 0; i < bars; i++) {
      const x = mid + 15 + i * halfW;
      const vol = 25 + Math.sin(i * 0.7 + t) * 15;
      const open = entryY + Math.sin(i * 1.3 + t * 0.5) * vol * 0.4;
      const close = entryY + Math.cos(i * 0.9 + t * 0.3) * vol * 0.4;
      const high = Math.min(open, close) - vol * 0.5;
      const low = Math.max(open, close) + vol * 0.5;
      const bull = close < open;

      ctx.fillStyle = bull ? 'rgba(38,166,154,0.6)' : 'rgba(239,83,80,0.6)';
      ctx.fillRect(x + halfW * 0.2, Math.min(open, close), halfW * 0.6, Math.abs(close - open) || 1);
      ctx.strokeStyle = bull ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + halfW * 0.5, high); ctx.lineTo(x + halfW * 0.5, low); ctx.stroke();
    }

    // ATR stop line (gives room)
    ctx.strokeStyle = 'rgba(38,166,154,0.7)';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(mid + 15, entryY + atrStop); ctx.lineTo(w - 15, entryY + atrStop); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Stop: 1.5× ATR ✓', mid + 15, entryY + atrStop + 12);
    ctx.fillStyle = 'rgba(38,166,154,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText('Room for normal wicks', mid + 15, entryY + atrStop + 23);

    // Entry line right
    ctx.strokeStyle = 'rgba(96,165,250,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(mid + 15, entryY); ctx.lineTo(w - 15, entryY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(96,165,250,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText('Entry', mid + 15, entryY - 5);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mid, 25); ctx.lineTo(mid, h - 5); ctx.stroke();
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const volTools = [
  { name: 'ATR (Average True Range)', emoji: '📐', formula: 'Average of True Range over N periods. True Range = max(High&minus;Low, |High&minus;PrevClose|, |Low&minus;PrevClose|)', plain: 'ATR answers one question: &ldquo;How big are candles, on average, right now?&rdquo; If ATR is 50 pips on EUR/USD, that means the average candle moves 50 pips from its high to its low. It doesn&apos;t tell you DIRECTION &mdash; just SIZE. Think of it as a speedometer for how wild the market is acting.', uses: 'Stop placement (1.5&times; ATR below entry = room for normal wicks). Position sizing (high ATR = smaller position). Breakout validation (move &gt; 1&times; ATR = significant). Volatility filter (low ATR = avoid trading, nothing is moving).', trap: 'ATR doesn&apos;t predict direction. A high ATR doesn&apos;t mean the market will go up or down &mdash; it means it will move MORE in whatever direction it chooses.' },
  { name: 'Bollinger Bands', emoji: '📦', formula: 'Middle = 20 SMA. Upper = SMA + 2&times; standard deviation. Lower = SMA &minus; 2&times; standard deviation.', plain: 'Bollinger Bands create a &ldquo;box&rdquo; around price based on how volatile it&apos;s been recently. When the market is calm, the box tightens (squeeze). When it&apos;s wild, the box expands. The key insight: the squeeze PREDICTS expansion. Calm markets don&apos;t stay calm &mdash; they explode.', uses: 'Squeeze detection (bands tighten = breakout imminent). Mean reversion in ranges (price at upper band = overbought, lower = oversold). Trend identification (band walk = price rides one band in a strong trend). Volatility regime assessment.', trap: 'In a strong trend, price &ldquo;walking&rdquo; the upper band is NOT overbought. It&apos;s strong. Only use BB for mean reversion in RANGING markets. In trends, band walks are continuation signals.' },
  { name: 'Keltner Channels', emoji: '🔲', formula: 'Middle = 20 EMA. Upper = EMA + 2&times; ATR. Lower = EMA &minus; 2&times; ATR.', plain: 'Keltner Channels look like Bollinger Bands but use ATR instead of standard deviation. This makes them smoother and less reactive to sudden spikes. The power move: when Bollinger Bands squeeze INSIDE Keltner Channels, it&apos;s the tightest compression possible &mdash; a breakout is almost guaranteed.', uses: 'BB/Keltner squeeze (BBs inside Keltners = extreme compression, TTM Squeeze indicator). Trend following (price above upper Keltner = strong momentum). Smoother volatility envelope than BBs for stop trailing.', trap: 'Keltner Channels alone are less useful than BBs. Their real power is in COMBINATION with BBs for the squeeze-within-squeeze setup.' },
  { name: 'Bollinger Band Width (BBW)', emoji: '📏', formula: '(Upper Band &minus; Lower Band) &divide; Middle Band', plain: 'BBW reduces the Bollinger Bands to a single number representing how wide the bands are relative to the middle. Low BBW = tight squeeze = compression. When BBW hits its 6-month low, a major breakout is statistically likely within the next few bars.', uses: 'Objective squeeze measurement (no guesswork &mdash; compare current BBW to historical BBW). Alert trigger (set alerts when BBW drops below a threshold). Regime classification (high BBW = trending, low BBW = ranging/compressing).', trap: 'BBW tells you a breakout is coming but NOT the direction. You need other tools (momentum, volume, structure) to determine which way the bands will expand.' }
];

const volRegimes = [
  { regime: 'Compression', emoji: '🔕', atr: 'Below 20-period average', bb: 'Bands tightening, BBW at lows', what: 'The market is coiling. Energy is building. Few traders are participating. This is the CALM BEFORE THE STORM.', action: 'Prepare. Build your watchlist. Set alerts for breakout levels. Do NOT range-trade in compression &mdash; the breakout will punish range traders.', colour: 'amber' },
  { regime: 'Expansion', emoji: '💥', atr: 'Above 20-period average and rising', bb: 'Bands widening rapidly', what: 'The market has exploded. Large candles, high volume, directional conviction. This is where trends are born.', action: 'Trade WITH the expansion direction. Do NOT fade the move. ATR-based stops and targets. Size DOWN because each candle covers more distance (same risk = fewer lots).', colour: 'red' },
  { regime: 'Peak Volatility', emoji: '🔴', atr: 'At extreme highs (95th percentile)', bb: 'Bands at maximum width', what: 'Volatility cannot expand forever. When ATR hits extreme levels, a contraction is near. This often coincides with capitulation or euphoria.', action: 'Tighten stops. Take profits. Do NOT enter new positions at peak volatility &mdash; you&apos;re buying the most expensive &ldquo;insurance&rdquo; (widest stops required).', colour: 'red' },
  { regime: 'Contraction', emoji: '📉', atr: 'Declining from highs', bb: 'Bands narrowing after expansion', what: 'The storm is passing. Candles are getting smaller. The trend may be exhausting or transitioning to a range.', action: 'Reduce activity. Tighten trailing stops on existing positions. Begin looking for the next compression zone. This is the transition phase where old trends die and new ones form.', colour: 'amber' }
];

const mistakes = [
  { myth: '🚫 &ldquo;Price touching the upper Bollinger Band means sell&rdquo;', wrong: 'In a strong uptrend, price RIDES the upper band for weeks. Selling every touch means shorting a bull market. This only works in a range, and most traders don&apos;t check first.', right: 'FIRST determine the regime. Ranging market? Upper band = overbought (mean reversion). Trending market? Upper band = momentum confirmation (continuation). Context decides everything.' },
  { myth: '🚫 &ldquo;I use a fixed 50-pip stop on every trade&rdquo;', wrong: 'A 50-pip stop on EUR/USD during Asian session (ATR 30 pips) is generous. During NFP (ATR 120 pips) it&apos;s suicidal. Fixed stops ignore the market&apos;s current personality.', right: 'Use ATR-based stops. 1.5&times; ATR is a good starting point. This automatically adjusts: tight stops in low vol, wide stops in high vol. Your position SIZE adjusts to keep dollar risk constant.' },
  { myth: '🚫 &ldquo;High volatility means I should trade more&rdquo;', wrong: 'High volatility means each candle covers more distance, so the RISK per trade is higher. Trading more during high vol multiplies risk exponentially.', right: 'High vol = FEWER trades with SMALLER size. Low vol = either skip (nothing to capture) or prepare for the breakout. Medium vol with clear direction = the sweet spot for most strategies.' },
  { myth: '🚫 &ldquo;Bollinger Bands and Keltner Channels are the same thing&rdquo;', wrong: 'BBs use standard deviation (reactive, spiky). Keltners use ATR (smoother). They measure different aspects of volatility and their real power is in COMBINATION, not as substitutes.', right: 'Use both together. When BBs squeeze inside Keltner Channels, it signals the most extreme compression. This &ldquo;squeeze within a squeeze&rdquo; is one of the most reliable breakout precursors in technical analysis.' }
];

const gameRounds = [
  { scenario: 'You&apos;re about to enter a long trade on GBP/USD. The 14-period ATR is 85 pips. Your normal stop is 50 pips. What should you do?', options: [
    { text: 'Keep the 50-pip stop &mdash; your risk management plan says 50 pips', correct: false, explain: 'A 50-pip stop when ATR is 85 pips means normal candle wicks will regularly hit your stop. You&apos;d be stopped out by noise, not by the trade being wrong. Your stop needs to respect the market&apos;s current volatility.' },
    { text: 'Widen the stop to 1.5&times; ATR (128 pips) and reduce position size to maintain the same dollar risk', correct: true, explain: 'The professional approach. 1.5&times; 85 = ~128 pips gives room for normal wicks. To keep dollar risk the same, reduce lot size proportionally. The stop adapts to volatility; position size adapts to the stop.' }
  ]},
  { scenario: 'Bollinger Bands on the 4H EUR/USD chart have been squeezing for 8 days. BBW is at its lowest level in 3 months. What does this tell you?', options: [
    { text: 'A significant breakout is likely imminent &mdash; prepare entries in both directions and wait for the expansion to commit to a direction', correct: true, explain: 'An 8-day BB squeeze with BBW at 3-month lows is textbook compression. The market is coiling and will release. You can&apos;t predict direction from the squeeze alone, so prepare for both sides and let the breakout tell you which way.' },
    { text: 'The market is dead &mdash; move to another pair with more action', correct: false, explain: 'Low volatility is not &ldquo;dead&rdquo; &mdash; it&apos;s LOADING. The tighter the compression, the more explosive the breakout tends to be. Leaving now means missing the highest-probability setup that compression offers.' }
  ]},
  { scenario: 'Gold (XAUUSD) is in a strong uptrend. Price has been riding the upper Bollinger Band for 6 consecutive days. Your colleague says &ldquo;It&apos;s overbought, time to short.&rdquo; What is the correct response?', options: [
    { text: 'Your colleague is right &mdash; 6 days at the upper band is extreme overbought territory', correct: false, explain: 'In a TREND, price riding the upper band is a sign of STRENGTH, not overbought conditions. BB mean-reversion only works in ranges. In trends, the band walk IS the trend. Shorting here means fighting the momentum.' },
    { text: 'Band walking in a trend is a continuation signal, not overbought. Only use BB mean-reversion in ranging markets. Stay long or wait for the walk to end.', correct: true, explain: 'Exactly. The band walk tells you momentum is strong enough to keep price at the extreme. Only when price starts pulling AWAY from the band back toward the middle does the trend show signs of pausing. Context determines the interpretation.' }
  ]},
  { scenario: 'You notice the Bollinger Bands have squeezed INSIDE the Keltner Channels on the daily Bitcoin chart. ATR has been declining for 2 weeks. What is this setup?', options: [
    { text: 'A TTM-style squeeze &mdash; the most extreme compression signal. A powerful breakout is likely. Wait for BBs to expand outside Keltners to confirm the breakout direction.', correct: true, explain: 'When BBs (standard deviation) fit inside Keltners (ATR), both volatility measures agree that compression is extreme. This is the squeeze-within-a-squeeze. Historical studies show this resolves with above-average directional moves. Wait for the release.' },
    { text: 'Keltner Channels are overriding the Bollinger Bands, making BBs invalid. Switch to Keltner-only analysis.', correct: false, explain: 'Neither overrides the other &mdash; they measure different things. BBs inside Keltners is a COMBINED signal of extreme compression, not a conflict. The two tools together are more powerful than either alone.' }
  ]},
  { scenario: 'ATR on your 15-minute chart has just spiked to its highest level in 2 weeks (95th percentile) after a news release. You have no open positions. Should you enter a trade?', options: [
    { text: 'Yes &mdash; high ATR means big moves and big profit potential', correct: false, explain: 'Peak ATR means your stops need to be the widest they&apos;ve been in 2 weeks. You&apos;re buying the most expensive &ldquo;ticket&rdquo; possible. Risk per trade is at maximum. This is the worst time to enter new positions.' },
    { text: 'No &mdash; peak volatility is the worst time to initiate. Wait for ATR to decline from extremes before entering new positions.', correct: true, explain: 'Professional approach. Peak vol = widest stops required = smallest position sizes = worst risk/reward. Wait for the initial spike to settle, then look for setups as volatility contracts from the extreme. Enter when vol is moderate, not at its peak.' }
  ]}
];

const quizQuestions = [
  { q: 'What does ATR (Average True Range) measure?', opts: ['The direction of the next move', 'The average size of candles over N periods &mdash; how volatile the market is', 'The distance between support and resistance', 'The average volume per bar'], correct: 1, explain: 'ATR measures the average size of price movement per bar. It tells you HOW MUCH the market is moving, not which direction. High ATR = large candles = volatile. Low ATR = small candles = calm.' },
  { q: 'Why is a 1.5&times; ATR stop superior to a fixed-pip stop?', opts: ['It&apos;s always wider, giving more room', 'It automatically adapts to current volatility &mdash; tight in calm markets, wide in volatile ones', 'ATR stops never get hit', 'Fixed-pip stops are actually better'], correct: 1, explain: 'ATR stops are DYNAMIC. In calm conditions (low ATR), your stop tightens automatically. In volatile conditions (high ATR), it widens to avoid being hit by normal wicks. Your position size then adjusts to keep dollar risk constant.' },
  { q: 'A Bollinger Band squeeze (bands tightening) predicts:', opts: ['A market crash', 'That a significant move is coming, but NOT the direction', 'The price will go up', 'Nothing useful'], correct: 1, explain: 'The BB squeeze predicts EXPANSION, not direction. Low volatility leads to high volatility &mdash; this is the fundamental volatility cycle. You need momentum, volume, or structure tools to determine which direction the expansion will go.' },
  { q: 'Price is riding the upper Bollinger Band in a strong uptrend. This is called:', opts: ['Overbought &mdash; sell immediately', 'A band walk &mdash; a continuation signal showing strong momentum', 'A Bollinger Band failure', 'A squeeze setup'], correct: 1, explain: 'A band walk occurs when price stays at or near one band in a trending market. It signals strong momentum, not overbought conditions. BB mean-reversion only works in ranges. In trends, the band walk IS the signal to stay in the trade.' },
  { q: 'How does Keltner Channel differ from Bollinger Bands?', opts: ['Keltner uses ATR (smoother), Bollinger uses standard deviation (more reactive)', 'They are identical', 'Keltner is for stocks only', 'Bollinger Bands are always wider'], correct: 0, explain: 'Keltner Channels use ATR for their width, making them smoother and less reactive to sudden spikes. Bollinger Bands use standard deviation, making them more reactive. Their real power is in combination: BBs squeezing inside Keltners = extreme compression.' },
  { q: 'ATR is at its 95th percentile (peak volatility). What should you do with position sizing?', opts: ['Increase size &mdash; bigger moves mean bigger profits', 'Decrease size &mdash; wider stops needed, so fewer lots to maintain the same dollar risk', 'Size doesn&apos;t change based on volatility', 'Close all positions immediately'], correct: 1, explain: 'High ATR means wider stops are required to avoid being shaken out. To maintain the same dollar risk per trade, you must reduce position size. This is the volatility-position sizing relationship: vol up = size down.' },
  { q: 'The four phases of the volatility cycle, in order, are:', opts: ['Expansion → Peak → Contraction → Compression', 'Compression → Expansion → Peak → Contraction', 'High → Low → High → Low', 'None &mdash; volatility is random'], correct: 1, explain: 'The cycle is: Compression (energy building) → Expansion (breakout) → Peak (maximum volatility) → Contraction (calming down) → back to Compression. Understanding where you are in the cycle determines how you trade.' },
  { q: 'When Bollinger Bands squeeze INSIDE Keltner Channels, this signals:', opts: ['The indicators are broken', 'Extreme compression &mdash; one of the most reliable precursors to a powerful breakout', 'A sell signal', 'Normal market conditions'], correct: 1, explain: 'The BB-inside-Keltner squeeze (TTM Squeeze) means both standard deviation AND ATR agree that volatility is at extreme lows. This double-compression typically resolves with an above-average directional move. It&apos;s one of the most reliable volatility setups.' }
];

export default function VolatilityIntelligencePage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMyths, setExpandedMyths] = useState<Record<string, boolean>>({});
  const [atrValue, setAtrValue] = useState(50);
  const [riskDollars, setRiskDollars] = useState(100);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pageH = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
  const progress = Math.min(scrollY / (pageH || 1), 1);

  const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMyth = (id: string) => setExpandedMyths(prev => ({ ...prev, [id]: !prev[id] }));

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a);
    const newAnswers = [...a]; newAnswers[qi] = oi;
    if (newAnswers.every(v => v !== null)) {
      const correct = newAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) {
        setCertUnlocked(true);
        setTimeout(() => {
          try { const { default: confetti } = require('canvas-confetti'); confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#ffffff'] }); } catch {}
        }, 400);
      }
    }
  };

  // ATR Position Size Calculator
  const atrPips = 20 + atrValue * 1.6; // 20 to 180 pips
  const stopPips = Math.round(atrPips * 1.5);
  const pipValue = 10; // $10 per pip for 1 standard lot
  const positionSize = riskDollars / (stopPips * pipValue);
  const lots = Math.round(positionSize * 100) / 100;

  return (
    <div className="min-h-screen text-gray-200" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${progress * 100}%` }} /></motion.div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between max-w-3xl mx-auto px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.04]">
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">PRO &middot; LEVEL 5</span>
        </div>
        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent tracking-widest">ATLAS ACADEMY</span>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 11</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Volatility <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Intelligence</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">The dimension most traders ignore. Volatility governs your stops, your size, and your timing.</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-4"><span className="text-amber-400">First</span> &mdash; Why This Matters</h2>
          <div className="glass-card p-6 rounded-2xl mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">Trend tells you WHERE to trade. Momentum tells you WHEN. Volume tells you WHO is trading. But volatility tells you HOW MUCH to risk. Without volatility intelligence, your stop losses are guesses, your position sizes are arbitrary, and your timing is blind to the market&apos;s current personality.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">A prop firm study of 1,847 funded traders found: traders using ATR-based stops had a <strong>42% lower probability of blowing their challenge</strong> compared to those using fixed-pip stops. The reason was simple &mdash; ATR stops adapted to market conditions automatically. During high-volatility events, their stops were wider (avoiding false triggers). During low-vol periods, their stops tightened (protecting capital).</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Volatility Cycle Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Cycle</p>
          <h2 className="text-2xl font-extrabold mb-2">The Volatility Cycle</h2>
          <p className="text-gray-400 text-sm mb-5">Markets breathe. Compression leads to expansion, which leads to contraction, which leads to compression again. This cycle governs everything.</p>
          <VolatilityCycleAnimation />
          <div className="mt-4 glass-card p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-400 mb-2">The Fundamental Law</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">Low volatility leads to high volatility. High volatility leads to low volatility. <strong>Always.</strong> This is not a theory &mdash; it&apos;s a statistical fact observed across every market, every timeframe, for over a century. When you see compression, don&apos;t sleep. Prepare.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — ATR Stop Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Stop Problem</p>
          <h2 className="text-2xl font-extrabold mb-2">ATR Stops vs Fixed Stops</h2>
          <p className="text-gray-400 text-sm mb-5">Same market, same entry. One stop respects volatility. The other gets destroyed by normal wicks.</p>
          <ATRStopAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-1">Fixed Stop</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Ignores current conditions. Too tight in high vol (stopped by noise). Too wide in low vol (wastes risk). One size fits none.</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-bold text-green-400 mb-1">ATR Stop (1.5&times;)</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Adapts automatically. Wide when candles are big. Tight when candles are small. Your position size adjusts to keep dollar risk constant.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S03 — Four Volatility Tools */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-2">Four Volatility Tools Decoded</h2>
          <p className="text-gray-400 text-sm mb-5">Each tool measures a different aspect of volatility. Together, they tell you the market&apos;s current personality.</p>
          <div className="space-y-3">
            {volTools.map((tool, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`tool-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tool.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{tool.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`tool-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`tool-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">FORMULA</p>
                          <p className="text-xs text-gray-300 font-mono" dangerouslySetInnerHTML={{ __html: tool.formula }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 mb-1">PLAIN ENGLISH</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.plain }} />
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/5">
                          <p className="text-[10px] font-bold text-green-400 mb-1">PROFESSIONAL USES</p>
                          <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.uses }} />
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/5">
                          <p className="text-[10px] font-bold text-red-400 mb-1">THE TRAP</p>
                          <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.trap }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Volatility Regimes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Four Regimes</p>
          <h2 className="text-2xl font-extrabold mb-2">Volatility Regimes &amp; How to Trade Each</h2>
          <p className="text-gray-400 text-sm mb-5">Know where you are in the cycle. Each regime demands a different approach.</p>
          <div className="space-y-3">
            {volRegimes.map((reg, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`reg-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{reg.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{reg.regime}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`reg-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`reg-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[10px] font-bold text-gray-500 mb-1">ATR</p><p className="text-xs text-gray-300">{reg.atr}</p></div>
                          <div className="p-2 rounded-lg bg-white/[0.02]"><p className="text-[10px] font-bold text-gray-500 mb-1">BOLLINGER BANDS</p><p className="text-xs text-gray-300">{reg.bb}</p></div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: reg.what }} />
                        <div className={`p-2 rounded-lg bg-${reg.colour}-500/5 border border-${reg.colour}-500/10`}>
                          <p className={`text-[10px] font-bold text-${reg.colour}-400 mb-1`}>ACTION</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: reg.action }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive ATR Position Sizer */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Lab</p>
          <h2 className="text-2xl font-extrabold mb-2">ATR Position Size Calculator</h2>
          <p className="text-gray-400 text-sm mb-5">Adjust ATR and risk to see how volatility controls your position size. Watch what happens when ATR doubles.</p>
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">Current ATR</span>
                <span className="text-xs font-mono text-amber-400">{Math.round(atrPips)} pips</span>
              </div>
              <input type="range" min={0} max={100} value={atrValue} onChange={e => setAtrValue(+e.target.value)} className="w-full accent-amber-500" />
              <p className="text-[10px] text-gray-500 mt-1">Left = low volatility (calm). Right = high volatility (wild).</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">Risk Per Trade ($)</span>
                <span className="text-xs font-mono text-amber-400">${riskDollars}</span>
              </div>
              <input type="range" min={10} max={500} step={10} value={riskDollars} onChange={e => setRiskDollars(+e.target.value)} className="w-full accent-amber-500" />
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">ATR</p>
                  <p className="text-lg font-extrabold text-amber-400">{Math.round(atrPips)} <span className="text-xs font-normal text-gray-500">pips</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">Stop (1.5&times; ATR)</p>
                  <p className="text-lg font-extrabold text-red-400">{stopPips} <span className="text-xs font-normal text-gray-500">pips</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">Position Size</p>
                  <p className="text-lg font-extrabold text-green-400">{lots} <span className="text-xs font-normal text-gray-500">lots</span></p>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">As ATR increases, stop widens &rarr; position size DECREASES to maintain ${riskDollars} risk. This is the volatility&ndash;position size relationship.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — BB vs Keltner */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Power Combination</p>
          <h2 className="text-2xl font-extrabold mb-2">Bollinger Bands + Keltner Channels</h2>
          <p className="text-gray-400 text-sm mb-5">Two different volatility measures. Together, they create the most powerful compression signal in technical analysis.</p>
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <p className="text-xs font-extrabold text-amber-400 mb-1">Bollinger Bands</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">Use <strong>standard deviation</strong>. More reactive to sudden changes. Spiky. Expand/contract quickly.</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <p className="text-xs font-extrabold text-blue-400 mb-1">Keltner Channels</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">Use <strong>ATR</strong>. Smoother. Less reactive to spikes. Expand/contract gradually.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-2">THE SQUEEZE-WITHIN-A-SQUEEZE (TTM Squeeze)</p>
              <p className="text-xs text-gray-300 leading-relaxed">When Bollinger Bands squeeze so tightly that they fit INSIDE the Keltner Channels, both volatility measures agree that compression is extreme. This is the most reliable breakout precursor available. Historical data shows these squeezes resolve with directional moves that are 1.5&ndash;2&times; larger than average breakouts.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-xs font-extrabold text-gray-400 mb-1">HOW TO TRADE IT</p>
              <p className="text-[11px] text-gray-300 leading-relaxed">Wait for BBs to expand back outside Keltner Channels. This &ldquo;fire&rdquo; signal confirms the breakout direction. Enter with the expansion. The squeeze tells you WHEN. Momentum (MACD histogram direction) tells you WHICH WAY.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mistakes to Avoid</p>
          <h2 className="text-2xl font-extrabold mb-2">Common Volatility Mistakes</h2>
          <p className="text-gray-400 text-sm mb-5">Four traps that destroy accounts, especially during high-vol events.</p>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleMyth(`mistake-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedMyths[`mistake-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMyths[`mistake-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-xs text-red-400 leading-relaxed"><strong>Why It&apos;s Wrong:</strong> {m.wrong}</p>
                        <p className="text-xs text-green-400 leading-relaxed"><strong>Do This Instead:</strong> {m.right}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Quick Reference</p>
          <h2 className="text-2xl font-extrabold mb-2">Volatility Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-5">Six volatility scenarios and the professional response to each.</p>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              { label: 'BB Squeeze + Low ATR', action: 'PREPARE', colour: 'text-amber-400', desc: 'Compression. Breakout coming. Build watchlist, set alerts, prepare entries in both directions. Do NOT range-trade.' },
              { label: 'BB Expansion + Rising ATR', action: 'TREND', colour: 'text-green-400', desc: 'Active breakout. Trade WITH the direction of expansion. ATR-based stops. Reduce position size (wider stops).' },
              { label: 'ATR at 95th Percentile', action: 'PROTECT', colour: 'text-red-400', desc: 'Peak volatility. Take profits, tighten stops. Do NOT enter new positions. Wait for contraction.' },
              { label: 'Band Walk (Upper)', action: 'HOLD', colour: 'text-green-400', desc: 'Strong bullish momentum. Do NOT sell &ldquo;overbought.&rdquo; Trail stops. Only exit when price drops to the middle band.' },
              { label: 'BB Inside Keltner', action: 'ALERT', colour: 'text-amber-400', desc: 'TTM Squeeze. Extreme compression. Wait for BBs to expand outside Keltners, then enter with the direction.' },
              { label: 'ATR Declining from Highs', action: 'REDUCE', colour: 'text-amber-400', desc: 'Contraction phase. Trend may be exhausting. Tighten trailing stops. Begin looking for the next compression zone.' }
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0"><span className={`text-xs font-extrabold ${row.colour}`}>{row.action}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{row.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: row.desc }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Volatility Intelligence Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real scenarios. Read the volatility, make the call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You understand volatility at a professional level. Your stops will thank you.' : gameScore >= 3 ? 'Good foundation. Review the BB band walk section and ATR stop sizing.' : 'Volatility is the most misunderstood dimension. Re-read the regimes and BB/Keltner combination.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S10 — Quiz + Cert */}
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
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🌪️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: Volatility Intelligence</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Volatility Strategist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
