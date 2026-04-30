'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

// ============================================================
// LESSON 11.24 — Cipher War Room Integration
// Cert: War Room Operator
// GC: The desk choreography IS the edge.
// ============================================================
// First lesson of the Operations arc (L11.24-28). Visual Layer arc
// taught what to read; Operations arc teaches how to operate at scale.
// Teaches:
//   1. The general war room (1-2 monitors, 4-6 charts)
//   2. Chart roles — Primary / Secondary / Watch / Reference
//   3. The HTF/LTF stack (4H + 1H + 15m + 5m on one asset)
//   4. Cross-asset correlation reads
//   5. Watchlist discipline
//   6. Alert architecture
//   7. Triaging the alert storm
//   8. Pre-market routine, active session choreography, close-out
//   9. Decision protocol under load
//  10. The journal — what to capture
//  11. Solo vs team workflow
//  12. Upgrade path from 1 chart to 6 charts
// ============================================================

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ============================================================
// ANIMSCENE — locked gold-standard wrapper from L11.18
// Signature is (ctx, t, w, h). DO NOT REORDER.
// ============================================================
function AnimScene({
  draw,
  aspectRatio = 16 / 9,
  className = '',
}: {
  draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;
  aspectRatio?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const h = w / aspectRatio;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [aspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, draw]);

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 ${className}`}>
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

// ============================================================
// CONFETTI — gold-standard cert reveal pattern
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    type P = { x: number; y: number; vx: number; vy: number; c: string; s: number; r: number; vr: number };
    const colors = ['#26A69A', '#FFB300', '#EF5350', '#FFFFFF', '#FBBF24'];
    const particles: P[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 6 + 4,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
    }));
    let rafId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// ============================================================
// HELPER — easing
// ============================================================
const easeInOut = (x: number): number => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// ============================================================
// ANIMATION 1 — WarRoomLayoutAnim (Hero)
// A 4-pane war room layout assembling itself. Empty grid first,
// then panes populate one by one with mini chart content. Each
// pane labeled with its role. Visual signature.
// ============================================================
function WarRoomLayoutAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE WAR ROOM \u2014 4 PANES, 4 ROLES', w / 2, 24);

    // 2x2 grid of panes
    const padX = 30;
    const padY = 50;
    const gap = 8;
    const paneW = (w - 2 * padX - gap) / 2;
    const paneH = (h - padY - 30 - gap) / 2;

    const panes = [
      { row: 0, col: 0, role: 'PRIMARY', asset: 'NAS100 1H', revealStart: 0.10 },
      { row: 0, col: 1, role: 'SECONDARY', asset: 'XAUUSD 1H', revealStart: 0.28 },
      { row: 1, col: 0, role: 'WATCH', asset: 'EURUSD 1H', revealStart: 0.46 },
      { row: 1, col: 1, role: 'REFERENCE', asset: 'DXY 1H', revealStart: 0.64 },
    ];

    panes.forEach((p) => {
      if (tt < p.revealStart) return;
      const fade = Math.min(1, (tt - p.revealStart) / 0.10);
      const x = padX + p.col * (paneW + gap);
      const y = padY + p.row * (paneH + gap);

      ctx.globalAlpha = fade;

      // Pane background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, paneW, paneH);
      ctx.strokeStyle = p.role === 'PRIMARY' ? 'rgba(38, 166, 154, 0.5)' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = p.role === 'PRIMARY' ? 1.5 : 1;
      ctx.strokeRect(x, y, paneW, paneH);

      // Role label (top-left)
      ctx.fillStyle = p.role === 'PRIMARY' ? '#26A69A' : '#FFB300';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.role, x + 8, y + 14);

      // Asset (top-right)
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(p.asset, x + paneW - 8, y + 14);

      // Mini candles inside
      const cAreaX = x + 8;
      const cAreaY = y + 22;
      const cAreaW = paneW - 16;
      const cAreaH = paneH - 30;
      const nC = 14;
      const cwBar = cAreaW / nC;

      // Each pane has a slightly different price profile
      const profileSeed = p.row * 2 + p.col;
      for (let i = 0; i < nC; i++) {
        const phase = (i / nC) * Math.PI * 2 + profileSeed;
        const noise = Math.sin(phase * 1.7) * 0.15;
        const trend = profileSeed === 0 ? -i * 0.025 : profileSeed === 1 ? i * 0.020 : profileSeed === 2 ? Math.sin(i * 0.4) * 0.18 : i * 0.010;
        const yPos = 0.5 + noise + trend;
        const next = i < nC - 1 ? 0.5 + Math.sin(((i + 1) / nC) * Math.PI * 2 * 1.7 + profileSeed) * 0.15 + (profileSeed === 0 ? -(i + 1) * 0.025 : profileSeed === 1 ? (i + 1) * 0.020 : profileSeed === 2 ? Math.sin((i + 1) * 0.4) * 0.18 : (i + 1) * 0.010) : yPos;
        const oY = cAreaY + Math.max(0, Math.min(1, yPos)) * cAreaH;
        const cY = cAreaY + Math.max(0, Math.min(1, next)) * cAreaH;
        const top = Math.min(oY, cY);
        const bot = Math.max(oY, cY);
        const isUp = cY < oY;
        ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
        ctx.fillRect(cAreaX + i * cwBar + cwBar * 0.15, top, cwBar * 0.7, Math.max(2, bot - top));
      }

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each pane has a job. Together they are the war room.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — WorkflowVsSignalAnim (S01 GC)
// Two parallel timelines. Top: signal chaser — red flashes at every
// alert, jagged P&L line trending down. Bottom: workflow operator —
// steady checkpoint markers, smooth P&L line trending up.
// ============================================================
function WorkflowVsSignalAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAME SIGNALS \u2014 DIFFERENT P&L', w / 2, 22);

    const trackY1 = 60;
    const trackY2 = h - 100;
    const trackX = 30;
    const trackW = w - 60;
    const trackH = 56;

    // Top track (signal chaser) — red theme
    ctx.fillStyle = 'rgba(239, 83, 80, 0.05)';
    ctx.fillRect(trackX, trackY1, trackW, trackH);
    ctx.strokeStyle = 'rgba(239, 83, 80, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(trackX, trackY1, trackW, trackH);

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SIGNAL CHASER', trackX + 8, trackY1 - 4);

    // Bottom track (workflow operator) — teal theme
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(trackX, trackY2, trackW, trackH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.2)';
    ctx.strokeRect(trackX, trackY2, trackW, trackH);

    ctx.fillStyle = '#26A69A';
    ctx.fillText('WORKFLOW OPERATOR', trackX + 8, trackY2 - 4);

    // Events on each track — same 8 events per side
    const nE = 8;
    const eW = trackW / nE;
    const reveal = Math.min(1, tt * 1.5);
    const visCount = Math.floor(nE * reveal);

    // Top track: erratic flashes
    for (let i = 0; i < visCount; i++) {
      const x = trackX + i * eW + eW / 2;
      const flickerOpacity = 0.3 + 0.4 * Math.abs(Math.sin(t * 8 + i));
      ctx.fillStyle = `rgba(239, 83, 80, ${flickerOpacity})`;
      ctx.beginPath();
      ctx.arc(x, trackY1 + trackH / 2, 5 + Math.sin(t * 6 + i * 1.3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom track: steady checkpoints
    for (let i = 0; i < visCount; i++) {
      const x = trackX + i * eW + eW / 2;
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(x - 6, trackY2 + trackH / 2 - 6, 12, 12);
    }

    // P&L lines below each track
    const plY1 = trackY1 + trackH + 20;
    const plY2 = trackY2 + trackH + 20;
    const plH = 30;

    // Top P&L: jagged, trending down
    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= visCount; i++) {
      const x = trackX + (i / nE) * trackW;
      const noise = Math.sin(i * 1.3 + t * 0.5) * 8;
      const trend = -i * 2;
      const y = plY1 + plH + trend + noise;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#EF5350';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('P&L \u2193', trackX + trackW - 4, plY1 + plH);

    // Bottom P&L: smooth, trending up
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= visCount; i++) {
      const x = trackX + (i / nE) * trackW;
      const trend = -i * 2.5;
      const y = plY2 + plH + trend;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('P&L \u2191', trackX + trackW - 4, plY2 + plH);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Workflow discipline produces different outcomes from identical signals.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — ChartRolesAnim (S03 — Chart Roles)
// 4-pane grid where each pane labels its role progressively.
// PRIMARY (active engagement), SECONDARY (correlated/alt), WATCH
// (alerted only), REFERENCE (context-only). Each pane shows
// different visual weight matching its role's priority.
// ============================================================
function ChartRolesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const roles = [
      { name: 'PRIMARY', desc: 'Active engagement', detail: 'Where most trades fire', color: '#26A69A', activity: 1.0 },
      { name: 'SECONDARY', desc: 'Correlated / alt setup', detail: 'Backup for primary', color: '#FFB300', activity: 0.6 },
      { name: 'WATCH', desc: 'Alerted-only', detail: 'No active focus', color: 'rgba(255,255,255,0.6)', activity: 0.2 },
      { name: 'REFERENCE', desc: 'Context-only', detail: 'DXY, VIX, BTC, etc.', color: 'rgba(255,255,255,0.4)', activity: 0.1 },
    ];

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHART ROLES \u2014 NOT ALL PANES ARE EQUAL', w / 2, 22);

    // 4 panels in a horizontal row
    const padX = 18;
    const startY = 50;
    const cardW = (w - 2 * padX - 24) / 4;
    const cardH = h - 100;
    const gap = 8;

    roles.forEach((r, i) => {
      const revealStart = i * 0.10;
      if (tt < revealStart) return;
      const fade = Math.min(1, (tt - revealStart) / 0.15);
      const x = padX + i * (cardW + gap);

      ctx.globalAlpha = fade;

      // Card background — opacity scaled by activity
      const bgAlpha = 0.04 + r.activity * 0.10;
      ctx.fillStyle = `rgba(255,255,255,${bgAlpha})`;
      ctx.fillRect(x, startY, cardW, cardH);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.strokeRect(x, startY, cardW, cardH);

      // Role label
      ctx.fillStyle = r.color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, x + cardW / 2, startY + 22);

      // Mini chart
      const cAreaX = x + 12;
      const cAreaY = startY + 36;
      const cAreaW = cardW - 24;
      const cAreaH = cardH * 0.5;
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(cAreaX, cAreaY, cAreaW, cAreaH);

      const nC = 10;
      const cwBar = cAreaW / nC;
      for (let j = 0; j < nC; j++) {
        const y1 = 0.5 + Math.sin(j * 0.6 + i * 1.3) * 0.2 - j * 0.012;
        const y2 = 0.5 + Math.sin((j + 1) * 0.6 + i * 1.3) * 0.2 - (j + 1) * 0.012;
        const oY = cAreaY + y1 * cAreaH;
        const cY = cAreaY + y2 * cAreaH;
        const top = Math.min(oY, cY);
        const bot = Math.max(oY, cY);
        const isUp = cY < oY;
        const candleAlpha = 0.3 + r.activity * 0.7;
        ctx.fillStyle = isUp ? `rgba(38, 166, 154, ${candleAlpha})` : `rgba(239, 83, 80, ${candleAlpha})`;
        ctx.fillRect(cAreaX + j * cwBar + cwBar * 0.2, top, cwBar * 0.6, Math.max(1, bot - top));
      }

      // Description below chart
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.desc, x + cardW / 2, startY + 36 + cAreaH + 18);

      // Detail
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(r.detail, x + cardW / 2, startY + 36 + cAreaH + 32);

      // Activity bar at bottom
      const barY = startY + cardH - 20;
      const barH = 6;
      const barW = cardW - 24;
      const barX = x + 12;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = r.color;
      ctx.fillRect(barX, barY, barW * r.activity, barH);

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Different roles. Different visual weight. Different attention.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — TimeframeStackAnim (S04 — HTF/LTF Stack)
// Same asset rendered across 4 timeframes vertically: 4H, 1H, 15m,
// 5m. A signal cascades down through them — fires on 4H first, then
// 1H confirms, then 15m, then 5m. Visual hierarchy of context.
// ============================================================
function TimeframeStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE HTF/LTF STACK \u2014 ONE ASSET, 4 TIMEFRAMES', w / 2, 22);

    const tfs = [
      { label: '4H', desc: 'macro context', signalStart: 0.10 },
      { label: '1H', desc: 'setup zone', signalStart: 0.25 },
      { label: '15m', desc: 'entry timing', signalStart: 0.40 },
      { label: '5m', desc: 'execution', signalStart: 0.55 },
    ];

    const padX = 24;
    const startY = 48;
    const rowH = (h - 90) / tfs.length;
    const labelW = 50;

    tfs.forEach((tf, i) => {
      const y = startY + i * rowH;

      // TF label
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tf.label, padX, y + rowH * 0.45);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(tf.desc, padX, y + rowH * 0.7);

      // Chart strip for this TF
      const cX = padX + labelW;
      const cW = w - padX - labelW - 30;
      const cY = y + 4;
      const cH = rowH - 8;

      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(cX, cY, cW, cH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cX, cY, cW, cH);

      // Mini candles — same trend on each TF but with different bar density
      const nC = 16 + i * 4;
      const cwBar = cW / nC;
      for (let j = 0; j < nC; j++) {
        const phase = j / nC;
        const trend = -0.20 + phase * 0.50;
        const noise = Math.sin(j * (0.4 + i * 0.15)) * 0.10;
        const yPos = 0.5 + trend + noise;
        const next = 0.5 + (-0.20 + ((j + 1) / nC) * 0.50) + Math.sin((j + 1) * (0.4 + i * 0.15)) * 0.10;
        const oY = cY + Math.max(0, Math.min(1, yPos)) * cH;
        const ccY = cY + Math.max(0, Math.min(1, next)) * cH;
        const top = Math.min(oY, ccY);
        const bot = Math.max(oY, ccY);
        const isUp = ccY < oY;
        ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
        ctx.fillRect(cX + j * cwBar + cwBar * 0.15, top, cwBar * 0.7, Math.max(1, bot - top));
      }

      // Signal indicator — fires when tt > signalStart
      if (tt > tf.signalStart) {
        const fade = Math.min(1, (tt - tf.signalStart) / 0.10);
        const sigX = cX + cW * 0.85;
        const sigY = cY + cH * 0.3;
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);

        // Glow
        const grad = ctx.createRadialGradient(sigX, sigY, 0, sigX, sigY, 14);
        grad.addColorStop(0, `rgba(38, 166, 154, ${0.5 * fade * pulse})`);
        grad.addColorStop(1, 'rgba(38, 166, 154, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(sigX - 20, sigY - 20, 40, 40);

        // Signal dot
        ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
        ctx.beginPath();
        ctx.arc(sigX, sigY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('SIGNAL', sigX + 8, sigY + 3);
      }
    });

    // Cascade arrow on the left
    if (tt > 0.10) {
      const arrowFade = Math.min(1, (tt - 0.10) / 0.40);
      ctx.strokeStyle = `rgba(255, 179, 0, ${0.5 * arrowFade})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + labelW - 10, startY + 10);
      ctx.lineTo(padX + labelW - 10, startY + tfs.length * rowH - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      ctx.fillStyle = `rgba(255, 179, 0, ${0.5 * arrowFade})`;
      ctx.beginPath();
      ctx.moveTo(padX + labelW - 10, startY + tfs.length * rowH - 6);
      ctx.lineTo(padX + labelW - 14, startY + tfs.length * rowH - 12);
      ctx.lineTo(padX + labelW - 6, startY + tfs.length * rowH - 12);
      ctx.closePath();
      ctx.fill();
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Higher TF = context. Lower TF = timing. Read top down.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}


// ============================================================
// ANIMATION 5 — CorrelationPairAnim (S05 — Cross-Asset Correlation Reads)
// Two charts side by side: DXY (left) and EURUSD (right). They move
// inversely — as DXY climbs, EURUSD falls. A vertical sweep line
// passes across both, with annotation showing the correlation flip
// at key moments. Teaches inverse correlation reading.
// ============================================================
function CorrelationPairAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CROSS-ASSET CORRELATION \u2014 DXY \u2194 EURUSD', w / 2, 22);

    // Two panels side by side
    const padX = 24;
    const padY = 50;
    const gap = 12;
    const panelW = (w - 2 * padX - gap) / 2;
    const panelH = h - 100;

    const renderPanel = (px: number, asset: string, isInverse: boolean) => {
      const py = padY;
      const pw = panelW;
      const ph = panelH;

      // Panel bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Asset label
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(asset, px + 8, py + 16);

      // Mini candles — inverse profiles
      const cAreaX = px + 12;
      const cAreaY = py + 28;
      const cAreaW = pw - 24;
      const cAreaH = ph - 40;
      const nC = 16;
      const cwBar = cAreaW / nC;

      const reveal = Math.min(1, tt * 1.5);
      const visCount = Math.floor(nC * reveal);

      for (let i = 0; i < visCount; i++) {
        // DXY: rises gradually with noise. EUR: falls (inverse).
        const phase = i / nC;
        const baseTrend = phase * 0.45;
        const noise = Math.sin(i * 0.6) * 0.06;
        const dxyY = 0.7 - baseTrend + noise;
        const eurY = 0.3 + baseTrend - noise;
        const yPos = isInverse ? eurY : dxyY;
        const nextPhase = (i + 1) / nC;
        const nextNoise = Math.sin((i + 1) * 0.6) * 0.06;
        const nextY = isInverse
          ? 0.3 + nextPhase * 0.45 - nextNoise
          : 0.7 - nextPhase * 0.45 + nextNoise;

        const oY = cAreaY + Math.max(0.05, Math.min(0.95, yPos)) * cAreaH;
        const ccY = cAreaY + Math.max(0.05, Math.min(0.95, nextY)) * cAreaH;
        const top = Math.min(oY, ccY);
        const bot = Math.max(oY, ccY);
        const isUp = ccY < oY;
        ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
        ctx.fillRect(cAreaX + i * cwBar + cwBar * 0.15, top, cwBar * 0.7, Math.max(2, bot - top));
      }

      return { cAreaX, cAreaY, cAreaW, cAreaH };
    };

    const left = renderPanel(padX, 'DXY  \u2014  reference', false);
    const right = renderPanel(padX + panelW + gap, 'EURUSD  \u2014  primary', true);

    // Sweep line passes across both panels
    if (tt > 0.5) {
      const sweepT = (tt - 0.5) / 0.40;
      const sweepBarIdx = Math.floor(sweepT * 16);

      // Left panel sweep
      const leftSweepX = left.cAreaX + sweepBarIdx * (left.cAreaW / 16);
      ctx.strokeStyle = 'rgba(255,179,0,0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(leftSweepX, left.cAreaY);
      ctx.lineTo(leftSweepX, left.cAreaY + left.cAreaH);
      ctx.stroke();

      // Right panel sweep
      const rightSweepX = right.cAreaX + sweepBarIdx * (right.cAreaW / 16);
      ctx.beginPath();
      ctx.moveTo(rightSweepX, right.cAreaY);
      ctx.lineTo(rightSweepX, right.cAreaY + right.cAreaH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Linkage indicator
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAME BAR', (leftSweepX + rightSweepX) / 2, left.cAreaY - 6);
    }

    // Footer caption — context-dependent
    const caption = tt < 0.5
      ? 'DXY rises \u2192 EURUSD falls. Inverse correlation.'
      : 'Read the reference to filter the primary.';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption, w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — WatchlistPruneAnim (S06 — Watchlist Discipline)
// 20 asset tickers visible. As animation progresses, 14 fade out
// (rejected) and 6 remain (kept). Each rejected ticker shows a brief
// "skip reason" callout. Final 6 are organized into role categories.
// ============================================================
function WatchlistPruneAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WATCHLIST PRUNE \u2014 20 ASSETS \u2192 6', w / 2, 22);

    // 20 assets with role categories
    const assets = [
      { sym: 'EURUSD', keep: true, role: 'Primary' },
      { sym: 'XAUUSD', keep: true, role: 'Secondary' },
      { sym: 'NAS100', keep: true, role: 'Secondary' },
      { sym: 'GBPUSD', keep: true, role: 'Watch' },
      { sym: 'USDJPY', keep: true, role: 'Watch' },
      { sym: 'DXY', keep: true, role: 'Reference' },
      { sym: 'AUDUSD', keep: false },
      { sym: 'NZDUSD', keep: false },
      { sym: 'USDCAD', keep: false },
      { sym: 'EURJPY', keep: false },
      { sym: 'GBPJPY', keep: false },
      { sym: 'BTCUSD', keep: false },
      { sym: 'ETHUSD', keep: false },
      { sym: 'SOLUSD', keep: false },
      { sym: 'TSLA', keep: false },
      { sym: 'AAPL', keep: false },
      { sym: 'NVDA', keep: false },
      { sym: 'OIL', keep: false },
      { sym: 'NATGAS', keep: false },
      { sym: 'COPPER', keep: false },
    ];

    // Grid layout — 5 columns, 4 rows
    const cols = 5;
    const rows = 4;
    const padX = 24;
    const padY = 48;
    const gridH = h - 90;
    const cellW = (w - 2 * padX) / cols;
    const cellH = gridH / rows;

    assets.forEach((asset, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padX + col * cellW + cellW / 2;
      const y = padY + row * cellH + cellH / 2;

      // Reveal phase
      const revealStart = i * 0.012;
      if (tt < revealStart) return;

      // Fade-out phase for non-kept
      const fadeOutStart = 0.40 + (i * 0.008);
      let opacity = 1;
      if (!asset.keep && tt > fadeOutStart) {
        opacity = Math.max(0.08, 1 - (tt - fadeOutStart) / 0.20);
      }

      // Box
      const boxW = cellW * 0.78;
      const boxH = cellH * 0.55;
      ctx.globalAlpha = opacity;

      const isKept = asset.keep;
      const roleColor = isKept
        ? asset.role === 'Primary' ? '#26A69A'
          : asset.role === 'Secondary' ? '#FFB300'
          : asset.role === 'Watch' ? 'rgba(255,255,255,0.7)'
          : 'rgba(255,255,255,0.5)'
        : 'rgba(255,255,255,0.4)';

      ctx.fillStyle = isKept ? `${roleColor}22` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
      ctx.strokeStyle = isKept ? roleColor : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = isKept ? 1.5 : 1;
      ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

      // Symbol
      ctx.fillStyle = isKept ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(asset.sym, x, y + 1);

      // Role label below for kept
      if (isKept && tt > 0.55) {
        const labelFade = Math.min(1, (tt - 0.55) / 0.20);
        ctx.fillStyle = roleColor;
        ctx.globalAlpha = opacity * labelFade;
        ctx.font = 'bold 7px system-ui, -apple-system, sans-serif';
        ctx.fillText(asset.role!.toUpperCase(), x, y + boxH / 2 + 10);
      }

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const caption = tt < 0.4
      ? 'A bloated watchlist is a leaky attention budget.'
      : tt < 0.6
      ? 'Each asset earns its slot or gets pruned.'
      : '6 assets, each with a defined role.';
    ctx.fillText(caption, w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — AlertArchitectureAnim (S07 — Alert Architecture)
// Alert pills appear on screen and get sorted into 4 categories:
// SIGNAL (cipher signals firing), LEVEL (price hitting key levels),
// VOLUME (volume spikes), REGIME (regime transitions). Pills slide
// from a central queue into their category buckets.
// ============================================================
function AlertArchitectureAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALERT ARCHITECTURE \u2014 4 CATEGORIES', w / 2, 22);

    // 4 category buckets along the bottom
    const categories = [
      { name: 'SIGNAL', desc: 'Cipher fires', color: '#26A69A' },
      { name: 'LEVEL', desc: 'Price at key', color: '#FFB300' },
      { name: 'VOLUME', desc: 'Surge', color: '#EF5350' },
      { name: 'REGIME', desc: 'Trend flip', color: 'rgba(255,255,255,0.6)' },
    ];

    const padX = 24;
    const bucketW = (w - 2 * padX - 24) / 4;
    const bucketH = 56;
    const bucketY = h - 80;
    const gap = 8;

    categories.forEach((cat, i) => {
      const x = padX + i * (bucketW + gap);

      // Bucket bg
      ctx.fillStyle = `${cat.color === '#26A69A' ? 'rgba(38, 166, 154, 0.10)'
        : cat.color === '#FFB300' ? 'rgba(255, 179, 0, 0.10)'
        : cat.color === '#EF5350' ? 'rgba(239, 83, 80, 0.10)'
        : 'rgba(255, 255, 255, 0.05)'}`;
      ctx.fillRect(x, bucketY, bucketW, bucketH);
      ctx.strokeStyle = cat.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, bucketY, bucketW, bucketH);

      // Category label
      ctx.fillStyle = cat.color;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cat.name, x + bucketW / 2, bucketY + 18);

      // Description
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(cat.desc, x + bucketW / 2, bucketY + 34);
    });

    // 8 alert pills — each routes to a category
    const alerts = [
      { name: 'EURUSD Pulse Cross', cat: 0, sourceX: 0.3 },
      { name: 'XAU 1.2k support', cat: 1, sourceX: 0.45 },
      { name: 'NAS Strong signal', cat: 0, sourceX: 0.55 },
      { name: 'BTC volume 3\u00D7', cat: 2, sourceX: 0.65 },
      { name: 'GBP S/R break', cat: 1, sourceX: 0.4 },
      { name: 'DXY regime flip', cat: 3, sourceX: 0.5 },
      { name: 'SPX TS reversal', cat: 0, sourceX: 0.6 },
      { name: 'Oil volume surge', cat: 2, sourceX: 0.7 },
    ];

    alerts.forEach((a, i) => {
      const startTime = i * 0.06;
      const endTime = startTime + 0.25;
      if (tt < startTime) return;

      const localT = Math.min(1, (tt - startTime) / (endTime - startTime));
      const easedT = easeInOut(localT);

      // Source position (top, scattered)
      const sourceY = 60;
      const sourceX = a.sourceX * w;

      // Target position (in bucket)
      const targetX = padX + a.cat * (bucketW + gap) + bucketW / 2;
      const targetY = bucketY + bucketH / 2 + 8;

      // Current position
      const x = sourceX + (targetX - sourceX) * easedT;
      const y = sourceY + (targetY - sourceY) * easedT;

      // Pill
      const pillW = 92;
      const pillH = 18;
      const cat = categories[a.cat];

      ctx.fillStyle = cat.color === '#26A69A' ? 'rgba(38, 166, 154, 0.20)'
        : cat.color === '#FFB300' ? 'rgba(255, 179, 0, 0.20)'
        : cat.color === '#EF5350' ? 'rgba(239, 83, 80, 0.20)'
        : 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(x - pillW / 2, y - pillH / 2, pillW, pillH);
      ctx.strokeStyle = cat.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - pillW / 2, y - pillH / 2, pillW, pillH);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name, x, y + 3);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Every alert has a category. Categories have triage protocols.', w / 2, h - 16);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — TriageStormAnim (S08 — Triaging the Alert Storm)
// 5 alerts arrive simultaneously at top. They cascade down a queue
// and each routes to one of three actions: ENGAGE (act now),
// WATCH (monitor for follow-up), SKIP (dismiss). Routing rules
// shown via the path each alert takes.
// ============================================================
function TriageStormAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE TRIAGE \u2014 5 ALERTS, 3 ACTIONS', w / 2, 22);

    // 5 alerts with their routes
    const alerts = [
      { name: 'EURUSD Strong Long', priority: 1, route: 'ENGAGE', reason: 'Primary, 4/4 conv' },
      { name: 'XAU 1.2k support', priority: 2, route: 'ENGAGE', reason: 'Primary, level hit' },
      { name: 'BTC vol surge 3\u00D7', priority: 3, route: 'WATCH', reason: 'Watch role, no signal' },
      { name: 'NAS Standard 2/4', priority: 4, route: 'SKIP', reason: 'Sub-threshold conviction' },
      { name: 'GBP regime flip', priority: 5, route: 'WATCH', reason: 'Reference, no setup yet' },
    ];

    // Three action buckets at bottom
    const actions = [
      { name: 'ENGAGE', desc: 'Act now', color: '#26A69A', x: 0.18 },
      { name: 'WATCH', desc: 'Monitor', color: '#FFB300', x: 0.50 },
      { name: 'SKIP', desc: 'Dismiss', color: '#EF5350', x: 0.82 },
    ];

    const bucketY = h - 70;
    const bucketW = 110;
    const bucketH = 42;

    actions.forEach((act) => {
      const x = act.x * w - bucketW / 2;
      const c = act.color === '#26A69A' ? 'rgba(38, 166, 154, 0.12)'
        : act.color === '#FFB300' ? 'rgba(255, 179, 0, 0.12)'
        : 'rgba(239, 83, 80, 0.12)';
      ctx.fillStyle = c;
      ctx.fillRect(x, bucketY, bucketW, bucketH);
      ctx.strokeStyle = act.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, bucketY, bucketW, bucketH);

      ctx.fillStyle = act.color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(act.name, x + bucketW / 2, bucketY + 18);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(act.desc, x + bucketW / 2, bucketY + 32);
    });

    // Alerts cascade down
    alerts.forEach((a, i) => {
      const startTime = 0.05 + i * 0.10;
      const endTime = startTime + 0.30;
      if (tt < startTime) return;

      const localT = Math.min(1, (tt - startTime) / (endTime - startTime));
      const easedT = easeInOut(localT);

      // Source: top, in a queue
      const sourceY = 50;
      const sourceX = w * 0.5;

      // Target: bucket position
      const action = actions.find((act) => act.name === a.route)!;
      const targetX = action.x * w;
      const targetY = bucketY + bucketH / 2;

      // Current position (curved path)
      const x = sourceX + (targetX - sourceX) * easedT;
      const yStraight = sourceY + (targetY - sourceY) * easedT;
      const arc = Math.sin(easedT * Math.PI) * 30;
      const y = yStraight - arc;

      // Pill
      const pillW = 130;
      const pillH = 22;
      const c = action.color === '#26A69A' ? 'rgba(38, 166, 154, 0.20)'
        : action.color === '#FFB300' ? 'rgba(255, 179, 0, 0.20)'
        : 'rgba(239, 83, 80, 0.20)';
      ctx.fillStyle = c;
      ctx.fillRect(x - pillW / 2, y - pillH / 2, pillW, pillH);
      ctx.strokeStyle = action.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - pillW / 2, y - pillH / 2, pillW, pillH);

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name, x, y - 1);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '7px system-ui, -apple-system, sans-serif';
      ctx.fillText(a.reason, x, y + 8);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Every alert is triaged. Most are not engagements.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — SessionTimelineAnim (S09 — Pre-Market Routine)
// Horizontal timeline with 4 phases: PRE-MARKET (15min before),
// OPEN (first 60min), MID-SESSION (sustained), CLOSE (last 30min).
// Each phase highlights with its activities. Cycles emphasis through
// each phase to teach the choreography.
// ============================================================
function SessionTimelineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE SESSION CHOREOGRAPHY', w / 2, 22);

    const phases = [
      { name: 'PRE-MARKET', dur: '15 min', activities: ['Check overnight news', 'Set chart roles', 'Verify alerts'] },
      { name: 'OPEN', dur: '60 min', activities: ['First-hour caution', 'Watch primary closely', 'Skip 2/4 signals'] },
      { name: 'MID-SESSION', dur: 'sustained', activities: ['Active scan + triage', 'Engage qualifying setups', 'Manage open trades'] },
      { name: 'CLOSE', dur: '30 min', activities: ['Stop new entries', 'Close intraday positions', 'Begin session review'] },
    ];

    const activeIdx = Math.floor(tt * 4);
    const phase = phases[activeIdx];
    const localT = (tt * 4) % 1;

    // Timeline bar
    const padX = 30;
    const tlY = 60;
    const tlH = 30;
    const tlW = w - 2 * padX;

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(padX, tlY, tlW, tlH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, tlY, tlW, tlH);

    // 4 phase segments on the timeline
    const widths = [0.15, 0.25, 0.40, 0.20];
    let cumW = 0;
    phases.forEach((p, i) => {
      const segX = padX + cumW * tlW;
      const segW = widths[i] * tlW;
      const isActive = i === activeIdx;

      ctx.fillStyle = isActive ? 'rgba(38, 166, 154, 0.25)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(segX, tlY, segW, tlH);
      ctx.strokeStyle = isActive ? '#26A69A' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(segX, tlY, segW, tlH);

      ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, segX + segW / 2, tlY + tlH * 0.45);

      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(p.dur, segX + segW / 2, tlY + tlH * 0.78);

      cumW += widths[i];
    });

    // Active phase detail card
    const cardY = tlY + tlH + 24;
    const cardX = padX;
    const cardW = w - 2 * padX;
    const cardH = h - cardY - 30;

    ctx.fillStyle = 'rgba(38, 166, 154, 0.08)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Phase title in card
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${phase.name} \u2014 ${phase.dur}`, cardX + 14, cardY + 22);

    // Activities list
    phase.activities.forEach((act, i) => {
      const revealStart = i * 0.20;
      if (localT < revealStart) return;
      const fade = Math.min(1, (localT - revealStart) / 0.15);

      const ay = cardY + 44 + i * 22;
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('\u25B8', cardX + 14, ay);

      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * fade})`;
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(act, cardX + 30, ay);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each phase has its own discipline. Knowing which phase you are in IS the discipline.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — DecisionUnderLoadAnim (S11 — Decision Protocol Under Load)
// A clock face ticks down from 30 seconds. Three signals fire
// simultaneously. The protocol routes them: priority order applied,
// engagement decisions made, capacity check enforced.
// ============================================================
function DecisionUnderLoadAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THREE SIGNALS \u2014 THIRTY SECONDS', w / 2, 22);

    // Clock at top-left
    const clockX = 60;
    const clockY = 80;
    const clockR = 32;
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
    ctx.stroke();

    // Clock hand sweeps
    const sweepProgress = Math.min(1, tt * 1.4);
    const angle = -Math.PI / 2 + sweepProgress * Math.PI * 2;
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(angle) * (clockR - 4), clockY + Math.sin(angle) * (clockR - 4));
    ctx.stroke();

    // Time remaining
    const remaining = Math.max(0, Math.round(30 * (1 - sweepProgress)));
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${remaining}s`, clockX, clockY + 5);

    // Capacity indicator (top-right)
    const capX = w - 90;
    const capY = 60;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPEN POSITIONS', capX, capY);

    // Three slot indicators — 1 already filled, 2 available
    for (let i = 0; i < 3; i++) {
      const slotX = capX + i * 22;
      const slotY = capY + 8;
      const isFilled = i === 0;
      ctx.fillStyle = isFilled ? '#26A69A' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(slotX, slotY, 18, 18);
      ctx.strokeStyle = isFilled ? '#26A69A' : 'rgba(255,255,255,0.20)';
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, 18, 18);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '8px system-ui, -apple-system, sans-serif';
    ctx.fillText('1/3 used', capX, capY + 38);

    // Three incoming signals
    const signals = [
      { name: 'EURUSD Strong Long', priority: 'PRIMARY', score: '4/4', action: 'ENGAGE', t0: 0.10 },
      { name: 'XAU 1.2k support', priority: 'PRIMARY', score: 'level', action: 'ENGAGE', t0: 0.20 },
      { name: 'GBP Standard Long', priority: 'WATCH', score: '2/4', action: 'SKIP', t0: 0.30 },
    ];

    const startY = 130;
    const rowH = 50;

    signals.forEach((sig, i) => {
      if (tt < sig.t0) return;
      const localT = Math.min(1, (tt - sig.t0) / 0.20);
      const y = startY + i * rowH;

      ctx.globalAlpha = localT;

      // Row container
      const rowX = 30;
      const rowW = w - 60;
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(rowX, y, rowW, rowH - 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rowX, y, rowW, rowH - 8);

      // Signal name
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(sig.name, rowX + 12, y + 18);

      // Priority + score
      ctx.fillStyle = sig.priority === 'PRIMARY' ? '#26A69A' : 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${sig.priority}  ${sig.score}`, rowX + 12, y + 32);

      // Action badge (right side)
      if (localT > 0.5) {
        const badgeFade = Math.min(1, (localT - 0.5) / 0.30);
        const badgeColor = sig.action === 'ENGAGE' ? '#26A69A'
          : sig.action === 'WATCH' ? '#FFB300' : '#EF5350';
        const badgeX = rowX + rowW - 90;
        const badgeY = y + 8;
        const badgeW = 78;
        const badgeH = rowH - 24;

        ctx.globalAlpha = localT * badgeFade;
        const bgC = sig.action === 'ENGAGE' ? 'rgba(38, 166, 154, 0.18)'
          : sig.action === 'WATCH' ? 'rgba(255, 179, 0, 0.18)'
          : 'rgba(239, 83, 80, 0.18)';
        ctx.fillStyle = bgC;
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

        ctx.fillStyle = badgeColor;
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sig.action, badgeX + badgeW / 2, badgeY + badgeH * 0.65);
      }

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mechanical routing beats deep analysis under time pressure.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — JournalEntryAnim (S13 — The Journal)
// A trade entry form with fields populating one by one. Asset,
// direction, entry, stop, TP1/2/3, conviction, mode, candle shade,
// notes. Each field arrives with its label. The form completes,
// then a "submit" pulse closes the entry.
// ============================================================
function JournalEntryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOURNAL ENTRY \u2014 ONE TRADE', w / 2, 22);

    // Form container
    const formX = 30;
    const formY = 50;
    const formW = w - 60;
    const formH = h - 90;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(formX, formY, formW, formH);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(formX, formY, formW, formH);

    // Form fields populate sequentially
    const fields = [
      { label: 'Asset', value: 'EURUSD 15m', t0: 0.05 },
      { label: 'Direction', value: 'LONG', t0: 0.13 },
      { label: 'Entry', value: '1.0865', t0: 0.21 },
      { label: 'Stop Loss', value: '1.0840 (Risk Map)', t0: 0.29 },
      { label: 'TP1 / TP2 / TP3', value: '1.0890 / 1.0915 / 1.0940', t0: 0.37 },
      { label: 'Conviction', value: '4/4 Strong + Sweep+FVG \u2605', t0: 0.45 },
      { label: 'Candle Shade', value: 'TEAL_DEEP (Trend Mode)', t0: 0.53 },
      { label: 'Notes', value: 'HTF aligned, 6-mod convergence', t0: 0.61 },
    ];

    const padX = formX + 20;
    const startY = formY + 24;
    const rowH = (formH - 60) / fields.length;

    fields.forEach((f, i) => {
      if (tt < f.t0) return;
      const localT = Math.min(1, (tt - f.t0) / 0.10);
      const y = startY + i * rowH;

      ctx.globalAlpha = localT;

      // Label
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(f.label.toUpperCase(), padX, y);

      // Value
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(f.value, padX, y + 14);

      // Underline
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, y + 22);
      ctx.lineTo(padX + formW - 40, y + 22);
      ctx.stroke();

      ctx.globalAlpha = 1;
    });

    // Submit pulse at the end
    if (tt > 0.75) {
      const submitT = (tt - 0.75) / 0.20;
      const pulse = 0.5 + 0.5 * Math.sin(submitT * Math.PI * 4);
      const submitY = formY + formH - 14;

      ctx.fillStyle = `rgba(38, 166, 154, ${0.20 + 0.30 * pulse})`;
      ctx.fillRect(formX, formY + formH - 28, formW, 28);
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2713 SAVED \u2014 ENTRY LOGGED', formX + formW / 2, submitY);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Capture the read at the moment, not after the result.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 12 — SoloVsTeamAnim (S14 — Solo vs Team Workflow)
// Two side-by-side workflow diagrams. Left: SOLO (one operator,
// one decision tree). Right: TEAM (two operators, signal-sharing
// protocol, shared journal). The diagrams show the additional
// coordination steps in the team flow.
// ============================================================
function SoloVsTeamAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SOLO VS TEAM WORKFLOW', w / 2, 22);

    // Two panels
    const panelW = (w - 50) / 2;
    const panelH = h - 80;
    const padX = 18;
    const padY = 48;

    // Left: SOLO
    const lX = padX;
    ctx.fillStyle = 'rgba(38, 166, 154, 0.05)';
    ctx.fillRect(lX, padY, panelW, panelH);
    ctx.strokeStyle = 'rgba(38, 166, 154, 0.30)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lX, padY, panelW, panelH);

    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SOLO', lX + panelW / 2, padY + 18);

    // Solo flow nodes
    const soloNodes = [
      { label: 'Alert fires', t0: 0.10 },
      { label: 'Triage (5s)', t0: 0.20 },
      { label: 'Engage / Watch / Skip', t0: 0.30 },
      { label: 'Manage', t0: 0.40 },
      { label: 'Journal', t0: 0.50 },
    ];

    soloNodes.forEach((n, i) => {
      if (tt < n.t0) return;
      const fade = Math.min(1, (tt - n.t0) / 0.10);
      const ny = padY + 40 + i * ((panelH - 50) / soloNodes.length);

      ctx.globalAlpha = fade;

      // Box
      const bx = lX + 16;
      const bw = panelW - 32;
      const bh = 24;
      ctx.fillStyle = 'rgba(38, 166, 154, 0.10)';
      ctx.fillRect(bx, ny, bw, bh);
      ctx.strokeStyle = '#26A69A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, ny, bw, bh);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, lX + panelW / 2, ny + 15);

      // Arrow to next
      if (i < soloNodes.length - 1) {
        ctx.strokeStyle = `rgba(38, 166, 154, ${fade * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lX + panelW / 2, ny + bh + 2);
        ctx.lineTo(lX + panelW / 2, ny + bh + 6);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });

    // Right: TEAM
    const rX = padX + panelW + 14;
    ctx.fillStyle = 'rgba(255, 179, 0, 0.05)';
    ctx.fillRect(rX, padY, panelW, panelH);
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.30)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rX, padY, panelW, panelH);

    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEAM (2)', rX + panelW / 2, padY + 18);

    // Team flow nodes — extra coordination steps
    const teamNodes = [
      { label: 'Alert fires', t0: 0.10 },
      { label: 'Triage (5s)', t0: 0.18 },
      { label: 'Notify partner', t0: 0.26, isExtra: true },
      { label: 'Engage / Watch / Skip', t0: 0.34 },
      { label: 'Confirm in shared log', t0: 0.42, isExtra: true },
      { label: 'Manage + journal', t0: 0.50 },
    ];

    teamNodes.forEach((n, i) => {
      if (tt < n.t0) return;
      const fade = Math.min(1, (tt - n.t0) / 0.08);
      const ny = padY + 40 + i * ((panelH - 50) / teamNodes.length);

      ctx.globalAlpha = fade;

      const bx = rX + 16;
      const bw = panelW - 32;
      const bh = 22;
      const bg = n.isExtra ? 'rgba(255, 179, 0, 0.18)' : 'rgba(255, 179, 0, 0.10)';
      ctx.fillStyle = bg;
      ctx.fillRect(bx, ny, bw, bh);
      ctx.strokeStyle = n.isExtra ? '#FFB300' : 'rgba(255, 179, 0, 0.6)';
      ctx.lineWidth = n.isExtra ? 1.5 : 1;
      ctx.strokeRect(bx, ny, bw, bh);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, rX + panelW / 2, ny + 14);

      if (i < teamNodes.length - 1) {
        ctx.strokeStyle = `rgba(255, 179, 0, ${fade * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rX + panelW / 2, ny + bh + 1);
        ctx.lineTo(rX + panelW / 2, ny + bh + 5);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Team adds coordination steps. The trade-off is communication overhead.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — UpgradeStaircaseAnim (S15 — Upgrade Path)
// A staircase visualization showing 1 chart → 2 charts → 4 charts
// → 6 charts as ascending steps. Each step has a "stage label"
// indicating what to add next. The current step highlights as the
// animation progresses, building from bottom to top.
// ============================================================
function UpgradeStaircaseAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE UPGRADE STAIRCASE \u2014 1 \u2192 6 CHARTS', w / 2, 22);

    // Staircase steps from bottom (1 chart) to top (6 charts)
    const steps = [
      { count: 1, label: '1 chart', detail: 'Primary only', t0: 0.10 },
      { count: 2, label: '2 charts', detail: 'Primary + reference', t0: 0.25 },
      { count: 4, label: '4 charts', detail: '+ secondary, watch', t0: 0.40 },
      { count: 6, label: '6 charts', detail: '+ HTF stack', t0: 0.55 },
    ];

    // Step layout — staircase rising from bottom-left to top-right
    const baseY = h - 50;
    const stepW = (w - 80) / steps.length;
    const stepHeight = (h - 100) / steps.length;
    const startX = 40;

    // Active step indicator
    const activeIdx = Math.min(steps.length - 1, Math.floor((tt - 0.10) * steps.length / 0.50));

    steps.forEach((s, i) => {
      if (tt < s.t0) return;
      const localT = Math.min(1, (tt - s.t0) / 0.12);
      const x = startX + i * stepW;
      const y = baseY - (i + 1) * stepHeight;
      const stepW2 = stepW;
      const stepH2 = stepHeight * (i + 1);

      ctx.globalAlpha = localT;

      const isActive = i === activeIdx;

      // Step bg
      ctx.fillStyle = isActive ? 'rgba(38, 166, 154, 0.18)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x, y, stepW2, stepH2);
      ctx.strokeStyle = isActive ? '#26A69A' : 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, stepW2, stepH2);

      // Mini chart icons inside step — count grows with step level
      const iconSize = 10;
      const iconGap = 4;
      const iconsPerRow = 2;
      for (let j = 0; j < s.count; j++) {
        const ix = x + 12 + (j % iconsPerRow) * (iconSize + iconGap);
        const iy = y + 12 + Math.floor(j / iconsPerRow) * (iconSize + iconGap);
        ctx.fillStyle = isActive ? '#26A69A' : 'rgba(255, 255, 255, 0.30)';
        ctx.fillRect(ix, iy, iconSize, iconSize);
      }

      // Label (right side of step)
      ctx.fillStyle = isActive ? '#26A69A' : 'rgba(255, 255, 255, 0.55)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(s.label, x + stepW2 - 8, y + 18);

      // Detail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(s.detail, x + stepW2 - 8, y + 32);

      ctx.globalAlpha = 1;
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add one step at a time. Master each before climbing.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// GAME & QUIZ DATA SHELLS — populated in Phase 3A
// 5 game rounds × 4 options = 20 options, 5 correct
// 8 quiz questions × 4 options = 32 options, 8 correct
// Total: 52 options, 13 correct: true (locked metric)
// ============================================================
const gameRounds: { id: string; scenario: string; prompt: string; options: { id: string; text: string; correct: boolean; explain: string }[] }[] = [
  {
    id: 'round-1',
    scenario: '14:32. Three alerts fire within 20 seconds. (1) EURUSD primary chart \u2014 Strong Long 4/4 with Sweep+FVG \u2605. (2) XAUUSD secondary \u2014 1.2k support hit (level alert, no signal yet). (3) DXY reference \u2014 regime flip to BULL TREND. You currently have 2 of 3 max positions open.',
    prompt: 'How does the triage protocol route these three alerts?',
    options: [
      {
        id: 'a',
        text: 'Engage all three \u2014 the convergence demands aggression',
        correct: false,
        explain: 'The DXY alert is a Reference role, which almost never produces direct engagements. The XAUUSD alert is a level hit with no signal &mdash; it routes to Watch, not Engage. And capacity matters: at 2/3 open, only one Engage slot remains. Engaging all three violates priority order, capacity, and the role hierarchy.',
      },
      {
        id: 'b',
        text: 'Engage EURUSD only \u2014 priority 1 with full qualification, capacity allows it. Watch XAUUSD for follow-through. DXY informs context but does not engage.',
        correct: true,
        explain: 'Correct. Priority order: Primary first (EURUSD). Capacity check: 1 slot available, 1 candidate qualifies. Qualification gates: Strong + apex tag + reference agrees (DXY bull trend supports a long EUR setup) = full qualification, full size. XAUUSD level hit without signal = Watch (monitor for follow-through). DXY regime flip = informs but does not engage. Three alerts, one engagement, two watches.',
      },
      {
        id: 'c',
        text: 'Engage XAUUSD because the support level is rare and may not return',
        correct: false,
        explain: 'A level hit is not a signal. The triage qualification gates require synthesis score &ge; 3, candle alignment, and HTF context. A level alert by itself fails the synthesis gate. The level becomes interesting when CIPHER fires a signal AT the level &mdash; until then, it is Watch territory.',
      },
      {
        id: 'd',
        text: 'Skip all three \u2014 too many alerts at once is a sign to step back',
        correct: false,
        explain: 'Three alerts in 20 seconds is exactly what the triage protocol exists for. Skipping all three forfeits the qualified Strong signal. The protocol is fast precisely so it can handle multi-alert scenarios cleanly. The discipline is in mechanical routing, not in withdrawal.',
      },
    ],
  },
  {
    id: 'round-2',
    scenario: 'You currently run 4 charts: NAS100 1H (primary), XAUUSD 1H (secondary), GBPUSD 1H (watch), DXY 1H (reference). After 30 sessions you note that XAUUSD has produced only 2 tradeable setups while NAS100 has produced 18, and GBPUSD has produced 0.',
    prompt: 'What is the right adjustment based on the watchlist discipline framework?',
    options: [
      {
        id: 'a',
        text: 'Demote XAUUSD from secondary to watch role; prune GBPUSD entirely; consider promoting a different watch candidate',
        correct: true,
        explain: 'Correct. The framework rule is &quot;at least one tradeable setup per week.&quot; Over 30 sessions, XAUUSD&apos;s 2 setups falls below threshold &mdash; demotion to watch is appropriate. GBPUSD&apos;s 0 setups means it is not earning its slot &mdash; prune. NAS100&apos;s 18 setups confirms its primary status. The empty slot from pruning GBPUSD opens a slot for promoting a new candidate based on which assets have shown setup-producing activity recently.',
      },
      {
        id: 'b',
        text: 'Keep all four charts \u2014 30 sessions is too short to evaluate, give them another 30',
        correct: false,
        explain: '30 sessions is the framework&apos;s explicit review window. Waiting longer is not patience; it is sticking with assets that have already failed the productivity threshold. The framework is calibrated to catch dead weight at 30 sessions specifically.',
      },
      {
        id: 'c',
        text: 'Add 4 more assets so the bottom of the watchlist has more depth',
        correct: false,
        explain: 'This is the bloated watchlist failure mode (Mistake 2). Adding instruments without pruning never fixes a watchlist problem &mdash; it dilutes attention further. The discipline is curate first, expand only after pruning. One in, one out.',
      },
      {
        id: 'd',
        text: 'Replace NAS100 with XAUUSD because diversification is more important than productivity',
        correct: false,
        explain: 'Diversification at the cost of productivity defeats the watchlist&apos;s purpose. NAS100 is producing 18 tradeable setups &mdash; that is your edge concentration. Demoting your strongest asset to chase diversification trades current edge for theoretical edge. The framework rewards proven productivity.',
      },
    ],
  },
  {
    id: 'round-3',
    scenario: 'You are 5 minutes before session start. Overnight you slept poorly and feel mentally fogged. You scan the news quickly &mdash; nothing material. You check the chart layout &mdash; loaded correctly. You verify alerts &mdash; 9 active. The HTF read on your primary shows a clean setup developing.',
    prompt: 'The pre-market routine has flagged poor mental state. What does the framework say to do?',
    options: [
      {
        id: 'a',
        text: 'Trade the session normally \u2014 the setup is too clean to skip',
        correct: false,
        explain: 'This is the failure mode the mental state check exists to catch. Trading while cognitively impaired produces worse decisions than skipping. The clean setup will produce another one tomorrow when you are sharp; the cost of trading while fogged is potentially much greater than the missed setup.',
      },
      {
        id: 'b',
        text: 'Reduce engagement capacity to 1 max instead of normal 3, and run the session with extra protocol rigor',
        correct: true,
        explain: 'Correct. Poor mental state does not require aborting entirely &mdash; it requires calibrating the engagement capacity downward. Capping at 1 trade preserves the ability to act on the cleanest signal while protecting against the multi-position management bandwidth that requires sharper cognition. Pair with extra protocol rigor (no protocol skipping under fatigue) to compensate.',
      },
      {
        id: 'c',
        text: 'Abort the session entirely \u2014 any cognitive impairment is disqualifying',
        correct: false,
        explain: 'Aborting is the right answer for severe cognitive impairment (drunk, severely sleep-deprived, on tilt from yesterday). Mild fogginess is more nuanced &mdash; capacity reduction is the calibrated response. The framework distinguishes between &quot;reduce capacity&quot; and &quot;abort&quot;; conflating them either over-trades or over-restricts.',
      },
      {
        id: 'd',
        text: 'Skip the routine since you already feel off, and just monitor passively',
        correct: false,
        explain: 'Skipping the routine compounds the problem. The routine is what catches mental state issues in the first place. Passive monitoring without the routine&apos;s structure leads to impulsive engagement when something looks interesting &mdash; precisely when you should be most disciplined. Run the routine, then calibrate capacity based on what it surfaced.',
      },
    ],
  },
  {
    id: 'round-4',
    scenario: 'You are currently running 6 charts (the full prosumer war room). Over the last 10 sessions: missed 4 setups you would normally have caught, made 3 impulse engagements on 2/4 conditions, P&L is down 8% from your baseline, and you feel tired by mid-session.',
    prompt: 'The journal data is showing degradation. What is the framework&apos;s response?',
    options: [
      {
        id: 'a',
        text: 'Push through \u2014 a 10-session bad streak is normal variance',
        correct: false,
        explain: 'The combination of missed setups, impulse engagements, and mid-session fatigue is not random variance &mdash; it is a degradation signature. The framework explicitly addresses this: when you observe these symptoms, downgrade the war room temporarily. Variance is random; degradation has a pattern. This is degradation.',
      },
      {
        id: 'b',
        text: 'Add more alerts to catch the missed setups',
        correct: false,
        explain: 'Adding alerts to a war room that is already overloading the operator is the wrong direction. The missed setups are not an alert problem &mdash; they are a cognitive bandwidth problem. More alerts increases load; the cure for cognitive overload is reducing surface area, not expanding it.',
      },
      {
        id: 'c',
        text: 'Downgrade temporarily to 2-3 charts for 10 sessions, re-establish discipline at the lower count, then climb back up',
        correct: true,
        explain: 'Correct. The upgrade staircase explicitly accommodates downgrade. The symptoms (missed setups, impulse engagements, mid-session fatigue) indicate the operator is over their cognitive capacity at 6 charts. Downgrading to 2-3 reduces the load, re-establishes the protocol-following baseline, and then the operator climbs back up gradually. Cycling between stages is healthy; staying at a stage where you are drowning is not.',
      },
      {
        id: 'd',
        text: 'Increase position size on the remaining engagements to make up the P&L',
        correct: false,
        explain: 'Increasing size to recover P&amp;L is the &quot;trade your way out&quot; failure mode. Sizing up while making impulse engagements compounds losses. The size cap exists precisely to prevent recovery-mode behavior. P&amp;L recovers via better decisions, not larger ones.',
      },
    ],
  },
  {
    id: 'round-5',
    scenario: 'You and a partner trade together. You both watch EURUSD as primary. You see a 4/4 Strong setup fire on EURUSD; you ping your partner. Your partner says they see the same signal but read it as 3/4 (they think one factor borderline-failed). You disagree on the score.',
    prompt: 'How does the team workflow framework resolve this?',
    options: [
      {
        id: 'a',
        text: 'Defer to the higher-conviction read \u2014 trade as 4/4 since one of you sees it that way',
        correct: false,
        explain: 'Deferring upward biases the team toward over-engagement. The optimistic read always wins, the cautious read gets overruled, and over time the team trades larger-than-conviction-justified positions. The team workflow does not reward optimism asymmetrically.',
      },
      {
        id: 'b',
        text: 'Defer to the lower-conviction read \u2014 trade as 3/4 since one of you sees it that way',
        correct: false,
        explain: 'Always deferring downward is also a bias. The cautious read always wins, the optimistic read gets overruled. Like the symmetric case, this also produces systematic miscalibration over time. Neither asymmetric defer is the answer.',
      },
      {
        id: 'c',
        text: 'Each operator decides individually based on their own read \u2014 you trade your 4/4, partner trades their 3/4 (or skips), decision authority stays solo',
        correct: true,
        explain: 'Correct. The framework explicitly states decision authority stays individual even on a team. Information flows freely (you both saw the signal, you both shared your reads), but the engagement decision is each operator&apos;s own. You size on your 4/4 read; partner sizes on their 3/4 read or routes to Watch. Both are valid. Individual responsibility for individual P&amp;L preserves both operators&apos; calibration over time.',
      },
      {
        id: 'd',
        text: 'Discuss for 2-3 minutes until you reach consensus, then trade the consensus score',
        correct: false,
        explain: 'A signal that requires multi-minute team discussion is a signal that is past its entry window. The synthesis tooltip captures the read at the close of the qualifying bar; entries 2-3 minutes later have a different risk profile. Team discussion delays the engagement; individual authority preserves the timing.',
      },
    ],
  },
];

const quizQuestions: { id: string; question: string; options: { id: string; text: string; correct: boolean }[]; explain: string }[] = [
  {
    id: 'q1',
    question: 'What are the four chart roles in the war room framework?',
    options: [
      { id: 'a', text: 'Long, Short, Watch, Reference', correct: false },
      { id: 'b', text: 'Primary, Secondary, Watch, Reference', correct: true },
      { id: 'c', text: 'Active, Passive, Setup, Context', correct: false },
      { id: 'd', text: 'Bull, Bear, Range, Compression', correct: false },
    ],
    explain: 'The four roles are Primary (active engagement, ~50% attention), Secondary (correlated/alt, ~25%), Watch (alerted-only, ~15%), and Reference (context-only, ~10%). Each role gets a different attention budget and a different preset configuration.',
  },
  {
    id: 'q2',
    question: 'What is the median configuration for the prosumer war room?',
    options: [
      { id: 'a', text: '1 monitor, 2 charts, 1 asset, 3 alerts', correct: false },
      { id: 'b', text: '1-2 monitors, 4-6 charts, 2-4 assets, 5-15 alerts', correct: true },
      { id: 'c', text: '3 monitors, 9 charts, 6 assets, 25 alerts', correct: false },
      { id: 'd', text: '4 monitors, 16 charts, 10 assets, 50 alerts', correct: false },
    ],
    explain: 'The framework calibrates the prosumer median at 1-2 monitors, 4-6 charts, 2-4 assets, and 5-15 active alerts. This range allows meaningful attention on each surface while remaining sustainable across full sessions. Operators below this scale build toward it; operators above periodically prune back to it.',
  },
  {
    id: 'q3',
    question: 'In the HTF/LTF stack, what is the typical timeframe ladder for an intraday trader?',
    options: [
      { id: 'a', text: '1D / 4H / 1H / 30m', correct: false },
      { id: 'b', text: '4H / 1H / 15m / 5m', correct: true },
      { id: 'c', text: '1H / 30m / 5m / 1m', correct: false },
      { id: 'd', text: '1W / 1D / 4H / 1H', correct: false },
    ],
    explain: 'The intraday HTF/LTF stack runs 4H (macro context) / 1H (setup zone) / 15m (entry timing) / 5m (execution). Each step zooms in by ~4x. Swing traders use D/4H/1H/15m (one step higher). Position traders use W/D/4H/1H. Scalpers use 1H/15m/5m/1m. Same principle, different absolute timeframes.',
  },
  {
    id: 'q4',
    question: 'What are the four alert categories?',
    options: [
      { id: 'a', text: 'Buy, Sell, Hold, Watch', correct: false },
      { id: 'b', text: 'Long, Short, Stop, Target', correct: false },
      { id: 'c', text: 'Signal, Level, Volume, Regime', correct: true },
      { id: 'd', text: 'Strong, Standard, Apex, Skip', correct: false },
    ],
    explain: 'The four categories are Signal (CIPHER itself fires), Level (price hits a tracked S/R or pivot), Volume (unusual volume on a watched asset), and Regime (a regime transition such as TREND CURVING or RANGE BREAK). Every alert names its category in the format ASSET-CATEGORY-DETAIL.',
  },
  {
    id: 'q5',
    question: 'In the triage protocol, what is the priority order for routing alerts?',
    options: [
      { id: 'a', text: 'Whichever alert fired first', correct: false },
      { id: 'b', text: 'Primary &rarr; Secondary &rarr; Watch &rarr; Reference', correct: true },
      { id: 'c', text: 'Highest score first regardless of role', correct: false },
      { id: 'd', text: 'By asset alphabetical order', correct: false },
    ],
    explain: 'When multiple signals fire under load, route in role priority order: Primary first, Secondary second, Watch third, Reference last. This eliminates the FOMO trap of engaging on whichever signal is loudest at the moment. The hierarchy was set during pre-market; honor it under load.',
  },
  {
    id: 'q6',
    question: 'What is the recommended duration of the pre-market routine?',
    options: [
      { id: 'a', text: '5 minutes', correct: false },
      { id: 'b', text: '15 minutes', correct: true },
      { id: 'c', text: '30 minutes', correct: false },
      { id: 'd', text: '60 minutes', correct: false },
    ],
    explain: 'The pre-market routine is 15 minutes covering five 3-minute steps: overnight news scan, chart role review, alert verification, HTF read, and mental state check. The 5-minute shortcut version is worse than skipping it entirely &mdash; it produces false confidence without doing the actual work. Either commit 15 minutes or acknowledge you skipped.',
  },
  {
    id: 'q7',
    question: 'When should a journal entry be captured?',
    options: [
      { id: 'a', text: 'After the trade closes, when the result is known', correct: false },
      { id: 'b', text: 'At the moment of the engagement decision, before the trade resolves', correct: true },
      { id: 'c', text: 'At the end of the trading session, in batch', correct: false },
      { id: 'd', text: 'Weekly, during the weekly review', correct: false },
    ],
    explain: 'Capture at the moment of the decision, in low-friction format. The entry captures the read that justified the engagement. Entries written after the result are corrupted by hindsight &mdash; you remember what worked, you forget what you actually saw. Result fields are added at trade close, but the original entry is never edited.',
  },
  {
    id: 'q8',
    question: 'In the upgrade staircase, what is the recommended approach for an operator currently running 1 chart who wants to scale up?',
    options: [
      { id: 'a', text: 'Jump directly to 6 charts to maximize coverage immediately', correct: false },
      { id: 'b', text: 'Add charts incrementally: 1 &rarr; 2 (+ reference) &rarr; 4 (+ secondary, watch) &rarr; 6 (+ HTF stack), with 20-50 sessions per stage', correct: true },
      { id: 'c', text: 'Stay at 1 chart permanently \u2014 simpler is always better', correct: false },
      { id: 'd', text: 'Run 1 chart on the primary monitor and 6 charts on the secondary monitor in parallel', correct: false },
    ],
    explain: 'The upgrade staircase is incremental: 1 (Primary only) &rarr; 2 (+ Reference) &rarr; 4 (+ Secondary, Watch) &rarr; 6 (+ HTF stack). 20-50 sessions per stage. Each stage&apos;s value comes from its mastery, not its existence. Skipping stages produces a poorly-understood war room that overwhelms the operator. Cycling between stages based on cognitive capacity is healthy.',
  },
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherWarRoomIntegrationPage() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Game state
  const [gameRoundIdx, setGameRoundIdx] = useState(0);
  const [gameSelected, setGameSelected] = useState<string | null>(null);
  const [gameAnswered, setGameAnswered] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Cert
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (quizComplete && gameComplete && quizScore >= 6 && !certUnlocked) {
      setCertUnlocked(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [quizComplete, gameComplete, quizScore, certUnlocked]);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen relative overflow-x-hidden">
      <Confetti active={showConfetti} />

      {/* Scroll progress bar — SSG-safe guard */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-accent-400"
          style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }}
        />
      </div>

      {/* Top nav back-link */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/academy" className="text-xs tracking-widest uppercase text-gray-500 hover:text-white transition">
            &larr; Academy
          </Link>
          <span className="text-xs tracking-widest uppercase text-amber-400/60">Level 11 &middot; Lesson 24</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* HERO */}
      {/* ============================================================ */}
      <motion.section
        style={{ opacity: heroOpacity }}
        initial="hidden"
        animate="show"
        variants={stagger}
        className="max-w-2xl mx-auto px-5 pt-20 pb-16"
      >
        <motion.div variants={fadeUp} className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Operations Arc Begins &middot; War Room Operator
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
          Cipher War Room<br />
          <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
            The desk choreography IS the edge.
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-base text-gray-400 leading-relaxed mb-8">
          The Visual Layer arc taught you what to read. The Operations arc teaches how to operate the read at scale. Two operators with identical Pine knowledge produce different P&amp;L because their war room discipline differs. This lesson is the choreography &mdash; how to lay out charts, set alerts, run a session, triage signals, and review your work without breaking flow.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] p-1 mb-8">
          <WarRoomLayoutAnim />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-gray-500">
          <span>17 sections</span>
          <span className="text-white/20">&middot;</span>
          <span>13 animations</span>
          <span className="text-white/20">&middot;</span>
          <span>~28 min read</span>
        </motion.div>
      </motion.section>

      {/* ============================================================ */}
      {/* S00 — First, Why This Matters */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">First, Why This Matters</p>
        <h2 className="text-2xl font-extrabold mb-4">The Pine knowledge sets the ceiling. The workflow sets the floor.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Across the Visual Layer arc you learned six sensory modules, the synthesis layer that reads them as one, and the candle rendering that lifts the read off the panel and onto the bars. By every measurable criterion, you have the analytical capability of a working trader. And yet, set down at a real desk in front of real markets, the gap between capability and consistent execution is enormous. That gap is workflow.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The market does not pay for knowledge. It pays for executed decisions made at the right time, on the right charts, with the right size, recovered from when wrong, and journaled afterward. Every step of that sentence is workflow. Two operators with identical Pine fluency, identical conviction-tier sizing, identical candle reads, will produce wildly different P&amp;L if one runs a disciplined desk and the other improvises. The system is the same; the operating environment differs.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">CAPABILITY VS EXECUTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Capability is what you can do at peak focus on a single chart you have already analyzed. Execution is what you actually do across multiple charts, under time pressure, when several setups fire simultaneously, while you are tired or distracted. The Visual Layer arc built capability. This lesson builds the environment that lets capability become execution.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS IS A CAPSTONE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              This lesson does not introduce new Pine concepts. It introduces no new modules, no new scores, no new shades. What it does is consolidate everything you already know into a working day. From here forward, every remaining lesson assumes you can read the panel, decode the candles, score conviction, AND operate a real desk. The Operations arc&apos;s premise is that the desk is part of the system.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WORKFLOW IS LEARNABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Some operators believe workflow discipline is innate &mdash; that good traders have it and bad traders do not. False. Workflow is a set of routines, written down, practiced for sessions, and adjusted from journal data. The operator who writes their workflow and follows it for 30 sessions outperforms the operator with 10x more capability who improvises. This lesson is the starter template.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT CHANGES WHEN YOU LEARN THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before this lesson, your sessions vary based on mood, market energy, and which charts caught your eye that morning. After this lesson, your sessions follow a structure: pre-market routine, defined chart roles, alerted triage, scheduled review. The variance in your P&amp;L drops because the variance in your inputs drops. Capability stays the same; consistency rises.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">A CALIBRATION WARNING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The war room described in this lesson is calibrated for the typical prosumer trader &mdash; one or two monitors, four to six active charts, a focused watchlist, moderate alert use. If you currently trade on one chart with no alerts, this lesson will look like an upgrade target rather than a current state. Build toward it gradually. If you currently run twelve charts on three monitors with sixty alerts, this lesson will look minimal. Strip down to the principles, then re-add what your scale actually needs.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PRINCIPLES OUTLAST THE SCALE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Whether you trade one chart or twelve, the principles are identical: charts have explicit roles, alerts have specific purposes, sessions have phases, decisions follow protocols, and trades get journaled. The number of charts is operator-specific; the discipline is universal. Read the lesson with that frame: principles first, scale second.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Capability is the ceiling, workflow is the floor. The Visual Layer set your ceiling; this lesson sets your floor. The two together produce the realized P&amp;L band you actually trade in.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S01 — The Groundbreaking Concept */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Groundbreaking Concept</p>
        <h2 className="text-2xl font-extrabold mb-4">The desk choreography IS the edge.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Most operators believe their edge lives inside the indicator &mdash; the signal logic, the conviction score, the candle gradient. Some of it does. But a comparable share lives in the desk: how the charts are arranged, which alerts fire, how sessions are structured, how decisions get triaged when multiple things happen at once. Two traders with identical CIPHER reads will produce different outcomes if one runs the desk like a surgeon and the other runs it like a tourist.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Choreography is the right word. A choreographer plans the sequence, the timing, the spatial relationships, the recoveries when something goes wrong. A workflow operator does the same with charts, alerts, and decision routines. Practiced sequences are faster than improvised ones. They are also less prone to error under pressure. When the market moves fast, the operator running a choreographed routine executes; the improviser hesitates, second-guesses, or chases.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <WorkflowVsSignalAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE SIGNAL CHASER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reacts to whatever is loudest at the moment. Every alert demands attention; every chart movement is potentially actionable. No predefined chart roles, no triage protocol, no session structure. Each setup is evaluated in isolation, no batched routine. P&amp;L is volatile because the inputs are volatile. The signal chaser&apos;s skill ceiling is high; their floor is the worst session they ever had.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE WORKFLOW OPERATOR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reacts to a checklist. Pre-market routine sets the day. Defined chart roles direct attention. Alerts fire only on conditions worth triaging. Decision protocol governs what to engage and what to pass. Session-end review captures what happened. P&amp;L is steadier because the inputs are filtered. The workflow operator&apos;s skill ceiling is the same as the signal chaser&apos;s; their floor is much higher.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SAME SIGNALS, DIFFERENT OUTCOMES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Both operators see the same Pulse Crosses, the same Tension Snaps, the same conviction tiers. The CIPHER signals do not change. What changes is which signals get acted on, how fast, with what size, and what happens after. The workflow filters and amplifies; chasing dilutes and overreacts. Over a month of sessions, the cumulative gap is the edge.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">CHOREOGRAPHY IS PRACTICED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A choreographer drills sequences until they are automatic. The dancer thinks about expression, not steps. The workflow operator drills routines until pre-market check, chart layout review, alert triage, journal entry happen without conscious effort. Cognitive bandwidth then goes to the read &mdash; which is where it should have been all along.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE EDGE COMPOUNDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each piece of workflow discipline adds a small edge. A defined chart layout saves 10 seconds per setup evaluation. Alert triage filters out 40% of what would have been distractions. Pre-market routine catches conditions you would have missed mid-session. Individually small. Compounded across hundreds of sessions, the difference between a marginal P&amp;L and a strong one.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE STARTER TEMPLATE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The rest of this lesson is a workflow template you can use as-is or modify. The chart roles, alert architecture, session phases, and decision protocol are all calibrated for the prosumer trader. Read once, adopt the parts that fit, run for 20 sessions, then adjust based on what your journal shows. The template is not sacred; the discipline of running A template &mdash; any template, written down &mdash; is.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The choreography is the edge. Practice the routine until it is automatic, then put your cognitive bandwidth on the read. Workflow operators outperform signal chasers because their floor is higher.
          </p>
        </div>
      </section>


      {/* ============================================================ */}
      {/* S02 — The General War Room */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The General War Room</p>
        <h2 className="text-2xl font-extrabold mb-4">One or two monitors. Four to six charts. Four roles.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The war room described in this lesson is calibrated for the typical prosumer trader. One or two monitors. Four to six active charts during a session. Two to four assets actively scanned. Five to fifteen alerts. Solo operation. This is not the only valid configuration &mdash; institutional desks run nine charts on three monitors, and full-time discretionary traders sometimes run fewer than four. The configuration described here is the realistic median.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The principles are scale-invariant. Whether you run one chart or twelve, you assign roles to each chart, you set alerts with explicit purpose, you organize sessions into phases, and you triage decisions when multiple things happen at once. This section establishes the median configuration; subsequent sections drill into each principle. Operators below this scale (one or two charts) read the lesson as an upgrade target. Operators above (eight-plus charts) read it as the foundation their larger setup extends from.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">MONITOR ASSUMPTIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              One monitor is the floor &mdash; a 27-inch or larger display can fit a 2x2 four-chart grid comfortably. Two monitors is the comfortable working setup &mdash; four charts on the primary, two on the secondary, plus space for the journal or a news feed. Three-plus monitors is for operators trading multiple asset classes simultaneously and is outside the median configuration this lesson describes.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CHART COUNT ASSUMPTIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Four charts is the minimum for a meaningful war room. Three charts feels cramped; you cannot fit primary, secondary, watch, and reference roles. Six charts is the comfortable upper end for a single monitor &mdash; beyond that, individual charts become too small to read individual candles cleanly. The lesson uses four-pane layouts as the canonical example because the scaling principles are clearest there.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ASSET COUNT ASSUMPTIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Two to four assets actively scanned is the realistic working set for a focused trader. One asset is a specialist&apos;s configuration. Five-plus assets is institutional or specialized scalper territory. The middle range allows the operator to internalize each asset&apos;s personality &mdash; how it moves, what its quiet hours look like, how it responds to news &mdash; without stretching attention thin.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ALERT COUNT ASSUMPTIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Five to fifteen active alerts at any time. Below five and you are not really using alerts &mdash; you are watching every chart manually. Above fifteen and the alerts become noise &mdash; you stop reading each one carefully. The middle range is selective enough to matter, focused enough to triage. Alert architecture in S07 details what each alert should be for.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SOLO BY DEFAULT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The lesson assumes solo operation. Most retail traders work alone; most prosumer traders work alone. Two-trader workflows have additional considerations &mdash; coordination, communication, signal-sharing protocols &mdash; covered briefly in S14. The core lesson teaches the solo-operator template; multi-trader workflows are an extension, not the foundation.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS PROFILE WORKS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The four-to-six-chart, two-to-four-asset operator can give meaningful attention to each surface they are watching. The operator running twelve charts and ten assets cannot &mdash; their attention is necessarily superficial on most of them, with deep focus reserved for whichever fires loudest. Both can profit, but the median operator&apos;s configuration is calibrated for sustainable attention rather than maximum surveillance.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCALING UP, SCALING DOWN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Operators currently below this profile (one or two charts) build toward it gradually &mdash; add a chart, observe what changes, add another only after the first feels integrated. Operators currently above it (eight-plus charts) periodically prune back to the median to recheck whether the extra surfaces are earning their attention. Both directions are healthy adjustments. Sticking at any size without periodic review is the failure mode.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The median configuration is one or two monitors, four to six charts, two to four assets, five to fifteen alerts. Read the lesson at this scale; adjust to your own once the principles are internalized.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S03 — Chart Roles */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Chart Roles</p>
        <h2 className="text-2xl font-extrabold mb-4">Primary, Secondary, Watch, Reference. Four roles, distinct attention budgets.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Every chart in the war room has a role. The role determines how much attention the chart gets, what kind of signals on it warrant action, and whether the operator engages directly or just notes the read. Without explicit roles, every chart competes for attention equally &mdash; which means whichever chart is loudest at the moment wins, regardless of whether it should.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The four-role system works for most prosumer setups. Primary is where most trades fire. Secondary is the backup, the correlated alternative, the second-favorite asset. Watch is alerted-only &mdash; you are not actively reading these charts, but you have alerts set so they can flag themselves when they need attention. Reference is context-only &mdash; DXY when trading EUR pairs, VIX when trading equities, BTC when trading altcoins. Reference charts provide regime backdrop and rarely produce direct trades.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ChartRolesAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PRIMARY &middot; ACTIVE ENGAGEMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The chart you watch most actively, the asset you know best, the timeframe where most of your edge fires. Primary gets your closest read, your tightest alert net, and your largest position sizes when setups fire. Most operators have one or two primary charts &mdash; rotating between them based on which is in a tradeable session window. Primary is where your edge concentrates.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SECONDARY &middot; BACKUP / CORRELATED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The second-best chart, often a correlated asset (XAU/USD when primary is EUR/USD; NAS when primary is SPX) or a related instrument (gold futures next to spot gold). Secondary charts get medium attention &mdash; you read them, you take setups when they fire, but you are not constantly scanning them. When primary is quiet, attention naturally rotates to secondary.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WATCH &middot; ALERTED-ONLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Charts you are not actively reading but have alerts set on. The point of the watch role is coverage without cognitive load &mdash; you let the alerts flag the chart when it produces a tradeable signal, then evaluate. Without alerts, watch charts become distractions; with alerts, they become opportunistic surfaces. Most operators have one to three watch charts.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REFERENCE &middot; CONTEXT-ONLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Charts you read for regime context but rarely trade directly. DXY when trading any USD pair. VIX when trading equities. BTC when trading alts. SPY/QQQ when trading individual US stocks. Reference charts answer the question &quot;what is the macro backdrop?&quot; They rarely produce trades themselves; they shape how aggressively you trade primaries and secondaries.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ATTENTION BUDGET DISTRIBUTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A rough budget: 50% of attention on primary, 25% on secondary, 15% on watch (mostly when alerts fire), 10% on reference (mostly during pre-market and at regime-shift transitions). The exact percentages adjust to your style, but the ordinal hierarchy is universal &mdash; primary gets more than secondary, secondary more than watch, watch more than reference.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ROLES ARE NOT FIXED FOREVER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Roles rotate. The asset that was secondary last month becomes primary this month if your edge there improves. The reference that was just context becomes a watch when its session window opens. Roles are deliberate, not permanent. Re-evaluate every 20-30 sessions: are these the right roles for the current market and your current edge?
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">VISUAL HIERARCHY ON THE LAYOUT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Primary chart goes in the most prominent position &mdash; top-left of the grid, or whichever quadrant your eye naturally goes to first. Secondary goes adjacent. Watch and reference go in the less-prominent positions. The layout encodes the role hierarchy spatially. When alerts fire, the watch chart that demands attention is in the corner where you have to deliberately look at it &mdash; not in your central field of view where it would dominate.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESET PER ROLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each role gets a preset that fits its purpose. Primary chart often runs Trend or Composite Bold &mdash; full-fidelity reads on your most-engaged surface. Secondary runs the same as primary or one tier simpler. Watch runs whichever preset fires its alerts cleanly. Reference often runs Default mode or Trend &mdash; you are reading regime, not signals. The preset selection encodes the role&apos;s purpose.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Four roles, four attention budgets, four preset choices. Without explicit roles, every chart competes equally and the loudest wins. With roles, attention flows by design.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S04 — The HTF/LTF Stack */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The HTF/LTF Stack</p>
        <h2 className="text-2xl font-extrabold mb-4">One asset. Four timeframes. Read top down.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          A single asset rendered across multiple timeframes is not four charts &mdash; it is one chart at four resolutions. Each timeframe answers a different question. The 4H answers &quot;what is the macro context?&quot; The 1H answers &quot;is the setup zone active?&quot; The 15m answers &quot;is timing right?&quot; The 5m answers &quot;execute now?&quot; The operator who runs the stack reads top-down, letting context filter execution.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The stack is the most efficient use of multiple panes for a single-asset trader. Four panes covering four timeframes of one asset gives you everything CIPHER needs to fire a signal with full confluence. The HTF1/HTF2 atoms in the synthesis tooltip already account for higher-timeframe context, but having those higher timeframes visible directly lets you see the convergence rather than reading it as text. Visual confirmation reinforces the synthesis.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <TimeframeStackAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">4H &middot; MACRO CONTEXT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 4-hour chart shows the multi-day trend. Regime here changes slowly &mdash; days, not bars. If 4H reports BULL TREND, the higher-frequency timeframes inherit a bullish bias. If 4H is RANGING, lower timeframes inside the range are tradeable but with reduced expectations. The 4H read is the strategic frame; everything below tactical.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">1H &middot; SETUP ZONE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 1-hour chart shows the multi-hour setup. Most CIPHER signals on the 1H chart are tradeable for swing-style operators. Structure on this timeframe defines where price respects history. The 1H is where you identify the level you want to engage at &mdash; the 15m and 5m below it are about timing the actual entry.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">15m &middot; ENTRY TIMING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 15-minute chart resolves entry timing. A signal on the 1H may take an hour to develop into a clean entry; on the 15m, the same setup gives you four bars of resolution per hour. Engaging on the 15m signal that aligns with the 1H setup gives you a tighter entry &mdash; better risk-reward, smaller stop, same target.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">5m &middot; EXECUTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 5-minute chart is the execution timeframe. You watch this only when actively engaging or actively managing a position. Outside of those windows, the 5m chart distracts more than it informs &mdash; the noise-to-signal ratio is high. During an active trade, the 5m candles tell you whether the move has follow-through, whether the stretch is exhausting, whether to scale at TP1 now or wait one more bar.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">READING THE STACK TOP-DOWN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The discipline is to start from the highest timeframe and work down. Macro first, setup second, timing third, execution fourth. Operators who read the 5m first and then check higher timeframes for confirmation are working bottom-up &mdash; which biases them toward whatever the 5m is showing right now, regardless of whether it fits the macro. Top-down reading filters out signals that contradict the higher context.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CASCADING CONFIRMATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The strongest setups have all four timeframes agreeing. 4H bullish trend, 1H setup at support with bull FVG, 15m signal firing, 5m candles painting deep teal. This is the four-timeframe convergence that the synthesis layer scores at 4/4. Setups with three of four agreeing are still strong; with two of four, marginal; with one or zero, the operator passes regardless of how the active timeframe looks.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TIMEFRAME GAPS MATTER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The factor between adjacent timeframes is roughly 4x &mdash; 4H to 1H, 1H to 15m, 15m to 5m. Each step zooms in by 4x. Larger gaps (4H to 5m skipping 1H and 15m) lose the cascading-confirmation benefit. Smaller gaps (1H to 30m to 15m) are redundant; adjacent timeframes carry too much overlapping information to justify the chart real estate.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ALTERNATIVE STACKS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 4H/1H/15m/5m stack is calibrated for intraday trading. Swing traders use D/4H/1H/15m &mdash; one step higher across the board. Position traders use W/D/4H/1H. Scalpers use 1H/15m/5m/1m. The principle is identical &mdash; macro to micro, four timeframes, top-down reading &mdash; only the absolute timeframes shift to match the strategy&apos;s holding period.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The HTF/LTF stack is one asset rendered at four resolutions. Read top-down: macro, setup, timing, execution. Convergence across all four is the strongest engagement signal.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S05 — Cross-Asset Correlation Reads */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Cross-Asset Correlation Reads</p>
        <h2 className="text-2xl font-extrabold mb-4">Read the reference to filter the primary.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Some assets do not move independently. DXY rising tends to push EUR/USD lower &mdash; the dollar index and the euro pair are inversely correlated by construction. VIX rising tends to push S&amp;P futures lower &mdash; volatility and equities are correlated negatively. BTC rising tends to pull altcoins higher &mdash; the crypto leader sets tone. The operator who reads correlated assets in pairs catches setups (and warning signs) the single-asset view misses.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The Reference role from S03 exists for this purpose. The DXY chart is rarely traded directly &mdash; it is read for context. When DXY is climbing aggressively, EUR/USD long setups become harder. When VIX spikes, equity longs face headwinds. When BTC breaks down, alt longs are at risk. Reference charts answer the question &quot;what is the macro backdrop telling me about my primary?&quot;
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <CorrelationPairAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">FOREX &middot; DXY AS THE REFERENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When trading any USD pair (EUR/USD, GBP/USD, AUD/USD, USD/JPY) the DXY chart is the reference. DXY rising = USD strength = pressure on USD pairs that have USD as the quote currency. The correlation is not perfect &mdash; pair-specific drivers can override DXY at times &mdash; but it is the default backdrop. CIPHER reads on USD pairs gain weight when DXY agrees and lose weight when DXY contradicts.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">EQUITIES &middot; VIX AS THE REFERENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When trading equity indices (SPX, NDX, ES, NQ) the VIX is the reference. VIX rising = volatility expansion = risk-off conditions. Equity longs in rising-VIX environments face headwinds even if the index itself is also rising &mdash; the move is fragile. VIX falling alongside equity gains is the bullish baseline. Cross-checking VIX with primary equity charts prevents engagement during volatility regime shifts.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO &middot; BTC AS THE REFERENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When trading altcoins (ETH, SOL, AVAX, LINK), BTC is the reference. BTC sets the tone for the entire risk-on/risk-off cycle in crypto. Alts that look strong in isolation are at risk when BTC breaks down &mdash; correlation rises sharply during sell-offs. Trading alts without watching BTC is operating without the tape. The primary chart is the alt; the reference is BTC.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CORRELATION IS NOT CAUSATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The reference moves alongside the primary; it does not cause the primary to move. Trading off the reference alone misses the point. The correct use is filtering &mdash; engaging primary setups when the reference agrees, passing or sizing smaller when the reference disagrees, and reading both during transition periods to catch the regime shift early.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN CORRELATION BREAKS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Correlations are statistical, not deterministic. EUR/USD can fall while DXY also falls (yen flows, eurozone-specific shocks). Equities can rise alongside VIX (short-vol unwinds, post-event mean reversion). BTC can fall while alts rise (capital rotation into alts). When the correlation breaks, that itself is information &mdash; pair-specific dynamics are dominating the macro backdrop. Take note; do not assume the correlation will reassert immediately.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">POSITIVELY CORRELATED PAIRS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Some pairs move together rather than inversely. Gold and silver. Crude oil and natural gas (sometimes). NDX and SPX. Euro and Swiss franc. When trading one and watching the correlated other as reference, both moving the same direction confirms the move; divergence is the warning. The mechanic is identical to inverse correlation; only the sign flips.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REFERENCE TIMEFRAME</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The reference chart is typically run on the same timeframe as the primary, or one step higher for context. EUR/USD on 15m primary &rarr; DXY on 15m or 1H reference. The higher-timeframe reference shows whether the macro context is shifting; the same-timeframe reference shows whether the current bar agrees. Both are useful; pick based on whether your style is more setup-driven (same TF) or context-driven (higher TF).
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Reference charts filter primaries. DXY for FX. VIX for equities. BTC for alts. When reference and primary agree, sizing up is justified. When they disagree, sizing down or skipping is correct.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S06 — The Watchlist Discipline */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Watchlist Discipline</p>
        <h2 className="text-2xl font-extrabold mb-4">A bloated watchlist is a leaky attention budget.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Every asset on the watchlist demands a slice of attention even when it is quiet. The cumulative cost of monitoring twenty assets is large, and the cumulative benefit of doing it superficially is small. Operators who curate aggressively &mdash; pruning to the six or eight assets that genuinely earn their attention &mdash; outperform operators who maintain forty-asset watchlists they cannot actually read.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The discipline is structural: every asset on the watchlist has an explicit role (Primary, Secondary, Watch, or Reference), and assets that do not fit any role get pruned. The watchlist is reviewed every 20-30 sessions and adjusted as the market and your strategy evolve. The asset that mattered last quarter may not matter this quarter; the asset you have ignored for months may now fit your style. Curation is ongoing.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <WatchlistPruneAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE PRUNE CRITERIA</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              An asset earns its slot on the watchlist if it produces tradeable setups for your style on a regular basis. &quot;Regular&quot; means at least one tradeable setup per week on its primary timeframe. Assets that have not produced a tradeable setup in 30 sessions get demoted (Primary &rarr; Secondary &rarr; Watch &rarr; pruned). The pruning is not cruel &mdash; it is honest about where your attention earns its keep.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T COLLECT INSTRUMENTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The temptation when starting out is to add every interesting-looking asset to the watchlist. Resist. Instruments are not collectibles. The operator who runs four assets they understand deeply outperforms the operator who runs forty assets they understand superficially. If you are tempted to add a new asset, you must also identify which existing asset gets demoted or pruned. One in, one out.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SESSION-WINDOW MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Different assets have different active windows. EUR/USD is most active during London and NY overlap. NAS100 during US session. BTC is 24/7 but liquidity peaks during US session. If you trade only during a specific window, prune assets that are inactive during that window. A watchlist of US equities for an Asia-session trader is mostly dead air.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REVIEW EVERY 20-30 SESSIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every 20-30 sessions, sit down with your trade journal and ask: which assets produced engagements? Which produced wins? Which assets demanded attention but never delivered? Promote and prune accordingly. The review takes 15 minutes and is the difference between a curated watchlist and a fossilized one.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WATCHLIST GROUPING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TradingView lets you create multiple watchlists. Use this. Group by role: one list for active primaries/secondaries, one for watch-role alerts-only assets, one for references. Or group by asset class: forex, crypto, indices, commodities. Whichever grouping fits your workflow, the goal is the same &mdash; reduce friction in finding the chart you need at the moment you need it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SHORTCUTS PER GROUP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Set TradingView keyboard shortcuts to switch between watchlist groups. Faster than clicking through menus. The fastest war room operators can switch focus from primary to reference to secondary in under three seconds without taking their hands off the keyboard. Speed of context-switch is part of the choreography.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SEASONAL ASSETS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Some assets are seasonal &mdash; natural gas in winter, oil during driving season, agricultural commodities by harvest cycle. If you trade seasonals, your watchlist rotates by calendar. Adding the in-season asset and pruning the off-season one is part of the curation. Most prosumer traders do not run seasonals; if you do, build the rotation into the 20-30 session review.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Curate to six. Each asset has an explicit role. Review every 20-30 sessions. One in, one out. The watchlist is a living document, not a museum.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S07 — Alert Architecture */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Alert Architecture</p>
        <h2 className="text-2xl font-extrabold mb-4">Every alert has a category. Every category has a triage protocol.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Alerts are the operator&apos;s force multiplier. A well-designed alert system lets you cover ten charts with the attention of two &mdash; the alerts surface the moments that matter and you ignore the rest. A poorly designed alert system buries you in noise. The difference is architecture: every alert serves a specific purpose, fits one of a small number of categories, and has a defined triage response.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The four categories: Signal (CIPHER itself fires), Level (price hits a tracked S/R or pivot), Volume (unusual volume on a watched asset), Regime (a regime transition such as TREND CURVING or RANGE BREAK). Most alerts will be Signal or Level. Volume and Regime alerts are sparser but high-information. Knowing which category an alert belongs to is the first step in triaging it.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <AlertArchitectureAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL ALERTS &middot; CIPHER FIRES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER&apos;s built-in alerts fire when a Pulse Cross or Tension Snap signal prints. These are the highest-density alerts &mdash; they encode the synthesis layer&apos;s read in a single ping. Configure them per chart with min_conviction = 3 (Strong only) for primaries. For secondaries, also Strong only. For watch role, set the alert at min_conviction = 0 (all signals print) so the chart can flag any firing. Signal alerts are the workhorses.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LEVEL ALERTS &middot; PRICE AT KEY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Price hitting a manually-marked level &mdash; a swing high, a structural support, a pivot zone. Set on primary and secondary charts at levels you have already analyzed and care about. Level alerts are slower-firing than signal alerts (price has to travel) but high-quality &mdash; you only set them at levels that matter. When a level alert fires, you already know what to look for at that level.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">VOLUME ALERTS &middot; SURGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Unusual volume relative to the recent average &mdash; 2&times;, 3&times;, or higher. Volume surges often precede signal firings or accompany level breaks. Set on watch-role assets where you cannot scan continuously but want to know when something is happening. Volume alerts on illiquid assets are noisy; reserve them for assets where volume actually has signal value (major FX pairs, equity indices, large-cap crypto).
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REGIME ALERTS &middot; TREND FLIP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER&apos;s Header row reports regime states: BULL TREND, BEAR TREND, RANGING, COMPRESSION. Setting an alert on regime transition (e.g., BULL TREND becomes RANGING) is sparse but high-impact &mdash; it tells you the macro context just shifted. Useful on reference charts (DXY regime flip changes the FX backdrop) and primary charts (your asset just changed character).
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">NAMING DISCIPLINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Name every alert with a consistent format: ASSET-CATEGORY-DETAIL. Examples: &quot;EURUSD-SIGNAL-Pulse Cross Strong&quot;, &quot;XAU-LEVEL-1.2k support&quot;, &quot;BTC-VOLUME-3x surge&quot;, &quot;DXY-REGIME-flip alert&quot;. When the alert fires, you read the name and instantly know what is happening and which chart to switch to. Default TradingView alert names are useless; rename every one.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FIVE TO FIFTEEN, NOT FIFTY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Active alerts: 5-15 at any one time. Below 5 and the alerts are not earning their keep &mdash; you are watching everything manually anyway. Above 15 and triage becomes overwhelming &mdash; you stop reading each alert carefully because too many are firing. The middle range is selective enough to matter, focused enough to triage.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ALERTS EXPIRE OR ARE DELETED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Level alerts naturally expire when price moves past the level. Delete them when they no longer match your read of the chart. Signal alerts persist indefinitely; review them quarterly to remove ones for assets you no longer trade. Volume alerts can stay long-term but should be deleted if they fire too often (signal-to-noise gone bad). Regime alerts are sparse and worth keeping.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DELIVERY CHANNELS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TradingView pushes alerts to web, mobile, email, or webhook. For active trading, web pop-ups + sound is the default. For away-from-screen monitoring, mobile push. Email is too slow for active alerts but useful for daily summaries. Webhooks are for advanced operators integrating with custom journals or auto-trading systems &mdash; not necessary for the prosumer baseline.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Four categories. Five to fifteen total. Consistent naming. Each alert serves a purpose; alerts that don&apos;t earn their keep get deleted.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S08 — Triaging the Alert Storm */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Triaging the Alert Storm</p>
        <h2 className="text-2xl font-extrabold mb-4">Five alerts in thirty seconds. Two engagements, two watch flags, one skip.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          During active sessions, multiple alerts can fire in quick succession &mdash; the alert storm. Untrained operators react to the first alert that grabs them and miss what the others were saying. The triage protocol routes every incoming alert to one of three actions in seconds: Engage (act on this now), Watch (continue monitoring, no action yet), or Skip (dismiss, this alert no longer matters).
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The triage rules are deterministic. An alert routes to Engage when: it is on a primary or secondary chart, it represents a Strong signal or a level you intended to act on, the synthesis layer agrees, and your current capacity allows another open position. Otherwise it routes to Watch (interesting, monitor) or Skip (not actionable, dismiss). The rules eliminate the impulse-driven decisions that cost operators most.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <TriageStormAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ENGAGE &middot; THE PROTOCOL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engage when ALL of: alert is on primary or secondary chart, the alert represents a Strong (3/4 or 4/4) CIPHER signal or a tracked level you intended to engage at, the synthesis tooltip confirms qualifying conditions, and your open-position count is below your max. Miss any of these and the alert does not route to Engage regardless of how exciting it looks.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WATCH &middot; KEEP MONITORING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Watch when the alert is on a watch-role chart with no qualifying signal yet, on a reference chart where the regime hint is interesting but no setup is firing, or on a primary/secondary where conditions are developing but not yet engagement-grade (2/4 score, level not quite hit, partial confluence). Watch means you keep the chart visible and read it on the next bar. No size; just attention.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SKIP &middot; DISMISS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Skip when the alert no longer matches conditions (regime shifted, signal degraded, level was rejected without follow-through), the alert is on an asset you have decided not to trade today (out of session window, news risk, recent loss on the asset), or your psychological state is poor and you have decided to reduce engagement count for the session. Skip is not failure; skip is filtering.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SPEED MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Triage should take under five seconds per alert. Read the alert name, check the chart, route to Engage / Watch / Skip. If you find yourself spending 30 seconds on a single alert, you are second-guessing the protocol &mdash; which is the failure mode. The protocol is designed to be fast precisely because slow triage produces worse decisions than fast triage under load.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ENGAGEMENT CAPACITY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You have a maximum number of open positions you can hold concurrently. For most prosumer operators that number is 2-4. When you are at max, every Engage candidate gets routed to Watch instead &mdash; not because the setup is bad but because you do not have the bandwidth to manage another open trade properly. Knowing your max and respecting it is part of the triage.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SAME-BAR MULTIPLE ALERTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sometimes the same bar produces multiple alerts on different charts &mdash; e.g., EUR/USD signal AND XAU/USD level AND DXY regime flip. Triage in priority order: primary first, secondary second, watch third, reference last. The reference alert may inform the primary engagement decision, but the engagement itself is on the primary or secondary. Reference alerts almost never produce direct engagements.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE THIRTY-SECOND RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When five alerts hit within thirty seconds, the operator triages all five in under thirty seconds combined. Read fast, route fast, engage on the qualifiers, watch the rest. Operators who try to deeply analyze each alert during the storm produce worse decisions than operators who follow the protocol mechanically. The protocol is the discipline; the discipline is the edge.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Engage / Watch / Skip. Five seconds per alert. Capacity-aware. The protocol is mechanical because mechanical decisions outperform improvised ones under load.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S09 — Pre-Market Routine */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Pre-Market Routine</p>
        <h2 className="text-2xl font-extrabold mb-4">Fifteen minutes that determine the session.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The fifteen minutes before your session starts are disproportionately important. A disciplined pre-market routine front-loads the decisions that would otherwise have to be made during active trading &mdash; chart roles, alert verification, news scan, mental state check. Operators who run the routine consistently arrive at the open ready to react; operators who skip it spend the first hour catching up on context they should have known before the bell.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The pre-market routine is the same every session. Variation defeats its purpose &mdash; the point is to handle setup decisions automatically so that during active trading you only think about the trades themselves. Five steps, fifteen minutes, applied identically every session.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <SessionTimelineAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; OVERNIGHT NEWS SCAN (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              What happened while you were asleep or away? Major economic data, central bank statements, geopolitical events, earnings announcements (for equities), token unlocks (for crypto). The goal is not deep analysis &mdash; it is awareness. If something material happened, you adjust the session plan accordingly. If nothing material, you proceed with the standard plan.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; CHART ROLE REVIEW (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Verify the layout. Primary chart loaded with the right asset and timeframe. Secondary loaded. Watch and reference charts in their assigned slots. Cipher Candle modes set per role. Preset selections appropriate. This takes 30 seconds when nothing has changed; it takes longer when you adjusted yesterday and need to reset.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; ALERT VERIFICATION (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Open the TradingView alerts panel. Confirm 5-15 active alerts. Delete any expired (level alerts where price has moved past). Add any new alerts based on overnight changes (new levels formed, regime transitions worth tracking). Verify alert delivery channels are working &mdash; pop-ups enabled, sound on, mobile push functional if you step away.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; HTF READ (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Read the 4H and 1H charts on each primary asset. What is the macro context? Is the trend aligned with yesterday&apos;s read or has it shifted? Are there pending setups that look likely to resolve during the upcoming session? The HTF read sets your bias for the session &mdash; you are not committed to it, but you start with an expectation.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 5 &middot; MENTAL STATE CHECK (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Honest self-assessment. Are you tired? Stressed about something unrelated? Recovering from a recent losing trade? On tilt from a recent win? Your mental state determines your engagement capacity for the session. Tired or distracted = reduce capacity (max 1-2 trades instead of 3-4). On tilt = consider stepping back from active trading entirely. The check is mandatory; the response is calibrated.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SAME ROUTINE, EVERY SESSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The discipline is in the consistency. Operators who run the routine 80% of the time perform measurably worse than operators who run it 100% of the time. The 20% of sessions where you skip the routine are usually the sessions where something material was about to happen and you missed it. Run the routine on slow days too &mdash; that is when you build the muscle.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FIFTEEN MINUTES, NOT FIVE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The shortcut version &mdash; running the routine in five minutes &mdash; is worse than skipping it entirely. Five minutes is enough to feel like you did the routine without actually doing the work. Either commit fifteen minutes or skip it and acknowledge to yourself that you skipped it. Half-routines breed false confidence.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ABORT IF NEEDED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If the routine reveals you are not in shape to trade today &mdash; severely tired, on tilt from yesterday, dealing with a personal crisis &mdash; abort the session. Close the platform and walk away. The routine&apos;s job is to catch the no-trade days so you do not destroy capital trying to trade through them. A skipped session never lost anyone money. A traded session in poor mental state has cost everyone money at some point.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Five steps, fifteen minutes, every session. The routine front-loads decisions that would otherwise have to be made under fire. Skipping it costs more than running it.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S10 — Active Session Choreography */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Active Session Choreography</p>
        <h2 className="text-2xl font-extrabold mb-4">During the session: scan, triage, engage, manage. Repeat.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The active session is the working window where most engagements happen. Your pre-market routine has prepared the desk; your alerts are armed; your charts are loaded. From the open through the mid-session into the close, the choreography is a tight loop: scan the panel of charts on a regular cadence, triage incoming alerts, engage on qualifying setups, manage open positions. Repeat for as long as the session lasts.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The mistake operators make is treating the session as continuous high-intensity attention. It is not. The session has natural rhythms &mdash; high-energy moments at the open and around news, slower stretches mid-session, increasing energy near the close. Match your attention to the rhythm. Pulling 100% focus for six straight hours is unsustainable; following the rhythm is sustainable.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPEN &middot; FIRST 60 MINUTES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The first hour after open is high-energy and high-noise. Volatility spikes, spreads widen briefly, signals fire that get reversed within bars. The discipline is to engage selectively &mdash; only Strong (3/4 or 4/4) signals, and pass on most 2/4 setups regardless of how compelling they look. The open is for tracking what happens; the rest of the session is for trading what stuck.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MID-SESSION &middot; SUSTAINED FOCUS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The middle hours are where most edge gets captured. Volatility has settled into the day&apos;s pattern, signals are higher-quality, the noise level is manageable. This is where the active scan + triage loop runs continuously. Setups develop, alerts fire, engagements happen. Your attention should be highest here because the signal-to-noise is best.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCAN CADENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Even with alerts armed, you scan the panel on a cadence &mdash; every 5-15 minutes glance through primary, secondary, watch, and reference charts. Some setups develop without firing alerts (alerts cover specific conditions, not all conditions). The scan catches what the alerts miss. Five minutes is the floor for active scalping styles; fifteen minutes is the ceiling for swing styles. Find your cadence and run it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MANAGING OPEN POSITIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every active position requires attention bandwidth. The L11.22 trade plan governs the management protocol: BE move at TP1, scale at TP1/TP2/TP3, do not improvise. During the active session, glance at open positions on the same cadence as the panel scan. If a position has not hit TP1 within its expected window, evaluate whether the read still holds &mdash; otherwise honor the SL when it triggers and move on.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">BREAKS ARE PART OF THE CHOREOGRAPHY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Six hours of continuous attention is not sustainable for most operators. Build short breaks into the session &mdash; five minutes every hour, longer breaks during low-energy windows. Set alerts to cover the breaks. Stepping away briefly is better than running on cognitive fumes. The goal is sustained quality, not maximum hours.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T REVISIT CLOSED TRADES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a trade closes &mdash; for profit or loss &mdash; do not spend the next twenty minutes replaying it on the chart. Move on. The next setup needs your full attention; mental rumination on the closed trade dilutes it. Capture the result in the journal (S13) at the moment, then return to the active scan. Post-mortems happen at session-end review, not mid-session.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">RAPID DEGRADATION SIGNALS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You will recognize when your session is degrading: missed setups that you would normally have caught, impulse engagements on weak conditions, irritation when alerts fire, difficulty triaging quickly. When you notice these, you have already passed the point of best decision-making. Take a longer break, and if conditions do not improve, end the session early. The market will be there tomorrow.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Open with caution. Mid-session with focus. Close with discipline. Match attention to the session rhythm. Take breaks. Recognize degradation early.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S11 — The Decision Protocol Under Load */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Decision Protocol Under Load</p>
        <h2 className="text-2xl font-extrabold mb-4">When three signals fire at once, the protocol is the discipline.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The most expensive decisions happen when the operator is overloaded. Three alerts fire within twenty seconds, the markets are moving, and intuition is begging to engage on whichever looks most exciting. Untrained operators react to the loudest signal and miss the others. Trained operators apply the protocol mechanically: priority order, capacity check, qualification gates, then engage.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The protocol exists precisely because deep analysis under time pressure produces worse decisions than mechanical routing. When you have thirty seconds to decide on three signals, you do not have thirty seconds for each &mdash; you have ten. Mechanical routing is the only way to triage three signals in thirty seconds. The protocol is not a substitute for analysis; it is the optimization for the conditions where analysis is unavailable.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <DecisionUnderLoadAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; PRIORITY ORDER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When multiple signals fire, route in priority order: Primary first, Secondary second, Watch third, Reference last. The Primary signal gets your full attention before the Secondary even gets evaluated. This eliminates the FOMO trap of engaging on whichever signal is shouting loudest. The hierarchy was set during pre-market; honor it under load.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; CAPACITY CHECK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before evaluating qualification, check your capacity. How many positions are currently open? What is your max? If you are at max, every Engage candidate gets routed to Watch instead. The capacity check eliminates over-engagement &mdash; the failure mode where the operator opens position five with no remaining bandwidth to manage all five properly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; QUALIFICATION GATES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              For each signal that survives priority and capacity, apply the qualification gates: synthesis score &ge; 3 (Strong), candle alignment confirmed (TEAL_DEEP or compatible), HTF context not contradicting, no pending news risk in the next 30 minutes, mental state OK. Pass all gates and the signal routes to Engage. Fail any gate and it routes to Watch or Skip depending on which gate failed.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; EXECUTE THE ROUTING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engage candidates get full execution: entry, SL from Risk Map, TP1/2/3 ladder, BE plan. Watch candidates get a mental flag &mdash; you check them on the next scan. Skip candidates get dismissed. Move to the next signal in priority order. The full protocol completes in under thirty seconds for three signals when practiced.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN THE PROTOCOL FEELS WRONG</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sometimes the protocol routes a signal to Skip that &quot;feels like it will work.&quot; This happens. The protocol is calibrated for the average outcome, not the specific outcome. Trust the protocol on individual signals; review patterns at session-end. If you find yourself overriding the protocol more than 10% of the time, the protocol is wrong for your style and needs adjustment &mdash; not abandonment, but tuning.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TIME-PRESSURE PARADOX</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Mechanical routing under time pressure outperforms careful analysis under time pressure, because careful analysis under time pressure is rushed analysis &mdash; which is worse than no analysis. The protocol replaces the impossible task (deep analysis in seconds) with the achievable task (mechanical routing in seconds). The trade-off is implicit acceptance that some good signals will route to Skip. Most of those would have lost anyway; the rest are the price of consistency.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRACTICE WITHOUT MONEY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The protocol is a skill. Practice it on demo charts during slow sessions when nothing is firing. Run scenarios in your head: &quot;if EUR/USD Strong and XAU level and DXY regime fire simultaneously, where do they route?&quot; The faster the routing becomes, the better you perform under live pressure. Operators who only practice during live sessions never build the routing speed.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Priority &rarr; capacity &rarr; qualification &rarr; execute. Mechanical, fast, repeatable. Trust the protocol; review patterns at session-end. Practice on slow days.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S12 — Session-End Review */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Session-End Review</p>
        <h2 className="text-2xl font-extrabold mb-4">Ten minutes to review. The compounding starts there.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The session does not end when the last position closes. It ends when you have reviewed what happened. Ten minutes of structured review at the end of every session is where compounding learning starts. Operators who skip the review repeat the same mistakes. Operators who run the review &mdash; even briefly &mdash; identify patterns over weeks that they could not see in any single day.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The review is not a retrospective on each individual trade. It is a session-level look: what happened, what worked, what did not, what to adjust. Individual trade post-mortems happen during the journal entries (S13). The session review is one level higher &mdash; the choreography itself, not the dance steps.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; P&amp;L RECAP (2 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Total P&amp;L for the session. Number of engagements. Win rate. Best trade and worst trade. This is the quantitative summary &mdash; just the numbers, no narrative yet. Some operators feel the urge to skip this because the numbers look bad; do not. The numbers are the input data for the rest of the review.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; PROTOCOL ADHERENCE (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Did you follow the protocols? Pre-market routine completed? Triage applied to every alert? Capacity check before engaging? Risk Map honored on stops? Journal entries captured at the moment? Scoring honesty is binary &mdash; either you followed it or you did not. Note any deviation, however small. This is the leading indicator of P&amp;L drift over weeks.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; PATTERN OBSERVATION (3 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anything notable about today&apos;s session that connects to recent sessions? A specific asset producing wins lately? A specific time-of-day pattern? A particular setup type underperforming? You are not drawing conclusions from a single session &mdash; you are noting candidates to confirm or refute as future sessions accumulate.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; ADJUSTMENT NOTES (2 MIN)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anything to adjust before the next session? An alert that fired too often? A chart role that needs reassignment? A signal type to skip on this asset? Write the adjustment down. Adjustments that exist only in your head get forgotten. Adjustments written down become checklists for the next pre-market.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">RUN THE REVIEW EVEN ON GREEN DAYS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Operators tend to skip the review when they are profitable and obsess over it when they are losing. Reverse this. Review winning sessions just as carefully &mdash; you may have won despite poor protocol adherence (lucky), and the next session will catch up to that. Reviewing winners catches the lucky-vs-good distinction; reviewing losers catches the bad protocol.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T REVIEW WHILE EMOTIONAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If the session ended badly and you feel angry or defeated, walk away for fifteen minutes before running the review. Reviews done while emotional turn into self-flagellation rather than honest assessment. The point is information extraction, not therapy. If you cannot review without emotion, defer until later that evening or the next morning &mdash; better to review late than to review while flooded.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WEEKLY REVIEW IS DEEPER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The daily review is ten minutes. The weekly review is thirty to sixty minutes &mdash; you scroll through the journal, identify trends across the week, evaluate whether watchlist roles still fit, check whether alert patterns are noisy. Weekly reviews are where bigger adjustments get made. Daily catches drift; weekly catches direction.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Ten minutes after every session. P&amp;L recap, protocol adherence, pattern observation, adjustment notes. Run it on green days too. Defer if emotional. Weekly review is deeper.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S13 — The Journal */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Journal</p>
        <h2 className="text-2xl font-extrabold mb-4">Capture the read at the moment, not after the result.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The journal is the bridge between current sessions and future improvement. Every trade gets an entry: asset, direction, entry, stop, targets, conviction, candle context, the read that justified the engagement. Captured at the moment of decision, before the trade resolves. Entries written after the result are corrupted by hindsight &mdash; you remember what worked, you forget what you actually saw.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Tool selection is secondary. TradingView trading notes work. Notion templates work. Spreadsheets work. Even a paper notebook works. What matters is the entry happens at the moment, contains the right fields, and gets reviewed weekly. Operators who delay the entry until after market close lose the most valuable capture &mdash; the read at the time of decision &mdash; and end up with sanitized post-hoc narratives.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <JournalEntryAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">REQUIRED FIELDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Asset, timeframe, direction (long/short), entry price, stop loss with method (Risk Map / structural / ATR), TP1/TP2/TP3 levels, conviction score (X/4), context tag from the cascade, active candle mode, candle shade at entry. These are the structural fields &mdash; they capture the synthesis-layer reading and the candles-layer reading at the moment of engagement.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE NARRATIVE FIELD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              One sentence describing why this trade made sense. &quot;HTF aligned, 5-module convergence, Sweep+FVG context.&quot; Keep it brief; you will read hundreds of these later. The narrative captures the qualitative read that the structural fields miss &mdash; what made you engage rather than skip. Future-you reading this in a weekly review needs to understand present-you&apos;s thinking quickly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">RESULT FIELD &middot; ADDED LATER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Once the trade closes, add the outcome: exit price, P&amp;L, R-multiple, exit reason (TP1 hit / TP2 / SL / discretionary). Critically, do not edit the original entry. The original entry captured the read at decision; the result field is added at close. The two together let you analyze the read-vs-result correlation over time &mdash; which is where journal value compounds.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCREENSHOTS HELP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              For setups you will want to review carefully later, screenshot the chart at entry. The screenshot shows the synthesis tooltip, the candle cluster, the panel state &mdash; the visual context that words cannot fully capture. Not every trade needs a screenshot; the apex setups, the ones with unusual context, and the surprising losses do.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">FRICTION KILLS JOURNALING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The biggest determinant of whether journaling actually happens is friction. If the entry takes five minutes, you will skip it during fast sessions. If it takes one minute, you will do it consistently. Build a template that requires minimal typing &mdash; dropdowns for fixed values, copy-paste from the synthesis tooltip, defaults for the most-common configurations. Reduce friction below the activation energy for skipping.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REVIEW THE JOURNAL WEEKLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Daily review (S12) covers the session. Weekly review covers patterns &mdash; scroll through the past five sessions of journal entries and look for trends. Which conviction tiers won most? Which context tags failed most? Which assets produced the highest expected value? Patterns that are invisible in any single session emerge after 20-30 entries reviewed together.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T LIE TO THE JOURNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The temptation when entering a losing trade is to fudge the entry &mdash; describe the read more favorably than it actually was, omit the warning signs, sanitize the narrative. Resist. The journal&apos;s value depends entirely on its honesty. A journal that flatters the operator is worse than no journal because it codifies false beliefs. Capture what you actually saw, including the parts you saw and ignored.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">JOURNAL SKIPPED TRADES TOO</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Advanced operators journal not just engagements but high-quality skips. &quot;EUR/USD 4/4 Strong fired but I was at capacity, routed to Watch.&quot; Tracking skipped trades reveals whether your capacity limit is calibrated &mdash; if your skipped 4/4 trades systematically would have won, your capacity is too low. If they would have lost, your capacity is correct. Information you cannot get from engagement-only journals.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Capture at the moment, in low-friction format, including the read narrative. Add results at close. Review weekly. Do not edit history. Honesty is the entire value.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S14 — Solo vs Team Workflow */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Solo vs Team Workflow</p>
        <h2 className="text-2xl font-extrabold mb-4">Adding a partner doubles the eyes and the coordination cost.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Most retail and prosumer traders work alone. The lesson up to this point has assumed solo operation. For traders who work with one or more partners &mdash; whether sharing a desk physically or coordinating remotely &mdash; team workflows add capacity but also add coordination overhead. The trade-off is real, and not every solo operator benefits from going to a team.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The team multiplier works when each operator covers different assets, different time zones, or different signal types. Two operators each running their own primary chart and sharing notable observations effectively double the watchlist coverage. Two operators trying to trade the same chart usually get in each other&apos;s way &mdash; the second pair of eyes adds noise rather than signal.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <SoloVsTeamAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN A TEAM HELPS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the partners cover different surfaces. One trades equities, one trades FX. One works the European session, one works the US session. One specializes in trends, one in reversals. The division of attention surfaces is what creates team multiplier &mdash; each operator deeply on their domain, sharing high-confidence reads with the other when relevant.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN A TEAM HURTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the partners overlap. Two traders both watching EUR/USD, both with opinions on every signal, both coordinating before any engagement. The communication overhead exceeds the second-pair-of-eyes benefit. Team-mode is best when each operator is functionally solo on their own chart with periodic high-value information exchange &mdash; not when they are jointly responsible for one decision stream.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SHARED JOURNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Teams maintain a shared journal accessible to all partners. The journal logs not just trades but observations &mdash; &quot;DXY broke down 14:00, expect EUR strength,&quot; or &quot;BTC volume surge but no signal yet.&quot; The shared journal is the team&apos;s collective memory; it lets one operator&apos;s read inform another&apos;s decision without forcing real-time coordination.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL-SHARING PROTOCOL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pick a thresh hold for what gets shared between partners. Strong signals (3/4 or 4/4) on shared assets always get pinged. Apex signals (4/4 + Sweep+FVG) always get pinged with sizing context. Standard signals (2/4) do not get pinged unless on a partner&apos;s primary asset. Below threshold, the partner is not interrupted. This filters team chatter to high-value-only.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TEAM-OF-TWO IS THE SWEET SPOT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              For prosumer-level operations, two-trader teams produce most of the team multiplier benefit with manageable coordination overhead. Three-trader teams introduce significant coordination cost &mdash; who covers what, who responds to whose pings, who has conflicting reads &mdash; that often eats into the marginal benefit of the third operator. Stay at two unless your scale genuinely requires three.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DECISION AUTHORITY STAYS INDIVIDUAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Even on a team, the engagement decision is individual. Partner A pings Partner B about a signal; Partner B decides whether to engage based on their own read of their own primary chart. Team members do not jointly decide on each other&apos;s trades. Information flows freely; decision authority is solo. This preserves individual responsibility for individual P&amp;L.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SOLO IS THE DEFAULT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you do not currently have a partner, do not seek one to upgrade your setup. Master solo operations first. Team complexity layered onto an immature solo workflow produces worse outcomes than disciplined solo operations. The team-mode upgrade is for operators who are already running a clean solo war room and want to extend coverage.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Teams help when partners cover different surfaces. Teams hurt when they overlap. Two-of-two is the sweet spot. Decision authority stays solo. Solo is the default until proven otherwise.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S15 — Building Your War Room From One Chart */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Building Your War Room From One Chart</p>
        <h2 className="text-2xl font-extrabold mb-4">The upgrade path: 1 to 2 to 4 to 6. Master each step.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The full war room described in this lesson is the destination, not the starting line. Operators reading this who currently trade on one chart should not jump to six charts overnight. The right path is incremental: master one chart, add a second, master both, add two more, master four, add the HTF stack, master six. Each step is internalized before the next is attempted.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The principles &mdash; chart roles, alerts, session structure, decision protocol, journal &mdash; apply at every step. A one-chart operator still has roles (their one chart is Primary), still uses alerts, still runs sessions, still triages decisions, still journals. The principles scale down to one chart and up to six. What changes is the count of charts the principles operate on, not the principles themselves.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <UpgradeStaircaseAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STAGE 1 &middot; ONE CHART</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              One asset, one timeframe. Master CIPHER&apos;s read on this chart. Run the session structure (pre-market, active, close, review) on this single chart. Set 3-5 alerts on this asset. Journal every trade. Stay at this stage for at least 30 sessions before adding anything. Most operators rush past this; the ones who stay produce better long-term results.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STAGE 2 &middot; TWO CHARTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Add the reference chart. DXY for FX traders, VIX for equity traders, BTC for alt traders. Now you have one Primary and one Reference. Use the reference to filter primary engagements. The session choreography stays identical &mdash; you just add a quick reference glance to the scan cadence. Stay at two charts for 20-30 sessions.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STAGE 3 &middot; FOUR CHARTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Add a Secondary (correlated asset, second-favorite setup) and a Watch (alerted-only chart). Now the four-role system is complete. Alert count rises to 5-10. Session attention budget splits across roles. This is the working prosumer war room described in S02-S03. Stay 30-50 sessions to internalize the role rotation and triage protocol.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STAGE 4 &middot; SIX CHARTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Add the HTF stack &mdash; the higher timeframes of your primary asset, run alongside its setup timeframe. Now you have 4H, 1H, 15m, 5m of the Primary plus the Secondary and Reference. Six total charts. This is the upper end of the prosumer war room. Going beyond requires a second monitor and a different mental model; for most traders, six is the cap.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T SKIP STAGES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Operators sometimes try to jump from one chart to six in a week. The result is a poorly understood six-chart setup. The principles do not get internalized; the operator gets overwhelmed and reverts to chasing the loudest chart. Rebuild from stage one. Each stage&apos;s value comes from its mastery, not its existence.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DOWNGRADE WHEN STRUGGLING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you are at four or six charts and feeling overwhelmed &mdash; missed setups, sloppy decisions, deteriorating P&amp;L &mdash; downgrade temporarily. Drop to two charts for ten sessions. Re-establish discipline at the lower count. Then climb back up. Cycling between stages based on cognitive capacity is healthy; staying at a stage where you are drowning is not.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SOME OPERATORS PEAK AT FOUR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Not every operator should run six charts. Some have natural cognitive comfort at four and start degrading at six. That is fine &mdash; four charts run with full discipline outperforms six charts run sloppily. The right number is the one your honest journal-data shows you operate cleanly at, not the one you aspire to.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">GO BEYOND SIX ONLY WITH GENUINE NEED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Going beyond six charts requires a second monitor and either a multi-asset-class strategy or institutional volume requirements. Most retail and prosumer traders do not have either. If you are tempted to expand beyond six because more charts feels like it should produce more edge, your journal data does not yet justify the expansion. Stay at six and let edge come from depth, not breadth.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            One chart, master it. Then two, then four, then six. Each stage 20-50 sessions. Downgrade when struggling. Six is the cap for most. Depth beats breadth.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S16 — The Cheat Sheet */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; The Cheat Sheet</p>
        <h2 className="text-2xl font-extrabold mb-4">The full choreography on one page.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The War Room Operator framework distilled. Print this, tape it next to your L11.22 and L11.23 cheat sheets, read all three before every session.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE GENERAL WAR ROOM</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              1-2 monitors &middot; 4-6 charts &middot; 2-4 assets &middot; 5-15 alerts &middot; solo by default. Scaling up requires journal evidence; scaling down is healthy when struggling.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FOUR CHART ROLES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Primary (50% attention) &middot; Secondary (25%) &middot; Watch (15%, alerted-only) &middot; Reference (10%, context). Visual hierarchy on the layout matches the role hierarchy.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE HTF/LTF STACK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              4H (macro) / 1H (setup) / 15m (timing) / 5m (execution). Read top-down. Cascading confirmation across all four = strongest setup.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CORRELATION REFERENCES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              FX &rarr; DXY &middot; Equities &rarr; VIX &middot; Alt crypto &rarr; BTC. When reference and primary agree, sizing up. When they disagree, sizing down or skip.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WATCHLIST DISCIPLINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Curate to 6 with explicit roles. Prune assets producing &lt; 1 setup per week over 30 sessions. One in, one out. Review every 20-30 sessions.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ALERT ARCHITECTURE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              4 categories &mdash; Signal / Level / Volume / Regime. Naming format: ASSET-CATEGORY-DETAIL. 5-15 active. Delete expired. Web pop-up + sound for active.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TRIAGE PROTOCOL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engage / Watch / Skip. 5 seconds per alert. Priority order: Primary, Secondary, Watch, Reference. Capacity-aware. Mechanical, not analytical.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SESSION STRUCTURE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pre-market 15 min &middot; Open 60 min (selective) &middot; Mid-session sustained &middot; Close 30 min (no new entries) &middot; Review 10 min.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">JOURNAL FIELDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Asset / TF / direction / entry / SL / TP1-3 / conviction / context tag / candle mode / shade at entry / narrative. Result added at close. Capture at the moment, never edit history.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">UPGRADE STAGES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              1 chart &rarr; 2 charts (+ reference) &rarr; 4 charts (+ secondary, watch) &rarr; 6 charts (+ HTF stack). 20-50 sessions per stage. Don&apos;t skip; downgrade when struggling.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TEAM EXTENSIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Solo by default. Two-of-two when partners cover different surfaces. Shared journal. Decision authority stays individual. Three-plus introduces too much coordination overhead.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN IN DOUBT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Run the routine. The market gives a hundred sessions a year. Skipping the routine on one of them is not the disaster; getting comfortable skipping it on more is.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">THE FOUR SENTENCES</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Build the war room you can actually run. Run the routine consistently. Triage mechanically under load. Journal honestly and review weekly. Everything else compounds.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MISTAKES — Six Common Mistakes */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
        <h2 className="text-2xl font-extrabold mb-4">What goes wrong when the choreography is missing.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The War Room framework is robust but operator-dependent. The failure modes are workflow-discipline failures, not framework failures. Six recurring mistakes operators make when learning the war room. Each has a fix, and the fix is more disciplined than the mistake.
        </p>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &middot; SKIPPING THE PRE-MARKET ROUTINE</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator opens TradingView five minutes before the session, sees the market has already moved, and starts trading without the chart-role check, alert verification, or HTF read. The session begins reactive instead of prepared. <span className="text-amber-400">Fix</span>: run the full 15-minute routine every session. Even on slow days. Especially on slow days &mdash; that is when you build the muscle.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &middot; BLOATED WATCHLIST</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator collects 30+ assets on the watchlist over time, never prunes, and ends up with cognitive load that prevents focused attention on any single asset. Setups get missed because the operator was glancing at fifteen others when they fired. <span className="text-amber-400">Fix</span>: prune ruthlessly. One in, one out. Re-evaluate every 20-30 sessions. Six assets with depth beat thirty with breadth.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &middot; ALERT FATIGUE</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Forty active alerts firing constantly. The operator stops reading them carefully, starts dismissing without triage, eventually mutes the sound entirely. The alerts are now noise rather than signal. <span className="text-amber-400">Fix</span>: cap at 15 active. Delete expired alerts immediately. If you cannot triage every alert in 5 seconds, you have too many. Less is more.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &middot; ANALYZING UNDER LOAD</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Three signals fire in twenty seconds. The operator tries to deeply analyze each one before deciding, gets bogged down on the first signal, and the other two pass without engagement. The protocol exists for this exact scenario. <span className="text-amber-400">Fix</span>: route mechanically. Priority &rarr; capacity &rarr; qualification &rarr; execute. Five seconds per signal. Trust the protocol; review patterns at session-end.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &middot; NO JOURNAL OR DELAYED JOURNAL</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator skips journaling because &quot;I remember the trades.&quot; Or journals after market close, which corrupts the entries with hindsight. After 50 sessions, the operator has no data to evaluate their own decisions. <span className="text-amber-400">Fix</span>: capture at the moment of the decision, in low-friction format. Even one sentence is better than none. Review weekly. The journal is the compounding mechanism &mdash; without it, you repeat mistakes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &middot; SKIPPING STAGES IN THE UPGRADE PATH</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator reads the war room description, jumps directly from one chart to six, and gets overwhelmed. Decisions degrade, P&amp;L drops, the operator concludes the war room framework does not work for them. Actually it does &mdash; they just skipped the apprenticeship. <span className="text-amber-400">Fix</span>: rebuild from stage one. 30 sessions per stage minimum. Earn each step before climbing. The framework rewards discipline; it does not reward shortcuts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Six mistakes, six fixes. Each fix is more disciplined than the mistake. Every drawdown traceable to one of these is preventable. The choreography IS the answer.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* GAME — The War Room Triage Challenge */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The War Room Triage Challenge</p>
        <h2 className="text-2xl font-extrabold mb-4">Five scenarios. Five decisions.</h2>

        <p className="text-gray-400 leading-relaxed mb-8">
          Each round presents a real war-room situation: alerts firing, watchlist decisions, mental state checks, degradation patterns, team disagreements. Your job is to apply the framework mechanically &mdash; priority order, capacity check, qualification gates, role-aware response. Wrong answers come with explanations. Pass threshold: get all five correct.
        </p>

        {!gameComplete ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            {/* Round indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest uppercase text-amber-400/60">
                Round {gameRoundIdx + 1} of {gameRounds.length}
              </span>
              <span className="text-xs text-gray-500">
                Score: {gameScore} / {gameRoundIdx + (gameAnswered ? 1 : 0)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-accent-400 transition-all duration-500"
                style={{ width: `${((gameRoundIdx + (gameAnswered ? 1 : 0)) / gameRounds.length) * 100}%` }}
              />
            </div>

            {/* Scenario */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 mb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Scenario</p>
              <p
                className="text-sm text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: gameRounds[gameRoundIdx].scenario }}
              />
            </div>

            {/* Prompt */}
            <p
              className="text-base font-bold text-white mb-4"
              dangerouslySetInnerHTML={{ __html: gameRounds[gameRoundIdx].prompt }}
            />

            {/* Options */}
            <div className="space-y-3 mb-4">
              {gameRounds[gameRoundIdx].options.map((opt) => {
                const isSel = gameSelected === opt.id;
                const isRight = opt.correct;
                const showResult = gameAnswered;
                let cls = 'w-full text-left p-4 rounded-xl border transition-all ';
                if (!showResult) {
                  cls += isSel
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20';
                } else {
                  if (isRight) cls += 'border-accent-400 bg-accent-500/10';
                  else if (isSel && !isRight) cls += 'border-red-500 bg-red-500/10';
                  else cls += 'border-white/5 bg-white/[0.01] opacity-50';
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={gameAnswered}
                    onClick={() => setGameSelected(opt.id)}
                    className={cls}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold tracking-widest uppercase text-gray-500 mt-1">{opt.id.toUpperCase()}</span>
                      <span className="text-sm text-gray-200 flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                      {showResult && isRight && <span className="text-accent-400 text-lg">&#10003;</span>}
                      {showResult && isSel && !isRight && <span className="text-red-400 text-lg">&#10005;</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explain block after answer */}
            {gameAnswered && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-4">
                <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Explanation</p>
                <p
                  className="text-sm text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: gameRounds[gameRoundIdx].options.find((o) => o.id === gameSelected)?.explain || '',
                  }}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              {!gameAnswered ? (
                <button
                  type="button"
                  disabled={!gameSelected}
                  onClick={() => {
                    if (!gameSelected) return;
                    const correct = gameRounds[gameRoundIdx].options.find((o) => o.id === gameSelected)?.correct;
                    if (correct) setGameScore((s) => s + 1);
                    setGameAnswered(true);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (gameRoundIdx < gameRounds.length - 1) {
                      setGameRoundIdx((i) => i + 1);
                      setGameSelected(null);
                      setGameAnswered(false);
                    } else {
                      setGameComplete(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition"
                >
                  {gameRoundIdx < gameRounds.length - 1 ? 'Next round' : 'Finish challenge'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent-400/30 bg-accent-500/5 p-8 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-accent-400 mb-3">Challenge Complete</p>
            <p className="text-5xl font-black text-white mb-2">
              {gameScore} <span className="text-accent-400">/</span> {gameRounds.length}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {gameScore === gameRounds.length
                ? 'Perfect read across all five scenarios. The choreography is yours.'
                : gameScore >= 3
                ? 'Solid triage discipline. Re-read the scenarios you missed and the relevant section.'
                : 'The triage protocol takes practice. Revisit S08, S11, and S15 and try again.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setGameRoundIdx(0);
                setGameSelected(null);
                setGameAnswered(false);
                setGameScore(0);
                setGameComplete(false);
              }}
              className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-gray-300 hover:bg-white/[0.05] transition"
            >
              Replay challenge
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* QUIZ — Knowledge Check */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Knowledge Check</p>
        <h2 className="text-2xl font-extrabold mb-4">Eight questions. Six to pass.</h2>

        <p className="text-gray-400 leading-relaxed mb-8">
          The quiz tests recall of the war room framework &mdash; chart roles, the median configuration, the HTF stack, alert categories, triage priority, session structure, journaling, and the upgrade staircase. Six correct out of eight unlocks the War Room Operator certificate.
        </p>

        {!quizComplete ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            {/* Question indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest uppercase text-amber-400/60">
                Question {quizIdx + 1} of {quizQuestions.length}
              </span>
              <span className="text-xs text-gray-500">
                Score: {quizScore} / {quizIdx + (quizAnswered ? 1 : 0)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-accent-400 transition-all duration-500"
                style={{ width: `${((quizIdx + (quizAnswered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <p
              className="text-base font-bold text-white mb-5"
              dangerouslySetInnerHTML={{ __html: quizQuestions[quizIdx].question }}
            />

            {/* Options */}
            <div className="space-y-3 mb-4">
              {quizQuestions[quizIdx].options.map((opt) => {
                const isSel = quizSelected === opt.id;
                const isRight = opt.correct;
                const showResult = quizAnswered;
                let cls = 'w-full text-left p-4 rounded-xl border transition-all ';
                if (!showResult) {
                  cls += isSel
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20';
                } else {
                  if (isRight) cls += 'border-accent-400 bg-accent-500/10';
                  else if (isSel && !isRight) cls += 'border-red-500 bg-red-500/10';
                  else cls += 'border-white/5 bg-white/[0.01] opacity-50';
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={quizAnswered}
                    onClick={() => setQuizSelected(opt.id)}
                    className={cls}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold tracking-widest uppercase text-gray-500 mt-1">{opt.id.toUpperCase()}</span>
                      <span className="text-sm text-gray-200 flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                      {showResult && isRight && <span className="text-accent-400 text-lg">&#10003;</span>}
                      {showResult && isSel && !isRight && <span className="text-red-400 text-lg">&#10005;</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explain block after answer */}
            {quizAnswered && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-4">
                <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Why</p>
                <p
                  className="text-sm text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: quizQuestions[quizIdx].explain }}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              {!quizAnswered ? (
                <button
                  type="button"
                  disabled={!quizSelected}
                  onClick={() => {
                    if (!quizSelected) return;
                    const correct = quizQuestions[quizIdx].options.find((o) => o.id === quizSelected)?.correct;
                    if (correct) setQuizScore((s) => s + 1);
                    setQuizAnswered(true);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (quizIdx < quizQuestions.length - 1) {
                      setQuizIdx((i) => i + 1);
                      setQuizSelected(null);
                      setQuizAnswered(false);
                    } else {
                      setQuizComplete(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition"
                >
                  {quizIdx < quizQuestions.length - 1 ? 'Next question' : 'Finish quiz'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent-400/30 bg-accent-500/5 p-8 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-accent-400 mb-3">Quiz Complete</p>
            <p className="text-5xl font-black text-white mb-2">
              {quizScore} <span className="text-accent-400">/</span> {quizQuestions.length}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {quizScore >= 6
                ? 'Pass. Your read of the war room framework is solid.'
                : 'Below pass threshold. Review the lesson sections above and try again.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuizIdx(0);
                setQuizSelected(null);
                setQuizAnswered(false);
                setQuizScore(0);
                setQuizComplete(false);
              }}
              className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-gray-300 hover:bg-white/[0.05] transition"
            >
              Retake quiz
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* CERT — War Room Operator */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
        <h2 className="text-2xl font-extrabold mb-4">{certUnlocked ? 'War Room Operator \u2014 unlocked.' : 'Complete the quiz to unlock the cert.'}</h2>

        {certUnlocked ? (
          <>
            <p className="text-gray-400 leading-relaxed mb-8">
              You now operate the war room as a single choreographed system. Charts have explicit roles. Alerts have categories and triage protocols. Sessions have phases. Decisions follow protocols. Trades get journaled. The Operations arc has begun, and from here the rest of Level 11 builds on this foundation.
            </p>

            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-black via-amber-950/20 to-black p-10 mb-8">
              {/* Conic certificate background */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: 'conic-gradient(from 90deg at 50% 50%, #FFB300, #26A69A, #FFB300, #26A69A, #FFB300)',
                }}
              />
              <div className="absolute inset-0 bg-black/70 pointer-events-none" />

              <div className="relative text-center">
                <p className="text-xs tracking-[0.4em] uppercase text-amber-400/80 mb-3">ATLAS Academy &middot; Level 11</p>
                <p className="text-3xl font-black text-white mb-2">War Room Operator</p>
                <p className="text-sm text-gray-400 mb-6">Certificate of Operations Mastery</p>

                <div className="w-20 h-px bg-amber-400/40 mx-auto mb-6" />

                <p className="text-xs text-gray-500 mb-1">Awarded for completion of</p>
                <p className="text-sm font-bold text-white mb-6">Cipher War Room Integration</p>

                <div className="inline-block px-4 py-2 rounded-lg border border-amber-400/30 bg-black/40">
                  <p className="text-[10px] tracking-widest uppercase text-amber-400/80">Cert ID</p>
                  <p className="text-xs font-mono text-white">PRO-CERT-L11.24</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU CAN DO NOW</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Build a war room calibrated to your scale. Assign chart roles deliberately. Architect alerts that surface signal rather than noise. Run pre-market routines that prepare each session. Triage incoming alerts mechanically under load. Capture trades in a journal that compounds. Recognize degradation early and downgrade when needed. Operate solo or in a two-trader team without coordination overhead consuming the multiplier.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATIONS ARC HAS BEGUN</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Lessons 11.16 through 11.23 taught what to read. Lesson 11.24 is the first lesson teaching how to operate the read at scale. The remaining four lessons (Trading Discipline, Asset-Class Adaptation, Failure Modes, Mastery Capstone) all assume you have the war room from this lesson and build on it.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT COMES NEXT</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Cipher Trading Discipline. The next lesson goes deeper on the psychological and behavioral discipline that the war room framework assumes. Tilt management, drawdown protocols, the math of position sizing under emotional pressure, the distinction between losses you accept and losses you hide from.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-gray-400">
              Complete the War Room Triage Challenge and the Knowledge Check (6/8) above to unlock the certificate.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="max-w-2xl mx-auto px-5 py-12 border-t border-white/5">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-amber-400/60 mb-2">Operations Arc Begins</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lesson 11.24 opens the Operations arc. Four lessons remain in Level 11, each building on the war room foundation toward the Mastery Capstone. From here the lessons stop teaching new modules and start refining the operational discipline that turns capability into consistent execution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/academy/lesson/cipher-candles"
              className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition"
            >
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-1">&larr; Previous</p>
              <p className="text-sm font-bold text-white">L11.23 &middot; Cipher Candles</p>
            </Link>
            <Link
              href="/academy/lesson/cipher-trading-discipline"
              className="flex-1 p-4 rounded-xl border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10 transition"
            >
              <p className="text-xs tracking-widest uppercase text-amber-400/80 mb-1">Next &rarr;</p>
              <p className="text-sm font-bold text-white">L11.25 &middot; Cipher Trading Discipline</p>
            </Link>
          </div>

          <div className="text-center pt-4 border-t border-white/5">
            <Link href="/academy" className="text-xs tracking-widest uppercase text-gray-500 hover:text-white transition">
              All Academy lessons
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
