// app/academy/lesson/volume-analysis/page.tsx
// ATLAS Academy — Lesson 2.7: Volume Analysis [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Target, Award, Zap, Eye, Activity, BarChart3, TrendingUp } from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// ============================================================
// PRICE + VOLUME DATA
// ============================================================
function generateVolumeData(): { prices: number[]; volumes: number[] } {
  const rand = seededRandom(77);
  const prices: number[] = [100];
  const volumes: number[] = [];

  for (let i = 1; i < 200; i++) {
    const noise = (rand() - 0.5) * 3;
    // Trending phases with volume spikes
    let trend = 0;
    let volMult = 1;

    // Phase 1: Quiet accumulation (low vol, slight uptrend)
    if (i < 40) { trend = 0.1; volMult = 0.5; }
    // Phase 2: Breakout with volume surge
    else if (i < 60) { trend = 0.6; volMult = 2.5; }
    // Phase 3: Continuation with declining volume (divergence)
    else if (i < 90) { trend = 0.3; volMult = 0.3 + (90 - i) * 0.01; }
    // Phase 4: Reversal with climax volume
    else if (i < 100) { trend = -0.8; volMult = 3.5; }
    // Phase 5: Downtrend with normal volume
    else if (i < 140) { trend = -0.3; volMult = 1.2; }
    // Phase 6: Capitulation (huge sell volume)
    else if (i < 150) { trend = -1.0; volMult = 4.0; }
    // Phase 7: Recovery start
    else if (i < 180) { trend = 0.2; volMult = 1.5; }
    // Phase 8: New uptrend
    else { trend = 0.4; volMult = 1.8; }

    prices.push(prices[i - 1] + noise + trend);
    const baseVol = 50000 + (rand() - 0.3) * 30000;
    volumes.push(Math.max(5000, baseVol * volMult));
  }
  volumes.unshift(50000);
  return { prices, volumes };
}

const { prices: mainPrices, volumes: mainVolumes } = generateVolumeData();
const avgVolume = mainVolumes.reduce((a, b) => a + b, 0) / mainVolumes.length;

// OBV calculation
function calcOBV(prices: number[], volumes: number[]): number[] {
  const obv: number[] = [0];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) obv.push(obv[i - 1] + volumes[i]);
    else if (prices[i] < prices[i - 1]) obv.push(obv[i - 1] - volumes[i]);
    else obv.push(obv[i - 1]);
  }
  return obv;
}

// ============================================================
// GAME SCENARIO DATA
// ============================================================
function genGameScenario(type: string, seed: number): { prices: number[]; volumes: number[] } {
  const rand = seededRandom(seed);
  const p: number[] = [100];
  const v: number[] = [50000];

  for (let i = 1; i < 80; i++) {
    const noise = (rand() - 0.5) * 3;
    let trend = 0, volMult = 1;

    switch (type) {
      case 'confirmed_up':
        // Strong uptrend with rising volume = confirmation
        trend = 0.4 + (i > 40 ? 0.3 : 0);
        volMult = 0.8 + (i / 80) * 2;
        break;
      case 'divergence_bearish':
        // Price rising but volume declining = bearish divergence
        trend = 0.3;
        volMult = Math.max(0.3, 2.5 - (i / 80) * 2.5);
        break;
      case 'climax_sell':
        // Downtrend ending with massive volume spike (capitulation)
        if (i < 50) { trend = -0.4; volMult = 1; }
        else if (i < 60) { trend = -1.2; volMult = 4.5; }
        else { trend = 0.3; volMult = 1.5; }
        break;
      case 'low_vol_breakout':
        // Breakout on LOW volume = likely false
        if (i < 50) { trend = 0; volMult = 1; }
        else { trend = 0.5; volMult = 0.3; }
        break;
      case 'accumulation':
        // Sideways with slowly rising volume = smart money accumulating
        trend = (rand() - 0.5) * 0.2;
        volMult = 0.5 + (i / 80) * 1.5;
        break;
    }

    p.push(p[i - 1] + noise + trend);
    v.push(Math.max(5000, (40000 + (rand() - 0.3) * 25000) * volMult));
  }
  return { prices: p, volumes: v };
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
// CROWD ANIMATION (layman analogy)
// ============================================================
function CrowdAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const midX = w / 2;
    const phase = (f % 360) / 360;
    const isActive = phase < 0.5; // First half = busy, second half = quiet

    // Background
    ctx.fillStyle = isActive ? 'rgba(14,165,233,0.06)' : 'rgba(100,100,120,0.04)';
    ctx.fillRect(0, 0, w, h);

    // Label
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = isActive ? '#0ea5e9' : '#6b7280';
    ctx.fillText(isActive ? '📢 HIGH VOLUME — Busy Market' : '😴 LOW VOLUME — Quiet Market', midX, 22);

    // Draw people (more when active)
    const count = isActive ? 30 : 6;
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 13.37 + (isActive ? 0 : 1000)) * 10000;
      const px = (Math.abs(seed % w * 0.85)) + w * 0.075;
      const py = 50 + (Math.abs((seed * 1.3) % (h - 80)));
      const wobble = Math.sin(f * 0.05 + i * 0.7) * 3;
      ctx.globalAlpha = isActive ? 0.85 : 0.4;
      ctx.fillText('🧑', px + wobble, py);
    }
    ctx.globalAlpha = 1;

    // Bar chart at bottom showing volume comparison
    const barW = 60, barH = isActive ? 60 : 15;
    ctx.fillStyle = isActive ? '#0ea5e9' : '#374151';
    ctx.fillRect(midX - barW / 2, h - 20 - barH, barW, barH);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px system-ui';
    ctx.fillText('VOLUME', midX, h - 5);
  }, []);

  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// CHART RENDERER WITH VOLUME BARS
// ============================================================
function VolumeChart({
  prices,
  volumes,
  showOBV = false,
  highlightClimax = false,
  highlightDivergence = false,
  height = 380,
}: {
  prices: number[];
  volumes: number[];
  showOBV?: boolean;
  highlightClimax?: boolean;
  highlightDivergence?: boolean;
  height?: number;
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

    const priceH = showOBV ? h * 0.4 : h * 0.55;
    const volH = h * 0.25;
    const obvH = showOBV ? h * 0.2 : 0;
    const priceTop = 10;
    const volTop = priceTop + priceH + 15;
    const obvTop = volTop + volH + 15;

    // Background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    const len = prices.length;
    const cw = (w - 40) / len;
    const pMin = Math.min(...prices), pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;
    const vMax = Math.max(...volumes);

    const px = (i: number) => 20 + i * cw + cw / 2;
    const py = (p: number) => priceTop + priceH - ((p - pMin) / pRange) * (priceH - 20);
    const vy = (v: number) => volTop + volH - (v / vMax) * (volH - 5);

    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();

    // Volume bars
    for (let i = 0; i < len; i++) {
      const isUp = i > 0 && prices[i] >= prices[i - 1];
      const isClimax = volumes[i] > avgVol * 2.5;

      if (highlightClimax && isClimax) {
        ctx.fillStyle = 'rgba(245,158,11,0.9)';
      } else {
        ctx.fillStyle = isUp ? 'rgba(14,165,233,0.5)' : 'rgba(217,70,239,0.5)';
      }

      const barTop = vy(volumes[i]);
      const barBot = volTop + volH;
      ctx.fillRect(px(i) - cw * 0.35, barTop, cw * 0.7, barBot - barTop);
    }

    // Average volume line
    const avgY = vy(avgVol);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(156,163,175,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, avgY);
    ctx.lineTo(w - 20, avgY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Volume label
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('AVG', w - 22, avgY - 3);

    // Volume divergence highlight
    if (highlightDivergence) {
      // Find the divergence zone (Phase 3: prices 60-90 where price rises but volume falls)
      const divStart = Math.floor(len * 0.3);
      const divEnd = Math.floor(len * 0.45);
      ctx.fillStyle = 'rgba(245,158,11,0.08)';
      ctx.fillRect(px(divStart) - cw, priceTop, px(divEnd) - px(divStart) + cw * 2, priceH + volH + 20);
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(px(divStart) - cw, priceTop, px(divEnd) - px(divStart) + cw * 2, priceH + volH + 20);
      ctx.setLineDash([]);

      // Arrows
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Price ↑ but Volume ↓ = WARNING', (px(divStart) + px(divEnd)) / 2, priceTop + 14);
    }

    // OBV
    if (showOBV) {
      const obv = calcOBV(prices, volumes);
      const obvMin = Math.min(...obv), obvMax = Math.max(...obv);
      const obvRange = obvMax - obvMin || 1;
      const obvPy = (v: number) => obvTop + obvH - ((v - obvMin) / obvRange) * (obvH - 10);

      ctx.fillStyle = 'rgba(14,165,233,0.03)';
      ctx.fillRect(0, obvTop - 5, w, obvH + 15);

      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < len; i++) {
        i === 0 ? ctx.moveTo(px(i), obvPy(obv[i])) : ctx.lineTo(px(i), obvPy(obv[i]));
      }
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('OBV', 22, obvTop + 3);
    }

    // Section labels
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', 22, priceTop + 12);
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('VOLUME', 22, volTop + 12);
  }, [prices, volumes, showOBV, highlightClimax, highlightDivergence, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl bg-[#060a12]" />;
}

// ============================================================
// MINI GAME CHART
// ============================================================
function MiniGameChart({ prices, volumes }: { prices: number[]; volumes: number[] }) {
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

    const priceH = h * 0.55;
    const volH = h * 0.3;
    const priceTop = 5;
    const volTop = priceH + 15;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    const len = prices.length;
    const cw = (w - 20) / len;
    const pMin = Math.min(...prices), pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;
    const vMax = Math.max(...volumes);

    const px = (i: number) => 10 + i * cw + cw / 2;
    const py = (p: number) => priceTop + priceH - ((p - pMin) / pRange) * (priceH - 10);

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();

    // Volume bars
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    for (let i = 0; i < len; i++) {
      const isUp = i > 0 && prices[i] >= prices[i - 1];
      const isHigh = volumes[i] > avgVol * 2;
      ctx.fillStyle = isHigh ? 'rgba(245,158,11,0.7)' : isUp ? 'rgba(14,165,233,0.4)' : 'rgba(217,70,239,0.4)';
      const barH = (volumes[i] / vMax) * (volH - 5);
      ctx.fillRect(px(i) - cw * 0.35, volTop + volH - barH, cw * 0.7, barH);
    }
  }, [prices, volumes]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 250 }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function VolumeAnalysisLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showOBV, setShowOBV] = useState(false);
  const [showClimax, setShowClimax] = useState(false);
  const [showDivergence, setShowDivergence] = useState(false);

  // Game state
  const scenarios = useMemo(() => [
    { type: 'confirmed_up', label: 'Volume Confirms Uptrend', answer: 0, explain: 'Price is rising AND volume is rising. More traders are backing this move — it\'s genuine. Volume is the crowd cheering louder and louder. That\'s confirmation.' },
    { type: 'divergence_bearish', label: 'Bearish Volume Divergence', answer: 1, explain: 'Price keeps climbing but volume is shrinking. Fewer and fewer traders believe in this move. It\'s like a party where people are quietly leaving — it\'s about to end.' },
    { type: 'climax_sell', label: 'Climax / Capitulation Volume', answer: 2, explain: 'A massive volume spike during a sharp selloff. This is panic selling — the last sellers throwing in the towel. Often marks the bottom because there\'s nobody left to sell.' },
    { type: 'low_vol_breakout', label: 'Low Volume Breakout (Fake)', answer: 3, explain: 'Price breaks out of a range but volume doesn\'t increase. Without volume backing it, this breakout has no conviction — it\'s likely a fakeout that will reverse.' },
    { type: 'accumulation', label: 'Quiet Accumulation', answer: 4, explain: 'Price goes sideways but volume is slowly building. Smart money is quietly buying without pushing price up. When they\'re done accumulating, the breakout will be real — and volume will explode.' },
  ], []);

  const gameData = useMemo(() => scenarios.map((s, i) => genGameScenario(s.type, 200 + i * 37)), [scenarios]);
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const newA = [...gameAnswers];
    newA[gameRound] = choice;
    setGameAnswers(newA);
    if (choice === scenarios[gameRound].answer) setGameScore(s => s + 1);
    setGameShowNext(true);
  };

  const nextRound = () => {
    if (gameRound < 4) {
      setGameRound(r => r + 1);
      setGameShowNext(false);
    } else {
      setGameComplete(true);
    }
  };

  const resetGame = () => {
    setGameRound(0);
    setGameAnswers(Array(5).fill(null));
    setGameScore(0);
    setGameShowNext(false);
    setGameComplete(false);
  };

  // Quiz state
  const quizQuestions = useMemo(() => [
    { q: 'What does increasing volume during a price rise indicate?', opts: ['Price will crash soon', 'The uptrend is confirmed by participation', 'Nothing — volume is irrelevant', 'You should sell immediately'], a: 1, explain: 'Rising price + rising volume = confirmation. More traders are backing the move, making it more likely to continue.' },
    { q: 'Price makes a new high but volume is lower than the previous high. What is this called?', opts: ['Volume accumulation', 'Bullish confirmation', 'Volume divergence', 'Climax volume'], a: 2, explain: 'This is bearish volume divergence. Price goes higher but fewer traders participate — the move is losing steam.' },
    { q: 'A massive spike in volume during a sharp selloff is called:', opts: ['Distribution volume', 'Accumulation volume', 'Climax / capitulation volume', 'Breakout volume'], a: 2, explain: 'Climax volume during a selloff = panic selling (capitulation). The last sellers dump everything. Often marks a bottom.' },
    { q: 'Price breaks above resistance but volume is very low. What should you expect?', opts: ['Strong continuation of the breakout', 'The breakout is likely false — a fakeout', 'Volume doesn\'t matter for breakouts', 'Buy immediately'], a: 1, explain: 'Breakouts need volume to be real. A breakout on low volume is like a car trying to drive uphill with no fuel — it\'ll roll back.' },
    { q: 'What does On-Balance Volume (OBV) measure?', opts: ['The average trading volume', 'Cumulative buying vs selling pressure', 'The highest volume bar', 'The number of trades per minute'], a: 1, explain: 'OBV adds volume on up days and subtracts volume on down days. A rising OBV means buyers are accumulating — even if price hasn\'t moved yet.' },
    { q: 'Which market has typically the HIGHEST volume?', opts: ['Crypto markets (24/7)', 'During lunch hours', 'At the London/New York overlap', 'Just before market close'], a: 2, explain: 'The London/New York session overlap (1-4pm UK time) has the most traders active worldwide, creating the highest volume and best opportunities.' },
    { q: 'If volume is decreasing while price trends sideways, what is likely happening?', opts: ['A trend reversal', 'Smart money is accumulating', 'The market is losing interest — a breakout may follow', 'Nothing meaningful'], a: 2, explain: 'Decreasing volume in a range = energy building. Like a compressed spring — the longer it compresses (lower volume), the more explosive the breakout.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(7).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  // Confetti
  useEffect(() => {
    if (!certUnlocked) return;
    const id = setInterval(() => {}, 50);
    return () => clearInterval(id);
  }, [certUnlocked]);

  // Scroll
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const gameOptions = ['Volume Confirms Move', 'Volume Divergence', 'Climax / Capitulation', 'Low Volume Breakout (Fake)', 'Quiet Accumulation'];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 7</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Volume Analysis</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The truth behind every price move. Learn to hear what the crowd is really saying.</p>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 00 — WHY THIS MATTERS (Layman) */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>

          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🎪 Think of a marketplace.</p>
            <p className="text-gray-400 leading-relaxed mb-4">
              Imagine you&apos;re at a car boot sale. If a seller drops their price and <strong className="text-white">nobody cares</strong> — that price drop means nothing. But if a seller drops their price and <strong className="text-primary-400">50 people rush over</strong> — that&apos;s real demand. The number of people reacting is what matters, not just the price itself.
            </p>
            <p className="text-gray-400 leading-relaxed">
              <strong className="text-white">Volume IS the crowd.</strong> It tells you how many people are backing a price move. Price can lie — a stock can drift up on 100 trades. But if it jumps up on 10 million trades, that&apos;s the real deal. Volume is the difference between a rumour and a fact.
            </p>
          </div>

          {/* Animated marketplace scene */}
          <CrowdAnimation />

          {/* Real-world scenario */}
          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tesla stock rises $8 in one hour on <strong className="text-primary-400">2x normal volume</strong> — institutions are buying heavily. Signal: genuine breakout. Same day, a penny stock rises $0.50 on <strong className="text-red-400">barely any volume</strong> — probably one whale manipulating price. Signal: trap. <em className="text-amber-400">Same price movement. Completely different story. Volume told you which was real.</em>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 01 — WHAT VOLUME TELLS YOU */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Four Volume Truths</p>
          <h2 className="text-2xl font-extrabold mb-8">What Volume Actually Tells You</h2>

          <div className="space-y-4">
            {[
              { icon: '✅', title: 'Confirmation', desc: 'Price goes up AND volume goes up = real move. Think of it like a crowd cheering louder as the home team scores. The louder they cheer, the more convincing the goal.', color: 'primary' },
              { icon: '⚠️', title: 'Divergence', desc: 'Price goes up but volume goes DOWN = warning sign. Like a singer hitting high notes to a half-empty venue. The performance looks good, but nobody\'s watching anymore.', color: 'amber' },
              { icon: '💥', title: 'Climax', desc: 'A MASSIVE spike in volume = emotional extreme. Like a crowd stampeding for the exit. Everyone panics at once, sells everything — and often that\'s the bottom. The last person to panic is always the last one to sell.', color: 'red' },
              { icon: '🤫', title: 'Accumulation', desc: 'Price barely moves but volume quietly grows = smart money is buying without making noise. Like someone gradually buying every house on a street — by the time you notice, they own the whole block.', color: 'purple' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl glass-card border-l-4 ${item.color === 'primary' ? 'border-primary-400' : item.color === 'amber' ? 'border-amber-400' : item.color === 'red' ? 'border-red-400' : 'border-purple-400'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Layman box */}
          <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">The simple rule:</strong> Volume is the crowd&apos;s megaphone. If price moves and the megaphone is loud — believe it. If price moves and the megaphone is quiet — don&apos;t trust it.</p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 02 — INTERACTIVE VOLUME CHART */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Interactive Volume Chart</p>
          <h2 className="text-2xl font-extrabold mb-4">See Volume In Action</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">This chart shows 200 candles of price data with volume bars below. Toggle the features to see how volume reveals what price alone can&apos;t.</p>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setShowClimax(!showClimax)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showClimax ? 'bg-amber-500 text-black' : 'glass text-gray-400 hover:text-white'}`}>
              💥 Climax Spikes
            </button>
            <button onClick={() => setShowDivergence(!showDivergence)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showDivergence ? 'bg-amber-500 text-black' : 'glass text-gray-400 hover:text-white'}`}>
              ⚠️ Divergence Zone
            </button>
            <button onClick={() => setShowOBV(!showOBV)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showOBV ? 'bg-purple-500 text-white' : 'glass text-gray-400 hover:text-white'}`}>
              📊 OBV Line
            </button>
          </div>

          <VolumeChart
            prices={mainPrices}
            volumes={mainVolumes}
            showOBV={showOBV}
            highlightClimax={showClimax}
            highlightDivergence={showDivergence}
            height={showOBV ? 420 : 350}
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-500/50" /> Up volume</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent-500/50" /> Down volume</span>
            {showClimax && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /> Climax (&gt;2.5x avg)</span>}
            {showOBV && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500" /> OBV</span>}
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gray-500" style={{ borderTop: '1px dashed #6b7280' }} /> Average volume</span>
          </div>

          {/* Observation note */}
          <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">What to look for:</strong> Notice how the biggest price moves happen during the tallest volume bars? And how the divergence zone (where price rises on falling volume) is followed by a sharp reversal? That&apos;s volume doing its job — showing you the truth before price catches up.</p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 03 — OBV EXPLAINED */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — On-Balance Volume</p>
          <h2 className="text-2xl font-extrabold mb-4">OBV: The Smart Money Tracker</h2>

          <div className="p-5 rounded-2xl glass-card mb-6">
            <p className="text-sm text-gray-400 leading-relaxed mb-4">💡 <strong className="text-white">Think of OBV like a scoreboard for buyers vs sellers.</strong></p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Every day, if price goes UP, all that day&apos;s volume gets added to the score. If price goes DOWN, it gets subtracted. Over time, OBV shows you whether <strong className="text-primary-400">buyers are quietly accumulating</strong> (OBV rising even if price is flat) or <strong className="text-red-400">sellers are quietly distributing</strong> (OBV falling even if price looks stable).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl glass-card border-l-4 border-primary-400">
              <h4 className="font-bold text-white text-sm mb-1">OBV Rising + Price Flat</h4>
              <p className="text-xs text-gray-400">Smart money is buying quietly. A breakout is likely coming UP. <em className="text-primary-400">The crowd is gathering before the concert starts.</em></p>
            </div>
            <div className="p-4 rounded-xl glass-card border-l-4 border-red-400">
              <h4 className="font-bold text-white text-sm mb-1">OBV Falling + Price Flat</h4>
              <p className="text-xs text-gray-400">Smart money is selling quietly. A breakdown is likely coming DOWN. <em className="text-red-400">People are sneaking out the back door while the party looks full.</em></p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs font-bold text-amber-400 mb-2">🧮 HOW OBV IS CALCULATED</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2">It&apos;s beautifully simple:</p>
            <div className="font-mono text-xs bg-[#0d1320] p-3 rounded-lg text-gray-300 space-y-1">
              <p>If today&apos;s price <span className="text-primary-400">&gt;</span> yesterday → OBV = previous OBV <span className="text-primary-400">+</span> today&apos;s volume</p>
              <p>If today&apos;s price <span className="text-red-400">&lt;</span> yesterday → OBV = previous OBV <span className="text-red-400">−</span> today&apos;s volume</p>
              <p>If price unchanged → OBV stays the same</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">The absolute number doesn&apos;t matter — it&apos;s the DIRECTION of OBV that matters. Rising OBV = accumulation. Falling OBV = distribution.</p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 04 — VOLUME PATTERNS */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Volume Patterns That Matter</p>
          <h2 className="text-2xl font-extrabold mb-8">The Patterns Professionals Watch</h2>

          <div className="space-y-6">
            {[
              { title: 'Volume Dry-Up Before Breakout', emoji: '🏜️', desc: 'When a stock trades sideways and volume gets quieter and quieter — like a classroom before the teacher walks in — it means a big move is building. The longer the quiet period, the bigger the explosion.', tip: 'The tighter volume squeezes, the more explosive the breakout. Think of shaking a fizzy drink bottle — the more you shake (compress), the more it sprays when opened.' },
              { title: 'Climax Volume at Tops', emoji: '🗻', desc: 'The highest volume bar in an entire uptrend often marks the TOP. Why? Because that\'s where the maximum euphoria happens — everyone who wanted to buy has now bought. There\'s nobody left.', tip: 'When you see the tallest volume bar after a long uptrend, it\'s often the "blow-off top." The party is over. The smart money just sold to the last wave of excited newcomers.' },
              { title: 'Capitulation Volume at Bottoms', emoji: '🕳️', desc: 'The mirror image — a massive volume spike during a crash often marks the BOTTOM. Everyone who was going to panic has now panicked. There are no more sellers left.', tip: 'This is the hardest signal to act on because it FEELS terrifying. But the data is clear: when volume spikes to extreme levels during a selloff, the bottom is usually near.' },
              { title: 'Steady Volume Decline in Range', emoji: '😴', desc: 'When price is stuck in a range and volume keeps declining — it\'s like a spring being compressed. Energy is building. The breakout from this range (whichever direction) will be backed by strong volume.', tip: 'Don\'t trade the range. Wait for the breakout. When volume SURGES out of a quiet range, THAT\'s your signal.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl glass-card">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{item.desc}</p>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs text-gray-300 leading-relaxed">💡 <strong className="text-amber-400">Pro Tip:</strong> {item.tip}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 05 — SIGNAL GAME */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Read the Volume</p>
          <h2 className="text-2xl font-extrabold mb-2">What&apos;s the Volume Telling You?</h2>
          <p className="text-sm text-gray-400 mb-6">5 rounds. Study the price + volume chart, then identify the signal.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <MiniGameChart prices={gameData[gameRound].prices} volumes={gameData[gameRound].volumes} />

              <div className="mt-4 space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === scenarios[gameRound].answer;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {scenarios[gameRound].explain}</p>
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
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Perfect — you can read volume like a pro.' : gameScore >= 3 ? 'Solid work. Volume is becoming your ally.' : 'Review the volume patterns section and try again.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 06 — QUIZ */}
      {/* ============================================================ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Volume Quiz</h2>
        </motion.div>

        <div className="space-y-6">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-5 rounded-2xl glass-card">
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
                    <button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }}
                      disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect. You can hear the crowd.' : score >= 66 ? 'Solid — volume is no longer invisible to you.' : 'Review the volume truths and patterns sections.'}</p>
          </motion.div>
        )}
      </section>

      {/* ============================================================ */}
      {/* CERTIFICATE */}
      {/* ============================================================ */}
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
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.7: Volume Analysis</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Volume Reader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Next */}
      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.8 — Advanced Candlestick Patterns</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
