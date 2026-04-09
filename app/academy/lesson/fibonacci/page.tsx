// app/academy/lesson/fibonacci/page.tsx
// ATLAS Academy — Lesson 2.10: Fibonacci Retracements [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const FIB_LEVELS = [
  { level: 0, pct: '0%', color: '#6b7280', label: 'Swing High' },
  { level: 0.236, pct: '23.6%', color: '#22c55e', label: 'Shallow — trend very strong' },
  { level: 0.382, pct: '38.2%', color: '#0ea5e9', label: 'Common — healthy pullback' },
  { level: 0.5, pct: '50%', color: '#f59e0b', label: 'The midpoint — psychological' },
  { level: 0.618, pct: '61.8%', color: '#ef4444', label: 'Golden ratio — strongest level' },
  { level: 0.786, pct: '78.6%', color: '#a855f7', label: 'Deep — last chance for trend' },
  { level: 1, pct: '100%', color: '#6b7280', label: 'Swing Low' },
];

// ============================================================
// PRICE DATA GENERATORS
// ============================================================
function genFibScenario(bounceLevel: number, seed: number): { prices: number[]; swingHighIdx: number; swingLowIdx: number; bounceIdx: number } {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;

  // Uptrend to swing high
  for (let i = 0; i < 20; i++) { price += 0.5 + (rand() - 0.4) * 1.5; p.push(price); }
  const swingHighIdx = p.length - 1;
  const swingHigh = price;

  // Pullback to the specific Fib level
  const pullbackTarget = swingHigh - (swingHigh - 100) * bounceLevel;
  const pullbackSteps = 12 + Math.floor(rand() * 6);
  const stepSize = (price - pullbackTarget) / pullbackSteps;
  for (let i = 0; i < pullbackSteps; i++) {
    price -= stepSize + (rand() - 0.5) * 0.8;
    p.push(price);
  }
  // Ensure we actually hit the level
  price = pullbackTarget + (rand() - 0.5) * 0.5;
  p.push(price);
  const swingLowIdx = 20; // approximate
  const bounceIdx = p.length - 1;

  // Bounce and continuation
  for (let i = 0; i < 15; i++) { price += 0.4 + (rand() - 0.3) * 1.2; p.push(price); }

  return { prices: p, swingHighIdx, swingLowIdx: 0, bounceIdx };
}

function genMainChart(seed: number): number[] {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 90;
  // Strong uptrend
  for (let i = 0; i < 25; i++) { price += 0.6 + (rand() - 0.4) * 1.5; p.push(price); }
  // Pullback to ~61.8%
  const high = price;
  const range = high - 90;
  const target = high - range * 0.618;
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    price = high - (high - target) * t + (rand() - 0.5) * 1;
    p.push(price);
  }
  // Bounce
  for (let i = 0; i < 20; i++) { price += 0.5 + (rand() - 0.35) * 1.2; p.push(price); }
  return p;
}

// ============================================================
// ANIMATED SCENE
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
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// GOLDEN SPIRAL ANIMATION
// ============================================================
function SpiralAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.5;
    const progress = Math.min((f % 300) / 200, 1);
    const maxAngle = progress * Math.PI * 6;

    // Draw golden spiral
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    for (let a = 0; a < maxAngle; a += 0.02) {
      const r = 3 * Math.pow(1.1618, a);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (x < 0 || x > w || y < 0 || y > h) break;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Golden ratio number
    const textAlpha = Math.min(progress * 3, 1);
    ctx.globalAlpha = textAlpha;
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('1.618', cx, 28);
    ctx.font = '11px system-ui';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('The Golden Ratio — φ (phi)', cx, 46);

    // Fib numbers along the bottom
    if (progress > 0.3) {
      const fibs = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      const startX = 30;
      const spacing = (w - 60) / (fibs.length - 1);
      for (let i = 0; i < fibs.length; i++) {
        const alpha = Math.min((progress - 0.3) * 5 - i * 0.3, 1);
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(String(fibs[i]), startX + i * spacing, h - 12);
        if (i > 0) {
          ctx.fillStyle = '#374151';
          ctx.fillText('+', startX + (i - 0.5) * spacing, h - 12);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// FIB CHART — draws price with Fibonacci levels
// ============================================================
function FibChart({ prices, showLevels = true, highlightLevel, height = 320 }: {
  prices: number[]; showLevels?: boolean; highlightLevel?: number; height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const w = rect.width, h = rect.height;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    const pMin = Math.min(...prices) - 2;
    const pMax = Math.max(...prices) + 2;
    const pRange = pMax - pMin;
    const len = prices.length;

    const px = (i: number) => 15 + (i / (len - 1)) * (w - 80);
    const py = (p: number) => 15 + (h - 30) * (1 - (p - pMin) / pRange);

    // Find swing high and swing low for Fib
    let swHigh = prices[0], swHighIdx = 0;
    for (let i = 0; i < Math.min(30, len); i++) {
      if (prices[i] > swHigh) { swHigh = prices[i]; swHighIdx = i; }
    }
    let swLow = prices[swHighIdx];
    for (let i = swHighIdx; i < len; i++) {
      if (prices[i] < swLow) { swLow = prices[i]; }
    }
    const swRange = swHigh - swLow;

    // Fib levels
    if (showLevels && swRange > 0) {
      for (const fib of FIB_LEVELS) {
        const levelPrice = swHigh - swRange * fib.level;
        const y = py(levelPrice);
        const isHighlighted = highlightLevel !== undefined && Math.abs(fib.level - highlightLevel) < 0.05;

        ctx.setLineDash(fib.level === 0 || fib.level === 1 ? [] : [6, 4]);
        ctx.strokeStyle = isHighlighted ? fib.color : fib.color + '40';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(px(swHighIdx), y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on right
        ctx.fillStyle = isHighlighted ? fib.color : fib.color + '80';
        ctx.font = `${isHighlighted ? 'bold ' : ''}9px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillText(`${fib.pct}`, w - 5, y - 3);

        if (isHighlighted) {
          // Highlight zone
          ctx.fillStyle = fib.color + '10';
          ctx.fillRect(px(swHighIdx), y - 6, w - px(swHighIdx) - 12, 12);
          // Bounce dot
          ctx.beginPath();
          ctx.arc(px(swHighIdx + Math.floor((len - swHighIdx) * 0.5)), y, 5, 0, Math.PI * 2);
          ctx.fillStyle = fib.color;
          ctx.fill();
        }
      }
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();

    // Swing markers
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px(swHighIdx), py(swHigh), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH', px(swHighIdx), py(swHigh) - 8);
  }, [prices, showLevels, highlightLevel, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// INTERACTIVE FIB CALCULATOR
// ============================================================
function FibCalculator() {
  const [high, setHigh] = useState(1850);
  const [low, setLow] = useState(1720);
  const range = high - low;

  return (
    <div className="p-5 rounded-2xl glass-card">
      <h3 className="font-bold text-white text-sm mb-4">🧮 Interactive Fib Level Calculator</h3>
      <p className="text-xs text-gray-400 mb-4">Enter any swing high and swing low. The calculator shows every Fib level with the exact price.</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">Swing High</label>
          <input type="number" value={high} onChange={e => setHigh(Number(e.target.value))}
            className="w-full mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-gray-700 text-white text-sm font-mono focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider">Swing Low</label>
          <input type="number" value={low} onChange={e => setLow(Number(e.target.value))}
            className="w-full mt-1 p-2.5 rounded-lg bg-[#0d1320] border border-gray-700 text-white text-sm font-mono focus:border-amber-500 focus:outline-none" />
        </div>
      </div>

      <div className="space-y-1.5">
        {FIB_LEVELS.filter(f => f.level > 0 && f.level < 1).map(fib => {
          const price = high - range * fib.level;
          return (
            <div key={fib.pct} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: fib.color + '08', borderLeft: `3px solid ${fib.color}` }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold" style={{ color: fib.color }}>{fib.pct}</span>
                <span className="text-xs text-gray-500">{fib.label}</span>
              </div>
              <span className="font-mono text-sm font-bold text-white">${price.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <p className="text-xs text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">Try it:</strong> Enter Gold&apos;s recent swing high ($1,850) and swing low ($1,720). The 61.8% level at ${(high - range * 0.618).toFixed(2)} is where institutions are most likely to buy the dip. The 50% at ${(high - range * 0.5).toFixed(2)} is the psychological halfway point.</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function FibonacciLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [seqStep, setSeqStep] = useState(8);
  const [activeLevelDetail, setActiveLevelDetail] = useState<string | null>(null);

  const mainPrices = useMemo(() => genMainChart(42), []);

  // Fibonacci sequence
  const fibSequence = useMemo(() => {
    const seq = [1, 1];
    for (let i = 2; i < 15; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }, []);

  // Ratios demonstration
  const fibRatios = useMemo(() => {
    return fibSequence.slice(2).map((n, i) => ({
      pair: `${fibSequence[i + 1]} / ${n}`,
      ratio: (fibSequence[i + 1] / n).toFixed(4),
      approaching: '0.6180',
    }));
  }, [fibSequence]);

  // Game
  const gameLevels = useMemo(() => [0.382, 0.618, 0.236, 0.5, 0.786], []);
  const gameLevelNames = ['38.2%', '61.8%', '23.6%', '50%', '78.6%'];
  const gameOptions = ['23.6%', '38.2%', '50%', '61.8%', '78.6%'];
  const gameCorrectIdx = [1, 3, 0, 2, 4]; // maps gameLevels to gameOptions index
  const gamePrices = useMemo(() => gameLevels.map((lv, i) => genFibScenario(lv, 600 + i * 47)), [gameLevels]);

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameCorrectIdx[gameRound]) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'The Golden Ratio (1.618) is derived from the Fibonacci sequence by:', opts: ['Adding all numbers together', 'Dividing each number by the next one', 'Dividing each number by the PREVIOUS one', 'Multiplying by 2'], a: 2, explain: 'Each Fibonacci number divided by the one before it approaches 1.618. Example: 89/55 = 1.618. This ratio appears throughout nature and, remarkably, in market price action.' },
    { q: 'Which Fibonacci level is considered the "Golden Pocket" — the strongest retracement level?', opts: ['23.6%', '38.2%', '50%', '61.8%'], a: 3, explain: 'The 61.8% retracement is the Golden Ratio itself — the most watched level in all of Fibonacci analysis. When price pulls back exactly 61.8% and bounces, it\'s one of the highest-probability setups in trading.' },
    { q: 'A 23.6% retracement suggests the trend is:', opts: ['Extremely strong — barely any pullback', 'Moderately healthy', 'Showing weakness', 'About to reverse'], a: 0, explain: 'A shallow 23.6% pullback means buyers/sellers are so dominant they barely let price retrace. The trend is very strong and likely to continue aggressively.' },
    { q: 'If a stock rallies from $100 to $150, where is the 50% Fibonacci retracement?', opts: ['$125', '$110', '$130', '$75'], a: 0, explain: '$150 - $100 = $50 range. 50% of $50 = $25. $150 - $25 = $125. The 50% level is always the midpoint between swing high and swing low.' },
    { q: 'Fibonacci extensions are used for:', opts: ['Measuring how far price has already moved', 'Calculating potential profit targets beyond the swing high', 'Identifying support levels', 'Setting stop losses only'], a: 1, explain: 'Extensions project BEYOND the original move. Common targets are 127.2% and 161.8%. If a stock bounces from a Fib level, extensions tell you where it might go next — your take-profit zones.' },
    { q: 'Why does the 50% level work even though it\'s not technically a Fibonacci number?', opts: ['It\'s actually 50.5% which is Fibonacci', 'It\'s pure coincidence', 'It\'s the psychological halfway point — traders instinctively watch it', 'It doesn\'t actually work'], a: 2, explain: '50% isn\'t derived from the Fibonacci sequence, but it works because of psychology. Humans naturally think about "halfway" — it\'s a psychological anchor point that becomes self-fulfilling.' },
    { q: 'Fibonacci works best when combined with:', opts: ['Only other Fibonacci tools', 'Support/resistance, volume, and candlestick patterns', 'News events only', 'Random entry points'], a: 1, explain: 'Confluence is king. A 61.8% Fib level that ALSO aligns with a strong support zone, has a bullish engulfing candle, and rising volume is far more reliable than the Fib level alone.' },
    { q: 'A price retracing to the 78.6% level typically means:', opts: ['The trend is about to reverse completely', 'The trend is deeply pulled back — last chance for the trend to hold', 'The Fibonacci tool was drawn incorrectly', 'Nothing meaningful'], a: 1, explain: 'A 78.6% retracement is a deep pullback. The trend CAN still hold, but it\'s the last line of defence. If 78.6% breaks, the trend is likely dead and a full reversal is underway.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(8).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Level details
  const levelDetails: Record<string, { title: string; desc: string; trading: string; strength: number }> = {
    '23.6': { title: '23.6% — The Shallow Pullback', desc: 'Price barely retraces. Like an Olympic sprinter who pauses for half a second — the trend is THAT strong. Sellers tried but got immediately overpowered.', trading: 'Use in very strong trends. If price only pulls back to 23.6% and bounces, the trend has exceptional momentum. Enter aggressively with a tight stop just below the level.', strength: 2 },
    '38.2': { title: '38.2% — The Healthy Retracement', desc: 'The most common "normal" pullback. Like a rubber ball bouncing — it falls about a third of the way back before continuing. This is what a healthy trend looks like.', trading: 'The "bread and butter" level. Most institutional traders consider 38.2% the ideal entry point in a pullback. Place your buy order here with a stop below 50%.', strength: 4 },
    '50': { title: '50% — The Psychological Midpoint', desc: 'Not technically Fibonacci but universally watched. Humans instinctively think about "halfway." If you bought at $100 and price went to $200, $150 (halfway) feels significant — and because EVERYONE thinks that, it becomes a self-fulfilling prophecy.', trading: 'Strong support/resistance zone. Often acts as a decision point — if 50% holds, the trend is healthy. If it breaks, expect 61.8% to be tested. Many traders place limit orders exactly at 50%.', strength: 3 },
    '61.8': { title: '61.8% — The Golden Pocket ✨', desc: 'THE most important Fibonacci level. The Golden Ratio itself (1/1.618 = 0.618). This appears in sunflower seed arrangements, hurricane spiral arms, galaxy formations — and, remarkably, in market price movements. When price pulls back exactly 61.8%, it\'s hitting the mathematical heartbeat of nature.', trading: 'The highest-probability bounce zone. Institutions load buy orders here. When 61.8% aligns with support/resistance, it creates a "golden pocket" — the most powerful confluence in technical analysis. Set your entry, set your stop below 78.6%, target the previous high.', strength: 5 },
    '78.6': { title: '78.6% — The Deep Pullback', desc: 'The last line of defence. Like a boxer on the ropes — they CAN fight back, but they\'re in serious trouble. 78.6% is the square root of 61.8% (0.786² ≈ 0.618), giving it mathematical significance.', trading: 'High risk, high reward. If price bounces from 78.6%, you\'re getting an incredible entry near the bottom. But if 78.6% BREAKS, the trend is dead — full reversal underway. Always use a tight stop below the swing low.', strength: 3 },
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO</span></div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 10</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Fibonacci Retracements</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Nature&apos;s mathematical blueprint — hidden in markets, sunflowers, and galaxies alike.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🌻 Nature has a favourite number: 1.618</p>
            <p className="text-gray-400 leading-relaxed mb-4">It appears in sunflower seed spirals, hurricane arms, seashell curves, DNA helixes, and galaxy formations. It&apos;s called the <strong className="text-amber-400">Golden Ratio</strong> — and it shows up in financial markets too.</p>
            <p className="text-gray-400 leading-relaxed mb-4">When a stock rallies from $100 to $200, it doesn&apos;t usually pull back randomly. It tends to retrace to specific levels — <strong className="text-white">23.6%, 38.2%, 50%, 61.8%, or 78.6%</strong> — all derived from the Fibonacci sequence. Millions of traders worldwide watch these exact levels, which makes them self-fulfilling prophecies.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">The result?</strong> Fibonacci gives you a mathematical framework to predict where price will STOP falling and START bouncing. It turns &quot;I think it might bounce here&quot; into &quot;The math says it should bounce here, and so do 10 million other traders.&quot;</p>
          </div>

          <SpiralAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">Apple (AAPL) rallied from $124 to $182 in 2023. When it pulled back, it found support at exactly $146.20 — the <strong className="text-amber-400">61.8% Fibonacci retracement</strong>. Traders who knew this level placed buy orders there, rode the bounce back to $182, and captured a $36/share move. <em className="text-amber-400">The Golden Ratio told them the price before the market did.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE SEQUENCE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Fibonacci Sequence</p>
          <h2 className="text-2xl font-extrabold mb-4">Where the Magic Numbers Come From</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Leonardo Fibonacci discovered this sequence in 1202. It starts with 1, 1, and each number is the sum of the two before it. Simple — but the RATIOS between these numbers are where the magic lives.</p>

          {/* Interactive sequence */}
          <div className="p-5 rounded-2xl glass-card mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Showing {seqStep} numbers</span>
              <div className="flex gap-2">
                <button onClick={() => setSeqStep(Math.max(3, seqStep - 1))} className="px-3 py-1 rounded-lg glass text-xs text-gray-400">−</button>
                <button onClick={() => setSeqStep(Math.min(14, seqStep + 1))} className="px-3 py-1 rounded-lg glass text-xs text-gray-400">+</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {fibSequence.slice(0, seqStep).map((n, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                  <span className="font-mono font-bold text-amber-400 text-sm">{n}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500">💡 Each number = sum of previous two: {fibSequence[seqStep - 3]} + {fibSequence[seqStep - 2]} = <strong className="text-amber-400">{fibSequence[seqStep - 1]}</strong></p>
          </div>

          {/* Ratio revelation */}
          <div className="p-5 rounded-2xl glass-card">
            <h3 className="font-bold text-white text-sm mb-3">🔢 The Hidden Ratios</h3>
            <p className="text-xs text-gray-400 mb-4">Divide any Fibonacci number by the one BEFORE it. Watch what happens as the numbers get larger...</p>
            <div className="space-y-1.5 mb-4">
              {fibRatios.slice(0, 7).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0d1320]">
                  <span className="font-mono text-xs text-gray-400">{r.pair}</span>
                  <span className={`font-mono text-xs font-bold ${i >= 4 ? 'text-amber-400' : 'text-gray-300'}`}>{r.ratio}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">They all approach 0.6180!</strong> That&apos;s the inverse of the Golden Ratio (1/1.618). And 1 - 0.618 = 0.382. And 0.618² = 0.382. These numbers are mathematically connected — and they&apos;re the exact levels we use for trading.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — INTERACTIVE CHART */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Fibonacci on a Chart</p>
          <h2 className="text-2xl font-extrabold mb-4">See Every Level in Action</h2>
          <p className="text-sm text-gray-400 mb-6">This chart shows a rally, a pullback to the 61.8% Golden Pocket, and a bounce. The coloured horizontal lines are the Fibonacci retracement levels drawn from the swing high to the swing low.</p>

          <FibChart prices={mainPrices} height={340} highlightLevel={0.618} />

          <div className="mt-4 flex flex-wrap gap-2">
            {FIB_LEVELS.filter(f => f.level > 0 && f.level < 1).map(fib => (
              <div key={fib.pct} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: fib.color + '10', border: `1px solid ${fib.color}30` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: fib.color }} />
                <span className="text-[10px] font-mono font-bold" style={{ color: fib.color }}>{fib.pct}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">How to read this:</strong> Price rallied from the left, hit a peak (swing high), then pulled back. The horizontal lines show where Fibonacci predicts price might find support. In this case, price bounced right at the 61.8% level — the Golden Pocket — before resuming the uptrend.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — LEVEL DEEP DIVES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — Each Level Explained</p>
          <h2 className="text-2xl font-extrabold mb-3">What Each Level Means for Your Trading</h2>
          <p className="text-sm text-gray-400 mb-6">Tap any level for the full breakdown — what it means, how to trade it, and how strong it is.</p>

          <div className="space-y-3">
            {Object.entries(levelDetails).map(([key, det]) => {
              const fib = FIB_LEVELS.find(f => f.pct.startsWith(key));
              const isOpen = activeLevelDetail === key;
              return (
                <motion.div key={key} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActiveLevelDetail(isOpen ? null : key)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-10 rounded-full" style={{ background: fib?.color }} />
                      <div>
                        <h3 className="font-bold text-white text-sm">{det.title}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="w-3 h-1.5 rounded-full" style={{ background: i < det.strength ? fib?.color : '#1f2937' }} />
                          ))}
                          <span className="text-[10px] text-gray-500 ml-1">Strength</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-5 space-y-3">
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-sm text-gray-300 leading-relaxed">💡 {det.desc}</p></div>
                          <div><p className="text-xs font-bold text-amber-400 mb-1">📈 HOW TO TRADE IT</p><p className="text-sm text-gray-400 leading-relaxed">{det.trading}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — CALCULATOR */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Try It Yourself</p>
          <h2 className="text-2xl font-extrabold mb-6">Fib Level Calculator</h2>
          <FibCalculator />
        </motion.div>
      </section>

      {/* SECTION 05 — EXTENSIONS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Fibonacci Extensions</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Will Price Go NEXT?</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Retracements tell you where price might bounce. Extensions tell you where price might GO after the bounce — your profit targets.</p>

          <div className="space-y-3 mb-6">
            {[
              { level: '127.2%', desc: 'First extension target. Conservative take-profit. Price has exceeded the original move by 27.2%.', color: '#22c55e' },
              { level: '161.8%', desc: 'The Golden Extension. The most common profit target. In strong trends, price often reaches exactly 161.8% of the original move.', color: '#f59e0b' },
              { level: '261.8%', desc: 'Extended target for very strong trends. Aggressive — but when a trend is backed by volume and momentum, 261.8% is achievable.', color: '#ef4444' },
            ].map((ext, i) => (
              <div key={i} className="p-4 rounded-xl glass-card" style={{ borderLeft: `3px solid ${ext.color}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold" style={{ color: ext.color }}>{ext.level}</span>
                  <span className="text-xs text-gray-500">Extension</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{ext.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">The complete Fib trade:</strong> Price pulls back to the 61.8% retracement → you buy → set stop below 78.6% → target the 127.2% extension for a safe exit, or the 161.8% extension for maximum profit. The Fibonacci tool gives you entry, stop loss, AND target — the full trade plan from one tool.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 06 — CONFLUENCE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Fibonacci + Confluence</p>
          <h2 className="text-2xl font-extrabold mb-4">When Fib Meets Other Tools</h2>
          <p className="text-sm text-gray-400 mb-6">Fibonacci alone is powerful. Fibonacci with confluence is devastating.</p>

          <div className="space-y-4">
            {[
              { combo: 'Fib + Support/Resistance', power: 5, desc: 'When a Fib level lands on a previous support/resistance zone, it becomes a "fortress" level. Two independent reasons to expect a bounce = much higher probability.', example: '61.8% retracement at $1,750 AND a support zone from 3 months ago at $1,748 = near-certain bounce zone.' },
              { combo: 'Fib + Moving Average', power: 4, desc: 'When a Fib level coincides with a key moving average (50 or 200 MA), both dynamic and static support align. Institutions watch both.', example: '38.2% retracement meeting the 50 EMA. Both levels acting as a floor at the same price.' },
              { combo: 'Fib + Candlestick Pattern', power: 4, desc: 'A bullish engulfing candle AT a 61.8% level is one of the highest-probability setups in trading. The pattern confirms what the math predicted.', example: 'Price hits 61.8%, forms a Morning Star → triple confirmation: Fib level + pattern + trend.' },
              { combo: 'Fib + Volume Spike', power: 4, desc: 'High volume at a Fib level means the crowd is actively defending or attacking that level. Volume validates the math.', example: 'Volume doubles as price touches the 50% level → real buying pressure, not just a random touch.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-sm">{item.combo}</h3>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <span key={j} className={`w-2.5 h-2.5 rounded-full ${j < item.power ? 'bg-amber-400' : 'bg-gray-700'}`} />)}</div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{item.desc}</p>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-xs text-gray-300 leading-relaxed">📌 <strong className="text-amber-400">Example:</strong> {item.example}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 07 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Find the Bounce Level</p>
          <h2 className="text-2xl font-extrabold mb-2">Which Fib Level Did Price Bounce From?</h2>
          <p className="text-sm text-gray-400 mb-6">5 rounds. Study the chart with Fib levels drawn, then identify where the bounce occurred.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <FibChart prices={gamePrices[gameRound].prices} highlightLevel={gameAnswers[gameRound] !== null ? gameLevels[gameRound] : undefined} height={300} />

              <div className="mt-4 space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameCorrectIdx[gameRound];
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Price bounced at the {gameLevelNames[gameRound]} level.</strong> {Object.values(levelDetails)[gameCorrectIdx[gameRound]]?.desc || 'This is one of the key Fibonacci retracement levels that traders watch for potential reversals.'}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Round →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Golden eye! You can spot Fib bounces instantly.' : gameScore >= 3 ? 'You\'re reading the levels — keep practising.' : 'Review each level\'s position and try again.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 08 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Fibonacci Quiz</h2>
        </motion.div>
        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-2xl glass-card">
              <p className="text-sm font-bold text-white mb-3">{qi + 1}. {q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect — the Golden Ratio is your ally.' : score >= 66 ? 'Solid Fibonacci knowledge.' : 'Review the levels and the sequence section.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">🌀</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.10: Fibonacci Retracements</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Golden Ratio Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.11 — Multiple Timeframe Analysis</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
