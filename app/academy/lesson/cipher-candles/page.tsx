'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

// ============================================================
// LESSON 11.23 — Cipher Candles
// Cert: Candles Operator
// GC: Three metrics. Two intensities. One read on every bar.
// ============================================================
// Closes the Visual Layer arc. Teaches:
//   1. The 3-score architecture (Velocity / Tension / Composite)
//   2. The 8-level gradient (4 teal + 4 magenta shades)
//   3. Default — when NOT to use Cipher Candles
//   4. Trend Mode — the velocity read
//   5. Tension Mode — the stretch read
//   6. Composite Mode — the 50/30/20 blend
//   7. Standard vs Bold — the intensity dimension
//   8. Reading single bars + clusters
//   9. Regime shifts on candles
//  10. How candles confirm the L11.22 conviction synthesis
//  11. Mode-to-preset mapping
//  12. Mode-switching mid-session edge cases
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
// CIPHER CANDLE PALETTE — exact Pine constants (8-level gradient)
// 4 teal positive shades + 4 magenta negative shades
// ============================================================
const TEAL_DEEP = '#0E8A7F';
const TEAL_STD = '#26A69A';
const TEAL_LIGHT = '#5BC0B5';
const TEAL_PALE = '#A6E0DA';
const MAG_PALE = '#F4B8B7';
const MAG_LIGHT = '#EF8A88';
const MAG_STD = '#EF5350';
const MAG_DEEP = '#C13C39';

// ============================================================
// ANIMSCENE — locked gold-standard wrapper (byte-for-byte from L11.18)
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
    const colors = [TEAL_STD, '#FFB300', MAG_STD, '#FFFFFF', '#FBBF24'];
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
// HELPER — easing + score-to-color mapper
// ============================================================
const easeInOut = (x: number): number => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// Maps a score in [-100, +100] to an 8-level gradient color
// Mirrors the Pine cipher_candle(score) function exactly
function scoreToColor(score: number): string {
  if (score >= 80) return TEAL_DEEP;
  if (score >= 50) return TEAL_STD;
  if (score >= 20) return TEAL_LIGHT;
  if (score >= 0) return TEAL_PALE;
  if (score >= -20) return MAG_PALE;
  if (score >= -50) return MAG_LIGHT;
  if (score >= -80) return MAG_STD;
  return MAG_DEEP;
}

// Adjust alpha for Standard (muted) vs Bold (vivid) intensity
function applyIntensity(hex: string, isBold: boolean): string {
  if (isBold) return hex;
  // Standard variant — slight transparency overlay (fade=12 in Pine, ~95% alpha)
  return hex + 'F0';
}

// ============================================================
// ANIMATION 1 — GradientHeroAnim (Hero)
// The 8-shade gradient appears horizontally as a row of candles,
// score values mapping underneath. Sweeps from MAG_DEEP (-100)
// through PALE shades to TEAL_DEEP (+100). Visual signature.
// ============================================================
function GradientHeroAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CIPHER CANDLE GRADIENT', w / 2, 26);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('8 shades \u2014 4 teal + 4 magenta \u2014 score \u2212100 to +100', w / 2, 44);

    // 8 candles representing the gradient
    const scores = [-90, -65, -35, -10, 10, 35, 65, 90];
    const colors = scores.map((s) => scoreToColor(s));
    const labels = ['MAG_DEEP', 'MAG_STD', 'MAG_LIGHT', 'MAG_PALE', 'TEAL_PALE', 'TEAL_LIGHT', 'TEAL_STD', 'TEAL_DEEP'];

    const candleW = (w * 0.85) / 8;
    const candleH = h * 0.42;
    const startX = (w - candleW * 8) / 2;
    const candleY = 70;

    scores.forEach((score, i) => {
      const revealStart = i * 0.07;
      if (tt < revealStart) return;
      const fade = Math.min(1, (tt - revealStart) / 0.10);

      const x = startX + i * candleW;
      // Candle body
      ctx.globalAlpha = fade;
      ctx.fillStyle = colors[i];
      const bodyTop = candleY + 10;
      const bodyH = candleH - 20;
      ctx.fillRect(x + candleW * 0.15, bodyTop, candleW * 0.7, bodyH);

      // Wick
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, bodyTop - 6);
      ctx.lineTo(x + candleW / 2, bodyTop + bodyH + 6);
      ctx.stroke();

      // Score label below
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(score > 0 ? `+${score}` : `${score}`, x + candleW / 2, candleY + candleH + 14);

      // Color name
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(labels[i], x + candleW / 2, candleY + candleH + 28);

      ctx.globalAlpha = 1;
    });

    // Sweeping pointer once gradient is built
    if (tt > 0.65) {
      const sweepT = (tt - 0.65) / 0.30;
      const score = -100 + sweepT * 200;
      const idx = Math.floor((score + 100) / 25);
      const pX = startX + (idx + 0.5) * candleW;

      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, candleY - 4);
      ctx.lineTo(pX, candleY + candleH + 4);
      ctx.stroke();

      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`score: ${Math.round(score)}`, pX, candleY - 8);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Saturation = conviction. Direction = side.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — ThreeScoresAnim (S02 — The 3-score architecture)
// Three columns side by side: VELOCITY, TENSION, COMPOSITE.
// For one example bar, each score computes in parallel:
//   - Velocity bar fills: 0 -> 65
//   - Tension bar fills: 0 -> 40
//   - Composite formula appears: 0.5*65 + 0.3*40 + 0.2*30 = 50.5
// Then each column resolves to a single colored candle.
// ============================================================
function ThreeScoresAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THREE SCORES \u2014 ONE BAR', w / 2, 24);

    // Three columns
    const colW = (w - 60) / 3;
    const startX = 30;
    const colTop = 50;
    const colH = h - 110;

    const cols = [
      { name: 'VELOCITY', score: 65, formula: 'c_velocity / vel_max \u00D7 100', desc: 'Directional momentum' },
      { name: 'TENSION', score: 40, formula: 'c_tension / tens_max \u00D7 100', desc: 'Stretch from Flow' },
      { name: 'COMPOSITE', score: 51, formula: '0.50V + 0.30T + 0.20Vol', desc: 'Three dimensions blended' },
    ];

    cols.forEach((col, i) => {
      const x = startX + i * colW + (i * 5);
      const cw = colW - 5;
      const isComposite = i === 2;

      // Column body
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, colTop, cw, colH);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, colTop, cw, colH);

      // Header
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.name, x + cw / 2, colTop + 18);

      // Description
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(col.desc, x + cw / 2, colTop + 32);

      // Formula
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.fillText(col.formula, x + cw / 2, colTop + 50);

      // Score animates
      const fillT = isComposite
        ? Math.max(0, Math.min(1, (tt - 0.5) / 0.20))
        : Math.max(0, Math.min(1, (tt - 0.20 - i * 0.10) / 0.20));
      const visScore = Math.round(col.score * fillT);

      // Score bar
      const barY = colTop + 70;
      const barH = 20;
      const barX = x + 15;
      const barW = cw - 30;

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(barX, barY, barW, barH);

      // Bar fill — proportional to score (0-100)
      const fillW = (col.score / 100) * barW * fillT;
      ctx.fillStyle = scoreToColor(col.score);
      ctx.fillRect(barX, barY, fillW, barH);

      // Score number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${visScore}`, x + cw / 2, barY + 50);

      // Resulting candle (after fillT > 0.95)
      if (fillT > 0.90) {
        const candleX = x + cw / 2 - 10;
        const candleY = barY + 70;
        const candleW2 = 20;
        const candleH2 = 60;
        ctx.fillStyle = scoreToColor(col.score);
        ctx.fillRect(candleX, candleY, candleW2, candleH2);
        ctx.strokeStyle = scoreToColor(col.score);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(candleX + candleW2 / 2, candleY - 8);
        ctx.lineTo(candleX + candleW2 / 2, candleY + candleH2 + 8);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('candle', x + cw / 2, candleY + candleH2 + 22);
      }
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three scores. Three modes. Pick one to paint with.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — EightLevelGradientAnim (S03 — The 8-Level Gradient)
// A single candle morphs through all 8 shades as a score sweeps
// from -100 to +100 and back. The threshold lines (-80, -50, -20,
// 0, 20, 50, 80) appear and label each tier.
// ============================================================
function EightLevelGradientAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE \u2192 SHADE', w / 2, 22);

    // Sweep score from -100 to +100 to -100
    const half = tt < 0.5 ? tt / 0.5 : 1 - (tt - 0.5) / 0.5;
    const score = -100 + half * 200;

    // Threshold tiers — left side label list
    const thresholds = [
      { lo: 80, hi: 100, label: 'TEAL_DEEP', desc: 'strong bull' },
      { lo: 50, hi: 80, label: 'TEAL_STD', desc: 'steady bull' },
      { lo: 20, hi: 50, label: 'TEAL_LIGHT', desc: 'developing' },
      { lo: 0, hi: 20, label: 'TEAL_PALE', desc: 'faint' },
      { lo: -20, hi: 0, label: 'MAG_PALE', desc: 'faint' },
      { lo: -50, hi: -20, label: 'MAG_LIGHT', desc: 'developing' },
      { lo: -80, hi: -50, label: 'MAG_STD', desc: 'steady bear' },
      { lo: -100, hi: -80, label: 'MAG_DEEP', desc: 'strong bear' },
    ];

    const listX = 24;
    const listW = 130;
    const listTop = 50;
    const listRowH = (h - 100) / 8;

    thresholds.forEach((th, i) => {
      const y = listTop + i * listRowH;
      const isActive = score >= th.lo && score < th.hi;
      const c = scoreToColor((th.lo + th.hi) / 2);

      // Row bg
      ctx.fillStyle = isActive ? c + '30' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(listX, y, listW, listRowH - 3);
      ctx.strokeStyle = isActive ? c : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.strokeRect(listX, y, listW, listRowH - 3);

      // Range label
      ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const range = th.hi === 100 ? '\u226580' : th.lo === -100 ? '<-80' : `${th.lo} to ${th.hi}`;
      ctx.fillText(range, listX + 6, y + listRowH * 0.45);

      // Color label
      ctx.fillStyle = c;
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(th.label, listX + 6, y + listRowH * 0.78);
    });

    // Right side — big candle morphing
    const candleX = w * 0.62;
    const candleW = 60;
    const candleY = 70;
    const candleH = h - 130;
    const candleColor = scoreToColor(score);

    // Candle body
    ctx.fillStyle = candleColor;
    ctx.fillRect(candleX, candleY, candleW, candleH);

    // Wick
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(candleX + candleW / 2, candleY - 14);
    ctx.lineTo(candleX + candleW / 2, candleY + candleH + 14);
    ctx.stroke();

    // Score readout
    ctx.fillStyle = candleColor;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score >= 0 ? `+${Math.round(score)}` : `${Math.round(score)}`, candleX + candleW / 2, candleY + candleH + 48);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.fillText('current score', candleX + candleW / 2, candleY + candleH + 64);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Eight shades. One number maps to one color.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 4 — TrendModeAnim (S05 — Trend Mode)
// 16 candles painted by VELOCITY score. As the chart trends up
// the candles transition: PALE -> LIGHT -> STD -> DEEP teal,
// then fade back as velocity decays. The cluster shows what
// "Trend mode reads" looks like in motion.
// ============================================================
function TrendModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TREND MODE \u2014 PAINTED BY VELOCITY', w / 2, 22);

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Deep color = strong velocity. Pale = decelerating.', w / 2, 38);

    // Chart area
    const cx = 30;
    const cy = 60;
    const cw = w - 60;
    const ch = h - 110;

    // 16 candles. Velocity profile: builds, peaks, decays.
    const nC = 16;
    const cwBar = cw / nC;

    // Predefined OHLC + velocity profile (deterministic)
    const candleData = [
      { o: 0.62, c: 0.60, vel: -10 },
      { o: 0.60, c: 0.58, vel: -15 },
      { o: 0.58, c: 0.59, vel: 5 },
      { o: 0.59, c: 0.56, vel: 25 },
      { o: 0.56, c: 0.52, vel: 45 },
      { o: 0.52, c: 0.47, vel: 65 },
      { o: 0.47, c: 0.41, vel: 85 },
      { o: 0.41, c: 0.34, vel: 95 },
      { o: 0.34, c: 0.28, vel: 90 },
      { o: 0.28, c: 0.24, vel: 75 },
      { o: 0.24, c: 0.22, vel: 50 },
      { o: 0.22, c: 0.21, vel: 30 },
      { o: 0.21, c: 0.20, vel: 15 },
      { o: 0.20, c: 0.21, vel: -5 },
      { o: 0.21, c: 0.22, vel: -15 },
      { o: 0.22, c: 0.23, vel: -10 },
    ];

    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);

    for (let i = 0; i < visCount; i++) {
      const cd = candleData[i];
      // Trend Mode is short-side here (velocity = bearish acceleration)
      // We invert the score reading: high abs(vel) with downward direction = MAG_DEEP
      const score = cd.c < cd.o ? -cd.vel : cd.vel; // close < open = bearish, but we keep sign of velocity for clarity
      const color = scoreToColor(score);

      const cxBar = cx + i * cwBar + cwBar / 2;
      const oY = cy + cd.o * ch;
      const ccY = cy + cd.c * ch;
      const top = Math.min(oY, ccY);
      const bot = Math.max(oY, ccY);

      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }

    // Velocity readout for the latest visible bar
    if (visCount > 0) {
      const last = candleData[Math.min(nC - 1, visCount - 1)];
      const score = last.c < last.o ? -last.vel : last.vel;
      const color = scoreToColor(score);

      ctx.fillStyle = color;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`velocity: ${score >= 0 ? '+' : ''}${score}`, cx + cw - 8, cy + 16);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Glance-readable trend strength. No panel needed.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}


// ============================================================
// ANIMATION 6 — TensionModeAnim (S06 — Tension Mode)
// 16 candles painted by TENSION score. Price stretches from Flow,
// candles transition PALE -> LIGHT -> STD -> DEEP teal as stretch
// builds, then snaps back to PALE/MAG as price reverts to Flow.
// Teaches the stretch-then-snap pattern.
// ============================================================
function TensionModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TENSION MODE \u2014 PAINTED BY STRETCH', w / 2, 22);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Deep color = stretched. Pale = near Flow line.', w / 2, 38);

    // Chart area
    const cx = 30;
    const cy = 60;
    const cw = w - 60;
    const ch = h - 110;

    // Flow line — central reference
    const flowY = cy + ch * 0.55;
    ctx.strokeStyle = 'rgba(255,179,0,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, flowY);
    ctx.lineTo(cx + cw, flowY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,179,0,0.6)';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Flow line', cx + cw - 4, flowY - 4);

    // 16 candles — building stretch then snapping back
    const nC = 16;
    const cwBar = cw / nC;

    // Profile: starts at flow, stretches up dramatically, snaps back
    const candleData = [
      { o: 0.55, c: 0.54, tens: 5 },
      { o: 0.54, c: 0.52, tens: 12 },
      { o: 0.52, c: 0.49, tens: 22 },
      { o: 0.49, c: 0.46, tens: 35 },
      { o: 0.46, c: 0.42, tens: 50 },
      { o: 0.42, c: 0.38, tens: 65 },
      { o: 0.38, c: 0.34, tens: 78 },
      { o: 0.34, c: 0.30, tens: 88 },
      { o: 0.30, c: 0.27, tens: 95 },
      { o: 0.27, c: 0.30, tens: 78 },
      { o: 0.30, c: 0.36, tens: 55 },
      { o: 0.36, c: 0.43, tens: 30 },
      { o: 0.43, c: 0.50, tens: 10 },
      { o: 0.50, c: 0.54, tens: -10 },
      { o: 0.54, c: 0.55, tens: -5 },
      { o: 0.55, c: 0.55, tens: 0 },
    ];

    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);

    for (let i = 0; i < visCount; i++) {
      const cd = candleData[i];
      // Tension is signed: above Flow = positive (teal), below = negative (magenta)
      // In this profile price moves below Flow then back, so tension is positive (stretched bear-side)
      // We use the sign convention: stretched bullish = teal, stretched bearish = magenta
      // Here all bars are below Flow → magenta side, with intensity by stretch magnitude
      // BUT the snap-back bars (post peak) are returning to Flow → tension decays
      const score = cd.c < cd.o ? -cd.tens : cd.tens > 0 ? -cd.tens : Math.abs(cd.tens);
      // Simpler: stretched below Flow = magenta; returning above Flow = pale teal
      const isAboveFlow = cd.c > 0.55;
      const finalScore = isAboveFlow ? Math.abs(cd.tens) * 0.3 : -cd.tens;
      const color = scoreToColor(finalScore);

      const cxBar = cx + i * cwBar + cwBar / 2;
      const oY = cy + cd.o * ch;
      const ccY = cy + cd.c * ch;
      const top = Math.min(oY, ccY);
      const bot = Math.max(oY, ccY);

      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }

    // Annotation: peak stretch marker
    if (visCount > 8) {
      const peakX = cx + 8 * cwBar + cwBar / 2;
      const peakY = cy + 0.27 * ch;
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(peakX, peakY - 12);
      ctx.lineTo(peakX, peakY - 4);
      ctx.stroke();
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('peak stretch', peakX, peakY - 16);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stretch builds in deep color. Snap-back fades to pale.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — CompositeModeAnim (S07 — Composite Mode)
// Three layers visualized: Velocity (50%), Tension (30%), Volume (20%).
// Each layer has its own bar; the bars stack and merge into a final
// composite color. Cycles through 3 example bars showing different
// blend outcomes.
// ============================================================
function CompositeModeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // 3 example bars with different velocity/tension/volume mixes
    const examples = [
      { name: 'TREND DAY', v: 80, te: 30, vol: 60, label: 'high velocity, mid tension' },
      { name: 'EXHAUSTION', v: 60, te: 90, vol: 70, label: 'high velocity AND high tension' },
      { name: 'FAKE BREAKOUT', v: 40, te: 20, vol: -30, label: 'velocity without volume' },
    ];

    const idx = Math.floor(tt * 3);
    const ex = examples[idx];
    const localT = (tt * 3) % 1;

    // Compute composite
    const composite = Math.max(-100, Math.min(100, ex.v * 0.50 + ex.te * 0.30 + Math.abs(ex.vol) * Math.sign(ex.vol) * 0.20));

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCENARIO', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.name, w / 2, 36);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.label, w / 2, 52);

    // Three layer bars
    const layers = [
      { name: 'VELOCITY', score: ex.v, weight: 0.50, weightLabel: '50%' },
      { name: 'TENSION', score: ex.te, weight: 0.30, weightLabel: '30%' },
      { name: 'VOLUME', score: ex.vol, weight: 0.20, weightLabel: '20%' },
    ];

    const barX = 30;
    const barW = w - 60;
    const barTop = 70;
    const barRowH = 36;
    const barH = 22;

    layers.forEach((ly, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const fillT = Math.min(1, (localT - revealStart) / 0.15);
      const y = barTop + i * barRowH;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${ly.name}  (${ly.weightLabel})`, barX, y - 4);

      // Score
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${ly.score >= 0 ? '+' : ''}${Math.round(ly.score * fillT)}`, barX + barW, y - 4);

      // Bar bg (centered around 0)
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(barX, y, barW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(barX, y, barW, barH);

      // Center line (zero)
      const midX = barX + barW / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, y);
      ctx.lineTo(midX, y + barH);
      ctx.stroke();

      // Bar fill
      const halfW = barW / 2;
      const fillProportion = (ly.score / 100) * fillT;
      const fillW = Math.abs(fillProportion) * halfW;
      const fillStart = ly.score >= 0 ? midX : midX - fillW;
      ctx.fillStyle = scoreToColor(ly.score);
      ctx.fillRect(fillStart, y, fillW, barH);
    });

    // Composite resolution
    if (localT > 0.55) {
      const fade = Math.min(1, (localT - 0.55) / 0.15);
      const compY = barTop + 3 * barRowH + 8;

      // Equation
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const eq = `${ex.v}\u00D70.5 + ${ex.te}\u00D70.3 + ${ex.vol}\u00D70.2  =  ${Math.round(composite)}`;
      ctx.fillText(eq, w / 2, compY);

      // Resulting candle
      const candleX = w / 2 - 14;
      const candleY = compY + 14;
      const candleW = 28;
      const candleH = 56;

      ctx.fillStyle = scoreToColor(composite);
      ctx.globalAlpha = fade;
      ctx.fillRect(candleX, candleY, candleW, candleH);
      ctx.strokeStyle = scoreToColor(composite);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX + candleW / 2, candleY - 6);
      ctx.lineTo(candleX + candleW / 2, candleY + candleH + 6);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = `rgba(255,255,255,${fade * 0.55})`;
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('composite candle', w / 2, candleY + candleH + 18);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 8 — StandardVsBoldAnim (S08 — Standard vs Bold)
// Same 12-candle sequence rendered in two side-by-side panels.
// Left: Standard (fade=12, slightly muted). Right: Bold (fade=0, vivid).
// Identical scores, different rendering. Teaches the saturation dimension.
// ============================================================
function StandardVsBoldAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    // Two panels side by side
    const panelW = (w - 30) / 2;
    const panelH = h - 50;
    const padX = 12;
    const padY = 30;

    // Same candle data for both panels
    const nC = 12;
    const candleData = [
      { o: 0.55, c: 0.50, score: 35 },
      { o: 0.50, c: 0.45, score: 55 },
      { o: 0.45, c: 0.39, score: 75 },
      { o: 0.39, c: 0.32, score: 90 },
      { o: 0.32, c: 0.30, score: 70 },
      { o: 0.30, c: 0.32, score: 25 },
      { o: 0.32, c: 0.36, score: -15 },
      { o: 0.36, c: 0.42, score: -45 },
      { o: 0.42, c: 0.48, score: -65 },
      { o: 0.48, c: 0.53, score: -55 },
      { o: 0.53, c: 0.55, score: -25 },
      { o: 0.55, c: 0.55, score: 0 },
    ];

    const renderPanel = (px: number, py: number, isBold: boolean) => {
      const pw = panelW;
      const ph = panelH;

      // Panel bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = isBold ? 'rgba(38, 166, 154, 0.3)' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Title
      ctx.fillStyle = isBold ? '#26A69A' : 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isBold ? 'BOLD  (fade = 0)' : 'STANDARD  (fade = 12)', px + pw / 2, py + 18);

      // Candles
      const cArea = { x: px + 12, y: py + 32, w: pw - 24, h: ph - 50 };
      const cwBar = cArea.w / nC;
      const reveal = Math.min(1, tt * 1.5);
      const visCount = Math.floor(nC * reveal);

      for (let i = 0; i < visCount; i++) {
        const cd = candleData[i];
        const baseColor = scoreToColor(cd.score);
        // Standard mode adds slight transparency (fade 12 in Pine ~= alpha 0.94)
        const renderColor = isBold ? baseColor : baseColor + 'E6';

        const cxBar = cArea.x + i * cwBar + cwBar / 2;
        const oY = cArea.y + cd.o * cArea.h;
        const ccY = cArea.y + cd.c * cArea.h;
        const top = Math.min(oY, ccY);
        const bot = Math.max(oY, ccY);

        ctx.fillStyle = renderColor;
        ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, Math.max(2, bot - top));

        ctx.strokeStyle = renderColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cxBar, top - 4);
        ctx.lineTo(cxBar, bot + 4);
        ctx.stroke();
      }
    };

    renderPanel(padX, padY, false);
    renderPanel(padX + panelW + 8, padY, true);

    // Overall title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STANDARD vs BOLD \u2014 SAME SCORES', w / 2, 18);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same data. Saturation differs. Pick for your monitor.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — SingleBarDecodeAnim (S09 — Reading a Single Bar)
// Four candles displayed in a row. As the animation progresses,
// each bar "opens" to reveal its score, mode, and decoded meaning.
// Teaches glance-reading by showing the decode for known bars.
// ============================================================
function SingleBarDecodeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 11.0;
    const tt = (t % T) / T;

    // 4 example bars with full decode info
    const bars = [
      { score: 88, mode: 'Trend', shade: 'TEAL_DEEP', read: 'Strong bull velocity' },
      { score: -35, mode: 'Tension', shade: 'MAG_LIGHT', read: 'Stretched bear, fading' },
      { score: 12, mode: 'Composite', shade: 'TEAL_PALE', read: 'Faintly bullish blend' },
      { score: -82, mode: 'Trend', shade: 'MAG_DEEP', read: 'Strong bear velocity' },
    ];

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('READING A SINGLE BAR', w / 2, 22);

    // Four columns
    const colW = (w - 40) / 4;
    const startX = 20;
    const candleY = 50;
    const candleH = 90;

    bars.forEach((bar, i) => {
      const revealStart = i * 0.18;
      if (tt < revealStart) return;
      const revealT = Math.min(1, (tt - revealStart) / 0.15);
      const x = startX + i * colW;
      const candleX = x + colW / 2 - 16;

      // Candle
      ctx.globalAlpha = revealT;
      ctx.fillStyle = scoreToColor(bar.score);
      ctx.fillRect(candleX, candleY, 32, candleH);
      ctx.strokeStyle = scoreToColor(bar.score);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(candleX + 16, candleY - 8);
      ctx.lineTo(candleX + 16, candleY + candleH + 8);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Below candle: decode block, appears at revealT > 0.6
      if (revealT > 0.6) {
        const decodeFade = Math.min(1, (revealT - 0.6) / 0.30);
        const decodeY = candleY + candleH + 18;
        const decodeX = x + 4;
        const decodeW = colW - 8;

        ctx.fillStyle = `rgba(255,255,255,${0.04 * decodeFade})`;
        ctx.fillRect(decodeX, decodeY, decodeW, h - decodeY - 18);
        ctx.strokeStyle = `rgba(255,255,255,${0.10 * decodeFade})`;
        ctx.strokeRect(decodeX, decodeY, decodeW, h - decodeY - 18);

        // Score
        ctx.fillStyle = `rgba(255,255,255,${decodeFade})`;
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${bar.score >= 0 ? '+' : ''}${bar.score}`, x + colW / 2, decodeY + 22);

        // Shade name
        ctx.fillStyle = scoreToColor(bar.score);
        ctx.globalAlpha = decodeFade;
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        ctx.fillText(bar.shade, x + colW / 2, decodeY + 38);
        ctx.globalAlpha = 1;

        // Mode
        ctx.fillStyle = `rgba(255,255,255,${0.5 * decodeFade})`;
        ctx.font = '8px system-ui, -apple-system, sans-serif';
        ctx.fillText(`mode: ${bar.mode}`, x + colW / 2, decodeY + 52);

        // Read (multi-word, may need wrap)
        ctx.fillStyle = `rgba(255,255,255,${0.8 * decodeFade})`;
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        const words = bar.read.split(' ');
        const halfIdx = Math.ceil(words.length / 2);
        const line1 = words.slice(0, halfIdx).join(' ');
        const line2 = words.slice(halfIdx).join(' ');
        ctx.fillText(line1, x + colW / 2, decodeY + 68);
        if (line2) ctx.fillText(line2, x + colW / 2, decodeY + 80);
      }
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score \u2192 shade \u2192 read. Practice until under one second.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — ClusterReadAnim (S10 — Reading a Cluster)
// 6-bar sequence cycling through 4 representative cluster patterns:
//   1. Sustainable trend: STD-STD-DEEP-STD-LIGHT-PALE
//   2. Climactic top: LIGHT-STD-DEEP-DEEP-mag_PALE-MAG_LIGHT
//   3. Range chop: PALE-mag_PALE-PALE-mag_PALE-PALE-mag_PALE
//   4. Reversal building: mag_DEEP-MAG_STD-MAG_LIGHT-MAG_PALE-PALE-LIGHT
// ============================================================
function ClusterReadAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const patterns = [
      { name: 'SUSTAINABLE TREND', read: 'Healthy bull trend, sustainable', scores: [40, 60, 85, 65, 35, 15] },
      { name: 'CLIMACTIC TOP', read: 'Bull peak then sharp reversal', scores: [50, 70, 90, 88, -15, -45] },
      { name: 'RANGE CHOP', read: 'No directional edge', scores: [10, -10, 15, -8, 12, -12] },
      { name: 'REVERSAL BUILDING', read: 'Bear exhaustion, bull starting', scores: [-85, -65, -40, -15, 10, 30] },
    ];

    const idx = Math.floor(tt * 4);
    const p = patterns[idx];
    const localT = (tt * 4) % 1;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLUSTER PATTERN', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(p.name, w / 2, 36);

    // 6 candles
    const nC = 6;
    const candleW = (w * 0.7) / nC;
    const candleH = h * 0.40;
    const startX = (w - candleW * nC) / 2;
    const candleY = 60;

    p.scores.forEach((score, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const fade = Math.min(1, (localT - revealStart) / 0.12);
      const x = startX + i * candleW;

      ctx.globalAlpha = fade;
      ctx.fillStyle = scoreToColor(score);
      ctx.fillRect(x + candleW * 0.18, candleY + 8, candleW * 0.64, candleH - 16);

      ctx.strokeStyle = scoreToColor(score);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, candleY);
      ctx.lineTo(x + candleW / 2, candleY + candleH);
      ctx.stroke();

      // Score label below
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(score >= 0 ? `+${score}` : `${score}`, x + candleW / 2, candleY + candleH + 14);

      ctx.globalAlpha = 1;
    });

    // Read box
    if (localT > 0.55) {
      const readFade = Math.min(1, (localT - 0.55) / 0.20);
      const ry = h - 60;
      const rh = 38;

      ctx.fillStyle = `rgba(255, 179, 0, ${0.10 * readFade})`;
      ctx.fillRect(0, ry, w, rh);
      ctx.strokeStyle = `rgba(255, 179, 0, ${0.4 * readFade})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, ry, w, rh);

      ctx.fillStyle = `rgba(255, 179, 0, ${readFade})`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`\u2192 ${p.read}`, w / 2, ry + 23);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Read the sequence, not the bar.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — RegimeShiftAnim (S11 — Regime Shifts on Candles)
// 14-bar sequence showing a regime transition. First half = TREND
// (consistent teal coloring at STD-DEEP). Middle = transition (LIGHT
// fading to PALE). Final half = RANGE (alternating PALE teal/magenta).
// A regime label flips at the transition point.
// ============================================================
function RegimeShiftAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REGIME SHIFT \u2014 TREND TO RANGE', w / 2, 22);

    // 14 bars: trend (8 bars TEAL strong) → transition (3 bars fading) → range (3 bars chop)
    const scoreSeq = [
      75, 85, 90, 80, 75, 65, 55, 45,  // trend (decaying slightly)
      30, 15, 5,                         // transition
      -10, 12, -8,                       // range chop
    ];

    const nC = scoreSeq.length;
    const cx = 30;
    const cy = 50;
    const cw = w - 60;
    const ch = h - 110;
    const cwBar = cw / nC;

    const reveal = Math.min(1, tt * 1.4);
    const visCount = Math.floor(nC * reveal);

    // Render bars with simple OHLC profile
    for (let i = 0; i < visCount; i++) {
      const score = scoreSeq[i];
      const color = scoreToColor(score);
      const cxBar = cx + i * cwBar + cwBar / 2;

      // Body height proportional to abs score
      const intensity = Math.abs(score) / 100;
      const bodyH = 20 + intensity * 60;
      const midY = cy + ch / 2 + (score < 0 ? bodyH / 4 : -bodyH / 4);
      const top = midY - bodyH / 2;
      const bot = midY + bodyH / 2;

      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, bot - top);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 5);
      ctx.lineTo(cxBar, bot + 5);
      ctx.stroke();
    }

    // Regime divider line
    if (visCount >= 8) {
      const divX = cx + 8 * cwBar;
      ctx.strokeStyle = 'rgba(255,179,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(divX, cy);
      ctx.lineTo(divX, cy + ch);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Two regime labels
    if (visCount >= 4) {
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TREND', cx + 4 * cwBar, cy - 8);
    }
    if (visCount >= 12) {
      ctx.fillStyle = '#FFB300';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RANGE', cx + 12 * cwBar, cy - 8);
    }

    // Footer caption
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The cluster color flip IS the regime shift.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — CandlesPlusSynthesisAnim (S12 — Candles + Conviction)
// A signal label fires on a chart with mode-painted candles. The
// signal's bar is TEAL_DEEP — Strong conviction confirmed by the
// candle color itself. Tooltip shows "+ Strong — 4/4 factors".
// Demonstrates how candles VISUALLY confirm the synthesis.
// ============================================================
function CandlesPlusSynthesisAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CANDLES CONFIRM THE SYNTHESIS', w / 2, 20);

    // Chart
    const cx = 30;
    const cy = 50;
    const cw = w * 0.55;
    const ch = h - 110;

    // 12 bars trending up; signal fires on bar 9 (TEAL_DEEP)
    const scores = [10, 25, 40, 55, 65, 75, 85, 90, 88, 80, 70, 60];
    const nC = scores.length;
    const cwBar = cw / nC;

    const reveal = Math.min(1, tt * 1.6);
    const visCount = Math.floor(nC * reveal);

    for (let i = 0; i < visCount; i++) {
      const score = scores[i];
      const color = scoreToColor(score);
      const cxBar = cx + i * cwBar + cwBar / 2;
      const intensity = Math.abs(score) / 100;
      const bodyH = 16 + intensity * 50;
      const yProg = i / (nC - 1);
      const midY = cy + ch * (0.85 - yProg * 0.5);
      const top = midY - bodyH / 2;
      const bot = midY + bodyH / 2;

      ctx.fillStyle = color;
      ctx.fillRect(cxBar - cwBar * 0.32, top, cwBar * 0.64, bot - top);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }

    // Signal label on bar 8 (the deep teal bar)
    if (visCount > 8) {
      const sigX = cx + 8 * cwBar + cwBar / 2;
      const yProg = 8 / (nC - 1);
      const sigY = cy + ch * (0.85 - yProg * 0.5);
      const labelW = 50;
      const labelH = 18;
      const lblY = sigY + 30;

      // Glow around bar
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      const grad = ctx.createRadialGradient(sigX, sigY, 0, sigX, sigY, 30 + 5 * pulse);
      grad.addColorStop(0, `rgba(38, 166, 154, ${0.4 * pulse})`);
      grad.addColorStop(1, 'rgba(38, 166, 154, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sigX - 40, sigY - 40, 80, 80);

      // Signal label
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(sigX - labelW / 2, lblY, labelW, labelH);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Long +', sigX, lblY + 12);
    }

    // Tooltip on the right side
    if (tt > 0.5) {
      const ttFade = Math.min(1, (tt - 0.5) / 0.15);
      const ttX = cx + cw + 20;
      const ttY = cy + 20;
      const ttW = w - ttX - 20;
      const ttH = ch - 50;

      ctx.fillStyle = `rgba(15,15,15,${0.95 * ttFade})`;
      ctx.fillRect(ttX, ttY, ttW, ttH);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 * ttFade})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(ttX, ttY, ttW, ttH);

      ctx.globalAlpha = ttFade;
      const lines = [
        { text: 'Pulse Cross', color: 'rgba(255,255,255,0.95)', bold: true },
        { text: 'Trend: STRONG \u2713', color: '#26A69A' },
        { text: 'ADX: 28 \u2713', color: '#26A69A' },
        { text: 'Volume: 1.6\u00D7 \u2713', color: '#26A69A' },
        { text: 'Health: 72% \u2713', color: '#26A69A' },
        { text: '', color: '' },
        { text: '\u2795 Strong \u2014 4/4', color: '#26A69A', bold: true },
      ];
      const lh = 16;
      lines.forEach((ln, i) => {
        if (!ln.text) return;
        ctx.fillStyle = ln.color;
        ctx.font = `${ln.bold ? 'bold ' : ''}10px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(ln.text, ttX + 10, ttY + 18 + i * lh);
      });
      ctx.globalAlpha = 1;

      // Arrow from tooltip to deep candle
      const arrowFromX = ttX;
      const arrowToX = cx + 8 * cwBar + cwBar / 2 + 18;
      const arrowY = ttY + ttH / 2;
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.6 * ttFade})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(arrowFromX, arrowY);
      ctx.lineTo(arrowToX, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TEAL_DEEP candle + Strong synthesis = aligned.', w / 2, h - 10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — PresetWheelAnim (S13 — Mode-to-Preset Mapping)
// 5 preset cards arranged in a row. Each card displays the preset name,
// its assigned candle mode, and a sample candle in that mode's color.
// Cycles which preset is "active", dimming the others.
// ============================================================
function PresetWheelAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const presets = [
      { name: 'TREND TRADER', mode: 'Trend', sampleScore: 75, philosophy: 'Catch the wave' },
      { name: 'SCALPER', mode: 'Composite Bold', sampleScore: 60, philosophy: 'Strike from levels' },
      { name: 'SWING TRADER', mode: 'Trend Bold', sampleScore: 85, philosophy: 'Wait for alignment' },
      { name: 'REVERSAL', mode: 'Tension', sampleScore: -65, philosophy: 'Catch the snap' },
      { name: 'SNIPER', mode: 'Default', sampleScore: 0, philosophy: 'Wait for squeeze' },
    ];

    const activeIdx = Math.floor(tt * 5) % 5;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESETS \u2192 CANDLE MODES', w / 2, 24);

    // 5 cards
    const cardW = (w - 40) / 5;
    const cardH = h - 90;
    const startX = 20;
    const startY = 50;

    presets.forEach((p, i) => {
      const cardX = startX + i * cardW + 2;
      const cw = cardW - 4;
      const isActive = i === activeIdx;

      // Card bg
      ctx.fillStyle = isActive ? `rgba(38, 166, 154, 0.15)` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(cardX, startY, cw, cardH);
      ctx.strokeStyle = isActive ? '#26A69A' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(cardX, startY, cw, cardH);

      // Preset name
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cardX + cw / 2, startY + 18);

      // Mode label
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.fillText(p.mode, cardX + cw / 2, startY + 32);

      // Sample candle (visual representation of mode)
      const candleX = cardX + cw / 2 - 10;
      const candleY = startY + 44;
      const candleW2 = 20;
      const candleH2 = 50;

      if (p.mode === 'Default') {
        // Default = simple red/green
        ctx.fillStyle = isActive ? '#26A69A' : 'rgba(38, 166, 154, 0.3)';
      } else {
        ctx.fillStyle = isActive ? scoreToColor(p.sampleScore) : scoreToColor(p.sampleScore) + '40';
      }
      ctx.fillRect(candleX, candleY, candleW2, candleH2);

      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(candleX + candleW2 / 2, candleY - 4);
      ctx.lineTo(candleX + candleW2 / 2, candleY + candleH2 + 4);
      ctx.stroke();

      // Philosophy
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const words = p.philosophy.split(' ');
      const half = Math.ceil(words.length / 2);
      const l1 = words.slice(0, half).join(' ');
      const l2 = words.slice(half).join(' ');
      ctx.fillText(l1, cardX + cw / 2, startY + cardH - 24);
      if (l2) ctx.fillText(l2, cardX + cw / 2, startY + cardH - 12);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each preset paints by what its archetype needs to see.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — ModeRecommenderAnim (S14 — Choosing a Mode)
// Decision tree style: starting question "What does your strategy
// need to see?" → branches: Direction (Trend), Stretch (Tension),
// Everything (Composite), Nothing (Default). The active branch
// highlights and points to a final answer card.
// ============================================================
function ModeRecommenderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const branches = [
      { question: 'Trend strength', answer: 'Trend or Trend Bold', color: '#26A69A', score: 75 },
      { question: 'Stretch / exhaustion', answer: 'Tension or Tension Bold', color: '#EF5350', score: -75 },
      { question: 'All three at once', answer: 'Composite or Composite Bold', color: '#FFB300', score: 50 },
      { question: 'None of the above', answer: 'Default', color: 'rgba(255,255,255,0.6)', score: 0 },
    ];

    const idx = Math.floor(tt * 4);
    const branch = branches[idx];
    const localT = (tt * 4) % 1;

    // Root question
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WHAT DOES YOUR STRATEGY', w / 2, 28);
    ctx.fillText('NEED TO SEE?', w / 2, 46);

    // Connector line down from root
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 56);
    ctx.lineTo(w / 2, 80);
    ctx.stroke();

    // 4 branch cards in 2x2 grid
    const cardW = (w - 60) / 2;
    const cardH = (h - 200) / 2;
    const gridStartX = 30;
    const gridStartY = 90;

    branches.forEach((b, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = gridStartX + col * (cardW + 10);
      const y = gridStartY + row * (cardH + 10);
      const isActive = i === idx;

      // Card bg
      ctx.fillStyle = isActive ? `${b.color}25` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = isActive ? b.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, cardW, cardH);

      // Question
      ctx.fillStyle = isActive ? '#FFB300' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.question.toUpperCase(), x + cardW / 2, y + 22);

      // Sample candle
      if (i !== 3) {
        const candleX = x + cardW / 2 - 10;
        const candleY = y + 36;
        ctx.fillStyle = isActive ? scoreToColor(b.score) : scoreToColor(b.score) + '40';
        ctx.fillRect(candleX, candleY, 20, 36);
        ctx.strokeStyle = ctx.fillStyle as string;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(candleX + 10, candleY - 4);
        ctx.lineTo(candleX + 10, candleY + 40);
        ctx.stroke();
      }

      // Answer
      if (isActive && localT > 0.4) {
        const fade = Math.min(1, (localT - 0.4) / 0.20);
        ctx.fillStyle = `rgba(255,255,255,${fade * 0.95})`;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`\u2192 ${b.answer}`, x + cardW / 2, y + cardH - 16);
      } else if (!isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.answer, x + cardW / 2, y + cardH - 16);
      }
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('One question. Four answers. Pick once, run it.', w / 2, h - 12);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
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
    scenario: 'NAS100 5m. Cipher Candles set to Tension Mode. The current bar prints TEAL_DEEP. Header reads BULL TREND \u2192 TREND CURVING. Tension row says SNAPPING.',
    prompt: 'What does the TEAL_DEEP candle mean here, and what is the operator&apos;s response?',
    options: [
      {
        id: 'a',
        text: 'Strong bull velocity \u2014 engage long at full size',
        correct: false,
        explain: 'TEAL_DEEP means &quot;strong bull&quot; only in Trend Mode. In Tension Mode, the same shade means maximally stretched bull \u2014 the rubber band is loaded for a snap-back. This is Mistake 1: reading shade without mode.',
      },
      {
        id: 'b',
        text: 'Maximally stretched bull \u2014 watch for the snap, do not engage long',
        correct: true,
        explain: 'Correct. In Tension Mode, TEAL_DEEP indicates the bar is at peak bullish stretch from the Flow line. Combined with Header reporting TREND CURVING and Tension SNAPPING, this is the loaded-rubber-band signature. The Conviction Operator waits for the snap rather than engaging long at the peak.',
      },
      {
        id: 'c',
        text: 'Switch to Trend Mode to confirm what the candle really means',
        correct: false,
        explain: 'Mode-switching mid-session to clarify a read is the &quot;hunting&quot; failure mode (Mistake 2). The active mode IS the read. Switching to Trend Mode would repaint the same bar by velocity instead of stretch \u2014 a different read, not a clarification.',
      },
      {
        id: 'd',
        text: 'The candle is corrupted \u2014 reload TradingView',
        correct: false,
        explain: 'The candle is rendering correctly. The operator&apos;s read of it is wrong. TEAL_DEEP in Tension Mode is the expected output when stretch is at 80%+ of 100-bar peak. No technical issue.',
      },
    ],
  },
  {
    id: 'round-2',
    scenario: 'XAUUSD 4H. Trend Mode active. The last 6 candles read: LIGHT, STD, DEEP, STD, LIGHT, PALE (all teal).',
    prompt: 'What cluster pattern is this and what is the operator&apos;s read?',
    options: [
      {
        id: 'a',
        text: 'Climactic top \u2014 expect a sharp magenta flip imminent',
        correct: false,
        explain: 'A climactic top would show several DEEP bars followed by an abrupt magenta flip within 1-2 bars \u2014 not a gradual fade through STD, LIGHT, PALE. This cluster is decaying gracefully, which is the opposite signature.',
      },
      {
        id: 'b',
        text: 'Sustainable trend that is now fading \u2014 trend is healthy but losing energy',
        correct: true,
        explain: 'Correct. The pattern LIGHT-STD-DEEP-STD-LIGHT-PALE is the sustainable trend signature with a gradual decay tail. The trend was healthy through the DEEP peak and is now fading energy. Long-side operators who entered during the STD-DEEP middle should be scaling out now; new long entries are no longer the high-edge play.',
      },
      {
        id: 'c',
        text: 'Range chop \u2014 stand aside until the next breakout',
        correct: false,
        explain: 'Range chop is alternating PALE bars in BOTH teal and magenta with no STD or LIGHT bars. This cluster has STD and LIGHT bars in the middle and stays in teal throughout \u2014 not range chop. The pattern is monotonic teal decaying.',
      },
      {
        id: 'd',
        text: 'Reversal building \u2014 long-side opportunity emerging',
        correct: false,
        explain: 'Reversal building goes from MAG_DEEP through PALE and into teal LIGHT. This cluster is the opposite \u2014 it&apos;s teal fading toward PALE, suggesting trend exhaustion rather than reversal initiation.',
      },
    ],
  },
  {
    id: 'round-3',
    scenario: 'Bitcoin 15m. Composite Bold mode active. A Pulse Cross Long signal fires with score 4/4 (Strong, +). The signal bar prints TEAL_DEEP. Tooltip context tag: Sweep + FVG \u2605.',
    prompt: 'What is the alignment read and the appropriate sizing?',
    options: [
      {
        id: 'a',
        text: 'Apex visual \u2014 size up to 1.5\u00D7 baseline within cap',
        correct: true,
        explain: 'Correct. Strong synthesis (4/4 + Sweep+FVG apex tag) AND TEAL_DEEP candle = full alignment. The synthesis says engage at apex; the candle visually confirms with peak Composite score. Conviction-tier sizing applies: up to 1.5\u00D7 baseline within max risk cap. This is the highest-confidence setup the framework produces.',
      },
      {
        id: 'b',
        text: 'Yellow flag \u2014 candle is too strong, may be exhaustion',
        correct: false,
        explain: 'In Composite Mode, TEAL_DEEP requires multiple factors aligning (velocity, tension, volume) \u2014 not just exhaustion. The 4/4 Strong score plus apex tag rules out the &quot;single-dimension blowoff&quot; reading. Yellow flag is the Strong+PALE pattern, not Strong+DEEP.',
      },
      {
        id: 'c',
        text: 'Skip \u2014 4/4 with apex is statistically too rare to be real',
        correct: false,
        explain: 'Apex setups are designed to be rare, not skipped. The Sweep+FVG context tag is the priority-1 cascade entry precisely because it represents the highest-confluence setup CIPHER can identify. Skipping rare apex signals forfeits the asymmetric edge they offer.',
      },
      {
        id: 'd',
        text: 'Standard size \u2014 the Composite ambiguity prevents apex sizing',
        correct: false,
        explain: 'Composite Mode ambiguity affects single-bar reads \u2014 not the alignment check. With a 4/4 Strong score and an apex context tag, the synthesis layer has already resolved the Composite ambiguity. The candle confirms; sizing follows the synthesis-tier protocol.',
      },
    ],
  },
  {
    id: 'round-4',
    scenario: 'You are running the None preset with Trend Mode active. After 8 sessions of practice, you have entered a long trade based on a 3/4 Strong signal. Two bars after entry, the candles flip from TEAL_STD to MAG_LIGHT. The trade is 0.3R into drawdown.',
    prompt: 'The candles are now showing magenta. What is the right move?',
    options: [
      {
        id: 'a',
        text: 'Switch to Tension Mode \u2014 maybe it shows the trade more favorably',
        correct: false,
        explain: 'This is Mistake 6 (denial via mode-switching) and Illegitimate Switch 3 (denial). The candles are giving you honest data. Switching modes to hide the unfavorable read is the operator denying the data rather than honoring the read.',
      },
      {
        id: 'b',
        text: 'Honor the candle read \u2014 the magenta flip suggests the velocity has reversed, manage the trade per the L11.22 plan (BE move, Risk Map SL)',
        correct: true,
        explain: 'Correct. The candle flip is information \u2014 velocity has reversed. The L11.22 trade plan still applies: SL at the Risk Map level, BE move at TP1 if reached, no widening. The flip does not necessarily mean exit-immediately, but it does mean the trade has lost its candle confirmation. Manage tightly per protocol; do not improvise.',
      },
      {
        id: 'c',
        text: 'Switch to Default mode so you can stop seeing the magenta',
        correct: false,
        explain: 'Pure denial. Switching to Default removes the visual data without changing what is happening on the chart. The magenta flip is broadcasting information; hiding it does not change the underlying read. This is Mistake 6 in its purest form.',
      },
      {
        id: 'd',
        text: 'Add to the position \u2014 contrarian conviction is rewarded',
        correct: false,
        explain: 'Adding to a losing trade is a protocol violation regardless of candle context. The L11.22 mistake list explicitly forbids it. Contrarian thinking against the synthesis layer is reckless; against both the synthesis AND the candles is operator suicide.',
      },
    ],
  },
  {
    id: 'round-5',
    scenario: 'You picked Trend Mode 4 sessions ago. Three of the four sessions felt confusing \u2014 the colors blurred, you misjudged shade boundaries, you had two losing trades that the candle read seemed to predict but you missed. You are tempted to switch to Composite Bold for clarity.',
    prompt: 'What does the Candles Operator framework say to do?',
    options: [
      {
        id: 'a',
        text: 'Switch immediately \u2014 4 sessions is enough to know the mode does not work',
        correct: false,
        explain: '4 sessions is calibration phase, not evaluation phase. The framework explicitly states sessions 1-5 are calibration where everything feels confusing. Switching here resets the calibration and starts the same struggle on a different mode \u2014 the Mistake 6 pattern.',
      },
      {
        id: 'b',
        text: 'Stay with Trend Mode for 16 more sessions to complete the 20-session commitment',
        correct: true,
        explain: 'Correct. The 20-session commitment exists precisely because the first 5-10 sessions feel confusing for every mode. Sessions 1-5 are calibration, 5-15 are pattern recognition, 15-20 are honest evaluation. You are 4 sessions in \u2014 still in calibration. The losing trades teach the calibration; switching mid-learning resets the entire process. Stick with it.',
      },
      {
        id: 'c',
        text: 'Switch to Default until you are more experienced, then come back',
        correct: false,
        explain: 'Switching to Default during calibration abandons the candle-reading skill development entirely. The point of calibration is building shade-recognition; running Default during the learning phase means you will not develop the skill at all. Default is for backtesting, monitor issues, or specific workflow needs \u2014 not for &quot;wait until I am ready.&quot;',
      },
      {
        id: 'd',
        text: 'Run all three modes simultaneously across multiple charts for comparison',
        correct: false,
        explain: 'Running multiple modes simultaneously prevents you from internalizing any single mode\u2019s vocabulary. Each mode has its own visual pattern library; mixing them mid-learning means none of them get learned. The 20-session commitment is single-mode for this exact reason.',
      },
    ],
  },
];

const quizQuestions: { id: string; question: string; options: { id: string; text: string; correct: boolean }[]; explain: string }[] = [
  {
    id: 'q1',
    question: 'How does the 7-mode Cipher Candles dropdown actually decompose architecturally?',
    options: [
      { id: 'a', text: '7 independent modes, each with its own scoring algorithm', correct: false },
      { id: 'b', text: '3 metrics (Velocity / Tension / Composite) \u00D7 2 intensities (Standard / Bold) + Default opt-out', correct: true },
      { id: 'c', text: '4 trend modes + 3 reversal modes', correct: false },
      { id: 'd', text: '6 active modes that all use the same Composite formula at different weights', correct: false },
    ],
    explain: 'The 7 dropdown entries collapse to 3 metric choices times 2 intensity choices, plus the Default opt-out. Trend / Trend Bold = Velocity + Standard/Bold. Tension / Tension Bold = Tension + Standard/Bold. Composite / Composite Bold = blend + Standard/Bold. Default = no Cipher coloring. This unifying view simplifies the mental model from seven options to three real decisions.',
  },
  {
    id: 'q2',
    question: 'In the 8-level gradient, what is the threshold for TEAL_DEEP shade?',
    options: [
      { id: 'a', text: 'Score &ge; 50', correct: false },
      { id: 'b', text: 'Score &ge; 70', correct: false },
      { id: 'c', text: 'Score &ge; 80', correct: true },
      { id: 'd', text: 'Score &ge; 100', correct: false },
    ],
    explain: 'TEAL_DEEP fires at score &ge; 80, meaning the metric is at 80%+ of its 100-bar peak in the bullish direction. The four positive thresholds are 0, 20, 50, 80, mirrored on the magenta side. Score = 100 is the absolute peak (rare; everything &ge; 80 prints DEEP).',
  },
  {
    id: 'q3',
    question: 'What is the Composite mode formula for combining the three scores?',
    options: [
      { id: 'a', text: '40% Velocity + 40% Tension + 20% Volume', correct: false },
      { id: 'b', text: '50% Velocity + 30% Tension + 20% Volume direction', correct: true },
      { id: 'c', text: '33% each (equal weighting)', correct: false },
      { id: 'd', text: '60% Velocity + 25% Tension + 15% Volume', correct: false },
    ],
    explain: 'Composite uses 50/30/20 weighting. Velocity dominates (50%) because directional momentum is the primary read. Tension qualifies (30%) \u2014 high velocity with high tension is exhaustion, with low tension is sustainable. Volume amplifies (20%) whichever side the candle closes on. The weights cannot push a bear to a bull.',
  },
  {
    id: 'q4',
    question: 'What is the difference between Standard and Bold variants of the same mode?',
    options: [
      { id: 'a', text: 'Bold uses different scoring formulas with higher sensitivity', correct: false },
      { id: 'b', text: 'Standard uses 4 shades while Bold uses 8 shades', correct: false },
      { id: 'c', text: 'Identical scores and gradient mapping; Bold renders with full saturation, Standard renders slightly muted', correct: true },
      { id: 'd', text: 'Bold updates every bar, Standard updates every 5 bars for smoothing', correct: false },
    ],
    explain: 'Same metric, same scores, same 8-level gradient. Bold uses fade=0 (fully saturated) while Standard uses fade=12 (slightly muted, ~95% alpha). Bold suits dark monitors and short sessions; Standard suits bright monitors and long sessions. The choice is rendering, not analysis.',
  },
  {
    id: 'q5',
    question: 'Which preset auto-selects Composite Bold as its candle mode?',
    options: [
      { id: 'a', text: 'Trend Trader', correct: false },
      { id: 'b', text: 'Swing Trader', correct: false },
      { id: 'c', text: 'Scalper', correct: true },
      { id: 'd', text: 'Reversal', correct: false },
    ],
    explain: 'Scalper auto-selects Composite Bold because scalping setups need maximum information per glance (Composite encodes velocity, tension, and volume) AND vivid contrast for fast decisions (Bold). Trend Trader runs Trend (Standard). Swing Trader runs Trend Bold. Reversal runs Tension (Standard). Sniper runs Default.',
  },
  {
    id: 'q6',
    question: 'A signal fires with 4/4 conviction score on a TEAL_PALE candle (Trend Mode active). What is the alignment read?',
    options: [
      { id: 'a', text: 'Apex visual \u2014 size up to 1.5\u00D7 baseline', correct: false },
      { id: 'b', text: 'Yellow flag \u2014 synthesis says engage but candle shows weak velocity', correct: true },
      { id: 'c', text: 'Clean skip \u2014 PALE candle invalidates the signal', correct: false },
      { id: 'd', text: 'Hidden strength \u2014 the candle understates the actual setup', correct: false },
    ],
    explain: 'Strong signal + PALE candle = yellow flag. The conviction synthesis (4/4) says engage but the candle shows weak underlying velocity. The trade still has the four-factor backing, but the candle warns that follow-through may be limited. Trade smaller and scale faster than baseline; do not skip outright \u2014 the synthesis is still Strong.',
  },
  {
    id: 'q7',
    question: 'You are 6 sessions into your 20-session commitment with Trend Mode and feel like switching to Composite for clarity. What does the framework recommend?',
    options: [
      { id: 'a', text: 'Switch immediately \u2014 if it does not feel right after 6 sessions, it never will', correct: false },
      { id: 'b', text: 'Wait until session 20, then evaluate honestly', correct: true },
      { id: 'c', text: 'Switch but plan to return to Trend Mode if Composite does not work either', correct: false },
      { id: 'd', text: 'Run both modes on different charts to compare', correct: false },
    ],
    explain: 'Sessions 1-5 are calibration, 5-15 are pattern recognition, 15-20 are honest evaluation. At session 6, you are still building shade recognition and pattern library. The confusion is expected. Switching mid-learning resets the calibration and starts the same struggle on a different mode. Honor the 20-session commitment, evaluate at the end.',
  },
  {
    id: 'q8',
    question: 'Which of the following is a LEGITIMATE reason to switch candle modes mid-session?',
    options: [
      { id: 'a', text: 'The current mode is not showing the setup you want to see', correct: false },
      { id: 'b', text: 'You are in a losing trade and want to see if another mode tells a different story', correct: false },
      { id: 'c', text: 'You are shifting from trend trades to reversal trades within the same session', correct: true },
      { id: 'd', text: 'The candles look noisy and you want to find a calmer-looking mode', correct: false },
    ],
    explain: 'Strategy context shift is one of three legitimate switches (alongside intensity adjustment for environment changes and switching to Default for chart study). Switching to hunt for a setup, to deny an unfavorable read, or to confirm an existing trade are all illegitimate \u2014 the discipline failure modes covered in S15.',
  },
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherCandlesPage() {
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
          <span className="text-xs tracking-widest uppercase text-amber-400/60">Level 11 &middot; Lesson 23</span>
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
            Visual Layer Closing &middot; Candles Operator
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
          Cipher Candles<br />
          <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
            Three metrics. Two intensities. One read.
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-base text-gray-400 leading-relaxed mb-8">
          The candles themselves carry the read. Velocity, Tension, or Composite, painted on every bar in eight shades. The operator who masters Cipher Candles stops needing the panel for momentary reads &mdash; one glance at a bar tells you what CIPHER thinks of it.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] p-1 mb-8">
          <GradientHeroAnim />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-gray-500">
          <span>17 sections</span>
          <span className="text-white/20">&middot;</span>
          <span>13 animations</span>
          <span className="text-white/20">&middot;</span>
          <span>~26 min read</span>
        </motion.div>
      </motion.section>

      {/* ============================================================ */}
      {/* S00 — First, Why This Matters */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">First, Why This Matters</p>
        <h2 className="text-2xl font-extrabold mb-4">The panel reads the market. The candles let you skip the panel.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Every prior Visual Layer lesson taught you to read CIPHER through the panel &mdash; rows of verdicts you scan top to bottom. That works. It is also a constant cognitive load. Your eyes leave the price action, find the panel, parse a row, return to price. Multiply by 6 modules and 200 bars in a session and the friction adds up.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Cipher Candles compress the panel onto the candles themselves. Pick one of three Cipher metrics &mdash; Velocity, Tension, or Composite &mdash; and CIPHER paints every bar with that metric&apos;s eight-shade gradient. Strong bull velocity prints deep teal. Pale teal means decelerating. Faint magenta means early reversal. The bars you are already looking at carry the read. The panel becomes a confirmation tool rather than the primary scanner.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PANEL TO CANDLE COMPRESSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The panel has 12+ rows. Cipher Candles fold one row&apos;s worth of information into the bar itself. You do not get all 12 rows on the candle &mdash; you get the one most relevant to your style, glanceable without ever leaving the price action. Operators who internalize a candle mode read 20-50 bars in the time it takes to scan one panel cycle.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THREE SCORES, NOT TWELVE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The candle has limited bandwidth &mdash; one color per bar. Encoding too many dimensions at once creates a muddled read. CIPHER picks three orthogonal metrics that capture most of what the panel says: directional momentum (Velocity), stretch (Tension), and a weighted blend (Composite). Three is the most you can paint without losing meaning.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS CLOSES THE VISUAL LAYER ARC</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lessons 11.16 through 11.21 added six sensory modules to the panel. Lesson 11.22 taught you to read the panel as one synthesis. This lesson is the last step of the arc &mdash; the rendering layer that lifts the read off the panel and onto the bars themselves. After this, you stop being panel-dependent. The panel is still there. You just need it less.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT CHANGES WHEN YOU LEARN THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before this lesson, your eyes scanned panel-then-price-then-panel in a continuous loop. After this lesson, your eyes stay on price. Color cluster patterns in the candles tell you regime, conviction, and stretch at a glance. The synthesis layer from L11.22 still applies &mdash; it just reads as paint instead of text.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY DEFAULT EXISTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER also offers Default mode &mdash; raw exchange candles, no Cipher coloring. This is intentional. Some operators backtest visually and need the chart&apos;s native colors as ground truth. Some monitors render Cipher shades poorly. Some workflows mix CIPHER with other indicators that already color the candles. Default is the opt-out that respects all three.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">A WARNING UPFRONT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cipher Candles are a rendering layer, not new information. The score being painted is computed by the existing modules &mdash; Pulse, Flow, Volume. If you cannot read the panel, you cannot truly read the candles either. This lesson assumes Visual Layer fluency. The candles let you read faster; they do not let you skip understanding.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The candles do the work the panel was doing. You stay on price. The panel becomes confirmation. This is the rendering layer that closes the Visual Layer arc.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S01 — The Groundbreaking Concept */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Groundbreaking Concept</p>
        <h2 className="text-2xl font-extrabold mb-4">Three metrics. Two intensities. One read on every bar.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The Cipher Candles dropdown looks like seven options. The Pine implementation tells a cleaner story: three metrics (Velocity, Tension, Composite), times two intensities (Standard, Bold), plus one opt-out (Default). That is the entire architecture. Once you see it this way, the dropdown stops being a menu and becomes a dial &mdash; pick a metric, pick a saturation, paint the bars.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The unifying mental model matters because the alternative is memorizing seven separate modes and their use cases. The 3&times;2+1 framing collapses the cognitive load. You learn three metrics, choose your saturation, and you are done. Every mode in the dropdown is some combination of those three decisions.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ThreeScoresAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">METRIC 1 &middot; VELOCITY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Cipher Velocity score &mdash; directional momentum normalized to the chart&apos;s 100-bar peak. High velocity = strong directional move. Low velocity = the move is decelerating or absent. Trend mode paints by Velocity. This is the most common choice for trend traders who want trend strength visible on every bar.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">METRIC 2 &middot; TENSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Cipher Tension score &mdash; stretch from the Flow line, normalized to 100-bar peak stretch. High tension = price extended, snap-back imminent. Low tension = price near Flow, no immediate reversion pressure. Tension mode paints by stretch. Reversal traders use this because tension predicts the snap before momentum confirms it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">METRIC 3 &middot; COMPOSITE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A weighted blend: 50% Velocity + 30% Tension + 20% Volume direction. The most information-dense choice &mdash; every candle encodes three dimensions in its single color. Scalpers run Composite because their setups need all three reads simultaneously and they cannot afford the eye-shift to a panel.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">INTENSITY &middot; STANDARD vs BOLD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Once a metric is chosen, the operator picks an intensity. Standard mutes the saturation slightly &mdash; better for reading on bright monitors, less visually fatiguing over long sessions. Bold maxes the saturation &mdash; better for dark charts and low-light setups, lets weak signals stand out. Same metric, same scores, different rendering vivacity.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT &middot; THE OPT-OUT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Default mode disables Cipher Candle coloring entirely. The chart shows the broker&apos;s native red/green candles. No metric, no intensity. This is the opt-out for backtesters who need raw price as visual ground truth, for workflows that mix CIPHER with other indicators that paint candles, and for monitors where Cipher shades render poorly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE FULL OPTION TABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend / Trend Bold / Tension / Tension Bold / Composite / Composite Bold / Default. Seven entries in the dropdown, three real decisions: which metric, which intensity, or opt out. Every entry is one of those three decisions made.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Pick a metric for what your strategy needs to see. Pick an intensity for your monitor and your eyes. The dropdown is a dial, not a menu.
          </p>
        </div>
      </section>


      {/* ============================================================ */}
      {/* S02 — The 3-Score Architecture */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 3-Score Architecture</p>
        <h2 className="text-2xl font-extrabold mb-4">Velocity. Tension. Composite. Every score normalized to 100-bar peak.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Each Cipher Candle mode is built from one of three scores. Each score is computed live, normalized, and mapped to the 8-shade gradient. The math is small and the operator-facing read is large. Once you understand what each score measures, you understand which mode will tell you what.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The normalization step matters. Each score divides the current bar&apos;s metric by the 100-bar maximum of that metric, then scales to the 0-100 range with sign preserved. This makes every chart self-calibrating &mdash; what counts as deep teal on EURUSD 1H is not the same absolute Velocity value as deep teal on BTCUSD 5m, but the visual meaning is identical. Strong = deep, weak = pale, regardless of asset.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SCORE 1 &middot; VELOCITY &mdash; c_velocity / vel_max &times; 100</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Cipher Velocity reading divided by its 100-bar absolute peak, scaled to &plusmn;100. Velocity itself is the directional rate of change of the Pulse line &mdash; a measure of how fast price is moving away from its dynamic anchor. Fast moves print high scores (deep colors). Stalling moves print low scores (pale colors).
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCORE 2 &middot; TENSION &mdash; c_tension / tens_max &times; 100</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Cipher Tension reading divided by its 100-bar absolute peak. Tension measures how stretched price is from the Flow line in ATR units. A bar with tension 1.8 ATR (vs a 100-bar peak of 2.4) prints score 75 &mdash; deep coloring. The signed direction (above or below Flow) determines teal vs magenta.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCORE 3 &middot; COMPOSITE &mdash; 0.50V + 0.30T + 0.20Vol</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Velocity gets 50% weight (it dominates the read). Tension gets 30% (it qualifies the read &mdash; high velocity into low tension is sustainable; high velocity into high tension is exhaustion). Volume direction gets 20% &mdash; volume amplifies whichever side the candle closes on. Three dimensions, one number, one shade per bar.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THE 100-BAR LOOKBACK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Long enough to capture the chart&apos;s recent extremes. Short enough that the normalization adapts when conditions shift. A 100-bar lookback on a 5-minute chart is roughly 8 hours; on a daily chart, four months. Both are sensible windows for &quot;recent peak.&quot; Shorter would over-react to outliers; longer would render every bar pale because true extremes would dominate the denominator.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THESE THREE METRICS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Velocity, Tension, and Volume direction are nearly orthogonal. Velocity tells you the speed and direction of the trend. Tension tells you how stretched it is. Volume tells you whether real money is committing. Three independent dimensions, packaged as one color. Most other indicator suites pick one (RSI: momentum) and call it done.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SELF-CALIBRATING ACROSS ASSETS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The 100-bar normalization makes every chart speak the same color language. Deep teal on XAUUSD means &quot;strong by gold&apos;s recent standards.&quot; Deep teal on EURUSD means &quot;strong by euro&apos;s recent standards.&quot; The operator does not need to remember per-asset thresholds. The chart calibrates itself.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE SCORES DO NOT MEASURE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cipher Candle scores do not include Structure proximity, FVG location, Sweep recency, or HTF alignment. Those are panel reads. The candle scores are pure dynamics &mdash; how fast, how stretched, how participatory. Operators who try to read structural context off candle color are misusing the tool.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Three orthogonal scores, each self-calibrating. Pick the score whose dimension matters most to your style. The candles will paint that score on every bar.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S03 — The 8-Level Gradient */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 8-Level Gradient</p>
        <h2 className="text-2xl font-extrabold mb-4">Four teal positive shades. Four magenta negative shades.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Each score in [-100, +100] maps to one of eight discrete shades. Four positive teals from PALE through DEEP, four negative magentas mirrored. The thresholds are: 0, &plusmn;20, &plusmn;50, &plusmn;80. Crossing a threshold flips the candle to the next shade tier. There is no continuous interpolation &mdash; the discreteness makes the read robust to small fluctuations.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Eight shades is the design choice that makes Cipher Candles work. Two shades (just teal and magenta) would carry no more information than the broker&apos;s native candles. Sixteen shades would create a continuous gradient impossible to read at a glance. Eight is the count where the operator can name the shade in under a second without conscious effort.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <EightLevelGradientAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TEAL_DEEP &middot; SCORE &ge; 80</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Strong bull conviction. The metric (Velocity, Tension, or Composite, depending on mode) is reading at 80% or more of its 100-bar peak in the bullish direction. These bars are rare in normal markets &mdash; expect to see them in clear trends, after squeeze releases, or during institutional flow. When you see TEAL_DEEP, the metric is screaming.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TEAL_STD &middot; SCORE 50 TO 80</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Steady bull. The metric is well above normal but not at peak. Most healthy bullish bars in a trend land here. TEAL_STD clusters across multiple bars indicate a sustainable move &mdash; the metric is firing without exhausting.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TEAL_LIGHT &middot; SCORE 20 TO 50</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Developing or fading bull. Either the metric is just starting to rise (early trend) or it is decaying from a stronger reading (post-peak). Context determines which. A LIGHT after a cluster of PALE means starting; a LIGHT after a cluster of DEEP means fading.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TEAL_PALE &middot; SCORE 0 TO 20</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Faintly bullish. The metric is positive but barely. These bars are common during chop and at the edges of trend reversals. Operators learn to recognize PALE clusters as &quot;nothing happening here&quot; signals &mdash; not bearish enough to short, not bullish enough to engage.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">MAGENTA SIDE &middot; MIRRORED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              MAG_PALE (-20 to 0) faintly bearish. MAG_LIGHT (-50 to -20) developing or fading bear. MAG_STD (-80 to -50) steady bear. MAG_DEEP (&lt;-80) strong bear conviction. The four magenta shades mirror the four teal shades exactly &mdash; same threshold cuts, same operator-read meanings, opposite direction.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DISCRETE BY DESIGN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A continuous gradient would mean every score from 0 to 100 produces a slightly different shade. The eye cannot read that. Discrete bands let the operator pattern-match in chunks &mdash; &quot;a cluster of LIGHT&quot; or &quot;a wall of DEEP&quot; &mdash; and assign meaning to clusters rather than individual bars. Reads scale linearly with experience.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE THRESHOLD TRANSITIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a score crosses a threshold (e.g. 78 to 82), the candle jumps from TEAL_STD to TEAL_DEEP visibly. The threshold crossing is the visual signal &mdash; the operator notices the jump rather than tracking continuous score values. Important threshold crossings: 0 (teal/magenta flip), &plusmn;50 (steady tier), &plusmn;80 (deep tier). Watch the &plusmn;50 line specifically; that is where setups get real.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Eight shades, four thresholds. Saturation = conviction strength. Direction = side. Read clusters, not individual bars.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S04 — Default — the opt-out */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Default &mdash; The Opt-Out</p>
        <h2 className="text-2xl font-extrabold mb-4">When raw exchange candles are the right answer.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Default mode disables Cipher Candle coloring entirely. The chart shows the broker&apos;s native red/green candles &mdash; the same coloring you would see on any non-CIPHER chart. No score is painted, no gradient is rendered. Default exists because for some workflows, raw price is the right ground truth.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Three legitimate reasons to run Default. First, backtesting visually &mdash; you want to see what the chart would look like to an operator without CIPHER, so you can evaluate whether your strategy logic holds without the coloring crutch. Second, monitor calibration &mdash; some displays render the Cipher shade gradient poorly, and PALE-vs-LIGHT becomes indistinguishable. Third, indicator stacking &mdash; if you run other CIPHER-compatible tools that also color the candles, Default lets the other tool win.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">REASON 1 &middot; BACKTESTING WITH PURITY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When you scroll a chart looking for setups in hindsight, Cipher coloring biases the search &mdash; your eye is drawn to TEAL_DEEP clusters whether or not they correspond to your strategy criteria. Default removes the bias. You evaluate setups by structure and math alone, then confirm against the panel. The coloring goes back on for live trading.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REASON 2 &middot; MONITOR LIMITATIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Some monitors compress the green-blue spectrum poorly. TEAL_PALE and TEAL_LIGHT can look identical on lower-end displays, especially with f.lux or night-mode filters active. If you cannot reliably distinguish all four shades on each side, you cannot use the candles for their intended purpose. Default is the safer setting until the monitor or the lighting is fixed.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REASON 3 &middot; INDICATOR STACKING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              If you also run another candle-coloring indicator &mdash; a Heikin Ashi overlay, a custom volume-weighted painter, a regime detector that recolors bars &mdash; only one can win. CIPHER&apos;s Default tells it to step aside and let the other tool render. The Cipher panel still works; the candles just are not Cipher&apos;s job in that workflow.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU LOSE WITH DEFAULT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              All glanceability. Without Cipher coloring, your eyes go back to the panel-then-price loop. Each setup evaluation takes 2-3x longer because you cannot read momentum off the bar. For high-frequency styles (scalping, day trading) Default adds real friction. For lower-frequency styles (swing, position) the friction is negligible because you evaluate fewer setups per day.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT IS NOT INFERIOR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The dropdown puts Default at position one for a reason. It is a legitimate first choice, not a downgrade. Operators who do not yet trust their candle reads should run Default until the panel reads are second nature, then graduate to Trend or Composite. Skipping ahead to Cipher coloring before the panel is internalized is how operators end up reading the candles wrong.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SWITCHING BACK FROM DEFAULT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When you switch from Default to Trend or Composite mid-chart, expect a 20-30 minute calibration period for your eyes. The coloring will feel noisy at first because you have not yet built the pattern recognition for clusters. Stick with one Cipher mode for at least one full session before deciding whether it works for your style.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Default is the legitimate opt-out. Use it for backtesting, on bad monitors, or when stacking indicators. Switching back from Default takes a session to recalibrate.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S05 — Trend Mode */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Trend Mode</p>
        <h2 className="text-2xl font-extrabold mb-4">Velocity painted on every bar.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Trend Mode paints each candle by the Cipher Velocity score. The signal is direct: how fast is price moving in its current direction, normalized to the 100-bar peak velocity? Strong velocity in either direction prints deep colors. Stalling moves print pale. The mode reads the trend itself rather than its context.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          This is the highest-frequency information mode &mdash; on a 5-minute chart, the velocity score updates every bar with a fresh read of recent acceleration. Trend traders pick this mode because their setups depend on identifying clean velocity rather than complex confluence. A wall of TEAL_STD or TEAL_DEEP candles tells the trend trader the move is sustainable; a transition from STD to LIGHT to PALE tells them it is fading.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <TrendModeAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">DEEP COLOR = VELOCITY AT PEAK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a Trend Mode candle prints TEAL_DEEP or MAG_DEEP, the bar&apos;s velocity is at 80%+ of the 100-bar peak velocity for that direction. These are the bars where the trend is firing on its strongest interval. A cluster of deep bars = a high-conviction trending sequence; isolated deep bars are usually false breakouts that fail within 1-2 bars.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MID-TIER STD &middot; THE WORKHORSE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TEAL_STD or MAG_STD (50-80 score) is where most healthy trend bars live. The trend is well-established but not at peak intensity. Operators who size on Strong-tier conviction signals find that those signals frequently fire during STD-cluster sequences &mdash; the panel and the candles agree on a sustainable move.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PALE TIER &middot; DECAY OR EARLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              PALE candles after a DEEP cluster signal velocity decay &mdash; the trend is losing energy. PALE candles after a flat patch signal early trend formation &mdash; velocity is just starting to build. The two contexts are visually identical but operationally opposite. Read the cluster history, not just the latest bar.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FLIP TO MAGENTA &middot; THE EARLY WARNING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Mode flips to magenta when velocity goes negative &mdash; price is decelerating fast or starting to reverse. The flip from TEAL_PALE to MAG_PALE is often the earliest visible sign of a regime change, several bars before the panel&apos;s Header row says TREND CURVING. Trend Mode is forward-looking through velocity decay.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHO RUNS TREND MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend traders running the Trend Trader preset (which auto-selects Trend Mode). Swing traders running the Swing Trader preset (auto-selects Trend Bold for higher contrast over multi-day holds). Anyone whose strategy depends primarily on trend strength rather than reversal context. If your edge comes from following moves, Trend is your default.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHO SHOULD NOT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reversal traders, who need the stretch reading more than the velocity reading. Scalpers, who need volume context too. Anyone whose strategy fades trends at exhaustion &mdash; Trend Mode will paint the exhaustion bars in deep colors and visually encourage you to engage with the trend you are trying to fade.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TIMEFRAME BEHAVIOR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              On lower timeframes (1m, 5m, 15m), Trend Mode flickers between PALE and LIGHT bars frequently as velocity oscillates. On higher timeframes (1H+), the colors hold steady across multiple bars because velocity changes more slowly. Lower-TF operators learn to ignore single-bar flickers and read 3-bar clusters; higher-TF operators read each bar.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Deep = trend at peak. STD = sustainable. PALE = decaying or early. Magenta flip = early warning. Read clusters, not bars.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S06 — Tension Mode */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Tension Mode</p>
        <h2 className="text-2xl font-extrabold mb-4">Stretch painted on every bar.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Tension Mode paints each candle by Cipher Tension &mdash; how stretched price is from the Flow line in ATR units, normalized to 100-bar peak stretch. Deep colors mean price is far from Flow and the rubber band is taut. Pale colors mean price is near Flow and there is no stretch to snap. The mode reads exhaustion and reversal probability rather than trend strength.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Unlike Trend Mode, Tension Mode is non-monotonic with the trend. A strong bull trend can have low tension (price grinds up alongside Flow) or high tension (price runs away from Flow into a snap). The mode is direction-blind to trend &mdash; it cares about distance from the dynamic anchor. This is precisely the signal reversal traders need and trend traders find confusing.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <TensionModeAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">DEEP COLOR = MAXIMALLY STRETCHED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TEAL_DEEP in Tension Mode means price has stretched 80%+ of the 100-bar peak stretch above Flow. MAG_DEEP means the same below. These bars are statistically rare &mdash; they appear at exhaustion points and pre-snap setups. When Tension prints DEEP, the rubber band is loaded.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SUSTAINED DEEP &middot; LOADED, NOT YET SNAPPING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A cluster of DEEP candles is a loaded zone &mdash; high probability of a reversion move, but no timing. Tension can stay at DEEP for 5-10 bars before resolving. The reversal trader uses DEEP as the &quot;watch list&quot; signal and waits for a Tension Snap (a TS signal) to fire before engaging.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">RAPID DECAY &middot; THE SNAP IN PROGRESS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a DEEP cluster transitions through STD, LIGHT, PALE in 2-3 bars, the snap is in progress. Tension is collapsing as price returns to Flow. This is the post-engagement read for reversal traders &mdash; the trade is working, the mean reversion is happening. Pale bars confirm the snap completed.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PALE TIER &middot; FAIR VALUE NEIGHBORHOOD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tension PALE bars indicate price is at or near Flow &mdash; fair value neighborhood. No stretch to fade, no snap to wait for. Reversal traders watch but do not engage. Trend traders may use this as confirmation that the trend is in its base before the next leg. Both contexts agree: low tension = no reversion edge.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHO RUNS TENSION MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reversal traders running the Reversal preset (auto-selects Tension Mode). Mean-reversion traders working in ranges. Anyone whose edge comes from fading exhaustion or anticipating snap-backs. The Tension Snap signal type is most readable when paired with Tension Mode candles &mdash; both reads point at the same mechanism.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHO SHOULD NOT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend traders, who will misread DEEP-tension trend bars as exhaustion when they are sustainable trends. Anyone who has not internalized the difference between stretch and momentum &mdash; Tension Mode will repeatedly paint deep colors during strong trends and confuse the operator into fading what they should be following.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE FLIP IS NOT A REVERSAL SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tension flipping from teal to magenta means price moved from above Flow to below Flow. This is not a directional reversal signal &mdash; it just reports the cross. The Flow cross may already be a continuation or a snap. Read the score history alongside the flip to know which.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Deep = loaded rubber band. Sustained deep = watch list. Decay = snap in progress. Pale = fair value, no edge. Direction blind to trend.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S07 — Composite Mode */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Composite Mode</p>
        <h2 className="text-2xl font-extrabold mb-4">Velocity, Tension, and Volume blended into one shade.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Composite Mode is the information-dense option. The score is a weighted blend: 50% Velocity, 30% Tension, 20% Volume direction. Three orthogonal dimensions compress into a single color per bar. The operator who masters Composite reads three reads at once with no eye-shift &mdash; the trade-off is that interpretation is harder because three signals are encoded together.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The 50/30/20 weighting is calibrated. Velocity dominates because directional momentum is the primary read most strategies need. Tension qualifies the velocity read &mdash; high velocity into low tension is sustainable, high velocity into high tension is exhaustion. Volume is the tiebreaker &mdash; it amplifies whichever side the candle closes on, weighted at 20% so it cannot override the other two but can shift a borderline bar to the next shade tier.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <CompositeModeAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">VELOCITY 50% &middot; THE DOMINANT VOICE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Half the composite score comes from Velocity alone. A candle with velocity score 80 will print deep teal under Composite Mode regardless of tension or volume readings &mdash; because 80 &times; 0.5 = 40, plus any contribution from the other two factors, easily clears the +50 STD threshold. Velocity is the floor; the other two adjust around it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TENSION 30% &middot; THE QUALIFIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tension qualifies what velocity is doing. High velocity with low tension means a sustainable move &mdash; the composite leans toward velocity&apos;s reading. High velocity with high tension means an exhaustive move &mdash; the composite still leans toward velocity but with reduced shade depth, signaling the operator that the move is running out of room.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">VOLUME 20% &middot; THE AMPLIFIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Volume direction is the candle&apos;s close-direction times the volume ratio score. It amplifies whichever side the candle closes on. A bullish close on 1.5&times; volume contributes +30 to the composite at 20% weight = +6 score points. Enough to push a bar from +44 (TEAL_LIGHT) to +50 (TEAL_STD), but not enough to flip a bear to a bull.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE INTERPRETATION CHALLENGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A TEAL_DEEP Composite candle could be: (a) high velocity + low tension + bullish volume (sustainable trend), (b) extreme velocity + moderate tension + neutral volume (climactic trend), (c) high velocity + low tension + huge volume (institutional flow). The operator cannot distinguish these from color alone. This is the trade-off &mdash; Composite is dense, but ambiguous on which dimension is driving.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHO RUNS COMPOSITE MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Scalpers running the Scalper preset (auto-selects Composite Bold). High-frequency operators who need maximum information per glance. Anyone whose strategy fires at the intersection of trend, stretch, and volume &mdash; Composite encodes all three in one read. The Bold variant pairs naturally because scalping demands maximum saturation contrast.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHO SHOULD NOT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Operators learning the system. Composite&apos;s ambiguity makes it a bad teaching tool &mdash; you cannot tell which dimension is firing without going to the panel anyway. Start with Trend, internalize velocity reading, then graduate to Composite once you can read the panel rows individually.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DEEP CANDLES ARE EARNED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              For a Composite candle to print DEEP, multiple factors usually need to align. A pure-velocity peak alone reaches +40 (LIGHT). Add moderate tension (+15) and bullish volume (+10) and you reach +65 (STD). DEEP requires extreme velocity OR strong velocity plus aligned tension/volume. This is why Composite DEEP bars are rarer than Trend DEEP bars at equivalent thresholds.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            50/30/20 = Velocity, Tension, Volume. Dense but ambiguous. Best for advanced operators who already read the panel cleanly.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S08 — Standard vs Bold */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Standard vs Bold</p>
        <h2 className="text-2xl font-extrabold mb-4">Same metric. Same scores. Different saturation.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Once you pick a metric (Trend, Tension, or Composite), the second decision is the intensity. Standard variants render with a fade value of 12 in Pine &mdash; about 95% alpha, slightly muted. Bold variants render with fade 0 &mdash; fully saturated. The score, the gradient mapping, and the threshold rules are identical. Only the rendering vivacity differs.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          On the Bitcoin 5m chart you uploaded, three Bold variants render side-by-side: Trend Bold (top-left), Tension Bold (top-right), Composite Bold (bottom-left), with Default (bottom-right) for comparison. The Bold variants pop visually &mdash; the deep shades dominate the eye and the pale shades still register. On a Standard rendering of the same chart, the deeps are slightly less commanding and the pales blend more into the background.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <StandardVsBoldAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STANDARD &middot; FOR EXTENDED SESSIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The slight transparency in Standard mode is intentional. Over 4-8 hour sessions, fully saturated colors create eye fatigue. Standard&apos;s 95% alpha keeps the colors readable while taking the visual edge off. Operators who run multi-hour shifts default to Standard for sustained focus.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">BOLD &middot; FOR DARK CHARTS AND LOW LIGHT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bold variants exist because dark TradingView themes and low-light trading environments suppress color saturation. What looks vivid on a daylight monitor looks muted at night. Bold compensates &mdash; full saturation cuts through the visual noise of a dark theme. Operators trading evening sessions or in dim home offices default to Bold.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SAME SCORES, DIFFERENT EMOTIONAL WEIGHT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bold candles register as more urgent than Standard candles, even though the score is identical. This is intentional &mdash; some operators want the visual urgency to amplify their reaction speed; others want the muted version to avoid emotional escalation. Both are legitimate. The choice is psychological as much as visual.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESET DEFAULTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Trader runs Trend (Standard). Swing Trader runs Trend Bold (longer holds, fewer bars to evaluate, contrast helps). Scalper runs Composite Bold (high-frequency, vivid contrast accelerates pattern recognition). Reversal runs Tension (Standard, since reversal traders watch tension build slowly across many bars). The preset designers chose intensities to match their archetypes&apos; cognitive needs.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SWITCHING INTENSITY MID-SESSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The intensity choice is one of the few CIPHER settings where mid-session changes are encouraged. As the lighting in your room changes, as your fatigue level rises, as your monitor brightness adjusts, the intensity that was right at session start may not be right four hours in. Switching from Bold to Standard (or vice versa) does not change any computed values &mdash; only the rendering.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MONITOR CALIBRATION FIRST</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before deciding between Standard and Bold, verify your monitor renders all 8 shades distinguishably. Open a chart in Bold, run a Trend or Composite mode, and scan for whether you can tell PALE from LIGHT, LIGHT from STD, STD from DEEP. If any pair is ambiguous on Bold, neither variant will work &mdash; calibrate the monitor or switch to Default.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 95% RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              On about 95% of charts, Bold produces a more readable result than Standard for short focused sessions, and Standard produces a more readable result for long sessions. The 5% exceptions are highly stylized chart themes or specialized visual workflows. Default to Bold for under-2-hour sessions and Standard for over-4-hour sessions; the middle range is preference.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Bold for short sessions and dark monitors. Standard for long sessions and bright monitors. Switch as conditions change.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S09 — Reading a Single Bar */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Reading a Single Bar</p>
        <h2 className="text-2xl font-extrabold mb-4">Score, shade, mode, read &mdash; in under one second.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The Conviction Operator reads conviction at a glance. The Candles Operator reads each bar at a glance. The decode protocol is short: identify the shade, recall the score range, infer the mode read, translate to operational meaning. Practiced operators do this in under one second per bar &mdash; faster than they can move their eyes to the panel.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The decode is mode-aware. The same TEAL_DEEP candle means different things in Trend Mode versus Tension Mode. In Trend Mode it means strong bullish velocity. In Tension Mode it means maximally stretched bull (an exhaustion warning, not a confirmation). The operator must know which mode is active before decoding &mdash; the shade is contextual.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <SingleBarDecodeAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 1 &middot; IDENTIFY THE SHADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pattern-match the candle&apos;s color to one of 8 shades. New operators struggle with PALE-vs-LIGHT and STD-vs-DEEP boundary cases; experienced operators identify shade in under 200 ms. The shade is the first read &mdash; it tells you the magnitude bin without the score number.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 2 &middot; RECALL THE SCORE RANGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The four positive thresholds are 0, 20, 50, 80. The four negative thresholds are 0, -20, -50, -80. Each shade corresponds to a 20-30 point band. After 50-100 hours of practice, the operator no longer thinks &quot;TEAL_STD = 50 to 80&quot; consciously &mdash; they just know the bar is in that range.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 3 &middot; INFER THE MODE READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Mode read: this is the velocity. Tension Mode read: this is the stretch. Composite Mode read: this is the blended score &mdash; with the ambiguity that means. The operator&apos;s active mode is in the inputs panel; the read changes meaning based on what is selected.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STEP 4 &middot; TRANSLATE TO OPERATIONAL MEANING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The final step bridges the read to action. TEAL_DEEP in Trend Mode = trend at peak, sustainable but watch for decay. MAG_STD in Tension Mode = bear stretch, watching for snap-back. TEAL_PALE in Composite = weak bullish blend, no edge yet. The translation is what makes the decode operationally useful.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PRACTICE PROTOCOL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Open a chart in Trend Mode. Pick 20 random bars. For each bar, say the shade out loud, then the inferred score range, then the operational read. Do this for 30 minutes. The next day, repeat in Tension Mode. The third day, Composite. After three sessions, the decode is automatic for the modes you trained on.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">COMMON DECODE ERRORS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Confusing Trend and Tension reads &mdash; calling a high-velocity sustainable bar an exhaustion bar because you misremember which mode is active. Misjudging shade boundary cases under low monitor brightness. Forgetting to check the mode at session start and reading bars under the wrong mental model. All three are training errors that disappear after 5-10 sessions.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PANEL AS BACKUP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When in doubt about a bar&apos;s decode, the panel is the source of truth. The Trend, Momentum, Volume, and Tension rows show the same data the candles encode. Use the panel to calibrate your candle reads during the learning phase &mdash; verify your decode against the panel verdict, learn where you are wrong, and over time stop needing the panel for the decode at all.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Shade &rarr; range &rarr; mode read &rarr; operational meaning. Practice 30 minutes a day for three days. After that, decode is automatic.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S10 — Reading a Cluster */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Reading a Cluster</p>
        <h2 className="text-2xl font-extrabold mb-4">Six bars carry more meaning than any single bar.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Single-bar decode tells you the magnitude of one bar&apos;s read. Cluster reading tells you what is happening in context. Six bars in a row form a phrase &mdash; the operator reads the phrase and identifies the pattern. Sustainable trends, climactic tops, range chop, and reversal bases each have characteristic six-bar signatures. Once you recognize the signatures, the chart starts to read itself.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The key shift from S09 (single-bar decode) to S10 (cluster read) is that the cluster carries information the bars individually do not. A TEAL_DEEP bar in isolation is strong velocity. A TEAL_DEEP bar that follows two TEAL_LIGHT bars and one TEAL_PALE bar is an emerging acceleration. A TEAL_DEEP bar that follows four TEAL_DEEP bars is a peak about to fade. Same bar, two completely different operational reads.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ClusterReadAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 1 &middot; SUSTAINABLE TREND</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Six bars climbing through LIGHT &rarr; STD &rarr; STD &rarr; DEEP &rarr; STD &rarr; LIGHT, then often a pale exit. The middle bars peak in the STD-DEEP band; the early and late bars are lighter. This is the signature of healthy trends &mdash; a controlled rise and gentle fade. Trade with the trend during the STD-DEEP middle; exit when the late LIGHT bars print.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 2 &middot; CLIMACTIC TOP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Several bars at STD-DEEP teal, then an abrupt flip to MAG_LIGHT or MAG_STD within 1-2 bars. The transition is fast &mdash; no gradual decay through PALE. This is the signature of capitulation reversals. Long-side operators who entered during the STD bars need to exit at the first MAG_LIGHT print; reversal traders see the flip as an entry signal.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 3 &middot; RANGE CHOP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Six bars alternating between TEAL_PALE and MAG_PALE with no STD or LIGHT bars appearing. The cluster is monotonously light &mdash; no edge in either direction. Range chop is the most common pattern on 5-15 minute charts during off-session hours. Operators reading this pattern stay on the sidelines until a STD or DEEP bar breaks the pattern.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 4 &middot; REVERSAL BUILDING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              MAG_DEEP &rarr; MAG_STD &rarr; MAG_LIGHT &rarr; MAG_PALE &rarr; PALE &rarr; LIGHT (teal). The cluster shows magenta exhaustion fading toward pale, then teal emerging. This is a base-building signature &mdash; the bear is exhausted, the bull is starting. Long-side operators wait for the LIGHT teal bar to confirm the reversal before engaging.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SIX BARS, NOT FIVE OR SEVEN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Six is the working window for cluster reads on most timeframes. Three or four bars is too few &mdash; you cannot distinguish a brief flicker from an emerging pattern. Eight-plus bars is too many &mdash; clusters that long usually contain regime transitions and the first half should be read separately from the second. Six bars captures one micro-regime cleanly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CLUSTER &lt;-&gt; PANEL CORRESPONDENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each cluster pattern correlates with a panel state. Sustainable trend patterns appear when the panel reports BULL TREND with TREND CURVING fading verdicts. Climactic tops appear when Pulse flips and Tension snaps. Range chop appears in RANGE regime. Reversal bases appear when leading-indicator modules (Pulse, Tension) flip ahead of trailing modules (Header, Ribbon). The candles render the panel&apos;s state.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRACTICE TARGET</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              After ten hours of cluster-pattern recognition practice, the operator can identify all four patterns at a glance. After 30-50 hours, they can identify subtle variants &mdash; sustainable trend with extra LIGHT bars, climactic top with a brief pause before the flip, etc. The pattern library expands the longer you trade with Cipher Candles.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Six bars form a phrase. Phrases beat single bars. Sustainable, climactic, chop, reversal &mdash; learn the four signatures, then expand the library through practice.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S11 — Regime Shifts on Candles */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Regime Shifts on Candles</p>
        <h2 className="text-2xl font-extrabold mb-4">The cluster color flip IS the regime shift.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          When the market transitions between regimes &mdash; TREND to RANGE, RANGE to TREND, COMPRESSION to EXPANSION &mdash; the candles broadcast the shift in real time. A wall of TEAL_STD bars fading through LIGHT, PALE, then alternating with magenta is the visual signature of TREND ending and RANGE beginning. The Header row in the Command Center reports the same transition seconds later as TREND CURVING then SHIFTING TO RANGE. The candles are the leading edge.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          This is the fastest regime-shift detection CIPHER offers. The Header row uses smoothed inputs and updates with one or two bars of lag. The candles update immediately because they paint the underlying scores directly. Operators who watch candles catch regime shifts a bar or two before the panel confirms &mdash; valuable on lower timeframes where every bar matters.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <RegimeShiftAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TREND TO RANGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The signature: a sustained cluster of STD-DEEP shades (one direction) decaying through LIGHT, PALE, then alternating with the opposite color&apos;s PALE. The decay can be gradual (5-7 bars) or rapid (1-2 bars). Either way, when you see the alternating-pale pattern emerge, the trend has ended and the range has begun.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">RANGE TO TREND</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The reverse signature: alternating PALE bars suddenly resolve into a one-direction LIGHT &rarr; STD &rarr; DEEP cluster. The transition bar is usually a STD-tier bar with no recent precedent in the cluster &mdash; the chart breaking out of its own monotony. Operators reading this transition engage in the direction of the new STD cluster.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">COMPRESSION TO EXPANSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Compression looks like extreme range chop &mdash; alternating PALE candles with very small bodies. Expansion is the breakout: a single STD or DEEP candle with a body 3-5x larger than the prior bars. The breakout candle is the regime shift. Tension Mode shows this transition most cleanly because the squeeze release amplifies tension visibly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TRENDS BREAKING WITHIN TRENDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Within a longer trend, the candle cluster sometimes flips to magenta for 2-4 bars before returning to teal. These mid-trend pauses are not regime shifts &mdash; they are pullbacks. The signature: brief MAG_PALE or MAG_LIGHT cluster (no DEEPs), sandwiched between teal STD-DEEP clusters. Operators learn to ignore these as noise rather than treating them as regime shifts.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TIMING THE TRANSITION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The exact bar where the regime shifts is rarely the first bar that prints differently. Wait for confirmation &mdash; usually two to three bars in the new pattern. Single-bar transitions can be false signals. The two-to-three-bar wait sacrifices some entry but eliminates most false transitions, and CIPHER&apos;s scoring accounts for this lag in its signals.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PANEL AS CONFIRMATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When you spot a regime shift in the candles, glance at the Header row to confirm. If Header still says BULL TREND while your candles show range chop, wait one more bar &mdash; the Header is lagging but it will catch up. If Header has already flipped to RANGING, your candle read is correct and the panel agrees.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REGIME SHIFTS ACROSS MODES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Mode shows velocity-based regime shifts. Tension Mode shows stretch-based regime shifts (loaded then snapping). Composite Mode shows blended shifts. The same market transition produces different visual signatures depending on which mode you run. Switching modes mid-shift can recalibrate your read &mdash; useful occasionally, disorienting if overdone.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Cluster color flip = regime shift. Wait two bars for confirmation. Glance at Header. Engage in the new direction once both agree.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S12 — Cipher Candles + Conviction Synthesis */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Cipher Candles + Conviction Synthesis</p>
        <h2 className="text-2xl font-extrabold mb-4">When the candle and the synthesis agree, you have alignment.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Lesson 11.22 taught the conviction synthesis layer &mdash; how the four-factor score and the context-tag cascade produce a single engagement decision. This lesson shows where the candle read fits into that decision. The candle on the signal bar is a fifth corroborating data point. When the candle agrees with the synthesis, you have alignment. When they disagree, the panel is broadcasting noise the synthesis is hiding.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The pattern: a Strong signal (3/4 or 4/4) firing on a TEAL_DEEP candle (Trend Mode) is a high-conviction confirmation. The synthesis says engage; the candle visually confirms with peak velocity. A Strong signal firing on a TEAL_PALE candle is a yellow-flag signal &mdash; the synthesis says engage but the candle shows weak underlying velocity. The trade may still work, but the visual disagreement warrants tighter management.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <CandlesPlusSynthesisAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">STRONG + DEEP CANDLE = APEX VISUAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a signal fires with 4/4 conviction AND the candle on that bar is TEAL_DEEP (Trend Mode), you have synthesis-and-candle alignment. The score, the context tag, and the candle all broadcast the same direction at peak intensity. This is the visual signature of an apex setup &mdash; conviction-tier sizing applies.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STRONG + PALE CANDLE = YELLOW FLAG</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A Strong signal firing on a TEAL_PALE or MAG_PALE candle means the synthesis says engage but the underlying velocity (or stretch, or composite) is weak. The trade still has the four-factor backing, but the candle warns that the move may not have follow-through. Trade smaller, scale faster.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STANDARD + DEEP CANDLE = HIDDEN STRENGTH</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sometimes a 2/4 Standard signal fires on a TEAL_DEEP candle. The synthesis is borderline (skip or half-size territory) but the candle shows peak velocity. This is the rare case where the candle catches strength the four-factor score missed &mdash; usually because Ribbon was lagging or ADX was just under threshold. Operators with experience may engage these at half size; learners should still skip.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STANDARD + PALE = THE SKIP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              2/4 score with a PALE candle is the most reliable skip in the framework. Both the synthesis and the candle agree the read is weak. Save the capital for setups where both agree on strength.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">CANDLES DO NOT REPLACE THE SYNTHESIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The candle is corroborating evidence, not primary signal. The synthesis layer is built from four orthogonal factors plus a 13-tag context cascade &mdash; the candle is one continuous score. The candle adds confirmation but cannot substitute. Operators who try to trade off candles alone (without checking the score and tag) miss the structural context the cascade provides.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MODE MATTERS HERE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The candle-synthesis alignment read depends on which mode is active. Trend Mode aligns most cleanly with momentum-based signals (Pulse Cross). Tension Mode aligns with reversal-based signals (Tension Snap). Composite aligns with both but ambiguously. Pick the mode that matches your dominant signal type.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE ONE-SECOND RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a signal fires, you should be able to read the candle color and the tooltip score in under one second combined. If reading the candle takes longer, you have not finished the cluster-reading practice from S10. If reading the tooltip takes longer, you have not fully internalized the synthesis from L11.22. Both reads must be fast for the alignment check to be useful.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Strong + DEEP = apex. Strong + PALE = yellow flag. Standard + DEEP = hidden strength (skip while learning). Standard + PALE = clean skip. Read both in under a second.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S13 — Mode-to-Preset Mapping */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Mode-to-Preset Mapping</p>
        <h2 className="text-2xl font-extrabold mb-4">Each preset paints by what its archetype needs to see.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          When you activate a preset, CIPHER also activates a candle mode. The mapping is deliberate &mdash; each preset selects the mode that matches its trader archetype&apos;s primary read. Trend Trader paints by velocity (Trend mode). Reversal paints by stretch (Tension mode). Scalper paints by everything (Composite Bold). The preset is a complete configuration; the candle mode is part of that configuration.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The mapping reinforces the preset&apos;s philosophy from L11.22 S11. Swing Trader runs Trend Bold not because Bold is &quot;better&quot; than Standard but because swing traders evaluate fewer setups per day and benefit from higher visual contrast on each one. Sniper runs Default because the Sniper&apos;s edge is squeeze-release timing &mdash; the candles do not add value to that read; the squeeze indicator does.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <PresetWheelAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TREND TRADER &rarr; TREND</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Trader catches sustained moves. The Trend candle mode paints by Velocity, which is exactly what trend traders need to see. Standard intensity (not Bold) because trend trades are evaluated over longer windows where eye fatigue matters and visual urgency is unhelpful.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCALPER &rarr; COMPOSITE BOLD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Scalpers strike from levels with maximum information per glance. Composite encodes velocity, tension, and volume into one color &mdash; everything a scalp setup needs. Bold intensity because scalps need vivid contrast for fast decisions and the sessions are short enough that fatigue does not dominate.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SWING TRADER &rarr; TREND BOLD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Swing trades evaluate one or two setups per day, hold for days. Trend Mode paints by velocity (the dominant read for swings). Bold intensity because each evaluation is high-stakes and the visual contrast helps the trader commit confidently to multi-day positions.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REVERSAL &rarr; TENSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reversal traders fade exhaustion. Tension Mode paints by stretch &mdash; the literal mechanism reversal traders fade. Standard intensity because reversal setups develop over many bars (stretch builds slowly) and reversal traders watch entire patterns rather than reacting to single bars.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SNIPER &rarr; DEFAULT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Sniper&apos;s edge is timing the release of compressed energy &mdash; the squeeze indicator does that work, not the candles. Default mode keeps the chart clean so the squeeze visualization (the Coil module) gets full visual attention. Adding Cipher coloring to Sniper&apos;s chart would compete with the squeeze read and dilute the operator&apos;s focus.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CHANGING THE PRESET CHANGES THE CANDLES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When you switch presets, the candle mode changes automatically as part of the preset configuration. Switching from Trend Trader to Reversal mid-session will repaint the chart from velocity-colored bars to tension-colored bars. The data has not changed &mdash; only the visualization. Allow 20-30 minutes to recalibrate after a preset switch.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">OVERRIDING THE PRESET&apos;S MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Advanced operators sometimes run a preset for everything except the candle mode &mdash; e.g. Trend Trader logic with Composite Bold candles. This requires running the None preset and manually configuring all the layers. Workable, but you lose the convenience of the preset system. Most operators run the preset as designed.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE STRUCTURE PRESET</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Structure preset disables signals entirely (Visuals Only). Its candle mode is also Default &mdash; the preset is for pure chart-reading, and any candle coloring would distract from raw structural analysis. Operators using Structure for chart study and switching to a different preset for trading get clean separation between study and execution modes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The preset chooses the mode. Switching presets repaints the chart. Run the preset as designed unless you have a specific reason to override.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S14 — Choosing a Mode for Your Style */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Choosing a Mode for Your Style</p>
        <h2 className="text-2xl font-extrabold mb-4">One question. Four answers. Pick once.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Operators who run None preset (manual configuration) face the candle-mode decision directly. The decision tree is short. What does your strategy primarily need to see? Trend strength leads to Trend or Trend Bold. Stretch and exhaustion leads to Tension or Tension Bold. All three dimensions at once leads to Composite or Composite Bold. None of the above leads to Default. The choice flows from the strategy, not the other way around.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The wrong way to pick a mode is to try them all and stick with whichever &quot;feels best&quot; visually. Visual preference is recency bias &mdash; whatever you saw last looks right. The correct method is to identify what your strategy needs to see, pick the corresponding mode, and commit to it for at least 20 sessions before evaluating. Over 20 sessions you will learn whether the mode actually serves your strategy or whether you misidentified what it needed.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ModeRecommenderAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">QUESTION &middot; WHAT DOES YOUR STRATEGY NEED TO SEE?</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Strategy here means the actual setup you trade. Not your aspirational style, not what feels sophisticated, but the mechanism by which you actually make money. Be honest. If you fade exhaustion, your strategy needs stretch. If you ride trends, your strategy needs velocity. If your setups depend on multi-factor confluence, your strategy needs the blended view.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ANSWER 1 &middot; TREND STRENGTH</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pick Trend or Trend Bold. Standard for long sessions, Bold for short or dark-monitor sessions. The Velocity score will paint your candles with directional momentum readings. Strong moves print deep, fading moves print pale. Your eyes go to the chart, your strategy reads the trend, your panel confirms.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ANSWER 2 &middot; STRETCH AND EXHAUSTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pick Tension or Tension Bold. The Tension score paints stretch from the Flow line. Loaded zones print deep, near-Flow bars print pale. Your reversal setups develop visibly &mdash; you see tension build, you see tension snap, you see tension reset.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ANSWER 3 &middot; ALL THREE AT ONCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pick Composite or Composite Bold. The 50/30/20 blend encodes velocity, tension, and volume in one shade. Best for high-frequency setups where the operator does not have time to switch modes between reads. Trade-off: ambiguity about which dimension is firing on any given bar.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ANSWER 4 &middot; NONE OF THE ABOVE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pick Default. Either you are backtesting visually, your monitor cannot render the gradient cleanly, you are running another candle-coloring indicator, or your strategy genuinely does not benefit from any of the three Cipher metrics. Default is a legitimate answer &mdash; not a fallback.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 20-SESSION COMMITMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Once you pick a mode, run it for at least 20 sessions before evaluating. The first 5 sessions are calibration &mdash; your eyes are still learning the shade boundaries. Sessions 5-15 are pattern recognition &mdash; you are learning what clusters look like. Sessions 15-20 are honest evaluation &mdash; can you read the candles fluently and does the read actually inform your decisions? If yes, commit. If no, switch and restart.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T MIX MODES MID-LEARNING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Switching candle modes during the 20-session learning phase resets the calibration. Each mode has its own visual vocabulary; mixing them mid-learning means you never master any one of them. Stick with the chosen mode through the full 20 sessions, then evaluate. Switching to test &quot;is the other one better&quot; is the most common reason operators give up on Cipher Candles entirely.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Identify what your strategy needs. Pick the matching mode. Commit for 20 sessions. Evaluate. Switch only with cause, not with curiosity.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S15 — Mode-Switching Mid-Session */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Mode-Switching Mid-Session</p>
        <h2 className="text-2xl font-extrabold mb-4">When it is OK and when it is not.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The candle mode setting persists across sessions. TradingView remembers your last selection. Most operators set it once and forget about it &mdash; which is the right default. But there are legitimate reasons to switch mid-session, and there are bad reasons. Distinguishing the two is part of the Candles Operator&apos;s discipline.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Three legitimate switches: Standard to Bold (or vice versa) for environmental changes, Trend to Tension when shifting between trend trades and reversal trades within the same session, and any mode to Default when entering chart-study mode. Three illegitimate switches: switching because the current mode does not show what you want to see (your strategy is wrong, not the mode), switching to confirm a trade you have already entered (confirmation bias), switching mid-trade because the candles have flipped against you (denial of the read).
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">LEGITIMATE 1 &middot; INTENSITY ADJUSTMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Standard to Bold (or vice versa) for environmental changes. The sun went down and your monitor looks dimmer &mdash; switch to Bold. You moved to a brighter room &mdash; switch to Standard. Your eyes started fatiguing &mdash; switch to Standard. These switches do not change any computed values. They just adjust the rendering for your current visual conditions.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LEGITIMATE 2 &middot; STRATEGY CONTEXT SHIFT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Some operators trade trends in the morning and reversals in the afternoon. Switching from Trend Mode to Tension Mode when their session shifts from trend-hunting to reversal-hunting matches the candle mode to the active strategy. The candles repaint, the panel reads stay the same, and the operator&apos;s eyes get the right primary read for what they are doing.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LEGITIMATE 3 &middot; SWITCHING TO DEFAULT FOR STUDY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When you stop trading and start studying the chart in hindsight, switching to Default removes the Cipher coloring bias from your evaluation. You see what an operator without CIPHER would see. After the study, switch back to your trading mode. This separation between trading state and study state is a discipline marker.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ILLEGITIMATE 1 &middot; HUNTING FOR THE RIGHT READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You are running Trend Mode but the candles look chopppy. You switch to Tension Mode hoping for a clearer read. You switch to Composite hoping for confirmation. None of them confirm what you wanted. This pattern is your strategy hunting for permission to trade. The mode is not wrong; the setup is not there. The fix is to wait, not to switch modes.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ILLEGITIMATE 2 &middot; CONFIRMATION BIAS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You have already entered a trade. The candles in your active mode look weak. You switch to a different mode to see if it shows the trade in a more favorable light. This is confirmation bias rendered as a feature toggle. The original mode&apos;s read is still the right one. Do not let mid-trade mode-switching repaint a bad trade as a good one.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ILLEGITIMATE 3 &middot; DENIAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You are in a trade. The candles flipped color &mdash; the read is now against you. You switch to Default so you do not have to see the magenta cluster forming. This is denial of the data. The right response is to honor the read and exit; switching to Default just delays the inevitable.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TEST</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before any mid-session switch, ask: am I switching because my environment changed, my strategy context changed, or I am moving from trading to study? Yes to any = switch. No to all = do not switch. The discipline is not in the switching itself but in honestly answering that question every time.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Switch for environment, context shift, or study mode. Do not switch to hunt, confirm, or deny. The discipline is in the question you ask before switching.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S16 — The Cheat Sheet */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; The Cheat Sheet</p>
        <h2 className="text-2xl font-extrabold mb-4">Everything you need on one page.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The Cipher Candles framework distilled. Print this, tape it next to your L11.22 cheat sheet, read both before every session.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE THREE METRICS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Velocity (directional momentum) &middot; Tension (stretch from Flow) &middot; Composite (50V + 30T + 20Vol). Each normalized to 100-bar peak. Each maps to the same 8-shade gradient.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TWO INTENSITIES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Standard (fade 12, slightly muted) for long sessions or bright monitors. Bold (fade 0, fully saturated) for short sessions or dark monitors. Same scores, different rendering.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPT-OUT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Default &mdash; raw exchange candles. Use for backtesting, monitor calibration issues, or indicator stacking. Legitimate first choice, not a downgrade.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 8-LEVEL GRADIENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TEAL_DEEP &ge;80 &middot; TEAL_STD 50-80 &middot; TEAL_LIGHT 20-50 &middot; TEAL_PALE 0-20 &middot; MAG_PALE -20 to 0 &middot; MAG_LIGHT -50 to -20 &middot; MAG_STD -80 to -50 &middot; MAG_DEEP &lt;-80.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SINGLE-BAR DECODE PROTOCOL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Identify shade &rarr; recall score range &rarr; infer mode read &rarr; translate to operational meaning. Target: under one second per bar after 30 hours of practice.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CLUSTER PATTERNS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sustainable trend (LIGHT-STD-DEEP-STD-LIGHT) &middot; Climactic top (DEEP cluster then sharp magenta flip) &middot; Range chop (alternating PALE) &middot; Reversal building (MAG_DEEP fading to PALE then teal LIGHT).
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REGIME SHIFT SIGNATURE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cluster color flip = regime shift. Wait two bars for confirmation. Glance at Header to validate. Engage in the new direction once both agree.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CANDLES + SYNTHESIS ALIGNMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Strong + DEEP candle = apex visual &middot; Strong + PALE = yellow flag &middot; Standard + DEEP = hidden strength (skip while learning) &middot; Standard + PALE = clean skip.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESET MAPPINGS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Trader &rarr; Trend &middot; Scalper &rarr; Composite Bold &middot; Swing Trader &rarr; Trend Bold &middot; Reversal &rarr; Tension &middot; Sniper &rarr; Default &middot; Structure &rarr; Default.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">MODE SELECTION QUESTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              What does your strategy need to see? Trend strength &rarr; Trend or Trend Bold &middot; Stretch &rarr; Tension or Tension Bold &middot; All three &rarr; Composite or Composite Bold &middot; None of above &rarr; Default.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">MID-SESSION SWITCH RULES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              OK: environment change (Standard&harr;Bold), strategy context shift, switch to Default for study. NOT OK: hunting for the right read, confirmation bias, denial of an unfavorable read.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 20-SESSION COMMITMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Once you pick a mode, commit for 20 sessions. Sessions 1-5 are calibration. 5-15 are pattern recognition. 15-20 are honest evaluation. Switching mid-learning resets the calibration.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">THE FOUR SENTENCES</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Pick the metric your strategy needs. Pick the intensity your environment supports. Decode the shade in under a second. Read clusters, not bars. Everything else is calibration.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MISTAKES — Six Common Mistakes */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
        <h2 className="text-2xl font-extrabold mb-4">What goes wrong when candles are misread.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The Candles Operator framework is a rendering tool, not a magic indicator. The failure modes are operator errors, not tool errors. Six recurring mistakes operators make when learning Cipher Candles. Each has a fix and the fix is more conservative than the mistake.
        </p>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &middot; READING SHADE WITHOUT MODE</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator sees a TEAL_DEEP candle and assumes &quot;strong bull&quot; without checking which mode is active. In Trend Mode, this is correct &mdash; strong velocity. In Tension Mode, the same shade means maximally stretched bull (an exhaustion warning, not a confirmation). <span className="text-amber-400">Fix</span>: always confirm the active mode before decoding any bar. The shade is contextual.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &middot; SWITCHING MODES TO HUNT</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The current mode shows a chop pattern. Operator switches to a different mode hoping for clearer signal. None of the modes show what they want. This is the strategy hunting for permission to trade. The mode is not wrong &mdash; the setup is not there. <span className="text-amber-400">Fix</span>: when in doubt, wait. Mode-switching mid-session should be triggered by environment or context shifts, not by the absence of a setup you wanted.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &middot; READING SINGLE BARS IN ISOLATION</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            One TEAL_DEEP bar in isolation looks like strength. The same bar at the end of a four-bar TEAL_DEEP cluster is a peak about to fade. Operators who decode single bars without reading the cluster context misjudge sustainable trends as continuations and exhaustions as breakouts. <span className="text-amber-400">Fix</span>: always read the prior 5-6 bars before assigning operational meaning to the current bar.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &middot; SUBSTITUTING CANDLES FOR PANEL</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The candles read clean, the operator stops looking at the panel entirely. Then a structural setup (Sweep, FVG, S/R level) fires that the candles cannot encode &mdash; and the operator misses it. Cipher Candles encode dynamics; the panel encodes structure. <span className="text-amber-400">Fix</span>: candles are a faster read for momentum; the panel is the source of truth for structural context. Use both.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &middot; OVER-WEIGHTING THE CANDLE IN ALIGNMENT</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            A 2/4 Standard signal fires on a TEAL_DEEP candle. The operator engages because the candle &quot;confirms&quot; strength. But the conviction synthesis is still 2/4 &mdash; the candle is corroborating evidence, not primary signal. <span className="text-amber-400">Fix</span>: the synthesis layer remains the engagement decision. The candle adds confidence to a Strong signal but cannot promote a Standard signal to Strong.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &middot; SKIPPING THE 20-SESSION COMMITMENT</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator picks Trend Mode, runs it for 3 sessions, decides &quot;the colors are confusing,&quot; switches to Composite, runs that for 4 sessions, switches to Tension, and so on. After 30 sessions of mode-hopping they have not mastered any mode. <span className="text-amber-400">Fix</span>: pick a mode, commit for 20 sessions. The first 5-10 sessions ARE supposed to feel confusing &mdash; that is calibration. Trust the protocol.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Six mistakes, six fixes. Always check the mode. Read clusters not bars. Use candles WITH the panel, not instead of it. Commit for 20 sessions before evaluating.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* GAME — The Candle-Reading Challenge */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Candle-Reading Challenge</p>
        <h2 className="text-2xl font-extrabold mb-4">Five scenarios. Five decisions.</h2>

        <p className="text-gray-400 leading-relaxed mb-8">
          Each round presents a real candle-reading scenario that the Candles Operator faces. Your job is to identify the mode, decode the shade, read the cluster, check the alignment with the synthesis, and pick the right response. Wrong answers come with explanations. Pass threshold: get all five correct.
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
                ? 'Perfect read across all five scenarios. The candle vocabulary is yours.'
                : gameScore >= 3
                ? 'Solid candle reads. Re-read the scenarios you missed and the relevant section.'
                : 'The candle vocabulary takes practice. Revisit S05 through S15 and try again.'}
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
          The quiz tests recall of the Cipher Candles framework &mdash; the 3-score architecture, the 8-level gradient, mode mappings, alignment reads, and the discipline rules. Six correct out of eight unlocks the Candles Operator certificate.
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
                ? 'Pass. Your read of the candle framework is solid.'
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
      {/* CERT — Candles Operator */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
        <h2 className="text-2xl font-extrabold mb-4">{certUnlocked ? 'Candles Operator \u2014 unlocked.' : 'Complete the quiz to unlock the cert.'}</h2>

        {certUnlocked ? (
          <>
            <p className="text-gray-400 leading-relaxed mb-8">
              You now read each bar in under a second. The panel is no longer your primary scanner &mdash; the candles are. Three metrics, two intensities, eight shades, four cluster patterns. The Visual Layer arc closes here. From here, the rest of Level 11 puts the entire system to work.
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
                <p className="text-3xl font-black text-white mb-2">Candles Operator</p>
                <p className="text-sm text-gray-400 mb-6">Certificate of Visual Layer Mastery</p>

                <div className="w-20 h-px bg-amber-400/40 mx-auto mb-6" />

                <p className="text-xs text-gray-500 mb-1">Awarded for completion of</p>
                <p className="text-sm font-bold text-white mb-6">Cipher Candles</p>

                <div className="inline-block px-4 py-2 rounded-lg border border-amber-400/30 bg-black/40">
                  <p className="text-[10px] tracking-widest uppercase text-amber-400/80">Cert ID</p>
                  <p className="text-xs font-mono text-white">PRO-CERT-L11.23</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU CAN DO NOW</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Decode any Cipher Candle in under a second &mdash; identify the shade, recall the score range, infer the mode read, translate to operational meaning. Read 6-bar clusters as patterns rather than individual bars. Recognize regime shifts in the candle color flip before the panel confirms. Check candle-synthesis alignment to size correctly.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">THE VISUAL LAYER ARC IS COMPLETE</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Six sensory modules across L11.16-21. One synthesis layer in L11.22. One rendering layer in L11.23. The arc that started with Ribbon and Spine ends here, with the bars themselves carrying the read. From the next lesson onward, every module is assumed prerequisite knowledge.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT COMES NEXT</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  War Room Integration. The remaining Level 11 lessons stop teaching individual modules and start teaching how to operate the full system &mdash; multi-chart workflows, cross-asset reads, alert architecture, journaling, and the discipline routines that turn the Visual Layer into a sustainable trading practice.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-gray-400">
              Complete the Candle-Reading Challenge and the Knowledge Check (6/8) above to unlock the certificate.
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
            <p className="text-xs tracking-widest uppercase text-amber-400/60 mb-2">Visual Layer Arc Complete</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lesson 11.23 closes the Visual Layer arc. The remaining five Level 11 lessons assume you can read all six modules, the synthesis layer, and the candle rendering. From here, Level 11 is about operationalizing the system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/academy/lesson/cipher-conviction-synthesis"
              className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition"
            >
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-1">&larr; Previous</p>
              <p className="text-sm font-bold text-white">L11.22 &middot; Cipher Conviction Synthesis</p>
            </Link>
            <Link
              href="/academy/lesson/cipher-war-room-integration"
              className="flex-1 p-4 rounded-xl border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10 transition"
            >
              <p className="text-xs tracking-widest uppercase text-amber-400/80 mb-1">Next &rarr;</p>
              <p className="text-sm font-bold text-white">L11.24 &middot; War Room Integration</p>
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
