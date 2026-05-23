// ============================================================
// L11.26 — Cipher Asset-Class Adaptation
// "The Framework Is Universal. The Calibration Is Local."
// Cert: Asset-Class Operator
// Slug: cipher-asset-class-adaptation
// Built 2026-05-21. Chassis: L11.11 byte-perfect + L11.25 capstone pattern.
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
// CONFETTI (cert reveal celebration)
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
    const particles = Array.from({ length: 120 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 4,
      g: 0.32,
      size: Math.random() * 6 + 3,
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
        p.life -= 0.006;
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
      if (frame < 220) rafRef.current = requestAnimationFrame(tick);
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
// ANIMATION 1 — FourCharactersAnim (Hero/S00)
// Four asset-class profile cards rotate into view; each holds a tiny
// synthesised chart showing the characteristic price pattern of that
// class. FX: slow ranging. Indices: open-burst then quiet. Crypto:
// weekend gap. Gold: news spike.
// 16-second loop (4s per class × 4).
// ============================================================
function FourCharactersAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR ASSET CLASSES \u2014 FOUR DISTINCT CHARACTERS', w / 2, 22);

    const classes = [
      {
        name: 'FOREX',
        sub: 'The Patient Asset',
        color: TEAL,
        chartPattern: 'slow-range',
        symbol: 'EURUSD',
        desc: 'Session-bound. News-driven. Slow ranging between session pivots.',
      },
      {
        name: 'INDICES',
        sub: 'The Session-Bound Asset',
        color: AMBER,
        chartPattern: 'open-burst',
        symbol: 'NAS100',
        desc: 'Sharp opens. Mid-session quiet. Discipline lives in timing.',
      },
      {
        name: 'CRYPTO',
        sub: 'The Reactive Asset',
        color: MAGENTA,
        chartPattern: 'weekend-gap',
        symbol: 'BTCUSD',
        desc: '24/7. No session boundaries. Gap risk across weekends.',
      },
      {
        name: 'GOLD / COMMODITIES',
        sub: 'The Macro Asset',
        color: '#0EA5E9',
        chartPattern: 'news-spike',
        symbol: 'XAUUSD',
        desc: 'Multi-surface news. Stronger trends than FX, harder chop than indices.',
      },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perClass = cycleDur / classes.length;
    const activeIdx = Math.floor(ct / perClass);
    const localT = (ct % perClass) / perClass;

    // 2x2 grid layout
    const cellW = (w - 60) / 2;
    const cellH = (h - 70) / 2;
    const startX = 20;
    const startY = 44;

    for (let i = 0; i < classes.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (cellW + 20);
      const cy = startY + row * (cellH + 20);
      const isActive = i === activeIdx;
      const c = classes[i];

      // Card background
      ctx.fillStyle = isActive ? `${c.color}1A` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isActive ? c.color : FAINT;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cellW, cellH, 8);
      ctx.fill();
      ctx.stroke();

      // Class header
      ctx.fillStyle = c.color;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.name, cx + 12, cy + 16);

      // Symbol badge (right side of header)
      ctx.fillStyle = DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(c.symbol, cx + cellW - 12, cy + 16);

      // Subtitle
      ctx.fillStyle = isActive ? WHITE : DIM;
      ctx.font = 'italic 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.sub, cx + 12, cy + 30);

      // Mini chart area
      const chartX = cx + 12;
      const chartY = cy + 38;
      const chartW = cellW - 24;
      const chartH = cellH - 70;

      // Chart bg
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(chartX, chartY, chartW, chartH);

      // Draw the chart pattern characteristic of this class
      drawClassPattern(ctx, c.chartPattern, chartX, chartY, chartW, chartH, isActive ? localT : 1, c.color);

      // Description at bottom (only when active)
      if (isActive) {
        const fade = Math.min(1, localT * 3);
        ctx.fillStyle = `rgba(255,255,255,${0.6 * fade})`;
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'left';
        // Word-wrap the description
        const words = c.desc.split(' ');
        let line = '';
        let ly = cy + cellH - 20;
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > chartW - 4 && line.length > 0) {
            ctx.fillText(line, chartX, ly);
            line = word + ' ';
            ly += 10;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, chartX, ly);
      }
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same CIPHER. Same engine. Four different operator postures.', w / 2, h - 8);
  }, []);

  // Helper — draws the chart pattern characteristic of each class
  function drawClassPattern(
    ctx: CanvasRenderingContext2D,
    pattern: string,
    x: number,
    y: number,
    w: number,
    h: number,
    progress: number,
    color: string
  ) {
    const midY = y + h / 2;
    const numBars = 20;
    const barW = w / numBars;

    if (pattern === 'slow-range') {
      // FX: slow oscillation between bounds
      for (let i = 0; i < Math.floor(numBars * progress); i++) {
        const phase = (i / numBars) * Math.PI * 2;
        const cy = midY + Math.sin(phase) * h * 0.25;
        const bull = Math.sin(phase) > 0;
        ctx.fillStyle = bull ? color : `${color}99`;
        ctx.fillRect(x + i * barW + 1, cy - 4, barW - 2, 8);
      }
    } else if (pattern === 'open-burst') {
      // Indices: 1-2 big bars at start, then small quiet ones
      for (let i = 0; i < Math.floor(numBars * progress); i++) {
        const isOpen = i < 3 || i > 17;
        const amplitude = isOpen ? h * 0.4 : h * 0.06;
        const dir = (i + Math.floor(i / 4)) % 2 === 0 ? 1 : -1;
        const cy = midY + dir * amplitude;
        const bull = dir < 0;
        ctx.fillStyle = bull ? color : `${color}88`;
        const barH = Math.abs(amplitude) * 0.8;
        ctx.fillRect(x + i * barW + 1, Math.min(cy, midY), barW - 2, barH);
      }
    } else if (pattern === 'weekend-gap') {
      // Crypto: bars trending up, then a visible gap, then bars resume lower
      for (let i = 0; i < Math.floor(numBars * progress); i++) {
        let offsetY: number;
        if (i < 10) {
          offsetY = -i * h * 0.02;
        } else {
          // Gap down: shift baseline
          offsetY = -10 * h * 0.02 + h * 0.18 + (i - 10) * h * 0.005;
        }
        const cy = midY + offsetY;
        const bull = i < 10 || i > 13;
        ctx.fillStyle = bull ? color : `${color}99`;
        ctx.fillRect(x + i * barW + 1, cy - 3, barW - 2, 6);
      }
      // Draw the gap marker
      if (progress > 0.5) {
        const gapX = x + 10 * barW;
        ctx.strokeStyle = `${color}88`;
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gapX, y);
        ctx.lineTo(gapX, y + h);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (pattern === 'news-spike') {
      // Gold: trending up, sharp spike at mid, then resolution
      for (let i = 0; i < Math.floor(numBars * progress); i++) {
        let offsetY: number;
        if (i === 10 || i === 11) {
          offsetY = -h * 0.32;
        } else if (i === 12) {
          offsetY = -h * 0.08;
        } else {
          offsetY = -i * h * 0.012;
        }
        const cy = midY + offsetY;
        const bull = (i % 3) !== 1;
        ctx.fillStyle = bull ? color : `${color}99`;
        const barH = i === 10 || i === 11 ? 10 : 6;
        ctx.fillRect(x + i * barW + 1, cy - barH / 2, barW - 2, barH);
      }
    }
  }

  return <AnimScene draw={draw} aspectRatio={1.4} />;
}

// ============================================================
// ============================================================
// ANIMATION 2 — SessionBoundClockAnim (S03 Forex)
// 24-hour clock with session bands (Asia/London/NY) highlighted in
// turn. London-NY overlap zone glows brightest. Caption: "The patient
// asset trades on the clock. Engage during overlap; abstain otherwise."
// 12-second loop.
// ============================================================
function SessionBoundClockAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOREX 24-HOUR SESSION CLOCK', w / 2, 22);

    // Clock center
    const cx = w / 2;
    const cy = h / 2 + 8;
    const r = Math.min(w * 0.32, h * 0.4);

    const cycleDur = 12;
    const ct = t % cycleDur;

    // Sessions defined by UTC hours [start, end, name, color, weight]
    const sessions = [
      { start: 0, end: 7, name: 'ASIA', color: '#0EA5E9' },         // Tokyo
      { start: 7, end: 13, name: 'LONDON', color: TEAL },           // London
      { start: 13, end: 16, name: 'OVERLAP', color: AMBER },        // London-NY
      { start: 16, end: 21, name: 'NEW YORK', color: TEAL },        // NY
      { start: 21, end: 24, name: 'QUIET', color: '#666' },         // After NY close
    ];

    // Hour markers around the clock
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    for (let h24 = 0; h24 < 24; h24++) {
      const angle = (h24 / 24) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * (r - 4);
      const y1 = cy + Math.sin(angle) * (r - 4);
      const x2 = cx + Math.cos(angle) * (r + 4);
      const y2 = cy + Math.sin(angle) * (r + 4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (h24 % 6 === 0) {
        ctx.fillStyle = DIM;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lx = cx + Math.cos(angle) * (r + 16);
        const ly = cy + Math.sin(angle) * (r + 16);
        ctx.fillText(h24 + ':00', lx, ly);
      }
    }
    ctx.textBaseline = 'alphabetic';

    // Session arcs — pulse the active session
    const activeSessionIdx = Math.floor((ct / cycleDur) * sessions.length);
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const isActive = i === activeSessionIdx;
      const a1 = (s.start / 24) * Math.PI * 2 - Math.PI / 2;
      const a2 = (s.end / 24) * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = isActive ? s.color : `${s.color}50`;
      ctx.lineWidth = isActive ? 8 : 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a1, a2);
      ctx.stroke();

      if (isActive) {
        // Glow the active arc
        ctx.strokeStyle = `${s.color}30`;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(cx, cy, r, a1, a2);
        ctx.stroke();

        // Show active session label in center
        ctx.fillStyle = s.color;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.name, cx, cy - 6);
        ctx.fillStyle = WHITE;
        ctx.font = '9px Inter, sans-serif';
        const verdict = s.name === 'OVERLAP' ? 'PEAK ENGAGEMENT' :
                        s.name === 'LONDON' || s.name === 'NEW YORK' ? 'ENGAGE' :
                        s.name === 'ASIA' ? 'STUDY MODE' : 'STAND DOWN';
        ctx.fillText(verdict, cx, cy + 14);
      }
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The patient asset trades on the clock. London-NY overlap is peak liquidity.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.5} />;
}

// ============================================================
// ANIMATION 3 — IndexOpenCloseAnim (S04 Indices)
// A simulated NAS100 session with three highlighted windows: opening
// 30 min (red volatility zone), mid-session (teal calm zone), closing
// 30 min (red volatility zone). Animated playhead sweeps through the
// session showing where signals fire vs where to skip.
// 14-second loop.
// ============================================================
function IndexOpenCloseAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INDICES \u2014 OPEN, MID-SESSION, CLOSE WINDOWS', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;
    const sessionProgress = ct / cycleDur;

    // Session timeline (x-axis represents 6.5h trading session)
    const chartX = 30;
    const chartY = 50;
    const chartW = w - 60;
    const chartH = h * 0.45;

    // Background zones: open(red) / mid(teal) / close(red)
    const openW = chartW * 0.077;   // first 30 min of 6.5h
    const closeW = chartW * 0.077;  // last 30 min
    const midX = chartX + openW;
    const midW = chartW - openW - closeW;
    const closeX = chartX + chartW - closeW;

    // Open window (skip)
    ctx.fillStyle = 'rgba(239,83,80,0.10)';
    ctx.fillRect(chartX, chartY, openW, chartH);
    ctx.strokeStyle = `${MAGENTA}66`;
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, openW, chartH);

    // Mid-session (engage)
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(midX, chartY, midW, chartH);
    ctx.strokeStyle = `${TEAL}66`;
    ctx.strokeRect(midX, chartY, midW, chartH);

    // Close window (skip)
    ctx.fillStyle = 'rgba(239,83,80,0.10)';
    ctx.fillRect(closeX, chartY, closeW, chartH);
    ctx.strokeStyle = `${MAGENTA}66`;
    ctx.strokeRect(closeX, chartY, closeW, chartH);

    // Synthetic price action — volatile at edges, calm in middle
    const numBars = 40;
    const barW = chartW / numBars;
    const midY = chartY + chartH * 0.5;
    for (let i = 0; i < numBars; i++) {
      const xPos = chartX + i * barW;
      let amplitude: number;
      if (i < 3) amplitude = chartH * 0.4 * Math.sin(i * 1.5);            // sharp open
      else if (i > 36) amplitude = chartH * 0.35 * Math.sin(i * 1.8);     // sharp close
      else amplitude = chartH * 0.08 * Math.sin(i * 0.5);                  // calm middle
      const cyB = midY + amplitude;
      const bull = amplitude < 0;
      ctx.fillStyle = bull ? TEAL : MAGENTA;
      const barH = Math.abs(amplitude) * 0.7 + 3;
      ctx.fillRect(xPos + 1, Math.min(cyB, midY), barW - 2, barH);
    }

    // Playhead
    const playX = chartX + sessionProgress * chartW;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playX, chartY - 4);
    ctx.lineTo(playX, chartY + chartH + 4);
    ctx.stroke();

    // Zone labels above the chart
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SKIP \u2014 OPEN', chartX + openW / 2, chartY - 6);
    ctx.fillStyle = TEAL;
    ctx.fillText('ENGAGE \u2014 MID-SESSION', midX + midW / 2, chartY - 6);
    ctx.fillStyle = MAGENTA;
    ctx.fillText('SKIP \u2014 CLOSE', closeX + closeW / 2, chartY - 6);

    // Live verdict
    let zoneVerdict: string;
    let zoneColor: string;
    if (playX < midX) { zoneVerdict = 'OPEN VOLATILITY \u2014 SKIP'; zoneColor = MAGENTA; }
    else if (playX > closeX) { zoneVerdict = 'CLOSE VOLATILITY \u2014 SKIP'; zoneColor = MAGENTA; }
    else { zoneVerdict = 'MID-SESSION \u2014 ENGAGE QUALIFIED SIGNALS'; zoneColor = TEAL; }

    const verdictY = chartY + chartH + 36;
    ctx.fillStyle = zoneColor;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zoneVerdict, w / 2, verdictY);

    // Time labels under chart
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('09:30 OPEN', chartX, chartY + chartH + 14);
    ctx.fillText('10:00', midX, chartY + chartH + 14);
    ctx.fillText('15:30', closeX, chartY + chartH + 14);
    ctx.textAlign = 'right';
    ctx.fillText('16:00 CLOSE', chartX + chartW, chartY + chartH + 14);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Indices live in three windows. Two are noise, one is signal.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 4 — ★ CryptoGapRiskAnim (S05 Crypto)
// Shows a position with a stop-loss → fast-forward to Sunday open →
// gap blows past the stop → broker fills at the much-worse next-best
// price → position closes at far worse than the planned R. Side panel
// compares the same scenario in FX (broker-protected stop honoured).
// 16-second loop.
// ============================================================
function CryptoGapRiskAnim() {
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

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605 CRYPTO WEEKEND GAP RISK \u2014 WHY THE STOP DOESN\'T PROTECT', w / 2, 22);

    const cycleDur = 16;
    const ct = t % cycleDur;

    // Left chart: BTC weekend gap. Right panel: FX comparison.
    const chartX1 = 24;
    const chartY = 50;
    const chartW = (w - 64) / 2;
    const chartH = h * 0.5;
    const chartX2 = chartX1 + chartW + 16;

    // ── LEFT: BTCUSD weekend gap ──
    ctx.fillStyle = 'rgba(239,83,80,0.04)';
    ctx.strokeStyle = `${MAGENTA}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartX1, chartY, chartW, chartH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BTCUSD \u2014 SUNDAY OPEN', chartX1 + 8, chartY + 12);

    // Bars: trending up, then gap down at "Sunday open" point
    const numBars = 16;
    const barW = chartW / numBars;
    const midY = chartY + chartH * 0.5;
    const gapBar = 10;
    const playProgress = Math.min(1, ct / 8);
    const barsToDraw = Math.floor(numBars * playProgress);

    // Entry price (planned)
    const entryY = midY - chartH * 0.08;
    // Stop loss (planned)
    const stopY = midY + chartH * 0.05;
    // Actual fill after gap
    const fillY = midY + chartH * 0.32;

    for (let i = 0; i < barsToDraw; i++) {
      const x = chartX1 + i * barW + 2;
      let cy: number;
      if (i < gapBar) {
        cy = midY - i * chartH * 0.015;
      } else {
        cy = fillY + (i - gapBar) * chartH * 0.005;
      }
      const bull = i < gapBar - 1;
      ctx.fillStyle = bull ? `${TEAL}AA` : `${MAGENTA}AA`;
      ctx.fillRect(x, cy - 4, barW - 4, 8);
    }

    // Draw the entry line
    if (ct > 1) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(chartX1, entryY);
      ctx.lineTo(chartX1 + chartW, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ENTRY', chartX1 + chartW - 4, entryY - 2);
    }

    // Draw the stop loss line (planned)
    if (ct > 2) {
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartX1, stopY);
      ctx.lineTo(chartX1 + chartW, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('PLANNED STOP \u2014 -1R', chartX1 + chartW - 4, stopY + 9);
    }

    // Draw the actual fill line after gap
    if (ct > 9) {
      const fade = Math.min(1, (ct - 9) / 1.5);
      ctx.strokeStyle = `${RED}${Math.floor(fade * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chartX1, fillY);
      ctx.lineTo(chartX1 + chartW, fillY);
      ctx.stroke();
      ctx.fillStyle = `${RED}${Math.floor(fade * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ACTUAL FILL \u2014 -3.5R', chartX1 + chartW - 4, fillY + 14);

      // Gap-down indicator
      const gapX = chartX1 + gapBar * barW;
      ctx.strokeStyle = `${RED}${Math.floor(fade * 200).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(gapX, stopY);
      ctx.lineTo(gapX, fillY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Sunday open label
    if (ct > 5) {
      const labelX = chartX1 + gapBar * barW;
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUN OPEN', labelX, chartY - 4);
    }

    // ── RIGHT: FX equivalent ──
    ctx.fillStyle = 'rgba(38,166,154,0.04)';
    ctx.strokeStyle = `${TEAL}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartX2, chartY, chartW, chartH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EURUSD \u2014 SUNDAY OPEN', chartX2 + 8, chartY + 12);

    // FX bars: same setup, small gap, broker honours stop
    for (let i = 0; i < barsToDraw; i++) {
      const x = chartX2 + i * barW + 2;
      let cy: number;
      if (i < gapBar) {
        cy = midY - i * chartH * 0.015;
      } else if (i === gapBar) {
        cy = midY + chartH * 0.07; // small gap
      } else {
        cy = midY + chartH * 0.06 + (i - gapBar) * chartH * 0.005;
      }
      const bull = i < gapBar - 1;
      ctx.fillStyle = bull ? `${TEAL}AA` : `${MAGENTA}AA`;
      ctx.fillRect(x, cy - 4, barW - 4, 8);
    }

    if (ct > 1) {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(chartX2, entryY);
      ctx.lineTo(chartX2 + chartW, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ENTRY', chartX2 + chartW - 4, entryY - 2);
    }

    if (ct > 2) {
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartX2, stopY);
      ctx.lineTo(chartX2 + chartW, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('STOP \u2014 -1R (honoured)', chartX2 + chartW - 4, stopY + 9);
    }

    // Final caption
    if (ct > 11) {
      const fade = Math.min(1, (ct - 11) / 2);
      ctx.fillStyle = `rgba(255,179,0,${fade})`;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAME STOP. SAME ENTRY. DIFFERENT ASSET CLASS. 3.5x THE LOSS.', w / 2, h - 24);
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Crypto stops are not protected during weekend illiquidity. Flatten before Friday close.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 5 — GoldNewsSurfaceAnim (S06 Gold)
// Three news-event types fire in sequence — CPI, geopolitical event,
// FOMC. Each causes a sharp price spike. Operator-discipline window
// (30 min pre + 30 min post) visualised as a vertical no-trade band.
// 18-second loop (6s per event x 3).
// ============================================================
function GoldNewsSurfaceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOLD \u2014 THREE NEWS SURFACES, ONE DISCIPLINE', w / 2, 22);

    const events = [
      { name: 'CPI PRINT', source: 'INFLATION', spike: -0.3 },
      { name: 'GEOPOLITICAL', source: 'RISK-OFF', spike: 0.4 },
      { name: 'FOMC DECISION', source: 'RATES', spike: -0.25 },
    ];

    const cycleDur = 18;
    const ct = t % cycleDur;
    const perEvent = cycleDur / events.length;
    const eventIdx = Math.floor(ct / perEvent);
    const localT = (ct % perEvent) / perEvent;
    const event = events[eventIdx];

    // Chart layout
    const chartX = 30;
    const chartY = 50;
    const chartW = w - 60;
    const chartH = h * 0.55;
    const baseY = chartY + chartH * 0.5;

    // Background grid
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, baseY);
    ctx.lineTo(chartX + chartW, baseY);
    ctx.stroke();

    // News window — 30 min pre + spike + 30 min post = "no-trade band"
    const numBars = 24;
    const barW = chartW / numBars;
    const eventBarIdx = 12;  // event lands at bar 12
    const newsWindowStartBar = 10;
    const newsWindowEndBar = 14;
    const windowStartX = chartX + newsWindowStartBar * barW;
    const windowEndX = chartX + newsWindowEndBar * barW;

    // No-trade band overlay
    if (localT > 0.2) {
      const fade = Math.min(1, (localT - 0.2) / 0.2);
      ctx.fillStyle = `rgba(255,23,68,${0.10 * fade})`;
      ctx.fillRect(windowStartX, chartY, windowEndX - windowStartX, chartH);
      ctx.strokeStyle = `rgba(255,23,68,${0.6 * fade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(windowStartX, chartY, windowEndX - windowStartX, chartH);
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,23,68,${0.9 * fade})`;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO TRADE', (windowStartX + windowEndX) / 2, chartY + 14);
    }

    // Draw bars — calm before, spike at event, settle after
    const barsToDraw = Math.floor(numBars * Math.min(1, localT * 1.3));
    for (let i = 0; i < barsToDraw; i++) {
      const x = chartX + i * barW + 1;
      let offsetY: number;
      if (i < eventBarIdx) {
        offsetY = Math.sin(i * 0.5) * chartH * 0.04;
      } else if (i === eventBarIdx || i === eventBarIdx + 1) {
        offsetY = event.spike * chartH * 0.7;
      } else {
        offsetY = event.spike * chartH * 0.6 + Math.sin(i * 0.4) * chartH * 0.03;
      }
      const cy = baseY + offsetY;
      const bull = offsetY < 0;
      ctx.fillStyle = bull ? `${TEAL}DD` : `${MAGENTA}DD`;
      const barH = i === eventBarIdx || i === eventBarIdx + 1 ? 14 : 6;
      ctx.fillRect(x, cy - barH / 2, barW - 2, barH);
    }

    // Event marker arrow above
    if (localT > 0.5) {
      const arrowX = chartX + eventBarIdx * barW + barW / 2;
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`\u2193 ${event.name}`, arrowX, chartY - 4);
    }

    // Side panel — event details
    const panelX = chartX;
    const panelY = chartY + chartH + 16;
    ctx.fillStyle = `${AMBER}1A`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, chartW, h - panelY - 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SURFACE ${eventIdx + 1} OF 3 \u2014 ${event.source}`, panelX + 8, panelY + 14);
    ctx.fillStyle = WHITE;
    ctx.font = '8px Inter, sans-serif';
    const detail = event.source === 'INFLATION'
      ? 'CPI affects gold via real-yield path. Hot CPI \u2192 hawkish Fed \u2192 stronger USD \u2192 gold sells.'
      : event.source === 'RISK-OFF'
      ? 'Geopolitical risk drives safe-haven flows. Conflict announcements typically spike gold higher.'
      : 'FOMC decisions and dot-plot reshape rate path. Hawkish surprise \u2192 USD up \u2192 gold down.';
    ctx.fillText(detail, panelX + 8, panelY + 28);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('Disciplined response: hard-skip 30 min pre and 30 min post. Re-engage at minute 31+.', panelX + 8, panelY + 42);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gold reacts on three surfaces. The discipline rule is one envelope across all three.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 6 — ★★ EngineCalibrationDial (S07 What Self-Calibrates)
// A central dial labelled "ENGINE WIDTH"; four side cards labelled
// FX/Indices/Crypto/Gold sequentially activate. Each activation rotates
// the dial to a different position (tighter/baseline/intermediate/
// tighter) and updates a side-panel showing what changed: signal
// engine width, body filter, TS threshold, macro reference.
// Crucially: no numbers, no variable names. Only "tighter / baseline /
// intermediate / widest" + behavioural verdicts.
// 20-second loop (5s per class x 4).
// ============================================================
function EngineCalibrationDial() {
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
    ctx.fillText('\u2605\u2605 ENGINE CALIBRATION \u2014 WATCH WHAT CHANGES PER CLASS', w / 2, 22);

    const classes = [
      {
        name: 'FX',
        symbol: 'EURUSD',
        color: TEAL,
        engineWidth: 'tighter',
        bodyFilter: 'low threshold',
        tsThreshold: 'tightest',
        macroRefs: 'DXY \u00B7 US10Y',
        dialAngle: -0.6,
      },
      {
        name: 'INDICES',
        symbol: 'NAS100',
        color: AMBER,
        engineWidth: 'baseline',
        bodyFilter: 'mid threshold',
        tsThreshold: 'intermediate',
        macroRefs: 'VIX \u00B7 SPX',
        dialAngle: -0.2,
      },
      {
        name: 'CRYPTO',
        symbol: 'BTCUSD',
        color: MAGENTA,
        engineWidth: 'intermediate',
        bodyFilter: 'mid threshold',
        tsThreshold: 'intermediate',
        macroRefs: 'BTC.D \u00B7 USDT.D',
        dialAngle: -0.4,
      },
      {
        name: 'GOLD',
        symbol: 'XAUUSD',
        color: SKY,
        engineWidth: 'tighter',
        bodyFilter: 'low threshold',
        tsThreshold: 'tightest',
        macroRefs: 'DXY \u00B7 US10Y',
        dialAngle: -0.55,
      },
    ];

    const cycleDur = 20;
    const ct = t % cycleDur;
    const perClass = cycleDur / classes.length;
    const idx = Math.floor(ct / perClass);
    const localT = (ct % perClass) / perClass;
    const klass = classes[idx];

    // ── Central dial ──
    const dialX = w * 0.32;
    const dialY = h * 0.5 + 8;
    const dialR = Math.min(w * 0.18, h * 0.32);

    // Arc background (the engine-width range)
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Arc tick marks: tighter ← baseline → widest
    const tickLabels = ['tighter', 'baseline', 'wider'];
    for (let i = 0; i < tickLabels.length; i++) {
      const angle = Math.PI * 0.75 + (i / (tickLabels.length - 1)) * Math.PI * 1.5;
      const x1 = dialX + Math.cos(angle) * (dialR - 6);
      const y1 = dialY + Math.sin(angle) * (dialR - 6);
      const x2 = dialX + Math.cos(angle) * (dialR + 6);
      const y2 = dialY + Math.sin(angle) * (dialR + 6);
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      const lx = dialX + Math.cos(angle) * (dialR + 18);
      const ly = dialY + Math.sin(angle) * (dialR + 18);
      ctx.fillText(tickLabels[i], lx, ly);
    }

    // Dial needle — animates to the class's position
    const targetAngle = Math.PI * 0.75 + (klass.dialAngle + 1) / 2 * Math.PI * 1.5;
    const ease = Math.min(1, localT * 4);
    const prevIdx = (idx - 1 + classes.length) % classes.length;
    const prevAngle = Math.PI * 0.75 + (classes[prevIdx].dialAngle + 1) / 2 * Math.PI * 1.5;
    const currentAngle = prevAngle + (targetAngle - prevAngle) * ease;

    ctx.strokeStyle = klass.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + Math.cos(currentAngle) * (dialR - 10), dialY + Math.sin(currentAngle) * (dialR - 10));
    ctx.stroke();
    ctx.fillStyle = klass.color;
    ctx.beginPath();
    ctx.arc(dialX, dialY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Class label center
    ctx.fillStyle = klass.color;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(klass.name, dialX, dialY + dialR + 28);
    ctx.fillStyle = WHITE;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(klass.symbol, dialX, dialY + dialR + 42);

    // ── Side panel — calibration details ──
    const panelX = w * 0.55;
    const panelY = 50;
    const panelW = w - panelX - 20;
    const panelH = h - 80;

    ctx.fillStyle = `${klass.color}14`;
    ctx.strokeStyle = klass.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = klass.color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AUTOMATIC CALIBRATION', panelX + 10, panelY + 16);

    const atoms = [
      { label: 'SIGNAL ENGINE WIDTH', value: klass.engineWidth },
      { label: 'BODY FILTER', value: klass.bodyFilter },
      { label: 'TS THRESHOLD', value: klass.tsThreshold },
      { label: 'MACRO REFS', value: klass.macroRefs },
    ];

    const fadeIn = Math.min(1, localT * 3);
    for (let i = 0; i < atoms.length; i++) {
      const ay = panelY + 36 + i * 28;
      ctx.fillStyle = `rgba(255,255,255,${0.45 * fadeIn})`;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText(atoms[i].label, panelX + 10, ay);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * fadeIn})`;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(atoms[i].value, panelX + 10, ay + 13);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = 'italic 7px Inter, sans-serif';
    ctx.fillText('All four self-route. You configure none of this.', panelX + 10, panelY + panelH - 8);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Universal framework. Local calibration. The engine adapts; the operator notices.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 7 — MacroContextRouterAnim (S07 / S11)
// Four assets shown in a row at top; the Bias row dashboard cell at
// bottom. For each asset in sequence, the two macro reference symbols
// fly down into the Bias row, updating its read. Shows that the
// references are per-asset auto-routed, not user-configured.
// 16-second loop.
// ============================================================
function MacroContextRouterAnim() {
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
    ctx.fillText('MACRO CONTEXT \u2014 AUTO-ROUTES PER ASSET CLASS', w / 2, 22);

    const assets = [
      { name: 'EURUSD', color: TEAL, ref1: 'DXY', ref2: 'US10Y', bias: 'USD BULL \u2014 FAVOR SHORTS' },
      { name: 'NAS100', color: AMBER, ref1: 'VIX', ref2: 'SPX', bias: 'RISK ON \u2014 FAVOR LONGS' },
      { name: 'BTCUSD', color: MAGENTA, ref1: 'BTC.D', ref2: 'USDT.D', bias: 'RISK OFF \u2014 FAVOR SHORTS' },
      { name: 'XAUUSD', color: SKY, ref1: 'DXY', ref2: 'US10Y', bias: 'USD BULL \u2014 FAVOR SHORTS' },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perAsset = cycleDur / assets.length;
    const idx = Math.floor(ct / perAsset);
    const localT = (ct % perAsset) / perAsset;
    const asset = assets[idx];

    // Asset row at top
    const assetRowY = 50;
    const assetW = (w - 80) / 4;
    for (let i = 0; i < assets.length; i++) {
      const ax = 30 + i * (assetW + 10);
      const isActive = i === idx;
      ctx.fillStyle = isActive ? `${assets[i].color}26` : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = isActive ? assets[i].color : FAINT;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(ax, assetRowY, assetW, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isActive ? assets[i].color : DIM;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(assets[i].name, ax + assetW / 2, assetRowY + 20);
    }

    // Bias row at bottom (mock Command Center cell)
    const biasY = h - 70;
    const biasH = 38;
    const biasX = 30;
    const biasW = w - 60;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(biasX, biasY, biasW, biasH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = DIM;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER PRO \u00B7 BIAS ROW', biasX + 8, biasY + 12);

    // Flying refs — animate from the active asset card down to the bias row
    const startX = 30 + idx * (assetW + 10) + assetW / 2;
    const startY = assetRowY + 32;
    const flyT = Math.min(1, localT * 2.5);
    const ease = 1 - Math.pow(1 - flyT, 3);

    // Ref 1 lands left side of bias
    const ref1EndX = biasX + biasW * 0.32;
    const refY = biasY + 22;
    const ref1X = startX + (ref1EndX - startX) * ease;
    const ref1Y = startY + (refY - startY) * ease;
    ctx.fillStyle = asset.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(asset.ref1 + '\u25B2', ref1X, ref1Y);

    // Ref 2 lands middle of bias
    const ref2EndX = biasX + biasW * 0.5;
    const ref2X = startX + (ref2EndX - startX) * ease;
    ctx.fillText(asset.ref2 + '\u25B2', ref2X, ref1Y);

    // Bias verdict (right side) — appears after refs land
    if (localT > 0.6) {
      const fade = Math.min(1, (localT - 0.6) / 0.3);
      ctx.fillStyle = `${asset.color}${Math.floor(fade * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(asset.bias, biasX + biasW - 8, biasY + 26);
    }

    // Active asset label between asset row and bias row
    ctx.fillStyle = asset.color;
    ctx.font = 'italic 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Load CIPHER on ${asset.name} \u2192 Bias row auto-routes to ${asset.ref1} and ${asset.ref2}`, w / 2, biasY - 14);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Crypto reads BTC.D/USDT.D. FX and Gold read DXY/US10Y. Stocks/Indices read VIX/SPX.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// === PHASE_2A_ANIMATION_INSERT_POINT ===
// Animations 2-7 land here (Phase 2A):
//   2. SessionBoundClockAnim
//   3. IndexOpenCloseAnim
//   4. CryptoGapRiskAnim ★
//   5. GoldNewsSurfaceAnim
//   6. EngineCalibrationDial ★★
//   7. MacroContextRouterAnim
// ============================================================

// ============================================================
// ============================================================
// ANIMATION 8 — PerClassSizingAnim (S10)
// Four horizontal bars representing baseline R per asset class.
// FX baseline = 1.0R reference. Bars shrink to show per-class ratios:
// Indices ~0.6R, Gold ~0.7R, Crypto ~0.5R. Each bar animates in
// sequence with its per-class reasoning text.
// 16-second loop (4s per class x 4).
// ============================================================
function PerClassSizingAnim() {
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
    ctx.fillText('PER-CLASS SIZING \u2014 BASELINE R BY ASSET CHARACTER', w / 2, 22);

    const classes = [
      {
        name: 'FX',
        symbol: 'EURUSD',
        color: TEAL,
        ratio: 1.0,
        reason: 'Reference baseline. Broker-protected stops, scheduled news, session-bound rhythm.',
      },
      {
        name: 'GOLD',
        symbol: 'XAUUSD',
        color: SKY,
        ratio: 0.7,
        reason: 'Slightly tighter than FX. Macro surprise risk on CPI/NFP/FOMC; news envelope is mandatory.',
      },
      {
        name: 'INDICES',
        symbol: 'NAS100',
        color: AMBER,
        ratio: 0.6,
        reason: 'Tighter. Wider point ranges hit stops faster; the mid-session signal frequency adds cumulative exposure.',
      },
      {
        name: 'CRYPTO',
        symbol: 'BTCUSD',
        color: MAGENTA,
        ratio: 0.5,
        reason: 'Tightest. Weekend gap risk means the planned R is the floor of your loss, not the cap.',
      },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perClass = cycleDur / classes.length;
    const activeIdx = Math.floor(ct / perClass);
    const localT = (ct % perClass) / perClass;

    const chartLeft = 40;
    const chartRight = w - 40;
    const chartTop = 50;
    const rowH = 32;
    const barMaxW = chartRight - chartLeft - 100;

    // 1R reference grid line
    const oneRX = chartLeft + 100 + barMaxW;
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(oneRX, chartTop - 8);
    ctx.lineTo(oneRX, chartTop + classes.length * rowH + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DIM;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1.0R', oneRX, chartTop - 12);

    // 0.5R reference grid
    const halfRX = chartLeft + 100 + barMaxW * 0.5;
    ctx.strokeStyle = `${FAINT}`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(halfRX, chartTop - 8);
    ctx.lineTo(halfRX, chartTop + classes.length * rowH + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DIM;
    ctx.fillText('0.5R', halfRX, chartTop - 12);

    // Bars
    for (let i = 0; i < classes.length; i++) {
      const c = classes[i];
      const ry = chartTop + i * rowH + rowH / 2;
      const isActive = i === activeIdx;

      // Label (left)
      ctx.fillStyle = isActive ? c.color : DIM;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.name, chartLeft, ry + 4);
      ctx.fillStyle = isActive ? WHITE : DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(c.symbol, chartLeft, ry + 14);

      // Bar — animate width on activation
      let displayRatio = c.ratio;
      if (isActive && localT < 0.4) {
        displayRatio = c.ratio * (localT / 0.4);
      }
      const barW = barMaxW * displayRatio;
      ctx.fillStyle = isActive ? c.color : `${c.color}55`;
      ctx.beginPath();
      ctx.roundRect(chartLeft + 100, ry - 6, barW, 12, 3);
      ctx.fill();

      // R-value at end of bar
      if (isActive) {
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(c.ratio.toFixed(1) + 'R', chartLeft + 100 + barW + 8, ry + 4);
      }
    }

    // Active class reason at bottom
    const reasonY = chartTop + classes.length * rowH + 28;
    ctx.fillStyle = classes[activeIdx].color;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${classes[activeIdx].name} REASONING`, w / 2, reasonY);

    // Word-wrap the reason
    const reason = classes[activeIdx].reason;
    const fadeIn = Math.min(1, localT * 3);
    ctx.fillStyle = `rgba(255,255,255,${0.8 * fadeIn})`;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const words = reason.split(' ');
    let line = '';
    let ly = reasonY + 14;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > w - 80 && line.length > 0) {
        ctx.fillText(line, w / 2, ly);
        line = word + ' ';
        ly += 12;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, w / 2, ly);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('Baselines are starting points. Adjust further down per personal risk policy.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.5} />;
}

// ============================================================
// ANIMATION 9 — ★★★ CrossAssetCorrelationWidget (S11)
// Interactive widget. Three buttons (DXY UP, VIX UP, BTC.D UP) toggle
// macro events. A 12-asset grid lights up showing the favoured bias
// per asset under each macro condition. The lesson's centerpiece.
// ============================================================
function CrossAssetCorrelationWidget() {
  type Macro = 'dxy' | 'vix' | 'btcd' | 'none';
  const [active, setActive] = useState<Macro>('none');

  // Each asset has a defined response per macro event
  const assets = [
    { ticker: 'EURUSD', class: 'FX', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'GBPUSD', class: 'FX', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'USDJPY', class: 'FX', dxy: 'long', vix: 'long', btcd: 'neutral' },
    { ticker: 'AUDUSD', class: 'FX', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'NAS100', class: 'IDX', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'SPX500', class: 'IDX', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'XAUUSD', class: 'COM', dxy: 'short', vix: 'long', btcd: 'neutral' },
    { ticker: 'USOIL', class: 'COM', dxy: 'short', vix: 'short', btcd: 'neutral' },
    { ticker: 'BTCUSD', class: 'CRY', dxy: 'short', vix: 'short', btcd: 'long' },
    { ticker: 'ETHUSD', class: 'CRY', dxy: 'short', vix: 'short', btcd: 'short' },
    { ticker: 'SOLUSD', class: 'CRY', dxy: 'short', vix: 'short', btcd: 'short' },
    { ticker: 'AVAXUSD', class: 'CRY', dxy: 'short', vix: 'short', btcd: 'short' },
  ];

  const explanations: Record<Macro, string> = {
    none: 'Click a macro condition to see which assets favour longs vs shorts. Each lights up to show the operator-bias tilt produced by that condition.',
    dxy: 'DXY rising = broad USD strength. Most non-USD assets sell against this; USDJPY (USD numerator) buys with it. Crypto correlates with risk-off when USD strengthens.',
    vix: 'VIX rising = risk-off. Equity indices sell, safe-haven USDJPY and Gold buy, crypto sells. The discipline tilt is universal: reduce all risk-on exposure.',
    btcd: 'BTC.D rising = Bitcoin dominance increasing within crypto. BTC buys; alts (ETH, SOL, AVAX) sell. This is the intra-crypto rotation signal, not a macro signal.',
  };

  const macroButtons: { key: Macro; label: string; color: string }[] = [
    { key: 'dxy', label: 'DXY \u25B2', color: '#26A69A' },
    { key: 'vix', label: 'VIX \u25B2', color: '#EF5350' },
    { key: 'btcd', label: 'BTC.D \u25B2', color: '#FFB300' },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-black/30 p-5 select-none">
      <p className="text-xs font-bold text-amber-400 mb-3 text-center tracking-widest">
        &#9733;&#9733;&#9733; CROSS-ASSET CORRELATION &mdash; CLICK A MACRO CONDITION
      </p>

      {/* Macro buttons */}
      <div className="flex gap-2 justify-center mb-4">
        {macroButtons.map((b) => (
          <button
            key={b.key}
            onClick={() => setActive(active === b.key ? 'none' : b.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              active === b.key
                ? 'border-2'
                : 'border border-white/10 hover:border-white/30'
            }`}
            style={{
              backgroundColor: active === b.key ? `${b.color}22` : 'rgba(255,255,255,0.04)',
              borderColor: active === b.key ? b.color : undefined,
              color: active === b.key ? b.color : 'rgba(255,255,255,0.7)',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* 4x3 asset grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {assets.map((a) => {
          const bias = active === 'none' ? 'neutral' : (a[active] as string);
          let bg = 'rgba(255,255,255,0.04)';
          let border = 'rgba(255,255,255,0.08)';
          let txt = 'rgba(255,255,255,0.5)';
          let arrow = '';
          if (bias === 'long') {
            bg = 'rgba(38,166,154,0.15)';
            border = 'rgba(38,166,154,0.5)';
            txt = '#26A69A';
            arrow = ' \u25B2';
          } else if (bias === 'short') {
            bg = 'rgba(239,83,80,0.15)';
            border = 'rgba(239,83,80,0.5)';
            txt = '#EF5350';
            arrow = ' \u25BC';
          }
          return (
            <div
              key={a.ticker}
              className="p-2 rounded-lg text-center transition-all"
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <p className="text-[10px] font-bold" style={{ color: txt }}>
                {a.ticker}{arrow}
              </p>
              <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {a.class}
              </p>
            </div>
          );
        })}
      </div>

      {/* Explanation panel */}
      <div
        className="p-3 rounded-lg border text-xs"
        style={{
          backgroundColor: 'rgba(255,179,0,0.06)',
          borderColor: 'rgba(255,179,0,0.2)',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: '1.5',
        }}
      >
        {explanations[active]}
      </div>

      <p className="text-[10px] text-gray-500 mt-3 text-center italic">
        Cross-asset correlation does not generate signals. It biases which CIPHER signals you take.
      </p>
    </div>
  );
}

// ============================================================
// ANIMATION 10 — SingleAssetLockoutAnim (S12)
// Session start with EURUSD lit up as the chosen asset. A tempting
// BTCUSD signal appears mid-session; an operator-discipline lockout
// (visualised as a sliding gate) prevents the switch. The skipped
// signal goes into a journal entry on the right.
// 14-second loop.
// ============================================================
function SingleAssetLockoutAnim() {
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
    ctx.fillText('SINGLE-ASSET LOCKOUT \u2014 THE SESSION IS LOCKED', w / 2, 22);

    const cycleDur = 14;
    const ct = t % cycleDur;

    // Left: chosen asset (EURUSD) lit up
    const leftX = 30;
    const cardW = w * 0.35;
    const cardH = 90;
    const cardY = 50;

    ctx.fillStyle = `${TEAL}22`;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SESSION ACTIVE', leftX + 10, cardY + 18);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('EURUSD', leftX + 10, cardY + 40);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Swing Trader preset', leftX + 10, cardY + 55);
    ctx.fillText('London-NY overlap', leftX + 10, cardY + 68);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('\u2713 ENGAGED', leftX + 10, cardY + 82);

    // Right: tempting BTCUSD signal appearing
    const rightX = w - 30 - cardW;
    const appearT = 2;
    if (ct > appearT) {
      const fade = Math.min(1, (ct - appearT) / 1);
      ctx.globalAlpha = fade;

      ctx.fillStyle = `${MAGENTA}22`;
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, cardY, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SIGNAL FIRED', rightX + 10, cardY + 18);
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('BTCUSD', rightX + 10, cardY + 40);
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('Strong PX LONG, 4/4 conviction', rightX + 10, cardY + 55);
      ctx.fillText('FRESH \u00B7 looks bulletproof', rightX + 10, cardY + 68);

      ctx.globalAlpha = 1;
    }

    // Lockout gate sliding between them
    const gateAppearT = 4;
    if (ct > gateAppearT) {
      const slide = Math.min(1, (ct - gateAppearT) / 1.5);
      const gateX = (leftX + cardW + rightX) / 2;
      const gateY = cardY - 4;
      const gateH = cardH + 8;
      const gateW = 50;

      ctx.fillStyle = `rgba(255,23,68,${0.18 * slide})`;
      ctx.strokeStyle = `rgba(255,23,68,${slide})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(gateX - gateW / 2, gateY, gateW, gateH * slide, 4);
      ctx.fill();
      ctx.stroke();

      if (slide > 0.7) {
        ctx.fillStyle = `rgba(255,23,68,${slide})`;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', gateX, gateY + 16);
        ctx.fillText('CLASS', gateX, gateY + 28);
        ctx.fillText('OUT', gateX, gateY + 40);

        // X marker on BTC card
        ctx.strokeStyle = `rgba(255,23,68,${slide})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rightX + 20, cardY + 20);
        ctx.lineTo(rightX + cardW - 20, cardY + cardH - 20);
        ctx.moveTo(rightX + cardW - 20, cardY + 20);
        ctx.lineTo(rightX + 20, cardY + cardH - 20);
        ctx.stroke();
      }
    }

    // Journal entry appears below
    const journalY = cardY + cardH + 30;
    if (ct > 7) {
      const jFade = Math.min(1, (ct - 7) / 1.5);
      ctx.globalAlpha = jFade;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(30, journalY, w - 60, 50, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('JOURNAL \u2014 SKIPPED TRADE', 40, journalY + 14);
      ctx.fillStyle = WHITE;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('BTCUSD PX LONG 4/4 conviction \u2014 skipped per single-asset-per-session rule.', 40, journalY + 28);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Session opened on EURUSD. Class is locked for the day. BTCUSD eligible tomorrow.', 40, journalY + 42);
      ctx.globalAlpha = 1;
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A locked class is not a missed opportunity. It is a calibration commitment.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 11 — ClassMasteryStaircaseAnim (S15)
// A staircase visualisation. Each step represents 30 sessions on a
// specific asset class. The operator's avatar climbs from FX (step 1)
// through Gold (step 2) to Indices (step 3) to Crypto (step 4).
// Each step is gated by the 30-session audit at the prior step.
// 18-second loop.
// ============================================================
function ClassMasteryStaircaseAnim() {
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
    ctx.fillText('CLASS MASTERY STAIRCASE \u2014 ONE STEP AT A TIME', w / 2, 22);

    const steps = [
      { name: 'FX', color: TEAL, sessions: '30 sessions \u00B7 patience' },
      { name: 'GOLD', color: SKY, sessions: '30 sessions \u00B7 macro context' },
      { name: 'INDICES', color: AMBER, sessions: '30 sessions \u00B7 session timing' },
      { name: 'CRYPTO', color: MAGENTA, sessions: '30 sessions \u00B7 reactivity' },
    ];

    const cycleDur = 18;
    const ct = t % cycleDur;
    const climbProgress = Math.min(1, ct / 14); // climb takes 14s; rest 4s on top
    const currentStep = Math.min(steps.length - 1, Math.floor(climbProgress * steps.length));

    // Staircase geometry
    const baseX = 60;
    const baseY = h - 50;
    const stepW = (w - 120) / steps.length;
    const stepH = (h - 90) / steps.length;

    // Draw all steps
    for (let i = 0; i < steps.length; i++) {
      const sx = baseX + i * stepW;
      const sy = baseY - (i + 1) * stepH;
      const sw = stepW;
      const sh = stepH * (i + 1);
      const reached = i <= currentStep;

      ctx.fillStyle = reached ? `${steps[i].color}22` : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = reached ? steps[i].color : FAINT;
      ctx.lineWidth = reached ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, 4);
      ctx.fill();
      ctx.stroke();

      // Step label
      ctx.fillStyle = reached ? steps[i].color : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(steps[i].name, sx + sw / 2, sy + 14);
      ctx.fillStyle = reached ? WHITE : DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(steps[i].sessions, sx + sw / 2, sy + 26);

      // Step number badge
      ctx.fillStyle = reached ? steps[i].color : `${FAINT}`;
      ctx.beginPath();
      ctx.arc(sx + 14, sy + sh - 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#080d16';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(String(i + 1), sx + 14, sy + sh - 9);
    }

    // Operator avatar climbing
    const avatarStepIdx = Math.min(steps.length - 1, Math.floor(climbProgress * steps.length));
    const avatarSubT = (climbProgress * steps.length) % 1;
    const avatarX = baseX + avatarStepIdx * stepW + stepW / 2;
    const avatarTargetY = baseY - (avatarStepIdx + 1) * stepH - 6;
    const avatarPrevY = avatarStepIdx === 0 ? baseY : baseY - avatarStepIdx * stepH - 6;
    const avatarY = avatarPrevY + (avatarTargetY - avatarPrevY) * Math.min(1, avatarSubT * 2);

    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#080d16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Audit gates between steps
    for (let i = 0; i < steps.length - 1; i++) {
      const gateX = baseX + (i + 1) * stepW;
      const gateY = baseY - (i + 1) * stepH;
      const passed = i < currentStep;
      ctx.fillStyle = passed ? `${TEAL}AA` : `${AMBER}AA`;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(passed ? '\u2713' : '\u2192', gateX, gateY + stepH / 2);
      ctx.fillStyle = passed ? `${TEAL}88` : `${DIM}`;
      ctx.font = '6px Inter, sans-serif';
      ctx.fillText('AUDIT', gateX, gateY + stepH / 2 + 12);
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each step is a 30-session commitment. The next step is gated by the prior audit.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.7} />;
}

// ============================================================
// ANIMATION 12 — PerClassFailurePatternAnim (Mistakes section preview)
// 2x2 grid showing the characteristic failure mode of each class:
// FX: news-window override. Indices: chasing the open. Crypto:
// weekend FOMO. Gold: macro-mismatch trade.
// 16-second loop.
// ============================================================
function PerClassFailurePatternAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const SKY = '#0EA5E9';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR CLASSES \u2014 FOUR CHARACTERISTIC FAILURE MODES', w / 2, 22);

    const failures = [
      {
        klass: 'FX',
        color: TEAL,
        title: 'News-Window Override',
        body: 'Trades through the 30-min envelope around CPI/NFP/FOMC. The chart "looked clean." The print resets it.',
      },
      {
        klass: 'INDICES',
        color: AMBER,
        title: 'Chasing The Open',
        body: 'Takes the first 30-min signal because it looks decisive. The open noise reverses; the stop hits.',
      },
      {
        klass: 'CRYPTO',
        color: MAGENTA,
        title: 'Weekend FOMO Hold',
        body: 'Holds a winning position through Friday because "this one is different." Sunday gap fills below the stop.',
      },
      {
        klass: 'GOLD',
        color: SKY,
        title: 'Macro-Mismatch Trade',
        body: 'Takes a Gold long while DXY is breaking up and US10Y is rising. The chart says long; the macro says short.',
      },
    ];

    const cycleDur = 16;
    const ct = t % cycleDur;
    const perCard = cycleDur / failures.length;
    const activeIdx = Math.floor(ct / perCard);
    const localT = (ct % perCard) / perCard;

    const cellW = (w - 60) / 2;
    const cellH = (h - 70) / 2;
    const startX = 20;
    const startY = 40;

    for (let i = 0; i < failures.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (cellW + 20);
      const cy = startY + row * (cellH + 20);
      const isActive = i === activeIdx;
      const f = failures[i];

      ctx.fillStyle = isActive ? `${RED}1A` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isActive ? RED : FAINT;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cellW, cellH, 8);
      ctx.fill();
      ctx.stroke();

      // Class badge
      ctx.fillStyle = f.color;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(f.klass, cx + 10, cy + 14);

      // Failure title
      ctx.fillStyle = isActive ? RED : DIM;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(f.title, cx + 10, cy + 32);

      // Body — word wrapped
      if (isActive) {
        const fadeIn = Math.min(1, localT * 3);
        ctx.fillStyle = `rgba(255,255,255,${0.8 * fadeIn})`;
        ctx.font = '8px Inter, sans-serif';
        const words = f.body.split(' ');
        let line = '';
        let ly = cy + 50;
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > cellW - 20 && line.length > 0) {
            ctx.fillText(line, cx + 10, ly);
            line = word + ' ';
            ly += 10;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, cx + 10, ly);
      }
    }

    // Caption
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each class has a signature failure. Recognise yours; defend mechanically against it.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={1.6} />;
}

// ============================================================
// ANIMATION 13 — ★★ ThirtySessionByClassAnim (S14)
// Drag-to-scrub equity curve, but split into 3 colored bands by asset
// class: FX (sessions 1-30, teal), Gold (31-60, sky), Indices (61-90,
// amber). Each band shows its own per-class metrics in the journal panel.
// 30-day-by-class audit visualisation.
// ============================================================
function ThirtySessionByClassScrubber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrubIdx, setScrubIdx] = useState(45);
  const [isDragging, setIsDragging] = useState(false);

  type Session = {
    idx: number;
    klass: 'FX' | 'GOLD' | 'INDICES';
    taken: number;
    skipped: number;
    adherence: number;
    pnl: number;
    note: string;
  };

  // 90 sessions, 30 per class. Cumulative trajectory: FX +14R, +Gold +9R (cum +23R), +Indices +5R (cum +28R)
  const sessions: Session[] = [];
  const fxNotes = [
    'Clean session. London-NY overlap.',
    'Two stops. Discipline held.',
    'Quiet Asia, took NY signals.',
    'CPI day — sat out per envelope.',
    'Best session this week.',
  ];
  const goldNotes = [
    'Macro context read paid off.',
    'CPI day — abstained correctly.',
    'Pre-FOMC drift, no engagement.',
    'Bias row was clear; long held.',
    'Real-yield shift; reduced size.',
  ];
  const idxNotes = [
    'Mid-session range. Two scalpers.',
    'Skipped open + close as protocol.',
    'Earnings season; quieter than usual.',
    'NAS broke; rode the trend.',
    'Indices choppy; one stop, one BE.',
  ];

  // FX sessions 1-30: +14R cumulative
  const fxPnls = [1.2, -0.8, 0.4, -1.4, 2.1, 0.6, 1.7, -2.1, 0, 1.3, 0.9, -0.5, 1.6, -0.3, 1.1, 0.8, 0, 1.4, -0.7, 1.9, 1.2, 0.3, -1.0, 1.5, 0.8, 2.4, 1.1, -0.4, 1.7, 0.6];
  for (let i = 0; i < 30; i++) {
    sessions.push({
      idx: i + 1, klass: 'FX', taken: 3 - (i % 2), skipped: 5 + (i % 2),
      adherence: i === 8 ? 100 : i === 7 ? 80 : 100, pnl: fxPnls[i], note: fxNotes[i % fxNotes.length],
    });
  }
  // GOLD sessions 31-60: +9R cumulative
  const goldPnls = [0.8, -0.6, 1.2, 0, -0.4, 0.9, 1.1, 0, -0.3, 0.6, 1.4, -0.5, 0.8, 0.5, 0, 1.0, -0.2, 0.7, 1.3, -0.4, 0.6, 0.8, 0, 0.5, 1.1, -0.3, 0.7, 0.4, 0, 0.9];
  for (let i = 0; i < 30; i++) {
    sessions.push({
      idx: i + 31, klass: 'GOLD', taken: 2, skipped: 6,
      adherence: 100, pnl: goldPnls[i], note: goldNotes[i % goldNotes.length],
    });
  }
  // INDICES sessions 61-90: +5R cumulative
  const idxPnls = [0.6, -0.4, 0.8, 0, -0.5, 0.7, 0.3, -0.8, 0.5, 0.2, 0.6, -0.3, 0.4, 0.5, -0.2, 0.8, 0, 0.3, 0.6, -0.4, 0.5, 0.7, -0.3, 0.4, 0.5, 0.2, 0.6, -0.2, 0.4, 0.3];
  for (let i = 0; i < 30; i++) {
    sessions.push({
      idx: i + 61, klass: 'INDICES', taken: 3, skipped: 5,
      adherence: 100, pnl: idxPnls[i], note: idxNotes[i % idxNotes.length],
    });
  }

  const equityCurve = sessions.reduce<number[]>((acc, s) => {
    acc.push((acc.length === 0 ? 0 : acc[acc.length - 1]) + s.pnl);
    return acc;
  }, []);

  const classColors = { FX: '#26A69A', GOLD: '#0EA5E9', INDICES: '#FFB300' };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const SKY = '#0EA5E9';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605\u2605 90 SESSIONS \u00B7 3 ASSET CLASSES \u2014 DRAG TO SCRUB', w / 2, 22);

    const chartPadX = 36;
    const chartTop = 44;
    const chartH = h * 0.45;
    const chartW = w - chartPadX * 2;

    const minEq = Math.min(0, ...equityCurve);
    const maxEq = Math.max(0, ...equityCurve);
    const range = (maxEq - minEq) || 1;
    const padMin = minEq - range * 0.075;
    const padMax = maxEq + range * 0.075;

    // Class bands as background
    const bandWidth = chartW / 3;
    const bands = [
      { klass: 'FX', start: 0, end: bandWidth, color: TEAL },
      { klass: 'GOLD', start: bandWidth, end: bandWidth * 2, color: SKY },
      { klass: 'INDICES', start: bandWidth * 2, end: bandWidth * 3, color: AMBER },
    ];
    for (const b of bands) {
      ctx.fillStyle = `${b.color}0A`;
      ctx.fillRect(chartPadX + b.start, chartTop, b.end - b.start, chartH);
      ctx.fillStyle = `${b.color}66`;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.klass, chartPadX + (b.start + b.end) / 2, chartTop + 12);
    }

    // Zero line
    const zeroY = chartTop + chartH - ((0 - padMin) / (padMax - padMin)) * chartH;
    ctx.strokeStyle = FAINT;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartPadX, zeroY);
    ctx.lineTo(chartPadX + chartW, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0R', chartPadX - 4, zeroY + 3);

    // Plot equity curve with per-class color segments
    const xStep = chartW / (sessions.length - 1);
    for (let segStart = 0; segStart < sessions.length - 1; segStart++) {
      const seg = sessions[segStart];
      const segEnd = segStart + 1;
      const x1 = chartPadX + segStart * xStep;
      const y1 = chartTop + chartH - ((equityCurve[segStart] - padMin) / (padMax - padMin)) * chartH;
      const x2 = chartPadX + segEnd * xStep;
      const y2 = chartTop + chartH - ((equityCurve[segEnd] - padMin) / (padMax - padMin)) * chartH;
      ctx.strokeStyle = classColors[seg.klass];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Daily P&L bars
    for (let i = 0; i < sessions.length; i++) {
      const x = chartPadX + i * xStep - 1;
      const pnl = sessions[i].pnl;
      const barH = Math.abs(pnl) * 6;
      const barY = pnl >= 0 ? zeroY - barH : zeroY;
      ctx.fillStyle = pnl >= 0 ? `${classColors[sessions[i].klass]}55` : 'rgba(239,83,80,0.4)';
      ctx.fillRect(x, barY, 2, barH);
    }

    // Scrub line
    const scrubX = chartPadX + scrubIdx * xStep;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scrubX, chartTop);
    ctx.lineTo(scrubX, chartTop + chartH);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.arc(scrubX, chartTop + chartH - ((equityCurve[scrubIdx] - padMin) / (padMax - padMin)) * chartH, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#080d16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Session number label
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Session ${scrubIdx + 1}`, scrubX, chartTop + chartH + 12);

    // Journal panel below
    const journalTop = chartTop + chartH + 22;
    const journalH = h - journalTop - 12;
    const session = sessions[scrubIdx];
    const cumPnl = equityCurve[scrubIdx];

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chartPadX, journalTop, chartW, journalH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = classColors[session.klass];
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SESSION ${session.idx} \u00B7 ${session.klass}`, chartPadX + 10, journalTop + 14);

    const stats = [
      { label: 'Taken', value: String(session.taken), color: WHITE },
      { label: 'Skipped', value: String(session.skipped), color: WHITE },
      { label: 'Adherence', value: session.adherence + '%', color: session.adherence === 100 ? TEAL : AMBER },
      { label: 'Day P&L', value: (session.pnl >= 0 ? '+' : '') + session.pnl.toFixed(1) + 'R', color: session.pnl >= 0 ? TEAL : MAGENTA },
      { label: 'Cumulative', value: (cumPnl >= 0 ? '+' : '') + cumPnl.toFixed(1) + 'R', color: cumPnl >= 0 ? TEAL : MAGENTA },
    ];
    const statSpacing = chartW / 5;
    for (let i = 0; i < stats.length; i++) {
      const sx = chartPadX + i * statSpacing + statSpacing / 2;
      const sy = journalTop + 34;
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stats[i].label.toUpperCase(), sx, sy);
      ctx.fillStyle = stats[i].color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(stats[i].value, sx, sy + 14);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = 'italic 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${session.note}"`, w / 2, journalTop + journalH - 10);
  }, [scrubIdx, equityCurve, sessions, classColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720);
      const hh = w / 1.7;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = hh * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = hh + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  const updateFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const chartPadX = 36;
    const chartW = rect.width - chartPadX * 2;
    const rel = (x - chartPadX) / chartW;
    setScrubIdx(Math.max(0, Math.min(89, Math.round(rel * 89))));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateFromPointer(e.clientX);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-black/30 select-none"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block mx-auto cursor-ew-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}

// === PHASE_2B_ANIMATION_INSERT_POINT ===
// Animations 8-13 land here (Phase 2B):
//   8. PerClassSizingAnim
//   9. CrossAssetCorrelationWidget ★★★ (interactive centerpiece)
//   10. SingleAssetLockoutAnim
//   11. ClassMasteryStaircaseAnim
//   12. PerClassFailurePatternAnim
//   13. ThirtySessionByClassAnim ★★
// ============================================================

// ============================================================
// GAME DATA (5 scenarios, 4 options each, one correct each)
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You opened your session on EURUSD with the Swing Trader preset and have been watching the London-NY overlap. Mid-session, BTCUSD on a separate tab flashes a Strong PX LONG with 4/4 conviction. Both charts are in your watchlist.',
    prompt: 'What does discipline say?',
    options: [
      {
        id: 'a',
        text: 'Take the BTCUSD trade — 4/4 conviction is the strongest signal CIPHER ever fires; it would be irrational to skip a Full Strong.',
        correct: false,
        explain:
          'This is the asset-class mode-switching failure. EURUSD and BTCUSD have completely different rhythms: FX moves in slow session-bound waves, Crypto reacts at random hours with gap risk. Your pre-session preparation, your size baseline, your news-window discipline were all calibrated for EURUSD. Switching mid-session means executing a Crypto trade with FX-calibrated discipline — a structural mismatch even if the signal is 4/4.',
      },
      {
        id: 'b',
        text: 'Skip the BTCUSD signal. You opened the session on EURUSD; the asset class is locked for the day. Journal the skip with the reason.',
        correct: true,
        explain:
          'Correct. Single-asset-per-session is one of the foundational asset-class discipline rules. The calibration drift cost (pre-session prep wrong, position size wrong for Crypto, news windows different) outweighs the signal strength of any individual trade. Tomorrow you can open the session on BTCUSD instead. Today you finish on EURUSD.',
      },
      {
        id: 'c',
        text: 'Take BTCUSD at half size — that respects the asset-class shift while still capturing the signal.',
        correct: false,
        explain:
          'Half-size is a sizing variable, not an asset-class variable. The mismatch is your calibrated preparation, not your position size. Half-sizing into a different asset class is the same mode-switching failure dressed in compromise language — softer, but the same root cause.',
      },
      {
        id: 'd',
        text: 'Close EURUSD and switch to BTCUSD. Run the rest of the session on Crypto since the better signal is there.',
        correct: false,
        explain:
          'Mid-session asset-class switching is the worst version of this failure. You abandon a calibrated session for an uncalibrated one. Even if the BTCUSD signal wins, you have reinforced a discipline-breaking pattern. The rule is single-asset-per-session for a reason: mode-switching has structural cost.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'It is Friday 18:00 GMT. You have a BTCUSD position open that hit TP1 earlier. The weekend approaches. Your usual Forex pairs are about to close for two days; Crypto stays live the whole weekend.',
    prompt: 'What does discipline say to do with the BTCUSD position?',
    options: [
      {
        id: 'a',
        text: 'Hold it through the weekend — you took the trade with full conviction, no reason to exit just because it is Friday.',
        correct: false,
        explain:
          'Crypto-specific risk. Weekend liquidity is thin; gap risk on Sunday open is real; news cycles (regulatory announcements, exchange events) compress into weekend hours when you cannot react. Holding crypto across a weekend with a live stop is not the same risk as holding FX through Friday close — there is no broker-side protection if a Sunday gap blows past your stop.',
      },
      {
        id: 'b',
        text: 'Close the remainder of the position before Friday close. Re-evaluate Monday morning with fresh eyes.',
        correct: true,
        explain:
          'Correct. This is the weekend-stranding discipline rule for crypto. TP1 already hit so you have locked positive expectation; the remaining position is now a gamble on the Sunday gap, not a trade. Disciplined crypto operators flatten positions before Friday close unless they have specifically planned for the weekend hold with reduced size and wider stops. Re-enter Monday with fresh calibration.',
      },
      {
        id: 'c',
        text: 'Move the stop to break-even and let it ride.',
        correct: false,
        explain:
          'A break-even stop does not protect against a Sunday gap. Price can open well below your stop on Sunday night and execute at a much worse level than break-even. The protection that exists in FX (broker-side stop honoured at the next available price) does not protect you in crypto across the weekend illiquidity. Break-even stops are an FX discipline; they do not transfer.',
      },
      {
        id: 'd',
        text: 'Add to the position because the weekend lull often produces continuation.',
        correct: false,
        explain:
          'Adding into thin weekend liquidity is the highest-base-rate losing pattern in crypto. You are increasing size at the worst possible time for execution quality. This pattern is documented in the per-class failure patterns covered later in the lesson.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'You are an indices trader. NAS100 just opened. The first 15 minutes show a sharp bull break — Strong PX LONG fires at 4/4 conviction. You usually wait the first 30 minutes per your protocol.',
    prompt: 'What does discipline say?',
    options: [
      {
        id: 'a',
        text: 'Take it. 4/4 conviction overrides routine timing rules. The signal is the signal.',
        correct: false,
        explain:
          'This is the indices-opening-window failure. The first 30 minutes after a major index opens are statistically the highest-noise period of the entire session — the volatility is real but unstable, and the first move is often the false move. Your 30-minute discipline rule was set because the data showed this. Overriding it because "this 4/4 is different" is the override doctrine violation in asset-specific clothing.',
      },
      {
        id: 'b',
        text: 'Skip. Honour the 30-minute opening discipline. If the breakout is real, there will be a continuation setup at minute 31+ with the noise filtered out.',
        correct: true,
        explain:
          'Correct. Indices have session-specific behaviour: the open is volatile, the mid-session settles, the close is volatile again. Your 30-minute skip window was set precisely because index-open conviction signals carry lower-than-baseline expected value despite their 4/4 score. The framework is universal; the calibration (skip window) is local to indices.',
      },
      {
        id: 'c',
        text: 'Take it at half size to compromise.',
        correct: false,
        explain:
          'The 30-minute skip is not a sizing question — it is a participation question. Half-size still participates in the noisiest 30 minutes of the day. The compromise softens the loss but does not address the underlying mismatch: you are engaging during a window your own protocol marks as skip.',
      },
      {
        id: 'd',
        text: 'Set an alert at minute 30 to engage if the setup is still active.',
        correct: false,
        explain:
          'Half-credit answer. Setting an alert is operationally sound — you are not engaging during the skip window — but the discipline this lesson teaches is the rule itself, not the workaround. Internalise: indices open = skip window, full stop. Watching for re-entry at minute 31 is fine but the answer the lesson wants is the skip itself.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'It is 13:30 NY. Gold (XAUUSD) is in a clean trend. CPI data drops in 2 minutes. CIPHER\'s Command Center is showing healthy conviction, the Risk Map is loaded, and a PX LONG just printed.',
    prompt: 'What does discipline say?',
    options: [
      {
        id: 'a',
        text: 'Take it now before the news to lock in the pre-news entry.',
        correct: false,
        explain:
          'Gold is the most macro-sensitive asset class in the suite. CPI data moves gold immediately and unpredictably — even a "good" trade entry pre-news can stop out instantly on a CPI surprise. The pre-news entry locks you into a position with negligible information advantage and substantial reaction risk.',
      },
      {
        id: 'b',
        text: 'Wait until 30 minutes after the news drops; let gold absorb the print and re-evaluate then.',
        correct: true,
        explain:
          'Correct. Gold-specific news discipline. CPI, NFP, FOMC, geopolitical announcements all reshape gold\'s short-term character; the immediate 30-minute window post-news is reactionary, not directional. Disciplined gold operators wait for the post-news settling period before engaging. The signal you saw will either re-fire post-news (with better context) or evaporate (saving you a stop-out).',
      },
      {
        id: 'c',
        text: 'Take it at full size — CIPHER\'s conviction layer already accounts for macro events.',
        correct: false,
        explain:
          'CIPHER reports honestly across its layers but the engine cannot anticipate a news print that has not happened yet. The conviction score is computed from chart-based signals, not from the CPI surprise that lands in 2 minutes. Trusting the engine to outweigh a pending macro event is misapplying the framework.',
      },
      {
        id: 'd',
        text: 'Take it but set a wider stop to absorb the news volatility.',
        correct: false,
        explain:
          'Wider stops to absorb news volatility violate the Risk Map\'s pre-computed stop. Per L11.21, moving stops post-entry to accommodate adverse conditions is an override doctrine violation. The discipline answer for pending news is to skip the trade, not modify the trade plan.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You have spent 30 sessions trading EURUSD only. The 30-session audit shows +8R cumulative, 100% adherence. You feel ready to add a second asset class to your rotation. Which class is the best next addition based on calibration sequence?',
    prompt: 'Which path does the lesson recommend?',
    options: [
      {
        id: 'a',
        text: 'Add Crypto next — it is the most reactive class, so it builds the broadest discipline.',
        correct: false,
        explain:
          'Adding Crypto immediately after FX is the most common calibration sequence mistake. FX and Crypto have nearly inverse rhythms (slow vs reactive, session-bound vs 24/7, broker-protected stops vs gap risk). Your FX-calibrated discipline cannot transfer cleanly to Crypto without an intermediate step. Going FX → Crypto is the highest-risk sequence in the lesson.',
      },
      {
        id: 'b',
        text: 'Add Gold (XAUUSD) next — it shares some FX rhythm but introduces macro-news sensitivity as a controlled new variable.',
        correct: true,
        explain:
          'Correct. Gold is the natural FX-bridge asset: it trades in a similar 24-5 schedule, broker stops are protected, position sizing math is close to FX. The new variable Gold introduces is macro-news sensitivity (CPI, NFP, FOMC, geopolitical) which is a controlled, learnable variable. Once you are comfortable on Gold, Indices become the next step (session-bound timing), then Crypto last (24/7, gap risk).',
      },
      {
        id: 'c',
        text: 'Add Indices next — they trade in clear sessions like FX so the calibration is close.',
        correct: false,
        explain:
          'Indices are not the worst next step but they are not the best either. Indices share session-bound rhythm with FX but introduce the open/close volatility windows that FX does not have. The calibration distance is moderate. Gold is the cleaner bridge because the new variables (macro news) are bounded and the rhythm is similar to FX.',
      },
      {
        id: 'd',
        text: 'Skip adding any class and run another 30 sessions on EURUSD to deepen FX edge.',
        correct: false,
        explain:
          'Defensible but not the lesson\'s answer. After 30 sessions of +8R 100%-adherence performance you have proven the framework on a single class. Diversifying class is the right move for long-term edge. Running 60 sessions on a single class deepens FX edge but at the opportunity cost of building portfolio-level discipline. The lesson recommends adding a second class at the 30-session mark, with Gold as the sequenced choice.',
      },
    ],
  },
];

// ============================================================
// QUIZ DATA (13 questions, 4 options each, one correct each)
// Covers: GC (universal/local), four asset classes, what calibrates
// auto vs manual, per-class sizing, news windows, single-asset rule,
// cross-asset correlation, mastery sequence.
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'The Groundbreaking Concept of this lesson is "The Framework Is Universal. The Calibration Is Local." What does that mean operationally?',
    options: [
      { id: 'a', text: 'CIPHER works on every asset class but you should pick one and never trade the others.', correct: false },
      { id: 'b', text: 'The same framework architecture (equation, gates, conviction, override doctrine) applies to every asset class identically; what changes per class is calibration (cooldowns, size baselines, news discipline, preset fit).', correct: true },
      { id: 'c', text: 'Forex is the only asset class CIPHER is truly calibrated for; other classes are approximations.', correct: false },
      { id: 'd', text: 'You should manually re-calibrate CIPHER\'s internal parameters when switching assets.', correct: false },
    ],
    explain:
      'The framework architecture is invariant: the boolean equation (engine correctness AND operator discipline), the four-gate pipeline, the conviction tier system, the override doctrine — all apply identically to every asset class. What changes is the calibration: how the engine self-adjusts its signal width per class, plus your operator-side calibration of position size, news windows, session timing, and preset fit. Universal architecture, local calibration.',
  },
  {
    id: 'q2',
    question: 'Which of the following four asset-class characterisations from this lesson is accurate?',
    options: [
      { id: 'a', text: 'Forex is the reactive asset; Crypto is the patient asset.', correct: false },
      { id: 'b', text: 'Indices are the macro asset; Gold is the session-bound asset.', correct: false },
      { id: 'c', text: 'Forex is the patient asset; Indices are session-bound; Crypto is reactive; Gold is the macro asset.', correct: true },
      { id: 'd', text: 'All four asset classes have the same operator posture; only position size differs.', correct: false },
    ],
    explain:
      'Forex is the patient asset (session-bound, news-driven, slow ranging). Indices are session-bound (open/close volatility, mid-session quiet). Crypto is reactive (24/7, gap risk, news at any hour). Gold is the macro asset (multi-surface news, harder trends than FX, harder chop than indices). Each class demands a distinct operator posture even though the framework architecture is identical.',
  },
  {
    id: 'q3',
    question: 'CIPHER self-calibrates several things automatically when you switch assets. Which of these does CIPHER calibrate for you?',
    options: [
      { id: 'a', text: 'Your position size — based on your account equity and the asset volatility.', correct: false },
      { id: 'b', text: 'Your news-window discipline — pausing trades around scheduled high-impact events.', correct: false },
      { id: 'c', text: 'The signal engine width, the body and distance filters in the PX pipeline, the TS thresholds, and the macro context reference symbols. All adapt per asset class without operator input.', correct: true },
      { id: 'd', text: 'Nothing — CIPHER treats all asset classes identically.', correct: false },
    ],
    explain:
      'CIPHER self-calibrates four things per asset class: the signal engine width (tighter for FX/commodities, baseline for stocks, intermediate for crypto/indices), the PX body and distance filters (per-class thresholds), the TS thresholds (Forex tightest, Stocks widest), and the macro context reference symbols (DXY/US10Y for FX, BTC.D/USDT.D for crypto, VIX/SPX for stocks/indices). You do not configure these — they self-route. Your job is operator-side calibration: position size, news windows, session timing.',
  },
  {
    id: 'q4',
    question: 'What is the "single-asset-per-session" rule and why does it exist?',
    options: [
      { id: 'a', text: 'You should only trade one ticker symbol per day to avoid taxes on multiple trades.', correct: false },
      { id: 'b', text: 'You commit to one asset class per session (FX, Indices, Crypto, or Gold) and do not switch mid-session because pre-session preparation, position size, news windows, and discipline rules are calibrated for that specific class.', correct: true },
      { id: 'c', text: 'CIPHER only allows one asset to be loaded at a time.', correct: false },
      { id: 'd', text: 'Trading multiple assets simultaneously increases broker fees.', correct: false },
    ],
    explain:
      'The single-asset-per-session rule is the asset-class equivalent of the mode-switching rule from L11.25. Your pre-session preparation (news scan, watchlist, session timing) is calibrated for the asset class you opened on. Mid-session switching to a different class means executing trades on Class B with Class A calibration — a structural mismatch even when individual signals look strong. The rule prevents the calibration drift.',
  },
  {
    id: 'q5',
    question: 'You trade FX and have a EURUSD position open across Friday close. The weekend is approaching. What does asset-class discipline say?',
    options: [
      { id: 'a', text: 'Close the position before Friday close — FX has weekend gap risk identical to crypto.', correct: false },
      { id: 'b', text: 'The position can be held across the weekend; FX has weekend gap risk but it is bounded by Monday Asia open with broker stops honoured at the next available price.', correct: true },
      { id: 'c', text: 'Add to the position — Monday gaps usually favour Friday\'s direction.', correct: false },
      { id: 'd', text: 'Move the stop to entry and ignore the weekend.', correct: false },
    ],
    explain:
      'FX weekend gap risk is real but bounded: the market closes Friday and reopens Sunday night (Asia open), brokers honour stops at the next available price, and gaps are usually small (most weeks under 0.3%). Crypto is structurally different — 24/7 markets with thin weekend liquidity and no broker-side protection during reduced-liquidity hours. FX positions can be held across weekends with appropriate sizing. Crypto positions should typically be flattened before Friday close unless specifically planned for the weekend hold.',
  },
  {
    id: 'q6',
    question: 'Which asset class is the most macro-news-sensitive and why?',
    options: [
      { id: 'a', text: 'Crypto — because it has the highest 24/7 volatility.', correct: false },
      { id: 'b', text: 'Forex — because all currencies depend on central bank decisions.', correct: false },
      { id: 'c', text: 'Gold (and commodities broadly) — because it reacts across multiple economic surfaces: USD strength, inflation prints, geopolitical risk, real yields, all at the same time.', correct: true },
      { id: 'd', text: 'Indices — because they react to corporate earnings.', correct: false },
    ],
    explain:
      'Gold sits at the intersection of multiple macro surfaces: it inversely correlates with USD strength (DXY), responds to inflation prints (CPI, PPI), reacts to geopolitical events (war, sanctions), and tracks real yields (TIPS spread). FX is sensitive to its specific central bank events but the surface is narrower. Indices react to earnings + macro but on a more contained surface. Crypto has high volatility but lower macro-news density. Gold operators run the most aggressive news-window discipline.',
  },
  {
    id: 'q7',
    question: 'CIPHER\'s Macro Context dashboard cell routes to different reference symbols per asset class. Which routing is correct?',
    options: [
      { id: 'a', text: 'Crypto uses VIX and SPX; Forex uses BTC.D and USDT.D.', correct: false },
      { id: 'b', text: 'Crypto uses BTC.D and USDT.D; Forex uses DXY and US10Y; Stocks and Indices use VIX and SPX; Commodities use DXY and US10Y.', correct: true },
      { id: 'c', text: 'All asset classes use the same DXY reference.', correct: false },
      { id: 'd', text: 'The user manually selects which references to use.', correct: false },
    ],
    explain:
      'CIPHER auto-routes the Macro Context cell\'s two reference symbols based on the chart\'s asset class. Crypto charts pull BTC.D (Bitcoin dominance) and USDT.D (stablecoin dominance) as RISK ON/OFF indicators. Forex charts pull DXY (Dollar Index) and US10Y (yield) for USD strength signals. Stocks and Indices charts pull VIX (volatility) and SPX (broad market) for risk sentiment. Commodities (Gold, Oil) use DXY and US10Y because they trade on USD strength and yield differentials. The routing is automatic — no operator configuration required.',
  },
  {
    id: 'q8',
    question: 'Per the lesson\'s recommended calibration sequence, after 30 sessions of mastering one asset class, which class should an operator add next?',
    options: [
      { id: 'a', text: 'Whichever class you find most exciting.', correct: false },
      { id: 'b', text: 'Crypto, because its 24/7 nature builds the broadest discipline.', correct: false },
      { id: 'c', text: 'Gold (or commodities) because it bridges from FX (similar rhythm, broker-protected stops) while introducing macro-news sensitivity as a controlled new variable.', correct: true },
      { id: 'd', text: 'Stocks, because they are the simplest asset class.', correct: false },
    ],
    explain:
      'The calibration sequence starts with FX (the patient asset, slowest rhythm, most forgiving discipline curve) and adds classes in order of calibration distance: FX → Gold (similar rhythm + macro variable) → Indices (session timing variable) → Crypto (24/7 + gap risk variable). The sequence is designed so each new class introduces ONE new variable on top of what you already mastered. Skipping straight to Crypto from FX is the most common calibration sequence mistake.',
  },
  {
    id: 'q9',
    question: 'Position size baseline differs across asset classes. Which statement is correct about per-class sizing discipline?',
    options: [
      { id: 'a', text: 'All asset classes should use identical baseline R; the engine adjusts.', correct: false },
      { id: 'b', text: 'Indices and Gold need tighter baseline R than FX because their point ranges are wider and a single move can hit a stop faster. Crypto needs more conservative baseline R because of gap risk.', correct: true },
      { id: 'c', text: 'Crypto deserves larger baseline R because its volatility offers more upside.', correct: false },
      { id: 'd', text: 'FX deserves the smallest baseline R because spreads are widest.', correct: false },
    ],
    explain:
      'Per-class sizing discipline: FX baseline R is the reference (typically 0.5-1% equity per trade). Indices and Gold tighten that baseline because their point ranges are wider and stops get hit faster (often 0.5× the FX baseline). Crypto tightens further because of gap risk — a Sunday gap can blow past your stop and execute much worse than the planned R (often 0.5-0.7× the FX baseline). Stocks vary by individual ticker volatility but typically run near baseline. The framework R is universal; the per-class baseline is local.',
  },
  {
    id: 'q10',
    question: 'You trade EURUSD. DXY (Dollar Index) just broke decisively higher. What does cross-asset correlation discipline say about your EURUSD bias?',
    options: [
      { id: 'a', text: 'Ignore DXY — it has no relationship to EURUSD.', correct: false },
      { id: 'b', text: 'EURUSD and DXY are inversely correlated. A DXY break higher tilts the operator bias toward EURUSD shorts and against EURUSD longs. The cross-asset signal does not override CIPHER but reshapes the operator filter.', correct: true },
      { id: 'c', text: 'Take the next EURUSD signal in the same direction as DXY.', correct: false },
      { id: 'd', text: 'Switch to trading DXY instead of EURUSD.', correct: false },
    ],
    explain:
      'EURUSD is roughly 57% of DXY by weighting; the two move inversely. A clean DXY break higher reduces the expected value of EURUSD longs and improves the expected value of EURUSD shorts. The Cross-Asset Correlation discipline is not a signal generator — it is an operator filter that biases which CIPHER signals you take. DXY up → favour EURUSD shorts. VIX up → reduce equity longs. BTC.D up → favour BTC over alts. The framework still fires signals; you choose which to engage based on macro tilt.',
  },
  {
    id: 'q11',
    question: 'What is the recommended discipline for trading Gold around high-impact USD news prints (CPI, NFP, FOMC)?',
    options: [
      { id: 'a', text: 'Take signals as they fire — CIPHER\'s conviction already accounts for macro events.', correct: false },
      { id: 'b', text: 'Take signals at half size to reduce news exposure.', correct: false },
      { id: 'c', text: 'Hard skip the 30 minutes pre-news and 30 minutes post-news. Re-engage at minute 31+ post-news with fresh conviction reads.', correct: true },
      { id: 'd', text: 'Trade Gold only during news windows because that is when the moves happen.', correct: false },
    ],
    explain:
      'Gold news-window discipline is the strictest in the suite. CPI, NFP, FOMC, geopolitical announcements reshape Gold\'s short-term character; the engine cannot anticipate a print that has not landed yet, and the 30-minute post-news window is reactionary rather than directional. Disciplined gold operators hard-skip the 60-minute envelope around any high-impact news (30 min pre, 30 min post). Re-engage after minute 31+ when the print has been absorbed and CIPHER\'s conviction layer has updated.',
  },
  {
    id: 'q12',
    question: 'At the 30-session per-class audit, the operator finds that 78% of their winning trades on EURUSD came from PX continuations and 12% from TS reversals. What does the audit imply about their next 30 sessions?',
    options: [
      { id: 'a', text: 'They should switch to a different preset because their TS engine is broken.', correct: false },
      { id: 'b', text: 'Their edge on this class lives in PX continuations — they should consider running a preset that biases PX, run their next 30 sessions with that preset, and skip TS reversals more aggressively on this class.', correct: true },
      { id: 'c', text: 'They should add more asset classes to dilute the PX concentration.', correct: false },
      { id: 'd', text: 'The audit is too small to mean anything; they should run 100 more sessions before adjusting.', correct: false },
    ],
    explain:
      'The 30-session per-class audit is the data that drives next-cycle calibration. 78% winners from PX continuations means the operator\'s edge on this class lives in PX, not TS — a meaningful signal at n=30. Legitimate response: shift toward a PX-biased preset (Trend Trader or Swing Trader) for the next cycle, run another 30 sessions to verify, and increase skip discipline on TS signals on this specific class. Per-class edge concentration is real and exploitable; the operator who notices it and adjusts compounds faster.',
  },
  {
    id: 'q13',
    question: 'You have completed the lesson. You have run 30 sessions on FX with full discipline. You are about to add Gold as your second class. What is the FIRST thing you do?',
    options: [
      { id: 'a', text: 'Take the next Gold signal that fires at full size.', correct: false },
      { id: 'b', text: 'Spend a session in study mode on Gold — load CIPHER on XAUUSD, watch how the Command Center reads behave, note the news-windows for the day, do NOT trade. Begin trading next session with reduced size for the first 5 sessions.', correct: true },
      { id: 'c', text: 'Trade FX and Gold simultaneously to test cross-asset attention.', correct: false },
      { id: 'd', text: 'Switch your entire watchlist to Gold immediately.', correct: false },
    ],
    explain:
      'The class-onboarding protocol: one session in study mode (no trades, just observation of how CIPHER\'s Command Center behaves on the new class), then begin live trading at reduced size (50-70% of your established class-1 baseline) for the first 5 sessions. This builds calibration safely. After 5 reduced-size sessions, scale to full per-class baseline. After 30 total sessions on the new class, run the audit. The temptation to engage immediately at full size is the asset-class onboarding failure that costs operators their first 5-10 trades on every new class they add.',
  },
];

// ============================================================
// MAIN LESSON COMPONENT
// ============================================================

export default function CipherAssetClassAdaptation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(
    Array(gameRounds.length).fill(null)
  );
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Quiz scoring
  const quizCorrect = quizAnswers.filter((a, i) =>
    a !== null && quizQuestions[i].options.find(o => o.id === a)?.correct
  ).length;
  const quizPercent = Math.round((quizCorrect / quizQuestions.length) * 100);
  const quizPassed = quizSubmitted && quizPercent >= 66;
  const certRevealed = quizPassed;

  // Stable cert ID
  const certIdRef = useRef<string | null>(null);
  if (!certIdRef.current) {
    certIdRef.current = `PRO-CERT-L11.26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  const certId = certIdRef.current;

  // Scroll progress
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

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/[0.04] z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-accent-500 to-amber-500"
          style={{ width: `${scrollProgress}%`, transition: 'width 0.1s linear' }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/academy" className="text-xs text-gray-400 hover:text-white transition-colors">&larr; Academy</Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-accent-500/20 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold tracking-widest text-amber-400">PRO &middot; LEVEL 11</span>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden pt-16">
        {/* Radial halos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,179,0,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-6">Level 11 &middot; Lesson 26 &middot; Asset-Class Adaptation</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Cipher Asset-Class Adaptation
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-4">
            Same Framework. Four Asset Characters. One Per Session.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
            The framework is universal. The calibration is local. CIPHER self-routes its engine for every asset class; your job is to know which calibration is active and adjust your operator-side discipline accordingly.
          </p>
        </motion.div>
      </section>

      {/* === S00 — Groundbreaking Concept === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Groundbreaking Concept</p>
          <h2 className="text-3xl font-extrabold mb-6">The Framework Is Universal.<br />The Calibration Is Local.</h2>

          <p className="text-gray-400 leading-relaxed mb-4">Operator A trades EURUSD exclusively. Their pre-session routine is calibrated for the London-NY overlap. Their position-size baseline assumes broker-protected stops. Their news-window discipline tracks ECB, FOMC, NFP. Their preset is Swing Trader. Over 90 sessions they finish <strong className="text-white">+24R cumulative, 100% adherence.</strong></p>

          <p className="text-gray-400 leading-relaxed mb-4">Operator B is the same person, six months later. They have decided to add BTCUSD to their rotation. Same CIPHER. Same Swing Trader preset. Same position-size baseline. <strong className="text-white">No additional calibration.</strong> They expect the framework to transfer cleanly because &mdash; after all &mdash; the same engine, the same conviction layer, the same gates.</p>

          <p className="text-gray-400 leading-relaxed mb-6">Over the next 30 sessions on BTCUSD, Operator B finishes <strong className="text-magenta-400" style={{ color: '#EF5350' }}>-9R cumulative, 73% adherence.</strong> The framework did not change. The operator&apos;s discipline did not change. <strong className="text-amber-400">What broke was the calibration.</strong></p>

          <FourCharactersAnim />

          <div className="p-6 rounded-2xl glass-card mt-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE INVARIANT</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s architecture is constant across every asset class. The boolean equation (engine correctness AND operator discipline), the four-gate pipeline, the four-factor conviction score, the TS cooldown mechanism, the preset philosophies, the override doctrine, the discipline pyramid, the failure cascade &mdash; all of these apply identically to EURUSD and BTCUSD and NAS100 and XAUUSD. <strong className="text-white">The framework you learned in lessons 1-25 transfers without modification.</strong></p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LOCAL CALIBRATION (AUTOMATIC)</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER self-routes four things when you load it on a different asset class:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li><strong className="text-white">Signal engine width.</strong> Tighter for FX/Commodities, baseline for Stocks, intermediate for Crypto/Indices.</li>
                <li><strong className="text-white">PX pipeline gates.</strong> Body filter and pre-cross distance thresholds adapt per class.</li>
                <li><strong className="text-white">TS thresholds.</strong> Forex tightest, Stocks widest, Crypto/Index intermediate.</li>
                <li><strong className="text-white">Macro context references.</strong> DXY/US10Y for FX, BTC.D/USDT.D for Crypto, VIX/SPX for Stocks/Indices, DXY/US10Y for Commodities.</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3"><strong className="text-white">You configure none of this.</strong> The engine reads the chart&apos;s asset type and adapts. Your only awareness requirement is to know that it happened.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LOCAL CALIBRATION (MANUAL)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Four things CIPHER does NOT calibrate for you. These are your job:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li><strong className="text-white">Position size baseline.</strong> Indices tighter than FX, Crypto tighter still (gap risk), Gold intermediate. The R-multiplier from L11.22 is universal; the per-class baseline is local.</li>
                <li><strong className="text-white">News-window discipline.</strong> FX tracks central-bank events; Indices track open/close + earnings; Gold tracks CPI/NFP/FOMC + geopolitics; Crypto tracks regulatory + exchange events.</li>
                <li><strong className="text-white">Session timing.</strong> FX favours London-NY overlap; Indices favour mid-session quiet; Crypto has no preferred session but has weekend stranding; Gold favours overlap periods like FX.</li>
                <li><strong className="text-white">Preset fit per class.</strong> Trend Trader on trending FX, Swing Trader on Gold, Scalper on Indices during active sessions, Sniper on Crypto where 4/4 conviction signals are rare. The preset philosophies are universal; their fit to a class is local.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE LESSON PROMISE</p>
              <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">four asset-class characters</strong> (Forex, Indices, Crypto, Gold/Commodities) and their distinct rhythms, what CIPHER self-calibrates and what you still calibrate, the <strong className="text-white">single-asset-per-session rule</strong> and why it exists, the <strong className="text-white">cross-asset correlation discipline</strong> (DXY⇄EURUSD, VIX⇄SPX, BTC.D⇄alts), <strong className="text-white">per-class position sizing</strong>, the <strong className="text-white">30-session per-class audit protocol</strong>, and the <strong className="text-white">class-mastery sequence</strong> that builds portfolio-level discipline one class at a time. You stop trying to apply one calibration to four assets; you start trading four assets with four calibrations, identically architected.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S01 — Why Asset Class Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; Why Asset Class Matters</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Rhythms. One Engine.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER reports the market honestly regardless of which chart you load it on. The four-gate pipeline, the conviction layer, the Command Center cascade, the Risk Map &mdash; all work identically on EURUSD as on BTCUSD as on NAS100 as on XAUUSD. <strong className="text-amber-400">What does not transfer is the rhythm of the underlying asset.</strong> Forex breathes in sessions. Indices punch at the open and close. Crypto runs 24/7 with no broker safety net. Gold reacts on macro surfaces FX traders never see.</p>
          <p className="text-gray-400 leading-relaxed mb-6">An operator who reads CIPHER fluently on EURUSD has trained on a slow-rhythm asset with broker-protected stops, scheduled news cycles, and a clear preferred trading window. <strong className="text-white">All of that training is asset-specific.</strong> Loading the same CIPHER on BTCUSD and trading it the same way is not "running the framework" &mdash; it is mis-applying calibration. The framework still fires correctly; the operator just is not adjusting their side of the equation.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE TRAINING-TRANSFER FALLACY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common assumption: "I learned CIPHER on EURUSD; now I can use it on BTCUSD." Mechanically true; operationally false. The framework you internalised carries an invisible passenger &mdash; a calibration for the asset class you trained on. Pre-session prep, position-size baseline, news-window discipline, session timing, even your sense of "normal" volatility &mdash; all of these were tuned for one class. <strong className="text-white">Without explicit recalibration, you will execute Class B trades with Class A discipline.</strong> The losses come from the mismatch, not from the engine.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT THIS LESSON DOES</p>
              <p className="text-sm text-gray-400 leading-relaxed">This lesson is the rhythm-decoupling lesson. It separates what CIPHER does for you automatically (which is more than you might assume) from what you still do manually (which is more than the framework can do for you). After this lesson you will be able to switch asset classes between sessions with explicit per-class calibration &mdash; not hope-based transfer.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Four Asset Classes Overview === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Four Asset Classes Overview</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Distinct Characters. Same Tool.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Each asset class has a character that recurs across pairs and tickers within it. EURUSD, GBPUSD, USDJPY all share the Forex character even when their individual setups differ. NAS100 and SPX500 share the Indices character. BTCUSD and ETHUSD share the Crypto character. XAUUSD and USOIL share the Commodities character. <strong className="text-amber-400">Master one class, you have leverage on every ticker inside it.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-teal-400 mb-2">FOREX &middot; THE PATIENT ASSET</p>
              <p className="text-sm text-gray-400 leading-relaxed">Session-bound rhythm (Asia, London, NY, with London-NY overlap as peak). News-driven volatility windows (central bank events, NFP, CPI). Slow ranging between session pivots. Broker-protected stops honoured across weekends with limited gap risk. <strong className="text-white">Patience is the operator&apos;s dominant skill.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">INDICES &middot; THE SESSION-BOUND ASSET</p>
              <p className="text-sm text-gray-400 leading-relaxed">Hard session boundaries (open, mid, close). Sharp opens and closes; mid-session quiet. Volatility lives in the first 30 minutes and last 30 minutes &mdash; the rest is range-day grinding. Closed weekends, regular schedule. <strong className="text-white">Timing discipline is the operator&apos;s dominant skill.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-magenta-400" style={{ color: '#EF5350' }}>CRYPTO &middot; THE REACTIVE ASSET</p>
              <p className="text-sm text-gray-400 leading-relaxed">24/7 markets. No session boundaries. News-driven shocks at any hour (regulatory announcements, exchange events, large transfers, geopolitical news). Weekend gap risk &mdash; stops are NOT protected during thin weekend liquidity. <strong className="text-white">Reactivity discipline is the operator&apos;s dominant skill.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#0EA5E9' }}>GOLD / COMMODITIES &middot; THE MACRO ASSET</p>
              <p className="text-sm text-gray-400 leading-relaxed">News-driven across multiple economic surfaces simultaneously: USD strength (DXY), inflation prints (CPI, PPI), real yields (TIPS), geopolitical risk, central bank policy. Trends harder than FX; ranges chop harder than indices. <strong className="text-white">Macro context discipline is the operator&apos;s dominant skill.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE PATTERN</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each class has a different dominant operator skill. FX rewards patience. Indices reward timing. Crypto rewards reactivity. Gold rewards context. <strong className="text-white">An operator who develops one of these skills has an edge on one class.</strong> An operator who develops all four has portfolio-level versatility &mdash; but in sequence, never simultaneously.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S03 — FOREX, the Patient Asset === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-teal-400/80 mb-3">03 &mdash; FOREX &middot; The Patient Asset</p>
          <h2 className="text-2xl font-extrabold mb-4">Trade On The Clock, Not On The Chart.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Forex&apos;s defining feature is that the rhythm is on the clock, not on the chart. EURUSD at 03:00 UTC is a different asset than EURUSD at 13:00 UTC. The same price, the same chart, completely different liquidity, completely different participants, completely different expected move. <strong className="text-teal-400">A disciplined FX operator engages during specific windows and abstains otherwise &mdash; without exception.</strong></p>
          <SessionBoundClockAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the clock. Asia session brings the slowest moves and thinnest participation. London opens and brings European institutional flow. The London-NY overlap (13:00-16:00 UTC) is the highest-liquidity, highest-conviction window of the day. NY continues into the afternoon with US-driven moves. After NY close, the market drifts until Asia opens again. <strong className="text-white">Three of these zones are study mode. One is engagement.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-400 mb-2">THE FX OPERATOR&apos;S DAY</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Asia session.</strong> Study mode. Review yesterday&apos;s journal. Identify overnight news. Mark levels for London open.</li>
                <li><strong className="text-white">London open.</strong> Engagement begins. First trades typically wait 30 minutes for the open noise to clear.</li>
                <li><strong className="text-white">London-NY overlap.</strong> Peak engagement. Highest liquidity, cleanest conviction reads, best R:R setups.</li>
                <li><strong className="text-white">NY afternoon.</strong> Engagement continues but on declining liquidity. Tighten size.</li>
                <li><strong className="text-white">After NY close.</strong> Stand down. No engagement. Journal the session.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-2">NEWS-WINDOW DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX has a clear scheduled-event calendar: ECB rate decisions, Fed FOMC, NFP, CPI prints across major economies. <strong className="text-white">Hard skip the 30 minutes pre-event and 30 minutes post-event.</strong> The Bias row in your Command Center already routes to DXY and US10Y &mdash; check both before engaging in any session.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-2">FX-NATURAL PRESET FIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Swing Trader (slow-rhythm, threshold 3-of-4) and Sniper (apex setups only) both fit FX naturally. The patient asset rewards the patient preset. Scalper can work during London-NY overlap but burns out the operator outside the peak window. Trend Trader fits trending sessions but produces low signal volume in ranging sessions, which is most FX sessions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-teal-400 mb-2">WEEKEND DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX closes Friday 22:00 UTC and reopens Sunday 22:00 UTC. <strong className="text-white">Broker-protected stops honoured at the next available price on Monday Asia open.</strong> Weekend gap risk exists but is bounded by broker fill quality. Holding a small position over a weekend with appropriate sizing is operationally defensible. Holding a large position with a near-the-money stop is not.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S04 — INDICES, the Session-Bound Asset === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/80 mb-3">04 &mdash; INDICES &middot; The Session-Bound Asset</p>
          <h2 className="text-2xl font-extrabold mb-4">The Day Has Three Windows. Two Are Noise.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Indices live in a hard 6.5-hour session (US equities, 09:30-16:00 ET). The first 30 minutes are the highest-noise period of the day &mdash; overnight news condenses into the open, gap-fills and gap-extensions battle, retail and institutional orders collide at the bell. The last 30 minutes are similar &mdash; closing-rotation flows, MOC (market-on-close) orders, position-reconciliation activity. <strong className="text-amber-400">The middle five hours are where the framework earns its keep.</strong></p>
          <IndexOpenCloseAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the playhead. The two red zones are skip zones. The teal mid-section is engagement. <strong className="text-white">Disciplined indices operators participate only during the middle window.</strong> Signals that fire in the open or close zones are filtered manually by the operator &mdash; not because the engine is wrong, but because the base rate on open/close signals is below baseline despite their conviction score.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE THREE WINDOWS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">09:30-10:00 ET &mdash; Opening Window (SKIP).</strong> Overnight news resolves. Gap-fills attempt. Volatility spikes. Even a 4/4 conviction signal in this window carries below-baseline expected value because the noise dominates.</li>
                <li><strong className="text-white">10:00-15:30 ET &mdash; Mid-Session Window (ENGAGE).</strong> Volatility settles. Trends emerge. CIPHER&apos;s conviction reads stabilise. This is the indices engagement window.</li>
                <li><strong className="text-white">15:30-16:00 ET &mdash; Closing Window (SKIP).</strong> MOC orders, rotation flows, closing prints. The chart looks like it is breaking out; usually it is not.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">INDICES-SPECIFIC NEWS DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Earnings season (mega-cap names trade in extended hours and gap the index on open). FOMC days have a clear pre-news drift and a chaotic post-2pm reaction window. CPI and NFP move indices via the rate-path channel, not just FX. <strong className="text-white">Skip Fed days, skip CPI days, skip NFP days for the first 60 minutes after release.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">INDICES-NATURAL PRESET FIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Trend Trader fits indices because index sessions often trend cleanly mid-session. Scalper works well during the more active hours (10:30-12:00, 14:00-15:00). Swing Trader and Sniper are too restrictive for the natural signal volume indices produce. Reversal can fire profitably at the mid-session pivot points.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">SIZING DIFFERENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Index point ranges are wider than FX pip ranges. A 1% NAS100 move is roughly 290 points; a 1% EURUSD move is 100 pips. The Risk Map will compute appropriate stops, but your baseline R per trade should tighten when switching from FX to indices &mdash; typically 0.5-0.7&times; your FX baseline &mdash; because the engine fires more frequently mid-session and the cumulative exposure adds up faster.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S05 — CRYPTO, the Reactive Asset ★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(239, 83, 80, 0.8)' }}>05 &mdash; CRYPTO &middot; The Reactive Asset &middot; &#9733; weekend gap risk</p>
          <h2 className="text-2xl font-extrabold mb-4">Always Open. Never Protected.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Crypto&apos;s defining feature is structural: there is no broker, no exchange-side stop protection, and no scheduled close. The market runs 24/7 across multiple exchanges, news lands at any hour, and weekend liquidity is a fraction of weekday liquidity. <strong style={{ color: '#EF5350' }}>The single most important asset-class fact for crypto is that your stop-loss does not protect you during a gap.</strong></p>
          <CryptoGapRiskAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the comparison. Left: BTCUSD with a planned -1R stop, position held over the weekend, Sunday open gaps down past the stop. Broker fills at the next available price, which is 3.5R below entry, not 1R. Right: same setup on EURUSD &mdash; broker-protected stop honoured cleanly at -1R despite a small weekend gap. <strong className="text-white">Same risk plan, same conviction, same execution discipline &mdash; 3.5&times; the loss in crypto because the structural protection that exists in FX does not exist in crypto.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>WEEKEND DISCIPLINE</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Default: flatten all crypto positions before Friday 18:00 UTC.</strong> No exceptions for "positions that hit TP1." No exceptions for "small remaining size." No exceptions for "this one looks bulletproof."</li>
                <li><strong className="text-white">Exception: planned weekend holds.</strong> Sized at 0.25-0.5R baseline, stops placed wider than usual (1.5&times; normal), with awareness that even those stops will not protect against a Sunday gap.</li>
                <li><strong className="text-white">Re-engage Monday with fresh calibration.</strong> The market that opens Monday is not the market that closed Friday. Read Command Center first; do not assume continuation.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>CRYPTO-SPECIFIC NEWS DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regulatory announcements (SEC actions, ETF decisions, country-level bans). Exchange events (hacks, halts, listing/delisting). On-chain events (large transfers, miner activity, network upgrades). Macro events that crypto co-moves with (Fed days, risk-off sessions). <strong className="text-white">There is no calendar that captures all of these.</strong> Operate with the assumption that a meaningful surprise can land at any hour, and size accordingly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>SESSION DISCIPLINE WITHIN 24/7</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even though crypto is always open, you are not. <strong className="text-white">Pick a 6-8 hour engagement window per day and treat outside-window hours as study mode.</strong> The asset has no preferred session; your discipline does. Trading at 03:00 because BTCUSD just printed a signal is the reactivity failure this class produces in unprepared operators. Set the window, honour it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>CRYPTO-NATURAL PRESET FIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sniper is the natural fit (apex 4/4 conviction setups are rare but well-defined in crypto). Reversal works during ranging weeks. Scalper requires constant attention which conflicts with the engagement-window discipline. Swing Trader works for multi-day holds when sized appropriately for gap risk. Trend Trader fits crypto trends but the cumulative gap risk on multi-day holds is real.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#EF5350' }}>POSITION SIZE DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Baseline R for crypto is typically 0.5-0.7&times; the operator&apos;s FX baseline. The reasoning is direct: gap risk is real, the engine cannot anticipate a Sunday gap, and the Risk Map computes stops based on chart structure, not gap probability. <strong className="text-white">Tightening size is the only operator-side defence against the structural fact that stops are not honoured during illiquid windows.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S06 — GOLD / COMMODITIES, the Macro Asset === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(14, 165, 233, 0.8)' }}>06 &mdash; GOLD / COMMODITIES &middot; The Macro Asset</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Surfaces. One Envelope.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Gold (XAUUSD) sits at the intersection of multiple macro forces that all move it simultaneously: USD strength (DXY), inflation expectations (CPI prints, breakevens), real yields (TIPS spread), geopolitical risk (war, sanctions, supply shocks), and central bank policy (rate path, dot-plot revisions). Most assets have one or two news surfaces. <strong style={{ color: '#0EA5E9' }}>Gold has at least five.</strong> Disciplined gold operators do not try to track all of them &mdash; they apply one consistent news envelope across the entire calendar.</p>
          <GoldNewsSurfaceAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three event types cycle through. CPI moves gold via the real-yield path. Geopolitical events move gold via safe-haven flows. FOMC moves gold via the rate channel. The price reactions look different bar-to-bar &mdash; CPI typically a sharp drop, geopolitical a sharp spike up, FOMC depending on hawkish/dovish surprise. <strong className="text-white">The discipline response is the same envelope across all three: 30 min pre, 30 min post, no trades.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#0EA5E9' }}>WHY GOLD IS HARDER THAN IT LOOKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Gold appears simple &mdash; one ticker, one chart, clean trends. The hidden complexity is that any of five macro forces can flip its direction without warning. A clean Bull Trend on the chart can reverse in 15 minutes on an unexpected CPI print or a geopolitical headline. <strong className="text-white">CIPHER&apos;s conviction layer reads the chart accurately but cannot anticipate news that has not landed.</strong> The operator&apos;s job is to know the calendar and protect against the surprise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#0EA5E9' }}>THE 60-MINUTE ENVELOPE</p>
              <p className="text-sm text-gray-400 leading-relaxed">For any scheduled high-impact event: hard skip the 30 minutes before and the 30 minutes after. Re-engage at minute 31+ when the print has been absorbed, the Command Center has updated its reads, and the new directional context is visible. <strong className="text-white">This rule applies even to "good" trade entries that fire mid-envelope.</strong> The expected value of mid-envelope entries is below baseline even when the chart looks pristine.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#0EA5E9' }}>THE BIAS ROW MATTERS MORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">In FX, the Bias row (auto-routed to DXY and US10Y) is useful context. In Gold, <strong className="text-white">the Bias row is mandatory pre-entry context.</strong> DXY trending higher with US10Y trending higher means USD strength is broad &mdash; gold longs against that bias have below-baseline expected value regardless of CIPHER conviction. The discipline is: read the Bias row, then decide engagement.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#0EA5E9' }}>GOLD-NATURAL PRESET FIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Swing Trader fits gold&apos;s multi-day trending behaviour with appropriate news-window discipline. Sniper works for apex setups when the macro context aligns. Trend Trader can compound during clean directional runs but exits aggressively at the first sign of regime change. Scalper does not fit gold &mdash; the news-window discipline destroys scalp frequency. Reversal can work at major levels but is high-discipline due to the macro override risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold mb-2" style={{ color: '#0EA5E9' }}>SESSION TIMING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Gold trades around the clock but the highest-conviction windows are the London-NY overlap (similar to FX) and the US data-release windows (CPI, NFP, FOMC release times &mdash; engaged at minute 31+, not within). Asia session is study mode for gold operators the same way it is for FX.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S07 — What Self-Calibrates Automatically ★★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; What Self-Calibrates Automatically &middot; &#9733;&#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">CIPHER Does More Than You Assume.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A surprising amount of per-asset calibration happens before any signal reaches your eye. CIPHER reads the chart&apos;s asset type and quietly adapts four mechanisms behind the scenes. <strong className="text-amber-400">You configure none of this.</strong> Awareness is the only requirement &mdash; knowing what shifts when you switch assets helps you read Command Center reads with the appropriate calibration in mind.</p>
          <EngineCalibrationDial />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the dial as it cycles through FX, Indices, Crypto, and Gold. The dial needle and side panel update to show what calibration the engine has selected for the active asset class. The behaviour is descriptive, not configurable &mdash; you can see the calibration but cannot override it. <strong className="text-white">That is the design intent.</strong> The engine&apos;s per-class routing was empirically calibrated; user-tuneable per-class routing would expose operators to optimisation traps without adding edge.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">MECHANISM 1 &middot; SIGNAL ENGINE WIDTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s signal engine generates Pulse-based signals at a width that adapts per asset class. Forex and Commodities get the tightest engine (signals fire less frequently but with higher per-fire reliability). Indices and Crypto get an intermediate engine. Stocks run at baseline width. <strong className="text-white">The result you see: FX and Gold produce fewer signals than indices or crypto on the same chart density.</strong> That is intentional, not a bug.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MECHANISM 2 &middot; PX PIPELINE GATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The four-gate PX pipeline from L11.12 (Body Filter, Pre-Cross Distance, Chop Suppression, Failed-Flip Override) has different threshold values per asset class. Forex bodies are smaller than crypto bodies in ATR terms, so the Body Filter scales accordingly. Pre-Cross Distance scales by both asset class and timeframe. <strong className="text-white">You did not configure this when you loaded CIPHER on EURUSD.</strong> The engine routed automatically based on the symbol&apos;s asset type.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MECHANISM 3 &middot; TS THRESHOLDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The TS engine&apos;s stretch threshold (how far from Cipher Flow price must extend before TS fires) routes per class. Forex and Commodities have the tightest threshold (stretches are smaller in those classes; the bar must be lower to register as &quot;stretched&quot;). Stocks and indices use wider thresholds. The cooldown windows from L11.13 are also class-aware. <strong className="text-white">Result: TS fires earlier on EURUSD than on a randomly selected stock at the same visual stretch.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MECHANISM 4 &middot; MACRO CONTEXT REFERENCES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Bias row in the Command Center reads two macro reference symbols. The references auto-route per class:</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4 mt-2">
                <li><strong className="text-white">Forex &middot;</strong> DXY (Dollar Index) + US10Y (10-year yield)</li>
                <li><strong className="text-white">Stocks / Indices &middot;</strong> VIX (volatility) + SPX (broad market)</li>
                <li><strong className="text-white">Crypto &middot;</strong> BTC.D (Bitcoin dominance) + USDT.D (stablecoin dominance)</li>
                <li><strong className="text-white">Commodities / Gold &middot;</strong> DXY + US10Y (USD-driven)</li>
              </ul>
            </div>
          </div>
          <MacroContextRouterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation above shows the Bias row routing in action. For each asset class, the two reference symbols fly down from the asset card into the Bias row dashboard cell &mdash; updating the bias verdict as the references change. <strong className="text-white">You can see this in your own CIPHER right now</strong>: load EURUSD and the Bias row reads DXY + US10Y; switch to BTCUSD and it reads BTC.D + USDT.D; switch to NAS100 and it reads VIX + SPX. The routing is silent, automatic, and per-asset.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT TO DO WITH THIS AWARENESS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you switch asset classes, recognise that the same Command Center read carries different absolute meaning per class. A "Stretched" Pulse on Forex represents a smaller absolute price move than a "Stretched" Pulse on Crypto. A 4/4 conviction signal on Indices fires under different gate thresholds than a 4/4 on Gold. <strong className="text-white">The labels are universal; the calibrations behind them are local.</strong> Read the labels with that context.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === PHASE_2A_INSERT_POINT === */}

      {/* === PHASE_2B_INSERT_POINT === */}

      {/* === S08 — What You Still Calibrate Manually === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; What You Still Calibrate Manually</p>
          <h2 className="text-2xl font-extrabold mb-4">CIPHER Cannot Do This For You.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The four mechanisms in S07 are the engine&apos;s half. Your half is four more mechanisms that no indicator can route for you. <strong className="text-amber-400">These are the operator-side calibrations &mdash; the ones that determine whether your pre-session, mid-session, and post-session discipline matches the class you are trading.</strong> Get them wrong and the engine&apos;s automatic routing does not save you.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">MANUAL 1 &middot; POSITION SIZE BASELINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER&apos;s Risk Map computes per-trade R based on the trade&apos;s SL distance &mdash; but your baseline R (the percentage of equity that 1R represents) is your responsibility. Per-class baselines differ for structural reasons explored in S10: gap risk in crypto, wider point ranges in indices, macro surprise in gold. <strong className="text-white">Decide the baseline before the session opens. Do not improvise mid-session.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MANUAL 2 &middot; NEWS-WINDOW DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER reads what is on the chart in real time. It cannot anticipate a CPI print 5 minutes from now. Your job is to know the calendar for the class you are trading: central bank events for FX, earnings + Fed days for indices, regulatory events for crypto, CPI/NFP/FOMC/geopolitical for gold. <strong className="text-white">Hard-skip the 30 min pre and 30 min post for any high-impact event.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MANUAL 3 &middot; SESSION TIMING</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX wants the London-NY overlap. Indices want the mid-session. Crypto needs you to define an engagement window because the market does not. Gold wants the overlap windows like FX. <strong className="text-white">The engine fires signals around the clock; your discipline narrows engagement to the window where the class actually has edge.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MANUAL 4 &middot; PRESET FIT PER CLASS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A preset that fits one class can mis-fit another. Sniper on Crypto fits the rarity of apex 4/4 setups; Sniper on Scalper-rhythm Indices over-filters and produces near-zero signal volume. Scalper on Crypto produces too many small trades during 24/7 engagement and burns out the operator. <strong className="text-white">Preset selection is a per-class decision, made between sessions, held for 20 sessions before re-evaluation.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE COMPLEMENTARITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Engine half + operator half = full per-class calibration. The engine&apos;s automatic routing protects you from naive misreading (a 4/4 conviction in FX means the same thing as a 4/4 in Crypto in terms of the framework&apos;s confidence). Your manual calibration protects against the structural differences the engine cannot route for &mdash; gap risk, news anticipation, session rhythm, preset philosophy. <strong className="text-white">Neither half is sufficient alone.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Asset-Class Pre-Session Checklist === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Asset-Class Pre-Session Checklist</p>
          <h2 className="text-2xl font-extrabold mb-4">A Different Routine Per Class.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">L11.25 gave you the universal 15-minute pre-session checklist. This section gives you the class-specific overlay. <strong className="text-amber-400">Same 15-minute time budget; different priorities depending on which class you are opening the session on.</strong> Run the universal checklist as the foundation, then layer the class-specific items on top.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-teal-400 mb-2">FX PRE-SESSION (15 min)</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">3 min</strong> &middot; Overnight news for your pairs + central bank schedule for the day</li>
                <li><strong className="text-white">3 min</strong> &middot; DXY chart + US10Y chart (the Bias row references)</li>
                <li><strong className="text-white">3 min</strong> &middot; Mark prior session highs/lows on watchlist pairs</li>
                <li><strong className="text-white">3 min</strong> &middot; Confirm London open time on your clock (08:00 GMT) and overlap start (13:00 GMT)</li>
                <li><strong className="text-white">3 min</strong> &middot; Pre-session HALT check + drawdown circuit status</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">INDICES PRE-SESSION (15 min)</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">3 min</strong> &middot; Overnight futures action + pre-market news + earnings calendar</li>
                <li><strong className="text-white">3 min</strong> &middot; VIX + SPX charts (the Bias row references)</li>
                <li><strong className="text-white">3 min</strong> &middot; Mark prior session high, low, close on watchlist indices</li>
                <li><strong className="text-white">3 min</strong> &middot; Confirm 10:00 ET (start of engagement) and 15:30 ET (close of engagement) on your clock</li>
                <li><strong className="text-white">3 min</strong> &middot; Pre-session HALT check + drawdown circuit status</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#EF5350' }}>CRYPTO PRE-SESSION (15 min)</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">3 min</strong> &middot; Overnight crypto news (CoinDesk / The Block / regulatory feeds)</li>
                <li><strong className="text-white">3 min</strong> &middot; BTC.D + USDT.D charts (the Bias row references)</li>
                <li><strong className="text-white">3 min</strong> &middot; Confirm your engagement window for today; mark its start and end</li>
                <li><strong className="text-white">3 min</strong> &middot; If Friday: confirm flatten time before 18:00 UTC. If Monday: confirm post-weekend re-engagement plan.</li>
                <li><strong className="text-white">3 min</strong> &middot; Pre-session HALT check + drawdown circuit status</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#0EA5E9' }}>GOLD PRE-SESSION (15 min)</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">3 min</strong> &middot; Macro calendar: CPI / NFP / FOMC / geopolitical headlines</li>
                <li><strong className="text-white">3 min</strong> &middot; DXY + US10Y charts (the Bias row references)</li>
                <li><strong className="text-white">3 min</strong> &middot; If any high-impact event in the next 6 hours: write its time + envelope (30 min pre / post) on your screen</li>
                <li><strong className="text-white">3 min</strong> &middot; Mark prior session structure on XAUUSD</li>
                <li><strong className="text-white">3 min</strong> &middot; Pre-session HALT check + drawdown circuit status</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE COMMON THREAD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every per-class checklist routes you through the same five steps: news scan, Bias row references, structural marks, engagement window, mental state. <strong className="text-white">What changes is the content of each step.</strong> Internalise the structure once; vary the content by class.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Per-Class Position Sizing === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Per-Class Position Sizing Discipline</p>
          <h2 className="text-2xl font-extrabold mb-4">The Baseline Is Local. The Cap Is Universal.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">From L11.22 (Conviction Synthesis): the conviction tier system scales position size geometrically. 1/4 pass, 2/4 half-size, 3/4 standard, 4/4 apex up to 1.5&times; standard within a cap. <strong className="text-amber-400">That ladder is universal across asset classes. What changes per class is what &quot;standard&quot; means.</strong></p>
          <PerClassSizingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bars. FX baseline R is the reference (1.0&times;). Gold tightens to ~0.7&times; for macro-surprise protection. Indices tighten to ~0.6&times; for the wider point-range and higher signal frequency. Crypto tightens to ~0.5&times; for gap-risk protection. <strong className="text-white">The conviction tier ladder runs on top of these baselines.</strong> A 4/4 apex on Crypto at 1.5&times; baseline is still smaller in absolute risk than a 3/4 standard on FX.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY THE BASELINES DIFFER</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">FX (1.0&times;).</strong> Reference baseline. Broker-protected stops, scheduled news, session-bound rhythm. The class your discipline was likely trained on.</li>
                <li><strong className="text-white">Gold (0.7&times;).</strong> Slightly tighter for macro surprise. CPI/NFP/FOMC can reverse the chart faster than CIPHER&apos;s conviction layer can adapt.</li>
                <li><strong className="text-white">Indices (0.6&times;).</strong> Tighter for point-range scaling. A 1% NAS100 move is roughly 290 points; a 1% EURUSD move is 100 pips. The Risk Map computes appropriate SL distances, but cumulative exposure across mid-session signal frequency adds up faster.</li>
                <li><strong className="text-white">Crypto (0.5&times;).</strong> Tightest for gap risk. Sunday gaps can fill below your planned -1R stop, executing at -2R or -3R or worse. Tightening the baseline is the only structural defence.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE CAP IS UNIVERSAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Across all classes, the maximum single-trade exposure is 1.5&times; the class baseline. A 4/4 apex on FX caps at 1.5&times; FX baseline. A 4/4 apex on Crypto caps at 1.5&times; Crypto baseline &mdash; which is smaller in absolute terms because the Crypto baseline is smaller. <strong className="text-white">The cap is the structural defence against the temptation to "double size when conviction is perfect."</strong> Conviction is a multiplier on baseline; it does not override the cap.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE BASELINE IS A STARTING POINT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The ratios above (1.0, 0.7, 0.6, 0.5) are starting points calibrated for an operator with established FX discipline. Adjust further down per your personal risk policy. <strong className="text-white">If your portfolio cannot tolerate a -5R week on a single class, your baseline R is too high regardless of which class you are trading.</strong> Size down until the worst-realistic-case drawdown is recoverable.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Cross-Asset Correlation Discipline ★★★ === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Cross-Asset Correlation Discipline &middot; &#9733;&#9733;&#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">The Macro Reshapes The Operator Filter.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s Bias row gives you the macro context for the class you are trading. But the asset you are on does not exist in isolation &mdash; it moves in correlation with other macros that may or may not align with your trade thesis. <strong className="text-amber-400">Cross-asset correlation discipline is not a signal generator. It is an operator filter that biases which CIPHER signals you take.</strong></p>
          <CrossAssetCorrelationWidget />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Click each macro condition above. Watch which assets light up teal (favoured longs) and which light up magenta (favoured shorts). The widget is a study tool, not a prescription &mdash; the goal is to internalise the cross-asset pattern so that when DXY breaks higher mid-session you immediately know which CIPHER signals to engage more aggressively and which to skip.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THREE MACRO CONDITIONS TO INTERNALISE</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">DXY rising.</strong> USD strength is broad. Non-USD FX pairs favour shorts; USDJPY favours longs (USD numerator). Gold favours shorts. Indices tilt mildly bearish. Crypto correlates risk-off with USD strength.</li>
                <li><strong className="text-white">VIX rising.</strong> Risk-off mood. Equity indices favour shorts. USDJPY and Gold favour longs (safe-haven flows). Crypto sells alongside risk assets.</li>
                <li><strong className="text-white">BTC.D rising.</strong> Intra-crypto rotation. BTC favours longs against the alt complex; ETH/SOL/AVAX favour shorts relative to BTC. Not a macro signal &mdash; a within-class rotation signal.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">HOW THIS CHANGES YOUR OPERATOR FILTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER fires a EURUSD Strong PX LONG. Baseline conviction read: take it. But DXY just broke higher and US10Y is rising. <strong className="text-white">Cross-asset says: this long is against the macro tilt.</strong> Two legitimate responses: skip the trade entirely (most disciplined), or take it at reduced conviction tier (sized down one rung from what the 4/4 score suggests). The framework still fires; you decide which fires to engage based on macro alignment.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE DISCIPLINE IS RECOGNITION, NOT PREDICTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">You are not trying to predict DXY direction. You are recognising what it is doing in real time and adjusting which signals you engage. The Bias row already does most of the work &mdash; it routes to the correct references per class and reports the directional tilt. Your job is to take that tilt seriously when deciding whether to engage a counter-tilt signal. <strong className="text-white">Cross-asset discipline lives entirely in the operator filter; the engine does not need to know it exists.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">AVOID OVER-CORRELATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common trap: chasing every macro signal as if it were a directional read. DXY up does not mean every non-USD asset is a guaranteed short. It tilts the expected value of those trades by a few percent &mdash; meaningful at scale but not enough to override a 4/4 conviction signal that has clean structure. <strong className="text-white">Cross-asset is a sizing/skip filter, not a signal flipper.</strong> Use it to grade trades, not to manufacture them.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Single-Asset-Per-Session Rule === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Single-Asset-Per-Session Rule</p>
          <h2 className="text-2xl font-extrabold mb-4">Open On One Class. Finish On It.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">L11.25 introduced the mode-switching failure: switching CIPHER preset mid-session is a discipline collapse because your pre-session prep was for the original preset. This section extends that rule to the asset class level. <strong className="text-amber-400">Whatever class you opened the session on, that is the class you finish on. No mid-session class switching.</strong></p>
          <SingleAssetLockoutAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the lockout. EURUSD session is active. A tempting BTCUSD signal fires mid-session at 4/4 conviction. The class lockout gate slides in and blocks the switch. The journal records the skip with reason: <em>&quot;Class is locked for the day. BTCUSD eligible tomorrow.&quot;</em> Tomorrow you can open the session on BTCUSD and run it through to close. <strong className="text-white">Today you finish on EURUSD.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">WHY THE RULE EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pre-session preparation for the active class included: news scan for that class, Bias row references for that class, position-size baseline for that class, news-window discipline for that class, session-timing discipline for that class. Switching classes mid-session means executing Class B trades with Class A preparation. <strong className="text-white">Even when the Class B signal is 4/4, the calibration mismatch carries hidden cost.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT &quot;CLASS&quot; MEANS HERE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FX is one class. Indices is another. Crypto is another. Gold/Commodities is another. Within a class, multiple tickers are allowed &mdash; you can trade EURUSD, GBPUSD, and USDJPY in the same session because they share the FX character. You cannot trade EURUSD and BTCUSD in the same session because they are different classes. <strong className="text-white">Class is the unit of calibration. Within-class diversification is fine; cross-class switching is not.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">EDGE CASES</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Watchlist on multiple classes.</strong> Acceptable. You can have charts open across classes for reference. But trades happen only on the active class.</li>
                <li><strong className="text-white">Position carryover.</strong> If a Friday FX position carries to Monday and you open Monday on Indices, the Friday position is managed (TPs/SL) but no new FX trades fire. The Indices class is active for new trades.</li>
                <li><strong className="text-white">Stop-out + switch.</strong> A common rationalisation: &quot;I just stopped out on FX, may as well switch to Crypto.&quot; No. The stop-out triggers the universal 30-minute cooldown, not a class switch. After the cooldown, you re-engage the same class &mdash; or you end the session.</li>
                <li><strong className="text-white">Session boundary.</strong> &quot;Session&quot; is defined by your operating hours, not by the market clock. If you trade FX London-NY overlap then end the day, tomorrow can open on a different class. If you trade FX then break for 6 hours then trade again, that&apos;s the same session &mdash; same class.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE COMMITMENT IS THE EDGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who run single-class sessions accumulate cleaner pattern data, see class-specific failure modes faster, and develop the per-class skill (patience for FX, timing for Indices, reactivity for Crypto, context for Gold) more efficiently. <strong className="text-white">The discipline cost (one skipped 4/4 signal occasionally) is far smaller than the calibration cost of cross-class switching.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S13 — When To Add A Second Asset Class === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; When To Add A Second Asset Class</p>
          <h2 className="text-2xl font-extrabold mb-4">After 30 Sessions of 100% Adherence. Not Before.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The rule for adding a second class is mechanical: <strong className="text-amber-400">30 sessions on your first class, 27 of 30 at 100% protocol adherence, then add a second class &mdash; in a specific sequence.</strong> The sequence is calibrated so each new class introduces ONE new variable on top of what you have already mastered.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE QUALIFYING GATE FOR ADDING A CLASS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">30 sessions completed on Class 1.</strong> Not 20. Not 25. Thirty.</li>
                <li><strong className="text-white">27 of 30 at 100% protocol adherence.</strong> Three "near-miss" sessions allowed where a small drift was caught and corrected mid-session.</li>
                <li><strong className="text-white">Journal coverage 100%.</strong> Every taken trade logged. Every skipped trade logged.</li>
                <li><strong className="text-white">Drawdown circuit honoured if triggered.</strong> Mandatory days off taken when the rule fired.</li>
                <li><strong className="text-white">Profit not required.</strong> The qualifying gate is process, not P&amp;L. A 30-session period with 100% adherence and -3R cumulative still qualifies. The data is what matters; the lesson is in the next-cycle calibration.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE ONBOARDING PROTOCOL FOR A NEW CLASS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Day 1 of new class &middot; STUDY MODE.</strong> Load CIPHER on the new class. Observe Command Center reads for one full session. No trades. Note what is different in cell readouts compared to your Class 1.</li>
                <li><strong className="text-white">Days 2-6 of new class &middot; REDUCED SIZE.</strong> Trade live at 50-70% of your established Class 1 baseline. Run the new class-specific pre-session checklist from S09. Build calibration with low exposure.</li>
                <li><strong className="text-white">Days 7+ of new class &middot; FULL PER-CLASS BASELINE.</strong> Once the reduced-size period has produced a stable rhythm, scale to the per-class baseline from S10 (0.7R for Gold, 0.6R for Indices, 0.5R for Crypto if Class 1 was FX at 1.0R).</li>
                <li><strong className="text-white">Day 30 of new class &middot; AUDIT.</strong> Run the 30-session per-class audit on the new class data. Pattern P&amp;L, skip quality, override audit, preset fit &mdash; all evaluated within the new class only.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE RECOMMENDED CLASS SEQUENCE</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Class 1 &middot; FX (or whichever class your discipline trained on).</strong> The patient asset. Slowest rhythm. Most forgiving. Builds baseline discipline.</li>
                <li><strong className="text-white">Class 2 &middot; GOLD.</strong> Similar rhythm to FX (broker-protected, 24-5 schedule). Introduces ONE new variable: macro news sensitivity.</li>
                <li><strong className="text-white">Class 3 &middot; INDICES.</strong> Introduces ONE more new variable: hard session boundaries with timing-critical windows.</li>
                <li><strong className="text-white">Class 4 &middot; CRYPTO.</strong> Introduces the final variables: 24/7 markets, no broker-side protection, weekend gap risk. The hardest class to onboard because it differs most from FX.</li>
              </ul>
              <p className="text-sm text-gray-400 leading-relaxed mt-3"><strong className="text-white">Skipping the sequence is the most common calibration sequence mistake.</strong> Going FX directly to Crypto without the Gold and Indices intermediates means introducing three new variables simultaneously instead of one at a time.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHEN TO STOP ADDING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most operators top out at 2 active classes in regular rotation. A few sustain 3. Four-class active rotation is rare and demands portfolio-level discipline beyond what most retail traders develop. <strong className="text-white">Two classes is the practical operating ceiling for most operators.</strong> Add a third only if the first two are running at 100% adherence over 60+ sessions each and you have demonstrated the calibration management.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S14 — The 30-Session Per-Class Audit === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; The 30-Session Per-Class Audit &middot; &#9733;&#9733;</p>
          <h2 className="text-2xl font-extrabold mb-4">Three Audits. Three Different Read-Outs.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">L11.25 introduced the 30-session loop as the smallest sample where signal exceeds noise. This section extends it to per-class auditing. <strong className="text-amber-400">Each class runs its own 30-session loop with its own cumulative P&amp;L, its own pattern attribution, its own preset-fit evaluation, and its own next-cycle calibration plan.</strong> Do not blend the three classes&apos; data &mdash; the per-class signal is what matters, not the portfolio average.</p>
          <ThirtySessionByClassScrubber />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Drag the amber knob across the 90-session timeline. The equity curve is segmented by asset class (FX teal, Gold sky, Indices amber). Drag through the FX segment &mdash; cumulative +14R. Drag through the Gold segment &mdash; another +9R, cumulative +23R. Drag through the Indices segment &mdash; another +5R, cumulative +28R. <strong className="text-white">Each class produced positive expectancy individually.</strong> But the per-class slopes differ &mdash; FX is the operator&apos;s strongest class; Indices is the weakest. That insight only exists in a per-class audit, not in the portfolio total.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">PER-CLASS AUDIT DIMENSIONS</p>
              <ul className="text-sm text-gray-400 leading-relaxed space-y-1.5 ml-4">
                <li><strong className="text-white">Cumulative P&amp;L for this class.</strong> Treat each class as a separate book.</li>
                <li><strong className="text-white">Win rate and average R within this class.</strong> 60% win rate at 1.2R average says something different than 35% win rate at 2.5R average.</li>
                <li><strong className="text-white">Pattern attribution within this class.</strong> Did PX continuations carry the class? TS reversals? Coil breakouts? Each pattern&apos;s contribution to this class&apos;s P&amp;L.</li>
                <li><strong className="text-white">Skip quality within this class.</strong> Of the trades you skipped, how many were winners-avoided vs winners-missed? Per-class skip discipline metrics.</li>
                <li><strong className="text-white">Preset fit within this class.</strong> Was the preset you ran appropriate for this class&apos;s rhythm? If your edge concentrated in PX continuations, did Sniper over-filter and cost you trades?</li>
                <li><strong className="text-white">Class-specific failure patterns.</strong> News-window overrides for FX/Gold. Open-chasing for Indices. Weekend FOMO for Crypto. Catalogue and count.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">CROSS-CLASS COMPARISONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">After three or four 30-session class cycles you can start to read cross-class patterns: <strong className="text-white">which class actually carries your edge?</strong> Most operators discover their edge is concentrated in one or two classes &mdash; usually the class they trained on plus one other. The other classes contribute positively but at lower expectancy. That cross-class signal informs portfolio allocation: weight your active engagement toward your high-edge classes, treat the lower-edge classes as study or maintenance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">NEXT-CYCLE CALIBRATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The audit produces a next-cycle plan for each active class. Examples: &quot;On FX, run Swing Trader instead of Sniper next cycle because pattern attribution showed PX continuations were the edge.&quot; &quot;On Gold, tighten news-window discipline; three of five losses came from envelope overrides.&quot; &quot;On Indices, abandon the open window entirely; all four open-window engagements were losers.&quot; <strong className="text-white">Each calibration change is class-specific and bounded to the next 30 sessions.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">DO NOT BLEND CLASSES IN THE AUDIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common error: aggregating all 90 sessions into one number (+28R total) and declaring success. <strong className="text-white">That number hides the per-class truth.</strong> The +28R portfolio total could be +28/+0/+0 (one class carrying everything) or +14/+9/+5 (balanced contribution) or +20/-5/+13 (one class actively destroying value). Each scenario demands a different next-cycle response. The aggregate hides the signal; the per-class breakdown reveals it.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Asset-Class Mastery Path === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Asset-Class Mastery Path</p>
          <h2 className="text-2xl font-extrabold mb-4">One Class At A Time. The Staircase Has No Shortcuts.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The mastery path is mechanical: master one class, audit, add another, master, audit, repeat. <strong className="text-amber-400">Each step is gated by 30 sessions of 100% adherence on the prior class.</strong> No skipping steps. No simultaneous onboarding of two new classes. No optimisation theatre. Just the staircase, one step at a time.</p>
          <ClassMasteryStaircaseAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Each step on the staircase is 30 sessions. Each audit gate checks the prior step&apos;s adherence before unlocking the next. The operator climbs from FX (patience) to Gold (macro context) to Indices (session timing) to Crypto (reactivity) over a year of disciplined practice. <strong className="text-white">A year is the realistic timescale.</strong> Anyone telling you they mastered four asset classes in three months is either lying or has not yet experienced the failure modes that mastery defends against.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-2">THE TIMELINE IS LONG &mdash; AND DELIBERATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">30 sessions on Class 1 is roughly 6 weeks of disciplined practice (assuming ~5 sessions per week, allowing for skip days, audits, and rest). The full four-class staircase is 120 sessions or ~24 weeks. <strong className="text-white">A full year of practice produces a four-class operator with portfolio-level discipline.</strong> Shorter timelines produce operators who can technically trade four classes but lack the per-class failure-mode immunity that comes from real per-class cycles.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">MOST OPERATORS STOP AT TWO CLASSES</p>
              <p className="text-sm text-gray-400 leading-relaxed">After the FX-Gold pair (two classes, similar rhythms, 60 sessions of practice), most operators have demonstrated everything they need: per-class calibration, single-asset-per-session discipline, the 30-session per-class audit. Adding a third class (Indices or Crypto) is a portfolio-level decision, not a necessity. <strong className="text-white">Two-class operators with deep per-class skill outperform four-class operators with shallow per-class skill on every meaningful metric.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">THE GRADUATION CRITERION</p>
              <p className="text-sm text-gray-400 leading-relaxed">For this lesson&apos;s certificate, the graduation criterion is process-defined, not P&amp;L-defined: complete 30 sessions on a single asset class with 100% adherence on 27 of 30, full journal coverage, and an honest 30-session per-class audit. The cert says &quot;Asset-Class Operator&quot; because the qualification is per-class discipline &mdash; not portfolio breadth, not profit, not session count.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-2">WHAT COMES AFTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">L11.27 (the next lesson, Failure Modes / Mastery Capstone) takes you across the full set of failure modes that emerge specifically at scale &mdash; multi-class, multi-cycle, the discipline drift that comes after a winning quarter, the identity creep where the operator starts confusing recent profit for permanent skill. The asset-class staircase from this lesson is the structure that L11.27&apos;s capstone tests at scale.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === MISTAKES === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-red-400/60 mb-3">Six Mistakes To Defend Against</p>
          <h2 className="text-3xl font-extrabold mb-6">The Asset-Class Failure Catalogue.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Six characteristic failures emerge from misapplied calibration. Each has a class-specific trigger and a class-specific defence. <strong className="text-red-400">Recognise yours; defend mechanically against it.</strong> The defences are not nuanced &mdash; they are mechanical rules that fire faster than rationalisation can override.</p>

          <PerClassFailurePatternAnim />

          <p className="text-gray-400 leading-relaxed mt-4 mb-8">Four of the six mistakes are class-specific: FX news-window override, Indices open-chasing, Crypto weekend FOMO, Gold macro-mismatch. The remaining two (mode-switching, blended-audit) emerge whenever an operator runs more than one class without disciplined separation. <strong className="text-white">All six are anticipated; all six have mechanical defences.</strong></p>

          <div className="space-y-4">

            {/* MISTAKE 1 — Asset-class mode switching */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 1 &middot; ASSET-CLASS MODE SWITCHING</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> You opened the session on EURUSD with FX calibration. Mid-session a 4/4 conviction BTCUSD signal appears. The signal score is real; the conviction tier is real; CIPHER fired correctly. You take it because &quot;a 4/4 is a 4/4.&quot; The trade loses not because the engine was wrong but because your pre-session prep, position-size baseline, news-window discipline, and session-timing rules were all calibrated for FX, not Crypto.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The framework&apos;s universality &mdash; the same conviction score means the same thing on every asset &mdash; produces the illusion that the OPERATOR&apos;s calibration is also universal. It isn&apos;t.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: single-asset-per-session rule. Whatever class you opened the session on, that is the class you finish on. Other classes are watchlist only. The skipped 4/4 signal goes into the journal with reason &quot;class is locked&quot; and BTCUSD becomes eligible tomorrow.</p>
            </div>

            {/* MISTAKE 2 — Crypto weekend FOMO hold */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 2 &middot; CRYPTO WEEKEND FOMO HOLD</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> Friday afternoon. You have a winning BTCUSD position that hit TP1. Remaining 50% is in profit. The technical setup &quot;looks bulletproof&quot; for continuation Monday. You decide to hold over the weekend. Sunday brings a regulatory headline; Asia open gaps the price below your break-even stop; broker fills 3.5R below entry instead of at break-even.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The TP1 hit produces a feeling that &quot;the trade is now risk-free.&quot; This is true on FX (where break-even stops are honoured cleanly) but false on Crypto (where Sunday gaps can blow past any stop level regardless of where it sits).</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: flatten all crypto positions before Friday 18:00 UTC. No exceptions for &quot;positions that hit TP1.&quot; No exceptions for &quot;small remaining size.&quot; The break-even-stop confidence that exists in FX does not transfer to Crypto. Friday close is the structural defence against the Sunday gap.</p>
            </div>

            {/* MISTAKE 3 — Indices open-chasing */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 3 &middot; INDICES OPEN-CHASING</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 09:35 ET. NAS100 just printed a Strong PX LONG with 4/4 conviction. You usually skip the first 30 minutes per your protocol. The signal looks decisive &mdash; clean break, body satisfied, volume strong. You override the timing rule because &quot;this 4/4 is different.&quot; The open noise reverses by 09:55; your stop hits at 09:48. The same signal would have re-fired at 10:15 with cleaner context.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The opening window produces the day&apos;s sharpest visual moves. Sharp moves correlate with conviction in the operator&apos;s pattern recognition &mdash; but on indices specifically, opening sharpness correlates with noise, not signal.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: hard-skip 09:30-10:00 ET on indices. No engagement regardless of conviction score. Set an alert at 10:00 if the setup is still active; engage from there. The 30-minute skip is the structural defence against the open-noise reversal.</p>
            </div>

            {/* MISTAKE 4 — Gold news-envelope override */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 4 &middot; GOLD NEWS-ENVELOPE OVERRIDE</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 13:25 ET. CPI prints in 5 minutes. XAUUSD shows a clean PX LONG with 4/4 conviction. The chart is pristine; the Bias row aligns. You decide to take it &quot;before the news&quot; to lock in the pre-news entry. The CPI surprise hits hawkish; gold drops 1.5%; your stop fires immediately at full -1R. The same signal would have re-fired at 14:01 with a clearer post-CPI directional read.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The pre-news entry feels like an information edge. It is not &mdash; the print has not happened yet, so neither you nor CIPHER have any advantage. What feels like &quot;getting in early&quot; is structurally guaranteed to be a reactive position rather than a deliberate one.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: hard-skip the 30 minutes pre-event and 30 minutes post-event for any high-impact macro release. Re-engage at minute 31+ with fresh context. The 60-minute envelope is the structural defence against the macro-surprise reversal.</p>
            </div>

            {/* MISTAKE 5 — Calibration-sequence skip */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 5 &middot; CALIBRATION-SEQUENCE SKIP</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 30 sessions of clean FX. Ready to add a second class. You skip Gold and Indices and onboard Crypto directly because &quot;Crypto has the most upside.&quot; The first 10 Crypto sessions are a calibration nightmare: 24/7 hours produce decision fatigue, weekend gap risk surprises you on the first Sunday, the engagement-window discipline (which you never had to develop for FX) collapses repeatedly. You finish the 30-session cycle at -6R despite individually-correct signal reads.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> Excitement about Crypto&apos;s volatility (a real edge for skilled operators) overrides the calibration sequence (a structural prerequisite for becoming a skilled operator on that class). Three new variables introduced simultaneously &mdash; 24/7 hours, gap risk, no broker protection &mdash; instead of one new variable at a time.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: honour the FX&nbsp;&rarr;&nbsp;Gold&nbsp;&rarr;&nbsp;Indices&nbsp;&rarr;&nbsp;Crypto sequence. Add classes one at a time, in the prescribed order, with 30-session audits between each addition. The sequence is the structural defence against the calibration-overwhelm collapse.</p>
            </div>

            {/* MISTAKE 6 — Blended-class audit */}
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold tracking-widest text-red-400 mb-2">MISTAKE 6 &middot; BLENDED-CLASS AUDIT</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The failure.</strong> 90 sessions across FX, Gold, and Indices. Cumulative +28R. You audit by looking at the aggregate number, declare success, and continue the same calibration into the next cycle. The aggregate hides that FX produced +20R, Gold produced +13R, and Indices destroyed -5R. The next cycle reproduces the same pattern; Indices continues to bleed; you eventually attribute the loss to &quot;market conditions&quot; rather than recognising that Indices was never your edge class.</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-white">The trigger.</strong> The positive aggregate feels like validation. Audits that produce uncomfortable per-class signals (one class actively destroying value) are easier to skip than to read honestly. The aggregate is the comfortable read; the per-class breakdown is the actionable one.</p>
              <p className="text-sm text-gray-300 leading-relaxed"><strong className="text-red-400">The defence.</strong> Mechanical: per-class audit only. Three separate audits for three active classes. Three separate next-cycle plans. Three separate &quot;edge attribution&quot; reads. Never aggregate to a portfolio number until each class has been read on its own merits. The per-class structure is the defence against the comfortable-aggregate distortion.</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* === CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">For The Second Monitor</p>
          <h2 className="text-3xl font-extrabold mb-6">Asset-Class Adaptation Cheat Sheet.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Pin to your trading desk. The four-class characters, what CIPHER calibrates automatically, what you calibrate manually, and the per-class baselines &mdash; reduced to the operational essentials.</p>

          <div className="p-5 rounded-2xl glass-card space-y-5">

            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE GROUNDBREAKING CONCEPT</p>
              <p className="text-sm text-gray-300 leading-relaxed">The framework is universal. The calibration is local. Same architecture every class; different routing per class.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">FOUR ASSET CHARACTERS</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li><strong className="text-teal-400">FX</strong> &middot; the patient asset &middot; sessions, slow ranging, broker-protected stops</li>
                <li><strong className="text-amber-400">INDICES</strong> &middot; the session-bound asset &middot; open/close volatility, mid-session signal</li>
                <li><strong style={{ color: '#EF5350' }}>CRYPTO</strong> &middot; the reactive asset &middot; 24/7, weekend gap risk, no stop protection</li>
                <li><strong style={{ color: '#0EA5E9' }}>GOLD</strong> &middot; the macro asset &middot; multi-surface news, harder trends than FX</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">WHAT CIPHER SELF-CALIBRATES</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Signal engine width &middot; tighter for FX/Gold, baseline for Stocks, intermediate for Crypto/Indices</li>
                <li>PX pipeline gates &middot; body filter and pre-cross distance per class</li>
                <li>TS thresholds &middot; FX tightest, Stocks widest, Crypto/Index intermediate</li>
                <li>Macro context references &middot; DXY/US10Y for FX/Gold, BTC.D/USDT.D for Crypto, VIX/SPX for Stocks/Indices</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">WHAT YOU STILL CALIBRATE MANUALLY</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Position size baseline &middot; per-class R ratios</li>
                <li>News-window discipline &middot; class-specific calendar awareness</li>
                <li>Session timing &middot; class-specific engagement windows</li>
                <li>Preset fit per class &middot; one preset per class per 20 sessions</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">PER-CLASS BASELINE R</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>FX &middot; 1.0&times; reference</li>
                <li>Gold &middot; 0.7&times; reference (macro surprise)</li>
                <li>Indices &middot; 0.6&times; reference (wider point range, higher frequency)</li>
                <li>Crypto &middot; 0.5&times; reference (gap risk)</li>
                <li>Universal cap &middot; 1.5&times; class baseline at 4/4 apex conviction</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE FIVE LOCKED RULES</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. Single-asset-per-session. Open on one class, finish on it.</li>
                <li>2. Crypto Friday flatten. All crypto positions closed before 18:00 UTC Friday.</li>
                <li>3. Indices 30-minute open/close skip. No engagement 09:30-10:00 ET or 15:30-16:00 ET.</li>
                <li>4. Gold 60-minute news envelope. Hard-skip 30 min pre and post any high-impact macro event.</li>
                <li>5. Class-onboarding sequence. FX &rarr; Gold &rarr; Indices &rarr; Crypto. No skipping.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">CROSS-ASSET CORRELATION (OPERATOR FILTER ONLY)</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>DXY &uarr; &rarr; non-USD FX shorts, Gold short, USDJPY long</li>
                <li>VIX &uarr; &rarr; equity shorts, Gold long, USDJPY long, Crypto short</li>
                <li>BTC.D &uarr; &rarr; BTC long, alts (ETH, SOL, AVAX) short</li>
              </ul>
              <p className="text-sm text-gray-400 mt-2 italic">Correlation grades signals; it does not generate them.</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">CLASS-ONBOARDING PROTOCOL</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Day 1 &middot; Study mode. No trades. Observe Command Center reads.</li>
                <li>Days 2-6 &middot; Reduced size. 50-70&percnt; of Class 1 baseline.</li>
                <li>Days 7+ &middot; Full per-class baseline from the table above.</li>
                <li>Day 30 &middot; Per-class audit. Pattern attribution + next-cycle plan.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">30-SESSION PER-CLASS AUDIT DIMENSIONS</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>Cumulative P&amp;L for this class only (never aggregate)</li>
                <li>Win rate and average R within this class</li>
                <li>Pattern attribution (PX vs TS vs Coil within this class)</li>
                <li>Skip quality within this class (winners-avoided vs winners-missed)</li>
                <li>Preset fit within this class</li>
                <li>Class-specific failure patterns counted</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE SIX MISTAKES</p>
              <ul className="text-sm text-gray-300 leading-relaxed space-y-1 ml-4">
                <li>1. Asset-class mode switching</li>
                <li>2. Crypto weekend FOMO hold</li>
                <li>3. Indices open-chasing</li>
                <li>4. Gold news-envelope override</li>
                <li>5. Calibration-sequence skip (FX &rarr; Crypto without intermediates)</li>
                <li>6. Blended-class audit (aggregating to hide per-class signal)</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-2">THE OPERATING CEILING</p>
              <p className="text-sm text-gray-300 leading-relaxed">Most operators top out at 2 active classes. Two-class operators with deep per-class skill outperform four-class operators with shallow per-class skill on every meaningful metric.</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* === PHASE_3A_INSERT_POINT === */}

      {/* === GAME === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Asset-Class Drill</p>
          <h2 className="text-3xl font-extrabold mb-6">Five Scenarios. Five Decisions.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Each scenario presents a cross-asset decision point. Pick the disciplined response. Each option locks once selected; an explanation appears regardless of correctness. <strong className="text-amber-400">There are no &quot;trick&quot; questions &mdash; just the disciplined answer and four common rationalisations of less-disciplined alternatives.</strong></p>

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
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Asset-Class Operator Quiz</p>
          <h2 className="text-3xl font-extrabold mb-6">Thirteen Questions. 66&percnt; To Earn The Cert.</h2>
          <p className="text-gray-400 leading-relaxed mb-8">Answer all 13. Submit when complete. <strong className="text-amber-400">9 of 13 correct (~66&percnt;)</strong> earns the Asset-Class Operator certificate. Re-take is available on failed attempts.</p>

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
                <p className="text-sm text-teal-400 font-bold">PASSED &mdash; Asset-Class Operator certificate unlocked below.</p>
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

      {/* === CERT REVEAL === */}
      {certRevealed && (
        <section className="max-w-2xl mx-auto px-5 py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <div className="relative p-8 rounded-3xl text-center overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(38,166,154,0.08), rgba(255,179,0,0.08), rgba(14,165,233,0.08))',
              border: '2px solid rgba(255,179,0,0.4)',
            }}>
              {/* Rotating conic-gradient ring */}
              <div className="absolute inset-0 pointer-events-none opacity-30" style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(255,179,0,0.3), transparent, rgba(38,166,154,0.3), transparent)',
                animation: 'spin 6s linear infinite',
              }} />
              <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

              <div className="relative z-10">
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">Certificate Awarded</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Asset-Class Operator</h2>
                <p className="text-sm text-gray-400 mb-6">Lesson 26 of Level 11 &middot; CIPHER PRO Mastery</p>
                <div className="inline-block px-4 py-2 rounded-lg bg-black/30 border border-white/10">
                  <p className="text-[10px] tracking-widest text-gray-500 mb-1">CERTIFICATE ID</p>
                  <p className="text-sm font-mono font-bold text-amber-400">{certId}</p>
                </div>
                <p className="text-xs text-gray-500 mt-6 italic max-w-md mx-auto leading-relaxed">
                  Awarded for completing Cipher Asset-Class Adaptation with demonstrated understanding of the four asset-class characters, automatic vs manual calibration, the single-asset-per-session rule, per-class sizing discipline, cross-asset correlation, the class-onboarding sequence, and the 30-session per-class audit.
                </p>
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
