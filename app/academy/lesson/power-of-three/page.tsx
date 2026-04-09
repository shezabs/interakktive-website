// app/academy/lesson/power-of-three/page.tsx
// ATLAS Academy — Lesson 3.11: Power of Three [PRO]
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
// THREE ACTS ANIMATION — accumulate, manipulate, distribute
// ============================================================
function ThreeActsAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const cycle = (f % 540) / 540;
    const phase = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;
    const midX = w / 2;

    // Draw price path showing all three phases
    const pts: [number, number][] = [];
    const phases = [
      { start: 0, end: 0.3, desc: 'range' },
      { start: 0.3, end: 0.45, desc: 'sweep' },
      { start: 0.45, end: 1, desc: 'trend' },
    ];
    const totalPts = 80;
    const baseY = h * 0.5;
    const rangeH = h * 0.08;
    const sweepDepth = h * 0.18;
    const trendHeight = h * 0.4;
    const rand = seededRandom(42);

    for (let i = 0; i < totalPts; i++) {
      const t = i / (totalPts - 1);
      let y: number;
      if (t < 0.3) {
        // Accumulation: tight range
        y = baseY + (rand() - 0.5) * rangeH * 2;
      } else if (t < 0.45) {
        // Manipulation: sweep below range
        const mt = (t - 0.3) / 0.15;
        if (mt < 0.5) {
          y = baseY + sweepDepth * (mt / 0.5);
        } else {
          y = baseY + sweepDepth * (1 - (mt - 0.5) / 0.5);
        }
        y += (rand() - 0.5) * rangeH;
      } else {
        // Distribution: strong trend up
        const dt = (t - 0.45) / 0.55;
        y = baseY - trendHeight * dt + (rand() - 0.5) * rangeH * 1.5;
      }
      pts.push([30 + (w - 60) * t, y]);
    }

    // Phase zones
    const zoneData = [
      { startT: 0, endT: 0.3, color: '#a855f7', label: 'ACCUMULATION', alpha: 0.08 },
      { startT: 0.3, endT: 0.45, color: '#ef4444', label: 'MANIPULATION', alpha: 0.08 },
      { startT: 0.45, endT: 1, color: '#22c55e', label: 'DISTRIBUTION', alpha: 0.08 },
    ];

    zoneData.forEach((z, i) => {
      const x1 = 30 + (w - 60) * z.startT;
      const x2 = 30 + (w - 60) * z.endT;
      const isActive = i === phase;
      const r = parseInt(z.color.slice(1, 3), 16);
      const g = parseInt(z.color.slice(3, 5), 16);
      const b = parseInt(z.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${isActive ? 0.12 + Math.sin(f * 0.05) * 0.03 : z.alpha})`;
      ctx.fillRect(x1, 25, x2 - x1, h - 55);
      ctx.strokeStyle = `rgba(${r},${g},${b},${isActive ? 0.5 : 0.15})`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, 25); ctx.lineTo(x1, h - 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${isActive ? 'bold 10' : '8'}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillStyle = isActive ? z.color : `rgba(${r},${g},${b},0.4)`;
      ctx.fillText(z.label, (x1 + x2) / 2, 18);
    });

    // Price line — progressive reveal based on cycle
    const revealPts = Math.floor(totalPts * Math.min(1, cycle * 1.3));
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(revealPts, pts.length - 1); i++) {
      i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    // Range lines during accumulation
    if (cycle > 0.05) {
      const rangeTop = baseY - rangeH;
      const rangeBot = baseY + rangeH;
      const rangeEnd = 30 + (w - 60) * 0.3;
      ctx.strokeStyle = 'rgba(168,85,247,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(30, rangeTop); ctx.lineTo(rangeEnd, rangeTop);
      ctx.moveTo(30, rangeBot); ctx.lineTo(rangeEnd, rangeBot);
      ctx.stroke();
      ctx.setLineDash([]);
      if (phase === 0) {
        ctx.font = '8px system-ui';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'right';
        ctx.fillText('Range High', rangeEnd - 5, rangeTop - 4);
        ctx.fillText('Range Low', rangeEnd - 5, rangeBot + 10);
      }
    }

    // Sweep marker
    if (cycle > 0.35) {
      const sweepX = 30 + (w - 60) * 0.375;
      const sweepY = baseY + sweepDepth;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(sweepX, sweepY, 4, 0, Math.PI * 2);
      ctx.fill();
      if (phase >= 1) {
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('SWEEP!', sweepX, sweepY + 14);
      }
    }

    // Bottom labels
    const labels = ['Phase 1: Building the range quietly', 'Phase 2: The fake move &mdash; grabbing liquidity', 'Phase 3: The REAL move &mdash; the trend'];
    const colors = ['#a855f7', '#ef4444', '#22c55e'];
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors[phase];
    ctx.fillText(phase === 0 ? 'Phase 1: Building the range quietly' : phase === 1 ? 'Phase 2: The fake move \u2014 grabbing liquidity' : 'Phase 3: The REAL move \u2014 the trend', midX, h - 10);

    // Phase dots
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === phase ? '#f59e0b' : 'rgba(148,163,184,0.3)';
      ctx.beginPath();
      ctx.arc(midX - 15 + i * 15, h - 25, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// HEIST ANIMATION — the 3-step robbery analogy
// ============================================================
function HeistAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const cycle = (f % 360) / 360;
    const phase = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;
    const midY = h / 2;
    const boxW = w * 0.28;
    const boxH = h * 0.55;
    const gap = (w - boxW * 3) / 4;

    const steps = [
      { x: gap, emoji: '\uD83D\uDC64', title: 'CASE THE JOINT', sub: 'Study the target quietly', color: '#a855f7', detail: '(Build the range)' },
      { x: gap * 2 + boxW, emoji: '\uD83D\uDEA8', title: 'CREATE A DIVERSION', sub: 'Make everyone look the wrong way', color: '#ef4444', detail: '(Sweep liquidity)' },
      { x: gap * 3 + boxW * 2, emoji: '\uD83D\uDCB0', title: 'TAKE THE MONEY', sub: 'Execute the real plan', color: '#22c55e', detail: '(Trend move)' },
    ];

    steps.forEach((s, i) => {
      const y = (h - boxH) / 2;
      const isActive = i === phase;
      const pulse = isActive ? 0.15 + Math.sin(f * 0.06) * 0.04 : 0.05;
      const r = parseInt(s.color.slice(1, 3), 16);
      const g = parseInt(s.color.slice(3, 5), 16);
      const b = parseInt(s.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`;
      ctx.fillRect(s.x, y, boxW, boxH);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(s.x, y, boxW, boxH);

      ctx.textAlign = 'center';
      ctx.font = '22px system-ui';
      ctx.fillStyle = '#fff';
      ctx.fillText(s.emoji, s.x + boxW / 2, y + boxH * 0.25);
      ctx.font = `bold ${isActive ? 10 : 9}px system-ui`;
      ctx.fillStyle = s.color;
      ctx.fillText(s.title, s.x + boxW / 2, y + boxH * 0.48);
      ctx.font = '8px system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(s.sub, s.x + boxW / 2, y + boxH * 0.62);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(s.detail, s.x + boxW / 2, y + boxH * 0.76);
    });

    // Arrows
    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
      const fromX = steps[i].x + boxW + 4;
      const toX = steps[i + 1].x - 4;
      ctx.beginPath();
      ctx.moveTo(fromX, midY); ctx.lineTo(toX - 6, midY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(148,163,184,0.4)';
      ctx.beginPath();
      ctx.moveTo(toX, midY); ctx.lineTo(toX - 8, midY - 4); ctx.lineTo(toX - 8, midY + 4);
      ctx.fill();
    }

    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('THE POWER OF THREE \u2014 Every session. Every day. The same heist.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// MULTI-SESSION ANIMATION — PO3 repeating across sessions
// ============================================================
function MultiSessionAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const progress = Math.min(1, (f % 300) / 240);

    // Three mini PO3 cycles side by side
    const sessions = [
      { name: 'Asian PO3', color: '#a855f7', startX: 0.02, endX: 0.32 },
      { name: 'London PO3', color: '#3b82f6', startX: 0.34, endX: 0.64 },
      { name: 'New York PO3', color: '#22c55e', startX: 0.66, endX: 0.98 },
    ];
    const pad = 25;
    const chartH = h - pad * 2 - 20;

    sessions.forEach((sess, si) => {
      const x1 = pad + (w - pad * 2) * sess.startX;
      const x2 = pad + (w - pad * 2) * sess.endX;
      const segW = x2 - x1;
      const r = parseInt(sess.color.slice(1, 3), 16);
      const g = parseInt(sess.color.slice(3, 5), 16);
      const b = parseInt(sess.color.slice(5, 7), 16);

      // Background
      ctx.fillStyle = `rgba(${r},${g},${b},0.04)`;
      ctx.fillRect(x1, pad, segW, chartH);

      // Session label
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = sess.color;
      ctx.fillText(sess.name, x1 + segW / 2, pad - 6);

      // Mini PO3 price line
      const baseP = pad + chartH * 0.6;
      const rand = seededRandom(42 + si * 100);
      const pts: [number, number][] = [];
      const localPts = 30;
      for (let i = 0; i < localPts; i++) {
        const t = i / (localPts - 1);
        let y: number;
        if (t < 0.3) {
          y = baseP + (rand() - 0.5) * chartH * 0.08;
        } else if (t < 0.45) {
          const mt = (t - 0.3) / 0.15;
          y = baseP + chartH * 0.15 * Math.sin(mt * Math.PI) + (rand() - 0.5) * chartH * 0.04;
        } else {
          const dt = (t - 0.45) / 0.55;
          y = baseP - chartH * 0.4 * dt + (rand() - 0.5) * chartH * 0.06;
        }
        pts.push([x1 + segW * t, y]);
      }
      const visiblePts = Math.floor(localPts * progress);
      ctx.strokeStyle = sess.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
        i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();

      // Phase labels inside
      if (progress > 0.6) {
        ctx.font = '7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
        ctx.fillText('A', x1 + segW * 0.15, pad + chartH + 12);
        ctx.fillText('M', x1 + segW * 0.375, pad + chartH + 12);
        ctx.fillText('D', x1 + segW * 0.72, pad + chartH + 12);
      }
    });

    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('The same A \u2192 M \u2192 D pattern repeats WITHIN every session', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// PO3 CHART COMPONENT
// ============================================================
function PO3Chart({ prices, phases }: {
  prices: number[];
  phases: { start: number; end: number; color: string; label: string }[];
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
    const W = rect.width; const H = rect.height;
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, W, H);
    const pad = 30;
    const chartW = W - pad * 2; const chartH = H - pad * 2;
    const minP = Math.min(...prices); const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toX = (i: number) => pad + (i / (prices.length - 1)) * chartW;
    const toY = (p: number) => pad + (1 - (p - minP) / rangeP) * chartH;

    phases.forEach(ph => {
      const x1 = toX(ph.start); const x2 = toX(ph.end);
      const r = parseInt(ph.color.slice(1, 3), 16);
      const g = parseInt(ph.color.slice(3, 5), 16);
      const b = parseInt(ph.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
      ctx.fillRect(x1, pad, x2 - x1, chartH);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, pad); ctx.lineTo(x1, pad + chartH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillStyle = ph.color;
      ctx.fillText(ph.label, (x1 + x2) / 2, pad - 5);
    });

    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath();
    prices.forEach((p, i) => { i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)); });
    ctx.stroke();
  }, [prices, phases]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 250 }} className="rounded-2xl" />;
}

// ============================================================
// DATA GENERATORS
// ============================================================
function genPO3(seed: number, type: 'bullish_po3' | 'bearish_po3' | 'failed_manipulation' | 'accumulation_only' | 'clear_amd'): {
  prices: number[]; phases: { start: number; end: number; color: string; label: string }[];
} {
  const rand = seededRandom(seed);
  const prices: number[] = [];
  let p = 100;
  if (type === 'bullish_po3') {
    for (let i = 0; i < 20; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 8; i++) { p += -0.5 + (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 5; i++) { p += 0.3 + (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 27; i++) { p += 0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    return { prices, phases: [
      { start: 0, end: 20, color: '#a855f7', label: 'Accumulation' },
      { start: 20, end: 33, color: '#ef4444', label: 'Manipulation' },
      { start: 33, end: 59, color: '#22c55e', label: 'Distribution' },
    ]};
  }
  if (type === 'bearish_po3') {
    for (let i = 0; i < 20; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 8; i++) { p += 0.5 + (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 5; i++) { p += -0.3 + (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 27; i++) { p += -0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    return { prices, phases: [
      { start: 0, end: 20, color: '#a855f7', label: 'Accumulation' },
      { start: 20, end: 33, color: '#ef4444', label: 'Manipulation' },
      { start: 33, end: 59, color: '#22c55e', label: 'Distribution' },
    ]};
  }
  if (type === 'failed_manipulation') {
    for (let i = 0; i < 20; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 10; i++) { p += -0.4 + (rand() - 0.5) * 0.3; prices.push(p); }
    for (let i = 0; i < 30; i++) { p += -0.3 + (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, phases: [
      { start: 0, end: 20, color: '#a855f7', label: 'Accumulation' },
      { start: 20, end: 30, color: '#ef4444', label: 'Manipulation' },
      { start: 30, end: 59, color: '#64748b', label: 'No Reversal' },
    ]};
  }
  if (type === 'accumulation_only') {
    for (let i = 0; i < 60; i++) { p += (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, phases: [
      { start: 0, end: 60, color: '#a855f7', label: 'Still Accumulating' },
    ]};
  }
  // clear_amd
  for (let i = 0; i < 18; i++) { p += (rand() - 0.5) * 0.4; prices.push(p); }
  for (let i = 0; i < 10; i++) { p += -0.45 + (rand() - 0.5) * 0.25; prices.push(p); }
  for (let i = 0; i < 4; i++) { p += 0.35 + (rand() - 0.5) * 0.2; prices.push(p); }
  for (let i = 0; i < 28; i++) { p += 0.55 + (rand() - 0.5) * 0.45; prices.push(p); }
  return { prices, phases: [
    { start: 0, end: 18, color: '#a855f7', label: 'Accumulation' },
    { start: 18, end: 32, color: '#ef4444', label: 'Manipulation' },
    { start: 32, end: 59, color: '#22c55e', label: 'Distribution' },
  ]};
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PowerOfThreeLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [expandedTF, setExpandedTF] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);
  const [expandedCombo, setExpandedCombo] = useState<number | null>(null);

  // Interactive chart
  const [chartSeed, setChartSeed] = useState(42);
  const demoData = useMemo(() => genPO3(chartSeed, 'bullish_po3'), [chartSeed]);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { seed: 111, type: 'bullish_po3' as const, correct: 2, label: 'Bullish PO3',
      q: 'Price ranged, then swept below the range and reversed sharply upward. What phase are we in?',
      opts: ['Still accumulating \u2014 the range continues', 'Manipulation just started \u2014 wait for confirmation', 'Distribution \u2014 the real bullish move has begun after the manipulation', 'This is random \u2014 no PO3 pattern here'],
      explain: 'The range (accumulation) set the stage. The sweep below (manipulation) grabbed the liquidity. Now the sharp reversal upward is the distribution phase \u2014 the REAL move. This is textbook bullish PO3. Enter long with your stop below the manipulation low.' },
    { seed: 222, type: 'bearish_po3' as const, correct: 1, label: 'Bearish PO3',
      q: 'Price ranged during Asian, then spiked ABOVE the range at London open before reversing down aggressively. What is this?',
      opts: ['A bullish breakout \u2014 buy the dip', 'Bearish PO3 \u2014 the spike above was manipulation, the real move is down', 'Failed breakout \u2014 wait for the next session', 'No pattern \u2014 just volatility'],
      explain: 'This is bearish PO3. Accumulation (Asian range) \u2192 Manipulation (spike above to grab buy-side liquidity and breakout entries) \u2192 Distribution (the real move down). The spike above was the diversion. The drop is the heist. Short after the reversal confirms below the range.' },
    { seed: 333, type: 'failed_manipulation' as const, correct: 0, label: 'Failed PO3',
      q: 'Price ranged, then swept below the range. But instead of reversing, it kept going down. What happened?',
      opts: ['The manipulation became the real move \u2014 the PO3 failed. The sweep was genuine selling, not a trap.', 'This is still manipulation \u2014 the reversal will come', 'Buy the dip \u2014 price is cheap', 'The PO3 is just delayed'],
      explain: 'Not every sweep is manipulation. Sometimes the move below the range IS the distribution \u2014 just in the opposite direction to what you expected. When the sweep doesn\u0027t reverse within a few candles, the PO3 model has failed for this session. Accept it and move on.' },
    { seed: 444, type: 'accumulation_only' as const, correct: 3, label: 'Extended Accumulation',
      q: 'Price has been ranging for the entire session with no sweep or breakout. What should you do?',
      opts: ['Buy at the top of the range', 'Sell at the bottom of the range', 'Force a trade \u2014 something has to happen', 'Wait \u2014 the accumulation phase is still building. No manipulation = no trade yet.'],
      explain: 'Sometimes the accumulation phase extends through an entire session. No manipulation has occurred, so there is no PO3 setup. Forcing a trade here is gambling, not trading. The manipulation might come at the next session open. Patience is the trade.' },
    { seed: 555, type: 'clear_amd' as const, correct: 2, label: 'Textbook A-M-D',
      q: 'You see a clear range, then a sweep below, then a sharp reversal with a BOS. Where do you enter?',
      opts: ['At the top of the accumulation range', 'During the manipulation sweep \u2014 catch the exact bottom', 'After the BOS confirms the reversal \u2014 on the first pullback into the OTE zone', 'After the distribution move is finished'],
      explain: 'The textbook PO3 entry is AFTER the manipulation reversal is confirmed by a Break of Structure (BOS). Then you wait for the first pullback into the OTE zone (61.8\u201378.6%). This combines PO3 timing (Lesson 3.11) with OTE precision (Lesson 3.8). Stop below the manipulation low. Target the opposing liquidity.' },
  ], []);

  const currentGame = gameScenarios[gameRound];
  const currentGameData = useMemo(() => genPO3(currentGame.seed, currentGame.type), [currentGame.seed, currentGame.type]);

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What does "Power of Three" refer to?', opts: ['Three candlestick patterns', 'Three phases: Accumulation, Manipulation, Distribution', 'Three trading sessions', 'Three types of order blocks'], a: 1, explain: 'The Power of Three describes the three repeating phases of institutional price delivery: Accumulation (building the range), Manipulation (the fake move to grab liquidity), and Distribution (the real directional move).' },
    { q: 'What happens during the Accumulation phase?', opts: ['Price trends strongly', 'Price ranges tightly \u2014 institutions are building positions and liquidity builds above and below', 'Price makes a sharp reversal', 'Nothing \u2014 the market is closed'], a: 1, explain: 'During accumulation, price ranges. Institutions are quietly filling their orders while retail stop losses and breakout entries build up above and below the range. These levels become the manipulation targets.' },
    { q: 'What is the purpose of the Manipulation phase?', opts: ['To confirm the trend', 'To grab liquidity by sweeping the accumulation range, trapping retail traders', 'To distribute profits', 'To close the session'], a: 1, explain: 'Manipulation is the fake move \u2014 the diversion. Institutions sweep the range high or low to trigger stop losses and breakout entries. These triggered orders provide the liquidity institutions need to fill their real positions in the opposite direction.' },
    { q: 'In a bullish PO3, the manipulation phase sweeps which level?', opts: ['The range high (buy-side liquidity)', 'The range low (sell-side liquidity)', 'Both levels equally', 'Neither \u2014 it breaks to new territory'], a: 1, explain: 'In a bullish PO3, manipulation sweeps the range LOW \u2014 grabbing sell-side liquidity (stop losses from longs, entries from breakout shorts). These sell orders become the institution\u0027s buy entry. Then the real move goes UP (distribution).' },
    { q: 'Which analogy best describes the Power of Three?', opts: ['A football match', 'A heist: case the joint, create a diversion, take the money', 'A recipe with three ingredients', 'A three-round boxing match'], a: 1, explain: 'The heist analogy captures PO3 perfectly: Accumulation = casing the joint (studying the target quietly). Manipulation = creating a diversion (making everyone look the wrong way). Distribution = taking the money (executing the real plan while everyone is distracted).' },
    { q: 'PO3 occurs on which timeframes?', opts: ['Only the daily chart', 'Only during London session', 'All timeframes \u2014 from 1-minute candles to monthly charts', 'Only on forex pairs'], a: 2, explain: 'PO3 is fractal \u2014 it occurs on every timeframe. A 5-minute chart shows PO3 within a single session. A daily chart shows PO3 over days. A weekly chart shows PO3 over weeks. The pattern is the same; only the scale changes.' },
    { q: 'If the manipulation sweep does NOT reverse, what should you do?', opts: ['Hold your position \u2014 the reversal is coming', 'Double down \u2014 buy more', 'Accept the PO3 failed \u2014 the sweep was genuine, not a trap. Move on.', 'Switch to a lower timeframe'], a: 2, explain: 'A failed PO3 means the sweep was real selling (or buying), not a manipulation trap. If the reversal doesn\u0027t come within a few candles after the sweep, the model has failed. Accept the loss and wait for the next setup.' },
    { q: 'How does PO3 combine with Kill Zones (Lesson 3.10)?', opts: ['They are unrelated', 'PO3 accumulation happens during Asian, manipulation at London open, distribution through the overlap', 'Kill Zones replace PO3', 'PO3 only works outside Kill Zones'], a: 1, explain: 'PO3 and Kill Zones are two views of the same phenomenon. Asian session = accumulation (building the range). London open = manipulation (sweeping Asian liquidity). London trend through NY overlap = distribution (the real move). This is why marking Asian H/L is so powerful \u2014 they are the accumulation boundaries.' },
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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 11</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-purple-400 via-red-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Power of Three</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Accumulate. Manipulate. Distribute. The three-act play that institutions repeat every session, every day, on every timeframe.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#127911; Every heist follows the same script.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Step 1: Case the joint &mdash; study the target, learn the layout. Step 2: Create a diversion &mdash; set off a fire alarm so everyone runs the wrong way. Step 3: Take the money &mdash; walk in through the back door while everyone is distracted.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Institutional trading follows the <strong className="text-white">exact same three steps</strong>, every single session, every single day. They call it the <strong className="text-amber-400">Power of Three</strong> &mdash; or <strong className="text-amber-400">AMD</strong> (Accumulate, Manipulate, Distribute).</p>
            <p className="text-gray-400 leading-relaxed">Once you see this pattern, you can&apos;t unsee it. Every &quot;random&quot; spike, every &quot;unexpected&quot; reversal, every &quot;confusing&quot; range suddenly makes sense. <strong className="text-white">The market isn&apos;t random. It&apos;s a heist that runs on a schedule.</strong></p>
          </div>
          <ThreeActsAnimation />
          <div className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-bold text-amber-400 mb-2">&#127911; REAL SCENARIO</p>
            <p className="text-sm text-gray-300 leading-relaxed">XAUUSD (Gold) on a Tuesday. Asian session ranges between $2,340&ndash;$2,348 (accumulation). At 07:15 UTC, London open drives price to $2,335 &mdash; sweeping the Asian low by $5 (manipulation). Within 20 minutes, a bullish engulfing forms and BOS confirms. Price then rallies to $2,372 by the NY overlap (distribution). <em className="text-amber-400">$37 move from the manipulation low. The heist worked perfectly.</em></p>
          </div>
        </motion.div>
      </section>

      {/* S01 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">Accumulation &rarr; Manipulation &rarr; Distribution</h2>
          <p className="text-sm text-gray-400 mb-6">Tap each phase to understand exactly what institutions are doing and how to identify it.</p>
        </motion.div>
        {[
          { name: 'Accumulation', emoji: '&#128100;', color: '#a855f7', role: 'BUILD THE RANGE',
            body: 'Price moves sideways in a tight range. Volume is low. Nothing seems to be happening. But beneath the surface, institutions are quietly placing their orders &mdash; buying and selling in small amounts to avoid moving the price. They NEED this range to exist because it creates two things: (1) liquidity pools above and below (stop losses and breakout entries), and (2) a defined area where they can fill their massive orders without anyone noticing.',
            analogy: 'A spider building a web. It looks like nothing is happening, but every thread is placed with precision. The flies (retail traders) don&apos;t see the web until they&apos;re stuck in it.',
            identify: 'Tight price range, low volume, often during Asian session. Multiple touches of the same high and low. The longer the accumulation, the bigger the subsequent move.' },
          { name: 'Manipulation', emoji: '&#128680;', color: '#ef4444', role: 'THE FAKE MOVE',
            body: 'Price BREAKS out of the range &mdash; but in the WRONG direction. If the real move will be bullish, manipulation sweeps the low. If bearish, it sweeps the high. This is NOT a real breakout. It is a deliberate move to trigger stop losses and activate breakout entries. Those triggered orders provide the liquidity institutions need to fill their real position. The sweep is usually fast, aggressive, and often has a long wick.',
            analogy: 'A fire alarm in a museum. Everyone runs for the exit (stop losses get triggered). While they&apos;re panicking, the thieves walk in through the back door (institutions fill their real orders using the triggered liquidity).',
            identify: 'Sharp move beyond the accumulation range. Often happens at session open (London KZ). Look for: long wick, immediate reversal, volume spike. The sweep is usually 5&ndash;15 pips beyond the range in forex.' },
          { name: 'Distribution', emoji: '&#128176;', color: '#22c55e', role: 'THE REAL MOVE',
            body: 'After manipulation, price reverses and moves strongly in the TRUE direction. This is the largest and most powerful phase &mdash; often producing 60&ndash;80% of the session&apos;s total range. Institutions have their positions filled from the manipulation liquidity. Now they let price run. The trend often continues through the London&ndash;NY overlap before fading in late New York.',
            analogy: 'The getaway car. The heist is complete. The diversion worked. Now the thieves drive away with the money at full speed. This is the move you want to be in.',
            identify: 'Strong directional move AFTER the manipulation reversal. Confirmed by BOS or CHoCH on the LTF. This is where you enter &mdash; ideally on a pullback to the OTE zone within the distribution phase.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedPhase(expandedPhase === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" dangerouslySetInnerHTML={{ __html: item.emoji }} />
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.role}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedPhase === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedPhase === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.body}</p>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-amber-400 text-xs font-bold mb-1">&#128161; Analogy</p><p className="text-gray-400 text-sm">{item.analogy}</p></div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5"><p className="text-white text-xs font-bold mb-1">How to Identify</p><p className="text-gray-400 text-sm">{item.identify}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S02 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Heist Model</p>
          <h2 className="text-2xl font-extrabold mb-4">Why the Heist Analogy Works</h2>
          <p className="text-sm text-gray-400 mb-6">The Power of Three isn&apos;t just a pattern &mdash; it&apos;s an institutional STRATEGY. They need to fill massive orders without moving the price against themselves. The three phases solve this problem.</p>
          <HeistAnimation />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-sm text-gray-400 leading-relaxed">&#128161; <strong className="text-amber-400">The key insight:</strong> Retail traders think the manipulation IS the move. They panic sell at the sweep low or FOMO buy at the sweep high. Smart money uses that panic as their entry. <strong className="text-white">The manipulation exists to fund the distribution.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S03 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; PO3 Across Timeframes</p>
          <h2 className="text-2xl font-extrabold mb-4">Fractal &mdash; It Happens Everywhere</h2>
          <p className="text-sm text-gray-400 mb-6">PO3 isn&apos;t limited to one timeframe. The same three-act play repeats within every session, every day, every week.</p>
          <MultiSessionAnimation />
        </motion.div>
        {[
          { tf: '5-Minute', desc: 'PO3 within a single Kill Zone window. Accumulation = first 15 minutes. Manipulation = the sweep candle. Distribution = the 30&ndash;60 minute trend.', color: '#a855f7' },
          { tf: '1-Hour', desc: 'PO3 within a full session. Asian accumulation, London manipulation, NY distribution. The &quot;classic&quot; PO3 that most traders learn first.', color: '#3b82f6' },
          { tf: 'Daily', desc: 'PO3 over multiple days. Monday&ndash;Tuesday accumulation, Wednesday manipulation (mid-week reversal), Thursday&ndash;Friday distribution.', color: '#22c55e' },
          { tf: 'Weekly', desc: 'PO3 over weeks. Multi-week consolidation (accumulation), false breakout (manipulation), multi-week trend (distribution).', color: '#f59e0b' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedTF(expandedTF === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.tf}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedTF === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedTF === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S04 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Interactive PO3 Chart</p>
          <h2 className="text-2xl font-extrabold mb-2">See the Three Phases</h2>
          <p className="text-sm text-gray-400 mb-4">Each phase is colour-coded on the chart. Tap &quot;Randomise&quot; to see different variations of the same bullish PO3 pattern.</p>
        </motion.div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setChartSeed(s => s + 1)} className="px-4 py-2 rounded-lg text-xs font-bold glass text-amber-400 hover:bg-white/5 transition-all">&#128256; Randomise</button>
        </div>
        <PO3Chart prices={demoData.prices} phases={demoData.phases} />
        <div className="flex gap-2 mt-3">
          {[{ label: 'Accumulation', color: '#a855f7' }, { label: 'Manipulation', color: '#ef4444' }, { label: 'Distribution', color: '#22c55e' }].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400"><div className="w-3 h-3 rounded" style={{ backgroundColor: l.color + '30', border: `1px solid ${l.color}` }} />{l.label}</div>
          ))}
        </div>
      </section>

      {/* S05 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; PO3 + SMC Confluence</p>
          <h2 className="text-2xl font-extrabold mb-4">Combining PO3 with Everything You&apos;ve Learned</h2>
        </motion.div>
        {[
          { title: 'PO3 + Kill Zones (3.10)', color: '#3b82f6', body: 'PO3 maps directly onto sessions: Asian = Accumulation, London open = Manipulation, London trend/NY = Distribution. This is the highest-probability daily model.', grade: 'A+' },
          { title: 'PO3 + Liquidity Sweep (3.3&ndash;3.4)', color: '#ef4444', body: 'The manipulation phase IS a liquidity sweep. Mark Asian H/L. The sweep of either level is your manipulation. The reversal is your distribution entry signal.', grade: 'A+' },
          { title: 'PO3 + OTE (3.8)', color: '#f59e0b', body: 'After manipulation reverses and distribution begins, wait for the first pullback within the distribution phase. Enter at the OTE zone (61.8&ndash;78.6%) of the distribution impulse.', grade: 'A' },
          { title: 'PO3 + Order Block (3.5)', color: '#a855f7', body: 'Look for OBs formed during the accumulation phase. When price returns to these OBs during the distribution pullback, they provide the highest-probability entries.', grade: 'A' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedCombo(expandedCombo === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{item.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: item.color + '15' }}>{item.grade}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCombo === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedCombo === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.body }} /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S06 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; How to Trade PO3</p>
          <h2 className="text-2xl font-extrabold mb-4">The 6-Step PO3 Execution</h2>
        </motion.div>
        {[
          { step: 1, title: 'Mark the Accumulation Range', color: '#a855f7', text: 'Identify the session range (usually Asian). Mark the high and low. These are your manipulation targets.' },
          { step: 2, title: 'Wait for the Manipulation Sweep', color: '#ef4444', text: 'Wait for price to break beyond the range. Do NOT enter on the breakout. That IS the trap. Watch for a sweep below the low (bullish PO3) or above the high (bearish PO3).' },
          { step: 3, title: 'Confirm the Reversal', color: '#22c55e', text: 'After the sweep, drop to LTF. Look for a BOS or CHoCH confirming the reversal back into the range. This is your green light.' },
          { step: 4, title: 'Enter on the First Pullback', color: '#f59e0b', text: 'After the BOS, wait for the first pullback. Enter at the OTE zone (61.8&ndash;78.6%) of the first impulse within the distribution phase.' },
          { step: 5, title: 'Stop Below Manipulation Low', color: '#ef4444', text: 'Your stop goes below the manipulation sweep wick. If price returns below this level, the PO3 has failed.' },
          { step: 6, title: 'Target Opposing Liquidity', color: '#22c55e', text: 'Your take profit is the opposing liquidity: if manipulation swept the low, target the range high and beyond. The distribution should carry price past the accumulation range.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.step}</div>
            <div className="flex-1"><p className="text-white font-bold text-sm mb-1">{item.title}</p><p className="text-gray-400 text-sm leading-relaxed">{item.text}</p></div>
          </div>
        ))}
      </section>

      {/* S07 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; When PO3 Fails</p>
          <h2 className="text-2xl font-extrabold mb-4">Recognising a Failed PO3</h2>
          <p className="text-sm text-gray-400 mb-6">Not every session produces a clean PO3. Here&apos;s how to know when the model has broken down:</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border-l-4 border-red-500 bg-red-500/5">
              <p className="text-red-400 font-bold text-sm">No Reversal After Sweep</p>
              <p className="text-gray-400 text-sm mt-1">If the manipulation sweep continues in the same direction without reversing within 3&ndash;5 candles on your execution TF, the &quot;manipulation&quot; was actually the real move. The PO3 failed. Do not hold hoping for a late reversal.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
              <p className="text-amber-400 font-bold text-sm">Extended Accumulation (No Sweep)</p>
              <p className="text-gray-400 text-sm mt-1">Sometimes the accumulation phase lasts the entire session. If London closes without sweeping the Asian range, no PO3 formed. The setup might appear at the next session open instead.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
              <p className="text-blue-400 font-bold text-sm">News-Driven Moves</p>
              <p className="text-gray-400 text-sm mt-1">Major news events (NFP, CPI, FOMC) can override the PO3 model. Price may skip accumulation entirely and go straight to a massive directional move. Avoid PO3 trades around high-impact news.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S08 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">PO3 Mistakes</h2>
        </motion.div>
        {[
          { title: 'Trading the Manipulation as a Breakout', wrong: 'Buying when price breaks above the range during manipulation.', right: 'The breakout IS the trap. Wait for the reversal. The real move is in the opposite direction.', tip: 'If a breakout happens at a session open, assume it is manipulation until proven otherwise.' },
          { title: 'Entering Before Reversal Confirmation', wrong: 'Trying to catch the exact bottom of the manipulation sweep.', right: 'Wait for a BOS/CHoCH on the LTF confirming the reversal. Missing 10% of the move is better than catching a falling knife.', tip: 'The confirmation costs you a few pips. Not having it costs you your account.' },
          { title: 'Forcing PO3 on Every Session', wrong: 'Seeing PO3 in every chart because you want to trade.', right: 'Some sessions are purely ranging (extended accumulation). Some have no clear manipulation. If the pattern isn&apos;t obvious, it doesn&apos;t exist. Wait for the next one.', tip: 'PO3 should be OBVIOUS. If you have to squint to see it, it is not there.' },
          { title: 'Ignoring HTF Context', wrong: 'Trading bullish PO3 on the 15M when the Daily is clearly bearish.', right: 'PO3 must align with the HTF trend. A bullish PO3 in a Daily downtrend is a counter-trend trap.', tip: 'Check the Daily bias BEFORE looking for intraday PO3 setups.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedMistake(expandedMistake === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-white text-sm font-semibold">{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMistake === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedMistake === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-red-400 text-xs font-bold mb-1">&#10060; Wrong</p><p className="text-gray-400 text-sm">{item.wrong}</p></div>
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-green-400 text-xs font-bold mb-1">&#10003; Right</p><p className="text-gray-400 text-sm">{item.right}</p></div>
                    <p className="text-amber-400 text-sm">&#128161; {item.tip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S09 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Read the Phase</p>
          <h2 className="text-2xl font-extrabold mb-2">Power of Three Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios. Identify the phase and the correct action.</p>
        </motion.div>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</span>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <PO3Chart prices={currentGameData.prices} phases={currentGameData.phases} />
            <p className="text-gray-300 text-sm mt-4 mb-4">{currentGame.q}</p>
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#127911; Perfect! You see the heist every time.' : gameScore >= 3 ? 'Solid PO3 awareness.' : 'Review the three phases and the heist model.'}</p>
          </motion.div>
        )}
      </section>

      {/* S10 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Power of Three Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#127911; You see the heist. Every time. Unstoppable.' : score >= 66 ? 'Solid PO3 mastery. Ready for SMC Trade Models.' : 'Review the three phases and the execution steps.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 via-red-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">&#127911;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.11: Power of Three</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-purple-400 via-red-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Heist Reader &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.12 &mdash; SMC Trade Models</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
