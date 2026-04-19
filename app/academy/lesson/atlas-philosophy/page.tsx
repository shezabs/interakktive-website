// app/academy/lesson/atlas-philosophy/page.tsx
// ATLAS Academy — Lesson 10.1: The ATLAS Philosophy [PRO]
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
// ANIMATION 1: Predictive vs Diagnostic — Split Screen
// Left: chart spammed with BUY/SELL arrows (most miss)
// Right: same chart with diagnostic narrative
// ============================================================
function PredictiveVsDiagnosticAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;
    const topH = 28;

    // Titles
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RETAIL INDICATOR — PREDICTIVE', mid / 2, 14);
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.fillText('ATLAS — DIAGNOSTIC', mid + mid / 2, 14);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mid, 22); ctx.lineTo(mid, h - 8); ctx.stroke();

    // Generate shared price
    const pts = 50;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(t + i * 0.08) * 18 + Math.sin(t * 0.3 + i * 0.25) * 8 + Math.cos(i * 0.14) * 4);
    }
    const pMin = Math.min(...prices);
    const pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;

    // LEFT: Retail chart with arrow spam
    const padLx = 12;
    const padRx = mid - 12;
    const xStepL = (padRx - padLx) / (pts - 1);
    const toYL = (v: number) => topH + 16 + (1 - (v - pMin) / pRange) * (h - topH - 40);

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx + i * xStepL; i === 0 ? ctx.moveTo(x, toYL(v)) : ctx.lineTo(x, toYL(v)); });
    ctx.stroke();

    // Arrow spam — many false signals
    prices.forEach((v, i) => {
      if (i < 3 || i > pts - 3) return;
      const prev = prices[i - 1];
      const next = prices[i + 1];
      const localMin = v < prev && v < next;
      const localMax = v > prev && v > next;
      const wiggle = Math.abs(prices[i] - prices[i - 2]) < 3;
      // Signal fires every wiggle — that is the noise
      if ((localMin || localMax) && wiggle && i % 2 === 0) {
        const x = padLx + i * xStepL;
        const y = toYL(v);
        if (localMin) {
          ctx.fillStyle = 'rgba(34,197,94,0.8)';
          ctx.beginPath();
          ctx.moveTo(x, y + 6); ctx.lineTo(x - 4, y + 12); ctx.lineTo(x + 4, y + 12); ctx.closePath(); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(239,68,68,0.8)';
          ctx.beginPath();
          ctx.moveTo(x, y - 6); ctx.lineTo(x - 4, y - 12); ctx.lineTo(x + 4, y - 12); ctx.closePath(); ctx.fill();
        }
      }
    });

    // Retail: noisy count box
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    ctx.fillRect(padLx + 6, h - 24, 110, 16);
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.strokeRect(padLx + 6, h - 24, 110, 16);
    ctx.fillStyle = 'rgba(239,68,68,0.95)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('12 signals · 8 lose', padLx + 12, h - 12);

    // RIGHT: ATLAS diagnostic chart
    const padLx2 = mid + 12;
    const padRx2 = w - 12;
    const xStepR = (padRx2 - padLx2) / (pts - 1);
    const toYR = (v: number) => topH + 16 + (1 - (v - pMin) / pRange) * (h - topH - 60);

    // Background regime zones
    for (let i = 0; i < pts - 1; i++) {
      const regime = Math.sin(t * 0.5 + i * 0.12);
      const x1 = padLx2 + i * xStepR;
      const x2 = padLx2 + (i + 1) * xStepR;
      if (regime > 0.3) {
        ctx.fillStyle = 'rgba(38,166,154,0.08)'; // teal — bullish regime
        ctx.fillRect(x1, topH + 4, x2 - x1, h - topH - 28);
      } else if (regime < -0.3) {
        ctx.fillStyle = 'rgba(239,83,80,0.08)'; // magenta — bearish regime
        ctx.fillRect(x1, topH + 4, x2 - x1, h - topH - 28);
      }
    }

    // Clean price
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLx2 + i * xStepR; i === 0 ? ctx.moveTo(x, toYR(v)) : ctx.lineTo(x, toYR(v)); });
    ctx.stroke();

    // One high-confluence marker (no spam)
    const markerIdx = Math.floor(pts * 0.7);
    const mx = padLx2 + markerIdx * xStepR;
    const my = toYR(prices[markerIdx]);
    ctx.strokeStyle = 'rgba(245,158,11,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.arc(mx, my, 6 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    // Narrative panel
    ctx.fillStyle = 'rgba(245,158,11,0.1)';
    ctx.fillRect(padLx2 + 4, h - 28, padRx2 - padLx2 - 8, 20);
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    ctx.strokeRect(padLx2 + 4, h - 28, padRx2 - padLx2 - 8, 20);
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Bullish regime · Momentum +', padLx2 + 10, h - 19);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Watch for pullback entries', padLx2 + 10, h - 11);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: Live Regime Diagnosis
// Price runs across screen — regime band below updates live
// ============================================================
function RegimeDiagnosisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 20;
    const padR = w - 20;
    const topPanel = { t: 30, b: h * 0.62 };
    const regimePanel = { t: h * 0.68, b: h - 30 };

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Regime Diagnosis — Live Classification', w / 2, 16);

    // Generate price with clear regime shifts
    const pts = 70;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const trend = Math.sin(t + i * 0.05) * 25;
      const wave = Math.sin(t * 0.3 + i * 0.18) * 6;
      prices.push(100 + trend + wave);
    }
    const pMin = Math.min(...prices);
    const pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;

    const xStep = (padR - padL) / (pts - 1);
    const toYP = (v: number) => topPanel.b - ((v - pMin) / pRange) * (topPanel.b - topPanel.t - 8) - 4;

    // Calculate regime per bar (slope-based)
    const regimes: number[] = [];
    for (let i = 0; i < pts; i++) {
      const window = 6;
      const start = Math.max(0, i - window);
      const slope = (prices[i] - prices[start]) / Math.max(1, i - start);
      regimes.push(slope);
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYP(v)) : ctx.lineTo(x, toYP(v)); });
    ctx.stroke();

    // Regime colour strip below
    for (let i = 0; i < pts - 1; i++) {
      const x1 = padL + i * xStep;
      const x2 = padL + (i + 1) * xStep;
      const r = regimes[i];
      let color = 'rgba(255,179,0,0.55)'; // amber — mixed
      if (r > 0.6) color = 'rgba(38,166,154,0.7)'; // teal — bullish
      else if (r < -0.6) color = 'rgba(239,83,80,0.7)'; // magenta — bearish
      ctx.fillStyle = color;
      ctx.fillRect(x1, regimePanel.t, x2 - x1, regimePanel.b - regimePanel.t);
    }

    // Regime strip outline
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(padL, regimePanel.t, padR - padL, regimePanel.b - regimePanel.t);

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('REGIME', padL, regimePanel.t - 4);

    // Current state readout
    const curR = regimes[pts - 1];
    let stateText = 'MIXED';
    let stateColor = '#FFB300';
    if (curR > 0.6) { stateText = 'BULLISH'; stateColor = '#26A69A'; }
    else if (curR < -0.6) { stateText = 'BEARISH'; stateColor = '#EF5350'; }
    ctx.fillStyle = stateColor;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`NOW: ${stateText}`, padR, regimePanel.t - 4);

    // Legend
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#26A69A'; ctx.fillText('■ Bullish', padL, regimePanel.b + 12);
    ctx.fillStyle = '#FFB300'; ctx.fillText('■ Mixed', padL + 50, regimePanel.b + 12);
    ctx.fillStyle = '#EF5350'; ctx.fillText('■ Bearish', padL + 95, regimePanel.b + 12);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 3: Narrative Engine — Raw Numbers → Plain English
// Left: raw component scores (S1=72, S2=0.8, regime=BULL)
// Middle: synthesis gears turning
// Right: plain English output rendering word-by-word
// ============================================================
function NarrativeEngineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const col1X = 20;
    const col2X = w * 0.42;
    const col3X = w * 0.66;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Narrative Engine — Raw Scores to Plain English', w / 2, 16);

    // COLUMN 1: Raw scores with live values
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RAW INPUTS', col1X, 36);

    const scores = [
      { label: 'Momentum', value: 60 + Math.sin(t) * 25, color: '#26A69A', min: 0, max: 100 },
      { label: 'Trend', value: 0.7 + Math.sin(t * 0.7) * 0.25, color: '#FFB300', min: -1, max: 1 },
      { label: 'Vol Pct', value: 40 + Math.cos(t * 0.5) * 20, color: '#0ea5e9', min: 0, max: 100 },
      { label: 'Structure', value: 1 + Math.sin(t * 0.9), color: '#EF5350', min: -1, max: 2 },
    ];

    scores.forEach((s, i) => {
      const y = 56 + i * 28;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(col1X, y, col2X - col1X - 20, 20);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, col1X + 5, y + 9);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(s.value.toFixed(s.label === 'Trend' || s.label === 'Structure' ? 2 : 0), col2X - 30, y + 13);

      // Mini bar
      const barW = col2X - col1X - 30;
      const normalized = (s.value - s.min) / (s.max - s.min);
      ctx.fillStyle = s.color + '40';
      ctx.fillRect(col1X + 5, y + 15, barW * normalized, 3);
    });

    // COLUMN 2: Gears/synthesis visual
    const centerX = (col2X + col3X) / 2 - 8;
    const centerY = h * 0.5;

    // Rotating cog
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(t * 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
      ctx.stroke();
    }
    ctx.restore();

    // Arrows in / out
    ctx.strokeStyle = 'rgba(245,158,11,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(col2X - 10, centerY); ctx.lineTo(centerX - 26, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX + 26, centerY); ctx.lineTo(col3X - 6, centerY); ctx.stroke();

    // COLUMN 3: Plain English output
    ctx.fillStyle = 'rgba(245,158,11,0.55)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('NARRATIVE OUTPUT', col3X, 36);

    // Output box
    const outBoxW = w - col3X - 14;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(col3X, 42, outBoxW, h - 58);
    ctx.strokeStyle = 'rgba(245,158,11,0.25)';
    ctx.strokeRect(col3X, 42, outBoxW, h - 58);

    // Animated text reveal
    const fullText = [
      'Bullish regime.',
      'Momentum building.',
      'Volatility compressed.',
      'Structure aligned.',
      '',
      'Watch for pullback',
      'entries at key levels.',
    ];
    const revealFrame = Math.floor(t * 10) % 40;
    ctx.font = '8px system-ui';
    ctx.textAlign = 'left';
    fullText.forEach((line, i) => {
      if (revealFrame >= i * 2) {
        ctx.fillStyle = i === 0 ? '#26A69A' : 'rgba(255,255,255,0.75)';
        if (i >= 5) ctx.fillStyle = '#FFB300';
        ctx.fillText(line, col3X + 8, 58 + i * 14);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 4: Color Language — Teal / Magenta / Amber meaning
// ============================================================
function ColorLanguageAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The ATLAS Color Language', w / 2, 16);

    const colors = [
      { c: '#26A69A', label: 'TEAL', meaning: 'Positive / Confirmation', glow: 'rgba(38,166,154,' },
      { c: '#EF5350', label: 'MAGENTA', meaning: 'Negative / Rejection', glow: 'rgba(239,83,80,' },
      { c: '#FFB300', label: 'AMBER', meaning: 'Uncertainty / Caution', glow: 'rgba(255,179,0,' },
    ];

    const boxW = (w - 60) / 3;
    const boxH = h - 60;

    colors.forEach((col, i) => {
      const x = 20 + i * (boxW + 10);
      const y = 32;

      // Pulse outer glow
      const pulse = 0.3 + Math.sin(t + i) * 0.15;
      ctx.fillStyle = col.glow + pulse + ')';
      ctx.fillRect(x - 4, y - 4, boxW + 8, boxH + 8);

      // Main box
      ctx.fillStyle = col.glow + '0.18)';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = col.c;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, boxW, boxH);

      // Big swatch
      ctx.fillStyle = col.c;
      ctx.fillRect(x + 15, y + 15, boxW - 30, 32);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(col.label, x + boxW / 2, y + 66);

      // Meaning
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '8px system-ui';
      const words = col.meaning.split(' / ');
      ctx.fillText(words[0], x + boxW / 2, y + 84);
      if (words[1]) ctx.fillText('/ ' + words[1], x + boxW / 2, y + 96);

      // Hex code
      ctx.fillStyle = col.c;
      ctx.font = 'bold 8px monospace';
      ctx.fillText(col.c, x + boxW / 2, y + boxH - 10);
    });
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 5: Three Pillars — State, Score, Narrative HUD build
// HUD cells appear in sequence
// ============================================================
function ThreePillarsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const cycle = (t * 0.5) % 3;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Three Pillars of Every ATLAS Indicator', w / 2, 16);

    const padL = 20;
    const padR = w - 20;
    const hudW = padR - padL;
    const hudH = h - 60;
    const hudY = 36;

    // Background panel
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(padL, hudY, hudW, hudH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, hudY, hudW, hudH);

    const cellW = hudW / 3;

    // Cell 1: STATE (appears first)
    if (cycle >= 0) {
      const cx = padL;
      const opacity = Math.min(1, cycle * 2);
      ctx.fillStyle = `rgba(38,166,154,${0.15 * opacity})`;
      ctx.fillRect(cx, hudY, cellW, hudH);

      ctx.fillStyle = `rgba(255,255,255,${0.35 * opacity})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('STATE', cx + cellW / 2, hudY + 16);

      ctx.fillStyle = `rgba(38,166,154,${opacity})`;
      ctx.font = 'bold 20px system-ui';
      ctx.fillText('BULLISH', cx + cellW / 2, hudY + hudH / 2 + 4);

      ctx.fillStyle = `rgba(255,255,255,${0.4 * opacity})`;
      ctx.font = '7px system-ui';
      ctx.fillText('the regime classification', cx + cellW / 2, hudY + hudH - 12);
    }

    // Cell 2: SCORE (appears second)
    if (cycle >= 1) {
      const cx = padL + cellW;
      const opacity = Math.min(1, (cycle - 1) * 2);
      ctx.fillStyle = `rgba(255,179,0,${0.15 * opacity})`;
      ctx.fillRect(cx, hudY, cellW, hudH);

      ctx.fillStyle = `rgba(255,255,255,${0.35 * opacity})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SCORE', cx + cellW / 2, hudY + 16);

      const score = Math.floor(72 + Math.sin(t) * 6);
      ctx.fillStyle = `rgba(255,179,0,${opacity})`;
      ctx.font = 'bold 28px system-ui';
      ctx.fillText(score.toString(), cx + cellW / 2, hudY + hudH / 2 + 8);

      // Mini bar
      ctx.fillStyle = `rgba(255,179,0,${0.4 * opacity})`;
      const barW = cellW * 0.6;
      const barX = cx + (cellW - barW) / 2;
      ctx.fillRect(barX, hudY + hudH / 2 + 18, barW, 3);
      ctx.fillStyle = `rgba(255,179,0,${opacity})`;
      ctx.fillRect(barX, hudY + hudH / 2 + 18, barW * (score / 100), 3);

      ctx.fillStyle = `rgba(255,255,255,${0.4 * opacity})`;
      ctx.font = '7px system-ui';
      ctx.fillText('the quantified measurement', cx + cellW / 2, hudY + hudH - 12);
    }

    // Cell 3: NARRATIVE (appears third)
    if (cycle >= 2) {
      const cx = padL + 2 * cellW;
      const opacity = Math.min(1, (cycle - 2) * 2);
      ctx.fillStyle = `rgba(14,165,233,${0.1 * opacity})`;
      ctx.fillRect(cx, hudY, cellW, hudH);

      ctx.fillStyle = `rgba(255,255,255,${0.35 * opacity})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NARRATIVE', cx + cellW / 2, hudY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.85 * opacity})`;
      ctx.font = 'bold 9px system-ui';
      const lines = ['Momentum building.', 'Structure aligned.', 'Watch pullbacks.'];
      lines.forEach((l, i) => {
        ctx.fillText(l, cx + cellW / 2, hudY + hudH / 2 - 6 + i * 14);
      });

      ctx.fillStyle = `rgba(255,255,255,${0.4 * opacity})`;
      ctx.font = '7px system-ui';
      ctx.fillText('the plain English synthesis', cx + cellW / 2, hudY + hudH - 12);
    }

    // Dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(padL + cellW, hudY); ctx.lineTo(padL + cellW, hudY + hudH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL + 2 * cellW, hudY); ctx.lineTo(padL + 2 * cellW, hudY + hudH); ctx.stroke();
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: The ATLAS Suite Architecture
// 9 free + 5 PRO indicators as a visual stack
// ============================================================
function SuiteArchitectureAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The ATLAS Suite — 9 Free + 5 PRO', w / 2, 16);

    const topY = 40;
    const rowH = 22;

    // Section header: FREE TIER
    ctx.fillStyle = 'rgba(14,165,233,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('FREE TIER — 9 INDICATORS', 20, topY);

    const freeIndicators = [
      'Sessions+', 'Market Acceptance Envelope', 'Market State Intelligence',
      'Market Acceptance Zones', 'Market Participation Gradient', 'Market Pressure Regime',
      'Volatility State Index', 'Effort-Result Divergence', 'Market Efficiency Ratio'
    ];

    // 3x3 grid for free
    const gridW = w - 40;
    const cellW = gridW / 3 - 4;
    freeIndicators.forEach((name, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 20 + col * (cellW + 6);
      const y = topY + 10 + row * (rowH + 4);

      // Pulse effect cycling through cards
      const pulseIdx = Math.floor(t * 2) % freeIndicators.length;
      const active = pulseIdx === i;
      const glow = active ? 0.5 : 0.12;

      ctx.fillStyle = `rgba(14,165,233,${glow})`;
      ctx.fillRect(x, y, cellW, rowH);
      ctx.strokeStyle = `rgba(14,165,233,${active ? 0.9 : 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellW, rowH);

      ctx.fillStyle = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      // Truncate long names
      const display = name.length > 22 ? name.substring(0, 20) + '…' : name;
      ctx.fillText(display, x + cellW / 2, y + rowH / 2 + 3);
    });

    // PRO tier section
    const proY = topY + 10 + 3 * (rowH + 4) + 20;
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('★ PRO TIER — 5 FLAGSHIP ENGINES', 20, proY);

    const proIndicators = ['CIPHER PRO', 'PHANTOM PRO', 'PULSE PRO', 'RADAR PRO', 'OPTIONS PRO'];
    const proCellW = (w - 40) / 5 - 4;
    proIndicators.forEach((name, i) => {
      const x = 20 + i * (proCellW + 6);
      const y = proY + 10;

      const pulseIdx = Math.floor(t * 1.5) % proIndicators.length;
      const active = pulseIdx === i;
      const glow = active ? 0.6 : 0.18;

      ctx.fillStyle = `rgba(245,158,11,${glow})`;
      ctx.fillRect(x, y, proCellW, rowH + 4);
      ctx.strokeStyle = `rgba(245,158,11,${active ? 1 : 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, proCellW, rowH + 4);

      ctx.fillStyle = active ? '#ffffff' : 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(name, x + proCellW / 2, y + (rowH + 4) / 2 + 3);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Every indicator speaks the same diagnostic language.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION: The Diagnostic Inversion (★ GROUNDBREAKING)
// The causal chain traditional indicators invert, ATLAS preserves.
// ============================================================
function DiagnosticInversionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Diagnostic Inversion \u2605', w / 2, 14);

    // Two vertical flow diagrams side by side
    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 8); ctx.stroke();

    // ========== LEFT: Signal Tools (INVERTED) ==========
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SIGNAL TOOLS', mid / 2, 32);
    ctx.fillStyle = 'rgba(239,68,68,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('conclusion first \u2014 diagnosis hoped for', mid / 2, 44);

    // 3 stacked boxes, flowing top-to-bottom: Conclusion → Diagnosis → Reality
    const boxW = Math.min(mid - 40, 160);
    const boxH = 34;
    const boxGap = 18;
    const boxX = mid / 2 - boxW / 2;
    const startY = 58;

    const signalFlow = [
      { label: 'CONCLUSION', sub: '"BUY" arrow fires', color: '#EF5350', pulse: true },
      { label: 'DIAGNOSIS', sub: '? unclear / hidden', color: '#8A8A8A', pulse: false },
      { label: 'REALITY', sub: 'market state unknown', color: '#6A6A6A', pulse: false },
    ];

    signalFlow.forEach((step, i) => {
      const y = startY + i * (boxH + boxGap);
      const alpha = step.pulse ? 0.25 + Math.sin(t * 4) * 0.15 : 0.12;
      ctx.fillStyle = step.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(boxX, y, boxW, boxH);
      ctx.strokeStyle = step.color;
      ctx.lineWidth = step.pulse ? 1.5 : 1;
      ctx.strokeRect(boxX, y, boxW, boxH);

      ctx.fillStyle = step.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(step.label, boxX + boxW / 2, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(step.sub, boxX + boxW / 2, y + 26);

      // Arrow down to next
      if (i < signalFlow.length - 1) {
        const arrY = y + boxH + 2;
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(boxX + boxW / 2, arrY); ctx.lineTo(boxX + boxW / 2, arrY + boxGap - 4); ctx.stroke();
        ctx.setLineDash([]);
        // Arrowhead
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.beginPath();
        ctx.moveTo(boxX + boxW / 2, arrY + boxGap - 4);
        ctx.lineTo(boxX + boxW / 2 - 3, arrY + boxGap - 8);
        ctx.lineTo(boxX + boxW / 2 + 3, arrY + boxGap - 8);
        ctx.closePath(); ctx.fill();
      }
    });

    // Bottom annotation
    ctx.fillStyle = 'rgba(239,68,68,0.85)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Causality inverted', mid / 2, h - 18);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('acts first, understands never', mid / 2, h - 7);

    // ========== RIGHT: Diagnostic Tools (PRESERVED) ==========
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DIAGNOSTIC TOOLS (ATLAS)', mid + mid / 2, 32);
    ctx.fillStyle = 'rgba(0,179,164,0.65)';
    ctx.font = '7px system-ui';
    ctx.fillText('diagnosis first \u2014 conclusion belongs to YOU', mid + mid / 2, 44);

    const boxX2 = mid + mid / 2 - boxW / 2;

    const diagnosticFlow = [
      { label: 'REALITY', sub: 'market state measured', color: '#0ea5e9', pulse: true },
      { label: 'DIAGNOSIS', sub: 'regime / score / quality', color: '#00B3A4', pulse: true },
      { label: 'CONCLUSION', sub: 'YOUR decision', color: '#FFB300', pulse: true, final: true },
    ];

    diagnosticFlow.forEach((step, i) => {
      const y = startY + i * (boxH + boxGap);
      const alpha = 0.20 + Math.sin(t * 3 + i * 0.8) * 0.10;
      ctx.fillStyle = step.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(boxX2, y, boxW, boxH);
      ctx.strokeStyle = step.color;
      ctx.lineWidth = step.final ? 2 : 1.2;
      ctx.strokeRect(boxX2, y, boxW, boxH);

      ctx.fillStyle = step.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(step.label, boxX2 + boxW / 2, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '7px system-ui';
      ctx.fillText(step.sub, boxX2 + boxW / 2, y + 26);

      // Arrow down to next
      if (i < diagnosticFlow.length - 1) {
        const arrY = y + boxH + 2;
        ctx.strokeStyle = 'rgba(0,179,164,0.6)';
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(boxX2 + boxW / 2, arrY); ctx.lineTo(boxX2 + boxW / 2, arrY + boxGap - 4); ctx.stroke();
        // Arrowhead
        ctx.fillStyle = 'rgba(0,179,164,0.9)';
        ctx.beginPath();
        ctx.moveTo(boxX2 + boxW / 2, arrY + boxGap - 4);
        ctx.lineTo(boxX2 + boxW / 2 - 3, arrY + boxGap - 8);
        ctx.lineTo(boxX2 + boxW / 2 + 3, arrY + boxGap - 8);
        ctx.closePath(); ctx.fill();
      }
    });

    // Bottom annotation
    ctx.fillStyle = 'rgba(0,179,164,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Causality preserved', mid + mid / 2, h - 18);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('understands first, acts second', mid + mid / 2, h - 7);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// GAME DATA — 5 rounds testing diagnostic mindset
// ============================================================
const gameRounds = [
  {
    scenario: 'An indicator on your chart shows a large green BUY arrow pointing up. What is the CORRECT interpretation of this visual from an ATLAS perspective?',
    options: [
      { text: 'Enter a long position immediately &mdash; that is what the arrow is telling you to do', correct: false, explain: 'This is the exact failure mode ATLAS was built to solve. A standalone arrow provides zero context: no regime, no score, no narrative. You have no idea WHY it fired, WHAT the market state is, or whether the signal has any historical reliability. Acting on it is gambling, not trading.' },
      { text: 'Nothing &mdash; an arrow alone is a prediction claim with no diagnostic context. Without regime, score, and narrative, it is noise dressed as a signal.', correct: true, explain: 'Exactly right. ATLAS indicators refuse to give you arrows without context. Before any entry, you need to see the regime classification, the component scores, and the plain-English narrative explaining the current market state. Arrows without that are marketing, not intelligence.' },
    ],
  },
  {
    scenario: 'You open CIPHER PRO. The Intelligence Panel shows: Regime = BULLISH, Momentum score = 78, Trend score = 0.82, Volatility = COMPRESSED, Narrative = &ldquo;Strong bullish momentum with compressed volatility &mdash; expansion likely soon.&rdquo; What is this arrangement teaching you?',
    options: [
      { text: 'This is ATLAS&apos;s three-pillar architecture in action: State (BULLISH regime) + Score (78 momentum, 0.82 trend) + Narrative (the plain-English synthesis). You have the diagnosis, the measurement, and the meaning in one glance.', correct: true, explain: 'Correct. Every ATLAS indicator follows this same three-pillar pattern. Once you learn it, you can read any ATLAS tool the same way. The state tells you WHAT regime you are in. The score tells you HOW STRONG that regime is. The narrative tells you WHAT TO DO with that information. No arrows. No predictions. Pure diagnosis.' },
      { text: 'Too much information &mdash; a good indicator should just tell you to buy or sell', correct: false, explain: 'This mindset is precisely what ATLAS rejects. A trading decision is complex: it depends on regime, strength of regime, volatility environment, and structural context. An indicator that reduces all of that to &ldquo;BUY&rdquo; is lying by omission. The &ldquo;too much information&rdquo; complaint is the complaint of someone who wants to avoid thinking &mdash; which is exactly how traders lose.' },
    ],
  },
  {
    scenario: 'Your friend shows you two indicators side by side on the same chart. Indicator A fires 15 green/red arrows across the session. Indicator B shows zero arrows but displays a teal background, a score of 64, and the text &ldquo;Bullish regime, moderate conviction, watch for pullback entries.&rdquo; Which indicator is demonstrating the ATLAS philosophy?',
    options: [
      { text: 'Indicator A &mdash; more signals means more opportunities', correct: false, explain: 'More signals means more noise. Research consistently shows that the signal-to-noise ratio of high-frequency indicator arrows is catastrophic &mdash; the majority of fires are false. Indicator A is optimising for the wrong metric (arrow count) while Indicator B is optimising for the right metric (actionable context).' },
      { text: 'Indicator B &mdash; it provides state (teal/bullish), score (64), and narrative (pullback entries). That is diagnostic intelligence, not signal spam.', correct: true, explain: 'Exactly right. Indicator B is showing the ATLAS way: color language encoding state, a quantified score encoding strength, and a narrative encoding meaning. No arrows because arrows without context are worthless. The absence of arrows is a feature, not a bug.' },
    ],
  },
  {
    scenario: 'You are checking a chart and notice an ATLAS indicator showing an AMBER HUD cell. Based purely on the ATLAS color language, what is the correct interpretation?',
    options: [
      { text: 'Amber means buy &mdash; it is a positive signal', correct: false, explain: 'In the ATLAS color language, teal (#26A69A) means positive/confirmation and magenta (#EF5350) means negative/rejection. Amber (#FFB300) is specifically the color of UNCERTAINTY/CAUTION. It is neither a buy nor a sell &mdash; it is a warning that the indicator does not have enough conviction to classify the state clearly.' },
      { text: 'Amber means the indicator is signalling uncertainty or caution &mdash; the market state is not cleanly classified. Wait for resolution or reduce exposure.', correct: true, explain: 'Correct. The ATLAS color language is universal across every indicator in the suite: teal = positive, magenta = negative, amber = uncertain. When you see amber, the indicator is telling you honestly that the current conditions are ambiguous. That is valuable information &mdash; most indicators pretend certainty when they have none.' },
    ],
  },
  {
    scenario: 'A trading course advertises an indicator with 95% win rate backtests and flashy BUY/SELL signals. It shows no regime classification, no numerical scores, and no narrative output. Based on the ATLAS philosophy, what should your first question be?',
    options: [
      { text: 'How do I download it? 95% win rate is amazing!', correct: false, explain: 'This reaction is how retail traders lose money. 95% win rates in backtests are almost always the result of look-ahead bias, curve-fitting, or cherry-picked timeframes. The absence of regime/score/narrative is the red flag: a legitimate diagnostic tool would show you WHY its signals work under different conditions. The lack of transparency is the warning.' },
      { text: 'What is the diagnostic context? If the indicator cannot show me regime, scores, and a narrative, I cannot evaluate whether its signals hold up across different market conditions. The backtest number alone is meaningless without context.', correct: true, explain: 'Exactly the ATLAS mindset. A 95% win rate that only fires 3 times per year in specific conditions can easily be found through curve-fitting. Without diagnostic context, you cannot tell a real edge from a statistical artifact. The ATLAS philosophy is that every claim must be backed by visible state, score, and narrative &mdash; anything less is a black box, and black boxes do not survive contact with real markets.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The core difference between a PREDICTIVE indicator and a DIAGNOSTIC indicator is:', opts: ['Predictive indicators are always more accurate than diagnostic ones', 'Predictive indicators claim to forecast future price direction; diagnostic indicators classify the current market state without making forecasts', 'Diagnostic indicators can only be used on higher timeframes', 'Predictive indicators are free and diagnostic indicators are paid'], correct: 1, explain: 'Predictive = claims to forecast. Diagnostic = describes what IS. ATLAS indicators are diagnostic because honest measurement of the present beats false prediction of the future.' },
  { q: 'The three pillars every ATLAS indicator uses to communicate are:', opts: ['Arrows, alerts, and backtests', 'State (regime classification), Score (quantified measurement), and Narrative (plain-English synthesis)', 'Buy signal, sell signal, and hold signal', 'Price, volume, and volatility'], correct: 1, explain: 'State tells you the regime. Score tells you its strength. Narrative tells you what it means. Every ATLAS tool follows this pattern, which is why learning one makes learning the others easier.' },
  { q: 'In the ATLAS color language, what does AMBER (#FFB300) specifically mean?', opts: ['Bullish momentum', 'Bearish momentum', 'Uncertainty / Caution — the indicator does not have enough conviction to classify the state clearly', 'The indicator is broken'], correct: 2, explain: 'Teal = positive. Magenta = negative. Amber = uncertainty. The deliberate use of amber is an honesty signal &mdash; the indicator is admitting when the situation is ambiguous, rather than pretending certainty it does not have.' },
  { q: 'Why does the ATLAS suite deliberately avoid excessive BUY/SELL arrows on charts?', opts: ['Arrows make the chart look ugly', 'Because arrows without context (regime, score, narrative) are predictions presented as facts, and the signal-to-noise ratio of arrow-spam indicators is catastrophic', 'The code runs faster without them', 'Arrows are copyrighted by other trading companies'], correct: 1, explain: 'An arrow is a prediction claim. Without regime classification, score, and narrative, an arrow provides no actionable intelligence. Research consistently shows high-frequency arrow indicators lose money because context is missing.' },
  { q: 'The ATLAS Narrative Engine does what?', opts: ['Writes trading journal entries for you', 'Synthesizes multiple raw numerical inputs (scores, regimes, volatility states) into plain-English guidance so traders can understand WHY the state is what it is, not just WHAT the state is', 'Posts your trades to social media', 'Generates news articles about markets'], correct: 1, explain: 'The Narrative Engine takes raw component scores and translates them into human-readable synthesis. Instead of giving you a number, it tells you what the number means and what to watch for.' },
  { q: 'The ATLAS suite consists of:', opts: ['Only one paid indicator', '9 free indicators + 5 PRO indicators, all following the same diagnostic philosophy and color language', '50+ indicators mostly clones of each other', 'Just the CIPHER PRO flagship'], correct: 1, explain: '9 free indicators (Sessions+, Market Acceptance Envelope, Market State Intelligence, Market Acceptance Zones, Market Participation Gradient, Market Pressure Regime, Volatility State Index, Effort-Result Divergence, Market Efficiency Ratio) + 5 PRO (CIPHER, PHANTOM, PULSE, RADAR, OPTIONS). Every one speaks the same diagnostic language.' },
  { q: 'When an ATLAS indicator shows an AMBER regime state, the correct response is:', opts: ['Immediately enter a trade because amber is bullish', 'Immediately exit all positions because amber is bearish', 'Treat it as a transparent admission of uncertainty &mdash; consider waiting for resolution, reducing exposure, or requiring additional confluence before acting', 'Ignore the amber and look at other indicators'], correct: 2, explain: 'Amber is the color of honesty. The indicator is telling you the current conditions are ambiguous. A wise trader uses this as a signal to be cautious, not to fabricate confidence.' },
  { q: 'The motto "We Show You WHY, Not Just What" means:', opts: ['ATLAS indicators explain trading strategies to beginners', 'ATLAS indicators reveal the diagnostic reasoning (the state, score, and narrative) behind any assessment, so the trader understands the basis for the indicator&apos;s output rather than blindly trusting it', 'ATLAS indicators tell you what asset to buy next', 'ATLAS is the cheapest indicator suite on the market'], correct: 1, explain: 'The philosophy is epistemic: you should never trust an output you cannot understand. ATLAS shows its work &mdash; every state, score, and narrative is visible &mdash; so you can evaluate whether the reasoning holds for your specific context.' },
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
export default function AtlasPhilosophyLesson() {
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
    { wrong: 'Looking for a BUY or SELL arrow on every ATLAS indicator', right: 'ATLAS indicators deliberately avoid arrow-based signals. They show state (regime), score (strength), and narrative (meaning). If you are hunting for arrows, you are missing the diagnostic layer that actually matters.', icon: '🎯' },
    { wrong: 'Treating an amber state as bullish or bearish', right: 'Amber is the color of uncertainty. It is an explicit admission that the indicator lacks conviction. Treating it as directional guidance inverts its meaning &mdash; amber is a call to wait or require more confluence, not to trade.', icon: '🟡' },
    { wrong: 'Using a single ATLAS indicator as a complete trading system', right: 'Each ATLAS indicator measures one dimension (momentum, structure, volatility, participation, etc). A complete picture requires stacking 3-4 tools covering different dimensions. One tool gives you one axis of data, not the whole truth.', icon: '🧩' },
    { wrong: 'Ignoring the narrative output and only reading the scores', right: 'The narrative is not decoration &mdash; it is the synthesis layer. Scores are raw inputs; the narrative explains what happens when they are combined. Reading scores without the narrative is like reading test results without a doctor&apos;s interpretation.', icon: '📖' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 1</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The ATLAS<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Philosophy</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Why our indicators exist. How they think. And why &ldquo;We Show You WHY, Not Just What&rdquo; is not a slogan &mdash; it is an engineering constraint.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Indicator Industry&apos;s Broken Promise</p>
            <p className="text-gray-400 leading-relaxed mb-4">The trading indicator industry is built on a lie. Every product page promises the same thing: <strong className="text-amber-400">a magic arrow that tells you when to buy and sell</strong>. Marketing shows green arrows at the bottom, red arrows at the top, and a winning trade on every example.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In reality, those arrows fire hundreds of times per week across any real chart. The <strong className="text-white">signal-to-noise ratio is catastrophic</strong>. Traders get chewed up following arrow-based indicators because an arrow, stripped of context, is just a claim with no evidence.</p>
            <p className="text-gray-400 leading-relaxed">ATLAS was built to fix this. Not by making better arrows &mdash; by refusing to make arrows at all. Every ATLAS indicator is a <strong className="text-amber-400">diagnostic instrument</strong>, not a predictive one. It tells you what the market IS, not what it will do. And that one design decision changes everything.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE ATLAS AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">An honest measurement of the present beats a false prediction of the future. This is not a trading philosophy &mdash; it is an epistemological commitment. Every ATLAS indicator is built from this axiom down. That is why the suite feels different from anything else on TradingView.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Predictive vs Diagnostic === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Two Families</p>
          <h2 className="text-2xl font-extrabold mb-4">Predictive vs Diagnostic</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every indicator ever made belongs to one of two families. The retail world is dominated by <strong className="text-red-400">predictive</strong> tools &mdash; they claim to forecast direction and spit out arrows. The institutional world runs on <strong className="text-amber-400">diagnostic</strong> tools &mdash; they classify current conditions and leave the forecast to the human. The chart below shows the same price data interpreted by each approach.</p>
          <PredictiveVsDiagnosticAnim />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-extrabold text-red-400 mb-1">Predictive (Retail)</p>
              <p className="text-[11px] text-gray-400">Fires arrows on every wiggle. No state context. No narrative. No transparency about why. Most fires are false &mdash; the damage shows up weeks later.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">Diagnostic (ATLAS)</p>
              <p className="text-[11px] text-gray-400">Classifies the regime. Scores its strength. Narrates the meaning. One high-confluence marker per session, not fifteen false ones. Transparent reasoning throughout.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02: Diagnostic Principle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Live Classification</p>
          <h2 className="text-2xl font-extrabold mb-4">What Diagnosis Actually Looks Like</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A diagnostic indicator does not tell you what will happen next. It tells you <strong className="text-white">what the current state IS</strong>, updated on every bar. Watch the animation below &mdash; as price moves, the regime strip underneath reclassifies in real time. Bullish. Mixed. Bearish. No promises about the next bar. Just an honest measurement of the present bar.</p>
          <RegimeDiagnosisAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Diagnostic Discipline</p>
            <p className="text-sm text-gray-400">A good doctor does not tell you what your next symptom will be. A good doctor classifies your current condition accurately, and helps you understand what to watch for. ATLAS indicators operate on the same professional principle &mdash; honest classification of the present, not false promises about the future.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Narrative Engine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Narrative Engine</p>
          <h2 className="text-2xl font-extrabold mb-4">From Raw Numbers to Plain English</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every ATLAS indicator has a <strong className="text-amber-400">Narrative Engine</strong> &mdash; a synthesis layer that translates component scores into human-readable guidance. A momentum score of 72 is a number. &ldquo;Momentum is building inside a bullish regime &mdash; watch for pullback entries&rdquo; is a <strong className="text-white">decision</strong>. The Narrative Engine does that translation automatically, on every bar.</p>
          <NarrativeEngineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Narratives Matter</p>
            <p className="text-sm text-gray-400">Under pressure, traders do not read numbers well. A six-metric HUD with nothing but digits becomes noise during a fast market. A clear sentence like &ldquo;Momentum fading, structure breaking, reduce exposure&rdquo; cuts through. The Narrative Engine is the indicator speaking English so you do not have to mentally translate four scores into a decision at 9:31 AM.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Color Language === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Universal Dialect</p>
          <h2 className="text-2xl font-extrabold mb-4">The ATLAS Color Language</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every ATLAS indicator uses the <strong className="text-white">same three-color vocabulary</strong>. This is deliberate &mdash; once you learn it, you can read any ATLAS tool without re-learning the conventions. No rainbow palettes. No invented colors per indicator. Three colors, each with precise meaning.</p>
          <ColorLanguageAnim />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(38,166,154,0.08)', borderColor: 'rgba(38,166,154,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#26A69A' }}>TEAL</p>
              <p className="text-[10px] text-gray-400 leading-tight">Positive state, bullish regime, confirmation</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(239,83,80,0.08)', borderColor: 'rgba(239,83,80,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#EF5350' }}>MAGENTA</p>
              <p className="text-[10px] text-gray-400 leading-tight">Negative state, bearish regime, rejection</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,179,0,0.08)', borderColor: 'rgba(255,179,0,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#FFB300' }}>AMBER</p>
              <p className="text-[10px] text-gray-400 leading-tight">Uncertainty, caution, the honest &ldquo;I don&apos;t know&rdquo;</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05: Three Pillars === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Three Pillars</p>
          <h2 className="text-2xl font-extrabold mb-4">State &middot; Score &middot; Narrative</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every ATLAS indicator communicates through the same three-pillar architecture. <strong className="text-white">STATE</strong> tells you the classification. <strong className="text-white">SCORE</strong> tells you the strength of that classification. <strong className="text-white">NARRATIVE</strong> tells you what to do about it. Learn this pattern once &mdash; and you can read any ATLAS indicator the same way.</p>
          <ThreePillarsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Three-Glance Rule</p>
            <p className="text-sm text-gray-400">A well-designed ATLAS HUD should be readable in three glances: glance one at the STATE cell (what regime?), glance two at the SCORE (how strong?), glance three at the NARRATIVE (what to do?). If you have to stare at the dashboard for 30 seconds to make sense of it, the design has failed &mdash; and no ATLAS indicator is allowed to fail that test.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: Suite Architecture === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Suite</p>
          <h2 className="text-2xl font-extrabold mb-4">9 Free + 5 PRO = One Philosophy</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The ATLAS suite is not a collection of random indicators. It is a <strong className="text-white">coordinated system</strong> where each tool measures a specific dimension of the market. Nine free indicators cover foundational dimensions. Five PRO indicators add the flagship intelligence engines. Every tool speaks the same diagnostic language, uses the same color code, and follows the same three-pillar architecture.</p>
          <SuiteArchitectureAnim />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <p className="text-xs font-extrabold text-sky-400 mb-1">Free Tier &mdash; 9 Tools</p>
              <p className="text-[11px] text-gray-400">Sessions+, Market Acceptance Envelope, Market State Intelligence, Market Acceptance Zones, Market Participation Gradient, Market Pressure Regime, Volatility State Index, Effort-Result Divergence, Market Efficiency Ratio.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">PRO Tier &mdash; 5 Engines</p>
              <p className="text-[11px] text-gray-400">CIPHER PRO (signal intelligence), PHANTOM PRO (SMC + structure), PULSE PRO (momentum), RADAR PRO (multi-ticker scanner), OPTIONS PRO (volatility + Greeks).</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S07: The Diagnostic Inversion (★ GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Diagnostic Inversion &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">The Causal Chain Most Indicators Invert</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Step back from any specific indicator for a moment and look at the <em>causal logic</em> of how trading signals should actually flow. In a well-functioning trading process: the market does something (<strong className="text-white">reality</strong>), you measure what it&apos;s doing (<strong className="text-white">diagnosis</strong>), you decide what to do about it (<strong className="text-white">conclusion</strong>). Reality → Diagnosis → Conclusion. That&apos;s the natural causal direction. <strong className="text-amber-400">Most retail indicators invert this chain.</strong> They produce the conclusion (a BUY arrow, a SELL alert) and hope the diagnosis was right &mdash; without ever showing you the diagnosis, or giving you a way to verify it.</p>
          <DiagnosticInversionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128260; The Inversion Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">This is why every ATLAS indicator outputs three things instead of one: a <strong className="text-white">state</strong> (the regime classification), a <strong className="text-white">score</strong> (the quantified measurement), and a <strong className="text-white">narrative</strong> (the plain-English interpretation). The conclusion &mdash; whether you actually take the trade &mdash; is deliberately <em>yours</em>. ATLAS refuses to complete the chain. That refusal is the single most important design commitment in the whole suite. It is what makes every tool in Level 10 &ldquo;diagnostic&rdquo; rather than &ldquo;predictive.&rdquo; <strong className="text-white">Every groundbreaking concept in the rest of this level &mdash; the Liquidity Handoff, the Corridor Gravity Model, the Three-Force Decomposition, the Acceptance-vs-Absorption distinction, the Volume Fallback Doctrine &mdash; is an application of this principle to a specific domain.</strong> They are not separate ideas; they are five instances of the same commitment: measure reality honestly, and let the trader conclude.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Why this inversion matters practically:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Verifiable failures instead of black-box losses.</strong> When an ATLAS indicator is &ldquo;wrong&rdquo; (a zone fails, a regime misclassifies), you can see exactly which measurement was off. Signal tools fail opaquely &mdash; the arrow was wrong and you have no idea why. Diagnostic tools fail transparently &mdash; you can read the state, score, and narrative and see precisely where they diverged from reality.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Tools compose cleanly.</strong> Because every ATLAS indicator outputs a diagnosis rather than a conclusion, they can be stacked without contradicting each other. MAE tells you location. MSI tells you regime. MPG tells you participation. MAZ tells you acceptance zones. They&apos;re four diagnostic layers on the same market &mdash; they don&apos;t fight for the &ldquo;what to do&rdquo; slot because none of them occupies it. The conclusion is still yours.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Learning accelerates.</strong> When you trade with a signal tool, you learn what the signal does. When you trade with a diagnostic tool, you learn <em>what the market is doing</em>. The first skill is tool-specific and obsolete when the tool fails. The second skill transfers across every market condition and tool you&apos;ll ever use afterwards. ATLAS is teaching you to read markets, not to follow ATLAS.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S08: What Makes ATLAS Different === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Differentiators</p>
          <h2 className="text-2xl font-extrabold mb-4">What Makes an ATLAS Indicator Different</h2>
          <p className="text-gray-400 leading-relaxed mb-6">There are 40,000+ indicators on TradingView. Five design commitments separate ATLAS from the rest. Every indicator in the suite meets all five.</p>
          <div className="space-y-3">
            {[
              { t: 'Zero Black Boxes', d: 'Every score, every state, every narrative explains its own reasoning. If a component fires, you can see why. If a regime classifies, the logic is visible.' },
              { t: 'Diagnostic-First Architecture', d: 'No arrows. No predictive claims. Every output describes the current measurement, not a forecast. Honesty is the feature.' },
              { t: 'Universal Color Language', d: 'Teal / Magenta / Amber mean the same thing across all 14 indicators. Learn once, read everywhere.' },
              { t: 'Three-Pillar HUD Pattern', d: 'State / Score / Narrative. Every ATLAS dashboard follows this pattern. Transfer of skill is near-instant across the suite.' },
              { t: 'Plain English Narratives', d: 'The Narrative Engine synthesizes raw scores into human-readable guidance. Under pressure, you read sentences, not numbers.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm font-bold text-amber-400 mb-1">{i + 1}. {item.t}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === S08: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse ATLAS Tools</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Even with the best diagnostic indicators ever built, traders still find ways to sabotage themselves. These four mistakes account for almost every ATLAS-related failure we see in support conversations.</p>
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

      {/* === S09: Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">The ATLAS Philosophy in One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Axiom</p>
                <p className="text-sm text-gray-300">Honest measurement of the present beats false prediction of the future.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Two Families of Indicators</p>
                <p className="text-sm text-gray-300">Predictive (retail, arrow-based, noisy) vs Diagnostic (institutional, state-based, transparent). ATLAS is diagnostic by design.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three Pillars</p>
                <p className="text-sm text-gray-300">STATE (the regime classification) + SCORE (the quantified strength) + NARRATIVE (the plain-English synthesis). Every ATLAS tool follows this pattern.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Color Language</p>
                <p className="text-sm text-gray-300">Teal = positive/bullish. Magenta = negative/bearish. Amber = uncertainty/caution. Universal across all 14 indicators.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Suite</p>
                <p className="text-sm text-gray-300">9 free indicators + 5 PRO engines, all speaking the same diagnostic language.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">The Motto</p>
                <p className="text-sm text-gray-300 italic">&ldquo;We Show You WHY, Not Just What.&rdquo;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S10: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">The Philosophy in Action &mdash; 5 Scenarios</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real-world situations. Each tests whether you&apos;ve absorbed the diagnostic mindset or whether you&apos;re still thinking like a predictive-indicator trader.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You think like an ATLAS trader. The diagnostic mindset is internalised.' : gameScore >= 3 ? 'Solid grasp. Re-read the color language and three-pillar sections, then move on.' : 'Review the diagnostic-vs-predictive distinction before moving to the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S11: Quiz + Certificate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Knowledge Check</p>
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🧭</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: The ATLAS Philosophy</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; ATLAS Philosophy Initiate &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
