// app/academy/lesson/candlestick-anatomy/page.tsx
// ATLAS Academy — Lesson 1.3: Anatomy of a Candlestick
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ============================================================
// CANDLE BUILDER — draws an animated candle on canvas with labels
// ============================================================
function CandleBuilder({ type, step, height = 320 }: { type: 'bull' | 'bear'; step: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  const BULL = { open: 220, close: 120, high: 55, low: 280 };
  const BEAR = { open: 120, close: 220, high: 55, low: 280 };
  const cfg = type === 'bull' ? BULL : BEAR;
  const col = type === 'bull' ? '#22c55e' : '#ef4444';
  const colFaded = type === 'bull' ? 'rgba(34,197,94,' : 'rgba(239,68,68,';

  useEffect(() => {
    const canvas = canvasRef.current; const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const resize = () => { const r = container.getBoundingClientRect(); canvas.width = r.width * 2; canvas.height = r.height * 2; canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px'; };
    resize();

    const bodyTop = Math.min(cfg.open, cfg.close);
    const bodyBot = Math.max(cfg.open, cfg.close);
    const bodyH = bodyBot - bodyTop;
    let animBodyH = 0;
    let animWickTop = 0;
    let animWickBot = 0;
    let lastStep = -1;

    const loop = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      const w = canvas.width / 2, h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const cx = w / 2;
      const BW = 52;

      // Price scale on right
      ctx.font = '500 9px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 6; i++) { const y = 40 + i * 50; ctx.fillText('$' + (105 - i * 5).toFixed(0), w - 12, y + 3); }

      // Animate based on step
      if (step !== lastStep) { lastStep = step; animBodyH = 0; animWickTop = 0; animWickBot = 0; }

      if (step >= 2) { animBodyH = Math.min(animBodyH + 2.5, bodyH); }
      if (step >= 3) { animWickTop = Math.min(animWickTop + 2, bodyTop - cfg.high); }
      if (step >= 4) { animWickBot = Math.min(animWickBot + 2, cfg.low - bodyBot); }

      // Step 0: Open line
      if (step >= 0) {
        ctx.strokeStyle = colFaded + '0.5)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(cx - 80, cfg.open); ctx.lineTo(cx + 80, cfg.open); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cfg.open, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '600 11px sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'left';
        ctx.fillText('OPEN', cx + 65, cfg.open - 8);
        ctx.font = '400 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(type === 'bull' ? 'Where price started (lower)' : 'Where price started (higher)', cx + 65, cfg.open + 6);
      }

      // Step 1: Close line
      if (step >= 1) {
        ctx.strokeStyle = colFaded + '0.5)'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(cx - 80, cfg.close); ctx.lineTo(cx + 80, cfg.close); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cfg.close, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '600 11px sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'left';
        ctx.fillText('CLOSE', cx + 65, cfg.close - 8);
        ctx.font = '400 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(type === 'bull' ? 'Where price ended (higher) ✓' : 'Where price ended (lower) ✗', cx + 65, cfg.close + 6);
      }

      // Step 2: Body
      if (step >= 2 && animBodyH > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.roundRect(cx - BW / 2 + 3, bodyTop + 3, BW, animBodyH, 4); ctx.fill();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(cx - BW / 2, bodyTop, BW, animBodyH, 4); ctx.fill();
        if (animBodyH >= bodyH) {
          // Body bracket + label
          ctx.strokeStyle = colFaded + '0.3)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(30, bodyTop + 4); ctx.lineTo(22, bodyTop + 4); ctx.lineTo(22, bodyBot - 4); ctx.lineTo(30, bodyBot - 4); ctx.stroke();
          ctx.font = '600 10px sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'right';
          ctx.fillText('BODY', 18, bodyTop + bodyH / 2 - 4);
          ctx.font = '400 8px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillText('The real', 18, bodyTop + bodyH / 2 + 8);
          ctx.fillText('move', 18, bodyTop + bodyH / 2 + 18);
        }
      }

      // Step 3: Upper wick
      if (step >= 3 && animWickTop > 0) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, bodyTop); ctx.lineTo(cx, bodyTop - animWickTop); ctx.stroke();
        if (animWickTop >= bodyTop - cfg.high) {
          ctx.fillStyle = '#f59e0b'; ctx.beginPath();
          ctx.moveTo(cx, cfg.high - 3); ctx.lineTo(cx - 5, cfg.high + 7); ctx.lineTo(cx + 5, cfg.high + 7); ctx.fill();
          ctx.font = '600 10px sans-serif'; ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'left';
          ctx.fillText('HIGH', cx + 65, cfg.high - 2);
          ctx.font = '400 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillText('Buyers\' maximum push', cx + 65, cfg.high + 12);
          // Wick label
          ctx.font = '600 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'right';
          ctx.fillText('UPPER', 18, (bodyTop + cfg.high) / 2 - 3);
          ctx.fillText('WICK', 18, (bodyTop + cfg.high) / 2 + 8);
        }
      }

      // Step 4: Lower wick
      if (step >= 4 && animWickBot > 0) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, bodyBot); ctx.lineTo(cx, bodyBot + animWickBot); ctx.stroke();
        if (animWickBot >= cfg.low - bodyBot) {
          ctx.fillStyle = '#ef4444'; ctx.beginPath();
          ctx.moveTo(cx, cfg.low + 3); ctx.lineTo(cx - 5, cfg.low - 7); ctx.lineTo(cx + 5, cfg.low - 7); ctx.fill();
          ctx.font = '600 10px sans-serif'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'left';
          ctx.fillText('LOW', cx + 65, cfg.low + 4);
          ctx.font = '400 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillText('Sellers\' maximum push', cx + 65, cfg.low + 18);
          ctx.font = '600 9px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'right';
          ctx.fillText('LOWER', 18, (bodyBot + cfg.low) / 2 - 3);
          ctx.fillText('WICK', 18, (bodyBot + cfg.low) / 2 + 8);
        }
      }

      // Step 5: Glow
      if (step >= 5) {
        const a = 0.3 + Math.sin(frameRef.current * 0.05) * 0.15;
        ctx.shadowColor = col; ctx.shadowBlur = 20;
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(cx - BW / 2 - 4, bodyTop - 4, BW + 8, bodyH + 8, 6); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      frameRef.current++;
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [type, step, cfg, col, colFaded]);

  return (
    <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" style={{ height, background: 'rgba(0,0,0,0.3)' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ============================================================
// PATTERN DATA
// ============================================================
const patterns = [
  { name: 'Hammer', sig: 'Bullish Reversal', sigCol: 'text-green-400', sigBg: 'bg-green-500/10', wT: 5, wB: 55, bT: 18, bH: 18, col: '#22c55e',
    desc: 'Forms at the bottom of a downtrend. The long lower wick shows sellers pushed hard, but buyers stormed back. A signal that selling pressure may be exhausted.',
    key: 'Small body at the top, very long lower wick (2-3x the body), little to no upper wick.' },
  { name: 'Shooting Star', sig: 'Bearish Reversal', sigCol: 'text-red-400', sigBg: 'bg-red-500/10', wT: 55, wB: 5, bT: 65, bH: 18, col: '#ef4444',
    desc: 'Forms at the top of an uptrend. Buyers pushed price high but sellers slammed it back down. A warning the uptrend may be weakening.',
    key: 'Small body at the bottom, very long upper wick, little to no lower wick.' },
  { name: 'Doji', sig: 'Indecision', sigCol: 'text-amber-400', sigBg: 'bg-amber-500/10', wT: 35, wB: 35, bT: 48, bH: 3, col: '#f59e0b',
    desc: 'Open and Close are nearly identical. Perfect indecision — buyers and sellers equally matched. After a strong trend, it can signal a turning point.',
    key: 'Virtually no body (just a line), with upper and lower wicks of similar length.' },
  { name: 'Bullish Marubozu', sig: 'Strong Bullish', sigCol: 'text-green-400', sigBg: 'bg-green-500/10', wT: 0, wB: 0, bT: 12, bH: 75, col: '#22c55e',
    desc: 'No wicks at all. Opened at the low, closed at the high. Pure, uncontested buying power from start to finish. One of the strongest single-candle signals.',
    key: 'Full body with zero wicks. Buyers dominated every moment of this period.' },
  { name: 'Hanging Man', sig: 'Bearish Warning', sigCol: 'text-red-400', sigBg: 'bg-red-500/10', wT: 5, wB: 55, bT: 18, bH: 18, col: '#ef4444',
    desc: 'Identical to a Hammer but appears at the TOP of an uptrend. That long lower wick shows selling pressure is creeping in — a warning sign.',
    key: 'Same shape as Hammer. Context is everything — location determines meaning.' },
  { name: 'Engulfing', sig: 'Strong Reversal', sigCol: 'text-primary-400', sigBg: 'bg-primary-500/10', wT: 5, wB: 5, bT: 10, bH: 78, col: '#0ea5e9',
    desc: 'A large candle that completely "engulfs" the previous smaller candle. Shows a dramatic shift in power. Bullish engulfing after downtrend = strong buy signal.',
    key: 'The second candle\'s body completely covers the first candle\'s body. The bigger the engulfing candle, the stronger the signal.' },
];

function MiniCandle({ pattern, size = 80 }: { pattern: typeof patterns[0]; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const w = 50, h = size;
    c.width = w * 2; c.height = h * 2; c.style.width = w + 'px'; c.style.height = h + 'px';
    ctx.scale(2, 2);
    const cx = w / 2, bTop = (pattern.bT / 100) * h, bH = (pattern.bH / 100) * h;
    const wTop = (pattern.wT / 100) * h, wBot = (pattern.wB / 100) * h;
    if (wTop > 0) { ctx.strokeStyle = pattern.col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, bTop); ctx.lineTo(cx, bTop - wTop); ctx.stroke(); }
    if (wBot > 0) { ctx.strokeStyle = pattern.col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, bTop + bH); ctx.lineTo(cx, bTop + bH + wBot); ctx.stroke(); }
    ctx.fillStyle = pattern.col;
    ctx.beginPath(); ctx.roundRect(cx - 10, bTop, 20, Math.max(bH, 2), 3); ctx.fill();
  }, [pattern, size]);
  return <canvas ref={canvasRef} />;
}

// ============================================================
// NARRATION STEPS
// ============================================================
const buildSteps = [
  { label: 'STEP 1 — THE OPEN', text: 'Every candlestick starts with the <strong>Open price</strong> — the very first trade when this time period began. Think of it as the starting gun. For a bullish candle, the open is at the bottom. For bearish, it\'s at the top.' },
  { label: 'STEP 2 — THE CLOSE', text: 'The <strong>Close price</strong> is where the candle finishes — the final trade of the period. If Close is <strong class="text-green-400">above</strong> Open, buyers won (bullish). If Close is <strong class="text-red-400">below</strong> Open, sellers won (bearish).' },
  { label: 'STEP 3 — THE BODY', text: 'The coloured rectangle between Open and Close is the <strong>Body</strong>. It represents the <em>real, committed move</em> — where price actually settled. A big body = strong conviction. A tiny body = indecision.' },
  { label: 'STEP 4 — UPPER WICK', text: 'The thin line above the body is the <strong>Upper Wick</strong> (or shadow). It shows how high buyers pushed the price before sellers fought back. A long upper wick = <strong class="text-amber-400">selling pressure</strong> rejected higher prices.' },
  { label: 'STEP 5 — LOWER WICK', text: 'The thin line below the body is the <strong>Lower Wick</strong>. It shows how low sellers pushed before buyers stepped in. A long lower wick = <strong class="text-green-400">buying pressure</strong> rejected lower prices.' },
  { label: 'COMPLETE ✓', text: 'The full candle tells the <strong>complete story</strong> of one time period. The body shows who won (buyers or sellers). The wicks show how hard each side tried. Together, they reveal the battle between supply and demand.' },
];

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  { q: "What do the four letters O, H, L, C stand for?", opts: ["Order, Hedge, Limit, Cancel", "Open, High, Low, Close", "Offer, Hold, Long, Cover", "Output, Height, Length, Cost"], correct: 1, explain: "Every candlestick shows four prices: Open (start), High (maximum), Low (minimum), and Close (end)." },
  { q: "If a candle's Close is higher than its Open, what does that mean?", opts: ["Sellers won this period", "Buyers won this period (bullish)", "The market was closed", "There was no trading"], correct: 1, explain: "Close above Open means price went up during this period — buyers were in control. This creates a bullish (typically green) candle." },
  { q: "What does a very long lower wick tell you?", opts: ["Buyers were weak", "Price never went down", "Sellers pushed down but buyers rejected that price", "The candle is invalid"], correct: 2, explain: "A long lower wick means sellers drove the price down, but buyers stepped in and pushed it back up — rejecting those lower prices." },
  { q: "What is a Doji candle?", opts: ["A candle with no wicks", "A very large bullish candle", "A candle where Open and Close are nearly the same", "A candle that appears only on Mondays"], correct: 2, explain: "A Doji forms when Open ≈ Close, creating a thin line for the body. It represents perfect indecision between buyers and sellers." },
  { q: "A Hammer pattern at the bottom of a downtrend signals:", opts: ["More selling ahead", "A potential bullish reversal", "Nothing — patterns don't matter", "You should close all trades"], correct: 1, explain: "A Hammer at the bottom of a downtrend shows that sellers tried to push lower but buyers rejected it — a classic reversal signal." },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const colors = ['#0ea5e9', '#d946ef', '#38bdf8', '#e879f9', '#22c55e', '#f59e0b'];
    const pieces = Array.from({ length: 150 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: colors[Math.floor(Math.random() * colors.length)], vy: Math.random() * 3 + 2, vx: (Math.random() - 0.5) * 2, rot: Math.random() * 360, rv: Math.random() * 6 - 3, a: 1 }));
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
export default function CandlestickAnatomyLesson() {
  const [candleType, setCandleType] = useState<'bull' | 'bear'>('bull');
  const [buildStep, setBuildStep] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<number | null>(null);
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

  // Auto-play candle build
  const autoPlay = useCallback(() => {
    setBuildStep(-1);
    setIsAutoPlaying(true);
    let s = 0;
    const run = () => {
      setBuildStep(s);
      s++;
      if (s <= 5) setTimeout(run, 2500);
      else setIsAutoPlaying(false);
    };
    setTimeout(run, 300);
  }, []);

  const handleAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const updated = [...quizAnswers]; updated[qi] = oi; setQuizAnswers(updated);
    if (updated.every(a => a !== null)) {
      const correct = updated.filter((a, i) => a === quizQuestions[i].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setScore(pct); setQuizDone(true);
      if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen">
      <Confetti active={showConfetti} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} /></div>
          <span className="font-mono text-[10px] text-gray-500">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-400">Level 1 — Foundations</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Anatomy of a<br /><span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Candlestick</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">Every candle tells a story. Learn to read the language of price — one candle at a time.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-primary-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Why Candlesticks */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">01 — Why Candlesticks?</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">More Than Just a Line</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-6">
            A line chart only shows you the closing price — <strong>one number</strong>. But in any time period, four important things happen: where price <strong>opened</strong>, the <strong>highest</strong> it reached, the <strong>lowest</strong> it fell, and where it <strong>closed</strong>.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">
            A candlestick captures <strong className="text-white">all four</strong> in a single shape. That&apos;s why traders have used them for over 300 years — they were invented by Japanese rice traders in the 1700s.
          </motion.p>
        </motion.div>

        {/* OHLC explainer cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { letter: 'O', name: 'Open', desc: 'First price of the period', col: 'text-primary-400', bg: 'bg-primary-500/10' },
            { letter: 'H', name: 'High', desc: 'Highest price reached', col: 'text-amber-400', bg: 'bg-amber-500/10' },
            { letter: 'L', name: 'Low', desc: 'Lowest price reached', col: 'text-red-400', bg: 'bg-red-500/10' },
            { letter: 'C', name: 'Close', desc: 'Last price of the period', col: 'text-accent-400', bg: 'bg-accent-500/10' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 text-center">
              <div className={`text-2xl font-extrabold mb-1 ${item.col}`}>{item.letter}</div>
              <div className="font-semibold text-sm mb-0.5">{item.name}</div>
              <div className="text-[11px] text-gray-500">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: Build a Candle */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">02 — Build a Candle</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Watch It Construct Itself</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-6">Choose bullish or bearish, then watch each part animate in with an explanation.</motion.p>
        </motion.div>

        {/* Type toggle */}
        <div className="flex gap-3 mb-4">
          <button onClick={() => { setCandleType('bull'); setBuildStep(-1); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${candleType === 'bull' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'glass text-gray-400'}`}>▲ Bullish</button>
          <button onClick={() => { setCandleType('bear'); setBuildStep(-1); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${candleType === 'bear' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'glass text-gray-400'}`}>▼ Bearish</button>
        </div>

        {/* Canvas */}
        <CandleBuilder type={candleType} step={buildStep} />

        {/* Step controls */}
        <div className="flex gap-2 mt-4">
          <button onClick={autoPlay} disabled={isAutoPlaying} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-sm active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
            {isAutoPlaying ? 'Playing...' : '▶ Auto Play'}
          </button>
          <button onClick={() => setBuildStep(s => Math.min(s + 1, 5))} disabled={isAutoPlaying} className="px-5 py-3 rounded-xl glass text-sm font-semibold active:scale-95 transition-all disabled:opacity-50">
            Next →
          </button>
          <button onClick={() => setBuildStep(-1)} className="px-5 py-3 rounded-xl glass text-sm font-semibold text-gray-500 active:scale-95 transition-all">
            ↻
          </button>
        </div>

        {/* Step progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {buildSteps.map((_, i) => (
            <div key={i} className={`w-6 h-1 rounded-full transition-all duration-300 ${i <= buildStep ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Narration */}
        <AnimatePresence mode="wait">
          {buildStep >= 0 && (
            <motion.div key={buildStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
              className="mt-4 p-5 glass-card rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500" />
              <p className="text-[10px] font-semibold tracking-widest uppercase text-primary-400 mb-2">{buildSteps[buildStep].label}</p>
              <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: buildSteps[buildStep].text }} />
            </motion.div>
          )}
        </AnimatePresence>
        {buildStep < 0 && (
          <div className="mt-4 p-5 glass rounded-2xl text-center">
            <p className="text-sm text-gray-500">Tap <strong className="text-gray-300">▶ Auto Play</strong> or <strong className="text-gray-300">Next →</strong> to build the candle step by step.</p>
          </div>
        )}
      </section>

      {/* Section 3: What Size Tells You */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">03 — Reading the Clues</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Size Tells You</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">Not all candles are equal. The <strong className="text-white">relative size</strong> of the body and wicks tells you the story behind the price action.</motion.p>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: '🟩', title: 'Big Body, Small Wicks', meaning: 'Strong conviction. One side dominated with little resistance. Clear trend move.', strength: 'Strong signal' },
            { icon: '📏', title: 'Small Body, Long Wicks', meaning: 'Indecision. Both sides fought hard but neither won convincingly. Potential reversal ahead.', strength: 'Caution signal' },
            { icon: '📍', title: 'Long Upper Wick', meaning: 'Selling pressure. Buyers pushed up but got rejected. Sellers are defending that higher price.', strength: 'Bearish pressure' },
            { icon: '📌', title: 'Long Lower Wick', meaning: 'Buying pressure. Sellers pushed down but got rejected. Buyers are defending that lower price.', strength: 'Bullish pressure' },
            { icon: '➖', title: 'Tiny Body (Doji-like)', meaning: 'Complete indecision. Open ≈ Close. The market is pausing to decide its next move. Watch the next candle for confirmation.', strength: 'Wait and see' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 glass-card rounded-2xl hover:translate-x-1 transition-all">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-[15px]">{item.title}</h4>
                  <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-white/5 text-gray-500">{item.strength}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.meaning}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Common Patterns */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">04 — Common Patterns</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Tap a Pattern to Learn</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">These single-candle patterns appear constantly. Recognising them is your first edge.</motion.p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {patterns.map((p, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedPattern(selectedPattern === i ? null : i)}
              className={`p-4 rounded-2xl border text-center transition-all active:scale-95 ${selectedPattern === i ? `${p.sigBg} ${p.sigCol.replace('text-', 'border-').replace('400', '500/30')}` : 'glass hover:bg-white/[0.06]'}`}>
              <div className="flex justify-center mb-2"><MiniCandle pattern={p} size={70} /></div>
              <div className={`text-xs font-bold ${selectedPattern === i ? p.sigCol : ''}`}>{p.name}</div>
              <div className={`text-[9px] font-semibold mt-1 ${p.sigCol}`}>{p.sig}</div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedPattern !== null && (
            <motion.div key={selectedPattern} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-5">
              <h3 className={`text-lg font-bold mb-1 ${patterns[selectedPattern].sigCol}`}>{patterns[selectedPattern].name}</h3>
              <p className={`text-xs font-semibold mb-3 ${patterns[selectedPattern].sigCol}`}>{patterns[selectedPattern].sig}</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">{patterns[selectedPattern].desc}</p>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">How to identify</p>
                <p className="text-sm text-gray-400 leading-relaxed">{patterns[selectedPattern].key}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 5: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">05 — Knowledge Check</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Quick Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">5 questions. Pass to unlock your certificate.</motion.p>
        </motion.div>
        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: qi * 0.08 }} className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
              <p className="font-semibold text-[15px] leading-relaxed mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null; const isCorrect = oi === q.correct; const isSelected = quizAnswers[qi] === oi;
                  let cls = 'p-3 rounded-xl text-sm cursor-pointer transition-all border ';
                  if (!answered) cls += 'bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.98]';
                  else if (isCorrect) cls += 'bg-green-500/10 border-green-500/30 text-green-400';
                  else if (isSelected) cls += 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60';
                  else cls += 'bg-white/[0.02] border-white/[0.03] opacity-40 pointer-events-none';
                  return <div key={oi} className={cls} onClick={() => handleAnswer(qi, oi)}>{opt}</div>;
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-primary-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-green-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? 'Perfect score!' : score >= 66 ? "You've mastered candlestick anatomy!" : 'Review the lesson and try again.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Complete the quiz to unlock your <strong className="text-gray-300">Lesson 1.3 Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }} className="max-w-md mx-auto p-10 glass-card rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(14,165,233,0.04),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="relative z-10">
              <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-primary-500/30">🏆</div>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Completion</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has successfully completed<br /><strong className="text-white">Level 1.3: Anatomy of a Candlestick</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-gray-600 tracking-wider uppercase">CERT-L1.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 1.4 — Reading Your First Chart</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95">
          Continue
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </section>
    </div>
  );
}
