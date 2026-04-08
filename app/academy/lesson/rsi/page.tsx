// app/academy/lesson/rsi/page.tsx
// ATLAS Academy — Lesson 2.4: RSI — Relative Strength Index [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, TrendingUp, TrendingDown, Activity } from 'lucide-react';

// ============================================================
// PRICE DATA & RSI CALCULATION (Wilder's Smoothing)
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function generatePrices(seed: number, count: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [100];
  for (let i = 1; i < count; i++) {
    const noise = (rand() - 0.5) * 3;
    const cycle = Math.sin(i * 0.035) * 8 + Math.sin(i * 0.08) * 4;
    p.push(p[i - 1] + noise + cycle * 0.12);
  }
  return p;
}

// Wilder's RSI calculation — the correct, industry-standard method
function calcRSI(prices: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = Array(prices.length).fill(null);
  if (prices.length < period + 1) return rsi;

  // Step 1: Calculate gains and losses
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Step 2: First average = simple average of first 'period' values
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs0));

  // Step 3: Subsequent values use Wilder's smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i + 1] = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  }

  return rsi;
}

// Price datasets with different characteristics
function generateOBOS(): number[] {
  // Creates price that oscillates into overbought and oversold zones
  const rand = seededRandom(42);
  const p: number[] = [100];
  for (let i = 1; i < 250; i++) {
    const noise = (rand() - 0.5) * 2;
    // Strong cycles that push RSI to extremes
    const cycle = Math.sin(i * 0.04) * 1.5 + Math.sin(i * 0.025) * 2;
    p.push(p[i - 1] + noise + cycle);
  }
  return p;
}

function generateDivergence(type: 'bullish' | 'bearish'): number[] {
  const rand = seededRandom(type === 'bullish' ? 99 : 55);
  const p: number[] = [100];
  for (let i = 1; i < 150; i++) {
    const noise = (rand() - 0.5) * 1.5;
    let trend = 0;
    if (type === 'bullish') {
      // Price makes lower lows but momentum weakens (RSI makes higher lows)
      if (i < 40) trend = -0.3;
      else if (i < 60) trend = 0.15;
      else if (i < 100) trend = -0.2; // shallower decline
      else trend = 0.4;
    } else {
      // Price makes higher highs but momentum weakens (RSI makes lower highs)
      if (i < 40) trend = 0.3;
      else if (i < 60) trend = -0.15;
      else if (i < 100) trend = 0.15; // weaker rally
      else trend = -0.4;
    }
    p.push(p[i - 1] + noise + trend);
  }
  return p;
}

const mainPrices = generateOBOS();
const bullDivPrices = generateDivergence('bullish');
const bearDivPrices = generateDivergence('bearish');

// ============================================================
// CHART + RSI RENDERER
// ============================================================
function renderPriceAndRSI(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  prices: number[], rsiData: (number | null)[],
  opts?: { highlightOB?: boolean; highlightOS?: boolean; showMidline?: boolean; divLines?: { x1: number; y1: number; x2: number; y2: number; color: string }[] }
) {
  const priceH = H * 0.55;
  const gap = 8;
  const rsiH = H - priceH - gap;
  const pad = { l: 8, r: 8 };

  // === PRICE CHART (top) ===
  const pMin = Math.min(...prices) - 1, pMax = Math.max(...prices) + 1;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * (W - pad.l - pad.r);
  const toPY = (v: number) => 8 + (1 - (v - pMin) / (pMax - pMin)) * (priceH - 16);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { const y = 8 + (i / 3) * (priceH - 16); ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Candles
  const bw = Math.max(1, ((W - pad.l - pad.r) / prices.length) * 0.45);
  for (let i = 1; i < prices.length; i++) {
    const o = prices[i - 1], c = prices[i];
    const hi = Math.max(o, c) + Math.abs(c - o) * 0.2;
    const lo = Math.min(o, c) - Math.abs(c - o) * 0.2;
    const bull = c >= o; const x = toX(i);
    ctx.strokeStyle = bull ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(x, toPY(hi)); ctx.lineTo(x, toPY(lo)); ctx.stroke();
    ctx.fillStyle = bull ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
    ctx.fillRect(x - bw / 2, toPY(Math.max(o, c)), bw, Math.max(toPY(Math.min(o, c)) - toPY(Math.max(o, c)), 0.5));
  }

  // === RSI CHART (bottom) ===
  const rsiTop = priceH + gap;
  const toRY = (v: number) => rsiTop + 4 + (1 - v / 100) * (rsiH - 8);

  // RSI background
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(pad.l, rsiTop, W - pad.l - pad.r, rsiH);

  // Overbought/oversold zones
  if (opts?.highlightOB !== false) {
    ctx.fillStyle = 'rgba(239,68,68,0.06)';
    ctx.fillRect(pad.l, toRY(100), W - pad.l - pad.r, toRY(70) - toRY(100));
  }
  if (opts?.highlightOS !== false) {
    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.fillRect(pad.l, toRY(30), W - pad.l - pad.r, toRY(0) - toRY(30));
  }

  // Level lines
  ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(pad.l, toRY(70)); ctx.lineTo(W - pad.r, toRY(70)); ctx.stroke();
  ctx.strokeStyle = 'rgba(34,197,94,0.3)';
  ctx.beginPath(); ctx.moveTo(pad.l, toRY(30)); ctx.lineTo(W - pad.r, toRY(30)); ctx.stroke();
  ctx.setLineDash([]);

  if (opts?.showMidline) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(pad.l, toRY(50)); ctx.lineTo(W - pad.r, toRY(50)); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Level labels
  ctx.font = '600 7px sans-serif'; ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.fillText('70', W - pad.r - 2, toRY(70) - 2);
  ctx.fillStyle = 'rgba(34,197,94,0.5)'; ctx.fillText('30', W - pad.r - 2, toRY(30) - 2);
  if (opts?.showMidline) { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillText('50', W - pad.r - 2, toRY(50) - 2); }

  // RSI line
  ctx.beginPath(); let started = false;
  rsiData.forEach((v, i) => {
    if (v === null) return;
    const x = toX(i), y = toRY(v);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 1.5; ctx.stroke();

  // Highlight dots where RSI enters OB/OS
  rsiData.forEach((v, i) => {
    if (v === null || i < 1) return;
    const prev = rsiData[i - 1];
    if (prev === null) return;
    if (v >= 70 && prev < 70) {
      ctx.fillStyle = 'rgba(239,68,68,0.8)'; ctx.beginPath(); ctx.arc(toX(i), toRY(v), 3, 0, Math.PI * 2); ctx.fill();
    }
    if (v <= 30 && prev > 30) {
      ctx.fillStyle = 'rgba(34,197,94,0.8)'; ctx.beginPath(); ctx.arc(toX(i), toRY(v), 3, 0, Math.PI * 2); ctx.fill();
    }
  });

  // Divergence lines
  opts?.divLines?.forEach(dl => {
    ctx.strokeStyle = dl.color; ctx.lineWidth = 1.5; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(toX(dl.x1), toPY(dl.y1)); ctx.lineTo(toX(dl.x2), toPY(dl.y2)); ctx.stroke();
    ctx.setLineDash([]);
  });

  // RSI label
  const lastRSI = rsiData.filter(v => v !== null).pop();
  if (lastRSI !== undefined && lastRSI !== null) {
    ctx.font = '700 9px sans-serif'; ctx.fillStyle = '#d946ef'; ctx.textAlign = 'left';
    ctx.fillText(`RSI: ${lastRSI.toFixed(1)}`, pad.l + 4, rsiTop + 12);
  }
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
// RSI FORMULA STEP-THROUGH
// ============================================================
function RSIFormulaDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Step 1: Calculate Price Changes', desc: 'For each candle, calculate the change from the previous close. If price went up, it\'s a "gain". If it went down, it\'s a "loss" (stored as positive).', formula: 'Change = Close[today] - Close[yesterday]', highlight: 'changes' },
    { title: 'Step 2: Separate Gains & Losses', desc: 'Split changes into two columns: gains (positive changes) and losses (absolute value of negative changes). If a day was up, loss = 0. If down, gain = 0.', formula: 'Gain = max(change, 0) · Loss = |min(change, 0)|', highlight: 'split' },
    { title: 'Step 3: Average Gain & Loss (14 periods)', desc: 'First calculation: simple average of the first 14 gains and 14 losses. Subsequent calculations use Wilder\'s smoothing: (prev × 13 + current) ÷ 14.', formula: 'AvgGain = (prevAvgGain × 13 + gain) ÷ 14', highlight: 'average' },
    { title: 'Step 4: Relative Strength (RS)', desc: 'Divide average gain by average loss. If gains dominate, RS is high. If losses dominate, RS is low. This is the "relative strength" — how strong are the bulls vs bears.', formula: 'RS = AvgGain ÷ AvgLoss', highlight: 'rs' },
    { title: 'Step 5: RSI = 0 to 100', desc: 'The final formula normalizes RS into a 0-100 scale. When RS is very high (all gains), RSI → 100. When RS is zero (all losses), RSI → 0. Above 70 = overbought. Below 30 = oversold.', formula: 'RSI = 100 - (100 ÷ (1 + RS))', highlight: 'rsi' },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-accent-500 to-amber-500' : 'bg-white/10'}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h4 className="font-bold text-[15px] mb-2">{steps[step].title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">{steps[step].desc}</p>
            <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/15 text-center">
              <code className="text-sm font-mono text-accent-400">{steps[step].formula}</code>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-4 py-2 rounded-lg glass text-xs font-semibold text-gray-500 active:scale-95 disabled:opacity-30">← Back</button>
          <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-xs active:scale-95 disabled:opacity-40">
            {step >= steps.length - 1 ? 'Complete ✓' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INTERACTIVE RSI CHART
// ============================================================
function RSIChartDemo() {
  const [period, setPeriod] = useState(14);
  const prices = mainPrices;
  const rsi = useMemo(() => calcRSI(prices, period), [prices, period]);

  const drawRSI = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderPriceAndRSI(ctx, W, H, prices, rsi, { showMidline: true });
  }, [prices, rsi]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Price + RSI({period})</span>
        <div className="flex gap-1">
          {[7, 14, 21].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${period === p ? 'bg-accent-500/15 text-accent-400 border border-accent-500/25' : 'bg-white/5 text-gray-500'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <AnimScene drawFn={drawRSI} height={320} />
      <div className="p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-white">Top panel:</strong> Price action. <strong className="text-white">Bottom panel:</strong> RSI oscillator (purple line).
          Red zone (above 70) = overbought. Green zone (below 30) = oversold.
          {period === 7 && ' A shorter period makes RSI more sensitive — more signals, but also more false signals.'}
          {period === 21 && ' A longer period smooths the RSI — fewer but more reliable signals.'}
          {period === 14 && ' Period 14 is the standard — the best balance of sensitivity and reliability.'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// DIVERGENCE DEMO
// ============================================================
function DivergenceDemo() {
  const [divType, setDivType] = useState<'bullish' | 'bearish'>('bullish');
  const prices = divType === 'bullish' ? bullDivPrices : bearDivPrices;
  const rsi = useMemo(() => calcRSI(prices), [prices]);

  const drawDiv = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderPriceAndRSI(ctx, W, H, prices, rsi, { showMidline: false });
  }, [prices, rsi]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/[0.06] flex gap-2">
        <button onClick={() => setDivType('bullish')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${divType === 'bullish' ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'glass text-gray-500'}`}>🟢 Bullish Divergence</button>
        <button onClick={() => setDivType('bearish')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${divType === 'bearish' ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'glass text-gray-500'}`}>🔴 Bearish Divergence</button>
      </div>
      <AnimScene drawFn={drawDiv} height={300} />
      <div className="p-5">
        {divType === 'bullish' ? (
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <h4 className="font-bold text-sm text-green-400 mb-1">Bullish Divergence</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Price makes <strong className="text-white">lower lows</strong> but RSI makes <strong className="text-white">higher lows</strong>. The selling momentum is weakening even though price is still falling. This often precedes a reversal upward — a potential buying opportunity.</p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <h4 className="font-bold text-sm text-red-400 mb-1">Bearish Divergence</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Price makes <strong className="text-white">higher highs</strong> but RSI makes <strong className="text-white">lower highs</strong>. The buying momentum is weakening even though price is still rising. This often precedes a reversal downward — a potential selling signal.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SPOT THE SIGNAL GAME
// ============================================================
function RSISignalGame() {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const scenarios = useMemo(() => {
    // Each scenario has carefully crafted price data to produce a clear RSI condition
    function makeOB(seed: number): number[] {
      // Strong sustained rally — RSI will be well above 70
      const rand = seededRandom(seed);
      const p: number[] = [80];
      for (let i = 1; i < 100; i++) {
        p.push(p[i - 1] + (rand() - 0.3) * 1.5 + 0.6);
      }
      return p;
    }
    function makeOS(seed: number): number[] {
      // Strong sustained sell-off — RSI will be well below 30
      const rand = seededRandom(seed);
      const p: number[] = [120];
      for (let i = 1; i < 100; i++) {
        p.push(p[i - 1] + (rand() - 0.7) * 1.5 - 0.6);
      }
      return p;
    }
    function makeBull(seed: number): number[] {
      // Gentle uptrend — RSI stays 50-65 range
      const rand = seededRandom(seed);
      const p: number[] = [100];
      for (let i = 1; i < 100; i++) {
        p.push(p[i - 1] + (rand() - 0.45) * 2 + 0.1);
      }
      return p;
    }
    function makeBear(seed: number): number[] {
      // Gentle downtrend — RSI stays 35-50 range
      const rand = seededRandom(seed);
      const p: number[] = [100];
      for (let i = 1; i < 100; i++) {
        p.push(p[i - 1] + (rand() - 0.55) * 2 - 0.1);
      }
      return p;
    }
    function makeDiv(seed: number): number[] {
      // Price makes lower low but with weakening momentum (RSI higher low)
      const rand = seededRandom(seed);
      const p: number[] = [100];
      for (let i = 1; i < 100; i++) {
        const noise = (rand() - 0.5) * 1.2;
        let trend = 0;
        if (i < 30) trend = -0.5;       // first drop
        else if (i < 50) trend = 0.3;    // recovery
        else if (i < 80) trend = -0.25;  // second drop (shallower momentum)
        else trend = 0.15;               // start of recovery
        p.push(p[i - 1] + noise + trend);
      }
      return p;
    }

    return [
      { prices: makeOB(111), correct: 'overbought', explain: 'RSI surged above 70 after a strong rally. The market is overbought — momentum is stretched. Watch for a pullback.' },
      { prices: makeOS(222), correct: 'oversold', explain: 'RSI dropped below 30 after heavy selling. The market is oversold — selling pressure may be exhausted. Watch for a bounce.' },
      { prices: makeBull(333), correct: 'bullish_momentum', explain: 'RSI is above 50 and steady. Bullish momentum confirmed — the trend is healthy. Look for pullback entries.' },
      { prices: makeBear(444), correct: 'bearish_momentum', explain: 'RSI is below 50. Bearish momentum — avoid buying. Look for short setups or stay out.' },
      { prices: makeDiv(555), correct: 'divergence', explain: 'Price made a lower low but RSI made a higher low — bullish divergence. Selling is weakening. A reversal may be forming.' },
    ];
  }, []);

  const sc = scenarios[round];
  const rsi = useMemo(() => calcRSI(sc.prices), [sc.prices]);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    renderPriceAndRSI(ctx, W, H, sc.prices, rsi, { showMidline: true });
  }, [sc.prices, rsi]);

  const options = [
    { id: 'overbought', label: '🔴 Overbought (>70)' },
    { id: 'oversold', label: '🟢 Oversold (<30)' },
    { id: 'bullish_momentum', label: '📈 Bullish (>50)' },
    { id: 'bearish_momentum', label: '📉 Bearish (<50)' },
    { id: 'divergence', label: '🔄 Divergence' },
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
      <p className="text-sm text-gray-400 mt-1">{score >= 4 ? 'Excellent RSI reading!' : 'Keep practising — RSI interpretation is a core skill.'}</p>
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
        <p className="text-sm font-semibold mb-3 text-center">What is the RSI telling you?</p>
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
            <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
              {answer === sc.correct ? '✅ Correct! ' : '❌ Not quite. '}{sc.explain}
            </p>
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
  { q: "RSI measures:", opts: ["The absolute price of an asset", "The speed and magnitude of recent price changes (momentum)", "How much volume is traded", "The correlation between two assets"], correct: 1, explain: "RSI is a momentum oscillator. It measures how fast price is moving and how strong the recent gains are compared to recent losses. It tells you about the SPEED of change, not the price itself." },
  { q: "An RSI reading above 70 typically indicates:", opts: ["The asset is cheap and you should buy", "The asset may be overbought — momentum is stretched", "The asset will definitely crash", "Nothing — 70 is meaningless"], correct: 1, explain: "RSI above 70 = overbought territory. It doesn't mean price will crash immediately — strong trends can stay overbought for extended periods — but it signals that momentum is stretched and a pullback becomes more likely." },
  { q: "In the RSI formula, what does RS (Relative Strength) represent?", opts: ["The stock's total value", "The ratio of average gains to average losses over the period", "The number of green candles", "The price divided by volume"], correct: 1, explain: "RS = Average Gain ÷ Average Loss. If the average gain over 14 periods is $2 and the average loss is $1, RS = 2. This gets converted to the 0-100 RSI scale." },
  { q: "Bullish RSI divergence occurs when:", opts: ["Price and RSI both make higher highs", "Price makes lower lows but RSI makes higher lows", "RSI goes above 70", "Price crosses above the 200 SMA"], correct: 1, explain: "Bullish divergence: price falls further (lower low) but RSI doesn't follow (higher low). The selling momentum is weakening — the bears are losing steam. A reversal upward often follows." },
  { q: "The standard RSI period is:", opts: ["7 periods", "14 periods", "50 periods", "200 periods"], correct: 1, explain: "J. Welles Wilder designed RSI with a 14-period default. Shorter periods (7-9) make it more sensitive. Longer periods (21+) make it smoother. 14 is the sweet spot that most traders use." },
  { q: "RSI is most useful in which type of market?", opts: ["Strong trending markets only", "Ranging/oscillating markets where price bounces between levels", "Only during news events", "It works equally in all conditions without adjustment"], correct: 1, explain: "RSI shines in ranging markets where overbought/oversold signals reliably predict reversals. In strong trends, RSI can stay overbought/oversold for long periods, making the signals less reliable." },
  { q: "If RSI is hovering around 50, this suggests:", opts: ["You should sell immediately", "Neutral momentum — no clear direction", "Strong bullish trend", "The indicator is broken"], correct: 1, explain: "RSI at 50 is the equilibrium point — gains and losses are roughly equal. No clear momentum in either direction. Traders watch for RSI to break above 50 (bullish) or below 50 (bearish) for confirmation." },
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
export default function RSILesson() {
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
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(217,70,239,0.07),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO — Level 2: Technical Analysis</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            RSI —<br /><span className="bg-gradient-to-r from-accent-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Relative Strength Index</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The momentum oscillator that tells you when buying or selling pressure is stretched to the limit. Overbought, oversold, divergences, and more.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Formula Breakdown</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Interactive RSI Chart</span>
            <span className="flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Divergence Demo</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Signal Game</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What Is RSI */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Concept</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is RSI?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">The Relative Strength Index is a <strong className="text-white">momentum oscillator</strong> that measures how fast and how strongly price is moving. It oscillates between 0 and 100.</motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Created by J. Welles Wilder in 1978, RSI answers one question: <strong className="text-white">&quot;Is the recent buying or selling pressure sustainable?&quot;</strong> When momentum stretches too far in one direction, it often snaps back.</motion.p>
        </motion.div>

        {[
          { value: '70+', label: 'Overbought', desc: 'Buying pressure has been dominant. Price may be due for a pullback. Doesn\'t mean sell immediately — but be cautious about new buys.', color: 'text-red-400', border: 'border-l-red-500', bg: 'bg-red-500/10' },
          { value: '50', label: 'Neutral / Midline', desc: 'Gains and losses are roughly equal. No clear momentum. Watch for a break above (bullish) or below (bearish) for direction.', color: 'text-gray-400', border: 'border-l-gray-500', bg: 'bg-white/5' },
          { value: '30-', label: 'Oversold', desc: 'Selling pressure has been dominant. Price may be due for a bounce. Doesn\'t mean buy immediately — but be alert for reversal signs.', color: 'text-green-400', border: 'border-l-green-500', bg: 'bg-green-500/10' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl font-extrabold font-mono ${item.color}`}>{item.value}</span>
              <h4 className="font-bold text-[15px]">{item.label}</h4>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 2: The Formula */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — Under the Hood</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">How RSI Is Calculated</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Step through Wilder&apos;s original formula. Each step builds on the last. By the end, you&apos;ll understand exactly what the number means.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <RSIFormulaDemo />
        </motion.div>
      </section>

      {/* Section 3: Interactive RSI Chart */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — See It Live</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Interactive RSI Chart</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Price action on top, RSI below. Toggle between periods (7, 14, 21) and see how sensitivity changes. Watch for the dots where RSI enters overbought or oversold territory.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <RSIChartDemo />
        </motion.div>
      </section>

      {/* Section 4: The Trap */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — The Trap</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Overbought ≠ Sell. Oversold ≠ Buy.</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">The #1 mistake new traders make with RSI. This is so important it gets its own section.</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-green-500" />
          <p className="text-sm text-gray-300 leading-relaxed mb-4">In <strong className="text-white">strong trends</strong>, RSI can stay overbought (above 70) or oversold (below 30) for <strong className="text-white">weeks or even months</strong>. Selling just because RSI is 75 in a raging bull market will get you destroyed.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-400 font-semibold mb-1">❌ The Wrong Way</p>
              <p className="text-xs text-gray-400">&quot;RSI is 72, I&apos;m shorting!&quot; → Gets crushed as RSI stays above 70 for 3 weeks during a bull run.</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
              <p className="text-xs text-green-400 font-semibold mb-1">✅ The Right Way</p>
              <p className="text-xs text-gray-400">RSI confirms what other tools show. Use it with S/R, trendlines, and price action. Never trade RSI alone.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 5: Divergence */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Divergence</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">When Price & RSI Disagree</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Divergence is one of the most powerful signals in all of trading. It reveals hidden weakness (or strength) that price alone doesn&apos;t show.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <DivergenceDemo />
        </motion.div>
      </section>

      {/* Section 6: Signal Game */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Read the RSI</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Spot the Signal Game</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">5 charts. Each shows a different RSI condition. Identify whether it&apos;s overbought, oversold, bullish momentum, bearish momentum, or divergence.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <RSISignalGame />
        </motion.div>
      </section>

      {/* Section 7: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">07 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">RSI Mastery Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions. Theory, calculation, and practical application.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. RSI is now in your arsenal.' : score >= 66 ? 'Solid — you understand momentum oscillators.' : 'Review the overbought/oversold and divergence sections.'}</p>
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
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(217,70,239,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-accent-500/30">📊</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.4: RSI — Relative Strength Index</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-accent-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Momentum Reader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.5 — MACD: Momentum Master</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
