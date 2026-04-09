// app/academy/lesson/breaker-blocks/page.tsx
// ATLAS Academy — Lesson 3.9: Breaker Blocks & Mitigation [PRO]
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
// TRAITOR ANIMATION — OB flips to Breaker
// ============================================================
function TraitorAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const cycle = (f % 480) / 480;
    const midX = w / 2;

    // Phase labels
    const phase = cycle < 0.33 ? 0 : cycle < 0.66 ? 1 : 2;

    // Draw a price path across three phases
    const swingLow = h * 0.75;
    const obTop = h * 0.42;
    const obBot = h * 0.52;
    const swingHigh = h * 0.2;
    const breakdownLevel = h * 0.82;

    // Phase 0: Rally through OB zone — OB is bullish
    // Phase 1: Price breaks DOWN through the OB — it FAILS
    // Phase 2: Price returns to OB zone — now it's a BREAKER (resistance)

    // OB zone — always visible
    const obAlpha = phase === 0 ? 0.12 : phase === 1 ? 0.06 : 0.1;
    const obColor = phase <= 1 ? `rgba(59,130,246,${obAlpha})` : `rgba(239,68,68,${obAlpha})`;
    ctx.fillStyle = obColor;
    ctx.fillRect(w * 0.25, obTop, w * 0.5, obBot - obTop);
    const obBorderColor = phase <= 1 ? '#3b82f6' : '#ef4444';
    ctx.strokeStyle = obBorderColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(w * 0.25, obTop, w * 0.5, obBot - obTop);
    ctx.setLineDash([]);

    // OB label
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    if (phase === 0) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('BULLISH ORDER BLOCK', midX, obTop - 6);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('"Institutions bought here"', midX, obBot + 14);
    } else if (phase === 1) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('ORDER BLOCK FAILED!', midX, obTop - 6);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Price BROKE through — institutions abandoned it', midX, obBot + 14);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('⚡ BEARISH BREAKER BLOCK', midX, obTop - 6);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('"Former ally is now the enemy"', midX, obBot + 14);
    }

    // Price line per phase
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (phase === 0) {
      // Rally up through OB
      const progress = (cycle / 0.33);
      ctx.strokeStyle = '#22c55e';
      const pts: [number, number][] = [
        [w * 0.1, swingLow],
        [w * 0.3, obBot + 5],
        [w * 0.4, (obTop + obBot) / 2], // enters OB
        [w * 0.5, obTop - 5], // exits OB top
        [w * 0.7, swingHigh],
        [w * 0.85, swingHigh + 15],
      ];
      const visiblePts = Math.floor(pts.length * progress);
      for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
        i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
      }
    } else if (phase === 1) {
      // Crash down through OB
      const progress = ((cycle - 0.33) / 0.33);
      ctx.strokeStyle = '#ef4444';
      const pts: [number, number][] = [
        [w * 0.15, swingHigh + 10],
        [w * 0.3, obTop - 10],
        [w * 0.4, (obTop + obBot) / 2], // enters OB
        [w * 0.5, obBot + 10], // breaks below OB
        [w * 0.65, h * 0.65],
        [w * 0.8, breakdownLevel],
        [w * 0.9, breakdownLevel - 5],
      ];
      const visiblePts = Math.floor(pts.length * progress);
      for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
        i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
      }
      // Big X through OB
      if (progress > 0.5) {
        ctx.stroke();
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.28, obTop + 3); ctx.lineTo(w * 0.72, obBot - 3);
        ctx.moveTo(w * 0.72, obTop + 3); ctx.lineTo(w * 0.28, obBot - 3);
      }
    } else {
      // Retrace back UP to breaker, then reject
      const progress = ((cycle - 0.66) / 0.34);
      const pts: [number, number][] = [
        [w * 0.1, breakdownLevel],
        [w * 0.25, h * 0.65],
        [w * 0.4, obBot + 2], // approaches breaker
        [w * 0.5, (obTop + obBot) / 2], // hits breaker
        [w * 0.55, obBot + 8], // rejection starts
        [w * 0.7, h * 0.7],
        [w * 0.85, breakdownLevel + 10],
      ];
      const visiblePts = Math.floor(pts.length * progress);
      for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
        const isBeforeReject = i <= 3;
        if (i === 0) { ctx.strokeStyle = '#94a3b8'; ctx.moveTo(pts[i][0], pts[i][1]); }
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      // Rejection marker
      if (progress > 0.55) {
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w * 0.5, (obTop + obBot) / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 10px system-ui';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('REJECTED!', w * 0.5, (obTop + obBot) / 2 - 12);
      }
    }
    ctx.stroke();

    // Phase indicator
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = phase === 0 ? '#22c55e' : phase === 1 ? '#ef4444' : '#f59e0b';
    const labels = ['Act 1: The Order Block Forms', 'Act 2: The Order Block FAILS', 'Act 3: The Breaker Block Rejects'];
    ctx.fillText(labels[phase], midX, h - 10);

    // Progress dots
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === phase ? '#f59e0b' : 'rgba(148,163,184,0.3)';
      ctx.beginPath();
      ctx.arc(midX - 15 + i * 15, h - 25, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// MITIGATION CYCLE ANIMATION — price returns to breaker
// ============================================================
function MitigationCycleAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const cycle = (f % 360) / 360;
    const midX = w / 2;
    const midY = h / 2;

    // Three boxes showing the lifecycle
    const boxW = w * 0.28;
    const boxH = h * 0.5;
    const gap = (w - boxW * 3) / 4;

    const boxes = [
      { x: gap, label: '1. OB FORMS', sub: 'Institutions place orders', color: '#3b82f6', icon: '📦', active: cycle < 0.33 },
      { x: gap * 2 + boxW, label: '2. OB BREAKS', sub: 'Price smashes through', color: '#ef4444', icon: '💥', active: cycle >= 0.33 && cycle < 0.66 },
      { x: gap * 3 + boxW * 2, label: '3. BREAKER', sub: 'Zone flips — now resistance', color: '#f59e0b', icon: '⚡', active: cycle >= 0.66 },
    ];

    boxes.forEach((box, i) => {
      const y = (h - boxH) / 2;
      const pulse = box.active ? 0.15 + Math.sin(f * 0.06) * 0.05 : 0.05;
      ctx.fillStyle = `rgba(${box.color === '#3b82f6' ? '59,130,246' : box.color === '#ef4444' ? '239,68,68' : '245,158,11'},${pulse})`;
      ctx.fillRect(box.x, y, boxW, boxH);
      ctx.strokeStyle = box.color;
      ctx.lineWidth = box.active ? 2 : 1;
      ctx.strokeRect(box.x, y, boxW, boxH);

      ctx.textAlign = 'center';
      ctx.font = '24px system-ui';
      ctx.fillStyle = '#fff';
      ctx.fillText(box.icon, box.x + boxW / 2, y + boxH * 0.35);
      ctx.font = `bold ${box.active ? 11 : 10}px system-ui`;
      ctx.fillStyle = box.color;
      ctx.fillText(box.label, box.x + boxW / 2, y + boxH * 0.58);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(box.sub, box.x + boxW / 2, y + boxH * 0.72);
    });

    // Arrows between boxes
    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.lineWidth = 1.5;
    const arrowY = midY;
    for (let i = 0; i < 2; i++) {
      const fromX = boxes[i].x + boxW + 4;
      const toX = boxes[i + 1].x - 4;
      ctx.beginPath();
      ctx.moveTo(fromX, arrowY);
      ctx.lineTo(toX - 6, arrowY);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = 'rgba(148,163,184,0.4)';
      ctx.beginPath();
      ctx.moveTo(toX, arrowY);
      ctx.lineTo(toX - 8, arrowY - 4);
      ctx.lineTo(toX - 8, arrowY + 4);
      ctx.fill();
    }

    // Bottom label
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('The Lifecycle: Order Block → Failure → Breaker Block', midX, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// FAILURE SEQUENCE ANIMATION — what invalidation looks like
// ============================================================
function FailureSequenceAnimation() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(6,10,18,0.95)';
    ctx.fillRect(0, 0, w, h);
    const progress = Math.min(1, (f % 300) / 250);
    const midX = w / 2;

    // Bullish OB zone
    const obTop = h * 0.38;
    const obBot = h * 0.48;
    ctx.fillStyle = 'rgba(59,130,246,0.08)';
    ctx.fillRect(w * 0.05, obTop, w * 0.9, obBot - obTop);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(w * 0.05, obTop, w * 0.9, obBot - obTop);
    ctx.setLineDash([]);

    // Price path: up → tests OB → BREAKS through OB → continues down
    const pts: [number, number][] = [
      [w * 0.05, h * 0.7],
      [w * 0.12, h * 0.55],
      [w * 0.2, obBot + 3], // approaches OB
      [w * 0.28, (obTop + obBot) / 2], // first touch — holds
      [w * 0.35, obBot + 8], // bounces
      [w * 0.42, h * 0.35], // rally away
      [w * 0.5, h * 0.3],
      [w * 0.58, obTop - 5], // approaches again from above
      [w * 0.63, (obTop + obBot) / 2], // second touch
      [w * 0.68, obBot + 2], // starts breaking
      [w * 0.73, obBot + 15], // BREAKS below
      [w * 0.8, h * 0.65],
      [w * 0.87, h * 0.72],
      [w * 0.95, h * 0.78],
    ];

    const visiblePts = Math.floor(pts.length * progress);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(visiblePts, pts.length - 1); i++) {
      i === 0 ? ctx.moveTo(pts[i][0], pts[i][1]) : ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

    // First touch label
    if (progress > 0.2) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓ OB holds', w * 0.28, obTop - 10);
    }

    // Break label
    if (progress > 0.7) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✗ OB BROKEN!', w * 0.73, obBot + 30);
      ctx.font = '9px system-ui';
      ctx.fillText('Now a BREAKER', w * 0.73, obBot + 42);

      // X through OB
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, obTop + 2); ctx.lineTo(w * 0.92, obBot - 2);
      ctx.moveTo(w * 0.92, obTop + 2); ctx.lineTo(w * 0.08, obBot - 2);
      ctx.stroke();
    }

    // OB label
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = progress > 0.7 ? '#ef4444' : '#3b82f6';
    ctx.fillText(progress > 0.7 ? 'BREAKER ZONE' : 'BULLISH OB', w * 0.07, obTop - 5);

    // Bottom
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    const fadein = Math.min(1, progress * 2);
    ctx.globalAlpha = fadein;
    ctx.fillText('When an OB fails, it becomes a Breaker — the zone flips its role', midX, h - 10);
    ctx.globalAlpha = 1;
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// BREAKER CHART COMPONENT
// ============================================================
function BreakerChart({ prices, obRange, breakerActive, mitigationIdx, showLabels }: {
  prices: number[];
  obRange: [number, number];
  breakerActive: boolean;
  mitigationIdx?: number;
  showLabels?: boolean;
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

    const pad = 30;
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const toX = (i: number) => pad + (i / (prices.length - 1)) * chartW;
    const toY = (p: number) => pad + (1 - (p - minP) / rangeP) * chartH;

    // OB / Breaker zone
    const zoneTopY = toY(Math.max(obRange[0], obRange[1]));
    const zoneBotY = toY(Math.min(obRange[0], obRange[1]));
    if (breakerActive) {
      ctx.fillStyle = 'rgba(239,68,68,0.08)';
      ctx.fillRect(pad, zoneTopY, chartW, zoneBotY - zoneTopY);
      ctx.strokeStyle = '#ef4444';
    } else {
      ctx.fillStyle = 'rgba(59,130,246,0.08)';
      ctx.fillRect(pad, zoneTopY, chartW, zoneBotY - zoneTopY);
      ctx.strokeStyle = '#3b82f6';
    }
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(pad, zoneTopY, chartW, zoneBotY - zoneTopY);
    ctx.setLineDash([]);

    // Zone label
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = breakerActive ? '#ef4444' : '#3b82f6';
    ctx.fillText(breakerActive ? 'BREAKER' : 'ORDER BLOCK', pad + 4, zoneTopY - 4);

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

    // Mitigation dot
    if (mitigationIdx !== undefined && mitigationIdx < prices.length) {
      const mx = toX(mitigationIdx);
      const my = toY(prices[mitigationIdx]);
      ctx.fillStyle = breakerActive ? '#ef4444' : '#22c55e';
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();
      if (showLabels) {
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(breakerActive ? 'REJECTION' : 'MITIGATION', mx, my - 10);
      }
    }

  }, [prices, obRange, breakerActive, mitigationIdx, showLabels]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 250 }} className="rounded-2xl" />;
}

// ============================================================
// SCENARIO GENERATORS
// ============================================================
function genBreakerScenario(seed: number, type: 'bullish_breaker' | 'bearish_breaker' | 'mitigated_breaker' | 'failed_breaker' | 'ob_vs_breaker'): {
  prices: number[];
  obRange: [number, number];
  breakerActive: boolean;
  mitigationIdx?: number;
} {
  const rand = seededRandom(seed);
  const prices: number[] = [];
  let p = 100;

  if (type === 'bullish_breaker') {
    // Bearish OB forms (green candle before drop) → price rallies THROUGH it → OB becomes bullish breaker (support)
    for (let i = 0; i < 12; i++) { p += 0.3 + (rand() - 0.5) * 1.2; prices.push(p); }
    const obMid = p;
    for (let i = 0; i < 18; i++) { p += -0.7 + (rand() - 0.5) * 0.8; prices.push(p); } // drop
    for (let i = 0; i < 8; i++) { p += -0.1 + (rand() - 0.5) * 0.6; prices.push(p); } // base
    for (let i = 0; i < 18; i++) { p += 0.8 + (rand() - 0.5) * 0.7; prices.push(p); } // rally through OB
    // Pullback to breaker
    const breakerLevel = obMid;
    for (let i = 0; i < 10; i++) { const t = i / 9; p = prices[prices.length - 1] + (breakerLevel - prices[prices.length - 1]) * t + (rand() - 0.5) * 0.5; prices.push(p); }
    const mitigationIdx = prices.length - 1;
    for (let i = 0; i < 10; i++) { p += 0.5 + (rand() - 0.5) * 0.6; prices.push(p); } // bounce from breaker
    return { prices, obRange: [obMid - 1.5, obMid + 1], breakerActive: true, mitigationIdx };
  }
  if (type === 'bearish_breaker') {
    // Bullish OB forms (red candle before rally) → price crashes THROUGH it → OB becomes bearish breaker (resistance)
    for (let i = 0; i < 12; i++) { p += -0.3 + (rand() - 0.5) * 1.2; prices.push(p); }
    const obMid = p;
    for (let i = 0; i < 18; i++) { p += 0.7 + (rand() - 0.5) * 0.8; prices.push(p); } // rally
    for (let i = 0; i < 8; i++) { p += 0.1 + (rand() - 0.5) * 0.6; prices.push(p); } // top
    for (let i = 0; i < 18; i++) { p += -0.8 + (rand() - 0.5) * 0.7; prices.push(p); } // crash through OB
    // Retrace up to breaker
    const breakerLevel = obMid;
    for (let i = 0; i < 10; i++) { const t = i / 9; p = prices[prices.length - 1] + (breakerLevel - prices[prices.length - 1]) * t + (rand() - 0.5) * 0.5; prices.push(p); }
    const mitigationIdx = prices.length - 1;
    for (let i = 0; i < 10; i++) { p += -0.5 + (rand() - 0.5) * 0.6; prices.push(p); } // rejected
    return { prices, obRange: [obMid - 1, obMid + 1.5], breakerActive: true, mitigationIdx };
  }
  if (type === 'mitigated_breaker') {
    // Breaker forms → price returns → gets rejected → continues
    for (let i = 0; i < 10; i++) { p += 0.25 + (rand() - 0.5) * 1; prices.push(p); }
    const obMid = p;
    for (let i = 0; i < 15; i++) { p += -0.65 + (rand() - 0.5) * 0.7; prices.push(p); }
    for (let i = 0; i < 20; i++) { p += 0.75 + (rand() - 0.5) * 0.6; prices.push(p); } // breaks through
    // Return to breaker
    for (let i = 0; i < 8; i++) { const t = i / 7; p = prices[prices.length - 1] + (obMid - prices[prices.length - 1]) * t + (rand() - 0.5) * 0.4; prices.push(p); }
    const mitigationIdx = prices.length - 1;
    // Strong rejection
    for (let i = 0; i < 12; i++) { p += 0.6 + (rand() - 0.5) * 0.5; prices.push(p); }
    return { prices, obRange: [obMid - 1.2, obMid + 0.8], breakerActive: true, mitigationIdx };
  }
  if (type === 'failed_breaker') {
    // Breaker forms but price BLASTS through it — breaker invalidated
    for (let i = 0; i < 10; i++) { p += 0.3 + (rand() - 0.5) * 1; prices.push(p); }
    const obMid = p;
    for (let i = 0; i < 15; i++) { p += -0.6 + (rand() - 0.5) * 0.7; prices.push(p); }
    for (let i = 0; i < 18; i++) { p += 0.7 + (rand() - 0.5) * 0.6; prices.push(p); } // breaks through OB
    // Returns to breaker
    for (let i = 0; i < 6; i++) { const t = i / 5; p = prices[prices.length - 1] + (obMid - 0.5 - prices[prices.length - 1]) * t + (rand() - 0.5) * 0.4; prices.push(p); }
    // BLASTS through the breaker
    for (let i = 0; i < 15; i++) { p += -0.8 + (rand() - 0.5) * 0.5; prices.push(p); }
    return { prices, obRange: [obMid - 1.2, obMid + 0.8], breakerActive: true };
  }
  // ob_vs_breaker — OB that holds (not a breaker)
  for (let i = 0; i < 12; i++) { p += -0.2 + (rand() - 0.5) * 1.2; prices.push(p); }
  const obMid = p;
  for (let i = 0; i < 20; i++) { p += 0.65 + (rand() - 0.5) * 0.7; prices.push(p); } // rally from OB
  // Pullback to OB — it HOLDS
  for (let i = 0; i < 10; i++) { const t = i / 9; p = prices[prices.length - 1] + (obMid + 0.5 - prices[prices.length - 1]) * t + (rand() - 0.5) * 0.4; prices.push(p); }
  const mitigationIdx = prices.length - 1;
  for (let i = 0; i < 12; i++) { p += 0.55 + (rand() - 0.5) * 0.5; prices.push(p); }
  return { prices, obRange: [obMid - 1, obMid + 1.2], breakerActive: false, mitigationIdx };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BreakerBlocksLesson() {
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const onScroll = () => { const h = document.documentElement; setScrollPct(h.scrollTop / (h.scrollHeight - h.clientHeight) * 100); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Interactive chart
  const [chartType, setChartType] = useState<'bullish' | 'bearish'>('bullish');
  const [showBreaker, setShowBreaker] = useState(true);
  const [showMitigation, setShowMitigation] = useState(true);
  const bullishDemo = useMemo(() => genBreakerScenario(42, 'bullish_breaker'), []);
  const bearishDemo = useMemo(() => genBreakerScenario(77, 'bearish_breaker'), []);
  const activeDemo = chartType === 'bullish' ? bullishDemo : bearishDemo;

  // Accordions
  const [expandedType, setExpandedType] = useState<number | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);
  const [expandedMitType, setExpandedMitType] = useState<number | null>(null);

  // Game
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswer, setGameAnswer] = useState<number | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const gameScenarios = useMemo(() => [
    { seed: 111, type: 'bullish_breaker' as const, correct: 1, label: 'Bullish Breaker',
      q: 'A bearish OB was broken to the upside. Price is now pulling back to the zone. What is this zone now?',
      opts: ['Still a bearish OB — sell here', 'A bullish breaker — look for a long entry', 'Nothing — the zone is dead', 'A Fair Value Gap'],
      explain: 'When a bearish OB gets broken by a bullish impulse, it FLIPS. The former resistance becomes support. This is a bullish breaker — price should reject upward from this zone. Think of it as a traitor who switched sides — they now fight FOR you.' },
    { seed: 222, type: 'bearish_breaker' as const, correct: 2, label: 'Bearish Breaker',
      q: 'A bullish OB was broken to the downside. Price is now retracing up toward that zone. What should you do?',
      opts: ['Buy — it\'s still a support zone', 'Ignore it — broken zones are useless', 'Look for a short entry — it\'s now a bearish breaker (resistance)', 'Wait for a new OB to form'],
      explain: 'The bullish OB that was broken is now a bearish breaker. Former support becomes resistance. When price retraces up to this zone, it\'s an opportunity to sell. The zone hasn\'t disappeared — it\'s switched teams.' },
    { seed: 333, type: 'mitigated_breaker' as const, correct: 0, label: 'Mitigated Breaker',
      q: 'Price returned to the breaker zone and got strongly rejected. What just happened?',
      opts: ['The breaker was mitigated — unfilled orders got completed', 'The breaker failed', 'This is a new Order Block forming', 'Price is ranging — no signal'],
      explain: 'Mitigation means price returned to the breaker zone and the remaining unfilled orders were executed. The strong rejection confirms the zone is active. After mitigation, the breaker has less power — a second test is riskier because most orders have been filled.' },
    { seed: 444, type: 'failed_breaker' as const, correct: 3, label: 'Failed Breaker',
      q: 'Price returned to the breaker zone but blasted straight through it with no rejection. What happened?',
      opts: ['The breaker held perfectly', 'This is normal — breakers always get tested twice', 'Set a new limit order deeper', 'The breaker FAILED — it\'s invalidated. Close the trade.'],
      explain: 'Breakers can fail. If price returns to the zone and smashes through without any rejection or wick, the zone is dead. The institutional orders that created the breaker have been overwhelmed by opposing flow. Cut the loss and move on — there is no "giving it more room."' },
    { seed: 555, type: 'ob_vs_breaker' as const, correct: 1, label: 'OB vs Breaker — Spot the Difference',
      q: 'Price pulled back to a blue zone and bounced. Is this an Order Block mitigation or a Breaker mitigation?',
      opts: ['A breaker — the zone was previously broken', 'An Order Block — the zone held and price continued in the original direction', 'Neither — this is just random price action', 'Both — they\'re the same thing'],
      explain: 'This is a regular OB mitigation — the zone was NEVER broken. Price rallied from the OB, pulled back to it, and bounced. The key difference: an OB has never been broken through. A breaker is an OB that WAS broken and then flipped its role. Same appearance on a chart, but completely different history.' },
  ], []);

  const currentGame = gameScenarios[gameRound];
  const currentGameData = useMemo(() => genBreakerScenario(currentGame.seed, currentGame.type), [currentGame.seed, currentGame.type]);

  // Quiz
  const quizQuestions = [
    { q: 'What is a breaker block?', opts: ['A new Order Block', 'An Order Block that was BROKEN through — its role flips', 'A type of candlestick pattern', 'A liquidity zone'], a: 1, explain: 'A breaker block is an Order Block that price broke through. When an OB fails, it doesn\'t disappear — it flips. Former support becomes resistance (bearish breaker) or former resistance becomes support (bullish breaker).' },
    { q: 'A bullish OB gets broken to the downside. What does it become?', opts: ['A stronger bullish OB', 'Nothing — it\'s invalidated completely', 'A bearish breaker (now resistance)', 'A Fair Value Gap'], a: 2, explain: 'When a bullish OB (support) gets broken, it becomes a bearish breaker — the zone now acts as resistance. Price that used to bounce UP from here will now bounce DOWN from here. The zone switched sides.' },
    { q: 'What analogy best describes a breaker block?', opts: ['A broken window', 'A traitor who switched sides', 'A locked door', 'A new employee'], a: 1, explain: 'A breaker is like a traitor — someone who used to fight for one side has switched to the other. The zone\'s allegiance has flipped. It still has power (the same institutional orders), but that power now works in the opposite direction.' },
    { q: 'What is mitigation in the context of breakers?', opts: ['Reducing risk', 'Price returning to the zone and filling remaining unfilled orders', 'Cancelling a trade', 'Drawing a new Fibonacci level'], a: 1, explain: 'Mitigation means "settling the debt." When price returns to a breaker zone, the unfilled institutional orders get completed. The rejection at the zone confirms it\'s active. After mitigation, the zone has less remaining power.' },
    { q: 'How do you know a breaker has FAILED?', opts: ['It gets mitigated once', 'Price approaches the zone slowly', 'Price blasts through the zone with no rejection or wick', 'Volume is low'], a: 2, explain: 'A failed breaker shows no respect for the zone — price cuts straight through with strong momentum and no rejection candle. When this happens, the zone is invalidated. The opposing force overwhelmed the institutional orders. Close the trade.' },
    { q: 'Where should your stop loss go on a bearish breaker trade?', opts: ['Below the breaker zone', 'At the entry price', 'Above the breaker zone (above the high of the rejection)', 'At the 50% level'], a: 2, explain: 'For a bearish breaker (resistance), your stop goes ABOVE the zone — above the rejection wick. If price closes above the breaker, the zone has failed and the trade is invalidated.' },
    { q: 'Can a breaker be tested more than once?', opts: ['No — one touch only', 'Yes, but each test weakens it as more orders get filled', 'Yes — it gets stronger with each test', 'Only if volume confirms'], a: 1, explain: 'Each time price returns to a breaker, more of the unfilled orders get completed (mitigated). The first test is the strongest, the second is weaker, and by the third test the zone has very little power left. First-touch entries always offer the best probability.' },
    { q: 'What\'s the KEY difference between an OB and a breaker?', opts: ['Colour of the candles', 'An OB was never broken — a breaker is an OB that WAS broken and flipped role', 'Breakers only exist on higher timeframes', 'There is no difference'], a: 1, explain: 'The defining difference: an OB has held — price respected it. A breaker is an OB that FAILED — price broke through it, and now the zone has flipped to the opposite role. Same zone on the chart, completely different meaning.' },
  ];
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const quizDone = quizAnswers.every(a => a !== null);
  const quizCorrect = quizAnswers.filter((a, i) => a === quizQuestions[i].a).length;
  const score = Math.round((quizCorrect / quizQuestions.length) * 100);
  const certUnlocked = quizDone && score >= 66;

  return (
    <div className="min-h-screen bg-[#060a12] text-white relative" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-black/50"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150" style={{ width: `${scrollPct}%` }} /></div>
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#060a12]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/academy" className="text-xs text-gray-500 hover:text-white transition-colors">← Academy</Link>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-amber-400"><Crown className="w-3 h-3" /> Pro</div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 3 · Lesson 9</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight"><span className="bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Breaker Blocks<br/>& Mitigation</span></h1>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">When an Order Block fails, it doesn't disappear — it switches sides. The traitor zone that now works against its original purpose.</p>
        </motion.div>
      </section>

      {/* S00: WHY THIS MATTERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First — Why This Matters</p>
        <div className="glass-card p-6 rounded-2xl mb-6 border border-amber-500/10">
          <p className="text-gray-300 leading-relaxed mb-4">Imagine a soldier who defects during a war. Yesterday they fought for your side. Today they fight <em>against</em> you. They know your tactics, your positions, your weaknesses — because they used to be one of you.</p>
          <p className="text-gray-300 leading-relaxed mb-4">That's exactly what a <strong className="text-amber-400">Breaker Block</strong> is. It was once an Order Block — a zone where institutions placed their orders. But the OB <em>failed</em>. Price broke through it. And now that zone has switched allegiance. Former support becomes resistance. Former resistance becomes support.</p>
          <p className="text-gray-300 leading-relaxed">This is one of the most powerful concepts in Smart Money trading because <strong className="text-white">most retail traders don't know zones can flip</strong>. They see a broken support level and assume it's dead. Smart money knows it's just changed sides.</p>
        </div>
        <TraitorAnimation />
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500">
          <p className="text-sm text-gray-400 leading-relaxed"><span className="text-amber-400 font-bold">Real Scenario:</span> EUR/USD had a bullish OB at 1.0850-1.0870 that had held twice. On the third approach, price smashed through it — closing below 1.0850 with a strong bearish candle. Two days later, price retraced back up to 1.0860 (the old OB). Retail traders bought there thinking "it held before." Smart money sold — because the OB was now a bearish breaker. Price reversed from 1.0860 and fell 90 pips to 1.0770. <strong className="text-white">The traitor zone trapped the buyers.</strong></p>
        </div>
      </section>

      {/* S01: THE LIFECYCLE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 — The Lifecycle</p>
        <h2 className="text-2xl font-bold mb-6">The Lifecycle: OB → Failure → Breaker</h2>
        <p className="text-gray-400 leading-relaxed mb-6">Every breaker block starts life as an ordinary Order Block. It goes through three acts — like a story with a twist ending.</p>
        <MitigationCycleAnimation />
        <div className="space-y-3 mt-6">
          <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/5">
            <p className="text-blue-400 font-bold text-sm">Act 1: The Order Block Forms</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">Institutions place their orders at a specific price level. Price respects this zone — it bounces off it, confirming it as a valid OB. Retail traders mark it on their charts: "This is support" or "This is resistance." Everyone trusts it.</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-red-500 bg-red-500/5">
            <p className="text-red-400 font-bold text-sm">Act 2: The Order Block FAILS</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">Opposing institutional flow overwhelms the original orders. Price doesn't bounce — it <em>breaks through</em> with momentum. Stop losses are triggered. The OB that everyone trusted has been violated. This is where most traders give up on the zone. But this is exactly where the opportunity begins.</p>
          </div>
          <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm">Act 3: The Zone Flips — The Breaker Is Born</p>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">The broken OB doesn't disappear. The price memory at that level is strong — there are still unfilled orders, stop losses that were triggered, and institutional interest. But now the zone works in the OPPOSITE direction. If it was support, it becomes resistance. If it was resistance, it becomes support. The traitor has switched sides.</p>
          </div>
        </div>
      </section>

      {/* S02: BULLISH vs BEARISH BREAKERS */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 — Two Types</p>
        <h2 className="text-2xl font-bold mb-3">Two Types of Breaker Blocks</h2>
        <p className="text-gray-400 text-sm mb-6">Tap each type to understand the mechanics. Remember: the NAME of the breaker describes its NEW role, not its old one.</p>
        {[
          { title: 'Bullish Breaker (Now Support)', color: '#22c55e', emoji: '🟢',
            body: 'This was originally a BEARISH Order Block — a zone where institutions sold, creating resistance. Price was supposed to bounce down from here. But instead, a strong bullish impulse broke through the zone to the upside. The former resistance flips to support. When price pulls back to this zone, it bounces UP — because the institutions that broke through now defend this level.',
            analogy: 'Think of capturing an enemy fortress. The walls that used to keep you OUT now keep the enemy out. The fortress hasn\'t changed — but the flag flying above it has.',
            howToSpot: '1) Find a bearish OB that was broken upward\n2) Wait for price to pull back to the zone\n3) Look for bullish rejection (wick, engulfing, BOS on LTF)\n4) Enter long with stop below the zone',
          },
          { title: 'Bearish Breaker (Now Resistance)', color: '#ef4444', emoji: '🔴',
            body: 'This was originally a BULLISH Order Block — a zone where institutions bought, creating support. Price bounced up from here. But then a strong bearish impulse smashed through it. The former support flips to resistance. When price retraces up to this zone, it bounces DOWN — the defenders have been defeated and the zone now works for the other side.',
            analogy: 'Imagine a friendly neighbourhood that gets taken over. The same streets, the same buildings — but now controlled by the opposition. You used to feel safe walking there. Now you get robbed. The zone hasn\'t physically changed, but its character has completely flipped.',
            howToSpot: '1) Find a bullish OB that was broken downward\n2) Wait for price to retrace up to the zone\n3) Look for bearish rejection (wick, engulfing, CHoCH on LTF)\n4) Enter short with stop above the zone',
          },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedType(expandedType === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: item.color }}>{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedType === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedType === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{item.body}</p>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-amber-400 text-xs font-bold mb-1">💡 Analogy</p><p className="text-gray-400 text-sm">{item.analogy}</p></div>
                    <div className="p-3 rounded-lg bg-white/3 border border-white/5"><p className="text-white text-xs font-bold mb-1">How to Spot It</p><p className="text-gray-400 text-sm whitespace-pre-line">{item.howToSpot}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S03: WHAT INVALIDATION LOOKS LIKE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 — Invalidation</p>
        <h2 className="text-2xl font-bold mb-6">What Invalidation Looks Like</h2>
        <p className="text-gray-400 leading-relaxed mb-6">Not every OB becomes a breaker. The OB must be <em>decisively</em> broken — a strong candle closing through the zone, not just a wick poking below. Here's what the sequence looks like in slow motion:</p>
        <FailureSequenceAnimation />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-green-500/15 bg-green-500/5">
            <p className="text-green-400 font-bold text-sm mb-2">✓ OB Still Valid</p>
            <p className="text-gray-400 text-sm leading-relaxed">Price approaches the OB and bounces. Maybe a wick pokes into it, but the candle CLOSES above/below the zone. The OB has been "tested" but not broken. It's still an active zone for entries.</p>
          </div>
          <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5">
            <p className="text-red-400 font-bold text-sm mb-2">✗ OB Broken → Now a Breaker</p>
            <p className="text-gray-400 text-sm leading-relaxed">Price smashes through the OB with a strong candle CLOSING on the other side. Multiple candles follow through. Structure breaks. The OB has failed — it's now a breaker with a flipped role.</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">The wick test trap:</strong> A wick poking through an OB is NOT a break. Wicks represent rejection — the zone fought back. A break requires a candle BODY closing through the zone. If you see a long wick through an OB but the candle closes back inside, the OB is actually STRONGER — it just proved it can withstand pressure.</p>
        </div>
      </section>

      {/* S04: MITIGATION DEEP DIVE */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 — Mitigation</p>
        <h2 className="text-2xl font-bold mb-3">Mitigation — Settling the Debt</h2>
        <p className="text-gray-400 leading-relaxed mb-6">Mitigation means "completing the unfinished business." When price returns to a breaker zone and gets rejected, the remaining unfilled institutional orders are being executed. Think of it as returning to a restaurant to pick up the dishes you ordered but didn't receive.</p>
        {[
          { title: 'First-Touch Mitigation', color: '#22c55e', body: 'The first time price returns to the breaker zone. This is the HIGHEST probability reaction because all the unfilled orders are still waiting. The rejection is usually strong and decisive — a clear wick or engulfing candle. This is the entry you want.', strength: '🟢🟢🟢🟢🟢 Maximum' },
          { title: 'Second-Touch Mitigation', color: '#f59e0b', body: 'Price returns to the breaker a second time. Some orders were filled on the first touch, so there\'s less power remaining. The reaction is usually weaker — a smaller bounce, less momentum. You can still trade this but with reduced position size (50-75%).', strength: '🟡🟡🟡 Moderate' },
          { title: 'Third-Touch — Zone Exhausted', color: '#ef4444', body: 'By the third touch, most unfilled orders have been consumed. The zone is running on fumes. The reaction may be minimal or non-existent. Trading a third-touch breaker is like squeezing a lemon that\'s already been squeezed twice — there\'s barely any juice left.', strength: '🔴 Weak — avoid' },
        ].map((item, i) => (
          <div key={i} className="mb-2">
            <button onClick={() => setExpandedMitType(expandedMitType === i ? null : i)} className="w-full text-left p-4 rounded-xl glass hover:bg-white/5 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: item.color }}>{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedMitType === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedMitType === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-5 mx-2 mb-2 rounded-xl bg-[#0a1020] border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed mb-2">{item.body}</p>
                    <p className="text-xs font-bold" style={{ color: item.color }}>Strength: {item.strength}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* S05: INTERACTIVE CHART */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 — Interactive Chart</p>
        <h2 className="text-2xl font-bold mb-3">Interactive Breaker Chart</h2>
        <p className="text-gray-400 text-sm mb-4">Switch between bullish and bearish breakers. Toggle the zone and mitigation point on and off to see how the flip works.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setChartType('bullish')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${chartType === 'bullish' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass text-gray-500'}`}>🟢 Bullish Breaker</button>
          <button onClick={() => setChartType('bearish')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${chartType === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-gray-500'}`}>🔴 Bearish Breaker</button>
          <button onClick={() => setShowBreaker(!showBreaker)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showBreaker ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-gray-500'}`}>⚡ Breaker Zone</button>
          <button onClick={() => setShowMitigation(!showMitigation)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showMitigation ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'glass text-gray-500'}`}>🎯 Mitigation</button>
        </div>
        <BreakerChart
          prices={activeDemo.prices}
          obRange={activeDemo.obRange}
          breakerActive={showBreaker}
          mitigationIdx={showMitigation ? activeDemo.mitigationIdx : undefined}
          showLabels={showMitigation}
        />
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm text-gray-400 leading-relaxed">💡 <strong className="text-amber-400">{chartType === 'bullish' ? 'Bullish Breaker:' : 'Bearish Breaker:'}</strong> {chartType === 'bullish' ? 'The red zone was originally a bearish OB (resistance). Price broke through it to the upside. Now when price returns, the zone acts as SUPPORT — the breaker rejects price upward.' : 'The red zone was originally a bullish OB (support). Price broke through it to the downside. Now when price returns, the zone acts as RESISTANCE — the breaker rejects price downward.'}</p>
        </div>
      </section>

      {/* S06: GRADING SYSTEM */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 — Quality Grading</p>
        <h2 className="text-2xl font-bold mb-3">Breaker Quality Grading</h2>
        <p className="text-gray-400 text-sm mb-6">Not all breakers are equal. Grade yours before risking capital.</p>
        {[
          { grade: 'A+', title: 'First-Touch + OTE + FVG', color: '#22c55e', emoji: '🎯', body: 'The breaker sits inside the OTE zone (61.8-78.6%) AND has an FVG overlapping. First touch. HTF trend aligned. This is the absolute elite setup — maximum confluence from Lessons 3.5, 3.6, 3.7, and 3.8 all combining. Expected R:R: 1:5+.', criteria: 'Breaker ✓ | OTE ✓ | FVG ✓ | First touch ✓ | HTF ✓' },
          { grade: 'A', title: 'First-Touch + HTF Aligned', color: '#22c55e', emoji: '✅', body: 'Clean break of the OB, first touch at the breaker zone, HTF trend supports the direction. No additional confluence required — the breaker itself is strong. Your standard high-probability trade. Expected R:R: 1:3 to 1:5.', criteria: 'Breaker ✓ | First touch ✓ | HTF aligned ✓' },
          { grade: 'B', title: 'Second Touch or Missing HTF', color: '#f59e0b', emoji: '⚡', body: 'Either it\'s the second touch (less unfilled orders) or the HTF trend is unclear. Still tradeable with reduced size (50-75%). Expected R:R: 1:2 to 1:3.', criteria: 'Breaker ✓ | Second touch or HTF unclear' },
          { grade: 'C', title: 'Third Touch / Counter-Trend', color: '#ef4444', emoji: '⚠️', body: 'Third touch (zone nearly exhausted) or trading the breaker against the HTF trend. The maths says skip it. If you insist, use 25% position size maximum. Expected R:R: 1:1.5 at best.', criteria: 'Breaker ✓ | Third touch or HTF opposed' },
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

      {/* S07: HOW TO TRADE — STEP BY STEP */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 — Step by Step</p>
        <h2 className="text-2xl font-bold mb-3">How to Trade Breaker Blocks — 7 Steps</h2>
        <p className="text-gray-400 text-sm mb-6">The complete execution framework. No guessing.</p>
        {[
          { step: 1, title: 'Identify a Failed Order Block', color: '#3b82f6', text: 'Find an OB that was decisively broken — a candle body closing through the zone, not just a wick. The stronger the break (multiple candles, high volume, structure break), the stronger the breaker will be.' },
          { step: 2, title: 'Mark the Breaker Zone', color: '#ef4444', text: 'The breaker zone is the SAME area as the original OB. Mark it on your chart with a different colour (many traders use orange or red to distinguish breakers from active OBs).' },
          { step: 3, title: 'Confirm HTF Alignment', color: '#f59e0b', text: 'Is the breaker\'s new direction aligned with the higher timeframe trend? A bullish breaker in an HTF uptrend = high probability. A bullish breaker in an HTF downtrend = counter-trend trap. Always check (Lesson 2.11).' },
          { step: 4, title: 'Wait for Price to Return', color: '#22c55e', text: 'Patience. Price must retrace to the breaker zone. Don\'t chase. Don\'t anticipate. Let the market come to you. If price never returns, you didn\'t miss a trade — the breaker was too strong (price moved too far away).' },
          { step: 5, title: 'Confirm on Lower Timeframe', color: '#22c55e', text: 'When price touches the breaker zone, drop to LTF. Look for: rejection wick, engulfing candle, BOS/CHoCH confirming the flip. The breaker tells you WHERE. The LTF tells you WHEN.' },
          { step: 6, title: 'Execute the Trade', color: '#f59e0b', text: 'Entry: inside the breaker zone (at the OB level). Stop: beyond the breaker (above for bearish, below for bullish). Target: opposing liquidity or the next significant level. Position size: based on your risk rules (Lesson 1.6).' },
          { step: 7, title: 'Manage and Monitor', color: '#3b82f6', text: 'If price rejects and moves in your favour — great. Trail your stop to breakeven once 1R is reached. If price BREAKS through the breaker (candle body closing through), the zone has failed. Exit immediately. No "giving it room."' },
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

      {/* S08: OB vs BREAKER COMPARISON */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 — OB vs Breaker</p>
        <h2 className="text-2xl font-bold mb-6">Order Block vs Breaker Block — Side by Side</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[500px] glass rounded-2xl overflow-hidden">
            {[
              { aspect: 'Origin', ob: 'Forms from institutional order placement', bb: 'Forms from a FAILED OB' },
              { aspect: 'Has it been broken?', ob: 'No — zone is intact', bb: 'Yes — price closed through it' },
              { aspect: 'Role', ob: 'Original: support or resistance', bb: 'FLIPPED: former support → resistance (or vice versa)' },
              { aspect: 'First test', ob: 'Highest probability (mitigation)', bb: 'Highest probability (first-touch breaker)' },
              { aspect: 'Power over time', ob: 'Weakens with each test', bb: 'Weakens with each test (faster than OBs)' },
              { aspect: 'Stop loss', ob: 'Beyond the OB zone', bb: 'Beyond the breaker zone' },
              { aspect: 'Best confluence', ob: 'OTE + FVG', bb: 'OTE + FVG + sweep before entry' },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-0 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                <div className="p-3 border-r border-white/5"><p className="text-xs text-amber-400 font-semibold">{row.aspect}</p></div>
                <div className="p-3 border-r border-white/5"><p className="text-xs text-blue-400">{row.ob}</p></div>
                <div className="p-3"><p className="text-xs text-red-400">{row.bb}</p></div>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-0 bg-white/[0.03]">
              <div className="p-3 border-r border-white/5" /><div className="p-3 border-r border-white/5"><p className="text-xs text-blue-400 font-bold">📦 Order Block</p></div><div className="p-3"><p className="text-xs text-red-400 font-bold">⚡ Breaker Block</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* S09: COMMON MISTAKES */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 — Common Mistakes</p>
        <h2 className="text-2xl font-bold mb-3">Common Breaker Mistakes</h2>
        <p className="text-gray-400 text-sm mb-6">Avoid these errors and you'll be ahead of 90% of traders who learn about breakers.</p>
        {[
          { title: 'Treating a Wick as a Break', wrong: 'Marking a breaker because a wick poked through the OB.', right: 'Only mark a breaker when a candle BODY closes through the zone. Wicks show rejection — the OB actually held.', tip: 'A wick through an OB means it\'s STRONGER, not broken.' },
          { title: 'Trading Third-Touch Breakers', wrong: 'Entering at a breaker that\'s been tested twice already.', right: 'First touch = maximum power. Second touch = reduced. Third touch = almost empty. Prioritise first-touch entries.', tip: 'Count the touches. If you can see two clear rejection points already, the third one is a gamble.' },
          { title: 'Not Confirming on LTF', wrong: 'Blindly setting a limit order at the breaker zone.', right: 'Wait for LTF confirmation (BOS/CHoCH/engulfing) to trigger the entry. The breaker is the WHERE — the LTF is the WHEN.', tip: 'Limit orders work, but confirmed entries have a 15-25% higher win rate.' },
          { title: 'Confusing OBs and Breakers', wrong: 'Buying at a zone that was broken because "it was support before."', right: 'If the zone was broken (candle body through), it\'s now a BREAKER with the opposite role. Buying at a bearish breaker is buying into resistance.', tip: 'Ask: "Was this zone ever broken?" If yes, the role has flipped.' },
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

      {/* S10: GAME */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 — Spot the Breaker</p>
        <h2 className="text-2xl font-bold mb-3">Breaker Block Game</h2>
        <p className="text-gray-400 text-sm mb-6">5 rounds. Identify breakers, mitigations, and failures. Can you spot when a zone flips?</p>

        {!gameComplete ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">Round {gameRound + 1} of {gameScenarios.length}</p>
              <p className="text-xs text-amber-400 font-bold">{gameScore}/{gameRound + (gameAnswer !== null ? 1 : 0)} correct</p>
            </div>
            <p className="text-white font-semibold text-sm mb-3">{currentGame.label}</p>
            <BreakerChart
              prices={currentGameData.prices}
              obRange={currentGameData.obRange}
              breakerActive={currentGameData.breakerActive}
              mitigationIdx={gameAnswer !== null ? currentGameData.mitigationIdx : undefined}
              showLabels={gameAnswer !== null}
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
                    if (!answered) { setGameAnswer(oi); if (oi === currentGame.correct) setGameScore(s => s + 1); }
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
                  <button onClick={() => { setGameRound(r => r + 1); setGameAnswer(null); }} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm">Next Round →</button>
                ) : (
                  <button onClick={() => setGameComplete(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm">See Results →</button>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 glass-card rounded-2xl">
            <p className="text-5xl font-extrabold mb-2 text-amber-400">{gameScore}/{gameScenarios.length}</p>
            <p className="text-sm text-gray-400">{gameScore === 5 ? '⚡ Perfect! You can spot every flip.' : gameScore >= 3 ? 'Solid breaker awareness.' : 'Review the lifecycle and types sections above.'}</p>
          </motion.div>
        )}
      </section>

      {/* S11: QUIZ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 — Knowledge Check</p>
        <h2 className="text-2xl font-extrabold mb-6">Breaker Blocks Quiz</h2>
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
        {quizDone && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center p-8 glass-card rounded-2xl"><p className={`text-5xl font-extrabold mb-2 ${score >= 66 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</p><p className="text-sm text-gray-400">{score === 100 ? '⚡ Perfect! You understand the flip.' : score >= 66 ? 'Solid breaker understanding. Ready for Kill Zones.' : 'Review the lifecycle and mitigation sections.'}</p></motion.div>)}
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
              <div className="w-[80px] h-[80px] mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">⚡</div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-2">Pro Certificate</p>
              <h3 className="text-xl font-extrabold mb-1">Certificate of Mastery</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Has mastered<br /><strong className="text-white">Level 3.9: Breaker Blocks & Mitigation</strong><br />at ATLAS Academy by Interakktive</p>
              <p className="bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent font-bold text-lg mb-1" style={{ WebkitTransform: 'translateZ(0)' }}>— Zone Flipper —</p>
              <p className="font-mono text-[11px] text-gray-500 mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L3.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section className="text-center px-5 pt-10 pb-24">
        <p className="text-xs tracking-widest uppercase text-gray-600 mb-4">Up Next</p>
        <h2 className="text-xl font-bold mb-6">Lesson 3.10 — Kill Zones: When to Trade</h2>
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          Continue <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
