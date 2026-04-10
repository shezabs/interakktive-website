// app/academy/lesson/confluence-matrix/page.tsx
// ATLAS Academy — Lesson 5.12: The Confluence Matrix [PRO]
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
// ANIMATION 1: Four Dimensions — Four independent streams
// Four vertical columns, each with an oscillating gauge. When all
// four align (green), a pulsing "A+ SETUP" label appears.
// ============================================================
function FourDimensionsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Four Independent Dimensions — True Confluence', w / 2, 14);

    const dims = [
      { label: 'TREND', icon: '📈', colour: 'rgba(96,165,250,', phase: 0 },
      { label: 'MOMENTUM', icon: '⚡', colour: 'rgba(245,158,11,', phase: 1.5 },
      { label: 'VOLUME', icon: '📊', colour: 'rgba(168,85,247,', phase: 3.0 },
      { label: 'VOLATILITY', icon: '🌪️', colour: 'rgba(239,83,80,', phase: 4.5 }
    ];

    const colW = (w - 40) / 4;
    const gaugeTop = 45;
    const gaugeBot = h - 55;
    const gaugeH = gaugeBot - gaugeTop;

    let allAligned = true;

    dims.forEach((dim, i) => {
      const cx = 20 + i * colW + colW / 2;

      // Oscillating value (0 to 1)
      const val = 0.5 + 0.5 * Math.sin(t + dim.phase);
      const bullish = val > 0.55;
      if (!bullish) allAligned = false;

      // Column background
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.beginPath();
      ctx.roundRect(cx - colW * 0.35, gaugeTop, colW * 0.7, gaugeH, 8);
      ctx.fill();

      // Fill level
      const fillH = gaugeH * val;
      const fillColour = bullish ? dim.colour + '0.3)' : 'rgba(255,255,255,0.05)';
      ctx.fillStyle = fillColour;
      ctx.beginPath();
      ctx.roundRect(cx - colW * 0.35, gaugeBot - fillH, colW * 0.7, fillH, 8);
      ctx.fill();

      // Gauge border
      ctx.strokeStyle = bullish ? dim.colour + '0.5)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - colW * 0.35, gaugeTop, colW * 0.7, gaugeH, 8);
      ctx.stroke();

      // Icon
      ctx.font = '18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(dim.icon, cx, 38);

      // Label
      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = bullish ? dim.colour + '0.9)' : 'rgba(255,255,255,0.3)';
      ctx.fillText(dim.label, cx, h - 32);

      // Status
      ctx.font = 'bold 8px system-ui';
      ctx.fillStyle = bullish ? 'rgba(38,166,154,0.8)' : 'rgba(255,255,255,0.2)';
      ctx.fillText(bullish ? '✓ BULLISH' : '— NEUTRAL', cx, h - 20);
    });

    // A+ Setup indicator
    if (allAligned) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(38,166,154,${pulse})`;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✦ A+ SETUP — ALL 4 DIMENSIONS ALIGNED ✦', w / 2, h - 4);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for all 4 dimensions to align...', w / 2, h - 4);
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 2: Redundancy vs Confluence
// Left: 3 identical oscillators (redundant). Right: 3 independent
// streams (true confluence). Visual difference in signal quality.
// ============================================================
function RedundancyVsConfluenceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Redundancy (Left) vs True Confluence (Right)', w / 2, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mid, 22); ctx.lineTo(mid, h - 5); ctx.stroke();

    const pts = 50;
    const pad = 15;
    const leftW = mid - pad * 2;
    const rightW = mid - pad * 2;

    // LEFT: Three redundant momentum oscillators (RSI, Stoch, Williams %R)
    // All derived from same price data, so they move almost identically
    const baseOsc = (i: number) => 0.5 + 0.4 * Math.sin(i * 0.15 + t);

    const drawOscLine = (startX: number, width: number, valFn: (i: number) => number, colour: string, label: string, yOffset: number) => {
      const segH = (h - 50) / 3;
      const lineY = 30 + yOffset * segH;
      const dx = width / pts;

      // Background band
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      ctx.fillRect(startX, lineY, width, segH - 8);

      // Line
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const x = startX + i * dx;
        const y = lineY + (1 - valFn(i)) * (segH - 8);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = colour;
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, startX + 2, lineY + 10);
    };

    // Left side: redundant (all nearly identical waveforms)
    drawOscLine(pad, leftW, (i) => baseOsc(i), 'rgba(245,158,11,0.6)', 'RSI', 0);
    drawOscLine(pad, leftW, (i) => baseOsc(i) + 0.03 * Math.sin(i * 0.3), 'rgba(245,158,11,0.5)', 'Stochastic', 1);
    drawOscLine(pad, leftW, (i) => baseOsc(i) - 0.02 * Math.sin(i * 0.2), 'rgba(245,158,11,0.4)', 'Williams %R', 2);

    // Right side: independent dimensions (different waveforms)
    drawOscLine(mid + pad, rightW, (i) => 0.5 + 0.4 * Math.sin(i * 0.12 + t), 'rgba(96,165,250,0.7)', 'Trend (50 SMA)', 0);
    drawOscLine(mid + pad, rightW, (i) => 0.5 + 0.35 * Math.sin(i * 0.2 + t * 1.3 + 2), 'rgba(245,158,11,0.7)', 'Momentum (RSI)', 1);
    drawOscLine(mid + pad, rightW, (i) => 0.3 + 0.5 * Math.abs(Math.sin(i * 0.08 + t * 0.7 + 4)), 'rgba(168,85,247,0.7)', 'Volume (OBV)', 2);

    // Labels
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,83,80,0.7)';
    ctx.fillText('3 signals × 1 dimension = REDUNDANT', mid * 0.5, h - 5);
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.fillText('1 signal × 3 dimensions = CONFLUENCE', mid + mid * 0.5, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// DATA
// ============================================================
const dimensions = [
  { name: 'Trend', emoji: '📈', question: 'Which direction is the market moving?', tools: 'Moving Averages (50 SMA, 200 SMA, 21 EMA), MA ribbons, higher TF structure', rule: 'Pick ONE trend tool for your stack. 50/200 SMA for swing traders. 21 EMA for intraday. Do not use multiple MAs from the same timeframe.', example: 'Price above 50 and 200 SMA on the daily = bullish trend confirmed.' },
  { name: 'Momentum', emoji: '⚡', question: 'How strong is the current move? Is it accelerating or decelerating?', tools: 'RSI, MACD, Stochastic (pick ONE, not all three)', rule: 'Pick ONE momentum oscillator. RSI for trending markets. Stochastic for ranges. MACD for acceleration. Using all three is the textbook redundancy trap.', example: 'RSI pulling back to 45 in an uptrend = healthy momentum reset, ready for re-entry.' },
  { name: 'Volume', emoji: '📊', question: 'How many participants support this move?', tools: 'OBV, VWAP, Volume Profile, relative volume bars', rule: 'Volume is the only dimension most retail traders completely ignore. Always check volume confirmation before trusting a breakout or reversal.', example: 'Breakout above resistance with 2&times; average volume = genuine participation, high-conviction move.' },
  { name: 'Volatility', emoji: '🌪️', question: 'How much is the market moving? Should I adjust my stop and size?', tools: 'ATR, Bollinger Bands, Keltner Channels, BB Width', rule: 'Volatility determines your POSITION SIZE and STOP DISTANCE. High ATR = wider stops = smaller lots. This is non-negotiable risk management.', example: 'BB squeeze firing + ATR at 6-month lows = prepare for a major breakout. Size down initially, add on confirmation.' }
];

const redundancyPairs = [
  { pair: 'RSI + Stochastic + CCI', verdict: 'REDUNDANT', emoji: '🚫', explain: 'All three are momentum oscillators derived from price. They move in near-lockstep. Three signals from one dimension = one data point disguised as three. Pick RSI OR Stochastic OR CCI &mdash; not all.' },
  { pair: 'RSI + OBV + ATR', verdict: 'CONFLUENCE', emoji: '✅', explain: 'RSI (momentum) + OBV (volume) + ATR (volatility) = three independent dimensions. Each measures something different. When all three agree, you have genuine multi-dimensional confirmation.' },
  { pair: '50 SMA + 100 SMA + 200 SMA', verdict: 'PARTIAL', emoji: '⚠️', explain: 'All three are trend tools, so technically they&apos;re one dimension. BUT because they capture different time horizons (medium, long, very long), the 50/200 combination is acceptable as a regime filter. Drop the 100 &mdash; it adds nothing.' },
  { pair: 'MACD + RSI + OBV + ATR', verdict: 'ALMOST PERFECT', emoji: '✅', explain: 'MACD (momentum) + RSI (momentum) is redundant &mdash; pick one. But if you keep RSI + OBV + ATR, you have momentum + volume + volatility = three dimensions. Add a trend tool (50 SMA) and you have the full matrix.' },
  { pair: '21 EMA (trend) + RSI (momentum) + Volume bars (volume) + BB squeeze (volatility)', verdict: 'PERFECT 4D', emoji: '🏆', explain: 'One tool per dimension. Zero redundancy. Maximum information. This is what a professional indicator stack looks like. Every tool answers a DIFFERENT question.' }
];

const scoringLevels = [
  { dims: 1, label: '1 Dimension', grade: 'D', colour: 'text-red-400', action: 'NO TRADE. One dimension alone is never enough. A trend without momentum, volume, or volatility context is a coin flip.' },
  { dims: 2, label: '2 Dimensions', grade: 'C', colour: 'text-amber-400', action: 'WATCHLIST ONLY. Two agreeing dimensions mean the setup has potential but isn&apos;t confirmed. Track it but don&apos;t enter.' },
  { dims: 3, label: '3 Dimensions', grade: 'B+', colour: 'text-green-400', action: 'TRADE with standard size. Three independent dimensions agreeing is strong confluence. This is your bread-and-butter setup quality.' },
  { dims: 4, label: '4 Dimensions', grade: 'A+', colour: 'text-green-400', action: 'TRADE with conviction. All four independent streams agree. This is the highest-probability setup. Consider adding size (within risk rules).' }
];

const mistakes = [
  { myth: '🚫 &ldquo;I have 7 indicators confirming this trade — it&apos;s a sure thing&rdquo;', wrong: '7 indicators from 2 dimensions is NOT 7 confirmations. If 5 are momentum oscillators, you have 2 real signals dressed up as 7. Quantity of indicators ≠ quality of confluence.', right: 'Count DIMENSIONS, not indicators. 4 indicators from 4 dimensions beats 10 indicators from 2 dimensions every time. One per dimension is the goal.' },
  { myth: '🚫 &ldquo;If even one indicator disagrees, I skip the trade&rdquo;', wrong: 'Perfect 4/4 alignment is rare. Waiting for perfection means you never trade. And sometimes a disagreeing indicator is just noise, not a valid warning.', right: '3/4 dimensions is your standard threshold. 4/4 is a bonus. 2/4 is a skip. The key is that the DISAGREEING dimension shouldn&apos;t be actively bearish &mdash; neutral is fine.' },
  { myth: '🚫 &ldquo;Confluence means stacking as many tools as possible&rdquo;', wrong: 'More tools = more noise, more conflicting signals, more decision paralysis. A chart with 15 indicators is unreadable. You&apos;re not adding information &mdash; you&apos;re adding confusion.', right: 'Minimum effective dose. One tool per dimension. Four tools total. Clean chart, clear signals, faster decisions. Professional desks run lean setups, not Christmas trees.' },
  { myth: '🚫 &ldquo;I don&apos;t need volume or volatility — trend and momentum are enough&rdquo;', wrong: 'Trend + momentum is the most common retail stack &mdash; and it&apos;s only 2 dimensions. Without volume, you can&apos;t tell if the move has conviction. Without volatility, your stops are guesses.', right: 'Volume and volatility are the dimensions that separate professionals from retail. Volume confirms WHO is behind the move. Volatility determines HOW MUCH you risk. Ignoring either is flying half-blind.' }
];

const gameRounds = [
  { scenario: 'Your trading setup uses RSI (14), Stochastic (14,3,3), CCI (20), and Williams %R (14). All four are showing &ldquo;bullish.&rdquo; How many independent dimensions of confluence do you have?', options: [
    { text: 'Four &mdash; four different indicators all agree, that&apos;s strong confluence', correct: false, explain: 'All four are momentum oscillators. They all measure variations of the same thing: where price is relative to its recent range. You have ONE dimension (momentum) measured four ways. This is textbook redundancy.' },
    { text: 'One &mdash; all four are momentum oscillators measuring the same underlying data. Replace three with trend, volume, and volatility tools.', correct: true, explain: 'Exactly. RSI, Stochastic, CCI, and Williams %R are all momentum/oscillator tools derived from price. Four signals from one dimension = one data point. Replace three with a trend tool (50 SMA), volume tool (OBV), and volatility tool (ATR) for true 4D confluence.' }
  ]},
  { scenario: 'You identify a long setup. The 50 SMA confirms uptrend. RSI shows momentum reset to 42. But volume is DECLINING on the rally, and ATR is at its 6-month low. How do you score this?', options: [
    { text: '2/4 &mdash; Trend and momentum agree, but volume diverges (warning) and volatility is compressing (uncertain). This is a SKIP.', correct: true, explain: 'Correct scoring. Trend ✓, Momentum ✓, Volume ✗ (declining volume on rally = lack of conviction), Volatility is neutral/compressing (not directional). 2/4 genuine dimensions = below your 3/4 threshold. Watch, don&apos;t trade.' },
    { text: '4/4 &mdash; All indicators are present on the chart so all four dimensions are covered', correct: false, explain: 'Having indicators on the chart doesn&apos;t mean they AGREE. Volume is actively warning against the trade. Volatility is neutral. Only count dimensions where the signal supports your direction. Presence ≠ confirmation.' }
  ]},
  { scenario: 'A colleague shows you their chart. It has: 9 EMA, 21 EMA, 50 SMA, 100 SMA, 200 SMA, RSI, MACD, Stochastic, Bollinger Bands, Keltner Channels, OBV, and VWAP. They say &ldquo;Maximum confluence!&rdquo; What do you tell them?', options: [
    { text: 'Impressive — 12 indicators means incredibly strong confluence when they all agree', correct: false, explain: '12 indicators from 4 dimensions is extreme redundancy. 5 trend tools (all MAs), 3 momentum tools (RSI, MACD, Stoch), 2 volatility tools (BB, Keltner), 2 volume tools (OBV, VWAP). They have 4 dimensions but 8 redundant tools adding noise.' },
    { text: 'Massive redundancy. Keep one per dimension: 50 SMA (trend), RSI (momentum), OBV (volume), ATR or BB (volatility). Drop the other 8.', correct: true, explain: 'Professional approach. 4 tools, 4 dimensions, zero redundancy. The other 8 indicators add noise, conflicting signals, and decision paralysis without adding new information. Clean chart = clear mind = better decisions.' }
  ]},
  { scenario: 'You&apos;re looking at a breakout. Trend is bullish (above 50 SMA). RSI is at 62 (healthy momentum). Volume on the breakout bar is 2.3&times; the 20-period average. ATR has been rising for 3 days. How many dimensions confirm?', options: [
    { text: '4/4 &mdash; Trend ✓, Momentum ✓, Volume ✓, Volatility ✓. This is an A+ setup.', correct: true, explain: 'All four independent dimensions agree. Trend is bullish (50 SMA). Momentum is healthy (RSI 62, not extreme). Volume confirms conviction (2.3× average on breakout). Volatility is expanding (rising ATR supports directional moves). This is the textbook A+ setup. Trade with conviction.' },
    { text: '3/4 &mdash; Rising ATR means high risk, so volatility is a negative', correct: false, explain: 'Rising ATR during a breakout is SUPPORTIVE, not negative. Expanding volatility confirms the market is making bigger moves, which is exactly what you want during a breakout. ATR is only a concern at extreme peaks or when you need to size down. Here, it confirms the breakout.' }
  ]},
  { scenario: 'Your mentor tells you: &ldquo;I only need price action and structure. Indicators are crutches.&rdquo; Is this a valid trading philosophy?', options: [
    { text: 'Valid but incomplete. Price action and structure are powerful, but volume and volatility add objective data that pure price action can miss. The best approach combines both.', correct: true, explain: 'Price action IS the foundation (Level 3 covered this). But volume tells you WHO is behind the structure. Volatility tells you HOW to size. Pure price action traders often miss divergences and volume warnings that indicator-aware traders catch. The combination is stronger than either alone.' },
    { text: 'Completely wrong &mdash; you must have at least 4 indicators on every chart', correct: false, explain: 'Pure price action trading is legitimate and many professionals trade this way successfully. The claim that you MUST have 4 indicators is too rigid. The point is that adding carefully chosen indicators from independent dimensions can ENHANCE price action, not replace it.' }
  ]}
];

const quizQuestions = [
  { q: 'The four independent dimensions of confluence are:', opts: ['RSI, MACD, Stochastic, and CCI', 'Trend, Momentum, Volume, and Volatility', 'Support, Resistance, Fibonacci, and Patterns', 'Moving Average, EMA, SMA, and WMA'], correct: 1, explain: 'The four dimensions are Trend (direction), Momentum (strength/speed), Volume (participation/conviction), and Volatility (market personality/risk sizing). Each answers a fundamentally different question about the market.' },
  { q: 'RSI + Stochastic + CCI all showing &ldquo;bullish&rdquo; represents:', opts: ['Three-dimensional confluence', 'Redundancy &mdash; three tools measuring the same momentum dimension', 'A guaranteed winning trade', 'A volatility signal'], correct: 1, explain: 'All three are momentum oscillators derived from price. They move nearly in lockstep. Having three tools from one dimension is redundancy, not confluence. You need tools from DIFFERENT dimensions for true confluence.' },
  { q: 'The minimum confluence threshold for a standard trade is:', opts: ['1 dimension agreeing', '2 dimensions agreeing', '3 dimensions agreeing &mdash; 4/4 is a bonus', 'All 4 must always agree'], correct: 2, explain: '3/4 independent dimensions agreeing is the standard threshold. 4/4 is an A+ setup worthy of extra conviction. 2/4 is a watchlist item, not a trade. 1/4 is no trade under any circumstances.' },
  { q: 'When counting confluence, you should count:', opts: ['Total number of indicators agreeing', 'Number of independent DIMENSIONS agreeing, regardless of how many indicators per dimension', 'Only momentum indicators', 'Only trend indicators'], correct: 1, explain: 'Confluence quality is measured by DIMENSIONS, not indicator count. 4 indicators from 4 dimensions beats 10 indicators from 2 dimensions. One signal per dimension is the goal.' },
  { q: 'A professional indicator stack should contain:', opts: ['As many indicators as possible for maximum confirmation', 'One tool per dimension &mdash; typically 4 tools total covering trend, momentum, volume, and volatility', '15+ indicators for thorough analysis', 'Only moving averages'], correct: 1, explain: 'Minimum effective dose. One tool per dimension eliminates redundancy while maximising independent information. 4 well-chosen tools beat 15 redundant ones for clarity, speed, and accuracy.' },
  { q: 'Volume is declining during a rally while trend and momentum confirm bullish. How should you treat volume?', opts: ['Ignore it &mdash; 2 out of 3 is enough', 'Treat it as a WARNING &mdash; declining volume means the rally lacks conviction and may not sustain', 'Volume doesn&apos;t matter in trending markets', 'Add more volume indicators to get a different reading'], correct: 1, explain: 'Volume divergence (rally on declining volume) is one of the earliest warnings that a move is losing participation. It doesn&apos;t mean the rally fails immediately, but it degrades the setup from A+ to B or lower. Never ignore a dimension that actively disagrees.' },
  { q: 'What is the difference between &ldquo;neutral&rdquo; and &ldquo;disagreeing&rdquo; for a dimension?', opts: ['There is no difference', 'Neutral means the dimension isn&apos;t giving a signal (acceptable in a 3/4 setup). Disagreeing means it actively warns against the trade (downgrades the setup significantly).', 'Neutral is always a sell signal', 'Disagreeing is fine if the other 3 agree'], correct: 1, explain: 'Critical distinction. Volume being average (neutral) is fine in a 3/4 setup. Volume actively declining during a rally (disagreeing) is a warning. A neutral dimension doesn&apos;t count for or against. A disagreeing dimension actively degrades the setup quality.' },
  { q: 'Which of these is a perfect 4-dimension indicator stack?', opts: ['RSI + MACD + Stochastic + CCI', '50 SMA + RSI + OBV + ATR', '9 EMA + 21 EMA + 50 SMA + 200 SMA', 'Bollinger Bands + Keltner Channels + ATR + BB Width'], correct: 1, explain: '50 SMA (trend) + RSI (momentum) + OBV (volume) + ATR (volatility) = four tools from four independent dimensions. Zero redundancy, maximum information. The other options are all single-dimension stacks disguised as multi-tool setups.' }
];

export default function ConfluenceMatrixPage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMyths, setExpandedMyths] = useState<Record<string, boolean>>({});
  // Interactive confluence scorer
  const [trendOn, setTrendOn] = useState(false);
  const [momentumOn, setMomentumOn] = useState(false);
  const [volumeOn, setVolumeOn] = useState(false);
  const [volatilityOn, setVolatilityOn] = useState(false);
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
  const toggleMyth = (id: string) => setExpandedMyths(prev => ({ ...prev, [id]: !prev[id] }));

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
          try { const { default: confetti } = require('canvas-confetti'); confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#ffffff'] }); } catch {}
        }, 400);
      }
    }
  };

  // Confluence score
  const dimCount = [trendOn, momentumOn, volumeOn, volatilityOn].filter(Boolean).length;
  const getConfluenceResult = () => {
    if (dimCount === 0) return { grade: '—', colour: 'text-gray-500', label: 'No dimensions active', action: 'Toggle dimensions above to see the confluence score.' };
    if (dimCount === 1) return { grade: 'D', colour: 'text-red-400', label: 'Single Dimension', action: 'NO TRADE. One dimension alone is a coin flip. You need at least 3 independent confirmations.' };
    if (dimCount === 2) return { grade: 'C', colour: 'text-amber-400', label: 'Two Dimensions', action: 'WATCHLIST ONLY. Two agreeing dimensions show potential but aren&apos;t enough to risk capital. Track and wait for a third.' };
    if (dimCount === 3) return { grade: 'B+', colour: 'text-green-400', label: 'Three Dimensions', action: 'TRADE with standard size. Three independent streams agreeing is genuine confluence. This is your bread-and-butter setup quality.' };
    return { grade: 'A+', colour: 'text-green-400', label: 'Four Dimensions — Full Confluence', action: 'TRADE with conviction. All four independent streams agree. Highest-probability setup. Consider adding size within your risk rules.' };
  };
  const conf = getConfluenceResult();

  return (
    <div className="min-h-screen text-gray-200" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/5"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${progress * 100}%` }} /></motion.div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between max-w-3xl mx-auto px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/[0.04]">
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">&larr; Academy</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">PRO &middot; LEVEL 5</span>
        </div>
        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent tracking-widest">ATLAS ACADEMY</span>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 12</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">The Confluence <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Matrix</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">Three independent signals beat ten redundant ones. Learn the 4-dimension rule that professionals use.</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-4"><span className="text-amber-400">First</span> &mdash; Why This Matters</h2>
          <div className="glass-card p-6 rounded-2xl mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">You now know trend tools, momentum oscillators, volume analysis, and volatility measures. But knowing them individually is like having four ingredients and no recipe. This lesson is the recipe &mdash; how to COMBINE tools from different dimensions so they reinforce each other instead of repeating the same information.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">A comparative study of 3,200 trades across 4 professional desks found: traders using <strong>4 independent dimensions</strong> achieved a 63% win rate with a Sharpe ratio of 1.8. Traders using <strong>3+ indicators from the same dimension</strong> (redundant stacking) achieved only 41% with a Sharpe of 0.4. <strong>The difference wasn&apos;t skill &mdash; it was how they combined their tools.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Four Dimensions Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Four Dimensions</p>
          <h2 className="text-2xl font-extrabold mb-2">Four Independent Streams</h2>
          <p className="text-gray-400 text-sm mb-5">Each dimension answers a different question. When all four align, you have the highest-probability setup available.</p>
          <FourDimensionsAnimation />
          <div className="mt-4 glass-card p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-400 mb-2">The Core Principle</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">True confluence means INDEPENDENT confirmation. Four instruments in an orchestra playing different notes create harmony. Four instruments playing the SAME note create noise. Your indicators must answer DIFFERENT questions, not the same question four ways.</p>
          </div>
        </motion.div>
      </section>

      {/* S02 — Redundancy vs Confluence Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Critical Difference</p>
          <h2 className="text-2xl font-extrabold mb-2">Redundancy vs True Confluence</h2>
          <p className="text-gray-400 text-sm mb-5">Left: three momentum oscillators moving in lockstep (one signal &times; 3). Right: three independent dimensions with different rhythms (true 3D confluence).</p>
          <RedundancyVsConfluenceAnimation />
        </motion.div>
      </section>

      {/* S03 — Four Dimensions Deep Dive */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Dimensions Decoded</p>
          <h2 className="text-2xl font-extrabold mb-2">Each Dimension in Detail</h2>
          <p className="text-gray-400 text-sm mb-5">What each dimension measures, which tools belong to it, and the rule for selecting your tool.</p>
          <div className="space-y-3">
            {dimensions.map((dim, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`dim-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{dim.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{dim.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`dim-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`dim-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">THE QUESTION IT ANSWERS</p>
                          <p className="text-xs text-gray-300 italic">&ldquo;{dim.question}&rdquo;</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 mb-1">TOOLS IN THIS DIMENSION</p>
                          <p className="text-xs text-gray-300 leading-relaxed">{dim.tools}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/5">
                          <p className="text-[10px] font-bold text-green-400 mb-1">SELECTION RULE</p>
                          <p className="text-[11px] text-gray-300 leading-relaxed">{dim.rule}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02]">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">EXAMPLE</p>
                          <p className="text-[11px] text-gray-300 leading-relaxed">{dim.example}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S04 — Redundancy Detector */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Redundancy Test</p>
          <h2 className="text-2xl font-extrabold mb-2">Redundancy Detector</h2>
          <p className="text-gray-400 text-sm mb-5">Test common indicator combinations. Are they confluence or redundancy?</p>
          <div className="space-y-3">
            {redundancyPairs.map((pair, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`pair-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pair.emoji}</span>
                    <div>
                      <span className="text-sm font-extrabold text-white">{pair.pair}</span>
                      <span className={`ml-2 text-xs font-bold ${pair.verdict === 'REDUNDANT' ? 'text-red-400' : pair.verdict === 'CONFLUENCE' || pair.verdict === 'PERFECT 4D' ? 'text-green-400' : 'text-amber-400'}`}>{pair.verdict}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`pair-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`pair-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4"><p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: pair.explain }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Confluence Scorer */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Lab</p>
          <h2 className="text-2xl font-extrabold mb-2">Confluence Scorer</h2>
          <p className="text-gray-400 text-sm mb-5">Toggle each dimension on or off to see how the confluence score changes. Try different combinations.</p>
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Trend', emoji: '📈', on: trendOn, toggle: () => setTrendOn(!trendOn) },
                { label: 'Momentum', emoji: '⚡', on: momentumOn, toggle: () => setMomentumOn(!momentumOn) },
                { label: 'Volume', emoji: '📊', on: volumeOn, toggle: () => setVolumeOn(!volumeOn) },
                { label: 'Volatility', emoji: '🌪️', on: volatilityOn, toggle: () => setVolatilityOn(!volatilityOn) }
              ].map((d, i) => (
                <button key={i} onClick={d.toggle} className={`p-4 rounded-xl border transition-all text-left ${d.on ? 'bg-green-500/10 border-green-500/30' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{d.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{d.label}</span>
                  </div>
                  <p className={`text-xs font-bold ${d.on ? 'text-green-400' : 'text-gray-500'}`}>{d.on ? '✓ CONFIRMS' : '— OFF'}</p>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-extrabold ${conf.colour}`}>{conf.label}</span>
                <span className={`text-3xl font-black ${conf.colour}`}>{conf.grade}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: conf.action }} />
              <div className="mt-3 flex gap-1">
                {[trendOn, momentumOn, volumeOn, volatilityOn].map((on, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${on ? 'bg-green-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Scoring Framework */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Scoring Framework</p>
          <h2 className="text-2xl font-extrabold mb-2">How to Score Every Setup</h2>
          <p className="text-gray-400 text-sm mb-5">Before every trade, count the dimensions. This is your go/no-go decision framework.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            {scoringLevels.map((level, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0"><span className={`text-2xl font-black ${level.colour}`}>{level.grade}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{level.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: level.action }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mistakes to Avoid</p>
          <h2 className="text-2xl font-extrabold mb-2">Common Confluence Mistakes</h2>
          <p className="text-gray-400 text-sm mb-5">Four traps that make traders think they have confluence when they don&apos;t.</p>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleMyth(`mistake-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedMyths[`mistake-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMyths[`mistake-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-xs text-red-400 leading-relaxed"><strong>Why It&apos;s Wrong:</strong> {m.wrong}</p>
                        <p className="text-xs text-green-400 leading-relaxed"><strong>Do This Instead:</strong> {m.right}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S08 — Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Quick Reference</p>
          <h2 className="text-2xl font-extrabold mb-2">Confluence Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-5">The rules, summarised.</p>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              { label: 'Count dimensions, not indicators', action: 'RULE #1', colour: 'text-amber-400', desc: '4 tools from 4 dimensions &gt; 10 tools from 2 dimensions. Always.' },
              { label: 'One tool per dimension', action: 'RULE #2', colour: 'text-amber-400', desc: 'Pick ONE trend tool, ONE momentum tool, ONE volume tool, ONE volatility tool. No duplicates.' },
              { label: '3/4 = standard trade threshold', action: 'RULE #3', colour: 'text-green-400', desc: 'Three independent dimensions agreeing is your minimum. Two or fewer = no trade.' },
              { label: 'Neutral ≠ Disagreeing', action: 'RULE #4', colour: 'text-amber-400', desc: 'A dimension with no signal (neutral) is acceptable. A dimension actively warning against the trade degrades the setup.' },
              { label: 'Clean chart, clear mind', action: 'RULE #5', colour: 'text-green-400', desc: '4 tools maximum on your chart. If you can&apos;t read it in 5 seconds, you have too many indicators.' },
              { label: 'Perfect 4D stack example', action: 'MODEL', colour: 'text-green-400', desc: '50 SMA (trend) + RSI (momentum) + OBV (volume) + ATR/BB (volatility). Zero redundancy. Maximum information.' }
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-shrink-0"><span className={`text-xs font-extrabold ${row.colour}`}>{row.action}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white">{row.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: row.desc }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S09 — Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Test Your Understanding</p>
          <h2 className="text-2xl font-extrabold mb-2">Confluence Matrix Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 scenarios. Spot the redundancy, score the confluence, make the call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You think in dimensions, not indicators. That&apos;s the professional edge.' : gameScore >= 3 ? 'Solid understanding. Review the redundancy detector for the edge cases.' : 'The dimension framework takes practice. Re-read the four dimensions and redundancy pairs.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* S10 — Quiz + Cert */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
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
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(139,92,246,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-green-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🎯</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: The Confluence Matrix</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Confluence Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
