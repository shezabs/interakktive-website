'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

// ============================================================
// LESSON 11.22 — Cipher Conviction Synthesis
// Cert: Conviction Operator
// GC: When Modules Agree, Trade. When They Don't, Wait.
// ============================================================
// First capstone lesson of Level 11. Bridges the Visual Layer arc
// (L11.16-21) into system-level integration. Teaches:
//   1. The 4-factor conviction score (Ribbon × ADX × Volume × Health)
//   2. The 13-tag context cascade (Sweep+FVG → Sweep → Breakout → ...)
//   3. The synthesis tooltip (one read, all modules)
//   4. The min_conviction filter (the policy lever)
//   5. Strong vs Standard label rendering on chart
//   6. Convergence reads (when 3+ modules agree)
//   7. Divergence warnings (when modules contradict)
//   8. Conviction-tier sizing
//   9. The presets as conviction philosophies
//  10. Edge cases (2-bull/1-bear, recent flips, regime mismatch)
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
// CONFETTI — gold-standard cert reveal pattern from L11.18
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
// ANIMATION 1 — ConvictionMeterAnim (Hero / S01 GC)
// The 4-factor conviction meter. Four bars (Ribbon / ADX / Volume / Health)
// fill in sequence over 6 seconds. The score counter animates 0 → 4.
// At 4/4, the entire meter glows teal and a "+" badge ignites.
// This is the visual signature of the lesson.
// ============================================================
function ConvictionMeterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    // Title at top
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONVICTION SCORE', w / 2, 28);

    // Big numeric counter
    const factors = ['RIBBON', 'ADX > 20', 'VOLUME > 1.0\u00D7', 'HEALTH > 50%'];
    const fillStarts = [0.10, 0.25, 0.40, 0.55];
    const fillDur = 0.10;

    const filled: number[] = factors.map((_, i) => {
      const s = fillStarts[i];
      if (tt < s) return 0;
      if (tt > s + fillDur) return 1;
      return easeInOut((tt - s) / fillDur);
    });
    const score = filled.reduce((a, b) => a + (b > 0.95 ? 1 : 0), 0);

    // Big counter
    const meterTeal = score === 4 && tt > 0.70;
    const counterColor = meterTeal ? '#26A69A' : score >= 3 ? '#26A69A' : score >= 2 ? '#FFB300' : 'rgba(255,255,255,0.4)';
    ctx.fillStyle = counterColor;
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${score}/4`, w / 2, 90);

    // STRONG / STANDARD / NONE label
    let lbl = 'WAITING';
    let lblColor = 'rgba(255,255,255,0.4)';
    if (score === 4) { lbl = '\u2795 STRONG \u2014 4/4'; lblColor = '#26A69A'; }
    else if (score === 3) { lbl = '\u2795 STRONG \u2014 3/4'; lblColor = '#26A69A'; }
    else if (score === 2) { lbl = 'STANDARD \u2014 2/4'; lblColor = '#FFB300'; }
    else if (score === 1) { lbl = 'STANDARD \u2014 1/4'; lblColor = '#FFB300'; }

    ctx.fillStyle = lblColor;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(lbl, w / 2, 112);

    // Four factor bars
    const barW = w * 0.7;
    const barX = (w - barW) / 2;
    const barH = 18;
    const gap = 12;
    const startY = 145;

    factors.forEach((label, i) => {
      const y = startY + i * (barH + gap + 14);
      // Label
      ctx.fillStyle = filled[i] > 0.5 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, barX, y - 4);
      // Check or dot
      ctx.textAlign = 'right';
      ctx.fillStyle = filled[i] > 0.95 ? '#26A69A' : 'rgba(255,255,255,0.3)';
      ctx.fillText(filled[i] > 0.95 ? '\u2713' : '\u00B7', barX + barW, y - 4);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(barX, y, barW, barH);
      // Bar fill
      const fillW = barW * filled[i];
      ctx.fillStyle = filled[i] > 0.95 ? '#26A69A' : 'rgba(38, 166, 154, 0.6)';
      ctx.fillRect(barX, y, fillW, barH);
      // Bar border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, y, barW, barH);
    });

    // Glow at 4/4
    if (meterTeal) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.3 + 0.4 * pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(barX - 12, startY - 22, barW + 24, factors.length * (barH + gap + 14) + 8);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each factor that passes its test \u2014 add 1.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 2 — FactorStackAnim (S02 — The 4-Factor Engine)
// Four columns (Ribbon, ADX, Volume, Health) — each a stack of cells
// that light up when their condition is met. The cells then collapse
// into a single integer score (sum). Loops across 4 different scenarios:
//   3/4 (Strong threshold), 4/4 (max), 2/4 (Standard), 1/4 (weak).
// Teaches the formula visually.
// ============================================================
function FactorStackAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    // Four scenarios, each lasting 1/4 of the cycle
    const scenarios = [
      { name: 'TREND DAY', factors: [true, true, true, false], score: 3 },
      { name: 'INSTITUTIONAL ALIGNMENT', factors: [true, true, true, true], score: 4 },
      { name: 'WEAK BREAKOUT', factors: [false, true, true, false], score: 2 },
      { name: 'CHOPPY MARKET', factors: [false, false, true, false], score: 1 },
    ];

    const scenIdx = Math.floor(tt * 4);
    const scen = scenarios[scenIdx];
    const localT = (tt * 4) % 1;
    const reveal = Math.min(1, localT * 4);

    // Title at top
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCENARIO', w / 2, 22);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(scen.name, w / 2, 42);

    // Four columns
    const labels = ['RIBBON', 'ADX', 'VOL', 'HEALTH'];
    const colW = w / 5.5;
    const colGap = (w - 4 * colW) / 5;
    const startX = colGap;
    const colTop = 70;
    const colHeight = h - 150;

    labels.forEach((lbl, i) => {
      const x = startX + i * (colW + colGap);
      const isOn = scen.factors[i] && reveal > (i * 0.15);
      const colColor = isOn ? '#26A69A' : 'rgba(255,255,255,0.08)';

      // Column body
      ctx.fillStyle = isOn ? 'rgba(38, 166, 154, 0.18)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x, colTop, colW, colHeight);
      ctx.strokeStyle = isOn ? '#26A69A' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, colTop, colW, colHeight);

      // Status icon center
      ctx.fillStyle = isOn ? '#26A69A' : 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isOn ? '\u2713' : '\u00B7', x + colW / 2, colTop + colHeight / 2 + 8);

      // Label below
      ctx.fillStyle = isOn ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.fillText(lbl, x + colW / 2, colTop + colHeight + 16);

      // Counter beneath label
      ctx.fillStyle = isOn ? '#26A69A' : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillText(isOn ? '+1' : '0', x + colW / 2, colTop + colHeight + 32);
    });

    // Sum line at bottom
    const sumY = h - 28;
    const visScore = Math.floor(reveal * 4) >= scen.score ? scen.score : Math.min(scen.score, Math.floor(reveal * 4));
    const sumColor = visScore === 4 ? '#26A69A' : visScore === 3 ? '#26A69A' : visScore === 2 ? '#FFB300' : '#EF5350';
    const sumLbl = visScore === 4 ? '\u2795 STRONG' : visScore === 3 ? '\u2795 STRONG' : visScore === 2 ? 'STANDARD' : visScore === 1 ? 'STANDARD' : 'NONE';

    ctx.fillStyle = sumColor;
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SUM = ${visScore}/4   \u2192   ${sumLbl}`, w / 2, sumY);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 3 — MinConvictionFilterAnim (S03 — The Min Conviction Filter)
// Six signal triangles fire in sequence, each with a 1-4 conviction score.
// A horizontal "min_conviction = 0" line is drawn first — all 6 print.
// Then it lifts to "min_conviction = 3" — only the 3+ signals survive
// (others fade out). Teaches the policy lever.
// ============================================================
function MinConvictionFilterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // 6 signals — score, x position
    const signals = [
      { score: 2, x: 0.12, dir: 'long' as const },
      { score: 4, x: 0.25, dir: 'long' as const },
      { score: 1, x: 0.40, dir: 'short' as const },
      { score: 3, x: 0.55, dir: 'long' as const },
      { score: 2, x: 0.70, dir: 'short' as const },
      { score: 3, x: 0.85, dir: 'long' as const },
    ];

    const phaseA = tt < 0.45;
    const phaseB = tt >= 0.55;
    const lift = tt > 0.45 && tt < 0.55 ? (tt - 0.45) / 0.10 : phaseB ? 1 : 0;

    // Threshold line
    const minConv = lift < 0.5 ? 0 : 3;
    const thrY = h - 50 - lift * 80;

    ctx.strokeStyle = 'rgba(255,179,0,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(20, thrY);
    ctx.lineTo(w - 20, thrY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Threshold label
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`min_conviction = ${minConv}`, 24, thrY - 6);

    // Signals
    signals.forEach((sig, i) => {
      const baseY = h - 50;
      const sigY = baseY - sig.score * 25;
      const fireT = (i * 0.07);
      const visible = tt > fireT;
      if (!visible) return;

      const survives = sig.score >= minConv;
      const fadeStart = phaseB ? 0.65 : 1.5;
      const opacity = !survives && tt > fadeStart ? Math.max(0, 1 - (tt - fadeStart) / 0.15) : 1;

      ctx.globalAlpha = opacity;

      // Triangle
      const triX = w * sig.x;
      const isLong = sig.dir === 'long';
      const isStrong = sig.score >= 3;
      const triColor = isLong ? '#26A69A' : '#EF5350';
      const triSize = isStrong ? 12 : 8;

      ctx.fillStyle = triColor;
      ctx.beginPath();
      if (isLong) {
        ctx.moveTo(triX, sigY - triSize);
        ctx.lineTo(triX - triSize, sigY + triSize);
        ctx.lineTo(triX + triSize, sigY + triSize);
      } else {
        ctx.moveTo(triX, sigY + triSize);
        ctx.lineTo(triX - triSize, sigY - triSize);
        ctx.lineTo(triX + triSize, sigY - triSize);
      }
      ctx.closePath();
      ctx.fill();

      // Strong + marker
      if (isStrong) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', triX, sigY + (isLong ? 4 : 0));
      }

      // Score badge
      ctx.fillStyle = isStrong ? '#26A69A' : 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${sig.score}/4`, triX, sigY + (isLong ? 28 : -22));

      ctx.globalAlpha = 1;
    });

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(phaseB ? 'SWING TRADER \u2014 only 3+ prints' : phaseA ? 'NONE \u2014 all signals print' : 'RAISING THE FLOOR\u2026', w / 2, 24);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('The threshold is the policy. The score is the read.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 4 — StrongVsStandardAnim (S04 — Strong vs Standard On Chart)
// Two rows of price action. Row 1: a Standard signal fires (small label,
// no +). Row 2: a Strong signal fires on a different bar (larger label,
// "+" marker). The hover tooltip flashes on each, with the bottom line
// revealing "Strong — 3/4 factors" only on the Strong example.
// ============================================================
function StrongVsStandardAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 9.0;
    const tt = (t % T) / T;

    // Two side-by-side panels
    const panelW = (w - 30) / 2;
    const panelH = h - 30;
    const padX = 15;
    const padY = 15;

    // Render both panels
    const renderPanel = (px: number, py: number, isStrong: boolean) => {
      const pw = panelW;
      const ph = panelH;

      // Panel bg
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = isStrong ? 'rgba(38, 166, 154, 0.3)' : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      // Title
      ctx.fillStyle = isStrong ? '#26A69A' : 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isStrong ? 'STRONG  \u2014  3/4' : 'STANDARD  \u2014  2/4', px + pw / 2, py + 18);

      // Mini candles
      const candleArea = { x: px + 12, y: py + 32, w: pw - 24, h: ph * 0.55 };
      const nC = 12;
      const cw = candleArea.w / nC;
      // Pseudo-candles, deterministic
      const candlesData = isStrong
        ? [0.5, 0.45, 0.5, 0.55, 0.5, 0.6, 0.55, 0.65, 0.7, 0.6, 0.5, 0.4]
        : [0.5, 0.55, 0.45, 0.5, 0.55, 0.5, 0.6, 0.5, 0.55, 0.5, 0.45, 0.5];
      for (let i = 0; i < nC; i++) {
        const cx = candleArea.x + i * cw + cw / 2;
        const open = candlesData[i] * candleArea.h;
        const close = (i < nC - 1 ? candlesData[i + 1] : candlesData[i]) * candleArea.h;
        const top = Math.min(open, close);
        const bot = Math.max(open, close);
        const isUp = close < open;
        ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
        ctx.fillRect(cx - cw * 0.3, candleArea.y + top, cw * 0.6, Math.max(2, bot - top));
        ctx.strokeStyle = isUp ? '#26A69A' : '#EF5350';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, candleArea.y + top - 4);
        ctx.lineTo(cx, candleArea.y + bot + 4);
        ctx.stroke();
      }

      // The signal label fires at tt > 0.2, persists
      if (tt > 0.2) {
        const sigBar = isStrong ? 7 : 6;
        const sigX = candleArea.x + sigBar * cw + cw / 2;
        const sigY = candleArea.y + candleArea.h - 8;
        const lblW = isStrong ? 38 : 28;
        const lblH = isStrong ? 18 : 14;

        // Label box
        ctx.fillStyle = '#26A69A';
        ctx.fillRect(sigX - lblW / 2, sigY + 6, lblW, lblH);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${isStrong ? 10 : 8}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(isStrong ? 'Long +' : 'Long', sigX, sigY + 6 + lblH * 0.7);

        // Triangle pointer
        ctx.fillStyle = '#26A69A';
        ctx.beginPath();
        ctx.moveTo(sigX, sigY);
        ctx.lineTo(sigX - 4, sigY + 6);
        ctx.lineTo(sigX + 4, sigY + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Tooltip preview at tt > 0.5
      if (tt > 0.5) {
        const ttX = px + 14;
        const ttY = py + ph * 0.65;
        const ttW = pw - 28;
        const ttH = ph * 0.30;

        ctx.fillStyle = 'rgba(20,20,20,0.95)';
        ctx.fillRect(ttX, ttY, ttW, ttH);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ttX, ttY, ttW, ttH);

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Pulse Cross', ttX + 8, ttY + 14);
        ctx.fillStyle = isStrong ? 'rgba(38, 166, 154, 0.85)' : 'rgba(255,255,255,0.4)';
        ctx.fillText('Ribbon: ' + (isStrong ? '\u2713' : '\u2014'), ttX + 8, ttY + 26);
        ctx.fillText('ADX: ' + (isStrong ? '\u2713' : '\u2713'), ttX + 8, ttY + 38);
        ctx.fillStyle = 'rgba(38, 166, 154, 0.85)';
        ctx.fillText('Volume: \u2713', ttX + 8, ttY + 50);
        ctx.fillStyle = isStrong ? 'rgba(38, 166, 154, 0.85)' : 'rgba(255,255,255,0.4)';
        ctx.fillText('Health: ' + (isStrong ? '\u2713' : '\u2014'), ttX + 8, ttY + 62);

        // Strong line only on strong panel
        if (isStrong && tt > 0.65) {
          ctx.fillStyle = '#26A69A';
          ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
          ctx.fillText('\u2795 Strong \u2014 3/4 factors', ttX + 8, ttY + 80);
        }
      }
    };

    renderPanel(padX, padY, false);
    renderPanel(padX + panelW + 15, padY, true);

    // Bottom caption
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same chart. Same algorithm. Different conviction.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}


// ============================================================
// ANIMATION 5 — ContextCascadeAnim (S05 — The 13-Tag Context Cascade)
// 13 tag rows stack vertically. They fall in from the top, one by one,
// in priority order. A signal fires (triangle on left), then a "match
// pointer" sweeps down the list and stops at the first matching tag.
// All lower tags dim out (suppressed). The selected tag glows.
// Cycles through 4 different signal types showing different stops.
// ============================================================
function ContextCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 14.0;
    const tt = (t % T) / T;

    const tags = [
      'Sweep + FVG',
      'Sweep',
      'Breakout',
      'Snap',
      'Exhaustion',
      'S/R Break',
      'At Support',
      'At Spine',
      'At FVG',
      'Overextended',
      'Fade',
      'Trend',
      'Momentum',
    ];

    // 4 scenarios — which tag wins
    const scenarios = [
      { match: 0, name: 'NAS100 4H \u2014 sweep with FVG present' },
      { match: 3, name: 'GBPUSD 15m \u2014 Tension Snap, no S/R nearby' },
      { match: 6, name: 'XAUUSD 1H \u2014 fired at swing low' },
      { match: 11, name: 'EURUSD 1H \u2014 with-trend, no special context' },
    ];

    const scenIdx = Math.floor(tt * 4);
    const scen = scenarios[scenIdx];
    const localT = (tt * 4) % 1;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRIORITY CASCADE', w / 2, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(scen.name, w / 2, 36);

    // Tag list
    const listX = 50;
    const listY = 56;
    const rowH = (h - 76) / tags.length;
    const matchProgress = Math.min(1, localT * 1.8);
    const sweepRow = Math.floor(matchProgress * (scen.match + 1));

    tags.forEach((tag, i) => {
      const y = listY + i * rowH;
      const isMatch = i === scen.match && matchProgress > 0.95;
      const isAbove = i < scen.match && matchProgress > 0.95;
      const isBelow = i > scen.match && matchProgress > 0.95;
      const isSweepHere = i === sweepRow && matchProgress < 0.95;

      // Reveal animation — rows pop in
      const revealStart = i * 0.02;
      if (localT < revealStart) return;

      // Row background
      let bgC = 'rgba(255,255,255,0.03)';
      if (isMatch) bgC = 'rgba(38, 166, 154, 0.18)';
      else if (isBelow) bgC = 'rgba(255,255,255,0.015)';
      else if (isSweepHere) bgC = 'rgba(255,179,0,0.10)';
      ctx.fillStyle = bgC;
      ctx.fillRect(listX, y, w - 2 * listX, rowH - 2);

      // Border
      let borderC = 'rgba(255,255,255,0.05)';
      if (isMatch) borderC = '#26A69A';
      else if (isSweepHere) borderC = 'rgba(255,179,0,0.5)';
      ctx.strokeStyle = borderC;
      ctx.lineWidth = isMatch ? 1.5 : 0.8;
      ctx.strokeRect(listX, y, w - 2 * listX, rowH - 2);

      // Priority number
      ctx.fillStyle = isMatch ? '#26A69A' : isAbove ? 'rgba(255,255,255,0.25)' : isBelow ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, listX + 8, y + rowH / 2 + 3);

      // Tag name
      ctx.fillStyle = isMatch ? '#26A69A' : isBelow ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)';
      ctx.font = isMatch ? 'bold 11px system-ui, -apple-system, sans-serif' : '10px system-ui, -apple-system, sans-serif';
      ctx.fillText(tag, listX + 28, y + rowH / 2 + 3);

      // Status icon right
      ctx.textAlign = 'right';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      if (isMatch) {
        ctx.fillStyle = '#26A69A';
        ctx.fillText('\u2190 MATCH', w - listX - 8, y + rowH / 2 + 3);
      } else if (isAbove) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText('skip', w - listX - 8, y + rowH / 2 + 3);
      } else if (isBelow) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillText('\u2014', w - listX - 8, y + rowH / 2 + 3);
      } else if (isSweepHere) {
        ctx.fillStyle = '#FFB300';
        ctx.fillText('test\u2026', w - listX - 8, y + rowH / 2 + 3);
      }
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('First match wins. Lower tags are suppressed.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}

// ============================================================
// ANIMATION 6 — SweepFvgApexAnim (S06 — Sweep + FVG ★ apex)
// Two stacked panels of price action. A swing high gets swept
// (wick beyond, close back below). Below the swing, an FVG zone is
// already drawn. The synthesis: sweep + FVG = highest-conviction tag.
// A glowing "★ Sweep + FVG" label appears with a shooting star.
// ============================================================
function SweepFvgApexAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    // Phase 1: build chart (0 - 0.3)
    // Phase 2: sweep happens (0.3 - 0.5)
    // Phase 3: synthesis label appears with star (0.5 - 0.8)
    // Phase 4: hold (0.8 - 1.0)

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE APEX TAG \u2014 SWEEP + FVG \u2605', w / 2, 22);

    // Chart area
    const cx = 30;
    const cy = 50;
    const cw = w - 60;
    const ch = h - 100;

    // FVG zone (drawn first, before sweep)
    if (tt > 0.1) {
      const fvgY = cy + ch * 0.55;
      const fvgH = ch * 0.12;
      const fvgFade = Math.min(1, (tt - 0.1) / 0.15);
      ctx.fillStyle = `rgba(38, 166, 154, ${0.18 * fvgFade})`;
      ctx.fillRect(cx, fvgY, cw, fvgH);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 * fvgFade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(cx, fvgY, cw, fvgH);
      ctx.setLineDash([]);

      ctx.fillStyle = `rgba(38, 166, 154, ${0.7 * fvgFade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Bull FVG', cx + 6, fvgY + fvgH * 0.65);
    }

    // Swing high reference line
    const swingY = cy + ch * 0.20;
    if (tt > 0.05) {
      ctx.strokeStyle = 'rgba(255,179,0,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, swingY);
      ctx.lineTo(cx + cw, swingY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,179,0,0.7)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('swing high', cx + cw - 6, swingY - 4);
    }

    // Candles — pre-sweep
    const nC = 14;
    const cwBar = cw / nC;
    const candles = [
      0.45, 0.40, 0.35, 0.30, 0.28, 0.32, 0.36, 0.30, 0.24, 0.22, 0.20, 0.22, 0.30, 0.42,
    ];
    const sweepIdx = 10;

    for (let i = 0; i < nC; i++) {
      if (i === sweepIdx && tt < 0.3) continue;
      const cxBar = cx + i * cwBar + cwBar / 2;
      const yMid = cy + candles[i] * ch;
      const yPrev = i > 0 ? cy + candles[i - 1] * ch : yMid;
      const top = Math.min(yMid, yPrev);
      const bot = Math.max(yMid, yPrev);
      const isUp = yMid < yPrev;
      ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
      ctx.fillRect(cxBar - cwBar * 0.3, top, cwBar * 0.6, Math.max(2, bot - top));
      ctx.strokeStyle = isUp ? '#26A69A' : '#EF5350';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 4);
      ctx.lineTo(cxBar, bot + 4);
      ctx.stroke();
    }

    // The sweep candle — animated wick beyond swing high
    if (tt > 0.3) {
      const sweepFade = Math.min(1, (tt - 0.3) / 0.10);
      const cxBar = cx + sweepIdx * cwBar + cwBar / 2;
      const wickTop = swingY - 12 * sweepFade; // wick above swing
      const bodyTop = cy + 0.30 * ch;
      const bodyBot = cy + 0.40 * ch;

      ctx.fillStyle = '#EF5350';
      ctx.fillRect(cxBar - cwBar * 0.3, bodyTop, cwBar * 0.6, bodyBot - bodyTop);
      ctx.strokeStyle = '#EF5350';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, wickTop);
      ctx.lineTo(cxBar, bodyBot);
      ctx.stroke();
    }

    // The signal label appears post-sweep
    if (tt > 0.55) {
      const labelFade = Math.min(1, (tt - 0.55) / 0.10);
      const lblX = cx + sweepIdx * cwBar + cwBar / 2;
      const lblY = swingY - 30;
      const lblW = 60;
      const lblH = 18;

      // Glow
      const glowR = 24 + 6 * Math.sin(t * 5);
      const grad = ctx.createRadialGradient(lblX, lblY + lblH / 2, 0, lblX, lblY + lblH / 2, glowR);
      grad.addColorStop(0, `rgba(255,179,0,${0.4 * labelFade})`);
      grad.addColorStop(1, 'rgba(255,179,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(lblX - 40, lblY - 10, 80, lblH + 20);

      // Label box
      ctx.fillStyle = `rgba(239, 83, 80, ${labelFade})`;
      ctx.fillRect(lblX - lblW / 2, lblY, lblW, lblH);
      ctx.fillStyle = `rgba(255,255,255,${labelFade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Short +', lblX, lblY + lblH * 0.7);
    }

    // Tag display
    if (tt > 0.65) {
      const tagFade = Math.min(1, (tt - 0.65) / 0.10);
      ctx.fillStyle = `rgba(38, 166, 154, ${0.18 * tagFade})`;
      ctx.fillRect(cx, h - 56, cw, 36);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.5 * tagFade})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx, h - 56, cw, 36);

      ctx.fillStyle = `rgba(255,255,255,${tagFade})`;
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2605  Sweep + FVG  \u2014  highest conviction', w / 2, h - 32);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Liquidity trapped. Magnet waiting. Two reads, one trade.', w / 2, h - 6);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — SynthesisTooltipAnim (S07 — The Synthesis Tooltip)
// Renders the exact NAS100 1D tooltip from Image 1: Tension Snap Snap
// Setup, all 12 atoms scrolling in. The "+ Strong — 3/4 factors" line
// glows at the bottom. This is the operator's window into the synthesis.
// ============================================================
function SynthesisTooltipAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Tooltip box
    const boxX = 30;
    const boxY = 18;
    const boxW = w - 60;
    const boxH = h - 36;

    ctx.fillStyle = 'rgba(15, 15, 15, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // 12 atoms — exact from NAS100 1D Image 1
    const lines: { text: string; color: string; bold?: boolean }[] = [
      { text: 'Tension Snap \u2014 Snap Setup', color: 'rgba(255,255,255,0.95)', bold: true },
      { text: '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', color: 'rgba(255,255,255,0.25)' },
      { text: 'W: Bull \u25B2', color: '#26A69A' },
      { text: 'M: Bull \u25B2', color: '#26A69A' },
      { text: 'Regime: TREND', color: 'rgba(255,255,255,0.85)' },
      { text: 'Ribbon: Not stacked', color: 'rgba(255,255,255,0.5)' },
      { text: 'Pulse: Support 15b YOUNG  2.7 ATR away', color: 'rgba(255,255,255,0.85)' },
      { text: 'ADX: 32 \u2713', color: '#26A69A' },
      { text: 'Volume: 1.18\u00D7 \u2713', color: '#26A69A' },
      { text: 'Momentum: 59% \u25BC DETACHED', color: '#FFB300' },
      { text: 'Tension: 1.4 ATR', color: 'rgba(255,255,255,0.85)' },
      { text: 'Reversion: MODERATE (48%) \u2014 FV 25960.8', color: 'rgba(255,255,255,0.7)' },
      { text: '', color: '' },
      { text: '\u2795 Strong \u2014 3/4 factors', color: '#26A69A', bold: true },
    ];

    const lineH = 14;
    const startY = boxY + 20;
    const padX = boxX + 14;

    // Reveal lines one at a time
    const revealCount = Math.min(lines.length, Math.floor(tt * lines.length * 1.6));

    for (let i = 0; i < revealCount; i++) {
      const ln = lines[i];
      if (!ln.text) continue;
      const y = startY + i * lineH;
      ctx.fillStyle = ln.color;
      ctx.font = `${ln.bold ? 'bold ' : ''}10px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(ln.text, padX, y);
    }

    // Glow on Strong line when revealed
    if (revealCount >= lines.length) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      const lastY = startY + (lines.length - 1) * lineH;
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.2 + 0.4 * pulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX - 6, lastY - 11, boxW - 24, 16);
    }

    // Caption below tooltip
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NAS100 1D \u2014 29 Apr 2026 \u2014 Short + at 27,798', w / 2, h - 6);
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}

// ============================================================
// ANIMATION 8 — ConvergenceAnim (S08 — Convergence Reads)
// Six module rows on the left. Verdicts populate one at a time. As
// they all align on the same direction (BULL), arrows on the right
// converge to a single point — and a "CONVERGENCE" label fires.
// ============================================================
function ConvergenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    const modules = [
      { name: 'Header', verdict: 'BULL TREND', dir: 1 },
      { name: 'Ribbon', verdict: '\u25B2 STACKED', dir: 1 },
      { name: 'Structure', verdict: 'AT SUPPORT', dir: 1 },
      { name: 'Imbalance', verdict: 'NEAR BULL FVG', dir: 1 },
      { name: 'Sweep', verdict: '\u25B2 HOT + FVG \u2605', dir: 1 },
      { name: 'Risk Map', verdict: 'AT SUPPORT', dir: 1 },
    ];

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONVERGENCE \u2014 6 MODULES, 1 DIRECTION', w / 2, 22);

    const listX = 24;
    const listW = w - 48;
    const startY = 50;
    const rowH = 28;

    modules.forEach((mod, i) => {
      const revealStart = i * 0.10;
      if (tt < revealStart) return;
      const revealT = Math.min(1, (tt - revealStart) / 0.10);
      const y = startY + i * rowH;
      ctx.globalAlpha = revealT;

      // Row bg
      ctx.fillStyle = 'rgba(38, 166, 154, 0.10)';
      ctx.fillRect(listX, y, listW, rowH - 4);
      ctx.strokeStyle = 'rgba(38, 166, 154, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, y, listW, rowH - 4);

      // Module name
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(mod.name, listX + 10, y + rowH / 2);

      // Verdict
      ctx.fillStyle = '#26A69A';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(mod.verdict, listX + listW - 12, y + rowH / 2);

      ctx.globalAlpha = 1;
    });

    // Convergence pulse at bottom
    if (tt > 0.7) {
      const fade = Math.min(1, (tt - 0.7) / 0.10);
      const py = h - 30;
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      const r = 50 + 8 * pulse;

      const grad = ctx.createRadialGradient(w / 2, py, 0, w / 2, py, r);
      grad.addColorStop(0, `rgba(38, 166, 154, ${0.5 * fade})`);
      grad.addColorStop(1, 'rgba(38, 166, 154, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, py - r, w, 2 * r);

      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192 ALIGNED. ENGAGE.', w / 2, py + 5);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}

// ============================================================
// ANIMATION 9 — DivergenceAnim (S09 — Divergence Warnings)
// Four module rows. Two say BULL (teal), two say BEAR (magenta).
// A red warning sits at the bottom: "WAIT — modules disagree".
// Cycles through 3 patterns: HTF mismatch, regime conflict, sweep
// counter-trend.
// ============================================================
function DivergenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const patterns = [
      {
        name: 'HTF MISMATCH',
        rows: [
          { name: 'W (HTF1)', verdict: '\u25B2 BULL', dir: 1 },
          { name: 'D (HTF2)', verdict: '\u25BC BEAR', dir: -1 },
          { name: 'Ribbon', verdict: '\u25B2 STACKED', dir: 1 },
          { name: 'Sweep', verdict: '\u25BC HOT', dir: -1 },
        ],
      },
      {
        name: 'REGIME CONFLICT',
        rows: [
          { name: 'Header', verdict: 'BULL TREND', dir: 1 },
          { name: 'Pulse', verdict: 'RESIST FLIPPED', dir: -1 },
          { name: 'Tension', verdict: '\u25BC SNAPPING', dir: -1 },
          { name: 'Bias', verdict: 'FAVOR SHORTS', dir: -1 },
        ],
      },
      {
        name: 'SWEEP COUNTER-TREND',
        rows: [
          { name: 'Ribbon', verdict: '\u25B2 STACKED', dir: 1 },
          { name: 'Structure', verdict: 'AT RESISTANCE', dir: -1 },
          { name: 'Sweep', verdict: '\u25BC HOT', dir: -1 },
          { name: 'Imbalance', verdict: 'AT BEAR FVG', dir: -1 },
        ],
      },
    ];

    const patternIdx = Math.floor(tt * 3);
    const pat = patterns[patternIdx];
    const localT = (tt * 3) % 1;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PATTERN', w / 2, 18);
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(pat.name, w / 2, 36);

    const listX = 30;
    const listW = w - 60;
    const startY = 60;
    const rowH = (h - 130) / pat.rows.length;

    pat.rows.forEach((row, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const y = startY + i * rowH;
      const isUp = row.dir === 1;
      const c = isUp ? '#26A69A' : '#EF5350';
      const bgC = isUp ? 'rgba(38, 166, 154, 0.10)' : 'rgba(239, 83, 80, 0.10)';

      ctx.fillStyle = bgC;
      ctx.fillRect(listX, y, listW, rowH - 4);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, y, listW, rowH - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.name, listX + 10, y + rowH / 2 + 3);

      ctx.fillStyle = c;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(row.verdict, listX + listW - 12, y + rowH / 2 + 3);
    });

    // Warning bar at bottom
    if (localT > 0.5) {
      const fade = Math.min(1, (localT - 0.5) / 0.15);
      const wy = h - 50;
      const wh = 36;
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);

      ctx.fillStyle = `rgba(255, 179, 0, ${0.10 + 0.10 * pulse * fade})`;
      ctx.fillRect(0, wy, w, wh);
      ctx.strokeStyle = `rgba(255, 179, 0, ${0.5 * fade})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, wy, w, wh);

      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u26A0 WAIT \u2014 MODULES DISAGREE', w / 2, wy + 22);
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
}

// ============================================================
// ANIMATION 10 — ConvictionSizingAnim (S10 — Conviction-Tier Sizing)
// Four bars showing risk allocation by conviction score:
// 1/4 = 0% (no engagement), 2/4 = 0.5%, 3/4 = 1.0%, 4/4 (apex) = 1.5%.
// Bars fill in sequence with risk-percentage labels.
// ============================================================
function ConvictionSizingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 8.0;
    const tt = (t % T) / T;

    const tiers = [
      { score: '1/4', label: 'STANDARD WEAK', risk: 0, color: 'rgba(239, 83, 80, 0.6)', advice: 'PASS' },
      { score: '2/4', label: 'STANDARD', risk: 0.5, color: '#FFB300', advice: 'HALF SIZE' },
      { score: '3/4', label: 'STRONG', risk: 1.0, color: '#26A69A', advice: 'STANDARD' },
      { score: '4/4', label: 'APEX', risk: 1.5, color: '#26A69A', advice: 'SIZE UP' },
    ];

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONVICTION-TIER SIZING', w / 2, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('% account risk per trade', w / 2, 40);

    const startY = 60;
    const rowH = (h - 100) / tiers.length;
    const labelX = 20;
    const labelW = 100;
    const barX = labelX + labelW + 10;
    const barWMax = w - barX - 20;
    const barH = rowH - 16;

    tiers.forEach((tier, i) => {
      const revealStart = i * 0.15;
      if (tt < revealStart) return;
      const fillT = Math.min(1, (tt - revealStart) / 0.15);
      const y = startY + i * rowH;
      const barY = y + 6;

      // Score box
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(labelX, barY, labelW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(labelX, barY, labelW, barH);

      ctx.fillStyle = tier.color;
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tier.score, labelX + 10, barY + barH * 0.6);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText(tier.label, labelX + 38, barY + barH * 0.6);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(barX, barY, barWMax, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(barX, barY, barWMax, barH);

      // Bar fill — proportional to risk %
      const fillW = (tier.risk / 1.5) * barWMax * fillT;
      if (tier.risk > 0) {
        ctx.fillStyle = tier.color;
        ctx.fillRect(barX, barY, fillW, barH);
      }

      // Risk label
      ctx.fillStyle = tier.risk > 0 ? '#FFFFFF' : 'rgba(239, 83, 80, 0.85)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tier.risk > 0 ? `${tier.risk}% \u2014 ${tier.advice}` : tier.advice, barX + 8, barY + barH * 0.62);
    });

    // Footer note
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score sets the size. Discipline sets the cap.', w / 2, h - 14);
  }, []);
  return <AnimScene draw={draw} aspectRatio={4 / 3} />;
}

// ============================================================
// ANIMATION 11 — PresetsAsPhilosophiesAnim (S11 — Presets dial)
// 5 presets arranged as cards in a row. Each card highlights its
// min_conviction floor and the trader archetype. Cycles through
// activating each preset, dimming the others.
// ============================================================
function PresetsAsPhilosophiesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const presets = [
      { name: 'TREND', floor: 0, philosophy: 'Catch the wave', color: '#26A69A' },
      { name: 'SCALPER', floor: 0, philosophy: 'Strike from levels', color: '#FFB300' },
      { name: 'SWING', floor: 3, philosophy: 'Wait for alignment', color: '#26A69A' },
      { name: 'REVERSAL', floor: 0, philosophy: 'Catch the snap', color: '#EF5350' },
      { name: 'SNIPER', floor: 3, philosophy: 'Wait for the squeeze', color: '#26A69A' },
    ];

    const activeIdx = Math.floor(tt * 5) % 5;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESETS AS CONVICTION PHILOSOPHIES', w / 2, 24);

    // 5 cards in a row
    const cardW = (w - 60) / 5;
    const cardH = h - 110;
    const startX = 30;
    const startY = 50;

    presets.forEach((p, i) => {
      const x = startX + i * cardW + (i * 0) ; // no gap
      const cardX = x + 4;
      const cardY = startY;
      const cw = cardW - 8;
      const isActive = i === activeIdx;

      // Card bg
      ctx.fillStyle = isActive ? `rgba(38, 166, 154, 0.15)` : 'rgba(255,255,255,0.03)';
      ctx.fillRect(cardX, cardY, cw, cardH);
      ctx.strokeStyle = isActive ? p.color : 'rgba(255,255,255,0.08)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(cardX, cardY, cw, cardH);

      // Preset name
      ctx.fillStyle = isActive ? p.color : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cardX + cw / 2, cardY + 22);

      // Floor display
      ctx.fillStyle = isActive ? p.color : 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${p.floor}`, cardX + cw / 2, cardY + 70);

      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
      ctx.font = '8px system-ui, -apple-system, sans-serif';
      ctx.fillText('min_conv', cardX + cw / 2, cardY + 84);

      // Philosophy line (multi-line)
      const words = p.philosophy.split(' ');
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)';
      ctx.font = '9px system-ui, -apple-system, sans-serif';
      const phLine1 = words.slice(0, 2).join(' ');
      const phLine2 = words.slice(2).join(' ');
      ctx.fillText(phLine1, cardX + cw / 2, cardY + cardH - 26);
      if (phLine2) ctx.fillText(phLine2, cardX + cw / 2, cardY + cardH - 14);
    });

    // Active dial below
    if (true) {
      const active = presets[activeIdx];
      const dialY = h - 36;

      ctx.fillStyle = `rgba(38, 166, 154, ${active.floor === 3 ? 0.18 : 0.05})`;
      ctx.fillRect(0, dialY, w, 28);
      ctx.strokeStyle = active.floor === 3 ? '#26A69A' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, dialY, w, 28);

      ctx.fillStyle = active.floor === 3 ? '#26A69A' : 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        active.floor === 3
          ? `${active.name} \u2192 only Strong (3+) signals print`
          : `${active.name} \u2192 all signals print, operator filters`,
        w / 2,
        dialY + 18
      );
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — TradeTheConvergenceAnim (S13 — Trading the convergence)
// Mini chart with a Strong signal firing at convergence. Shows entry
// price, SL line, three TP rungs (TP1/TP2/TP3) appearing in sequence
// with R-multiples. Demonstrates the trade plan that follows from synthesis.
// ============================================================
function TradeTheConvergenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 10.0;
    const tt = (t % T) / T;

    // Chart area
    const cx = 30;
    const cy = 60;
    const cw = w - 60;
    const ch = h - 100;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRADE THE CONVERGENCE \u2014 ENTRY \u2192 SL \u2192 TP1 \u2192 TP2 \u2192 TP3', w / 2, 22);

    // Y-axis levels
    const entryY = cy + ch * 0.55;
    const slY = cy + ch * 0.78;
    const tp1Y = cy + ch * 0.40;
    const tp2Y = cy + ch * 0.22;
    const tp3Y = cy + ch * 0.08;

    // Mini candles
    const nC = 14;
    const cwBar = cw / nC;
    const candleData = [0.60, 0.55, 0.50, 0.45, 0.50, 0.55, 0.50, 0.55, 0.50, 0.50, 0.55, 0.55, 0.50, 0.55];
    for (let i = 0; i < nC; i++) {
      const cxBar = cx + i * cwBar + cwBar / 2;
      const yMid = cy + candleData[i] * ch;
      const yPrev = i > 0 ? cy + candleData[i - 1] * ch : yMid;
      const top = Math.min(yMid, yPrev);
      const bot = Math.max(yMid, yPrev);
      const isUp = yMid < yPrev;
      ctx.fillStyle = isUp ? '#26A69A' : '#EF5350';
      ctx.fillRect(cxBar - cwBar * 0.3, top, cwBar * 0.6, Math.max(2, bot - top));
      ctx.strokeStyle = isUp ? '#26A69A' : '#EF5350';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxBar, top - 3);
      ctx.lineTo(cxBar, bot + 3);
      ctx.stroke();
    }

    // Entry line (always visible)
    ctx.strokeStyle = '#26A69A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, entryY);
    ctx.lineTo(cx + cw, entryY);
    ctx.stroke();
    ctx.fillStyle = '#26A69A';
    ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ENTRY', cx + cw - 6, entryY - 3);

    // Signal label at entry
    if (tt > 0.05) {
      const labelX = cx + 7 * cwBar + cwBar / 2;
      ctx.fillStyle = '#26A69A';
      ctx.fillRect(labelX - 22, entryY + 6, 44, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Long +', labelX, entryY + 17);
    }

    // SL line at tt > 0.15
    if (tt > 0.15) {
      const fade = Math.min(1, (tt - 0.15) / 0.10);
      ctx.strokeStyle = `rgba(239, 83, 80, ${fade})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, slY);
      ctx.lineTo(cx + cw, slY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(239, 83, 80, ${fade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('SL  \u2014  Swing Low', cx + cw - 6, slY + 12);
    }

    // TP1 at tt > 0.35
    if (tt > 0.35) {
      const fade = Math.min(1, (tt - 0.35) / 0.10);
      ctx.strokeStyle = `rgba(255, 179, 0, ${0.7 * fade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, tp1Y);
      ctx.lineTo(cx + cw, tp1Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255, 179, 0, ${fade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TP1  \u2014  1R  \u2014  scale 50%', cx + cw - 6, tp1Y - 3);
    }

    // TP2 at tt > 0.50
    if (tt > 0.50) {
      const fade = Math.min(1, (tt - 0.50) / 0.10);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.7 * fade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, tp2Y);
      ctx.lineTo(cx + cw, tp2Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TP2  \u2014  2R  \u2014  scale 30%', cx + cw - 6, tp2Y - 3);
    }

    // TP3 at tt > 0.65
    if (tt > 0.65) {
      const fade = Math.min(1, (tt - 0.65) / 0.10);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.7 * fade})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, tp3Y);
      ctx.lineTo(cx + cw, tp3Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(38, 166, 154, ${fade})`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TP3  \u2014  3R  \u2014  trail final 20%', cx + cw - 6, tp3Y - 3);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The synthesis decides if; the Risk Map decides where.', w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — EdgeCaseDialAnim (S14 — Edge cases)
// 4 edge case scenarios on a rotating dial. Each scenario displays
// the modules, the apparent contradiction, and the resolution rule.
// Cycles every 3 seconds.
// ============================================================
function EdgeCaseDialAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const T = 12.0;
    const tt = (t % T) / T;

    const cases = [
      {
        title: '3 BULL + 1 BEAR',
        rule: 'TRADE THE MAJORITY \u2014 STANDARD SIZE',
        ruleColor: '#26A69A',
        rows: ['Header: BULL', 'Ribbon: STACKED', 'Structure: AT SUP', 'Pulse: FLIPPED \u2193'],
        dirs: [1, 1, 1, -1],
      },
      {
        title: 'RECENT FLIP (< 5 BARS)',
        rule: 'WAIT \u2014 LET THE FLIP MATURE',
        ruleColor: '#FFB300',
        rows: ['Pulse: just flipped', 'Ribbon: still old', 'Tension: building', 'Score: 2/4 \u2014 mid'],
        dirs: [1, -1, 1, 0],
      },
      {
        title: 'REGIME MISMATCH',
        rule: 'SKIP \u2014 SIGNAL TYPE WRONG',
        ruleColor: '#EF5350',
        rows: ['Regime: RANGE', 'Signal: Pulse Cross (trend)', 'Ribbon: not stacked', 'Score: 3/4 \u2014 ignore'],
        dirs: [0, -1, 0, 0],
      },
      {
        title: 'APEX IN COUNTER-TREND',
        rule: 'TRADE WITH DISCIPLINE \u2014 TIGHT STOPS',
        ruleColor: '#FFB300',
        rows: ['Sweep + FVG \u2605', 'HTF: aligned counter', 'Risk: high', 'Score: 4/4 \u2014 size cautiously'],
        dirs: [1, -1, 0, 1],
      },
    ];

    const caseIdx = Math.floor(tt * 4);
    const c = cases[caseIdx];
    const localT = (tt * 4) % 1;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EDGE CASE', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(c.title, w / 2, 36);

    // Rows
    const listX = 30;
    const listW = w - 60;
    const startY = 60;
    const rowH = (h - 130) / c.rows.length;

    c.rows.forEach((row, i) => {
      const revealStart = i * 0.10;
      if (localT < revealStart) return;
      const y = startY + i * rowH;
      const dir = c.dirs[i];
      const rc = dir === 1 ? '#26A69A' : dir === -1 ? '#EF5350' : 'rgba(255,255,255,0.5)';
      const bg = dir === 1 ? 'rgba(38, 166, 154, 0.10)' : dir === -1 ? 'rgba(239, 83, 80, 0.10)' : 'rgba(255,255,255,0.04)';

      ctx.fillStyle = bg;
      ctx.fillRect(listX, y, listW, rowH - 4);
      ctx.strokeStyle = rc;
      ctx.lineWidth = 1;
      ctx.strokeRect(listX, y, listW, rowH - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row, listX + 14, y + rowH / 2 + 3);
    });

    // Resolution bar
    if (localT > 0.55) {
      const fade = Math.min(1, (localT - 0.55) / 0.15);
      const ry = h - 50;
      const rh = 36;

      ctx.fillStyle = `${c.ruleColor.replace(')', `, ${fade * 0.18})`).replace('rgb', 'rgba').replace('#26A69A', `rgba(38, 166, 154, ${fade * 0.18})`).replace('#FFB300', `rgba(255, 179, 0, ${fade * 0.18})`).replace('#EF5350', `rgba(239, 83, 80, ${fade * 0.18})`)}`;
      // Manually set fillStyle since the replace logic above is fragile
      const baseCol = c.ruleColor === '#26A69A' ? `rgba(38, 166, 154, ${fade * 0.18})` : c.ruleColor === '#FFB300' ? `rgba(255, 179, 0, ${fade * 0.18})` : `rgba(239, 83, 80, ${fade * 0.18})`;
      ctx.fillStyle = baseCol;
      ctx.fillRect(0, ry, w, rh);

      ctx.strokeStyle = c.ruleColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = fade;
      ctx.strokeRect(0, ry, w, rh);
      ctx.globalAlpha = 1;

      ctx.fillStyle = c.ruleColor;
      ctx.globalAlpha = fade;
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`\u2192 ${c.rule}`, w / 2, ry + 22);
      ctx.globalAlpha = 1;
    }
  }, []);
  return <AnimScene draw={draw} aspectRatio={3 / 4} />;
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
    scenario: 'NAS100 1H \u2014 Pulse Cross Long fires. Tooltip reads: Ribbon Not stacked, ADX 15, Volume 1.35\u00D7 \u2713, Momentum 59% \u2014 DETACHED. Tag: Breakout. Squeeze: 7 bars compressed.',
    prompt: 'What is the conviction score, and what does the Conviction Operator do?',
    options: [
      {
        id: 'a',
        text: 'Score is 4/4 \u2014 size up at apex',
        correct: false,
        explain: 'Two factors fail: Ribbon Not stacked, ADX 15 (below 20). The score is 2/4 (Volume passed, Momentum borderline / passes if treated as &gt; 50%). Far from 4/4.',
      },
      {
        id: 'b',
        text: 'Score is 2/4 \u2014 half size, Breakout context salvages it',
        correct: false,
        explain: 'The score is 2/4 but the Conviction Operator&apos;s rule on 2/4 is skip, not engage at half size. Breakout is a respectable tag (priority 3) but does not override the score-based engagement rule.',
      },
      {
        id: 'c',
        text: 'Score is 2/4 \u2014 skip the trade, threshold not met',
        correct: true,
        explain: 'Correct. Ribbon fail (Not stacked) + ADX fail (15 &lt; 20) = 2 factors lost. Volume passes (1.35\u00D7), Momentum borderline. Score lands at 2/4. Below the 3/4 floor. Conviction Operator skips, regardless of how interesting the Breakout context looks.',
      },
      {
        id: 'd',
        text: 'Score is 3/4 \u2014 engage at standard size',
        correct: false,
        explain: 'Three factor passes would require Ribbon stacked OR ADX above 20. Both failed in this scenario. The score cannot reach 3/4 with two such fundamental failures.',
      },
    ],
  },
  {
    id: 'round-2',
    scenario: 'NAS100 1D \u2014 Tension Snap Short fires. Tooltip reads: W Bull \u25B2, M Bull \u25B2, Regime TREND, Ribbon Not stacked, Pulse Support 15b YOUNG 2.7 ATR away, ADX 32 \u2713, Volume 1.18\u00D7 \u2713, Momentum 59% \u25BC DETACHED. Tag: Snap. \u2795 Strong \u2014 3/4.',
    prompt: 'The chart prints &quot;Short +&quot; with the bigger label. What does the Conviction Operator engage with?',
    options: [
      {
        id: 'a',
        text: 'Pass \u2014 the HTF is bullish, fading the trend is reckless',
        correct: false,
        explain: 'HTF mismatch with the signal direction is an edge case, not a hard pass. The score is 3/4 with Strong marker. The protocol here is to engage with discipline (smaller stops, faster TP1), not skip outright. Passing every counter-HTF Strong signal forfeits real edge.',
      },
      {
        id: 'b',
        text: 'Engage at standard size \u2014 3/4 is the workhorse tier',
        correct: true,
        explain: 'Correct. Score is 3/4, tag is Snap (priority 4), Strong glyph confirms. The HTF mismatch is real but the synthesis layer has scored the trade Strong. Standard size, Risk Map SL, scale at TP1/TP2/TP3. Use a tighter SL than baseline to respect the HTF risk.',
      },
      {
        id: 'c',
        text: 'Engage at apex size (1.5\u00D7) \u2014 Strong + bigger label = full conviction',
        correct: false,
        explain: 'Apex sizing is reserved for 4/4 with a Sweep+FVG context tag. This signal is 3/4 with a Snap tag. Standard size, not apex.',
      },
      {
        id: 'd',
        text: 'Wait for the next bar to confirm, then engage',
        correct: false,
        explain: 'The signal label prints at the close of the qualifying bar. Entry is at that close, not the next-bar confirmation. Waiting past the close changes the risk profile from the one CIPHER scored.',
      },
    ],
  },
  {
    id: 'round-3',
    scenario: 'GBPUSD 4H Command Center: Header BULL TREND, Ribbon \u25B2 STACKED, Structure AT SUPPORT, Imbalance NEAR BULL FVG, Sweep \u25B2 HOT + FVG \u2605, Risk Map AT SUPPORT. A Pulse Cross Long fires with score 3/4 \u2014 Sweep + FVG tag.',
    prompt: 'How many independent modules converge bullish, and what is the appropriate sizing?',
    options: [
      {
        id: 'a',
        text: '4 modules \u2014 standard size',
        correct: false,
        explain: 'Count again: Header (1), Ribbon (2), Structure (3), Imbalance (4), Sweep (5), Risk Map (6) \u2014 all six broadcasting bullish. Six is the rare full-alignment scenario.',
      },
      {
        id: 'b',
        text: '6 modules + apex tag \u2014 size to maximum allowed (cap)',
        correct: true,
        explain: 'Correct. All six Visual Layer modules align bullish AND the cascade returned the apex tag (Sweep + FVG). This is once-or-twice-a-week territory. Conviction sizing protocol: 4/4-apex earns 1.5\u00D7 baseline; 6-module convergence justifies sizing up. Cap is the limit.',
      },
      {
        id: 'c',
        text: '6 modules but only 3/4 score \u2014 engage at standard size',
        correct: false,
        explain: 'The score being 3/4 is below 4/4, true \u2014 but the Sweep+FVG apex tag elevates the trade above standard. Strong with apex earns size-up treatment. The convergence layer corroborates.',
      },
      {
        id: 'd',
        text: '6 modules \u2014 wait, this looks too clean to be real',
        correct: false,
        explain: 'Operator superstition. Six-module convergence with the apex tag IS the high-edge setup. Waiting past it forfeits the rare alignment that justifies the wait between trades.',
      },
    ],
  },
  {
    id: 'round-4',
    scenario: 'XAUUSD 15m: A signal fires with score 4/4. But the panel shows: Header BEAR TREND, Pulse just flipped to RESISTANCE 2 bars ago, Tension SNAPPING, Bias FAVOR SHORTS \u2014 yet the signal is a Long Pulse Cross.',
    prompt: 'The four conviction factors all passed. What is the correct read?',
    options: [
      {
        id: 'a',
        text: 'Engage \u2014 4/4 is 4/4, the score does not lie',
        correct: false,
        explain: 'The score is honest about what the four factors did. But the synthesis layer above the score is broken \u2014 four leading-indicator modules contradict the signal direction. Forcing a 4/4 trade into a divergent panel is the most expensive mistake.',
      },
      {
        id: 'b',
        text: 'Wait \u2014 the panel is divergent, the synthesis is broken',
        correct: true,
        explain: 'Correct. The score is 4/4 but Header / Pulse / Tension / Bias all broadcast bearish. The signal fired into a regime conflict pattern (priority 2 divergence). Conviction Operator&apos;s rule: when modules disagree, do not pick a side. Wait for convergence to return, in either direction.',
      },
      {
        id: 'c',
        text: 'Reverse the trade \u2014 short instead of long',
        correct: false,
        explain: 'Reversing the algorithmic signal is freelancing, not synthesis. CIPHER did not produce a Short signal here. The operator does not invent signals to fit divergence \u2014 they wait for the algorithm to produce one in the new direction.',
      },
      {
        id: 'd',
        text: 'Engage at half size as a hedge',
        correct: false,
        explain: 'Half size is the protocol for 2/4 scores, not for 4/4 in divergent conditions. The right response to divergence is no engagement, not partial engagement. The cap is binary: engage or wait.',
      },
    ],
  },
  {
    id: 'round-5',
    scenario: 'You are running the None preset with min_conviction = 0 (study mode) at session start. Mid-session, an apex Sweep+FVG signal fires at 4/4 on EURUSD 1H. Earlier in the session, three 2/4 signals printed and you skipped them.',
    prompt: 'What is the highest-quality decision sequence here?',
    options: [
      {
        id: 'a',
        text: 'Toggle to min_conviction = 3 now, so weak signals stop distracting you, then engage the apex',
        correct: false,
        explain: 'Toggling the threshold mid-session is the discipline failure mode covered in Mistake 2. Set the floor at session start and live with it. Toggling to 3 retroactively does not change the apex signal; it just hides future weak ones from this session and breaks the contract.',
      },
      {
        id: 'b',
        text: 'Skip the apex \u2014 the threshold was 0 and you should treat it as study mode',
        correct: false,
        explain: 'Threshold = 0 means all signals print, not that no signals are tradeable. Study mode is about visibility, not engagement. An apex signal in study mode is still an apex signal; the operator&apos;s judgment determines whether to engage, not the toggle state.',
      },
      {
        id: 'c',
        text: 'Engage the apex at size-up (1.5\u00D7 baseline within cap), keep threshold at 0',
        correct: true,
        explain: 'Correct. The apex signal earns size-up regardless of the threshold setting. Skipping the earlier 2/4 signals showed correct discipline already. The threshold is a visibility lever, not an engagement lever \u2014 the operator chooses what to trade from what prints. Hold the threshold setting, take the apex.',
      },
      {
        id: 'd',
        text: 'Engage the apex at standard size (1.0\u00D7) since the threshold is 0',
        correct: false,
        explain: 'The threshold setting does not affect sizing. A 4/4 apex signal earns 1.5\u00D7 sizing regardless of whether you are running threshold 0 or 3. Conviction-tier sizing is independent of the visibility filter.',
      },
    ],
  },
];

const quizQuestions: { id: string; question: string; options: { id: string; text: string; correct: boolean }[]; explain: string }[] = [
  {
    id: 'q1',
    question: 'What are the four factors in CIPHER&apos;s conviction score?',
    options: [
      { id: 'a', text: 'Ribbon, Pulse, Tension, Reversion', correct: false },
      { id: 'b', text: 'Ribbon stack, ADX &gt; 20, Volume &gt; 1.0\u00D7, Momentum health &gt; 50%', correct: true },
      { id: 'c', text: 'HTF1, HTF2, Regime, Bias', correct: false },
      { id: 'd', text: 'Score, Tag, Convergence, Divergence', correct: false },
    ],
    explain: 'The four conviction factors test trend structure (Ribbon stack), trend strength (ADX), participation (Volume), and energy (Momentum health). Each pass adds 1 to the score. Each is independent of the others by design.',
  },
  {
    id: 'q2',
    question: 'What is the highest-priority context tag in the 13-level cascade?',
    options: [
      { id: 'a', text: 'Trend (with the trend, no special context)', correct: false },
      { id: 'b', text: 'Sweep + FVG \u2605', correct: true },
      { id: 'c', text: 'Momentum (the default fallback)', correct: false },
      { id: 'd', text: 'Breakout (squeeze release)', correct: false },
    ],
    explain: 'Sweep + FVG is priority 1 in the cascade. It fires when a liquidity sweep AND an active Fair Value Gap align on the same side. Two independent reversal mechanisms confluence \u2014 the apex tag CIPHER produces.',
  },
  {
    id: 'q3',
    question: 'Under the conviction-tier sizing protocol, how is a 2/4 signal handled?',
    options: [
      { id: 'a', text: 'Standard size \u2014 two factors agree, two disagree, balance is fine', correct: false },
      { id: 'b', text: 'Half size \u2014 partial agreement justifies a partial position', correct: false },
      { id: 'c', text: 'Skip \u2014 the geometric ladder skips the 2/4 tier', correct: true },
      { id: 'd', text: 'Apex size \u2014 don\u2019t waste a setup, double up', correct: false },
    ],
    explain: 'The geometric sizing ladder skips 1/4 and 2/4 (both pass), engages standard at 3/4, sizes up at 4/4-apex. Half-sizing 2/4 trades is Mistake 1 \u2014 the geometric structure exists because 2/4 has measurably worse hit rates that the half-size cushion does not compensate.',
  },
  {
    id: 'q4',
    question: 'Which presets force min_conviction = 3 (Strong signals only)?',
    options: [
      { id: 'a', text: 'Trend Trader and Scalper', correct: false },
      { id: 'b', text: 'Reversal and Sniper', correct: false },
      { id: 'c', text: 'Swing Trader and Sniper', correct: true },
      { id: 'd', text: 'All five presets force the 3 floor', correct: false },
    ],
    explain: 'Swing Trader (slow, selective) and Sniper (squeeze-based, patient) bake min_conviction = 3 into their configurations. Trend Trader, Scalper, and Reversal run min_conviction = 0 because their styles need volume of opportunity over selectivity.',
  },
  {
    id: 'q5',
    question: 'When the Command Center shows divergent module verdicts, what is the Conviction Operator&apos;s default response?',
    options: [
      { id: 'a', text: 'Pick the side with more modules and engage at half size', correct: false },
      { id: 'b', text: 'Wait \u2014 divergence is a closed door, do not predict the resolution', correct: true },
      { id: 'c', text: 'Reverse the algorithmic signal', correct: false },
      { id: 'd', text: 'Engage as planned \u2014 the score is the truth, modules just disagree', correct: false },
    ],
    explain: 'Divergence is the synthesis layer telling you the market is undecided. Trading into ambiguity is trading without a thesis. Wait for convergence to return \u2014 it always does, often on the side you would not have predicted. The patient operator captures both directions.',
  },
  {
    id: 'q6',
    question: 'What does the &quot;+&quot; marker on a signal label indicate?',
    options: [
      { id: 'a', text: 'The signal source is a Pulse Cross (vs Tension Snap)', correct: false },
      { id: 'b', text: 'The signal fired during a high-volatility session', correct: false },
      { id: 'c', text: 'Conviction score is &gt;= 3 (Strong threshold crossed)', correct: true },
      { id: 'd', text: 'The signal has a Risk Map plan available', correct: false },
    ],
    explain: 'The &quot;+&quot; glyph is appended to the direction text when bull_conviction or bear_conviction is &gt;= 3. It is the chart-side broadcast of the Strong threshold being crossed. Three or four passes earns the plus; one or two does not.',
  },
  {
    id: 'q7',
    question: 'In the trade plan that follows from a Strong synthesis, what happens at TP1?',
    options: [
      { id: 'a', text: 'Close the entire position \u2014 lock the win', correct: false },
      { id: 'b', text: 'Scale out 50% AND move SL to break-even on the remainder', correct: true },
      { id: 'c', text: 'Add to the position \u2014 momentum confirms the thesis', correct: false },
      { id: 'd', text: 'Widen the stop to give the trade more room', correct: false },
    ],
    explain: 'TP1 (1R) triggers a 50% scale-out and a BE move on the remaining position. This converts the trade from risk-on to risk-free. The remaining 50% scales 30% at TP2 (2R) and trails 20% at TP3 (3R) or beyond. Widening stops or adding to losers are protocol violations.',
  },
  {
    id: 'q8',
    question: 'A Pulse Cross fires with score 3/4 in a regime that says RANGE. What is the Conviction Operator&apos;s correct read?',
    options: [
      { id: 'a', text: 'Engage at standard size \u2014 3/4 is the workhorse tier', correct: false },
      { id: 'b', text: 'Skip \u2014 trend signals in range regimes have lower follow-through', correct: true },
      { id: 'c', text: 'Engage at half size as a hedge against the regime', correct: false },
      { id: 'd', text: 'Wait for the score to reach 4/4 before engaging', correct: false },
    ],
    explain: 'This is the Regime Mismatch edge case from S14. Pulse Cross is a trend-flavored signal type; firing it in a RANGE regime means the score reflects trending bars within a non-trending market. The default rule is skip. Wait for the range break, then engage when the regime catches up to the signal.',
  },
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherConvictionSynthesisPage() {
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
          <span className="text-xs tracking-widest uppercase text-amber-400/60">Level 11 &middot; Lesson 22</span>
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
            Capstone &middot; Conviction Operator
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
          Cipher Conviction Synthesis<br />
          <span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>
            When Modules Agree, Trade.
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-base text-gray-400 leading-relaxed mb-8">
          Six Visual Layer modules. Four conviction factors. Thirteen context tags. One synthesis layer that reads them all and tells the operator whether to engage. This is the lesson that turns a panel of indicators into a single decision.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] p-1 mb-8">
          <ConvictionMeterAnim />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-gray-500">
          <span>16 sections</span>
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
        <h2 className="text-2xl font-extrabold mb-4">The Visual Layer is six sensors. Conviction is the brain.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Across the last six lessons you mastered the Visual Layer arc. Ribbon told you the trend stack. Structure told you where price respects history. Imbalance told you which gaps are still magnets. Sweeps told you when liquidity got trapped. Risk Envelope told you when price was overextended. Risk Map told you what the trade is actually worth.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Each module on its own is a single sense. A blind man with a finger on a column. Useful, but partial. The operator who reads only Ribbon enters when stack is fresh and exits when it inverts &mdash; and gets stopped out by sweeps the Ribbon module never broadcast. The operator who reads only Imbalance enters at every gap and gets caught when Structure says the level above is iron. The operator who reads everything but cannot synthesize is buried under twelve broadcasts and engages on the loudest one.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SIX SENSES, ONE BRAIN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Conviction Synthesis is the layer that reads all six sensors at once and produces a single integer score: how many of them agree right now. That score &mdash; and the qualitative tag that goes with it &mdash; IS the engagement decision. You do not weigh modules manually. CIPHER does it for you on every bar.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE WHOLE IS MORE THAN THE SUM</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Three modules agreeing carries more weight than one module screaming. A Sweep that fires inside an FVG at a Structure level with Ribbon stacked is institutional alignment. A Sweep that fires alone in a range with Ribbon flat is a coin flip. The synthesis layer is what tells you which is which.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS IS A CAPSTONE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lessons 11.16 through 11.21 each taught one module. This lesson teaches how the system reads itself. From here, every remaining lesson assumes you can hold all six modules in your head and read their combined verdict in one glance. That is the Conviction Operator&apos;s contract.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT CHANGES WHEN YOU LEARN THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Before this lesson, you read CIPHER row by row. After this lesson, you read the score and the tag, and the rows are confirmation rather than primary signal. The cognitive load drops by 80%. The discipline rises because the threshold is no longer a gut feel &mdash; it is a number on the chart.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">A WARNING UPFRONT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Synthesis is not magic. It does not predict. A 4/4 signal can fail. A 1/4 signal can be the start of a trend. What synthesis does is tell you, on this bar, how many independent reads agree. The operator&apos;s job is to size to that agreement, not to override it.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Your job is no longer to read modules. It is to read the score, read the tag, and decide. Six lessons of sensory mastery were preparation for this single decision protocol.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S01 — The Groundbreaking Concept */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Groundbreaking Concept</p>
        <h2 className="text-2xl font-extrabold mb-4">When modules agree, trade. When they don&apos;t, wait.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Every operator decision &mdash; entry, sizing, hold, exit &mdash; reduces to a question: how many of my reads point the same direction right now? CIPHER answers this question continuously, on every bar, with a single integer between 0 and 4. That integer is the conviction score, and it is the most honest number on the chart.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The score does not mean the trade will work. It means: of the four conviction factors that CIPHER tests, this many passed. Four passes is institutional alignment. Three passes is a Strong setup. Two is borderline. One or zero is a Standard signal that the system reluctantly prints because you asked it to. The operator&apos;s discipline is to engage at the threshold they chose, and to wait when the system is below it.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <FactorStackAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE FOUR FACTORS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ribbon stacked. ADX above 20. Volume above 1.0&times; average. Momentum health above 50%. Each is a binary test &mdash; pass or fail. The score is the count of passes. There is no weighting, no discretion, no override. The four factors are the consensus engine.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THESE FOUR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each factor is independent of the others and reads a different dimension of the market. Ribbon reads trend structure. ADX reads trend strength. Volume reads institutional participation. Health reads momentum quality. When all four agree, you have four independent confirmations. When two agree, you have two. The math is conservative on purpose.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY A FLOOR, NOT A WEIGHT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER could weight factors (e.g. Ribbon worth 2 points, ADX worth 1) and produce a richer score. It does not. A flat 4-factor count is operator-readable: at a glance, you know how many witnesses just agreed. Weighted scores hide the disagreement. Flat counts expose it.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE THRESHOLD IS THE POLICY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The score is the read. The threshold is the policy. CIPHER lets you set a minimum conviction (0, 3) at which signals print. Below that floor, the system does not draw a label even if the algorithm fired. This is the operator&apos;s engagement protocol expressed as a number. Swing traders run min_conviction = 3. Trend traders run 0 and let everything print.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">A POLICY IS NOT A PREFERENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Setting min_conviction = 3 is not "I prefer strong signals." It is "I will not engage below 3, no matter how good the chart looks." The threshold is a contract you make with yourself before the trade exists. CIPHER enforces it by never showing the rejected signals.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The score is the truth. The threshold is the rule. Trade the agreement, not the signal.
          </p>
        </div>
      </section>


      {/* ============================================================ */}
      {/* S02 — The 4-Factor Engine */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The 4-Factor Engine</p>
        <h2 className="text-2xl font-extrabold mb-4">Ribbon &times; ADX &times; Volume &times; Health.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The conviction engine is four lines of Pine. Each factor is a boolean. The score is the sum. The math is small and the discipline is large. Once you see the four tests written out, you stop arguing with the score &mdash; you read it as the literal count of agreement it is.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Each test is calibrated to its dimension. Ribbon checks for stack &mdash; not slope, not curl, not divergence, just stacked Core/Flow/Anchor in the signal&apos;s direction. ADX above 20 confirms a trending environment. Volume above 1.0&times; the 20-bar average confirms participation. Momentum health above 50% confirms the move has internal energy. Pass each test, add 1.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 &middot; RIBBON STACK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tests <span className="text-amber-400">bull_stack</span> for longs, <span className="text-amber-400">bear_stack</span> for shorts. Both require Core, Flow, and Anchor stacked in the signal&apos;s direction with non-trivial separation. A flat ribbon fails. A diverging ribbon fails. Only a clean directional stack passes. This is the trend dimension.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 &middot; ADX &gt; 20</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The ADX threshold of 20 is the historical inflection between trend and chop. Below 20, directional moves rarely sustain. Above 20, the market has chosen a side and is committing to it. This is the strength dimension &mdash; orthogonal to the Ribbon&apos;s structural read.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 &middot; VOLUME &gt; 1.0&times;</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The volume ratio is current bar divided by the 20-bar average. Above 1.0&times; means the bar is participating &mdash; institutional desks engaging, real flow, real conviction. Below 1.0&times; is retail noise on a weekend. This is the participation dimension.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 &middot; HEALTH &gt; 50%</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Momentum health is CIPHER&apos;s composite oscillator state. Above 50% means the move has internal energy &mdash; rising momentum, expanding range, healthy follow-through. Below 50% is a tired move, susceptible to reversal. This is the energy dimension.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHY INDEPENDENCE MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The four factors are nearly orthogonal. Ribbon can be stacked while ADX is below 20 (early trend). ADX can be high while volume is thin (algo-driven trends). Volume can spike while health is low (climactic exhaustion). Each factor catches what the others miss. Four passes is genuine consensus.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CALIBRATION IS LOCKED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              ADX threshold is 20, not 25. Volume threshold is 1.0&times;, not 1.2&times;. Health threshold is 50%, not 60%. These are CIPHER&apos;s defaults &mdash; chosen to be the lowest legitimate floor for each factor. Tightening them produces fewer Strong signals; loosening them produces noisier ones. The defaults are the production calibration.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE SCORE DOES NOT INCLUDE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Conviction does not include Structure proximity, FVG location, Sweep recency, Risk Envelope state, Risk Map quality, or HTF alignment. Those are read by the context cascade (next section), not the score. The score is the strength reading. The cascade is the situational reading. Both serve the synthesis.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Four orthogonal tests. Four passes is alignment. Three is Strong. Two is wait. The math is small because the discipline must be large.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S03 — The Min Conviction Filter */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Min Conviction Filter</p>
        <h2 className="text-2xl font-extrabold mb-4">The threshold is the policy lever.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Once a signal is scored, CIPHER asks one question before drawing the label: does the score meet the minimum threshold? If yes, print. If no, suppress. The threshold is set by <span className="text-amber-400">min_conviction</span>, an integer that ranges from 0 to 3. It is the operator&apos;s engagement floor expressed as a number.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          With min_conviction = 0 (the default), all signals print. The chart shows every algorithmic fire, including 0/4 and 1/4 weak ones. With min_conviction = 3, only Strong signals print &mdash; 3/4 and 4/4. The rest are suppressed silently. The chart becomes sparse, but every label that survives represents three or four agreeing reads. The threshold is how the operator chooses their own waterline.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <MinConvictionFilterAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THRESHOLD = 0 &middot; SHOW EVERYTHING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              All scored signals print. You see the algorithm&apos;s full output, weak ones included. Useful for chart study, backtesting visual review, and learning what 1/4 and 2/4 setups actually look like. Not for live trading without manual filtering.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THRESHOLD = 3 &middot; STRONG ONLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Only 3/4 and 4/4 signals print. The chart is sparse. Every surviving label is a Strong signal with the &quot;+&quot; marker. This is the production setting for serious operators &mdash; the floor below which CIPHER refuses to show a setup at all.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY NO 1 OR 2 OPTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The threshold ladder skips 1 and 2 by design. A 1/4 floor is barely above 0 &mdash; you would still see most weak signals. A 2/4 floor is mid-conviction &mdash; the noisiest band, where signals fail at high rates. The clean operator levers are 0 (study mode) and 3 (production mode). Anything in between is indecision.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE STRONG-ONLY TOGGLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Outside of presets, CIPHER exposes a manual <span className="text-amber-400">Strong Signals Only</span> toggle in the Inputs panel. Toggling it ON sets min_conviction to 3. Toggling it OFF sets it to 0. This is the binary operator switch &mdash; production mode or study mode, no in-between.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESETS OVERRIDE THE TOGGLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a preset is active, the Strong Signals Only toggle is ignored. Swing Trader and Sniper presets force min_conviction = 3. Trend Trader, Scalper, and Reversal presets force 0. The preset is a complete configuration &mdash; it sets the threshold along with everything else, and overrides any manual setting until you switch back to None.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE SUPPRESSED SIGNALS LOOK LIKE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              They look like nothing. CIPHER does not draw a faint label, a ghost marker, or a debug dot. A signal below threshold is invisible. This is intentional &mdash; the operator should not be able to second-guess the floor by squinting. If the system did not print it, the system did not print it.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Pick a floor. Stick to it. The threshold is not a preference &mdash; it is a contract. Below the floor, you do not engage, no matter how the chart feels.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S04 — Strong vs Standard On Chart */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Strong vs Standard On Chart</p>
        <h2 className="text-2xl font-extrabold mb-4">The label IS the synthesis output.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          CIPHER renders the conviction read directly on the chart through the label itself. A Standard signal prints small. A Strong signal prints larger and carries a &quot;+&quot; marker after the direction word. You do not need to open the tooltip to know the score &mdash; the label glyph tells you at a glance.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          On the NAS100 1D chart, two signals printed within the same week. The Tension Snap short at 27,798 was Strong &mdash; bigger label, &quot;Short +&quot; text, 3/4 factors. The Sweep-context Tension Snap short at 26,983 was Standard &mdash; smaller label, &quot;Short&quot; without the plus, 2/4 factors (volume failed at 0.85&times;). Same algorithm, same direction, different conviction tier. Different position size.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <StrongVsStandardAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE &quot;+&quot; IS NOT DECORATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The plus marker is a literal glyph appended to the direction text when bull_conviction or bear_conviction is &gt;= 3. It is the chart-side broadcast of the conviction threshold being crossed. Three or four passes earns the plus. One or two does not.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SIZE IS THE SECOND CHANNEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Strong labels render at <span className="text-amber-400">size.normal</span> in Pine. Standard labels render at <span className="text-amber-400">size.small</span>. The visual hierarchy is intentional &mdash; the eye is drawn to Strong setups first, and Standard ones recede until you choose to inspect them.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">COLOR IS NOT A CHANNEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Strong and Standard labels share the same color &mdash; teal for longs, magenta for shorts. CIPHER deliberately does not use color to encode conviction, because color already encodes direction. Doubling up creates ambiguity. Glyph and size carry conviction; color carries direction.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WITHOUT min_conviction = 3, BOTH PRINT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At threshold 0, both labels appear on the chart with their respective sizes and glyphs. The operator sees the contrast directly. At threshold 3, only the Strong label survives &mdash; the Standard one is suppressed entirely. The same algorithm produces different chart outputs depending on the policy.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP CONFIRMS THE LABEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Hovering a Strong label reveals a tooltip that ends with <span className="text-amber-400">&#10010; Strong &mdash; X/4 factors</span>. Hovering a Standard label produces the same tooltip body but without the Strong line. The tooltip is the long-form synthesis read &mdash; the label is the at-a-glance summary. They reinforce each other.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE NAS100 1D EXAMPLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              On 29 Apr the daily printed Short + at 27,798 with full 3/4 factors and a Snap context tag. Three days earlier the same chart printed Short at 26,983 with only 2/4 factors (volume 0.85&times; failed) and a Sweep tag. The operator running min_conviction = 3 saw only the first label. The operator running 0 saw both and could compare directly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SIZING FOLLOWS THE LABEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The discipline is to size to the label glyph. Strong with plus = full size. Standard without = half size, or pass entirely. The label is a sizing instruction, not an entry suggestion. CIPHER tells you the conviction; you translate that into position size by your own rule.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The plus is information. The size is information. Read them before you read the price. Strong gets full size; Standard gets half or none.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S05 — The Context-Tag Cascade */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Context-Tag Cascade</p>
        <h2 className="text-2xl font-extrabold mb-4">Thirteen tags, first match wins.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          The conviction score is the strength reading. The context tag is the situational reading. CIPHER runs a 13-level priority cascade on every signal &mdash; testing each tag in order, and stopping at the first one that matches. The tag that wins is the one printed in the tooltip and the one that determines the operator&apos;s read of why the signal fired.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The cascade is hard-coded by importance. Sweep+FVG is tested first because it represents the strongest two-module confluence in CIPHER. Trend-with-trend is tested second-to-last because it is the most generic context. Momentum is the fallback &mdash; the tag printed when nothing more specific applies. Lower tags are not weaker signals; they are signals where no special structural condition was active.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ContextCascadeAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 1 &middot; SWEEP + FVG</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The signal fired within bars of a liquidity sweep AND inside an active Fair Value Gap. Two reversal mechanisms align. This is the apex tag &mdash; the highest-conviction context the cascade can broadcast. Tested first because if it matches, no other tag is needed.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 2 &middot; SWEEP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Liquidity was swept recently but no FVG is involved. Still a strong reversal context &mdash; trapped traders are in pain. Tested second because the FVG presence elevates it to apex; without the FVG, it stands alone at priority 2.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 3 &middot; BREAKOUT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The squeeze just confirmed AND the squeeze had been compressed for more than 5 bars. Energy released. The Coil Operator&apos;s lesson territory. This tag captures the structural release context &mdash; energy was building, now it is spending.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 4 &middot; SNAP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The signal source is a Tension Snap (TS), not a Pulse Cross. TS signals are reversal-flavored by design &mdash; they fire when tension reaches a stretch threshold. The tag identifies the signal type rather than a structural condition.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 5 &middot; EXHAUSTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A Tension Snap fired within 3 bars of momentum entering an EXHAUSTED or DYING state. The trend is running out of internal energy. Reversion-context for reversal traders. Captured here because exhaustion is rare enough to matter when present.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 6 &middot; S/R BREAK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The signal fired within 3 bars of a structural support or resistance level breaking. Continuation context &mdash; the break already happened, the signal is the entry confirmation. The Structure Operator&apos;s lesson reads this directly.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 7-9 &middot; AT-LEVEL TAGS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">At Support / At Resistance</span> (priority 7) fires when the signal hit a tracked S/R level. <span className="text-amber-400">At Spine</span> (priority 8) fires when it hit the dynamic momentum spine. <span className="text-amber-400">At FVG</span> (priority 9) fires when it hit an active imbalance. All three are structural reads &mdash; the signal happened where price has historical or mechanical reason to react.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 10 &middot; OVEREXTENDED</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Risk Envelope reports OVEREXTENDED &mdash; price is far from fair value. Reversion context &mdash; the move has stretched and a snap-back is statistically due. The Risk Envelope Operator&apos;s lesson territory.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRIORITY 11-13 &middot; FADE / TREND / MOMENTUM</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">Fade</span> (11) is a counter-trend Pulse Cross with low health &mdash; weak and contrarian. <span className="text-amber-400">Trend</span> (12) is a with-trend Pulse Cross with stack &mdash; clean continuation. <span className="text-amber-400">Momentum</span> (13) is the fallback for everything else &mdash; no special context, just the base read. Most signals on most charts end up at 12 or 13.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The tag tells you why. The score tells you how strong. Both feed the decision. A 4/4 Momentum signal is weaker than a 3/4 Sweep+FVG signal because the context dimension matters.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S06 — Sweep + FVG ★ Apex */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Sweep + FVG &#9733; Apex</p>
        <h2 className="text-2xl font-extrabold mb-4">The highest-conviction tag in the cascade.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          One context tag sits above all others: <span className="text-amber-400">Sweep + FVG</span>. It fires when a signal aligns with a recent liquidity sweep AND an active Fair Value Gap on the same side. Two independent reversal mechanisms agree on the same level at the same time. The result is the highest-conviction setup CIPHER is capable of identifying without weighting factors manually.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The mechanism is straightforward. A swing high gets swept &mdash; price wicks above, then closes back below. The wick&apos;s extension trapped late longs. Below the swing, an FVG zone marks where price moved with conviction earlier &mdash; an unfilled imbalance. When a Short signal fires near both, the trapped longs become forced sellers and the FVG becomes a magnet. Two confluences. One trade.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <SweepFvgApexAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS COMBINATION SPECIFICALLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sweeps and FVGs are read by different modules with different mechanics. Sweeps read liquidity grabs &mdash; instantaneous events. FVGs read directional impulses &mdash; lingering conditions. When both align, the signal sits at an intersection of two unrelated structural reads. The probability of independence makes the confluence meaningful.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE STAR GLYPH IS CHART-SIDE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the Sweep row in the Command Center detects this confluence, it broadcasts &quot;HOT + FVG &#9733;&quot; as the row verdict. The star is the visible signature. If you see the star in the panel, you are looking at the apex tag in the cascade. No other condition produces it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">NOT EVERY SWEEP HAS AN FVG</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A clean sweep without a nearby FVG is still tag #2 in the cascade (Sweep). It is a strong context. But it is not the apex. The discipline is to know the distinction &mdash; do not call a Sweep a Sweep+FVG just because the chart looks pretty. The Pine code tests for both.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">RARITY IS THE FEATURE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              On most charts on most days, no Sweep+FVG signal fires. The conditions are restrictive on purpose. When one does fire, it represents the rare alignment that justifies aggressive sizing. The discipline is to treat the rarity as a virtue &mdash; CIPHER does not water down its apex tag to print more often.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SIZE FULLY AT APEX</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The conviction-tier sizing protocol (covered in S10) treats Sweep+FVG signals as the largest size the operator allows themselves. If your standard Strong size is 1% risk, your Sweep+FVG size is 1.5% or whatever your discipline tolerates. The math is on your side &mdash; the cascade has already done the filtering.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">FAILURE MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a Sweep+FVG signal fails, it tends to fail fast. The mechanism is binary &mdash; either the trapped traders capitulate and the FVG fills, or higher-timeframe momentum overwhelms both reads and breaks the level cleanly. There is little in-between. Tight stops, fast exits, no negotiation.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Apex is rare and rare is good. When the star prints, you have permission to size up. When it does not, the Sweep alone is still a strong tag, but not the apex. Honor the distinction.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S07 — The Synthesis Tooltip */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Synthesis Tooltip</p>
        <h2 className="text-2xl font-extrabold mb-4">One hover, every module reports in.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          When you hover any signal label, CIPHER renders a tooltip that consolidates the entire synthesis read into one block of text. Twelve atoms minimum. Every Visual Layer module&apos;s state at the moment the signal fired. The conviction score. The context tag. And the Risk Map if enabled. This is the operator&apos;s window into how the system saw the trade.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The tooltip is not a summary. It is the raw multi-module read. Each line broadcasts one module&apos;s verdict, and the order is fixed: signal source and tag, then HTF1/HTF2/Regime/Ribbon/Pulse/ADX/Volume/Momentum/Tension/Reversion/Squeeze, then conviction/Strong line, then Risk Map. Reading top to bottom is reading the synthesis layer top to bottom.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <SynthesisTooltipAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">LINE 1 &middot; SOURCE + TAG</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">Tension Snap &mdash; Snap Setup</span>. The signal source (Pulse Cross or Tension Snap) and the winning context tag from the cascade. This is the synthesis headline &mdash; everything below is supporting evidence.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LINES 3-4 &middot; HTF ATOMS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">W: Bull &#9650;</span> and <span className="text-amber-400">M: Bull &#9650;</span>. The two higher-timeframe directions, two levels up from the chart timeframe. On a 1D chart, this is Weekly and Monthly. Aligned HTF means both broadcasts agree; conflicting HTF is one of the divergence patterns covered in S09.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LINE 5 &middot; REGIME</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">Regime: TREND</span>. The Cipher Regime Engine&apos;s read. Possible values: TREND, RANGE, COMPRESSION, EXPANSION. The regime tells you what kind of market the trade is being entered into &mdash; the same signal in TREND is materially different from the same signal in RANGE.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LINES 6-7 &middot; RIBBON + PULSE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">Ribbon: Not stacked</span> reports the trend stack state directly. <span className="text-amber-400">Pulse: Support 15b YOUNG 2.7 ATR away</span> reports Pulse line state, hold duration, maturity, and distance. Two adjacent reads that complement each other &mdash; structure and dynamic level.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">LINES 8-10 &middot; THE FOUR FACTORS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">ADX: 32 &#10003;</span> reports the value with a check when above 20. <span className="text-amber-400">Volume: 1.18&times; &#10003;</span> reports the ratio with a check when above 1.0. <span className="text-amber-400">Momentum: 59% &#9660; DETACHED</span> reports the health value with arrow direction. Three of the four conviction factors are visible inline. The Ribbon factor is read from line 6.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LINES 11-13 &middot; STATE ATOMS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">Tension: 1.4 ATR</span>, <span className="text-amber-400">Reversion: MODERATE (48%) &mdash; FV 25960.8</span>, <span className="text-amber-400">Squeeze: N bars compressed</span> (when active). These are the situational atoms &mdash; how stretched is price, where is fair value, is the squeeze loaded. Used by the cascade to determine eligibility for tags like Overextended and Breakout.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE STRONG LINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-amber-400">&#10010; Strong &mdash; 3/4 factors</span>. The conviction line. Only present when score is &gt;= 3. This line is the bottom of the synthesis and the most operator-relevant atom &mdash; if you read nothing else, read this.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE RISK MAP BLOCK</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When the Risk Map toggle is on, the tooltip ends with the entry, SL, three TP levels, and per-unit risk. That is the Risk Map Operator&apos;s lesson territory &mdash; the trade plan rendered into the synthesis tooltip itself. Conviction tells you whether to engage; Risk Map tells you exactly where.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            One hover. Every module. The tooltip is the synthesis. If you cannot read the tooltip top to bottom and recite each module&apos;s verdict, you have not yet earned the Conviction Operator badge.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S08 — Convergence Reads */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Convergence Reads</p>
        <h2 className="text-2xl font-extrabold mb-4">When three or more modules agree, you have a thesis.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Convergence is the moment when independent modules broadcast compatible verdicts simultaneously. Header bullish, Ribbon stacked, Structure at support, Imbalance near a bull FVG, Sweep hot with FVG star, Risk Map at support &mdash; six modules pointing the same way. This is not coincidence. It is what alignment looks like in real time on the panel.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The operator&apos;s read of convergence is qualitative more than quantitative. The score and tag handle the binary engagement decision. Convergence handles the conviction layer above the score &mdash; how confident am I in the thesis? Three converging modules means you have a thesis you can defend. Five or six converging means you have a thesis you can size aggressively.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ConvergenceAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">2 MODULES = WAIT FOR MORE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Two modules agreeing is not convergence &mdash; it is correlation. Header and Ribbon often agree because they read overlapping inputs. Two-module agreement is the baseline; it tells you the trend direction is identifiable, not that the setup is alignable. Wait for at least one more independent module before calling it convergence.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">3 MODULES = TRADEABLE THESIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Three independent modules broadcasting the same direction is the minimum for what the Conviction Operator calls a thesis. Add Structure or Imbalance or Sweep to the trend modules and you have three orthogonal reads &mdash; each tested by different inputs. Three-module convergence is the floor for engaging at standard size.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">4-5 MODULES = STRONG THESIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Four or five-module convergence is the territory where conviction sizing kicks in. The synthesis layer has multiple independent witnesses. Failure is still possible &mdash; markets do not respect thesis &mdash; but the asymmetry is on your side. Increase size by 25-50% over baseline.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">6 MODULES = SIZE FULLY</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              All six Visual Layer modules pointing the same direction is rare and meaningful. When it happens, the chart is broadcasting a once-or-twice-a-week setup. This is when conviction operators size to their maximum allowed risk. The math is in your favor &mdash; six independent reads do not collude by accident.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">CONVERGENCE IS NOT A SCORE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER does not output a convergence number. There is no row that says "5 of 6 modules agree." The operator reads convergence by scanning the panel themselves. This is intentional &mdash; convergence is a qualitative read that benefits from the operator&apos;s own filter, not an algorithmic count that hides individual disagreements.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TIME DIMENSION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Convergence at signal-fire time is one read. Sustained convergence over multiple bars is another. A signal that fires at a 6-module convergence point and then sees the convergence persist for the next several bars is dramatically stronger than a signal that fires at convergence and then sees one or two modules immediately drop out.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CONVERGENCE WITHOUT A SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sometimes the panel converges but no signal fires &mdash; the algorithmic conditions for Pulse Cross or Tension Snap are not met. This is fine. The Conviction Operator does not invent signals to fit convergence. Wait for the signal CIPHER produces. If it does not come, the convergence was a setup that did not complete.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Three modules is your floor. Five-plus is your size-up signal. Convergence is the qualitative layer on top of the score &mdash; both feed the decision.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S09 — Divergence Warnings */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Divergence Warnings</p>
        <h2 className="text-2xl font-extrabold mb-4">When modules contradict, the synthesis is broken.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Divergence is the inverse of convergence: independent modules broadcasting opposing verdicts at the same moment. HTF1 says bull, HTF2 says bear. Header says trend, Pulse says flipped. Ribbon stacked bull, Sweep hot bear. The synthesis layer cannot resolve. The operator&apos;s read of divergence is a wait signal &mdash; not a fade signal, not a contrarian buy &mdash; a wait.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The temptation when modules disagree is to pick a side. The discipline is to recognize that disagreement among independent reads means the market is genuinely undecided. Trading into that ambiguity is trading without a thesis. The Conviction Operator&apos;s rule is simple: when synthesis fails, the answer is no engagement, not creative interpretation.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <DivergenceAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 1 &middot; HTF MISMATCH</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Weekly bull, Daily bear, or vice versa. The two higher-timeframe directions disagree. The chart timeframe is caught between conflicting macro reads. Even if every other module agrees on direction, the HTF mismatch warns that one of the higher timeframes will eventually win and the local read may flip with it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 2 &middot; REGIME CONFLICT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Header broadcasts BULL TREND but Pulse just flipped to RESISTANCE, Tension is SNAPPING, and Bias says FAVOR SHORTS. The Header is reading the past; the leading-indicator modules are reading the imminent reversal. This is the most common divergence on tops and bottoms &mdash; the trend module trails while the reversal modules lead.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 3 &middot; SWEEP COUNTER-TREND</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ribbon stacked bull, but Sweep hot bear, Structure at resistance, and Imbalance at a bear FVG. The trend modules say up; the reversal-context modules say down. This pattern often precedes structural failures &mdash; the trend continues for one or two bars and then snaps.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN 4 &middot; SPLIT VOTE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Three modules bull, three bear, no clear majority. Different from the other patterns &mdash; here the market has no decisive read in either direction. This is range behavior, often during news compression. The Conviction Operator&apos;s response is the same: wait for the resolution, do not predict it.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">DIVERGENCE IS DATA</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A divergent panel is not a malfunctioning panel. It is a panel telling you the truth: at this moment, the system has no synthesis. Reading divergence honestly is more valuable than forcing a synthesis that is not there. The operator who waits through divergence saves capital for the convergence that follows.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DIVERGENCE PRECEDES CONVERGENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Markets do not stay in divergence indefinitely. The leading-indicator modules eventually win, or the trend modules eventually rebroadcast. Either way, convergence returns &mdash; just on a different direction than before. The divergence period is the operator&apos;s study window, not their entry window.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">A SIGNAL CAN FIRE INTO DIVERGENCE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              CIPHER does not check convergence before firing a signal. The algorithm fires when its conditions are met. A Pulse Cross can fire while the panel is divergent &mdash; the signal is real, the score may even be Strong, but the synthesis layer above it is broken. The operator&apos;s discipline is to suppress engagement at the synthesis level even when the algorithm engages at the signal level.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE ONE EXCEPTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When divergence is between leading and trailing modules &mdash; e.g. Header trailing while Pulse, Tension, and Bias all flip &mdash; the leading-module side often wins. Aggressive operators take counter-Header trades when three or more leading modules align. This is an advanced read, not a rule, and it requires the operator to have demonstrated they can read leading vs trailing first.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            When modules disagree, do not pick a side. Wait. Divergence is a closed door &mdash; convergence is the door opening on either side. The patient operator captures both directions; the impatient one capitalizes on neither.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S10 — Conviction-Tier Sizing */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Conviction-Tier Sizing</p>
        <h2 className="text-2xl font-extrabold mb-4">The score sets the size. The discipline sets the cap.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          A 4/4 signal is not three times more profitable than a 1/4 signal &mdash; but the operator&apos;s expected value is materially higher. Conviction-tier sizing is the protocol that translates the score into position size, so risk allocation tracks the synthesis layer. The math is simple. The discipline is everything.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The default protocol is geometric. 1/4 = pass entirely. 2/4 = half size. 3/4 = standard size. 4/4 (apex with Sweep+FVG context) = up to 1.5&times; standard. The exact percentages depend on the operator&apos;s base risk per trade, but the proportional structure stays fixed. If your standard risk is 1% per trade, your apex trade is 1.5% and your 2/4 trade is 0.5%.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <ConvictionSizingAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">1/4 &middot; THE PASS TIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 1/4 conviction, only one factor passed. This is the territory where Pulse Cross fires in a chop without volume, or Tension Snap fires without ADX support. The signal is real. The synthesis is broken. The Conviction Operator does not engage at this tier &mdash; not at half size, not at quarter size, not at all.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">2/4 &middot; THE HALF-SIZE TIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 2/4, two factors passed but two failed. The trade is borderline. Half size respects the partial agreement without committing standard capital. This tier is also where many learning trades happen &mdash; the operator engages small to test their read against the algorithm&apos;s ambivalence.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">3/4 &middot; THE STANDARD TIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 3/4, the signal earned the &quot;+&quot; marker. The synthesis is positive. Three factors confirm. Engage at full base risk. This is the workhorse tier &mdash; most Strong signals across most charts land here, and the operator who systematically trades 3/4 setups at standard size builds a robust edge.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">4/4 + APEX TAG &middot; THE SIZE-UP TIER</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 4/4 with a Sweep+FVG context tag, every factor passed AND the cascade returned the apex tag. Two independent layers of synthesis confirm. Increase size by 25-50% &mdash; the math is on your side. Do not exceed your maximum allowed risk per trade regardless. Conviction sizes up; discipline caps the up.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">WHY GEOMETRIC, NOT LINEAR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Linear sizing (0.25%, 0.50%, 0.75%, 1.00%) overweights weak signals and underweights strong ones. Geometric sizing (0%, 0.5%, 1.0%, 1.5%) skips the weak tier and rewards the strong tier. The Conviction Operator&apos;s edge comes from concentrating risk where the synthesis is highest. Linear sizing dilutes that edge.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CAP IS NON-NEGOTIABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              No matter how good the convergence, no matter how rare the apex, the operator&apos;s maximum risk per trade is fixed. If your cap is 2%, an apex signal sizes to 1.5% (within cap). If your cap is 1%, an apex signal sizes to 1% (at cap). Conviction multiplies up to the cap and stops. The cap is your account&apos;s contract with itself.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TIER MIGRATION DURING THE TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A trade entered at 3/4 can degrade to 2/4 mid-position &mdash; one factor flips off as the move progresses. The conviction tier protocol does not call for adding to or trimming the position based on tier migration. Size is set at entry. Exits follow the Risk Map. Synthesis informs entry; mechanics inform management.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Skip 1/4. Half-size 2/4. Standard 3/4. Size up at apex 4/4. Cap everything. The ladder is geometric because conviction is non-linear.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S11 — Presets As Conviction Philosophies */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Presets As Conviction Philosophies</p>
        <h2 className="text-2xl font-extrabold mb-4">Each preset chooses its own threshold.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          CIPHER&apos;s preset system is not just a UI shortcut. Each preset bakes a min_conviction floor into its configuration along with the visual layers and signal types. Picking a preset is picking a conviction philosophy. The trader chooses the persona; the persona chooses the threshold.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          Two presets force min_conviction = 3 &mdash; Swing Trader and Sniper. Three force min_conviction = 0 &mdash; Trend Trader, Scalper, and Reversal. The split reflects the trader archetype each preset serves. Swing and Sniper are slow, selective styles where Strong signals justify the wait. Trend and Scalper run high-frequency styles where filtering happens at the operator&apos;s discretion. Reversal is permissive because reversal trades often fire at exhaustion before the four factors fully align.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <PresetsAsPhilosophiesAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TREND TRADER &middot; FLOOR 0 &middot; CATCH THE WAVE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ribbon + Pulse + Trend candles. All signals print. The operator trades the trend and uses the panel to filter visually &mdash; not the algorithm. This works because trend traders engage with the trend, where most signals naturally align with Ribbon stack anyway.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SCALPER &middot; FLOOR 0 &middot; STRIKE FROM LEVELS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Structure + Imbalance + Pulse (tight) + Composite candles. All signals print. Scalpers need volume of opportunity &mdash; filtering at min_conviction = 3 would cut their setup count below threshold. The Scalper trusts the structural context (S/R + FVG) over the conviction score.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">SWING TRADER &middot; FLOOR 3 &middot; WAIT FOR ALIGNMENT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ribbon + Spine + Pulse (wide). Strong signals only. The Swing Trader holds for days &mdash; selectivity matters more than count. Min_conviction = 3 ensures that only setups with genuine multi-factor agreement reach the chart, justifying the longer hold.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">REVERSAL &middot; FLOOR 0 &middot; CATCH THE SNAP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Spine + Imbalance + Risk Envelope + Tension candles. All signals print. Reversal signals fire near exhaustion, where Ribbon stack is often broken and ADX has weakened &mdash; setting min_conviction = 3 would suppress the very signals reversal traders are hunting. The preset compensates by emphasizing Tension and Reversion in the visual layer.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">SNIPER &middot; FLOOR 3 &middot; WAIT FOR THE SQUEEZE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pulse (widest) + Coil. Strong signals only. The Sniper waits for compression, then strikes when the squeeze releases with full conviction. Min_conviction = 3 plus the visual emphasis on the Coil module produces a setup count of two or three per week per chart &mdash; ideal for the patient operator.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE &middot; NO SIGNALS &middot; PURE CHART READING</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Structure + Imbalance + Sweeps. Signal type is set to &quot;Visuals Only&quot; &mdash; no labels print regardless of conviction. This preset is for chart study and discretionary trading from raw structure. The conviction synthesis is still computed internally; it just is not broadcast as labels.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESETS LOCK THE THRESHOLD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a preset is active, the manual Strong Signals Only toggle is ignored. The preset&apos;s baked-in floor wins. Switching to None unlocks manual control. This is intentional &mdash; presets are complete configurations, and inconsistent overrides defeat their purpose.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CHOOSING A PRESET IS CHOOSING A LIFESTYLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Swing Trader expects you to wait. Scalper expects you to engage often. Sniper expects you to be patient. Reversal expects you to be contrarian. Pick the preset that matches your actual cognitive style &mdash; not your aspirational one. The conviction floor will hold you to it.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            The preset chooses the threshold. The threshold chooses the discipline. The discipline produces the edge. Pick the preset that matches the trader you actually are.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S12 — The Strong-Only Toggle */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Strong-Only Toggle</p>
        <h2 className="text-2xl font-extrabold mb-4">The manual override for operators who run None.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Operators who run the None preset manage their own configuration end to end. For them, CIPHER exposes a binary <span className="text-amber-400">Strong Signals Only</span> toggle in the Inputs panel. ON sets min_conviction = 3. OFF sets min_conviction = 0. There is no middle option, no slider, no per-asset override. Binary by design.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The toggle is the manual operator&apos;s engagement contract. When it is ON, the chart shows only Strong setups. When it is OFF, the chart shows everything. Toggling it during a trading session is allowed but discouraged &mdash; the discipline benefit comes from setting the floor at session start and respecting it through the session.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ON AT SESSION START</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Production discipline. The chart is sparse, the setups that print are pre-filtered to 3+ factors, and the operator&apos;s decision per setup is binary engage-or-skip. This is the production setting for live capital. ON is the default once the operator is past the learning phase.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">OFF FOR STUDY MODE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Chart study. The full algorithmic output prints. The operator can compare 1/4 / 2/4 / 3/4 / 4/4 setups side by side and develop intuition for what each tier looks like in real conditions. Learning happens at OFF; capital deploys at ON.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DO NOT TOGGLE DURING A TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Switching from ON to OFF mid-position to see the full picture is the operator looking for confirmation of a bad trade. Switching from OFF to ON mid-position to suppress a contradictory weak signal is the operator hiding from the data. Both are anti-discipline. Set the toggle once per session and live with it.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">PRESETS OVERRIDE THE TOGGLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When any preset is active, the manual toggle is ignored. The preset&apos;s baked-in floor takes precedence. To use the toggle at all, the preset must be None. This prevents accidental conflicts between preset discipline and manual override.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TOGGLE STATE PERSISTS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              TradingView saves the toggle state with the chart. Re-opening the chart restores the last setting. This is helpful but also a trap &mdash; an OFF setting from a study session can persist into a live session if the operator does not check at start. Glance at the toggle when you load the chart.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">NO INTERMEDIATE FLOOR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The toggle does not expose a min_conviction = 1 or min_conviction = 2 option. The choice is 0 or 3. CIPHER deliberately does not give operators a half-discipline option &mdash; it would dilute the meaning of the floor. If 3 feels too restrictive, the answer is to switch presets, not to dial back the threshold.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            ON for live. OFF for study. Toggle once at session start. Live with it through the session. The toggle is your engagement contract written in one switch.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S13 — Trading The Convergence */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Trading The Convergence</p>
        <h2 className="text-2xl font-extrabold mb-4">From synthesis to position management.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Once the synthesis layer says engage, the trade plan is mechanical. Entry at the signal close (or next-bar open if your protocol allows). Stop loss at the Risk Map level. TP1 at 1R. TP2 at 2R. TP3 at 3R or trail. Scaling at 50% / 30% / 20% across the three TPs. The Conviction Operator does not freelance the management &mdash; the synthesis decided if; the Risk Map decides where.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The discipline is in not improvising. A 4/4 apex signal with strong convergence does not entitle the operator to widen the stop or chase a fourth TP. The plan is the plan. Conviction tells you which trades to take and how much to risk. Mechanics tell you how to manage. Mixing the two is how operators give back the edge they earned.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <TradeTheConvergenceAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">ENTRY &middot; AT THE LABEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The signal label prints at the close of the qualifying bar. Entry is at that close, or at the next-bar open if your execution protocol requires confirmation. Do not chase past the close &mdash; the synthesis read was at the close, and entries beyond it have a different risk profile than the one CIPHER scored.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">STOP LOSS &middot; FROM THE RISK MAP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Risk Map module produces an SL using one of three methods: Structure (recent swing), Pulse (line invalidation), or ATR (fixed distance). The synthesis tooltip shows the exact SL price. Do not override it. The Risk Map Operator&apos;s lesson covers why each method is calibrated &mdash; trust that calibration.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TP1 &middot; 1R &middot; SCALE 50%</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 1R (one risk unit profit), close half the position. This locks in a guaranteed 0.5R on the trade. If the remaining half stops out at break-even (BE move at TP1 hit), the trade ends at +0.5R. If it runs further, the locked-in profit becomes the floor for higher payouts.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">TP2 &middot; 2R &middot; SCALE 30%</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 2R, close another 30%. The position is now 80% closed at progressively better prices, locking in approximately 1.1R total profit. The remaining 20% runs for the trail.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">TP3 &middot; 3R OR TRAIL FINAL 20%</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              At 3R, close the remaining 20% at target, or initiate a trail using the Pulse line, the Ribbon Anchor, or a fixed ATR distance. The trail captures the asymmetric upside on apex setups that run further than expected. Most setups end at TP2 or TP3; the occasional apex that runs to 5R or 8R compensates the losing trades disproportionately.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">BE MOVE AT TP1</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When TP1 hits, move the SL on the remaining position to break-even. This converts the trade from a risk-on position to a risk-free one. The operator&apos;s worst-case becomes locked-in profit, regardless of how the rest of the trade plays out. BE moves are non-negotiable on every trade.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DO NOT WIDEN STOPS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              When a trade goes against you mid-position and approaches the SL, the temptation is to widen the stop to give it more room. Do not. The Risk Map calculated the SL based on structural invalidation. Widening it accepts a loss in a place where the original thesis was wrong. The synthesis was wrong, and the trade should end.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">ADDING TO WINNERS &middot; OPTIONAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Aggressive operators add to winners after TP1 BE move &mdash; only on sustained convergence and only with a tight stop on the addition. This is an advanced read and not part of the baseline protocol. Do not add to losers ever, regardless of conviction.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Entry at label. SL from Risk Map. Scale 50/30/20 across 1R/2R/3R. BE move at TP1. Do not improvise. The plan is the plan.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S14 — Edge Cases */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Edge Cases</p>
        <h2 className="text-2xl font-extrabold mb-4">When the synthesis is technically valid but operationally weird.</h2>

        <p className="text-gray-400 leading-relaxed mb-4">
          Most signals are clean &mdash; the score is high or low, the modules converge or diverge, and the engagement decision is obvious. Some signals fall into edge cases where the synthesis is technically valid but the situation requires extra discretion. Four common ones below, and the resolution rule for each.
        </p>

        <p className="text-gray-400 leading-relaxed mb-6">
          The edge cases are not exceptions to the protocol &mdash; they are situations the protocol handles correctly but where the operator&apos;s read of the chart matters more than usual. The rule for each case is conservative by default. Operators with track records earn the right to deviate; operators learning the system trade them strictly by the rule.
        </p>

        <div className="p-1 rounded-2xl border border-white/5 mb-6">
          <EdgeCaseDialAnim />
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">CASE 1 &middot; 3 BULL + 1 BEAR</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Three modules say bull, one says bear. The score may still be 3/4 (Strong) because the three confirming factors hit. The bear-leaning module is typically Pulse just having flipped, or HTF2 fading. <span className="text-amber-400">Rule</span>: trade the majority at standard size. The 1-bear module is usually a leading-indicator early read, not a confirmed reversal.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CASE 2 &middot; RECENT FLIP (&lt; 5 BARS)</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Pulse line just flipped. The Ribbon has not caught up yet. Tension is building but no Snap. Score lands around 2/4 because Ribbon and Health have not yet aligned with the new direction. <span className="text-amber-400">Rule</span>: wait. Recent flips need 5-10 bars to mature. Engaging early on a flip catches the noise around the flip itself.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CASE 3 &middot; REGIME MISMATCH</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Regime says RANGE but the signal is a Pulse Cross (designed for trends). The score may be 3/4 because three factors passed in the trending bars within the range. <span className="text-amber-400">Rule</span>: skip. Trend signals in range regimes have lower follow-through. Wait for the range break, then engage when the regime catches up.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CASE 4 &middot; APEX IN COUNTER-TREND</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              A Sweep + FVG signal fires against the higher-timeframe trend. Score is 4/4 with the apex tag. The synthesis is technically maxed. <span className="text-amber-400">Rule</span>: trade with discipline &mdash; tighter stops than baseline, smaller size than typical apex protocol, faster TP1 scale-out. The HTF will eventually reassert; capture what the apex offers and exit.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE COMMON THREAD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Each edge case shares a structure: the score and tag look healthy in isolation, but a contextual factor (HTF mismatch, recent flip, wrong regime, counter-trend setup) introduces a hidden risk. The synthesis layer captures direct conflicts cleanly; edge cases are where the operator&apos;s read of the surrounding context matters.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASES ARE NOT BUGS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Pine code does not have a special case for these &mdash; they are normal outputs of the algorithm in unusual market conditions. CIPHER is honest about what it sees; the operator is honest about what to do with it. Every edge case is solvable by reading the panel one layer deeper than the score.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">LOGGING THE EDGE CASES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Keep a journal entry for each edge-case trade. Note which case it was, what the resolution rule said, what you did, and what happened. Over 30-50 entries patterns emerge &mdash; some edge cases are easier than the rule suggests, others are harder. The journal is how the operator earns the right to deviate.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Edge cases happen. Each has a default rule. Trade the rule until your journal earns you the right to override it. The score is honest; the discretion is yours.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S15 — The Cheat Sheet */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Cheat Sheet</p>
        <h2 className="text-2xl font-extrabold mb-4">Everything you need on one page.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The full Conviction Operator protocol, distilled. Print this, tape it to your monitor, read it before every session.
        </p>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE FOUR FACTORS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ribbon stacked &middot; ADX &gt; 20 &middot; Volume &gt; 1.0&times; &middot; Health &gt; 50%. Each pass adds 1 to the score. Score range: 0 to 4.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE SCORE TIERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              0-1 = pass &middot; 2 = half size &middot; 3 = standard size &middot; 4 with apex tag = up to 1.5&times; standard. Cap at maximum allowed risk per trade.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE THRESHOLD</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              min_conviction = 0 (study mode, all signals print) or 3 (production mode, only Strong prints). No middle option. Set once at session start.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 13 CONTEXT TAGS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sweep+FVG (apex) &middot; Sweep &middot; Breakout &middot; Snap &middot; Exhaustion &middot; S/R Break &middot; At Sup/Res &middot; At Spine &middot; At FVG &middot; Overextended &middot; Fade &middot; Trend &middot; Momentum. First match wins.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">THE SYNTHESIS TOOLTIP</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Source + tag &middot; HTF1/HTF2 &middot; Regime &middot; Ribbon &middot; Pulse &middot; ADX &middot; Volume &middot; Momentum &middot; Tension &middot; Reversion &middot; Squeeze &middot; Strong line &middot; Risk Map. Read top to bottom on every signal.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">CONVERGENCE THRESHOLDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              2 modules = correlation, wait &middot; 3 modules = thesis, engage &middot; 4-5 = strong thesis, size up 25-50% &middot; 6 = full size, rare alignment.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">DIVERGENCE PATTERNS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              HTF mismatch &middot; Regime conflict &middot; Sweep counter-trend &middot; Split vote. Default response: wait. Advanced: leading-vs-trailing reads after journal earns it.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TRADE PLAN</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Entry at label close &middot; SL from Risk Map &middot; TP1/TP2/TP3 at 1R/2R/3R scaling 50/30/20 &middot; BE move at TP1 &middot; trail final 20%. Do not improvise.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">PRESET FLOORS</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trend Trader 0 &middot; Scalper 0 &middot; Swing Trader 3 &middot; Reversal 0 &middot; Sniper 3 &middot; Structure (no signals) &middot; None (manual via toggle).
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASES &middot; QUICK RULES</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              3-bull/1-bear &rarr; majority, standard size &middot; Recent flip &lt; 5 bars &rarr; wait &middot; Regime mismatch &rarr; skip &middot; Apex counter-trend &rarr; tight stops, fast scale.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S CONTRACT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Score sets the size &middot; Threshold sets the engagement &middot; Plan sets the management &middot; Cap sets the discipline. Four levers, four locks.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN IN DOUBT</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Wait. The market gives a hundred setups a week. Missing one is cheap; engaging poorly is expensive. The Conviction Operator&apos;s edge is in selectivity, not speed.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">THE FOUR SENTENCES</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Read the score. Read the tag. Read the convergence. Trade what they agree on, in the size they justify, by the plan that fits them. Everything else is noise.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MISTAKES — Six Common Mistakes */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
        <h2 className="text-2xl font-extrabold mb-4">What goes wrong when synthesis is misread.</h2>

        <p className="text-gray-400 leading-relaxed mb-6">
          The Conviction Operator framework is robust, but the failure modes are real. Six mistakes that recur across operators learning the synthesis layer. Each mistake has a fix and the fix is more conservative than the mistake. Conservative is the default for a reason.
        </p>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &middot; ENGAGING AT 2/4</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The operator sees 2/4 and engages at half size, reasoning that any agreement is better than none. Over time, 2/4 trades have a measurably worse hit rate than 3/4 trades, and the half-size cushion does not fully compensate. <span className="text-amber-400">Fix</span>: skip 2/4. The geometric ladder is geometric on purpose.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &middot; OVERRIDING THE THRESHOLD</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Set min_conviction = 3 at session start, but mid-session toggle to 0 because &quot;the chart looks ready.&quot; The toggle change is the operator hiding from their own discipline. <span className="text-amber-400">Fix</span>: set the threshold once and lock yourself out of it for the session. If it feels wrong, journal it &mdash; do not change it.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &middot; READING SCORE WITHOUT TAG</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            A 4/4 Momentum signal feels stronger than a 3/4 Sweep+FVG signal because of the higher number. The opposite is true &mdash; context matters more than score within the Strong band. <span className="text-amber-400">Fix</span>: read the tag first, then the score. Apex with 3/4 beats Momentum with 4/4 in expected value.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &middot; FORCING SYNTHESIS</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The panel is divergent &mdash; modules disagreeing &mdash; but the operator engages anyway, picking the side that feels right. Forcing a synthesis that is not there is the most expensive mistake in the framework. <span className="text-amber-400">Fix</span>: when modules disagree, do nothing. Wait. The next convergence is coming.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &middot; SIZING ABOVE CAP</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            An apex signal fires and the operator sizes 2&times; or 3&times; their normal &mdash; treating apex as license to oversize. Apex earns up to 1.5&times; baseline. The cap is the cap. <span className="text-amber-400">Fix</span>: write your max risk per trade on a sticky note. Read it before every entry. Apex is concentration, not abandonment of risk control.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
          <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &middot; IMPROVISING THE TRADE PLAN</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            The synthesis is clean, the convergence is strong, the operator engages &mdash; and then widens the stop, skips TP1, removes the BE move, holds for &quot;the big one.&quot; Synthesis decided if; mechanics decide where. Mixing the layers is how Strong trades become losing trades. <span className="text-amber-400">Fix</span>: when in doubt, follow the Risk Map exactly. Improvisation is for operators with 500+ trade journals; the rest follow the plan.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <p className="text-xs font-bold text-amber-400 mb-2">OPERATOR&apos;S READ</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Six mistakes, six fixes. Each fix is more conservative than the mistake. Every drawdown traceable to one of these is preventable. The protocol is the answer.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* GAME — The Conviction Operator Challenge */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Conviction Operator Challenge</p>
        <h2 className="text-2xl font-extrabold mb-4">Five scenarios. Five decisions.</h2>

        <p className="text-gray-400 leading-relaxed mb-8">
          Each round presents a real synthesis read from the chart. Your job is to read the score, the tag, the convergence, and the edge cases &mdash; then pick the decision a Conviction Operator would make. Wrong answers come with explanations, so even the misses are learning. Pass threshold: get all five correct.
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
              <p className="text-sm text-gray-300 leading-relaxed">{gameRounds[gameRoundIdx].scenario}</p>
            </div>

            {/* Prompt */}
            <p className="text-base font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: gameRounds[gameRoundIdx].prompt }} />

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
                ? 'Perfect read across all five scenarios. Synthesis discipline confirmed.'
                : gameScore >= 3
                ? 'Solid synthesis read. Re-read the scenarios you missed and the relevant section.'
                : 'The synthesis layer takes practice. Revisit S05 through S14 and try again.'}
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
          The quiz tests recall of the conviction synthesis framework. Six correct out of eight unlocks the Conviction Operator certificate. Take your time &mdash; the questions are concept-level, not memorization-heavy.
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
                ? 'Pass. Your read of the synthesis framework is solid.'
                : 'Below pass threshold. Review the lesson sections above and try again \u2014 conviction discipline starts with conceptual fluency.'}
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
      {/* CERT — Conviction Operator */}
      {/* ============================================================ */}
      <section className="max-w-2xl mx-auto px-5 py-16 border-t border-white/5">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
        <h2 className="text-2xl font-extrabold mb-4">{certUnlocked ? 'Conviction Operator \u2014 unlocked.' : 'Complete the quiz to unlock the cert.'}</h2>

        {certUnlocked ? (
          <>
            <p className="text-gray-400 leading-relaxed mb-8">
              You now read CIPHER as a single synthesis layer rather than six independent modules. The score sets the size; the threshold sets the engagement; the plan sets the management; the cap sets the discipline. You have earned the Conviction Operator badge.
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
                <p className="text-3xl font-black text-white mb-2">Conviction Operator</p>
                <p className="text-sm text-gray-400 mb-6">Certificate of Synthesis Mastery</p>

                <div className="w-20 h-px bg-amber-400/40 mx-auto mb-6" />

                <p className="text-xs text-gray-500 mb-1">Awarded for completion of</p>
                <p className="text-sm font-bold text-white mb-6">Cipher Conviction Synthesis</p>

                <div className="inline-block px-4 py-2 rounded-lg border border-amber-400/30 bg-black/40">
                  <p className="text-[10px] tracking-widest uppercase text-amber-400/80">Cert ID</p>
                  <p className="text-xs font-mono text-white">PRO-CERT-L11.22</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU CAN DO NOW</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Read any CIPHER signal at a glance: glyph for conviction tier, label size for size-up cue, tag for context, score for engagement decision, tooltip for full module verdicts. The six Visual Layer modules consolidate into a single read.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-amber-400 mb-1">WHAT COMES NEXT</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Cipher Candles. The five candle modes (Trend / Composite Bold / Trend Bold / Tension / Default) are a rendering layer that re-paints existing module reads onto the candles themselves. Lesson 11.23 turns the panel-driven read into a candle-driven read.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-gray-400">
              Complete the Conviction Operator Challenge and the Knowledge Check (6/8) above to unlock the certificate.
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
            <p className="text-xs tracking-widest uppercase text-amber-400/60 mb-2">First Capstone Lesson Complete</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Lesson 11.22 closes the bridge from the Visual Layer arc into integration. The six Visual Layer modules now read as one synthesis. Six lessons remain in Level 11.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/academy/lesson/cipher-risk-map"
              className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition"
            >
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-1">&larr; Previous</p>
              <p className="text-sm font-bold text-white">L11.21 &middot; Cipher Risk Map</p>
            </Link>
            <Link
              href="/academy/lesson/cipher-candles"
              className="flex-1 p-4 rounded-xl border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10 transition"
            >
              <p className="text-xs tracking-widest uppercase text-amber-400/80 mb-1">Next &rarr;</p>
              <p className="text-sm font-bold text-white">L11.23 &middot; Cipher Candles</p>
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
