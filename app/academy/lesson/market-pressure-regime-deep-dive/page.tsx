// app/academy/lesson/market-pressure-regime-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.7: Market Pressure Regime Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PHASE 1: scaffold + 4 animations (4-state quadrant, compression, follow-through, stress)
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
// ANIMATION 1: The Four States (quadrant layout, non-ordinal)
// Shows why TRAP sits OFF the pressure axis, not on it
// ============================================================
function FourStatesQuadrantAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Four States \u2014 TRAP is OFF-Axis, Not On The Spectrum', w / 2, 14);

    // Draw a conceptual diagram:
    // Horizontal axis: Pressure (-100 → +100)
    // Vertical line: Stress (0 at bottom, high at top)
    // TRAP lives above the pressure axis

    const padL = 60;
    const padR = w - 30;
    const chartT = 40;
    const chartB = h - 40;
    const chartW = padR - padL;
    const chartH = chartB - chartT;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, chartT, chartW, chartH);

    // Pressure axis (horizontal, Y = 80% from top)
    const axisY = chartT + chartH * 0.75;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, axisY); ctx.lineTo(padR, axisY); ctx.stroke();
    // Arrowheads
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(padR, axisY); ctx.lineTo(padR - 5, axisY - 3); ctx.lineTo(padR - 5, axisY + 3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(padL, axisY); ctx.lineTo(padL + 5, axisY - 3); ctx.lineTo(padL + 5, axisY + 3);
    ctx.closePath(); ctx.fill();

    // Pressure axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRESSURE (-100 \u2194 +100)', padL, axisY + 22);

    // Zero tick
    const zeroX = padL + chartW / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(zeroX, axisY - 4); ctx.lineTo(zeroX, axisY + 4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('0', zeroX, axisY + 14);

    // Threshold ticks at ±5 of pressure range (scaled to display)
    const thrL = padL + chartW * 0.475;
    const thrR = padL + chartW * 0.525;
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(thrL, chartT); ctx.lineTo(thrL, axisY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(thrR, chartT); ctx.lineTo(thrR, axisY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('-5', thrL, axisY + 14);
    ctx.fillText('+5', thrR, axisY + 14);

    // SUPPRESSED zone (left of -5)
    ctx.fillStyle = 'rgba(138,138,138,0.12)';
    ctx.fillRect(padL, axisY - 30, thrL - padL, 30);
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SUPPRESSED', (padL + thrL) / 2, axisY - 14);
    ctx.fillStyle = 'rgba(138,138,138,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('grey \u2022 pinned', (padL + thrL) / 2, axisY - 4);

    // TRANSITION zone (between -5 and +5)
    ctx.fillStyle = 'rgba(249,168,37,0.12)';
    ctx.fillRect(thrL, axisY - 30, thrR - thrL, 30);
    ctx.fillStyle = 'rgba(249,168,37,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('TRANS.', (thrL + thrR) / 2, axisY - 16);
    ctx.fillStyle = 'rgba(249,168,37,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('amber', (thrL + thrR) / 2, axisY - 6);

    // RELEASE zone (right of +5)
    ctx.fillStyle = 'rgba(38,166,154,0.12)';
    ctx.fillRect(thrR, axisY - 30, padR - thrR, 30);
    ctx.fillStyle = 'rgba(38,166,154,0.95)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('RELEASE', (thrR + padR) / 2, axisY - 14);
    ctx.fillStyle = 'rgba(38,166,154,0.65)';
    ctx.font = '6px system-ui';
    ctx.fillText('teal \u2022 breaking', (thrR + padR) / 2, axisY - 4);

    // ===== TRAP STATE — Off-axis, elevated =====
    // Draw it as an elevated box ABOVE the pressure axis
    const trapY = chartT + 18;
    const trapH = 40;
    const trapW = chartW * 0.55;
    const trapX = padL + (chartW - trapW) / 2;

    const pulse = 0.15 + Math.sin(t * 3) * 0.1;
    ctx.fillStyle = `rgba(236,64,122,${pulse})`;
    ctx.fillRect(trapX, trapY, trapW, trapH);
    ctx.strokeStyle = '#EC407A';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(trapX, trapY, trapW, trapH);

    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u25B2 TRAP (OFF-AXIS)', trapX + trapW / 2, trapY + 18);
    ctx.fillStyle = 'rgba(236,64,122,0.85)';
    ctx.font = '7px system-ui';
    ctx.fillText('magenta \u2022 stress \u2265 30 AND follow \u2039 0.3', trapX + trapW / 2, trapY + 32);

    // Arrow showing TRAP is outside the spectrum
    ctx.strokeStyle = 'rgba(236,64,122,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(trapX + trapW / 2, trapY + trapH);
    ctx.lineTo(trapX + trapW / 2, axisY - 34);
    ctx.stroke();
    ctx.setLineDash([]);

    // Callout labels
    ctx.fillStyle = 'rgba(236,64,122,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('can coexist with any pressure value \u2192', trapX + 4, trapY - 5);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Compression Score — pinning proxy
// Shows tight range (high comp) vs expanded range (low comp)
// ============================================================
function CompressionScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Compression Score \u2014 The Pinning Proxy', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: compressed (tight range)
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMPRESSED \u2014 HIGH SCORE', mid / 2, 32);
    ctx.fillStyle = 'rgba(138,138,138,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('candle range \u2039 ATR \u00d7 0.5', mid / 2, 44);

    // Mini candles (tight)
    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 54;
    const chartB = h - 58;
    const chartH = chartB - chartT;
    const n = 12;
    const cw = (padLR - padLL) / n;

    for (let i = 0; i < n; i++) {
      const cx = padLL + (i + 0.5) * cw;
      const wobble = Math.sin(t + i * 0.3) * 1.2;
      const centerY = chartT + chartH * 0.5 + wobble;
      const range = chartH * 0.08;
      const open = centerY - range * 0.3;
      const close = centerY + range * 0.3;
      const high = centerY - range;
      const low = centerY + range;

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, high); ctx.lineTo(cx, low); ctx.stroke();
      ctx.fillStyle = Math.sin(t + i) > 0 ? 'rgba(38,166,154,0.75)' : 'rgba(236,64,122,0.75)';
      ctx.fillRect(cx - 3, Math.min(open, close), 6, Math.abs(close - open) + 1);
    }

    // ATR reference ghost (wider envelope)
    const atrTop = chartT + chartH * 0.35;
    const atrBot = chartT + chartH * 0.65;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, atrTop); ctx.lineTo(padLR, atrTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padLL, atrBot); ctx.lineTo(padLR, atrBot); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('ATR envelope', padLR - 2, atrTop - 3);

    // Score meter
    const meterY = chartB + 8;
    const meterW = padLR - padLL;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(padLL, meterY, meterW, 10);
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.fillRect(padLL, meterY, meterW * 0.85, 10);
    ctx.fillStyle = 'rgba(138,138,138,1)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('compression: 0.85', mid / 2, meterY + 22);

    // RIGHT: expanded
    ctx.fillStyle = 'rgba(38,166,154,0.95)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('EXPANDED \u2014 LOW SCORE', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(38,166,154,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('candle range \u203a ATR \u00d7 1.5', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const cwR = (padRR - padRL) / n;

    for (let i = 0; i < n; i++) {
      const cx = padRL + (i + 0.5) * cwR;
      const wobble = Math.sin(t * 0.5 + i * 0.5) * 4;
      const centerY = chartT + chartH * 0.5 + wobble;
      const range = chartH * 0.28;
      const open = centerY - range * 0.2;
      const close = centerY + range * 0.2;
      const high = centerY - range;
      const low = centerY + range;

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, high); ctx.lineTo(cx, low); ctx.stroke();
      ctx.fillStyle = i % 2 === 0 ? 'rgba(38,166,154,0.9)' : 'rgba(236,64,122,0.9)';
      ctx.fillRect(cx - 3, Math.min(open, close), 6, Math.abs(close - open) + 1);
    }

    // ATR ref
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padRL, atrTop); ctx.lineTo(padRR, atrTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padRL, atrBot); ctx.lineTo(padRR, atrBot); ctx.stroke();
    ctx.setLineDash([]);

    // Score meter
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(padRL, meterY, padRR - padRL, 10);
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.fillRect(padRL, meterY, (padRR - padRL) * 0.18, 10);
    ctx.fillStyle = 'rgba(38,166,154,1)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('compression: 0.18', mid + mid / 2, meterY + 22);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 3: Follow-Through Score — path efficiency
// MER-like — displacement / total path, 20-bar lookback
// ============================================================
function FollowThroughScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Follow-Through Score \u2014 Does the Move Actually Travel?', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: strong follow-through (trending)
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STRONG FOLLOW-THROUGH', mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('displacement \u2248 path \u2192 high release pressure', mid / 2, 44);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 54;
    const chartB = h - 38;
    const chartH = chartB - chartT;
    const n = 25;
    const xStepL = (padLR - padLL) / (n - 1);

    const lPrices: number[] = [];
    for (let i = 0; i < n; i++) lPrices.push(100 + i * 0.4 + Math.sin(i + t) * 0.5);

    const lMin = Math.min(...lPrices) - 1;
    const lMax = Math.max(...lPrices) + 1;
    const lR = lMax - lMin;
    const toYL = (v: number) => chartB - ((v - lMin) / lR) * (chartH - 8) - 4;

    // Path
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    lPrices.forEach((v, i) => { const x = padLL + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Displacement arrow
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padLL, toYL(lPrices[0]));
    ctx.lineTo(padLR, toYL(lPrices[n - 1]));
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate ratio
    const lDisp = Math.abs(lPrices[n - 1] - lPrices[0]);
    let lPath = 0;
    for (let i = 1; i < n; i++) lPath += Math.abs(lPrices[i] - lPrices[i - 1]);
    const lFollow = lPath > 0 ? lDisp / lPath : 0;

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`follow: ${lFollow.toFixed(2)}`, mid / 2, h - 16);

    // RIGHT: weak follow-through (chop)
    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('WEAK FOLLOW-THROUGH', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(236,64,122,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('path \u203a\u203a displacement \u2192 suppressed', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (n - 1);

    const rPrices: number[] = [];
    for (let i = 0; i < n; i++) rPrices.push(100 + Math.sin(i * 0.4 + t) * 3.5 + Math.cos(i * 0.7 + t) * 2);

    const rMin = Math.min(...rPrices) - 1;
    const rMax = Math.max(...rPrices) + 1;
    const rR = rMax - rMin;
    const toYR = (v: number) => chartB - ((v - rMin) / rR) * (chartH - 8) - 4;

    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    rPrices.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
    ctx.stroke();

    // Tiny displacement
    ctx.strokeStyle = '#EC407A';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padRL, toYR(rPrices[0]));
    ctx.lineTo(padRR, toYR(rPrices[n - 1]));
    ctx.stroke();
    ctx.setLineDash([]);

    const rDisp = Math.abs(rPrices[n - 1] - rPrices[0]);
    let rPath = 0;
    for (let i = 1; i < n; i++) rPath += Math.abs(rPrices[i] - rPrices[i - 1]);
    const rFollow = rPath > 0 ? rDisp / rPath : 0;

    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`follow: ${rFollow.toFixed(2)}`, mid + mid / 2, h - 16);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: Stress Score — the trap detector
// effort - result × 100. When effort spikes without result = trap signal.
// ============================================================
function StressScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stress Score \u2014 The Trap Detector (Effort - Result)', w / 2, 14);

    // Three vertical panels side-by-side
    const panels = [
      { label: 'BALANCED', effort: 0.5, result: 0.55, color: '#8A8A8A', stress: 'low', note: 'normal rotation' },
      { label: 'HIGH EFFORT, HIGH RESULT', effort: 0.9, result: 0.85, color: '#00B3A4', stress: 'low', note: 'clean breakout' },
      { label: 'HIGH EFFORT, LOW RESULT', effort: 0.9, result: 0.15, color: '#EC407A', stress: 'HIGH', note: 'TRAP signature' },
    ];

    const pW = (w - 50) / 3;
    const gap = 10;
    const pY = 32;
    const pH = h - 54;

    panels.forEach((p, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = p.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = p.color + '66';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, pY, pW, pH);

      // Title
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, x + pW / 2, pY + 14);

      // Effort vs Result bars
      const mY = pY + 28;
      const mH = pH - 76;
      const mW = (pW - 30) / 2;

      // Effort
      const pulseE = 0.85 + Math.sin(t * 3 + i) * 0.15;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 8, mY, mW, mH);
      const eFill = mH * p.effort * pulseE;
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.fillRect(x + 8, mY + mH - eFill, mW, eFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('EFFORT', x + 8 + mW / 2, mY - 3);
      ctx.fillText(p.effort.toFixed(2), x + 8 + mW / 2, mY + mH + 9);

      // Result
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + pW - 8 - mW, mY, mW, mH);
      const rFill = mH * p.result;
      ctx.fillStyle = 'rgba(14,165,233,0.7)';
      ctx.fillRect(x + pW - 8 - mW, mY + mH - rFill, mW, rFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText('RESULT', x + pW - 8 - mW / 2, mY - 3);
      ctx.fillText(p.result.toFixed(2), x + pW - 8 - mW / 2, mY + mH + 9);

      // Stress readout
      const stress = (p.effort - p.result) * 100;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`stress: ${stress.toFixed(0)}`, x + pW / 2, pY + pH - 26);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(p.note, x + pW / 2, pY + pH - 12);

      // Trap threshold line
      if (i === 2) {
        // Show threshold crossed
        const pulse = 0.5 + Math.sin(t * 5) * 0.3;
        ctx.strokeStyle = `rgba(236,64,122,${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x - 2, pY - 2, pW + 4, pH + 4);
        ctx.stroke();
      }
    });

    // Footer formula
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stress = (effort - result) \u00d7 100  \u00b7  Trap threshold: stress \u2265 30 AND follow \u2039 0.30', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: Composite Pressure Formula — 6-stage cascade
// ============================================================
function PressureFormulaAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Composite Pressure = Follow\u00d7100 - Compression\u00d7100', w / 2, 14);

    const followScore = 0.45 + Math.sin(t) * 0.25;
    const compression = 0.35 + Math.sin(t * 0.8 + 1) * 0.25;
    const pressure = Math.max(-100, Math.min(100, followScore * 100 - compression * 100));

    const startX = 20;
    const boxW = (w - 90) / 3;
    const boxH = h - 60;
    const boxY = 32;
    const gap = 12;

    // Box 1: Follow score × 100
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(startX, boxY, boxW, boxH);
    ctx.strokeStyle = '#00B3A4';
    ctx.strokeRect(startX, boxY, boxW, boxH);

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FOLLOW \u00d7 100', startX + boxW / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('positive contribution', startX + boxW / 2, boxY + 28);

    const m1Y = boxY + 42;
    const m1H = boxH - 60;
    ctx.fillStyle = 'rgba(38,166,154,0.2)';
    ctx.fillRect(startX + boxW / 2 - 14, m1Y, 28, m1H);
    ctx.fillStyle = '#00B3A4';
    ctx.fillRect(startX + boxW / 2 - 14, m1Y + m1H - m1H * followScore, 28, m1H * followScore);
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText((followScore * 100).toFixed(0), startX + boxW / 2, boxY + boxH - 12);

    // Minus sign
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText('\u2212', startX + boxW + gap / 2, boxY + boxH / 2 + 5);

    // Box 2: Compression × 100
    const box2X = startX + boxW + gap;
    ctx.fillStyle = 'rgba(138,138,138,0.08)';
    ctx.fillRect(box2X, boxY, boxW, boxH);
    ctx.strokeStyle = '#8A8A8A';
    ctx.strokeRect(box2X, boxY, boxW, boxH);

    ctx.fillStyle = '#C8C8C8';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('COMP \u00d7 100', box2X + boxW / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('negative contribution', box2X + boxW / 2, boxY + 28);

    ctx.fillStyle = 'rgba(138,138,138,0.2)';
    ctx.fillRect(box2X + boxW / 2 - 14, m1Y, 28, m1H);
    ctx.fillStyle = '#8A8A8A';
    ctx.fillRect(box2X + boxW / 2 - 14, m1Y + m1H - m1H * compression, 28, m1H * compression);
    ctx.fillStyle = '#C8C8C8';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText((compression * 100).toFixed(0), box2X + boxW / 2, boxY + boxH - 12);

    // Equals
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText('=', box2X + boxW + gap / 2, boxY + boxH / 2 + 5);

    // Box 3: Pressure (signed bipolar)
    const box3X = box2X + boxW + gap;
    const box3W = w - box3X - 20;
    ctx.fillStyle = 'rgba(245,158,11,0.1)';
    ctx.fillRect(box3X, boxY, box3W, boxH);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(box3X, boxY, box3W, boxH);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('PRESSURE', box3X + box3W / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('(-100 \u2194 +100)', box3X + box3W / 2, boxY + 28);

    // Bipolar meter: zero at center
    const m3X = box3X + box3W / 2 - 20;
    const m3Y = boxY + 42;
    const m3H = boxH - 60;
    const m3W = 40;
    const m3Mid = m3Y + m3H / 2;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(m3X, m3Y, m3W, m3H);
    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(m3X - 3, m3Mid); ctx.lineTo(m3X + m3W + 3, m3Mid); ctx.stroke();

    // Fill from center
    const pressureRatio = pressure / 100;
    const fillColor = pressure >= 0 ? '#00B3A4' : '#EC407A';
    ctx.fillStyle = fillColor;
    if (pressure >= 0) {
      const fillH = (m3H / 2) * pressureRatio;
      ctx.fillRect(m3X, m3Mid - fillH, m3W, fillH);
    } else {
      const fillH = (m3H / 2) * Math.abs(pressureRatio);
      ctx.fillRect(m3X, m3Mid, m3W, fillH);
    }

    // Threshold lines
    const thrUp = m3Mid - (m3H / 2) * 0.05;
    const thrDn = m3Mid + (m3H / 2) * 0.05;
    ctx.strokeStyle = 'rgba(245,158,11,0.55)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(m3X - 3, thrUp); ctx.lineTo(m3X + m3W + 3, thrUp); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m3X - 3, thrDn); ctx.lineTo(m3X + m3W + 3, thrDn); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('+5', m3X + m3W + 4, thrUp + 2);
    ctx.fillText('-5', m3X + m3W + 4, thrDn + 2);

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+100', m3X - 4, m3Y + 4);
    ctx.fillText('0', m3X - 4, m3Mid + 2);
    ctx.fillText('-100', m3X - 4, m3Y + m3H - 1);

    ctx.fillStyle = fillColor;
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText((pressure >= 0 ? '+' : '') + pressure.toFixed(0), box3X + box3W / 2, boxY + boxH - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 6: Stability Filter — flip-rate
// ============================================================
function StabilityFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stability Filter \u2014 How Often Does Pressure Flip Sign?', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: stable pressure (low flip rate)
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STABLE \u2014 HIGH SCORE', mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('flip rate \u2039 0.5 \u2192 consistent regime', mid / 2, 44);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 56;
    const chartB = h - 40;
    const chartH = chartB - chartT;
    const mid1 = chartT + chartH / 2;
    const n = 30;

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, mid1); ctx.lineTo(padLR, mid1); ctx.stroke();
    ctx.setLineDash([]);

    // Mostly positive bars with one or two flips
    const lVals: number[] = [];
    for (let i = 0; i < n; i++) {
      // Mostly positive, low amplitude flips
      lVals.push(25 + Math.sin(i * 0.3 + t) * 10 + (i === 7 || i === 22 ? -40 : 0));
    }

    const xStepL = (padLR - padLL) / n;
    let flipsL = 0;
    for (let i = 1; i < n; i++) {
      if (Math.sign(lVals[i]) !== Math.sign(lVals[i - 1])) flipsL++;
    }
    const stabL = 1 - flipsL / n;

    lVals.forEach((v, i) => {
      const x = padLL + i * xStepL;
      const barY = v >= 0 ? mid1 - (v / 50) * (chartH / 2) : mid1;
      const barH = Math.abs(v / 50) * (chartH / 2);
      ctx.fillStyle = v >= 0 ? 'rgba(0,179,164,0.8)' : 'rgba(236,64,122,0.8)';
      ctx.fillRect(x + 0.5, barY, xStepL - 1, barH);
    });

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`stability: ${stabL.toFixed(2)}`, mid / 2, h - 16);

    // RIGHT: unstable (high flip rate)
    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('UNSTABLE \u2014 LOW SCORE', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(249,168,37,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('flip rate \u203a 0.5 \u2192 forced TRANSITION', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / n;
    const mid2 = mid1;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padRL, mid2); ctx.lineTo(padRR, mid2); ctx.stroke();
    ctx.setLineDash([]);

    const rVals: number[] = [];
    for (let i = 0; i < n; i++) {
      rVals.push(Math.sin(i * 0.9 + t) * 25 + Math.cos(i * 0.6 + t) * 15);
    }
    let flipsR = 0;
    for (let i = 1; i < n; i++) {
      if (Math.sign(rVals[i]) !== Math.sign(rVals[i - 1])) flipsR++;
    }
    const stabR = Math.max(0, 1 - flipsR / n);

    rVals.forEach((v, i) => {
      const x = padRL + i * xStepR;
      const barY = v >= 0 ? mid2 - (v / 50) * (chartH / 2) : mid2;
      const barH = Math.abs(v / 50) * (chartH / 2);
      ctx.fillStyle = v >= 0 ? 'rgba(0,179,164,0.8)' : 'rgba(236,64,122,0.8)';
      ctx.fillRect(x + 0.5, barY, xStepR - 1, barH);
    });

    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`stability: ${stabR.toFixed(2)}`, mid + mid / 2, h - 16);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: THE PERSISTENCE CONTRACT (★ GROUNDBREAKING)
// Candidate state must appear persistBars times before confirming
// ============================================================
function PersistenceContractAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Persistence Contract \u2605', w / 2, 14);

    // Top: bar-by-bar candidate tracking
    const padL = 30;
    const padR = w - 15;
    const laneY = 40;
    const laneH = 30;
    const laneW = padR - padL;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RAW STATE (per bar)', padL, laneY - 4);

    // Raw states per bar — simulate a detection sequence
    // Pattern: RELEASE candidate appears but flickers; then stays for 3+ bars and confirms
    const bars = 22;
    const bW = laneW / bars;
    const cycle = Math.floor((t * 0.3) % 1 * 18);

    // Define the sequence: flicker at start, stable later
    const rawSeq = [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // 0=trans, 1=release

    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const state = rawSeq[i];
      const color = state === 1 ? '#00B3A4' : '#F9A825';
      const active = i <= cycle;
      ctx.fillStyle = color + (active ? '99' : '22');
      ctx.fillRect(x + 1, laneY, bW - 2, laneH);
    }

    // Legend for raw lane
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u25A0 raw: release candidate', padL, laneY + laneH + 10);
    ctx.fillStyle = 'rgba(249,168,37,0.85)';
    ctx.fillText('\u25A0 raw: transition', padL + 130, laneY + laneH + 10);

    // Middle: candidate counter
    const counterY = laneY + laneH + 30;
    const counterH = 22;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('CANDIDATE COUNTER (persistBars = 3)', padL, counterY - 4);

    // Counter visualization: row of dots, one per bar, filled when candidate matches
    let count = 0;
    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const active = i <= cycle;
      if (active) {
        // Count logic: matches previous state?
        if (i === 0) count = 1;
        else if (rawSeq[i] === rawSeq[i - 1]) count += 1;
        else count = 1;
      }
      const displayCount = active ? count : 0;

      // Draw count as mini bars
      const filled = Math.min(3, displayCount);
      for (let j = 0; j < 3; j++) {
        const dotY = counterY + j * 6;
        ctx.fillStyle = j < filled ? (filled >= 3 ? '#00B3A4' : '#F9A825') : 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + bW / 2 - 2, dotY, 4, 4);
      }
    }

    // Confirmed lane
    const confirmedY = counterY + 28;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('CONFIRMED STATE', padL, confirmedY - 4);

    // Confirmed tracking: starts TRANSITION, only flips when count >= 3
    let cCount = 0;
    let cState = 0;
    let candidate = 0;
    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const active = i <= cycle;

      if (active) {
        if (i === 0) { candidate = rawSeq[i]; cCount = 1; }
        else if (rawSeq[i] === candidate) { cCount += 1; }
        else { candidate = rawSeq[i]; cCount = 1; }

        if (cCount >= 3) cState = candidate;
      }

      const color = cState === 1 ? '#00B3A4' : '#F9A825';
      ctx.fillStyle = active ? color : color + '22';
      ctx.fillRect(x + 1, confirmedY, bW - 2, laneH - 8);
    }

    // Annotation — confirmation moment (where flicker ends, state locks in)
    const lockBar = 10; // where confirmed flips to release
    const lockX = padL + lockBar * bW + bW / 2;
    if (cycle >= lockBar) {
      ctx.strokeStyle = '#00B3A4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(lockX, laneY);
      ctx.lineTo(lockX, confirmedY + laneH - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#00B3A4';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('LOCK-IN', lockX, laneY - 10);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Flickers cannot confirm. Only 3+ consecutive bars of the same candidate commit the state.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: TRAP — the off-axis state detail
// ============================================================
function TrapOffAxisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TRAP can coexist with any Pressure value', w / 2, 14);

    // 2D plot: x = pressure, y = stress
    // TRAP zone = high stress AND low follow-through, regardless of pressure sign
    const padL = 60;
    const padR = w - 25;
    const chartT = 32;
    const chartB = h - 34;
    const chartW = padR - padL;
    const chartH = chartB - chartT;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, chartT, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(padL, chartT, chartW, chartH);

    // Axes
    const zeroX = padL + chartW / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.moveTo(zeroX, chartT); ctx.lineTo(zeroX, chartB); ctx.stroke();

    // Trap zone (stress >= 30, top half)
    const trapZoneY = chartT + chartH * 0.25; // stress=30 line
    ctx.fillStyle = 'rgba(236,64,122,0.12)';
    ctx.fillRect(padL, chartT, chartW, trapZoneY - chartT);
    ctx.strokeStyle = 'rgba(236,64,122,0.4)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padL, trapZoneY); ctx.lineTo(padR, trapZoneY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(236,64,122,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('stress \u2265 30 \u2192 TRAP zone', padL + 6, trapZoneY - 4);

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('-100', padL, chartB + 12);
    ctx.fillText('0', zeroX, chartB + 12);
    ctx.fillText('+100', padR, chartB + 12);
    ctx.fillText('PRESSURE', padL + chartW / 2, chartB + 24);

    ctx.save();
    ctx.translate(padL - 30, chartT + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('STRESS', 0, 0);
    ctx.restore();

    ctx.textAlign = 'right';
    ctx.fillText('100', padL - 4, chartT + 4);
    ctx.fillText('0', padL - 4, chartB - 2);

    // Label the 4 state zones
    // SUPPRESSED (bottom-left): pressure < -5, low stress
    ctx.fillStyle = 'rgba(138,138,138,0.15)';
    ctx.fillRect(padL, trapZoneY, zeroX - padL - 10, chartB - trapZoneY);
    ctx.fillStyle = 'rgba(138,138,138,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SUPPRESSED', (padL + zeroX) / 2, chartB - 8);

    // RELEASE (bottom-right)
    ctx.fillStyle = 'rgba(38,166,154,0.15)';
    ctx.fillRect(zeroX + 10, trapZoneY, padR - zeroX - 10, chartB - trapZoneY);
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.fillText('RELEASE', (zeroX + padR) / 2, chartB - 8);

    // TRANSITION (middle-bottom, -5 to +5)
    ctx.fillStyle = 'rgba(249,168,37,0.15)';
    ctx.fillRect(zeroX - 10, trapZoneY, 20, chartB - trapZoneY);
    ctx.fillStyle = 'rgba(249,168,37,0.85)';
    ctx.font = 'bold 6px system-ui';
    ctx.fillText('TRANS', zeroX, chartB - 8);

    // Moving dot cycling through states
    const tx = Math.sin(t) * 45; // pressure
    const ty = 20 + Math.abs(Math.sin(t * 1.3)) * 65; // stress
    const dotX = zeroX + (tx / 100) * (chartW / 2);
    const dotY = chartB - (ty / 100) * chartH;

    // Determine state
    let dotColor = '#F9A825';
    let stateName = 'TRANSITION';
    if (ty >= 30) {
      dotColor = '#EC407A';
      stateName = 'TRAP';
    } else if (tx >= 5) {
      dotColor = '#00B3A4';
      stateName = 'RELEASE';
    } else if (tx <= -5) {
      dotColor = '#8A8A8A';
      stateName = 'SUPPRESSED';
    }

    // Trail
    ctx.strokeStyle = dotColor + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const tt = t - i * 0.03;
      const trailPx = Math.sin(tt) * 45;
      const trailPy = 20 + Math.abs(Math.sin(tt * 1.3)) * 65;
      const x = zeroX + (trailPx / 100) * (chartW / 2);
      const y = chartB - (trailPy / 100) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Dot
    ctx.fillStyle = dotColor;
    ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.stroke();

    // Label above dot
    ctx.fillStyle = dotColor;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stateName, dotX, dotY - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 9: RELEASE vs SUPPRESSED — mirror states
// ============================================================
function ReleaseVsSuppressedAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RELEASE vs SUPPRESSED \u2014 Opposite Commitments', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: RELEASE
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RELEASE', mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('pressure \u2265 +5 \u2022 directional energy released', mid / 2, 44);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 58;
    const chartB = h - 48;
    const chartH = chartB - chartT;

    // Trending price going up
    const n = 32;
    const xStepL = (padLR - padLL) / (n - 1);
    const lP: number[] = [];
    for (let i = 0; i < n; i++) lP.push(100 + i * 0.35 + Math.sin(i + t) * 0.4);
    const lMin = Math.min(...lP) - 1;
    const lMax = Math.max(...lP) + 1;
    const toYL = (v: number) => chartB - ((v - lMin) / (lMax - lMin)) * (chartH - 6);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    lP.forEach((v, i) => { const x = padLL + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Teal histogram beneath
    const histY = chartB + 6;
    const histH = 20;
    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      const bar = 14 + Math.sin(i * 0.3 + t) * 4;
      ctx.fillStyle = 'rgba(0,179,164,0.85)';
      ctx.fillRect(x + 0.5, histY + histH - bar, xStepL - 1, bar);
    }

    // Characteristics
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('follow-through HIGH', mid / 2, h - 14);
    ctx.fillText('compression LOW', mid / 2, h - 4);

    // RIGHT: SUPPRESSED
    ctx.fillStyle = '#8A8A8A';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('SUPPRESSED', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(138,138,138,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('pressure \u2264 -5 \u2022 energy trapped, price pinned', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (n - 1);

    // Tight sideways price
    const rP: number[] = [];
    for (let i = 0; i < n; i++) rP.push(100 + Math.sin(i * 0.5 + t) * 0.5);
    const rMin = 98;
    const rMax = 102;
    const toYR = (v: number) => chartB - ((v - rMin) / (rMax - rMin)) * (chartH - 6);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    rP.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
    ctx.stroke();

    // Grey histogram (NEGATIVE bars below zero line)
    const rHistMid = histY + histH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padRL, rHistMid); ctx.lineTo(padRR, rHistMid); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      const bar = 10 + Math.sin(i * 0.5 + t) * 3;
      ctx.fillStyle = 'rgba(138,138,138,0.85)';
      ctx.fillRect(x + 0.5, rHistMid, xStepR - 1, bar);
    }

    ctx.fillStyle = '#8A8A8A';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('follow-through LOW', mid + mid / 2, h - 14);
    ctx.fillText('compression HIGH', mid + mid / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 10: State Transitions — trajectory paths
// ============================================================
function StateTransitionsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('State Transitions \u2014 Common Trajectories', w / 2, 14);

    // 4 state nodes arranged around center
    const cx = w / 2;
    const cy = h / 2 + 10;
    const r = Math.min(w, h) * 0.3;

    const states = [
      { name: 'SUPPRESSED', color: '#8A8A8A', angle: Math.PI },
      { name: 'RELEASE', color: '#00B3A4', angle: 0 },
      { name: 'TRANSITION', angle: -Math.PI / 2, color: '#F9A825' },
      { name: 'TRAP', angle: Math.PI / 2, color: '#EC407A' },
    ];

    // Common transitions with highlight animation
    const transitions = [
      { from: 0, to: 2, label: 'build-up' }, // SUPPRESSED → TRANSITION
      { from: 2, to: 1, label: 'break-out' }, // TRANSITION → RELEASE
      { from: 1, to: 3, label: 'exhaustion' }, // RELEASE → TRAP
      { from: 3, to: 0, label: 'collapse' }, // TRAP → SUPPRESSED
    ];

    const activeIdx = Math.floor((t * 0.4) % 4);

    // Draw arrows for transitions
    transitions.forEach((tr, i) => {
      const fromS = states[tr.from];
      const toS = states[tr.to];
      const fromX = cx + Math.cos(fromS.angle) * r;
      const fromY = cy + Math.sin(fromS.angle) * r;
      const toX = cx + Math.cos(toS.angle) * r;
      const toY = cy + Math.sin(toS.angle) * r;

      const isActive = i === activeIdx;

      // Curved arrow
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const offX = (fromY - toY) * 0.15;
      const offY = (toX - fromX) * 0.15;
      const ctrlX = midX + offX;
      const ctrlY = midY + offY;

      ctx.strokeStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, toX, toY);
      ctx.stroke();

      // Label
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.4)';
      ctx.font = isActive ? 'bold 8px system-ui' : '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(tr.label, ctrlX, ctrlY + 3);
    });

    // Draw state nodes
    states.forEach((s, i) => {
      const nx = cx + Math.cos(s.angle) * r;
      const ny = cy + Math.sin(s.angle) * r;
      const isActiveNode = activeIdx === i || (activeIdx + 1) % 4 === (transitions.findIndex(tr => tr.to === i));
      // Highlight source & destination of active transition
      const tr = transitions[activeIdx];
      const isFrom = tr.from === i;
      const isTo = tr.to === i;

      const pulse = (isFrom || isTo) ? 1.1 + Math.sin(t * 6) * 0.2 : 1;
      const alpha = (isFrom || isTo) ? 1 : 0.4;

      ctx.fillStyle = s.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath(); ctx.arc(nx, ny, 22 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(nx, ny, 22 * pulse, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, nx, ny + 2);
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 11: MPR × MSI × MPG Confluence
// ============================================================
function MPRConfluenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPR \u00d7 MSI \u00d7 MPG \u2014 Three Sub-Pane Views', w / 2, 14);

    const padL = 20;
    const padR = w - 15;
    const xR = padR - padL;

    // Four panels stacked
    const pH = (h - 50) / 4;
    const p1Y = 28;
    const p2Y = p1Y + pH + 4;
    const p3Y = p2Y + pH + 4;
    const p4Y = p3Y + pH + 4;

    const pts = 50;
    const xStep = xR / (pts - 1);

    // === PANE 1: Price ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p1Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p1Y, xR, pH);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL + 4, p1Y + 10);

    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      // Compression → breakout → exhaustion pattern
      if (i < 15) prices.push(100 + Math.sin(i * 0.5 + t) * 0.4);
      else if (i < 35) prices.push(100 + (i - 15) * 0.25 + Math.sin(i + t) * 0.3);
      else prices.push(105 + Math.sin(i * 0.3 + t) * 0.8);
    }

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1Y + pH - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 12);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY1(v)) : ctx.lineTo(x, toY1(v)); });
    ctx.stroke();

    // === PANE 2: MPR histogram ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, pH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPR (-100 to +100)', padL + 4, p2Y + 10);

    const midY2 = p2Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY2); ctx.lineTo(padR, midY2); ctx.stroke();

    for (let i = 0; i < pts; i++) {
      const x = padL + i * xStep;
      let v = 0;
      let c = '#8A8A8A';
      if (i < 15) { v = -25 + Math.sin(i + t) * 6; c = '#8A8A8A'; }
      else if (i < 20) { v = -5 + Math.sin(i + t) * 4; c = '#F9A825'; }
      else if (i < 35) { v = 30 + Math.sin(i * 0.3 + t) * 10; c = '#00B3A4'; }
      else { v = -15 + Math.sin(i * 0.3 + t) * 30; c = '#EC407A'; }
      const barY = v >= 0 ? midY2 - (v / 50) * (pH / 2 - 4) : midY2;
      const barH = Math.abs(v / 50) * (pH / 2 - 4);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // === PANE 3: MSI regime ribbon ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p3Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p3Y, xR, pH);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MSI regime', padL + 4, p3Y + 10);

    for (let i = 0; i < pts; i++) {
      const x = padL + i * xStep;
      let c = '#5F6B7A';
      if (i < 15) c = '#5F6B7A';
      else if (i < 20) c = '#C28B2C';
      else if (i < 35) c = '#3A8F6B';
      else c = '#C28B2C';
      ctx.fillStyle = c;
      ctx.fillRect(x, p3Y + pH - 14, xStep - 1, 10);
    }

    // === PANE 4: MPG ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p4Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p4Y, xR, pH);
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPG (0-100)', padL + 4, p4Y + 10);

    const toY4 = (v: number) => p4Y + pH - 4 - (v / 100) * (pH - 14);
    for (let i = 0; i < pts; i++) {
      const x = padL + i * xStep;
      let v = 0;
      let c = '#8A8A8A';
      if (i < 15) { v = 15; c = '#8A8A8A'; }
      else if (i < 20) { v = 30 + Math.sin(i + t) * 4; c = '#F9A825'; }
      else if (i < 35) { v = 55 + Math.sin(i + t) * 5; c = '#00B3A4'; }
      else { v = 60 - (i - 35) * 1.5 + Math.sin(i + t) * 3; c = '#00B3A4'; }
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, toY4(v), xStep - 1, p4Y + pH - 4 - toY4(v));
    }

    // Confluence annotation
    const confX = padL + 25 * xStep;
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(confX, p1Y); ctx.lineTo(confX, p4Y + pH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONFLUENCE', confX, p1Y - 2);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 12: The Two Thresholds — ±5 symmetry
// ============================================================
function ThresholdSymmetryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The \u00b15 Thresholds \u2014 Deliberate Symmetry', w / 2, 14);

    // Horizontal histogram animated crossing thresholds
    const padL = 30;
    const padR = w - 20;
    const xR = padR - padL;
    const chartT = 38;
    const chartB = h - 40;
    const midY = (chartT + chartB) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, chartT, xR, chartB - chartT);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, chartT, xR, chartB - chartT);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();

    // Thresholds
    const thrOffset = 18; // 5 out of max display of ~50
    const thrUpY = midY - thrOffset;
    const thrDnY = midY + thrOffset;

    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padL, thrUpY); ctx.lineTo(padR, thrUpY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, thrDnY); ctx.lineTo(padR, thrDnY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(245,158,11,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+5 (RELEASE gate)', padR - 4, thrUpY - 3);
    ctx.fillText('-5 (SUPPRESSED gate)', padR - 4, thrDnY + 11);

    // Animated histogram crossing
    const n = 50;
    const bW = xR / n;
    for (let i = 0; i < n; i++) {
      const x = padL + i * bW;
      // Animated wave
      const v = Math.sin(i * 0.3 + t) * 30 + Math.sin(i * 0.7 + t * 0.6) * 15;

      let color = '#F9A825';
      if (v >= 5) color = '#00B3A4';
      else if (v <= -5) color = '#8A8A8A';

      const barY = v >= 0 ? midY - (v / 50) * (midY - chartT) : midY;
      const barH = Math.abs(v / 50) * (midY - chartT);
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x + 0.5, barY, bW - 1, barH);
    }

    // Zone labels
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RELEASE zone', padL + 4, chartT + 10);
    ctx.fillStyle = 'rgba(249,168,37,0.65)';
    ctx.fillText('TRANSITION zone (deadband)', padL + 4, midY - 4);
    ctx.fillStyle = 'rgba(138,138,138,0.75)';
    ctx.fillText('SUPPRESSED zone', padL + 4, chartB - 5);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Symmetric thresholds prevent directional bias. \u00b15 = hysteresis band.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MPR interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'Your MPR histogram just turned <strong>magenta</strong>. Pressure score reads +42 (well above +5). What is happening and what do you do?',
    options: [
      { text: 'TRAP state is active. Stress \u2265 30 AND follow-through &lt; 0.30 triggered it, even though the pressure score is strongly positive. This is the classic &ldquo;effort without result&rdquo; signature \u2014 high volume pushing in a direction but price not traveling. Do NOT treat the positive pressure as a buy signal. The market is absorbing the effort.', correct: true, explain: 'Exactly right. TRAP is OFF-AXIS \u2014 it coexists with any pressure value. The Pine source checks isTrapCondition BEFORE checking pressure thresholds. When trap conditions are met, the state becomes TRAP regardless of whether pressure is +42 or -42. The magenta color is telling you the positive pressure is a lie \u2014 effort is being absorbed. This is one of the most valuable signals MPR provides.' },
      { text: 'Positive pressure means go long', correct: false, explain: 'If that were the case, MPR would just output the pressure score. But it outputs a STATE. The state classifier evaluates trap conditions before it evaluates pressure, precisely to catch situations where positive pressure is misleading. Magenta overrides the pressure reading. That is the point of the off-axis trap state.' },
    ],
  },
  {
    scenario: 'MPR has been <strong>teal</strong> (RELEASE) for 12 bars. Suddenly the raw pressure flickers between RELEASE and TRANSITION for 2 bars, then stabilizes back to RELEASE. Does the confirmed state change during the flicker?',
    options: [
      { text: 'The confirmed state stays RELEASE. The Persistence Contract requires 3 consecutive bars of a new candidate before the confirmed state changes. A 2-bar flicker never reaches the persistBars=3 threshold, so the candidate counter resets without ever committing. This is the contract working as designed.', correct: true, explain: 'Perfect understanding. The Pine source uses var int candidateCount. When the raw state differs from candidate, count resets to 1 with the new candidate. Only when candidateCount \u2265 persistBars does confirmedState = candidateState. A 2-bar excursion cannot lock in \u2014 the counter resets before reaching 3. This is the anti-flicker mechanism that separates MPR from retail oscillators that bounce their state on every wiggle.' },
      { text: 'The confirmed state briefly flips to TRANSITION then back', correct: false, explain: 'That is what a low-lag indicator would do and is exactly what MPR was designed to NOT do. The Persistence Contract explicitly refuses to commit the state until the new candidate has appeared for 3 consecutive bars. Any shorter duration is discarded as noise. This is the committed-state philosophy.' },
    ],
  },
  {
    scenario: 'Your MPR has been <strong>grey</strong> (SUPPRESSED) for 40 bars on a BTC 1h chart. Pressure has been oscillating around -15. What is the most professional read?',
    options: [
      { text: 'The market has been in a confirmed suppression regime for 40 hours. Price is pinned, compression dominates, follow-through is absent. This is NOT a setup to trade \u2014 low-quality pressure environments should be respected with reduced position size or standing aside. Watch for stability to drop (forced TRANSITION) or pressure to cross above +5 (RELEASE emergence).', correct: true, explain: 'Correct. SUPPRESSED is not a trade state \u2014 it is a wait state. Forty bars is a substantial commitment by the market to this regime. The Persistence Contract means this is not a momentary reading; it is a durable condition. The professional action is capital preservation until the regime changes. Watch for pressure to cross +5 (RELEASE emerging) or stability to drop below 0.5 (forced TRANSITION indicating regime stress).' },
      { text: 'Bullish divergence setup \u2014 buy', correct: false, explain: 'MPR makes no divergence claims. A sustained SUPPRESSED state is not a bullish signal \u2014 it is a diagnostic statement that the market is NOT moving directionally. Forcing a trade on a divergence narrative inside a suppressed regime fights the regime, which is the opposite of what MPR is telling you to do.' },
    ],
  },
  {
    scenario: 'Two traders open MPR on the same BTC 1h chart at the same moment. Trader A has <code>persistBars = 3</code> (default). Trader B has changed it to <code>persistBars = 1</code>. How do their experiences differ?',
    options: [
      { text: 'Trader B sees faster state changes but suffers from flicker \u2014 every single-bar fluctuation commits immediately. Trader A sees committed states only, with a lag of 2-3 bars on transitions but far fewer false signals. Low-lag speed vs high-conviction reliability is a tradeoff, not a win. The Persistence Contract is the mechanism that chooses reliability.', correct: true, explain: 'This is the core teaching of the Persistence Contract. Retail indicators treat low-lag as an unqualified good, but speed has a hidden cost: flicker. Every false positive state change is a signal you have to discard and an opportunity for emotional trading decisions. MPR\u2019s default persistBars=3 is a deliberate positioning on the reliability side of the tradeoff. Trader B has effectively disabled the contract and turned MPR into a noisy single-bar classifier. Both configurations are valid, but they serve different philosophies.' },
      { text: 'No difference \u2014 it is just a minor setting', correct: false, explain: 'persistBars is not a minor setting. It is the SOLE parameter that governs the Persistence Contract. Setting it to 1 fundamentally changes what MPR is as a tool \u2014 from a committed-state classifier to a bar-by-bar signal oscillator. The default of 3 encodes the entire design philosophy.' },
    ],
  },
  {
    scenario: 'MPR shows <strong>amber</strong> (TRANSITION). Pressure score reads +8 (above the +5 RELEASE threshold). Stability score reads 0.35 (below the 0.5 stability threshold). Why is the state TRANSITION and not RELEASE?',
    options: [
      { text: 'The instability override. When stability &lt; stabilityThr (0.5 default), the Pine source forces the state to TRANSITION regardless of pressure \u2014 unless the trap condition is active. Pressure of +8 would normally qualify for RELEASE, but stability of 0.35 means pressure has been flipping signs frequently in the stabilityLen window. The tool refuses to commit to RELEASE when the underlying pressure signal is unreliable.', correct: true, explain: 'Exactly. The source code has the exact line: rawStateWithStability = (isUnstable and rawState != STATE_TRAP) ? STATE_TRANSITION : rawState. The override is deliberate \u2014 unstable pressure is uncommitted pressure. This is another manifestation of the Persistence Contract philosophy: the tool refuses to commit to a diagnosis it is not confident in. Note: trap is NOT overridden to transition, because trap detection has its own stability (it is based on stress + follow-through, both more committed measurements).' },
      { text: 'The indicator is broken', correct: false, explain: 'Working exactly as designed. The apparent contradiction (pressure &gt; +5 but state = TRANSITION) is the stability filter doing its job. It is actively protecting you from committing to a RELEASE reading that is unreliable because the pressure signal is flip-flopping underneath it.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market Pressure Regime (MPR) outputs:', opts: ['A single buy/sell signal', 'A 4-state classification (RELEASE / SUPPRESSED / TRANSITION / TRAP) with a bipolar histogram', 'A moving average', 'A momentum oscillator'], correct: 1, explain: 'MPR outputs a signed pressure score (-100 to +100) AND a state classification. The states are RELEASE (+1), SUPPRESSED (-1), TRANSITION (0), and TRAP (+2). The score is the quantitative measurement; the state is the committed classification.' },
  { q: 'The TRAP state is triggered when:', opts: ['Pressure is exactly zero', 'stressScore \u2265 30 AND followScore < 0.30 \u2014 regardless of pressure sign', 'Price breaks support', 'Volume drops'], correct: 1, explain: 'Exact source: isTrapCondition = (stressScore >= trapThr and followScore < 0.3). Both conditions must be true. TRAP is OFF-AXIS relative to pressure \u2014 it is checked BEFORE the pressure thresholds in the classifier and can coexist with any pressure value.' },
  { q: 'The Persistence Contract requires:', opts: ['No filtering \u2014 state changes every bar', 'persistBars (default 3) consecutive bars of the same candidate state before the confirmed state changes', 'A volume spike', 'Price breaking the 20 EMA'], correct: 1, explain: 'Source: if candidateCount >= persistBars then confirmedState := candidateState. The candidate state must appear for 3 consecutive bars (default) before being committed. This is the anti-flicker mechanism that gives MPR its committed feel at the cost of 2-3 bars of lag.' },
  { q: 'The composite Pressure Score is computed as:', opts: ['Close - Open', 'clamp100(followScore \u00d7 100 \u2212 compressionScore \u00d7 100)', 'Volume / Volume Average', 'RSI minus 50'], correct: 1, explain: 'Exact formula from source: pressureScore = clamp100(followComponent - compressionComponent) where followComponent = followScore * 100 and compressionComponent = compressionScore * 100. Positive = directional release pressure dominates. Negative = compression/pinning dominates.' },
  { q: 'When hasVolume is false, MPR falls back to:', opts: ['NaN values', 'Using range ratio (high-low)/ATR as the effort proxy \u2014 same Volume Fallback Doctrine as MPG', 'Zero effort', 'A fixed constant'], correct: 1, explain: 'Source: effortRaw = hasVolume ? volRatio : rangeRatio. MPR shares MPG\u2019s Volume Fallback Doctrine: when real volume is unreliable (common on Forex), it uses range expansion as a proxy for effort. This is the cross-asset engineering that makes MPR work where most volume-based indicators silently fail.' },
  { q: 'When stability < stabilityThr (default 0.5), the state is:', opts: ['Unchanged', 'Forced to TRANSITION \u2014 unless trap conditions are active', 'Locked', 'Reset to zero'], correct: 1, explain: 'Source: rawStateWithStability = (isUnstable and rawState != STATE_TRAP) ? STATE_TRANSITION : rawState. The instability override forces TRANSITION when pressure has been flipping signs too often. Trap is exempted because it has its own more committed measurement basis.' },
  { q: 'Stability score is calculated as:', opts: ['Price standard deviation', '1 minus the rolling flip rate of the pressure sign over stabilityLen bars (default 20)', 'ATR percentage', 'Volume variance'], correct: 1, explain: 'Source: stabilityRaw = 1.0 - flipRate, where flipRate = ta.sma(flip, stabilityLen) and flip = 1 when pressureSign != pressureSignPrev else 0. High flip rate = low stability = pressure is unreliable.' },
  { q: 'The four MPR states can be read as:', opts: ['Buy / Sell / Hold / Exit', 'RELEASE (teal) = directional breaking \u00b7 SUPPRESSED (grey) = pinned \u00b7 TRANSITION (amber) = unstable \u00b7 TRAP (magenta) = absorbed effort', 'High / Medium / Low / Zero', 'Morning / Afternoon / Evening / Night'], correct: 1, explain: 'These are the exact state meanings from the Pine source. RELEASE (STATE_RELEASE = 1) = pressure \u2265 +5 and follow-through dominates. SUPPRESSED (STATE_SUPPRESSED = -1) = pressure \u2264 -5 and compression dominates. TRANSITION (STATE_TRANSITION = 0) = between thresholds or unstable. TRAP (STATE_TRAP = 2) = off-axis absorption signature.' },
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
export default function MPRDeepDiveLesson() {
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
    { wrong: 'Treating TRAP (magenta) as a secondary pressure state', right: 'TRAP is not part of the pressure spectrum. It is an off-axis condition that can coexist with any pressure score. A TRAP state with pressure of +42 is telling you the positive pressure is MISLEADING \u2014 effort is being absorbed. Ignore this distinction and you will systematically buy absorption patterns that fade on you.', icon: '\u{1F3AF}' },
    { wrong: 'Setting persistBars = 1 for &ldquo;faster signals&rdquo;', right: 'This disables the Persistence Contract and turns MPR into a noisy single-bar classifier. You trade lag for flicker \u2014 and flicker is worse. The default of 3 bars encodes the philosophical commitment to reliability over speed. If you want faster, you\u2019re using the wrong tool (MPR is not a signal generator).', icon: '\u26A0\uFE0F' },
    { wrong: 'Ignoring the instability override', right: 'When stability &lt; 0.5, MPR forces TRANSITION even if pressure crossed +5 or -5. This is not a bug; it is the tool protecting you from uncommitted pressure. If you expected RELEASE and got TRANSITION, check the stability score \u2014 the pressure signal is unreliable. Trade the TRANSITION, not the underlying score.', icon: '\u{1F504}' },
    { wrong: 'Using MPR as a momentum oscillator (RSI substitute)', right: 'MPR is a pressure/state oscillator, not a momentum oscillator. A reading of +60 does NOT mean overbought \u2014 it means committed release pressure. A reading of -60 does NOT mean oversold \u2014 it means committed suppression. The states encode regime commitment, not overextension. Reading with RSI logic generates systematic wrong conclusions.', icon: '\u{1F4CA}' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market Pressure<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Regime</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">A bipolar oscillator with a 4-state classifier. RELEASE, SUPPRESSED, TRANSITION, and an off-axis TRAP state. Every state change requires 3 committed bars \u2014 no flicker, no compromise.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Other Oscillator</p>
            <p className="text-gray-400 leading-relaxed mb-4">MPG taught you that oscillators can measure participation rather than momentum. <strong className="text-amber-400">MPR is a different oscillator entirely</strong>, measuring something orthogonal: <strong className="text-white">pressure regime</strong>. Where MPG asks &ldquo;is anyone engaged?&rdquo;, MPR asks &ldquo;is the market committed to releasing pressure, containing it, absorbing it, or transitioning between those?&rdquo; Same sub-pane architecture, entirely different question.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The architectural innovation that separates MPR from every other oscillator you&apos;ve seen is the <strong className="text-white">4-state classifier with a TRAP state sitting off-axis</strong>. Most classifiers are ordinal \u2014 states arranged along a single line (low → medium → high, or bearish → neutral → bullish). MPR&apos;s TRAP state isn&apos;t on the line. It can fire at any pressure value because it&apos;s measuring something the pressure score doesn&apos;t capture: absorption. Positive pressure + absorption = a very different market than positive pressure alone, and MPR is the indicator that flags the distinction.</p>
            <p className="text-gray-400 leading-relaxed">The other innovation is the <strong className="text-white">Persistence Contract</strong>: state changes require 3 consecutive bars of the new candidate before they commit. This is deliberately slower than bar-by-bar classification \u2014 and that slowness is the feature, not a bug. Every state reading MPR gives you is a <em>committed</em> reading. If you want flicker-free regime analysis, this is the mechanism that provides it.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE MPR AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Pressure can be released, suppressed, transitioning, or absorbed \u2014 and absorption is not a pressure value, it is a separate dimension. MPR measures both simultaneously. Use the full classification, not just the score.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Four States</p>
          <h2 className="text-2xl font-extrabold mb-4">One Spectrum + One Off-Axis State</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MPR has <strong className="text-white">four states</strong>: SUPPRESSED, TRANSITION, RELEASE, and TRAP. The first three sit on the pressure spectrum from -100 to +100. TRAP doesn&apos;t. It&apos;s a separate classification that fires when the absorption signature is detected, regardless of where the pressure score is. Understanding this geometry is the foundation of MPR literacy.</p>
          <FourStatesQuadrantAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why TRAP is Off-Axis</p>
            <p className="text-sm text-gray-400">The pressure score measures <em>direction and commitment</em>. The stress score measures <em>effort vs result</em>. These are orthogonal dimensions. A market can have strongly positive pressure (price pushing up) while simultaneously showing heavy absorption (effort not producing result) \u2014 those are two different phenomena happening at once. Putting TRAP on the pressure spectrum would collapse this information; keeping it off-axis preserves both readings.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Compression Score</p>
          <h2 className="text-2xl font-extrabold mb-4">The Pinning Proxy</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first computation. Compression = <code className="text-white">1 - (candleRange / ATR)</code>, normalized to 0-1. When candle range is tight relative to ATR (typical of a pinned market), compression is high. When candles are expanding (breakout conditions), compression is low. Compression is the <em>negative contribution</em> to pressure \u2014 high compression pulls pressure toward the suppressed side.</p>
          <CompressionScoreAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Inverted?</p>
            <p className="text-sm text-gray-400">You want a number where &ldquo;more pinning&rdquo; = higher score. The raw range/ATR ratio has the opposite semantics (bigger = more expansion). Inverting it (<code>1 - ratio</code>) and normalizing gives you the clean 0-1 proxy where 1.0 means &ldquo;completely pinned&rdquo; and 0.0 means &ldquo;fully expanded.&rdquo; Small mathematical detail, large interpretive value.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Follow-Through Score</p>
          <h2 className="text-2xl font-extrabold mb-4">Path Efficiency, Release Proxy</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Same math as MPG and MAZ efficiency: <code className="text-white">|close - close[20]| / sum(|close - close[1]|, 20)</code>. Bounded 0-1. High = price moving directly (good follow-through, release conditions). Low = price wandering (no follow-through, compression conditions). This is the <em>positive contribution</em> to pressure \u2014 high follow-through pushes pressure toward the release side.</p>
          <FollowThroughScoreAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 20 Bars</p>
            <p className="text-sm text-gray-400">The lenBase default of 20 matches MPR&apos;s baseline lookback. Long enough to capture sustained moves, short enough to react to regime changes. If you tune it shorter (10-15), MPR becomes more responsive but noisier. Longer (30-40) makes it smoother but laggier. The 20-bar default is the calibrated sweet spot.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Stress Score</p>
          <h2 className="text-2xl font-extrabold mb-4">The Trap Detector</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Stress = <code className="text-white">(effort - result) \u00d7 100</code>, clamped to -100 to +100. Effort = volume ratio (or range ratio when volume is unreliable \u2014 the Volume Fallback Doctrine in action). Result = price movement relative to ATR. When effort is high but result is low, stress spikes positive. When stress &ge; 30 AND follow-through &lt; 0.30, MPR classifies the state as TRAP.</p>
          <StressScoreAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Both Conditions Are Required</p>
            <p className="text-sm text-gray-400">Stress alone isn&apos;t enough. A single bar of high effort + low result could be noise. Combining it with low follow-through (a sustained condition) filters out noise and catches specifically the pattern where <em>effort is being absorbed over time</em>. The AND gate is what gives TRAP its specificity \u2014 it doesn&apos;t trigger on single-bar anomalies.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Composite Pressure</p>
          <h2 className="text-2xl font-extrabold mb-4">Follow Pulls Up, Compression Pulls Down</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The pressure score is an <strong className="text-white">explicit tug-of-war</strong> between two forces. Follow-through \u00d7 100 pushes pressure toward positive (release). Compression \u00d7 100 pulls pressure toward negative (suppression). The signed composite is clamped to -100 to +100. This is why pressure is bipolar \u2014 it&apos;s measuring net directional commitment, not magnitude.</p>
          <PressureFormulaAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Symmetry Choice</p>
            <p className="text-sm text-gray-400">Both components are scaled to 100 before subtraction, giving them equal weight. This is a deliberate design choice \u2014 neither force dominates structurally. The asymmetries come from the market itself (real behavior favors one or the other at any given moment), not from the indicator&apos;s weighting. This keeps MPR neutral by construction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Stability Filter</p>
          <h2 className="text-2xl font-extrabold mb-4">How Often Does Pressure Flip?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Stability = <code className="text-white">1 - flipRate</code> where flipRate is the rolling average of sign changes over 20 bars. When pressure keeps flipping between positive and negative, stability is low and the tool is telling you: &ldquo;the pressure signal itself is unreliable right now.&rdquo; When stability drops below 0.5 (default threshold), the classifier <strong className="text-white">forces TRANSITION</strong> \u2014 refusing to commit to RELEASE or SUPPRESSED even if the current pressure value would qualify.</p>
          <StabilityFilterAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Override Is Philosophically Important</p>
            <p className="text-sm text-gray-400">A pressure score of +8 normally means RELEASE. But if pressure has been flipping between +12, -9, +15, -7 over the last 20 bars, that +8 is unreliable \u2014 the underlying signal is too noisy to commit to. The stability override forces TRANSITION precisely to stop you from trusting an unreliable reading. This is another manifestation of the Diagnostic Inversion principle: the tool refuses to give you a conclusion it can&apos;t defend.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Persistence Contract &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Commitment Over Speed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Here&apos;s the defining design philosophy of MPR \u2014 and it runs directly counter to how most retail indicators are built. Nearly every modern oscillator is optimized for <strong className="text-white">low lag</strong>: detect the state change as quickly as possible, on as few bars as possible, ideally on the bar it happens. MPR optimizes for the opposite quality: <strong className="text-white">committed evidence</strong>. A state change is only reported when the candidate has been present for <code className="text-white">persistBars</code> consecutive bars (default 3). Anything shorter is treated as flicker and discarded.</p>
          <PersistenceContractAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Persistence Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">Retail indicators treat low lag as an unqualified virtue. But speed has a hidden cost: <strong className="text-white">flicker</strong>. Every single-bar fluctuation triggers a state change, the state change fires a signal, the signal generates an emotional trading decision. Many of those state changes are noise \u2014 they reverse on the next bar, but you&apos;ve already acted. MPR chose the other side of the tradeoff explicitly. A state change is reported only when the market has committed to it for at least 3 consecutive bars. The cost is 2-3 bars of lag on regime transitions. The benefit is that every state reading is a <em>committed</em> reading: you can trust it, size your positions around it, and stop second-guessing every wiggle.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three operational implications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Don&apos;t reduce persistBars for &ldquo;speed.&rdquo;</strong> Setting it to 1 doesn&apos;t make MPR faster \u2014 it turns it into a different tool entirely, a noisy single-bar classifier. If you need faster, you need a different class of tool. The default of 3 encodes the entire design philosophy. Respect it.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Expect 2-3 bars of lag on transitions.</strong> When the market genuinely changes regime, MPR will report it 2-3 bars later than a bar-by-bar classifier would. This is deliberate. Those 2-3 bars are the cost of the reliability guarantee. Include them in your planning.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Trust the state when it fires.</strong> The Persistence Contract means that when MPR reports a new state, the market has actually committed to it. Unlike with low-lag tools, you don&apos;t need to second-guess every state change \u2014 the second-guessing has already been done for you by the persistence logic. Take the state at face value and trade accordingly.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; TRAP \u2014 The Off-Axis State</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Positive Pressure Can Be a Lie</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The TRAP state is MPR&apos;s most valuable and most misunderstood output. It encodes a specific market pathology: <strong className="text-white">effort being applied without proportional result</strong>. The pressure score can be strongly positive (indicating directional release), but if TRAP conditions are simultaneously active (stress \u2265 30 AND follow &lt; 0.3), the state becomes magenta TRAP \u2014 overriding the pressure reading.</p>
          <TrapOffAxisAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Classifier Check Order Matters</p>
            <p className="text-sm text-gray-400">Source logic: <code className="text-white">if isTrapCondition {'{'} rawState := STATE_TRAP {'}'}</code> runs BEFORE the pressure threshold checks. That order is deliberate. It means trap detection has priority \u2014 even a +42 pressure reading gets classified as TRAP if absorption is detected. Magenta overrides teal. Because if effort is being absorbed, the &ldquo;positive pressure&rdquo; isn&apos;t real pressure; it&apos;s just visible pressure that&apos;s about to collapse.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; RELEASE vs SUPPRESSED</p>
          <h2 className="text-2xl font-extrabold mb-4">The Mirror States</h2>
          <p className="text-gray-400 leading-relaxed mb-6">RELEASE and SUPPRESSED are perfect opposites. Both are COMMITTED states on the pressure spectrum. Both persist for many bars once established. Both require the Persistence Contract to activate. RELEASE needs pressure \u2265 +5 for 3 bars; SUPPRESSED needs pressure \u2264 -5 for 3 bars. Reading them is mirrored in the opposite direction.</p>
          <ReleaseVsSuppressedAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Deadband Between Them</p>
            <p className="text-sm text-gray-400">The ±5 thresholds create a <em>deadband</em> between them where the state is TRANSITION. Without that deadband, pressure hovering near zero would constantly flip between RELEASE and SUPPRESSED. The deadband is how MPR keeps itself noise-free at the neutral midpoint \u2014 any pressure reading between -5 and +5 is classified as TRANSITION regardless of sign. This is hysteresis applied to regime detection.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; State Transitions</p>
          <h2 className="text-2xl font-extrabold mb-4">Common Trajectory Patterns</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Over enough time, MPR cycles through all four states in recognizable patterns. <strong className="text-white">SUPPRESSED → TRANSITION → RELEASE</strong> is the classic breakout pattern: compression gives way to instability, which resolves into directional release. <strong className="text-white">RELEASE → TRAP</strong> is the exhaustion pattern: directional energy continues to be applied but starts being absorbed. <strong className="text-white">TRAP → SUPPRESSED</strong> is the collapse pattern: absorbed effort gives up and pressure flips to pinning.</p>
          <StateTransitionsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Trajectory Informs Context</p>
            <p className="text-sm text-gray-400">A current state of RELEASE means different things depending on where you came from. RELEASE <em>from SUPPRESSED</em> (via TRANSITION) is an emerging breakout \u2014 early stage, lots of runway. RELEASE <em>after TRAP</em> is a revival \u2014 can resolve either way, watch for stability. RELEASE <em>from another RELEASE after brief TRANSITION</em> is a trend continuation \u2014 high conviction. The state alone is only half the picture; the trajectory matters.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Oscillator Stack</p>
          <h2 className="text-2xl font-extrabold mb-4">MPR \u00d7 MSI \u00d7 MPG</h2>
          <p className="text-gray-400 leading-relaxed mb-6">For the first time in the ATLAS suite, you can stack <strong className="text-white">three sub-pane oscillators</strong> on the same chart. MPG tells you <em>if anyone is engaged</em>. MSI tells you <em>what regime</em> the market is in. MPR tells you <em>what pressure state</em> that regime is expressing. These three together form a complete diagnostic layer for the oscillator family \u2014 and when they agree, the confluence is among the strongest in the suite.</p>
          <MPRConfluenceAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Pane Economy</p>
            <p className="text-sm text-gray-400">TradingView lets you stack multiple sub-panes, but pane real estate is finite. MPG + MSI + MPR all in sub-panes takes about 40-50% of your chart height. This is a lot. The pro move: keep MSI in a pane for regime confirmation, MPR in a pane for pressure state, and use MPG&apos;s status-line HUD rather than its full pane when you&apos;re short on space. You get most of MPG&apos;s value from the status line alone.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Threshold Symmetry</p>
          <h2 className="text-2xl font-extrabold mb-4">\u00b15 By Design</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The RELEASE and SUPPRESSED thresholds are symmetric at +5 and -5 by default. This is not arbitrary. Symmetric thresholds mean MPR has no directional bias by construction \u2014 it treats upward pressure and downward pressure exactly the same. If you observe that your MPR seems to trigger RELEASE more often than SUPPRESSED, that&apos;s a property of the market you&apos;re watching, not a property of the indicator.</p>
          <ThresholdSymmetryAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Tuning The Thresholds</p>
            <p className="text-sm text-gray-400">You can widen the thresholds to \u00b110 or \u00b115 for stricter regime qualification (fewer state changes, each one more significant). You can narrow to \u00b12 or \u00b13 for more sensitive detection (more state changes, each one less firm). But <strong className="text-white">always keep them symmetric</strong> \u2014 asymmetric thresholds (e.g., +5 / -10) introduce directional bias that biases every subsequent state reading. The symmetry is the guarantee of neutrality.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MPR</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each of these traces back to the same root: trying to use MPR as either a signal generator or a momentum oscillator, when it is neither.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">MPR In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Architecture</p>
                <p className="text-sm text-gray-300">Sub-pane oscillator, bipolar histogram (-100 to +100), 4-state classifier with off-axis TRAP state.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Four States</p>
                <p className="text-sm text-gray-300">RELEASE (teal, +1) \u00b7 SUPPRESSED (grey, -1) \u00b7 TRANSITION (amber, 0) \u00b7 TRAP (magenta, +2 off-axis).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Formula</p>
                <p className="text-sm text-gray-300">pressure = clamp100(followScore \u00d7 100 - compression \u00d7 100). Positive = release; negative = suppression.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Trap Conditions</p>
                <p className="text-sm text-gray-300">stress \u2265 30 AND follow &lt; 0.3. Trap is checked BEFORE pressure thresholds \u2014 it overrides the pressure reading.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Persistence Contract (\u2605)</p>
                <p className="text-sm text-gray-300">persistBars = 3 default. New state must appear for 3 consecutive bars before committing. Anti-flicker mechanism.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Stability Override</p>
                <p className="text-sm text-gray-300">When stability &lt; 0.5 (flip rate &gt; 0.5), force TRANSITION \u2014 except when trap conditions are active.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Thresholds (Locked Symmetric)</p>
                <p className="text-sm text-gray-300">\u00b15 for RELEASE / SUPPRESSED. 30 for TRAP stress. 0.5 for stability. All tunable; keep pressure thresholds symmetric.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Data Window Exports</p>
                <p className="text-sm text-gray-300">Compression \u00b7 Follow-Through \u00b7 Stress \u00b7 Stability \u00b7 Pressure \u00b7 State \u00b7 Per-state booleans (isRelease, isSuppressed, isTransition, isTrap).</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading MPR Like a Committed State Classifier</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you read MPR as the 4-state classifier it actually is \u2014 or whether you&apos;re still pattern-matching it as a momentum oscillator.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MPR as a committed state classifier. The Persistence Contract is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Persistence Contract and TRAP sections before the quiz.' : 'Re-study the 4-state classifier and Persistence Contract sections before attempting the quiz.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">\u25A3</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market Pressure Regime</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Pressure Regime Classifier &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.7-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
