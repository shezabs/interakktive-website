// app/academy/lesson/asset-classes/page.tsx
// ATLAS Academy — Lesson 1.2: Asset Classes Explained
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ============================================================
// ASSET CLASS DATA
// ============================================================
const assetClasses = [
  {
    id: 'forex',
    name: 'Forex',
    fullName: 'Foreign Exchange',
    icon: '🌍',
    color: '#0ea5e9',
    bgClass: 'bg-primary-500/10',
    borderClass: 'border-primary-500/30',
    textClass: 'text-primary-400',
    volume: '$7.5T daily',
    hours: '24/5',
    example: 'GBP/USD, EUR/JPY',
    volatility: 'Medium',
    minCapital: 'Low ($50+)',
    description: 'The foreign exchange market is where currencies are traded against each other. When you buy GBP/USD, you\'re buying British Pounds and selling US Dollars. It\'s the largest and most liquid market in the world.',
    howItWorks: 'Currencies trade in pairs. The first currency (base) is what you buy or sell. The second (quote) is what you pay with. If GBP/USD = 1.2700, one Pound costs $1.27.',
    whyTrade: 'Massive liquidity means tight spreads. Open nearly 24 hours. You can go long or short easily. Many brokers offer high leverage.',
    risks: 'Leverage amplifies losses. Currency moves can be sudden during news events. Requires understanding of global economics.',
  },
  {
    id: 'stocks',
    name: 'Stocks',
    fullName: 'Equities & Indices',
    icon: '📊',
    color: '#22c55e',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
    textClass: 'text-green-400',
    volume: '$200B+ daily (US)',
    hours: 'Market hours',
    example: 'Apple, Tesla, S&P 500',
    volatility: 'Medium-High',
    minCapital: 'Medium ($100+)',
    description: 'When you buy a stock, you own a tiny piece of a real company. Stock indices like the S&P 500 track the performance of a group of stocks, letting you trade the whole market at once.',
    howItWorks: 'Companies list shares on exchanges (NYSE, NASDAQ). You buy shares hoping the price goes up. Some stocks also pay dividends — a share of the company\'s profits sent to you regularly.',
    whyTrade: 'Own real assets with real value. Dividends provide passive income. Massive amount of research and data available. Easy to understand — you\'re betting on companies you know.',
    risks: 'Markets can crash suddenly. Individual stocks can go to zero. Trading hours are limited. Requires more capital for meaningful positions.',
  },
  {
    id: 'crypto',
    name: 'Crypto',
    fullName: 'Cryptocurrency',
    icon: '₿',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    volume: '$50B+ daily',
    hours: '24/7',
    example: 'BTC, ETH, SOL',
    volatility: 'Very High',
    minCapital: 'Low ($10+)',
    description: 'Cryptocurrencies are digital assets that run on blockchain technology. Bitcoin was the first, launched in 2009. Today there are thousands, each with different purposes and technologies.',
    howItWorks: 'You buy and sell digital tokens on exchanges like Binance or Coinbase. Prices are purely driven by supply and demand — there are no earnings reports or dividends. The market never closes.',
    whyTrade: 'Highest volatility means biggest potential gains. Market is open 24/7/365. Low barrier to entry. Decentralised — no single government controls it.',
    risks: 'Extreme volatility — 20% swings in a day are normal. Scams and rug pulls are common. Regulations are still evolving. Many projects fail completely.',
  },
  {
    id: 'commodities',
    name: 'Commodities',
    fullName: 'Physical Goods',
    icon: '🥇',
    color: '#d946ef',
    bgClass: 'bg-accent-500/10',
    borderClass: 'border-accent-500/30',
    textClass: 'text-accent-400',
    volume: 'Varies',
    hours: 'Near 24/5',
    example: 'Gold, Oil, Silver',
    volatility: 'Medium',
    minCapital: 'Medium ($100+)',
    description: 'Commodities are raw materials — things you can physically touch. Gold, oil, wheat, coffee, natural gas. They\'ve been traded for thousands of years and remain essential to the global economy.',
    howItWorks: 'Most retail traders use CFDs or futures contracts — you don\'t actually take delivery of barrels of oil. You\'re trading the price movement. Gold (XAUUSD) is one of the most popular.',
    whyTrade: 'Gold is a safe haven during crises. Oil moves with geopolitics. Commodities diversify your portfolio. Some have strong seasonal patterns.',
    risks: 'Can be heavily influenced by unpredictable events (weather, wars, OPEC decisions). Futures have expiry dates. Spreads can be wider than forex.',
  },
];

// ============================================================
// QUIZ
// ============================================================
const quizQuestions = [
  {
    q: "Which market is open 24 hours a day, 7 days a week?",
    opts: ["Forex", "Stocks", "Cryptocurrency", "Commodities"],
    correct: 2,
    explain: "Crypto markets never close — they trade 24/7/365. Forex is close (24/5) but closes on weekends.",
  },
  {
    q: "When you buy GBP/USD, what are you actually doing?",
    opts: [
      "Buying British Pounds and selling US Dollars",
      "Buying US Dollars and selling British Pounds",
      "Buying shares in a British company",
      "Converting your account to Pounds",
    ],
    correct: 0,
    explain: "In a currency pair, the first currency (GBP) is what you're buying. The second (USD) is what you're selling/paying with.",
  },
  {
    q: "What does buying a stock actually mean?",
    opts: [
      "You're lending money to a company",
      "You own a small piece of that company",
      "You're betting the market will go up",
      "You get a guaranteed return",
    ],
    correct: 1,
    explain: "A share of stock represents actual ownership in the company. You own a tiny fraction of everything that company has.",
  },
  {
    q: "XAUUSD is the trading symbol for which commodity?",
    opts: ["Silver", "Oil", "Gold", "Wheat"],
    correct: 2,
    explain: "XAU is the chemical symbol for gold. XAUUSD means the price of gold measured in US Dollars.",
  },
];

// ============================================================
// ANIMATED SCENES
// ============================================================
function AnimatedScene({ drawFn, height = 200 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.1 });
  const frameRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const resize = () => { const r = container.getBoundingClientRect(); canvas.width = r.width * 2; canvas.height = r.height * 2; canvas.style.width = r.width + 'px'; canvas.style.height = r.height + 'px'; };
    resize(); window.addEventListener('resize', resize);
    const loop = () => { if (isInView) { ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); drawFn(ctx, canvas.width / 2, canvas.height / 2, frameRef.current); } frameRef.current++; animId = requestAnimationFrame(loop); };
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [isInView, drawFn]);
  return (
    <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" style={{ height, background: 'rgba(0,0,0,0.3)' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// Forex scene — currency pairs flowing
const drawForex = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.015;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
  const pairs = ['GBP/USD', 'EUR/JPY', 'USD/CHF', 'AUD/NZD', 'EUR/USD'];
  pairs.forEach((p, i) => {
    const x = ((t * 40 + i * (W / pairs.length)) % (W + 100)) - 50;
    const y = 30 + i * 32;
    const a = Math.min(1, Math.min(x / 50, (W - x) / 50));
    ctx.globalAlpha = Math.max(0, a) * 0.6;
    ctx.font = '600 14px sans-serif'; ctx.fillStyle = '#0ea5e9'; ctx.textAlign = 'left';
    ctx.fillText(p, x, y);
    const price = (1.1 + Math.sin(t + i * 2) * 0.15).toFixed(4);
    ctx.font = '500 12px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(price, x + 80, y);
  });
  ctx.globalAlpha = 1;
  // Globe
  const cx = W / 2, cy = H * 0.65;
  ctx.strokeStyle = 'rgba(14,165,233,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, 35, 15, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, 15, 35, 0, 0, Math.PI * 2); ctx.stroke();
  // Rotating dot
  const dx = cx + Math.cos(t) * 35, dy = cy + Math.sin(t) * 15;
  ctx.fillStyle = '#0ea5e9'; ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
};

// Stocks scene — bar chart growing
const drawStocks = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.02;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
  const tickers = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];
  const barW = Math.min(35, (W - 80) / tickers.length - 8);
  tickers.forEach((tk, i) => {
    const x = 40 + i * (barW + 8);
    const maxH = H * 0.6;
    const h = maxH * (0.3 + Math.abs(Math.sin(t + i * 1.2)) * 0.7);
    const growing = Math.sin(t * 2 + i) > 0;
    ctx.fillStyle = growing ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.4)';
    ctx.beginPath();
    const r = 3;
    const bx = x, by = H * 0.82 - h, bw = barW, bh = h;
    ctx.moveTo(bx + r, by); ctx.lineTo(bx + bw - r, by); ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + r); ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.fill();
    ctx.font = '500 8px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.textAlign = 'center';
    ctx.fillText(tk, x + barW / 2, H * 0.92);
  });
};

// Crypto scene — blockchain blocks
const drawCrypto = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.02;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
  // Chain of blocks
  for (let i = 0; i < 5; i++) {
    const x = 30 + i * (W - 60) / 4;
    const y = H / 2 + Math.sin(t + i * 0.8) * 10;
    const s = 28;
    // Block
    ctx.fillStyle = `rgba(245,158,11,${0.15 + Math.sin(t + i) * 0.05})`;
    ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - s / 2 + 4, y - s / 2); ctx.lineTo(x + s / 2 - 4, y - s / 2);
    ctx.quadraticCurveTo(x + s / 2, y - s / 2, x + s / 2, y - s / 2 + 4);
    ctx.lineTo(x + s / 2, y + s / 2 - 4); ctx.quadraticCurveTo(x + s / 2, y + s / 2, x + s / 2 - 4, y + s / 2);
    ctx.lineTo(x - s / 2 + 4, y + s / 2); ctx.quadraticCurveTo(x - s / 2, y + s / 2, x - s / 2, y + s / 2 - 4);
    ctx.lineTo(x - s / 2, y - s / 2 + 4); ctx.quadraticCurveTo(x - s / 2, y - s / 2, x - s / 2 + 4, y - s / 2);
    ctx.fill(); ctx.stroke();
    // Chain link
    if (i < 4) {
      const nx = 30 + (i + 1) * (W - 60) / 4;
      const ny = H / 2 + Math.sin(t + (i + 1) * 0.8) * 10;
      ctx.strokeStyle = 'rgba(245,158,11,0.15)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + s / 2, y); ctx.lineTo(nx - s / 2, ny); ctx.stroke();
      // Animated pulse along chain
      const progress = (Math.sin(t * 3 + i) + 1) / 2;
      const px = x + s / 2 + (nx - s / 2 - x - s / 2) * progress;
      const py = y + (ny - y) * progress;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    }
    // Hash text
    ctx.font = '500 7px monospace'; ctx.fillStyle = 'rgba(245,158,11,0.5)'; ctx.textAlign = 'center';
    ctx.fillText('#' + (i + 1), x, y + 3);
  }
  // BTC symbol floating
  ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = 'rgba(245,158,11,0.2)'; ctx.textAlign = 'center';
  ctx.fillText('₿', W * 0.15, H * 0.2 + Math.sin(t) * 5);
  ctx.fillText('Ξ', W * 0.85, H * 0.25 + Math.sin(t + 1) * 5);
};

// Commodities scene — gold bars + oil drops
const drawCommodities = (ctx: CanvasRenderingContext2D, W: number, H: number, f: number) => {
  const t = f * 0.02;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
  // Gold bar
  const gx = W * 0.3, gy = H * 0.5;
  ctx.fillStyle = '#d97706';
  ctx.beginPath(); ctx.moveTo(gx - 25, gy + 10); ctx.lineTo(gx - 15, gy - 10); ctx.lineTo(gx + 15, gy - 10); ctx.lineTo(gx + 25, gy + 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.beginPath(); ctx.moveTo(gx + 25, gy + 10); ctx.lineTo(gx + 15, gy - 10); ctx.lineTo(gx + 25, gy - 5); ctx.lineTo(gx + 35, gy + 15); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#92400e';
  ctx.beginPath(); ctx.moveTo(gx - 25, gy + 10); ctx.lineTo(gx + 25, gy + 10); ctx.lineTo(gx + 35, gy + 15); ctx.lineTo(gx - 15, gy + 15); ctx.closePath(); ctx.fill();
  ctx.font = 'bold 8px sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center'; ctx.fillText('Au', gx, gy + 4);
  ctx.font = '500 9px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('GOLD', gx, gy + 30);
  // Oil drop
  const ox = W * 0.7, oy = H * 0.45 + Math.sin(t) * 5;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.moveTo(ox, oy - 20); ctx.quadraticCurveTo(ox + 18, oy, ox + 14, oy + 12);
  ctx.quadraticCurveTo(ox, oy + 22, ox - 14, oy + 12); ctx.quadraticCurveTo(ox - 18, oy, ox, oy - 20); ctx.fill();
  ctx.strokeStyle = 'rgba(217,70,239,0.4)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(217,70,239,0.3)'; ctx.beginPath(); ctx.arc(ox - 4, oy + 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '500 9px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'center'; ctx.fillText('OIL', ox, oy + 35);
  // Wheat
  const wx = W * 0.5, wy = H * 0.82;
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx - 8 + i * 8, wy); ctx.lineTo(wx - 8 + i * 8, wy - 15); ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,0.25)'; ctx.beginPath(); ctx.ellipse(wx - 8 + i * 8, wy - 18, 3, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
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
    const colors = ['#0ea5e9', '#d946ef', '#38bdf8', '#e879f9', '#7dd3fc', '#f0abfc'];
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
      pieces.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      frames++; if (frames < 250) requestAnimationFrame(draw);
    };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AssetClassesLesson() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setScrollPct(Math.min(100, Math.round((window.scrollY / h) * 100))); };
    window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll);
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
  const selectedData = assetClasses.find(a => a.id === selectedAsset);

  return (
    <div className="min-h-screen">
      <Confetti active={showConfetti} />

      {/* Sticky Progress */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
          ATLAS ACADEMY
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${scrollPct}%` }} />
          </div>
          <span className="font-mono text-[10px] text-gray-500">{scrollPct}%</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-400">Level 1 — Foundations</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,56px)] font-bold leading-[1.1] tracking-tight mb-5">
            Asset Classes<br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Explained</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Forex, Stocks, Crypto, Commodities — each market has its own personality. Learn what makes them tick.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-primary-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Section 1: What is an Asset Class */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">01 — The Big Picture</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">What Is an Asset Class?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">
            An asset class is simply a <strong>group of similar financial instruments</strong>. Just like "fruit" is a category that contains apples, oranges, and bananas — "Forex" is a category that contains GBP/USD, EUR/JPY, and thousands of other currency pairs.
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">
            Each asset class behaves differently, moves for different reasons, and suits different types of traders. There&apos;s no single "best" market — only the <strong className="text-white">best market for you</strong>.
          </motion.p>
        </motion.div>
      </section>

      {/* Section 2: The Four Markets — Animated Scenes */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">02 — The Four Markets</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-8">Tap a Market to Explore</motion.h2>
        </motion.div>

        {/* Asset selector tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {assetClasses.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => setSelectedAsset(selectedAsset === a.id ? null : a.id)}
              className={`p-4 rounded-2xl border text-center transition-all active:scale-95 ${
                selectedAsset === a.id
                  ? `${a.bgClass} ${a.borderClass}`
                  : 'glass hover:bg-white/[0.08]'
              }`}
            >
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className={`font-bold text-sm ${selectedAsset === a.id ? a.textClass : ''}`}>{a.name}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{a.hours}</div>
            </motion.button>
          ))}
        </div>

        {/* Expanded asset detail */}
        <AnimatePresence mode="wait">
          {selectedData && (
            <motion.div
              key={selectedData.id}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl overflow-hidden mb-6">
                {/* Animated scene */}
                <AnimatedScene
                  drawFn={
                    selectedData.id === 'forex' ? drawForex :
                    selectedData.id === 'stocks' ? drawStocks :
                    selectedData.id === 'crypto' ? drawCrypto :
                    drawCommodities
                  }
                />

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{selectedData.icon}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${selectedData.textClass}`}>{selectedData.fullName}</h3>
                      <p className="text-xs text-gray-500">{selectedData.volume} volume · {selectedData.hours} trading</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed mb-5">{selectedData.description}</p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Example', value: selectedData.example },
                      { label: 'Volatility', value: selectedData.volatility },
                      { label: 'Min Capital', value: selectedData.minCapital },
                    ].map((s, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 text-center">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</div>
                        <div className="text-xs font-semibold">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Expandable sections */}
                  {[
                    { title: 'How It Works', content: selectedData.howItWorks, icon: '⚙️' },
                    { title: 'Why Trade It', content: selectedData.whyTrade, icon: '✅' },
                    { title: 'Key Risks', content: selectedData.risks, icon: '⚠️' },
                  ].map((section, i) => (
                    <div key={i} className="mb-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{section.icon}</span>
                        <h4 className="font-semibold text-sm">{section.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedAsset && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-gray-600 py-8">
            👆 Tap any market above to see its animated explanation
          </motion.p>
        )}
      </section>

      {/* Section 3: Comparison Table */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">03 — Side by Side</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Quick Comparison</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 text-base leading-relaxed mb-8">How the four major asset classes stack up against each other.</motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Feature</th>
                  {assetClasses.map(a => (
                    <th key={a.id} className="p-4 text-center">
                      <span className="text-lg">{a.icon}</span>
                      <div className={`text-xs font-bold mt-1 ${a.textClass}`}>{a.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Hours', key: 'hours' as const },
                  { label: 'Volatility', key: 'volatility' as const },
                  { label: 'Min Capital', key: 'minCapital' as const },
                ].map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.04]">
                    <td className="p-4 text-gray-500 text-xs uppercase tracking-wider">{row.label}</td>
                    {assetClasses.map(a => (
                      <td key={a.id} className="p-4 text-center text-xs text-gray-300">{a[row.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Key Takeaway */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">04 — The Key Takeaway</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-6">There Is No "Best" Market</motion.h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-t-2xl" />
          <p className="text-gray-300 leading-relaxed mb-4">
            The right market depends on <strong className="text-white">your personality, your capital, and your schedule</strong>.
          </p>
          <div className="space-y-3">
            {[
              { emoji: '⏰', text: 'Only free in evenings? Crypto trades 24/7, or catch the US stock session.' },
              { emoji: '💷', text: 'Small account? Forex and crypto have the lowest entry barriers.' },
              { emoji: '🧘', text: 'Hate volatility? Forex majors are calmer. Love it? Crypto is your playground.' },
              { emoji: '📰', text: 'Follow company news? Stocks let you trade what you understand.' },
            ].map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 text-sm">
                <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                <p className="text-gray-400 leading-relaxed">{tip.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 5: Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">05 — Knowledge Check</motion.p>
          <motion.h2 variants={fadeUp} className="text-[clamp(26px,5vw,36px)] font-bold tracking-tight leading-tight mb-3">Quick Quiz</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-300 text-base leading-relaxed mb-8">Answer all 4 to unlock your certificate for this lesson.</motion.p>
        </motion.div>
        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: qi * 0.08 }}
              className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
              <p className="font-semibold text-[15px] leading-relaxed mb-4">{q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.correct;
                  const isSelected = quizAnswers[qi] === oi;
                  let classes = 'p-3 rounded-xl text-sm cursor-pointer transition-all border ';
                  if (!answered) classes += 'bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.98]';
                  else if (isCorrect) classes += 'bg-green-500/10 border-green-500/30 text-green-400';
                  else if (isSelected) classes += 'bg-red-500/10 border-red-500/30 text-red-400 opacity-60';
                  else classes += 'bg-white/[0.02] border-white/[0.03] opacity-40 pointer-events-none';
                  return <div key={oi} className={classes} onClick={() => handleAnswer(qi, oi)}>{opt}</div>;
                })}
              </div>
              {quizAnswers[qi] !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/15 text-sm text-gray-400 leading-relaxed">
                  <span className="text-primary-400 font-bold">✓</span> {q.explain}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {quizDone && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center p-8 glass-card rounded-2xl">
            <p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-green-400' : 'text-red-400'}`}>{score}%</p>
            <p className="text-sm text-gray-400">{score === 100 ? 'Perfect score!' : score >= 66 ? "Great job! You know your markets." : 'Review the lesson and try again.'}</p>
          </motion.div>
        )}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl">
            <p className="text-4xl mb-3 opacity-30">🔒</p>
            <p className="text-sm text-gray-500">Complete the quiz to unlock your <strong className="text-gray-300">Lesson 1.2 Certificate</strong></p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 glass-card rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(14,165,233,0.04),transparent,rgba(217,70,239,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="relative z-10">
              <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg shadow-primary-500/30">🏆</div>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Completion</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Has successfully completed<br /><strong className="text-white">Level 1.2: Asset Classes Explained</strong><br />at ATLAS Academy by Interakktive
              </p>
              <p className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-gray-600 tracking-wider uppercase">CERT-L1.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next Lesson */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 1.3 — Anatomy of a Candlestick</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95">
          Continue
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </section>
    </div>
  );
}
