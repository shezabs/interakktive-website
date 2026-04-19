// app/academy/lesson/market-acceptance-envelope-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.3: Market Acceptance Envelope Deep Dive [PRO]
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
// MAE-FAITHFUL HELPERS — recreating the real math
// ============================================================
const TEAL = '#26A69A';
const AMBER = '#F2C94C';
const MUTED_RED = '#EB5757';

// Generate a synthetic price series with controlled behavior
function generatePrices(pts: number, t: number, scenario: 'trend' | 'range' | 'mixed' | 'breakout' = 'mixed'): number[] {
  const prices: number[] = [];
  for (let i = 0; i < pts; i++) {
    let p = 100;
    if (scenario === 'trend') {
      p = 95 + (i / pts) * 14 + Math.sin(t + i * 0.2) * 2 + Math.sin(i * 0.5) * 1;
    } else if (scenario === 'range') {
      p = 100 + Math.sin(i * 0.2 + t) * 4 + Math.cos(i * 0.4) * 2;
    } else if (scenario === 'breakout') {
      p = i < pts * 0.6 ? 100 + Math.sin(i * 0.3 + t) * 2 : 100 + (i - pts * 0.6) * 0.3 + Math.sin(i * 0.3 + t) * 2;
    } else {
      p = 100 + Math.sin(t + i * 0.1) * 5 + Math.sin(t * 0.5 + i * 0.25) * 3 + Math.cos(i * 0.18) * 2;
    }
    prices.push(p);
  }
  return prices;
}

// Compute a simplified MAE for visualization — faithful to the Pine logic
function computeMAE(prices: number[], lookback: number = 15) {
  const n = prices.length;
  const centroids: number[] = [];
  const uppers: number[] = [];
  const lowers: number[] = [];
  const cores: { up: number; lo: number }[] = [];
  const confidences: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i < lookback) {
      centroids.push(prices[i]);
      uppers.push(prices[i] + 3);
      lowers.push(prices[i] - 3);
      cores.push({ up: prices[i] + 1, lo: prices[i] - 1 });
      confidences.push(0.3);
      continue;
    }

    // Efficiency proxy
    const startIdx = i - lookback;
    const netProgress = Math.abs(prices[i] - prices[startIdx]);
    let totalMovement = 0;
    for (let j = startIdx + 1; j <= i; j++) totalMovement += Math.abs(prices[j] - prices[j - 1]);
    const eff = Math.max(0, Math.min(1, totalMovement > 0 ? netProgress / totalMovement : 0));

    // Simple volatility stability (inverse of stdev over a small window)
    let sumSq = 0;
    let mean = 0;
    for (let j = Math.max(0, i - 10); j <= i; j++) mean += prices[j];
    mean /= Math.min(11, i + 1);
    for (let j = Math.max(0, i - 10); j <= i; j++) sumSq += Math.pow(prices[j] - mean, 2);
    const stdev = Math.sqrt(sumSq / Math.min(11, i + 1));
    const volStab = Math.max(0, Math.min(1, 1 - stdev / 5));

    // Dwell factor
    let sumLB = 0;
    for (let j = startIdx; j < i; j++) sumLB += prices[j];
    const smaLB = sumLB / lookback;
    let stdevLB = 0;
    for (let j = startIdx; j < i; j++) stdevLB += Math.pow(prices[j] - smaLB, 2);
    stdevLB = Math.sqrt(stdevLB / lookback);
    const zScore = stdevLB > 0 ? Math.abs(prices[i] - smaLB) / stdevLB : 0;
    const dwell = Math.max(0, Math.min(1, 1 - zScore / 3));

    // Weight
    const w = Math.max(0, Math.min(1, (1 - eff) * volStab * dwell));

    // Compute centroid via weighted sum
    let sumW = 0;
    let sumPW = 0;
    for (let j = startIdx; j < i; j++) {
      // We don't have per-bar weights stored, use a decay
      const wj = Math.exp(-(i - j) * 0.1) * (0.5 + Math.random() * 0.5);
      sumW += wj;
      sumPW += prices[j] * wj;
    }
    const centroidRaw = sumW > 0.01 ? sumPW / sumW : prices[i];
    const prev = centroids[i - 1] ?? centroidRaw;
    const centroid = prev + 0.15 * (centroidRaw - prev);

    // Asymmetric deviations
    let sumDevUp = 0;
    let sumDevDn = 0;
    for (let j = startIdx; j < i; j++) {
      const wj = Math.exp(-(i - j) * 0.1);
      sumDevUp += Math.max(prices[j] - centroid, 0) * wj;
      sumDevDn += Math.max(centroid - prices[j], 0) * wj;
    }
    const rngUp = sumDevUp / Math.max(sumW, 0.01);
    const rngDn = sumDevDn / Math.max(sumW, 0.01);

    const baseWidth = 0.6;
    const minWidth = 0.3;
    const upperWidth = Math.max(rngUp * 1.8 + baseWidth, minWidth);
    const lowerWidth = Math.max(rngDn * 1.8 + baseWidth, minWidth);

    const upperRaw = centroid + upperWidth;
    const lowerRaw = centroid - lowerWidth;

    const prevU = uppers[i - 1] ?? upperRaw;
    const prevL = lowers[i - 1] ?? lowerRaw;
    const upper = prevU + 0.25 * (upperRaw - prevU);
    const lower = prevL + 0.25 * (lowerRaw - prevL);

    // Confidence
    const conf = Math.max(0, Math.min(1, w * volStab));

    // Core glow band
    const coreFrac = 0.25 + (0.70 - 0.25) * conf;
    const coreUp = centroid + (upper - centroid) * coreFrac;
    const coreLo = centroid - (centroid - lower) * coreFrac;

    centroids.push(centroid);
    uppers.push(upper);
    lowers.push(lower);
    cores.push({ up: coreUp, lo: coreLo });
    confidences.push(conf);
  }

  return { centroids, uppers, lowers, cores, confidences };
}

// ============================================================
// ANIMATION 1: MAE vs Bollinger Bands — side by side contrast
// ============================================================
function MAEvsBBAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const mid = w / 2;
    const topH = 28;

    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('BOLLINGER BANDS — PREDICTIVE', mid / 2, 14);
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('MAE — DIAGNOSTIC', mid + mid / 2, 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 22); ctx.lineTo(mid, h - 8); ctx.stroke();

    const pts = 55;
    const prices = generatePrices(pts, t, 'mixed');
    const pMin = Math.min(...prices) - 3;
    const pMax = Math.max(...prices) + 3;
    const pRange = pMax - pMin;

    // LEFT: BB
    const padLx = 12;
    const padRx = mid - 12;
    const xStepL = (padRx - padLx) / (pts - 1);
    const toYL = (v: number) => topH + 8 + (1 - (v - pMin) / pRange) * (h - topH - 24);

    // Compute BB
    const bbUp: number[] = [];
    const bbLo: number[] = [];
    const bbMid: number[] = [];
    const period = 14;
    for (let i = 0; i < pts; i++) {
      if (i < period) { bbUp.push(prices[i] + 3); bbLo.push(prices[i] - 3); bbMid.push(prices[i]); continue; }
      let sum = 0;
      for (let j = i - period; j < i; j++) sum += prices[j];
      const sma = sum / period;
      let sumSq = 0;
      for (let j = i - period; j < i; j++) sumSq += Math.pow(prices[j] - sma, 2);
      const sd = Math.sqrt(sumSq / period);
      bbMid.push(sma);
      bbUp.push(sma + 2 * sd);
      bbLo.push(sma - 2 * sd);
    }

    // Fill BB
    ctx.fillStyle = 'rgba(239,68,68,0.08)';
    ctx.beginPath();
    bbUp.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx + i * xStepL; ctx.lineTo(x, toYL(bbLo[i])); }
    ctx.closePath(); ctx.fill();

    const drawL = (arr: number[], color: string, lw = 1, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.setLineDash(dash);
      ctx.beginPath();
      arr.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawL(bbUp, 'rgba(239,68,68,0.5)');
    drawL(bbLo, 'rgba(239,68,68,0.5)');
    drawL(bbMid, 'rgba(239,68,68,0.4)', 1, [2, 2]);

    // Price (BB side)
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Touch = "signal" markers (the BB failure mode)
    prices.forEach((v, i) => {
      if (i < period) return;
      if (v >= bbUp[i] * 0.98) {
        const x = padLx + i * xStepL;
        ctx.fillStyle = 'rgba(239,68,68,0.8)';
        ctx.beginPath(); ctx.arc(x, toYL(v), 2.5, 0, Math.PI * 2); ctx.fill();
      }
    });

    // BB label
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Symmetric · Touches = signals', padLx + 5, h - 8);

    // RIGHT: MAE
    const padLx2 = mid + 12;
    const padRx2 = w - 12;
    const xStepR = (padRx2 - padLx2) / (pts - 1);
    const toYR = (v: number) => topH + 8 + (1 - (v - pMin) / pRange) * (h - topH - 24);

    const mae = computeMAE(prices, 15);

    // Teal fill
    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.beginPath();
    mae.uppers.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx2 + i * xStepR; ctx.lineTo(x, toYR(mae.lowers[i])); }
    ctx.closePath(); ctx.fill();

    // Core glow band
    ctx.fillStyle = 'rgba(38,166,154,0.25)';
    ctx.beginPath();
    mae.cores.forEach((c, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(c.up)) : ctx.lineTo(x, toYR(c.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx2 + i * xStepR; ctx.lineTo(x, toYR(mae.cores[i].lo)); }
    ctx.closePath(); ctx.fill();

    const drawR = (arr: number[], color: string, lw = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      arr.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
      ctx.stroke();
    };
    drawR(mae.uppers, 'rgba(38,166,154,0.45)');
    drawR(mae.lowers, 'rgba(38,166,154,0.45)');

    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
    ctx.stroke();

    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Asymmetric · No signal philosophy · Acceptance fill', padLx2 + 5, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Live MAE Corridor Forming
// ============================================================
function CorridorAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 24;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MAE Anatomy — Corridor · Centroid · Core Glow', w / 2, 14);

    const pts = 70;
    const prices = generatePrices(pts, t, 'mixed');
    const mae = computeMAE(prices, 15);

    const allVals = [...prices, ...mae.uppers, ...mae.lowers];
    const pMin = Math.min(...allVals) - 0.5;
    const pMax = Math.max(...allVals) + 0.5;
    const pRange = pMax - pMin;

    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Outer corridor fill
    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.beginPath();
    mae.uppers.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(mae.lowers[i])); }
    ctx.closePath(); ctx.fill();

    // Core glow — darker inner band
    ctx.fillStyle = 'rgba(38,166,154,0.28)';
    ctx.beginPath();
    mae.cores.forEach((c, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(c.up)) : ctx.lineTo(x, toY(c.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(mae.cores[i].lo)); }
    ctx.closePath(); ctx.fill();

    // Boundary lines
    const drawLine = (arr: number[], color: string, lw = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      arr.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      ctx.stroke();
    };
    drawLine(mae.uppers, 'rgba(38,166,154,0.5)');
    drawLine(mae.lowers, 'rgba(38,166,154,0.5)');
    drawLine(mae.centroids, 'rgba(38,166,154,0.65)', 1);

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Callouts
    const lastI = pts - 1;
    const lastX = padL + lastI * xStep;
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.fillText('Upper', lastX - 3, toY(mae.uppers[lastI]) - 2);
    ctx.fillText('Centroid', lastX - 3, toY(mae.centroids[lastI]) - 2);
    ctx.fillText('Core ✨', lastX - 3, toY(mae.cores[lastI].up) + 6);
    ctx.fillText('Lower', lastX - 3, toY(mae.lowers[lastI]) + 9);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: Symmetric vs Asymmetric — why MAE is one-sided
// ============================================================
function AsymmetryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const mid = w / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Asymmetry — Markets Are Not Symmetric', w / 2, 14);

    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('SYMMETRIC (wrong)', mid / 2, 28);
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('ASYMMETRIC (MAE)', mid + mid / 2, 28);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 32); ctx.lineTo(mid, h - 12); ctx.stroke();

    // Generate trending price — creates natural asymmetry
    const pts = 55;
    const prices = generatePrices(pts, t, 'trend');
    const pMin = Math.min(...prices) - 3;
    const pMax = Math.max(...prices) + 3;
    const pRange = pMax - pMin;

    // LEFT: Symmetric — centered MA with equal bands
    const padLx = 15;
    const padRx = mid - 15;
    const xStepL = (padRx - padLx) / (pts - 1);
    const toYL = (v: number) => 38 + (1 - (v - pMin) / pRange) * (h - 58);

    // Compute symmetric "fake" bands
    const period = 12;
    const sym: { mid: number; up: number; lo: number }[] = [];
    for (let i = 0; i < pts; i++) {
      if (i < period) { sym.push({ mid: prices[i], up: prices[i] + 2, lo: prices[i] - 2 }); continue; }
      let sum = 0;
      for (let j = i - period; j < i; j++) sum += prices[j];
      const m = sum / period;
      let sumSq = 0;
      for (let j = i - period; j < i; j++) sumSq += Math.pow(prices[j] - m, 2);
      const sd = Math.sqrt(sumSq / period);
      sym.push({ mid: m, up: m + 2 * sd, lo: m - 2 * sd });
    }

    ctx.fillStyle = 'rgba(239,68,68,0.08)';
    ctx.beginPath();
    sym.forEach((s, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(s.up)) : ctx.lineTo(x, toYL(s.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx + i * xStepL; ctx.lineTo(x, toYL(sym[i].lo)); }
    ctx.closePath(); ctx.fill();

    const drawSym = (key: 'up' | 'lo' | 'mid', color: string, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash(dash);
      ctx.beginPath();
      sym.forEach((s, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(s[key])) : ctx.lineTo(x, toYL(s[key])); });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawSym('up', 'rgba(239,68,68,0.5)');
    drawSym('lo', 'rgba(239,68,68,0.5)');
    drawSym('mid', 'rgba(239,68,68,0.35)', [2, 2]);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Equal widths both sides', (padLx + padRx) / 2, h - 4);

    // RIGHT: Asymmetric MAE
    const padLx2 = mid + 15;
    const padRx2 = w - 15;
    const xStepR = (padRx2 - padLx2) / (pts - 1);

    const mae = computeMAE(prices, 15);

    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.beginPath();
    mae.uppers.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx2 + i * xStepR; ctx.lineTo(x, toYL(mae.lowers[i])); }
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'rgba(38,166,154,0.28)';
    ctx.beginPath();
    mae.cores.forEach((c, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(c.up)) : ctx.lineTo(x, toYL(c.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padLx2 + i * xStepR; ctx.lineTo(x, toYL(mae.cores[i].lo)); }
    ctx.closePath(); ctx.fill();

    const drawMAE = (arr: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      arr.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
      ctx.stroke();
    };
    drawMAE(mae.uppers, 'rgba(38,166,154,0.5)');
    drawMAE(mae.lowers, 'rgba(38,166,154,0.5)');

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Arrow showing upper width > lower width (because uptrend)
    const lastIR = pts - 1;
    const lxU = padLx2 + lastIR * xStepR;
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Widths differ per side', (padLx2 + padRx2) / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 4: The Four Primitives — bounded 0-1 meters
// ============================================================
function FourPrimitivesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Four Primitives — Acceptance Weight Formula', w / 2, 14);

    const meters = [
      { label: 'Efficiency', sublabel: '1 - eff', value: 0.35 + Math.sin(t) * 0.15, color: '#0ea5e9', note: 'net / total movement' },
      { label: 'Vol Stab', sublabel: 'volStab', value: 0.62 + Math.sin(t * 0.7) * 0.18, color: '#FFB300', note: '1 - (stdev/mean)' },
      { label: 'Dwell', sublabel: 'dwell', value: 0.74 + Math.sin(t * 1.1) * 0.12, color: '#22c55e', note: '1 - z/3' },
    ];

    const boxW = Math.min(110, (w - 80) / 4);
    const boxH = h - 100;
    const gap = 12;
    const meterTotalW = 3 * boxW + 2 * gap;
    const multX = 20 + meterTotalW + gap + 10;
    const resultX = multX + 30 + gap;
    const startX = 20;

    meters.forEach((m, i) => {
      const x = startX + i * (boxW + gap);
      const y = 32;

      // Box
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = m.color + '60';
      ctx.strokeRect(x, y, boxW, boxH);

      // Label
      ctx.fillStyle = m.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, x + boxW / 2, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(m.sublabel, x + boxW / 2, y + 26);

      // Vertical meter
      const meterH = boxH - 56;
      const meterY = y + 32;
      ctx.fillStyle = m.color + '20';
      ctx.fillRect(x + boxW / 2 - 8, meterY, 16, meterH);
      ctx.fillStyle = m.color;
      const fillH = meterH * m.value;
      ctx.fillRect(x + boxW / 2 - 8, meterY + meterH - fillH, 16, fillH);

      // Value
      ctx.fillStyle = m.color;
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(m.value.toFixed(2), x + boxW / 2, y + boxH - 12);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '6px system-ui';
      ctx.fillText(m.note, x + boxW / 2, y + boxH - 2);

      // × operator between meters
      if (i < 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 14px system-ui';
        ctx.fillText('×', x + boxW + gap / 2, y + boxH / 2 + 4);
      }
    });

    // = operator
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('=', multX, 32 + boxH / 2 + 4);

    // Result box — Weight
    const w_val = meters[0].value * meters[1].value * meters[2].value;
    const resultBoxW = 80;
    ctx.fillStyle = 'rgba(245,158,11,0.12)';
    ctx.fillRect(resultX, 32, resultBoxW, boxH);
    ctx.strokeStyle = 'rgba(245,158,11,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(resultX, 32, resultBoxW, boxH);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('WEIGHT', resultX + resultBoxW / 2, 46);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('w_0_1', resultX + resultBoxW / 2, 58);

    // Meter
    const rMeterH = boxH - 56;
    const rMeterY = 64;
    ctx.fillStyle = 'rgba(245,158,11,0.25)';
    ctx.fillRect(resultX + resultBoxW / 2 - 10, rMeterY, 20, rMeterH);
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(resultX + resultBoxW / 2 - 10, rMeterY + rMeterH - rMeterH * w_val, 20, rMeterH * w_val);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(w_val.toFixed(2), resultX + resultBoxW / 2, 32 + boxH - 12);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('weight', resultX + resultBoxW / 2, 32 + boxH - 2);

    // Bottom explanation
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Weight = (1 - eff) × volStab × dwell. Bounded [0,1]. Drives centroid and width.', w / 2, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: Weighted centroid vs simple MA
// ============================================================
function CentroidVsMAAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 24;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Weighted Centroid vs Simple Moving Average', w / 2, 14);

    const pts = 70;
    const prices = generatePrices(pts, t, 'mixed');

    // Simple MA
    const period = 15;
    const sma: number[] = [];
    for (let i = 0; i < pts; i++) {
      if (i < period) { sma.push(prices[i]); continue; }
      let s = 0;
      for (let j = i - period; j < i; j++) s += prices[j];
      sma.push(s / period);
    }

    // Weighted centroid
    const mae = computeMAE(prices, 15);

    const allVals = [...prices, ...sma, ...mae.centroids];
    const pMin = Math.min(...allVals) - 1;
    const pMax = Math.max(...allVals) + 1;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // SMA (red)
    ctx.strokeStyle = 'rgba(239,68,68,0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    sma.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();
    ctx.setLineDash([]);

    // Centroid (teal)
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    mae.centroids.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Legend
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('— Price', padL, chartT + 6);
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.fillText('⋯ Simple MA (treats all bars equally)', padL + 50, chartT + 6);
    ctx.fillStyle = '#26A69A';
    ctx.fillText('— MAE Centroid (weights bars by acceptance)', padL + 50, chartT + 18);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: Confidence-driven opacity
// ============================================================
function ConfidenceOpacityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 28;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Confidence → Opacity. Honest transparency.', w / 2, 14);

    // Draw 3 side-by-side corridors with different confidence levels
    const confLevels = [
      { conf: 0.25, label: 'LOW CONFIDENCE', subl: 'faint · uncertain' },
      { conf: 0.55, label: 'MEDIUM', subl: 'visible · working' },
      { conf: 0.9, label: 'HIGH CONFIDENCE', subl: 'solid · trust it' },
    ];

    const panelW = (padR - padL) / 3;
    confLevels.forEach((cl, ci) => {
      const xStart = padL + ci * panelW;
      const xEnd = xStart + panelW;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(cl.label, xStart + panelW / 2, chartT + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.fillText(cl.subl, xStart + panelW / 2, chartT + 20);

      // Confidence bar below
      ctx.fillStyle = 'rgba(38,166,154,0.15)';
      ctx.fillRect(xStart + 10, chartB - 8, panelW - 20, 4);
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(xStart + 10, chartB - 8, (panelW - 20) * cl.conf, 4);
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(`conf ${(cl.conf * 100).toFixed(0)}%`, xStart + panelW / 2, chartB + 10);

      // Synthetic wavy price in this panel
      const numPts = 40;
      const prices: number[] = [];
      for (let i = 0; i < numPts; i++) prices.push(50 + Math.sin(t + ci + i * 0.2) * 6 + Math.cos(i * 0.4) * 2);

      const mid = 50;
      // Width scales with confidence
      const corridorHalf = 5 + (1 - cl.conf) * 3;
      const upper: number[] = prices.map((_, i) => mid + corridorHalf + Math.sin(i * 0.3 + ci) * 0.8);
      const lower: number[] = prices.map((_, i) => mid - corridorHalf + Math.sin(i * 0.3 + ci) * 0.8);

      // Core glow — fraction expands with confidence
      const coreFrac = 0.25 + (0.7 - 0.25) * cl.conf;
      const cu = upper.map((u, i) => mid + (u - mid) * coreFrac);
      const cl_ = lower.map((l, i) => mid - (mid - l) * coreFrac);

      const yTop = chartT + 40;
      const yBot = chartB - 16;
      const yH = yBot - yTop;
      const vMin = 42;
      const vMax = 58;
      const vR = vMax - vMin;
      const toY = (v: number) => yBot - ((v - vMin) / vR) * yH;
      const xStep = (panelW - 20) / (numPts - 1);
      const xOff = xStart + 10;

      // Outer fill — opacity scales with confidence
      const outerA = 0.05 + cl.conf * 0.12;
      ctx.fillStyle = `rgba(38,166,154,${outerA})`;
      ctx.beginPath();
      upper.forEach((v, i) => { const x = xOff + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      for (let i = numPts - 1; i >= 0; i--) { const x = xOff + i * xStep; ctx.lineTo(x, toY(lower[i])); }
      ctx.closePath(); ctx.fill();

      // Core glow
      const coreA = 0.08 + cl.conf * 0.30;
      ctx.fillStyle = `rgba(38,166,154,${coreA})`;
      ctx.beginPath();
      cu.forEach((v, i) => { const x = xOff + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      for (let i = numPts - 1; i >= 0; i--) { const x = xOff + i * xStep; ctx.lineTo(x, toY(cl_[i])); }
      ctx.closePath(); ctx.fill();

      // Edges
      const edgeA = 0.2 + cl.conf * 0.5;
      ctx.strokeStyle = `rgba(38,166,154,${edgeA})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      upper.forEach((v, i) => { const x = xOff + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      ctx.stroke();
      ctx.beginPath();
      lower.forEach((v, i) => { const x = xOff + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      ctx.stroke();

      // Price
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      prices.forEach((v, i) => { const x = xOff + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      ctx.stroke();

      // Panel separator
      if (ci < 2) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(xEnd, chartT); ctx.lineTo(xEnd, chartB); ctx.stroke();
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: Core Glow expanding/contracting with acceptance
// ============================================================
function CoreGlowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 26;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Core Glow — Where Price REALLY Belongs', w / 2, 14);

    // Show oscillating core band width based on a pulsing "acceptance strength"
    const pts = 70;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      // Simulate cycles between high and low acceptance
      prices.push(100 + Math.sin(t + i * 0.12) * 3 + Math.sin(i * 0.3 + t * 0.5) * 2);
    }

    const upper: number[] = prices.map((p, i) => 100 + 5 + Math.sin(i * 0.15) * 0.4);
    const lower: number[] = prices.map((p, i) => 100 - 5 + Math.sin(i * 0.15) * 0.4);
    const centroid: number[] = prices.map(() => 100);

    // Varying confidence → varying coreFrac
    const confidence: number[] = [];
    for (let i = 0; i < pts; i++) {
      const phase = (i / pts + t * 0.05) * Math.PI * 2;
      confidence.push(0.5 + 0.4 * Math.sin(phase));
    }

    const cores = prices.map((_, i) => {
      const coreFrac = 0.25 + (0.7 - 0.25) * confidence[i];
      return {
        up: centroid[i] + (upper[i] - centroid[i]) * coreFrac,
        lo: centroid[i] - (centroid[i] - lower[i]) * coreFrac,
      };
    });

    const allVals = [...prices, ...upper, ...lower];
    const pMin = Math.min(...allVals) - 0.5;
    const pMax = Math.max(...allVals) + 0.5;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Outer fill
    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.beginPath();
    upper.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(lower[i])); }
    ctx.closePath(); ctx.fill();

    // Core — expands and contracts visually
    ctx.fillStyle = 'rgba(38,166,154,0.32)';
    ctx.beginPath();
    cores.forEach((c, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(c.up)) : ctx.lineTo(x, toY(c.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(cores[i].lo)); }
    ctx.closePath(); ctx.fill();

    // Edges
    ctx.strokeStyle = 'rgba(38,166,154,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    upper.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();
    ctx.beginPath();
    lower.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Live core width readout
    const curCoreFrac = 0.25 + (0.7 - 0.25) * confidence[pts - 1];
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`Core: ${(curCoreFrac * 100).toFixed(0)}% of corridor`, padR - 4, chartT + 10);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('expands with acceptance strength', padR - 4, chartT + 22);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: Stress Tinting — amber and muted red overlays
// ============================================================
function StressTintAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 26;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Stress Tinting — When Price Presses the Edge', w / 2, 14);

    const pts = 80;
    // Price that pushes to upper edge around middle
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const pressPhase = (i - pts * 0.4) / (pts * 0.25);
      let extraStress = 0;
      if (pressPhase > -1 && pressPhase < 1) {
        extraStress = (1 - Math.abs(pressPhase)) * 4;
      }
      prices.push(100 + Math.sin(t + i * 0.15) * 2 + extraStress);
    }

    const centroid = 100;
    const upper = 104;
    const lower = 96;
    const cores = { up: 102, lo: 98 };

    const allVals = [...prices];
    const pMin = 92;
    const pMax = 108;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 8) - 4;

    // Base teal fill
    ctx.fillStyle = 'rgba(38,166,154,0.12)';
    ctx.fillRect(padL, toY(upper), padR - padL, toY(lower) - toY(upper));

    // Core
    ctx.fillStyle = 'rgba(38,166,154,0.28)';
    ctx.fillRect(padL, toY(cores.up), padR - padL, toY(cores.lo) - toY(cores.up));

    // Stress overlay — segment-by-segment based on price pressure
    for (let i = 0; i < pts - 1; i++) {
      const p = prices[i];
      const distToUpper = Math.abs(upper - p);
      const distToLower = Math.abs(p - lower);
      const edgeDist = Math.min(distToUpper, distToLower);
      const edgeNorm = Math.max(0, Math.min(1, 1 - edgeDist / 1.5));
      // Low confidence + edge = stressed
      if (edgeNorm > 0.4) {
        const x1 = padL + i * xStep;
        const x2 = padL + (i + 1) * xStep;
        const stress = edgeNorm;
        const isExtreme = stress > 0.7;
        const overlayColor = isExtreme ? 'rgba(235,87,87,' : 'rgba(242,201,76,';
        const alpha = 0.12 + stress * 0.2;
        ctx.fillStyle = overlayColor + alpha + ')';
        ctx.fillRect(x1, toY(upper), x2 - x1, toY(lower) - toY(upper));
      }
    }

    // Edges
    ctx.strokeStyle = 'rgba(38,166,154,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, toY(upper)); ctx.lineTo(padR, toY(upper)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, toY(lower)); ctx.lineTo(padR, toY(lower)); ctx.stroke();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Legend
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.fillText('■ teal (accepted)', padL, chartT + 8);
    ctx.fillStyle = 'rgba(242,201,76,0.95)';
    ctx.fillText('■ amber (moderate stress)', padL + 90, chartT + 8);
    ctx.fillStyle = 'rgba(235,87,87,0.95)';
    ctx.fillText('■ muted red (extreme stress)', padL + 210, chartT + 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 9: Three States — Accepted / Stressed / Re-Entry
// ============================================================
function ThreeStatesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 32;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three Clarity States — Accepted · Stressed · Re-Entry', w / 2, 14);

    const pts = 100;
    const prices: number[] = [];
    const upper = 105;
    const lower = 95;
    const centroid = 100;

    for (let i = 0; i < pts; i++) {
      let p = centroid;
      // Segment 1: Accepted (inside)
      if (i < pts * 0.3) p = centroid + Math.sin(t + i * 0.2) * 2;
      // Segment 2: Stressed (pressing upper)
      else if (i < pts * 0.5) p = centroid + 3.5 + Math.sin(t + i * 0.3) * 1;
      // Segment 3: Outside
      else if (i < pts * 0.7) p = upper + 1 + Math.sin(t + i * 0.3) * 0.8;
      // Segment 4: Re-entry
      else p = centroid + 1 + Math.sin(t + i * 0.2) * 1.5;
      prices.push(p);
    }

    const xStep = (padR - padL) / (pts - 1);
    const pMin = 92;
    const pMax = 108;
    const pRange = pMax - pMin;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 10) - 5;

    // Fill
    ctx.fillStyle = 'rgba(38,166,154,0.12)';
    ctx.fillRect(padL, toY(upper), padR - padL, toY(lower) - toY(upper));
    ctx.fillStyle = 'rgba(38,166,154,0.28)';
    ctx.fillRect(padL, toY(103), padR - padL, toY(97) - toY(103));

    // Boundaries
    ctx.strokeStyle = 'rgba(38,166,154,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, toY(upper)); ctx.lineTo(padR, toY(upper)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, toY(lower)); ctx.lineTo(padR, toY(lower)); ctx.stroke();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Labels
    const placeLabel = (text: string, color: string, barIdx: number) => {
      const x = padL + barIdx * xStep;
      const y = toY(prices[barIdx]) - 18;
      ctx.fillStyle = color + '60';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const textW = text.length * 5 + 10;
      ctx.fillRect(x + 4, y, textW, 14);
      ctx.strokeRect(x + 4, y, textW, 14);
      ctx.fillStyle = color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(text, x + 8, y + 10);
    };

    // Only show labels in visible phases (throttled like the Pine MIN_LABEL_GAP)
    placeLabel('Accepted', '#26A69A', Math.floor(pts * 0.15));
    placeLabel('Stressed', '#F2C94C', Math.floor(pts * 0.4));
    placeLabel('Re-Entry', '#26A69A', Math.floor(pts * 0.75));

    // Bottom state map
    const stateY = h - 12;
    const states = [
      { start: 0, end: 0.3, label: 'Accepted', color: '#26A69A' },
      { start: 0.3, end: 0.5, label: 'Stressed', color: '#F2C94C' },
      { start: 0.5, end: 0.7, label: 'Outside', color: '#EB5757' },
      { start: 0.7, end: 1, label: 'Re-Entry', color: '#26A69A' },
    ];
    states.forEach(s => {
      const x1 = padL + s.start * (padR - padL);
      const x2 = padL + s.end * (padR - padL);
      ctx.fillStyle = s.color + '99';
      ctx.fillRect(x1, stateY - 4, x2 - x1 - 1, 4);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 10: Three Presets — Scalper / Swing / Position
// ============================================================
function PresetsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three Presets — Scalper · Swing · Position', w / 2, 14);

    const presets = [
      { name: 'SCALPER', sens: 1.3, smooth: 0.7, width: 0.8, color: '#0ea5e9', note: 'tight · fast' },
      { name: 'SWING', sens: 1.0, smooth: 1.0, width: 1.0, color: '#26A69A', note: 'balanced' },
      { name: 'POSITION', sens: 0.7, smooth: 1.4, width: 1.3, color: '#FFB300', note: 'wide · stable' },
    ];

    const panelW = (w - 40) / 3 - 6;
    const panelH = h - 60;
    const padX = 20;

    presets.forEach((p, pi) => {
      const x = padX + pi * (panelW + 9);
      const y = 32;

      // Panel background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, panelW, panelH);
      ctx.strokeStyle = p.color + '50';
      ctx.strokeRect(x, y, panelW, panelH);

      // Title
      ctx.fillStyle = p.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + panelW / 2, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(p.note, x + panelW / 2, y + 26);

      // Mini chart inside
      const chartX = x + 8;
      const chartW = panelW - 16;
      const chartY = y + 36;
      const chartH = panelH - 66;
      const pts = 30;
      const pr: number[] = [];
      for (let i = 0; i < pts; i++) pr.push(100 + Math.sin(t + i * 0.2 + pi) * 4 + Math.cos(i * 0.4) * 1.5);

      const xStep = chartW / (pts - 1);
      const pMin = 90;
      const pMax = 110;
      const vRange = pMax - pMin;
      const toY = (v: number) => chartY + chartH - ((v - pMin) / vRange) * chartH;

      // Corridor width scales with preset width
      const halfW = 5 * p.width;
      const coreHalf = halfW * 0.5;

      // Outer fill
      ctx.fillStyle = p.color + '22';
      ctx.fillRect(chartX, toY(100 + halfW), chartW, toY(100 - halfW) - toY(100 + halfW));
      // Core
      ctx.fillStyle = p.color + '40';
      ctx.fillRect(chartX, toY(100 + coreHalf), chartW, toY(100 - coreHalf) - toY(100 + coreHalf));
      // Edges
      ctx.strokeStyle = p.color + '80';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(chartX, toY(100 + halfW)); ctx.lineTo(chartX + chartW, toY(100 + halfW)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(chartX, toY(100 - halfW)); ctx.lineTo(chartX + chartW, toY(100 - halfW)); ctx.stroke();

      // Price
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      pr.forEach((v, i) => { const px = chartX + i * xStep; i === 0 ? ctx.moveTo(px, toY(v)) : ctx.lineTo(px, toY(v)); });
      ctx.stroke();

      // Stat line at bottom
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`sens×${p.sens} · smooth×${p.smooth} · width×${p.width}`, x + panelW / 2, y + panelH - 12);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Preset is a starting point. Sensitivity input refines further.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 11: MAE × Confluence — stacked with CIPHER + Sessions+
// ============================================================
function ConfluenceStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 24;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MAE × Sessions+ × CIPHER — Confluence Stack', w / 2, 14);

    const pts = 80;
    const prices = generatePrices(pts, t, 'mixed');
    const mae = computeMAE(prices, 15);

    const pMin = Math.min(...mae.lowers) - 1;
    const pMax = Math.max(...mae.uppers) + 1;
    const pRange = pMax - pMin;
    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    // Background — a subtle Sessions+ overlay (amber NY session box)
    const sessStart = Math.floor(pts * 0.35);
    const sessEnd = Math.floor(pts * 0.85);
    ctx.fillStyle = 'rgba(255,152,0,0.06)';
    ctx.fillRect(padL + sessStart * xStep, chartT, (sessEnd - sessStart) * xStep, chartH - 10);
    ctx.strokeStyle = 'rgba(255,152,0,0.4)';
    ctx.strokeRect(padL + sessStart * xStep, chartT, (sessEnd - sessStart) * xStep, chartH - 10);
    ctx.fillStyle = 'rgba(255,152,0,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('NY session', padL + sessStart * xStep + 4, chartT + 10);

    // MAE corridor
    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.beginPath();
    mae.uppers.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(mae.lowers[i])); }
    ctx.closePath(); ctx.fill();

    // Core
    ctx.fillStyle = 'rgba(38,166,154,0.28)';
    ctx.beginPath();
    mae.cores.forEach((c, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(c.up)) : ctx.lineTo(x, toY(c.up)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(mae.cores[i].lo)); }
    ctx.closePath(); ctx.fill();

    // Edges
    ctx.strokeStyle = 'rgba(38,166,154,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    mae.uppers.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();
    ctx.beginPath();
    mae.lowers.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // CIPHER signal marker — at lower boundary inside session (highest-confluence point)
    const sigIdx = Math.floor(pts * 0.55);
    const sigX = padL + sigIdx * xStep;
    const sigY = toY(prices[sigIdx]);
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.strokeStyle = 'rgba(245,158,11,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.arc(sigX, sigY, 7 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(sigX, sigY, 3, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFB300';
    ctx.fillText('CIPHER', sigX, sigY - 14);

    // Confluence readout
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Sessions+ NY box · MAE core support · CIPHER signal = triple confluence', padL + 2, chartB + 14);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION: Corridor Gravity Model (★ GROUNDBREAKING)
// Price returns to the corridor because AGENTS return to it.
// ============================================================
function CorridorGravityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Corridor Gravity Model \u2605', w / 2, 14);

    // Top half: corridor with price oscillating back toward it
    const padL = 20;
    const padR = w - 20;
    const chartT = 34;
    const chartB = h * 0.58;
    const chartH = chartB - chartT;
    const chartW = padR - padL;

    const centroid = 100;
    const pMin = 92;
    const pMax = 108;
    const pRange = pMax - pMin;
    const toY = (v: number) => chartT + (1 - (v - pMin) / pRange) * (chartH - 8) + 4;

    // Corridor bands (core + outer)
    const core = 2.5;
    const outer = 5;

    // Outer corridor
    ctx.fillStyle = 'rgba(0,179,164,0.10)';
    ctx.fillRect(padL, toY(centroid + outer), chartW, toY(centroid - outer) - toY(centroid + outer));
    // Core corridor
    ctx.fillStyle = 'rgba(0,179,164,0.22)';
    ctx.fillRect(padL, toY(centroid + core), chartW, toY(centroid - core) - toY(centroid + core));
    // Centroid line
    ctx.strokeStyle = 'rgba(0,179,164,0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(padL, toY(centroid)); ctx.lineTo(padR, toY(centroid)); ctx.stroke();
    ctx.setLineDash([]);

    // Price oscillating outside, pulled back inside
    const pts = 60;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const phase = i * 0.15 + t;
      // Price excursions that "gravitate" back
      const excursion = Math.sin(phase) * 6;
      const attraction = -excursion * 0.15;
      prices.push(centroid + excursion + attraction + Math.sin(phase * 2.5) * 0.8);
    }
    const xStep = chartW / (pts - 1);

    // Price path
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Gravity arrows at excursion points — show the pull
    for (let i = 8; i < pts; i += 12) {
      const v = prices[i];
      const dist = v - centroid;
      if (Math.abs(dist) > 3) {
        const x = padL + i * xStep;
        const arrowFrom = toY(v);
        const arrowTo = toY(v - dist * 0.3);
        ctx.strokeStyle = 'rgba(245,158,11,0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(x, arrowFrom); ctx.lineTo(x, arrowTo); ctx.stroke();
        ctx.setLineDash([]);
        // Arrowhead
        ctx.fillStyle = '#FFB300';
        ctx.beginPath();
        ctx.moveTo(x, arrowTo);
        const ah = dist > 0 ? 3 : -3;
        ctx.lineTo(x - 2, arrowTo + ah);
        ctx.lineTo(x + 2, arrowTo + ah);
        ctx.closePath(); ctx.fill();
      }
    }

    // Label corridor
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CORE CORRIDOR (agent operating range)', padL + 4, chartT + 12);

    // Bottom half: the MECHANISM — why gravity exists
    const mechY = chartB + 18;
    const mechH = h - mechY - 14;

    ctx.fillStyle = 'rgba(245,158,11,0.06)';
    ctx.fillRect(padL, mechY, chartW, mechH);
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    ctx.strokeRect(padL, mechY, chartW, mechH);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE MECHANISM', padL + chartW / 2, mechY + 12);

    // Three agent dots, pulsing
    const agentY = mechY + mechH / 2 + 4;
    const agents = [
      { x: padL + chartW * 0.2, label: 'MM bids', color: '#22c55e' },
      { x: padL + chartW * 0.5, label: 'MM asks', color: '#EF5350' },
      { x: padL + chartW * 0.8, label: 'desks', color: '#0ea5e9' },
    ];

    agents.forEach((a, i) => {
      const pulse = 0.5 + Math.sin(t * 4 + i * 2) * 0.25;
      ctx.fillStyle = a.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
      ctx.beginPath(); ctx.arc(a.x, agentY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(a.x, agentY, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = a.color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(a.label, a.x, agentY + 18);
    });

    // Arrows from each agent pulling inward (toward center)
    agents.forEach(a => {
      const centerX = padL + chartW * 0.5;
      if (Math.abs(a.x - centerX) > 5) {
        const sign = a.x < centerX ? 1 : -1;
        ctx.strokeStyle = 'rgba(245,158,11,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(a.x + sign * 10, agentY);
        ctx.lineTo(a.x + sign * 26, agentY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Agents operate inside the corridor. Price returns because THEY return, not because of math.', padL + chartW / 2, mechY + mechH - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MAE interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'You add MAE to your chart and see a wide, faint corridor with barely visible boundaries. The confidence readout shows 28%. What does this mean?',
    options: [
      { text: 'The indicator is broken &mdash; restart TradingView', correct: false, explain: 'Nothing is broken. MAE is being honest: the wide, faint rendering with low confidence is the indicator telling you that current conditions (low acceptance weight, unstable volatility, or price far from recent dwell zones) do not lend themselves to clean corridor diagnosis. The transparency IS the information &mdash; the tool is refusing to pretend certainty it does not have.' },
      { text: 'The indicator is transparently admitting low confidence. The corridor width is wide and opacity is faint because the underlying acceptance weight is low. Do not treat the boundaries as firm support/resistance in this state &mdash; wait for confidence to build.', correct: true, explain: 'Exactly right. MAE confidence = w × volStab × centroidStab. When that product is low, opacity lifts (boundaries fade) to signal &ldquo;do not trust this corridor.&rdquo; This is the diagnostic honesty principle in action. A typical indicator would render at full opacity and mislead you; MAE grays itself out to protect you.' },
    ],
  },
  {
    scenario: 'MAE shows a corridor with a narrow, bright core glow in the center and the overall width of the corridor is quite tight. What is the correct interpretation?',
    options: [
      { text: 'Strong acceptance environment. Narrow corridor + bright core glow + high confidence means price has a well-defined &ldquo;belonging zone.&rdquo; The core is the statistical heart of acceptance &mdash; where price spends most of its time. This is an ideal regime for mean-reversion strategies.', correct: true, explain: 'Correct. Core glow brightness scales with acceptance strength (the confidence score). A narrow bright core means high acceptance_0_1 &mdash; the mathematical equivalent of &ldquo;price is strongly belonging here.&rdquo; When you see this, the centroid is a reliable magnet and the core edges make excellent mean-reversion levels.' },
      { text: 'The market is about to break out &mdash; narrow corridor means compression', correct: false, explain: 'This inverts the MAE philosophy. Bollinger Band narrowing implies breakout risk. MAE narrowing means the OPPOSITE &mdash; price has found a stable acceptance zone. Reading MAE through a Bollinger lens will cost you money, because narrow + bright core is the MOST stable regime MAE can diagnose, not a pre-breakout compression.' },
    ],
  },
  {
    scenario: 'You see an AMBER tint on the upper half of the corridor, and the price is pressing against the upper boundary. What is the correct read?',
    options: [
      { text: 'Amber tint = sell signal &mdash; go short', correct: false, explain: 'MAE has no signals. Amber is a STATE classification, not a trigger. Amber appears when two conditions are both true: (1) confidence is below the low-conf threshold, AND (2) price is pressing an edge. It tells you &ldquo;the corridor is under stress from this side.&rdquo; That is diagnostic context &mdash; NOT an instruction to short.' },
      { text: 'The amber tint + edge pressure indicates a stress state: the corridor is under directional pressure during a low-confidence environment. This is a warning to size down or demand stronger confluence, not a trade signal in either direction. Watch for either acceptance restoration (tint fades) or structural break (price closes outside).', correct: true, explain: 'Exactly. Stress tinting is MAE&apos;s way of flagging that the current acceptance model is being challenged. The professional response is risk reduction and increased scrutiny &mdash; not a reactive trade. Treat it as information about uncertainty, not direction.' },
    ],
  },
  {
    scenario: 'The MAE upper boundary is sitting noticeably further from the centroid than the lower boundary. What does this asymmetry tell you?',
    options: [
      { text: 'The upper boundary is broken &mdash; the algorithm has a bug', correct: false, explain: 'Asymmetry is a core DESIGN feature of MAE, not a bug. Every classical band indicator (Bollinger, Keltner, Donchian) forces symmetric width. Markets are NOT symmetric &mdash; the distribution of deviations above and below a weighted centroid is rarely identical. MAE computes devUp and devDn INDEPENDENTLY, then applies weighted sums separately. Asymmetry reveals real information about directional acceptance.' },
      { text: 'The asymmetry reveals that upper deviations from the weighted centroid have been larger and/or more frequent than lower deviations over the lookback period. This is actual diagnostic information &mdash; markets are asymmetric, and MAE is one of the only band indicators that respects that mathematically.', correct: true, explain: 'Correct. MAE exposes `mae_asymmetry` as an export (range -1 to +1) specifically because this asymmetry IS information. Positive asymmetry means the corridor has been wider on the upside &mdash; traders are accepting excursions higher more than lower. A symmetric band indicator would smooth this information away and lie to you.' },
    ],
  },
  {
    scenario: 'You notice a &ldquo;Re-Entry&rdquo; label appears in Explain Mode when price comes back inside the corridor after having been outside. How should you use this?',
    options: [
      { text: 'Re-Entry = buy signal because price is coming back into acceptance', correct: false, explain: 'MAE has NO signals. The Re-Entry label is a CONTEXT annotation &mdash; it notes that a state change has occurred, from &ldquo;outside&rdquo; to &ldquo;inside.&rdquo; Whether this is a long, short, or wait depends entirely on the direction of re-entry, the confluence with other tools, and structural context. Using Re-Entry as a standalone signal is the exact retail failure mode MAE&apos;s philosophy rejects.' },
      { text: 'Re-Entry annotates a state transition, not a trade signal. It says &ldquo;price has returned to the acceptance zone after an excursion.&rdquo; Combine this with other context: direction of re-entry, structural rejection at the level, confluence with Sessions+ or CIPHER. Re-Entry itself is neutral &mdash; it simply tells you the acceptance model is back in effect.', correct: true, explain: 'Right. Re-Entry sits in the Explain Mode label set alongside &ldquo;Accepted&rdquo; and &ldquo;Stressed&rdquo; &mdash; all three are STATE annotations with no directional bias. They are the narrative equivalent of instrument readings, not trading instructions. The trader still decides.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market Acceptance Envelope (MAE) is fundamentally different from Bollinger Bands because:', opts: ['It uses a longer lookback', 'It computes upper and lower boundaries INDEPENDENTLY from a weighted centroid (asymmetric by design), whereas Bollinger Bands forces symmetric standard deviation around a simple MA', 'It uses ATR instead of standard deviation', 'It has more colors'], correct: 1, explain: 'BB is symmetric (±2σ from an SMA). MAE computes devUp and devDn independently, weighted by acceptance weight, producing an asymmetric corridor that reflects the true distribution of deviations.' },
  { q: 'The four primitives that feed the MAE acceptance weight are:', opts: ['Price, volume, time, volatility', 'Efficiency (1 - eff), Volatility Stability (volStab), Dwell Factor (dwell) &mdash; combined multiplicatively into w_0_1', 'RSI, MACD, ATR, VWAP', 'Support, resistance, trend, momentum'], correct: 1, explain: 'Weight = (1 - eff) × volStab × dwell. Efficiency penalises runaway moves. VolStab rewards stable volatility. Dwell rewards price being close to its mean. Low on any one = low acceptance weight.' },
  { q: 'The MAE core glow (inner darker band) represents:', opts: ['A secondary Bollinger Band', 'The historical high/low', 'The statistical heart of acceptance &mdash; a sub-band whose fractional width scales with the confidence score (wider when acceptance is strong)', 'A volume profile'], correct: 2, explain: 'The core glow fraction ranges from 0.25 (low confidence) to 0.70 (high confidence) of the corridor half-width. When confidence is high, the core expands to fill most of the corridor &mdash; visually encoding &ldquo;price REALLY belongs here.&rdquo;' },
  { q: 'MAE confidence (0-100) drives the corridor&apos;s:', opts: ['Width only', 'Transparency / opacity &mdash; higher confidence = more solid rendering, lower confidence = more transparent and faint', 'Color hue', 'Width and color simultaneously'], correct: 1, explain: 'Confidence maps to transparency (transp = 90 - confVis*15, clamped 75-90). When the indicator is not confident, it fades visually to warn the trader NOT to rely on the boundaries. Honest transparency in every sense.' },
  { q: 'Stress tinting (amber or muted red) appears when:', opts: ['Price crosses any moving average', 'Confidence is low AND price is pressing an edge of the corridor. Amber for moderate stress, muted red for extreme stress.', 'Volume spikes above average', 'MACD crosses its signal line'], correct: 1, explain: 'Stress = edgeNorm × (1 - conf). When confidence is low AND price is near an edge, the tint appears. Amber for moderate; muted red when stress exceeds 0.7 (extreme pressure during uncertainty).' },
  { q: 'The three MAE Explain Mode states are:', opts: ['Buy, Sell, Hold', 'Accepted (high confidence + inside), Stressed (low confidence + edge pressure), Re-Entry (returned inside after being outside)', 'Overbought, Neutral, Oversold', 'Bullish, Bearish, Ranging'], correct: 1, explain: 'All three are STATE annotations, not signals. The labels appear sparsely (throttled to 25-bar minimum gap) so they mark transitions, not every bar. This is the narrative engine concept in action.' },
  { q: 'The three MAE presets (Scalper / Swing / Position) adjust:', opts: ['The color scheme only', 'Sensitivity, smoothness, and width multipliers &mdash; Scalper is tight and fast; Swing is balanced (default); Position is wide and stable', 'The lookback period only', 'Which timeframe to calculate on'], correct: 1, explain: 'Scalper: kSens 1.3, kSmooth 0.7, kWidth 0.8 (tight/fast). Swing: all 1.0 (balanced). Position: kSens 0.7, kSmooth 1.4, kWidth 1.3 (wide/stable). The preset is a starting point; Envelope Sensitivity input refines further.' },
  { q: 'The core philosophy of MAE can be summarised as:', opts: ['Predict the next price', 'Generate buy and sell arrows', '&ldquo;Price belongs somewhere before it moves somewhere else&rdquo; &mdash; diagnose WHERE price is currently accepted, without claiming to predict future direction', 'Calculate volatility'], correct: 2, explain: 'The tagline is the philosophy compressed into one sentence. MAE is a diagnostic corridor, not a signal engine. It shows where price statistically belongs right now. Direction, entries, and exits come from other tools &mdash; MAE provides the acceptance context those tools sit within.' },
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
export default function MAEDeepDiveLesson() {
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
    { wrong: 'Treating MAE boundary touches as entry signals', right: 'MAE has NO signals by design. Boundaries are acceptance edges, not trade triggers. Price touching the upper boundary means &ldquo;we are at the edge of where price has been accepted&rdquo; &mdash; not &ldquo;sell here.&rdquo; Pair MAE with a signal tool (CIPHER, structural rejection) for actual entries.', icon: '🎯' },
    { wrong: 'Using MAE settings from Bollinger Bands muscle memory', right: 'MAE is not BB. The Acceptance Lookback behaves differently from a BB period. Sensitivity is not equivalent to standard deviation multiplier. Switch to the preset (Scalper / Swing / Position) that matches your style and tune from there, don&apos;t impose BB-era numbers.', icon: '🔢' },
    { wrong: 'Ignoring the stress tint and treating faint corridors as reliable', right: 'The transparency IS information. When the corridor fades (low confidence) or gains amber/red tint (stress), those visual signals are telling you the acceptance model is weak. Trading those conditions with normal size is how you get torched in conditions MAE was trying to warn you about.', icon: '👻' },
    { wrong: 'Reading MAE in isolation', right: 'MAE diagnoses WHERE price belongs statistically. It does not diagnose trend, structure, momentum, or session context. Stack it with Sessions+ (WHEN to trade), a structural tool like PHANTOM or SMC analysis (WHAT the structure is), and a trigger like CIPHER (WHY now). MAE is one lens, not the whole picture.', icon: '🧩' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 3</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market Acceptance<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Envelope</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Price belongs somewhere before it moves somewhere else. MAE is a diagnostic corridor &mdash; asymmetric, confidence-weighted, fully transparent. No arrows. No signals. Just acceptance intelligence.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Broken Promise of Bollinger Bands</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every trader learns Bollinger Bands. Every trader is taught that touches of the bands are reversal signals. Every trader loses money when they try it for the first time. The problem is not Bollinger Bands &mdash; it is the <strong className="text-amber-400">entire symmetric-band paradigm</strong>. Markets are not symmetric. Distributions around a moving average are not Gaussian. The upper deviation is rarely equal to the lower deviation.</p>
            <p className="text-gray-400 leading-relaxed mb-4">MAE exists to fix the class of indicator, not just the specific tool. It computes upper and lower boundaries <strong className="text-white">independently</strong>, weights them by a bounded acceptance score, fades visually when confidence is low, and <strong className="text-amber-400">refuses to produce signals</strong>. The corridor is not a trade map &mdash; it is an acceptance map.</p>
            <p className="text-gray-400 leading-relaxed">The core philosophy reads: &ldquo;<em>Price belongs somewhere before it moves somewhere else.</em>&rdquo; Every feature &mdash; asymmetry, confidence-driven opacity, the core glow, stress tinting, the refusal to generate signals &mdash; is a direct implementation of that one sentence.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; WHAT MAE IS NOT</p>
            <p className="text-sm text-gray-400 leading-relaxed">MAE is NOT Bollinger Bands (no standard deviation around a mean). It is NOT Keltner Channels (no ATR-scaled envelope). It is NOT a signal generator (the phrase &ldquo;touches = signals&rdquo; is explicitly rejected in the source code comments). It is a category of its own: a confidence-weighted asymmetric acceptance corridor. Treating it as a band indicator will make you lose money; treating it as a diagnostic lens will change how you read charts.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: MAE vs BB === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Category Shift</p>
          <h2 className="text-2xl font-extrabold mb-4">Predictive Bands vs Diagnostic Corridor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Bollinger Bands generates <strong className="text-red-400">touch-based signals</strong>: band touches are treated as reversal triggers. This fails constantly because symmetric bands force a Gaussian assumption markets do not satisfy. MAE rejects that whole paradigm &mdash; the corridor is <strong className="text-teal-400">the object</strong>, not the edges. The fill tells you where price is accepted; edges are implied, not emphasized.</p>
          <MAEvsBBAnim />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Bollinger Bands</p>
              <p className="text-[11px] text-gray-400">SMA ± 2σ (symmetric). Touches are taught as signals. Fails in trending markets. No confidence score. No acceptance concept.</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/15">
              <p className="text-xs font-extrabold text-teal-400 mb-1">MAE</p>
              <p className="text-[11px] text-gray-400">Weighted centroid, asymmetric widths, confidence-driven opacity. No signals by design. The fill IS the information.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02: Corridor Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">The Four Visual Elements</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every MAE render has four layers. The <strong className="text-teal-400">outer fill</strong> is the full acceptance corridor. The <strong className="text-teal-400">inner core glow</strong> (darker teal) is the statistical heart of acceptance &mdash; where price spends most of its time. The <strong className="text-teal-400">centroid</strong> (hidden by default but available) is the weighted anchor. The <strong className="text-teal-400">upper and lower boundaries</strong> are intentionally de-emphasized &mdash; thin lines rather than prominent bands.</p>
          <CorridorAnatomyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why The Fill Is The Object</p>
            <p className="text-sm text-gray-400">MAE&apos;s design treats the filled corridor itself as the primary visual. This is deliberate: if you emphasise the edges, your brain reads them as support/resistance and starts hunting touches &mdash; the exact failure mode the tool rejects. By making edges thin and the fill dominant, the eye reads &ldquo;acceptance region&rdquo; not &ldquo;two levels.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Asymmetry === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Asymmetry</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Upper ≠ Lower</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In MAE, <strong className="text-white">devUp and devDn are computed independently</strong>. Weighted sums of upward and downward deviations produce separate width estimates. The result: a corridor where the upper side can be 1.4× the lower (or vice versa). A Bollinger Band indicator would smooth this asymmetry away. MAE exposes it &mdash; because it IS information.</p>
          <AsymmetryAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The <code className="text-white">mae_asymmetry</code> Export</p>
            <p className="text-sm text-gray-400">MAE exposes asymmetry as a numerical export in the data window, ranging from -1 (fully bearish asymmetry) to +1 (fully bullish asymmetry). Positive means upper width exceeds lower width &mdash; traders are tolerating excursions higher more than excursions lower. This is a cleaner signal than simple slope measurement because it measures dispersion, not just direction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Four Primitives === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Primitives</p>
          <h2 className="text-2xl font-extrabold mb-4">Efficiency × VolStab × Dwell = Weight</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Everything in MAE derives from a single composite: the <strong className="text-amber-400">acceptance weight</strong>. The weight is the product of three bounded-[0,1] measurements: <strong className="text-sky-400">(1 - efficiency)</strong> &mdash; penalises directional movement; <strong className="text-amber-400">volStab</strong> &mdash; rewards stable volatility; and <strong className="text-green-400">dwell</strong> &mdash; rewards price being close to its recent mean. Multiply them, get the weight. That weight drives the centroid, the widths, and the confidence score.</p>
          <FourPrimitivesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Multiplication, Not Addition</p>
            <p className="text-sm text-gray-400">If any single primitive is low (say, volatility becomes unstable), the weight collapses toward zero because they multiply. This is deliberate: acceptance is an AND condition, not an OR. All three must be true simultaneously for the corridor to express high conviction. Additive weighting would average away failures; multiplicative weighting preserves them.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Centroid === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Centroid</p>
          <h2 className="text-2xl font-extrabold mb-4">The Weighted Anchor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A simple moving average treats every bar equally &mdash; a violent spike counts the same as a quiet drift. The MAE centroid is <strong className="text-white">weighted by the acceptance score per bar</strong>. Bars with high acceptance weight (stable, low-efficiency, near-mean) pull the centroid harder. Bars during a spike contribute almost nothing. The result: a centroid that anchors on the market&apos;s stable equilibrium, not its transient chaos.</p>
          <CentroidVsMAAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Centroid Adaptivity</p>
            <p className="text-sm text-gray-400">The centroid uses an <em>adaptive</em> alpha: when the raw centroid jumps sharply (relative to recent volatility), the smoothing alpha increases to track the move faster. When conditions are quiet, alpha drops and smoothing dominates. This prevents both lag (in regime shifts) and noise (in stable periods) &mdash; a property a simple MA cannot match.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: Confidence === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Confidence &amp; Opacity</p>
          <h2 className="text-2xl font-extrabold mb-4">The Corridor Fades When It Doubts Itself</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MAE computes a <strong className="text-amber-400">confidence score (0-100)</strong> from three components: average acceptance weight, volatility stability, and centroid stability. That score maps directly to the corridor&apos;s transparency. High confidence → solid render (transparency ~75%). Low confidence → faint render (transparency ~90%). The corridor <strong className="text-white">physically fades</strong> when it doesn&apos;t trust itself.</p>
          <ConfidenceOpacityAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Honest Transparency In Every Sense</p>
            <p className="text-sm text-gray-400">Most indicators render at full opacity regardless of conditions &mdash; they tell you &ldquo;this is the answer&rdquo; even when their internal model is struggling. MAE rejects that. The faint corridor you see in low-conviction conditions is the tool being epistemically honest: &ldquo;I don&apos;t have strong data on where price belongs right now.&rdquo; That honesty saves more money than any single signal ever generates.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07: Core Glow === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Core Glow</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Price REALLY Belongs</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The outer corridor is <em>where price could be accepted</em>. The inner <strong className="text-teal-400">core glow</strong> is <em>where price really spends its time</em>. The core fraction ranges from 25% of the corridor (low acceptance) to 70% (peak acceptance). Visually, you watch the core <strong className="text-white">expand</strong> as acceptance strengthens and <strong className="text-white">contract</strong> as the market gets restless. It&apos;s the most powerful single visual cue MAE offers.</p>
          <CoreGlowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Reading The Core</p>
            <p className="text-sm text-gray-400">Wide bright core = price has a well-defined belonging zone; mean-reversion trades toward the centroid are most defensible. Narrow core = acceptance is thinning; the corridor itself may be about to reshape. Core touching one side persistently = directional acceptance shift is in progress. Core invisible = confidence is too low to render it. Every visual state maps to a specific trader decision.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08: Stress Tint === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Stress Tinting</p>
          <h2 className="text-2xl font-extrabold mb-4">Amber and Muted Red</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When <strong className="text-white">price presses an edge</strong> AND <strong className="text-white">confidence is low</strong>, MAE overlays a stress tint on the affected side. <strong className="text-amber-400">Amber</strong> for moderate stress, <strong className="text-red-400">muted red</strong> for extreme (stress &gt; 70%). This is NOT a signal. It is the corridor saying: &ldquo;the acceptance model is being challenged from this side during a low-conviction environment.&rdquo; Your job is to respond to that information, not to trade it.</p>
          <StressTintAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Professional Stress Response</p>
            <p className="text-sm text-gray-400">Amber appears: reduce your size, tighten your stops, require stronger confluence before entering. Muted red appears: consider standing aside entirely until the stress resolves. Either the tint fades (acceptance returns) or price breaks out (model was signaling a regime shift). Both outcomes are valuable; forcing trades during stress tinting is fighting the information MAE is giving you for free.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: Three States === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Explain Mode States</p>
          <h2 className="text-2xl font-extrabold mb-4">Accepted &middot; Stressed &middot; Re-Entry</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Enable Explain Mode and MAE drops sparse text labels on the chart at state transitions. <strong className="text-teal-400">Accepted</strong> = high confidence + price inside corridor. <strong className="text-amber-400">Stressed</strong> = edge pressure during low conviction. <strong className="text-teal-400">Re-Entry</strong> = price returned inside after being outside. Labels are throttled to a 25-bar minimum gap so they mark transitions, not every bar. This is the narrative engine principle in miniature.</p>
          <ThreeStatesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Labels ≠ Signals</p>
            <p className="text-sm text-gray-400">&ldquo;Accepted&rdquo; does not mean buy. &ldquo;Stressed&rdquo; does not mean sell. &ldquo;Re-Entry&rdquo; does not mean fade the move. These are STATE annotations &mdash; they describe what the acceptance model is doing, not what you should do. Traders who mentally convert them into triggers are re-introducing the exact failure mode MAE was built to prevent.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10: Presets === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Three Presets</p>
          <h2 className="text-2xl font-extrabold mb-4">Scalper &middot; Swing &middot; Position</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MAE ships with three presets that scale sensitivity, smoothness, and width. <strong className="text-sky-400">Scalper</strong> (sens 1.3, smooth 0.7, width 0.8) produces tight corridors that track fast. <strong className="text-teal-400">Swing</strong> (all 1.0) is balanced and is the default. <strong className="text-amber-400">Position</strong> (sens 0.7, smooth 1.4, width 1.3) produces wide stable corridors for longer horizons. The preset is a <strong className="text-white">starting point</strong>; the Envelope Sensitivity input refines from there.</p>
          <PresetsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Match Preset to Timeframe, Not Taste</p>
            <p className="text-sm text-gray-400">A swing preset on a 1-minute chart produces a corridor so wide it is useless. A scalper preset on a daily chart produces a corridor so tight it fires stress tints constantly. Rule of thumb: Scalper on ≤15m, Swing on 30m-4H, Position on Daily+. Deviate only if you&apos;ve watched the tool on your chart long enough to know what &ldquo;good acceptance render&rdquo; looks like for your style.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11: MAE Confluence === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; ATLAS Confluence</p>
          <h2 className="text-2xl font-extrabold mb-4">MAE × Sessions+ × CIPHER</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MAE alone is incomplete &mdash; it diagnoses WHERE price belongs. To trade it, you need WHEN (Sessions+ session context), WHAT structure supports it (PHANTOM or SMC read), and WHY now (CIPHER signal or structural trigger). The strongest setups emerge where <strong className="text-white">all four vectors align</strong>: inside a session&apos;s active killzone, at a structural level, with MAE&apos;s core supporting the direction, and a CIPHER signal firing.</p>
          <ConfluenceStackAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Confluence Equation</p>
            <p className="text-sm text-gray-400">MAE = WHERE (acceptance zone). Sessions+ = WHEN (institutional window). PHANTOM/SMC = WHAT (structure). CIPHER = WHY NOW (trigger). Remove any one and you have a trade missing a dimension. Stack all four and you have the ATLAS full-picture setup &mdash; which is why MAE is an essential free tool even for PRO subscribers.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12: Corridor Gravity Model (★ GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Corridor Gravity Model &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Price Actually Returns to the Envelope</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Here&apos;s the question most traders never ask: <em>why should price respect the MAE corridor at all?</em> The mathematics derive a corridor; the market has no reason to care about your math. The real answer is not technical &mdash; it&apos;s <strong className="text-white">agent-based</strong>. The corridor is not a line price &ldquo;wants&rdquo; to return to. The corridor is a visualization of <strong className="text-white">where institutional agents have decided to operate</strong>. Price returns to it because <em>the agents enforcing it are still there</em>.</p>
          <CorridorGravityAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127780; The Gravity Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">Think of it like planetary orbit. A planet returns to its orbit not because the orbit pulls &mdash; the orbit is just a line. It returns because the gravitational sources (the sun, the physics) are still there, continuously enforcing the trajectory. The MAE corridor works the same way: it is a <strong className="text-white">visualization of the gravitational field</strong> produced by market makers posting bids and asks, institutional desks managing inventory, and liquidity providers quoting two-sided markets. When price excursions outside the corridor, the agents haven&apos;t moved &mdash; they are still quoting around the same equilibrium. So price returns. When the agents <em>do</em> move (regime shift, news, fundamental repricing), the corridor breaks &mdash; and the MAE&apos;s re-centering logic picks up the new equilibrium. <strong className="text-white">The corridor tracks the agents, not the price.</strong></p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Why this framing matters operationally:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">A widening corridor means agents are re-pricing.</strong> Not &ldquo;the math is confused&rdquo; &mdash; the institutional inventory is being re-valued. That&apos;s a regime transition in progress. Trade accordingly (reduce size, widen stops, wait for re-stabilization).</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">A break of the outer band isn&apos;t always a breakout.</strong> If the agents haven&apos;t actually moved (check Sessions+ activity, check MSI regime), the excursion is a stop hunt and gravity will reassert. If they <em>have</em> moved, the corridor re-centers. The confidence opacity change is the tool&apos;s way of telling you which is happening.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">The STRESSED state is agents under pressure, not confused math.</strong> Amber tint means the corridor is being tested aggressively &mdash; the agents are still there but getting challenged. Most of the time they win (mean reversion). Sometimes they lose (regime break). The tint is a live diagnostic of that battle.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S13: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MAE</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most common MAE support conversations all share one root: the trader treating it like a Bollinger Band. Here are the four mistakes that pattern produces.</p>
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

      {/* === S13: Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">MAE In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Axiom</p>
                <p className="text-sm text-gray-300">Price belongs somewhere before it moves somewhere else.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Weight Formula</p>
                <p className="text-sm text-gray-300">w = (1 - eff) × volStab × dwell. All three bounded 0-1. Multiplicative.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Visual Elements</p>
                <p className="text-sm text-gray-300">Outer corridor (full acceptance zone) · Core glow (acceptance heart) · Centroid (optional) · Boundary edges (de-emphasized).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Confidence → Opacity</p>
                <p className="text-sm text-gray-300">High confidence = solid render. Low confidence = faint render. Honest transparency.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Stress Tinting</p>
                <p className="text-sm text-gray-300">Amber = moderate edge pressure during low conviction. Muted red = extreme stress (&gt;70%). Not signals &mdash; warnings.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Explain Mode States</p>
                <p className="text-sm text-gray-300">Accepted · Stressed · Re-Entry. State annotations, not triggers. Throttled to 25-bar minimum gap.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Presets</p>
                <p className="text-sm text-gray-300">Scalper (tight/fast) · Swing (balanced default) · Position (wide/stable). Match to timeframe.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Data Exports</p>
                <p className="text-sm text-gray-300">mae_upper · mae_lower · mae_centroid · mae_width · mae_asymmetry · mae_confidence · mae_position · mae_stress.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S14: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading MAE Without Regressing to Bollinger Mode</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each tests whether you can read MAE as the diagnostic acceptance corridor it is &mdash; or whether your muscle memory still pattern-matches it against every symmetric-band indicator you&apos;ve ever used.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MAE as the diagnostic corridor it is. The band-indicator muscle memory is beaten.' : gameScore >= 3 ? 'Solid grasp. Review the asymmetry and stress sections before the quiz.' : 'Re-read the MAE-vs-BB and states sections before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S15: Quiz + Cert === */}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">◈</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market Acceptance Envelope</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Acceptance Corridor Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.3-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
