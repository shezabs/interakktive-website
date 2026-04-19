// app/academy/lesson/market-efficiency-ratio-deep-dive/page.tsx
// ATLAS Academy — Lesson 10.10: Market Efficiency Ratio Deep Dive [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// PHASE 1: scaffold + 4 animations (Net vs Path, Ratio, Zones, Path-Displacement)
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
// ANIMATION 1: Net Displacement vs Path Length (side by side)
// Same start/end, different paths, animated
// ============================================================
function NetVsPathAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Two Measurements \u2014 Net Move vs Total Path', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 22); ctx.lineTo(mid, h - 8); ctx.stroke();

    // LEFT: Net displacement visualization
    const padLL = 30;
    const padLR = mid - 15;
    const chartT = 40;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NET DISPLACEMENT', (padLL + padLR) / 2, 34);

    // Start and end points
    const sx = padLL + 10;
    const sy = chartB - 20;
    const ex = padLR - 10;
    const ey = chartT + 30;

    // Straight line from start to end
    ctx.strokeStyle = 'rgba(38,166,154,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    // Dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('start (close[14])', sx + 8, sy + 3);
    ctx.fillText('end (close)', ex - 42, ey - 5);

    // Distance label
    const distX = (sx + ex) / 2;
    const distY = (sy + ey) / 2;
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.save();
    const angle = Math.atan2(ey - sy, ex - sx);
    ctx.translate(distX, distY - 8);
    ctx.rotate(angle);
    ctx.fillText('|close \u2212 close[14]|', 0, 0);
    ctx.restore();

    ctx.fillStyle = 'rgba(38,166,154,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('the straight-line distance', (padLL + padLR) / 2, chartB + 6);

    // RIGHT: Path length with animated walking
    const padRL = mid + 15;
    const padRR = w - 30;

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PATH LENGTH', (padRL + padRR) / 2, 34);

    // Same start and end
    const sx2 = padRL + 10;
    const sy2 = chartB - 20;
    const ex2 = padRR - 10;
    const ey2 = chartT + 30;

    // Draw a zigzag path that reaches the same endpoints
    const n = 14;
    const pts: { x: number; y: number }[] = [{ x: sx2, y: sy2 }];
    for (let i = 1; i < n; i++) {
      const prog = i / (n - 1);
      const baseX = sx2 + (ex2 - sx2) * prog;
      const baseY = sy2 + (ey2 - sy2) * prog;
      const wobble = Math.sin(i * 2.1 + t) * 18 + Math.cos(i * 1.7 + t) * 10;
      pts.push({ x: baseX, y: baseY + wobble });
    }
    pts.push({ x: ex2, y: ey2 });

    // Draw the path
    ctx.strokeStyle = 'rgba(239,83,80,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // Draw each segment as a small arrow-tipped line
    pts.slice(1).forEach((p, i) => {
      const prev = pts[i];
      ctx.fillStyle = 'rgba(239,83,80,0.5)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    });

    // Start/end dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(sx2, sy2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('start (close[14])', sx2 + 8, sy2 + 3);
    ctx.fillText('end (close)', ex2 - 42, ey2 - 5);

    // Sum label centered
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u03A3 |close[i] \u2212 close[i+1]|', (padRL + padRR) / 2, chartT + 14);

    ctx.fillStyle = 'rgba(239,83,80,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('sum of every bar-to-bar step', (padRL + padRR) / 2, chartB + 6);

    // Bottom annotation across both panels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same two endpoints. Very different distances traveled.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: The Ratio — dividing net by path, bounded [0,1]
// ============================================================
function RatioCalculationAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Ratio \u2014 MER = Net Displacement / Path Length', w / 2, 14);

    // Formula display
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText('MER = |close \u2212 close[14]| / \u03A3|close[i] \u2212 close[i+1]|', w / 2, 34);

    // Three example scenarios
    const examples = [
      { label: 'STRAIGHT LINE', net: 10, path: 10, color: '#26A69A' },
      { label: 'MODERATE', net: 10, path: 20, color: '#8A8A8A' },
      { label: 'HEAVY CHOP', net: 10, path: 50, color: '#EF5350' },
    ];

    const pW = (w - 40) / 3;
    const pY = 50;
    const pH = h - 68;
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

      // Visualize the ratio with stacked bars
      const barY = pY + 28;
      const barH = 16;
      const maxPath = 60;
      const pathW = (ex.path / maxPath) * (pW - 20);
      const netW = (ex.net / maxPath) * (pW - 20);

      // Path bar (full)
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, barY, pW - 20, barH);
      ctx.fillStyle = ex.color + '44';
      ctx.fillRect(x + 10, barY, pathW, barH);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`path = ${ex.path}`, x + 12, barY + 11);

      // Net bar (subset)
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 10, barY + barH + 6, pW - 20, barH);
      ctx.fillStyle = ex.color;
      ctx.fillRect(x + 10, barY + barH + 6, netW, barH);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '6px system-ui';
      ctx.fillText(`net = ${ex.net}`, x + 12, barY + barH + 17);

      // The ratio calculation
      const ratio = ex.net / ex.path;
      const pulse = 0.9 + Math.sin(t * 2 + i) * 0.1;

      // Big ratio number
      ctx.fillStyle = ex.color;
      ctx.font = `bold ${18 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText((ratio * 100).toFixed(0), x + pW / 2, pY + pH - 22);

      // /100 label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(`${(ratio * 100).toFixed(0)}/100 efficiency`, x + pW / 2, pY + pH - 8);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Ratio is bounded [0, 1] by construction \u2014 net cannot exceed path', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: The Three Zones — teal/grey/magenta bands
// ============================================================
function ThreeZonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Three Zones \u2014 Efficient, Mid, Inefficient', w / 2, 14);

    const padL = 35;
    const padR = w - 20;
    const xR = padR - padL;
    const chartT = 32;
    const chartB = h - 34;
    const chartH = chartB - chartT;

    // Zones with filled backgrounds
    const highY = chartT + chartH * 0.3; // 70
    const lowY = chartT + chartH * 0.7;  // 30

    // High zone (teal fill)
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(padL, chartT, xR, highY - chartT);
    // Mid zone (no fill)
    // Low zone (magenta fill)
    ctx.fillStyle = 'rgba(239,83,80,0.08)';
    ctx.fillRect(padL, lowY, xR, chartB - lowY);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, chartT, xR, chartH);

    // Reference bands
    ctx.strokeStyle = 'rgba(138,138,138,0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(padL, highY); ctx.lineTo(padR, highY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowY); ctx.lineTo(padR, lowY); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(138,138,138,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('70 \u2014 High Efficiency', padL + 4, highY - 3);
    ctx.fillText('30 \u2014 Low Efficiency', padL + 4, lowY - 3);

    // Axis ticks on right
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('100', padR - 2, chartT + 8);
    ctx.fillText('50', padR - 2, chartT + chartH / 2 + 3);
    ctx.fillText('0', padR - 2, chartB - 2);

    // Zone text overlays
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('EFFICIENT (trends)', padR - 12, chartT + 20);
    ctx.fillStyle = 'rgba(138,138,138,0.7)';
    ctx.fillText('MIXED', padR - 12, chartT + chartH / 2);
    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.fillText('CHOP (ranges)', padR - 12, chartB - 12);

    // Animated MER line cycling through zones
    const n = 60;
    const step = xR / (n - 1);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < n; i++) {
      const x = padL + i * step;
      // Create a slow cycling pattern through zones
      const cycle = (i / n + t * 0.05) * Math.PI * 2;
      const base = 50 + Math.sin(cycle) * 35;
      const eff = base + Math.sin(i * 0.25 + t) * 5;
      const y = chartT + chartH - (eff / 100) * chartH;

      // Color segments based on zone
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevCycle = ((i - 1) / n + t * 0.05) * Math.PI * 2;
        const prevEff = 50 + Math.sin(prevCycle) * 35 + Math.sin((i - 1) * 0.25 + t) * 5;
        let color = '#8A8A8A';
        if (eff >= 70) color = '#26A69A';
        else if (eff < 30) color = '#EF5350';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(padL + (i - 1) * step, chartT + chartH - (prevEff / 100) * chartH);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Color of the MER line indicates the current zone at a glance', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 4: THE PATH-DISPLACEMENT PRINCIPLE (★ GROUNDBREAKING)
// Same start/end, wildly different paths, dramatically different MER
// ============================================================
function PathDisplacementAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.006;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Path-Displacement Principle \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Same start, same end \u2014 three very different MER readings', w / 2, 28);

    // Three panels side by side
    const pW = (w - 40) / 3;
    const pY = 40;
    const pH = h - 68;
    const gap = 8;

    const panels = [
      { label: 'TRENDING', color: '#26A69A', mer: 95, pathMult: 1.05 },
      { label: 'MIXED', color: '#8A8A8A', mer: 50, pathMult: 2.0 },
      { label: 'CHOP', color: '#EF5350', mer: 12, pathMult: 8.5 },
    ];

    panels.forEach((p, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = p.color + '10';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = p.color + '66';
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = p.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, x + pW / 2, pY + 14);

      // Draw path from bottom-left to top-right
      const sx = x + 18;
      const sy = pY + pH - 48;
      const ex = x + pW - 18;
      const ey = pY + 40;

      // Straight line (net displacement) - background
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);

      // Path that reaches same endpoints
      const n = 24;
      const pts: { x: number; y: number }[] = [];
      pts.push({ x: sx, y: sy });
      for (let j = 1; j < n; j++) {
        const prog = j / (n - 1);
        const baseX = sx + (ex - sx) * prog;
        const baseY = sy + (ey - sy) * prog;
        // Wobble amplitude proportional to pathMult
        const amp = (p.pathMult - 1) * 8;
        const wobble = Math.sin(j * 0.9 + t * (i === 0 ? 0.5 : i === 1 ? 1.2 : 2.5)) * amp;
        const wobble2 = i === 2 ? Math.cos(j * 1.5 + t * 2) * amp * 0.8 : 0;
        pts.push({ x: baseX + wobble2, y: baseY + wobble });
      }
      pts.push({ x: ex, y: ey });

      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      pts.forEach((pt, j) => { j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
      ctx.stroke();

      // Start/end dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();

      // MER value
      const pulse = 0.9 + Math.sin(t * 3 + i) * 0.1;
      ctx.fillStyle = p.color;
      ctx.font = `bold ${18 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(`${p.mer}`, x + pW / 2, pY + pH - 22);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui';
      ctx.fillText('MER', x + pW / 2, pY + pH - 8);
    });

    // Footer annotation
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Net displacement identical. Path length dramatically different. MER \u2014 only indicator that sees this.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 5: Chop Cost — distance that didn't count
// ============================================================
function ChopCostAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Chop Cost \u2014 The Distance That Didn\'t Count', w / 2, 14);

    // Formula
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText('chopCost = pathLen \u2212 netMove', w / 2, 32);

    const padL = 40;
    const padR = w - 20;
    const xR = padR - padL;
    const chartT = 52;
    const chartB = h - 30;
    const chartH = chartB - chartT;

    // Split the chart into 3 visual regions: net (bottom green), chop (middle red), empty (top gray)
    // Use a filling bar chart conceptually

    // Show: path as a tall bar, net as the portion that produced result, chop as the wasted portion
    const barX = padL + xR * 0.2;
    const barW = xR * 0.15;

    // Total path
    const pathH = chartH - 20;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(barX, chartT + 10, barW, pathH);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(barX, chartT + 10, barW, pathH);

    // Animate the ratio
    const cycleRatio = 0.3 + Math.sin(t) * 0.35 + 0.35; // 0.3 to 0.65 then back
    const netRatio = Math.max(0.15, Math.min(0.85, cycleRatio));
    const chopRatio = 1 - netRatio;

    // Net portion (bottom, teal)
    const netH = pathH * netRatio;
    ctx.fillStyle = 'rgba(38,166,154,0.85)';
    ctx.fillRect(barX, chartT + 10 + pathH - netH, barW, netH);

    // Chop portion (top, red)
    const chopH = pathH * chopRatio;
    ctx.fillStyle = 'rgba(239,83,80,0.75)';
    ctx.fillRect(barX, chartT + 10, barW, chopH);

    // Divider line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(barX, chartT + 10 + chopH);
    ctx.lineTo(barX + barW, chartT + 10 + chopH);
    ctx.stroke();

    // Labels for bar segments
    ctx.fillStyle = 'rgba(239,83,80,0.95)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CHOP COST', barX + barW + 12, chartT + 10 + chopH * 0.5 + 3);
    ctx.fillStyle = 'rgba(239,83,80,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText(`${(chopRatio * 100).toFixed(0)}% of movement`, barX + barW + 12, chartT + 10 + chopH * 0.5 + 14);
    ctx.fillText('didn\'t contribute to net', barX + barW + 12, chartT + 10 + chopH * 0.5 + 23);

    ctx.fillStyle = 'rgba(38,166,154,0.95)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('NET MOVE', barX + barW + 12, chartT + 10 + chopH + netH * 0.5 + 3);
    ctx.fillStyle = 'rgba(38,166,154,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText(`${(netRatio * 100).toFixed(0)}% produced`, barX + barW + 12, chartT + 10 + chopH + netH * 0.5 + 14);
    ctx.fillText('actual displacement', barX + barW + 12, chartT + 10 + chopH + netH * 0.5 + 23);

    // MER value
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`MER = ${(netRatio * 100).toFixed(0)}`, padR - 10, chartB - 8);

    // PATH label on top
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL PATH', barX + barW / 2, chartT + 8);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 6: The 14-Bar Lookback — tuning sensitivity
// ============================================================
function LookbackTuningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Lookback Length \u2014 Short vs Long Window', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const xR = padR - padL;
    const chartT = 30;
    const chartB = h - 10;

    // Top: price line with two different lookback windows highlighted
    const pH = (chartB - chartT) * 0.45;
    const p1Y = chartT;
    const p1B = p1Y + pH;

    const n = 70;
    const xStep = xR / (n - 1);

    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      // Mix of trend + noise
      const trend = i < 20 ? 0 : (i - 20) * 0.5;
      const noise = Math.sin(i * 0.5 + t) * 2 + Math.cos(i * 0.8 + t * 0.7) * 1.5;
      prices.push(100 + trend + noise);
    }

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1B - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 14);

    // Windows
    const idxNow = n - 3;
    const shortLen = 7;
    const longLen = 21;

    // Short window highlight
    const shortX1 = padL + (idxNow - shortLen) * xStep;
    const shortX2 = padL + idxNow * xStep;
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.fillRect(shortX1, p1Y, shortX2 - shortX1, pH);
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(shortX1, p1Y + 2, shortX2 - shortX1, pH - 4);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`len=${shortLen}`, (shortX1 + shortX2) / 2, p1Y + 9);

    // Long window highlight
    const longX1 = padL + (idxNow - longLen) * xStep;
    ctx.strokeStyle = 'rgba(66,165,245,0.6)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(longX1, p1Y + 2, shortX2 - longX1, pH - 4);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(66,165,245,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText(`len=${longLen}`, (longX1 + shortX1) / 2, p1B - 4);

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Bottom: two MER readings
    const p2T = p1B + 12;
    const p2B = chartB;
    const p2H = p2B - p2T;
    const mid2 = (p2T + p2B) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2T, xR, p2H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2T, xR, p2H);

    // Simulated MER values
    // Short-len MER is more reactive (swings wider)
    // Long-len MER is smoother
    const merShort: number[] = [];
    const merLong: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 7) { merShort.push(50); continue; }
      // Compute approximate MER
      const net = Math.abs(prices[i] - prices[Math.max(0, i - shortLen)]);
      let path = 0;
      for (let j = 0; j < shortLen; j++) path += Math.abs(prices[i - j] - prices[Math.max(0, i - j - 1)]);
      merShort.push(path > 0 ? (net / path) * 100 : 50);
    }
    for (let i = 0; i < n; i++) {
      if (i < 21) { merLong.push(50); continue; }
      const net = Math.abs(prices[i] - prices[Math.max(0, i - longLen)]);
      let path = 0;
      for (let j = 0; j < longLen; j++) path += Math.abs(prices[i - j] - prices[Math.max(0, i - j - 1)]);
      merLong.push(path > 0 ? (net / path) * 100 : 50);
    }

    // Plot short
    ctx.strokeStyle = 'rgba(255,179,0,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    merShort.forEach((v, i) => {
      const x = padL + i * xStep;
      const y = p2B - (v / 100) * p2H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Plot long
    ctx.strokeStyle = 'rgba(66,165,245,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    merLong.forEach((v, i) => {
      const x = padL + i * xStep;
      const y = p2B - (v / 100) * p2H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2014 short (reactive)', padL + 4, p2T + 10);
    ctx.fillStyle = 'rgba(66,165,245,0.85)';
    ctx.fillText('\u2014 long (smooth)', padL + 88, p2T + 10);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 7: EMA Smoothing — raw MER vs smoothed MER
// ============================================================
function SmoothingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EMA Smoothing \u2014 Reduce Jaggedness Without Losing Signal', w / 2, 14);

    const padL = 35;
    const padR = w - 15;
    const xR = padR - padL;
    const chartT = 30;
    const chartB = h - 24;
    const chartH = chartB - chartT;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, chartT, xR, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, chartT, xR, chartH);

    // Reference bands
    const highY = chartT + chartH * 0.3;
    const lowY = chartT + chartH * 0.7;
    ctx.strokeStyle = 'rgba(138,138,138,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padL, highY); ctx.lineTo(padR, highY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowY); ctx.lineTo(padR, lowY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(138,138,138,0.7)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('70', padR - 3, highY - 2);
    ctx.fillText('30', padR - 3, lowY - 2);

    const n = 60;
    const xStep = xR / (n - 1);

    // Generate raw MER with noise
    const raw: number[] = [];
    for (let i = 0; i < n; i++) {
      const base = 40 + Math.sin(i * 0.15 + t * 0.2) * 25;
      const noise = (Math.sin(i * 1.5 + t) + Math.cos(i * 2.1 + t * 0.9)) * 10;
      raw.push(Math.max(0, Math.min(100, base + noise)));
    }

    // EMA smooth (len 5)
    const alpha = 2 / (5 + 1);
    const smooth: number[] = [raw[0]];
    for (let i = 1; i < n; i++) smooth.push(alpha * raw[i] + (1 - alpha) * smooth[i - 1]);

    // Draw raw (faded)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    raw.forEach((v, i) => {
      const x = padL + i * xStep;
      const y = chartB - (v / 100) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw smoothed (bold, colored by zone)
    for (let i = 1; i < n; i++) {
      const x1 = padL + (i - 1) * xStep;
      const y1 = chartB - (smooth[i - 1] / 100) * chartH;
      const x2 = padL + i * xStep;
      const y2 = chartB - (smooth[i] / 100) * chartH;
      let color = '#8A8A8A';
      if (smooth[i] >= 70) color = '#26A69A';
      else if (smooth[i] < 30) color = '#EF5350';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2014 raw MER', padL + 4, chartT + 12);
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('\u2014 EMA(5) smoothed (zone-colored)', padL + 60, chartT + 12);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EMA(5) default. Longer = smoother but more lag. Shorter = reactive but jagged.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: Trend vs Chop Regime — as intrinsic detector
// ============================================================
function TrendChopRegimeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER as Regime Detector \u2014 Trend vs Chop', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const xR = padR - padL;
    const chartT = 26;
    const chartB = h - 34;
    const chartH = chartB - chartT;

    const pH = (chartH - 8) / 2;
    const p1Y = chartT;
    const p1B = p1Y + pH;
    const p2Y = p1B + 8;
    const p2B = chartB;
    const p2H = p2B - p2Y;

    const n = 70;
    const xStep = xR / (n - 1);

    // Price: trend phase, then chop phase, then trend
    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 18) prices.push(100 + i * 0.15 + Math.sin(i + t) * 0.15); // trend up
      else if (i < 48) prices.push(102.7 + Math.sin(i * 0.5 + t) * 1.5 + Math.cos(i * 0.8 + t) * 1); // chop
      else prices.push(102.7 + (i - 48) * 0.2 + Math.sin(i + t) * 0.2); // trend up again
    }
    const pMin = Math.min(...prices) - 0.5;
    const pMax = Math.max(...prices) + 0.5;
    const toY1 = (v: number) => p1B - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 14);

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p1Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p1Y, xR, pH);

    // Phase shading
    ctx.fillStyle = 'rgba(38,166,154,0.05)';
    ctx.fillRect(padL, p1Y, 18 * xStep, pH);
    ctx.fillStyle = 'rgba(239,83,80,0.05)';
    ctx.fillRect(padL + 18 * xStep, p1Y, 30 * xStep, pH);
    ctx.fillStyle = 'rgba(38,166,154,0.05)';
    ctx.fillRect(padL + 48 * xStep, p1Y, (n - 48) * xStep, pH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE', padL + 4, p1Y + 10);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Phase labels
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TREND', padL + 9 * xStep, p1Y + 18);
    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.fillText('CHOP', padL + 33 * xStep, p1Y + 18);
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('TREND', padL + 59 * xStep, p1Y + 18);

    // MER pane
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, p2H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, p2H);

    // Reference bands
    const highY2 = p2Y + p2H * 0.3;
    const lowY2 = p2Y + p2H * 0.7;
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(padL, p2Y, xR, highY2 - p2Y);
    ctx.fillStyle = 'rgba(239,83,80,0.08)';
    ctx.fillRect(padL, lowY2, xR, p2B - lowY2);

    ctx.strokeStyle = 'rgba(138,138,138,0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padL, highY2); ctx.lineTo(padR, highY2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowY2); ctx.lineTo(padR, lowY2); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('MER', padL + 4, p2Y + 10);

    // Compute MER along the series
    const merArr: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 14) { merArr.push(50); continue; }
      const net = Math.abs(prices[i] - prices[Math.max(0, i - 14)]);
      let path = 0;
      for (let j = 0; j < 14; j++) path += Math.abs(prices[i - j] - prices[Math.max(0, i - j - 1)]);
      merArr.push(path > 0 ? (net / path) * 100 : 50);
    }

    // Draw MER colored by zone
    for (let i = 1; i < n; i++) {
      const x1 = padL + (i - 1) * xStep;
      const y1 = p2B - (merArr[i - 1] / 100) * (p2H - 14) - 4;
      const x2 = padL + i * xStep;
      const y2 = p2B - (merArr[i] / 100) * (p2H - 14) - 4;
      let color = '#8A8A8A';
      if (merArr[i] >= 70) color = '#26A69A';
      else if (merArr[i] < 30) color = '#EF5350';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // Bottom annotation
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER diagnoses regime by geometry alone \u2014 no trend line, no indicator cross, no lag', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: MER as Strategy Filter — trend-follow veto, mean-rev enabler
// ============================================================
function StrategyFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER as Strategy Filter', w / 2, 14);

    // Two symmetric panels — trend-follow and mean-revert — each showing when MER says GO vs STOP
    const pW = (w - 30) / 2;
    const pY = 32;
    const pH = h - 48;

    // LEFT: TREND-FOLLOW
    const x1 = 10;
    ctx.fillStyle = 'rgba(38,166,154,0.05)';
    ctx.fillRect(x1, pY, pW, pH);
    ctx.strokeStyle = 'rgba(38,166,154,0.4)';
    ctx.strokeRect(x1, pY, pW, pH);

    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TREND-FOLLOW', x1 + pW / 2, pY + 14);

    // Green/red cells showing when to trade based on MER zones
    const labels = ['MER \u2265 70', 'MER 30-70', 'MER < 30'];
    const verdicts = ['GO', 'CAUTION', 'VETO'];
    const colors = ['#26A69A', '#8A8A8A', '#EF5350'];

    labels.forEach((lbl, i) => {
      const cellY = pY + 32 + i * 30;
      ctx.fillStyle = colors[i] + '15';
      ctx.fillRect(x1 + 12, cellY, pW - 24, 24);
      ctx.strokeStyle = colors[i] + '44';
      ctx.strokeRect(x1 + 12, cellY, pW - 24, 24);

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(lbl, x1 + 18, cellY + 14);

      const pulse = (i === 0 ? 1 + Math.sin(t * 3) * 0.15 : 1);
      ctx.fillStyle = colors[i];
      ctx.font = `bold ${10 * pulse}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText(verdicts[i], x1 + pW - 18, cellY + 15);
    });

    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('needs directional efficiency', x1 + pW / 2, pY + pH - 8);

    // RIGHT: MEAN-REVERT
    const x2 = w - 10 - pW;
    ctx.fillStyle = 'rgba(239,83,80,0.05)';
    ctx.fillRect(x2, pY, pW, pH);
    ctx.strokeStyle = 'rgba(239,83,80,0.4)';
    ctx.strokeRect(x2, pY, pW, pH);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MEAN-REVERT', x2 + pW / 2, pY + 14);

    // Reverse verdicts
    const verdicts2 = ['VETO', 'CAUTION', 'GO'];
    const colors2 = ['#EF5350', '#8A8A8A', '#26A69A'];

    labels.forEach((lbl, i) => {
      const cellY = pY + 32 + i * 30;
      ctx.fillStyle = colors2[i] + '15';
      ctx.fillRect(x2 + 12, cellY, pW - 24, 24);
      ctx.strokeStyle = colors2[i] + '44';
      ctx.strokeRect(x2 + 12, cellY, pW - 24, 24);

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(lbl, x2 + 18, cellY + 14);

      const pulse = (i === 2 ? 1 + Math.sin(t * 3 + 1) * 0.15 : 1);
      ctx.fillStyle = colors2[i];
      ctx.font = `bold ${10 * pulse}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText(verdicts2[i], x2 + pW - 18, cellY + 15);
    });

    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('thrives on chop and rotation', x2 + pW / 2, pY + pH - 8);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same MER reading. Opposite strategy verdicts.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 10: MER × MSI × MPR 4-pane confluence
// ============================================================
function ConfluenceStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER \u00d7 MSI \u00d7 MPR \u2014 Three Diagnostic Axes', w / 2, 14);

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
      if (i < 18) prices.push(100 + Math.sin(i * 0.3 + t) * 0.4);
      else if (i < 35) prices.push(100 + (i - 18) * 0.18 + Math.sin(i + t) * 0.3);
      else prices.push(103 + Math.sin(i * 0.4 + t) * 0.5);
    }
    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY1 = (v: number) => p1Y + pH - 4 - ((v - pMin) / (pMax - pMin)) * (pH - 14);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY1(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // PANE 2: MER
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p2Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p2Y, xR, pH);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MER (efficiency)', padL + 4, p2Y + 10);

    const highY = p2Y + pH * 0.3;
    const lowY = p2Y + pH * 0.7;
    ctx.strokeStyle = 'rgba(138,138,138,0.3)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padL, highY); ctx.lineTo(padR, highY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowY); ctx.lineTo(padR, lowY); ctx.stroke();
    ctx.setLineDash([]);

    // MER series: low during pane1 chop, high during trend
    const merVals: number[] = [];
    for (let i = 0; i < n; i++) {
      let v = 50;
      if (i < 18) v = 22 + Math.sin(i + t) * 5;
      else if (i < 35) v = 78 + Math.sin(i + t) * 5;
      else v = 40 + Math.sin(i + t) * 5;
      merVals.push(v);
    }

    for (let i = 1; i < n; i++) {
      const x1 = padL + (i - 1) * xStep;
      const y1 = p2Y + pH - 4 - (merVals[i - 1] / 100) * (pH - 14);
      const x2 = padL + i * xStep;
      const y2 = p2Y + pH - 4 - (merVals[i] / 100) * (pH - 14);
      let color = '#8A8A8A';
      if (merVals[i] >= 70) color = '#26A69A';
      else if (merVals[i] < 30) color = '#EF5350';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // PANE 3: MSI
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p3Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p3Y, xR, pH);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MSI (regime)', padL + 4, p3Y + 10);

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let c = '#5F6B7A';
      if (i < 18) c = '#5F6B7A';
      else if (i < 35) c = '#3A8F6B';
      else c = '#C28B2C';
      ctx.fillStyle = c;
      ctx.fillRect(x, p3Y + pH - 14, xStep - 1, 10);
    }

    // PANE 4: MPR
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padL, p4Y, xR, pH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, p4Y, xR, pH);
    ctx.fillStyle = '#EC407A';
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('MPR (pressure)', padL + 4, p4Y + 10);

    const midY4 = p4Y + pH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(padL, midY4); ctx.lineTo(padR, midY4); ctx.stroke();

    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      let v = 0; let c = '#8A8A8A';
      if (i < 18) { v = -14 + Math.sin(i + t) * 4; c = '#8A8A8A'; }
      else if (i < 35) { v = 22 + Math.sin(i + t) * 3; c = '#26A69A'; }
      else { v = 4 + Math.sin(i + t) * 3; c = '#F9A825'; }
      const barY = v >= 0 ? midY4 - (v / 40) * (pH / 2 - 3) : midY4;
      const barH = Math.abs(v / 40) * (pH / 2 - 3);
      ctx.fillStyle = c;
      ctx.fillRect(x + 0.5, barY, xStep - 1, barH);
    }

    // Confluence band
    const confX1 = padL + 20 * xStep;
    const confX2 = padL + 34 * xStep;
    ctx.fillStyle = 'rgba(245,158,11,0.04)';
    ctx.fillRect(confX1, p1Y, confX2 - confX1, p4Y + pH - p1Y);

    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(confX1, p1Y); ctx.lineTo(confX1, p4Y + pH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(confX2, p1Y); ctx.lineTo(confX2, p4Y + pH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CLEAN TREND', (confX1 + confX2) / 2, p1Y - 2);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 11: MER Across Asset Classes
// ============================================================
function AssetClassAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER Across Asset Classes \u2014 Typical Cadence', w / 2, 14);

    const classes = [
      { label: 'CRYPTO', color: '#F59E0B', avg: 55, range: 25 },
      { label: 'EQUITIES', color: '#0ea5e9', avg: 45, range: 20 },
      { label: 'FX MAJORS', color: '#22C55E', avg: 35, range: 15 },
    ];

    const pW = (w - 40) / 3;
    const pY = 30;
    const pH = h - 50;
    const gap = 8;

    classes.forEach((cls, i) => {
      const x = 15 + i * (pW + gap);

      ctx.fillStyle = cls.color + '08';
      ctx.fillRect(x, pY, pW, pH);
      ctx.strokeStyle = cls.color + '55';
      ctx.strokeRect(x, pY, pW, pH);

      ctx.fillStyle = cls.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(cls.label, x + pW / 2, pY + 14);

      // Draw a mini MER chart
      const chartT = pY + 22;
      const chartB = pY + pH - 34;
      const chartH = chartB - chartT;
      const chartL = x + 14;
      const chartR = x + pW - 14;
      const chartW = chartR - chartL;

      // Bands
      const highY = chartT + chartH * 0.3;
      const lowY = chartT + chartH * 0.7;
      ctx.fillStyle = 'rgba(38,166,154,0.06)';
      ctx.fillRect(chartL, chartT, chartW, highY - chartT);
      ctx.fillStyle = 'rgba(239,83,80,0.06)';
      ctx.fillRect(chartL, lowY, chartW, chartB - lowY);

      ctx.strokeStyle = 'rgba(138,138,138,0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(chartL, highY); ctx.lineTo(chartR, highY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(chartL, lowY); ctx.lineTo(chartR, lowY); ctx.stroke();
      ctx.setLineDash([]);

      // Generate a MER line specific to the asset class
      const n = 36;
      const xStep = chartW / (n - 1);
      for (let j = 1; j < n; j++) {
        const x1 = chartL + (j - 1) * xStep;
        const x2 = chartL + j * xStep;
        const phase = j * 0.3 + t + i * 1.5;
        const v1 = cls.avg + Math.sin(phase) * cls.range + Math.sin(phase * 2) * 5;
        const v2 = cls.avg + Math.sin(phase + 0.3) * cls.range + Math.sin(phase * 2 + 0.3) * 5;
        const y1 = chartB - (v1 / 100) * chartH;
        const y2 = chartB - (v2 / 100) * chartH;
        let color = '#8A8A8A';
        if (v2 >= 70) color = '#26A69A';
        else if (v2 < 30) color = '#EF5350';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // Footer text
      ctx.fillStyle = cls.color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`avg \u2248 ${cls.avg}`, x + pW / 2, pY + pH - 22);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui';
      const notes = ['clean breakouts', 'balanced', 'chop-prone'];
      ctx.fillText(notes[i], x + pW / 2, pY + pH - 10);
    });
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 12: Intraday MER Patterns (time-of-day)
// ============================================================
function IntradayPatternAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Intraday MER Pattern \u2014 Typical US Equity Session', w / 2, 14);

    const padL = 40;
    const padR = w - 20;
    const xR = padR - padL;
    const chartT = 32;
    const chartB = h - 38;
    const chartH = chartB - chartT;

    // Bands
    const highY = chartT + chartH * 0.3;
    const lowY = chartT + chartH * 0.7;

    ctx.fillStyle = 'rgba(38,166,154,0.06)';
    ctx.fillRect(padL, chartT, xR, highY - chartT);
    ctx.fillStyle = 'rgba(239,83,80,0.06)';
    ctx.fillRect(padL, lowY, xR, chartB - lowY);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, chartT, xR, chartH);

    ctx.strokeStyle = 'rgba(138,138,138,0.5)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(padL, highY); ctx.lineTo(padR, highY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowY); ctx.lineTo(padR, lowY); ctx.stroke();
    ctx.setLineDash([]);

    // Time-of-day MER pattern:
    // 9:30-10:00 opening: low (discovery chop)
    // 10:00-11:30 morning trend: high
    // 11:30-14:00 lunch chop: low
    // 14:00-15:30 afternoon trend: high
    // 15:30-16:00 closing: mid-high
    const n = 80;
    const xStep = xR / (n - 1);

    const tod = (i: number) => {
      const prog = i / (n - 1); // 0 to 1 across session
      if (prog < 0.1) return 20; // opening chop
      if (prog < 0.35) return 72; // morning trend
      if (prog < 0.62) return 25; // lunch chop
      if (prog < 0.88) return 70; // afternoon trend
      return 55; // close drift
    };

    // Draw filled MER area
    for (let i = 1; i < n; i++) {
      const x1 = padL + (i - 1) * xStep;
      const x2 = padL + i * xStep;
      const v1 = tod(i - 1) + Math.sin(i * 0.6 + t) * 4;
      const v2 = tod(i) + Math.sin((i - 1) * 0.6 + t) * 4;
      const y1 = chartB - (v1 / 100) * chartH;
      const y2 = chartB - (v2 / 100) * chartH;
      let color = '#8A8A8A';
      if (v2 >= 70) color = '#26A69A';
      else if (v2 < 30) color = '#EF5350';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // Time labels at bottom
    const times = [
      { pos: 0.05, label: '9:30' },
      { pos: 0.22, label: '10:30' },
      { pos: 0.47, label: '12:00' },
      { pos: 0.72, label: '14:30' },
      { pos: 0.95, label: '16:00' },
    ];

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    times.forEach(tm => {
      const x = padL + tm.pos * xR;
      ctx.fillText(tm.label, x, chartB + 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 2]);
      ctx.beginPath(); ctx.moveTo(x, chartT); ctx.lineTo(x, chartB); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Phase labels
    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN', padL + 0.05 * xR, chartT - 3);
    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.fillText('MORNING TREND', padL + 0.22 * xR, chartT - 3);
    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.fillText('LUNCH', padL + 0.47 * xR, chartT - 3);
    ctx.fillStyle = 'rgba(38,166,154,0.8)';
    ctx.fillText('AFTERNOON TREND', padL + 0.72 * xR, chartT - 3);

    // Y ticks
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('70', padL - 3, highY + 2);
    ctx.fillText('30', padL - 3, lowY + 2);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Intraday MER has recognizable phases \u2014 time your entries to the efficient windows', w / 2, h - 5);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME DATA — 5 rounds testing MER interpretation
// ============================================================
const gameRounds = [
  {
    scenario: 'You look at a stock and see ATR is elevated (volatility expanding), volume is above average, and price has travelled a huge range over the last 14 bars. <strong>MER reads 11</strong>. What does MER tell you that the other readings didn\u2019t?',
    options: [
      { text: 'All that movement was chop. Net displacement over 14 bars is tiny despite massive path length. The market is busy but going nowhere \u2014 89% of the distance travelled didn\u2019t contribute to any net move. ATR and volume confirm activity; MER confirms that the activity is inefficient. Don\u2019t confuse motion with progress.', correct: true, explain: 'Exactly right. This is the Path-Displacement Principle in action. ATR and volume are scalar measurements at bars \u2014 they tell you the market is active but not whether the activity is productive. MER measures the geometry of the path: a lot of travel, very little net. In trading terms, trend strategies in this environment will die to chop; mean-reversion strategies will thrive in it. MER is the only indicator that makes this distinction visible.' },
      { text: 'Nothing \u2014 just confirms the volatility', correct: false, explain: 'MER tells you something the other readings cannot: the price path is geometrically inefficient. High volatility with high MER = trending expansion (good for trend-follow). High volatility with low MER = violent chop (good for mean-rev, terrible for trend). The distinction matters a lot.' },
    ],
  },
  {
    scenario: 'You\u2019re running a <strong>mean-reversion strategy</strong> on EURUSD and considering entry signals. <strong>MER reads 18</strong>. Should you use this as a green light, veto, or caution?',
    options: [
      { text: 'Green light for mean-reversion. MER < 30 = range/chop regime. The price is oscillating inefficiently, which is exactly the environment where rotation strategies thrive. The chop cost that kills trend-followers is what feeds mean-reversion P&L. Trade with appropriate sizing and respect the other oscillators, but geometrically the regime is favorable.', correct: true, explain: 'This is the most important application of MER: it\u2019s a symmetric filter that points opposite directions for trend vs mean-rev systems. Where MER < 30 vetoes trend entries, it enables mean-rev entries. A disciplined trader uses MER as a regime gate \u2014 running different playbooks in different MER zones. Trying to force a trend-follow setup at MER=18 will produce consistent losses; running a mean-rev setup at MER=85 will miss all the opportunity.' },
      { text: 'Veto all trading', correct: false, explain: 'MER at 18 is unfavorable for trend-follow but FAVORABLE for mean-reversion. Vetoing all trading ignores the strategy you\u2019re actually running. The key insight is that low MER is symmetric \u2014 bad for one type of strategy, good for another.' },
    ],
  },
  {
    scenario: 'You\u2019re considering two equities. <strong>Ticker A</strong>: MER=72 and rising. <strong>Ticker B</strong>: MER=15 and falling. Both are showing bullish MPR readings. Which is the higher-quality trend setup?',
    options: [
      { text: 'Ticker A. Rising MER means the geometric efficiency is improving \u2014 price is travelling less path to cover the same ground. Combined with bullish MPR, this is the cleanest possible trend environment. Ticker B\u2019s bullish MPR is happening in a chop-dominated regime where even if the pressure is real, the path efficiency is so low that trend entries will be repeatedly stopped out by retracements.', correct: true, explain: 'Correct. This is how MER stacks with the other oscillators. MPR measures pressure; MER measures whether pressure converts to net movement. Rising MER + bullish MPR = pressure is producing clean travel. Bullish MPR in low MER = pressure exists but the path is too chaotic to capture. Quality of the trend environment is an AND of both signals, not an OR. When they disagree, MER wins for position sizing \u2014 never override a low-MER veto with other bullish readings.' },
      { text: 'Ticker B \u2014 low MER means more opportunity', correct: false, explain: 'Low MER doesn\u2019t mean more opportunity for trend-follow; it means the trend environment is broken. Low MER kills trend strategies via repeated stop-outs even when the direction is correct. If you want to play Ticker B, switch to a mean-rev playbook, not a trend-follow one.' },
    ],
  },
  {
    scenario: 'You\u2019re day-trading SPY 1m. It\u2019s 12:15pm and MER has been sub-30 for two hours. What\u2019s the professional interpretation?',
    options: [
      { text: 'You\u2019re in the lunch-hour chop phase \u2014 a well-known intraday MER pattern on US equities. The environment is geometrically inefficient by time-of-day design, not by any particular fundamental driver. Professional response: tighten criteria or stand aside until 2pm when the afternoon trend phase typically begins and MER often reinflates. Don\u2019t try to force trend trades through the lunch chop.', correct: true, explain: 'Intraday MER has recognizable patterns on equity indices: open chop (9:30-10:00), morning trend (10:00-11:30), lunch chop (11:30-14:00), afternoon trend (14:00-15:30), close drift (15:30-16:00). The lunch phase is a well-documented time-of-day effect driven by reduced institutional participation. Trading trend setups through it is systematically unprofitable \u2014 even with otherwise good signals \u2014 because the path is too chaotic to capture. Professionals either switch to a chop playbook or stand aside.' },
      { text: 'Something is fundamentally wrong \u2014 reduce risk globally', correct: false, explain: 'Nothing fundamental is wrong \u2014 this is just the normal intraday rhythm of equity markets. MER makes a time-of-day effect visible that most traders miss. Rather than panicking, recognize the pattern and time your entries accordingly.' },
    ],
  },
  {
    scenario: 'You lower the lookback length from 14 to 5. MER values become much more volatile and swing wildly between zones. Why?',
    options: [
      { text: 'Shorter lookback = more reactive MER. With only 5 bars in the window, each individual bar has 3x the relative weight. Single-bar moves that barely register in a 14-bar window dominate a 5-bar window. The indicator becomes sensitive to micro-noise. Useful for very short-timeframe scalping where you WANT high sensitivity; harmful for swing traders who need the longer-window signal stability.', correct: true, explain: 'Correct. Lookback length directly controls responsiveness vs stability. len=5 gives you an MER that reacts to almost every bar; len=14 gives you the default balance; len=30+ gives you a very slow, smooth MER that only confirms regime shifts after they\u2019re well established. Match the lookback to your trading timeframe: shorter timeframes can use shorter lookbacks; longer timeframes need longer lookbacks to filter noise. The smoothLen EMA is an additional filter on top of whatever lookback you choose.' },
      { text: 'The indicator is broken with short lookbacks', correct: false, explain: 'Not broken \u2014 working exactly as designed. Shorter lookbacks produce more reactive output by construction. This is a tuning choice, not a bug. The question is whether the reactivity matches your trading timeframe.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'Market Efficiency Ratio (MER) is calculated as:', opts: ['Price divided by volume', 'Net displacement |close - close[14]| divided by path length \u2014 the sum of absolute bar-to-bar changes over the lookback window', 'ATR divided by price', 'Volume ratio over 14 bars'], correct: 1, explain: 'Exact Pine source: netMove = |close - close[len]|, pathLen = sum of |close[i] - close[i+1]| for i from 0 to len-2, MER = netMove / pathLen. The ratio is bounded [0, 1] because path length cannot be less than net displacement.' },
  { q: 'The Path-Displacement Principle states that:', opts: ['Prices follow a random walk', 'Price action is a geometric object \u2014 a path with a length, not just a sequence of scalar measurements \u2014 and the shape of that path contains more information than any single measurement at any bar', 'Displacement predicts direction', 'Paths always follow Fibonacci ratios'], correct: 1, explain: 'MER is the only indicator in the ATLAS suite that treats price as a geometric object. Every other indicator reduces price action to scalar events at bars (close, high, volume, ATR). MER asks: for all the distance price travelled, how much of it contributed to net movement? This is a fundamentally different question than any other oscillator answers.' },
  { q: 'MER values are bounded in the range:', opts: ['-100 to +100', '[0, 1] raw, or [0, 100] scaled \u2014 bounded by construction because net displacement cannot exceed path length', 'Unbounded', '-1 to +1'], correct: 1, explain: 'By the triangle inequality, the straight-line distance between two points cannot exceed the total length of any path between them. MER = net/path is therefore mathematically bounded on [0, 1]. The indicator offers display as [0, 1] or [0, 100].' },
  { q: 'MER reading 70+ (teal zone) means:', opts: ['Price is at a high', 'High geometric efficiency \u2014 clean, directional movement \u2014 trending regime', 'Overbought', 'Volume expanded'], correct: 1, explain: 'MER \u2265 70 means net displacement is a high fraction of path length \u2014 price is travelling in a relatively straight line. This is the signature of a trending market. Color convention: teal = efficient, magenta = inefficient, grey = mid.' },
  { q: 'MER reading below 30 (magenta zone) means:', opts: ['Weak price action', 'Low geometric efficiency \u2014 chop/range regime \u2014 most of the travelled path did not contribute to net displacement', 'Sell signal', 'Negative momentum'], correct: 1, explain: 'MER < 30 means path length is much larger than net displacement \u2014 price is oscillating without meaningful net travel. This is the signature of a range/chop market. Most of the movement is chop cost \u2014 wasted distance that didn\u2019t contribute to progress.' },
  { q: 'For a TREND-FOLLOWING strategy, MER < 30 should:', opts: ['Trigger more aggressive entries', 'Veto entries \u2014 the environment is geometrically unfavorable and trend entries will be repeatedly stopped out by retracements', 'Be ignored', 'Flip the strategy bias'], correct: 1, explain: 'This is the most important operational use of MER. Trend-follow systems require directional efficiency; low MER kills them via repeated stop-outs. Using MER < 30 as a hard veto on trend entries is one of the simplest and most effective regime filters available.' },
  { q: 'For a MEAN-REVERSION strategy, MER < 30 should:', opts: ['Veto entries', 'Act as a GREEN LIGHT \u2014 rotation/range strategies thrive in low-efficiency regimes where the chop cost that kills trend-followers feeds mean-reversion P&L', 'Be treated the same as trend-follow', 'Reduce position size'], correct: 1, explain: 'MER is a symmetric filter: opposite regime verdicts for opposite strategy types. Low MER vetoes trend, enables mean-rev. High MER enables trend, vetoes mean-rev. The disciplined trader runs different playbooks in different MER zones rather than forcing one strategy into all environments.' },
  { q: 'The default MER lookback length in the Pine source is:', opts: ['5 bars', '14 bars, with EMA(5) smoothing applied by default', '20 bars', '50 bars'], correct: 1, explain: 'Exact Pine source: len = input.int(14, ...) and smoothLen = input.int(5, ...) with useSmoothing = true by default. The 14-bar window provides the standard balance between responsiveness and stability. Shorter lookbacks make MER reactive; longer lookbacks make it stable but laggy. Match to your trading timeframe.' },
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
export default function MERDeepDiveLesson() {
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
    { wrong: 'Treating MER as a direction signal', right: 'MER is DIRECTIONLESS by construction \u2014 it uses |close - close[14]|, absolute value. A powerful uptrend and a powerful downtrend produce identical MER values. MER tells you whether the move is efficient, not which way it\u2019s going. Direction comes from MPR, MSI, or price action. Never use MER as a bullish/bearish indicator.', icon: '\u{1F9ED}' },
    { wrong: 'Assuming high volatility implies high MER', right: 'These are independent. A market can be wildly volatile AND inefficient (violent chop) or quietly trending AND highly efficient. High ATR says nothing about path efficiency. The Path-Displacement Principle exists precisely because these are separate measurements. Check both.', icon: '\u{1F4CA}' },
    { wrong: 'Using the same MER playbook for trend and mean-rev', right: 'MER is a SYMMETRIC filter: low MER vetoes trend but ENABLES mean-rev; high MER enables trend but VETOES mean-rev. The disciplined response is to run DIFFERENT STRATEGIES IN DIFFERENT ZONES, not one strategy across all zones. This is where MER pays for itself \u2014 it tells you which playbook to run.', icon: '\u{1F3AF}' },
    { wrong: 'Ignoring the intraday MER pattern on equities', right: 'US equity indices have a textbook intraday MER cycle: open chop \u2192 morning trend \u2192 lunch chop \u2192 afternoon trend \u2192 close drift. Trading trend setups through the lunch chop (11:30-14:00) is systematically unprofitable even when signals look good. Respect the time-of-day geometry.', icon: '\u{23F1}' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 10</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Market Efficiency<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Ratio</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The geometric oscillator. Not a measurement at any bar — a measurement of the shape of the path itself. The difference between travelling and progressing, finally quantified.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Simplest Oscillator in the Suite. And the Deepest.</p>
            <p className="text-gray-400 leading-relaxed mb-4">MER is the shortest Pine script in the ATLAS oscillator family. A few dozen lines. One calculation. One plotted line. No state classifier, no persistence contract, no event markers, no 4-pane logic. It’s stripped down to a single question and a single answer.</p>
            <p className="text-gray-400 leading-relaxed mb-4">And yet conceptually it’s the indicator that operates on the highest level of abstraction. Every other oscillator in the suite — MAE, MSI, MAZ, MPG, MPR, VSI, ERD — measures <strong className="text-white">scalar properties at individual bars</strong>. They reduce price to close, high, volume, range, momentum. None of them care about the <em>shape</em> of the path between bars. Price could walk five times the distance to reach the same destination, and none of those indicators would notice.</p>
            <p className="text-gray-400 leading-relaxed">MER is the only indicator that treats price action as a <strong className="text-amber-400">geometric object</strong>. It asks: for all the distance price travelled in the last 14 bars, how much of it produced net movement? The answer is a single number between 0 and 100 that tells you more about trading regime than any trend line, moving-average cross, or ADX reading ever could. Because it measures something none of them can see.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE MER AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Motion is not progress. A chart that’s moving is not necessarily going anywhere. MER is the instrument that quantifies this distinction with a single number.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Two Measurements</p>
          <h2 className="text-2xl font-extrabold mb-4">Net Displacement and Path Length</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The entire indicator rests on two geometric quantities. <strong className="text-white">Net displacement</strong> is the straight-line distance from where price was 14 bars ago to where it is now — one subtraction, absolute value. <strong className="text-white">Path length</strong> is the total distance price actually walked, summed bar by bar, every move counted. Same two endpoints can have wildly different path lengths depending on how the path zig-zagged between them.</p>
          <NetVsPathAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Triangle Inequality</p>
            <p className="text-sm text-gray-400">A mathematical guarantee: the straight-line distance between two points is always less than or equal to the total length of any path connecting them. Path length ≥ net displacement, always. This is why MER is bounded on [0, 1] by construction — it cannot be larger than 1 because path cannot be smaller than net.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Ratio</p>
          <h2 className="text-2xl font-extrabold mb-4">Net Divided By Path</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Divide net displacement by path length and you get the <strong className="text-white">Market Efficiency Ratio</strong>. If price walks in a perfectly straight line from A to B, net equals path, and MER equals 1.0 (or 100 on the 0-100 scale). If price walks an enormous zig-zag from A to B, net stays the same but path becomes large, pushing MER toward 0. The ratio is a geometric efficiency score — how straight was the walk?</p>
          <RatioCalculationAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why This Is Profound</p>
            <p className="text-sm text-gray-400">This simple ratio captures something no other indicator can. ATR measures range per bar. Volume measures participation. RSI measures momentum. NONE of them care about whether the movement is net-productive. A market can have high ATR, high volume, strong momentum, and yet be going absolutely nowhere. MER is the indicator that exposes this hidden inefficiency with a single number.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Three Zones</p>
          <h2 className="text-2xl font-extrabold mb-4">Teal / Grey / Magenta</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The output line is colored by zone. <strong className="text-white">≥ 70 = TEAL (efficient)</strong> — trending regime. <strong className="text-white">30–70 = GREY (mixed)</strong> — transitional or moderately efficient. <strong className="text-white">&lt; 30 = MAGENTA (inefficient)</strong> — chop or range regime. The thresholds are tunable via inputs, but 70/30 are calibrated for broad asset cross-compatibility and mirror the upper/lower quartiles of typical MER distributions.</p>
          <ThreeZonesAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Why 70/30 Specifically</p>
            <p className="text-sm text-gray-400">Across a large cross-section of instruments and timeframes, MER distributions tend to spend about 70% of time in the 30-70 mid zone, with 15% each above 70 and below 30. The chosen thresholds roughly match the statistical tails — which means teal and magenta readings are genuinely above or below normal. Adjust the bands if you find your specific instrument systematically clustering differently.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Path-Displacement Principle &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">The Shape of the Path Carries the Signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the conceptual breakthrough. Every other indicator you’ve met — in the ATLAS suite and in retail trading generally — <strong className="text-white">reduces price action to scalar measurements at individual bars</strong>. Close prices, high prices, volumes, ranges, ATRs. None of them preserve information about the shape of the path between measurements. Price could walk 10x the distance to reach the same endpoints, and none of them would be any the wiser.</p>
          <PathDisplacementAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Path-Displacement Principle</p>
            <p className="text-sm text-gray-400 leading-relaxed">The recognition that <strong className="text-white">price action is a geometric object — a path with a length and a shape — and not just a sequence of scalar events</strong>. Two markets with identical closes 14 bars ago and identical closes now can have completely different trading characteristics depending on how price travelled between those endpoints. A straight-line walk at MER ≈ 95 is a trend. A violent zig-zag at MER ≈ 12 is a chop war. Same starting point, same ending point, same ATR, same net change in price. Totally different regime. MER is the only indicator in the suite that treats this distinction as foundational.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Four portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Trend-follow filter.</strong> Trend systems need directional efficiency to work. MER &lt; 30 is a hard veto on new trend entries, regardless of what any other indicator says. The chop cost in a low-MER environment will systematically destroy trend P&L via repeated stop-outs, even when the directional call is correct. Use MER as the first gate: no MER, no trend trade.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Mean-reversion enabler.</strong> The exact opposite symmetry. Range/rotation strategies thrive in chop. MER &lt; 30 is a GREEN LIGHT for mean-reversion entries. The same chop that kills trenders feeds mean-rev P&L. Run DIFFERENT STRATEGIES in DIFFERENT MER ZONES — this is the heart of regime-aware trading.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Cross-instrument ranking.</strong> When scanning a watchlist for trend setups, rank by MER. The ticker with MER=75 and rising is geometrically a better trend candidate than the ticker with MER=20, regardless of their respective MPR or MSI readings. Pressure without efficiency converts to losses; efficiency without pressure doesn’t generate trades. You need both — and MER is the cleanest efficiency filter you have.</li>
              <li><strong className="text-amber-400">4.</strong> <strong className="text-white">Time-of-day awareness.</strong> US equity MER has a textbook intraday pattern — open chop, morning trend, lunch chop, afternoon trend, close drift. Professionals time entries to the efficient windows and stand aside during the chop phases. Knowing your instrument’s intraday MER rhythm is a free edge most retail traders never acquire.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Chop Cost</p>
          <h2 className="text-2xl font-extrabold mb-4">The Distance That Didn&apos;t Count</h2>
          <p className="text-gray-400 leading-relaxed mb-6">An intuitive companion measurement to MER: <code className="text-white">chopCost = pathLen - netMove</code>. This is the distance price walked that did NOT contribute to net displacement — all the zig-zags, retraces, and counter-moves added up. In a straight-line trend, chop cost is near zero. In a perfectly ranged market, chop cost is the vast majority of the path. The Pine source exports this as its own data window value.</p>
          <ChopCostAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Chop Cost Is Money Cost</p>
            <p className="text-sm text-gray-400">Chop cost isn’t just a geometric quantity — it’s a monetary one for most strategy types. Trend-followers PAY for chop cost directly through stopped-out trades. Mean-reverters EARN on chop cost through fade trades. Breakout traders get chopped up by false signals during high-chop phases. Knowing the current chop cost as a percentage of total path is knowing how hostile your specific strategy’s environment is right now.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Lookback Length</p>
          <h2 className="text-2xl font-extrabold mb-4">Tuning Window Size to Timeframe</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The <code className="text-white">len</code> input controls how many bars MER measures over. Default 14. <strong className="text-white">Shorter (5-8)</strong> — highly reactive, catches micro-regime changes, suitable for scalping and very short timeframes. <strong className="text-white">Default (14)</strong> — balanced for general analysis across asset classes. <strong className="text-white">Longer (20-30)</strong> — smooth, slow, confirms regime shifts only after they’re well established, suitable for swing trading and higher timeframes.</p>
          <LookbackTuningAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Match Lookback to Trading Timeframe</p>
            <p className="text-sm text-gray-400">A scalper trading 1m charts and using MER with a 30-bar lookback is getting MER’s view of the last half hour — way too slow. A swing trader on daily charts using MER with 5-bar lookback is getting MER reacting to single-day flips — way too fast. Rough rule: use a lookback that covers about one-third of your average holding period. Adjust from there based on observed MER behavior on your specific instruments.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; EMA Smoothing</p>
          <h2 className="text-2xl font-extrabold mb-4">Reducing Jaggedness Without Losing Signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Raw MER can be jagged bar-to-bar, especially in marginal regimes near the 30/70 thresholds where single-bar movements flip the color. The <code className="text-white">smoothLen</code> input applies an EMA on top of raw MER (default 5). The smoothed line reduces zone-flip noise while preserving the underlying regime signal. Can be disabled via <code className="text-white">useSmoothing=false</code> if you want the raw reactivity.</p>
          <SmoothingAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Smoothing Trade-off</p>
            <p className="text-sm text-gray-400">EMA(5) adds about 3 bars of lag in exchange for significantly fewer zone flips. For most use cases this trade is worth it — the confusion cost of constant color flickering exceeds the lag cost. For alert-driven entries where precision matters, consider disabling smoothing and using raw MER. For visual regime assessment on a chart, smoothing on is the default for a reason.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Regime Detection</p>
          <h2 className="text-2xl font-extrabold mb-4">MER as an Intrinsic Trend-vs-Chop Detector</h2>
          <p className="text-gray-400 leading-relaxed mb-6">MER is arguably the cleanest trend-vs-chop detector available because it measures the defining property of trend (directional efficiency) directly, rather than inferring trend from derived quantities like moving averages or momentum oscillators. There’s no MA cross to wait for, no ADX threshold to cross, no divergence to interpret — just a geometric ratio that goes high when the path is straight and low when the path is chaotic.</p>
          <TrendChopRegimeAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; MER vs ADX</p>
            <p className="text-sm text-gray-400">ADX is the classical trend strength indicator. It measures momentum persistence via smoothed directional movement. The problem: ADX can be elevated during strong bi-directional chop — violent moves in both directions register as &ldquo;strong trend&rdquo; because ADX doesn’t distinguish between directional efficiency and directional magnitude. MER does. An asset can have high ADX and low MER simultaneously (violent chop). MER is the more honest trend detector because it asks the right question.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Strategy Filter</p>
          <h2 className="text-2xl font-extrabold mb-4">The Symmetric Regime Gate</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most important operational use of MER is as a symmetric strategy filter. For <strong className="text-white">trend-following</strong>: MER ≥ 70 = green light, 30-70 = caution, &lt; 30 = VETO. For <strong className="text-white">mean-reversion</strong>: the verdicts are exactly inverted — MER &lt; 30 = green light, 30-70 = caution, ≥ 70 = VETO. Same MER reading, opposite strategy verdicts. The disciplined trader runs DIFFERENT PLAYBOOKS in DIFFERENT MER ZONES rather than forcing one strategy across all regimes.</p>
          <StrategyFilterAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Symmetric Regime Doctrine</p>
            <p className="text-sm text-gray-400">Most retail traders learn one strategy (usually trend-follow via MA crosses) and run it regardless of regime. The result: systematic losses during chop phases. The professional response is regime-aware rotation: trend systems in high MER, mean-rev systems in low MER, reduced activity in the mid zone. This requires having multiple strategies in the toolkit, but the MER gate makes the rotation rule objective. You don’t have to intuit when to switch — MER tells you.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Three Oscillator Axes</p>
          <h2 className="text-2xl font-extrabold mb-4">MER × MSI × MPR</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three genuinely orthogonal oscillator axes. <strong className="text-white">MSI</strong> = regime classification (overall market state). <strong className="text-white">MPR</strong> = directional pressure. <strong className="text-white">MER</strong> = geometric efficiency. A clean-trend setup is the rare case where all three align: MSI in a trend state, MPR in RELEASE with a clear direction, MER above 70 and rising. When all three agree, the environment is actively cooperating with your trade. When they disagree, you’re fighting the regime on at least one axis.</p>
          <ConfluenceStackAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; MER Is the Tiebreaker</p>
            <p className="text-sm text-gray-400">When MSI and MPR disagree on regime (common during transitions), MER is the cleanest tiebreaker because it measures the underlying geometry directly. MSI might be classifying based on lagged signals; MPR might be reacting to transient pressure spikes. MER measures what actually happened to the price path. Use it as the final arbiter when the other oscillators conflict.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Across Asset Classes</p>
          <h2 className="text-2xl font-extrabold mb-4">Typical MER Behavior by Market</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Different asset classes have characteristic MER distributions. <strong className="text-white">Crypto</strong> — high average MER (45-65) with occasional extreme readings in either direction; trends can be very clean and breakouts are often geometrically efficient. <strong className="text-white">Equities</strong> — moderate average MER (40-55); often efficient during trend days, often chop-dominated in range days. <strong className="text-white">FX Majors</strong> — lower average MER (30-45); range-biased by default, true trending phases are the exception. Knowing your asset class’s typical MER distribution helps calibrate expectations.</p>
          <AssetClassAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; No Volume Dependency</p>
            <p className="text-sm text-gray-400">Unlike MPG, ERD, and several other oscillators, MER is purely price-based. No volume input, no reliance on tick volume quality on FX feeds. This makes MER the MOST reliable oscillator on Forex, where volume data quality varies wildly by broker and pair. If you trade Forex extensively, MER earns disproportionate weight in your regime assessment.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Intraday Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">The Time-of-Day MER Cycle</h2>
          <p className="text-gray-400 leading-relaxed mb-6">US equity indices have a textbook intraday MER cycle driven by institutional participation patterns. <strong className="text-white">9:30-10:00 (Open)</strong> — low MER, price discovery chop. <strong className="text-white">10:00-11:30 (Morning trend)</strong> — high MER, institutional positioning. <strong className="text-white">11:30-14:00 (Lunch)</strong> — low MER, reduced volume and chop. <strong className="text-white">14:00-15:30 (Afternoon trend)</strong> — high MER, second institutional window. <strong className="text-white">15:30-16:00 (Close)</strong> — mid-high MER, positioning for close. Professionals time entries to the efficient windows.</p>
          <IntradayPatternAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Lunch Chop Trap</p>
            <p className="text-sm text-gray-400">The single most common intraday MER mistake: trading trend signals generated during the lunch chop (11:30-14:00). Signals during this window often look compelling in isolation but fail to follow through because the geometric environment is hostile to directional strategies. A simple rule: apply your trend strategy only when MER is above 50 AND the current time is in a morning or afternoon trend window. The edge from respecting this alone is often worth more than most entry-refinement tweaks.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Traders Misuse MER</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake stems from a core misunderstanding of what MER measures — usually by confusing geometric efficiency with direction, volatility, or momentum.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">MER In One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Architecture</p>
                <p className="text-sm text-gray-300">Single bounded scalar line in [0, 100]. No state classifier, no histogram, no event markers. The simplest oscillator in the suite.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Formula</p>
                <p className="text-sm text-gray-300">MER = |close - close[14]| / Σ|close[i] - close[i+1]| — net displacement over path length.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Zones</p>
                <p className="text-sm text-gray-300">≥ 70 (teal) = efficient/trending • 30-70 (grey) = mixed • &lt; 30 (magenta) = chop/range.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Path-Displacement Principle (★)</p>
                <p className="text-sm text-gray-300">Price action as a geometric object. Shape of path contains information no scalar indicator captures.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Primary Application</p>
                <p className="text-sm text-gray-300">Symmetric strategy filter. Trend-follow: green above 70, veto below 30. Mean-rev: inverted verdicts.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Tuning</p>
                <p className="text-sm text-gray-300">len default 14 (match to timeframe). smoothLen default 5 (EMA). Bands 30/70 tunable.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Asset Class Reliability</p>
                <p className="text-sm text-gray-300">Works on everything — price-only, no volume dependency. Especially valuable on Forex.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Data Window Exports</p>
                <p className="text-sm text-gray-300">Net displacement · Path length · Efficiency [0-1] · Efficiency [0-100] · Chop cost · Chop %.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading MER Through the Path-Displacement Lens</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you read MER as a geometric efficiency measurement with symmetric strategy implications — or whether you’re still treating it as a trend signal or a direction tool.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read MER as a geometric efficiency measurement. The Path-Displacement Principle is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Path-Displacement Principle section before the quiz.' : 'Re-study the ratio construction and the symmetric strategy filter before attempting the quiz.'}</p></motion.div>)}
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">≈</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Market Efficiency Ratio</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Path-Displacement Tactician &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.10-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
