// ============================================================
// L11.27 — Cipher Operator (FINAL CAPSTONE of Level 11)
// "After All The Rules, The Operator Is The Risk."
// Cert: Cipher Operator (terminal-tier, no modifier)
// Slug: cipher-operator
// Built 2026-05-22. Chassis: L11.11 byte-perfect + L11.26 capstone pattern.
//
// IP DISCIPLINE (locked from L11.25 scrub lessons):
//   - Zero Pine code blocks
//   - Zero source-code line citations
//   - Zero internal variable names
//   - All teaching anchored to Command Center observations + input panel labels
//   - Behaviour, never implementation
// ============================================================
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// SHARED ANIMATION INFRASTRUCTURE
// ============================================================

interface AnimSceneProps {
  draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;
  aspectRatio?: number;
  height?: number;
}

function AnimScene({ draw, aspectRatio = 1.7, height }: AnimSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const h = height ?? w / aspectRatio;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, aspectRatio, height]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-black/30">
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

// ============================================================
// CONFETTI (cert reveal celebration — extra-burst for terminal cert)
// ============================================================
function Confetti({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#26A69A', '#FFB300', '#EF5350', '#FFFFFF', '#0EA5E9'];
    // L11.27 terminal cert: 180 particles (vs 120 in prior lessons)
    const particles = Array.from({ length: 180 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 240,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 4,
      g: 0.32,
      size: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.005;
        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });
      frame++;
      if (frame < 260) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  if (!fire) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ position: 'fixed' }}
    />
  );
}

// ============================================================
// ANIMATION 1 — OperatorIsRiskAnim (Hero/S00)
// Concentric-ring bullseye narrowing inward. Each ring labelled with
// a risk layer the operator has already addressed: ENGINE (outermost),
// CALIBRATION, ASSET CLASS, NEWS, DRAWDOWN — finally narrowing to
// the bullseye center: OPERATOR. The final ring lights up amber when
// the camera reaches it.
// 14-second loop.
// ============================================================
function OperatorIsRiskAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const SKY = '#0EA5E9';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIX RISK LAYERS \u2014 THE INNERMOST IS YOU', w / 2, 22);

    // Bullseye geometry
    const cx = w / 2;
    const cy = h / 2 + 8;
    const maxR = Math.min(w * 0.4, h * 0.42);

    const rings = [
      { label: 'ENGINE', sub: 'CIPHER reports honestly', color: TEAL, radiusFraction: 1.0 },
      { label: 'CALIBRATION', sub: 'Auto per asset class', color: SKY, radiusFraction: 0.83 },
      { label: 'ASSET CLASS', sub: 'Single-asset session', color: AMBER, radiusFraction: 0.66 },
      { label: 'NEWS', sub: '60-min envelopes', color: MAGENTA, radiusFraction: 0.49 },
      { label: 'DRAWDOWN', sub: 'Circuit breakers', color: '#A78BFA', radiusFraction: 0.32 },
      { label: 'OPERATOR', sub: 'YOU', color: AMBER, radiusFraction: 0.15 },
    ];

    const cycleDur = 14;
    const ct = t % cycleDur;
    // Animation: rings light up in sequence inward over 10s, hold 3s, brief pause 1s
    const lightDur = 10;
    const activeIdx = Math.min(rings.length - 1, Math.floor((ct / lightDur) * rings.length));
    const localT = ((ct / lightDur) * rings.length) % 1;

    // Draw all rings from outside in
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      const radius = maxR * r.radiusFraction;
      const reached = i <= activeIdx;
      const isCurrentlyLighting = i === activeIdx && ct < lightDur;

      // Ring outline
      ctx.strokeStyle = reached ? r.color : FAINT;
      ctx.lineWidth = i === rings.length - 1 ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Ring fill (only innermost, when fully lit)
      if (i === rings.length - 1 && reached) {
        const fillFade = isCurrentlyLighting ? localT : 1;
        ctx.fillStyle = `${r.color}${Math.floor(fillFade * 51).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glow on currently-lighting ring
      if (isCurrentlyLighting && i < rings.length - 1) {
        const glowFade = localT;
        ctx.strokeStyle = `${r.color}${Math.floor(glowFade * 100).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Labels for outer rings (placed on the ring's right side)
    for (let i = 0; i < rings.length - 1; i++) {
      const r = rings[i];
      const radius = maxR * r.radiusFraction;
      const reached = i <= activeIdx;
      const labelX = cx + radius + 6;
      const labelY = cy;

      if (labelX < w - 90) {
        ctx.fillStyle = reached ? r.color : DIM;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(r.label, labelX, labelY - 2);
        ctx.fillStyle = reached ? WHITE : DIM;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(r.sub, labelX, labelY + 9);
      }
    }

    // Center label (OPERATOR / YOU)
    const lastRing = rings[rings.length - 1];
    const lastReached = activeIdx === rings.length - 1;
    if (lastReached) {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lastRing.label, cx, cy + 2);
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(lastRing.sub, cx, cy + 14);
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Every risk layer outside the operator has been addressed. Only one remains.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.4} />;
}

// ============================================================
// ============================================================
// ANIMATION 2 — ThreeCompoundingCurvesAnim (S01)
// 365-day timeline. Three overlaid curves: skill (rising, teal),
// drift (rising, magenta), audit cadence (sawtooth corrections,
// amber). Skill + audit corrections > drift = positive net.
// Skill alone < drift = negative net. The visual proof that audit
// cadence is structural.
// 16-second loop.
// ============================================================
function ThreeCompoundingCurvesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THREE COMPOUNDING CURVES OVER 365 DAYS', w / 2, 22);

    const cycleDur = 16;
    const ct = t % cycleDur;
    const progress = Math.min(1, ct / 12);

    const chartX = 50;
    const chartTop = 52;
    const chartW = w - 80;
    const chartH = h - 100;
    const chartBottom = chartTop + chartH;

    // Axes
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartTop);
    ctx.lineTo(chartX, chartBottom);
    ctx.lineTo(chartX + chartW, chartBottom);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(chartX - 30, chartTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAGNITUDE', 0, 0);
    ctx.restore();

    // X-axis quarterly markers
    for (let q = 0; q <= 4; q++) {
      const qx = chartX + (q / 4) * chartW;
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      ctx.moveTo(qx, chartBottom);
      ctx.lineTo(qx, chartBottom + 4);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(q === 0 ? 'START' : `Q${q}`, qx, chartBottom + 14);
    }

    const N = 100; // sample points
    const maxX = N * progress;

    // SKILL curve — slow positive logarithmic
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= maxX; i++) {
      const x = chartX + (i / N) * chartW;
      const y = chartBottom - Math.log(1 + i * 0.08) * chartH * 0.18 - 8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // DRIFT curve — accelerating exponential (compounding mistakes)
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= maxX; i++) {
      const x = chartX + (i / N) * chartW;
      const y = chartBottom - Math.pow(i / N, 1.7) * chartH * 0.55 - 6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // AUDIT cadence — sawtooth corrections at 30/90/180/270/365 days
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let auditY = chartBottom - 8;
    const auditPoints = [0, 8, 25, 50, 75, 100];
    for (let i = 0; i <= maxX; i++) {
      const x = chartX + (i / N) * chartW;
      // Sawtooth: rise from each audit point, drop at next audit point
      const lastAudit = auditPoints.filter(p => p <= i).slice(-1)[0] ?? 0;
      const distFromAudit = i - lastAudit;
      const y = chartBottom - 8 - distFromAudit * 1.4;
      if (i === 0) ctx.moveTo(x, y);
      else if (auditPoints.includes(i)) {
        ctx.lineTo(x, y);
        ctx.lineTo(x, chartBottom - 8);
      }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Curve labels (right edge)
    if (progress > 0.5) {
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      const labelX = chartX + chartW * progress + 4;

      const skillY = chartBottom - Math.log(1 + N * progress * 0.08) * chartH * 0.18 - 8;
      ctx.fillStyle = TEAL;
      if (labelX < w - 70) ctx.fillText('SKILL', labelX, skillY);

      const driftY = chartBottom - Math.pow(progress, 1.7) * chartH * 0.55 - 6;
      ctx.fillStyle = MAGENTA;
      if (labelX < w - 70) ctx.fillText('DRIFT', labelX, driftY);

      ctx.fillStyle = AMBER;
      if (labelX < w - 70) ctx.fillText('AUDITS', labelX, chartBottom - 8);
    }

    // Audit markers as vertical lines (light dotted)
    for (const a of auditPoints.slice(1)) {
      if (a > maxX) break;
      const ax = chartX + (a / N) * chartW;
      ctx.strokeStyle = `${AMBER}55`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(ax, chartTop);
      ctx.lineTo(ax, chartBottom);
      ctx.stroke();
      ctx.setLineDash([]);
      // Mark which audit
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = a === 8 ? '30d' : a === 25 ? '90d' : a === 50 ? '180d' : a === 75 ? '270d' : 'ANNUAL';
      ctx.fillText(label, ax, chartTop - 4);
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Skill rises slowly. Drift rises exponentially. Audits are the structural correction.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 3 — IdentityTrapAnim (S02)
// Speech bubble forms around an operator silhouette saying "MY EDGE."
// The bubble grows. After fully formed, it cracks open and the
// operator's silhouette becomes transparent (identity dissolved).
// 12-second loop.
// ============================================================
function IdentityTrapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE IDENTITY TRAP \u2014 ARTICULATION IS CONTAGION', w / 2, 22);

    const cycleDur = 12;
    const ct = t % cycleDur;

    // Operator avatar (head + shoulders silhouette)
    const cx = w * 0.32;
    const cy = h * 0.55;
    const avatarR = 28;

    // Head
    ctx.fillStyle = ct > 8 ? `rgba(255,255,255,${0.3 - (ct - 8) * 0.05})` : 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy - 12, avatarR * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Shoulders
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, avatarR, avatarR * 0.6, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Phase 1 (0-4s): bubble grows, says "MY EDGE"
    if (ct < 4) {
      const grow = Math.min(1, ct / 1.5);
      const bx = cx + 50;
      const by = cy - 30;
      const bw = 140 * grow;
      const bh = 70 * grow;

      if (grow > 0.3) {
        ctx.fillStyle = `rgba(255,179,0,${0.12 * grow})`;
        ctx.strokeStyle = `rgba(255,179,0,${grow})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();
        // Tail
        ctx.beginPath();
        ctx.moveTo(bx, by + bh / 2);
        ctx.lineTo(bx - 10, by + bh / 2 + 6);
        ctx.lineTo(bx, by + bh / 2 + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (grow > 0.6) {
          const txt = Math.min(1, (grow - 0.6) / 0.3);
          ctx.fillStyle = `rgba(255,179,0,${txt})`;
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('"MY EDGE"', bx + bw / 2, by + bh / 2 + 5);
        }
      }
    }
    // Phase 2 (4-7s): bubble settled, text becomes louder
    else if (ct < 7) {
      const bx = cx + 50;
      const by = cy - 30;
      const bw = 140;
      const bh = 70;

      ctx.fillStyle = `rgba(255,179,0,0.18)`;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 12);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by + bh / 2);
      ctx.lineTo(bx - 10, by + bh / 2 + 6);
      ctx.lineTo(bx, by + bh / 2 + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = AMBER;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('"MY EDGE"', bx + bw / 2, by + bh / 2 + 5);

      // Side panel: "what the operator now believes"
      ctx.fillStyle = DIM;
      ctx.font = 'italic 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('The framework is now optional.', bx, by + bh + 14);
      ctx.fillText('Overrides become "judgment calls."', bx, by + bh + 26);
    }
    // Phase 3 (7-12s): bubble cracks, framework fades
    else {
      const crack = Math.min(1, (ct - 7) / 2);
      const bx = cx + 50;
      const by = cy - 30;
      const bw = 140;
      const bh = 70;

      ctx.fillStyle = `rgba(255,23,68,${0.1 * (1 - crack)})`;
      ctx.strokeStyle = `rgba(255,23,68,${1 - crack * 0.4})`;
      ctx.lineWidth = 2;
      // Draw shattered bubble: split into halves
      ctx.beginPath();
      ctx.roundRect(bx, by, bw / 2 - crack * 8, bh, [12, 0, 0, 12]);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(bx + bw / 2 + crack * 8, by, bw / 2 - crack * 8, bh, [0, 12, 12, 0]);
      ctx.fill();
      ctx.stroke();

      // "MY EDGE" text fading
      ctx.fillStyle = `rgba(255,23,68,${1 - crack})`;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('"MY EDGE"', bx + bw / 2, by + bh / 2 + 5);

      // Caption appearing
      if (crack > 0.5) {
        const fade = Math.min(1, (crack - 0.5) / 0.4);
        ctx.fillStyle = `rgba(255,23,68,${fade})`;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE FRAMEWORK WAS THE EDGE.', w / 2, h - 36);
        ctx.fillText('THE EDGE WAS NEVER YOURS TO ARTICULATE.', w / 2, h - 22);
      }
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Articulation creates identity. Identity creates override. Override creates collapse.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 4 — ★ PostWinningQuarterCycle (S03)
// 4-stage rotating wheel: EUPHORIA → LOOSENING → RECKONING → RESET.
// Each stage glows in turn. Center shows the operator's adherence
// percentage decaying from 100% in Euphoria to 73% in Reckoning,
// then resetting back to 100% in Reset (or not — depending on path).
// 16-second loop.
// ============================================================
function PostWinningQuarterCycle() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 THE POST-WINNING-QUARTER CYCLE \u2014 FOUR STAGES OF DECAY', w / 2, 22);

    const stages = [
      { name: 'EUPHORIA', sub: 'Misattribution begins', color: TEAL, adherence: 100, days: 'Days 0-15' },
      { name: 'LOOSENING', sub: 'Override rate 2% \u2192 6%', color: AMBER, adherence: 92, days: 'Days 15-45' },
      { name: 'RECKONING', sub: 'Drawdown collapses gains', color: MAGENTA, adherence: 73, days: 'Days 45-75' },
      { name: 'RESET', sub: '30-day break or deepen', color: TEAL, adherence: 100, days: 'Day 75+' },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perStage = cycleDur / stages.length;
    const activeIdx = Math.floor(ct / perStage);
    const localT = (ct % perStage) / perStage;

    // Wheel geometry
    const cx = w * 0.32;
    const cy = h * 0.52 + 8;
    const wheelR = Math.min(w * 0.2, h * 0.36);

    // Draw 4 wheel segments
    for (let i = 0; i < stages.length; i++) {
      const startAngle = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
      const endAngle = ((i + 1) / stages.length) * Math.PI * 2 - Math.PI / 2;
      const isActive = i === activeIdx;
      const stage = stages[i];

      ctx.fillStyle = isActive ? `${stage.color}33` : `${stage.color}10`;
      ctx.strokeStyle = isActive ? stage.color : `${stage.color}44`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelR, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Segment label (placed outside)
      const labelAngle = (startAngle + endAngle) / 2;
      const labelX = cx + Math.cos(labelAngle) * (wheelR + 14);
      const labelY = cy + Math.sin(labelAngle) * (wheelR + 14);
      ctx.fillStyle = isActive ? stage.color : DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stage.name, labelX, labelY);

      // Stage number badge
      const badgeX = cx + Math.cos(labelAngle) * (wheelR * 0.6);
      const badgeY = cy + Math.sin(labelAngle) * (wheelR * 0.6);
      ctx.fillStyle = isActive ? stage.color : `${stage.color}66`;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#080d16';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(String(i + 1), badgeX, badgeY + 3);
    }

    // Center adherence display
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = stages[activeIdx].color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = DIM;
    ctx.font = 'bold 6px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADHERENCE', cx, cy - 6);

    ctx.fillStyle = stages[activeIdx].color;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(stages[activeIdx].adherence + '%', cx, cy + 10);

    // Side panel
    const panelX = w * 0.6;
    const panelY = 52;
    const panelW = w - panelX - 20;
    const panelH = h - 80;

    ctx.fillStyle = `${stages[activeIdx].color}14`;
    ctx.strokeStyle = stages[activeIdx].color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stages[activeIdx].color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`STAGE ${activeIdx + 1}`, panelX + 12, panelY + 18);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(stages[activeIdx].name, panelX + 12, panelY + 36);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(stages[activeIdx].sub, panelX + 12, panelY + 52);
    ctx.fillText(stages[activeIdx].days, panelX + 12, panelY + 66);

    // Behavioral signs
    ctx.fillStyle = stages[activeIdx].color;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.fillText('SIGNS:', panelX + 12, panelY + 88);
    ctx.fillStyle = `rgba(255,255,255,${0.7 + 0.3 * Math.min(1, localT * 3)})`;
    ctx.font = '8px Inter, sans-serif';
    const signs = [
      ['"I figured it out"', 'Friends ask "how"', 'Confidence rising'],
      ['"Just this one"', 'Override rate climbing', 'Journal getting spotty'],
      ['"What happened?"', 'Drawdown active', 'Blame redirected outward'],
      ['Break taken', 'Curriculum re-read', 'Written re-commitment'],
    ];
    for (let s = 0; s < signs[activeIdx].length; s++) {
      ctx.fillText('\u2022 ' + signs[activeIdx][s], panelX + 12, panelY + 102 + s * 12);
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The cycle is statistical. Recognition at Stage 2 is the only mechanical defence.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 5 — PostLosingQuarterCycle (S04)
// Mirror cycle of #4. DEFEAT → OVER-RIGIDITY → PARALYSIS → RESET.
// Three failure paths from the same trigger. Adherence shown to swing
// from 100% (over-tight) to 0% (paralysis) and back.
// 16-second loop.
// ============================================================
function PostLosingQuarterCycle() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE POST-LOSING-QUARTER MIRROR CYCLE \u2014 THREE FAILURE PATHS', w / 2, 22);

    const stages = [
      { name: 'DEFEAT', sub: 'Drawdown realised', emotion: 'Rage / Shame', icon: '\u25BC', color: MAGENTA },
      { name: 'BRANCHING', sub: 'Three paths emerge', emotion: 'Choice point', icon: '\u2192', color: AMBER },
      { name: 'PATH A', sub: 'System-switching', emotion: 'Blame the framework', icon: '\u21BB', color: MAGENTA },
      { name: 'PATH B', sub: 'Over-rigidity', emotion: 'Tighten everything', icon: '\u2502', color: MAGENTA },
      { name: 'PATH C', sub: 'Paralysis', emotion: 'Unable to engage', icon: '\u25A1', color: MAGENTA },
      { name: 'RESET', sub: '30-day break', emotion: 'Audit + re-commit', icon: '\u2713', color: TEAL },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perStage = cycleDur / stages.length;
    const activeIdx = Math.floor(ct / perStage);
    const localT = (ct % perStage) / perStage;
    const stage = stages[activeIdx];

    // Layout: flowchart left-to-right
    const chartX = 30;
    const chartTop = 60;
    const chartW = w - 60;
    const chartH = h - 100;

    const nodeW = chartW * 0.16;
    const nodeH = 50;
    const nodeY = chartTop + chartH * 0.3;

    // Node positions
    const positions = [
      { x: chartX + 0 * (chartW * 0.18), y: nodeY },                          // DEFEAT
      { x: chartX + 1 * (chartW * 0.18), y: nodeY },                          // BRANCHING
      { x: chartX + 2 * (chartW * 0.18), y: nodeY - chartH * 0.18 },          // PATH A (top)
      { x: chartX + 2 * (chartW * 0.18), y: nodeY },                          // PATH B (middle)
      { x: chartX + 2 * (chartW * 0.18), y: nodeY + chartH * 0.18 },          // PATH C (bottom)
      { x: chartX + 4 * (chartW * 0.18), y: nodeY },                          // RESET
    ];

    // Draw connecting lines first
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    // DEFEAT -> BRANCHING
    ctx.beginPath();
    ctx.moveTo(positions[0].x + nodeW, positions[0].y + nodeH / 2);
    ctx.lineTo(positions[1].x, positions[1].y + nodeH / 2);
    ctx.stroke();
    // BRANCHING -> 3 paths
    for (let i = 2; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(positions[1].x + nodeW, positions[1].y + nodeH / 2);
      ctx.lineTo(positions[i].x, positions[i].y + nodeH / 2);
      ctx.stroke();
    }
    // 3 paths -> RESET (only RESET path drawn as direct, others fade out)
    for (let i = 2; i <= 4; i++) {
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = i === 3 ? FAINT : `${MAGENTA}44`;
      ctx.beginPath();
      ctx.moveTo(positions[i].x + nodeW, positions[i].y + nodeH / 2);
      ctx.lineTo(positions[5].x, positions[5].y + nodeH / 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw nodes
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const s = stages[i];
      const isActive = i === activeIdx;
      const isReached = i <= activeIdx;

      ctx.fillStyle = isActive ? `${s.color}33` : isReached ? `${s.color}14` : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = isActive ? s.color : isReached ? `${s.color}66` : FAINT;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, nodeW, nodeH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isReached ? s.color : DIM;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, p.x + nodeW / 2, p.y + 18);
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(s.name, p.x + nodeW / 2, p.y + 32);
      ctx.fillStyle = isReached ? `${WHITE}99` : DIM;
      ctx.font = '6px Inter, sans-serif';
      ctx.fillText(s.sub, p.x + nodeW / 2, p.y + 43);
    }

    // Stage detail at bottom
    if (activeIdx >= 0) {
      const fadeIn = Math.min(1, localT * 3);
      const detailY = chartTop + chartH - 30;
      ctx.fillStyle = `${stage.color}${Math.floor(fadeIn * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${stage.name}: ${stage.emotion}`, w / 2, detailY);
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same trigger. Three failure paths or one reset. The 30-day break is the only correct response.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 6 — MicroOverrideCompoundingAnim (S05)
// Bar chart over 4 quarters showing override rate growing
// geometrically: 2% Q1, 5% Q2, 12% Q3, 30% Q4. Each bar appears in
// turn; threshold lines marked at 5% (warning) and 15% (structural
// drift).
// 14-second loop.
// ============================================================
function MicroOverrideCompoundingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MICRO-OVERRIDE COMPOUNDING \u2014 ONE YEAR', w / 2, 22);

    const quarters = [
      { label: 'Q1', rate: 2, status: 'BASELINE', color: TEAL },
      { label: 'Q2', rate: 5, status: 'WARNING THRESHOLD', color: AMBER },
      { label: 'Q3', rate: 12, status: 'STRUCTURAL DRIFT', color: MAGENTA },
      { label: 'Q4', rate: 30, status: 'CYCLE BREAKDOWN', color: RED },
    ];

    const cycleDur = 14;
    const ct = t % cycleDur;
    const perQ = cycleDur / quarters.length;
    const activeIdx = Math.min(quarters.length - 1, Math.floor(ct / perQ));
    const localT = (ct % perQ) / perQ;

    const chartX = 60;
    const chartTop = 60;
    const chartW = w - 120;
    const chartH = h - 110;
    const chartBottom = chartTop + chartH;

    const maxRate = 35;

    // Threshold lines
    const warnY = chartBottom - (5 / maxRate) * chartH;
    const driftY = chartBottom - (15 / maxRate) * chartH;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = `${AMBER}88`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, warnY);
    ctx.lineTo(chartX + chartW, warnY);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('5% \u2014 WARNING', chartX - 4, warnY + 3);

    ctx.strokeStyle = `${MAGENTA}88`;
    ctx.beginPath();
    ctx.moveTo(chartX, driftY);
    ctx.lineTo(chartX + chartW, driftY);
    ctx.stroke();
    ctx.fillStyle = MAGENTA;
    ctx.fillText('15% \u2014 DRIFT', chartX - 4, driftY + 3);
    ctx.setLineDash([]);

    // Bars
    const barSpacing = chartW / quarters.length;
    const barW = barSpacing * 0.6;
    for (let i = 0; i < quarters.length; i++) {
      const q = quarters[i];
      const isActive = i === activeIdx;
      const isReached = i <= activeIdx;

      let displayRate = q.rate;
      if (isActive) {
        displayRate = q.rate * Math.min(1, localT * 2);
      } else if (!isReached) {
        displayRate = 0;
      }

      const bx = chartX + i * barSpacing + (barSpacing - barW) / 2;
      const bh = (displayRate / maxRate) * chartH;
      const by = chartBottom - bh;

      ctx.fillStyle = isReached ? `${q.color}AA` : 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = isReached ? q.color : FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, bh, 3);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = isReached ? q.color : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(q.label, bx + barW / 2, chartBottom + 12);

      // Rate value at top of bar
      if (isReached) {
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(displayRate.toFixed(0) + '%', bx + barW / 2, by - 4);
      }

      // Status badge below label
      if (isActive) {
        ctx.fillStyle = q.color;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.fillText(q.status, bx + barW / 2, chartBottom + 24);
      }
    }

    // Status panel at bottom
    const panelY = chartBottom + 38;
    ctx.fillStyle = `${quarters[activeIdx].color}14`;
    ctx.strokeStyle = quarters[activeIdx].color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartX, panelY, chartW, h - panelY - 22, 5);
    ctx.fill();
    ctx.stroke();

    const observations = [
      'Override rate within normal variance. Catch any individual instance in the next audit.',
      'Override rate has crossed warning threshold. Reset behaviour; do not tighten rule. 30-session vigilance.',
      'Override rate is now structural. Rule has effectively been redefined by behaviour. 30-day break required.',
      'Override rate exceeds 25%. Framework operationally abandoned. Full curriculum re-read mandatory.',
    ];
    ctx.fillStyle = WHITE;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    // Word wrap
    const words = observations[activeIdx].split(' ');
    let line = '';
    let ly = panelY + 14;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > chartW - 20 && line.length > 0) {
        ctx.fillText(line, w / 2, ly);
        line = word + ' ';
        ly += 11;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, w / 2, ly);

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Geometric compounding. Catch the curve at 5%; do not wait for 15%.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 7 — AccumulatedAuthorityAnim (S06)
// A tilting balance scale. Left side: "EARNED AUTHORITY" (rising
// stack of trade-success tokens). Right side: "EARNED HUMILITY"
// (also rising but slower). When authority outweighs humility, the
// scale crashes; when humility leads, the scale stays balanced.
// 14-second loop.
// ============================================================
function AccumulatedAuthorityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACCUMULATED AUTHORITY \u2014 THE SCALE THAT BREAKS', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    const cx = w / 2;
    const cy = h * 0.5;
    const armLen = w * 0.32;
    const platHalfW = w * 0.13;

    // Imbalance grows over the first 10s, scale crashes at 10s, resets at 12s
    let imbalance = 0; // -1 to +1, where +1 means authority side fully down
    if (ct < 2) imbalance = 0;
    else if (ct < 10) imbalance = Math.min(0.7, (ct - 2) / 8 * 0.7);
    else if (ct < 11) imbalance = 0.7 + (ct - 10) * 0.3; // crash
    else if (ct < 12) imbalance = 1.0; // crashed state
    else imbalance = 1.0 - (ct - 12) / 2; // resetting

    const angle = imbalance * 0.3; // max ~17 degrees tilt

    // Pivot
    ctx.fillStyle = DIM;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    // Pillar
    ctx.fillStyle = `${DIM}`;
    ctx.fillRect(cx - 2, cy, 4, h * 0.18);

    // Arm
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const leftX = cx - Math.cos(angle) * armLen;
    const leftY = cy + Math.sin(angle) * armLen;
    const rightX = cx + Math.cos(angle) * armLen;
    const rightY = cy - Math.sin(angle) * armLen;
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();

    // Platforms
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.rect(leftX - platHalfW, leftY - 4, platHalfW * 2, 4);
    ctx.fill();
    ctx.fillStyle = MAGENTA;
    ctx.beginPath();
    ctx.rect(rightX - platHalfW, rightY - 4, platHalfW * 2, 4);
    ctx.fill();

    // Tokens (stacks above each platform)
    const humilityTokens = Math.min(8, Math.floor(ct * 0.8));
    const authorityTokens = Math.min(12, Math.floor(ct * 1.2));

    // HUMILITY (left, teal)
    for (let i = 0; i < humilityTokens; i++) {
      const tx = leftX + (i % 3 - 1) * 12;
      const ty = leftY - 12 - Math.floor(i / 3) * 12;
      ctx.fillStyle = `${TEAL}DD`;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx - 9, ty - 4, 18, 8, 2);
      ctx.fill();
      ctx.stroke();
    }

    // AUTHORITY (right, magenta)
    for (let i = 0; i < authorityTokens; i++) {
      const tx = rightX + (i % 3 - 1) * 12;
      const ty = rightY - 12 - Math.floor(i / 3) * 12;
      ctx.fillStyle = ct > 10 ? `${RED}DD` : `${MAGENTA}DD`;
      ctx.strokeStyle = ct > 10 ? RED : MAGENTA;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx - 9, ty - 4, 18, 8, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EARNED HUMILITY', leftX, leftY + 22);
    ctx.fillStyle = DIM;
    ctx.font = 'italic 7px Inter, sans-serif';
    ctx.fillText('"I trust the framework"', leftX, leftY + 32);

    ctx.fillStyle = ct > 10 ? RED : MAGENTA;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('EARNED AUTHORITY', rightX, rightY + 22);
    ctx.fillStyle = DIM;
    ctx.font = 'italic 7px Inter, sans-serif';
    ctx.fillText('"I have earned the right to..."', rightX, rightY + 32);

    // Status text
    if (ct > 10 && ct < 12) {
      ctx.fillStyle = RED;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCALE BROKEN \u2014 OVERRIDE LICENSED', w / 2, h - 28);
    } else if (ct < 2) {
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Balanced. Both stacks grow.', w / 2, h - 28);
    } else if (ct < 10) {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AUTHORITY GROWS FASTER \u2014 IMBALANCE BUILDING', w / 2, h - 28);
    } else {
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RESETTING \u2014 30-DAY BREAK', w / 2, h - 28);
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Past wins are data, not credit. The framework owes you nothing.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 8 — PatternConfidenceTrapAnim (S07)
// A graph showing recent profit (last 30 days, upward sloping)
// overlaid with a perceived pattern (highlight). After a few seconds,
// the pattern dissolves; the next 30 days move randomly. The operator
// realised they were pattern-matching on small-sample noise.
// 14-second loop.
// ============================================================
function PatternConfidenceTrapAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE PATTERN CONFIDENCE TRAP \u2014 RECENCY IS NOT SKILL', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    const chartX = 40;
    const chartTop = 50;
    const chartW = w - 80;
    const chartH = h - 100;
    const chartBottom = chartTop + chartH;
    const midY = chartTop + chartH * 0.55;

    // Phase 1 (0-4s): draw past 30 days (winning, sloping up)
    const pastDays = 30;
    const futureDays = 30;
    const totalDays = pastDays + futureDays;
    const dayW = chartW / totalDays;

    // Past trajectory: rising
    const pastValues: number[] = [];
    for (let i = 0; i < pastDays; i++) {
      pastValues.push(midY - (i / pastDays) * chartH * 0.35 + Math.sin(i * 0.7) * chartH * 0.05);
    }

    // Future trajectory: random walk
    const futureValues: number[] = [];
    let lastY = pastValues[pastValues.length - 1];
    const seed = 0.5;
    for (let i = 0; i < futureDays; i++) {
      const noise = (Math.sin(i * 1.3 + seed) + Math.sin(i * 2.7 + seed * 2)) * chartH * 0.04;
      lastY = lastY + noise + chartH * 0.005; // mostly random with tiny drift
      futureValues.push(lastY);
    }

    // Draw past
    const showPast = Math.min(pastDays, Math.floor(ct * 8));
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.min(showPast, pastDays - 1); i++) {
      const x = chartX + i * dayW;
      const y = pastValues[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw "perceived pattern" overlay (highlighted region during phase 2)
    if (ct > 4 && ct < 8) {
      const fade = Math.min(1, (ct - 4) / 1);
      const fadeOut = ct > 7 ? 1 - (ct - 7) : 1;
      const alpha = Math.min(fade, fadeOut);
      ctx.strokeStyle = `${AMBER}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      // Sloped line representing the "pattern" the operator perceives
      ctx.moveTo(chartX, pastValues[0] + 4);
      ctx.lineTo(chartX + pastDays * dayW, pastValues[pastDays - 1] - 4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = `${AMBER}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('"I SEE A PATTERN"', chartX + pastDays * dayW * 0.5, pastValues[Math.floor(pastDays * 0.5)] - 18);
    }

    // Phase 3 (8s+): draw future, pattern dissolves
    if (ct > 8) {
      const showFuture = Math.min(futureDays, Math.floor((ct - 8) * 6));
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chartX + pastDays * dayW, pastValues[pastDays - 1]);
      for (let i = 0; i < showFuture; i++) {
        const x = chartX + (pastDays + i) * dayW;
        const y = futureValues[i];
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Caption appears
      if (ct > 11) {
        const fade = Math.min(1, (ct - 11) / 1);
        ctx.fillStyle = `rgba(255,23,68,${fade})`;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE PATTERN WAS A 30-BAR ACCIDENT.', w / 2, h - 28);
      }
    }

    // Today marker
    const todayX = chartX + pastDays * dayW;
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(todayX, chartTop);
    ctx.lineTo(todayX, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY', todayX, chartTop - 4);

    // Axis labels
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('-30d', chartX, chartBottom + 14);
    ctx.textAlign = 'right';
    ctx.fillText('+30d', chartX + chartW, chartBottom + 14);

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Recent profit is not skill. Skill is measured in years; profit is measured in months.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// === PHASE_2A_ANIMATION_INSERT_POINT ===
// Animations 2-8 land here (Phase 2A):
//   2. ThreeCompoundingCurvesAnim
//   3. IdentityTrapAnim
//   4. PostWinningQuarterCycle ★
//   5. PostLosingQuarterCycle
//   6. MicroOverrideCompoundingAnim
//   7. AccumulatedAuthorityAnim
//   8. PatternConfidenceTrapAnim
// ============================================================

// ============================================================
// ============================================================
// ANIMATION 9 — ★★ NinetySessionMultiClassAudit (S08)
// Interactive 3-tab widget. Tabs: FX / GOLD / INDICES. Each tab
// shows that class's 90-session breakdown: equity curve, override
// count, pattern attribution mini-chart, audit verdict. Click a tab
// to switch class. The lesson's spine.
// ============================================================
function NinetySessionMultiClassAudit() {
  type Klass = 'FX' | 'GOLD' | 'INDICES';
  const [active, setActive] = useState<Klass>('FX');

  const classData: Record<Klass, {
    color: string;
    cumPnL: number;
    winRate: number;
    avgR: number;
    overrideCount: number;
    overrideRate: number;
    bestPattern: string;
    bestPatternPct: number;
    worstPattern: string;
    worstPatternPct: number;
    failureMode: string;
    failureCount: number;
    verdict: string;
    nextCyclePlan: string;
    equityPoints: number[];
  }> = {
    FX: {
      color: '#26A69A',
      cumPnL: 22.4,
      winRate: 61,
      avgR: 1.35,
      overrideCount: 3,
      overrideRate: 1.7,
      bestPattern: 'PX Continuation',
      bestPatternPct: 71,
      worstPattern: 'TS Reversal',
      worstPatternPct: 12,
      failureMode: 'News-window override',
      failureCount: 2,
      verdict: 'STRONG CLASS \u2014 Edge concentrated in PX continuations',
      nextCyclePlan: 'Continue Swing Trader preset. Add 1 step: increase PX-continuation conviction tier from 3/4 to 4/4 to filter further.',
      equityPoints: [0, 1.2, 0.4, 1.7, 0.6, 2.1, 1.4, 2.8, 2.2, 3.5, 4.1, 3.7, 5.2, 4.8, 6.1, 5.5, 7.2, 6.8, 8.4, 7.9, 9.6, 10.2, 9.5, 11.1, 12.4, 11.8, 13.5, 14.2, 13.7, 15.6, 16.4, 15.8, 17.5, 18.9, 17.6, 19.3, 20.1, 19.4, 21.2, 22.4],
    },
    GOLD: {
      color: '#0EA5E9',
      cumPnL: 14.6,
      winRate: 54,
      avgR: 1.18,
      overrideCount: 6,
      overrideRate: 4.2,
      bestPattern: 'PX Continuation',
      bestPatternPct: 58,
      worstPattern: 'TS Reversal',
      worstPatternPct: 8,
      failureMode: 'News-envelope override',
      failureCount: 4,
      verdict: 'MARGINAL CLASS \u2014 Override rate approaching 5% threshold',
      nextCyclePlan: 'Tighten news-window discipline. Pre-flag every high-impact event during pre-session. If override rate >5% next cycle, take 30-day break from Gold.',
      equityPoints: [0, 0.8, 0.4, 1.2, 0.6, 1.7, 1.1, 2.4, 1.9, 3.1, 2.7, 3.8, 4.4, 3.9, 5.1, 4.6, 5.8, 5.4, 6.7, 6.2, 7.5, 7.1, 8.3, 7.8, 9.1, 8.6, 10.0, 9.4, 10.8, 10.3, 11.5, 11.0, 12.2, 11.7, 12.9, 12.4, 13.6, 13.1, 14.0, 14.6],
    },
    INDICES: {
      color: '#FFB300',
      cumPnL: -3.8,
      winRate: 42,
      avgR: 0.78,
      overrideCount: 14,
      overrideRate: 11.5,
      bestPattern: 'Coil Breakout',
      bestPatternPct: 48,
      worstPattern: 'Open-window engage',
      worstPatternPct: -2,
      failureMode: 'Indices open-chasing',
      failureCount: 9,
      verdict: 'WEAK CLASS \u2014 Open-window override pattern destroying edge',
      nextCyclePlan: 'Hard-skip 09:30-10:00 ET for next 30 sessions, no exceptions. Re-audit at session 60. If override rate <5%, continue. If >5%, drop Indices from rotation.',
      equityPoints: [0, 0.4, -0.2, 0.6, 0.2, -0.5, 0.3, -0.8, 0.1, -1.2, -0.4, 0.5, -1.6, -0.9, 0.3, -2.1, -1.3, 0.2, -2.4, -1.6, 0.5, -2.8, -1.9, 0.4, -3.2, -2.4, 0.1, -3.5, -2.7, 0.0, -3.8, -3.1, -0.3, -4.1, -3.4, -0.6, -4.4, -3.7, -1.0, -3.8],
    },
  };

  const data = classData[active];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-black/30 p-5 select-none">
      <p className="text-xs font-bold text-amber-400 mb-3 text-center tracking-widest">
        &#9733;&#9733; 90-SESSION MULTI-CLASS AUDIT &mdash; SELECT A CLASS
      </p>

      {/* Tab buttons */}
      <div className="flex gap-2 justify-center mb-4">
        {(['FX', 'GOLD', 'INDICES'] as Klass[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              active === k ? 'border-2' : 'border border-white/10 hover:border-white/30'
            }`}
            style={{
              backgroundColor: active === k ? `${classData[k].color}22` : 'rgba(255,255,255,0.04)',
              borderColor: active === k ? classData[k].color : undefined,
              color: active === k ? classData[k].color : 'rgba(255,255,255,0.7)',
            }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Equity curve */}
      <div className="rounded-lg p-3 mb-3 border" style={{ backgroundColor: `${data.color}08`, borderColor: `${data.color}33` }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: data.color }}>EQUITY CURVE &middot; 40 SESSIONS SHOWN (90 TOTAL)</p>
        <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: '140px' }}>
          {(() => {
            const pts = data.equityPoints;
            const min = Math.min(0, ...pts);
            const max = Math.max(0, ...pts);
            const range = (max - min) || 1;
            const zeroY = 110 - ((0 - min) / range) * 100;
            const path = pts.map((v, i) => {
              const x = (i / (pts.length - 1)) * 380 + 10;
              const y = 110 - ((v - min) / range) * 100;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
            return (
              <>
                <line x1="10" y1={zeroY} x2="390" y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" strokeWidth="1" />
                <text x="6" y={zeroY + 3} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="end">0R</text>
                <path d={path} stroke={data.color} strokeWidth="2" fill="none" />
                {pts.map((v, i) => {
                  const x = (i / (pts.length - 1)) * 380 + 10;
                  const y = 110 - ((v - min) / range) * 100;
                  return <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 1.5} fill={data.color} />;
                })}
                <text x="390" y={110 - ((pts[pts.length - 1] - min) / range) * 100 - 6} fill={data.color} fontSize="9" textAnchor="end" fontWeight="bold">
                  {data.cumPnL >= 0 ? '+' : ''}{data.cumPnL.toFixed(1)}R
                </text>
              </>
            );
          })()}
        </svg>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[8px] text-gray-500">CUM P&amp;L</p>
          <p className="text-sm font-bold" style={{ color: data.cumPnL >= 0 ? data.color : '#EF5350' }}>
            {data.cumPnL >= 0 ? '+' : ''}{data.cumPnL.toFixed(1)}R
          </p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[8px] text-gray-500">WIN RATE</p>
          <p className="text-sm font-bold text-white">{data.winRate}%</p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[8px] text-gray-500">AVG R</p>
          <p className="text-sm font-bold text-white">{data.avgR.toFixed(2)}</p>
        </div>
        <div className="rounded-lg p-2 text-center" style={{
          backgroundColor: data.overrideRate < 2 ? 'rgba(38,166,154,0.08)' : data.overrideRate < 5 ? 'rgba(255,179,0,0.08)' : 'rgba(239,83,80,0.08)',
        }}>
          <p className="text-[8px] text-gray-500">OVERRIDE</p>
          <p className="text-sm font-bold" style={{
            color: data.overrideRate < 2 ? '#26A69A' : data.overrideRate < 5 ? '#FFB300' : '#EF5350',
          }}>{data.overrideRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Pattern attribution */}
      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <p className="text-[10px] font-bold mb-2 text-amber-400">PATTERN ATTRIBUTION</p>
        <div className="flex items-center gap-3 mb-1.5">
          <p className="text-[10px] text-gray-400 w-32 truncate">Best: {data.bestPattern}</p>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full rounded-full" style={{ width: `${data.bestPatternPct}%`, backgroundColor: data.color }} />
          </div>
          <p className="text-[10px] font-bold w-10 text-right" style={{ color: data.color }}>+{data.bestPatternPct}%</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-gray-400 w-32 truncate">Worst: {data.worstPattern}</p>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full rounded-full" style={{ width: `${Math.abs(data.worstPatternPct)}%`, backgroundColor: '#EF5350' }} />
          </div>
          <p className="text-[10px] font-bold w-10 text-right text-red-400">{data.worstPatternPct >= 0 ? '+' : ''}{data.worstPatternPct}%</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="rounded-lg p-3 mb-3 border" style={{
        backgroundColor: `${data.color}10`,
        borderColor: `${data.color}40`,
      }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: data.color }}>VERDICT</p>
        <p className="text-xs text-white leading-relaxed">{data.verdict}</p>
      </div>

      {/* Failure mode */}
      <div className="rounded-lg p-3 mb-3 border" style={{
        backgroundColor: 'rgba(239,83,80,0.05)',
        borderColor: 'rgba(239,83,80,0.25)',
      }}>
        <p className="text-[10px] font-bold mb-1 text-red-400">FAILURE MODE THIS CYCLE</p>
        <p className="text-xs text-gray-300 leading-relaxed">
          {data.failureMode} &mdash; <span className="text-red-400 font-bold">{data.failureCount} instances</span>
        </p>
      </div>

      {/* Next cycle plan */}
      <div className="rounded-lg p-3 border" style={{
        backgroundColor: 'rgba(255,179,0,0.05)',
        borderColor: 'rgba(255,179,0,0.25)',
      }}>
        <p className="text-[10px] font-bold mb-1 text-amber-400">NEXT CYCLE PLAN</p>
        <p className="text-xs text-gray-300 leading-relaxed">{data.nextCyclePlan}</p>
      </div>

      <p className="text-[10px] text-gray-500 mt-3 text-center italic">
        Three classes, three audits, three next-cycle plans. Never aggregated to one portfolio number.
      </p>
    </div>
  );
}

// ============================================================
// ANIMATION 10 — AnnualCalibrationProtocolAnim (S09)
// Calendar view: 4 quarters (Q1, Q2, Q3, Q4). Each quarter has a
// "30-session audit" badge that fires in turn. Q4 ends with an
// "ANNUAL CALIBRATION" event that wraps the year. Side panel shows
// the protocol steps for the active period.
// 16-second loop.
// ============================================================
function AnnualCalibrationProtocolAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE ANNUAL CALIBRATION CADENCE', w / 2, 22);

    const events = [
      { label: 'Q1 AUDIT', sub: '90 sessions / 3 classes', color: TEAL, type: 'audit' },
      { label: 'Q2 AUDIT', sub: '180 sessions cumulative', color: TEAL, type: 'audit' },
      { label: 'Q3 AUDIT', sub: '270 sessions cumulative', color: TEAL, type: 'audit' },
      { label: 'ANNUAL CALIBRATION', sub: 'Full curriculum re-read', color: AMBER, type: 'annual' },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perEvent = cycleDur / events.length;
    const activeIdx = Math.floor(ct / perEvent);
    const localT = (ct % perEvent) / perEvent;
    const event = events[activeIdx];

    // Year timeline at top
    const timelineY = 56;
    const timelineX = 40;
    const timelineW = w - 80;

    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(timelineX, timelineY);
    ctx.lineTo(timelineX + timelineW, timelineY);
    ctx.stroke();

    // Quarter markers
    for (let q = 0; q <= 4; q++) {
      const qx = timelineX + (q / 4) * timelineW;
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(qx, timelineY - 4);
      ctx.lineTo(qx, timelineY + 4);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(q === 0 ? 'YEAR START' : q === 4 ? 'YEAR END' : `Q${q}`, qx, timelineY - 8);
    }

    // Event markers on timeline
    for (let i = 0; i < events.length; i++) {
      const ex = timelineX + ((i + 1) / 4) * timelineW;
      const isActive = i === activeIdx;
      const isReached = i <= activeIdx;
      const ev = events[i];

      // Marker dot
      ctx.fillStyle = isReached ? ev.color : `${ev.color}44`;
      ctx.beginPath();
      ctx.arc(ex, timelineY, isActive ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        ctx.strokeStyle = ev.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, timelineY, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Event icon (audit = checkmark, annual = crown)
      ctx.fillStyle = isReached ? '#080d16' : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ev.type === 'audit' ? '\u2713' : '\u2605', ex, timelineY + 4);
    }

    // Active event details below
    const panelY = timelineY + 40;
    const panelH = h - panelY - 30;

    ctx.fillStyle = `${event.color}14`;
    ctx.strokeStyle = event.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, panelY, w - 80, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = event.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(event.label, 56, panelY + 20);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(event.sub, 56, panelY + 34);

    // Protocol steps for this event
    const auditSteps = [
      '1. Pull 90-session journal for each active class',
      '2. Compute per-class cumulative P&L, win rate, override count',
      '3. Pattern attribution analysis per class',
      '4. Write per-class verdict and next-cycle plan',
      '5. Re-commit to rules in writing for next 30 sessions',
    ];
    const annualSteps = [
      '1. Re-read entire Level 11 curriculum (L11.1 through L11.27)',
      '2. Re-take certificates for any discipline showing drift',
      '3. Compute year-end per-class P&L (do NOT aggregate)',
      '4. Identify edge concentration: which class carried the year?',
      '5. Set the next year\'s class rotation and engagement targets',
      '6. Written re-commitment to the rules with explicit annual date',
    ];

    const steps = event.type === 'audit' ? auditSteps : annualSteps;
    const fadeIn = Math.min(1, localT * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.85 * fadeIn})`;
    ctx.font = '9px Inter, sans-serif';
    for (let i = 0; i < steps.length; i++) {
      ctx.fillText(steps[i], 56, panelY + 56 + i * 14);
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Quarterly audits catch drift. Annual calibration catches identity creep.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 11 — ReplacementOperatorAnim (S10)
// Two operator silhouettes — left is current operator, right is
// stranger. A folder labelled "JOURNAL + PRESET + WATCHLIST" passes
// from current to stranger. The stranger then either executes
// identically (green check) or stumbles (red question marks
// appearing).
// 14-second loop. Two halves: first half shows clean handoff,
// second half shows confused stranger.
// ============================================================
function ReplacementOperatorAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE REPLACEMENT OPERATOR TEST', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // Two operator silhouettes
    const opAY = h * 0.35;
    const opBY = h * 0.35;
    const opAX = w * 0.22;
    const opBX = w * 0.78;
    const headR = 16;

    // Op A (current operator)
    ctx.fillStyle = `${TEAL}DD`;
    ctx.beginPath();
    ctx.arc(opAX, opAY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(opAX, opAY + 22, headR * 1.4, headR * 0.7, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', opAX, opAY + 50);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('Current Operator', opAX, opAY + 62);

    // Op B (stranger)
    const isClean = ct < cycleDur / 2;
    const strangerColor = isClean ? TEAL : MAGENTA;
    ctx.fillStyle = `${strangerColor}AA`;
    ctx.beginPath();
    ctx.arc(opBX, opBY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(opBX, opBY + 22, headR * 1.4, headR * 0.7, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = strangerColor;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('STRANGER', opBX, opBY + 50);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('Replacement Operator', opBX, opBY + 62);

    // Folder traveling across (first 3s)
    const handoffT = Math.min(1, (ct % (cycleDur / 2)) / 3);
    const folderX = opAX + (opBX - opAX) * handoffT;
    const folderY = opAY - 6;
    ctx.fillStyle = `${AMBER}DD`;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(folderX - 22, folderY - 10, 44, 20, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#080d16';
    ctx.font = 'bold 6px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOURNAL', folderX, folderY - 1);
    ctx.fillText('+ PRESET', folderX, folderY + 7);

    // Phase 1 (clean): green check appears above stranger
    if (isClean && handoffT >= 1) {
      const fade = Math.min(1, (ct - 3) / 1.5);
      ctx.fillStyle = `${TEAL}${Math.floor(fade * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2713', opBX, opBY - 30);

      // Banner
      ctx.fillStyle = `${TEAL}${Math.floor(fade * 51).toString(16).padStart(2, '0')}`;
      ctx.strokeStyle = `${TEAL}${Math.floor(fade * 200).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(40, h - 80, w - 80, 50, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('CLEAN PROTOCOL \u2014 STRANGER EXECUTES IDENTICALLY', w / 2, h - 60);
      ctx.fillStyle = `rgba(255,255,255,${0.8 * fade})`;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('Journal entries are explicit. Preset is documented. Watchlist is structured.', w / 2, h - 46);
    }
    // Phase 2 (confused): red ? marks bubble around stranger
    else if (!isClean && handoffT >= 1) {
      const localPhase2T = (ct - cycleDur / 2 - 3) / 4;
      const fade = Math.min(1, Math.max(0, localPhase2T));

      // Question marks orbiting
      for (let i = 0; i < 5; i++) {
        const orbitT = ct * 1.5 + i * 1.2;
        const orbitR = 30 + (i % 2) * 8;
        const qx = opBX + Math.cos(orbitT) * orbitR;
        const qy = opBY - 12 + Math.sin(orbitT) * orbitR * 0.5;
        ctx.fillStyle = `${RED}${Math.floor(fade * 220).toString(16).padStart(2, '0')}`;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', qx, qy);
      }

      // Banner
      ctx.fillStyle = `${RED}${Math.floor(fade * 40).toString(16).padStart(2, '0')}`;
      ctx.strokeStyle = `${RED}${Math.floor(fade * 200).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(40, h - 80, w - 80, 50, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IMPLICIT JUDGMENT \u2014 STRANGER CANNOT REPLICATE', w / 2, h - 60);
      ctx.fillStyle = `rgba(255,255,255,${0.8 * fade})`;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('Journal has gaps. Preset modifications undocumented. Drift hides here.', w / 2, h - 46);
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Run the test quarterly. Codify whatever the stranger cannot replicate.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 12 — ★★ MasteryStaircaseClimb (S15)
// Full 27-lesson staircase. Each step labelled with the lesson name
// and cert earned. Operator avatar climbs from L11.1 up through
// L11.27 over 12 seconds. At L11.27 the avatar reaches a plateau
// labelled "CIPHER OPERATOR" with the next staircase ("LIVE TRADING")
// faintly visible ahead.
// 14-second loop.
// ============================================================
function MasteryStaircaseClimb() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const SKY = '#0EA5E9';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605\u2605 THE MASTERY STAIRCASE \u2014 27 STEPS TO CIPHER OPERATOR', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;
    const climbProgress = Math.min(1, ct / 11);

    // 27 lessons grouped into 5 segments for visual clarity
    const totalLessons = 27;
    const groups = [
      { range: [1, 4], label: 'FOUNDATIONS', color: TEAL },
      { range: [5, 9], label: 'REGIME LITERACY', color: SKY },
      { range: [10, 14], label: 'SIGNAL PIPELINES', color: AMBER },
      { range: [15, 21], label: 'VISUAL LAYERS', color: MAGENTA },
      { range: [22, 25], label: 'CONVICTION + DISCIPLINE', color: '#A78BFA' },
      { range: [26, 27], label: 'CAPSTONES', color: AMBER },
    ];

    // Staircase geometry
    const baseY = h - 40;
    const baseX = 50;
    const stepW = (w - baseX - 100) / totalLessons;
    const totalRise = h - 70;
    const stepH = totalRise / totalLessons;

    // Draw staircase
    for (let i = 0; i < totalLessons; i++) {
      const sx = baseX + i * stepW;
      const sy = baseY - (i + 1) * stepH;
      const sh = stepH;

      // Determine group
      const lessonNum = i + 1;
      const group = groups.find(g => lessonNum >= g.range[0] && lessonNum <= g.range[1]);
      const groupColor = group ? group.color : DIM;

      const reached = climbProgress * totalLessons > i;

      ctx.fillStyle = reached ? `${groupColor}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = reached ? groupColor : FAINT;
      ctx.lineWidth = reached ? 1 : 0.5;
      ctx.beginPath();
      ctx.rect(sx, sy, stepW, sh);
      ctx.fill();
      ctx.stroke();

      // L11.27 (terminal step) gets special treatment
      if (i === totalLessons - 1 && reached) {
        ctx.fillStyle = `${AMBER}44`;
        ctx.beginPath();
        ctx.rect(sx, sy, stepW, sh);
        ctx.fill();
        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Group labels above staircase
    for (const group of groups) {
      const startX = baseX + (group.range[0] - 1) * stepW;
      const endX = baseX + group.range[1] * stepW;
      const labelY = baseY - groups.indexOf(group) * 8 - 12;
      // (Skipping label drawing here to avoid clutter; using color-coded steps as the primary indicator)
    }

    // Operator avatar climbing
    const lessonsClimbed = climbProgress * totalLessons;
    const climbedIdx = Math.min(totalLessons - 1, Math.floor(lessonsClimbed));
    const subT = lessonsClimbed - climbedIdx;
    const avatarX = baseX + climbedIdx * stepW + stepW / 2;
    const avatarTargetY = baseY - (climbedIdx + 1) * stepH - 6;
    const prevY = climbedIdx === 0 ? baseY : baseY - climbedIdx * stepH - 6;
    const avatarY = prevY + (avatarTargetY - prevY) * Math.min(1, subT * 2);

    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#080d16';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Plateau "CIPHER OPERATOR" at top right (visible when climber nears top)
    if (climbProgress > 0.85) {
      const fade = Math.min(1, (climbProgress - 0.85) / 0.15);
      const plateauX = baseX + totalLessons * stepW + 12;
      const plateauY = baseY - totalLessons * stepH - 30;

      ctx.fillStyle = `rgba(255,179,0,${fade * 0.18})`;
      ctx.strokeStyle = `rgba(255,179,0,${fade})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(plateauX, plateauY, 80, 30, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(255,179,0,${fade})`;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CIPHER', plateauX + 40, plateauY + 13);
      ctx.fillText('OPERATOR', plateauX + 40, plateauY + 24);

      // Next staircase ("LIVE TRADING") faintly visible further up-right
      ctx.fillStyle = `rgba(255,255,255,${fade * 0.25})`;
      ctx.font = 'italic 8px Inter, sans-serif';
      ctx.fillText('\u2192 Live trading,', plateauX + 40, plateauY + 40);
      ctx.fillText('annual practice', plateauX + 40, plateauY + 50);
    }

    // Lesson counter
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Lesson ${climbedIdx + 1} of ${totalLessons}`, baseX, baseY + 12);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText(`${Math.round(climbProgress * 100)}% complete`, baseX, baseY + 24);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each step is a cert. L11.27 is the plateau before live trading, not the destination.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={2.0} />;
}

// ============================================================
// ANIMATION 13 — ★ FullCurriculumWebAnim (S13)
// 27 nodes arranged in a network (5 columns by ~6 rows). Each node
// labelled with lesson number. Lines connect related lessons.
// Highlights cycle through showing different reinforcement clusters:
// the "discipline cluster" (L11.22+25+27), the "asset class cluster"
// (L11.5+26+27), etc.
// 18-second loop.
// ============================================================
function FullCurriculumWebAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const SKY = '#0EA5E9';
    const PURPLE = '#A78BFA';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 THE FULL CURRICULUM WEB \u2014 27 LESSONS, MULTIPLE COHERENCE PATHS', w / 2, 22);

    // 27 nodes in a 6 x 5 grid (last row partial)
    const cols = 6;
    const rows = 5;
    const gridX = 40;
    const gridY = 48;
    const gridW = w - 80;
    const gridH = h - 80;
    const colW = gridW / cols;
    const rowH = gridH / rows;

    const cycleDur = 18;
    const ct = t % cycleDur;

    // Define coherence clusters (groups of lessons that reinforce each other)
    const clusters = [
      {
        name: 'DISCIPLINE COHERENCE',
        nodes: [22, 23, 25, 27],
        color: AMBER,
      },
      {
        name: 'ASSET-CLASS COHERENCE',
        nodes: [5, 6, 7, 26, 27],
        color: TEAL,
      },
      {
        name: 'SIGNAL-PIPELINE COHERENCE',
        nodes: [10, 11, 12, 13, 14],
        color: MAGENTA,
      },
      {
        name: 'VISUAL-LAYER COHERENCE',
        nodes: [15, 16, 17, 18, 19, 20, 21],
        color: SKY,
      },
      {
        name: 'CAPSTONE INTEGRATION',
        nodes: [25, 26, 27],
        color: PURPLE,
      },
    ];

    const perCluster = cycleDur / clusters.length;
    const activeIdx = Math.floor(ct / perCluster);
    const activeCluster = clusters[activeIdx];

    // Node positions
    const nodePositions: { x: number; y: number; n: number }[] = [];
    for (let i = 0; i < 27; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const nx = gridX + col * colW + colW / 2;
      const ny = gridY + row * rowH + rowH / 2;
      nodePositions.push({ x: nx, y: ny, n: i + 1 });
    }

    // Draw connecting lines for active cluster (semi-faded base + bright for active)
    for (let i = 0; i < activeCluster.nodes.length; i++) {
      for (let j = i + 1; j < activeCluster.nodes.length; j++) {
        const a = nodePositions.find(p => p.n === activeCluster.nodes[i]);
        const b = nodePositions.find(p => p.n === activeCluster.nodes[j]);
        if (a && b) {
          ctx.strokeStyle = `${activeCluster.color}99`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw all nodes
    for (const node of nodePositions) {
      const inCluster = activeCluster.nodes.includes(node.n);
      const isTerminal = node.n === 27;

      const r = isTerminal ? 11 : 8;
      ctx.fillStyle = inCluster ? activeCluster.color : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = inCluster ? activeCluster.color : FAINT;
      ctx.lineWidth = isTerminal ? 2 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Node number
      ctx.fillStyle = inCluster ? '#080d16' : DIM;
      ctx.font = isTerminal ? 'bold 9px Inter, sans-serif' : 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(node.n), node.x, node.y + 3);
    }

    // Cluster label at top of canvas
    ctx.fillStyle = activeCluster.color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activeCluster.name, w / 2, h - 28);
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText(`Lessons ${activeCluster.nodes.join(', ')} reinforce each other`, w / 2, h - 16);

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('Each lesson is a node. Each cluster is a coherent learning path.', w / 2, h - 4);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// === PHASE_2B_ANIMATION_INSERT_POINT ===
// Animations 9-13 land here (Phase 2B):
//   9. NinetySessionMultiClassAudit ★★ (interactive widget)
//   10. AnnualCalibrationProtocolAnim
//   11. ReplacementOperatorAnim
//   12. MasteryStaircaseClimb ★★
//   13. FullCurriculumWebAnim ★
// ============================================================

// ============================================================
// GAME DATA (5 multi-cycle decision scenarios)
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You have just finished your best quarter on CIPHER: +42R cumulative, 91% protocol adherence, 4 perfect 30-session class cycles. Confidence is high. A friend asks how you would explain "your edge" if they invested with you.',
    prompt: 'What does mastery-tier discipline say?',
    options: [
      {
        id: 'a',
        text: 'Explain your edge with confidence — you have earned the right to articulate it as your own style after the results you just delivered.',
        correct: false,
        explain:
          'This is the post-winning-quarter identity-formation failure. The moment you articulate "my edge" to a third party, the framework starts becoming your style — at which point you stop following it and start defending it. Every operator who has blown up after a winning quarter went through this articulation step. The framework gave you the edge; describing the edge as yours quietly reframes the framework as optional.',
      },
      {
        id: 'b',
        text: 'Decline to articulate it. Tell your friend you are running the CIPHER framework with discipline, not running a personal style. Redirect the conversation.',
        correct: true,
        explain:
          'Correct. The disciplined response is to deflect the identity formation entirely. You are not the source of the edge — the framework is, and your contribution is executing it without override. Articulating "my edge" is the first step toward owning the edge, which is the first step toward losing it. Master operators describe their work as "running CIPHER with discipline" — not as personal genius.',
      },
      {
        id: 'c',
        text: 'Explain your edge but downplay it — call it luck so you do not jinx yourself.',
        correct: false,
        explain:
          'Half-credit answer. The "luck" framing is closer to correct (it externalises the result) but it is still articulating an edge to a third party. The disciplined response is to not articulate at all, because articulation creates identity creep regardless of whether you frame the result as skill or luck. The right move is deflection, not modesty.',
      },
      {
        id: 'd',
        text: 'Offer to manage their money — your results prove you can.',
        correct: false,
        explain:
          'The worst possible response. Managing other people\'s money after a winning quarter is the canonical post-winning failure. The fiduciary pressure changes your relationship with the framework; the size shift breaks calibration; the explanation-to-clients step compounds identity formation. Operators who manage money after a winning quarter compound their drift through additional structural pressures. Decline the invitation regardless of how confident you feel.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'Your latest 30-session FX audit shows you have been overriding the news-window envelope ~12% of the time. The overrides won 5 of 7 times, contributing +4R to the quarter. You catch this in the audit. What does mastery-tier discipline say?',
    prompt: 'What is the correct response?',
    options: [
      {
        id: 'a',
        text: 'Continue the overrides — the data shows they win 71% of the time, so the rule is too conservative.',
        correct: false,
        explain:
          'This is the canonical micro-override compounding failure. Seven trades is not a statistically meaningful sample to override a structural rule. The 5-of-7 win rate is well within normal random variance for any small sample. The 60-minute news envelope was set precisely because the population-level expected value is below baseline; small samples that happen to outperform do not invalidate the rule, they validate the sample size needed to detect drift.',
      },
      {
        id: 'b',
        text: 'Treat the overrides as 7 discipline failures regardless of their P&L outcome. Reset the override counter to zero. Tighten news-window vigilance for the next 30 sessions.',
        correct: true,
        explain:
          'Correct. The mastery-tier response decouples process from outcome. Each override was a discipline failure regardless of whether it won or lost; the wins are noise; the cumulative pattern is signal. The micro-override compounding curve starts here: 12% overrides this quarter, 18% next quarter if uncorrected, 30%+ within a year. The audit caught the drift early; the disciplined response is to reset rather than rationalise.',
      },
      {
        id: 'c',
        text: 'Audit each override individually. Keep the ones with good reasoning, eliminate the ones that were emotional.',
        correct: false,
        explain:
          'This is the rationalisation trap dressed as discipline. The override doctrine from L11.25 is binary: an override is an override regardless of post-hoc reasoning. "Good reasoning" overrides are not different from "emotional" overrides because the moment you accept reasoning-based overrides, every override becomes good-reasoning in retrospect. The doctrine works only when applied without exception.',
      },
      {
        id: 'd',
        text: 'Reduce the news-window envelope from 60 minutes to 30 minutes — clearly the rule is too conservative.',
        correct: false,
        explain:
          'This is the rule-modification failure. Adjusting structural rules based on 30-session data is not calibration, it is rationalisation with a structural disguise. Rules at this tier are modified only after multi-quarter evidence at scale, not after 7 winning overrides. The rule stands; your behaviour adjusts to the rule, not vice versa.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You have run CIPHER successfully for 8 months across 3 asset classes. A new operator joins your circle and asks you to teach them. They are eager and inexperienced. They want to skip ahead to your current setup.',
    prompt: 'What does mastery-tier responsibility say?',
    options: [
      {
        id: 'a',
        text: 'Teach them your current 3-class setup directly so they can replicate your results faster.',
        correct: false,
        explain:
          'This violates the calibration-sequence rule from L11.26. Your 3-class setup works because of the 6-month buildup through FX → Gold → Indices. Skipping the sequence and dropping a new operator into the end-state produces near-certain failure. Worse, it sets up the new operator to attribute the failure to themselves rather than to the missing foundation, which is the canonical "teacher inflicted" calibration trauma.',
      },
      {
        id: 'b',
        text: 'Direct them to Level 1 of the Academy. Decline to teach the current setup. Recommend they follow the full curriculum in order, including the 30-session class cycles, just as you did.',
        correct: true,
        explain:
          'Correct. The mastery-tier response respects the curriculum architecture: each level builds on the prior level\'s discipline, and the per-class cycles are the structural training that makes the end-state work. Skipping ahead is not a kindness — it is a setup for a discipline collapse that will cost the new operator more time and money than just following the sequence in the first place. Master operators refer learners to the curriculum, not to their own current setup.',
      },
      {
        id: 'c',
        text: 'Teach them your discipline framework but let them pick their own asset class to start.',
        correct: false,
        explain:
          'Partial credit but still wrong. Letting them pick their own starting class violates the recommended FX → Gold → Indices → Crypto sequence. Most new operators pick Crypto first because of perceived volatility-equals-opportunity bias. Allowing this skips the patience-asset foundation that the curriculum was designed to build. The full sequence exists for a reason; partial respect for the curriculum is structurally the same as no respect.',
      },
      {
        id: 'd',
        text: 'Refuse to teach at all — trading is too dangerous to encourage anyone into.',
        correct: false,
        explain:
          'Defensible from a risk-aversion standpoint but not the mastery-tier answer. The Academy exists precisely so that disciplined operators can become disciplined traders; refusing to acknowledge that the path exists is overcorrection in the other direction. The correct answer is to redirect to the curriculum, not to refuse engagement entirely.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'You have just had your worst month in CIPHER: -14R cumulative, drawdown circuit triggered twice, journal shows a clear pattern of accumulated micro-overrides culminating in a string of impulse trades. You are demoralised and angry at the framework. A part of you wants to quit CIPHER and switch to a different system.',
    prompt: 'What does mastery-tier discipline say?',
    options: [
      {
        id: 'a',
        text: 'Quit CIPHER and look for a better system. If the framework produced this result, the framework is the problem.',
        correct: false,
        explain:
          'This is the post-losing-quarter system-switching failure. The framework did not produce the -14R — your accumulated overrides did. Switching to a different system at this moment perpetuates the pattern: every system fails when applied without discipline. The disciplined operator who switches to System B will replicate the same accumulated-override pattern within 60 sessions, blame System B, switch again. The bug is not in the system; it is in the relationship with the system.',
      },
      {
        id: 'b',
        text: 'Take the 30-day CIPHER break described in L11.27. No charts, no journal, no trades. Return after 30 days with the audit complete and a written commitment to the rules.',
        correct: true,
        explain:
          'Correct. The 30-day reset is the mastery-tier response to identity-corrupting drawdown. The break removes the trigger-reaction loop, restores the operator\'s relationship with the framework, and gives space for an honest audit without the emotional pressure of active trading. Operators who take the 30-day break recover; operators who try to "trade their way out" deepen the cycle.',
      },
      {
        id: 'c',
        text: 'Tighten everything: cut position size in half, run only the highest-conviction setups, journal every breath.',
        correct: false,
        explain:
          'This is the over-rigidity failure described in S04. After a losing quarter, the temptation is to swing from too-loose to too-tight as compensation. The over-tight response produces paralysis, missed legitimate signals, and emotional volatility that triggers the next override cycle. The disciplined response is the reset, not the compensation.',
      },
      {
        id: 'd',
        text: 'Move to a smaller account and "earn back" the right to trade your full size.',
        correct: false,
        explain:
          'This frames the drawdown as a punishment requiring earning-back, which structurally reinforces the identity-shame loop. Drawdowns are framework data, not punishment. The disciplined response addresses the cause (override pattern) rather than imposing a sub-account penance. Move-down-then-earn-back patterns produce a recovery arc tied to ego rather than to discipline restoration.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You have completed Level 11. You have your Cipher Operator cert. You are running the framework with discipline. After 12 months, you find yourself drifting — not in dramatic ways, but in small ones: occasional preset switches, occasional news-window flex, the journal becomes spottier. The drift is recoverable but unmistakable.',
    prompt: 'What does annual self-calibration say?',
    options: [
      {
        id: 'a',
        text: 'Ignore it — small drift is normal, you are still profitable.',
        correct: false,
        explain:
          'This is the canonical "still profitable so still disciplined" rationalisation. Profitability and discipline can decouple for 6-12 months before the discipline gap shows up in P&L. By the time profitability deteriorates, the drift has compounded to the point where recovery is harder. Annual calibration exists precisely to catch the drift before it cashes out in P&L.',
      },
      {
        id: 'b',
        text: 'Run the formal annual self-calibration audit: re-read Level 11 from L11.1 to L11.27. Re-take the certificates that gate behaviours showing drift. Re-commit to the rules in writing.',
        correct: true,
        explain:
          'Correct. The annual self-calibration protocol exists because drift is the default state, not an accident. A re-read of the Level 11 curriculum, a re-take of the cert quizzes for the disciplines showing drift, and a written re-commitment to the rules is the mastery-tier response to small accumulated drift. The protocol is not optional; it is the maintenance that keeps the framework in operating condition.',
      },
      {
        id: 'c',
        text: 'Make small written notes about what you have been doing differently and continue.',
        correct: false,
        explain:
          'Half-credit answer. Written notes are good, but they are observation without correction. The drift will continue without an active recalibration step. The mastery-tier response includes the curriculum re-read and the cert re-take precisely because passive observation does not reverse accumulated drift — it only documents it.',
      },
      {
        id: 'd',
        text: 'Switch back to following the rules exactly. No need to re-read the curriculum.',
        correct: false,
        explain:
          'This is the willpower-based recovery attempt. "I will just follow the rules" works for about 5-15 sessions before the same drift reasserts itself, because the drift is structural (relationship with the framework) not behavioural (specific rule violations). The curriculum re-read is structural maintenance; willpower-based recovery is symptomatic and short-lived.',
      },
    ],
  },
];

// ============================================================
// QUIZ DATA (13 questions, 4 options each, one correct each)
// Covers: GC (operator-is-risk), three compounding curves, identity
// trap, post-winning/losing cycles, micro-override compounding,
// accumulated authority, 90-session multi-class audit, annual
// calibration, replacement operator test, 30-day reset, mastery
// as practice, curriculum cohesion.
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'The Groundbreaking Concept of this lesson is "After All The Rules, The Operator Is The Risk." What does that mean operationally?',
    options: [
      { id: 'a', text: 'The operator is the only risk in trading; the framework is irrelevant.', correct: false },
      { id: 'b', text: 'After every other risk layer has been addressed (engine, calibration, asset class, news, drawdown), the remaining risk is the operator\'s identity, accumulated confidence, and pattern of self-reward and self-punishment over time.', correct: true },
      { id: 'c', text: 'CIPHER is a personal style; you are the source of the edge.', correct: false },
      { id: 'd', text: 'The framework should be modified to match your operator psychology.', correct: false },
    ],
    explain:
      'The six risk layers (engine, calibration, asset class, news, drawdown, operator) are addressed across L11.1 through L11.26. The first five are structural and have mechanical defences. The sixth — the operator themselves — is the residual risk that remains after all the structural defences are in place. Identity creep, accumulated confidence, post-winning/losing cycles, micro-override compounding: these are the mastery-tier failure modes that only emerge over multi-quarter horizons and only in operators who have already mastered the structural layers.',
  },
  {
    id: 'q2',
    question: 'The lesson describes three "compounding curves" that operate simultaneously over a long horizon. Which set of three is correct?',
    options: [
      { id: 'a', text: 'Profit, drawdown, and recovery.', correct: false },
      { id: 'b', text: 'Skill (rising), drift (rising), and audit cadence (sawtooth corrections).', correct: true },
      { id: 'c', text: 'Win rate, expectancy, and Sharpe ratio.', correct: false },
      { id: 'd', text: 'Account size, position size, and risk-per-trade.', correct: false },
    ],
    explain:
      'The three compounding curves: (1) Skill compounds positively over time as the operator internalises more patterns, builds journal data, and refines per-class calibration. (2) Drift compounds negatively over time as small overrides become normalised, the relationship with the framework shifts from "rules to follow" to "rules to interpret," and identity creep accumulates. (3) Audit cadence is the sawtooth corrective signal that resets accumulated drift through structured review at 30-session, quarterly, and annual frequencies. All three compound simultaneously; the relative magnitudes determine whether the operator is improving or deteriorating.',
  },
  {
    id: 'q3',
    question: 'What is the "operator identity trap" and why is it dangerous?',
    options: [
      { id: 'a', text: 'The trap of using too many indicators; CIPHER is enough.', correct: false },
      { id: 'b', text: 'The moment the operator articulates "my edge" or "my style" to themselves or others. This reframes the framework as personal, which structurally invites override behaviour over time.', correct: true },
      { id: 'c', text: 'The trap of trading too small.', correct: false },
      { id: 'd', text: 'The trap of journaling too rigorously.', correct: false },
    ],
    explain:
      'The identity trap is articulation-based. The framework gives the operator the edge; describing the edge as "mine" or "my style" subtly reframes the framework as one of several sources rather than the source. Once the framework is one source, it becomes optional. Once it is optional, override behaviour becomes legitimate ("my style sometimes overrules the engine"). The trap is dangerous because it is invisible — the operator believes they are still running the framework while their relationship with it has fundamentally shifted.',
  },
  {
    id: 'q4',
    question: 'The "post-winning-quarter cycle" describes a 4-stage decay pattern. What are the four stages in order?',
    options: [
      { id: 'a', text: 'Euphoria, loosening, reckoning, reset.', correct: true },
      { id: 'b', text: 'Confidence, success, fame, retirement.', correct: false },
      { id: 'c', text: 'Profit, scaling, drawdown, recovery.', correct: false },
      { id: 'd', text: 'Win, hold, exit, repeat.', correct: false },
    ],
    explain:
      'The 4-stage cycle: (1) Euphoria — winning quarter produces confidence that operator misattributes to personal skill rather than to framework execution. (2) Loosening — small overrides begin appearing, framework adherence drops from 100% to ~92-94%. (3) Reckoning — a losing month or week exposes the accumulated drift; P&L collapses faster than the original quarter built. (4) Reset — operator either takes the 30-day break and recovers, or attempts to "trade out of it" and deepens the cycle. The cycle is statistically observable across operator populations; the only operator-side defence is recognising the cycle early enough to interrupt it at stage 2.',
  },
  {
    id: 'q5',
    question: 'The "post-losing-quarter cycle" is the mirror of the post-winning cycle. What is its characteristic failure pattern?',
    options: [
      { id: 'a', text: 'Quitting CIPHER and switching to a different system, blaming the framework for the loss.', correct: false },
      { id: 'b', text: 'Over-rigidity: swinging from too-loose to too-tight as compensation, which produces paralysis and missed legitimate signals.', correct: false },
      { id: 'c', text: 'Either system-switching, over-rigidity, or paralysis — three failure paths from a single post-losing-quarter trigger, each compounding the original drawdown.', correct: true },
      { id: 'd', text: 'Doubling position size to recover the loss faster.', correct: false },
    ],
    explain:
      'The post-losing-quarter cycle has three failure paths, not one: system-switching (blaming the framework, replacing it with another), over-rigidity (compensating by tightening every rule, producing paralysis), and paralysis (becoming unable to engage even on textbook signals). All three deepen the original drawdown. The disciplined response is the 30-day CIPHER break: no charts, no journal, no trades, then return with the audit complete and a written re-commitment to the rules. The break breaks the trigger-reaction loop that all three failure paths share.',
  },
  {
    id: 'q6',
    question: 'What is "micro-override compounding" and what is its characteristic timeline?',
    options: [
      { id: 'a', text: 'A single large override that destroys an account in one trade.', correct: false },
      { id: 'b', text: 'Many small overrides accumulating over months. Typical curve: 2% override rate in quarter 1, 5-8% in quarter 2, 12-18% in quarter 3, 30%+ by year-end if uncorrected.', correct: true },
      { id: 'c', text: 'Overriding the engine more frequently than your peers.', correct: false },
      { id: 'd', text: 'A specific Pine Script bug that affects override detection.', correct: false },
    ],
    explain:
      'Micro-override compounding is the silent killer of disciplined operators. Each individual override seems small ("just this one news-window flex," "just this one mode switch") but the cumulative pattern compounds geometrically because each tolerated override raises the threshold for the next one. The canonical curve: 2% → 5-8% → 12-18% → 30%+ over four quarters. The defence is the 30-session per-class audit, which surfaces the cumulative count before it crosses into structural drift. Catch the curve at 5%; do not wait for 18%.',
  },
  {
    id: 'q7',
    question: 'What is the "accumulated authority" failure?',
    options: [
      { id: 'a', text: 'Becoming a financial advisor without a licence.', correct: false },
      { id: 'b', text: 'The operator earns the right to bend rules through accumulated success. "I have been disciplined for 6 months; I have earned the right to take this trade outside protocol." This is the linguistic signature of mastery-tier failure.', correct: true },
      { id: 'c', text: 'Refusing to teach other operators.', correct: false },
      { id: 'd', text: 'Becoming too senior in a trading firm.', correct: false },
    ],
    explain:
      'Accumulated authority is the rationalisation pattern where past adherence becomes future override license. The internal language is recognisable: "I have earned the right to...", "given my track record...", "I have proven I can...". Every instance is a discipline-collapse warning. The mastery-tier response is to recognise that accumulated adherence is the data that justifies continued adherence, not the data that justifies breaking pattern. The framework owes the operator nothing; past wins do not produce future override credit.',
  },
  {
    id: 'q8',
    question: 'The "90-session multi-class audit" is the centerpiece protocol of this lesson. What does it measure?',
    options: [
      { id: 'a', text: 'Total P&L across all classes aggregated.', correct: false },
      { id: 'b', text: 'For each active asset class separately: cumulative P&L, win rate, pattern attribution, skip quality, preset fit, override count, and class-specific failure pattern counts. Three separate audits, three separate next-cycle plans. Never aggregated.', correct: true },
      { id: 'c', text: 'A 90-day moving average of returns.', correct: false },
      { id: 'd', text: 'The number of certificates earned.', correct: false },
    ],
    explain:
      'The 90-session multi-class audit runs the per-class audit from L11.26 separately for each active class. Three classes means three audits, three next-cycle plans, three honest reads of edge attribution. The aggregate is never the actionable number; the per-class breakdown is. Operators who aggregate across classes hide the signal that one class is destroying value while another carries the book. The audit is the protocol that prevents the comfortable-aggregate distortion from becoming a structural blind spot.',
  },
  {
    id: 'q9',
    question: 'The "annual self-calibration protocol" is the maintenance cadence at scale. What does it consist of?',
    options: [
      { id: 'a', text: 'A one-page reflection at year-end.', correct: false },
      { id: 'b', text: 'A complete re-read of the Level 11 curriculum (L11.1 through L11.27), re-take of any certificates gating behaviours that show drift, and a written re-commitment to the locked rules. Conducted annually, ideally during a market-closed period.', correct: true },
      { id: 'c', text: 'A meeting with a coach.', correct: false },
      { id: 'd', text: 'Switching to a new preset.', correct: false },
    ],
    explain:
      'The annual self-calibration is structural maintenance, not motivation. The curriculum re-read refreshes pattern recognition for failure modes that have not occurred recently and are therefore fading from awareness. The cert re-take produces measurable data on which disciplines have drifted. The written re-commitment converts vague intention into explicit contract. The protocol takes 10-15 hours of focused time once a year — small relative to the trading hours it protects, and the only known structural defence against multi-year identity drift.',
  },
  {
    id: 'q10',
    question: 'What is the "replacement operator test"?',
    options: [
      { id: 'a', text: 'A simulator that replays your trades.', correct: false },
      { id: 'b', text: 'A thought experiment: if a stranger took over your account today using only your journal, your preset, and your watchlist, would they be able to execute your protocol without confusion? If not, the protocol has drifted into implicit personal judgment.', correct: true },
      { id: 'c', text: 'A requirement to hire a backup trader.', correct: false },
      { id: 'd', text: 'The act of demonstrating CIPHER to someone else.', correct: false },
    ],
    explain:
      'The replacement operator test surfaces implicit drift. If a stranger could pick up your account and execute identically using only your journal, your saved preset, and your watchlist, your protocol is explicit and replicable — a sign of clean discipline. If the stranger would be confused, you have been making implicit personal-judgment decisions that you have not codified. Those implicit decisions are where drift hides. Master operators run the replacement test quarterly and codify whatever they could not articulate.',
  },
  {
    id: 'q11',
    question: 'When should an operator take the "30-day CIPHER break"?',
    options: [
      { id: 'a', text: 'After every losing trade.', correct: false },
      { id: 'b', text: 'When the drawdown is identity-corrupting: the operator is no longer reasoning about CIPHER as a framework but is emotionally entangled with it (rage, shame, system-switching impulses, paralysis). The break removes the trigger-reaction loop and allows audit space.', correct: true },
      { id: 'c', text: 'Once a year regardless of state.', correct: false },
      { id: 'd', text: 'Only after blowing up an account.', correct: false },
    ],
    explain:
      'The 30-day break is the response to identity-corrupting drawdown. Not after a losing trade (which is part of normal operations) and not on a fixed schedule (which produces resentment), but specifically when the operator can no longer reason about CIPHER as an external framework. The diagnostic signs: rage at the framework, shame about results, system-switching impulses, or trading paralysis. During the break: no charts, no journal, no trades. After the break: return with audit complete and written re-commitment.',
  },
  {
    id: 'q12',
    question: 'What does "mastery as practice" mean in the context of L11.27?',
    options: [
      { id: 'a', text: 'You should practise CIPHER every day until you reach mastery.', correct: false },
      { id: 'b', text: 'The Cipher Operator cert is a starting line, not a finish line. Mastery is the ongoing maintenance of the disciplines — the annual calibration, the quarterly audits, the daily journaling. The cert says the operator has internalised the framework; it does not say the operator is finished.', correct: true },
      { id: 'c', text: 'Practice makes perfect.', correct: false },
      { id: 'd', text: 'Trade more to become a master.', correct: false },
    ],
    explain:
      'Mastery as practice reframes the Cipher Operator cert from achievement to commitment. The framework remains active only as long as the disciplines remain active. An operator who earned the cert 18 months ago and has not run an annual self-calibration since is no longer a Cipher Operator in any operational sense — they have the credential but not the practice. The lesson\'s closing point: the cert is the starting line for the rest of the trading career, not a graduation that ends the discipline cycle.',
  },
  {
    id: 'q13',
    question: 'Now that you have completed Level 11, what is the recommended forward plan for the next 90 sessions?',
    options: [
      { id: 'a', text: 'Trade as much as possible to leverage what you have learned.', correct: false },
      { id: 'b', text: 'Run a complete 90-session cycle on your strongest asset class with the Cipher Operator framework fully active: 30-session audits, journal coverage 100%, annual self-calibration scheduled at session 90, replacement operator test at session 30 and 60. Do not add a second class until session 90 audit confirms 27/30 adherence on the first class.', correct: true },
      { id: 'c', text: 'Start teaching other operators.', correct: false },
      { id: 'd', text: 'Apply for a prop firm.', correct: false },
    ],
    explain:
      'The forward plan is the practice protocol. 90 sessions on a single asset class with all Level 11 disciplines fully active is the calibration block that proves the framework holds at scale for you specifically. The 30-session, 60-session, and 90-session checkpoints surface drift before it compounds. Adding a second class, teaching, or scaling up come AFTER the 90-session block confirms the framework is operationally stable. Operators who skip the 90-session post-cert block are the ones who blow up in months 3-6 after earning the cert.',
  },
];

// ============================================================
// MAIN LESSON COMPONENT
// ============================================================

export default function CipherOperator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(
    Array(gameRounds.length).fill(null)
  );
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const quizCorrect = quizAnswers.filter((a, i) =>
    a !== null && quizQuestions[i].options.find(o => o.id === a)?.correct
  ).length;
  const quizPercent = Math.round((quizCorrect / quizQuestions.length) * 100);
  const quizPassed = quizSubmitted && quizPercent >= 66;
  const certRevealed = quizPassed;

  const certIdRef = useRef<string | null>(null);
  if (!certIdRef.current) {
    certIdRef.current = `PRO-CERT-L11.27-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  const certId = certIdRef.current;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setScrollProgress(total > 0 ? (current / total) * 100 : 0);
    };
    window.addEventListener('scroll', handler);
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti fire={certRevealed} />

      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/[0.04] z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-accent-500 to-amber-500"
          style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
        />
      </div>

      <nav className="fixed top-1 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/academy" className="text-xs text-gray-400 hover:text-white transition-colors">&larr; Academy</Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-accent-500/20 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold tracking-widest text-amber-400">PRO &middot; LEVEL 11 &middot; FINAL</span>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,179,0,0.10) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(38,166,154,0.08) 0%, transparent 70%)' }} />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-6">Level 11 &middot; Lesson 27 &middot; Final Capstone</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Cipher Operator
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-4">
            After All The Rules, The Operator Is The Risk.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
            Twenty-six lessons addressed every structural risk: the engine, the calibration, the asset class, the news, the drawdown. One risk remains. It is the operator&apos;s identity, their accumulated confidence, their pattern of self-reward and self-punishment over time. This lesson is the final calibration &mdash; the maintenance protocol for the trader who has internalised the framework and now needs to keep it operational for years, not months.
          </p>
        </motion.div>
      </section>

      {/* === S00 — Groundbreaking Concept === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Groundbreaking Concept</p>
          <h2 className="text-3xl font-extrabold mb-6">The Operator Is The Risk.</h2>

          <p className="text-gray-400 leading-relaxed mb-4">An operator completes Level 11 with 100% adherence. They earn their Cipher Operator cert. They run the framework cleanly for the next 90 sessions. Their account grows. Their journal is meticulous. Their per-class audits are honest. <strong className="text-white">They are operationally indistinguishable from any other disciplined Cipher Operator.</strong></p>

          <p className="text-gray-400 leading-relaxed mb-4">Then they have a winning quarter. +42R cumulative. Best results since they started. Friends ask them how they did it. They start articulating their approach &mdash; carefully, even modestly &mdash; as &quot;my edge.&quot; Within 90 days, override rate climbs from 1% to 6%. Within 180 days, override rate is 14%. Within a year, the same operator is running a discretionary trading style that bears only superficial resemblance to CIPHER, and the framework gets blamed when the drawdown comes.</p>

          <p className="text-gray-400 leading-relaxed mb-6">The framework did not change. The engine did not break. The asset class did not become harder. <strong className="text-amber-400">What changed was the operator&apos;s relationship with the framework.</strong> The structural defences in lessons 1-26 do not protect against this failure because this failure does not have a structural source. It has an identity source &mdash; and identity drifts in directions no rule can preempt.</p>

          <OperatorIsRiskAnim />

          <div className="p-6 rounded-2xl glass-card mt-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">SIX RISK LAYERS, FIVE STRUCTURAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Across Level 11, the operator addressed five structural risk layers. <strong className="text-white">Engine risk:</strong> L11.1-L11.4 (Operator Contract, Command Center anatomy, Inputs Anatomy) gave you literacy with what CIPHER actually does and how to read it. <strong className="text-white">Calibration risk:</strong> L11.5-L11.7 (Regime Engine, Transitions, Executive Summary) showed how CIPHER auto-routes per market state. <strong className="text-white">Asset-class risk:</strong> L11.26 mapped per-asset characters and their distinct calibrations. <strong className="text-white">News risk:</strong> L11.25 locked the 60-minute envelope discipline. <strong className="text-white">Drawdown risk:</strong> L11.22-L11.25 built the conviction, override doctrine, and circuit-breaker systems.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE SIXTH RISK</p>
              <p className="text-sm text-gray-400 leading-relaxed">The sixth layer &mdash; the operator themselves &mdash; is what remains after the five structural layers have been addressed. It is not a rule, it is not a calibration, it is not a discipline at the same level as the others. <strong className="text-white">It is the operator&apos;s relationship with all of the prior disciplines over time.</strong> This relationship drifts. It compounds. It reshapes itself through accumulated wins and losses. And it does so quietly, in ways that cannot be detected without specific protocols designed to surface drift.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THIS LESSON DOES</p>
              <p className="text-sm text-gray-400 leading-relaxed">L11.27 is the maintenance protocol for the sixth layer. It introduces the <strong className="text-white">three compounding curves</strong> (skill, drift, audit cadence) that operate over multi-quarter horizons. It catalogues the <strong className="text-white">identity-tier failure modes</strong> (post-winning cycle, post-losing cycle, micro-override compounding, accumulated authority, pattern confidence trap) that destroy operators who have already mastered the structural layers. It introduces the <strong className="text-white">90-session multi-class audit</strong>, the <strong className="text-white">annual self-calibration</strong>, the <strong className="text-white">replacement operator test</strong>, and the <strong className="text-white">30-day CIPHER break</strong> &mdash; four protocols that maintain the framework at scale. It closes by reframing the Cipher Operator cert as a starting line, not a finish line.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LESSON PROMISE</p>
              <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">three compounding curves</strong> that operate on every operator over time and how to bias the result positive; the <strong className="text-white">identity-tier failure modes</strong> that emerge specifically at mastery level; the <strong className="text-white">multi-quarter audit cadence</strong> that catches drift before it compounds; the <strong className="text-white">specific defensive protocols</strong> (replacement test, 30-day break, annual calibration) that maintain the framework indefinitely; and the <strong className="text-white">reframing of mastery</strong> from achievement to ongoing practice. You finish Level 11 as a Cipher Operator &mdash; not because you completed 27 lessons, but because you have committed to the practice that the cert formalises.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Three Compounding Curves === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Three Compounding Curves</p>
          <h2 className="text-2xl font-extrabold mb-4">Skill Compounds. So Does Drift.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every disciplined operator runs three curves simultaneously over a multi-year horizon. <strong className="text-amber-400">Two of them compound automatically; the third is the only one the operator actively controls.</strong> The relative magnitudes over time determine whether the operator improves or deteriorates &mdash; not their P&amp;L, not their conviction-score reads, not their journal aesthetics. Just the three curves.</p>
          <ThreeCompoundingCurvesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three curves develop over 365 days. Skill rises slowly &mdash; logarithmically &mdash; because each new pattern internalised takes longer to acquire than the prior one. Drift rises exponentially &mdash; because each tolerated override raises the threshold for the next. <strong className="text-white">Audit cadence is the sawtooth that resets accumulated drift in discrete steps.</strong> The 30-day, 90-day, 180-day, 270-day, and annual marks are the structural correction points.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-2">CURVE 1 &middot; SKILL (LOGARITHMIC RISE)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pattern recognition for Command Center reads improves with exposure. Per-class calibration deepens with sessions traded on that class. Journal-data-driven insight compounds over multi-cycle horizons. <strong className="text-white">Skill rises but slows down.</strong> The first 30 sessions on FX teach more than the next 30 sessions on FX. The next 30 sessions on Gold teach more than the prior 30 on FX. Logarithmic, not linear &mdash; which means returns diminish but they do not reverse.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>CURVE 2 &middot; DRIFT (EXPONENTIAL RISE)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each tolerated override raises the threshold for the next. The 1st override against a structural rule is hard; the 10th is easy; the 100th is invisible. <strong className="text-white">Drift rises exponentially because behavioural normalisation is multiplicative, not additive.</strong> An operator who accepts a 5% override rate is one psychological micro-step from 8%, two from 12%, four from 20%. The drift curve accelerates exactly as it becomes harder to detect.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CURVE 3 &middot; AUDIT CADENCE (SAWTOOTH CORRECTION)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 30-session audit catches small drift before it compounds. The 90-session multi-class audit catches per-class drift before it crosses cycle boundaries. The annual self-calibration catches identity drift before it crosses operational-character boundaries. <strong className="text-white">Audit cadence is the only structural correction that operators control.</strong> Without it, drift wins. With it, skill plus audit-corrections exceed drift.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LIFETIME EQUATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Over a 5-year operating window, the operator with high skill + high audit cadence outperforms the operator with high skill + low audit cadence by a multiple. The difference is not measured in single-trade outcomes; it is measured in <strong className="text-white">whether the operator is still operating at year 5 at all.</strong> Drift, left unaudited, kills operators. Audit cadence is what keeps them operating.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Operator Identity Trap === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Operator Identity Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">The Moment You Say &quot;My Edge,&quot; The Edge Begins To Die.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The most subtle failure mode in this lesson is the cleanest. <strong className="text-amber-400">It does not happen during trading. It happens during conversation.</strong> A friend asks how you have been doing. A peer wants advice. A new operator asks you to explain your approach. The trap is articulation &mdash; the moment the operator describes the framework as &quot;mine&quot; or &quot;my style&quot; or &quot;my edge,&quot; the framework starts shifting from external system to internal possession.</p>
          <IdentityTrapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bubble form. The phrase &quot;MY EDGE&quot; appears, grows, settles. Within the bubble, two side effects: <em>&quot;The framework is now optional&quot;</em> and <em>&quot;Overrides become judgment calls.&quot;</em> The bubble cracks. The framework was the edge. The edge was never yours to articulate. <strong className="text-white">The contagion is articulation itself, not the words.</strong> Even modest articulations (&quot;I just try to follow the system&quot;) carry the same drift if the framing is &quot;I do something specific.&quot;</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY ARTICULATION IS CONTAGION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Articulation is the act of describing a process from inside it. When you describe your trading approach as &quot;my edge,&quot; you implicitly position yourself as the source of the edge. Once you are the source, the framework becomes a tool you can use, modify, or skip. <strong className="text-white">Tools are optional; sources are not.</strong> The disciplined operator is not the source of the edge &mdash; the framework is, and the operator is the executor. The framing matters more than the words.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE DISCIPLINED RESPONSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When asked how you trade: <strong className="text-white">&quot;I run the CIPHER framework with discipline.&quot;</strong> Not &quot;my approach is...&quot;, not &quot;my edge is...&quot;, not &quot;I look for...&quot;. The framing keeps the framework external. Repeat questions get the same answer. If pressed, you can describe specific lessons (&quot;The 30-session per-class audit catches drift&quot;) but you cannot articulate &quot;your edge&quot; because there is none &mdash; only the framework you execute.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE STRANGER TEST</p>
              <p className="text-sm text-gray-400 leading-relaxed">A test for whether you have fallen into articulation: <strong className="text-white">if a stranger took over your account today, using only your journal and your preset, would they execute identically to you?</strong> If yes, your protocol is explicit and replicable &mdash; the framework is intact. If no, you have been making implicit personal-judgment decisions you cannot codify, which means articulation has already happened internally even if you have not spoken it aloud. The stranger test surfaces invisible drift.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Post-Winning-Quarter Cycle ★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Post-Winning-Quarter Cycle &middot; &#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Stages. Statistically Repeatable.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The post-winning-quarter cycle is the most statistically repeatable failure pattern in this lesson. <strong className="text-amber-400">It runs through four stages in roughly 75 days, almost always in the same order, almost always with the same psychological signatures.</strong> Recognising the cycle while it is happening &mdash; specifically during Stage 2 &mdash; is the only mechanical defence. By the time Stage 3 arrives, the damage is structural and the only response is the 30-day break.</p>
          <PostWinningQuarterCycle />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four-stage wheel rotate. Each stage activates in turn, the center adherence display drops from 100% to 92% to 73% before resetting in Stage 4. The side panel surfaces the behavioural signs of each stage. <strong className="text-white">The signs are recognisable in retrospect; the lesson is recognising them in real time.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-2">STAGE 1 &middot; EUPHORIA (Days 0-15)</p>
              <p className="text-sm text-gray-400 leading-relaxed">A great quarter just landed. +30R, +50R, +80R &mdash; the absolute number does not matter. What matters is that the operator misattributes the results to personal skill rather than to framework execution. The internal voice shifts subtly from <em>&quot;I executed the framework cleanly&quot;</em> to <em>&quot;I figured it out.&quot;</em> Friends ask how. The operator articulates &mdash; modestly, carefully &mdash; the &quot;edge.&quot; <strong className="text-white">Adherence remains at 100%, but the relationship has changed.</strong> The failure has begun; the P&amp;L has not yet noticed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">STAGE 2 &middot; LOOSENING (Days 15-45)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Small overrides begin appearing. A news-window flex here, a mode switch there, a position-size adjustment that &quot;feels right.&quot; Each individual override is defensible in isolation; the cumulative pattern is unmistakable to anyone reading the journal from outside. Override rate climbs from baseline 1-2% to 4-7%. <strong className="text-white">Adherence drops from 100% to 92-94%.</strong> Performance may still look fine because the underlying market is still cooperating. This is the only stage where the cycle can be intercepted.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>STAGE 3 &middot; RECKONING (Days 45-75)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The underlying market shifts. Conditions change. The accumulated overrides &mdash; which worked in the prior regime &mdash; now produce losses faster than the original winning quarter built wins. Drawdown compounds. Adherence collapses to 73-80%. <strong className="text-white">The operator now has two narratives competing: &quot;the framework stopped working&quot; or &quot;I drifted from the framework.&quot;</strong> Stage 3 ends one of two ways depending on which narrative wins.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-2">STAGE 4 &middot; RESET (Day 75+)</p>
              <p className="text-sm text-gray-400 leading-relaxed">If the operator chooses the &quot;I drifted&quot; narrative, the response is the 30-day break (S11), the curriculum re-read, the cert re-take, the written re-commitment. Adherence returns to 100% by day 105-120, and the cycle is closed. <strong className="text-white">If the operator chooses the &quot;framework failed&quot; narrative, Stage 3 deepens into Stage 1 of the post-losing-quarter cycle (S04).</strong> The two cycles compound; recovery becomes harder; the 30-day break is delayed until the drawdown forces it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE INTERCEPTION POINT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cycle can only be intercepted at Stage 2. By Stage 3 it has gone structural; the override pattern is normalised and the drawdown is already committed. <strong className="text-white">The 30-session audit is the structural defence against Stage 2 accumulation.</strong> If the audit at session 30 post-winning-quarter shows override rate climbing past 3%, intervene immediately: reset behaviour, re-read the override doctrine (L11.25 Section 10), write the re-commitment. Do not wait for Stage 3.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The Post-Losing-Quarter Cycle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Post-Losing-Quarter Cycle</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Trigger. Three Failure Paths.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The post-losing-quarter cycle is the mirror of S03 but more complex. Where the post-winning cycle has one failure path (loosening into reckoning), the post-losing cycle branches into three: system-switching, over-rigidity, and paralysis. <strong className="text-amber-400">All three paths deepen the original drawdown.</strong> The disciplined response &mdash; the only path that resets cleanly &mdash; is the 30-day CIPHER break.</p>
          <PostLosingQuarterCycle />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the flowchart. The trigger is DEFEAT &mdash; a losing quarter, a drawdown that crosses the operator&apos;s emotional tolerance. From DEFEAT the cycle branches into three failure paths or one reset. Each failure path has its own characteristic signs and its own way of compounding the original loss. <strong className="text-white">The 30-day break is the only path that interrupts the cycle structurally; the three failure paths each look like &quot;trying harder&quot; but functionally deepen the entanglement.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>PATH A &middot; SYSTEM-SWITCHING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The operator concludes the framework is the problem. They quit CIPHER and look for a different system. The new system gets the same treatment (clean adherence for 30-60 sessions) before the operator&apos;s underlying override pattern reasserts itself on the new system. <strong className="text-white">The framework changed; the operator did not.</strong> System-switching is the most expensive failure path because it adds a 60-session calibration loss to the original drawdown.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>PATH B &middot; OVER-RIGIDITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The operator concludes they were too loose and overcompensates. Position size cuts in half. Only the highest-conviction setups taken. Journal every breath. The over-tight stance produces paralysis on legitimate signals, emotional volatility from missed opportunities, and ultimately a swing back to the looseness that triggered the loss in the first place. <strong className="text-white">Over-rigidity is the symptomatic response to a structural problem.</strong> The drift was not in tightness; it was in the operator&apos;s relationship with the rules. Tightening the rules does not fix that.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>PATH C &middot; PARALYSIS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The operator becomes unable to engage. Every signal looks like a trap. Every 4/4 conviction feels like the last one that ended in a stop. The framework appears intact &mdash; no overrides, no system-switching &mdash; but operationally the operator has stopped trading. Account inactivity is the symptom; trauma is the cause. <strong className="text-white">Paralysis often goes unnamed because it does not produce losses, only stagnation.</strong> The operator may rationalise as &quot;being patient&quot; or &quot;waiting for the right setup&quot; for weeks. The defence is the same as the other paths: the 30-day break, with explicit return-date.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-2">THE RESET PATH</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 30-day CIPHER break is the only path that returns the operator to operational baseline. <strong className="text-white">No charts, no journal, no trades for 30 days.</strong> Followed by the audit: what did the journal data show? What pattern of overrides preceded the drawdown? What structural defences were the overrides bypassing? Followed by the curriculum re-read of the relevant lessons (L11.25 if discipline drift, L11.26 if class drift). Followed by the written re-commitment to the rules with explicit date. Day 31 is the return.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">RECOGNISING THE TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cycle activates not from a single trade but from accumulated drawdown crossing the operator&apos;s emotional threshold. Signs that you are in DEFEAT, not just a normal losing session: <strong className="text-white">rage at the framework</strong>, <strong className="text-white">shame about the results</strong>, <strong className="text-white">impulse to switch systems</strong>, <strong className="text-white">paralysis when sitting at the charts</strong>. If any of these are present, the cycle has activated. Skip the three failure paths; take the 30-day break.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05 — The Micro-Override Compounding === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Micro-Override Compounding</p>
          <h2 className="text-2xl font-extrabold mb-4">2% &rarr; 5% &rarr; 12% &rarr; 30% Over A Year.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A 2% override rate sounds harmless. The math says otherwise. <strong className="text-amber-400">Each tolerated override raises the threshold for the next one by a fixed psychological increment, which means the override curve compounds geometrically rather than arithmetically.</strong> An operator at 2% override in Q1 reaches 30%+ override by Q4 if uncorrected. The curve looks flat at the start and exponential by the end &mdash; the same shape as compound interest.</p>
          <MicroOverrideCompoundingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar chart. Q1 sits at 2% &mdash; below baseline tolerance. Q2 reaches 5% and crosses the warning threshold. Q3 hits 12% and structural drift is now operational. Q4 reaches 30% and the framework has been replaced by ad-hoc judgment. <strong className="text-white">The catch-up cost between quarters grows; the catch-up window between quarters shrinks.</strong> Q1-to-Q2 might take a single audit to correct; Q3-to-Q4 takes a 30-day break plus a curriculum re-read.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY THE CURVE COMPOUNDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Behavioural normalisation is multiplicative. The 10th override against a rule is psychologically much smaller than the 1st override &mdash; not because the rule changed, but because the operator&apos;s relationship with the rule has shifted to accommodate the prior nine. <strong className="text-white">Each tolerated override raises the threshold for the next one by a fixed psychological increment.</strong> Over time, the increments compound. The mathematical signature is geometric: 2% &rarr; 5% &rarr; 12% &rarr; 30%, doubling every quarter. The behavioural signature is invisibility: the operator does not feel the drift because the drift is the baseline they are now measuring from.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE TWO THRESHOLDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">5% is the <strong className="text-white">warning threshold</strong>. Override rate at 5% means the next 30-session audit MUST surface and correct the pattern. The correction is mechanical: reset override counter to zero, re-read the relevant lesson, write the re-commitment. <strong className="text-white">15% is the structural drift threshold.</strong> At 15%, the rule has effectively been redefined by behaviour. The correction is no longer the small audit; it is the 30-day break plus full curriculum re-read of L11.25.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE AUDIT PROTOCOL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 30-session per-class audit (from L11.26) must count overrides explicitly. Not aggregate &mdash; count each override against each structural rule. <strong className="text-white">Override-counting forces the operator to confront the cumulative number directly</strong> rather than rationalising each override individually. An operator who has overridden the news envelope 4 times in 30 sessions cannot rationalise it as &quot;just this once&quot; in the audit; they confront the number 4 directly. The number 4 is signal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CATCH THE CURVE EARLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cost of catching the curve at 5% is one audit and one re-commitment, completed within a single afternoon. The cost of catching the curve at 15% is the 30-day break, the curriculum re-read, and 60 sessions of recovery work to rebuild calibration. <strong className="text-white">The cost differential is 100-fold for a one-quarter delay.</strong> The audit cadence is the cheapest insurance available.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06 — The Accumulated-Authority Failure === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Accumulated-Authority Failure</p>
          <h2 className="text-2xl font-extrabold mb-4">&quot;I Have Earned The Right To...&quot;</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Accumulated authority is the rationalisation pattern where past adherence becomes future override license. <strong className="text-amber-400">The internal language is recognisable: &quot;I have earned the right to...&quot;, &quot;Given my track record...&quot;, &quot;I have proven I can...&quot;.</strong> Every instance is a discipline-collapse warning. The mistake the operator is making: treating accumulated adherence as credit to be spent rather than as the data that justifies continued adherence.</p>
          <AccumulatedAuthorityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the balance scale. The left pan holds &quot;EARNED HUMILITY&quot; tokens (small teal cards): &quot;I trust the framework&quot;, &quot;past wins prove the framework works&quot;, &quot;I owe the framework&quot;. The right pan holds &quot;EARNED AUTHORITY&quot; tokens (magenta cards): &quot;I have earned the right to...&quot;, &quot;Given my track record...&quot;, &quot;I have proven I can...&quot;. <strong className="text-white">Both stacks grow over time. The balance only holds if humility grows faster.</strong> When authority outpaces humility, the scale crashes &mdash; meaning the operator has structurally licensed override behaviour and the framework has been operationally optional ever since.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE LINGUISTIC SIGNATURES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator-internal language to watch for:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li>&quot;I have earned the right to...&quot; &mdash; past adherence as override license</li>
                <li>&quot;Given my track record...&quot; &mdash; past results as override license</li>
                <li>&quot;I have proven I can...&quot; &mdash; past skill as override license</li>
                <li>&quot;This trade is different because...&quot; &mdash; current judgment as override license</li>
                <li>&quot;Just this one, since I have been so disciplined...&quot; &mdash; small-favour rationalisation</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3"><strong className="text-white">Every one of these phrases is a discipline-collapse warning.</strong> The fact that they sound reasonable is the failure mode; reasonable-sounding overrides are still overrides, and the framework does not care how reasonable the justification was.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">PAST WINS ARE DATA, NOT CREDIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A clean 100-session run is data showing the framework is operating correctly for you. <strong className="text-white">It is not credit you can spend on a future override.</strong> The framework owes the operator nothing. Past adherence does not produce future override-credit. The data showing &quot;the framework worked when I followed it&quot; should logically reinforce continued following, not justify exception-making.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE STRUCTURAL DEFENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Watch for the linguistic signatures in your own internal monologue. Watch for them in your journal entries. Watch for them in conversations with peers. <strong className="text-white">The moment you hear yourself thinking or saying &quot;I have earned the right to&quot;, stop the action that follows.</strong> Whatever you were about to do &mdash; override, switch, flex, adjust &mdash; do not do it. The linguistic flag IS the structural signal. The defence is recognition, not willpower.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S07 — The Pattern Confidence Trap === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Pattern Confidence Trap</p>
          <h2 className="text-2xl font-extrabold mb-4">Recent Profit Is Not Skill.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The pattern confidence trap is the cognitive bias that turns small-sample randomness into perceived skill. <strong className="text-amber-400">An operator with 30 winning sessions in a row will, on average, perceive a &quot;pattern&quot; in their winning approach that does not actually exist.</strong> The pattern is a 30-bar accident at population scale; the operator interprets it as a 30-session edge at personal scale. The mismatch becomes operational when the operator starts trading the perceived pattern.</p>
          <PatternConfidenceTrapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the graph develop. Past 30 days: clean rising equity curve. The dotted amber overlay appears: <em>&quot;I SEE A PATTERN.&quot;</em> The operator now believes they have identified an exploitable regularity in their own behaviour or in the market. Then the overlay dissolves and the future 30 days appear &mdash; random walk, no pattern, mean-reverting to baseline. <strong className="text-white">The pattern was a 30-bar accident.</strong> The operator&apos;s belief in the pattern, however, is now structural &mdash; and continues operating even when the data has stopped supporting it.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY 30 SESSIONS LOOKS LIKE SKILL</p>
              <p className="text-sm text-gray-400 leading-relaxed">30 sessions is the smallest sample where signal exceeds noise in CIPHER analysis &mdash; the 30-session per-class audit is built on this. But 30 sessions is not large enough to distinguish skill from luck on personal performance. <strong className="text-white">The operator with a 30-session winning run is statistically indistinguishable from an operator running pure dumb luck.</strong> Both look like skill from the inside. Only 90-session and annual-scale data start to distinguish them; even then, the distinction is probabilistic, not deterministic.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE TRAP HAS TWO STEPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Step 1: <strong className="text-white">pattern identification.</strong> The operator looks at their recent trades and identifies what &quot;has been working&quot;. Step 2: <strong className="text-white">pattern exploitation.</strong> The operator biases future trades toward what &quot;has been working,&quot; deviating from the framework&apos;s recommendations. The first step is harmless if the second is avoided. The trap closes when the operator acts on the perceived pattern instead of executing the framework.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE STRUCTURAL DEFENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The defence has two parts. <strong className="text-white">Part 1: do not pattern-match on personal performance.</strong> Pattern matching is what CIPHER does; the operator&apos;s job is to execute the framework, not to second-guess it with personal pattern recognition. <strong className="text-white">Part 2: trust the framework over recent results.</strong> When CIPHER fires a setup that does not match your recent winners, take it anyway. When CIPHER skips a setup that looks like your recent winners, skip it anyway. Recent results are not the framework&apos;s training data; they are noise on top of the framework&apos;s actual edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">SKILL IS MEASURED IN YEARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Skill compounds over multi-year horizons. Recent profit compounds over multi-month horizons. The two operate on different timescales, which means recent profit can deviate substantially from underlying skill in either direction. <strong className="text-white">A skilled operator can have a losing quarter; an unskilled operator can have a winning quarter. Both happen regularly.</strong> The audit cadence (30-session, 90-session, annual) is designed to surface the underlying skill signal from the recent-profit noise &mdash; that is its operational purpose.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === PHASE_2A_INSERT_POINT === */}

      {/* === PHASE_2B_INSERT_POINT === */}

      {/* === S08 — The 90-Session Multi-Class Audit ★★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The 90-Session Multi-Class Audit &middot; &#9733;&#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Audits. Three Plans. Never Aggregated.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The 90-session multi-class audit is the operational spine of mastery-tier discipline. It runs the per-class audit from L11.26 separately for each active class. <strong className="text-amber-400">Three active classes means three audits, three next-cycle plans, three honest reads of edge attribution.</strong> The aggregate is never the actionable number. The per-class breakdown is.</p>
          <NinetySessionMultiClassAudit />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Click each tab above to see the audit for that class. FX shows +22.4R cumulative with edge concentrated in PX continuations &mdash; clean cycle, plan to deepen the edge. Gold shows +14.6R but override rate climbing toward 5% &mdash; cycle is marginal, plan to tighten news-window discipline. Indices shows -3.8R with 11.5% override rate &mdash; weak class, open-window override pattern destroying the edge. <strong className="text-white">Aggregate would show +33.2R and look like success. The per-class breakdown shows one class is actively destroying value.</strong> The audit&apos;s purpose is to surface that signal.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">SIX DIMENSIONS PER CLASS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Cumulative P&amp;L.</strong> 90-session cumulative R for this class only.</li>
                <li><strong className="text-white">Win rate + average R.</strong> Distribution metrics within this class.</li>
                <li><strong className="text-white">Override count + override rate.</strong> The number that matters most for mastery-tier discipline.</li>
                <li><strong className="text-white">Pattern attribution.</strong> Which signal types (PX continuation, TS reversal, Coil breakout) carried this class? Which destroyed value?</li>
                <li><strong className="text-white">Failure mode count.</strong> Class-specific failures (news override for FX/Gold, open-chasing for Indices, weekend FOMO for Crypto) counted explicitly.</li>
                <li><strong className="text-white">Verdict + next-cycle plan.</strong> Honest classification of this class as Strong / Marginal / Weak, with specific behavioural targets for the next 30 sessions.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE VERDICT TAXONOMY</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-teal-400">STRONG CLASS.</strong> Override rate under 2%, positive cumulative, clear edge concentration. Plan: deepen the edge (raise conviction tier requirement on the highest-attributing pattern).</li>
                <li><strong className="text-amber-400">MARGINAL CLASS.</strong> Override rate 2-5%, positive cumulative but trending. Plan: tighten discipline on the class-specific failure mode. If override rate &gt;5% next cycle, take a 30-day break from this class.</li>
                <li><strong style={{ color: '#EF5350' }}>WEAK CLASS.</strong> Override rate over 5%, negative or near-zero cumulative. Plan: structural intervention (curriculum re-read, written re-commitment, or class removal from rotation). Re-audit at session 30.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN TO REMOVE A CLASS FROM ROTATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a class registers WEAK on two consecutive 90-session audits, drop the class from active rotation. <strong className="text-white">Cycle the time and risk budget into your STRONG class instead.</strong> Not every operator is suited to every class; that is fine. Two-class operators with deep per-class skill outperform four-class operators with shallow per-class skill on every meaningful metric. The 90-session audit produces the data to make this decision honestly rather than emotionally.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE BLEND PROHIBITION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The aggregate across classes is the comfortable distortion. <strong className="text-white">Never aggregate. Never average. Never compute portfolio-level P&amp;L until each class has been read on its own.</strong> Three classes means three reads, three plans, three verdicts. Mastery-tier audit discipline lives in the refusal to blend.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Annual Self-Calibration Protocol === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Annual Self-Calibration Protocol</p>
          <h2 className="text-2xl font-extrabold mb-4">Once A Year. Ten Hours. Indispensable.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The annual self-calibration is structural maintenance for the operator&apos;s relationship with the framework. <strong className="text-amber-400">It runs once a year, takes 10-15 hours of focused time, and is the only known structural defence against multi-year identity drift.</strong> Quarterly audits catch behavioural drift. The annual catches identity creep that quarterly cannot detect.</p>
          <AnnualCalibrationProtocolAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the timeline. Quarterly audits fire every 90 days as the structural correction for cycle-level drift. The annual calibration fires at year-end as the deeper correction for multi-cycle accumulated drift. <strong className="text-white">Quarterly is mechanical; annual is structural.</strong> Both are required.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE ANNUAL PROTOCOL &middot; SIX STEPS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">1. Curriculum re-read.</strong> Read Level 11 from L11.1 to L11.27 in order. 27 lessons across approximately 8-12 hours. The re-read refreshes pattern recognition for failure modes that have not occurred recently and are therefore fading from awareness.</li>
                <li><strong className="text-white">2. Cert re-take.</strong> Re-take certificates for any discipline showing drift in the year&apos;s audit data. The re-take produces measurable data on which disciplines have actually drifted vs which have held.</li>
                <li><strong className="text-white">3. Year-end per-class P&amp;L.</strong> Compute cumulative R for each class separately for the full year. Do NOT aggregate. The per-class number is the actionable signal.</li>
                <li><strong className="text-white">4. Edge concentration analysis.</strong> Which class carried the year? Often one class produces 60-80% of cumulative R while the others contribute marginal or negative value. The concentration tells you where to weight next year.</li>
                <li><strong className="text-white">5. Next-year plan.</strong> Class rotation, engagement targets, calibration goals. Explicit. Written.</li>
                <li><strong className="text-white">6. Written re-commitment.</strong> A short document (1-2 pages) recommitting to the rules. Signed and dated by you. Re-read monthly through the year.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN TO RUN IT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Run the annual during a market-closed period &mdash; year-end holidays are natural. Block 2-3 days of focused time. Do not trade during the annual; the audit work needs uninterrupted attention. <strong className="text-white">Treat it as a mandatory work week, not as optional reflection.</strong> Operators who treat it as optional drift; operators who treat it as mandatory maintain the framework indefinitely.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THE RE-READ DOES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each Level 11 lesson contains failure-mode warnings. After a year of trading, some warnings will be fresh (the failures you experienced) and others will have faded (failures you have not encountered recently). The re-read surfaces the faded warnings. <strong className="text-white">The failures you have not encountered are the ones most likely to catch you next year</strong> &mdash; not the ones you remember.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE WRITTEN RE-COMMITMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The document is short (1-2 pages) and personal. It states: the rules you commit to honouring next year, the specific failure modes you guard against, the audit cadence you commit to running. Sign and date it. <strong className="text-white">Re-read monthly.</strong> The re-commitment is the structural anchor that converts &quot;intention&quot; into &quot;contract.&quot; Operators with a written re-commitment drift slower than operators without; the document operates as the structural defence even when willpower fluctuates.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Replacement Operator Test === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Replacement Operator Test</p>
          <h2 className="text-2xl font-extrabold mb-4">If A Stranger Took Over Your Account Today...</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The replacement operator test is a thought experiment with operational consequences. <strong className="text-amber-400">If a competent stranger took over your account today, using only your journal, your saved preset, and your watchlist, could they execute identically to you?</strong> If yes, your protocol is explicit and replicable &mdash; a sign of clean discipline. If no, you have been making implicit personal-judgment decisions you have not codified.</p>
          <ReplacementOperatorAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two scenarios. First half: clean handoff. The stranger receives the journal-preset-watchlist folder and executes identically &mdash; green check, banner reads &quot;CLEAN PROTOCOL.&quot; Second half: stranger receives the same folder but cannot replicate &mdash; red question marks orbiting their head, banner reads &quot;IMPLICIT JUDGMENT.&quot; <strong className="text-white">The difference is whether your decisions are codified or whether they live only in your head.</strong> Decisions in your head drift; decisions codified do not.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY THIS TEST WORKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Implicit decisions are where drift hides. An operator who has been trading for a year has likely made hundreds of small &quot;judgment calls&quot; that they have not written down: which signals to skip, which presets to favour, which conditions to read more or less conservatively. <strong className="text-white">These judgment calls accumulate without the operator noticing</strong> because they are not formalised into the protocol. The replacement test surfaces them by asking: would someone else make the same calls? If not, you have implicit drift.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">RUN THE TEST QUARTERLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">At each 90-session audit, ask: <em>could a stranger execute my protocol identically using only my saved materials?</em> If the honest answer is no, identify the implicit decisions and codify them. <strong className="text-white">Either add them to the journal as standing rules (if disciplined) or remove them as overrides (if undisciplined).</strong> Implicit decisions cannot remain implicit at mastery tier; they must resolve into one bucket or the other.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE OPERATIONAL ARTIFACTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three artifacts the stranger needs to execute your protocol: (1) <strong className="text-white">the journal template</strong> showing every trade taken and skipped with reason; (2) <strong className="text-white">the saved preset</strong> with all input configurations explicit; (3) <strong className="text-white">the watchlist</strong> with which symbols are active and which are study-mode. If any of the three contains undocumented assumptions, the test fails.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE ALTERNATE-PERSPECTIVE VARIANT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A variant: imagine your trades reviewed by a senior operator who does not know you. Would they identify the same wins and losses as &quot;clean execution&quot; vs &quot;override&quot;? The senior-operator variant catches a different kind of drift: <strong className="text-white">cases where you have rationalised an override as &quot;clean execution&quot;</strong> because you understand your own internal reasoning. The senior operator sees only the journal entry, which means they see only the result and the documented reason &mdash; the same view the stranger has.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S11 — When To Take A Break From CIPHER === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; When To Take A Break From CIPHER</p>
          <h2 className="text-2xl font-extrabold mb-4">The 30-Day Reset. No Charts. No Journal. No Trades.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The 30-day CIPHER break is the highest-leverage discipline maintenance protocol in this lesson. <strong className="text-amber-400">It removes the operator from active engagement long enough for accumulated drift to detoxify.</strong> Most operators resist the break because it feels like opportunity cost. The opportunity cost of not taking it is higher: continued drift compounds into structural framework abandonment.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN TO TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Take the 30-day break when ANY of the following are present:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li><strong className="text-white">Rage at the framework.</strong> The framework is being blamed for results that are operator-side overrides.</li>
                <li><strong className="text-white">Shame about results.</strong> Identity entanglement with P&amp;L beyond rational concern.</li>
                <li><strong className="text-white">System-switching impulse.</strong> Considering abandoning CIPHER for a different system.</li>
                <li><strong className="text-white">Trading paralysis.</strong> Sitting at the charts unable to engage even on textbook signals.</li>
                <li><strong className="text-white">Override rate above 15%.</strong> The structural-drift threshold from S05 has been crossed.</li>
                <li><strong className="text-white">Drawdown above 20%.</strong> Or whatever level destabilises your relationship with the framework.</li>
                <li><strong className="text-white">Post-winning Stage 3 reached.</strong> The reckoning stage of the post-winning cycle (S03) demands the break to access Stage 4 reset.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THE BREAK CONSISTS OF</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Days 1-15.</strong> No charts. No journal. No CIPHER. No trading-related media. Pure separation. The operator&apos;s nervous system needs uncoupling from the framework before any audit can happen honestly.</li>
                <li><strong className="text-white">Days 16-25.</strong> Audit work. Pull the journal data for the period preceding the break. Catalogue overrides. Identify the structural defences that the overrides bypassed. Map the failure-mode names from the L11.27 catalogue onto the specific instances.</li>
                <li><strong className="text-white">Days 26-30.</strong> Curriculum re-read. Focus on L11.25 (discipline), L11.26 (asset-class), L11.27 (this lesson) plus any specific lesson where drift was identified. Re-take any cert showing drift.</li>
                <li><strong className="text-white">Day 31.</strong> Written re-commitment. Return to trading at reduced size (50% of pre-break baseline) for the first 5 sessions to rebuild calibration. Day 36+ resumes full size.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHY 30 DAYS, NOT FEWER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Shorter breaks (a weekend, a week) do not disrupt the trigger-reaction loop. The operator returns to the charts with the same psychological state that produced the drift in the first place. <strong className="text-white">30 days is the threshold where the daily emotional engagement with the framework actually fades</strong> and the operator can return with a fresh nervous-system relationship. Less than 30 days produces a cosmetic break with no structural benefit. More than 30 days risks calibration loss (the operator forgets how to read CIPHER fluently).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE RESISTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who need the break resist it most. The internal voice argues: &quot;I cannot afford to miss 30 days of opportunity,&quot; &quot;I am close to figuring out what went wrong,&quot; &quot;I have a setup I am watching.&quot; <strong className="text-white">All three are signals that the break is necessary.</strong> The operator who is genuinely fine does not feel the need to defend against the break; the operator who has drifted feels the defence rise. The defence itself is the data.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Mastery-As-Practice Frame === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Mastery-As-Practice Frame</p>
          <h2 className="text-2xl font-extrabold mb-4">The Cert Is A Starting Line.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Cipher Operator certificate is awarded for completing this lesson and passing its quiz. <strong className="text-amber-400">It is not a graduation. It is not a finish line. It is a starting line.</strong> The cert says you have internalised the framework; it does not say you are finished. Mastery is the ongoing practice of the disciplines &mdash; the annual calibration, the quarterly audits, the daily journaling. The cert formalises commitment to that practice.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE CERT IS DATED, NOT PERMANENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Earning the Cipher Operator cert today does not make you a Cipher Operator in 18 months. <strong className="text-white">The cert is implicitly time-bounded by your continued practice.</strong> An operator who earned the cert 18 months ago, has not run an annual self-calibration since, and has accumulated 15%+ override rate over the period is no longer a Cipher Operator in any operational sense. They have the credential; they do not have the practice. The practice is what the credential refers to.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THE PRACTICE LOOKS LIKE</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Daily.</strong> Pre-session checklist. Post-session journal entry. Both completed every session traded.</li>
                <li><strong className="text-white">Weekly.</strong> Quick journal review. Override count for the week. Any qualifying for the 30-session audit cadence.</li>
                <li><strong className="text-white">Monthly.</strong> Re-read of written re-commitment document. Confirmation of next-30-session goals.</li>
                <li><strong className="text-white">Quarterly.</strong> 90-session multi-class audit. Per-class verdicts. Next-cycle plans.</li>
                <li><strong className="text-white">Annually.</strong> Full self-calibration protocol (S09). Curriculum re-read. Cert re-take where needed. Written re-commitment refresh.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE FRAMING SHIFT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Treat Level 11 not as 27 lessons completed but as 27 lessons that you continue to practise. <strong className="text-white">The lessons remain operational only as long as the disciplines remain operational.</strong> An operator who completes Level 11 but stops practising the disciplines has not failed Level 11 &mdash; they have failed to maintain it. Maintenance is the work. Completion is just a milestone marking the start of the maintenance period.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Connecting To The Full Curriculum ★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Connecting To The Full Curriculum &middot; &#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">27 Lessons, Multiple Coherence Paths.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Level 11 is structured so that each lesson reinforces clusters of others. <strong className="text-amber-400">The lessons do not stack linearly &mdash; they form coherence paths.</strong> A drift in one lesson&apos;s discipline frequently shows up as a failure in a related lesson. Understanding the coherence paths helps you target the curriculum re-read efficiently when drift is detected.</p>
          <FullCurriculumWebAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the web cycle through five coherence clusters. Each cluster highlights lessons that reinforce each other. <strong className="text-white">When one of these lessons shows drift, the others in its cluster are likely showing drift too &mdash; even if you have not detected it.</strong> Re-read the cluster, not just the individual lesson.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE FIVE COHERENCE CLUSTERS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Discipline coherence (L11.22, 23, 25, 27).</strong> Conviction synthesis, command center reading, discipline framework, mastery operator. If override rate is rising, all four need refreshing.</li>
                <li><strong className="text-white">Asset-class coherence (L11.5, 6, 7, 26, 27).</strong> Regime engine, transitions, executive summary, asset-class adaptation, mastery operator. If per-class drift is appearing, the regime-reading lessons need refreshing because per-class calibration depends on regime literacy.</li>
                <li><strong className="text-white">Signal-pipeline coherence (L11.10-14).</strong> PX pipeline, Pulse factor, TS system, regime sizing, Coil mechanics. If signal-quality discipline is drifting, the entire pipeline cluster needs refreshing.</li>
                <li><strong className="text-white">Visual-layer coherence (L11.15-21).</strong> Ribbon, Structure, Spine, Imbalance, Sweeps, Risk Envelope, Risk Map. If Command Center reading speed is dropping, the visual-layer lessons need refreshing.</li>
                <li><strong className="text-white">Capstone integration (L11.25, 26, 27).</strong> The three capstones together define the mastery-tier operational state. If multi-cycle drift is detected, all three need refreshing in sequence.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CLUSTER RE-READS DURING ANNUAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">During the annual self-calibration, prioritise cluster re-reads over individual-lesson re-reads. <strong className="text-white">Read the discipline cluster as a unit. Read the asset-class cluster as a unit.</strong> The lessons reinforce each other; reading them sequentially as a cluster surfaces connections you missed reading them individually the first time.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">L11.27 SITS AT MULTIPLE INTERSECTIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Notice that L11.27 (this lesson) appears in three clusters: discipline coherence, asset-class coherence, and capstone integration. <strong className="text-white">That is structural, not accidental.</strong> L11.27 is the lesson that connects the others &mdash; the failure modes it catalogues operate across the entire curriculum. When any cluster shows drift, L11.27 is the lesson that surfaces the cross-cluster pattern.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Your Next 90 Sessions === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Your Next 90 Sessions</p>
          <h2 className="text-2xl font-extrabold mb-4">The Post-Cert Calibration Block.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You have completed Level 11. What happens next determines whether the cert refers to a real practice or to a credential that decays. <strong className="text-amber-400">The recommended forward plan is a 90-session block on a single asset class with all Level 11 disciplines fully active.</strong> The block is the practice protocol that proves the framework holds at scale for you specifically. Operators who skip the post-cert block are the ones who blow up in months 3-6 after earning the cert.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE 90-SESSION POST-CERT PROTOCOL</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Sessions 1-30.</strong> Single asset class only (your strongest, typically FX). 100% adherence target. Full journal coverage. Pre-session checklist completed every session. 30-session audit at session 30.</li>
                <li><strong className="text-white">Session 30 &middot; Replacement operator test.</strong> Can a stranger execute your protocol using only your journal, preset, and watchlist? If no, codify the implicit decisions.</li>
                <li><strong className="text-white">Sessions 31-60.</strong> Same class. Continue 100% adherence target. Mid-block audit at session 60.</li>
                <li><strong className="text-white">Session 60 &middot; Second replacement operator test.</strong> Re-verify codification still holds.</li>
                <li><strong className="text-white">Sessions 61-90.</strong> Same class. Final 30 sessions of the block.</li>
                <li><strong className="text-white">Session 90 &middot; Full 90-session audit.</strong> The audit determines whether the block was clean (adherence &gt;90%, override rate &lt;5%). If clean, you have proven the framework holds for you at scale.</li>
                <li><strong className="text-white">Post-block.</strong> Add a second class via the L11.26 onboarding sequence. Or continue single-class with deeper calibration. Or take the optional 30-day break to mark the milestone before continuing.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">DO NOT ADD COMPLEXITY DURING THE BLOCK</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 90-session block is single-class on purpose. <strong className="text-white">Do not add a second asset class until session 90 audit confirms 27/30 adherence on the first.</strong> Do not change preset mid-block. Do not adjust risk-per-trade mid-block. The block&apos;s purpose is to demonstrate operational stability of the framework under your specific operator-side execution. Adding variables corrupts the data.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THE BLOCK DOES NOT REQUIRE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The block does not require profitability. The block does not require a specific win rate. The block does not require a specific cumulative R. <strong className="text-white">The block requires only adherence.</strong> An operator who finishes 90 sessions at -2R cumulative with 100% adherence has proven the framework holds for them at scale. An operator who finishes at +25R cumulative with 22% override rate has proven nothing about operational stability &mdash; they have proven only that the market was friendly to their drift this quarter. Adherence is the signal; P&amp;L is the noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">AFTER THE BLOCK</p>
              <p className="text-sm text-gray-400 leading-relaxed">A successful 90-session post-cert block earns you the structural position to add a second class via L11.26&apos;s onboarding sequence. A failed block (adherence below 90% or override rate above 5%) earns you the structural signal to repeat the block, not to proceed. <strong className="text-white">There is no rush.</strong> The cert does not expire; the framework does not punish operators who take their time. The operators who take their time are the ones who are still trading in five years.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 — What "Cipher Operator" Means === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; What &quot;Cipher Operator&quot; Means</p>
          <h2 className="text-2xl font-extrabold mb-4">The Identity Definition.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">At the start of this lesson, articulating &quot;my edge&quot; was identified as the identity trap. So what is the disciplined articulation? <strong className="text-amber-400">A Cipher Operator is someone who runs the CIPHER framework with discipline, runs the audit cadence with discipline, and treats the framework as external rather than personal.</strong> The identity definition is structural, not aspirational. It refers to a practice, not to a quality.</p>
          <MasteryStaircaseClimb />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the climb. The operator avatar climbs 27 steps representing the 27 lessons of Level 11. At the top, the avatar reaches a plateau labelled CIPHER OPERATOR. <strong className="text-white">Beyond the plateau, faintly visible, is the next staircase: live trading + annual practice.</strong> The cert is not the destination; the destination is what the cert enables. The years of disciplined trading that follow.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT YOU ARE</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li>You are an operator who has internalised the CIPHER framework across all 27 lessons of Level 11.</li>
                <li>You are someone who runs the audit cadence: daily journaling, quarterly multi-class audits, annual self-calibration.</li>
                <li>You are someone who recognises the failure modes catalogued in this lesson and defends against them structurally rather than through willpower.</li>
                <li>You are someone who treats the framework as external and trusts it to do its job rather than overriding it with personal judgment.</li>
                <li>You are someone whose 90-session post-cert block has proven (or will prove) operational stability of the framework under your specific execution.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT YOU ARE NOT</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li>You are not the source of the edge. The framework is.</li>
                <li>You are not in a position to articulate &quot;your edge&quot; or &quot;your style&quot;. You run the framework with discipline; there is no edge separate from that to articulate.</li>
                <li>You are not finished. The cert is a starting line, not a graduation.</li>
                <li>You are not immune to the failure modes catalogued in this lesson. The defences require ongoing practice; awareness alone is insufficient.</li>
                <li>You are not better than the framework. Past wins do not produce override credit.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE FORWARD WORK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Earn the cert in this session. Take the optional 30-day break to mark the milestone (or proceed directly to the 90-session post-cert block). Run the block at single-class with full discipline. Audit at sessions 30, 60, and 90. After the block, decide whether to add a second class via L11.26&apos;s onboarding sequence, or to deepen the first class with another 90-session block. <strong className="text-white">Repeat indefinitely.</strong> The annual self-calibration anchors each year. The quarterly audits anchor each quarter. The daily journaling anchors each session. The framework holds because the practice holds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">You have completed Level 11. You have internalised 27 lessons of CIPHER framework, asset-class adaptation, discipline architecture, and now multi-cycle mastery protocols. You have the tools. You have the protocols. You have the cert. <strong className="text-white">What remains is the practice.</strong> Years of it. The framework will hold for as long as you do.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === MISTAKES === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-red-400/60 mb-3">Six Identity-Tier Failures</p>
          <h2 className="text-3xl font-extrabold mb-6">The Mastery-Tier Failure Catalogue.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Six characteristic failures emerge specifically at mastery level &mdash; after the structural defences from L11.1-L11.26 are already in place. <strong className="text-red-400">Each requires a different defensive protocol than the structural failures from earlier lessons.</strong> Where earlier failures had mechanical fixes (rules, thresholds, circuit breakers), mastery-tier failures require recognition fixes (linguistic flags, behavioural awareness, audit honesty). The defences are subtler but no less mechanical.</p>

          <div className="space-y-4">

            {/* MISTAKE 1 — Articulation Moment */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 1 &middot; THE ARTICULATION MOMENT</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> A friend or peer asks how you have been doing. You articulate the framework, modestly and carefully, as &quot;my edge.&quot; Even the modest articulation reframes the framework as personal possession. Within 30-60 sessions, override rate begins climbing because the framework is no longer external; it has become &quot;your style&quot; that you can modify when it feels right.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Social-validation cues. A peer asks how you trade. The framework feels like &quot;yours&quot; in the moment of being asked because you are the one doing the work. The articulation slips out almost involuntarily &mdash; even when you intend to deflect.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: when asked how you trade, the only acceptable answer is &quot;I run the CIPHER framework with discipline.&quot; Not &quot;my approach is...&quot;, not &quot;my edge is...&quot;, not &quot;I look for...&quot;. The framing keeps the framework external. Practice the phrase aloud before you need it; the moment you need it is the wrong moment to invent it.</p>
            </div>

            {/* MISTAKE 2 — Post-Winning Stage 2 Missed Catch */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 2 &middot; THE POST-WINNING STAGE 2 MISSED CATCH</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> Post-winning Stage 2 produced visible signals: override rate climbed from 1% to 5%, journal entries became spottier, you started taking trades that &quot;felt right&quot; outside protocol. The 30-session audit at session 30 of the new cycle catches the pattern. You note it, intend to correct, but do not run the structural re-commitment. By Stage 3 the drawdown is committed and the only response left is the 30-day break.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Awareness without action. The audit surfaced the drift; the operator acknowledged it intellectually but did not take the structural step (re-read L11.25, write the re-commitment, reset override counter). Intellectual acknowledgment is not structural correction.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: 30-session audits are not just diagnostic. They are corrective. <strong>If the audit surfaces override rate above 3%, the structural correction must be completed before the next session.</strong> Re-read L11.25, write the re-commitment, reset the override counter to zero, log the audit verdict in the journal. No exceptions. The defence is in the protocol, not in the willpower.</p>
            </div>

            {/* MISTAKE 3 — Single Large Override After A Streak */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 3 &middot; THE &quot;EARNED RIGHT&quot; OVERRIDE</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 50 sessions of clean adherence. A setup appears that does not match the framework&apos;s rules but feels exceptional. Internal voice: &quot;I have earned the right to take this one outside protocol.&quot; You take it. Often it wins (the streak continues, the override gets reinforced). When it loses, the loss is rationalised as bad luck rather than a discipline failure, because &quot;the framework let me take it.&quot; The override has been licensed psychologically and the next one is easier.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Past adherence treated as override credit. The streak feels like accumulated authority; the next override feels like an earned exception rather than a discipline failure.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: linguistic flag recognition. The moment you hear yourself thinking or saying &quot;I have earned the right to&quot;, stop the action that follows. The flag IS the structural signal. <strong>Past adherence is data showing the framework works; it is not credit you can spend on a future override.</strong> The framework owes you nothing. If the override happens despite the flag, log it explicitly in the journal as &quot;earned-right override&quot; and treat the next session as a structural re-commitment opportunity.</p>
            </div>

            {/* MISTAKE 4 — Refusing The 30-Day Break */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 4 &middot; REFUSING THE 30-DAY BREAK</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> Trigger criteria for the 30-day break are present (rage at framework, drawdown above tolerance, system-switching impulse). You acknowledge the need for a break but take a shorter one &mdash; a weekend, a week, ten days &mdash; rationalising that the full 30 is excessive or unaffordable. The shorter break does not disrupt the trigger-reaction loop. You return to the charts with the same psychological state, the same drift compounds, and within 30 sessions you are deeper in the cycle than before.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Compromise. The break threshold feels like all-or-nothing punishment rather than mandatory maintenance. The operator searches for the &quot;smallest break that gets the job done&quot; instead of acknowledging that 30 days is the threshold by design.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: 30 days is the protocol; shorter is not the protocol; the protocol does not negotiate. <strong>If the break trigger has fired, the response is 30 days, no charts, no journal, no trades.</strong> Shorter breaks are cosmetic and structurally ineffective. The defence is in the refusal to compromise on the duration. Operators who take the full 30 recover; operators who negotiate downward replicate the cycle.</p>
            </div>

            {/* MISTAKE 5 — Aggregating Multi-Class P&L */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 5 &middot; AGGREGATING THE PORTFOLIO P&amp;L</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 90 sessions across FX, Gold, and Indices. Cumulative +33R. You report it to yourself as &quot;a great quarter.&quot; The aggregate hides that FX produced +22R, Gold produced +15R, and Indices destroyed -4R. The +33R looks like success; the per-class breakdown reveals that Indices is a structurally weak class for you that should be removed from rotation. By skipping the per-class audit and reading only the aggregate, you commit to another 90 sessions of the same Indices losses.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Comfort. The aggregate is the comfortable number. The per-class breakdown is the uncomfortable one. Operators default to the comfortable read unless the protocol forces the breakdown.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: the 90-session audit is per-class only. Three classes means three audits, three verdicts, three next-cycle plans. <strong>Never compute or look at the portfolio aggregate until each class has been audited on its own.</strong> The aggregate is the comfortable distortion. The per-class structure is the actionable signal. The defence is in the protocol&apos;s refusal to aggregate.</p>
            </div>

            {/* MISTAKE 6 — Skipping The Annual Self-Calibration */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 6 &middot; SKIPPING THE ANNUAL SELF-CALIBRATION</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> Year-end approaches. The annual self-calibration requires 10-15 hours of focused time, a full curriculum re-read, cert re-takes for any drifted disciplines, and a written re-commitment. You acknowledge the protocol but skip it because &quot;the year went well&quot; or &quot;I do not have time&quot; or &quot;quarterly audits are enough.&quot; In year 2, drift accumulates that quarterly audits cannot detect (identity-level drift requires the curriculum re-read to surface). By year 3, the framework has been operationally abandoned without the operator realising.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The annual feels disproportionate. Quarterly audits feel sufficient; the annual feels like overkill. Operators rationalise the skip because the cost is high (10-15 hours) and the immediate benefit is invisible.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: schedule the annual in advance, blocked from the calendar, treated as mandatory work week not optional reflection. <strong>The annual is the only known structural defence against multi-year identity drift.</strong> Quarterly audits catch behavioural drift; the annual catches identity drift. The two are different layers and the annual cannot be substituted by extra quarterly audits. Schedule it. Honour it. Operators who run the annual every year sustain the framework indefinitely.</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* === CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">For The Second Monitor</p>
          <h2 className="text-3xl font-extrabold mb-6">Cipher Operator Cheat Sheet.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Pin to your trading desk. The mastery-tier protocols, failure modes, audit cadences, and linguistic flags &mdash; reduced to the operational essentials.</p>

          <div className="p-5 rounded-2xl glass-card space-y-5">

            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE GROUNDBREAKING CONCEPT</p>
              <p className="text-sm text-gray-300 leading-relaxed">After all the rules, the operator is the risk. Five structural risk layers (engine, calibration, asset class, news, drawdown) have mechanical defences. The sixth layer &mdash; the operator&apos;s identity, accumulated confidence, and relationship with the framework over time &mdash; requires identity-tier protocols.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THREE COMPOUNDING CURVES</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li><strong className="text-teal-400">Skill</strong> &middot; logarithmic rise from accumulated experience</li>
                <li><strong style={{ color: '#EF5350' }}>Drift</strong> &middot; exponential rise from tolerated overrides</li>
                <li><strong className="text-amber-400">Audit cadence</strong> &middot; sawtooth corrections at 30/90/180/270/annual marks</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE POST-WINNING CYCLE (4 STAGES)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. Euphoria (days 0-15) &middot; adherence 100% but identity shifts</li>
                <li>2. Loosening (15-45) &middot; override rate 2% to 6%, adherence 92-94%</li>
                <li>3. Reckoning (45-75) &middot; drawdown collapses gains, adherence 73-80%</li>
                <li>4. Reset (75+) &middot; 30-day break or deepen cycle</li>
              </ul>
              <p className="text-sm text-gray-400 mt-2 italic">Intercept at Stage 2. Stage 3 is too late.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE POST-LOSING CYCLE (3 FAILURE PATHS + RESET)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Path A &middot; System-switching (blame the framework)</li>
                <li>Path B &middot; Over-rigidity (tighten everything)</li>
                <li>Path C &middot; Paralysis (unable to engage)</li>
                <li>Reset &middot; 30-day break + audit + re-commitment</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">MICRO-OVERRIDE COMPOUNDING THRESHOLDS</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>2% &middot; baseline tolerance</li>
                <li>5% &middot; warning threshold &mdash; correction required before next session</li>
                <li>15% &middot; structural drift &mdash; 30-day break + curriculum re-read</li>
                <li>30% &middot; framework operationally abandoned &mdash; full re-onboarding</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">LINGUISTIC FLAGS (STOP IF YOU HEAR YOURSELF SAYING)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>&quot;I have earned the right to...&quot;</li>
                <li>&quot;Given my track record...&quot;</li>
                <li>&quot;I have proven I can...&quot;</li>
                <li>&quot;This trade is different because...&quot;</li>
                <li>&quot;Just this one, since I have been so disciplined...&quot;</li>
                <li>&quot;My edge / my style / my approach&quot;</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">90-SESSION MULTI-CLASS AUDIT (6 DIMENSIONS PER CLASS)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. Cumulative P&amp;L (per class only, never aggregated)</li>
                <li>2. Win rate + average R</li>
                <li>3. Override count + override rate</li>
                <li>4. Pattern attribution (best / worst patterns)</li>
                <li>5. Failure mode count (class-specific)</li>
                <li>6. Verdict (Strong / Marginal / Weak) + next-cycle plan</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">ANNUAL SELF-CALIBRATION (6 STEPS, 10-15 HOURS)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. Curriculum re-read (L11.1 through L11.27)</li>
                <li>2. Cert re-take for any drifted disciplines</li>
                <li>3. Year-end per-class P&amp;L (no aggregation)</li>
                <li>4. Edge concentration analysis (which class carried the year?)</li>
                <li>5. Next-year plan (class rotation + engagement targets)</li>
                <li>6. Written re-commitment (1-2 pages, re-read monthly)</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">WHEN TO TAKE THE 30-DAY BREAK</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Rage at the framework</li>
                <li>Shame about results</li>
                <li>System-switching impulse</li>
                <li>Trading paralysis</li>
                <li>Override rate above 15%</li>
                <li>Drawdown above 20% (or personal threshold)</li>
                <li>Post-winning Stage 3 reached</li>
              </ul>
              <p className="text-sm text-gray-400 mt-2 italic">Days 1-15: no charts, no journal, no trades. Days 16-25: audit work. Days 26-30: curriculum re-read. Day 31: return at 50% size.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">REPLACEMENT OPERATOR TEST (QUARTERLY)</p>
              <p className="text-sm text-gray-300 leading-relaxed">Could a stranger execute your protocol using only your journal, your saved preset, and your watchlist? If no, codify the implicit decisions. Either add them as standing rules or remove them as overrides. Implicit decisions cannot remain implicit at mastery tier.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">FIVE COHERENCE CLUSTERS (FOR RE-READS)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Discipline &middot; L11.22, 23, 25, 27</li>
                <li>Asset-class &middot; L11.5, 6, 7, 26, 27</li>
                <li>Signal-pipeline &middot; L11.10-14</li>
                <li>Visual-layer &middot; L11.15-21</li>
                <li>Capstone integration &middot; L11.25, 26, 27</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">POST-CERT FORWARD PLAN (NEXT 90 SESSIONS)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Single asset class only (your strongest)</li>
                <li>100% adherence target, full journal coverage</li>
                <li>30-session audit at sessions 30, 60, 90</li>
                <li>Replacement operator test at sessions 30 and 60</li>
                <li>Full 90-session audit at session 90</li>
                <li>Add second class only after clean 90-session block</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE SIX MASTERY-TIER MISTAKES</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. The articulation moment (&quot;my edge&quot; said aloud)</li>
                <li>2. Post-winning Stage 2 missed catch (awareness without action)</li>
                <li>3. The &quot;earned right&quot; override (accumulated authority spent)</li>
                <li>4. Refusing the 30-day break (negotiating duration downward)</li>
                <li>5. Aggregating the portfolio P&amp;L (hiding per-class signal)</li>
                <li>6. Skipping the annual self-calibration (multi-year drift)</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">WHAT &quot;CIPHER OPERATOR&quot; MEANS</p>
              <p className="text-sm text-gray-300 leading-relaxed">You run the CIPHER framework with discipline. You run the audit cadence with discipline. You treat the framework as external rather than personal. The cert is a starting line, not a finish line. The framework holds for as long as you do.</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* === PHASE_3A_INSERT_POINT === */}

      {/* === GAME === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Mastery-Tier Drill</p>
          <h2 className="text-3xl font-extrabold mb-6">Five Multi-Cycle Decisions.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Each scenario presents a mastery-tier decision point &mdash; a moment when the structural defences from L11.1-L11.26 are not enough and identity-tier discipline is the only remaining defence. <strong className="text-amber-400">Pick the response that maintains the framework as external. Each option locks once selected.</strong></p>

          {gameRounds.map((round, rIdx) => {
            const selectedId = gameSelections[rIdx];
            const isLocked = selectedId !== null;
            return (
              <div key={round.id} className="mb-10 p-5 rounded-2xl glass-card">
                <p className="text-xs font-bold text-amber-400 mb-3 tracking-widest">SCENARIO {rIdx + 1} OF {gameRounds.length}</p>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{round.scenario}</p>
                <p className="text-sm font-bold text-white mb-4">{round.prompt}</p>
                <div className="space-y-2">
                  {round.options.map((opt) => {
                    const isSelected = selectedId === opt.id;
                    const showResult = isLocked;
                    const isCorrect = opt.correct;
                    let bgClass = 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20';
                    if (showResult) {
                      if (isCorrect) bgClass = 'bg-teal-500/10 border-teal-500/40';
                      else if (isSelected) bgClass = 'bg-red-500/10 border-red-500/40';
                      else bgClass = 'bg-white/[0.02] border-white/5 opacity-40';
                    }
                    return (
                      <button
                        key={opt.id}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          const next = [...gameSelections];
                          next[rIdx] = opt.id;
                          setGameSelections(next);
                        }}
                        className={`w-full text-left p-3 rounded-lg border text-sm leading-relaxed transition-all ${bgClass} ${
                          isLocked ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                        }`}
                      >
                        <span className="text-gray-300">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
                {isLocked && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs font-bold tracking-widest text-amber-400 mb-2">DEBRIEF</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{round.options.find(o => o.id === selectedId)?.explain}</p>
                    {!round.options.find(o => o.id === selectedId)?.correct && (
                      <p className="text-xs text-teal-400 mt-3"><strong>Correct answer:</strong> {round.options.find(o => o.correct)?.text}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {gameSelections.every((s) => s !== null) && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-accent-500/10 border border-amber-500/30 text-center">
              <p className="text-xs font-bold tracking-widest text-amber-400 mb-2">DRILL COMPLETE</p>
              <p className="text-2xl font-extrabold text-white mb-2">
                {gameSelections.filter((s, i) => gameRounds[i].options.find(o => o.id === s)?.correct).length} / {gameRounds.length}
              </p>
              <p className="text-sm text-gray-400">The drill is practice, not a gate. The quiz below is the certificate gate.</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* === QUIZ === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Cipher Operator Quiz</p>
          <h2 className="text-3xl font-extrabold mb-6">Thirteen Questions. The Terminal Certificate.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Answer all 13. Submit when complete. <strong className="text-amber-400">9 of 13 correct (~66&percnt;)</strong> earns the Cipher Operator certificate &mdash; the terminal cert of Level 11. Re-take available on failed attempts.</p>

          {quizQuestions.map((q, qIdx) => (
            <div key={q.id} className="mb-8 p-5 rounded-2xl glass-card">
              <p className="text-xs font-bold text-amber-400 mb-3 tracking-widest">QUESTION {qIdx + 1} OF {quizQuestions.length}</p>
              <p className="text-sm font-bold text-white mb-4 leading-relaxed">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isSelected = quizAnswers[qIdx] === opt.id;
                  const showResult = quizSubmitted;
                  const isCorrect = opt.correct;
                  let bgClass = isSelected
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20';
                  if (showResult) {
                    if (isCorrect) bgClass = 'bg-teal-500/10 border-teal-500/40';
                    else if (isSelected) bgClass = 'bg-red-500/10 border-red-500/40';
                    else bgClass = 'bg-white/[0.02] border-white/5 opacity-40';
                  }
                  return (
                    <button
                      key={opt.id}
                      disabled={quizSubmitted}
                      onClick={() => {
                        if (quizSubmitted) return;
                        const next = [...quizAnswers];
                        next[qIdx] = opt.id;
                        setQuizAnswers(next);
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-sm leading-relaxed transition-all ${bgClass} ${
                        quizSubmitted ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                      }`}
                    >
                      <span className="text-gray-300">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              {quizSubmitted && (
                <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs font-bold tracking-widest text-amber-400 mb-2">EXPLANATION</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{q.explain}</p>
                </div>
              )}
            </div>
          ))}

          {!quizSubmitted && (
            <button
              disabled={quizAnswers.some((a) => a === null)}
              onClick={() => setQuizSubmitted(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                quizAnswers.some((a) => a === null)
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-accent-500 text-white shadow-lg shadow-amber-500/20 active:scale-95'
              }`}
            >
              {quizAnswers.some((a) => a === null)
                ? `Answer all ${quizQuestions.length} questions to submit (${quizAnswers.filter((a) => a !== null).length}/${quizQuestions.length})`
                : 'Submit Quiz'}
            </button>
          )}

          {quizSubmitted && (
            <div className={`p-6 rounded-2xl text-center border-2 ${
              quizPassed
                ? 'bg-gradient-to-br from-teal-500/10 to-amber-500/10 border-teal-500/40'
                : 'bg-red-500/5 border-red-500/30'
            }`}>
              <p className="text-xs font-bold tracking-widest text-amber-400 mb-2">QUIZ RESULT</p>
              <p className="text-4xl font-extrabold text-white mb-2">{quizCorrect} / {quizQuestions.length}</p>
              <p className="text-lg text-gray-300 mb-4">{quizPercent}&percnt;</p>
              {quizPassed ? (
                <p className="text-sm text-teal-400 font-bold">PASSED &mdash; Cipher Operator certificate unlocked below.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">Below 66&percnt;. Review the lesson and retake.</p>
                  <button
                    onClick={() => {
                      setQuizAnswers(Array(quizQuestions.length).fill(null));
                      setQuizSubmitted(false);
                    }}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-bold active:scale-95 transition-all"
                  >
                    Retake Quiz
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* === CERT REVEAL — TERMINAL TIER === */}
      {certRevealed && (
        <section className="max-w-2xl mx-auto px-5 py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.0 }}>
            {/* LEVEL 11 COMPLETE banner above cert (terminal-tier differentiator) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mb-6"
            >
              <div className="inline-block px-6 py-3 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(255,179,0,0.15), rgba(38,166,154,0.15))',
                border: '1px solid rgba(255,179,0,0.4)',
              }}>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-400 mb-1">&#9733; LEVEL 11 COMPLETE &#9733;</p>
                <p className="text-sm font-bold text-white">CIPHER PRO MASTERY &middot; ALL 27 LESSONS</p>
              </div>
            </motion.div>

            <div className="relative p-10 rounded-3xl text-center overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(38,166,154,0.10), rgba(255,179,0,0.10), rgba(14,165,233,0.10))',
              border: '2px solid rgba(255,179,0,0.5)',
            }}>
              {/* Rotating conic-gradient ring (slower for terminal tier) */}
              <div className="absolute inset-0 pointer-events-none opacity-35" style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255,179,0,0.4), transparent, rgba(38,166,154,0.4), transparent, rgba(14,165,233,0.3), transparent)',
                animation: 'spin-terminal 10s linear infinite',
              }} />
              <style jsx>{`@keyframes spin-terminal { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

              <div className="relative z-10">
                <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">Terminal Certificate Awarded</p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Cipher Operator</h2>
                <p className="text-sm text-gray-400 mb-2">Lesson 27 of Level 11 &middot; The Final Capstone</p>
                <p className="text-xs text-gray-500 italic mb-6">After all the rules, the operator is the risk.</p>
                <div className="inline-block px-5 py-3 rounded-lg bg-black/30 border border-white/10 mb-4">
                  <p className="text-[10px] tracking-widest text-gray-500 mb-1">CERTIFICATE ID</p>
                  <p className="text-base font-mono font-bold text-amber-400">{certId}</p>
                </div>
                <div className="border-t border-white/10 pt-6 mt-2">
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    Awarded for completing all 27 lessons of Level 11 CIPHER PRO Mastery, with demonstrated understanding of the three compounding curves, the identity-tier failure modes, the 90-session multi-class audit protocol, the annual self-calibration cadence, the replacement operator test, the 30-day break protocol, and the mastery-as-practice frame.
                  </p>
                  <p className="text-[10px] text-gray-500 italic mt-4 max-w-md mx-auto">
                    This cert is a starting line, not a finish line. The framework holds for as long as the practice holds.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* === FOOTER === */}
      <section className="max-w-2xl mx-auto px-5 py-20 text-center">
        <Link
          href="/academy"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 hover:from-amber-600 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          &larr; Back to Academy
        </Link>
      </section>
    </div>
  );
}
// PHASE_3B_COMPLETE
