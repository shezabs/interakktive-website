// app/academy/lesson/cipher-ribbon-engine/page.tsx
// ATLAS Academy — Lesson 11.16: Cipher Ribbon Engine [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Four Voices — Why the Ribbon Speaks Differently Than Any MA Stack
// Covers: Core/Flow/Anchor anatomy, volume-conviction cascade, adaptive periods,
//         stack states, divergence, projection, coil, lifecycle, cross-proximity,
//         priority cascade in the Command Center, inputs, trading, conviction.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Ribbon Engine challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: voice identification, lifecycle reading, conviction, stop
//         placement, cascade priority resolution.
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are watching XAUUSD 4h. The Ribbon row reads <strong class="text-white">&#9650; BULL</strong> in cell 2 and <strong class="text-amber-400">&#8594; DIVERGING</strong> in cell 3. An amber diamond just plotted above the most recent swing high. You are currently long XAUUSD from a PX entry 12 bars ago, sitting +1.4R in profit.',
    prompt: 'What is the right move?',
    options: [
      {
        id: 'a',
        text: 'Exit long now and immediately go short. The trend is dying.',
        correct: false,
        explain:
          'This is mistake 3 from section 15 \u2014 treating DIVERGING as a flip signal. DIVERGING means the trend is dying internally, but the stack is still bull. Many divergences resolve as deep pullbacks within continuing trends, not full reversals. Going short fights the still-active bull stack.',
      },
      {
        id: 'b',
        text: 'Tighten stop to break-even, take partial profit, watch the next 5 bars closely.',
        correct: true,
        explain:
          'Correct. DIVERGING is an exit-warning voice for with-trend positions, not an entry for counter-trend. The Section 6 playbook is exactly this: tighten stop to break-even, lock in partial, monitor closely. If DIVERGING persists for 5+ bars, exit the rest. Don\u2019t flip until the stack flips.',
      },
      {
        id: 'c',
        text: 'Ignore it \u2014 you are in profit and the stack is still bull. Hold the runner.',
        correct: false,
        explain:
          'Holding without adjustment ignores the warning the engine just spoke. DIVERGING fires precisely so you can lock in some of that +1.4R before the trend dies. Holding-and-hoping turns winners into losers when the stack eventually flips against you.',
      },
      {
        id: 'd',
        text: 'Add to your long \u2014 the divergence diamond is a buy signal.',
        correct: false,
        explain:
          'The amber diamond is a warning marker, not a buy signal. It marks the bar where bearish divergence was first detected (price up, spread down). Adding longs into deteriorating internal expansion is exactly the wrong direction.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You switch to BTCUSD 1h after lunch. The Ribbon row reads <strong class="text-white">&#9660; BEAR</strong> in cell 2 and <strong class="text-amber-400">&#8594; AGING  47b (avg 32)</strong> in cell 3. A clean Tension Snap reversal signal just fired with strong conviction (3 of 4 factors).',
    prompt: 'How should you treat this signal?',
    options: [
      {
        id: 'a',
        text: 'Take the long with full size \u2014 strong signals override the lifecycle warning.',
        correct: false,
        explain:
          'This combines two of the lesson\u2019s mistakes. The lifecycle warning AGING (147% of avg) is telling you the bear stack is past its expected lifespan \u2014 but past doesn\u2019t mean over. New counter-trend entries in AGING are skips by default per the Section 13 sizing table. Conviction matters but does not override lifecycle.',
      },
      {
        id: 'b',
        text: 'Take the long but at half-size, with stop above Cipher Anchor on the bear ribbon.',
        correct: true,
        explain:
          'Correct in spirit and in detail. AGING bears are reversal-prone, and a strong-conviction TS signal in the opposite direction is one of the highest-edge setups in CIPHER. But size down for the lifecycle warning, and use the Anchor stop placement from Section 13. Half-size on a high-edge signal in AGING is the calibrated answer.',
      },
      {
        id: 'c',
        text: 'Skip the trade entirely \u2014 the Ribbon row says AGING, that\u2019s a do-not-trade voice.',
        correct: false,
        explain:
          'AGING is a do-not-take-NEW-with-trend warning, not a blanket skip. Counter-trend reversal signals in AGING are exactly when reversals fire. The lesson is to size down (because the trend could still extend), not to skip the highest-edge setups.',
      },
      {
        id: 'd',
        text: 'Take the long, place stop just below Cipher Core for tight risk.',
        correct: false,
        explain:
          'This is mistake 5 from section 15. Stops at Core get whipsawed on every minor pullback because Core is the fast line by design. Stops belong below Anchor (the structural edge) with a small ATR buffer, not at Core. Tight risk that gets stopped out is worse than calibrated risk that survives the noise.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'EURUSD 15m. The Ribbon row reads <strong class="text-white">&#8596; CROSSING</strong> and <strong class="text-amber-400">&#8594; DOUBLE COIL</strong>. The chart shows the Ribbon converged tightly with faint amber BB/KC bands pulsing. Energy gauge is full. Recent swing high sits +12 pips above current price; recent swing low sits -10 pips below.',
    prompt: 'What is the correct preparation?',
    options: [
      {
        id: 'a',
        text: 'Take an immediate long \u2014 DOUBLE COIL means the energy will release upward.',
        correct: false,
        explain:
          'DOUBLE COIL means the engine has no edge AND volatility is compressed \u2014 direction is genuinely undetermined. The energy will release in whichever direction commits first, and that direction is unknown until it commits. Predicting up vs down is a coin flip until the breakout candle prints.',
      },
      {
        id: 'b',
        text: 'Mark the swing high (+12) and swing low (-10) as breakout triggers, wait for first close beyond either, enter on that side with stop on the opposite side, target the next major S/R.',
        correct: true,
        explain:
          'Correct. This is the DOUBLE COIL playbook from Section 8 and Section 13. Mark both extremes; first close beyond either is the breakout entry. Stop goes opposite. Target is the next prior swing extreme on the breakout side. DOUBLE COIL releases produce outsized moves, so size up the breakout entry.',
      },
      {
        id: 'c',
        text: 'Take both a long stop-buy at +12 and a short stop-sell at -10 to catch whichever side breaks first.',
        correct: false,
        explain:
          'Bracket orders sound clever but introduce execution risk: if the spread widens or you slip the entry on the breakout, the not-triggered side becomes your stop and you can lose on both. Single-side entry on confirmed close-through is the cleaner pattern. Save bracket complexity for after you\u2019ve mastered the simpler version.',
      },
      {
        id: 'd',
        text: 'Skip the setup entirely \u2014 CROSSING means no directional trade.',
        correct: false,
        explain:
          'CROSSING means no directional trade right now, but DOUBLE COIL is explicitly a pre-breakout setup. The trade is the breakout itself \u2014 not a directional read of the current state. The voice tells you exactly what kind of trade is loading. Skipping DOUBLE COIL is leaving one of CIPHER\u2019s highest-edge contexts unworked.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'GBPUSD 1h. The chart shows DIVERGING is firing (amber diamond just plotted), CURVING is firing (projection bending back to amber), and the Ribbon coil bars are visible (faint BB/KC bands present). Three voices technically active. You glance at the Ribbon row.',
    prompt: 'Which voice does the Ribbon row\u2019s third cell broadcast?',
    options: [
      {
        id: 'a',
        text: 'COILED, because the coil bars are the most actionable signal on chart.',
        correct: false,
        explain:
          'COILED sits at position 4 in the cascade. Both DIVERGING (1) and CURVING (2) outrank it. When higher-priority voices are firing, COILED is suppressed regardless of how visible the coil bars are on chart. The chart shows everything; the row says one thing.',
      },
      {
        id: 'b',
        text: 'All three, displayed in sequence as the row updates each second.',
        correct: false,
        explain:
          'The Ribbon row never displays multiple voices, never updates within a bar. CIPHER\u2019s entire design philosophy is one-voice-per-bar via the priority cascade. Stop trying to read multiple things at once \u2014 that\u2019s mistake 6 from section 15.',
      },
      {
        id: 'c',
        text: 'DIVERGING, because it\u2019s position 1 in the cascade and outranks the other two.',
        correct: true,
        explain:
          'Correct. The cascade evaluates top-down and the first match wins: DIVERGING (position 1) beats CURVING (2) beats COILED (4). The chart still shows all three visuals \u2014 the diamond, the curling projection, the coil bands \u2014 because those are layered diagnostics. The row is the singular verdict. Trust the cascade.',
      },
      {
        id: 'd',
        text: 'EXPANDING, because the trend is healthy enough that all three warnings can be ignored.',
        correct: false,
        explain:
          'EXPANDING is the silent default that fires only when no higher voice is active. Three warning voices firing simultaneously is the opposite of healthy. EXPANDING is the lowest cascade slot for a reason \u2014 the absence of warnings, not the presence of three.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You\u2019re long NDX 5m from a PX entry 4 bars ago, +0.6R in profit. The Ribbon row reads <strong class="text-white">&#9650; BULL</strong> and <strong class="text-amber-400">&#8594; FLIP NEAR</strong> \u2014 Cipher Core just turned amber on chart. Stack is still bull but Core is right at Flow.',
    prompt: 'What is the right action?',
    options: [
      {
        id: 'a',
        text: 'Hold \u2014 the stack is still bull, the trade is in profit, FLIP NEAR is just a warning.',
        correct: false,
        explain:
          'FLIP NEAR is the most-actionable kind of warning: it\u2019s telling you a flip is mechanically imminent within 1-3 bars. Holding into a confirmed pre-flip warning when you\u2019re only 4 bars in (no scale-out cushion yet) gives back the +0.6R profit when the stack flips. The whole point of FLIP NEAR is to act before the flip.',
      },
      {
        id: 'b',
        text: 'Tighten stop to break-even immediately. If the next 1-3 bars confirm the flip, exit fully. If Core bounces back away from Flow, hold the runner.',
        correct: true,
        explain:
          'Correct. The FLIP NEAR playbook from Section 10 is exactly this: tighten to break-even RIGHT NOW (locks in the +0.6R as worst-case zero loss), then watch 1-3 bars. False positives where Core bounces back without flipping are real and expected, so you don\u2019t exit unconditionally \u2014 you exit only on flip confirmation. Either way, your profit is protected.',
      },
      {
        id: 'c',
        text: 'Reverse to short on the next bar \u2014 flip is imminent, get ahead of it.',
        correct: false,
        explain:
          'Cross-proximity occasionally fires and resolves without a flip \u2014 Core touches Flow, then bounces away as the trend reasserts. Pre-empting an unconfirmed flip with a counter-trend short is fighting the still-active bull stack. The correct pattern is wait for stack flip confirmation, not pre-emption.',
      },
      {
        id: 'd',
        text: 'Add to the long while Core is amber \u2014 amber Core means a deep pullback opportunity.',
        correct: false,
        explain:
          'Amber Core during cross-proximity means \u201cflip imminent,\u201d not \u201cdeep pullback opportunity.\u201d Adding into a pre-flip warning maximises exposure exactly when exposure should be reducing. This conflates Core\u2019s amber proximity colour with a tradeable setup, which it isn\u2019t.',
      },
    ],
  },
];

// ============================================================
// QUIZ — 8 multiple choice questions on Ribbon Engine
// Covers: anatomy, formulas, cascade order, voice meanings, trading,
//         conviction, inputs, mistake recognition.
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How many lines does the Cipher Ribbon engine compute, and what are they called?',
    options: [
      { id: 'a', text: 'Two lines: a fast EMA and a slow EMA.', correct: false },
      { id: 'b', text: 'Three lines: Cipher Core (fastest), Cipher Flow (mid), Cipher Anchor (slowest).', correct: true },
      { id: 'c', text: 'Five EMAs of varying lengths, layered as a stack.', correct: false },
      { id: 'd', text: 'A single adaptive line with three colour states.', correct: false },
    ],
    explain:
      'Three custom adaptive lines, each computed from its own efficiency-ratio scaling, volatility adjustment, and volume-conviction multiplier. They are not five EMAs in a stack, and they are not a single line \u2014 they are three independent adaptive systems that together form the sleeve. (Section 2.)',
  },
  {
    id: 'q2',
    question: 'When a 2.5x institutional volume bar fires, which line responds with the most acceleration?',
    options: [
      { id: 'a', text: 'Cipher Anchor \u2014 it\u2019s the structural line and structure responds to volume first.', correct: false },
      { id: 'b', text: 'All three respond equally \u2014 volume conviction is applied uniformly.', correct: false },
      { id: 'c', text: 'Cipher Flow \u2014 mid lines balance speed and stability best.', correct: false },
      { id: 'd', text: 'Cipher Core \u2014 the volume conviction multiplier applies at full strength to Core, 60% to Flow, 30% to Anchor.', correct: true },
    ],
    explain:
      'Volume conviction is asymmetric across the three lines: 100% on Core, 60% on Flow, 30% on Anchor. An institutional bar snaps Core, drags Flow, and barely moves Anchor. The split distributes response across timescales of truth. (Section 3.)',
  },
  {
    id: 'q3',
    question: 'In which order does the Ribbon priority cascade evaluate voices?',
    options: [
      { id: 'a', text: 'EXPANDING \u2192 LIFECYCLE \u2192 COILED \u2192 CURVING \u2192 DIVERGING.', correct: false },
      { id: 'b', text: 'DIVERGING \u2192 CURVING \u2192 DOUBLE COIL \u2192 COILED \u2192 FLIP NEAR \u2192 AGING/EXTENDED \u2192 LIFECYCLE \u2192 EXPANDING/FLAT.', correct: true },
      { id: 'c', text: 'Most frequently observed voice on top, least frequent on the bottom.', correct: false },
      { id: 'd', text: 'Random per bar \u2014 whichever voice fires first wins the row.', correct: false },
    ],
    explain:
      'The cascade is hard-ranked by URGENCY, not by frequency or randomness. DIVERGING earns position 1 because it\u2019s the earliest possible warning of trend death; EXPANDING sits at the bottom because it\u2019s the silent default. First match wins; everything below is suppressed. (Section 11.)',
  },
  {
    id: 'q4',
    question: 'The Ribbon row reads MATURE 32b (avg 39). What does this tell you about the active stack?',
    options: [
      { id: 'a', text: 'The stack is past its expected lifespan \u2014 exit immediately.', correct: false },
      { id: 'b', text: 'The stack is at 82% of the historical average duration on this asset/timeframe \u2014 approaching the average, time to tighten stops and stop adding.', correct: true },
      { id: 'c', text: 'The number 39 is a fixed CIPHER constant for all assets.', correct: false },
      { id: 'd', text: 'The MATURE label means the stack is extremely young \u2014 safe to enter freely.', correct: false },
    ],
    explain:
      'MATURE means 80-120% of the per-asset, per-timeframe rolling average. 32 / 39 = 82% \u2014 right at the lower edge of MATURE. The action is tighten stops, take partials, stop adding. (Section 9.)',
  },
  {
    id: 'q5',
    question: 'You enter a long when the Ribbon stack confirms bull. Where does the stop go?',
    options: [
      { id: 'a', text: 'Just below Cipher Core \u2014 closest line, tightest risk.', correct: false },
      { id: 'b', text: 'Just below Cipher Flow \u2014 the mid confirmation line.', correct: false },
      { id: 'c', text: 'Just below Cipher Anchor with a small ATR buffer \u2014 the structural edge of the sleeve.', correct: true },
      { id: 'd', text: 'At the most recent swing low regardless of where the Ribbon sits.', correct: false },
    ],
    explain:
      'The standard Ribbon stop sits just beyond Cipher Anchor (long: below; short: above). Anchor is the slowest, most structural line \u2014 it doesn\u2019t flicker on noise. A stop at Anchor only triggers when the engine itself has structurally broken. Stops at Core get whipsawed (mistake 5). (Section 13.)',
  },
  {
    id: 'q6',
    question: 'What is the Ribbon coil threshold and confirmation requirement?',
    options: [
      { id: 'a', text: 'Spread &lt; 0.5 ATR for 1 bar.', correct: false },
      { id: 'b', text: 'Spread &lt; 0.15 ATR for 3 or more consecutive bars.', correct: true },
      { id: 'c', text: 'Spread &lt; 0.01 ATR for any duration.', correct: false },
      { id: 'd', text: 'Spread &lt; 1.0 ATR for 10 or more consecutive bars.', correct: false },
    ],
    explain:
      'The Ribbon is officially coiled when |c_spread| (Core minus Anchor, ATR-normalised) drops below 0.15 for at least 3 consecutive bars. The 3-bar minimum filters single-bar overlaps from candle wicks. Phases: BUILDING (1-6b), DEEP (7-12b), CRITICAL (13+b). (Section 8.)',
  },
  {
    id: 'q7',
    question: 'Of CIPHER\u2019s 4-factor signal conviction score, which factor does the Ribbon contribute?',
    options: [
      { id: 'a', text: 'The active priority cascade voice (DIVERGING, CURVING, etc.).', correct: false },
      { id: 'b', text: 'The lifecycle phase (YOUNG, PRIME, MATURE, AGING, EXTENDED).', correct: false },
      { id: 'c', text: 'The simple bull_stack or bear_stack boolean \u2014 stack alignment with signal direction.', correct: true },
      { id: 'd', text: 'The Cipher Core line\u2019s slope direction.', correct: false },
    ],
    explain:
      'The conviction math reads only the stack boolean (binary, decisive, stable). A bull stack with DIVERGING active still scores +1 for ribbon conviction \u2014 the stack is still bull. The DIVERGING warning is for the operator to interpret separately, not for the score. (Section 14.)',
  },
  {
    id: 'q8',
    question: 'A Pulse Cross long signal fires while the Ribbon stack is bear. How should you treat the signal?',
    options: [
      { id: 'a', text: 'Take it normally \u2014 a signal is a signal.', correct: false },
      { id: 'b', text: 'Always skip \u2014 counter-trend signals never work.', correct: false },
      { id: 'c', text: 'Treat the signal as 1-of-4 weaker on conviction; demand confirmation from another non-Ribbon source (structure, imbalance) before taking it.', correct: true },
      { id: 'd', text: 'Take it but flip your direction \u2014 the Ribbon\u2019s direction overrides the signal\u2019s.', correct: false },
    ],
    explain:
      'A signal that opposes the stack still fires (the signal engine doesn\u2019t require stack alignment) but it scores +0 for the Ribbon conviction factor instead of +1. Demand structural confirmation from another source. With-stack signals are the engine\u2019s default vote of confidence; against-stack signals require additional evidence. (Section 14.)',
  },
];

// ============================================================
// ANIMSCENE — re-usable animated canvas, IO-paused, DPR-aware
// Mirrors the gold-standard L11.11 scaffold exactly.
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
// CONFETTI — for certificate reveal (gold-standard pattern)
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
// ANIMATION 1 — FourVoicesAnim (S01 Groundbreaking Concept)
// The Ribbon morphing through its four voices in sequence:
//   DIVERGING -> CURVING -> COILED -> DOUBLE COIL
// Each phase ~5s, total ~20s loop. The Ribbon row updates in sync.
// ============================================================
function FourVoicesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const RIBBON_BULL = '#1B8A7A';
    const RIBBON_BEAR = '#C62828';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    // Phase cycle: 0=DIVERGING, 1=CURVING, 2=COILED, 3=DOUBLE COIL
    const phaseDuration = 5.0;
    const totalCycle = phaseDuration * 4;
    const cycle = t % totalCycle;
    const phase = Math.floor(cycle / phaseDuration);
    const phaseT = (cycle - phase * phaseDuration) / phaseDuration;

    // Layout: chart on left 70%, command center on right 30%
    const chartX = 20;
    const chartY = 24;
    const chartW = w * 0.66 - 30;
    const chartH = h - 48;
    const ccX = w * 0.66 + 6;
    const ccY = 24;
    const ccW = w - ccX - 16;

    // Background
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    // Chart area frame
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    // ── Generate ribbon shape per phase ──
    // We trace 80 sample points across the chart width.
    const N = 80;
    const baseY = chartY + chartH * 0.55;
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let core = baseY;
      let spread = 22; // base separation between core and anchor

      if (phase === 0) {
        // DIVERGING — price climbing right, but spread (visualised as ribbon thickness) shrinking
        const climb = -x * chartH * 0.18;
        core = baseY + climb - Math.sin(x * Math.PI * 1.4) * 4;
        // Spread shrinks across the chart even as price climbs — that IS divergence.
        spread = 38 - x * 26;
      } else if (phase === 1) {
        // CURVING — projection bends back. Ribbon trends, then last 25% the projection curls.
        if (x < 0.75) {
          core = baseY + (-x * chartH * 0.22);
        } else {
          // Curl back upward (toward Flow) — engine decelerating
          const curveT = (x - 0.75) / 0.25;
          const apex = baseY + (-0.75 * chartH * 0.22);
          core = apex + curveT * curveT * chartH * 0.10;
        }
        spread = 28 - x * 8;
      } else if (phase === 2) {
        // COILED — Core/Flow/Anchor converge tight band, mostly horizontal.
        core = baseY - Math.sin(x * Math.PI * 1.2) * 3;
        spread = 8 + Math.sin(x * Math.PI * 2) * 2;
      } else {
        // DOUBLE COIL — extreme compression. Lines essentially overlap.
        core = baseY + Math.sin(x * Math.PI * 1.6) * 1.5;
        spread = 4 + Math.sin(x * Math.PI * 3) * 1;
      }

      corePts.push(core);
      flowPts.push(core + spread * 0.45);
      anchorPts.push(core + spread);
    }

    const px = (i: number) => chartX + 10 + (i / (N - 1)) * (chartW - 20);

    // ── Direction color ──
    let dirColor = RIBBON_BULL;
    if (phase === 0) dirColor = RIBBON_BULL; // bull diverging
    else if (phase === 1) dirColor = RIBBON_BEAR; // bear curving (matches Image 3)
    else dirColor = AMBER; // coiled = amber

    // Ribbon outer fill (Core to Anchor)
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    const a3 = phase >= 2 ? 0.18 : 0.22;
    ctx.fillStyle = phase === 1 && t > 1
      ? `rgba(198,40,40,${a3})`
      : phase === 0
      ? `rgba(27,138,122,${a3})`
      : phase === 2
      ? `rgba(255,179,0,${a3 * 1.3})`
      : `rgba(255,179,0,${a3 * 1.5})`;
    ctx.fill();

    // Ribbon inner fill (Core to Flow)
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = phase === 1
      ? 'rgba(198,40,40,0.40)'
      : phase === 0
      ? 'rgba(27,138,122,0.45)'
      : phase === 2
      ? 'rgba(255,179,0,0.32)'
      : 'rgba(255,179,0,0.42)';
    ctx.fill();

    // Core line (the visible thin one)
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = dirColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Phase-specific overlays
    if (phase === 0 && phaseT > 0.4) {
      // Divergence diamond at the right edge (price new high, spread weakening)
      const dx = px(N - 4);
      const dy = corePts[N - 4] - 12;
      const sz = 5 + Math.sin(t * 6) * 1.5;
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(dx, dy - sz);
      ctx.lineTo(dx + sz, dy);
      ctx.lineTo(dx, dy + sz);
      ctx.lineTo(dx - sz, dy);
      ctx.closePath();
      ctx.fill();
    }

    if (phase === 1) {
      // Projection dotted line curling back
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const startX = px(N - 6);
      const startY = corePts[N - 6];
      ctx.moveTo(startX, startY);
      for (let s = 1; s <= 6; s++) {
        const projX = startX + (s / 6) * 30;
        // Quadratic curl-back
        const projY = startY + s * 0.5 + s * s * 0.45;
        ctx.lineTo(projX, projY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (phase === 2 || phase === 3) {
      // COILED label and pulsing emphasis
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255,179,0,${0.5 + pulse * 0.4})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        phase === 2 ? 'COILED' : 'DOUBLE COIL',
        chartX + chartW * 0.5,
        chartY + 18
      );
      if (phase === 3) {
        // Add BB/KC bands also compressed (faint amber overlay around core)
        ctx.strokeStyle = `rgba(255,179,0,${0.25 + pulse * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px(0), corePts[0] - 14);
        for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i] - 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px(0), anchorPts[0] + 14);
        for (let i = 1; i < N; i++) ctx.lineTo(px(i), anchorPts[i] + 14);
        ctx.stroke();
      }
    }

    // ── Phase label (top-left of chart) ──
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    const phaseLabels = ['VOICE 1 \u00B7 DIVERGING', 'VOICE 2 \u00B7 CURVING', 'VOICE 3 \u00B7 COILED', 'VOICE 4 \u00B7 DOUBLE COIL'];
    const phaseColors = [AMBER, AMBER, AMBER, MAGENTA];
    ctx.fillStyle = phaseColors[phase];
    ctx.fillText(phaseLabels[phase], chartX + 10, chartY + 16);

    // ── Command Center panel on right ──
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(ccX, ccY, ccW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(ccX, ccY, ccW, chartH);

    // CC header
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = '#FFB300';
    ctx.fillText('CIPHER PRO', ccX + 8, ccY + 16);

    // CC Ribbon row (the focus)
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Ribbon', ccX + 8, ccY + 38);

    let dirLabel = '';
    let dirLabelColor = TEAL;
    let intelLabel = '';
    let intelColor = AMBER;

    if (phase === 0) {
      dirLabel = '\u25B2 BULL';
      dirLabelColor = TEAL;
      intelLabel = '\u2192 DIVERGING';
      intelColor = AMBER;
    } else if (phase === 1) {
      dirLabel = '\u25BC BEAR';
      dirLabelColor = MAGENTA;
      intelLabel = '\u2192 CURVING';
      intelColor = AMBER;
    } else if (phase === 2) {
      dirLabel = '\u2194 CROSSING';
      dirLabelColor = AMBER;
      intelLabel = '\u2192 COILED';
      intelColor = AMBER;
    } else {
      dirLabel = '\u2194 CROSSING';
      dirLabelColor = AMBER;
      intelLabel = '\u2192 DOUBLE COIL';
      intelColor = MAGENTA;
    }

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = dirLabelColor;
    ctx.fillText(dirLabel, ccX + 50, ccY + 38);
    ctx.fillStyle = intelColor;
    ctx.fillText(intelLabel, ccX + 8, ccY + 56);

    // Other (faded) CC rows for context
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '9px ui-sans-serif, system-ui';
    const fadedRows = ['Pulse', 'Tension', 'Regime', 'Last Signal'];
    fadedRows.forEach((r, i) => {
      ctx.fillText(r, ccX + 8, ccY + 80 + i * 18);
    });

    // Phase progress dots at bottom
    const dotsY = h - 14;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(chartX + 10 + i * 18, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — RibbonAnatomyAnim (S02)
// Three labeled lines (Core, Flow, Anchor) responding to a price move.
// Core hugs the candles tight, Flow lags slightly, Anchor lags more.
// Demonstrates that all three are following price — at different speeds.
// ============================================================
function RibbonAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 20;
    const baseY = padY + chartH * 0.55;

    // Frame
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Generate price as a sine + drift, looped
    const cycle = 9.0;
    const phaseT = (t % cycle) / cycle;

    const N = 60;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const localT = (i / (N - 1) + phaseT) % 1.0;
      const drift = -localT * chartH * 0.22;
      const wave = Math.sin(localT * Math.PI * 3.4) * chartH * 0.12;
      prices.push(baseY + drift + wave);
    }

    // EMA-style alphas — Core fastest, Flow medium, Anchor slowest
    // (Visualises the Pine-side core_alpha / flow_alpha / anchor_alpha cascade.)
    const corePts: number[] = [prices[0]];
    const flowPts: number[] = [prices[0]];
    const anchorPts: number[] = [prices[0]];
    const aCore = 0.45;
    const aFlow = 0.18;
    const aAnchor = 0.08;
    for (let i = 1; i < N; i++) {
      corePts.push(corePts[i - 1] + aCore * (prices[i] - corePts[i - 1]));
      flowPts.push(flowPts[i - 1] + aFlow * (prices[i] - flowPts[i - 1]));
      anchorPts.push(anchorPts[i - 1] + aAnchor * (prices[i] - anchorPts[i - 1]));
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Plot price as faint candles
    for (let i = 0; i < N; i++) {
      const x = px(i);
      const y = prices[i];
      ctx.fillStyle = i % 2 === 0 ? 'rgba(38,166,154,0.45)' : 'rgba(239,83,80,0.45)';
      ctx.fillRect(x - 1.5, y - 4, 3, 8);
    }

    // Plot the three lines
    const plotLine = (pts: number[], color: string, lw: number) => {
      ctx.beginPath();
      ctx.moveTo(px(0), pts[0]);
      for (let i = 1; i < N; i++) ctx.lineTo(px(i), pts[i]);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    plotLine(anchorPts, 'rgba(27,138,122,0.45)', 1.4);
    plotLine(flowPts, 'rgba(27,138,122,0.7)', 1.5);
    plotLine(corePts, RIBBON_BULL, 1.8);

    // Labels at the right edge
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = RIBBON_BULL;
    ctx.fillText('CORE', px(N - 1) + 4, corePts[N - 1] + 3);
    ctx.fillStyle = 'rgba(27,138,122,0.85)';
    ctx.fillText('FLOW', px(N - 1) + 4, flowPts[N - 1] + 3);
    ctx.fillStyle = 'rgba(27,138,122,0.6)';
    ctx.fillText('ANCHOR', px(N - 1) + 4, anchorPts[N - 1] + 3);

    // Caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Three lines, three speeds. Same price feed, three different stories.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — VolumeConvictionAnim (S03)
// An institutional-volume bar fires; Core snaps hard (100%), Flow drags
// (60%), Anchor barely moves (30%). Shows the cascade visually.
// ============================================================
function VolumeConvictionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h * 0.62;
    const volH = h * 0.22;
    const volY = padY + chartH + 10;
    const baseY = padY + chartH * 0.55;

    // Frame chart
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);
    ctx.strokeRect(padX, volY, chartW, volH);

    // Volume label
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('VOLUME', padX + 6, volY + 12);

    // Cycle: 8s. The conviction bar fires at t=3.5 within the cycle.
    const cycle = 8.0;
    const phaseT = t % cycle;
    const fireT = 3.5;

    const N = 50;
    const fireBar = Math.floor(N * 0.55); // bar where the spike happens
    const elapsed = phaseT;

    // Build price walk — flat-ish, then spikes up at fireBar
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let p = baseY + Math.sin(i * 0.4) * 6;
      if (i >= fireBar && elapsed > fireT) {
        // Apply the post-spike drift upward
        p -= Math.min(28, (i - fireBar + 1) * 4);
      }
      prices.push(p);
    }

    // Volume bars — flat, with a 2.5x spike at fireBar
    const volumes: number[] = [];
    for (let i = 0; i < N; i++) {
      let v = 0.4 + Math.random() * 0.1;
      if (i === fireBar && elapsed > fireT) v = 1.0;
      else if (i === fireBar - 1 && elapsed > fireT - 0.3) v = 0.5;
      volumes.push(v);
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Plot volume
    for (let i = 0; i < N; i++) {
      const vh = volumes[i] * (volH - 16);
      const isSpike = i === fireBar && elapsed > fireT;
      ctx.fillStyle = isSpike ? AMBER : 'rgba(255,255,255,0.18)';
      ctx.fillRect(px(i) - 2, volY + volH - 4 - vh, 4, vh);
    }

    // Plot price candles
    for (let i = 0; i < N; i++) {
      const x = px(i);
      const y = prices[i];
      const isSpike = i === fireBar && elapsed > fireT;
      ctx.fillStyle = isSpike ? AMBER : i >= fireBar && elapsed > fireT ? 'rgba(38,166,154,0.6)' : 'rgba(255,255,255,0.3)';
      ctx.fillRect(x - 1.5, y - 5, 3, 10);
    }

    // Three lines — apply volume conviction multiplier asymmetrically
    // Core: 100% (snaps hardest), Flow: 60%, Anchor: 30%.
    const corePts: number[] = [prices[0]];
    const flowPts: number[] = [prices[0]];
    const anchorPts: number[] = [prices[0]];
    for (let i = 1; i < N; i++) {
      const isSpike = i === fireBar && elapsed > fireT;
      const aCoreBase = 0.30;
      const aFlowBase = 0.14;
      const aAnchorBase = 0.07;
      // Volume conviction multiplier: 1.0 normal, ~1.5 on spike. Applied at 100/60/30.
      const vc = isSpike ? 1.5 : 1.0;
      const aCore = Math.min(1.0, aCoreBase * vc);
      const aFlow = Math.min(1.0, aFlowBase * (1.0 + (vc - 1.0) * 0.6));
      const aAnchor = Math.min(1.0, aAnchorBase * (1.0 + (vc - 1.0) * 0.3));
      corePts.push(corePts[i - 1] + aCore * (prices[i] - corePts[i - 1]));
      flowPts.push(flowPts[i - 1] + aFlow * (prices[i] - flowPts[i - 1]));
      anchorPts.push(anchorPts[i - 1] + aAnchor * (prices[i] - anchorPts[i - 1]));
    }

    const plotLine = (pts: number[], color: string, lw: number) => {
      ctx.beginPath();
      ctx.moveTo(px(0), pts[0]);
      for (let i = 1; i < N; i++) ctx.lineTo(px(i), pts[i]);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    plotLine(anchorPts, 'rgba(27,138,122,0.45)', 1.4);
    plotLine(flowPts, 'rgba(27,138,122,0.75)', 1.5);
    plotLine(corePts, RIBBON_BULL, 1.9);

    // Labels at the right
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = RIBBON_BULL;
    ctx.fillText('CORE 100%', px(N - 1) + 4, corePts[N - 1] + 3);
    ctx.fillStyle = 'rgba(27,138,122,0.85)';
    ctx.fillText('FLOW 60%', px(N - 1) + 4, flowPts[N - 1] + 3);
    ctx.fillStyle = 'rgba(27,138,122,0.6)';
    ctx.fillText('ANCHOR 30%', px(N - 1) + 4, anchorPts[N - 1] + 3);

    // Spike marker
    if (elapsed > fireT && elapsed < fireT + 1.5) {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('INSTITUTIONAL BAR', px(fireBar), padY + 20);
    }

    // Bottom caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Same conviction multiplier, three pull strengths.', w / 2, h - 8);

    // Hide unused TEAL var lint
    void TEAL;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — AdaptivePeriodsAnim (S04)
// Two halves of the same chart: trending (efficiency_ratio high) vs
// chop (efficiency_ratio low). The ribbon adapts — wide and breathing
// in trend, tight and flat in chop. Same lines, two behaviours.
// ============================================================
function AdaptivePeriodsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;
    const baseY = padY + chartH * 0.55;

    // Frame
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Mid divider
    const midX = padX + chartW * 0.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,179,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(midX, padY);
    ctx.lineTo(midX, padY + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels above each half
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('TRENDING \u00B7 ER HIGH', padX + chartW * 0.25, padY + 14);
    ctx.fillText('CHOPPING \u00B7 ER LOW', padX + chartW * 0.75, padY + 14);

    // Generate price: left half trends down clean, right half chops.
    const cycle = 6.0;
    const offset = (t % cycle) / cycle;
    const N = 70;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let p = baseY;
      if (x < 0.5) {
        // Trending — clean drift down with mild ripple
        const localT = (x / 0.5 + offset) % 1.0;
        p = baseY - localT * chartH * 0.32 + Math.sin(localT * Math.PI * 4) * 4;
      } else {
        // Chopping — stays around the same level, big swings
        const localX = (x - 0.5) / 0.5;
        p = baseY - chartH * 0.32 + Math.sin(localX * Math.PI * 6 + t * 1.5) * chartH * 0.10;
      }
      prices.push(p);
    }

    // Compute ER on a rolling basis to drive alpha
    const corePts: number[] = [prices[0]];
    const flowPts: number[] = [prices[0]];
    const anchorPts: number[] = [prices[0]];
    for (let i = 1; i < N; i++) {
      // Cheap ER proxy: |p[i]-p[i-10]| / sum |dp|, last 10 bars
      const lookback = Math.min(10, i);
      const change = Math.abs(prices[i] - prices[i - lookback]);
      let vol = 0;
      for (let j = i - lookback + 1; j <= i; j++) vol += Math.abs(prices[j] - prices[j - 1]);
      const er = vol > 0 ? change / vol : 0;
      // Alphas — Core fast/slow ratio approximating Pine logic
      const aCore = Math.min(1.0, Math.pow(er * 0.45 + 0.07, 2) * 9);
      const aFlow = Math.min(1.0, Math.pow(er * 0.32 + 0.05, 2) * 6);
      const aAnchor = Math.min(1.0, Math.pow(er * 0.20 + 0.03, 2) * 4);
      corePts.push(corePts[i - 1] + aCore * (prices[i] - corePts[i - 1]));
      flowPts.push(flowPts[i - 1] + aFlow * (prices[i] - flowPts[i - 1]));
      anchorPts.push(anchorPts[i - 1] + aAnchor * (prices[i] - anchorPts[i - 1]));
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    // Ribbon fill (Core to Anchor)
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.20)';
    ctx.fill();

    // Inner fill
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.40)';
    ctx.fill();

    // Faint price candles
    for (let i = 0; i < N; i++) {
      const x = px(i);
      const y = prices[i];
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x - 1.2, y - 3, 2.4, 6);
    }

    // Core line
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = RIBBON_BULL;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Bottom caption
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Same three lines. ER tells them when to lead and when to lag.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — StackStatesAnim (S05)
// Cycles through three Ribbon states: BULL stacked, CROSSING transition,
// BEAR stacked. Each state held for ~3.5s. The Command Center Ribbon row
// updates in sync. Mirrors what Image 5 (BULL XAU 5m), Image 1 (CROSSING),
// and Image 4 (BEAR BTC 15m) show on real charts.
// ============================================================
function StackStatesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const RIBBON_BULL = '#1B8A7A';
    const RIBBON_BEAR = '#C62828';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w * 0.66 - padX * 1.5;
    const chartH = h - padY * 2 - 20;
    const baseY = padY + chartH * 0.5;
    const ccX = padX + chartW + 14;
    const ccW = w - ccX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const phaseDur = 4.0;
    const cycle = t % (phaseDur * 3);
    const phase = Math.floor(cycle / phaseDur);

    const N = 60;
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];

    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let core = baseY;
      let spread = 24;

      if (phase === 0) {
        core = baseY - x * chartH * 0.22;
        spread = 26;
        corePts.push(core);
        flowPts.push(core + spread * 0.45);
        anchorPts.push(core + spread);
      } else if (phase === 1) {
        const sweep = Math.sin(x * Math.PI - Math.PI / 2);
        core = baseY + sweep * chartH * 0.05;
        const c = core;
        const f = baseY - sweep * chartH * 0.02;
        const a = baseY - sweep * chartH * 0.05;
        corePts.push(c);
        flowPts.push(f);
        anchorPts.push(a);
      } else {
        core = baseY + x * chartH * 0.22;
        spread = 26;
        corePts.push(core);
        flowPts.push(core - spread * 0.45);
        anchorPts.push(core - spread);
      }
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);
    const dirColor = phase === 0 ? RIBBON_BULL : phase === 2 ? RIBBON_BEAR : AMBER;

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle =
      phase === 0
        ? 'rgba(27,138,122,0.22)'
        : phase === 2
        ? 'rgba(198,40,40,0.22)'
        : 'rgba(255,179,0,0.22)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle =
      phase === 0
        ? 'rgba(27,138,122,0.45)'
        : phase === 2
        ? 'rgba(198,40,40,0.45)'
        : 'rgba(255,179,0,0.42)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = dirColor;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const title =
      phase === 0
        ? 'BULL STACK \u00B7 Core > Flow > Anchor'
        : phase === 1
        ? 'CROSSING \u00B7 Lines transitioning'
        : 'BEAR STACK \u00B7 Core < Flow < Anchor';
    ctx.fillStyle = dirColor;
    ctx.fillText(title, padX + chartW / 2, padY + 18);

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(ccX, padY, ccW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(ccX, padY, ccW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFB300';
    ctx.fillText('CIPHER PRO', ccX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Ribbon', ccX + 8, padY + 38);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    if (phase === 0) {
      ctx.fillStyle = TEAL;
      ctx.fillText('\u25B2 BULL', ccX + 50, padY + 38);
      ctx.fillStyle = TEAL;
      ctx.fillText('\u2192 EXPANDING', ccX + 8, padY + 56);
    } else if (phase === 1) {
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2194 CROSSING', ccX + 50, padY + 38);
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2192 FLIP NEAR', ccX + 8, padY + 56);
    } else {
      ctx.fillStyle = MAGENTA;
      ctx.fillText('\u25BC BEAR', ccX + 50, padY + 38);
      ctx.fillStyle = TEAL;
      ctx.fillText('\u2192 EXPANDING', ccX + 8, padY + 56);
    }

    const dotsY = h - 14;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 18, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    void TEAL;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — DivergenceAnim (S06)
// Two panels: top shows price making higher highs, bottom shows the
// ATR-normalised c_spread making LOWER highs. Amber diamond fires on
// detection bar. Mirrors Image 7 (XAU 1W BULL → DIVERGING).
// ============================================================
function DivergenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 28;
    const chartW = w - padX * 2;
    const priceH = h * 0.46;
    const spreadH = h * 0.32;
    const priceY = padY;
    const spreadY = priceY + priceH + 16;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, priceY, chartW, priceH);
    ctx.strokeRect(padX, spreadY, chartW, spreadH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('PRICE', padX + 6, priceY + 12);
    ctx.fillText('RIBBON SPREAD (C-A) / ATR', padX + 6, spreadY + 12);

    const cycle = 10.0;
    const phaseT = (t % cycle) / cycle;

    const N = 70;
    const prices: number[] = [];
    const spreads: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const wave1 = Math.sin(x * Math.PI * 2) * 0.25;
      const drift = -x * 0.45;
      const noise = Math.sin(x * 14) * 0.04;
      const priceNorm = drift + wave1 + noise;
      prices.push(priceY + priceH * 0.55 + priceNorm * priceH * 0.7);

      let spread = 0.0;
      if (x < 0.5) {
        spread = Math.sin(x * Math.PI * 2) * 0.55 + 0.55;
      } else {
        spread = Math.sin(x * Math.PI * 2) * 0.30 + 0.40;
      }
      spreads.push(spreadY + spreadH * 0.85 - spread * spreadH * 0.7);
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW - 12);

    ctx.beginPath();
    ctx.moveTo(px(0), prices[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), prices[i]);
    ctx.strokeStyle = RIBBON_BULL;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px(0), spreads[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), spreads[i]);
    ctx.strokeStyle = 'rgba(38,166,154,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const half1End = Math.floor(N * 0.5);
    let p1MaxIdx = 0;
    for (let i = 0; i < half1End; i++) if (prices[i] < prices[p1MaxIdx]) p1MaxIdx = i;
    let p2MaxIdx = half1End;
    for (let i = half1End; i < N; i++) if (prices[i] < prices[p2MaxIdx]) p2MaxIdx = i;

    let s1MaxIdx = 0;
    for (let i = 0; i < half1End; i++) if (spreads[i] < spreads[s1MaxIdx]) s1MaxIdx = i;
    let s2MaxIdx = half1End;
    for (let i = half1End; i < N; i++) if (spreads[i] < spreads[s2MaxIdx]) s2MaxIdx = i;

    if (phaseT > 0.6) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px(p1MaxIdx), prices[p1MaxIdx]);
      ctx.lineTo(px(p2MaxIdx), prices[p2MaxIdx]);
      ctx.stroke();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px(s1MaxIdx), spreads[s1MaxIdx]);
      ctx.lineTo(px(s2MaxIdx), spreads[s2MaxIdx]);
      ctx.stroke();
      ctx.setLineDash([]);

      const dx = px(p2MaxIdx);
      const dy = prices[p2MaxIdx] - 14;
      const sz = 5 + Math.sin(t * 6) * 1.5;
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(dx, dy - sz);
      ctx.lineTo(dx + sz, dy);
      ctx.lineTo(dx, dy + sz);
      ctx.lineTo(dx - sz, dy);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'center';
      ctx.fillText('DIVERGENCE', dx, dy - 14);
    }

    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Price: higher high. Ribbon spread: lower high. Trend dying inside.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — CurvingProjectionAnim (S07)
// The kinematic projection. Three forward dotted segments at +2, +4, +6
// bars. As time progresses, acceleration overtakes velocity and the
// projection bends back toward Flow. Color shifts from line dir to amber
// when convergence is detected. Mirrors Image 3 (BTC 1h CURVING).
// ============================================================
function CurvingProjectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 32;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 18;
    const baseY = padY + chartH * 0.45;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const cycle = 8.0;
    const cycT = t % cycle;
    const decelStarts = 4.0;
    const decel = Math.max(0, Math.min(1, (cycT - decelStarts) / 3.5));

    const N = 56;
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let core = baseY;
      if (x < 0.85) {
        core = baseY + x * chartH * 0.30 + Math.sin(x * Math.PI * 2.5) * 4;
      } else {
        const flatT = (x - 0.85) / 0.15;
        const apex = baseY + 0.85 * chartH * 0.30;
        core = apex - flatT * decel * chartH * 0.04;
      }
      const spread = 22 - x * 8;
      corePts.push(core);
      flowPts.push(core - spread * 0.45);
      anchorPts.push(core - spread);
    }

    const px = (i: number) => padX + 6 + (i / (N - 1)) * (chartW * 0.78 - 12);

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(198,40,40,0.20)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(198,40,40,0.40)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = '#C62828';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const startX = px(N - 1);
    const startY = corePts[N - 1];
    const vel = (corePts[N - 1] - corePts[N - 4]) / 3;
    const accel = -decel * 0.35;

    const projColor = decel > 0.3 ? AMBER : '#C62828';
    const segs = 3;
    const stepX = (chartW * 0.18) / segs;

    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.6;
    let prevX = startX;
    let prevY = startY;
    for (let s = 1; s <= segs; s++) {
      const tProj = s * 2;
      const projY = startY + vel * tProj + 0.5 * accel * tProj * tProj * 8;
      const projX = startX + s * stepX;
      const fade = 1.0 - (s - 1) * 0.25;
      ctx.strokeStyle = projColor;
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(projX, projY);
      ctx.stroke();
      prevX = projX;
      prevY = projY;
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = projColor;
    ctx.fillText(decel > 0.3 ? 'PROJECTION CURVING' : 'PROJECTION EXTENDING', padX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('velocity', padX + 8, padY + chartH - 24);
    ctx.fillText('acceleration', padX + 8, padY + chartH - 10);
    ctx.fillStyle = vel > 0 ? '#C62828' : RIBBON_BULL;
    ctx.fillText(vel > 0 ? '+ down' : '- up', padX + 60, padY + chartH - 24);
    ctx.fillStyle = accel < 0 ? AMBER : RIBBON_BULL;
    ctx.fillText(accel < 0 ? '- opposing' : '0 aligned', padX + 60, padY + chartH - 10);

    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('When acceleration opposes velocity, the engine is decelerating into a flip.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — CoilDetectionAnim (S08)
// Cycles three states: WIDE (healthy trend), COILED (Ribbon converged
// inside 0.15 ATR), DOUBLE COIL (Ribbon coiled + BB/KC squeeze, both
// compressions present). Energy gauge intensifies with each state.
// ============================================================
function CoilDetectionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w * 0.66 - padX * 1.5;
    const chartH = h - padY * 2 - 18;
    const baseY = padY + chartH * 0.5;
    const ccX = padX + chartW + 14;
    const ccW = w - ccX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const phaseDur = 4.5;
    const cycle = t % (phaseDur * 3);
    const phase = Math.floor(cycle / phaseDur);
    const N = 50;

    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];
    const bbHi: number[] = [];
    const bbLo: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let core = baseY + Math.sin(x * Math.PI * 1.4) * 4;
      let spread = 24;
      if (phase === 1) {
        spread = 7;
        core = baseY + Math.sin(x * Math.PI * 1.4) * 2;
      } else if (phase === 2) {
        spread = 3.5;
        core = baseY + Math.sin(x * Math.PI * 1.4) * 1.2;
      }
      corePts.push(core);
      flowPts.push(core + spread * 0.45);
      anchorPts.push(core + spread);
      const bbW = phase === 2 ? 12 : 36;
      bbHi.push(core - bbW);
      bbLo.push(core + bbW);
    }

    const px = (i: number) => padX + 8 + (i / (N - 1)) * (chartW - 16);

    const dirColor = phase === 0 ? RIBBON_BULL : phase === 2 ? MAGENTA : AMBER;
    const fillC = phase === 0 ? 'rgba(27,138,122,' : phase === 2 ? 'rgba(239,83,80,' : 'rgba(255,179,0,';

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = fillC + '0.22)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = fillC + '0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = dirColor;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    if (phase >= 1) {
      const pulse = phase === 2 ? 0.5 + 0.5 * Math.sin(t * 5) : 0.4;
      ctx.strokeStyle = `rgba(255,179,0,${pulse * 0.6})`;
      ctx.lineWidth = phase === 2 ? 1.3 : 0.9;
      ctx.beginPath();
      ctx.moveTo(px(0), bbHi[0]);
      for (let i = 1; i < N; i++) ctx.lineTo(px(i), bbHi[i]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(0), bbLo[0]);
      for (let i = 1; i < N; i++) ctx.lineTo(px(i), bbLo[i]);
      ctx.stroke();
    }

    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    const titles = ['WIDE \u00B7 healthy trend', 'COILED \u00B7 Ribbon spread < 0.15 ATR', 'DOUBLE COIL \u00B7 Ribbon + BB/KC'];
    ctx.fillStyle = dirColor;
    ctx.fillText(titles[phase], padX + chartW / 2, padY + 18);

    const eX = padX + chartW - 70;
    const eY = padY + 36;
    const eH = chartH - 56;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(eX, eY, 14, eH);
    const energy = phase === 0 ? 0.12 : phase === 1 ? 0.55 : 0.92;
    const fillH = energy * eH;
    ctx.fillStyle = phase === 2 ? MAGENTA : AMBER;
    ctx.fillRect(eX + 1, eY + eH - fillH + 1, 12, fillH - 2);
    ctx.font = '8px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('ENERGY', eX + 7, eY - 6);

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(ccX, padY, ccW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(ccX, padY, ccW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('CIPHER PRO', ccX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Ribbon', ccX + 8, padY + 38);
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    if (phase === 0) {
      ctx.fillStyle = RIBBON_BULL;
      ctx.fillText('\u25B2 BULL', ccX + 50, padY + 38);
      ctx.fillStyle = RIBBON_BULL;
      ctx.fillText('\u2192 EXPANDING', ccX + 8, padY + 56);
    } else if (phase === 1) {
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2194 CROSSING', ccX + 50, padY + 38);
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2192 COILED  6b', ccX + 8, padY + 56);
    } else {
      ctx.fillStyle = AMBER;
      ctx.fillText('\u2194 CROSSING', ccX + 50, padY + 38);
      ctx.fillStyle = MAGENTA;
      ctx.fillText('\u2192 DOUBLE COIL', ccX + 8, padY + 56);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — LifecycleAnim (S09)
// Bar counter ticks up through the lifecycle phases. The 20-stack history
// average is shown as a vertical target line at avg=39 (the XAU 4h figure
// from Image 6). As bar count crosses the phase boundaries (40%, 80%,
// 120%, 160% of avg), the phase label changes.
// ============================================================
function LifecycleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w * 0.62 - padX * 1.5;
    const chartH = h - padY * 2 - 20;
    const ccX = padX + chartW + 14;
    const ccW = w - ccX - padX;
    const baseY = padY + chartH * 0.55;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const cycle = 12.0;
    const cycT = t % cycle;
    const stackAvg = 39;
    const maxBars = stackAvg * 1.9;
    const stackDuration = Math.floor((cycT / cycle) * maxBars);
    const ratio = stackDuration / stackAvg;

    let phase = 'YOUNG';
    let phaseColor: string = TEAL;
    if (ratio > 1.6) {
      phase = 'EXTENDED';
      phaseColor = MAGENTA;
    } else if (ratio > 1.2) {
      phase = 'AGING';
      phaseColor = AMBER;
    } else if (ratio > 0.8) {
      phase = 'MATURE';
      phaseColor = '#FFFFFF';
    } else if (ratio > 0.4) {
      phase = 'PRIME';
      phaseColor = TEAL;
    }

    const barW = (chartW - 30) / maxBars;
    for (let i = 0; i < stackDuration; i++) {
      const bx = padX + 12 + i * barW;
      const localRatio = (i + 1) / stackAvg;
      let bColor = 'rgba(38,166,154,0.5)';
      if (localRatio > 1.6) bColor = 'rgba(239,83,80,0.6)';
      else if (localRatio > 1.2) bColor = 'rgba(255,179,0,0.6)';
      else if (localRatio > 0.8) bColor = 'rgba(255,255,255,0.4)';
      else if (localRatio > 0.4) bColor = 'rgba(38,166,154,0.55)';
      else bColor = 'rgba(38,166,154,0.35)';
      const colH = chartH * 0.25 + (i / maxBars) * chartH * 0.10;
      ctx.fillStyle = bColor;
      ctx.fillRect(bx, baseY - colH / 2, Math.max(1, barW - 1), colH);
    }

    const avgX = padX + 12 + stackAvg * barW;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,179,0,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(avgX, padY + 8);
    ctx.lineTo(avgX, padY + chartH - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('avg ' + stackAvg, avgX, padY + chartH - 4);

    const boundaries = [0.4, 0.8, 1.2, 1.6];
    boundaries.forEach((b) => {
      const x = padX + 12 + b * stackAvg * barW;
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padY + 4);
      ctx.lineTo(x, padY + chartH - 18);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.font = 'bold 16px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = phaseColor;
    ctx.fillText(phase, padX + chartW / 2, padY + 22);

    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(stackDuration + ' bars  \u00B7  ratio ' + ratio.toFixed(2), padX + chartW / 2, padY + 38);

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(ccX, padY, ccW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(ccX, padY, ccW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('CIPHER PRO', ccX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Ribbon', ccX + 8, padY + 38);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = TEAL;
    ctx.fillText('\u25B2 BULL', ccX + 50, padY + 38);
    ctx.fillStyle = phaseColor;
    const intelStr =
      phase === 'YOUNG' || phase === 'PRIME' || phase === 'MATURE'
        ? phase + '  ' + stackDuration + 'b (avg ' + stackAvg + ')'
        : '\u2192 ' + phase + '  ' + stackDuration + 'b (avg ' + stackAvg + ')';
    ctx.fillText(intelStr, ccX + 8, padY + 56);

    void RIBBON_BULL;
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — CrossProximityAnim (S10)
// Core and Flow lines start far apart (bull stack), then Core drops
// toward Flow. When the gap closes below 0.05 ATR, Core flashes amber
// for 1-3 bars BEFORE the actual stack break. The silent fifth voice.
// ============================================================
function CrossProximityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w * 0.66 - padX * 1.5;
    const chartH = h - padY * 2 - 18;
    const baseY = padY + chartH * 0.5;
    const ccX = padX + chartW + 14;
    const ccW = w - ccX - padX;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // Cycle: 8s. Core descends toward Flow gradually.
    const cycle = 8.0;
    const cycT = t % cycle;
    const phaseT = cycT / cycle;

    const N = 60;
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];

    // ATR ref (in pixels) for the 0.05 threshold visualisation
    const atrPx = 60;
    const proxThresholdPx = atrPx * 0.05; // 3px

    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Flow + Anchor are stable, drifting flat
      const flowY = baseY - 8 + Math.sin(x * Math.PI * 1.6) * 2;
      const anchorY = flowY + 18;
      // Core descends from above Flow toward Flow over the cycle.
      // Last 25% of x (recent bars) is where Core has most descended.
      const coreOffset = -22 + x * 18 * phaseT * 1.2;
      const coreY = flowY + coreOffset;
      corePts.push(coreY);
      flowPts.push(flowY);
      anchorPts.push(anchorY);
    }

    const px = (i: number) => padX + 8 + (i / (N - 1)) * (chartW - 16);

    // Outer fill
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.20)';
    ctx.fill();

    // Inner fill
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.40)';
    ctx.fill();

    // Most-recent gap measurement
    const lastCore = corePts[N - 1];
    const lastFlow = flowPts[N - 1];
    const gapPx = Math.abs(lastFlow - lastCore);
    const inProximity = gapPx < proxThresholdPx;

    // Core line — segmented per-bar so we can colour the proximity zone
    // amber while keeping the rest in the trend colour.
    for (let i = 1; i < N; i++) {
      const gap = Math.abs(flowPts[i] - corePts[i]);
      const close = gap < proxThresholdPx;
      ctx.beginPath();
      ctx.moveTo(px(i - 1), corePts[i - 1]);
      ctx.lineTo(px(i), corePts[i]);
      ctx.strokeStyle = close ? AMBER : RIBBON_BULL;
      ctx.lineWidth = close ? 2.0 : 1.7;
      ctx.stroke();
    }

    // Visualise the proximity threshold band — faint amber band 0.05 ATR
    // either side of Flow, shown only on the rightmost ~30% of chart.
    const bandStart = Math.floor(N * 0.7);
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(px(bandStart), flowPts[bandStart] - proxThresholdPx);
    for (let i = bandStart + 1; i < N; i++) ctx.lineTo(px(i), flowPts[i] - proxThresholdPx);
    for (let i = N - 1; i >= bandStart; i--) ctx.lineTo(px(i), flowPts[i] + proxThresholdPx);
    ctx.closePath();
    ctx.fill();

    // Title
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = inProximity ? AMBER : RIBBON_BULL;
    const title = inProximity ? 'CORE WITHIN 0.05 ATR OF FLOW' : 'STACK HEALTHY';
    ctx.fillText(title, padX + chartW / 2, padY + 18);

    // Bottom annotation
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'left';
    ctx.fillText('amber band = 0.05 ATR proximity to Flow', padX + 8, padY + chartH - 6);

    // CC panel
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(ccX, padY, ccW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(ccX, padY, ccW, chartH);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('CIPHER PRO', ccX + 8, padY + 16);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Ribbon', ccX + 8, padY + 38);

    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.fillStyle = inProximity ? AMBER : RIBBON_BULL;
    ctx.fillText('\u25B2 BULL', ccX + 50, padY + 38);
    ctx.fillStyle = inProximity ? AMBER : RIBBON_BULL;
    ctx.fillText(inProximity ? '\u2192 FLIP NEAR' : '\u2192 EXPANDING', ccX + 8, padY + 56);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — PriorityCascadeAnim (S11)
// Visualises the 7-level priority cascade as a vertical stack. Inputs
// fire on the left (rd_active, proj_converging, etc.); the cascade
// evaluates top-down and only the first match emerges on the right
// as the broadcast voice. Cycles through 4 different input states.
// ============================================================
function PriorityCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 18;
    const chartW = w - padX * 2;
    const chartH = h - padY - 18;

    // Cycle 12s — 4 demo states × 3s each
    const phaseDur = 3.0;
    const phase = Math.floor((t % (phaseDur * 4)) / phaseDur);

    // Demo input states for each phase
    type DemoState = {
      rd_active: boolean;
      proj_converging: boolean;
      double_coil: boolean;
      coiled: boolean;
      cross_proximity: boolean;
      stack_aging: boolean;
      lifecycle: boolean;
      expanding: boolean;
    };

    const demos: DemoState[] = [
      // Phase 0: only DIVERGING fires — top of cascade wins
      { rd_active: true, proj_converging: true, double_coil: false, coiled: false, cross_proximity: false, stack_aging: false, lifecycle: true, expanding: true },
      // Phase 1: DIVERGING off, CURVING on
      { rd_active: false, proj_converging: true, double_coil: false, coiled: true, cross_proximity: false, stack_aging: false, lifecycle: true, expanding: true },
      // Phase 2: only DOUBLE COIL fires
      { rd_active: false, proj_converging: false, double_coil: true, coiled: true, cross_proximity: false, stack_aging: false, lifecycle: false, expanding: false },
      // Phase 3: only lifecycle remains
      { rd_active: false, proj_converging: false, double_coil: false, coiled: false, cross_proximity: false, stack_aging: false, lifecycle: true, expanding: true },
    ];
    const demo = demos[phase];

    const levels = [
      { label: 'DIVERGING', input: demo.rd_active, color: AMBER },
      { label: 'CURVING', input: demo.proj_converging, color: AMBER },
      { label: 'DOUBLE COIL', input: demo.double_coil, color: MAGENTA },
      { label: 'COILED', input: demo.coiled, color: AMBER },
      { label: 'FLIP NEAR', input: demo.cross_proximity, color: AMBER },
      { label: 'AGING / EXTENDED', input: demo.stack_aging, color: AMBER },
      { label: 'LIFECYCLE', input: demo.lifecycle, color: TEAL },
      { label: 'EXPANDING / FLAT', input: demo.expanding, color: TEAL },
    ];

    // Find winner (first true input)
    let winnerIdx = -1;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].input) {
        winnerIdx = i;
        break;
      }
    }

    const rowH = (chartH - 28) / levels.length;
    const inputX = padX + 8;
    const labelX = padX + 90;
    const outputX = padX + chartW - 130;

    // Header
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('INPUTS', inputX, padY + 6);
    ctx.fillText('CASCADE', labelX, padY + 6);
    ctx.fillText('BROADCAST', outputX, padY + 6);

    // Draw each cascade level
    levels.forEach((lvl, i) => {
      const y = padY + 18 + i * rowH;
      const isWinner = i === winnerIdx;
      const isSuppressed = winnerIdx !== -1 && i > winnerIdx;

      // Input dot
      ctx.beginPath();
      ctx.arc(inputX + 8, y + rowH / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = lvl.input ? lvl.color : 'rgba(255,255,255,0.12)';
      ctx.fill();

      // Label row
      const rowOpacity = isSuppressed ? 0.20 : isWinner ? 1.0 : 0.55;
      ctx.font = isWinner ? 'bold 11px ui-sans-serif, system-ui' : '11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.globalAlpha = rowOpacity;
      ctx.fillStyle = isWinner ? lvl.color : isSuppressed ? '#666' : '#aaa';
      ctx.fillText(`${i + 1}. ${lvl.label}`, labelX, y + rowH / 2 + 4);
      ctx.globalAlpha = 1;

      // Suppression strikethrough on losers that had input
      if (isSuppressed && lvl.input) {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const tw = ctx.measureText(`${i + 1}. ${lvl.label}`).width;
        ctx.moveTo(labelX - 2, y + rowH / 2 + 1);
        ctx.lineTo(labelX + tw + 2, y + rowH / 2 + 1);
        ctx.stroke();
      }
    });

    // Output box on the right — the broadcast voice
    if (winnerIdx >= 0) {
      const winner = levels[winnerIdx];
      const boxY = padY + chartH / 2 - 20;
      const boxW = 110;
      const boxH = 40;

      // Connecting arrow from winner row to output box
      const winnerY = padY + 18 + winnerIdx * rowH + rowH / 2;
      ctx.strokeStyle = winner.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(labelX + 130, winnerY);
      ctx.lineTo(outputX - 4, boxY + boxH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = `rgba(${winner.color === MAGENTA ? '239,83,80' : winner.color === AMBER ? '255,179,0' : '38,166,154'},0.18)`;
      ctx.fillRect(outputX, boxY, boxW, boxH);
      ctx.strokeStyle = winner.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(outputX, boxY, boxW, boxH);

      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = winner.color;
      ctx.fillText('\u2192 ' + winner.label, outputX + boxW / 2, boxY + boxH / 2 + 4);

      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('Ribbon row says:', outputX + boxW / 2, boxY - 4);
    }

    // Phase progress dots
    const dotsY = h - 8;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(padX + 10 + i * 16, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — RibbonInputsAnim (S12)
// The Ribbon inputs panel. Cycles through Subtle / Normal / Bold
// intensities to show the visible difference. Mirrors the inputs panel
// from Image 1 with the same toggles and dropdown.
// ============================================================
function RibbonInputsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    // Layout: inputs panel left ~40%, mini-chart right ~60%
    const padX = 24;
    const padY = 24;
    const inputsW = w * 0.36;
    const chartX = padX + inputsW + 14;
    const chartW = w - chartX - padX;
    const chartH = h - padY * 2;
    const baseY = padY + chartH * 0.5;

    // Cycle 6s — 3 intensity states × 2s each
    const phaseDur = 2.0;
    const phase = Math.floor((t % (phaseDur * 3)) / phaseDur);
    const intensities = ['Subtle', 'Normal', 'Bold'];
    const intensity = intensities[phase];

    // ── INPUTS PANEL ──
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(padX, padY, inputsW, chartH);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(padX, padY, inputsW, chartH);

    // Group label
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText('CIPHER RIBBON', padX + 12, padY + 18);

    // Toggles (4 inputs from g_ribbon)
    const toggles = [
      { label: 'Cipher Ribbon', on: true },
      { label: 'Intensity', on: false, dropdown: intensity },
      { label: 'Ribbon Divergence', on: true },
      { label: 'Ribbon Projection', on: true },
    ];

    toggles.forEach((tg, i) => {
      const y = padY + 36 + i * 26;
      // Checkbox
      if (tg.dropdown) {
        // Dropdown
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(padX + 12, y - 8, 14, 14);
        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.strokeRect(padX + 12, y - 8, 14, 14);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.40)';
        ctx.strokeRect(padX + 12, y - 8, 14, 14);
        if (tg.on) {
          ctx.fillStyle = AMBER;
          ctx.fillRect(padX + 14, y - 6, 10, 10);
        }
      }
      // Label
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(tg.label, padX + 32, y + 3);

      // Dropdown chip
      if (tg.dropdown) {
        const chipX = padX + inputsW - 60;
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(chipX, y - 9, 48, 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.strokeRect(chipX, y - 9, 48, 16);
        ctx.font = 'bold 10px ui-sans-serif, system-ui';
        ctx.fillStyle = AMBER;
        ctx.textAlign = 'center';
        ctx.fillText(tg.dropdown, chipX + 24, y + 2);
        ctx.textAlign = 'left';
      }
    });

    // ── CHART PREVIEW ──
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(chartX, padY, chartW, chartH);

    // Generate a simple bull ribbon
    const N = 50;
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const core = baseY - x * chartH * 0.20 + Math.sin(x * Math.PI * 2.2) * 5;
      const spread = 22;
      corePts.push(core);
      flowPts.push(core + spread * 0.45);
      anchorPts.push(core + spread);
    }

    const px = (i: number) => chartX + 8 + (i / (N - 1)) * (chartW - 16);

    // Intensity → opacity
    // Subtle = high transparency, Bold = low transparency.
    const transpMap = { Subtle: 0.12, Normal: 0.32, Bold: 0.55 };
    const a = transpMap[intensity as keyof typeof transpMap];

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = `rgba(27,138,122,${a * 0.7})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = `rgba(27,138,122,${a * 1.4})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = RIBBON_BULL;
    ctx.lineWidth = intensity === 'Bold' ? 2.0 : intensity === 'Normal' ? 1.6 : 1.2;
    ctx.globalAlpha = intensity === 'Subtle' ? 0.55 : 1.0;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Caption
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = AMBER;
    ctx.fillText('Intensity: ' + intensity, chartX + chartW / 2, padY + 18);

    // Phase dots
    const dotsY = h - 12;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === phase ? AMBER : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(chartX + 10 + i * 18, dotsY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — RibbonTradingAnim (S13)
// Trade lifecycle: stack flips bull, entry placed at flip+1, stop sits
// just below Cipher Anchor, scale-out happens as spread expands. Three
// stages: ENTRY, SCALE-OUT, EXIT (on stack flip back). Cycles ~10s.
// ============================================================
function RibbonTradingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const RIBBON_BULL = '#1B8A7A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 28;
    const padY = 30;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 18;
    const baseY = padY + chartH * 0.55;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    const cycle = 10.0;
    const cycT = t % cycle;
    const N = 70;

    // Trade markers progress with time
    const showEntry = cycT > 1.5;
    const showScaleOut = cycT > 4.0;
    const showExit = cycT > 7.5;

    // Generate ribbon: starts CROSSING, flips BULL early, runs strong,
    // flattens at the end (exit signal).
    const corePts: number[] = [];
    const flowPts: number[] = [];
    const anchorPts: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let core = baseY;
      let spreadW = 14;
      if (x < 0.15) {
        core = baseY + Math.sin(x * Math.PI * 4) * 4;
        spreadW = 8;
      } else if (x < 0.85) {
        // Bull trend — spread expands
        const trendT = (x - 0.15) / 0.70;
        core = baseY - trendT * chartH * 0.30 + Math.sin(trendT * Math.PI * 3) * 5;
        spreadW = 10 + trendT * 22;
      } else {
        // Flatten — preparing for flip
        const flatT = (x - 0.85) / 0.15;
        const apex = baseY - chartH * 0.30;
        core = apex + flatT * chartH * 0.04;
        spreadW = 32 - flatT * 18;
      }
      corePts.push(core);
      flowPts.push(core + spreadW * 0.45);
      anchorPts.push(core + spreadW);
    }

    const px = (i: number) => padX + 8 + (i / (N - 1)) * (chartW - 16);

    // Outer fill
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), anchorPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.20)';
    ctx.fill();

    // Inner fill
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(i), flowPts[i]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(27,138,122,0.40)';
    ctx.fill();

    // Core line
    ctx.beginPath();
    ctx.moveTo(px(0), corePts[0]);
    for (let i = 1; i < N; i++) ctx.lineTo(px(i), corePts[i]);
    ctx.strokeStyle = RIBBON_BULL;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // ENTRY marker (~bar 12, just after flip confirms)
    const entryIdx = Math.floor(N * 0.20);
    if (showEntry) {
      const ex = px(entryIdx);
      const ey = corePts[entryIdx] + 14;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(ex, ey - 5);
      ctx.lineTo(ex + 5, ey + 4);
      ctx.lineTo(ex - 5, ey + 4);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = TEAL;
      ctx.fillText('ENTRY', ex, ey + 18);

      // Stop line below Anchor
      ctx.strokeStyle = 'rgba(239,83,80,0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      const stopY = anchorPts[entryIdx] + 8;
      ctx.moveTo(px(0) + 4, stopY);
      ctx.lineTo(px(N - 1) - 4, stopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('STOP \u00B7 below Anchor', px(0) + 8, stopY - 4);
    }

    // SCALE-OUT marker (~bar 35, sleeve fully expanded)
    if (showScaleOut) {
      const scaleIdx = Math.floor(N * 0.55);
      const sx = px(scaleIdx);
      const sy = corePts[scaleIdx] - 10;
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = AMBER;
      ctx.fillText('SCALE OUT', sx, sy - 8);
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('(sleeve maxed)', sx, sy + 14);
    }

    // EXIT marker (~bar 60, stack about to flip)
    if (showExit) {
      const exitIdx = Math.floor(N * 0.92);
      const xx = px(exitIdx);
      const xy = corePts[exitIdx] - 10;
      ctx.fillStyle = MAGENTA;
      ctx.beginPath();
      ctx.moveTo(xx, xy + 5);
      ctx.lineTo(xx + 5, xy - 4);
      ctx.lineTo(xx - 5, xy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('EXIT', xx, xy - 8);
    }

    // Top label
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = RIBBON_BULL;
    ctx.fillText('TRADING THE RIBBON', padX + chartW / 2, padY + 18);

    // Stage indicator
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    let stage = 'WAITING';
    if (showExit) stage = 'STAGE 3 \u00B7 EXIT';
    else if (showScaleOut) stage = 'STAGE 2 \u00B7 SCALE OUT';
    else if (showEntry) stage = 'STAGE 1 \u00B7 ENTRY';
    ctx.fillText(stage, padX + chartW / 2, padY + chartH - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherRibbonEngineLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.16-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const quizScore = quizAnswers.filter((ans, i) => {
    if (!quizQuestions[i]) return false;
    const correct = quizQuestions[i].options.find((o) => o.correct)?.id;
    return ans === correct;
  }).length;
  const quizPercent = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
  const quizPassed = quizPercent >= 66;

  useEffect(() => {
    if (quizPassed && quizSubmitted && !certRevealed) {
      const timer = setTimeout(() => {
        setCertRevealed(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [quizPassed, quizSubmitted, certRevealed]);

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #060a12, #0a0f1a)' }}>
      <Confetti active={showConfetti} />
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-900/50">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-accent-500"
          style={{ width: `${Math.min((scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100, 100)}%` }}
        />
      </div>
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-5 py-2.5">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PRO &middot; LEVEL 11</span>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute top-[-50px] right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(217,70,239,0.05),transparent_70%)] pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative z-10">
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 16</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Ribbon Engine<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Four Voices. One Truth.</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The Ribbon doesn&apos;t say one thing. It says four. The CIPHER engine broadcasts the most urgent voice on every bar &mdash; and reading that voice is what separates operators from chart watchers.</motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center gap-1.5">
            <span className="text-xs tracking-widest uppercase text-gray-600">Scroll to begin</span>
            <div className="w-5 h-5 border-r-2 border-b-2 border-amber-400 rotate-45 opacity-50 animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === S00 — First, Why This Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-6">First &mdash; Why This Matters</p>
          <div className="p-6 rounded-2xl glass-card mb-6">
            <p className="text-xl font-extrabold mb-3">Most traders watch one moving average. CIPHER reads four voices from a three-line engine.</p>
            <p className="text-gray-400 leading-relaxed mb-4">A trader stares at a 50 EMA. Price crosses it. They take the trade. Three bars later the cross fails. <strong className="text-amber-400">A moving average can lie.</strong> It tells you where the average has been, never where the engine driving the average is heading.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER throws the simple stack out. In its place sits a three-line adaptive engine &mdash; <strong className="text-white">Cipher Core, Cipher Flow, Cipher Anchor</strong> &mdash; that doesn&apos;t just track price. It speaks. On every bar it broadcasts the single most urgent thing it has to say about the trend, drawn from a priority cascade of <strong className="text-white">four distinct voices</strong>.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where you stop reading the Ribbon as a coloured cloud and start hearing what it&apos;s actually saying. Each voice has its own meaning, its own setup pattern, and its own trading implication. Learn the four and you read the engine, not the price.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE RIBBON OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will know the <strong className="text-white">three lines</strong> that build the engine, the <strong className="text-white">four voices</strong> it broadcasts, the <strong className="text-white">priority cascade</strong> that picks which voice wins, and how to <strong className="text-white">trade each voice</strong> &mdash; entries, stops, scale-outs. You stop watching a coloured cloud. You start operating an engine.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Four Voices (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Four Voices</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Ribbon is broadcasting on every single bar. The Command Center&apos;s Ribbon row has three cells &mdash; label, direction, intelligence &mdash; and the third cell is where the voice speaks. <strong className="text-amber-400">Only one voice plays at a time, but a priority cascade runs underneath choosing which voice is the most urgent thing to say right now.</strong> The cascade is not a coincidence. It is hard-coded order, top-down, with the most-actionable read winning.</p>
          <FourVoicesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. <strong className="text-white">Voice 1 &middot; DIVERGING</strong>: price keeps making new highs but the Ribbon&apos;s internal expansion is shrinking &mdash; the trend is dying from the inside before any oscillator catches it. <strong className="text-white">Voice 2 &middot; CURVING</strong>: the projection bends back toward Flow &mdash; the engine is decelerating into a flip. <strong className="text-white">Voice 3 &middot; COILED</strong>: Core, Flow, and Anchor converge onto each other &mdash; the engine has no edge to anchor to and is loading energy. <strong className="text-white">Voice 4 &middot; DOUBLE COIL</strong>: the Ribbon is coiled AND BB/KC volatility is squeezing simultaneously &mdash; the highest-energy state CIPHER detects. The Ribbon row in the Command Center updates in sync with each voice.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VOICE 1 &middot; DIVERGING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price makes a new high but the Ribbon&apos;s internal spread (Core-to-Anchor, ATR-normalised) makes a lower high. CIPHER catches the trend dying from inside <strong className="text-white">before</strong> the surface shows weakness. Amber diamond marks the bar of detection. No other indicator reads its own engine this deeply.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOICE 2 &middot; CURVING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The kinematic projection (a six-bar forward extrapolation of Cipher Core using its own velocity and acceleration) bends back toward Flow. Acceleration is opposing velocity. The engine itself expects convergence &mdash; a flip is approaching. Dotted projection line shifts to amber.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOICE 3 &middot; COILED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Core, Flow, and Anchor converge within roughly 0.15 ATR of each other. The trend engine is flat &mdash; no directional conviction. Often precedes the most explosive moves because the engine, with no edge to anchor to, suddenly finds one when price commits.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOICE 4 &middot; DOUBLE COIL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Both compressions present: Ribbon coil + BB/KC volatility squeeze. CIPHER&apos;s highest-energy state. Magenta urgency on the Ribbon row because the released breakout is statistically larger than either compression alone.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRIORITY CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING &rarr; CURVING &rarr; DOUBLE COIL &rarr; COILED &rarr; FLIP NEAR &rarr; AGING/EXTENDED &rarr; LIFECYCLE INFO &rarr; EXPANDING/FLAT. The first match wins; everything below is suppressed. This is the same Priority Waterfall doctrine that governs every Command Center cell &mdash; established in Lesson 6.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY ONE VOICE AT A TIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">A row that tries to say five things says nothing. CIPHER chose voice-of-the-bar because operators don&apos;t need a buffet of data points &mdash; they need <strong className="text-white">the single most actionable read</strong> updated every close. The cascade ranking is the priority math; the Ribbon row is the speaker.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE FIFTH (SILENT) VOICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When none of the four loud voices are speaking, the Ribbon row falls through to <strong className="text-white">EXPANDING</strong> (healthy stack widening) or <strong className="text-white">FLAT</strong> (no stack, no compression). Silent because nothing urgent is happening &mdash; ride the trend, no special read required.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at the Ribbon row. Read the third cell. Whatever voice is speaking, that&apos;s the most urgent thing the engine has to say about the trend right now. <strong className="text-white">Don&apos;t reach past it for raw data.</strong> The cascade already chose. Trust the cascade and act on the voice.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Anatomy of the Engine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Anatomy of the Engine</p>
          <h2 className="text-2xl font-extrabold mb-4">Three lines, three speeds, one sleeve around price</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before we read the four voices, we have to know the instrument speaking them. <strong className="text-amber-400">The Ribbon is not five EMAs stacked on top of each other.</strong> It&apos;s three custom adaptive lines &mdash; each computed differently, each tuned to a different role, all wrapping price like a sleeve.</p>
          <RibbonAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three lines. They all follow the same price feed but at different speeds. Core hugs the candles tightest, Flow lags slightly, Anchor lags more. The space between them &mdash; the <strong className="text-white">sleeve</strong> &mdash; is what becomes the coloured ribbon you see on chart. When the sleeve widens, the trend is healthy. When it pinches, the trend is dying or coiling.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER CORE &middot; THE FAST REACTIVE LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Hugs price tightest. Adapts between roughly EMA 2 and EMA 8 depending on conditions. <strong className="text-white">When you see a line plotted on chart, that&apos;s Core.</strong> It&apos;s the only one of the three that&apos;s drawn as a visible line; Flow and Anchor exist as the inner edges of the ribbon&apos;s gradient fills.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER FLOW &middot; THE MID CONFIRMATION LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Confirms direction. Adapts between roughly EMA 4 and EMA 12. Stays close to Core but lags slightly &mdash; it confirms what Core suggests after a beat. The split between Core and Flow is the inner gradient zone (zone 1) &mdash; the brightest band of the Ribbon.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER ANCHOR &middot; THE STRUCTURAL EDGE LINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The slowest. Adapts between roughly EMA 7 and EMA 16. The outer edge of the Ribbon&apos;s sleeve. Validates that the trend has structure beneath it. The ribbon&apos;s width is the Core-to-Anchor gap &mdash; calibrated to stay within roughly 1 ATR so the engine never becomes a cloud spanning the whole chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SLEEVE &middot; NOT A CLOUD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most ribbon indicators draw a giant cloud spanning huge price ranges. CIPHER&apos;s ribbon stays tight on purpose &mdash; usually inside 1 ATR end-to-end. <strong className="text-white">A wide sleeve is a strong trend; a tight sleeve is a forming or dying trend.</strong> Sleeve width is a primary visual signal in itself.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THREE, NOT FIVE OR EIGHT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three is enough to detect stack alignment, internal expansion, and convergence &mdash; the three structural reads CIPHER actually needs. Adding more lines doesn&apos;t add information; it adds visual noise and creates the &ldquo;ribbon as art&rdquo; problem where traders watch the colours shift instead of reading what the engine is saying.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EACH LINE HAS A DIFFERENT FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed">Core, Flow, and Anchor don&apos;t share base alphas. Each is computed from its own efficiency-ratio scaling, its own volatility adjustment, and its own volume-conviction multiplier (more on that in the next section). They are <strong className="text-white">three independent adaptive systems</strong>, not a stack of EMAs with different lengths.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON DIRECTION COLOUR</p>
              <p className="text-sm text-gray-400 leading-relaxed">When Core &gt; Flow &gt; Anchor, the Ribbon is bull-stacked and renders deep ocean teal. When Core &lt; Flow &lt; Anchor, bear-stacked, deep rose red. During the brief transition between stacks, amber. The colour is a <strong className="text-white">consequence</strong> of the relative line positions, not a separate reading.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE READING CHANGES</p>
            <p className="text-sm text-gray-400 leading-relaxed">Once you know it&apos;s three independent lines and not a single stack, the Ribbon stops being a colour and starts being <strong className="text-white">three voices already in conversation with each other</strong>. The four loud voices we just covered are emergent properties of how those three lines arrange themselves &mdash; alignment, separation, convergence, projection.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Volume Conviction Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Volume Conviction Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">Why an institutional bar snaps Core but barely moves Anchor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Standard moving averages don&apos;t care about volume. A bar with 5x average volume contributes the same weight to a 20 EMA as a bar with quarter-volume. <strong className="text-amber-400">CIPHER does care.</strong> It scales each line&apos;s alpha by a volume-conviction multiplier &mdash; and the scaling is asymmetric across the three lines.</p>
          <VolumeConvictionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the chart. A normal volume backdrop, then a 2.5x institutional bar fires. <strong className="text-white">Core snaps hard</strong> toward the new price &mdash; full conviction strength. <strong className="text-white">Flow drags</strong> moderately. <strong className="text-white">Anchor barely moves.</strong> The cascade is by design: institutional truth is fast information that Core should react to, slow information that Anchor should mostly resist until confirmed.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE MULTIPLIER &middot; 0.85x TO 1.5x</p>
              <p className="text-sm text-gray-400 leading-relaxed">Volume conviction is a smoothed multiplier ranging from 0.85 (empty bars) to 1.5 (3x volume). At average volume the multiplier is 1.0 &mdash; nothing changes. The further from average, the more it pulls. Smoothed over 3 bars to prevent single-bar volume spikes from jerking the lines around.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CORE &middot; 100% APPLICATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The full multiplier hits Core&apos;s alpha. A 1.5x conviction bar accelerates Core toward new price by the full 1.5x. <strong className="text-white">Institutional bars literally snap Core to where they want it.</strong> Empty bars at 0.85x slow Core down &mdash; signal that the move isn&apos;t real.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLOW &middot; 60% APPLICATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The conviction strength is dampened to 60% before being applied to Flow&apos;s alpha. <strong className="text-white">Flow responds to institutions but with less urgency.</strong> Confirms what Core suggests on the next institutional bar &mdash; the second confirmation bar, not the first.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ANCHOR &middot; 30% APPLICATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The conviction strength is dampened to 30% before being applied to Anchor&apos;s alpha. Anchor only really shifts on <strong className="text-white">sustained institutional pressure</strong> &mdash; multiple high-volume bars in a row. A single 3x volume bar will not move Anchor much; ten bars of consistent 1.5x will.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE CASCADE EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Different timescales of truth. <strong className="text-white">Core is the fast truth</strong> &mdash; one big bar can be real and Core needs to capture it. <strong className="text-white">Anchor is the structural truth</strong> &mdash; one big bar might be a fake-out and Anchor shouldn&apos;t commit until pressure is sustained. The 100/60/30 split distributes the response across timescales.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT IT MEANS FOR THE SLEEVE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When an institutional bar fires, Core snaps and Anchor doesn&apos;t &mdash; the sleeve <strong className="text-white">widens dramatically</strong>. That widening visualises institutional commitment. A trend that&apos;s expanding the sleeve is being driven by big money; a trend that&apos;s holding sleeve width on flat volume is being driven by retail momentum.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME GLOW &middot; CORE LIGHTS UP</p>
              <p className="text-sm text-gray-400 leading-relaxed">When volume is 1.5x average or higher, the Core line transparency drops &mdash; it visually <strong className="text-white">brightens for that bar</strong>. A brief intensity pulse to mark the bars the market actually cares about. Pair this glow with a stack flip and you have an institutional-conviction entry.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A widening sleeve says <strong className="text-white">institutions are pushing</strong>. A pinching sleeve on retail-grade volume says momentum is fading whether the surface shows it yet or not. Watch the Core glow on volume spikes &mdash; those are the bars that will rewrite the trend.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The Adaptive Periods === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Adaptive Periods</p>
          <h2 className="text-2xl font-extrabold mb-4">The same lines breathe one way in trend, another in chop</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Pop quiz: what&apos;s the &ldquo;period&rdquo; of Cipher Core? <strong className="text-amber-400">Trick question.</strong> It doesn&apos;t have one. The alpha that drives Core is recomputed every bar from a blend of three inputs &mdash; <strong className="text-white">efficiency ratio, volatility ratio, and ADX strength</strong>. The line behaves like an EMA 2 in clean trends and an EMA 8 in chop. Same line, different speed, every bar.</p>
          <AdaptivePeriodsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Two halves of the chart, same Ribbon. Left half: clean trend with high efficiency ratio &mdash; the Ribbon widens, breathes, and tracks fluidly. Right half: chop with low efficiency ratio &mdash; the Ribbon flattens and tightens, refusing to commit. <strong className="text-white">The lines are doing the same thing the whole time.</strong> What changes is the alpha that scales their response.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EFFICIENCY RATIO &middot; ER</p>
              <p className="text-sm text-gray-400 leading-relaxed">ER = absolute price change over the last 10 bars, divided by the sum of bar-by-bar absolute moves. <strong className="text-white">When ER is high (close to 1.0)</strong>, price is moving in a straight line &mdash; trend. <strong className="text-white">When ER is low (close to 0.1)</strong>, price is whipsawing &mdash; chop. The lines speed up when ER is high and slow down when ER is low.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLATILITY RATIO &middot; ATR / ATR-50</p>
              <p className="text-sm text-gray-400 leading-relaxed">Current ATR divided by its 50-period average. When current volatility runs hot relative to recent baseline, alphas adjust. Flow specifically dampens its alpha when volatility ratio &gt; 1.8 &mdash; preventing the line from chasing during news-driven explosions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ADX FACTOR &middot; TREND STRENGTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">ADX divided by 40, capped at 1.0. Used as a directional-confidence injection &mdash; Flow and Anchor blend ADX with ER (Flow at 15%, Anchor at 35%) so they speed up specifically when there&apos;s structural trend strength, not just any directional move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ALPHA FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">alpha = (ER * (fast - slow) + slow)&sup2; * vol_conviction</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Squared because compounding the efficiency penalty produces sharper acceleration in trends and sharper deceleration in chop. Multiplied by the volume conviction multiplier from the previous section.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CORE &middot; ER-DRIVEN, FAST/SLOW = 2/9</p>
              <p className="text-sm text-gray-400 leading-relaxed">Core uses pure ER as its alpha driver. Fast bound = EMA 2 equivalent, slow bound = EMA 9 equivalent. Volume conviction at full strength. Result: hugs price in clean trends, drifts above price in chop &mdash; never chases noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FLOW &middot; ER+ADX BLEND, FAST/SLOW = 4/13</p>
              <p className="text-sm text-gray-400 leading-relaxed">Flow blends max(ER, ADX-factor) with a 0.85 weighting and a 0.15 floor. The floor prevents Flow from going completely flat in deep chop. Volume conviction at 60%. Result: confirms direction with one bar of lag against Core.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ANCHOR &middot; ER+ADX BLEND, FAST/SLOW = 8/17</p>
              <p className="text-sm text-gray-400 leading-relaxed">Anchor uses 65% ER + 35% ADX. It cares more about <strong className="text-white">structural trend strength</strong> than raw price efficiency. Volume conviction at 30%. Result: the slowest, most structural line &mdash; only commits to a direction when there&apos;s real trend underneath.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT TO WATCH</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Ribbon&apos;s <strong className="text-white">breathing rhythm</strong>. In clean trends it widens and tracks fluidly &mdash; the engine is confident. In chop it pinches flat &mdash; the engine is refusing to commit. <strong className="text-amber-400">A pinching Ribbon in what looks like a trend is a warning</strong>: surface direction is real but the engine isn&apos;t buying it. Trust the engine.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Stack States === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Stack States</p>
          <h2 className="text-2xl font-extrabold mb-4">The direction voice &mdash; BULL, BEAR, or CROSSING</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before any of the four loud voices speak, the Ribbon row&apos;s middle cell tells you what state the stack is in. <strong className="text-amber-400">Three states only &mdash; BULL, BEAR, or CROSSING.</strong> No spectrum, no in-between, no fuzzy reads. The cell&apos;s colour matches the state. This is the direction voice, the always-on voice that tells you which side the engine is currently aligned with.</p>
          <StackStatesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the cycle. <strong className="text-white">BULL</strong>: Core sits above Flow which sits above Anchor. The full sleeve renders teal; the row reads <strong className="text-white">&#9650; BULL</strong>. <strong className="text-white">CROSSING</strong>: the lines transition through each other. Sleeve renders amber; the row reads <strong className="text-white">&#8596; CROSSING</strong>. <strong className="text-white">BEAR</strong>: Core below Flow below Anchor. Sleeve renders deep rose; the row reads <strong className="text-white">&#9660; BEAR</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BULL STACK &middot; Core &gt; Flow &gt; Anchor</p>
              <p className="text-sm text-gray-400 leading-relaxed">All three lines aligned upward in the correct order. Sleeve renders ocean teal at full opacity. <strong className="text-white">Means: the engine has bullish conviction.</strong> Trade with-trend longs, treat shorts as counter-trend (or skip entirely if your ruleset is one-direction). The longer the stack holds, the more conviction; the lifecycle voice tells you exactly how long.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BEAR STACK &middot; Core &lt; Flow &lt; Anchor</p>
              <p className="text-sm text-gray-400 leading-relaxed">All three lines aligned downward in the correct order. Sleeve renders deep rose at full opacity. <strong className="text-white">Means: the engine has bearish conviction.</strong> Trade with-trend shorts. Counter-trend longs are skips by default unless a Voice 1 (DIVERGING) signal explicitly tells you the trend is dying.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CROSSING &middot; Lines transitioning</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lines are not in a clean stack &mdash; they&apos;re passing through each other. Sleeve renders amber. <strong className="text-white">Means: the engine has no directional conviction right now.</strong> Skip new directional trades. The two readings to watch are FLIP NEAR (when Core comes within 0.05 ATR of Flow) and the next stack confirmation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION MEMORY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once the Ribbon stacks bull or bear, it <strong className="text-white">stays</strong> that colour until the opposite stack confirms &mdash; the engine doesn&apos;t flicker back to neutral on the first wobble. Amber only displays for the brief window when no stack is currently valid. This memory prevents the visual from flashing on every minor pullback.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT MOST INDICATORS GET WRONG</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 50 EMA / 200 EMA cross system has only TWO stack states &mdash; bull or bear &mdash; and the cross moment itself is the binary trigger. CIPHER&apos;s third state, CROSSING, is not a fudge for ambiguous data; it&apos;s a <strong className="text-white">first-class read</strong>. The engine telling you it has no conviction is more useful than a conviction-less binary read forced to pick a side.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STACK FLIP DEFINED</p>
              <p className="text-sm text-gray-400 leading-relaxed">A stack flip happens when one stack ends and the opposite stack confirms. The transitional CROSSING period in between is genuine open territory &mdash; <strong className="text-white">no trade for the duration</strong>. Forex/crypto pairs typically flip in 1-3 bars; stocks flip in 2-5 bars; weekly timeframes can sit in CROSSING for 5+ bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE READING DOES NOT REPLACE PRICE STRUCTURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A bull stack on the Ribbon is not the same as price being at structural support. Use the stack as a filter on directional setups already grounded in S/R, FVGs, or trend lines. <strong className="text-white">The stack is the trend filter, not the entry trigger.</strong> Entries come from the signal engine (PX, TS) and structure layers.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance at the Ribbon row, read cell two, decide directional bias in two seconds. <strong className="text-white">BULL = look for longs. BEAR = look for shorts. CROSSING = look at nothing, wait.</strong> Then read cell three for the urgent voice that tells you what to do specifically.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Voice 1: DIVERGING === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Voice 1 &middot; DIVERGING</p>
          <h2 className="text-2xl font-extrabold mb-4">The trend is dying from the inside</h2>
          <p className="text-gray-400 leading-relaxed mb-6">This is the voice no other indicator can speak. Most divergence systems compare price against an oscillator &mdash; RSI, MACD, stochastics. <strong className="text-amber-400">CIPHER compares price against the Ribbon&apos;s own internal expansion.</strong> The result is a divergence read that catches trend deterioration before any oscillator-based system catches it, because by the time the oscillator turns the engine has already been weakening for bars.</p>
          <DivergenceAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two-panel chart. Top panel: price. Two waves, each making a higher high &mdash; classic uptrend behaviour. Bottom panel: the Ribbon&apos;s ATR-normalised internal spread. Wave 1&apos;s spread peaks at one level. Wave 2&apos;s spread peaks at a <strong className="text-white">lower level</strong>, even though wave 2&apos;s price was higher. <strong className="text-white">Price made a new high. The engine driving price did not.</strong> An amber diamond fires on the divergence detection bar. The Ribbon row reads <strong className="text-white">&rarr; DIVERGING</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO-WINDOW MATH</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER uses two non-overlapping 14-bar windows: <strong className="text-white">recent</strong> (most recent 14 bars) and <strong className="text-white">prior</strong> (the 14 bars before that). For each window it captures the price extreme and the spread extreme. Bearish divergence fires when recent price high &gt; prior price high but recent spread high &lt; prior spread high &times; 0.85.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.85 GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 15% drop threshold (recent &lt; prior &times; 0.85) is calibrated to filter out noise. A 5% spread reduction during a continuation is normal volatility wobble. A 15%+ drop is a real, meaningful loss of internal expansion &mdash; the kind that historically precedes turns.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONTEXT GATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two context filters prevent false fires. Prior spread peak must be at least 0.3 ATR (no divergence reads off micro-spreads in chop). The Ribbon must currently be stacked bull (for bearish divergence) or bear (for bullish divergence). And ADX must be above 20 &mdash; we only read divergence when there&apos;s a real trend to deteriorate from.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE AMBER DIAMOND</p>
              <p className="text-sm text-gray-400 leading-relaxed">When divergence is detected, an amber diamond plots above the bar (bearish divergence) or below (bullish). It plots <strong className="text-white">on the first bar of detection only</strong> &mdash; not repeatedly. The Ribbon row stays in DIVERGING state as long as the divergence condition holds.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS VOICE WINS THE CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING is the highest-priority voice because it&apos;s the earliest possible warning of trend death. Everything below it in the cascade &mdash; CURVING, COILED, lifecycle &mdash; describes a trend that&apos;s further along the death spiral. <strong className="text-white">DIVERGING catches it first.</strong> If it speaks, listen.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT IT DOES NOT MEAN</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING is not an entry signal for the opposite direction. It&apos;s a <strong className="text-white">warning</strong> that the current trend&apos;s edge is fading. The trade is to <strong className="text-white">tighten stops on with-trend positions</strong>, scale out, or move to break-even. Counter-trend entries should still wait for stack flip confirmation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DURATION MATTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A single bar of DIVERGING that immediately resolves back to EXPANDING is noise. Five or more bars of sustained DIVERGING means the engine&apos;s loss of edge is real. The Ribbon row stays in DIVERGING throughout &mdash; treat each additional bar as cumulative evidence.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE PLAYBOOK</p>
            <p className="text-sm text-gray-400 leading-relaxed">DIVERGING fires while you&apos;re long: <strong className="text-white">tighten stop to break-even, take partial off the table, watch the next 5 bars closely.</strong> If DIVERGING persists, exit the rest. Don&apos;t flip short until the stack flips. The voice tells you the trend is dying; it doesn&apos;t tell you the reversal has started.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Voice 2: CURVING === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Voice 2 &middot; CURVING</p>
          <h2 className="text-2xl font-extrabold mb-4">The engine is decelerating into a flip</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Where DIVERGING reads internal trend deterioration, CURVING reads <strong className="text-amber-400">forward kinematic deceleration</strong>. CIPHER projects Cipher Core six bars into the future using its own velocity and acceleration. When acceleration starts opposing velocity &mdash; the engine slowing before reversing &mdash; the projection bends back toward Flow and the row says <strong className="text-white">CURVING</strong>.</p>
          <CurvingProjectionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the projection. Three dotted segments extend forward from the Core line at +2, +4, +6 bars. <strong className="text-white">Healthy trend</strong>: projection extends straight, in the trend colour. <strong className="text-white">Decelerating trend</strong>: projection curls back &mdash; segments still progress forward in time but with reducing slope, then bending up (in this bear example) toward Flow. The instant convergence is detected, the projection colour shifts to amber. The Ribbon row updates to <strong className="text-white">&rarr; CURVING</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PHYSICS FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">projected = core + velocity &middot; t + 0.5 &middot; acceleration &middot; t&sup2;</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The same formula physics uses for ballistic trajectory. <strong className="text-white">Velocity</strong> = the EMA-smoothed bar-to-bar change in Core position. <strong className="text-white">Acceleration</strong> = the change in velocity over the last 3 bars. Both are derived from Core itself &mdash; the engine projects its own future from its own past.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VELOCITY ALONE IS NOT ENOUGH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A trend with strong negative velocity is just a falling trend. Add positive acceleration (slope getting more negative) and the trend is accelerating downward &mdash; healthy. Add <strong className="text-white">negative acceleration during negative velocity</strong> and the trend is decelerating &mdash; that&apos;s the curve.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONVERGENCE DETECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER computes the +6 bar projection. If the trend is bull (Core above Flow) and the projection at +6 sits BELOW Core &mdash; the projection is sinking back toward Flow. Bear example flips it: Core below Flow, projection at +6 above Core &mdash; rising toward Flow. Either case fires CURVING.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PROJECTION VISUAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three dotted segments. Each fades with distance: segment 1 (current to +2 bars) is widest and most opaque, segment 3 (+4 to +6) is thinnest and most faded. <strong className="text-white">Closer projections are higher confidence; further projections are speculative.</strong> The fade is honest visual epistemology.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CURVING VS DIVERGING</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING reads <strong className="text-white">spread weakness while price still pushes</strong> &mdash; the trend dying from inside. CURVING reads <strong className="text-white">the forward trajectory bending</strong> &mdash; the engine itself decelerating. Both can fire on the same chart, but they catch different stages: DIVERGING earlier (internal), CURVING slightly later (kinematic).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THIS IS NOT A PRICE PREDICTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The projection draws where <strong className="text-white">the Core line itself</strong> is heading, not where price will go. Price can do anything &mdash; the projection just describes the engine&apos;s current trajectory. When the projection bends, the engine&apos;s sense of direction is bending. Price will follow eventually, but timing is not the read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DURATION MATTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">CURVING that resolves back to EXTENDING within 1-2 bars is a noise oscillation in acceleration &mdash; ignore. CURVING that persists for 4+ bars while the stack stays direction-correct is a meaningful trajectory bend. Watch how long the voice holds.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE PLAYBOOK</p>
            <p className="text-sm text-gray-400 leading-relaxed">CURVING fires on a position you&apos;re holding: <strong className="text-white">treat as a soft warning</strong>. Lock in remaining R, stop runners at break-even, don&apos;t add. CURVING that confirms with DIVERGING in the same window is a hard exit signal. CURVING alone is a tightening signal.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Voice 3: COILED + DOUBLE COIL === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Voice 3 &middot; COILED &amp; DOUBLE COIL</p>
          <h2 className="text-2xl font-extrabold mb-4">When the engine has no edge, energy loads</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The third voice is compression. Core, Flow, and Anchor &mdash; three lines that normally maintain a clear sleeve &mdash; <strong className="text-amber-400">converge on each other</strong>. The trend engine flat-lines. No directional conviction. This is the COILED state, and on its own it&apos;s already a tradeable signal. When it pairs with a separate volatility compression (BB inside KC), the result is <strong className="text-white">DOUBLE COIL</strong> &mdash; CIPHER&apos;s highest-energy state.</p>
          <CoilDetectionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Three states cycle. <strong className="text-white">WIDE</strong>: healthy trend, sleeve breathing. <strong className="text-white">COILED</strong>: Ribbon spread (Core-to-Anchor, ATR-normalised) drops below 0.15 for at least 3 bars &mdash; the lines are essentially overlapping. Faint amber BB/KC bands appear. The energy gauge climbs. <strong className="text-white">DOUBLE COIL</strong>: BB also moves inside KC simultaneously. Both compressions present. Bands brighten and pulse. Energy gauge maxes out.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON COIL THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">|c_spread| &lt; 0.15 ATR for 3+ bars</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">c_spread = (Core &minus; Anchor) / ATR. When the absolute value drops below 0.15 for at least 3 consecutive bars, the Ribbon is officially coiled. <strong className="text-white">Three consecutive bars</strong> filters out single-bar overlaps from candle wicks; only sustained compression counts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THIS IS DIFFERENT FROM BB/KC SQUEEZE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most squeeze indicators measure volatility compression &mdash; BB inside KC. CIPHER does that too (Lessons 11.14-15 covered the Coil Box mechanics). But the <strong className="text-white">Ribbon coil is structurally distinct</strong>. BB/KC measures price volatility. Ribbon coil measures whether the trend engine has an edge. They can fire independently.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON COIL ALONE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sometimes the Ribbon coils while volatility stays normal. <strong className="text-white">Engine flat, volatility normal &mdash; that&apos;s usually chop.</strong> Lots of price movement, no directional conviction. Skip directional trades; range-trade off levels.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BB/KC SQUEEZE ALONE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sometimes BB/KC compresses while the Ribbon stays stacked. <strong className="text-white">Volatility compressed, engine still has edge.</strong> The Coil Box arc lessons cover this directly &mdash; expect a directional breakout in the existing trend direction with high probability.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DOUBLE COIL &middot; BOTH PRESENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">When BOTH coils confirm simultaneously, CIPHER fires DOUBLE COIL. <strong className="text-white">The engine has no edge and volatility is compressed.</strong> Direction is genuinely undetermined. Whichever side commits first will produce an outsized move because the move resolves both compressions at once. The Ribbon row renders in MAGENTA &mdash; the only voice that uses urgency-red because it&apos;s the highest-energy state.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE COMMAND CENTER SHOWS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Ribbon row second cell flips to CROSSING (because the lines are overlapping). Third cell shows <strong className="text-white">&rarr; COILED [phase] [bars]</strong> for plain coils &mdash; e.g. &ldquo;&rarr; COILED  DEEP  8b&rdquo;. For DOUBLE COIL, third cell renders <strong className="text-white">&rarr; DOUBLE COIL</strong> in magenta.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PHASES &middot; BUILDING / DEEP / CRITICAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Ribbon coil reports a phase based on bars-compressed. <strong className="text-white">BUILDING</strong>: 1-6 bars. <strong className="text-white">DEEP</strong>: 7-12 bars. <strong className="text-white">CRITICAL</strong>: 13+ bars. The deeper the phase, the more energy has loaded &mdash; and the more violent the eventual release.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON RELEASE SIGNALS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the Ribbon was coiled and the spread starts expanding (returns above 0.30 ATR), CIPHER plots a release marker &mdash; teal circle for bull release (Core &gt; Anchor), magenta circle for bear release. <strong className="text-white">First-bar release</strong> is the breakout entry on this voice.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE PLAYBOOK</p>
            <p className="text-sm text-gray-400 leading-relaxed">COILED voice plays: <strong className="text-white">do not enter directionally yet</strong>. Build a watch list. Mark the recent swing high and swing low &mdash; whichever breaks first is the breakout direction. DOUBLE COIL: same wait, but size up the breakout entry because expected move is materially larger. Stop goes opposite the breakout side, target is the prior swing extreme on the breakout side.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Voice 4: LIFECYCLE === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Voice 4 &middot; LIFECYCLE</p>
          <h2 className="text-2xl font-extrabold mb-4">Where you are inside the trend&apos;s natural lifespan</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first three voices are about urgency &mdash; warnings that something is changing. The fourth voice is about <strong className="text-amber-400">position in time</strong>. Every active stack has a duration, and CIPHER tracks it against a per-asset, per-timeframe rolling average of the last 20 stack durations. That ratio is the lifecycle voice. <strong className="text-white">It tells you whether you&apos;re early in the trend, in the optimal zone, or living past the average.</strong></p>
          <LifecycleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar counter climb. The vertical amber line marks the 20-stack history average &mdash; in this XAUUSD 4h example it&apos;s <strong className="text-white">39 bars</strong> (taken straight from the Pine&apos;s actual storage on a real chart). As the active stack&apos;s duration grows, it crosses phase boundaries. <strong className="text-white">YOUNG</strong> below 40% of average. <strong className="text-white">PRIME</strong> 40-80%. <strong className="text-white">MATURE</strong> 80-120%. <strong className="text-white">AGING</strong> 120-160%. <strong className="text-white">EXTENDED</strong> beyond 160%. The Ribbon row text and colour update at each boundary.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 20-STACK HISTORY</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER stores the duration of the last 20 completed bull and bear stacks combined &mdash; minimum 5 bars to count (filters noise crossovers). When a 21st stack completes, the oldest is dropped. The rolling average is then computed from those 20 durations.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PER-ASSET, PER-TIMEFRAME ADAPTIVE</p>
              <p className="text-sm text-gray-400 leading-relaxed">XAUUSD 4h&apos;s historical average might be 39 bars. EURUSD 15m&apos;s might be 18 bars. NDX 1h&apos;s might be 60 bars. <strong className="text-white">There is no universal &ldquo;trend length&rdquo; constant.</strong> CIPHER learns each asset&apos;s natural rhythm and grades the current stack against that asset&apos;s own history.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 5 PHASES, NOT 3</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three phases (early/mid/late) are too coarse for trade-management decisions. Five phases distinguish &ldquo;safe to enter&rdquo; (YOUNG) from &ldquo;optimal hold&rdquo; (PRIME) from &ldquo;tighten stops now&rdquo; (MATURE) from &ldquo;exit imminent&rdquo; (AGING) from &ldquo;already past expected death&rdquo; (EXTENDED). Each maps to a specific action.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DISPLAY FORMAT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Ribbon row third cell during YOUNG/PRIME/MATURE: <strong className="text-white">&ldquo;PRIME  18b (avg 39)&rdquo;</strong> &mdash; phase, bars-elapsed, comparison to history average. During AGING/EXTENDED, the prefix becomes the cascade arrow: <strong className="text-white">&ldquo;&rarr; AGING  52b (avg 39)&rdquo;</strong> &mdash; the warning treatment.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">YOUNG &middot; below 40% avg &middot; safe to enter</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stack is fresh. Most of the trend&apos;s historical lifespan is still ahead. Entries here have the most distance-to-target before the AGING zone. <strong className="text-white">Highest R:R potential.</strong> Cell colour: teal (when stacked).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRIME &middot; 40-80% avg &middot; ride with confidence</p>
              <p className="text-sm text-gray-400 leading-relaxed">The optimal hold zone. The stack has confirmed beyond noise but is still well within the historical average duration. <strong className="text-white">Hold runners, add on pullbacks if structure permits, don&apos;t over-tighten stops.</strong> Cell colour: teal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MATURE &middot; 80-120% avg &middot; tighten stops</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stack is approaching its average duration. Statistically, the trend has used most of its expected lifespan. <strong className="text-white">Tighten stops, take partial profits, stop adding.</strong> Cell colour: white &mdash; intentionally neutral, neither encouragement nor warning.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">AGING &middot; 120-160% avg &middot; exit imminent</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stack is past the historical average. Continuation here is on borrowed time. <strong className="text-white">Exit runners. New entries are skips by default.</strong> Cell colour: amber. The cascade arrow prefix appears.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EXTENDED &middot; beyond 160% avg &middot; exit or hedge</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stack has lived well past its expected death. Continuation is statistically rare. <strong className="text-white">Flat or hedge.</strong> Cell colour: magenta. The most-actionable lifecycle warning.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DOES NOT MEAN THE TREND WILL DIE TODAY</p>
              <p className="text-sm text-gray-400 leading-relaxed">EXTENDED is a probability statement, not a guarantee. <strong className="text-white">Some trends run 3x average without ending.</strong> The lifecycle voice is one input among the four; combine with DIVERGING/CURVING. An EXTENDED stack with no DIVERGING and no CURVING can still run further; an EXTENDED stack with DIVERGING is a hard exit.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 3+ STACKS REQUIREMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER won&apos;t compute lifecycle until the history has at least 3 completed stacks. On a fresh chart or a recently-changed timeframe, the third cell shows just bar count without the average. Once 3+ stacks have completed, the per-asset adaptive lifecycle kicks in.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN LIFECYCLE WINS THE CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lifecycle ranks lower in the cascade than DIVERGING, CURVING, COILED, and FLIP NEAR. It only speaks when none of those are firing. <strong className="text-white">A trend with no internal warnings, no projection bend, no compression, but living past its average</strong> &mdash; that&apos;s when the lifecycle voice gets the row.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE PLAYBOOK</p>
            <p className="text-sm text-gray-400 leading-relaxed">YOUNG: enter freely on confirmed setups. PRIME: stay in, manage normally. MATURE: tighten, take partials. AGING: exit runners, don&apos;t add. EXTENDED: flat or hedge. <strong className="text-white">The voice tells you the size of stop you can afford to give the trade</strong> &mdash; YOUNG can breathe wide, EXTENDED needs to be on a leash.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Silent Fifth Voice: Cross-Proximity === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Silent Fifth Voice</p>
          <h2 className="text-2xl font-extrabold mb-4">FLIP NEAR &mdash; Core touches Flow before the stack breaks</h2>
          <p className="text-gray-400 leading-relaxed mb-6">There&apos;s a fifth voice the cascade speaks that we haven&apos;t named yet, and it&apos;s the most subtle. <strong className="text-amber-400">When Cipher Core comes within 0.05 ATR of Cipher Flow while the stack is still technically valid, the engine fires a pre-flip warning &mdash; one to three bars before the stack actually breaks.</strong> Core itself shifts to amber on chart. The Ribbon row reads FLIP NEAR.</p>
          <CrossProximityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the simulation. Core descends toward Flow gradually as a bull trend matures. The amber band on the right shows the 0.05 ATR proximity threshold around Flow. The instant Core enters that band, Core line itself flashes <strong className="text-white">amber</strong> &mdash; even though the stack is still bull (Core still above Flow). The Ribbon row instantly switches third cell to <strong className="text-white">FLIP NEAR</strong>. This is the heads-up before the heads-up.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.05 ATR THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">core_flow_dist = abs(Core &minus; Flow) / ATR<br />cross_proximity = (bull_stack OR bear_stack) AND core_flow_dist &lt; 0.05</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The math is simple. The genius is in the threshold &mdash; <strong className="text-white">0.05 ATR is small enough to only trigger when a flip is genuinely imminent</strong>, large enough to give 1-3 bars of advance notice on most timeframes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY GATE ON STACKED-FIRST</p>
              <p className="text-sm text-gray-400 leading-relaxed">The proximity check requires the Ribbon to <strong className="text-white">currently be stacked</strong>. If Core and Flow are already overlapping in CROSSING state, &ldquo;proximity&rdquo; is the default condition &mdash; not a warning. The pre-flip warning only makes sense as a transition signal during an active stack.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CORE FLASHES AMBER ON CHART</p>
              <p className="text-sm text-gray-400 leading-relaxed">During cross-proximity, Core&apos;s line colour shifts from the trend colour (deep teal or rose) to <strong className="text-white">amber</strong>. The shift is visible directly on chart without checking the Command Center. <strong className="text-white">A trend colour Core line that suddenly turns amber is a 1-3 bar advance warning.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME GLOW STILL TAKES PRIORITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a high-volume bar (&gt; 1.5x average) fires during cross-proximity, Core&apos;s transparency drops further &mdash; the line gets brighter even as it stays amber. That combination is the strongest possible flip-imminent signal: the engine is converging AND institutions are pushing on it.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY IT EARNS A CASCADE SLOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">FLIP NEAR sits at position 5 in the cascade &mdash; below DIVERGING, CURVING, DOUBLE COIL, and COILED, but above lifecycle. The reasoning: divergence and curving describe trend death gradually; cross-proximity describes the <strong className="text-white">imminent mechanical break</strong>. It needs to be heard before lifecycle but isn&apos;t as urgent as the higher voices.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FALSE POSITIVE PROFILE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cross-proximity occasionally fires and resolves without a flip &mdash; Core touches Flow, then bounces away as the trend reasserts. That&apos;s expected behaviour, not a bug. <strong className="text-white">Treat FLIP NEAR as a &ldquo;watch this bar closely&rdquo; signal rather than a &ldquo;flip is happening&rdquo; signal.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HOW THIS DIFFERS FROM CURVING</p>
              <p className="text-sm text-gray-400 leading-relaxed">CURVING reads forward kinematic deceleration &mdash; the engine&apos;s projected trajectory. FLIP NEAR reads <strong className="text-white">current geometric proximity</strong> &mdash; the lines are physically close. CURVING fires earlier (the engine is slowing); FLIP NEAR fires later (the engine has nearly arrived at the flip point).</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE PLAYBOOK</p>
            <p className="text-sm text-gray-400 leading-relaxed">FLIP NEAR fires while you&apos;re in a with-trend position: <strong className="text-white">tighten stop to break-even right now</strong>, do not add. If the next 1-3 bars confirm the flip (stack inverts), exit fully. If Core bounces back away from Flow without flipping, your tightened stop has held and the trade can continue. Either way, the warning bought you protection.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The Priority Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Priority Cascade in the Command Center</p>
          <h2 className="text-2xl font-extrabold mb-4">Eight inputs, one broadcast voice</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All five voices we&apos;ve covered &mdash; plus a few quieter readings &mdash; are computed independently every bar. <strong className="text-amber-400">But the Ribbon row only ever broadcasts one.</strong> The cascade is a hard-ranked priority system. The first voice with active input wins the row; everything below it is suppressed even if it&apos;s firing too. This section formalises the order.</p>
          <PriorityCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the simulation. On the left, eight inputs are evaluated each cycle &mdash; some fire, some don&apos;t. The cascade evaluates top-down. <strong className="text-white">First match wins.</strong> Lower-priority inputs may also be true, but they&apos;re struck through (visualised) because the row already has its broadcast. The output box on the right shows the single voice the Ribbon row actually says.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE EIGHT LEVELS, IN ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">1. <strong className="text-white">DIVERGING</strong> &mdash; rd_active. 2. <strong className="text-white">CURVING</strong> &mdash; proj_converging. 3. <strong className="text-white">DOUBLE COIL</strong> &mdash; rs_double_coil. 4. <strong className="text-white">COILED</strong> &mdash; rs_confirmed (with phase + bars). 5. <strong className="text-white">FLIP NEAR</strong> &mdash; cross_proximity. 6. <strong className="text-white">AGING / EXTENDED</strong> &mdash; stack_aging with cascade arrow. 7. <strong className="text-white">LIFECYCLE</strong> info &mdash; YOUNG/PRIME/MATURE displays without arrow. 8. <strong className="text-white">EXPANDING / FLAT</strong> &mdash; the silent default.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANKED BY URGENCY, NOT BY FREQUENCY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The order is not &ldquo;most common voice on top&rdquo; &mdash; it&apos;s <strong className="text-white">most urgent voice on top</strong>. EXPANDING fires far more frequently than DIVERGING, but it sits at the bottom because it carries no operational weight. DIVERGING fires rarely but every fire matters.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SUPPRESSION IS A FEATURE, NOT A BUG</p>
              <p className="text-sm text-gray-400 leading-relaxed">If DIVERGING and COILED fire on the same bar, the row says DIVERGING. The trader cannot see COILED in that moment. <strong className="text-white">That&apos;s deliberate.</strong> A trader trying to absorb both reads would freeze; a trader given the most-urgent read acts. The cascade is the engine&apos;s opinion about what matters most right now.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ROW COLOUR FOLLOWS WINNER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Third-cell colour matches the winning voice. Amber for warnings (DIVERGING, CURVING, COILED, FLIP NEAR, AGING). Magenta for the highest-urgency states (DOUBLE COIL, EXTENDED). Teal for healthy states (YOUNG, PRIME, EXPANDING). White for MATURE &mdash; deliberately neutral.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE SAME DOCTRINE EVERY ROW USES</p>
              <p className="text-sm text-gray-400 leading-relaxed">This Priority Waterfall doctrine runs through every Command Center row in CIPHER. Lesson 6 introduced it formally for the Header row. Every cell in the Command Center is the top of a 5-17 deep priority cascade, evaluated identically. <strong className="text-white">Once you read the Ribbon row this way, the entire Command Center reads this way.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DO NOT TRY TO SEE PAST THE CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some operators want to know all five voices simultaneously. Don&apos;t fight the engine. The cascade has already done the prioritisation work; reading raw inputs is what you&apos;d be doing if CIPHER didn&apos;t exist. <strong className="text-white">Trust the engine&apos;s ranking.</strong> If you need to see suppressed inputs, look at the chart visuals (divergence diamonds, projection lines, ribbon coil glow) &mdash; those still render even when their voice is suppressed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN MULTIPLE VOICES STACK ON CHART</p>
              <p className="text-sm text-gray-400 leading-relaxed">The chart can show multiple visuals simultaneously &mdash; an amber divergence diamond AND a curving projection AND coil bands. <strong className="text-white">The chart is a layered diagnostic; the row is a singular verdict.</strong> Use the chart to confirm the row&apos;s read; never use the row to dismiss what the chart shows.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Glance &mdash; one second &mdash; at the Ribbon row&apos;s third cell. <strong className="text-white">Whatever it says is the most urgent thing happening to the trend right now.</strong> Decide: act, prepare, or wait. The cascade did the thinking; you do the trading.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Inputs === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The CIPHER RIBBON Inputs</p>
          <h2 className="text-2xl font-extrabold mb-4">Four toggles, one dropdown, full control</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s settings panel groups all Ribbon controls under <strong className="text-amber-400">CIPHER RIBBON</strong>. Four bool inputs and one string dropdown. Every voice we&apos;ve covered can be silenced, brightened, or dimmed from these five controls. The defaults are calibrated for most assets and timeframes &mdash; but understanding each input lets you tune visibility without breaking the engine&apos;s reads.</p>
          <RibbonInputsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the chart preview cycle through the three Intensity values. <strong className="text-white">Subtle</strong> dampens fills and thins the Core line &mdash; for ultra-clean charts where the Ribbon is one of many overlays. <strong className="text-white">Normal</strong> is the calibrated default. <strong className="text-white">Bold</strong> brightens fills and thickens the Core line &mdash; for dark themes or when the Ribbon is your primary read.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER RIBBON &middot; the master toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: OFF (the indicator ships with this off so the chart starts clean). When OFF, the engine still runs internally &mdash; the Ribbon row in the Command Center still updates, signals still fire, conviction still evaluates &mdash; but the visual sleeve and Core line are hidden. <strong className="text-white">Turn this on first.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INTENSITY &middot; Subtle / Normal / Bold</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default: Normal. Controls fill opacity and Core line weight. Internally an integer offset (Subtle = +20 transparency, Normal = 0, Bold = -20). <strong className="text-white">Use Subtle when you have many indicators stacked; Bold when the Ribbon is the dominant overlay.</strong> Does not affect engine math &mdash; it&apos;s purely visual.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON DIVERGENCE &middot; default ON</p>
              <p className="text-sm text-gray-400 leading-relaxed">Controls the visibility of the amber divergence diamonds on chart. <strong className="text-white">The Ribbon row still says DIVERGING when this is off</strong> &mdash; only the chart marker hides. Turn off if the diamonds clutter your chart or if you only want to see the row read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON PROJECTION &middot; default ON</p>
              <p className="text-sm text-gray-400 leading-relaxed">Controls the visibility of the three forward dotted projection segments. <strong className="text-white">The Ribbon row still says CURVING when this is off</strong> &mdash; the projection just isn&apos;t drawn on chart. Turn off if you want a cleaner chart and prefer to read CURVING from the row only.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRESETS THAT INCLUDE THE RIBBON</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you set the master Preset (top of inputs) to <strong className="text-white">Trend Trader</strong> or <strong className="text-white">Swing Trader</strong>, the Ribbon is automatically enabled along with Pulse and other relevant overlays. Presets override individual toggles &mdash; set Preset back to None for full manual control.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMMAND CENTER RIBBON ROW TOGGLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Separately, in the COMMAND CENTER input group, there&apos;s a <strong className="text-white">Ribbon</strong> toggle (default OFF) that controls whether the Ribbon row appears in the Command Center at all. <strong className="text-white">Turn this on too.</strong> The row is one of the most information-dense rows CIPHER offers and ships off by default to keep the Command Center compact.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECOMMENDED OPERATOR SETUP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Ribbon ON, Intensity Normal, Divergence ON, Projection ON, Command Center Ribbon row ON. <strong className="text-white">All four chart visuals plus the row.</strong> If you find that too busy after a week of use, drop Projection to off &mdash; the row still says CURVING &mdash; and let the chart stay slightly cleaner.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT NOT TO TURN OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even if you don&apos;t want the chart sleeve, leave the master Cipher Ribbon toggle ON if you want the Command Center row to read at all &mdash; some downstream sub-features gate on the master toggle&apos;s state. <strong className="text-white">If you want a clean chart, dim with Intensity rather than disabling.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five inputs, calibrated defaults. <strong className="text-white">Turn the master toggle on, leave Intensity at Normal, leave Divergence and Projection on.</strong> Tune visibility from there based on what else you have stacked. The math doesn&apos;t change. Only what you can see does.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Trading the Ribbon === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Trading the Ribbon</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry, stop, scale-out, exit &mdash; anchored to the engine</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Ribbon doesn&apos;t fire entry signals on its own &mdash; that&apos;s the Signal Engine&apos;s job (PX, TS, covered in Lessons 11.10-11.13). <strong className="text-amber-400">What the Ribbon does is tell you whether a signal is in a hospitable trend, where to put your stop, and when to start scaling out.</strong> This section maps the four operational decisions to the engine&apos;s readings.</p>
          <RibbonTradingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the trade unfold. The stack flips bull. <strong className="text-white">Entry</strong> placed on the bar after stack confirmation. Stop sits below Cipher Anchor (the structural edge). Trade runs as the sleeve expands. <strong className="text-white">Scale-out</strong> when the sleeve maxes out (peak spread reached). The trend ages, sleeve starts to flatten. <strong className="text-white">Exit</strong> on the next stack flip warning &mdash; either a CURVING projection, a DIVERGING divergence diamond, or the actual flip back to bear.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 1 &middot; ENTRY ELIGIBILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Before taking any signal, check the Ribbon row. <strong className="text-white">BULL stack = longs eligible. BEAR stack = shorts eligible. CROSSING = no directional trades.</strong> The lifecycle voice further filters: YOUNG/PRIME stacks = enter freely on confirmed signals. MATURE = only with strong setups. AGING/EXTENDED = skip. EXTENDED = absolutely not.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 2 &middot; STOP PLACEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The standard Ribbon stop sits just beyond <strong className="text-white">Cipher Anchor</strong> &mdash; the structural edge of the sleeve. For longs: stop below Anchor minus a small ATR buffer. For shorts: stop above Anchor plus buffer. <strong className="text-white">Why Anchor and not Flow or Core?</strong> Anchor is the slowest, most structural line &mdash; it doesn&apos;t flicker on noise. A stop at Anchor only triggers when the engine itself has structurally broken.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 3 &middot; SCALE-OUT TIMING</p>
              <p className="text-sm text-gray-400 leading-relaxed">As the trend matures, the sleeve widens. When sleeve width reaches its <strong className="text-white">recent high</strong> (you&apos;ll see it visually plateau), institutional pressure has fully expressed itself. Scale out a portion. The trend may continue, but the high-conviction phase is over. The remaining runner is for trend extension into AGING territory.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECISION 4 &middot; EXIT TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three exit triggers, in order of urgency: <strong className="text-white">DIVERGING</strong> fires &rarr; tighten stop to break-even, exit on next adverse close. <strong className="text-white">CURVING</strong> fires &rarr; partial exit, runner on tightened stop. <strong className="text-white">FLIP NEAR</strong> &mdash; the cross-proximity warning &mdash; full exit. <strong className="text-white">Stack flip</strong> &mdash; flat by definition, you&apos;re past the exit. Pre-empt the stack flip with one of the earlier voices.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING BY LIFECYCLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lifecycle phase scales position size. <strong className="text-white">YOUNG</strong>: full size. <strong className="text-white">PRIME</strong>: full size. <strong className="text-white">MATURE</strong>: 50% &mdash; the stack is past optimal, take less risk. <strong className="text-white">AGING</strong>: don&apos;t enter, but if already in, hold runner only. <strong className="text-white">EXTENDED</strong>: flat. The voice tells you the stop you can afford; the lifecycle tells you the size you should take.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DOUBLE COIL TRADES ARE DIFFERENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">DOUBLE COIL releases produce outsized moves. The trade pattern is breakout-on-release: <strong className="text-white">mark the recent swing high and swing low while DOUBLE COIL holds; enter on the first close beyond either with size, stop on opposite side of the coil range, target the next major S/R</strong>. Lessons 11.14-15 cover this in operational detail.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON CANNOT BE TRADED ALONE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A bull stack does not mean &ldquo;buy now&rdquo; &mdash; it means &ldquo;longs are eligible.&rdquo; The actual entry needs a confirmed setup from the Signal Engine, structure layer, or imbalance layer. <strong className="text-white">The Ribbon is the trend filter and the stop reference. It is not the entry trigger.</strong> Treating it as the trigger is the most common mistake new operators make &mdash; covered in the next section.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE COMPLETE TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Stack confirms.</strong> Wait for a Signal Engine entry (or structure entry). Take the trade with stop below Anchor. Hold while the row reads YOUNG / PRIME and EXPANDING. Scale out at peak sleeve width. Tighten on first warning voice (CURVING / DIVERGING / FLIP NEAR). Exit before the stack flips. Reset.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Ribbon as Conviction === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Ribbon as Conviction</p>
          <h2 className="text-2xl font-extrabold mb-4">Why the stack is one of four signal-conviction factors</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In Lesson 11.13 we covered the 4-factor conviction score that determines whether a Signal Engine fire is <strong className="text-white">Standard</strong> or <strong className="text-white">Strong</strong>. The four factors: ribbon stack alignment, ADX above 20, volume above 1.0x average, momentum health above 50%. <strong className="text-amber-400">Now you can see why the ribbon stack earned a slot.</strong> A stacked Ribbon is not just a colour &mdash; it&apos;s the engine telling you the trend has structural conviction.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CONVICTION FACTOR 1 &middot; RIBBON STACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">The signal direction must match the active stack. <strong className="text-white">Long signal + bull stack = +1 conviction.</strong> Long signal + bear stack = +0 (signal still fires if other factors compensate, but it fights the trend). The check is on the simple stack boolean &mdash; bull_stack or bear_stack &mdash; computed from Core / Flow / Anchor relative positions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY STACK AND NOT, SAY, LIFECYCLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lifecycle is more granular than stack but it&apos;s also more sensitive to recent stack flips. The stack boolean is binary, decisive, and stable. <strong className="text-white">CIPHER picks the most-decisive Ribbon read for the conviction score</strong> &mdash; not the most-nuanced one. Other voices feed the operator&apos;s decision-making; the stack feeds the math.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIBBON ROW DOES NOT FEED CONVICTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Ribbon row&apos;s third cell &mdash; whatever voice is broadcasting &mdash; <strong className="text-white">does not contribute to conviction scoring</strong>. The conviction math reads only the stack boolean. So a bull stack with DIVERGING active still scores +1 for ribbon conviction (the stack is still bull). The DIVERGING warning is for the operator to interpret separately.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DOUBLE COIL AS A SIGNAL CONTEXT</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a signal fires during DOUBLE COIL, its context tag is automatically marked as &ldquo;DOUBLE COIL&rdquo; in the tooltip &mdash; even though the formal conviction score doesn&apos;t directly reward DOUBLE COIL. <strong className="text-white">Operators recognising the DOUBLE COIL context size up the entry independently.</strong></p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STRONG SIGNAL THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">A signal becomes Strong when it has 3+ of 4 conviction factors. With ribbon stack as one of those four, <strong className="text-white">a Strong signal almost always has the stack on its side</strong>. The few exceptions where stack is contra (stack + 0 ribbon, but +3 from ADX/volume/health) are highest-edge counter-trend reversals &mdash; rare but reliable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT IT MEANS FOR YOUR FILTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you turn on &ldquo;Strong Signals Only&rdquo; in the Signal Engine inputs, you are implicitly demanding that 3 of 4 conviction factors fire. <strong className="text-white">The Ribbon stack alignment is by far the easiest factor to inspect at a glance</strong> &mdash; check the Ribbon row colour. The other three (ADX, volume, momentum health) require reading the Live Conditions sub-panel.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BRIDGE FORWARD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Lesson 11.20 (Cipher Risk Envelope) anchors stop ATR multipliers to ribbon edges. Lesson 11.21 (Cipher Risk Map) uses the ribbon stack as a TP cascade gate. <strong className="text-white">The stack you learned here becomes a primitive used throughout the rest of Level 11.</strong> Owning this lesson is owning a building block.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Ribbon stack is the conviction primitive. <strong className="text-white">If a signal fires while the stack opposes its direction, treat the signal as 1-of-4 weaker</strong> &mdash; and demand confirmation from another non-Ribbon source before taking it. With-stack signals are the engine&apos;s default vote of confidence.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — 6 Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Six Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">How operators misread the Ribbon &mdash; and the corrections</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six failure patterns appear consistently when traders first work with the Ribbon. Each pattern has a specific correction. <strong className="text-amber-400">If you find yourself doing any of these, return to the relevant section above.</strong></p>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &middot; READING THE RIBBON AS AN ENTRY TRIGGER</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> stack flips bull, you take a long. Stack flips bear, you take a short. The Ribbon by itself is the trigger.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> stack flips happen multiple times per session and many of them are noise. Trading every flip is over-trading. The stack is a filter on signals, not a signal itself.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> the Ribbon tells you which direction is eligible. The Signal Engine (PX, TS) tells you when to actually enter. See Section 13.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &middot; IGNORING THE LIFECYCLE VOICE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> bull stack confirms. You take the next pullback long. Stack reads MATURE or AGING. You took it anyway.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> entries in MATURE/AGING stacks have less distance-to-target before the trend ends. Risk-to-reward shrinks. Win rate drops because the stop can&apos;t breathe.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> entries in YOUNG/PRIME, hold runners through MATURE, no new entries in AGING/EXTENDED. See Section 9.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &middot; TREATING DIVERGING AS A FLIP SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> DIVERGING fires while you&apos;re long. You exit and immediately go short.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> DIVERGING means the trend is dying. It does not mean the reversal has started. Many divergences resolve as deep pullbacks within continuing trends, not full reversals. Going short on DIVERGING fights the still-bull stack.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> DIVERGING is an exit warning for with-trend, not an entry for counter-trend. Wait for the actual stack flip before going opposite. See Section 6.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &middot; CONFLATING RIBBON COIL WITH BB/KC SQUEEZE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> the Ribbon coils. You assume volatility is also compressed. You expect a breakout move &mdash; but volatility is normal and the &ldquo;coil&rdquo; just chops sideways.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> Ribbon coil and BB/KC squeeze are independent compressions. Ribbon coil alone usually means chop, not pre-breakout. The breakout edge comes from DOUBLE COIL specifically.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> wait for DOUBLE COIL (both compressions) before sizing for a breakout trade. See Section 8.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-4">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &middot; STOPPING TOO TIGHT, INSIDE THE SLEEVE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> long entry. Stop placed inside the Ribbon sleeve, often near Cipher Core. Pullback hits Core, stops you out. Trend continues.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> Core moves quickly &mdash; it&apos;s the fast line by design. Stops at Core get whipsawed on every minor pullback. The sleeve&apos;s purpose is to give the trend room to breathe.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> stops go below (long) or above (short) <strong className="text-white">Cipher Anchor</strong> &mdash; the structural edge &mdash; not Core or Flow. See Section 13.</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6">
            <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &middot; READING ALL FOUR VOICES AT ONCE</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">The pattern:</strong> you try to inspect every voice every bar. DIVERGING? CURVING? COIL bars? Lifecycle phase? You feel paralysed by the volume of reads.</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-2"><strong className="text-white">Why it fails:</strong> CIPHER&apos;s cascade already prioritises the voices for you. Trying to read every voice manually duplicates work the engine has done and slows your decision-making.</p>
            <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">The correction:</strong> read the Ribbon row. Cell 2 = direction. Cell 3 = the most urgent voice. Two cells, two seconds. The chart visuals are there for layered confirmation, but the row is the verdict. See Section 11.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE PATTERN BENEATH THE PATTERNS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five of these six mistakes share one root: <strong className="text-white">treating the Ribbon as more than it is, or less than it is</strong>. More than: an entry trigger, a flip signal, a breakout signal alone. Less than: ignoring lifecycle, stopping too tight inside the sleeve. The Ribbon is the trend filter and the stop reference. Treat it as such and most failure patterns dissolve.</p>
          </div>
        </motion.div>
      </section>

      {/* === CHEAT SHEET === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">The Ribbon Engine, condensed</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print-it-out reference. Each section below distills one concept from the lesson into a single read-aloud sentence plus the one number or rule you actually need at the moment of decision.</p>
          <div className="p-6 rounded-2xl glass-card">
            <div className="pb-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE THREE LINES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Core (fast, EMA 2-8 equivalent, 100% volume conviction). Cipher Flow (mid, EMA 4-12, 60% conviction). Cipher Anchor (slow, EMA 7-16, 30% conviction). Sleeve = Core to Anchor, calibrated under 1 ATR.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE FOUR LOUD VOICES</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING (price up, spread down, &times; 0.85 gate). CURVING (projection bends, accel opposes vel). COILED (|c_spread| &lt; 0.15 ATR, 3+ bars). DOUBLE COIL (Ribbon coil + BB/KC squeeze).</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE FIFTH (PROXIMITY) VOICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">FLIP NEAR &mdash; Core within 0.05 ATR of Flow while still stacked. Core line shifts amber for 1-3 bars before the actual stack break.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LIFECYCLE PHASES</p>
              <p className="text-sm text-gray-400 leading-relaxed">YOUNG (&lt;40% avg). PRIME (40-80%). MATURE (80-120%). AGING (120-160%). EXTENDED (&gt;160%). Average is computed from last 20 stack durations on the current asset/timeframe.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRIORITY CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">DIVERGING &rarr; CURVING &rarr; DOUBLE COIL &rarr; COILED &rarr; FLIP NEAR &rarr; AGING/EXTENDED &rarr; LIFECYCLE info &rarr; EXPANDING/FLAT. First match wins; rest suppressed.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE FIVE INPUTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Ribbon (master toggle). Intensity (Subtle/Normal/Bold). Ribbon Divergence (chart diamond visibility). Ribbon Projection (chart projection visibility). Plus Command Center Ribbon row toggle.</p>
            </div>
            <div className="py-4 border-b border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRADING RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry on Signal Engine fire while stack matches direction. Stop below Anchor (long) / above Anchor (short). Scale out at peak sleeve width. Exit on first warning voice (CURVING / DIVERGING / FLIP NEAR).</p>
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold text-amber-400 mb-1">THE CONVICTION SLOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bull/bear stack alignment is one of four conviction factors (with ADX &gt; 20, volume &gt; 1.0x, health &gt; 50). Strong Signal = 3+ of 4. Stack is the fastest-to-check factor.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Ribbon Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real Command Center read &mdash; voice identification, lifecycle interpretation, conviction scoring, stop placement, cascade priority resolution. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: gameRounds[gameRound].scenario }} />
            <p className="text-sm font-semibold text-white mb-4">{gameRounds[gameRound].prompt}</p>
            <div className="space-y-2">
              {gameRounds[gameRound].options.map((opt) => {
                const answered = gameSelections[gameRound] !== null;
                const selected = gameSelections[gameRound] === opt.id;
                const isCorrect = opt.correct;
                let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                return (
                  <div key={opt.id}>
                    <button
                      onClick={() => {
                        if (gameSelections[gameRound] !== null) return;
                        const next = [...gameSelections];
                        next[gameRound] = opt.id;
                        setGameSelections(next);
                      }}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-xl transition-all text-sm ${cls}`}
                    >
                      <span className="text-gray-200" dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '\u2713' : '\u2717'} {opt.explain}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            {gameSelections[gameRound] !== null && gameRound < gameRounds.length - 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
                <button onClick={() => setGameRound(gameRound + 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-accent-500 text-white text-sm font-bold active:scale-95 transition-transform">Next Round &rarr;</button>
              </motion.div>
            )}
            {gameSelections[gameRound] !== null && gameRound === gameRounds.length - 1 && (() => {
              const finalScore = gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-lg font-extrabold text-amber-400">{finalScore}/{gameRounds.length} Correct</p>
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade Ribbon reading installed. You hear the voices instead of staring at colour.' : finalScore >= 3 ? 'Solid grasp. Re-read the four voices (S06-S09), the priority cascade (S11), and the trading playbook (S13) before the quiz.' : 'Re-study the engine anatomy (S02-S04), the four voices (S06-S09), and the six mistakes (S15) before the quiz.'}</p>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* === S17 — Final Quiz === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">17 &mdash; Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-6">Final Quiz &mdash; {quizQuestions.length} Questions</h2>
          <div className="space-y-6">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="p-5 rounded-2xl glass-card">
                <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2">Question {qi + 1} of {quizQuestions.length}</p>
                <p className="text-sm font-semibold text-white mb-4">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const answered = quizAnswers[qi] !== null;
                    const selected = quizAnswers[qi] === opt.id;
                    const isCorrect = opt.correct;
                    let cls = 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]';
                    if (answered && selected && isCorrect) cls = 'bg-green-500/10 border border-green-500/30';
                    if (answered && selected && !isCorrect) cls = 'bg-red-500/10 border border-red-500/30';
                    if (answered && !selected && isCorrect) cls = 'bg-green-500/5 border border-green-500/20';
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (quizAnswers[qi] !== null) return;
                          const next = [...quizAnswers];
                          next[qi] = opt.id;
                          setQuizAnswers(next);
                          if (next.every(a => a !== null)) setQuizSubmitted(true);
                        }}
                        disabled={answered}
                        className={`w-full text-left p-3 rounded-xl transition-all text-sm ${cls}`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[qi] !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-amber-400"><span className="font-bold">&#9989;</span> {q.explain}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {quizSubmitted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
              <p className="text-3xl font-extrabold mb-2">{quizPercent}%</p>
              <p className="text-sm text-gray-400">{quizPassed ? 'You passed! Certificate unlocked below.' : 'You need 66% to earn the certificate. Review and try again.'}</p>
            </motion.div>
          )}
          {certRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mt-10">
              <div className="max-w-md mx-auto p-10 rounded-3xl relative overflow-hidden border border-amber-500/20" style={{ background: 'linear-gradient(145deg, rgba(13,19,32,1), rgba(20,28,46,1))' }}>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(245,158,11,0.06),transparent,rgba(14,165,233,0.04),transparent)] animate-spin" style={{ animationDuration: '12s' }} />
                <div className="relative z-10 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">&#9636;</div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Certificate of Completion</p>
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.16: Cipher Ribbon Engine</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Ribbon Operator &mdash;</p>
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
      {/* === LESSON COMPLETE === */}

    </div>
  );
}
