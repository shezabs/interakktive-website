// app/academy/lesson/market-state-intelligence-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.4: Market State Intelligence Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
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
// ANIMATION 1: Three Forces — Drive / Opposition / Stability
// ============================================================
function ThreeForcesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Three Forces — Drive × Opposition × Stability', w / 2, 14);

    const forces = [
      { name: 'DRIVE', sublabel: 'directional effort', value: 55 + Math.sin(t) * 25, color: '#3A8F6B', desc: 'Is price moving with conviction?' },
      { name: 'OPPOSITION', sublabel: 'absorption pressure', value: 40 + Math.sin(t * 0.8 + 1) * 20, color: '#C28B2C', desc: 'Is effort being absorbed?' },
      { name: 'STABILITY', sublabel: 'structural persistence', value: 60 + Math.sin(t * 0.6 + 2) * 18, color: '#2FA4A9', desc: 'Is the regime holding?' },
    ];

    const boxW = (w - 60) / 3 - 8;
    const boxH = h - 70;
    const startX = 20;

    forces.forEach((force, i) => {
      const x = startX + i * (boxW + 14);
      const y = 32;

      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = force.color + '70';
      ctx.strokeRect(x, y, boxW, boxH);

      // Name
      ctx.fillStyle = force.color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(force.name, x + boxW / 2, y + 16);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(force.sublabel, x + boxW / 2, y + 28);

      // Circular meter
      const centerX = x + boxW / 2;
      const centerY = y + 70;
      const radius = 26;
      ctx.strokeStyle = force.color + '20';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();

      ctx.strokeStyle = force.color;
      ctx.lineWidth = 4;
      const sweep = (force.value / 100) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + sweep); ctx.stroke();

      // Center number
      ctx.fillStyle = force.color;
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(force.value.toFixed(0), centerX, centerY + 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText('0-100', centerX, centerY + 18);

      // Description
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      // Wrap if needed
      ctx.fillText(force.desc, x + boxW / 2, y + boxH - 10);
    });

    // Bottom: "=" and classification preview
    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    const d = forces[0].value;
    const o = forces[1].value;
    const s = forces[2].value;
    let regime = 'COMPRESSION';
    let regimeColor = '#5F6B7A';
    if (d > 55 && o < 35) { regime = 'EXPANSION'; regimeColor = '#2FA4A9'; }
    else if (d > 35 && o < 55 && s > 60) { regime = 'TREND'; regimeColor = '#3A8F6B'; }
    else if (d > 35 && o > 55) { regime = 'DISTRIBUTION'; regimeColor = '#C28B2C'; }
    else if (d < 35 && o < 35) { regime = 'COMPRESSION'; regimeColor = '#5F6B7A'; }
    ctx.fillStyle = regimeColor;
    ctx.fillText(`→ CURRENT REGIME: ${regime}`, w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Drive Anatomy — 3 components building Drive
// ============================================================
function DriveAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Drive Anatomy — 3 Ingredients, Weighted', w / 2, 14);

    const components = [
      { label: 'Net Progress', value: 0.72 + Math.sin(t) * 0.1, weight: 0.45, desc: 'displacement / path sum' },
      { label: 'Range Quality', value: 0.58 + Math.sin(t * 0.8) * 0.08, weight: 0.30, desc: 'actual vs expected range' },
      { label: 'Body Dominance', value: 0.65 + Math.sin(t * 1.1) * 0.09, weight: 0.25, desc: 'body / candle range' },
    ];

    // Left: three component bars
    const compStartX = 20;
    const compW = w * 0.5 - 30;
    const compY = 36;
    const rowH = 44;

    components.forEach((c, i) => {
      const y = compY + i * rowH;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, compStartX, y + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(c.desc, compStartX, y + 18);

      // Bar
      const barW = compW - 20;
      ctx.fillStyle = '#3A8F6B20';
      ctx.fillRect(compStartX, y + 24, barW, 10);
      ctx.fillStyle = '#3A8F6B';
      ctx.fillRect(compStartX, y + 24, barW * c.value, 10);

      // Value
      ctx.fillStyle = '#3A8F6B';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(c.value.toFixed(2), compStartX + barW, y + 21);

      // Weight badge
      ctx.fillStyle = 'rgba(245,158,11,0.15)';
      ctx.fillRect(compStartX + barW + 6, y + 24, 28, 10);
      ctx.strokeStyle = 'rgba(245,158,11,0.6)';
      ctx.strokeRect(compStartX + barW + 6, y + 24, 28, 10);
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`×${c.weight}`, compStartX + barW + 20, y + 32);
    });

    // Right: final Drive gauge
    const gaugeX = w * 0.75;
    const gaugeY = h / 2 + 4;
    const driveTotal = components.reduce((s, c) => s + c.value * c.weight, 0) * 100;

    // Gauge arc
    const gaugeRadius = 38;
    ctx.strokeStyle = '#3A8F6B20';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeRadius, Math.PI, 0); ctx.stroke();

    ctx.strokeStyle = '#3A8F6B';
    ctx.lineWidth = 8;
    const sweep = (driveTotal / 100) * Math.PI;
    ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeRadius, Math.PI, Math.PI + sweep); ctx.stroke();

    // Center label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DRIVE', gaugeX, gaugeY - 10);
    ctx.fillStyle = '#3A8F6B';
    ctx.font = 'bold 22px system-ui';
    ctx.fillText(driveTotal.toFixed(0), gaugeX, gaugeY + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('smoothed via EMA', gaugeX, gaugeY + 18);

    // Arrow between
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.58, h / 2); ctx.lineTo(gaugeX - gaugeRadius - 8, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gaugeX - gaugeRadius - 8, h / 2); ctx.lineTo(gaugeX - gaugeRadius - 13, h / 2 - 3); ctx.lineTo(gaugeX - gaugeRadius - 13, h / 2 + 3); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 3: Opposition Anatomy
// ============================================================
function OppositionAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Opposition Anatomy — Wicks · Effort Gap · Reversals', w / 2, 14);

    // Top: visual examples
    // 1. Candle with long wicks
    const ex1X = w * 0.1;
    const exY = 38;
    const exW = 30;

    // Draw an example candle with massive wicks (wick pressure)
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ex1X, exY); ctx.lineTo(ex1X, exY + 50); ctx.stroke();
    ctx.fillStyle = 'rgba(239,68,68,0.4)';
    ctx.fillRect(ex1X - 6, exY + 20, 12, 10);
    ctx.strokeStyle = '#EF5350';
    ctx.strokeRect(ex1X - 6, exY + 20, 12, 10);
    // Label
    ctx.fillStyle = 'rgba(194,139,44,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('WICK PRESSURE', ex1X, exY - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('total wick / range', ex1X, exY + 60);
    ctx.fillStyle = '#C28B2C';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('×0.35', ex1X, exY + 72);

    // 2. High volume tiny move
    const ex2X = w * 0.4;
    ctx.fillStyle = 'rgba(194,139,44,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EFFORT-RESULT GAP', ex2X, exY - 2);
    // Volume bar huge
    const volBarH = 35;
    ctx.fillStyle = '#C28B2C';
    ctx.fillRect(ex2X - 15, exY + 5, 8, volBarH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('vol', ex2X - 11, exY + 48);
    // Price change tiny
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex2X + 5, exY + 25); ctx.lineTo(ex2X + 25, exY + 22); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('price Δ', ex2X + 15, exY + 48);
    ctx.fillStyle = '#C28B2C';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('×0.40', ex2X, exY + 72);

    // 3. Reversal density — zigzag price
    const ex3X = w * 0.72;
    ctx.fillStyle = 'rgba(194,139,44,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('REVERSAL DENSITY', ex3X, exY - 2);
    // Zigzag
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const zigY = exY + 25;
    for (let i = 0; i < 10; i++) {
      const x = ex3X - 30 + i * 7;
      const y = zigY + (i % 2 === 0 ? -7 : 7);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('direction flips', ex3X, exY + 48);
    ctx.fillStyle = '#C28B2C';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('×0.25', ex3X, exY + 72);

    // Final Opposition output box
    const finalY = 150;
    const finalValue = 60 + Math.sin(t) * 12;
    const boxW = w - 100;
    const boxX = 50;

    ctx.fillStyle = 'rgba(194,139,44,0.1)';
    ctx.fillRect(boxX, finalY, boxW, 36);
    ctx.strokeStyle = 'rgba(194,139,44,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, finalY, boxW, 36);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('OPPOSITION', boxX + 10, finalY + 14);
    ctx.fillStyle = '#C28B2C';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText(finalValue.toFixed(0), boxX + 10, finalY + 30);

    // Bar in box
    const innerBarX = boxX + 80;
    const innerBarW = boxW - 90;
    ctx.fillStyle = '#C28B2C30';
    ctx.fillRect(innerBarX, finalY + 14, innerBarW, 12);
    ctx.fillStyle = '#C28B2C';
    ctx.fillRect(innerBarX, finalY + 14, innerBarW * (finalValue / 100), 12);
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 4: Stability Anatomy
// ============================================================
function StabilityAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stability Anatomy — Persistence · Variance · Consistency', w / 2, 14);

    const components = [
      { label: 'Persistence', desc: 'Drive & Opp changed < 5?', value: 0.75 + Math.sin(t) * 0.1, weight: 0.30, viz: 'flat' },
      { label: 'Variance', desc: 'Few threshold flips in window', value: 0.68 + Math.sin(t * 0.7) * 0.12, weight: 0.35, viz: 'smooth' },
      { label: 'Consistency', desc: 'Price dir follows prev dir', value: 0.72 + Math.sin(t * 1.1) * 0.09, weight: 0.35, viz: 'aligned' },
    ];

    const rowH = 42;
    const startY = 32;

    components.forEach((c, i) => {
      const y = startY + i * rowH;

      // Label + desc
      ctx.fillStyle = '#2FA4A9';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, 20, y + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '7px system-ui';
      ctx.fillText(c.desc, 20, y + 22);

      // Mini viz (flat line, smooth wave, aligned arrows)
      const vizX = w * 0.45;
      const vizW = w * 0.2;
      const vizMid = y + 18;
      ctx.strokeStyle = '#2FA4A9';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (c.viz === 'flat') {
        ctx.moveTo(vizX, vizMid);
        ctx.lineTo(vizX + vizW, vizMid + Math.sin(t) * 2);
      } else if (c.viz === 'smooth') {
        for (let j = 0; j < 30; j++) {
          const xx = vizX + (j / 29) * vizW;
          const yy = vizMid + Math.sin(j * 0.3 + t) * 4;
          j === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
        }
      } else {
        // Aligned arrows
        for (let j = 0; j < 5; j++) {
          const xa = vizX + 5 + j * ((vizW - 10) / 4);
          ctx.moveTo(xa, vizMid);
          ctx.lineTo(xa + 8, vizMid);
          ctx.moveTo(xa + 8, vizMid);
          ctx.lineTo(xa + 5, vizMid - 3);
          ctx.moveTo(xa + 8, vizMid);
          ctx.lineTo(xa + 5, vizMid + 3);
        }
      }
      ctx.stroke();

      // Bar + value
      const barX = w * 0.7;
      const barW = w - barX - 60;
      ctx.fillStyle = '#2FA4A920';
      ctx.fillRect(barX, y + 13, barW, 10);
      ctx.fillStyle = '#2FA4A9';
      ctx.fillRect(barX, y + 13, barW * c.value, 10);

      ctx.fillStyle = '#2FA4A9';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.value.toFixed(2), barX + barW + 6, y + 22);

      // Weight
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(`×${c.weight}`, barX + barW + 30, y + 22);
    });
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 5: The 5 Regimes — state space map
// ============================================================
function RegimeMapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 5 Regimes — One State Space', w / 2, 14);

    const regimes = [
      { name: 'COMPRESSION', short: 'COMP', desc: 'Low D · Low O · High S', color: '#5F6B7A', pos: { r: 0, c: 0 } },
      { name: 'EXPANSION', short: 'EXP', desc: 'High D · Low O · Rising', color: '#2FA4A9', pos: { r: 0, c: 1 } },
      { name: 'TREND', short: 'TREND', desc: 'Med-High D · High S · Aligned', color: '#3A8F6B', pos: { r: 0, c: 2 } },
      { name: 'DISTRIBUTION', short: 'DIST', desc: 'Med D · High O · Effort absorbed', color: '#C28B2C', pos: { r: 1, c: 0 } },
      { name: 'TRANSITION', short: 'TRANS', desc: 'Rising O · Low S · Shift', color: '#7B6E9D', pos: { r: 1, c: 1 } },
    ];

    const gridW = 3;
    const gridH = 2;
    const cellW = (w - 40) / gridW - 6;
    const cellH = (h - 50) / gridH - 6;
    const startX = 20;
    const startY = 32;

    const activeIdx = Math.floor(t * 0.4) % 5;

    regimes.forEach((r, i) => {
      const x = startX + r.pos.c * (cellW + 8);
      const y = startY + r.pos.r * (cellH + 8);

      const isActive = i === activeIdx;
      ctx.fillStyle = r.color + (isActive ? '35' : '15');
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = isActive ? r.color : r.color + '55';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, cellW, cellH);

      // Name
      ctx.fillStyle = isActive ? '#ffffff' : r.color;
      ctx.font = isActive ? 'bold 11px system-ui' : 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, x + cellW / 2, y + 18);

      // Short
      ctx.fillStyle = r.color;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(r.short, x + cellW / 2, y + 32);

      // Description
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(r.desc, x + cellW / 2, y + 48);

      // Mini sparkline inside
      const sparkY = y + cellH - 15;
      const sparkW = cellW - 20;
      const sparkX = x + 10;
      ctx.strokeStyle = r.color + 'aa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let j = 0; j < 20; j++) {
        const px = sparkX + (j / 19) * sparkW;
        let py = sparkY;
        if (r.short === 'COMP') py = sparkY + Math.sin(j * 0.3 + t) * 1;
        else if (r.short === 'EXP') py = sparkY - (j - 10) * 0.3 + Math.sin(j + t) * 0.5;
        else if (r.short === 'TREND') py = sparkY - j * 0.35 + Math.sin(j * 0.5 + t) * 0.8;
        else if (r.short === 'DIST') py = sparkY + Math.sin(j * 0.6 + t) * 3;
        else py = sparkY + Math.sin(j * 0.2 + t) * 4 + (j - 10) * 0.15;
        j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Legend cell (bottom-right empty slot)
    const lgX = startX + 2 * (cellW + 8);
    const lgY = startY + 1 * (cellH + 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(lgX, lgY, cellW, cellH);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('D = Drive', lgX + cellW / 2, lgY + 22);
    ctx.fillText('O = Opposition', lgX + cellW / 2, lgY + 36);
    ctx.fillText('S = Stability', lgX + cellW / 2, lgY + 50);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: The Classifier — decision tree logic
// ============================================================
function ClassifierLogicAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Classifier Logic — The Decision Tree', w / 2, 14);

    // Active check based on time
    const checkIdx = Math.floor(t * 0.6) % 5;

    const checks = [
      { cond: 'OppROC > 15 AND Stab < 40?', result: 'TRANSITION', color: '#7B6E9D', y: 36 },
      { cond: 'Drive > 55×s AND Opp < 35/s?', result: 'EXPANSION', color: '#2FA4A9', y: 64 },
      { cond: 'Drive > 35/s AND Opp < 55×s AND Stab > 60?', result: 'TREND', color: '#3A8F6B', y: 92 },
      { cond: 'Drive > 35/s AND Opp > 55×s?', result: 'DISTRIBUTION', color: '#C28B2C', y: 120 },
      { cond: 'Drive < 35/s AND Opp < 35/s?', result: 'COMPRESSION', color: '#5F6B7A', y: 148 },
    ];

    const condX = 20;
    const condW = w * 0.55;
    const arrowX = condX + condW + 10;
    const resX = arrowX + 30;
    const resW = w - resX - 20;

    checks.forEach((c, i) => {
      const isActive = i === checkIdx;

      // Condition box
      ctx.fillStyle = isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(condX, c.y, condW, 22);
      ctx.strokeStyle = isActive ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(condX, c.y, condW, 22);

      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.6)';
      ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(c.cond, condX + 8, c.y + 14);

      // Arrow
      ctx.strokeStyle = isActive ? c.color : c.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(condX + condW + 2, c.y + 11); ctx.lineTo(arrowX + 22, c.y + 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(arrowX + 22, c.y + 11); ctx.lineTo(arrowX + 17, c.y + 7); ctx.lineTo(arrowX + 17, c.y + 15); ctx.closePath();
      ctx.fillStyle = isActive ? c.color : c.color + '55'; ctx.fill();

      // Result box
      ctx.fillStyle = c.color + (isActive ? '30' : '15');
      ctx.fillRect(resX, c.y, resW, 22);
      ctx.strokeStyle = isActive ? c.color : c.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(resX, c.y, resW, 22);

      ctx.fillStyle = isActive ? '#ffffff' : c.color;
      ctx.font = isActive ? 'bold 9px system-ui' : 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(c.result, resX + resW / 2, c.y + 14);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Evaluated top-to-bottom. First match wins. Transition has priority.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 7: Hysteresis — raw vs confirmed regime
// ============================================================
function HysteresisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Hysteresis — 3-Bar Persistence Prevents Flicker', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const chartW = padR - padL;
    const pts = 60;

    // Simulated regime-raw: flickers heavily
    const rawRegimes: number[] = [];
    for (let i = 0; i < pts; i++) {
      const phase = Math.floor((i + t * 5) / 3) % 4;
      const flicker = Math.sin(i + t * 3) > 0.3 ? phase : (phase + 1) % 4;
      rawRegimes.push(flicker);
    }

    // Confirmed: needs 3 in a row
    const confirmedRegimes: number[] = [0];
    let runCount = 0;
    let lastRaw = rawRegimes[0];
    for (let i = 1; i < pts; i++) {
      if (rawRegimes[i] === lastRaw) runCount++;
      else { runCount = 1; lastRaw = rawRegimes[i]; }
      if (runCount >= 3) confirmedRegimes.push(lastRaw);
      else confirmedRegimes.push(confirmedRegimes[i - 1]);
    }

    const regimeColors = ['#5F6B7A', '#2FA4A9', '#3A8F6B', '#C28B2C'];

    // Row 1: raw
    const rowY1 = 38;
    const rowH = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('RAW', padL - 5, rowY1 + 13);

    for (let i = 0; i < pts - 1; i++) {
      const x1 = padL + (i / pts) * chartW;
      const x2 = padL + ((i + 1) / pts) * chartW;
      ctx.fillStyle = regimeColors[rawRegimes[i]];
      ctx.fillRect(x1, rowY1, x2 - x1, rowH);
    }

    // Row 2: confirmed
    const rowY2 = rowY1 + rowH + 14;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('CONFIRMED', padL - 5, rowY2 + 13);

    for (let i = 0; i < pts - 1; i++) {
      const x1 = padL + (i / pts) * chartW;
      const x2 = padL + ((i + 1) / pts) * chartW;
      ctx.fillStyle = regimeColors[confirmedRegimes[i]];
      ctx.fillRect(x1, rowY2, x2 - x1, rowH);
    }

    // Change markers (like DIST → TREND)
    const labelsY = rowY2 + rowH + 20;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Change markers (hysteresis-confirmed only):', w / 2, labelsY);

    const labels = [
      { x: 0.22, text: 'COMP → EXP' },
      { x: 0.5, text: 'EXP → TREND' },
      { x: 0.78, text: 'TREND → DIST' },
    ];
    labels.forEach(l => {
      const lx = padL + l.x * chartW;
      ctx.fillStyle = 'rgba(154,163,173,0.8)';
      ctx.font = 'bold 7px system-ui';
      const textW = l.text.length * 5 + 6;
      ctx.fillRect(lx - textW / 2, labelsY + 6, textW, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(l.text, lx, labelsY + 15);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Hysteresis filters noise. Only stable transitions emit change markers.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 8: The Pressure Envelope — the main visual
// ============================================================
function PressureEnvelopeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 26;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pressure Envelope — The MSI Visual Signature', w / 2, 14);

    // Generate price
    const pts = 80;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(t + i * 0.1) * 6 + Math.sin(t * 0.4 + i * 0.25) * 3);
    }

    // Fake ATR and drive/opposition sequences
    const atr: number[] = prices.map((_, i) => 0.6 + Math.sin(i * 0.1) * 0.15);
    const drive: number[] = [];
    const opposition: number[] = [];
    for (let i = 0; i < pts; i++) {
      drive.push(55 + Math.sin(t + i * 0.06) * 25);
      opposition.push(40 + Math.sin(t * 0.7 + i * 0.09) * 25);
    }

    const pMin = Math.min(...prices) - 1.5;
    const pMax = Math.max(...prices) + 1.5;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Envelope — per-bar thickness based on drive
    // Build high/low with wicks
    const hi: number[] = prices.map((p, i) => p + atr[i] * 0.4);
    const lo: number[] = prices.map((p, i) => p - atr[i] * 0.4);

    // Envelope thickness per bar
    const envHi: number[] = hi.map((h, i) => h + atr[i] * (0.2 + drive[i] / 100 * 0.5));
    const envLo: number[] = lo.map((l, i) => l - atr[i] * (0.2 + drive[i] / 100 * 0.5));

    // Upper envelope fill
    for (let i = 0; i < pts - 1; i++) {
      const x1 = padL + i * xStep;
      const x2 = padL + (i + 1) * xStep;
      // Color per bar — amber ochre when opp > drive
      const color = drive[i] > opposition[i] ? 'rgba(154,163,173,' : 'rgba(194,139,44,';
      const oppForOpacity = opposition[i];
      const alpha = Math.max(70, Math.min(95, 90 - oppForOpacity * 0.35)) / 100;
      ctx.fillStyle = color + (1 - alpha) + ')';
      ctx.beginPath();
      ctx.moveTo(x1, toY(envHi[i]));
      ctx.lineTo(x2, toY(envHi[i + 1]));
      ctx.lineTo(x2, toY(hi[i + 1]));
      ctx.lineTo(x1, toY(hi[i]));
      ctx.closePath(); ctx.fill();

      // Lower fill
      ctx.beginPath();
      ctx.moveTo(x1, toY(lo[i]));
      ctx.lineTo(x2, toY(lo[i + 1]));
      ctx.lineTo(x2, toY(envLo[i + 1]));
      ctx.lineTo(x1, toY(envLo[i]));
      ctx.closePath(); ctx.fill();
    }

    // Candles — simple bar rendering
    for (let i = 0; i < pts; i++) {
      const x = padL + i * xStep;
      const bodyPrev = i > 0 ? prices[i - 1] : prices[i];
      const isUp = prices[i] >= bodyPrev;
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, toY(hi[i])); ctx.lineTo(x, toY(lo[i])); ctx.stroke();
      ctx.fillStyle = isUp ? 'rgba(38,166,154,0.9)' : 'rgba(239,83,80,0.9)';
      const bodyH = Math.max(1, Math.abs(toY(prices[i]) - toY(bodyPrev)));
      ctx.fillRect(x - 2, Math.min(toY(prices[i]), toY(bodyPrev)), 4, bodyH);
    }

    // Legend
    ctx.fillStyle = 'rgba(154,163,173,0.9)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('■ grey = Drive > Opposition', padL, chartT + 8);
    ctx.fillStyle = 'rgba(194,139,44,0.9)';
    ctx.fillText('■ amber = Opposition > Drive', padL + 135, chartT + 8);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Thickness = drive magnitude', padR, chartT + 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Thickness ∝ Drive', padR, chartT + 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: Time-to-Decision Meter
// ============================================================
function TDMAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.025;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Time-to-Decision Meter (TDM) — Pressure Gauge', w / 2, 14);

    // TDM follows a sawtooth: builds during compression, drains at expansion
    const cycle = (t * 0.5) % 1;
    let tdm = 0;
    let phase = '';
    let phaseColor = '#5F6B7A';
    if (cycle < 0.55) {
      // Filling
      tdm = (cycle / 0.55) * 100;
      phase = 'COMPRESSION — PRESSURE BUILDING';
      phaseColor = '#5F6B7A';
    } else if (cycle < 0.7) {
      // Expansion drain
      tdm = 100 - ((cycle - 0.55) / 0.15) * 100;
      phase = 'EXPANSION — RELEASING';
      phaseColor = '#2FA4A9';
    } else {
      tdm = 0;
      phase = 'RESET — WAITING';
      phaseColor = '#9AA3AD';
    }

    // Big TDM bar
    const barX = 30;
    const barY = 50;
    const barW = w - 60;
    const barH = 40;

    // Track
    ctx.fillStyle = 'rgba(30,34,40,0.6)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(barX, barY, barW, barH);

    // 12 cells (matching Pine 12-cell layout)
    const cells = 12;
    const cellW = barW / cells;
    const filledCells = Math.floor(tdm / 100 * cells);

    for (let i = 0; i < cells; i++) {
      const cx = barX + i * cellW;
      if (i < filledCells) {
        // Filled
        ctx.fillStyle = 'rgba(38,166,154,0.6)';
        ctx.fillRect(cx + 1, barY + 2, cellW - 2, barH - 4);
        // Glow at leading edge
        if (i === filledCells - 1) {
          const pulse = 0.5 + Math.sin(t * 20) * 0.3;
          ctx.fillStyle = `rgba(38,166,154,${pulse})`;
          ctx.fillRect(cx + 1, barY + 2, cellW - 2, barH - 4);
        }
      } else {
        ctx.fillStyle = 'rgba(30,34,40,0.3)';
        ctx.fillRect(cx + 1, barY + 2, cellW - 2, barH - 4);
      }
      // Cell divider
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.moveTo(cx, barY); ctx.lineTo(cx, barY + barH); ctx.stroke();
    }

    // Value
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(tdm.toFixed(0), w / 2, barY + barH / 2 + 7);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '8px system-ui';
    ctx.fillText('TDM', w / 2 + 18, barY + barH / 2 + 7);

    // Phase label
    ctx.fillStyle = phaseColor;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(phase, w / 2, barY + barH + 18);

    // Mechanics bottom
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Fill rate: Compression+High Stab = +2.0/bar · Drain rate: Expansion = -4.0/bar', w / 2, h - 20);
    ctx.fillText('TDM at 100 = maximum stored energy. Expansion to follow.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 10: Execution Gates
// ============================================================
function ExecutionGatesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Execution Gates — The Permission Layer', w / 2, 14);

    // Cycle through regimes
    const regimes = [
      { name: 'COMPRESSION', color: '#5F6B7A', longOK: false, shortOK: false, reason: 'Gate blocked: Compression regime' },
      { name: 'EXPANSION', color: '#2FA4A9', longOK: true, shortOK: false, reason: 'Long permitted (bias up)' },
      { name: 'TREND', color: '#3A8F6B', longOK: true, shortOK: false, reason: 'Long permitted (bias up)' },
      { name: 'DISTRIBUTION', color: '#C28B2C', longOK: false, shortOK: false, reason: 'Gate blocked: Distribution regime' },
      { name: 'TRANSITION', color: '#7B6E9D', longOK: false, shortOK: false, reason: 'Gate blocked: Transition regime' },
    ];

    const active = regimes[Math.floor(t * 0.5) % 5];

    // Top: current regime banner
    const bannerY = 32;
    const bannerH = 34;
    ctx.fillStyle = active.color + '30';
    ctx.fillRect(20, bannerY, w - 40, bannerH);
    ctx.strokeStyle = active.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, bannerY, w - 40, bannerH);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT REGIME', 30, bannerY + 13);
    ctx.fillStyle = active.color;
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(active.name, 30, bannerY + 28);

    // Gate statuses
    const gateY = bannerY + bannerH + 16;
    const gateW = (w - 50) / 2;

    // LONG gate
    const longColor = active.longOK ? '#4A7C59' : '#4A4A4A';
    ctx.fillStyle = longColor + (active.longOK ? '35' : '15');
    ctx.fillRect(20, gateY, gateW, 48);
    ctx.strokeStyle = longColor;
    ctx.lineWidth = active.longOK ? 1.5 : 1;
    ctx.strokeRect(20, gateY, gateW, 48);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('LONG GATE', 30, gateY + 14);
    ctx.fillStyle = longColor;
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(active.longOK ? 'OK' : '—', 30, gateY + 34);
    if (active.longOK) {
      const pulse = 0.4 + Math.sin(t * 6) * 0.25;
      ctx.fillStyle = `rgba(74,124,89,${pulse})`;
      ctx.beginPath(); ctx.arc(gateW - 10 + 20, gateY + 24, 6, 0, Math.PI * 2); ctx.fill();
    }

    // SHORT gate
    const shortColor = active.shortOK ? '#8B5A5A' : '#4A4A4A';
    const shortX = 30 + gateW;
    ctx.fillStyle = shortColor + (active.shortOK ? '35' : '15');
    ctx.fillRect(shortX, gateY, gateW, 48);
    ctx.strokeStyle = shortColor;
    ctx.strokeRect(shortX, gateY, gateW, 48);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('SHORT GATE', shortX + 10, gateY + 14);
    ctx.fillStyle = shortColor;
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(active.shortOK ? 'OK' : '—', shortX + 10, gateY + 34);

    // Reason line
    const reasonY = gateY + 48 + 12;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RATIONALE:', 20, reasonY);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '8px system-ui';
    ctx.fillText(active.reason, 80, reasonY);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Gates require: Trend/Expansion regime + Drive > Opp + Stab > 35 + aligned bias', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 11: Structural Memory — stains decaying
// ============================================================
function StructuralMemoryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 14;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Structural Memory — Where Regimes Failed', w / 2, 14);

    // Generate price
    const pts = 100;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(t + i * 0.08) * 8 + Math.sin(t * 0.5 + i * 0.2) * 4);
    }

    const pMin = Math.min(...prices) - 2;
    const pMax = Math.max(...prices) + 2;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Define some fixed memory stains — regime failures
    // Each stain has: start bar, end bar, price range, regime color, strength
    const cycleStart = Math.floor(t * 0.3) % 4;
    const stains = [
      { startBar: 15, endBar: 35, priceHi: 106, priceLo: 100, color: '#C28B2C', strengthDecay: 0.7 - cycleStart * 0.15 },
      { startBar: 45, endBar: 65, priceHi: 110, priceLo: 104, color: '#2FA4A9', strengthDecay: 0.85 - cycleStart * 0.15 },
      { startBar: 70, endBar: 88, priceHi: 102, priceLo: 95, color: '#3A8F6B', strengthDecay: Math.max(0.3, 1.0 - cycleStart * 0.15) },
    ];

    stains.forEach(s => {
      if (s.strengthDecay <= 0.05) return;
      const x1 = padL + s.startBar * xStep;
      const x2 = padL + s.endBar * xStep;
      const y1 = toY(s.priceHi);
      const y2 = toY(s.priceLo);
      // Alpha scales with strength
      const alpha = 0.05 + s.strengthDecay * 0.20;
      ctx.fillStyle = s.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    });

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Labels for stains — pulse active one
    const activeStain = Math.floor(t * 0.3) % stains.length;
    stains.forEach((s, i) => {
      if (s.strengthDecay <= 0.1) return;
      const lx = padL + ((s.startBar + s.endBar) / 2) * xStep;
      const ly = toY(s.priceHi) - 5;
      ctx.fillStyle = i === activeStain ? s.color : s.color + '88';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      const regimeNames = { '#C28B2C': 'DIST fail', '#2FA4A9': 'EXP fail', '#3A8F6B': 'TREND fail' };
      ctx.fillText(regimeNames[s.color as keyof typeof regimeNames] || '', lx, ly);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stains fixed-width (60 bars on Swing). Strength decays at 0.002/bar. Max 8 active imprints.', w / 2, h - 2);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 12: MSI HUD — the full dashboard
// ============================================================
function MSIHUDAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MSI Unified Dashboard — HUD · Legend · TDM · Ribbon', w / 2, 14);

    // Simulated values
    const drive = 62 + Math.sin(t) * 3;
    const opposition = 42 + Math.sin(t * 0.8) * 3;
    const stability = 71 + Math.sin(t * 1.2) * 3;
    const tdm = 55 + Math.sin(t * 0.5) * 15;
    const regime = 'TREND';
    const regimeColor = '#3A8F6B';

    // Main panel
    const panelX = (w - 360) / 2;
    const panelY = 36;
    const panelW = 360;

    // Row: Regime name + chip
    let ry = panelY;
    ctx.fillStyle = 'rgba(17,20,24,0.75)';
    ctx.fillRect(panelX, ry, panelW, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(regime, panelX + 10, ry + 18);
    // chip
    ctx.fillStyle = regimeColor;
    ctx.fillRect(panelX + 70, ry + 7, 12, 12);

    // Row: LONG
    ry += 26;
    ctx.fillStyle = 'rgba(17,20,24,0.65)';
    ctx.fillRect(panelX, ry, panelW, 20);
    ctx.fillStyle = '#4A7C59';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('LONG • OK', panelX + 10, ry + 13);

    // Row: SHORT
    ry += 20;
    ctx.fillStyle = 'rgba(17,20,24,0.65)';
    ctx.fillRect(panelX, ry, panelW, 20);
    ctx.fillStyle = '#4A4A4A';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('SHORT • —', panelX + 10, ry + 13);

    // Row: definition
    ry += 20;
    ctx.fillStyle = 'rgba(17,20,24,0.55)';
    ctx.fillRect(panelX, ry, panelW, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '8px system-ui';
    ctx.fillText('Sustained drive, high stability — aligned continuation', panelX + 10, ry + 12);

    // Row: D/O/S values
    ry += 18;
    ctx.fillStyle = 'rgba(17,20,24,0.55)';
    ctx.fillRect(panelX, ry, panelW, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText(`D:${drive.toFixed(0)}  |  O:${opposition.toFixed(0)}  |  S:${stability.toFixed(0)}`, panelX + 10, ry + 12);

    // Row: TDM bar (12 cells)
    ry += 18;
    const tdmCells = 12;
    const tdmCellW = panelW / tdmCells;
    const tdmFilled = Math.floor(tdm / 100 * tdmCells);
    for (let i = 0; i < tdmCells; i++) {
      const cx = panelX + i * tdmCellW;
      if (i < tdmFilled) {
        ctx.fillStyle = 'rgba(38,166,154,0.6)';
        ctx.fillRect(cx + 1, ry + 1, tdmCellW - 2, 10);
      } else {
        ctx.fillStyle = 'rgba(30,34,40,0.5)';
        ctx.fillRect(cx + 1, ry + 1, tdmCellW - 2, 10);
      }
    }

    // Row: regime ribbon (12 cells, all current regime color)
    ry += 12;
    for (let i = 0; i < tdmCells; i++) {
      const cx = panelX + i * tdmCellW;
      ctx.fillStyle = regimeColor + '50';
      ctx.fillRect(cx + 1, ry + 1, tdmCellW - 2, 10);
    }

    // Labels under panel
    ry += 20;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Regime · Gates · Definition · D/O/S · TDM gauge · Ribbon', w / 2, ry + 5);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION: Three-Force Decomposition (★ GROUNDBREAKING)
// Every retail regime indicator uses 1 axis. MSI uses 3 orthogonal forces.
// ============================================================
function ThreeForceDecompositionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 Three-Force Decomposition \u2605', w / 2, 14);

    // LEFT: Retail 1-axis view (linear spectrum)
    const mid = w / 2 - 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 26); ctx.lineTo(mid, h - 8); ctx.stroke();

    ctx.fillStyle = 'rgba(239,68,68,0.75)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RETAIL: 1-AXIS (TRENDING \u2194 RANGING)', mid / 2, 32);
    ctx.fillStyle = 'rgba(239,68,68,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('one dimension \u2014 collapses all nuance', mid / 2, 44);

    // Linear spectrum bar
    const barX = 20;
    const barY = 76;
    const barW = mid - 40;
    const barH = 18;

    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.5, '#8A8A8A');
    grad.addColorStop(1, '#EF5350');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(barX, barY, barW, barH);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TRENDING', barX, barY - 3);
    ctx.textAlign = 'right';
    ctx.fillText('RANGING', barX + barW, barY - 3);

    // Animated needle
    const needle1 = barX + (0.4 + Math.sin(t) * 0.4) * barW;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(needle1, barY - 4); ctx.lineTo(needle1, barY + barH + 4); ctx.stroke();

    // Problem callout
    ctx.fillStyle = 'rgba(239,68,68,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2717 Can\u2019t distinguish:', mid / 2, barY + 42);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('\u2022 Trending UP vs DOWN (same axis)', mid / 2, barY + 55);
    ctx.fillText('\u2022 Range with absorption vs quiet drift', mid / 2, barY + 67);
    ctx.fillText('\u2022 Transition from what \u2192 to what', mid / 2, barY + 79);

    // RIGHT: MSI 3-force radar
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MSI: 3 ORTHOGONAL FORCES', mid + (w - mid) / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('Drive \u00b7 Opposition \u00b7 Stability', mid + (w - mid) / 2, 44);

    // Radar chart (triangle)
    const radarCx = mid + (w - mid) / 2;
    const radarCy = h / 2 + 18;
    const radarR = 54;

    // Three axes at 90°, 210°, 330°
    const axes = [
      { angle: -Math.PI / 2, label: 'DRIVE', color: '#22c55e', val: 0.5 + Math.sin(t) * 0.3 },
      { angle: Math.PI / 6, label: 'OPP', color: '#EF5350', val: 0.4 + Math.sin(t * 1.3 + 1) * 0.3 },
      { angle: Math.PI * 5 / 6, label: 'STAB', color: '#0ea5e9', val: 0.55 + Math.sin(t * 0.8 + 2) * 0.25 },
    ];

    // Background rings
    [0.33, 0.66, 1].forEach(r => {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      axes.forEach((ax, i) => {
        const x = radarCx + Math.cos(ax.angle) * radarR * r;
        const y = radarCy + Math.sin(ax.angle) * radarR * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.stroke();
    });

    // Axis lines
    axes.forEach(ax => {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(radarCx, radarCy);
      ctx.lineTo(radarCx + Math.cos(ax.angle) * radarR, radarCy + Math.sin(ax.angle) * radarR);
      ctx.stroke();
    });

    // Data polygon
    ctx.fillStyle = 'rgba(245,158,11,0.22)';
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    axes.forEach((ax, i) => {
      const x = radarCx + Math.cos(ax.angle) * radarR * ax.val;
      const y = radarCy + Math.sin(ax.angle) * radarR * ax.val;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dots + labels
    axes.forEach(ax => {
      const dx = radarCx + Math.cos(ax.angle) * radarR * ax.val;
      const dy = radarCy + Math.sin(ax.angle) * radarR * ax.val;
      ctx.fillStyle = ax.color;
      ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();

      const lx = radarCx + Math.cos(ax.angle) * (radarR + 12);
      const ly = radarCy + Math.sin(ax.angle) * (radarR + 12);
      ctx.fillStyle = ax.color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ax.label, lx, ly + 2);
    });

    // 3-force advantage callout
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2713 Distinguishes all 5 regimes cleanly', radarCx, h - 22);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('COMP \u00b7 EXP \u00b7 TREND \u00b7 DIST \u00b7 TRANS', radarCx, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MSI interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'Your MSI HUD shows: Regime = DISTRIBUTION, D:58 | O:71 | S:48, LONG • — , SHORT • —. You see a strong bullish candle close. What is the correct response?',
    options: [
      { text: 'Enter long &mdash; the candle is bullish and price is moving', correct: false, explain: 'Distribution regime means effort is being absorbed: Drive is moderate but Opposition is significantly higher (71 vs 58). The absorption pattern (wicks + volume without progress + reversals) tells you institutional traders are fading the moves. Both execution gates are OFF for this exact reason. A single bullish candle inside a distribution regime has a high probability of being trapped. Wait for regime exit.' },
      { text: 'Distribution means effort is being absorbed &mdash; a single bullish candle inside this regime does not change the picture. Both gates are OFF as designed. Wait for the regime to transition to Expansion or Trend before considering entries.', correct: true, explain: 'Exactly right. MSI gates off during Distribution precisely because the absorption pattern has a statistical edge in FADING strong moves. The discipline to wait for regime confirmation is the whole point of the diagnostic framework. Overriding the gate because you see a bullish candle is exactly what MSI was built to protect you from.' },
    ],
  },
  {
    scenario: 'MSI shows Regime = TRANSITION after an unusually fast rise in opposition. The change marker &ldquo;TREND → TRANS&rdquo; just appeared. How should you interpret this?',
    options: [
      { text: 'A regime shift is underway. Opposition has risen faster than 15 points over the preset ROC window AND stability has dropped below 40. The previous trend is breaking. No trades until the new regime settles &mdash; it could consolidate into Distribution, collapse into Compression, or reverse into an opposite Expansion.', correct: true, explain: 'Correct. Transition is MSI&apos;s explicit &ldquo;the floor is moving&rdquo; state. Its trigger conditions are specific: rapid opposition rise (oppROC > 15) PLUS low stability. The response is not to predict what comes next &mdash; it is to step aside until the new regime confirms via the 3-bar hysteresis. That discipline is what keeps you out of chop.' },
      { text: 'Short it &mdash; Transition always goes the other way', correct: false, explain: 'Transition does NOT have a directional bias. It only tells you that a regime shift is underway. Sometimes Transition resolves into Distribution (chop), sometimes Compression (pressure building again), sometimes into the opposite-direction Expansion. Treating Transition as directional is inventing signal where MSI deliberately offers none.' },
    ],
  },
  {
    scenario: 'You see MSI showing Regime = COMPRESSION with TDM at 85. What is this combination telling you?',
    options: [
      { text: 'Nothing &mdash; compression is dead time', correct: false, explain: 'Compression is NOT dead time. It is pressure-BUILDING time. TDM at 85 specifically means the pressure gauge is near-full: sustained low-drive, low-opposition, high-stability conditions have stored significant energy. Historically, high-TDM compressions resolve to expansions with above-average magnitude. You are not in dead time &mdash; you are in a coiled spring.' },
      { text: 'Pressure has been building for a while (TDM high from compression fill rate). When the compression resolves, it is more likely to resolve into a strong Expansion than an ambiguous move. Prepare for potential breakout direction &mdash; but do not pre-position; wait for regime transition to confirm.', correct: true, explain: 'Correct. TDM is explicitly a pressure gauge: it fills at 2.0/bar during Compression+High-Stability, drains at 4.0/bar during Expansion. A high TDM reading inside Compression = stored energy. The professional play is: preparation, not pre-positioning. Get the setup ready (levels marked, alerts set) and wait for the regime engine to flip to Expansion before executing.' },
    ],
  },
  {
    scenario: 'Your chart shows a green-stained background area where price traded two weeks ago. Price is now revisiting that zone. What is MSI telling you about this historically?',
    options: [
      { text: 'That is a previous MSI regime failure imprint &mdash; specifically a TREND that broke down into either TRANSITION or DISTRIBUTION. Price revisiting this zone is statistically more prone to REPEATING that failure pattern because the institutional flow that rejected continuation last time may still be active. Treat the zone as structural memory, not a mechanical signal.', correct: true, explain: 'Exactly. The Structural Memory engine specifically records 5 regime failure types and draws faint stains at the price zones where they happened. The decay rate ensures only recent-enough failures remain visible. When price re-enters a stained zone, you are in an area where the market previously demonstrated inability to maintain the direction. It is historical context, not a trade trigger.' },
      { text: 'Ignore it &mdash; the stain is decorative background', correct: false, explain: 'The stains are NOT decorative. They mark specific prior regime failures (EXP→DIST, EXP→COMP, EXP→TRANS, TREND→TRANS, TREND→DIST). Ignoring them throws away one of the most valuable asymmetric edges MSI provides &mdash; knowing where institutional flow has previously rejected continuation.' },
    ],
  },
  {
    scenario: 'You switch from Swing preset to Scalper preset on a 1-minute chart. What just changed in MSI?',
    options: [
      { text: 'Everything got colorful', correct: false, explain: 'The colors do not change by preset &mdash; colors are locked in the UIVS palette. What changes are numerical scalars: Sensitivity goes up from 1.0 to 1.3, Smoothing drops from 1.0 to 0.7, Memory Decay goes up from 1.0 to 1.5, Opp-ROC window drops from 3 to 2, memory stain window drops from 60 to 30 bars. The indicator becomes faster, more reactive, shorter-memory &mdash; appropriate for scalping horizons.' },
      { text: 'The indicator became more responsive: higher sensitivity, less smoothing, faster memory decay, shorter opp-ROC window, shorter stain window. This matches scalping horizons where you need faster regime detection but accept more transitions. Switching to Scalper on a daily chart would produce garbage &mdash; too many false regime flips.', correct: true, explain: 'Correct. Presets are not cosmetic &mdash; they adjust the core calculation speed to match timeframe. Scalper: fast/reactive. Swing: balanced default. Position: slow/stable. Use Scalper on 1m-15m, Swing on 30m-4H, Position on Daily+. Mismatching preset to timeframe produces either whiplash (Scalper on HTF) or lag (Position on LTF).' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market State Intelligence (MSI) is built on three fundamental forces:', opts: ['Price, volume, time', 'Drive (directional effort), Opposition (absorption), Stability (persistence) &mdash; each bounded 0-100', 'Support, resistance, trend', 'RSI, MACD, ATR'], correct: 1, explain: 'Drive measures directional effort (net progress + range quality + body dominance). Opposition measures absorption (wicks + effort gap + reversals). Stability measures persistence (stable D/O + low variance + consistent direction).' },
  { q: 'MSI classifies the market into how many distinct regimes?', opts: ['3', '5 — Compression, Expansion, Trend, Distribution, Transition', '7', '10'], correct: 1, explain: '5 regimes, each with a specific signature: COMPRESSION (low D, low O, high S — pressure building), EXPANSION (high D, low O — release), TREND (sustained D, high S — continuation), DISTRIBUTION (med D, high O — absorption), TRANSITION (rising O, low S — regime shift).' },
  { q: 'The hysteresis mechanism in MSI exists to:', opts: ['Make the indicator look smoother', 'Prevent regime flicker by requiring 3 bars of raw persistence before the confirmed regime updates &mdash; except for decisive Transition, which can fire immediately', 'Speed up regime detection', 'Hide errors'], correct: 1, explain: 'Raw regime can flip bar-to-bar as values cross thresholds. Hysteresis requires 3× smoothing-adjusted bars of the same raw regime before updating the confirmed regime. This produces stable, actionable regime classifications. Decisive Transition (fast opp rise + low stability) bypasses this.' },
  { q: 'The Time-to-Decision Meter (TDM) works by:', opts: ['Counting seconds until next candle', 'Filling during Compression+High-Stability at rate 2.0/bar, draining during Expansion at rate 4.0/bar &mdash; creating a pressure gauge that foreshadows regime releases', 'Measuring signal strength', 'Calculating position size'], correct: 1, explain: 'TDM acts as a literal pressure gauge. During Compression with high stability, it fills at 2.0 per bar. During Expansion, it drains at 4.0 per bar. High TDM during a stable Compression regime = stored energy awaiting release.' },
  { q: 'MSI Execution Gates are OFF during which regimes?', opts: ['Only during Compression', 'During Compression, Distribution, AND Transition &mdash; gates are only considered during Expansion or Trend with aligned drive, opposition, stability, and bias', 'Always on', 'During Trend only'], correct: 1, explain: 'Long/Short gates require: regime is Expansion OR Trend, AND Drive > Opposition, AND Stability > 35, AND price-based bias aligns. All other states force both gates OFF by design &mdash; MSI actively prevents trading in adverse regimes.' },
  { q: 'The pressure envelope rendered around price changes color when:', opts: ['Price crosses an EMA', 'Opposition exceeds Drive &mdash; envelope switches from cool grey (colorEnvelopeBase) to amber ochre (colorDistribution)', 'RSI goes overbought', 'Volume spikes'], correct: 1, explain: 'When drive > opposition, envelope renders in cool grey (neutral effort direction). When opposition > drive, envelope switches to amber ochre &mdash; a visual warning that absorption exceeds directional effort.' },
  { q: 'Structural Memory stains appear when:', opts: ['Price hits an indicator level', 'Specific regime failures occur (EXP→DIST, EXP→COMP, EXP→TRANS, TREND→TRANS, TREND→DIST) &mdash; a faint colored box marks the price zone where continuation rejected', 'Volume confirms', 'Every bar'], correct: 1, explain: 'MSI records 5 specific regime failures as stains. They decay at 0.002×effDecay per bar. Max 8 active imprints. Stain width is fixed to memoryStainWindow (60 bars on Swing preset). Their purpose is to flag zones of prior institutional rejection.' },
  { q: 'The MSI Presets (Scalper / Swing / Position) primarily adjust:', opts: ['The color palette', 'Sensitivity, smoothing, memory decay, and opp-ROC window length &mdash; Scalper is fast and reactive (1m-15m charts), Position is slow and stable (Daily+)', 'The timezone', 'Which indicator to calculate'], correct: 1, explain: 'Scalper: sens 1.3, smooth 0.7, decay 1.5, ROC len 2 (fast). Swing: all 1.0, ROC len 3 (balanced default). Position: sens 0.7, smooth 1.4, decay 0.6, ROC len 5 (slow/stable). Match the preset to your timeframe or the indicator will either whipsaw (HTF on Scalper) or lag badly (LTF on Position).' },
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
export default function MSIDeepDiveLesson() {
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
    { wrong: 'Overriding the execution gate because you &ldquo;see a setup&rdquo;', right: 'Gates off during Distribution, Compression, and Transition is a statistical feature, not a bug. The regimes where gates are off are the regimes with the lowest historical execution edge. Overriding them because a candle looks bullish converts the indicator into decoration.', icon: '🚪' },
    { wrong: 'Treating Transition as a directional signal', right: 'Transition only says &ldquo;the floor is moving.&rdquo; It has NO directional bias. It can resolve into Distribution (chop), Compression (pressure re-building), or an opposite Expansion. Acting on direction during Transition is inventing signal where MSI deliberately offers none.', icon: '🌀' },
    { wrong: 'Using Scalper preset on a Daily chart (or Position preset on 1m)', right: 'Presets are calibration, not cosmetic. Scalper on Daily = regime whipsaws every few bars (too sensitive). Position on 1m = indicator stays in one regime for hours (too sluggish). Match preset to timeframe: Scalper ≤15m · Swing 30m-4H · Position Daily+.', icon: '⚙️' },
    { wrong: 'Ignoring the Structural Memory stains', right: 'Stains are not decoration. They mark specific prior regime failure zones where institutional flow previously rejected continuation. Price revisiting a stained zone has a statistical tendency to repeat the failure pattern. Dismissing them throws away one of MSI&apos;s most asymmetric edges.', icon: '🟢' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 4</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market State<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Intelligence</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Drive. Opposition. Stability. Five regimes. Execution gates that know when to stand aside. Structural memory that remembers where the market failed. MSI is a market-state engine, not a signal generator.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Regime Blindness &mdash; The Silent Killer of Systems</p>
            <p className="text-gray-400 leading-relaxed mb-4">A strategy that wins 70% of the time in Trending regimes loses 55% of the time in Ranging regimes. A breakout system that&apos;s brilliant during Expansion becomes a meat grinder during Distribution. <strong className="text-amber-400">Every losing trading system you&apos;ve ever run was probably a right strategy deployed in the wrong regime.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Retail traders stare at candles. Institutional traders stare at state. MSI is the tool that moves you from the first column to the second. It doesn&apos;t tell you what to do &mdash; it tells you <strong className="text-white">what the market IS</strong>. Everything else flows from that: which strategy is appropriate, whether your system&apos;s edge applies, whether to stand aside entirely.</p>
            <p className="text-gray-400 leading-relaxed">The mechanic: three force meters (Drive, Opposition, Stability) feed a regime classifier that outputs one of five states. A hysteresis layer prevents flicker. An execution gate blocks directional trades during unfavourable regimes. A structural memory layer remembers where prior regimes failed. A time-to-decision meter measures stored pressure. All diagnostic. All transparent. No signals.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE MSI AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Before asking &ldquo;should I trade this?&rdquo;, ask &ldquo;what state is the market in?&rdquo;. That one re-ordering eliminates most losing setups. MSI is the tool that makes that re-ordering habitual rather than occasional.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Three Forces === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Forces</p>
          <h2 className="text-2xl font-extrabold mb-4">Drive × Opposition × Stability</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every MSI regime classification is downstream of three numbers: <strong className="text-green-400">Drive (directional effort)</strong>, <strong className="text-amber-400">Opposition (absorption pressure)</strong>, and <strong className="text-teal-400">Stability (structural persistence)</strong>. Each is normalised 0-100. Together they define a three-dimensional state space. The classifier reads your position in that space and names the regime.</p>
          <ThreeForcesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Three Forces, Not One</p>
            <p className="text-sm text-gray-400">A single &ldquo;strength&rdquo; number can&apos;t distinguish a coiled spring (low Drive, low Opposition, high Stability = Compression) from absorption (medium Drive, high Opposition = Distribution). These are completely different regimes demanding completely different responses. MSI&apos;s three-force architecture is the minimum dimensional resolution required to separate them.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Drive Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Drive Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">Net Progress × Range Quality × Body Dominance</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Drive is the composite of <strong className="text-white">three sub-measurements</strong>: <em>Net Progress</em> (how much displacement actually stuck vs total path traveled), <em>Range Quality</em> (actual range vs expected range for current volatility), and <em>Body Dominance</em> (candle body as fraction of range). Weighted 45/30/25. The result: a drive score that knows the difference between a real trend move and a noisy drift.</p>
          <DriveAnatomyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why This Specific Composition</p>
            <p className="text-sm text-gray-400">Net Progress is weighted highest because it filters out noisy back-and-forth; a 50-pip move that oscillated within 10-pip swings has low net progress. Range Quality penalises chop that expands the range without direction. Body Dominance rewards strong-bodied candles that carry conviction. The weights 45/30/25 emerged from empirical testing &mdash; they are not arbitrary.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Opposition Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Opposition Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">Wicks · Effort-Gap · Reversal Density</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Opposition is composed of three absorption signatures: <strong className="text-white">Wick Pressure</strong> (total wick length as fraction of bar range), <strong className="text-white">Effort-Result Gap</strong> (volume intensity minus price progress, capped 0-2), and <strong className="text-white">Reversal Density</strong> (count of direction flips in the recent window). Weighted 35/40/25. When opposition rises, institutional order flow is fading the moves that retail is chasing.</p>
          <OppositionAnatomyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Effort-Gap Insight</p>
            <p className="text-sm text-gray-400">Effort-Result Gap gets the highest weight (40%) in opposition because it captures the clearest absorption footprint: high volume producing tiny price progress. That pattern is nearly impossible to fake &mdash; it requires real order flow from larger participants absorbing retail attempts to push price. When this metric spikes, you are watching institutions build positions against the obvious direction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Stability Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Stability Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">Persistence · Variance · Reaction Consistency</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Stability answers: <em>is the current regime holding?</em> It combines <strong className="text-white">Persistence</strong> (Drive and Opposition changing less than 5 points bar-to-bar = stable), <strong className="text-white">Variance</strong> (few threshold-crossing flips in the medium window = low variance), and <strong className="text-white">Reaction Consistency</strong> (price direction following the previous direction = consistent). Weighted 30/35/35.</p>
          <StabilityAnatomyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Stability Is the Trade-Grade Filter</p>
            <p className="text-sm text-gray-400">The execution gates specifically require Stability &gt; 35. Why? Because even with strong Drive and low Opposition, if the market is flipping internally (low stability), the setup is not trade-grade. A TREND regime with Stability 72 is professionally executable. The same Drive/Opposition combination with Stability 28 is a trap waiting to happen. Stability is the filter that separates the real regimes from their look-alikes.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: The 5 Regimes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Five Regimes</p>
          <h2 className="text-2xl font-extrabold mb-4">Compression · Expansion · Trend · Distribution · Transition</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MSI outputs exactly five regime states. Each is a unique combination of the three forces. Each has its own color (locked in the UIVS palette), its own characteristic price behavior, and its own appropriate strategy response. Memorising these five is the single most valuable thing you can do for your trading intuition.</p>
          <RegimeMapAnim />
          <div className="mt-4 grid grid-cols-1 gap-2">
            {[
              { n: 'COMPRESSION', c: '#5F6B7A', d: 'Low drive, low opposition, high stability. Pressure is building. Expect breakout direction TBD.' },
              { n: 'EXPANSION', c: '#2FA4A9', d: 'High drive, low opposition. Directional energy released. Trade-friendly regime.' },
              { n: 'TREND', c: '#3A8F6B', d: 'Sustained drive, high stability. Aligned continuation. Ideal for trend-following.' },
              { n: 'DISTRIBUTION', c: '#C28B2C', d: 'Medium drive, high opposition. Effort being absorbed. Stand aside or fade with care.' },
              { n: 'TRANSITION', c: '#7B6E9D', d: 'Rising opposition, low stability. Regime shift underway. No trades until new regime confirms.' },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-xl flex items-start gap-3" style={{ background: r.c + '10', borderColor: r.c + '40', borderWidth: '1px' }}>
                <div className="w-2 h-full rounded" style={{ background: r.c, minHeight: '32px' }} />
                <div className="flex-1">
                  <p className="text-[11px] font-extrabold mb-0.5" style={{ color: r.c }}>{r.n}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S06: Classifier === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Classifier</p>
          <h2 className="text-2xl font-extrabold mb-4">The Decision Tree</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The MSI regime classifier is a priority-ordered cascade. Transition has highest priority (because regime shifts invalidate all other calls). Expansion comes next, then Trend, then Distribution, then Compression. First rule to match wins. The thresholds (Drive 35/55, Opp 35/55, Stab 40/60) are modulated by the Sensitivity scalar. Nothing about this is magic &mdash; it&apos;s a transparent decision tree you can read in 30 seconds.</p>
          <ClassifierLogicAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Thresholds Are Sensitivity-Modulated</p>
            <p className="text-sm text-gray-400">Higher Sensitivity (e.g. Scalper preset at 1.3) tightens the thresholds: driveLow becomes 27 instead of 35, driveHigh becomes 71 instead of 55. Lower Sensitivity (Position at 0.7) widens them: driveLow 50, driveHigh 38. This is how the same classifier produces appropriate regime detection across timeframes &mdash; the rules are stable, the thresholds adapt.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07: Hysteresis === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Hysteresis</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Raw ≠ Confirmed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Raw regime can flip bar-to-bar as values cross thresholds. That&apos;s noise, not signal. MSI applies a <strong className="text-amber-400">3-bar persistence requirement</strong> (adjusted by the Smoothing scalar) before the confirmed regime updates. Only the confirmed regime drives gates, change markers, and structural memory. One exception: decisive Transition (fast opp rise + low stability) can fire immediately because regime shifts require speed.</p>
          <HysteresisAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Regime Change Markers</p>
            <p className="text-sm text-gray-400">When the confirmed regime finally updates, MSI drops a small label on the chart showing the transition (e.g. <code className="text-white">TREND → DIST</code>). These labels are important: they are the moments when your strategy context changed. A change marker is not a signal, but it is a reliable MARK IN THE TIMELINE for when institutional behavior shifted.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08: Pressure Envelope === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Envelope</p>
          <h2 className="text-2xl font-extrabold mb-4">The Visual Signature</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The <strong className="text-white">pressure envelope</strong> is MSI&apos;s primary on-chart visual &mdash; a thin band above and below price whose <strong className="text-amber-400">thickness scales with Drive</strong> and whose <strong className="text-amber-400">color shifts when Opposition exceeds Drive</strong>. Cool grey when Drive dominates (normal state), amber ochre when Opposition dominates (warning state). Opacity also reacts to Opposition magnitude: more absorption = more visible envelope.</p>
          <PressureEnvelopeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What The Envelope Tells You</p>
            <p className="text-sm text-gray-400">Grey and thick: Drive is high, directional energy is strong. Grey and thin: Drive weak, low energy. Amber and thick: opposition is exceeding drive AND there&apos;s enough overall energy that the absorption matters &mdash; classic distribution signature. Amber and thin: absorption in a low-energy environment, often during compression drift. The envelope is designed so a single glance tells you both the magnitude AND the directional alignment of the forces.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: TDM === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Time-to-Decision Meter</p>
          <h2 className="text-2xl font-extrabold mb-4">The Pressure Gauge</h2>
          <p className="text-gray-400 leading-relaxed mb-6">TDM is a pure pressure accumulator. It <strong className="text-teal-400">fills at 2.0 per bar</strong> during Compression with high Stability. It <strong className="text-teal-400">drains at 4.0 per bar</strong> during Expansion. It sits dormant in neutral regimes. Think of it as the market&apos;s potential energy store: when it&apos;s near 100, a stable Compression has been building force for a long time &mdash; the subsequent Expansion tends to be above-average magnitude.</p>
          <TDMAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Preparation, Not Prediction</p>
            <p className="text-sm text-gray-400">High TDM does NOT tell you which direction the expansion will break. It tells you the magnitude is likely to be meaningful. The professional response to TDM = 85 inside Compression: mark key levels above and below, set alerts at both, prepare execution parameters, and WAIT for regime transition. Pre-positioning based on TDM is the failure mode &mdash; the meter tells you when to be ready, not which side to be on.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10: Execution Gates === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Execution Gates</p>
          <h2 className="text-2xl font-extrabold mb-4">The Permission Layer</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The <strong className="text-green-400">LONG</strong> and <strong className="text-red-400">SHORT</strong> gates are MSI&apos;s discipline layer. They permit directional trades only when ALL of the following are true: (1) regime is Expansion OR Trend; (2) Drive exceeds Opposition; (3) Stability exceeds 35; (4) price-based bias aligns with the direction. Compression, Distribution, and Transition force BOTH gates off &mdash; no exceptions.</p>
          <ExecutionGatesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Gate Rationale</p>
            <p className="text-sm text-gray-400">MSI shows the reason whenever a gate is blocked: &ldquo;Gate blocked: Distribution regime&rdquo; or &ldquo;Long permitted, Short blocked (bias up).&rdquo; This transparency matters: you don&apos;t just see OFF, you see WHY. The gates exist not to replace your judgment but to force a conscious override when you disagree. Most of the time, the right answer is: trust the gate, wait for green.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11: Structural Memory === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Structural Memory</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Regimes Failed Before</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MSI records <strong className="text-amber-400">five specific regime-failure types</strong>: EXP→DIST, EXP→COMP, EXP→TRANS, TREND→TRANS, TREND→DIST. Each failure is imprinted as a faint colored stain at the price zone where it happened. Stains decay at 0.002×effDecay per bar. Max 8 active imprints. When price revisits a stained zone, you&apos;re in an area of historical institutional rejection &mdash; valuable context for interpreting new regime attempts.</p>
          <StructuralMemoryAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Memory Decay Philosophy</p>
            <p className="text-sm text-gray-400">Decay is deliberate. A regime failure from 200 bars ago may reflect market conditions that no longer exist. The decay rate ensures only recent-enough failures remain visible. Position preset uses a slower decay (0.6x) because higher-timeframe memory persists longer. Scalper uses faster decay (1.5x) because intraday institutional flows shift quickly. The decay-per-preset design is another example of MSI adapting its assumptions to your timeframe.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12: HUD === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Unified Dashboard</p>
          <h2 className="text-2xl font-extrabold mb-4">HUD · Legend · TDM · Ribbon</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every piece of MSI&apos;s intelligence surfaces in one unified panel. <strong className="text-white">Regime name and color chip</strong> at top. <strong className="text-white">LONG/SHORT gate status</strong>. <strong className="text-white">Plain-English definition</strong> of current regime. <strong className="text-white">D/O/S values</strong>. <strong className="text-white">TDM pressure bar</strong> (12-cell gauge). <strong className="text-white">Regime ribbon</strong> (pure color strip reinforcing current state). Each row toggles independently. Start with HUD + Ribbon; add Legend and TDM as your MSI fluency grows.</p>
          <MSIHUDAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Minimal Setup</p>
            <p className="text-sm text-gray-400">For most traders: HUD (ON) + Ribbon (ON) + everything else OFF. This gives you regime name, gate status, and a color strip at the bottom of chart &mdash; readable in one glance without cognitive load. Enable TDM and Legend only when doing deeper analysis or backtesting. Enable Structural Memory when tracing regime history. Enable Halo during distribution-heavy sessions. MSI&apos;s toggles exist precisely so you can match visual density to task.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13: Three-Force Decomposition (★ GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Three-Force Decomposition &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Regime Analysis Has Always Been Stuck at One Axis</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Open any retail regime indicator and look closely at the output. ADX tells you &ldquo;trend strength&rdquo; on a single 0-100 scale. Choppiness Index tells you &ldquo;trending vs ranging&rdquo; on a single axis. Volatility indicators put you on a low-to-high spectrum. <strong className="text-white">Every mainstream regime classifier collapses market behavior onto one dimension.</strong> And that is why they all fail at the same thing: distinguishing a trend exhausting itself from a range getting compressed, or an absorption distribution from a low-volume drift. These are fundamentally different states &mdash; but on one axis they overlap.</p>
          <ThreeForceDecompositionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#129504; The Decomposition Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">MSI&apos;s innovation is that every market state can be reduced to <strong className="text-white">three orthogonal forces</strong>: <strong className="text-green-400">Drive</strong> (directional intent), <strong className="text-red-400">Opposition</strong> (resistance to that intent), and <strong className="text-blue-400">Stability</strong> (variance of those two over time). Any regime you can name is a specific configuration in this 3D space. Compression = low Drive, low Opposition, high Stability. Trend = high Drive, low Opposition, high Stability. Distribution = moderate Drive, high Opposition, low Stability. Expansion = high Drive, moderate Opposition, moderate Stability. Transition = mixed across all three. The classifier maps the live (D,O,S) coordinate to the nearest regime. <strong className="text-white">This is a paradigm shift in regime analysis</strong> &mdash; not a refinement of the old approach, a different approach entirely.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Why orthogonality matters specifically:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Orthogonal = independent.</strong> Drive can be high while Opposition is low (clean trend) OR while Opposition is also high (distribution). A single-axis indicator can&apos;t tell these apart. MSI shows both simultaneously &mdash; the HUD literally displays D:X | O:Y | S:Z so you can read the composition.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Each force maps to a measurable.</strong> Drive = smoothed return velocity + effort alignment. Opposition = wick ratios, rejection density, failed breakouts. Stability = rolling variance of the prior two. These aren&apos;t vibes &mdash; they&apos;re specific features the classifier extracts.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">The regime is the conclusion, not the primitive.</strong> Most indicators START with &ldquo;it&apos;s trending&rdquo; as input. MSI STARTS with D/O/S measurements and DERIVES the regime label. That&apos;s why its regime labels survive transitions cleanly &mdash; the underlying forces change continuously, and the label follows. This is how you get hysteresis and smooth regime persistence without flicker.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S14: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MSI</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every MSI support conversation ultimately traces to one root: the trader treating it like a signal generator. Here are the four most common variants of that mistake.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">MSI In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three Forces</p>
                <p className="text-sm text-gray-300">Drive (netProgress 45% + rangeQuality 30% + bodyDominance 25%). Opposition (wickPressure 35% + effortGap 40% + reversalDensity 25%). Stability (persistence 30% + variance 35% + reactionConsistency 35%).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Five Regimes</p>
                <p className="text-sm text-gray-300">COMPRESSION (low D, low O) · EXPANSION (high D, low O) · TREND (sustained D, high S) · DISTRIBUTION (med D, high O) · TRANSITION (rising O, low S).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Hysteresis</p>
                <p className="text-sm text-gray-300">Raw regime flips bar-to-bar. Confirmed regime requires 3×smoothing bars of persistence before updating. Decisive Transition can fire immediately.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Execution Gates</p>
                <p className="text-sm text-gray-300">Require: regime ∈ {'{Expansion, Trend}'} AND Drive &gt; Opposition AND Stability &gt; 35 AND aligned bias. Gates OFF during Compression, Distribution, Transition.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">TDM</p>
                <p className="text-sm text-gray-300">Fills at +2.0/bar during Compression+High Stability. Drains at -4.0/bar during Expansion. Pressure gauge, not direction indicator.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Structural Memory</p>
                <p className="text-sm text-gray-300">Records 5 failure types (EXP→DIST/COMP/TRANS, TREND→TRANS/DIST). Decays at 0.002×effDecay/bar. Max 8 imprints. Fixed stain window per preset (30/60/100 bars).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Pressure Envelope</p>
                <p className="text-sm text-gray-300">Thickness = ATR × (0.2 + Drive/100 × 0.5). Grey when Drive &gt; Opp. Amber ochre when Opp &gt; Drive.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Export Contract v1</p>
                <p className="text-sm text-gray-300">msi_regime_id · msi_regime_conf · msi_drive · msi_opp · msi_stability · msi_tdm · msi_gate_long · msi_gate_short · msi_memory · msi_effort_gap · msi_bias.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading MSI States Under Pressure</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real-world scenarios testing whether you can read MSI the way a regime-aware trader does &mdash; synthesizing all the layers rather than hunting for signals.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MSI as the regime engine it is. Signal-hunting instinct overridden.' : gameScore >= 3 ? 'Solid. Re-read the classifier and gates sections before the quiz.' : 'Re-study the regimes and gates sections thoroughly before the quiz.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">⚙</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market State Intelligence</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Regime Intelligence Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.4-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
