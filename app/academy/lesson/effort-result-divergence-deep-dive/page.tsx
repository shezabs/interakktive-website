// app/academy/lesson/effort-result-divergence-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.9: Effort-Result Divergence Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PHASE 1: scaffold + 4 animations (Wyckoff 2x2, Effort, Result, ERD bipolar)
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
// ANIMATION 1: The Wyckoff 2x2 — effort vs result matrix
// Four quadrants: high/low effort × high/low result
// ============================================================
function WyckoffMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText("Wyckoff's Question \u2014 Did Effort Produce Result?", w / 2, 14);

    const padL = 80;
    const padR = w - 40;
    const padT = 36;
    const padB = h - 40;
    const chartW = padR - padL;
    const chartH = padB - padT;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padB); ctx.lineTo(padR, padB); ctx.stroke();

    // Diagonal separator — above = vacuum (result > effort), below = absorption
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(padL, padB); ctx.lineTo(padR, padT); ctx.stroke();
    ctx.setLineDash([]);

    // Quadrant labels
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';

    // Upper-left: low effort, high result = strong vacuum
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('VACUUM', padL + chartW * 0.25, padT + chartH * 0.25);
    ctx.fillStyle = 'rgba(38,166,154,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('thin move \u2014 price ran without effort', padL + chartW * 0.25, padT + chartH * 0.25 + 10);

    // Upper-right: high effort, high result but result wins
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('CLEAN +', padL + chartW * 0.7, padT + chartH * 0.3);
    ctx.fillStyle = 'rgba(38,166,154,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('effort with proportional result', padL + chartW * 0.7, padT + chartH * 0.3 + 10);

    // Lower-left: low effort, low result = quiet
    ctx.fillStyle = 'rgba(138,138,138,0.6)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('QUIET', padL + chartW * 0.3, padB - chartH * 0.3);
    ctx.fillStyle = 'rgba(138,138,138,0.4)';
    ctx.font = '6px system-ui';
    ctx.fillText('balanced, no signal', padL + chartW * 0.3, padB - chartH * 0.3 + 10);

    // Lower-right: high effort, low result = absorption
    ctx.fillStyle = 'rgba(239,83,80,0.95)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('ABSORPTION', padL + chartW * 0.75, padB - chartH * 0.2);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('heavy volume, no travel', padL + chartW * 0.75, padB - chartH * 0.2 + 10);

    // Cycling dot showing different markets through quadrants
    const angle = t * 0.8;
    const cycleX = 0.5 + Math.cos(angle) * 0.35;
    const cycleY = 0.5 + Math.sin(angle * 1.3) * 0.35;
    const dotX = padL + cycleX * chartW;
    const dotY = padT + (1 - cycleY) * chartH;

    // Determine which quadrant
    const effort = cycleX; // 0-1 (left-right)
    const result = cycleY; // 0-1 (bottom-top)
    const delta = result - effort;

    let dotColor = '#8A8A8A';
    let label = 'QUIET';
    if (delta > 0.15) { dotColor = '#26A69A'; label = 'VACUUM'; }
    else if (delta < -0.15) { dotColor = '#EF5350'; label = 'ABSORPTION'; }
    else if (effort > 0.6 && result > 0.6) { dotColor = '#26A69A'; label = 'CLEAN'; }

    // Trail
    ctx.strokeStyle = dotColor + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const tt = angle - i * 0.03;
      const xx = 0.5 + Math.cos(tt) * 0.35;
      const yy = 0.5 + Math.sin(tt * 1.3) * 0.35;
      const x = padL + xx * chartW;
      const y = padT + (1 - yy) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = dotColor;
    ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.stroke();

    // Label above dot
    ctx.fillStyle = dotColor;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, dotX, dotY - 10);

    // X-axis label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('EFFORT \u2192', padL + chartW / 2, padB + 16);

    // Y-axis label
    ctx.save();
    ctx.translate(padL - 28, padT + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('RESULT \u2192', 0, 0);
    ctx.restore();

    // Axis tick labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('low', padL + 10, padB + 12);
    ctx.fillText('high', padR - 10, padB + 12);
    ctx.textAlign = 'right';
    ctx.fillText('high', padL - 4, padT + 6);
    ctx.fillText('low', padL - 4, padB - 2);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Effort — volume ratio mapping to 0-100
// ============================================================
function EffortComponentAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Effort = volume / SMA(volume, 20) mapped to 0\u2013100', w / 2, 14);

    // Formula display
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText('effort100 = clamp100(100 \u00d7 ratio / effortCap)', w / 2, 32);

    // Three example scenarios at bottom
    const examples = [
      { label: 'QUIET', vol: 0.6, avgVol: 1.0, color: '#8A8A8A' },
      { label: 'NORMAL', vol: 1.5, avgVol: 1.0, color: '#F9A825' },
      { label: 'SURGE', vol: 3.0, avgVol: 1.0, color: '#FF9800' },
    ];

    const pW = (w - 40) / 3;
    const pY = 50;
    const pH = h - 72;
    const gap = 8;

    examples.forEach((ex, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = ex.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = ex.color + '66';
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = ex.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ex.label, x + pW / 2, pY + 14);

      // Current volume vs average as stacked bars
      const mY = pY + 26;
      const mH = pH - 58;
      const bW = (pW - 32) / 2;

      // Avg volume bar
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, mY, bW, mH);
      const avgFill = mH * 0.4; // fixed reference
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 10, mY + mH - avgFill, bW, avgFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText('avg vol', x + 10 + bW / 2, mY - 3);
      ctx.fillText('1.0x', x + 10 + bW / 2, mY + mH + 9);

      // Current volume bar (with pulse animation)
      const pulse = 0.85 + Math.sin(t * 3 + i) * 0.15;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + pW - 10 - bW, mY, bW, mH);
      const curFill = Math.min(mH, mH * 0.4 * ex.vol * pulse);
      ctx.fillStyle = ex.color + 'cc';
      ctx.fillRect(x + pW - 10 - bW, mY + mH - curFill, bW, curFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText('cur vol', x + pW - 10 - bW / 2, mY - 3);
      ctx.fillText(ex.vol.toFixed(1) + 'x', x + pW - 10 - bW / 2, mY + mH + 9);

      // Effort score (ratio / 3.0 * 100, clamped)
      const effort = Math.min(100, (ex.vol / ex.avgVol / 3.0) * 100);
      ctx.fillStyle = ex.color;
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`${effort.toFixed(0)}`, x + pW / 2, pY + pH - 14);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '6px system-ui';
      ctx.fillText('effort (0\u2013100)', x + pW / 2, pY + pH - 4);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('effortCap = 3.0 default \u2014 volume 3\u00d7 average = 100 effort', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: Result — price move / ATR mapping to 0-100
// ============================================================
function ResultComponentAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Result = |close - close[1]| / ATR mapped to 0\u2013100', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText('result100 = clamp100(100 \u00d7 move / ATR / resultCap)', w / 2, 32);

    const examples = [
      { label: 'SMALL MOVE', move: 0.3, atr: 1.0, color: '#8A8A8A' },
      { label: 'NORMAL MOVE', move: 0.7, atr: 1.0, color: '#F9A825' },
      { label: 'FULL ATR', move: 1.0, atr: 1.0, color: '#42A5F5' },
    ];

    const pW = (w - 40) / 3;
    const pY = 50;
    const pH = h - 72;
    const gap = 8;

    examples.forEach((ex, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = ex.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = ex.color + '66';
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = ex.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ex.label, x + pW / 2, pY + 14);

      // Mini candle visualization
      const cX = x + pW / 2;
      const candleT = pY + 26;
      const candleB = pY + pH - 50;
      const candleH = candleB - candleT;

      // ATR envelope as full range
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(cX - 20, candleT); ctx.lineTo(cX + 20, candleT); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cX - 20, candleB); ctx.lineTo(cX + 20, candleB); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('ATR top', cX + 22, candleT + 3);
      ctx.fillText('ATR bot', cX + 22, candleB + 3);

      // The actual candle move (from middle out)
      const moveRatio = ex.move;
      const midY = (candleT + candleB) / 2;
      const pulse = 0.9 + Math.sin(t * 2 + i) * 0.1;
      const halfMove = (candleH / 2) * moveRatio * pulse;
      const topY = midY - halfMove;
      const botY = midY + halfMove;

      // Body
      ctx.fillStyle = ex.color + 'cc';
      ctx.fillRect(cX - 8, topY, 16, halfMove * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cX - 8, topY, 16, halfMove * 2);

      // Result score
      const result = Math.min(100, (ex.move / ex.atr / 1.0) * 100);
      ctx.fillStyle = ex.color;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${result.toFixed(0)}`, x + pW / 2, pY + pH - 14);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '6px system-ui';
      ctx.fillText('result (0\u2013100)', x + pW / 2, pY + pH - 4);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('resultCap = 1.0 default \u2014 price moving a full ATR in one bar = 100 result', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: The Bipolar ERD Score = result100 - effort100
// ============================================================
function BipolarERDAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERD = Result \u2212 Effort  \u2014 A Bipolar Score', w / 2, 14);

    // Three stacked panels: effort, result, ERD
    const padL = 30;
    const padR = w - 15;
    const xR = padR - padL;

    const pH = (h - 60) / 3;
    const p1Y = 30;
    const p2Y = p1Y + pH + 4;
    const p3Y = p2Y + pH + 4;

    const n = 40;
    const xStep = xR / n;

    // Panel 1: EFFORT (orange)
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p1Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p1Y, xR, pH);
    ctx.fillStyle = '#FF9800';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('EFFORT (0-100)', padL + 4, p1Y + 10);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      // Oscillating effort 30-80
      const ef = 55 + Math.sin(i * 0.4 + t) * 25;
      const barH = (ef / 100) * (pH - 14);
      ctx.fillStyle = '#FF9800cc';
      ctx.fillRect(x + 0.5, p1Y + pH - 4 - barH, xStep - 1, barH);
    }

    // Panel 2: RESULT (blue)
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, pH);
    ctx.fillStyle = '#42A5F5';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('RESULT (0-100)', padL + 4, p2Y + 10);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      // Slightly different phase
      const res = 55 + Math.sin(i * 0.4 + t + 1.2) * 30;
      const barH = (res / 100) * (pH - 14);
      ctx.fillStyle = '#42A5F5cc';
      ctx.fillRect(x + 0.5, p2Y + pH - 4 - barH, xStep - 1, barH);
    }

    // Panel 3: ERD = Result - Effort, bipolar
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p3Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p3Y, xR, pH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ERD (bipolar)', padL + 4, p3Y + 10);

    const midY3 = p3Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, midY3); ctx.lineTo(padR, midY3); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const ef = 55 + Math.sin(i * 0.4 + t) * 25;
      const res = 55 + Math.sin(i * 0.4 + t + 1.2) * 30;
      const erd = res - ef;
      const color = erd >= 0 ? '#26A69A' : '#EF5350';
      const barY = erd >= 0 ? midY3 - (erd / 60) * (pH / 2 - 4) : midY3;
      const barH = Math.abs(erd / 60) * (pH / 2 - 4);
      ctx.fillStyle = color + 'dd';
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // Footer annotation
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Teal = result exceeds effort \u2022 Magenta = effort exceeds result', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: Sign Convention — Vacuum vs Absorption
// ============================================================
function SignConventionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Sign Convention \u2014 Vacuum vs Absorption', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 26); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: VACUUM — positive ERD
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VACUUM (+ERD)', mid / 2, 40);
    ctx.fillStyle = 'rgba(38,166,154,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('thin move \u2014 price ran on light effort', mid / 2, 52);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 64;
    const chartB = h - 56;
    const chartH = chartB - chartT;

    // Price line (big move up)
    const n = 20;
    const xStepL = (padLR - padLL) / (n - 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      const y = chartB - (i / n) * (chartH - 20) + Math.sin(i + t) * 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Volume bars beneath (small)
    const volY = chartB + 5;
    const volH = 12;
    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      const vH = 3 + Math.sin(i + t) * 2;
      ctx.fillStyle = 'rgba(255,152,0,0.6)';
      ctx.fillRect(x + 0.5, volY + volH - vH, xStepL - 1, vH);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('low volume', padLL, volY + volH + 8);

    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2192 big price move, little effort', mid / 2, h - 4);

    // RIGHT: ABSORPTION — negative ERD
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('ABSORPTION (\u2212ERD)', mid + mid / 2, 40);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('heavy volume \u2014 price didn\'t travel', mid + mid / 2, 52);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (n - 1);

    // Price line (choppy, sideways)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      const y = chartT + chartH / 2 + Math.sin(i * 0.8 + t) * 3 + Math.cos(i * 0.5 + t) * 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Volume bars beneath (tall)
    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      const vH = 9 + Math.sin(i + t) * 2;
      ctx.fillStyle = 'rgba(255,152,0,0.85)';
      ctx.fillRect(x + 0.5, volY + volH - vH, xStepR - 1, vH);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('heavy volume', padRL, volY + volH + 8);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2192 sideways chop, big volume', mid + mid / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 6: Z-Score Statistical Layer
// Shows how z-score contextualizes raw ERD values
// ============================================================
function ZScoreStatAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Z-Score = (erd - mean) / stdev  over 100 bars', w / 2, 14);

    // Top: raw ERD histogram with mean and ±2σ bands
    const padL = 30;
    const padR = w - 20;
    const xR = padR - padL;
    const chartT = 34;
    const chartB = h - 44;
    const chartH = chartB - chartT;
    const midY = (chartT + chartB) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, chartT, xR, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, chartT, xR, chartH);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();

    // Mean reference line (slightly positive, shifting)
    const meanOffset = Math.sin(t * 0.3) * 4;
    const meanY = midY - meanOffset;
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padL, meanY); ctx.lineTo(padR, meanY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('mean (rolling, 100 bars)', padL + 4, meanY - 3);

    // ±2σ bands
    const sigmaH = 22;
    const upperY = meanY - sigmaH;
    const lowerY = meanY + sigmaH;
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(padL, upperY); ctx.lineTo(padR, upperY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowerY); ctx.lineTo(padR, lowerY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+2\u03C3', padR - 4, upperY - 3);
    ctx.fillText('-2\u03C3', padR - 4, lowerY + 10);

    // Shaded ±2σ band
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(padL, upperY, xR, sigmaH * 2);

    // Histogram bars with occasional spike outside ±2σ
    const n = 48;
    const bW = xR / n;
    for (let i = 0; i < n; i++) {
      const x = padL + i * bW;
      // Most bars moderate, occasional big excursions
      let v = Math.sin(i * 0.3 + t) * 8 + Math.sin(i * 0.6 + t * 0.5) * 5;
      // Inject rare spikes for visual punch
      if (i === Math.floor((t * 2) % n)) v = 35; // Big positive
      if (i === Math.floor((t * 2 + 16) % n)) v = -35; // Big negative

      let color = v >= 0 ? 'rgba(38,166,154,0.85)' : 'rgba(239,83,80,0.85)';
      const barY = v >= 0 ? midY - Math.abs(v) : midY;
      const barH = Math.abs(v);
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, barY, bW - 1, barH);

      // Event circle if outside ±2σ
      const barTop = v >= 0 ? midY - v : midY + Math.abs(v);
      const isEvent = (v >= 0 && barTop < upperY) || (v < 0 && barTop > lowerY);
      if (isEvent) {
        ctx.fillStyle = v >= 0 ? '#26A69A' : '#EF5350';
        ctx.beginPath(); ctx.arc(x + bW / 2, barTop, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x + bW / 2, barTop, 4, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Circle marker fires when z-score crosses \u00b12\u03C3 threshold \u2014 rare, contextual events', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 7: Event Markers — the circle plots
// ============================================================
function EventMarkersAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Event Markers \u2014 Statistical Rarity, Not Magnitude', w / 2, 14);

    // Price pane top, ERD pane bottom
    const padL = 30;
    const padR = w - 15;
    const xR = padR - padL;
    const chartT = 32;
    const chartB = h - 44;

    const p1H = (chartB - chartT) * 0.55;
    const p1B = chartT + p1H;
    const p2T = p1B + 8;
    const p2H = chartB - p2T;

    const n = 60;
    const xStep = xR / (n - 1);

    // Price line with news event
    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      let p = 100;
      if (i < 25) p += Math.sin(i * 0.3 + t) * 0.5;
      else if (i === 25) p += 3; // News spike
      else if (i < 35) p = 103 + (i - 25) * 0.15 + Math.sin(i + t) * 0.3;
      else p = 104.5 + Math.sin(i * 0.3 + t) * 0.5;
      prices.push(p);
    }

    const pMin = Math.min(...prices) - 0.5;
    const pMax = Math.max(...prices) + 0.5;
    const toY1 = (v: number) => p1B - ((v - pMin) / (pMax - pMin)) * (p1H - 14) - 6;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL + 4, chartT + 10);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // ERD histogram with event markers
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2T, xR, p2H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2T, xR, p2H);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ERD + EVENTS', padL + 4, p2T + 10);

    const midY2 = p2T + p2H / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padL, midY2); ctx.lineTo(padR, midY2); ctx.stroke();

    // Define event locations (news event at 25 = absorption, then recovery event at 30 = vacuum)
    const eventAbsorption = 25;
    const eventVacuum = 38;

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = Math.sin(i * 0.4 + t) * 10 + Math.sin(i * 0.7 + t * 0.6) * 5;
      if (i === eventAbsorption) v = -45; // big absorption spike
      if (i === eventVacuum) v = 48; // big vacuum spike

      let color = v >= 0 ? '#26A69Add' : '#EF5350dd';
      const barY = v >= 0 ? midY2 - (v / 55) * (p2H / 2 - 3) : midY2;
      const barH = Math.abs(v / 55) * (p2H / 2 - 3);
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);

      // Event markers
      if (i === eventAbsorption || i === eventVacuum) {
        const barTop = v >= 0 ? barY : barY + barH;
        const isVacuum = v > 0;
        const pulse = 1 + Math.sin(t * 5) * 0.3;
        ctx.fillStyle = isVacuum ? '#26A69A' : '#EF5350';
        ctx.beginPath(); ctx.arc(x + xStep / 2, barTop, 5 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x + xStep / 2, barTop, 5 * pulse, 0, Math.PI * 2); ctx.stroke();

        // Label
        ctx.fillStyle = isVacuum ? '#26A69A' : '#EF5350';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(isVacuum ? 'VACUUM' : 'ABSORP.', x + xStep / 2, barTop + (isVacuum ? -10 : p2H - 4 - (barY + barH - p2T) + 14));

        // Vertical guide line to price
        ctx.strokeStyle = (isVacuum ? '#26A69A' : '#EF5350') + '66';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(x + xStep / 2, p1B); ctx.lineTo(x + xStep / 2, barTop); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Markers fire only at \u00b12\u03C3 \u2014 about 5% of bars \u2014 highlighting statistically unusual moments', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 8: THE DUAL-TIMESCALE DOCTRINE (★ GROUNDBREAKING)
// Shows the SAME ERD value reading differently depending on context
// ============================================================
function DualTimescaleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.009;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Dual-Timescale Doctrine \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Same ERD value = +30 \u2014 opposite statistical meanings', w / 2, 28);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 38); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: History shows ERD oscillating around +40 (baseline positive instrument)
    // Current reading of +30 is ACTUALLY BELOW NORMAL for this instrument
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Context A: High-vacuum instrument', mid / 2, 48);
    ctx.fillStyle = 'rgba(138,138,138,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('100-bar mean \u2248 +40', mid / 2, 58);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 68;
    const chartB = h - 50;
    const chartH = chartB - chartT;
    const midYL = (chartT + chartB) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padLL, chartT, padLR - padLL, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padLL, chartT, padLR - padLL, chartH);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padLL, midYL); ctx.lineTo(padLR, midYL); ctx.stroke();

    // Mean line (at +40 equiv)
    const meanYL = midYL - chartH * 0.25;
    ctx.strokeStyle = 'rgba(255,179,0,0.7)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, meanYL); ctx.lineTo(padLR, meanYL); ctx.stroke();
    ctx.setLineDash([]);

    // Histogram with bars oscillating around +40
    const nL = 25;
    const bWL = (padLR - padLL) / nL;
    for (let i = 0; i < nL; i++) {
      const x = padLL + i * bWL;
      const v = 38 + Math.sin(i * 0.3 + t) * 10;
      let color = v >= 0 ? 'rgba(38,166,154,0.85)' : 'rgba(239,83,80,0.85)';
      const barY = midYL - (v / 80) * (chartH / 2);
      const barH = (v / 80) * (chartH / 2);
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, barY, bWL - 1, barH);
    }

    // The current bar at +30 (highlighted)
    const curIdxL = nL - 3;
    const curXL = padLL + curIdxL * bWL;
    const curVL = 30;
    const curBarYL = midYL - (curVL / 80) * (chartH / 2);
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.fillRect(curXL + 0.5, curBarYL, bWL - 1, (curVL / 80) * (chartH / 2));

    // Highlight circle around current bar
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(curXL - 1, curBarYL - 1, bWL + 2, (curVL / 80) * (chartH / 2) + 2);

    // Label for current reading
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOW: +30', curXL + bWL / 2, curBarYL - 4);

    // Interpretation
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('z \u2248 -1.2  (below normal)', mid / 2, h - 22);
    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.font = '7px system-ui';
    ctx.fillText('reading is subpar FOR THIS instrument', mid / 2, h - 10);

    // RIGHT: History shows ERD around -20 (baseline absorptive)
    // Current +30 is statistically remarkable
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('Context B: Low-vacuum instrument', mid + mid / 2, 48);
    ctx.fillStyle = 'rgba(138,138,138,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('100-bar mean \u2248 -20', mid + mid / 2, 58);

    const padRL = mid + 15;
    const padRR = w - 15;
    const midYR = midYL;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padRL, chartT, padRR - padRL, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padRL, chartT, padRR - padRL, chartH);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padRL, midYR); ctx.lineTo(padRR, midYR); ctx.stroke();

    // Mean line (at -20 equiv)
    const meanYR = midYR + chartH * 0.12;
    ctx.strokeStyle = 'rgba(255,179,0,0.7)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padRL, meanYR); ctx.lineTo(padRR, meanYR); ctx.stroke();
    ctx.setLineDash([]);

    const nR = nL;
    const bWR = (padRR - padRL) / nR;
    for (let i = 0; i < nR; i++) {
      const x = padRL + i * bWR;
      const v = -22 + Math.sin(i * 0.3 + t) * 8;
      let color = v >= 0 ? 'rgba(38,166,154,0.85)' : 'rgba(239,83,80,0.85)';
      const barY = v >= 0 ? midYR - (v / 80) * (chartH / 2) : midYR;
      const barH = Math.abs(v / 80) * (chartH / 2);
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, barY, bWR - 1, barH);
    }

    // Current bar at +30 (striking departure)
    const curIdxR = nR - 3;
    const curXR = padRL + curIdxR * bWR;
    const curBarYR = midYR - (30 / 80) * (chartH / 2);
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.fillRect(curXR + 0.5, curBarYR, bWR - 1, (30 / 80) * (chartH / 2));

    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(curXR - 1, curBarYR - 1, bWR + 2, (30 / 80) * (chartH / 2) + 2);

    // VACUUM event marker (z > +2)
    const pulse = 1 + Math.sin(t * 5) * 0.3;
    ctx.fillStyle = '#26A69A';
    ctx.beginPath(); ctx.arc(curXR + bWR / 2, curBarYR, 4 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(curXR + bWR / 2, curBarYR, 4 * pulse, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOW: +30', curXR + bWR / 2, curBarYR - 10);

    // Interpretation
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('z \u2248 +2.6  (EVENT!)', mid + mid / 2, h - 22);
    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.font = '7px system-ui';
    ctx.fillText('statistically striking for this instrument', mid + mid / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 9: Reading Vacuum vs Absorption as chart patterns
// ============================================================
function ReadingPatternsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.011;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Reading VACUUM and ABSORPTION in Context', w / 2, 14);

    // Two scenarios stacked vertically
    const padL = 30;
    const padR = w - 15;
    const xR = padR - padL;
    const chartT = 30;
    const chartB = h - 14;
    const chartH = chartB - chartT;

    const pH = (chartH - 10) / 2;
    const p1Y = chartT;
    const p2Y = p1Y + pH + 10;

    const n = 50;
    const xStep = xR / (n - 1);

    // Scenario 1: Vacuum breakout — thin volume, big move
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p1Y, xR, pH);
    ctx.strokeStyle = 'rgba(38,166,154,0.4)';
    ctx.strokeRect(padL, p1Y, xR, pH);

    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('VACUUM: thin-volume breakout', padL + 6, p1Y + 12);

    // Price line going up in second half
    const prices1: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 25) prices1.push(100 + Math.sin(i * 0.4 + t) * 0.3);
      else prices1.push(100 + (i - 25) * 0.2 + Math.sin(i + t) * 0.2);
    }
    const p1Min = Math.min(...prices1) - 0.5;
    const p1Max = Math.max(...prices1) + 0.5;
    const toY1 = (v: number) => p1Y + pH - 20 - ((v - p1Min) / (p1Max - p1Min)) * (pH - 30);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices1.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Volume bars at bottom (decreasing)
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const v = i < 25 ? 7 + Math.sin(i + t) * 2 : 3 + Math.sin(i + t) * 1.5;
      ctx.fillStyle = 'rgba(255,152,0,0.7)';
      ctx.fillRect(x + 0.5, p1Y + pH - 4 - v, xStep - 1, v);
    }

    // Annotate
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('price climbs + volume drops = high ERD', padL + 6, p1Y + pH - 22);

    // Scenario 2: Absorption stall — heavy volume, sideways
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(239,83,80,0.4)';
    ctx.strokeRect(padL, p2Y, xR, pH);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('ABSORPTION: heavy-volume stall', padL + 6, p2Y + 12);

    // Sideways chop with heavy volume
    const prices2: number[] = [];
    for (let i = 0; i < n; i++) {
      prices2.push(100 + Math.sin(i * 0.5 + t) * 0.8 + Math.cos(i * 0.7 + t) * 0.6);
    }
    const p2Min = 99;
    const p2Max = 101;
    const toY2 = (v: number) => p2Y + pH - 20 - ((v - p2Min) / (p2Max - p2Min)) * (pH - 30);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices2.forEach((v, i) => { const x = padL + i * xStep; const y = toY2(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Heavy volume bars
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const v = 10 + Math.sin(i + t) * 3;
      ctx.fillStyle = 'rgba(255,152,0,0.85)';
      ctx.fillRect(x + 0.5, p2Y + pH - 4 - v, xStep - 1, v);
    }

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('price flat + volume heavy = low ERD', padL + 6, p2Y + pH - 22);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 10: ERD vs MPR — two different measurements of effort
// ============================================================
function ERDvsMPRAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERD vs MPR \u2014 Both Touch Effort, Differently', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: ERD
    const padLL = 15;
    const padLR = mid - 15;
    const padLT = 34;
    const padLB = h - 14;
    const lH = padLB - padLT;

    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.fillRect(padLL, padLT, padLR - padLL, lH);
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.strokeRect(padLL, padLT, padLR - padLL, lH);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERD', (padLL + padLR) / 2, padLT + 16);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '8px system-ui';
    ctx.fillText('Direct, bar-by-bar', (padLL + padLR) / 2, padLT + 30);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    const lItems = [
      '\u2022 Effort = raw volume / avg',
      '\u2022 Result = raw move / ATR',
      '\u2022 Output: signed score',
      '\u2022 Events: z-score \u00b12\u03C3',
      '\u2022 No state classifier',
      '\u2022 No persistence filter',
      '\u2022 Every bar is a reading',
    ];
    lItems.forEach((item, i) => {
      ctx.fillText(item, padLL + 10, padLT + 48 + i * 12);
    });

    ctx.fillStyle = 'rgba(255,179,0,0.75)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('&raquo; &ldquo;What is this bar doing?&rdquo;', (padLL + padLR) / 2, padLB - 10);

    // RIGHT: MPR
    const padRL = mid + 15;
    const padRR = w - 15;

    ctx.fillStyle = 'rgba(236,64,122,0.08)';
    ctx.fillRect(padRL, padLT, padRR - padRL, lH);
    ctx.strokeStyle = 'rgba(236,64,122,0.5)';
    ctx.strokeRect(padRL, padLT, padRR - padRL, lH);

    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPR', (padRL + padRR) / 2, padLT + 16);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '8px system-ui';
    ctx.fillText('Committed state regime', (padRL + padRR) / 2, padLT + 30);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    const rItems = [
      '\u2022 Stress = effort - result',
      '\u2022 Combined with compression',
      '\u2022 Output: 4-state classifier',
      '\u2022 Trap state off-axis',
      '\u2022 Persistence contract (3 bars)',
      '\u2022 Stability override',
      '\u2022 Committed readings only',
    ];
    rItems.forEach((item, i) => {
      ctx.fillText(item, padRL + 10, padLT + 48 + i * 12);
    });

    ctx.fillStyle = 'rgba(236,64,122,0.75)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('&raquo; &ldquo;What regime are we in?&rdquo;', (padRL + padRR) / 2, padLB - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 11: Four-pane confluence stack (Price + ERD + MPR + VSI)
// ============================================================
function ConfluenceStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERD \u00d7 MPR \u00d7 VSI \u2014 The Full Oscillator Picture', w / 2, 14);

    const padL = 20;
    const padR = w - 15;
    const xR = padR - padL;

    const pH = (h - 40) / 4;
    const p1Y = 24;
    const p2Y = p1Y + pH + 3;
    const p3Y = p2Y + pH + 3;
    const p4Y = p3Y + pH + 3;

    const n = 50;
    const xStep = xR / (n - 1);

    // PANE 1: Price
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p1Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p1Y, xR, pH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL + 4, p1Y + 10);

    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 20) prices.push(100 + Math.sin(i * 0.3 + t) * 0.4);
      else if (i < 35) prices.push(100 + (i - 20) * 0.25 + Math.sin(i + t) * 0.4);
      else prices.push(103.75 + Math.sin(i * 0.3 + t) * 0.6);
    }
    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1Y + pH - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // PANE 2: ERD
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, pH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ERD (bar by bar)', padL + 4, p2Y + 10);

    const midY2 = p2Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY2); ctx.lineTo(padR, midY2); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = Math.sin(i * 0.4 + t) * 10 + (i > 20 && i < 35 ? 15 : 0);
      let color = v >= 0 ? '#26A69A' : '#EF5350';
      const barY = v >= 0 ? midY2 - (v / 40) * (pH / 2 - 3) : midY2;
      const barH = Math.abs(v / 40) * (pH / 2 - 3);
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // PANE 3: MPR
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p3Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p3Y, xR, pH);
    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPR (state regime)', padL + 4, p3Y + 10);

    const midY3 = p3Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY3); ctx.lineTo(padR, midY3); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = 0; let c = '#8A8A8A';
      if (i < 20) { v = -18 + Math.sin(i + t) * 5; c = '#8A8A8A'; }
      else if (i < 35) { v = 22 + Math.sin(i + t) * 4; c = '#26A69A'; }
      else { v = 8 + Math.sin(i + t) * 3; c = '#26A69A'; }
      const barY = v >= 0 ? midY3 - (v / 40) * (pH / 2 - 3) : midY3;
      const barH = Math.abs(v / 40) * (pH / 2 - 3);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // PANE 4: VSI
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p4Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p4Y, xR, pH);
    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('VSI (vol change)', padL + 4, p4Y + 10);

    const midY4 = p4Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY4); ctx.lineTo(padR, midY4); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = 0; let c = '#8A8A8A';
      if (i < 20) { v = -7 + Math.sin(i + t) * 2; c = '#8A8A8A'; }
      else if (i < 35) { v = 12 + Math.sin(i + t) * 3; c = '#26A69A'; }
      else { v = -3 + Math.sin(i + t) * 2; c = '#F9A825'; }
      const barY = v >= 0 ? midY4 - (v / 25) * (pH / 2 - 3) : midY4;
      const barH = Math.abs(v / 25) * (pH / 2 - 3);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // Confluence line
    const confX = padL + 26 * xStep;
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(confX, p1Y); ctx.lineTo(confX, p4Y + pH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ALL ALIGN', confX, p1Y - 2);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 12: Cap Parameter Sensitivity
// Shows how effortCap and resultCap tune the indicator
// ============================================================
function CapParameterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Cap Parameters \u2014 Tuning the Mapping', w / 2, 14);

    // Two panels: effortCap and resultCap
    const pW = (w - 30) / 2;
    const pY = 30;
    const pH = h - 44;

    // LEFT: effortCap
    const x1 = 10;
    ctx.fillStyle = 'rgba(255,152,0,0.08)';
    ctx.fillRect(x1, pY, pW, pH);
    ctx.strokeStyle = 'rgba(255,152,0,0.4)';
    ctx.strokeRect(x1, pY, pW, pH);

    ctx.fillStyle = '#FF9800';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('effortCap', x1 + pW / 2, pY + 14);
    ctx.fillStyle = 'rgba(255,152,0,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('volume ratio that maps to 100', x1 + pW / 2, pY + 26);

    // Plot mapping curve: x = volume ratio (0 to 5), y = effort100
    const chartT = pY + 36;
    const chartB = pY + pH - 28;
    const chartH = chartB - chartT;
    const chartL = x1 + 20;
    const chartR = x1 + pW - 15;
    const chartW = chartR - chartL;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chartL, chartT); ctx.lineTo(chartL, chartB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chartL, chartB); ctx.lineTo(chartR, chartB); ctx.stroke();

    // Animated cap value
    const cap = 2 + Math.sin(t) * 1.2; // cycles 0.8 to 3.2

    // Draw the clamp line: linear until cap, then 100
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= chartW; px++) {
      const ratio = (px / chartW) * 5;
      const effort = Math.min(100, (ratio / cap) * 100);
      const y = chartB - (effort / 100) * chartH;
      const x = chartL + px;
      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Cap indicator (vertical line at cap)
    const capX = chartL + (cap / 5) * chartW;
    ctx.strokeStyle = 'rgba(255,152,0,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(capX, chartT); ctx.lineTo(capX, chartB); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FF9800';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`cap = ${cap.toFixed(1)}`, capX, chartT - 3);

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('vol ratio', chartL + chartW / 2, chartB + 10);
    ctx.textAlign = 'right';
    ctx.fillText('100', chartL - 3, chartT + 3);
    ctx.fillText('0', chartL - 3, chartB);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Lower cap \u2192 more bars saturate at 100', x1 + pW / 2, pY + pH - 6);

    // RIGHT: resultCap
    const x2 = w - 10 - pW;
    ctx.fillStyle = 'rgba(66,165,245,0.08)';
    ctx.fillRect(x2, pY, pW, pH);
    ctx.strokeStyle = 'rgba(66,165,245,0.4)';
    ctx.strokeRect(x2, pY, pW, pH);

    ctx.fillStyle = '#42A5F5';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('resultCap', x2 + pW / 2, pY + 14);
    ctx.fillStyle = 'rgba(66,165,245,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('ATR multiple that maps to 100', x2 + pW / 2, pY + 26);

    const chart2L = x2 + 20;
    const chart2R = x2 + pW - 15;
    const chart2W = chart2R - chart2L;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(chart2L, chartT); ctx.lineTo(chart2L, chartB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chart2L, chartB); ctx.lineTo(chart2R, chartB); ctx.stroke();

    const cap2 = 0.8 + Math.sin(t + 1) * 0.4; // cycles 0.4 to 1.2

    ctx.strokeStyle = '#42A5F5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= chart2W; px++) {
      const ratio = (px / chart2W) * 2;
      const result = Math.min(100, (ratio / cap2) * 100);
      const y = chartB - (result / 100) * chartH;
      const x = chart2L + px;
      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const cap2X = chart2L + (cap2 / 2) * chart2W;
    ctx.strokeStyle = 'rgba(66,165,245,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(cap2X, chartT); ctx.lineTo(cap2X, chartB); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#42A5F5';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`cap = ${cap2.toFixed(1)}`, cap2X, chartT - 3);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('move/ATR', chart2L + chart2W / 2, chartB + 10);
    ctx.textAlign = 'right';
    ctx.fillText('100', chart2L - 3, chartT + 3);
    ctx.fillText('0', chart2L - 3, chartB);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Balance caps so Result \u2248 Effort distributions match', x2 + pW / 2, pY + pH - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME DATA — 5 rounds testing ERD interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'Your ERD histogram reads <strong>+15</strong>. The z-score reads <strong>0.1</strong>. What does this specifically mean?',
    options: [
      { text: 'The bar is mildly positive (result slightly exceeded effort) but it\u2019s a completely ordinary reading for this instrument. The z-score of 0.1 tells you that +15 is essentially AT the 100-bar mean. No event marker will fire. This is background noise, not signal.', correct: true, explain: 'Correct. ERD raw value tells you the current bar\u2019s effort/result relationship. Z-score tells you how unusual that relationship is in the instrument\u2019s own history. A small z-score means the bar is ordinary \u2014 regardless of the raw value. This is the Dual-Timescale Doctrine in action: the moment is positive, the context is unremarkable. Don\u2019t act on +15 alone.' },
      { text: 'Strong bullish signal, enter long', correct: false, explain: 'ERD is not a directional signal. Positive ERD means result exceeded effort \u2014 that\u2019s about efficiency, not direction. A price move DOWN on light volume produces positive ERD too. Treating ERD as a directional tool produces systematic errors; it\u2019s a bar-quality metric, not a trade-entry signal.' },
    ],
  },
  {
    scenario: 'You see a circle <strong>MAGENTA ABSORPTION marker</strong> at the exact bar where price tried to break below yesterday\u2019s low but closed near the highs. What did ERD just tell you?',
    options: [
      { text: 'On that bar, effort (volume) significantly exceeded result (price travel) at a statistical extreme (z \u2264 -2). Heavy sellers showed up but couldn\u2019t take price lower, suggesting demand absorbed the supply. This is a textbook absorption pattern near support \u2014 often the footprint of a bullish reversal setup.', correct: true, explain: 'Exactly. The magenta marker means the z-score crossed -2\u03C3 \u2014 statistically unusual absorption for this instrument. Combined with the price rejection of the lower boundary, you\u2019re seeing the signature of sellers being absorbed by buyers. This is the scenario where ERD earns its keep \u2014 quantifying what experienced tape readers see intuitively and giving you an objective flag for it.' },
      { text: 'The indicator is malfunctioning', correct: false, explain: 'Working as designed. The marker fires precisely when the statistical threshold is crossed. The fact that it coincided with a price rejection pattern is the indicator doing its job \u2014 not a bug. Markers at these specific context spots are the highest-value outputs ERD produces.' },
    ],
  },
  {
    scenario: 'ERD reads <strong>-18</strong> (effort exceeded result). MPR simultaneously reads <strong>TRAP</strong>. Why are these two readings confirming each other, and what\u2019s the confluence telling you?',
    options: [
      { text: 'They are detecting the same market pathology from different angles. ERD sees it directly: on this individual bar, volume is high and price didn\u2019t travel. MPR sees it in committed regime form: the stress condition (effort >> result) has been sustained long enough to meet its trap criteria. Both tools confirming absorption means the read is doubly robust \u2014 size down or stand aside.', correct: true, explain: 'Perfect. ERD is the bar-by-bar direct measurement; MPR\u2019s TRAP state is the committed-regime confirmation of the same phenomenon. When they agree, you\u2019re seeing absorption validated at two different timescales and by two different computational paths. This is exactly the kind of cross-oscillator confluence that produces high-conviction reads. Disagreement between them would be more interesting (a transient effort-result spike that didn\u2019t sustain); agreement is conviction.' },
      { text: 'They contradict each other \u2014 ignore both', correct: false, explain: 'They\u2019re agreeing, not contradicting. ERD sees per-bar absorption. MPR\u2019s TRAP state is sustained absorption committed across 3+ bars. Same phenomenon, different presentations. When two independent diagnostic paths converge on the same conclusion, that\u2019s the strongest possible confirmation.' },
    ],
  },
  {
    scenario: 'You\u2019re reviewing two tickers. <strong>AAPL</strong>: ERD = +30, z-score = 0.4 (ordinary). <strong>Small-cap stock</strong>: ERD = +30, z-score = +2.8 (VACUUM marker fires). The raw ERD value is the same. What does this tell you about how to use ERD?',
    options: [
      { text: 'Raw ERD values are not comparable across instruments. What matters is the z-score, which normalizes for each instrument\u2019s own ERD distribution. The small cap is experiencing a statistically unusual light-volume move (possibly illiquidity-driven, possibly an early-stage breakout) while AAPL is doing something totally ordinary. Treat the marker as the signal, not the raw value.', correct: true, explain: 'This is the Dual-Timescale Doctrine made concrete. AAPL trades 50M+ shares daily; its normal ERD distribution has very different characteristics from a small cap trading 500K shares. The same raw ERD of +30 is contextually meaningless without reference to each instrument\u2019s history. The z-score does that normalization. In AAPL, +30 is signal noise; in the small cap, +30 is a 5%-probability event. This is why the marker is what you watch, not the histogram color.' },
      { text: 'Both readings mean the same thing', correct: false, explain: 'This is the assumption that breaks down across instruments. Raw ERD values are NOT directly comparable because each instrument has its own volume-to-volatility relationship, its own typical bar-level efficiency, its own characteristic ERD distribution. The z-score overlay exists specifically to make readings comparable. Ignore it and you\u2019ll chase noise on liquid names and miss signals on illiquid ones.' },
    ],
  },
  {
    scenario: 'You\u2019re trading FX (EURUSD). You notice ERD rarely produces large values \u2014 the histogram barely exceeds \u00b120, and markers are rare. MPR and VSI are producing plenty of signals. Is ERD broken on FX?',
    options: [
      { text: 'Not broken \u2014 behaving as it should, because FX volume on retail data feeds is often tick volume (not real transacted volume). This makes the &ldquo;effort&rdquo; component less meaningful, and the effortCap and resultCap defaults calibrated for equities/crypto don\u2019t produce the same dynamic range on FX. Adjust effortCap lower (e.g., 2.0) and resultCap lower (e.g., 0.7) to rescale. OR lean more heavily on MPR\u2019s Volume Fallback Doctrine which handles FX internally.', correct: true, explain: 'This is a known limitation of volume-based indicators on FX. MPR was specifically designed to handle this gracefully via its Volume Fallback Doctrine (cross-asset 3-layer cascade). ERD has no such fallback \u2014 it\u2019s a direct volume/move indicator, so on FX it works best when retuned to match the instrument\u2019s cadence. On high-volatility crypto/equities, the defaults are well-calibrated. On tight-range FX, shrink the caps and you\u2019ll get the same dynamic range out of the indicator. Or accept that on FX, MPR is your primary effort-based tool and ERD plays a supporting role.' },
      { text: 'ERD is broken on FX, switch indicators entirely', correct: false, explain: 'Not broken \u2014 miscalibrated for the asset. The caps are tunable specifically because different asset classes have different effort/result distributions. On FX, shrink them to restore the dynamic range. This is a tuning problem, not an architectural problem.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The Effort component of ERD is calculated as:', opts: ['Price / ATR', 'volume / SMA(volume, 20), mapped to 0\u2013100 via effortCap (default 3.0)', 'ATR change', 'Close minus Open'], correct: 1, explain: 'Exact Pine source: effortRatio = volume / avgVol where avgVol = SMA(volume, 20). Then effort100 = clamp100(100 \u00d7 ratio / effortCap). Volume at 3\u00d7 average maps to 100 effort.' },
  { q: 'The Result component of ERD is calculated as:', opts: ['Volume / Average Volume', '|close - close[1]| / ATR(14), mapped to 0\u2013100 via resultCap (default 1.0)', 'Price relative to VWAP', 'RSI value'], correct: 1, explain: 'Exact Pine source: resultRatio = |close - close[1]| / ATR. Then result100 = clamp100(100 \u00d7 ratio / resultCap). Price moving a full ATR in one bar maps to 100 result.' },
  { q: 'The ERD score is:', opts: ['result100 + effort100', 'result100 - effort100 (bipolar, approximately -100 to +100)', 'effort100 divided by result100', 'The absolute difference'], correct: 1, explain: 'Exact source: erd = result100 - effort100. Positive when result exceeds effort (vacuum), negative when effort exceeds result (absorption). The sign carries the Wyckoff meaning directly.' },
  { q: 'POSITIVE ERD (teal) means:', opts: ['Price went up', 'Result exceeded Effort \u2014 VACUUM \u2014 thin-volume move (price ran on light effort)', 'Volume was high', 'Bullish trend'], correct: 1, explain: 'Sign convention: positive = vacuum (efficient move relative to effort applied). A thin-volume breakout produces positive ERD. Note: this says nothing about direction \u2014 a thin-volume DOWN move also produces positive ERD.' },
  { q: 'NEGATIVE ERD (magenta) means:', opts: ['Bearish signal', 'Effort exceeded Result \u2014 ABSORPTION \u2014 heavy volume with little price travel', 'Stop out', 'Reverse trend'], correct: 1, explain: 'Sign convention: negative = absorption (volume being applied but price not traveling). Often seen near support/resistance where the opposing side is absorbing the aggressor\u2019s effort. Signature of potential reversals in context.' },
  { q: 'Event markers (circles) fire when:', opts: ['ERD crosses zero', 'The z-score of ERD over the last 100 bars exceeds \u00b12\u03C3', 'Price breaks a level', 'Volume doubles'], correct: 1, explain: 'Exact source: absorptionEvent fires when zScore \u2264 -zThr. vacuumEvent fires when zScore \u2265 +zThr. zThr defaults to 2.0. This is the statistical overlay that distinguishes truly unusual bars from routine noise.' },
  { q: 'The Dual-Timescale Doctrine states that:', opts: ['ERD should be run on two timeframes', 'ERD combines an instantaneous bar reading (color) with a contextual statistical overlay (markers), so the SAME raw value can mean very different things depending on the instrument\u2019s 100-bar history', 'You should use ERD only on daily charts', 'The indicator lags by 2 bars'], correct: 1, explain: 'The defining insight: context matters more than magnitude. Raw ERD of +30 in an instrument whose 100-bar mean is +40 is below normal; the same +30 in an instrument whose mean is -20 is a statistical earthquake. The markers normalize for context where the histogram cannot.' },
  { q: 'On FX majors, ERD often produces muted readings because:', opts: ['FX doesn\u2019t move', 'Tick volume on retail FX data is a weaker effort proxy than real volume on equities/crypto, and default caps don\u2019t match FX dynamic range \u2014 retune or rely more on MPR\u2019s Volume Fallback Doctrine', 'The indicator is broken on FX', 'FX has no volatility'], correct: 1, explain: 'Volume-based indicators face this known limitation on FX. ERD has no internal fallback (unlike MPR). The operational responses: (1) retune effortCap and resultCap lower to match FX cadence, OR (2) lean on MPR as the primary effort-based tool since its Volume Fallback Doctrine handles this architecturally.' },
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
export default function ERDDeepDiveLesson() {
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
    { wrong: 'Reading ERD as a directional signal', right: 'ERD is a bar-QUALITY metric, not a direction metric. Positive = efficient move (vacuum), negative = inefficient move (absorption) \u2014 but both can occur in either direction. A thin-volume DOWN move is also positive ERD. A heavy-volume UP stall is also negative ERD. Direction comes from MPR, MSI, or price action. Don\u2019t mistake ERD\u2019s sign for bullish/bearish.', icon: '\u{1F9ED}' },
    { wrong: 'Trading every colored bar', right: 'The histogram colors every bar teal or magenta. Most bars are noise. The SIGNAL is the circle markers (z-score \u2265 ±2) \u2014 about 5% of bars by statistical definition. Trading on raw histogram color is drinking from a firehose of non-events. Filter to the markers.', icon: '\u{1F3AF}' },
    { wrong: 'Comparing raw ERD values across instruments', right: 'ERD of +30 on AAPL is noise. ERD of +30 on a thinly-traded small cap might be a 2.5\u03C3 event. Raw values are not cross-instrument comparable because each name has its own volume/volatility distribution. The z-score layer exists to normalize \u2014 USE IT. This is the whole point of the Dual-Timescale Doctrine.', icon: '\u{1F4CA}' },
    { wrong: 'Expecting ERD to work with default caps on every asset', right: 'effortCap (3.0) and resultCap (1.0) are calibrated for medium-to-high-volatility equities/crypto. On FX majors, dynamic range compresses and the indicator goes mute. On very high-volatility small caps, values pin at \u00b1100 constantly. Retune the caps per instrument class. The caps are tunable as inputs precisely because no single default fits every market.', icon: '\u{2699}' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 9</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Effort-Result<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Divergence</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The direct oscillator. Wyckoff\u2019s oldest question \u2014 did effort produce result? \u2014 translated into a bipolar score with a statistical overlay that fires only on the rare bars that actually matter.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Direct Oscillator</p>
            <p className="text-gray-400 leading-relaxed mb-4">Of all the sub-pane oscillators in the ATLAS suite, ERD is the most <strong className="text-white">conceptually primitive</strong>. It asks the question Wyckoff asked a century ago: <em>&ldquo;did the effort applied this bar produce proportional result?&rdquo;</em> It reduces that question to its simplest possible expression: volume divided by average, minus price move divided by ATR. No regime inference. No state classification. No persistence contract. Just a signed score every bar, updated live.</p>
            <p className="text-gray-400 leading-relaxed mb-4">What makes it <em>not</em> primitive is the layer on top: a <strong className="text-amber-400">z-score statistical overlay</strong> that marks only the bars where the effort/result relationship is genuinely unusual for the instrument\u2019s own recent history. The histogram is noisy by design \u2014 every bar gets a color. The markers are signal, filtered to roughly the 5% of bars that statistically matter. These two readings operating at different timescales is the indicator\u2019s entire personality.</p>
            <p className="text-gray-400 leading-relaxed">Where MPR asks &ldquo;what regime are we in?&rdquo; and VSI asks &ldquo;where is volatility going?&rdquo;, ERD asks &ldquo;is this specific bar behaving ordinarily or strangely?&rdquo; That specific-bar question is the missing third leg of the oscillator family \u2014 and ERD is the only tool that answers it.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE ERD AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every bar has a cost (effort) and an outcome (result). ERD measures the difference per bar and the statistical rarity of that difference over 100 bars. The signal lives in the rare readings, not the common ones.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Wyckoff&apos;s Question</p>
          <h2 className="text-2xl font-extrabold mb-4">Did Effort Produce Result?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Wyckoff\u2019s framework, stated in modern terms, proposes a 2x2 matrix: effort can be high or low, and result can be high or low. The four combinations have specific meanings. <strong className="text-white">High effort + low result = absorption</strong> (opposing side is soaking up the aggressor). <strong className="text-white">Low effort + high result = vacuum</strong> (thin air, price ran unopposed). High effort + high result = clean participation. Low effort + low result = quiet. ERD lives in this matrix.</p>
          <WyckoffMatrixAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why This Matrix Is The Foundation</p>
            <p className="text-sm text-gray-400">The quadrants aren\u2019t an arbitrary categorization \u2014 they correspond to real, distinguishable market behaviors. Absorption patterns near support are reversal precursors. Vacuum moves in trends are continuation setups. Clean participation is baseline trending. Quiet is noise. A single signed number (ERD) collapses this 2D matrix onto its most informative diagonal: vacuum (positive) vs absorption (negative), with the low-effort/low-result quiet bars clustering near zero.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Effort Component</p>
          <h2 className="text-2xl font-extrabold mb-4">Volume Relative to Its Own Average</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The effort side: <code className="text-white">effortRatio = volume / SMA(volume, 20)</code>, then mapped to 0-100 via <code className="text-white">effortCap</code> (default 3.0). A volume-ratio of 3x average = 100 effort. A ratio of 0.5x = ~17 effort. The normalization makes effort comparable across bars despite volume fluctuating wildly in absolute terms.</p>
          <EffortComponentAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Divide by the Rolling Average</p>
            <p className="text-sm text-gray-400">Raw volume is scale-dependent and useless for comparison: AAPL has different absolute volume than BNB which differs from EURUSD. Dividing by SMA(volume, 20) gives you a ratio that is <em>self-referential to each instrument</em>. A reading of 2.5x means &ldquo;2.5 times this instrument\u2019s normal&rdquo; regardless of what absolute volume means on that ticker. This is the same design philosophy as VSI\u2019s percent-based output.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Result Component</p>
          <h2 className="text-2xl font-extrabold mb-4">Price Move Relative to ATR</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The result side: <code className="text-white">resultRatio = |close - close[1]| / ATR(14)</code>, mapped to 0-100 via <code className="text-white">resultCap</code> (default 1.0). A bar that moves a full ATR in one bar = 100 result. A bar that moves half an ATR = 50. Same self-referential normalization as effort \u2014 each instrument\u2019s ATR is the comparison baseline, making result comparable across assets.</p>
          <ResultComponentAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Absolute Value</p>
            <p className="text-sm text-gray-400">Notice the formula uses <code className="text-white">|close - close[1]|</code> \u2014 absolute value. Direction is deliberately discarded in the result calculation. ERD measures the MAGNITUDE of the move, not its sign. This is why ERD is not a directional signal: a 2% up-move and a 2% down-move produce identical result100 values. Direction is the job of other oscillators; ERD\u2019s job is efficiency.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Bipolar Score</p>
          <h2 className="text-2xl font-extrabold mb-4">ERD = Result &minus; Effort</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The central equation: <code className="text-white">erd = result100 - effort100</code>. Because both components are bounded 0-100, the output naturally lives in approximately -100 to +100. Positive means result beats effort (vacuum). Negative means effort beats result (absorption). Zero means balanced. The bipolar form is the simplest possible encoding of the Wyckoff distinction.</p>
          <BipolarERDAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Subtraction Not Division</p>
            <p className="text-sm text-gray-400">An alternative formulation would be <code className="text-white">result / effort</code> as a ratio. The ATLAS choice to use subtraction is deliberate: ratios behave badly near zero (tiny effort produces huge ratios; tiny result produces tiny ratios). Subtraction stays well-bounded regardless. And the subtraction form is directly interpretable on a symmetric bipolar scale \u2014 no need to take log ratios or apply transformations.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Reading the Sign</p>
          <h2 className="text-2xl font-extrabold mb-4">Vacuum vs Absorption in Practice</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Concrete examples of each sign. <strong className="text-white">VACUUM (+ERD)</strong>: price breaking out on steadily declining volume. The market is moving but few participants are engaged. These moves can be fragile (no sponsorship) or meaningful (offers just don\u2019t exist). Context decides. <strong className="text-white">ABSORPTION (-ERD)</strong>: price oscillating in a tight range while volume spikes. Aggressors are trying to move price but someone is taking the other side. Often precedes reversals when the absorption completes.</p>
          <SignConventionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Neither Sign Is Automatically Bullish or Bearish</p>
            <p className="text-sm text-gray-400">A critical point worth stating twice: ERD signs describe <em>efficiency</em>, not direction. You can have positive ERD on a down move (thin-volume selloff), and negative ERD on an up move (heavy-volume stall at resistance). The sign tells you whether the effort produced proportional movement; the DIRECTION of that movement is a separate question, answered by other tools.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Statistical Layer</p>
          <h2 className="text-2xl font-extrabold mb-4">The Z-Score Overlay</h2>
          <p className="text-gray-400 leading-relaxed mb-6">On top of the raw ERD output sits a z-score calculation: <code className="text-white">zScore = (erd - SMA(erd, 100)) / stdev(erd, 100)</code>. This tells you how many standard deviations the current bar is from the 100-bar average \u2014 <strong className="text-white">for this specific instrument</strong>. A z-score of +1 is a mild excursion. +2 is in the 2.5% tail. +3 is the 0.15% tail. The ±2 threshold (default) is where event markers fire.</p>
          <ZScoreStatAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 100 Bars</p>
            <p className="text-sm text-gray-400">The lookback of 100 bars is calibrated to span about a week of 1H data, or roughly 5 months of daily data. It\u2019s long enough to build a statistically meaningful distribution but short enough that changing market regimes don\u2019t permanently skew the baseline. You can tune it \u2014 shorter (50) for faster adaptation to regime shifts, longer (200) for more statistical stability.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Event Markers</p>
          <h2 className="text-2xl font-extrabold mb-4">Circles Are The Signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The histogram shows every bar\u2019s raw ERD value. The event markers (plotted as circles) fire only when the z-score crosses ±2. Statistically, this is about 5% of bars. Functionally, these are the moments ERD is actively telling you &ldquo;something unusual is happening here.&rdquo; Teal circles = vacuum event. Magenta circles = absorption event. Everything else is background context.</p>
          <EventMarkersAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The 5% Filter Is The Point</p>
            <p className="text-sm text-gray-400">Most oscillators scream at you constantly \u2014 every bar has a signal. ERD deliberately filters to the statistically unusual. If you look at a chart and see no markers, that means the market has been behaving ordinarily for the last 100 bars. If you see a cluster of markers, something is fundamentally different about the current regime. The absence of markers is itself information.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Dual-Timescale Doctrine &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Context Matters More Than Magnitude</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the conceptual breakthrough ERD introduces to the ATLAS suite. Every indicator you\u2019ve seen so far operates on a <strong className="text-white">single timescale</strong>. A 20 EMA is one smoothing window. A 14 RSI is one lookback. MPR\u2019s persistence contract is 3 bars. All single-timescale. ERD explicitly combines <strong className="text-white">two different timescales at once</strong>: the histogram color is the instantaneous bar-by-bar reading; the event markers are the rolling 100-bar statistical overlay.</p>
          <DualTimescaleAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Dual-Timescale Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">The defining insight: <strong className="text-white">the same raw ERD value carries entirely different information depending on the instrument\u2019s own recent history</strong>. A reading of +30 on an instrument whose 100-bar mean is +40 is actually <em>below normal</em> for that instrument \u2014 z-score around -1.2, no marker fires, this is subpar for this name. That same +30 on an instrument whose 100-bar mean is -20 is a statistically striking departure \u2014 z-score around +2.6, vacuum marker fires, this is remarkable. The histogram gives you The Moment. The z-score gives you The Context. Both are reading the same number. They disagree because they\u2019re answering different questions.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Volume analysis becomes context-aware.</strong> Absolute volume values are uninformative \u2014 500K shares is nothing on AAPL and an earthquake on a microcap. Volume z-scores are everything. ERD encodes this for you automatically via the ±2\u03C3 event filter. You never again need to ask &ldquo;is this volume unusual?&rdquo; \u2014 the marker answers it.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Risk management scales with statistical rarity.</strong> When z-score spikes to ±2+, you\u2019re by definition in the tails of the distribution. The safest response: reduce position size until the anomaly is explained. Unusual readings mean your normal strategy\u2019s assumptions might not hold. Dampen conviction when the chart is behaving in statistically unusual ways.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Alpha hunting focuses on the 5%.</strong> By mathematical definition, |z| ≥ 2 bars are approximately 5% of all bars. These 5% are where the informational asymmetry lives \u2014 where price discovery is happening, where something non-random is unfolding. Skip the other 95%. ERD is the indicator that pre-filters for you.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Reading Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">Vacuum Breakouts and Absorption Stalls</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Two archetypal patterns worth recognizing. <strong className="text-white">Vacuum breakout</strong>: price grinds upward while volume tapers off \u2014 ERD climbs steadily positive, eventually a vacuum marker fires. The market is moving without sponsorship. These can be very clean trades (no one defending the level) or very fragile (no one confirming the move). Context and regime decide. <strong className="text-white">Absorption stall</strong>: price chops sideways while volume is heavy \u2014 ERD plunges negative, absorption marker fires. The aggressors are being denied. Often a reversal precursor when it happens at an obvious level.</p>
          <ReadingPatternsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Pattern Recognition Scales With Experience</p>
            <p className="text-sm text-gray-400">Both patterns are easy to name but nuanced to trade. Vacuum breakouts near key levels with MPR in RELEASE and VSI in EXPANSION are among the highest-quality breakout setups in the suite. Absorption stalls at support with MPR in TRAP and price rejecting the level are among the highest-quality reversal setups. The indicator is objective; the interpretation comes from combining it with regime, level, and price action.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; ERD vs MPR</p>
          <h2 className="text-2xl font-extrabold mb-4">Both Measure Effort. Very Differently.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Both oscillators incorporate effort as a core input, but they use it in fundamentally different ways. <strong className="text-white">ERD is direct and instantaneous</strong> \u2014 it reports the current bar\u2019s effort-result relationship every bar, with no state inference. <strong className="text-white">MPR is committed and regime-based</strong> \u2014 it uses the same effort-minus-result quantity (as its stress score) but embeds it inside a broader 4-state classifier with persistence filtering. When they agree, you\u2019re seeing the same phenomenon confirmed at two timescales. When they disagree, ERD is showing you a moment that hasn\u2019t sustained long enough to become a regime.</p>
          <ERDvsMPRAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; When to Prefer Which</p>
            <p className="text-sm text-gray-400">Use <strong className="text-white">ERD</strong> when you want per-bar granularity and statistical event detection \u2014 especially for precise entry timing and divergence-hunting. Use <strong className="text-white">MPR</strong> when you want committed regime readings that you can plan around over multiple bars. They\u2019re complementary, not redundant. The sweet spot is using MPR for regime and ERD for entry precision within that regime.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Full Oscillator Picture</p>
          <h2 className="text-2xl font-extrabold mb-4">ERD \u00d7 MPR \u00d7 VSI</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All three sub-pane oscillators stacked give you the complete diagnostic layer. <strong className="text-white">ERD</strong> = per-bar effort-result efficiency. <strong className="text-white">MPR</strong> = committed directional pressure regime. <strong className="text-white">VSI</strong> = volatility trajectory. They measure orthogonal properties, so their agreement or disagreement carries specific meaning. Full confluence (all pointing the same way) is rare; nuanced agreement (two out of three) is common; divergence among them (three different readings) is where deep-read opportunities live.</p>
          <ConfluenceStackAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Reading Confluence Like a Tape Reader</p>
            <p className="text-sm text-gray-400">Strongest breakout environment: ERD marker fires (vacuum) + MPR in RELEASE + VSI in EXPANSION + price crossing a level. All three tools, different timescales, all aligned. Strongest reversal signature: ERD marker fires (absorption) + MPR in TRAP + VSI in TRANSITION + price rejecting a level. Again, all three tools providing independent confirmation via different mechanisms. This is the power of orthogonal oscillators: they can\u2019t all be wrong simultaneously because they\u2019re measuring different things.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Tuning the Caps</p>
          <h2 className="text-2xl font-extrabold mb-4">effortCap and resultCap Per Asset Class</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The two cap parameters control how the raw ratios map to the 0-100 scale. <code className="text-white">effortCap=3.0</code> means volume 3x average saturates effort100 at 100. <code className="text-white">resultCap=1.0</code> means price moving a full ATR saturates result100 at 100. These defaults are calibrated for medium-to-high-volatility equities and crypto. On FX majors, ATR-multiple moves above 0.5-0.7 are rare; on high-volatility small caps, volume spikes of 5-10x are common. Retune per asset class to restore dynamic range.</p>
          <CapParameterAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Cap Balance Rule</p>
            <p className="text-sm text-gray-400">The goal is to see ERD occasionally reach ±60 but rarely ±100. If your histogram is pinned at ±100 most of the time, caps are too tight. If it barely exceeds ±20, caps are too loose. For FX majors: <code className="text-white">effortCap ≈ 2.0, resultCap ≈ 0.7</code>. For high-vol small caps: <code className="text-white">effortCap ≈ 5.0, resultCap ≈ 1.5</code>. For standard equities/crypto: defaults work. Critically: DON\u2019T set effort and result caps asymmetrically relative to each instrument\u2019s behavior \u2014 you\u2019ll introduce bias in the resulting ERD sign distribution.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse ERD</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake stems from treating ERD as something it isn\u2019t \u2014 a direction signal, a trading trigger, a cross-instrument comparable, or a one-size-fits-all tool.</p>
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

      {/* === S14 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">ERD In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Architecture</p>
                <p className="text-sm text-gray-300">Sub-pane oscillator, bipolar continuous histogram + sparse event markers, no persistence filter (every bar is a reading).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Formula</p>
                <p className="text-sm text-gray-300">erd = result100 - effort100. Effort = volume / SMA(volume, 20). Result = |close - close[1]| / ATR(14). Both mapped to 0\u2013100 via caps.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Sign Convention</p>
                <p className="text-sm text-gray-300">+ERD (teal) = result exceeded effort = VACUUM. \u2212ERD (magenta) = effort exceeded result = ABSORPTION. Sign is about efficiency, not direction.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Statistical Layer</p>
                <p className="text-sm text-gray-300">zScore over 100 bars. Markers fire when |z| \u2265 2.0. Approximately 5% of bars.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Dual-Timescale Doctrine (\u2605)</p>
                <p className="text-sm text-gray-300">Histogram = The Moment. Markers = The Context. Same value means different things depending on instrument history.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Cap Tuning</p>
                <p className="text-sm text-gray-300">Defaults (3.0 / 1.0) for equities/crypto. FX majors: (2.0 / 0.7). High-vol small caps: (5.0 / 1.5).</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Data Window Exports</p>
                <p className="text-sm text-gray-300">Effort (0\u2013100) \u00b7 Result (0\u2013100) \u00b7 ERD score \u00b7 Z-score \u00b7 Absorption event \u00b7 Vacuum event.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading ERD With Both Timescales</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you read ERD through both lenses simultaneously \u2014 the raw histogram and the statistical marker context \u2014 or whether you\u2019re still treating it as a single-timescale tool.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read ERD through both timescales. The Dual-Timescale Doctrine is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Dual-Timescale Doctrine section before the quiz.' : 'Re-study the z-score layer and the Dual-Timescale Doctrine before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S16 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Knowledge Check</p>
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\u00B1</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Effort-Result Divergence</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Dual-Timescale Diagnostician &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.9-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
