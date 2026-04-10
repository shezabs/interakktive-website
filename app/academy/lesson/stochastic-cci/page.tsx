// app/academy/lesson/stochastic-cci/page.tsx
// ATLAS Academy — Lesson 5.8: Stochastic & CCI [PRO]
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
// ANIMATION 1: Stochastic Range Mapper
// Left: price bar showing high-low range with close position
// Right: Stochastic gauge showing %K value
// ============================================================
function StochasticRangeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stochastic = Where is the Close within the Range?', w / 2, 14);

    // Animated close position (cycles through the range)
    const closePos = 0.5 + 0.45 * Math.sin(t); // 0.05 to 0.95

    // --- LEFT: Price Range Bar ---
    const barX = mid * 0.4;
    const barTop = 40;
    const barBot = h - 35;
    const barW = 30;
    const high = 2100;
    const low = 2060;
    const range = high - low;
    const close = low + range * closePos;

    // Range bar background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.roundRect(barX - barW / 2, barTop, barW, barBot - barTop, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Gradient fill from low to high
    const rangeGrad = ctx.createLinearGradient(0, barBot, 0, barTop);
    rangeGrad.addColorStop(0, 'rgba(239,68,68,0.15)');
    rangeGrad.addColorStop(0.5, 'rgba(245,158,11,0.1)');
    rangeGrad.addColorStop(1, 'rgba(34,197,94,0.15)');
    ctx.fillStyle = rangeGrad;
    ctx.beginPath(); ctx.roundRect(barX - barW / 2 + 2, barTop + 2, barW - 4, barBot - barTop - 4, 4); ctx.fill();

    // High/Low labels
    ctx.fillStyle = 'rgba(34,197,94,0.6)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`High: ${high}`, barX, barTop - 5);
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.fillText(`Low: ${low}`, barX, barBot + 14);

    // Close marker (horizontal line + dot)
    const closeY = barBot - (barBot - barTop) * closePos;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(barX - barW / 2 - 8, closeY); ctx.lineTo(barX + barW / 2 + 8, closeY); ctx.stroke();
    ctx.beginPath(); ctx.arc(barX, closeY, 5, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();

    // Close value
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Close: ${close.toFixed(0)}`, barX + barW / 2 + 14, closeY + 4);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('14-Period Range', barX, barBot + 26);

    // --- Arrow connecting to gauge ---
    ctx.strokeStyle = 'rgba(245,158,11,0.2)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(barX + barW / 2 + 12, closeY); ctx.lineTo(mid + 20, closeY); ctx.stroke();
    ctx.setLineDash([]);

    // --- RIGHT: Stochastic Gauge ---
    const gaugeX = mid + mid / 2;
    const gaugeTop = 40;
    const gaugeBot = h - 35;
    const gaugeW = 28;
    const stochVal = Math.round(closePos * 100);

    // Gauge background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.roundRect(gaugeX - gaugeW / 2, gaugeTop, gaugeW, gaugeBot - gaugeTop, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Fill up to current level
    const fillH = (gaugeBot - gaugeTop - 4) * closePos;
    const fillGrad = ctx.createLinearGradient(0, gaugeBot, 0, gaugeBot - fillH);
    fillGrad.addColorStop(0, stochVal > 80 ? 'rgba(239,68,68,0.4)' : stochVal < 20 ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.3)');
    fillGrad.addColorStop(1, stochVal > 80 ? 'rgba(239,68,68,0.15)' : stochVal < 20 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.1)');
    ctx.fillStyle = fillGrad;
    ctx.beginPath(); ctx.roundRect(gaugeX - gaugeW / 2 + 2, gaugeBot - 2 - fillH, gaugeW - 4, fillH, 4); ctx.fill();

    // Zone lines: 80 and 20
    const y80 = gaugeBot - (gaugeBot - gaugeTop) * 0.8;
    const y20 = gaugeBot - (gaugeBot - gaugeTop) * 0.2;
    ctx.strokeStyle = 'rgba(239,68,68,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(gaugeX - gaugeW / 2 - 3, y80); ctx.lineTo(gaugeX + gaugeW / 2 + 3, y80); ctx.stroke();
    ctx.strokeStyle = 'rgba(34,197,94,0.25)';
    ctx.beginPath(); ctx.moveTo(gaugeX - gaugeW / 2 - 3, y20); ctx.lineTo(gaugeX + gaugeW / 2 + 3, y20); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.font = '7px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('80', gaugeX + gaugeW / 2 + 5, y80 + 3);
    ctx.fillStyle = 'rgba(34,197,94,0.4)';
    ctx.fillText('20', gaugeX + gaugeW / 2 + 5, y20 + 3);

    // Value display
    const valColor = stochVal > 80 ? '#ef4444' : stochVal < 20 ? '#22c55e' : '#f59e0b';
    ctx.fillStyle = valColor; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${stochVal}`, gaugeX, gaugeBot - fillH - 10);
    ctx.font = '8px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('%K', gaugeX, gaugeTop - 5);

    // Bottom formula
    ctx.fillStyle = 'rgba(245,158,11,0.4)'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`%K = (${close.toFixed(0)} − ${low}) / (${high} − ${low}) × 100 = ${stochVal}`, w / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: CCI Deviation Visualiser
// Shows typical price oscillating around its average
// CCI value shows how many standard deviations away
// ============================================================
function CCIDeviationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CCI = How Far Price Deviates From Its Average', w / 2, 14);

    const padL = 30; const padR = w - 20;
    const midY = h * 0.48;
    const pts = 60;
    const xStep = (padR - padL) / (pts - 1);

    // Generate typical price and its SMA
    const tp: number[] = [];
    for (let i = 0; i < pts; i++) tp.push(100 + Math.sin(t + i * 0.08) * 15 + Math.sin(t * 0.5 + i * 0.15) * 8);
    const smaLen = 20;
    const sma: number[] = tp.map((_, i) => {
      if (i < smaLen - 1) return tp[i];
      let sum = 0; for (let j = i - smaLen + 1; j <= i; j++) sum += tp[j]; return sum / smaLen;
    });

    // Scale
    const allV = [...tp, ...sma];
    const minV = Math.min(...allV) - 5; const maxV = Math.max(...allV) + 5;
    const rangeV = maxV - minV || 1;
    const toY = (v: number) => midY + ((midY - 30) - (v - minV) / rangeV * (midY * 2 - 60)) + 15;

    // SMA line (dashed, amber)
    ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath();
    sma.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke(); ctx.setLineDash([]);

    // Typical price line
    ctx.strokeStyle = 'rgba(14,165,233,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath();
    tp.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Deviation shading between TP and SMA
    for (let i = 1; i < pts; i++) {
      const x1 = padL + (i - 1) * xStep;
      const x2 = padL + i * xStep;
      const dev = tp[i] - sma[i];
      const alpha = Math.min(0.15, Math.abs(dev) * 0.01);
      ctx.fillStyle = dev > 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x1, toY(tp[i - 1]));
      ctx.lineTo(x2, toY(tp[i]));
      ctx.lineTo(x2, toY(sma[i]));
      ctx.lineTo(x1, toY(sma[i - 1]));
      ctx.closePath(); ctx.fill();
    }

    // Current deviation
    const lastTP = tp[pts - 1];
    const lastSMA = sma[pts - 1];
    const lastDev = lastTP - lastSMA;

    // Mean deviation estimate
    let mdSum = 0;
    for (let i = pts - smaLen; i < pts; i++) mdSum += Math.abs(tp[i] - sma[pts - 1]);
    const meanDev = mdSum / smaLen || 0.01;
    const cci = lastDev / (0.015 * meanDev);

    // CCI value box
    const boxY = h - 55;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath(); ctx.roundRect(padL, boxY, padR - padL, 42, 6); ctx.fill();

    const cciColor = cci > 100 ? '#22c55e' : cci < -100 ? '#ef4444' : '#f59e0b';
    ctx.fillStyle = cciColor; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`CCI: ${cci.toFixed(0)}`, w / 2, boxY + 18);
    ctx.font = '8px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(cci > 100 ? 'Price is UNUSUALLY far above average' : cci < -100 ? 'Price is UNUSUALLY far below average' : 'Price is within normal deviation range', w / 2, boxY + 34);

    // Labels
    ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'left';
    ctx.fillStyle = '#0ea5e9'; ctx.fillText('Typical Price', padL, 30);
    ctx.fillStyle = '#f59e0b'; ctx.fillText('20-SMA (average)', padL + 80, 30);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// DATA
// ============================================================
const comparisons = [
  { q: 'What does it measure?', stoch: 'Where the close sits within the recent high-low RANGE (position)', cci: 'How far the typical price DEVIATES from its average (deviation)' },
  { q: 'Output range?', stoch: '0 to 100 (bounded)', cci: 'Unbounded (typically &minus;200 to +200, can exceed)' },
  { q: 'Default period?', stoch: '14, 3, 3', cci: '20' },
  { q: '"Extreme" zones?', stoch: 'Above 80 / Below 20', cci: 'Above +100 / Below &minus;100' },
  { q: 'Best for?', stoch: 'Ranging markets, pullback entries within trends, identifying close position within recent range', cci: 'Detecting unusual moves, trend breakout confirmation, mean-reversion signals in ranges' },
  { q: 'Weakness?', stoch: 'Stays pinned at 80/20 in strong trends (useless as reversal signal)', cci: 'Can reach extreme values (&plusmn;300+) in trends without meaning reversal' },
];

const techniques = [
  { name: 'Stochastic %K/%D Crossover in Context', detail: 'A %K crossing above %D below 20 is a bullish signal &mdash; but ONLY when combined with structural support. In a range, this is a bounce entry. In a downtrend, this is a trap. <strong class="text-white">The context determines whether the crossover is signal or noise.</strong> At a demand zone + London session + volume rising = A+ setup. At random price = noise.', color: 'text-green-400' },
  { name: 'Stochastic Divergence', detail: 'Same concept as RSI divergence but using Stochastic. Price makes a lower low, Stochastic makes a higher low = bullish divergence. Because Stochastic measures RANGE POSITION, this tells you that despite price falling further, it is closing HIGHER within recent ranges &mdash; buyers are defending the lower portion of the range.', color: 'text-amber-400' },
  { name: 'CCI Zero-Line Cross', detail: 'CCI crossing above zero means typical price has risen above its 20-period average. In a strong trend, this is a continuation signal after a pullback. CCI crossing below zero = price dropped below average. <strong class="text-white">The zero line for CCI is equivalent to the 50 line for RSI</strong> &mdash; it divides the bullish and bearish regimes.', color: 'text-sky-400' },
  { name: 'CCI Extreme Readings for Breakouts', detail: 'CCI above +200 means price is MORE THAN 2 standard deviations above its average. In a range, this is unsustainable. But at the START of a new trend, extreme CCI readings are CONFIRMATION of a genuine breakout. <strong class="text-white">The difference is context: extreme CCI in a range = reversal warning. Extreme CCI after a structural break = trend confirmation.</strong>', color: 'text-purple-400' },
  { name: 'When to Use Stochastic vs CCI vs RSI', detail: 'RSI: best all-round momentum tool. Use when you want gains-vs-losses momentum. Stochastic: best for ranging markets and pullback timing. Use when you care about WHERE the close is within the range. CCI: best for detecting unusual moves and breakouts. Use when you want to know if price is behaving abnormally relative to its average. <strong class="text-white">Pick ONE. Do not stack all three &mdash; that is redundancy.</strong>', color: 'text-red-400' },
];

const gameRounds = [
  {
    scenario: 'Stochastic reads 88 on GBP/USD which is in a strong uptrend. A trader says: &ldquo;Stochastic is overbought at 88. Short it.&rdquo; What is wrong?',
    options: [
      { text: 'Nothing &mdash; 88 is overbought and price must reverse', correct: false, explain: 'Stochastic at 88 means the close is at 88% of the recent high-low range &mdash; near the top. In a strong uptrend, this is NORMAL. Price closes near highs BECAUSE the trend is bullish. Stochastic can stay above 80 for days or weeks in trends. Shorting because Stochastic is &ldquo;overbought&rdquo; in an uptrend is fighting the trend based on a misunderstanding.' },
      { text: 'In an uptrend, Stochastic stays elevated because price consistently closes near the top of its range. 88 is normal, not a short signal. It means the trend is healthy.', correct: true, explain: 'Exactly. Stochastic above 80 in an uptrend means the close is consistently near the high &mdash; which is what uptrends DO. Like RSI range shift (Lesson 5.6), Stochastic zones shift with the regime. Use Stochastic pullbacks to 40&ndash;50 for entries in uptrends, not Stochastic &ldquo;overbought&rdquo; for shorts.' },
    ],
  },
  {
    scenario: 'CCI reads +185 on Bitcoin after it breaks above a major resistance level with heavy volume. Is this a sell signal?',
    options: [
      { text: 'Yes &mdash; CCI above 100 means overbought. Take profit and go short.', correct: false, explain: 'CCI at +185 means price is 1.85 standard deviations above its average. After a BREAKOUT with volume, this extreme reading CONFIRMS that the move is genuine and unusually strong. Selling here would be selling into the confirmation of a new trend. Extreme CCI after a structural break = trend confirmation, not reversal signal.' },
      { text: 'No &mdash; extreme CCI after a breakout with volume CONFIRMS the move is genuine. This is trend confirmation, not a reversal signal. The breakout context changes the interpretation.', correct: true, explain: 'Correct. Context is everything. CCI +185 in a tight range = price stretched too far, mean reversion likely. CCI +185 after a major resistance break with volume = price is breaking out with serious conviction. Same number, completely opposite interpretation. Structure determines meaning.' },
    ],
  },
  {
    scenario: 'A trader uses RSI, Stochastic, AND CCI on the same chart. All three show &ldquo;overbought&rdquo; readings. They say: &ldquo;Triple confirmation! Definitely overbought.&rdquo; What is the problem?',
    options: [
      { text: 'No problem &mdash; three indicators confirming the same thing is strong evidence', correct: false, explain: 'RSI, Stochastic, and CCI are ALL momentum/oscillator indicators. They measure closely related aspects of the same underlying data. When one shows extreme readings, the others almost always will too &mdash; they are correlated, not independent. Three correlated readings is ONE signal repeated three times, not three separate confirmations. For genuine confluence, pair one oscillator with a TREND indicator and a VOLUME indicator.' },
      { text: 'All three are momentum oscillators that correlate heavily. When one is &ldquo;overbought,&rdquo; the others usually are too. This is redundancy, not triple confirmation. Use ONE oscillator and combine with different indicator families.', correct: true, explain: 'Exactly right. This is the redundancy trap from Lesson 5.1. RSI measures gains vs losses. Stochastic measures close position in range. CCI measures deviation from average. They use different formulas but CORRELATE because they all derive from the same price data. Pick the one best suited to your market condition and pair it with trend + volume for genuine independence.' },
    ],
  },
  {
    scenario: 'EUR/USD is in a tight 30-pip range. Stochastic drops to 12, then %K crosses above %D while price touches the bottom of the range. Is this a valid long setup?',
    options: [
      { text: 'No &mdash; Stochastic below 20 is too dangerous to buy', correct: false, explain: 'This is actually one of the BEST Stochastic setups. In a RANGE (not a trend), Stochastic cycling between overbought and oversold is exactly what happens &mdash; and it&apos;s meaningful. Stochastic at 12 means the close is near the bottom of the range. A %K/%D crossover at the range bottom is a bounce signal. Combined with structural support (range bottom) this is a textbook range-trading entry.' },
      { text: 'Yes &mdash; in a range, Stochastic at 12 with a %K/%D crossover at range support is a classic bounce setup. Stochastic excels in ranging markets because it measures position within the range.', correct: true, explain: 'Exactly. This is WHERE Stochastic shines. In ranges, it oscillates between the top and bottom of the range, and crossovers at extremes with structural support/resistance are high-probability entries. The key context is that this is a RANGE, not a trend. Stochastic &ldquo;overbought/oversold&rdquo; is useful in ranges and useless in trends.' },
    ],
  },
  {
    scenario: 'You need to choose ONE momentum oscillator for your setup. Your trading style is: primarily trend-following with pullback entries on the 1H chart, XAUUSD. Which do you pick and why?',
    options: [
      { text: 'CCI &mdash; because it can detect breakouts and has no upper limit', correct: false, explain: 'CCI is best for detecting unusual deviations and breakout confirmation. For trend-following pullback entries, RSI is the better choice. RSI&apos;s range shift property (40&ndash;80 in uptrends) makes it ideal for identifying pullback entry zones within established trends. RSI at 40&ndash;45 in a bullish trend = momentum reset = pullback entry zone. CCI doesn&apos;t offer this clean range-based framework for pullbacks.' },
      { text: 'RSI &mdash; because its range shift property (40&ndash;80 in uptrends) makes it perfect for identifying pullback entry zones within trends. RSI cooling to 40&ndash;50 = momentum reset.', correct: true, explain: 'Correct. For trend-following pullback entries, RSI&apos;s regime-adaptive range (Lesson 5.6) is the strongest framework. In a bullish XAUUSD trend, RSI pulling back to 40&ndash;50 at a structural level is your entry zone. Stochastic would work too but its sensitivity creates more noise. CCI is better for breakout confirmation. Match the tool to the job.' },
    ],
  },
];

const quizQuestions = [
  { q: 'Stochastic at 85 means:', opts: ['Price is overvalued by 85%', 'The current close is at 85% of the recent 14-period high-low range', 'Volume is at 85% of average', 'RSI is also at 85'], correct: 1, explain: '%K = ((Close &minus; Lowest Low) / (Highest High &minus; Lowest Low)) &times; 100. At 85, the close is 85% of the way from the recent low to the recent high. It measures POSITION within range, not value.' },
  { q: 'CCI at +150 tells you:', opts: ['Price will reverse soon', 'Price is 1.5 standard deviations above its 20-period typical price average &mdash; an unusual upward move', 'The indicator is broken', 'Volume is extremely high'], correct: 1, explain: 'CCI uses mean deviation to normalise. +150 means the typical price is 1.5 standard deviations above its moving average. Whether this is a sell signal or a trend confirmation depends on CONTEXT (range vs breakout).' },
  { q: 'In which market condition does Stochastic work BEST?', opts: ['Strong uptrends', 'Strong downtrends', 'Ranging/sideways markets', 'During news events'], correct: 2, explain: 'Stochastic excels in ranges because it measures close position within the high-low range. In ranges, the range is well-defined and oscillations between 80 and 20 are meaningful. In trends, Stochastic gets pinned at extremes and is useless for reversals.' },
  { q: 'CCI crossing above zero means:', opts: ['Price will rise for certain', 'Typical price has risen above its 20-period average &mdash; short-term above long-term', 'The market has opened', 'CCI is bullish forever'], correct: 1, explain: 'The CCI zero line divides bullish (above average) from bearish (below average). Crossing above zero = typical price is now above its SMA = short-term conditions are above longer-term average. Similar to RSI crossing 50.' },
  { q: 'Why should you NOT use RSI + Stochastic + CCI together?', opts: ['They are all too accurate', 'They are all momentum oscillators that correlate &mdash; this is redundancy, not confirmation', 'They are too slow', 'They require too much screen space'], correct: 1, explain: 'All three measure closely related aspects of momentum from the same price data. They tend to show extreme readings simultaneously. Three correlated signals equals one signal repeated three times. Pair ONE oscillator with trend + volume for genuine multi-dimensional analysis.' },
  { q: 'Stochastic %K/%D crossover below 20 at a demand zone in a range is:', opts: ['A meaningless noise signal', 'A classic high-probability bounce setup &mdash; Stochastic at range bottom + structural support', 'Always a sell signal', 'Only valid on daily charts'], correct: 1, explain: 'In ranges, Stochastic at extremes with structural confluence is a strong signal. %K crossing above %D below 20 at a demand zone = multiple pieces of evidence that the range bottom will hold. This is Stochastic&apos;s sweet spot.' },
  { q: 'Extreme CCI (+200) after a resistance breakout with high volume suggests:', opts: ['Sell immediately &mdash; CCI is too high', 'Breakout confirmation &mdash; the move is genuine and unusually strong', 'The indicator is lagging', 'Nothing &mdash; CCI is unreliable above 100'], correct: 1, explain: 'Context changes interpretation. Extreme CCI in a range = stretched, mean reversion likely. Extreme CCI after a breakout with volume = confirmation of genuine institutional move. The structural context (breakout) determines whether extreme readings are warnings or confirmations.' },
  { q: 'For trend-following pullback entries, the BEST single oscillator is:', opts: ['Stochastic &mdash; because it shows overbought/oversold', 'CCI &mdash; because it detects unusual moves', 'RSI &mdash; because its range shift property identifies pullback zones within trends (40&ndash;50 in uptrends)', 'All three combined for maximum confirmation'], correct: 2, explain: 'RSI&apos;s regime-adaptive range (40&ndash;80 bullish, 20&ndash;60 bearish) makes it uniquely suited for pullback entries within trends. RSI cooling to 40&ndash;50 in a bullish trend = momentum reset at the bottom of the operating range = optimal re-entry zone.' },
];

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
export default function StochasticCCILesson() {
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
    { wrong: 'Using Stochastic &ldquo;overbought&rdquo; as a sell signal in uptrends', right: 'Stochastic above 80 in an uptrend is NORMAL &mdash; price closes near highs in trends. Use Stochastic OB/OS only in ranges. In trends, wait for pullbacks to 40&ndash;50 for entries.', icon: '📉' },
    { wrong: 'Stacking RSI + Stochastic + CCI for &ldquo;triple confirmation&rdquo;', right: 'All three are momentum oscillators and correlate. Pick ONE that suits your market condition: RSI for trends, Stochastic for ranges, CCI for breakouts. Pair with trend + volume.', icon: '📊' },
    { wrong: 'Ignoring CCI because it has no fixed boundaries', right: 'CCI&apos;s unbounded nature is its STRENGTH, not weakness. It reveals how UNUSUAL a move is in statistical terms. Values beyond &plusmn;200 are genuinely anomalous and worth paying attention to.', icon: '🚫' },
    { wrong: 'Treating all three oscillators as interchangeable', right: 'RSI = gains vs losses (momentum ratio). Stochastic = close position in range. CCI = deviation from average. They measure different ASPECTS of price. Choose based on what question you are asking the market.', icon: '🔄' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 5</span></div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Stochastic &amp; CCI<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Other Oscillators</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Two powerful tools that measure different things from RSI and MACD. Know when each one shines &mdash; and when to leave it alone.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Different Questions, Different Tools</p>
            <p className="text-gray-400 leading-relaxed mb-4">RSI asks: &ldquo;How big are recent gains compared to recent losses?&rdquo; MACD asks: &ldquo;How far apart are the fast and slow averages?&rdquo; But there are TWO more important questions that neither RSI nor MACD answers well:</p>
            <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-green-400">Stochastic asks:</strong> &ldquo;Where is the current close sitting WITHIN the recent trading range?&rdquo; &mdash; At the top? The middle? The bottom?</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-purple-400">CCI asks:</strong> &ldquo;How far has price deviated from its average? Is this move NORMAL or UNUSUAL?&rdquo;</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A forex trader switched from RSI to Stochastic for his range-trading setups and saw his win rate climb from <strong className="text-red-400">39%</strong> to <strong className="text-green-400">54%</strong> in ranging conditions. The reason: Stochastic is specifically designed to measure close position within a range &mdash; exactly what range trading requires. RSI (gains vs losses) was answering the wrong question for that market condition.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Stochastic Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch Stochastic Map the Range</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Left: the 14-period price range (high to low) with the current close position marked. Right: the Stochastic gauge showing the exact same information as a 0&ndash;100 percentage. The close moves through the range and the gauge follows.</p>
          <StochasticRangeAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Key Insight</p>
            <p className="text-sm text-gray-400">Stochastic literally maps where the close sits within the range. At 85 = close is near the top. At 15 = close is near the bottom. In a RANGE, these extremes matter. In a TREND, the close sits near the top (uptrend) or bottom (downtrend) continuously &mdash; making extremes meaningless.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; CCI Visualised</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch CCI Measure Deviation</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The blue line is the typical price. The amber dashed line is its 20-period average. The shaded area between them is the deviation. CCI tells you how MANY standard deviations the price is from its average. Beyond &plusmn;100 = statistically unusual.</p>
          <CCIDeviationAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Key Insight</p>
            <p className="text-sm text-gray-400">CCI answers: &ldquo;Is this move normal or abnormal?&rdquo; Values between &minus;100 and +100 are within normal statistical variation. Beyond &plusmn;100 = unusual. Beyond &plusmn;200 = very unusual. Whether &ldquo;unusual&rdquo; means &ldquo;reversal coming&rdquo; or &ldquo;breakout confirmed&rdquo; depends on the structural context.</p>
          </div>
        </motion.div>
      </section>

      {/* S03 — Head to Head */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Head to Head</p>
          <h2 className="text-2xl font-extrabold mb-2">Stochastic vs CCI &mdash; Side by Side</h2>
          <p className="text-gray-400 leading-relaxed mb-6">They look similar on a chart but measure fundamentally different things. This comparison shows exactly where each one excels.</p>
          <div className="p-4 rounded-2xl glass-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/10"><th className="text-left p-2 text-gray-500 font-bold"></th><th className="text-left p-2 text-green-400 font-extrabold">Stochastic</th><th className="text-left p-2 text-purple-400 font-extrabold">CCI</th></tr></thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="p-2 text-amber-400 font-bold">{row.q}</td>
                    <td className="p-2 text-gray-400" dangerouslySetInnerHTML={{ __html: row.stoch }} />
                    <td className="p-2 text-gray-400" dangerouslySetInnerHTML={{ __html: row.cci }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* S04 — Techniques */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Advanced Techniques</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Professional Applications</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each technique answers a different trading question. Choose based on what you need to know RIGHT NOW.</p>
          <div className="space-y-3">
            {techniques.map((tech, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenTech(openTech === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${tech.color}`}>{tech.name}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openTech === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>{openTech === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05]"><p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tech.detail }} /></div></motion.div>)}</AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Decision Tree */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Decision Tree</p>
          <h2 className="text-2xl font-extrabold mb-2">Which Oscillator Should You Use?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">One question determines the answer. What is the market doing RIGHT NOW?</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-amber-400 mb-2">Trending? &rarr; Use RSI</p><p className="text-sm text-gray-400">RSI&apos;s range shift property makes it the best for identifying pullback zones within trends. Stochastic gets pinned. CCI goes extreme. RSI adapts.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-green-400 mb-2">Ranging? &rarr; Use Stochastic</p><p className="text-sm text-gray-400">Stochastic was BUILT for ranges. It measures close position within the range &mdash; exactly what you need for bounce/rejection entries at range boundaries.</p></div>
            <div className="p-4 rounded-xl glass-card"><p className="text-sm font-extrabold text-purple-400 mb-2">Breakout? &rarr; Use CCI</p><p className="text-sm text-gray-400">CCI&apos;s unbounded nature and deviation measurement make it ideal for confirming whether a breakout is genuine (extreme CCI = unusual move = real) or fake (mild CCI = normal move = suspect).</p></div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Rule</p>
            <p className="text-sm text-gray-400">Pick ONE oscillator per market condition. Never stack all three. Combine your chosen oscillator with a TREND indicator (MA) and a VOLUME indicator (OBV) for genuine multi-dimensional analysis.</p>
          </div>
        </motion.div>
      </section>

      {/* S06 — Stochastic Nuances */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Stochastic Nuances</p>
          <h2 className="text-2xl font-extrabold mb-2">%K, %D, and the Smoothing Question</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Stochastic has three inputs: %K period (14), %K smoothing (3), and %D period (3). Here&apos;s what each one does:</p>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">%K Period (14)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">How many candles define the high-low range. Shorter = more reactive/noisy. Longer = smoother/slower.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">%K Smoothing (3)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">How much the raw %K is smoothed. Higher = less whipsaw. &ldquo;Fast&rdquo; Stochastic uses smoothing of 1 (raw). &ldquo;Slow&rdquo; uses 3.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">%D Period (3)</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">The signal line — a 3-period SMA of %K. Crossovers between %K and %D generate the traditional &ldquo;signals.&rdquo;</span></p></div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Pro Tip</p>
            <p className="text-sm text-gray-400">Most traders use the &ldquo;Slow&rdquo; Stochastic (14, 3, 3) which is already smoothed. The &ldquo;Fast&rdquo; version (14, 1, 3) is too noisy for most setups. Stick with defaults unless you have a specific, tested reason to change.</p>
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
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
                <AnimatePresence>{openMistake === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 mt-1 rounded-xl bg-green-500/5 border border-green-500/10"><p className="text-xs font-bold text-green-400 mb-1">&#9989; Do This Instead</p><p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: m.right }} /></div></motion.div>)}</AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Quick Reference</h2>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-green-400">Stoch 15 + %K/%D cross at range support</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Classic range bounce entry. High probability in sideways markets.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-amber-400">Stoch 85 in strong uptrend</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Normal. NOT a sell signal. Trend health indicator.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">CCI +180 after breakout + volume</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Breakout confirmation. The move is genuinely unusual. Add on pullback.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-purple-400">CCI +180 in tight range</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Overextension. Mean reversion likely. Look for reversal at resistance.</span></p></div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className="text-sm"><strong className="text-sky-400">CCI crossing zero from below</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">Typical price rising above average. Bullish regime shift. Like RSI crossing 50.</span></p></div>
          </div>
        </motion.div>
      </section>

      {/* S09 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Stochastic &amp; CCI Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Pick the right tool, read the right context.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You know which tool to use and when. That is the real skill.' : gameScore >= 3 ? 'Solid — review the decision tree to sharpen tool selection.' : 'Re-read the comparison table and decision tree, then try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30">🎛️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: Stochastic &amp; CCI</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-green-400 via-purple-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Oscillator Specialist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
