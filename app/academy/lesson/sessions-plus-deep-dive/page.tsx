// app/academy/lesson/sessions-plus-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.2: Sessions+ Deep Dive [PRO]
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

// Session anchor constants — based on Sessions+ Pine v1.1.0 UTC definitions
// Asian 2000-0400, London 0700-1600, NY 1300-2200
// Drawn on a 24-hour canvas axis where 0 = 00:00 UTC, 1 = 24:00 UTC
const ASN_START = 20 / 24;
const ASN_END = 28 / 24; // wraps past midnight
const LDN_START = 7 / 24;
const LDN_END = 16 / 24;
const NY_START = 13 / 24;
const NY_END = 22 / 24;

// ============================================================
// ANIMATION 1: Three Sessions Anatomy — Live 24-hour timeline
// ============================================================
function ThreeSessionsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.005;
    const padL = 30;
    const padR = w - 12;
    const timeW = padR - padL;
    const chartT = 30;
    const chartB = h - 34;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('24-Hour Session Map — UTC', w / 2, 14);

    // Background grid — hours
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let hr = 0; hr <= 24; hr += 4) {
      const x = padL + (hr / 24) * timeW;
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(hr.toString().padStart(2, '0') + ':00', x, chartB + 12);
    }

    // Generate synthetic price behavior across 24h — quiet in Asian, active in overlaps
    const pts = 120;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const hourFrac = i / pts;
      const asian = hourFrac >= ASN_START || hourFrac <= 4 / 24;
      const ldnNyOverlap = hourFrac >= NY_START && hourFrac <= LDN_END;
      const vol = asian ? 0.3 : ldnNyOverlap ? 1.3 : 0.85;
      prices.push(100 + Math.sin(t + i * 0.15) * 8 * vol + Math.sin(t * 0.7 + i * 0.3) * 4 * vol + Math.cos(i * 0.1) * 2);
    }
    const pMin = Math.min(...prices); const pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 8) - 4;

    // Draw session boxes FIRST (behind price)
    const sessColors = {
      asian: { fill: 'rgba(156,39,176,0.12)', border: 'rgba(156,39,176,0.55)', label: 'ASN', labelColor: '#ce93d8' },
      london: { fill: 'rgba(33,150,243,0.12)', border: 'rgba(33,150,243,0.55)', label: 'LDN', labelColor: '#64b5f6' },
      ny: { fill: 'rgba(255,152,0,0.12)', border: 'rgba(255,152,0,0.55)', label: 'NY', labelColor: '#ffb74d' },
    };

    const drawSessionBox = (startFrac: number, endFrac: number, c: { fill: string; border: string; label: string; labelColor: string }) => {
      // Handle Asian wrap
      if (endFrac > 1) {
        drawSessionBox(startFrac, 1, c);
        drawSessionBox(0, endFrac - 1, c);
        return;
      }
      const x1 = padL + startFrac * timeW;
      const x2 = padL + endFrac * timeW;
      ctx.fillStyle = c.fill;
      ctx.fillRect(x1, chartT, x2 - x1, chartH);
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, chartT, x2 - x1, chartH);
    };

    drawSessionBox(ASN_START, ASN_END, sessColors.asian);
    drawSessionBox(LDN_START, LDN_END, sessColors.london);
    drawSessionBox(NY_START, NY_END, sessColors.ny);

    // Session labels at top of each box
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = sessColors.asian.labelColor;
    ctx.fillText('ASN', padL + ((ASN_START + 1) / 2 + (ASN_END - 1) / 2) * timeW, chartT + 12);
    ctx.fillStyle = sessColors.london.labelColor;
    ctx.fillText('LDN', padL + ((LDN_START + LDN_END) / 2) * timeW, chartT + 12);
    ctx.fillStyle = sessColors.ny.labelColor;
    ctx.fillText('NY', padL + ((NY_START + NY_END) / 2) * timeW, chartT + 12);

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + (i / (pts - 1)) * timeW; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Moving "now" indicator
    const nowFrac = (t * 0.15) % 1;
    const nowX = padL + nowFrac * timeW;
    ctx.strokeStyle = 'rgba(245,158,11,0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(nowX, chartT); ctx.lineTo(nowX, chartB); ctx.stroke();
    ctx.setLineDash([]);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 2: LDN-NY Overlap — the power window
// ============================================================
function OverlapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.02;
    const padL = 30;
    const padR = w - 12;
    const timeW = padR - padL;
    const chartT = 32;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LDN × NY Overlap — The Power Window', w / 2, 14);

    // Hours
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let hr = 0; hr <= 24; hr += 4) {
      const x = padL + (hr / 24) * timeW;
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(hr.toString().padStart(2, '0'), x, chartB + 12);
    }

    // London box (dim, behind)
    ctx.fillStyle = 'rgba(33,150,243,0.08)';
    ctx.fillRect(padL + LDN_START * timeW, chartT, (LDN_END - LDN_START) * timeW, chartH);
    ctx.strokeStyle = 'rgba(33,150,243,0.3)';
    ctx.strokeRect(padL + LDN_START * timeW, chartT, (LDN_END - LDN_START) * timeW, chartH);

    // NY box (dim, behind)
    ctx.fillStyle = 'rgba(255,152,0,0.08)';
    ctx.fillRect(padL + NY_START * timeW, chartT, (NY_END - NY_START) * timeW, chartH);
    ctx.strokeStyle = 'rgba(255,152,0,0.3)';
    ctx.strokeRect(padL + NY_START * timeW, chartT, (NY_END - NY_START) * timeW, chartH);

    // The Overlap — bright green pulse
    const ovStart = NY_START;
    const ovEnd = LDN_END;
    const pulse = 0.3 + Math.sin(t * 2) * 0.15;
    ctx.fillStyle = `rgba(76,175,80,${pulse})`;
    ctx.fillRect(padL + ovStart * timeW, chartT, (ovEnd - ovStart) * timeW, chartH);
    ctx.strokeStyle = 'rgba(76,175,80,0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padL + ovStart * timeW, chartT, (ovEnd - ovStart) * timeW, chartH);

    // Labels
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(33,150,243,0.8)';
    ctx.fillText('LONDON 07:00-16:00', padL + ((LDN_START + LDN_END) / 2) * timeW, chartT - 6);
    ctx.fillStyle = 'rgba(255,152,0,0.8)';
    ctx.fillText('NY 13:00-22:00', padL + ((NY_START + NY_END) / 2) * timeW, chartB + 22);

    ctx.fillStyle = 'rgba(76,175,80,1)';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('OVERLAP', padL + ((ovStart + ovEnd) / 2) * timeW, chartT + chartH / 2 - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '8px system-ui';
    ctx.fillText('13:00 - 16:00', padL + ((ovStart + ovEnd) / 2) * timeW, chartT + chartH / 2 + 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('highest volume · biggest moves', padL + ((ovStart + ovEnd) / 2) * timeW, chartT + chartH / 2 + 22);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 3: Killzones — 5 bands across the day
// ============================================================
function KillzonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;
    const padL = 30;
    const padR = w - 12;
    const timeW = padR - padL;
    const chartT = 30;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ICT Killzones — 5 High-Probability Windows', w / 2, 14);

    // Killzones from Pine source:
    // Asian KZ: 0000-0400 UTC
    // London Open KZ: 0700-1000 UTC
    // NY AM KZ: 1200-1500 UTC
    // London Close KZ: 1500-1700 UTC
    // Silver Bullet AM: 1500-1600 UTC
    // Silver Bullet PM: 1900-2000 UTC

    const kzs = [
      { start: 0 / 24, end: 4 / 24, name: 'ASIAN KZ', color: '#FFEB3B', opacity: 0.18 },
      { start: 7 / 24, end: 10 / 24, name: 'LDN OPEN', color: '#FFEB3B', opacity: 0.26 },
      { start: 12 / 24, end: 15 / 24, name: 'NY AM', color: '#FFEB3B', opacity: 0.26 },
      { start: 15 / 24, end: 17 / 24, name: 'LDN CLOSE', color: '#FFEB3B', opacity: 0.18 },
      { start: 15 / 24, end: 16 / 24, name: 'SB AM', color: '#00E676', opacity: 0.4 },
      { start: 19 / 24, end: 20 / 24, name: 'SB PM', color: '#00E676', opacity: 0.4 },
    ];

    // Hours grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let hr = 0; hr <= 24; hr += 4) {
      const x = padL + (hr / 24) * timeW;
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(hr.toString().padStart(2, '0'), x, chartB + 12);
    }

    // Generate price
    const pts = 120;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const hf = i / pts;
      const inKz = kzs.some(k => hf >= k.start && hf <= k.end);
      const mult = inKz ? 1.5 : 0.6;
      prices.push(100 + Math.sin(t + i * 0.18) * 6 * mult + Math.sin(t * 0.5 + i * 0.35) * 3 * mult);
    }
    const pMin = Math.min(...prices); const pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 12) - 6;

    // Draw KZ bands
    kzs.forEach((kz, idx) => {
      const x1 = padL + kz.start * timeW;
      const x2 = padL + kz.end * timeW;
      // Pulse for Silver Bullet
      let op = kz.opacity;
      if (kz.name.includes('SB')) op = kz.opacity + Math.sin(t * 3 + idx) * 0.1;
      ctx.fillStyle = kz.color + Math.floor(op * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x1, chartT, x2 - x1, chartH);

      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = kz.color;
      ctx.fillText(kz.name, padL + ((kz.start + kz.end) / 2) * timeW, chartT + 10 + (idx % 2 === 0 ? 0 : 12));
    });

    // Price on top
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + (i / (pts - 1)) * timeW; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 4: Silver Bullet — the 60-min precision window
// ============================================================
function SilverBulletAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.018;
    const padL = 20;
    const padR = w - 15;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Silver Bullet Window — 60 Minutes of Precision', w / 2, 14);

    // Draw a 3-hour window zoomed in (say 14:30 - 17:30)
    // Silver Bullet AM sits at 15:00-16:00 as the centerpiece
    const chartT = 32;
    const chartB = h - 26;
    const chartH = chartB - chartT;

    const hourStart = 14.5;
    const hourEnd = 17.5;
    const sbStart = 15 / (hourEnd - hourStart) * (padR - padL) - (14.5 - hourStart) / (hourEnd - hourStart) * (padR - padL);

    // Generate price with clear SB reversal
    const pts = 100;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) {
      const hourFrac = hourStart + (i / pts) * (hourEnd - hourStart);
      const inSB = hourFrac >= 15 && hourFrac <= 16;
      // Trend up before SB, reverse down during SB, chop after
      let base = 100;
      if (hourFrac < 15) base = 100 + (hourFrac - 14.5) * 12;
      else if (hourFrac < 16) base = 106 - (hourFrac - 15) * 14;
      else base = 92 + Math.sin((hourFrac - 16) * 4) * 2;
      prices.push(base + Math.sin(t + i * 0.4) * 1.5 * (inSB ? 1.8 : 1));
    }
    const pMin = Math.min(...prices); const pMax = Math.max(...prices);
    const pRange = pMax - pMin || 1;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 10) - 5;

    // Time grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let hr = 15; hr <= 17; hr += 0.5) {
      const x = padL + ((hr - hourStart) / (hourEnd - hourStart)) * (padR - padL);
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      const h = Math.floor(hr);
      const m = (hr - h) * 60;
      ctx.fillText(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, x, chartB + 12);
    }

    // Draw Silver Bullet highlight
    const sbX1 = padL + ((15 - hourStart) / (hourEnd - hourStart)) * (padR - padL);
    const sbX2 = padL + ((16 - hourStart) / (hourEnd - hourStart)) * (padR - padL);
    const pulse = 0.25 + Math.sin(t * 3) * 0.12;
    ctx.fillStyle = `rgba(0,230,118,${pulse})`;
    ctx.fillRect(sbX1, chartT, sbX2 - sbX1, chartH);
    ctx.strokeStyle = 'rgba(0,230,118,0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sbX1, chartT, sbX2 - sbX1, chartH);

    // SB label
    ctx.fillStyle = 'rgba(0,230,118,1)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SILVER BULLET', (sbX1 + sbX2) / 2, chartT + 12);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '7px system-ui';
    ctx.fillText('10:00-11:00 NY', (sbX1 + sbX2) / 2, chartT + 23);

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + (i / (pts - 1)) * (padR - padL); i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Reversal annotation
    const reversalIdx = Math.floor(pts * ((15.1 - hourStart) / (hourEnd - hourStart)));
    const rX = padL + (reversalIdx / (pts - 1)) * (padR - padL);
    const rY = toY(prices[reversalIdx]);
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.beginPath(); ctx.arc(rX, rY, 3 + Math.sin(t * 4) * 1, 0, Math.PI * 2); ctx.fill();
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 5: Multi-TF Level System — the hierarchy
// ============================================================
function LevelHierarchyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Level Hierarchy — From Micro to Macro', w / 2, 14);

    const padL = 25;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 14;
    const chartH = chartB - chartT;

    // Price wave in center
    const pts = 80;
    const prices: number[] = [];
    for (let i = 0; i < pts; i++) prices.push(100 + Math.sin(t + i * 0.12) * 6 + Math.cos(i * 0.25) * 3);
    const pMin = 85; const pMax = 115; const pRange = 30;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    const xStep = (padR - padL) / (pts - 1);

    // Levels array — from tightest (current hour) to widest (previous quarter)
    const levels = [
      { label: 'PHH', value: 107, color: '#26A69A', tf: '1h' },
      { label: 'PHL', value: 95, color: '#EF5350', tf: '1h' },
      { label: 'PDH', value: 110, color: '#26A69A', tf: 'Day' },
      { label: 'PDL', value: 92, color: '#EF5350', tf: 'Day' },
      { label: 'PWH', value: 113, color: '#26A69A', tf: 'Week' },
      { label: 'PWL', value: 89, color: '#EF5350', tf: 'Week' },
    ];

    // Pulse one level at a time so the sequence reads
    const activeIdx = Math.floor(t * 0.8) % levels.length;

    levels.forEach((lv, i) => {
      const y = toY(lv.value);
      const active = i === activeIdx;
      const alpha = active ? 0.95 : 0.35;
      ctx.strokeStyle = lv.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.setLineDash(active ? [] : [2, 2]);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padR, y); ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = active ? lv.color : lv.color + '80';
      ctx.font = active ? 'bold 9px system-ui' : '8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(lv.label, padL - 3, y + 3);
    });

    // Price line (bright on top)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Legend at top right showing TF scale
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('PHH/PHL · PDH/PDL · PWH/PWL', padR, chartT - 5);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: Session VWAP + Bands
// ============================================================
function VWAPBandsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;
    const padL = 20;
    const padR = w - 15;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Session VWAP + Standard Deviation Bands', w / 2, 14);

    const chartT = 30;
    const chartB = h - 14;
    const chartH = chartB - chartT;

    // Generate price + fake volume
    const pts = 80;
    const prices: number[] = [];
    const vols: number[] = [];
    for (let i = 0; i < pts; i++) {
      prices.push(100 + Math.sin(t + i * 0.15) * 8 + Math.cos(t * 0.4 + i * 0.3) * 4);
      vols.push(0.5 + Math.abs(Math.sin(i * 0.4 + t)) * 1.5);
    }

    // Volume-weighted cumulative calc
    const vwap: number[] = [];
    let sumPV = 0;
    let sumV = 0;
    for (let i = 0; i < pts; i++) {
      sumPV += prices[i] * vols[i];
      sumV += vols[i];
      vwap.push(sumPV / sumV);
    }

    // Std dev bands
    const upper: number[] = [];
    const lower: number[] = [];
    const upper2: number[] = [];
    const lower2: number[] = [];
    for (let i = 0; i < pts; i++) {
      let sumDiffSq = 0;
      for (let j = 0; j <= i; j++) sumDiffSq += Math.pow(prices[j] - vwap[j], 2) * vols[j];
      const sd = Math.sqrt(sumDiffSq / Math.max(1, sumV));
      upper.push(vwap[i] + sd);
      lower.push(vwap[i] - sd);
      upper2.push(vwap[i] + sd * 2);
      lower2.push(vwap[i] - sd * 2);
    }

    const allVals = [...prices, ...upper2, ...lower2];
    const pMin = Math.min(...allVals); const pMax = Math.max(...allVals);
    const pRange = pMax - pMin || 1;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 6) - 3;

    const xStep = (padR - padL) / (pts - 1);

    // Fill between upper2 and lower2 — outermost
    ctx.fillStyle = 'rgba(255,152,0,0.05)';
    ctx.beginPath();
    upper2.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(lower2[i])); }
    ctx.closePath(); ctx.fill();

    // Fill between upper and lower — inner
    ctx.fillStyle = 'rgba(255,152,0,0.08)';
    ctx.beginPath();
    upper.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    for (let i = pts - 1; i >= 0; i--) { const x = padL + i * xStep; ctx.lineTo(x, toY(lower[i])); }
    ctx.closePath(); ctx.fill();

    // Band lines
    const drawLine = (arr: number[], color: string, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash(dash);
      ctx.beginPath();
      arr.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawLine(upper2, 'rgba(255,152,0,0.35)', [2, 2]);
    drawLine(lower2, 'rgba(255,152,0,0.35)', [2, 2]);
    drawLine(upper, 'rgba(255,152,0,0.55)', [3, 2]);
    drawLine(lower, 'rgba(255,152,0,0.55)', [3, 2]);

    // VWAP line (bright orange)
    drawLine(vwap, '#FF9800');

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Label
    ctx.fillStyle = '#FF9800';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('VWAP', padL + 4, chartT + 10);
    ctx.fillStyle = 'rgba(255,152,0,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('±1σ  ±2σ bands', padL + 4, chartT + 20);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 7: Power of 3 — Accumulation / Manipulation / Distribution
// ============================================================
function PowerOfThreeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Power of 3 — Accumulation · Manipulation · Distribution', w / 2, 14);

    const padL = 20;
    const padR = w - 15;
    const chartT = 30;
    const chartB = h - 26;
    const chartH = chartB - chartT;

    // Three-phase synthetic price
    const pts = 120;
    const prices: number[] = [];
    const p1End = 40;
    const p2End = 70;
    for (let i = 0; i < pts; i++) {
      let base = 100;
      if (i < p1End) {
        // Accumulation — tight range
        base = 100 + Math.sin(i * 0.4 + t) * 1.5 + Math.cos(i * 0.7) * 0.8;
      } else if (i < p2End) {
        // Manipulation — sharp fake-down
        const progress = (i - p1End) / (p2End - p1End);
        base = 100 - Math.sin(progress * Math.PI) * 6 + Math.sin(i * 0.6 + t) * 0.5;
      } else {
        // Distribution — strong up
        const progress = (i - p2End) / (pts - p2End);
        base = 99 + progress * 14 + Math.sin(i * 0.3 + t) * 0.8;
      }
      prices.push(base);
    }

    const pMin = Math.min(...prices) - 1; const pMax = Math.max(...prices) + 1;
    const pRange = pMax - pMin;
    const toY = (v: number) => chartB - ((v - pMin) / pRange) * (chartH - 20) - 10;
    const xStep = (padR - padL) / (pts - 1);

    // Phase backgrounds
    ctx.fillStyle = 'rgba(33,150,243,0.08)'; // Accumulation — blue
    ctx.fillRect(padL, chartT, p1End * xStep, chartH);
    ctx.fillStyle = 'rgba(255,152,0,0.10)'; // Manipulation — orange
    ctx.fillRect(padL + p1End * xStep, chartT, (p2End - p1End) * xStep, chartH);
    ctx.fillStyle = 'rgba(76,175,80,0.10)'; // Distribution — green
    ctx.fillRect(padL + p2End * xStep, chartT, (pts - p2End) * xStep, chartH);

    // Phase borders
    [p1End, p2End].forEach(idx => {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.moveTo(padL + idx * xStep, chartT); ctx.lineTo(padL + idx * xStep, chartB); ctx.stroke();
    });

    // Phase labels — pulse the current one based on time
    const currentPhase = Math.floor(t * 0.5) % 3;
    const phaseData = [
      { name: 'ACCUMULATION', mid: p1End / 2, color: '#2196F3' },
      { name: 'MANIPULATION', mid: (p1End + p2End) / 2, color: '#FF9800' },
      { name: 'DISTRIBUTION', mid: (p2End + pts) / 2, color: '#4CAF50' },
    ];
    phaseData.forEach((ph, idx) => {
      const active = idx === currentPhase;
      ctx.fillStyle = active ? ph.color : ph.color + '88';
      ctx.font = active ? 'bold 9px system-ui' : 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ph.name, padL + ph.mid * xStep, chartT + 12);
    });

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v)); });
    ctx.stroke();

    // Mark the fake low (liquidity grab) during manipulation
    const fakeLowIdx = p1End + Math.floor((p2End - p1End) / 2);
    const flX = padL + fakeLowIdx * xStep;
    const flY = toY(prices[fakeLowIdx]);
    ctx.strokeStyle = 'rgba(239,68,68,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.arc(flX, flY, 5 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.9)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('liquidity grab', flX, flY + 18);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: DNA Predictor — fingerprint builds in real time
// ============================================================
function DNAPredictorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Session DNA — Live Predictor', w / 2, 14);

    const centerX = w / 2;
    const topY = 36;

    // DNA components — 6 metrics that feed the predictor
    const dnaMetrics = [
      { label: 'Range %ile', value: 68 + Math.sin(t) * 5, max: 100, color: '#26A69A' },
      { label: 'Efficiency', value: 72 + Math.sin(t * 0.7) * 4, max: 100, color: '#FFB300' },
      { label: 'Time-High', value: 2, max: 3, color: '#0ea5e9', isPhase: true },
      { label: 'Time-Low', value: 1, max: 3, color: '#0ea5e9', isPhase: true },
      { label: 'Close-Pos', value: 76 + Math.sin(t * 1.2) * 4, max: 100, color: '#26A69A' },
      { label: 'Direction', value: 1, max: 1, color: '#26A69A', isDir: true },
    ];

    const barW = Math.min(60, (w - 60) / 6);
    const barH = 40;
    const gap = 8;
    const totalW = 6 * barW + 5 * gap;
    const startX = (w - totalW) / 2;

    dnaMetrics.forEach((m, i) => {
      const x = startX + i * (barW + gap);
      const y = topY;

      // Cell
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, y, barW, barH + 28);
      ctx.strokeStyle = m.color + '40';
      ctx.strokeRect(x, y, barW, barH + 28);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, x + barW / 2, y - 3);

      // Value
      if (m.isDir) {
        ctx.fillStyle = m.value > 0 ? '#26A69A' : '#EF5350';
        ctx.font = 'bold 18px system-ui';
        ctx.fillText(m.value > 0 ? '▲' : '▼', x + barW / 2, y + 24);
        ctx.font = '7px system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(m.value > 0 ? 'BULL' : 'BEAR', x + barW / 2, y + barH + 20);
      } else if (m.isPhase) {
        const phases = ['EARLY', 'MID', 'LATE'];
        const ph = phases[Math.floor(m.value) - 1] || 'MID';
        ctx.fillStyle = m.color;
        ctx.font = 'bold 11px system-ui';
        ctx.fillText(ph, x + barW / 2, y + 24);
      } else {
        const frac = m.value / m.max;
        // Bar
        ctx.fillStyle = m.color + '40';
        ctx.fillRect(x + 4, y + 8, barW - 8, 14);
        ctx.fillStyle = m.color;
        ctx.fillRect(x + 4, y + 8, (barW - 8) * frac, 14);
        // Number
        ctx.fillStyle = m.color;
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(m.value.toFixed(0), x + barW / 2, y + 35);
      }
    });

    // Prediction output box below
    const predY = topY + barH + 40;
    const predBoxW = Math.min(280, w - 40);
    const predX = (w - predBoxW) / 2;
    const predH = h - predY - 10;

    // Similarity search visualization — scan arrow
    const scanFrac = (t * 0.3) % 1;
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(predX, predY, predBoxW, predH);
    ctx.strokeStyle = 'rgba(245,158,11,0.35)';
    ctx.strokeRect(predX, predY, predBoxW, predH);
    ctx.fillStyle = 'rgba(245,158,11,0.2)';
    ctx.fillRect(predX + scanFrac * (predBoxW - 20), predY + 2, 20, predH - 4);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DNA SIMILARITY SEARCH → NEXT SESSION PREDICTION', centerX, predY + 14);
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('Leaning Bullish — 73% historical match', centerX, predY + predH / 2 + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.fillText('based on 20 prior sessions with this DNA fingerprint', centerX, predY + predH - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: Regime Classification
// ============================================================
function RegimeClassificationAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Regime Classification — 4 Market Modes', w / 2, 14);

    const regimes = [
      { name: 'TRENDING', color: '#26A69A', desc: 'High directional, low chop' },
      { name: 'RANGING', color: '#FFB300', desc: 'Clear bounds, low slope' },
      { name: 'VOLATILE', color: '#EF5350', desc: 'Wide swings, whippy' },
      { name: 'DEAD', color: '#9E9E9E', desc: 'Compressed, no activity' },
    ];

    const boxH = (h - 50) / 4;
    regimes.forEach((r, i) => {
      const y = 30 + i * boxH;
      const active = Math.floor(t * 0.4) % 4 === i;
      const pulse = active ? 0.25 : 0.08;

      ctx.fillStyle = r.color + Math.floor(pulse * 255).toString(16).padStart(2, '0');
      ctx.fillRect(20, y, w - 40, boxH - 4);
      ctx.strokeStyle = active ? r.color : r.color + '40';
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.strokeRect(20, y, w - 40, boxH - 4);

      // Mini price sparkline showing what this regime looks like
      const sparkX = w * 0.55;
      const sparkW = w - sparkX - 24;
      const sparkY = y + boxH / 2;
      const sparkH = boxH * 0.5;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let j = 0; j < 30; j++) {
        const px = sparkX + (j / 29) * sparkW;
        let py = sparkY;
        if (r.name === 'TRENDING') py = sparkY - (j - 15) * 0.25 * sparkH * 0.1 + Math.sin(j + t) * sparkH * 0.05;
        else if (r.name === 'RANGING') py = sparkY + Math.sin(j * 0.4 + t) * sparkH * 0.35;
        else if (r.name === 'VOLATILE') py = sparkY + Math.sin(j * 0.2 + t) * sparkH * 0.7 + Math.sin(j * 0.8) * sparkH * 0.2;
        else py = sparkY + Math.sin(j * 0.3 + t) * sparkH * 0.05;
        j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = active ? r.color : r.color + 'bb';
      ctx.font = active ? 'bold 11px system-ui' : 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.name, 30, y + boxH / 2 - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '7px system-ui';
      ctx.fillText(r.desc, 30, y + boxH / 2 + 10);
    });
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 10: Verdict Engine — synthesis of bias + DNA + regime
// ============================================================
function VerdictEngineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Verdict Engine — Bias + DNA + Regime = Answer', w / 2, 14);

    // Three input nodes on left
    const leftX = 50;
    const rightX = w - 100;
    const midY = h / 2 + 5;

    const inputs = [
      { y: 44, label: 'BIAS', value: '+62', color: '#26A69A' },
      { y: midY, label: 'DNA', value: '73%', color: '#FFB300' },
      { y: h - 44, label: 'REGIME', value: 'TRENDING', color: '#0ea5e9' },
    ];

    inputs.forEach(inp => {
      ctx.fillStyle = inp.color + '15';
      ctx.fillRect(leftX - 35, inp.y - 14, 70, 28);
      ctx.strokeStyle = inp.color;
      ctx.strokeRect(leftX - 35, inp.y - 14, 70, 28);
      ctx.fillStyle = inp.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(inp.label, leftX, inp.y - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(inp.value, leftX, inp.y + 9);
    });

    // Connection lines to central synthesizer
    const synthX = w / 2;
    const synthY = midY;
    inputs.forEach(inp => {
      ctx.strokeStyle = inp.color + '50';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(leftX + 35, inp.y); ctx.lineTo(synthX - 22, synthY); ctx.stroke();

      // Animated particles along line
      const progress = ((t + inp.y * 0.01) * 0.8) % 1;
      const px = leftX + 35 + (synthX - 22 - leftX - 35) * progress;
      const py = inp.y + (synthY - inp.y) * progress;
      ctx.fillStyle = inp.color;
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // Central synth — rotating cog
    ctx.save();
    ctx.translate(synthX, synthY);
    ctx.rotate(t * 2);
    ctx.strokeStyle = 'rgba(245,158,11,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.stroke();
    }
    ctx.restore();

    // Output arrow
    ctx.strokeStyle = 'rgba(38,166,154,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(synthX + 26, synthY); ctx.lineTo(rightX - 5, synthY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightX - 5, synthY); ctx.lineTo(rightX - 10, synthY - 4); ctx.lineTo(rightX - 10, synthY + 4); ctx.closePath(); ctx.fill();

    // Final verdict box
    ctx.fillStyle = 'rgba(38,166,154,0.15)';
    ctx.fillRect(rightX, midY - 24, 90, 48);
    ctx.strokeStyle = 'rgba(38,166,154,0.9)';
    ctx.strokeRect(rightX, midY - 24, 90, 48);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VERDICT', rightX + 45, midY - 10);
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('Leaning Bullish', rightX + 45, midY + 5);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('— Trending', rightX + 45, midY + 16);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 11: Inter-Session Flow — Asian → London → NY chain
// ============================================================
function InterSessionFlowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Inter-Session Flow — Does ASN Predict LDN? Does LDN Predict NY?', w / 2, 14);

    const sessY = h / 2;
    const boxH = 70;
    const boxW = (w - 100) / 3;
    const gap = 20;

    const sessions = [
      { name: 'ASIAN', color: '#9C27B0', dir: 'BULL', stat: '62%', x: 20 },
      { name: 'LONDON', color: '#2196F3', dir: 'BULL', stat: '58%', x: 20 + boxW + gap },
      { name: 'NY', color: '#FF9800', dir: 'BEAR', stat: '45%', x: 20 + 2 * (boxW + gap) },
    ];

    sessions.forEach((s, i) => {
      const pulse = Math.floor(t * 0.8) % 3 === i;
      ctx.fillStyle = s.color + (pulse ? '30' : '15');
      ctx.fillRect(s.x, sessY - boxH / 2, boxW, boxH);
      ctx.strokeStyle = pulse ? s.color : s.color + '66';
      ctx.lineWidth = pulse ? 2 : 1;
      ctx.strokeRect(s.x, sessY - boxH / 2, boxW, boxH);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x + boxW / 2, sessY - boxH / 2 + 16);

      ctx.fillStyle = s.dir === 'BULL' ? '#26A69A' : '#EF5350';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText(s.dir === 'BULL' ? '▲' : '▼', s.x + boxW / 2, sessY - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText('continuation rate', s.x + boxW / 2, sessY + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(s.stat, s.x + boxW / 2, sessY + 26);
    });

    // Flow arrows between sessions
    for (let i = 0; i < 2; i++) {
      const fromX = sessions[i].x + boxW;
      const toX = sessions[i + 1].x;
      const active = Math.floor(t * 0.8) % 3 === i + 1;

      ctx.strokeStyle = active ? '#FFB300' : 'rgba(255,179,0,0.35)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(fromX, sessY); ctx.lineTo(toX - 4, sessY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(toX - 4, sessY); ctx.lineTo(toX - 10, sessY - 4); ctx.lineTo(toX - 10, sessY + 4); ctx.closePath();
      ctx.fillStyle = active ? '#FFB300' : 'rgba(255,179,0,0.35)';
      ctx.fill();

      // Particle
      if (active) {
        const p = (t % 1);
        ctx.fillStyle = '#FFB300';
        ctx.beginPath(); ctx.arc(fromX + (toX - 4 - fromX) * p, sessY, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Footer stat
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Historical continuation rate shown — not a forecast', w / 2, h - 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 12: Dashboard Views — 6 levels of intelligence
// ============================================================
function DashboardViewsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;
    const viewIdx = Math.floor(t * 0.6) % 6;
    const views = ['OFF', 'MINIMAL', 'STATUS', 'TRADE', 'ANALYTICS', 'FULL'];

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Dashboard Views — 6 Levels of Detail', w / 2, 14);

    const dashX = (w - 220) / 2;
    const dashY = 36;
    const dashW = 220;

    // Dashboard rows based on current view
    const allRows: { k: string; v: string; color: string }[] = [];
    if (viewIdx >= 1) {
      allRows.push({ k: 'Session', v: 'NEW YORK', color: '#FF9800' });
      allRows.push({ k: 'Verdict', v: 'Leaning Bullish', color: '#26A69A' });
    }
    if (viewIdx >= 2) {
      allRows.push({ k: 'Killzone', v: 'NY AM', color: '#FFEB3B' });
      allRows.push({ k: 'ADR Used', v: '64%', color: '#FFB300' });
    }
    if (viewIdx >= 3) {
      allRows.push({ k: 'PO3 Phase', v: 'Distribution', color: '#4CAF50' });
      allRows.push({ k: 'Regime', v: 'Trending', color: '#26A69A' });
      allRows.push({ k: 'Score', v: '72/100', color: '#26A69A' });
    }
    if (viewIdx >= 4) {
      allRows.push({ k: 'DNA Match', v: '73%', color: '#FFB300' });
      allRows.push({ k: 'Flow', v: 'LDN→NY +58%', color: '#26A69A' });
      allRows.push({ k: 'Efficiency', v: '68', color: '#26A69A' });
    }
    if (viewIdx >= 5) {
      allRows.push({ k: 'Anomaly', v: 'None', color: '#9E9E9E' });
      allRows.push({ k: 'Silver Bullet', v: '14:30 in 22m', color: '#00E676' });
    }

    const rowH = 15;
    const padding = 8;
    const dashH = Math.max(60, allRows.length * rowH + 24 + padding);

    // Panel
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(dashX, dashY, dashW, dashH);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeRect(dashX, dashY, dashW, dashH);

    // Header
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SESSIONS+', dashX + padding, dashY + 12);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(views[viewIdx], dashX + dashW - padding, dashY + 12);

    // Rows
    if (allRows.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Dashboard hidden', dashX + dashW / 2, dashY + dashH / 2 + 8);
    } else {
      allRows.forEach((r, i) => {
        const y = dashY + 24 + i * rowH;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(r.k, dashX + 70, y + 8);
        ctx.fillStyle = r.color;
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(r.v, dashX + 80, y + 8);
      });
    }

    // Tab indicators below
    const tabY = dashY + dashH + 12;
    const tabW = 32;
    const tabGap = 4;
    const tabsTotalW = 6 * tabW + 5 * tabGap;
    const tabsStartX = (w - tabsTotalW) / 2;
    views.forEach((v, i) => {
      const active = i === viewIdx;
      const tx = tabsStartX + i * (tabW + tabGap);
      ctx.fillStyle = active ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(tx, tabY, tabW, 16);
      ctx.strokeStyle = active ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.1)';
      ctx.strokeRect(tx, tabY, tabW, 16);
      ctx.fillStyle = active ? '#FFB300' : 'rgba(255,255,255,0.4)';
      ctx.font = active ? 'bold 6px system-ui' : '6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(v, tx + tabW / 2, tabY + 11);
    });
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION: Liquidity Handoff Principle (★ GROUNDBREAKING)
// Sessions as a relay race, not a calendar.
// ============================================================
function LiquidityHandoffAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('★ The Liquidity Handoff Principle ★', w / 2, 14);

    // Three session blocks side by side with overlap zones highlighted
    const padL = 25;
    const padR = w - 15;
    const trackY = 48;
    const trackH = 44;
    const timelineW = padR - padL;

    // 24h timeline: 0-24 hours UTC
    const toX = (hour: number) => padL + (hour / 24) * timelineW;

    // Session blocks (UTC approximate)
    const sessions = [
      { name: 'ASIA', start: 20, end: 28, color: '#8B5CF6', wrapAround: true }, // 20:00-04:00
      { name: 'LONDON', start: 7, end: 16, color: '#0ea5e9', wrapAround: false },
      { name: 'NY', start: 13, end: 22, color: '#22c55e', wrapAround: false },
    ];

    // Draw track background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, trackY, timelineW, trackH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, trackY, timelineW, trackH);

    // Draw each session
    sessions.forEach((s, i) => {
      if (s.wrapAround) {
        // 20-24
        const x1 = toX(s.start);
        const x2 = toX(24);
        ctx.fillStyle = s.color + '30';
        ctx.fillRect(x1, trackY, x2 - x1, trackH);
        ctx.strokeStyle = s.color;
        ctx.strokeRect(x1, trackY, x2 - x1, trackH);
        // 0-4
        const x3 = toX(0);
        const x4 = toX(s.end - 24);
        ctx.fillStyle = s.color + '30';
        ctx.fillRect(x3, trackY, x4 - x3, trackH);
        ctx.strokeStyle = s.color;
        ctx.strokeRect(x3, trackY, x4 - x3, trackH);
        // Label
        ctx.fillStyle = s.color;
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(s.name, (x1 + x2) / 2, trackY + trackH / 2 + 3);
      } else {
        const x1 = toX(s.start);
        const x2 = toX(s.end);
        ctx.fillStyle = s.color + '30';
        ctx.fillRect(x1, trackY, x2 - x1, trackH);
        ctx.strokeStyle = s.color;
        ctx.strokeRect(x1, trackY, x2 - x1, trackH);
        ctx.fillStyle = s.color;
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(s.name, (x1 + x2) / 2, trackY + trackH / 2 + 3);
      }
    });

    // Overlap zones — the HANDOFF moments
    // Asia-London overlap: NONE (gap 4-7). This is where liquidity DROPS → drifts
    // London-NY overlap: 13-16 UTC ★ the prime handoff
    const overlapY = trackY + trackH + 4;
    const overlapH = 16;

    // LDN-NY overlap
    const olx1 = toX(13);
    const olx2 = toX(16);
    const pulse = 0.4 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = `rgba(245,158,11,${pulse})`;
    ctx.fillRect(olx1, overlapY, olx2 - olx1, overlapH);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(olx1, overlapY, olx2 - olx1, overlapH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('★ HANDOFF ★', (olx1 + olx2) / 2, overlapY + 11);

    // Dead zone (Asia-London gap 4-7)
    const dzx1 = toX(4);
    const dzx2 = toX(7);
    ctx.fillStyle = 'rgba(138,138,138,0.15)';
    ctx.fillRect(dzx1, overlapY, dzx2 - dzx1, overlapH);
    ctx.strokeStyle = 'rgba(138,138,138,0.5)';
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(dzx1, overlapY, dzx2 - dzx1, overlapH);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(138,138,138,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('dead zone', (dzx1 + dzx2) / 2, overlapY + 10);

    // Liquidity curve below — shows handoff zones as peaks
    const liqY = overlapY + overlapH + 12;
    const liqH = 58;

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('institutional liquidity →', padL, liqY - 2);

    // Build liquidity curve
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const hr = (i / 48) * 24;
      // Simulate liquidity: peaks at LDN open (7-9), NY open (13-15), overlap (13-16)
      let liq = 0.15; // baseline
      if (hr >= 7 && hr <= 9) liq += 0.4 * Math.exp(-Math.pow(hr - 8, 2));
      if (hr >= 13 && hr <= 16) liq += 0.65 * Math.exp(-Math.pow(hr - 14.5, 2) / 1.5);
      if (hr >= 20 && hr <= 22) liq += 0.25 * Math.exp(-Math.pow(hr - 21, 2) / 2);
      if (hr >= 0 && hr <= 2) liq += 0.25 * Math.exp(-Math.pow(hr - 1, 2) / 2);
      liq += Math.sin(t + i * 0.2) * 0.03;
      const x = toX(hr);
      const y = liqY + liqH - liq * liqH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.fillStyle = 'rgba(245,158,11,0.12)';
    ctx.beginPath();
    ctx.moveTo(padL, liqY + liqH);
    for (let i = 0; i <= 48; i++) {
      const hr = (i / 48) * 24;
      let liq = 0.15;
      if (hr >= 7 && hr <= 9) liq += 0.4 * Math.exp(-Math.pow(hr - 8, 2));
      if (hr >= 13 && hr <= 16) liq += 0.65 * Math.exp(-Math.pow(hr - 14.5, 2) / 1.5);
      if (hr >= 20 && hr <= 22) liq += 0.25 * Math.exp(-Math.pow(hr - 21, 2) / 2);
      if (hr >= 0 && hr <= 2) liq += 0.25 * Math.exp(-Math.pow(hr - 1, 2) / 2);
      liq += Math.sin(t + i * 0.2) * 0.03;
      ctx.lineTo(toX(hr), liqY + liqH - liq * liqH);
    }
    ctx.lineTo(padR, liqY + liqH);
    ctx.closePath();
    ctx.fill();

    // Time axis
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    [0, 4, 7, 13, 16, 20, 24].forEach(hr => {
      const x = toX(hr);
      ctx.beginPath(); ctx.moveTo(x, liqY + liqH); ctx.lineTo(x, liqY + liqH + 4); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${hr.toString().padStart(2, '0')}:00`, x, liqY + liqH + 12);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The handoff isn\u2019t the session \u2014 it\u2019s the exchange between desks. Price discovery lives there.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// GAME DATA — 5 rounds testing Sessions+ interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'You open a BTC 5-minute chart at 11:30 GMT. The Sessions+ dashboard shows: Session = LONDON, Verdict = &ldquo;Strong Bullish &mdash; Trending&rdquo;, Killzone = NY AM (highlighted), ADR Used = 42%. Price is mid-range within the London box. What is the most professional interpretation?',
    options: [
      { text: 'Enter long immediately — the verdict says bullish', correct: false, explain: 'The verdict is a SYNTHESIS output, not an entry signal. It describes the session state. The professional interpretation is that London has built a strong bullish bias that continues into NY AM. With 42% of ADR used, the session has 58% of its range left &mdash; room to extend. But an entry still requires structural context (order blocks, key level rejection, etc). The verdict confirms the environment is favourable for longs; it does not tell you WHERE to enter.' },
      { text: 'The environment favours longs (strong bullish verdict, trending regime, NY AM killzone active, ADR has room to extend). Wait for a structural pullback to a higher-timeframe level before entering, using the verdict as a bias filter rather than a trigger.', correct: true, explain: 'Exactly right. Sessions+ is diagnostic: it tells you WHAT the market is doing, not where to click buy. The verdict + killzone + ADR-room combination paints a favourable environment. Your actual entry still comes from structure (CIPHER, PHANTOM, or a manual SMC read). This is how diagnostic indicators work in a real trading workflow.' },
    ],
  },
  {
    scenario: 'The Sessions+ dashboard shows DNA Match = 73% to past sessions that leaned bearish. But the current session is showing a bullish verdict. What does this conflict tell you?',
    options: [
      { text: 'The DNA is wrong — ignore it and follow the verdict', correct: false, explain: 'Neither component is &ldquo;wrong.&rdquo; The verdict reflects CURRENT bias (price action now). The DNA is a HISTORICAL PATTERN MATCH (this session looks like sessions that historically faded). The conflict is information: the current tape is bullish but the fingerprint suggests sessions like this often reverse. A professional reduces size and tightens stops when these conflict, because the conflict means the session is at higher-than-average reversal risk.' },
      { text: 'The conflict is valuable intel: current bias is bullish, but the DNA fingerprint says sessions like this often reverse. Treat it as a heightened reversal-risk warning &mdash; reduce size, tighten stops, or wait for the DNA resolution. Do not dismiss either signal.', correct: true, explain: 'Correct. The ATLAS philosophy rewards honest uncertainty. When two layers disagree, the right response is to acknowledge the disagreement in your risk parameters, not to override one with the other. This is why Sessions+ surfaces both numbers &mdash; you read them together.' },
    ],
  },
  {
    scenario: 'Silver Bullet AM window just opened (15:00 UTC / 10:00 NY). You see a sharp spike into a previous day high, then immediate rejection back down within 4 bars. What is the Sessions+ interpretation?',
    options: [
      { text: 'Price broke the PDH &mdash; go long on the breakout', correct: false, explain: 'A spike into PDH followed by immediate rejection inside the Silver Bullet window is the textbook pattern the window exists to catch. This is a liquidity grab, not a breakout. The Silver Bullet window is named for its historical reversal probability &mdash; reading this as a &ldquo;breakout&rdquo; is reading the chart without the session intelligence Sessions+ provides.' },
      { text: 'Silver Bullet windows have historically high reversal probability. A sharp spike into PDH followed by immediate rejection IS the classic pattern &mdash; a liquidity grab before the reversal. Look for a short entry on retest, not a long on breakout.', correct: true, explain: 'Exactly. The Silver Bullet window exists because institutional order flow frequently reverses in this 60-minute window. Combined with a level sweep (PDH grab), this is one of the highest-probability setups Sessions+ is designed to surface. Reading it as a breakout inverts the signal entirely.' },
    ],
  },
  {
    scenario: 'Sessions+ dashboard shows Regime = DEAD, Killzone = (none), ADR Used = 8%, current time 04:30 UTC. You want to trade. What is the correct response?',
    options: [
      { text: 'The dead regime with 8% ADR and no active killzone means the market is in a no-trade zone. Wait for London open (07:00 UTC) where volatility, killzone alignment, and verdict will become actionable. Trading dead zones is a losing proposition on this instrument.', correct: true, explain: 'Correct. Sessions+ is diagnostic precisely so it can tell you HONESTLY when there is nothing to trade. 04:30 UTC is the quiet window between Asian close and London open &mdash; no institutional flow, no meaningful range. The professional response is to wait. Forcing trades in dead zones is one of the most common retail failure modes, and the Sessions+ dashboard exists specifically to warn you against it.' },
      { text: 'Find a scalp &mdash; there is always a trade somewhere', correct: false, explain: 'This is the mindset Sessions+ was built to correct. &ldquo;Always a trade&rdquo; is retail mythology; in reality, institutional flow dominates markets, and when institutions are not active (Asian close → London open), retail scalping fights the natural grain of the market. The dashboard is telling you the truth: no edge here.' },
    ],
  },
  {
    scenario: 'You are looking at the Sessions+ level system and notice that the current price just broke above PHH (previous hour high) but is still below PDH (previous day high). Based on the hierarchy logic, what is the correct read?',
    options: [
      { text: 'Price broke PHH = immediate buy signal', correct: false, explain: 'PHH is a MICRO level (1 hour timeframe). The Sessions+ hierarchy is deliberate: PHH matters for intraday scalping, but PDH matters for session-level directional plays. Breaking PHH does not override the fact that price is still below PDH &mdash; the higher-timeframe resistance. Treating a PHH break as a standalone signal ignores the hierarchy the tool is built around.' },
      { text: 'PHH break is a micro-level intraday signal confirming short-term momentum, but the true directional resistance is PDH (still above price). Treat the PHH break as scalp-grade confirmation, not a session-trade signal. A session-grade long would need PDH to be broken too.', correct: true, explain: 'Correct. The Sessions+ level hierarchy (PHH → PDH → PWH → PMH → PQH) is a magnifying glass: each level corresponds to a different trade duration. Intraday scalpers live on PHH. Session traders live on PDH. Swing traders live on PWH. Reading them as equally weighted breaks is reading the tool wrong. Match the level to your trade duration.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The three primary trading sessions in the Sessions+ architecture (UTC) are:', opts: ['Tokyo 00:00-08:00, London 08:00-16:00, NY 16:00-24:00', 'Asian 20:00-04:00, London 07:00-16:00, New York 13:00-22:00', 'Sydney, Frankfurt, Chicago', 'Pre-market, Market, After-hours'], correct: 1, explain: 'Sessions+ defaults: Asian 20:00-04:00 UTC (Sydney open through Tokyo close), London 07:00-16:00 UTC, NY 13:00-22:00 UTC. The LDN-NY overlap is 13:00-16:00 UTC &mdash; the highest-volume window of the day.' },
  { q: 'The Silver Bullet AM window corresponds to:', opts: ['The first hour of Asian session', 'A 60-minute window at 15:00-16:00 UTC (10:00-11:00 NY time) with historically high reversal probability', 'The weekly open', 'The final hour before NY close'], correct: 1, explain: 'Silver Bullet AM is the ICT concept that 10:00-11:00 NY time has an unusually high institutional reversal rate. Sessions+ highlights this window so traders can apply tighter criteria inside it &mdash; sweeps of liquidity during Silver Bullet often precede reversals.' },
  { q: 'The Sessions+ level hierarchy (micro to macro) is:', opts: ['PDH/PDL → PWH/PWL → PMH/PML → PQH/PQL → PHH/PHL', 'All levels are equal priority', 'PHH/PHL → PDH/PDL → PWH/PWL → PMH/PML → PQH/PQL', 'Only PDH/PDL matter'], correct: 2, explain: 'Previous Hour → Previous Day → Previous Week → Previous Month → Previous Quarter. Match the level to your trade duration: PHH for scalping, PDH for session trading, PWH for swing, PMH/PQH for macro positioning.' },
  { q: 'The Power of 3 (PO3) framework in Sessions+ identifies which three phases?', opts: ['Open, Mid, Close', 'Accumulation, Manipulation, Distribution', 'Morning, Afternoon, Evening', 'Buy, Hold, Sell'], correct: 1, explain: 'Accumulation (range building), Manipulation (false break / liquidity grab), Distribution (true directional expansion). The framework describes institutional delivery: price typically ranges, sweeps liquidity in one direction, then delivers in the OPPOSITE direction.' },
  { q: 'The Session DNA Predictor works by:', opts: ['Predicting tomorrow&apos;s price using astrology', 'Fingerprinting the current session&apos;s characteristics (range percentile, efficiency, timing, close position, direction) and finding historical sessions with similar DNA to estimate likely outcomes', 'Randomly generating a directional call', 'Copying CIPHER PRO&apos;s signals'], correct: 1, explain: 'Each session generates a DNA fingerprint: 6 metrics (range %ile, efficiency, time-high, time-low, close-pos, direction). The predictor finds past sessions with similar fingerprints and surfaces the historical outcome rate. It is pattern-matching, not prophecy.' },
  { q: 'The four regime states in Sessions+ are:', opts: ['Bull, Bear, Flat, Reverse', 'Trending, Ranging, Volatile, Dead', 'Expansion, Compression, Drift, Chaos', 'Open, Mid, Late, Closed'], correct: 1, explain: 'TRENDING (high directional, low chop) → RANGING (clear bounds) → VOLATILE (wide swings) → DEAD (compressed, no activity). Each regime calls for a different strategy: trend-following, mean reversion, reduced size, or no trade at all.' },
  { q: 'The Sessions+ Verdict combines which three inputs?', opts: ['Price, volume, RSI', 'Session bias + DNA prediction + current regime', 'Support, resistance, trend', 'Candle color, wick size, body'], correct: 1, explain: 'The Verdict is the synthesis output: bias (directional pressure), DNA (historical pattern match), regime (current market mode). It is displayed in plain English like &ldquo;Leaning Bullish &mdash; Trending&rdquo; so the trader reads a decision, not three numbers.' },
  { q: 'Inter-Session Flow Analysis tells you:', opts: ['The exact next price', 'What percentage of the time a session&apos;s direction historically predicts the next session&apos;s direction (e.g., Asian bull → London bull continuation rate)', 'Volume per session', 'Which indicator to use'], correct: 1, explain: 'Inter-Session Flow tracks cross-session correlation: does Asian direction predict London? Does London predict NY? The output is a historical continuation rate (e.g., 58%) for the current session pair. It is a probability, not a prediction.' },
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
export default function SessionsPlusDeepDiveLesson() {
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
    { wrong: 'Trading every session the same way', right: 'Each session has distinct institutional flow. Asian is range-bound (accumulation). London Open is the highest-volatility reversal window. NY AM is continuation OR reversal depending on LDN direction. The Sessions+ regime classifier exists so you adapt, not blanket-trade.', icon: '🕐' },
    { wrong: 'Treating PHH and PQH as equivalent signals', right: 'They are on completely different timeframes. PHH matters for 5-minute scalping. PQH matters for macro swing positioning. The Sessions+ level hierarchy is a magnifying-glass system &mdash; match your level to your trade duration.', icon: '📏' },
    { wrong: 'Ignoring the Regime cell and only reading the Verdict', right: 'A &ldquo;Strong Bullish&rdquo; verdict in a TRENDING regime is very different from the same verdict in a VOLATILE regime. Same verdict, wildly different position sizing and stop distance. The regime tells you HOW TO TRADE the verdict.', icon: '🎯' },
    { wrong: 'Force-trading dead zones (Asian close → London open)', right: 'Sessions+ is diagnostic, which means it honestly tells you when there is nothing to trade. When the dashboard shows Regime = DEAD, Killzone = none, ADR Used < 10%, the professional response is to wait. Forcing trades in dead zones is one of the top retail failure modes.', icon: '💤' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 2</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Sessions+<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Deep Dive</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The most comprehensive session intelligence tool ever built for TradingView. Three sessions. Five killzones. Silver Bullet windows. Power of 3. Session DNA. Verdict synthesis. All free.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Retail Trader&apos;s Time Blindness</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most retail traders treat the market as a single, continuous thing. A chart is a chart. Price is price. But institutional traders see <strong className="text-amber-400">three completely different markets in a 24-hour cycle</strong> &mdash; Asian, London, and New York &mdash; each with its own personality, participants, and playbook.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The same setup that wins 70% of the time during London Open loses 55% of the time during Asian close. The same indicator that works brilliantly in the LDN-NY overlap becomes noise during the 4:00 UTC dead zone. <strong className="text-white">Time is a variable institutions exploit and retail ignores.</strong></p>
            <p className="text-gray-400 leading-relaxed">Sessions+ exists to close that gap. It is the most complete session-intelligence indicator on TradingView, covering 12 distinct analytical systems: session anatomy, killzones, Silver Bullet windows, multi-TF levels, Power of 3, Session DNA, regime classification, verdict synthesis, inter-session flow, ADR integration, anomaly detection, and a 6-view adaptive dashboard. It is also completely free.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; WHY THE FREE GATEWAY MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Sessions+ is the most powerful free indicator Interakktive publishes. It is the gateway to the ATLAS suite &mdash; every concept you learn here (killzones, regimes, DNA, verdict synthesis, the three-pillar dashboard) carries directly into the PRO tier. Master Sessions+ and you have already mastered 40% of how every ATLAS tool thinks.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01: Three Sessions === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Sessions</p>
          <h2 className="text-2xl font-extrabold mb-4">Asian &middot; London &middot; New York</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sessions+ maps every 24-hour cycle into three boxes: <strong className="text-purple-400">Asian (20:00-04:00 UTC)</strong>, <strong className="text-blue-400">London (07:00-16:00 UTC)</strong>, and <strong className="text-orange-400">New York (13:00-22:00 UTC)</strong>. Each session is drawn directly on your chart with its own color, label, and real-time high/low tracking. The watching-time-of-day feature is what makes the rest of the tool possible.</p>
          <ThreeSessionsAnim />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(156,39,176,0.08)', borderColor: 'rgba(156,39,176,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#ce93d8' }}>ASIAN</p>
              <p className="text-[10px] text-gray-400 leading-tight">Range-bound. Typically accumulation phase &mdash; institutions build positions inside a tight range before the London sweep.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(33,150,243,0.08)', borderColor: 'rgba(33,150,243,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#64b5f6' }}>LONDON</p>
              <p className="text-[10px] text-gray-400 leading-tight">Highest-volatility reversal window. Often sweeps Asian range before establishing the real directional move.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,152,0,0.08)', borderColor: 'rgba(255,152,0,0.3)', borderWidth: '1px' }}>
              <p className="text-[11px] font-extrabold mb-1" style={{ color: '#ffb74d' }}>NEW YORK</p>
              <p className="text-[10px] text-gray-400 leading-tight">Either continues London or reverses it. The LDN-NY overlap is the highest-volume window of the day.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02: Overlap === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Overlap</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Volume Concentrates</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Between 13:00-16:00 UTC, both London and New York desks are fully active. This three-hour overlap contains <strong className="text-green-400">the majority of the day&apos;s institutional volume for most forex pairs and indices</strong>. Sessions+ highlights this window explicitly because the same setup inside the overlap has a completely different win rate compared to outside it.</p>
          <OverlapAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Overlap Rule</p>
            <p className="text-sm text-gray-400">If you can only trade for three hours per day, trade the overlap. London desks are positioning for close while NY desks are positioning for open. The collision produces the biggest moves, the cleanest trends, and the highest-probability structural trades of the entire day.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03: Killzones === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Killzones</p>
          <h2 className="text-2xl font-extrabold mb-4">Five High-Probability Windows</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond the broad sessions, Sessions+ identifies <strong className="text-yellow-300">five specific killzone windows</strong> where institutional order flow is historically concentrated: Asian KZ, London Open KZ, NY AM KZ, London Close KZ, and (as a premium subset) the Silver Bullet windows. Each killzone is scored A+ through D based on historical reversal success for <em>your specific instrument</em>.</p>
          <KillzonesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; KZ Effectiveness Scoring</p>
            <p className="text-sm text-gray-400">Not every killzone works equally for every asset. Sessions+ tracks the last 20 killzone events per window and grades them A+ (exceptional reversal success) through D (unreliable for this instrument). You focus your energy on A-graded killzones and skip the D-graded ones entirely. This is personalized session intelligence, not generic time windows.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04: Silver Bullet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Silver Bullet</p>
          <h2 className="text-2xl font-extrabold mb-4">Sixty Minutes of Precision</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The <strong className="text-green-400">Silver Bullet AM window (15:00-16:00 UTC / 10:00-11:00 NY)</strong> and <strong className="text-green-400">PM window (19:00-20:00 UTC / 14:00-15:00 NY)</strong> are two of the most historically reliable reversal windows in institutional trading lore. ICT-derived, but validated empirically across assets. The pattern: a sharp sweep of liquidity followed by reversal within the window.</p>
          <SilverBulletAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Silver Bullet Mental Model</p>
            <p className="text-sm text-gray-400">Inside a Silver Bullet window, treat sharp moves into key levels as likely liquidity grabs, not breakouts. The window exists because institutional desks frequently run final-hour positioning traps during these 60 minutes. A PDH sweep followed by rejection inside Silver Bullet has historically been one of the highest win-rate setups available &mdash; provided you understand the context.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05: Level Hierarchy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Level Hierarchy</p>
          <h2 className="text-2xl font-extrabold mb-4">Micro &rarr; Macro Levels</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sessions+ draws five tiers of institutional levels: <strong className="text-white">PHH/PHL</strong> (previous hour), <strong className="text-white">PDH/PDL</strong> (previous day), <strong className="text-white">PWH/PWL</strong> (previous week), <strong className="text-white">PMH/PML</strong> (previous month), and <strong className="text-white">PQH/PQL</strong> (previous quarter). Each tier corresponds to a different trade duration. The rule: match the level to your hold time.</p>
          <LevelHierarchyAnim />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <p className="text-xs font-extrabold text-sky-400 mb-1">Micro &mdash; PHH, PDH</p>
              <p className="text-[11px] text-gray-400">Intraday scalping and session trading. PHH for 5-15m entries. PDH for 1H-4H sessions.</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-extrabold text-amber-400 mb-1">Macro &mdash; PWH, PMH, PQH</p>
              <p className="text-[11px] text-gray-400">Swing and position trading. PWH for weekly swings. PMH/PQH for macro positioning against central bank cycles.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06: Session VWAP === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Session VWAP</p>
          <h2 className="text-2xl font-extrabold mb-4">The Institutional Benchmark</h2>
          <p className="text-gray-400 leading-relaxed mb-6">VWAP &mdash; Volume-Weighted Average Price &mdash; is the single most-watched line on institutional trading desks. Algo executions benchmark against it. Fund managers grade their entries against it. Sessions+ calculates VWAP <strong className="text-white">per session</strong>, so you see exactly where the institutional benchmark resets each time a new session begins. The ±1σ and ±2σ bands give you dynamic overextension zones.</p>
          <VWAPBandsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; How To Read VWAP</p>
            <p className="text-sm text-gray-400">Price above VWAP = buyers in control this session. Price below = sellers in control. Price at ±2σ band = overextension (probability of mean-reversion increases). VWAP crossing mid-session = conviction shift. Institutional desks DO watch this &mdash; so now you do too.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07: Power of 3 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Power of 3</p>
          <h2 className="text-2xl font-extrabold mb-4">Accumulation &middot; Manipulation &middot; Distribution</h2>
          <p className="text-gray-400 leading-relaxed mb-6">ICT&apos;s Power of 3 framework describes how institutional price delivery happens in three phases: <strong className="text-blue-400">Accumulation</strong> (range building inside a tight box), <strong className="text-orange-400">Manipulation</strong> (a sharp fake move that grabs liquidity outside the range), and <strong className="text-green-400">Distribution</strong> (the true directional expansion, usually OPPOSITE to the manipulation direction). Sessions+ detects and labels these phases live.</p>
          <PowerOfThreeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The PO3 Read</p>
            <p className="text-sm text-gray-400">When Sessions+ labels a manipulation phase, the correct response is NOT to chase the fake move &mdash; it is to prepare for the reversal. Accumulation → Manipulation → Distribution is a three-beat rhythm. If you see the first two beats on your chart, you already know the direction of the third. This is the framework CIPHER PRO uses internally to build its Signal Autopsy.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08: DNA Predictor === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Session DNA</p>
          <h2 className="text-2xl font-extrabold mb-4">The Fingerprint Predictor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every completed session leaves a <strong className="text-amber-400">DNA fingerprint</strong>: six metrics (range percentile, efficiency, time of high, time of low, close position, direction). The DNA Predictor scans the last 20 sessions and finds historical sessions with the most similar fingerprint to the current one. It then shows you what those similar sessions <em>historically did next</em>. Pattern-matching against the market&apos;s own history &mdash; non-repainting, fully transparent.</p>
          <DNAPredictorAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; What DNA Is Not</p>
            <p className="text-sm text-gray-400">The DNA Predictor is NOT prophecy. A &ldquo;73% bullish match&rdquo; does not mean price will go up &mdash; it means 73% of historical sessions with this fingerprint leaned bullish afterwards. Sample size matters (the 20-session window is deliberately small to stay relevant to the current regime). Use DNA as a probability weight, not a deterministic call.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09: Regime === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Regime Classification</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Market Modes</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sessions+ classifies the current session into one of four regimes: <strong className="text-teal-400">TRENDING</strong> (high directional, low chop), <strong className="text-amber-400">RANGING</strong> (clear bounds, low slope), <strong className="text-red-400">VOLATILE</strong> (wide swings, whippy), and <strong className="text-gray-400">DEAD</strong> (compressed, no activity). The regime cell is the single most underrated part of the dashboard &mdash; it tells you HOW to trade, not just WHICH direction.</p>
          <RegimeClassificationAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Regime &rarr; Strategy Mapping</p>
            <p className="text-sm text-gray-400">TRENDING → trend-follow, wider stops, hold winners. RANGING → fade extremes, tight stops, quick profits. VOLATILE → reduce size, accept worse R:R, expect whipsaws. DEAD → do not trade. The Sessions+ regime classifier exists so you CHANGE your approach based on the session, not fight against it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10: Verdict === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Verdict</p>
          <h2 className="text-2xl font-extrabold mb-4">Bias + DNA + Regime = One Answer</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The <strong className="text-amber-400">Verdict</strong> is the synthesis output &mdash; a plain-English call that combines session bias, DNA prediction, and regime classification into a single line. It reads like: &ldquo;<em>Leaning Bullish &mdash; Trending</em>&rdquo; or &ldquo;<em>Strong Bearish &mdash; Volatile</em>.&rdquo; Under pressure, you read one sentence, not three numbers. This is the narrative engine that defines the ATLAS philosophy, concentrated into a single dashboard cell.</p>
          <VerdictEngineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Seven Verdict States</p>
            <p className="text-sm text-gray-400">Verdict resolves to one of seven core states: Strong Bullish / Leaning Bullish / No Clear Edge / Leaning Bearish / Strong Bearish, each optionally modified by the regime suffix (— Trending / — Ranging / — Volatile / — Dead). Seven sentences cover every possible market state Sessions+ can diagnose. Learn the seven, and you can read any Sessions+ dashboard in under a second.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11: Inter-Session Flow === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Inter-Session Flow</p>
          <h2 className="text-2xl font-extrabold mb-4">Does Asian Predict London?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sessions+ tracks something no other session indicator does: the <strong className="text-white">historical correlation between consecutive sessions</strong>. Does Asian direction predict London? Does London predict NY? For your specific instrument, Sessions+ computes a continuation rate &mdash; e.g., &ldquo;Asian bullish, London continues bullish 62% of the time&rdquo; &mdash; giving you a statistical edge on session-open bias.</p>
          <InterSessionFlowAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Flow Is Instrument-Specific</p>
            <p className="text-sm text-gray-400">EUR/USD and XAU/USD have completely different inter-session flow patterns. BTC/USDT (24/7) has weaker session flow than forex majors (24/5). Sessions+ computes flow for THIS instrument based on THIS instrument&apos;s history &mdash; no generic rules. That personalization is why the same indicator works on forex, crypto, and indices.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12: Dashboard Views === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Dashboard Intelligence</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Views, One Tool</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sessions+ offers <strong className="text-amber-400">six dashboard view modes</strong>: Off, Minimal, Status, Trade, Analytics, Full. Minimal shows Session + Verdict (the two most important cells). Status adds Killzone and ADR. Trade adds PO3, Regime, and Score. Analytics adds DNA, Flow, and Efficiency. Full adds Anomaly detection and upcoming Silver Bullet countdown. Match the view to your style &mdash; scalpers use Minimal, session traders use Trade, analysts use Full.</p>
          <DashboardViewsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Start With Minimal</p>
            <p className="text-sm text-gray-400">New to Sessions+? Start with Minimal view. Two cells: Session + Verdict. Learn to read those under pressure before expanding. Once the Verdict is intuitive, upgrade to Status (adds Killzone + ADR). Most session traders never need to go beyond Trade view. Analytics and Full are for research and post-trade review, not live trading decisions.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13: Liquidity Handoff Principle (★ GROUNDBREAKING) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Liquidity Handoff Principle &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Sessions Are a Relay Race, Not a Calendar</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most traders read sessions as time windows on a clock &mdash; Asia opens, Asia closes, London opens, London closes. That framing is accurate but it misses the actual mechanism. Sessions are <strong className="text-white">institutional liquidity handoffs</strong>. When London opens, it doesn&apos;t just start &mdash; <strong className="text-white">Asian desks hand the book to London desks</strong>. When NY opens, London hands to NY. The &ldquo;session&rdquo; is the window during which a specific regional set of institutional desks holds the inventory and defines the agenda.</p>
          <LiquidityHandoffAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127942; The Handoff Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">The highest-conviction price discovery happens at the <strong className="text-white">handoffs</strong>, not at session midpoints. The LDN-NY overlap (13:00-16:00 UTC) is when both regional desks are simultaneously holding the book, re-pricing inventory for their clients, and respecting or rejecting each other&apos;s levels. That&apos;s why it&apos;s the highest-volume window of the entire 24-hour cycle &mdash; not because of some arbitrary calendar coincidence, but because two teams of institutional agents are literally exchanging the responsibility for price discovery. The Asia-London gap (04:00-07:00 UTC) is the inverse: nobody is holding the book. That&apos;s why it becomes a drifting dead zone where stop hunts and fake breakouts dominate &mdash; the institutional machinery that enforces structure is offline.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three implications you can trade on:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Respect the overlap more than the open.</strong> The LDN-NY overlap produces cleaner structure than the NY open alone because two desks are present. Same logic: the Asia-London transition is weaker than either session in isolation.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Treat dead zones as hostile.</strong> 04:00-07:00 UTC and the late-NY fade (20:00-22:00 UTC) are zones where institutional enforcement is weak. Setups that work there need extra confirmation because the statistical edge of &ldquo;price respects structure&rdquo; drops when the enforcers aren&apos;t present.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Read session transitions as information, not noise.</strong> When London opens and immediately reverses the Asian range, that&apos;s the London desk rejecting Asia&apos;s pricing &mdash; a real signal. When London opens and extends Asia&apos;s direction, that&apos;s the London desk <em>confirming</em> Asia&apos;s pricing. Both are rich information, not random volatility.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S14: Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse Sessions+</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Even with the most complete free session tool ever built, traders find ways to sabotage themselves. These four mistakes account for nearly every Sessions+ support conversation.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">Sessions+ In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Sessions (UTC)</p>
                <p className="text-sm text-gray-300">Asian 20:00-04:00 · London 07:00-16:00 · NY 13:00-22:00. LDN-NY overlap 13:00-16:00 = highest volume.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Killzones</p>
                <p className="text-sm text-gray-300">Asian KZ 00:00-04:00, LDN Open 07:00-10:00, NY AM 12:00-15:00, LDN Close 15:00-17:00. Silver Bullet AM 15:00-16:00, PM 19:00-20:00.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Level Hierarchy</p>
                <p className="text-sm text-gray-300">PHH/PHL (1h) → PDH/PDL (daily) → PWH/PWL (weekly) → PMH/PML (monthly) → PQH/PQL (quarterly). Match level to trade duration.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Power of 3</p>
                <p className="text-sm text-gray-300">Accumulation (range) → Manipulation (fake-out sweep) → Distribution (true direction, usually opposite to manipulation).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Four Regimes</p>
                <p className="text-sm text-gray-300">TRENDING · RANGING · VOLATILE · DEAD. Each demands a different strategy. The regime is HOW; the verdict is WHAT.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Verdict States</p>
                <p className="text-sm text-gray-300">Strong Bullish / Leaning Bullish / No Clear Edge / Leaning Bearish / Strong Bearish + regime suffix. Seven sentences cover every session state.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Dashboard Views</p>
                <p className="text-sm text-gray-300">Off · Minimal (Session + Verdict) · Status · Trade · Analytics · Full. Start at Minimal, upgrade as you grow.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15: Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading Sessions+ In The Real World</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each tests whether you can read the Sessions+ dashboard the way a session-aware trader reads it &mdash; synthesizing multiple layers into a professional decision rather than hunting arrows.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read Sessions+ like a session-aware professional. The diagnostic mindset has stuck.' : gameScore >= 3 ? 'Solid read. Revisit the hierarchy and regime sections before the quiz.' : 'Re-study the verdict, DNA, and hierarchy sections before the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S16: Quiz + Certificate === */}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🕐</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Sessions+ Deep Dive</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Session Intelligence Operator &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.2-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
