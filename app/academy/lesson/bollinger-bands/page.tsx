// app/academy/lesson/bollinger-bands/page.tsx
// ATLAS Academy — Lesson 2.6: Bollinger Bands & Volatility [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, Activity, BarChart3 } from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += prices[i - j];
    return sum / period;
  });
}

// Bollinger Bands: Middle = SMA(20), Upper = SMA + 2*StdDev, Lower = SMA - 2*StdDev
function calcBB(prices: number[], period: number = 20, mult: number = 2): {
  middle: (number | null)[];
  upper: (number | null)[];
  lower: (number | null)[];
  bandwidth: (number | null)[];
} {
  const middle = calcSMA(prices, period);
  const upper: (number | null)[] = Array(prices.length).fill(null);
  const lower: (number | null)[] = Array(prices.length).fill(null);
  const bandwidth: (number | null)[] = Array(prices.length).fill(null);

  for (let i = period - 1; i < prices.length; i++) {
    const avg = middle[i];
    if (avg === null) continue;
    let sumSq = 0;
    for (let j = 0; j < period; j++) {
      sumSq += (prices[i - j] - avg) ** 2;
    }
    const stdDev = Math.sqrt(sumSq / period);
    upper[i] = avg + mult * stdDev;
    lower[i] = avg - mult * stdDev;
    bandwidth[i] = ((upper[i]! - lower[i]!) / avg) * 100;
  }

  return { middle, upper, lower, bandwidth };
}

// ============================================================
// PRICE DATA GENERATORS
// ============================================================
function generateBBPrices(): number[] {
  const rand = seededRandom(42);
  const p: number[] = [100];
  for (let i = 1; i < 250; i++) {
    const noise = (rand() - 0.5) * 3;
    // Create phases of high and low volatility
    let vol = 1;
    if (i > 60 && i < 100) vol = 0.3; // squeeze (low volatility)
    if (i > 100 && i < 140) vol = 2.5; // expansion (high volatility after squeeze)
    if (i > 170 && i < 200) vol = 0.4; // another squeeze
    if (i > 200) vol = 2; // another expansion
    const trend = Math.sin(i * 0.025) * 0.3;
    p.push(p[i - 1] + noise * vol + trend);
  }
  return p;
}

const mainPrices = generateBBPrices();

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const cRef = useRef<HTMLCanvasElement>(null); const dRef = useRef<HTMLDivElement>(null);
  const inView = useInView(dRef, { amount: 0.1 }); const fRef = useRef(0);
  useEffect(() => {
    const c = cRef.current, d = dRef.current; if (!c || !d) return;
    const ctx = c.getContext('2d'); if (!ctx) return; let id: number;
    const rs = () => { const r = d.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; };
    rs(); window.addEventListener('resize', rs);
    const loop = () => { if (inView) { ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, c.width, c.height); drawFn(ctx, c.width / 2, c.height / 2, fRef.current); } fRef.current++; id = requestAnimationFrame(loop); };
    loop(); return () => { cancelAnimationFrame(id); window.removeEventListener('resize', rs); };
  }, [inView, drawFn]);
  return <div ref={dRef} className="w-full rounded-2xl overflow-hidden" style={{ height, background: 'rgba(0,0,0,0.3)' }}><canvas ref={cRef} /></div>;
}

// ============================================================
// ANIMATED CONCEPT: Highway Guardrails
// ============================================================
function GuardrailAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const t = f * 0.015;
    const midY = H / 2;

    // Road surface
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, midY - 25, W, 50);

    // Road centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([8, 12]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '600 7px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.textAlign = 'center';
    ctx.fillText('20 SMA (Middle Line)', W / 2, midY + 4);

    // Guardrails that widen and narrow
    for (let x = 0; x < W; x += 2) {
      const progress = x / W;
      // Guardrail width changes: narrow (squeeze) → wide (expansion)
      let width = 20;
      if (progress > 0.2 && progress < 0.45) width = 8 + Math.sin((progress - 0.2) * 12) * 3; // squeeze
      if (progress > 0.45 && progress < 0.7) width = 8 + (progress - 0.45) * 120; // expansion
      if (progress > 0.7) width = 35 - (progress - 0.7) * 30; // narrowing again

      // Upper guardrail
      ctx.fillStyle = 'rgba(239,68,68,0.25)';
      ctx.fillRect(x, midY - width - 25, 2, 3);
      // Lower guardrail
      ctx.fillStyle = 'rgba(34,197,94,0.25)';
      ctx.fillRect(x, midY + width + 22, 2, 3);
    }

    // Labels
    ctx.font = '600 8px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.fillText('Upper Band (guardrail)', 8, 14);
    ctx.fillStyle = 'rgba(34,197,94,0.5)'; ctx.fillText('Lower Band (guardrail)', 8, H - 8);

    // Car (price) driving and bouncing off guardrails
    const carX = ((f * 0.6) % W);
    const progress = carX / W;
    let guardrailW = 20;
    if (progress > 0.2 && progress < 0.45) guardrailW = 8;
    if (progress > 0.45 && progress < 0.7) guardrailW = 8 + (progress - 0.45) * 120;
    if (progress > 0.7) guardrailW = 35 - (progress - 0.7) * 30;

    const carY = midY + Math.sin(t * 3 + carX * 0.03) * guardrailW * 0.7;
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🚗', carX, carY + 4);

    // Phase labels
    ctx.font = '700 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,158,11,0.4)';
    ctx.fillText('SQUEEZE', W * 0.33, H - 18);
    ctx.fillText('(calm)', W * 0.33, H - 8);
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillText('EXPANSION', W * 0.6, H - 18);
    ctx.fillText('(volatile!)', W * 0.6, H - 8);
  }, []);
  return <AnimScene drawFn={draw} height={160} />;
}

// ============================================================
// BB CHART RENDERER
// ============================================================
function renderBBChart(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  prices: number[], bb: ReturnType<typeof calcBB>,
  opts?: { highlightSqueeze?: boolean; highlightTouch?: boolean }
) {
  const pad = { t: 10, b: 10, l: 8, r: 8 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  let allVals = [...prices];
  bb.upper.forEach(v => { if (v !== null) allVals.push(v); });
  bb.lower.forEach(v => { if (v !== null) allVals.push(v); });
  const min = Math.min(...allVals) - 1, max = Math.max(...allVals) + 1;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * cw;
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) { const y = pad.t + (i / 4) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Band fill
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < prices.length; i++) {
    if (bb.upper[i] === null) continue;
    const x = toX(i);
    if (!started) { ctx.moveTo(x, toY(bb.upper[i]!)); started = true; }
    else ctx.lineTo(x, toY(bb.upper[i]!));
  }
  for (let i = prices.length - 1; i >= 0; i--) {
    if (bb.lower[i] === null) continue;
    ctx.lineTo(toX(i), toY(bb.lower[i]!));
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(14,165,233,0.06)';
  ctx.fill();

  // Squeeze highlighting
  if (opts?.highlightSqueeze) {
    for (let i = 1; i < prices.length; i++) {
      const bw = bb.bandwidth[i], pbw = bb.bandwidth[i - 1];
      if (bw !== null && pbw !== null && bw < 3) {
        ctx.fillStyle = 'rgba(245,158,11,0.08)';
        ctx.fillRect(toX(i) - 1, pad.t, 3, ch);
      }
    }
  }

  // Upper band
  ctx.beginPath(); started = false;
  bb.upper.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
  ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1; ctx.stroke();

  // Lower band
  ctx.beginPath(); started = false;
  bb.lower.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
  ctx.strokeStyle = 'rgba(34,197,94,0.4)'; ctx.lineWidth = 1; ctx.stroke();

  // Middle band (SMA)
  ctx.beginPath(); started = false;
  bb.middle.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
  ctx.strokeStyle = 'rgba(14,165,233,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Candles
  const bw = Math.max(1, (cw / prices.length) * 0.4);
  for (let i = 1; i < prices.length; i++) {
    const o = prices[i - 1], c = prices[i];
    const bull = c >= o; const x = toX(i);
    ctx.fillStyle = bull ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
    ctx.fillRect(x - bw / 2, toY(Math.max(o, c)), bw, Math.max(toY(Math.min(o, c)) - toY(Math.max(o, c)), 0.5));
  }

  // Touch highlights
  if (opts?.highlightTouch) {
    for (let i = 1; i < prices.length; i++) {
      if (bb.upper[i] === null || bb.lower[i] === null) continue;
      if (prices[i] >= bb.upper[i]! - 0.5) {
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.beginPath(); ctx.arc(toX(i), toY(prices[i]), 3, 0, Math.PI * 2); ctx.fill();
      }
      if (prices[i] <= bb.lower[i]! + 0.5) {
        ctx.fillStyle = 'rgba(34,197,94,0.5)';
        ctx.beginPath(); ctx.arc(toX(i), toY(prices[i]), 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // Labels
  ctx.font = '600 7px sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.fillText('Upper', pad.l + 2, pad.t + 10);
  ctx.fillStyle = 'rgba(14,165,233,0.5)'; ctx.fillText('SMA 20', pad.l + 2, toY(bb.middle[prices.length - 1] || 0) - 3);
  ctx.fillStyle = 'rgba(34,197,94,0.4)'; ctx.fillText('Lower', pad.l + 2, H - pad.b - 3);
}

// ============================================================
// INTERACTIVE BB CHART
// ============================================================
function BBChartDemo() {
  const [showSqueeze, setShowSqueeze] = useState(true);
  const [showTouches, setShowTouches] = useState(true);
  const prices = mainPrices;
  const bb = useMemo(() => calcBB(prices), [prices]);

  const drawBB = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderBBChart(ctx, W, H, prices, bb, { highlightSqueeze: showSqueeze, highlightTouch: showTouches });
  }, [prices, bb, showSqueeze, showTouches]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex gap-2">
        <button onClick={() => setShowSqueeze(!showSqueeze)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${showSqueeze ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
          {showSqueeze ? '✓ ' : ''}Squeeze Zones
        </button>
        <button onClick={() => setShowTouches(!showTouches)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${showTouches ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
          {showTouches ? '✓ ' : ''}Band Touches
        </button>
      </div>
      <AnimScene drawFn={drawBB} height={300} />
      <div className="p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-primary-400">Blue line</strong> = 20 SMA (middle). <strong className="text-red-400">Red line</strong> = Upper band. <strong className="text-green-400">Green line</strong> = Lower band. The shaded area between the bands shows volatility — wide = volatile, narrow = calm.
          {showSqueeze && ' Amber highlighted zones show squeezes — periods where bands narrow (low volatility). Breakouts often follow squeezes.'}
          {showTouches && ' Dots show where price touches the bands — potential reversal points.'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SIGNAL GAME
// ============================================================
function BBSignalGame() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const scenarios = useMemo(() => {
    function makeData(seed: number, phases: { len: number; bias: number; vol: number }[]): number[] {
      const rand = seededRandom(seed);
      const p: number[] = [100];
      for (const phase of phases) {
        for (let j = 0; j < phase.len; j++) {
          const noise = (rand() - 0.5) * 2 * phase.vol;
          p.push(p[p.length - 1] + noise + phase.bias);
        }
      }
      return p.slice(0, 120);
    }

    return [
      {
        // Squeeze: low vol for most of chart, then expansion
        prices: makeData(111, [{ len: 30, bias: 0, vol: 1 }, { len: 60, bias: 0, vol: 0.25 }, { len: 30, bias: 0.4, vol: 2.5 }]),
        correct: 'squeeze',
        explain: 'The bands are extremely narrow — a squeeze. Low volatility is compressing like a spring. A big breakout move is likely coming. Watch the direction of the breakout.'
      },
      {
        // Upper touch in RANGE: sideways market, price rallies to upper band at the end
        prices: makeData(222, [{ len: 50, bias: 0, vol: 1.2 }, { len: 40, bias: -0.1, vol: 1 }, { len: 30, bias: 0.35, vol: 1.5 }]),
        correct: 'upper_resistance',
        explain: 'Price touched the upper band in a RANGING market — it\'s stretched to the upside. A pullback toward the middle band is likely. This is different from a band walk because the market isn\'t trending.'
      },
      {
        // Lower touch in RANGE: sideways then drops to lower band
        prices: makeData(333, [{ len: 50, bias: 0, vol: 1.2 }, { len: 30, bias: 0.1, vol: 1 }, { len: 40, bias: -0.35, vol: 1.5 }]),
        correct: 'lower_support',
        explain: 'Price touched the lower band — it\'s stretched to the downside. In a ranging market, a bounce back toward the middle band is possible. Look for bullish candle patterns.'
      },
      {
        // Band walk: strong sustained uptrend, price hugs upper band
        prices: makeData(444, [{ len: 20, bias: 0.05, vol: 0.8 }, { len: 100, bias: 0.45, vol: 0.7 }]),
        correct: 'band_walk',
        explain: 'Price is "walking" along the upper band — continuously touching it. This is a STRONG trend signal. Don\'t sell just because price is at the upper band — in a trending market, that\'s where it belongs!'
      },
      {
        // Mean reversion: strong rally then pulling back toward middle
        prices: makeData(555, [{ len: 60, bias: 0.35, vol: 1.3 }, { len: 60, bias: -0.2, vol: 1.5 }]),
        correct: 'mean_reversion',
        explain: 'Price moved far from the middle band and is now pulling back toward it. This is mean reversion — price acts like a rubber band, always tending to snap back to the average.'
      },
    ];
  }, []);

  const sc = scenarios[round];
  const bb = useMemo(() => calcBB(sc.prices), [sc.prices]);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderBBChart(ctx, W, H, sc.prices, bb, { highlightSqueeze: true, highlightTouch: true });
  }, [sc.prices, bb]);

  const options = [
    { id: 'squeeze', label: '🔸 Squeeze (Breakout Coming)' },
    { id: 'upper_resistance', label: '🔴 Upper Band Touch' },
    { id: 'lower_support', label: '🟢 Lower Band Touch' },
    { id: 'band_walk', label: '📈 Band Walk (Strong Trend)' },
    { id: 'mean_reversion', label: '🔄 Mean Reversion' },
  ];

  const handleAnswer = (ans: string) => { if (answer) return; setAnswer(ans); if (ans === sc.correct) setScore(s => s + 1); };
  const nextRound = () => { if (round < scenarios.length - 1) { setRound(r => r + 1); setAnswer(null); } else setDone(true); };

  if (done) return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <p className="text-3xl mb-2">{score >= 4 ? '🎯' : score >= 3 ? '👍' : '📚'}</p>
      <p className="text-lg font-bold">{score}/{scenarios.length}</p>
      <p className="text-sm text-gray-400 mt-1">{score >= 4 ? 'Excellent BB reading!' : 'Keep practising — Bollinger Bands reveal a lot.'}</p>
      <button onClick={() => { setRound(0); setScore(0); setDone(false); setAnswer(null); }} className="mt-3 px-4 py-2 rounded-lg glass text-xs font-semibold text-amber-400">Try Again</button>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Round {round + 1}/{scenarios.length}</span>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>
      <AnimScene drawFn={drawGame} height={260} />
      <div className="p-4">
        <p className="text-sm font-semibold mb-3 text-center">What are the Bollinger Bands telling you?</p>
        <div className="grid grid-cols-2 gap-2">
          {options.map(opt => {
            let cls = 'p-2.5 rounded-xl text-[11px] font-semibold text-center cursor-pointer transition-all border active:scale-95 ';
            if (!answer) cls += 'glass hover:bg-white/[0.06]';
            else if (opt.id === sc.correct) cls += 'bg-green-500/15 border-green-500/30 text-green-400';
            else if (opt.id === answer) cls += 'bg-red-500/15 border-red-500/30 text-red-400';
            else cls += 'bg-white/[0.02] border-white/[0.03] opacity-30';
            return <div key={opt.id} className={cls} onClick={() => handleAnswer(opt.id)}>{opt.label}</div>;
          })}
        </div>
        {answer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">{answer === sc.correct ? '✅ Correct! ' : '❌ Not quite. '}{sc.explain}</p>
            <button onClick={nextRound} className="w-full mt-3 py-2.5 rounded-xl glass text-xs font-semibold text-amber-400 active:scale-95">{round >= scenarios.length - 1 ? 'See Results' : 'Next Round →'}</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "Bollinger Bands consist of:", opts: ["Three horizontal lines", "A middle SMA line with upper and lower bands at 2 standard deviations", "Two moving averages that cross", "A single line that measures momentum"], correct: 1, explain: "Bollinger Bands = 20 SMA (middle) + upper band (SMA + 2 standard deviations) + lower band (SMA - 2 standard deviations). The bands expand and contract based on volatility." },
  { q: "When Bollinger Bands squeeze (become very narrow), it usually means:", opts: ["The market is dead and nothing will happen", "A big move (breakout) is likely coming — volatility is compressing like a spring", "You should sell everything", "The indicator is broken"], correct: 1, explain: "A squeeze = low volatility = calm before the storm. Markets cycle between low and high volatility. After a period of compression, an expansion (big move) almost always follows." },
  { q: "In simple terms, Bollinger Bands measure:", opts: ["The exact price of a stock", "How volatile (how much price swings) the market is right now", "Trading volume", "The number of traders online"], correct: 1, explain: "Bollinger Bands are a volatility indicator. Wide bands = high volatility (big price swings). Narrow bands = low volatility (calm market). They adjust automatically to market conditions." },
  { q: "Price touching the upper Bollinger Band means:", opts: ["Definitely sell — the price is too high", "Price is at the upper edge of recent volatility — could reverse OR continue in a strong trend", "The indicator is wrong", "Buy more immediately"], correct: 1, explain: "Touching the upper band doesn't automatically mean sell. In strong trends, price can 'walk' along the upper band for weeks. It means price is stretched relative to recent average — but context matters." },
  { q: "What does the middle Bollinger Band represent?", opts: ["A random line", "The 20-period Simple Moving Average — the 'fair value' of price", "The highest price this month", "The volume average"], correct: 1, explain: "The middle band is a 20-period SMA. It represents the 'average' or 'fair value' of price. When price moves far from it, there's a tendency to snap back — this is mean reversion." },
  { q: "A 'Bollinger Band walk' occurs when:", opts: ["You go for a walk while trading", "Price continuously touches or hugs one band — indicating a very strong trend", "The bands stop moving", "Price crosses the middle line"], correct: 1, explain: "A band walk means price is so strong in one direction that it keeps pressing against the upper (or lower) band. This is a trend continuation signal — NOT a reversal signal." },
  { q: "Mean reversion in the context of Bollinger Bands means:", opts: ["The bands disappear", "Price tends to return to the middle band (the average) after moving to an extreme", "The market always goes up", "You should use the mean setting in your platform"], correct: 1, explain: "Mean reversion = price tends to pull back toward its average (the middle band) after moving too far away. The bands show you when price is 'too far' — and the middle band acts as a magnet." },
];

// ============================================================
// CONFETTI
// ============================================================
function GoldConfetti({ active }: { active: boolean }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = cRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const cols = ['#f59e0b', '#fbbf24', '#d946ef', '#0ea5e9', '#22c55e', '#e879f9'];
    const pcs = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 10 + 4, h: Math.random() * 6 + 2, color: cols[Math.floor(Math.random() * cols.length)], vy: Math.random() * 3 + 2, vx: (Math.random() - .5) * 2.5, rot: Math.random() * 360, rv: Math.random() * 8 - 4, a: 1 }));
    let f = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pcs.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (f > 140) p.a -= .008; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); f++; if (f < 280) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={cRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function BollingerBandsLesson() {
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setScrollPct(Math.min(100, Math.round((window.scrollY / t) * 100))); };
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  const handleAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u);
    if (u.every(a => a !== null)) {
      const c = u.filter((a, i) => a === quizQuestions[i].correct).length;
      const p = Math.round((c / quizQuestions.length) * 100);
      setScore(p); setQuizDone(true);
      if (p >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 6000); }, 800);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen">
      <GoldConfetti active={showConfetti} />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"><Crown className="w-3 h-3" /> PRO</span>
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} /></div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO — Level 2: Technical Analysis</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Bollinger Bands &<br /><span className="bg-gradient-to-r from-primary-400 via-accent-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Volatility</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The indicator that shows you when the market is about to explode. Squeezes, expansions, and the art of trading volatility.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Guardrail Animation</span>
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Interactive BB Chart</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Signal Game</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 7 Questions</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 00: Layman Analogy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">First — Why This Matters</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-4">A Highway With Smart Guardrails</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">Imagine driving on a highway where the guardrails automatically <strong className="text-white">widen on dangerous curves and narrow on straight roads</strong>. On a calm straight road (low volatility), the guardrails are close together — there&apos;s not much room to swerve. On a wild mountain pass (high volatility), they spread wide apart.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-4">Bollinger Bands work exactly like these smart guardrails. They wrap around the price and <strong className="text-white">automatically adjust to how wild the market is behaving</strong>. When the bands squeeze tight, the market is calm — but a big move is brewing. When they expand wide, the market is volatile and active.</motion.p>
          <motion.div variants={fadeUp} className="mb-4"><GuardrailAnimation /></motion.div>
          <motion.div variants={fadeUp} className="p-5 glass-card rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-red-500" />
            <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Real scenario:</strong> You&apos;re watching EUR/USD and the Bollinger Bands have been squeezing for 3 days — the narrowest they&apos;ve been in months. You don&apos;t know WHICH direction it will go, but you know a big move is coming. When price breaks above the upper band with momentum, you jump on the breakout. <strong className="text-white">200-pip move in 2 days — because you spotted the squeeze.</strong></p>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What Are Bollinger Bands */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Concept</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Three Lines That Read Volatility</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">Bollinger Bands were created by John Bollinger in the 1980s. They consist of <strong className="text-white">three lines wrapped around the price</strong>:</motion.p>
          <motion.div variants={fadeUp} className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Think of it like a body temperature range:</strong> Normal body temperature is 37°C (that&apos;s your middle band). The healthy range is 36°C to 38°C (that&apos;s your upper and lower bands). If temperature goes above 38°C, something&apos;s off — it&apos;s &quot;overbought&quot;. Below 36°C? Something&apos;s wrong the other way. Bollinger Bands do this for price.</p>
          </motion.div>
        </motion.div>

        {[
          { icon: '📏', title: 'Middle Band (The Average)', desc: 'A 20-period Simple Moving Average. This is the "normal" price — the centre of gravity. Think of it as the average temperature. Price will always tend to come back to this line.', border: 'border-l-sky-500' },
          { icon: '🔴', title: 'Upper Band (The Hot Zone)', desc: 'The middle band PLUS 2 standard deviations. In plain English: the upper limit of "normal" price movement. When price touches this, it\'s running hot — like a fever. It might come back down, or it might mean something powerful is happening.', border: 'border-l-red-500' },
          { icon: '🟢', title: 'Lower Band (The Cold Zone)', desc: 'The middle band MINUS 2 standard deviations. The lower limit of "normal". When price touches this, it\'s running cold — potentially oversold. Could bounce, or could signal real weakness.', border: 'border-l-green-500' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">{item.icon}</span><h4 className="font-bold text-[15px]">{item.title}</h4></div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 2: Interactive Chart */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — See It Live</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Interactive Bollinger Bands</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Watch how the bands expand during volatile periods and squeeze during calm ones. Toggle squeeze zones and band touches to see key moments.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BBChartDemo />
        </motion.div>
      </section>

      {/* Section 3: The Squeeze */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — The Squeeze</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">The Calm Before the Storm</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">When the bands get really tight — that&apos;s a squeeze. And a squeeze is <strong className="text-white">the most exciting signal Bollinger Bands give you</strong>.</motion.p>
        </motion.div>

        {[
          { icon: '🔸', title: 'What Is a Squeeze?', desc: 'When the upper and lower bands narrow to their tightest point in weeks or months. The market is quiet — barely moving. Think of it like pulling back a slingshot. The further you pull, the harder it fires.', col: 'text-amber-400' },
          { icon: '💥', title: 'What Happens After?', desc: 'A big move. Almost always. Volatility cycles between low and high. After every period of calm, an explosion follows. The squeeze doesn\'t tell you WHICH direction — but it tells you WHEN to pay attention.', col: 'text-red-400' },
          { icon: '🎯', title: 'How to Trade It', desc: 'Wait for the squeeze. When price breaks out of the bands with momentum (a strong candle closing outside the band), enter in that direction. The compressed energy is now releasing. Place your stop on the opposite side of the bands.', col: 'text-green-400' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 glass-card rounded-2xl mb-3 hover:translate-x-1 transition-all">
            <span className={`text-xl flex-shrink-0 ${item.col}`}>{item.icon}</span>
            <div><h4 className={`font-bold text-[15px] mb-1 ${item.col}`}>{item.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
          </motion.div>
        ))}
      </section>

      {/* Section 4: Band Walk & Mean Reversion */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — Two Key Concepts</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-6">Band Walk vs Mean Reversion</motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-5 glass-card rounded-2xl">
            <h4 className="font-bold text-[15px] text-amber-400 mb-2">📈 Band Walk</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">When the trend is <strong className="text-white">very strong</strong>, price keeps touching or hugging the upper (or lower) band. It doesn&apos;t bounce back — it stays pressed against the guardrail.</p>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-xs text-gray-400">💡 <strong className="text-amber-400">Key insight:</strong> Don&apos;t sell just because price touches the upper band! In a band walk, touching the upper band is a sign of STRENGTH, not exhaustion. Only fade the band in a ranging market.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="p-5 glass-card rounded-2xl">
            <h4 className="font-bold text-[15px] text-primary-400 mb-2">🔄 Mean Reversion</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">In a <strong className="text-white">ranging market</strong>, price tends to bounce between the bands and always come back to the middle. The middle band acts like a rubber band — price stretches away and snaps back.</p>
            <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
              <p className="text-xs text-gray-400">💡 <strong className="text-primary-400">Key insight:</strong> In a range, buy at the lower band, sell at the upper band, and use the middle band as your first target. Simple, effective, and reliable — but ONLY in ranges, not trends.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Signal Game */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Read the Bands</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Signal Identification Game</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">5 charts. Identify what the Bollinger Bands are telling you: squeeze, upper/lower touch, band walk, or mean reversion.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BBSignalGame />
        </motion.div>
      </section>

      {/* Section 6: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Bollinger Bands Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions on construction, squeezes, band walks, and practical application.</motion.p>
        </motion.div>
        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: qi * 0.06 }} className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
              <p className="font-semibold text-[15px] leading-relaxed mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const ans = quizAnswers[qi] !== null; const isC = oi === q.correct; const isS = quizAnswers[qi] === oi;
                  let c = 'p-3 rounded-xl text-sm cursor-pointer transition-all border ';
                  if (!ans) c += 'bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.98]';
                  else if (isC) c += 'bg-green-500/10 border-green-500/30 text-green-400';
                  else if (isS) c += 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60';
                  else c += 'bg-white/[0.02] border-white/[0.03] opacity-40 pointer-events-none';
                  return <div key={oi} className={c} onClick={() => handleAnswer(qi, oi)}>{opt}</div>;
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-amber-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. You can read volatility.' : score >= 66 ? 'Solid — you understand Bollinger Bands.' : 'Review the squeeze and band walk sections.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(14,165,233,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">📊</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.6: Bollinger Bands & Volatility</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-accent-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Volatility Reader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.7 — Volume Analysis</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
