// app/academy/lesson/market-participation-gradient-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.6: Market Participation Gradient Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PHASE 1: scaffold + 4 animations (overlay vs oscillator, participation vs momentum,
//   formula build, efficiency deep dive)
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
// ANIMATION 1: Overlay vs Oscillator — the category shift
// Shows how MPG sits in a SEPARATE pane, not on price
// ============================================================
function OverlayVsOscillatorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Oscillator vs Overlay — Different Architectural Classes', w / 2, 14);

    // Generate synthetic price
    const pts = 60;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(i * 0.2 + t) * 5 + Math.sin(i * 0.5) * 2);
    }
    const pMin = Math.min(...prices) - 2;
    const pMax = Math.max(...prices) + 2;
    const pRange = pMax - pMin;

    const padL = 20;
    const padR = w - 20;
    const xStep = (padR - padL) / (pts - 1);

    // ===== PRICE PANE =====
    const priceTop = 32;
    const priceBot = h * 0.60;
    const priceH = priceBot - priceTop;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL - 5, priceTop, padR - padL + 10, priceH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL - 5, priceTop, padR - padL + 10, priceH);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE PANE (price + overlay indicators)', padL, priceTop - 4);

    const toYPrice = (v: number) => priceBot - ((v - pMin) / pRange) * (priceH - 10) - 5;

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toYPrice(v)) : ctx.lineTo(x, toYPrice(v)); });
    ctx.stroke();

    // Overlay indicators labelled on price pane
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('← MAE / MSI / Sessions+ / MAZ all live HERE (overlay)', padL + 5, priceTop + 14);

    // Draw a light teal tint to indicate MAE overlay
    ctx.fillStyle = 'rgba(38,166,154,0.06)';
    prices.forEach((v, i) => {
      const x = padL + i * xStep;
      ctx.fillRect(x - xStep / 2, toYPrice(v + 2), xStep + 1, toYPrice(v - 2) - toYPrice(v + 2));
    });

    // ===== SEPARATOR =====
    const sepY = priceBot + 2;
    ctx.strokeStyle = 'rgba(245,158,11,0.35)';
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padL - 5, sepY);
    ctx.lineTo(padR + 5, sepY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ===== OSCILLATOR PANE =====
    const oscTop = sepY + 14;
    const oscBot = h - 14;
    const oscH = oscBot - oscTop;
    ctx.fillStyle = 'rgba(245,158,11,0.05)';
    ctx.fillRect(padL - 5, oscTop, padR - padL + 10, oscH);
    ctx.strokeStyle = 'rgba(245,158,11,0.35)';
    ctx.strokeRect(padL - 5, oscTop, padR - padL + 10, oscH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MPG PANE (separate sub-window, scale 0-100)', padL, oscTop - 4);

    // Synthetic MPG values
    const mpgVals: number[] = [];
    for (let i = 0; i < pts; i++) {
      mpgVals.push(25 + Math.sin(i * 0.25 + t * 0.8) * 20 + Math.sin(i * 0.5 + t) * 15 + 20);
    }

    const oscToY = (v: number) => oscBot - (Math.max(0, Math.min(100, v)) / 100) * (oscH - 4) - 2;

    // Tier bands
    [20, 40, 65].forEach(lvl => {
      ctx.strokeStyle = 'rgba(138,138,138,0.25)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(padL, oscToY(lvl)); ctx.lineTo(padR, oscToY(lvl)); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Histogram
    mpgVals.forEach((v, i) => {
      const x = padL + i * xStep;
      let color = 'rgba(138,138,138,0.7)'; // thin
      if (v >= 65) color = 'rgba(0,179,164,0.75)'; // extreme
      else if (v >= 40) color = 'rgba(0,179,164,0.65)'; // strong
      else if (v >= 20) color = 'rgba(249,168,37,0.65)'; // building
      ctx.fillStyle = color;
      const barTop = oscToY(v);
      ctx.fillRect(x - xStep / 2 + 1, barTop, xStep - 2, oscBot - barTop);
    });

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('100', padL - 8, oscToY(100) + 2);
    ctx.fillText('65', padL - 8, oscToY(65) + 2);
    ctx.fillText('40', padL - 8, oscToY(40) + 2);
    ctx.fillText('20', padL - 8, oscToY(20) + 2);
    ctx.fillText('0', padL - 8, oscToY(0) + 2);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: Participation vs Momentum — MPG vs RSI
// Critical category distinction
// ============================================================
function ParticipationVsMomentumAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Participation ≠ Momentum — Different Questions Entirely', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 24); ctx.lineTo(mid, h - 14); ctx.stroke();

    // Generate shared price
    const pts = 45;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      // A gentle trend with a drifting phase mid-way (low participation)
      if (i < 15) prices.push(100 + i * 0.5 + Math.sin(i + t) * 0.5);
      else if (i < 30) prices.push(107.5 + Math.sin(i * 0.3 + t) * 0.3); // flat drift
      else prices.push(107.5 + (i - 30) * 0.4 + Math.sin(i * 0.4 + t) * 0.5);
    }

    const pMin = Math.min(...prices) - 0.5;
    const pMax = Math.max(...prices) + 0.5;
    const pRange = pMax - pMin;

    // ======== LEFT: MPG (PARTICIPATION) ========
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPG — "IS ANYONE ENGAGED?"', mid / 2, 30);
    ctx.fillStyle = 'rgba(0,179,164,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('level drops during mid-flat → shows drift', mid / 2, 42);

    const padLL = 15;
    const padLR = mid - 15;
    const xStepL = (padLR - padLL) / (pts - 1);

    // Mini price at top half
    const priceTop = 50;
    const priceBot = h * 0.48;
    const toYLP = (v: number) => priceBot - ((v - pMin) / pRange) * (priceBot - priceTop - 4) - 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padLL + i * xStepL; i === 0 ? ctx.moveTo(x, toYLP(v)) : ctx.lineTo(x, toYLP(v)); });
    ctx.stroke();

    // MPG pane
    const mpgTop = priceBot + 6;
    const mpgBot = h - 20;
    const mpgH = mpgBot - mpgTop;
    ctx.fillStyle = 'rgba(0,179,164,0.04)';
    ctx.fillRect(padLL, mpgTop, padLR - padLL, mpgH);
    ctx.strokeStyle = 'rgba(0,179,164,0.2)';
    ctx.strokeRect(padLL, mpgTop, padLR - padLL, mpgH);

    const toYMpg = (v: number) => mpgBot - (v / 100) * (mpgH - 2) - 1;

    // Compute fake MPG that drops during flat
    const mpgVals: number[] = [];
    for (let i = 0; i < pts; i++) {
      if (i < 15) mpgVals.push(45 + Math.sin(i + t) * 8); // strong
      else if (i < 30) mpgVals.push(15 + Math.sin(i * 0.3 + t) * 5); // thin
      else mpgVals.push(42 + Math.sin(i + t) * 7); // strong again
    }

    mpgVals.forEach((v, i) => {
      const x = padLL + i * xStepL;
      const color = v < 20 ? 'rgba(138,138,138,0.7)' : (v < 40 ? 'rgba(249,168,37,0.7)' : 'rgba(0,179,164,0.75)');
      ctx.fillStyle = color;
      ctx.fillRect(x - xStepL / 2 + 0.5, toYMpg(v), xStepL - 1, mpgBot - toYMpg(v));
    });

    // Callout
    const flatX = padLL + (pts * 0.5) * xStepL;
    ctx.fillStyle = 'rgba(138,138,138,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('THIN → drift', flatX, mpgTop + 10);

    // ======== RIGHT: RSI (MOMENTUM) ========
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RSI — "WHICH WAY IS PRICE GOING?"', mid + mid / 2, 30);
    ctx.fillStyle = 'rgba(168,85,247,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('hovers near 50 through the flat → no insight', mid + mid / 2, 42);

    const padRL = mid + 15;
    const padRR = w - 15;
    const xStepR = (padRR - padRL) / (pts - 1);
    const toYRP = (v: number) => priceBot - ((v - pMin) / pRange) * (priceBot - priceTop - 4) - 2;

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYRP(v)) : ctx.lineTo(x, toYRP(v)); });
    ctx.stroke();

    // RSI pane (0-100 scale like MPG for visual parity)
    ctx.fillStyle = 'rgba(168,85,247,0.04)';
    ctx.fillRect(padRL, mpgTop, padRR - padRL, mpgH);
    ctx.strokeStyle = 'rgba(168,85,247,0.2)';
    ctx.strokeRect(padRL, mpgTop, padRR - padRL, mpgH);

    // Reference 50 line
    ctx.strokeStyle = 'rgba(168,85,247,0.3)';
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    const y50 = mpgTop + mpgH / 2;
    ctx.moveTo(padRL, y50); ctx.lineTo(padRR, y50); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(168,85,247,0.5)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('50', padRR - 3, y50 + 2);

    // RSI line — hovers near 50 during flat
    const rsiVals: number[] = [];
    for (let i = 0; i < pts; i++) {
      if (i < 15) rsiVals.push(60 + Math.sin(i * 0.5 + t) * 5);
      else if (i < 30) rsiVals.push(50 + Math.sin(i + t) * 3); // ← near 50, looks similar
      else rsiVals.push(58 + Math.sin(i * 0.5 + t) * 6);
    }

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    rsiVals.forEach((v, i) => { const x = padRL + i * xStepR; i === 0 ? ctx.moveTo(x, toYMpg(v)) : ctx.lineTo(x, toYMpg(v)); });
    ctx.stroke();

    ctx.fillStyle = 'rgba(168,85,247,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RSI near 50 → no distinguishing info', mid + mid / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 3: The Two Ingredients — formula build
// Efficiency × sqrt(Activity) → MPG
// ============================================================
function FormulaBuildAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPG Formula — Efficiency × sqrt(Activity)', w / 2, 14);

    const efficiency = 0.55 + Math.sin(t) * 0.18;
    const activity = 1.3 + Math.sin(t * 0.7) * 0.7;
    const activityFactor = Math.sqrt(Math.max(0, activity));
    const raw = efficiency * activityFactor;
    const clamped = Math.max(0, Math.min(1, raw));
    const mpg = clamped * 100;

    const startX = 20;
    const boxH = h - 50;
    const boxY = 32;
    const mainBoxW = (w - 140) / 3;
    const gap = 12;

    // Box 1: Efficiency
    const box1X = startX;
    ctx.fillStyle = 'rgba(14,165,233,0.08)';
    ctx.fillRect(box1X, boxY, mainBoxW, boxH);
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1;
    ctx.strokeRect(box1X, boxY, mainBoxW, boxH);

    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EFFICIENCY', box1X + mainBoxW / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('displacement / path', box1X + mainBoxW / 2, boxY + 28);
    ctx.fillText('(0 to 1)', box1X + mainBoxW / 2, boxY + 38);

    // Vertical meter
    const m1X = box1X + mainBoxW / 2 - 12;
    const m1Y = boxY + 50;
    const m1H = boxH - 72;
    ctx.fillStyle = 'rgba(14,165,233,0.2)';
    ctx.fillRect(m1X, m1Y, 24, m1H);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(m1X, m1Y + m1H - m1H * efficiency, 24, m1H * efficiency);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(efficiency.toFixed(2), box1X + mainBoxW / 2, boxY + boxH - 10);

    // × operator
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 16px system-ui';
    ctx.fillText('×', box1X + mainBoxW + gap / 2, boxY + boxH / 2 + 5);

    // Box 2: sqrt(Activity)
    const box2X = box1X + mainBoxW + gap;
    ctx.fillStyle = 'rgba(249,168,37,0.08)';
    ctx.fillRect(box2X, boxY, mainBoxW, boxH);
    ctx.strokeStyle = '#F9A825';
    ctx.strokeRect(box2X, boxY, mainBoxW, boxH);

    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('√ ACTIVITY', box2X + mainBoxW / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('sqrt(vol/avg)  or  sqrt(range/ATR)', box2X + mainBoxW / 2, boxY + 28);
    ctx.fillText('(capped ≤3.0 or ≤2.5)', box2X + mainBoxW / 2, boxY + 38);

    // Show raw activity and sqrt result
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px system-ui';
    ctx.fillText(`raw: ${activity.toFixed(2)}`, box2X + mainBoxW / 2, boxY + 56);
    ctx.fillStyle = '#F9A825';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`→ ${activityFactor.toFixed(2)}`, box2X + mainBoxW / 2, boxY + 70);

    // Mini sqrt visualization
    const m2X = box2X + 20;
    const m2W = mainBoxW - 40;
    const m2Y = boxY + 86;
    const m2H = 28;
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(m2X, m2Y + m2H); ctx.lineTo(m2X + m2W, m2Y + m2H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m2X, m2Y); ctx.lineTo(m2X, m2Y + m2H); ctx.stroke();
    // sqrt curve from 0 to 3
    ctx.strokeStyle = '#F9A825';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let j = 0; j < 30; j++) {
      const tt = j / 29;
      const xv = tt * 3;
      const yv = Math.sqrt(xv);
      const px = m2X + tt * m2W;
      const py = m2Y + m2H - (yv / Math.sqrt(3)) * m2H;
      j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    // dot at current activity
    const actT = Math.min(3, activity) / 3;
    const actY = m2Y + m2H - (Math.sqrt(Math.min(3, activity)) / Math.sqrt(3)) * m2H;
    ctx.fillStyle = '#F9A825';
    ctx.beginPath(); ctx.arc(m2X + actT * m2W, actY, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('diminishing returns', m2X, m2Y + m2H + 10);

    // = operator
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('=', box2X + mainBoxW + gap / 2, boxY + boxH / 2 + 5);

    // Box 3: MPG result (wider with EMA smooth note)
    const box3X = box2X + mainBoxW + gap;
    const box3W = w - box3X - 20;
    ctx.fillStyle = 'rgba(0,179,164,0.12)';
    ctx.fillRect(box3X, boxY, box3W, boxH);
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(box3X, boxY, box3W, boxH);

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPG', box3X + box3W / 2, boxY + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.fillText('clamp(0,1) × 100', box3X + box3W / 2, boxY + 28);
    ctx.fillText('+ EMA smoothing', box3X + box3W / 2, boxY + 38);

    // Meter
    const m3X = box3X + box3W / 2 - 16;
    const m3Y = boxY + 50;
    const m3H = boxH - 72;
    ctx.fillStyle = 'rgba(0,179,164,0.2)';
    ctx.fillRect(m3X, m3Y, 32, m3H);
    ctx.fillStyle = '#00B3A4';
    ctx.fillRect(m3X, m3Y + m3H - m3H * (mpg / 100), 32, m3H * (mpg / 100));

    // Tier lines
    [20, 40, 65].forEach(lvl => {
      const ly = m3Y + m3H - (lvl / 100) * m3H;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.moveTo(m3X - 4, ly); ctx.lineTo(m3X + 36, ly); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '5px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.toString(), m3X + 38, ly + 2);
    });

    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(mpg.toFixed(0), box3X + box3W / 2, boxY + boxH - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 4: Efficiency Deep Dive — trend vs rotation
// Reuses concept from MAZ but tuned for MPG's specific rendering
// ============================================================
function EfficiencyDeepDiveAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Efficiency — Displacement / Total Path (10-bar)', w / 2, 14);

    // 3 scenarios
    const scenarios = [
      { label: 'CLEAN TREND', subl: 'high efficiency', color: '#00B3A4', eff: 0.82 },
      { label: 'MIXED', subl: 'moderate', color: '#F9A825', eff: 0.45 },
      { label: 'CHOP', subl: 'low efficiency', color: '#8A8A8A', eff: 0.18 },
    ];

    const cellW = (w - 60) / 3;
    const gap = 10;
    const cellY = 32;
    const boxH = h - 54;

    scenarios.forEach((s, i) => {
      const x = 20 + i * (cellW + gap);

      // Container
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, cellY, cellW, boxH);
      ctx.strokeStyle = s.color + '60';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, cellY, cellW, boxH);

      // Title
      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, x + cellW / 2, cellY + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(s.subl, x + cellW / 2, cellY + 26);

      // Mini price chart
      const chartX = x + 10;
      const chartY = cellY + 38;
      const chartW = cellW - 20;
      const chartH = boxH - 70;
      const numP = 30;

      const priceSeries: number[] = [];
      for (let j = 0; j < numP; j++) {
        if (s.label === 'CLEAN TREND') priceSeries.push(100 + j * 0.3 + Math.sin(j + t) * 0.2);
        else if (s.label === 'MIXED') priceSeries.push(100 + j * 0.15 + Math.sin(j * 0.5 + t) * 1.5);
        else priceSeries.push(100 + Math.sin(j * 0.4 + t) * 2 + Math.cos(j * 0.7 + t) * 1.5);
      }

      const pMin = Math.min(...priceSeries) - 0.5;
      const pMax = Math.max(...priceSeries) + 0.5;
      const pR = pMax - pMin;
      const toY = (v: number) => chartY + chartH - ((v - pMin) / pR) * chartH;
      const xStep = chartW / (numP - 1);

      // Path
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      priceSeries.forEach((v, j) => {
        const px = chartX + j * xStep;
        j === 0 ? ctx.moveTo(px, toY(v)) : ctx.lineTo(px, toY(v));
      });
      ctx.stroke();

      // Displacement arrow
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(chartX, toY(priceSeries[0]));
      ctx.lineTo(chartX + chartW, toY(priceSeries[numP - 1]));
      ctx.stroke();
      ctx.setLineDash([]);

      // Efficiency bar below
      const effBarY = cellY + boxH - 24;
      const effBarW = cellW - 20;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, effBarY, effBarW, 6);
      ctx.fillStyle = s.color;
      ctx.fillRect(x + 10, effBarY, effBarW * s.eff, 6);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`eff: ${s.eff.toFixed(2)}`, x + cellW / 2, effBarY + 16);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Dashed arrow = displacement · Solid = path walked · Efficiency = dashed / solid', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 5: Activity — why sqrt (diminishing returns)
// Linear vs sqrt comparison
// ============================================================
function ActivitySqrtAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Activity — Why sqrt? (Diminishing Returns on Volume)', w / 2, 14);

    const padL = 50;
    const padR = w - 40;
    const chartT = 36;
    const chartB = h - 40;
    const chartH = chartB - chartT;
    const chartW = padR - padL;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, chartT); ctx.lineTo(padL, chartB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, chartB); ctx.lineTo(padR, chartB); ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('activity ratio (volume / avg)', padL + chartW / 2, chartB + 18);
    ctx.save();
    ctx.translate(16, chartT + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('contribution to MPG', 0, 0);
    ctx.restore();

    // X-axis ticks
    [0, 1, 2, 3].forEach(xt => {
      const x = padL + (xt / 3) * chartW;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.moveTo(x, chartB); ctx.lineTo(x, chartB + 3); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px system-ui';
      ctx.fillText(xt.toString(), x, chartB + 10);
    });

    // Linear line (baseline — "wrong")
    ctx.strokeStyle = 'rgba(239,68,68,0.65)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, chartB);
    ctx.lineTo(padR, chartT + 5);
    ctx.stroke();
    ctx.setLineDash([]);

    // sqrt curve (MPG's choice — "right")
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const tt = i / 60;
      const x = padL + tt * chartW;
      const vRaw = tt * 3;
      const vSqrt = Math.sqrt(vRaw);
      const y = chartB - (vSqrt / Math.sqrt(3)) * (chartH - 10);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Cap indicator at x=3
    const capX = padL + chartW;
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(capX, chartT); ctx.lineTo(capX, chartB); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('cap = 3.0', capX - 4, chartT + 12);

    // Animated dot showing current activity
    const actRaw = 1.5 + Math.sin(t) * 1.2;
    const actClamped = Math.max(0, Math.min(3, actRaw));
    const dotX = padL + (actClamped / 3) * chartW;
    const dotYSqrt = chartB - (Math.sqrt(actClamped) / Math.sqrt(3)) * (chartH - 10);
    const dotYLin = chartB - (actClamped / 3) * (chartH - 5);

    ctx.fillStyle = '#00B3A4';
    ctx.beginPath(); ctx.arc(dotX, dotYSqrt, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.beginPath(); ctx.arc(dotX, dotYLin, 3, 0, Math.PI * 2); ctx.fill();

    // Legend
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('⋯ linear (naive)', padL + 8, chartT + 12);
    ctx.fillStyle = '#00B3A4';
    ctx.fillText('━ sqrt (MPG choice)', padL + 110, chartT + 12);

    // Annotation explaining the why
    const ann = 'A 3× volume spike should not triple MPG — it should boost it moderately.';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ann, w / 2, chartB + 32);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: THE VOLUME FALLBACK DOCTRINE ⭐ (NEW CONCEPT)
// 3-layer cascade viz
// ============================================================
function VolumeFallbackDoctrineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('★ The Volume Fallback Doctrine ★', w / 2, 14);

    // Cycle through 3 scenarios: volume OK, volume bad, FX proxy
    const scenarios = [
      { id: 0, name: 'Equities / Crypto', detail: 'volume > 0 AND avg > 0', path: 'volume / volAvg', result: 'hasVolume = TRUE', color: '#00B3A4', activity: 1.35 },
      { id: 1, name: 'Forex (broker feeds)', detail: 'volume NaN or 0 or unreliable', path: '(high - low) / ATR, capped 2.5', result: 'hasVolume = FALSE', color: '#F9A825', activity: 1.18 },
      { id: 2, name: 'Illiquid / closed session', detail: 'ATR NaN or 0', path: 'activity = 1.0 (neutral fallback)', result: 'fully degraded', color: '#8A8A8A', activity: 1.0 },
    ];

    const activeIdx = Math.floor(t * 0.4) % 3;

    // Layer stack visualization
    const padL = 30;
    const padR = w - 30;
    const layerW = padR - padL;
    const layerH = 34;
    const gap = 14;
    const startY = 36;

    scenarios.forEach((s, i) => {
      const y = startY + i * (layerH + gap);
      const isActive = i === activeIdx;

      // Layer box
      ctx.fillStyle = s.color + (isActive ? '25' : '10');
      ctx.fillRect(padL, y, layerW, layerH);
      ctx.strokeStyle = isActive ? s.color : s.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(padL, y, layerW, layerH);

      // Layer number
      ctx.fillStyle = isActive ? s.color : s.color + '99';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, padL + 10, y + 22);

      // Name + condition
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(s.name, padL + 32, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '7px system-ui';
      ctx.fillText(`IF ${s.detail}`, padL + 32, y + 26);

      // Arrow + result
      const arrowX = padL + layerW * 0.48;
      ctx.fillStyle = isActive ? s.color : s.color + '77';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText('→', arrowX, y + 20);

      ctx.fillStyle = isActive ? s.color : s.color + 'aa';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(s.path, arrowX + 16, y + 14);

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '7px system-ui';
      ctx.fillText(`→ ${s.result}`, arrowX + 16, y + 26);

      // Active pulse indicator
      if (isActive) {
        const pulse = 0.4 + Math.sin(t * 8) * 0.3;
        ctx.fillStyle = s.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
        ctx.beginPath(); ctx.arc(padR - 12, y + layerH / 2, 5, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Active output
    const active = scenarios[activeIdx];
    const outY = startY + 3 * (layerH + gap) + 4;
    ctx.fillStyle = active.color + '20';
    ctx.fillRect(padL, outY, layerW, 20);
    ctx.strokeStyle = active.color;
    ctx.strokeRect(padL, outY, layerW, 20);
    ctx.fillStyle = active.color;
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Active layer: ${active.name} · activity = ${active.activity.toFixed(2)}`, w / 2, outY + 13);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: The 4 Tiers — THIN / BUILDING / STRONG / EXTREME
// ============================================================
function FourTiersAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Four Tiers — 0-20 · 20-40 · 40-65 · 65+', w / 2, 14);

    const tiers = [
      { name: 'THIN', range: '0-20', color: '#8A8A8A', desc: 'Drifting — low volume, no conviction', lvlMid: 10 },
      { name: 'BUILDING', range: '20-40', color: '#F9A825', desc: 'Emerging — participation rising', lvlMid: 30 },
      { name: 'STRONG', range: '40-65', color: '#00B3A4', desc: 'Solid — healthy engagement', lvlMid: 52 },
      { name: 'EXTREME', range: '65+', color: '#00B3A4', desc: 'Climactic — potential exhaustion', lvlMid: 80, fullBright: true },
    ];

    // Vertical gauge left side
    const gaugeX = 25;
    const gaugeY = 34;
    const gaugeW = 40;
    const gaugeH = h - 60;
    const tierBoundaries = [0, 20, 40, 65, 100];

    tiers.forEach((tier, i) => {
      const y1 = gaugeY + gaugeH - (tierBoundaries[i + 1] / 100) * gaugeH;
      const y2 = gaugeY + gaugeH - (tierBoundaries[i] / 100) * gaugeH;
      ctx.fillStyle = tier.color + (tier.fullBright ? '35' : '20');
      ctx.fillRect(gaugeX, y1, gaugeW, y2 - y1);
      ctx.strokeStyle = tier.color + '80';
      ctx.strokeRect(gaugeX, y1, gaugeW, y2 - y1);

      // Tier label
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(tier.name, gaugeX + gaugeW / 2, (y1 + y2) / 2 + 2);
    });

    // Tier boundary labels
    tierBoundaries.forEach(b => {
      const y = gaugeY + gaugeH - (b / 100) * gaugeH;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(b.toString(), gaugeX + gaugeW + 4, y + 2);
    });

    // Live MPG needle cycling through tiers
    const cycleVal = 50 + Math.sin(t * 0.5) * 40;
    const clampedVal = Math.max(0, Math.min(100, cycleVal));
    const needleY = gaugeY + gaugeH - (clampedVal / 100) * gaugeH;

    // Determine current tier
    let curTierIdx = 0;
    if (clampedVal >= 65) curTierIdx = 3;
    else if (clampedVal >= 40) curTierIdx = 2;
    else if (clampedVal >= 20) curTierIdx = 1;
    const curTier = tiers[curTierIdx];

    // Needle
    ctx.strokeStyle = curTier.color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(gaugeX - 8, needleY); ctx.lineTo(gaugeX + gaugeW + 20, needleY); ctx.stroke();
    ctx.fillStyle = curTier.color;
    ctx.beginPath();
    ctx.moveTo(gaugeX + gaugeW + 20, needleY);
    ctx.lineTo(gaugeX + gaugeW + 28, needleY - 4);
    ctx.lineTo(gaugeX + gaugeW + 28, needleY + 4);
    ctx.closePath(); ctx.fill();

    // Right side description cards for each tier
    const cardsX = 150;
    const cardsW = w - cardsX - 20;
    const cardH = (h - 70) / 4;

    tiers.forEach((tier, i) => {
      const y = 34 + (3 - i) * cardH;
      const isActive = i === curTierIdx;

      ctx.fillStyle = tier.color + (isActive ? '25' : '10');
      ctx.fillRect(cardsX, y + 2, cardsW, cardH - 4);
      ctx.strokeStyle = isActive ? tier.color : tier.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(cardsX, y + 2, cardsW, cardH - 4);

      ctx.fillStyle = tier.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(tier.name, cardsX + 12, y + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px system-ui';
      ctx.fillText(tier.range, cardsX + 78, y + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '8px system-ui';
      ctx.fillText(tier.desc, cardsX + 12, y + 32);
    });

    // Live value readout
    ctx.fillStyle = curTier.color;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`MPG: ${clampedVal.toFixed(0)}`, gaugeX + gaugeW / 2, h - 12);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 8: Quality Trichotomy — Clean / Absorbed / Neutral
// ============================================================
function QualityTrichotomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Quality Trichotomy — Clean · Absorbed · Neutral', w / 2, 14);

    const qualities = [
      { name: 'CLEAN', cond: 'efficiency > 0.55', color: '#00B3A4', eff: 0.68, act: 1.4, desc: 'Direct movement with confirmation', q: 1 },
      { name: 'ABSORBED', cond: 'act > 1.5 AND eff < 0.30', color: '#C2185B', eff: 0.22, act: 2.1, desc: 'Volume without direction — effort trapped', q: -1 },
      { name: 'NEUTRAL', cond: 'falls between', color: '#8A8A8A', eff: 0.42, act: 1.1, desc: 'Moderate on both axes', q: 0 },
    ];

    const cellW = (w - 50) / 3;
    const gap = 10;
    const cellY = 34;
    const boxH = h - 54;
    const activeIdx = Math.floor(t * 0.5) % 3;

    qualities.forEach((q, i) => {
      const x = 15 + i * (cellW + gap);
      const isActive = i === activeIdx;

      // Container
      ctx.fillStyle = q.color + (isActive ? '20' : '08');
      ctx.fillRect(x, cellY, cellW, boxH);
      ctx.strokeStyle = isActive ? q.color : q.color + '55';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x, cellY, cellW, boxH);

      // Header
      ctx.fillStyle = q.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(q.name, x + cellW / 2, cellY + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px monospace';
      ctx.fillText(q.cond, x + cellW / 2, cellY + 26);

      // 2D plot: x = activity, y = efficiency
      const plotX = x + 15;
      const plotY = cellY + 34;
      const plotW = cellW - 30;
      const plotH = boxH - 80;

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Threshold lines
      // efficiency 0.55 line (horizontal)
      const effLineY = plotY + plotH - 0.55 * plotH;
      ctx.strokeStyle = 'rgba(0,179,164,0.35)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(plotX, effLineY); ctx.lineTo(plotX + plotW, effLineY); ctx.stroke();
      // efficiency 0.30 line
      const effLowY = plotY + plotH - 0.30 * plotH;
      ctx.strokeStyle = 'rgba(194,24,91,0.35)';
      ctx.beginPath(); ctx.moveTo(plotX, effLowY); ctx.lineTo(plotX + plotW, effLowY); ctx.stroke();
      // activity 1.5 line (vertical)
      const actLineX = plotX + (1.5 / 3) * plotW;
      ctx.beginPath(); ctx.moveTo(actLineX, plotY); ctx.lineTo(actLineX, plotY + plotH); ctx.stroke();
      ctx.setLineDash([]);

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('activity →', plotX + plotW / 2, plotY + plotH + 10);
      ctx.save();
      ctx.translate(plotX - 8, plotY + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('eff →', 0, 0);
      ctx.restore();

      // Dot
      const dotX = plotX + Math.min(q.act / 3, 1) * plotW;
      const dotY = plotY + plotH - q.eff * plotH;
      const pulse = isActive ? 1.2 + Math.sin(t * 6) * 0.3 : 1;
      ctx.fillStyle = q.color;
      ctx.beginPath(); ctx.arc(dotX, dotY, 4 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(dotX, dotY, 4 * pulse, 0, Math.PI * 2); ctx.stroke();

      // Desc
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(q.desc, x + cellW / 2, cellY + boxH - 14);

      // quality integer readout
      ctx.fillStyle = q.color;
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`quality = ${q.q >= 0 ? '+' : ''}${q.q}`, x + cellW / 2, cellY + boxH - 3);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: Color Logic — tier × quality cross product
// ============================================================
function ColorLogicAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Color Logic — Tier Overrides Quality Below 40', w / 2, 14);

    // Build matrix
    const tiers = ['THIN (0-20)', 'BUILDING (20-40)', 'STRONG (40-65)', 'EXTREME (65+)'];
    const qualities = ['Clean', 'Neutral', 'Absorbed'];

    const gridX = 110;
    const gridY = 44;
    const cellW = (w - gridX - 30) / 3;
    const cellH = (h - gridY - 40) / 4;

    // Quality headers
    qualities.forEach((q, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(q, gridX + i * cellW + cellW / 2, gridY - 6);
    });

    // Tier rows with color cells
    tiers.forEach((tier, ti) => {
      const y = gridY + ti * cellH;
      // Row label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(tier, gridX - 6, y + cellH / 2 + 3);

      qualities.forEach((q, qi) => {
        const x = gridX + qi * cellW;

        // Determine color per Pine logic
        let color = '#8A8A8A'; // default grey
        let label = 'grey';
        if (ti === 0) { color = '#8A8A8A'; label = 'grey'; }
        else if (ti === 1) { color = '#F9A825'; label = 'amber'; }
        else {
          // STRONG / EXTREME
          if (q === 'Clean') { color = '#00B3A4'; label = 'teal'; }
          else if (q === 'Absorbed') { color = '#C2185B'; label = 'magenta'; }
          else { color = '#8A8A8A'; label = 'grey'; }
        }

        // Cell
        ctx.fillStyle = color + '40';
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

        // Color sample
        ctx.fillStyle = color;
        ctx.fillRect(x + cellW / 2 - 10, y + cellH / 2 - 8, 20, 16);

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + cellW / 2, y + cellH - 6);
      });
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THIN is always grey. BUILDING is always amber. STRONG/EXTREME use quality colors.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 10: Reading the Histogram — 4 real scenarios
// ============================================================
function ReadingHistogramAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Reading the MPG Histogram — Four Scenarios', w / 2, 14);

    const scenarios = [
      { name: 'Quiet Drift', desc: 'grey bars, low level → no trade', color: '#8A8A8A' },
      { name: 'Breakout Start', desc: 'grey → amber rising → STRONG teal', color: '#F9A825' },
      { name: 'Absorbed Effort', desc: 'magenta spike → trapped', color: '#C2185B' },
      { name: 'Climax Warning', desc: 'EXTREME teal → possible exhaustion', color: '#00B3A4' },
    ];

    const cellW = (w - 50) / 2;
    const cellH = (h - 50) / 2;

    scenarios.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 15 + col * (cellW + 10);
      const y = 30 + row * (cellH + 10);

      // Container
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = s.color + '60';
      ctx.strokeRect(x, y, cellW, cellH);

      // Title
      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, x + 10, y + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(s.desc, x + 10, y + 26);

      // Mini MPG histogram
      const hX = x + 10;
      const hY = y + 34;
      const hW = cellW - 20;
      const hH = cellH - 50;
      const numBars = 20;
      const bW = hW / numBars;

      // Tier lines
      [20, 40, 65].forEach(lvl => {
        const ly = hY + hH - (lvl / 100) * hH;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.moveTo(hX, ly); ctx.lineTo(hX + hW, ly); ctx.stroke();
      });

      for (let j = 0; j < numBars; j++) {
        const bx = hX + j * bW;
        let v = 0;
        let c = '#8A8A8A';
        if (i === 0) {
          // Quiet drift — grey thin
          v = 8 + Math.sin(j * 0.4 + t) * 6;
          c = '#8A8A8A';
        } else if (i === 1) {
          // Breakout start — grey → amber → teal
          if (j < 7) { v = 12 + Math.sin(j + t) * 3; c = '#8A8A8A'; }
          else if (j < 14) { v = 25 + (j - 7) * 2 + Math.sin(j + t) * 2; c = '#F9A825'; }
          else { v = 48 + Math.sin(j + t) * 4; c = '#00B3A4'; }
        } else if (i === 2) {
          // Absorbed spike
          if (j < 10) { v = 30 + Math.sin(j * 0.5 + t) * 5; c = '#F9A825'; }
          else if (j < 15) { v = 50 + Math.sin(j + t) * 4; c = '#C2185B'; }
          else { v = 28 + Math.sin(j + t) * 5; c = '#F9A825'; }
        } else {
          // Climax
          if (j < 5) { v = 42 + Math.sin(j + t) * 3; c = '#00B3A4'; }
          else if (j < 15) { v = 72 + Math.sin(j * 0.3 + t) * 6; c = '#00B3A4'; }
          else { v = 45 + Math.sin(j + t) * 5; c = '#00B3A4'; }
        }
        v = Math.max(2, Math.min(95, v));
        const barTop = hY + hH - (v / 100) * hH;
        ctx.fillStyle = c;
        ctx.fillRect(bx + 0.5, barTop, bW - 1, hY + hH - barTop);
      }
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 11: Momentum & Direction
// ============================================================
function MomentumDirectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Momentum & Direction — Δ MPG Over One Bar', w / 2, 14);

    // Top panel: MPG line with momentum readout
    const padL = 25;
    const padR = w - 120;
    const chartT = 32;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    // Right side: direction indicator
    const dirX = padR + 30;
    const dirW = w - dirX - 20;

    const pts = 50;
    const mpg: number[] = [];
    for (let i = 0; i < pts; i++) {
      mpg.push(40 + Math.sin(i * 0.2 + t) * 20 + Math.sin(i * 0.5 + t * 0.6) * 10);
    }

    const xStep = (padR - padL) / (pts - 1);
    const toY = (v: number) => chartB - (Math.max(0, Math.min(100, v)) / 100) * (chartH - 6) - 3;

    // Tier lines
    [20, 40, 65].forEach(lvl => {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(padL, toY(lvl)); ctx.lineTo(padR, toY(lvl)); ctx.stroke();
      ctx.setLineDash([]);
    });

    // MPG line
    ctx.strokeStyle = '#00B3A4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    mpg.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Histogram subtle
    mpg.forEach((v, i) => {
      const x = padL + i * xStep;
      ctx.fillStyle = 'rgba(0,179,164,0.15)';
      ctx.fillRect(x - xStep / 2 + 0.5, toY(v), xStep - 1, chartB - toY(v));
    });

    // Current momentum (last bar)
    const mom = mpg[pts - 1] - mpg[pts - 2];
    const dir = mom > 3 ? 1 : (mom < -3 ? -1 : 0);

    // Direction box
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(dirX, chartT + 6, dirW, chartH - 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(dirX, chartT + 6, dirW, chartH - 12);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DIRECTION', dirX + dirW / 2, chartT + 18);

    let dirColor = '#8A8A8A';
    let dirText = '→';
    let dirLabel = 'FLAT';
    if (dir > 0) { dirColor = '#00B3A4'; dirText = '▲'; dirLabel = 'RISING'; }
    else if (dir < 0) { dirColor = '#C2185B'; dirText = '▼'; dirLabel = 'FALLING'; }

    ctx.fillStyle = dirColor;
    ctx.font = 'bold 32px system-ui';
    ctx.fillText(dirText, dirX + dirW / 2, chartT + 56);
    ctx.font = 'bold 9px system-ui';
    ctx.fillText(dirLabel, dirX + dirW / 2, chartT + 72);

    // Momentum value
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText(`Δ = ${mom >= 0 ? '+' : ''}${mom.toFixed(1)}`, dirX + dirW / 2, chartT + 88);
    ctx.fillText('thr ±3.0', dirX + dirW / 2, chartT + 100);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('mpgDir = momentum > 3 ? +1 : (momentum < -3 ? -1 : 0)', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 12: MPG × ATLAS Confluence
// ============================================================
function MPGConfluenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPG × MAE × MSI — Confluence Across The Stack', w / 2, 14);

    const padL = 25;
    const padR = w - 15;
    const xRange = padR - padL;

    // Three stacked panels
    const paneH = (h - 50) / 3;
    const pane1Y = 32;
    const pane2Y = pane1Y + paneH + 4;
    const pane3Y = pane2Y + paneH + 4;

    const pts = 60;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(i * 0.15 + t) * 4 + Math.sin(i * 0.4 + t * 0.5) * 2);
    }

    const xStep = xRange / (pts - 1);

    // === PANE 1: Price with MAE envelope ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, pane1Y, xRange, paneH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, pane1Y, xRange, paneH);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE + MAE envelope', padL + 4, pane1Y + 10);

    const pMin = Math.min(...prices) - 3;
    const pMax = Math.max(...prices) + 3;
    const pRange = pMax - pMin;
    const toY1 = (v: number) => pane1Y + paneH - ((v - pMin) / pRange) * (paneH - 8) - 4;

    // MAE corridor
    ctx.fillStyle = 'rgba(38,166,154,0.12)';
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY1(v + 2)) : ctx.lineTo(x, toY1(v + 2)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY1(prices[i] - 2)); }
    ctx.closePath(); ctx.fill();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY1(v)) : ctx.lineTo(x, toY1(v)); });
    ctx.stroke();

    // === PANE 2: MSI regime ribbon ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, pane2Y, xRange, paneH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, pane2Y, xRange, paneH);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MSI regime', padL + 4, pane2Y + 10);

    // Regime blocks
    for (let i = 0; i < pts - 1; i++) {
      const x1 = padL + i * xStep;
      const x2 = padL + (i + 1) * xStep;
      let color = '#5F6B7A'; // COMP default
      if (i < 15) color = '#5F6B7A'; // COMP
      else if (i < 30) color = '#2FA4A9'; // EXP
      else if (i < 45) color = '#3A8F6B'; // TREND
      else color = '#C28B2C'; // DIST
      ctx.fillStyle = color + '99';
      ctx.fillRect(x1, pane2Y + paneH / 2, x2 - x1, paneH / 2 - 6);
    }

    // === PANE 3: MPG oscillator ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, pane3Y, xRange, paneH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, pane3Y, xRange, paneH);
    ctx.fillStyle = '#00B3A4';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPG (0-100)', padL + 4, pane3Y + 10);

    // Synthetic MPG correlated with regime
    const toY3 = (v: number) => pane3Y + paneH - 4 - (v / 100) * (paneH - 16);
    [20, 40, 65].forEach(lvl => {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(padL, toY3(lvl)); ctx.lineTo(padR, toY3(lvl)); ctx.stroke();
      ctx.setLineDash([]);
    });

    for (let i = 0; i < pts; i++) {
      const x = padL + i * xStep;
      let v = 0;
      let c = '#8A8A8A';
      if (i < 15) { v = 12 + Math.sin(i + t) * 5; c = '#8A8A8A'; }
      else if (i < 30) { v = 30 + (i - 15) * 1.5 + Math.sin(i + t) * 4; c = '#F9A825'; }
      else if (i < 45) { v = 52 + Math.sin(i * 0.5 + t) * 6; c = '#00B3A4'; }
      else { v = 58 - (i - 45) * 0.5 + Math.sin(i + t) * 4; c = '#00B3A4'; }
      v = Math.max(2, Math.min(95, v));
      ctx.fillStyle = c;
      ctx.fillRect(x - xStep / 2 + 0.5, toY3(v), xStep - 1, pane3Y + paneH - 4 - toY3(v));
    }

    // Annotation: confluence moment
    const confluenceIdx = 35;
    const confX = padL + confluenceIdx * xStep;
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(confX, pane1Y); ctx.lineTo(confX, pane3Y + paneH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONFLUENCE', confX, pane1Y - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('MAE stable · MSI TREND · MPG STRONG teal', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MPG interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'Your MPG reads 72 and the histogram bars are <strong>teal</strong>. Price is in a strong uptrend. What does this combined reading tell you?',
    options: [
      { text: 'Participation has reached the EXTREME tier (65+) with CLEAN quality — direct movement with confirming activity. This is healthy trend energy, but it is also approaching potential climax. Not a signal to short, but a warning to watch for quality deterioration (shift to absorbed magenta) which would flag exhaustion.', correct: true, explain: 'Correct. EXTREME tier means efficiency × sqrt(activity) is producing exceptional participation scores. Teal means current efficiency is > 0.55 — price really is moving directly. The &ldquo;potential climax&rdquo; framing is from the Pine source itself: EXTREME is not a buy OR sell signal, it is a FLAG. The professional read: accept the trend is real AND watch for quality change.' },
      { text: 'EXTREME means overbought — short it', correct: false, explain: 'MPG is NOT RSI. It is a participation oscillator, not a momentum oscillator. 72 does not mean overbought. It means very strong participation. The tool explicitly does not encode reversal signals. Treating EXTREME as a short signal conflates MPG with momentum oscillators — the exact category error this lesson exists to prevent.' },
    ],
  },
  {
    scenario: 'MPG shows a <strong>magenta</strong> spike from 45 → 58. The bar color flipped from teal to magenta. What specifically happened?',
    options: [
      { text: 'Nothing unusual — magenta is just a color', correct: false, explain: 'Magenta is semantic, not decorative. The Pine source maps it exclusively to isAbsorbed state: activityFinal &gt; 1.5 AND efficiency &lt; 0.30. It means volume (or range as volume proxy) exceeded 1.5× average simultaneously with efficiency dropping below 0.30. That is a specific absorption signature, not noise.' },
      { text: 'Activity exceeded 1.5× average AND efficiency dropped below 0.30 simultaneously. The volume is present but price is not going anywhere with it — classic absorption. Institutional flow is being applied against the direction retail is chasing. Magenta during a trend is a warning that the move may be ending.', correct: true, explain: 'Exactly. Magenta is the specific visual encoding for &ldquo;effort absorbed.&rdquo; It is the one condition where a growing MPG level is actually a NEGATIVE — because the score rose on volume that failed to produce movement. The color is the tool&apos;s way of saying: look closer at this spike. Context matters: magenta at the top of a trend = exhaustion warning; magenta at a support area after a drop = absorption suggesting reversal.' },
    ],
  },
  {
    scenario: 'You switched from a crypto chart (BTC/USDT) to a Forex chart (EUR/USD) and MPG is still functioning cleanly. How does that work without real volume data?',
    options: [
      { text: 'The Volume Fallback Doctrine. When hasVolume is false, the tool falls back to (high-low)/ATR capped at 2.5 as a range-based proxy for participation. When even ATR is unavailable, it falls to a neutral 1.0. Three layers of defensive fallback mean MPG produces meaningful readings across asset classes — which most volume-based indicators cannot do.', correct: true, explain: 'Right. The Pine source explicitly computes rangeActivity = (high-low)/ATR capped at 2.5, used when hasVolume is false. This is the same class of thinking as MSI&apos;s robust fallbacks. Most retail indicators just safeDiv(volume, volAvg) without checking existence, and they silently produce garbage or NaN on FX. MPG is engineered for cross-asset reliability — rare in free indicators.' },
      { text: 'MPG just fails silently on Forex and shows zeros', correct: false, explain: 'Backwards. MPG is specifically designed with a 3-layer fallback (real volume → range proxy → neutral 1.0) precisely so it does NOT fail silently. If it defaulted to zeros on FX, the histogram would be flat and the lesson would be irrelevant. The cascade ensures meaningful output on every asset class.' },
    ],
  },
  {
    scenario: 'MPG on a 15-minute chart has been oscillating between 18-22 for the past 2 hours, bars alternating between thin grey and building amber. What is the appropriate read?',
    options: [
      { text: 'The market is in a low-participation drift near the THIN/BUILDING boundary. Neither side is committed. A tradeable setup requires STRONG tier or better (40+). The professional action is to stand aside, reduce size, or wait for a clean tier escalation into STRONG.', correct: true, explain: 'Correct. Bouncing between 18 and 22 means the market is at the edge of meaningful participation without crossing into it. THIN (0-20) is drift. BUILDING (20-40) is emergence. Until you see a sustained move into STRONG, the statistical edge available is low. This is exactly the kind of reading where MPG saves traders from forcing setups that the market is not supporting.' },
      { text: 'Buy when MPG crosses 20 going up, sell when it crosses 20 going down', correct: false, explain: 'MPG is not a crossover signal generator. The 20 line is a TIER BOUNDARY, not a trigger. Price can easily chop back and forth across 20 without any directional significance. Treating tier boundaries as cross signals is the same mistake as treating RSI 50 as a buy/sell line — technically definable, operationally useless.' },
    ],
  },
  {
    scenario: 'In the status line, you see MPG = 48, Tier = 2, Dir = +1, Quality = -1. What configuration of conditions does this encode?',
    options: [
      { text: 'Participation is STRONG (40-65 tier), rising by more than 3 points vs the prior bar (Dir +1), but the quality is ABSORBED (Quality -1, meaning act &gt; 1.5 AND eff &lt; 0.30). Rising participation driven by absorbed activity — an unusual &ldquo;effort being absorbed as the meter rises&rdquo; configuration. Highly informative signal to examine the trade context carefully.', correct: true, explain: 'This is the kind of nuanced reading the Full HUD detail makes possible. Dir = +1 means momentum &gt; +3. Quality = -1 means absorbed state. Rising absorbed participation at STRONG tier means volume is growing but not producing clean direction — often a precursor to either a breakout that gets trapped, or a reversal. The Full HUD exists exactly to expose this kind of multi-factor state.' },
      { text: 'It means buy', correct: false, explain: 'MPG has no buy or sell encoding. Tier, Dir, and Quality are three orthogonal diagnostic dimensions. They describe WHAT the market is doing, not WHAT you should do. Reading them as a signal is the category error the lesson is trying to prevent.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market Participation Gradient (MPG) is architecturally a:', opts: ['Overlay indicator (drawn on price)', 'Sub-pane oscillator (separate window, 0-100 scale, precision 2)', 'Drawing tool', 'Strategy backtester'], correct: 1, explain: 'MPG is declared with overlay = false in the Pine source, making it a sub-pane oscillator. This is architecturally different from every other ATLAS free indicator (Sessions+, MAE, MSI, MAZ) which are all overlays. Understanding this category shift is essential to reading the tool correctly.' },
  { q: 'The MPG formula is:', opts: ['close / open', 'Efficiency × sqrt(Activity), clamped 0-1, scaled to 0-100, then EMA-smoothed', 'RSI + MACD', 'VWAP minus price'], correct: 1, explain: 'Exact source: participationRaw = efficiency × sqrt(activityFinal). The sqrt produces diminishing returns on volume — a 3× volume spike boosts MPG moderately, not 3×. Clamped to [0,1], multiplied by 100, then EMA-smoothed (default length 5).' },
  { q: 'Why does MPG use sqrt(activity) instead of linear activity?', opts: ['Computational speed', 'Diminishing returns — prevents volume spikes from dominating the score disproportionately', 'Tradition', 'It matches RSI'], correct: 1, explain: 'The sqrt curve is the mathematical encoding of &ldquo;a 3× volume spike should boost MPG moderately, not 3×.&rdquo; Linear activity would make MPG fundamentally a volume indicator; sqrt keeps it a participation indicator.' },
  { q: 'When hasVolume is false (e.g., on Forex), MPG falls back to:', opts: ['Returning NaN', '(high - low) / ATR, capped at 2.5 — a range-based proxy for activity', 'Random values', 'Closing the indicator'], correct: 1, explain: 'The Volume Fallback Doctrine: a 3-layer cascade. Layer 1 = real volume when valid. Layer 2 = range / ATR as proxy. Layer 3 = neutral 1.0 if even ATR is unavailable. This is why MPG produces meaningful readings on asset classes where naive volume-based indicators fail silently.' },
  { q: 'The four MPG tiers with exact boundaries are:', opts: ['Low, Mid, High', 'THIN (0-20), BUILDING (20-40), STRONG (40-65), EXTREME (65+)', 'Bearish, Neutral, Bullish, Climactic', 'Support, Trend, Resistance, Breakout'], correct: 1, explain: 'Exact boundaries from source: mpg < 20 → tier 0 (THIN), < 40 → tier 1 (BUILDING), < 65 → tier 2 (STRONG), else tier 3 (EXTREME). These values are constants, not user-configurable — they are part of the tool&apos;s semantic contract.' },
  { q: 'The &ldquo;Absorbed&rdquo; quality state (magenta color) is triggered when:', opts: ['Price drops sharply', 'activityFinal > 1.5 AND efficiency < 0.30 simultaneously', 'Volume is zero', 'MPG is above 50'], correct: 1, explain: 'Exact source logic: isAbsorbed = activityFinal > 1.5 AND efficiency < 0.30. Both conditions must be true. Meaning: volume (or range proxy) is high while directional efficiency is low. Effort is being applied but not producing movement — institutional absorption signature.' },
  { q: 'In THIN (0-20) and BUILDING (20-40) tiers, the quality color is:', opts: ['Always the quality-based color', 'Overridden: THIN is always grey, BUILDING is always amber', 'Random', 'User-configurable'], correct: 1, explain: 'The color logic has a tier override: tierColor = mpgTier == 0 ? grey : (mpgTier == 1 ? amber : quality-based). Below STRONG, the level itself is not significant enough to warrant quality coloring. Quality colors only appear in STRONG and EXTREME tiers where interpretation depends on it.' },
  { q: 'MPG direction (mpgDir) is computed as:', opts: ['Price change', 'MPG slope only', 'momentum > 3 ? +1 : (momentum < -3 ? -1 : 0) — a 3-point threshold on MPG change bar-to-bar', 'Volume delta'], correct: 2, explain: 'mpgDir is a 3-state signal (-1, 0, +1) based on the MPG bar-to-bar change vs a ±3.0 threshold. Not the price direction — the PARTICIPATION direction. Rising MPG means participation is growing; falling means it is declining. This is orthogonal to price direction.' },
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
export default function MPGDeepDiveLesson() {
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
    { wrong: 'Treating MPG like RSI or Stochastic — looking for overbought/oversold', right: 'MPG is a participation oscillator, not a momentum oscillator. A reading of 72 does NOT mean overbought. A reading of 15 does NOT mean oversold. It means participation is EXTREME or THIN. These are orthogonal concepts. Reading MPG with RSI muscle memory generates systematic wrong conclusions.', icon: '🔄' },
    { wrong: 'Ignoring quality color and focusing only on level', right: 'An MPG reading of 50 is not one thing — it is three possible things depending on quality color. Teal 50 is healthy participation. Magenta 50 is absorption (probably negative). Grey 50 is ambiguous effort. Reading only the level discards half the tool&apos;s information.', icon: '🎨' },
    { wrong: 'Expecting MPG to generate buy/sell signals', right: 'MPG is a diagnostic primitive. It tells you the QUALITY of participation; it does not tell you DIRECTION. Pair it with a signal tool (CIPHER trigger, SMC structure break) or MSI for regime context. MPG in isolation is like a thermometer — useful for diagnosis, not a treatment plan.', icon: '🎯' },
    { wrong: 'Dismissing MPG on Forex because &ldquo;there&apos;s no real volume&rdquo;', right: 'MPG is engineered with the Volume Fallback Doctrine specifically for this case. When hasVolume is false, it uses (high-low)/ATR capped at 2.5 as a robust range-based proxy. This makes MPG one of the few participation tools that produces meaningful readings across equities, crypto, AND forex — a significant feature worth using.', icon: '🌍' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 6</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market Participation<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Gradient</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">A participation oscillator, not a momentum oscillator. Efficiency × sqrt(Activity), four tiers, three quality states, and a cross-asset volume fallback that works where others silently fail.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Oscillator Category Error</p>
            <p className="text-gray-400 leading-relaxed mb-4">Every trader learns RSI first. Every trader learns Stochastic second. Every trader learns MACD third. And by the time a fourth oscillator lands in front of them, they&apos;ve fully internalized the assumption that <strong className="text-amber-400">all oscillators are momentum oscillators</strong>. They read every new sub-pane tool through that lens. Overbought. Oversold. Divergence. Crossovers.</p>
            <p className="text-gray-400 leading-relaxed mb-4">MPG is not a momentum oscillator. It&apos;s a <strong className="text-white">participation oscillator</strong>. That is a fundamentally different object class. Momentum oscillators answer: &ldquo;which direction is price going and how fast?&rdquo; MPG answers: &ldquo;is anyone actually engaged right now, and is their effort producing results?&rdquo; One of those questions is about direction. The other is about reality.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The core formula is elegantly minimal: <strong className="text-white">efficiency × sqrt(activity)</strong>. Efficiency measures whether price is moving directly or wandering. Activity measures whether volume (or range, as a fallback) is confirming. sqrt gives diminishing returns to prevent volume spikes from dominating. The result is bounded 0-100, then EMA-smoothed, then classified into four tiers with three possible quality states.</p>
            <p className="text-gray-400 leading-relaxed">Every visual element encodes specific information. The level says how much participation. The color says what quality. The direction says whether engagement is rising or falling. None of it is decorative. Read it as the diagnostic primitive it is and it becomes one of the most valuable free tools in the ATLAS suite — especially because, unlike most volume-based indicators, it actually works across asset classes.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE MPG AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">MPG measures WHETHER anyone is engaged. It does not measure WHICH WAY they are going. Keep those two questions separate and the tool becomes useful. Conflate them and it becomes another RSI variant you&apos;ll abandon in three weeks.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Overlay vs Oscillator === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Category Shift</p>
          <h2 className="text-2xl font-extrabold mb-4">Overlay vs Oscillator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every ATLAS indicator you&apos;ve studied so far lives on the price chart. Sessions+, MAE, MSI, MAZ — all overlays. MPG is different: <strong className="text-white">it lives in a separate sub-pane, on a fixed 0-100 scale, below the price chart</strong>. The Pine source declares <code className="text-white">overlay = false</code>. This is not a cosmetic choice — it signals a different category of indicator entirely.</p>
          <OverlayVsOscillatorAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Sub-Pane</p>
            <p className="text-sm text-gray-400">MPG&apos;s output is a SCORE, not a level. You don&apos;t want scores drawn on price — they&apos;d clutter the chart and visually suggest prices that have no actual relation to price structure. Sub-pane rendering is the correct architectural choice for quantitative measurements. It also forces the trader to read MPG as a diagnostic layer alongside price, not a level ON price.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02: Participation vs Momentum === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Participation vs Momentum</p>
          <h2 className="text-2xl font-extrabold mb-4">MPG Is Not RSI</h2>
          <p className="text-gray-400 leading-relaxed mb-6">RSI asks: <em>is price rising or falling, and is that change extreme?</em> MPG asks: <em>is anyone actually engaged, and is their engagement producing clean or absorbed outcomes?</em> These are orthogonal dimensions. A strong trend can have HIGH momentum and LOW participation simultaneously (a thin drift). A chop zone can have LOW momentum and HIGH participation (absorption). The tools measure different things.</p>
          <ParticipationVsMomentumAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Divergence Worth Watching</p>
            <p className="text-sm text-gray-400">Momentum oscillator divergence (price making new highs while RSI fails to confirm) is the classic &ldquo;reversal&rdquo; signal that works maybe 40% of the time. Participation divergence (price making new highs while MPG drops into THIN or shifts to magenta absorbed) is fundamentally different: it is telling you the move is not supported by real engagement — regardless of what the momentum reading says. These two divergence types are not substitutes for each other.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: The Two Ingredients === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Two Ingredients</p>
          <h2 className="text-2xl font-extrabold mb-4">Efficiency × sqrt(Activity)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The entire MPG level reduces to two measurements combined non-linearly. <strong className="text-sky-400">Efficiency (0-1)</strong> captures whether price is moving directly or wandering. <strong className="text-amber-400">Activity (raw)</strong> captures whether volume is confirming. The sqrt keeps the activity contribution from dominating (diminishing returns). Multiply, clamp [0,1], scale to 0-100, EMA-smooth. That&apos;s it. The minimalism is the point.</p>
          <FormulaBuildAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Multiplication?</p>
            <p className="text-sm text-gray-400">Addition would allow high efficiency alone to produce a high score, even with no activity (a gently drifting trend on low volume). Multiplication enforces an AND: both efficiency AND activity must be present for meaningful participation. This is the mathematical encoding of &ldquo;participation requires someone to be actually trading, not just price moving.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Efficiency Deep Dive === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Efficiency</p>
          <h2 className="text-2xl font-extrabold mb-4">Displacement Over Total Path</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Efficiency = <code className="text-white">abs(close - close[10]) / sum(abs(close - close[1]), 10)</code>. A 10-bar lookback. If price walked 20 points over those 10 bars but ended up 18 away from where it started, efficiency is 0.90 — very direct. If price walked 30 points but ended up 5 away, efficiency is 0.17 — wandering chop. Same concept as MAZ/MAE but with a specific 10-bar focus tuned for oscillator responsiveness.</p>
          <EfficiencyDeepDiveAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 10 Bars</p>
            <p className="text-sm text-gray-400">The effLen default of 10 is a sweet spot: long enough to capture meaningful movement, short enough to be responsive. You can tune it — shorter (5-7) for faster markets, longer (15-20) for smoother signals. But 10 matches the intuitive &ldquo;recent price action&rdquo; frame that most traders naturally use mentally.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Activity === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Activity &amp; The sqrt</p>
          <h2 className="text-2xl font-extrabold mb-4">Diminishing Returns By Design</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Raw activity is volume / average volume — centered around 1.0 when normal, rising above during spikes. But raw activity has a problem: a 3× spike would directly triple MPG, letting volume dominate the score. The <strong className="text-amber-400">sqrt transform</strong> fixes this — a 3× volume spike becomes √3 ≈ 1.73× activity contribution. Moderately boosted, not dominant. This is what keeps MPG a <em>participation</em> indicator, not a volume indicator.</p>
          <ActivitySqrtAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Cap Matters Too</p>
            <p className="text-sm text-gray-400">Activity is ALSO capped at 3.0 before the sqrt. This prevents extreme volume events (stop hunts, news spikes, squeeze liquidations) from making MPG read 400+. With the cap + sqrt, the maximum possible activity contribution is sqrt(3) ≈ 1.73 — large but not destructive. The combination of cap-then-sqrt is the mathematical guardrail that makes MPG numerically stable across asset classes and time periods.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06: Volume Fallback Doctrine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Volume Fallback Doctrine &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">The Cross-Asset Engineering Nobody Sees</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the section where MPG quietly earns its place in the ATLAS suite. Every retail trader has watched a favorite volume-based indicator produce garbage on EUR/USD. The reason: most Pine scripts just do <code className="text-white">safeDiv(volume, volAvg)</code> without checking if volume even exists. On Forex, broker-reported volume is often NaN, zero, or entirely fictional — the indicator silently breaks. MPG uses a <strong className="text-white">three-layer cascade</strong> to guarantee meaningful output on every asset class.</p>
          <VolumeFallbackDoctrineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why This Is Rare</p>
            <p className="text-sm text-gray-400">Layer 1 (real volume): used when volume &gt; 0 AND volAvg &gt; 0. Layer 2 (range proxy): when volume is unavailable/invalid, uses <code className="text-white">(high - low) / ATR</code> capped at 2.5 — bars with wider-than-normal range count as more activity. Layer 3 (neutral): if even ATR is NaN (first bars, closed markets), falls to 1.0 so MPG degrades gracefully rather than producing NaN. This engineering is rare because most developers test on SPY or BTC, ship, and never check Forex. The doctrine matters because professional traders run these tools across asset classes — and a tool that silently fails on FX is effectively broken.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07: The 4 Tiers === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Four Tiers</p>
          <h2 className="text-2xl font-extrabold mb-4">THIN · BUILDING · STRONG · EXTREME</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MPG outputs an integer tier alongside its level. <strong className="text-gray-400">THIN (0-20)</strong>: low participation, price drifting. <strong className="text-amber-400">BUILDING (20-40)</strong>: participation emerging, transitional. <strong className="text-teal-400">STRONG (40-65)</strong>: solid engagement, tradeable. <strong className="text-teal-400">EXTREME (65+)</strong>: climactic, potential exhaustion. The boundaries are <strong className="text-white">fixed constants</strong> — not user-configurable — because they are part of the tool&apos;s semantic contract.</p>
          <FourTiersAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why EXTREME Is Not A Sell Signal</p>
            <p className="text-sm text-gray-400">The Pine source explicitly labels EXTREME as &ldquo;climactic (potential exhaustion).&rdquo; Note the word &ldquo;potential.&rdquo; EXTREME means participation is at a level historically associated with climax conditions — but climax can resolve two ways: the trend keeps running because participation remains strong, or it reverses because that level of engagement is unsustainable. MPG deliberately does not predict WHICH. It marks the condition; you watch the quality color and direction for the resolution.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08: Quality Trichotomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Quality Trichotomy</p>
          <h2 className="text-2xl font-extrabold mb-4">Clean · Absorbed · Neutral</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The quality state is a <strong className="text-white">three-valued diagnostic</strong> that sits alongside the level. <strong className="text-teal-400">CLEAN (+1)</strong>: efficiency &gt; 0.55 — direct price movement, strong engagement. <strong className="text-pink-400">ABSORBED (-1)</strong>: activity &gt; 1.5 AND efficiency &lt; 0.30 — volume present but price not moving, classic absorption. <strong className="text-gray-400">NEUTRAL (0)</strong>: everything else — moderate on both axes. Same level reading means different things depending on quality.</p>
          <QualityTrichotomyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Absorbed Condition Is Asymmetric</p>
            <p className="text-sm text-gray-400">Absorbed requires BOTH high activity AND low efficiency simultaneously. Either alone does not trigger it. This is the source&apos;s way of encoding &ldquo;effort trapped&rdquo; precisely — not just &ldquo;high volume&rdquo; (which could be a clean breakout), and not just &ldquo;low efficiency&rdquo; (which could be drift). The AND condition catches specifically the pattern where real effort is being absorbed by an opposing flow — the most valuable moment MPG can flag.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: Color Logic === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Color Logic</p>
          <h2 className="text-2xl font-extrabold mb-4">Tier Overrides Quality Below 40</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The bar color is determined by a <strong className="text-white">tier × quality cross-product</strong> with a specific override rule. Below STRONG, the tier fully determines color (THIN = always grey, BUILDING = always amber). At STRONG and EXTREME, quality takes over (Clean = teal, Absorbed = magenta, Neutral = grey). This encoding prevents visual confusion — a grey bar in STRONG tier means something very different from a grey bar in THIN tier.</p>
          <ColorLogicAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Override Prevents False Precision</p>
            <p className="text-sm text-gray-400">Why doesn&apos;t MPG show quality color at THIN tier? Because at low participation levels, quality is essentially noise — the efficiency and activity values are small and their ratios unstable. Showing &ldquo;clean thin&rdquo; or &ldquo;absorbed thin&rdquo; would fake precision that isn&apos;t there. Grey says &ldquo;not enough engagement to talk about quality.&rdquo; BUILDING stays amber because it is explicitly the transitional tier — quality resolves once you cross into STRONG.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10: Reading the Histogram === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Reading in Practice</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Representative Scenarios</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Theory meets chart. Four MPG histogram patterns you will see regularly — each with a specific meaning that professional traders read in under a second. Internalize these four and you have covered 90% of MPG interpretation.</p>
          <ReadingHistogramAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Fifth Pattern Worth Watching</p>
            <p className="text-sm text-gray-400">A fifth pattern not shown in the animation but worth memorizing: <em>EXTREME teal fading to STRONG amber while price keeps going</em>. This is quality deterioration during a late-stage move — the precursor pattern to exhaustion. You see the level drop and the color degrade, then price reverses. Watch for this specifically during prolonged trends that are getting long in the tooth.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11: Momentum & Direction === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Momentum &amp; Direction</p>
          <h2 className="text-2xl font-extrabold mb-4">Δ MPG Over One Bar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MPG also exports a direction signal: <code className="text-white">mpgDir = momentum &gt; 3 ? +1 : (momentum &lt; -3 ? -1 : 0)</code>. The momentum is literally <code className="text-white">mpg - mpg[1]</code>. A 3-point threshold prevents flicker. When direction is +1, participation is rising meaningfully; -1 means falling; 0 means stable. This is the <em>participation direction</em>, not the price direction. They are often but not always correlated.</p>
          <MomentumDirectionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Participation Divergence</p>
            <p className="text-sm text-gray-400">A price uptrend with mpgDir persistently negative (participation falling while price climbs) is a specific divergence worth respecting — more reliable than RSI divergence because it measures engagement directly rather than price&apos;s own velocity. When you see price making new highs and MPG level actively dropping bar by bar, the move is running out of fuel regardless of how extended it looks.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12: Confluence === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; ATLAS Confluence</p>
          <h2 className="text-2xl font-extrabold mb-4">MPG × MAE × MSI</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MPG is not meant to be used in isolation. The strongest readings come from stacking it with the regime and acceptance tools. <strong className="text-white">MAE</strong> tells you WHERE price belongs (corridor). <strong className="text-white">MSI</strong> tells you WHAT regime the market is in. <strong className="text-white">MPG</strong> tells you WHETHER anyone is actually engaged. When all three agree — MAE corridor stable, MSI in TREND or EXPANSION, MPG STRONG teal — you have a multi-layer confluence that no single indicator could provide.</p>
          <MPGConfluenceAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Confluence Matrix</p>
            <p className="text-sm text-gray-400">Think of it as a 3-dimensional state: MAE = location state, MSI = regime state, MPG = engagement state. Every tradeable moment sits at a specific coordinate in that 3D space. The strongest setups cluster at specific coordinates — typically MAE inside core glow + MSI in EXPANSION or TREND + MPG STRONG teal with rising direction. Weak setups fragment across the 3 dimensions. The ATLAS suite is designed so you can read all three dimensions simultaneously.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MPG</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each of these traces to the same root cause: treating MPG as another oscillator from a category it doesn&apos;t belong to. Break that assumption and the mistakes evaporate.</p>
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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">MPG In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Architecture</p>
                <p className="text-sm text-gray-300">Sub-pane oscillator, 0-100 scale, precision 2. NOT an overlay indicator. Participation oscillator (not momentum).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Formula</p>
                <p className="text-sm text-gray-300">mpg = clamp01(efficiency × sqrt(activityFinal)) × 100, then EMA-smoothed.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Volume Fallback (★)</p>
                <p className="text-sm text-gray-300">Real volume → (high-low)/ATR capped 2.5 → neutral 1.0. Works across equities, crypto, and Forex.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Four Tiers</p>
                <p className="text-sm text-gray-300">THIN (0-20, grey) · BUILDING (20-40, amber) · STRONG (40-65, quality colored) · EXTREME (65+, quality colored, potential climax).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Quality States</p>
                <p className="text-sm text-gray-300">CLEAN (+1, teal): eff &gt; 0.55. ABSORBED (-1, magenta): act &gt; 1.5 AND eff &lt; 0.30. NEUTRAL (0, grey): otherwise. Only applied at STRONG/EXTREME tiers.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Direction</p>
                <p className="text-sm text-gray-300">mpgDir = momentum &gt; 3 ? +1 : (momentum &lt; -3 ? -1 : 0). Signal = participation direction, not price direction.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Colors (Locked)</p>
                <p className="text-sm text-gray-300">Teal #00B3A4 clean · Magenta #C2185B absorbed · Amber #F9A825 building · Grey #8A8A8A thin/neutral.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Exports</p>
                <p className="text-sm text-gray-300">MPG Level · Efficiency % · Activity Ratio · Momentum · Quality (-1/0/+1) · Tier (0-3) — via data window and status line HUD.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading MPG Without Regressing To RSI Mode</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you can read MPG through the participation lens — or whether your momentum-oscillator muscle memory is still pattern-matching.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MPG as participation, not momentum. The RSI muscle memory is overridden.' : gameScore >= 3 ? 'Solid grasp. Re-read the tiers and quality sections before the quiz.' : 'Re-study the formula and quality trichotomy sections before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S16: Quiz + Cert === */}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">▲</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market Participation Gradient</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Participation Quality Analyst &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.6-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
