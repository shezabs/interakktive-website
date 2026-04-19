// app/academy/lesson/market-acceptance-zones-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.5: Market Acceptance Zones Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// BUILD STATUS: Phase 1 scaffold complete. Animations 5-11 and content to follow.
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
// ANIMATION 1: Support/Resistance lines vs Acceptance Zones
// Shows how a trader draws S/R (precision illusion) vs
// how MAZ identifies acceptance regions (market agreement)
// ============================================================
function SRvsZonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const mid = w / 2;
    const topH = 28;

    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('S/R LINES — PRECISION ILLUSION', mid / 2, 14);
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.fillText('MAZ — ACCEPTANCE ZONES', mid + mid / 2, 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 22); ctx.lineTo(mid, h - 8); ctx.stroke();

    // Shared price series — has two zones where price rotated
    const pts = 65;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      let p = 100;
      if (i < 15) p = 100 + Math.sin(i * 0.5 + t) * 1.5; // Rotation zone 1
      else if (i < 28) p = 100 + (i - 15) * 0.8 + Math.sin(i * 0.3 + t) * 1; // Trend up
      else if (i < 48) p = 110.4 + Math.sin(i * 0.4 + t) * 2; // Rotation zone 2
      else p = 110.4 + (i - 48) * 0.3 + Math.sin(i * 0.3 + t) * 1.5; // Drift
      prices.push(p);
    }
    const pMin = Math.min(...prices) - 2;
    const pMax = Math.max(...prices) + 2;
    const pRange = pMax - pMin;

    // LEFT: Traditional S/R with precise lines
    const padLx = 12;
    const padRx = mid - 12;
    const xStepL = (padRx - padLx) / (pts - 1);
    const toYL = (v: number) => topH + 8 + (1 - (v - pMin) / pRange) * (h - topH - 30);

    // Draw 3 "precise" S/R lines — typical retail drawing
    const srLevels = [100.5, 104, 110.8];
    const srColors = ['rgba(239,68,68,0.6)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0.6)'];
    srLevels.forEach((lvl, idx) => {
      ctx.strokeStyle = srColors[idx];
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(padLx, toYL(lvl)); ctx.lineTo(padRx, toYL(lvl)); ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.toFixed(1), padLx + 2, toYL(lvl) - 2);
    });

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Footer label left
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Thin lines · pretend precision · no context', (padLx + padRx) / 2, h - 6);

    // RIGHT: Acceptance Zones
    const padLx2 = mid + 12;
    const padRx2 = w - 12;
    const xStepR = (padRx2 - padLx2) / (pts - 1);

    // Draw zone 1 (bottom rotation) — teal, full width
    const z1High = 102;
    const z1Low = 98.5;
    ctx.fillStyle = 'rgba(0,179,164,0.18)';
    ctx.fillRect(padLx2, toYL(z1High), padRx2 - padLx2, toYL(z1Low) - toYL(z1High));
    ctx.strokeStyle = 'rgba(0,179,164,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLx2, toYL(z1High), padRx2 - padLx2, toYL(z1Low) - toYL(z1High));
    // Label
    ctx.fillStyle = 'rgba(0,179,164,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MAZ • 3/3', padRx2 - 4, toYL((z1High + z1Low) / 2) + 3);

    // Zone 2 (upper rotation) — check if price is currently inside (breaking color)
    const z2High = 113;
    const z2Low = 108.5;
    const priceInside = prices[pts - 1] >= z2Low && prices[pts - 1] <= z2High;
    const z2Color = priceInside ? 'rgba(249,168,37,' : 'rgba(0,179,164,';
    ctx.fillStyle = z2Color + '0.18)';
    ctx.fillRect(padLx2, toYL(z2High), padRx2 - padLx2, toYL(z2Low) - toYL(z2High));
    ctx.strokeStyle = z2Color + '0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLx2, toYL(z2High), padRx2 - padLx2, toYL(z2Low) - toYL(z2High));
    ctx.fillStyle = z2Color + '0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MAZ', padRx2 - 4, toYL((z2High + z2Low) / 2) + 3);

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,179,164,0.85)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Zones · market agreement · real structure', (padLx2 + padRx2) / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: The Four-Part Acceptance Score
// Shows the 4 components weighted 30/25/25/20 combining into composite
// ============================================================
function FourPartScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Acceptance Score — 4 Components, Locked Weights', w / 2, 14);

    const components = [
      { label: 'Efficiency', weight: 0.30, value: 0.75 + Math.sin(t) * 0.10, color: '#0ea5e9', desc: 'Low displacement / path' },
      { label: 'ERD Balance', weight: 0.25, value: 0.68 + Math.sin(t * 0.8) * 0.12, color: '#FFB300', desc: 'Effort ≈ Result' },
      { label: 'Vol Decay', weight: 0.25, value: 0.82 + Math.sin(t * 1.1) * 0.08, color: '#a855f7', desc: 'Volatility contracting' },
      { label: 'Participation', weight: 0.20, value: 0.71 + Math.sin(t * 0.6) * 0.11, color: '#22c55e', desc: 'Stable engagement' },
    ];

    // Left half: 4 components as vertical bars
    const compStartX = 25;
    const compsW = w * 0.50;
    const compW = (compsW - 30) / 4;
    const compGap = 8;

    components.forEach((c, i) => {
      const x = compStartX + i * (compW + compGap);
      const y = 34;
      const boxH = h - 80;

      // Box
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, compW, boxH);
      ctx.strokeStyle = c.color + '50';
      ctx.strokeRect(x, y, compW, boxH);

      // Label
      ctx.fillStyle = c.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, x + compW / 2, y + 12);

      // Vertical meter
      const meterH = boxH - 42;
      const meterY = y + 20;
      ctx.fillStyle = c.color + '22';
      ctx.fillRect(x + compW / 2 - 8, meterY, 16, meterH);
      ctx.fillStyle = c.color;
      const fillH = meterH * c.value;
      ctx.fillRect(x + compW / 2 - 8, meterY + meterH - fillH, 16, fillH);

      // Value
      ctx.fillStyle = c.color;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(c.value.toFixed(2), x + compW / 2, y + boxH - 14);

      // Weight badge
      ctx.fillStyle = 'rgba(245,158,11,0.2)';
      ctx.fillRect(x + 4, y + boxH - 8, compW - 8, 6);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText(`×${c.weight}`, x + compW / 2, y + boxH - 3);
    });

    // Arrow
    const arrowX = compStartX + compsW + 6;
    const arrowY = h / 2 + 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX + 18, arrowY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(arrowX + 18, arrowY); ctx.lineTo(arrowX + 13, arrowY - 4); ctx.lineTo(arrowX + 13, arrowY + 4); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();

    // Right: composite score gauge
    const gaugeX = arrowX + 40;
    const gaugeCx = gaugeX + 55;
    const gaugeCy = h / 2 + 4;
    const radius = 42;

    const total = components.reduce((s, c) => s + c.value * c.weight, 0);
    const accepting = total >= 0.55;

    // Outer arc — gauge
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(gaugeCx, gaugeCy, radius, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();

    // Threshold marker line at 0.55
    const thrAng = Math.PI * 0.75 + (Math.PI * 1.5) * 0.55;
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gaugeCx + Math.cos(thrAng) * (radius - 6), gaugeCy + Math.sin(thrAng) * (radius - 6));
    ctx.lineTo(gaugeCx + Math.cos(thrAng) * (radius + 6), gaugeCy + Math.sin(thrAng) * (radius + 6));
    ctx.stroke();
    ctx.setLineDash([]);

    // Fill
    ctx.strokeStyle = accepting ? '#00B3A4' : '#F9A825';
    ctx.lineWidth = 8;
    const endAng = Math.PI * 0.75 + (Math.PI * 1.5) * total;
    ctx.beginPath(); ctx.arc(gaugeCx, gaugeCy, radius, Math.PI * 0.75, endAng); ctx.stroke();

    // Center
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ACCEPTANCE', gaugeCx, gaugeCy - 14);
    ctx.fillStyle = accepting ? '#00B3A4' : '#F9A825';
    ctx.font = 'bold 20px system-ui';
    ctx.fillText(total.toFixed(2), gaugeCx, gaugeCy + 6);
    ctx.fillStyle = accepting ? '#00B3A4' : 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText(accepting ? 'ACCEPTING' : 'NOT YET', gaugeCx, gaugeCy + 22);

    // Threshold label
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('thr 0.55', gaugeCx, gaugeCy + 52);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 3: Efficiency Score — displacement / total path
// ============================================================
function EfficiencyScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Efficiency — Displacement / Total Path', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 30); ctx.lineTo(mid, h - 14); ctx.stroke();

    // LEFT: Trending — HIGH efficiency (path ≈ displacement)
    ctx.fillStyle = 'rgba(239,68,68,0.75)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TRENDING — HIGH EFFICIENCY', mid / 2, 30);
    ctx.fillStyle = 'rgba(239,68,68,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('NOT accepting — path ≈ displacement', mid / 2, 42);

    const padLx = 15;
    const padRx = mid - 15;
    const chartT = 50;
    const chartB = h - 44;
    const leftPts = 40;
    const leftPrices: number[] = [];
    for (let i = 0; i < leftPts; i++) leftPrices.push(100 + i * 0.3 + Math.sin(i * 0.5 + t) * 0.5);

    const lMin = Math.min(...leftPrices) - 1;
    const lMax = Math.max(...leftPrices) + 1;
    const lRange = lMax - lMin;
    const toYLeft = (v: number) => chartB - ((v - lMin) / lRange) * (chartB - chartT - 4) - 2;

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    leftPrices.forEach((v, i) => { const x = padLx + (i / (leftPts - 1)) * (padRx - padLx); i === 0 ? ctx.moveTo(x, toYLeft(v)) : ctx.lineTo(x, toYLeft(v)); });
    ctx.stroke();

    // Displacement arrow (end - start)
    ctx.strokeStyle = 'rgba(239,68,68,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLx, toYLeft(leftPrices[0]));
    ctx.lineTo(padRx, toYLeft(leftPrices[leftPts - 1]));
    ctx.stroke();

    // Ratio readout
    const lDisp = Math.abs(leftPrices[leftPts - 1] - leftPrices[0]);
    let lPath = 0;
    for (let i = 1; i < leftPts; i++) lPath += Math.abs(leftPrices[i] - leftPrices[i - 1]);
    const lEff = lPath > 0 ? lDisp / lPath : 0;

    ctx.fillStyle = 'rgba(239,68,68,0.9)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Efficiency: ${lEff.toFixed(2)}`, mid / 2, h - 20);
    ctx.fillStyle = 'rgba(239,68,68,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('score above threshold 0.35', mid / 2, h - 8);

    // RIGHT: Rotating — LOW efficiency (chop)
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ROTATING — LOW EFFICIENCY', mid + mid / 2, 30);
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('IS accepting — much path, little displacement', mid + mid / 2, 42);

    const padLx2 = mid + 15;
    const padRx2 = w - 15;
    const rightPts = 40;
    const rightPrices: number[] = [];
    for (let i = 0; i < rightPts; i++) rightPrices.push(100 + Math.sin(i * 0.35 + t) * 4 + Math.cos(i * 0.7 + t) * 2);

    const rMin = Math.min(...rightPrices) - 1;
    const rMax = Math.max(...rightPrices) + 1;
    const rRange = rMax - rMin;
    const toYRight = (v: number) => chartB - ((v - rMin) / rRange) * (chartB - chartT - 4) - 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    rightPrices.forEach((v, i) => { const x = padLx2 + (i / (rightPts - 1)) * (padRx2 - padLx2); i === 0 ? ctx.moveTo(x, toYRight(v)) : ctx.lineTo(x, toYRight(v)); });
    ctx.stroke();

    // Tiny displacement arrow
    ctx.strokeStyle = 'rgba(0,179,164,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLx2, toYRight(rightPrices[0]));
    ctx.lineTo(padRx2, toYRight(rightPrices[rightPts - 1]));
    ctx.stroke();

    const rDisp = Math.abs(rightPrices[rightPts - 1] - rightPrices[0]);
    let rPath = 0;
    for (let i = 1; i < rightPts; i++) rPath += Math.abs(rightPrices[i] - rightPrices[i - 1]);
    const rEff = rPath > 0 ? rDisp / rPath : 0;

    ctx.fillStyle = 'rgba(0,179,164,0.95)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Efficiency: ${rEff.toFixed(2)}`, mid + mid / 2, h - 20);
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('score BELOW threshold → acceptance condition', mid + mid / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: ERD Balance — Effort Result Distance
// Shows volume/price relationship — balance when |effort - result| is small
// ============================================================
function ERDBalanceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Effort-Result-Distance Balance — The Quiet Signature', w / 2, 14);

    // Three scenarios side-by-side
    const scenarioW = (w - 40) / 3 - 8;
    const startX = 20;
    const boxY = 32;
    const boxH = h - 56;

    const scenarios = [
      { title: 'HIGH EFFORT, LOW RESULT', effort: 2.5, result: 0.3, label: 'Absorption', color: '#EF5350', score: 'Low ERD = not accepting' },
      { title: 'BALANCED', effort: 1.1, result: 0.9, label: 'Acceptance', color: '#00B3A4', score: 'High ERD = accepting' },
      { title: 'LOW EFFORT, HIGH RESULT', effort: 0.4, result: 1.8, label: 'Breakout', color: '#FFB300', score: 'Low ERD = not accepting' },
    ];

    scenarios.forEach((s, i) => {
      const x = startX + i * (scenarioW + 12);

      // Container
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, boxY, scenarioW, boxH);
      ctx.strokeStyle = s.color + '50';
      ctx.strokeRect(x, boxY, scenarioW, boxH);

      // Title
      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.title, x + scenarioW / 2, boxY + 14);

      // Effort bar (left) / Result bar (right) — seesaw style
      const meterY = boxY + 28;
      const meterH = boxH - 66;
      const meterW = (scenarioW - 30) / 2;

      // Effort (left)
      const pulseE = 0.9 + Math.sin(t * 3 + i) * 0.1;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x + 10, meterY, meterW, meterH);
      const eFill = (s.effort / 3) * meterH * pulseE;
      ctx.fillStyle = `rgba(239,68,68,${0.4 + s.effort / 8})`;
      ctx.fillRect(x + 10, meterY + meterH - eFill, meterW, eFill);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('EFFORT', x + 10 + meterW / 2, meterY - 4);
      ctx.fillText(s.effort.toFixed(1) + '×', x + 10 + meterW / 2, meterY + meterH + 10);

      // Result (right)
      const rFill = (s.result / 2) * meterH;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x + scenarioW - 10 - meterW, meterY, meterW, meterH);
      ctx.fillStyle = `rgba(0,179,164,${0.4 + s.result / 4})`;
      ctx.fillRect(x + scenarioW - 10 - meterW, meterY + meterH - rFill, meterW, rFill);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('RESULT', x + scenarioW - 10 - meterW / 2, meterY - 4);
      ctx.fillText(s.result.toFixed(1) + '×', x + scenarioW - 10 - meterW / 2, meterY + meterH + 10);

      // ERD label
      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label.toUpperCase(), x + scenarioW / 2, boxY + boxH - 18);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(s.score, x + scenarioW / 2, boxY + boxH - 6);
    });

    // Footer formula
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERD Balance = clamp(1 - |effortCapped - resultCapped| / 2)  ·  higher = more accepting', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 5: Volatility Decay — contraction/expansion gauge
// ============================================================
function VolatilityDecayAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Volatility Decay — Contraction Is The Tell', w / 2, 14);

    // Upper panel: ATR series declining
    const padL = 25;
    const padR = w - 15;
    const upperT = 30;
    const upperB = h / 2 - 6;
    const pts = 60;

    // Generate a vol series that goes down then oscillates (decay)
    const vols: number[] = [];
    for (let i = 0; i < pts; i++) {
      let v = 1.5 - (i / pts) * 0.9; // declining trend
      v += Math.sin(i * 0.5 + t) * 0.12;
      v = Math.max(0.2, v);
      vols.push(v);
    }

    const vMin = 0.2;
    const vMax = 2.0;
    const toY = (v: number) => upperB - ((v - vMin) / (vMax - vMin)) * (upperB - upperT - 4) - 2;
    const xStep = (padR - padL) / (pts - 1);

    // Vol line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    vols.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Fill under vol
    ctx.fillStyle = 'rgba(168,85,247,0.12)';
    ctx.beginPath();
    vols.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.lineTo(padR, upperB);
    ctx.lineTo(padL, upperB);
    ctx.closePath(); ctx.fill();

    // Decay threshold reference line
    ctx.strokeStyle = 'rgba(245,158,11,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padL, toY(0.6)); ctx.lineTo(padR, toY(0.6)); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ATR (smoothed)', padL, upperT + 10);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('decay thr', padR - 2, toY(0.6) - 3);

    // Lower panel: vol momentum % — negative = contracting
    const lowerT = h / 2 + 6;
    const lowerB = h - 18;
    const lowerH = lowerB - lowerT;
    const lowerMid = lowerT + lowerH / 2;

    const volMom: number[] = [];
    for (let i = 10; i < pts; i++) {
      const pct = ((vols[i] - vols[i - 10]) / vols[i - 10]) * 100;
      volMom.push(pct);
    }

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, lowerMid); ctx.lineTo(padR, lowerMid); ctx.stroke();

    // Decay threshold at -3%
    ctx.strokeStyle = 'rgba(0,179,164,0.4)';
    ctx.setLineDash([3, 2]);
    const thrY = lowerMid + (3 / 15) * (lowerH / 2); // -3% position
    ctx.beginPath(); ctx.moveTo(padL, thrY); ctx.lineTo(padR, thrY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,179,164,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('-3% (decay thr)', padR - 2, thrY - 3);

    // Mom bars
    const mStep = (padR - padL) / volMom.length;
    volMom.forEach((m, i) => {
      const x = padL + i * mStep;
      const mY = lowerMid - (m / 15) * (lowerH / 2);
      const barH = Math.abs(mY - lowerMid);
      const isDecay = m <= -3;
      const isNeutral = m > -3 && m < 0;
      const color = isDecay ? '#00B3A4' : (isNeutral ? '#a855f7' : '#EF5350');
      ctx.fillStyle = color + (isDecay ? 'aa' : '77');
      if (m < 0) ctx.fillRect(x, lowerMid, mStep - 1, barH);
      else ctx.fillRect(x, mY, mStep - 1, barH);
    });

    // Current value callout
    const current = volMom[volMom.length - 1];
    const currentColor = current <= -3 ? '#00B3A4' : (current < 0 ? '#a855f7' : '#EF5350');
    ctx.fillStyle = currentColor;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`volMom: ${current.toFixed(1)}%`, padR - 2, lowerB + 12);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Score = 1.0 if ≤ −3%,  0.5 if between −3% and 0%,  0.0 if positive', padL, lowerB + 12);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 6: Participation Stability
// ============================================================
function ParticipationStabilityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Participation Stability — Is Engagement Steady?', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 14); ctx.stroke();

    ctx.fillStyle = 'rgba(239,68,68,0.75)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('UNSTABLE PARTICIPATION', mid / 2, 30);
    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.fillText('STABLE PARTICIPATION', mid + mid / 2, 30);

    // Both panels: participation line over time
    const chartT = 44;
    const chartB = h - 26;
    const chartH = chartB - chartT;
    const pts = 50;

    // LEFT: unstable — high volatility around mean
    const leftP: number[] = [];
    for (let i = 0; i < pts; i++) leftP.push(0.5 + Math.sin(i * 0.8 + t) * 0.3 + Math.cos(i * 0.3 + t * 1.5) * 0.15);

    const padLL = 15;
    const padLR = mid - 15;
    const xStepL = (padLR - padLL) / (pts - 1);
    const toYL = (v: number) => chartB - v * chartH;

    // Mean line
    let leftMean = 0; leftP.forEach(v => leftMean += v); leftMean /= pts;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, toYL(leftMean)); ctx.lineTo(padLR, toYL(leftMean)); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    leftP.forEach((v, i) => { const x = padLL + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Stability score (low for left)
    let leftStd = 0;
    leftP.forEach(v => leftStd += Math.pow(v - leftMean, 2));
    leftStd = Math.sqrt(leftStd / pts);
    const leftStab = Math.max(0, Math.min(1, 1 - leftStd / Math.max(leftMean, 0.01)));

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Stab: ${leftStab.toFixed(2)}`, mid / 2, h - 10);

    // RIGHT: stable — tight around mean
    const rightP: number[] = [];
    for (let i = 0; i < pts; i++) rightP.push(0.55 + Math.sin(i * 0.3 + t) * 0.05 + Math.cos(i * 0.15 + t) * 0.03);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (pts - 1);

    let rightMean = 0; rightP.forEach(v => rightMean += v); rightMean /= pts;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padRL, toYL(rightMean)); ctx.lineTo(padRR, toYL(rightMean)); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    rightP.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    let rightStd = 0;
    rightP.forEach(v => rightStd += Math.pow(v - rightMean, 2));
    rightStd = Math.sqrt(rightStd / pts);
    const rightStab = Math.max(0, Math.min(1, 1 - rightStd / Math.max(rightMean, 0.01)));

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Stab: ${rightStab.toFixed(2)}`, mid + mid / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 7: Zone Birth — persistence + width check
// ============================================================
function ZoneBirthAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Zone Birth — Persistence + Width Check', w / 2, 14);

    const padL = 25;
    const padR = w - 15;
    const chartT = 34;
    const chartB = h - 40;
    const chartH = chartB - chartT;

    const pts = 60;
    const cycle = (t * 0.3) % 1;
    const persistThr = 5; // balanced

    // Build a price series with a clear rotation zone in the middle
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      let p = 100;
      if (i < 15) p = 97 + i * 0.2 + Math.sin(i * 0.3 + t) * 0.5;
      else if (i < 40) p = 100 + Math.sin(i * 0.5 + t) * 1.5; // rotation
      else p = 100 + (i - 40) * 0.1 + Math.sin(i * 0.3 + t) * 0.8;
      prices.push(p);
    }

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 4) - 2;

    // Accept count progresses: 0 up to persistThr then zone emerges
    const acceptCountMax = Math.floor(cycle * (persistThr + 10));

    // Draw bar-by-bar accept highlight
    for (let i = 15; i < Math.min(15 + acceptCountMax, 40); i++) {
      const x = padL + i * xStep;
      const boxH = toY(pMin + 3) - toY(pMin + 5);
      ctx.fillStyle = 'rgba(0,179,164,0.15)';
      ctx.fillRect(x - xStep / 2, toY(101.5), xStep, toY(98.5) - toY(101.5));
    }

    // If count >= persistThr, show zone box
    if (acceptCountMax >= persistThr) {
      const zStart = padL + 15 * xStep;
      const zEnd = padL + Math.min(15 + acceptCountMax, 40) * xStep;
      ctx.fillStyle = 'rgba(0,179,164,0.22)';
      ctx.fillRect(zStart, toY(101.8), zEnd - zStart, toY(98.2) - toY(101.8));
      ctx.strokeStyle = '#00B3A4';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(zStart, toY(101.8), zEnd - zStart, toY(98.2) - toY(101.8));
      ctx.fillStyle = '#00B3A4';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('MAZ', zStart + 4, toY(101.8) - 3);
    }

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Counter badge
    const counterVal = Math.min(acceptCountMax, persistThr + 3);
    const counterText = counterVal >= persistThr ? `${counterVal} ≥ ${persistThr} ✓ ZONE BIRTH` : `accept count: ${counterVal}/${persistThr}`;
    const counterColor = counterVal >= persistThr ? '#00B3A4' : '#FFB300';
    ctx.fillStyle = counterColor + '25';
    ctx.fillRect(padL, chartB + 6, 200, 14);
    ctx.strokeStyle = counterColor;
    ctx.strokeRect(padL, chartB + 6, 200, 14);
    ctx.fillStyle = counterColor;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(counterText, padL + 6, chartB + 16);

    // Width check badge
    const widthOK = acceptCountMax >= persistThr;
    const widthText = widthOK ? 'width ≤ ATR×2.5 ✓' : 'width check: pending';
    ctx.fillStyle = (widthOK ? '#00B3A4' : 'rgba(255,255,255,0.3)') + '25';
    ctx.fillRect(padL + 210, chartB + 6, 140, 14);
    ctx.strokeStyle = widthOK ? '#00B3A4' : 'rgba(255,255,255,0.3)';
    ctx.strokeRect(padL + 210, chartB + 6, 140, 14);
    ctx.fillStyle = widthOK ? '#00B3A4' : 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText(widthText, padL + 216, chartB + 16);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 8: Zone Lifecycle — Active → Aging → Historic
// ============================================================
function ZoneLifecycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Zone Lifecycle — ACTIVE → AGING → HISTORIC → REMOVE', w / 2, 14);

    const states = [
      { name: 'ACTIVE', color: '#00B3A4', desc: 'Fresh, strong', alpha: 0.55 },
      { name: 'AGING', color: '#8A8A8A', desc: 'Time passed', alpha: 0.35 },
      { name: 'HISTORIC', color: '#6A6A6A', desc: 'Memory', alpha: 0.18 },
      { name: 'REMOVE', color: '#4A4A4A', desc: 'Deleted', alpha: 0.06 },
    ];

    const cellW = (w - 60) / 4;
    const gap = 10;
    const boxH = 80;
    const cellY = 40;
    const activeIdx = Math.floor(t * 0.3) % 4;

    states.forEach((s, i) => {
      const x = 20 + i * (cellW + gap);
      const isHere = i === activeIdx;

      // Cell
      ctx.fillStyle = s.color + '12';
      ctx.fillRect(x, cellY, cellW, boxH);
      ctx.strokeStyle = isHere ? s.color : s.color + '60';
      ctx.lineWidth = isHere ? 2 : 1;
      ctx.strokeRect(x, cellY, cellW, boxH);

      // Name
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, x + cellW / 2, cellY + 16);

      // Mini zone viz inside cell
      const miniY = cellY + 26;
      const miniH = 30;
      ctx.fillStyle = s.color + Math.floor(s.alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x + 10, miniY, cellW - 20, miniH);
      ctx.strokeStyle = s.color + '99';
      ctx.strokeRect(x + 10, miniY, cellW - 20, miniH);

      // Desc
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(s.desc, x + cellW / 2, cellY + boxH - 6);

      // Arrow to next
      if (i < 3) {
        const arrX = x + cellW + 2;
        const arrY = cellY + boxH / 2;
        ctx.strokeStyle = isHere ? s.color : 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(arrX, arrY); ctx.lineTo(arrX + 6, arrY); ctx.stroke();
        ctx.fillStyle = isHere ? s.color : 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.moveTo(arrX + 6, arrY); ctx.lineTo(arrX + 3, arrY - 2); ctx.lineTo(arrX + 3, arrY + 2); ctx.closePath(); ctx.fill();
      }
    });

    // Transition legends
    const trY = cellY + boxH + 28;
    const transitions = [
      { label: '• Touches fade OR time > fadeBars/3', y: trY },
      { label: '• Zone stale OR barsSinceTouch > staleBars → historic', y: trY + 12 },
      { label: '• Strength < 0.15 OR historic > 1200 bars → REMOVE', y: trY + 24 },
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'left';
    transitions.forEach(tr => { ctx.fillText(tr.label, 25, tr.y); });

    // Re-acceptance arrow (AGING → ACTIVE)
    ctx.fillStyle = 'rgba(245,158,11,0.75)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('↺ re-accept touch → strength ↑', w / 2, trY + 40);
  }, []);
  return <AnimScene drawFn={draw} height={230} />;
}

// ============================================================
// ANIMATION 9: Strength Decay — AMTF decays slower
// ============================================================
function ZoneDecayAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Strength Decay — AMTF Zones Decay Slower', w / 2, 14);

    // Two strength curves over time
    const padL = 30;
    const padR = w - 20;
    const chartT = 36;
    const chartB = h - 30;
    const chartH = chartB - chartT;
    const bars = 500;

    const strengthAMTF: number[] = [];
    const strengthATF: number[] = [];
    let sAMTF = 1.0;
    let sATF = 1.0;
    for (let i = 0; i < bars; i++) {
      strengthAMTF.push(sAMTF);
      strengthATF.push(sATF);
      sAMTF *= 0.999;
      sATF *= 0.998;
    }

    const xStep = (padR - padL) / bars;
    const toY = (v: number) => chartB - v * chartH;

    // Grid lines
    [0.25, 0.5, 0.75, 1.0].forEach(lvl => {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(padL, toY(lvl)); ctx.lineTo(padR, toY(lvl)); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(lvl.toFixed(2), padL - 3, toY(lvl) + 3);
    });

    // Removal threshold
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.setLineDash([4, 2]);
    ctx.beginPath(); ctx.moveTo(padL, toY(0.15)); ctx.lineTo(padR, toY(0.15)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('removal threshold 0.15', padL + 4, toY(0.15) - 3);

    // ATF curve
    ctx.strokeStyle = 'rgba(138,138,138,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    strengthATF.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // AMTF curve
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    strengthAMTF.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Markers for where each crosses 0.15
    const atfCrosses = strengthATF.findIndex(v => v < 0.15);
    const amtfCrosses = strengthAMTF.findIndex(v => v < 0.15);

    if (atfCrosses > 0) {
      const xC = padL + atfCrosses * xStep;
      ctx.strokeStyle = 'rgba(138,138,138,0.6)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(xC, toY(0.15)); ctx.lineTo(xC, chartB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(138,138,138,0.9)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`ATF dies at ~${atfCrosses} bars`, xC, chartB + 14);
    }

    if (amtfCrosses > 0) {
      const xC = padL + amtfCrosses * xStep;
      ctx.strokeStyle = 'rgba(0,179,164,0.6)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(xC, toY(0.15)); ctx.lineTo(xC, chartB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#00B3A4';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`AMTF dies at ~${amtfCrosses} bars`, xC, chartB + 14);
    }

    // Legend
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('━ ATF decay × 0.998/bar', padL + 8, chartT + 10);
    ctx.fillStyle = '#00B3A4';
    ctx.fillText('━ AMTF decay × 0.999/bar', padL + 8, chartT + 22);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 10: Zone Merging — two overlapping zones merge
// ============================================================
function ZoneMergingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Zone Merging — Overlap ≥ 45% OR mid-dist ≤ 0.35 ATR', w / 2, 14);

    const padL = 25;
    const padR = w - 15;
    const chartT = 34;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    // Cycle 0-1: zones separate → approaching → overlap → merged
    const cycle = (t * 0.3) % 1;

    const pMin = 95;
    const pMax = 105;
    const pRange = pMax - pMin;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * chartH;

    // Zone 1 position (stationary)
    const z1H = 102;
    const z1L = 99;

    // Zone 2 position — drifts toward zone 1
    const drift = cycle < 0.5 ? (1 - cycle * 2) : 0;
    const z2H = 100 + drift * 2;
    const z2L = 97 + drift * 2;

    const hasMerged = cycle > 0.55;

    if (hasMerged) {
      // Merged zone
      const mH = Math.max(z1H, z2H);
      const mL = Math.min(z1L, z2L);
      ctx.fillStyle = 'rgba(0,179,164,0.30)';
      ctx.fillRect(padL, toY(mH), padR - padL, toY(mL) - toY(mH));
      ctx.strokeStyle = '#00B3A4';
      ctx.lineWidth = 2;
      ctx.strokeRect(padL, toY(mH), padR - padL, toY(mL) - toY(mH));
      ctx.fillStyle = '#00B3A4';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('MERGED MAZ', w / 2, toY((mH + mL) / 2) + 3);
      ctx.font = '7px system-ui';
      ctx.fillText('Max(strength) · Max(tfCount) · Union(bounds)', w / 2, toY((mH + mL) / 2) + 15);
    } else {
      // Zone 1
      ctx.fillStyle = 'rgba(0,179,164,0.18)';
      ctx.fillRect(padL + (padR - padL) * 0.1, toY(z1H), (padR - padL) * 0.45, toY(z1L) - toY(z1H));
      ctx.strokeStyle = '#00B3A4';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL + (padR - padL) * 0.1, toY(z1H), (padR - padL) * 0.45, toY(z1L) - toY(z1H));
      ctx.fillStyle = '#00B3A4';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Zone 1', padL + (padR - padL) * 0.1 + 4, toY(z1H) - 3);

      // Zone 2 approaches
      ctx.fillStyle = 'rgba(0,179,164,0.18)';
      ctx.fillRect(padL + (padR - padL) * 0.45, toY(z2H), (padR - padL) * 0.45, toY(z2L) - toY(z2H));
      ctx.strokeStyle = '#00B3A4';
      ctx.strokeRect(padL + (padR - padL) * 0.45, toY(z2H), (padR - padL) * 0.45, toY(z2L) - toY(z2H));
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('Zone 2 →', padL + (padR - padL) * 0.9 - 4, toY(z2H) - 3);

      // Overlap indicator
      if (cycle > 0.35 && cycle < 0.55) {
        const oH = Math.min(z1H, z2H);
        const oL = Math.max(z1L, z2L);
        if (oH > oL) {
          const ox1 = padL + (padR - padL) * 0.45;
          const ox2 = padL + (padR - padL) * 0.55;
          ctx.fillStyle = 'rgba(245,158,11,0.4)';
          ctx.fillRect(ox1, toY(oH), ox2 - ox1, toY(oL) - toY(oH));
          ctx.fillStyle = '#FFB300';
          ctx.font = 'bold 7px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('overlap detected', (ox1 + ox2) / 2, toY(oH) - 4);
        }
      }
    }

    // Status line
    const status = cycle < 0.35 ? 'separate' : (cycle < 0.55 ? 'overlap detected' : 'merged');
    ctx.fillStyle = cycle < 0.55 ? 'rgba(255,255,255,0.55)' : '#00B3A4';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`state: ${status}`, w / 2, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 11: The Three Zone Types — side-by-side
// ============================================================
function ThreeZoneTypesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Three Zone Types', w / 2, 14);

    const types = [
      { label: 'MAZ', sub: 'ATF only', desc: 'Chart timeframe acceptance. No HTF consensus.', color: '#00B3A4', fillA: 0.16, dash: [] as number[], strength: 0.85 },
      { label: 'MAZ • 3/3', sub: 'AMTF consensus', desc: 'All 3 timeframes agree. Institutionally significant.', color: '#00B3A4', fillA: 0.30, dash: [] as number[], strength: 1.0 },
      { label: 'H • MAZ', sub: 'Historic', desc: 'Past acceptance zone. Memory context only.', color: '#6A6A6A', fillA: 0.10, dash: [3, 2] as number[], strength: 0.4 },
    ];

    const cellW = (w - 50) / 3;
    const gap = 10;
    const cellY = 36;
    const boxH = h - 60;

    types.forEach((z, i) => {
      const x = 20 + i * (cellW + gap);

      // Title
      ctx.fillStyle = z.color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, x + cellW / 2, cellY + 12);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px system-ui';
      ctx.fillText(z.sub, x + cellW / 2, cellY + 24);

      // Zone visual
      const zY = cellY + 40;
      const zH = boxH - 80;
      ctx.fillStyle = z.color + Math.floor(z.fillA * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x, zY, cellW, zH);
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1;
      if (z.dash.length > 0) ctx.setLineDash(z.dash);
      ctx.strokeRect(x, zY, cellW, zH);
      ctx.setLineDash([]);

      // Price line through
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let j = 0; j < 30; j++) {
        const px = x + (j / 29) * cellW;
        const py = zY + zH / 2 + Math.sin(j * 0.3 + t + i) * (zH / 4);
        j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Strength bar below
      const stY = zY + zH + 12;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, stY, cellW - 20, 6);
      ctx.fillStyle = z.color;
      ctx.fillRect(x + 10, stY, (cellW - 20) * z.strength, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`strength: ${z.strength.toFixed(2)}`, x + 10, stY + 16);

      // Description
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(z.desc, x + cellW / 2, cellY + boxH - 6);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 12: Auto-MTF Mapping Table
// ============================================================
function AutoMTFMappingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Auto-MTF Mapping — 18 Chart TFs → HTF1 + HTF2', w / 2, 14);

    const rows = [
      { atf: '1m', h1: '5m', h2: '15m' },
      { atf: '5m', h1: '15m', h2: '1H' },
      { atf: '15m', h1: '1H', h2: '4H' },
      { atf: '30m', h1: '2H', h2: '4H' },
      { atf: '1H', h1: '4H', h2: '1D' },
      { atf: '4H', h1: '1D', h2: '1W' },
      { atf: '1D', h1: '1W', h2: '1M' },
      { atf: '1W', h1: '1M', h2: '3M' },
    ];

    const rowH = 20;
    const startY = 38;
    const tableW = Math.min(w - 60, 300);
    const tableX = (w - tableW) / 2;
    const colATFW = tableW * 0.28;
    const colArrowW = tableW * 0.08;
    const colH1W = tableW * 0.28;
    const colPlusW = tableW * 0.08;
    const colH2W = tableW * 0.28;

    const activeIdx = Math.floor(t * 1) % rows.length;

    // Header
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Chart TF', tableX + colATFW / 2, startY + 12);
    ctx.fillText('HTF 1', tableX + colATFW + colArrowW + colH1W / 2, startY + 12);
    ctx.fillText('HTF 2', tableX + colATFW + colArrowW + colH1W + colPlusW + colH2W / 2, startY + 12);

    rows.forEach((r, i) => {
      const y = startY + 20 + i * rowH;
      const isActive = i === activeIdx;

      if (isActive) {
        ctx.fillStyle = 'rgba(245,158,11,0.08)';
        ctx.fillRect(tableX, y, tableW, rowH);
        ctx.strokeStyle = 'rgba(245,158,11,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tableX, y, tableW, rowH);
      }

      // ATF
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.7)';
      ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(r.atf, tableX + colATFW / 2, y + 14);

      // Arrow
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.4)';
      ctx.fillText('→', tableX + colATFW + colArrowW / 2, y + 14);

      // HTF1
      ctx.fillStyle = isActive ? '#00B3A4' : 'rgba(0,179,164,0.7)';
      ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
      ctx.fillText(r.h1, tableX + colATFW + colArrowW + colH1W / 2, y + 14);

      // Plus
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('+', tableX + colATFW + colArrowW + colH1W + colPlusW / 2, y + 14);

      // HTF2
      ctx.fillStyle = isActive ? '#00B3A4' : 'rgba(0,179,164,0.7)';
      ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
      ctx.fillText(r.h2, tableX + colATFW + colArrowW + colH1W + colPlusW + colH2W / 2, y + 14);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Showing 8 of 18 mappings · Full table in source', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION: Acceptance vs Absorption Distinction (★ GROUNDBREAKING)
// The conceptual separation retail traders constantly conflate.
// ============================================================
function AcceptanceVsAbsorptionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 Acceptance vs Absorption \u2014 The Distinction Retail Conflates \u2605', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // === LEFT: ABSORPTION ===
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ABSORPTION', mid / 2, 32);
    ctx.fillStyle = 'rgba(239,68,68,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('one side pushing, the other absorbing', mid / 2, 44);

    // Mini price chart — heavy pushes with wicks
    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 52;
    const chartB = h * 0.62;
    const chartH = chartB - chartT;
    const pts = 32;

    const absPrices: number[] = [];
    for (let i = 0; i < pts; i++) {
      // Hits the same level repeatedly then gets rejected
      const push = Math.sin(i * 0.8 + t) * 2.5;
      absPrices.push(100 + push + Math.sin(i * 2 + t) * 0.3);
    }
    const xStepL = (padLR - padLL) / (pts - 1);

    const pMin = 96;
    const pMax = 104;
    const toYL = (v: number) => chartT + (1 - (v - pMin) / (pMax - pMin)) * chartH;

    // Resistance line being tested
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, toYL(102.5)); ctx.lineTo(padLR, toYL(102.5)); ctx.stroke();
    ctx.setLineDash([]);

    // Big volume bars at the pushes
    const volBarY = chartB + 4;
    const volBarH = 14;
    for (let i = 0; i < pts; i++) {
      const x = padLL + i * xStepL;
      const vol = 0.4 + Math.abs(Math.sin(i * 0.8 + t)) * 0.55;
      ctx.fillStyle = 'rgba(239,68,68,' + (0.3 + vol * 0.4) + ')';
      ctx.fillRect(x - xStepL / 2 + 1, volBarY + (1 - vol) * volBarH, xStepL - 2, vol * volBarH);
    }
    ctx.fillStyle = 'rgba(239,68,68,0.6)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('HIGH vol', padLR, volBarY + volBarH + 8);

    // Price line with emphasized wicks
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    absPrices.forEach((v, i) => { const x = padLL + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // ERD values — low
    const erdY = h - 42;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Effort: 2.5\u00d7  \u00b7  Result: 0.3\u00d7', mid / 2, erdY);
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('ERD Balance \u2193  \u2192  NOT ACCEPTING', mid / 2, erdY + 12);

    // Label
    ctx.fillStyle = 'rgba(239,68,68,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('"effort trapped"', mid / 2, erdY + 24);

    // === RIGHT: ACCEPTANCE ===
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('ACCEPTANCE', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('neither side pushing hard \u2014 mutual agreement', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (pts - 1);

    // Gentle rotation around a midpoint
    const accPrices: number[] = [];
    for (let i = 0; i < pts; i++) {
      accPrices.push(100 + Math.sin(i * 0.4 + t) * 0.8 + Math.cos(i * 0.25 + t) * 0.5);
    }

    // Smaller volume bars
    for (let i = 0; i < pts; i++) {
      const x = padRL + i * xStepR;
      const vol = 0.25 + Math.abs(Math.sin(i * 0.5 + t)) * 0.2;
      ctx.fillStyle = 'rgba(0,179,164,' + (0.3 + vol * 0.3) + ')';
      ctx.fillRect(x - xStepR / 2 + 1, volBarY + (1 - vol) * volBarH, xStepR - 2, vol * volBarH);
    }
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MOD vol', padRR, volBarY + volBarH + 8);

    // Price oscillating gently
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    accPrices.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Zone emerging
    ctx.fillStyle = 'rgba(0,179,164,0.18)';
    ctx.fillRect(padRL, toYL(101), padRR - padRL, toYL(99) - toYL(101));
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 1;
    ctx.strokeRect(padRL, toYL(101), padRR - padRL, toYL(99) - toYL(101));
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('MAZ forming', padRR - 4, toYL(100) + 3);

    // ERD values — balanced
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Effort: 1.1\u00d7  \u00b7  Result: 0.9\u00d7', mid + mid / 2, erdY);
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('ERD Balance \u2191  \u2192  IS ACCEPTING', mid + mid / 2, erdY + 12);
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('"mutual equilibrium"', mid + mid / 2, erdY + 24);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MAZ interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'You see a zone labeled <strong>MAZ • 3/3</strong> at $74,500 on your BTC 15m chart. Price approaches it from above. What does the label specifically tell you?',
    options: [
      { text: 'All three timeframes (15m chart + 1H + 4H via Auto-MTF) currently show acceptance conditions at this price. This is a structurally significant zone — institutional flow across multiple horizons agrees that this is a region of market acceptance. Treat it with higher conviction than a plain MAZ.', correct: true, explain: 'Correct. The 3/3 notation is the consensus detail. Per the Auto-MTF table, a 15m chart maps to 1H and 4H higher timeframes. When all three agree that acceptance conditions are met, the zone is classified as AMTF (Accepted Multi-Timeframe) — the highest tier of MAZ. These zones decay slower (×0.999/bar vs ×0.998/bar for plain ATF) precisely because they represent structurally deeper agreement.' },
      { text: 'There are 3 separate zones stacked at this level', correct: false, explain: 'No — the 3/3 is a consensus count, not a zone count. It means 3 out of 3 timeframes are in acceptance simultaneously: the chart timeframe plus the two HTFs from the Auto-MTF mapping table. One zone, drawn at multi-timeframe consensus strength.' },
    ],
  },
  {
    scenario: 'A MAZ zone that was teal (active) 40 bars ago is now showing amber. What does this mean?',
    options: [
      { text: 'The zone has transitioned to aging due to time decay', correct: false, explain: 'Aging zones go GREY (colorAcceptWeak #8A8A8A), not amber. Amber is specifically colorBreaking #F9A825. It only appears when price is currently INSIDE the zone. The color shift signals a transition state — the zone is being tested right now.' },
      { text: 'Price is currently inside the zone. Amber is the &ldquo;breaking&rdquo; / transition color — it flags zones under active test. When price leaves above, the zone might re-age to teal (active) if acceptance conditions hold, or break down if rejection occurs. This is a live-test signal, not a signal to trade.', correct: true, explain: 'Exactly. The Pine source maps the color logic explicitly: colorBreaking #F9A825 is used when priceInZone is true. It is a STATE flag, not a directional signal. The correct response is to watch how price resolves — a clean breakdown would be an EFFICIENCY > 0.50 + positive vol momentum exit (&ldquo;rejection&rdquo; in the source), which would transition the zone to aging with a strength cut.' },
    ],
  },
  {
    scenario: 'You are running MAZ on a 5-minute chart with Zone Frequency set to &ldquo;Conservative.&rdquo; You notice very few zones forming compared to a friend running it on &ldquo;Aggressive.&rdquo; Why?',
    options: [
      { text: 'Conservative requires 7 consecutive accepting bars before zone birth (vs 3 on Aggressive), uses a tighter acceptance threshold (0.62 vs 0.48), and a tighter cluster width (ATR×2.0 vs ATR×3.5). The preset is deliberately fewer-but-higher-quality zones.', correct: true, explain: 'Correct across every lever: persistEff 7/5/3, acceptThrEff 0.62/0.55/0.48, clusterWidthMult 2.0/2.5/3.5. The Conservative preset exists for traders who want only the most structurally confirmed zones, accepting fewer signals in exchange for higher conviction per signal. Aggressive is for traders who want more zones and will filter themselves.' },
      { text: 'Conservative disables Multi-Timeframe detection', correct: false, explain: 'No — MTF is controlled by the mtfMode input (Off/Auto/Manual) independently of Zone Frequency. Conservative affects acceptance thresholds, persistence requirements, cluster width, and merge distances — but not MTF. You could absolutely run Conservative + Auto MTF together, and in fact many professional users do.' },
    ],
  },
  {
    scenario: 'You notice that some zones have <strong>H •</strong> prefixed to their label (e.g., <strong>H • MAZ</strong>). What does the H signify and what should you do with these zones?',
    options: [
      { text: 'H = Historic. The zone is no longer active acceptance but remains visible as memory context. Its strength has decayed past the aging threshold, so it is rendered at much higher transparency (88-96 alpha on Neon theme). Use it as WEAK structural context — price revisiting may or may not react, but it is a note about where acceptance previously existed.', correct: true, explain: 'Right. The Pine code explicitly prefixes &ldquo;H • &rdquo; for ZONE_HISTORIC state. Alpha transparency scales from ALPHA_HISTORIC_MIN_NEON (88) to ALPHA_HISTORIC_MAX_NEON (94) as the zone ages further through the HISTORIC_FADE_BARS (400) window. These are intentionally de-emphasized because their statistical weight has decayed — treat them as context, not as reliable levels.' },
      { text: 'H = High-Priority. Treat these zones as stronger than regular MAZ.', correct: false, explain: 'Backwards. Historic zones are WEAKER, not stronger. They have passed through Active → Aging → Historic lifecycle states, with strength continuing to decay each bar toward the removal threshold (0.15). The visual de-emphasis (much higher transparency) is the indicator explicitly downgrading their importance.' },
    ],
  },
  {
    scenario: 'A brand-new cluster has formed: 5 consecutive bars meeting the acceptance threshold (0.55 on Balanced preset), but the cluster width is 3× current ATR. Does MAZ create a zone?',
    options: [
      { text: 'No. Zone creation requires BOTH (a) persistence ≥ 5 bars (met) AND (b) cluster width ≤ ATR × 2.5 (not met, width is 3× ATR). Both conditions must be satisfied or no zone is emitted. This prevents overly wide, low-information zones from cluttering the chart.', correct: true, explain: 'Correct. The source logic is explicit: shouldCreateZone = clusterConfirmed AND clusterWidthOk. clusterConfirmed becomes true at persistEff bars. clusterWidthOk requires clusterWidth ≤ ATR × clusterWidthMult (2.5 on Balanced). A 3×ATR cluster fails the second check, so the potential zone is discarded. This is an important invariant — wide &ldquo;acceptance&rdquo; without tight price agreement is just chop, not real acceptance.' },
      { text: 'Yes — persistence alone is enough to create a zone', correct: false, explain: 'Persistence alone is necessary but not sufficient. The width check exists because a &ldquo;wide&rdquo; cluster (e.g., 3×ATR) indicates price is still oscillating broadly even if it meets the score threshold bar-by-bar. MAZ requires BOTH temporal persistence AND spatial tightness to classify a region as true acceptance.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market Acceptance Zones represent:', opts: ['Precise support and resistance levels', 'Regions of market agreement where price rotates, efficiency drops, effort ≈ result, and participation stabilizes', 'Fibonacci retracement bands', 'Volume profile POCs'], correct: 1, explain: 'The Pine source opens with the explicit statement: &ldquo;This is MARKET AGREEMENT, not support/resistance.&rdquo; Zones mark regions of rotational behavior — not precise levels.' },
  { q: 'The Acceptance Score is composed of four weighted components:', opts: ['RSI, MACD, BB, VWAP', 'Efficiency (30%) + ERD Balance (25%) + Vol Decay (25%) + Participation (20%)', 'Price, volume, time, volatility', 'Support, resistance, trend, momentum'], correct: 1, explain: 'Weights are locked constants: W_EFFICIENCY 0.30, W_ERD_BALANCE 0.25, W_VOL_DECAY 0.25, W_PARTICIPATION 0.20. The composite must meet the preset threshold (0.48–0.62) for a bar to count as accepting.' },
  { q: 'Zone creation requires:', opts: ['1 accepting bar only', 'persistEff consecutive accepting bars AND cluster width ≤ ATR × clusterWidthMult &mdash; both conditions must be met', 'A volume spike', 'A Fibonacci extension'], correct: 1, explain: 'shouldCreateZone = clusterConfirmed AND clusterWidthOk. Conservative needs 7 bars + width ≤ 2.0 ATR; Balanced needs 5 + 2.5 ATR; Aggressive needs 3 + 3.5 ATR.' },
  { q: 'The four zone lifecycle states are:', opts: ['Bullish, Bearish, Neutral, Exit', 'ACTIVE → AGING → HISTORIC → REMOVE with specific transition triggers for each step', 'Entry, Hold, Target, Stop', 'Compression, Expansion, Trend, Distribution'], correct: 1, explain: 'ACTIVE = fresh & strong. AGING = time/rejection decay, re-acceptance touch can revive. HISTORIC = stale, memory context only. REMOVE = strength < 0.15 or historic age > 1200 bars. Transitions depend on touch tracking, time, and strength.' },
  { q: 'AMTF (Accepted Multi-Timeframe) zones differ from plain MAZ zones because:', opts: ['They use a different color', 'They decay slower (×0.999/bar vs ×0.998/bar), render with different alpha, and require consensusMin of timeframes to agree simultaneously', 'They use Fibonacci math', 'They ignore the acceptance score'], correct: 1, explain: 'AMTF requires tfCount ≥ consensusMin (default 2 of 3 TFs). Source explicitly uses slower decay rate 0.999 vs 0.998 for ATF. Alpha rails differ too: ALPHA_HTF_NEON 61 vs ALPHA_ATF_NEON 75.' },
  { q: 'The &ldquo;H •&rdquo; prefix on a zone label indicates:', opts: ['High-priority zone', 'Historic zone &mdash; strength has decayed past aging, rendered with much higher transparency as memory context', 'Hedge zone', 'HTF zone'], correct: 1, explain: 'The source prefixes &ldquo;H • &rdquo; exclusively for ZONE_HISTORIC state. These are de-emphasized via alpha (88-96 on Neon) because their statistical weight has decayed. Pure memory context, not active acceptance.' },
  { q: 'Zone merging logic triggers when:', opts: ['Two zones have the same exact price', 'Overlap ratio ≥ zoneMergeOverlapPct (0.45 on Balanced) OR midpoint distance ≤ zoneMergeDistATR × ATR', 'A volume spike occurs', 'A new timeframe is added'], correct: 1, explain: 'findOverlappingZone checks two conditions: (a) overlapRatio ≥ mergeOverlapPct (0.30/0.45/0.55 across presets), OR (b) mid-to-mid distance ≤ mergeDistATR × ATR (0.50/0.35/0.25). First match wins. Merged zone inherits max strength and tfCount, union of bounds.' },
  { q: 'The Auto-MTF mapping for a 15m chart resolves to:', opts: ['5m + 30m', '1H + 4H (locked per the 18-row Auto-MTF table)', '1D + 1W', '30m + 1H'], correct: 1, explain: 'Directly from the Auto-MTF table in the source: 15m → 1H + 4H. The table is deterministic; Manual mode allows override, Off disables MTF entirely.' },
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
export default function MAZDeepDiveLesson() {
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
    { wrong: 'Treating MAZ zones like traditional S/R levels', right: 'MAZ zones are acceptance REGIONS, not levels. A zone at 74,500 is a range of agreement, not a precise number to set a stop at. The whole design philosophy (the zone has height, the label says MAZ not SR) exists to break the level-hunting habit. Trade the zone edges as context, not as exact pivots.', icon: '📍' },
    { wrong: 'Ignoring the MAZ vs MAZ • N/3 distinction', right: 'A plain MAZ is chart-timeframe-only acceptance. A MAZ • 3/3 is a zone where ALL configured timeframes agree. Treating them as equivalent means treating a scalp zone like an institutional zone. The consensus detail is the single most important readability feature — respect it.', icon: '🏷️' },
    { wrong: 'Using Aggressive preset on higher timeframes', right: 'Aggressive drops persistence to 3 bars and widens cluster tolerance to 3.5 ATR. On a 4H or Daily chart, this will produce a cluttered mess of overlapping zones that merge into uselessness. Match preset to timeframe: Conservative for HTF clarity, Balanced for intraday default, Aggressive only for LTF where speed matters.', icon: '⚙️' },
    { wrong: 'Treating Historic (H •) zones as active support', right: 'Historic zones are memory. Their strength has decayed past the aging threshold, they render at 88-96 alpha transparency on purpose, and they sit on the road to full removal. They are there for awareness, not trade execution. If you want active zones only, disable showHistoric in settings.', icon: '👻' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 5</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market Acceptance<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Zones</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Market agreement, not support/resistance. Four-part acceptance scoring. Multi-timeframe consensus. Zones that are born, age, and die on their own. No levels to draw. No signals to chase.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The S/R Delusion</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every retail trader learns to draw support and resistance lines. Precise horizontal lines at swing highs, swing lows, round numbers, previous closes. Every retail trader discovers the same thing: <strong className="text-amber-400">these lines don&apos;t actually hold</strong>. Not because the trader drew them wrong, but because the underlying concept is wrong. Price doesn&apos;t respect lines. Price respects <strong className="text-white">regions of market agreement</strong>.</p>
            <p className="text-gray-400 leading-relaxed mb-4">MAZ is the tool that corrects this. Instead of asking &ldquo;where should I draw lines?&rdquo;, it asks &ldquo;where has the market actually been demonstrating acceptance?&rdquo; — a completely different question. It scores four characteristics (efficiency drop, effort/result balance, volatility decay, participation stability), requires persistence before declaring a zone, enforces a width sanity check, and tracks each zone through a full lifecycle. The output is the opposite of a single precise line: a <strong className="text-white">region</strong>, with a <strong className="text-white">strength score</strong>, and an <strong className="text-white">explicit confidence level</strong> (MAZ vs MAZ • N/3).</p>
            <p className="text-gray-400 leading-relaxed">The Pine source states the philosophy plainly: <em>&ldquo;This is MARKET AGREEMENT, not support/resistance.&rdquo;</em> Read it as a category shift, not a refinement. Once you internalize it, you stop hunting levels and start reading structure.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE MAZ AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">A zone exists where the market has <strong>agreed</strong>. Not where YOU drew a line. Not where Fibonacci suggested. Where the four acceptance conditions were all simultaneously true for enough consecutive bars, within a tight-enough price cluster, that an algorithm looking only at raw market behavior flagged it. That objectivity is the point.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Agreement vs S/R === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Agreement ≠ S/R</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Lines Fail Where Zones Work</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A traditional S/R line claims precision it doesn&apos;t have. A zone admits its own uncertainty — it has <strong className="text-white">height</strong>, it has a <strong className="text-white">state</strong>, it has a <strong className="text-white">consensus label</strong>, and it has a <strong className="text-white">strength score</strong>. Every one of those properties exists because markets are statistical, not geometric.</p>
          <SRvsZonesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Honesty Principle</p>
            <p className="text-sm text-gray-400">A zone says &ldquo;acceptance happened somewhere in this range.&rdquo; A line says &ldquo;price will reverse at exactly this number.&rdquo; One of those statements is supportable by evidence. The other is confirmation bias waiting to happen. MAZ&apos;s refusal to emit lines is a design decision, not a limitation.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Four-Part Score === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Acceptance Score</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Components, Locked Weights</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every bar gets an acceptance score between 0 and 1. It is computed as the weighted sum of four bounded measurements: <strong className="text-sky-400">Efficiency (30%)</strong>, <strong className="text-amber-400">ERD Balance (25%)</strong>, <strong className="text-violet-400">Vol Decay (25%)</strong>, and <strong className="text-green-400">Participation (20%)</strong>. The weights are CONSTANTS in the source code — they don&apos;t change with preset, market, or timeframe. Only the acceptance threshold does (0.48 Aggressive, 0.55 Balanced, 0.62 Conservative).</p>
          <FourPartScoreAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why These Weights</p>
            <p className="text-sm text-gray-400">Efficiency gets the highest weight (30%) because low efficiency is the most direct signature of acceptance — price moving a lot without going anywhere. ERD Balance and Vol Decay tie at 25% each because both capture different facets of &ldquo;effort being absorbed.&rdquo; Participation gets 20% because it filters rather than detects — it confirms stability rather than identifying acceptance itself.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Efficiency === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Efficiency</p>
          <h2 className="text-2xl font-extrabold mb-4">Displacement Over Total Path</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Efficiency = <code className="text-white">abs(close - close[lenBase]) / sum(abs(close - close[1]), lenBase)</code>. High efficiency means the market took the straightest path to its destination — classic trending behavior. Low efficiency means price walked a long path to go barely anywhere — classic rotation. MAZ treats efficiency <strong className="text-white">≤ 0.35</strong> as a strong acceptance condition.</p>
          <EfficiencyScoreAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 0.35 Specifically</p>
            <p className="text-sm text-gray-400">The source exposes this as a configurable input (efficiencyLowThr). The default 0.35 means the path must be at least ~3× the displacement for the bar to count strongly toward acceptance. You can tune it — 0.30 for stricter zones, 0.45 for more relaxed. But change the acceptance threshold, not this number, unless you have a specific reason.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: ERD Balance === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; ERD Balance</p>
          <h2 className="text-2xl font-extrabold mb-4">When Effort Equals Result</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Effort-Result-Distance balance compares <strong className="text-white">effort</strong> (volume vs average) to <strong className="text-white">result</strong> (price move vs ATR). Both are capped at 3× and 2× respectively to prevent outlier distortion. When they are roughly equal, ERD Balance is high — a &ldquo;proportional&rdquo; market doing ordinary rotation. When they diverge heavily (high volume, no movement — absorption; or big move on no volume — breakout), ERD Balance drops, and the bar counts <strong className="text-white">less</strong> toward acceptance.</p>
          <ERDBalanceAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Absorption Blind Spot</p>
            <p className="text-sm text-gray-400">ERD Balance intentionally REJECTS absorption as acceptance. &ldquo;Price is being absorbed&rdquo; and &ldquo;price is being accepted&rdquo; look similar at a glance but are opposites. Absorption means one side is pushing and getting stopped; acceptance means neither side is pushing hard. MAZ refuses to conflate them — which is why zones don&apos;t form in the middle of heavy absorption, even if efficiency is low.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Vol Decay === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Volatility Decay</p>
          <h2 className="text-2xl font-extrabold mb-4">Contraction Is The Signature</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Vol Decay uses a smoothed ATR and measures its 10-bar momentum as a percentage. If momentum is <strong className="text-teal-400">below -3%</strong> (contracting), the score is 1.0. If it&apos;s <strong className="text-violet-400">between -3% and 0%</strong> (stable/declining mildly), the score is 0.5. If <strong className="text-red-400">positive</strong> (expanding), the score is 0.0. Expanding volatility is fundamentally incompatible with acceptance — expanding vol means directional release, not rotation.</p>
          <VolatilityDecayAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Trinary Gate</p>
            <p className="text-sm text-gray-400">Vol Decay uses three levels (1.0 / 0.5 / 0.0) rather than a continuous score. This is deliberate — it&apos;s a classification, not a measurement. Either volatility is contracting (clear acceptance condition), neutral (partial), or expanding (no acceptance possible). Binary-style decisiveness prevents ambiguous bars from sneaking into the score.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: Participation === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Participation Stability</p>
          <h2 className="text-2xl font-extrabold mb-4">The Stability Filter</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Participation = <code className="text-white">efficiency × sqrt(effortRatio)</code>. Its raw value matters less than its <strong className="text-white">stability</strong> over the lookback window — <code className="text-white">1 - (stdev / mean)</code>. A market where participation is bouncing around rapidly can&apos;t be in acceptance, even if other conditions line up. Below the <strong className="text-amber-400">participationMin threshold (0.45 default)</strong>, the score drops to 0 — hard gate.</p>
          <ParticipationStabilityAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The 20% Weight Decision</p>
            <p className="text-sm text-gray-400">Participation gets the lowest weight (20%) because it&apos;s fundamentally a filter rather than a detector. The other three components (Efficiency, ERD, Vol Decay) tell you &ldquo;is this behavior consistent with acceptance?&rdquo; Participation tells you &ldquo;is anyone actually engaged enough for this to matter?&rdquo; Necessary but secondary — hence the smaller weight.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07: Zone Birth === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Zone Birth</p>
          <h2 className="text-2xl font-extrabold mb-4">Persistence AND Width</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A single accepting bar does nothing. Zone creation requires <strong className="text-white">both</strong>: (1) a cluster of <code className="text-white">persistEff</code> consecutive accepting bars (3 / 5 / 7 depending on preset), and (2) the high-low span of that cluster ≤ ATR × <code className="text-white">clusterWidthMult</code> (3.5 / 2.5 / 2.0). The AND is critical — persistence without tight clustering is just a string of low-efficiency bars during a drift.</p>
          <ZoneBirthAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why The Dual Gate</p>
            <p className="text-sm text-gray-400">You need persistence because one bar of acceptance is noise. You need width control because 5 bars oscillating over a 4×ATR range is still chop, regardless of score. Together they define &ldquo;a real acceptance cluster&rdquo; — tight in price, sustained in time. Failed width checks are the most common &ldquo;zone almost formed&rdquo; event, and the source discards them silently, which is the correct behavior.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08: Lifecycle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Lifecycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Zones Have Lives</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every zone lives through four states. <strong className="text-teal-400">ACTIVE</strong> (fresh, strong — teal) transitions to <strong className="text-gray-400">AGING</strong> (grey) either from rejection (price breaking out with high efficiency + positive vol momentum) or from time passing (<code className="text-white">zoneAge &gt; fadeBars/3</code>). AGING transitions to <strong className="text-gray-500">HISTORIC</strong> (darker grey, H • prefix) from staleness. HISTORIC eventually hits <strong className="text-red-400">REMOVE</strong> when strength drops below 0.15 or historic age exceeds 1200 bars.</p>
          <ZoneLifecycleAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Revival Via Re-Acceptance</p>
            <p className="text-sm text-gray-400">An aging zone CAN revert to active. The trigger: a &ldquo;re-acceptance touch&rdquo; — price touches the zone AND current bar has efficiency ≤ 0.35 AND vol momentum ≤ 0. This is rotation re-confirming. When it happens, strength bumps up (×1.01) and state flips back to ACTIVE. This is how zones &ldquo;stay alive&rdquo; through multiple tests — they need to be actively re-accepted, not just passively touched.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: Decay === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Decay &amp; Pruning</p>
          <h2 className="text-2xl font-extrabold mb-4">AMTF Decays Slower</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every zone&apos;s strength decays per bar: <strong className="text-teal-400">×0.999</strong> if AMTF (multi-timeframe consensus), <strong className="text-gray-400">×0.998</strong> if ATF-only. That tiny 0.001 difference means AMTF zones last <strong className="text-white">roughly twice as long</strong> before hitting the 0.15 removal threshold. Rejection events apply an additional faster decay (×0.97 for ATF, ×0.98 for AMTF) — a sharp cut for breaking behavior on top of the background time decay.</p>
          <ZoneDecayAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Deliberately Asymmetric Decay</p>
            <p className="text-sm text-gray-400">The asymmetry isn&apos;t arbitrary. Multi-timeframe consensus zones represent deeper structural agreement — institutional flow operating across horizons. Single-timeframe zones can be intraday artifacts. Making AMTF decay slower is the code&apos;s way of saying: &ldquo;different zone types have different half-lives in the real market — we model that explicitly.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* === S10: Merging === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Zone Merging</p>
          <h2 className="text-2xl font-extrabold mb-4">When Two Zones Become One</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When a new zone candidate overlaps an existing zone by <strong className="text-amber-400">≥ zoneMergeOverlapPct</strong> (0.30 / 0.45 / 0.55) OR their midpoints are within <strong className="text-amber-400">zoneMergeDistATR × ATR</strong> (0.50 / 0.35 / 0.25), they merge. The merged zone inherits the union of bounds, the max of strengths, and the max of tfCounts. It becomes AMTF if either parent was. No duplicates accumulate.</p>
          <ZoneMergingAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Merge Prevents Clutter</p>
            <p className="text-sm text-gray-400">Without automatic merging, re-acceptance of a region would stack dozens of zones on top of each other — unreadable chart, duplicated analysis. The merge rule ensures there&apos;s at most ONE zone per region of acceptance, with its strength reflecting cumulative confidence. Conservative preset uses the loosest merge criteria (0.30 overlap or 0.50 ATR dist) because it already has fewer zones — those zones should rarely overlap.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11: Three Types === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Three Types</p>
          <h2 className="text-2xl font-extrabold mb-4">MAZ · MAZ • N/3 · H • MAZ</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every zone on your chart is one of three types. <strong className="text-teal-400">MAZ</strong> is chart-timeframe-only acceptance — fine for the TF you&apos;re on, no consensus claim. <strong className="text-teal-400">MAZ • 2/3</strong> or <strong className="text-teal-400">MAZ • 3/3</strong> is multi-timeframe consensus — the chart TF plus the Auto-MTF pair agreed simultaneously (weighted, structurally deeper). <strong className="text-gray-500">H • MAZ</strong> is historic — it&apos;s a past zone kept visible as memory context.</p>
          <ThreeZoneTypesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Consensus Detail Toggle</p>
            <p className="text-sm text-gray-400">You can choose to display <code className="text-white">MAZ • HTF</code> as a generic AMTF label, or <code className="text-white">MAZ • 2/3</code> / <code className="text-white">MAZ • 3/3</code> as explicit consensus counts. The explicit version is on by default because the difference between 2/3 and 3/3 matters — a 3/3 zone where ALL timeframes agree is meaningfully stronger than a 2/3 zone where only two align. Trade accordingly.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12: Auto-MTF === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Auto-MTF Mapping</p>
          <h2 className="text-2xl font-extrabold mb-4">The 18-Row Locked Table</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When mtfMode is &ldquo;Auto,&rdquo; MAZ picks the two higher timeframes using a deterministic lookup — no guessing, no user input required. <strong className="text-white">15m → 1H + 4H</strong>. <strong className="text-white">1H → 4H + 1D</strong>. <strong className="text-white">1D → 1W + 1M</strong>. The mapping is structural — each chart TF pairs with the two TFs that professional multi-timeframe analysis traditionally uses for context and structure.</p>
          <AutoMTFMappingAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Manual Override Exists</p>
            <p className="text-sm text-gray-400">You can set <code className="text-white">mtfMode = &ldquo;Manual&rdquo;</code> and choose your own HTF1 and HTF2 via the <code className="text-white">tfManual1</code> / <code className="text-white">tfManual2</code> inputs. Useful if you&apos;re running a system where you want, say, always 1H + 4H regardless of chart timeframe. But for 95% of users, Auto produces the right structural pairs. You can also set <code className="text-white">mtfMode = &ldquo;Off&rdquo;</code> to disable MTF entirely — in that case every zone is plain MAZ.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13: Acceptance vs Absorption Distinction (★ GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Acceptance vs Absorption &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">The Distinction Every Retail Trader Conflates</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Watch any trading education stream for 30 minutes. At some point someone says &ldquo;price is being absorbed at this level&rdquo; and at another point &ldquo;price is being accepted in this zone&rdquo; &mdash; and they often mean the same thing. <strong className="text-white">They are not the same thing.</strong> They are opposites. The confusion is so widespread that MAZ encodes an <em>explicit test</em> in the ERD Balance component specifically to <strong className="text-white">reject absorption as acceptance</strong>. This is one of the few places in retail indicator design where a conceptual distinction gets hard-wired into the math.</p>
          <AcceptanceVsAbsorptionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128302; The Distinction Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-red-400">Absorption</strong> means <em>one side is pushing and getting stopped</em>. High volume, high effort, near-zero result &mdash; price hitting a level repeatedly with size and failing to break it. The institutional agent on the OTHER side is swallowing the order flow. It looks like range but it is <em>conflict</em>. <strong className="text-teal-400">Acceptance</strong> means <em>neither side is pushing hard</em>. Moderate volume, moderate effort, proportional result &mdash; price rotating gently because both sides agree the current range is fair. It also looks like range but it is <em>consensus</em>. On a candlestick chart they can look identical: a sideways box. The price action alone cannot distinguish them. You need the volume-to-displacement ratio &mdash; which is exactly what ERD Balance measures.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Why this matters operationally:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Absorption resolves violently.</strong> When the absorbing agent finally withdraws or gets overwhelmed, price releases hard in the direction opposite to the failed pushes. Trade absorption as a REVERSAL setup, not a range.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Acceptance resolves slowly.</strong> When an acceptance zone ends, it&apos;s because a new regime developed around it &mdash; drift, not explosion. Trade acceptance as a LEVEL, with expectation of mean reversion within the zone.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">MAZ refuses to draw zones during absorption.</strong> This is the key design decision. An absorption area might look like a rotation zone, but ERD Balance scores low because the effort-to-result ratio is broken. The acceptance score fails the preset threshold. No zone emitted. This prevents MAZ from marking the very areas where your trade thesis is most likely to fail.</li>
              <li><strong className="text-amber-400">4.</strong> <strong className="text-white">Stacking MAZ with MPG catches absorption directly.</strong> When MPG shows magenta (isAbsorbed: act &gt;1.5 AND eff &lt;0.30) near a price region where MAZ refuses to form a zone &mdash; that region is absorption. The two tools together give you an explicit read on what the price action alone can&apos;t tell you.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S14: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MAZ</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every mistake below traces back to the same root: the trader is reading MAZ through an S/R lens. Remove that lens and the tool becomes immediately more useful.</p>
          <div className="space-y-3">
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

      {/* === S14: Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">MAZ In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Core Idea</p>
                <p className="text-sm text-gray-300">This is market AGREEMENT, not support/resistance. Zones mark regions of statistical acceptance — where rotation, efficiency decay, effort/result balance, and stable participation all coexist.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Acceptance Score Formula</p>
                <p className="text-sm text-gray-300">Efficiency×0.30 + ERD_Balance×0.25 + Vol_Decay×0.25 + Participation×0.20. Weights are locked constants. Threshold varies by preset (0.48 / 0.55 / 0.62).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Zone Birth Conditions</p>
                <p className="text-sm text-gray-300">Persistence (3/5/7 bars) AND width ≤ ATR × (3.5/2.5/2.0) across Aggressive/Balanced/Conservative presets.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Four Zone States</p>
                <p className="text-sm text-gray-300">ACTIVE (teal) → AGING (grey) → HISTORIC (darker grey, H• prefix) → REMOVE. Re-acceptance touches can revive AGING → ACTIVE.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Three Zone Types</p>
                <p className="text-sm text-gray-300">MAZ (ATF only) · MAZ • N/3 (AMTF consensus, decays slower ×0.999/bar) · H • MAZ (historic memory).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Colors (Locked)</p>
                <p className="text-sm text-gray-300">Teal #00B3A4 = active. Grey #8A8A8A = aging. Darker grey #6A6A6A = historic. Amber #F9A825 = price inside (breaking/transition).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Auto-MTF Pairs</p>
                <p className="text-sm text-gray-300">15m→1H+4H · 1H→4H+1D · 4H→1D+1W · 1D→1W+1M. Deterministic 18-row lookup; manual override available.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Exports</p>
                <p className="text-sm text-gray-300">activeZoneCount · agingZoneCount · historicZoneCount · amtfZoneCount · acceptanceScore (via data window).</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading Zones Without Regressing To Lines</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each tests whether you can interpret MAZ states, labels, and transitions as the diagnostic signals they are — or whether your S/R muscle memory is still pattern-matching.</p>
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
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '✓' : '✗'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MAZ as zones, not lines. The S/R muscle memory is overridden.' : gameScore >= 3 ? 'Solid grasp. Re-read the zone type and lifecycle sections before the quiz.' : 'Re-study the 4-part score and zone types sections before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S16: Quiz + Cert === */}
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
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">&#9989;</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">◈</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market Acceptance Zones</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Acceptance Zone Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.5-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
