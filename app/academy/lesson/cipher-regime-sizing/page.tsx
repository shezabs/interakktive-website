// app/academy/lesson/cipher-regime-sizing/page.tsx
// ATLAS Academy — Lesson 11.7: Regime-Based Position Sizing [PRO]
// Gold standard — 8 deep animations, AnimScene + IntersectionObserver
// ~2400 lines matching cipher-regime-engine depth
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ── GAME ROUNDS ──────────────────────────────────────────────
const gameRounds = [
  {
    id: 'gr-117-01',
    scenario: "CIPHER shows: Regime = RANGE, Risk Row = ▲ DANGER, dwell 18b (ESTABLISHED). Your planned entry is full-size long. What do you do?",
    options: [
      { id: 'a', text: "Enter full size — RANGE regime means the move is contained.", correct: false, explain: "RANGE + DANGER is the most dangerous combination. Bands at 0.85× and price has been beyond the outer band for 18 bars. Full size is a critical error." },
      { id: 'b', text: "Reduce to 25% or skip — RANGE DANGER with 18 bars ESTABLISHED is a hard no.", correct: true, explain: "Correct. RANGE = narrowest bands (0.85×). ESTABLISHED dwell = 18 bars outside the outer band — deep, sticky overextension. 25% maximum or no position." },
      { id: 'c', text: "Reduce to 75% — the dwell might mean the move is nearly over.", correct: false, explain: "ESTABLISHED means overextension is sticky, not resolving. 75% is still far too large for RANGE DANGER. 25% max." },
      { id: 'd', text: "Enter full — 18 bars in DANGER means mean reversion is imminent.", correct: false, explain: "CIPHER identifies overextension. It does not predict reversals. Reduce as directed." },
    ],
  },
  {
    id: 'gr-117-02',
    scenario: "Regime = TREND (ADX 72, Bull), Risk Row = ▼ CAUTION, 'TIGHTEN STOPS 4b'. Price pulled back from the trend high. Do you adjust?",
    options: [
      { id: 'a', text: "No — CAUTION in TREND is less severe than RANGE CAUTION.", correct: false, explain: "CAUTION always requires stop tightening regardless of regime. In a Bull Trend the lower band is tighter due to asymmetry — pullbacks hit CAUTION sooner." },
      { id: 'b', text: "Yes — tighten immediately. Counter side in Bull Trend hits CAUTION sooner due to asymmetry.", correct: true, explain: "Correct. counter_side = 1.0 − asym_factor. At ADX 72 asymmetry is at max (0.15). The pullback hit CAUTION on the tighter lower band. Act now." },
      { id: 'c', text: "Wait for regime change before adjusting stops.", correct: false, explain: "Stop management is zone-driven, not regime-driven. CAUTION fires the action regardless." },
      { id: 'd', text: "Add to position — CAUTION on a pullback in TREND is a buying zone.", correct: false, explain: "The Risk Row says TIGHTEN STOPS. Adding into a CAUTION reading on the counter side contradicts Command Center guidance." },
    ],
  },
  {
    id: 'gr-117-03',
    scenario: "Regime = VOLATILE, Risk Row = ▲ DANGER, 'JUST HIT DANGER'. MR Score = EXTREME (87). What do you do?",
    options: [
      { id: 'a', text: "Hold full size — VOLATILE bands are widest so DANGER is less meaningful.", correct: false, explain: "DANGER guidance is REDUCE SIZE regardless of regime. EXTREME MR Score confirms real overextension." },
      { id: 'b', text: "Reduce to 50–60% — VOLATILE DANGER still requires action but expect larger swings.", correct: true, explain: "Correct. VOLATILE DANGER is less severe than RANGE DANGER in absolute terms but requires reduction. Keep stops wider for volatile conditions." },
      { id: 'c', text: "Exit entire position — EXTREME MR Score means reversal is certain.", correct: false, explain: "CIPHER identifies overextension, not reversal certainty. Reduce — don't panic-exit on a single EXTREME reading." },
      { id: 'd', text: "Wait for ENTRENCHED before acting — one bar is too early.", correct: false, explain: "JUST HIT DANGER is your one-bar notice. Waiting for ENTRENCHED means 21+ bars before responding." },
    ],
  },
  {
    id: 'gr-117-04',
    scenario: "Risk Row showed ▲ DANGER for 24 bars (ENTRENCHED, bright red). Now it reads ▲ CAUTION — 'LEAVING DANGER'. What do you do?",
    options: [
      { id: 'a', text: "Return to full size — LEAVING DANGER means risk is cleared.", correct: false, explain: "LEAVING DANGER is de-escalation, not all-clear. You are in CAUTION — TIGHTEN STOPS, not NORMAL SIZE." },
      { id: 'b', text: "Increase to 75% — the trend is resuming from an overextended base.", correct: false, explain: "LEAVING DANGER puts you in CAUTION. A size increase contradicts guidance. Wait for BACK TO SAFE." },
      { id: 'c', text: "Maintain reduced size and tighter stops — you are in CAUTION, not safe yet.", correct: true, explain: "Correct. De-escalated one level but not SAFE. TIGHTEN STOPS is current guidance. Hold until BACK TO SAFE fires." },
      { id: 'd', text: "Close the position — 24 bars of DANGER signals exhaustion.", correct: false, explain: "CIPHER gives de-escalation guidance, not an exit signal. Wait for BACK TO SAFE." },
    ],
  },
  {
    id: 'gr-117-05',
    scenario: "Setup A: RANGE regime, WATCH zone, 1 bar dwell. Setup B: TREND regime, CAUTION zone, 11 bars dwell (ESTABLISHED). Which is more urgent?",
    options: [
      { id: 'a', text: "Setup A — RANGE is always more dangerous so WATCH outweighs CAUTION.", correct: false, explain: "1-bar WATCH in RANGE is likely a spike — early and possibly noise. 11-bar CAUTION is confirmed sticky overextension." },
      { id: 'b', text: "Setup B — CAUTION with ESTABLISHED 11-bar dwell requires immediate stop tightening.", correct: true, explain: "Correct. CAUTION (higher zone) plus ESTABLISHED (longer dwell) makes Setup B the priority. Zone level and dwell count together determine urgency." },
      { id: 'c', text: "Both equally urgent — any non-SAFE reading gets the same action.", correct: false, explain: "The four zones carry different urgency. WATCH = awareness. CAUTION = stop tightening. Treating them identically ignores CIPHER's information." },
      { id: 'd', text: "Neither — wait for DANGER in both before acting.", correct: false, explain: "Waiting for DANGER defeats the zone system. CAUTION with 11-bar dwell is already telling you to tighten stops." },
    ],
  },
];

// ── QUIZ QUESTIONS ───────────────────────────────────────────
const quizQuestions = [
  { id: 'qq-117-01', question: "What is the band scale value for a RANGE regime with no ADX pressure?", options: [{ id: 'a', text: '1.00×', correct: false }, { id: 'b', text: '0.85×', correct: true }, { id: 'c', text: '1.25×', correct: false }, { id: 'd', text: '1.35×', correct: false }], explain: "band_scale = 0.85 + (trend_pct × 0.004). In a flat RANGE with trend_pct ≈ 0, band_scale = 0.85. Narrowest configuration — tightest zones." },
  { id: 'qq-117-02', question: "What additional multiplier does CIPHER apply to band scale in a VOLATILE regime?", options: [{ id: 'a', text: '+0.05', correct: false }, { id: 'b', text: '+0.15', correct: false }, { id: 'c', text: '+0.10', correct: true }, { id: 'd', text: '+0.20', correct: false }], explain: "VOLATILE adds vol_regime_bonus = 0.10 on top of band_scale, pushing maximum to 1.35×." },
  { id: 'qq-117-03', question: "Which dwell phase fires when price has been in a risk zone for 21+ bars?", options: [{ id: 'a', text: 'ESTABLISHED', correct: false }, { id: 'b', text: 'VISIT', correct: false }, { id: 'c', text: 'SPIKE', correct: false }, { id: 'd', text: 'ENTRENCHED', correct: true }], explain: "ENTRENCHED = 21+ bars. DANGER escalates to #FF1744 with ⚠ marker. ESTABLISHED = 9–20, VISIT = 3–8, SPIKE = 1–2." },
  { id: 'qq-117-04', question: "In a Bull Trend, which side of the Risk Envelope is tighter due to directional asymmetry?", options: [{ id: 'a', text: 'Both sides equal.', correct: false }, { id: 'b', text: 'Upper (trend) side is tighter.', correct: false }, { id: 'c', text: 'Lower (counter-trend) side is tighter.', correct: true }, { id: 'd', text: 'Asymmetry only applies above ADX 50.', correct: false }], explain: "counter_side = 1.0 − asym_factor. Lower band tighter in Bull Trend — pullbacks hit CAUTION sooner. Activates above ADX 15." },
  { id: 'qq-117-05', question: "What does the Risk row display on the first bar price crosses into DANGER from CAUTION?", options: [{ id: 'a', text: 'REDUCE SIZE 1b', correct: false }, { id: 'b', text: 'JUST HIT DANGER', correct: true }, { id: 'c', text: 'ENTRENCHED', correct: false }, { id: 'd', text: 'DANGER CONFIRMED', correct: false }], explain: "'JUST HIT DANGER' fires on the exact first bar of the transition — your one-bar notice before the dwell count begins." },
  { id: 'qq-117-06', question: "The Mean Reversion Score threshold for the mr_overextended flag is:", options: [{ id: 'a', text: '> 40', correct: false }, { id: 'b', text: '> 80', correct: false }, { id: 'c', text: '> 50', correct: false }, { id: 'd', text: '> 60', correct: true }], explain: "mr_overextended fires at score > 60 — HIGH or EXTREME label territory. Aligns with CAUTION and DANGER zone classification." },
  { id: 'qq-117-07', question: "Which regime + zone combination carries the most sizing urgency in absolute terms?", options: [{ id: 'a', text: 'VOLATILE + DANGER', correct: false }, { id: 'b', text: 'TREND + DANGER', correct: false }, { id: 'c', text: 'RANGE + DANGER', correct: true }, { id: 'd', text: 'All DANGER readings are identical.', correct: false }], explain: "RANGE + DANGER: band_scale 0.85× means outer band is closest to anchor EMA. Being in DANGER = deepest relative overextension." },
  { id: 'qq-117-08', question: "When the Risk row shows 'LEAVING DANGER', what sizing action do you take?", options: [{ id: 'a', text: 'Return to full size.', correct: false }, { id: 'b', text: 'Maintain reduced size and tighter stops — now in CAUTION.', correct: true }, { id: 'c', text: 'Exit — LEAVING DANGER confirms reversal.', correct: false }, { id: 'd', text: 'Add to position.', correct: false }], explain: "'LEAVING DANGER' = de-escalation to CAUTION. Guidance: TIGHTEN STOPS. Hold reduced size until 'BACK TO SAFE' fires." },
];

// ── CANVAS ANIMATION PRIMITIVE ────────────────────────────────
// IntersectionObserver: pauses when off-screen. t = seconds.
function AnimScene({
  draw, aspectRatio = 16 / 9, className = '',
}: {
  draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void;
  aspectRatio?: number; className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const parent = canvas.parentElement; if (!parent) return;
    const resize = () => {
      const w = Math.min(parent.clientWidth, 720); const h = w / aspectRatio;
      canvas.width = w * window.devicePixelRatio; canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d'); if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [aspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.1 });
    obs.observe(canvas); return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) { if (rafRef.current) cancelAnimationFrame(rafRef.current); startRef.current = null; return; }
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const w = canvas.width / window.devicePixelRatio; const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h); draw(ctx, t, w, h);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible, draw]);

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30 ${className}`}>
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

// ── CONFETTI ─────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    type P = { x: number; y: number; vx: number; vy: number; c: string; s: number; r: number; vr: number };
    const colors = ['#26A69A', '#FFB300', '#EF5350', '#FFFFFF', '#FBBF24'];
    const particles: P[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: -20, vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2, c: colors[Math.floor(Math.random() * colors.length)],
      s: Math.random() * 6 + 4, r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.2,
    }));
    let rafId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); });
      rafId = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(rafId);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" style={{ width: '100vw', height: '100vh' }} />;
}

// ============================================================
// ANIMATION 1 — SameCandleAnim (S01 — Groundbreaking Concept)
// 3-scene cycle: RANGE / TREND / VOLATILE
// Same candle, same ATR, bands expand around it, right-panel readout
// ============================================================
function SameCandleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t % 12;
    const sceneIdx = Math.floor(cycleT / 4);
    const sceneT = (cycleT % 4) / 4;
    const fadeIn = Math.min(1, sceneT * 3);

    const scenes = [
      { regime: 'RANGE',    scale: 0.85, zone: 'DANGER',  zoneC: MAGENTA, guidance: 'REDUCE SIZE',   regC: MAGENTA, note: 'Narrowest bands — same candle is DANGER' },
      { regime: 'TREND',    scale: 1.15, zone: 'CAUTION', zoneC: AMBER,   guidance: 'TIGHTEN STOPS', regC: TEAL,    note: 'Wider bands — same candle drops to CAUTION' },
      { regime: 'VOLATILE', scale: 1.25, zone: 'WATCH',   zoneC: AMBER,   guidance: 'STAY ALERT',    regC: MAGENTA, note: 'Widest bands — same candle drops to WATCH' },
    ];
    const s = scenes[sceneIdx];

    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SAME CANDLE · SAME ATR · THREE DIFFERENT RISK ZONES', w / 2, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${String(sceneIdx + 1).padStart(2, '0')} / 03`, w - 20, 22);

    // Chart panel
    const chartW = w * 0.64; const chartH = h - 74; const chartX = 18; const chartY = 36;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.strokeRect(chartX, chartY, chartW, chartH);

    const anchorY = chartY + chartH * 0.44;
    const atrPx = chartH * 0.115 * s.scale;
    const iU = anchorY - atrPx * 1.2; const iL = anchorY + atrPx * 1.2;
    const mU = anchorY - atrPx * 2.35; const mL = anchorY + atrPx * 2.35;
    const oU = anchorY - atrPx * 3.5;  const oL = anchorY + atrPx * 3.5;

    // Zone fills
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = 'rgba(239,83,80,0.12)';
    ctx.fillRect(chartX, Math.max(chartY, oU), chartW, Math.max(0, mU - oU));
    ctx.fillRect(chartX, mL, chartW, Math.max(0, oL - mL));
    ctx.fillStyle = 'rgba(255,179,0,0.09)';
    ctx.fillRect(chartX, mU, chartW, iU - mU); ctx.fillRect(chartX, iL, chartW, mL - iL);
    ctx.fillStyle = 'rgba(38,166,154,0.07)';
    ctx.fillRect(chartX, iU, chartW, iL - iU);
    ctx.globalAlpha = 1;

    // Band lines
    ([[oU, MAGENTA],[oL, MAGENTA],[mU, AMBER],[mL, AMBER],[iU, TEAL],[iL, TEAL]] as [number,string][]).forEach(([y, c]) => {
      ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha = fadeIn * 0.5; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(chartX, y); ctx.lineTo(chartX + chartW, y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    });

    // Band distance labels (right edge of chart)
    ctx.font = '9px "SF Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = `rgba(239,83,80,${fadeIn * 0.8})`; ctx.fillText('3.5× ATR', chartX + chartW - 56, oU - 3);
    ctx.fillStyle = `rgba(255,179,0,${fadeIn * 0.8})`; ctx.fillText('2.35×', chartX + chartW - 38, mU - 3);
    ctx.fillStyle = `rgba(38,166,154,${fadeIn * 0.8})`; ctx.fillText('1.2×', chartX + chartW - 32, iU - 3);

    // Anchor EMA
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(chartX, anchorY); ctx.lineTo(chartX + chartW, anchorY); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    // Historical candles (small, faded)
    const hist = [{o:.30,h:.36,l:.26,c:.33},{o:.33,h:.39,l:.29,c:.36},{o:.36,h:.42,l:.32,c:.39},{o:.39,h:.45,l:.35,c:.42},{o:.42,h:.48,l:.38,c:.45},{o:.45,h:.51,l:.42,c:.48}];
    const pyF = (n: number) => chartY + chartH * (1 - n * 0.85);
    const nC = hist.length; const cW2 = Math.floor(chartW * 0.66 / nC);
    hist.forEach((c, i) => {
      const cx = chartX + Math.floor(chartW * 0.04) + i * cW2 + cW2 / 2; const bull = c.c >= c.o;
      ctx.strokeStyle = bull ? `${TEAL}99` : `${MAGENTA}88`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, pyF(c.h)); ctx.lineTo(cx, pyF(c.l)); ctx.stroke();
      const yT = pyF(Math.max(c.o, c.c)); const yB = pyF(Math.min(c.o, c.c));
      ctx.fillStyle = bull ? `${TEAL}77` : `${MAGENTA}66`; ctx.fillRect(cx - cW2*0.4, yT, cW2*0.8, Math.max(2, yB-yT));
    });

    // THE highlighted candle (fixed at outer-band level)
    const theC = { o:.68, h:.76, l:.64, c:.72 };
    const theCX = chartX + chartW * 0.84; const theBW = cW2 * 1.1;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(theCX, pyF(theC.h)); ctx.lineTo(theCX, pyF(theC.l)); ctx.stroke();
    const tyT = pyF(Math.max(theC.o, theC.c)); const tyB = pyF(Math.min(theC.o, theC.c));
    ctx.shadowBlur = 14; ctx.shadowColor = s.zoneC;
    ctx.fillStyle = `${TEAL}cc`; ctx.fillRect(theCX - theBW/2, tyT, theBW, Math.max(3, tyB-tyT));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(theCX - theBW/2, tyT, theBW, Math.max(3, tyB-tyT));
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('THIS', theCX, pyF(theC.h) - 13); ctx.fillText('CANDLE', theCX, pyF(theC.h) - 4);

    // Zone arrow label
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = s.zoneC; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('◄ ' + s.zone, chartX + 8, (oU + mU) / 2 + 3);
    ctx.globalAlpha = 1;

    // Right readout panel
    const rX = chartX + chartW + 16; const rW = w - rX - 10;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(rX, chartY, rW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.strokeRect(rX, chartY, rW, chartH);
    const rows = [
      { l: 'REGIME', v: s.regime, c: s.regC },
      { l: 'SCALE',  v: s.scale.toFixed(2)+'×', c: 'rgba(255,255,255,0.8)' },
      { l: 'ZONE',   v: s.zone,   c: s.zoneC },
      { l: 'ACTION', v: s.guidance, c: s.zoneC },
    ];
    const rH = (chartH - 16) / rows.length;
    rows.forEach((rr, i) => {
      const ry = chartY + 8 + i * rH;
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(rr.l, rX + 8, ry + 12);
      ctx.fillStyle = rr.c; ctx.font = 'bold 13px "SF Mono", monospace';
      ctx.fillText(rr.v, rX + 8, ry + 28);
    });

    // Caption
    ctx.fillStyle = `rgba(255,255,255,${fadeIn * 0.65})`;
    ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(s.note, w / 2, h - 8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — FourZonesAnim (S02)
// Animated price dot walking SAFE→WATCH→CAUTION→DANGER
// Left side action labels, right side ATR distances
// ============================================================
function FourZonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';

    ctx.fillStyle = 'rgba(245,158,11,0.7)';
    ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CIPHER RISK ZONES — FOUR NESTED BANDS AROUND ANCHOR EMA', w / 2, 22);

    const midY = h * 0.50; const atrPx = h * 0.073;
    const iU = midY - atrPx * 1.2; const iL = midY + atrPx * 1.2;
    const mU = midY - atrPx * 2.35; const mL = midY + atrPx * 2.35;
    const oU = midY - atrPx * 3.5;  const oL = midY + atrPx * 3.5;
    const zW = w * 0.50; const zX = (w - zW) / 2;

    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;

    // Zone fills
    ctx.fillStyle = `rgba(239,83,80,${0.10 + pulse*0.04})`; ctx.fillRect(zX, Math.max(30, oU), zW, Math.max(0, mU-oU)); ctx.fillRect(zX, mL, zW, Math.max(0, oL-mL));
    ctx.fillStyle = `rgba(255,179,0,${0.08 + pulse*0.03})`; ctx.fillRect(zX, mU, zW, iU-mU); ctx.fillRect(zX, iL, zW, mL-iL);
    ctx.fillStyle = `rgba(38,166,154,${0.07 + pulse*0.02})`; ctx.fillRect(zX, iU, zW, iL-iU);

    // Band lines
    ([[oU,MAGENTA],[oL,MAGENTA],[mU,AMBER],[mL,AMBER],[iU,TEAL],[iL,TEAL]] as [number,string][]).forEach(([y,c]) => {
      ctx.save(); ctx.strokeStyle=c; ctx.globalAlpha=0.5; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(zX, y); ctx.lineTo(zX+zW, y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    });

    // Zone labels (inside)
    ([{l:'DANGER',y:(oU+mU)/2,c:MAGENTA},{l:'CAUTION',y:(mU+iU)/2,c:AMBER},{l:'SAFE',y:midY,c:TEAL},{l:'CAUTION',y:(iL+mL)/2,c:AMBER},{l:'DANGER',y:(mL+oL)/2,c:MAGENTA}] as {l:string;y:number;c:string}[]).forEach(({l,y,c}) => {
      ctx.fillStyle=c; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center'; ctx.fillText(l, w/2, y+4);
    });

    // Anchor EMA
    ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(zX, midY); ctx.lineTo(zX+zW, midY); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // Right labels — distances
    const rX = zX + zW + 10; ctx.font='9px "SF Mono", monospace'; ctx.textAlign='left';
    ctx.fillStyle='rgba(239,83,80,0.8)'; ctx.fillText('OUTER 3.5×', rX, oU+3);
    ctx.fillStyle='rgba(255,179,0,0.8)'; ctx.fillText('MID 2.35×', rX, mU+3);
    ctx.fillStyle='rgba(38,166,154,0.8)'; ctx.fillText('INNER 1.2×', rX, iU+3);

    // Left labels — actions
    const lX = zX - 10; ctx.textAlign='right'; ctx.font='9px Inter, sans-serif';
    ([{l:'→ REDUCE SIZE',y:(oU+mU)/2,c:MAGENTA},{l:'→ TIGHTEN STOPS',y:(mU+iU)/2,c:AMBER},{l:'→ NORMAL SIZE',y:midY,c:TEAL},{l:'→ TIGHTEN STOPS',y:(iL+mL)/2,c:AMBER},{l:'→ REDUCE SIZE',y:(mL+oL)/2,c:MAGENTA}] as {l:string;y:number;c:string}[]).forEach(({l,y,c}) => {
      ctx.fillStyle=c; ctx.fillText(l, lX, y+4);
    });

    // Animated price dot cycling through zones
    const cycleT = t % 16; const sIdx = Math.floor(cycleT / 4); const sT = (cycleT % 4) / 4;
    const eased = sT < 0.5 ? 2*sT*sT : 1 - Math.pow(-2*sT+2,2)/2;
    const dotYs  = [midY, (iU+mU)/2, (mU+oU)/2, oU-10];
    const nextYs = [(iU+mU)/2, (mU+oU)/2, oU-10, midY];
    const dotCs  = [TEAL, AMBER, AMBER, MAGENTA];
    const dotY = (dotYs[sIdx]??midY) + ((nextYs[sIdx]??midY) - (dotYs[sIdx]??midY)) * eased;
    const dC = dotCs[sIdx]??TEAL;
    ctx.save(); ctx.shadowBlur=18; ctx.shadowColor=dC;
    ctx.fillStyle=dC; ctx.beginPath(); ctx.arc(w/2, dotY, 8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur=0; ctx.restore();
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 3 — BandScaleAnim (S03)
// Three racing columns RANGE / TREND / VOLATILE
// Bars grow to exact scale values; formula strip at bottom
// ============================================================
function BandScaleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t % 12; const sceneIdx = Math.floor(cycleT / 4); const sceneT = (cycleT % 4) / 4;
    const grow = Math.min(1, sceneT * 2.2); const eased = 1 - Math.pow(1-grow, 3);

    const targetScales = [0.85, 1.15, 1.25];
    const regimes = ['RANGE','TREND','VOLATILE'];
    const regColors = [MAGENTA, TEAL, AMBER];

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('BAND SCALE = 0.85 + (trend% × 0.004)  +  VOLATILE BONUS', w/2, 22);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='right';
    ctx.fillText(`${String(sceneIdx+1).padStart(2,'0')} / 03`, w-20, 22);

    const n=3; const padX=40; const gap=24;
    const colW=(w-padX*2-gap*(n-1))/n; const baseY=h-58; const maxH=h-92;

    for(let i=0;i<n;i++){
      const cx = padX + i*(colW+gap);
      const sc = targetScales[i];
      const barH = (sc-0.7)/(1.35-0.7)*maxH * (i===sceneIdx ? eased : 0.92);
      const isActive = i===sceneIdx; const c = regColors[i];

      ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(cx, baseY-maxH, colW, maxH);

      if(isActive){ ctx.shadowBlur=16; ctx.shadowColor=c; }
      ctx.fillStyle = isActive ? c : `${c}55`; ctx.fillRect(cx, baseY-barH, colW, barH);
      ctx.shadowBlur=0;

      ctx.fillStyle = isActive ? c : `${c}88`;
      ctx.font = `bold ${isActive ? 22 : 16}px "SF Mono", monospace`; ctx.textAlign='center';
      ctx.fillText(sc.toFixed(2)+'×', cx+colW/2, baseY-barH-10);

      ctx.fillStyle = isActive ? c : 'rgba(255,255,255,0.5)';
      ctx.font = `${isActive?'bold ':''}12px Inter, sans-serif`;
      ctx.fillText(regimes[i], cx+colW/2, baseY+18);

      if(isActive){ ctx.fillStyle=c; ctx.font='bold 9px Inter, sans-serif'; ctx.fillText('← CURRENT', cx+colW/2, baseY+34); }
    }

    // Formula at bottom
    const formulas = [
      '0.85 + (trend%=0 × 0.004) = 0.85',
      '0.85 + (trend%=75 × 0.004) = 1.15',
      '0.85 + (trend%=100 × 0.004) + 0.10 = 1.35',
    ];
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText(formulas[sceneIdx], w/2, h-10);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 4 — AsymmetryAnim (S04)
// Oscillating ADX needle driving live asym_factor
// Dual asymmetric bands in Bull Trend — wider upper, tighter lower
// Right panel: ADX / asym / upper× / lower× live readouts
// ============================================================
function AsymmetryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const adx = 30 + Math.sin(t*0.5)*15 + Math.sin(t*1.1)*3;
    const asymFactor = Math.min(0.15, Math.max(0, (adx-15)*0.006));
    const trendSide = 1.0 + asymFactor; const counterSide = 1.0 - asymFactor;

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('BULL TREND — ASYMMETRIC RISK ENVELOPE', w/2, 22);

    // Chart area
    const chartW = w*0.72; const chartX = 18; const chartH = h-66; const chartY = 36;
    ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.strokeRect(chartX, chartY, chartW, chartH);

    const midY = chartY + chartH*0.5; const atrPx = chartH*0.10;

    // Asymmetric band distances
    const uB = [atrPx*1.2*trendSide, atrPx*2.35*trendSide, atrPx*3.5*trendSide];
    const lB = [atrPx*1.2*counterSide, atrPx*2.35*counterSide, atrPx*3.5*counterSide];
    const bC = [TEAL, AMBER, MAGENTA];

    // Zone fills
    ctx.fillStyle='rgba(239,83,80,0.10)'; ctx.fillRect(chartX, Math.max(chartY, midY-uB[2]), chartW, uB[2]-uB[1]); ctx.fillRect(chartX, midY+lB[1], chartW, lB[2]-lB[1]);
    ctx.fillStyle='rgba(255,179,0,0.08)'; ctx.fillRect(chartX, midY-uB[1], chartW, uB[1]-uB[0]); ctx.fillRect(chartX, midY+lB[0], chartW, lB[1]-lB[0]);
    ctx.fillStyle='rgba(38,166,154,0.06)'; ctx.fillRect(chartX, midY-uB[0], chartW, uB[0]*2);

    // Band lines
    uB.forEach((ub,i)=>{ ctx.save(); ctx.strokeStyle=bC[i]; ctx.globalAlpha=0.6; ctx.lineWidth=1.5; ctx.setLineDash([5,3]); ctx.beginPath(); ctx.moveTo(chartX, midY-ub); ctx.lineTo(chartX+chartW, midY-ub); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); });
    lB.forEach((lb,i)=>{ ctx.save(); ctx.strokeStyle=bC[i]; ctx.globalAlpha=0.6; ctx.lineWidth=i===0?2:1.5; ctx.setLineDash([5,3]); ctx.beginPath(); ctx.moveTo(chartX, midY+lb); ctx.lineTo(chartX+chartW, midY+lb); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); });

    // Anchor EMA
    ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(chartX, midY); ctx.lineTo(chartX+chartW, midY); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // Labels
    ctx.fillStyle=TEAL; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('▲ TREND SIDE (wider)', chartX+chartW*0.4, midY-uB[2]-8);
    ctx.fillStyle=MAGENTA; ctx.fillText('▼ COUNTER SIDE (tighter)', chartX+chartW*0.4, midY+lB[2]+16);

    // Asymmetry comparison arrows
    const arrowX = chartX + chartW - 20;
    ctx.save();
    // Upper arrow (trend-side) green, longer
    ctx.strokeStyle=TEAL; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(arrowX, midY); ctx.lineTo(arrowX, midY-uB[0]); ctx.stroke();
    // Lower arrow (counter) magenta, shorter
    ctx.strokeStyle=MAGENTA;
    ctx.beginPath(); ctx.moveTo(arrowX, midY); ctx.lineTo(arrowX, midY+lB[0]); ctx.stroke();
    ctx.restore();

    // Right panel — live readout
    const rX=chartX+chartW+16; const rW=w-rX-10;
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(rX, chartY, rW, chartH);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.strokeRect(rX, chartY, rW, chartH);
    const rdRows=[{l:'ADX',v:adx.toFixed(1),c:adx>25?TEAL:AMBER},{l:'asym',v:asymFactor.toFixed(3),c:AMBER},{l:'upper×',v:trendSide.toFixed(3),c:TEAL},{l:'lower×',v:counterSide.toFixed(3),c:MAGENTA}];
    const rH=(chartH-20)/rdRows.length;
    rdRows.forEach((r,i)=>{
      const ry=chartY+10+i*rH;
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='bold 9px Inter, sans-serif'; ctx.textAlign='left'; ctx.fillText(r.l, rX+8, ry+12);
      ctx.fillStyle=r.c; ctx.font='bold 14px "SF Mono", monospace'; ctx.fillText(r.v, rX+8, ry+28);
    });

    // Caption
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(`asym_factor = min(0.15, (${adx.toFixed(1)} − 15) × 0.006) = ${asymFactor.toFixed(3)}`, w/2, h-8);
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 5 — RiskRowAnim (S05)
// All 5 Risk Row states cycling: SAFE / WATCH / CAUTION / DANGER / ENTRENCHED
// Greyed-out rows + active row highlighted; dwell phase strip at bottom
// ============================================================
function RiskRowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const cycleT = t%17.5; const sceneIdx = Math.floor(cycleT/3.5); const sceneT = (cycleT%3.5)/3.5;
    const fadeIn = Math.min(1, sceneT*4);

    const states = [
      { zone:'SAFE',    dir:'▲', color:TEAL,     bg:'rgba(38,166,154,0.12)', bdr:'rgba(38,166,154,0.4)', guidance:'→ NORMAL SIZE',   dwell:'',    note:'Inside inner band. Full size permitted.' },
      { zone:'WATCH',   dir:'▲', color:AMBER,    bg:'rgba(255,179,0,0.08)',  bdr:'rgba(255,179,0,0.35)', guidance:'→ STAY ALERT',    dwell:'2b',  note:'Inner to mid. Extension building. Stay aware.' },
      { zone:'CAUTION', dir:'▲', color:AMBER,    bg:'rgba(255,179,0,0.10)',  bdr:'rgba(255,179,0,0.45)', guidance:'→ TIGHTEN STOPS', dwell:'12b', note:'Mid to outer. Elevated risk. Tighten stops now.' },
      { zone:'DANGER',  dir:'▲', color:MAGENTA,  bg:'rgba(239,83,80,0.12)',  bdr:'rgba(239,83,80,0.5)',  guidance:'→ REDUCE SIZE',   dwell:'5b',  note:'Beyond outer. Overextended. Size down immediately.' },
      { zone:'DANGER',  dir:'▲', color:'#FF1744',bg:'rgba(255,23,68,0.15)', bdr:'rgba(255,23,68,0.7)',  guidance:'→ REDUCE SIZE ⚠', dwell:'25b', note:'ENTRENCHED (21b+). Deepest overextension. #FF1744 with ⚠.' },
    ];
    const s = states[sceneIdx];

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('COMMAND CENTER — RISK ROW · ALL FIVE STATES', w/2, 22);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Inter, sans-serif'; ctx.textAlign='right';
    ctx.fillText(`${String(sceneIdx+1).padStart(2,'0')} / 05`, w-20, 22);

    const rowH=31; const rowGap=5; const rowsY=36; const rowW=w-40;
    states.forEach((st,i)=>{
      const ry=rowsY+i*(rowH+rowGap); const isActive=i===sceneIdx;
      ctx.globalAlpha = isActive ? 1 : 0.20;
      ctx.fillStyle = isActive ? st.bg : 'rgba(255,255,255,0.02)'; ctx.fillRect(20, ry, rowW, rowH);
      ctx.strokeStyle = isActive ? st.bdr : 'rgba(255,255,255,0.05)'; ctx.lineWidth = isActive ? 1.5 : 1; ctx.strokeRect(20, ry, rowW, rowH);
      ctx.fillStyle = isActive ? st.color : 'rgba(255,255,255,0.4)'; ctx.font='bold 12px "SF Mono", monospace'; ctx.textAlign='left';
      ctx.fillText(`${st.dir} ${st.zone}`, 32, ry+21);
      ctx.font='11px "SF Mono", monospace'; ctx.fillText(st.guidance, 32+112, ry+21);
      if(st.dwell){ ctx.fillStyle=isActive?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.2)'; ctx.textAlign='right'; ctx.fillText(st.dwell, 20+rowW-12, ry+21); }
      ctx.globalAlpha=1;
    });

    // Note
    const noteY = rowsY + 5*(rowH+rowGap) + 10;
    ctx.globalAlpha=fadeIn;
    if(sceneIdx===4){
      ctx.shadowBlur=12; ctx.shadowColor='#FF1744';
      ctx.fillStyle='#FF1744'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText('ENTRENCHED: 21b+ in DANGER · escalates to #FF1744 · ⚠ warning marker', w/2, noteY+14);
      ctx.shadowBlur=0;
    } else {
      ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='11px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(s.note, w/2, noteY+14);
    }
    ctx.globalAlpha=1;

    // Dwell phase strip
    const phases=[{l:'SPIKE',b:'1–2b',c:AMBER},{l:'VISIT',b:'3–8b',c:AMBER},{l:'ESTABLISHED',b:'9–20b',c:MAGENTA},{l:'ENTRENCHED',b:'21b+',c:'#FF1744'}];
    const phW=(w-40)/4; const phY=h-36;
    phases.forEach((ph,i)=>{
      const active=(sceneIdx===1&&i===0)||(sceneIdx===2&&i===1)||(sceneIdx===3&&i===2)||(sceneIdx===4&&i===3);
      ctx.fillStyle=active?ph.c+'22':'rgba(255,255,255,0.02)'; ctx.fillRect(20+i*phW, phY, phW-4, 26);
      ctx.strokeStyle=active?ph.c+'77':'rgba(255,255,255,0.05)'; ctx.strokeRect(20+i*phW, phY, phW-4, 26);
      ctx.fillStyle=active?ph.c:'rgba(255,255,255,0.3)'; ctx.font=`${active?'bold ':''}9px Inter, sans-serif`; ctx.textAlign='center';
      ctx.fillText(ph.l, 20+i*phW+phW/2, phY+12);
      ctx.fillStyle=active?ph.c:'rgba(255,255,255,0.2)'; ctx.font='8px "SF Mono", monospace'; ctx.fillText(ph.b, 20+i*phW+phW/2, phY+23);
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 6 — TransitionJourneyAnim (S06)
// Full journey: SAFE→WATCH→CAUTION→JUST HIT DANGER→ENTRENCHED→LEAVING DANGER→BACK TO SAFE
// Timeline dots at top, highlighted card, action guidance
// ============================================================
function TransitionJourneyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const journey = [
      { label:'BACK TO SAFE',       zone:'SAFE',    color:TEAL,     bg:'rgba(38,166,154,0.12)', bars:0,  msg:'Price back inside inner band. Full size restored.' },
      { label:'JUST HIT WATCH',     zone:'WATCH',   color:AMBER,    bg:'rgba(255,179,0,0.08)',  bars:1,  msg:'First bar past inner band. Awareness triggered.' },
      { label:'JUST HIT CAUTION',   zone:'CAUTION', color:AMBER,    bg:'rgba(255,179,0,0.10)',  bars:6,  msg:'First bar past mid band. Tighten stops immediately.' },
      { label:'JUST HIT DANGER',    zone:'DANGER',  color:MAGENTA,  bg:'rgba(239,83,80,0.12)',  bars:1,  msg:'First bar beyond outer. Your one-bar notice to act.' },
      { label:'DANGER ENTRENCHED',  zone:'DANGER',  color:'#FF1744',bg:'rgba(255,23,68,0.15)',  bars:24, msg:'24 bars outside outer. #FF1744 with ⚠ marker fires.' },
      { label:'LEAVING DANGER',     zone:'CAUTION', color:AMBER,    bg:'rgba(255,179,0,0.10)',  bars:0,  msg:'De-escalated — still CAUTION. Maintain reduced size.' },
      { label:'BACK TO SAFE',       zone:'SAFE',    color:TEAL,     bg:'rgba(38,166,154,0.12)', bars:0,  msg:'Price inside inner band. Full size permitted.' },
    ];
    const n = journey.length;
    const cycleT = t % (n * 2.8); const sceneIdx = Math.min(n-1, Math.floor(cycleT/2.8));
    const sceneT = (cycleT % 2.8) / 2.8; const fadeIn = Math.min(1, sceneT*5);
    const s = journey[sceneIdx];

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('ZONE TRANSITION STATES — CIPHER NARRATES EVERY CROSSING', w/2, 22);

    // Timeline
    const tmY=38; const tmH=20; const tmX=22; const tmW=w-44; const stepW=tmW/(n-1);
    journey.forEach((j,i)=>{
      const x=tmX+i*stepW; const isActive=i===sceneIdx; const isPast=i<sceneIdx;
      ctx.fillStyle = isActive?j.color:isPast?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.arc(x, tmY+tmH/2, isActive?6:4, 0, Math.PI*2); ctx.fill();
      if(isActive){ctx.shadowBlur=10;ctx.shadowColor=j.color;ctx.fill();ctx.shadowBlur=0;}
      if(i<n-1){
        ctx.strokeStyle=isPast?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x+7,tmY+tmH/2); ctx.lineTo(x+stepW-7,tmY+tmH/2); ctx.stroke();
      }
    });

    // Card
    const cardX=20; const cardY=68; const cardW=w-40; const cardH=h*0.42;
    ctx.globalAlpha=fadeIn;
    ctx.fillStyle=s.bg; ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle=s.color+'88'; ctx.lineWidth=1.5; ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.fillStyle=s.color; ctx.font='bold 20px "SF Mono", monospace'; ctx.textAlign='left';
    ctx.fillText(s.label, cardX+18, cardY+40);
    ctx.fillStyle=s.color+'aa'; ctx.font='12px "SF Mono", monospace';
    ctx.fillText(`Zone: ${s.zone}${s.bars>0 ? '  ·  Dwell: '+s.bars+'b' : ''}`, cardX+18, cardY+62);
    ctx.globalAlpha=1;

    // Message + action
    ctx.globalAlpha=fadeIn;
    ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText(s.msg, w/2, cardY+cardH+18);
    const actions=['NORMAL SIZE','STAY ALERT','TIGHTEN STOPS','REDUCE SIZE NOW','REDUCE SIZE ⚠','TIGHTEN STOPS (CAUTION)','NORMAL SIZE'];
    ctx.fillStyle=s.color; ctx.font='bold 12px "SF Mono", monospace';
    ctx.fillText('ACTION: '+actions[sceneIdx], w/2, cardY+cardH+36);
    ctx.globalAlpha=1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 7 — MRScoreGaugeAnim (S07)
// Semicircle gauge 0–100, oscillating needle, glow on needle
// Right panel: label table (NONE/LOW/MODERATE/HIGH/EXTREME)
// mr_overextended flag toggles when score > 60
// ============================================================
function MRScoreGaugeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const score = Math.max(0, Math.min(100, Math.round(50 + Math.sin(t*0.5)*48 + Math.sin(t*1.1)*2)));

    const cx = w*0.38; const cy = h*0.62; const r = Math.min(w,h)*0.36;

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('MEAN REVERSION SCORE — CONTINUOUS 0 TO 100 OVEREXTENSION', w/2, 22);

    ctx.save(); ctx.translate(cx, cy);

    // Arc segments
    const sToA = (v: number) => Math.PI + (v/100)*Math.PI;
    ([{f:0,t:20,c:'rgba(38,166,154,0.4)'},{f:20,t:40,c:'rgba(38,166,154,0.35)'},{f:40,t:60,c:'rgba(255,179,0,0.35)'},{f:60,t:80,c:'rgba(255,179,0,0.4)'},{f:80,t:100,c:'rgba(239,83,80,0.45)'}]).forEach(sg=>{
      ctx.beginPath(); ctx.arc(0,0,r,sToA(sg.f),sToA(sg.t)); ctx.lineWidth=26; ctx.strokeStyle=sg.c; ctx.stroke();
    });

    // Tick marks + labels
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1;
    for(let v=0;v<=100;v+=20){
      const a=sToA(v); const x1=Math.cos(a)*(r-18); const y1=Math.sin(a)*(r-18); const x2=Math.cos(a)*(r-8); const y2=Math.sin(a)*(r-8);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px "SF Mono", monospace'; ctx.textAlign='center';
      ctx.fillText(String(v), Math.cos(a)*(r+14), Math.sin(a)*(r+14)+3);
    }

    // mr_overextended threshold marker at 60
    const t60A=sToA(60);
    ctx.save(); ctx.strokeStyle=AMBER; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(Math.cos(t60A)*(r-28), Math.sin(t60A)*(r-28)); ctx.lineTo(Math.cos(t60A)*(r-4), Math.sin(t60A)*(r-4)); ctx.stroke(); ctx.restore();

    // Needle
    const nc=score>=80?MAGENTA:score>=60?AMBER:TEAL; const nA=sToA(score);
    ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=nc;
    ctx.strokeStyle=nc; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(nA)*(r-28), Math.sin(nA)*(r-28)); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=nc; ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // Center readout
    const label=score>=80?'EXTREME':score>=60?'HIGH':score>=40?'MODERATE':score>=20?'LOW':'NONE';
    const nc2=score>=80?MAGENTA:score>=60?AMBER:TEAL;
    ctx.fillStyle=nc2; ctx.font='bold 28px "SF Mono", monospace'; ctx.textAlign='center';
    ctx.fillText(String(score), cx, cy-r*0.12);
    ctx.font='bold 13px Inter, sans-serif'; ctx.fillText(label, cx, cy-r*0.12+22);
    const isOver=score>60;
    ctx.fillStyle=isOver?AMBER:'rgba(255,255,255,0.2)'; ctx.font='bold 10px "SF Mono", monospace';
    ctx.fillText('mr_overextended = '+(isOver?'TRUE':'false'), cx, cy+r*0.44);

    // Right label table
    const tX=w*0.73; const rows=[{r:'0–20',l:'NONE',c:TEAL},{r:'21–40',l:'LOW',c:TEAL},{r:'41–60',l:'MODERATE',c:AMBER},{r:'61–80',l:'HIGH',c:AMBER},{r:'81–100',l:'EXTREME',c:MAGENTA}];
    const rH2=(h-58)/rows.length;
    rows.forEach((rw,i)=>{
      const ry=36+i*rH2; const lo=parseInt(rw.r.split('–')[0]); const hi=parseInt(rw.r.split('–')[1]??'100');
      const isAct=score>=lo&&score<=hi;
      ctx.fillStyle=isAct?rw.c+'1E':'rgba(255,255,255,0.02)'; ctx.fillRect(tX-4,ry,w-tX-10,rH2-4);
      ctx.strokeStyle=isAct?rw.c+'55':'rgba(255,255,255,0.04)'; ctx.strokeRect(tX-4,ry,w-tX-10,rH2-4);
      ctx.fillStyle=isAct?rw.c:'rgba(255,255,255,0.3)'; ctx.font=`${isAct?'bold ':''}9px "SF Mono", monospace`; ctx.textAlign='left'; ctx.fillText(rw.r,tX+4,ry+rH2/2+3);
      ctx.fillStyle=isAct?rw.c:'rgba(255,255,255,0.45)'; ctx.font=`${isAct?'bold ':''}11px Inter, sans-serif`; ctx.fillText(rw.l,tX+44,ry+rH2/2+3);
      if(isAct){ctx.fillStyle=rw.c;ctx.font='9px Inter, sans-serif';ctx.fillText('◄',tX+(w-tX-10)-10,ry+rH2/2+3);}
    });
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ============================================================
// ANIMATION 8 — RegimeZoneMatrixAnim (S08)
// 3×4 matrix sweeping through all 12 cells, 1.2s each
// CRITICAL cell (RANGE+DANGER) gets special glow treatment
// Bottom caption explains active combination
// ============================================================
function RegimeZoneMatrixAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A', AMBER = '#FFB300', MAGENTA = '#EF5350';
    const total=12; const cycleT=t%(total*1.2); const activeCell=Math.floor(cycleT/1.2);
    const cellT=(cycleT%1.2)/1.2; const fadeIn=Math.min(1,cellT*6);

    ctx.fillStyle='rgba(245,158,11,0.7)'; ctx.font='bold 11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.fillText('REGIME × ZONE — 12 DISTINCT STATES', w/2, 22);

    const regimes=['RANGE','TREND','VOLATILE']; const zones=['SAFE','WATCH','CAUTION','DANGER'];
    const regColors=[MAGENTA, TEAL, AMBER];
    const urgency=[
      ['Low','High','Very High','CRITICAL'],
      ['Low','Moderate','High','High'],
      ['Low','Low','Moderate','High'],
    ];
    const uC=(u:string)=>u==='CRITICAL'?MAGENTA:u==='Very High'?MAGENTA:u==='High'?AMBER:u==='Moderate'?`${AMBER}88`:'rgba(255,255,255,0.22)';

    const padX=20; const hdrH=32;
    const colW=(w-padX*2)/(zones.length+1); const rowH=(h-66)/(regimes.length+1);

    // Column headers
    zones.forEach((z,j)=>{
      const cx=padX+(j+1)*colW+colW/2;
      const zC=z==='DANGER'?MAGENTA:z==='CAUTION'||z==='WATCH'?AMBER:TEAL;
      ctx.fillStyle=zC; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(z, cx, 38+hdrH/2+4);
    });

    // Row headers + cells
    regimes.forEach((r,i)=>{
      const ry=38+hdrH+i*rowH;
      ctx.fillStyle=regColors[i]; ctx.font='bold 10px Inter, sans-serif'; ctx.textAlign='center';
      ctx.fillText(r, padX+colW/2, ry+rowH/2+4);
      zones.forEach((_,j)=>{
        const cellIdx=i*4+j; const cx=padX+(j+1)*colW; const cxMid=cx+colW/2;
        const isActive=cellIdx===activeCell; const urg=urgency[i][j]; const ucColor=uC(urg);
        const isCritical=urg==='CRITICAL';
        ctx.fillStyle=isActive?(isCritical?'rgba(239,83,80,0.22)':'rgba(255,255,255,0.06)'):'rgba(255,255,255,0.02)';
        ctx.fillRect(cx+2,ry+2,colW-4,rowH-4);
        ctx.strokeStyle=isActive?(isCritical?MAGENTA+'cc':'rgba(255,255,255,0.3)'):'rgba(255,255,255,0.05)';
        ctx.lineWidth=isActive?1.5:1; ctx.strokeRect(cx+2,ry+2,colW-4,rowH-4);
        if(isActive){ctx.shadowBlur=isCritical?16:10;ctx.shadowColor=ucColor;}
        ctx.fillStyle=ucColor; ctx.font=`${isActive?'bold ':''}10px Inter, sans-serif`; ctx.textAlign='center';
        ctx.fillText(urg, cxMid, ry+rowH/2+4); ctx.shadowBlur=0;
      });
    });

    // Bottom caption
    const aR=Math.floor(activeCell/4); const aZ=activeCell%4;
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px Inter, sans-serif'; ctx.textAlign='center';
    ctx.globalAlpha=fadeIn; ctx.fillText(`${regimes[aR]} + ${zones[aZ]}: ${urgency[aR][aZ]} urgency`, w/2, h-10); ctx.globalAlpha=1;
  }, []);
  return <AnimScene draw={draw} aspectRatio={16/9} />;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function CipherRegimeSizingLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string|null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string|null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(()=>`PRO-CERT-L11.7-${Math.random().toString(36).substring(2,8).toUpperCase()}`);

  useEffect(()=>{const h=()=>setScrollY(window.scrollY);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[]);

  const quizScore=quizAnswers.filter((ans,i)=>{const c=quizQuestions[i].options.find(o=>o.correct)?.id;return ans===c;}).length;
  const quizPercent=Math.round((quizScore/quizQuestions.length)*100);
  const quizPassed=quizPercent>=66;

  useEffect(()=>{
    if(quizPassed&&quizSubmitted&&!certRevealed){
      const timer=setTimeout(()=>{setCertRevealed(true);setShowConfetti(true);setTimeout(()=>setShowConfetti(false),5000);},600);
      return()=>clearTimeout(timer);
    }
  },[quizPassed,quizSubmitted,certRevealed]);

  const fadeUp={hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:0.7}}};

  return (
    <div className="min-h-screen text-white" style={{background:'linear-gradient(to bottom, #060a12, #0a0f1a)'}}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-accent-500"
          style={{width:`${Math.min((scrollY/(typeof document!=='undefined'?document.body.scrollHeight-window.innerHeight:1))*100,100)}%`}} />
      </div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{WebkitTransform:'translateZ(0)'}}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.15}}}} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 7</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">
            Regime-Based<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{WebkitTransform:'translateZ(0)'}}>Position Sizing</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">
            CIPHER&apos;s Risk Envelope doesn&apos;t stay fixed. It breathes with the regime. The same candle that means <strong className="text-red-400">DANGER</strong> in a Range becomes <strong className="text-amber-400">WATCH</strong> in a Volatile market.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* S00 */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">The Risk Envelope Is Not Optional</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most traders apply a fixed percentage risk per trade and call it position sizing. That works if every market condition is identical. They are not. A 2% risk in a Range regime and a 2% risk in a Volatile regime expose you to completely different levels of overextension relative to market structure.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER&apos;s Risk Envelope calculates four risk zones in real time, every bar, using your regime, your ATR, and your directional bias. It then tells you exactly what sizing action to take. The Command Center does not ask you to guess.</p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches you to read those outputs, understand the math behind them, and use them to size correctly across all three regimes.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE SIZING OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will never size a trade without first reading the Command Center Risk row. The regime, the zone, and the dwell count are a complete sizing system. All three matter.</p>
          </div>
        </motion.div>
      </section>

      {/* S01 — GC */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; Your Stop Distance Is Wrong Without Regime</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Candle. Same ATR. Three Different Risk Zones.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The candle in the animation never moves. The ATR never changes. Only the regime changes — and watch what happens to the zone classification. The same price is DANGER in a Range, CAUTION in a Trend, and WATCH in a Volatile market.</p>
          <SameCandleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Watch the scene cycle through all three regimes. Scene 1: RANGE — bands at 0.85×, candle is outside the outer band — DANGER. Scene 2: TREND — bands widen to 1.15×, same candle now between mid and outer — CAUTION. Scene 3: VOLATILE — bands widen to 1.25× plus the bonus, same candle now between inner and mid — WATCH.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR INSIGHT</p>
            <p className="text-sm text-gray-400 leading-relaxed">A stop placed based on the RANGE reading will be drastically too tight when the market shifts to VOLATILE. The regime changes your risk classification without the price moving at all. <strong className="text-white">Read the regime before setting your stop.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* S02 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Four Risk Zones</p>
          <h2 className="text-2xl font-extrabold mb-4">SAFE / WATCH / CAUTION / DANGER</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER divides the space around price into four nested zones using the inner (1.2×), mid (2.35×), and outer (3.5×) bands. Each zone has one sizing verdict. The animated dot walks through each zone and triggers the correct action.</p>
          <FourZonesAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-3">
            {[{zone:'SAFE',c:'text-teal-400',b:'< 1.2× ATR',a:'NORMAL SIZE',d:'Inside inner band.'},{zone:'WATCH',c:'text-amber-400',b:'1.2–2.35×',a:'STAY ALERT',d:'Inner to mid.'},{zone:'CAUTION',c:'text-amber-400',b:'2.35–3.5×',a:'TIGHTEN STOPS',d:'Mid to outer.'},{zone:'DANGER',c:'text-red-400',b:'> 3.5×',a:'REDUCE SIZE',d:'Beyond outer.'}].map(z=>(
              <div key={z.zone} className="flex items-center gap-4 text-sm font-mono">
                <span className={`font-bold w-20 ${z.c}`}>{z.zone}</span>
                <span className="text-gray-500 text-xs w-24">{z.b}</span>
                <span className="text-white font-semibold">&rarr; {z.a}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S03 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; How Regime Scales the Bands</p>
          <h2 className="text-2xl font-extrabold mb-4">The Band Scale Factor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER applies a multiplier to all three band levels. The multiplier is driven by ADX — a stronger trend means wider bands. VOLATILE adds a fixed 0.10 bonus on top. Watch the three regime columns grow to their actual scale values.</p>
          <BandScaleAnim />
          <div className="p-5 rounded-2xl glass-card mt-6">
            <p className="text-xs font-bold text-amber-400 mb-2">SCALE FORMULA</p>
            <div className="font-mono text-sm space-y-1 text-gray-300">
              <p>band_scale &nbsp;= 0.85 + (trend_pct &times; 0.004)</p>
              <p>vol_bonus &nbsp;&nbsp;= 0.10 &nbsp;(VOLATILE only)</p>
              <p>final_scale = band_scale + vol_bonus &nbsp;(max 1.35)</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S04 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Directional Asymmetry</p>
          <h2 className="text-2xl font-extrabold mb-4">Trend Bands Are Not Symmetric</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In a trending market, moving with the trend is structurally lower risk than moving against it. CIPHER applies asymmetry: the trend-side band widens and the counter side tightens. Watch the live ADX needle drive the asymmetry factor and the bands respond in real time.</p>
          <AsymmetryAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">The critical implication: in a Bull Trend, a pullback (moving counter to trend) hits CAUTION faster than a continuation move. Your stop on the counter side should already be tighter to reflect this. The asymmetry formula activates above ADX 15 and caps at 0.15 (above ADX ~40).</p>
          <div className="p-5 rounded-2xl glass-card">
            <p className="text-xs font-bold text-amber-400 mb-2">ASYMMETRY FORMULA</p>
            <div className="font-mono text-sm space-y-1 text-gray-300">
              <p>asym_factor = min(0.15, (ADX &minus; 15) &times; 0.006)</p>
              <p>trend_side &nbsp;= 1.0 + asym_factor &nbsp;&nbsp;(wider)</p>
              <p>counter_side = 1.0 &minus; asym_factor &nbsp;(tighter)</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* S05 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Risk Row: All States</p>
          <h2 className="text-2xl font-extrabold mb-4">What You See in the Command Center</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Risk row shows: direction side (▲/▼), zone, guidance action, and dwell count. Watch all five states cycle — SAFE through ENTRENCHED DANGER — including the escalation to #FF1744 at 21+ bars and the dwell phase strip at the bottom.</p>
          <RiskRowAnim />
        </motion.div>
      </section>

      {/* S06 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Zone Transition States</p>
          <h2 className="text-2xl font-extrabold mb-4">CIPHER Narrates Every Crossing</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When price crosses a zone boundary, CIPHER fires a specific transition message on that first bar. You are told not just where you are, but how you got there. Watch the full journey from SAFE through JUST HIT DANGER, ENTRENCHED, LEAVING DANGER, and back to BACK TO SAFE.</p>
          <TransitionJourneyAnim />
          <div className="p-5 rounded-2xl glass-card mt-6 space-y-4">
            {[{msg:'JUST HIT DANGER',dir:'Escalation',c:'text-red-400',d:'First bar price crosses outer band. Act immediately.'},{msg:'JUST HIT CAUTION',dir:'Escalation',c:'text-amber-400',d:'First bar crosses mid band. Prepare to tighten.'},{msg:'LEAVING DANGER',dir:'De-escalation',c:'text-teal-400',d:'First bar back in CAUTION from DANGER. Not safe yet.'},{msg:'BACK TO SAFE',dir:'De-escalation',c:'text-teal-400',d:'First bar inside inner band. Full size permitted.'}].map(t=>(
              <div key={t.msg} className="flex items-start gap-3">
                <div className="shrink-0 w-36"><p className={`font-mono font-bold text-xs ${t.c}`}>{t.msg}</p><p className="text-gray-600 text-xs">{t.dir}</p></div>
                <p className="text-gray-400 text-sm leading-snug">{t.d}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S07 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Mean Reversion Score</p>
          <h2 className="text-2xl font-extrabold mb-4">Overextension on a 0&ndash;100 Scale</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Alongside the zone system, CIPHER calculates a continuous Mean Reversion Score. The gauge oscillates across the full range — watch the needle, the label, the threshold marker at 60, and the <strong className="text-white">mr_overextended</strong> flag all update live.</p>
          <MRScoreGaugeAnim />
          <p className="text-gray-400 leading-relaxed mt-4">The <strong className="text-amber-400">threshold marker at 60</strong> is the amber tick on the gauge. When the needle crosses it, mr_overextended flips to TRUE. This aligns with HIGH and EXTREME labels — the territory where CIPHER is already telling you to tighten or reduce size via the zone system.</p>
        </motion.div>
      </section>

      {/* S08 */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Regime &times; Zone — 12 Distinct States</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Combination Has a Different Urgency</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three regimes &times; four zones = twelve distinct states. DANGER in a Range is very different from DANGER in a Volatile market. Watch each cell illuminate in sequence — the CRITICAL cell (RANGE + DANGER) gets special treatment.</p>
          <RegimeZoneMatrixAnim />
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mt-4">
            <p className="text-sm text-gray-400"><strong className="text-amber-400">RANGE + DANGER</strong> is the most dangerous combination. Band scale 0.85× means the outer band is as close to the anchor EMA as it will ever be. Being in DANGER here = smallest absolute distance = deepest relative overextension in the entire system.</p>
          </div>
        </motion.div>
      </section>

      {/* S09 Sizing Playbook */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Your Sizing Playbook</p>
          <h2 className="text-2xl font-extrabold mb-6">One Rule Per Zone Per Regime</h2>
          {[
            {r:'RANGE',color:'#EF5350',bg:'rgba(239,83,80,0.06)',border:'rgba(239,83,80,0.2)',rules:[{z:'SAFE',a:'Full size.'},{z:'WATCH',a:'Reduce to 75%.'},{z:'CAUTION',a:'Reduce to 50%.'},{z:'DANGER',a:'25% or skip.'}]},
            {r:'TREND',color:'#26A69A',bg:'rgba(38,166,154,0.06)',border:'rgba(38,166,154,0.2)',rules:[{z:'SAFE',a:'Full size — trend continuation.'},{z:'WATCH',a:'Hold, monitor counter side.'},{z:'CAUTION',a:'Reduce to 60–70%.'},{z:'DANGER',a:'Reduce to 40–50%.'}]},
            {r:'VOLATILE',color:'#FFB300',bg:'rgba(255,179,0,0.06)',border:'rgba(255,179,0,0.2)',rules:[{z:'SAFE',a:'Full size — widest safe zone.'},{z:'WATCH',a:'Hold, heightened awareness.'},{z:'CAUTION',a:'Reduce to 70%.'},{z:'DANGER',a:'Reduce to 50–60%.'}]},
          ].map(p=>(
            <div key={p.r} className="mb-4 rounded-xl p-4" style={{background:p.bg,border:`1px solid ${p.border}`}}>
              <p className="font-mono font-bold text-xs mb-3" style={{color:p.color}}>{p.r} REGIME</p>
              <div className="space-y-1.5">
                {p.rules.map(r=>(
                  <div key={r.z} className="flex gap-3 text-xs font-mono"><span className="text-gray-500 w-16">{r.z}</span><span className="text-gray-300">{r.a}</span></div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* S10 Cheat Sheet */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-6">Regime-Based Sizing at a Glance</h2>
          <div className="p-5 rounded-2xl glass-card space-y-5">
            <div><p className="text-xs font-bold text-amber-400 mb-2">RISK ZONES</p><div className="space-y-1 text-xs font-mono">{[{z:'SAFE',c:'text-teal-400',a:'NORMAL SIZE',n:'< 1.2× ATR'},{z:'WATCH',c:'text-amber-400',a:'STAY ALERT',n:'1.2–2.35×'},{z:'CAUTION',c:'text-amber-400',a:'TIGHTEN STOPS',n:'2.35–3.5×'},{z:'DANGER',c:'text-red-400',a:'REDUCE SIZE',n:'> 3.5×'}].map(x=>(<div key={x.z} className="flex gap-3"><span className={`font-bold w-20 ${x.c}`}>{x.z}</span><span className="text-white/70 flex-1">&rarr; {x.a}</span><span className="text-gray-600">{x.n}</span></div>))}</div></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">DWELL PHASES</p><p className="text-xs font-mono text-gray-400">SPIKE (1–2b) &middot; VISIT (3–8b) &middot; ESTABLISHED (9–20b) &middot; ENTRENCHED (21b+)</p></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">BAND SCALE</p><p className="text-xs font-mono text-gray-400">RANGE 0.85× &middot; TREND 0.85–1.25× &middot; VOLATILE +0.10 bonus &middot; Max 1.35×</p></div>
            <div className="border-t border-white/8 pt-4"><p className="text-xs font-bold text-amber-400 mb-2">MR SCORE</p><p className="text-xs font-mono text-gray-400">NONE &middot; LOW &middot; MODERATE &middot; HIGH &middot; EXTREME &nbsp;&mdash;&nbsp; mr_overextended: score &gt; 60</p></div>
          </div>
        </motion.div>
      </section>

      {/* S11 Mistakes */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Six Common Sizing Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-6">What Operators Get Wrong</h2>
          <div className="space-y-3">
            {[
              {n:'01',t:'Ignoring the zone and sizing from habit',b:'Entering full size regardless of the Risk row. The Command Center tells you something every bar. Choosing not to read it is choosing to trade blind.'},
              {n:'02',t:'Treating WATCH as permission to be aggressive',b:'WATCH means heightened awareness. A long dwell in WATCH means CAUTION is approaching — not an invitation to add size.'},
              {n:'03',t:'Applying RANGE-regime sizing logic in a TREND',b:'DANGER in TREND means less absolute overextension than RANGE DANGER because bands are wider. Reduce but don\'t panic-exit a strong trend.'},
              {n:'04',t:'Ignoring the dwell count',b:'A 1-bar DANGER spike is often a wick. Twenty-five bars ENTRENCHED is structural overextension. Same zone, completely different urgency.'},
              {n:'05',t:'Not tightening stops on the counter side in a trend',b:'Asymmetry means the counter band is tighter. A pullback in a Bull Trend hits CAUTION sooner. Your stop should already reflect that tighter band.'},
              {n:'06',t:'Waiting for DANGER before acting',b:'By the time CIPHER says REDUCE SIZE you are already beyond the outer band. CAUTION is the preparation signal. DANGER is the urgent signal.'},
            ].map(m=>(
              <div key={m.n} className="p-4 rounded-xl border border-red-500/25 bg-red-500/6">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-red-400/60 mt-0.5 shrink-0">{m.n}</span>
                  <div><p className="text-sm font-bold text-red-400 mb-1">{m.t}</p><p className="text-xs text-gray-400 leading-relaxed">{m.b}</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* S12 Game */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-6">Sizing Operator &mdash; 5 Live Scenarios</h2>
          <div className="p-5 rounded-2xl glass-card">
            {(()=>{
              if(gameRound>=gameRounds.length){
                const fs=gameSelections.filter((s,i)=>s===gameRounds[i].options.find(o=>o.correct)?.id).length;
                return(<div className="text-center py-8"><p className="text-4xl font-extrabold text-amber-400 mb-2">{fs}/{gameRounds.length}</p><p className="text-gray-400 text-sm mt-1">{fs===5?'Perfect. You understand exactly how CIPHER sizes across regimes.':fs>=3?'Solid. Review the rounds you missed before the quiz.':'Study the sizing playbook (S09) before the quiz.'}</p></div>);
              }
              const round=gameRounds[gameRound]; const sel=gameSelections[gameRound]; const answered=sel!==null;
              return(
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-amber-400 tracking-widest">ROUND {gameRound+1} OF {gameRounds.length}</p>
                    <div className="flex gap-1">{gameRounds.map((_,i)=><div key={i} className={`w-2 h-2 rounded-full ${i<gameRound?'bg-teal-400':i===gameRound?'bg-amber-400':'bg-gray-700'}`}/>)}</div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5">{round.scenario}</p>
                  <div className="space-y-2 mb-4">
                    {round.options.map(opt=>{
                      const isSel=sel===opt.id; let cls='bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                      if(answered&&isSel&&opt.correct) cls='bg-green-500/10 border border-green-500/30';
                      if(answered&&isSel&&!opt.correct) cls='bg-red-500/10 border border-red-500/30';
                      if(answered&&!isSel&&opt.correct) cls='bg-green-500/5 border border-green-500/20';
                      return <button key={opt.id} onClick={()=>{if(answered)return;const n=[...gameSelections];n[gameRound]=opt.id;setGameSelections(n);}} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt.text}</button>;
                    })}
                  </div>
                  {answered&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-3 rounded-lg bg-white/[0.02] mb-4"><p className="text-xs text-amber-400">&#9989; {round.options.find(o=>o.id===sel)?.explain}</p></motion.div>}
                  {answered&&gameRound<gameRounds.length-1&&<button onClick={()=>setGameRound(r=>r+1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>}
                  {answered&&gameRound===gameRounds.length-1&&<button onClick={()=>setGameRound(gameRounds.length)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">See Results &rarr;</button>}
                </div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* S13 Quiz */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q,qi)=>{
              const answered=quizAnswers[qi]!==null; const sel=quizAnswers[qi];
              return(
                <div key={qi} className="p-5 rounded-2xl glass-card">
                  <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi+1} of {quizQuestions.length}</p>
                  <p className="text-sm font-semibold text-white mb-4">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map(opt=>{
                      const isSel=sel===opt.id; const isCorrect=opt.correct;
                      let cls='bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                      if(answered&&isSel&&isCorrect) cls='bg-green-500/10 border border-green-500/30';
                      if(answered&&isSel&&!isCorrect) cls='bg-red-500/10 border border-red-500/30';
                      if(answered&&!isSel&&isCorrect) cls='bg-green-500/5 border border-green-500/20';
                      return <button key={opt.id} onClick={()=>{if(quizAnswers[qi]!==null)return;const n=[...quizAnswers];n[qi]=opt.id;setQuizAnswers(n);if(n.every(a=>a!==null))setQuizSubmitted(true);}} disabled={answered} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}>{opt.text}</button>;
                    })}
                  </div>
                  {answered&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3 p-3 rounded-lg bg-white/[0.02]"><p className="text-xs text-amber-400">&#9989; {q.explain}</p></motion.div>}
                </div>
              );
            })}
          </div>
          {quizSubmitted&&(
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizPercent}%</p>
              <p className="text-sm text-gray-400">{quizPassed?'You passed! Certificate unlocked below.':'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}
          {certRevealed&&(
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.8}} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{background:'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))'}}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{animationDuration:'12s'}} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9636;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.7: Regime-Based Position Sizing</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{WebkitTransform:'translateZ(0)'}}>&mdash; Sizing Operator &mdash;</p>
                  <p className="font-mono text-[9px] text-amber-600/60 tracking-wider uppercase">{certId}</p>
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
