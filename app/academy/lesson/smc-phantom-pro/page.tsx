// app/academy/lesson/smc-phantom-pro/page.tsx
// ATLAS Academy — Lesson 3.13: SMC + ATLAS PHANTOM PRO [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

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
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFn]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}

// ============================================================
// MANUAL vs AUTO ANIMATION — split screen comparison
// ============================================================
function ManualVsAutoAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const halfW = w / 2 - 8;
    const pad = 15;
    const progress = Math.min(1, (f % 360) / 300);

    // Divider
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2, 25); ctx.lineTo(w / 2, h - 25); ctx.stroke();

    // Headers
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444'; ctx.fillText('MANUAL ANALYSIS', halfW / 2 + pad, 16);
    ctx.fillStyle = '#22c55e'; ctx.fillText('PHANTOM PRO', w / 2 + halfW / 2 + 8, 16);

    // Generate shared price data
    const rand = seededRandom(42);
    const pts = 50;
    const pricesL: [number, number][] = [];
    const pricesR: [number, number][] = [];
    let p = h * 0.6;
    for (let i = 0; i < pts; i++) {
      const t = i / (pts - 1);
      if (t < 0.2) p += (rand() - 0.5) * 2;
      else if (t < 0.35) p += -1.2 + (rand() - 0.5) * 1;
      else if (t < 0.45) p += 1.5 + (rand() - 0.5) * 0.8;
      else if (t < 0.6) p += -0.3 + (rand() - 0.5) * 0.6;
      else p += 1 + (rand() - 0.5) * 0.8;
      p = Math.max(30, Math.min(h - 35, p));
      pricesL.push([pad + halfW * t, p]);
      pricesR.push([w / 2 + 8 + halfW * t, p]);
    }

    // Draw left (manual) — plain line, no markings
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.beginPath();
    const visL = Math.floor(pts * progress);
    for (let i = 0; i <= Math.min(visL, pricesL.length - 1); i++) {
      i === 0 ? ctx.moveTo(pricesL[i][0], pricesL[i][1]) : ctx.lineTo(pricesL[i][0], pricesL[i][1]);
    }
    ctx.stroke();

    // Left: slowly appearing question marks
    if (progress > 0.4) {
      ctx.font = 'bold 14px system-ui'; ctx.fillStyle = 'rgba(239,68,68,0.4)'; ctx.textAlign = 'center';
      ctx.fillText('?', halfW * 0.3, h * 0.4);
      ctx.fillText('?', halfW * 0.55, h * 0.65);
      if (progress > 0.6) ctx.fillText('?', halfW * 0.75, h * 0.35);
    }
    if (progress > 0.7) {
      ctx.font = '9px system-ui'; ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.textAlign = 'center';
      ctx.fillText('Where\u0027s the OB?', halfW * 0.4, h * 0.82);
      ctx.fillText('Is this a BOS?', halfW * 0.7, h * 0.88);
    }

    // Draw right (PHANTOM PRO) — same line but with automatic markings
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.beginPath();
    const visR = Math.floor(pts * progress);
    for (let i = 0; i <= Math.min(visR, pricesR.length - 1); i++) {
      i === 0 ? ctx.moveTo(pricesR[i][0], pricesR[i][1]) : ctx.lineTo(pricesR[i][0], pricesR[i][1]);
    }
    ctx.stroke();

    // Right: auto-detected markings appear progressively
    if (progress > 0.35) {
      // BOS marker
      const bosX = w / 2 + 8 + halfW * 0.42;
      const bosY = pricesR[Math.floor(pts * 0.42)]?.[1] || h * 0.4;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(bosX, bosY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('BOS', bosX, bosY - 7);
    }
    if (progress > 0.25) {
      // OB zone
      const obX = w / 2 + 8 + halfW * 0.18;
      ctx.fillStyle = 'rgba(59,130,246,0.12)';
      ctx.fillRect(obX, h * 0.35, halfW * 0.12, h * 0.1);
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]); ctx.strokeRect(obX, h * 0.35, halfW * 0.12, h * 0.1); ctx.setLineDash([]);
      ctx.font = 'bold 7px system-ui'; ctx.fillStyle = '#3b82f6';
      ctx.fillText('OB', obX + halfW * 0.06, h * 0.35 - 4);
    }
    if (progress > 0.5) {
      // FVG zone
      const fvgX = w / 2 + 8 + halfW * 0.48;
      ctx.fillStyle = 'rgba(168,85,247,0.12)';
      ctx.fillRect(fvgX, h * 0.42, halfW * 0.08, h * 0.07);
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]); ctx.strokeRect(fvgX, h * 0.42, halfW * 0.08, h * 0.07); ctx.setLineDash([]);
      ctx.font = 'bold 7px system-ui'; ctx.fillStyle = '#a855f7';
      ctx.fillText('FVG', fvgX + halfW * 0.04, h * 0.42 - 4);
    }
    if (progress > 0.6) {
      // Liquidity line
      ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      const liqY = h * 0.7;
      ctx.beginPath(); ctx.moveTo(w / 2 + 8, liqY); ctx.lineTo(w / 2 + 8 + halfW * 0.35, liqY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 6px system-ui'; ctx.fillStyle = '#ef4444';
      ctx.fillText('SSL', w / 2 + 8 + halfW * 0.17, liqY - 4);
    }

    // Bottom comparison
    const fadeIn = Math.min(1, progress * 2);
    ctx.globalAlpha = fadeIn;
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Same chart. One takes 15 minutes. The other takes 0.', w / 2, h - 8);
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// FEATURE MAP ANIMATION — concepts mapped to PHANTOM features
// ============================================================
function FeatureMapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const midX = w / 2;
    const cycle = (f % 480) / 480;
    const activeIdx = Math.floor(cycle * 6) % 6;

    // Center circle — PHANTOM PRO
    const centerR = Math.min(w, h) * 0.14;
    ctx.fillStyle = 'rgba(245,158,11,0.1)';
    ctx.beginPath(); ctx.arc(midX, h / 2, centerR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(midX, h / 2, centerR, 0, Math.PI * 2); ctx.stroke();
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#f59e0b';
    ctx.fillText('PHANTOM', midX, h / 2 - 4);
    ctx.fillText('PRO', midX, h / 2 + 8);

    // Surrounding concept nodes
    const features = [
      { label: 'BOS/CHoCH', lesson: '3.2', color: '#f59e0b' },
      { label: 'Order Blocks', lesson: '3.5', color: '#3b82f6' },
      { label: 'FVGs', lesson: '3.6', color: '#a855f7' },
      { label: 'Liquidity', lesson: '3.3', color: '#ef4444' },
      { label: 'Premium/Discount', lesson: '3.7', color: '#22c55e' },
      { label: 'Structure', lesson: '3.2', color: '#f59e0b' },
    ];

    const outerR = Math.min(w, h) * 0.38;
    features.forEach((feat, i) => {
      const angle = (i / features.length) * Math.PI * 2 - Math.PI / 2;
      const fx = midX + Math.cos(angle) * outerR;
      const fy = h / 2 + Math.sin(angle) * outerR;
      const isActive = i === activeIdx;
      const r = parseInt(feat.color.slice(1, 3), 16);
      const g = parseInt(feat.color.slice(3, 5), 16);
      const b = parseInt(feat.color.slice(5, 7), 16);

      // Connection line
      ctx.strokeStyle = `rgba(${r},${g},${b},${isActive ? 0.5 : 0.12})`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(midX, h / 2); ctx.lineTo(fx, fy); ctx.stroke();

      // Node
      const nodeR = isActive ? 28 : 22;
      ctx.fillStyle = `rgba(${r},${g},${b},${isActive ? 0.15 : 0.06})`;
      ctx.beginPath(); ctx.arc(fx, fy, nodeR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = feat.color;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath(); ctx.arc(fx, fy, nodeR, 0, Math.PI * 2); ctx.stroke();

      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 9 : 8}px system-ui`;
      ctx.textAlign = 'center'; ctx.fillStyle = isActive ? '#fff' : feat.color;
      ctx.fillText(feat.label, fx, fy - 2);
      ctx.font = '7px system-ui'; ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
      ctx.fillText(`L${feat.lesson}`, fx, fy + 9);
    });

    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8';
    ctx.fillText('Every concept you learned \u2014 automated in one indicator', midX, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SMCPhantomProLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { correct: 1, label: 'BOS Detection',
      q: 'You\u0027re analysing a 1H chart and need to identify if a Break of Structure has occurred. How does PHANTOM PRO help?',
      opts: ['It doesn\u0027t \u2014 you must identify BOS manually', 'It automatically detects and labels BOS/CHoCH on every swing, colour-coded by direction', 'It draws a single line at the last high', 'It only works on the Daily chart'],
      explain: 'PHANTOM PRO automatically detects every BOS and CHoCH across all timeframes. Bullish BOS is labelled in teal, bearish in magenta. You no longer need to manually track swing points \u2014 the indicator does it in real-time, including nested structure within larger moves.' },
    { correct: 2, label: 'Order Block Identification',
      q: 'You\u0027ve been spending 10 minutes per chart manually identifying Order Blocks. What does PHANTOM PRO do instead?',
      opts: ['Nothing \u2014 OB identification requires human judgement', 'It highlights random candles as OBs', 'It automatically marks valid OBs with colour-coded zones, including mitigation status and strength grading', 'It only shows OBs on the 5M chart'],
      explain: 'PHANTOM PRO automatically identifies Order Blocks based on the institutional footprint algorithm. Each OB is colour-coded (bullish/bearish), shows its mitigation status (untested, mitigated, invalidated), and grades strength based on the impulse that created it. What takes you 10 minutes takes the indicator 0 seconds.' },
    { correct: 0, label: 'FVG Detection',
      q: 'You want to find Fair Value Gaps on your chart. How does PHANTOM PRO handle this?',
      opts: ['It highlights the 3-candle FVG pattern automatically with fill status tracking', 'You must draw them manually', 'It only detects FVGs on crypto', 'It uses a different definition of FVG'],
      explain: 'PHANTOM PRO scans every 3-candle sequence and highlights valid FVGs automatically. It tracks whether each FVG has been filled (partially or fully), changes the zone colour on fill, and can optionally hide filled FVGs to keep your chart clean. The same pothole concept from Lesson 3.6 \u2014 automated.' },
    { correct: 1, label: 'Liquidity Levels',
      q: 'You need to mark buy-side and sell-side liquidity on your chart. What does PHANTOM PRO provide?',
      opts: ['Just horizontal lines at round numbers', 'Equal highs/lows detection with liquidity pool visualisation showing where stops are likely stacked', 'Nothing \u2014 liquidity is a manual concept', 'Only works on forex pairs'],
      explain: 'PHANTOM PRO detects equal highs and equal lows \u2014 the key liquidity formations from Lesson 3.3. It visualises these as liquidity pools, showing you exactly where buy-side and sell-side liquidity is building. When a sweep occurs, the indicator can alert you in real-time.' },
    { correct: 3, label: 'The Big Picture',
      q: 'What is the fundamental relationship between the Academy\u0027s SMC lessons and PHANTOM PRO?',
      opts: ['They are completely separate \u2014 the indicator uses different concepts', 'PHANTOM PRO replaces the need to learn SMC', 'The Academy teaches concepts that PHANTOM PRO doesn\u0027t cover', 'The Academy teaches you WHY and HOW these concepts work. PHANTOM PRO automates the detection so you can focus on execution.'],
      explain: 'The Academy teaches understanding. PHANTOM PRO automates detection. You need BOTH. Without understanding (the Academy), you can\u0027t interpret what the indicator is showing you. Without automation (PHANTOM PRO), you spend 80% of your time marking up charts instead of making decisions. Together: learn the WHY from the Academy, let PHANTOM PRO handle the WHAT, and you focus on the WHEN.' },
  ], []);

  const currentGame = gameScenarios[gameRound];

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What does PHANTOM PRO automate from Lesson 3.2 (Market Structure)?', opts: ['Moving averages', 'BOS and CHoCH detection with directional colour coding', 'Candlestick patterns', 'Fibonacci levels'], a: 1, explain: 'PHANTOM PRO automatically detects and labels every Break of Structure and Change of Character, colour-coded by direction (teal for bullish, magenta for bearish). This is the foundation of all SMC analysis.' },
    { q: 'How does PHANTOM PRO handle Order Blocks from Lesson 3.5?', opts: ['It draws random boxes', 'It marks OBs manually', 'It auto-detects OBs with mitigation tracking, strength grading, and colour coding', 'It only shows the most recent OB'], a: 2, explain: 'PHANTOM PRO identifies valid Order Blocks algorithmically, tracks their mitigation status (untested/mitigated/invalidated), and grades strength based on the impulse characteristics. Every OB from every timeframe \u2014 automatically.' },
    { q: 'What is the relationship between the Academy and PHANTOM PRO?', opts: ['The Academy replaces PHANTOM PRO', 'PHANTOM PRO replaces the Academy', 'Academy = understanding (WHY). PHANTOM PRO = automation (WHAT). You provide the execution (WHEN).', 'They are unrelated products'], a: 2, explain: 'The three pillars: Academy teaches WHY concepts work (understanding), PHANTOM PRO automates WHAT appears on the chart (detection), and you the trader decide WHEN to act (execution). All three are essential.' },
    { q: 'Can PHANTOM PRO detect Fair Value Gaps?', opts: ['No \u2014 FVGs must be drawn manually', 'Yes \u2014 it highlights 3-candle FVGs with fill status tracking', 'Only on the Daily chart', 'Only bearish FVGs'], a: 1, explain: 'PHANTOM PRO detects FVGs automatically using the 3-candle rule from Lesson 3.6. It tracks fill status (unfilled, partially filled, fully filled) and can optionally hide completed FVGs.' },
    { q: 'What advantage does automated detection give you?', opts: ['None \u2014 manual analysis is always better', 'It eliminates the 80% of analysis time spent marking up charts, letting you focus on trade decisions', 'It makes decisions for you', 'It only works in backtesting'], a: 1, explain: 'Manual SMC markup takes 10\u201320 minutes per chart. PHANTOM PRO does it in real-time. This means you spend your time on what matters: deciding whether to take the trade, managing risk, and executing your model \u2014 not drawing boxes.' },
    { q: 'Does PHANTOM PRO tell you WHEN to enter a trade?', opts: ['Yes \u2014 it gives buy/sell signals', 'No \u2014 it shows you the SMC landscape. YOU decide when to act based on your model.', 'Only during London session', 'Only with the $99 plan'], a: 1, explain: 'PHANTOM PRO is a diagnostic tool, not a signal tool. It shows you the structure, the OBs, the FVGs, the liquidity \u2014 the entire SMC landscape. But the decision to enter, the model selection (Model 1 or 2 from Lesson 3.12), and the execution are yours. That\u0027s why the Academy exists \u2014 to teach you HOW to make those decisions.' },
    { q: 'What does PHANTOM PRO\u0027s Narrative Engine do?', opts: ['It writes stories', 'It translates the technical SMC data into plain English summaries explaining what\u0027s happening on the chart', 'It predicts the future', 'It generates trade signals'], a: 1, explain: 'The Narrative Engine takes the raw SMC data (BOS direction, OB status, FVG fills, liquidity levels) and synthesises it into a plain English summary. Instead of interpreting 15 different overlays, you get a sentence like: &quot;Bullish structure. Price approaching untested OB in discount zone. FVG above as target.&quot;' },
    { q: 'What is the recommended workflow: Academy + PHANTOM PRO?', opts: ['Study Academy. Ignore the indicator.', 'Use the indicator. Skip the Academy.', 'Study the Academy to understand concepts. Use PHANTOM PRO to automate detection. Apply your models to execute.', 'They should be used on different charts'], a: 2, explain: 'The optimal workflow: (1) Learn the concepts through the Academy so you understand WHY things happen. (2) Apply PHANTOM PRO to your charts so it handles the WHAT automatically. (3) Use your knowledge + the indicator\u0027s data to decide WHEN to execute using Model 1 or Model 2.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">&larr; Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 13</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>SMC + ATLAS<br/>PHANTOM PRO</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Every concept you&apos;ve learned in Level 3 &mdash; automated. See how PHANTOM PRO turns 15 minutes of analysis into 0.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128269; You now know HOW to read Smart Money. But do you have time to do it on every chart, every session?</p>
            <p className="text-gray-400 leading-relaxed mb-4">Manually marking BOS, CHoCH, Order Blocks, FVGs, liquidity levels, premium/discount zones, and structure on every chart takes <strong className="text-white">10&ndash;20 minutes per pair, per timeframe</strong>. If you trade 4 pairs across 3 timeframes, that&apos;s over an hour of markup before you even look for a trade.</p>
            <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">ATLAS PHANTOM PRO</strong> does all of this automatically, in real-time. Every concept from Lessons 3.1&ndash;3.12 &mdash; detected, labelled, and displayed on your TradingView chart the moment price prints a new candle.</p>
            <p className="text-gray-400 leading-relaxed">This lesson shows you exactly which PHANTOM PRO feature maps to which Academy concept &mdash; and how to use them together for maximum edge.</p>
          </div>
          <ManualVsAutoAnimation />
        </motion.div>
      </section>

      {/* S01 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Feature Map</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Concept &rarr; Every Feature</h2>
          <p className="text-sm text-gray-400 mb-6">PHANTOM PRO was built to automate the exact concepts taught in this Academy. Here&apos;s the complete mapping:</p>
          <FeatureMapAnimation />
        </motion.div>
      </section>

      {/* S02 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Concept to Feature</p>
          <h2 className="text-2xl font-extrabold mb-4">Detailed Feature Breakdown</h2>
        </motion.div>
        {[
          { concept: 'Market Structure (3.2)', feature: 'BOS/CHoCH Auto-Detection', color: '#f59e0b', desc: 'Every swing high and low is tracked. BOS and CHoCH are labelled automatically with directional colour coding (teal = bullish, magenta = bearish). Nested structure within larger swings is also detected. No more manually counting highs and lows.' },
          { concept: 'Order Blocks (3.5)', feature: 'OB Zone Engine', color: '#3b82f6', desc: 'Valid Order Blocks are identified based on the last opposite-colour candle before an impulse. Each OB shows: zone boundaries, mitigation status (untested/mitigated/invalidated), and visual grading. Invalidated OBs fade out automatically.' },
          { concept: 'Fair Value Gaps (3.6)', feature: 'FVG Detector', color: '#a855f7', desc: 'Every 3-candle FVG is highlighted with the imbalance zone. Fill tracking shows when the gap has been partially or fully filled. Colour changes on fill. Option to auto-hide filled FVGs for a clean chart.' },
          { concept: 'Liquidity (3.3)', feature: 'Equal Highs/Lows Scanner', color: '#ef4444', desc: 'Detects equal highs (buy-side liquidity) and equal lows (sell-side liquidity) automatically. Visualises the liquidity pools where stop losses are stacking. Alerts available when price approaches these levels.' },
          { concept: 'Premium/Discount (3.7)', feature: 'Zone Overlay', color: '#22c55e', desc: 'Automatically calculates and displays premium, discount, and equilibrium zones based on the current swing range. Colour-coded overlay shows whether current price is in a buying zone (discount) or selling zone (premium).' },
          { concept: 'All of the Above', feature: 'Narrative Engine', color: '#f59e0b', desc: 'Synthesises all SMC data into a plain English summary. Instead of interpreting 6 different overlays, you get a single narrative: &quot;Bullish structure confirmed. Price in discount zone. Untested OB at $2,045. FVG target at $2,068.&quot; The story behind the chart \u2014 told in words, not lines.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedFeature(expandedFeature === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">{item.concept} &rarr;</span>
                <span className="text-sm font-bold ml-2" style={{ color: item.color }}>{item.feature}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedFeature === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedFeature === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S03 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Three Pillars</p>
          <h2 className="text-2xl font-extrabold mb-4">Understanding + Detection + Execution</h2>
          <p className="text-sm text-gray-400 mb-6">No single tool gives you everything. The edge comes from combining all three:</p>
          <div className="space-y-3">
            <div className="p-5 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
              <p className="text-amber-400 font-bold text-sm">Pillar 1: Understanding (Academy)</p>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">You know WHY price behaves the way it does. Why OBs exist, why sweeps happen, why FVGs fill. Without this understanding, you&apos;re pressing buttons on a machine you don&apos;t understand.</p>
            </div>
            <div className="p-5 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
              <p className="text-blue-400 font-bold text-sm">Pillar 2: Detection (PHANTOM PRO)</p>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">The indicator handles WHAT appears on the chart. BOS, OBs, FVGs, liquidity &mdash; all detected in real-time. You no longer spend time marking up. You spend time deciding.</p>
            </div>
            <div className="p-5 rounded-xl border-l-4 border-green-500 bg-green-500/5">
              <p className="text-green-400 font-bold text-sm">Pillar 3: Execution (You)</p>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">YOU decide WHEN to act. Which model applies (3.12). Whether the Kill Zone is right (3.10). Whether the PO3 phase confirms (3.11). The indicator shows the landscape. You navigate it.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S04 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Recommended Workflow</p>
          <h2 className="text-2xl font-extrabold mb-4">Academy + PHANTOM PRO Daily Routine</h2>
        </motion.div>
        {[
          { step: '1. HTF Bias (2 min)', color: '#f59e0b', detail: 'Open your Daily chart with PHANTOM PRO active. Read the Narrative Engine summary. Check: is structure bullish or bearish? Where are the nearest untested OBs? Which liquidity pools are in play?' },
          { step: '2. Mark Kill Zone (1 min)', color: '#3b82f6', detail: 'Check your session clock. Are you in a Kill Zone? If not, wait. If yes, proceed.' },
          { step: '3. Drop to Execution TF (2 min)', color: '#a855f7', detail: 'Switch to your 15M or 1H chart. PHANTOM PRO automatically shows the LTF structure, OBs, and FVGs. Look for Model 1 or Model 2 alignment with your HTF bias.' },
          { step: '4. Wait for Confirmation (patience)', color: '#22c55e', detail: 'Watch for the BOS/CHoCH that PHANTOM PRO will auto-detect. When it prints, check: does it align with your model? Is there an OB to enter at? Is the FVG pointing to a target?' },
          { step: '5. Execute (1 min)', color: '#ef4444', detail: 'Entry at the OB. Stop defined by the model. Target at the opposing liquidity or FVG. Position size per Lesson 1.6. Done.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedWorkflow(expandedWorkflow === i ? null : i)} className="w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.step}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedWorkflow === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedWorkflow === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 mx-2 mb-1 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.detail}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">Total active analysis time: ~6 minutes.</strong> Compare that to 60+ minutes of manual markup. The time you save goes to better decision-making, journaling, and not overtrading.</p>
        </div>
      </section>

      {/* S05 — SETUP EXAMPLES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Setup Examples</p>
          <h2 className="text-2xl font-extrabold mb-4">What PHANTOM PRO Shows You in Real Setups</h2>
          <p className="text-sm text-gray-400 mb-6">Here&apos;s exactly what you would see on your chart with PHANTOM PRO active during each trade model:</p>
          <div className="p-5 rounded-2xl border-l-4 border-red-500 bg-red-500/5 mb-4">
            <p className="text-red-400 font-bold text-sm mb-2">Model 1 Setup &mdash; What PHANTOM PRO Displays</p>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p>&#8226; <strong className="text-amber-400">Structure labels:</strong> BOS/CHoCH auto-detected at the reversal point &mdash; you see the exact candle where structure shifted.</p>
              <p>&#8226; <strong className="text-blue-400">OB zone:</strong> The Order Block from the sweep is automatically highlighted in blue with &quot;Untested&quot; status.</p>
              <p>&#8226; <strong className="text-purple-400">FVG:</strong> Any Fair Value Gap within the reversal impulse is shaded &mdash; potential target or confluence.</p>
              <p>&#8226; <strong className="text-red-400">Liquidity:</strong> Equal lows that were swept are marked, confirming the manipulation was a liquidity grab.</p>
              <p>&#8226; <strong className="text-amber-400">Narrative:</strong> &quot;Bearish structure broken. Bullish MSS confirmed. Untested OB at 1.0865 in discount zone.&quot;</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border-l-4 border-green-500 bg-green-500/5">
            <p className="text-green-400 font-bold text-sm mb-2">Model 2 Setup &mdash; What PHANTOM PRO Displays</p>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p>&#8226; <strong className="text-amber-400">HTF Structure:</strong> Bullish HH/HL labels on the 4H chart confirming the trend direction.</p>
              <p>&#8226; <strong className="text-blue-400">OB zone:</strong> The 4H Order Block highlighted at the pullback level, graded &quot;A&quot; or &quot;A+&quot; based on confluence.</p>
              <p>&#8226; <strong className="text-amber-400">OTE overlay:</strong> Premium/Discount zones showing the OB sits in the discount zone (61.8&ndash;78.6% Fib).</p>
              <p>&#8226; <strong className="text-purple-400">FVG target:</strong> An unfilled FVG above current price acts as the take-profit magnet.</p>
              <p>&#8226; <strong className="text-amber-400">Narrative:</strong> &quot;Bullish trend intact. Price in discount. A-grade OB at $2,332. FVG target at $2,358.&quot;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — TIME SAVED */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Time Comparison</p>
          <h2 className="text-2xl font-extrabold mb-4">Manual vs PHANTOM PRO &mdash; Real Numbers</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[480px] glass rounded-2xl overflow-hidden text-xs">
              {[
                { task: '', manual: 'Manual', phantom: 'PHANTOM PRO' },
                { task: 'Mark BOS/CHoCH', manual: '3\u20135 min per TF', phantom: 'Instant' },
                { task: 'Identify Order Blocks', manual: '5\u201310 min per pair', phantom: 'Instant' },
                { task: 'Find FVGs', manual: '3\u20135 min per pair', phantom: 'Instant' },
                { task: 'Mark liquidity levels', manual: '2\u20134 min per pair', phantom: 'Instant' },
                { task: 'Determine P&D zones', manual: '2\u20133 min', phantom: 'Instant' },
                { task: 'Read narrative context', manual: '5\u201310 min thinking', phantom: '1 glance' },
                { task: 'TOTAL (4 pairs, 2 TFs)', manual: '60\u201390 minutes', phantom: '~5 minutes' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 gap-0 ${i === 0 ? 'bg-amber-500/5 font-bold text-amber-400' : i === 7 ? 'bg-amber-500/5 font-bold' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <div className="p-2.5 border-r border-white/5 text-gray-400">{row.task}</div>
                  <div className="p-2.5 border-r border-white/5 text-red-400">{row.manual}</div>
                  <div className="p-2.5 text-green-400">{row.phantom}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">The maths is simple:</strong> 60 minutes saved per day &times; 250 trading days = <strong className="text-white">250 hours per year</strong> redirected from chart markup to decision-making, journaling, and improving your edge.</p>
          </div>
        </motion.div>
      </section>

      {/* S07 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Myths</p>
          <h2 className="text-2xl font-extrabold mb-4">Myths About Indicators</h2>
        </motion.div>
        {[
          { myth: '&quot;Indicators replace learning&quot;', truth: 'Indicators automate DETECTION, not UNDERSTANDING. PHANTOM PRO can show you an OB, but if you don\u0027t know what an OB means (Lesson 3.5), you can\u0027t trade it. The Academy and the indicator are partners, not replacements.' },
          { myth: '&quot;Smart money traders don\u0027t use indicators&quot;', truth: 'Institutional desks use far more sophisticated tools than retail traders. The idea that &quot;real traders&quot; only use naked charts is a myth. What matters is understanding what the tools show you \u2014 not avoiding them.' },
          { myth: '&quot;The indicator will make me profitable automatically&quot;', truth: 'No indicator makes you profitable. YOUR decisions, YOUR risk management, and YOUR discipline make you profitable. The indicator saves time and reduces errors. The rest is on you.' },
          { myth: '&quot;I should follow every signal the indicator gives&quot;', truth: 'PHANTOM PRO is a diagnostic tool \u2014 it shows you the landscape. Not every OB it marks is tradeable. Not every BOS it detects warrants an entry. YOU filter using your models (Lesson 3.12), Kill Zones (3.10), and PO3 (3.11).' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedMyth(expandedMyth === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: item.myth }} />
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMyth === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedMyth === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.truth}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Feature Knowledge</p>
          <h2 className="text-2xl font-extrabold mb-2">PHANTOM PRO Feature Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios testing your understanding of how PHANTOM PRO maps to SMC concepts.</p>
        </motion.div>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</span>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <p className="text-gray-300 text-sm mb-4">{currentGame.q}</p>
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (<button key={oi} onClick={() => { if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span>{currentGame.explain}</div>
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Next Round &rarr;</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all">See Results &rarr;</button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128269; Perfect! You know exactly how PHANTOM PRO maps to SMC.' : gameScore >= 3 ? 'Solid feature understanding.' : 'Review the feature map and three pillars sections.'}</p>
          </motion.div>
        )}
      </section>

      {/* S07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">PHANTOM PRO Quiz</h2>
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
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '\u2713'} {answered && isChosen && !isCorrect && '\u2717'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">&#10003;</span> {q.explain}</motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128269; Perfect! Academy + PHANTOM PRO = unstoppable.' : score >= 66 ? 'Solid understanding. Ready for the Level 3 Capstone.' : 'Review the feature map and three pillars.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-primary-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">&#128269;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.13: SMC + ATLAS PHANTOM PRO</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 via-primary-400 to-accent-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; PHANTOM Operator &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.14 &mdash; Sessions Deep Dive</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
