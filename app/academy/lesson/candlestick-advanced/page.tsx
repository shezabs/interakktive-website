// app/academy/lesson/candlestick-advanced/page.tsx
// ATLAS Academy — Lesson 2.8: Advanced Candlestick Patterns [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
// CANDLE DATA TYPES
// ============================================================
interface Candle {
  o: number; h: number; l: number; c: number;
}

function makeCandle(o: number, c: number, wickUp: number, wickDown: number): Candle {
  const high = Math.max(o, c) + wickUp;
  const low = Math.min(o, c) - wickDown;
  return { o, h: high, l: low, c };
}

// ============================================================
// PATTERN DEFINITIONS — hand-crafted candles for each pattern
// ============================================================
const patterns: Record<string, { name: string; type: 'bullish' | 'bearish'; candles: Candle[]; context: Candle[]; description: string; layman: string; howToSpot: string; psychology: string }> = {
  bullish_engulfing: {
    name: 'Bullish Engulfing',
    type: 'bullish',
    context: [makeCandle(108,106,1,1), makeCandle(106,103,1,1.5), makeCandle(103,100,0.5,1)],
    candles: [makeCandle(100,97,0.5,1), makeCandle(96,102,1,0.5)],
    description: 'A small bearish candle followed by a large bullish candle that completely "swallows" the previous candle\'s body.',
    layman: 'Imagine a small bully pushing someone. Then a much BIGGER person steps in and pushes the bully all the way back and further. The tide has turned. Sellers tried, but buyers showed up with overwhelming force.',
    howToSpot: '1) Downtrend must be present before the pattern. 2) First candle is bearish (red). 3) Second candle is bullish (green) and its body completely covers the first candle\'s body — opens below the first close and closes above the first open.',
    psychology: 'Sellers were in control (first candle). Then buyers stepped in with such force that they not only erased the losses but pushed price higher than where sellers started. This shift in power often marks the start of a reversal.',
  },
  bearish_engulfing: {
    name: 'Bearish Engulfing',
    type: 'bearish',
    context: [makeCandle(92,94,1,1), makeCandle(94,97,1.5,1), makeCandle(97,100,1,0.5)],
    candles: [makeCandle(100,103,1,0.5), makeCandle(104,98,0.5,1)],
    description: 'A small bullish candle followed by a large bearish candle that completely engulfs the previous body.',
    layman: 'The home team scores a small goal. But then the away team comes back and scores THREE. The momentum has completely flipped. Buyers celebrated too early — sellers just took over.',
    howToSpot: '1) Uptrend before the pattern. 2) First candle is bullish (green). 3) Second candle is bearish (red) and its body engulfs the first — opens above the first close and closes below the first open.',
    psychology: 'Buyers pushed up weakly (small green candle). Then sellers overwhelmed them with massive selling pressure, closing well below where buyers started. Institutional profit-taking has begun.',
  },
  morning_star: {
    name: 'Morning Star',
    type: 'bullish',
    context: [makeCandle(108,105,1,1), makeCandle(105,102,0.5,1)],
    candles: [makeCandle(102,98,0.5,1.5), makeCandle(97.5,97.8,0.8,0.8), makeCandle(98,103,1,0.3)],
    description: 'Three-candle reversal: a bearish candle, a small-bodied "star" candle (indecision), then a strong bullish candle.',
    layman: 'Think of it as a story in three acts. Act 1: The villain is winning (sellers push down). Act 2: A pause — nobody knows what happens next (the tiny star candle). Act 3: The hero arrives and saves the day (big green candle). The darkest hour is just before dawn — that tiny star IS the dawn.',
    howToSpot: '1) Downtrend before. 2) First candle: large bearish body. 3) Second candle: small body (can be bullish or bearish) that gaps down from the first. 4) Third candle: large bullish body that closes above the midpoint of the first candle.',
    psychology: 'Day 1: Strong selling continues. Day 2: Sellers try but can\'t push further — indecision sets in (the star). Day 3: Buyers see the exhaustion and attack. The three-day shift from fear to uncertainty to hope is powerful.',
  },
  evening_star: {
    name: 'Evening Star',
    type: 'bearish',
    context: [makeCandle(92,95,1,1), makeCandle(95,98,1,0.5)],
    candles: [makeCandle(98,102,1,0.5), makeCandle(102.5,102.2,0.8,0.8), makeCandle(102,97,0.3,1)],
    description: 'The bearish mirror of the Morning Star. Three candles: bullish, small star, then strong bearish.',
    layman: 'Same three-act story but in reverse. Act 1: Heroes winning (buyers push up). Act 2: An eerie silence (the tiny star — nobody can push further). Act 3: The villains return with force (massive red candle). The sun just set on this uptrend.',
    howToSpot: '1) Uptrend before. 2) First candle: large bullish body. 3) Second candle: small body that gaps up. 4) Third candle: large bearish body closing below the midpoint of the first candle.',
    psychology: 'Day 1: Buyers push hard. Day 2: Euphoria peaks but nobody can push higher — exhaustion. Day 3: Sellers see the weakness and dump. Three days from greed to uncertainty to fear.',
  },
  three_white_soldiers: {
    name: 'Three White Soldiers',
    type: 'bullish',
    context: [makeCandle(100,97,0.5,1), makeCandle(97,95,1,1.5)],
    candles: [makeCandle(95,98,0.5,0.3), makeCandle(98,101,0.5,0.3), makeCandle(101,104.5,0.5,0.3)],
    description: 'Three consecutive bullish candles, each opening within the previous body and closing higher. Small or no upper wicks.',
    layman: 'Three soldiers marching in formation — each one stepping higher than the last. No hesitation, no retreat. When you see three strong green candles in a row, each bigger or equal, that\'s an army advancing. You don\'t stand in front of an army.',
    howToSpot: '1) Each candle opens within or near the previous candle\'s body. 2) Each candle closes higher than the last. 3) Small upper wicks (buyers held control all day, every day). 4) Appears after a downtrend or consolidation.',
    psychology: 'Three consecutive days of buyer dominance. Each day, sellers try to push back at the open but fail by the close. After three days of this, sellers give up and the trend has reversed.',
  },
  three_black_crows: {
    name: 'Three Black Crows',
    type: 'bearish',
    context: [makeCandle(95,98,1,0.5), makeCandle(98,101,0.5,1)],
    candles: [makeCandle(101,98,0.3,0.5), makeCandle(98,95,0.3,0.5), makeCandle(95,91.5,0.3,0.5)],
    description: 'Three consecutive bearish candles, each opening within the previous body and closing lower.',
    layman: 'Three black crows sitting on a fence — an omen in folklore. Three strong red candles marching downward. Each day opens with a little hope, but sellers crush it by close. Three days of this and it\'s clear: the sellers are in total command.',
    howToSpot: '1) Each candle opens within the previous body. 2) Each candle closes lower. 3) Small lower wicks (sellers held control). 4) Appears after an uptrend.',
    psychology: 'Mirror of Three White Soldiers. Three days of relentless selling where each attempt by buyers to recover at the open gets overwhelmed by close. Institutional distribution in progress.',
  },
  harami: {
    name: 'Bullish Harami',
    type: 'bullish',
    context: [makeCandle(106,104,1,1), makeCandle(104,101,0.5,1)],
    candles: [makeCandle(101,96,0.5,1.5), makeCandle(97,99,0.5,0.3)],
    description: 'A large bearish candle followed by a smaller bullish candle that fits entirely within the first candle\'s body. "Harami" means "pregnant" in Japanese.',
    layman: 'A big angry bear storms into the room (large red candle). Then a small, calm voice says "actually, I think we\'re okay" (tiny green candle inside the bear). The small candle is "pregnant" inside the big one — something new is growing. The selling rage has exhausted itself.',
    howToSpot: '1) Downtrend. 2) Large bearish candle. 3) Next candle is small and bullish, entirely contained within the first candle\'s body — both the open and close are between the previous open and close.',
    psychology: 'After aggressive selling, the next day has a tiny range — sellers couldn\'t continue AND buyers showed up (small green). The containment signals the selling momentum has stalled.',
  },
  tweezer_bottom: {
    name: 'Tweezer Bottom',
    type: 'bullish',
    context: [makeCandle(106,103,1,1), makeCandle(103,100,0.5,1)],
    candles: [makeCandle(100,97,0.5,1.5), makeCandle(96.5,99.5,0.5,1)],
    description: 'Two candles with matching (or near-matching) lows. First bearish, second bullish. The identical lows create a "floor" the market refuses to break.',
    layman: 'Two people drop a ball from different heights — but the ball bounces off the EXACT same floor both times. If the floor held twice, it\'s solid. The market tried to go lower twice and hit the same wall. That wall is real support.',
    howToSpot: '1) Downtrend. 2) Two consecutive candles with lows within a few ticks of each other. 3) First candle bearish, second bullish (the reversal). 4) The matched lows create a clear double-bottom on a micro scale.',
    psychology: 'Day 1: Sellers push down and find a floor. Day 2: Sellers try again — exact same floor. Buyers defend this level twice. When the same level holds twice in a row, institutional orders are stacked there.',
  },
};

const patternKeys = Object.keys(patterns);

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
// STORYTELLING ANIMATION (layman analogy)
// ============================================================
function StorytellingAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const phase = (f % 300) / 300;
    const act = phase < 0.33 ? 1 : phase < 0.66 ? 2 : 3;

    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const panelW = (w - 40) / 3;
    const panelH = h - 60;

    for (let i = 0; i < 3; i++) {
      const px = 10 + i * (panelW + 10);
      const isActive = i + 1 === act;
      const alpha = isActive ? 1 : 0.25;

      ctx.fillStyle = isActive
        ? i === 0 ? 'rgba(239,68,68,0.08)' : i === 1 ? 'rgba(245,158,11,0.08)' : 'rgba(14,165,233,0.08)'
        : 'rgba(30,30,40,0.3)';
      ctx.strokeStyle = isActive
        ? i === 0 ? 'rgba(239,68,68,0.3)' : i === 1 ? 'rgba(245,158,11,0.3)' : 'rgba(14,165,233,0.3)'
        : 'rgba(50,50,60,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rr = 8, rx = px, ry = 30, rw = panelW, rh = panelH;
      ctx.moveTo(rx + rr, ry);
      ctx.lineTo(rx + rw - rr, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
      ctx.lineTo(rx + rw, ry + rh - rr);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
      ctx.lineTo(rx + rr, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
      ctx.lineTo(rx, ry + rr);
      ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#0ea5e9';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`ACT ${i + 1}`, px + panelW / 2, 22);

      const cx = px + panelW / 2;
      const candleW = Math.min(panelW * 0.35, 28);
      const baseY = 50;

      if (i === 0) {
        const bodyH = panelH * 0.5;
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.fillRect(cx - candleW / 2, baseY + 15, candleW, bodyH);
        ctx.fillRect(cx - 1, baseY + 5, 2, 10);
        ctx.fillRect(cx - 1, baseY + 15 + bodyH, 2, 15);
        ctx.fillStyle = `rgba(239,68,68,${alpha * 0.8})`;
        ctx.font = '10px system-ui';
        ctx.fillText('Sellers', cx, baseY + 15 + bodyH + 35);
        ctx.fillText('dominate', cx, baseY + 15 + bodyH + 48);
      } else if (i === 1) {
        const bodyH = panelH * 0.08;
        const topY = baseY + panelH * 0.35;
        ctx.fillStyle = `rgba(245,158,11,${alpha})`;
        ctx.fillRect(cx - candleW * 0.3, topY, candleW * 0.6, bodyH);
        ctx.fillRect(cx - 1, topY - panelH * 0.15, 2, panelH * 0.15);
        ctx.fillRect(cx - 1, topY + bodyH, 2, panelH * 0.15);
        ctx.fillStyle = `rgba(245,158,11,${alpha * 0.8})`;
        ctx.font = '10px system-ui';
        ctx.fillText('Who will', cx, topY + bodyH + panelH * 0.2 + 15);
        ctx.fillText('win?', cx, topY + bodyH + panelH * 0.2 + 28);
        if (isActive) {
          ctx.fillStyle = 'rgba(245,158,11,0.15)';
          ctx.font = '20px serif';
          ctx.fillText('?', cx, topY - panelH * 0.15 - 8);
        }
      } else {
        const bodyH = panelH * 0.5;
        const topY = baseY + 15 + panelH * 0.5 - bodyH;
        ctx.fillStyle = `rgba(14,165,233,${alpha})`;
        ctx.fillRect(cx - candleW / 2, topY, candleW, bodyH);
        ctx.fillRect(cx - 1, topY - 15, 2, 15);
        ctx.fillRect(cx - 1, topY + bodyH, 2, 10);
        ctx.fillStyle = `rgba(14,165,233,${alpha * 0.8})`;
        ctx.font = '10px system-ui';
        ctx.fillText('Buyers', cx, topY + bodyH + 28);
        ctx.fillText('take over', cx, topY + bodyH + 41);
      }
      ctx.globalAlpha = 1;
    }
  }, []);

  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// PATTERN CANVAS
// ============================================================
function PatternCanvas({ pattern, step, height = 260 }: { pattern: string; step: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const p = patterns[pattern];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !p) return;
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

    const allCandles = [...p.context, ...p.candles];
    const visible = [...p.context, ...p.candles.slice(0, step)];
    if (visible.length === 0) return;

    const allPrices = allCandles.flatMap(c => [c.h, c.l]);
    const pMin = Math.min(...allPrices) - 1;
    const pMax = Math.max(...allPrices) + 1;
    const pRange = pMax - pMin;

    const totalSlots = allCandles.length;
    const candleW = Math.min((w - 60) / totalSlots * 0.65, 32);
    const gap = (w - 60) / totalSlots;

    const py = (price: number) => 20 + (h - 40) * (1 - (price - pMin) / pRange);

    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      const cx = 30 + i * gap + gap / 2;
      const isPattern = i >= p.context.length;
      const isLatest = i === visible.length - 1 && isPattern;
      const isBull = c.c > c.o;

      ctx.strokeStyle = isPattern ? (isBull ? '#0ea5e9' : '#ef4444') : 'rgba(100,116,139,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, py(c.h));
      ctx.lineTo(cx, py(c.l));
      ctx.stroke();

      const bodyTop = py(Math.max(c.o, c.c));
      const bodyBot = py(Math.min(c.o, c.c));
      const bodyH = Math.max(bodyBot - bodyTop, 2);

      if (isPattern) {
        ctx.fillStyle = isBull ? 'rgba(14,165,233,0.85)' : 'rgba(239,68,68,0.85)';
        if (isLatest) { ctx.shadowColor = isBull ? '#0ea5e9' : '#ef4444'; ctx.shadowBlur = 12; }
      } else {
        ctx.fillStyle = isBull ? 'rgba(100,116,139,0.4)' : 'rgba(100,116,139,0.5)';
      }
      ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH);
      ctx.shadowBlur = 0;

      if (isPattern) {
        const candleIdx = i - p.context.length + 1;
        ctx.fillStyle = 'rgba(245,158,11,0.9)';
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${candleIdx}`, cx, py(c.l) + 16);
      }
    }

    const sepX = 30 + p.context.length * gap;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sepX, 10);
    ctx.lineTo(sepX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(100,116,139,0.4)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Context', 30 + (p.context.length * gap) / 2, h - 5);
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.fillText('Pattern', sepX + (p.candles.length * gap) / 2, h - 5);
  }, [pattern, step, p, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME CHART
// ============================================================
function GameChart({ scenario, height = 260 }: { scenario: { candles: Candle[]; patternStart: number; patternEnd: number }; height?: number }) {
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

    const allPrices = scenario.candles.flatMap(c => [c.h, c.l]);
    const pMin = Math.min(...allPrices) - 0.5;
    const pMax = Math.max(...allPrices) + 0.5;
    const pRange = pMax - pMin;

    const len = scenario.candles.length;
    const gap = (w - 20) / len;
    const candleW = Math.min(gap * 0.65, 10);
    const py = (price: number) => 15 + (h - 30) * (1 - (price - pMin) / pRange);

    for (let i = 0; i < len; i++) {
      const c = scenario.candles[i];
      const cx = 10 + i * gap + gap / 2;
      const isBull = c.c > c.o;
      const inPattern = i >= scenario.patternStart && i <= scenario.patternEnd;

      ctx.strokeStyle = inPattern ? (isBull ? '#0ea5e9' : '#ef4444') : (isBull ? 'rgba(14,165,233,0.4)' : 'rgba(239,68,68,0.4)');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, py(c.h));
      ctx.lineTo(cx, py(c.l));
      ctx.stroke();

      const bodyTop = py(Math.max(c.o, c.c));
      const bodyBot = py(Math.min(c.o, c.c));
      const bodyH = Math.max(bodyBot - bodyTop, 1);

      ctx.fillStyle = inPattern ? (isBull ? 'rgba(14,165,233,0.85)' : 'rgba(239,68,68,0.85)') : (isBull ? 'rgba(14,165,233,0.3)' : 'rgba(239,68,68,0.3)');
      ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH);
    }

    const pxStart = 10 + scenario.patternStart * gap;
    const pxEnd = 10 + (scenario.patternEnd + 1) * gap;
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(pxStart, 5, pxEnd - pxStart, h - 10);
    ctx.setLineDash([]);
  }, [scenario, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME SCENARIO GENERATOR
// ============================================================
function generateGameScenario(patternKey: string, seed: number): { candles: Candle[]; patternStart: number; patternEnd: number } {
  const rand = seededRandom(seed);
  const p = patterns[patternKey];
  const result: Candle[] = [];

  const preCount = 15 + Math.floor(rand() * 6);
  let price = 100;
  const isBullish = p.type === 'bullish';

  for (let i = 0; i < preCount; i++) {
    const trend = isBullish ? -0.3 : 0.3;
    const noise = (rand() - 0.5) * 2;
    const move = trend + noise;
    const o = price;
    const c = price + move;
    result.push(makeCandle(o, c, rand() * 1.5, rand() * 1.5));
    price = c;
  }

  const patternStart = result.length;
  const basePrice = p.candles[0].o;
  const offset = price - basePrice;

  for (const c of p.candles) {
    result.push({ o: c.o + offset, h: c.h + offset, l: c.l + offset, c: c.c + offset });
    price = c.c + offset;
  }
  const patternEnd = result.length - 1;

  const postCount = 8 + Math.floor(rand() * 5);
  for (let i = 0; i < postCount; i++) {
    const trend = isBullish ? 0.4 : -0.4;
    const noise = (rand() - 0.5) * 2;
    const o = price;
    const c = price + trend + noise;
    result.push(makeCandle(o, c, rand() * 1, rand() * 1));
    price = c;
  }

  return { candles: result, patternStart, patternEnd };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CandlestickAdvancedLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const [buildPattern, setBuildPattern] = useState('bullish_engulfing');
  const [buildStep, setBuildStep] = useState(0);

  // Game
  const gamePatterns = useMemo(() => ['bullish_engulfing', 'morning_star', 'three_black_crows', 'tweezer_bottom', 'evening_star'], []);
  const gameScenarios = useMemo(() => gamePatterns.map((pk, i) => ({
    ...generateGameScenario(pk, 500 + i * 41),
    correctAnswer: i,
    patternKey: pk,
  })), [gamePatterns]);

  const gameOptions = useMemo(() => ['Bullish Engulfing', 'Morning Star', 'Three Black Crows', 'Tweezer Bottom', 'Evening Star'], []);

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers];
    na[gameRound] = choice;
    setGameAnswers(na);
    if (choice === gameRound) setGameScore(s => s + 1);
    setGameShowNext(true);
  };

  const nextRound = () => {
    if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); }
    else setGameComplete(true);
  };

  const resetGame = () => {
    setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false);
  };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'A small red candle followed by a large green candle that completely covers the red body. What pattern is this?', opts: ['Morning Star', 'Bullish Engulfing', 'Three White Soldiers', 'Bullish Harami'], a: 1, explain: 'Bullish Engulfing — the green candle\'s body completely "swallows" the red candle\'s body. The bigger the engulfing candle, the stronger the signal.' },
    { q: 'How many candles make up a Morning Star pattern?', opts: ['One', 'Two', 'Three', 'Four'], a: 2, explain: 'Three — a large bearish candle, a small indecision candle (the "star"), and a large bullish candle. It tells a three-act story of sellers losing control.' },
    { q: 'Three consecutive red candles, each closing lower than the last, are called:', opts: ['Evening Star', 'Bearish Engulfing', 'Three Black Crows', 'Dark Cloud Cover'], a: 2, explain: 'Three Black Crows — three soldiers of doom marching downward. Each opens within the previous body and closes lower. A powerful bearish reversal signal.' },
    { q: 'What does "Harami" mean in Japanese?', opts: ['Hammer', 'Pregnant', 'Star', 'Shadow'], a: 1, explain: 'Pregnant — the second (smaller) candle is contained entirely within the first (larger) candle\'s body, like a baby inside a mother. Something new is being born.' },
    { q: 'A Tweezer Bottom is identified by:', opts: ['Two candles with matching highs', 'Two candles with matching lows after a downtrend', 'Three candles in a row', 'A gap between two candles'], a: 1, explain: 'Two candles with matching (or near-matching) lows after a downtrend. The market tested the same floor twice and it held — that\'s confirmed support.' },
    { q: 'What makes a candlestick pattern MORE reliable?', opts: ['It appears on a 1-minute chart', 'It appears after a clear prior trend and has volume confirmation', 'The candles are very small', 'It appears during low-volume hours'], a: 1, explain: 'Patterns need context: a prior trend (gives them something to reverse) and volume (proves conviction). A Morning Star on a daily chart with high volume is far more trustworthy than one on a 1-minute chart.' },
    { q: 'An Evening Star pattern signals:', opts: ['A continuation of the uptrend', 'A potential reversal from bullish to bearish', 'Increased volatility', 'Nothing meaningful'], a: 1, explain: 'Evening Star is a bearish reversal pattern. Greed peaks at the star candle, then sellers take over in the third candle. The sun has set on the uptrend.' },
  ], []);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(7).fill(null));
  const quizDone = quizAnswers.every(a => a !== null);
  const score = quizDone ? Math.round((quizAnswers.filter((a, i) => a === quizQuestions[i].a).length / quizQuestions.length) * 100) : 0;
  const certUnlocked = quizDone && score >= 66;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentBuild = patterns[buildPattern];

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 2 · Lesson 8</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Advanced Candlestick<br />Patterns</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Multi-candle patterns that institutions watch. Learn to read the story candles tell together.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">📖 Think of candles as words in a sentence.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In Lesson 1.3, you learned to read individual candles — single words. But a word by itself (&quot;run&quot;) can mean many things. It&apos;s only when you put words TOGETHER (&quot;run for your life&quot; vs &quot;run a business&quot;) that the meaning becomes clear.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Multi-candle patterns are the sentences of trading.</strong> A single red candle means sellers won that day. But a red candle followed by a HUGE green candle that swallows it? That&apos;s a complete story: &quot;sellers tried, buyers overpowered them.&quot;</p>
          </div>
          <StorytellingAnimation />
          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">Gold drops $25 over three days. Then: Day 4 shows a small red candle. Day 5 opens BELOW Day 4&apos;s close — but then <strong className="text-primary-400">rallies all day and closes $30 above Day 4&apos;s open</strong>. That&apos;s a Bullish Engulfing. Traders who read this bought at $1,920 and rode Gold to $1,965. <em className="text-amber-400">Pattern readers saw the reversal BEFORE it happened.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — PATTERN BUILDER */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — Build the Pattern</p>
          <h2 className="text-2xl font-extrabold mb-4">Watch Patterns Form Candle by Candle</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Select a pattern, then step through it. Grey candles are the prior trend (context). Coloured candles are the pattern forming — watch each one appear with its number label.</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {['bullish_engulfing', 'bearish_engulfing', 'morning_star', 'evening_star', 'three_white_soldiers', 'three_black_crows'].map(pk => (
              <button key={pk} onClick={() => { setBuildPattern(pk); setBuildStep(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${buildPattern === pk ? 'bg-amber-500 text-black' : 'glass text-gray-400 hover:text-white'}`}>
                {patterns[pk].name}
              </button>
            ))}
          </div>

          <PatternCanvas pattern={buildPattern} step={buildStep} />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">{buildStep === 0 ? 'Context only' : `Pattern candle ${buildStep} of ${currentBuild.candles.length}`}</span>
            <div className="flex gap-2">
              <button onClick={() => setBuildStep(Math.max(0, buildStep - 1))} disabled={buildStep === 0} className="px-4 py-2 rounded-xl glass text-xs text-gray-400 hover:text-white disabled:opacity-30 transition">← Back</button>
              <button onClick={() => setBuildStep(Math.min(currentBuild.candles.length, buildStep + 1))} disabled={buildStep >= currentBuild.candles.length} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-xs text-white font-bold disabled:opacity-30 transition active:scale-95">Next →</button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {buildStep > 0 && (
              <motion.div key={buildStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {buildStep === currentBuild.candles.length ? (
                    <>💡 <strong className="text-amber-400">Pattern complete: {currentBuild.name}.</strong> {currentBuild.description}</>
                  ) : (
                    <>🕯️ <strong className="text-primary-400">Candle {buildStep}:</strong> {
                      currentBuild.candles[buildStep - 1].c > currentBuild.candles[buildStep - 1].o
                        ? `Bullish — buyers pushed price from ${currentBuild.candles[buildStep - 1].o.toFixed(1)} up to ${currentBuild.candles[buildStep - 1].c.toFixed(1)}.`
                        : currentBuild.candles[buildStep - 1].c < currentBuild.candles[buildStep - 1].o
                          ? `Bearish — sellers pushed price from ${currentBuild.candles[buildStep - 1].o.toFixed(1)} down to ${currentBuild.candles[buildStep - 1].c.toFixed(1)}.`
                          : `Doji — price opened at ${currentBuild.candles[buildStep - 1].o.toFixed(1)} and closed nearly the same. Neither side won.`
                    }</>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* SECTION 02 — ENCYCLOPEDIA */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — The Pattern Encyclopedia</p>
          <h2 className="text-2xl font-extrabold mb-3">8 Patterns Every Trader Must Know</h2>
          <p className="text-sm text-gray-400 mb-6">Tap any pattern to see the full breakdown with chart, layman explanation, how to spot it, and the psychology behind it.</p>

          <div className="space-y-3">
            {patternKeys.map(pk => {
              const p = patterns[pk];
              const isOpen = activePattern === pk;
              return (
                <motion.div key={pk} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActivePattern(isOpen ? null : pk)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-8 rounded-full ${p.type === 'bullish' ? 'bg-primary-400' : 'bg-red-400'}`} />
                      <div>
                        <h3 className="font-bold text-white text-sm">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.type === 'bullish' ? '↑ Bullish reversal' : '↓ Bearish reversal'} · {p.candles.length} candles</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-5 space-y-4">
                          <PatternCanvas pattern={pk} step={p.candles.length} height={200} />
                          <div><p className="text-xs font-bold text-amber-400 mb-1">📝 WHAT IT IS</p><p className="text-sm text-gray-400 leading-relaxed">{p.description}</p></div>
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">In plain English:</strong> {p.layman}</p></div>
                          <div><p className="text-xs font-bold text-amber-400 mb-1">🔍 HOW TO SPOT IT</p><p className="text-sm text-gray-400 leading-relaxed">{p.howToSpot}</p></div>
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-sm text-gray-300 leading-relaxed">🧠 <strong className="text-amber-400">Psychology:</strong> {p.psychology}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — RELIABILITY */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — What Makes Patterns Reliable</p>
          <h2 className="text-2xl font-extrabold mb-6">Not All Patterns Are Equal</h2>
          <div className="space-y-4">
            {[
              { title: 'Prior Trend Matters', desc: 'A Bullish Engulfing after a clear downtrend is powerful. The same pattern in the middle of nowhere means nothing. Reversal patterns need something TO reverse.', icon: '📉', tip: 'Like a plot twist in a movie — it only works if there\'s a story building up to it.' },
              { title: 'Volume Confirms', desc: 'A Morning Star with rising volume on the third candle is much more reliable than one with declining volume. Volume is the crowd backing the pattern.', icon: '📊', tip: 'From Lesson 2.7: if the crowd isn\'t cheering for this pattern, don\'t trust it.' },
              { title: 'Higher Timeframes Win', desc: 'A Bearish Engulfing on a daily chart carries far more weight than on a 5-minute chart. Daily candles = thousands of traders\' decisions. 5-minute = mostly noise.', icon: '🕐', tip: 'A crack visible from a satellite (daily) is far more serious than one visible under a microscope (1-min).' },
              { title: 'Confluence Is King', desc: 'A Three White Soldiers at a major support level, with rising volume, on a daily chart = three layers of confirmation. Don\'t trade patterns in isolation.', icon: '🎯', tip: 'Patterns are ONE piece of evidence. Combine with S/R, volume, and indicators for the full picture.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl glass-card">
                <div className="flex items-start gap-3 mb-2"><span className="text-2xl">{item.icon}</span><h3 className="font-bold text-white">{item.title}</h3></div>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{item.desc}</p>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"><p className="text-xs text-gray-300 leading-relaxed">💡 {item.tip}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Spot the Pattern</p>
          <h2 className="text-2xl font-extrabold mb-2">Name That Pattern</h2>
          <p className="text-sm text-gray-400 mb-6">5 rounds. The pattern candles are highlighted with an amber dashed border. Identify which pattern it is.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <GameChart scenario={gameScenarios[gameRound]} />

              <div className="mt-4 space-y-2">
                {gameOptions.map((opt, oi) => {
                  const answered = gameAnswers[gameRound] !== null;
                  const isCorrect = oi === gameRound;
                  const isChosen = gameAnswers[gameRound] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) {
                    if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400';
                    else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400';
                    else cls = 'glass text-gray-600';
                  }
                  return (
                    <button key={oi} onClick={() => answerGame(oi)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
                      {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {gameAnswers[gameRound] !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">{patterns[gamePatterns[gameRound]].name}:</strong> {patterns[gamePatterns[gameRound]].layman}</p>
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
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 Perfect pattern reader!' : gameScore >= 3 ? 'You\'re getting the eye for patterns.' : 'Review the encyclopedia and try again.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 05 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Pattern Mastery Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 Perfect — you read patterns like a pro.' : score >= 66 ? 'Solid — you know your candle formations.' : 'Review the pattern encyclopedia and try again.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl shadow-lg shadow-primary-500/30">🕯️</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 2.8: Advanced Candlestick Patterns</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-primary-400 via-accent-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Pattern Reader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L2.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 2.9 — Chart Patterns</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
