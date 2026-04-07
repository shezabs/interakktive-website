// app/academy/lesson/what-is-trading/page.tsx
// ATLAS Academy — Lesson 1: What Is Trading?
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ============================================================
// QUIZ DATA
// ============================================================
const quizQuestions = [
  {
    q: "What is trading at its most basic level?",
    opts: [
      "Buying and selling assets hoping to profit from price differences",
      "Gambling on random price movements",
      "Only buying stocks in companies you like",
      "Holding assets forever and never selling",
    ],
    correct: 0,
    explain: "Trading is fundamentally about buying at one price and selling at another, profiting from the difference.",
  },
  {
    q: "If you 'go short', what are you betting on?",
    opts: ["The price will go up", "The price will stay the same", "The price will go down", "The market will close"],
    correct: 2,
    explain: "Going short means you sell first and buy back later — you profit when the price falls.",
  },
  {
    q: "Which market is the largest by daily volume?",
    opts: ["Stock market", "Cryptocurrency", "Forex (Foreign Exchange)", "Commodities"],
    correct: 2,
    explain: "Forex is the world's largest market with approximately $7.5 trillion traded daily.",
  },
];

// ============================================================
// ANIMATED CANVAS SCENE COMPONENT
// ============================================================
function AnimatedScene({ drawFn, height = 240 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.1 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width = r.width * 2;
      canvas.height = r.height * 2;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      if (isInView) {
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFn(ctx, canvas.width / 2, canvas.height / 2, frameRef.current);
      }
      frameRef.current++;
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isInView, drawFn]);

  return (
    <div ref={containerRef} style={{ width: '100%', height, background: '#0d1320', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ============================================================
// SCENE DRAW FUNCTIONS
// ============================================================
const drawBarter = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.02;
  ctx.fillStyle = '#0d1320'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#141c2e'; ctx.fillRect(0, H * 0.72, W, H * 0.28);
  // Wheat
  const wx = W * 0.25 + Math.sin(t) * 8, wy = H * 0.45;
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = '#FFB300'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx - 10 + i * 6, wy + 20); ctx.lineTo(wx - 10 + i * 6, wy - 20); ctx.stroke();
    ctx.fillStyle = '#FFB300'; ctx.beginPath(); ctx.ellipse(wx - 10 + i * 6, wy - 24, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.font = 'bold 11px Sora,sans-serif'; ctx.fillStyle = '#FFB300'; ctx.textAlign = 'center'; ctx.fillText('WHEAT', wx, wy + 40);
  // Fish
  const fx = W * 0.75 + Math.sin(t + 2) * 8, fy = H * 0.45;
  ctx.fillStyle = '#26A69A';
  ctx.beginPath(); ctx.ellipse(fx, fy, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(fx + 26, fy); ctx.lineTo(fx + 40, fy - 12); ctx.lineTo(fx + 40, fy + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0d1320'; ctx.beginPath(); ctx.arc(fx - 12, fy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.font = 'bold 11px Sora,sans-serif'; ctx.fillStyle = '#26A69A'; ctx.textAlign = 'center'; ctx.fillText('FISH', fx, fy + 40);
  // Arrows
  const a = 0.5 + Math.sin(t * 2) * 0.5;
  ctx.globalAlpha = a; ctx.strokeStyle = '#8fa0b8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W * 0.38, H * 0.38); ctx.lineTo(W * 0.62, H * 0.38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W * 0.60, H * 0.35); ctx.lineTo(W * 0.62, H * 0.38); ctx.lineTo(W * 0.60, H * 0.41); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.55); ctx.lineTo(W * 0.38, H * 0.55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W * 0.40, H * 0.52); ctx.lineTo(W * 0.38, H * 0.55); ctx.lineTo(W * 0.40, H * 0.58); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = '500 10px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign = 'center';
  ctx.fillText('BARTER', W * 0.5, H * 0.48);
};

const drawCoins = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.03;
  ctx.fillStyle = '#0d1320'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.42, scaleX = Math.cos(t);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(scaleX, 1);
  ctx.fillStyle = 'rgba(255,179,0,0.1)'; ctx.beginPath(); ctx.ellipse(0, 40, 30, 6, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(-30, 0, 30, 0);
  g.addColorStop(0, '#e6a200'); g.addColorStop(0.5, '#FFD54F'); g.addColorStop(1, '#e6a200');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c68f00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
  if (Math.abs(scaleX) > 0.2) { ctx.fillStyle = '#c68f00'; ctx.font = 'bold 18px Sora,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1); }
  ctx.restore();
  for (let i = 0; i < 6; i++) {
    const angle = t * 0.5 + i * (Math.PI * 2 / 6), r = 60 + Math.sin(t + i) * 10;
    ctx.fillStyle = 'rgba(255,179,0,0.15)'; ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.5, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.font = '500 10px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign = 'center'; ctx.fillText('UNIVERSAL VALUE', W / 2, H * 0.75);
};

const drawModernChart = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.015;
  ctx.fillStyle = '#0d1320'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 80; i++) {
    pts.push({ x: (i / 80) * W, y: H * 0.5 + Math.sin(t + i * 0.15) * 30 + Math.sin(t * 0.7 + i * 0.08) * 20 + Math.cos(t * 0.3 + i * 0.2) * 15 });
  }
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  const gf = ctx.createLinearGradient(0, 0, 0, H); gf.addColorStop(0, 'rgba(38,166,154,0.12)'); gf.addColorStop(1, 'transparent');
  ctx.fillStyle = gf; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#26A69A'; ctx.lineWidth = 2; ctx.stroke();
  const last = pts[pts.length - 1];
  ctx.fillStyle = '#26A69A'; ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(38,166,154,0.15)'; ctx.beginPath(); ctx.arc(last.x, last.y, 12 + Math.sin(f * 0.1) * 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '500 10px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign = 'center'; ctx.fillText('24/7 GLOBAL MARKETS', W / 2, H * 0.88);
};

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
    const colors = ['#26A69A', '#EF5350', '#FFB300', '#5de6d8', '#FFD54F', '#f48fb1'];
    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height - c.height,
      w: Math.random() * 8 + 4, h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2, vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360, rv: Math.random() * 6 - 3, a: 1,
    }));
    let frames = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rv;
        if (frames > 120) p.a -= 0.01;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.a);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
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
// TRADING SIMULATOR COMPONENT
// ============================================================
function TradingSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pricesRef = useRef([64250]);
  const [displayPrice, setDisplayPrice] = useState(64250);
  const [balance, setBalance] = useState(10000);
  const [position, setPosition] = useState<'buy' | 'sell' | null>(null);
  const [entryPrice, setEntryPrice] = useState(0);
  const [resultMsg, setResultMsg] = useState('Watch the price chart. When you think the price will go up, tap BUY. When you think it will go down, tap SELL.');
  const [resultType, setResultType] = useState<'neutral' | 'profit' | 'loss'>('neutral');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width = r.width * 2; canvas.height = r.height * 2;
      canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px';
    };
    resize();

    const tickInterval = setInterval(() => {
      const last = pricesRef.current[pricesRef.current.length - 1];
      const next = Math.max(60000, last + (Math.random() - 0.48) * 120);
      pricesRef.current.push(next);
      if (pricesRef.current.length > 120) pricesRef.current.shift();
      setDisplayPrice(next);
    }, 300);

    let animId: number;
    const draw = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      const w = canvas.width / 2, h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0d1320'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const prices = pricesRef.current;
      if (prices.length < 2) { animId = requestAnimationFrame(draw); return; }
      const min = Math.min(...prices) - 200, max = Math.max(...prices) + 200;
      const pts = prices.map((p, i) => ({ x: (i / (prices.length - 1)) * w, y: h - ((p - min) / (max - min)) * (h - 20) - 10 }));
      const up = prices[prices.length - 1] >= prices[prices.length - 2];
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const gc = ctx.createLinearGradient(0, 0, 0, h);
      gc.addColorStop(0, up ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)'); gc.addColorStop(1, 'transparent');
      ctx.fillStyle = gc; ctx.fill();
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = up ? '#26A69A' : '#EF5350'; ctx.lineWidth = 2; ctx.stroke();
      const lp = pts[pts.length - 1];
      ctx.fillStyle = up ? '#26A69A' : '#EF5350';
      ctx.beginPath(); ctx.arc(lp.x, lp.y, 3.5, 0, Math.PI * 2); ctx.fill();

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { clearInterval(tickInterval); cancelAnimationFrame(animId); };
  }, []);

  // Update PnL
  useEffect(() => {
    if (!position) return;
    const pnl = position === 'buy' ? (displayPrice - entryPrice) * 0.1 : (entryPrice - displayPrice) * 0.1;
    if (pnl >= 0) {
      setResultMsg(`Position: ${position.toUpperCase()} from $${entryPrice.toFixed(0)} — P&L: +$${pnl.toFixed(2)}`);
      setResultType('profit');
    } else {
      setResultMsg(`Position: ${position.toUpperCase()} from $${entryPrice.toFixed(0)} — P&L: -$${Math.abs(pnl).toFixed(2)}`);
      setResultType('loss');
    }
  }, [displayPrice, position, entryPrice]);

  const handleTrade = (dir: 'buy' | 'sell') => {
    if (position) {
      // Close
      const pnl = position === 'buy' ? (displayPrice - entryPrice) * 0.1 : (entryPrice - displayPrice) * 0.1;
      setBalance(b => b + pnl);
      setResultMsg(pnl >= 0 ? `Closed for +$${pnl.toFixed(2)} profit! ${pnl > 50 ? '🎉' : 'Good trade.'}` : `Closed for -$${Math.abs(pnl).toFixed(2)} loss. That's OK — managing losses is key.`);
      setResultType(pnl >= 0 ? 'profit' : 'loss');
      setPosition(null);
    } else {
      // Open
      setPosition(dir);
      setEntryPrice(displayPrice);
      setResultMsg(`Opened ${dir.toUpperCase()} at $${displayPrice.toFixed(0)}. Watch the chart — close when ready.`);
      setResultType('neutral');
    }
  };

  const priceUp = pricesRef.current.length > 1 && pricesRef.current[pricesRef.current.length - 1] >= pricesRef.current[pricesRef.current.length - 2];

  return (
    <div className="bg-[#0d1320] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <span className="font-bold">BTC / USD</span>
        <span className={`font-mono text-lg font-semibold ${priceUp ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
          ${displayPrice.toFixed(2)}
        </span>
      </div>
      <div ref={containerRef} className="w-full h-[160px] bg-[#0a0e17]">
        <canvas ref={canvasRef} />
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#141c2e] font-mono text-xs">
          <span className="text-[#4a5e78]">VIRTUAL BALANCE</span>
          <span className="font-semibold">${balance.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleTrade('buy')} className="flex-1 py-3.5 rounded-xl bg-[#26A69A] text-white font-bold text-sm active:scale-95 transition-transform hover:shadow-[0_4px_24px_rgba(38,166,154,0.3)]">
            {position === 'buy' ? 'CLOSE ✕' : 'BUY ▲'}
          </button>
          <button onClick={() => handleTrade('sell')} className="flex-1 py-3.5 rounded-xl bg-[#EF5350] text-white font-bold text-sm active:scale-95 transition-transform hover:shadow-[0_4px_24px_rgba(239,83,80,0.3)]">
            {position === 'sell' ? 'CLOSE ✕' : 'SELL ▼'}
          </button>
        </div>
        <div className={`p-4 rounded-xl text-sm leading-relaxed ${resultType === 'profit' ? 'bg-[rgba(38,166,154,0.06)] border border-[rgba(38,166,154,0.2)] text-[#26A69A]' : resultType === 'loss' ? 'bg-[rgba(239,83,80,0.06)] border border-[rgba(239,83,80,0.2)] text-[#EF5350]' : 'bg-[#141c2e] text-[#8fa0b8]'}`}>
          {resultMsg}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function WhatIsTradingLesson() {
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(Math.min(100, Math.round((window.scrollY / h) * 100)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const updated = [...quizAnswers];
    updated[qi] = oi;
    setQuizAnswers(updated);

    if (updated.every(a => a !== null)) {
      const correct = updated.filter((a, i) => a === quizQuestions[i].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setScore(pct);
      setQuizDone(true);
      if (pct >= 66) {
        setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800);
      }
    }
  };

  // Animation variants
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen bg-[#060a12] text-white">
      <Confetti active={showConfetti} />

      {/* Sticky Progress Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-[rgba(6,10,18,0.88)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)]">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-[#26A69A] to-[#FFB300] bg-clip-text text-transparent">
          ATLAS ACADEMY
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#26A69A] to-[#FFB300] transition-all duration-500" style={{ width: `${scrollPct}%` }} />
          </div>
          <span className="font-mono text-[10px] text-[#4a5e78] tracking-wide">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(38,166,154,0.15),rgba(38,166,154,0.03)_40%,transparent_70%)] pointer-events-none animate-pulse" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(38,166,154,0.08)] border border-[rgba(38,166,154,0.2)] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-[#26A69A]">Level 1 — Foundations</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(36px,8vw,64px)] font-extrabold leading-[1.08] tracking-tight mb-5">
            What Is<br /><span className="bg-gradient-to-r from-[#26A69A] via-[#5de6d8] to-[#FFB300] bg-clip-text text-transparent">Trading?</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-lg max-w-md mx-auto leading-relaxed">
            The oldest human skill, reinvented. From ancient bazaars to digital markets — this is where your journey begins.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[3px] uppercase text-[#4a5e78]">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-[#26A69A] rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: Origin */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="font-mono text-[10px] tracking-[3px] uppercase text-[#FFB300] mb-2">01 — The Origin</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight leading-tight mb-3">Trading Is as Old as Humanity</motion.h2>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-base leading-relaxed mb-8">Before money existed, before banks, before smartphones — humans traded. It&apos;s hardwired into us.</motion.p>
        </motion.div>

        {/* Story Cards */}
        {[
          { scene: drawBarter, title: 'The Barter Era', text: 'Thousands of years ago, trading meant <span style="color:#FFB300;font-weight:600">exchanging goods directly</span>. You had wheat, your neighbour had fish. You swapped. Simple — but limited. What if nobody wanted your wheat?' },
          { scene: drawCoins, title: 'The Birth of Money', text: 'Humans invented a solution: <span style="color:#FFB300;font-weight:600">money</span>. Shells, coins, paper — a universal medium everyone agreed had value. Now you could sell wheat to anyone and use that money to buy <span style="color:#26A69A;font-weight:600">anything</span>.' },
          { scene: drawModernChart, title: 'Modern Markets', text: 'Today, trading happens at the <span style="color:#26A69A;font-weight:600">speed of light</span>. Billions of pounds change hands every second. But the core idea? <span style="color:#FFB300;font-weight:600">Exactly the same as that wheat-for-fish swap.</span>' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-[#0d1320] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden mb-6 hover:border-[rgba(255,255,255,0.1)] transition-colors"
          >
            <AnimatedScene drawFn={card.scene} />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-[#8fa0b8] leading-relaxed" dangerouslySetInnerHTML={{ __html: card.text }} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Section 2: Core Idea */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="font-mono text-[10px] tracking-[3px] uppercase text-[#FFB300] mb-2">02 — The Core Idea</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight leading-tight mb-3">So What Exactly Is Trading?</motion.h2>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-base leading-relaxed mb-8">At its heart, trading is buying something at one price and selling it at another — hoping the difference is in your favour.</motion.p>
        </motion.div>

        {[
          { icon: '📈', title: 'Buying (Going Long)', desc: 'You believe the price will go up. Buy now, sell later higher.', color: '#26A69A', bg: 'rgba(38,166,154,0.1)' },
          { icon: '📉', title: 'Selling (Going Short)', desc: 'You believe the price will go down. Sell now, buy back cheaper.', color: '#EF5350', bg: 'rgba(239,83,80,0.1)' },
          { icon: '💰', title: 'Profit & Loss', desc: 'Price moves your way = profit. Against you = loss. Every trade has two outcomes.', color: '#FFB300', bg: 'rgba(255,179,0,0.1)' },
          { icon: '⚖️', title: 'Risk vs Reward', desc: 'Smart traders ask "how much could I lose?" first — and plan accordingly.', color: '#FFB300', bg: 'rgba(255,179,0,0.1)' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-[#0d1320] border border-[rgba(255,255,255,0.05)] mb-3 hover:border-[rgba(38,166,154,0.15)] hover:translate-x-1 transition-all"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: c.bg }}>{c.icon}</div>
            <div>
              <h4 className="font-bold text-[15px] mb-1">{c.title}</h4>
              <p className="text-sm text-[#8fa0b8] leading-relaxed">{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Section 3: Simulator */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="font-mono text-[10px] tracking-[3px] uppercase text-[#FFB300] mb-2">03 — Try It Yourself</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight leading-tight mb-3">Your First Trade</motion.h2>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-base leading-relaxed mb-8">This is a simulation — no real money. Watch the price, decide, and see what happens.</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <TradingSimulator />
        </motion.div>
      </section>

      {/* Section 4: Markets */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="font-mono text-[10px] tracking-[3px] uppercase text-[#FFB300] mb-2">04 — What Can You Trade?</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight leading-tight mb-3">The Markets</motion.h2>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-base leading-relaxed mb-8">There&apos;s a whole world of markets waiting.</motion.p>
        </motion.div>
        <div className="relative pl-7">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#26A69A] via-[#FFB300] to-[#EF5350] opacity-30 rounded" />
          {[
            { title: 'Forex (Foreign Exchange)', desc: 'The largest market on Earth — $7.5 trillion daily. Currency pairs like GBP/USD. Open 24/5.', color: '#26A69A' },
            { title: 'Stocks & Indices', desc: 'Own a piece of a company or trade entire market indexes like the S&P 500.', color: '#FFB300' },
            { title: 'Cryptocurrency', desc: 'Bitcoin, Ethereum and thousands more. 24/7 trading, wild swings, huge opportunity.', color: '#EF5350' },
            { title: 'Commodities & Options', desc: 'Gold, oil, wheat — physical goods. Options give advanced derivative strategies.', color: '#8fa0b8' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative mb-7 pl-5"
            >
              <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 bg-[#0d1320]" style={{ borderColor: item.color }} />
              <h4 className="font-bold text-[15px] mb-1" style={{ color: item.color }}>{item.title}</h4>
              <p className="text-sm text-[#8fa0b8] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="font-mono text-[10px] tracking-[3px] uppercase text-[#FFB300] mb-2">05 — Knowledge Check</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-tight leading-tight mb-3">Quick Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-[#8fa0b8] text-base leading-relaxed mb-8">Answer all 3 to unlock your Level 1 Certificate.</motion.p>
        </motion.div>

        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: qi * 0.1 }}
              className="bg-[#0d1320] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5"
            >
              <p className="font-mono text-[10px] tracking-[2px] uppercase text-[#FFB300] mb-2">Question {qi + 1} of {quizQuestions.length}</p>
              <p className="font-semibold text-[15px] leading-relaxed mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.correct;
                  const isSelected = quizAnswers[qi] === oi;
                  let classes = 'p-3 rounded-xl text-sm cursor-pointer transition-all border ';
                  if (!answered) classes += 'bg-[#141c2e] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] active:scale-[0.98]';
                  else if (isCorrect) classes += 'bg-[rgba(38,166,154,0.08)] border-[rgba(38,166,154,0.3)] text-[#26A69A]';
                  else if (isSelected) classes += 'bg-[rgba(239,83,80,0.08)] border-[rgba(239,83,80,0.3)] text-[#EF5350] opacity-60';
                  else classes += 'bg-[#141c2e] border-[rgba(255,255,255,0.03)] opacity-40 pointer-events-none';
                  return (
                    <div key={oi} className={classes} onClick={() => handleAnswer(qi, oi)}>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-[rgba(38,166,154,0.05)] border border-[rgba(38,166,154,0.12)] text-sm text-[#8fa0b8] leading-relaxed">
                  <span className="text-[#26A69A] font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 bg-[#0d1320] border border-[rgba(255,255,255,0.05)] rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>{score}%</p>
            <p className="text-sm text-[#8fa0b8]">
              {score === 100 ? 'Perfect score! You nailed it.' : score >= 66 ? "Great job! You've got the fundamentals." : 'Keep studying — review the lesson and try again.'}
            </p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 bg-[#0d1320] border border-[rgba(255,255,255,0.05)] rounded-2xl">
            <p className="text-4xl mb-3 opacity-30">🔒</p>
            <p className="text-sm text-[#4a5e78]">Complete the quiz above to unlock your <strong className="text-[#8fa0b8]">Level 1 Certificate</strong></p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 bg-gradient-to-br from-[#0d1320] to-[#141c2e] border border-[rgba(38,166,154,0.2)] rounded-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(38,166,154,0.04),transparent,rgba(255,179,0,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="relative z-10">
              <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-[#26A69A] to-[#FFB300] flex items-center justify-center text-3xl shadow-[0_8px_32px_rgba(38,166,154,0.3)]">
                🏆
              </div>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Completion</h3>
              <p className="text-sm text-[#8fa0b8] mb-5 leading-relaxed">
                Has successfully completed<br /><strong className="text-white">Level 1: What Is Trading?</strong><br />at ATLAS Academy by Interakktive
              </p>
              <p className="text-[#FFB300] font-bold text-lg mb-1">— Trader —</p>
              <p className="font-mono text-[11px] text-[#4a5e78] mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-[#4a5e78] tracking-wider uppercase">
                CERT-L1-{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next Lesson CTA */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="font-mono text-[10px] tracking-[3px] uppercase text-[#4a5e78] mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 1.2 — Asset Classes Explained</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#26A69A] to-[#1a8a80] text-white font-bold text-sm shadow-[0_4px_24px_rgba(38,166,154,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(38,166,154,0.3)] transition-all active:scale-95">
          Continue
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </section>
    </div>
  );
}
