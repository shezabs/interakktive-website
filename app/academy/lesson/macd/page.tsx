// app/academy/lesson/macd/page.tsx
// ATLAS Academy — Lesson 2.5: MACD — Momentum Master [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, Activity, BarChart3 } from 'lucide-react';

// ============================================================
// PRICE DATA & MACD CALCULATION
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function calcEMA(prices: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const ema: (number | null)[] = Array(prices.length).fill(null);
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) sum += prices[i];
  if (prices.length < period) return ema;
  ema[period - 1] = sum / period;
  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + (ema[i - 1] as number) * (1 - k);
  }
  return ema;
}

// MACD = EMA(12) - EMA(26), Signal = EMA(9) of MACD, Histogram = MACD - Signal
function calcMACD(prices: number[]): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
  ema12: (number | null)[];
  ema26: (number | null)[];
} {
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);

  // MACD line = EMA12 - EMA26
  const macd: (number | null)[] = prices.map((_, i) => {
    if (ema12[i] === null || ema26[i] === null) return null;
    return (ema12[i] as number) - (ema26[i] as number);
  });

  // Signal line = EMA(9) of MACD values (only non-null ones)
  const macdValues: number[] = [];
  const macdIndices: number[] = [];
  macd.forEach((v, i) => { if (v !== null) { macdValues.push(v); macdIndices.push(i); } });

  const signal: (number | null)[] = Array(prices.length).fill(null);
  if (macdValues.length >= 9) {
    const sigK = 2 / (9 + 1);
    let sigSum = 0;
    for (let i = 0; i < 9; i++) sigSum += macdValues[i];
    let sigEma = sigSum / 9;
    signal[macdIndices[8]] = sigEma;
    for (let i = 9; i < macdValues.length; i++) {
      sigEma = macdValues[i] * sigK + sigEma * (1 - sigK);
      signal[macdIndices[i]] = sigEma;
    }
  }

  // Histogram = MACD - Signal
  const histogram: (number | null)[] = prices.map((_, i) => {
    if (macd[i] === null || signal[i] === null) return null;
    return (macd[i] as number) - (signal[i] as number);
  });

  return { macd, signal, histogram, ema12, ema26 };
}

function generatePrices(seed: number, count: number, phases: { len: number; bias: number }[]): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [100];
  for (const phase of phases) {
    for (let j = 0; j < phase.len; j++) {
      const noise = (rand() - 0.5) * 3;
      p.push(p[p.length - 1] + noise + phase.bias);
    }
  }
  return p.slice(0, count);
}

const mainPrices = generatePrices(42, 250, [
  { len: 40, bias: 0.2 }, { len: 50, bias: -0.3 }, { len: 60, bias: 0.35 },
  { len: 50, bias: -0.2 }, { len: 50, bias: 0.25 },
]);

// ============================================================
// CHART + MACD RENDERER
// ============================================================
function renderPriceAndMACD(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  prices: number[], macdData: ReturnType<typeof calcMACD>,
  opts?: { showEMAs?: boolean; highlightCross?: boolean }
) {
  const priceH = H * 0.5;
  const gap = 6;
  const macdH = H - priceH - gap;
  const pad = { l: 8, r: 8 };

  // === PRICE CHART (top) ===
  const pMin = Math.min(...prices) - 1, pMax = Math.max(...prices) + 1;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * (W - pad.l - pad.r);
  const toPY = (v: number) => 6 + (1 - (v - pMin) / (pMax - pMin)) * (priceH - 12);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { const y = 6 + (i / 3) * (priceH - 12); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Candles
  const bw = Math.max(1, ((W - pad.l - pad.r) / prices.length) * 0.4);
  for (let i = 1; i < prices.length; i++) {
    const o = prices[i - 1], c = prices[i];
    const hi = Math.max(o, c) + Math.abs(c - o) * 0.2;
    const lo = Math.min(o, c) - Math.abs(c - o) * 0.2;
    const bull = c >= o; const x = toX(i);
    ctx.strokeStyle = bull ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(x, toPY(hi)); ctx.lineTo(x, toPY(lo)); ctx.stroke();
    ctx.fillStyle = bull ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
    ctx.fillRect(x - bw / 2, toPY(Math.max(o, c)), bw, Math.max(toPY(Math.min(o, c)) - toPY(Math.max(o, c)), 0.5));
  }

  // EMA overlays on price chart
  if (opts?.showEMAs) {
    [{ data: macdData.ema12, color: '#0ea5e9', label: '12 EMA' }, { data: macdData.ema26, color: '#f59e0b', label: '26 EMA' }].forEach(ema => {
      ctx.beginPath(); let started = false;
      ema.data.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toPY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
      ctx.strokeStyle = ema.color; ctx.lineWidth = 1.2; ctx.stroke();
    });
  }

  // === MACD PANEL (bottom) ===
  const macdTop = priceH + gap;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(pad.l, macdTop, W - pad.l - pad.r, macdH);

  // Collect all MACD values for scaling
  const allVals: number[] = [];
  macdData.macd.forEach(v => { if (v !== null) allVals.push(v); });
  macdData.signal.forEach(v => { if (v !== null) allVals.push(v); });
  macdData.histogram.forEach(v => { if (v !== null) allVals.push(v); });
  if (allVals.length === 0) return;

  const mMax = Math.max(...allVals.map(Math.abs)) * 1.2;
  const toMY = (v: number) => macdTop + macdH / 2 - (v / mMax) * (macdH / 2 - 4);

  // Zero line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, toMY(0)); ctx.lineTo(W - pad.r, toMY(0)); ctx.stroke();

  // Histogram bars
  const hbw = Math.max(1.5, ((W - pad.l - pad.r) / prices.length) * 0.6);
  macdData.histogram.forEach((v, i) => {
    if (v === null) return;
    const x = toX(i);
    const zero = toMY(0);
    const y = toMY(v);
    // Color: green if histogram growing, red if shrinking
    const prev = i > 0 ? macdData.histogram[i - 1] : null;
    const growing = prev !== null ? Math.abs(v) > Math.abs(prev) : v > 0;
    if (v >= 0) {
      ctx.fillStyle = growing ? 'rgba(34,197,94,0.6)' : 'rgba(34,197,94,0.3)';
    } else {
      ctx.fillStyle = growing ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.3)';
    }
    ctx.fillRect(x - hbw / 2, Math.min(zero, y), hbw, Math.abs(y - zero));
  });

  // MACD line
  ctx.beginPath(); let started = false;
  macdData.macd.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toMY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
  ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 1.5; ctx.stroke();

  // Signal line
  ctx.beginPath(); started = false;
  macdData.signal.forEach((v, i) => { if (v === null) return; const x = toX(i), y = toMY(v); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.2; ctx.stroke();

  // Crossover dots
  if (opts?.highlightCross) {
    for (let i = 1; i < prices.length; i++) {
      const pm = macdData.macd[i - 1], cm = macdData.macd[i];
      const ps = macdData.signal[i - 1], cs = macdData.signal[i];
      if (pm === null || cm === null || ps === null || cs === null) continue;
      if (pm < ps && cm >= cs) {
        // Bullish crossover
        ctx.fillStyle = 'rgba(34,197,94,0.9)'; ctx.beginPath(); ctx.arc(toX(i), toMY(cm), 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(34,197,94,0.12)'; ctx.beginPath(); ctx.arc(toX(i), toMY(cm), 12, 0, Math.PI * 2); ctx.fill();
      }
      if (pm > ps && cm <= cs) {
        // Bearish crossover
        ctx.fillStyle = 'rgba(239,68,68,0.9)'; ctx.beginPath(); ctx.arc(toX(i), toMY(cm), 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(239,68,68,0.12)'; ctx.beginPath(); ctx.arc(toX(i), toMY(cm), 12, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // Labels
  ctx.font = '600 7px sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#0ea5e9'; ctx.fillText('MACD', pad.l + 4, macdTop + 10);
  ctx.fillStyle = '#f59e0b'; ctx.fillText('Signal', pad.l + 40, macdTop + 10);
}

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
// MACD CONSTRUCTION STEP-THROUGH
// ============================================================
function MACDConstructionDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Step 1: Calculate the 12-period EMA', desc: 'The fast EMA. It tracks short-term price momentum closely. This is the "fast" component of MACD.', formula: 'EMA(12) of closing prices', color: 'text-primary-400' },
    { title: 'Step 2: Calculate the 26-period EMA', desc: 'The slow EMA. It represents the longer-term trend. The gap between the fast and slow EMA is what MACD measures.', formula: 'EMA(26) of closing prices', color: 'text-amber-400' },
    { title: 'Step 3: MACD Line = Fast - Slow', desc: 'Subtract the 26 EMA from the 12 EMA. When the MACD line is positive, short-term momentum is above the long-term trend (bullish). When negative, it\'s bearish.', formula: 'MACD = EMA(12) - EMA(26)', color: 'text-primary-400' },
    { title: 'Step 4: Signal Line = EMA(9) of MACD', desc: 'A 9-period EMA of the MACD line itself. This smooths the MACD and creates the trigger for buy/sell signals. When MACD crosses the signal line, that\'s your entry.', formula: 'Signal = EMA(9) of MACD Line', color: 'text-amber-400' },
    { title: 'Step 5: Histogram = MACD - Signal', desc: 'The histogram visualises the gap between MACD and its signal line. Growing bars = momentum increasing. Shrinking bars = momentum fading. The histogram often signals turns BEFORE the lines cross.', formula: 'Histogram = MACD - Signal', color: 'text-green-400' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex justify-center gap-1.5 mb-4">
        {steps.map((_, i) => (
          <div key={i} className={`w-8 h-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-primary-500 to-amber-500' : 'bg-white/10'}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <h4 className={`font-bold text-[15px] mb-2 ${steps[step].color}`}>{steps[step].title}</h4>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">{steps[step].desc}</p>
          <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/15 text-center">
            <code className="text-sm font-mono text-primary-400">{steps[step].formula}</code>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-4 py-2 rounded-lg glass text-xs font-semibold text-gray-500 active:scale-95 disabled:opacity-30">← Back</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-amber-500 text-white font-bold text-xs active:scale-95 disabled:opacity-40">
          {step >= steps.length - 1 ? 'Complete ✓' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// INTERACTIVE MACD CHART
// ============================================================
function MACDChartDemo() {
  const [showEMAs, setShowEMAs] = useState(false);
  const [showCross, setShowCross] = useState(true);
  const prices = mainPrices;
  const macdData = useMemo(() => calcMACD(prices), [prices]);

  const drawMACD = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderPriceAndMACD(ctx, W, H, prices, macdData, { showEMAs, highlightCross: showCross });
  }, [prices, macdData, showEMAs, showCross]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex gap-2">
        <button onClick={() => setShowEMAs(!showEMAs)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${showEMAs ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
          {showEMAs ? '✓ ' : ''}Show 12/26 EMAs
        </button>
        <button onClick={() => setShowCross(!showCross)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${showCross ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
          {showCross ? '✓ ' : ''}Crossover Dots
        </button>
      </div>
      <AnimScene drawFn={drawMACD} height={340} />
      <div className="p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-primary-400">Blue line</strong> = MACD. <strong className="text-amber-400">Orange line</strong> = Signal.
          <strong className="text-green-400"> Green bars</strong> = bullish histogram. <strong className="text-red-400">Red bars</strong> = bearish histogram.
          {showCross && ' Green/red dots mark crossover signals.'}
          {showEMAs && ' The 12 EMA (blue) and 26 EMA (orange) are shown on the price chart — MACD is the distance between them.'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SIGNAL IDENTIFICATION GAME
// ============================================================
function MACDSignalGame() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const scenarios = useMemo(() => {
    function makeData(seed: number, phases: { len: number; bias: number }[]): number[] {
      return generatePrices(seed, 120, phases);
    }
    return [
      { prices: makeData(101, [{ len: 40, bias: -0.2 }, { len: 80, bias: 0.4 }]), correct: 'bullish_cross', explain: 'The MACD line crossed ABOVE the signal line — a bullish crossover. Momentum shifted from bearish to bullish. Buy signal.' },
      { prices: makeData(202, [{ len: 40, bias: 0.3 }, { len: 80, bias: -0.4 }]), correct: 'bearish_cross', explain: 'The MACD line crossed BELOW the signal line — a bearish crossover. Momentum shifted negative. Sell signal.' },
      { prices: makeData(303, [{ len: 50, bias: -0.3 }, { len: 70, bias: 0.35 }]), correct: 'zero_cross_bull', explain: 'The MACD line crossed above the zero line. This means the 12 EMA is now above the 26 EMA — the short-term trend has turned bullish.' },
      { prices: makeData(404, [{ len: 40, bias: 0.25 }, { len: 40, bias: -0.1 }, { len: 40, bias: 0.3 }]), correct: 'hist_growing', explain: 'The histogram bars are growing larger. Momentum is accelerating in the current direction. The trend is strengthening — not time to exit yet.' },
      { prices: makeData(505, [{ len: 60, bias: 0.35 }, { len: 60, bias: -0.3 }]), correct: 'hist_shrinking', explain: 'The histogram bars are shrinking. Momentum is fading — the trend is losing steam. An early warning that a reversal may be approaching.' },
    ];
  }, []);

  const sc = scenarios[round];
  const macdData = useMemo(() => calcMACD(sc.prices), [sc.prices]);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderPriceAndMACD(ctx, W, H, sc.prices, macdData, { highlightCross: true });
  }, [sc.prices, macdData]);

  const options = [
    { id: 'bullish_cross', label: '🟢 Bullish Crossover' },
    { id: 'bearish_cross', label: '🔴 Bearish Crossover' },
    { id: 'zero_cross_bull', label: '📈 Zero Line Cross (Bull)' },
    { id: 'hist_growing', label: '📊 Histogram Growing' },
    { id: 'hist_shrinking', label: '📉 Histogram Shrinking' },
  ];

  const handleAnswer = (ans: string) => {
    if (answer) return;
    setAnswer(ans);
    if (ans === sc.correct) setScore(s => s + 1);
  };

  const nextRound = () => {
    if (round < scenarios.length - 1) { setRound(r => r + 1); setAnswer(null); }
    else setDone(true);
  };

  if (done) return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <p className="text-3xl mb-2">{score >= 4 ? '🎯' : score >= 3 ? '👍' : '📚'}</p>
      <p className="text-lg font-bold">{score}/{scenarios.length}</p>
      <p className="text-sm text-gray-400 mt-1">{score >= 4 ? 'Excellent MACD reading!' : 'Keep practising — MACD signals take time to master.'}</p>
      <button onClick={() => { setRound(0); setScore(0); setDone(false); setAnswer(null); }} className="mt-3 px-4 py-2 rounded-lg glass text-xs font-semibold text-amber-400">Try Again</button>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Round {round + 1}/{scenarios.length}</span>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>
      <AnimScene drawFn={drawGame} height={280} />
      <div className="p-4">
        <p className="text-sm font-semibold mb-3 text-center">What is the MACD telling you?</p>
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
            <button onClick={nextRound} className="w-full mt-3 py-2.5 rounded-xl glass text-xs font-semibold text-amber-400 active:scale-95">
              {round >= scenarios.length - 1 ? 'See Results' : 'Next Round →'}
            </button>
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
  { q: "The MACD line is calculated as:", opts: ["The 50 SMA minus the 200 SMA", "The 12-period EMA minus the 26-period EMA", "The RSI divided by 2", "The closing price minus the opening price"], correct: 1, explain: "MACD = EMA(12) - EMA(26). It measures the distance between a fast and slow exponential moving average. When the fast EMA is above the slow one, MACD is positive (bullish)." },
  { q: "What is the signal line?", opts: ["A 200-period SMA", "A 9-period EMA of the MACD line itself", "The zero line", "A horizontal line at 50"], correct: 1, explain: "The signal line is a 9-period EMA applied to the MACD line. It smooths the MACD and acts as a trigger — when MACD crosses the signal line, that's your entry signal." },
  { q: "A bullish MACD crossover occurs when:", opts: ["MACD crosses below the signal line", "MACD crosses above the signal line", "The histogram reaches zero", "Price crosses above the 200 SMA"], correct: 1, explain: "Bullish crossover = MACD line crossing ABOVE the signal line. Short-term momentum is accelerating faster than the signal, suggesting upward price movement." },
  { q: "The MACD histogram shows:", opts: ["The closing price", "The distance between MACD and its signal line", "Volume", "The RSI value"], correct: 1, explain: "Histogram = MACD - Signal. When the histogram is growing, the gap between MACD and signal is widening (momentum increasing). When shrinking, momentum is fading." },
  { q: "When the MACD line crosses above the zero line, it means:", opts: ["Nothing significant", "The 12 EMA has crossed above the 26 EMA — short-term trend is bullish", "Price hit a new high", "You should sell immediately"], correct: 1, explain: "MACD above zero means EMA(12) > EMA(26) — the short-term average is above the long-term average. This confirms bullish momentum, similar to a moving average crossover." },
  { q: "Which MACD signal often appears EARLIEST?", opts: ["The crossover of MACD and signal lines", "The zero line crossover", "Histogram shrinking (momentum fade)", "None — they all appear at the same time"], correct: 2, explain: "The histogram starts shrinking BEFORE the lines actually cross. It's measuring the closing gap between MACD and signal. Smart traders watch the histogram for early warning signs." },
  { q: "The default MACD settings (12, 26, 9) mean:", opts: ["12 SMA, 26 SMA, 9 RSI", "Fast EMA = 12, Slow EMA = 26, Signal EMA = 9", "Buy at 12, sell at 26, stop at 9", "12 candles, 26 pips, 9 trades"], correct: 1, explain: "MACD(12, 26, 9): 12-period fast EMA, 26-period slow EMA, and 9-period signal line EMA. These are the defaults set by Gerald Appel, MACD's creator, and work well for most timeframes." },
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
export default function MACDLesson() {
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
            MACD —<br /><span className="bg-gradient-to-r from-primary-400 via-amber-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Momentum Master</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The indicator that shows you momentum shifts before they happen. Signal line crossovers, histogram analysis, and zero-line strategies.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Formula Builder</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Interactive Chart</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Histogram Analysis</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Signal Game</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What Is MACD */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Concept</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is MACD?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">MACD (Moving Average Convergence Divergence) measures the <strong className="text-white">relationship between two moving averages</strong>. When they converge (come together), momentum is fading. When they diverge (spread apart), momentum is accelerating.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Created by Gerald Appel in the late 1970s, MACD is one of the most popular and versatile indicators. It works as both a <strong className="text-white">trend follower AND a momentum oscillator</strong>.</motion.p>
        </motion.div>

        {[
          { icon: '📈', title: 'MACD Line (Blue)', desc: 'The difference between the 12 EMA and 26 EMA. Positive = fast EMA above slow EMA (bullish). Negative = fast below slow (bearish).', border: 'border-l-sky-500' },
          { icon: '📉', title: 'Signal Line (Orange)', desc: 'A 9-period EMA of the MACD line. Acts as the trigger. When MACD crosses above signal = buy. Below = sell.', border: 'border-l-amber-500' },
          { icon: '📊', title: 'Histogram (Bars)', desc: 'The visual gap between MACD and signal. Growing bars = momentum strengthening. Shrinking bars = momentum fading. The histogram is your EARLIEST warning signal.', border: 'border-l-green-500' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">{item.icon}</span><h4 className="font-bold text-[15px]">{item.title}</h4></div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 2: Construction */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — How It&apos;s Built</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">MACD Construction</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Five steps from raw price to the complete MACD indicator. Each component builds on the last.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MACDConstructionDemo />
        </motion.div>
      </section>

      {/* Section 3: Interactive Chart */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — See It Live</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Interactive MACD Chart</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Toggle the 12/26 EMAs on the price chart to see what MACD is measuring. Enable crossover dots to spot buy/sell signals.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MACDChartDemo />
        </motion.div>
      </section>

      {/* Section 4: Reading the Histogram */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — The Secret Weapon</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Reading the Histogram</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Most traders only watch the crossovers. But the histogram is the real edge — it shows momentum shifts <strong className="text-white">before</strong> the lines cross.</motion.p>
        </motion.div>

        {[
          { icon: '📊', title: 'Growing Green Bars', desc: 'MACD is pulling away from signal line. Bullish momentum is accelerating. Stay in your long position — the trend is strengthening.', col: 'text-green-400' },
          { icon: '📊', title: 'Shrinking Green Bars', desc: 'MACD is converging toward signal. Bullish momentum is FADING. The crossover hasn\'t happened yet, but the warning is clear. Tighten your stops.', col: 'text-green-400/60' },
          { icon: '📊', title: 'Growing Red Bars', desc: 'MACD is pulling away from signal to the downside. Bearish momentum is accelerating. Avoid buying. If you\'re short, hold.', col: 'text-red-400' },
          { icon: '📊', title: 'Shrinking Red Bars', desc: 'Bearish momentum is weakening. The selling is losing steam. A bullish crossover may be approaching. Start watching for buy signals.', col: 'text-red-400/60' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 glass-card rounded-2xl mb-3 hover:translate-x-1 transition-all">
            <span className={`text-xl flex-shrink-0 ${item.col}`}>{item.icon}</span>
            <div><h4 className={`font-bold text-[15px] mb-1 ${item.col}`}>{item.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p></div>
          </motion.div>
        ))}
      </section>

      {/* Section 5: Signal Game */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Read the MACD</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Signal Identification Game</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">5 rounds. Identify the dominant MACD signal: bullish crossover, bearish crossover, zero-line cross, histogram growing, or histogram shrinking.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MACDSignalGame />
        </motion.div>
      </section>

      {/* Section 6: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">MACD Mastery Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions on construction, signals, histogram reading, and practical application.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. MACD is now your weapon.' : score >= 66 ? 'Solid — you understand the momentum master.' : 'Review the histogram and crossover sections.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">📊</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.5: MACD — Momentum Master</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Momentum Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.6 — Bollinger Bands & Volatility</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
