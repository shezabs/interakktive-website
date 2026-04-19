// app/academy/lesson/alert-architecture-free-tier/page.tsx
// ATLAS Academy — Lesson 10.13: Alert Architecture (Free Tier) [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 10
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
// ANIMATION 1: The 1-Alert Problem
// 7 patterns on one side, 1 alert slot on the other, funnel metaphor
// ============================================================
function OneAlertProblemAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The 1-Alert Problem', w / 2, 14);

    // Left: 7 patterns stacked
    const patterns = [
      { n: '#1', name: 'Launch', color: '#22C55E' },
      { n: '#2', name: 'Coil', color: '#FFB300' },
      { n: '#3', name: 'Fade', color: '#EF5350' },
      { n: '#4', name: 'Absorption', color: '#26A69A' },
      { n: '#5', name: 'Handoff', color: '#8B5CF6' },
      { n: '#6', name: 'Surge', color: '#22C55E' },
      { n: '#7', name: 'Trap', color: '#F9A825' },
    ];

    const padT = 30;
    const padB = h - 18;
    const boxLeft = 15;
    const boxW = 100;
    const rowH = (padB - padT) / patterns.length;

    patterns.forEach((p, i) => {
      const y = padT + i * rowH;
      const activePulse = Math.floor(t * 0.8) % patterns.length;
      const isActive = i === activePulse;

      ctx.fillStyle = p.color + (isActive ? '30' : '12');
      ctx.fillRect(boxLeft, y + 2, boxW, rowH - 6);
      ctx.strokeStyle = p.color + (isActive ? 'ff' : '55');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(boxLeft, y + 2, boxW, rowH - 6);

      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${p.n} ${p.name}`, boxLeft + 6, y + rowH / 2 + 3);

      // Arrow from active pattern to funnel
      if (isActive) {
        const arrowStart = boxLeft + boxW;
        const arrowY = y + rowH / 2;
        const arrowEnd = w / 2 - 30;
        ctx.strokeStyle = p.color + 'cc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowStart, arrowY);
        ctx.lineTo(arrowEnd, h / 2);
        ctx.stroke();
      }
    });

    // Funnel in middle
    const funnelX = w / 2;
    const funnelY = h / 2;
    ctx.fillStyle = 'rgba(255,179,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(funnelX - 30, funnelY - 40);
    ctx.lineTo(funnelX + 30, funnelY - 40);
    ctx.lineTo(funnelX + 10, funnelY);
    ctx.lineTo(funnelX + 10, funnelY + 30);
    ctx.lineTo(funnelX - 10, funnelY + 30);
    ctx.lineTo(funnelX - 10, funnelY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COMPRESSION', funnelX, funnelY - 48);

    // Right: single alert box
    const alertX = w - 115;
    const alertW = 100;
    const alertY = h / 2 - 30;
    const pulse = 0.4 + Math.sin(t * 3) * 0.2;

    ctx.fillStyle = `rgba(255,179,0,${pulse})`;
    ctx.fillRect(alertX, alertY, alertW, 60);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(alertX, alertY, alertW, 60);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('1 ALERT', alertX + alertW / 2, alertY + 25);
    ctx.font = '7px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('(TradingView Free)', alertX + alertW / 2, alertY + 42);

    // Arrow from funnel to alert
    ctx.strokeStyle = 'rgba(255,179,0,0.6)';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(funnelX + 12, funnelY + 20);
    ctx.lineTo(alertX - 4, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('7 patterns \u2192 1 alert slot. Architecture matters.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 2: The Alert Compression Doctrine (★)
// Shows naive (1 pattern only) vs compressed (all 7 via OR)
// ============================================================
function CompressionDoctrineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 The Alert Compression Doctrine \u2605', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('Naive: 1 pattern per alert \u2022 Doctrinal: all patterns via OR + dynamic message', w / 2, 28);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(mid, 38);
    ctx.lineTo(mid, h - 12);
    ctx.stroke();

    // LEFT: Naive approach
    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NAIVE', w / 4, 50);

    const naivePatterns = [
      { n: '#1 Launch', active: true, color: '#22C55E' },
      { n: '#2 Coil', active: false, color: '#8A8A8A' },
      { n: '#3 Fade', active: false, color: '#8A8A8A' },
      { n: '#4 Absorption', active: false, color: '#8A8A8A' },
      { n: '#5 Handoff', active: false, color: '#8A8A8A' },
      { n: '#6 Surge', active: false, color: '#8A8A8A' },
      { n: '#7 Trap', active: false, color: '#8A8A8A' },
    ];

    const naiveX = 15;
    const naiveW = w / 2 - 25;
    const naiveT = 60;
    const naiveRowH = 18;

    naivePatterns.forEach((p, i) => {
      const y = naiveT + i * naiveRowH;
      ctx.fillStyle = p.color + (p.active ? '30' : '10');
      ctx.fillRect(naiveX, y, naiveW, naiveRowH - 2);
      ctx.strokeStyle = p.color + (p.active ? 'cc' : '44');
      ctx.lineWidth = 1;
      ctx.strokeRect(naiveX, y, naiveW, naiveRowH - 2);
      ctx.fillStyle = p.color + (p.active ? 'ff' : '88');
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(p.n, naiveX + 6, y + naiveRowH / 2 + 2);

      ctx.fillStyle = p.active ? '#22C55E' : 'rgba(239,83,80,0.8)';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(p.active ? '\u2713 alerted' : '\u2717 blind', naiveX + naiveW - 6, y + naiveRowH / 2 + 2);
    });

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Only 1 pattern covered. Six blind spots.', w / 4, h - 14);

    // RIGHT: Doctrinal
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DOCTRINAL', (w * 3) / 4, 50);

    // Central alert box with rotating active pattern
    const doctX = w / 2 + 15;
    const doctW = w / 2 - 30;
    const doctY = 60;
    const doctBoxH = 7 * 18;
    const activeIdx = Math.floor(t * 0.8) % 7;

    const doctPatterns = [
      { n: '#1 Launch', color: '#22C55E' },
      { n: '#2 Coil', color: '#FFB300' },
      { n: '#3 Fade', color: '#EF5350' },
      { n: '#4 Absorption', color: '#26A69A' },
      { n: '#5 Handoff', color: '#8B5CF6' },
      { n: '#6 Surge', color: '#22C55E' },
      { n: '#7 Trap', color: '#F9A825' },
    ];

    doctPatterns.forEach((p, i) => {
      const y = doctY + i * 18;
      const isActive = i === activeIdx;
      ctx.fillStyle = p.color + (isActive ? '40' : '18');
      ctx.fillRect(doctX, y, doctW, 16);
      ctx.strokeStyle = p.color + (isActive ? 'ff' : '88');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(doctX, y, doctW, 16);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(p.n, doctX + 6, y + 10);

      ctx.fillStyle = '#22C55E';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('\u2713 covered', doctX + doctW - 6, y + 10);
    });

    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('All 7 patterns \u2014 via OR logic + dynamic message', (w * 3) / 4, h - 14);
  }, []);
  return <AnimScene drawFn={draw} height={260} />;
}

// ============================================================
// ANIMATION 3: How TradingView Alerts Work
// Visual of alert pipeline: trigger → evaluation → delivery
// ============================================================
function AlertPipelineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('How TradingView Alerts Actually Work', w / 2, 14);

    // 4-stage pipeline
    const stages = [
      { label: 'BAR TICK', sub: 'new data arrives', color: '#0EA5E9' },
      { label: 'CONDITION EVAL', sub: 'Pine script runs', color: '#22C55E' },
      { label: 'ALERT FIRES', sub: 'if condition true', color: '#FFB300' },
      { label: 'DELIVERY', sub: 'email / push / webhook', color: '#EC407A' },
    ];

    const padL = 20;
    const padR = w - 20;
    const y = h / 2;
    const stageW = (padR - padL) / stages.length;

    // Flow dots
    for (let i = 0; i < 15; i++) {
      const prog = ((t + i * 0.25) % 4) / 4;
      const px = padL + prog * (padR - padL);
      const stageIdx = Math.min(stages.length - 1, Math.floor(prog * stages.length));
      ctx.fillStyle = stages[stageIdx].color + '99';
      ctx.beginPath();
      ctx.arc(px, y - 24, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stages[stageIdx].color + '55';
      ctx.beginPath();
      ctx.arc(px, y + 24, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const active = Math.floor(t % stages.length);
    stages.forEach((s, i) => {
      const x = padL + i * stageW + stageW * 0.1;
      const boxW = stageW * 0.8;
      const boxH = 60;
      const boxY = y - boxH / 2;
      const isActive = i === active;
      const glowA = isActive ? 0.3 + Math.sin(t * 5) * 0.2 : 0.08;

      ctx.fillStyle = s.color + Math.floor(glowA * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x, boxY, boxW, boxH);
      ctx.strokeStyle = s.color + (isActive ? 'ff' : '66');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x, boxY, boxW, boxH);

      ctx.fillStyle = s.color + 'aa';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 4, boxY + 9);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, x + boxW / 2, boxY + 28);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 6px system-ui';
      ctx.fillText(s.sub, x + boxW / 2, boxY + 44);

      if (i < stages.length - 1) {
        const aX1 = x + boxW;
        const aX2 = x + stageW + stageW * 0.1;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(aX1, y);
        ctx.lineTo(aX2 - 3, y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(aX2, y);
        ctx.lineTo(aX2 - 4, y - 2.5);
        ctx.lineTo(aX2 - 4, y + 2.5);
        ctx.closePath();
        ctx.fill();
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Alerts run server-side \u2014 survive disconnection / charts closed', w / 2, h - 8);
  }, []);
  return <AnimScene drawFn={draw} height={200} />;
}

// ============================================================
// ANIMATION 4: The Single Condition Trap
// Shows how picking one pattern leaves 6 blind
// ============================================================
function SingleConditionTrapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u26A0 The Single Condition Trap', w / 2, 14);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '7px system-ui';
    ctx.fillText('Time chart \u2014 different patterns fire at different moments', w / 2, 28);

    const padL = 20;
    const padR = w - 20;
    const padT = 40;
    const padB = h - 36;
    const chartH = padB - padT;
    const chartW = padR - padL;

    // Timeline of pattern fires
    const fires = [
      { pattern: '#1 Launch', color: '#22C55E', x: 0.1, covered: true },
      { pattern: '#3 Fade', color: '#EF5350', x: 0.22, covered: false },
      { pattern: '#7 Trap', color: '#F9A825', x: 0.34, covered: false },
      { pattern: '#4 Absorption', color: '#26A69A', x: 0.48, covered: false },
      { pattern: '#1 Launch', color: '#22C55E', x: 0.6, covered: true },
      { pattern: '#5 Handoff', color: '#8B5CF6', x: 0.72, covered: false },
      { pattern: '#6 Surge', color: '#22C55E', x: 0.84, covered: false },
    ];

    // Timeline base
    const timelineY = padT + chartH / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, timelineY);
    ctx.lineTo(padR, timelineY);
    ctx.stroke();

    // Animated sweep
    const sweepX = padL + ((t * 0.3) % 1) * chartW;
    ctx.strokeStyle = 'rgba(255,179,0,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(sweepX, padT);
    ctx.lineTo(sweepX, padB);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fire markers
    fires.forEach(f => {
      const fx = padL + f.x * chartW;
      const pulse = 1 + Math.sin(t * 4 + f.x * 10) * 0.25;

      if (f.covered) {
        // Green circle (alerted)
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(fx, timelineY, 6 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(fx, timelineY, 6 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Bell icon above
        ctx.fillStyle = '#22C55E';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('\u{1F514}', fx, timelineY - 14);
      } else {
        // Red X (missed)
        ctx.fillStyle = 'rgba(239,83,80,0.4)';
        ctx.beginPath();
        ctx.arc(fx, timelineY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EF5350';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, timelineY, 5, 0, Math.PI * 2);
        ctx.stroke();

        // X mark
        ctx.strokeStyle = '#EF5350';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(fx - 3, timelineY - 3);
        ctx.lineTo(fx + 3, timelineY + 3);
        ctx.moveTo(fx + 3, timelineY - 3);
        ctx.lineTo(fx - 3, timelineY + 3);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = f.color + Math.floor((f.covered ? 255 : 120)).toString(16).padStart(2, '0');
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(fx, timelineY + 18);
      ctx.rotate(Math.PI / 6);
      ctx.fillText(f.pattern, 0, 0);
      ctx.restore();
    });

    // Summary
    const covered = fires.filter(f => f.covered).length;
    const missed = fires.length - covered;

    ctx.fillStyle = 'rgba(34,197,94,0.8)';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`\u{1F514} ${covered} alerted`, padL, h - 6);

    ctx.fillStyle = 'rgba(239,83,80,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(`\u2717 ${missed} missed`, padR, h - 6);

    // Center footer
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Alerting on one pattern = blind to 6 others firing in the same session', w / 2, h - 20);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 5: Multi-Condition OR Logic
// Shows N boolean conditions combined via OR into a single alert signal
// ============================================================
function MultiConditionORAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Multi-Condition OR Logic \u2014 The Foundational Technique', w / 2, 14);

    // 7 boolean inputs on left, OR gate in middle, single output on right
    const padT = 34;
    const padB = h - 14;

    const inputs = [
      { label: 'p1_launch', color: '#22C55E' },
      { label: 'p2_coil', color: '#FFB300' },
      { label: 'p3_fade', color: '#EF5350' },
      { label: 'p4_absorb', color: '#26A69A' },
      { label: 'p5_handoff', color: '#8B5CF6' },
      { label: 'p6_surge', color: '#22C55E' },
      { label: 'p7_trap', color: '#F9A825' },
    ];

    const inX = 20;
    const inW = 110;
    const inRowH = (padB - padT) / inputs.length;

    // Which input is TRUE this frame
    const trueIdx = Math.floor(t * 0.6) % inputs.length;

    inputs.forEach((inp, i) => {
      const y = padT + i * inRowH + 2;
      const isTrue = i === trueIdx;

      ctx.fillStyle = inp.color + (isTrue ? '30' : '10');
      ctx.fillRect(inX, y, inW, inRowH - 4);
      ctx.strokeStyle = inp.color + (isTrue ? 'ff' : '55');
      ctx.lineWidth = isTrue ? 1.5 : 1;
      ctx.strokeRect(inX, y, inW, inRowH - 4);

      ctx.fillStyle = inp.color;
      ctx.font = 'bold 7px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(inp.label, inX + 6, y + inRowH / 2);

      // Boolean state
      ctx.fillStyle = isTrue ? '#22C55E' : '#8A8A8A';
      ctx.font = 'bold 8px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(isTrue ? 'true' : 'false', inX + inW - 6, y + inRowH / 2);

      // Wire to OR gate
      const wireStartX = inX + inW;
      const wireEndX = w / 2 - 30;
      ctx.strokeStyle = isTrue ? inp.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isTrue ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(wireStartX, y + inRowH / 2);
      ctx.lineTo(wireEndX - 15, y + inRowH / 2);
      ctx.lineTo(wireEndX - 15, h / 2);
      ctx.lineTo(wireEndX, h / 2);
      ctx.stroke();

      // Signal pulse on active wire
      if (isTrue) {
        const pulsePct = (t * 2) % 1;
        const wireLen = (wireEndX - 15 - wireStartX) + Math.abs(y + inRowH / 2 - h / 2) + 15;
        const pulseAlong = pulsePct * wireLen;
        let px = wireStartX + pulseAlong;
        let py = y + inRowH / 2;
        if (pulseAlong > wireEndX - 15 - wireStartX) {
          const rem = pulseAlong - (wireEndX - 15 - wireStartX);
          px = wireEndX - 15;
          if (y + inRowH / 2 < h / 2) py = y + inRowH / 2 + rem;
          else py = y + inRowH / 2 - rem;
        }
        ctx.fillStyle = inp.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // OR gate
    const gateX = w / 2 - 30;
    const gateY = h / 2 - 28;
    const gateW = 60;
    const gateH = 56;

    ctx.fillStyle = 'rgba(255,179,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(gateX, gateY);
    ctx.quadraticCurveTo(gateX + 20, gateY + gateH / 2, gateX, gateY + gateH);
    ctx.quadraticCurveTo(gateX + gateW * 0.6, gateY + gateH, gateX + gateW, gateY + gateH / 2);
    ctx.quadraticCurveTo(gateX + gateW * 0.6, gateY, gateX, gateY);
    ctx.fill();
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('OR', gateX + gateW / 2, gateY + gateH / 2 + 4);

    // Output wire
    const outStartX = gateX + gateW;
    const outX = w - 100;
    const outY = h / 2;
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(outStartX, outY);
    ctx.lineTo(outX, outY);
    ctx.stroke();

    // Output alert box
    const pulse = 0.4 + Math.sin(t * 3) * 0.2;
    ctx.fillStyle = `rgba(255,179,0,${pulse})`;
    ctx.fillRect(outX, outY - 22, 88, 44);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(outX, outY - 22, 88, 44);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('alert_condition', outX + 44, outY - 6);
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.fillStyle = '#22C55E';
    ctx.fillText('TRUE', outX + 44, outY + 10);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ANY one of seven \u2192 single alert fires \u2014 full coverage, one slot', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 6: Dynamic Message Strings
// Shows the alert message morphing based on which pattern fired
// ============================================================
function DynamicMessageAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Dynamic Message Strings \u2014 Encoding Which Pattern Fired', w / 2, 14);

    const messages = [
      { trigger: '#1 Launch', text: '\u{1F680} LAUNCH: MSI=EXPAND \u2022 MER=76 \u2022 LDN-NY', color: '#22C55E' },
      { trigger: '#3 Fade', text: '\u{1F4C9} FADE: MSI=EXHAUST \u2022 MER\u2193 \u2022 MAE stretched', color: '#EF5350' },
      { trigger: '#4 Absorption', text: '\u{1F6E1} ABSORB: ERD fired at MAZ low \u2022 MER=19', color: '#26A69A' },
      { trigger: '#7 Trap', text: '\u{1F3AF} TRAP: MPR=BULL-TRAP \u2022 ERD vacuum \u2022 fade', color: '#F9A825' },
    ];

    const currentIdx = Math.floor(t * 0.35) % messages.length;
    const msg = messages[currentIdx];

    // Chart at top — pattern trigger
    ctx.fillStyle = msg.color + '10';
    ctx.fillRect(20, 30, w - 40, 50);
    ctx.strokeStyle = msg.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(20, 30, w - 40, 50);

    ctx.fillStyle = msg.color;
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('TRIGGERED:', 28, 44);
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(msg.trigger, 28, 64);

    const pulse = 1 + Math.sin(t * 4) * 0.2;
    ctx.fillStyle = msg.color;
    ctx.beginPath();
    ctx.arc(w - 40, 55, 5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Arrow down
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 88);
    ctx.lineTo(w / 2, 100);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 104);
    ctx.lineTo(w / 2 - 4, 98);
    ctx.lineTo(w / 2 + 4, 98);
    ctx.closePath();
    ctx.fill();

    // Message box
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.fillRect(20, 110, w - 40, h - 130);
    ctx.strokeStyle = 'rgba(255,179,0,0.4)';
    ctx.strokeRect(20, 110, w - 40, h - 130);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ALERT MESSAGE (dynamic):', 28, 124);

    // Phone notification style box
    ctx.fillStyle = 'rgba(15,20,30,0.9)';
    ctx.fillRect(30, 132, w - 60, 46);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(30, 132, w - 60, 46);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('ATLAS Dashboard', 38, 145);

    ctx.fillStyle = msg.color;
    ctx.font = 'bold 9px system-ui';
    ctx.fillText(msg.text, 38, 163);

    // Timestamp
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '6px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('now', w - 38, 145);

    // Code snippet hint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '7px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Pine: message = p1 ? "LAUNCH..." : p3 ? "FADE..." : ...', 28, h - 18);

    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Same alert slot \u2014 different message per pattern \u2014 you know what fired', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={250} />;
}

// ============================================================
// ANIMATION 7: Priority Hierarchies
// Ranking 7 patterns by edge-per-fire × rarity
// ============================================================
function PriorityHierarchyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Priority Hierarchy \u2014 Rarity \u00d7 Edge per Fire', w / 2, 14);

    const patterns = [
      { n: '#4 Absorption Reversal', rarity: 95, edge: 90, color: '#26A69A', tier: 'S' },
      { n: '#7 Trap Fade', rarity: 92, edge: 88, color: '#F9A825', tier: 'S' },
      { n: '#3 Clean Fade', rarity: 80, edge: 75, color: '#EF5350', tier: 'A' },
      { n: '#6 Participation Surge', rarity: 70, edge: 78, color: '#22C55E', tier: 'A' },
      { n: '#1 Breakout Launch', rarity: 60, edge: 70, color: '#22C55E', tier: 'B' },
      { n: '#5 Session Handoff', rarity: 55, edge: 65, color: '#8B5CF6', tier: 'B' },
      { n: '#2 Compression Coil', rarity: 40, edge: 50, color: '#FFB300', tier: 'C' },
    ];

    const padL = 15;
    const padR = w - 15;
    const padT = 30;
    const padB = h - 14;
    const rowH = (padB - padT) / patterns.length;

    const tierColors: Record<string, string> = { S: '#F59E0B', A: '#22C55E', B: '#0EA5E9', C: '#8A8A8A' };

    patterns.forEach((p, i) => {
      const y = padT + i * rowH + 2;
      const bandH = rowH - 4;

      // Tier badge
      const tBadgeW = 26;
      ctx.fillStyle = tierColors[p.tier] + '30';
      ctx.fillRect(padL, y, tBadgeW, bandH);
      ctx.strokeStyle = tierColors[p.tier];
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, y, tBadgeW, bandH);
      ctx.fillStyle = tierColors[p.tier];
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.tier, padL + tBadgeW / 2, y + bandH / 2 + 4);

      // Pattern name
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(p.n, padL + tBadgeW + 10, y + bandH / 2 + 3);

      // Rarity bar
      const barsStart = padL + tBadgeW + 140;
      const barsEnd = padR - 20;
      const barsW = barsEnd - barsStart;
      const rarityW = (p.rarity / 100) * barsW * 0.48;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(barsStart, y + bandH / 2 - 4, barsW * 0.48, 8);
      ctx.fillStyle = p.color + 'cc';
      ctx.fillRect(barsStart, y + bandH / 2 - 4, rarityW, 8);

      // Edge bar
      const edgeStart = barsStart + barsW * 0.52;
      const edgeW = (p.edge / 100) * barsW * 0.48;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(edgeStart, y + bandH / 2 - 4, barsW * 0.48, 8);
      ctx.fillStyle = '#FFB300cc';
      ctx.fillRect(edgeStart, y + bandH / 2 - 4, edgeW, 8);

      // Values
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 6px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`R${p.rarity}`, barsStart + barsW * 0.48 - 2, y + bandH / 2 - 6);
      ctx.textAlign = 'left';
      ctx.fillText(`E${p.edge}`, edgeStart + 2, y + bandH / 2 - 6);
    });

    // Active highlight
    const activeIdx = Math.floor(t * 0.4) % patterns.length;
    const activeY = padT + activeIdx * rowH + 2;
    ctx.strokeStyle = 'rgba(255,179,0,0.5)';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(padL - 2, activeY - 2, padR - padL + 4, rowH - 2);
    ctx.setLineDash([]);

    // Headers
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('RARITY', padL + 26 + 140, padT - 4);
    const barsStart = padL + 26 + 140;
    const barsEnd = padR - 20;
    const barsW = barsEnd - barsStart;
    ctx.fillText('EDGE/FIRE', barsStart + barsW * 0.52, padT - 4);
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 8: Pine Script Alert Condition Patterns
// Shows the 3 canonical code shapes for alert conditions
// ============================================================
function PineAlertPatternsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pine Script Alert Condition Patterns', w / 2, 14);

    const snippets = [
      {
        title: 'PATTERN A \u2014 Simple OR',
        code: [
          '// 1 alert \u2192 any of N conditions',
          'fire = p1_launch or p3_fade',
          '        or p4_absorption',
          'alertcondition(fire, "ATLAS",',
          '  "Pattern fired")',
        ],
        color: '#0EA5E9',
      },
      {
        title: 'PATTERN B \u2014 Dynamic Message',
        code: [
          'msg = p1_launch ? "\u{1F680} LAUNCH"',
          ' : p3_fade ? "\u{1F4C9} FADE"',
          ' : p4_absorb ? "\u{1F6E1} ABSORB"',
          ' : "UNKNOWN"',
          'if fire',
          '  alert(msg, alert.freq_once_per_bar)',
        ],
        color: '#22C55E',
      },
      {
        title: 'PATTERN C \u2014 Priority Tiered',
        code: [
          'tier_S = p4_absorb or p7_trap',
          'tier_A = p3_fade or p6_surge',
          'fire = tier_S or tier_A',
          'msg = tier_S ? "\u26A0 S-TIER"',
          '    : tier_A ? "A-TIER"',
          '    : "skip"',
        ],
        color: '#F59E0B',
      },
    ];

    const currentIdx = Math.floor(t * 0.25) % snippets.length;
    const snip = snippets[currentIdx];

    // Card
    const cardX = 20;
    const cardW = w - 40;
    const cardY = 32;
    const cardH = h - 42;

    ctx.fillStyle = snip.color + '08';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = snip.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Title
    ctx.fillStyle = snip.color;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(snip.title, cardX + 12, cardY + 18);

    // Dots indicating current snippet
    snippets.forEach((_, i) => {
      const dx = cardX + cardW - 40 + i * 12;
      ctx.fillStyle = i === currentIdx ? snip.color : snip.color + '33';
      ctx.beginPath();
      ctx.arc(dx, cardY + 15, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Code
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(cardX + 8, cardY + 26, cardW - 16, cardH - 36);

    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    snip.code.forEach((line, i) => {
      const ly = cardY + 40 + i * 14;
      // Syntax highlighting (very rough)
      if (line.trim().startsWith('//')) {
        ctx.fillStyle = 'rgba(138,138,138,0.7)';
      } else if (/\b(if|or|and|not|alertcondition|alert)\b/.test(line)) {
        ctx.fillStyle = '#EC407A';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
      }
      ctx.fillText(line, cardX + 16, ly);
    });

    // Blinking cursor
    if (Math.floor(t * 4) % 2 === 0) {
      ctx.fillStyle = snip.color;
      const lastLineY = cardY + 40 + (snip.code.length - 1) * 14;
      const lastLineW = ctx.measureText(snip.code[snip.code.length - 1]).width;
      ctx.fillRect(cardX + 16 + lastLineW + 2, lastLineY - 7, 5, 10);
    }
  }, []);
  return <AnimScene drawFn={draw} height={280} />;
}

// ============================================================
// ANIMATION 9: The Compression Architecture (reference design)
// Shows the full alert architecture as a system diagram
// ============================================================
function CompressionArchitectureAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('The Compression Architecture \u2014 Reference Design', w / 2, 14);

    // Layer 1: Pattern inputs (7 dots on left)
    const inX = 25;
    const inY1 = 40;
    const inSpacing = (h - 70) / 7;
    const inputs = ['\u2460', '\u2461', '\u2462', '\u2463', '\u2464', '\u2465', '\u2466'];
    const colors = ['#22C55E', '#FFB300', '#EF5350', '#26A69A', '#8B5CF6', '#22C55E', '#F9A825'];

    const fireIdx = Math.floor(t * 0.5) % 7;

    inputs.forEach((label, i) => {
      const y = inY1 + i * inSpacing;
      const isFire = i === fireIdx;
      ctx.fillStyle = colors[i] + (isFire ? 'ff' : '30');
      ctx.beginPath();
      ctx.arc(inX, y, isFire ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, inX, y + 3);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PATTERNS', inX, 32);

    // Layer 2: Tier filter
    const t2X = 130;
    const tiers = [
      { label: 'S', color: '#F59E0B', patterns: [3, 6], y: 70 },
      { label: 'A', color: '#22C55E', patterns: [2, 5], y: 120 },
      { label: 'B', color: '#0EA5E9', patterns: [0, 4], y: 170 },
      { label: 'C', color: '#8A8A8A', patterns: [1], y: 220 },
    ];

    tiers.forEach(tier => {
      const boxW = 50;
      const boxH = 28;
      const containsFire = tier.patterns.includes(fireIdx);
      ctx.fillStyle = tier.color + (containsFire ? '30' : '10');
      ctx.fillRect(t2X, tier.y - boxH / 2, boxW, boxH);
      ctx.strokeStyle = tier.color + (containsFire ? 'ff' : '66');
      ctx.lineWidth = containsFire ? 1.5 : 1;
      ctx.strokeRect(t2X, tier.y - boxH / 2, boxW, boxH);
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tier.label, t2X + boxW / 2, tier.y + 4);

      // Wires from patterns to tier
      tier.patterns.forEach(pi => {
        const inPY = inY1 + pi * inSpacing;
        const isActiveWire = pi === fireIdx;
        ctx.strokeStyle = isActiveWire ? colors[pi] : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = isActiveWire ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(inX + 8, inPY);
        ctx.lineTo(t2X - 2, tier.y);
        ctx.stroke();
      });
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('TIERS', t2X + 25, 32);

    // Layer 3: OR gate
    const gateX = 235;
    const gateY = h / 2 + 10;
    const gateW = 60;
    const gateH = 40;
    ctx.fillStyle = 'rgba(255,179,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(gateX, gateY - gateH / 2);
    ctx.quadraticCurveTo(gateX + 20, gateY, gateX, gateY + gateH / 2);
    ctx.quadraticCurveTo(gateX + gateW * 0.6, gateY + gateH / 2, gateX + gateW, gateY);
    ctx.quadraticCurveTo(gateX + gateW * 0.6, gateY - gateH / 2, gateX, gateY - gateH / 2);
    ctx.fill();
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('OR', gateX + gateW / 2, gateY + 4);

    // Wires from tiers to gate
    tiers.forEach(tier => {
      const isActive = tier.patterns.includes(fireIdx);
      ctx.strokeStyle = isActive ? tier.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(t2X + 50, tier.y);
      ctx.lineTo(gateX - 2, gateY);
      ctx.stroke();
    });

    // Message builder
    const msgX = 315;
    const msgY = gateY - 20;
    ctx.fillStyle = 'rgba(34,197,94,0.1)';
    ctx.fillRect(msgX, msgY, 90, 40);
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(msgX, msgY, 90, 40);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MESSAGE', msgX + 45, msgY + 14);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '6px system-ui';
    ctx.fillText('BUILDER', msgX + 45, msgY + 24);
    ctx.fillText('(conditional)', msgX + 45, msgY + 33);

    // Wire from gate
    ctx.strokeStyle = '#FFB300cc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gateX + gateW, gateY);
    ctx.lineTo(msgX, gateY);
    ctx.stroke();

    // Alert output
    const outX = w - 90;
    const outY = gateY;
    const pulse = 0.4 + Math.sin(t * 4) * 0.2;
    ctx.fillStyle = `rgba(255,179,0,${pulse})`;
    ctx.fillRect(outX - 40, outY - 22, 80, 44);
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(outX - 40, outY - 22, 80, 44);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u{1F514}', outX, outY - 6);
    ctx.font = 'bold 7px system-ui';
    ctx.fillText('ALERT', outX, outY + 8);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '6px system-ui';
    ctx.fillText('(1 slot)', outX, outY + 18);

    // Wire to output
    ctx.strokeStyle = '#FFB300cc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(msgX + 90, outY);
    ctx.lineTo(outX - 40, outY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Patterns \u2192 Tiers \u2192 OR \u2192 Dynamic Message \u2192 1 Alert', w / 2, h - 6);
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 10: Alert Hygiene — the log as data
// Scrolling list of alerts classified as trade / no-trade / noise
// ============================================================
function AlertHygieneAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Alert Hygiene \u2014 The Log Is Your P&L-Adjacent Data Stream', w / 2, 14);

    const entries = [
      { time: '09:12', pattern: '#1 LAUNCH', outcome: 'trade', note: '\u2713 taken \u2022 +1.8R', color: '#22C55E' },
      { time: '10:47', pattern: '#3 FADE', outcome: 'no-trade', note: '\u2013 context wrong (FOMC)', color: '#F59E0B' },
      { time: '11:23', pattern: '#4 ABSORPTION', outcome: 'trade', note: '\u2713 taken \u2022 +2.1R', color: '#22C55E' },
      { time: '13:05', pattern: '#1 LAUNCH', outcome: 'noise', note: '\u2717 fake \u2014 filter too loose', color: '#EF5350' },
      { time: '14:38', pattern: '#7 TRAP', outcome: 'trade', note: '\u2713 taken \u2022 -0.4R stopped', color: '#22C55E' },
      { time: '15:22', pattern: '#6 SURGE', outcome: 'no-trade', note: '\u2013 missed (meeting)', color: '#F59E0B' },
      { time: '15:58', pattern: '#3 FADE', outcome: 'noise', note: '\u2717 MER still grey', color: '#EF5350' },
    ];

    const padL = 15;
    const padR = w - 15;
    const padT = 32;
    const padB = h - 60;
    const listH = padB - padT;
    const rowH = 22;
    const maxVisible = Math.floor(listH / rowH);

    // Scroll offset
    const scrollOff = (t * 8) % (entries.length * rowH);

    // Clip and draw
    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, padT, padR - padL, listH);
    ctx.clip();

    for (let i = 0; i < entries.length * 2; i++) {
      const e = entries[i % entries.length];
      const y = padT + i * rowH - scrollOff + 2;
      if (y + rowH < padT || y > padB) continue;

      // Fade near edges
      const edgeFade = Math.min(1, Math.min(y - padT + 10, padB - y - 6) / 20);
      const fade = Math.max(0.2, edgeFade);

      ctx.globalAlpha = fade;

      ctx.fillStyle = e.color + '12';
      ctx.fillRect(padL, y, padR - padL, rowH - 4);
      ctx.strokeStyle = e.color + '55';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, y, padR - padL, rowH - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 7px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(e.time, padL + 8, y + rowH / 2 + 2);

      ctx.fillStyle = e.color;
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(e.pattern, padL + 50, y + rowH / 2 + 2);

      // Outcome badge
      const badgeX = padL + 140;
      const badgeW = 58;
      ctx.fillStyle = e.color + '30';
      ctx.fillRect(badgeX, y + 3, badgeW, rowH - 10);
      ctx.fillStyle = e.color;
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(e.outcome.toUpperCase(), badgeX + badgeW / 2, y + rowH / 2 + 2);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(e.note, badgeX + badgeW + 10, y + rowH / 2 + 2);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Stats footer
    const statsY = padB + 6;
    const stats = [
      { label: 'TRADE', value: '3', color: '#22C55E' },
      { label: 'NO-TRADE', value: '2', color: '#F59E0B' },
      { label: 'NOISE', value: '2', color: '#EF5350' },
      { label: 'NOISE %', value: '28%', color: '#EF5350' },
    ];
    const statW = (w - 30) / stats.length;
    stats.forEach((s, i) => {
      const sx = padL + i * statW;
      ctx.fillStyle = s.color + '12';
      ctx.fillRect(sx, statsY, statW - 4, 28);
      ctx.strokeStyle = s.color + '55';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, statsY, statW - 4, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, sx + (statW - 4) / 2, statsY + 10);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(s.value, sx + (statW - 4) / 2, statsY + 23);
    });

    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Noise% > 30% \u2192 tighten filters. Noise% < 10% \u2192 maybe loosen.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={300} />;
}

// ============================================================
// ANIMATION 11: Once-Per-Bar vs Once-Per-Bar-Close
// Side-by-side visual showing when each fires on a developing candle
// ============================================================
function BarTimingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.012;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Once-Per-Bar vs Once-Per-Bar-Close', w / 2, 14);

    const mid = w / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(mid, 28);
    ctx.lineTo(mid, h - 12);
    ctx.stroke();

    // Both sides share the same evolving candle
    const sides = [
      { label: 'ONCE-PER-BAR', xCenter: w / 4, color: '#FFB300', desc: 'fires intra-bar on condition flip', alertTime: 0.35 },
      { label: 'ONCE-PER-BAR-CLOSE', xCenter: (w * 3) / 4, color: '#22C55E', desc: 'fires only at bar close', alertTime: 1.0 },
    ];

    const candleT = (t * 0.4) % 1.4;

    sides.forEach(side => {
      ctx.fillStyle = side.color;
      ctx.font = 'bold 8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(side.label, side.xCenter, 40);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px system-ui';
      ctx.fillText(side.desc, side.xCenter, 52);

      // Candle being drawn progressively
      const candleX = side.xCenter;
      const candleBaseY = h / 2 + 30;
      const candleW = 18;
      const maxTop = h / 2 - 35;
      const openY = candleBaseY;
      const progress = Math.min(1, candleT);

      // Price line
      const highY = candleBaseY - progress * (candleBaseY - maxTop);
      const lowY = candleBaseY + 4;

      // Wick
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX, highY);
      ctx.lineTo(candleX, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(candleX - candleW / 2, highY + 2, candleW, candleBaseY - highY - 2);

      // Timeline below
      const tlY = candleBaseY + 30;
      const tlW = 140;
      const tlX = side.xCenter - tlW / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tlX, tlY);
      ctx.lineTo(tlX + tlW, tlY);
      ctx.stroke();

      // Tick marks
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '6px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('open', tlX, tlY + 10);
      ctx.fillText('close', tlX + tlW, tlY + 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(tlX, tlY - 3);
      ctx.lineTo(tlX, tlY + 3);
      ctx.moveTo(tlX + tlW, tlY - 3);
      ctx.lineTo(tlX + tlW, tlY + 3);
      ctx.stroke();

      // Current time cursor
      const cursorX = tlX + progress * tlW;
      ctx.strokeStyle = 'rgba(255,179,0,0.7)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cursorX, tlY - 6);
      ctx.lineTo(cursorX, tlY + 6);
      ctx.stroke();

      // Alert fire position
      const alertX = tlX + side.alertTime * tlW;
      const willHaveFired = progress >= side.alertTime;
      if (willHaveFired) {
        const pulse = 1 + Math.sin(t * 5) * 0.3;
        ctx.fillStyle = side.color;
        ctx.beginPath();
        ctx.arc(alertX, tlY - 18, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(alertX, tlY - 18, 5 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = side.color;
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('\u{1F514} FIRED', alertX, tlY - 28);
      }
    });

    // Comparison
    ctx.fillStyle = 'rgba(255,179,0,0.9)';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Once-per-bar = fast but repaints if condition flips later', w / 4, h - 14);
    ctx.fillStyle = 'rgba(34,197,94,0.9)';
    ctx.fillText('Once-per-bar-close = slower but CONFIRMED, no repaint', (w * 3) / 4, h - 14);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Default to per-bar-close for diagnostic patterns. Per-bar only for event markers.', w / 2, h - 4);
  }, []);
  return <AnimScene drawFn={draw} height={290} />;
}

// ============================================================
// ANIMATION 12: Webhook Integration
// Chart → TradingView alert → webhook → third-party system
// ============================================================
function WebhookIntegrationAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.01;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Webhook Integration \u2014 Alerts as HTTP POST', w / 2, 14);

    const stages = [
      { label: 'TradingView', sub: 'alert fires', color: '#0EA5E9', icon: '\u{1F4C8}' },
      { label: 'Webhook URL', sub: 'POST https://...', color: '#FFB300', icon: '\u{1F517}' },
      { label: 'Your System', sub: 'Discord / Slack /\u2009bot', color: '#22C55E', icon: '\u{1F916}' },
    ];

    const padL = 20;
    const padR = w - 20;
    const y = h / 2;
    const stageW = (padR - padL) / stages.length;

    // Packet flow
    const packetPos = (t * 0.5) % 1;
    const packetX = padL + packetPos * (padR - padL);
    ctx.fillStyle = 'rgba(255,179,0,0.8)';
    ctx.beginPath();
    ctx.arc(packetX, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Packet trail
    for (let i = 1; i <= 6; i++) {
      const trailPct = Math.max(0, packetPos - i * 0.015);
      if (trailPct <= 0) continue;
      const tx = padL + trailPct * (padR - padL);
      ctx.fillStyle = `rgba(255,179,0,${0.6 - i * 0.08})`;
      ctx.beginPath();
      ctx.arc(tx, y, 4 - i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    stages.forEach((s, i) => {
      const x = padL + i * stageW + stageW * 0.1;
      const boxW = stageW * 0.8;
      const boxH = 80;
      const boxY = y - boxH / 2;

      ctx.fillStyle = s.color + '15';
      ctx.fillRect(x, boxY, boxW, boxH);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(x, boxY, boxW, boxH);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, x + boxW / 2, boxY + 28);

      ctx.font = 'bold 9px system-ui';
      ctx.fillText(s.label, x + boxW / 2, boxY + 48);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '7px system-ui';
      ctx.fillText(s.sub, x + boxW / 2, boxY + 62);

      if (i < stages.length - 1) {
        const aX1 = x + boxW;
        const aX2 = x + stageW + stageW * 0.1;
        ctx.strokeStyle = 'rgba(255,179,0,0.4)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(aX1 + 4, y);
        ctx.lineTo(aX2 - 4, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // JSON body sample at bottom
    const jsonY = h - 56;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(padL, jsonY, padR - padL, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(padL, jsonY, padR - padL, 40);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('JSON BODY:', padL + 6, jsonY + 10);

    ctx.font = '7px ui-monospace, monospace';
    ctx.fillStyle = '#EC407A';
    ctx.fillText('{', padL + 6, jsonY + 22);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('  "pattern": "LAUNCH", "ticker": "{{ticker}}", "price": {{close}}', padL + 6, jsonY + 32);
    ctx.fillStyle = '#EC407A';
    ctx.fillText('}', padL + 6, jsonY + 42);

    // Status
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('Free plan: 1 webhook URL', padR, jsonY + 22);
  }, []);
  return <AnimScene drawFn={draw} height={240} />;
}

// ============================================================
// ANIMATION 13: Scaling Up on Paid Plans
// Comparative table of Free / Essential / Plus / Premium alert limits
// ============================================================
function ScalingUpPlansAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scaling Up \u2014 When to Upgrade, What Unlocks', w / 2, 14);

    const plans = [
      { name: 'FREE', alerts: 1, frequency: 'Once/bar', expiry: '—', color: '#8A8A8A', action: 'Start here' },
      { name: 'ESSENTIAL', alerts: 20, frequency: 'Once/bar', expiry: '1 mo', color: '#0EA5E9', action: 'First upgrade' },
      { name: 'PLUS', alerts: 100, frequency: 'Per tick', expiry: '2 mo', color: '#22C55E', action: 'Serious trader' },
      { name: 'PREMIUM', alerts: 400, frequency: 'Per tick', expiry: 'None', color: '#F59E0B', action: 'Full architecture' },
    ];

    const padL = 15;
    const padR = w - 15;
    const padT = 32;
    const padB = h - 14;
    const colW = (padR - padL) / plans.length;

    // Header row
    const headers = ['Plan', 'Alerts', 'Frequency', 'Expiry', 'When'];
    const rowHVal = 26;

    plans.forEach((p, i) => {
      const x = padL + i * colW;
      const isActive = Math.floor(t * 0.5) % plans.length === i;

      // Column background
      ctx.fillStyle = p.color + (isActive ? '15' : '06');
      ctx.fillRect(x + 4, padT, colW - 8, padB - padT);
      ctx.strokeStyle = p.color + (isActive ? 'cc' : '55');
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(x + 4, padT, colW - 8, padB - padT);

      // Plan name
      ctx.fillStyle = p.color;
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + colW / 2, padT + 18);

      // Dividing line
      ctx.strokeStyle = p.color + '44';
      ctx.beginPath();
      ctx.moveTo(x + 8, padT + 26);
      ctx.lineTo(x + colW - 8, padT + 26);
      ctx.stroke();

      // Alert count (big)
      const pulseVal = isActive ? 1 + Math.sin(t * 4) * 0.1 : 1;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold ${16 * pulseVal}px system-ui`;
      ctx.fillText(String(p.alerts), x + colW / 2, padT + 52);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '6px system-ui';
      ctx.fillText('alert slots', x + colW / 2, padT + 64);

      // Frequency
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '7px system-ui';
      ctx.fillText(p.frequency, x + colW / 2, padT + 82);

      // Expiry
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '6px system-ui';
      ctx.fillText('expire: ' + p.expiry, x + colW / 2, padT + 96);

      // Action
      ctx.fillStyle = p.color;
      ctx.font = 'bold 7px system-ui';
      ctx.fillText(p.action, x + colW / 2, padB - 8);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Compression architecture works on ALL plans \u2014 paid plans just let you stop compressing', w / 2, h - 2);
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// ANIMATION 14: Alert Hygiene — common mistakes visualizer
// The 4 mistakes quickly rotating through
// ============================================================
function AlertMistakesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, f: number) => {
    const t = f * 0.008;

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('\u26A0 Four Ways Alert Architecture Breaks Down', w / 2, 14);

    const mistakes = [
      { icon: '\u{1F3AF}', title: 'SINGLE PATTERN ALERT', diag: 'Alerted only on #1 Launch \u2014 missed #3 Fade, #4 Absorb, #7 Trap all day' },
      { icon: '\u{1F509}', title: 'GENERIC MESSAGE TEXT', diag: '"ATLAS triggered" \u2014 no idea which pattern or what setup' },
      { icon: '\u{1F501}', title: 'PER-BAR ON EVERY CONDITION', diag: 'Repaint flips produce 20 noise alerts per session' },
      { icon: '\u{1F4CB}', title: 'LOG IGNORED', diag: 'No review of which fires became trades \u2014 no filter tuning' },
    ];

    const currentIdx = Math.floor(t) % mistakes.length;
    const m = mistakes[currentIdx];

    // Main card
    const cardX = 25;
    const cardY = 32;
    const cardW = w - 50;
    const cardH = h - 50;

    ctx.fillStyle = 'rgba(239,83,80,0.05)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(239,83,80,0.4)';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.fillStyle = 'rgba(239,83,80,0.9)';
    ctx.font = 'bold 40px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(m.icon, w / 2, cardY + 60);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(m.title, w / 2, cardY + 90);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '8px system-ui';
    // Wrap diagnosis text
    const words = m.diag.split(' ');
    const maxW = cardW - 40;
    let lines: string[] = [];
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
      ctx.fillText(line, w / 2, cardY + 115 + i * 13);
    });

    // Progress dots
    mistakes.forEach((_, i) => {
      const dx = w / 2 - (mistakes.length - 1) * 8 + i * 16;
      ctx.fillStyle = i === currentIdx ? '#EF5350' : 'rgba(239,83,80,0.25)';
      ctx.beginPath();
      ctx.arc(dx, cardY + cardH - 16, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);
  return <AnimScene drawFn={draw} height={220} />;
}

// ============================================================
// GAME DATA — 5 rounds
// ============================================================
const gameRounds = [
  {
    scenario: 'You\u2019ve just finished Level 10.12 and identified your starter playbook: #1 Launch, #5 Handoff, #6 Surge (trend trader). You have TradingView Free with 1 alert slot. Your first instinct is to alert only on #1 Launch since it\u2019s your favorite pattern. Assess.',
    options: [
      { text: 'Wrong approach. You\u2019re applying the naive single-pattern strategy \u2014 which means you\u2019ll be blind to #5 Handoff and #6 Surge firing during the same session. The Compression Doctrine says: use OR logic to combine all three, encode which one fired in the dynamic message text. Same 1 slot, 3\u00d7 the coverage. <code>fire = p1_launch or p5_handoff or p6_surge</code> then <code>message = p1 ? "\u{1F680} LAUNCH..." : p5 ? "\u{1F504} HANDOFF..." : "\u26A1 SURGE..."</code>. No reason to pick one pattern when OR + dynamic message cover all three for free.', correct: true, explain: 'This is the foundational move of alert architecture: scarcity of slots doesn\u2019t mean scarcity of coverage. One slot carries N patterns when combined with OR logic and dynamic message strings. The message text tells you which pattern fired, so you know exactly what context to expect on the chart when you open it. Picking "favorites" is a category error \u2014 favorites shouldn\u2019t determine coverage, the architecture should.' },
      { text: 'Good choice \u2014 focus on your strongest pattern', correct: false, explain: 'This treats the alert as specialization rather than surveillance. Your alert\u2019s job is to tell you when ANY of your tradable patterns fires, not to affirm your favorite. If #5 Handoff fires during LDN open while you\u2019re walking the dog, the pattern has already resolved by the time you manually check the chart. One slot with OR logic covers all three without any trade-off.' },
    ],
  },
  {
    scenario: 'You decide which 2-3 patterns deserve S-tier priority in your compression architecture. Using the "Rarity \u00d7 Edge per Fire" framework, which patterns should go at the top?',
    options: [
      { text: '#4 Absorption Reversal and #7 Trap Fade \u2014 these are the rarest (fire in single-digit % of sessions) but carry the highest edge when they do. Missing one of these is costly because they\u2019re the setups you can\u2019t reliably scan for manually \u2014 they require simultaneous confluence of 3+ indicators at specific structural levels. Frequent patterns like #1 Launch are easier to catch by visual inspection, so they can sit in lower tiers.', correct: true, explain: 'Priority hierarchy is RARITY \u00d7 EDGE. Rare patterns deserve the alert slot because they\u2019re the ones you\u2019re most likely to miss by manual watching; high-edge patterns deserve the alert because the cost of missing them is high. Absorption and Trap hit both axes. The doctrinal rule: reserve top-tier alert priority for patterns that are BOTH rare AND high-edge. Don\u2019t waste S-tier slots on patterns you\u2019d catch by just looking at the chart.' },
      { text: '#1 Launch and #2 Coil \u2014 they fire most often', correct: false, explain: 'Frequency is the WRONG metric for priority \u2014 frequent patterns are easy to catch manually. You want alerts on the patterns you\u2019re most likely to MISS. Alerting on common patterns is redundant with your chart observation; alerting on rare-but-edge-heavy patterns is actually additive.' },
    ],
  },
  {
    scenario: 'You deployed your compressed alert covering 7 patterns. After 2 weeks you notice: 32 alerts fired. 11 led to trades. 7 were valid no-trades (wrong context like FOMC). 14 were "noise" \u2014 the pattern technically fired but in conditions that invalidated it. Noise rate = 44%. What\u2019s the Alert Hygiene-correct action?',
    options: [
      { text: 'Tighten the filters on the noisy patterns. A 44% noise rate means your pattern definitions are too loose \u2014 they\u2019re firing on configurations that shouldn\u2019t qualify. Review the 14 noise alerts, identify the common pattern (usually: one upstream condition is barely met, or MER is in a borderline zone), and tighten the Pine Script condition for that specific pattern. Target noise rate: 10-20%. Don\u2019t tighten ALL patterns \u2014 identify WHICH patterns contributed most noise and tighten only those.', correct: true, explain: 'Alert Hygiene treats the alert log as P&L-adjacent data. A 44% noise rate is a clear signal that the filters aren\u2019t discriminating enough. The response is surgical: isolate which specific patterns are producing the noise, examine the failed alerts to find the common invalidating factor, and tighten THAT condition. Blanket tightening makes everything less sensitive; targeted tightening keeps the good fires while killing the noise fires. The log tells you exactly which patterns to adjust.' },
      { text: 'Accept the noise rate \u2014 alerts are just signals, not trades', correct: false, explain: 'Noise isn\u2019t free. Each noise fire desensitizes your response to real fires (alert fatigue), wastes attention, and eventually leads to ignored alerts that were actually valid. A well-tuned alert architecture targets 10-20% noise, not 44%. Noise is data; hygiene means acting on it.' },
    ],
  },
  {
    scenario: 'You\u2019re writing Pine Script and must choose between <code>alert.freq_once_per_bar</code> and <code>alert.freq_once_per_bar_close</code> for your pattern conditions. Which is correct for diagnostic patterns (Launch, Fade, Absorption), and why?',
    options: [
      { text: '<code>once_per_bar_close</code> for diagnostic patterns. These depend on confirmed bar state \u2014 MSI regime, MER zone, MAE position, MAZ level \u2014 all of which can flip intra-bar before the bar closes. Using <code>once_per_bar</code> means the alert fires the moment the condition first becomes true, but if the bar closes with the condition FALSE again (repaint), you\u2019ve alerted on a phantom signal. <code>once_per_bar_close</code> waits for confirmation: the bar closes with the condition still true. Slower, but signals are confirmed. Event markers (ERD vacuum / absorption) can use <code>once_per_bar</code> because the event itself is intra-bar by nature.', correct: true, explain: 'The repaint problem is the defining failure mode of <code>once_per_bar</code>. When a pattern depends on multi-indicator confluence, intra-bar flips are common \u2014 MER bounces between grey and teal, MSI wavers between Compression and Expansion. <code>once_per_bar_close</code> is the conservative default because it waits for the bar to commit. The one exception is explicit event indicators (ERD markers), which fire on specific statistical events that have meaning intra-bar. Default to <code>once_per_bar_close</code>; exception only for event-type indicators.' },
      { text: '<code>once_per_bar</code> \u2014 faster is better', correct: false, explain: 'Speed without confirmation creates the repaint problem: alerts fire on intra-bar conditions that invalidate by close. A faster alert that repaints is worse than a slower one that\u2019s confirmed \u2014 you\u2019ll act on signals that then disappear. Speed isn\u2019t the right optimization target here; signal integrity is.' },
    ],
  },
  {
    scenario: 'You hit a wall on Free plan: your compressed alert is saving you, but you want separate alerts per tier (S, A, B) so the notification tone can differ by severity. Your first thought is to upgrade to TradingView Essential (20 alerts). Using the architecture-first principle, is this the right move?',
    options: [
      { text: 'Maybe \u2014 but first ask whether the compression architecture on Free is actually limiting you, or whether you just want more alerts because they\u2019re available. If your Free-tier compressed alert fires ~5 times per session and you\u2019re reviewing every one, you already have the information you need; paid tiers just remove the compression requirement. If you\u2019re missing trades because you can\u2019t distinguish S-tier from B-tier fires at a glance, upgrade. If you just want more visual variety in your notifications, stay on Free \u2014 paid alert slots are most valuable when they unlock WORKFLOWS you can\u2019t run under compression (separate webhooks per tier, different alert frequencies per pattern), not when they just give you more of what already works.', correct: true, explain: 'The architecture-first principle: upgrade when the architecture hits a real constraint, not when more slots are simply available. The Compression Doctrine works on all plans \u2014 it\u2019s just ENFORCED on Free. If you genuinely need distinct notification tones per tier for workflow reasons (e.g., S-tier fires triggers a bot action; A-tier triggers a different one), that\u2019s a legitimate workflow constraint that Essential unlocks. If you just want more separation for aesthetic reasons, stay Free longer and invest the money in other trading tools. Upgrade based on architectural need, not marginal convenience.' },
      { text: 'Yes \u2014 more alerts always better', correct: false, explain: '"More is better" ignores the actual constraint. Paid plans remove the compression requirement, which is useful ONLY if compression was actually costing you something. For most traders on a well-tuned Free-tier architecture, the compression isn\u2019t a real cost \u2014 one well-built alert covers everything needed. Spend the upgrade money when architecture demands it, not when availability invites it.' },
    ],
  },
];

// ============================================================
// QUIZ DATA — 8 questions
// ============================================================
const quizQuestions = [
  { q: 'The Alert Compression Doctrine states that when you have N setups but only K &lt;&lt; N alert slots:', opts: ['Pick your single favorite pattern and alert only on that', 'Each alert becomes a scarce channel that must carry maximum information per fire \u2014 design a composite alert firing on ANY of the K most valuable patterns, with dynamic message text encoding which one fired', 'Skip alerting entirely', 'Upgrade to a paid plan immediately'], correct: 1, explain: 'The doctrinal move is information density per slot. One alert with OR logic + dynamic message strings covers N patterns. Scarcity of slots becomes a design discipline, not a coverage limitation.' },
  { q: 'The foundational technique for fitting N patterns into 1 alert slot is:', opts: ['Random selection', 'Multi-condition OR logic combined with dynamic message strings \u2014 <code>fire = p1 or p2 or p3</code>; <code>message = p1 ? "LAUNCH" : p2 ? "FADE" : "ABSORB"</code>', 'Pinning charts to the screen at all times', 'Trading only one pattern'], correct: 1, explain: 'The OR combines boolean conditions into a single fire signal; the conditional ternary message encodes which condition was true so you know which pattern fired. Together they turn 1 alert slot into N-pattern coverage.' },
  { q: 'For priority-tier ranking of patterns, the correct framework is:', opts: ['Alphabetical order', 'Pattern frequency \u2014 most frequent gets top priority', 'Rarity \u00d7 Edge per Fire \u2014 rare patterns with high edge (e.g., Absorption Reversal, Trap Fade) get S-tier because they\u2019re hardest to catch manually and costliest to miss', 'Random assignment'], correct: 2, explain: 'Priority should go to patterns you\u2019re most likely to miss manually AND that cost most when missed. Frequent patterns are easy to catch by visual inspection; rare high-edge patterns require alert surveillance because you can\u2019t watch for them constantly. Rarity \u00d7 Edge is the correct two-axis rank.' },
  { q: 'For diagnostic patterns (Launch, Fade, Absorption) involving multi-indicator confluence, the correct alert frequency setting is:', opts: ['<code>once_per_bar</code> \u2014 faster is better', '<code>once_per_bar_close</code> \u2014 slower but signals are CONFIRMED, no repaint risk from intra-bar flips', '<code>once_per_minute</code>', 'Never set a frequency'], correct: 1, explain: 'The repaint problem: patterns dependent on multi-indicator confluence can flip intra-bar, so <code>once_per_bar</code> fires on phantom signals that invalidate at close. <code>once_per_bar_close</code> waits for bar commit \u2014 signals are confirmed. Event-based indicators (ERD markers) are the exception; they can fire intra-bar.' },
  { q: 'Alert Hygiene treats the alert log as:', opts: ['A notification history only', 'P&L-adjacent data \u2014 classify each fire as trade / no-trade / noise; a noise rate above 30% means filters are too loose and specific patterns need tightening', 'Something to ignore', 'A source of marketing metrics'], correct: 1, explain: 'Every fire teaches you something. Trades taken reveal what your edge looks like. No-trades reveal which patterns fire in contexts you correctly skip. Noise reveals which patterns are over-firing and need tighter definitions. Target: 10-20% noise. Above 30% means tightening is overdue.' },
  { q: 'When should you upgrade from TradingView Free to Essential/Plus/Premium?', opts: ['Immediately \u2014 Free is limiting', 'When the compression architecture hits a real workflow constraint (e.g., you need separate webhooks per tier, or different frequencies per pattern) \u2014 not when more slots are simply available', 'Never', 'When prompted'], correct: 1, explain: 'Architecture-first principle: upgrade based on architectural need, not marginal convenience. A well-tuned Free-tier compressed alert covers everything most traders need. Paid slots unlock workflows (separate webhooks, varied frequencies, multi-ticker parallel monitoring) but only help if you\u2019re actually constrained by those missing capabilities.' },
  { q: 'Webhook integration on TradingView Free allows:', opts: ['Unlimited webhook URLs', '1 webhook URL that receives HTTP POST with JSON body on alert fire \u2014 enables connections to Discord, Slack, bots, or custom systems', 'No webhooks on Free', '50 webhook URLs'], correct: 1, explain: 'Free plan includes 1 webhook URL configured in the alert dialog. When the alert fires, TradingView POSTs the JSON-formatted message body to that URL. This is surprisingly powerful \u2014 the single webhook can route to Discord channels, Slack, or custom bot logic that acts on the message text.' },
  { q: 'The common failure mode "Single Pattern Alert" refers to:', opts: ['Using too many indicators', 'Alerting on only one pattern (e.g., only #1 Launch) so you\u2019re blind to the 6 other patterns firing during the same session \u2014 the default naive approach that the Compression Doctrine exists to replace', 'Not using alerts at all', 'Alert that fires once per trade'], correct: 1, explain: 'The naive approach: pick one pattern, alert on it, ignore the others. The cost is systematic blindness to the 85%+ of pattern fires that happen outside your chosen pattern. Compression architecture solves this at zero cost \u2014 OR logic + dynamic messages cover all patterns in the same alert slot.' },
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
export default function AlertArchitectureLesson() {
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
    { wrong: 'Single Pattern Alert \u2014 alerting only on your favorite', right: 'The naive default: pick one pattern (usually #1 Launch), alert only on it, ignore the other six. The cost is systematic blindness \u2014 when #3 Fade or #4 Absorption fires during the same session, you\u2019re not notified, so you miss them unless you\u2019re staring at the chart. The Compression Doctrine solves this at zero cost: OR logic combines all patterns into one alert slot, dynamic message tells you which one fired. One slot, full coverage. Picking favorites is a category error \u2014 favorites shouldn\u2019t determine coverage; architecture should.', icon: '\u{1F3AF}' },
    { wrong: 'Generic Alert Message Text', right: 'Alert fires, notification reads "ATLAS triggered." You don\u2019t know which pattern, which ticker, what context. You have to open the chart to find out. By then, the setup has often resolved. The fix is dynamic message strings: encode the pattern name, key readings, and ticker directly in the message. You should be able to make a trade decision from the notification alone, before opening the chart. <code>message = "\u{1F680} LAUNCH on {{ticker}} at {{close}} \u2022 MER 76 \u2022 LDN-NY"</code> tells you everything you need.', icon: '\u{1F509}' },
    { wrong: 'Per-bar frequency on all conditions \u2014 repaint hell', right: 'Using <code>alert.freq_once_per_bar</code> on diagnostic patterns means the alert fires the moment a condition first becomes true intra-bar. But these patterns depend on multi-indicator confluence that can flip \u2014 MER bounces between grey and teal, MSI wavers between regimes. You get phantom alerts that invalidate at bar close. Result: 20 noise alerts per session, alert fatigue, ignored fires. Default to <code>once_per_bar_close</code> for diagnostic patterns; exception only for event-type indicators (ERD markers) where intra-bar firing is the point.', icon: '\u{1F501}' },
    { wrong: 'Alert log ignored \u2014 no filter tuning, no learning', right: 'Each alert fires is data. Classify: trade (alert produced a taken trade), no-trade (alert fired but context correctly kept you out), noise (alert fired in conditions that invalidated the pattern). Target: &lt;20% noise. If noise hits 30%+, specific patterns need tighter filters \u2014 review the noise fires, find the common failure mode, adjust that pattern\u2019s condition. Traders who never review their alert log keep firing the same noise alerts forever and never improve filter quality. Logs are P&L-adjacent data; hygiene is the discipline of treating them that way.', icon: '\u{1F4CB}' },
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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 10 &middot; Lesson 13</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Alert Architecture<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>(Free Tier)</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Seven patterns. One alert slot. The engineering craft that turns a scarcity constraint into an information-density discipline.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5"><span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span><div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" /></motion.div>
        </motion.div>
      </section>

      {/* === S00 === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The 1-Alert Problem Is Universal.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You\u2019ve learned the seven playbook patterns from 10.12. Each deserves surveillance. Each fires in specific market conditions you can\u2019t predict in advance. TradingView Free gives you exactly <strong className="text-white">one</strong> alert slot. The naive response is to pick your favorite pattern and alert on that; the cost is being blind to the other six.</p>
            <p className="text-gray-400 leading-relaxed mb-4">This is not a TradingView-specific problem. Every notification channel in trading has a scarcity constraint \u2014 phone notifications, email inbox, Discord messages, your own attention budget. The architectural question is the same everywhere: <strong className="text-amber-400">given N setups and K &lt;&lt; N notification slots, how do you design the K slots to carry maximum information?</strong></p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches the engineering craft. Multi-condition OR logic. Dynamic message strings. Priority tier hierarchies. Pine Script patterns for alert conditions. Alert hygiene as a feedback system. Once-per-bar vs once-per-bar-close timing. Webhook basics. And when to upgrade, if ever. By the end, one alert slot will cover seven patterns comfortably, and you\u2019ll know exactly which fired from the notification text alone.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#128270; THE ALERT AXIOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">A notification is a scarce channel. Its value is measured by information density per fire, not by frequency of fires. Design channels to maximize information per fire \u2014 the rest is hygiene.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Alert Compression Doctrine &#11088;</p>
          <h2 className="text-2xl font-extrabold mb-4">Scarcity as Information Density Discipline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Seven patterns. One slot. The naive move is to pick a favorite. The doctrinal move is to recognize that the slot constraint isn\u2019t a coverage limitation \u2014 it\u2019s a design constraint that forces information-density thinking. Combine all seven patterns into one boolean via OR logic, then use a conditional message string to encode which pattern fired. One slot, seven patterns, full coverage, zero trade-off.</p>
          <OneAlertProblemAnim />
          <div className="my-6"><CompressionDoctrineAnim /></div>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#127960; The Alert Compression Doctrine</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you have N setups but only K &lt;&lt; N alert slots, each alert becomes a scarce channel that must carry maximum information per fire. The doctrinal response is to design a composite alert firing on ANY of the K most valuable patterns, with message text that encodes which pattern fired. This turns the scarcity constraint into an information-density discipline \u2014 not a coverage sacrifice. Works on TradingView Free (1 slot), Essential (20 slots), and every other platform with slot limits.</p>
          </div>
          <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-xs font-bold text-white mb-2">Three portable applications:</p>
            <ul className="text-sm text-gray-400 space-y-2 leading-relaxed">
              <li><strong className="text-amber-400">1.</strong> <strong className="text-white">Multi-condition OR logic.</strong> One alert slot surfaces multiple patterns via boolean OR; dynamic message strings identify which one fired. 7-pattern coverage on 1 alert.</li>
              <li><strong className="text-amber-400">2.</strong> <strong className="text-white">Priority hierarchies.</strong> Not all patterns deserve equal alert access. Rank by Rarity \u00d7 Edge-per-Fire; low-frequency / high-edge patterns (Trap, Absorption) get S-tier over frequent ones (Launch).</li>
              <li><strong className="text-amber-400">3.</strong> <strong className="text-white">Alert hygiene.</strong> Every fire without a trade teaches you something: pattern lower-quality than expected, or filters too loose. The alert log is P&L-adjacent data; treat it that way.</li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* === S02 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Mechanics</p>
          <h2 className="text-2xl font-extrabold mb-4">How TradingView Alerts Actually Work</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before designing the architecture, understand the pipeline. On each new bar tick, TradingView\u2019s servers run your Pine Script\u2019s alert conditions. If any evaluates true, the alert fires, generating a message delivered through your configured channels (email, mobile push, webhook). Crucially, this runs <strong className="text-white">server-side</strong> \u2014 alerts work whether your chart is open or not, whether you\u2019re connected or not. You can design alerts you never watch on-screen.</p>
          <AlertPipelineAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Server-Side Is the Point</p>
            <p className="text-sm text-gray-400">If alerts only ran when your browser was open, they\u2019d be useless \u2014 you could just watch the chart directly. The value is that TradingView\u2019s servers evaluate your conditions 24/7 and push notifications when conditions fire. This means your architecture needs to work without your attention, not because of it. Every design decision that follows \u2014 message text, frequency settings, priority tiers \u2014 is optimizing for the moment you receive a notification cold, with no context.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Single Condition Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">Why Alerting on One Pattern Is Wrong</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The intuitive mistake: "I have 1 slot, I\u2019ll use it for my best pattern." Here\u2019s the cost. Over a single trading session, 3-5 different patterns will typically fire. Your one-pattern alert catches 1 of them; the other 2-4 fire silently. You see them only if you happen to be staring at the chart at the exact moment. Most you miss. The trap is that this feels like focus \u2014 but it\u2019s actually systematic blindness to 80%+ of your tradable setups.</p>
          <SingleConditionTrapAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Favorites vs Architecture</p>
            <p className="text-sm text-gray-400">Picking a "favorite" pattern for your single alert conflates two different questions: which pattern do you trade most often (favorite) vs which patterns do you need to be notified about (coverage). They\u2019re completely different. Your favorite might be easiest to catch manually precisely because it\u2019s so familiar; the ones you miss are the less-familiar ones you don\u2019t instinctively scan for. Coverage is an architecture problem, not a preference problem.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Multi-Condition OR Logic</p>
          <h2 className="text-2xl font-extrabold mb-4">The Foundational Technique</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first move in compression architecture: combine N boolean pattern conditions into a single fire signal via OR. In Pine Script: <code className="text-amber-400 font-mono">fire = p1_launch or p3_fade or p4_absorption or p7_trap</code>. The alert fires when ANY condition is true. You have all four patterns covered in one alert slot. Simple, universal, works on every indicator, every platform.</p>
          <MultiConditionORAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The OR Is Cheap</p>
            <p className="text-sm text-gray-400">Boolean OR operations are computationally free and Pine Script has no limit on how many you can chain. You can literally OR together all seven playbook patterns and Pine won\u2019t notice. The only thing that makes stacking N patterns "expensive" is the downstream consequence \u2014 more conditions firing means more alert notifications. But the OR itself costs nothing. So go wide: include every pattern you want surveillance on.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Dynamic Message Strings</p>
          <h2 className="text-2xl font-extrabold mb-4">Encoding Which Pattern Fired</h2>
          <p className="text-gray-400 leading-relaxed mb-6">OR logic gives you one fire signal, but you\u2019ve lost information: which pattern actually triggered? The solution is a conditional message string using Pine\u2019s ternary operator: <code className="text-amber-400 font-mono">msg = p1 ? "🚀 LAUNCH" : p3 ? "📉 FADE" : p4 ? "🛡 ABSORB" : "UNKNOWN"</code>. When the alert fires, the message text identifies the specific pattern. The notification on your phone tells you exactly what happened, no chart-opening required for first assessment.</p>
          <DynamicMessageAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Template Placeholders Too</p>
            <p className="text-sm text-gray-400">TradingView supports template placeholders in alert messages: <code className="text-amber-400 font-mono">{'{{ticker}}'}</code>, <code className="text-amber-400 font-mono">{'{{close}}'}</code>, <code className="text-amber-400 font-mono">{'{{time}}'}</code>, <code className="text-amber-400 font-mono">{'{{plot_0}}'}</code>. Combine with your dynamic pattern string for notifications like <code className="text-amber-400 font-mono">"🚀 LAUNCH on {'{{ticker}}'} at {'{{close}}'} \u2022 MER 76"</code>. This gives you pattern, ticker, price, and supporting reading in one line \u2014 enough to make a first-pass trade decision from the notification alone.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Priority Hierarchies</p>
          <h2 className="text-2xl font-extrabold mb-4">Ranking the Seven Patterns</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not all patterns deserve equal alert access. The ranking framework: <strong className="text-white">Rarity \u00d7 Edge-per-Fire</strong>. Rare patterns deserve the slot because they\u2019re the ones you\u2019re most likely to miss manually. High-edge patterns deserve the slot because the cost of missing them is high. Patterns that score high on BOTH axes (Absorption Reversal, Trap Fade) are S-tier. Frequent patterns (Compression Coil) are C-tier because you\u2019d catch them anyway. This ranking shapes your architecture.</p>
          <PriorityHierarchyAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; S-Tier Gets Louder Alerts</p>
            <p className="text-sm text-gray-400">On Free plan with one slot, all tiers share the alert but the message text can reflect tier: <code className="text-amber-400 font-mono">msg = tier_S ? "🚨 S-TIER: ..." : tier_A ? "\u26A1 A-TIER: ..." : "B/C: ..."</code>. Your phone\u2019s notification sound or visual cue differentiates S-tier urgency from B-tier maybe. When you upgrade to paid plans, you can split tiers across separate alerts with distinct notification profiles. Either way, the tier ranking is what tells you how fast to respond.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Pine Script Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Canonical Code Shapes</h2>
          <p className="text-gray-400 leading-relaxed mb-6">There are three Pine Script patterns for alert conditions you should know. <strong className="text-white">Pattern A</strong>: simple OR \u2014 works for static coverage. <strong className="text-white">Pattern B</strong>: dynamic message \u2014 OR + conditional message string for pattern identification. <strong className="text-white">Pattern C</strong>: priority tiered \u2014 builds tier boolean groups, OR\u2019s them, conditional message by tier. Most architectures end up at Pattern C; Pattern B is the minimum viable; Pattern A is the starting scaffolding. The animation cycles through all three.</p>
          <PineAlertPatternsAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; <code>alert()</code> vs <code>alertcondition()</code></p>
            <p className="text-sm text-gray-400">Two Pine functions matter. <code className="text-amber-400 font-mono">alertcondition()</code> is the classic: declares a condition that the user manually arms via the alert dialog. <code className="text-amber-400 font-mono">alert()</code> is the newer function: fires programmatically during Pine execution, supports dynamic message strings via concatenation, and is required for the Compression Architecture. Use <code className="text-amber-400 font-mono">alert()</code> for anything involving dynamic messages; <code className="text-amber-400 font-mono">alertcondition()</code> is legacy for simple static cases.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Compression Architecture</p>
          <h2 className="text-2xl font-extrabold mb-4">The Reference Design</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Here\u2019s the complete reference architecture, as a system diagram. Seven pattern conditions feed into four tier groupings (S/A/B/C). Tiers OR into a single fire signal. A message builder reads the active tier and the specific active pattern, constructing the notification text. One alert slot delivers the message. This is the canonical design \u2014 every serious ATLAS user ends up at some variant of this, scaled to however many patterns they track and however many alert slots they have.</p>
          <CompressionArchitectureAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Architecture Is Reusable</p>
            <p className="text-sm text-gray-400">This same four-layer structure (patterns \u2192 tiers \u2192 OR \u2192 message) works for any number of patterns, any number of tiers, any number of slots. On Free, one alert holds the whole architecture. On Premium (400 slots), you can split by tier, by ticker, by timeframe. The architecture doesn\u2019t change \u2014 only the scale does. Master this shape and you can build alert systems of any complexity using the same mental model.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Alert Hygiene</p>
          <h2 className="text-2xl font-extrabold mb-4">The Log Is P&L-Adjacent Data</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every alert fire teaches you something. Classify each fire into one of three categories: <strong className="text-green-400">trade</strong> (alert fired, you took a trade), <strong className="text-amber-400">no-trade</strong> (alert fired but context correctly kept you out \u2014 FOMC, meetings, etc.), <strong className="text-red-400">noise</strong> (alert fired in conditions that invalidated the pattern). Target: &lt;20% noise. Above 30% means filters are too loose on specific patterns. Review noise fires, find the common invalidating factor, tighten THAT pattern\u2019s condition.</p>
          <AlertHygieneAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Noise Isn\u2019t Free</p>
            <p className="text-sm text-gray-400">Every noise alert costs you alert fatigue. Ignored alerts become habitual, and eventually you miss real ones too. A well-tuned architecture targets 10-20% noise \u2014 enough to stay engaged, few enough to remain trustworthy. Under 10% probably means filters are too tight (you\u2019re missing valid fires). Over 30% means filters are too loose. Review the log weekly. Adjust one pattern at a time so you can measure the impact of each change.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Bar Timing</p>
          <h2 className="text-2xl font-extrabold mb-4">Once-Per-Bar vs Once-Per-Bar-Close</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A critical Pine decision: when does the alert fire within a bar? <strong className="text-white">Once-per-bar</strong> fires the moment the condition first becomes true intra-bar \u2014 fast, but susceptible to the repaint problem when multi-indicator confluence conditions flip during bar formation. <strong className="text-white">Once-per-bar-close</strong> waits for the bar to close with the condition still true \u2014 slower, but signals are confirmed. For diagnostic patterns depending on multi-indicator state, default to once-per-bar-close. For event indicators (ERD vacuum / absorption markers), once-per-bar is appropriate because events are inherently intra-bar.</p>
          <BarTimingAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Repaint Is the Failure Mode</p>
            <p className="text-sm text-gray-400">A repaint happens when an intra-bar signal fires on conditions that later invalidate at bar close. You get notified of a "LAUNCH" pattern, open your chart 3 minutes later to find nothing there \u2014 the bar closed with MER back in grey. The fire was real at the time but dissolved before the bar committed. Once-per-bar-close prevents this by definition: the alert only fires on commit. Accept the slight lag; the signal integrity is worth it for diagnostic patterns.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Webhook Integration</p>
          <h2 className="text-2xl font-extrabold mb-4">Alerts as HTTP POST</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond email and push notifications, TradingView alerts can POST to a webhook URL \u2014 an HTTP endpoint of your choosing. Free plan includes one webhook URL per alert. The POST body contains your message text (with placeholders resolved), so the receiving system knows exactly what fired. This enables Discord channel posts, Slack messages, custom trading bot triggers, or any integration you want to build. The JSON-formatted body is the handoff point.</p>
          <WebhookIntegrationAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; Discord Webhooks Are Free and Easy</p>
            <p className="text-sm text-gray-400">Simplest useful webhook integration: create a Discord channel, generate a webhook URL in channel settings, paste into TradingView\u2019s alert webhook field. Format your message as JSON like <code className="text-amber-400 font-mono">{'{"content":"🔔 LAUNCH on {{ticker}}"}'}</code> and Discord renders it as a channel message. You can share this channel with trading partners, or use it as a personal history log you can search. Zero infrastructure, all benefits. Slack follows the same pattern.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Scaling Up</p>
          <h2 className="text-2xl font-extrabold mb-4">When to Upgrade, What Unlocks</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The progression: Free (1 alert) \u2192 Essential (20 alerts) \u2192 Plus (100 alerts) \u2192 Premium (400 alerts). More slots mean less compression needed. But upgrading is architecture-first: don\u2019t upgrade because more slots are available; upgrade when the compression architecture hits a real workflow constraint (distinct webhook routing per tier, per-tick frequency for specific patterns, multi-ticker parallel monitoring). For most traders, a well-tuned Free-tier compressed alert covers everything needed.</p>
          <ScalingUpPlansAnim />
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#128161; The Compression Architecture Works on All Plans</p>
            <p className="text-sm text-gray-400">The four-layer design (patterns \u2192 tiers \u2192 OR \u2192 message) is valid on every plan. Free plan enforces maximum compression \u2014 everything in one slot. Essential lets you split by tier. Premium lets you split by tier + ticker + timeframe. But the architecture doesn\u2019t change; only the parallelism does. Start with Free and run the compressed architecture until it demonstrates a specific workflow constraint you can\u2019t work around \u2014 then upgrade specifically to resolve that constraint.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Ways Alert Architecture Breaks Down</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each mistake comes from skipping a step of the Compression Doctrine \u2014 picking favorites, omitting dynamic messages, misusing per-bar frequency, or ignoring the log as feedback.</p>
          <AlertMistakesAnim />
          <div className="mt-6 space-y-3">
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

      {/* === S14 — Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Alert Architecture in One Page</h2>
          <div className="p-5 rounded-2xl glass-card">
            <div className="space-y-3">
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Core Doctrine (\u2605)</p><p className="text-sm text-gray-300">N setups, K &lt;&lt; N slots \u2192 each slot must carry maximum information per fire. OR logic + dynamic message covers all patterns.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Pine Template</p><p className="text-sm text-gray-300 font-mono text-xs leading-relaxed">fire = p1_launch or p3_fade or p4_absorb<br />msg = p1_launch ? "🚀 LAUNCH..." : p3_fade ? "📉 FADE..." : "🛡 ABSORB..."<br />if fire<br />&nbsp;&nbsp;alert(msg, alert.freq_once_per_bar_close)</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Priority</p><p className="text-sm text-gray-300">Rank by Rarity \u00d7 Edge. S-tier: Absorption (#4), Trap (#7). A-tier: Fade (#3), Surge (#6). B-tier: Launch (#1), Handoff (#5). C-tier: Coil (#2).</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Timing</p><p className="text-sm text-gray-300">Diagnostic patterns \u2192 once-per-bar-close. Event markers \u2192 once-per-bar.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Hygiene</p><p className="text-sm text-gray-300">Classify each fire: trade / no-trade / noise. Target &lt;20% noise. Review weekly, tighten specific patterns producing noise.</p></div>
              <div className="pb-3 border-b border-white/5"><p className="text-xs font-bold text-amber-400 mb-1">Webhook</p><p className="text-sm text-gray-300">Free plan = 1 webhook URL. Discord channel webhook = simplest useful integration. JSON body carries resolved message.</p></div>
              <div><p className="text-xs font-bold text-amber-400 mb-1">Upgrade Trigger</p><p className="text-sm text-gray-300">Upgrade when architecture hits a specific workflow constraint, not when more slots are simply available.</p></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Architect the Alert</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios testing whether you apply the Compression Doctrine, the Rarity \u00d7 Edge priority framework, the hygiene feedback loop, and the timing discipline \u2014 or whether you still default to one-pattern thinking.</p>
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
            {gameAnswers[gameRound] !== null && gameRound === gameRounds.length - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><p className="text-lg font-extrabold text-amber-400">{gameScore}/{gameRounds.length} Correct</p><p className="text-xs text-gray-400 mt-1">{gameScore >= 4 ? 'You architect alerts like an engineer, not a favorite-picker.' : gameScore >= 3 ? 'Solid grasp. Review the Compression Doctrine section before the quiz.' : 'Re-study compression architecture and alert hygiene before attempting the quiz.'}</p></motion.div>)}
          </div>
        </motion.div>
      </section>

      {/* === S16 — Quiz === */}
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
                {quizAnswers[qi] !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">\u2713</span> ${q.explain}` }} /></motion.div>)}
              </div>
            ))}
          </div>
          {quizDone && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center"><p className="text-3xl font-extrabold mb-2">{quizScore}%</p><p className="text-sm text-gray-400">{quizScore >= 66 ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p></motion.div>)}
          {certUnlocked && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">🔔</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 10: Alert Architecture (Free Tier)</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Alert Architect &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">PRO-CERT-L10.13-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
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

// ============================================================
// END OF LESSON
// ============================================================
