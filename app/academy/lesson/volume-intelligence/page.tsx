// app/academy/lesson/volume-intelligence/page.tsx
// ATLAS Academy — Lesson 5.9: Volume Intelligence [PRO]
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
// ANIMATION 1: Volume Conviction Visualiser
// Top: price candles. Bottom: volume bars. Shows how high-volume
// breakouts succeed and low-volume breakouts fail.
// ============================================================
function VolumeConvictionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const mid = h * 0.45;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Volume = Conviction Behind the Move', w / 2, 14);

    // Generate price bars
    const bars = 30;
    const barW = (w - 40) / bars;
    const breakoutBar = 20;
    const phase = Math.floor(t % 6);
    const successBreakout = phase < 3;

    for (let i = 0; i < bars; i++) {
      const x = 20 + i * barW;
      // Price moves
      let priceBase = mid;
      if (i > breakoutBar) {
        priceBase = successBreakout ? mid - (i - breakoutBar) * 4 - Math.sin(t * 0.5) * 3 : mid + (i - breakoutBar) * 0.5 * Math.sin(i * 0.5);
      }
      const open = priceBase + Math.sin(i * 1.3 + t * 0.3) * 8;
      const close = priceBase + Math.cos(i * 1.7 + t * 0.2) * 8;
      const high = Math.min(open, close) - Math.abs(Math.sin(i * 2.1)) * 6;
      const low = Math.max(open, close) + Math.abs(Math.cos(i * 1.9)) * 6;
      const bullish = close < open;

      // Candle body
      ctx.fillStyle = bullish ? 'rgba(38,166,154,0.7)' : 'rgba(239,83,80,0.7)';
      ctx.fillRect(x + barW * 0.2, Math.min(open, close), barW * 0.6, Math.abs(close - open) || 1);
      // Wick
      ctx.strokeStyle = bullish ? 'rgba(38,166,154,0.4)' : 'rgba(239,83,80,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + barW * 0.5, high); ctx.lineTo(x + barW * 0.5, low); ctx.stroke();

      // Volume bars
      const volBase = h - 20;
      let volHeight = 15 + Math.abs(Math.sin(i * 0.8)) * 25;
      if (i === breakoutBar) volHeight = successBreakout ? 80 + Math.sin(t * 2) * 10 : 12;
      if (i === breakoutBar + 1 && successBreakout) volHeight = 65;
      if (i === breakoutBar && !successBreakout) volHeight = 10 + Math.sin(t) * 3;

      const volAlpha = successBreakout && i >= breakoutBar && i <= breakoutBar + 2 ? 0.8 : 0.3;
      ctx.fillStyle = bullish ? `rgba(38,166,154,${volAlpha})` : `rgba(239,83,80,${volAlpha})`;
      ctx.fillRect(x + barW * 0.15, volBase - volHeight, barW * 0.7, volHeight);
    }

    // Resistance line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, mid); ctx.lineTo(w - 20, mid); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Resistance', 22, mid - 5);

    ctx.textAlign = 'center';
    ctx.font = 'bold 10px system-ui';
    if (successBreakout) {
      ctx.fillStyle = 'rgba(38,166,154,0.8)';
      ctx.fillText('✓ HIGH VOLUME BREAKOUT — HOLDS', w / 2, h - 5);
    } else {
      ctx.fillStyle = 'rgba(239,83,80,0.8)';
      ctx.fillText('✗ LOW VOLUME BREAKOUT — FAILS', w / 2, h - 5);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: OBV Divergence Detector
// Top: price making higher highs. Bottom: OBV making lower highs.
// ============================================================
function OBVDivergenceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('OBV Divergence = Smart Money Exiting', w / 2, 14);

    const pts = 60;
    const pad = 30;
    const dx = (w - pad * 2) / pts;
    const priceMid = h * 0.3;
    const obvMid = h * 0.72;

    // Price: making higher highs
    const pricePoints: number[] = [];
    for (let i = 0; i < pts; i++) {
      const base = priceMid - i * 0.6 + Math.sin(i * 0.25 + t) * 15;
      pricePoints.push(base);
    }

    // OBV: making lower highs (divergence)
    const obvPoints: number[] = [];
    for (let i = 0; i < pts; i++) {
      const base = obvMid + i * 0.4 + Math.sin(i * 0.25 + t) * 12;
      obvPoints.push(base);
    }

    // Draw price line
    ctx.strokeStyle = 'rgba(96,165,250,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pricePoints.forEach((y, i) => {
      const x = pad + i * dx;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw OBV line
    ctx.strokeStyle = 'rgba(245,158,11,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    obvPoints.forEach((y, i) => {
      const x = pad + i * dx;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Higher high arrows on price
    const peak1 = Math.floor(pts * 0.35);
    const peak2 = Math.floor(pts * 0.75);
    ctx.fillStyle = 'rgba(96,165,250,0.6)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('▲ Higher High', pad + peak1 * dx, pricePoints[peak1] - 10);
    ctx.fillText('▲ Higher High', pad + peak2 * dx, pricePoints[peak2] - 10);

    // Lower high arrows on OBV
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('▼ Lower High', pad + peak1 * dx, obvPoints[peak1] + 18);
    ctx.fillText('▼ Lower High', pad + peak2 * dx, obvPoints[peak2] + 18);

    // Divergence line
    ctx.strokeStyle = 'rgba(239,83,80,0.5)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad + peak1 * dx, pricePoints[peak1]);
    ctx.lineTo(pad + peak1 * dx, obvPoints[peak1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad + peak2 * dx, pricePoints[peak2]);
    ctx.lineTo(pad + peak2 * dx, obvPoints[peak2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(96,165,250,0.5)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', pad, priceMid + 40);
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.fillText('OBV (On-Balance Volume)', pad, obvMid - 30);

    // Warning
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(239,83,80,${0.4 + pulse * 0.4})`;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ BEARISH DIVERGENCE — Smart money reducing positions', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// DATA
// ============================================================
const volumeTools = [
  { name: 'On-Balance Volume (OBV)', emoji: '📊', formula: 'Running total: +volume on up days, &minus;volume on down days', plain: 'Think of it like a scoreboard. Every day buyers &ldquo;win&rdquo; (price up), the volume gets added. Every day sellers win (price down), the volume gets subtracted. The direction of the running total reveals who has been winning consistently &mdash; buyers or sellers.', strength: 'Shows cumulative conviction over time. Divergence between OBV and price is one of the earliest warnings in technical analysis.', weakness: 'All-or-nothing &mdash; assigns ENTIRE bar&apos;s volume to one side, even if the close was up by 1 tick.', proUse: 'Divergence detection. If price makes a new high but OBV doesn&apos;t, large players are distributing &mdash; selling into the rally while retail buys.' },
  { name: 'VWAP (Volume-Weighted Average Price)', emoji: '🎯', formula: '&sum;(Price &times; Volume) &divide; &sum;(Volume)', plain: 'VWAP answers: &ldquo;What is the AVERAGE price that traders paid today, weighted by how much they traded at each price?&rdquo; If the current price is above VWAP, most traders who bought today are in profit. Below VWAP, most are underwater.', strength: 'Institutional benchmark. Algorithms and desk traders use VWAP to measure execution quality. It&apos;s the most widely watched intraday level in professional trading.', weakness: 'Resets daily &mdash; no value on higher timeframes. Meaningless for swing or position traders.', proUse: 'Mean reversion entries in ranging sessions. If price spikes far above VWAP, it tends to revert. Institutions accumulate near VWAP, not at extremes.' },
  { name: 'Volume Profile', emoji: '🏔️', formula: 'Horizontal histogram of volume at each price level', plain: 'Instead of showing volume per TIME bar, volume profile shows volume per PRICE level. Imagine stacking all the volume traded at $100, then all the volume at $101, etc. You get a mountain-shaped histogram showing where the most trading happened.', strength: 'Reveals acceptance zones (high volume nodes &mdash; price is &ldquo;fair&rdquo; here and tends to consolidate) and rejection zones (low volume nodes &mdash; price moved through quickly and likely will again).', weakness: 'Requires sufficient historical data. The more data, the more meaningful the profile. Thin markets produce unreliable profiles.', proUse: 'High Volume Nodes (HVN) = support/resistance. Low Volume Nodes (LVN) = fast price movement. Point of Control (POC) = the single price with most volume = the &ldquo;fairest&rdquo; price.' },
  { name: 'Volume Divergence', emoji: '⚠️', formula: 'Price moves one way, volume moves the opposite', plain: 'The market is telling you two different stories. Price says &ldquo;we&apos;re going up!&rdquo; but volume says &ldquo;...with less and less conviction.&rdquo; It&apos;s like a crowd cheering but the crowd is getting smaller with each cheer.', strength: 'One of the most reliable early warnings. Doesn&apos;t predict timing, but flags that the current move is losing the participation it needs to continue.', weakness: 'Can persist for many bars. Divergence is a warning, not a signal. The move can continue for a long time on declining volume before reversing.', proUse: 'Combine with RSI divergence and structure (Level 3). Volume divergence + RSI divergence + approaching key structure = high probability reversal zone.' },
  { name: 'Volume Climax / Exhaustion', emoji: '💥', formula: 'Extreme volume spike (2&ndash;3&times; average) at a key level', plain: 'A volume climax is like a massive crowd all rushing through the same door at once. It often marks capitulation &mdash; everyone who wanted to sell has sold, or everyone who wanted to buy has bought. The fuel is spent.', strength: 'Marks the exact moment of maximum participation. Often corresponds to capitulation lows or euphoria tops.', weakness: 'Not every spike is a climax. News events can cause spikes that don&apos;t mark reversals. Context matters enormously.', proUse: 'Volume climax at a key demand zone (Level 3) after a sustained downtrend = potential reversal. Volume climax at a supply zone after a sustained uptrend = potential distribution.' }
];

const volumeMyths = [
  { myth: '🚫 &ldquo;High volume always means the price will go up&rdquo;', wrong: 'Volume is directionless. A huge red candle has high volume too. Volume tells you HOW MUCH was traded, not which direction wins.', right: 'Read volume IN CONTEXT. High volume at a demand zone after a sell-off = potential buying climax. High volume at resistance during a rally = potential distribution.' },
  { myth: '🚫 &ldquo;Low volume means nothing is happening&rdquo;', wrong: 'Low volume during a rally is a MAJOR signal &mdash; it means fewer participants support the move. That&apos;s a divergence warning.', right: 'Low volume reveals lack of conviction. A breakout on low volume is suspicious. A pullback on low volume is healthy (no selling pressure). Context determines meaning.' },
  { myth: '🚫 &ldquo;Volume doesn&apos;t matter for forex&rdquo;', wrong: 'Tick volume (number of price changes) in forex correlates strongly with real volume. Multiple studies show 80%+ correlation. It&apos;s imperfect but far from useless.', right: 'Use tick volume as a proxy in forex. The patterns (divergence, climax, confirmation) work the same way. Not perfect, but much better than ignoring volume entirely.' },
  { myth: '🚫 &ldquo;Just look at the volume bars under the chart&rdquo;', wrong: 'Raw volume bars without context are nearly useless. Is 5 million shares &ldquo;high&rdquo;? Depends on the stock. AAPL and a penny stock have very different baselines.', right: 'Always compare volume to its AVERAGE (20-period SMA of volume). Above average = noteworthy. 2&times; average = significant. 3&times; average = climax territory. Relative volume matters, not absolute.' }
];

const breakoutChecklist = [
  { label: 'Volume &ge; 1.5&times; 20-period average', desc: 'Enough participants to sustain the move. Below this, suspect.' },
  { label: 'Increasing volume into the breakout', desc: 'Volume should BUILD as price approaches and breaks the level, not spike and fade.' },
  { label: 'Follow-through volume next 2&ndash;3 bars', desc: 'Real breakouts get continuation volume. Fake ones spike and immediately dry up.' },
  { label: 'No immediate reversal candle', desc: 'If the very next bar reverses the breakout with equal volume, it&apos;s likely a stop hunt, not a real break.' }
];

const gameRounds = [
  { scenario: 'Gold (XAUUSD) is rallying and makes a new 2-week high. You check the volume bars: the breakout bar has volume <strong>0.7&times; the 20-period average</strong>. What does this tell you?', options: [
    { text: 'Strong breakout &mdash; new highs confirm bulls are winning', correct: false, explain: 'New highs on BELOW-AVERAGE volume is a classic warning. The price moved up but participation dropped &mdash; smart money may not be driving this.' },
    { text: 'Suspicious breakout &mdash; low volume means low conviction, likely to fail or retest', correct: true, explain: 'Exactly. Volume below average on a breakout means fewer participants support the move. This often leads to a failed breakout or at minimum a deep retest.' }
  ]},
  { scenario: 'EUR/USD has been trending down for 3 weeks. Today it drops to a new low, but you notice OBV has been making higher lows for the past 5 days. What is happening?', options: [
    { text: 'Bullish divergence &mdash; selling pressure is weakening even as price makes new lows', correct: true, explain: 'This is textbook OBV divergence. Price makes lower lows but OBV makes higher lows = cumulative buying is quietly overtaking selling. Smart money may be accumulating.' },
    { text: 'OBV is broken &mdash; price is clearly bearish so OBV should agree', correct: false, explain: 'OBV is working perfectly &mdash; it&apos;s showing you what the surface doesn&apos;t. The divergence IS the signal. Institutional accumulation often happens during downtrends.' }
  ]},
  { scenario: 'Apple (AAPL) stock pulls back to the 200 SMA. The pullback bars show <strong>decreasing volume</strong> as price falls. What does this mean?', options: [
    { text: 'Healthy pullback &mdash; low selling volume means no aggressive distribution', correct: true, explain: 'A pullback on declining volume is one of the most bullish volume patterns. It means the pullback is driven by profit-taking, not institutional selling. The trend is likely to resume.' },
    { text: 'Bearish &mdash; volume is drying up which means buyers have abandoned the stock', correct: false, explain: 'Decreasing volume on a pullback means SELLERS aren&apos;t showing up in force, not that buyers have left. If sellers were in control, you&apos;d see increasing volume on the decline.' }
  ]},
  { scenario: 'Bitcoin has been consolidating for 2 weeks in a tight range. Suddenly, a massive green candle breaks above resistance with <strong>3.2&times; the 20-period average volume</strong>. What do you do?', options: [
    { text: 'Wait for a pullback &mdash; the volume spike might be exhaustion', correct: false, explain: 'A volume climax at a BREAKOUT after a consolidation is bullish, not exhaustive. Exhaustion spikes happen at the END of extended moves, not at the START of new ones. Context matters.' },
    { text: 'This is a high-conviction breakout &mdash; look for entries on the first pullback', correct: true, explain: 'A breakout from a consolidation on 3&times; average volume is textbook. The tight range built energy, and the volume confirms genuine participation. Enter on the first pullback to the breakout level.' }
  ]},
  { scenario: 'You&apos;re watching VWAP on a 5-minute chart. Price has been above VWAP all morning during London session. It suddenly drops to VWAP and bounces with a strong green candle. What framework applies?', options: [
    { text: 'VWAP as dynamic support &mdash; in an uptrend day, VWAP acts as a floor for institutional buyers', correct: true, explain: 'When price trades above VWAP all day, institutions view VWAP as their &ldquo;fair value&rdquo; entry. Dips to VWAP get bought. This is mean-reversion trading used by prop desks worldwide.' },
    { text: 'VWAP is broken &mdash; the drop to VWAP means sellers are taking control', correct: false, explain: 'A touch of VWAP in an uptrend day is a buying opportunity, not a sell signal. VWAP acts as dynamic support. It would only break if selling volume overwhelmed the day&apos;s buyers.' }
  ]}
];

const quizQuestions = [
  { q: 'What does volume fundamentally measure?', opts: ['The direction of the next move', 'The number of contracts/shares traded &mdash; participation and conviction', 'How many buyers vs sellers there are', 'The speed of price movement'], correct: 1, explain: 'Volume measures participation &mdash; how many contracts or shares changed hands. It tells you the CONVICTION behind a move, not the direction. A big red candle has high volume too.' },
  { q: 'A stock breaks above resistance on volume that is 0.6&times; the 20-period average. What is the most likely outcome?', opts: ['Strong continuation higher', 'The breakout is suspicious and likely to fail or retest deeply', 'Volume doesn&apos;t matter for breakouts', 'The stock will gap up tomorrow'], correct: 1, explain: 'Breakouts on below-average volume lack the participation needed to sustain the move. This is one of the most reliable volume-based filters &mdash; real breakouts need real volume.' },
  { q: 'What does OBV (On-Balance Volume) measure?', opts: ['The average volume over 14 periods', 'Cumulative volume: +volume on up bars, &minus;volume on down bars', 'The ratio of buying to selling volume', 'Volume at each price level'], correct: 1, explain: 'OBV is a running total. Every up-bar adds its volume; every down-bar subtracts its volume. The direction of this running total shows whether cumulative buying or selling dominates.' },
  { q: 'Price makes a new high but OBV does NOT make a new high. This is called:', opts: ['Confirmation', 'Bearish divergence &mdash; a warning sign', 'A buy signal', 'A VWAP rejection'], correct: 1, explain: 'When price makes higher highs but OBV makes lower highs, it&apos;s bearish divergence. It means the rally is happening on decreasing cumulative volume &mdash; fewer participants support the new high.' },
  { q: 'VWAP is most useful for:', opts: ['Swing trading on the daily chart', 'Intraday institutional benchmark and mean-reversion trading', 'Identifying long-term support/resistance', 'Measuring volatility'], correct: 1, explain: 'VWAP resets daily and is the primary benchmark for institutional execution quality. It&apos;s most useful for intraday traders. Algorithms and desk traders measure their performance against VWAP.' },
  { q: 'In volume profile, a High Volume Node (HVN) represents:', opts: ['A price that will break soon', 'A price level where a lot of trading occurred &mdash; &ldquo;fair value&rdquo; and potential support/resistance', 'The highest volume bar today', 'A divergence signal'], correct: 1, explain: 'HVNs are prices where many participants traded. The market &ldquo;accepted&rdquo; this price as fair. Price tends to consolidate around HVNs and they act as magnets and S/R.' },
  { q: 'A pullback during an uptrend shows DECREASING volume. This means:', opts: ['The trend is weakening &mdash; sell immediately', 'Healthy pullback &mdash; low selling pressure means the trend is likely to continue', 'Volume is meaningless during pullbacks', 'You should wait for volume to increase before buying'], correct: 1, explain: 'Decreasing volume on a pullback is one of the most bullish volume patterns. It means sellers are not aggressively entering. The pullback is driven by profit-taking, not distribution.' },
  { q: 'What is the difference between a volume climax at a breakout vs a volume climax at the end of an extended trend?', opts: ['They mean the same thing', 'Breakout climax = fuel for new move. End-of-trend climax = exhaustion and potential reversal.', 'Both are sell signals', 'Volume climaxes are unreliable'], correct: 1, explain: 'Context is everything. A volume spike at a breakout after consolidation = fuel (participation entering a new move). A volume spike after an extended rally at resistance = exhaustion (everyone who wanted to buy has bought).' }
];

export default function VolumeIntelligencePage() {
  const [scrollY, setScrollY] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedMyths, setExpandedMyths] = useState<Record<string, boolean>>({});
  const [volumeLevel, setVolumeLevel] = useState(50);
  const [trendDirection, setTrendDirection] = useState(50);
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

  // Interactive volume diagnostic
  const getDiagnostic = () => {
    const highVol = volumeLevel > 65;
    const lowVol = volumeLevel < 35;
    const bullish = trendDirection > 60;
    const bearish = trendDirection < 40;
    const ranging = !bullish && !bearish;

    if (highVol && bullish) return { label: 'Strong Bullish Conviction', grade: 'A', colour: 'text-green-400', desc: 'High volume + rising price = genuine participation. This is a confirmed move. Look for pullback entries WITH the trend.' };
    if (highVol && bearish) return { label: 'Strong Bearish Conviction', grade: 'A', colour: 'text-red-400', desc: 'High volume + falling price = aggressive selling. Sellers are in control. Do NOT try to catch the falling knife.' };
    if (highVol && ranging) return { label: 'Volume Climax in Range', grade: 'B', colour: 'text-amber-400', desc: 'High volume but no clear direction = potential breakout imminent or distribution/accumulation. Watch for the resolution direction.' };
    if (lowVol && bullish) return { label: 'Suspicious Rally', grade: 'C', colour: 'text-amber-400', desc: 'Price rising on low volume = lack of conviction. This rally may not sustain. Volume divergence warning.' };
    if (lowVol && bearish) return { label: 'Healthy Pullback', grade: 'B+', colour: 'text-green-400', desc: 'Price pulling back on low volume = sellers aren&apos;t aggressive. In an uptrend, this is actually bullish — look for the bounce.' };
    if (lowVol && ranging) return { label: 'Dead Market', grade: 'D', colour: 'text-gray-400', desc: 'Low volume + no direction = no opportunity. Sit on your hands. Wait for volume to return with direction.' };
    return { label: 'Neutral Conditions', grade: 'C+', colour: 'text-gray-300', desc: 'Average volume and moderate trend. Nothing extreme — look for additional confluence before entering.' };
  };

  const diag = getDiagnostic();

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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-3">Level 5 &middot; Lesson 9</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Volume <span className="bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent">Intelligence</span></h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">Smart money leaves footprints. Volume is the magnifying glass that reveals them.</p>
        </motion.div>
      </section>

      {/* S00 — Why This Matters */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-extrabold mb-4"><span className="text-amber-400">First</span> &mdash; Why This Matters</h2>
          <div className="glass-card p-6 rounded-2xl mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">Price tells you WHAT happened. Volume tells you WHO showed up. A price rally on thin volume is a crowd chanting with only five people in the room. A price rally on massive volume is a stadium roaring. One sustains &mdash; the other fades to silence.</p>
          </div>
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">A study of 2,847 breakout trades across S&amp;P 500 stocks over 5 years found: breakouts on volume <strong>&ge;1.5&times; average</strong> had a 61% success rate with an average gain of +3.2%. Breakouts on volume <strong>&lt;1&times; average</strong> had a 34% success rate with an average gain of just +0.8%. <strong>Volume alone separated winners from losers by a factor of nearly 2&times;.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S01 — Volume Conviction Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Core Principle</p>
          <h2 className="text-2xl font-extrabold mb-2">Volume = Conviction</h2>
          <p className="text-gray-400 text-sm mb-5">Watch the same resistance level with different volume. High volume &rarr; breakout holds. Low volume &rarr; breakout fails.</p>
          <VolumeConvictionAnimation />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
              <p className="text-xs font-bold text-green-400 mb-1">High Volume Breakout</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Many participants pushing price through resistance. The move has the &ldquo;fuel&rdquo; to continue. This is what real breakouts look like.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-1">Low Volume Breakout</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">Few participants. Price pokes above resistance but nobody follows through. The move runs out of steam and often reverses &mdash; a &ldquo;fakeout.&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S02 — OBV Divergence Animation */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Hidden Signal</p>
          <h2 className="text-2xl font-extrabold mb-2">OBV Divergence &mdash; Smart Money Exiting</h2>
          <p className="text-gray-400 text-sm mb-5">Price makes higher highs. OBV makes lower highs. Large players are quietly selling into the rally while retail buys.</p>
          <OBVDivergenceAnimation />
          <div className="mt-4 p-4 rounded-xl glass-card">
            <p className="text-xs font-bold text-amber-400 mb-2">Why This Works</p>
            <p className="text-[11px] text-gray-300 leading-relaxed">OBV tracks cumulative volume: +volume on green bars, &minus;volume on red bars. When the running total diverges from price, it means the volume behind the move is shifting. Institutions can&apos;t hide their size &mdash; it shows up in volume. OBV divergence is one of the earliest warnings available to any trader.</p>
          </div>
        </motion.div>
      </section>

      {/* S03 — Five Volume Tools */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Toolkit</p>
          <h2 className="text-2xl font-extrabold mb-2">Five Volume Tools Decoded</h2>
          <p className="text-gray-400 text-sm mb-5">Each tool reads volume from a different angle. Together, they tell the complete story of participation.</p>
          <div className="space-y-3">
            {volumeTools.map((tool, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`tool-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tool.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{tool.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`tool-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`tool-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">FORMULA</p>
                          <p className="text-xs text-gray-300 font-mono" dangerouslySetInnerHTML={{ __html: tool.formula }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 mb-1">PLAIN ENGLISH</p>
                          <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.plain }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-green-500/5">
                            <p className="text-[10px] font-bold text-green-400 mb-1">STRENGTH</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.strength }} />
                          </div>
                          <div className="p-2 rounded-lg bg-red-500/5">
                            <p className="text-[10px] font-bold text-red-400 mb-1">WEAKNESS</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.weakness }} />
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02]">
                          <p className="text-[10px] font-bold text-amber-400 mb-1">PROFESSIONAL USE</p>
                          <p className="text-[11px] text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: tool.proUse }} />
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

      {/* S04 — Breakout Checklist */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Breakout Test</p>
          <h2 className="text-2xl font-extrabold mb-2">Volume Breakout Checklist</h2>
          <p className="text-gray-400 text-sm mb-5">Before trusting ANY breakout, run it through this 4-point volume filter.</p>
          <div className="glass-card p-5 rounded-2xl space-y-3">
            {breakoutChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-extrabold text-amber-400">{i + 1}</span></div>
                <div>
                  <p className="text-sm font-extrabold text-white" dangerouslySetInnerHTML={{ __html: item.label }} />
                  <p className="text-xs text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE GOLDEN RULE</p>
            <p className="text-xs text-gray-300 leading-relaxed">If a breakout fails 2 or more of these checks, treat it as GUILTY until proven innocent. Wait for a retest with volume confirmation before entering.</p>
          </div>
        </motion.div>
      </section>

      {/* S05 — Interactive Volume Diagnostic */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Interactive Lab</p>
          <h2 className="text-2xl font-extrabold mb-2">Volume Diagnostic Simulator</h2>
          <p className="text-gray-400 text-sm mb-5">Adjust volume and trend direction to see how professional traders read the combination.</p>
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">Volume Level</span>
                <span className="text-xs font-mono text-amber-400">{volumeLevel < 35 ? 'LOW' : volumeLevel > 65 ? 'HIGH' : 'AVERAGE'}</span>
              </div>
              <input type="range" min={0} max={100} value={volumeLevel} onChange={e => setVolumeLevel(+e.target.value)} className="w-full accent-amber-500" />
              <p className="text-[10px] text-gray-500 mt-1">Left = below average volume. Right = above average volume.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">Price Direction</span>
                <span className="text-xs font-mono text-amber-400">{trendDirection < 40 ? 'BEARISH' : trendDirection > 60 ? 'BULLISH' : 'RANGING'}</span>
              </div>
              <input type="range" min={0} max={100} value={trendDirection} onChange={e => setTrendDirection(+e.target.value)} className="w-full accent-amber-500" />
              <p className="text-[10px] text-gray-500 mt-1">Left = price falling. Right = price rising.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-extrabold ${diag.colour}`}>{diag.label}</span>
                <span className={`text-2xl font-black ${diag.colour}`}>{diag.grade}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: diag.desc }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — Smart Money Footprints */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Reading the Footprints</p>
          <h2 className="text-2xl font-extrabold mb-2">Smart Money Volume Signatures</h2>
          <p className="text-gray-400 text-sm mb-5">Institutions can&apos;t hide their size. These four patterns reveal their activity.</p>
          <div className="space-y-3">
            {[
              { title: 'Accumulation', emoji: '🟢', desc: 'Price is flat or slightly declining, but volume is quietly increasing. OBV begins to rise even as price falls. This is smart money buying before the crowd notices. Often seen at the END of downtrends at key demand zones.' },
              { title: 'Distribution', emoji: '🔴', desc: 'Price is flat or slightly rising at highs, but volume characteristics shift. OBV begins to fall even as price holds. This is smart money selling into retail enthusiasm. Often seen at the END of uptrends at key supply zones.' },
              { title: 'Climax / Capitulation', emoji: '💥', desc: 'A massive volume spike (2&ndash;3&times; average) on an extreme candle, usually at the very end of a trend. Everyone who wanted to sell has sold (or buy has bought). The fuel is spent. Often marks the exact turning point.' },
              { title: 'Dry-Up Before Breakout', emoji: '🔕', desc: 'Volume contracts dramatically during a consolidation. This &ldquo;coiling&rdquo; effect means participants are waiting. When the breakout finally occurs, the stored energy releases. The tighter the contraction, the more explosive the breakout tends to be.' }
            ].map((sig, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleCard(`sig-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{sig.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{sig.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCards[`sig-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedCards[`sig-${i}`] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4"><p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: sig.desc }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 — Common Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mistakes to Avoid</p>
          <h2 className="text-2xl font-extrabold mb-2">Common Volume Mistakes</h2>
          <p className="text-gray-400 text-sm mb-5">Volume seems simple. These 4 traps catch most traders.</p>
          <div className="space-y-3">
            {volumeMyths.map((m, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => toggleMyth(`myth-${i}`)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: m.myth }} />
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedMyths[`myth-${i}`] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedMyths[`myth-${i}`] && (
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
          <h2 className="text-2xl font-extrabold mb-2">Volume Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-5">Memorise these 6 volume patterns and their meanings.</p>
          <div className="glass-card p-4 rounded-2xl space-y-2">
            {[
              { label: 'Breakout + High Volume', action: 'TRUST', colour: 'text-green-400', desc: 'Real breakout with conviction. Enter on first pullback to the breakout level.' },
              { label: 'Breakout + Low Volume', action: 'SUSPECT', colour: 'text-red-400', desc: 'Likely a fakeout. Wait for retest with volume confirmation or skip entirely.' },
              { label: 'Rally + Declining Volume', action: 'WARNING', colour: 'text-amber-400', desc: 'Volume divergence. The rally is losing participation. Tighten stops or prepare to exit.' },
              { label: 'Pullback + Low Volume', action: 'HEALTHY', colour: 'text-green-400', desc: 'Sellers aren&apos;t aggressive. Trend is likely to resume. Look for bounce entries.' },
              { label: 'Volume Spike at Key Level', action: 'CLIMAX', colour: 'text-amber-400', desc: 'Potential exhaustion point. If at end of extended move = reversal. If at breakout after range = fuel.' },
              { label: 'OBV Divergence', action: 'ALERT', colour: 'text-red-400', desc: 'Smart money and price disagree. Don&apos;t fight the divergence — reduce size or prepare for reversal.' }
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
          <h2 className="text-2xl font-extrabold mb-2">Volume Intelligence Game</h2>
          <p className="text-gray-400 text-sm mb-6">5 real scenarios. Read the volume, make the call.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read volume like a professional. The crowd can&apos;t hide from you.' : gameScore >= 3 ? 'Solid foundation. Review OBV divergence and breakout volume for the edge cases.' : 'Volume takes practice. Re-read the tools section and try again.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">📊</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 5: Volume Intelligence</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Volume Detective &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L5.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
