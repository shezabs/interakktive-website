// app/academy/lesson/reading-an-atlas-dashboard/page.tsx
// ATLAS Academy — Lesson 10.11: Reading an ATLAS Dashboard [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
// SYNTHESIS LESSON — not a single-indicator deep dive
// PHASE 1: scaffold + 5 animations (Pipeline diagram, Context, Regime, Direction, Efficiency readers)
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
// ANIMATION 1: The Diagnostic Cascade Pipeline
// Six-stage horizontal flow: Context -> Regime -> Direction -> Efficiency -> Structure -> Event
// ============================================================
function CascadePipelineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.015;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Diagnostic Cascade \u2014 Six Layers, One Direction', w / 2, 14);

    const stages = [
      { label: 'CONTEXT', sub: 'Sessions+', color: '#8B5CF6' },
      { label: 'REGIME', sub: 'MSI', color: '#0EA5E9' },
      { label: 'DIRECTION', sub: 'MPR', color: '#EC407A' },
      { label: 'EFFICIENCY', sub: 'MER', color: '#F59E0B' },
      { label: 'STRUCTURE', sub: 'MAE+MAZ', color: '#22C55E' },
      { label: 'EVENT', sub: 'ERD', color: '#EF5350' },
    ];

    const padL = 20;
    const padR = w - 20;
    const xR = padR - padL;
    const stageW = xR / stages.length;
    const y = h / 2;

    // Flow particles moving through the pipeline
    const nParticles = 20;
    for (let i = 0; i < nParticles; i++) {
      const prog = ((t + i * 0.3) % 6) / 6;
      const px = padL + prog * xR;
      const stageIdx = Math.min(stages.length - 1, Math.floor(prog * stages.length));
      ctx.fillStyle = stages[stageIdx].color + '99';
      ctx.beginPath();
      ctx.arc(px, y - 22, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stages[stageIdx].color + '55';
      ctx.beginPath();
      ctx.arc(px, y + 22, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw each stage box
    stages.forEach((s, i) => {
      const x = padL + i * stageW + stageW * 0.1;
      const boxW = stageW * 0.8;
      const boxH = 64;
      const boxY = y - boxH / 2;

      // Glow cycle
      const activeStage = Math.floor(t % stages.length);
      const isActive = i === activeStage;
      const glowA = isActive ? 0.3 + Math.sin(t * 5) * 0.2 : 0.08;

      ctx.fillStyle = s.color + Math.floor(glowA * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x, boxY, boxW, boxH);

      ctx.strokeStyle = s.color + (isActive ? 'ff' : '66');
      ctx.lineWidth = isActive ? 1.8 : 1;
      ctx.strokeRect(x, boxY, boxW, boxH);

      // Stage number
      ctx.fillStyle = s.color + 'aa';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 4, boxY + 9);

      // Label
      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, x + boxW / 2, boxY + 28);

      // Indicator
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(s.sub, x + boxW / 2, boxY + 46);

      // Arrow to next stage
      if (i < stages.length - 1) {
        const arrowX1 = x + boxW;
        const arrowX2 = x + stageW + stageW * 0.1;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(arrowX1, y);
        ctx.lineTo(arrowX2 - 3, y);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(arrowX2, y);
        ctx.lineTo(arrowX2 - 4, y - 2.5);
        ctx.lineTo(arrowX2 - 4, y + 2.5);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Question labels above each stage
    const questions = ['when?', 'what regime?', 'which way?', 'how clean?', 'where?', 'now?'];
    questions.forEach((q, i) => {
      const x = padL + i * stageW + stageW / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = 'italic 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(q, x, y - 42);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Each layer CONDITIONS how you read the next. Order is not optional.', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={180} />;
}

// ============================================================
// ANIMATION 2: Reading Context Layer (Sessions+)
// ============================================================
function ContextReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 1 \u2014 Context (Sessions+)', w / 2, 14);

    // 24-hour clock with active session highlighted
    const cx = w / 2;
    const cy = h / 2 + 6;
    const radius = Math.min(h, w) * 0.32;

    // Cycle through sessions
    const sessionIdx = Math.floor(t * 0.25) % 4;
    const sessions = [
      { name: 'ASIA', start: 0, end: 6, color: '#8B5CF6', note: 'range-biased, low participation' },
      { name: 'LONDON', start: 7, end: 12, color: '#22C55E', note: 'expansion, trend initiation' },
      { name: 'LDN\u2013NY OVERLAP', start: 13, end: 16, color: '#F59E0B', note: 'highest efficiency window' },
      { name: 'NY LATE', start: 17, end: 21, color: '#EF5350', note: 'close positioning, fade risk' },
    ];

    // Draw 24h ring base
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw each session arc
    sessions.forEach((s, i) => {
      const aStart = (s.start / 24) * Math.PI * 2 - Math.PI / 2;
      const aEnd = (s.end / 24) * Math.PI * 2 - Math.PI / 2;
      const isActive = i === sessionIdx;
      ctx.strokeStyle = s.color + (isActive ? 'ff' : '55');
      ctx.lineWidth = isActive ? 14 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, aStart, aEnd);
      ctx.stroke();

      // Label
      const midA = (aStart + aEnd) / 2;
      const lx = cx + Math.cos(midA) * (radius + 22);
      const ly = cy + Math.sin(midA) * (radius + 22);
      ctx.fillStyle = s.color + (isActive ? 'ff' : '99');
      ctx.font = `bold ${isActive ? 9 : 7}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(s.name, lx, ly);
    });

    // Active session read-out in center
    const active = sessions[sessionIdx];
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVE SESSION', cx, cy - 12);

    ctx.fillStyle = active.color;
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(active.name, cx, cy + 4);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '7px system-ui';
    ctx.fillText(active.note, cx, cy + 18);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The question context answers: "Is now a setup-worthy time?"', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: Reading Regime Layer (MSI)
// Shows 5 MSI states with cycling highlight
// ============================================================
function RegimeReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 2 \u2014 Regime (MSI)', w / 2, 14);

    const states = [
      { label: 'COMPRESSION', color: '#8A8A8A', desc: 'building up \u2022 no direction yet' },
      { label: 'EXPANSION', color: '#22C55E', desc: 'clean trend \u2022 directional travel' },
      { label: 'EXHAUSTION', color: '#F9A825', desc: 'stretched \u2022 reversion likely' },
      { label: 'REDISTRIBUTION', color: '#0EA5E9', desc: 'smart money rotating' },
      { label: 'DISLOCATION', color: '#EF5350', desc: 'panic / illiquid' },
    ];

    const active = Math.floor(t) % states.length;

    // Layout: one big active box, four compact boxes around
    const padL = 20;
    const padR = w - 20;
    const padT = 32;
    const padB = h - 24;

    // Main active display
    const mainW = (padR - padL) * 0.55;
    const mainH = padB - padT;
    const mainX = padL;
    const mainY = padT;

    const cur = states[active];
    ctx.fillStyle = cur.color + '15';
    ctx.fillRect(mainX, mainY, mainW, mainH);
    ctx.strokeStyle = cur.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mainX, mainY, mainW, mainH);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT REGIME', mainX + 10, mainY + 14);

    ctx.fillStyle = cur.color;
    ctx.font = 'bold 18px system-ui';
    ctx.fillText(cur.label, mainX + 10, mainY + 40);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '8px system-ui';
    ctx.fillText(cur.desc, mainX + 10, mainY + 56);

    // What this regime LICENSES
    const licenses: Record<string, string[]> = {
      COMPRESSION: ['read MPR as pressure-without-release', 'expect range until break', 'pre-position if MER rising'],
      EXPANSION: ['read MPR as directional conviction', 'trend-follow licensed', 'respect MER floor of 50+'],
      EXHAUSTION: ['read MPR as possibly contrarian', 'trim trend, watch reversal', 'mean-rev bias activating'],
      REDISTRIBUTION: ['read MPR with suspicion', 'accept lower MER reads', 'wait for new regime'],
      DISLOCATION: ['read all layers cautiously', 'reduce size', 'let the panic pass'],
    };

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.fillText('THIS REGIME LICENSES:', mainX + 10, mainY + 76);

    const lic = licenses[cur.label];
    lic.forEach((l, i) => {
      ctx.fillStyle = cur.color + 'dd';
      ctx.font = '7px system-ui';
      ctx.fillText(`\u2022 ${l}`, mainX + 10, mainY + 88 + i * 11);
    });

    // Mini boxes on the right
    const miniX = mainX + mainW + 8;
    const miniW = padR - miniX;
    const miniH = 22;
    const miniGap = 4;
    const totalMiniH = (states.length - 1) * (miniH + miniGap) - miniGap;
    const miniY0 = padT + (mainH - totalMiniH) / 2;

    let miniI = 0;
    states.forEach((s, i) => {
      if (i === active) return;
      const y = miniY0 + miniI * (miniH + miniGap);
      ctx.fillStyle = s.color + '08';
      ctx.fillRect(miniX, y, miniW, miniH);
      ctx.strokeStyle = s.color + '44';
      ctx.lineWidth = 1;
      ctx.strokeRect(miniX, y, miniW, miniH);

      ctx.fillStyle = s.color + 'aa';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, miniX + miniW / 2, y + miniH / 2 + 3);
      miniI++;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Regime licenses how you read every subsequent layer', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 4: Reading Direction Layer (MPR)
// Shows MPR 4-state classifier with pressure direction
// ============================================================
function DirectionReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 3 \u2014 Direction (MPR)', w / 2, 14);

    // 2x2 matrix: bull/bear x release/trap
    const padL = 50;
    const padR = w - 50;
    const padT = 36;
    const padB = h - 36;
    const chartW = padR - padL;
    const chartH = padB - padT;

    // Axes
    const midX = padL + chartW / 2;
    const midY = padT + chartH / 2;

    // Background quadrants
    // Top-left: Bearish Release (clean downtrend)
    ctx.fillStyle = 'rgba(239,83,80,0.06)';
    ctx.fillRect(padL, padT, chartW / 2, chartH / 2);
    // Top-right: Bullish Release (clean uptrend)
    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.fillRect(midX, padT, chartW / 2, chartH / 2);
    // Bottom-left: Bearish Trap
    ctx.fillStyle = 'rgba(249,168,37,0.06)';
    ctx.fillRect(padL, midY, chartW / 2, chartH / 2);
    // Bottom-right: Bullish Trap
    ctx.fillStyle = 'rgba(249,168,37,0.06)';
    ctx.fillRect(midX, midY, chartW / 2, chartH / 2);

    // Axis lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX, padT); ctx.lineTo(midX, padB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();

    // Quadrant labels
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,83,80,0.85)';
    ctx.fillText('BEARISH RELEASE', padL + chartW / 4, padT + chartH / 4 - 4);
    ctx.fillStyle = 'rgba(239,83,80,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('down, clean', padL + chartW / 4, padT + chartH / 4 + 6);

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('BULLISH RELEASE', midX + chartW / 4, padT + chartH / 4 - 4);
    ctx.fillStyle = 'rgba(34,197,94,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('up, clean', midX + chartW / 4, padT + chartH / 4 + 6);

    ctx.fillStyle = 'rgba(249,168,37,0.85)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('BEAR TRAP', padL + chartW / 4, midY + chartH / 4 - 4);
    ctx.fillStyle = 'rgba(249,168,37,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('sellers exhausted', padL + chartW / 4, midY + chartH / 4 + 6);

    ctx.fillStyle = 'rgba(249,168,37,0.85)';
    ctx.font = 'bold 8px system-ui';
    ctx.fillText('BULL TRAP', midX + chartW / 4, midY + chartH / 4 - 4);
    ctx.fillStyle = 'rgba(249,168,37,0.5)';
    ctx.font = '6px system-ui';
    ctx.fillText('buyers exhausted', midX + chartW / 4, midY + chartH / 4 + 6);

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('BEARISH', padL + chartW / 4, padT - 6);
    ctx.fillText('BULLISH', midX + chartW / 4, padT - 6);

    ctx.save();
    ctx.translate(padL - 20, padT + chartH / 4);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('RELEASE', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(padL - 20, midY + chartH / 4);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('TRAP', 0, 0);
    ctx.restore();

    // Cycling dot moving through quadrants
    const cycle = (Math.sin(t * 0.7) + 1) / 2;
    const cycle2 = (Math.cos(t * 0.9) + 1) / 2;
    const px = padL + cycle * chartW;
    const py = padT + cycle2 * chartH;

    // Dot color based on quadrant
    let dotColor = '#EC407A';
    if (cycle > 0.5 && cycle2 < 0.5) dotColor = '#22C55E';
    else if (cycle < 0.5 && cycle2 < 0.5) dotColor = '#EF5350';
    else dotColor = '#F9A825';

    // Trail
    ctx.strokeStyle = dotColor + '44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const tt = t - i * 0.02;
      const xx = padL + ((Math.sin(tt * 0.7) + 1) / 2) * chartW;
      const yy = padT + ((Math.cos(tt * 0.9) + 1) / 2) * chartH;
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();

    // Current dot
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MPR states must be READ through the MSI filter \u2014 same state, different meaning per regime', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 5: Reading Efficiency Layer (MER)
// Shows MER as go/no-go gate with bidirectional strategy verdicts
// ============================================================
function EfficiencyReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 4 \u2014 Efficiency (MER)', w / 2, 14);

    // Vertical MER gauge on left; strategy verdicts on right
    const padL = 30;
    const padR = w - 15;
    const padT = 32;
    const padB = h - 14;

    // Gauge
    const gaugeX = padL;
    const gaugeW = 28;
    const gaugeY = padT;
    const gaugeH = padB - padT;

    // Gauge zones
    // 70-100 teal, 30-70 grey, 0-30 magenta
    const highY = gaugeY + gaugeH * 0.3;
    const lowY = gaugeY + gaugeH * 0.7;

    ctx.fillStyle = 'rgba(38,166,154,0.2)';
    ctx.fillRect(gaugeX, gaugeY, gaugeW, highY - gaugeY);
    ctx.fillStyle = 'rgba(138,138,138,0.15)';
    ctx.fillRect(gaugeX, highY, gaugeW, lowY - highY);
    ctx.fillStyle = 'rgba(239,83,80,0.2)';
    ctx.fillRect(gaugeX, lowY, gaugeW, padB - lowY);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

    // Zone dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(gaugeX, highY); ctx.lineTo(gaugeX + gaugeW, highY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gaugeX, lowY); ctx.lineTo(gaugeX + gaugeW, lowY); ctx.stroke();
    ctx.setLineDash([]);

    // Ticks
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('100', gaugeX - 3, gaugeY + 4);
    ctx.fillText('70', gaugeX - 3, highY + 3);
    ctx.fillText('30', gaugeX - 3, lowY + 3);
    ctx.fillText('0', gaugeX - 3, padB - 2);

    // Animated MER value
    const mer = 50 + Math.sin(t * 0.5) * 40;
    const merY = padB - (mer / 100) * gaugeH;

    // Pointer
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.moveTo(gaugeX + gaugeW, merY);
    ctx.lineTo(gaugeX + gaugeW + 10, merY - 5);
    ctx.lineTo(gaugeX + gaugeW + 10, merY + 5);
    ctx.closePath();
    ctx.fill();

    // MER text
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${mer.toFixed(0)}`, gaugeX + gaugeW / 2, merY - 8);
    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('MER', gaugeX + gaugeW / 2, merY + 14);

    // Strategy verdicts panel
    const panelX = gaugeX + gaugeW + 60;
    const panelW = padR - panelX;

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('STRATEGY VERDICTS:', panelX, padT + 12);

    // Determine zone
    let zone = 'MID';
    if (mer >= 70) zone = 'HIGH';
    else if (mer < 30) zone = 'LOW';

    const verdicts = zone === 'HIGH'
      ? [
          { label: 'Trend-follow', verdict: 'GO', color: '#22C55E' },
          { label: 'Mean-revert', verdict: 'VETO', color: '#EF5350' },
          { label: 'Breakout', verdict: 'GO', color: '#22C55E' },
        ]
      : zone === 'LOW'
      ? [
          { label: 'Trend-follow', verdict: 'VETO', color: '#EF5350' },
          { label: 'Mean-revert', verdict: 'GO', color: '#22C55E' },
          { label: 'Breakout', verdict: 'WAIT', color: '#8A8A8A' },
        ]
      : [
          { label: 'Trend-follow', verdict: 'CAUTION', color: '#F9A825' },
          { label: 'Mean-revert', verdict: 'CAUTION', color: '#F9A825' },
          { label: 'Breakout', verdict: 'PREPARE', color: '#8A8A8A' },
        ];

    verdicts.forEach((v, i) => {
      const y = padT + 32 + i * 36;
      ctx.fillStyle = v.color + '14';
      ctx.fillRect(panelX, y, panelW, 28);
      ctx.strokeStyle = v.color + '66';
      ctx.strokeRect(panelX, y, panelW, 28);

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(v.label, panelX + 8, y + 16);

      const pulse = 1 + Math.sin(t * 3 + i) * 0.1;
      ctx.fillStyle = v.color;
      ctx.font = `bold ${11 * pulse}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText(v.verdict, panelX + panelW - 10, y + 19);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MER is a symmetric gate \u2014 same value, opposite verdicts per strategy type', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 6: Reading Structure Layer (MAE + MAZ)
// Price interacting with envelope and acceptance zones
// ============================================================
function StructureReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 5 \u2014 Structure (MAE + MAZ)', w / 2, 14);

    const padL = 20;
    const padR = w - 15;
    const padT = 30;
    const padB = h - 26;
    const chartW = padR - padL;
    const chartH = padB - padT;

    // Base
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, padT, chartW, chartH);

    // Generate price series
    const n = 55;
    const xStep = chartW / (n - 1);
    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      const base = 100 + Math.sin(i * 0.2 + t * 0.3) * 4;
      const noise = Math.sin(i * 0.8 + t) * 0.5;
      prices.push(base + noise);
    }

    const pMin = Math.min(...prices) - 1;
    const pMax = Math.max(...prices) + 1;
    const toY = (v: number) => padB - 4 - ((v - pMin) / (pMax - pMin)) * (chartH - 10);

    // MAE envelope (upper and lower)
    const envUpper: number[] = [];
    const envLower: number[] = [];
    for (let i = 0; i < n; i++) {
      // Simple envelope: price +/- rolling stddev
      let m = 0;
      const lookback = Math.min(10, i + 1);
      for (let j = 0; j < lookback; j++) m += prices[Math.max(0, i - j)];
      m /= lookback;
      let v = 0;
      for (let j = 0; j < lookback; j++) v += (prices[Math.max(0, i - j)] - m) ** 2;
      v = Math.sqrt(v / lookback);
      envUpper.push(m + v * 2.5);
      envLower.push(m - v * 2.5);
    }

    // Fill envelope
    ctx.fillStyle = 'rgba(34,197,94,0.05)';
    ctx.beginPath();
    envUpper.forEach((v, i) => {
      const x = padL + i * xStep;
      const y = toY(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    for (let i = n - 1; i >= 0; i--) {
      const x = padL + i * xStep;
      const y = toY(envLower[i]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Envelope lines
    ctx.strokeStyle = 'rgba(34,197,94,0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    envUpper.forEach((v, i) => { const x = padL + i * xStep; const y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.beginPath();
    envLower.forEach((v, i) => { const x = padL + i * xStep; const y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // MAZ zones (horizontal acceptance bands)
    const mazPrices = [101.2, 99.5, 97.8];
    mazPrices.forEach((p, i) => {
      const y = toY(p);
      ctx.fillStyle = `rgba(245,158,11,${0.08 - i * 0.015})`;
      ctx.fillRect(padL, y - 6, chartW, 12);
      ctx.strokeStyle = `rgba(245,158,11,${0.5 - i * 0.12})`;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padR, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(245,158,11,${0.85 - i * 0.2})`;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`MAZ ${i === 0 ? 'high' : i === 1 ? 'mid' : 'low'}`, padR - 4, y - 3);
    });

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    prices.forEach((v, i) => { const x = padL + i * xStep; const y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Structure event labels (envelope touch)
    const touchIdx = n - 8;
    const touchPrice = prices[touchIdx];
    const touchY = toY(touchPrice);
    const touchX = padL + touchIdx * xStep;
    const pulse = 1 + Math.sin(t * 4) * 0.2;

    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(touchX, touchY, 4 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(touchX, touchY, 4 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ENV TOUCH', touchX, touchY - 10);

    // Legend
    ctx.fillStyle = 'rgba(34,197,94,0.85)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('\u2014 MAE envelope (dynamic)', padL + 6, padT + 12);
    ctx.fillStyle = 'rgba(245,158,11,0.85)';
    ctx.fillText('-- MAZ zones (horizontal)', padL + 6, padT + 22);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Structure tells you WHERE. The other layers told you WHEN, WHAT, HOW, and WHICH WAY.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 7: Reading Event Layer (ERD)
// Histogram with sparse circle markers — the event filter
// ============================================================
function EventReaderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Layer 6 \u2014 Event (ERD)', w / 2, 14);

    const padL = 30;
    const padR = w - 15;
    const padT = 30;
    const padB = h - 26;
    const chartW = padR - padL;
    const chartH = padB - padT;

    // Mid line
    const midY = padT + chartH / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, padT, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padL, padT, chartW, chartH);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padR, midY); ctx.stroke();

    // 2sigma bands
    const upperY = midY - chartH * 0.3;
    const lowerY = midY + chartH * 0.3;
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(padL, upperY); ctx.lineTo(padR, upperY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, lowerY); ctx.lineTo(padR, lowerY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('+2\u03C3', padR - 3, upperY - 3);
    ctx.fillText('-2\u03C3', padR - 3, lowerY + 10);

    // Histogram bars
    const n = 60;
    const bW = chartW / n;
    const eventBars = new Set([12, 28, 45]);

    for (let i = 0; i < n; i++) {
      const x = padL + i * bW;
      let v: number;
      if (eventBars.has(i)) {
        // Extreme event bars
        const sign = i === 28 ? -1 : 1;
        v = sign * (40 + Math.sin(t * 3) * 4);
      } else {
        v = Math.sin(i * 0.3 + t) * 12 + Math.cos(i * 0.5 + t * 0.7) * 8;
      }

      const color = v >= 0 ? '#26A69A' : '#EF5350';
      const barY = v >= 0 ? midY - (Math.abs(v) / 50) * (chartH / 2 - 6) : midY;
      const barH = (Math.abs(v) / 50) * (chartH / 2 - 6);

      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x + 0.3, barY, bW - 0.6, barH);

      // Event markers
      if (eventBars.has(i)) {
        const barTop = v >= 0 ? barY : barY + barH;
        const pulse = 1 + Math.sin(t * 5) * 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + bW / 2, barTop, 4.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(x + bW / 2, barTop, 4.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Labels for events
    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('VACUUM', padL + 12 * bW, midY - 40);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.fillText('ABSORPTION', padL + 28 * bW, midY + 50);

    ctx.fillStyle = 'rgba(38,166,154,0.9)';
    ctx.fillText('VACUUM', padL + 45 * bW, midY - 40);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Histogram = every bar', padL + 4, padT + 12);
    ctx.fillText('Circles = ~5% of bars (z \u2265 \u00b12\u03C3)', padL + 4, padT + 22);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The event layer is the alerting layer. Everything else is ambient context.', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 8: THE DIAGNOSTIC CASCADE DOCTRINE (★ GROUNDBREAKING)
// Shows how each layer CONDITIONS the next - the key insight
// ============================================================
function CascadeDoctrineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Diagnostic Cascade Doctrine \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Same MPR reading, conditioned by different MSI regimes \u2014 opposite meanings', w / 2, 28);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(mid, 38); ctx.lineTo(mid, h - 10); ctx.stroke();

    // LEFT: MPR=Bullish Release in COMPRESSION regime
    const padLL = 15;
    const padLR = mid - 15;
    const padT = 50;
    const padB = h - 18;
    const lH = padB - padT;

    ctx.fillStyle = 'rgba(138,138,138,0.06)';
    ctx.fillRect(padLL, padT, padLR - padLL, lH);
    ctx.strokeStyle = 'rgba(138,138,138,0.4)';
    ctx.strokeRect(padLL, padT, padLR - padLL, lH);

    // Regime label box
    ctx.fillStyle = 'rgba(138,138,138,0.3)';
    ctx.fillRect(padLL + 8, padT + 8, padLR - padLL - 16, 20);
    ctx.fillStyle = '#8A8A8A';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MSI: COMPRESSION', (padLL + padLR) / 2, padT + 20);

    // MPR input - same in both
    const pulse = 0.9 + Math.sin(t * 2) * 0.1;
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.fillRect(padLL + 16, padT + 38, padLR - padLL - 32, 24);
    ctx.strokeStyle = '#22C55E';
    ctx.strokeRect(padLL + 16, padT + 38, padLR - padLL - 32, 24);
    ctx.fillStyle = '#22C55E';
    ctx.font = `bold ${10 * pulse}px system-ui`;
    ctx.fillText('MPR: BULLISH RELEASE', (padLL + padLR) / 2, padT + 54);

    // Arrow down
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((padLL + padLR) / 2, padT + 68);
    ctx.lineTo((padLL + padLR) / 2, padT + 82);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo((padLL + padLR) / 2, padT + 84);
    ctx.lineTo((padLL + padLR) / 2 - 3, padT + 80);
    ctx.lineTo((padLL + padLR) / 2 + 3, padT + 80);
    ctx.closePath();
    ctx.fill();

    // Read (output)
    ctx.fillStyle = 'rgba(139,92,246,0.15)';
    ctx.fillRect(padLL + 8, padT + 88, padLR - padLL - 16, 40);
    ctx.strokeStyle = '#8B5CF6';
    ctx.strokeRect(padLL + 8, padT + 88, padLR - padLL - 16, 40);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.fillText('READ AS:', (padLL + padLR) / 2, padT + 98);

    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('Pressure building', (padLL + padLR) / 2, padT + 110);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(139,92,246,0.85)';
    ctx.fillText('(not directional conviction yet)', (padLL + padLR) / 2, padT + 121);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2192 pre-position, wait for break', (padLL + padLR) / 2, padT + 140);

    // RIGHT: Same MPR, different regime
    const padRL = mid + 15;
    const padRR = w - 15;

    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.fillRect(padRL, padT, padRR - padRL, lH);
    ctx.strokeStyle = 'rgba(34,197,94,0.4)';
    ctx.strokeRect(padRL, padT, padRR - padRL, lH);

    ctx.fillStyle = 'rgba(34,197,94,0.3)';
    ctx.fillRect(padRL + 8, padT + 8, padRR - padRL - 16, 20);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MSI: EXPANSION', (padRL + padRR) / 2, padT + 20);

    // Same MPR
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.fillRect(padRL + 16, padT + 38, padRR - padRL - 32, 24);
    ctx.strokeStyle = '#22C55E';
    ctx.strokeRect(padRL + 16, padT + 38, padRR - padRL - 32, 24);
    ctx.fillStyle = '#22C55E';
    ctx.font = `bold ${10 * pulse}px system-ui`;
    ctx.fillText('MPR: BULLISH RELEASE', (padRL + padRR) / 2, padT + 54);

    // Arrow
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((padRL + padRR) / 2, padT + 68);
    ctx.lineTo((padRL + padRR) / 2, padT + 82);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo((padRL + padRR) / 2, padT + 84);
    ctx.lineTo((padRL + padRR) / 2 - 3, padT + 80);
    ctx.lineTo((padRL + padRR) / 2 + 3, padT + 80);
    ctx.closePath();
    ctx.fill();

    // Different read
    ctx.fillStyle = 'rgba(34,197,94,0.15)';
    ctx.fillRect(padRL + 8, padT + 88, padRR - padRL - 16, 40);
    ctx.strokeStyle = '#22C55E';
    ctx.strokeRect(padRL + 8, padT + 88, padRR - padRL - 16, 40);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 6px system-ui';
    ctx.fillText('READ AS:', (padRL + padRR) / 2, padT + 98);

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('Trend continuation', (padRL + padRR) / 2, padT + 110);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(34,197,94,0.85)';
    ctx.fillText('(conviction, directional travel)', (padRL + padRR) / 2, padT + 121);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2192 trend-follow licensed, GO', (padRL + padRR) / 2, padT + 140);

    // Footer annotation
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The earlier layers CONDITION the later layers. Reading out of order is a category error.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 9: Live Read #1 — Clean Trend Setup (SPY-style)
// All layers aligned, green across the board
// ============================================================
function LiveReadTrendAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Live Read #1 \u2014 Clean Trend Setup', w / 2, 14);

    // Six layer readouts stacked
    const layers = [
      { label: 'CONTEXT', val: 'LDN-NY Overlap', color: '#8B5CF6', verdict: '\u2713 prime window' },
      { label: 'REGIME', val: 'EXPANSION', color: '#22C55E', verdict: '\u2713 trend licensed' },
      { label: 'DIRECTION', val: 'Bullish Release', color: '#22C55E', verdict: '\u2713 upward conviction' },
      { label: 'EFFICIENCY', val: 'MER 76 (teal)', color: '#F59E0B', verdict: '\u2713 clean path' },
      { label: 'STRUCTURE', val: 'Upper MAE touch', color: '#22C55E', verdict: '\u2713 breakout level' },
      { label: 'EVENT', val: 'Vacuum marker fired', color: '#26A69A', verdict: '\u2713 statistical confirm' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 30;
    const padB = h - 30;
    const rowH = (padB - padT) / layers.length;

    // Cascade highlight: progressive reveal
    const revealIdx = Math.min(layers.length, Math.floor((t % 9) * 0.8));

    layers.forEach((l, i) => {
      const y = padT + i * rowH;
      const visible = i < revealIdx;
      const alpha = visible ? 1 : 0.15;

      // Step number
      ctx.fillStyle = `rgba(255,179,0,${0.8 * alpha})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, padL + 14, y + rowH / 2 + 3);

      // Arrow from previous
      if (i > 0 && i < revealIdx) {
        ctx.strokeStyle = 'rgba(255,179,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL + 14, y - 6);
        ctx.lineTo(padL + 14, y - 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = `${l.color}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(l.label, padL + 30, y + rowH / 2 - 3);

      // Value
      ctx.fillStyle = `rgba(255,255,255,${0.85 * alpha})`;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(l.val, padL + 30, y + rowH / 2 + 9);

      // Verdict
      ctx.fillStyle = `rgba(34,197,94,${alpha})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(l.verdict, padR - 6, y + rowH / 2 + 3);
    });

    // Final conclusion
    if (revealIdx >= layers.length) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      ctx.fillStyle = 'rgba(34,197,94,0.15)';
      ctx.fillRect(padL, padB + 2, padR - padL, 16);
      ctx.strokeStyle = '#22C55E';
      ctx.strokeRect(padL, padB + 2, padR - padL, 16);
      ctx.fillStyle = '#22C55E';
      ctx.font = `bold ${9 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('\u25B6 SIX-FOR-SIX CONFLUENCE \u2014 full-size trend entry', w / 2, padB + 14);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 10: Live Read #2 — Chop/Range Setup
// Low MER, MSI compression, mean-rev setup
// ============================================================
function LiveReadChopAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Live Read #2 \u2014 Chop/Range Setup (Mean-Rev)', w / 2, 14);

    const layers = [
      { label: 'CONTEXT', val: 'Asia lunch lull', color: '#8B5CF6', verdict: '\u26A0 range window' },
      { label: 'REGIME', val: 'COMPRESSION', color: '#8A8A8A', verdict: '\u26A0 no trend licensed' },
      { label: 'DIRECTION', val: 'Neutral', color: '#8A8A8A', verdict: '\u2013 no pressure' },
      { label: 'EFFICIENCY', val: 'MER 18 (magenta)', color: '#EF5350', verdict: '\u26D4 trend VETO' },
      { label: 'STRUCTURE', val: 'Price at MAZ low', color: '#F59E0B', verdict: '\u2713 range edge' },
      { label: 'EVENT', val: 'Absorption marker', color: '#EF5350', verdict: '\u2713 buyers defending' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 30;
    const padB = h - 30;
    const rowH = (padB - padT) / layers.length;

    const revealIdx = Math.min(layers.length, Math.floor((t % 9) * 0.8));

    layers.forEach((l, i) => {
      const y = padT + i * rowH;
      const visible = i < revealIdx;
      const alpha = visible ? 1 : 0.15;

      ctx.fillStyle = `rgba(255,179,0,${0.8 * alpha})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, padL + 14, y + rowH / 2 + 3);

      if (i > 0 && i < revealIdx) {
        ctx.strokeStyle = 'rgba(255,179,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL + 14, y - 6);
        ctx.lineTo(padL + 14, y - 2);
        ctx.stroke();
      }

      ctx.fillStyle = `${l.color}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(l.label, padL + 30, y + rowH / 2 - 3);

      ctx.fillStyle = `rgba(255,255,255,${0.85 * alpha})`;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(l.val, padL + 30, y + rowH / 2 + 9);

      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(l.verdict, padR - 6, y + rowH / 2 + 3);
    });

    if (revealIdx >= layers.length) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      ctx.fillStyle = 'rgba(239,83,80,0.12)';
      ctx.fillRect(padL, padB + 2, padR - padL, 16);
      ctx.strokeStyle = '#EF5350';
      ctx.strokeRect(padL, padB + 2, padR - padL, 16);
      ctx.fillStyle = '#EF5350';
      ctx.font = `bold ${9 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('\u25B6 MEAN-REV SETUP \u2014 fade the low, small size, tight stop', w / 2, padB + 14);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 11: Live Read #3 — Transition / Trap Setup
// Mixed signals, requires cascade resolution
// ============================================================
function LiveReadTransitionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Live Read #3 \u2014 Transition / Trap Setup', w / 2, 14);

    const layers = [
      { label: 'CONTEXT', val: 'NY late session', color: '#8B5CF6', verdict: '\u26A0 fade risk rises' },
      { label: 'REGIME', val: 'EXHAUSTION', color: '#F9A825', verdict: '\u26A0 stretched' },
      { label: 'DIRECTION', val: 'Bullish Release', color: '#22C55E', verdict: '? surface-bull' },
      { label: 'EFFICIENCY', val: 'MER 42 (falling)', color: '#8A8A8A', verdict: '\u26A0 losing steam' },
      { label: 'STRUCTURE', val: 'Above upper MAE', color: '#EF5350', verdict: '\u26A0 extended' },
      { label: 'EVENT', val: 'Absorption marker', color: '#EF5350', verdict: '\u26D4 hidden sellers' },
    ];

    const padL = 20;
    const padR = w - 20;
    const padT = 30;
    const padB = h - 30;
    const rowH = (padB - padT) / layers.length;

    const revealIdx = Math.min(layers.length, Math.floor((t % 9) * 0.8));

    layers.forEach((l, i) => {
      const y = padT + i * rowH;
      const visible = i < revealIdx;
      const alpha = visible ? 1 : 0.15;

      ctx.fillStyle = `rgba(255,179,0,${0.8 * alpha})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, padL + 14, y + rowH / 2 + 3);

      if (i > 0 && i < revealIdx) {
        ctx.strokeStyle = 'rgba(255,179,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL + 14, y - 6);
        ctx.lineTo(padL + 14, y - 2);
        ctx.stroke();
      }

      ctx.fillStyle = `${l.color}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(l.label, padL + 30, y + rowH / 2 - 3);

      ctx.fillStyle = `rgba(255,255,255,${0.85 * alpha})`;
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(l.val, padL + 30, y + rowH / 2 + 9);

      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(l.verdict, padR - 6, y + rowH / 2 + 3);
    });

    if (revealIdx >= layers.length) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      ctx.fillStyle = 'rgba(249,168,37,0.12)';
      ctx.fillRect(padL, padB + 2, padR - padL, 16);
      ctx.strokeStyle = '#F9A825';
      ctx.strokeRect(padL, padB + 2, padR - padL, 16);
      ctx.fillStyle = '#F9A825';
      ctx.font = `bold ${9 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('\u25B6 BULL TRAP \u2014 MPR surface-bull but 5/6 layers warning. Stand aside or fade.', w / 2, padB + 14);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 12: The Read-Aloud Technique
// Shows how dashboard state becomes a spoken sentence
// ============================================================
function ReadAloudAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Read-Aloud Technique', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.fillText('Dashboard state \u2192 spoken sentence = professional pattern', w / 2, 28);

    // Six badges on top showing dashboard state
    const state = [
      { label: 'LDN', color: '#8B5CF6' },
      { label: 'EXPAND', color: '#22C55E' },
      { label: 'B.REL', color: '#22C55E' },
      { label: '76', color: '#F59E0B' },
      { label: 'MAE-UP', color: '#22C55E' },
      { label: 'VAC', color: '#26A69A' },
    ];

    const badgeW = (w - 50) / state.length;
    state.forEach((s, i) => {
      const x = 20 + i * badgeW;
      const pulse = 0.9 + Math.sin(t * 2 + i * 0.8) * 0.1;
      ctx.fillStyle = s.color + '22';
      ctx.fillRect(x, 38, badgeW - 6, 22);
      ctx.strokeStyle = s.color + 'cc';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 38, badgeW - 6, 22);
      ctx.fillStyle = s.color;
      ctx.font = `bold ${8 * pulse}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(s.label, x + (badgeW - 6) / 2, 52);
    });

    // Arrow pointing down
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 66);
    ctx.lineTo(w / 2, 78);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 82);
    ctx.lineTo(w / 2 - 4, 76);
    ctx.lineTo(w / 2 + 4, 76);
    ctx.closePath();
    ctx.fill();

    // The sentence — typewriter effect
    const sentence = 'London open in expansion, bullish release, clean MER at 76, upper envelope touch with vacuum event. Trend continuation licensed. Full size.';
    const cycleT = (t * 5) % 30;
    const charCount = Math.min(sentence.length, Math.floor(cycleT * 5));
    const visible = sentence.substring(0, charCount);

    // Text box
    ctx.fillStyle = 'rgba(245,158,11,0.08)';
    ctx.fillRect(20, 90, w - 40, h - 110);
    ctx.strokeStyle = 'rgba(245,158,11,0.4)';
    ctx.strokeRect(20, 90, w - 40, h - 110);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SPEAK IT ALOUD:', 28, 104);

    // Wrap text
    ctx.fillStyle = 'rgba(245,158,11,0.95)';
    ctx.font = 'italic 10px system-ui';
    const maxW = w - 60;
    const words = visible.split(' ');
    const lines: string[] = [];
    let curLine = '';
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

    lines.forEach((line, i) => {
      ctx.fillText(line, 28, 122 + i * 14);
    });

    // Cursor blink
    if (charCount < sentence.length && Math.floor(t * 10) % 2 === 0) {
      const lastLineW = ctx.measureText(lines[lines.length - 1] || '').width;
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(28 + lastLineW + 2, 116 + (lines.length - 1) * 14, 5, 10);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('If you can\'t SAY the sentence, you don\'t have the read', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 13: Confluence Resolution
// Shows precedence hierarchy when layers disagree
// ============================================================
function ConfluenceResolutionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Confluence Resolution \u2014 When Layers Disagree', w / 2, 14);

    // Central truth table: rows = conflicts, columns = resolution rule
    const rules = [
      { conflict: 'MER says chop, MPR says release', winner: 'MER', rule: 'geometry wins over pressure' },
      { conflict: 'MSI says expand, ERD says absorb', winner: 'MSI', rule: 'regime wins over single bar' },
      { conflict: 'Structure bullish, Context quiet', winner: 'Context', rule: 'no license = no trade' },
      { conflict: 'ERD fires but MER < 30', winner: 'MER', rule: 'event needs efficient soil' },
    ];

    const padL = 15;
    const padR = w - 15;
    const padT = 30;
    const padB = h - 16;
    const rowH = (padB - padT) / rules.length;

    const activeRule = Math.floor(t * 0.5) % rules.length;

    rules.forEach((r, i) => {
      const y = padT + i * rowH + 4;
      const isActive = i === activeRule;
      const alpha = isActive ? 1 : 0.35;

      // Row background
      ctx.fillStyle = isActive ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(padL, y, padR - padL, rowH - 6);
      ctx.strokeStyle = isActive ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, y, padR - padL, rowH - 6);

      // Conflict column
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.conflict, padL + 8, y + 16);

      // Arrow
      ctx.fillStyle = `rgba(245,158,11,${alpha})`;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192', padL + (padR - padL) * 0.55, y + 18);

      // Winner
      const winColor = r.winner === 'MER' ? '#F59E0B' : r.winner === 'MSI' ? '#0EA5E9' : r.winner === 'Context' ? '#8B5CF6' : '#fff';
      ctx.fillStyle = winColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${r.winner} wins`, padL + (padR - padL) * 0.6, y + 16);

      // Rule
      ctx.fillStyle = `rgba(255,255,255,${0.65 * alpha})`;
      ctx.font = 'italic 7px system-ui';
      ctx.fillText(r.rule, padL + (padR - padL) * 0.6, y + 28);
    });
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 14: The Full Dashboard Grid (synthesis visualization)
// Everything together with coordinated highlight sweep
// ============================================================
function FullDashboardGridAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Complete ATLAS Dashboard \u2014 Six Indicators, One Read', w / 2, 14);

    // 6-pane grid: price (top, spans full width), then 5 panes below
    const padL = 15;
    const padR = w - 15;
    const padT = 28;
    const padB = h - 14;
    const totalW = padR - padL;
    const totalH = padB - padT;

    const pricePanelH = totalH * 0.35;
    const pricePanelY = padT;
    const pricePanelB = pricePanelY + pricePanelH;

    const subGridY = pricePanelB + 6;
    const subGridH = padB - subGridY;
    const subPanelW = totalW / 3;
    const subPanelH = (subGridH - 6) / 2;

    // PRICE pane at top
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padL, pricePanelY, totalW, pricePanelH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(padL, pricePanelY, totalW, pricePanelH);

    // Background envelope
    const n = 60;
    const xStep = totalW / (n - 1);
    const midPrice = pricePanelY + pricePanelH / 2;
    const envA = pricePanelH * 0.35;

    ctx.fillStyle = 'rgba(34,197,94,0.06)';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const y = midPrice - envA - Math.sin(i * 0.1 + t * 0.3) * 4;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let i = n - 1; i >= 0; i--) {
      const x = padL + i * xStep;
      const y = midPrice + envA + Math.sin(i * 0.1 + t * 0.3) * 4;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padL + i * xStep;
      const wave = Math.sin(i * 0.2 + t) * 12 + Math.sin(i * 0.4 + t * 0.6) * 6;
      const trend = (i / n) * 12 - 6;
      const y = midPrice + wave + trend;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('PRICE + MAE envelope', padL + 4, pricePanelY + 10);

    // Sub-panes: MSI, MPR, MER on top row; MAZ, ERD, Sessions on bottom
    const subs = [
      { label: 'MSI', color: '#0EA5E9', col: 0, row: 0 },
      { label: 'MPR', color: '#EC407A', col: 1, row: 0 },
      { label: 'MER', color: '#F59E0B', col: 2, row: 0 },
      { label: 'MAZ', color: '#22C55E', col: 0, row: 1 },
      { label: 'ERD', color: '#EF5350', col: 1, row: 1 },
      { label: 'SESSIONS+', color: '#8B5CF6', col: 2, row: 1 },
    ];

    // Sweep highlight
    const sweepIdx = Math.floor(t * 0.8) % subs.length;

    subs.forEach((s, i) => {
      const x = padL + s.col * subPanelW;
      const y = subGridY + s.row * (subPanelH + 6);
      const isActive = i === sweepIdx;

      ctx.fillStyle = isActive ? s.color + '18' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(x + 2, y, subPanelW - 4, subPanelH);
      ctx.strokeStyle = isActive ? s.color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x + 2, y, subPanelW - 4, subPanelH);

      // Label
      ctx.fillStyle = isActive ? s.color : s.color + '99';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, x + 8, y + 12);

      // Mini visualization
      const chartT = y + 18;
      const chartB = y + subPanelH - 4;
      const chartL = x + 6;
      const chartR = x + subPanelW - 6;
      const chartH2 = chartB - chartT;

      if (s.label === 'MSI') {
        // Color bar strip
        const nS = 30;
        const bwS = (chartR - chartL) / nS;
        for (let j = 0; j < nS; j++) {
          const phase = j * 0.3 + t;
          const v = Math.sin(phase);
          const col = v > 0.3 ? '#22C55E' : v < -0.3 ? '#EF5350' : '#8A8A8A';
          ctx.fillStyle = col;
          ctx.fillRect(chartL + j * bwS, chartT + chartH2 * 0.4, bwS - 0.5, chartH2 * 0.3);
        }
      } else if (s.label === 'MPR') {
        // Histogram bipolar
        const midYS = chartT + chartH2 / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(chartL, midYS); ctx.lineTo(chartR, midYS); ctx.stroke();
        const nS = 24;
        const bwS = (chartR - chartL) / nS;
        for (let j = 0; j < nS; j++) {
          const v = Math.sin(j * 0.4 + t) * (chartH2 / 2 - 3);
          ctx.fillStyle = v >= 0 ? '#EC407A' : '#8A8A8A';
          ctx.fillRect(chartL + j * bwS, v >= 0 ? midYS - v : midYS, bwS - 0.5, Math.abs(v));
        }
      } else if (s.label === 'MER') {
        // Line with zones
        const nS = 30;
        const bwS = (chartR - chartL) / nS;
        const hiY = chartT + chartH2 * 0.3;
        const loY = chartT + chartH2 * 0.7;
        ctx.fillStyle = 'rgba(38,166,154,0.1)';
        ctx.fillRect(chartL, chartT, chartR - chartL, hiY - chartT);
        ctx.fillStyle = 'rgba(239,83,80,0.1)';
        ctx.fillRect(chartL, loY, chartR - chartL, chartB - loY);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let j = 0; j < nS; j++) {
          const v = 50 + Math.sin(j * 0.25 + t * 0.5) * 25;
          const y2 = chartB - (v / 100) * chartH2;
          j === 0 ? ctx.moveTo(chartL + j * bwS, y2) : ctx.lineTo(chartL + j * bwS, y2);
        }
        ctx.stroke();
      } else if (s.label === 'MAZ') {
        // Horizontal bands
        for (let j = 0; j < 3; j++) {
          const y2 = chartT + chartH2 * (0.25 + j * 0.25);
          ctx.strokeStyle = `rgba(34,197,94,${0.7 - j * 0.15})`;
          ctx.setLineDash([3, 2]);
          ctx.beginPath(); ctx.moveTo(chartL, y2); ctx.lineTo(chartR, y2); ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (s.label === 'ERD') {
        // Small histogram
        const nS = 24;
        const bwS = (chartR - chartL) / nS;
        const midYS = chartT + chartH2 / 2;
        for (let j = 0; j < nS; j++) {
          const v = Math.sin(j * 0.5 + t) * (chartH2 / 2 - 3);
          ctx.fillStyle = v >= 0 ? '#26A69A' : '#EF5350';
          ctx.fillRect(chartL + j * bwS, v >= 0 ? midYS - v : midYS, bwS - 0.5, Math.abs(v));
        }
      } else if (s.label === 'SESSIONS+') {
        // Simple session rectangle
        const sessW = (chartR - chartL) / 3;
        for (let j = 0; j < 3; j++) {
          const colors = ['#8B5CF6', '#22C55E', '#F59E0B'];
          ctx.fillStyle = colors[j] + '55';
          ctx.fillRect(chartL + j * sessW, chartT + chartH2 * 0.3, sessW - 1, chartH2 * 0.4);
        }
      }
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Six instruments. One scan pattern. One sentence. One decision.', w / 2, h - 2);
  }, []);
  return <AnimScene drawFn={draw} height={320} />;
}

// ============================================================
// GAME DATA — 5 rounds testing cascade reading
// ============================================================
const gameRounds = [
  {
    scenario: 'You see this dashboard state in live conditions: <strong>MPR = Bullish Release</strong>, <strong>MER = 76 (teal)</strong>, <strong>ERD vacuum marker just fired</strong>. Three layers say go. You start to click. Then you glance at <strong>MSI = Exhaustion</strong>. What should the cascade doctrine make you do?',
    options: [
      { text: 'Pause. MSI comes BEFORE MPR in the cascade \u2014 regime conditions how you read direction. MSI Exhaustion means the market is stretched; a bullish release in that regime is likely the LAST gasp of the move, not the start of a new one. The vacuum marker is real, but in an exhausted regime it often marks the terminal thrust before reversal. Three green layers do not override one red upstream layer. Don\u2019t take the trade, or take a tiny position with a tight stop.', correct: true, explain: 'This is the cascade doctrine working exactly as intended. Reading out of order \u2014 letting MPR/MER/ERD outvote MSI \u2014 is the single most common mistake traders make with multi-indicator dashboards. Upstream layers condition how downstream layers should be interpreted. An exhausted-regime bullish release is a fundamentally different signal than an expansion-regime bullish release, even though the MPR reading is identical. Respect the hierarchy.' },
      { text: 'Take the trade \u2014 three layers confirm, ignore MSI', correct: false, explain: 'This is the cascade inversion failure. The three downstream layers (MPR/MER/ERD) only carry their usual meaning when the upstream regime supports them. Ignoring MSI Exhaustion because the other three agree is exactly the mistake the cascade doctrine exists to prevent. You\u2019re letting majority vote override hierarchy. The result in this setup is almost always buying the top.' },
    ],
  },
  {
    scenario: 'Your dashboard read for BTC at 3am UTC: <strong>Context = Asia</strong>, <strong>MSI = Compression</strong>, <strong>MPR = neutral</strong>, <strong>MER = 18</strong>, <strong>MAZ = price at lower band</strong>, <strong>ERD = absorption marker</strong>. Your gut says "bullish bounce coming." What does the cascade say?',
    options: [
      { text: 'The cascade agrees with your gut \u2014 but through a very specific logic. Context (Asia range window) + Regime (Compression, no trend license) + Direction (neutral, nothing to fight) + Efficiency (low MER VETOES trend but ENABLES mean-rev) + Structure (lower MAZ = the level you\u2019re fading FROM) + Event (absorption = buyers actively defending, the mechanical trigger). This is a textbook mean-revert setup, fully licensed by the cascade. Size appropriately, target the middle of the range, tight stop below the low.', correct: true, explain: 'The key insight here is that MER&lt;30 isn\u2019t a global veto \u2014 it\u2019s a symmetric filter. It vetoes trend entries AND licenses mean-rev entries. Reading the cascade correctly for your specific strategy type is the difference between a disciplined setup and a gut guess. When every layer lines up for mean-rev even though nothing lines up for trend, you\u2019re not trading against the dashboard \u2014 you\u2019re trading with it, in the mode the dashboard has licensed.' },
      { text: 'Low MER means no trading \u2014 stand aside', correct: false, explain: 'MER &lt; 30 vetoes TREND-follow, not all trading. This is the most common MER misreading. The Symmetric Filter Doctrine from 10.10 applies: low MER is a green light for mean-rev, red light for trend. Standing aside when the dashboard has just cleanly licensed a mean-rev setup is leaving edge on the table.' },
    ],
  },
  {
    scenario: 'Dashboard at LDN open: <strong>Context = LDN</strong>, <strong>MSI = Expansion</strong>, <strong>MPR = Bullish Release</strong>, <strong>MER = 52 (grey)</strong>, <strong>MAE = price at mid-band</strong>, <strong>ERD = quiet</strong>. Your trainee says "five out of six look good, let\u2019s go." What\u2019s your response?',
    options: [
      { text: 'Wait. Five layers favorable is the CAUSE of the temptation, not the JUSTIFICATION for the trade. The MER reading of 52 is in the grey zone \u2014 neither licensing nor vetoing. The dashboard is saying "preparing to release, not yet released." A professional waits for MER to confirm above 60+ before sizing up, because that\u2019s when the efficiency layer gives the final clearance. The cascade isn\u2019t democratic \u2014 we don\u2019t vote; we require all layers either favorable or explicitly neutral. Grey MER in what looks like a trend setup means PRE-TREND, not TREND.', correct: true, explain: 'This is the cascade as a series of filters, not a voting system. Five out of six is not better than four out of six if the one that\u2019s different is downstream and central. MER is the efficiency filter \u2014 if it\u2019s grey, the efficiency is NOT YET confirmed. The professional response is to stage the entry: small initial position when five layers align, full size only when MER crosses 60 and confirms the expansion has begun to travel efficiently. Jumping in at grey MER in an otherwise-trend-looking setup is the classic early-entry mistake that gets stopped out on the first minor retrace before the real move.' },
      { text: 'Yes \u2014 five out of six is a good signal, take it', correct: false, explain: 'This treats the cascade as a voting mechanism, which it explicitly is not. MER in grey is a specific signal: the efficiency layer has NOT YET confirmed. Professional discipline is waiting for that confirmation rather than rationalizing why five might be enough.' },
    ],
  },
  {
    scenario: 'You\u2019re narrating the dashboard aloud per the Read-Aloud Technique. You reach MPR and say "Bullish release." You reach MER and say "... 62, teal... wait, not yet, it just flipped from grey." What does this hesitation reveal about your read?',
    options: [
      { text: 'It reveals that the MER crossing UP is the actual signal moment \u2014 not the MPR bullish release. Because MER conditions whether the bullish release is trend continuation or pre-trend noise, the flip of MER from grey to teal is the precise bar where the cascade resolved from "pressure building" to "trend confirmed." Your hesitation correctly identified the transition moment. In practice, that MER flip is often the optimal entry bar \u2014 ahead of price confirmation, because the cascade confirmed before the candle closed.', correct: true, explain: 'This is one of the deepest insights of the cascade doctrine: the ENTRY MOMENT is often not the moment when your strategy says "enter" \u2014 it\u2019s the moment when the cascade resolves. The cascade resolution moment is when the final downstream layer confirms what the upstream layers suggested. MER is often that final layer because it\u2019s the efficiency gate. Professionals trained on the cascade learn to enter at the resolution moment, not at the strategy moment \u2014 and this is often 1-3 bars earlier than pattern-based entry would suggest. The Read-Aloud hesitation is your mind recognizing the cascade mechanics in real time.' },
      { text: 'It means you\u2019re bad at reading dashboards', correct: false, explain: 'The opposite. Hesitation at transition moments is a sign of sophisticated reading, not confusion. If you never hesitate, you\u2019re probably not paying attention to the cascade dynamics \u2014 just vibing off individual indicator values. The pause was your mind recognizing that the CASCADE RESOLVED in that moment. Learn to trade that moment deliberately.' },
    ],
  },
  {
    scenario: 'Your dashboard: <strong>Context = NY late</strong>, <strong>MSI = Exhaustion</strong>, <strong>MPR = Bullish Release (surface-bull)</strong>, <strong>MER = 42 and falling</strong>, <strong>MAE = above upper band (extended)</strong>, <strong>ERD = absorption marker just fired</strong>. The dashboard looks mixed. What\u2019s the definitive read?',
    options: [
      { text: 'Bull trap. The surface-bullish MPR is genuinely bullish pressure, but every other layer says this is the terminal thrust: exhausted regime, falling efficiency, extended beyond normal structure, late session fade risk, and the ERD absorption marker is the smoking gun \u2014 invisible sellers are absorbing the retail buying at this extension. The cascade doctrine says: the earliest layers (Context + MSI) set the context for trap. The later layers (MAE, ERD) provide mechanical confirmation. MPR looks bullish; the cascade reads it as the trap.', correct: true, explain: 'Perfect read. This is the cascade doctrine applied to a real-world trap pattern. Surface-bull MPR is the bait; the upstream context is the trap setup; the downstream confirmations are the trigger. Trained cascade readers flip this setup INTO A BEARISH trade \u2014 fading the absorption, selling the rally, stop above the recent high. The non-cascade trader takes the MPR at face value and buys the top. The cascade trader recognizes that pressure in an exhausted regime against rising resistance with falling efficiency and active absorption is not bullish conviction \u2014 it\u2019s the last suckers buying.' },
      { text: 'Mixed signals = stand aside', correct: false, explain: 'Stand aside is safe but misses the actual setup. The dashboard isn\u2019t &ldquo;mixed&rdquo; \u2014 it\u2019s precisely describing a trap. Every layer except surface-MPR agrees this is terminal. The cascade-informed response is not confusion; it\u2019s a specific trade thesis: fade the trap. If you can\u2019t articulate the thesis, stand aside. But &ldquo;mixed&rdquo; as a category is usually incomplete reading.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The six layers of the Diagnostic Cascade, in order, are:', opts: ['MSI, MPR, MER, MAE, MAZ, ERD', 'Context (Sessions+), Regime (MSI), Direction (MPR), Efficiency (MER), Structure (MAE + MAZ), Event (ERD)', 'ERD first, then everything else', 'Any order, they\u2019re equal'], correct: 1, explain: 'The cascade has a specific causal order: WHEN (context) \u2192 WHAT regime (MSI) \u2192 WHICH WAY (MPR) \u2192 HOW CLEAN (MER) \u2192 WHERE (structure) \u2192 NOW (event). Each layer conditions the next. Reading out of order is the most common dashboard mistake.' },
  { q: 'The Diagnostic Cascade Doctrine states that:', opts: ['All indicators are equally weighted', 'Earlier layers CONDITION how you read later layers \u2014 the same MPR reading carries entirely different meaning depending on the MSI regime that conditioned it', 'Always trust MPR above all other indicators', 'The dashboard is democratic \u2014 majority vote wins'], correct: 1, explain: 'The defining insight: the dashboard is a pipeline, not a panel. Each layer filters and conditions the next. Bullish Release MPR in Compression regime means "pressure building, pre-trend" \u2014 Bullish Release MPR in Expansion regime means "trend continuation, licensed." Same reading, different meanings, because the upstream regime conditions the downstream interpretation.' },
  { q: 'When MER says chop and MPR says release, which wins in the cascade resolution hierarchy?', opts: ['MPR always wins', 'MER wins \u2014 geometry beats pressure. Pressure without efficient travel converts to P&L losses via repeated stop-outs', 'Whichever is stronger', 'Flip a coin'], correct: 1, explain: 'The cascade resolution rule: MER wins over MPR when they conflict on trend-follow setups because MER measures whether the pressure will translate into net movement. Pressure in a chop environment doesn\u2019t produce directional P&L \u2014 it produces whipsaws. This is the same Path-Displacement Principle from 10.10 in operational form.' },
  { q: 'What does the Read-Aloud Technique require you to do?', opts: ['Read the chart silently', 'Narrate the dashboard state aloud as a complete sentence \u2014 if you can\u2019t say it, you don\u2019t have the read', 'Memorize the indicators', 'Stop using indicators entirely'], correct: 1, explain: 'The technique: translate the six dashboard layers into a spoken sentence in order. Example: "London open, expansion regime, bullish release, clean MER at 76, upper envelope touch, vacuum event \u2014 trend continuation licensed, full size." If you can\u2019t construct the sentence, the read is incomplete. This catches missing layers, unresolved conflicts, and cascade-order violations automatically. It\u2019s the simplest professional-grade reading discipline available.' },
  { q: 'MPR reads &ldquo;Bullish Release&rdquo;. MSI reads &ldquo;Exhaustion&rdquo;. Correct cascade read is:', opts: ['Trend continuation, go long full size', 'Terminal thrust / bull trap \u2014 exhausted regime means the release is likely the last gasp, not a new trend. Fade or stand aside, do not trend-follow.', 'Ignore MSI', 'MPR overrides MSI'], correct: 1, explain: 'Exhausted regime + directional pressure = terminal-thrust pattern. The regime has spent its energy; fresh pressure in that regime is typically the final push before reversal. The cascade doctrine says upstream conditions downstream: in Exhaustion, a Bullish Release MPR reads as the trap, not the trend. Never let majority-vote override hierarchy.' },
  { q: 'MER is at 52 (grey zone) and MSI + MPR look trend-bullish. The cascade reading is:', opts: ['Enter full size', 'PRE-TREND, not TREND \u2014 stage the entry small, wait for MER to confirm above 60+ before sizing up', 'Skip the trade entirely', 'Treat as chop'], correct: 1, explain: 'The cascade is not democratic \u2014 five-out-of-six favorable with grey MER is not equivalent to six-out-of-six. Grey MER means efficiency NOT YET confirmed, which specifically means pre-trend state. The professional entry is staged: small early, full when MER confirms. Jumping in at grey MER is the classic early-entry mistake that gets stopped by the first minor retrace before the real move.' },
  { q: 'Why is "Context" (Sessions+) the FIRST layer in the cascade?', opts: ['Alphabetical order', 'It sets WHEN \u2014 the window in which setups are even legitimate \u2014 and without context license, no downstream confluence is actionable. Setups during dead windows (Asia lunch, US late-close drift) are systematically lower quality regardless of what other layers say.', 'It\u2019s the least important, so it goes first', 'It has no purpose'], correct: 1, explain: 'Context is the first filter because it determines whether any setup is worth trading AT ALL. A six-for-six dashboard during the Asia lunch lull is still a poor-edge trade because the session doesn\u2019t support follow-through. Context license is the prerequisite for all downstream layers carrying their usual weight. This is why "no license = no trade" is a cascade resolution rule.' },
  { q: 'The ERD Event layer comes LAST in the cascade because:', opts: ['It\u2019s the most important', 'It\u2019s the trigger, not the thesis \u2014 ERD fires the mechanical entry on specific bars, but the thesis has to already be built by the upstream five layers. An ERD event in a chop regime is just noise; the same event in an already-licensed setup is the pull of the trigger.', 'ERD is a bad indicator', 'Order doesn\u2019t matter'], correct: 1, explain: 'ERD is the alerting/mechanical layer. It fires frequently (~5% of bars) and without upstream context its events are indistinguishable noise. When the upstream five layers have built a coherent thesis, the ERD event becomes the specific bar to pull the trigger on. Alone, ERD is vibration. In cascade, it\u2019s precision.' },
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
export default function DashboardReadingLesson() {
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
    { wrong: 'Reading the dashboard out of cascade order', right: 'The most common dashboard mistake. Glance at a random indicator that catches your eye first, then confirm with others selectively. This is confirmation bias mechanized. The cascade order (Context \u2192 Regime \u2192 Direction \u2192 Efficiency \u2192 Structure \u2192 Event) exists because each layer conditions the next. Read top to bottom, every time, without exception. Discipline of order beats cleverness of interpretation.', icon: '\u{1F9ED}' },
    { wrong: 'Treating the cascade as a voting system', right: 'Five-out-of-six favorable is NOT equivalent to six-out-of-six \u2014 especially if the one that\u2019s different is upstream (MSI, MER) or central. The cascade is a pipeline of filters; any one red upstream filter invalidates the downstream signals, no matter how many of them are green. The dashboard is not democratic. Hierarchy wins over majority.', icon: '\u{1F5F3}' },
    { wrong: 'Failing to run the Read-Aloud check', right: 'If you cannot say the dashboard state as a complete coherent sentence, your read is incomplete \u2014 you have gaps, unresolved conflicts, or unconscious assumptions. The Read-Aloud Technique is the simplest professional discipline available; it catches problems that silent reading misses. Every dashboard assessment should end with an audible sentence before any action. If the sentence feels wrong, so is the trade.', icon: '\u{1F5E3}' },
    { wrong: 'Letting MPR surface reads override upstream context', right: 'MPR is the direction layer, not the truth layer. A Bullish Release MPR in an Exhaustion regime during NY late session above upper MAE with an absorption ERD marker is NOT a bullish setup \u2014 it\u2019s a textbook trap. The MPR reads bullish on its own, but in context it reads as terminal thrust. Professionals who mastered the cascade doctrine take the FADE, not the MPR. Non-cascade traders take the bait.', icon: '\u{1F3AF}' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 11</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Reading an ATLAS<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Dashboard</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The synthesis lesson. You’ve learned each indicator. Now learn to read all of them at once — as a disciplined cascade, not a chorus.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Dashboard Is a Pipeline, Not a Panel.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Across ten lessons, you’ve met each ATLAS indicator individually. You know what MSI measures. You know what MPR detects. You know how MER constructs its geometric efficiency score. Individually, you can explain them. Together, they still present a problem: <strong className="text-white">how do you actually READ them all at once, in real time, without getting confused?</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Most retail traders solve this problem by eyeballing the chart and letting whichever indicator catches their attention first drive the decision. This produces inconsistent reads, confirmation bias, and trade selections that look different bar-by-bar for the same market conditions. The professional solution is disciplined: there is a <strong className="text-amber-400">specific order</strong> in which the dashboard is read, and that order encodes the causal structure of how markets work.</p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches the reading discipline: the six-layer cascade, the precedence rules when layers disagree, the live-read scenarios that train pattern recognition, and the Read-Aloud technique that catches incomplete reads before they become bad trades. Master the cascade and a six-indicator dashboard becomes more coherent than a single MA cross. Fail to master it and six indicators is noise.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE DASHBOARD AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every ATLAS indicator answers a different question. The dashboard answers ONE question: <em>what is the complete state of this market right now, and does that state license my strategy?</em> The only way to get a coherent answer is to read the layers in the order they condition each other.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Layers, One Direction</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Diagnostic Cascade orders the ATLAS indicators by the causal question each one answers. <strong className="text-white">Context</strong> (Sessions+) — when? <strong className="text-white">Regime</strong> (MSI) — what kind of market? <strong className="text-white">Direction</strong> (MPR) — which way is pressure flowing? <strong className="text-white">Efficiency</strong> (MER) — is the path actually going anywhere? <strong className="text-white">Structure</strong> (MAE + MAZ) — where in the chart is this happening? <strong className="text-white">Event</strong> (ERD) — is this specific bar statistically notable? Each question depends on the answer to the prior one. Reading out of order is a category error.</p>
          <CascadePipelineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Causal Order Isn&apos;t Arbitrary</p>
            <p className="text-sm text-gray-400">Context is first because it determines whether a setup is worth trading at all — no license, no trade, regardless of what’s downstream. Regime is second because it conditions how every subsequent signal should be interpreted. Direction is third because pressure without context is noise. Efficiency is fourth because pressure without efficient travel doesn’t produce P&L. Structure is fifth because you need to know WHERE the cascade-resolved setup is happening. Event is last because it’s the mechanical trigger — the specific bar when everything upstream has already confirmed. Each layer needs its predecessors. Skip one and the read is broken.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Layer 1: Context</p>
          <h2 className="text-2xl font-extrabold mb-4">Sessions+ — Setting the Window</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first question every read must answer: <strong className="text-white">is now even a setup-worthy time?</strong> Sessions+ tells you which of the four major session windows is currently active. The LDN-NY overlap (8am–12pm ET) is the highest-efficiency window across most asset classes. Asia overnight is typically range-biased with lower follow-through. NY close drift is susceptible to positioning fades. If the session doesn’t support follow-through, the most beautiful signal on MPR/MER/ERD is still a coin flip.</p>
          <ContextReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The &ldquo;No License&rdquo; Rule</p>
            <p className="text-sm text-gray-400">Session context is a prerequisite, not a suggestion. An A+ setup during Asia lunch is still a B- trade because the session doesn’t sponsor the move. An even mediocre setup at LDN open is still A- because the session machinery is actively pushing price. Many traders overlook this because they can’t see the session effect on the chart directly — it’s in the footprint of flows, not the candles. Sessions+ surfaces it explicitly: no license, no trade, regardless of what downstream layers say.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Layer 2: Regime</p>
          <h2 className="text-2xl font-extrabold mb-4">MSI — What Market Are We In?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">With the session window established, the next question: <strong className="text-white">what kind of market behavior dominates right now?</strong> MSI classifies into five regimes: Compression (range-bound, pressure building), Expansion (clean trend), Exhaustion (stretched, reversion-prone), Redistribution (smart money rotating), Dislocation (panic / illiquid). This is the CRITICAL layer because it sets the interpretation frame for everything downstream — the same MPR or ERD reading means completely different things in different regimes.</p>
          <RegimeReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Regime Licenses Behavior</p>
            <p className="text-sm text-gray-400">Think of MSI as granting specific permissions. Expansion licenses trend-following. Compression licenses pre-positioning but not trend entries. Exhaustion licenses mean-reversion and trimming trend exposure. Redistribution is a warning — accept weaker signals, watch for the new regime to emerge. Dislocation licenses almost nothing but risk management. The regime tells you which PLAYBOOK to run, not just which indicator to favor. This is the single biggest leap in sophistication once you internalize it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Layer 3: Direction</p>
          <h2 className="text-2xl font-extrabold mb-4">MPR — Which Way Is Pressure Flowing?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">With session and regime set, now you can ask about direction. MPR classifies pressure into Bullish Release, Bearish Release, Bull Trap, Bear Trap via its 4-state classifier and persistence contract. The key insight: <strong className="text-amber-400">MPR’s reading only carries its usual meaning when the MSI regime supports it.</strong> Bullish Release in Expansion = trend conviction. Bullish Release in Exhaustion = terminal thrust. Same MPR state, opposite interpretations, because the regime above it conditioned how it reads.</p>
          <DirectionReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; MPR Is NOT the Truth Layer</p>
            <p className="text-sm text-gray-400">A common mistake: reading MPR first and letting it define the thesis. This treats MPR as the source of truth and makes every downstream layer a confirmation-hunting exercise. The cascade says MPR is the DIRECTION layer, conditioned by the upstream regime. It tells you where pressure is pointing; it does NOT tell you whether to follow that pressure. Regime decides whether to follow; MPR just points. Respect the distinction and you’ll avoid most of the classic dashboard-reading pitfalls.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Layer 4: Efficiency</p>
          <h2 className="text-2xl font-extrabold mb-4">MER — Is the Path Actually Going Anywhere?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After direction comes efficiency. MPR can point powerfully one way, but if MER is low, that pressure is producing zigzag chop, not net travel. <strong className="text-white">MER is the gate layer</strong> — the final upstream filter before the structural and event layers. High MER (≥ 70) licenses trend-follow. Low MER (&lt; 30) vetoes trend but LICENSES mean-reversion (symmetric filter). Mid MER (30–70) is pre-trend state — stage entries, don’t commit full size.</p>
          <EfficiencyReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; MER Is the Tiebreaker</p>
            <p className="text-sm text-gray-400">When MSI and MPR conflict (common during regime transitions), MER is the cleanest tiebreaker because it measures geometry directly rather than inferring from secondary signals. If MPR says release but MER says chop, the cascade says: pressure exists but is not converting to travel — whipsaw conditions. If MPR neutral but MER trending, the cascade says: travel is happening in a direction pressure hasn’t registered yet — often the earliest signal of regime change. Whichever way the conflict runs, MER arbitrates.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Layer 5: Structure</p>
          <h2 className="text-2xl font-extrabold mb-4">MAE + MAZ — Where Are We?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">With the first four layers confirming a coherent thesis, the structural question becomes actionable: <strong className="text-white">where, specifically, on the chart is this happening?</strong> MAE (Market Acceptance Envelope) gives you the dynamic bounds — upper and lower edges of accepted price action. MAZ (Market Acceptance Zones) gives you horizontal support/resistance levels built from prior acceptance. Structure tells you whether a cascade-licensed setup is happening at a breakout level (MAE touch), a range edge (MAZ), or in the middle of nowhere (low-probability).</p>
          <StructureReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Structure Is Placement, Not Permission</p>
            <p className="text-sm text-gray-400">MAE/MAZ don’t authorize trades on their own — they tell you whether your cascade-licensed thesis has a high-quality LOCATION for entry. A trend-continuation thesis near the upper MAE band is different from the same thesis in open air; a mean-rev thesis at a hard MAZ level is different from the same thesis mid-range. Structure is the precision layer that takes a &ldquo;GO&rdquo; verdict from upstream and turns it into a specific price level to act on.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Layer 6: Event</p>
          <h2 className="text-2xl font-extrabold mb-4">ERD — Pull the Trigger</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The final layer: the specific bar on which your cascade-licensed, structure-located thesis gets mechanically triggered. ERD’s event markers fire on roughly 5% of bars — the bars where effort-vs-result is statistically unusual for the instrument’s own history. When that 5% event coincides with an already-fully-cascaded setup, you have the entry bar. When an ERD event fires without upstream confluence, it’s ambient noise — ignore.</p>
          <EventReaderAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The 5% That Matters</p>
            <p className="text-sm text-gray-400">ERD deliberately filters to statistically unusual bars. Without the cascade, these markers fire frequently enough to be confusing. With the cascade, they become exquisitely precise — they’re the specific bar when the upstream five layers have already resolved the question of whether to trade, and ERD is simply saying &ldquo;this is the bar.&rdquo; It’s the difference between noise (ERD alone) and signal (ERD at the end of a resolved cascade).</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Diagnostic Cascade Doctrine &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Earlier Layers Condition Later Layers</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the synthesizing insight of Level 10 — the concept that makes the dashboard work as a coherent tool rather than a parade of disconnected indicators. <strong className="text-white">Every ATLAS indicator answers a different question, and the questions have a causal order.</strong> You cannot correctly interpret MPR without knowing which MSI regime conditioned it. You cannot correctly interpret an ERD event without knowing whether MER is licensing it. The dashboard isn’t six independent signals; it’s a six-stage filter chain where the upstream stages condition the meaning of the downstream stages.</p>
          <CascadeDoctrineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Diagnostic Cascade Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">The dashboard reads as a disciplined pipeline: Context → Regime → Direction → Efficiency → Structure → Event. Each layer <strong className="text-white">conditions</strong> how the next is interpreted. Same-value readings in later layers carry fundamentally different meanings depending on the upstream state. The doctrine asserts that reading the dashboard correctly is not about which indicators you favor, how many confirm, or which lights up brightest — it’s about honoring the causal order of the questions each layer asks and interpreting each layer IN THE CONTEXT of everything upstream. Mastery of this doctrine is what separates dashboard-using traders from dashboard-reading traders.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Reading order eliminates confirmation bias.</strong> When you scan the dashboard in a fixed top-down order every time, you stop cherry-picking the indicator that happens to agree with your pre-existing bias. The cascade forces you to consider upstream layers FIRST, which means the regime informs the direction read rather than the direction read confirming a pre-formed opinion.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Cascade resolution replaces voting.</strong> When layers disagree, the cascade specifies which wins based on upstream/downstream precedence. This is mechanical and objective, not taste-based. MER wins over MPR when they conflict on trend-follow setups (geometry beats pressure). MSI wins over MPR when regimes and directions disagree (context beats signal). Context wins over everything when the session is wrong. No vote, no hand-wave — the doctrine specifies who wins.</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">The cascade resolution moment IS the entry moment.</strong> In many setups, the precise bar when the final downstream layer confirms what upstream was already suggesting is optimally 1-3 bars ahead of traditional pattern-based entries. Professionals trained on the cascade learn to fire on the resolution moment rather than waiting for price confirmation — because the cascade has already confirmed.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Live Read #1</p>
          <h2 className="text-2xl font-extrabold mb-4">Clean Trend Setup (Six-for-Six)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The rarest and cleanest setup: every cascade layer confirms the same thesis. LDN session (prime window) + Expansion regime (trend licensed) + Bullish Release (upward conviction) + MER 76 (clean efficiency) + Upper MAE touch (structural breakout level) + Vacuum ERD marker (statistical confirmation). Watch the animation for the cascading reveal — this is what professionals are scanning for. Maybe 5-10% of bars on any given instrument.</p>
          <LiveReadTrendAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Recognize the Feel</p>
            <p className="text-sm text-gray-400">When six-for-six fires, there’s a specific feel to the dashboard: everything is glowing in the same semantic family. No yellow caution boxes, no grey neutrals, no red conflicts. Your Read-Aloud sentence comes out smoothly because every clause agrees with the previous one. This feel is what you’re training the pattern recognition for. When it’s present, size appropriately. When it’s NOT present, resist the urge to force trades — wait for the next six-for-six setup rather than settling for four-for-six and hoping.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Live Read #2</p>
          <h2 className="text-2xl font-extrabold mb-4">Chop/Range Setup (Mean-Rev Licensed)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A different kind of perfect setup: the dashboard cleanly licensing mean-reversion. Asia session + Compression regime + Neutral MPR + MER 18 (trend VETOED, mean-rev LICENSED) + Price at MAZ low (the specific level to fade from) + Absorption ERD marker (buyers are defending this level actively). Notice how this setup has LOW MER and several yellow caution boxes — but the caution boxes are exactly what makes it a mean-rev setup rather than a trend setup.</p>
          <LiveReadChopAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Low MER Doesn&apos;t Mean &ldquo;Don&apos;t Trade&rdquo;</p>
            <p className="text-sm text-gray-400">The single most common dashboard mistake is treating MER &lt; 30 as a global veto. It’s not — it’s the symmetric filter from 10.10. Low MER vetoes TREND but LICENSES MEAN-REV. The cascade correctly distinguishes: when everything upstream is consistent with range behavior and MER confirms the range, you have a licensed mean-rev setup. When everything upstream suggests trend and MER is low, you have a failed trend attempt (stand aside). The difference is whether the upstream and MER agree.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Live Read #3</p>
          <h2 className="text-2xl font-extrabold mb-4">Transition / Trap Setup (Fade the Bait)</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The setup you need to recognize to protect capital. Surface-level MPR reads bullish, and non-cascade traders take that at face value. The cascade reveals: NY late session (fade risk rising) + Exhaustion regime (stretched) + MPR surface-bull (the bait) + MER 42 and FALLING (efficiency collapsing) + Price above upper MAE (over-extended) + Absorption ERD marker (hidden sellers). The upstream layers are saying trap; MPR is saying bull. The cascade resolves: fade, don’t follow.</p>
          <LiveReadTransitionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; MPR Is the Bait Layer in Traps</p>
            <p className="text-sm text-gray-400">Trap patterns have a specific signature: one layer — usually MPR — looks clearly favorable while the upstream and several downstream layers all disagree. Without the cascade, the MPR signal is compelling and easy to take. With the cascade, the MPR signal is obviously isolated — which is the EXACT thing that makes it a trap. Hidden sellers (or buyers, in a bear trap) are creating the MPR reading specifically to lure retail into the wrong direction. Trained cascade readers learn to flip these setups into fade trades.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Read-Aloud Technique</p>
          <h2 className="text-2xl font-extrabold mb-4">If You Can Say It, You&apos;ve Read It</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The simplest professional discipline available: <strong className="text-white">narrate the dashboard state aloud as a complete sentence before acting on it.</strong> &ldquo;London open in expansion, bullish release, clean MER at 76, upper envelope touch with vacuum event — trend continuation licensed, full size.&rdquo; If you can’t build the sentence, your read has gaps you haven’t noticed. If the sentence comes out halting or contradictory, the setup has conflicts you’re ignoring. The act of verbalizing catches incomplete reads that silent reading always misses.</p>
          <ReadAloudAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Sentence Structure</p>
            <p className="text-sm text-gray-400">The template: <em>&ldquo;[Session], [Regime], [MPR direction], [MER reading], [Structure context], [Event] — [Thesis], [Action].&rdquo;</em> The final clause is the trade thesis: what you intend to do and why. If the final clause doesn’t flow naturally from the first six, something upstream is incoherent. This sentence structure works because it mirrors the cascade order. Every sentence built this way is automatically in cascade order, automatically catches missing layers, and automatically surfaces conflicts between clauses. It’s the cascade discipline made linguistic.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Confluence Resolution</p>
          <h2 className="text-2xl font-extrabold mb-4">When Layers Disagree, Who Wins?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Layers will disagree — often. The cascade doctrine specifies who wins and why, based on upstream/downstream precedence rather than voting. <strong className="text-white">MER wins over MPR</strong> on trend-follow conflicts — geometry beats pressure. <strong className="text-white">MSI wins over single-bar ERD</strong> events — regime beats bar. <strong className="text-white">Context wins over everything</strong> when the session is wrong — no license, no trade. <strong className="text-white">MER wins over ERD events</strong> if the efficient soil isn’t there — events need context to be meaningful. The rules are mechanical, not intuitive.</p>
          <ConfluenceResolutionAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Precedence, Not Taste</p>
            <p className="text-sm text-gray-400">The power of mechanical resolution rules is that they remove taste from the equation. A trader who resolves conflicts by &ldquo;gut feel&rdquo; will resolve them differently depending on mood, recent P&L, and ego investment in the trade. A trader who applies cascade resolution rules will resolve them identically every time, regardless of internal state. This isn’t about being robotic — it’s about protecting yourself from your own emotional decision-making when the market is noisy and the signals are conflicting.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; The Complete Dashboard</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Panes, One Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Here’s what your complete ATLAS dashboard looks like laid out together: Price with MAE envelope on top, a 3×2 grid of MSI, MPR, MER, MAZ, ERD, and Sessions+ below. Scanning sweep demonstrates the reading order. Six instruments, one scan pattern, one Read-Aloud sentence, one decision. This is the endpoint of Level 10 — being able to look at this grid and produce a coherent trading thesis in under 30 seconds.</p>
          <FullDashboardGridAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The 30-Second Read</p>
            <p className="text-sm text-gray-400">A trained cascade reader can scan this complete dashboard and produce a full Read-Aloud sentence in under 30 seconds. That’s the operational standard. If it takes you several minutes of staring, the cascade isn’t internalized yet — practice on historical charts with the cascade order visible until the scan becomes muscle memory. The 30-second read is what enables you to cover multiple instruments, react to evolving conditions, and maintain discipline under the time pressure of live markets.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways the Dashboard Gets Misread</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake stems from abandoning the cascade discipline — treating the dashboard as a set of parallel signals rather than a pipeline of conditional filters.</p>
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
          <h2 className="text-2xl font-extrabold mb-4">The Cascade in One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Reading Order (Always)</p>
                <p className="text-sm text-gray-300">Context (Sessions+) → Regime (MSI) → Direction (MPR) → Efficiency (MER) → Structure (MAE + MAZ) → Event (ERD).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Core Doctrine (★)</p>
                <p className="text-sm text-gray-300">Earlier layers CONDITION later layers. Same-value readings carry different meanings depending on upstream state.</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Resolution Rules</p>
                <p className="text-sm text-gray-300">MER &gt; MPR on trend conflicts • MSI &gt; single-bar ERD • Context &gt; everything (no license = no trade) • MER &gt; ERD events (events need efficient soil).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Setup Archetypes</p>
                <p className="text-sm text-gray-300">Six-for-six (clean trend) • Licensed mean-rev (upstream range + low MER) • Trap (surface-MPR vs. upstream warnings).</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Read-Aloud Template</p>
                <p className="text-sm text-gray-300">&ldquo;[Session], [Regime], [Direction], [MER], [Structure], [Event] — [Thesis], [Action].&rdquo;</p>
              </div>
              <div className="pb-3 border-b border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">Operational Standard</p>
                <p className="text-sm text-gray-300">Complete dashboard read in under 30 seconds. If slower, cascade isn’t yet muscle memory — practice on historical data.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">Discipline Above All</p>
                <p className="text-sm text-gray-300">The cascade is mechanical. Read in order, resolve by precedence, narrate aloud. Remove taste; act on the doctrine.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S17 — Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Dashboard</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you read the dashboard as a disciplined cascade — honoring upstream precedence, resolving conflicts mechanically, and recognizing archetypal setups — or whether you’re still voting on indicators.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You read the dashboard as a cascade. Upstream precedence is internalized.' : gameScore >= 3 ? 'Solid grasp. Re-read the Diagnostic Cascade Doctrine section before the quiz.' : 'Re-study the cascade order and resolution rules before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S18 — Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">18 &mdash; Knowledge Check</p>
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
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">▤</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Reading an ATLAS Dashboard</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Dashboard Tactician &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.11-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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
