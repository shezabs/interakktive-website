// app/academy/lesson/optimal-trade-entry/page.tsx
// ATLAS Academy — Lesson 3.8: Optimal Trade Entry (OTE) [PRO]
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
// SNIPER ANIMATION — the precision zone concept
// ============================================================
function SniperAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 360) / 360;
    const midX = w / 2;

    // Draw a price swing - up then pullback
    const pts: [number, number][] = [];
    const swingLow = h * 0.8;
    const swingHigh = h * 0.15;
    const pullbackEnd = h * 0.55; // roughly 62% zone
    for (let i = 0; i < 60; i++) {
      const t = i / 59;
      let y: number;
      if (t < 0.45) { // impulsive move up
        y = swingLow + (swingHigh - swingLow) * (t / 0.45);
      } else if (t < 0.75) { // pullback
        const pt = (t - 0.45) / 0.30;
        y = swingHigh + (pullbackEnd - swingHigh) * pt;
      } else { // continuation
        const pt = (t - 0.75) / 0.25;
        y = pullbackEnd + (swingHigh * 0.7 - pullbackEnd) * pt;
      }
      pts.push([30 + (w - 60) * t, y]);
    }

    // Draw price line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // OTE zone (61.8% - 78.6%)
    const range = swingLow - swingHigh;
    const oteTop = swingHigh + range * 0.618;
    const oteBot = swingHigh + range * 0.786;
    const zonePulse = 0.08 + Math.sin(f * 0.04) * 0.04;
    ctx.fillStyle = `rgba(245,158,11,${zonePulse})`;
    ctx.fillRect(30, oteTop, w - 60, oteBot - oteTop);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(30, oteTop, w - 60, oteBot - oteTop);
    ctx.setLineDash([]);

    // Labels
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('61.8%', w - 35, oteTop - 3);
    ctx.fillText('78.6%', w - 35, oteBot + 13);

    // Sniper crosshair at the OTE zone
    const crossX = 30 + (w - 60) * 0.6;
    const crossY = (oteTop + oteBot) / 2;
    const crossSize = 18 + Math.sin(f * 0.06) * 3;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    // circle
    ctx.beginPath();
    ctx.arc(crossX, crossY, crossSize, 0, Math.PI * 2);
    ctx.stroke();
    // crosshairs
    ctx.beginPath();
    ctx.moveTo(crossX - crossSize - 6, crossY); ctx.lineTo(crossX - crossSize * 0.4, crossY);
    ctx.moveTo(crossX + crossSize * 0.4, crossY); ctx.lineTo(crossX + crossSize + 6, crossY);
    ctx.moveTo(crossX, crossY - crossSize - 6); ctx.lineTo(crossX, crossY - crossSize * 0.4);
    ctx.moveTo(crossX, crossY + crossSize * 0.4); ctx.lineTo(crossX, crossY + crossSize + 6);
    ctx.stroke();
    // center dot
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(crossX, crossY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Swing labels
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Swing Low', 35, swingLow + 15);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Swing High', 35, swingHigh - 8);

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#f59e0b';
    const titleAlpha = Math.min(1, phase * 3);
    ctx.globalAlpha = titleAlpha;
    ctx.fillText('OPTIMAL TRADE ENTRY', midX, h - 20);
    ctx.font = '11px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('The sniper zone — 61.8% to 78.6% retracement', midX, h - 5);
    ctx.globalAlpha = 1;

    // Swing High/Low dashed lines
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, swingHigh); ctx.lineTo(w - 30, swingHigh);
    ctx.moveTo(30, swingLow); ctx.lineTo(w - 30, swingLow);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// COMBO ANIMATION — OB inside OTE zone = bullseye
// ============================================================
function ComboAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const phase = (f % 300) / 300;
    const midX = w / 2;
    const midY = h / 2;

    // Outer circle = OTE zone
    const outerR = Math.min(w, h) * 0.38;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY, outerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,158,11,0.05)';
    ctx.fill();
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('OTE ZONE (61.8% – 78.6%)', midX, midY - outerR - 8);

    // Middle circle = Order Block
    const midR = outerR * 0.55;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY, midR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(59,130,246,0.06)';
    ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('ORDER BLOCK', midX, midY - midR - 6);

    // Inner circle = FVG (optional confluence)
    const innerR = midR * 0.45;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(midX, midY, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(168,85,247,0.08)';
    ctx.fill();
    ctx.fillStyle = '#a855f7';
    ctx.fillText('FVG', midX, midY - innerR - 5);

    // Pulsing bullseye at center
    const pulseR = 8 + Math.sin(f * 0.08) * 4;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(midX, midY, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('🎯', midX - 5, midY + 3);

    // Bottom label
    const fadeIn = Math.min(1, phase * 4);
    ctx.globalAlpha = fadeIn;
    ctx.font = 'bold 13px system-ui';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('OTE + OB + FVG = HIGHEST PROBABILITY ENTRY', midX, h - 18);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('"The bullseye — three layers of confirmation"', midX, h - 4);
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// BEFORE/AFTER ANIMATION — retail entry vs OTE entry
// ============================================================
function BeforeAfterAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const halfW = w / 2 - 10;
    const phase = (f % 400) / 400;

    // Divider
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 25); ctx.lineTo(w / 2, h - 25);
    ctx.stroke();

    // Left side — Retail entry (at the top, chasing)
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('❌ RETAIL ENTRY', halfW / 2 + 5, 18);

    // Draw left price line — up move then crash
    const leftPts: [number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      let y: number;
      if (t < 0.5) y = h * 0.7 - (h * 0.5) * (t / 0.5); // rally
      else y = h * 0.2 + (h * 0.6) * ((t - 0.5) / 0.5); // crash
      leftPts.push([10 + halfW * t, y]);
    }
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    leftPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // Entry arrow at the top
    const entryIdx = 19;
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px system-ui';
    ctx.fillText('BUY HERE', leftPts[entryIdx][0], leftPts[entryIdx][1] - 15);
    ctx.fillText('(FOMO at top)', leftPts[entryIdx][0], leftPts[entryIdx][1] - 4);
    // Stop loss way below
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.beginPath();
    ctx.moveTo(10, h * 0.75); ctx.lineTo(halfW, h * 0.75);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.font = '9px system-ui';
    ctx.fillText('Stop Loss (huge)', halfW / 2 + 5, h * 0.75 + 12);

    // Right side — OTE entry
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText('✓ OTE ENTRY', w / 2 + halfW / 2 + 5, 18);

    // Draw right price line — up, pullback to OTE, continuation
    const rightPts: [number, number][] = [];
    const rBase = w / 2 + 10;
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      let y: number;
      if (t < 0.35) y = h * 0.75 - (h * 0.55) * (t / 0.35); // impulsive up
      else if (t < 0.6) { // pullback to OTE (61.8%)
        const pt = (t - 0.35) / 0.25;
        y = h * 0.2 + (h * 0.35) * pt; // pulls back ~62%
      } else { // continuation
        const pt = (t - 0.6) / 0.4;
        y = h * 0.55 - (h * 0.45) * pt;
      }
      rightPts.push([rBase + halfW * t, y]);
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    rightPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // OTE zone shading
    const oteTop = h * 0.45;
    const oteBot = h * 0.58;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(rBase, oteTop, halfW, oteBot - oteTop);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(rBase, oteTop, halfW, oteBot - oteTop);
    ctx.setLineDash([]);

    // Entry at OTE
    const oteEntryIdx = 23;
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px system-ui';
    ctx.fillText('BUY HERE', rightPts[oteEntryIdx][0], rightPts[oteEntryIdx][1] + 20);
    ctx.fillText('(OTE zone)', rightPts[oteEntryIdx][0], rightPts[oteEntryIdx][1] + 31);

    // Tight stop
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.beginPath();
    ctx.moveTo(rBase, oteBot + 10); ctx.lineTo(rBase + halfW, oteBot + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.font = '9px system-ui';
    ctx.fillText('Tight Stop ✓', rBase + halfW / 2, oteBot + 22);

    // OTE label
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('OTE', rBase + halfW / 2, (oteTop + oteBot) / 2 + 3);

    // Bottom comparison
    const bottomFade = Math.min(1, phase * 3);
    ctx.globalAlpha = bottomFade;
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Same market. Different entry. Completely different result.', w / 2, h - 8);
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// PRICE CHART — for interactive demos and game
// ============================================================
function OTEChart({ prices, showOTE, showOB, showFVG, obRange, fvgRange, entryDot }: {
  prices: number[];
  showOTE?: boolean;
  showOB?: boolean;
  showFVG?: boolean;
  obRange?: [number, number];
  fvgRange?: [number, number];
  entryDot?: { idx: number; price: number };
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
    const W = rect.width;
    const H = rect.height;

    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, W, H);

    const pad = 35;
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toX = (i: number) => pad + (i / (prices.length - 1)) * chartW;
    const toY = (p: number) => pad + (1 - (p - minP) / rangeP) * chartH;

    // Find swing high and swing low for Fib
    let swingHighIdx = 0, swingLowIdx = 0;
    prices.forEach((p, i) => { if (p > prices[swingHighIdx]) swingHighIdx = i; if (p < prices[swingLowIdx]) swingLowIdx = i; });

    // Determine direction: if swing low comes first, it's a bullish swing
    const bullish = swingLowIdx < swingHighIdx;
    const fibHigh = prices[swingHighIdx];
    const fibLow = prices[swingLowIdx];
    const fibRange = fibHigh - fibLow;

    // OTE zone = 61.8% to 78.6% retracement from the impulse
    if (showOTE && fibRange > 0) {
      const oteTopPrice = bullish ? fibHigh - fibRange * 0.618 : fibLow + fibRange * 0.618;
      const oteBotPrice = bullish ? fibHigh - fibRange * 0.786 : fibLow + fibRange * 0.786;
      const oteTopY = toY(Math.max(oteTopPrice, oteBotPrice));
      const oteBotY = toY(Math.min(oteTopPrice, oteBotPrice));
      ctx.fillStyle = 'rgba(245,158,11,0.08)';
      ctx.fillRect(pad, oteTopY, chartW, oteBotY - oteTopY);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(pad, oteTopY, chartW, oteBotY - oteTopY);
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('61.8%', W - 5, oteTopY + (bullish ? -3 : 12));
      ctx.fillText('78.6%', W - 5, oteBotY + (bullish ? 12 : -3));
      ctx.textAlign = 'center';
      ctx.fillText('OTE ZONE', W / 2, (oteTopY + oteBotY) / 2 + 3);
    }

    // OB zone
    if (showOB && obRange) {
      const obTopY = toY(Math.max(obRange[0], obRange[1]));
      const obBotY = toY(Math.min(obRange[0], obRange[1]));
      ctx.fillStyle = 'rgba(59,130,246,0.1)';
      ctx.fillRect(pad, obTopY, chartW, obBotY - obTopY);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(pad, obTopY, chartW, obBotY - obTopY);
      ctx.setLineDash([]);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('OB', pad + 4, (obTopY + obBotY) / 2 + 3);
    }

    // FVG zone
    if (showFVG && fvgRange) {
      const fvgTopY = toY(Math.max(fvgRange[0], fvgRange[1]));
      const fvgBotY = toY(Math.min(fvgRange[0], fvgRange[1]));
      ctx.fillStyle = 'rgba(168,85,247,0.1)';
      ctx.fillRect(pad, fvgTopY, chartW, fvgBotY - fvgTopY);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(pad, fvgTopY, chartW, fvgBotY - fvgTopY);
      ctx.setLineDash([]);
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('FVG', W - pad - 4, (fvgTopY + fvgBotY) / 2 + 3);
    }

    // Price line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Entry dot
    if (entryDot) {
      const ex = toX(entryDot.idx);
      const ey = toY(entryDot.price);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ENTRY', ex, ey - 10);
    }

    // Swing labels
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'center';
    ctx.fillText('SH', toX(swingHighIdx), toY(fibHigh) - 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('SL', toX(swingLowIdx), toY(fibLow) + 15);

  }, [prices, showOTE, showOB, showFVG, obRange, fvgRange, entryDot]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 260 }} className="rounded-2xl" />;
}

// ============================================================
// PRICE DATA GENERATORS
// ============================================================
function genOTEScenario(seed: number, type: 'bullish_ote' | 'bearish_ote' | 'ote_ob' | 'ote_fvg_ob' | 'no_ote'): {
  prices: number[];
  obRange?: [number, number];
  fvgRange?: [number, number];
  entryIdx?: number;
  entryPrice?: number;
} {
  const rand = seededRandom(seed);
  const prices: number[] = [];
  let p = 100;

  if (type === 'bullish_ote') {
    // Down trend → impulse up → pullback to OTE (61.8-78.6%) → continuation up
    for (let i = 0; i < 15; i++) { p += -0.3 + (rand() - 0.5) * 1.5; prices.push(p); }
    const swingLow = p;
    for (let i = 0; i < 20; i++) { p += 0.8 + (rand() - 0.5) * 1; prices.push(p); }
    const swingHigh = p;
    const fibRange = swingHigh - swingLow;
    const oteTarget = swingHigh - fibRange * 0.68; // middle of OTE
    for (let i = 0; i < 15; i++) { const t = i / 14; p = swingHigh + (oteTarget - swingHigh) * t + (rand() - 0.5) * 0.8; prices.push(p); }
    const entryIdx = prices.length - 1;
    const entryPrice = prices[entryIdx];
    for (let i = 0; i < 15; i++) { p += 0.6 + (rand() - 0.5) * 0.8; prices.push(p); }
    const obLow = oteTarget - 1.5;
    const obHigh = oteTarget + 0.5;
    return { prices, obRange: [obLow, obHigh], entryIdx, entryPrice };
  }
  if (type === 'bearish_ote') {
    // Up trend → impulse down → pullback to OTE → continuation down
    for (let i = 0; i < 15; i++) { p += 0.3 + (rand() - 0.5) * 1.5; prices.push(p); }
    const swingHigh = p;
    for (let i = 0; i < 20; i++) { p += -0.8 + (rand() - 0.5) * 1; prices.push(p); }
    const swingLow = p;
    const fibRange = swingHigh - swingLow;
    const oteTarget = swingLow + fibRange * 0.68;
    for (let i = 0; i < 15; i++) { const t = i / 14; p = swingLow + (oteTarget - swingLow) * t + (rand() - 0.5) * 0.8; prices.push(p); }
    const entryIdx = prices.length - 1;
    const entryPrice = prices[entryIdx];
    for (let i = 0; i < 15; i++) { p += -0.6 + (rand() - 0.5) * 0.8; prices.push(p); }
    const obLow = oteTarget - 0.5;
    const obHigh = oteTarget + 1.5;
    return { prices, obRange: [obLow, obHigh], entryIdx, entryPrice };
  }
  if (type === 'ote_ob') {
    // Bullish OTE + OB sitting inside the zone
    for (let i = 0; i < 12; i++) { p += -0.2 + (rand() - 0.5) * 1.2; prices.push(p); }
    const swingLow = p;
    for (let i = 0; i < 22; i++) { p += 0.7 + (rand() - 0.5) * 0.8; prices.push(p); }
    const swingHigh = p;
    const fibRange = swingHigh - swingLow;
    const oteTarget = swingHigh - fibRange * 0.7;
    for (let i = 0; i < 16; i++) { const t = i / 15; p = swingHigh + (oteTarget - swingHigh) * t + (rand() - 0.5) * 0.7; prices.push(p); }
    const entryIdx = prices.length - 1;
    const entryPrice = prices[entryIdx];
    for (let i = 0; i < 15; i++) { p += 0.65 + (rand() - 0.5) * 0.7; prices.push(p); }
    const obMid = oteTarget;
    return { prices, obRange: [obMid - 1.8, obMid + 0.3], fvgRange: [obMid - 0.5, obMid + 1.2], entryIdx, entryPrice };
  }
  if (type === 'ote_fvg_ob') {
    // Triple confluence — OTE + OB + FVG all overlap
    for (let i = 0; i < 10; i++) { p += -0.15 + (rand() - 0.5) * 1; prices.push(p); }
    const swingLow = p;
    for (let i = 0; i < 25; i++) { p += 0.75 + (rand() - 0.5) * 0.9; prices.push(p); }
    const swingHigh = p;
    const fibRange = swingHigh - swingLow;
    const oteCenter = swingHigh - fibRange * 0.71;
    for (let i = 0; i < 18; i++) { const t = i / 17; p = swingHigh + (oteCenter - swingHigh) * t + (rand() - 0.5) * 0.6; prices.push(p); }
    const entryIdx = prices.length - 1;
    const entryPrice = prices[entryIdx];
    for (let i = 0; i < 12; i++) { p += 0.7 + (rand() - 0.5) * 0.7; prices.push(p); }
    return { prices, obRange: [oteCenter - 1.5, oteCenter + 0.2], fvgRange: [oteCenter - 0.8, oteCenter + 1], entryIdx, entryPrice };
  }
  // no_ote — price barely pulls back (only 23.6%) and continues — no valid OTE
  for (let i = 0; i < 15; i++) { p += -0.2 + (rand() - 0.5) * 1.2; prices.push(p); }
  for (let i = 0; i < 25; i++) { p += 0.7 + (rand() - 0.5) * 0.8; prices.push(p); }
  const swingHigh = p;
  // shallow pullback
  for (let i = 0; i < 10; i++) { p += -0.15 + (rand() - 0.5) * 0.5; prices.push(p); }
  for (let i = 0; i < 15; i++) { p += 0.5 + (rand() - 0.5) * 0.6; prices.push(p); }
  return { prices };
}

// ============================================================
// MAIN LESSON COMPONENT
// ============================================================
export default function OTELesson() {
  const [section, setSection] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const totalSections = 11;

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => { const h = document.documentElement; setScrollPct(h.scrollTop / (h.scrollHeight - h.clientHeight) * 100); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Interactive chart toggles
  const [showOTE, setShowOTE] = useState(true);
  const [showOB, setShowOB] = useState(false);
  const [showFVG, setShowFVG] = useState(false);

  const demoData = useMemo(() => genOTEScenario(42, 'bullish_ote'), []);
  const demoPrices = demoData.prices;

  // Accordion for deep dives
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);

  // OTE Calculator
  const [calcHigh, setCalcHigh] = useState('2075');
  const [calcLow, setCalcLow] = useState('1980');
  const calcHighN = parseFloat(calcHigh) || 0;
  const calcLowN = parseFloat(calcLow) || 0;
  const calcRange = calcHighN - calcLowN;
  const calcLevels = [
    { pct: 0, label: 'Swing High', price: calcHighN, color: '#22c55e' },
    { pct: 0.236, label: '23.6%', price: calcHighN - calcRange * 0.236, color: '#94a3b8' },
    { pct: 0.382, label: '38.2%', price: calcHighN - calcRange * 0.382, color: '#94a3b8' },
    { pct: 0.5, label: '50% (Equilibrium)', price: calcHighN - calcRange * 0.5, color: '#f59e0b' },
    { pct: 0.618, label: '61.8% ← OTE START', price: calcHighN - calcRange * 0.618, color: '#f59e0b' },
    { pct: 0.705, label: '70.5% (OTE Sweet Spot)', price: calcHighN - calcRange * 0.705, color: '#22c55e' },
    { pct: 0.786, label: '78.6% ← OTE END', price: calcHighN - calcRange * 0.786, color: '#f59e0b' },
    { pct: 1, label: 'Swing Low', price: calcLowN, color: '#ef4444' },
  ];

  // Game state
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { seed: 101, type: 'bullish_ote' as const, correct: 0, label: 'Bullish OTE Entry',
      q: 'Price has pulled back after a strong rally. Where would you look to enter?',
      opts: ['Wait for price to reach the OTE zone (61.8-78.6%)', 'Buy immediately at the current price', 'Wait for a new all-time high', 'Sell because price is falling'],
      explain: 'Price pulled back into the OTE zone — the 61.8% to 78.6% retracement of the impulse leg. This is where institutions place their buy orders. The OTE zone + Order Block sitting inside it = high-probability long entry. Stop goes below the 78.6% level.'
    },
    { seed: 202, type: 'bearish_ote' as const, correct: 1, label: 'Bearish OTE Entry',
      q: 'After a strong sell-off, price is pulling back upward. What should you do?',
      opts: ['Buy because price is going up', 'Wait for price to reach the OTE zone then look for a short entry', 'The downtrend is over, switch to long', 'Ignore — no setup here'],
      explain: 'In a bearish impulse, the OTE zone sits ABOVE the current price. When price retraces 61.8-78.6% of the drop, that\'s where sellers reload. You\'re looking for a bearish OB or FVG inside the OTE zone as your short entry. The pullback is the trap — it\'s not a reversal, it\'s an opportunity to sell at a better price.'
    },
    { seed: 303, type: 'ote_ob' as const, correct: 2, label: 'OTE + Order Block Confluence',
      q: 'Price retraced to the OTE zone AND there\'s an Order Block sitting right inside it. What quality is this setup?',
      opts: ['C-grade — avoid it', 'B-grade — standard entry', 'A-grade or better — high confluence', 'Not tradeable without more confirmation'],
      explain: 'OTE zone + Order Block = A-grade minimum. The OTE gives you the mathematical zone (61.8-78.6%), the Order Block gives you the institutional footprint. Together they say: "institutions entered here AND the math agrees." Add an FVG and it becomes A+ — the bullseye.'
    },
    { seed: 404, type: 'no_ote' as const, correct: 3, label: 'Shallow Pullback — No OTE',
      q: 'Price rallied strongly and has only pulled back about 23.6%. Should you enter?',
      opts: ['Yes — any pullback is a buy', 'Yes — the trend is strong', 'Wait for more pullback into OTE', 'No — the OTE zone is at 61.8-78.6%, price hasn\'t reached it yet'],
      explain: 'A 23.6% pullback is barely a pullback at all — it hasn\'t reached the OTE zone. Buying here means your stop loss is far away (below 78.6%), your risk:reward is poor, and you\'re essentially chasing. Either wait for a deeper pullback into the OTE zone, or skip this trade entirely. Patience IS the skill.'
    },
    { seed: 505, type: 'ote_fvg_ob' as const, correct: 0, label: 'Triple Confluence — The Bullseye',
      q: 'The OTE zone has an Order Block AND a Fair Value Gap overlapping. What is this?',
      opts: ['The highest probability entry possible — triple confluence', 'Overkill — too many signals, skip it', 'A coincidence — these overlapping doesn\'t mean anything', 'A sign the market is too volatile to trade'],
      explain: 'This is the BULLSEYE — the absolute highest probability entry in Smart Money trading. OTE zone (mathematical), Order Block (institutional footprint), and FVG (imbalance magnet) all pointing to the same price area. Like three different satnav systems all routing you to the same destination. When you see this, your confidence should be at maximum — tight stop below 78.6%, target the opposing liquidity.'
    },
  ], []);

  const currentGame = gameScenarios[gameRound];
  const currentGameData = useMemo(() => genOTEScenario(currentGame.seed, currentGame.type), [currentGame.seed, currentGame.type]);

  // Quiz
  const quizQuestions = [
    { q: 'What is the OTE zone?', opts: ['0-23.6% retracement', '38.2-50% retracement', '61.8-78.6% retracement', '78.6-100% retracement'], a: 2, explain: 'The Optimal Trade Entry zone is the 61.8% to 78.6% Fibonacci retracement of an impulse leg. This is where institutional orders are most heavily concentrated.' },
    { q: 'Why is the OTE zone special compared to other Fib levels?', opts: ['It\'s the most talked about on YouTube', 'It combines the 61.8% golden ratio with the 78.6% deep retracement — where OBs and FVGs cluster', 'It\'s the cheapest level', 'It always works 100% of the time'], a: 1, explain: 'The OTE zone combines the mathematical power of the 61.8% golden ratio with the 78.6% deep retracement. This is where Order Blocks and FVGs most commonly overlap — creating maximum confluence.' },
    { q: 'In a bullish OTE setup, where do you place your stop loss?', opts: ['Above the swing high', 'At the 50% level', 'Below the 78.6% level (below the OTE zone)', 'At the entry price'], a: 2, explain: 'Stop loss goes below the 78.6% level — the bottom of the OTE zone. If price breaks below this, the impulse is invalidated and the trade idea is wrong.' },
    { q: 'What is the "bullseye" setup?', opts: ['OTE + Order Block + FVG all overlapping', 'Just an Order Block', 'Two moving averages crossing', 'A breakout above resistance'], a: 0, explain: 'The bullseye is when OTE zone, Order Block, and FVG all overlap at the same price area. Three independent layers of confirmation pointing to the same entry — the highest probability setup in SMC.' },
    { q: 'Price rallied and pulled back to 23.6%. Is this an OTE entry?', opts: ['Yes — any pullback is valid', 'Yes — the shallower the better', 'No — the OTE zone starts at 61.8%', 'Only if volume confirms'], a: 2, explain: 'The OTE zone starts at 61.8% and ends at 78.6%. A 23.6% pullback hasn\'t even reached the zone. You\'d be entering too early with a poor risk:reward ratio.' },
    { q: 'What makes the 70.5% level within OTE special?', opts: ['Nothing — all levels are equal', 'It\'s the sweet spot where 61.8% and 78.6% overlap', 'It\'s the midpoint of the OTE zone — highest statistical concentration of institutional orders', 'It\'s a Fibonacci extension'], a: 2, explain: 'The 70.5% level is the midpoint of the OTE zone. Studies of institutional order flow show the highest concentration of unfilled orders sits right around this level — making it the sweet spot within the sweet spot.' },
    { q: 'What happens if price breaks BELOW the 78.6% level in a bullish OTE?', opts: ['The setup is still valid', 'It\'s an even better buy', 'The setup is invalidated — the impulse has failed', 'Wait for it to come back'], a: 2, explain: 'If price breaks below 78.6%, the impulse leg is considered broken. The retracement has gone too deep — it\'s no longer a pullback, it\'s a reversal. Your stop should have been hit and the trade is done.' },
    { q: 'OTE is a Fibonacci concept. Which earlier lesson does it build on?', opts: ['Support & Resistance (2.1)', 'Fibonacci Retracements (2.10)', 'Chart Patterns (2.9)', 'Moving Averages (2.3)'], a: 1, explain: 'OTE is directly built on the Fibonacci retracement levels taught in Lesson 2.10. The 61.8% and 78.6% levels from that lesson become the boundary of the OTE zone. This is why the Academy teaches concepts in order — each level builds on the last.' },
  ];
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  return (
    <div className="min-h-screen bg-[#060a12] text-white relative" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-black/50"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150" style={{ width: `${scrollPct}%` }} /></div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#060a12]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/academy" className="text-xs text-gray-500 hover:text-white transition-colors">← Academy</Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-amber-400"><Crown className="w-3 h-3" /> Pro</div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-5 pt-16 pb-10 text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500/70 mb-3">Level 3 · Lesson 8</p>
        <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] mb-4"><span className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Optimal Trade<br/>Entry</span></h1>
        <p className="text-lg text-gray-400 leading-relaxed">The sniper zone — where Fibonacci, Order Blocks, and Fair Value Gaps converge into the highest-probability entry in all of trading.</p>
      </header>

      {/* ============ SECTION 00: WHY THIS MATTERS ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">First — Why This Matters</h2>
        <div className="glass-card p-6 rounded-2xl mb-6 border border-amber-500/10">
          <p className="text-gray-300 leading-relaxed mb-4">Imagine two people shooting at a target. One stands wherever they like, squinting, and fires. The other waits for the perfect angle, uses a scope, steadies their breathing, and <em>then</em> fires.</p>
          <p className="text-gray-300 leading-relaxed mb-4">Who hits the bullseye? The sniper. Every time.</p>
          <p className="text-gray-300 leading-relaxed mb-4">The <strong className="text-amber-400">Optimal Trade Entry</strong> is the sniper's scope for traders. Instead of buying randomly, you wait for price to pull back to a <em>mathematically precise zone</em> — the <strong className="text-white">61.8% to 78.6% Fibonacci retracement</strong> of the last impulsive move. This zone has a name among professional traders: the <strong className="text-amber-400">OTE</strong>.</p>
          <p className="text-gray-300 leading-relaxed">Why does it work? Because institutions — the banks, the hedge funds, the market movers — place the majority of their unfilled orders in this zone. When price returns to the OTE, it's not random. It's <strong className="text-white">engineering</strong>.</p>
        </div>
        <SniperAnimation />
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500">
          <p className="text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">Real Scenario:</span> Gold rallied from $1,980 to $2,075 — a $95 impulse. It then pulled back. The OTE zone sat between $2,016.30 (61.8%) and $2,000.33 (78.6%). Price retraced to $2,008, right in the OTE — and an Order Block was sitting there from the initial rally. Entry at $2,008, stop at $1,997 (below 78.6%), target $2,090. <strong className="text-white">Risk: $11. Reward: $82. That's 1:7.5 R:R.</strong></p>
        </div>
      </section>

      {/* ============ SECTION 01: RETAIL vs OTE ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">The Difference OTE Makes</h2>
        <p className="text-gray-400 leading-relaxed mb-6">Most retail traders enter at the <em>worst</em> possible time — at the top of an impulse move, chasing price because they're scared of missing out. Smart money enters during the pullback, at the OTE zone. Same market. Same asset. Completely different results.</p>
        <BeforeAfterAnimation />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
            <p className="text-red-400 font-bold text-sm mb-2">❌ Retail Entry</p>
            <p className="text-gray-400 text-sm leading-relaxed">Buys at the top of the impulse. Stop loss is miles away. Risk:reward is terrible (often 1:0.5). Gets stopped out on the pullback. Blames the market.</p>
          </div>
          <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5">
            <p className="text-green-400 font-bold text-sm mb-2">✓ OTE Entry</p>
            <p className="text-gray-400 text-sm leading-relaxed">Waits for the pullback to 61.8-78.6%. Stop is just below the zone — tight. Target is above the impulse high. Risk:reward is 1:3 minimum, often 1:5+. Gets filled by institutional orders.</p>
          </div>
        </div>
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-green-500/5 to-transparent border-l-2 border-green-500">
          <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-green-400">Think of it this way:</strong> If someone offered you the same pair of trainers at full price (£150) or at 65% off (£52.50), which would you choose? The OTE is the sale rack. You're getting the same trade at a discount — and your risk is a fraction of what the FOMO buyer paid.</p>
        </div>
      </section>

      {/* ============ SECTION 02: THE OTE ZONE EXPLAINED ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">The OTE Zone — Explained Simply</h2>
        <p className="text-gray-400 leading-relaxed mb-6">The OTE zone is defined by two Fibonacci levels that sit between the swing high and swing low of an impulse leg:</p>
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm">61.8% — The Golden Ratio</p>
            <p className="text-gray-400 text-sm mt-1">This is the TOP of the OTE zone. Price retracing to 61.8% means the impulse has given back nearly two-thirds of its gains — enough for institutions to step in. From Lesson 2.10, you already know this is nature's most important ratio.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm">70.5% — The Sweet Spot</p>
            <p className="text-gray-400 text-sm mt-1">The midpoint of the OTE zone. This is where statistical analysis shows the highest concentration of institutional order fills. If you could only set ONE limit order, this is where it goes. Think of it as the centre of the bullseye.</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm">78.6% — The Line in the Sand</p>
            <p className="text-gray-400 text-sm mt-1">This is the BOTTOM of the OTE zone. If price breaks below this level, the impulse is considered invalidated — the pullback has become a reversal. Your stop loss sits just beyond this level.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1020] border border-white/5">
          <p className="text-white font-bold text-sm mb-2">🎯 How to remember it:</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">Imagine a lift (elevator) going from the ground floor (Swing Low) to the 10th floor (Swing High). The OTE zone is between <strong className="text-amber-400">floors 2 and 4</strong> — it's "on sale" but the building isn't collapsing. If the lift goes below the ground floor (below 78.6%), something is seriously wrong and you should get out.</p>
          <p className="text-gray-400 text-sm leading-relaxed">In a <strong className="text-green-400">bullish</strong> OTE, the zone sits BELOW the swing high (price retraces down into it). In a <strong className="text-red-400">bearish</strong> OTE, the zone sits ABOVE the swing low (price retraces up into it).</p>
        </div>
      </section>

      {/* ============ SECTION 03: DEEP DIVE EACH LEVEL ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Every Fib Level — What It Means for OTE</h2>
        <p className="text-gray-400 text-sm mb-6">Tap each level to understand its role in the OTE framework. Not all retracements are created equal.</p>
        {[
          { level: '23.6%', title: 'The Sprinter\'s Pause', color: '#94a3b8', body: 'This is barely a pullback — like a sprinter pausing for half a second. Price has only given back a quarter of the impulse. The trend is extremely strong, but the risk:reward for entry here is terrible because your stop loss (below 78.6%) is miles away. Institutions haven\'t had time to accumulate. Skip this level for entries.', verdict: '⚠️ Not an OTE level. Too shallow. Poor R:R.' },
          { level: '38.2%', title: 'The Warm-Up Zone', color: '#60a5fa', body: 'A respectable pullback — like the warm-up before the main event. Some traders enter here in very strong trends, but it\'s still outside the OTE zone. The risk:reward is better than 23.6% but still not optimal. Think of it as "getting warmer but not hot yet."', verdict: '⚠️ Outside OTE. Acceptable in strong trends with LTF confirmation only.' },
          { level: '50.0%', title: 'The Equilibrium Line', color: '#f59e0b', body: 'The halfway point — from Lesson 3.7 (Premium & Discount), you know this is the border between premium and discount. In the OTE framework, 50% is the "pre-zone" — price has entered discount but hasn\'t reached the institutional entry area yet. Some traders use 50% as an early entry in a layered approach, but the highest-probability zone is still deeper.', verdict: '⬛ Equilibrium. Discount starts. OTE hasn\'t started yet.' },
          { level: '61.8%', title: 'The Golden Gate — OTE Opens', color: '#f59e0b', body: 'THIS is where the magic begins. The 61.8% golden ratio marks the TOP of the OTE zone. From Fibonacci (Lesson 2.10), you know this is nature\'s most important number. In trading, when price retraces to 61.8%, institutional algorithms start activating. Order Blocks that sit at or near this level have a significantly higher hit rate than those outside the zone.', verdict: '✅ OTE ZONE STARTS. First valid entry level.' },
          { level: '70.5%', title: 'The Sweet Spot — OTE Centre', color: '#22c55e', body: 'The midpoint of the OTE zone. If the 61.8% is the door to the zone and 78.6% is the emergency exit, 70.5% is the bullseye in the middle. Research into institutional order flow consistently shows the highest density of unfilled orders around this level. If you could only place one limit order for every trade for the rest of your career, this is where it goes.', verdict: '🎯 THE SWEET SPOT. Highest statistical probability of fill + bounce.' },
          { level: '78.6%', title: 'The Line in the Sand — OTE Closes', color: '#ef4444', body: 'The BOTTOM of the OTE zone and the most critical level for risk management. If price holds here, the impulse is alive and your trade is valid. If price breaks below it, the impulse has failed — the retracement has become a reversal. Your stop loss sits just below this level (5-10 pips or below the wick). 78.6% is the mathematician\'s way of saying "last chance before we call this a new trend."', verdict: '🛑 OTE ZONE ENDS. Stop loss level. Break below = impulse invalidated.' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedLevel(expandedLevel === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm" style={{ color: item.color }}>{item.level}</span>
                <span className="text-white text-sm font-semibold">{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedLevel === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedLevel === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{item.body}</p>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.verdict}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* ============ SECTION 04: INTERACTIVE CHART ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Interactive OTE Chart</h2>
        <p className="text-gray-400 text-sm mb-4">Toggle each layer on and off to see how OTE, Order Blocks, and FVGs overlap. This is how smart money sees the chart — in layers of confluence.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setShowOTE(!showOTE)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showOTE ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-gray-500'}`}>🎯 OTE Zone</button>
          <button onClick={() => setShowOB(!showOB)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showOB ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass text-gray-500'}`}>📦 Order Block</button>
          <button onClick={() => setShowFVG(!showFVG)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showFVG ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'glass text-gray-500'}`}>🕳️ FVG</button>
        </div>
        <OTEChart
          prices={demoPrices}
          showOTE={showOTE}
          showOB={showOB}
          showFVG={showFVG}
          obRange={showOB ? demoData.obRange : undefined}
          fvgRange={showFVG ? [-1, -1] : undefined}
          entryDot={demoData.entryIdx !== undefined ? { idx: demoData.entryIdx, price: demoData.entryPrice! } : undefined}
        />
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">Notice something?</strong> When you toggle all three on, the OB sits inside the OTE zone. This isn't a coincidence — institutions place orders IN the OTE zone. The FVG (if one exists) acts as an additional magnet pulling price to that exact level. More layers = more confidence.</p>
        </div>
      </section>

      {/* ============ SECTION 05: THE BULLSEYE CONCEPT ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">The Bullseye — Triple Confluence</h2>
        <p className="text-gray-400 leading-relaxed mb-6">In archery, the bullseye is the smallest circle in the center of the target — the hardest to hit but the most rewarding. In trading, the bullseye is when three independent confirmation layers all point to the <em>same price area</em>:</p>
        <ComboAnimation />
        <div className="space-y-3 mt-6">
          <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm">Layer 1: OTE Zone (Mathematical)</p>
            <p className="text-gray-400 text-sm mt-1">The Fibonacci retracement says "price is at a statistically significant level." This is pure maths — the same ratio that governs sunflower seeds, hurricane spirals, and galaxy arms.</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
            <p className="text-blue-400 font-bold text-sm">Layer 2: Order Block (Institutional)</p>
            <p className="text-gray-400 text-sm mt-1">A detected Order Block says "an institution placed orders here and they're not fully filled yet." This is the footprint — the evidence that big money has a vested interest in this level (Lesson 3.5).</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-purple-500 bg-purple-500/5">
            <p className="text-purple-400 font-bold text-sm">Layer 3: Fair Value Gap (Imbalance)</p>
            <p className="text-gray-400 text-sm mt-1">An FVG says "price moved too fast here and needs to rebalance." The gap acts as a magnet pulling price back to this exact area (Lesson 3.6). The pothole in the road needs filling.</p>
          </div>
        </div>
        <div className="mt-6 p-5 rounded-2xl bg-[#0a1020] border border-green-500/10">
          <p className="text-green-400 font-bold text-sm mb-2">🎯 When all three overlap:</p>
          <p className="text-gray-300 text-sm leading-relaxed">Three completely independent reasons — maths, institutional footprints, and market imbalance — are all telling you the same thing: <strong className="text-white">"Buy here."</strong> It's like three different doctors all diagnosing the same condition independently. Your confidence should be at maximum. Your risk:reward should be at least 1:3. This is the setup you wait for.</p>
        </div>
      </section>

      {/* ============ SECTION 06: OTE CALCULATOR ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">OTE Calculator</h2>
        <p className="text-gray-400 text-sm mb-6">Enter any swing high and swing low — the calculator instantly shows your OTE zone and every key Fib level. Try it with Gold, Bitcoin, EUR/USD, or any asset you trade.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1 block">Swing High</label>
            <input type="number" value={calcHigh} onChange={e => setCalcHigh(e.target.value)} className="w-full p-3 rounded-xl bg-[#0a1020] border border-green-500/20 text-white font-mono text-lg focus:outline-none focus:border-green-500/50" />
          </div>
          <div>
            <label className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1 block">Swing Low</label>
            <input type="number" value={calcLow} onChange={e => setCalcLow(e.target.value)} className="w-full p-3 rounded-xl bg-[#0a1020] border border-red-500/20 text-white font-mono text-lg focus:outline-none focus:border-red-500/50" />
          </div>
        </div>
        {calcRange > 0 && (
          <div className="space-y-1">
            {calcLevels.map((lvl, i) => {
              const isOTE = lvl.pct >= 0.618 && lvl.pct <= 0.786;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl text-sm ${isOTE ? 'bg-amber-500/10 border border-amber-500/15' : 'glass'}`}>
                  <span className="font-semibold" style={{ color: lvl.color }}>{lvl.label}</span>
                  <span className="font-mono text-white">{lvl.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400">💡 <strong className="text-amber-400">Pro Tip:</strong> The amber-highlighted rows ARE your OTE zone. Set your limit buy order at the 70.5% level (the sweet spot), your stop loss just below 78.6%, and your take profit above the swing high. You now have a mathematical edge before the trade even starts.</p>
        </div>
      </section>

      {/* ============ SECTION 07: OTE GRADING SYSTEM ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">OTE Quality Grading</h2>
        <p className="text-gray-400 text-sm mb-6">Not all OTE setups are equal. Just like Order Blocks have grades (Lesson 3.5), OTE entries have a quality spectrum. Tap each grade to see the criteria.</p>
        {[
          { grade: 'A+', title: 'The Bullseye', color: '#22c55e', emoji: '🎯', body: 'OTE zone + Order Block + FVG + Liquidity sweep before entry. All three layers overlap. HTF trend aligns. This is the rarest setup — you might see 1-2 per week on your timeframe. When it appears, it deserves your full position size. Expected R:R: 1:5 to 1:10.', criteria: 'OTE ✓ | OB ✓ | FVG ✓ | Sweep ✓ | HTF aligned ✓' },
          { grade: 'A', title: 'High Confidence', color: '#22c55e', emoji: '✅', body: 'OTE zone + Order Block (no FVG required, but helpful). The math and the institutional footprint agree. This is your bread-and-butter setup — the one you should be taking most often. Expected R:R: 1:3 to 1:5.', criteria: 'OTE ✓ | OB ✓ | FVG optional | HTF aligned ✓' },
          { grade: 'B', title: 'Standard Setup', color: '#f59e0b', emoji: '⚡', body: 'OTE zone reached, but no clear OB or FVG inside it. The math says it\'s a valid level, but there\'s no institutional confirmation. You can take this trade with reduced position size (50-75%). Expected R:R: 1:2 to 1:3.', criteria: 'OTE ✓ | OB ✗ | FVG ✗ | HTF aligned ✓' },
          { grade: 'C', title: 'Weak — Proceed with Caution', color: '#ef4444', emoji: '⚠️', body: 'Price is near the OTE zone but the HTF trend doesn\'t align, or the impulse leg was weak/choppy. The zone might hold, but there\'s no institutional urgency. Either skip entirely or take with 25% position size and tight management. Expected R:R: 1:1.5 at best.', criteria: 'OTE ✓ | OB ✗ | FVG ✗ | HTF not aligned' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedGrade(expandedGrade === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="font-bold text-sm" style={{ color: item.color }}>{item.grade}</span>
                <span className="text-white text-sm">{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedGrade === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedGrade === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{item.body}</p>
                    <p className="font-mono text-xs" style={{ color: item.color }}>{item.criteria}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* ============ SECTION 08: HOW TO TRADE OTE — STEP BY STEP ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">How to Trade the OTE — Step by Step</h2>
        <p className="text-gray-400 text-sm mb-6">This is the complete execution framework. Follow it in order, every time. No shortcuts.</p>
        {[
          { step: 1, title: 'Identify the Impulse Leg', color: '#3b82f6', text: 'Find a clear, strong move — the kind that makes you say "I wish I was in that." Mark the swing low (where it started) and swing high (where it ended). This impulse leg is your Fibonacci anchor. If the move is choppy, weak, or overlapping — skip it. OTE only works on clean impulse legs.' },
          { step: 2, title: 'Draw Fibonacci from Swing to Swing', color: '#f59e0b', text: 'Apply the Fibonacci retracement tool from the swing low to the swing high (bullish) or swing high to swing low (bearish). Your OTE zone appears between 61.8% and 78.6%. The 70.5% sweet spot is right in the middle. This takes 5 seconds.' },
          { step: 3, title: 'Check for an Order Block Inside the Zone', color: '#3b82f6', text: 'Scroll through the OTE zone and look for an OB — the last opposite-colour candle before the impulse started. If there\'s a bullish OB (red candle before the rally) sitting between 61.8% and 78.6%, you have A-grade minimum confluence.' },
          { step: 4, title: 'Check for an FVG Inside the Zone', color: '#a855f7', text: 'Is there a Fair Value Gap (3-candle imbalance) within the OTE zone? If so, that FVG acts as a magnet pulling price to the exact level. OTE + OB + FVG = the bullseye (A+ grade).' },
          { step: 5, title: 'Wait for Price to Enter the Zone', color: '#22c55e', text: 'DO NOT ANTICIPATE. Wait until price actually touches the OTE zone. Many pullbacks stop at 38.2% or 50% — those are NOT OTE entries. Patience is your biggest edge. If price never reaches the zone, you didn\'t miss a trade — you avoided a bad one.' },
          { step: 6, title: 'Confirm on the Lower Timeframe', color: '#22c55e', text: 'Once price is in the OTE zone, drop to a lower timeframe (if HTF = Daily, use 1H or 15M). Look for a BOS or CHoCH confirming the reversal WITHIN the OTE zone. This is your trigger. Without LTF confirmation, you\'re guessing.' },
          { step: 7, title: 'Execute with Precision', color: '#f59e0b', text: 'Entry: at the OB/FVG level inside the OTE zone (or at the 70.5% sweet spot). Stop loss: below 78.6% (add a few pips of buffer). Take profit: above the swing high, or at the opposing liquidity level. Position size: from Lesson 1.6 — based on your risk percentage, not your feelings.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-4 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.step}</div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm mb-1">{item.title}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ============ SECTION 09: COMMON MISTAKES ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">Common OTE Mistakes</h2>
        <p className="text-gray-400 text-sm mb-6">Even traders who know the OTE concept make these errors. Tap each to learn how to avoid them.</p>
        {[
          { title: 'Entering Before the Zone', wrong: 'Buying at 50% because "it\'s close enough."', right: 'Wait for 61.8% minimum. Close enough is not good enough — your risk:reward degrades significantly with every percentage point of early entry.', tip: 'Set a price alert at 61.8% so you don\'t have to stare at the screen.' },
          { title: 'Ignoring the Impulse Quality', wrong: 'Drawing OTE on a weak, choppy 3-candle move.', right: 'The impulse must be IMPULSIVE — strong, decisive, breaking structure. If the "impulse" overlaps with itself, it\'s not an impulse.', tip: 'If you wouldn\'t describe the move as "aggressive" or "explosive," it\'s not impulse-grade.' },
          { title: 'No LTF Confirmation', wrong: 'Setting a blind limit order at 70.5% and walking away.', right: 'Wait for a BOS or CHoCH on the LTF confirming the reversal inside the zone. The OTE zone tells you WHERE to look — the LTF tells you WHEN to enter.', tip: 'Limit orders at OTE work, but entries with LTF confirmation have a 15-25% higher win rate.' },
          { title: 'Moving Your Stop Loss', wrong: 'Moving stop below 78.6% to give it "more room" when price is threatening.', right: 'The 78.6% level IS the line. If price breaks it, the impulse is dead. Moving your stop means you\'re hoping instead of trading.', tip: 'Accept that some trades fail. A properly sized loss at 78.6% is a good loss.' },
          { title: 'Trading OTE Against the HTF Trend', wrong: 'Finding a bullish OTE on the 15M when the Daily is clearly bearish.', right: 'OTE must align with the higher timeframe trend (Lesson 2.11). A bullish OTE in a bear market is just a retracement within a downtrend — not a reversal.', tip: 'Always check the HTF first. If the Daily says sell, your 15M bullish OTE is a counter-trend trap.' },
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
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-red-400 text-xs font-bold mb-1">❌ Wrong</p><p className="text-gray-400 text-sm">{item.wrong}</p></div>
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-green-400 text-xs font-bold mb-1">✓ Right</p><p className="text-gray-400 text-sm">{item.right}</p></div>
                    <p className="text-amber-400 text-sm">💡 {item.tip}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* ============ SECTION 10: GAME ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">🎮 OTE Identification Game</h2>
        <p className="text-gray-400 text-sm mb-6">5 rounds. Identify the correct OTE action for each scenario. Let's see if you can trade like a sniper.</p>

        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">Round {gameRound + 1} of {gameScenarios.length}</p>
              <p className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</p>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <OTEChart
              prices={currentGameData.prices}
              showOTE={gameAnswer !== null}
              showOB={gameAnswer !== null && !!currentGameData.obRange}
              obRange={currentGameData.obRange}
              entryDot={gameAnswer !== null && currentGameData.entryIdx !== undefined ? { idx: currentGameData.entryIdx, price: currentGameData.entryPrice! } : undefined}
            />
            <p className="text-gray-300 text-sm mt-4 mb-4">{currentGame.q}</p>
            <div className="space-y-2">
              {currentGame.opts.map((opt, oi) => {
                const answered = gameAnswer !== null;
                const isCorrect = oi === currentGame.correct;
                const isChosen = gameAnswer === oi;
                let cls = 'glass text-gray-300 hover:bg-white/5';
                if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                return (
                  <button key={oi} onClick={() => {
                    if (!answered) {
                      setGameAnswer(oi);
                      if (oi === currentGame.correct) setGameScore(s => s + 1);
                    }
                  }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>
                    {opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}
                  </button>
                );
              })}
            </div>
            {gameAnswer !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed mb-4"><span className="text-amber-400 font-bold">Explanation: </span>{currentGame.explain}</div>
                {gameRound < gameScenarios.length - 1 ? (
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm">
                    Next Round →
                  </button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm">
                    See Results →
                  </button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '🎯 Perfect! Sniper precision.' : gameScore >= 3 ? 'Solid OTE understanding.' : 'Review the OTE zone and grading sections above.'}</p>
          </motion.div>
        )}
      </section>

      {/* ============ SECTION 11: QUIZ ============ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">📝 Knowledge Check — 8 Questions</h2>
        <div className="space-y-4">
          {quizQuestions.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: qi * 0.05 }}
              className="p-5 rounded-2xl glass">
              <p className="text-sm font-semibold text-white mb-3">{qi + 1}. {q.q}</p>
              <div className="space-y-2">
                {q.opts.map((opt, oi) => {
                  const answered = quizAnswers[qi] !== null;
                  const isCorrect = oi === q.a;
                  const isChosen = quizAnswers[qi] === oi;
                  let cls = 'glass text-gray-300 hover:bg-white/5';
                  if (answered) { if (isCorrect) cls = 'bg-green-500/15 border-green-500/30 text-green-400'; else if (isChosen) cls = 'bg-red-500/15 border-red-500/30 text-red-400'; else cls = 'glass text-gray-600'; }
                  return (<button key={oi} onClick={() => { if (!answered) { const na = [...quizAnswers]; na[qi] = oi; setQuizAnswers(na); } }} disabled={answered} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${cls}`}>{opt} {answered && isCorrect && '✓'} {answered && isChosen && !isCorrect && '✗'}</button>);
                })}
              </div>
              {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">✓</span> {q.explain}</motion.div>)}
            </motion.div>
          ))}
        </div>
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '🎯 You ARE the sniper. Perfect precision.' : score >= 66 ? 'Solid OTE knowledge. Ready for breaker blocks.' : 'Review the OTE zone and grading sections.'}</p></motion.div>)}
      </section>

      {/* Certificate */}
      <section className="px-5 py-16 text-center">
        {!certUnlocked ? (
          <div className="max-w-md mx-auto p-8 glass rounded-2xl"><p className="text-4xl mb-3 opacity-30">🔒</p><p className="text-sm text-gray-500">Score 66%+ to unlock your <strong className="text-amber-400">Pro Certificate</strong></p></div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }}
            className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(34,197,94,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-[1px] rounded-3xl border border-amber-500/10" />
            <div className="relative z-10">
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">🎯</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.8: Optimal Trade Entry (OTE)</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-amber-400 via-green-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Precision Sniper —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.9 — Breaker Blocks & Mitigation</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
