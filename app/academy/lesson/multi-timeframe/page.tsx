// app/academy/lesson/multi-timeframe/page.tsx
// ATLAS Academy — Lesson 2.11: Multiple Timeframe Analysis [PRO]
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

// ============================================================
// MULTI-TF PRICE DATA — same underlying data at different resolutions
// ============================================================
function genMultiTFData(seed: number): { m1: number[]; m5: number[]; h1: number[]; h4: number[]; daily: number[] } {
  const rand = seededRandom(seed);
  // Generate 1440 "minute" candles (1 day of 1-min data)
  const m1: number[] = [100];
  for (let i = 1; i < 1440; i++) {
    // Create phases: morning rally, midday chop, afternoon trend, late fade
    let bias = 0;
    if (i < 120) bias = 0.02; // pre-market drift up
    else if (i < 300) bias = 0.06; // morning rally
    else if (i < 480) bias = -0.01; // midday chop
    else if (i < 540) bias = -0.04; // lunch dip
    else if (i < 780) bias = 0.04; // afternoon push
    else if (i < 900) bias = 0.07; // power hour
    else bias = -0.02; // fade
    m1.push(m1[i - 1] + bias + (rand() - 0.5) * 0.8);
  }

  // Aggregate to 5-min
  const m5: number[] = [];
  for (let i = 0; i < m1.length; i += 5) { m5.push(m1[i]); }

  // Aggregate to 1-hour
  const h1: number[] = [];
  for (let i = 0; i < m1.length; i += 60) { h1.push(m1[i]); }

  // For 4H and Daily, generate longer data
  const h4: number[] = [100];
  for (let i = 1; i < 120; i++) {
    const phase = Math.sin(i * 0.05) * 0.3;
    h4.push(h4[i - 1] + phase + (rand() - 0.48) * 2);
  }

  const daily: number[] = [100];
  for (let i = 1; i < 90; i++) {
    let trend = 0;
    if (i < 30) trend = 0.4; // uptrend
    else if (i < 50) trend = -0.2; // pullback
    else if (i < 70) trend = 0.5; // strong continuation
    else trend = -0.1; // consolidation
    daily.push(daily[i - 1] + trend + (rand() - 0.5) * 2.5);
  }

  return { m1, m5, h1, h4, daily };
}

// Game scenarios: what does the HTF say vs LTF?
interface GameScenario {
  htfTrend: 'uptrend' | 'downtrend' | 'sideways';
  ltfSignal: string;
  correctAction: number; // index into gameOptions
  explain: string;
  htfPrices: number[];
  ltfPrices: number[];
}

function genGameScenarios(seed: number): GameScenario[] {
  const rand = seededRandom(seed);
  const scenarios: GameScenario[] = [];

  // Scenario 1: HTF uptrend + LTF pullback = BUY the dip
  const s1htf: number[] = [100];
  for (let i = 1; i < 50; i++) s1htf.push(s1htf[i-1] + 0.4 + (rand()-0.45)*1.5);
  const s1ltf: number[] = [s1htf[s1htf.length-1]];
  for (let i = 1; i < 40; i++) {
    const bias = i < 25 ? -0.3 : 0.2;
    s1ltf.push(s1ltf[i-1] + bias + (rand()-0.5)*1);
  }
  scenarios.push({
    htfTrend: 'uptrend', ltfSignal: 'Pullback on the lower timeframe',
    correctAction: 0,
    explain: 'The daily chart shows a strong uptrend. The 1H chart shows a temporary pullback — this is a buying opportunity, not a trend reversal. You\'re buying the dip in a confirmed uptrend. This is the bread and butter of multi-timeframe trading.',
    htfPrices: s1htf, ltfPrices: s1ltf,
  });

  // Scenario 2: HTF downtrend + LTF rally = AVOID or SHORT
  const s2htf: number[] = [110];
  for (let i = 1; i < 50; i++) s2htf.push(s2htf[i-1] - 0.35 + (rand()-0.55)*1.5);
  const s2ltf: number[] = [s2htf[s2htf.length-1]];
  for (let i = 1; i < 40; i++) {
    const bias = i < 20 ? 0.3 : -0.1;
    s2ltf.push(s2ltf[i-1] + bias + (rand()-0.5)*1);
  }
  scenarios.push({
    htfTrend: 'downtrend', ltfSignal: 'Small rally on the lower timeframe',
    correctAction: 1,
    explain: 'The daily is in a clear downtrend. The 1H rally is just a counter-trend bounce — a "dead cat bounce." Buying this rally is fighting the bigger trend. Smart traders either wait for the rally to exhaust and short, or stay out entirely.',
    htfPrices: s2htf, ltfPrices: s2ltf,
  });

  // Scenario 3: HTF sideways + LTF breakout attempt = WAIT for HTF confirmation
  const s3htf: number[] = [100];
  for (let i = 1; i < 50; i++) s3htf.push(s3htf[i-1] + (rand()-0.5)*1.8);
  const s3ltf: number[] = [s3htf[s3htf.length-1]];
  for (let i = 1; i < 40; i++) {
    const bias = i < 15 ? 0 : 0.4;
    s3ltf.push(s3ltf[i-1] + bias + (rand()-0.5)*0.8);
  }
  scenarios.push({
    htfTrend: 'sideways', ltfSignal: 'Breakout attempt on lower timeframe',
    correctAction: 2,
    explain: 'The daily chart is ranging — no clear trend. The 1H shows a breakout attempt, but breakouts from a range on the LTF often fail without HTF confirmation. Wait for the DAILY chart to break the range first, then look for LTF entries in that direction.',
    htfPrices: s3htf, ltfPrices: s3ltf,
  });

  // Scenario 4: HTF uptrend + LTF at key support with bullish candle = STRONG BUY
  const s4htf: number[] = [100];
  for (let i = 1; i < 50; i++) s4htf.push(s4htf[i-1] + 0.5 + (rand()-0.45)*1.5);
  const s4ltf: number[] = [s4htf[s4htf.length-1]];
  for (let i = 1; i < 40; i++) {
    let bias = -0.2;
    if (i > 25) bias = 0.4;
    s4ltf.push(s4ltf[i-1] + bias + (rand()-0.5)*0.8);
  }
  scenarios.push({
    htfTrend: 'uptrend', ltfSignal: 'Pullback to support + bullish reversal candle',
    correctAction: 3,
    explain: 'This is the "dream setup." HTF confirms the trend (uptrend). LTF gives you a pullback to a key level AND a bullish reversal candle. You have triple confluence: trend + level + pattern. This is the highest-probability entry in all of trading.',
    htfPrices: s4htf, ltfPrices: s4ltf,
  });

  // Scenario 5: HTF downtrend + LTF also breaking down = SHORT with trend
  const s5htf: number[] = [110];
  for (let i = 1; i < 50; i++) s5htf.push(s5htf[i-1] - 0.4 + (rand()-0.55)*1.5);
  const s5ltf: number[] = [s5htf[s5htf.length-1]];
  for (let i = 1; i < 40; i++) {
    const bias = i < 10 ? 0 : -0.35;
    s5ltf.push(s5ltf[i-1] + bias + (rand()-0.5)*0.8);
  }
  scenarios.push({
    htfTrend: 'downtrend', ltfSignal: 'Continuation breakdown on lower timeframe',
    correctAction: 4,
    explain: 'Both timeframes agree: down. When the HTF trend and LTF signal are ALIGNED in the same direction, the trade has the highest probability. This is a "go with the flow" short — selling into a downtrend as the LTF confirms more selling.',
    htfPrices: s5htf, ltfPrices: s5ltf,
  });

  return scenarios;
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
// ZOOM ANIMATION — same data at 3 zoom levels
// ============================================================
function ZoomAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 360) / 360;
    const activePanel = phase < 0.33 ? 0 : phase < 0.66 ? 1 : 2;

    const panelW = (w - 30) / 3;
    const panelH = h - 50;
    const labels = ['DAILY (Satellite)', '4H (Drone)', '15M (Ground)'];
    const colors = ['#0ea5e9', '#f59e0b', '#a855f7'];

    // Generate base data
    const rand = seededRandom(77);
    const baseData: number[] = [50];
    for (let i = 1; i < 200; i++) {
      const trend = Math.sin(i * 0.03) * 0.3;
      baseData.push(baseData[i-1] + trend + (rand() - 0.5) * 2);
    }

    for (let p = 0; p < 3; p++) {
      const px = 5 + p * (panelW + 10);
      const isActive = p === activePanel;

      // Panel bg
      ctx.fillStyle = isActive ? colors[p] + '08' : 'rgba(20,25,35,0.3)';
      ctx.strokeStyle = isActive ? colors[p] + '40' : 'rgba(50,55,65,0.2)';
      ctx.lineWidth = 1;
      ctx.fillRect(px, 30, panelW, panelH);
      ctx.strokeRect(px, 30, panelW, panelH);

      // Label
      ctx.fillStyle = isActive ? colors[p] : '#4b5563';
      ctx.font = `${isActive ? 'bold ' : ''}9px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(labels[p], px + panelW / 2, 22);

      // Draw chart at different zoom levels
      const zoom = p === 0 ? 1 : p === 1 ? 3 : 10;
      const startIdx = p === 0 ? 0 : p === 1 ? 80 : 140;
      const count = Math.floor(baseData.length / zoom);
      const sliceEnd = Math.min(startIdx + count, baseData.length);
      const slice = baseData.slice(startIdx, sliceEnd);
      if (slice.length < 2) continue;

      const sMin = Math.min(...slice) - 1;
      const sMax = Math.max(...slice) + 1;
      const sRange = sMax - sMin || 1;

      ctx.beginPath();
      ctx.strokeStyle = isActive ? colors[p] : colors[p] + '50';
      ctx.lineWidth = isActive ? 2 : 1;
      for (let i = 0; i < slice.length; i++) {
        const x = px + 5 + (i / (slice.length - 1)) * (panelW - 10);
        const y = 35 + (panelH - 10) * (1 - (slice[i] - sMin) / sRange);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trend arrow for daily
      if (p === 0 && isActive) {
        const start = slice[0], end = slice[slice.length - 1];
        ctx.fillStyle = end > start ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 14px system-ui';
        ctx.fillText(end > start ? '↑ UPTREND' : '↓ DOWNTREND', px + panelW / 2, 30 + panelH - 5);
      }

      // Noise label for 15m
      if (p === 2 && isActive) {
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('Choppy noise!', px + panelW / 2, 30 + panelH - 5);
      }
    }
  }, []);
  return <AnimScene drawFn={draw} height={230} />;
}

// ============================================================
// MINI CHART RENDERER
// ============================================================
function MiniChart({ prices, color = '#0ea5e9', label, height = 200 }: { prices: number[]; color?: string; label?: string; height?: number }) {
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

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const pRange = pMax - pMin;
    const len = prices.length;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      const x = 10 + (i / (len - 1)) * (w - 20);
      const y = 15 + (h - 30) * (1 - (prices[i] - pMin) / pRange);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Trend line
    const start = prices[0], end = prices[prices.length - 1];
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = end > start ? 'rgba(34,197,94,0.3)' : end < start ? 'rgba(239,68,68,0.3)' : 'rgba(156,163,175,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 15 + (h - 30) * (1 - (start - pMin) / pRange));
    ctx.lineTo(w - 10, 15 + (h - 30) * (1 - (end - pMin) / pRange));
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    if (label) {
      ctx.fillStyle = color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, 12, 13);
    }

    // Trend badge
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = end > start * 1.01 ? '#22c55e' : end < start * 0.99 ? '#ef4444' : '#9ca3af';
    ctx.fillText(end > start * 1.01 ? '↑ UP' : end < start * 0.99 ? '↓ DOWN' : '→ RANGE', w - 12, 13);
  }, [prices, color, label, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MultiTimeframeLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [viewerTF, setViewerTF] = useState<'daily' | 'h4' | 'h1' | 'm5'>('daily');
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const tfData = useMemo(() => genMultiTFData(42), []);

  const viewerPrices = viewerTF === 'daily' ? tfData.daily : viewerTF === 'h4' ? tfData.h4 : viewerTF === 'h1' ? tfData.h1 : tfData.m5;
  const viewerColors: Record<string, string> = { daily: '#0ea5e9', h4: '#f59e0b', h1: '#a855f7', m5: '#ef4444' };
  const viewerLabels: Record<string, string> = { daily: 'DAILY', h4: '4 HOUR', h1: '1 HOUR', m5: '5 MINUTE' };

  // Game
  const gameScenarios = useMemo(() => genGameScenarios(500), []);
  const gameOptions = ['Buy the dip (with the HTF trend)', 'Avoid / short (against the HTF trend)', 'Wait for HTF confirmation', 'Strong buy (triple confluence)', 'Short with the trend (aligned)'];

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameScenarios[gameRound].correctAction) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'In multi-timeframe analysis, which timeframe should you check FIRST?', opts: ['The 1-minute chart', 'The highest timeframe available (Weekly/Daily)', 'Whatever chart looks most interesting', 'The timeframe you plan to trade on'], a: 1, explain: 'Always start from the TOP and work down. The highest timeframe shows you the "big picture" — the major trend. Everything below is just detail within that larger context. Starting from the bottom is like navigating with a magnifying glass instead of a map.' },
    { q: 'The Daily chart shows an uptrend. The 15-minute chart shows a sell signal. What should you do?', opts: ['Take the sell — the 15m is more recent', 'Ignore the 15m sell — buy with the Daily trend', 'The 15m sell might be a pullback opportunity to BUY', 'Both are equally valid'], a: 2, explain: 'A sell signal on the LTF within a HTF uptrend is usually just a pullback — a BUYING opportunity, not a genuine reversal. The higher timeframe always wins. Smart traders see LTF dips in HTF uptrends as gifts, not threats.' },
    { q: 'What is the "3-Screen Trading System"?', opts: ['Using 3 monitors', 'Checking trend on HTF, signal on MTF, entry on LTF', 'Trading 3 assets simultaneously', 'A backtesting method'], a: 1, explain: 'Developed by Dr. Alexander Elder: Screen 1 (HTF) identifies the trend, Screen 2 (MTF) identifies the signal/setup, Screen 3 (LTF) fine-tunes the exact entry. This systematic approach ensures you trade WITH the big picture.' },
    { q: 'If the Weekly, Daily, AND 4H charts all show an uptrend, this is called:', opts: ['Triple divergence', 'Timeframe alignment', 'Overbought conditions', 'Pattern confluence'], a: 1, explain: 'Timeframe alignment — when multiple timeframes agree on direction. This is the highest-probability condition in trading. When all timeframes point the same way, the path of least resistance is clear.' },
    { q: 'Why do patterns on the Daily chart carry more weight than on the 5-minute chart?', opts: ['Daily candles are bigger', 'Daily patterns involve thousands of traders\' decisions over 24 hours', 'They don\'t — all timeframes are equal', 'Daily patterns are harder to see'], a: 1, explain: 'A single daily candle represents ALL the buying and selling decisions of an entire trading day — thousands of participants. A 5-minute candle might represent 50 people. More participants = more reliable signal. It\'s the difference between a poll of 10,000 people vs 50.' },
    { q: 'A trader says "I only look at the 5-minute chart." What\'s the problem?', opts: ['Nothing — 5-minute is the best timeframe', 'They\'re seeing noise without context — like navigating with a microscope', 'They should use 1-minute instead', 'It\'s fine for day trading'], a: 1, explain: 'Without the higher timeframe context, a 5-minute trader can\'t distinguish between a genuine setup and noise. They might be buying a 5-min "breakout" right into a Daily resistance level. That\'s how you get trapped.' },
    { q: 'Which combination is BEST for swing trading (holding days to weeks)?', opts: ['1m, 5m, 15m', 'Weekly, Daily, 4H', 'Daily, 1H, 5m', 'Monthly, Weekly, 1m'], a: 1, explain: 'Weekly for the big trend, Daily for the setup, 4H for the entry. These timeframes match the swing trading holding period. Using 1m or 5m for swing trading adds noise without value. Match your timeframes to your trading style.' },
    { q: 'The Daily chart shows a strong downtrend. The 4H shows consolidation. The 1H shows a small bullish engulfing. Should you buy?', opts: ['Yes — the bullish engulfing is a buy signal', 'No — a 1H pattern can\'t override a Daily downtrend', 'Only if volume confirms', 'Wait for a Daily bullish signal first'], a: 1, explain: 'A 1H bullish engulfing within a Daily downtrend is likely just a counter-trend bounce. The Daily always wins. The 4H consolidation is just a pause in the downtrend. Never fight the HTF for a LTF signal. Wait for the Daily to show signs of reversal before considering longs.' },
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

  // Top-down workflow steps
  const workflowSteps = [
    { title: 'Step 1: Check the Weekly/Daily', tf: 'HTF', desc: 'What is the BIG PICTURE trend? Uptrend, downtrend, or range? This determines your directional bias — you will ONLY take trades in this direction.', icon: '🛰️', color: '#0ea5e9', layman: 'Like checking the weather forecast before leaving the house. If it\'s going to rain all day, don\'t plan a picnic.' },
    { title: 'Step 2: Find the Setup on 4H/1H', tf: 'MTF', desc: 'Is price pulling back to a key level? Is there a chart pattern forming? Is there a Fib retracement happening? This is where you find your TRADE IDEA.', icon: '🚁', color: '#f59e0b', layman: 'You know it\'s going to rain (HTF). Now you check WHEN the rain starts — that\'s your timing window.' },
    { title: 'Step 3: Time Your Entry on 15m/5m', tf: 'LTF', desc: 'Look for a trigger: a bullish engulfing candle, a break of a mini trendline, RSI divergence. This gives you the EXACT entry point with a tight stop loss.', icon: '🎯', color: '#a855f7', layman: 'You know it\'ll rain at 3pm (MTF). Now you wait for the first drop to hit your window — THEN you grab the umbrella. Precision timing.' },
  ];

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 11</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Multiple Timeframe Analysis</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">See the forest AND the trees. The skill that separates amateurs from professionals.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🗺️ Imagine navigating a city with ONLY a magnifying glass.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You can see the cracks in the pavement perfectly. But you have no idea if you&apos;re heading north or south. You can&apos;t see the road ahead, the intersection coming, or the traffic jam two blocks away. That&apos;s what trading on a single timeframe is like.</p>
            <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Multiple timeframe analysis is using the satellite view, the drone view, AND the ground view simultaneously.</strong> The satellite (Weekly/Daily) shows you the overall direction. The drone (4H/1H) shows you the setup. The ground (15m/5m) gives you the exact entry.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">The #1 reason traders lose money?</strong> They buy on a 5-minute &quot;breakout&quot; without realising they&apos;re buying straight into a Daily resistance level. Multi-timeframe analysis prevents this entirely.</p>
          </div>

          <ZoomAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">EUR/USD on the 15-minute chart shows a beautiful bullish setup — perfect engulfing candle at support. But the <strong className="text-red-400">Daily chart shows a massive downtrend</strong> with price heading straight into the 200 EMA as resistance. Traders who only checked the 15m bought the setup and got <strong className="text-red-400">stopped out within hours</strong>. Traders who checked the Daily first saw the bigger picture and stayed short. <em className="text-amber-400">Same moment, opposite conclusions — the difference was which timeframe they checked first.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE HIERARCHY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Timeframe Hierarchy</p>
          <h2 className="text-2xl font-extrabold mb-4">Not All Timeframes Are Equal</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Higher timeframes ALWAYS override lower timeframes. The Daily chart is the boss. The 5-minute chart is the intern. Here&apos;s the full hierarchy:</p>

          <div className="space-y-2">
            {[
              { tf: 'Monthly', use: 'Long-term trend direction (investors)', weight: 'Supreme authority', icon: '🌍', color: '#22c55e', barW: '100%' },
              { tf: 'Weekly', use: 'Swing trade bias & major levels', weight: 'Very high', icon: '🛰️', color: '#0ea5e9', barW: '88%' },
              { tf: 'Daily', use: 'The most important chart for most traders', weight: 'High — the "sweet spot"', icon: '📡', color: '#3b82f6', barW: '78%' },
              { tf: '4 Hour', use: 'Setup identification & intermediate trends', weight: 'Medium-high', icon: '🚁', color: '#f59e0b', barW: '60%' },
              { tf: '1 Hour', use: 'Entry timing for swing trades', weight: 'Medium', icon: '🔭', color: '#f97316', barW: '45%' },
              { tf: '15 Min', use: 'Entry timing for day trades', weight: 'Low-medium', icon: '🔬', color: '#a855f7', barW: '30%' },
              { tf: '5 Min', use: 'Scalp entries & micro-timing', weight: 'Low', icon: '🧬', color: '#ec4899', barW: '18%' },
              { tf: '1 Min', use: 'Mostly noise — scalpers only', weight: 'Very low', icon: '⚡', color: '#ef4444', barW: '8%' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl glass-card flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{item.tf}</span>
                    <span className="text-[10px] text-gray-500">{item.weight}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1.5">{item.use}</p>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: item.barW, background: item.color }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">The Golden Rule:</strong> Never trade AGAINST the higher timeframe. If the Daily says UP, you only look for BUYS on the lower timeframes. It&apos;s like swimming — always swim WITH the current, never against it.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — INTERACTIVE VIEWER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — See It Yourself</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Market, Different Views</h2>
          <p className="text-sm text-gray-400 mb-6">Switch between timeframes. Notice how the Daily shows a clear uptrend, but the 5-minute shows chaotic noise. Same data — completely different stories.</p>

          <div className="flex gap-2 mb-4">
            {(['daily', 'h4', 'h1', 'm5'] as const).map(tf => (
              <button key={tf} onClick={() => setViewerTF(tf)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${viewerTF === tf ? 'text-black' : 'glass text-gray-400 hover:text-white'}`}
                style={viewerTF === tf ? { background: viewerColors[tf] } : {}}>
                {viewerLabels[tf]}
              </button>
            ))}
          </div>

          <MiniChart prices={viewerPrices} color={viewerColors[viewerTF]} label={viewerLabels[viewerTF]} height={280} />

          <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Notice:</strong> The Daily chart shows a clear uptrend — easy to read, obvious direction. Now switch to 5-Minute: <strong className="text-red-400">it looks like chaos</strong>. Up, down, sideways — impossible to trade with confidence. That&apos;s why you ALWAYS start with the Daily and work down. The higher timeframe reveals the truth that the noise hides.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — TOP-DOWN WORKFLOW */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — The Top-Down Workflow</p>
          <h2 className="text-2xl font-extrabold mb-4">The 3-Screen Trading System</h2>
          <p className="text-sm text-gray-400 mb-6">Developed by Dr. Alexander Elder. Three timeframes, three purposes. Tap each step to expand.</p>

          <div className="space-y-3">
            {workflowSteps.map((step, i) => {
              const isOpen = activeStep === i;
              return (
                <motion.div key={i} layout className="rounded-2xl glass-card overflow-hidden" style={{ borderLeft: `3px solid ${step.color}` }}>
                  <button onClick={() => setActiveStep(isOpen ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{step.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{step.title}</h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: step.color + '20', color: step.color }}>{step.tf}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                          <div className="p-3 rounded-xl" style={{ background: step.color + '08', border: `1px solid ${step.color}20` }}>
                            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong style={{ color: step.color }}>In plain English:</strong> {step.layman}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">🎯 <strong className="text-amber-400">The complete workflow:</strong> Check Weekly/Daily for trend → Find setup on 4H/1H → Time entry on 15m/5m. Takes 5 minutes. Prevents 90% of bad trades. This single habit separates profitable traders from losing ones.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — TF COMBOS FOR TRADING STYLES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Timeframe Combos</p>
          <h2 className="text-2xl font-extrabold mb-4">Match Your Timeframes to Your Style</h2>
          <p className="text-sm text-gray-400 mb-6">Your trading style determines which three timeframes to use. Using the wrong combo is like wearing running shoes to a swimming pool.</p>

          <div className="space-y-4">
            {[
              { style: 'Scalper', holding: 'Minutes to hours', combo: '1H → 15M → 5M', htf: '1H', mtf: '15M', ltf: '5M', desc: 'Fast-paced. You need quick signals and tight entries. Not for beginners.', icon: '⚡' },
              { style: 'Day Trader', holding: 'Hours (within one day)', combo: '4H → 1H → 15M', htf: '4H', mtf: '1H', ltf: '15M', desc: 'The most popular combo. 4H gives the session trend. 1H shows the setup. 15M nails the entry.', icon: '☀️' },
              { style: 'Swing Trader', holding: 'Days to weeks', combo: 'Weekly → Daily → 4H', htf: 'Weekly', mtf: 'Daily', ltf: '4H', desc: 'Less screen time, bigger moves. Check charts 1-2 times per day. Best for people with jobs.', icon: '🌊' },
              { style: 'Position Trader', holding: 'Weeks to months', combo: 'Monthly → Weekly → Daily', htf: 'Monthly', mtf: 'Weekly', ltf: 'Daily', desc: 'Set-and-forget. Major trends only. Check once a week. Like investing but with active management.', icon: '🏔️' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{item.style}</h3>
                    <p className="text-xs text-gray-500">Holding: {item.holding}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-primary-500/15 text-primary-400 text-xs font-bold">{item.htf}</span>
                  <span className="text-gray-600">→</span>
                  <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 text-xs font-bold">{item.mtf}</span>
                  <span className="text-gray-600">→</span>
                  <span className="px-2 py-1 rounded bg-accent-500/15 text-accent-400 text-xs font-bold">{item.ltf}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — The Traps</p>
          <h2 className="text-2xl font-extrabold mb-6">4 Multi-TF Mistakes That Kill Accounts</h2>

          <div className="space-y-4">
            {[
              { title: 'Fighting the HTF', wrong: 'Daily says DOWN. 5-minute says BUY. You buy because "the 5m looks good."', right: 'The Daily always wins. A 5m buy signal in a Daily downtrend is almost always a trap — a counter-trend bounce that reverses fast.', tip: 'If the Daily says don\'t buy, the 5-minute can\'t override that. Period.' },
              { title: 'Using Too Many Timeframes', wrong: 'Checking 8 different timeframes and getting confused because they all say different things.', right: 'Use exactly THREE: one for trend, one for setup, one for entry. More than three creates "analysis paralysis" — you never pull the trigger.', tip: 'Three screens. Three purposes. That\'s it. Keep it simple.' },
              { title: 'Bottom-Up Analysis', wrong: 'Starting on the 1-minute chart and working UP. You find a "great setup" on the 1m but the 4H shows you\'re buying into resistance.', right: 'Always work TOP-DOWN. Start with the highest timeframe (Weekly/Daily) and drill down. The big picture must come first.', tip: 'Top-down = you see the cliff before you walk off it. Bottom-up = you walk off the cliff studying your shoes.' },
              { title: 'Mismatched Timeframes', wrong: 'Using Monthly for trend and 1-minute for entry. The gap is too wide — the Monthly trend might take 6 months to play out.', right: 'Each step down should be 3-6x smaller. Daily → 4H → 1H. Not Daily → 1-minute (that\'s a 1440x difference).', tip: 'The "factor of 4-6" rule: each lower TF should be 4-6x smaller than the one above.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass-card">
                <h3 className="font-bold text-white mb-3">{i + 1}. {item.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15"><p className="text-xs font-bold text-red-400 mb-1">❌ WRONG</p><p className="text-xs text-gray-400 leading-relaxed">{item.wrong}</p></div>
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15"><p className="text-xs font-bold text-green-400 mb-1">✅ RIGHT</p><p className="text-xs text-gray-400 leading-relaxed">{item.right}</p></div>
                </div>
                <p className="text-xs text-gray-500">💡 {item.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — What Would You Do?</p>
          <h2 className="text-2xl font-extrabold mb-2">Multi-Timeframe Decision Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios. You see BOTH the higher timeframe (left) and lower timeframe (right). Decide the correct action.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Scenario {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              {/* Dual chart display */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-[10px] font-bold text-primary-400 mb-1 text-center">DAILY (Higher TF)</p>
                  <MiniChart prices={gameScenarios[gameRound].htfPrices} color="#0ea5e9" height={160} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-400 mb-1 text-center">1H (Lower TF)</p>
                  <MiniChart prices={gameScenarios[gameRound].ltfPrices} color="#f59e0b" height={160} />
                </div>
              </div>
              <div className="mb-4 p-2.5 rounded-xl bg-[#0d1320] border border-gray-800">
                <p className="text-xs text-gray-400 text-center">
                  HTF: <strong className={gameScenarios[gameRound].htfTrend === 'uptrend' ? 'text-green-400' : gameScenarios[gameRound].htfTrend === 'downtrend' ? 'text-red-400' : 'text-gray-400'}>{gameScenarios[gameRound].htfTrend.toUpperCase()}</strong>
                  {' · '}LTF: <strong className="text-amber-400">{gameScenarios[gameRound].ltfSignal}</strong>
                </p>
              </div>

              <div className="space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameScenarios[gameRound].correctAction;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameScenarios[gameRound].explain}</p>
                    </div>
                    {gameShowNext && (
                      <button onClick={nextRound} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                        {gameRound < 4 ? 'Next Scenario →' : 'See Results →'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
              <p className={`text-5xl font-extrabold mb-2 ${gameScore >= 3 ? 'text-amber-400' : 'text-red-400'}`}>{gameScore}/5</p>
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Perfect — you think in multiple timeframes!' : gameScore >= 3 ? 'Solid multi-TF thinking developing.' : 'Review the workflow and hierarchy sections.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Multi-Timeframe Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect — you see ALL the timeframes now.' : score >= 66 ? 'Solid multi-timeframe understanding.' : 'Review the hierarchy and workflow sections.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">🔭</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.11: Multiple Timeframe Analysis</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Multi-Dimensional Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next — Level 2 Finale</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.12 — Building Your First Strategy</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
