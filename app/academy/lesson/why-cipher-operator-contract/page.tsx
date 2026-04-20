// app/academy/lesson/why-cipher-operator-contract/page.tsx
// ATLAS Academy — Lesson 11.1: Why CIPHER — The Operator Contract [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
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
// ANIMATION 1: The Consumer vs Operator Split
// Left: consumer staring at an arrow, pressing BUY blindly
// Right: operator reading a full instrument panel, deciding deliberately
// ============================================================
function ConsumerVsOperatorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const mid = w / 2;

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mid, 30);
    ctx.lineTo(mid, h - 10);
    ctx.stroke();

    // Titles
    ctx.fillStyle = 'rgba(239,83,80,0.85)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE CONSUMER', mid / 2, 18);
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('THE OPERATOR', mid + mid / 2, 18);

    // === LEFT PANEL — Consumer ===
    // A lonely arrow, a big button, nothing else
    const leftCx = mid / 2;
    const leftCy = h / 2 + 10;

    // A giant "BUY" arrow pulsing
    const arrowPulse = 0.6 + 0.4 * Math.sin(t * 2);
    ctx.fillStyle = `rgba(38,166,154,${arrowPulse})`;
    ctx.beginPath();
    ctx.moveTo(leftCx, leftCy - 35);
    ctx.lineTo(leftCx - 25, leftCy + 5);
    ctx.lineTo(leftCx - 10, leftCy + 5);
    ctx.lineTo(leftCx - 10, leftCy + 35);
    ctx.lineTo(leftCx + 10, leftCy + 35);
    ctx.lineTo(leftCx + 10, leftCy + 5);
    ctx.lineTo(leftCx + 25, leftCy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('BUY?', leftCx, leftCy + 60);

    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText('...just the arrow.', leftCx, leftCy + 78);
    ctx.fillText('no context. no why.', leftCx, leftCy + 90);

    // === RIGHT PANEL — Operator ===
    // A small instrument panel with multiple readings
    const rightX = mid + 20;
    const rightW = mid - 30;
    const rightCy = h / 2;

    // Instrument rows
    const rows = [
      { label: 'REGIME', value: 'EXPANSION', color: 'rgba(38,166,154,0.9)' },
      { label: 'PULSE', value: '+0.72', color: 'rgba(38,166,154,0.85)' },
      { label: 'COIL', value: 'BREAKOUT', color: 'rgba(255,179,0,0.9)' },
      { label: 'BIAS', value: 'LONG', color: 'rgba(38,166,154,0.9)' },
      { label: 'WIN PROB', value: '68%', color: 'rgba(255,179,0,0.9)' },
    ];

    const rowH = 22;
    const startY = rightCy - (rows.length * rowH) / 2;

    rows.forEach((row, i) => {
      const y = startY + i * rowH;
      // reveal one row at a time, then keep all
      const revealed = (f * 0.015) > i;
      if (!revealed) return;

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(rightX + 10, y, rightW - 20, rowH - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, rightX + 18, y + 13);

      ctx.fillStyle = row.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(row.value, rightX + rightW - 18, y + 13);
    });

    // "Deliberate" label once all rows revealed
    if ((f * 0.015) > rows.length) {
      ctx.fillStyle = 'rgba(38,166,154,0.85)';
      ctx.font = 'italic bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('→ deliberate decision', rightX + rightW / 2, startY + rows.length * rowH + 18);
    }
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 2: The Flight Instrument Analogy
// A stylized cockpit altimeter + airspeed + attitude — the pilot reads all three
// ============================================================
function FlightInstrumentAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const cy = h / 2 + 5;

    // Three instruments side by side
    const instruments = [
      { cx: w * 0.22, label: 'ALTITUDE', value: Math.floor(12000 + 800 * Math.sin(t)), unit: 'ft', color: 'rgba(38,166,154,0.9)' },
      { cx: w * 0.5, label: 'AIRSPEED', value: Math.floor(340 + 25 * Math.sin(t * 1.3)), unit: 'kts', color: 'rgba(255,179,0,0.9)' },
      { cx: w * 0.78, label: 'ATTITUDE', value: (Math.sin(t * 0.8) * 8).toFixed(1), unit: '°', color: 'rgba(239,83,80,0.9)' },
    ];

    instruments.forEach((inst) => {
      const r = 48;
      // Ring
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(inst.cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Tick marks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = inst.cx + Math.cos(a) * (r - 6);
        const y1 = cy + Math.sin(a) * (r - 6);
        const x2 = inst.cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Needle
      const needleA = t * 1.5 + inst.cx * 0.01;
      ctx.strokeStyle = inst.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(inst.cx, cy);
      ctx.lineTo(inst.cx + Math.cos(needleA) * (r - 10), cy + Math.sin(needleA) * (r - 10));
      ctx.stroke();

      // Center dot
      ctx.fillStyle = inst.color;
      ctx.beginPath();
      ctx.arc(inst.cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(inst.label, inst.cx, cy + r + 18);

      // Value
      ctx.fillStyle = inst.color;
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(`${inst.value} ${inst.unit}`, inst.cx, cy + r + 32);
    });

    // Top caption
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE PILOT READS ALL THREE — BEFORE DECIDING ANYTHING', w / 2, 18);

    // Bottom caption
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText('"Does this instrument honestly report the state of the aircraft?"', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 3: The Earned Arrow — Cascade Trace
// A CIPHER-style arrow on a chart, then trace backward through the layers
// that produced it: regime → pulse → coil → context tag → arrow
// ============================================================
function EarnedArrowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    // Top title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('AN EARNED ARROW — TRACED BACKWARD', w / 2, 14);

    // Stage 1: draw a price chart (sine-like with uptrend)
    const chartTop = 30;
    const chartH = 90;
    const chartBottom = chartTop + chartH;

    // Baseline + candles
    const barCount = 40;
    const barW = (w - 40) / barCount;
    for (let i = 0; i < barCount; i++) {
      const x = 20 + i * barW;
      const progress = i / barCount;
      const trend = chartBottom - progress * 55;
      const wiggle = Math.sin(i * 0.4 + t) * 6;
      const open = trend + wiggle;
      const close = trend + wiggle - 2;
      const high = Math.min(open, close) - 3;
      const low = Math.max(open, close) + 3;

      const bullish = close < open;
      ctx.strokeStyle = bullish ? 'rgba(38,166,154,0.7)' : 'rgba(239,83,80,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + barW / 2, high);
      ctx.lineTo(x + barW / 2, low);
      ctx.stroke();

      ctx.fillStyle = bullish ? 'rgba(38,166,154,0.8)' : 'rgba(239,83,80,0.8)';
      ctx.fillRect(x + 1, Math.min(open, close), barW - 2, Math.abs(open - close));
    }

    // Arrow at bar ~28
    const arrowX = 20 + 28 * barW + barW / 2;
    const arrowY = chartBottom - 35;
    const arrowPulse = 0.7 + 0.3 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(38,166,154,${arrowPulse})`;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + 8);
    ctx.lineTo(arrowX - 6, arrowY + 16);
    ctx.lineTo(arrowX + 6, arrowY + 16);
    ctx.closePath();
    ctx.fill();

    // Stage 2: below chart, backward-trace layers
    const layerTop = chartBottom + 20;
    const layers = [
      { label: 'CONTEXT TAG', value: 'Trend-Continuation', delay: 0 },
      { label: 'COIL', value: 'Breakout Ready', delay: 60 },
      { label: 'PULSE', value: '+0.72', delay: 120 },
      { label: 'REGIME', value: 'EXPANSION', delay: 180 },
    ];

    layers.forEach((layer, i) => {
      const reveal = Math.max(0, Math.min(1, (f - layer.delay) / 40));
      if (reveal <= 0) return;

      const y = layerTop + i * 22;
      // Connecting line from arrow down through layers
      ctx.strokeStyle = `rgba(255,179,0,${0.3 * reveal})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY + 18);
      ctx.lineTo(arrowX, y + 8);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label pill
      const pillX = 40;
      const pillW = w - 80;
      ctx.fillStyle = `rgba(255,179,0,${0.12 * reveal})`;
      ctx.fillRect(pillX, y, pillW, 18);
      ctx.strokeStyle = `rgba(255,179,0,${0.4 * reveal})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(pillX, y, pillW, 18);

      ctx.fillStyle = `rgba(255,255,255,${0.6 * reveal})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(layer.label, pillX + 10, y + 12);

      ctx.fillStyle = `rgba(255,179,0,${0.95 * reveal})`;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(layer.value, pillX + pillW - 10, y + 12);
    });

    // Bottom caption appears after all layers revealed
    if (f > 220) {
      const captionReveal = Math.min(1, (f - 220) / 40);
      ctx.fillStyle = `rgba(38,166,154,${0.85 * captionReveal})`;
      ctx.font = 'italic bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Every arrow has a receipt. You can click backward and read it.', w / 2, h - 10);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 4: The Level 11 Learning Arc — Four Phases
// Visualizes the 22-28 lesson journey as an operator progression
// ============================================================
function LearningArcAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE OPERATOR CURRICULUM — FOUR ARCS', w / 2, 18);

    const arcs = [
      { label: 'PHILOSOPHY', sub: '& ANATOMY', icon: '◉', color: 'rgba(255,179,0,0.85)', count: '3 lessons' },
      { label: 'THE ENGINE', sub: 'UI + LOGIC + SETTINGS', icon: '⚙', color: 'rgba(38,166,154,0.85)', count: '8-10 lessons' },
      { label: 'TRADING', sub: 'CIPHER OPERATIONAL', icon: '▲', color: 'rgba(38,166,154,0.85)', count: '8-10 lessons' },
      { label: 'MASTERY', sub: 'INTEGRATION', icon: '★', color: 'rgba(255,179,0,0.9)', count: '4-5 lessons' },
    ];

    const boxW = (w - 80) / 4;
    const boxH = 120;
    const boxTop = 40;

    arcs.forEach((arc, i) => {
      const x = 20 + i * (boxW + 10);
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.5 + i * 0.8);

      // Box
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, boxTop, boxW, boxH);
      ctx.strokeStyle = arc.color.replace(/[\d.]+\)$/, `${0.3 * pulse})`);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, boxTop, boxW, boxH);

      // Icon
      ctx.fillStyle = arc.color;
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(arc.icon, x + boxW / 2, boxTop + 42);

      // Number badge
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(`ARC ${i + 1}`, x + boxW / 2, boxTop + 60);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(arc.label, x + boxW / 2, boxTop + 78);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px system-ui';
      ctx.fillText(arc.sub, x + boxW / 2, boxTop + 92);

      // Lesson count
      ctx.fillStyle = arc.color;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(arc.count, x + boxW / 2, boxTop + 108);

      // Arrow between arcs
      if (i < arcs.length - 1) {
        const arrowX = x + boxW + 3;
        const arrowY = boxTop + boxH / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY - 4);
        ctx.lineTo(arrowX + 4, arrowY);
        ctx.lineTo(arrowX, arrowY + 4);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Bottom caption
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Consumer → Reader → Operator → Master', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 5: Diagnostic Inversion → Operator Contract Bridge
// Shows the Level 10 doctrine (diagnose first, conclude second) evolving
// into the Level 11 doctrine (operator integrates multiple honest reports)
// ============================================================
function DiagnosticToOperatorBridgeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    // Title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL 10 → LEVEL 11 — THE EVOLUTION', w / 2, 16);

    // Left panel: LEVEL 10 — Diagnostic Inversion
    const leftX = 20;
    const leftW = (w - 60) / 2;
    const boxTop = 36;
    const boxH = h - 56;

    ctx.fillStyle = 'rgba(38,166,154,0.05)';
    ctx.fillRect(leftX, boxTop, leftW, boxH);
    ctx.strokeStyle = 'rgba(38,166,154,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(leftX, boxTop, leftW, boxH);

    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL 10 — DIAGNOSTIC INVERSION', leftX + leftW / 2, boxTop + 18);

    // Diagnostic chain
    const chainY = boxTop + 40;
    const chainSteps = [
      { label: 'REALITY', color: 'rgba(255,255,255,0.9)' },
      { label: 'DIAGNOSIS', color: 'rgba(38,166,154,0.9)' },
      { label: 'CONCLUSION', color: 'rgba(255,179,0,0.9)' },
    ];
    chainSteps.forEach((step, i) => {
      const y = chainY + i * 32;
      const cx = leftX + leftW / 2;
      const pulse = 0.6 + 0.4 * Math.sin(t * 1.5 + i * 0.6);
      ctx.fillStyle = step.color.replace(/[\d.]+\)$/, `${0.15 * pulse})`);
      ctx.fillRect(cx - 55, y, 110, 22);
      ctx.strokeStyle = step.color.replace(/[\d.]+\)$/, `${0.6 * pulse})`);
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 55, y, 110, 22);

      ctx.fillStyle = step.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(step.label, cx, y + 14);

      // Down arrow between
      if (i < chainSteps.length - 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(cx - 3, y + 26);
        ctx.lineTo(cx + 3, y + 26);
        ctx.lineTo(cx, y + 30);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Caption
    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.font = 'italic 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('single tool, single honest read', leftX + leftW / 2, boxTop + boxH - 8);

    // Arrow between panels
    const arrowCx = leftX + leftW + 10;
    const arrowCy = boxTop + boxH / 2;
    ctx.fillStyle = 'rgba(255,179,0,0.8)';
    ctx.beginPath();
    ctx.moveTo(arrowCx, arrowCy - 6);
    ctx.lineTo(arrowCx + 10, arrowCy);
    ctx.lineTo(arrowCx, arrowCy + 6);
    ctx.closePath();
    ctx.fill();

    // Right panel: LEVEL 11 — Operator Contract
    const rightX = leftX + leftW + 24;
    const rightW = leftW;

    ctx.fillStyle = 'rgba(255,179,0,0.05)';
    ctx.fillRect(rightX, boxTop, rightW, boxH);
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(rightX, boxTop, rightW, boxH);

    ctx.fillStyle = 'rgba(255,179,0,0.95)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL 11 — OPERATOR CONTRACT', rightX + rightW / 2, boxTop + 18);

    // Multi-instrument panel
    const instruments = [
      { label: 'REGIME', val: 'EXP' },
      { label: 'PULSE', val: '+.72' },
      { label: 'COIL', val: 'BREAK' },
      { label: 'CTX', val: 'TREND' },
      { label: 'WIN', val: '68%' },
    ];
    const instrY = boxTop + 40;
    const instrH = 22;
    instruments.forEach((inst, i) => {
      const y = instrY + i * (instrH + 3);
      const reveal = Math.min(1, Math.max(0, (t * 0.8 - i * 0.3)));
      if (reveal <= 0) return;

      ctx.fillStyle = `rgba(255,179,0,${0.12 * reveal})`;
      ctx.fillRect(rightX + 15, y, rightW - 30, instrH);
      ctx.strokeStyle = `rgba(255,179,0,${0.5 * reveal})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(rightX + 15, y, rightW - 30, instrH);

      ctx.fillStyle = `rgba(255,255,255,${0.7 * reveal})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(inst.label, rightX + 22, y + 14);

      ctx.fillStyle = `rgba(255,179,0,${0.95 * reveal})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(inst.val, rightX + rightW - 22, y + 14);
    });

    // Caption
    ctx.fillStyle = 'rgba(255,179,0,0.8)';
    ctx.font = 'italic 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('integrated read, operator decides', rightX + rightW / 2, boxTop + boxH - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 6: The Three Pillars — UI, Settings, Trading
// Every lesson in Level 11 covers these three dimensions
// ============================================================
function ThreePillarsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    // Title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EVERY LESSON — THREE DIMENSIONS COVERED', w / 2, 16);

    const pillars = [
      {
        label: 'UI',
        sub: 'WHAT YOU SEE',
        icon: '◉',
        color: 'rgba(38,166,154,0.9)',
        detail: ['Command Center rows', 'Arrows & lines', 'Panels & labels', 'Tooltips'],
      },
      {
        label: 'SETTINGS',
        sub: 'WHAT YOU TUNE',
        icon: '⚙',
        color: 'rgba(255,179,0,0.9)',
        detail: ['Every input', 'Every preset', 'Defaults', 'When to change'],
      },
      {
        label: 'TRADING',
        sub: 'HOW YOU OPERATE',
        icon: '▲',
        color: 'rgba(239,83,80,0.85)',
        detail: ['Entry mechanics', 'Stop placement', 'Take profit', 'Position sizing'],
      },
    ];

    const pillarW = (w - 60) / 3;
    const pillarH = h - 50;
    const pillarTop = 32;

    pillars.forEach((pillar, i) => {
      const x = 15 + i * (pillarW + 10);
      const pulse = 0.7 + 0.3 * Math.sin(t + i * 0.8);

      // Pillar frame
      ctx.fillStyle = pillar.color.replace(/[\d.]+\)$/, `${0.05 * pulse})`);
      ctx.fillRect(x, pillarTop, pillarW, pillarH);
      ctx.strokeStyle = pillar.color.replace(/[\d.]+\)$/, `${0.4 * pulse})`);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, pillarTop, pillarW, pillarH);

      // Icon
      ctx.fillStyle = pillar.color;
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(pillar.icon, x + pillarW / 2, pillarTop + 32);

      // Main label
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(pillar.label, x + pillarW / 2, pillarTop + 54);

      // Sub label
      ctx.fillStyle = pillar.color;
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(pillar.sub, x + pillarW / 2, pillarTop + 68);

      // Divider
      ctx.strokeStyle = pillar.color.replace(/[\d.]+\)$/, `${0.3})`);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 15, pillarTop + 78);
      ctx.lineTo(x + pillarW - 15, pillarTop + 78);
      ctx.stroke();

      // Detail bullets
      pillar.detail.forEach((d, j) => {
        const dy = pillarTop + 92 + j * 16;
        const reveal = Math.min(1, Math.max(0, t * 0.5 - i * 0.3 - j * 0.15));
        if (reveal <= 0) return;

        ctx.fillStyle = pillar.color.replace(/[\d.]+\)$/, `${0.8 * reveal})`);
        ctx.font = 'bold 7px system-ui';
        ctx.fillText('•', x + 20, dy);

        ctx.fillStyle = `rgba(255,255,255,${0.65 * reveal})`;
        ctx.font = '9px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(d, x + 28, dy);
      });
    });

    // Bottom tagline
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No element unexplained. No setting untouched. No decision unguided.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: What Consumers Get Wrong
// A consumer-mindset failure mode: seeing an arrow, ignoring the Command Center,
// entering, watching the Command Center flash red, losing the trade
// ============================================================
function ConsumerMistakeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    // 4-stage narrative loop, ~500 frames total
    const cycle = f % 500;
    const stage = cycle < 120 ? 0 : cycle < 240 ? 1 : cycle < 360 ? 2 : 3;
    const stageProgress = (cycle - stage * 120) / 120;

    // Title
    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE CONSUMER FAILURE LOOP', w / 2, 14);

    // Stage labels at top
    const stages = ['1. SEES ARROW', '2. IGNORES DASH', '3. ENTERS', '4. GETS STOPPED'];
    const stageW = w / 4;
    stages.forEach((s, i) => {
      const active = i === stage;
      ctx.fillStyle = active ? 'rgba(239,83,80,0.9)' : 'rgba(255,255,255,0.25)';
      ctx.font = active ? 'bold 9px system-ui' : '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s, stageW * i + stageW / 2, 30);

      // Dot
      ctx.fillStyle = active ? 'rgba(239,83,80,0.9)' : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(stageW * i + stageW / 2, 40, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Main scene
    const chartTop = 55;
    const chartH = h - 85;
    const chartW = w - 40;
    const chartX = 20;

    // Chart background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(chartX, chartTop, chartW, chartH);

    // Price line — goes up through stages 0-2, then drops in stage 3
    const priceStart = chartTop + chartH * 0.7;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chartX, priceStart);
    for (let i = 0; i <= 40; i++) {
      const x = chartX + (i / 40) * chartW;
      let y = priceStart;
      if (i < 15) y = priceStart - (i / 15) * 20;
      else if (i < 25) y = priceStart - 20 + Math.sin(i * 0.5) * 3;
      else if (i < 30) y = priceStart - 20 - (i - 25) * 2;
      else {
        // At stage 3, price dumps
        if (stage >= 3) {
          const dumpP = Math.min(1, stageProgress * 2);
          y = priceStart - 30 + dumpP * 50;
        } else {
          y = priceStart - 30 - (i - 30) * 0.5;
        }
      }
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Stage 0: Arrow appears at ~28
    if (stage >= 0) {
      const arrowX = chartX + (28 / 40) * chartW;
      const arrowY = priceStart - 25;
      const alpha = stage === 0 ? stageProgress : 1;
      ctx.fillStyle = `rgba(38,166,154,${0.9 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY + 8);
      ctx.lineTo(arrowX - 6, arrowY + 16);
      ctx.lineTo(arrowX + 6, arrowY + 16);
      ctx.closePath();
      ctx.fill();
    }

    // Command Center top-right — stage 1: flashes red warning, consumer ignores
    const dashX = chartX + chartW - 140;
    const dashY = chartTop + 10;
    const dashW = 130;
    const dashH = 70;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(dashX, dashY, dashW, dashH);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(dashX, dashY, dashW, dashH);

    // Command Center rows — stage 1 onward, one row flashes magenta warning
    const rows = [
      { label: 'REGIME', val: 'DIST', warn: true },
      { label: 'PULSE', val: '-.15', warn: true },
      { label: 'COIL', val: 'IDLE', warn: false },
    ];
    rows.forEach((r, i) => {
      const ry = dashY + 12 + i * 18;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, dashX + 10, ry + 10);

      const flash = r.warn && stage >= 1 ? 0.5 + 0.5 * Math.sin(f * 0.3) : 1;
      ctx.fillStyle = r.warn ? `rgba(239,83,80,${0.9 * flash})` : 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(r.val, dashX + dashW - 10, ry + 10);
    });

    // Stage 1 warning banner
    if (stage === 1) {
      ctx.fillStyle = `rgba(239,83,80,${0.6 + 0.4 * Math.sin(f * 0.4)})`;
      ctx.font = 'italic bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Command Center disagrees — consumer ignores', w / 2, chartTop + chartH + 14);
    }

    // Stage 2: entry line
    if (stage >= 2) {
      const entryX = chartX + (30 / 40) * chartW;
      ctx.strokeStyle = 'rgba(38,166,154,0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(entryX, chartTop);
      ctx.lineTo(entryX, chartTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.9)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('ENTRY', entryX + 3, chartTop + 18);
    }

    // Stage 3: stop-out, red flash
    if (stage === 3) {
      ctx.fillStyle = `rgba(239,83,80,${0.12 + 0.08 * Math.sin(f * 0.4)})`;
      ctx.fillRect(chartX, chartTop, chartW, chartH);

      ctx.fillStyle = `rgba(239,83,80,${0.9})`;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✗ STOPPED OUT', w / 2, chartTop + chartH + 14);
    }

    // Bottom lesson
    if (stage === 3 && stageProgress > 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'italic 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('the arrow was real — but the Command Center told the truth', w / 2, h - 6);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 8: The Operator Workflow — The Correct Path
// Same arrow event as ConsumerMistake, but the operator reads the Command Center,
// sees disagreement, stands down, and the chart plays out exactly as the
// Command Center warned. The operator wins by NOT trading.
// ============================================================
function OperatorWorkflowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const cycle = f % 520;
    const stage = cycle < 120 ? 0 : cycle < 240 ? 1 : cycle < 360 ? 2 : 3;
    const stageProgress = (cycle - stage * 120) / 120;

    // Title
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE OPERATOR WORKFLOW', w / 2, 14);

    // Stage labels
    const stages = ['1. SEES ARROW', '2. READS DASH', '3. STANDS DOWN', '4. WATCHES'];
    const stageW = w / 4;
    stages.forEach((s, i) => {
      const active = i === stage;
      ctx.fillStyle = active ? 'rgba(38,166,154,0.9)' : 'rgba(255,255,255,0.25)';
      ctx.font = active ? 'bold 9px system-ui' : '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s, stageW * i + stageW / 2, 30);

      ctx.fillStyle = active ? 'rgba(38,166,154,0.9)' : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(stageW * i + stageW / 2, 40, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Chart area
    const chartTop = 55;
    const chartH = h - 85;
    const chartW = w - 40;
    const chartX = 20;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(chartX, chartTop, chartW, chartH);

    // Price line — same trap shape
    const priceStart = chartTop + chartH * 0.7;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chartX, priceStart);
    for (let i = 0; i <= 40; i++) {
      const x = chartX + (i / 40) * chartW;
      let y = priceStart;
      if (i < 15) y = priceStart - (i / 15) * 20;
      else if (i < 25) y = priceStart - 20 + Math.sin(i * 0.5) * 3;
      else if (i < 30) y = priceStart - 20 - (i - 30) * 0.5;
      else {
        // Price drops at end regardless (same market event)
        if (stage >= 3) {
          const dumpP = Math.min(1, stageProgress * 2);
          y = priceStart - 22 + dumpP * 50;
        } else {
          y = priceStart - 22;
        }
      }
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Arrow — same event
    if (stage >= 0) {
      const arrowX = chartX + (28 / 40) * chartW;
      const arrowY = priceStart - 25;
      const alpha = stage === 0 ? stageProgress : 1;
      ctx.fillStyle = `rgba(38,166,154,${0.9 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY + 8);
      ctx.lineTo(arrowX - 6, arrowY + 16);
      ctx.lineTo(arrowX + 6, arrowY + 16);
      ctx.closePath();
      ctx.fill();
    }

    // Command Center — stage 1+: operator READS it deliberately
    const dashX = chartX + chartW - 140;
    const dashY = chartTop + 10;
    const dashW = 130;
    const dashH = 70;

    // Command Center glows teal in stage 1 to indicate being read
    if (stage === 1) {
      const glow = 0.3 + 0.3 * Math.sin(f * 0.2);
      ctx.strokeStyle = `rgba(38,166,154,${glow})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(dashX - 2, dashY - 2, dashW + 4, dashH + 4);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(dashX, dashY, dashW, dashH);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(dashX, dashY, dashW, dashH);

    const rows = [
      { label: 'REGIME', val: 'DIST', warn: true },
      { label: 'PULSE', val: '-.15', warn: true },
      { label: 'COIL', val: 'IDLE', warn: false },
    ];
    rows.forEach((r, i) => {
      const ry = dashY + 12 + i * 18;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, dashX + 10, ry + 10);

      // In stage 1, one row at a time gets spotlighted (operator scanning)
      const scanIdx = Math.floor((stageProgress * 3));
      const scanning = stage === 1 && i === scanIdx;
      const alpha = scanning ? 1 : 0.75;

      ctx.fillStyle = r.warn ? `rgba(239,83,80,${0.9 * alpha})` : `rgba(255,255,255,${0.6 * alpha})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(r.val, dashX + dashW - 10, ry + 10);

      if (scanning) {
        ctx.strokeStyle = 'rgba(38,166,154,0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dashX + 4, ry - 2, dashW - 8, 16);
      }
    });

    // Stage 2: NO ENTRY badge appears
    if (stage === 2) {
      const pulse = 0.6 + 0.4 * Math.sin(f * 0.3);
      const badgeX = chartX + (30 / 40) * chartW - 30;
      const badgeY = chartTop + chartH / 2 - 12;
      ctx.fillStyle = `rgba(255,179,0,${0.2 * pulse})`;
      ctx.fillRect(badgeX, badgeY, 60, 24);
      ctx.strokeStyle = `rgba(255,179,0,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(badgeX, badgeY, 60, 24);
      ctx.fillStyle = `rgba(255,179,0,${pulse})`;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('STAND DOWN', badgeX + 30, badgeY + 15);
    }

    // Stage 3: price dumps, operator unharmed — show "AVOIDED" banner
    if (stage === 3) {
      ctx.fillStyle = 'rgba(38,166,154,0.95)';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓ AVOIDED', w / 2, chartTop + chartH + 14);

      if (stageProgress > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'italic 8px system-ui';
        ctx.fillText('the best trade was the one NOT taken', w / 2, h - 6);
      }
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 9: First 10 Minutes with CIPHER
// A timeline showing the correct operator workflow when they first open
// a chart with CIPHER: look at regime → check coil → check pulse → check
// context → decide whether to watch or walk away
// ============================================================
function FirstTenMinutesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    // Title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('YOUR FIRST 10 MINUTES WITH CIPHER', w / 2, 16);

    // Timeline across middle
    const timelineY = h / 2;
    const startX = 40;
    const endX = w - 40;

    // Timeline spine
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, timelineY);
    ctx.lineTo(endX, timelineY);
    ctx.stroke();

    // 6 checkpoints across the timeline
    const checkpoints = [
      { t: '0:00', label: 'OPEN CHART', detail: 'CIPHER loads', color: 'rgba(255,255,255,0.7)' },
      { t: '0:30', label: 'REGIME', detail: 'What state?', color: 'rgba(38,166,154,0.9)' },
      { t: '2:00', label: 'COIL', detail: 'Any setup?', color: 'rgba(255,179,0,0.9)' },
      { t: '4:00', label: 'PULSE', detail: 'Momentum?', color: 'rgba(38,166,154,0.9)' },
      { t: '6:00', label: 'CONTEXT', detail: 'What tag?', color: 'rgba(255,179,0,0.9)' },
      { t: '10:00', label: 'DECIDE', detail: 'Trade or watch', color: 'rgba(239,83,80,0.9)' },
    ];

    const activeIdx = Math.floor((t * 0.6) % checkpoints.length);

    checkpoints.forEach((cp, i) => {
      const x = startX + (i / (checkpoints.length - 1)) * (endX - startX);
      const active = i === activeIdx;
      const pulse = active ? 0.7 + 0.3 * Math.sin(f * 0.2) : 0.4;

      // Timestamp above
      ctx.fillStyle = active ? cp.color : 'rgba(255,255,255,0.3)';
      ctx.font = active ? 'bold 9px system-ui' : '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(cp.t, x, timelineY - 38);

      // Checkpoint dot
      ctx.fillStyle = cp.color.replace(/[\d.]+\)$/, `${pulse})`);
      ctx.beginPath();
      ctx.arc(x, timelineY, active ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (active) {
        ctx.strokeStyle = cp.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, timelineY, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label below
      ctx.fillStyle = active ? cp.color : 'rgba(255,255,255,0.4)';
      ctx.font = active ? 'bold 9px system-ui' : '8px system-ui';
      ctx.fillText(cp.label, x, timelineY + 22);

      // Detail
      ctx.fillStyle = active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)';
      ctx.font = active ? 'italic 8px system-ui' : 'italic 7px system-ui';
      ctx.fillText(cp.detail, x, timelineY + 34);
    });

    // Bottom caption
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('A CIPHER operator never skips a checkpoint.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 10: How to Study Level 11
// A 3-phase study pattern: watch (lesson) → read (settings) → drill (paper trade)
// Shows the cycle repeating across each lesson
// ============================================================
function StudyApproachAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    // Title
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE STUDY LOOP — EVERY CIPHER LESSON', w / 2, 18);

    const cx = w / 2;
    const cy = h / 2 + 10;
    const radius = Math.min(70, h / 3);

    // 3 phase positions around a circle
    const phases = [
      { angle: -Math.PI / 2, label: 'WATCH', sub: 'the lesson', icon: '◉', color: 'rgba(38,166,154,0.9)' },
      { angle: Math.PI / 6, label: 'READ', sub: 'the settings', icon: '⚙', color: 'rgba(255,179,0,0.9)' },
      { angle: (5 * Math.PI) / 6, label: 'DRILL', sub: 'on live chart', icon: '▲', color: 'rgba(239,83,80,0.85)' },
    ];

    // Active phase cycles
    const activeIdx = Math.floor(t * 0.5) % 3;

    // Draw circular arrows connecting phases
    for (let i = 0; i < 3; i++) {
      const a1 = phases[i].angle;
      const a2 = phases[(i + 1) % 3].angle;
      let aSpan = a2 - a1;
      if (aSpan < 0) aSpan += Math.PI * 2;

      const active = i === activeIdx;
      const alpha = active ? 0.8 : 0.15;

      ctx.strokeStyle = `rgba(255,179,0,${alpha})`;
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, a1, a1 + aSpan);
      ctx.stroke();
    }

    // Draw phase nodes
    phases.forEach((phase, i) => {
      const x = cx + Math.cos(phase.angle) * radius;
      const y = cy + Math.sin(phase.angle) * radius;
      const active = i === activeIdx;
      const pulse = active ? 0.8 + 0.2 * Math.sin(f * 0.3) : 0.4;

      // Outer ring
      ctx.strokeStyle = phase.color.replace(/[\d.]+\)$/, `${pulse})`);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle = phase.color.replace(/[\d.]+\)$/, `${0.12 * pulse})`);
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Icon
      ctx.fillStyle = phase.color;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(phase.icon, x, y + 6);

      // Label
      ctx.fillStyle = phase.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      const labelY = y + (phase.angle < 0 ? -35 : 42);
      ctx.fillText(phase.label, x, labelY);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'italic 8px system-ui';
      ctx.fillText(phase.sub, x, labelY + 12);
    });

    // Center text
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LOOP', cx, cy - 4);
    ctx.font = 'italic 7px system-ui';
    ctx.fillText('until reflex', cx, cy + 8);

    // Bottom caption
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 9px system-ui';
    ctx.fillText('Reading about CIPHER builds knowledge. Drilling builds the operator.', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// GAME ROUNDS — 5 scenarios testing Consumer vs Operator thinking
// ============================================================
const gameRounds = [
  {
    scenario: 'A CIPHER buy arrow fires. You glance at the Command Center: REGIME = Distribution, PULSE = -0.20, COIL = Idle. The arrow is bright teal and the signal was just published to your phone. What do you do?',
    options: [
      {
        label: 'Consumer',
        text: 'Trust the arrow. CIPHER published a buy signal; the Command Center is just extra noise that will clear up.',
        correct: false,
        explain: 'The consumer trusts the arrow because it is loud and singular. An operator knows the arrow is ONE honest report among many, and when the other reports disagree, the arrow has not earned a trade. Stand down.',
      },
      {
        label: 'Operator',
        text: 'Stand down. The arrow disagrees with the diagnostic cascade. A signal without confluence is not a trade.',
        correct: true,
        explain: 'Exactly right. The arrow is one instrument reading. Regime, Pulse, and Coil are the others. When they disagree, the operator trusts the integrated read, not the loudest single element. No trade.',
      },
    ],
  },
  {
    scenario: 'You open a chart with CIPHER for the first time in a trading session. There is no arrow on screen. The Command Center shows REGIME = Expansion, PULSE = +0.55, COIL = Building. How should you spend the next 2 minutes?',
    options: [
      {
        label: 'Consumer',
        text: 'Wait. Nothing is happening. Check back when CIPHER fires a signal.',
        correct: false,
        explain: 'The consumer waits for permission. The operator reads the environment BEFORE any signal fires. Expansion + positive pulse + building coil tells the operator "a setup is forming" — that is actionable environmental intelligence even without an arrow.',
      },
      {
        label: 'Operator',
        text: 'Read the setup forming. Expansion with rising pulse and a building coil means prepare, not pause.',
        correct: true,
        explain: 'Correct. The Command Center is telling the operator "a setup is developing." The operator uses this time to plan entry levels, identify confluence zones, and mentally rehearse. By the time the arrow fires, the operator is ready to execute because the preparation was done.',
      },
    ],
  },
  {
    scenario: 'CIPHER just fired a sell arrow. You review: REGIME = Trend (bearish), PULSE = -0.82, COIL = Breakout Ready, CONTEXT TAG = Trend-Continuation, WIN PROB = 74%. All five layers agree. What is the operator framework for this trade?',
    options: [
      {
        label: 'Consumer',
        text: 'All five green? Max size, all-in. This is the perfect trade.',
        correct: false,
        explain: 'Even a 5-of-5 read does not justify max size. An operator sizes consistently across setups because edge is statistical — any single trade can still lose. Oversized 5-star setups destroy accounts exactly as fast as any other failure mode.',
      },
      {
        label: 'Operator',
        text: 'Execute at planned size. 5-of-5 agreement raises confidence, not position size. Edge is realized across many trades, not one.',
        correct: true,
        explain: 'Right. The operator treats sizing as a separate discipline from signal quality. Strong confluence earns CONFIDENCE to take the trade; it does not earn oversized risk. Consistency of sizing is what lets edge compound over many trades.',
      },
    ],
  },
  {
    scenario: 'You took a CIPHER trade yesterday. It lost. You review the cascade in hindsight: the arrow fired but REGIME had just flipped to Distribution 2 bars earlier, which you missed. What is the operator response?',
    options: [
      {
        label: 'Consumer',
        text: 'CIPHER gave a bad signal. Tighten the filters or switch indicators.',
        correct: false,
        explain: 'The consumer blames the tool when the operator failed. CIPHER showed the regime shift honestly; the operator missed reading it. Blaming the instrument removes learning. The operator asks "what did I fail to read?" not "what should the tool have done?"',
      },
      {
        label: 'Operator',
        text: 'The tool reported honestly. I failed to integrate all the readings. The lesson is in my reading discipline, not the tool.',
        correct: true,
        explain: 'Exactly. The Operator Contract is that CIPHER reports state honestly; the operator integrates those reports into decisions. When the trade fails, the question is always "did I read every instrument, or did I skip some?" The answer builds operator reflexes that compound over sessions.',
      },
    ],
  },
  {
    scenario: 'A friend asks you "what is CIPHER?" You have 10 seconds to answer. Which answer reflects the Operator Contract correctly?',
    options: [
      {
        label: 'Consumer',
        text: 'It is a premium indicator that tells you when to buy and sell with high accuracy.',
        correct: false,
        explain: 'The consumer description makes CIPHER sound like a signal service. It is not. Signal services absolve the user of responsibility. CIPHER is an instrument — accurate when read correctly, useless when read carelessly. The operator carries the decision, not the tool.',
      },
      {
        label: 'Operator',
        text: 'It is an instrument that reports the market honestly across 50+ layers. My job is to read those reports and decide.',
        correct: true,
        explain: 'This is the operator framing. CIPHER is a reporting instrument, not an oracle. Accuracy depends on operator literacy. The more honestly you describe it, the fewer consumer expectations you set up. Friends who take your trading seriously will respect this answer far more than a "win rate" claim.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 questions testing the Operator Contract concept
// ============================================================
const quizQuestions = [
  {
    q: 'The Operator Contract states that CIPHER is:',
    opts: [
      'A predictive signal service that tells you when to trade',
      'An instrument that reports market state honestly; the operator integrates those reports into decisions',
      'A filter layer you add to your existing trading strategy',
      'A replacement for your own analytical judgment',
    ],
    correct: 1,
    explain: 'CIPHER is an operator-grade instrument. It reports state across 50+ outputs. The arrow is one of those reports, not the output. The operator integrates multiple reports to decide; the tool never decides for the operator.',
  },
  {
    q: 'A pilot does not ask a flight instrument "does it tell me where to go?" — they ask:',
    opts: [
      '"Is it the best instrument on the market?"',
      '"How accurate is its win rate?"',
      '"Does it honestly report the state of the aircraft so I can decide what to do?"',
      '"What do other pilots say about it?"',
    ],
    correct: 2,
    explain: 'The flight-instrument analogy anchors the Operator Contract. Instruments report state; pilots decide. No instrument makes the decision to climb, descend, or turn — that responsibility is always the pilot\u2019s. CIPHER occupies the same role.',
  },
  {
    q: 'Level 10\u2019s Diagnostic Inversion was "diagnose first, then conclude." How does the Operator Contract extend this for Level 11?',
    opts: [
      'It replaces diagnosis with signal generation',
      'It discards the cascade and trusts the arrow',
      'It adds signals as one more honest instrument reading among many; the operator integrates all of them',
      'It makes the user a passive recipient of CIPHER\u2019s decisions',
    ],
    correct: 2,
    explain: 'Level 11 does not abandon the diagnostic discipline of Level 10 — it extends it. PRO signals (CIPHER arrows) are earned conclusions that add to the diagnostic readings, not replace them. The operator reads all of them; the arrow is not privileged above the cascade.',
  },
  {
    q: 'What does "an earned arrow has a receipt" mean?',
    opts: [
      'Every CIPHER arrow comes with a monetary cost you can trace',
      'Every CIPHER arrow emerges from a diagnostic cascade (regime, pulse, coil, context tag) that the operator can trace backward and inspect',
      'You must screenshot every arrow for tax purposes',
      'CIPHER saves a log file of every signal fired',
    ],
    correct: 1,
    explain: 'A CIPHER arrow is the downstream conclusion of multiple diagnostic layers. The operator can click backward through the layers and see exactly which conditions combined to produce the signal. That traceability is the "receipt" — the proof the arrow was earned, not guessed.',
  },
  {
    q: 'Every Level 11 lesson covers three dimensions. Which three?',
    opts: [
      'Theory, practice, and advanced topics',
      'UI (what you see), Settings (what you tune), Trading (how you operate)',
      'Pine Script, TradingView, and the Interakktive website',
      'Beginner, intermediate, and expert content',
    ],
    correct: 1,
    explain: 'Every Level 11 lesson is structured to leave no stone unturned: every visible UI element gets explained, every setting in the inputs panel gets explained, and every feature gets operational trading guidance. No element unexplained, no setting untouched, no decision unguided.',
  },
  {
    q: 'The Consumer Failure Loop visualized in this lesson shows a trader who:',
    opts: [
      'Reads the Command Center too carefully and hesitates',
      'Sees the arrow, ignores the Command Center warnings, enters, and gets stopped out',
      'Switches between indicators too often',
      'Trades too small and misses opportunities',
    ],
    correct: 1,
    explain: 'The Consumer Failure Loop is the emotional failure mode of signal-chasing. The arrow is loud and singular; the Command Center is quieter and requires reading. Consumers trust the loud thing and ignore the quiet thing. The operator does the opposite: the arrow is noted, the cascade is read, and disagreement kills the trade.',
  },
  {
    q: 'A CIPHER setup fires with all 5 cascade layers in agreement (regime, pulse, coil, context, win probability). What is the correct operator sizing response?',
    opts: [
      'Double position size to capitalize on the high-confidence setup',
      'Go all-in because 5-of-5 setups do not come often',
      'Take the trade at the same planned size; strong confluence raises confidence, not position size',
      'Skip the trade because such strong setups are usually traps',
    ],
    correct: 2,
    explain: 'Sizing is a separate discipline from signal quality. Any single trade can still lose, regardless of confluence. The operator treats consistency of sizing as the mechanism that lets statistical edge compound across many trades. Oversizing 5-star setups is one of the fastest ways to destroy an account.',
  },
  {
    q: 'A friend asks what CIPHER is. Which answer reflects the Operator Contract?',
    opts: [
      '"A premium indicator with high accuracy that tells you when to buy and sell."',
      '"A tool that makes trading decisions easier by filtering out noise."',
      '"An instrument that reports the market honestly across 50+ layers; my job is to read those reports and decide."',
      '"A signal service that sends buy and sell alerts to your phone."',
    ],
    correct: 2,
    explain: 'The operator framing respects the student as the decision-maker. Signal-service framings (1 and 4) remove responsibility from the operator and put it on the tool — which is precisely the consumer mindset Level 11 is training against. The more honestly you describe CIPHER, the fewer consumer expectations you set up.',
  },
];

// ============================================================
// CONFETTI COMPONENT — for certificate unlock celebration
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const colors = ['#FFB300', '#26A69A', '#EF5350', '#F5A623', '#4CD9CA'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h / 2 + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 15 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
    }));
    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 180) requestAnimationFrame(loop);
    };
    loop();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100vw', height: '100vh' }} />;
}

// ============================================================
// MAIN LESSON COMPONENT
// ============================================================
export default function WhyCipherOperatorContract() {
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

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 1</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Why CIPHER &mdash;<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Operator Contract</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">An instrument reports. An operator decides. Level 10 taught you to read the market honestly &mdash; Level 11 teaches you to operate the first instrument built on that literacy.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 — WHY THIS MATTERS === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The PRO Tier Arrives &mdash; and So Does a Shift.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You finished Level 10. You can read a full diagnostic cascade &mdash; regime, pressure, efficiency, acceptance, participation, volatility, Wyckoff divergence. You know the free arsenal by heart. You understand that <strong className="text-white">diagnostic honesty beats false prediction every time</strong>.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Level 10 taught you to be a <strong className="text-white">reader</strong>. Level 11 asks you to become an <strong className="text-amber-400">operator</strong>. A reader understands what the market is doing. An operator integrates multiple honest reports into decisions &mdash; and lives with the consequences of those decisions. CIPHER is the instrument the operator wields.</p>
            <p className="text-gray-400 leading-relaxed">Every other PRO lesson in this level assumes you have accepted this shift. If you read CIPHER as a signal service that tells you when to buy and sell, you will fail with it exactly as consumers have failed with every indicator that came before. If you read CIPHER as an instrument whose honest reports you integrate, you become something retail trading has almost no examples of: an operator who uses a tool deliberately.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE OPERATOR AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">An instrument reports. An operator decides. CIPHER is the instrument. You are the operator. The contract between you is non-negotiable: the tool is honest about what it sees; you are responsible for what you do with that honesty.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — THE OPERATOR CONTRACT (GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Operator Contract</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Operator Contract is the agreement between you and CIPHER about who does what. <strong className="text-amber-400">CIPHER&apos;s side:</strong> report the state of the market honestly, across as many layers as possible, with every reading traceable to its inputs and calculations. No hidden logic. <strong className="text-amber-400">Your side:</strong> read those reports, integrate them into decisions, and own the outcome. The arrow CIPHER fires is one report among many &mdash; the regime cell is another, the pulse number another, the coil state another. Your job is to read all of them. Most indicators market themselves as predictors: &ldquo;follow this arrow and win.&rdquo; That sales pitch implies the <strong className="text-white">tool</strong> is responsible for the outcome. The Operator Contract inverts that relationship. The tool is responsible for honesty. The operator is responsible for decisions. When a trade fails, the question is always &ldquo;did I read every instrument, or did I skip some?&rdquo; &mdash; not &ldquo;did the tool let me down?&rdquo;</p>
          <ConsumerVsOperatorAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE CONTRACT IN ONE LINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">An instrument reports. An operator decides. CIPHER reports honestly across 50+ layers. The operator integrates those reports into decisions. The arrow is one honest report among many &mdash; never the output, never the answer, never the command.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — THE FLIGHT INSTRUMENT ANALOGY === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Analogy That Anchors It</p>
          <h2 className="text-2xl font-extrabold mb-4">The Flight Instrument</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Pilots do not ask an altimeter &ldquo;should I climb?&rdquo; They ask &ldquo;what is my altitude?&rdquo; Then they read airspeed. Then attitude. Then fuel. Then they decide whether to climb. Every instrument in the cockpit reports one honest thing. None of them decides. The pilot integrates all of them and decides &mdash; <strong className="text-white">that integration is the pilot&apos;s job description</strong>. This analogy is not decorative. It is the exact model you will use for CIPHER. The regime cell reports one thing. The coil reports another. The pulse reports a third. The arrow reports a fourth. You read all of them. You decide.</p>
          <FlightInstrumentAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Pilots Survive and Retail Traders Don&apos;t</p>
            <p className="text-sm text-gray-400 leading-relaxed">Aviation built instrument-integration discipline over a century of catastrophic failures. Every crash became a checklist. Pilots fly on integration &mdash; the ones who ignore instruments die. Retail trading has no comparable discipline. Most traders fly on one instrument (usually an oscillator or MA) and blame the tool when it fails. The operator mindset &mdash; integrate multiple honest reports before deciding &mdash; is almost absent from retail education. This lesson installs it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — WHAT EARNED MEANS === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; What &ldquo;Earned&rdquo; Means</p>
          <h2 className="text-2xl font-extrabold mb-4">The Arrow Has a Receipt</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Level 10&apos;s rewrite was explicit: ATLAS refuses <em>unbacked</em> arrows, not all arrows. CIPHER&apos;s arrows are <strong className="text-white">earned</strong>. Here is what that means concretely. When CIPHER fires a buy arrow, the arrow did not appear by magic. Behind it, a cascade of conditions was true: the regime classifier was in an acceptable state, the pulse reading crossed a threshold, the coil was in the right phase, the context tag aligned with the direction, and the composite filters passed. Each of those conditions is visible on the Command Center. You can click backward through every one and see exactly what combined to produce the signal. That traceability is what we mean by &ldquo;earned.&rdquo; <strong className="text-amber-400">The arrow has a receipt.</strong> If you are skeptical of any single arrow, you can inspect the receipt &mdash; the underlying readings &mdash; and decide whether the combination truly justifies the trade given your own judgement about the market.</p>
          <EarnedArrowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Contrast With &ldquo;Borrowed&rdquo; Arrows</p>
            <p className="text-sm text-gray-400 leading-relaxed">Retail indicators that overlay arrows without a visible cascade are selling you borrowed arrows. The arrow appears; the reasoning is hidden; when the trade fails, no diagnosis is possible. CIPHER&apos;s arrows are earned because every one comes with an inspectable cascade. You never take a trade on faith &mdash; you take it on evidence.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — WHY CIPHER WAS BUILT FIRST === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Flagship Position</p>
          <h2 className="text-2xl font-extrabold mb-4">Why CIPHER Is First</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER is the flagship of the ATLAS PRO tier. It was the first PRO-tier indicator built and remains the most comprehensive. Before any other PRO indicator existed, CIPHER did &mdash; and it set the template for every PRO tool that followed. Three reasons CIPHER occupies this position. <strong className="text-white">Breadth:</strong> CIPHER reports across 50+ outputs covering regime, momentum, volatility, context, divergences, and signal synthesis. No other retail indicator reports this breadth in a single instrument. <strong className="text-white">Depth:</strong> CIPHER adapts its thresholds per asset class, per timeframe, and per preset &mdash; the same arrow fires under different conditions on BTC 1H vs EURUSD Daily because the underlying markets are different. <strong className="text-white">Maturity:</strong> CIPHER has been refined across multiple major versions and hundreds of live trader feedback cycles. Every feature that shipped earned its place through observed utility, not theoretical appeal.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why Level 11 Starts With the Deepest Instrument</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you understand CIPHER as an operator, the remaining PRO-tier indicators in later levels become variations on a discipline you already have &mdash; not new disciplines to learn from scratch. Master the hardest one first; the rest follow.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — BRIDGE FROM DIAGNOSTIC INVERSION === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Bridge From Level 10</p>
          <h2 className="text-2xl font-extrabold mb-4">Diagnostic Inversion Evolves</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Level 10 taught the Diagnostic Inversion: <strong className="text-white">diagnose reality honestly first, derive conclusions second.</strong> The free tier stopped at the diagnosis &mdash; which was exactly right for free tools, because signals without earned backing are worse than no signals. Level 11 extends the inversion. The Operator Contract does not replace diagnostic honesty; it adds a new layer on top. Signals become ONE MORE honest reading in the cascade, on equal footing with the diagnostic readings below them. The operator reads all of them &mdash; regime AND pulse AND coil AND the arrow &mdash; and integrates them into decisions. This is why CIPHER fits cleanly on top of Level 10. It does not contradict the diagnostic discipline; it extends it. The moment you treat a CIPHER arrow as privileged above the cascade &mdash; as an oracle that overrides the other readings &mdash; <strong className="text-amber-400">you have broken the Operator Contract and returned to consumer behaviour</strong>.</p>
          <DiagnosticToOperatorBridgeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Key Insight</p>
            <p className="text-sm text-gray-400 leading-relaxed">The arrow is never privileged. It is ONE instrument among many. The moment you start trusting arrows more than the rest of the Command Center, you have silently re-installed consumer thinking &mdash; regardless of which indicator you are using or what tier you paid for.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — THE FOUR ARCS OF LEVEL 11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Curriculum Shape</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Arcs, One Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Level 11 is structured as four arcs, each answering a different question about CIPHER. You will move through them in order, and each arc builds on the one before. <strong className="text-white">Arc 1 &mdash; Philosophy &amp; Anatomy:</strong> why CIPHER exists and what you will see when you turn it on. Command Center anatomy, inputs panel anatomy, the glance-read discipline. This lesson is the opener. <strong className="text-white">Arc 2 &mdash; The Engine:</strong> how CIPHER actually works internally. The regime engine, the signal pipeline, the coil box, the per-asset intelligence layer. Every layer explained with its UI, its settings, and when to tune it. <strong className="text-white">Arc 3 &mdash; Trading CIPHER:</strong> how to actually operate with CIPHER in live markets. Entries, stops, take profits, sizing, named playbook setups, news handling, timeframe and asset-class specifics. <strong className="text-white">Arc 4 &mdash; Integration &amp; Mastery:</strong> CIPHER combined with the Level 10 free cascade, alert architecture, common failure modes, and the CIPHER mastery capstone.</p>
          <LearningArcAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Graduation Is a Skill, Not a Badge</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the time you complete Arc 4, you can read CIPHER&apos;s 50+ outputs in under thirty seconds, explain what every setting does, and operate at least two named playbook setups. That&apos;s the graduation standard. The certificate just documents what you&apos;ve already become.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — THE THREE PILLARS === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Three Dimensions</p>
          <h2 className="text-2xl font-extrabold mb-4">No Stone Unturned</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every lesson in Level 11 &mdash; from the next one you will take, to the capstone at the end &mdash; covers three dimensions: <strong className="text-white">UI</strong> (what you see on the chart), <strong className="text-white">Settings</strong> (what you can tune in the inputs), and <strong className="text-white">Trading</strong> (what you do with it in a live market). This is the contract the curriculum makes with you. Most indicator courses pick one dimension and neglect the others. Video tutorials cover &ldquo;what you see&rdquo; but never explain the settings. Forum threads debate settings but never cover trading mechanics. Paid courses teach trading setups but skip the indicator&apos;s actual features. You end up assembling knowledge piece by piece, never fully literate. Level 11 refuses that pattern. Every feature gets explained across all three dimensions. Every visible element gets named. Every setting gets documented with its default, its range, and when to change it. Every feature gets operational trading guidance. <strong className="text-amber-400">If you can see it on the chart, we teach it. If you can tune it in the settings, we teach it. If it affects your trading, we teach it.</strong></p>
          <ThreePillarsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What This Means Practically</p>
            <p className="text-sm text-gray-400 leading-relaxed">If CIPHER has a Coil Box visible on the chart, there is a lesson explaining every phase of how it looks, every input that controls it, and every way to trade around it. If CIPHER has a Pulse Factor setting buried five layers deep in the inputs, there is a lesson explaining what it does, what the default is, and when to change it. If CIPHER fires an arrow, there is a lesson on how to actually enter that trade, where to place the stop, and where to take profit &mdash; not just an abstract description of what the arrow means.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — THE CONSUMER FAILURE LOOP === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Failure Mode</p>
          <h2 className="text-2xl font-extrabold mb-4">The Consumer Failure Loop</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before we teach the correct workflow, it helps to watch the failure mode clearly. This is what happens when a trader approaches CIPHER as a consumer instead of an operator. The loop has four stages &mdash; each with a choice point that separates the consumer from the operator. <strong className="text-white">Stage 1:</strong> Arrow fires. A loud, bright teal buy signal appears on the chart. Dopamine spike. <strong className="text-white">Stage 2:</strong> Command Center disagrees. Regime shows Distribution. Pulse is negative. The Command Center is quietly warning the trader. Consumer does not read it. <strong className="text-white">Stage 3:</strong> Entry. Consumer trusts the loud thing and ignores the quiet thing. <strong className="text-white">Stage 4:</strong> Stop-out. Price reverses exactly as the Command Center forecast. Trade loses. Consumer blames &ldquo;the indicator.&rdquo; <strong className="text-amber-400">The arrow was real.</strong> The arrow was CIPHER reporting one honest read. The cascade was ALSO CIPHER reporting four more honest reads &mdash; in the opposite direction. The consumer picked the loudest read. The operator would have integrated all five.</p>
          <ConsumerMistakeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Loud vs Quiet Reads</p>
            <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s arrows are loud by design &mdash; they need to be, to function as alerts. The Command Center cells are quiet by design &mdash; they need to be, to function as a dense scanning panel. Consumers gravitate toward the loud thing; operators deliberately train themselves to read the quiet things first. Volume of presentation is not the same as importance of content.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — THE OPERATOR WORKFLOW === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Correct Path</p>
          <h2 className="text-2xl font-extrabold mb-4">The Operator Workflow</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Same market event. Same CIPHER arrow. Different trader. Watch what changes when the consumer becomes the operator. <strong className="text-white">Stage 1:</strong> Arrow fires. Same teal arrow. Operator notes it. <strong className="text-white">Stage 2:</strong> Command Center read. Operator deliberately scans each row. Regime, Pulse, Coil &mdash; one by one. Disagreement detected. <strong className="text-white">Stage 3:</strong> Stand down. Operator concludes the arrow is not backed by the cascade. No trade taken. <strong className="text-white">Stage 4:</strong> Price dumps. Same market outcome. Operator unharmed. <strong className="text-amber-400">The best trade was the one not taken.</strong></p>
          <OperatorWorkflowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Best Trade Is Often the One Not Taken</p>
            <p className="text-sm text-gray-400 leading-relaxed">This phrase should become muscle memory. Not every trade refused feels like winning &mdash; some feel like missing out. But across hundreds of trades, the operator who refuses low-confluence setups preserves capital that consumers burn through on obvious traps. The arithmetic works out. Trust it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — YOUR FIRST 10 MINUTES === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Opening Ritual</p>
          <h2 className="text-2xl font-extrabold mb-4">Your First 10 Minutes With CIPHER</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When a professional pilot enters the cockpit, they run a checklist. Not because they distrust the aircraft, but because reading every instrument in sequence is how they verify the environment before acting. You should do the same when you open a CIPHER chart. Below is the opening ritual &mdash; ten minutes, six checkpoints. Do this every time you open a chart until it becomes unconscious reflex. <strong className="text-white">0:00 Open Chart</strong> &mdash; load, let CIPHER render, take 30 seconds to register the overall feel (trending, ranging, quiet, frantic). <strong className="text-white">0:30 Regime Check</strong> &mdash; what regime cell is CIPHER reporting? This single read conditions every other read that follows. <strong className="text-white">2:00 Coil Check</strong> &mdash; is there an active coil box, and what phase (building, coiling, breakout ready)? Coils are CIPHER&apos;s setup detection. <strong className="text-white">4:00 Pulse Check</strong> &mdash; what is the pulse reading? Rising or falling? Pulse is CIPHER&apos;s momentum read. <strong className="text-white">6:00 Context Tag</strong> &mdash; what is CIPHER&apos;s one-line interpretation? It should agree with your regime and pulse reads. <strong className="text-amber-400">10:00 Decide</strong> &mdash; trade or watch. If the readings agree and a setup is forming, plan the trade. If they disagree, stand down and set an alert. The decision is yours &mdash; CIPHER only reports.</p>
          <FirstTenMinutesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Run the Ritual Even When You&apos;re Sure</p>
            <p className="text-sm text-gray-400 leading-relaxed">The ritual&apos;s value is NOT when the chart is ambiguous. It&apos;s when you&apos;re already sure. Confident traders skip checklist steps and catch the occasional trap. Disciplined traders run the checklist every time and catch EVERY trap. The six-step ritual takes ten minutes. It earns its keep twice a month when it saves you from a trap you would have walked into while sure.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — HOW TO STUDY LEVEL 11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Study Method</p>
          <h2 className="text-2xl font-extrabold mb-4">Loop Until Reflex</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Reading about CIPHER will not make you a CIPHER operator. Neither will watching videos or collecting screenshots. The only path from knowledge to reflex is <strong className="text-white">repetition under controlled conditions</strong>. Every Level 11 lesson is designed around a three-phase study loop. Use it for every lesson. Do not skip phases. <strong className="text-white">WATCH</strong> &mdash; read the lesson, watch the animations, take the quiz. This builds the conceptual scaffold. Budget about 30&ndash;45 minutes per lesson. Do not skip the game &mdash; it tests the concept in scenarios, not just facts. <strong className="text-white">READ</strong> &mdash; open CIPHER&apos;s settings panel. Find every input the lesson referenced. Read the tooltip on each. Toggle some. Return to defaults. This binds the concept to the actual UI you will use. About 15&ndash;20 minutes per lesson. <strong className="text-amber-400">DRILL</strong> &mdash; open a live (or replay) chart. Apply the lesson&apos;s concept in real market conditions. Talk through what you see aloud. Mark chart screenshots with your reads. About 30&ndash;60 minutes per lesson, repeated across multiple sessions.</p>
          <StudyApproachAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Total Commitment</p>
            <p className="text-sm text-gray-400 leading-relaxed">A Level 11 lesson requires roughly 90 minutes across its three phases. Twenty-plus lessons in the level means a realistic 30&ndash;40 hours of focused practice to complete Level 11 properly. This is not a weekend study; it is a month of deliberate work. Treat it like preparing for a professional certification &mdash; because that is what it is.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — COMMON MISTAKES === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways New CIPHER Users Fail</h2>
          <p className="text-gray-400 leading-relaxed mb-6">These are the failure modes we have seen most often from new CIPHER users. Recognize them in yourself early; they are much harder to unlearn once they become habit.</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 1 &mdash; Trading Every Arrow</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">&ldquo;CIPHER fired a buy arrow, so I buy. CIPHER fired a sell arrow, so I sell.&rdquo; This treats the arrow as a command. An arrow is one report. Read the full cascade before acting. No arrow gets traded without confluence.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 2 &mdash; Changing Settings Mid-Session</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Trade loses, tweak inputs to make the loss &ldquo;not have fired.&rdquo; Trade wins, leave settings alone. This is outcome-gaming, not tuning. Lock settings before the session. Review at week end. Never tune mid-session in response to individual trade outcomes.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 3 &mdash; Skipping the Command Center</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Looking only at the chart, ignoring the Command Center panel. &ldquo;I do not need all those numbers &mdash; I can read the chart.&rdquo; The Command Center IS CIPHER. The chart is price. Reading CIPHER without the Command Center is using a fraction of the tool.</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">&#10060;</span>
                <p className="text-sm font-extrabold text-red-400 flex-1">Mistake 4 &mdash; Blaming the Tool</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed ml-10">Trade loses, conclude CIPHER is broken or suboptimal, shop for a different indicator or tune CIPHER&apos;s filters. The tool reported honestly; the operator missed a reading. That is the lesson &mdash; not that the tool failed.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S13 — CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Operator Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Save This. Print It.</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Core Principles</p>
                <p className="text-sm text-gray-300">CIPHER reports. The operator decides. The arrow is one report among many &mdash; never privileged. Every arrow has a receipt &mdash; trace it before trading it. When the cascade disagrees with the arrow, the cascade wins. The best trade is often the one not taken.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Opening Ritual (10 Minutes, 6 Checkpoints)</p>
                <p className="text-sm text-gray-300">Open chart and register overall feel &rarr; Regime check (conditions everything below) &rarr; Coil check (any active setup forming?) &rarr; Pulse check (direction and strength of momentum) &rarr; Context tag (CIPHER&apos;s one-line interpretation) &rarr; Decide (trade, watch, or walk away).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">The Three-Phase Study Loop</p>
                <p className="text-sm text-gray-300">WATCH the lesson (30&ndash;45 min) &rarr; READ the settings (15&ndash;20 min) &rarr; DRILL on live charts (30&ndash;60 min, repeated). Loop until reflex. Never skip phases.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 mb-1">The Four Failure Modes</p>
                <p className="text-sm text-gray-300">&#10060; Trading every arrow without reading the cascade &middot; &#10060; Changing settings mid-session in reaction to individual trades &middot; &#10060; Skipping the Command Center and relying on the chart alone &middot; &#10060; Blaming the tool when the operator failed to read.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Consumer or Operator?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you have internalized the Operator Contract. Each round gives you a live CIPHER situation and two choices &mdash; one a consumer would make, one an operator would make. Pick the operator path.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameScore}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">{gameRounds[gameRound].scenario}</p>
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt, oi) => {
                const answered = gameAnswers[gameRound] !== null;
                const selected = gameAnswers[gameRound] === oi;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={oi}>
                    <button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 align-middle" style={{ background: opt.label === 'Operator' ? 'rgba(76,217,202,0.15)' : 'rgba(239,83,80,0.15)', color: opt.label === 'Operator' ? '#4CD9CA' : '#EF5350' }}>{opt.label}</span>
                      <span className="text-gray-200">{opt.text}</span>
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '✓' : '✗'} {opt.explain}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p>
                <p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'Operator thinking is installed. The cascade beats the loudest signal every time.' : gameScore >= 3 ? 'Mostly operator. Re-read S08 and S09 before the quiz &mdash; the failure loop needs to be crystal clear.' : 'Re-study the Operator Contract (S01) and the consumer vs operator workflows (S08&ndash;S09) before the quiz.'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* === S15 — Final Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; 8 Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4">{q.q}</p>
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === oi;
                    const isCorrect = oi === q.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return (
                      <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400"><span className="font-bold">&#9989;</span> {q.explain}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {quizDone && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizScore}%</p>
              <p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9836;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11: Why CIPHER &mdash; The Operator Contract</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; CIPHER Operator Inducted &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L11.1-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
