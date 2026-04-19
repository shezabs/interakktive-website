// app/academy/lesson/volatility-state-index-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.8: Volatility State Index Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PHASE 1: scaffold + 4 animations (3-state ribbon, base ATR, smoothed ATR, momentum ROC)
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
// ANIMATION 1: Three States — The Volatility Cycle Ribbon
// Shows the natural state progression through a volatility cycle
// ============================================================
function ThreeStatesRibbonAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three States \u2014 The Volatility Cycle', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const chartT = 36;
    const chartB = h - 48;
    const chartH = chartB - chartT;
    const chartW = padR - padL;
    const midY = (chartT + chartB) / 2;

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Threshold lines at ±5% (scaled)
    const thrOffset = chartH * 0.1;
    const thrUp = midY - thrOffset;
    const thrDn = midY + thrOffset;
    ctx.strokeStyle = 'rgba(245,158,11,0.35)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padL, thrUp); ctx.lineTo(padR, thrUp); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, thrDn); ctx.lineTo(padR, thrDn); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.6)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+5%', padR - 3, thrUp - 2);
    ctx.fillText('-5%', padR - 3, thrDn + 9);

    // Draw a cyclical volatility momentum curve
    const n = 50;
    const bW = chartW / n;
    const cycle = Math.floor((t * 0.4) % 1 * n);

    for (let i = 0; i < n; i++) {
      const x = padL + i * bW;
      // Cyclical wave: positive peak, cross zero, negative trough, cross zero
      const phase = (i / n) * Math.PI * 2 + t * 0.3;
      const v = Math.sin(phase) * 22;

      let color = '#F9A825';
      if (v >= 5) color = '#00B3A4';
      else if (v <= -5) color = '#8A8A8A';

      // Scale v into chart
      const barY = v >= 0 ? midY - (v / 50) * (chartH / 2) : midY;
      const barH = Math.abs(v / 50) * (chartH / 2);

      // Only draw up to current cycle
      const active = i <= cycle;
      ctx.fillStyle = color + (active ? 'cc' : '33');
      ctx.fillRect(x + 0.5, barY, bW - 1, barH);
    }

    // Floating state label that follows cycle
    const phase = (cycle / n) * Math.PI * 2 + t * 0.3;
    const v = Math.sin(phase) * 22;
    let labelText = 'TRANSITION';
    let labelColor = '#F9A825';
    if (v >= 5) { labelText = 'EXPANSION'; labelColor = '#00B3A4'; }
    else if (v <= -5) { labelText = 'DECAY'; labelColor = '#8A8A8A'; }

    const labelX = padL + cycle * bW;
    ctx.fillStyle = labelColor;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, Math.max(padL + 40, Math.min(padR - 40, labelX)), chartT - 6);

    // Axis labels bottom
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VOLATILITY MOMENTUM (% rate of change)', w / 2, chartB + 18);

    // Legend
    const lgY = chartB + 32;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('\u25A0 EXPANSION', padL, lgY);
    ctx.fillStyle = 'rgba(249,168,37,0.9)';
    ctx.fillText('\u25A0 TRANSITION', padL + 88, lgY);
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.fillText('\u25A0 DECAY', padL + 180, lgY);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 2: Base ATR — the raw volatility measurement
// Shows ATR jaggy vs smoothed, emphasizing why smoothing matters
// ============================================================
function BaseATRAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Base Volatility \u2014 ta.atr(14)', w / 2, 14);

    const padL = 35;
    const padR = w - 15;
    const chartT = 34;
    const chartB = h - 38;
    const chartW = padR - padL;
    const chartH = chartB - chartT;

    // Price pane top
    const priceH = chartH * 0.45;
    const priceB = chartT + priceH;

    // ATR pane bottom
    const atrT = priceB + 8;
    const atrH = chartB - atrT;

    const n = 40;
    const xStep = chartW / (n - 1);

    // Generate price data with one volatile section
    const prices: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    for (let i = 0; i < n; i++) {
      // Calm section, then volatile, then calm again
      const volFactor = i < 13 ? 0.3 : (i < 25 ? 1.3 : 0.5);
      const p = 100 + Math.sin(i * 0.3 + t) * 1 + Math.cos(i * 0.5 + t) * 0.5;
      prices.push(p);
      highs.push(p + volFactor * (0.4 + Math.abs(Math.sin(i + t)) * 0.6));
      lows.push(p - volFactor * (0.4 + Math.abs(Math.cos(i + t)) * 0.6));
    }

    const allPrice = [...highs, ...lows];
    const pMin = Math.min(...allPrice) - 0.5;
    const pMax = Math.max(...allPrice) + 0.5;
    const toYP = (v: number) => priceB - ((v - pMin) / (pMax - pMin)) * (priceH - 6);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE (with varying range)', padL, chartT - 2);

    // Draw mini candles
    for (let i = 0; i < n; i++) {
      const cx = padL + i * xStep;
      const hi = toYP(highs[i]);
      const lo = toYP(lows[i]);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, hi); ctx.lineTo(cx, lo); ctx.stroke();
      const color = i % 2 === 0 ? '#00B3A4' : '#EC407A';
      ctx.fillStyle = color + 'cc';
      const bodyH = Math.max(1.5, Math.abs(hi - lo) * 0.35);
      ctx.fillRect(cx - 2, (hi + lo) / 2 - bodyH / 2, 4, bodyH);
    }

    // ATR calculation (simplified true-range rolling avg)
    const atr: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 14) atr.push(NaN);
      else {
        let sum = 0;
        for (let j = 0; j < 14; j++) sum += highs[i - j] - lows[i - j];
        atr.push(sum / 14);
      }
    }

    const validATR = atr.filter(v => !isNaN(v));
    const aMin = Math.min(...validATR) * 0.9;
    const aMax = Math.max(...validATR) * 1.1;
    const toYA = (v: number) => atrT + atrH - ((v - aMin) / (aMax - aMin)) * (atrH - 8) - 4;

    // ATR label
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('RAW ATR(14) \u2014 jagged, reactive', padL, atrT - 2);

    // Jaggy ATR line
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    atr.forEach((v, i) => {
      if (isNaN(v)) return;
      const x = padL + i * xStep;
      const y = toYA(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under ATR for emphasis
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    started = false;
    atr.forEach((v, i) => {
      if (isNaN(v)) return;
      const x = padL + i * xStep;
      const y = toYA(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padR, atrT + atrH);
    ctx.lineTo(padL + 13 * xStep, atrT + atrH);
    ctx.closePath();
    ctx.fillStyle = '#FFB300';
    ctx.fill();
    ctx.restore();

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Raw ATR captures volatility but is too noisy for a momentum calculation', w / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: Smoothed ATR — EMA(ATR, 10) overlay
// Shows both raw and smoothed side-by-side to illustrate denoising
// ============================================================
function SmoothedATRAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Smoothed Volatility \u2014 EMA(ATR, 10)', w / 2, 14);

    const padL = 35;
    const padR = w - 15;
    const chartT = 36;
    const chartB = h - 38;
    const chartW = padR - padL;
    const chartH = chartB - chartT;

    const n = 50;
    const xStep = chartW / (n - 1);

    // Generate noisy ATR series
    const atr: number[] = [];
    for (let i = 0; i < n; i++) {
      // Slow trend (underlying volatility regime) plus noise
      const trend = 1.5 + Math.sin(i * 0.15 + t * 0.3) * 0.7;
      const noise = (Math.sin(i * 1.7 + t) + Math.cos(i * 2.3 + t * 0.8)) * 0.35;
      atr.push(trend + noise);
    }

    // EMA smoothing
    const alpha = 2.0 / (10 + 1);
    const ema: number[] = [atr[0]];
    for (let i = 1; i < n; i++) ema.push(alpha * atr[i] + (1 - alpha) * ema[i - 1]);

    const all = [...atr, ...ema];
    const mn = Math.min(...all) - 0.1;
    const mx = Math.max(...all) + 0.1;
    const toY = (v: number) => chartB - ((v - mn) / (mx - mn)) * (chartH - 8) - 4;

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(padL, chartT); ctx.lineTo(padL, chartB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, chartB); ctx.lineTo(padR, chartB); ctx.stroke();

    // Raw ATR (jaggy)
    ctx.strokeStyle = 'rgba(255,179,0,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    atr.forEach((v, i) => { const x = padL + i * xStep; const y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Smoothed EMA (clean)
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ema.forEach((v, i) => { const x = padL + i * xStep; const y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Sample points highlighting the 10-bar spacing used for momentum
    const cycle = Math.floor((t * 0.5) % 1 * (n - 10));
    const iNow = 30 + Math.floor(Math.sin(t) * 5);
    const iPast = iNow - 10;

    if (iPast >= 0 && iNow < n) {
      // Highlight both points
      [iPast, iNow].forEach((idx, k) => {
        const x = padL + idx * xStep;
        const y = toY(ema[idx]);
        const pulse = 1 + Math.sin(t * 5) * 0.2;
        ctx.fillStyle = k === 0 ? '#F9A825' : '#00B3A4';
        ctx.beginPath(); ctx.arc(x, y, 4 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 4 * pulse, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = k === 0 ? '#F9A825' : '#00B3A4';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(k === 0 ? 'volSm[10]' : 'volSm', x, y - 10);
      });

      // Arrow between them
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(padL + iPast * xStep, toY(ema[iPast]));
      ctx.lineTo(padL + iNow * xStep, toY(ema[iNow]));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Legend
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,179,0,0.7)';
    ctx.fillText('\u2014 Raw ATR(14)', padL, chartT + 10);
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText('\u2014 Smoothed ATR EMA(10)', padL + 85, chartT + 10);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Smoothing isolates the underlying volatility trend so the momentum calculation sees regime, not noise', w / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: Volatility Momentum — the % rate of change calculation
// (volSm - volSm[10]) / volSm[10] * 100
// ============================================================
function VolMomentumAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.013;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Volatility Momentum \u2014 Percent Rate of Change', w / 2, 14);

    // Formula display centered
    const fmlY = 34;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('volMomPct = (volSm - volSm[10]) / volSm[10] \u00d7 100', w / 2, fmlY);

    // Three example scenarios
    const examples = [
      { label: 'EXPANSION', now: 1.80, past: 1.20, color: '#00B3A4' },
      { label: 'STEADY (TRANS.)', now: 1.30, past: 1.28, color: '#F9A825' },
      { label: 'DECAY', now: 1.10, past: 1.60, color: '#8A8A8A' },
    ];

    const pW = (w - 40) / 3;
    const pY = 58;
    const pH = h - 85;
    const gap = 8;

    examples.forEach((ex, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = ex.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = ex.color + '66';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = ex.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ex.label, x + pW / 2, pY + 14);

      // Two bars: past vs now
      const pulse = 0.85 + Math.sin(t * 3 + i) * 0.15;
      const mY = pY + 26;
      const mH = pH - 58;
      const maxVal = 2.0;
      const bW = (pW - 30) / 2;

      // Past bar
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, mY, bW, mH);
      const pastFill = mH * (ex.past / maxVal) * pulse;
      ctx.fillStyle = 'rgba(249,168,37,0.7)';
      ctx.fillRect(x + 10, mY + mH - pastFill, bW, pastFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('volSm[10]', x + 10 + bW / 2, mY - 3);
      ctx.fillText(ex.past.toFixed(2), x + 10 + bW / 2, mY + mH + 9);

      // Now bar
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + pW - 10 - bW, mY, bW, mH);
      const nowFill = mH * (ex.now / maxVal);
      ctx.fillStyle = ex.color + 'cc';
      ctx.fillRect(x + pW - 10 - bW, mY + mH - nowFill, bW, nowFill);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText('volSm', x + pW - 10 - bW / 2, mY - 3);
      ctx.fillText(ex.now.toFixed(2), x + pW - 10 - bW / 2, mY + mH + 9);

      // Momentum calculation readout
      const mom = ((ex.now - ex.past) / ex.past) * 100;
      ctx.fillStyle = ex.color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${mom >= 0 ? '+' : ''}${mom.toFixed(1)}%`, x + pW / 2, pY + pH - 14);

      // Annotation
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      const note = i === 0 ? 'volatility rising \u2191' : (i === 1 ? 'volatility stable' : 'volatility falling \u2193');
      ctx.fillText(note, x + pW / 2, pY + pH - 3);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: THE SECOND-DERIVATIVE PRINCIPLE (★ GROUNDBREAKING)
// Shows ATR value vs ATR change — same ATR, different regimes
// ============================================================
function SecondDerivativeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Second-Derivative Principle \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Same ATR value, completely different markets', w / 2, 28);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 38); ctx.lineTo(mid, h - 12); ctx.stroke();

    // LEFT: stable ATR at 200 for 50 bars
    ctx.fillStyle = 'rgba(138,138,138,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STABLE \u2014 ATR = 200', mid / 2, 48);
    ctx.fillStyle = 'rgba(138,138,138,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('steady for 50 bars', mid / 2, 58);

    const padLL = 15;
    const padLR = mid - 15;
    const chartT = 68;
    const chartB = h - 38;
    const chartH = chartB - chartT;
    const n = 40;
    const xStepL = (padLR - padLL) / (n - 1);

    // Baseline at top of chart shows "200" mark
    const lineL = chartT + chartH * 0.3;

    // Stable ATR line — flat at 200
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      const y = lineL + Math.sin(i * 0.3 + t) * 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 200 label
    ctx.fillStyle = 'rgba(224,224,224,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('200', padLR - 22, lineL - 4);

    // Below: VSI histogram showing low momentum (transition/zero)
    const histY = chartT + chartH * 0.6;
    const histH = chartH * 0.35;
    const histMid = histY + histH / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padLL, histY, padLR - padLL, histH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padLL, histY, padLR - padLL, histH);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padLL, histMid); ctx.lineTo(padLR, histMid); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      const v = Math.sin(i * 0.8 + t) * 2; // very small oscillation
      ctx.fillStyle = 'rgba(249,168,37,0.7)';
      ctx.fillRect(x + 0.5, v >= 0 ? histMid - Math.abs(v) : histMid, xStepL - 1, Math.abs(v));
    }

    ctx.fillStyle = 'rgba(249,168,37,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VSI \u2248 0% \u2014 TRANSITION', (padLL + padLR) / 2, histY + histH + 10);

    // RIGHT: ATR surging from 50 to 200
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ACCELERATING \u2014 ATR = 200', mid + mid / 2, 48);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('was 50 twenty bars ago', mid + mid / 2, 58);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (n - 1);

    // ATR line rising from bottom to top
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      // Flat-low at 50, then rising curve to 200
      let val: number;
      if (i < 12) val = 50 + Math.sin(i + t) * 3;
      else val = 50 + ((i - 12) / 28) * 150 + Math.sin(i + t) * 4;
      const y = chartT + chartH * 0.55 - (val / 220) * (chartH * 0.4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(224,224,224,0.7)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('50', padRL + 3, chartT + chartH * 0.5);
    ctx.textAlign = 'right';
    ctx.fillText('200', padRR - 3, chartT + chartH * 0.2);

    // VSI histogram — positive expanding
    const histY2 = chartT + chartH * 0.6;
    const histMid2 = histY2 + histH / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padRL, histY2, padRR - padRL, histH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padRL, histY2, padRR - padRL, histH);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(padRL, histMid2); ctx.lineTo(padRR, histMid2); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      let v = 0;
      if (i >= 12) v = Math.min(20, (i - 12) * 1.2 + Math.sin(i + t) * 2);
      ctx.fillStyle = v >= 5 ? 'rgba(0,179,164,0.9)' : 'rgba(249,168,37,0.8)';
      ctx.fillRect(x + 0.5, histMid2 - v, xStepR - 1, v);
    }

    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VSI = +28% \u2014 EXPANSION', (padRL + padRR) / 2, histY2 + histH + 10);

    // Bottom annotation
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ATR tells you where you are. VSI tells you where you\'re going.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 6: The ±5% Symmetric Thresholds
// ============================================================
function ThresholdSymmetryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.013;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The \u00b15% Symmetric Thresholds', w / 2, 14);

    const padL = 35;
    const padR = w - 20;
    const chartT = 32;
    const chartB = h - 40;
    const chartH = chartB - chartT;
    const chartW = padR - padL;
    const midY = (chartT + chartB) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, chartT, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, chartT, chartW, chartH);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();

    // Threshold lines
    const thrOffset = chartH * 0.17;
    const thrUp = midY - thrOffset;
    const thrDn = midY + thrOffset;
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(padL, thrUp); ctx.lineTo(padR, thrUp); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, thrDn); ctx.lineTo(padR, thrDn); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(245,158,11,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+5% (EXPANSION gate)', padR - 4, thrUp - 3);
    ctx.fillText('-5% (DECAY gate)', padR - 4, thrDn + 11);

    // Animated histogram crossing both thresholds
    const n = 48;
    const bW = chartW / n;
    for (let i = 0; i < n; i++) {
      const x = padL + i * bW;
      const v = Math.sin(i * 0.25 + t) * 20 + Math.sin(i * 0.6 + t * 0.6) * 8;

      let color = '#F9A825';
      if (v >= 5) color = '#00B3A4';
      else if (v <= -5) color = '#8A8A8A';

      const barY = v >= 0 ? midY - (v / 40) * (midY - chartT) : midY;
      const barH = Math.abs(v / 40) * (midY - chartT);
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x + 0.5, barY, bW - 1, barH);
    }

    // Zone labels
    ctx.fillStyle = 'rgba(0,179,164,0.7)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('EXPANSION', padL + 4, chartT + 11);
    ctx.fillStyle = 'rgba(249,168,37,0.75)';
    ctx.fillText('TRANSITION (deadband)', padL + 4, midY - 4);
    ctx.fillStyle = 'rgba(138,138,138,0.8)';
    ctx.fillText('DECAY', padL + 4, chartB - 5);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Symmetric by construction \u2014 expansion and decay treated identically', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 7: Stability Filter — flip-rate visualization
// ============================================================
function StabilityFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.011;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stability Filter \u2014 Flip Rate Over 20 Bars', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: stable momentum
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STABLE \u2014 stability = 0.85', mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('committed expansion regime', mid / 2, 44);

    const chartT = 56;
    const chartB = h - 40;
    const chartH = chartB - chartT;
    const midY = (chartT + chartB) / 2;
    const n = 30;
    const padLL = 15;
    const padLR = mid - 15;
    const xStepL = (padLR - padLL) / n;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padLL, midY); ctx.lineTo(padLR, midY); ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < n; i++) {
      const x = padLL + i * xStepL;
      // Mostly positive stable expansion
      const v = 18 + Math.sin(i * 0.3 + t) * 5 + (i === 14 ? -25 : 0); // one rare flip
      const barY = v >= 0 ? midY - (v / 40) * (chartH / 2) : midY;
      const barH = Math.abs(v / 40) * (chartH / 2);
      ctx.fillStyle = v >= 0 ? 'rgba(0,179,164,0.85)' : 'rgba(138,138,138,0.85)';
      ctx.fillRect(x + 0.5, barY, xStepL - 1, barH);
    }

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('state retains confirmation', mid / 2, h - 15);

    // RIGHT: unstable — high flip rate
    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('UNSTABLE \u2014 stability = 0.30', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(249,168,37,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('stability override \u2192 forced TRANSITION', mid + mid / 2, 44);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / n;

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padRL, midY); ctx.lineTo(padRR, midY); ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < n; i++) {
      const x = padRL + i * xStepR;
      const v = Math.sin(i * 0.95 + t) * 22 + Math.cos(i * 0.6 + t) * 10;
      const barY = v >= 0 ? midY - (v / 40) * (chartH / 2) : midY;
      const barH = Math.abs(v / 40) * (chartH / 2);
      // All bars show as amber because stability override forces TRANSITION
      ctx.fillStyle = 'rgba(249,168,37,0.85)';
      ctx.fillRect(x + 0.5, barY, xStepR - 1, barH);
    }

    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('state forced amber regardless of size', mid + mid / 2, h - 15);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('stability = 1 - flipRate over stabilityLen bars \u2022 < 0.5 \u2192 forced TRANSITION', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: The Persistence Contract (shared with MPR)
// Slightly different illustration — focused on 3-state candidate tracking
// ============================================================
function PersistenceContractAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Persistence Contract \u2014 3 Bars to Commit', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const laneY = 36;
    const laneH = 28;
    const laneW = padR - padL;

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RAW STATE (bar-by-bar)', padL, laneY - 3);

    const bars = 22;
    const bW = laneW / bars;
    const cycle = Math.floor((t * 0.3) % 1 * 20);

    // 0 = transition, 1 = expansion, -1 = decay
    const rawSeq = [0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, 0, 0];

    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const state = rawSeq[i];
      let color = '#F9A825';
      if (state === 1) color = '#00B3A4';
      else if (state === -1) color = '#8A8A8A';
      const active = i <= cycle;
      ctx.fillStyle = color + (active ? '99' : '22');
      ctx.fillRect(x + 1, laneY, bW - 2, laneH);
    }

    // Legend
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,179,164,0.85)'; ctx.fillText('\u25A0 expansion', padL, laneY + laneH + 10);
    ctx.fillStyle = 'rgba(249,168,37,0.85)'; ctx.fillText('\u25A0 transition', padL + 80, laneY + laneH + 10);
    ctx.fillStyle = 'rgba(138,138,138,0.85)'; ctx.fillText('\u25A0 decay', padL + 160, laneY + laneH + 10);

    // Counter lane
    const counterY = laneY + laneH + 26;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('CANDIDATE COUNTER (persistBars = 3)', padL, counterY - 3);

    let count = 0;
    let candidate = 0;
    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const active = i <= cycle;
      if (active) {
        if (i === 0) { candidate = rawSeq[i]; count = 1; }
        else if (rawSeq[i] === candidate) count += 1;
        else { candidate = rawSeq[i]; count = 1; }
      }
      const displayCount = active ? count : 0;
      const filled = Math.min(3, displayCount);
      for (let j = 0; j < 3; j++) {
        const dotY = counterY + j * 5;
        ctx.fillStyle = j < filled ? (filled >= 3 ? '#00B3A4' : '#F9A825') : 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + bW / 2 - 2, dotY, 4, 3);
      }
    }

    // Confirmed lane
    const confirmedY = counterY + 28;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('CONFIRMED STATE (committed reading)', padL, confirmedY - 3);

    let cCount = 0;
    let cState = 0;
    let cCandidate = 0;
    for (let i = 0; i < bars; i++) {
      const x = padL + i * bW;
      const active = i <= cycle;
      if (active) {
        if (i === 0) { cCandidate = rawSeq[i]; cCount = 1; }
        else if (rawSeq[i] === cCandidate) cCount += 1;
        else { cCandidate = rawSeq[i]; cCount = 1; }
        if (cCount >= 3) cState = cCandidate;
      }
      let color = '#F9A825';
      if (cState === 1) color = '#00B3A4';
      else if (cState === -1) color = '#8A8A8A';
      ctx.fillStyle = active ? color + 'dd' : color + '22';
      ctx.fillRect(x + 1, confirmedY, bW - 2, laneH - 8);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same contract as MPR. Committed states only \u2014 flickers filtered.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 9: The Volatility Cycle (4 phases)
// ============================================================
function VolatilityCycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Volatility Cycle \u2014 4 Phases', w / 2, 14);

    // Split: left = price/atr chart, right = current phase badge
    const padL = 30;
    const padR = w - 15;
    const chartT = 34;
    const chartB = h - 38;
    const chartH = chartB - chartT;
    const chartW = padR - padL;

    // Two sub-panels stacked
    const p1H = chartH * 0.45;
    const p1B = chartT + p1H;
    const p2T = p1B + 8;
    const p2H = chartB - p2T;

    const n = 60;
    const xStep = chartW / (n - 1);

    // Price line that compresses then expands then compresses
    const prices: number[] = [];
    const atrs: number[] = [];
    for (let i = 0; i < n; i++) {
      // 4 phases: 0-15 stable, 15-30 expansion, 30-45 peak/decay, 45-60 trough
      let volFactor: number;
      if (i < 15) volFactor = 0.4;
      else if (i < 30) volFactor = 0.4 + ((i - 15) / 15) * 1.5;
      else if (i < 45) volFactor = 1.9 - ((i - 30) / 15) * 1.3;
      else volFactor = 0.6 - ((i - 45) / 15) * 0.2;

      const base = 100 + Math.sin(i * 0.3 + t) * 0.8;
      prices.push(base + Math.sin(i * 0.8 + t) * volFactor * 2);
      atrs.push(volFactor);
    }

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1B - ((v - pMin) / (pMax - pMin)) * (p1H - 8) - 4;

    // Price label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL, chartT - 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // VSI colored histogram
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('VSI (cycle through all 3 states)', padL, p2T - 2);

    const midY2 = p2T + p2H / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY2); ctx.lineTo(padR, midY2); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      // VSI approximates the derivative of atrs
      const deriv = i > 0 ? (atrs[i] - atrs[i - 1]) * 150 : 0;
      let color = '#F9A825';
      if (deriv >= 5) color = '#00B3A4';
      else if (deriv <= -5) color = '#8A8A8A';
      const barY = deriv >= 0 ? midY2 - Math.min(p2H / 2 - 3, Math.abs(deriv)) : midY2;
      const barH = Math.min(p2H / 2 - 3, Math.abs(deriv));
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // Phase markers at top
    const phaseX = [7, 22, 37, 52];
    const phaseNames = ['STABLE', 'EXPANSION', 'DECAY', 'TROUGH'];
    const phaseColors = ['#F9A825', '#00B3A4', '#8A8A8A', '#F9A825'];

    phaseX.forEach((px, i) => {
      const x = padL + px * xStep;
      ctx.strokeStyle = phaseColors[i] + '55';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = phaseColors[i];
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(phaseNames[i], x, h - 5);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 10: Stop Placement Application
// Shows stops adjusted by VSI state (wider in expansion, tighter in decay)
// ============================================================
function StopPlacementAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Application \u2014 Stop Placement Adjustment', w / 2, 14);

    // Three scenarios
    const scenarios = [
      { label: 'DECAY', color: '#8A8A8A', stopMult: 1.5, note: 'tighter stops \u2014 vol decaying' },
      { label: 'TRANSITION', color: '#F9A825', stopMult: 2.0, note: 'standard stops \u2014 baseline' },
      { label: 'EXPANSION', color: '#00B3A4', stopMult: 3.0, note: 'wider stops \u2014 vol expanding' },
    ];

    const pW = (w - 40) / 3;
    const pY = 32;
    const pH = h - 52;
    const gap = 8;

    scenarios.forEach((sc, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = sc.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = sc.color + '66';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = sc.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(sc.label, x + pW / 2, pY + 14);

      // Entry price marker (center)
      const entryY = pY + pH * 0.5;
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(x + 12, entryY); ctx.lineTo(x + pW - 12, entryY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('entry', x + 14, entryY - 2);

      // Stop distance (ATR * multiplier) — scaled visually
      const baseDist = 15;
      const stopDist = baseDist * sc.stopMult / 2;
      const stopY = entryY + stopDist;

      // Pulsing stop line
      const pulse = 0.5 + Math.sin(t * 3 + i) * 0.3;
      ctx.strokeStyle = `rgba(239,68,68,${pulse + 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + 12, stopY); ctx.lineTo(x + pW - 12, stopY); ctx.stroke();
      ctx.fillStyle = 'rgba(239,68,68,1)';
      ctx.font = 'bold 7px system-ui';
      ctx.fillText('stop', x + 14, stopY + 9);

      // Volatility envelope visual (translucent gradient showing where price might wander)
      ctx.fillStyle = sc.color + '20';
      ctx.fillRect(x + 12, entryY - stopDist, pW - 24, stopDist * 2);

      // Distance annotation
      ctx.fillStyle = sc.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`ATR \u00d7 ${sc.stopMult}`, x + pW / 2, pY + pH - 22);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui';
      ctx.fillText(sc.note, x + pW / 2, pY + pH - 10);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VSI state informs position sizing \u2014 decay reduces stop, expansion widens it', w / 2, h - 3);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 11: VSI × MPR × MSI Confluence stack
// ============================================================
function ConfluenceStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VSI \u00d7 MPR \u00d7 MSI \u2014 The Oscillator Stack', w / 2, 14);

    const padL = 20;
    const padR = w - 15;
    const xR = padR - padL;

    const pH = (h - 45) / 4;
    const p1Y = 26;
    const p2Y = p1Y + pH + 4;
    const p3Y = p2Y + pH + 4;
    const p4Y = p3Y + pH + 4;

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
      if (i < 15) prices.push(100 + Math.sin(i * 0.3 + t) * 0.4);
      else if (i < 35) prices.push(100 + (i - 15) * 0.25 + Math.sin(i + t) * 0.4);
      else prices.push(105 + Math.sin(i * 0.3 + t) * 0.6);
    }
    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1Y + pH - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 12);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // PANE 2: VSI
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, pH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('VSI (volatility change)', padL + 4, p2Y + 10);

    const midY2 = p2Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY2); ctx.lineTo(padR, midY2); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = 0; let c = '#8A8A8A';
      if (i < 15) { v = -10 + Math.sin(i + t) * 3; c = '#8A8A8A'; }
      else if (i < 22) { v = 8 + Math.sin(i + t) * 4; c = '#00B3A4'; }
      else if (i < 35) { v = 20 + Math.sin(i + t) * 3; c = '#00B3A4'; }
      else { v = -5 + Math.sin(i + t) * 3; c = '#F9A825'; }
      const barY = v >= 0 ? midY2 - (v / 40) * (pH / 2 - 3) : midY2;
      const barH = Math.abs(v / 40) * (pH / 2 - 3);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // PANE 3: MPR
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p3Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p3Y, xR, pH);
    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPR (pressure regime)', padL + 4, p3Y + 10);

    const midY3 = p3Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY3); ctx.lineTo(padR, midY3); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = 0; let c = '#8A8A8A';
      if (i < 15) { v = -20 + Math.sin(i + t) * 5; c = '#8A8A8A'; }
      else if (i < 22) { v = -3 + Math.sin(i + t) * 4; c = '#F9A825'; }
      else if (i < 35) { v = 25 + Math.sin(i + t) * 4; c = '#00B3A4'; }
      else { v = 10 + Math.sin(i + t) * 3; c = '#00B3A4'; }
      const barY = v >= 0 ? midY3 - (v / 40) * (pH / 2 - 3) : midY3;
      const barH = Math.abs(v / 40) * (pH / 2 - 3);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // PANE 4: MSI regime ribbon
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p4Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p4Y, xR, pH);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MSI regime', padL + 4, p4Y + 10);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let c = '#5F6B7A';
      if (i < 15) c = '#5F6B7A';
      else if (i < 22) c = '#C28B2C';
      else if (i < 35) c = '#3A8F6B';
      else c = '#C28B2C';
      ctx.fillStyle = c;
      ctx.fillRect(x, p4Y + pH - 14, xStep - 1, 10);
    }

    // Confluence line
    const confX = padL + 28 * xStep;
    ctx.strokeStyle = 'rgba(245,158,11,0.75)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(confX, p1Y); ctx.lineTo(confX, p4Y + pH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FULL CONFLUENCE', confX, p1Y - 2);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// ANIMATION 12: The Forex Caveat — threshold scaling
// Shows why ±5% default might need adjustment for tight-range pairs
// ============================================================
function ForexCaveatAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Asset Class Behavior \u2014 Same Thresholds, Different Cadence', w / 2, 14);

    const markets = [
      { label: 'CRYPTO (BTC)', range: 0.9, color: '#F59E0B', note: '\u00b15% triggers often' },
      { label: 'EQUITIES (SPY)', range: 0.55, color: '#0ea5e9', note: '\u00b15% default fits well' },
      { label: 'MAJORS (EURUSD)', range: 0.25, color: '#22C55E', note: 'may need \u00b13%' },
    ];

    const pW = (w - 40) / 3;
    const pY = 32;
    const pH = h - 48;
    const gap = 8;

    markets.forEach((mk, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = mk.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = mk.color + '66';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = mk.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(mk.label, x + pW / 2, pY + 13);

      // Draw VSI histogram scaled to range
      const midY = pY + pH * 0.55;
      const chartY = pY + 22;
      const chartH = pH - 50;
      const midLineY = chartY + chartH / 2;

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.moveTo(x + 8, midLineY); ctx.lineTo(x + pW - 8, midLineY); ctx.stroke();

      // ±5% threshold
      const thrOffset = chartH * 0.10;
      ctx.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x + 8, midLineY - thrOffset); ctx.lineTo(x + pW - 8, midLineY - thrOffset); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 8, midLineY + thrOffset); ctx.lineTo(x + pW - 8, midLineY + thrOffset); ctx.stroke();
      ctx.setLineDash([]);

      // Histogram scaled by range
      const n = 20;
      const bW = (pW - 16) / n;
      for (let j = 0; j < n; j++) {
        const bx = x + 8 + j * bW;
        const v = Math.sin(j * 0.5 + t + i) * 20 * mk.range;
        let color = 'rgba(249,168,37,0.85)';
        if (v >= 5) color = 'rgba(0,179,164,0.85)';
        else if (v <= -5) color = 'rgba(138,138,138,0.85)';
        const barY = v >= 0 ? midLineY - (v / 30) * (chartH / 2) : midLineY;
        const barH = Math.abs(v / 30) * (chartH / 2);
        ctx.fillStyle = color;
        ctx.fillRect(bx + 0.5, barY, bW - 1, barH);
      }

      // Note
      ctx.fillStyle = mk.color;
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(mk.note, x + pW / 2, pY + pH - 16);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '6px system-ui';
      ctx.fillText(`typical range: \u00b1${Math.round(30 * mk.range)}%`, x + pW / 2, pY + pH - 5);
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME DATA — 5 rounds testing VSI interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'Trader A looks at BTC and sees ATR of 200. Trader B looks at BTC and sees ATR of 200. Both think they&apos;re reading the same market. Which trader has the critical missing piece of information?',
    options: [
      { text: 'Both traders are missing the same critical piece: whether ATR is RISING (expansion), FALLING (decay), or STABLE (transition). A market with ATR of 200 that was 50 bars ago is an entirely different trading environment from one where ATR has been 200 for 50 bars. The raw value is static; the regime is dynamic. VSI measures the dynamic \u2014 the Second-Derivative Principle in action.', correct: true, explain: 'Exactly right. This is the core insight of the Second-Derivative Principle. ATR by itself tells you \u201chow volatile is the market right now?\u201d but answers nothing about direction of change. A trader who stops at ATR is trading a snapshot; a trader who checks VSI is trading the regime. For stop placement, position sizing, and breakout anticipation, the derivative is more actionable than the raw value.' },
      { text: 'Trader A \u2014 their reading is wrong', correct: false, explain: 'The reading isn\u2019t wrong. Both traders are seeing the same ATR. The issue is that ATR alone doesn\u2019t tell you whether you\u2019re at the start of an expansion, the peak, the start of decay, or a stable plateau. VSI fills that gap.' },
    ],
  },
  {
    scenario: 'VSI reads <strong>+28% (EXPANSION, teal)</strong>. What does this specifically mean about the market?',
    options: [
      { text: 'Smoothed ATR has risen approximately 28% over the last 10 bars. This is a volatility expansion regime \u2014 stops should be widened, position sizes should be scaled down, and breakout setups become more plausible (vol expansion often precedes directional moves). It does NOT tell you direction \u2014 only that volatility is increasing.', correct: true, explain: 'Precisely. VSI is directionally neutral; it only measures magnitude of change. +28% means the EMA of ATR is 28% higher than it was 10 bars ago. For crypto this is a meaningful expansion. Your operational response: widen stops (e.g., 3x ATR instead of 2x), scale position sizes down, and prepare for breakout-style moves. But don\u2019t mistake the reading for a directional signal \u2014 use MPR or MSI for direction.' },
      { text: 'The market is going up', correct: false, explain: 'This is the most common misreading of VSI. It\u2019s a volatility change measurement, not a price direction measurement. Volatility expansion can happen in both up trends and down trends (often more so in down trends). Using VSI as a directional signal will produce systematic errors.' },
    ],
  },
  {
    scenario: 'VSI has been <strong>amber TRANSITION</strong> for 30 bars while the pressure score in MPR shows strong positive readings. Why might VSI be transition while MPR is expansion?',
    options: [
      { text: 'They measure different things. MPR measures directional pressure (release/suppression of force). VSI measures volatility change (how fast ATR is moving). Price can have strong directional pressure while volatility stays roughly constant \u2014 a smooth trend is a great example: committed direction, stable volatility. The two readings are not in conflict; they\u2019re showing two different aspects of the same market.', correct: true, explain: 'This is the key insight of the oscillator stack. VSI, MPR, and MPG measure ORTHOGONAL properties of the market. Smooth trends often show MPR = RELEASE (strong pressure) + VSI = TRANSITION (stable volatility). Choppy markets often show MPR = TRANSITION + VSI = EXPANSION. News-driven moves often show MPR = RELEASE + VSI = EXPANSION. Each oscillator provides an independent diagnostic axis, and the confluence (or divergence) between them IS the read.' },
      { text: 'One of them must be wrong', correct: false, explain: 'Neither is wrong. The assumption that all oscillators should agree is the mistake. Oscillators that always agree are measuring the same thing and are redundant. ATLAS oscillators are designed to be orthogonal \u2014 they\u2019re telling you different things about the market, and the combination is where the diagnostic value lives.' },
    ],
  },
  {
    scenario: 'You\u2019re trading EURUSD on 1H and VSI almost never crosses the ±5% thresholds \u2014 it stays mostly in TRANSITION. What\u2019s happening and what do you do?',
    options: [
      { text: 'EURUSD has much lower volatility percentage-change cadence than crypto or equities. Its smoothed ATR rarely moves 5% within 10 bars because the underlying ATR values are small and stable relative to their own scale. Solution: reduce expansionThr to 3% and decayThr to -3% for FX majors, keeping symmetry. This rescales VSI to the native cadence of the instrument.', correct: true, explain: 'Exactly. The default ±5% thresholds were calibrated for high-volatility markets (crypto, equities). For FX majors like EURUSD where daily range is typically 50-80 pips on a $1.08 pair, percentage moves of 5% in ATR are relatively rare. Rescaling to ±3% preserves the symmetry (always keep them symmetric) while making VSI responsive to the actual cadence of the instrument. For even tighter pairs (USDJPY on short timeframes), you may need ±2%. Never introduce asymmetry.' },
      { text: 'VSI doesn\u2019t work on Forex \u2014 switch to a different indicator', correct: false, explain: 'VSI works perfectly well on Forex; the defaults just aren\u2019t calibrated for it. This is a tuning issue, not an architectural issue. The Pine source specifically exposes the thresholds as inputs precisely so they can be tuned for different asset classes.' },
    ],
  },
  {
    scenario: 'VSI reads <strong>-22% (DECAY, grey)</strong>. You\u2019re already in a long trade. What\u2019s the most professional read?',
    options: [
      { text: 'Volatility is contracting. This often precedes breakout opportunities as compression builds, and it means your current stop (likely set during expansion) is now wider than necessary. Consider: tightening your stop to lock in more profit, reducing position adds during compression (wait for expansion to resume), and being alert for the transition out of decay \u2014 that\u2019s often where the next directional move emerges.', correct: true, explain: 'This is the operational read. Decay = compression = tighter envelope around price. Stops set during expansion are now conservative, so you can tighten them without increasing your risk of being stopped by noise. Decay is often a precursor to expansion (volatility cycles between compression and expansion), so the transition OUT of decay is a high-attention moment. Don\u2019t exit the trade mechanically on VSI decay; interpret it as an environmental signal, not a direction signal.' },
      { text: 'Exit the long \u2014 decay means bearish', correct: false, explain: 'VSI decay says nothing about direction. A strong uptrend with decaying volatility just means the trend is proceeding calmly \u2014 often a positive sign, not a warning. Using VSI as a direction filter will systematically exit good trades prematurely.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Volatility State Index (VSI) measures:', opts: ['The current ATR value', 'The percent rate of change of smoothed ATR over 10 bars \u2014 volatility MOMENTUM, not volatility itself', 'Price direction', 'Volume relative to average'], correct: 1, explain: 'VSI is a derivative measurement. It tracks whether smoothed ATR is rising, falling, or stable \u2014 not ATR itself. This is the Second-Derivative Principle: ATR tells you where you are, VSI tells you where you\u2019re going.' },
  { q: 'The three VSI states are:', opts: ['Buy / Sell / Hold', 'EXPANSION (teal, +1) when volMomPct \u2265 +5% \u00b7 DECAY (grey, -1) when volMomPct \u2264 -5% \u00b7 TRANSITION (amber, 0) when between or unstable', 'High / Medium / Low', 'Bull / Bear / Neutral'], correct: 1, explain: 'Exact state definitions from Pine source. Note that unlike MPR (which has a 4th off-axis TRAP state), VSI has a clean 3-state model because volatility change is inherently one-dimensional \u2014 it can rise, fall, or be stable, with no off-axis pathology.' },
  { q: 'The core VSI calculation is:', opts: ['EMA of price', '(volSm - volSm[10]) / volSm[10] \u00d7 100 where volSm = EMA(ATR, 10)', 'ATR divided by price', 'High minus low'], correct: 1, explain: 'Exact Pine source: volMom = (volSm - volSmPrev) / volSmPrev followed by volMomPct = volMom * 100. This is the percent rate of change of smoothed ATR over the momentum lookback (default 10 bars).' },
  { q: 'Why is ATR smoothed with EMA(10) before the momentum calculation?', opts: ['To make the indicator slower', 'Raw ATR is too jaggy for meaningful momentum calculation \u2014 EMA smoothing isolates the underlying volatility trend so the momentum reflects regime change, not noise', 'To match RSI', 'For TradingView compatibility'], correct: 1, explain: 'Without smoothing, single-bar volatility spikes (news events, wicks) would dominate the momentum calculation, creating false expansion signals. EMA(ATR, 10) filters these out and leaves the underlying regime trend that VSI is designed to measure.' },
  { q: 'Like MPR, VSI uses the Persistence Contract. This means:', opts: ['Bar-by-bar classification', 'persistBars (default 3) consecutive bars of the same candidate state before the confirmed state changes \u2014 anti-flicker mechanism', 'Lagging indicator', 'Divergence-based trigger'], correct: 1, explain: 'Same contract as MPR: var int confirmedState updates only when candidateCount >= persistBars. A new state must persist for 3 bars before being reported. VSI shares this philosophy across the committed-state oscillator family.' },
  { q: 'When stability < 0.5, VSI forces:', opts: ['EXPANSION regardless of size', 'TRANSITION \u2014 unstable momentum (too many sign flips) means the reading is unreliable', 'DECAY', 'na (blank output)'], correct: 1, explain: 'Same stability override as MPR: if the sign of volMom has been flipping frequently in the stabilityLen window (flipRate > 0.5), the state is forced to TRANSITION. This protects against committing to EXPANSION or DECAY when the underlying momentum signal is too noisy to trust.' },
  { q: 'What\u2019s the correct operational response to VSI reading EXPANSION?', opts: ['Buy immediately', 'Volatility is rising \u2014 widen stops (e.g., 3x ATR vs 2x baseline), scale position sizes down, prepare for breakout-style moves. VSI says nothing about direction, only about environment.', 'Exit all positions', 'Ignore it'], correct: 1, explain: 'VSI is an environmental signal, not a directional signal. EXPANSION means the volatility envelope is widening \u2014 your position sizing and stop placement should respond to that, but your direction should come from MPR, MSI, or price action. Treating EXPANSION as a buy signal is the most common misuse of VSI.' },
  { q: 'For FX majors (EURUSD, GBPUSD), the default ±5% thresholds:', opts: ['Work perfectly as-is', 'May need to be tightened to ±3% because FX majors have smaller percent-change cadence in ATR than crypto/equities \u2014 keep them symmetric', 'Should be made asymmetric', 'Should never be changed'], correct: 1, explain: 'The defaults were calibrated for high-volatility assets. FX majors rarely experience 5%+ percent changes in ATR over 10 bars. Tightening to ±3% rescales VSI to FX cadence while preserving symmetry (ALWAYS keep them symmetric \u2014 asymmetric thresholds introduce directional bias).' },
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
export default function VSIDeepDiveLesson() {
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
    { wrong: 'Reading VSI as a directional signal', right: 'VSI is ENVIRONMENTAL, not directional. EXPANSION doesn\u2019t mean bullish. DECAY doesn\u2019t mean bearish. Volatility expansion happens in both up-trends and down-trends \u2014 often MORE in down-trends. Treating VSI as a direction tool will systematically wrong-foot you. It\u2019s a stop-placement/position-sizing input; let MPR and MSI handle direction.', icon: '\u{1F9ED}' },
    { wrong: 'Treating ATR and VSI as the same information', right: 'ATR = volatility magnitude. VSI = volatility MOMENTUM. They\u2019re different. An ATR of 200 is meaningless without knowing whether it\u2019s rising, falling, or stable. You can have the same ATR value in a vol-expansion regime (wide stops, breakout prep) or a vol-stable regime (normal stops, baseline trading). The Second-Derivative Principle is exactly the insight that these are different pieces of information.', icon: '\u{1F4CA}' },
    { wrong: 'Using default ±5% thresholds on EURUSD', right: 'FX majors have tighter percent-change cadence in ATR than crypto/equities. At ±5% default, VSI on EURUSD 1H will rarely leave the TRANSITION zone \u2014 making the tool effectively mute. Tune thresholds to ±3% for FX majors (keep them symmetric) to restore responsiveness. This is a calibration issue, not an architectural issue.', icon: '\u{1F4C8}' },
    { wrong: 'Expecting VSI, MPR, and MSI to always agree', right: 'They measure orthogonal properties. VSI = volatility change. MPR = directional pressure. MSI = overall regime. Each is a separate diagnostic axis. Smooth trends often show MPR=RELEASE + VSI=TRANSITION (committed direction, stable vol). News moves often show MPR=RELEASE + VSI=EXPANSION. The PATTERN of agreement/disagreement is the read. Expecting confluence on every bar misses the whole point of stacking independent diagnostics.', icon: '\u26A0\uFE0F' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 8</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Volatility<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>State Index</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The derivative oscillator. ATR tells you how volatile the market is. VSI tells you whether that volatility is expanding, decaying, or stable. Different question, different answer, critical distinction.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Derivative Oscillator</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every oscillator you&apos;ve met so far in the ATLAS suite measures something <em>about</em> the market. MAE measures where price is relative to an envelope. MSI classifies the current regime. MAZ shows acceptance zones. MPG measures participation. MPR measures pressure. All of them measure a <strong className="text-white">first-order property</strong> of the market.</p>
            <p className="text-gray-400 leading-relaxed mb-4">VSI breaks this pattern. It&apos;s an <strong className="text-amber-400">oscillator of an oscillator</strong> — it measures the <strong className="text-white">rate of change of ATR</strong>, not ATR itself. This makes it epistemically different from everything that came before it: it&apos;s a second-order signal, a derivative, a measurement of a measurement.</p>
            <p className="text-gray-400 leading-relaxed">Why does this matter? Because traders systematically conflate <em>volatility</em> with <em>volatility change</em>. A market with ATR = 200 that&apos;s been steady for 50 bars is profoundly different from one where ATR is 200 after climbing from 50 twenty bars ago. The raw value is identical. The regime is opposite. VSI is the instrument that makes this distinction visible — and it&apos;s the only ATLAS oscillator that operates on this level of abstraction.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE VSI AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">ATR tells you where you are. VSI tells you where you&apos;re going. Both readings matter. Neither replaces the other.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three States</p>
          <h2 className="text-2xl font-extrabold mb-4">Expansion, Decay, Transition</h2>
          <p className="text-gray-400 leading-relaxed mb-6">VSI has three states, not four. Unlike MPR (which adds an off-axis TRAP state for effort absorption), VSI&apos;s measurement space is one-dimensional: volatility can rise, fall, or stay stable. No pathological off-axis condition exists because there&apos;s no equivalent of &ldquo;absorbed volatility.&rdquo; The three states map cleanly to the three positions along the derivative axis.</p>
          <ThreeStatesRibbonAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 3 States and Not 4</p>
            <p className="text-sm text-gray-400">MPR has 4 states because pressure has a directional dimension (positive/negative) AND a pathology (absorption can coexist with either). VSI has no such pathology: rising vs falling volatility is the entire axis. Adding more states would be over-engineering. The 3-state model is the minimum sufficient encoding for a one-dimensional signal.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Base Volatility</p>
          <h2 className="text-2xl font-extrabold mb-4">Raw ATR Is Just the Starting Point</h2>
          <p className="text-gray-400 leading-relaxed mb-6">VSI starts with <code className="text-white">ta.atr(14)</code> — the standard Average True Range. ATR measures volatility magnitude as a rolling average of true range over 14 bars. But raw ATR is too noisy for a momentum calculation: single-bar spikes, news events, and wick patterns create jagged fluctuations that would swamp any rate-of-change derivation. That&apos;s why VSI applies smoothing BEFORE computing momentum.</p>
          <BaseATRAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why ATR and Not Standard Deviation</p>
            <p className="text-sm text-gray-400">Standard deviation measures dispersion around a mean; ATR measures true range (accounting for gaps and overnight moves). For futures, FX, and 24/7 markets alike, ATR is the more faithful volatility measurement because it includes open-to-prior-close gaps. Using stdev would understate volatility in gap-prone markets.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Smoothing Layer</p>
          <h2 className="text-2xl font-extrabold mb-4">EMA(ATR, 10) &mdash; Isolating the Regime</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Pine source applies <code className="text-white">ta.ema(volBase, 10)</code> to denoise the ATR series. This isolates the underlying <em>volatility trend</em> from single-bar noise. The smoothed series is what gets fed into the momentum calculation. Why EMA and not SMA? Because EMA weights recent values more heavily, making the smoothed series more responsive to actual regime changes while still filtering random spikes.</p>
          <SmoothedATRAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Two-Parameter Lookback</p>
            <p className="text-sm text-gray-400">VSI uses two lookbacks: smoothLen (EMA period, default 10) and momLen (momentum period, default 10). The smoothing handles noise; the momentum period defines the comparison window. Tuning smoothLen shorter makes VSI more reactive. Tuning momLen longer makes each reading a broader comparison (how has vol changed over a longer window). Most traders leave both at 10; they&apos;re calibrated for the broad asset universe.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Volatility Momentum</p>
          <h2 className="text-2xl font-extrabold mb-4">The Core Calculation</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The defining calculation of VSI: <code className="text-white">volMomPct = (volSm - volSm[10]) / volSm[10] × 100</code>. This is a standard rate-of-change formula applied to the smoothed ATR series. A reading of +28% means smoothed ATR is 28% higher than it was 10 bars ago. A reading of -15% means smoothed ATR is 15% lower. Zero means no change.</p>
          <VolMomentumAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Percent and Not Absolute Units</p>
            <p className="text-sm text-gray-400">If VSI output absolute ATR change (e.g., &ldquo;+30 points&rdquo;), the value would be meaningless across assets — +30 on BTC is different from +30 on SPY. Percent-based output normalizes across any instrument: +28% means the same thing on BTC, EURUSD, gold, or SPY. This is the reason thresholds are also in percent (±5%), making the entire indicator asset-agnostic by construction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Second-Derivative Principle &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Measuring a Measurement</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the conceptual breakthrough that makes VSI unique in the ATLAS suite. Every other indicator you&apos;ve encountered measures a <strong className="text-white">first-order property</strong> of the market directly. Price location, regime classification, acceptance zones, participation, pressure — all are direct measurements of something the market is doing. VSI is different. It measures the <strong className="text-white">rate of change</strong> of another measurement. ATR is the underlying signal. VSI is the derivative of that signal.</p>
          <SecondDerivativeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Second-Derivative Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">Traders systematically confuse volatility with volatility change. &ldquo;High ATR = volatile market&rdquo; is true but incomplete. The trader who only checks ATR is reading a <strong className="text-white">snapshot</strong>; the trader who checks VSI is reading a <strong className="text-white">trajectory</strong>. For stop placement, position sizing, breakout anticipation, and compression detection, the trajectory matters more than the snapshot. Two markets with identical ATR can require opposite operational responses — one with decaying vol calls for tight stops and expanded position size (compression is building); one with expanding vol calls for wide stops and reduced size (volatility is running). The Second-Derivative Principle is the recognition that <em>what ATR does</em> matters more than <em>what ATR is</em>, and VSI is the instrument that makes this actionable.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three operational implications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Stop placement becomes regime-aware.</strong> Instead of mechanically using &ldquo;2x ATR&rdquo; as your stop distance, scale it by VSI: 1.5x in DECAY (tight, because vol is contracting and noise is limited), 2.0x in TRANSITION (baseline), 3.0x in EXPANSION (because vol is running and normal noise will now be larger). This is a direct application of the second-derivative insight.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Breakout anticipation gains a leading edge.</strong> Markets that are compressing (sustained DECAY) are building energy for the next expansion. Watching VSI cross from DECAY through TRANSITION into EXPANSION is often a leading signal of the directional move that volatility expansion is setting up. The move itself comes from MPR or price; the <em>environment preparing</em> for the move comes from VSI.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Position sizing respects the trajectory, not just the level.</strong> Classical position sizing uses fixed-fractional risk and ATR-based stops. The Second-Derivative refinement: scale position size inversely to VSI. When vol is expanding, reduce position size even if your risk-per-trade percentage is the same — because the distribution of outcomes has fatter tails. This isn&apos;t captured by ATR alone; it requires VSI.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Threshold Symmetry</p>
          <h2 className="text-2xl font-extrabold mb-4">±5% By Design</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The EXPANSION and DECAY thresholds are symmetric at +5% and -5% by default. Same philosophy as MPR: symmetry is a constructional guarantee of no directional bias. VSI treats volatility expansion and volatility decay with perfect equivalence. If you observe more EXPANSION than DECAY on your chart, that&apos;s a property of the market, not of the indicator.</p>
          <ThresholdSymmetryAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Deadband Matters</p>
            <p className="text-sm text-gray-400">The ±5% deadband creates a TRANSITION zone at the neutral midpoint. Without it, volMomPct hovering near zero would constantly flip between EXPANSION and DECAY (since momentum always has a sign, it would flicker between +0.1% and -0.1%). The deadband is hysteresis: no commitment to a state change until the reading has meaningfully crossed into the new zone.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Stability Filter</p>
          <h2 className="text-2xl font-extrabold mb-4">How Often Does Momentum Flip Sign?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Same architecture as MPR. Stability = <code className="text-white">1 - flipRate</code> where flipRate is the rolling average of momentum sign changes over 20 bars. When stability drops below 0.5, the classifier <strong className="text-white">forces TRANSITION</strong> regardless of the current momentum value. The tool refuses to commit to EXPANSION or DECAY when the underlying signal is too noisy.</p>
          <StabilityFilterAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; No Off-Axis Exemption Needed</p>
            <p className="text-sm text-gray-400">Unlike MPR (where trap conditions are exempted from the stability override), VSI has no off-axis state, so the override applies uniformly. Every unstable reading becomes TRANSITION. This is a cleaner design made possible by the simpler state space — one more reason the 3-state model is appropriate for VSI.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Persistence Contract</p>
          <h2 className="text-2xl font-extrabold mb-4">Shared With MPR &mdash; 3 Bars Before Commitment</h2>
          <p className="text-gray-400 leading-relaxed mb-6">VSI inherits the Persistence Contract architecture from MPR. Any proposed state change must appear for <code className="text-white">persistBars</code> consecutive bars (default 3) before becoming the confirmed state. Flickers less than 3 bars long are filtered out. This gives VSI its committed-state feel: when it reports a state change, the market has actually committed to it.</p>
          <PersistenceContractAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Share the Contract Across Oscillators</p>
            <p className="text-sm text-gray-400">Consistency of philosophy. Every committed-state oscillator in the ATLAS suite uses the same 3-bar commitment contract because the reliability tradeoff (2-3 bars of lag for flicker-free states) is universally correct. When you see amber in VSI and amber in MPR, you know they both applied the same anti-flicker logic. This cross-tool consistency is what makes the oscillator stack read coherently.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Volatility Cycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Compression &rarr; Expansion &rarr; Peak &rarr; Decay</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Over enough time, volatility cycles through recognizable phases: <strong className="text-white">STABLE</strong> (compression building), <strong className="text-white">EXPANSION</strong> (volatility running), <strong className="text-white">DECAY</strong> (volatility contracting from peak), and back to <strong className="text-white">STABLE</strong> (new compression). VSI makes this cycle visible as a clean sine-like oscillation between the three states. Markets rarely sit at a single volatility level for long; they cycle.</p>
          <VolatilityCycleAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Cycle Is Universal</p>
            <p className="text-sm text-gray-400">This volatility cycling exists in every market at every timeframe — crypto, equities, FX, commodities, 1-minute to daily. The frequency and amplitude differ, but the pattern is the same. This universality is why VSI works as a single tool across the asset universe with just threshold tuning — the underlying cycle structure is invariant.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Application</p>
          <h2 className="text-2xl font-extrabold mb-4">Stop Placement Adjustment</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most concrete application of VSI. Instead of a fixed ATR multiplier for stops (e.g., always 2x ATR), scale by state: <strong className="text-white">1.5x in DECAY</strong> (tighter, vol contracting), <strong className="text-white">2.0x in TRANSITION</strong> (baseline), <strong className="text-white">3.0x in EXPANSION</strong> (wider, vol running). This single adjustment turns your stop distance from a static number into a regime-aware envelope — a direct operationalization of the Second-Derivative Principle.</p>
          <StopPlacementAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Symmetric Scaling Rule</p>
            <p className="text-sm text-gray-400">Whatever multiplier you use for your baseline stop (TRANSITION state), reduce it by ~25% in DECAY and increase it by ~50% in EXPANSION. These ratios are empirically robust across assets and timeframes. The point isn&apos;t the exact numbers — the point is that stop distance should scale with VSI, not stay fixed. A static 2x ATR stop will be systematically too tight in expansion and too loose in decay.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Oscillator Stack</p>
          <h2 className="text-2xl font-extrabold mb-4">VSI × MPR × MSI Together</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The full oscillator confluence stack. MSI tells you the <strong className="text-white">current market regime</strong>. MPR tells you the <strong className="text-white">directional pressure state</strong>. VSI tells you the <strong className="text-white">volatility trajectory</strong>. These three measure orthogonal properties, so their agreement or disagreement is the read. Full confluence (all three pointing the same way) is rare and powerful. Divergences (one says expansion while another says transition) are where the nuance lives.</p>
          <ConfluenceStackAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Reading the Triad</p>
            <p className="text-sm text-gray-400">Strongest setup: MSI = Trend Up + MPR = RELEASE + VSI = EXPANSION. All three pointing same way, breakout environment, committed direction. Weakest setup: MSI = Chop + MPR = TRANSITION + VSI = TRANSITION. All three amber, no commitment anywhere, stand aside. Nuanced setups: MSI = Trend Up + MPR = RELEASE + VSI = DECAY suggests a smooth mature trend (vol compressing into the trend, classic late-stage behavior). Use the triad as a full regime diagnostic, not as a signal generator.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Asset Class Calibration</p>
          <h2 className="text-2xl font-extrabold mb-4">Default Thresholds Aren&apos;t Universal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The ±5% defaults are calibrated for medium-to-high-volatility assets (crypto, equities, commodities). On FX majors like EURUSD, the percent-change cadence of ATR is tighter — 5% moves over 10 bars are rare. Left at defaults, VSI on EURUSD 1H will sit in TRANSITION most of the time, making the tool effectively mute. The fix: tune thresholds to ±3% for FX majors, keeping them symmetric.</p>
          <ForexCaveatAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Tuning Rule</p>
            <p className="text-sm text-gray-400">The target is to see VSI spend roughly 40-50% of time in TRANSITION and the remainder split between EXPANSION and DECAY. If yours is in TRANSITION 90% of the time, tighten thresholds. If yours is in EXPANSION/DECAY 90% of the time (rare, but happens on very high-vol assets at short timeframes), widen them. ALWAYS keep them symmetric — asymmetric thresholds silently bias your regime classification.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse VSI</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each traces back to the same root: reading VSI as something it isn&apos;t — typically as a direction tool or a momentum proxy — instead of reading it as what it is: a volatility-change oscillator.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">VSI In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Architecture</p>
                <p className="text-sm text-gray-300">Sub-pane oscillator, derivative measurement (rate of change of smoothed ATR), 3-state classifier, percent-based output.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Three States</p>
                <p className="text-sm text-gray-300">EXPANSION (teal, +1) vol rising · DECAY (grey, -1) vol falling · TRANSITION (amber, 0) stable or unstable.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Formula</p>
                <p className="text-sm text-gray-300">volMomPct = (volSm - volSm[10]) / volSm[10] × 100 &nbsp;where volSm = EMA(ATR, 10).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Thresholds (symmetric, tunable)</p>
                <p className="text-sm text-gray-300">±5% default. FX majors: ±3%. Always keep symmetric.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Persistence Contract</p>
                <p className="text-sm text-gray-300">persistBars = 3 default. Shared with MPR — same anti-flicker guarantee.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Stability Override</p>
                <p className="text-sm text-gray-300">When stability &lt; 0.5, force TRANSITION. No off-axis exemption needed.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Second-Derivative Principle (★)</p>
                <p className="text-sm text-gray-300">VSI measures a measurement. ATR tells you where you are, VSI tells you where you’re going. Different information.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Primary Application</p>
                <p className="text-sm text-gray-300">Stop scaling: 1.5x ATR in DECAY, 2.0x in TRANSITION, 3.0x in EXPANSION. Position sizing inversely to VSI.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Data Window Exports</p>
                <p className="text-sm text-gray-300">ATR raw/smoothed · Momentum % · Stability · State · Per-state booleans.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading VSI as a Volatility Derivative</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you read VSI for what it is — a second-order signal measuring volatility change — or whether you&apos;re still pattern-matching it to first-order oscillators.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read VSI as the derivative oscillator it is. The Second-Derivative Principle is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Second-Derivative Principle section before the quiz.' : 'Re-study the core formula and the Second-Derivative Principle before attempting the quiz.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">∇</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Volatility State Index</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Volatility Derivative Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.8-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
