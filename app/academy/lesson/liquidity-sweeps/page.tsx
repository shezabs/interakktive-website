// app/academy/lesson/liquidity-sweeps/page.tsx
// ATLAS Academy — Lesson 3.4: Liquidity Sweeps & Inducement [PRO]
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
// MOUSETRAP ANIMATION — the layman analogy
// ============================================================
function TrapAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 360) / 360;
    const midX = w / 2;

    // Three phases shown as panels
    const panelW = (w - 30) / 3;
    const labels = ['1. Set the Trap', '2. Trigger!', '3. Got You'];
    const colors = ['#f59e0b', '#ef4444', '#22c55e'];
    const activePanel = phase < 0.33 ? 0 : phase < 0.66 ? 1 : 2;

    for (let p = 0; p < 3; p++) {
      const px = 5 + p * (panelW + 10);
      const isActive = p === activePanel;
      const alpha = isActive ? 1 : 0.2;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors[p] + '08';
      ctx.fillRect(px, 28, panelW, h - 38);
      ctx.strokeStyle = colors[p] + (isActive ? '40' : '10');
      ctx.lineWidth = 1;
      ctx.strokeRect(px, 28, panelW, h - 38);

      ctx.fillStyle = isActive ? colors[p] : '#4b5563';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(labels[p], px + panelW / 2, 20);

      const cx = px + panelW / 2;

      if (p === 0) {
        // Support line with cheese (stop losses = bait)
        ctx.strokeStyle = `rgba(14,165,233,${alpha * 0.5})`;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(px + 10, h * 0.55);
        ctx.lineTo(px + panelW - 10, h * 0.55);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgba(14,165,233,${alpha * 0.7})`;
        ctx.font = '8px system-ui';
        ctx.fillText('Support', cx, h * 0.55 - 5);

        // Stop losses below = cheese
        ctx.font = '16px serif';
        ctx.fillText('🧀', cx - 15, h * 0.7);
        ctx.fillText('🧀', cx + 15, h * 0.7);
        ctx.fillText('🧀', cx, h * 0.72);

        ctx.fillStyle = `rgba(239,68,68,${alpha * 0.6})`;
        ctx.font = '7px system-ui';
        ctx.fillText('Stop losses = bait', cx, h * 0.82);
      } else if (p === 1) {
        // Price smashes through
        ctx.strokeStyle = `rgba(14,165,233,${alpha * 0.3})`;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(px + 10, h * 0.55);
        ctx.lineTo(px + panelW - 10, h * 0.55);
        ctx.stroke();
        ctx.setLineDash([]);

        // Red spike below
        ctx.beginPath();
        ctx.strokeStyle = `rgba(239,68,68,${alpha})`;
        ctx.lineWidth = 3;
        ctx.moveTo(cx, h * 0.4);
        ctx.lineTo(cx, h * 0.78);
        ctx.stroke();

        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('SNAP!', cx, h * 0.88);
        ctx.font = '7px system-ui';
        ctx.fillText('Stops triggered', cx, h * 0.95);
      } else {
        // Reversal upward
        ctx.beginPath();
        ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
        ctx.lineWidth = 3;
        ctx.moveTo(cx - 10, h * 0.78);
        ctx.lineTo(cx, h * 0.75);
        ctx.lineTo(cx + 5, h * 0.45);
        ctx.lineTo(cx + 15, h * 0.35);
        ctx.stroke();

        ctx.fillStyle = `rgba(34,197,94,${alpha})`;
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('REVERSAL', cx, h * 0.3);
        ctx.font = '7px system-ui';
        ctx.fillText('Real move begins', cx, h * 0.9);

        if (isActive) {
          // Institution emoji
          ctx.font = '20px serif';
          ctx.globalAlpha = Math.min((phase - 0.66) * 6, 1);
          ctx.fillText('🏦', cx, h * 0.5);
          ctx.font = '7px system-ui';
          ctx.fillStyle = '#22c55e';
          ctx.fillText('Institution filled', cx, h * 0.58);
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE LIQUIDITY SWEEP = A MOUSETRAP', midX, 10);
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// SWEEP SEQUENCE — 5-step animated chart showing a sweep forming
// ============================================================
function SweepSequenceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);

    const totalSteps = 5;
    const cycleDuration = 500;
    const cycle = f % cycleDuration;
    const step = Math.min(Math.floor((cycle / cycleDuration) * totalSteps), totalSteps - 1);

    const supportY = h * 0.6;
    const sweepY = h * 0.78;
    const topY = h * 0.15;

    // Support line (always visible)
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(14,165,233,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, supportY);
    ctx.lineTo(w - 20, supportY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Step labels
    const stepLabels = [
      'Step 1: Liquidity builds below support',
      'Step 2: Price approaches the level',
      'Step 3: Price spikes BELOW — the sweep',
      'Step 4: Immediate rejection (long wick)',
      'Step 5: Violent reversal — the real move',
    ];
    const stepColors = ['#f59e0b', '#0ea5e9', '#ef4444', '#f59e0b', '#22c55e'];

    ctx.fillStyle = stepColors[step];
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stepLabels[step], w / 2, 14);

    // Progress bar
    for (let i = 0; i < totalSteps; i++) {
      ctx.fillStyle = i <= step ? stepColors[i] : '#1f2937';
      ctx.fillRect(20 + i * ((w - 40) / totalSteps) + 2, h - 8, (w - 40) / totalSteps - 4, 4);
    }

    // Step 1: Show stop losses below support
    if (step >= 0) {
      ctx.fillStyle = 'rgba(239,68,68,0.08)';
      ctx.fillRect(20, supportY + 2, w - 40, sweepY - supportY);
      if (step === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '7px system-ui';
        for (let i = 0; i < 8; i++) {
          ctx.fillText('SL', 40 + i * ((w - 80) / 7), supportY + 18);
        }
        ctx.font = '8px system-ui';
        ctx.fillText('Retail stops piling up below "strong support"', w / 2, supportY + 35);
      }
    }

    // Step 2: Price line approaching
    if (step >= 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      const pts: [number, number][] = [];
      for (let i = 0; i < 15; i++) {
        const t = i / 14;
        pts.push([30 + t * w * 0.4, topY + t * (supportY - topY - 15) + Math.sin(t * 8) * 8]);
      }
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    }

    // Step 3: The sweep spike
    if (step >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.moveTo(30 + w * 0.4, supportY - 15);
      ctx.lineTo(30 + w * 0.48, sweepY); // spike down
      ctx.stroke();

      if (step === 2) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText('SWEEP!', w * 0.55, sweepY - 5);
      }
    }

    // Step 4: Rejection wick
    if (step >= 3) {
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.moveTo(30 + w * 0.48, sweepY);
      ctx.lineTo(30 + w * 0.52, supportY - 10); // bounce back up
      ctx.stroke();

      if (step === 3) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText('Long wick = rejection', w * 0.6, supportY - 20);
        ctx.font = '8px system-ui';
        ctx.fillText('Price went below, but CLOSED above', w * 0.6, supportY - 8);
      }
    }

    // Step 5: Reversal continuation
    if (step >= 4) {
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 4;
      ctx.moveTo(30 + w * 0.52, supportY - 10);
      const endX = 30 + w * 0.85;
      const endY = topY - 5;
      for (let i = 0; i < 10; i++) {
        const t = (i + 1) / 10;
        const x = 30 + w * 0.52 + t * (endX - 30 - w * 0.52);
        const y = supportY - 10 - t * (supportY - 10 - endY) + Math.sin(t * 6) * 5;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('THE REAL MOVE', w * 0.75, topY + 15);
    }

    // Support label
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('Support', w - 22, supportY - 3);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// FISHING ANIMATION — inducement = bait on a hook
// ============================================================
function FishingAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 300) / 300;
    const midX = w / 2;

    // Water line
    const waterY = h * 0.45;
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fillRect(0, waterY, w, h - waterY);
    ctx.strokeStyle = 'rgba(14,165,233,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    for (let x = 0; x < w; x += 3) {
      ctx.lineTo(x, waterY + Math.sin((x + f) * 0.03) * 3);
    }
    ctx.stroke();

    // Fishing line from top
    ctx.strokeStyle = 'rgba(156,163,175,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, waterY + 40);
    ctx.stroke();

    // Hook with "breakout" bait
    const hookY = waterY + 40 + Math.sin(f * 0.03) * 5;
    ctx.fillStyle = '#f59e0b';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪝', midX, hookY);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('"Breakout!"', midX, hookY + 16);

    // Fish (retail traders) swimming toward bait
    const fishCount = 5;
    ctx.font = '14px serif';
    for (let i = 0; i < fishCount; i++) {
      const angle = (phase * Math.PI * 2) + (i / fishCount) * Math.PI * 2;
      const dist = 40 + Math.sin(angle * 2) * 15;
      const fx = midX + Math.cos(angle) * dist;
      const fy = hookY + 20 + Math.sin(angle) * 20;

      if (phase < 0.6) {
        // Swimming toward hook
        const approach = Math.max(0, 1 - phase * 2) * 30;
        ctx.globalAlpha = 0.7;
        ctx.fillText('🐟', fx + approach * Math.cos(angle), fy);
      } else {
        // Caught!
        ctx.globalAlpha = Math.max(0, 1 - (phase - 0.6) * 3);
        ctx.fillText('🐟', midX + (i - 2) * 12, hookY + 25);
      }
      ctx.globalAlpha = 1;
    }

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Institution', 15, 20);
    ctx.fillText('(the fisherman)', 15, 32);

    // Above water = the "fake move"
    ctx.fillStyle = phase > 0.6 ? '#ef4444' : '#f59e0b';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    if (phase > 0.6) {
      ctx.fillText('INDUCEMENT = the bait that traps retail', midX, h - 15);
    } else {
      ctx.fillText('Retail traders chase the "breakout"...', midX, h - 15);
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('INDUCEMENT = BAIT ON A HOOK', midX, 12);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// SWEEP CHART
// ============================================================
function SweepChart({ prices, sweepIdx, height = 260 }: { prices: number[]; sweepIdx?: number; height?: number }) {
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

    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    for (let i = 0; i < len; i++) {
      i === 0 ? ctx.moveTo(px(i), py(prices[i])) : ctx.lineTo(px(i), py(prices[i]));
    }
    ctx.stroke();

    // Mark sweep point
    if (sweepIdx !== undefined && sweepIdx < len) {
      const sx = px(sweepIdx);
      const sy = py(prices[sweepIdx]);
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239,68,68,0.3)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SWEEP', sx, sy > hh / 2 ? sy + 16 : sy - 10);
    }
  }, [prices, sweepIdx, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-xl bg-[#060a12]" />;
}

// ============================================================
// GAME DATA GENERATORS
// ============================================================
function genSweepScenario(type: string, seed: number): { prices: number[]; sweepIdx: number } {
  const rand = seededRandom(seed);
  const p: number[] = [];
  let price = 100;

  if (type === 'bull_sweep_ssl') {
    // Downtrend → sweep below swing low → reversal up
    for (let i = 0; i < 15; i++) { price -= 0.3 + (rand() - 0.5) * 1.2; p.push(price); }
    const swLow = price;
    for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    for (let i = 0; i < 5; i++) { price -= 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
    // Sweep below
    price = swLow - 2 - rand() * 1.5; p.push(price);
    const sweepIdx = p.length - 1;
    // Reversal
    for (let i = 0; i < 12; i++) { price += 0.6 + (rand() - 0.35) * 1.2; p.push(price); }
    return { prices: p, sweepIdx };
  }
  if (type === 'bear_sweep_bsl') {
    // Uptrend → sweep above swing high → reversal down
    for (let i = 0; i < 15; i++) { price += 0.3 + (rand() - 0.5) * 1.2; p.push(price); }
    const swHigh = price;
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    for (let i = 0; i < 5; i++) { price += 0.4 + (rand() - 0.5) * 0.5; p.push(price); }
    price = swHigh + 2 + rand() * 1.5; p.push(price);
    const sweepIdx = p.length - 1;
    for (let i = 0; i < 12; i++) { price -= 0.6 + (rand() - 0.35) * 1.2; p.push(price); }
    return { prices: p, sweepIdx };
  }
  if (type === 'eql_sweep') {
    // Equal lows → sweep below → reversal
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 1; p.push(price); }
    const eqLow = price;
    for (let i = 0; i < 8; i++) { price += 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    for (let i = 0; i < 8; i++) { price -= 0.3 + (rand() - 0.5) * 0.8; p.push(price); }
    price = eqLow + (rand() - 0.5) * 0.3; p.push(price);
    for (let i = 0; i < 5; i++) { price += 0.2 + (rand() - 0.5) * 0.6; p.push(price); }
    // Sweep
    price = eqLow - 2.5; p.push(price);
    const sweepIdx = p.length - 1;
    for (let i = 0; i < 10; i++) { price += 0.7 + (rand() - 0.35) * 1; p.push(price); }
    return { prices: p, sweepIdx };
  }
  if (type === 'inducement') {
    // Small pullback that looks like a buying opportunity but is inducement
    for (let i = 0; i < 12; i++) { price += 0.4 + (rand() - 0.45) * 1.2; p.push(price); }
    // Small dip = inducement (mini higher low that traps buyers)
    for (let i = 0; i < 5; i++) { price -= 0.15 + (rand() - 0.5) * 0.4; p.push(price); }
    const induceIdx = p.length - 1;
    // Brief bounce to trap
    for (let i = 0; i < 3; i++) { price += 0.2 + (rand() - 0.5) * 0.3; p.push(price); }
    // Then collapse through the inducement low and continue down
    for (let i = 0; i < 12; i++) { price -= 0.5 + (rand() - 0.4) * 1; p.push(price); }
    return { prices: p, sweepIdx: induceIdx };
  }
  // failed_sweep: sweep that doesn't reverse — keeps going
  for (let i = 0; i < 15; i++) { price -= 0.3 + (rand() - 0.5) * 1.2; p.push(price); }
  const swLow2 = price;
  for (let i = 0; i < 6; i++) { price += 0.25 + (rand() - 0.5) * 0.6; p.push(price); }
  price = swLow2 - 1.5; p.push(price);
  const sweepIdx2 = p.length - 1;
  // NO reversal — continues down
  for (let i = 0; i < 12; i++) { price -= 0.4 + (rand() - 0.45) * 1; p.push(price); }
  return { prices: p, sweepIdx: sweepIdx2 };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LiquiditySweepsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [activeConfirm, setActiveConfirm] = useState<number | null>(null);

  // Game
  const gameTypes = useMemo(() => ['bull_sweep_ssl', 'bear_sweep_bsl', 'eql_sweep', 'inducement', 'failed_sweep'], []);
  const gameData = useMemo(() => gameTypes.map((t, i) => genSweepScenario(t, 700 + i * 53)), [gameTypes]);
  const gameOptions = ['Bullish sweep (SSL grabbed → reversal UP)', 'Bearish sweep (BSL grabbed → reversal DOWN)', 'Equal lows sweep (EQL taken → bounce)', 'Inducement (fake pullback → trap → continuation)', 'Failed sweep (broke through → no reversal)'];
  const gameExplanations = [
    'Price swept below a swing low, grabbing sell-side liquidity (retail stop losses). Then it IMMEDIATELY reversed upward. The institution pushed price down to fill their buy orders using YOUR sell stops. The reversal after the sweep IS the real move — a buy signal.',
    'Price swept above a swing high, grabbing buy-side liquidity (short sellers\' stops + breakout buys). Then it reversed downward. The spike above was the institution filling their sell orders. The rejection and reversal is the real move — a sell signal.',
    'Price had equal lows — a flat floor that retail sees as "strong support." The sweep took out all the stops below that floor, then bounced hard. Equal lows are the biggest liquidity pools because EVERYONE sees the same level. The sweep and bounce was textbook.',
    'This is INDUCEMENT — a small, tempting pullback within an uptrend that looks like a buying opportunity. Retail buys the "dip," placing stops below. But it\'s bait. Price briefly bounces (trapping buyers), then collapses through, hitting all those new stops. Inducement creates fresh liquidity for the institution\'s REAL entry.',
    'Not every sweep reverses! This sweep broke below a swing low but price KEPT GOING DOWN. This is a failed sweep or a genuine breakdown — the difference is: no immediate rejection, no long wick, no structural shift after the sweep. When the sweep has no rejection, it\'s not a sweep — it\'s a real break.',
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
    { q: 'A "liquidity sweep" occurs when:', opts: ['Volume increases dramatically', 'Price spikes past an obvious level (grabbing stops) then immediately reverses back', 'A new trend begins', 'Two moving averages cross'], a: 1, explain: 'A sweep is the spike-and-reverse. Price temporarily breaks past a level where stops are clustered, triggers those stops (giving the institution orders to fill), then reverses. The spike is the grab. The reversal is the real move.' },
    { q: 'In layman\'s terms, a liquidity sweep is like:', opts: ['A car running out of petrol', 'A mousetrap — the cheese lures the mouse, the trap snaps, the hunter collects', 'A random market fluctuation', 'A news event'], a: 1, explain: 'The mousetrap analogy: the "obvious" level is the cheese. Retail traders placing stops there are the mice. The sweep (spike through) is the trap snapping. The institution is the hunter who set the trap and collects the catch (orders). Then the trap resets (price reverses).' },
    { q: '"Inducement" in SMC means:', opts: ['A legal term for trading', 'A small move DESIGNED to attract retail traders into bad positions, creating fresh liquidity for institutions', 'An indicator signal', 'When volume is very high'], a: 1, explain: 'Inducement is the bait on the hook. A small pullback in an uptrend that looks like a "buying opportunity" — retail buys, places stops below, and those stops become fresh sell-side liquidity. The institution then sweeps those stops and enters their REAL position. The "buying opportunity" was the trap.' },
    { q: 'How do you confirm a sweep is valid (not just a breakdown)?', opts: ['Wait for RSI to reach 30', 'Look for: (1) immediate rejection (long wick), (2) structural shift after the sweep, (3) volume spike on the rejection', 'Check the news', 'It\'s always valid'], a: 1, explain: 'Three confirmations: (1) Long wick showing immediate rejection — price went past but couldn\'t STAY past. (2) A CHoCH or BOS in the opposite direction on the LTF after the sweep. (3) Volume spike showing institutions were active at that level. All three together = high-probability sweep.' },
    { q: 'Where do sweeps happen MOST often?', opts: ['At random price levels', 'At previous day highs/lows, session highs/lows, equal levels, and round numbers — anywhere stops obviously cluster', 'Only during news events', 'At moving average crossovers'], a: 1, explain: 'Sweeps target where STOPS cluster. Stops cluster at obvious levels: previous day H/L (every trader sees them), session highs/lows, equal highs/lows, round numbers ($100, $2,000), and trendlines. The more obvious the level, the bigger the pool, the more attractive the sweep.' },
    { q: 'After a valid bullish sweep (price sweeps below a low then reverses up), where should your entry be?', opts: ['Below the sweep low', 'At the sweep point itself', 'After confirmation: once price shows a bullish CHoCH or BOS above the swept level on the lower timeframe', 'Immediately when price touches the level'], a: 2, explain: 'Never enter blindly at the sweep. Wait for CONFIRMATION — a bullish CHoCH or BOS on the LTF after the sweep. This confirms the institution has finished collecting and the reversal is underway. Your stop goes below the sweep wick (the actual low).' },
    { q: 'A "failed sweep" looks like:', opts: ['Price spikes past a level and immediately reverses (that\'s a successful sweep)', 'Price breaks past a level and keeps going — no rejection, no reversal, no structural shift', 'A very small candle', 'Price touching a level without breaking it'], a: 1, explain: 'A failed sweep = no rejection. Price breaks through and STAYS through. No long wick, no structural shift, no reversal. This means the level genuinely broke — it wasn\'t a sweep, it was a real breakdown. The key difference is the REJECTION. No rejection = not a sweep.' },
    { q: 'Why is the wick after a sweep so important?', opts: ['Wicks are always important', 'A long wick shows price was REJECTED at the sweep level — it went past but couldn\'t hold, meaning institutions absorbed the liquidity and reversed price', 'Wicks indicate high volume', 'Wicks predict next day\'s direction'], a: 1, explain: 'The wick IS the sweep. Price spiked past the level (triggering stops) but closed back above/below it — the wick is the visual evidence that a liquidity grab happened. A long wick at a key level after a spike is one of the strongest reversal signals in all of trading.' },
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

  // 3 Confirmation signs
  const confirmations = [
    { title: '1. The Wick (Immediate Rejection)', desc: 'After the sweep, does the candle have a LONG wick? A long wick means price went past the level but was immediately pushed back — the institution grabbed the liquidity and reversed price within the same candle. No wick = no rejection = probably not a sweep.', layman: 'Think of it like dipping your hand in hot water. If you pull back instantly (long wick), you reacted to something real. If your hand stays in (no wick), you\'re committed — it\'s not a test, it\'s a genuine move.', icon: '🕯️' },
    { title: '2. Structural Shift (CHoCH/BOS)', desc: 'After the sweep, does the LOWER timeframe show a Change of Character or Break of Structure in the opposite direction? A bullish CHoCH after a sell-side sweep = institutions have shifted the structure. This is your green light.', layman: 'The sweep is the fisherman casting the line. The structural shift is the fish being reeled in. Without the reel (structural shift), the cast (sweep) was wasted. Wait for the structure to CONFIRM the reversal.', icon: '🔄' },
    { title: '3. Volume Spike', desc: 'Was there a spike in volume at the sweep level? High volume at the sweep = institutions were actively filling orders. Low volume = might be a random price fluctuation, not a deliberate liquidity grab.', layman: 'If you hear a loud "SNAP" at the mousetrap, something got caught. If there\'s silence (low volume), the trap might have misfired. Volume is the sound of the trap snapping.', icon: '📊' },
  ];

  // Where sweeps happen
  const sweepLocations = [
    { location: 'Previous Day High / Low', why: 'Every trader can see yesterday\'s high and low. Stops cluster above the high (shorts) and below the low (longs). London and New York sessions often sweep the Asian session\'s high or low within the first 1-2 hours.', frequency: 'Daily — one of the most reliable sweep targets.' },
    { location: 'Session Highs / Lows', why: 'The high and low of the Asian, London, or New York session. When a new session opens, institutions often sweep the previous session\'s extreme to collect liquidity before starting their move.', frequency: 'Multiple times per day — especially at session transitions.' },
    { location: 'Equal Highs / Equal Lows', why: 'The biggest, most visible liquidity pools. When retail traders see a "triple top" or "triple bottom," they stack stops around it. The more touches, the more stops, the juicier the target.', frequency: 'Whenever they form — usually swept within days.' },
    { location: 'Round Numbers', why: '$100, $1,000, $2,000 — humans love round numbers and place orders there. The clustering is psychological but very real. Institutions know this and target these levels.', frequency: 'Regularly — especially in forex (1.0000, 1.1000) and crypto ($50K, $100K).' },
    { location: 'Trendlines', why: 'Retail traders place stops just below/above trendlines. A "trendline break" that immediately reverses is classic sweep behaviour — the institution broke the trendline to grab the stops, then reversed.', frequency: 'When trendlines become "obvious" to everyone.' },
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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 4</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Liquidity Sweeps<br />& Inducement</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">The trap before the move. How institutions use fake breakouts to fill their orders — and how YOU can trade them.</p>
        </motion.div>
      </section>

      {/* SECTION 00 — WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">🪤 It&apos;s a mousetrap. And YOUR stop loss is the cheese.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In Lesson 3.3, you learned that institutions NEED your orders. Now you&apos;ll learn exactly HOW they get them. The answer is the <strong className="text-amber-400">liquidity sweep</strong> — the most powerful and most common pattern in Smart Money trading.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Think of it like a mousetrap. The institution places cheese (an &quot;obvious&quot; support or resistance level). Mice (retail traders) are attracted and place their stops nearby. When enough mice are gathered, the trap SNAPS — price spikes past the level, triggers all the stops, and the institution collects the orders. Then the trap resets — price reverses, and the real move begins.</p>
            <p className="text-gray-400 leading-relaxed"><strong className="text-primary-400">Every single time you&apos;ve been &quot;stopped out by one pip before price went your way&quot; — you experienced a liquidity sweep.</strong> By the end of this lesson, you&apos;ll see them BEFORE they happen, and trade them instead of being trapped by them.</p>
          </div>

          <TrapAnimation />

          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">🔍 REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">NASDAQ futures at 3am EST. The Asian session low sits at 17,850. Thousands of overnight longs have stops at 17,840-17,845. London opens — price spikes to 17,838 (sweeping ALL those stops). Within 15 minutes, price reverses to 17,920 — an 82-point move. The traders who got stopped out at 17,840 watch in agony as their original position would have been hugely profitable. <em className="text-amber-400">They were the cheese. The London open was the trap snapping.</em></p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 01 — ANATOMY OF A SWEEP */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">5 Steps of Every Liquidity Sweep</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Watch this animation. It shows exactly how a sweep unfolds — step by step. The progress bar at the bottom tracks each phase.</p>

          <SweepSequenceAnimation />

          <div className="mt-6 space-y-3">
            {[
              { step: 'Step 1: Liquidity Builds', desc: 'Retail traders see an "obvious" level (support, resistance, equal highs/lows). They place stop losses on the other side. Over time, a dense cluster of orders builds up — the liquidity pool.', layman: 'Like ants gathering around a sugar cube. More ants = more sugar for the anteater.', color: '#f59e0b' },
              { step: 'Step 2: Price Approaches', desc: 'Price moves toward the level. Retail traders feel confident — "see, support is holding!" They add more positions. More positions = more stops = even MORE liquidity.', layman: 'The ants see the sugar cube and tell their friends. The crowd grows. The anteater is watching.', color: '#0ea5e9' },
              { step: 'Step 3: The Sweep', desc: 'Price SPIKES past the level — breaking support/resistance. All those stop losses trigger simultaneously. A cascade of sell orders (for a bearish sweep below support) or buy orders (for a bullish sweep above resistance) floods the market.', layman: 'The anteater strikes. SNAP! All the ants get swept up in one move. In trading terms: every stop loss below support becomes a sell order that the institution BUYS from.', color: '#ef4444' },
              { step: 'Step 4: The Rejection', desc: 'Price immediately starts moving back. The candle that swept has a LONG WICK — meaning price went past the level but couldn\'t hold there. This wick is the visual proof that the sweep happened.', layman: 'Like dipping your hand in hot water and pulling back. The long wick IS the hand-pull-back — you touched the heat (grabbed the liquidity) and withdrew immediately.', color: '#f59e0b' },
              { step: 'Step 5: The Real Move', desc: 'With the institution now loaded up with positions (filled by all those triggered stops), price moves in the OPPOSITE direction of the sweep — often violently. This is the real move. The sweep was just the entry mechanism.', layman: 'The anteater is full. Now it walks away. In market terms: the institution got their fill, and now price moves in their intended direction — fast and far.', color: '#22c55e' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl glass-card" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                <h3 className="font-bold text-white text-sm mb-1">{item.step}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.desc}</p>
                <div className="p-2.5 rounded-lg bg-primary-500/5 border border-primary-500/10"><p className="text-[10px] text-gray-300">💡 <strong className="text-primary-400">In plain English:</strong> {item.layman}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 02 — INDUCEMENT */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Inducement</p>
          <h2 className="text-2xl font-extrabold mb-4">The Bait on the Hook</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">If sweeps are the trap, inducement is what LURES you into the trap. It&apos;s the small, tempting move that makes retail traders commit before the real move happens in the opposite direction.</p>

          <FishingAnimation />

          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl glass-card border-l-4 border-amber-400">
              <h3 className="font-bold text-white mb-2">What Inducement Looks Like</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">In an uptrend, inducement is a small pullback that looks like a &quot;buying opportunity.&quot; Retail buys the dip and places stops below. But the pullback was engineered — it&apos;s bait. The institution needs those new stop losses to become sell-side liquidity for their REAL entry.</p>
              <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">In plain English:</strong> Imagine a fisherman. He doesn&apos;t just throw a bare hook in the water — he puts a juicy worm on it. The &quot;buying opportunity&quot; pullback is the worm. Retail traders are the fish that bite. Once enough fish (traders) have committed, the fisherman reels them in (sweeps their stops).</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border-l-4 border-red-400">
              <h3 className="font-bold text-white mb-2">How Inducement Creates Liquidity</h3>
              <p className="text-sm text-gray-400 leading-relaxed">The inducement move creates FRESH liquidity that didn&apos;t exist before. Before the pullback, there might have been 500 stop losses below. After the pullback (which looked like a &quot;higher low&quot;), there are now 2,000 stop losses below because new buyers entered. The institution just tripled their liquidity pool using a fake pullback.</p>
            </div>

            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15">
              <p className="text-sm text-gray-300 leading-relaxed">🎯 <strong className="text-primary-400">How to spot inducement:</strong> Look for a small, clean pullback that looks &quot;too perfect&quot; — an ideal entry that almost seems gift-wrapped. If it feels too good to be true, it probably is inducement. Especially if it happens just before a session transition (London/New York open).</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 03 — 3 CONFIRMATIONS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — How to Confirm a Sweep</p>
          <h2 className="text-2xl font-extrabold mb-4">3 Signs It&apos;s Real (Not Random)</h2>
          <p className="text-sm text-gray-400 mb-6">Not every spike past a level is a sweep. You need confirmation. Tap each sign for the full breakdown.</p>

          <div className="space-y-3">
            {confirmations.map((c, i) => {
              const isOpen = activeConfirm === i;
              return (
                <motion.div key={i} layout className="rounded-2xl glass-card overflow-hidden" style={{ borderLeftWidth: '3px', borderLeftColor: i === 0 ? '#f59e0b' : i === 1 ? '#0ea5e9' : '#a855f7' }}>
                  <button onClick={() => setActiveConfirm(isOpen ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2"><span className="text-xl">{c.icon}</span><h3 className="font-bold text-white text-sm">{c.title}</h3></div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3">
                          <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                          <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15"><p className="text-xs text-gray-300 leading-relaxed">💡 <strong className="text-primary-400">In plain English:</strong> {c.layman}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-sm text-gray-300 leading-relaxed">⚠️ <strong className="text-amber-400">All three matter.</strong> One sign = maybe. Two signs = probably. All three = high probability. Never trade a &quot;sweep&quot; that only has one confirmation. The more boxes you can check, the better the setup.</p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 04 — WHERE SWEEPS HAPPEN */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Sweep Hunting Grounds</p>
          <h2 className="text-2xl font-extrabold mb-4">5 Places Sweeps Happen Most</h2>
          <p className="text-sm text-gray-400 mb-6">If you know WHERE sweeps are likely to happen, you can set up BEFORE they trigger. These are the most common targets.</p>

          <div className="space-y-3">
            {sweepLocations.map((loc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl glass-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-sm">{loc.location}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">{loc.frequency}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{loc.why}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 05 — HOW TO TRADE SWEEPS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Trading the Sweep</p>
          <h2 className="text-2xl font-extrabold mb-4">From Recognition to Execution</h2>
          <p className="text-sm text-gray-400 mb-6">Now the actionable part. Here&apos;s the step-by-step process for trading a bullish sweep (SSL sweep → buy).</p>

          <div className="space-y-3">
            {[
              { step: '1. Identify the Liquidity', desc: 'On your HTF (Daily/4H), mark where liquidity is building. Equal lows, swing lows, previous day low. This is your TARGET — where price is likely headed.', color: '#f59e0b' },
              { step: '2. Wait for the Sweep', desc: 'Price reaches the liquidity level and spikes PAST it. You see the wick go below the level. Your heart says "it broke!" Your training says "that\'s the sweep."', color: '#ef4444' },
              { step: '3. Confirm on the LTF', desc: 'Drop to the 15m or 5m chart. Look for a bullish CHoCH or BOS — structure shifting from bearish to bullish. This confirms the sweep is done and reversal is starting.', color: '#0ea5e9' },
              { step: '4. Enter After Confirmation', desc: 'Once the LTF shows bullish structure, enter long. Your entry is AFTER the sweep, not during it. You don\'t catch the exact bottom — you catch the confirmed reversal.', color: '#22c55e' },
              { step: '5. Stop Below the Sweep Wick', desc: 'Your stop loss goes below the LOWEST point of the sweep wick. If that level gets taken out, the sweep failed and it\'s a genuine breakdown. Risk: tiny (just below the wick). Reward: the entire move in the new direction.', color: '#a855f7' },
              { step: '6. Target the Opposing Liquidity', desc: 'Your take-profit is the BSL on the other side — the equal highs or swing high above. The institution swept SSL to buy; they\'ll likely push price toward BSL next. SSL → BSL = the full measured move.', color: '#f59e0b' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl glass-card flex items-start gap-3" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: item.color + '20', color: item.color }}>{i + 1}</div>
                <div><h3 className="font-bold text-white text-sm mb-1">{item.step}</h3><p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 06 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Identify the Sweep</p>
          <h2 className="text-2xl font-extrabold mb-2">What Type of Sweep Is This?</h2>
          <p className="text-sm text-gray-400 mb-6">5 charts. The red circle marks the key event. Identify what happened.</p>

          {!gameComplete ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
                <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)} correct</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-accent-500 transition-all" style={{ width: `${((gameRound + (gameAnswers[gameRound] !== null ? 1 : 0)) / 5) * 100}%` }} />
              </div>

              <SweepChart prices={gameData[gameRound].prices} sweepIdx={gameData[gameRound].sweepIdx} />

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
              <p className="text-sm text-gray-400 mb-4">{gameScore === 5 ? '🏆 You can read sweeps like a book.' : gameScore >= 3 ? 'Your sweep recognition is sharpening.' : 'Review the anatomy and confirmation sections.'}</p>
              <button onClick={resetGame} className="px-6 py-2.5 rounded-xl glass text-xs text-gray-300 font-medium hover:text-white transition">Try Again</button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* SECTION 07 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Sweeps & Inducement Quiz</h2>
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
            <p className="text-sm text-gray-400">{score === 100 ? '🏆 You see the trap before it snaps.' : score >= 66 ? 'Solid sweep identification.' : 'Review the anatomy and confirmation signs.'}</p>
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30">🪤</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.4: Liquidity Sweeps & Inducement</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-primary-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Sweep Trader —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.5 — Order Blocks</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
