// app/academy/lesson/order-blocks/page.tsx
// ATLAS Academy — Lesson 3.5: Order Blocks [PRO]
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, ChevronDown } from 'lucide-react';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
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
// CRIME SCENE ANIMATION — footprints left behind
// ============================================================
function CrimeSceneAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const phase = (f % 360) / 360;
    const midX = w / 2;

    // Crime scene tape
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    const tapeY = 20;
    const tapeText = '/// ORDER BLOCK = CRIME SCENE /// ORDER BLOCK = CRIME SCENE /// ORDER BLOCK = CRIME SCENE ///';
    ctx.fillText(tapeText.substring(0, Math.floor(phase * tapeText.length * 2) % tapeText.length), midX, tapeY);

    // Left side: "Before" — calm market, candle being placed
    const leftW = midX - 10;
    if (phase < 0.4) {
      ctx.globalAlpha = Math.min(phase * 4, 1);

      // Quiet candles
      const candleX = [40, 70, 100, 130];
      const candleH = [30, 25, 35, 28];
      candleX.forEach((cx, i) => {
        if (cx > leftW) return;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(14,165,233,0.5)' : 'rgba(239,68,68,0.5)';
        ctx.fillRect(cx - 8, h * 0.4, 16, candleH[i]);
        ctx.fillRect(cx - 1, h * 0.4 - 8, 2, 8);
        ctx.fillRect(cx - 1, h * 0.4 + candleH[i], 2, 8);
      });

      // The ORDER BLOCK candle — last bearish before the move
      ctx.fillStyle = 'rgba(239,68,68,0.8)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.fillRect(155 - 10, h * 0.35, 20, 40);
      ctx.strokeRect(155 - 12, h * 0.33, 24, 44);
      ctx.setLineDash([]);
      ctx.fillRect(155 - 1, h * 0.28, 2, 7);
      ctx.fillRect(155 - 1, h * 0.35 + 40, 2, 7);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ORDER BLOCK', 155, h * 0.28 - 5);
      ctx.font = '7px system-ui';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Last bearish candle', 155, h * 0.86);
      ctx.fillText('before the crime', 155, h * 0.92);

      ctx.globalAlpha = 1;
    }

    // Right side: "After" — massive impulsive move (the "crime")
    if (phase > 0.3) {
      const rAlpha = Math.min((phase - 0.3) * 3, 1);
      ctx.globalAlpha = rAlpha;

      // Big green candles blasting upward
      const startX = midX + 20;
      const bigCandles = [
        { x: startX, h: 60, y: h * 0.3 },
        { x: startX + 35, h: 70, y: h * 0.2 },
        { x: startX + 70, h: 55, y: h * 0.15 },
      ];

      bigCandles.forEach(c => {
        ctx.fillStyle = 'rgba(14,165,233,0.7)';
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 8;
        ctx.fillRect(c.x - 10, c.y, 20, c.h);
        ctx.shadowBlur = 0;
        ctx.fillRect(c.x - 1, c.y - 10, 2, 10);
      });

      ctx.fillStyle = '#0ea5e9';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('IMPULSIVE MOVE', startX + 45, h * 0.12);
      ctx.font = '8px system-ui';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('The "crime" — institutional', startX + 45, h * 0.86);
      ctx.fillText('buying with massive force', startX + 45, h * 0.92);

      // Arrow from OB to move
      if (phase > 0.6) {
        ctx.strokeStyle = 'rgba(245,158,11,0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(175, h * 0.45);
        ctx.lineTo(startX - 5, h * 0.45);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.globalAlpha = 1;
    }

    // Bottom label
    if (phase > 0.7) {
      ctx.globalAlpha = Math.min((phase - 0.7) * 4, 1);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('The OB is the last candle BEFORE the big move — the footprint left at the scene', midX, h - 8);
      ctx.globalAlpha = 1;
    }
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// MITIGATION ANIMATION — price returns to OB and bounces
// ============================================================
function MitigationAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 400) / 400;
    const midX = w / 2;

    // OB zone
    const obTop = h * 0.55;
    const obBot = h * 0.68;
    ctx.fillStyle = 'rgba(14,165,233,0.06)';
    ctx.fillRect(20, obTop, w - 40, obBot - obTop);
    ctx.strokeStyle = 'rgba(14,165,233,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(20, obTop, w - 40, obBot - obTop);
    ctx.setLineDash([]);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('BULLISH OB ZONE', 25, obTop - 4);

    // Price path: rally from OB → pullback to OB → bounce
    const pts: [number, number][] = [];

    // Phase 1: Initial rally from OB zone (0-0.25)
    if (phase >= 0) {
      const p1 = Math.min(phase / 0.25, 1);
      for (let t = 0; t <= p1; t += 0.05) {
        pts.push([30 + t * w * 0.3, obBot - 5 - t * (obBot - h * 0.15) + Math.sin(t * 10) * 5]);
      }
    }

    // Phase 2: Pullback back toward OB (0.25-0.55)
    if (phase > 0.25) {
      const p2 = Math.min((phase - 0.25) / 0.3, 1);
      const lastPt = pts[pts.length - 1] || [30 + w * 0.3, h * 0.15];
      for (let t = 0.05; t <= p2; t += 0.05) {
        pts.push([lastPt[0] + t * w * 0.3, lastPt[1] + t * (obTop + 5 - lastPt[1]) + Math.sin(t * 8) * 4]);
      }
    }

    // Phase 3: Touch OB and BOUNCE (0.55-1.0)
    if (phase > 0.55) {
      const p3 = Math.min((phase - 0.55) / 0.45, 1);
      const touchX = 30 + w * 0.6;
      for (let t = 0.05; t <= p3; t += 0.05) {
        pts.push([touchX + t * w * 0.3, obTop + 5 - t * (obTop + 5 - h * 0.08) + Math.sin(t * 8) * 4]);
      }
    }

    // Draw price line
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2.5;
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    }

    // Labels
    ctx.textAlign = 'center';
    if (phase < 0.25) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('1. Initial move away from OB', midX, h - 12);
    } else if (phase < 0.55) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('2. Price pulls back toward the OB zone...', midX, h - 12);
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('3. MITIGATION! Price touches OB and bounces', midX, h - 12);

      if (phase > 0.7) {
        // Bounce dot
        ctx.beginPath();
        ctx.arc(30 + w * 0.6, obTop + 5, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,197,94,0.5)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MITIGATION: Price Returns to the Scene of the Crime', midX, 14);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// OB CHART
// ============================================================
function OBChart({ prices, obZone, height = 260 }: {
  prices: number[];
  obZone?: { top: number; bottom: number; type: 'bullish' | 'bearish' };
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
    const w = rect.width, hh = rect.height;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, hh);

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const pRange = pMax - pMin;
    const len = prices.length;

    const px = (i: number) => 15 + (i / (len - 1)) * (w - 30);
    const py = (p: number) => 15 + (hh - 30) * (1 - (p - pMin) / pRange);

    // OB zone
    if (obZone) {
      const zt = py(obZone.top);
      const zb = py(obZone.bottom);
      const color = obZone.type === 'bullish' ? '#0ea5e9' : '#ef4444';
      ctx.fillStyle = color + '10';
      ctx.fillRect(15, zt, w - 30, zb - zt);
      ctx.strokeStyle = color + '30';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(15, zt, w - 30, zb - zt);
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(obZone.type === 'bullish' ? 'Bullish OB' : 'Bearish OB', 18, zt - 3);
    }

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();
  }, [prices, obZone, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME DATA
// ============================================================
function genOBScenario(type: string, seed: number): { prices: number[]; obZone: { top: number; bottom: number; type: 'bullish' | 'bearish' } } {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;

  if (type === 'bullish_ob') {
    for (let i = 0; i < 10; i++) { price -= 0.3 + (rand() - 0.5) * 1; p.push(price); }
    const obBottom = price - 2;
    const obTop = price;
    p.push(price - 1.5); // The OB candle (bearish)
    for (let i = 0; i < 15; i++) { price += 0.6 + (rand() - 0.35) * 1.2; p.push(price); }
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    price = obTop + 0.5; p.push(price); // Mitigate back to OB
    for (let i = 0; i < 10; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
    return { prices: p, obZone: { top: obTop, bottom: obBottom, type: 'bullish' } };
  }
  if (type === 'bearish_ob') {
    for (let i = 0; i < 10; i++) { price += 0.3 + (rand() - 0.5) * 1; p.push(price); }
    const obTop = price + 2;
    const obBottom = price;
    p.push(price + 1.5);
    for (let i = 0; i < 15; i++) { price -= 0.6 + (rand() - 0.65) * 1.2; p.push(price); }
    for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    price = obBottom - 0.5; p.push(price);
    for (let i = 0; i < 10; i++) { price -= 0.5 + (rand() - 0.65) * 1; p.push(price); }
    return { prices: p, obZone: { top: obTop, bottom: obBottom, type: 'bearish' } };
  }
  if (type === 'ob_mitigated') {
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    const obBot = price - 2; const obTop2 = price;
    p.push(price - 1);
    for (let i = 0; i < 12; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
    // Return to OB = mitigate
    for (let i = 0; i < 10; i++) { price -= 0.35 + (rand() - 0.5) * 0.8; p.push(price); }
    price = obTop2 + 0.3; p.push(price);
    for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
    return { prices: p, obZone: { top: obTop2, bottom: obBot, type: 'bullish' } };
  }
  if (type === 'ob_broken') {
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    const obBot2 = price - 2; const obTop3 = price;
    p.push(price - 1);
    for (let i = 0; i < 10; i++) { price += 0.4 + (rand() - 0.4) * 1; p.push(price); }
    // Return to OB but BREAK through
    for (let i = 0; i < 12; i++) { price -= 0.5 + (rand() - 0.45) * 1; p.push(price); }
    for (let i = 0; i < 6; i++) { price -= 0.4 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, obZone: { top: obTop3, bottom: obBot2, type: 'bullish' } };
  }
  // ob_with_fvg
  for (let i = 0; i < 8; i++) { price -= 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
  const obBot3 = price - 1.5; const obTop4 = price;
  p.push(price - 1);
  // Leave a gap (FVG)
  price += 4; p.push(price);
  for (let i = 0; i < 10; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
  for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.7; p.push(price); }
  price = obTop4 + 1; p.push(price);
  for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
  return { prices: p, obZone: { top: obTop4, bottom: obBot3, type: 'bullish' } };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OrderBlocksLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activeGrade, setActiveGrade] = useState<number | null>(null);

  // Game
  const gameTypes = useMemo(() => ['bullish_ob', 'bearish_ob', 'ob_mitigated', 'ob_broken', 'ob_with_fvg'], []);
  const gameData = useMemo(() => gameTypes.map((t, i) => genOBScenario(t, 800 + i * 47)), [gameTypes]);
  const gameOptions = ['Bullish OB (entry zone for longs)', 'Bearish OB (entry zone for shorts)', 'OB mitigated (price returned and bounced)', 'OB invalidated (price broke through)', 'OB + FVG confluence (strongest setup)'];
  const gameExplanations = [
    'The highlighted zone shows the last bearish candle before a strong impulsive move upward. That bearish candle is the bullish Order Block — where the institution placed their buy orders. When price returns here, it\'s a high-probability buy zone because the institution\'s unfilled orders are still waiting.',
    'The highlighted zone shows the last bullish candle before a strong move downward. That\'s the bearish Order Block — where institutions initiated their sell positions. When price rallies back to this zone, expect selling pressure as the institution defends their position.',
    'Price created a bullish OB, moved up, then pulled back INTO the OB zone. The bounce at the OB confirms mitigation — the zone is valid and institutional orders were waiting. This is the textbook OB trade: identify → wait for return → enter on the mitigation bounce.',
    'Price created a bullish OB, moved up, but when it returned, it didn\'t bounce — it broke THROUGH the zone and kept going down. This OB is invalidated. When an OB fails to hold, it means the institutional orders were fully filled or the thesis is wrong. Move on — this zone is dead.',
    'This OB has a Fair Value Gap (price gap) right above it from the initial impulsive move. When price returns, it hits BOTH the OB and the FVG simultaneously — double confluence. This is the highest-probability OB setup because two independent institutional footprints overlap at the same price.',
  ];

  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [gameShowNext, setGameShowNext] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const answerGame = (choice: number) => {
    if (gameAnswers[gameRound] !== null) return;
    const na = [...gameAnswers]; na[gameRound] = choice; setGameAnswers(na);
    if (choice === gameRound) setGameScore(s => s + 1);
    setGameShowNext(true);
  };
  const nextRound = () => { if (gameRound < 4) { setGameRound(r => r + 1); setGameShowNext(false); } else setGameComplete(true); };
  const resetGame = () => { setGameRound(0); setGameAnswers(Array(5).fill(null)); setGameScore(0); setGameShowNext(false); setGameComplete(false); };

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'An Order Block is:', opts: ['Any support or resistance zone', 'The last opposite-colour candle before a strong impulsive move — marking where institutions placed their orders', 'A type of limit order', 'A candlestick pattern from Level 2'], a: 1, explain: 'The OB is specifically the LAST candle of the opposite colour before the big move. Bullish OB = last RED candle before a strong green push. Bearish OB = last GREEN candle before a strong red push. It marks the exact zone where the institution committed their capital.' },
    { q: 'In layman\'s terms, an Order Block is like:', opts: ['A road sign', 'Footprints left at a crime scene — you can\'t see the criminal, but the evidence shows exactly where they were', 'A traffic light', 'A weather forecast'], a: 1, explain: 'The institution (criminal) entered the market (crime scene) and left footprints (the OB candle). You can\'t see their order book, but the candle they left behind tells you exactly where they were and what they did. When price returns, you\'re visiting the crime scene — and the evidence is still there.' },
    { q: 'A BULLISH Order Block is:', opts: ['The last bullish candle before a drop', 'The last BEARISH candle before a strong impulsive move UP', 'Any green candle', 'The highest candle on the chart'], a: 1, explain: 'Counter-intuitive but critical: the bullish OB is a BEARISH (red) candle. Why? Because that was the last moment sellers had control. The very next candle, buyers overwhelmed them. The institution\'s buy orders absorbed all the selling in that red candle — making it their entry point.' },
    { q: '"Mitigation" means:', opts: ['The OB is deleted from the chart', 'Price returns to the OB zone and the institutional orders waiting there get filled — like returning to the crime scene', 'Volume decreases', 'A new trend starts'], a: 1, explain: 'Mitigation = revisiting. The institution couldn\'t fill their entire order on the first pass, so some orders are left behind in the OB zone. When price returns (mitigates), those leftover orders get triggered — creating a bounce. A mitigated OB that bounces is one of the highest-probability trades in SMC.' },
    { q: 'An Order Block is INVALIDATED when:', opts: ['Volume decreases near it', 'Price returns to the zone and breaks COMPLETELY THROUGH it — closing beyond the OB instead of bouncing', 'A new OB forms above it', 'The market closes for the day'], a: 1, explain: 'If price returns to the OB and doesn\'t bounce — instead breaking through with strong candle closures beyond the zone — the OB is dead. The institutional orders were fully absorbed or the thesis was wrong. Never trade an invalidated OB. Move on.' },
    { q: 'What makes an OB "strong" vs "weak"?', opts: ['The colour of the candle', 'Strong: formed after a liquidity sweep, left a FVG, was followed by a BOS, and hasn\'t been tested yet. Weak: no context, no FVG, already tested.', 'The size of the candle only', 'How old it is'], a: 1, explain: 'OB strength comes from CONTEXT. A strong OB forms after a liquidity sweep (smart money is active), leaves an imbalance (FVG), causes a structural break (BOS), and is untested (fresh orders still waiting). A weak OB has none of these — it\'s just a candle before a move, with no institutional evidence backing it.' },
    { q: 'When trading a bullish OB, your stop loss should go:', opts: ['5 pips below the OB', 'Below the ENTIRE OB zone (below the low of the OB candle) — if that breaks, the OB is invalidated', 'At the top of the OB', 'At a round number'], a: 1, explain: 'Your stop goes below the OB\'s low. The OB zone IS the institutional entry. If price breaks below the entire zone, the institution\'s position is underwater and the OB failed. Stop below = risk defined. Reward = the move toward opposing liquidity.' },
    { q: 'An OB that overlaps with a Fair Value Gap (FVG) is considered:', opts: ['Less reliable', 'The highest-probability setup — two independent institutional footprints at the same level', 'Normal — all OBs have FVGs', 'Only valid on the daily chart'], a: 1, explain: 'OB + FVG = double confluence. The OB tells you WHERE the institution entered. The FVG tells you there was an IMBALANCE in the move (unfilled orders). When both exist at the same price, you have two layers of institutional evidence pointing to the same zone. This is as good as it gets in SMC.' },
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

  // OB Grading system
  const grades = [
    { grade: 'A+', label: 'Premium OB', color: '#22c55e', criteria: 'After liquidity sweep + left FVG + caused BOS + untested + on HTF', desc: 'The dream setup. Every box is ticked. Smart money swept liquidity, entered at this OB, left an imbalance, and broke structure. This zone has unfilled orders waiting AND institutional conviction behind it. Trade this with full confidence.' },
    { grade: 'A', label: 'Strong OB', color: '#0ea5e9', criteria: 'Caused BOS + left FVG + untested', desc: 'Very strong. The impulsive move from this OB broke structure (proving institutional power) and left an imbalance. No liquidity sweep before it, but still excellent. Most professional SMC traders would take this setup.' },
    { grade: 'B', label: 'Standard OB', color: '#f59e0b', criteria: 'Caused BOS + untested (but no FVG)', desc: 'Decent but not premium. The OB caused a break of structure, showing institutional intent. But no FVG means the move was orderly (not impulsive). Use tighter targets and consider reducing position size.' },
    { grade: 'C', label: 'Weak OB', color: '#ef4444', criteria: 'No BOS, no FVG, or already mitigated once', desc: 'Low probability. Either the move from this OB wasn\'t strong enough to break structure, there\'s no imbalance, or it\'s already been tested. Experienced traders might skip this entirely. If you trade it, use minimal risk.' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 5</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Order Blocks</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Institutional footprints on the chart. Find where the big players entered — and enter alongside them.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🔍 Imagine a detective arriving at a crime scene.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The criminal is gone — you can&apos;t see them. But they left <strong className="text-amber-400">footprints</strong>. Those footprints tell you exactly where they stood, what they did, and where they went. If you follow the footprints, you can predict where they&apos;ll go next.</p>
            <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Order Blocks are the footprints institutions leave on charts.</strong> You can&apos;t see JP Morgan&apos;s order book. But you CAN see the last candle before a massive move — that candle is where they placed their orders. It&apos;s the &quot;crime scene&quot; of institutional buying or selling.</p>
            <p className="text-gray-400 leading-relaxed">And here&apos;s the magic: <strong className="text-primary-400">institutions rarely fill their entire order in one go.</strong> They leave unfilled orders behind at the OB zone. When price returns to that zone later, those leftover orders get triggered — creating a bounce. That bounce is YOUR entry. You&apos;re literally entering at the same price as the institution.</p>
          </div>

          <CrimeSceneAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">GBP/USD at 1.2680. The last bearish candle before a 120-pip rally sits at 1.2650-1.2680. That&apos;s the bullish Order Block. Three days later, price pulls back to 1.2660 — right into the OB. A bullish engulfing candle forms. Traders who identified the OB bought at 1.2660 with a stop at 1.2645 (below the OB). Price rallied to 1.2780. <em className="text-amber-400">120 pips of profit, 15 pips of risk. That&apos;s 1:8 R:R — from one Order Block.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — BULLISH vs BEARISH */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Two Types</p>
          <h2 className="text-2xl font-extrabold mb-4">Bullish vs Bearish Order Blocks</h2>

          <div className="space-y-4 mb-6">
            <div className="p-5 rounded-2xl glass-card border-l-4 border-primary-400">
              <h3 className="font-bold text-primary-400 text-lg mb-2">Bullish Order Block</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">The last <strong className="text-red-400">BEARISH (red) candle</strong> before a strong impulsive move UP.</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">💡 <strong className="text-primary-400">In plain English:</strong> Think of it as the last moment sellers were in control. The very next candle, buyers absolutely CRUSHED them. That red candle is where the institution loaded up their buy orders — absorbing all the selling pressure and then some. It&apos;s counter-intuitive: a RED candle marks a BUYING zone. But that&apos;s exactly the point — the institution was buying while retail was selling.</p>
              <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15">
                <p className="text-xs text-gray-300"><strong className="text-primary-400">How to identify:</strong> Find a strong move UP. Look at the candle JUST BEFORE it. Is it red/bearish? That&apos;s your bullish OB. The zone = open to close of that candle (or open to low for the refined version).</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card border-l-4 border-red-400">
              <h3 className="font-bold text-red-400 text-lg mb-2">Bearish Order Block</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">The last <strong className="text-green-400">BULLISH (green) candle</strong> before a strong impulsive move DOWN.</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">💡 <strong className="text-red-400">In plain English:</strong> The last gasp of the buyers. After this green candle, sellers took over with overwhelming force. The institution was selling INTO the buying pressure of this candle — disguising their sell orders within a green candle. Again, counter-intuitive: a GREEN candle marks a SELLING zone.</p>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                <p className="text-xs text-gray-300"><strong className="text-red-400">How to identify:</strong> Find a strong move DOWN. Look at the candle JUST BEFORE it. Is it green/bullish? That&apos;s your bearish OB. When price rallies back to this zone, expect selling.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">⚠️ <strong className="text-amber-400">The counter-intuitive rule:</strong> Bullish OB = red candle. Bearish OB = green candle. It feels backwards, but it makes sense: the institution enters AGAINST the current flow, absorbing the opposite side&apos;s orders. That&apos;s why the candle is the opposite colour — it represents the LAST moment of the old direction before the institution flipped everything.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — MITIGATION */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Mitigation</p>
          <h2 className="text-2xl font-extrabold mb-4">Returning to the Scene of the Crime</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The institution couldn&apos;t fill everything on the first pass. Leftover orders wait in the OB zone. When price comes back, those orders activate — creating a bounce.</p>

          <MitigationAnimation />

          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-xl glass-card" style={{ borderLeftWidth: '3px', borderLeftColor: '#22c55e' }}>
              <h3 className="font-bold text-white text-sm mb-1">Step 1: OB Forms</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Institution enters. Price moves impulsively away. The OB candle marks where they committed.</p>
            </div>
            <div className="p-4 rounded-xl glass-card" style={{ borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
              <h3 className="font-bold text-white text-sm mb-1">Step 2: Price Returns (Mitigates)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Price pulls back toward the OB zone. This is the &quot;return to the crime scene.&quot; Unfilled institutional orders are waiting.</p>
            </div>
            <div className="p-4 rounded-xl glass-card" style={{ borderLeftWidth: '3px', borderLeftColor: '#0ea5e9' }}>
              <h3 className="font-bold text-white text-sm mb-1">Step 3: The Bounce</h3>
              <p className="text-xs text-gray-400 leading-relaxed">When price touches the OB, those waiting orders trigger. Buying/selling pressure appears. Price bounces from the zone — YOUR entry. Stop below/above the OB. Target: the next liquidity level or opposing OB.</p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">Think of it like a restaurant:</strong> You ordered 10 dishes but the kitchen only delivered 7. Three dishes are still being prepared. When you go back to the restaurant (price returns to OB), those remaining 3 dishes get served (unfilled orders trigger). The restaurant didn&apos;t forget — they just needed time.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — OB GRADING */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — Grading Your OBs</p>
          <h2 className="text-2xl font-extrabold mb-4">Not All Order Blocks Are Equal</h2>
          <p className="text-sm text-gray-400 mb-6">Grade every OB before trading it. A+ setups get full risk. C setups get skipped.</p>

          <div className="space-y-3">
            {grades.map((g, i) => {
              const isOpen = activeGrade === i;
              return (
                <motion.div key={i} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActiveGrade(isOpen ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: g.color + '15', color: g.color }}>{g.grade}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{g.label}</h3>
                        <p className="text-[10px] text-gray-500">{g.criteria}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4"><p className="text-sm text-gray-400 leading-relaxed">{g.desc}</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — HOW TO TRADE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Trading Order Blocks</p>
          <h2 className="text-2xl font-extrabold mb-4">The Complete OB Trade</h2>

          <div className="space-y-3">
            {[
              { n: 1, title: 'Identify the OB on the HTF', desc: 'Find the last opposite-colour candle before a strong impulsive move. Mark the zone (open to close, or open to wick for refined OB).', color: '#f59e0b' },
              { n: 2, title: 'Wait for price to return', desc: 'Don\'t chase. The whole point of OB trading is WAITING for price to come back to you. Patience is non-negotiable.', color: '#0ea5e9' },
              { n: 3, title: 'Confirm on the LTF', desc: 'When price enters the OB zone, drop to the 15m/5m chart. Look for a CHoCH or bullish engulfing candle confirming the bounce has started.', color: '#a855f7' },
              { n: 4, title: 'Enter with defined risk', desc: 'Enter long (bullish OB) or short (bearish OB). Stop loss goes beyond the OB zone — below the low for bullish, above the high for bearish.', color: '#22c55e' },
              { n: 5, title: 'Target opposing liquidity', desc: 'Your take-profit = the liquidity on the other side. For a bullish OB trade: target the BSL above (previous highs). For bearish: target the SSL below. OB → opposing liquidity = the full measured move.', color: '#f59e0b' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl glass-card flex items-start gap-3" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: item.color + '20', color: item.color }}>{item.n}</div>
                <div><h3 className="font-bold text-white text-sm mb-1">{item.title}</h3><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Read the Order Block</p>
          <h2 className="text-2xl font-extrabold mb-2">What Happened at This OB?</h2>
          <p className="text-sm text-gray-400 mb-6">5 charts with OB zones marked. Identify the scenario.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <OBChart prices={gameData[gameRound].prices} obZone={gameData[gameRound].obZone} />

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
                      <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-amber-400">Explanation:</strong> {gameExplanations[gameRound]}</p>
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
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You see where institutions entered.' : gameScore >= 3 ? 'Your OB recognition is developing.' : 'Review the types and mitigation sections.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 06 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Order Block Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 You can read institutional footprints.' : score >= 66 ? 'Solid OB understanding.' : 'Review the formation and grading sections.'}</p>
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
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(245,158,11,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30">🔍</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.5: Order Blocks</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Footprint Detective —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.6 — Fair Value Gaps (FVGs)</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
