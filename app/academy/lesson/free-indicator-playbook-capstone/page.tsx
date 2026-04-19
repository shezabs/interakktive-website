// app/academy/lesson/free-indicator-playbook-capstone/page.tsx
// ATLAS Academy — Lesson 10.14: Free Indicator Playbook Capstone [PRO] [LEVEL 10 FINALE]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10 GRADUATE
// PHASE 1: scaffold + AnimScene + 4 animations
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
// ANIMATION 1: The Operational Loop (★ GROUNDBREAKING)
// A circular feedback loop showing Session -> Alert Log -> Calibration -> Next Session
// ============================================================
function OperationalLoopAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Operational Loop \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('Trading as a closed feedback system, not a sequence of isolated events', w / 2, 28);

    const cx = w / 2;
    const cy = h / 2 + 12;
    const radius = Math.min(h, w) * 0.28;

    // 4 stages around a circle
    const stages = [
      { angle: -Math.PI / 2, label: 'SESSION', sub: 'trade the plan', color: '#22C55E', icon: '\u{1F4C8}' },
      { angle: 0, label: 'ALERT LOG', sub: 'classify fires', color: '#FFB300', icon: '\u{1F4CB}' },
      { angle: Math.PI / 2, label: 'CALIBRATION', sub: 'tune parameters', color: '#8B5CF6', icon: '\u2699' },
      { angle: Math.PI, label: 'PLAYBOOK', sub: 'rerank, refine', color: '#EC407A', icon: '\u{1F4D6}' },
    ];

    // Arc connections between stages (flowing particles around the loop)
    ctx.strokeStyle = 'rgba(255,179,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Flowing particles
    const nParticles = 20;
    for (let i = 0; i < nParticles; i++) {
      const ang = ((t + i * 0.3) % (Math.PI * 2));
      const px = cx + Math.cos(ang - Math.PI / 2) * radius;
      const py = cy + Math.sin(ang - Math.PI / 2) * radius;
      const fadeIdx = (i + Math.floor(t * 10)) % nParticles;
      const alpha = 0.3 + 0.5 * (fadeIdx / nParticles);
      ctx.fillStyle = `rgba(255,179,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active stage
    const activeStage = Math.floor(t * 0.4) % stages.length;

    stages.forEach((s, i) => {
      const sx = cx + Math.cos(s.angle) * radius;
      const sy = cy + Math.sin(s.angle) * radius;
      const isActive = i === activeStage;
      const pulse = isActive ? 1 + Math.sin(t * 4) * 0.15 : 1;

      // Node circle
      ctx.fillStyle = s.color + (isActive ? '40' : '18');
      ctx.beginPath();
      ctx.arc(sx, sy, 24 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = s.color + (isActive ? 'ff' : '88');
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 24 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Icon
      ctx.fillStyle = s.color;
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, sx, sy + 5);

      // Label positioned outward from center
      const labelDist = 48;
      const lx = cx + Math.cos(s.angle) * (radius + labelDist);
      const ly = cy + Math.sin(s.angle) * (radius + labelDist);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, lx, ly - 3);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '6px system-ui';
      ctx.fillText(s.sub, lx, ly + 6);
    });

    // Center label
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMPOUND', cx, cy - 4);
    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('your edge', cx, cy + 8);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Every session\u2019s data tunes the next. Scaffolding stable, tuning continuous.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: The Day's Structure (6 phases)
// Timeline from 6:30 AM to 5:00 PM with 6 colored bands
// ============================================================
function DayStructureAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Day\u2019s Six Phases \u2014 From 6:30 AM to 5:00 PM ET', w / 2, 14);

    const phases = [
      { start: 6.5, end: 9.5, label: 'PREP', sub: '1. Pre-market', color: '#8B5CF6' },
      { start: 9.5, end: 10.25, label: 'OPEN', sub: '2. Session Open', color: '#22C55E' },
      { start: 10.25, end: 14, label: 'MONITOR', sub: '3. Active', color: '#0EA5E9' },
      { start: 14, end: 14.5, label: 'REVIEW', sub: '4. Mid-Session', color: '#FFB300' },
      { start: 14.5, end: 16, label: 'CLOSE', sub: '5. Closing', color: '#EF5350' },
      { start: 16, end: 17, label: 'DEBRIEF', sub: '6. Post-Session', color: '#EC407A' },
    ];

    const padL = 25;
    const padR = w - 25;
    const padT = 35;
    const padB = h - 30;
    const chartW = padR - padL;
    const timeRange = 17 - 6.5;

    // Hour ticks
    for (let hr = 7; hr <= 17; hr += 1) {
      const x = padL + ((hr - 6.5) / timeRange) * chartW;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padB);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      const label = hr > 12 ? `${hr - 12}p` : `${hr}a`;
      ctx.fillText(label, x, padB + 12);
    }

    // Phase bands
    const bandY = padT + 10;
    const bandH = 40;

    const activePhase = Math.floor(t * 0.5) % phases.length;

    phases.forEach((p, i) => {
      const x1 = padL + ((p.start - 6.5) / timeRange) * chartW;
      const x2 = padL + ((p.end - 6.5) / timeRange) * chartW;
      const bw = x2 - x1;
      const isActive = i === activePhase;

      ctx.fillStyle = p.color + (isActive ? '44' : '18');
      ctx.fillRect(x1, bandY, bw, bandH);
      ctx.strokeStyle = p.color + (isActive ? 'ff' : '66');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x1, bandY, bw, bandH);

      // Label
      if (bw > 40) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, x1 + bw / 2, bandY + 17);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '6px system-ui';
        ctx.fillText(p.sub, x1 + bw / 2, bandY + 30);
      } else {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, x1 + bw / 2, bandY + 23);
      }
    });

    // Moving time cursor
    const cursorT = 6.5 + ((t * 0.5) % 1) * timeRange;
    const cursorX = padL + ((cursorT - 6.5) / timeRange) * chartW;
    ctx.strokeStyle = 'rgba(255,179,0,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cursorX, padT);
    ctx.lineTo(cursorX, padB);
    ctx.stroke();
    ctx.setLineDash([]);

    const cursorHr = Math.floor(cursorT);
    const cursorMin = Math.floor((cursorT - cursorHr) * 60);
    const label = `${cursorHr > 12 ? cursorHr - 12 : cursorHr}:${String(cursorMin).padStart(2, '0')}${cursorHr >= 12 ? 'pm' : 'am'}`;
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, cursorX, padT - 4);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('10.5 hours. Six phases. Each one with a specific job.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 3: Pre-Market Prep Routine
// Checklist of 5 prep tasks being completed over time
// ============================================================
function PreMarketPrepAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 1 \u2014 Pre-Market Prep Routine (6:30-9:30 AM)', w / 2, 14);

    const tasks = [
      { time: '06:30', label: 'Launch TradingView, load ATLAS dashboard', detail: '6 indicators active' },
      { time: '06:45', label: 'Read overnight news flow', detail: 'Asia & LDN session highlights' },
      { time: '07:15', label: 'Identify session context (Sessions+)', detail: 'which regime opened LDN' },
      { time: '08:00', label: 'Set alert: compressed 7-pattern OR', detail: 'alert.freq_once_per_bar_close' },
      { time: '09:00', label: 'Pre-map key levels (MAZ zones)', detail: 'write them down, set mental triggers' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 34;
    const padB = h - 14;
    const rowH = (padB - padT) / tasks.length;

    // How many tasks completed
    const doneN = Math.floor(t * 0.8) % (tasks.length + 3);
    const displayDone = Math.min(doneN, tasks.length);

    tasks.forEach((task, i) => {
      const y = padT + i * rowH + 2;
      const isDone = i < displayDone;
      const isActive = i === displayDone - 1 && doneN < tasks.length + 2;

      // Row bg
      ctx.fillStyle = isDone ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(padL, y, padR - padL, rowH - 4);
      ctx.strokeStyle = isDone ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, y, padR - padL, rowH - 4);

      // Time
      ctx.fillStyle = isDone ? '#22C55E' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(task.time, padL + 8, y + rowH / 2 + 3);

      // Checkbox
      const cbX = padL + 52;
      const cbY = y + rowH / 2 - 6;
      const cbSize = 12;
      ctx.fillStyle = isDone ? '#22C55E' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(cbX, cbY, cbSize, cbSize);
      ctx.strokeStyle = isDone ? '#22C55E' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cbX, cbY, cbSize, cbSize);
      if (isDone) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cbX + 2.5, cbY + 6);
        ctx.lineTo(cbX + 5, cbY + 9);
        ctx.lineTo(cbX + 9.5, cbY + 3.5);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isDone ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(task.label, padL + 72, y + rowH / 2 - 2);

      // Detail
      ctx.fillStyle = isDone ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.35)';
      ctx.font = '7px system-ui';
      ctx.fillText(task.detail, padL + 72, y + rowH / 2 + 10);

      // Active indicator pulse
      if (isActive) {
        const pulse = 1 + Math.sin(t * 6) * 0.3;
        ctx.fillStyle = `rgba(255,179,0,${0.5 + Math.sin(t * 6) * 0.3})`;
        ctx.beginPath();
        ctx.arc(padR - 14, y + rowH / 2, 3 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (displayDone === tasks.length) {
      ctx.fillStyle = 'rgba(34,197,94,0.9)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u2713 Session prep complete \u2014 ready for open', w / 2, h - 4);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Routine: 3 hours \u2022 5 tasks \u2022 never skip', w / 2, h - 4);
    }
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 4: Session Open Scan (9:30-10:15 AM)
// The first 45 minutes: dashboard reads top-down cascade, 3 patterns evaluated
// ============================================================
function SessionOpenScanAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 2 \u2014 Session Open Scan (9:30-10:15 AM)', w / 2, 14);

    // Top: price chart (mini) showing opening activity
    const padL = 20;
    const padR = w - 20;
    const chartY = 30;
    const chartH = 60;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, chartY, padR - padL, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, chartY, padR - padL, chartH);

    const n = 40;
    const xStep = (padR - padL) / (n - 1);
    const midY = chartY + chartH / 2;

    // Opening bar with range
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const phase = i / n;
      const basePrice = phase < 0.3 ? 0 : (phase - 0.3) * 18; // trend up after initial chop
      const wave = Math.sin(i * 0.6 + t) * 5;
      const y = midY - basePrice + wave;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // "9:30 OPEN" marker at left
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL + 4, chartY);
    ctx.lineTo(padL + 4, chartY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('09:30', padL + 6, chartY + 10);

    // Cascade check list
    const cascadeY = chartY + chartH + 12;
    const cascadeItems = [
      { label: 'Context (Sessions+)', status: 'NY OPEN', color: '#8B5CF6' },
      { label: 'Regime (MSI)', status: 'EXPANSION', color: '#22C55E' },
      { label: 'Direction (MPR)', status: 'BULL RELEASE', color: '#22C55E' },
      { label: 'Efficiency (MER)', status: '72 \u2191', color: '#FFB300' },
    ];

    const itemW = (padR - padL) / cascadeItems.length;
    const activeScan = Math.floor(t * 0.8) % (cascadeItems.length + 2);

    cascadeItems.forEach((item, i) => {
      const x = padL + i * itemW;
      const bw = itemW - 6;
      const isScanned = i < activeScan;
      const isActive = i === activeScan - 1;

      ctx.fillStyle = isScanned ? item.color + '20' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + 3, cascadeY, bw, 40);
      ctx.strokeStyle = isScanned ? item.color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x + 3, cascadeY, bw, 40);

      ctx.fillStyle = isScanned ? item.color : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, x + 3 + bw / 2, cascadeY + 10);

      ctx.fillStyle = isScanned ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(item.label, x + 3 + bw / 2, cascadeY + 22);

      if (isScanned) {
        ctx.fillStyle = item.color;
        ctx.font = 'bold 7px system-ui';
        ctx.fillText(item.status, x + 3 + bw / 2, cascadeY + 34);
      }
    });

    // Verdict box
    const verdictY = cascadeY + 52;
    const fullyScanned = activeScan > cascadeItems.length;
    if (fullyScanned) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      ctx.fillStyle = `rgba(34,197,94,${0.2 + Math.sin(t * 3) * 0.05})`;
      ctx.fillRect(padL + 40, verdictY, padR - padL - 80, 30);
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padL + 40, verdictY, padR - padL - 80, 30);

      ctx.fillStyle = '#22C55E';
      ctx.font = `bold ${10 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('PATTERN #1 LAUNCH ARMED', w / 2, verdictY + 13);
      ctx.fillStyle = 'rgba(34,197,94,0.8)';
      ctx.font = '7px system-ui';
      ctx.fillText('wait for breakout trigger', w / 2, verdictY + 24);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('scanning cascade top-down\u2026', w / 2, verdictY + 15);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('30-second read per bar. Cascade order: Context \u2192 Regime \u2192 Direction \u2192 Efficiency.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 5: Active Monitoring Phase
// Timeline showing alerts firing throughout the midday session
// ============================================================
function ActiveMonitoringAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 3 \u2014 Active Monitoring (10:15 AM \u2013 2:00 PM)', w / 2, 14);

    const padL = 25;
    const padR = w - 25;
    const padT = 40;
    const padB = h - 30;

    // Time axis
    const hours = [10, 11, 12, 13, 14];
    hours.forEach(hr => {
      const x = padL + ((hr - 10) / 4) * (padR - padL);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padB);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const lbl = hr > 12 ? `${hr - 12}pm` : `${hr}am`;
      ctx.fillText(lbl, x, padB + 12);
    });

    // Price line above
    const priceY = padT + 10;
    const priceH = 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    const n = 60;
    for (let i = 0; i < n; i++) {
      const x = padL + (i / (n - 1)) * (padR - padL);
      const phase = i / n;
      const trend = phase * 15;
      const wave = Math.sin(i * 0.5 + t) * 4 + Math.sin(i * 0.2) * 6;
      const y = priceY + priceH / 2 - trend + wave;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Alert fires on timeline
    const fires = [
      { hr: 10.5, pattern: '#1', action: 'TAKEN', color: '#22C55E', pnl: '+1.8R' },
      { hr: 11.1, pattern: '#3', action: 'SKIP', color: '#F59E0B', pnl: 'context wrong' },
      { hr: 11.8, pattern: '#4', action: 'TAKEN', color: '#22C55E', pnl: '+2.1R' },
      { hr: 12.5, pattern: '#5', action: 'SKIP', color: '#F59E0B', pnl: 'lunch \u2014 skip' },
      { hr: 13.3, pattern: '#7', action: 'TAKEN', color: '#22C55E', pnl: '\u20140.4R' },
    ];

    const timelineY = priceY + priceH + 18;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, timelineY);
    ctx.lineTo(padR, timelineY);
    ctx.stroke();

    const activeFire = Math.min(fires.length - 1, Math.floor(t * 0.5) % (fires.length + 2));

    fires.forEach((fire, i) => {
      const fx = padL + ((fire.hr - 10) / 4) * (padR - padL);
      const isRevealed = i <= activeFire;
      if (!isRevealed) return;

      const pulse = i === activeFire ? 1 + Math.sin(t * 6) * 0.2 : 1;

      // Fire marker
      ctx.fillStyle = fire.color;
      ctx.beginPath();
      ctx.arc(fx, timelineY, 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(fx, timelineY, 6 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Bell icon
      ctx.fillStyle = fire.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u{1F514}', fx, timelineY - 14);

      // Pattern label
      ctx.fillStyle = fire.color;
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(fire.pattern, fx, timelineY + 14);

      // Action badge below
      ctx.fillStyle = fire.color + '33';
      ctx.fillRect(fx - 22, timelineY + 18, 44, 14);
      ctx.fillStyle = fire.color;
      ctx.font = 'bold 6px system-ui';
      ctx.fillText(fire.action, fx, timelineY + 27);

      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '6px system-ui';
      ctx.fillText(fire.pnl, fx, timelineY + 40);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Compressed alert fires throughout \u2014 some trades taken, some correctly skipped', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 6: Mid-Session Review Dashboard
// 2:00 PM check-in with P&L, trade quality, active positions
// ============================================================
function MidSessionReviewAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 4 \u2014 Mid-Session Review (2:00 PM)', w / 2, 14);

    // 4 KPI boxes in a 2x2 grid
    const kpis = [
      { label: 'TRADES', value: '3', sub: '2 winners, 1 SL', color: '#22C55E' },
      { label: 'NET P&L', value: '+3.5R', sub: 'above avg session', color: '#22C55E' },
      { label: 'ALERT FIRES', value: '5', sub: '3 taken, 2 skipped', color: '#FFB300' },
      { label: 'NOISE RATE', value: '0%', sub: 'clean session', color: '#22C55E' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 36;
    const gridW = padR - padL;
    const cellW = (gridW - 10) / 2;
    const cellH = 60;
    const rowGap = 8;

    kpis.forEach((k, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = padL + col * (cellW + 10);
      const y = padT + row * (cellH + rowGap);
      const isActive = Math.floor(t * 0.8) % kpis.length === i;
      const pulse = isActive ? 1 + Math.sin(t * 5) * 0.08 : 1;

      ctx.fillStyle = k.color + (isActive ? '18' : '08');
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = k.color + (isActive ? 'cc' : '55');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x, y, cellW, cellH);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(k.label, x + 10, y + 14);

      ctx.fillStyle = k.color;
      ctx.font = `bold ${22 * pulse}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(k.value, x + 10, y + 40);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '7px system-ui';
      ctx.fillText(k.sub, x + 10, y + 54);
    });

    // Decision box
    const decY = padT + 2 * (cellH + rowGap);
    ctx.fillStyle = 'rgba(139,92,246,0.1)';
    ctx.fillRect(padL, decY, gridW, 50);
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(padL, decY, gridW, 50);

    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u{1F4CB} MID-SESSION DECISION', padL + 10, decY + 16);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '8px system-ui';
    ctx.fillText('\u2713 Targets hit \u2014 trade SMALLER sizes on closing session', padL + 10, decY + 30);
    ctx.fillText('\u2713 Stay vigilant for #7 Trap Fade (high fade-risk window approaching)', padL + 10, decY + 42);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('30-minute check-in. Size down after targets hit \u2014 most traders size up, which is wrong.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 7: Closing Session Recap
// 2:30-4 PM visualization — session winding down
// ============================================================
function ClosingSessionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 5 \u2014 Closing Session (2:30 \u2013 4:00 PM)', w / 2, 14);

    // 3 checkpoints: scan, open positions, last 30 min
    const checkpoints = [
      { time: '2:30', label: 'Last scan', detail: 'Is there still edge to take?', color: '#FFB300' },
      { time: '3:00', label: 'Open positions', detail: 'Tighten stops, trail winners', color: '#22C55E' },
      { time: '3:30', label: 'Last 30 min', detail: 'No new entries \u2014 close-positioning fade risk', color: '#EF5350' },
      { time: '4:00', label: 'Bell rings', detail: 'All positions closed or held overnight', color: '#EC407A' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 40;
    const padB = h - 14;
    const timelineY = padT + 10;

    // Timeline
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(padL, timelineY);
    ctx.lineTo(padR, timelineY);
    ctx.stroke();

    const activeIdx = Math.floor(t * 0.5) % checkpoints.length;

    checkpoints.forEach((cp, i) => {
      const x = padL + (i / (checkpoints.length - 1)) * (padR - padL);
      const isDone = i <= activeIdx;
      const isActive = i === activeIdx;
      const pulse = isActive ? 1 + Math.sin(t * 5) * 0.25 : 1;

      ctx.fillStyle = isDone ? cp.color : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(x, timelineY, 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      if (isDone) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, timelineY, 6 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Time label above
      ctx.fillStyle = isDone ? cp.color : 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cp.time, x, timelineY - 12);

      // Description card below
      const cardY = timelineY + 20;
      const cardW = 130;
      const cardH = 60;
      const cardX = Math.max(padL, Math.min(padR - cardW, x - cardW / 2));

      ctx.fillStyle = isDone ? cp.color + '18' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = isDone ? cp.color + 'aa' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      ctx.fillStyle = isDone ? cp.color : 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(cp.label, cardX + cardW / 2, cardY + 16);

      ctx.fillStyle = isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
      ctx.font = '7px system-ui';
      // Wrap text
      const words = cp.detail.split(' ');
      const lines: string[] = [];
      let curLine = '';
      const maxW = cardW - 16;
      words.forEach(word => {
        const test = curLine + (curLine ? ' ' : '') + word;
        if (ctx.measureText(test).width > maxW && curLine) {
          lines.push(curLine);
          curLine = word;
        } else {
          curLine = test;
        }
      });
      if (curLine) lines.push(curLine);
      lines.forEach((line, li) => {
        ctx.fillText(line, cardX + cardW / 2, cardY + 32 + li * 10);
      });
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Managing exits well is as valuable as entering well. No new exposure in last 30 min.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 8: Post-Session Debrief
// 4-6 PM review workflow
// ============================================================
function PostSessionDebriefAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Phase 6 \u2014 Post-Session Debrief (4:00 \u2013 5:00 PM)', w / 2, 14);

    // 4 workflow steps
    const steps = [
      { title: 'Export alert log', detail: 'Screenshot, export to journal', icon: '\u{1F4CB}' },
      { title: 'Classify each fire', detail: 'Trade / No-Trade / Noise', icon: '\u{1F3AF}' },
      { title: 'Pattern P&L attribution', detail: 'Which patterns actually paid?', icon: '\u{1F4B0}' },
      { title: 'Filter adjustments', detail: 'Tighten patterns with noise', icon: '\u2699' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 34;
    const padB = h - 14;

    const colW = (padR - padL) / steps.length;

    const activeIdx = Math.floor(t * 0.5) % (steps.length + 2);

    steps.forEach((s, i) => {
      const x = padL + i * colW + 4;
      const cardW = colW - 8;
      const cardY = padT;
      const cardH = padB - padT;
      const isDone = i < activeIdx;
      const isActive = i === activeIdx - 1;
      const pulse = isActive ? 1 + Math.sin(t * 4) * 0.1 : 1;

      ctx.fillStyle = isDone ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, cardY, cardW, cardH);
      ctx.strokeStyle = isDone ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x, cardY, cardW, cardH);

      // Step number
      ctx.fillStyle = isDone ? '#22C55E' : 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 7px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`STEP ${i + 1}`, x + 8, cardY + 14);

      // Icon
      ctx.fillStyle = isDone ? '#22C55E' : 'rgba(255,255,255,0.4)';
      ctx.font = `bold ${28 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, x + cardW / 2, cardY + 52);

      // Title
      ctx.fillStyle = isDone ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 8px system-ui';
      ctx.fillText(s.title, x + cardW / 2, cardY + 74);

      // Detail wrapped
      ctx.fillStyle = isDone ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.35)';
      ctx.font = '7px system-ui';
      const words = s.detail.split(' ');
      const lines: string[] = [];
      let cur = '';
      const maxW = cardW - 16;
      words.forEach(word => {
        const test = cur + (cur ? ' ' : '') + word;
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = word;
        } else { cur = test; }
      });
      if (cur) lines.push(cur);
      lines.forEach((line, li) => {
        ctx.fillText(line, x + cardW / 2, cardY + 94 + li * 10);
      });

      // Check badge
      if (isDone) {
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(x + cardW - 12, cardY + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x + cardW - 14, cardY + 10);
        ctx.lineTo(x + cardW - 12, cardY + 12);
        ctx.lineTo(x + cardW - 9, cardY + 8);
        ctx.stroke();
      }

      // Arrow to next
      if (i < steps.length - 1 && isDone) {
        const ax = x + cardW;
        const ay = cardY + cardH / 2;
        ctx.strokeStyle = 'rgba(34,197,94,0.5)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 6, ay);
        ctx.stroke();
        ctx.fillStyle = 'rgba(34,197,94,0.7)';
        ctx.beginPath();
        ctx.moveTo(ax + 8, ay);
        ctx.lineTo(ax + 4, ay - 3);
        ctx.lineTo(ax + 4, ay + 3);
        ctx.closePath();
        ctx.fill();
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('1 hour of discipline. Transforms a trade list into a learning system.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 9: Walkthrough — Morning (7-11 AM narrative)
// Scene card with time, dashboard state, action
// ============================================================
function WalkthroughMorningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Walkthrough \u2014 Morning (7:00 AM \u2013 11:00 AM)', w / 2, 14);

    // Narrative scene cycles through 4 moments
    const scenes = [
      {
        time: '07:15',
        state: 'Sessions+ shows LDN Expansion regime carrying into NY. MSI in Expansion. Overnight news: Fed speaker dovish.',
        action: 'Load chart. Pre-map upper MAE at 458.20, MAZ at 456.80.',
        color: '#8B5CF6',
        phase: 'PREP',
      },
      {
        time: '09:30',
        state: 'Open in tight 30-second range. Context: NY Open \u00d7 LDN-NY overlap approaching.',
        action: 'Wait. No cascade resolved yet. Don\u2019t chase open range.',
        color: '#22C55E',
        phase: 'OPEN',
      },
      {
        time: '10:02',
        state: 'MSI flips Expansion. MER = 71 (teal). MPR = Bull Release. Price tagging upper MAE.',
        action: '\u{1F514} Pattern #1 LAUNCH fires. Enter 1R with stop below MAE.',
        color: '#FFB300',
        phase: 'ENTRY',
      },
      {
        time: '10:47',
        state: 'Price + 1.5R. MER still 72. MSI solid Expansion.',
        action: 'Trail stop to breakeven. Let the trend work. Note: pattern #3 may arm later.',
        color: '#22C55E',
        phase: 'MANAGE',
      },
    ];

    const activeIdx = Math.floor(t * 0.3) % scenes.length;
    const scene = scenes[activeIdx];

    // Main card
    const padL = 20;
    const padR = w - 20;
    const cardX = padL;
    const cardY = 32;
    const cardW = padR - padL;
    const cardH = h - 46;

    ctx.fillStyle = scene.color + '10';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = scene.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Phase badge top-left
    ctx.fillStyle = scene.color + '40';
    ctx.fillRect(cardX + 12, cardY + 12, 50, 18);
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(scene.phase, cardX + 12 + 25, cardY + 24);

    // Time top-right
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(scene.time, cardX + cardW - 12, cardY + 26);

    // Dashboard state label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('DASHBOARD READ', cardX + 14, cardY + 46);

    // State text (wrapped)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '8px system-ui';
    const words = scene.state.split(' ');
    const lines: string[] = [];
    let cur = '';
    const maxW = cardW - 28;
    words.forEach(word => {
      const test = cur + (cur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = word;
      } else { cur = test; }
    });
    if (cur) lines.push(cur);
    lines.forEach((line, li) => {
      ctx.fillText(line, cardX + 14, cardY + 62 + li * 12);
    });

    const textEndY = cardY + 62 + lines.length * 12;

    // Divider
    ctx.strokeStyle = scene.color + '44';
    ctx.beginPath();
    ctx.moveTo(cardX + 14, textEndY + 6);
    ctx.lineTo(cardX + cardW - 14, textEndY + 6);
    ctx.stroke();

    // Action label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ACTION', cardX + 14, textEndY + 20);

    // Action text (wrapped)
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 8px system-ui';
    const actWords = scene.action.split(' ');
    const actLines: string[] = [];
    let actCur = '';
    actWords.forEach(word => {
      const test = actCur + (actCur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && actCur) {
        actLines.push(actCur);
        actCur = word;
      } else { actCur = test; }
    });
    if (actCur) actLines.push(actCur);
    actLines.forEach((line, li) => {
      ctx.fillText(line, cardX + 14, textEndY + 36 + li * 12);
    });

    // Progress dots
    const dotY = cardY + cardH - 14;
    scenes.forEach((_, i) => {
      const dx = cardX + cardW / 2 - (scenes.length - 1) * 6 + i * 12;
      ctx.fillStyle = i === activeIdx ? scene.color : scene.color + '33';
      ctx.beginPath();
      ctx.arc(dx, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 10: Walkthrough — Midday (11 AM - 2 PM narrative)
// ============================================================
function WalkthroughMiddayAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Walkthrough \u2014 Midday (11:00 AM \u2013 2:00 PM)', w / 2, 14);

    const scenes = [
      {
        time: '11:18',
        state: 'Pattern #1 fills at +2.1R. MSI still Expansion. MER = 74.',
        action: 'Exit at MAZ resistance. Log to journal. Stand aside.',
        color: '#22C55E',
        phase: 'EXIT 1',
      },
      {
        time: '11:52',
        state: 'Alert fires. Context: lunch lull approaching (11:30-1:00 weakest window).',
        action: 'Read: MSI flipped to Compression, MPR neutral. Pattern #3 FADE partial \u2014 SKIP.',
        color: '#F59E0B',
        phase: 'SKIP',
      },
      {
        time: '12:38',
        state: 'Price tagging lower MAZ. ERD absorption marker fires. MER=24 (low, mean-rev licensed).',
        action: '\u{1F514} Pattern #4 ABSORPTION fires. Enter 0.75R (lunch-sized). SL below MAZ.',
        color: '#26A69A',
        phase: 'ENTRY',
      },
      {
        time: '13:45',
        state: 'Position at +1.4R. MSI transitioning. MER climbing back to 45.',
        action: 'Scale 50% out at target. Trail rest. Prep for mid-session review at 2:00.',
        color: '#22C55E',
        phase: 'MANAGE',
      },
    ];

    const activeIdx = Math.floor(t * 0.3) % scenes.length;
    const scene = scenes[activeIdx];

    const padL = 20;
    const padR = w - 20;
    const cardX = padL;
    const cardY = 32;
    const cardW = padR - padL;
    const cardH = h - 46;

    ctx.fillStyle = scene.color + '10';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = scene.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.fillStyle = scene.color + '40';
    ctx.fillRect(cardX + 12, cardY + 12, 55, 18);
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(scene.phase, cardX + 12 + 27.5, cardY + 24);

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(scene.time, cardX + cardW - 12, cardY + 26);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('DASHBOARD READ', cardX + 14, cardY + 46);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '8px system-ui';
    const words = scene.state.split(' ');
    const lines: string[] = [];
    let cur = '';
    const maxW = cardW - 28;
    words.forEach(word => {
      const test = cur + (cur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; } else { cur = test; }
    });
    if (cur) lines.push(cur);
    lines.forEach((line, li) => { ctx.fillText(line, cardX + 14, cardY + 62 + li * 12); });
    const textEndY = cardY + 62 + lines.length * 12;

    ctx.strokeStyle = scene.color + '44';
    ctx.beginPath();
    ctx.moveTo(cardX + 14, textEndY + 6);
    ctx.lineTo(cardX + cardW - 14, textEndY + 6);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ACTION', cardX + 14, textEndY + 20);

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 8px system-ui';
    const actWords = scene.action.split(' ');
    const actLines: string[] = [];
    let actCur = '';
    actWords.forEach(word => {
      const test = actCur + (actCur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && actCur) { actLines.push(actCur); actCur = word; } else { actCur = test; }
    });
    if (actCur) actLines.push(actCur);
    actLines.forEach((line, li) => { ctx.fillText(line, cardX + 14, textEndY + 36 + li * 12); });

    const dotY = cardY + cardH - 14;
    scenes.forEach((_, i) => {
      const dx = cardX + cardW / 2 - (scenes.length - 1) * 6 + i * 12;
      ctx.fillStyle = i === activeIdx ? scene.color : scene.color + '33';
      ctx.beginPath();
      ctx.arc(dx, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 11: Walkthrough — Afternoon (2-5 PM narrative)
// ============================================================
function WalkthroughAfternoonAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Walkthrough \u2014 Afternoon (2:00 \u2013 5:00 PM)', w / 2, 14);

    const scenes = [
      {
        time: '14:02',
        state: 'Mid-session review: 3 trades, +3.5R net, 0% noise rate.',
        action: 'Decision: size down for closing. Watch for #7 Trap Fade in NY late session.',
        color: '#8B5CF6',
        phase: 'REVIEW',
      },
      {
        time: '15:18',
        state: 'Price pushes through upper MAZ. MPR shows Bull Release. BUT MSI flipped Exhaustion, MER falling 42\u219236.',
        action: '\u{1F514} Pattern #7 TRAP FADE armed. Wait for ERD absorption at high.',
        color: '#F9A825',
        phase: 'ARMED',
      },
      {
        time: '15:26',
        state: 'ERD absorption fires at new high. 5/6 layers warning trap. MPR surface-bull only.',
        action: 'Enter SHORT 0.5R (small size, tight stop above high). SL = 3 ticks above.',
        color: '#EF5350',
        phase: 'FADE',
      },
      {
        time: '15:54',
        state: 'Price drops back to MAZ mid. +1.8R on short. Final 6 minutes before close.',
        action: 'Close full. No new positions. Export alert log.',
        color: '#22C55E',
        phase: 'EXIT',
      },
      {
        time: '16:30',
        state: 'Post-session: 4 trades, 3 wins, 1 small loss. Net +5.3R. All 4 patterns fired correctly.',
        action: 'Journal entry complete. Weekly calibration notes updated. Tomorrow: repeat.',
        color: '#EC407A',
        phase: 'DEBRIEF',
      },
    ];

    const activeIdx = Math.floor(t * 0.28) % scenes.length;
    const scene = scenes[activeIdx];

    const padL = 20;
    const padR = w - 20;
    const cardX = padL;
    const cardY = 32;
    const cardW = padR - padL;
    const cardH = h - 46;

    ctx.fillStyle = scene.color + '10';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = scene.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.fillStyle = scene.color + '40';
    ctx.fillRect(cardX + 12, cardY + 12, 60, 18);
    ctx.fillStyle = scene.color;
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(scene.phase, cardX + 12 + 30, cardY + 24);

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(scene.time, cardX + cardW - 12, cardY + 26);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('DASHBOARD READ', cardX + 14, cardY + 46);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '8px system-ui';
    const words = scene.state.split(' ');
    const lines: string[] = [];
    let cur = '';
    const maxW = cardW - 28;
    words.forEach(word => {
      const test = cur + (cur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; } else { cur = test; }
    });
    if (cur) lines.push(cur);
    lines.forEach((line, li) => { ctx.fillText(line, cardX + 14, cardY + 62 + li * 12); });
    const textEndY = cardY + 62 + lines.length * 12;

    ctx.strokeStyle = scene.color + '44';
    ctx.beginPath();
    ctx.moveTo(cardX + 14, textEndY + 6);
    ctx.lineTo(cardX + cardW - 14, textEndY + 6);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ACTION', cardX + 14, textEndY + 20);

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 8px system-ui';
    const actWords = scene.action.split(' ');
    const actLines: string[] = [];
    let actCur = '';
    actWords.forEach(word => {
      const test = actCur + (actCur ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && actCur) { actLines.push(actCur); actCur = word; } else { actCur = test; }
    });
    if (actCur) actLines.push(actCur);
    actLines.forEach((line, li) => { ctx.fillText(line, cardX + 14, textEndY + 36 + li * 12); });

    const dotY = cardY + cardH - 14;
    scenes.forEach((_, i) => {
      const dx = cardX + cardW / 2 - (scenes.length - 1) * 7 + i * 14;
      ctx.fillStyle = i === activeIdx ? scene.color : scene.color + '33';
      ctx.beginPath();
      ctx.arc(dx, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={310} />;
}

// ============================================================
// ANIMATION 12: Weekly Calibration Cycle
// Noise rate trending down over 8 weeks
// ============================================================
function WeeklyCalibrationAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Weekly Calibration Cycle \u2014 Noise Rate Converges', w / 2, 14);

    const padL = 40;
    const padR = w - 20;
    const padT = 36;
    const padB = h - 30;
    const chartW = padR - padL;
    const chartH = padB - padT;

    // Y axis labels (noise %)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px ui-monospace, monospace';
    ctx.textAlign = 'right';
    [0, 20, 40, 60, 80].forEach(pct => {
      const y = padB - (pct / 80) * chartH;
      ctx.fillText(`${pct}%`, padL - 4, y + 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padR, y);
      ctx.stroke();
    });

    // Target band (10-20% noise)
    const y10 = padB - (10 / 80) * chartH;
    const y20 = padB - (20 / 80) * chartH;
    ctx.fillStyle = 'rgba(34,197,94,0.08)';
    ctx.fillRect(padL, y20, chartW, y10 - y20);
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, y10);
    ctx.lineTo(padR, y10);
    ctx.moveTo(padL, y20);
    ctx.lineTo(padR, y20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,197,94,0.8)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('TARGET: 10-20%', padR - 4, (y10 + y20) / 2 + 2);

    // Data points (8 weeks) trending down
    const data = [48, 42, 38, 30, 24, 20, 17, 15];

    // Line connecting points
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = padL + (i / (data.length - 1)) * chartW;
      const y = padB - (v / 80) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Animated reveal dot
    const revealN = Math.min(data.length, Math.floor(t * 0.8) % (data.length + 3));

    data.forEach((v, i) => {
      if (i >= revealN) return;
      const x = padL + (i / (data.length - 1)) * chartW;
      const y = padB - (v / 80) * chartH;
      const isLatest = i === revealN - 1;
      const pulse = isLatest ? 1 + Math.sin(t * 5) * 0.2 : 1;

      const inTarget = v >= 10 && v <= 20;
      const col = inTarget ? '#22C55E' : '#FFB300';

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, 5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 5 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      if (isLatest) {
        ctx.fillStyle = col;
        ctx.font = 'bold 7px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${v}%`, x, y - 10);
      }
    });

    // Week labels on X
    data.forEach((_, i) => {
      const x = padL + (i / (data.length - 1)) * chartW;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '6px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`W${i + 1}`, x, padB + 12);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('8 weeks of disciplined tuning \u2192 noise rate converges into the 10-20% target band', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 13: Pattern P&L Attribution
// Bar chart showing which patterns produced the actual P&L
// ============================================================
function PatternPLAttributionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern P&L Attribution \u2014 Where Edge Actually Lives', w / 2, 14);

    const padL = 25;
    const padR = w - 25;
    const padT = 36;
    const padB = h - 38;
    const chartW = padR - padL;
    const chartH = padB - padT;

    const patterns = [
      { n: '#4 Absorption', pnl: 38, color: '#26A69A' },
      { n: '#7 Trap Fade', pnl: 32, color: '#F9A825' },
      { n: '#1 Launch', pnl: 14, color: '#22C55E' },
      { n: '#3 Clean Fade', pnl: 10, color: '#EF5350' },
      { n: '#6 Surge', pnl: 5, color: '#22C55E' },
      { n: '#5 Handoff', pnl: 1, color: '#8B5CF6' },
      { n: '#2 Coil', pnl: 0, color: '#FFB300' },
    ];

    const barH = (chartH - 6) / patterns.length;
    const maxPnl = 40;

    patterns.forEach((p, i) => {
      const y = padT + i * barH + 2;
      const bh = barH - 4;
      const targetW = (p.pnl / maxPnl) * (chartW - 120);

      // Reveal animation
      const revealT = Math.min(1, Math.max(0, (t - i * 0.4) * 1.5));
      const w2 = targetW * revealT;

      // Label
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(p.n, padL, y + bh / 2 + 2);

      // Bar
      const barX = padL + 100;
      ctx.fillStyle = p.color + '88';
      ctx.fillRect(barX, y, w2, bh);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, y, targetW, bh);

      // Value
      if (revealT >= 0.8) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${p.pnl}%`, barX + Math.max(6, w2 + 4), y + bh / 2 + 2);
      }
    });

    // Pareto line at 80%
    const top3pct = 38 + 32 + 14; // 84% from top 3
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Top 3 patterns = ${top3pct}% of P&L`, w / 2, padB + 12);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Double down on the top 3. Consider pruning the bottom 2.', w / 2, padB + 24);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('(3-month rolling attribution)', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 14: Scaffolding vs Tuning
// The critical distinction: what you DON'T change vs what you DO
// ============================================================
function ScaffoldingVsTuningAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scaffolding vs Tuning \u2014 The Most Important Distinction', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(mid, 28);
    ctx.lineTo(mid, h - 14);
    ctx.stroke();

    // LEFT: Scaffolding (locked)
    ctx.fillStyle = '#0EA5E9';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u{1F512} SCAFFOLDING', w / 4, 42);
    ctx.fillStyle = 'rgba(14,165,233,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('(what you DON\u2019T change)', w / 4, 54);

    const scaffoldItems = [
      'The 6 ATLAS indicators',
      'The Diagnostic Cascade order',
      'The 7 playbook pattern definitions',
      'The alert compression architecture',
      'The hygiene review loop',
    ];

    scaffoldItems.forEach((item, i) => {
      const y = 70 + i * 28;
      const pulse = Math.floor(t * 0.5) % scaffoldItems.length === i;
      ctx.fillStyle = `rgba(14,165,233,${pulse ? 0.2 : 0.08})`;
      ctx.fillRect(20, y, w / 2 - 25, 22);
      ctx.strokeStyle = `rgba(14,165,233,${pulse ? 0.8 : 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y, w / 2 - 25, 22);

      ctx.fillStyle = '#0EA5E9';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u{1F512}', 26, y + 14);

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '7px system-ui';
      ctx.fillText(item, 42, y + 14);
    });

    // RIGHT: Tuning (continuously adjusted)
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2699 TUNING', (w * 3) / 4, 42);
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText('(what you CONTINUOUSLY adjust)', (w * 3) / 4, 54);

    const tuneItems = [
      'Which 2-3 patterns you trade (style fit)',
      'Filter thresholds on noisy patterns',
      'Priority tier rankings (Rarity \u00d7 Edge)',
      'Session windows you accept / skip',
      'Position size scaling rules',
    ];

    tuneItems.forEach((item, i) => {
      const y = 70 + i * 28;
      const pulse = Math.floor(t * 0.5) % tuneItems.length === i;
      ctx.fillStyle = `rgba(34,197,94,${pulse ? 0.2 : 0.08})`;
      ctx.fillRect(w / 2 + 5, y, w / 2 - 25, 22);
      ctx.strokeStyle = `rgba(34,197,94,${pulse ? 0.8 : 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 + 5, y, w / 2 - 25, 22);

      ctx.fillStyle = '#22C55E';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u2699', w / 2 + 11, y + 14);

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '7px system-ui';
      ctx.fillText(item, w / 2 + 22, y + 14);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Amateurs tweak scaffolding constantly. Professionals tune parameters within stable scaffolding.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// GAME DATA — 5 rounds
// ============================================================
const gameRounds = [
  {
    scenario: 'After 3 months of running the ATLAS framework, you review your pattern P&L attribution. Results: #4 Absorption = 38%, #7 Trap = 32%, #1 Launch = 14%, and the remaining four patterns together = 16%. What\u2019s the correct response using the Operational Loop framework?',
    options: [
      { text: 'Double down on the top 3 patterns (which account for 84% of P&L) and consider pruning one or two of the bottom patterns. Your actual edge lives in Absorption and Trap Fade \u2014 they\u2019re producing 70% of your P&L between them. That\u2019s a feedback signal: the system is telling you which patterns suit your style, your instrument, your session. Pareto principle in action. Refine your alert architecture to prioritize these; adjust your focus and practice to deepen recognition on them specifically.', correct: true, explain: 'Pattern P&L Attribution is the core feedback mechanism of the Operational Loop. When 2-3 patterns account for 70%+ of your P&L, that\u2019s not randomness \u2014 that\u2019s information about your specific edge profile. The system is converging on which patterns work for YOU, given your style, your attention span, your preferred session, your instrument. Double down on those. The patterns producing 1-5% of P&L can remain in surveillance but shouldn\u2019t occupy equal cognitive weight. Professional workflow: trade your top 3 patterns 80% of the time; keep the rest as opportunistic backups.' },
      { text: 'Tighten filters on all patterns equally to reduce risk', correct: false, explain: 'Blanket tightening ignores the specific information the attribution data is giving you. Your winning patterns don\u2019t need tightening \u2014 they\u2019re producing P&L. Your losing patterns might not be your problem; they might just be patterns that don\u2019t suit your style. Treat attribution as selection data, not uniform-risk data.' },
    ],
  },
  {
    scenario: 'It\u2019s Monday morning. Your Sunday review showed the framework is working. You\u2019re tempted to tweak the cascade order \u2014 maybe read Efficiency before Regime this week, "just to try something different." Using the Scaffolding vs Tuning framework, assess this move.',
    options: [
      { text: 'No. Cascade order is SCAFFOLDING \u2014 locked, not adjusted. Changing the cascade reading order breaks the entire diagnostic logic (upstream layers CONDITION downstream interpretation). If you want to experiment, tune the TUNING parameters: try a different pattern mix this week, adjust filter thresholds on a specific pattern, change your session windows. The scaffolding stays stable; the tuning is where you experiment. Conflating the two is how traders destroy their own systems.', correct: true, explain: 'The Scaffolding vs Tuning distinction is critical for long-term edge preservation. The ATLAS framework, the cascade, the pattern definitions \u2014 these are DESIGN DECISIONS that encode specific doctrinal logic. Changing them breaks the logic. What you SHOULD change is the parameters: which 2-3 patterns you trade today, which thresholds are tight vs loose, which sessions you accept. Amateurs confuse these and constantly rebuild their scaffolding. Professionals hold scaffolding stable for months or years and tune parameters weekly. This is how compounding edge actually works.' },
      { text: 'Yes \u2014 experimentation is good', correct: false, explain: 'Not all experimentation is equal. Experimenting with SCAFFOLDING breaks the system\u2019s logic. Experimenting with TUNING parameters improves the system within stable logic. The distinction matters. You can test tuning changes with weeks of data; you can\u2019t meaningfully test scaffolding changes because each change resets the learning curve.' },
    ],
  },
  {
    scenario: 'Your week\u2019s alert noise rate comes in at 35%. Last week was 28%. The week before was 22%. Noise is TRENDING UP. Using the Weekly Calibration Cycle, what does this signal, and what\u2019s the correct response?',
    options: [
      { text: 'Noise trending up means your filters have drifted out of alignment with current market conditions \u2014 OR a specific pattern has started misfiring and is dragging the average up. Correct response: drill into the alert log, identify which patterns contributed most noise this week vs. last, find the common invalidating factor (often: a specific indicator threshold that worked in a prior regime but is loose for the current one), and tighten THAT pattern\u2019s filter. Don\u2019t blanket-tighten; locate the source and fix it surgically.', correct: true, explain: 'The Weekly Calibration Cycle depends on this diagnostic discipline. An up-trending noise rate is a leading indicator of worse trading if left uncorrected \u2014 you\u2019ll start ignoring alerts, missing real fires, and the P&L will follow downward. Treat it seriously. The log tells you WHICH pattern is degrading. Usually it\u2019s one specific pattern whose threshold was calibrated for a prior market regime and is now too loose. Find it, tighten it, watch noise recover next week. This is the loop in action.' },
      { text: 'Ignore it \u2014 weekly variation is normal', correct: false, explain: 'Three weeks of up-trend is not variation, it\u2019s signal. The calibration loop exists specifically to catch these drifts before they become P&L problems. Ignoring log data defeats the entire purpose of hygiene. This is the mistake that separates compounding traders from stagnating ones.' },
    ],
  },
  {
    scenario: 'You finish a session with +5.3R net P&L across 4 trades, clean execution, 0% noise. You\u2019re tempted to skip the post-session debrief \u2014 "the session went well, nothing to learn." Using the Operational Loop framework, assess.',
    options: [
      { text: 'Skip is wrong. The debrief is not triggered by whether the session went well or badly \u2014 it\u2019s an unconditional part of the loop. Good sessions produce just as much data as bad sessions. You should classify every fire (even the no-trades you correctly skipped), attribute the P&L by pattern (which patterns produced this win?), and note any edge cases observed. Skipping debriefs on good days is exactly how traders fail to compound \u2014 they only study their losses and never understand their wins. The framework treats every session as equal-information; the debrief is unconditional.', correct: true, explain: 'One of the subtle failures of most retail traders: they journal losing sessions and skip journaling winning sessions. The result is an asymmetric understanding of their own edge \u2014 they know why they lose, but can\u2019t articulate why they win. The Operational Loop treats every session as equal-information. A clean +5.3R session tells you which patterns fired, which you correctly took, which you correctly skipped, how your sizing decisions played out. All of that data compounds. Skipping the debrief means throwing away the most important data you\u2019ll generate: data from when the system worked.' },
      { text: 'Skip is fine \u2014 only debrief losing sessions', correct: false, explain: 'This is asymmetric learning. You\u2019ll end up with detailed understanding of your losses and no systematic understanding of your wins. Compounding traders debrief every session equally because every session is data. The loop is unconditional.' },
    ],
  },
  {
    scenario: 'You\u2019re a trend trader 3 months into Level 10. Your Pattern P&L Attribution shows #4 Absorption Reversal producing 35% of your P&L \u2014 even though it\u2019s a MEAN-REV pattern, not a trend pattern. What does this tell you, and what\u2019s the Operational Loop response?',
    options: [
      { text: 'The data is telling you something important: your actual edge may not be where your self-identity says it is. You identified as a trend trader, but the dashboard + patterns + hygiene loop have revealed that 35% of your P&L comes from a mean-reversion pattern. The loop is converging on a more accurate picture of your edge than your prior self-assessment. The correct response is to trust the data over the self-identity. Expand your practice on #4 Absorption \u2014 even though it doesn\u2019t fit your "trend trader" label \u2014 because that\u2019s where your attention, your instrument, your session, and your execution actually combine best. Consider adjusting your starter playbook to include #4 as a primary.', correct: true, explain: 'The deepest lesson of the Operational Loop: the system knows your edge better than you do. Your self-assessment ("I\u2019m a trend trader") is a hypothesis. The P&L attribution is the experiment. When they disagree, trust the experiment. Many students come into Level 10 thinking they\u2019re one type of trader and emerge 3 months later realizing they\u2019re actually another type \u2014 not because their preferences changed, but because the loop surfaced their ACTUAL edge profile. The framework exists specifically to let your edge reveal itself through data rather than guessing.' },
      { text: 'Ignore \u2014 stick with trend patterns because that\u2019s who you are', correct: false, explain: 'Self-identity without evidence is just a preference. The data is evidence. When data contradicts self-identity in a reproducible way over months, the data is the stronger signal. Trust the loop over the label.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The Operational Loop states that trading is:', opts: ['A series of independent trades with independent outcomes', 'A closed feedback system where each session\u2019s alert log, P&L attribution, and debrief become inputs for the next session\u2019s calibration \u2014 scaffolding stays stable, tuning is continuous', 'Random and unlearnable', 'Only about pattern recognition'], correct: 1, explain: 'Most retail traders never experience compounding edge because they treat trades as isolated events. Professionals experience compounding edge because every session\u2019s data feeds back into the system\u2019s parameters. The loop is what makes compounding possible.' },
  { q: 'The critical distinction between Scaffolding and Tuning is:', opts: ['They\u2019re the same', 'Scaffolding = design decisions you DON\u2019T change (indicators, cascade order, pattern definitions, alert architecture); Tuning = parameters you CONTINUOUSLY adjust (which patterns to trade, filter thresholds, priority rankings)', 'Scaffolding is tuned; tuning is scaffolded', 'Only scaffolding matters'], correct: 1, explain: 'Amateurs tweak scaffolding constantly (changing indicator choices, rebuilding cascades) and their learning curve resets each time. Professionals hold scaffolding stable for months or years and tune parameters weekly. This is how compounding actually works.' },
  { q: 'Pattern P&L Attribution over 3 months typically reveals:', opts: ['Every pattern contributes equally', '2-3 patterns produce 70%+ of your P&L (Pareto) \u2014 signal that those patterns match your personal edge profile; double down on them, consider pruning the bottom 2-3', 'All patterns are losers', 'Random distribution'], correct: 1, explain: 'Pattern contributions are almost never evenly distributed. After 3 months of real data, 2-3 patterns will dominate your P&L. This isn\u2019t randomness \u2014 it\u2019s information about which patterns fit your style, instrument, session, and execution. The loop reveals your actual edge profile via attribution.' },
  { q: 'The Weekly Calibration Cycle aims to:', opts: ['Increase alert count', 'Drive noise rate down into the 10-20% target band over weeks/months through surgical filter adjustments on specific noisy patterns (not blanket tightening)', 'Remove all alerts', 'Add more patterns'], correct: 1, explain: 'Target: 10-20% noise. Above 30% means specific patterns need tighter thresholds \u2014 review the log, identify which patterns contributed most noise, find the common invalidating factor, tighten THAT pattern. Below 10% means filters are probably too tight. The weekly cycle trends noise toward target.' },
  { q: 'A professional ALWAYS debriefs after every session because:', opts: ['It\u2019s required for pay', 'Good sessions produce just as much data as bad sessions \u2014 the loop treats every session as equal-information; skipping debriefs on good days creates asymmetric learning (you understand your losses but not your wins)', 'It\u2019s optional', 'Only after losing days'], correct: 1, explain: 'One of the subtlest retail failures: journaling only losing sessions. Result is asymmetric self-knowledge \u2014 you know why you lose but can\u2019t articulate why you win. Compounding traders debrief unconditionally because every session\u2019s data compounds.' },
  { q: 'When P&L attribution contradicts your self-identity as a trader (e.g., "trend trader" but #4 Absorption Reversal produces 35% of your P&L), the correct response is:', opts: ['Ignore the data \u2014 trust your identity', 'Trust the data. Self-identity is a hypothesis; attribution is the experiment. When they disagree over months, the data is revealing your actual edge profile. Adjust your playbook to match.', 'Keep trend trading only', 'Quit the framework'], correct: 1, explain: 'The deepest lesson of the Operational Loop: the system knows your edge better than you do. When reproducible data contradicts self-identity, trust the data. Many Level 10 graduates discover their actual edge differs from their self-perception \u2014 the framework exists specifically to surface this.' },
  { q: 'The six phases of a trading day in the capstone framework are:', opts: ['Just the session hours 9:30-4:00', '(1) Pre-Market Prep 6:30-9:30 \u2022 (2) Session Open Scan 9:30-10:15 \u2022 (3) Active Monitoring 10:15-2:00 \u2022 (4) Mid-Session Review 2:00-2:30 \u2022 (5) Closing Session 2:30-4:00 \u2022 (6) Post-Session Debrief 4:00-5:00', 'Only trading and sleep', 'One long session'], correct: 1, explain: 'The six-phase structure gives every hour of the trading day a specific job. Each phase has its own cognitive mode: prep is preparation, open is scanning, active is monitoring, mid-review is decision-making, close is exit management, debrief is learning. The structure itself is the discipline.' },
  { q: 'The Mid-Session Review at 2:00 PM typically leads to:', opts: ['Sizing up after winning trades', 'Sizing DOWN after targets hit \u2014 most traders size up when winning (bad), professionals size down to protect the day\u2019s gains while staying in the game for closing-session opportunities', 'Stopping all trading', 'Doing nothing'], correct: 1, explain: 'A subtle but important discipline. When the day\u2019s targets are hit, the edge-preserving move is to SIZE DOWN, not up. Most retail traders have the opposite instinct \u2014 they size up when winning (chasing hot-hand feeling) and size down when losing (panicking). The professional inversion: size down when winning to protect the win, maintain size or pause when losing.' },
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
    const pieces = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, w: Math.random() * 8 + 4, h: Math.random() * 6 + 2, color: ['#f59e0b', '#d946ef', '#22c55e', '#ef4444', '#ffffff', '#0ea5e9'][Math.floor(Math.random() * 6)], vx: (Math.random() - 0.5) * 3, vy: Math.random() * 4 + 2, rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8, a: 1 }));
    let frames = 0;
    const draw = () => { ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p => { p.y += p.vy; p.x += p.vx; p.rot += p.rv; if (frames > 150) p.a -= 0.008; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); frames++; if (frames < 320) requestAnimationFrame(draw); };
    draw();
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9998]" />;
}

// ============================================================
// PHASE 3A END — main component added in Phase 3B
// ============================================================

// ============================================================
// MAIN PAGE (Phase 3B-1: hero + S00-S08)
// ============================================================
export default function CapstoneLesson() {
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
  const handleQuizAnswer = (qi: number, oi: number) => { if (quizAnswers[qi] !== null) return; const u = [...quizAnswers]; u[qi] = oi; setQuizAnswers(u); if (u.every(a => a !== null)) { const c = u.filter((a, i) => a === quizQuestions[i].correct).length; const pct = Math.round((c / quizQuestions.length) * 100); setQuizScore(pct); setQuizDone(true); if (pct >= 66) setTimeout(() => { setCertUnlocked(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 7000); }, 800); } };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  const mistakes = [
    { wrong: 'Skipping post-session debrief on winning days', right: 'The single most common retail failure. Traders journal losing sessions and skip journaling winning sessions, producing asymmetric self-knowledge: they understand why they lose but can\u2019t articulate why they win. Result \u2014 wins can\u2019t be reproduced systematically. The Operational Loop treats every session as equal-information. A clean +5.3R session tells you which patterns fired, which you took, which you skipped, how sizing played out \u2014 all compounding data. Skipping debriefs on good days throws away the most important data you generate: data from when the system works.', icon: '\u{1F4DD}' },
    { wrong: 'Tweaking scaffolding instead of tuning parameters', right: 'The learning-curve-reset failure. Every time you change which indicators you use, how you read the cascade, or how patterns are defined, your personal edge data resets \u2014 you can\u2019t build 3 months of attribution on a framework that\u2019s been redesigned monthly. Professionals hold scaffolding stable for 6-12+ months and tune PARAMETERS (which 2-3 patterns to trade, thresholds, priority rankings) weekly. This is how compounding edge works. Amateurs constantly rebuild; professionals tune within stable architecture.', icon: '\u{1F6E0}' },
    { wrong: 'Sizing UP after winning trades instead of DOWN', right: 'The hot-hand fallacy. Most retail traders size up when winning (chasing the feeling of being right) and size down when losing (panicking). Professionals invert this: size DOWN when winning to protect day\u2019s gains, maintain or pause when losing. The Mid-Session Review at 2:00 PM exists specifically to trigger this disciplined down-sizing. Protecting a good day\u2019s P&L from give-back is often the highest-expected-value decision you make all day.', icon: '\u{1F4C9}' },
    { wrong: 'Ignoring P&L attribution that contradicts self-identity', right: 'You call yourself a trend trader but your data shows #4 Absorption Reversal producing 35% of your P&L. The honest response is to trust the data \u2014 it\u2019s telling you your ACTUAL edge is different from your self-perceived edge. Many Level 10 graduates discover they\u2019re not the trader they thought they were \u2014 not because their preferences changed, but because the loop revealed their real edge profile via attribution. Trust the experiment over the hypothesis. Adjust the playbook to match where the P&L actually lives.', icon: '\u{1F504}' },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50"><motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500" style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }} /></div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 10 FINALE</span></div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[50px] left-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 14 &middot; <span className="text-purple-400">FINALE</span></p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Free Indicator<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Playbook Capstone</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Thirteen Groundbreaking Concepts. Six day phases. One complete operational loop. This is where it all comes together.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin the session</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Everything Comes Together Here.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Thirteen lessons. Thirteen Groundbreaking Concepts. Six indicators, seven playbook patterns, one cascade reading discipline, one alert compression architecture. Individually, each doctrine works. The question this capstone answers is: <strong className="text-white">how do they all operate together, in a single trading day, as a coherent system?</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">This lesson is not a new concept. It\u2019s a synthesis \u2014 a walkthrough of one complete trading day from 7:00 AM prep to 5:00 PM debrief, applying every prior doctrine in sequence. Pre-market setup using the Diagnostic Cascade. Open scan using the Context \u2192 Regime \u2192 Direction order. Pattern detection via the Combinatorial Edge. Alerts via the Compression Doctrine. Hygiene review via classification of every fire. And the Operational Loop that ties it all together: every session\u2019s data tunes the next session\u2019s parameters.</p>
            <p className="text-gray-400 leading-relaxed">By the end of this lesson, you will have virtually run a trading session with the complete ATLAS framework operational. The emotional endpoint is: <em className="text-amber-400">\u201cI can do this.\u201d</em> Because you\u2019ve just watched yourself do it.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#127942; THE CAPSTONE AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">A trading framework is not a collection of tools \u2014 it\u2019s an operational loop that compounds edge over time through disciplined hygiene. The scaffolding is stable; the tuning is continuous. Master this distinction and your career moves from episodic wins to systematic progression.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Operational Loop &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Trading as a Closed Feedback System</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A trading career isn\u2019t a series of independent trades with independent outcomes \u2014 it\u2019s a <strong className="text-white">closed feedback system</strong> where each session\u2019s alert log becomes next session\u2019s filter adjustment, each pattern\u2019s P&L becomes next week\u2019s priority rerank, each post-session review becomes next month\u2019s playbook refinement. The scaffolding (dashboard + patterns + alerts + hygiene) stays stable. The tuning (which patterns to trade, thresholds, priorities) is continuous. This is what compounding edge looks like in practice.</p>
          <OperationalLoopAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Operational Loop</p>
            <p className="text-sm text-gray-400 leading-relaxed">Trading is a closed feedback system with four stages: Session \u2192 Alert Log \u2192 Calibration \u2192 Playbook \u2192 back to Session. Most retail traders never experience compounding edge because they treat trades as isolated events with isolated outcomes \u2014 the loop is broken at the "Alert Log" step (no hygiene) or the "Calibration" step (no parameter tuning) or the "Playbook" step (no P&L attribution). Professionals experience compounding edge because every event feeds back into the system\u2019s configuration. Master the loop and your edge compounds; break the loop and you stagnate regardless of skill.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Weekly calibration cycle.</strong> Alert hygiene review \u2192 filter tightening \u2192 noise rate trending down over months. The system converges on your personal edge-profile through systematic parameter adjustment.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Pattern P&L attribution.</strong> Track which of the 7 patterns produces your actual P&L. After 3 months you\u2019ll find 2-3 patterns that account for 70%+ of your returns. Double down on those; consider pruning the rest. Your real edge reveals itself through attribution data.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Scaffolding vs tuning distinction.</strong> The ATLAS framework (indicators, cascade, patterns, alerts) is scaffolding \u2014 fixed, not tweaked. What you tune is the parameters (pattern mix, thresholds, session windows, rankings). Amateurs tweak scaffolding constantly; professionals tune parameters within stable scaffolding.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Day\u2019s Structure</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Phases, 10.5 Hours</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The trading day breaks into six distinct phases, each with its own cognitive mode and its own specific job. Giving each hour a named phase is the discipline \u2014 it prevents the default retail pattern of "watch chart all day, trade whenever something looks good." Instead: prep prepares, open scans, active monitors, mid-review decides, close exits, debrief learns. Structure IS the discipline.</p>
          <DayStructureAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Each Phase Has One Job</p>
            <p className="text-sm text-gray-400">The six phases in operational order: (1) <strong className="text-white">Pre-Market Prep</strong> \u2014 load tools, read news, set up alerts, pre-map levels. (2) <strong className="text-white">Session Open Scan</strong> \u2014 cascade through the dashboard top-down to identify armed patterns. (3) <strong className="text-white">Active Monitoring</strong> \u2014 respond to alert fires, execute trades, manage positions. (4) <strong className="text-white">Mid-Session Review</strong> \u2014 30-minute check-in to decide sizing for the closing session. (5) <strong className="text-white">Closing Session</strong> \u2014 tighten stops, no new entries in last 30 minutes, prepare exits. (6) <strong className="text-white">Post-Session Debrief</strong> \u2014 classify fires, attribute P&L, adjust filters. Skip any phase and you break the loop.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Phase 1: Prep</p>
          <h2 className="text-2xl font-extrabold mb-4">Pre-Market Prep (6:30 \u2013 9:30 AM)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three hours before the bell. The job: load tools, ingest overnight context, set up the alert architecture, pre-map key levels. Skipping prep is the single most costly retail mistake \u2014 you start the session cold, miss context, and end up reactive rather than prepared. Five specific tasks, in order, every session. No shortcuts, no "I\u2019ll just wing it today." Prep is non-negotiable.</p>
          <PreMarketPrepAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Pre-Mapped Levels Beat Real-Time Level-Finding</p>
            <p className="text-sm text-gray-400">The fifth prep task \u2014 pre-mapping MAZ zones and upper/lower MAE bands before the session \u2014 is the highest-leverage 15 minutes of your day. Levels noted during prep are processed calmly with full cognitive bandwidth. Levels spotted during live trading are processed under time pressure with partial attention. Pre-mapped levels let you execute mechanically on touch rather than deliberate in real-time. Write them down. Keep the list visible. Cross them off as they trigger or invalidate.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Phase 2: Open</p>
          <h2 className="text-2xl font-extrabold mb-4">Session Open Scan (9:30 \u2013 10:15 AM)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">First 45 minutes. The job: scan the dashboard top-down via the Diagnostic Cascade (10.11) to identify which patterns are armed. This is NOT the time to force entries \u2014 it\u2019s the time to establish the session\u2019s regime and sit patiently while the cascade resolves. Most retail traders torch edge here by chasing the opening range. Professionals watch, read, and wait.</p>
          <SessionOpenScanAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The First Honest Trade Rarely Comes Before 9:45</p>
            <p className="text-sm text-gray-400">The first 15 minutes of the NY session are typically auction noise \u2014 overnight orders clearing, opening range forming, MSI regime not yet stable. Reading the cascade during this window usually returns "transitional / wait." The first setup that actually meets full cascade confirmation usually fires between 9:45 and 10:30. Don\u2019t chase the open. Let the first setup earn its entry by surviving the full cascade check. The discipline of waiting is the edge.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Phase 3: Monitor</p>
          <h2 className="text-2xl font-extrabold mb-4">Active Monitoring (10:15 AM \u2013 2:00 PM)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The longest phase \u2014 3 hours 45 minutes of active engagement. Your compressed alert architecture is doing surveillance; your job is to evaluate each fire quickly, decide take/skip, and execute. Not every fire becomes a trade. The 2:1 ratio of fires-to-trades is common and healthy \u2014 it means you\u2019re filtering for context (FOMC, meetings, wrong session) rather than blindly taking every signal. The compressed alert plus the cascade read plus context awareness keeps the session quality high.</p>
          <ActiveMonitoringAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Skip Is a Valid Outcome, Not a Failure</p>
            <p className="text-sm text-gray-400">New traders feel that if an alert fires and they don\u2019t take the trade, they\u2019ve "failed" or "missed it." Wrong framing. Correctly skipping a fire is an edge-preserving action \u2014 it means your context awareness caught something the pattern didn\u2019t: a meeting window, a thin-liquidity period, a news event that invalidates the setup. Track skip-rate alongside trade-rate. A skip rate of 40-50% is normal for disciplined traders and signals you\u2019re not forcing trades just because alerts fired.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Phase 4: Mid-Session Review</p>
          <h2 className="text-2xl font-extrabold mb-4">2:00 PM Check-In \u2014 The Critical Decision Point</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Thirty minutes of deliberate review. Four KPIs: trades taken, net P&L, alert fires, noise rate. This is the moment to make the critical decision that most retail traders get wrong: <strong className="text-white">if targets are hit, size DOWN for the closing session</strong>, not up. Protect the day\u2019s gains from give-back while staying available for late-session opportunities. Sizing up after wins is the hot-hand fallacy; sizing down is professional discipline.</p>
          <MidSessionReviewAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Professional Inversion</p>
            <p className="text-sm text-gray-400">Retail instinct: size up when winning (chasing hot-hand), size down when losing (panicking). Professional inversion: size DOWN when winning to protect gains, maintain size or PAUSE when losing to preserve capital and prevent revenge-trading. The Mid-Session Review at 2:00 PM exists specifically to trigger this disciplined down-sizing. Protecting a good day\u2019s P&L from give-back is often the highest-expected-value decision you make all day \u2014 more valuable than any specific trade\u2019s outcome.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Phase 5: Close</p>
          <h2 className="text-2xl font-extrabold mb-4">Closing Session (2:30 \u2013 4:00 PM)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The final 90 minutes. The last scan at 2:30, active position management from 3:00, and the non-negotiable rule: <strong className="text-white">no new entries in the last 30 minutes</strong>. Close-positioning fade risk rises into the bell \u2014 institutional order flow shifts to closing-print positioning, which creates counter-trend moves that ambush late entries. Tighten trailing stops on winners. Close losers manually. Let the bell ring.</p>
          <ClosingSessionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Exit Management Beats Entry Selection</p>
            <p className="text-sm text-gray-400">Once you\u2019re in a trade, your entry decision is sunk cost. What remains is exit management \u2014 where do you stop out, where do you trail, where do you take profit. Most retail traders obsess over entries and wing exits. Professionals do the opposite: enter mechanically on confluence, then apply careful exit discipline. The closing session is the ultimate test \u2014 positions that have worked all day need protection from close-positioning fades. Tight stops, profit-trailing, and no new exposure in the last 30 minutes. Exit management is where career-length P&L lives.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Phase 6: Debrief</p>
          <h2 className="text-2xl font-extrabold mb-4">Post-Session Debrief (4:00 \u2013 5:00 PM)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sixty minutes that separate compounding traders from stagnating ones. Four steps: (1) export alert log, (2) classify each fire as trade/no-trade/noise, (3) attribute P&L by pattern, (4) note filter adjustments needed. This is not paperwork \u2014 this is the learning stage of the Operational Loop. Skip this and every session\u2019s data evaporates. Do this every day and the system\u2019s parameters converge on your personal edge profile over months.</p>
          <PostSessionDebriefAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Debrief Unconditionally</p>
            <p className="text-sm text-gray-400">Most retail traders journal losing sessions and skip journaling winning sessions. Result: asymmetric self-knowledge \u2014 they know why they lose but can\u2019t articulate why they win. The Operational Loop treats every session as equal-information. A clean +5.3R session tells you which patterns fired, which you took, which you skipped, how sizing decisions played out. All compounding data. Skipping the debrief on good days throws away the most important data you\u2019ll generate: data from when the system works. Debrief unconditionally. Every session is data.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Walkthrough: Morning</p>
          <h2 className="text-2xl font-extrabold mb-4">7:00 AM \u2013 11:00 AM Narrative</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A real Monday, SPY-style instrument, NY session focus. You\u2019re at your desk at 7:15 \u2014 dashboard loading, overnight news on the side. By 10:02 the cascade has resolved and Pattern #1 Launch fires cleanly. Entry at 1R position size, stop below the MAE, target mid-session. The animation below cycles through four narrative moments showing exactly how the dashboard state translates into specific actions. Read each scene as if it were your own morning.</p>
          <WalkthroughMorningAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Notice What Doesn\u2019t Happen</p>
            <p className="text-sm text-gray-400">Four moments, and three of them are "do nothing" actions: pre-map levels (prep), wait for cascade (open), trail stop (manage). Only one moment is entry (10:02 Launch). This ratio is correct. Most of trading is waiting with discipline; a small fraction is execution. Retail traders try to fill the "waiting" time with discretionary trades, destroying edge. Professionals protect the waiting time with structure (other activities, chart analysis, journal review) and only pull the trigger on cascade-confirmed setups.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Walkthrough: Midday</p>
          <h2 className="text-2xl font-extrabold mb-4">11:00 AM \u2013 2:00 PM Narrative</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Morning Launch trade closed at +2.1R at 11:18. Now through lunch \u2014 the weakest window of the day. An alert fires at 11:52, you read the cascade, MSI has flipped to Compression, you correctly SKIP. At 12:38 an Absorption pattern fires at a MAZ level; you take a reduced-size position (lunch-sized at 0.75R). Managing into 2:00 PM review. Notice how the disciplined skip at 11:52 is as valuable as the actual trades \u2014 edge comes from BOTH.</p>
          <WalkthroughMiddayAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Lunch Sizing Is a Distinct Parameter</p>
            <p className="text-sm text-gray-400">The 12:38 Absorption entry uses 0.75R position size instead of full 1R. This isn\u2019t arbitrary \u2014 lunch-hour trades carry higher noise risk because institutional flow thins out, retail noise dominates, and patterns can invalidate more readily. Size down for time-of-day risk. Professionals have three sizing modes: full size (peak hours, high-confluence), lunch size (11:30-1:00, reduced), and scratch size (closing session, protective). The framework treats sizing as dynamic parameter, not a fixed constant.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Walkthrough: Afternoon</p>
          <h2 className="text-2xl font-extrabold mb-4">2:00 \u2013 5:00 PM Narrative</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Mid-session review at 2:02 shows +3.5R net, 0% noise. Decision: size down for closing session. At 3:18 a classic Trap Fade setup develops \u2014 price pushes through upper MAZ with surface-bull MPR, but 5 of 6 layers warn the move is terminal. ERD absorption fires at the new high at 3:26. You enter short (0.5R, tight stop above). Price drops back to MAZ mid by 3:54, +1.8R on the fade. All positions closed by 4:00. Debrief at 4:30. Day total: 4 trades, 3 wins, 1 small loss, +5.3R net. All 4 patterns fired correctly. This is what a disciplined day looks like.</p>
          <WalkthroughAfternoonAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Fade Is the Day\u2019s Most Educational Trade</p>
            <p className="text-sm text-gray-400">The 3:26 Trap Fade short is the trade that demonstrates the full framework operating. Surface-level MPR reads bullish \u2014 non-cascade traders take it long and buy the top. But 5 of 6 upstream layers warn terminal exhaustion. The disciplined cascade read flips the setup into a short. This is the insight of 10.11 made operational. And the Trap Fade pattern (10.12) is designed specifically to catch this inversion. When you see the whole framework fire on one trade, the emotional unlock is: "I couldn\u2019t have read this without the training." That\u2019s Level 10 graduation.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Weekly Calibration</p>
          <h2 className="text-2xl font-extrabold mb-4">The 8-Week Convergence</h2>
          <p className="text-gray-400 leading-relaxed mb-6">One session\u2019s data is just data. Eight sessions' data is a trend. Eight weeks of weekly calibration is convergence. The hygiene loop drives noise rate down through surgical filter adjustments \u2014 not blanket tightening, but specific patterns tightened in response to specific noise. The chart below shows a realistic 8-week noise convergence: 48% \u2192 15%, landing cleanly in the target band. This is compounding edge made visible.</p>
          <WeeklyCalibrationAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Each Week Tightens One Thing</p>
            <p className="text-sm text-gray-400">The discipline isn\u2019t "make big changes each week" \u2014 it\u2019s "identify ONE pattern contributing disproportionate noise, tighten its threshold slightly, observe next week." One change per week lets you attribute noise reduction to specific adjustments. Five changes per week leaves you unable to tell which one helped. Glacial progress but directionally right; compounds over quarters. This is why professionals are boring-looking on Twitter and rich over decades.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Pattern P&L Attribution</p>
          <h2 className="text-2xl font-extrabold mb-4">Where Your Edge Actually Lives</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After 3 months of logged trades, attribute P&L back to specific patterns. The result is almost always Pareto: 2-3 patterns account for 70%+ of your returns. This isn\u2019t random \u2014 it\u2019s the loop revealing your personal edge profile. Your specific combination of attention, instrument, session, and execution favors some patterns over others. Trust the data. Double down on the top 3. Consider pruning the bottom 2-3 if they produce consistent negative contribution.</p>
          <PatternPLAttributionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The System Knows Your Edge Better Than You Do</p>
            <p className="text-sm text-gray-400">Many Level 10 graduates come in with a self-identity (\u201cI\u2019m a trend trader\u201d) and discover after 3 months that their actual edge is in a different pattern class. This isn\u2019t failure \u2014 it\u2019s success. The framework\u2019s job is to reveal your real edge profile through data rather than letting self-identity guess. When attribution contradicts identity, trust the attribution. Adjust the playbook. The Loop converges on truth about YOU, given your instrument, your attention, your session. This is how the system earns the right to be called a system.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Scaffolding vs Tuning</p>
          <h2 className="text-2xl font-extrabold mb-4">The Distinction That Makes Compounding Possible</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most important meta-distinction in this lesson. <strong className="text-sky-400">Scaffolding</strong> = the design decisions that encode doctrinal logic (indicators, cascade order, pattern definitions, alert architecture). You DON\u2019T change scaffolding \u2014 changing it breaks the logic and resets your learning curve. <strong className="text-green-400">Tuning</strong> = the parameters that adjust based on your data (which patterns to trade, thresholds, rankings, session windows, sizing rules). You CONTINUOUSLY adjust tuning based on attribution and calibration data. Amateurs tweak scaffolding constantly; professionals tune parameters within stable scaffolding.</p>
          <ScaffoldingVsTuningAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Scaffolding Must Survive 6-12 Months Minimum</p>
            <p className="text-sm text-gray-400">Commit to the scaffolding decisions for at least 6-12 months before considering any change. This is the minimum duration for P&L attribution to yield reliable signal about which patterns work for you. Changing scaffolding monthly gives you a trail of broken experiments, none long enough to converge. Holding scaffolding stable for a year while continuously tuning parameters produces a trail of learning \u2014 you know exactly what works for YOU, by data, not guess. The patience to hold scaffolding stable is itself an edge.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways the Capstone Goes Wrong</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake is a break in the Operational Loop \u2014 skipping debriefs, tweaking scaffolding, sizing wrong at the wrong moment, or ignoring data that contradicts self-perception. Avoiding these four is what separates compounding Level 10 graduates from those who plateau.</p>
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

      {/* === S16 — Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">The Operational Loop in One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Core Doctrine (\u2605)</p><p className="text-sm text-gray-300">Trading is a closed feedback system. Scaffolding stable, tuning continuous. Every session\u2019s data tunes the next session\u2019s parameters.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Six Day Phases</p><p className="text-sm text-gray-300">Prep (6:30-9:30) \u2192 Open Scan (9:30-10:15) \u2192 Monitor (10:15-2:00) \u2192 Mid-Review (2:00-2:30) \u2192 Close (2:30-4:00) \u2192 Debrief (4:00-5:00).</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Sizing Rules</p><p className="text-sm text-gray-300">Peak hours = full. Lunch (11:30-1:00) = 0.75x. Closing session after targets = 0.5x. Size DOWN when winning, maintain or pause when losing.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Debrief Discipline</p><p className="text-sm text-gray-300">Unconditional. Classify every fire: trade / no-trade / noise. Attribute P&L by pattern. Note filter adjustments. Every session is data.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Weekly Calibration</p><p className="text-sm text-gray-300">Noise target 10-20%. Above 30% \u2192 tighten ONE specific pattern this week. Surgical, not blanket. Trend down over weeks.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">P&L Attribution</p><p className="text-sm text-gray-300">3-month rolling. Expect 2-3 patterns = 70%+ of P&L. Double down on top 3. Consider pruning bottom 2-3. Trust data over identity.</p></div>
              <div><p className="text-xs font-bold text-amber-400 mb-1">Scaffolding vs Tuning</p><p className="text-sm text-gray-300">Don\u2019t touch scaffolding for 6-12 months minimum. Tune parameters weekly. Amateurs rebuild; professionals refine.</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S17 — Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Final Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Run the Loop</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you\u2019ve internalized the Operational Loop \u2014 the weekly calibration cycle, P&L attribution interpretation, scaffolding vs tuning, the unconditional debrief discipline, and trusting data over self-identity. Pass this game and you\u2019re thinking like a Level 10 graduate.</p>
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
                return (<div key={oi}><button onClick={() => handleGameAnswer(oi)} disabled={answered} className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}><span dangerouslySetInnerHTML={{ __html: opt.text }} /></button>{answered && selected && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]"><p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`} dangerouslySetInnerHTML={{ __html: `${isCorrect ? '\u2713' : '\u2717'} ${opt.explain}` }} /></motion.div>)}</div>);
              })}
            </div>
            {gameAnswers[gameRound] !== null && gameRound < gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5"><button onClick={() => setGameRound(r => r + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button></motion.div>)}
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You think in loops. The Level 10 graduate mindset is internalized.' : gameScore >= 3 ? 'Solid grasp. Review the Operational Loop and Scaffolding vs Tuning sections before the final quiz.' : 'Re-study the Operational Loop before the final quiz. This is the unifying doctrine.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === FINAL QUIZ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Final Quiz &mdash; Level 10 Graduation</p>
          <h2 className="text-2xl font-extrabold mb-6">8 Questions to Complete Level 10</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This quiz is the gate to the Level 10 Graduate certificate. Pass with 66%+ and you graduate Level 10 \u2014 ready for the PRO Arsenal in Level 11.</p>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.q }} />
                <div className="space-y-2">
                  {q.opts.map((opt, oi) => { const answered = quizAnswers[qi] !== null; const selected = quizAnswers[qi] === oi; const isCorrect = oi === q.correct; let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'; if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30'; if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30'; if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20'; return <button key={oi} onClick={() => handleQuizAnswer(qi, oi)} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: opt }} />; })}
                </div>
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">\u2713</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-4xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? '\u{1F389} You graduated Level 10! Certificate unlocks below.' : 'You need 66% to graduate Level 10. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mt-12">
              <div className="max-w-lg mx-auto p-12 rounded-3xl relative overflow-hidden border-2 border-amber-500/40" style={{ background: 'linear-gradient(145deg, rgba(15,22,38,1), rgba(25,32,54,1))', boxShadow: '0 0 60px rgba(245,158,11,0.2), inset 0 0 60px rgba(245,158,11,0.05)' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.12),transparent,rgba(14,165,233,0.08),transparent,rgba(217,70,239,0.06),transparent)] animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_70%)]" />
                <div className="relative z-10 text-center">
                  <div className="w-[100px] h-[100px] mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-sky-500 flex items-center justify-center shadow-xl shadow-amber-500/40" style={{ boxShadow: '0 0 40px rgba(245,158,11,0.5)' }}>
                    <Crown className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs tracking-[0.2em] uppercase text-amber-400 mb-2 font-bold">\u2605 Level 10 Graduation \u2605</p>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-4">Certificate of Mastery</p>
                  <p className="text-sm text-gray-300 leading-relaxed">Has successfully completed all 14 lessons of<br /><strong className="text-white text-base">Level 10: Free Indicator Arsenal</strong><br />at ATLAS Academy by Interakktive</p>
                  <div className="my-5 px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                  </div>
                  <p className="bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-400 bg-clip-text text-transparent font-extrabold text-xl mb-2" style={{ WebkitTransform: 'translateZ(0)' }}>\u2014 Free Arsenal Master \u2014</p>
                  <p className="text-[10px] text-gray-500 italic mb-4">13 Groundbreaking Concepts internalized &middot; Operational Loop active</p>
                  <p className="font-mono text-[10px] text-amber-500/70 tracking-wider uppercase">PRO-CERT-L10.14-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 italic">Level 11 (PRO Arsenal) awaits.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link href="/academy" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95">&larr; Back to Academy</Link>
      </section>

      {/* === PHASE 3B-1 END — sections S09-S17 pending === */}
    </div>
  );
}
