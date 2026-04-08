// app/academy/lesson/reading-charts/page.tsx
// ATLAS Academy — Lesson 1.4: Reading Your First Chart [PRO]
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Lock, Crown, ArrowRight, Eye, Zap, Target, Award } from 'lucide-react';

// ============================================================
// PRICE DATA GENERATOR
// ============================================================
function generatePriceData(count: number, seed: number = 42, vol: number = 1): number[] {
  const prices: number[] = [100];
  let s = seed;
  for (let i = 1; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647;
    const r = (s / 2147483647) - 0.5;
    prices.push(prices[i - 1] + r * vol * 2 + Math.sin(i * 0.05) * 0.3);
  }
  return prices;
}

const priceData60 = generatePriceData(200, 42, 1.2);
const priceData15 = generatePriceData(200, 99, 0.6);
const priceDataDaily = generatePriceData(200, 17, 2.5);

// ============================================================
// ANIMATED SCENE
// ============================================================
function AnimScene({ drawFn, height = 220 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  const dRef = useRef<HTMLDivElement>(null);
  const inView = useInView(dRef, { amount: 0.1 });
  const fRef = useRef(0);
  useEffect(() => {
    const c = cRef.current, d = dRef.current; if (!c || !d) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let id: number;
    const rs = () => { const r = d.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; };
    rs(); window.addEventListener('resize', rs);
    const loop = () => { if (inView) { ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, c.width, c.height); drawFn(ctx, c.width / 2, c.height / 2, fRef.current); } fRef.current++; id = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', rs); };
  }, [inView, drawFn]);
  return <div ref={dRef} className="w-full rounded-2xl overflow-hidden" style={{ height, background: 'rgba(0,0,0,0.3)' }}><canvas ref={cRef} /></div>;
}

// ============================================================
// CHART RENDERER — draws price data as line, bar or candle
// ============================================================
function drawChart(ctx: CanvasRenderingContext2D, W: number, H: number, prices: number[], type: 'line' | 'candle' | 'bar', highlights?: { support?: number; resistance?: number; trendline?: [number, number, number, number] }) {
  const pad = { t: 20, b: 25, l: 10, r: 10 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const min = Math.min(...prices) - 1, max = Math.max(...prices) + 1;
  const toX = (i: number) => pad.l + (i / (prices.length - 1)) * cw;
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) { const y = pad.t + (i / 4) * ch; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }

  // Support/Resistance
  if (highlights?.support) {
    const y = toY(highlights.support);
    ctx.strokeStyle = 'rgba(34,197,94,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '600 9px sans-serif'; ctx.fillStyle = 'rgba(34,197,94,0.7)'; ctx.textAlign = 'left';
    ctx.fillText('SUPPORT', pad.l + 4, y - 4);
  }
  if (highlights?.resistance) {
    const y = toY(highlights.resistance);
    ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '600 9px sans-serif'; ctx.fillStyle = 'rgba(239,68,68,0.7)'; ctx.textAlign = 'left';
    ctx.fillText('RESISTANCE', pad.l + 4, y - 4);
  }
  if (highlights?.trendline) {
    const [x1, y1, x2, y2] = highlights.trendline;
    ctx.strokeStyle = 'rgba(14,165,233,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]);
    ctx.beginPath(); ctx.moveTo(toX(x1), toY(y1)); ctx.lineTo(toX(x2), toY(y2)); ctx.stroke(); ctx.setLineDash([]);
  }

  if (type === 'line') {
    // Area fill
    ctx.beginPath(); ctx.moveTo(toX(0), toY(prices[0]));
    prices.forEach((p, i) => ctx.lineTo(toX(i), toY(p)));
    ctx.lineTo(toX(prices.length - 1), H); ctx.lineTo(toX(0), H); ctx.closePath();
    const gf = ctx.createLinearGradient(0, pad.t, 0, H);
    gf.addColorStop(0, 'rgba(14,165,233,0.08)'); gf.addColorStop(1, 'transparent');
    ctx.fillStyle = gf; ctx.fill();
    // Line
    ctx.beginPath(); ctx.moveTo(toX(0), toY(prices[0]));
    prices.forEach((p, i) => ctx.lineTo(toX(i), toY(p)));
    ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (type === 'candle') {
    const bw = Math.max(2, (cw / prices.length) * 0.6);
    for (let i = 1; i < prices.length; i++) {
      const o = prices[i - 1], c = prices[i];
      const hi = Math.max(o, c) + Math.abs(c - o) * 0.3;
      const lo = Math.min(o, c) - Math.abs(c - o) * 0.3;
      const bull = c >= o;
      const x = toX(i);
      // Wick
      ctx.strokeStyle = bull ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, toY(hi)); ctx.lineTo(x, toY(lo)); ctx.stroke();
      // Body
      ctx.fillStyle = bull ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)';
      const top = toY(Math.max(o, c)), bot = toY(Math.min(o, c));
      ctx.fillRect(x - bw / 2, top, bw, Math.max(bot - top, 1));
    }
  } else { // bar
    for (let i = 1; i < prices.length; i++) {
      const o = prices[i - 1], c = prices[i];
      const hi = Math.max(o, c) + Math.abs(c - o) * 0.3;
      const lo = Math.min(o, c) - Math.abs(c - o) * 0.3;
      const bull = c >= o;
      const x = toX(i); const hw = 3;
      ctx.strokeStyle = bull ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, toY(hi)); ctx.lineTo(x, toY(lo)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - hw, toY(o)); ctx.lineTo(x, toY(o)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, toY(c)); ctx.lineTo(x + hw, toY(c)); ctx.stroke();
    }
  }
}

// ============================================================
// CONFETTI (premium gold version)
// ============================================================
function GoldConfetti({ active }: { active: boolean }) {
  const cRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = cRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const colors = ['#f59e0b', '#fbbf24', '#d946ef', '#0ea5e9', '#fcd34d', '#e879f9', '#38bdf8'];
    const pcs = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 10 + 4, h: Math.random() * 6 + 2, color: colors[Math.floor(Math.random() * colors.length)], vy: Math.random() * 3 + 2, vx: (Math.random() - .5) * 2.5, rot: Math.random() * 360, rv: Math.random() * 8 - 4, a: 1 }));
    let f = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pcs.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (f > 140) p.a -= .008; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); f++; if (f < 280) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={cRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// SPOT THE TREND GAME
// ============================================================
function SpotTheTrendGame() {
  const scenarios = [
    { prices: generatePriceData(80, 12, 0.8).map((p, i) => p + i * 0.15), answer: 'uptrend', label: 'Uptrend — Higher Highs & Higher Lows' },
    { prices: generatePriceData(80, 55, 0.8).map((p, i) => p - i * 0.12), answer: 'downtrend', label: 'Downtrend — Lower Highs & Lower Lows' },
    { prices: generatePriceData(80, 33, 0.4).map(p => p + Math.sin(p * 0.5) * 2), answer: 'sideways', label: 'Sideways / Ranging — No clear direction' },
  ];
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const sc = scenarios[current];

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    drawChart(ctx, W, H, sc.prices, 'line');
  }, [sc.prices]);

  const handleAnswer = (ans: string) => {
    if (answered) return;
    setAnswered(ans);
    if (ans === sc.answer) setScore(s => s + 1);
    setTimeout(() => {
      if (current < scenarios.length - 1) { setCurrent(c => c + 1); setAnswered(null); }
      else setDone(true);
    }, 1800);
  };

  if (done) return (
    <div className="text-center p-6 glass-card rounded-2xl">
      <div className="text-3xl mb-2">{score === 3 ? '🎯' : score >= 2 ? '👍' : '📚'}</div>
      <p className="text-lg font-bold mb-1">{score}/{scenarios.length} Correct</p>
      <p className="text-sm text-gray-400">{score === 3 ? 'Perfect! You can read trends like a pro.' : 'Keep practising — trend identification is a core skill.'}</p>
      <button onClick={() => { setCurrent(0); setAnswered(null); setScore(0); setDone(false); }} className="mt-3 px-4 py-2 rounded-lg glass text-xs font-semibold text-primary-400 hover:bg-white/[0.06] transition-all">Try Again</button>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Round {current + 1} of {scenarios.length}</span>
        <span className="text-xs text-gray-500">Score: {score}</span>
      </div>
      <AnimScene drawFn={drawScene} height={180} />
      <div className="p-4">
        <p className="text-sm font-semibold mb-3 text-center">What&apos;s the trend?</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'uptrend', label: '📈 Uptrend', col: 'green' },
            { id: 'downtrend', label: '📉 Downtrend', col: 'red' },
            { id: 'sideways', label: '➡️ Sideways', col: 'amber' },
          ].map(opt => {
            let cls = 'p-3 rounded-xl text-xs font-semibold text-center cursor-pointer transition-all border active:scale-95 ';
            if (!answered) cls += 'glass hover:bg-white/[0.06]';
            else if (opt.id === sc.answer) cls += 'bg-green-500/15 border-green-500/30 text-green-400';
            else if (opt.id === answered) cls += 'bg-red-500/15 border-red-500/30 text-red-400';
            else cls += 'bg-white/[0.02] border-white/[0.03] opacity-30';
            return <div key={opt.id} className={cls} onClick={() => handleAnswer(opt.id)}>{opt.label}</div>;
          })}
        </div>
        {answered && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-center text-gray-400">
            {answered === sc.answer ? '✅ Correct!' : '❌ Not quite.'} {sc.label}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "What does each candlestick on a '1-hour chart' represent?", opts: ["1 minute of trading", "1 hour of trading", "1 day of trading", "It varies"], correct: 1, explain: "On a 1-hour chart, each candlestick captures one hour of price action — every trade that happened within that 60-minute window." },
  { q: "Which chart type shows the MOST information per candle?", opts: ["Line chart", "Bar chart", "Candlestick chart", "They all show the same"], correct: 2, explain: "Candlestick charts show Open, High, Low, Close AND visually distinguish bullish from bearish with color-coded bodies — the most information at a glance." },
  { q: "If price keeps making higher highs AND higher lows, the trend is:", opts: ["Downtrend", "Uptrend", "Sideways", "Reversal"], correct: 1, explain: "Higher highs and higher lows is the textbook definition of an uptrend. Each swing pushes higher than the last." },
  { q: "A support level that price breaks through often becomes:", opts: ["Invisible", "Stronger support", "Resistance", "A buy signal"], correct: 2, explain: "This is called 'support-resistance flip'. When a support level breaks, the old buyers are now trapped — they become sellers if price returns to that level, turning it into resistance." },
  { q: "Why do longer timeframes (Daily, Weekly) carry more weight than shorter ones (1m, 5m)?", opts: ["They have prettier candles", "More market participants and money are represented in each candle", "They are more colourful", "Shorter timeframes are always better"], correct: 1, explain: "A daily candle represents 24 hours of global trading activity. A 1-minute candle might just represent a handful of trades. More participants = more significant levels." },
  { q: "You notice the price is moving sideways between $100 support and $110 resistance. What is this called?", opts: ["A trending market", "A range or consolidation", "A breakout", "A reversal"], correct: 1, explain: "When price bounces between defined support and resistance without breaking either, it's 'ranging' or 'consolidating'. Traders wait for a breakout from the range or trade the bounces." },
];

// ============================================================
// MAIN PAGE
// ============================================================
export default function ReadingChartsLesson() {
  const [chartType, setChartType] = useState<'line' | 'candle' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | 'daily'>('1h');
  const [showSupRes, setShowSupRes] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
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

  const tfPrices = timeframe === '15m' ? priceData15 : timeframe === '1h' ? priceData60 : priceDataDaily;
  const tfMin = Math.min(...tfPrices), tfMax = Math.max(...tfPrices);
  const supLevel = tfMin + (tfMax - tfMin) * 0.2;
  const resLevel = tfMin + (tfMax - tfMin) * 0.8;

  const drawInteractive = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
    const hl: any = {};
    if (showSupRes) { hl.support = supLevel; hl.resistance = resLevel; }
    if (showTrend) { hl.trendline = [10, tfPrices[10], 150, tfPrices[150]]; }
    drawChart(ctx, W, H, tfPrices, chartType, hl);
    // Timeframe label
    ctx.font = '600 10px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'right';
    ctx.fillText(timeframe === '15m' ? '15 MINUTE CHART' : timeframe === '1h' ? '1 HOUR CHART' : 'DAILY CHART', W - 12, 16);
  }, [chartType, timeframe, showSupRes, showTrend, tfPrices, supLevel, resLevel]);

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
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-100px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-7">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">PRO Lesson — Level 1</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Reading Your<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>First Chart</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            From blank screen to insight. Learn to read timeframes, identify trends, draw levels, and understand what charts are really telling you.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Interactive Charts</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Trend Game</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> 6 Questions</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Pro Certificate</span>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 00: Real-World Analogy */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">First — Why This Matters</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-4">Imagine Driving Without a Map</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">You wouldn&apos;t drive across the country without Google Maps. You&apos;d get lost, take wrong turns, waste time, and run out of fuel. <strong className="text-white">Trading without a chart is the same thing.</strong></motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">A chart is your GPS for the markets. It shows you where price has been, where it might go, and — most importantly — where the danger zones are. Every professional trader on Earth reads charts. After this lesson, so will you.</motion.p>
          <motion.div variants={fadeUp} className="p-5 glass-card rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-accent-500" />
            <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Real scenario:</strong> You hear that Tesla stock is &quot;going up&quot;. Without a chart, you buy at $280 based on a gut feeling. With a chart, you see it&apos;s already hit resistance at $285 three times and rejected — you wait for a pullback to $260 and buy at a much better price. <strong className="text-white">Same stock, completely different outcome.</strong></p>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What IS a Chart */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">01 — The Basics</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is a Price Chart?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">A chart is simply a <strong className="text-white">picture of how price has moved over time</strong>. Time goes left to right. Price goes bottom to top. That&apos;s it — nothing more complicated than that.</motion.p>
          <motion.div variants={fadeUp} className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 mb-4">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Think of it like this:</strong> Imagine a fitness tracker that records your weight every day and draws a line. After a month you can SEE if you&apos;re trending up or down. A price chart does the same thing — but for the price of Bitcoin, gold, stocks, or any asset.</p>
          </motion.div>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">But here&apos;s the magic: a chart doesn&apos;t just show history. It reveals <strong className="text-white">patterns</strong> — spots where price keeps bouncing, levels where it keeps getting rejected, and moments where everything changes. Once you learn to read these patterns, you&apos;ll see opportunities that invisible to everyone else.</motion.p>
        </motion.div>

        {/* Chart Type Comparison — with layman descriptions */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Three Ways to View Price</motion.p>
          {[
            { type: 'line' as const, name: 'Line Chart', icon: '📉', desc: 'The simplest view — just a smooth line connecting the price at the end of each period. Like watching the outline of mountains from far away — you see the big picture but miss the details.', best: 'Best for: Getting a quick sense of direction', layman: 'Think of it like a heart rate monitor — one smooth line showing the rhythm.' },
            { type: 'bar' as const, name: 'Bar Chart', icon: '📊', desc: 'Each bar shows four prices: where price started, the highest it went, the lowest it went, and where it ended. More detail than a line, but takes practice to read quickly.', best: 'Best for: Traders who want detail without colour coding', layman: 'Like a weather report that shows you the high AND low temperature for each day, not just the average.' },
            { type: 'candle' as const, name: 'Candlestick Chart', icon: '🕯️', desc: 'Same information as a bar but MUCH easier to read. Green (or hollow) candles = price went UP. Red (or filled) candles = price went DOWN. You can tell the story of each period at a glance.', best: 'Best for: Everything. This is what 90% of traders use — and what you should learn.', layman: 'Like traffic lights for price — green means go (buyers won), red means stop (sellers won). Instant clarity.' },
          ].map((ct, i) => (
            <motion.div key={ct.type} variants={fadeUp}
              onClick={() => setChartType(ct.type)}
              className={`flex items-start gap-4 p-5 rounded-2xl mb-3 cursor-pointer transition-all active:scale-[0.99] border ${chartType === ct.type ? 'glass-card ring-1 ring-amber-500/20 border-amber-500/15' : 'glass hover:bg-white/[0.04]'}`}>
              <span className="text-2xl flex-shrink-0">{ct.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-[15px] mb-1">{ct.name}</h4>
                <p className="text-sm text-gray-400 leading-relaxed mb-1">{ct.desc}</p>
                <p className="text-[11px] text-primary-400 mb-2">{ct.best}</p>
                <p className="text-[11px] text-amber-400/70 italic">{ct.layman}</p>
              </div>
              {chartType === ct.type && <span className="text-amber-400 text-xs font-semibold mt-1">ACTIVE ✓</span>}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Section 2: Interactive Playground */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">02 — Chart Playground</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Your First Chart — Play With It!</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-3">This is a real chart. Go ahead — tap the buttons. Break things. Explore. You can&apos;t lose any money here.</motion.p>
          <motion.div variants={fadeUp} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-6">
            <p className="text-xs text-amber-400 leading-relaxed">💡 <strong>Try this:</strong> Switch from Line → Candle and see how much more detail appears. Then switch timeframes from 15m → Daily and watch how the same market tells a completely different story. Finally, toggle Support/Resistance ON — those lines show you where buyers and sellers are fighting.</p>
          </motion.div>
        </motion.div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 border-b border-white/[0.06] flex flex-wrap gap-2">
            {/* Chart type */}
            <div className="flex gap-1">
              {(['line', 'candle', 'bar'] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${chartType === t ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-white/5 text-gray-500'}`}>
                  {t === 'line' ? '📉 Line' : t === 'candle' ? '🕯️ Candle' : '📊 Bar'}
                </button>
              ))}
            </div>
            {/* Timeframe */}
            <div className="flex gap-1">
              {(['15m', '1h', 'daily'] as const).map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${timeframe === tf ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'bg-white/5 text-gray-500'}`}>
                  {tf === '15m' ? '15m' : tf === '1h' ? '1H' : 'Daily'}
                </button>
              ))}
            </div>
          </div>
          {/* Canvas */}
          <AnimScene drawFn={drawInteractive} height={260} />
          {/* Overlay toggles */}
          <div className="p-3 border-t border-white/[0.06] flex gap-2">
            <button onClick={() => setShowSupRes(!showSupRes)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${showSupRes ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'glass text-gray-500'}`}>
              {showSupRes ? '✓ Support / Resistance' : '+ Support / Resistance'}
            </button>
            <button onClick={() => setShowTrend(!showTrend)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${showTrend ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'glass text-gray-500'}`}>
              {showTrend ? '✓ Trendline' : '+ Trendline'}
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 glass rounded-2xl">
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">What to notice:</strong> Switch between 15m → 1H → Daily. See how the <strong>same market looks completely different</strong> at each timeframe? The 15-minute chart is like watching a football match second by second — chaotic and stressful. The Daily chart is like reading the season results — calm, clear, and full of patterns. Toggle Support/Resistance to see invisible &quot;walls&quot; where price keeps bouncing.
          </p>
        </div>
      </section>

      {/* Section 3: Timeframes Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">03 — Timeframes</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Same Market, Different Stories</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-4">A timeframe is <strong className="text-white">how much time each candle represents</strong>. On a 1-hour chart, each candle = 1 hour of trading. On a daily chart, each candle = one full day.</motion.p>
          <motion.div variants={fadeUp} className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 mb-8">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Think of it like Google Maps zoom:</strong> Zoom out = you see the whole country and major motorways (daily/weekly chart). Zoom in = you see every street and every pothole (1-minute chart). Both views are useful, but they show different things. Most people need the motorway view, not the pothole view.</p>
          </motion.div>
        </motion.div>

        <div className="space-y-3">
          {[
            { tf: '1m — 5m', who: 'Scalpers', desc: 'Each candle is just 1-5 minutes. Extreme detail, extreme chaos. Like watching a stock ticker refresh every second — stressful and full of false signals. Not for beginners.', col: 'text-red-400', bg: 'bg-red-500/10' },
            { tf: '15m — 1H', who: 'Day Traders', desc: 'The sweet spot for people who trade within a single day. Enough detail to find good entries, but not so zoomed in that every little wiggle scares you. Trades last minutes to hours.', col: 'text-amber-400', bg: 'bg-amber-500/10' },
            { tf: '4H — Daily', who: 'Swing Traders', desc: 'The most reliable timeframes. Each candle represents 4 hours or a full day of trading. You only need to check your charts 1-2 times per day. Less stress, higher quality setups. Best for beginners.', col: 'text-green-400', bg: 'bg-green-500/10' },
            { tf: 'Weekly — Monthly', who: 'Investors', desc: 'The bird\'s eye view. One candle = one week or one month. Used to spot major trends that last months or years. If you\'re thinking long-term, this is your view.', col: 'text-primary-400', bg: 'bg-primary-500/10' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 glass-card rounded-2xl hover:translate-x-1 transition-all">
              <div className={`flex-shrink-0 px-3 py-2 rounded-xl ${item.bg}`}>
                <div className={`text-xs font-bold ${item.col}`}>{item.tf}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-[15px]">{item.who}</h4>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-6 p-5 glass-card rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-accent-500 to-primary-500" />
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-amber-400">Pro Tip:</strong> Always check the bigger picture FIRST. If the Daily chart shows a strong uptrend, don&apos;t fight it on the 15-minute chart. It&apos;s like swimming — <strong className="text-white">you want to swim WITH the current, not against it.</strong> Check the Daily chart for direction, then zoom into the 1H for your entry.
          </p>
        </motion.div>
      </section>

      {/* Section 4: Spot the Trend Game */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">04 — Spot the Trend</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Can You Read the Market?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Look at each chart and identify the trend. This is the single most important skill in trading — <strong className="text-white">if you can identify the trend, you have an edge</strong>.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SpotTheTrendGame />
        </motion.div>
      </section>

      {/* Section 5: Support & Resistance */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">05 — Key Levels</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Support & Resistance</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-4">Support and resistance are the <strong>most important concepts</strong> in chart reading. They are the invisible battlegrounds where buyers and sellers fight.</motion.p>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: '🟢', title: 'Support = The Floor', desc: 'Think of a price where buyers always show up — like a sale price people can\'t resist. Every time the price drops here, people buy and push it back up. The more times it bounces, the stronger the floor.', col: 'border-l-green-500' },
            { icon: '🔴', title: 'Resistance = The Ceiling', desc: 'The opposite — a price where sellers always appear. Think of it as a price where people go "that\'s too expensive" and start selling. Price hits this ceiling and gets pushed back down.', col: 'border-l-red-500' },
            { icon: '🔄', title: 'The Flip (Floors Become Ceilings)', desc: 'When a floor breaks, it often becomes a ceiling. Why? Everyone who bought at that level is now losing money — when price comes back, they sell to escape. Their selling creates the new ceiling. This works in reverse too.', col: 'border-l-primary-500' },
            { icon: '🎯', title: 'How to Spot Levels', desc: 'Look for prices that keep appearing — where price bounces 2-3+ times. Don\'t try to be exact — draw a rough zone, not a precise line. If the level is obvious to you, it\'s probably obvious to thousands of other traders too — and that\'s what makes it powerful.', col: 'border-l-amber-500' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`p-5 glass-card rounded-2xl border-l-4 ${item.col}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.icon}</span>
                <h4 className="font-bold text-[15px]">{item.title}</h4>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 6: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">06 — Pro Quiz</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Final Assessment</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">6 questions. This one&apos;s harder than the free lessons — prove you&apos;ve earned your Pro certificate.</motion.p>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Flawless. You\'re ready for Level 2.' : score >= 66 ? 'Solid work. You can read a chart.' : 'Review the lesson sections above and retry.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ on the quiz to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            {/* Gold border shimmer */}
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">👑</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Has successfully mastered<br /><strong className="text-white">Level 1.4: Reading Your First Chart</strong><br />at ATLAS Academy by Interakktive
              </p>
              <p className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Pro Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L1.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 1.5 — Risk: The #1 Rule</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
