// app/academy/lesson/stacking-free-indicators/page.tsx
// ATLAS Academy — Lesson 10.12: Stacking Free Indicators [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PATTERN CATALOG LESSON — 7 named playbook patterns
// PHASE 1: scaffold + 5 animations (Combinatorial edge, Orthogonal stacking, Sweet spot, Pattern 1, Pattern 2)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// CANVAS ANIMATION COMPONENT
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
  }, [drawFn, height]);
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5">
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
    </div>
  );
}

// ============================================================
// ANIMATION 1: The Combinatorial Edge (★ GROUNDBREAKING)
// Venn diagram showing intersection of two indicator license zones
// ============================================================
function CombinatorialEdgeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Combinatorial Edge \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('Two diagnostic filters \u2014 intersection is multiplicatively tight', w / 2, 28);

    const cy = h / 2 + 10;
    const r = Math.min(h, w) * 0.22;
    const offset = r * 0.6;
    const cx1 = w / 2 - offset;
    const cx2 = w / 2 + offset;

    // Background dots = all bars
    for (let i = 0; i < 200; i++) {
      const dx = w / 2 + (Math.sin(i * 73.1 + t) * 0.5) * (w * 0.35);
      const dy = cy + (Math.cos(i * 41.7 + t) * 0.5) * (h * 0.28);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(dx, dy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Circle A (MSI = Expansion)
    ctx.fillStyle = 'rgba(34,197,94,0.18)';
    ctx.beginPath();
    ctx.arc(cx1, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,197,94,0.7)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Circle B (MER > 70)
    ctx.fillStyle = 'rgba(245,158,11,0.18)';
    ctx.beginPath();
    ctx.arc(cx2, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Highlight intersection — pulsing dots
    const dotCount = 12;
    for (let i = 0; i < dotCount; i++) {
      const pulseT = (t * 0.8 + i * 0.5) % 4;
      const a = pulseT < 2 ? pulseT / 2 : (4 - pulseT) / 2;
      const angle = (i / dotCount) * Math.PI * 2;
      const rr = r * 0.4;
      const dx = w / 2 + Math.cos(angle) * rr * 0.5;
      const dy = cy + Math.sin(angle) * rr * 0.7;
      ctx.fillStyle = `rgba(255,179,0,${0.8 * a})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = 'rgba(34,197,94,0.95)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MSI = EXPANSION', cx1, cy - r - 10);
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('~25% of bars', cx1, cy - r - 1);

    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('MER > 70', cx2, cy - r - 10);
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('~25% of bars', cx2, cy - r - 1);

    // Intersection callout
    const pulse = 1 + Math.sin(t * 3) * 0.15;
    ctx.fillStyle = '#FFB300';
    ctx.font = `bold ${11 * pulse}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('EDGE', w / 2, cy + r + 20);
    ctx.fillStyle = 'rgba(255,179,0,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('~6% of bars \u2014 rare, high-conviction', w / 2, cy + r + 32);

    // Math annotation
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'italic 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('P(A\u2229B) \u2248 P(A) \u00d7 P(B)', 20, h - 8);
    ctx.textAlign = 'right';
    ctx.fillText('= 0.25 \u00d7 0.25 = 0.0625', w - 20, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Orthogonal vs Redundant Stacking
// Shows 2 pairs of indicators — orthogonal gives tight intersection,
// redundant barely tightens at all
// ============================================================
function OrthogonalStackingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Orthogonal vs Redundant Stacking', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(mid, 26);
    ctx.lineTo(mid, h - 14);
    ctx.stroke();

    // Labels for sides
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ORTHOGONAL', w / 4, 36);
    ctx.fillStyle = '#EF5350';
    ctx.fillText('REDUNDANT', (w * 3) / 4, 36);

    // LEFT: Orthogonal (MSI regime + MER geometry)
    // Large overlap region but not full overlap — tight edge
    const cyO = h / 2 + 8;
    const rO = Math.min(h * 0.25, w * 0.11);
    const offO = rO * 0.55;
    const aX1 = w / 4 - offO;
    const aX2 = w / 4 + offO;

    ctx.fillStyle = 'rgba(34,197,94,0.18)';
    ctx.beginPath();
    ctx.arc(aX1, cyO, rO, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,197,94,0.7)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(14,165,233,0.18)';
    ctx.beginPath();
    ctx.arc(aX2, cyO, rO, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(14,165,233,0.7)';
    ctx.stroke();

    // Intersection glow
    const pulse = 1 + Math.sin(t * 3) * 0.15;
    ctx.fillStyle = `rgba(255,179,0,${0.25 * pulse})`;
    ctx.beginPath();
    ctx.arc(w / 4, cyO, rO * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('REGIME', aX1, cyO - rO - 4);
    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.fillText('GEOMETRY', aX2, cyO - rO - 4);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('~6%', w / 4, cyO + 3);
    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('tight edge', w / 4, cyO + 13);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'italic 7px system-ui';
    ctx.fillText('different axes of state', w / 4, cyO + rO + 18);

    // RIGHT: Redundant (two momentum indicators)
    const bX1 = (w * 3) / 4 - rO * 0.15;
    const bX2 = (w * 3) / 4 + rO * 0.15;

    ctx.fillStyle = 'rgba(236,64,122,0.18)';
    ctx.beginPath();
    ctx.arc(bX1, cyO, rO, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(236,64,122,0.7)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(217,70,239,0.18)';
    ctx.beginPath();
    ctx.arc(bX2, cyO, rO, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217,70,239,0.7)';
    ctx.stroke();

    // Almost-full overlap
    ctx.fillStyle = 'rgba(239,83,80,0.15)';
    ctx.beginPath();
    ctx.arc((w * 3) / 4, cyO, rO * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(236,64,122,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('RSI', bX1, cyO - rO - 4);
    ctx.fillStyle = 'rgba(217,70,239,0.9)';
    ctx.fillText('STOCHASTIC', bX2, cyO - rO - 4);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('~22%', (w * 3) / 4, cyO + 3);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('barely tighter', (w * 3) / 4, cyO + 13);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'italic 7px system-ui';
    ctx.fillText('same axis \u2014 same info twice', (w * 3) / 4, cyO + rO + 18);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stack indicators that answer DIFFERENT questions, not the same question twice', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: The 2-3 Sweet Spot
// Bar chart — as indicators added, edge rises then frequency collapses
// ============================================================
function SweetSpotAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 2-3 Sweet Spot', w / 2, 14);

    const padL = 40;
    const padR = w - 40;
    const padT = 32;
    const padB = h - 40;
    const chartH = padB - padT;
    const chartW = padR - padL;

    // Y axis
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padB);
    ctx.lineTo(padR, padB);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('100%', padL - 4, padT + 4);
    ctx.fillText('50%', padL - 4, padT + chartH / 2 + 2);
    ctx.fillText('0%', padL - 4, padB + 2);

    // Data: 1, 2, 3, 4, 5 indicators
    const data = [
      { n: 1, freq: 25, edge: 8, color: '#8A8A8A' },
      { n: 2, freq: 6, edge: 34, color: '#22C55E' },
      { n: 3, freq: 1.5, edge: 48, color: '#FFB300' },
      { n: 4, freq: 0.4, edge: 52, color: '#F9A825' },
      { n: 5, freq: 0.08, edge: 54, color: '#EF5350' },
    ];

    const barW = chartW / (data.length * 2);

    data.forEach((d, i) => {
      const cx = padL + chartW / data.length * i + chartW / data.length / 2;

      // Frequency bar (left side)
      const freqH = (d.freq / 100) * chartH;
      const freqX = cx - barW - 2;

      // Animate in
      const revealT = Math.min(1, Math.max(0, (t - i * 0.3) * 2));
      const freqHAnim = freqH * revealT;

      ctx.fillStyle = d.color + '66';
      ctx.fillRect(freqX, padB - freqHAnim, barW, freqHAnim);
      ctx.strokeStyle = d.color + 'cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(freqX, padB - freqHAnim, barW, freqHAnim);

      // Edge bar (right side)
      const edgeH = (d.edge / 100) * chartH;
      const edgeX = cx + 2;
      const edgeHAnim = edgeH * revealT;

      ctx.fillStyle = '#FFB300' + '66';
      ctx.fillRect(edgeX, padB - edgeHAnim, barW, edgeHAnim);
      ctx.strokeStyle = '#FFB300' + 'cc';
      ctx.strokeRect(edgeX, padB - edgeHAnim, barW, edgeHAnim);

      // Label below
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.n}`, cx, padB + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '6px system-ui';
      ctx.fillText(d.n === 1 ? 'indicator' : 'indicators', cx, padB + 24);

      // Values on top
      if (revealT >= 0.8) {
        ctx.fillStyle = d.color;
        ctx.font = 'bold 7px system-ui';
        ctx.fillText(`${d.freq}%`, freqX + barW / 2, padB - freqHAnim - 3);
        ctx.fillStyle = '#FFB300';
        ctx.fillText(`${d.edge}%`, edgeX + barW / 2, padB - edgeHAnim - 3);
      }
    });

    // Highlight sweet spot (2-3)
    const sweetX1 = padL + chartW / 5 * 1;
    const sweetX2 = padL + chartW / 5 * 3;
    const pulse = 0.2 + Math.sin(t * 3) * 0.05;
    ctx.fillStyle = `rgba(255,179,0,${pulse})`;
    ctx.fillRect(sweetX1, padT, sweetX2 - sweetX1, chartH);

    // Legend
    const legX = padL + 10;
    const legY = padT + 10;
    ctx.fillStyle = 'rgba(138,138,138,0.8)';
    ctx.fillRect(legX, legY, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Frequency', legX + 11, legY + 7);

    ctx.fillStyle = '#FFB300cc';
    ctx.fillRect(legX + 70, legY, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Edge per fire', legX + 81, legY + 7);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('2-3 indicators is the sweet spot \u2014 beyond, frequency dies faster than edge grows', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={270} />;
}

// ============================================================
// ANIMATION 4: Pattern #1 — The Breakout Launch
// Sessions+ overlap + MSI Expansion + MER > 70
// ============================================================
function Pattern1BreakoutLaunchAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #1 \u2014 The Breakout Launch', w / 2, 14);

    // Three stacked mini panels + price on top
    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.35;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    // Price with breakout
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    // Consolidation then breakout
    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;
    const breakIdx = Math.floor(n * 0.55);

    ctx.strokeStyle = 'rgba(34,197,94,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let y;
      if (i < breakIdx) {
        y = midP + Math.sin(i * 0.4 + t) * 6;
      } else {
        const progress = (i - breakIdx) / (n - breakIdx);
        y = midP - progress * priceH * 0.35 + Math.sin(i * 0.4 + t) * 4;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Breakout line
    const breakX = padL + breakIdx * xStep;
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(breakX, priceY);
    ctx.lineTo(breakX, priceB);
    ctx.stroke();
    ctx.setLineDash([]);
    const pulse = 1 + Math.sin(t * 4) * 0.2;
    ctx.fillStyle = '#FFB300';
    ctx.font = `bold ${7 * pulse}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('\u25BC LAUNCH', breakX, priceY + 10);

    // Panel 1: Sessions+ (overlap window)
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(139,92,246,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(139,92,246,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(139,92,246,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SESSIONS+', padL + 4, p1Y + 9);

    // Highlight overlap window
    const overlapX1 = padL + xStep * 20;
    const overlapX2 = padL + xStep * 55;
    ctx.fillStyle = 'rgba(245,158,11,0.3)';
    ctx.fillRect(overlapX1, p1Y + 12, overlapX2 - overlapX1, panelH - 14);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LDN-NY OVERLAP', (overlapX1 + overlapX2) / 2, p1Y + panelH / 2 + 6);

    // Panel 2: MSI (expansion starting at breakout)
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(14,165,233,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MSI', padL + 4, p2Y + 9);

    // Color strip — grey before, green after
    const msiStripY = p2Y + 14;
    const msiStripH = panelH - 18;
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const col = i < breakIdx ? '#8A8A8A' : '#22C55E';
      ctx.fillStyle = col;
      ctx.fillRect(x, msiStripY, xStep, msiStripH);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2192 EXPANSION', padL + 40 * xStep, p2Y + 9);

    // Panel 3: MER (crosses 70)
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p3Y + 9);

    // MER line — stays around 50, then rises above 70
    const merLineY = p3Y + 14;
    const merLineH = panelH - 18;
    const threshold70Y = merLineY + merLineH * 0.3;
    ctx.strokeStyle = 'rgba(255,179,0,0.3)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padL, threshold70Y);
    ctx.lineTo(padR, threshold70Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('70', padR - 2, threshold70Y - 1);

    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let merVal;
      if (i < breakIdx) merVal = 45 + Math.sin(i * 0.3) * 8;
      else {
        const progress = (i - breakIdx) / (n - breakIdx);
        merVal = 45 + progress * 40;
      }
      const y = merLineY + merLineH - (merVal / 100) * merLineH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three orthogonal axes align: time \u00d7 regime \u00d7 geometry \u2192 trade', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// ANIMATION 5: Pattern #2 — The Compression Coil
// MSI Compression + MER grey + MPR building
// ============================================================
function Pattern2CompressionCoilAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #2 \u2014 The Compression Coil', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.4;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    // Price: coiling pattern — range getting tighter
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;

    // Draw coiling triangular cone — range narrowing
    ctx.strokeStyle = 'rgba(138,138,138,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const coneW = priceH * 0.4 * (1 - i / n * 0.85);
      const y = midP - coneW;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const coneW = priceH * 0.4 * (1 - i / n * 0.85);
      const y = midP + coneW;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Price coiling within
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const amp = priceH * 0.35 * (1 - i / n * 0.85);
      const y = midP + Math.sin(i * 0.8 + t * 2) * amp;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Coiling spring indicator at the end
    const pulseX = padR - 20;
    const pulse = 1 + Math.sin(t * 4) * 0.3;
    ctx.fillStyle = `rgba(255,179,0,${0.4 + Math.sin(t * 4) * 0.3})`;
    ctx.beginPath();
    ctx.arc(pulseX, midP, 6 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('COIL TIGHT', padR - 4, priceY + 10);

    // Panel 1: MSI = COMPRESSION
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(14,165,233,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MSI', padL + 4, p1Y + 9);

    // Solid grey strip
    ctx.fillStyle = '#8A8A8A';
    ctx.fillRect(padL + 4, p1Y + 14, padR - padL - 8, panelH - 18);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMPRESSION \u2014 no trend license', w / 2, p1Y + panelH / 2 + 4);

    // Panel 2: MER = grey zone (30-70), flat
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p2Y + 9);

    // Grey zone shading
    const merLineY = p2Y + 14;
    const merLineH = panelH - 18;
    ctx.fillStyle = 'rgba(138,138,138,0.2)';
    ctx.fillRect(padL + 4, merLineY + merLineH * 0.2, padR - padL - 8, merLineH * 0.6);

    ctx.strokeStyle = '#8A8A8A';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const merVal = 45 + Math.sin(i * 0.3 + t) * 5;
      const y = merLineY + merLineH - (merVal / 100) * merLineH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('~45 grey', padR - 4, p2Y + 9);

    // Panel 3: MPR — building bipolar histogram
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(236,64,122,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(236,64,122,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(236,64,122,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MPR', padL + 4, p3Y + 9);

    // Histogram building up
    const mprMid = p3Y + (panelH + 14 + panelH) / 2 - 4;
    const mprLineY = p3Y + 14;
    const mprLineH = panelH - 18;
    const mprCenterY = mprLineY + mprLineH / 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, mprCenterY);
    ctx.lineTo(padR, mprCenterY);
    ctx.stroke();

    const nBars = 30;
    const bw = (padR - padL) / nBars;
    for (let i = 0; i < nBars; i++) {
      const x = padL + i * bw;
      // Build up over time, biased positive
      const growth = i / nBars;
      const v = Math.sin(i * 0.5 + t) * (mprLineH / 2 - 3) * growth;
      const bh = v * 0.8 + growth * (mprLineH / 2 - 3) * 0.5;
      const bcolor = bh > 0 ? '#EC407A' : '#8A8A8A';
      ctx.fillStyle = bcolor;
      if (bh > 0) {
        ctx.fillRect(x + 0.5, mprCenterY - bh, bw - 1, bh);
      } else {
        ctx.fillRect(x + 0.5, mprCenterY, bw - 1, -bh);
      }
    }

    ctx.fillStyle = 'rgba(236,64,122,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('\u2191 building', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pre-position for the break \u2014 don\'t chase it after launch', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 6: Pattern #3 — The Clean Fade
// MSI Exhaustion + MER falling + MAE extension
// ============================================================
function Pattern3CleanFadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #3 \u2014 The Clean Fade', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.4;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    // Price: extended rally that reverses
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;
    const peakIdx = Math.floor(n * 0.65);

    // Envelope
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      ctx.lineTo(x, midP - priceH * 0.25);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,197,94,0.7)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MAE upper', padR - 4, midP - priceH * 0.25 - 2);

    // Price — rising through envelope then reversing
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let y;
      if (i <= peakIdx) {
        const prog = i / peakIdx;
        y = midP - prog * priceH * 0.38 + Math.sin(i * 0.4) * 3;
      } else {
        const prog = (i - peakIdx) / (n - peakIdx);
        y = midP - priceH * 0.38 + prog * priceH * 0.3 + Math.sin(i * 0.4) * 3;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Peak marker
    const peakX = padL + peakIdx * xStep;
    const peakY = midP - priceH * 0.38;
    const pulse = 1 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = '#EF5350';
    ctx.beginPath();
    ctx.arc(peakX, peakY, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(peakX, peakY, 4 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2193 FADE', peakX, peakY - 10);

    // Panel 1: MSI = EXHAUSTION
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(249,168,37,0.05)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(249,168,37,0.3)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(249,168,37,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MSI', padL + 4, p1Y + 9);

    // Strip: green then amber
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const col = i < peakIdx - 8 ? '#22C55E' : '#F9A825';
      ctx.fillStyle = col;
      ctx.fillRect(x, p1Y + 14, xStep, panelH - 18);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EXPANSION \u2192 EXHAUSTION', w / 2, p1Y + panelH / 2 + 4);

    // Panel 2: MER falling
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p2Y + 9);

    const merLineY = p2Y + 14;
    const merLineH = panelH - 18;
    const threshold70Y = merLineY + merLineH * 0.3;
    ctx.strokeStyle = 'rgba(255,179,0,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padL, threshold70Y);
    ctx.lineTo(padR, threshold70Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let merVal;
      if (i <= peakIdx) merVal = 60 + (i / peakIdx) * 20;
      else {
        const prog = (i - peakIdx) / (n - peakIdx);
        merVal = 80 - prog * 40;
      }
      const y = merLineY + merLineH - (merVal / 100) * merLineH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,179,0,0.8)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('80 \u2193 40', padR - 4, p2Y + 9);

    // Panel 3: MAE stress
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(239,83,80,0.05)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(239,83,80,0.25)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MAE', padL + 4, p3Y + 9);

    // Stress level going from normal to extreme
    const stressY = p3Y + 14;
    const stressH = panelH - 18;
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const stress = i <= peakIdx ? 0.2 + (i / peakIdx) * 0.7 : Math.max(0.1, 0.9 - (i - peakIdx) / (n - peakIdx) * 0.6);
      const col = stress > 0.7 ? '#EF5350' : stress > 0.4 ? '#F9A825' : '#8A8A8A';
      ctx.fillStyle = col;
      const barH = stress * stressH;
      ctx.fillRect(x, stressY + stressH - barH, xStep, barH);
    }
    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('upper stress \u2191', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Regime exhausts + efficiency fails + structure stretched \u2192 fade the peak', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 7: Pattern #4 — The Absorption Reversal
// ERD absorption + MAZ level + MER low
// ============================================================
function Pattern4AbsorptionReversalAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #4 \u2014 The Absorption Reversal', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.4;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    // Price: decline into MAZ level, bounces
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;
    const mazLevel = priceY + priceH * 0.75;

    // MAZ band
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.fillRect(padL, mazLevel - 6, padR - padL, 12);
    ctx.strokeStyle = 'rgba(34,197,94,0.6)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, mazLevel);
    ctx.lineTo(padR, mazLevel);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,197,94,0.8)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MAZ support', padR - 4, mazLevel - 2);

    const bottomIdx = Math.floor(n * 0.55);

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let y;
      if (i <= bottomIdx) {
        const prog = i / bottomIdx;
        y = midP + prog * priceH * 0.3 + Math.sin(i * 0.5) * 3;
      } else {
        const prog = (i - bottomIdx) / (n - bottomIdx);
        y = mazLevel - prog * priceH * 0.25 + Math.sin(i * 0.5) * 3;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bounce marker
    const bounceX = padL + bottomIdx * xStep;
    const pulse = 1 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(bounceX, mazLevel + 2, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(bounceX, mazLevel + 2, 4 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2191 BOUNCE', bounceX, mazLevel + 22);

    // Panel 1: ERD with absorption marker
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(239,83,80,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(239,83,80,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ERD', padL + 4, p1Y + 9);

    const erdMid = p1Y + 14 + (panelH - 18) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, erdMid);
    ctx.lineTo(padR, erdMid);
    ctx.stroke();

    // Histogram bars
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v;
      if (i === bottomIdx) v = -30;
      else v = Math.sin(i * 0.4 + t) * 8;
      const bh = v / 50 * (panelH - 18) / 2;
      const bcolor = v >= 0 ? '#26A69A' : '#EF5350';
      ctx.fillStyle = bcolor;
      if (bh > 0) ctx.fillRect(x + 0.3, erdMid - bh, xStep - 0.6, bh);
      else ctx.fillRect(x + 0.3, erdMid, xStep - 0.6, -bh);
    }

    // Absorption circle on bottom bar
    const absorbX = padL + bottomIdx * xStep + xStep / 2;
    ctx.fillStyle = '#EF5350';
    ctx.beginPath();
    ctx.arc(absorbX, erdMid + 12, 3.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(absorbX, erdMid + 12, 3.5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('ABSORPTION', padR - 4, p1Y + 9);

    // Panel 2: MER low
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p2Y + 9);

    const merLineY2 = p2Y + 14;
    const merLineH2 = panelH - 18;
    const low30Y = merLineY2 + merLineH2 * 0.7;
    ctx.fillStyle = 'rgba(239,83,80,0.15)';
    ctx.fillRect(padL, low30Y, padR - padL, merLineY2 + merLineH2 - low30Y);

    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const merVal = 22 + Math.sin(i * 0.5 + t) * 6;
      const y = merLineY2 + merLineH2 - (merVal / 100) * merLineH2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MER 22 \u2014 mean-rev licensed', padR - 4, p2Y + 9);

    // Panel 3: MAZ structural context
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(34,197,94,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MAZ', padL + 4, p3Y + 9);

    // Horizontal zones
    for (let j = 0; j < 3; j++) {
      const zoneY = p3Y + 14 + (j + 0.5) * (panelH - 18) / 3;
      ctx.strokeStyle = `rgba(34,197,94,${0.8 - j * 0.2})`;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(padL + 4, zoneY);
      ctx.lineTo(padR - 4, zoneY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('price at strong zone', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Event + Level + Efficiency geometry license \u2192 the cleanest mean-rev setup', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 8: Pattern #5 — The Session Handoff Trade
// Sessions+ seam + VSI expansion + MPR release
// ============================================================
function Pattern5SessionHandoffAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #5 \u2014 The Session Handoff', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.4;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;

    // Seam at LDN open
    const seamIdx = Math.floor(n * 0.45);
    const seamX = padL + seamIdx * xStep;

    // Shade regions: Asia quiet (grey) | LDN active (purple)
    ctx.fillStyle = 'rgba(138,138,138,0.08)';
    ctx.fillRect(padL, priceY, seamX - padL, priceH);
    ctx.fillStyle = 'rgba(139,92,246,0.1)';
    ctx.fillRect(seamX, priceY, padR - seamX, priceH);

    // Seam line
    ctx.strokeStyle = 'rgba(139,92,246,0.7)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(seamX, priceY);
    ctx.lineTo(seamX, priceB);
    ctx.stroke();
    ctx.setLineDash([]);

    const pulse = 1 + Math.sin(t * 3) * 0.2;
    ctx.fillStyle = '#8B5CF6';
    ctx.font = `bold ${8 * pulse}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('LDN OPEN', seamX, priceY + 12);

    // Price: quiet range then directional after seam
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let y;
      if (i < seamIdx) {
        y = midP + Math.sin(i * 0.8) * 4;
      } else {
        const prog = (i - seamIdx) / (n - seamIdx);
        y = midP - prog * priceH * 0.35 + Math.sin(i * 0.5) * 3;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Panel 1: Sessions+
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(139,92,246,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(139,92,246,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(139,92,246,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SESSIONS+', padL + 4, p1Y + 9);

    // Visual: Asia block then LDN block
    ctx.fillStyle = 'rgba(138,138,138,0.4)';
    ctx.fillRect(padL + 4, p1Y + 14, seamX - padL - 4, panelH - 18);
    ctx.fillStyle = 'rgba(139,92,246,0.5)';
    ctx.fillRect(seamX, p1Y + 14, padR - seamX - 4, panelH - 18);

    ctx.fillStyle = '#8A8A8A';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ASIA', (padL + seamX) / 2, p1Y + panelH / 2 + 4);
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText('LDN', (seamX + padR) / 2, p1Y + panelH / 2 + 4);

    // Panel 2: VSI expansion
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(217,70,239,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(217,70,239,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(217,70,239,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('VSI', padL + 4, p2Y + 9);

    const vsiMid = p2Y + 14 + (panelH - 18) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, vsiMid);
    ctx.lineTo(padR, vsiMid);
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v;
      if (i < seamIdx) v = Math.sin(i * 0.5) * 4;
      else {
        const prog = (i - seamIdx) / (n - seamIdx);
        v = prog * 25 + Math.sin(i * 0.5) * 3;
      }
      const bh = v / 30 * (panelH - 18) / 2;
      const bcolor = v >= 8 ? '#D946EF' : v >= -8 ? '#8A8A8A' : '#26A69A';
      ctx.fillStyle = bcolor;
      if (bh > 0) ctx.fillRect(x + 0.3, vsiMid - bh, xStep - 0.6, bh);
      else ctx.fillRect(x + 0.3, vsiMid, xStep - 0.6, -bh);
    }

    ctx.fillStyle = 'rgba(217,70,239,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('EXPANSION', padR - 4, p2Y + 9);

    // Panel 3: MPR release
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(236,64,122,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(236,64,122,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(236,64,122,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MPR', padL + 4, p3Y + 9);

    const mprMid = p3Y + 14 + (panelH - 18) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, mprMid);
    ctx.lineTo(padR, mprMid);
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v;
      if (i < seamIdx) v = Math.sin(i * 0.5) * 4;
      else {
        const prog = (i - seamIdx) / (n - seamIdx);
        v = -20 - prog * 40;
      }
      const bh = v / 70 * (panelH - 18) / 2;
      const bcolor = v >= 0 ? '#EC407A' : '#EF5350';
      ctx.fillStyle = bcolor;
      if (bh > 0) ctx.fillRect(x + 0.3, mprMid - bh, xStep - 0.6, bh);
      else ctx.fillRect(x + 0.3, mprMid, xStep - 0.6, -bh);
    }

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('BEARISH RELEASE', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Session seam delivers liquidity; vol expands; pressure releases \u2192 ride the handoff', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 9: Pattern #6 — The Participation Surge
// MPG strong + MSI expansion + MER > 60
// ============================================================
function Pattern6ParticipationSurgeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #6 \u2014 The Participation Surge', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.38;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;

    // Price: accelerating trend
    ctx.strokeStyle = 'rgba(34,197,94,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const accel = Math.pow(i / n, 1.3);
      const y = midP - accel * priceH * 0.35 + Math.sin(i * 0.5) * 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('TREND \u2191\u2191', padR - 6, priceY + 10);

    // Panel 1: MPG strong
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(14,165,233,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(14,165,233,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(14,165,233,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MPG', padL + 4, p1Y + 9);

    // Growing histogram
    const mpgBase = p1Y + panelH - 6;
    const mpgH = panelH - 18;
    const tiers = [
      { y: mpgH * 0.25, color: '#EF5350', label: 'EXTREME' },
      { y: mpgH * 0.5, color: '#F9A825', label: 'STRONG' },
      { y: mpgH * 0.75, color: '#26A69A', label: 'BUILDING' },
    ];
    tiers.forEach(tier => {
      ctx.strokeStyle = tier.color + '44';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(padL + 4, mpgBase - tier.y);
      ctx.lineTo(padR - 4, mpgBase - tier.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const participation = 20 + (i / n) * 70;
      const bh = (participation / 100) * mpgH;
      const bcolor = participation > 70 ? '#F9A825' : participation > 50 ? '#26A69A' : '#8A8A8A';
      ctx.fillStyle = bcolor;
      ctx.fillRect(x + 0.3, mpgBase - bh, xStep - 0.6, bh);
    }

    ctx.fillStyle = 'rgba(249,168,37,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('STRONG tier', padR - 4, p1Y + 9);

    // Panel 2: MSI expansion
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(34,197,94,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MSI', padL + 4, p2Y + 9);

    ctx.fillStyle = '#22C55E';
    ctx.fillRect(padL + 4, p2Y + 14, padR - padL - 8, panelH - 18);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EXPANSION \u2014 trend licensed', w / 2, p2Y + panelH / 2 + 4);

    // Panel 3: MER > 60
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(245,158,11,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p3Y + 9);

    const merY = p3Y + 14;
    const merH = panelH - 18;
    const threshold70Y = merY + merH * 0.3;
    ctx.fillStyle = 'rgba(38,166,154,0.15)';
    ctx.fillRect(padL, merY, padR - padL, threshold70Y - merY);

    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const merVal = 55 + (i / n) * 25 + Math.sin(i * 0.3 + t) * 3;
      const y = merY + merH - (merVal / 100) * merH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MER 60 \u2192 80', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Real participation + regime + efficient travel \u2192 the institutional trend entry', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 10: Pattern #7 — The Trap Fade
// MPR trap + upstream warning layers
// ============================================================
function Pattern7TrapFadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern #7 \u2014 The Trap Fade', w / 2, 14);

    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 30;
    const totalH = padB - padT;

    const priceH = totalH * 0.4;
    const priceY = padT;
    const priceB = priceY + priceH;

    const panelsY = priceB + 4;
    const panelsH = padB - panelsY;
    const panelH = (panelsH - 4) / 3;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, priceY, padR - padL, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, priceY, padR - padL, priceH);

    const n = 60;
    const xStep = (padR - padL) / (n - 1);
    const midP = priceY + priceH / 2;
    const fakeHigh = Math.floor(n * 0.5);
    const fakeBreakX = padL + fakeHigh * xStep;

    // False breakout line
    ctx.strokeStyle = 'rgba(249,168,37,0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, midP - priceH * 0.3);
    ctx.lineTo(padR, midP - priceH * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(249,168,37,0.7)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('resistance', padR - 4, midP - priceH * 0.3 - 2);

    // Price: fake breakout + reversal
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let y;
      if (i < fakeHigh) {
        const prog = i / fakeHigh;
        y = midP - prog * priceH * 0.35 + Math.sin(i * 0.5) * 3;
      } else if (i < fakeHigh + 4) {
        y = midP - priceH * 0.35;
      } else {
        const prog = (i - fakeHigh - 4) / (n - fakeHigh - 4);
        y = midP - priceH * 0.35 + prog * priceH * 0.45 + Math.sin(i * 0.5) * 3;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Trap marker
    const pulse = 1 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = '#F9A825';
    ctx.beginPath();
    ctx.arc(fakeBreakX, midP - priceH * 0.35, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(fakeBreakX, midP - priceH * 0.35, 4 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u26A0 FALSE BREAK', fakeBreakX, midP - priceH * 0.35 - 10);

    // Panel 1: MPR = bull trap state
    const p1Y = panelsY;
    ctx.fillStyle = 'rgba(236,64,122,0.04)';
    ctx.fillRect(padL, p1Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(236,64,122,0.2)';
    ctx.strokeRect(padL, p1Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(236,64,122,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MPR', padL + 4, p1Y + 9);

    // Strip: green then yellow-trap
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const col = i < fakeHigh ? '#22C55E' : '#F9A825';
      ctx.fillStyle = col;
      ctx.fillRect(x, p1Y + 14, xStep, panelH - 18);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RELEASE \u2192 BULL TRAP', w / 2, p1Y + panelH / 2 + 4);

    // Panel 2: MSI warning (exhaustion rising)
    const p2Y = p1Y + panelH + 2;
    ctx.fillStyle = 'rgba(249,168,37,0.04)';
    ctx.fillRect(padL, p2Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(249,168,37,0.2)';
    ctx.strokeRect(padL, p2Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(249,168,37,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MSI', padL + 4, p2Y + 9);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const col = i < fakeHigh - 10 ? '#22C55E' : '#F9A825';
      ctx.fillStyle = col;
      ctx.fillRect(x, p2Y + 14, xStep, panelH - 18);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EXPANSION \u2192 EXHAUSTION (was the warning)', w / 2, p2Y + panelH / 2 + 4);

    // Panel 3: ERD absorption at trap
    const p3Y = p2Y + panelH + 2;
    ctx.fillStyle = 'rgba(239,83,80,0.04)';
    ctx.fillRect(padL, p3Y, padR - padL, panelH);
    ctx.strokeStyle = 'rgba(239,83,80,0.2)';
    ctx.strokeRect(padL, p3Y, padR - padL, panelH);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ERD', padL + 4, p3Y + 9);

    const erdMid3 = p3Y + 14 + (panelH - 18) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, erdMid3);
    ctx.lineTo(padR, erdMid3);
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v;
      if (i === fakeHigh - 1 || i === fakeHigh) v = 35;
      else v = Math.sin(i * 0.5 + t) * 6;
      const bh = v / 50 * (panelH - 18) / 2;
      const bcolor = v >= 0 ? '#26A69A' : '#EF5350';
      ctx.fillStyle = bcolor;
      if (bh > 0) ctx.fillRect(x + 0.3, erdMid3 - bh, xStep - 0.6, bh);
      else ctx.fillRect(x + 0.3, erdMid3, xStep - 0.6, -bh);
    }
    // Circle on trap bar (absorption)
    const trapX = padL + (fakeHigh - 0.5) * xStep;
    ctx.fillStyle = '#26A69A';
    ctx.beginPath();
    ctx.arc(trapX, erdMid3 - 14, 3.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(trapX, erdMid3 - 14, 3.5 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('VACUUM \u2014 hidden distribution', padR - 4, p3Y + 9);

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPR flips to trap + upstream warnings already fired \u2192 fade the fake break', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 11: Pattern Selection Framework
// Shows styles (trend/fade/rev) mapped to patterns
// ============================================================
function PatternSelectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Selecting Patterns for Your Style', w / 2, 14);

    // Three style rows mapped to patterns
    const rows = [
      { style: 'TREND TRADER', color: '#22C55E', patterns: ['#1 Launch', '#5 Handoff', '#6 Surge'] },
      { style: 'MEAN-REV TRADER', color: '#F59E0B', patterns: ['#3 Fade', '#4 Absorption', '#7 Trap'] },
      { style: 'BREAKOUT HUNTER', color: '#EC407A', patterns: ['#1 Launch', '#2 Coil', '#5 Handoff'] },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 36;
    const padB = h - 20;
    const rowH = (padB - padT) / rows.length;

    rows.forEach((r, i) => {
      const y = padT + i * rowH;
      const activeRow = Math.floor(t * 0.5) % rows.length;
      const isActive = i === activeRow;
      const alpha = isActive ? 1 : 0.35;

      // Style label box
      const styleW = 140;
      ctx.fillStyle = isActive ? r.color + '22' : r.color + '10';
      ctx.fillRect(padL, y + 8, styleW, rowH - 16);
      ctx.strokeStyle = r.color + (isActive ? 'cc' : '55');
      ctx.strokeRect(padL, y + 8, styleW, rowH - 16);

      ctx.fillStyle = r.color;
      ctx.font = `bold ${9 * (isActive ? 1 : 0.9)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(r.style, padL + styleW / 2, y + rowH / 2 + 3);

      // Arrow
      ctx.fillStyle = `rgba(255,255,255,${0.4 * alpha})`;
      ctx.font = 'bold 12px system-ui';
      ctx.fillText('\u2192', padL + styleW + 12, y + rowH / 2 + 4);

      // Pattern chips
      const chipStartX = padL + styleW + 28;
      const chipW = (padR - chipStartX - 12) / r.patterns.length;
      r.patterns.forEach((p, j) => {
        const cx = chipStartX + j * chipW;
        ctx.fillStyle = isActive ? r.color + '18' : r.color + '08';
        ctx.fillRect(cx, y + 10, chipW - 6, rowH - 20);
        ctx.strokeStyle = r.color + (isActive ? '88' : '33');
        ctx.strokeRect(cx, y + 10, chipW - 6, rowH - 20);
        ctx.fillStyle = r.color + Math.floor(255 * alpha).toString(16).padStart(2, '0');
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p, cx + (chipW - 6) / 2, y + rowH / 2 + 3);
      });
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Master 2-3 patterns aligned to your style before attempting the full catalog', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 12: Combining Patterns — When Multiple Fire
// Shows two overlapping patterns and how to resolve
// ============================================================
function CombiningPatternsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('When Multiple Patterns Fire Together', w / 2, 14);

    // Two horizontal pattern tracks with overlap zone
    const padL = 20;
    const padR = w - 20;
    const padT = 35;
    const padB = h - 30;
    const trackH = 50;

    // Track 1
    const t1Y = padT + 15;
    ctx.fillStyle = 'rgba(34,197,94,0.08)';
    ctx.fillRect(padL + (padR - padL) * 0.05, t1Y, (padR - padL) * 0.55, trackH);
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padL + (padR - padL) * 0.05, t1Y, (padR - padL) * 0.55, trackH);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('#6 Participation Surge', padL + (padR - padL) * 0.08, t1Y + 18);
    ctx.fillStyle = 'rgba(34,197,94,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('MPG strong + MSI expansion + MER > 60', padL + (padR - padL) * 0.08, t1Y + 32);
    ctx.fillText('Bias: long', padL + (padR - padL) * 0.08, t1Y + 43);

    // Track 2
    const t2Y = t1Y + trackH + 25;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(padL + (padR - padL) * 0.4, t2Y, (padR - padL) * 0.55, trackH);
    ctx.strokeStyle = '#F59E0B';
    ctx.strokeRect(padL + (padR - padL) * 0.4, t2Y, (padR - padL) * 0.55, trackH);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('#3 Clean Fade (competing)', padL + (padR - padL) * 0.43, t2Y + 18);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('MSI exhaustion + MER falling + MAE stress', padL + (padR - padL) * 0.43, t2Y + 32);
    ctx.fillText('Bias: short', padL + (padR - padL) * 0.43, t2Y + 43);

    // Overlap zone
    const overlapX1 = padL + (padR - padL) * 0.4;
    const overlapX2 = padL + (padR - padL) * 0.6;

    const pulse = 0.3 + Math.sin(t * 3) * 0.15;
    ctx.fillStyle = `rgba(239,83,80,${pulse})`;
    ctx.fillRect(overlapX1, padT + 5, overlapX2 - overlapX1, padB - padT - 5);
    ctx.strokeStyle = 'rgba(239,83,80,0.7)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(overlapX1, padT + 5, overlapX2 - overlapX1, padB - padT - 5);
    ctx.setLineDash([]);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONFLICT ZONE', (overlapX1 + overlapX2) / 2, padT + 2);

    // Resolution arrow
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STAND ASIDE in the conflict', (overlapX1 + overlapX2) / 2, padB + 2);
    ctx.fillText('until one pattern resolves', (overlapX1 + overlapX2) / 2, padB + 12);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 13: Redundancy Trap — Common Mistake
// ============================================================
function RedundancyTrapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u26A0 The Redundancy Trap', w / 2, 14);

    // Three overlapping circles of the same "color" (momentum)
    const cx = w / 2;
    const cy = h / 2 + 10;
    const r = Math.min(h * 0.28, w * 0.14);
    const off = r * 0.4;

    const positions = [
      { x: cx - off * 0.7, y: cy - off * 0.5, label: 'RSI', color: 'rgba(236,64,122,0.15)', stroke: 'rgba(236,64,122,0.7)' },
      { x: cx + off * 0.7, y: cy - off * 0.5, label: 'STOCH', color: 'rgba(217,70,239,0.15)', stroke: 'rgba(217,70,239,0.7)' },
      { x: cx, y: cy + off * 0.6, label: 'CCI', color: 'rgba(239,83,80,0.15)', stroke: 'rgba(239,83,80,0.7)' },
    ];

    positions.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Label
      const lx = p.x;
      const ly = p.y - r - 6;
      ctx.fillStyle = p.stroke;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, lx, ly);
    });

    // Center — all overlap
    const pulse = 1 + Math.sin(t * 3) * 0.2;
    ctx.fillStyle = `rgba(239,83,80,${0.5 + Math.sin(t * 3) * 0.1})`;
    ctx.font = `bold ${10 * pulse}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('~22%', cx, cy + 4);

    // Caption
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'italic 7px system-ui';
    ctx.fillText('All three ask the same question: "is momentum strong?"', cx, cy + 40);
    ctx.fillText('Adding more redundant indicators barely reduces the license window.', cx, cy + 52);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('Zero combinatorial edge \u2014 just theatrical confirmation.', cx, cy + 68);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 14: Pattern Library at a Glance
// Grid overview of all 7 patterns
// ============================================================
function PatternLibraryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Playbook Pattern Library \u2014 At a Glance', w / 2, 14);

    const patterns = [
      { n: '#1', name: 'Launch', stack: 'Sessions + MSI + MER', bias: 'LONG', color: '#22C55E' },
      { n: '#2', name: 'Coil', stack: 'MSI + MER + MPR', bias: 'BREAK', color: '#FFB300' },
      { n: '#3', name: 'Fade', stack: 'MSI + MER + MAE', bias: 'SHORT', color: '#EF5350' },
      { n: '#4', name: 'Absorption', stack: 'ERD + MAZ + MER', bias: 'REV', color: '#26A69A' },
      { n: '#5', name: 'Handoff', stack: 'Sessions + VSI + MPR', bias: 'TREND', color: '#8B5CF6' },
      { n: '#6', name: 'Surge', stack: 'MPG + MSI + MER', bias: 'LONG', color: '#22C55E' },
      { n: '#7', name: 'Trap', stack: 'MPR + MSI + ERD', bias: 'FADE', color: '#F9A825' },
    ];

    const cols = 4;
    const rows = 2;
    const padL = 15;
    const padR = w - 15;
    const padT = 30;
    const padB = h - 18;
    const gridW = padR - padL;
    const gridH = padB - padT;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    const activeIdx = Math.floor(t) % patterns.length;

    patterns.forEach((p, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = padL + col * cellW;
      const y = padT + row * cellH;
      const isActive = i === activeIdx;

      const cardW = cellW - 8;
      const cardH = cellH - 8;

      ctx.fillStyle = isActive ? p.color + '22' : p.color + '08';
      ctx.fillRect(x + 4, y + 4, cardW, cardH);
      ctx.strokeStyle = isActive ? p.color : p.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x + 4, y + 4, cardW, cardH);

      // Number
      ctx.fillStyle = p.color + 'aa';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.n, x + 10, y + 17);

      // Name
      ctx.fillStyle = p.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + 4 + cardW / 2, y + 33);

      // Stack
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.stack, x + 4 + cardW / 2, y + 48);

      // Bias tag
      ctx.fillStyle = p.color + '33';
      ctx.fillRect(x + 4 + cardW / 2 - 18, y + 54, 36, 11);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(p.bias, x + 4 + cardW / 2, y + 62);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Seven orthogonally-stacked patterns \u2014 a complete starter playbook', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// GAME DATA — 5 rounds
// ============================================================
const gameRounds = [
  {
    scenario: 'A trader stacks RSI, Stochastic, CCI, and MACD and argues "when all four confirm, the edge must be enormous." Using the combinatorial framework, assess this.',
    options: [
      { text: 'Wrong \u2014 all four measure the same dimension (momentum). Their license windows overlap heavily, so the intersection is only marginally smaller than any single one. The combinatorial edge comes from ORTHOGONAL stacking \u2014 indicators that answer DIFFERENT questions. Four momentum oscillators is theatrical confirmation, not edge.', correct: true, explain: 'The Redundancy Trap. P(A\u2229B) \u2248 P(A)\u00d7P(B) only holds when A and B are independent. When they measure the same underlying dimension, P(A\u2229B) \u2248 P(A), meaning adding B provides almost no additional filtering. Four redundant oscillators might tighten the window from 22% to 18% \u2014 no meaningful edge gain. Professionals stack ORTHOGONAL filters (regime + pressure + efficiency), not variants of the same thing.' },
      { text: 'Correct \u2014 four confirmations is better than one', correct: false, explain: 'This treats indicators as independent when they\u2019re not. Four momentum measures provide almost no information beyond what one provides. Edge comes from orthogonality, not redundancy.' },
    ],
  },
  {
    scenario: 'Pattern #1 (Breakout Launch) and Pattern #3 (Clean Fade) seem to fire simultaneously. Sessions+ shows LDN-NY overlap, MSI is flipping Expansion \u2192 Exhaustion, MER is grey 50-70. What\u2019s the disciplined move?',
    options: [
      { text: 'Stand aside. You\u2019re in a CONFLICT ZONE where two opposing patterns both have partial activation. Wait for one to clearly resolve before acting. Forcing a trade in the overlap region is the lowest-edge play \u2014 the dashboard itself is saying the state is transitioning.', correct: true, explain: 'Conflict zones are signals to wait, not trade. Patterns fire cleanly when conditions are unambiguous. If the dashboard produces two conflicting pattern signals, the market is mid-transition. Professional discipline is deferral. Amateurs guess which pattern will "win"; professionals wait for the market to declare.' },
      { text: 'Trade both simultaneously to hedge', correct: false, explain: 'Trading opposing patterns isn\u2019t hedging \u2014 it\u2019s paying two sets of fees for zero directional exposure during the lowest-certainty moment of the session. Wait for resolution.' },
    ],
  },
  {
    scenario: 'A new trader says: "I\u2019ll use all seven patterns from day one so I never miss a setup." Using learning-curve implications, what\u2019s the right advice?',
    options: [
      { text: 'Pick 2-3 patterns aligned to your style and master them first. Each pattern requires internalized recognition of 3-4 indicator states at once. Attempting all seven produces seven shallow recognitions instead of three deep ones. Trend traders: #1, #5, #6. Mean-rev: #3, #4, #7. Breakout: #1, #2, #5. Start narrow, grow wide later.', correct: true, explain: 'Pattern mastery is muscle memory; the brain builds solid recognition on a few things at once. Seven patterns sounds comprehensive but produces scattered execution. Mastery is narrow before it\u2019s wide \u2014 same principle master chess players apply to opening repertoires.' },
      { text: 'Yes \u2014 more patterns = more opportunity', correct: false, explain: 'More patterns = more cognitive load without more skill. Each pattern requires internalized recognition. All seven from day one guarantees you do all of them badly.' },
    ],
  },
  {
    scenario: 'Pattern #6 (Participation Surge) fires: MPG = STRONG, MSI = Expansion, MER = 68. But Sessions+ shows Asia lunch (lowest-liquidity window). Do you take it?',
    options: [
      { text: 'No. Session context is a MULTIPLIER on every pattern\u2019s edge. Same three-indicator stack, totally different expected outcome based on session. The 6% license window produces strong edge only when broader market state supports follow-through. Low-liquidity sessions reduce edge to near zero. Respect session context even when core conditions are met.', correct: true, explain: 'The pattern stack is internally valid, but sits in a context that destroys its edge. The follow-through mechanism isn\u2019t there in Asia lunch. Professionals treat session as a non-negotiable meta-filter sitting above every pattern. If session is wrong, no pattern fires.' },
      { text: 'Yes \u2014 all three pattern conditions are met', correct: false, explain: 'Mechanically true, edge-wise false. Conditions are met but follow-through context is absent. The combinatorial edge isn\u2019t just about indicator conditions \u2014 it\u2019s about the total market state including session.' },
    ],
  },
  {
    scenario: 'You\u2019re developing a new pattern combining MAE stress + MAZ zone entry. Both signal "price hit a structural level." You\u2019re considering adding MPG as a third filter. Does this stack hit the sweet spot?',
    options: [
      { text: 'Redundant risk \u2014 MAE and MAZ are both STRUCTURE indicators measuring "price meets level." Same dimension. A true orthogonal 3-stack would be: STRUCTURE (pick one of MAE/MAZ) + REGIME (MSI) + EFFICIENCY (MER) or EVENT (ERD). Each answers a different question. Swap one of the two structure indicators for a different dimension to recover sweet-spot status.', correct: true, explain: 'MAE (envelope) and MAZ (zones) are different tools measuring the same dimension \u2014 price relative to structural reference. Combining them adds detail to one axis rather than covering a second. Count axes, not indicators. Three indicators on two axes is NOT the same as three on three.' },
      { text: 'Perfect sweet spot \u2014 three indicators is optimal', correct: false, explain: 'Counting indicators rather than axes. Three indicators on two axes is 2-dimensional stacking with the appearance of three. The combinatorial edge grows when axes grow.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The Combinatorial Edge states that when two approximately-independent diagnostic indicators both license a setup, the joint license window is:', opts: ['Additively tighter: P(A\u2229B) \u2248 P(A) + P(B)', 'Multiplicatively tighter: P(A\u2229B) \u2248 P(A) \u00d7 P(B) \u2014 much rarer than either alone, where asymmetric edge lives', 'The same as either indicator alone', 'Wider than either indicator alone'], correct: 1, explain: 'Combinatorial math is multiplicative for independent events. 25% \u00d7 25% = 6%. That 6% window excludes almost all noise while remaining common enough to trade.' },
  { q: 'The distinction between orthogonal and redundant stacking is:', opts: ['Both are equivalent', 'Orthogonal indicators answer DIFFERENT questions (regime + pressure + efficiency); redundant indicators answer the SAME question multiple ways (RSI + Stochastic + CCI). Edge comes from orthogonal; redundant produces zero edge beyond one indicator alone.', 'Orthogonal is better in theory, redundant in practice', 'Neither matters with enough indicators'], correct: 1, explain: 'Orthogonal stacking is the core of the combinatorial edge. Two indicators on different axes multiply filtering power. Two on the same axis barely add filtering. Retail stacks 4+ redundant indicators for "confirmation" \u2014 no edge gain. Professionals stack 2-3 orthogonal filters for combinatorial tightening.' },
  { q: 'The 2-3 indicator sweet spot exists because:', opts: ['Two is always better than three', 'Frequency dies exponentially faster than edge grows \u2014 by the fourth indicator, the license window is so narrow you rarely get to trade, even though each adds more edge per fire', 'Three is the maximum a brain can process', 'Vendors recommend it'], correct: 1, explain: 'Each orthogonal indicator multiplies rarity. 2\u21923: window 6%\u21921.5% (acceptable). 3\u21924: 1.5%\u21920.4% (rarely see it). 4\u21925: 0.08% (won\u2019t see it in a year). The sweet spot balances edge per fire against frequency.' },
  { q: 'Pattern #1 (Breakout Launch) combines which three indicators?', opts: ['RSI + MACD + Bollinger Bands', 'Sessions+ (overlap window) + MSI (Expansion regime) + MER (&gt; 70 efficiency)', 'Only one indicator needed', 'All seven simultaneously'], correct: 1, explain: 'A clean three-axis stack: session context (WHEN), regime (WHAT), efficiency (HOW CLEAN). Three orthogonal filters \u2192 rare joint license \u2192 high-conviction setup.' },
  { q: 'When two patterns fire simultaneously with conflicting biases, the disciplined response is:', opts: ['Pick the pattern with more confirmations', 'Stand aside in the conflict zone until one pattern clearly resolves; trading in the overlap is the lowest-edge play', 'Trade both patterns to hedge', 'Flip a coin'], correct: 1, explain: 'Conflict zones are signals to wait. Patterns fire cleanly when unambiguous. Two conflicting patterns = market in transition. Defer, don\u2019t guess.' },
  { q: 'A trader stacks MAE + MAZ + MSI thinking they have a 3-indicator orthogonal stack. Where is the mistake?', opts: ['No mistake', 'MAE and MAZ both measure STRUCTURE (same axis), so this is really 2-axis stacking with three indicators. True 3-axis needs three different dimensions.', 'MSI should be removed', 'Four indicators would be better'], correct: 1, explain: 'Count axes, not indicators. MAE and MAZ are different tools measuring the same dimension. Swap either for MER or ERD and the stack recovers orthogonality.' },
  { q: 'For pattern selection, a new trader should:', opts: ['Attempt all seven from day one', 'Pick 2-3 patterns aligned to their style and master those first \u2014 mastery is narrow before it\u2019s wide, because each pattern requires internalized recognition of 3-4 indicator states at once', 'Only use one pattern ever', 'Randomize pattern selection'], correct: 1, explain: 'Muscle memory built through repetition. Seven patterns on day one produces shallow recognition. Trend: #1, #5, #6. Mean-rev: #3, #4, #7. Breakout: #1, #2, #5. Master first, expand later.' },
  { q: 'The Redundancy Trap describes what happens when:', opts: ['Too few indicators', 'You stack multiple indicators that all measure the same dimension (e.g., 3 momentum oscillators) \u2014 their intersection is marginally smaller than any one alone, producing theatrical confirmation without combinatorial edge', 'You use only one indicator', 'You stack across different timeframes'], correct: 1, explain: 'The most common stacking failure. Multiple variants of the same thing feel rigorous but provide zero additional filtering. Cure: orthogonality \u2014 stack across different dimensions, not variants on the same dimension.' },
];

// ============================================================
// CONFETTI
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const c = canvasRef.current; c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const pieces = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff'][Math.floor(Math.random() * 5)], vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1 }));
    let frames = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 120) p.a -= 0.01; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); frames++; if (frames < 250) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function StackingFreeIndicatorsLesson() {
  const [gameRound, setGameRound] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<(number | null)[]>(Array(gameRounds.length).fill(null));
  const [gameScore, setGameScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  const handleGameAnswer = (oi: number) => { if (gameAnswers[gameRound] !== null) return; const u = [...gameAnswers]; u[gameRound] = oi; setGameAnswers(u); if (gameRounds[gameRound].options[oi].correct) setGameScore(s => s + 1); };
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u); if (u.every(a => a !== null)) { const c = u.filter((a, i) => a === quizQuestions[i].correct).length; const pct = Math.round((c / quizQuestions.length) * 100); setQuizScore(pct); setQuizDone(true); if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }, 800); } };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'The Redundancy Trap \u2014 stacking multiple indicators from the same dimension', right: 'Three momentum oscillators (RSI + Stochastic + CCI) are not three filters \u2014 they\u2019re three versions of one. License windows overlap almost entirely, so combined they tighten by only a few percentage points. Retail traders love this pattern because it feels rigorous and provides the comfort of multiple confirmations, but it produces zero combinatorial edge. Fix: check that each indicator you stack answers a different question. If two answer the same, drop one and add from a different dimension.', icon: '\u{1F501}' },
    { wrong: 'Ignoring session context on otherwise-valid patterns', right: 'A Participation Surge during Asia lunch is not the same trade as one during LDN-NY overlap. Session context multiplies or divides every pattern\u2019s edge. Retail sees three core conditions met and pulls the trigger; professionals treat session as a non-negotiable meta-filter sitting above every pattern. If session is wrong, no pattern fires. This single rule eliminates a meaningful percentage of losing trades.', icon: '\u{1F55B}' },
    { wrong: 'Attempting all seven patterns from day one', right: 'Pattern recognition is muscle memory; the brain builds it slowly. Running all seven immediately produces scattered execution, inconsistent recognition, poor P&L across all. Professional workflow: pick 2-3 patterns aligned to your style, trade them exclusively until recognition is automatic, THEN expand. Mastery is narrow before wide \u2014 the same principle master chess players apply to opening repertoires.', icon: '\u{1F3B4}' },
    { wrong: 'Forcing trades in pattern conflict zones', right: 'When two patterns with opposing biases both partially activate, the market is telling you something specific: state is transitional. The professional response is deferral. Amateurs try to pick which pattern "wins" and trade on that guess. Professionals recognize the conflict, wait for clarity, act only on unambiguous setups. The lowest-edge trade is the one where the dashboard itself signals ambiguity.', icon: '\u{1F300}' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 10</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 12</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Stacking Free<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Indicators</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Seven named playbook patterns. The combinatorial math that makes them work. And the disciplines that separate real stacking from stack-of-confirmations theater.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Indicators Are Lonely Alone.</p>
            <p className="text-gray-400 leading-relaxed mb-4">One indicator is a filter. Two indicators on different axes is a sniper scope. Three indicators on orthogonal axes is precision. This is not metaphor — it’s the literal consequence of combinatorial probability when you stack diagnostic filters that measure different dimensions of market state.</p>
            <p className="text-gray-400 leading-relaxed mb-4">10.11 taught you how to READ the dashboard as a cascade. This lesson teaches you how to COMBINE the indicators into concrete, named patterns you can recognize and trade. Seven patterns, each built from a 2-3 indicator orthogonal stack, each with a specific market-state signature, each with a clear trade bias. By the end, you’ll have a starter playbook you can actually run — not just a theoretical understanding of synthesis.</p>
            <p className="text-gray-400 leading-relaxed">The deeper insight: <strong className="text-amber-400">the edge doesn’t come from having more indicators; it comes from having the RIGHT indicators in the RIGHT combinations.</strong> A single well-chosen pair on orthogonal axes outperforms a panel of twelve redundant oscillators. This lesson gives you the math for why, the patterns for how, and the disciplines for when.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE STACKING AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">The information value of two orthogonal diagnostic indicators is multiplicatively greater than their individual values — but only when they measure different dimensions of market state. Stacking redundant indicators produces theatrical confirmation, not edge.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Combinatorial Edge &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Two Filters Become Rare</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Take a single diagnostic indicator. Suppose it licenses a setup in 25% of all bars. That’s the base rate. The edge per fire is modest because one-in-four bars includes a lot of noise alongside signal. Now add a second indicator, on a different axis, that also licenses in 25% of bars. If they’re approximately independent, their INTERSECTION licenses in only ~6% of bars — <strong className="text-white">multiplicatively tighter</strong>, not additively. That 6% window is where asymmetric edge lives, because the joint constraint excludes almost all noise states while still describing something common enough to trade.</p>
          <CombinatorialEdgeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Combinatorial Edge</p>
            <p className="text-sm text-gray-400 leading-relaxed">When two approximately-independent diagnostic indicators both license a setup, the joint license window is P(A∩B) ≈ P(A) × P(B) — rare and high-conviction. Professional traders stack indicators not for reassurance but for mathematical tightening. Corollary: stacking breaks when the indicators aren’t independent. Two momentum oscillators aren’t independent — they mostly agree. Their intersection is barely smaller than either alone. Edge comes from ORTHOGONAL stacking, not indicator count.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Orthogonal stacking.</strong> When combining indicators, pick ones that answer DIFFERENT questions (regime + pressure, not pressure + pressure). Information density comes from covering multiple axes. Count axes, not indicators.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">The 2-3 sweet spot.</strong> Two orthogonal indicators is often optimal; three is acceptable when a setup demands it; four is usually over-fitting because frequency dies exponentially faster than edge grows.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Intersection math IS the edge.</strong> The rarity of the combined setup firing tells you the expected edge per fire. A 6% window has modest edge per fire but decent frequency; 1.5% has high edge but rare opportunity. Design stacks around the frequency-edge tradeoff.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Orthogonal vs Redundant</p>
          <h2 className="text-2xl font-extrabold mb-4">Different Questions, Not Same Question Twice</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The single most important distinction in indicator stacking: indicators on DIFFERENT axes multiply each other’s filtering power; indicators on the SAME axis barely add anything. MSI (what kind of market?) and MER (is the path travelable?) are orthogonal — different questions, different dimensions. Stacking them produces real combinatorial tightening. RSI + Stochastic + CCI all answer the same question (is momentum extended?) — stacking them produces mostly the same license window as any one alone.</p>
          <OrthogonalStackingAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Dimensions Checklist</p>
            <p className="text-sm text-gray-400">Before stacking any two indicators, ask: "What question does each answer?" If they answer the same, drop one. The ATLAS suite covers 5+ orthogonal dimensions: context (Sessions+), regime (MSI), direction (MPR), efficiency (MER), structure (MAE/MAZ), event (ERD), participation (MPG). Any 2-3 from different dimensions produces a valid stack. Two from the same dimension is the Redundancy Trap.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 2-3 Sweet Spot</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Four Indicators Is Usually Too Many</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each orthogonal indicator you add MULTIPLIES the rarity of the license window. 1→2: 25%→6%. 2→3: 6%→1.5%. 3→4: 1.5%→0.4%. 4→5: 0.08%. Edge per fire keeps growing — but FREQUENCY of fires collapses exponentially. By the fourth indicator, you’re so rarely seeing the setup that you miss trading opportunities. The sweet spot is 2-3 indicators.</p>
          <SweetSpotAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Frequency-Edge Tradeoff</p>
            <p className="text-sm text-gray-400">2 orthogonal indicators (6% window, moderate edge, frequent opportunities) is often optimal for active traders. 3 indicators (1.5%, higher edge, rarer opportunities) suits patient A+ traders. Beyond 3, you’re over-fitting. Design stacks around 2-3 unless a specific pattern demands more.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Pattern Library</p>
          <h2 className="text-2xl font-extrabold mb-4">Seven Named Patterns</h2>
          <p className="text-gray-400 leading-relaxed mb-6">With the theory locked in, here’s the playbook. Seven named patterns, each built from a 2-3 indicator orthogonal stack, each with a specific market-state signature, each with a clear trade bias. This is a STARTER library, not exhaustive. Master these and you have the structural scaffolding for every major trading style.</p>
          <PatternLibraryAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; How to Read These Patterns</p>
            <p className="text-sm text-gray-400">Each pattern has: (a) INDICATOR STACK — which orthogonal axes; (b) TRIGGER CONDITIONS — specific readings that together form the setup; (c) BIAS — direction to trade; (d) FAILURE MODE — what invalidates and forces exit. Don’t just memorize — understand which dimensions they cover and why that combination produces edge. Patterns are mnemonics for combinatorial setups.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Pattern #1</p>
          <h2 className="text-2xl font-extrabold mb-4">The Breakout Launch</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> Sessions+ (LDN-NY overlap) + MSI (Expansion) + MER (&gt; 70). <strong className="text-white">Bias:</strong> trend-follow. <strong className="text-white">Logic:</strong> three orthogonal axes licensing trend movement. Session has liquidity to support follow-through, regime licenses trending, efficiency confirms the path is travelable. Fires when consolidation breaks in high-liquidity window with confirmed regime and clean geometry.</p>
          <Pattern1BreakoutLaunchAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Launch vs Fake Breakout</p>
            <p className="text-sm text-gray-400">Fake breakouts differ from launches by exactly these three conditions. Fakes happen when one or two are present but not all three — wrong session (Asia lunch), grey MER (geometry unconfirmed), or still Compression regime. The stack catches the difference mechanically; on price alone they look identical.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Pattern #2</p>
          <h2 className="text-2xl font-extrabold mb-4">The Compression Coil</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> MSI (Compression) + MER (grey) + MPR (building). <strong className="text-white">Bias:</strong> pre-position for the eventual break. <strong className="text-white">Logic:</strong> Compression regime + grey efficiency + building pressure = market coiling, energy accumulating without release. Exact break direction is uncertain, but the FACT of an approaching break is high-probability. Anticipatory pattern: enter small before the break, scale up when MER crosses 60+ and direction confirms.</p>
          <Pattern2CompressionCoilAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Trade the Setup, Not the Direction</p>
            <p className="text-sm text-gray-400">Unusual among patterns because it doesn’t specify direction — it specifies a STATE. The trade is "be positioned for the break" rather than buy/sell. Small directional entry based on MPR bias, scale up when MER confirms. Rewards patience: most of the time you’re pre-positioned small, occasionally the break fires and you scale into the trend.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Pattern #3</p>
          <h2 className="text-2xl font-extrabold mb-4">The Clean Fade</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> MSI (Exhaustion) + MER (falling from high) + MAE (upper band extension). <strong className="text-white">Bias:</strong> fade the extension, short. <strong className="text-white">Logic:</strong> trend exhausted + efficiency deteriorating + price extended beyond envelope = three orthogonal signals of terminal move. Catches reversals early — professionals fade INTO exhaustion rather than waiting for price confirmation.</p>
          <Pattern3CleanFadeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Fade Regime, Not Price</p>
            <p className="text-sm text-gray-400">Amateur: short because price looks high. Professional: short because REGIME exhausted + EFFICIENCY failed + STRUCTURE stretched — three orthogonal confirmations. Without these, price being "high" is indistinguishable from the middle of a strong trend with further to run. The pattern catches the difference mechanically.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Pattern #4</p>
          <h2 className="text-2xl font-extrabold mb-4">The Absorption Reversal</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> ERD (absorption marker) + MAZ (price at strong zone) + MER (low, mean-rev licensed). <strong className="text-white">Bias:</strong> mean-revert from the level. <strong className="text-white">Logic:</strong> absorption event (hidden defenders) at a structural acceptance level with low efficiency (mean-rev environment) = cleanest reversal signal in the suite. Three axes: event + structure + efficiency. Rare but exceptionally precise — "the level held" trade, mechanized.</p>
          <Pattern4AbsorptionReversalAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Absorption = Hidden Commitment</p>
            <p className="text-sm text-gray-400">An ERD absorption marker at a MAZ level tells you someone with capital is actively defending, even though price alone doesn’t show who. When MER confirms mean-rev environment, you have the cleanest reversal setup possible. Missing any one and the "level" can just as easily give way.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Pattern #5</p>
          <h2 className="text-2xl font-extrabold mb-4">The Session Handoff Trade</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> Sessions+ (seam between sessions) + VSI (expansion) + MPR (release). <strong className="text-white">Bias:</strong> trend in direction of pressure. <strong className="text-white">Logic:</strong> session seams (LDN open, LDN-NY overlap start, NY open) are the highest-information moments — new participants with different positioning arrive. Seam + VSI expansion + MPR release = clean directional travel on fresh liquidity.</p>
          <Pattern5SessionHandoffAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Liquidity Handoff Principle Applied</p>
            <p className="text-sm text-gray-400">This is the operational form of the Liquidity Handoff Principle from 10.2. The seam is where the baton passes; when it passes cleanly (fresh volatility + decisive pressure), the receiving session carries the move. Without the seam, the same VSI+MPR signals mid-session are far weaker.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Pattern #6</p>
          <h2 className="text-2xl font-extrabold mb-4">The Participation Surge</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> MPG (STRONG tier) + MSI (Expansion) + MER (&gt; 60). <strong className="text-white">Bias:</strong> ride the institutional trend. <strong className="text-white">Logic:</strong> real participation during Expansion with confirmed efficiency indicates institutional flow. Highest-conviction trend entry in the playbook because participation is the actor, not the consequence. MPG STRONG = real buyers/sellers active, not just market self-oscillating.</p>
          <Pattern6ParticipationSurgeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Who Is Trading, Not Just What Price Is Doing</p>
            <p className="text-sm text-gray-400">Most trend-entry strategies look at price action alone. The Participation Surge requires confirmation that REAL PARTICIPANTS (measured by MPG via the Volume Fallback Doctrine from 10.6) are driving the move. A trend on low participation is pump-and-fade. A trend on STRONG participation with good efficiency is institutional money distilled into a three-indicator signature.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Pattern #7</p>
          <h2 className="text-2xl font-extrabold mb-4">The Trap Fade</h2>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Stack:</strong> MPR (trap state) + MSI (Exhaustion warning) + ERD (vacuum or absorption at fake extreme). <strong className="text-white">Bias:</strong> fade the false breakout. <strong className="text-white">Logic:</strong> MPR’s trap state fires when pressure appears to release but is actually absorbed. MSI already warning (Exhaustion) + ERD at fake extreme (hidden distribution) = mechanically clean short on the trap.</p>
          <Pattern7TrapFadeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Highest-R:R Pattern in the Playbook</p>
            <p className="text-sm text-gray-400">Trap fades typically offer excellent R:R — stop very tight (just above the fake high), target extends back into prior range. Requires full 3-indicator confluence. Amateurs fade every new high; professionals wait for MPR trap state + MSI warning + ERD confirmation. When it fires, arguably the cleanest reversal in the suite. When it doesn’t, resist shorting tops on visual intuition.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Selecting Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">Pick Your Starter Playbook</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Seven patterns is the library. You don’t trade all seven. Pattern mastery is muscle memory — the brain builds strong recognition on 2-3 patterns before it can build shallow recognition on seven. Trend traders: #1 Launch, #5 Handoff, #6 Surge. Mean-rev traders: #3 Fade, #4 Absorption, #7 Trap. Breakout hunters: #1 Launch, #2 Coil, #5 Handoff. Pick your lane, master it, then expand.</p>
          <PatternSelectionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Narrow Then Wide</p>
            <p className="text-sm text-gray-400">The mistake is wanting to trade "whatever fires," scattering attention across seven patterns you haven’t internalized. The discipline: pick three, trade them exclusively 30-90 days, reach the point where you recognize them in under 5 seconds without consciously checking conditions, THEN add a fourth. Master chess players apply the same approach — deep knowledge of a narrow repertoire beats shallow knowledge of everything.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Combining Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">When Multiple Patterns Fire at Once</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sometimes two patterns activate simultaneously. If they agree (both bullish or both bearish), you have stronger-than-single conviction — size up slightly. If they disagree (one bullish + one bearish), you’re in a CONFLICT ZONE, and the disciplined move is to stand aside until one clearly resolves. The overlap between conflicting patterns is the lowest-edge moment of the session because the market itself signals ambiguity.</p>
          <CombiningPatternsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Conflict Is Information, Not a Trade</p>
            <p className="text-sm text-gray-400">When two patterns with opposing biases activate, the market is telling you it’s in transition. The professional response is to recognize and wait. Trying to pick which pattern "wins" in real time is guesswork. The edge comes from acting on clear setups, and conflict zones are definitionally unclear. Amateurs see "two signals \u2014 must be extra important." Professionals see "two signals \u2014 must wait for resolution."</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Indicator Stacking Goes Wrong</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake comes from misunderstanding the combinatorial math, the orthogonality requirement, or the discipline of pattern selection.</p>
          <RedundancyTrapAnim />
          <div className="mt-6 space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{m.icon}</span>
                  <p className="text-sm font-extrabold text-red-400 flex-1" dangerouslySetInnerHTML={{ __html: m.wrong }} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed ml-10" dangerouslySetInnerHTML={{ __html: m.right }} />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S15 — Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">The Playbook in One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Core Doctrine (★)</p><p className="text-sm text-gray-300">P(A∩B) ≈ P(A) × P(B) — multiplicative tightening when stacking is orthogonal. Count axes, not indicators.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Sweet Spot</p><p className="text-sm text-gray-300">2-3 orthogonal indicators. Beyond 3, frequency dies faster than edge grows.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#1 Breakout Launch</p><p className="text-sm text-gray-300">Sessions+ overlap + MSI Expansion + MER &gt; 70 → trend entry, full size.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#2 Compression Coil</p><p className="text-sm text-gray-300">MSI Compression + MER grey + MPR building → pre-position for break, scale on confirmation.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#3 Clean Fade</p><p className="text-sm text-gray-300">MSI Exhaustion + MER falling + MAE upper extension → short the top.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#4 Absorption Reversal</p><p className="text-sm text-gray-300">ERD absorption + MAZ strong zone + MER low → mean-rev from level.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#5 Session Handoff</p><p className="text-sm text-gray-300">Sessions+ seam + VSI expansion + MPR release → trade direction of pressure.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#6 Participation Surge</p><p className="text-sm text-gray-300">MPG STRONG + MSI Expansion + MER &gt; 60 → institutional trend entry.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">#7 Trap Fade</p><p className="text-sm text-gray-300">MPR trap + MSI Exhaustion + ERD at fake extreme → fade false breakout, tight stop.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Starter Set</p><p className="text-sm text-gray-300">Pick 2-3 patterns aligned to your style. Master before expanding.</p></div>
              <div><p className="text-xs font-bold text-amber-400 mb-1">Conflict Rule</p><p className="text-sm text-gray-300">Opposing patterns firing together → stand aside until one resolves.</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Stack Correctly</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you understand orthogonality, the sweet spot, pattern selection, and conflict resolution — or whether you’re still counting indicators instead of axes.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameScore}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null; const selected = gameAnswers[gameRound] === oi; const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '\u2713' : '\u2717'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You count axes, not indicators. The combinatorial edge is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Orthogonal vs Redundant section before the quiz.' : 'Re-study orthogonality and the sweet spot before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S17 — Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">\u2713</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">♻</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Stacking Free Indicators</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Combinatorial Strategist &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.12-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
