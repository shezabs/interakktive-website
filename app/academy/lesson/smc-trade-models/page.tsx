// app/academy/lesson/smc-trade-models/page.tsx
// ATLAS Academy — Lesson 3.12: SMC Trade Models [PRO]
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
// MODEL 1 ANIMATION — Liquidity Sweep → MSS → OB Entry
// ============================================================
function Model1Animation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const progress = Math.min(1, (f % 420) / 360);
    const pad = 30;

    // Phase zones
    const zones = [
      { start: 0, end: 0.25, color: '#a855f7', label: 'Range' },
      { start: 0.25, end: 0.4, color: '#ef4444', label: 'Sweep' },
      { start: 0.4, end: 0.5, color: '#f59e0b', label: 'MSS' },
      { start: 0.5, end: 0.65, color: '#3b82f6', label: 'OB Entry' },
      { start: 0.65, end: 1, color: '#22c55e', label: 'Target' },
    ];

    zones.forEach(z => {
      const x1 = pad + (w - pad * 2) * z.start;
      const x2 = pad + (w - pad * 2) * z.end;
      const r = parseInt(z.color.slice(1, 3), 16);
      const g = parseInt(z.color.slice(3, 5), 16);
      const b = parseInt(z.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},0.04)`;
      ctx.fillRect(x1, 20, x2 - x1, h - 45);
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.fillText(z.label, (x1 + x2) / 2, 15);
    });

    // Price data
    const rand = seededRandom(77);
    const pts: [number, number][] = [];
    const baseY = h * 0.45;
    const total = 70;
    for (let i = 0; i < total; i++) {
      const t = i / (total - 1);
      let y: number;
      if (t < 0.25) { y = baseY + (rand() - 0.5) * h * 0.06; }
      else if (t < 0.35) { const mt = (t - 0.25) / 0.1; y = baseY + h * 0.22 * mt + (rand() - 0.5) * h * 0.03; }
      else if (t < 0.42) { const mt = (t - 0.35) / 0.07; y = baseY + h * 0.22 - h * 0.15 * mt + (rand() - 0.5) * h * 0.03; }
      else if (t < 0.52) { const mt = (t - 0.42) / 0.1; y = baseY + h * 0.07 + h * 0.08 * mt + (rand() - 0.5) * h * 0.02; }
      else if (t < 0.62) { const mt = (t - 0.52) / 0.1; y = baseY + h * 0.15 - h * 0.1 * mt + (rand() - 0.5) * h * 0.02; }
      else { const dt = (t - 0.62) / 0.38; y = baseY + h * 0.05 - h * 0.35 * dt + (rand() - 0.5) * h * 0.04; }
      pts.push([pad + (w - pad * 2) * t, y]);
    }

    const visiblePts = Math.floor(total * progress);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
      i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    // Range lines
    const rangeTop = baseY - h * 0.04;
    const rangeBot = baseY + h * 0.04;
    ctx.strokeStyle = 'rgba(168,85,247,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    const rangeEnd = pad + (w - pad * 2) * 0.25;
    ctx.beginPath();
    ctx.moveTo(pad, rangeTop); ctx.lineTo(rangeEnd, rangeTop);
    ctx.moveTo(pad, rangeBot); ctx.lineTo(rangeEnd, rangeBot);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sweep marker
    if (progress > 0.35) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pts[Math.floor(total * 0.35)][0], pts[Math.floor(total * 0.35)][1], 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SWEEP', pts[Math.floor(total * 0.35)][0], pts[Math.floor(total * 0.35)][1] + 13);
    }

    // MSS marker
    if (progress > 0.45) {
      ctx.fillStyle = '#f59e0b';
      const mssIdx = Math.floor(total * 0.45);
      ctx.beginPath();
      ctx.arc(pts[mssIdx][0], pts[mssIdx][1], 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8px system-ui';
      ctx.fillText('MSS', pts[mssIdx][0], pts[mssIdx][1] - 8);
    }

    // OB zone
    if (progress > 0.55) {
      const obX1 = pad + (w - pad * 2) * 0.52;
      const obX2 = pad + (w - pad * 2) * 0.62;
      const obY1 = baseY + h * 0.1;
      const obY2 = baseY + h * 0.17;
      ctx.fillStyle = 'rgba(59,130,246,0.1)';
      ctx.fillRect(obX1, obY1, obX2 - obX1, obY2 - obY1);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(obX1, obY1, obX2 - obX1, obY2 - obY1);
      ctx.setLineDash([]);
      ctx.font = 'bold 8px system-ui';
      ctx.fillStyle = '#3b82f6';
      ctx.textAlign = 'center';
      ctx.fillText('OB ENTRY', (obX1 + obX2) / 2, obY2 + 12);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc((obX1 + obX2) / 2, (obY1 + obY2) / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom label
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('MODEL 1: Liquidity Sweep \u2192 MSS \u2192 OB Entry \u2192 Target', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// MODEL 2 ANIMATION — HTF OB → LTF BOS → OTE Entry
// ============================================================
function Model2Animation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const progress = Math.min(1, (f % 420) / 360);

    // Split screen: HTF left, LTF right
    const halfW = w / 2 - 8;
    const pad = 20;

    // Divider
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, h - 25);
    ctx.stroke();

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('HTF (4H) \u2014 The Map', halfW / 2 + pad, 14);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('LTF (15M) \u2014 The Entry', w / 2 + halfW / 2 + 8, 14);

    // HTF: uptrend with OB marked
    const rand1 = seededRandom(42);
    const htfPts: [number, number][] = [];
    let p1 = h * 0.75;
    for (let i = 0; i < 30; i++) {
      p1 += -0.6 - (rand1() - 0.5) * 1.5;
      htfPts.push([pad + (halfW - pad) * (i / 29), Math.max(25, Math.min(h - 30, p1))]);
    }
    const visHtf = Math.floor(30 * Math.min(1, progress * 1.5));
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(visHtf, htfPts.length - 1); i++) {
      i === 0 ? ctx.moveTo(htfPts[i][0], htfPts[i][1]) : ctx.lineTo(htfPts[i][0], htfPts[i][1]);
    }
    ctx.stroke();

    // HTF OB zone
    if (progress > 0.3) {
      const obY1 = h * 0.42;
      const obY2 = h * 0.52;
      ctx.fillStyle = 'rgba(59,130,246,0.1)';
      ctx.fillRect(pad, obY1, halfW - pad, obY2 - obY1);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(pad, obY1, halfW - pad, obY2 - obY1);
      ctx.setLineDash([]);
      ctx.font = 'bold 8px system-ui';
      ctx.fillStyle = '#3b82f6';
      ctx.textAlign = 'left';
      ctx.fillText('HTF OB', pad + 3, obY1 - 3);
    }

    // LTF: price enters OB, forms BOS, pullback to OTE, continuation
    const rand2 = seededRandom(99);
    const ltfPts: [number, number][] = [];
    const ltfBase = w / 2 + 8;
    let p2 = h * 0.3;
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      if (t < 0.3) { p2 += 0.4 + (rand2() - 0.5) * 0.8; }
      else if (t < 0.5) { p2 += -0.2 + (rand2() - 0.5) * 0.5; }
      else if (t < 0.65) { p2 += -0.5 + (rand2() - 0.5) * 0.4; }
      else { p2 += -0.55 + (rand2() - 0.5) * 0.5; }
      ltfPts.push([ltfBase + (halfW - pad) * t, Math.max(25, Math.min(h - 30, p2 + h * 0.15))]);
    }
    const visLtf = Math.floor(40 * progress);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(visLtf, ltfPts.length - 1); i++) {
      i === 0 ? ctx.moveTo(ltfPts[i][0], ltfPts[i][1]) : ctx.lineTo(ltfPts[i][0], ltfPts[i][1]);
    }
    ctx.stroke();

    // LTF BOS marker
    if (progress > 0.55) {
      const bosIdx = Math.floor(40 * 0.5);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ltfPts[bosIdx][0], ltfPts[bosIdx][1], 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('BOS', ltfPts[bosIdx][0], ltfPts[bosIdx][1] - 8);
    }

    // LTF OTE zone
    if (progress > 0.65) {
      const oteY1 = h * 0.45;
      const oteY2 = h * 0.55;
      ctx.fillStyle = 'rgba(245,158,11,0.08)';
      ctx.fillRect(ltfBase + (halfW - pad) * 0.55, oteY1, (halfW - pad) * 0.15, oteY2 - oteY1);
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(ltfBase + (halfW - pad) * 0.55, oteY1, (halfW - pad) * 0.15, oteY2 - oteY1);
      ctx.setLineDash([]);
      ctx.font = 'bold 7px system-ui';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('OTE', ltfBase + (halfW - pad) * 0.625, (oteY1 + oteY2) / 2 + 3);

      // Entry dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(ltfBase + (halfW - pad) * 0.62, (oteY1 + oteY2) / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 7px system-ui';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('ENTRY', ltfBase + (halfW - pad) * 0.62, oteY1 - 5);
    }

    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('MODEL 2: HTF OB \u2192 LTF BOS \u2192 OTE Entry \u2192 Target', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// TRADE CHART COMPONENT
// ============================================================
function TradeChart({ prices, markers }: {
  prices: number[];
  markers?: { idx: number; label: string; color: string }[];
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
    const pad = 30; const chartW = W - pad * 2; const chartH = H - pad * 2;
    const minP = Math.min(...prices); const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toX = (i: number) => pad + (i / (prices.length - 1)) * chartW;
    const toY = (p: number) => pad + (1 - (p - minP) / rangeP) * chartH;

    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath();
    prices.forEach((p, i) => { i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)); });
    ctx.stroke();

    markers?.forEach(m => {
      if (m.idx < prices.length) {
        const mx = toX(m.idx); const my = toY(prices[m.idx]);
        ctx.fillStyle = m.color;
        ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(m.label, mx, my - 10);
      }
    });
  }, [prices, markers]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 250 }} className="rounded-2xl" />;
}

// ============================================================
// SCENARIO GENERATOR
// ============================================================
function genModelScenario(seed: number, type: 'model1_bull' | 'model1_bear' | 'model2_bull' | 'model2_bear' | 'no_setup'): {
  prices: number[]; markers: { idx: number; label: string; color: string }[];
} {
  const rand = seededRandom(seed);
  const prices: number[] = [];
  let p = 100;
  if (type === 'model1_bull') {
    for (let i = 0; i < 15; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 8; i++) { p += -0.6 + (rand() - 0.5) * 0.3; prices.push(p); }
    const sweepIdx = prices.length - 1;
    for (let i = 0; i < 5; i++) { p += 0.7 + (rand() - 0.5) * 0.3; prices.push(p); }
    const mssIdx = prices.length - 1;
    for (let i = 0; i < 6; i++) { p += -0.2 + (rand() - 0.5) * 0.3; prices.push(p); }
    const entryIdx = prices.length - 1;
    for (let i = 0; i < 20; i++) { p += 0.5 + (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, markers: [
      { idx: sweepIdx, label: 'SWEEP', color: '#ef4444' },
      { idx: mssIdx, label: 'MSS', color: '#f59e0b' },
      { idx: entryIdx, label: 'ENTRY', color: '#22c55e' },
    ]};
  }
  if (type === 'model1_bear') {
    for (let i = 0; i < 15; i++) { p += (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 8; i++) { p += 0.6 + (rand() - 0.5) * 0.3; prices.push(p); }
    const sweepIdx = prices.length - 1;
    for (let i = 0; i < 5; i++) { p += -0.7 + (rand() - 0.5) * 0.3; prices.push(p); }
    const mssIdx = prices.length - 1;
    for (let i = 0; i < 6; i++) { p += 0.2 + (rand() - 0.5) * 0.3; prices.push(p); }
    const entryIdx = prices.length - 1;
    for (let i = 0; i < 20; i++) { p += -0.5 + (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, markers: [
      { idx: sweepIdx, label: 'SWEEP', color: '#ef4444' },
      { idx: mssIdx, label: 'MSS', color: '#f59e0b' },
      { idx: entryIdx, label: 'ENTRY', color: '#22c55e' },
    ]};
  }
  if (type === 'model2_bull') {
    for (let i = 0; i < 10; i++) { p += -0.3 + (rand() - 0.5) * 0.8; prices.push(p); }
    for (let i = 0; i < 20; i++) { p += 0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 12; i++) { p += -0.35 + (rand() - 0.5) * 0.3; prices.push(p); }
    const entryIdx = prices.length - 1;
    for (let i = 0; i < 18; i++) { p += 0.55 + (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, markers: [{ idx: entryIdx, label: 'OTE ENTRY', color: '#22c55e' }] };
  }
  if (type === 'model2_bear') {
    for (let i = 0; i < 10; i++) { p += 0.3 + (rand() - 0.5) * 0.8; prices.push(p); }
    for (let i = 0; i < 20; i++) { p += -0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    for (let i = 0; i < 12; i++) { p += 0.35 + (rand() - 0.5) * 0.3; prices.push(p); }
    const entryIdx = prices.length - 1;
    for (let i = 0; i < 18; i++) { p += -0.55 + (rand() - 0.5) * 0.4; prices.push(p); }
    return { prices, markers: [{ idx: entryIdx, label: 'OTE ENTRY', color: '#ef4444' }] };
  }
  // no_setup — choppy, no clear model
  for (let i = 0; i < 60; i++) { p += (rand() - 0.5) * 0.7; prices.push(p); }
  return { prices, markers: [] };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SMCTradeModelsLesson() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [expandedM1Step, setExpandedM1Step] = useState<number | null>(null);
  const [expandedM2Step, setExpandedM2Step] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);
  const [expandedCompare, setExpandedCompare] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { seed: 111, type: 'model1_bull' as const, correct: 0, label: 'Bullish Sweep Setup',
      q: 'Price ranged, swept below, reversed with a BOS, and now pulled back to an OB. Which model is this?',
      opts: ['Model 1 \u2014 Liquidity Sweep \u2192 MSS \u2192 OB Entry', 'Model 2 \u2014 HTF OB \u2192 LTF BOS \u2192 OTE', 'No valid model \u2014 skip this trade', 'Both models apply equally'],
      explain: 'This is textbook Model 1. The sequence is: range (accumulation) \u2192 sweep below (manipulation) \u2192 Market Structure Shift confirming reversal \u2192 pullback to the OB formed during the sweep \u2192 entry. Stop below the sweep low. Target the opposing liquidity (range high and beyond).' },
    { seed: 222, type: 'model2_bull' as const, correct: 1, label: 'HTF OB Continuation',
      q: 'On the 4H chart, price is in an uptrend and has pulled back to an OB in the OTE zone. On the 15M, a BOS just confirmed. Which model?',
      opts: ['Model 1 \u2014 Liquidity Sweep model', 'Model 2 \u2014 HTF OB \u2192 LTF BOS \u2192 OTE Entry', 'Neither \u2014 wait for a sweep first', 'A breaker block trade'],
      explain: 'This is Model 2. The HTF (4H) shows the trend and the OB. Price pulled back to the OB which sits in the OTE zone (61.8\u201378.6%). The LTF (15M) confirmed the bounce with a BOS. Enter on the LTF confirmation with stop below the HTF OB. Target the HTF swing high.' },
    { seed: 333, type: 'model1_bear' as const, correct: 2, label: 'Bearish Sweep',
      q: 'London open spiked above the Asian high (sweeping buy-side liquidity), then reversed with a CHoCH below the range. Where do you enter?',
      opts: ['Buy the dip \u2014 price is coming back to the range', 'Short immediately at the current price', 'Wait for a pullback to the OB formed near the sweep high, then short with LTF confirmation', 'This is not a valid setup'],
      explain: 'This is bearish Model 1. The sweep grabbed buy-side liquidity above the Asian high. The CHoCH confirms the reversal. Now you wait for the pullback to the bearish OB (the last green candle before the reversal). Enter short at the OB with LTF confirmation (engulfing, BOS). Stop above the sweep high. Target the sell-side liquidity below the Asian low.' },
    { seed: 444, type: 'no_setup' as const, correct: 3, label: 'No Setup',
      q: 'Price has been chopping sideways with no clear sweep, no BOS, and no HTF OB nearby. What should you do?',
      opts: ['Use Model 1 \u2014 the sweep will come eventually', 'Use Model 2 \u2014 force an OTE entry', 'Find a setup on a lower timeframe', 'No valid model applies \u2014 wait. Not every session produces a trade.'],
      explain: 'There is no setup here. No sweep has occurred (no manipulation), no BOS or MSS has formed (no confirmation), and no HTF OB is nearby (no institutional level). Forcing a trade here is gambling. The best trade is sometimes no trade. Wait for the next Kill Zone or the next session.' },
    { seed: 555, type: 'model2_bear' as const, correct: 1, label: 'Bearish OTE Continuation',
      q: 'The Daily chart shows a clear downtrend. Price retraced to a bearish OB at the 68% Fib level. On the 1H, a CHoCH just printed. What is the setup?',
      opts: ['Buy \u2014 the pullback means the trend is reversing', 'Model 2 short \u2014 HTF OB in OTE + LTF CHoCH confirms the sell', 'Wait for a sweep before entering', 'Model 1 \u2014 this is a liquidity sweep'],
      explain: 'This is bearish Model 2. Daily downtrend provides the bias. The bearish OB sits in the OTE zone (68% = deep inside the 61.8\u201378.6% zone). The 1H CHoCH confirms the rejection. Enter short with stop above the OB. Target the Daily swing low. This is the highest-probability continuation setup in SMC.' },
  ], []);

  const currentGame = gameScenarios[gameRound];
  const currentGameData = useMemo(() => genModelScenario(currentGame.seed, currentGame.type), [currentGame.seed, currentGame.type]);

  // Quiz
  const quizQuestions = useMemo(() => [
    { q: 'What is the core sequence of Model 1 (Liquidity Sweep Model)?', opts: ['OB \u2192 BOS \u2192 OTE', 'Sweep \u2192 MSS/BOS \u2192 OB Entry \u2192 Target opposing liquidity', 'Trend \u2192 Pullback \u2192 Entry', 'Range \u2192 Breakout \u2192 Continuation'], a: 1, explain: 'Model 1 follows: Liquidity Sweep (manipulation grabs stops) \u2192 Market Structure Shift (confirms the reversal is real) \u2192 Pullback to the OB formed during the sweep \u2192 Entry \u2192 Target the opposing liquidity pool.' },
    { q: 'What is the core sequence of Model 2 (OTE Continuation Model)?', opts: ['Sweep \u2192 Reversal \u2192 Target', 'HTF trend + HTF OB in OTE zone \u2192 LTF BOS confirms \u2192 Enter on LTF', 'Buy low, sell high', 'Wait for news, then trade the spike'], a: 1, explain: 'Model 2 follows: Identify HTF trend direction \u2192 Find HTF OB sitting in the OTE zone (61.8\u201378.6%) \u2192 Wait for price to reach the OB \u2192 Drop to LTF and wait for BOS/CHoCH confirmation \u2192 Enter with tight stop.' },
    { q: 'When should you use Model 1 vs Model 2?', opts: ['Model 1 only for forex, Model 2 for crypto', 'Model 1 for reversal setups (after sweeps), Model 2 for continuation setups (with-trend pullbacks)', 'They are interchangeable', 'Model 1 for beginners, Model 2 for advanced'], a: 1, explain: 'Model 1 is a REVERSAL model \u2014 it catches the turn after manipulation. Model 2 is a CONTINUATION model \u2014 it enters pullbacks within an established trend. Different market conditions call for different models.' },
    { q: 'In Model 1, where does your stop loss go?', opts: ['At the entry price', 'Below/above the sweep wick (the manipulation extreme)', '50 pips away', 'At the 50% level'], a: 1, explain: 'The stop goes beyond the sweep wick. If it was a bullish sweep below the range, your stop goes below the lowest point of the sweep. If price returns below that level, the manipulation was actually a real move and the model failed.' },
    { q: 'In Model 2, what role does the LTF play?', opts: ['The LTF determines the overall bias', 'The LTF provides the timing/entry confirmation (BOS/CHoCH) after the HTF provides the level', 'The LTF is optional', 'The LTF is more important than the HTF'], a: 1, explain: 'The HTF gives you the WHAT (the OB level and trend direction). The LTF gives you the WHEN (the BOS/CHoCH that confirms price is respecting the HTF level). Together: HTF = strategy, LTF = execution.' },
    { q: 'What is the target for a Model 1 bullish trade?', opts: ['The entry price plus 50 pips', 'The opposing liquidity \u2014 buy-side liquidity above the accumulation range', 'The 50% Fibonacci level', 'The next support level'], a: 1, explain: 'In Model 1, the target is the OPPOSING liquidity. If you entered long after a sell-side sweep (below range), your target is the buy-side liquidity (above the range). The manipulation grabbed one pool; the distribution targets the other.' },
    { q: 'What should you do if neither model presents a clear setup?', opts: ['Force Model 1 on any chart', 'Trade based on gut feeling', 'Lower the timeframe until you find something', 'Wait \u2014 no setup means no trade. Patience is the trade.'], a: 3, explain: 'Not every session produces a valid setup. If you can\u0027t clearly identify the sweep (Model 1) or the HTF OB in OTE (Model 2), there is no trade. Forcing a trade without a model is gambling. The next Kill Zone will provide another opportunity.' },
    { q: 'Which SMC concepts from earlier lessons are combined in these models?', opts: ['Only Order Blocks', 'Only Fibonacci', 'Liquidity, OBs, FVGs, OTE, BOS/CHoCH, Kill Zones, PO3 \u2014 everything from Level 3', 'Support and resistance only'], a: 2, explain: 'These trade models are the culmination of EVERY concept in Level 3: Liquidity (3.3\u20133.4), Market Structure (3.2), Order Blocks (3.5), FVGs (3.6), Premium/Discount (3.7), OTE (3.8), Breakers (3.9), Kill Zones (3.10), and Power of Three (3.11). Each model chains them into a complete, executable strategy.' },
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
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 &middot; Lesson 12</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>SMC Trade<br/>Models</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">Two complete trade models that chain every SMC concept into executable, repeatable strategies. This is where knowledge becomes money.</p>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-lg font-bold text-white mb-3">&#128736; You&apos;ve learned 11 tools. Now let&apos;s build two machines.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Knowing what a hammer, saw, and nail are is useless if you can&apos;t build a house. You now know liquidity, order blocks, FVGs, OTE, breakers, kill zones, and PO3. Each is a powerful tool. But <strong className="text-white">tools don&apos;t make money &mdash; strategies do.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">This lesson gives you <strong className="text-amber-400">two complete, battle-tested trade models</strong> that chain every SMC concept into a step-by-step execution plan. Model 1 catches reversals. Model 2 catches continuations. Together, they cover 90% of all high-probability SMC setups.</p>
            <p className="text-gray-400 leading-relaxed">After this lesson, you won&apos;t wonder &quot;what do I do now?&quot; when you open a chart. You&apos;ll know exactly which model applies, where to enter, where to put your stop, and where to take profit.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — MODEL 1 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Model 1: The Reversal</p>
          <h2 className="text-2xl font-extrabold mb-4">Liquidity Sweep &rarr; MSS &rarr; OB Entry</h2>
          <p className="text-sm text-gray-400 mb-6">The most powerful reversal model in SMC. It catches the turn after institutional manipulation. This is the &quot;heist&quot; from Lesson 3.11 turned into a step-by-step trade plan.</p>
          <Model1Animation />
        </motion.div>
        <div className="mt-6 space-y-1">
          {[
            { step: '1. Identify the Range', color: '#a855f7', detail: 'Mark the accumulation zone &mdash; usually the Asian session range. Note the high and low. These are the liquidity targets. (Lesson 3.3: Liquidity + Lesson 3.10: Kill Zones)' },
            { step: '2. Wait for the Sweep', color: '#ef4444', detail: 'Price must break BEYOND the range high or low. This is the manipulation &mdash; a deliberate move to trigger stops and fill institutional orders. Do NOT enter on this move. (Lesson 3.4: Liquidity Sweeps)' },
            { step: '3. Confirm the MSS/BOS', color: '#f59e0b', detail: 'After the sweep, look for a Market Structure Shift or Break of Structure back in the opposite direction. This confirms the sweep was manipulation, not a real breakout. (Lesson 3.2: Market Structure)' },
            { step: '4. Identify the OB', color: '#3b82f6', detail: 'Find the Order Block formed during the reversal &mdash; the last opposite-colour candle before the BOS. If it sits in the OTE zone (61.8&ndash;78.6%), even better. (Lesson 3.5: Order Blocks + Lesson 3.8: OTE)' },
            { step: '5. Enter at the OB', color: '#22c55e', detail: 'Set a limit order at the OB, or wait for LTF confirmation (engulfing, BOS) within the OB zone. This is your entry.' },
            { step: '6. Stop Below Sweep', color: '#ef4444', detail: 'Stop loss goes below the manipulation sweep wick (bullish) or above it (bearish). If price returns beyond the sweep, the model failed.' },
            { step: '7. Target Opposing Liquidity', color: '#22c55e', detail: 'If you entered long after a sell-side sweep, target the buy-side liquidity (above the range). The distance from sweep to opposing liquidity defines your R:R. (Lesson 3.3: Liquidity)' },
          ].map((item, i) => (
            <div key={i} className="mb-1">
              <button onClick={() => setExpandedM1Step(expandedM1Step === i ? null : i)} className="w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.step}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedM1Step === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedM1Step === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 mx-2 mb-1 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.detail }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* S02 — MODEL 2 */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Model 2: The Continuation</p>
          <h2 className="text-2xl font-extrabold mb-4">HTF OB &rarr; LTF BOS &rarr; OTE Entry</h2>
          <p className="text-sm text-gray-400 mb-6">The trend-following model. It enters with-trend pullbacks at institutional levels with precision timing. This is how you ride the big moves.</p>
          <Model2Animation />
        </motion.div>
        <div className="mt-6 space-y-1">
          {[
            { step: '1. Identify HTF Trend', color: '#f59e0b', detail: 'Check the Daily or 4H chart. Is there a clear uptrend (HH/HL) or downtrend (LH/LL)? If the trend is unclear, Model 2 does not apply. (Lesson 3.2: Market Structure + Lesson 2.11: Multi-Timeframe)' },
            { step: '2. Find HTF OB in OTE', color: '#3b82f6', detail: 'Locate an Order Block on the HTF that sits in the OTE zone (61.8&ndash;78.6% of the last impulse). An OB + OTE overlap is A-grade minimum. Add an FVG for A+. (Lesson 3.5 + 3.8)' },
            { step: '3. Wait for Price to Reach the OB', color: '#a855f7', detail: 'Patience. Price must pull back to the HTF OB. This might take hours or days. If it never reaches, there is no trade &mdash; and that is fine.' },
            { step: '4. Drop to LTF for Confirmation', color: '#22c55e', detail: 'Once price touches the HTF OB, switch to 15M or 5M. Look for a BOS or CHoCH confirming the bounce. This is the trigger. Without it, the OB might fail. (Lesson 3.2: Market Structure)' },
            { step: '5. Enter After LTF Confirmation', color: '#22c55e', detail: 'Enter at the LTF BOS or on the first pullback after BOS within the OB zone. This gives you the best risk:reward &mdash; tight stop, wide target.' },
            { step: '6. Stop Below HTF OB', color: '#ef4444', detail: 'Stop goes beyond the HTF OB zone. If the OB fails (candle body closes through), the model is invalidated.' },
            { step: '7. Target HTF Swing Point', color: '#22c55e', detail: 'Target the previous HTF swing high (uptrend) or swing low (downtrend). The HTF trend is your friend &mdash; let it carry the trade.' },
          ].map((item, i) => (
            <div key={i} className="mb-1">
              <button onClick={() => setExpandedM2Step(expandedM2Step === i ? null : i)} className="w-full text-left p-3 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.step}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedM2Step === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedM2Step === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 mx-2 mb-1 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.detail }} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* S03 — COMPARISON */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Model Comparison</p>
          <h2 className="text-2xl font-extrabold mb-4">Model 1 vs Model 2 &mdash; When to Use Which</h2>
        </motion.div>
        <div className="overflow-x-auto mb-6">
          <div className="min-w-[480px] glass rounded-2xl overflow-hidden text-xs">
            {[
              { aspect: '', m1: 'Model 1: Reversal', m2: 'Model 2: Continuation' },
              { aspect: 'Type', m1: 'Catches the TURN after manipulation', m2: 'Catches WITH-TREND pullbacks' },
              { aspect: 'Trigger', m1: 'Liquidity sweep + MSS', m2: 'HTF OB in OTE + LTF BOS' },
              { aspect: 'Best Session', m1: 'London open (KZ manipulation)', m2: 'Any KZ with established trend' },
              { aspect: 'Typical R:R', m1: '1:3 to 1:8', m2: '1:3 to 1:5' },
              { aspect: 'Win Rate', m1: 'Lower (~45%) but massive R:R', m2: 'Higher (~55%) with solid R:R' },
              { aspect: 'Difficulty', m1: 'Harder \u2014 requires sweep identification', m2: 'Easier \u2014 trend is already visible' },
              { aspect: 'Best For', m1: 'Intraday reversals, London open', m2: 'Swing trades, with-trend entries' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-0 ${i === 0 ? 'bg-amber-500/5 font-bold text-amber-400' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                <div className="p-2.5 border-r border-white/5 text-gray-400 font-semibold">{row.aspect}</div>
                <div className="p-2.5 border-r border-white/5 text-red-400">{row.m1}</div>
                <div className="p-2.5 text-green-400">{row.m2}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'Use Model 1 when\u2026', color: '#ef4444', body: 'You see a clear liquidity sweep at a session open (especially London KZ). Price breaks beyond the range, then reverses. You want to catch the reversal EARLY. Best for day traders who trade London open setups.' },
          { title: 'Use Model 2 when\u2026', color: '#22c55e', body: 'There is a clear trend on the HTF with an OB sitting in the OTE zone. You want to enter with the trend on a pullback. Best for swing traders and position traders who want higher probability.' },
          { title: 'Use NEITHER when\u2026', color: '#64748b', body: 'Price is choppy with no clear range (no Model 1 setup) and no clear trend (no Model 2 setup). Or it is the dead zone. Or a major news event is about to drop. In these cases, the best model is NO model. Wait.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedCompare(expandedCompare === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: item.color }}>{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCompare === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedCompare === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5"><p className="text-gray-300 text-sm leading-relaxed">{item.body}</p></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S04 — REAL TRADE WALKTHROUGHS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Real Trade Walkthroughs</p>
          <h2 className="text-2xl font-extrabold mb-4">Two Complete Trades &mdash; Step by Step</h2>
          <p className="text-sm text-gray-400 mb-6">Let&apos;s walk through one trade for each model exactly as it would happen in real time.</p>
          <div className="p-5 rounded-2xl border-l-4 border-red-500 bg-red-500/5 mb-4">
            <p className="text-red-400 font-bold text-sm mb-2">Model 1 Walkthrough &mdash; EUR/USD London Open</p>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p><strong className="text-white">06:50 UTC:</strong> Asian range marked: 1.0880 (high) &ndash; 1.0862 (low). Equal lows visible at 1.0862. HTF Daily bias: bullish (HH/HL structure). SSL sitting below 1.0860.</p>
              <p><strong className="text-white">07:08 UTC:</strong> London opens. Price spikes to 1.0855 &mdash; sweeping the Asian low and SSL by 7 pips. Long wick forms on the 15M.</p>
              <p><strong className="text-white">07:25 UTC:</strong> 15M prints a bullish engulfing. BOS confirms above 1.0868. MSS confirmed.</p>
              <p><strong className="text-white">07:40 UTC:</strong> Price pulls back to 1.0865 &mdash; the OB formed during the sweep. This OB sits at the 70.5% OTE level. Entry: 1.0865.</p>
              <p><strong className="text-white">Stop:</strong> Below sweep wick at 1.0852. <strong className="text-white">Risk:</strong> 13 pips.</p>
              <p><strong className="text-white">Target:</strong> BSL above Asian high at 1.0885, then 1.0900 (next HTF liquidity). <strong className="text-white">Reward:</strong> 20&ndash;35 pips. <strong className="text-amber-400">R:R: 1:1.5 to 1:2.7.</strong></p>
              <p><strong className="text-white">14:30 UTC:</strong> Price reaches 1.0903 during the overlap. Close full position. <strong className="text-amber-400">+38 pips. 1:2.9 R:R.</strong></p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border-l-4 border-green-500 bg-green-500/5">
            <p className="text-green-400 font-bold text-sm mb-2">Model 2 Walkthrough &mdash; XAU/USD Swing Entry</p>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p><strong className="text-white">Daily chart:</strong> Gold in uptrend (HH/HL). Last impulse: $2,310 &rarr; $2,365. OB at $2,328&ndash;$2,335 sits at the 67% Fib level (deep inside OTE). FVG overlaps at $2,330&ndash;$2,338. A+ grade.</p>
              <p><strong className="text-white">Day 1:</strong> Price retracing from $2,365. Watching for price to reach the $2,328&ndash;$2,335 OB zone.</p>
              <p><strong className="text-white">Day 2, 08:15 UTC:</strong> Price touches $2,332 &mdash; inside the OB + OTE + FVG confluence. Drop to 1H chart.</p>
              <p><strong className="text-white">Day 2, 09:00 UTC:</strong> 1H prints bullish engulfing at $2,331. BOS confirms above $2,340 on the next candle.</p>
              <p><strong className="text-white">Entry:</strong> $2,338 (pullback after BOS). <strong className="text-white">Stop:</strong> Below OB at $2,325. <strong className="text-white">Risk:</strong> $13.</p>
              <p><strong className="text-white">Target:</strong> Previous swing high at $2,365, then $2,380 (1.618 extension). <strong className="text-white">Reward:</strong> $27&ndash;$42.</p>
              <p><strong className="text-white">Day 4:</strong> Price reaches $2,378. Close at $2,375. <strong className="text-amber-400">+$37. R:R: 1:2.8.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 — PRE-TRADE CHECKLIST */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Pre-Trade Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">Before Every Trade &mdash; 6 Checks</h2>
          <p className="text-sm text-gray-400 mb-6">Run this checklist before entering ANY trade. If any check fails, do not enter.</p>
          {[
            { check: 'Kill Zone Active?', desc: 'Am I trading during a Kill Zone window? (Lesson 3.10)', color: '#3b82f6' },
            { check: 'HTF Bias Clear?', desc: 'Does the Daily/4H show a clear trend or is price at a key level?', color: '#f59e0b' },
            { check: 'Model Identified?', desc: 'Is this a Model 1 (sweep + reversal) or Model 2 (trend + pullback)?', color: '#a855f7' },
            { check: 'Confirmation Received?', desc: 'Has a BOS, CHoCH, or engulfing confirmed the setup on the LTF?', color: '#22c55e' },
            { check: 'Risk Calculated?', desc: 'Is my stop loss defined, position size correct, and R:R at least 1:2? (Lesson 1.5 + 1.6)', color: '#ef4444' },
            { check: 'Emotional Check', desc: 'Am I calm and objective? Or am I chasing, revenge trading, or bored?', color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-6 h-6 rounded border-2 mt-0.5" style={{ borderColor: item.color + '50' }} />
              <div>
                <p className="text-sm font-bold text-white">{item.check}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* S05 — RISK MANAGEMENT */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Risk Rules for Models</p>
          <h2 className="text-2xl font-extrabold mb-4">Non-Negotiable Risk Rules</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border-l-4 border-red-500 bg-red-500/5">
              <p className="text-red-400 font-bold text-sm">1% Maximum Per Trade</p>
              <p className="text-gray-400 text-sm mt-1">Never risk more than 1% of your account on a single trade. Even A+ setups can fail. (Lesson 1.5: Risk)</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
              <p className="text-amber-400 font-bold text-sm">Minimum 1:2 R:R</p>
              <p className="text-gray-400 text-sm mt-1">If the reward isn&apos;t at least 2x the risk, skip the trade. Model 1 should offer 1:3+. Model 2 should offer 1:2.5+.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
              <p className="text-blue-400 font-bold text-sm">Maximum 2 Trades Per Session</p>
              <p className="text-gray-400 text-sm mt-1">If two setups fail in the same session, stop. Do not revenge trade. The next Kill Zone will provide fresh opportunities.</p>
            </div>
            <div className="p-4 rounded-xl border-l-4 border-green-500 bg-green-500/5">
              <p className="text-green-400 font-bold text-sm">Trail to Breakeven at 1R</p>
              <p className="text-gray-400 text-sm mt-1">Once the trade reaches 1R of profit, move your stop to breakeven. This makes the trade risk-free. Let the rest run.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S06 — COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Model Execution Mistakes</h2>
        </motion.div>
        {[
          { title: 'Using the Wrong Model', wrong: 'Applying Model 1 (reversal) when price is clearly trending. Or using Model 2 (continuation) at a session open with a clear range.', right: 'Assess the context FIRST. Range + session open = Model 1 territory. Clear trend + pullback = Model 2 territory.', tip: 'Ask: &quot;Is the market reversing or continuing?&quot; The answer picks the model.' },
          { title: 'Skipping the Confirmation', wrong: 'Entering at the OB level without waiting for LTF BOS/CHoCH.', right: 'The OB tells you WHERE. The LTF confirmation tells you WHEN. Without WHEN, you are guessing.', tip: 'Limit orders at OBs work ~55% of the time. Confirmed entries work ~70%. The extra wait is worth it.' },
          { title: 'Moving the Stop Loss', wrong: 'Giving a losing trade &quot;more room&quot; by widening the stop.', right: 'The stop is defined by the model. Model 1: below sweep. Model 2: below HTF OB. If hit, the model failed. Accept it.', tip: 'A stop hit is not a failure. It is a cost of doing business. The next trade will cover it.' },
          { title: 'Overtrading Models', wrong: 'Taking 5+ trades per day using both models.', right: 'One to two trades per Kill Zone is optimal. More than that and you are forcing setups that don&apos;t exist.', tip: 'Quality over quantity. One A+ trade per day beats five B-grade trades.' },
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

      {/* S07 — GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Pick the Model</p>
          <h2 className="text-2xl font-extrabold mb-2">Model Selection Game</h2>
          <p className="text-sm text-gray-400 mb-6">5 scenarios. Identify which model applies and what to do.</p>
        </motion.div>
        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Round {gameRound + 1} of 5</span>
              <span className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</span>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <TradeChart prices={currentGameData.prices} markers={gameAnswer !== null ? currentGameData.markers : []} />
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
            <p className="text-sm text-gray-400">{gameScore === 5 ? '&#128736; Perfect! You pick the right model every time.' : gameScore >= 3 ? 'Solid model selection.' : 'Review the two models and their comparison table.'}</p>
          </motion.div>
        )}
      </section>

      {/* S08 — QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">SMC Trade Models Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '&#128736; Perfect! You have two complete weapons in your arsenal.' : score >= 66 ? 'Solid model knowledge. Ready for PHANTOM PRO integration.' : 'Review the two models and the comparison table.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">&#128274;</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(239,68,68,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 via-amber-500 to-green-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">&#128736;</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.12: SMC Trade Models</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-green-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Model Operator &mdash;</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.13 &mdash; SMC + ATLAS PHANTOM PRO</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
