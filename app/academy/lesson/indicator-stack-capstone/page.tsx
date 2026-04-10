// app/academy/lesson/indicator-stack-capstone/page.tsx
// ATLAS Academy — Lesson 5.14: Building Your Indicator Stack — Capstone [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 5
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function AnimScene({ drawFn, height = 300 }: { drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const loop = () => { ctx.clearRect(0, 0, rect.width, rect.height); drawFn(ctx, rect.width, rect.height, frameRef.current); frameRef.current++; animRef.current = requestAnimationFrame(loop); };
    loop(); return () => cancelAnimationFrame(animRef.current);
  }, [drawFn, height]);
  return <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5"><canvas ref={canvasRef} style={{ width: '100%', height }} /></div>;
}

// ============================================================
// ANIMATION 1: The Complete Stack — 4 Dimensions Orbiting
// A central "TRADE" node with 4 dimension nodes orbiting it.
// Lines connect when aligned. Pulses on full alignment.
// ============================================================
function CompleteStackAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.3;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Your Complete Indicator Stack', cx, 14);

    const dims = [
      { label: 'TREND', icon: '📈', colour: 'rgba(96,165,250,', angle: 0, speed: 1 },
      { label: 'MOMENTUM', icon: '⚡', colour: 'rgba(245,158,11,', angle: Math.PI / 2, speed: 1.3 },
      { label: 'VOLUME', icon: '📊', colour: 'rgba(168,85,247,', angle: Math.PI, speed: 0.9 },
      { label: 'VOLATILITY', icon: '🌪️', colour: 'rgba(239,83,80,', angle: Math.PI * 1.5, speed: 1.1 }
    ];

    // Check alignment (all in upper half = aligned)
    const positions = dims.map(d => {
      const a = d.angle + t * d.speed;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.6, aligned: Math.sin(a) < -0.2 };
    });
    const allAligned = positions.every(p => p.aligned);

    // Connection lines
    positions.forEach((p) => {
      ctx.strokeStyle = p.aligned ? 'rgba(38,166,154,0.3)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = p.aligned ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
    });

    // Central node
    const centralPulse = allAligned ? 0.8 + 0.2 * Math.sin(t * 5) : 0.3;
    const centralR = allAligned ? 28 : 22;
    ctx.beginPath();
    ctx.arc(cx, cy, centralR, 0, Math.PI * 2);
    ctx.fillStyle = allAligned ? `rgba(38,166,154,${centralPulse * 0.15})` : 'rgba(255,255,255,0.03)';
    ctx.fill();
    ctx.strokeStyle = allAligned ? `rgba(38,166,154,${centralPulse})` : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = allAligned ? `rgba(38,166,154,${centralPulse})` : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(allAligned ? 'A+ TRADE' : 'WAITING', cx, cy + 4);

    // Dimension nodes
    dims.forEach((d, i) => {
      const p = positions[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = p.aligned ? d.colour + '0.15)' : 'rgba(255,255,255,0.02)';
      ctx.fill();
      ctx.strokeStyle = p.aligned ? d.colour + '0.7)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(d.icon, p.x, p.y + 1);

      ctx.font = 'bold 8px system-ui';
      ctx.fillStyle = p.aligned ? d.colour + '0.9)' : 'rgba(255,255,255,0.2)';
      ctx.fillText(d.label, p.x, p.y + 30);
      ctx.fillText(p.aligned ? '✓' : '—', p.x, p.y - 22);
    });

    if (allAligned) {
      ctx.fillStyle = `rgba(38,166,154,${centralPulse})`;
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('✦ ALL DIMENSIONS CONFIRMED ✦', cx, h - 8);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: Journey Recap — Level 5 topics scrolling
// A timeline showing all 14 lessons with icons, scrolling left
// ============================================================
function JourneyRecapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.4;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Your Level 5 Journey — 14 Lessons of Indicator Intelligence', w / 2, 14);

    const lessons = [
      { num: '5.1', title: 'What Indicators Are', icon: '🌡️' },
      { num: '5.2', title: 'Leading vs Lagging', icon: '🪞' },
      { num: '5.3', title: 'Oscillator Anatomy', icon: '⚙️' },
      { num: '5.4', title: 'Signal vs Noise', icon: '📡' },
      { num: '5.5', title: 'Momentum', icon: '⚡' },
      { num: '5.6', title: 'RSI Masterclass', icon: '📊' },
      { num: '5.7', title: 'MACD Deep Dive', icon: '📈' },
      { num: '5.8', title: 'Stochastic & CCI', icon: '🎛️' },
      { num: '5.9', title: 'Volume Intelligence', icon: '📊' },
      { num: '5.10', title: 'Moving Averages', icon: '📏' },
      { num: '5.11', title: 'Volatility', icon: '🌪️' },
      { num: '5.12', title: 'Confluence Matrix', icon: '🎯' },
      { num: '5.13', title: 'SMC Fusion', icon: '🔗' },
      { num: '5.14', title: 'YOUR STACK', icon: '🏆' }
    ];

    const cardW = 90;
    const gap = 10;
    const totalW = lessons.length * (cardW + gap);
    const scrollX = -t % totalW;
    const midY = h / 2 + 5;

    // Timeline line
    ctx.strokeStyle = 'rgba(245,158,11,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();

    // Draw cards
    lessons.forEach((lesson, i) => {
      let x = scrollX + i * (cardW + gap);
      if (x < -cardW) x += totalW;
      if (x > w + cardW) return;

      const distFromCenter = Math.abs(x + cardW / 2 - w / 2);
      const scale = Math.max(0.6, 1 - distFromCenter / (w * 0.6));
      const alpha = Math.max(0.2, scale);

      // Card
      ctx.fillStyle = `rgba(245,158,11,${0.03 * alpha})`;
      ctx.beginPath();
      ctx.roundRect(x, midY - 35 * scale, cardW * scale, 70 * scale, 6);
      ctx.fill();
      ctx.strokeStyle = `rgba(245,158,11,${0.2 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Content
      ctx.globalAlpha = alpha;
      ctx.font = `${16 * scale}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(lesson.icon, x + cardW * scale / 2, midY - 8 * scale);

      ctx.font = `bold ${7 * scale}px system-ui`;
      ctx.fillStyle = 'rgba(245,158,11,0.8)';
      ctx.fillText(lesson.num, x + cardW * scale / 2, midY + 16 * scale);

      ctx.font = `${6 * scale}px system-ui`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(lesson.title, x + cardW * scale / 2, midY + 26 * scale);
      ctx.globalAlpha = 1;
    });
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// DATA
// ============================================================
const trendOptions = [
  { id: 'sma50', label: '50 SMA', desc: 'Medium-term institutional benchmark. Best for swing trading (days to weeks).' },
  { id: 'sma200', label: '200 SMA', desc: 'Long-term regime filter. The most watched MA on the planet.' },
  { id: 'ema21', label: '21 EMA', desc: 'Short-term pullback level. Best for intraday and short swing trades.' },
  { id: 'ribbon', label: 'MA Ribbon (8–150)', desc: 'Visual trend strength. Spread = strong trend. Compression = transition.' }
];
const momentumOptions = [
  { id: 'rsi', label: 'RSI (14)', desc: 'The most versatile oscillator. Divergence, range shifts, failure swings. Best for trending markets.' },
  { id: 'macd', label: 'MACD (12,26,9)', desc: 'Histogram acceleration, zero-line dynamics. Best for trend-momentum analysis.' },
  { id: 'stoch', label: 'Stochastic (14,3,3)', desc: 'Range-bound specialist. Best for mean-reversion in ranging conditions.' }
];
const volumeOptions = [
  { id: 'obv', label: 'OBV', desc: 'Cumulative volume. Best for divergence detection and institutional accumulation/distribution.' },
  { id: 'vwap', label: 'VWAP', desc: 'Intraday institutional benchmark. Best for day trading and mean reversion.' },
  { id: 'volbars', label: 'Relative Volume Bars', desc: 'Simple and effective. Compare current bar volume to 20-period average.' }
];
const volatilityOptions = [
  { id: 'atr', label: 'ATR (14)', desc: 'Average candle size. Essential for stop placement and position sizing.' },
  { id: 'bb', label: 'Bollinger Bands (20,2)', desc: 'Squeeze detection, band walks, mean reversion in ranges.' },
  { id: 'keltner', label: 'Keltner Channels (20,2)', desc: 'Smoother ATR-based bands. Combine with BB for TTM Squeeze.' }
];

const levelRecap = [
  { lesson: '5.1', title: 'What Indicators Are', key: 'Indicators are diagnostic tools, not crystal balls. They measure what already happened, not what will happen.' },
  { lesson: '5.2', title: 'Leading vs Lagging', key: 'No indicator truly leads. &ldquo;Leading&rdquo; indicators just use shorter lookback periods. All look backwards.' },
  { lesson: '5.3', title: 'Oscillator Anatomy', key: 'RSI, MACD, Stochastic all follow the same pattern: gather past data &rarr; run formula &rarr; output bounded value.' },
  { lesson: '5.4', title: 'Signal vs Noise', key: '90% of indicator signals are noise. Five filters (structure, session, volume, confluence, timeframe) separate the A+ from the garbage.' },
  { lesson: '5.5', title: 'Momentum', key: 'Momentum fades before price reverses. Divergence is the earliest warning. The train slows before it stops.' },
  { lesson: '5.6', title: 'RSI Masterclass', key: 'Beyond overbought/oversold: divergence, failure swings, range shifts, RSI trendlines. Regime-adaptive zones (40&ndash;80 bull, 20&ndash;60 bear).' },
  { lesson: '5.7', title: 'MACD Deep Dive', key: 'Three components: MACD line, signal line, histogram. Histogram direction is the fastest signal. Zero-line cross is the slowest.' },
  { lesson: '5.8', title: 'Stochastic &amp; CCI', key: 'Trending &rarr; RSI. Ranging &rarr; Stochastic. Breakouts &rarr; CCI. Match the oscillator to the market condition.' },
  { lesson: '5.9', title: 'Volume Intelligence', key: 'Volume confirms conviction. High volume breakouts sustain. Low volume breakouts fail. OBV divergence = smart money exiting.' },
  { lesson: '5.10', title: 'Moving Averages Advanced', key: 'Golden/death crosses are filters, not triggers. 50 and 200 work because everyone watches them (self-fulfilling prophecy).' },
  { lesson: '5.11', title: 'Volatility Intelligence', key: 'Low vol &rarr; high vol. Always. ATR-based stops adapt to conditions. BB squeeze predicts expansion, not direction.' },
  { lesson: '5.12', title: 'The Confluence Matrix', key: 'Four dimensions: trend, momentum, volume, volatility. Count dimensions, not indicators. 3/4 = trade. 4/4 = A+.' },
  { lesson: '5.13', title: 'Indicator + SMC Fusion', key: 'Structure (L3) + Indicators (L5) = the A+ setup. Six-layer checklist: structure, trend, momentum, volume, session, volatility.' }
];

const gameRounds = [
  { scenario: 'You&apos;re building your personal indicator stack. You currently have: RSI (momentum), MACD (momentum), Stochastic (momentum), Bollinger Bands (volatility). What is wrong with this stack and how would you fix it?', options: [
    { text: 'Three momentum tools is massive redundancy. Keep RSI (most versatile), drop MACD and Stochastic. Add a trend tool (50 SMA) and volume tool (OBV). Final stack: 50 SMA + RSI + OBV + BB = 4 dimensions.', correct: true, explain: 'Exactly. Three momentum tools echo the same data. One per dimension is the rule. 50 SMA (trend) + RSI (momentum) + OBV (volume) + BB (volatility) = zero redundancy, four independent information streams.' },
    { text: 'It&apos;s fine — more momentum confirmation means higher win rate', correct: false, explain: 'Three momentum tools don&apos;t increase your win rate — they increase your false confidence. They move in lockstep and tell you the same thing three times. You&apos;re missing trend and volume entirely, which means you have 2 dimensions, not 4.' }
  ]},
  { scenario: 'A new trader shows you their chart: it has 12 indicators. They ask &ldquo;Is this too many?&rdquo; What is the professional answer?', options: [
    { text: 'It depends — if they cover different dimensions, 12 might be acceptable', correct: false, explain: '12 indicators is always too many. Even if they cover 4 dimensions, you only need ONE per dimension. 12 tools create chart clutter, decision paralysis, and conflicting signals. The professional answer is 4 tools maximum.' },
    { text: 'Yes — 4 tools maximum, one per dimension. A chart you can&apos;t read in 5 seconds has too many indicators. Strip it to: one trend, one momentum, one volume, one volatility.', correct: true, explain: 'The 5-second rule. If you can&apos;t assess the setup in 5 seconds, you have too much noise. Professional desks run lean. 4 tools from 4 dimensions is the maximum effective dose. Everything beyond that adds confusion, not information.' }
  ]},
  { scenario: 'You&apos;re a swing trader on the daily chart. Which stack makes the most sense for your style?', options: [
    { text: '50/200 SMA (trend) + RSI 14 (momentum) + OBV (volume) + ATR 14 (volatility) — four tools matching the swing trading timeframe', correct: true, explain: 'Perfect match. 50/200 SMA captures weekly-to-monthly trends (appropriate for daily chart). RSI 14 is the default that works well on daily. OBV tracks institutional accumulation over time. ATR 14 sets proper stop distances. Every tool is calibrated to the swing trading horizon.' },
    { text: '9 EMA (trend) + Stochastic (momentum) + VWAP (volume) + BB (volatility) — fast tools catch more moves', correct: false, explain: '9 EMA is too short for daily swing trading (only 9 days). Stochastic is a range tool, not ideal for trending conditions swing traders seek. VWAP resets daily and is meaningless on higher timeframes. This stack is built for intraday scalping, not swing trading. Match tools to timeframe.' }
  ]},
  { scenario: 'You complete the Level 5 journey. What is the SINGLE most important concept you should take forward into every trade?', options: [
    { text: 'Indicators predict the future if you find the right combination and settings', correct: false, explain: 'This is the core myth Level 5 dismantled. No indicator predicts the future. They all measure the past with different lookback windows. Their value is in diagnosing current conditions and confirming setups — never in prediction.' },
    { text: 'Count independent DIMENSIONS of confirmation, not number of indicators. Structure + 4 dimensions = the A+ trade.', correct: true, explain: 'This is the throughline of the entire level. From 5.1 (indicators are diagnostic tools) through 5.12 (the confluence matrix) to 5.13 (fusion with structure): the quality of a setup is determined by how many INDEPENDENT dimensions agree, not by how many indicators you stack.' }
  ]},
  { scenario: 'Your trading buddy says: &ldquo;I backtested and found that a 17 EMA + 43 SMA crossover gives the best results. That&apos;s my trend tool.&rdquo; What is the concern?', options: [
    { text: 'Over-optimisation. 17 and 43 are curve-fitted to historical data. Standard periods (21, 50, 200) work because millions of traders watch them, creating self-fulfilling prophecy. Optimised periods that nobody else watches have no crowd consensus power.', correct: true, explain: 'The power of standard MAs comes from collective attention, not mathematical precision. A 17/43 crossover might backtest well on past data but has no forward-looking edge because no other market participants are watching those levels. Stick with 21/50/200 — the crowd IS the edge.' },
    { text: 'No concern — backtested results are always reliable for forward trading', correct: false, explain: 'Backtested optimisation is one of the most common traps in trading. What worked on historical data is often curve-fitted to that specific dataset. MAs work because of crowd consensus, not mathematical perfection. A period nobody watches has no self-fulfilling prophecy power.' }
  ]}
];

const quizQuestions = [
  { q: 'How many tools should a professional indicator stack contain?', opts: ['As many as possible', 'Exactly 4 — one per dimension: trend, momentum, volume, volatility', '2 is enough', '10+ for thorough analysis'], correct: 1, explain: 'One tool per dimension, four dimensions total. This gives you maximum independent information with zero redundancy. Every tool answers a different question. More than 4 adds noise without adding signal.' },
  { q: 'For a swing trader on the daily chart, which trend tool is most appropriate?', opts: ['9 EMA', '50 SMA and/or 200 SMA', 'VWAP', '3 EMA'], correct: 1, explain: 'The 50 and 200 SMA capture medium and long-term trends appropriate for daily-chart swing trading. The 9 EMA is too short (only 9 days). VWAP resets daily and is meaningless for swing timeframes.' },
  { q: 'What is the throughline concept of Level 5 — Indicator Intelligence?', opts: ['Find the perfect indicator settings', 'Indicators predict the future', 'Count independent dimensions of confirmation, not number of indicators', 'Use as many oscillators as possible'], correct: 2, explain: 'From Lesson 5.1 through 5.13, the core message is: indicators are diagnostic tools that measure current conditions. Quality comes from INDEPENDENT dimensions agreeing, not from stacking many tools from the same dimension.' },
  { q: 'RSI, Stochastic, and CCI on the same chart gives you:', opts: ['Three-dimensional confluence', 'One dimension (momentum) measured three times — redundancy', 'A complete trading system', 'Better entries'], correct: 1, explain: 'All three are momentum oscillators derived from price data. They move in near-lockstep. Three tools from one dimension is textbook redundancy. Keep ONE momentum tool and add trend, volume, and volatility tools instead.' },
  { q: 'The A+ fusion setup checklist from Lesson 5.13 has six layers. What is the minimum score for a standard trade?', opts: ['2/6', '3/6', '4/6 with nothing actively disagreeing', '6/6 only'], correct: 2, explain: '4/6 layers confirmed with zero dimensions actively opposing is the minimum for a standard-size trade. 5/6 deserves full conviction. 6/6 is the textbook A+ where you might add size. Below 4/6, the setup lacks sufficient independent confirmation.' },
  { q: 'Why do the 50 and 200 SMA &ldquo;work&rdquo; better than optimised periods like 43 and 117?', opts: ['50 and 200 are mathematically superior', 'Millions of traders and algorithms watch them, creating a self-fulfilling prophecy of support/resistance', 'They were invented first', 'They don&apos;t — optimised periods always outperform'], correct: 1, explain: 'Standard MAs derive their power from crowd consensus, not mathematics. When billions of dollars react to the same levels, those levels become real. A custom period that nobody else watches has no collective power behind it.' },
  { q: 'Volume declining during a pullback in an uptrend means:', opts: ['The trend is dying', 'Sellers aren&apos;t aggressive — this is a healthy pullback likely to be followed by trend continuation', 'You should exit all positions', 'Volume is irrelevant during pullbacks'], correct: 1, explain: 'Declining volume on a pullback is one of the most bullish volume patterns. It means the retracement is driven by profit-taking, not institutional selling. The absence of aggressive selling volume suggests the trend is intact and likely to resume.' },
  { q: 'You have completed all 14 lessons of Level 5. What is the correct order to apply your knowledge before every trade?', opts: ['Momentum first, then decide direction', 'Check indicators, ignore structure', 'Structure (WHERE) &rarr; Trend filter (DIRECTION) &rarr; Momentum (WHY) &rarr; Volume (WHO) &rarr; Session (WHEN) &rarr; ATR stop (HOW MUCH)', 'Enter first, check indicators after'], correct: 2, explain: 'The full professional workflow: Structure gives the level. Trend gives direction. Momentum confirms strength. Volume validates participation. Session confirms timing. ATR determines risk sizing. This is the six-layer A+ checklist from Lesson 5.13 — the culmination of everything in Level 5.' }
];

export default function IndicatorStackCapstonePage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  // Playbook builder
  const [trendTool, setTrendTool] = useState('');
  const [momentumTool, setMomentumTool] = useState('');
  const [volumeTool, setVolumeTool] = useState('');
  const [volatilityTool, setVolatilityTool] = useState('');
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pageH = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 1;
  const progress = Math.min(scrollY / (pageH || 1), 1);

  const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const handleGameAnswer = (oi: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const a = [...gameAnswers]; a[gameRound] = oi; setGameAnswers(a);
    if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1);
  };

  const handleQuizAnswer = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== null) return;
    const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a);
    const newAnswers = [...a]; newAnswers[qi] = oi;
    if (newAnswers.every(v => v !== null)) {
      const correct = newAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length;
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setQuizScore(pct); setQuizDone(true);
      if (pct >= 66) {
        setCertUnlocked(true);
        setTimeout(() => {
          try { const { default: confetti } = require('canvas-confetti'); confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#ffffff', '#0ea5e9'] }); } catch {}
        }, 400);
      }
    }
  };

  const stackComplete = trendTool && momentumTool && volumeTool && volatilityTool;
  const selectedTools = [
    { dim: 'Trend', tool: trendOptions.find(o => o.id === trendTool) },
    { dim: 'Momentum', tool: momentumOptions.find(o => o.id === momentumTool) },
    { dim: 'Volume', tool: volumeOptions.find(o => o.id === volumeTool) },
    { dim: 'Volatility', tool: volatilityOptions.find(o => o.id === volatilityTool) }
  ];

  return (
    <div className="min-h-screen text-gray-200" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${progress * 100}%` }} /></motion.div>

      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between max-w-3xl mx-auto px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.04]">
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">PRO &middot; LEVEL 5</span>
        </div>
        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent tracking-widest">ATLAS ACADEMY</span>
      </nav>

      <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 14 &mdash; Capstone</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Building Your <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Indicator Stack</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">The final lesson. Build your personal indicator playbook and earn the Level 5 Capstone Certificate.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Your Personal Indicator Playbook</p>
            <p className="text-gray-400 leading-relaxed">You&apos;ve completed 13 lessons covering every major indicator category, the confluence matrix, and the fusion approach. Now it&apos;s time to do what most traders never do: deliberately and intentionally CHOOSE your personal indicator stack based on principles, not impulse. This is your trading playbook &mdash; the 4 tools you&apos;ll use on every chart from this point forward.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; REAL SCENARIO</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading performance study followed 500 traders for 12 months. Those who documented their indicator stack in a written playbook and committed to using ONLY those tools had a <strong className="text-green-400">28% higher Sharpe ratio</strong> than those who &ldquo;used whatever felt right.&rdquo; The discipline of CHOOSING and STICKING to your tools was worth more than the specific tools chosen.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Complete Stack Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Complete Stack</p>
          <h2 className="text-2xl font-extrabold mb-2">Four Dimensions, Four Tools, Zero Redundancy</h2>
          <p className="text-gray-400 text-sm mb-5">When all four dimensions align around a structural level, you have the A+ trade.</p>
          <CompleteStackAnimation />
        </motion.div>
      </section>

      {/* S02 — Journey Recap Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Journey</p>
          <h2 className="text-2xl font-extrabold mb-2">14 Lessons of Indicator Intelligence</h2>
          <p className="text-gray-400 text-sm mb-5">Every concept you&apos;ve mastered, scrolling through your Level 5 timeline.</p>
          <JourneyRecapAnimation />
        </motion.div>
      </section>

      {/* S03 — Level 5 Recap */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Key Takeaways</p>
          <h2 className="text-2xl font-extrabold mb-2">One Line per Lesson</h2>
          <p className="text-gray-400 text-sm mb-5">The single most important concept from each lesson. If you remember nothing else, remember these.</p>
          <div className="space-y-2">
            {levelRecap.map((item, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`recap-${i}`)} className="w-full flex items-center justify-between p-3 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-amber-400 w-6">{item.lesson}</span>
                    <span className="text-xs font-extrabold text-white">{item.title}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${expandedCards[`recap-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`recap-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-3 pb-3"><p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.key }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Interactive Playbook Builder */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Build Your Stack</p>
          <h2 className="text-2xl font-extrabold mb-2">Indicator Playbook Builder</h2>
          <p className="text-gray-400 text-sm mb-5">Select one tool per dimension. This becomes your personal indicator playbook.</p>
          <div className="space-y-5">
            {/* Trend */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-bold text-blue-400 mb-3">📈 TREND DIMENSION</p>
              <div className="grid grid-cols-2 gap-2">
                {trendOptions.map(opt => (
                  <button key={opt.id} onClick={() => setTrendTool(opt.id)} className={`p-3 rounded-lg text-left transition-all ${trendTool === opt.id ? 'bg-blue-500/15 border border-blue-500/30' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <p className={`text-xs font-extrabold ${trendTool === opt.id ? 'text-blue-400' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Momentum */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-bold text-amber-400 mb-3">⚡ MOMENTUM DIMENSION</p>
              <div className="grid grid-cols-3 gap-2">
                {momentumOptions.map(opt => (
                  <button key={opt.id} onClick={() => setMomentumTool(opt.id)} className={`p-3 rounded-lg text-left transition-all ${momentumTool === opt.id ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <p className={`text-xs font-extrabold ${momentumTool === opt.id ? 'text-amber-400' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Volume */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-bold text-purple-400 mb-3">📊 VOLUME DIMENSION</p>
              <div className="grid grid-cols-3 gap-2">
                {volumeOptions.map(opt => (
                  <button key={opt.id} onClick={() => setVolumeTool(opt.id)} className={`p-3 rounded-lg text-left transition-all ${volumeTool === opt.id ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <p className={`text-xs font-extrabold ${volumeTool === opt.id ? 'text-purple-400' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Volatility */}
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs font-bold text-red-400 mb-3">🌪️ VOLATILITY DIMENSION</p>
              <div className="grid grid-cols-3 gap-2">
                {volatilityOptions.map(opt => (
                  <button key={opt.id} onClick={() => setVolatilityTool(opt.id)} className={`p-3 rounded-lg text-left transition-all ${volatilityTool === opt.id ? 'bg-red-500/15 border border-red-500/30' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'}`}>
                    <p className={`text-xs font-extrabold ${volatilityTool === opt.id ? 'text-red-400' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Playbook Summary */}
          {stackComplete && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
                <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4">YOUR INDICATOR PLAYBOOK</p>
                <div className="space-y-3">
                  {selectedTools.map((st, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className={`text-xs font-extrabold w-20 ${i === 0 ? 'text-blue-400' : i === 1 ? 'text-amber-400' : i === 2 ? 'text-purple-400' : 'text-red-400'}`}>{st.dim}</span>
                      <span className="text-sm font-extrabold text-white">{st.tool?.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                  <p className="text-xs text-green-400 font-bold mb-1">✓ ZERO REDUNDANCY — 4 DIMENSIONS COVERED</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">This is your stack. Commit to it. Put ONLY these 4 tools on your chart. Run the 6-layer checklist (5.13) on every setup. Trust the process.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* S05 — The Commitment */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Commitment</p>
          <h2 className="text-2xl font-extrabold mb-2">Rules of Engagement</h2>
          <p className="text-gray-400 text-sm mb-5">Your stack is chosen. These rules keep you disciplined.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            {[
              { rule: 'Use ONLY your 4 chosen tools', desc: 'No adding &ldquo;just one more&rdquo; indicator. No temporary additions. Your chart has 4 tools and structure. That&apos;s it.' },
              { rule: 'Run the 6-layer checklist before every trade', desc: 'Structure &rarr; Trend &rarr; Momentum &rarr; Volume &rarr; Session &rarr; ATR Stop. No shortcuts.' },
              { rule: '3/4 dimensions minimum, nothing opposing', desc: 'If fewer than 3 dimensions confirm, or if any dimension actively opposes, the trade does not exist.' },
              { rule: 'Review your stack every 3 months', desc: 'Markets evolve. After 3 months, assess: is your momentum tool serving you? Is your trend filter appropriate for your timeframe? Adjust deliberately, not impulsively.' },
              { rule: 'Journal every trade with dimension scores', desc: 'For each trade, record which dimensions confirmed and which didn&apos;t. After 50 trades, the data will show you where your edge actually lives.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-extrabold text-amber-400">{i + 1}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{item.rule}</p>
                  <p className="text-xs text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S06 — What&apos;s Next */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; What&apos;s Next</p>
          <h2 className="text-2xl font-extrabold mb-2">Your Journey Continues</h2>
          <p className="text-gray-400 text-sm mb-5">Level 5 is complete. Here&apos;s what comes next in the ATLAS Academy.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">Completed: Levels 1&ndash;5</p>
              <p className="text-[11px] text-gray-400">Foundations &rarr; Technical Analysis &rarr; Smart Money Concepts &rarr; Trading Psychology &rarr; Indicator Intelligence</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs font-extrabold text-white mb-1">Coming Next: Level 6 &mdash; Strategy Building</p>
              <p className="text-[11px] text-gray-400">How to build, test, and refine complete trading strategies using everything you&apos;ve learned across Levels 1&ndash;5.</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs font-extrabold text-white mb-1">Future Levels</p>
              <p className="text-[11px] text-gray-400">Level 7: Options Trading &middot; Level 8: Prop Firm Mastery &middot; Level 9: ATLAS Suite Mastery</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S07 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Level 5 Manifesto</p>
          <h2 className="text-2xl font-extrabold mb-2">10 Laws of Indicator Intelligence</h2>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              'Indicators measure the past. They do not predict the future.',
              'All &ldquo;leading&rdquo; indicators are just shorter lookback periods looking backwards.',
              '90% of signals are noise. Five filters separate A+ from garbage.',
              'Momentum fades before price reverses. Divergence is the earliest warning.',
              'Volume confirms conviction. A breakout without volume is a lie.',
              'The 50 and 200 SMA work because everyone watches them, not because 50 and 200 are special numbers.',
              'Low volatility leads to high volatility. Always. Prepare for the squeeze.',
              'Count independent DIMENSIONS, not indicators. 4 tools from 4 dimensions beats 10 from 2.',
              'Structure provides the WHERE. Indicators provide the WHY, WHO, WHEN, and HOW MUCH.',
              'Choose your 4 tools. Commit. Trust the process. Review every 3 months.'
            ].map((law, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-xs font-extrabold text-amber-400 flex-shrink-0 w-5">{i + 1}.</span>
                <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: law }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Game (moved to S08 to make room for manifesto) */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Capstone Challenge</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios covering the entire Level 5 curriculum. This is the final test before your capstone certificate.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-amber-400">Round {gameRound + 1} of {gameRounds.length}</span><span className="text-xs font-mono text-gray-500">{gameScore}/{gameRounds.length} correct</span></div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Outstanding. You have mastered Indicator Intelligence. Your stack is ready.' : gameScore >= 3 ? 'Solid understanding. Review the redundancy and timeframe-matching concepts.' : 'Review the full Level 5 before finalising your playbook. Every lesson matters.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S09 — Quiz + Cert */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Capstone Certificate unlocked below.' : 'You need 66% to earn the Capstone Certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/30" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.08),transparent,rgba(139,92,246,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 via-purple-500 to-sky-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/40">🏆</div>
                  <p className="text-xs tracking-widest uppercase text-amber-400/80 mb-2">CAPSTONE CERTIFICATE</p>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Mastery</p>
                  <p className="text-sm text-gray-400">Has successfully completed all 14 lessons of<br /><strong className="text-white text-base">Level 5: Indicator Intelligence</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-sky-400 bg-clip-text text-transparent font-bold text-xl mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Indicator Intelligence Master &mdash;</p>
                  <p className="text-[10px] text-gray-500 mt-2">14 lessons &middot; 28 canvas animations &middot; 112 quiz questions &middot; 70 game rounds</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase mt-2">PRO-CERT-L5.CAPSTONE-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>
    </div>
  );
}
