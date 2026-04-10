// app/academy/lesson/anatomy-of-oscillator/page.tsx
// ATLAS Academy — Lesson 5.3: The Anatomy of an Oscillator [PRO]
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
// ANIMATION 1: RSI Engine — Step-by-step calculation
// Shows 14 candles, colours gains green / losses red,
// calculates avg gain, avg loss, RS, RSI in real time
// ============================================================
function RSIEngineAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const phase = (f % 360) / 360; // cycles 0-1

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RSI Engine — How It Actually Calculates', w / 2, 16);

    // Generate 14 candle changes (animated, cycling)
    const changes: number[] = [];
    for (let i = 0; i < 14; i++) {
      changes.push(Math.sin(t * 1.5 + i * 0.7 + phase * Math.PI * 2) * 2.5 + Math.cos(i * 1.1) * 0.8);
    }

    // Draw candle bars
    const barW = Math.min(16, (w - 80) / 16);
    const startX = 30;
    const barY = h * 0.35;
    const scale = 14;

    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    changes.forEach((c, i) => {
      const x = startX + i * (barW + 4) + barW / 2;
      const barH = c * scale;
      const isGain = c >= 0;

      ctx.fillStyle = isGain ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
      if (isGain) {
        ctx.fillRect(x - barW / 2, barY - barH, barW, barH);
      } else {
        ctx.fillRect(x - barW / 2, barY, barW, -barH);
      }

      // Change value label
      ctx.fillStyle = isGain ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)';
      const labelY = isGain ? barY - barH - 5 : barY - barH + 10;
      ctx.fillText(`${c >= 0 ? '+' : ''}${c.toFixed(1)}`, x, Math.max(25, Math.min(h * 0.58, labelY)));
    });

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(startX - 10, barY);
    ctx.lineTo(startX + 14 * (barW + 4) + 10, barY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate RSI
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / 14 : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / 14 : 0.001;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Calculation readout box
    const boxY = h * 0.64;
    const boxH = h - boxY - 8;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(15, boxY, w - 30, boxH, 8);
    ctx.fill();

    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    const col1 = 25;
    const col2 = w * 0.38;
    const lineH = 14;
    let row = boxY + 16;

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`Avg Gain = ${avgGain.toFixed(3)}`, col1, row);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`Avg Loss = ${avgLoss.toFixed(3)}`, col2, row);
    row += lineH;

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`RS = Avg Gain / Avg Loss = ${rs.toFixed(3)}`, col1, row);
    row += lineH;

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`RSI = 100 - (100 / (1 + RS)) = ${rsi.toFixed(1)}`, col1, row);

    // RSI value — big display
    const rsiColor = rsi > 70 ? '#ef4444' : rsi < 30 ? '#22c55e' : '#f59e0b';
    ctx.fillStyle = rsiColor;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(rsi.toFixed(1), w - 25, row);

    // Zone label
    ctx.font = '8px system-ui';
    ctx.fillText(rsi > 70 ? 'STRONG MOMENTUM' : rsi < 30 ? 'WEAK MOMENTUM' : 'NEUTRAL', w - 25, row + 12);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: MACD Mechanics — Fast EMA minus Slow EMA
// Shows two EMAs converging/diverging, histogram growing/shrinking
// ============================================================
function MACDMechanicsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const pts = 60;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MACD Engine — Fast EMA minus Slow EMA', w / 2, 16);

    // Generate price-like curve
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(50 + Math.sin(t + i * 0.08) * 18 + Math.sin(t * 0.5 + i * 0.15) * 10 + Math.cos(i * 0.2) * 5);
    }

    // Calculate EMAs
    const calcEMA = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const ema: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };

    const ema12 = calcEMA(prices, 12);
    const ema26 = calcEMA(prices, 26);

    const chartTop = 30;
    const chartBot = h * 0.48;
    const chartH = chartBot - chartTop;
    const histTop = h * 0.55;
    const histBot = h - 12;
    const histMid = (histTop + histBot) / 2;

    const xStep = (w - 40) / (pts - 1);

    // Find price range for scaling
    const allVals = [...prices, ...ema12, ...ema26];
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const range = maxV - minV || 1;

    const toY = (v: number) => chartBot - ((v - minV) / range) * chartH;

    // Draw 12 EMA (fast — sky blue)
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ema12.forEach((v, i) => {
      const x = 20 + i * xStep;
      i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v));
    });
    ctx.stroke();

    // Draw 26 EMA (slow — amber)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ema26.forEach((v, i) => {
      const x = 20 + i * xStep;
      i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v));
    });
    ctx.stroke();

    // Labels
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('12 EMA (fast)', 22, chartTop + 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('26 EMA (slow)', 22, chartTop + 24);

    // Histogram zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, histMid);
    ctx.lineTo(w - 20, histMid);
    ctx.stroke();

    // MACD histogram
    const macdVals = ema12.map((v, i) => v - ema26[i]);
    const maxMacd = Math.max(...macdVals.map(Math.abs)) || 1;

    ctx.font = '8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('MACD Histogram (fast − slow)', 22, histTop - 3);

    macdVals.forEach((v, i) => {
      const x = 20 + i * xStep;
      const barH = (v / maxMacd) * (histBot - histMid - 4);
      ctx.fillStyle = v >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
      ctx.fillRect(x - 1, histMid, 2, -barH);
    });

    // Current MACD value
    const currentMacd = macdVals[macdVals.length - 1];
    ctx.fillStyle = currentMacd >= 0 ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`MACD: ${currentMacd.toFixed(2)}`, w - 22, histTop - 3);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// OSCILLATOR BREAKDOWN DATA
// ============================================================
const oscillators = [
  {
    name: 'RSI (Relative Strength Index)',
    formula: 'RSI = 100 &minus; (100 / (1 + RS)), where RS = Avg Gain / Avg Loss',
    plain: 'RSI asks one question: &ldquo;Over the last N candles, how big were the up-moves compared to the down-moves?&rdquo; If up-moves dominated, RSI is high. If down-moves dominated, RSI is low. At 50, they&apos;re equal.',
    range: '0 to 100. Above 70 = strong upward momentum. Below 30 = strong downward momentum. 50 = neutral.',
    inputs: 'Period (default 14). Shorter = faster/noisier. Longer = smoother/slower.',
    trap: 'RSI above 70 does NOT mean &ldquo;price must fall.&rdquo; It means momentum is currently strong. In a trend, RSI can stay above 70 for weeks.',
    color: 'text-amber-400',
  },
  {
    name: 'MACD (Moving Average Convergence Divergence)',
    formula: 'MACD Line = 12 EMA &minus; 26 EMA. Signal Line = 9 EMA of MACD Line. Histogram = MACD Line &minus; Signal Line.',
    plain: 'MACD measures the GAP between a fast average and a slow average. When the fast average pulls away from the slow one, momentum is accelerating. When they converge, momentum is fading. The histogram shows whether this gap is growing or shrinking.',
    range: 'No fixed range &mdash; oscillates around zero. Above zero = fast EMA above slow EMA (bullish momentum). Below zero = bearish momentum.',
    inputs: 'Fast (12), Slow (26), Signal (9). These are the EMA periods. Adjusting changes sensitivity.',
    trap: 'A MACD crossover alone is meaningless. Crossovers happen constantly. Without structure and session context, most crossovers lead nowhere.',
    color: 'text-sky-400',
  },
  {
    name: 'Stochastic Oscillator',
    formula: '%K = ((Close &minus; Lowest Low) / (Highest High &minus; Lowest Low)) &times; 100. %D = 3-period SMA of %K.',
    plain: 'Stochastic asks: &ldquo;Where is the current close relative to the recent range?&rdquo; If price closes near the top of the range, Stochastic is high. Near the bottom, it&apos;s low. It measures position within the recent trading range.',
    range: '0 to 100. Above 80 = near top of recent range. Below 20 = near bottom of recent range.',
    inputs: '%K period (14), %K smoothing (3), %D period (3). The smoothing parameters control how reactive it is.',
    trap: 'Stochastic above 80 in a strong uptrend just means price keeps closing near recent highs &mdash; that&apos;s what uptrends DO. It&apos;s not a sell signal.',
    color: 'text-green-400',
  },
  {
    name: 'CCI (Commodity Channel Index)',
    formula: 'CCI = (Typical Price &minus; SMA of Typical Price) / (0.015 &times; Mean Deviation)',
    plain: 'CCI measures how far the current price deviates from its average. High CCI = price is unusually far above average. Low CCI = price is unusually far below. The 0.015 constant was chosen so that roughly 70&ndash;80% of values fall between &minus;100 and +100.',
    range: 'No fixed upper/lower bound. Typically &minus;200 to +200. Beyond &plusmn;100 = statistically unusual price deviation.',
    inputs: 'Period (default 20). Shorter = more extreme readings, more false signals.',
    trap: 'CCI can reach extreme values (&plusmn;300+) in strong trends without meaning a reversal is coming. Extreme readings measure extreme momentum, not exhaustion.',
    color: 'text-purple-400',
  },
  {
    name: 'Williams %R',
    formula: '%R = ((Highest High &minus; Close) / (Highest High &minus; Lowest Low)) &times; &minus;100',
    plain: 'Williams %R is the mirror image of Stochastic. It measures where the close is relative to the recent range, but flipped &mdash; 0 means close is at the highest point, &minus;100 at the lowest. Functionally identical to Stochastic, just inverted.',
    range: '&minus;100 to 0. Above &minus;20 = near top of range. Below &minus;80 = near bottom.',
    inputs: 'Period (default 14).',
    trap: 'Because it&apos;s mathematically identical to Stochastic (inverted), using BOTH together is pure redundancy. Pick one.',
    color: 'text-red-400',
  },
];

// ============================================================
// GAME DATA
// ============================================================
const gameRounds = [
  {
    scenario: 'RSI reads 72. A trader says: &ldquo;RSI has calculated that price is overvalued and must decline.&rdquo; What is wrong with this statement?',
    options: [
      { text: 'Nothing wrong &mdash; RSI measures value, and 72 means overvalued', correct: false, explain: 'RSI does NOT measure value. It measures the ratio of recent gains to recent losses. RSI at 72 means that over the last 14 candles, upward moves have been significantly larger than downward moves. It says nothing about whether price is &ldquo;overvalued&rdquo; &mdash; that&apos;s a fundamentals concept, not a momentum concept.' },
      { text: 'RSI doesn&apos;t measure value &mdash; it measures the ratio of recent gains to recent losses. 72 means upward momentum has been dominant, not that price is overvalued.', correct: true, explain: 'Exactly. RSI is a momentum measurement, not a valuation tool. It tells you HOW price has been moving (strongly up), not WHETHER the current price is correct. An RSI of 72 in a strong trend is perfectly normal and sustainable.' },
    ],
  },
  {
    scenario: 'The MACD histogram is shrinking (getting smaller) while price is still making higher highs. What does this mean?',
    options: [
      { text: 'Price is about to crash &mdash; the histogram predicts a reversal', correct: false, explain: 'The histogram doesn&apos;t predict anything. It measures the rate of change of the gap between the 12 EMA and 26 EMA. A shrinking histogram means the fast EMA is still above the slow EMA, but the gap is NARROWING. Momentum is decelerating &mdash; but deceleration is not reversal. A car slowing from 120 to 100 km/h is still moving forward.' },
      { text: 'Momentum is decelerating &mdash; the gap between fast and slow EMAs is narrowing. But deceleration is not the same as reversal. Price can decelerate and then re-accelerate.', correct: true, explain: 'Correct. A shrinking histogram means the 12 EMA is converging toward the 26 EMA. Momentum is slowing. But slowing momentum can lead to: (a) a pullback then continuation, (b) ranging, or (c) a reversal. The histogram alone cannot tell you which. You need structure.' },
    ],
  },
  {
    scenario: 'Stochastic reads 85. A beginner says &ldquo;85 is overbought, just like RSI at 70.&rdquo; Is this comparison accurate?',
    options: [
      { text: 'Yes &mdash; both measure the same thing, just with different numbers', correct: false, explain: 'They measure fundamentally different things. RSI measures the ratio of gains to losses (momentum). Stochastic measures where the close sits within the recent high-low range (position). RSI at 70 means gains have dominated losses. Stochastic at 85 means the close is near the top of the recent range. These are related but distinct measurements with different implications.' },
      { text: 'No &mdash; RSI measures gains vs losses (momentum), while Stochastic measures close position within the range. They are different dimensions of the same price data.', correct: true, explain: 'Exactly right. This is why RSI and Stochastic CAN provide genuine confluence when they agree &mdash; they measure different aspects of price. But using them both as &ldquo;overbought = sell&rdquo; misunderstands what each one actually calculates.' },
    ],
  },
  {
    scenario: 'You want to understand MACD better. You look at the formula: MACD = 12 EMA minus 26 EMA. If the 12 EMA is at 1850 and the 26 EMA is at 1842, what is the MACD value and what does it mean?',
    options: [
      { text: 'MACD = 8. It means price will rise by 8 more points.', correct: false, explain: 'MACD = 8 is correct, but it does NOT predict future movement. MACD at +8 means the fast average (12 EMA) is currently 8 points ABOVE the slow average (26 EMA). This tells you short-term momentum is bullish &mdash; the recent price trend is pulling the fast average away from the slow one. What happens NEXT depends on the market, not on this number.' },
      { text: 'MACD = 8. It means the fast average is 8 points above the slow average right now &mdash; short-term momentum is currently bullish. It says nothing about what happens next.', correct: true, explain: 'Perfect. MACD = 1850 &minus; 1842 = 8. The positive value means short-term price action (12 candles) is running ahead of longer-term action (26 candles). That&apos;s a measurement of NOW. What happens next requires additional analysis.' },
    ],
  },
  {
    scenario: 'A trader uses both Stochastic (14, 3, 3) and Williams %R (14) on the same chart. Is this a good combination?',
    options: [
      { text: 'Yes &mdash; two oscillators provide more confirmation than one', correct: false, explain: 'Stochastic and Williams %R are mathematically almost identical &mdash; Williams %R is literally an inverted version of Stochastic %K. Using both is like reading the same sentence forwards and backwards. You get zero new information. This is the redundancy trap from Lesson 5.1.' },
      { text: 'No &mdash; Williams %R is mathematically the inverse of Stochastic. They give identical information in different formats. This is pure redundancy.', correct: true, explain: 'Exactly. %R = &minus;(100 &minus; %K). It&apos;s the same calculation, flipped. Two &ldquo;confirmations&rdquo; from the same data is not confirmation at all. For genuine confluence, combine momentum with volume or trend &mdash; not momentum with momentum.' },
    ],
  },
];

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  { q: 'What does RSI actually measure?', opts: ['Whether a stock is overvalued or undervalued', 'The ratio of average gains to average losses over N periods', 'How many buyers vs sellers are in the market', 'The probability that price will reverse'], correct: 1, explain: 'RSI = 100 &minus; (100 / (1 + RS)), where RS = Average Gain / Average Loss. It measures the relative size of recent up-moves vs down-moves. Nothing more.' },
  { q: 'When MACD crosses above zero, what has happened mathematically?', opts: ['Price has reached a support level', 'The 12-period EMA has crossed above the 26-period EMA', 'Volume has increased significantly', 'The market has become bullish for certain'], correct: 1, explain: 'MACD = 12 EMA &minus; 26 EMA. When MACD crosses above zero, the 12 EMA is now above the 26 EMA. Short-term average price has overtaken longer-term average price. That is the entire mathematical event.' },
  { q: 'What does Stochastic at 90 actually tell you?', opts: ['Price is 90% overvalued and must drop', 'The current close is near the top of the recent high-low range', 'Exactly 90% of traders are buying', 'Price has risen 90% from its low'], correct: 1, explain: 'Stochastic %K = ((Close &minus; Lowest Low) / (Highest High &minus; Lowest Low)) &times; 100. At 90, the close is 90% of the way between the recent low and the recent high. It measures position within range, not value.' },
  { q: 'Why does changing RSI from 14 to 7 periods make it more volatile?', opts: ['Because RSI-7 uses future data to predict faster', 'Because 7 candles of data is less stable than 14 &mdash; each candle has more influence on the average', 'Because the number 7 is mathematically special', 'Because shorter periods detect more patterns'], correct: 1, explain: 'With 7 candles, each individual candle represents 1/7th (~14%) of the calculation. With 14 candles, each represents 1/14th (~7%). A single large candle has twice the impact on RSI-7 vs RSI-14, creating more extreme swings.' },
  { q: 'The MACD histogram is the difference between:', opts: ['The MACD line and the zero line', 'The fast EMA and the slow EMA', 'The MACD line and the signal line', 'Today&apos;s close and yesterday&apos;s close'], correct: 2, explain: 'Histogram = MACD Line &minus; Signal Line. The MACD line is already the difference between fast and slow EMAs. The histogram measures the rate of change of THAT difference. It&apos;s a derivative of a derivative &mdash; acceleration of momentum.' },
  { q: 'Which pair of oscillators is the MOST redundant (measuring the same thing)?', opts: ['RSI and Bollinger Bands', 'Stochastic and Williams %R', 'MACD and ATR', 'CCI and Volume'], correct: 1, explain: 'Stochastic and Williams %R are mathematically inverse functions of each other. Williams %R = &minus;(100 &minus; Stochastic %K). They provide identical information in different formats. Zero additional insight.' },
  { q: 'All oscillators share one fundamental characteristic:', opts: ['They all predict future price direction', 'They all calculate from past price data and oscillate between fixed or semi-fixed boundaries', 'They all use 14-period lookbacks by default', 'They all generate buy and sell signals automatically'], correct: 1, explain: 'Every oscillator takes past price data, runs a mathematical formula, and produces a value that oscillates. RSI: 0&ndash;100. Stochastic: 0&ndash;100. CCI: unbounded but oscillates. MACD: oscillates around zero. All measure the past. None predict the future.' },
  { q: 'A trader says &ldquo;the MACD histogram PREDICTED the reversal because it was shrinking before price turned.&rdquo; What actually happened?', opts: ['MACD genuinely predicted the future move', 'The histogram measured decelerating momentum (EMAs converging) which sometimes, but not always, precedes reversals &mdash; this time it did', 'The histogram was lagging, not leading', 'MACD doesn&apos;t have a histogram'], correct: 1, explain: 'The histogram measured that the gap between the 12 EMA and 26 EMA was narrowing. That&apos;s deceleration, not prediction. Sometimes deceleration leads to reversal. Sometimes it leads to consolidation then continuation. The histogram was right this time &mdash; but it would have given the same signal before many non-reversals too.' },
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
export default function AnatomyOfOscillatorLesson() {
  const [openOsc, setOpenOsc] = useState<number | null>(null);
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
  // Interactive RSI calculator
  const [rsiGains, setRsiGains] = useState([1.2, 0.8, 1.5, 0.3, 0.9, 1.1, 0.6]);
  const [rsiLosses, setRsiLosses] = useState([0.7, 1.0, 0.4, 0.5, 0.8, 0.3, 0.6]);

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

  // RSI calculator
  const avgGain = rsiGains.reduce((a, b) => a + b, 0) / 14;
  const avgLoss = rsiLosses.reduce((a, b) => a + b, 0) / 14;
  const rs = avgGain / (avgLoss || 0.001);
  const rsiCalc = 100 - (100 / (1 + rs));

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Treating &ldquo;overbought&rdquo; as a sell signal', right: '&ldquo;Overbought&rdquo; is a misnomer. RSI above 70 means momentum is strong. In a trend, strong momentum is NORMAL. Rename it &ldquo;strong momentum zone&rdquo; in your head.', icon: '📉' },
    { wrong: 'Not understanding what the formula actually calculates', right: 'If you can&apos;t explain in one sentence what RSI measures (ratio of gains to losses), you shouldn&apos;t be trading with it. Know the engine before you drive the car.', icon: '🔧' },
    { wrong: 'Using MACD crossovers as standalone entry signals', right: 'A crossover means the fast EMA overtook the slow EMA. That happens constantly. Filter crossovers with structure (is there a level here?) and context (is smart money active?).', icon: '❌' },
    { wrong: 'Combining Stochastic + Williams %R for &ldquo;double confirmation&rdquo;', right: 'They are the same formula inverted. Two copies of one measurement is redundancy, not confirmation. Pair Stochastic with a TREND indicator (MA) instead.', icon: '📋' },
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
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 3</p>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-black leading-[1.1] tracking-tight mb-5">
            The Anatomy of<br />
            <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>an Oscillator</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            Open the hood. See inside the engine. Once you understand HOW oscillators calculate their values, you&apos;ll never blindly trust a number again.
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
            <p className="text-xl font-extrabold mb-3">Would You Fly a Plane Without Understanding the Instruments?</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most traders use RSI, MACD, and Stochastic without the faintest idea of what the formula actually computes. They see a line, it goes up, they think &ldquo;buy.&rdquo; It goes down, they think &ldquo;sell.&rdquo; That&apos;s like reading a cockpit altimeter and thinking the number is the temperature.</p>
            <p className="text-gray-400 leading-relaxed mb-4">When you understand the engine &mdash; what goes IN, what calculation happens, and what comes OUT &mdash; you stop being a passenger. You become the engineer. You know <strong className="text-amber-400">exactly</strong> what RSI at 72 means, exactly what MACD at &minus;3.5 means, and exactly why Stochastic at 85 is not a sell signal in a trend.</p>
            <p className="text-gray-400 leading-relaxed">This lesson opens the hood on every major oscillator. No more black boxes. No more blind faith.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading mentor surveyed <strong className="text-white">200 of his students</strong> with one question: &ldquo;In one sentence, what does RSI calculate?&rdquo; Only <strong className="text-red-400">11 out of 200</strong> (5.5%) could answer correctly. The other 189 said variations of &ldquo;whether price is overbought or oversold.&rdquo; Those 189 were using a tool they didn&apos;t understand &mdash; and their results showed it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: RSI Engine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Inside the RSI Engine</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch RSI Calculate in Real Time</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Below you can see 14 candle changes (green = gain, red = loss). The formula adds up the average gains, divides by average losses, and produces a single number between 0 and 100. Watch the values shift as the data cycles.</p>
          <RSIEngineAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What You&apos;re Seeing</p>
            <p className="text-sm text-gray-400">Every RSI value you see on your chart is the result of this exact calculation running on the last 14 candles. When a big green candle enters the window, RSI jumps up. When a big red candle enters, RSI drops. It&apos;s pure arithmetic &mdash; no magic, no prediction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: MACD Mechanics === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Inside the MACD Engine</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch MACD Calculate in Real Time</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MACD is simply the fast EMA (blue, 12-period) minus the slow EMA (amber, 26-period). When the fast pulls above the slow, MACD is positive. The green/red histogram shows this gap changing over time.</p>
          <MACDMechanicsAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What You&apos;re Seeing</p>
            <p className="text-sm text-gray-400">The histogram is not a separate indicator &mdash; it&apos;s the visual representation of how fast the two averages are converging or diverging. Growing histogram = momentum accelerating. Shrinking histogram = momentum decelerating. Zero crossing = the averages have met.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: The Five Oscillators Decoded === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Every Oscillator Decoded</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Oscillators, Fully Transparent</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Tap each oscillator to see the formula, what it actually measures in plain English, and the trap that catches most retail traders.</p>
          <div className="space-y-3">
            {oscillators.map((osc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button onClick={() => setOpenOsc(openOsc === i ? null : i)} className="w-full flex items-center justify-between p-4 rounded-xl glass-card text-left">
                  <p className={`text-sm font-extrabold ${osc.color}`}>{osc.name}</p>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openOsc === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openOsc === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-1 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-xs font-bold text-gray-500 mb-1">FORMULA</p>
                          <p className="text-sm font-mono text-amber-400" dangerouslySetInnerHTML={{ __html: osc.formula }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-400 mb-1">&#128161; In Plain English</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: osc.plain }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-white/[0.02]">
                            <p className="text-[10px] font-bold text-gray-500">RANGE</p>
                            <p className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: osc.range }} />
                          </div>
                          <div className="p-2 rounded-lg bg-white/[0.02]">
                            <p className="text-[10px] font-bold text-gray-500">INPUTS</p>
                            <p className="text-xs text-gray-400">{osc.inputs}</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                          <p className="text-xs font-bold text-red-400 mb-1">&#9888;&#65039; The Retail Trap</p>
                          <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: osc.trap }} />
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

      {/* === S04: Interactive RSI Calculator === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Build Your Own RSI</p>
          <h2 className="text-2xl font-extrabold mb-2">Interactive RSI Calculator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Drag the gain and loss sliders to see how RSI changes. This is the exact maths that runs every time your chart calculates RSI. Over 14 periods, with 7 gains and 7 losses (simplified):</p>
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div>
              <p className="text-xs font-bold text-green-400 mb-2">Gains (7 up-candles)</p>
              <div className="grid grid-cols-7 gap-2">
                {rsiGains.map((g, i) => (
                  <div key={i} className="text-center">
                    <input type="range" min={0} max={30} value={g * 10} onChange={e => { const n = [...rsiGains]; n[i] = Number(e.target.value) / 10; setRsiGains(n); }} className="w-full h-1 appearance-none cursor-pointer" style={{ accentColor: '#22c55e', writingMode: 'vertical-lr' as never, height: '60px' }} />
                    <p className="text-[10px] font-mono text-green-400 mt-1">+{g.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 mb-2">Losses (7 down-candles)</p>
              <div className="grid grid-cols-7 gap-2">
                {rsiLosses.map((l, i) => (
                  <div key={i} className="text-center">
                    <input type="range" min={0} max={30} value={l * 10} onChange={e => { const n = [...rsiLosses]; n[i] = Number(e.target.value) / 10; setRsiLosses(n); }} className="w-full h-1 appearance-none cursor-pointer" style={{ accentColor: '#ef4444', writingMode: 'vertical-lr' as never, height: '60px' }} />
                    <p className="text-[10px] font-mono text-red-400 mt-1">&minus;{l.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p className="text-gray-500">Avg Gain</p>
                  <p className="text-green-400 font-mono font-bold">{avgGain.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Loss</p>
                  <p className="text-red-400 font-mono font-bold">{avgLoss.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-gray-500">RS</p>
                  <p className="text-amber-400 font-mono font-bold">{rs.toFixed(3)}</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-gray-500 text-xs">RSI = 100 &minus; (100 / (1 + {rs.toFixed(3)}))</p>
                <p className={`text-3xl font-extrabold mt-1 ${rsiCalc > 70 ? 'text-red-400' : rsiCalc < 30 ? 'text-green-400' : 'text-amber-400'}`}>{rsiCalc.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rsiCalc > 70 ? 'Strong upward momentum' : rsiCalc < 30 ? 'Strong downward momentum' : 'Neutral zone'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05: The Universal Pattern === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Universal Pattern</p>
          <h2 className="text-2xl font-extrabold mb-2">Every Oscillator Follows This Blueprint</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Despite looking different on your chart, every oscillator follows the same three-step process:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-amber-400 mb-2">Step 1: Gather Past Data</p>
              <p className="text-sm text-gray-400">Take N candles of historical price data (closes, highs, lows). The lookback period (N) is the only input you control. RSI uses 14 candles. MACD uses 12 and 26. Stochastic uses 14.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-sky-400 mb-2">Step 2: Run the Formula</p>
              <p className="text-sm text-gray-400">Apply a mathematical formula to that data. RSI divides gains by losses. MACD subtracts slow from fast. Stochastic maps position within range. The formula is the &ldquo;personality&rdquo; of the oscillator &mdash; it determines WHAT aspect of price it measures.</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <p className="text-sm font-extrabold text-green-400 mb-2">Step 3: Output a Bounded Value</p>
              <p className="text-sm text-gray-400">Produce a number that oscillates between boundaries (0&ndash;100 for RSI/Stochastic, around zero for MACD/CCI). This bounded output is what you see on your chart. It updates every candle as new data enters and old data exits the lookback window.</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why This Matters</p>
            <p className="text-sm text-gray-400">Once you see this pattern, every new oscillator you encounter becomes instantly understandable. Just ask: &ldquo;What data does it use? What formula does it apply? What do the output levels mean?&rdquo; Three questions. Any oscillator. Instant transparency.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: The Period Setting Explained === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Settings Demystified</p>
          <h2 className="text-2xl font-extrabold mb-2">What Changing the Period Actually Does</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When you change RSI from 14 to 7, you&apos;re telling the formula: &ldquo;Only look at the last 7 candles instead of 14.&rdquo; Here is the exact effect:</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
                <p className="font-extrabold text-sky-400 mb-1">Short (5&ndash;9)</p>
                <p className="text-xs text-gray-400">Each candle = 11&ndash;20% of the total. One big candle moves RSI dramatically. Extremely noisy.</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <p className="font-extrabold text-amber-400 mb-1">Default (14)</p>
                <p className="text-xs text-gray-400">Each candle = 7% of the total. Balanced between responsiveness and stability. Industry standard for a reason.</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                <p className="font-extrabold text-green-400 mb-1">Long (21&ndash;50)</p>
                <p className="text-xs text-gray-400">Each candle = 2&ndash;5% of the total. Very smooth. Barely reacts to individual candles. Shows only the broad trend.</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">There is no &ldquo;best&rdquo; setting. There is only the trade-off: more speed = more noise. More smoothness = more lag. Pick based on YOUR strategy, not a YouTube video.</p>
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

      {/* === S08: The Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-2">One-Line Summary for Every Oscillator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Memorise these. When you see the value on your chart, this is exactly what it means:</p>
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-amber-400">RSI 72</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Over the last 14 candles, gains have been ~2.5&times; larger than losses.&rdquo;</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-sky-400">MACD +5.2</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;The 12 EMA is currently 5.2 points above the 26 EMA.&rdquo;</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-green-400">Stoch 88</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;The current close is 88% of the way between the recent low and high.&rdquo;</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-purple-400">CCI +145</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;Price is 1.45 standard deviations above its typical price average.&rdquo;</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm"><strong className="text-red-400">%R &minus;15</strong> <span className="text-gray-500">=</span> <span className="text-gray-400">&ldquo;The close is 85% of the way up the recent range (same as Stoch 85).&rdquo;</span></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Oscillator Anatomy Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Do you truly know what the numbers mean?</p>

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
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You know what is under the hood. No more black boxes.' : gameScore >= 3 ? 'Getting there — review the formulas one more time.' : 'The hood is still closed. Re-read sections 01–03 and try the RSI calculator.'}</p>
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
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">⚙️</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">
                    Has successfully completed<br />
                    <strong className="text-white">Level 5: The Anatomy of an Oscillator</strong><br />
                    at ATLAS Academy by Interakktive
                  </p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Formula Engineer &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
