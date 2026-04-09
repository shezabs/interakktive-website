// app/academy/lesson/fair-value-gaps/page.tsx
// ATLAS Academy — Lesson 3.6: Fair Value Gaps (FVGs) [PRO]
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
// POTHOLE ANIMATION — price gap = pothole in road
// ============================================================
function PotholeAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 400) / 400;
    const midX = w / 2;

    // Road
    const roadY = h * 0.55;
    const roadH = 40;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, roadY, w, roadH);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadH / 2);
    ctx.lineTo(w, roadY + roadH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pothole in the road
    const potholeX = midX;
    const potholeW = 60;
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(potholeX, roadY + roadH / 2, potholeW / 2, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label the pothole
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FAIR VALUE GAP', potholeX, roadY + roadH + 18);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '8px system-ui';
    ctx.fillText('(imbalance in price)', potholeX, roadY + roadH + 30);

    // Phase 1: Price (car) drives over, leaving the gap (0-0.4)
    if (phase < 0.4) {
      const carX = 30 + (phase / 0.4) * (w - 60);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      // Car jumps over pothole
      let carY = roadY - 5;
      if (Math.abs(carX - potholeX) < 40) {
        carY -= 15; // jump over gap
      }
      ctx.fillText('🚗', carX, carY);

      ctx.fillStyle = '#0ea5e9';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText('Price moves TOO FAST — leaves a gap', midX, 20);
    }
    // Phase 2: Gap exists (0.4-0.6)
    else if (phase < 0.6) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('The gap is an IMBALANCE', midX, 20);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Price hates gaps — it always comes back to fill them', midX, 35);

      // Highlight the gap
      ctx.strokeStyle = 'rgba(245,158,11,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(potholeX, roadY + roadH / 2, potholeW / 2 + 5, 17, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Phase 3: Price returns to fill the gap (0.6-1.0)
    else {
      const returnPhase = (phase - 0.6) / 0.4;
      const carX = w - 30 - returnPhase * (w - 30 - potholeX);

      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚗', carX, roadY - 5);

      if (returnPhase > 0.7) {
        // Fill the pothole
        ctx.fillStyle = 'rgba(34,197,94,0.3)';
        ctx.beginPath();
        ctx.ellipse(potholeX, roadY + roadH / 2, potholeW / 2, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('GAP FILLED! Price found balance', midX, 20);
      } else {
        ctx.fillStyle = '#0ea5e9';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText('Price returns to fill the gap...', midX, 20);
      }
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FVG = POTHOLE IN THE PRICE ROAD', midX, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// 3-CANDLE FVG FORMATION ANIMATION
// ============================================================
function FVGFormAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 400) / 400;
    const step = phase < 0.3 ? 1 : phase < 0.55 ? 2 : phase < 0.8 ? 3 : 4;

    const cw = 36;
    const gap = 50;
    const startX = (w - 3 * cw - 2 * gap) / 2;

    // 3 candle positions
    const candles = [
      { x: startX, bodyTop: h * 0.5, bodyBot: h * 0.65, wickTop: h * 0.45, wickBot: h * 0.7, color: '#0ea5e9', label: 'Candle 1' },
      { x: startX + cw + gap, bodyTop: h * 0.15, bodyBot: h * 0.4, wickTop: h * 0.1, wickBot: h * 0.42, color: '#0ea5e9', label: 'Candle 2 (BIG)' },
      { x: startX + 2 * (cw + gap), bodyTop: h * 0.2, bodyBot: h * 0.35, wickTop: h * 0.17, wickBot: h * 0.38, color: '#0ea5e9', label: 'Candle 3' },
    ];

    // The FVG zone = gap between candle 1 high (wick top) and candle 3 low (wick bottom)
    const fvgTop = candles[0].wickTop; // top of candle 1's wick
    const fvgBot = candles[2].wickBot; // bottom of candle 3's wick

    // Draw candles based on step
    for (let i = 0; i < Math.min(step, 3); i++) {
      const c = candles[i];
      const alpha = i + 1 <= step ? 1 : 0.2;
      ctx.globalAlpha = alpha;

      // Wick
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + cw / 2, c.wickTop);
      ctx.lineTo(c.x + cw / 2, c.wickBot);
      ctx.stroke();

      // Body
      ctx.fillStyle = i === 1 ? 'rgba(14,165,233,0.9)' : 'rgba(14,165,233,0.6)';
      if (i + 1 === step && step <= 3) {
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 10;
      }
      ctx.fillRect(c.x, c.bodyTop, cw, c.bodyBot - c.bodyTop);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#9ca3af';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + cw / 2, c.wickBot + 14);

      ctx.globalAlpha = 1;
    }

    // Step 3+: Show the FVG zone
    if (step >= 3) {
      ctx.fillStyle = 'rgba(245,158,11,0.12)';
      ctx.fillRect(candles[0].x, fvgTop, candles[2].x + cw - candles[0].x, fvgBot - fvgTop);
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(candles[0].x, fvgTop, candles[2].x + cw - candles[0].x, fvgBot - fvgTop);
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('FVG', w / 2, (fvgTop + fvgBot) / 2 + 4);

      // Arrows showing the gap
      ctx.font = '8px system-ui';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'right';
      ctx.fillText('C1 high →', candles[0].x - 5, fvgBot + 3);
      ctx.textAlign = 'left';
      ctx.fillText('← C3 low', candles[2].x + cw + 5, fvgTop + 3);
    }

    // Step 4: label explanation
    if (step >= 4) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('The GAP between Candle 1\'s high and Candle 3\'s low', w / 2, h - 25);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '8px system-ui';
      ctx.fillText('Candle 2 moved so fast it left unfilled orders behind', w / 2, h - 12);
    }

    // Top labels
    const stepLabels = ['', 'Candle 1: Normal candle', 'Candle 2: HUGE impulsive candle', 'Candle 3: The gap is revealed', 'The FVG = unfilled orders'];
    ctx.fillStyle = step <= 3 ? '#0ea5e9' : '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stepLabels[step], w / 2, 16);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// FVG CHART
// ============================================================
function FVGChart({ prices, fvgZone, height = 260 }: {
  prices: number[];
  fvgZone?: { top: number; bottom: number; type: 'bullish' | 'bearish'; filled?: boolean };
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

    if (fvgZone) {
      const zt = py(fvgZone.top);
      const zb = py(fvgZone.bottom);
      const color = fvgZone.type === 'bullish' ? '#f59e0b' : '#a855f7';
      ctx.fillStyle = fvgZone.filled ? 'rgba(34,197,94,0.08)' : color + '10';
      ctx.fillRect(15, zt, w - 30, zb - zt);
      ctx.strokeStyle = fvgZone.filled ? 'rgba(34,197,94,0.3)' : color + '30';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(15, zt, w - 30, zb - zt);
      ctx.setLineDash([]);
      ctx.fillStyle = fvgZone.filled ? '#22c55e' : color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(fvgZone.filled ? 'FVG Filled' : `${fvgZone.type === 'bullish' ? 'Bullish' : 'Bearish'} FVG`, 18, zt - 3);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();
  }, [prices, fvgZone, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME DATA
// ============================================================
function genFVGScenario(type: string, seed: number): { prices: number[]; fvgZone: { top: number; bottom: number; type: 'bullish' | 'bearish'; filled?: boolean } } {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;

  if (type === 'bullish_fvg') {
    for (let i = 0; i < 12; i++) { price += (rand() - 0.5) * 1.5; p.push(price); }
    const gapBot = price; p.push(price);
    price += 5 + rand() * 2; p.push(price); // big candle leaves gap
    const gapTop = price - 3;
    for (let i = 0; i < 10; i++) { price += 0.3 + (rand() - 0.45) * 1; p.push(price); }
    for (let i = 0; i < 8; i++) { price -= 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, fvgZone: { top: gapTop, bottom: gapBot, type: 'bullish' } };
  }
  if (type === 'bearish_fvg') {
    price = 110;
    for (let i = 0; i < 12; i++) { price += (rand() - 0.5) * 1.5; p.push(price); }
    const gapTop2 = price; p.push(price);
    price -= 5 + rand() * 2; p.push(price);
    const gapBot2 = price + 3;
    for (let i = 0; i < 10; i++) { price -= 0.3 + (rand() - 0.55) * 1; p.push(price); }
    for (let i = 0; i < 8; i++) { price += 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, fvgZone: { top: gapTop2, bottom: gapBot2, type: 'bearish' } };
  }
  if (type === 'fvg_filled') {
    for (let i = 0; i < 10; i++) { price += (rand() - 0.5) * 1.2; p.push(price); }
    const gb = price; p.push(price);
    price += 4.5; p.push(price);
    const gt = price - 2.5;
    for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.45) * 0.8; p.push(price); }
    // Return and fill
    for (let i = 0; i < 10; i++) { price -= 0.4 + (rand() - 0.5) * 0.8; p.push(price); }
    price = gb + 0.5; p.push(price); // fills the gap
    for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
    return { prices: p, fvgZone: { top: gt, bottom: gb, type: 'bullish', filled: true } };
  }
  if (type === 'fvg_inverted') {
    for (let i = 0; i < 10; i++) { price += (rand() - 0.5) * 1.2; p.push(price); }
    const gb2 = price; p.push(price);
    price += 4; p.push(price);
    const gt2 = price - 2;
    for (let i = 0; i < 6; i++) { price += 0.2 + (rand() - 0.45) * 0.8; p.push(price); }
    // Smash back through — inversion
    for (let i = 0; i < 12; i++) { price -= 0.6 + (rand() - 0.45) * 1; p.push(price); }
    for (let i = 0; i < 6; i++) { price += 0.2 + (rand() - 0.5) * 0.6; p.push(price); }
    // Retest from below = inverted FVG acts as resistance
    price = gt2 + 0.3; p.push(price);
    for (let i = 0; i < 6; i++) { price -= 0.4 + (rand() - 0.5) * 0.8; p.push(price); }
    return { prices: p, fvgZone: { top: gt2, bottom: gb2, type: 'bearish' } };
  }
  // fvg_with_ob
  for (let i = 0; i < 8; i++) { price -= 0.2 + (rand() - 0.5) * 0.8; p.push(price); }
  const obLow = price - 1.5;
  p.push(price - 1); // OB candle
  const gb3 = price - 1;
  price += 5; p.push(price); // impulsive + FVG
  const gt3 = price - 3;
  for (let i = 0; i < 10; i++) { price += 0.3 + (rand() - 0.4) * 1; p.push(price); }
  for (let i = 0; i < 10; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
  price = gb3 + 1; p.push(price);
  for (let i = 0; i < 8; i++) { price += 0.5 + (rand() - 0.35) * 1; p.push(price); }
  return { prices: p, fvgZone: { top: gt3, bottom: gb3, type: 'bullish' } };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function FairValueGapsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFill, setActiveFill] = useState<string | null>(null);

  // Game
  const gameTypes = useMemo(() => ['bullish_fvg', 'bearish_fvg', 'fvg_filled', 'fvg_inverted', 'fvg_with_ob'], []);
  const gameData = useMemo(() => gameTypes.map((t, i) => genFVGScenario(t, 900 + i * 47)), [gameTypes]);
  const gameOptions = ['Bullish FVG (unfilled — expect bounce up)', 'Bearish FVG (unfilled — expect rejection down)', 'FVG filled (price returned and completed the fill)', 'Inverted FVG (bullish gap flipped to bearish resistance)', 'FVG + Order Block confluence (highest probability)'];
  const gameExplanations = [
    'A strong impulsive candle left a gap between Candle 1\'s high and Candle 3\'s low — a bullish Fair Value Gap. Price hasn\'t returned to fill it yet, meaning unfilled buy orders are still waiting in that zone. When price pulls back into this FVG, expect a bounce as those orders activate. This is your entry zone.',
    'The mirror image — a strong bearish candle left a gap. Unfilled sell orders sit in this zone. When price rallies back into the bearish FVG, expect selling pressure. For short trades, this is where you enter with the institutional flow.',
    'Price created a bullish FVG, moved up, then returned and entered the gap zone — filling it. The bounce from within the gap confirms it was a valid FVG with real institutional orders. A filled FVG that produces a bounce is one of the cleanest entries in SMC — you entered WHERE the institution entered.',
    'A bullish FVG was created, but price later smashed back down THROUGH the gap. What was support (bullish FVG) has now become resistance (inverted/bearish). Price retested the zone from below and got rejected. When a gap gets inverted, its role flips — this is an advanced concept that catches many traders off guard.',
    'This FVG sits right above an Order Block — double confluence. The institution left TWO footprints at the same price: the OB (where they entered) and the FVG (the imbalance from their entry). When price returns to this zone, both the OB and FVG react simultaneously. This is the highest-probability setup in all of SMC — two independent pieces of institutional evidence at the same price.',
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
    { q: 'A Fair Value Gap (FVG) is:', opts: ['A gap between the market open and close', 'A 3-candle pattern where the middle candle moves so fast it leaves a gap between Candle 1\'s wick and Candle 3\'s wick', 'A gap between bid and ask prices', 'When price doesn\'t move for a day'], a: 1, explain: 'An FVG forms when Candle 2 is so impulsive that Candle 1\'s high and Candle 3\'s low don\'t overlap — leaving a visible gap. This gap represents UNFILLED ORDERS from the institution\'s aggressive entry. Price tends to return and fill these gaps.' },
    { q: 'In layman\'s terms, an FVG is like:', opts: ['A traffic jam', 'A pothole in a road — price drove over it too fast, left a hole, and will come back to fill it', 'A speed limit sign', 'A parking space'], a: 1, explain: 'The pothole analogy: price moved so aggressively (like a car speeding) that it left a "hole" in the price action. Markets hate imbalance — they always come back to fill the pothole. That return to fill the gap is your trading opportunity.' },
    { q: 'Why do FVGs tend to get filled?', opts: ['It\'s random chance', 'Because the gap represents unfilled institutional orders — the market naturally returns to execute those pending orders and restore balance', 'Because all gaps fill eventually by law', 'Only on Mondays'], a: 1, explain: 'The institution moved price so fast they left unfilled orders behind in the gap zone. The market is efficient — it tends to return to zones where orders are pending. Additionally, traders who missed the original move set limit orders in the gap, adding to the magnet effect.' },
    { q: 'A BULLISH FVG has its gap between:', opts: ['Candle 1\'s low and Candle 3\'s high', 'Candle 1\'s HIGH (top of wick) and Candle 3\'s LOW (bottom of wick) — with Candle 2 being a large bullish candle in between', 'Any two candles', 'The open and close of Candle 2'], a: 1, explain: 'Bullish FVG: Candle 2 rockets upward so fast that there\'s a visible gap between where Candle 1 ended (its high) and where Candle 3 started (its low). The gap sits BELOW the current price and acts as a support/entry zone when price pulls back.' },
    { q: 'What does it mean when an FVG gets "inverted"?', opts: ['It disappears', 'Price broke through the FVG in the opposite direction — what was support becomes resistance (or vice versa)', 'It doubles in size', 'The FVG moves to a different timeframe'], a: 1, explain: 'Inversion is when the role flips. A bullish FVG (support) gets smashed through by sellers — now that same zone becomes bearish (resistance). When price tries to rally back into an inverted FVG, it gets rejected. This advanced concept turns failed levels into new opportunities.' },
    { q: 'When trading a bullish FVG, you should:', opts: ['Buy immediately when the FVG forms', 'WAIT for price to pull back INTO the FVG zone, then look for confirmation (bullish candle or LTF CHoCH) before entering', 'Sell into the FVG', 'Only trade FVGs on the 1-minute chart'], a: 1, explain: 'Never chase! The FVG is an ENTRY ZONE, not an immediate signal. Wait for price to return to the gap, then confirm with a bullish reaction (engulfing candle, CHoCH on LTF). Stop below the FVG. Target: the next liquidity level or opposing FVG.' },
    { q: 'An FVG combined with an Order Block at the same price level is:', opts: ['Confusing and should be avoided', 'The highest-probability setup in SMC — two independent institutional footprints confirming the same zone', 'Only valid on the weekly chart', 'A sign the market is manipulated'], a: 1, explain: 'FVG + OB = double institutional evidence. The OB shows WHERE the institution entered. The FVG shows they entered with such force they left an imbalance. Both pointing to the same zone = maximum confidence. This is the setup professional SMC traders dream about.' },
    { q: 'A "partial fill" of an FVG means:', opts: ['The FVG is invalid', 'Price entered the gap zone but didn\'t fill it completely — some unfilled orders remain, meaning the zone might react again', 'The trade failed', 'Volume was too low'], a: 1, explain: 'Price entered the FVG but only filled part of it before bouncing. The UNFILLED portion still has pending orders. Price might return for a second fill later. Partial fills often produce strong bounces because the institution\'s orders are concentrated in the remaining portion of the gap.' },
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

  // Fill types
  const fillTypes: Record<string, { title: string; desc: string; layman: string }> = {
    partial: { title: 'Partial Fill', desc: 'Price enters the FVG but only fills part of it before bouncing. The remaining portion still has unfilled orders. Price may return for a second fill later. Partial fills often produce STRONG bounces because the remaining orders are concentrated.', layman: 'Like drinking half a glass of water — you\'re not fully satisfied. You\'ll come back for the rest. The unfilled portion is the "thirst" that remains.' },
    full: { title: 'Full Fill', desc: 'Price enters the FVG and fills it completely — the entire gap is now "balanced." After a full fill, the zone may or may not produce a bounce. The gap\'s magnetic power has been used up.', layman: 'The pothole is fully paved over. The road is smooth again. Price might bounce from here, but the magnet is spent. Look for other reasons (OB, S/R) to take the trade.' },
    inverted: { title: 'Inverted FVG', desc: 'Price breaks through the FVG entirely and now uses it as the OPPOSITE zone. A bullish FVG that gets broken becomes bearish resistance. This is an advanced play — trading the flip.', layman: 'A door that used to let you IN now keeps you OUT. The role has reversed. If price tries to re-enter from the other side, the "door" is now locked.' },
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(6,10,18,0.85)', backdropFilter: 'blur(16px)' }}>
        <Link href="/academy" className="text-xs text-gray-500 hover:text-gray-300 transition">← Academy</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO · LEVEL 3</span></div>
      </nav>

      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 6</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Fair Value Gaps</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The imbalance magnet. When price moves too fast, it leaves a gap — and gaps ALWAYS get filled.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🕳️ Price HATES imbalance. Every gap gets filled.</p>
            <p className="text-gray-400 leading-relaxed mb-4">When an institution buys so aggressively that price jumps $5 in a single candle, it leaves behind <strong className="text-amber-400">unfilled orders</strong> in the zone it skipped. Think of it like a car driving so fast over a pothole that it doesn&apos;t feel the bump — but the pothole is still there. The market ALWAYS comes back to fill that pothole.</p>
            <p className="text-gray-400 leading-relaxed mb-4">A Fair Value Gap is that pothole — a <strong className="text-white">3-candle pattern</strong> where the middle candle is so large that the wicks of Candle 1 and Candle 3 don&apos;t overlap. That non-overlapping zone IS the FVG. It represents price that was traded through too quickly, leaving pending orders behind.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">FVGs are one of the most reliable entry zones in all of SMC</strong> because they combine institutional footprints with the market&apos;s natural tendency to seek balance. Every FVG is a magnet — and you can position yourself at the magnet before it pulls price back.</p>
          </div>

          <PotholeAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">Bitcoin at $62,000. A massive green candle pushes price to $65,500 in 4 hours, leaving a clear FVG between $63,000 and $64,200. Over the next 2 days, Bitcoin pulls back to $63,800 — right into the FVG. A bullish engulfing forms inside the gap. Traders who spotted the FVG bought at $63,800 with a stop at $62,900. Bitcoin then rallied to $68,000. <em className="text-amber-400">The pothole pulled price back. The bounce was the entry. The math worked perfectly.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — THE 3-CANDLE RULE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The 3-Candle Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">How an FVG Forms</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Watch this animation. Three candles — and the gap between Candle 1&apos;s wick and Candle 3&apos;s wick is the FVG.</p>

          <FVGFormAnimation />

          <div className="mt-6 space-y-3">
            {[
              { n: 1, title: 'Candle 1: The Setup', desc: 'A normal candle. Nothing special about it. But its HIGH (top of the upper wick) becomes the BOTTOM boundary of the FVG.', layman: 'Think of this as the edge of the road before the pothole starts.', color: '#0ea5e9' },
              { n: 2, title: 'Candle 2: The Explosion', desc: 'A HUGE impulsive candle — much bigger than normal. This is the institution entering with force. The candle is so big that it "jumps over" a price zone without properly trading through it.', layman: 'The car speeding so fast it flies over the pothole without touching the ground.', color: '#f59e0b' },
              { n: 3, title: 'Candle 3: The Reveal', desc: 'The next candle starts trading. Its LOW (bottom of the lower wick) becomes the TOP boundary of the FVG. The GAP between Candle 1\'s high and Candle 3\'s low is the Fair Value Gap.', layman: 'You look back and see the pothole. The road between the edge (C1 high) and where you landed (C3 low) was never properly driven over.', color: '#22c55e' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl glass-card flex items-start gap-3" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: item.color + '20', color: item.color }}>{item.n}</div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-[10px] text-gray-500">💡 {item.layman}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — BULLISH vs BEARISH */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Two Types</p>
          <h2 className="text-2xl font-extrabold mb-4">Bullish vs Bearish FVGs</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-2xl glass-card border-t-4 border-amber-400">
              <h3 className="font-bold text-amber-400 text-sm mb-2">Bullish FVG ↑</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">Gap BELOW current price. Created by an impulsive UP candle. Candle 2 was a big green candle.</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">💡 <strong className="text-primary-400">Acts as:</strong> Support zone. When price pulls back into a bullish FVG, expect a bounce UP. This is your BUY zone.</p>
              <p className="text-[10px] text-gray-500">Like a pothole below you — if you fall into it, the road pushes you back up.</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border-t-4 border-purple-400">
              <h3 className="font-bold text-purple-400 text-sm mb-2">Bearish FVG ↓</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">Gap ABOVE current price. Created by an impulsive DOWN candle. Candle 2 was a big red candle.</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">💡 <strong className="text-red-400">Acts as:</strong> Resistance zone. When price rallies into a bearish FVG, expect rejection DOWN. This is your SELL zone.</p>
              <p className="text-[10px] text-gray-500">Like a ceiling with a hole in it — if you jump up into it, it pushes you back down.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — FILL TYPES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — How Gaps Get Filled</p>
          <h2 className="text-2xl font-extrabold mb-4">Partial, Full, and Inverted Fills</h2>
          <p className="text-sm text-gray-400 mb-6">Not every fill is the same. Understanding the type of fill changes how you trade it. Tap each type.</p>

          <div className="space-y-3">
            {Object.entries(fillTypes).map(([key, ft]) => {
              const isOpen = activeFill === key;
              const color = key === 'partial' ? '#f59e0b' : key === 'full' ? '#22c55e' : '#a855f7';
              return (
                <motion.div key={key} layout className="rounded-2xl glass-card overflow-hidden">
                  <button onClick={() => setActiveFill(isOpen ? null : key)} className="w-full p-4 flex items-center justify-between text-left">
                    <h3 className="font-bold text-white text-sm" style={{ color }}>{ft.title}</h3>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-gray-400 leading-relaxed">{ft.desc}</p>
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-xs text-gray-300">💡 <strong className="text-primary-400">In plain English:</strong> {ft.layman}</p></div>
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

      {/* SECTION 04 — TRADING FVGs */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Trading Fair Value Gaps</p>
          <h2 className="text-2xl font-extrabold mb-4">The Complete FVG Trade</h2>

          <div className="space-y-3">
            {[
              { n: 1, title: 'Spot the FVG on the HTF', desc: 'Find the 3-candle pattern with the gap. Mark the zone between Candle 1\'s wick and Candle 3\'s wick. This is your target zone.', color: '#f59e0b' },
              { n: 2, title: 'Wait for the pullback', desc: 'Don\'t trade when the FVG forms — the move has already happened. Wait for price to RETURN to the gap. Patience is the edge.', color: '#0ea5e9' },
              { n: 3, title: 'Set a limit order inside the FVG', desc: 'Place a limit buy order inside the bullish FVG (or limit sell for bearish). Many pro traders set the order at the 50% mark of the gap — the "equilibrium" of the imbalance.', color: '#a855f7' },
              { n: 4, title: 'Confirm on LTF (optional but recommended)', desc: 'For higher probability: wait until price enters the FVG AND shows a bullish/bearish reaction on the lower timeframe. A CHoCH or engulfing candle inside the FVG = confirmation.', color: '#22c55e' },
              { n: 5, title: 'Stop below/above the FVG', desc: 'If bullish: stop goes below the FVG\'s bottom. If bearish: stop goes above the FVG\'s top. If the entire gap gets broken, your thesis was wrong.', color: '#ef4444' },
              { n: 6, title: 'Target: next liquidity or opposing FVG', desc: 'Your take-profit sits at the next liquidity level (previous high/low) or at an opposing FVG on the other side. FVG → opposing FVG often gives excellent R:R.', color: '#f59e0b' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Read the Gap</p>
          <h2 className="text-2xl font-extrabold mb-2">What Happened at This FVG?</h2>
          <p className="text-sm text-gray-400 mb-6">5 charts with FVG zones marked. Identify the scenario.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <FVGChart prices={gameData[gameRound].prices} fvgZone={gameData[gameRound].fvgZone} />

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
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You can read every gap on the chart.' : gameScore >= 3 ? 'Your FVG vision is sharpening.' : 'Review the 3-candle rule and fill types.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 06 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Fair Value Gap Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 You see every imbalance on the chart.' : score >= 66 ? 'Solid FVG understanding.' : 'Review the 3-candle rule and fill types.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">🕳️</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.6: Fair Value Gaps</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 via-red-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Imbalance Spotter —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.7 — Premium & Discount Zones</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
