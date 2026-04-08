// app/academy/lesson/moving-averages/page.tsx
// ATLAS Academy — Lesson 2.3: Moving Averages [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, RotateCcw, TrendingUp, Settings2 } from 'lucide-react';

// ============================================================
// PRICE DATA & MA CALCULATIONS
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function generatePrices(seed: number, count: number, trend: number = 0): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [100];
  for (let i = 1; i < count; i++) {
    const noise = (rand() - 0.5) * 3;
    const cycle = Math.sin(i * 0.04) * 6 + Math.sin(i * 0.015) * 10;
    p.push(p[i - 1] + noise + trend * 0.05 + cycle * 0.08);
  }
  return p;
}

function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += prices[i - j];
    return sum / period;
  });
}

function calcEMA(prices: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const ema: (number | null)[] = Array(prices.length).fill(null);
  // First EMA = SMA of first 'period' prices
  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  ema[period - 1] = sum / period;
  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + (ema[i - 1] as number) * (1 - k);
  }
  return ema;
}

const mainPrices = generatePrices(42, 300, 0.04);

// Generate prices with trend reversals to create actual crossovers
function generateCrossPrices(): number[] {
  const rand = seededRandom(17);
  const p: number[] = [100];
  for (let i = 1; i < 350; i++) {
    const noise = (rand() - 0.5) * 2;
    // Phase 1: downtrend (0-80), Phase 2: uptrend (80-200), Phase 3: downtrend (200-280), Phase 4: uptrend (280+)
    let trend = 0;
    if (i < 80) trend = -0.25;
    else if (i < 200) trend = 0.3;
    else if (i < 280) trend = -0.25;
    else trend = 0.2;
    p.push(p[i - 1] + noise + trend);
  }
  return p;
}
const crossPrices = generateCrossPrices();
// Generate uptrend with periodic pullbacks that touch the MA
function generateBouncePrices(): number[] {
  const rand = seededRandom(88);
  const p: number[] = [80];
  for (let i = 1; i < 200; i++) {
    const noise = (rand() - 0.5) * 2;
    const trend = 0.2; // steady uptrend
    // Every ~25 candles, create a pullback (sharp dip for 8-10 candles)
    const cyclePos = i % 30;
    let pullback = 0;
    if (cyclePos >= 20 && cyclePos <= 27) pullback = -0.8; // pullback phase
    p.push(p[i - 1] + noise + trend + pullback);
  }
  return p;
}
const bouncePrices = generateBouncePrices();

// ============================================================
// CHART RENDERER WITH MA OVERLAYS
// ============================================================
function renderChart(
  ctx: CanvasRenderingContext2D, W: number, H: number, 
  prices: number[], 
  overlays?: { data: (number | null)[]; color: string; width?: number; label?: string; dashed?: boolean }[],
  opts?: { showCandles?: boolean; highlightCross?: { i: number; type: 'golden' | 'death' }[]; showBounceDots?: { ma: (number | null)[]; tolerance: number; color: string }[] }
) {
  const pad = { t: 14, b: 14, l: 8, r: 8 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  
  // Calculate range including MAs
  let allVals = [...prices];
  overlays?.forEach(o => o.data.forEach(v => { if (v !== null) allVals.push(v); }));
  const min = Math.min(...allVals) - 1, max = Math.max(...allVals) + 1;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * cw;
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) { const y = pad.t + (i / 4) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Candles or line
  if (opts?.showCandles !== false) {
    const bw = Math.max(1, (cw / prices.length) * 0.45);
    for (let i = 1; i < prices.length; i++) {
      const o = prices[i - 1], c = prices[i];
      const hi = Math.max(o, c) + Math.abs(c - o) * 0.2;
      const lo = Math.min(o, c) - Math.abs(c - o) * 0.2;
      const bull = c >= o; const x = toX(i);
      ctx.strokeStyle = bull ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(x, toY(hi)); ctx.lineTo(x, toY(lo)); ctx.stroke();
      ctx.fillStyle = bull ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)';
      ctx.fillRect(x - bw / 2, toY(Math.max(o, c)), bw, Math.max(toY(Math.min(o, c)) - toY(Math.max(o, c)), 0.5));
    }
  }

  // MA lines
  overlays?.forEach(o => {
    ctx.strokeStyle = o.color; ctx.lineWidth = o.width || 1.5;
    if (o.dashed) ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
    ctx.beginPath();
    let started = false;
    o.data.forEach((v, i) => {
      if (v === null) return;
      const x = toX(i), y = toY(v);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke(); ctx.setLineDash([]);
    // Label at end
    if (o.label) {
      let lastIdx = 0;
      for (let li = o.data.length - 1; li >= 0; li--) { if (o.data[li] !== null) { lastIdx = li; break; } }
      const lastVal = o.data[lastIdx];
      if (lastVal !== null && lastVal !== undefined) {
        ctx.font = '600 8px sans-serif'; ctx.fillStyle = o.color; ctx.textAlign = 'left';
        ctx.fillText(o.label, toX(lastIdx) + 4, toY(lastVal) - 3);
      }
    }
  });

  // Cross highlights
  opts?.highlightCross?.forEach(c => {
    const x = toX(c.i), y = toY(prices[c.i]);
    ctx.fillStyle = c.type === 'golden' ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)';
    ctx.beginPath(); ctx.arc(x, y - 12, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 8px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(c.type === 'golden' ? '✦' : '✗', x, y - 9);
    // Glow
    ctx.fillStyle = c.type === 'golden' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
    ctx.beginPath(); ctx.arc(x, y - 12, 16, 0, Math.PI * 2); ctx.fill();
  });

  // Bounce dots
  opts?.showBounceDots?.forEach(bd => {
    for (let i = 3; i < prices.length - 2; i++) {
      const maVal = bd.ma[i];
      if (maVal === null) return;
      // A bounce: price comes close to the MA from above, then moves back up
      // Check if this candle is a local low near the MA
      const isLocalLow = prices[i] < prices[i - 1] && prices[i] < prices[i - 2] && prices[i + 1] > prices[i] && prices[i + 2] > prices[i];
      const nearMA = Math.abs(prices[i] - maVal) < bd.tolerance;
      const aboveMA = prices[i] >= maVal - bd.tolerance * 0.5; // allow slight dip below
      if (isLocalLow && nearMA && aboveMA) {
        ctx.fillStyle = bd.color; ctx.beginPath(); ctx.arc(toX(i), toY(prices[i]), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bd.color.replace(/[\d.]+\)$/, '0.15)');
        ctx.beginPath(); ctx.arc(toX(i), toY(prices[i]), 14, 0, Math.PI * 2); ctx.fill();
      }
    }
  });

  return { toX, toY };
}

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 240 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
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
// HOW MA IS CALCULATED — ANIMATED STEP-THROUGH
// ============================================================
function MAConstructionDemo() {
  const [period, setPeriod] = useState(5);
  const [windowPos, setWindowPos] = useState(4);
  const prices = [22, 24, 23, 25, 26, 24, 27, 28, 26, 29, 30, 28, 31, 32, 30];

  const windowStart = Math.max(0, windowPos - period + 1);
  const windowPrices = prices.slice(windowStart, windowPos + 1);
  const avg = windowPrices.length >= period ? windowPrices.reduce((a, b) => a + b, 0) / period : null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[15px]">How the Average is Calculated</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Period:</span>
          {[3, 5, 7].map(p => (
            <button key={p} onClick={() => { setPeriod(p); setWindowPos(p - 1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-white/5 text-gray-500'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price bar visualization */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {prices.map((p, i) => {
          const inWindow = i >= windowStart && i <= windowPos && windowPrices.length >= period;
          const isCurrent = i === windowPos;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-10 rounded-lg text-center text-xs font-mono font-bold py-2 transition-all duration-300 ${
                inWindow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 scale-105' : 'bg-white/5 text-gray-600 border border-transparent'
              } ${isCurrent ? 'ring-2 ring-amber-400/50' : ''}`}>
                {p}
              </div>
              <span className="text-[8px] text-gray-600 font-mono">{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Calculation display */}
      {avg !== null && (
        <motion.div key={windowPos} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
          <p className="text-xs text-gray-500 mb-2">
            ({windowPrices.join(' + ')}) ÷ {period}
          </p>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">{avg.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">SMA({period}) at position {windowPos + 1}</p>
        </motion.div>
      )}

      {/* Slider */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Slide the window →</span>
          <span>Position {windowPos + 1}</span>
        </div>
        <input type="range" min={period - 1} max={prices.length - 1} value={windowPos} onChange={e => setWindowPos(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer" />
      </div>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">The window slides forward one candle at a time, always averaging the last <strong className="text-amber-400">{period}</strong> prices. Connect all these averages and you get the moving average line.</p>
    </div>
  );
}

// ============================================================
// INTERACTIVE MA PLAYGROUND
// ============================================================
function MAPlayground() {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showEMA50, setShowEMA50] = useState(false);
  const [useEMA, setUseEMA] = useState(false);

  const prices = mainPrices;
  const sma20 = useMemo(() => calcSMA(prices, 20), [prices]);
  const sma50 = useMemo(() => calcSMA(prices, 50), [prices]);
  const sma200 = useMemo(() => calcSMA(prices, 200), [prices]);
  const ema20 = useMemo(() => calcEMA(prices, 20), [prices]);
  const ema50 = useMemo(() => calcEMA(prices, 50), [prices]);

  const drawPlayground = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const overlays: any[] = [];
    if (showSMA20) overlays.push({ data: sma20, color: '#0ea5e9', width: 1.5, label: 'SMA 20' });
    if (showSMA50) overlays.push({ data: sma50, color: '#d946ef', width: 1.5, label: 'SMA 50' });
    if (showSMA200) overlays.push({ data: sma200, color: '#f59e0b', width: 2, label: 'SMA 200' });
    if (showEMA20) overlays.push({ data: ema20, color: '#22c55e', width: 1.5, label: 'EMA 20', dashed: true });
    if (showEMA50) overlays.push({ data: ema50, color: '#ef4444', width: 1.5, label: 'EMA 50', dashed: true });
    renderChart(ctx, W, H, prices, overlays);
  }, [prices, sma20, sma50, sma200, ema20, ema50, showSMA20, showSMA50, showSMA200, showEMA20, showEMA50]);

  const toggles = [
    { label: 'SMA 20', active: showSMA20, toggle: () => setShowSMA20(!showSMA20), color: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
    { label: 'SMA 50', active: showSMA50, toggle: () => setShowSMA50(!showSMA50), color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
    { label: 'SMA 200', active: showSMA200, toggle: () => setShowSMA200(!showSMA200), color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
    { label: 'EMA 20', active: showEMA20, toggle: () => setShowEMA20(!showEMA20), color: 'bg-green-500/15 text-green-400 border-green-500/25' },
    { label: 'EMA 50', active: showEMA50, toggle: () => setShowEMA50(!showEMA50), color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex flex-wrap gap-1.5">
        {toggles.map(t => (
          <button key={t.label} onClick={t.toggle}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 border ${t.active ? t.color : 'bg-white/5 text-gray-600 border-transparent'}`}>
            {t.active ? '✓ ' : ''}{t.label}
          </button>
        ))}
      </div>
      <AnimScene drawFn={drawPlayground} height={280} />
      <div className="p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-white">Toggle MAs on and off.</strong> Notice: shorter periods (20) hug price closely and react fast. Longer periods (200) are smooth but slow. The 200 SMA is the most watched MA in the world — institutions use it to define bull vs bear markets.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// GOLDEN CROSS / DEATH CROSS ANIMATOR
// ============================================================
function CrossoverDemo() {
  const [showCross, setShowCross] = useState<'golden' | 'death' | 'both'>('both');

  const prices = crossPrices;
  const sma50 = useMemo(() => calcSMA(prices, 50), [prices]);
  const sma200 = useMemo(() => calcSMA(prices, 200), [prices]);

  // Find crossover points
  const crosses = useMemo(() => {
    const result: { i: number; type: 'golden' | 'death' }[] = [];
    for (let i = 201; i < prices.length; i++) {
      const prev50 = sma50[i - 1], prev200 = sma200[i - 1];
      const curr50 = sma50[i], curr200 = sma200[i];
      if (prev50 !== null && prev200 !== null && curr50 !== null && curr200 !== null) {
        if (prev50 < prev200 && curr50 >= curr200) result.push({ i, type: 'golden' });
        if (prev50 > prev200 && curr50 <= curr200) result.push({ i, type: 'death' });
      }
    }
    return result;
  }, [sma50, sma200, prices]);

  const drawCross = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const overlays = [
      { data: sma50, color: '#0ea5e9', width: 1.5, label: '50 SMA' },
      { data: sma200, color: '#f59e0b', width: 2, label: '200 SMA' },
    ];
    const filteredCrosses = crosses.filter(c => showCross === 'both' || c.type === showCross);
    renderChart(ctx, W, H, prices, overlays, { highlightCross: filteredCrosses });
  }, [prices, sma50, sma200, crosses, showCross]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex gap-2">
        {(['golden', 'death', 'both'] as const).map(t => (
          <button key={t} onClick={() => setShowCross(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${showCross === t ? (t === 'golden' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : t === 'death' ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-primary-500/15 text-primary-400 border border-primary-500/25') : 'glass text-gray-500'}`}>
            {t === 'golden' ? '✦ Golden Cross' : t === 'death' ? '✗ Death Cross' : '◆ Show Both'}
          </button>
        ))}
      </div>
      <AnimScene drawFn={drawCross} height={260} />
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div key={showCross} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {showCross === 'golden' || showCross === 'both' ? (
              <div className="mb-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="font-bold text-sm text-amber-400 mb-1">✦ Golden Cross</h4>
                <p className="text-xs text-gray-400 leading-relaxed">The 50 SMA crosses ABOVE the 200 SMA. This is a major <strong className="text-white">bullish signal</strong>. It means short-term momentum is outpacing the long-term trend — a potential start of a sustained uptrend.</p>
              </div>
            ) : null}
            {showCross === 'death' || showCross === 'both' ? (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <h4 className="font-bold text-sm text-red-400 mb-1">✗ Death Cross</h4>
                <p className="text-xs text-gray-400 leading-relaxed">The 50 SMA crosses BELOW the 200 SMA. This is a major <strong className="text-white">bearish signal</strong>. Short-term momentum is falling behind the long-term trend — potential start of a sustained downtrend.</p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// EMA vs SMA RACE
// ============================================================
function EMAvsSMADemo() {
  // Generate choppy data with sharp reversals to highlight EMA speed advantage
  const prices = useMemo(() => {
    const rand = seededRandom(777);
    const p: number[] = [100];
    for (let i = 1; i < 150; i++) {
      const noise = (rand() - 0.5) * 3;
      // Sharp reversals every ~30 candles
      let trend = 0;
      if (i < 30) trend = 0.5;
      else if (i < 55) trend = -0.6;
      else if (i < 85) trend = 0.7;
      else if (i < 115) trend = -0.5;
      else trend = 0.6;
      p.push(p[i - 1] + noise + trend);
    }
    return p;
  }, []);
  const sma20 = useMemo(() => calcSMA(prices, 20), [prices]);
  const ema20 = useMemo(() => calcEMA(prices, 20), [prices]);

  const drawRace = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderChart(ctx, W, H, prices, [
      { data: sma20, color: '#0ea5e9', width: 2, label: 'SMA 20' },
      { data: ema20, color: '#22c55e', width: 2, label: 'EMA 20', dashed: true },
    ]);
    // Labels
    ctx.font = '600 9px sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = '#0ea5e9'; ctx.fillText('— SMA (slower, smoother)', 10, 14);
    ctx.fillStyle = '#22c55e'; ctx.fillText('--- EMA (faster, reactive)', 10, 26);
  }, [prices, sma20, ema20]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <AnimScene drawFn={drawRace} height={220} />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
            <h4 className="font-bold text-sm text-primary-400 mb-1">SMA (Simple)</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Equal weight to all prices in the period. Smoother but <strong>slower to react</strong>. Best for identifying the overall trend direction.</p>
          </div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <h4 className="font-bold text-sm text-green-400 mb-1">EMA (Exponential)</h4>
            <p className="text-xs text-gray-400 leading-relaxed">More weight on recent prices. <strong>Reacts faster</strong> to price changes. Best for entries and exits where speed matters.</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">Look at the chart — the EMA (dashed green) turns before the SMA (solid blue) at every reversal.</p>
      </div>
    </div>
  );
}

// ============================================================
// DYNAMIC SUPPORT DEMO — price bouncing off MA
// ============================================================
function DynamicSupportDemo() {
  const prices = bouncePrices;
  const sma50 = useMemo(() => calcSMA(prices, 50), [prices]);

  const drawBounce = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderChart(ctx, W, H, prices, [
      { data: sma50, color: 'rgba(14,165,233,0.7)', width: 2.5, label: '50 SMA' },
    ], { showBounceDots: [{ ma: sma50, tolerance: 4, color: 'rgba(34,197,94,0.7)' }] });
  }, [prices, sma50]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <AnimScene drawFn={drawBounce} height={230} />
      <div className="p-5">
        <h4 className="font-bold text-[15px] mb-2">Moving Averages as Dynamic Support</h4>
        <p className="text-sm text-gray-400 leading-relaxed mb-3">In an uptrend, price often <strong className="text-white">bounces off the moving average</strong> like it&apos;s a trampoline. The green dots show where price dipped to the 50 SMA and bounced — each one was a buying opportunity.</p>
        <p className="text-sm text-gray-400 leading-relaxed">This is called <strong className="text-primary-400">&quot;dynamic support&quot;</strong> — unlike horizontal support which stays at one price, the MA moves WITH the trend, providing a rising floor that guides your entries.</p>
      </div>
    </div>
  );
}

// ============================================================
// CROSSOVER SIGNAL SCANNER GAME
// ============================================================
function CrossoverGame() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<'buy' | 'sell' | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const scenarios = useMemo(() => [
    { prices: generatePrices(11, 120, 0.1), correct: 'buy' as const, explain: 'The fast MA crossed ABOVE the slow MA — a bullish crossover signal. Buy.' },
    { prices: generatePrices(22, 120, -0.08), correct: 'sell' as const, explain: 'The fast MA crossed BELOW the slow MA — a bearish crossover. Sell or exit longs.' },
    { prices: generatePrices(33, 120, 0.12), correct: 'buy' as const, explain: 'Another bullish crossover with price above both MAs — strong buy signal.' },
    { prices: generatePrices(44, 120, -0.1), correct: 'sell' as const, explain: 'Fast MA diving below slow MA, price is falling — sell signal confirmed.' },
    { prices: generatePrices(55, 120, 0.06), correct: 'buy' as const, explain: 'Bullish crossover in an uptrend — momentum is accelerating. Buy.' },
  ], []);

  const sc = scenarios[round];
  const fast = useMemo(() => calcEMA(sc.prices, 10), [sc.prices]);
  const slow = useMemo(() => calcEMA(sc.prices, 30), [sc.prices]);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderChart(ctx, W, H, sc.prices, [
      { data: fast, color: '#22c55e', width: 1.5, label: 'Fast (10)' },
      { data: slow, color: '#ef4444', width: 1.5, label: 'Slow (30)' },
    ]);
  }, [sc.prices, fast, slow]);

  const handleAnswer = (ans: 'buy' | 'sell') => {
    if (answer) return;
    setAnswer(ans);
    if (ans === sc.correct) setScore(s => s + 1);
    setTimeout(() => {
      if (round < scenarios.length - 1) { setRound(r => r + 1); setAnswer(null); }
      else setDone(true);
    }, 2000);
  };

  if (done) return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <p className="text-3xl mb-2">{score >= 4 ? '🎯' : score >= 3 ? '👍' : '📚'}</p>
      <p className="text-lg font-bold">{score}/{scenarios.length}</p>
      <p className="text-sm text-gray-400 mt-1">{score >= 4 ? 'Excellent crossover reading!' : 'Keep practising — speed and accuracy come with reps.'}</p>
      <button onClick={() => { setRound(0); setScore(0); setDone(false); setAnswer(null); }} className="mt-3 px-4 py-2 rounded-lg glass text-xs font-semibold text-amber-400">Try Again</button>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Round {round + 1}/{scenarios.length}</span>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>
      <AnimScene drawFn={drawGame} height={200} />
      <div className="p-4">
        <p className="text-sm font-semibold mb-3 text-center">What does the crossover signal?</p>
        <div className="flex gap-2">
          {[{ id: 'buy' as const, label: '🟢 BUY Signal' }, { id: 'sell' as const, label: '🔴 SELL Signal' }].map(opt => {
            let cls = 'flex-1 p-3 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all border active:scale-95 ';
            if (!answer) cls += 'glass hover:bg-white/[0.06]';
            else if (opt.id === sc.correct) cls += 'bg-green-500/15 border-green-500/30 text-green-400';
            else if (opt.id === answer) cls += 'bg-red-500/15 border-red-500/30 text-red-400';
            else cls += 'bg-white/[0.02] border-white/[0.03] opacity-30';
            return <div key={opt.id} className={cls} onClick={() => handleAnswer(opt.id)}>{opt.label}</div>;
          })}
        </div>
        {answer && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-gray-400 text-center">{answer === sc.correct ? '✅ ' : '❌ '}{sc.explain}</motion.p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "A Simple Moving Average (SMA) of 20 periods calculates:", opts: ["The highest price of the last 20 candles", "The average closing price of the last 20 candles", "20% of the current price", "The difference between 20 candles"], correct: 1, explain: "The SMA takes the sum of the closing prices for the last N candles and divides by N. SMA(20) = sum of last 20 closes ÷ 20." },
  { q: "What is the key difference between SMA and EMA?", opts: ["SMA uses more data", "EMA gives more weight to recent prices, making it faster", "They are exactly the same", "SMA is always better"], correct: 1, explain: "EMA applies an exponential weighting that emphasises recent prices. This makes it react faster to new price action compared to SMA which weights all prices equally." },
  { q: "A 'Golden Cross' occurs when:", opts: ["Price crosses above the 200 SMA", "The 50 SMA crosses above the 200 SMA", "Two golden candles appear", "The market reaches an all-time high"], correct: 1, explain: "A Golden Cross is specifically when the 50-period SMA crosses ABOVE the 200-period SMA. It's one of the most watched signals in all of technical analysis." },
  { q: "In an uptrend, the 50 SMA can act as:", opts: ["Resistance only", "Dynamic support — price bounces off it", "A random line with no meaning", "A sell signal"], correct: 1, explain: "In uptrends, MAs act as dynamic (moving) support. Price often dips to the MA and bounces, giving traders buying opportunities on the pullback." },
  { q: "Which MA is most significant for defining bull vs bear markets?", opts: ["5 EMA", "20 SMA", "200 SMA", "10 EMA"], correct: 2, explain: "The 200 SMA is the gold standard. Price above the 200 SMA = bull market. Below it = bear market. Institutional traders worldwide use this as a dividing line." },
  { q: "The shorter the MA period, the more it:", opts: ["Smooths out the data", "Reacts to price changes and produces more signals (including false ones)", "Ignores recent prices", "Matches the 200 SMA"], correct: 1, explain: "Short-period MAs hug price tightly and react fast. This means more signals — but also more false signals. Longer periods filter noise but react slowly." },
  { q: "You see the 10 EMA cross below the 30 EMA while price is falling. This is a:", opts: ["Buy signal", "Bearish crossover — sell or avoid longs", "Meaningless event", "Signal to add to your position"], correct: 1, explain: "A fast MA crossing below a slow MA is a bearish crossover. It confirms that short-term momentum has turned negative. Time to sell or stay out of long trades." },
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
export default function MovingAveragesLesson() {
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

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"><Crown className="w-3 h-3" /> PRO</span>
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} /></div>
          <span className="font-mono text-[10px] text-gray-500">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-100px] right-[25%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO — Level 2: Technical Analysis</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Moving<br /><span className="bg-gradient-to-r from-primary-400 via-green-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Averages</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The most widely used indicator in the world. From smoothing noise to defining trends, crossovers to dynamic support — master every aspect.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5" /> MA Calculator</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 5-Toggle Playground</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Golden/Death Cross</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Crossover Game</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 7 Questions</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What Is a Moving Average */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Concept</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is a Moving Average?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">A moving average is simply the <strong className="text-white">average price over a set number of periods</strong>, recalculated as each new candle forms. It &quot;moves&quot; because the window slides forward with time.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-4">Its purpose is to <strong className="text-white">smooth out the noise</strong>. Individual candles jump around randomly. The MA reveals the underlying trend by filtering out the chaos.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Think of it like weather vs climate. Daily temperatures (candles) fluctuate wildly. The seasonal average (MA) shows you whether it&apos;s summer or winter.</motion.p>
        </motion.div>

        {[
          { period: '20', use: 'Short-term trend', desc: 'Reacts quickly. Used by day traders and scalpers for entries. Hugs price closely.', color: 'text-primary-400', border: 'border-l-sky-500' },
          { period: '50', use: 'Medium-term trend', desc: 'The sweet spot. Balances speed and smoothness. Most popular for swing traders.', color: 'text-accent-400', border: 'border-l-purple-500' },
          { period: '200', use: 'Long-term trend', desc: 'The king of MAs. Price above 200 = bull market. Below = bear. Institutions watch this.', color: 'text-amber-400', border: 'border-l-amber-500' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl font-extrabold font-mono ${item.color}`}>{item.period}</span>
              <div>
                <h4 className="font-bold text-[15px]">{item.use}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Section 2: How It's Calculated */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — Under the Hood</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Watch the Calculation</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Slide the window across the data and see exactly how each average point is calculated. Change the period to see how it affects smoothness.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MAConstructionDemo />
        </motion.div>
      </section>

      {/* Section 3: SMA vs EMA */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — SMA vs EMA</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">The Speed Difference</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Same period, same data — but the EMA reacts faster because it gives more weight to recent prices. Watch them race on the same chart.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <EMAvsSMADemo />
        </motion.div>
      </section>

      {/* Section 4: Interactive Playground */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — Playground</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Toggle & Explore</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Turn MAs on and off. Stack them. Compare SMA vs EMA. See how 20 vs 200 periods create completely different perspectives.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <MAPlayground />
        </motion.div>
      </section>

      {/* Section 5: Golden Cross / Death Cross */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — The Big Signals</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Golden Cross & Death Cross</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">The two most famous signals in all of trading. When the 50 SMA crosses the 200 SMA, the entire market pays attention.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <CrossoverDemo />
        </motion.div>
      </section>

      {/* Section 6: Dynamic Support */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Dynamic Support</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">The Moving Floor</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">In an uptrend, MAs don&apos;t just show direction — they act as a rising support level. Price dips to the MA and bounces. This creates tradeable setups.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <DynamicSupportDemo />
        </motion.div>
      </section>

      {/* Section 7: Crossover Signal Game */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">07 — Read the Cross</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Crossover Signal Game</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">5 rounds. Each shows a chart with two MAs. Your job: is the latest crossover a BUY or SELL signal?</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <CrossoverGame />
        </motion.div>
      </section>

      {/* Section 8: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">08 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Moving Averages Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions covering SMA, EMA, crossovers, dynamic support, and practical application.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. MAs are now your weapon.' : score >= 66 ? 'Solid — you understand the trend\'s best friend.' : 'Review the playground and crossover sections.'}</p>
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
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">📈</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.3: Moving Averages</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Trend Analyst —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.4 — RSI: Relative Strength Index</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
