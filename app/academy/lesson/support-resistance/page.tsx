// app/academy/lesson/support-resistance/page.tsx
// ATLAS Academy — Lesson 2.1: Support & Resistance Mastery [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, Shield, TrendingUp, RotateCcw } from 'lucide-react';

// ============================================================
// PRICE DATA
// ============================================================
function seededPrices(seed: number, count: number, trend: number = 0): number[] {
  const p: number[] = [100]; let s = seed;
  for (let i = 1; i < count; i++) {
    s = (s * 16807) % 2147483647;
    const r = (s / 2147483647 - 0.5) * 2.5;
    // Create natural S/R by adding sine waves that create bouncing zones
    const bounce = Math.sin(i * 0.08) * 8 + Math.sin(i * 0.03) * 12;
    p.push(p[i - 1] + r + trend * 0.05 + bounce * 0.15);
  }
  return p;
}

const mainPrices = seededPrices(42, 200);
const flipPrices = seededPrices(77, 150, 0.3);

// ============================================================
// REAL S/R DETECTION — finds actual bounce zones
// ============================================================
function detectSR(prices: number[], lookback: number = 5): { support: number; resistance: number } {
  // Step 1: Find swing lows (potential support) and swing highs (potential resistance)
  const swingLows: number[] = [];
  const swingHighs: number[] = [];

  for (let i = lookback; i < prices.length - lookback; i++) {
    let isLow = true, isHigh = true;
    for (let j = 1; j <= lookback; j++) {
      if (prices[i] > prices[i - j] || prices[i] > prices[i + j]) isLow = false;
      if (prices[i] < prices[i - j] || prices[i] < prices[i + j]) isHigh = false;
    }
    if (isLow) swingLows.push(prices[i]);
    if (isHigh) swingHighs.push(prices[i]);
  }

  // Step 2: Cluster nearby swing points into zones
  // Use a tolerance based on the price range
  const range = Math.max(...prices) - Math.min(...prices);
  const tolerance = range * 0.06; // 6% of range

  function findBestCluster(swings: number[]): number {
    if (swings.length === 0) return prices[prices.length - 1];
    // Count how many swing points fall near each swing point
    let bestLevel = swings[0], bestCount = 0;
    for (const level of swings) {
      const count = swings.filter(s => Math.abs(s - level) < tolerance).length;
      if (count > bestCount) { bestCount = count; bestLevel = level; }
    }
    // Return the average of all points in the best cluster
    const cluster = swings.filter(s => Math.abs(s - bestLevel) < tolerance);
    return cluster.reduce((a, b) => a + b, 0) / cluster.length;
  }

  const support = findBestCluster(swingLows);
  let resistance = findBestCluster(swingHighs);

  // Make sure resistance is above support
  if (resistance <= support) {
    // Find second-best cluster for highs that's above support
    const highsAbove = swingHighs.filter(h => h > support + tolerance);
    resistance = highsAbove.length > 0 ? findBestCluster(highsAbove) : Math.max(...prices) - range * 0.1;
  }

  return { support, resistance };
}

// ============================================================
// CHART DRAWING UTILITY
// ============================================================
function drawPriceChart(ctx: CanvasRenderingContext2D, W: number, H: number, prices: number[], opts?: {
  lines?: { y: number; color: string; label: string; dashed?: boolean }[];
  zones?: { y1: number; y2: number; color: string; label: string }[];
  highlightBounces?: { priceLevel: number; tolerance: number; color: string }[];
}) {
  const pad = { t: 15, b: 15, l: 8, r: 8 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const min = Math.min(...prices) - 2, max = Math.max(...prices) + 2;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * cw;
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) { const y = pad.t + (i / 5) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Zones
  opts?.zones?.forEach(z => {
    const y1 = toY(z.y1), y2 = toY(z.y2);
    ctx.fillStyle = z.color;
    ctx.fillRect(pad.l, Math.min(y1, y2), cw, Math.abs(y2 - y1));
    ctx.font = '600 9px sans-serif'; ctx.fillStyle = z.color.replace(/[\d.]+\)$/, '0.8)'); ctx.textAlign = 'left';
    ctx.fillText(z.label, pad.l + 6, Math.min(y1, y2) + 12);
  });

  // Lines
  opts?.lines?.forEach(l => {
    const y = toY(l.y);
    ctx.strokeStyle = l.color; ctx.lineWidth = 1;
    if (l.dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '600 8px sans-serif'; ctx.fillStyle = l.color; ctx.textAlign = 'right';
    ctx.fillText(l.label, W - pad.r - 4, y - 4);
  });

  // Bounce highlights
  opts?.highlightBounces?.forEach(b => {
    prices.forEach((p, i) => {
      if (Math.abs(p - b.priceLevel) < b.tolerance) {
        const x = toX(i), y = toY(p);
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.color.replace(/[\d.]+\)$/, '0.15)');
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      }
    });
  });

  // Candlesticks
  const bw = Math.max(1.5, (cw / prices.length) * 0.5);
  for (let i = 1; i < prices.length; i++) {
    const o = prices[i - 1], c = prices[i];
    const hi = Math.max(o, c) + Math.abs(c - o) * 0.25;
    const lo = Math.min(o, c) - Math.abs(c - o) * 0.25;
    const bull = c >= o; const x = toX(i);
    ctx.strokeStyle = bull ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x, toY(hi)); ctx.lineTo(x, toY(lo)); ctx.stroke();
    ctx.fillStyle = bull ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
    const top = toY(Math.max(o, c)), bot = toY(Math.min(o, c));
    ctx.fillRect(x - bw / 2, top, bw, Math.max(bot - top, 1));
  }

  return { toX, toY, min, max, pad };
}

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 220 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
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
// S/R FORMATION ANIMATOR — shows how bounces create levels
// ============================================================
function SRFormationDemo() {
  const [step, setStep] = useState(0);
  const maxStep = 4;

  const drawFormation = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const prices = mainPrices.slice(0, 120);

    const { support: supportLevel, resistance: resistanceLevel } = detectSR(prices);
    const range = Math.max(...prices) - Math.min(...prices);
    const tol = range * 0.06;

    const lines: any[] = [];
    const zones: any[] = [];
    const bounces: any[] = [];

    if (step >= 1) {
      bounces.push({ priceLevel: supportLevel, tolerance: tol, color: 'rgba(34,197,94,0.6)' });
    }
    if (step >= 2) {
      lines.push({ y: supportLevel, color: 'rgba(34,197,94,0.5)', label: 'SUPPORT', dashed: true });
    }
    if (step >= 3) {
      bounces.push({ priceLevel: resistanceLevel, tolerance: tol, color: 'rgba(239,68,68,0.6)' });
    }
    if (step >= 4) {
      lines.push({ y: resistanceLevel, color: 'rgba(239,68,68,0.5)', label: 'RESISTANCE', dashed: true });
      zones.push({ y1: supportLevel - tol * 0.5, y2: supportLevel + tol * 0.5, color: 'rgba(34,197,94,0.06)', label: '' });
      zones.push({ y1: resistanceLevel - tol * 0.5, y2: resistanceLevel + tol * 0.5, color: 'rgba(239,68,68,0.06)', label: '' });
    }

    drawPriceChart(ctx, W, H, prices, { lines, zones, highlightBounces: bounces });
  }, [step]);

  const stepTexts = [
    { title: 'Raw Price Action', desc: 'This is a chart with no analysis. Just candles. Look at the price — can you spot any areas where price keeps returning to?' },
    { title: 'Spot the Bounces (Support)', desc: 'See the green dots? Price dropped to this level multiple times and bounced each time. Buyers are defending this price — that\'s demand in action.' },
    { title: 'Draw the Support Line', desc: 'Connect those bounce points and you have a support level. This is where buyers consistently step in. The more bounces, the stronger the level.' },
    { title: 'Spot the Rejections (Resistance)', desc: 'Now look at the red dots above. Price rose to this level and got rejected repeatedly. Sellers are defending this ceiling — that\'s supply in action.' },
    { title: 'The Complete Picture', desc: 'Support below, resistance above. Price bounces between these two levels. This is a "range" — and it\'s the foundation of all technical analysis. Everything builds on this.' },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <AnimScene drawFn={drawFormation} height={240} />
      <div className="p-5">
        <div className="flex justify-center gap-1.5 mb-4">
          {Array.from({ length: maxStep + 1 }, (_, i) => (
            <div key={i} className={`w-6 h-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-amber-500 to-accent-500' : 'bg-white/10'}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <h4 className="font-bold text-[15px] mb-1">{stepTexts[step].title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{stepTexts[step].desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setStep(0)} className="px-4 py-2 rounded-lg glass text-xs font-semibold text-gray-500 active:scale-95"><RotateCcw className="w-3 h-3 inline mr-1" />Reset</button>
          <button onClick={() => setStep(s => Math.min(s + 1, maxStep))} disabled={step >= maxStep}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-xs active:scale-95 disabled:opacity-40">
            {step >= maxStep ? 'Complete ✓' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FLIP ZONE ANIMATOR
// ============================================================
function FlipZoneDemo() {
  const [phase, setPhase] = useState(0);

  const drawFlip = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const prices = flipPrices.slice(0, 120);
    const { support: flipLevel } = detectSR(prices);
    const range = Math.max(...prices) - Math.min(...prices);
    const tol = range * 0.06;

    const lines: any[] = [];
    const zones: any[] = [];

    if (phase === 0) {
      lines.push({ y: flipLevel, color: 'rgba(34,197,94,0.5)', label: 'SUPPORT', dashed: true });
      zones.push({ y1: flipLevel - tol * 0.5, y2: flipLevel + tol * 0.5, color: 'rgba(34,197,94,0.06)', label: '' });
    } else if (phase === 1) {
      lines.push({ y: flipLevel, color: 'rgba(239,68,68,0.5)', label: 'BREAK ↓', dashed: false });
    } else {
      lines.push({ y: flipLevel, color: 'rgba(239,68,68,0.5)', label: 'NOW RESISTANCE', dashed: true });
      zones.push({ y1: flipLevel - tol * 0.5, y2: flipLevel + tol * 0.5, color: 'rgba(239,68,68,0.06)', label: '' });
    }

    drawPriceChart(ctx, W, H, prices, { lines, zones });
  }, [phase]);

  const phases = [
    { title: 'Step 1: Price Respects Support', desc: 'Price bounces off this level — buyers are defending it. It\'s acting as a floor.' },
    { title: 'Step 2: Support Breaks', desc: 'Eventually, selling pressure overwhelms the buyers. Price crashes through the level. The "floor" is broken.' },
    { title: 'Step 3: Old Support = New Resistance', desc: 'When price tries to come back up, the old support now acts as a ceiling. Those who bought at support are now trapped — they sell to break even, creating resistance. This is the "flip".' },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <AnimScene drawFn={drawFlip} height={220} />
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <h4 className="font-bold text-[15px] mb-1">{phases[phase].title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{phases[phase].desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-4">
          {phases.map((_, i) => (
            <button key={i} onClick={() => setPhase(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${phase === i ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'glass text-gray-500'}`}>
              Step {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DRAW YOUR OWN S/R GAME
// ============================================================
function DrawSRGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userLines, setUserLines] = useState<number[]>([]);
  const [scored, setScored] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const prices = mainPrices.slice(20, 160);
  const priceMin = Math.min(...prices) - 2, priceMax = Math.max(...prices) + 2;

  // Detect actual S/R from the price data using swing point clustering
  const { support: actualSupport, resistance: actualResistance } = detectSR(prices);

  useEffect(() => {
    const c = canvasRef.current, d = containerRef.current; if (!c || !d) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const r = d.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const w = r.width, h = r.height;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, w, h);

    // Draw chart
    const { toY } = drawPriceChart(ctx, w, h, prices);

    // Draw user lines
    userLines.forEach((priceLevel, i) => {
      const y = toY(priceLevel);
      ctx.strokeStyle = i === 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)';
      ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(w - 8, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '600 9px sans-serif'; ctx.fillStyle = i === 0 ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)';
      ctx.textAlign = 'right';
      ctx.fillText(i === 0 ? 'YOUR SUPPORT' : 'YOUR RESISTANCE', w - 12, y - 5);
    });

    // If scored, show actual levels
    if (scored) {
      [{ level: actualSupport, label: 'ACTUAL SUPPORT', col: 'rgba(34,197,94,' },
       { level: actualResistance, label: 'ACTUAL RESISTANCE', col: 'rgba(239,68,68,' }].forEach(a => {
        const y = toY(a.level);
        ctx.strokeStyle = a.col + '0.9)'; ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(w - 8, y); ctx.stroke();
        ctx.font = '700 10px sans-serif'; ctx.fillStyle = a.col + '1)'; ctx.textAlign = 'left';
        ctx.fillText(a.label, 12, y - 6);
      });
    }
  }, [userLines, scored, prices, actualSupport, actualResistance]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (scored || userLines.length >= 2) return;
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const h = rect.height;
    const pad = { t: 15, b: 15 };
    const ch = h - pad.t - pad.b;
    const pct = 1 - (clickY - pad.t) / ch;
    const priceLevel = priceMin + pct * (priceMax - priceMin);
    setUserLines([...userLines, priceLevel]);
  };

  const checkScore = () => {
    if (userLines.length < 2) return;
    setScored(true);
    const tolerance = (priceMax - priceMin) * 0.08; // 8% tolerance
    let pts = 0;
    // Check if either line is near support
    const nearSupport = userLines.some(l => Math.abs(l - actualSupport) < tolerance);
    const nearResistance = userLines.some(l => Math.abs(l - actualResistance) < tolerance);
    if (nearSupport) pts += 50;
    if (nearResistance) pts += 50;
    setScore(pts);
    setFeedback(pts === 100 ? '🎯 Perfect! You nailed both levels.' : pts === 50 ? '👍 Good — you got one right. The other was off.' : '📚 Not quite. Compare your lines to the actual levels and see the difference.');
  };

  const reset = () => { setUserLines([]); setScored(false); setScore(0); setFeedback(''); };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {userLines.length === 0 ? 'Tap to place SUPPORT' : userLines.length === 1 ? 'Now tap to place RESISTANCE' : scored ? `Score: ${score}/100` : 'Ready to check?'}
        </span>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-white transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
      </div>
      <div ref={containerRef} className="w-full cursor-crosshair" style={{ height: 260 }}>
        <canvas ref={canvasRef} onClick={handleClick} />
      </div>
      <div className="p-4">
        {userLines.length >= 2 && !scored && (
          <button onClick={checkScore} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-all">
            Check My Levels
          </button>
        )}
        {scored && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-3 rounded-xl text-sm text-center mb-3 ${score >= 50 ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {feedback}
            </div>
            <button onClick={reset} className="w-full py-2.5 rounded-xl glass text-xs font-semibold text-amber-400 active:scale-95">Try Again</button>
          </motion.div>
        )}
        {userLines.length === 0 && !scored && (
          <p className="text-xs text-gray-500 text-center">Tap on the chart where you think <strong className="text-green-400">support</strong> is, then where <strong className="text-red-400">resistance</strong> is.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "What IS support?", opts: ["A line the broker draws for you", "A price level where buying pressure prevents further decline", "The lowest price ever reached", "Where you place your stop loss"], correct: 1, explain: "Support is where demand (buying pressure) is strong enough to halt a decline. Buyers see value at this price and step in." },
  { q: "What happens when support 'flips' to resistance?", opts: ["The chart breaks", "The old support level now acts as a ceiling that rejects price from below", "Nothing — levels don't flip", "Price always breaks through"], correct: 1, explain: "When support breaks, traders who bought there are now trapped. If price returns, they sell to escape at breakeven — their selling turns the old floor into a new ceiling." },
  { q: "Which makes a level STRONGER?", opts: ["More bounces/tests over time", "Being drawn with a thicker line", "Being on a 1-minute chart", "Having a round number"], correct: 0, explain: "The more times price tests a level and bounces, the more significant that level becomes. Each bounce confirms that buyers or sellers are actively defending it." },
  { q: "Support and resistance are best drawn as:", opts: ["Exact price lines to the penny", "Zones/areas rather than exact lines", "Only on daily charts", "Randomly across the chart"], correct: 1, explain: "Markets are messy. S/R works as ZONES — price may overshoot or undershoot by a few pips. Drawing zones rather than exact lines gives you more reliable levels." },
  { q: "A 'psychological level' like $100.00 or 1.3000 is significant because:", opts: ["Banks set prices there", "Large numbers of traders place orders at round numbers", "The chart looks prettier", "It's always the strongest level"], correct: 1, explain: "Round numbers attract attention. Thousands of traders set buy/sell orders, take profits, and stop losses at round numbers — creating natural S/R." },
  { q: "Price has bounced off $50 three times. On the 4th test it breaks below. What does this mean?", opts: ["Support failed and may flip to resistance", "Support is now stronger", "You should buy immediately", "Nothing — ignore it"], correct: 0, explain: "When a level that has held multiple times finally breaks, it's significant. The old support at $50 will likely act as resistance if price tries to recover." },
  { q: "Which timeframe's S/R levels carry the most weight?", opts: ["1-minute", "15-minute", "Daily/Weekly", "They all carry equal weight"], correct: 2, explain: "Higher timeframe levels (Daily, Weekly) represent more market participants and capital. A level on the Daily chart is far more significant than one on the 5-minute chart." },
];

// ============================================================
// CONFETTI
// ============================================================
function GoldConfetti({ active }: { active: boolean }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = cRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const cols = ['#f59e0b', '#fbbf24', '#d946ef', '#0ea5e9', '#fcd34d', '#e879f9'];
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
export default function SupportResistanceLesson() {
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
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.07),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO — Level 2: Technical Analysis</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Support &<br /><span className="bg-gradient-to-r from-green-400 via-amber-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Resistance</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            The single most important concept in technical analysis. Every indicator, every pattern, every strategy is built on this foundation.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Animated Formation</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Draw Your Own</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Flip Zone Demo</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> 7 Questions</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What is S/R */}
      
      {/* Section 00: Real-World Analogy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">First — Why This Matters</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-4">A Ball Between Floor &amp; Ceiling</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">Throw a rubber ball in a room. It hits the ceiling and bounces down. It hits the floor and bounces up. It keeps bouncing between the two — until someone opens a door and it escapes. <strong className="text-white">That&apos;s exactly how price moves between support and resistance.</strong></motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Support is the floor. Resistance is the ceiling. Price bounces between them. When the &quot;door opens&quot; (a level breaks), price escapes and moves fast. If you can identify these levels, you know where to buy, where to sell, and when a breakout is happening.</motion.p>
          <motion.div variants={fadeUp} className="p-5 glass-card rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
            <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Real scenario:</strong> Bitcoin has bounced off $60,000 four times this month. You see it dropping toward $60,000 again. Instead of panicking, you place a buy order at $60,200 with a stop at $59,500. Price bounces again, rallies to $64,000. <strong className="text-white">You made $3,800 per BTC because you knew the floor.</strong></p>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Foundation</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is Support & Resistance?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">
            <strong className="text-white">Support</strong> is a price level where buying pressure is strong enough to stop price from falling further. Think of it as a floor.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">
            <strong className="text-white">Resistance</strong> is a price level where selling pressure stops price from rising further. Think of it as a ceiling.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">
            These levels exist because <strong className="text-white">thousands of traders are watching the same prices</strong>. When everyone agrees a price is &quot;cheap&quot;, they buy — creating support. When everyone agrees it&apos;s &quot;expensive&quot;, they sell — creating resistance.
          </motion.p>
        </motion.div>

        {[
          { icon: '🟢', title: 'Support = Demand Zone', desc: 'Buyers see value here. Orders stack up. Price bounces. The more times it bounces, the more traders trust it, and the stronger it gets.', border: 'border-l-green-500' },
          { icon: '🔴', title: 'Resistance = Supply Zone', desc: 'Sellers take profit or open shorts here. Price gets rejected. Each rejection reinforces the level as a ceiling for future price action.', border: 'border-l-red-500' },
          { icon: '📐', title: 'Zones, Not Lines', desc: 'Markets are messy. S/R works as zones (areas), not exact prices. A support "zone" might span 5-10 pips. Draw areas, not precise lines.', border: 'border-l-amber-500' },
          { icon: '🔢', title: 'Psychological Levels', desc: 'Round numbers ($100, $50,000, 1.3000) naturally attract orders. Thousands of traders set stops and limits at round numbers, creating self-fulfilling S/R.', border: 'border-l-primary-500' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`p-5 glass-card rounded-2xl mb-3 border-l-4 ${item.border}`}>
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">{item.icon}</span><h4 className="font-bold text-[15px]">{item.title}</h4></div>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Section 2: Watch S/R Form */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — Watch It Form</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">How S/R Levels Are Born</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Step through this chart and watch how bounces and rejections reveal hidden support and resistance levels.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SRFormationDemo />
        </motion.div>
      </section>

      {/* Section 3: The Flip */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — The Flip</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">When Support Becomes Resistance</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">One of the most powerful concepts in all of trading. When a level breaks, it <strong className="text-white">switches roles</strong>. This is called the Support-Resistance Flip.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <FlipZoneDemo />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-4 p-4 glass rounded-2xl">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            <strong className="text-amber-400">Why does this work?</strong> Traders who bought at support are now underwater. When price returns to their entry, they sell to escape at breakeven. Their selling creates resistance at the exact same level.
          </p>
        </motion.div>
      </section>

      {/* Section 4: Strength Rating */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — How Strong Is This Level?</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">The S/R Strength Checklist</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Not all levels are equal. Use this checklist to rate any S/R level from weak to fortress-grade.</motion.p>
        </motion.div>

        {[
          { factor: 'Number of Touches', desc: 'More bounces = stronger level. 2 touches is minimum. 3+ is significant. 5+ is a fortress.', weight: 5 },
          { factor: 'Timeframe', desc: 'A level on the Daily chart crushes one on the 5-minute. Weekly levels are the strongest of all.', weight: 5 },
          { factor: 'Volume at Level', desc: 'High volume bounces are more meaningful. It means serious money is defending that price.', weight: 4 },
          { factor: 'Recency', desc: 'A level tested last week is more relevant than one tested 6 months ago. Markets have short memories.', weight: 3 },
          { factor: 'Clean Rejections', desc: 'Sharp, V-shaped bounces are stronger than slow, sloppy ones. Clean rejections show decisive buying/selling.', weight: 4 },
          { factor: 'Confluence', desc: 'A level that aligns with a Fibonacci level, a moving average, AND a round number? That\'s high-probability.', weight: 5 },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 glass-card rounded-2xl mb-3 hover:translate-x-1 transition-all">
            <div className="flex-shrink-0">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, j) => (
                  <div key={j} className={`w-2 h-6 rounded-sm ${j < item.weight ? 'bg-amber-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[15px] mb-1">{item.factor}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Section 5: Draw Your Own */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Your Turn</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Draw Your Own Levels</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Look at this chart. Tap once to place your <strong className="text-green-400">support</strong> line, then again for <strong className="text-red-400">resistance</strong>. We&apos;ll score how close you are to the actual levels.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <DrawSRGame />
        </motion.div>
      </section>

      {/* Section 6: Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Avoid These Mistakes</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-6">Where Traders Go Wrong</motion.h2>
        </motion.div>

        {[
          { wrong: 'Drawing dozens of lines on every chart', right: 'Focus on the 2-3 MOST obvious levels. If it\'s not obvious, it\'s not significant.', icon: '🎯' },
          { wrong: 'Using exact prices ("support is at 1.27432")', right: 'Use zones. "Support zone between 1.2730-1.2750." Markets don\'t respect the 5th decimal.', icon: '📐' },
          { wrong: 'Only looking at your trading timeframe', right: 'Always check the Daily/Weekly chart first. Higher timeframe levels override lower ones.', icon: '📊' },
          { wrong: 'Expecting levels to hold forever', right: 'Every level eventually breaks. The question is not IF but WHEN. Always have a plan for the break.', icon: '💔' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5 mb-3">
            <span className="text-xl">{item.icon}</span>
            <div className="flex items-start gap-3 mt-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold flex-shrink-0">✗</div>
              <p className="text-sm text-red-400 font-semibold">{item.wrong}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">✓</div>
              <p className="text-sm text-green-400 font-semibold">{item.right}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Section 7: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">07 — Assessment</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">S/R Mastery Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">7 questions. Prove you can identify, evaluate, and trade support and resistance.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Flawless. S/R is in your blood now.' : score >= 66 ? 'Solid. You understand the most important concept in TA.' : 'Review sections 1-4 and try again.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">🎯</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.1: Support & Resistance</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Level Reader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.2 — Trendlines & Channels</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
