// app/academy/lesson/cipher-sweeps/page.tsx
// ATLAS Academy — Lesson 11.19: Cipher Sweeps [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Trap Is The Setup.
// Covers: liquidity sweep geometry (wick beyond a swing + close back inside),
//         the 3-bar age requirement, multi-level mechanics, the 5-factor
//         strength score (wick depth, volume, rejection quality, with-trend,
//         multi-level), STRONG/MODERATE/WEAK ladder, strength-adaptive
//         diamond + dotted-line visuals, the 6-line tooltip, FVG confluence
//         (within 0.5 ATR + direction match) — the apex setup, failed sweep
//         detection (next bar closes beyond swept level → continuation),
//         the 6-verdict Sweep cascade (NO SWEEPS / FAILED / HOT+FVG /
//         HOT / COOLING / COLD), the signal context cascade where Sweep
//         tops Breakout/Snap/Exhaustion/everything else, trade plans for
//         both reversal and failure-continuation, with-trend vs counter-
//         trend reads, edge cases, mistakes.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Cipher Sweeps challenges
// String-id answers, per-option explanations (teaches on wrong answers).
// Covers: cascade verdict reading, strength-score interpretation,
//         FVG confluence priority, failed-sweep mechanics, with vs
//         counter-trend trade selection, signal context cascade.
// FILLED IN PHASE 3A — placeholder shells for now.
// ============================================================
const gameRounds: {
  id: string;
  scenario: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; explain: string }[];
}[] = [
  {
    id: 'r1-xau-1m-strong-sell',
    scenario: 'XAU 1M  \u00B7  SELL SWEEP  STRONG (4/5)  \u00B7  Level 2067.000  \u00B7  Wick 0.65 ATR  \u00B7  Vol 1.25x  \u00B7  Counter-trend  \u00B7  \u26A1 MULTI-LEVEL \u2014 3 levels raided',
    prompt: 'A STRONG counter-trend sell sweep just printed on XAU monthly with multi-level confluence. Three swing highs got raided in one bar. What is the operator\u2019s read?',
    options: [
      { id: 'a', text: 'BUY \u2014 the wick already exhausted the move; expect a continuation up', correct: false, explain: 'A sell sweep means stops were grabbed ABOVE then close came back below. The trade direction is DOWN, not up. Reading the wick alone without the close-back-inside is the classic Mistake 1.' },
      { id: 'b', text: 'SELL \u2014 stops grabbed above; expect reversal DOWN', correct: true, explain: 'Correct. The diamond color encodes trade direction: magenta sell sweep = stops grabbed above = expect drop. The closing line of the tooltip says exactly this verbatim. STRONG + multi-level on a counter-trend monthly sweep is structurally significant; this is a major-pivot reversal candidate.' },
      { id: 'c', text: 'SKIP \u2014 counter-trend STRONG sweeps fail too often to trade', correct: false, explain: 'Counter-trend sweeps are reversal candidates, not skip-by-default. Counter-trend STRONG specifically requires four of four non-trend factors to fire \u2014 it is a high-bar score, not a low-conviction one. Skipping it discards the engine\u2019s reading entirely.' },
      { id: 'd', text: 'WAIT \u2014 hold off until the cascade reads HOT + FVG \u2605', correct: false, explain: 'The cascade already reads HOT \u2014 REVERSAL LIKELY at 0\u20131 bars ago. Waiting for FVG confluence on a 4/5 multi-level sweep means missing the trade. The apex tag is a bonus, not a prerequisite for STRONG sweeps.' },
    ],
  },
  {
    id: 'r2-btc-5m-failed',
    scenario: 'BTC 5m  \u00B7  ▼ SELL SWEEP  MODERATE (3/5)  \u00B7  2 bars ago  \u00B7  Next bar just closed BEYOND the swept high',
    prompt: 'You entered short on the bear sweep two bars ago. The next bar just closed ABOVE the swept high. The Command Center cascade just flipped to FAILED \u2014 CONTINUATION. What now?',
    options: [
      { id: 'a', text: 'Hold the short \u2014 price will likely come back inside the swept high', correct: false, explain: 'Holding through a failed sweep is exactly Mistake 2. Hope is not a strategy. The close-beyond is hard evidence the reversal read is dead; staying short risks turning a 1R loss into 2\u20133R as continuation runs.' },
      { id: 'b', text: 'Exit the short at market and immediately enter LONG on the failure-bar close', correct: true, explain: 'Correct. The continuation playbook says: exit immediately, flip direction, enter long at the failure-bar close, stop tucked inside the original sweep bar with 0.25 ATR buffer, target the next structural level. Failed sweeps frequently produce 2\u20133R continuation moves because two cohorts of liquidity feed the move.' },
      { id: 'c', text: 'Add to the short on the close-beyond bar \u2014 averaging down lowers the basis', correct: false, explain: 'Adding to a losing position into a confirmed failure is the single fastest way to turn a normal trade into a catastrophic one. The cascade just told you the read is wrong; doubling down on the wrong read compounds the error.' },
      { id: 'd', text: 'Move the stop wider to give the trade more room', correct: false, explain: 'Widening stops on a failed setup converts a controlled 1R loss into an uncontrolled larger loss. The original stop level was correct; the failure flag means the entry premise is invalidated. Discipline says exit, not adjust.' },
    ],
  },
  {
    id: 'r3-cascade-priority',
    scenario: 'Cascade inputs  \u00B7  ago = 2  \u00B7  fvg_confluence = TRUE  \u00B7  failed = TRUE',
    prompt: 'A sweep printed two bars ago WITH FVG confluence, AND the failure flag just fired. Which Sweep cascade verdict appears in the Command Center?',
    options: [
      { id: 'a', text: 'HOT + FVG \u2605 \u2014 because confluence is the highest reversal-conviction tag', correct: false, explain: 'In isolation HOT + FVG \u2605 would be position 3, but the cascade is checked top-down and FAILED \u2014 CONTINUATION sits at position 2. Failure outranks confluence \u2014 the failure flag invalidates the reversal read regardless of how clean the original sweep was.' },
      { id: 'b', text: 'HOT \u2014 REVERSAL LIKELY \u2014 because the sweep is fresh', correct: false, explain: 'HOT (no FVG) is position 4 in the cascade. Both FAILED (position 2) and HOT + FVG \u2605 (position 3) sit above it. The cascade short-circuits at the first match; lower verdicts never get evaluated.' },
      { id: 'c', text: 'FAILED \u2014 CONTINUATION \u2014 because failure outranks confluence', correct: true, explain: 'Correct. The 6-verdict Sweep cascade is: 1.NO SWEEPS, 2.FAILED, 3.HOT+FVG \u2605, 4.HOT, 5.COOLING, 6.COLD. First-match-wins. Failure direction-flips the read; even apex confluence cannot override that. Operator action: flip to continuation entry.' },
      { id: 'd', text: 'COOLING \u2014 WATCH \u2014 because both flags partially cancel', correct: false, explain: 'The cascade is not a fuzzy weighted score. It is a deterministic top-down conditional check. Conditions don\u2019t cancel each other; the first true condition sets the verdict. COOLING fires only when HOT/FAILED/HOT+FVG all fail \u2014 not the case here.' },
    ],
  },
  {
    id: 'r4-sizing-apex',
    scenario: 'EUR daily  \u00B7  STRONG (5/5) BUY SWEEP  \u00B7  HOT + FVG \u2605  \u00B7  with-trend  \u00B7  base risk discipline = 1R',
    prompt: 'Your normal STRONG sweep size is 1R. The cascade just fired HOT + FVG \u2605 \u2014 the apex setup. What size do you take?',
    options: [
      { id: 'a', text: '1R \u2014 always trade the same size; consistency beats over-thinking', correct: false, explain: 'Sizing identically across quality and apex tiers is Mistake 4 \u2014 missing the FVG bonus. The apex setup is rare AND high-conviction; sizing flat means leaving the engine\u2019s most reliable signal at the same return as the average. Edge that doesn\u2019t get sized doesn\u2019t get realized.' },
      { id: 'b', text: '0.5R \u2014 confluence setups are rare so they\u2019re probably overfit', correct: false, explain: 'Cutting size on the apex setup is the worst possible response. The 0.5 ATR + direction-match double gate is strict on purpose; when both gates pass, the engine has cleared a high bar. Confidence is justified, not suspect.' },
      { id: 'c', text: '1.5\u20132R \u2014 apex setup justifies the upsize', correct: true, explain: 'Correct. The cheat sheet locks the size table: STRONG = 1R baseline, HOT + FVG \u2605 = 1.5R baseline, 2R if multi-level or flipped level. EUR daily STRONG with confluence is exactly the setup the engine is most reliable on; the operator\u2019s job is to honor the apex tag with size.' },
      { id: 'd', text: '5R \u2014 confluence is a near-guaranteed reversal so size aggressively', correct: false, explain: 'No setup is near-guaranteed. Even apex sweeps can fail (~30% baseline failure rate applies). Sizing 5R on any single trade is portfolio-destroying risk regardless of conviction; one failure obliterates ten wins worth of returns. Discipline caps individual risk.' },
    ],
  },
  {
    id: 'r5-edge-news',
    scenario: 'NFP releases in 12 minutes  \u00B7  CIPHER just fired a STRONG buy sweep on EUR/USD 5m with HOT + FVG \u2605 verdict',
    prompt: 'The cascade looks textbook \u2014 STRONG quality, fresh sweep, FVG confluence. But NFP is 12 minutes away. What is the disciplined operator\u2019s response?',
    options: [
      { id: 'a', text: 'Take the trade \u2014 the apex tag overrides every other consideration', correct: false, explain: 'No tag overrides news risk. CIPHER will detect sweeps during news periods, but the institutional-stop-run interpretation breaks down \u2014 moves become information-shock-driven, not pattern-driven. The engine\u2019s normal reading framework no longer applies.' },
      { id: 'b', text: 'Take the trade with reduced size \u2014 NFP can be tradable', correct: false, explain: 'Reducing size doesn\u2019t fix the deeper problem: the pattern interpretation itself is unreliable in the news window. The size adjustment alone cannot rescue a setup whose underlying premise (institutional liquidity hunt) is about to be overridden by macro information flow.' },
      { id: 'c', text: 'Skip the trade \u2014 within 30 min of major news, sweeps don\u2019t apply normally', correct: true, explain: 'Correct. The S14 edge-case rule: skip every sweep within 30 minutes of a known major news release, regardless of cascade verdict or strength score. Pattern-trading and news-trading are different disciplines; conflating them destroys the operator\u2019s edge. After the news has been digested (typically 60\u2013120 min), normal sweep interpretation resumes.' },
      { id: 'd', text: 'Take the trade but move the stop wider to absorb news volatility', correct: false, explain: 'Wider stops convert a 1R risk into 3\u20135R risk on the same setup, dramatically degrading R:R. NFP can produce 50\u201380 pip moves in seconds; no reasonable stop adjustment makes the trade properly risk-managed. Skipping is the only disciplined response.' },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 multiple-choice. 13 correct: true total
// (5 game + 8 quiz).
// ============================================================
const quizQuestions: {
  id: string;
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explain: string;
}[] = [
  {
    id: 'q1-bull-geometry',
    question: 'What two conditions must hold simultaneously for CIPHER to confirm a BULL sweep?',
    options: [
      { id: 'a', text: 'low > swing_low AND close < swing_low', correct: false },
      { id: 'b', text: 'low < swing_low AND close > swing_low', correct: true },
      { id: 'c', text: 'high > swing_high AND close < swing_high', correct: false },
      { id: 'd', text: 'low < swing_low AND close < swing_low', correct: false },
    ],
    explain: 'A bull sweep is a wick that pierces BELOW a swing low (low < swing_low) AND a body that closes BACK ABOVE that level (close > swing_low). Both conditions on the same bar. Option (a) describes a bar that never reached the level. Option (c) is the bear sweep geometry. Option (d) is a clean breakdown \u2014 wick AND close beyond \u2014 the opposite of a sweep.',
  },
  {
    id: 'q2-age-gate',
    question: 'CIPHER applies a 3-bar age gate to sweep detection. What does this gate require?',
    options: [
      { id: 'a', text: 'The swept level must be at least 3 bars old (bar_index \u2212 lvl_bar > 3)', correct: true },
      { id: 'b', text: 'The sweep bar itself must close within 3 bars of the level', correct: false },
      { id: 'c', text: 'The Command Center cascade must show HOT for at least 3 bars', correct: false },
      { id: 'd', text: 'The trader must wait 3 bars after the sweep before entering', correct: false },
    ],
    explain: 'The age gate enforces that the swept level was a structural pivot, not a fresh micro-pivot. The condition bar_index \u2212 lvl_bar > 3 means the swing high or swing low formed at least 3 bars before the raid bar. Stops need time to gather; a level that\u2019s only 1\u20132 bars old does not yet have meaningful liquidity behind it. The gate filters out micro-noise pivots.',
  },
  {
    id: 'q3-factor-4',
    question: 'Which strength factor specifically rewards alignment with the prior trend?',
    options: [
      { id: 'a', text: 'Factor 1 \u2014 wick depth > 0.3 ATR', correct: false },
      { id: 'b', text: 'Factor 2 \u2014 volume > 1.2x average', correct: false },
      { id: 'c', text: 'Factor 4 \u2014 with-trend (ribbon_dir match)', correct: true },
      { id: 'd', text: 'Factor 5 \u2014 multi-level (\u22652 levels raided)', correct: false },
    ],
    explain: 'Factor 4 is the trend alignment factor. It fires when the sweep direction matches the Cipher Ribbon stack direction (bull sweep with up-stacked ribbon, bear sweep with down-stacked ribbon). With-trend sweeps get one free point in the score before the other factors are evaluated. Counter-trend STRONG sweeps must therefore earn 4 of the 4 non-trend factors \u2014 a structurally harder bar to clear, which is why counter-trend STRONG sweeps are rarer and more meaningful.',
  },
  {
    id: 'q4-fvg-confluence',
    question: 'For FVG confluence to fire, BOTH gates must pass. What are they?',
    options: [
      { id: 'a', text: 'Sweep within 1 ATR of any FVG, regardless of FVG direction', correct: false },
      { id: 'b', text: 'Sweep within 0.5 ATR of FVG midpoint AND direction match (bull sweep \u00B7 bull FVG)', correct: true },
      { id: 'c', text: 'Sweep at any distance from a direction-matched FVG', correct: false },
      { id: 'd', text: 'Sweep occurs AFTER the FVG fills, in the direction of the original FVG', correct: false },
    ],
    explain: 'Confluence requires AND of two conditions: (1) proximity \u2014 the swept level must be within half an ATR of an active FVG\u2019s MIDPOINT (not edge); (2) direction match \u2014 a bull sweep needs a bull FVG nearby, a bear sweep needs a bear FVG. Either gate failing kills confluence. The 0.5 ATR cap is intentionally tight; the direction-match prevents spurious triggers from any-FVG-near-any-sweep noise.',
  },
  {
    id: 'q5-failure-detection',
    question: 'When does CIPHER detect that a sweep has FAILED?',
    options: [
      { id: 'a', text: 'When the sweep score drops below 2/5', correct: false },
      { id: 'b', text: 'When 5 bars pass without price reversing', correct: false },
      { id: 'c', text: 'When the bar AFTER the sweep closes BEYOND the swept level', correct: true },
      { id: 'd', text: 'When the FVG confluence flag de-activates', correct: false },
    ],
    explain: 'Failure detection runs on bar = last_sweep_bar + 1. The check is: if it was a bull sweep, did the next bar close BELOW the swept low? If a bear sweep, did the next bar close ABOVE the swept high? Either condition latches the failure flag. Failure is a 2-bar pattern \u2014 the sweep bar plus the bar after \u2014 not a multi-bar timeout. The Command Center cascade flips to FAILED \u2014 CONTINUATION (amber) within the 5-bar actionable window.',
  },
  {
    id: 'q6-cascade-priority',
    question: 'In the Sweep cascade, which verdict OUTRANKS HOT + FVG \u2605?',
    options: [
      { id: 'a', text: 'COOLING \u2014 WATCH', correct: false },
      { id: 'b', text: 'COLD', correct: false },
      { id: 'c', text: 'HOT \u2014 REVERSAL LIKELY', correct: false },
      { id: 'd', text: 'FAILED \u2014 CONTINUATION', correct: true },
    ],
    explain: 'The 6-verdict cascade order: 1.NO SWEEPS, 2.FAILED \u2014 CONTINUATION, 3.HOT + FVG \u2605, 4.HOT \u2014 REVERSAL LIKELY, 5.COOLING \u2014 WATCH, 6.COLD. Failure outranks confluence because failure DIRECTION-FLIPS the read; even apex setups cannot override the contradiction. Mechanically: when both flags are true, the cascade matches at position 2 and never evaluates position 3. The operator\u2019s playbook also flips \u2014 from reversal trade to continuation trade.',
  },
  {
    id: 'q7-reversal-t1',
    question: 'In the standard reversal plan, where is T1 (the first scaling target)?',
    options: [
      { id: 'a', text: 'The next FVG midpoint or structural level in the trade direction', correct: true },
      { id: 'b', text: 'Exactly 1R from entry, regardless of structure', correct: false },
      { id: 'c', text: 'The bar high of the sweep candle', correct: false },
      { id: 'd', text: 'The far edge of the swept FVG', correct: false },
    ],
    explain: 'T1 targets the midpoint of the nearest opposing FVG (filled or active) in the trade direction. Failing that, the nearest structural S/R level. FVG midpoints are magnetic \u2014 price returns to fill them with statistical regularity, and the midpoint is more reliable than the far edge. T1 is where the operator scales 50% out and moves the stop on the balance to break-even, locking the trade as positive expectation regardless of what happens to T2.',
  },
  {
    id: 'q8-with-trend-read',
    question: 'A buy sweep prints in a strong uptrend (Cipher Ribbon stacked up). How should the operator read it?',
    options: [
      { id: 'a', text: 'Reversal candidate \u2014 expect the trend to flip down', correct: false },
      { id: 'b', text: 'Skip \u2014 with-trend sweeps are noise in trending markets', correct: false },
      { id: 'c', text: 'Shakeout \u2014 continuation play, target tight (next FVG mid)', correct: true },
      { id: 'd', text: 'Apex \u2014 always size 2R on with-trend STRONG sweeps', correct: false },
    ],
    explain: 'A sweep aligned with the prior trend is a shakeout \u2014 institutions briefly grab stops in a counter-direction wick, then resume the trend. The trade is short-duration, mean-reversion-style: enter long on the close, target tight (next FVG midpoint), expect continuation. Counter-trend sweeps target the prior trend extreme (T2); with-trend sweeps target the next structure level (T1). Reading the trend wrong inflates target expectations and degrades win rate \u2014 that\u2019s Mistake 5.',
  },
];

// ============================================================
// ANIMSCENE — viewport-gated rAF canvas wrapper
// Mirrors the gold-standard pattern from L11.11 onward.
// Animations only run while the canvas is visible — pauses when
// the user scrolls past, resumes when it scrolls back into view.
// devicePixelRatio scaling for crisp rendering on retina displays.
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
// Fires once on quiz pass + cert reveal, renders 120 particles
// in CIPHER brand colors, persists 5 seconds then unmounts.
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
// ANIMATION 1 — TheTrapIsTheSetupAnim (S01 Groundbreaking Concept)
// The headline visual. A retail trader sets a stop just below a
// recent swing low. Price drifts down, hunts, wicks below the stop
// (TRIGGERED — out of position), then closes back ABOVE the level.
// The wick is the trap: that single bar grabs liquidity then the
// chart reverses upward. The bar that LOOKS like a breakdown IS
// the reversal setup. The trap is the setup — that exact phrase
// surfaces as the closing caption.
// ============================================================
function TheTrapIsTheSetupAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2 - 22;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, chartW, chartH);

    // 14s cycle in 4 phases:
    // 0 - 3s: setup — swing low forms, retail stops set just below
    // 3 - 6s: drift toward the level (institutional bait)
    // 6 - 9s: the SWEEP — wick punches below the level, closes back inside
    // 9 - 14s: the reversal — price rallies up from the trap
    const cycle = 14.0;
    const cycT = t % cycle;

    const N = 32;
    const baseY = padY + chartH * 0.55;
    const swingBar = 6;     // where the swing low forms (the level)
    const sweepBar = 18;    // the bar that wicks below + closes back above

    type Candle = { open: number; high: number; low: number; close: number };
    const candles: Candle[] = [];

    for (let i = 0; i < N; i++) {
      let mid = baseY;
      if (i < swingBar) {
        // Pre-swing rally then descent into the swing low
        mid = baseY - 18 + i * 1.5 + Math.sin(i * 0.8) * 2;
      } else if (i === swingBar) {
        // Swing low forms — deepest dip pre-sweep
        mid = baseY + 6;
      } else if (i < sweepBar - 4) {
        // Bounce away from the swing low (level holds)
        mid = baseY + 4 - (i - swingBar) * 0.6;
      } else if (i < sweepBar) {
        // Drift back down toward the level — the bait
        const drift = (i - (sweepBar - 4)) / 4;
        mid = baseY - 2 + drift * 6;
      } else if (i === sweepBar) {
        // The sweep candle — large lower wick, but body closes back ABOVE
        mid = baseY + 2;
      } else if (i < 26) {
        // Rally away from the trap — the reversal
        mid = baseY + 2 - (i - sweepBar) * 2.6;
      } else {
        // Continued rally
        mid = baseY - 18 - (i - 26) * 1.2;
      }
      let openY = mid - 3;
      let closeY = mid + 3;
      let highY = mid - 6;
      let lowY = mid + 6;
      if (i === sweepBar) {
        // Long lower wick, small body, closes ABOVE the swing level
        openY = baseY + 2;
        closeY = baseY - 2;
        highY = baseY - 4;
        lowY = baseY + 22; // wick punches well below
      }
      candles.push({ open: openY, close: closeY, high: highY, low: lowY });
    }

    // The swept level — drawn from the swing low (its low value) at swingBar
    const sweptLevel = candles[swingBar].low;

    // Reveal logic — bar by bar based on phase
    let revealIdx = 0;
    if (cycT < 3) {
      revealIdx = Math.min(N - 1, Math.floor((cycT / 3) * (swingBar + 2)));
    } else if (cycT < 6) {
      revealIdx = Math.min(N - 1, Math.floor(swingBar + 2 + ((cycT - 3) / 3) * (sweepBar - swingBar - 2 - 1)));
    } else if (cycT < 9) {
      revealIdx = Math.min(N - 1, Math.floor(sweepBar - 1 + ((cycT - 6) / 3) * 3));
    } else {
      revealIdx = Math.min(N - 1, Math.floor(sweepBar + 1 + ((cycT - 9) / 5) * (N - sweepBar - 2)));
    }

    const px = (i: number) => padX + 14 + (i / (N - 1)) * (chartW - 28);

    // ── Draw the swept level dotted line ──
    if (revealIdx >= swingBar) {
      ctx.strokeStyle = `rgba(255,255,255,${cycT < 6 ? 0.35 : 0.2})`;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(swingBar), sweptLevel);
      ctx.lineTo(px(N - 1), sweptLevel);
      ctx.stroke();
      ctx.setLineDash([]);

      // "Stops resting" label appears in phases 1-2
      if (cycT < 6 && revealIdx > swingBar + 1) {
        ctx.font = 'bold 9px ui-sans-serif, system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'left';
        ctx.fillText('Retail stops resting below', px(swingBar) + 4, sweptLevel + 12);
      }
    }

    // ── Diamond at the swept level once the sweep fires ──
    if (revealIdx >= sweepBar) {
      const dx = px(sweepBar);
      const dy = sweptLevel;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(dx, dy - 5);
      ctx.lineTo(dx + 5, dy);
      ctx.lineTo(dx, dy + 5);
      ctx.lineTo(dx - 5, dy);
      ctx.closePath();
      ctx.fill();

      // Pulsing glow halo on the diamond during phase 3
      if (cycT >= 6 && cycT < 9) {
        const pulse = (Math.sin((cycT - 6) * 6) + 1) * 0.5;
        ctx.strokeStyle = `rgba(38,166,154,${0.3 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx, dy, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Draw candles up to revealIdx ──
    for (let i = 0; i <= revealIdx && i < N; i++) {
      const c = candles[i];
      const isUp = c.close < c.open;
      const isSweepCandle = i === sweepBar;
      // Sweep candle is amber to mark the trap
      const fill = isSweepCandle ? AMBER : isUp ? 'rgba(38,166,154,0.78)' : 'rgba(239,83,80,0.78)';
      ctx.fillStyle = fill;
      ctx.strokeStyle = fill;
      ctx.lineWidth = 1;
      // Wick
      ctx.beginPath();
      ctx.moveTo(px(i), c.high);
      ctx.lineTo(px(i), c.low);
      ctx.stroke();
      // Body
      const bodyW = isSweepCandle ? 4 : 3.2;
      ctx.fillRect(px(i) - bodyW / 2, Math.min(c.open, c.close), bodyW, Math.abs(c.close - c.open));
    }

    // ── Phase narrative label (top center) ──
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    let phaseLabel = '';
    let phaseColor: string = TEAL;
    if (cycT < 3) {
      phaseLabel = 'SWING LOW FORMS \u00B7 STOPS COLLECT BELOW';
      phaseColor = 'rgba(255,255,255,0.7)';
    } else if (cycT < 6) {
      phaseLabel = 'PRICE DRIFTS BACK \u00B7 THE BAIT';
      phaseColor = AMBER;
    } else if (cycT < 9) {
      phaseLabel = 'WICK PUNCHES THROUGH \u00B7 STOPS GRABBED \u00B7 CLOSE BACK INSIDE';
      phaseColor = AMBER;
    } else {
      phaseLabel = 'REVERSAL UP \u00B7 THE TRAP IS THE SETUP';
      phaseColor = TEAL;
    }
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseLabel, padX + chartW / 2, padY + 16);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('The wick that takes out liquidity is the same wick the operator buys behind.', padX + chartW / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — SweepGeometryAnim (S02)
// The detection rules in motion. Two side-by-side panels:
//   LEFT: BULLISH sweep — price[low] < swing_low AND close > swing_low
//   RIGHT: BEARISH sweep — price[high] > swing_high AND close < swing_high
// Each panel highlights the swing level, the wick that pierces it, and
// the close-back-inside which validates the sweep. The 3-bar age check
// (lvl_bar must be at least 4 bars old) is shown via a dimmed level on
// the bull panel that is disqualified for being too fresh.
// ============================================================
function SweepGeometryAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 18;
    const padY = 28;
    const gap = 12;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padY * 2 - 24;

    // 12s cycle — both panels animate in lockstep
    const cycle = 12.0;
    const cycT = t % cycle;
    // Panels show: bar drift (0-4s) → wick + close (4-8s) → diamond + label (8-12s)
    const phase = cycT < 4 ? 0 : cycT < 8 ? 1 : 2;

    const N = 14;

    type Panel = {
      x: number;
      title: string;
      titleColor: string;
      direction: 'bull' | 'bear';
    };
    const panels: Panel[] = [
      { x: padX, title: 'BULLISH SWEEP', titleColor: TEAL, direction: 'bull' },
      { x: padX + panelW + gap, title: 'BEARISH SWEEP', titleColor: MAGENTA, direction: 'bear' },
    ];

    panels.forEach((p) => {
      // Frame
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(p.x, padY, panelW, panelH);

      // Title
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = p.titleColor;
      ctx.fillText(p.title, p.x + panelW / 2, padY + 14);

      // Build candles
      const baseY = padY + panelH * 0.5;
      const swingBar = 3; // the level being raided
      const sweepBar = 9; // the wick that grabs liquidity

      type Candle = { open: number; high: number; low: number; close: number };
      const candles: Candle[] = [];
      const isBull = p.direction === 'bull';
      for (let i = 0; i < N; i++) {
        let mid = baseY;
        if (i < swingBar) {
          mid = baseY - (isBull ? -8 : 8) + i * 1.5;
        } else if (i === swingBar) {
          // The swing extreme
          mid = baseY + (isBull ? 12 : -12);
        } else if (i < sweepBar - 1) {
          mid = baseY + (isBull ? 6 : -6) - (i - swingBar) * (isBull ? 1.2 : -1.2);
        } else if (i < sweepBar) {
          mid = baseY + (isBull ? 2 : -2);
        } else if (i === sweepBar) {
          // The sweep bar — body closes back inside, wick pierces
          mid = baseY + (isBull ? -2 : 2);
        } else {
          mid = baseY - (isBull ? 4 : -4) - (i - sweepBar) * (isBull ? 2.5 : -2.5);
        }
        let openY = mid - 2;
        let closeY = mid + 2;
        let highY = mid - 5;
        let lowY = mid + 5;
        if (i === sweepBar) {
          if (isBull) {
            openY = baseY + 1;
            closeY = baseY - 3; // close ABOVE swing low
            highY = baseY - 5;
            lowY = baseY + 18; // wick BELOW swing low
          } else {
            openY = baseY - 1;
            closeY = baseY + 3; // close BELOW swing high
            highY = baseY - 18; // wick ABOVE swing high
            lowY = baseY + 5;
          }
        }
        candles.push({ open: openY, close: closeY, high: highY, low: lowY });
      }

      const swingLevel = isBull ? candles[swingBar].low : candles[swingBar].high;

      const reveal = phase === 0 ? Math.floor((cycT / 4) * (sweepBar - 1)) : phase === 1 ? Math.floor(sweepBar - 1 + ((cycT - 4) / 4) * 1.5) : N - 1;
      const revealIdx = Math.min(N - 1, reveal);

      const xOf = (i: number) => p.x + 8 + (i / (N - 1)) * (panelW - 16);

      // Swing level dotted line
      if (revealIdx >= swingBar) {
        ctx.strokeStyle = `rgba(255,255,255,${phase >= 1 ? 0.4 : 0.25})`;
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xOf(swingBar), swingLevel);
        ctx.lineTo(xOf(N - 1), swingLevel);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Diamond once sweep fires
      if (revealIdx >= sweepBar && phase >= 2) {
        const dx = xOf(sweepBar);
        const dy = swingLevel;
        ctx.fillStyle = isBull ? TEAL : MAGENTA;
        ctx.beginPath();
        ctx.moveTo(dx, dy - 4);
        ctx.lineTo(dx + 4, dy);
        ctx.lineTo(dx, dy + 4);
        ctx.lineTo(dx - 4, dy);
        ctx.closePath();
        ctx.fill();
      }

      // Candles
      for (let i = 0; i <= revealIdx && i < N; i++) {
        const c = candles[i];
        const isUp = c.close < c.open;
        const isSweep = i === sweepBar;
        const fill = isSweep ? AMBER : isUp ? 'rgba(38,166,154,0.75)' : 'rgba(239,83,80,0.75)';
        ctx.fillStyle = fill;
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xOf(i), c.high);
        ctx.lineTo(xOf(i), c.low);
        ctx.stroke();
        ctx.fillRect(xOf(i) - 1.5, Math.min(c.open, c.close), 3, Math.abs(c.close - c.open));
      }

      // Bottom caption — formula
      ctx.font = '8px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      const formula = isBull ? 'low < swing_low  AND  close > swing_low' : 'high > swing_high  AND  close < swing_high';
      ctx.fillText(formula, p.x + panelW / 2, padY + panelH + 12);
    });

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Wick beyond the swing. Body back inside. Both required \u2014 no exceptions.', padX + (panelW * 2 + gap) / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — StrengthLadderAnim (S03)
// The 0-5 score visualised as a vertical ladder. Three example
// sweeps (WEAK 1/5, MODERATE 3/5, STRONG 5/5) rise in turn,
// each broken into the 5 contributing factors lighting up sequentially:
// 1. Wick depth > 0.3 ATR
// 2. Volume > 1.2x avg
// 3. Body / range < 0.4
// 4. With-trend alignment
// 5. Multi-level (2+ levels)
// The matching quality label (WEAK / MODERATE / STRONG) appears
// at the top in the appropriate brand color.
// ============================================================
function StrengthLadderAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 24;
    const padY = 28;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2 - 18;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(padX, padY, innerW, innerH);

    // 18s cycle, three example sweeps cycle through (each 6s)
    const cycle = 18.0;
    const cycT = t % cycle;
    const exampleIdx = Math.floor(cycT / 6); // 0 = WEAK, 1 = MOD, 2 = STRONG
    const exampleT = cycT - exampleIdx * 6; // 0-6s within example

    // Example data — matches Pine factor definitions
    type Example = { label: string; score: number; color: string; factors: boolean[] };
    const examples: Example[] = [
      // WEAK 1/5 — only wick depth qualifies (small thin wick on a quiet bar)
      { label: 'WEAK', score: 1, color: 'rgba(255,255,255,0.6)', factors: [true, false, false, false, false] },
      // MODERATE 3/5 — wick depth + volume + rejection quality (with-trend miss, single level)
      { label: 'MODERATE', score: 3, color: AMBER, factors: [true, true, true, false, false] },
      // STRONG 5/5 — all five factors lit (big with-trend multi-level liquidity event)
      { label: 'STRONG', score: 5, color: TEAL, factors: [true, true, true, true, true] },
    ];

    const ex = examples[exampleIdx];

    // ── Quality label header (top) ──
    ctx.font = 'bold 13px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = ex.color;
    ctx.fillText(ex.label + '  (' + ex.score + '/5)', padX + innerW / 2, padY + 18);

    // ── Factor ladder ──
    const labels = [
      'Wick depth > 0.3 ATR',
      'Volume > 1.2\u00D7 avg',
      'Body / range < 0.4',
      'With-trend alignment',
      'Multi-level  (2+ levels)',
    ];
    const ladderTop = padY + 36;
    const ladderH = innerH - 56;
    const rowH = ladderH / 5;

    // Reveal factors in sequence based on time within the 6s example
    // Each factor lights at 0.6s spacing → all 5 lit by ~3s, hold for 3s
    for (let i = 0; i < 5; i++) {
      const lightAt = 0.4 + i * 0.55;
      const isLit = exampleT >= lightAt && ex.factors[i];
      const y = ladderTop + i * rowH + rowH / 2;
      // Row background
      ctx.fillStyle = isLit ? `rgba(38,166,154,0.10)` : 'rgba(255,255,255,0.025)';
      ctx.fillRect(padX + 14, ladderTop + i * rowH + 3, innerW - 28, rowH - 6);

      // Status dot (left)
      const dotX = padX + 24;
      ctx.fillStyle = isLit ? ex.color : 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.arc(dotX, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Factor label
      ctx.font = isLit ? 'bold 11px ui-sans-serif, system-ui' : '11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = isLit ? '#FFFFFF' : 'rgba(255,255,255,0.40)';
      ctx.fillText('Factor ' + (i + 1) + '  \u00B7  ' + labels[i], dotX + 12, y + 3);

      // Pulsing fade on the row that just lit
      if (isLit && exampleT < lightAt + 0.4) {
        const pulse = 1 - (exampleT - lightAt) / 0.4;
        ctx.fillStyle = `rgba(255,179,0,${pulse * 0.18})`;
        ctx.fillRect(padX + 14, ladderTop + i * rowH + 3, innerW - 28, rowH - 6);
      }
    }

    // Bottom score bar
    const barY = padY + innerH - 14;
    const barW = innerW - 28;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(padX + 14, barY - 4, barW, 6);
    const litCount = ex.factors.filter((f, i) => exampleT >= 0.4 + i * 0.55 && f).length;
    const fillW = (litCount / 5) * barW;
    ctx.fillStyle = ex.color;
    ctx.fillRect(padX + 14, barY - 4, fillW, 6);

    // Bottom caption
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('0\u20131 WEAK  \u00B7  2\u20133 MODERATE  \u00B7  4\u20135 STRONG \u2014 quality maps to size, not direction.', padX + innerW / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — ThreeBarAgeGateAnim (S04 supporting visual)
// Why the Pine demands lvl_bar must be at least 4 bars old before
// it can be swept. Two side-by-side scenes:
//   LEFT: A pivot forms at bar 5; bar 7 wicks below it. REJECTED —
//         level too fresh (3 bars old, fails the >3 check).
//   RIGHT: A pivot forms at bar 5; bar 12 wicks below it. ACCEPTED —
//         level is 7 bars old, passes the gate. Diamond appears.
// The gate prevents "fresh-pivot fakery": fake sweeps off levels
// that haven't built any meaningful liquidity yet.
// ============================================================
function ThreeBarAgeGateAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const MAGENTA = '#EF5350';
    const AMBER = '#FFB300';

    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, w, h);

    const padX = 18;
    const padY = 28;
    const gap = 12;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelH = h - padY * 2 - 24;

    // 10s cycle, both panels animate in parallel
    const cycle = 10.0;
    const cycT = t % cycle;
    const N = 16;

    type Panel = {
      x: number;
      title: string;
      verdict: string;
      verdictColor: string;
      sweepBar: number;
      pivotBar: number;
      ageOk: boolean;
    };
    const panels: Panel[] = [
      { x: padX, title: 'LEVEL TOO FRESH', verdict: 'REJECTED  \u00B7  3 BARS', verdictColor: MAGENTA, sweepBar: 7, pivotBar: 5, ageOk: false },
      { x: padX + panelW + gap, title: 'LEVEL AGED ENOUGH', verdict: 'ACCEPTED  \u00B7  7 BARS', verdictColor: TEAL, sweepBar: 12, pivotBar: 5, ageOk: true },
    ];

    panels.forEach((p) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(p.x, padY, panelW, panelH);

      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 14);

      const baseY = padY + panelH * 0.5 + 4;
      type Candle = { open: number; high: number; low: number; close: number };
      const candles: Candle[] = [];
      for (let i = 0; i < N; i++) {
        let mid = baseY;
        if (i < p.pivotBar) mid = baseY - 4 + i * 1.6;
        else if (i === p.pivotBar) mid = baseY + 8;
        else if (i < p.sweepBar) mid = baseY + 6 - (i - p.pivotBar) * 0.6;
        else if (i === p.sweepBar) mid = baseY + 2;
        else mid = baseY - 2 - (i - p.sweepBar) * 1.5;

        let openY = mid - 2;
        let closeY = mid + 2;
        let highY = mid - 5;
        let lowY = mid + 5;
        if (i === p.sweepBar) {
          openY = baseY + 1;
          closeY = baseY - 3;
          highY = baseY - 5;
          lowY = baseY + 16;
        }
        candles.push({ open: openY, close: closeY, high: highY, low: lowY });
      }

      const sweptLevel = candles[p.pivotBar].low;
      const revealIdx = Math.min(N - 1, Math.floor((cycT / cycle) * N));

      const xOf = (i: number) => p.x + 8 + (i / (N - 1)) * (panelW - 16);

      // Level line
      if (revealIdx >= p.pivotBar) {
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.setLineDash([2, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xOf(p.pivotBar), sweptLevel);
        ctx.lineTo(xOf(N - 1), sweptLevel);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Pivot age counter (live)
      if (revealIdx >= p.pivotBar && revealIdx < p.sweepBar) {
        const age = revealIdx - p.pivotBar;
        ctx.font = '9px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText('age: ' + age + 'b', xOf(p.pivotBar) + 4, sweptLevel + 14);
      }

      // Diamond + verdict appear at sweep bar
      if (revealIdx >= p.sweepBar) {
        const dx = xOf(p.sweepBar);
        const dy = sweptLevel;
        if (p.ageOk) {
          ctx.fillStyle = TEAL;
          ctx.beginPath();
          ctx.moveTo(dx, dy - 4);
          ctx.lineTo(dx + 4, dy);
          ctx.lineTo(dx, dy + 4);
          ctx.lineTo(dx - 4, dy);
          ctx.closePath();
          ctx.fill();
        } else {
          // Strikethrough — rejected
          ctx.strokeStyle = MAGENTA;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(dx - 5, dy - 5);
          ctx.lineTo(dx + 5, dy + 5);
          ctx.moveTo(dx + 5, dy - 5);
          ctx.lineTo(dx - 5, dy + 5);
          ctx.stroke();
        }
      }

      // Candles
      for (let i = 0; i <= revealIdx && i < N; i++) {
        const c = candles[i];
        const isUp = c.close < c.open;
        const isSweep = i === p.sweepBar;
        const fill = isSweep ? AMBER : i === p.pivotBar ? 'rgba(255,255,255,0.5)' : isUp ? 'rgba(38,166,154,0.7)' : 'rgba(239,83,80,0.7)';
        ctx.fillStyle = fill;
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xOf(i), c.high);
        ctx.lineTo(xOf(i), c.low);
        ctx.stroke();
        ctx.fillRect(xOf(i) - 1.4, Math.min(c.open, c.close), 2.8, Math.abs(c.close - c.open));
      }

      // Verdict (bottom)
      if (revealIdx >= p.sweepBar) {
        ctx.font = 'bold 10px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = p.verdictColor;
        ctx.fillText(p.verdict, p.x + panelW / 2, padY + panelH + 12);
      }
    });

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER demands  bar_index \u2212 lvl_bar > 3.  Stops need time to gather.', padX + (panelW * 2 + gap) / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — StrengthAdaptiveDiamondAnim (S05)
// Three side-by-side panels showing the strength-adaptive rendering:
// STRONG (size.normal diamond + width 3 line + transp 20),
// MODERATE (size.small + width 2 + transp 35),
// WEAK (size.small + width 1 + transp 55).
// Lights up sequentially so operators can see the visual gradient.
// ============================================================
function StrengthAdaptiveDiamondAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 4.0;
    const phase = (t % cycle) / cycle;
    const showWeak = phase >= 0.0;
    const showMod = phase >= 0.33;
    const showStrong = phase >= 0.66;

    const padX = w * 0.05;
    const padY = h * 0.18;
    const panelW = (w - padX * 2 - 30) / 3;
    const panelH = h * 0.6;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('STRENGTH-ADAPTIVE RENDERING  \u00B7  DIAMOND SIZE  \u00B7  LINE WIDTH  \u00B7  OPACITY', w / 2, 18);

    type PanelDef = {
      x: number;
      label: string;
      score: string;
      diamondSize: number;
      lineWidth: number;
      transp: number;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: PanelDef[] = [
      {
        x: padX,
        label: 'WEAK',
        score: '0\u20131 / 5',
        diamondSize: 7,
        lineWidth: 1,
        transp: 0.45,
        visible: showWeak,
        revealAlpha: showWeak ? Math.min(1, (phase - 0.0) / 0.15) : 0,
      },
      {
        x: padX + panelW + 15,
        label: 'MODERATE',
        score: '2\u20133 / 5',
        diamondSize: 9,
        lineWidth: 2,
        transp: 0.65,
        visible: showMod,
        revealAlpha: showMod ? Math.min(1, (phase - 0.33) / 0.15) : 0,
      },
      {
        x: padX + panelW * 2 + 30,
        label: 'STRONG',
        score: '4\u20135 / 5',
        diamondSize: 13,
        lineWidth: 3,
        transp: 0.80,
        visible: showStrong,
        revealAlpha: showStrong ? Math.min(1, (phase - 0.66) / 0.15) : 0,
      },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.08 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      ctx.fillStyle = `rgba(255,179,0,${0.85 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x + panelW / 2, padY + 18);

      ctx.fillStyle = `rgba(255,255,255,${0.4 * p.revealAlpha})`;
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillText(p.score, p.x + panelW / 2, padY + 32);

      const chartTop = padY + 48;
      const chartBot = padY + panelH - 38;
      const levelY = chartTop + (chartBot - chartTop) * 0.55;

      ctx.strokeStyle = `rgba(38,166,154,${p.transp * p.revealAlpha})`;
      ctx.lineWidth = p.lineWidth;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p.x + 12, levelY);
      ctx.lineTo(p.x + panelW - 12, levelY);
      ctx.stroke();
      ctx.setLineDash([]);

      const candleX = p.x + panelW * 0.62;
      const wickBottom = levelY + 22;
      const bodyTop = levelY - 12;
      const bodyBot = levelY - 2;

      ctx.strokeStyle = `rgba(38,166,154,${0.7 * p.revealAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(candleX, bodyTop);
      ctx.lineTo(candleX, wickBottom);
      ctx.stroke();
      ctx.fillStyle = `rgba(38,166,154,${0.85 * p.revealAlpha})`;
      ctx.fillRect(candleX - 4, bodyTop, 8, bodyBot - bodyTop);

      const ds = p.diamondSize;
      ctx.fillStyle = `rgba(38,166,154,${p.revealAlpha})`;
      ctx.font = `bold ${ds}px ui-sans-serif, system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', candleX, levelY);
      ctx.textBaseline = 'alphabetic';

      ctx.font = '9px ui-monospace, monospace';
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.textAlign = 'center';
      ctx.fillText(`size.${p.diamondSize >= 13 ? 'normal' : 'small'}  \u00B7  width ${p.lineWidth}  \u00B7  transp ${p.transp === 0.45 ? '55' : p.transp === 0.65 ? '35' : '20'}`, p.x + panelW / 2, padY + panelH - 18);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('One glance ranks every recent sweep.  STRONG is bolder; WEAK is a reference mark only.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — TooltipBreakdownAnim (S06)
// Bakes Image 1's verbatim SELL SWEEP STRONG (4/5) tooltip values.
// Six lines reveal sequentially as a progress bar advances; each line
// gets a label callout pointing to what the operator learns.
// ============================================================
function TooltipBreakdownAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 7.0;
    const phase = (t % cycle) / cycle;
    const linesShown = Math.min(8, Math.floor(phase * 9));

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 6-LINE TOOLTIP \u2014 EVERY ATOM, ONE HOVER', w / 2, 18);

    const boxX = w * 0.06;
    const boxY = h * 0.18;
    const boxW = w * 0.42;
    const boxH = h * 0.72;

    ctx.fillStyle = 'rgba(15,15,15,0.95)';
    ctx.strokeStyle = 'rgba(239,83,80,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    type Line = { text: string; color: string; bold: boolean; mono: boolean };
    const lines: Line[] = [
      { text: 'SELL SWEEP  STRONG (4/5)', color: '#EF5350', bold: true, mono: false },
      { text: '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', color: 'rgba(255,255,255,0.25)', bold: false, mono: true },
      { text: 'Level: 2067.000', color: 'rgba(255,255,255,0.85)', bold: false, mono: true },
      { text: 'Wick depth: 0.65 ATR', color: 'rgba(255,255,255,0.85)', bold: false, mono: true },
      { text: 'Volume: 1.25x avg', color: 'rgba(255,255,255,0.85)', bold: false, mono: true },
      { text: 'Level age: 7 bars', color: 'rgba(255,255,255,0.85)', bold: false, mono: true },
      { text: 'Trend: Counter-trend', color: 'rgba(255,255,255,0.85)', bold: false, mono: true },
      { text: '\u26A1 MULTI-LEVEL \u2014 3 levels raided', color: '#FFB300', bold: true, mono: false },
    ];

    const lineH = 16;
    const startY = boxY + 22;

    lines.forEach((line, i) => {
      if (i >= linesShown) return;
      const y = startY + i * lineH;
      ctx.fillStyle = line.color;
      ctx.font = `${line.bold ? 'bold ' : ''}11px ${line.mono ? 'ui-monospace, monospace' : 'ui-sans-serif, system-ui'}`;
      ctx.textAlign = 'left';
      ctx.fillText(line.text, boxX + 12, y);
    });

    if (linesShown >= 8) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'italic 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Stops grabbed above \u2014 expect reversal DOWN', boxX + 12, boxY + boxH - 14);
    }

    const calloutX = w * 0.54;
    type Callout = { y: number; label: string; tip: string; visible: boolean };
    const callouts: Callout[] = [
      { y: startY, label: 'DIRECTION + QUALITY + SCORE', tip: 'tells you which side, how clean, how trustworthy', visible: linesShown > 0 },
      { y: startY + lineH * 2, label: 'PRICE OF THE RAIDED LEVEL', tip: 'where the stops were sitting', visible: linesShown > 2 },
      { y: startY + lineH * 3, label: 'WICK DEPTH IN ATR', tip: '0.65 ATR \u2014 deep grab, scored for factor 1', visible: linesShown > 3 },
      { y: startY + lineH * 4, label: 'VOLUME RATIO', tip: '1.25x \u2014 above 1.2x triggers factor 2', visible: linesShown > 4 },
      { y: startY + lineH * 5, label: 'LEVEL AGE', tip: '7 bars old \u2014 mature pool, real liquidity', visible: linesShown > 5 },
      { y: startY + lineH * 6, label: 'TREND ALIGNMENT', tip: 'counter-trend \u2014 no factor 4 point here', visible: linesShown > 6 },
      { y: startY + lineH * 7, label: 'MULTI-LEVEL BONUS', tip: '3 levels in one bar \u2014 factor 5 fired', visible: linesShown > 7 },
    ];

    callouts.forEach((c) => {
      if (!c.visible) return;
      ctx.strokeStyle = 'rgba(255,179,0,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(boxX + boxW + 4, c.y - 4);
      ctx.lineTo(calloutX - 6, c.y - 4);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,179,0,0.85)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, calloutX, c.y - 6);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillText(c.tip, calloutX, c.y + 4);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('XAU 1M  \u00B7  verbatim CIPHER tooltip  \u00B7  4/5 score earned without with-trend bonus', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — FVGConfluenceAnim (S07)
// A sweep diamond + an FVG box converge into the apex setup.
// Shows the 0.5 ATR proximity gate AND direction-match requirement.
// ============================================================
function FVGConfluenceAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showSweep = phase >= 0.0;
    const showFVG = phase >= 0.30;
    const fvgDistance = phase < 0.30 ? 999 : phase < 0.55 ? 1.4 : phase < 0.80 ? 0.8 : 0.3;
    const confluence = fvgDistance < 0.5;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SWEEP + FVG CONFLUENCE  \u00B7  WITHIN 0.5 ATR  \u00B7  DIRECTION MATCH', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.18;
    const chartW = w - padX * 2;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    const sweptY = padY + chartH * 0.65;
    const atrPx = chartH * 0.18;

    const sweepX = padX + chartW * 0.40;
    if (showSweep) {
      const wickBot = sweptY + atrPx * 0.6;
      const bodyTop = sweptY - atrPx * 0.25;
      const bodyBot = sweptY - atrPx * 0.05;
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, bodyTop);
      ctx.lineTo(sweepX, wickBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(38,166,154,0.9)';
      ctx.fillRect(sweepX - 5, bodyTop, 10, bodyBot - bodyTop);

      ctx.fillStyle = 'rgba(38,166,154,1)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', sweepX, sweptY);
      ctx.textBaseline = 'alphabetic';

      ctx.strokeStyle = 'rgba(38,166,154,0.55)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX + 12, sweptY);
      ctx.lineTo(sweepX - 8, sweptY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.85)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('BUY SWEEP', sweepX, sweptY + atrPx * 0.95);
    }

    if (showFVG) {
      const fvgX = padX + chartW * 0.68;
      const fvgCenterY = sweptY - fvgDistance * atrPx;
      const fvgTop = fvgCenterY - atrPx * 0.25;
      const fvgBot = fvgCenterY + atrPx * 0.25;
      const fvgW = chartW * 0.18;

      const baseAlpha = confluence ? 0.55 : 0.30;
      ctx.fillStyle = `rgba(38,166,154,${baseAlpha})`;
      ctx.fillRect(fvgX, fvgTop, fvgW, fvgBot - fvgTop);
      ctx.strokeStyle = `rgba(38,166,154,${confluence ? 0.95 : 0.55})`;
      ctx.lineWidth = confluence ? 2 : 1;
      ctx.beginPath();
      ctx.rect(fvgX, fvgTop, fvgW, fvgBot - fvgTop);
      ctx.stroke();

      ctx.strokeStyle = `rgba(38,166,154,0.65)`;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fvgX, fvgCenterY);
      ctx.lineTo(fvgX + fvgW, fvgCenterY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.85)';
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('BULL FVG', fvgX + 4, fvgTop - 6);

      const arrowFromX = sweepX + 10;
      const arrowToX = fvgX - 4;
      const arrowY = (sweptY + fvgCenterY) / 2;

      ctx.strokeStyle = confluence ? 'rgba(255,179,0,0.95)' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = confluence ? 2 : 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(arrowFromX, sweptY - 4);
      ctx.lineTo(arrowToX, fvgCenterY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = confluence ? 'rgba(255,179,0,0.95)' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${fvgDistance.toFixed(1)} ATR`, (arrowFromX + arrowToX) / 2, arrowY - 6);
    }

    const gateY = sweptY - 0.5 * atrPx;
    ctx.strokeStyle = 'rgba(255,179,0,0.35)';
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX + chartW * 0.55, gateY);
    ctx.lineTo(padX + chartW - 4, gateY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,0.55)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0.5 ATR gate', padX + chartW - 6, gateY - 4);

    const verdictY = padY + chartH + 16;
    if (confluence) {
      ctx.fillStyle = 'rgba(255,179,0,0.95)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u2605 FVG CONFLUENCE \u2014 HIGHEST CONVICTION', w / 2, verdictY);
    } else if (showFVG) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`distance ${fvgDistance.toFixed(1)} ATR  \u00B7  outside 0.5 ATR gate  \u00B7  no confluence`, w / 2, verdictY);
    } else if (showSweep) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('sweep alone  \u00B7  no FVG in range  \u00B7  no confluence yet', w / 2, verdictY);
    }

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Direction must also match  \u00B7  bull sweep + bull FVG  \u00B7  not just any FVG within range', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — FailedSweepAnim (S08)
// Three-bar sequence: sweep bar, anticipation, then next bar closes BEYOND.
// Verdict transitions: HOT \u2014 REVERSAL LIKELY \u2192 FAILED \u2014 CONTINUATION.
// ============================================================
function FailedSweepAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const bar1Done = phase >= 0.20;
    const bar2Done = phase >= 0.75;
    const failedVerdict = phase >= 0.80;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE FAILED SWEEP  \u00B7  NEXT BAR CLOSES BEYOND  \u00B7  FLIP TO CONTINUATION', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.18;
    const chartW = w - padX * 2;
    const chartH = h * 0.55;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    const sweptY = padY + chartH * 0.40;

    ctx.strokeStyle = 'rgba(239,83,80,0.55)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX + 12, sweptY);
    ctx.lineTo(padX + chartW - 12, sweptY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(239,83,80,0.7)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('swept high', padX + 14, sweptY - 4);

    const bar1X = padX + chartW * 0.30;
    if (bar1Done) {
      const wickTop = sweptY - chartH * 0.18;
      const bodyTop = sweptY + chartH * 0.05;
      const bodyBot = sweptY + chartH * 0.18;
      ctx.strokeStyle = 'rgba(239,83,80,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bar1X, wickTop);
      ctx.lineTo(bar1X, bodyBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239,83,80,0.9)';
      ctx.fillRect(bar1X - 5, bodyTop, 10, bodyBot - bodyTop);

      ctx.fillStyle = 'rgba(239,83,80,1)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', bar1X, sweptY);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Bar 1 \u2014 sweep', bar1X, padY + chartH - 8);
    }

    const bar2X = padX + chartW * 0.55;
    if (bar2Done) {
      const wickBot = sweptY + chartH * 0.06;
      const bodyTop = sweptY - chartH * 0.30;
      const bodyBot = sweptY - chartH * 0.10;
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bar2X, bodyTop - 4);
      ctx.lineTo(bar2X, wickBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(38,166,154,0.9)';
      ctx.fillRect(bar2X - 5, bodyTop, 10, bodyBot - bodyTop);

      ctx.fillStyle = 'rgba(255,179,0,0.85)';
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u25B2', bar2X + 18, bodyTop + 8);
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.fillText('CLOSE BEYOND', bar2X + 22, bodyTop - 4);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Bar 2 \u2014 fails', bar2X, padY + chartH - 8);
    }

    const verdictY = padY + chartH + 28;
    if (!failedVerdict && bar1Done) {
      ctx.fillStyle = 'rgba(38,166,154,0.95)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192 HOT \u2014 REVERSAL LIKELY', w / 2, verdictY);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = 'italic 10px ui-sans-serif, system-ui';
      ctx.fillText('reading after the sweep bar closes', w / 2, verdictY + 16);
    } else if (failedVerdict) {
      ctx.fillStyle = 'rgba(255,179,0,0.95)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('\u2192 FAILED \u2014 CONTINUATION', w / 2, verdictY);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'italic 10px ui-sans-serif, system-ui';
      ctx.fillText('the trap was bait for the wrong side  \u00B7  flip the read', w / 2, verdictY + 16);
    }

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Bear sweep fail: next bar closes ABOVE the swept high \u2192 continuation UP.  Mirror image for bull sweep fail.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — CommandCenterCascadeAnim (S09)
// 6-verdict cascade ladder with first-match-wins highlighting.
// Walks through inputs and lights up the matching verdict.
// ============================================================
function CommandCenterCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    const sliceIdx = Math.floor(phase * 6);

    type Scenario = { input: string; matchIdx: number };
    const scenarios: Scenario[] = [
      { input: 'last_sweep_bar = 0', matchIdx: 0 },
      { input: 'ago = 2  \u00B7  fvg = false  \u00B7  failed = false', matchIdx: 3 },
      { input: 'ago = 2  \u00B7  fvg = true  \u00B7  failed = false', matchIdx: 2 },
      { input: 'ago = 8  \u00B7  fvg = false  \u00B7  failed = false', matchIdx: 4 },
      { input: 'ago = 2  \u00B7  fvg = false  \u00B7  failed = true', matchIdx: 1 },
      { input: 'ago = 14  \u00B7  fvg = false  \u00B7  failed = false', matchIdx: 5 },
    ];
    const current = scenarios[Math.min(sliceIdx, scenarios.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 6-VERDICT SWEEP CASCADE  \u00B7  FIRST MATCH WINS', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('INPUT:', w * 0.06, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(current.input, w * 0.13, 38);

    type Verdict = { label: string; tip: string; color: string };
    const verdicts: Verdict[] = [
      { label: '1.  NO SWEEPS', tip: 'last_sweep_bar == 0', color: 'rgba(255,255,255,0.55)' },
      { label: '2.  FAILED \u2014 CONTINUATION', tip: 'last_sweep_failed && ago \u2264 5', color: '#FFB300' },
      { label: '3.  HOT + FVG \u2605', tip: 'ago \u2264 3 && last_sweep_fvg', color: '#26A69A' },
      { label: '4.  HOT \u2014 REVERSAL LIKELY', tip: 'ago \u2264 3', color: '#26A69A' },
      { label: '5.  COOLING \u2014 WATCH', tip: 'ago \u2264 10', color: '#FFB300' },
      { label: '6.  COLD', tip: 'ago > 10', color: 'rgba(255,255,255,0.45)' },
    ];

    const startY = 60;
    const rowH = (h - startY - 40) / verdicts.length;

    verdicts.forEach((v, i) => {
      const y = startY + i * rowH;
      const isMatch = i === current.matchIdx;
      const isAbove = i < current.matchIdx;

      const fadeOpacity = isMatch ? 1 : isAbove ? 0.35 : 0.20;

      if (isMatch) {
        ctx.fillStyle = `rgba(255,179,0,0.10)`;
        ctx.fillRect(w * 0.06, y, w * 0.88, rowH - 4);
        ctx.strokeStyle = 'rgba(255,179,0,0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(w * 0.06, y, w * 0.88, rowH - 4);
        ctx.stroke();
      }

      let labelColor: string;
      if (v.color.startsWith('#')) {
        const r = parseInt(v.color.slice(1, 3), 16);
        const g = parseInt(v.color.slice(3, 5), 16);
        const b = parseInt(v.color.slice(5, 7), 16);
        labelColor = `rgba(${r},${g},${b},${fadeOpacity})`;
      } else {
        labelColor = v.color.replace(/[\d.]+\)$/, `${fadeOpacity})`);
      }
      ctx.fillStyle = labelColor;
      ctx.font = `${isMatch ? 'bold ' : ''}12px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(v.label, w * 0.10, y + rowH / 2 + 2);

      ctx.fillStyle = `rgba(255,255,255,${fadeOpacity * 0.55})`;
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v.tip, w * 0.92, y + rowH / 2 + 2);

      if (isMatch) {
        ctx.fillStyle = 'rgba(255,179,0,0.95)';
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u25B6', w * 0.07, y + rowH / 2 + 2);
      } else if (isAbove) {
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('\u2718', w * 0.07, y + rowH / 2 + 2);
      }
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Cascade is checked top-down. First match wins.  Lower verdicts never get evaluated.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — SignalContextCascadeAnim (S10)
// Signal context cascade ladder showing priority order: Sweep + FVG
// at the top, then Sweep, then Breakout, Snap, Exhaustion, Momentum,
// At Support, Trend at the bottom. Walks through 4 scenarios cycling
// the match through different positions.
// ============================================================
function SignalContextCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    const sliceIdx = Math.floor(phase * 4);

    type Scenario = { input: string; matchIdx: number };
    const scenarios: Scenario[] = [
      { input: 'sweep_3b ago  \u00B7  fvg_confluence  \u00B7  ribbon_aligned', matchIdx: 0 },
      { input: 'sweep_2b ago  \u00B7  no fvg  \u00B7  ribbon_aligned', matchIdx: 1 },
      { input: 'no recent sweep  \u00B7  breakout_fired  \u00B7  high vol', matchIdx: 2 },
      { input: 'no sweep  \u00B7  no breakout  \u00B7  ribbon_stack only', matchIdx: 7 },
    ];
    const current = scenarios[Math.min(sliceIdx, scenarios.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE SIGNAL CONTEXT CASCADE  \u00B7  SWEEP TOPS EVERY OTHER TAG', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('SIGNAL CONTEXT:', w * 0.06, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText(current.input, w * 0.24, 38);

    type Tag = { label: string; color: string };
    const tags: Tag[] = [
      { label: '1.  Sweep + FVG \u2605', color: '#FFB300' },
      { label: '2.  Sweep', color: '#26A69A' },
      { label: '3.  Breakout', color: 'rgba(255,255,255,0.75)' },
      { label: '4.  Snap', color: 'rgba(255,255,255,0.75)' },
      { label: '5.  Exhaustion', color: 'rgba(255,255,255,0.75)' },
      { label: '6.  Momentum', color: 'rgba(255,255,255,0.65)' },
      { label: '7.  At Support', color: 'rgba(255,255,255,0.65)' },
      { label: '8.  Trend', color: 'rgba(255,255,255,0.55)' },
    ];

    const startY = 56;
    const rowH = (h - startY - 32) / tags.length;

    tags.forEach((tag, i) => {
      const y = startY + i * rowH;
      const isMatch = i === current.matchIdx;
      const isAbove = i < current.matchIdx;
      const fadeOpacity = isMatch ? 1 : isAbove ? 0.30 : 0.18;

      if (isMatch) {
        ctx.fillStyle = `rgba(255,179,0,0.10)`;
        ctx.fillRect(w * 0.06, y, w * 0.88, rowH - 3);
        ctx.strokeStyle = 'rgba(255,179,0,0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(w * 0.06, y, w * 0.88, rowH - 3);
        ctx.stroke();
      }

      let labelColor: string;
      if (tag.color.startsWith('#')) {
        const r = parseInt(tag.color.slice(1, 3), 16);
        const g = parseInt(tag.color.slice(3, 5), 16);
        const b = parseInt(tag.color.slice(5, 7), 16);
        labelColor = `rgba(${r},${g},${b},${fadeOpacity})`;
      } else {
        labelColor = tag.color.replace(/[\d.]+\)$/, `${fadeOpacity})`);
      }

      ctx.fillStyle = labelColor;
      ctx.font = `${isMatch ? 'bold ' : ''}11px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(tag.label, w * 0.10, y + rowH / 2 + 2);

      if (isMatch) {
        ctx.fillStyle = 'rgba(255,179,0,0.95)';
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u25B6', w * 0.07, y + rowH / 2 + 2);

        ctx.fillStyle = 'rgba(255,179,0,0.85)';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('\u2190 fires', w * 0.92, y + rowH / 2 + 2);
      } else if (isAbove) {
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('\u2718', w * 0.07, y + rowH / 2 + 2);
      }
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Sweep at position 1-2 outranks every other context.  Read the tag, know the conviction.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — ReversalTradePlanAnim (S11)
// Buy sweep playbook visualization: entry on close-back-inside,
// stop just below swept low with ATR buffer, target at next FVG/level.
// 1R risk box and 2R + 3R reward boxes labeled.
// ============================================================
function ReversalTradePlanAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showSetup = phase >= 0.10;
    const showEntry = phase >= 0.30;
    const showStop = phase >= 0.50;
    const showT1 = phase >= 0.70;
    const showT2 = phase >= 0.85;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('REVERSAL TRADE PLAN  \u00B7  BUY SWEEP  \u00B7  ENTRY \u2192 STOP \u2192 TARGETS', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.14;
    const chartW = w - padX * 2;
    const chartH = h * 0.74;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    // Price levels
    const sweptLowY = padY + chartH * 0.78;
    const entryY = padY + chartH * 0.65;
    const stopY = padY + chartH * 0.88;
    const t1Y = padY + chartH * 0.40;
    const t2Y = padY + chartH * 0.22;

    // Swept low dotted line
    if (showSetup) {
      ctx.strokeStyle = 'rgba(38,166,154,0.55)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padX + 8, sweptLowY);
      ctx.lineTo(padX + chartW - 8, sweptLowY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.7)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('swept low', padX + 12, sweptLowY - 4);

      // Sweep candle
      const sweepX = padX + chartW * 0.30;
      const wickBot = stopY - 4;
      const bodyTop = entryY + 6;
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, bodyTop);
      ctx.lineTo(sweepX, wickBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(38,166,154,0.9)';
      ctx.fillRect(sweepX - 5, bodyTop, 10, entryY - bodyTop);

      ctx.fillStyle = 'rgba(38,166,154,1)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', sweepX, sweptLowY);
      ctx.textBaseline = 'alphabetic';
    }

    // ENTRY arrow
    if (showEntry) {
      const ex = padX + chartW * 0.40;
      ctx.strokeStyle = 'rgba(255,179,0,0.90)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ex, entryY);
      ctx.lineTo(padX + chartW - 12, entryY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,179,0,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u25B6 ENTRY  \u00B7  close-back-inside', ex + 4, entryY - 6);
    }

    // STOP arrow + 1R risk box
    if (showStop) {
      ctx.strokeStyle = 'rgba(239,83,80,0.90)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.42, stopY);
      ctx.lineTo(padX + chartW - 12, stopY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239,83,80,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u2718 STOP  \u00B7  swept low \u2212 0.25 ATR', padX + chartW * 0.42 + 4, stopY + 12);

      // 1R box (red)
      ctx.fillStyle = 'rgba(239,83,80,0.18)';
      ctx.fillRect(padX + chartW * 0.55, entryY, chartW * 0.25, stopY - entryY);
      ctx.strokeStyle = 'rgba(239,83,80,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padX + chartW * 0.55, entryY, chartW * 0.25, stopY - entryY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239,83,80,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('1R', padX + chartW * 0.675, (entryY + stopY) / 2 + 4);
    }

    // T1 arrow + 2R reward box
    if (showT1) {
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.42, t1Y);
      ctx.lineTo(padX + chartW - 12, t1Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u25CE T1  \u00B7  next FVG midpoint  \u00B7  scale 50%', padX + chartW * 0.42 + 4, t1Y - 6);

      // 2R reward box (teal)
      ctx.fillStyle = 'rgba(38,166,154,0.20)';
      ctx.fillRect(padX + chartW * 0.55, t1Y, chartW * 0.25, entryY - t1Y);
      ctx.strokeStyle = 'rgba(38,166,154,0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padX + chartW * 0.55, t1Y, chartW * 0.25, entryY - t1Y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(38,166,154,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('2R', padX + chartW * 0.675, (t1Y + entryY) / 2 + 4);
    }

    // T2 arrow + 3R box
    if (showT2) {
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.42, t2Y);
      ctx.lineTo(padX + chartW - 12, t2Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u25CE T2  \u00B7  prior swing high  \u00B7  trail balance', padX + chartW * 0.42 + 4, t2Y - 6);

      // 3R cumulative reward box (lighter teal, taller)
      ctx.fillStyle = 'rgba(38,166,154,0.10)';
      ctx.fillRect(padX + chartW * 0.55, t2Y, chartW * 0.25, t1Y - t2Y);
      ctx.strokeStyle = 'rgba(38,166,154,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padX + chartW * 0.55, t2Y, chartW * 0.25, t1Y - t2Y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(38,166,154,0.85)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('+1R', padX + chartW * 0.675, (t2Y + t1Y) / 2 + 4);
    }

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('STRONG sweep base size 1R risk  \u00B7  HOT + FVG \u2605 size 1.5\u20132R  \u00B7  scale 50% at T1, trail rest', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — ContinuationTradePlanAnim (S12)
// Failed sweep playbook visualization: entry on the close-beyond bar,
// stop tucked just inside the swept level, target at next structural
// level in the continuation direction. Mirror-flipped vs reversal plan.
// ============================================================
function ContinuationTradePlanAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showSetup = phase >= 0.10;
    const showFailure = phase >= 0.30;
    const showEntry = phase >= 0.50;
    const showStop = phase >= 0.65;
    const showTarget = phase >= 0.80;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('CONTINUATION PLAN  \u00B7  FAILED BEAR SWEEP  \u00B7  FLIP THE READ', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.14;
    const chartW = w - padX * 2;
    const chartH = h * 0.74;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    const sweptHighY = padY + chartH * 0.55;
    const failBarTopY = padY + chartH * 0.32;
    const entryY = padY + chartH * 0.30;
    const stopY = padY + chartH * 0.50;
    const targetY = padY + chartH * 0.10;

    // Swept high dotted
    if (showSetup) {
      ctx.strokeStyle = 'rgba(239,83,80,0.55)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padX + 8, sweptHighY);
      ctx.lineTo(padX + chartW - 8, sweptHighY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(239,83,80,0.7)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('swept high', padX + 12, sweptHighY - 4);

      // Sweep candle
      const sweepX = padX + chartW * 0.25;
      const wickTop = sweptHighY - 22;
      const bodyTop = sweptHighY + 8;
      const bodyBot = sweptHighY + 26;
      ctx.strokeStyle = 'rgba(239,83,80,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, wickTop);
      ctx.lineTo(sweepX, bodyBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239,83,80,0.9)';
      ctx.fillRect(sweepX - 5, bodyTop, 10, bodyBot - bodyTop);

      ctx.fillStyle = 'rgba(239,83,80,1)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', sweepX, sweptHighY);
      ctx.textBaseline = 'alphabetic';
    }

    // Failure bar
    if (showFailure) {
      const failX = padX + chartW * 0.42;
      const wickBot = sweptHighY + 6;
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(failX, failBarTopY - 6);
      ctx.lineTo(failX, wickBot);
      ctx.stroke();
      ctx.fillStyle = 'rgba(38,166,154,0.9)';
      ctx.fillRect(failX - 5, failBarTopY, 10, sweptHighY - 12 - failBarTopY);

      ctx.fillStyle = 'rgba(255,179,0,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CLOSE BEYOND \u25B2', failX, failBarTopY - 12);
    }

    // ENTRY (long, on the failure bar close)
    if (showEntry) {
      ctx.strokeStyle = 'rgba(255,179,0,0.90)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.50, entryY);
      ctx.lineTo(padX + chartW - 12, entryY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,179,0,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u25B6 ENTRY LONG  \u00B7  failure-bar close', padX + chartW * 0.50 + 4, entryY - 6);
    }

    // STOP (just BELOW the swept high \u2014 inside the sweep bar)
    if (showStop) {
      ctx.strokeStyle = 'rgba(239,83,80,0.90)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.52, stopY);
      ctx.lineTo(padX + chartW - 12, stopY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239,83,80,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u2718 STOP  \u00B7  inside sweep bar  \u00B7  -0.25 ATR', padX + chartW * 0.52 + 4, stopY + 12);

      // 1R risk box
      ctx.fillStyle = 'rgba(239,83,80,0.18)';
      ctx.fillRect(padX + chartW * 0.62, entryY, chartW * 0.20, stopY - entryY);
      ctx.strokeStyle = 'rgba(239,83,80,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padX + chartW * 0.62, entryY, chartW * 0.20, stopY - entryY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239,83,80,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('1R', padX + chartW * 0.72, (entryY + stopY) / 2 + 4);
    }

    // TARGET
    if (showTarget) {
      ctx.strokeStyle = 'rgba(38,166,154,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(padX + chartW * 0.52, targetY);
      ctx.lineTo(padX + chartW - 12, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(38,166,154,0.95)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('\u25CE TARGET  \u00B7  next structural level', padX + chartW * 0.52 + 4, targetY - 6);

      // 2-3R reward box
      ctx.fillStyle = 'rgba(38,166,154,0.20)';
      ctx.fillRect(padX + chartW * 0.62, targetY, chartW * 0.20, entryY - targetY);
      ctx.strokeStyle = 'rgba(38,166,154,0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(padX + chartW * 0.62, targetY, chartW * 0.20, entryY - targetY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(38,166,154,1)';
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('2\u20133R', padX + chartW * 0.72, (targetY + entryY) / 2 + 4);
    }

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Failed bear sweep \u2192 enter LONG on close-beyond  \u00B7  stop inside the sweep bar  \u00B7  ride continuation', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — WithVsCounterTrendAnim (S13)
// Side-by-side panels: WITH-TREND sweep (shakeout, factor 4 fires,
// continuation play) vs COUNTER-TREND sweep (reversal at extreme,
// no factor 4, requires 4+ from other factors for STRONG).
// ============================================================
function WithVsCounterTrendAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 5.0;
    const phase = (t % cycle) / cycle;
    const showLeft = phase >= 0.05;
    const showRight = phase >= 0.45;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('WITH-TREND  \u00B7  COUNTER-TREND  \u00B7  TWO READS, ONE GEOMETRY', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.14;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.78;

    type Panel = {
      x: number;
      title: string;
      titleColor: string;
      ribbonDir: number; // 1 = up trend, -1 = down trend
      sweepDir: number;
      verdict: string;
      verdictColor: string;
      factorNote: string;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      {
        x: padX,
        title: 'WITH-TREND  \u2014  SHAKEOUT',
        titleColor: '#26A69A',
        ribbonDir: 1,
        sweepDir: 1,
        verdict: 'CONTINUATION PLAY',
        verdictColor: '#26A69A',
        factorNote: 'Factor 4 fires  \u00B7  base 4/5 likely',
        visible: showLeft,
        revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0,
      },
      {
        x: padX + panelW + 20,
        title: 'COUNTER-TREND  \u2014  REVERSAL',
        titleColor: '#EF5350',
        ribbonDir: 1,
        sweepDir: -1,
        verdict: 'REVERSAL CANDIDATE',
        verdictColor: '#EF5350',
        factorNote: 'Factor 4 misses  \u00B7  needs 4 of 4 others for STRONG',
        visible: showRight,
        revealAlpha: showRight ? Math.min(1, (phase - 0.45) / 0.20) : 0,
      },
    ];

    panels.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.visible ? 0.025 * p.revealAlpha : 0})`;
      ctx.strokeStyle = `rgba(255,255,255,${p.visible ? 0.10 * p.revealAlpha : 0})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(p.x, padY, panelW, panelH);
      ctx.fill();
      ctx.stroke();

      if (!p.visible) return;

      // Title
      const tr = parseInt(p.titleColor.slice(1, 3), 16);
      const tg = parseInt(p.titleColor.slice(3, 5), 16);
      const tb = parseInt(p.titleColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${tr},${tg},${tb},${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 18);

      // Ribbon line (the trend) — diagonal line across panel
      const ribbonStartY = p.ribbonDir === 1 ? padY + panelH * 0.62 : padY + panelH * 0.30;
      const ribbonEndY = p.ribbonDir === 1 ? padY + panelH * 0.30 : padY + panelH * 0.62;
      ctx.strokeStyle = `rgba(38,166,154,${0.55 * p.revealAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p.x + 12, ribbonStartY);
      ctx.lineTo(p.x + panelW - 12, ribbonEndY);
      ctx.stroke();

      ctx.fillStyle = `rgba(38,166,154,${0.85 * p.revealAlpha})`;
      ctx.font = 'bold 9px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`Ribbon  \u25B2 UP`, p.x + 14, ribbonStartY - 6);

      // The sweep (small candle + diamond)
      const sweepX = p.x + panelW * 0.55;
      const sweepLevelY = p.sweepDir === 1 ? padY + panelH * 0.70 : padY + panelH * 0.45;

      // Dotted line at the swept level
      const sweepColor = p.sweepDir === 1 ? '#26A69A' : '#EF5350';
      const sr = parseInt(sweepColor.slice(1, 3), 16);
      const sg = parseInt(sweepColor.slice(3, 5), 16);
      const sb = parseInt(sweepColor.slice(5, 7), 16);
      ctx.strokeStyle = `rgba(${sr},${sg},${sb},${0.55 * p.revealAlpha})`;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 12, sweepLevelY);
      ctx.lineTo(p.x + panelW - 12, sweepLevelY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sweep candle
      if (p.sweepDir === 1) {
        // Buy sweep: wick below, body above
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${0.85 * p.revealAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepX, sweepLevelY - 14);
        ctx.lineTo(sweepX, sweepLevelY + 16);
        ctx.stroke();
        ctx.fillStyle = `rgba(${sr},${sg},${sb},${0.9 * p.revealAlpha})`;
        ctx.fillRect(sweepX - 4, sweepLevelY - 12, 8, 10);
      } else {
        // Sell sweep: wick above, body below
        ctx.strokeStyle = `rgba(${sr},${sg},${sb},${0.85 * p.revealAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepX, sweepLevelY - 16);
        ctx.lineTo(sweepX, sweepLevelY + 14);
        ctx.stroke();
        ctx.fillStyle = `rgba(${sr},${sg},${sb},${0.9 * p.revealAlpha})`;
        ctx.fillRect(sweepX - 4, sweepLevelY + 2, 8, 10);
      }

      // Diamond
      ctx.fillStyle = `rgba(${sr},${sg},${sb},${p.revealAlpha})`;
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u25C6', sweepX, sweepLevelY);
      ctx.textBaseline = 'alphabetic';

      // Verdict
      const vr = parseInt(p.verdictColor.slice(1, 3), 16);
      const vg = parseInt(p.verdictColor.slice(3, 5), 16);
      const vb = parseInt(p.verdictColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${vr},${vg},${vb},${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 12px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.verdict, p.x + panelW / 2, padY + panelH - 28);

      // Factor note
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.factorNote, p.x + panelW / 2, padY + panelH - 12);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Same geometry, different read.  Trend alignment changes the operator playbook entirely.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherSweepsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.19-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 19</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Sweeps<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>The Trap Is The Setup</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">A liquidity sweep is one wick that takes out a pool of stops, then closes back inside the level. The bar that looks like a breakdown is the reversal setup. The trap and the entry are the same candle &mdash; once you can read it, the wick stops scaring you and starts paying you.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Stops don&apos;t sit in random places. They cluster just beyond recent swing highs and lows. Institutions know this. So institutions hunt them.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Watch any chart. Price drifts toward a recent swing low. It nudges through. Stops trigger. The bar wicks down, then closes back ABOVE the swing low. The next bar rallies. The bar that looked like a breakdown was actually the reversal &mdash; the move that took out the trapped longs is the same move that fueled the bounce. <strong className="text-amber-400">That single candle is a liquidity sweep.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">Most retail traders see that wick and panic. They read it as confirmation that support failed. They sell into the very bar that institutions are buying from. <strong className="text-white">CIPHER teaches you to read it the other way.</strong> A wick that pierces a level then closes back inside is not a breakdown. It is a controlled stop-run, an engineered liquidity grab. The trap was set; the orders that funded the move came from the stops that just got triggered. The reversal that follows is real.</p>
            <p className="text-gray-400 leading-relaxed">CIPHER detects sweeps as they happen, scores their quality on a 0-5 scale, watches for FVG confluence (the highest-conviction setup the engine recognizes), tracks the rare cases where sweeps fail and become continuation, and surfaces all of it in a Command Center row plus the signal context cascade. By the end of this lesson you will see the wick that pierces a swing not as a failure but as a tell. The trap is the setup.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE SWEEP OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will know the <strong className="text-white">2-condition geometry</strong> that defines a sweep, the <strong className="text-white">3-bar age gate</strong> that filters fresh-pivot fakery, the <strong className="text-white">5-factor strength score</strong> that produces WEAK / MODERATE / STRONG, the <strong className="text-white">strength-adaptive diamond and dotted-line</strong> visuals, the <strong className="text-white">6-line tooltip</strong> that fits the entire setup on one hover, the <strong className="text-white">FVG confluence rule</strong> that flags the apex setup, the <strong className="text-white">failed-sweep mechanic</strong> that flips reversals into continuation, the <strong className="text-white">6-verdict Sweep cascade</strong> in the Command Center, the <strong className="text-white">signal context cascade</strong> where Sweep tops every other tag, and how to <strong className="text-white">trade both outcomes</strong> &mdash; the reversal and the failure. You stop fearing the wick. You start operating behind it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Trap Is The Setup (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Trap Is The Setup</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every retail trading book teaches the same thing about support and resistance: when price breaks below support, sell. When price breaks above resistance, buy. <strong className="text-amber-400">CIPHER teaches the opposite of that for one specific pattern.</strong> When price breaks below a recent swing low and immediately closes back above it, that is not a breakdown. That is a sweep &mdash; and the move that follows is statistically the highest-conviction reversal context CIPHER recognizes. The trap that just sprang on the late shorts is the same trap the operator is buying from.</p>
          <TheTrapIsTheSetupAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four phases. <strong className="text-white">Phase 1</strong>: a swing low forms. Stops accumulate just below it &mdash; that is where retail longs place their protective orders, that is where retail shorts place their breakdown entries. <strong className="text-white">Phase 2</strong>: price drifts back toward the level. The bait is set. <strong className="text-white">Phase 3</strong>: a single bar wicks below the swing low. Stops trigger. Shorts get filled. Then the same bar closes back above the level &mdash; the close is the tell. The wick was a stop-run, not a breakdown. <strong className="text-white">Phase 4</strong>: price rallies away. The shorts are now trapped, the longs that got stopped out have to chase, the bounce feeds itself. The candle that printed the wick is the candle the operator was buying behind.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">A SWEEP IS A SINGLE CANDLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The whole pattern lives in one bar. The wick punches beyond the level. The body closes back inside. <strong className="text-white">Both halves of that one candle are required</strong>. A wick that pierces and stays through is a breakdown. A close that holds the level without a wick beyond is just a hold. Only the combination &mdash; pierce plus close-back &mdash; is a sweep. CIPHER demands both, evaluates them on the close of the sweep bar, and fires the diamond marker at that exact bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIQUIDITY GETS HUNTED, NOT TESTED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Retail trading literature talks about levels being &ldquo;tested&rdquo; &mdash; as if price approaches a swing low to politely check whether buyers are still there. <strong className="text-white">That framing is wrong</strong>. Price approaches swing lows because the orders sitting beyond them are fuel. The stops trapped below a swing low are not collateral damage of a test &mdash; they are the prize. Price wicks through specifically TO take them, then reverses because the move was funded by the stops it just consumed. The level was hunted, not tested.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE CLOSE BACK IS THE TELL</p>
              <p className="text-sm text-gray-400 leading-relaxed">A bar that wicks below a level and stays below is bearish. A bar that wicks below a level and closes back above is the start of a reversal. <strong className="text-white">The close is what separates the two outcomes</strong>. CIPHER waits for the close before firing the diamond &mdash; mid-bar, the wick alone proves nothing. On bar close, if the wick pierced and the body sits back inside, the sweep is confirmed. The diamond appears at the swept level, the dotted line stretches back to the raided pool, and the operator gets a complete read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY MOST TRADERS GET THIS BACKWARDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Retail traders are conditioned to fear wicks beyond levels. The wick triggers stops, the wick breaks structure on most charting tools, the wick prints red on volume profile. So when a fresh wick punches below support, the immediate emotional read is &ldquo;support failed&rdquo;. <strong className="text-white">That emotional read is exactly the trap</strong>. Institutions need retail to sell into the wick &mdash; that is how the move gets funded. Operators who can hold against that emotional read, wait for the close back inside, and recognize the pattern as a sweep are the ones who buy from the trapped traders rather than become them.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DIAMOND AT THE LEVEL, LINE BACK TO THE POOL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once a sweep confirms, CIPHER plants a diamond marker (&#9670;) directly on the swept level at the bar where the sweep occurred. A dotted line extends back 15 bars to anchor the diamond visually to the raided liquidity pool. <strong className="text-white">The diamond color matches the trade direction</strong> &mdash; teal for buy sweeps (price wicked low, expect rally), magenta for sell sweeps (price wicked high, expect drop). The diamond size and the line width adapt to the strength score &mdash; STRONG sweeps get bold rendering, WEAK sweeps get subtle markers. You can scan a chart and rank every recent sweep&apos;s priority in seconds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SIX-LINE TOOLTIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Hover any diamond and the full setup appears in six lines: direction and quality (BUY SWEEP / SELL SWEEP, STRONG / MODERATE / WEAK with the 0-5 score), the swept level price, wick depth in ATR units, volume ratio versus average, level age before being raided, and trend alignment (with-trend or counter-trend). Two optional bonus lines fire when applicable &mdash; <strong className="text-white">&#9733; FVG CONFLUENCE</strong> for the apex setup, and <strong className="text-white">&#9889; MULTI-LEVEL</strong> when 2+ levels were raided in the same bar. The tooltip closes with the operator instruction: &ldquo;Stops grabbed below &mdash; expect reversal UP&rdquo; or its bearish twin.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMMAND CENTER SWEEP ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">Beyond the on-chart visuals, CIPHER fuses every recent sweep into a single Command Center row. Cell 2 displays the last sweep&apos;s direction, age in bars, quality label, and an optional &ldquo;+ FVG&rdquo; tag. Cell 3 broadcasts a verdict from a 6-level cascade &mdash; NO SWEEPS, FAILED &mdash; CONTINUATION, HOT + FVG &#9733;, HOT &mdash; REVERSAL LIKELY, COOLING &mdash; WATCH, and COLD. Two glances, complete sweep awareness across the entire chart history.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SIGNAL CONTEXT CASCADE TOPS HERE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every CIPHER buy or sell signal carries a context tag &mdash; Breakout, Snap, Exhaustion, At Support, Trend, Momentum, and so on. The cascade that decides which tag fires is hard-coded with one rule above all others: <strong className="text-white">if a sweep occurred within the last 3 bars, the tag is Sweep</strong>. If that sweep also had FVG confluence, the tag becomes Sweep + FVG &mdash; the absolute apex. Every other context loses to a recent sweep. CIPHER is telling you, structurally, that a fresh sweep is the highest-conviction context the engine knows how to recognize.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A wick punches beyond a swing. <strong className="text-white">Wait for the close</strong>. If the body holds the wrong side of the level, it is a breakdown &mdash; ignore. If the body closes back inside the level, look for the diamond. <strong className="text-white">Read the quality</strong> &mdash; STRONG is full size, MODERATE is normal size, WEAK is reference only. <strong className="text-white">Check the row</strong> &mdash; HOT means within 3 bars, HOT + FVG &#9733; means the apex setup. <strong className="text-white">Check the next bar</strong> &mdash; if it closes beyond the swept level, the sweep failed and the read flips to continuation. Three rules, one diamond, one row. The trap is the setup.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Sweep Geometry === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Sweep Geometry</p>
          <h2 className="text-2xl font-extrabold mb-4">The Two Conditions, The Three-Bar Gate, The Multi-Level Mechanic</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A sweep is detected on the close of every bar. The check is brutal in its simplicity &mdash; two arithmetic conditions for direction and one age requirement for legitimacy. Every CIPHER sweep on every chart on every timeframe satisfies these three rules. There is no fuzzy logic, no sentiment, no proprietary score. The conditions are observable on any chart from any indicator and the formula is identical for forex, crypto, equities, indices, and commodity CFDs.</p>
          <SweepGeometryAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two panels show the only two valid sweep configurations. <strong className="text-white">Bullish sweep</strong>: the bar&apos;s low pierces below an aged swing low AND the bar&apos;s close sits above that swing low. <strong className="text-white">Bearish sweep</strong>: the bar&apos;s high pierces above an aged swing high AND the bar&apos;s close sits below that swing high. The pierce alone is not enough. The close alone is not enough. CIPHER demands both halves on the same bar. Which means the sweep is confirmed exactly once per bar, exactly at bar close.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BULLISH SWEEP DETECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Pine condition is precise: <strong className="text-white">low &lt; lvl AND close &gt; lvl AND bar_index &minus; lvl_bar &gt; 3</strong>. The bar&apos;s low must dip strictly below the aged swing low (lvl). The bar&apos;s close must sit strictly above that swing low. And the swing low itself must have been at least 4 bars old when the sweep occurred. All three conditions evaluated on bar close. Once they pass, swept_level is set to the swing low&apos;s price, last_sweep_dir is set to +1, last_sweep_bar is set to the current bar, and the diamond renders teal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BEARISH SWEEP DETECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The mirror logic for bear sweeps: <strong className="text-white">high &gt; lvl AND close &lt; lvl AND bar_index &minus; lvl_bar &gt; 3</strong>. The bar&apos;s high punches strictly above the aged swing high. The bar&apos;s close sits strictly below the swing high. The swing high was 4+ bars old. swept_level becomes the swing high price, last_sweep_dir is set to &minus;1, the diamond renders magenta. The arithmetic is identical to the bull case &mdash; just inverted along the price axis.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY STRICT INEQUALITIES MATTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Pine uses <strong className="text-white">&lt;</strong> and <strong className="text-white">&gt;</strong>, not <strong className="text-white">&le;</strong> and <strong className="text-white">&ge;</strong>. A bar that exactly equals the swing low at its low is not a sweep &mdash; it is a touch. A bar that closes exactly at the swing low is not a sweep &mdash; it is a hold. CIPHER demands meaningful penetration and meaningful recovery. Equality is rejected. This rules out chart noise, single-tick stop-hunts that don&apos;t actually consume any liquidity, and edge cases where price prints a perfect double bottom without piercing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWING LEVELS COME FROM PIVOT DETECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The swing highs and lows that CIPHER checks against are not random. They come from <strong className="text-white">ta.pivothigh</strong> and <strong className="text-white">ta.pivotlow</strong> with a configurable lookback (i_pivot_len, default 5). A bar qualifies as a swing low if its low is the lowest of the surrounding 5 bars on each side. The pivot only registers retroactively, after pivot_len bars confirm it. CIPHER tracks the most recent 50 pivot lows and 50 pivot highs in dedicated arrays (sweep_lows, sweep_highs) along with their bar indices (sweep_lo_bars, sweep_hi_bars).</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 3-BAR AGE GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A swing low must be at least 4 bars old (bar_index &minus; lvl_bar &gt; 3) before it can be swept. Why: a swing that just printed has not had time to accumulate any meaningful liquidity. <strong className="text-white">Stops cluster after the level is recognized, not at the moment it forms</strong>. Retail traders see a swing low form on bar 5, place stops below it on bars 6, 7, 8 as confidence builds. Only by bar 9 or later is there enough trapped liquidity for a sweep to be worth taking. CIPHER&apos;s 3-bar gate filters out fresh-pivot fakery &mdash; wicks below brand-new swings that grab nothing because nothing is trapped yet.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE GATE IN ACTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the side-by-side animation below, two charts show the same wick configuration with one difference: the level&apos;s age. The <strong className="text-white">left panel</strong> has a wick that pierces a 3-bar-old level &mdash; rejected, no diamond, no record. The <strong className="text-white">right panel</strong> has a wick that pierces a 7-bar-old level &mdash; accepted, diamond fires, sweep recorded. Same wick, same close-back behavior, different verdict. <strong className="text-white">The level&apos;s age is decisive</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MULTI-LEVEL SWEEPS &mdash; ONE BAR, MANY LEVELS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A single bar can sweep multiple levels at once. If a wick punches deep enough to take out three swing lows in one move and the close sits back above all three, all three count as swept. CIPHER iterates from newest level to oldest, marking each one consumed and removing it from the sweep_lows array. The counter <strong className="text-white">sweep_levels_hit</strong> increments per level consumed. A multi-level sweep awards a strength score bonus (Factor 5) and changes the tooltip to read <strong className="text-white">&#9889; MULTI-LEVEL &mdash; N levels raided</strong>. These are massive liquidity events &mdash; think holiday gap fills, post-news flushes, end-of-quarter cleanup.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONSUMED LEVELS DON&apos;T SWEEP TWICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once a swing level is swept, CIPHER removes it from the tracking array via <strong className="text-white">array.remove(sweep_lows, i)</strong>. The level no longer exists from the sweep engine&apos;s perspective. If price wicks below the same price again later, that wick is checked against whatever swing levels are still active &mdash; not the consumed one. Each pool of liquidity gets one detonation. After that, it&apos;s gone, and the chart has to build new pools before new sweeps can form.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FORWARD-FILLED PRIORITY: NEWEST FIRST</p>
              <p className="text-sm text-gray-400 leading-relaxed">When checking for sweeps, CIPHER iterates from <strong className="text-white">array.size &minus; 1 down to 0</strong> &mdash; newest swing first, oldest last. The newest level&apos;s data (its price, its bar age) becomes the swept_level reported in tooltips and the cascade. Older levels that the same wick happened to consume are counted in sweep_levels_hit and removed from the array, but the headline figures (level age, swept price) reflect the most recent swing &mdash; the level the wick most directly targeted.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A wick reaches beyond a level. Three checks fire on bar close. <strong className="text-white">Did the close make it back inside?</strong> <strong className="text-white">Was the level at least 4 bars old?</strong> <strong className="text-white">Did one wick consume multiple stacked levels?</strong> If yes, yes, and the bonus, the diamond appears, swept_level is set, the row updates, the cascade fires Sweep on the next signal. The operator reads the bar by checking those three answers in sequence. No fuzzy interpretation. The Pine knows the answer; the lesson teaches you to track what the Pine just decided.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Strength Score === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 0&minus;5 Strength Score</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Yes/No Factors, One Quality Label</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not all sweeps are equal. A wick that barely pokes below a level on tepid volume against the prevailing trend is not the same as a wick that punches 1.5 ATR through with a volume spike, a long rejection candle, full trend alignment, and three swept levels in one bar. CIPHER quantifies the difference with a <strong className="text-amber-400">five-factor score</strong>. Each factor evaluates one quality of the sweep on a yes/no basis. Sum the yeses. The total (0 to 5) maps to a label: WEAK, MODERATE, or STRONG. The score gates rendering size, line width, and operator sizing decisions. It does not gate the sweep&apos;s existence &mdash; even WEAK sweeps fire the diamond. Quality is a separate axis from validity.</p>
          <StrengthLadderAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through three example sweeps. <strong className="text-white">WEAK 1/5</strong>: only the wick depth qualifies; volume was tepid, the candle had no clean rejection, the trend opposed the move, no other levels were touched. <strong className="text-white">MODERATE 3/5</strong>: depth, volume, and rejection quality fire; trend alignment and multi-level miss. <strong className="text-white">STRONG 5/5</strong>: every factor lights up &mdash; deep wick, volume spike, sharp rejection, with-trend shakeout, multiple levels raided in one bar. The same diamond renders in three radically different sizes and weights based on the score. The operator instantly absorbs the priority.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 &middot; WICK DEPTH &gt; 0.3 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Calculated as <strong className="text-white">sweep_wick_depth = (swept_level &minus; low) / atr</strong> for bull sweeps, and the mirror formula for bear sweeps. The wick must extend beyond the level by more than 30% of one ATR to qualify. Why: a single-tick poke through a level grabs almost no liquidity &mdash; only the orders sitting at that exact price level. A wick that punches 0.5 ATR or 0.8 ATR through grabs every stop, breakout entry, and trail-stop in that zone. <strong className="text-white">Depth equals damage</strong>. The deeper the wick, the more trapped traders, the more fuel the reversal has.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 &middot; VOLUME &gt; 1.2&times; AVG</p>
              <p className="text-sm text-gray-400 leading-relaxed">The sweep bar&apos;s volume must exceed 1.2&times; the rolling average. CIPHER computes vol_ratio against a moving baseline; the 1.2 threshold marks the boundary between routine activity and elevated participation. <strong className="text-white">High volume on a sweep bar means institutional fingerprints</strong> &mdash; the trapped retail stops alone cannot move the volume needle that much. Combined with the wick depth, an elevated-volume sweep proves both that liquidity was harvested AND that big participants were on the other side. Low-volume sweeps still count as sweeps, but they may be coincidental retail-driven flushes rather than engineered grabs.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 &middot; BODY &lt; 40% OF RANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The candle&apos;s body must be less than 40% of its total range &mdash; <strong className="text-white">candle_range &gt; 0 AND body / candle_range &lt; 0.4</strong>. Why: this is the rejection signature. A bar that wicks deep and closes back near the open creates a long wick and a small body &mdash; the visual hallmark of failed continuation. A bar that wicks deep but also moves substantially in the new direction has a large body relative to range, which suggests momentum followed the wick rather than rejected it. Strong rejection candles look like hammers (bull) or shooting stars (bear). The 40% threshold is the rejection cutoff.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 &middot; WITH-TREND ALIGNMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The sweep direction must align with the prevailing Ribbon trend &mdash; <strong className="text-white">(bull_sweep AND ribbon_dir == 1) OR (bear_sweep AND ribbon_dir == &minus;1)</strong>. A bull sweep during a Ribbon BULL stack is a shakeout: the trend was going to continue anyway, the sweep just cleaned out late shorts and trapped longs before the next leg. A bull sweep during a Ribbon BEAR stack is a counter-trend reversal attempt &mdash; possible, but historically lower-edge. <strong className="text-white">Shakeouts beat reversals</strong>. Factor 4 awards the point when the sweep is helping the trend continue rather than fighting it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 5 &middot; MULTI-LEVEL (2+ LEVELS)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The sweep_levels_hit counter must reach 2 or more. A single bar that wicks deep enough to consume multiple stacked swing levels is a <strong className="text-white">massive liquidity event</strong> &mdash; the kind of bar that prints during news releases, holiday illiquidity, or end-of-day position management. Multi-level sweeps are statistically rarer and statistically more impactful than single-level sweeps. CIPHER awards the point and changes the tooltip to display the &#9889; MULTI-LEVEL flag with the exact level count.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">QUALITY LABEL MAPPING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The summed score becomes a label: <strong className="text-white">0&ndash;1 WEAK</strong>, <strong className="text-white">2&ndash;3 MODERATE</strong>, <strong className="text-white">4&ndash;5 STRONG</strong>. The label appears in the tooltip header (e.g. SELL SWEEP STRONG (4/5)), in the Command Center cell 1, and gates the visual rendering. WEAK does not mean &ldquo;ignore&rdquo; &mdash; it means the diamond should be small, the line should be thin and faded, and the operator should treat the setup as reference-only context rather than a primary entry. STRONG means full size warranted, line bold, diamond prominent.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE-GATED VISUAL RENDERING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Diamond size: <strong className="text-white">size.normal</strong> if score &ge; 4, otherwise <strong className="text-white">size.small</strong>. Line width: <strong className="text-white">3 if score &ge; 4, 2 if &ge; 2, 1 otherwise</strong>. Line transparency: <strong className="text-white">20 if STRONG, 35 if MODERATE, 55 if WEAK</strong>. The progression is intentional &mdash; STRONG sweeps demand attention, WEAK sweeps recede so the chart doesn&apos;t get cluttered with noise diamonds. <strong className="text-white">The score paints itself</strong>. An operator scanning a chart can rank sweep priority in a single glance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">QUALITY IS NOT DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common confusion: traders see STRONG and assume STRONG-bull is bullish or STRONG-bear is bearish. <strong className="text-white">That conflates two axes</strong>. Direction is the sweep&apos;s direction (BUY for bull sweeps, SELL for bear sweeps). Quality is how reliable that direction&apos;s read is. A STRONG buy sweep is a high-quality reversal-up signal. A STRONG sell sweep is a high-quality reversal-down signal. Quality scales sizing within a direction; it does not flip the direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REAL-DATA EXAMPLES FROM THE SCREENSHOTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three real cases from your charts illustrate the ladder. <strong className="text-white">XAU 1M sell sweep STRONG (4/5)</strong>: Level 2067, wick depth 0.65 ATR (Factor 1), volume 1.25&times; (Factor 2), small-body rejection (Factor 3), counter-trend (Factor 4 misses), 3 levels raided (Factor 5). Score 4 = STRONG even with the trend miss. <strong className="text-white">XAU 4h buy sweep MODERATE (0b ago)</strong>: depth and rejection qualify, with-trend miss against the BEAR regime, single level. <strong className="text-white">BTC 1W buy sweep WEAK (1b ago)</strong>: the wick is shallow, the trend is bear, only one factor lights up. Same engine, same five-factor scorecard, three different priorities.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Score reads as priority. <strong className="text-white">STRONG (4&ndash;5/5)</strong>: full-size primary setup, especially with FVG confluence; trade as detailed in the playbook section. <strong className="text-white">MODERATE (2&ndash;3/5)</strong>: normal size, prefer with-trend for higher edge; supportive context for confluence. <strong className="text-white">WEAK (0&ndash;1/5)</strong>: reference only; do not chase as a primary signal &mdash; useful as confirmation when other layers (PX/TS signals, FVG proximity, Spine) line up. The score is doing the math; the operator is reading the priority.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Five Factors In Detail === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Five Factors In Detail</p>
          <h2 className="text-2xl font-extrabold mb-4">Anatomy Of The Score, Factor By Factor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Section 3 introduced the five factors. This section dissects each one &mdash; what it measures, why the threshold sits where it does, what the trade-off is when it fires versus when it misses, and which screenshot example illustrates each behavior. Operators who understand each factor in isolation can deduce why any given score is what it is, even without hovering the tooltip. Reading the score becomes mechanical; reading what produced it becomes the skill.</p>
          <ThreeBarAgeGateAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Before factor breakdown: the 3-bar age gate sits upstream of all five factors. A wick that pierces a level too fresh fails the gate and never reaches the scoring stage. The animation above shows the gate in action &mdash; left panel rejected (level too young), right panel accepted (level aged enough). Once the gate passes, the five factors evaluate in order and the score is computed on bar close.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 DEEP-DIVE &middot; WHY 0.3 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 0.3 ATR threshold is calibrated empirically against the noise floor. Single-tick wicks below a level happen all the time &mdash; they reflect normal range expansion, not engineered liquidity grabs. By demanding the wick extend at least 30% of an ATR beyond the level, CIPHER filters out routine penetration. <strong className="text-white">Wicks at 0.3 ATR or less typically grab only the orders sitting AT the level itself</strong> (trail stops following price down, breakout-from-support shorts). Wicks at 0.5+ ATR start grabbing the orders sitting BEYOND the level too &mdash; deeper protective stops, momentum-chase entries. Each additional 0.1 ATR of wick depth adds another tier of trapped traders to the fuel pool.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1 EDGE CASE &middot; THIN-RANGE ASSETS</p>
              <p className="text-sm text-gray-400 leading-relaxed">On low-volatility instruments (forex during dead session, indices during pre-market), 0.3 ATR can be only a few pips. The threshold is ATR-relative, not pip-relative, which means it self-adjusts. <strong className="text-white">A 3-pip wick on EURUSD during dead Asia might pass Factor 1</strong> if the ATR has compressed to 7 pips. The same 3-pip wick during London open might fail Factor 1 if the ATR is 15 pips. CIPHER respects the live volatility regime, not absolute pip counts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 DEEP-DIVE &middot; WHY 1.2&times;</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 1.2&times; volume threshold sits just above the &ldquo;routine activity&rdquo; band. Markets in their normal state print volume bars within roughly 0.7&times; to 1.1&times; the rolling average. Volume above 1.2&times; signals participation beyond routine &mdash; either institutional accumulation/distribution or retail panic. <strong className="text-white">Engineered sweeps tend to fire on elevated volume</strong> because the institution doing the sweeping needs the inventory the sweep produces. A low-volume sweep is more likely to be coincidental noise. Factor 2 awards the point only when participation backs the geometry.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2 EDGE CASE &middot; CRYPTO 24/7</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto markets run 24/7 and have unstable volume baselines. Late-Sunday low-volume sessions can produce 1.2&times; baselines that mean almost nothing in absolute terms. <strong className="text-white">CIPHER trusts the relative ratio</strong> &mdash; even in low-baseline regimes, a 1.2&times; spike represents elevated relative participation. The Factor 2 award is calibrated to the local volume floor, not a global baseline, which keeps the signal honest across crypto, equities, FX, and commodities.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 DEEP-DIVE &middot; THE 40% BODY-RATIO TEST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Body ratio = absolute(close &minus; open) divided by total range (high &minus; low). A bar with body 40% of range has 60% wick &mdash; ample rejection visible in the candle shape. <strong className="text-white">Below 40% body, the candle is structurally a hammer or shooting star</strong>: long wick on one side, small body, rejection narrative dominant. Above 40%, the candle is more of a marubozu or strong-bodied bar where the price moved decisively and held. The threshold isolates the rejection geometry that historically marks reversal candles versus continuation candles.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3 GUARD &middot; ZERO-RANGE PROTECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Pine condition is <strong className="text-white">candle_range &gt; 0 AND body / candle_range &lt; 0.4</strong>. The candle_range &gt; 0 guard prevents division by zero on doji bars where high equals low (rare but possible in illiquid early-Sunday crypto or pre-market gaps). Without the guard, the division would NaN-out and Factor 3 would never award. <strong className="text-white">CIPHER rejects zero-range bars from Factor 3</strong> entirely &mdash; if there is no range, there is no wick, no body, no rejection geometry to read. Score impact: Factor 3 misses on doji-shaped sweep bars. The other four factors still evaluate normally.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 DEEP-DIVE &middot; SHAKEOUT VS REVERSAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">A with-trend sweep is a shakeout: the trend was going to continue, the sweep flushed weak hands and trapped late counter-trend players, the next leg follows the trend. A counter-trend sweep is a reversal attempt: the prevailing trend may be exhausting, the sweep marks the turn, the next leg goes against the prior direction. <strong className="text-white">Shakeouts have higher edge historically</strong> because they coincide with continuation, not exhaustion. Reversals work but require more confirmation (FVG confluence, exhaustion divergence, regime shift). Factor 4 awards the with-trend bonus to mark the higher-conviction case.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 INPUT &middot; ribbon_dir</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trend reference comes from the Ribbon engine (Lesson 11.16). ribbon_dir is +1 when the four-line stack is bull-aligned and &minus;1 when bear-aligned, with intermediate states (CURVING, DIVERGING) treated as 0. CIPHER reuses this signal here rather than deriving its own trend filter &mdash; the Ribbon stack is already the canonical trend authority. <strong className="text-white">A bull sweep during ribbon_dir == 1 awards Factor 4</strong>. A bull sweep during ribbon_dir == &minus;1 (or 0) does not. The same logic mirrors for bear sweeps.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 5 DEEP-DIVE &middot; THE MULTI-LEVEL THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">Factor 5 fires when sweep_levels_hit &ge; 2. A single wick consuming two or more aged swing levels in one bar is statistically rare &mdash; it requires exceptional momentum, exceptional volume, or both. <strong className="text-white">Multi-level sweeps mark significant institutional events</strong>: end-of-quarter cleanup, post-FOMC reactions, news flushes, holiday gap fills. The XAU 1M screenshot exemplifies this &mdash; 3 levels raided in one monthly bar produces the &#9889; MULTI-LEVEL tooltip line and the Factor 5 award.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 5 IS A BONUS, NOT A REPLACEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Multi-level alone does not produce STRONG. A multi-level sweep with no volume spike, no rejection candle, and counter-trend would still score 1/5 (only Factor 5 fires). <strong className="text-white">Factor 5 is the &ldquo;massive event&rdquo; bonus</strong>, not the master variable. STRONG quality requires multiple factors aligning, of which multi-level may or may not be one. The XAU 1M case scored 4/5 with multi-level + depth + volume + rejection &mdash; trend missed, but four other yeses got it to STRONG.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR ORDERING DOES NOT AFFECT SCORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The five factors are independent yes/no checks evaluated in the order they appear in the Pine, but the score is a simple sum. <strong className="text-white">Any combination of N factors firing produces a score of N</strong>. There is no weighting, no priority, no override. A 3/5 with depth+volume+rejection is identical in score to a 3/5 with depth+with-trend+multi-level. The label maps the same way (MODERATE), the rendering scales the same way (medium diamond, line width 2). The tooltip discloses which specific factors fired so the operator can see the qualitative composition; the score itself is the headline.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE PERSISTENCE &middot; LAST_SWEEP TRACKING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once a sweep fires and scores, CIPHER stores the result in <strong className="text-white">last_sweep_strength</strong> (the integer 0-5) and <strong className="text-white">last_sweep_quality</strong> (the string label). These persist until the next sweep overwrites them. The Command Center row reads these values on every bar to display the current sweep state. <strong className="text-white">There is always a &ldquo;last sweep&rdquo;</strong> once the chart has produced one &mdash; the row never goes blank after the first sweep, only stale (COLD) as the bars-since-sweep counter climbs.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five binary checks, one summed score, one quality label. Each factor is testable on the candle alone &mdash; you can audit any sweep&apos;s score by inspecting the bar in isolation. <strong className="text-white">When the tooltip says STRONG (4/5)</strong>, you can mentally count which four factors lit. <strong className="text-white">When it says WEAK (1/5)</strong>, you know four factors missed and one survived. The score is not a black box; it is the visible sum of five clearly-defined binary tests. Reading the sweep means reading the factor composition.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Visual Anatomy: Diamond + Dotted Line === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; The Visual Anatomy</p>
          <h2 className="text-2xl font-extrabold mb-4">Diamond At The Level. Dotted Line To The Pool.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER renders every confirmed sweep with two visual elements that together encode direction, age, location, and quality. <strong className="text-white">A diamond marker (&#9670;) plants directly on the swept level at the bar where the sweep occurred</strong>. A dotted line stretches back fifteen bars to anchor that diamond visually to the original liquidity pool. The diamond color matches the trade direction &mdash; teal (&#9670;) for buy sweeps where stops were grabbed below, magenta (&#9670;) for sell sweeps where stops were grabbed above. The diamond size and the line width adapt to the strength score so a single glance ranks every recent sweep on the chart by priority.</p>
          <StrengthAdaptiveDiamondAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Three panels, three quality tiers. WEAK on the left renders with a small diamond, a 1px line, and 55-transparency washout &mdash; barely visible, intentionally so, because a 0-1 sweep is a reference mark not a setup. MODERATE in the middle gets a slightly larger diamond, a 2px line, and 35-transparency &mdash; visible but not loud. STRONG on the right gets the full treatment &mdash; a normal-size diamond, a 3px line, and only 20-transparency &mdash; bold enough to spot from a zoomed-out view. <strong className="text-amber-400">The visual gradient is calibrated to match the priority gradient</strong>. Operators can scan a chart and instantly know which sweeps deserve attention without ever opening a tooltip.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DIAMOND PLACEMENT &mdash; AT THE LEVEL, NOT AT THE WICK EXTREME</p>
              <p className="text-sm text-gray-400 leading-relaxed">The diamond plants at the swept level price &mdash; the swing low or swing high that was raided &mdash; not at the wick&apos;s extreme. <strong className="text-white">This matters for visual reading</strong>. The wick&apos;s extreme is a one-bar artifact; the swept level is structural. By placing the diamond at the level, CIPHER makes the chart show you what the operator cares about: <strong className="text-white">where the liquidity was sitting before the raid</strong>. The wick depth is communicated separately via tooltip; the diamond&apos;s job is to mark the pool that got hunted.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 15-BAR DOTTED LINE BACK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every sweep visual includes a dotted line stretching <strong className="text-white">back exactly fifteen bars</strong> from the sweep bar at the swept level price. The line is not a level line in the Structure sense &mdash; it is a visual anchor that says &ldquo;this diamond is connected to a pool that has been sitting at this price for at least fifteen bars of recent action&rdquo;. <strong className="text-white">The longer that line stretches into recent price action without interruption, the more the operator can trust that liquidity was actually accumulating there</strong>. CIPHER does not extend the line forward of the sweep bar &mdash; the pool is consumed, the level retired, the line points to history not future.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COLOR CODES THE TRADE DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Teal diamonds and lines mean BUY SWEEP &mdash; price wicked low, took out stops below, closed back inside &mdash; expect rally. Magenta diamonds and lines mean SELL SWEEP &mdash; price wicked high, took out stops above, closed back inside &mdash; expect drop. <strong className="text-white">The color is the trade direction, not the sweep direction</strong>. A sweep DOWN past a swing low is a BUY sweep because the trade after it is bullish. A sweep UP past a swing high is a SELL sweep because the trade after it is bearish. Confusing the two is the most common reading mistake &mdash; CIPHER fixes it by colour-coding the trade outcome, not the wick path.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE.NORMAL VS SIZE.SMALL &mdash; THE STRENGTH GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine Script offers a small set of fixed label sizes. CIPHER uses two of them for sweep diamonds. <strong className="text-white">Score 4 or 5 promotes the diamond to size.normal</strong>; everything below sits at size.small. The jump from small to normal is roughly a 50% increase in glyph size &mdash; large enough to spot at a glance, restrained enough not to clutter the chart with bold visuals on weak setups. The 4-5 threshold is intentional: STRONG sweeps deserve operator attention; MODERATE and WEAK sweeps live in the visual background as reference data the cascade row can summarize for you.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE WIDTH SCALES BY THREE TIERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The dotted line uses three width values: 1px for WEAK, 2px for MODERATE, 3px for STRONG. <strong className="text-white">Three width tiers map cleanly onto the three quality tiers</strong>, giving the operator a redundant visual signal &mdash; even with diamonds at the same size, the line widths still rank the sweeps. Combined with the transparency gradient, the line communicates priority across two channels at once. On charts where multiple recent sweeps coexist, this dual-channel encoding makes the priority order visually obvious without any need to inspect tooltips.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRANSPARENCY 20 / 35 / 55 &mdash; THE FADE LADDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine&apos;s transparency parameter runs 0 (fully opaque) to 100 (fully transparent). CIPHER uses three values for sweep lines: <strong className="text-white">20 for STRONG (80% opaque, vivid), 35 for MODERATE (65% opaque, clear), 55 for WEAK (45% opaque, restrained)</strong>. The values are chosen so that on a typical dark chart, STRONG lines look almost solid, MODERATE lines look clearly drawn but not pushy, and WEAK lines look like background reference markers that an experienced operator would let visually fade. <strong className="text-white">Bad sweeps are not erased; they are de-emphasized</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MAX 20 SWEEP VISUALS ON CHART</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER caps the number of simultaneously rendered sweep diamonds + lines at <strong className="text-white">twenty</strong> via a FIFO queue. When a 21st sweep prints, the oldest diamond + line pair is deleted. <strong className="text-white">Twenty is not arbitrary</strong> &mdash; it is large enough to preserve recent context across several sessions on lower timeframes, small enough to keep the chart readable, and disciplined enough to prevent the visual layer from accumulating clutter. Operators who want full historical sweep accounting use the Command Center row, which tracks the LAST sweep regardless of how many older ones the visual layer has shed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NO ARROWS, NO LABELS, NO CHART CLUTTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The brand discipline applies in full: no arrow glyphs pointing at sweeps, no &ldquo;BUY SWEEP STRONG&rdquo; text labels rendering on chart, no on-bar quality scores, no contextual annotations. <strong className="text-white">The diamond + the line is the entire on-chart vocabulary</strong>. Everything else lives in the tooltip on hover and the Command Center row at all times. This restraint is what keeps CIPHER charts readable when six layers (Ribbon, Structure, Spine, Imbalance, Sweeps, Risk) are active simultaneously &mdash; each layer claims a small visual budget and never spills past it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Diamond plus line at a swept level is a fact, not an opinion. The diamond color tells you trade direction. The line length tells you the pool was structural. The diamond size and line width tell you the quality. <strong className="text-white">A STRONG bold teal diamond with a thick teal line means stops were grabbed below a structural low and the reversal context just opened</strong>. A WEAK faded magenta diamond with a thin line means stops were technically grabbed above a swing high but the quality is low &mdash; reference only. Read the visuals first, the tooltip only if the visuals merit a closer look.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — The Six-Line Tooltip (Image 1 verbatim bake) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Six-Line Tooltip</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Sweep Atom, One Hover, Six Lines</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Hover any sweep diamond and CIPHER displays the full setup in a single tooltip box. <strong className="text-white">Six core lines plus up to two bonus lines plus one operator instruction line at the end</strong>. The six core lines never change in count or order &mdash; they are the same six atoms for every sweep on every asset on every timeframe. The two optional bonus lines &mdash; FVG confluence and multi-level &mdash; fire only when the conditions are met. The closing instruction line summarizes the operator action in plain English. Below is a real CIPHER tooltip from XAU 1M, baked in verbatim &mdash; numbers, formatting, every glyph faithful to what the engine produces in production.</p>
          <TooltipBreakdownAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the eight lines reveal one by one. Each line carries a different teaching atom &mdash; direction and quality, the raided price, the wick depth in ATR, the volume ratio, the level age, the trend alignment, the multi-level bonus, and the operator instruction. <strong className="text-amber-400">This particular tooltip is a counter-trend STRONG (4/5) with multi-level &mdash; an unusual composition</strong>. It scored four points without earning the with-trend factor, which means the wick depth, volume, rejection quality, and multi-level all fired. Counter-trend STRONG sweeps exist; they are how reversals get caught at major tops and bottoms. The score does not require alignment with the prior trend &mdash; it just rewards alignment when present.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 1 &mdash; DIRECTION + QUALITY + SCORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The opening line is structured as <strong className="text-white">DIRECTION + QUALITY + (SCORE/5)</strong>. Direction is BUY SWEEP or SELL SWEEP. Quality is STRONG, MODERATE, or WEAK. The score in parentheses is the raw integer the engine computed. <strong className="text-white">A trader can lock the read in a single line</strong> &mdash; what just happened, how clean it was, and how trustworthy. Image 1&apos;s example reads &ldquo;SELL SWEEP STRONG (4/5)&rdquo; &mdash; sell direction, strong quality, four out of five factors triggered. No further math required.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 2 &mdash; THE RAIDED LEVEL PRICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The second line shows <strong className="text-white">Level: [exact price]</strong> &mdash; the price of the swing high or swing low that just got raided. Image 1 reads &ldquo;Level: 2067.000&rdquo; &mdash; the swing high in XAU monthly was at 2067 and that is exactly where the wick punched through. <strong className="text-white">This is the level the operator can mark for stop placement and target reference</strong>. It is also the level that just retired from the active swing array &mdash; CIPHER does not look for sweeps at this level again, the pool is consumed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 3 &mdash; WICK DEPTH IN ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The third line shows the wick depth as <strong className="text-white">Wick depth: X.XX ATR</strong>. The depth is computed as the distance from the swept level to the wick&apos;s extreme, divided by the current ATR. <strong className="text-white">Image 1 reads 0.65 ATR</strong> &mdash; the wick punched 65% of an ATR beyond the swept level. Above 0.3 ATR triggers Factor 1. Above 0.6 ATR is a deep grab; above 1.0 ATR is an extreme grab (rare; usually pairs with multi-level). The number tells the operator how aggressive the raid was &mdash; deeper grabs mean more stops were taken.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 4 &mdash; VOLUME RATIO</p>
              <p className="text-sm text-gray-400 leading-relaxed">The fourth line shows the sweep bar&apos;s volume as a multiple of the recent average: <strong className="text-white">Volume: X.XXx avg</strong>. Image 1 reads 1.25x &mdash; the sweep bar traded 25% above the recent volume average. The 1.2x threshold triggers Factor 2. <strong className="text-white">High volume on the sweep bar is the hallmark of institutional participation</strong> &mdash; somebody large was buying or selling into that wick. Below 1.2x volume, the sweep is more likely to be retail-driven and less likely to follow through. The volume ratio gates one of the most important factors.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 5 &mdash; LEVEL AGE IN BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The fifth line shows how long the level held before being raided: <strong className="text-white">Level age: N bars</strong>. Image 1 reads 7 bars &mdash; the swept high formed 7 bars before the raid bar. <strong className="text-white">Older levels mean more accumulated stops</strong>. A 3-bar-old level may have one round of stops sitting on it; a 30-bar-old level has multiple cohorts of trapped traders, breakeven movers, and breakout sellers all clustered at the same price. The level-age does not directly affect the score, but it informs the operator&apos;s mental model of how much liquidity was actually consumed by the raid.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LINE 6 &mdash; TREND ALIGNMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The sixth line shows trend alignment: <strong className="text-white">Trend: With-trend &check; or Counter-trend</strong>. Image 1 reads &ldquo;Counter-trend&rdquo; &mdash; the sell sweep happened against the prior bullish trend (the chart was in a powerful uptrend at the time). <strong className="text-white">With-trend sweeps are shakeouts</strong> &mdash; institutions clearing weak hands before continuation. <strong className="text-white">Counter-trend sweeps are reversal candidates</strong> &mdash; potential trend changes at extremes. Both are tradable; they require different playbooks. Factor 4 awards a point only for with-trend alignment, but the read on counter-trend sweeps lives in this line, not in the score.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BONUS LINE A &mdash; &#9889; MULTI-LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When two or more swing levels were raided in the same bar, an optional line fires: <strong className="text-white">&#9889; MULTI-LEVEL &mdash; N levels raided</strong>. Image 1 shows &ldquo;3 levels raided&rdquo; &mdash; the sell wick punched through three nested swing highs in a single candle, indicating a massive cluster of stops just above. <strong className="text-white">Multi-level sweeps are rare and significant</strong>. They mark concentrated liquidity zones where multiple historical pivots converge at the same price. Multi-level fires Factor 5 &mdash; one of the harder factors to earn &mdash; and visibly stamps the sweep as a high-conviction event.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BONUS LINE B &mdash; &#9733; FVG CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the sweep occurred within 0.5 ATR of a directionally-matched active FVG, a second optional line fires: <strong className="text-white">&#9733; FVG CONFLUENCE &mdash; highest conviction</strong>. This is the apex setup &mdash; liquidity grabbed AT the imbalance magnet, the institutional double-trigger. <strong className="text-white">Image 1 does NOT show this line</strong> &mdash; the XAU monthly tooltip lacked FVG confluence even though it was STRONG and multi-level. FVG confluence requires both proximity and direction match to a live FVG; a strong sweep without nearby FVGs simply does not qualify. When this line appears, the operator treats it as the highest-priority signal context CIPHER recognizes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLOSING LINE &mdash; THE OPERATOR INSTRUCTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">After a blank line, the tooltip closes with a one-sentence operator instruction: <strong className="text-white">&ldquo;Stops grabbed [above/below] &mdash; expect reversal [DOWN/UP]&rdquo;</strong>. Image 1 reads &ldquo;Stops grabbed above &mdash; expect reversal DOWN&rdquo; for the sell sweep. <strong className="text-white">No probabilities, no qualifiers, no hedging</strong>. The instruction is direct and matches the trade direction encoded by the diamond color. CIPHER does not say &ldquo;possibly&rdquo; or &ldquo;may&rdquo; &mdash; the instruction is the engine&apos;s definitive read of the pattern. The operator can choose whether to act, but the engine&apos;s reading is unambiguous.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Six core lines plus up to two bonus lines plus one closing instruction. <strong className="text-white">Hover, scan, decide</strong>. The first line tells you what just happened. Lines 2-6 give you the audit trail. The bonus lines flag the apex setups. The closing line tells you the trade direction. <strong className="text-white">If the tooltip says &#9733; FVG CONFLUENCE, that single line outranks every other consideration</strong> &mdash; the score, the trend alignment, even the level price. The apex sweep is rare; when it appears, the rest of the tooltip is documentation, not decision-making.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Sweep + FVG Confluence (the apex setup) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; The Apex Setup</p>
          <h2 className="text-2xl font-extrabold mb-4">Sweep Plus FVG &mdash; The Highest-Conviction Context CIPHER Recognizes</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Two institutional concepts aligning at the same price. <strong className="text-white">A liquidity sweep is a stop-run; a Fair Value Gap is the magnet price returns to fill</strong>. When a sweep occurs within 0.5 ATR of a directionally-matched active FVG, both concepts converge &mdash; the trap that grabs the stops is sitting at the same price as the magnet pulling price back. CIPHER labels this convergence with &#9733; FVG CONFLUENCE in the tooltip and bumps the Command Center cascade verdict to HOT + FVG &#9733;. The signal context cascade upgrades the buy/sell tag from &ldquo;Sweep&rdquo; to &ldquo;Sweep + FVG&rdquo; &mdash; literally the top of every cascade in CIPHER. This section explains the geometry, the gate, and why the engine treats this combination as the apex.</p>
          <FVGConfluenceAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four phases. <strong className="text-white">Phase 1</strong>: a sweep prints alone &mdash; no FVG nearby, no confluence. <strong className="text-white">Phase 2</strong>: an FVG appears in range but at 1.4 ATR &mdash; outside the 0.5 ATR gate. The 0.5 ATR reference line draws across the chart so the gap is visible &mdash; the FVG is too far. <strong className="text-white">Phase 3</strong>: the FVG slides closer to 0.8 ATR &mdash; still outside. <strong className="text-white">Phase 4</strong>: the FVG sits at 0.3 ATR &mdash; inside the gate &mdash; <strong className="text-amber-400">&#9733; FVG CONFLUENCE fires</strong>. The arrow connecting the sweep to the FVG turns gold. The FVG box brightens. The verdict banner activates.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 0.5 ATR PROXIMITY GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Confluence requires the swept level to be within <strong className="text-white">half an ATR of an active FVG&apos;s midpoint</strong>. Half an ATR is a tight gate &mdash; on a 1H XAU chart with ATR around 5 dollars, that is 2.50 of price proximity. The gate is intentionally tight: confluence only fires when the sweep and the FVG are functionally at the same price. <strong className="text-white">A sweep 1 ATR from an FVG is not confluence</strong> &mdash; it is two separate setups that happen to coexist on the chart. The 0.5 ATR cap is what makes the &#9733; tag meaningful when it does fire.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION MATCH IS REQUIRED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Confluence also requires the sweep direction to match the FVG direction. <strong className="text-white">A bull sweep needs a bull FVG nearby; a bear sweep needs a bear FVG nearby</strong>. A bull sweep with a bear FVG within 0.5 ATR does NOT trigger confluence &mdash; the two concepts disagree on direction. The match is checked via the &ldquo;dir_match&rdquo; condition in the Pine: <code className="text-amber-400">dir_match = (bull_sweep AND fdir == 1) OR (bear_sweep AND fdir == -1)</code>. Without this gate, every sweep near any FVG would falsely trigger; with it, only sweeps near aligned FVGs qualify.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FVG MIDPOINT, NOT EDGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER measures the distance from the swept level to the <strong className="text-white">midpoint of the FVG, not the nearest edge</strong>. The midpoint is the FVG&apos;s structural anchor &mdash; the 50% level inside the gap that price returns to fill. Using the midpoint means the proximity check is robust to gap size: a small 0.3 ATR FVG and a large 1.2 ATR FVG both compare midpoints, not edges. This prevents large FVGs from spuriously triggering confluence with sweeps that are actually beyond the FVG&apos;s far edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BOTH GATES MUST PASS &mdash; AND, NOT OR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The confluence rule is a logical AND: <strong className="text-white">proximity within 0.5 ATR AND direction match</strong>. Either gate failing kills the confluence. A bull sweep with a bull FVG at 1.2 ATR fails proximity. A bull sweep with a bear FVG at 0.3 ATR fails direction. <strong className="text-white">Only the conjunction triggers</strong>. This strict gating is why confluence is rare &mdash; most sweeps either occur in clean space without FVGs, or near FVGs that disagree on direction. When confluence does fire, the operator is seeing a genuinely aligned institutional double-trigger.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP TAG &mdash; &#9733; FVG CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When confluence fires, the sweep tooltip gains an extra line above the operator instruction: <strong className="text-white">&#9733; FVG CONFLUENCE &mdash; highest conviction</strong>. The star glyph (&#9733;) is the brand-locked apex marker reserved for this combination &mdash; no other CIPHER feature uses it. <strong className="text-white">When you see a star in any tooltip, you know without reading further that the engine just flagged its highest-conviction context</strong>. The line is amber-coloured rather than teal/magenta because the apex is direction-agnostic in importance &mdash; both bull and bear apex setups deserve the same visual prominence.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMMAND CENTER ROW &mdash; HOT + FVG &#9733;</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Sweep row in the Command Center upgrades from HOT to HOT + FVG &#9733; when confluence is active and the sweep is within three bars. <strong className="text-white">This is the second-highest verdict in the 6-level cascade</strong>, sitting just below FAILED &mdash; CONTINUATION (which is direction-flipping) and just above plain HOT (no confluence). The verdict colours teal for buy or magenta for sell with a gold star at the end &mdash; the only verdict in the cascade that uses three colours simultaneously. Operators scanning the Command Center catch this verdict instantly because of the visual layering.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWEEP + FVG TOPS THE SIGNAL CONTEXT CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When CIPHER fires a buy or sell signal within three bars of a confluence sweep, the signal&apos;s context tag becomes <strong className="text-white">&ldquo;Sweep + FVG&rdquo;</strong> &mdash; the absolute top of the priority cascade. This tag beats &ldquo;Sweep&rdquo; (no FVG), beats &ldquo;Breakout&rdquo;, beats &ldquo;Snap&rdquo;, beats &ldquo;Exhaustion&rdquo;, beats every other context label CIPHER tracks. <strong className="text-white">A signal stamped &ldquo;Sweep + FVG&rdquo; is the engine telling you, structurally, that this is the highest-conviction context it knows how to recognize</strong>. The tag is rare because confluence is rare, but when it appears in a signal label it commands attention.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE COMBINATION IS THE APEX</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two institutional concepts converge at one price. The sweep evidence shows institutions just hunted stops. The FVG evidence shows institutions left an unfilled imbalance at the same level. <strong className="text-white">The two together mean: stops were grabbed AT the magnet</strong>. Price returned to fill the FVG (the magnet pull), and in returning, took out the stops sitting beyond the previous swing (the trap). Both behaviours are institutional fingerprints; their alignment at the same price is the cleanest possible context for a reversal trade. CIPHER&apos;s rarity gating ensures the &#9733; tag is meaningful when it fires.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A star in the tooltip is the apex. <strong className="text-white">Treat &#9733; FVG CONFLUENCE as a hard upgrade in priority</strong> &mdash; if you would size 1R on a normal STRONG sweep, size 1.5-2R on a confluence STRONG sweep. If you would skip a MODERATE sweep without confluence, take it WITH confluence. The 0.5 ATR + direction-match gate is strict on purpose; when both gates pass, the engine has cleared a high bar. <strong className="text-white">The signal context tag &ldquo;Sweep + FVG&rdquo; on a buy/sell label means stop second-guessing &mdash; this is the trade</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Failed Sweep (Image 4 verbatim bake) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; When The Trap Fails</p>
          <h2 className="text-2xl font-extrabold mb-4">The Failed Sweep &mdash; Continuation, Not Reversal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Roughly thirty percent of sweeps fail. <strong className="text-white">A failed sweep means the wick that looked like a stop-run was actually a breakout</strong> &mdash; the next bar closes BEYOND the swept level instead of holding back inside, and what looked like a reversal context becomes a continuation context. CIPHER detects this geometry one bar after the sweep prints and flips the Command Center verdict from HOT &mdash; REVERSAL LIKELY to FAILED &mdash; CONTINUATION. The operator who can read the failure correctly is now positioned on the OPPOSITE side of the original setup &mdash; long where they were planning to short, or short where they were planning to long. Reading failure is as important as reading success.</p>
          <FailedSweepAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three-bar sequence. <strong className="text-white">Bar 1</strong>: a sell sweep prints &mdash; wick above the swept high, body closes below. The diamond plants. The Command Center reads HOT &mdash; REVERSAL LIKELY. Most operators set up to short. <strong className="text-white">Bar 2</strong>: instead of reversing down, the next bar opens and closes ABOVE the swept high. The big arrow lights up &mdash; CLOSE BEYOND. <strong className="text-amber-400">CIPHER flips the verdict</strong> to FAILED &mdash; CONTINUATION. The trap was bait for the wrong side. The shorts who entered after the sweep are now trapped, the longs who hesitated are vindicated. The continuation move follows.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE DETECTION GEOMETRY &mdash; ONE BAR AFTER THE SWEEP</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER checks for failure exactly one bar after a sweep prints. The check is: <strong className="text-white">if last_sweep_dir == 1 (bull sweep) AND close &lt; last_swept_level, the sweep failed</strong>. The mirror image fires for bear sweeps when close &gt; last_swept_level. <strong className="text-white">The check runs only on bar last_sweep_bar + 1</strong> &mdash; not later. Failure is a 2-bar pattern: the sweep bar and the bar after. If the next bar closes back inside (no failure) the verdict stays HOT through the cooling timeline. If the next bar closes beyond, the failure flag latches.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BULL SWEEP FAILS DOWN. BEAR SWEEP FAILS UP.</p>
              <p className="text-sm text-gray-400 leading-relaxed">A bull sweep fails when price keeps going DOWN. The sweep bar wicked below a swing low and closed back above &mdash; the original read was &ldquo;reversal up&rdquo;. The next bar closes BELOW the swept low &mdash; price did not reverse, it broke through. <strong className="text-white">Failure direction is down for bull sweeps and up for bear sweeps</strong>. The continuation always points opposite to the originally-anticipated reversal. Operators who entered the reversal trade get stopped; operators who waited for the failure confirmation can flip and ride the continuation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 5-BAR FAILURE WINDOW IN THE CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Command Center cascade only displays FAILED &mdash; CONTINUATION when the failure happened within the last 5 bars. After 5 bars, the failure flag is still set internally but the cascade reverts to standard verdicts (COOLING, COLD). <strong className="text-white">Five bars is the actionable window</strong> &mdash; a continuation entry after a failed sweep is most reliable in the immediate aftermath. By 6+ bars, the move has likely played out and entry/exit timing has degraded. The failure flag persists for analytics; the cascade priority gates on freshness.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE OUTRANKS HOT + FVG IN THE CASCADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the 6-verdict Sweep cascade, FAILED &mdash; CONTINUATION sits at <strong className="text-white">position 2</strong> &mdash; just below NO SWEEPS and just above HOT + FVG &#9733;. <strong className="text-white">Failure outranks confluence</strong>. Even if a sweep had FVG confluence, if the next bar closes beyond the swept level, the verdict becomes FAILED. The reasoning: confluence is reversal-context evidence; failure is reversal-context contradiction. When the contradiction lands, it overrides the supporting evidence. The operator&apos;s priority shifts from &ldquo;trade the reversal&rdquo; to &ldquo;trade the continuation&rdquo;.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE COLOUR &mdash; AMBER, NOT TEAL/MAGENTA</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the Command Center, the FAILED verdict colours <strong className="text-white">amber rather than teal or magenta</strong>. Teal is reserved for bullish-bias verdicts; magenta is reserved for bearish-bias. Amber is the brand transition colour &mdash; used for verdicts that signal a state change rather than a directional read. <strong className="text-white">The amber on FAILED is the engine telling you: the read just changed</strong>. Operators scanning the row see amber and immediately know the row is reporting something other than a clean reversal context.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE PROBABILITY IS NOT TRIVIAL &mdash; ROUGHLY 30%</p>
              <p className="text-sm text-gray-400 leading-relaxed">Across CIPHER&apos;s development testing, sweeps fail at roughly a 30% rate &mdash; meaning two out of three sweeps reverse as advertised, and one in three becomes a continuation entry. <strong className="text-white">This is not a defect; this is reality</strong>. Liquidity sweeps are an asymmetric pattern, not a guaranteed reversal. CIPHER&apos;s value is in (a) catching the 70% that work cleanly, (b) flagging the 30% that fail before the operator gets stopped, and (c) giving them a continuation playbook for the failure case. <strong className="text-white">An operator who only trades successful sweeps misses one-third of the actionable opportunities</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY SWEEPS FAIL &mdash; THE TRAP WAS BAIT FOR THE WRONG SIDE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a sweep fails, the institutional read flips. The wick that looked like stops-being-grabbed-then-reversal turns out to have been <strong className="text-white">stops-being-grabbed-as-fuel-for-continuation</strong>. The setup was the same on the surface; the institutional intention was opposite. The trap was bait for the wrong side &mdash; the side that was about to chase the reversal trade. The continuation that follows is funded by both the original stops AND the failed-reversal entries getting stopped. <strong className="text-white">Failed sweeps tend to produce LARGER moves than successful ones</strong> because two cohorts of liquidity feed the continuation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BTC 5M EXAMPLE &mdash; ▼ SELL  2b ago  MODERATE  &rarr; FAILED &mdash; CONTINUATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real failed sweep from BTC 5m makes the pattern concrete. <strong className="text-white">A bear sweep printed: ▼ SELL  2b ago  MODERATE</strong>. The sweep bar wicked above a swing high then closed back below &mdash; classic bear-sweep geometry, MODERATE quality (2-3 factors). The Command Center initially read HOT &mdash; REVERSAL LIKELY. Two bars later, instead of reversing down, price closed ABOVE the swept high &mdash; the continuation up. The cascade flipped to FAILED &mdash; CONTINUATION. Visible on the chart: a bullish FVG forming above the failed-sweep level as price gapped through. Operators who flipped on the failure caught the continuation up; operators who held the original short read got stopped at break-even or worse.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">A sweep is half the trade; the bar after is the other half. <strong className="text-white">If you enter the reversal on the sweep bar close, you must accept the failure risk</strong> &mdash; roughly one in three of those entries will see the next bar close beyond and stop you. <strong className="text-white">If you wait for the next bar to confirm the reversal (close holds inside), you trade fewer setups but with higher confirmation</strong>. Either approach is valid; CIPHER&apos;s job is to flag the failure cleanly so you can flip the read or scratch the trade. The Sweep cascade verdict FAILED &mdash; CONTINUATION is permission to enter the OPPOSITE direction with conviction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Command Center Sweep Row Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Command Center Sweep Row</p>
          <h2 className="text-2xl font-extrabold mb-4">Six Verdicts. First Match Wins. One Glance, Complete Awareness.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Sweep row in the Command Center compresses every sweep on the chart into two cells. <strong className="text-white">Cell 1 displays direction, age, quality, and an optional + FVG tag for the most recent sweep</strong>. <strong className="text-white">Cell 2 broadcasts a verdict from a 6-level priority cascade</strong> &mdash; first match wins, suppressed verdicts never appear. The cascade walks top-down from no-sweep state through failure, hot-with-confluence, hot, cooling, and cold &mdash; six discrete reads that summarize all sweep activity into one labelled cell. Operators get the complete sweep state without scanning chart history.</p>
          <CommandCenterCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch six scenarios cycle through. Each scenario shows a different combination of inputs &mdash; bars-ago, FVG-confluence flag, failure flag &mdash; and the cascade locks onto the first matching verdict. <strong className="text-white">Suppressed verdicts above the match dim out (X)</strong>; verdicts below the match never get evaluated. <strong className="text-amber-400">The cascade is checked top-down because higher verdicts represent higher operator urgency</strong> &mdash; failure overrides confluence overrides standard hot overrides cooling overrides cold. The order of the cascade encodes a priority hierarchy that CIPHER&apos;s authors decided was correct for trading attention; first-match-wins enforces it.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 1 &mdash; NO SWEEPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">last_sweep_bar == 0</code>, no sweep has yet been detected on the chart. Cell 1 reads &ldquo;&mdash; NONE&rdquo;; Cell 2 reads <strong className="text-white">&rarr; NO SWEEPS</strong>. The verdict colours fade-white &mdash; not teal, not magenta &mdash; because no directional read is yet available. <strong className="text-white">This verdict is the default state on chart load before any swings have been raided</strong>. It also fires after a chart-clear or session reset. Operators see this and know there is nothing to track in the Sweep dimension; the row is informational rather than active.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 2 &mdash; FAILED &mdash; CONTINUATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">last_sweep_failed AND ago &le; 5</code>, the most recent sweep has flipped to continuation context within the actionable window. Cell 1 retains the original sweep direction and quality; Cell 2 reads <strong className="text-white">&rarr; FAILED &mdash; CONTINUATION</strong> in amber. <strong className="text-white">This verdict outranks all reversal verdicts below it</strong> because failure is direction-flipping &mdash; the operator&apos;s mental model needs to invert. Even if the original sweep had FVG confluence, failure beats confluence in the cascade. The amber colour signals state change.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 3 &mdash; HOT + FVG &#9733;</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">ago &le; 3 AND last_sweep_fvg</code>, the most recent sweep is fresh AND had FVG confluence. Cell 1 displays direction + bars-ago + quality + &ldquo;+ FVG&rdquo; tag; Cell 2 reads <strong className="text-white">&rarr; HOT + FVG &#9733;</strong> in teal-or-magenta with the gold star. <strong className="text-white">This is the apex verdict in the cascade</strong> &mdash; the highest-conviction reversal context CIPHER recognizes. Operators see the star and instantly know the apex setup is live. The verdict combines three colour cues simultaneously (direction colour, fresh-bar emphasis, gold star) which makes it visually distinct from every other verdict in the row.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 4 &mdash; HOT &mdash; REVERSAL LIKELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">ago &le; 3</code> and no FVG confluence and no failure, the standard hot verdict fires. Cell 2 reads <strong className="text-white">&rarr; HOT &mdash; REVERSAL LIKELY</strong> in teal (for buy sweeps) or magenta (for sell sweeps). <strong className="text-white">This is the bread-and-butter sweep verdict</strong> &mdash; most operator setups happen here, on a fresh sweep without confluence, just past the close-back-inside bar. The 3-bar window is the same one that drives the signal context cascade &mdash; a CIPHER buy/sell signal during this window will tag &ldquo;Sweep&rdquo; on the label.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 5 &mdash; COOLING &mdash; WATCH</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">ago &le; 10</code> (and the higher conditions failed), the sweep is still in active context but past the immediate-action window. Cell 2 reads <strong className="text-white">&rarr; COOLING &mdash; WATCH</strong> in amber. <strong className="text-white">Cooling means: still watch this level, but probability has degraded</strong>. Many sweeps that look like clean reversals at bar 1-3 produce cleaner reversal moves at bar 5-8 as price retests the swept level from inside. The cooling verdict tells the operator: the trade is still on, but the immediate edge has faded; size more conservatively or wait for a re-trigger.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VERDICT 6 &mdash; COLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">ago &gt; 10</code>, the most recent sweep is too old to drive active reversal context. Cell 2 reads <strong className="text-white">&rarr; COLD</strong> in fade-white. <strong className="text-white">COLD does not mean &ldquo;the level is meaningless&rdquo;</strong> &mdash; the swept level is now permanently retired from CIPHER&apos;s sweep arrays, but the level itself may still be tracked by Cipher Structure as a pivoted S/R level. COLD just means the sweep moment has passed; the next trade at this level would be a structure trade, not a sweep trade. The Sweep row remains informational; the operator&apos;s attention shifts to other rows.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 1 COMPOSITION &mdash; FOUR ATOMS IN ONE STRING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 1 packs <strong className="text-white">four atoms into a single string</strong>: direction glyph (▲ or ▼), action verb (BUY or SELL), bars-ago + 'b ago' suffix, and quality label. When confluence is active, a fifth atom appends: &ldquo;+ FVG&rdquo;. Example string: <strong className="text-white">▲ BUY  3b ago  STRONG + FVG</strong>. Reading the cell left-to-right gives direction, then action, then freshness, then quality, then any apex tag. <strong className="text-white">Four to five atoms compressed into ~25 characters</strong>; one of the densest cells in the entire Command Center, and one of the most read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FIRST-MATCH-WINS &mdash; THE CASCADE DISCIPLINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The cascade is a hard-coded sequence of <code className="text-amber-400">if/else</code> conditions. The first condition that evaluates true sets the verdict; lower conditions are never checked. <strong className="text-white">This means the verdict is not a fuzzy &ldquo;best match&rdquo; or a weighted score</strong> &mdash; it is a deterministic pick based on rule order. The operator can audit any verdict by walking the cascade top-down: did NO SWEEPS apply (no)? Did FAILED apply (no)? Did HOT + FVG apply (yes) &mdash; stop. The verdict is HOT + FVG. The cascade is fully transparent and fully deterministic.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two cells, six possible verdicts, complete sweep awareness. <strong className="text-white">Glance the row first</strong>. If Cell 2 reads NO SWEEPS or COLD, the row is informational &mdash; move on. If it reads COOLING, watch but do not size up. If it reads HOT, take the trade. <strong className="text-white">If it reads HOT + FVG &#9733;, take the trade with confidence and consider sizing up</strong>. If it reads FAILED &mdash; CONTINUATION, flip the read and consider the OPPOSITE direction. Five active verdicts, five distinct operator actions. The cascade collapses thirty bars of sweep history into two cells of actionable instruction.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Signal Context Cascade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Signal Context Cascade</p>
          <h2 className="text-2xl font-extrabold mb-4">Sweep Tops Every Other Tag &mdash; Hard-Coded By The Engine</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When CIPHER fires a buy or sell signal, the signal label carries a context tag &mdash; a one-word badge describing why the signal triggered. <strong className="text-white">The eight possible context tags sit in a hard-coded priority cascade</strong> at the top of which is &ldquo;Sweep + FVG&rdquo;, then &ldquo;Sweep&rdquo; alone, then Breakout, Snap, Exhaustion, Momentum, At Support, and finally Trend at the bottom. The cascade is checked top-down: the first context that matches the current bar wins, and lower contexts never get evaluated. <strong className="text-amber-400">A fresh sweep within three bars beats a fresh breakout, beats a fresh exhaustion, beats anything else CIPHER can recognize</strong>. The structural priority of the sweep context is the engine&apos;s built-in opinion that this is the highest-conviction trading context the system tracks.</p>
          <SignalContextCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch four scenarios cycle. <strong className="text-white">Scenario 1</strong>: a sweep three bars ago WITH FVG confluence and aligned ribbon &mdash; the cascade locks onto Sweep + FVG &#9733; at position 1, every lower context gets suppressed. <strong className="text-white">Scenario 2</strong>: a sweep two bars ago WITHOUT FVG &mdash; the cascade matches at position 2 (Sweep), suppressing Breakout/Snap/etc. below. <strong className="text-white">Scenario 3</strong>: no recent sweep but a breakout fired with high volume &mdash; the cascade falls through to position 3. <strong className="text-white">Scenario 4</strong>: nothing fresh at the top, no breakout, just an aligned ribbon stack &mdash; the cascade falls all the way to Trend at position 8. The cascade rewards rare, high-conviction contexts; mundane setups land near the bottom because higher contexts almost always preempt them.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">POSITION 1 &mdash; Sweep + FVG &#9733; (the apex)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The highest-priority context. Requires <strong className="text-white">last_sweep_bar within 3 bars AND last_sweep_fvg true</strong>. When the signal label reads &ldquo;BUY &middot; Sweep + FVG&rdquo; or &ldquo;SELL &middot; Sweep + FVG&rdquo;, the engine is telling you the apex setup just triggered the trade. <strong className="text-white">This tag is rare</strong> &mdash; it requires the 0.5 ATR + direction-match double gate to clear AND a signal to fire within the freshness window. When you see it, treat it as final &mdash; no further confluence-checking is needed because the context tag has already maxed out.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">POSITION 2 &mdash; Sweep (no FVG, still elite)</p>
              <p className="text-sm text-gray-400 leading-relaxed">A fresh sweep without FVG confluence. Requires <strong className="text-white">last_sweep_bar within 3 bars AND last_sweep_fvg false</strong>. The signal label reads &ldquo;BUY &middot; Sweep&rdquo; or &ldquo;SELL &middot; Sweep&rdquo;. <strong className="text-white">This is the most common high-conviction tag</strong> in real trading &mdash; sweeps without FVG confluence happen frequently, and the &ldquo;Sweep&rdquo; tag still represents the engine&apos;s second-highest-priority context. Any signal carrying this tag is structurally elevated above breakout, snap, exhaustion, and the lower contexts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">POSITION 3 &mdash; Breakout</p>
              <p className="text-sm text-gray-400 leading-relaxed">When no recent sweep is active, the cascade checks for a fresh breakout &mdash; price closing decisively beyond a recent S/R level with volume confirmation. The signal label reads &ldquo;BUY &middot; Breakout&rdquo; or &ldquo;SELL &middot; Breakout&rdquo;. <strong className="text-white">Breakout is the highest-priority NON-sweep context</strong>, sitting above snap and exhaustion because clean breakouts represent decisive directional shifts. A signal tagged Breakout means the engine ruled out an active sweep and found the next-best context.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">POSITIONS 4-8 &mdash; Snap, Exhaustion, Momentum, At Support, Trend</p>
              <p className="text-sm text-gray-400 leading-relaxed">The lower five tags handle the remaining contexts in descending priority. <strong className="text-white">Snap</strong> = sharp counter-move from extended levels. <strong className="text-white">Exhaustion</strong> = trend deceleration into a likely turn. <strong className="text-white">Momentum</strong> = new trend acceleration without a clean trigger pattern. <strong className="text-white">At Support</strong> = bounce trigger at structural level without sweep geometry. <strong className="text-white">Trend</strong> = the catch-all for ribbon-aligned signals without any of the above. A signal tagged &ldquo;Trend&rdquo; means the cascade fell all the way through &mdash; the trade is taken on ribbon alignment alone, the lowest-conviction tag the engine hands out.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 3-BAR FRESHNESS GATE FOR SWEEP TAGS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Both Sweep + FVG and Sweep tags require the sweep to be <strong className="text-white">three bars or less from the signal-firing bar</strong>. After three bars, the sweep loses its top-of-cascade status &mdash; even if the original sweep was STRONG with confluence, after the freshness window passes, the next signal that fires will be tagged with whichever lower context applies (Breakout, Trend, etc.). <strong className="text-white">Three bars is the actionable window</strong>. Beyond it, the entry timing degrades and the engine refuses to grant the apex tag. Operators get one-shot windows on the highest-priority context.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY SWEEP OUTRANKS BREAKOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">A breakout is a price-action move; a sweep is an institutional fingerprint. <strong className="text-white">Breakouts can be retail-driven momentum chasing</strong>; sweeps require the specific institutional behaviour of grabbing stops then closing back inside. The cascade rewards the higher-quality context. A signal that COULD have tagged Breakout but actually qualified for Sweep gets the Sweep tag &mdash; the engine never demotes a higher-priority tag to a lower one. If a fresh sweep AND a fresh breakout both exist, the signal carries Sweep; the breakout fact is ignored for tagging purposes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE XAU 4H HOT EXAMPLE &mdash; ▲ BUY  0b ago  MOD  &rarr; HOT &mdash; REVERSAL LIKELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real example from XAU 4H: <strong className="text-white">▲ BUY  0b ago  MOD  &rarr; HOT &mdash; REVERSAL LIKELY</strong>. A buy sweep printed on the current bar (zero bars ago means the sweep IS the current bar), MODERATE quality, no FVG confluence active. Cell 1 reads the freshness as 0b ago because the sweep just confirmed on this bar&apos;s close. Cell 2 reads HOT &mdash; REVERSAL LIKELY (cascade position 4). <strong className="text-white">A signal firing on this exact bar would tag &ldquo;BUY &middot; Sweep&rdquo;</strong> at cascade position 2 of the signal context. Both rows agree; the operator gets a coherent read across the Sweep dimension.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING THE TAG IS READING THE CONVICTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">When you see a signal label, read the tag first, the direction second. <strong className="text-white">A Sweep + FVG tag tells you size up; a Trend tag tells you size down</strong>. The same signal-engine output has fundamentally different conviction depending on what context it fired in. CIPHER does not adjust signal sizing automatically &mdash; it just exposes the context cascade so operators can use it to inform their own sizing discipline. The tag is the engine&apos;s opinion; the operator interprets the opinion into trade size.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read the tag like the engine&apos;s confidence rating. <strong className="text-white">Sweep + FVG = max confidence, max size</strong>. <strong className="text-white">Sweep = high confidence, normal-to-up size</strong>. Breakout/Snap/Exhaustion = medium confidence, normal size. Momentum/At Support/Trend = lower confidence, conservative size or skip. <strong className="text-white">The cascade is hard-coded; the engine never argues with itself</strong>. If the tag is high, you can trust the rest of the system has already validated the setup. If the tag is low, you should impose your own additional filtering before sizing up.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The Reversal Trade Plan (the 70% case) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Reversal Trade Plan</p>
          <h2 className="text-2xl font-extrabold mb-4">Entry, Stop, Targets &mdash; The Standard Sweep Playbook</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Roughly seventy percent of confirmed sweeps reverse as advertised. <strong className="text-white">The standard playbook for those reversals is precise: enter at the close-back-inside, stop just beyond the swept level with an ATR buffer, scale fifty percent at the next FVG midpoint or structural level, trail the balance to the prior swing extreme</strong>. This section walks through each component of the plan with the reasoning behind every choice. The entry timing is what separates operators from chasers; the stop placement is what separates risk discipline from hope; the target structure is what separates 1R trades from 2-3R trades. Every element of the plan is auditable and consistent across timeframes and assets.</p>
          <ReversalTradePlanAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation walks the five components in order. <strong className="text-white">First the swept low and sweep candle appear</strong> &mdash; the setup. <strong className="text-white">Then the entry line lights up at close-back-inside</strong> &mdash; the action. <strong className="text-white">Then the stop drops just below the swept low</strong> &mdash; the risk anchor &mdash; with the 1R red box visualizing risk. <strong className="text-white">Then T1 lights up at the next FVG midpoint</strong> &mdash; the 2R reward box visualizes the first scale level. <strong className="text-white">Then T2 lights up at the prior swing high</strong> &mdash; the +1R extension box for the trailing balance. <strong className="text-amber-400">Five elements, one cohesive plan, repeatable across every STRONG sweep CIPHER fires</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRY &mdash; CLOSE-BACK-INSIDE OF THE SWEEP BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The entry is taken at <strong className="text-white">the close of the sweep bar itself</strong>, not on the next bar. CIPHER waits for that close to confirm the sweep, fires the diamond, and the operator can place a market order or limit order at the close price. <strong className="text-white">Entering on the close means you have full sweep confirmation</strong> &mdash; the wick happened, the body closed back inside, the diamond planted. Waiting for the next bar&apos;s open or for additional confirmation gives away the best entry; the close is where the institutional move just confirmed and where the engine&apos;s own confidence is highest.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOP &mdash; SWEPT LEVEL MINUS 0.25 ATR BUFFER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stop sits <strong className="text-white">just beyond the swept level with a quarter-ATR buffer</strong>. For a buy sweep, that means swept low minus 0.25 ATR. For a sell sweep, swept high plus 0.25 ATR. <strong className="text-white">The buffer matters</strong> &mdash; price often retests the swept level on the way to the actual reversal move, and a stop placed exactly at the level gets shaken. The 0.25 ATR cushion absorbs the noise without excessively expanding risk. Stops tighter than that get shaken on retests; stops wider than 0.5 ATR meaningfully degrade R:R and should be avoided unless trade conviction is extraordinarily high.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">T1 &mdash; NEXT FVG MIDPOINT OR STRUCTURE LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The first target is the <strong className="text-white">midpoint of the nearest opposing FVG</strong> (filled or active) in the trade direction. Failing that, the nearest structural S/R level becomes T1. <strong className="text-white">FVG midpoints are magnetic</strong> &mdash; price returns to fill them with statistical regularity. Targeting the midpoint instead of the far edge gives reliable fill probability without leaving extra reward on the table. Most STRONG sweeps reach T1 within 5-15 bars depending on timeframe; this is where 50% of position is scaled out and risk is brought to break-even on the balance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">T2 &mdash; PRIOR SWING HIGH/LOW (TRAILING THE BALANCE)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The second target is the <strong className="text-white">prior swing in the trade direction</strong> &mdash; for a buy sweep, the most recent swing high before the swept low; for a sell sweep, the most recent swing low before the swept high. <strong className="text-white">After T1, the balance trails on a structure-based stop</strong> &mdash; either the next swing in the favourable direction as it forms, or the Cipher Spine line if it&apos;s tracking tight. T2 represents the natural reversion target for the sweep&apos;s reversal move; trailing past it requires fresh confluence (a second sweep, a fresh signal, a structural breakout).</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE BY QUALITY &mdash; STRONG GETS FULL R, WEAK GETS REFERENCE-ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Position size scales with quality. <strong className="text-white">STRONG (4-5/5) base size is 1R risk &mdash; full size</strong>. <strong className="text-white">MODERATE (2-3/5) base size is 0.5-0.7R</strong> &mdash; reduced because the conviction is partial. <strong className="text-white">WEAK (0-1/5) is reference only</strong> &mdash; no entry. The cascade in the Command Center already broadcasts the quality, so the operator can size the trade in lockstep with what the engine reports. Skipping the size discipline and treating all sweeps as equal is the fastest way to underperform the system: weak sweeps fail more, the math punishes you faster than you can compensate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE UP ON CONFLUENCE &mdash; HOT + FVG &#9733; DESERVES 1.5-2R</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the cascade verdict is <strong className="text-white">HOT + FVG &#9733;</strong>, base size goes to 1.5-2R risk &mdash; double or triple the WEAK reference, half-again the standard STRONG. The reasoning: the apex setup is rare AND high-conviction. Skipping the upsize means leaving the engine&apos;s most reliable signal at the same size as run-of-the-mill setups. <strong className="text-white">Sizing is where edge gets converted into return</strong>. CIPHER&apos;s job is to flag the apex; the operator&apos;s job is to size the apex appropriately. The math punishes operators who size flat just as harshly as it punishes those who oversize WEAK sweeps.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCALE 50% AT T1, MOVE STOP TO BREAK-EVEN</p>
              <p className="text-sm text-gray-400 leading-relaxed">When T1 hits, <strong className="text-white">scale fifty percent of the position out and move the stop on the balance to break-even</strong>. This locks the trade as a guaranteed positive expectation regardless of what happens next. The half-sized balance can ride T2 with no remaining risk; if T2 hits, the trade lands at average 1.5R; if break-even hits on the balance, the trade still locks 1R from the half scaled at T1. <strong className="text-white">The scale + break-even discipline is what makes the 70% win rate sustainable</strong> &mdash; you turn 100% of winners into at least 1R-paying outcomes regardless of how T2 plays out.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SKIP COUNTER-TREND WEAK SWEEPS &mdash; ALWAYS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Counter-trend WEAK sweeps fail at much higher rates than with-trend STRONG sweeps. <strong className="text-white">If the score is 0-1 AND the tooltip reads counter-trend, skip the trade entirely</strong> &mdash; the diamond is reference data, not a setup. The Command Center cascade may still read HOT in the freshness window, but the quality + trend combination is below the operator&apos;s acceptable conviction threshold. <strong className="text-white">Discipline at the entry level is what compounds over hundreds of trades</strong>. Filtering the bad setups out is more valuable than catching every good one; the operator who only takes MODERATE+ sweeps with appropriate trend context outperforms the operator who takes everything regardless.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Five elements, one plan. <strong className="text-white">Entry on close. Stop swept-level minus 0.25 ATR. T1 next FVG mid. T2 prior swing. Scale 50% at T1, trail balance</strong>. Size 1R for STRONG, 0.5-0.7R for MODERATE, 1.5-2R for HOT + FVG &#9733;, skip WEAK and counter-trend WEAK. <strong className="text-white">The plan is identical across every sweep on every chart on every timeframe</strong>. Variability lives in the size, not the structure. Operators who lock the structure and adjust only the size build a repeatable, auditable trading process around the engine&apos;s output.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Failed Plan (the 30% case) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Continuation Plan</p>
          <h2 className="text-2xl font-extrabold mb-4">When The Trap Was Bait For The Wrong Side &mdash; Flip The Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Thirty percent of sweeps fail. <strong className="text-white">The continuation playbook is the operator&apos;s response to the failure</strong> &mdash; instead of accepting a stopped-out reversal trade, the operator flips and enters the OPPOSITE direction on the close-beyond bar, with the stop tucked just inside the original sweep bar. The continuation plan is structurally simpler than the reversal plan because the failure itself is high-conviction evidence: the swept level is broken, the trapped side&apos;s stops are now feeding the move, the institutional read is unambiguous. The plan is more aggressive in entry timing and tighter in stop placement than the reversal plan, but it produces statistically larger moves &mdash; failed sweeps tend to extend further than successful ones because two cohorts of liquidity feed the continuation.</p>
          <ContinuationTradePlanAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the five-step sequence. <strong className="text-white">Setup</strong>: a bear sweep prints &mdash; magenta diamond at a swept high, body closes below the level. The standard reversal read says SHORT. <strong className="text-white">Failure</strong>: the next bar opens above and closes ABOVE the swept high &mdash; CLOSE BEYOND. The reversal read just got invalidated. <strong className="text-white">Entry</strong>: the operator goes LONG at the close-beyond bar&apos;s close. <strong className="text-white">Stop</strong>: tucked inside the original sweep bar &mdash; close to the swept high but on the failure side. <strong className="text-amber-400">Target</strong>: the next structural level in the continuation direction, often 2-3R away due to the explosive nature of failed-sweep moves.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRY &mdash; CLOSE-BEYOND BAR&apos;S CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The entry is taken at <strong className="text-white">the close of the failure bar</strong>, not at the swept level itself. The failure bar is the bar that closes BEYOND the swept level &mdash; that close is the operator&apos;s confirmation that the sweep failed. <strong className="text-white">Entering on the failure bar&apos;s close gives full failure confirmation</strong> &mdash; the bar closed beyond, the original reversal read is dead, the continuation read is now active. Limit-style entries at the swept level itself risk getting filled into a re-test that does NOT close beyond, which would NOT trigger the failure flag.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOP &mdash; INSIDE THE ORIGINAL SWEEP BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The stop sits <strong className="text-white">just inside the original sweep bar&apos;s body</strong> with a 0.25 ATR buffer. For a failed bear sweep (now long), that means just below the swept high. For a failed bull sweep (now short), just above the swept low. <strong className="text-white">This is a tighter stop than the reversal plan&apos;s</strong> &mdash; you get a smaller risk because the failure already invalidated the level. Price returning back inside the original sweep bar would invalidate the continuation read just as cleanly as the original failure invalidated the reversal read. The tight stop is justified by the high-conviction nature of the failure pattern.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TARGET &mdash; NEXT STRUCTURAL LEVEL IN CONTINUATION DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The target is <strong className="text-white">the next structural S/R level in the continuation direction</strong>, typically the next pivot high (for a failed bear sweep going long) or pivot low (for a failed bull sweep going short). <strong className="text-white">Continuations often run 2-3R</strong> because the move has dual fuel sources &mdash; the original sweep&apos;s stops AND the trapped reversal entries. Operators who size in conservatively but ride the move out with a structure-based trailing stop frequently capture extended legs. The single-target approach is intentional: failed sweeps don&apos;t need the multi-stage scaling discipline of reversal trades because the move is already confirmed unidirectional by the failure itself.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE &mdash; SAME AS REVERSAL FOR EQUIVALENT QUALITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Size the continuation entry the same as you would have sized the reversal: <strong className="text-white">STRONG sweep that failed gets full 1R; MODERATE failed gets 0.5-0.7R</strong>. The failure does not upgrade or downgrade the original quality &mdash; it just flips the direction. <strong className="text-white">Counter-intuitively, a failed STRONG sweep is no MORE valuable than a successful STRONG sweep</strong> &mdash; the size and risk discipline stays identical. What changes is your confidence in the direction; the failure provides directional clarity that the original sweep alone did not. Treat the size as constant; treat the direction as flipped.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE 5-BAR ACTIONABLE WINDOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Command Center cascade displays FAILED &mdash; CONTINUATION only when the failure happened within the last 5 bars. <strong className="text-white">The continuation entry is only taken inside that 5-bar window</strong>. After the window closes, the move has likely played out, the entry timing has degraded, and the continuation playbook no longer applies. <strong className="text-white">If you see FAILED &mdash; CONTINUATION on the cascade, the trade is live now or soon</strong>; if the cascade has fallen back to COOLING or COLD, the continuation moment passed. The window is intentionally tight because failed-sweep moves are kinetic &mdash; they don&apos;t wait for slow operators.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T DOUBLE-DIP &mdash; THE FLIP IS THE TRADE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you took the original reversal trade and got stopped, do NOT immediately enter the continuation in the opposite direction without first letting the failure confirm cleanly. <strong className="text-white">Double-dipping &mdash; reversal entry, stopped out, immediate flip to continuation &mdash; only works when the failure-bar close-beyond is unambiguous</strong>. If the failure was marginal (close just barely beyond), wait one more bar to confirm; if the failure was decisive (close way beyond with high volume), the flip is justified. The discipline matters because revenge-flipping a stopped trade is psychologically primed for sloppy execution.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CHECK FOR FRESH FVG IN THE CONTINUATION DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Failed sweeps frequently <strong className="text-white">create new FVGs in the continuation direction</strong> &mdash; the explosive close-beyond bar leaves a 3-candle gap that the Imbalance Pro engine catches and tracks. If you can confirm a fresh FVG below your entry (for failed bear sweep going long) or above (for failed bull sweep going short), that FVG becomes a high-confidence anchor for stops or scaling targets. Fresh FVGs born of failed sweeps tend to produce extreme fill rates because they were forged in institutional aggression. The failure gave you direction; the FVG gives you structure.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE OFTEN MEANS THE TREND WAS TRUER THAN THE LEVEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a sweep fails, the meta-read is usually that <strong className="text-white">the prior trend was structurally stronger than the swept level was</strong>. A bear sweep that fails up means the uptrend was real; the swing high was just a pause not a top. A bull sweep that fails down means the downtrend was real; the swing low was a pause not a bottom. <strong className="text-white">Failed sweeps reaffirm the prior trend</strong> &mdash; with-trend continuations after failed counter-trend sweeps are statistically the highest-conviction continuation setups. Reading the failure correctly is reading the trend correctly.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Failure flips the read. <strong className="text-white">Entry on the close-beyond bar. Stop inside the original sweep bar. Target next structural level. Same size as the equivalent-quality reversal would have been</strong>. The 5-bar window is the only window. <strong className="text-white">When you see FAILED &mdash; CONTINUATION on the cascade, the engine has just told you exactly which direction to take and exactly which level invalidates that direction</strong>. Trust the reading. Take the trade. The 30% case is not a defect &mdash; it is half the operator&apos;s edge in the sweep dimension.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — With-Trend vs Counter-Trend === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; With-Trend vs Counter-Trend</p>
          <h2 className="text-2xl font-extrabold mb-4">Same Geometry. Different Read. Different Playbook.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A sweep is a sweep regardless of trend context &mdash; the geometry (wick beyond, close back inside, three-bar age) is identical whether the chart is in a roaring uptrend or a clean downtrend. <strong className="text-white">But the operator&apos;s read of the same geometry is fundamentally different depending on trend alignment</strong>. With-trend sweeps are shakeouts &mdash; institutions clearing weak hands before continuation. Counter-trend sweeps are reversal candidates &mdash; potential turning points at extremes. Both are tradable; they require different sizing, different targets, and different post-trade expectations. CIPHER does not differentiate the geometry; the operator must.</p>
          <WithVsCounterTrendAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two-panel comparison shows the structural difference. <strong className="text-white">Left panel</strong>: ribbon trending up, buy sweep at a swing low &mdash; classic with-trend shakeout. The verdict reads CONTINUATION PLAY because the sweep grabbed stops before the trend resumed. Factor 4 fires (with-trend bonus); STRONG quality is easier to achieve. <strong className="text-white">Right panel</strong>: ribbon trending up, sell sweep at a swing high &mdash; classic counter-trend reversal candidate. The verdict reads REVERSAL CANDIDATE; this is a potential trend change at an extreme. Factor 4 misses (no with-trend bonus); STRONG quality requires four out of the four other factors to fire, which is structurally harder. <strong className="text-amber-400">Both setups are tradable; the operator&apos;s framework differs</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WITH-TREND SWEEP &mdash; THE SHAKEOUT READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sweep aligned with the prior trend is a <strong className="text-white">shakeout</strong> &mdash; institutions briefly grab stops in a counter-direction wick, then resume the trend. Buy sweep in an uptrend = price wicks down to grab long stops, then closes back above the swing low and continues higher. <strong className="text-white">The trade is short-duration, mean-reversion-style</strong>: enter long on the close, exit at the next FVG midpoint, expect the trend to resume. Targets are tight because the move is part of the larger trend rather than its termination. With-trend sweeps fire frequently in trending markets; the operator picks them off as continuation entries, not reversal entries.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COUNTER-TREND SWEEP &mdash; THE REVERSAL READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sweep against the prior trend is a <strong className="text-white">reversal candidate</strong> &mdash; potentially the top or bottom of a multi-bar move. Sell sweep in an uptrend = price wicks up to grab short stops at a structural high, then closes back below and may reverse the entire prior trend. <strong className="text-white">The trade is longer-duration, trend-change-style</strong>: enter on the close, target the prior swing in the OPPOSITE direction (back through the body of the prior trend), expect a multi-bar reversal move. Targets are wider because the move negates rather than continues the trend. Counter-trend sweeps are rarer; when they do fire, they catch trend changes at structural extremes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 4 BIASES THE QUALITY SCORE TOWARD WITH-TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Of the five strength factors, <strong className="text-white">factor 4 (trend alignment) only fires for with-trend sweeps</strong>. This means with-trend sweeps have a structural advantage of one free point in the score before any of the other factors are considered. A with-trend sweep with average wick depth, average volume, average rejection, and no multi-level fires factor 4 alone for a score of 1/5 (WEAK). A counter-trend sweep with the same geometry scores 0/5 (still WEAK). For STRONG (4-5/5), counter-trend sweeps must fire four of the four available non-trend factors, while with-trend sweeps need only three. <strong className="text-white">Counter-trend STRONG sweeps are rarer and more meaningful when they appear</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BTC 1W BUY WEAK EXAMPLE &mdash; ▲ BUY 1b ago WEAK &rarr; HOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real example from BTC weekly: <strong className="text-white">▲ BUY  1b ago  WEAK  &rarr; HOT</strong>. A buy sweep printed last bar, WEAK quality (1/5 score, only one factor fired). On a higher timeframe like the weekly, even WEAK sweeps deserve attention because the timeframe-volume itself is meaningful. <strong className="text-white">The cascade still reads HOT because freshness and direction matter independently of quality</strong>. The operator interprets WEAK on a weekly differently than WEAK on a 5m &mdash; the higher timeframe context inflates the practical importance of even low-score sweeps. A WEAK weekly sweep merits position-tracking attention; a WEAK 5m sweep is reference data only.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE EUR 15M BUY WEAK EXAMPLE &mdash; ▲ BUY 10b ago WEAK &rarr; COOLING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real example from EUR 15m: <strong className="text-white">▲ BUY  10b ago  WEAK  &rarr; COOLING &mdash; WATCH</strong>. A buy sweep printed ten bars ago, WEAK quality. The cascade has dropped from HOT (within 3 bars) to COOLING (within 10 bars). <strong className="text-white">Ten bars on a 15m chart is 2.5 hours of action</strong> &mdash; the immediate edge has passed but the level is still potentially relevant. The operator&apos;s read: do not size up here, but if price retests the swept level cleanly, a re-entry signal might fire with fresh confluence. COOLING means watch, not act. The level is in the operator&apos;s mental model, but the trade trigger has already discharged.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TIMEFRAME CONTEXT MULTIPLIES SWEEP IMPORTANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A WEAK sweep on the weekly is more important than a STRONG sweep on the 5m. <strong className="text-white">Higher timeframes carry more institutional weight</strong> because the volume traded across a weekly bar represents days of accumulated positioning. Operators who watch multiple timeframes simultaneously rank sweep priority by timeframe first, quality second. A weekly STRONG sweep with FVG confluence is a multi-day positional setup; a 5m STRONG sweep with FVG confluence is an intraday scalp. The Sweep cascade verdict reads identically across timeframes; the operator&apos;s playbook around it scales with the chart.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DECIDING WITH-TREND VS COUNTER-TREND IN REAL TIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER decides the trend context using the <strong className="text-white">Cipher Ribbon stack direction</strong> at the moment of the sweep. If the ribbon is stacked up (Core &gt; Flow &gt; Anchor) and a buy sweep fires at a swing low, that is with-trend. If the ribbon is stacked up and a sell sweep fires at a swing high, that is counter-trend. The ribbon&apos;s stack-vs-flat-vs-flipping state is broadcast in the Ribbon Command Center row. <strong className="text-white">Reading the Ribbon row first, then the Sweep row, gives the operator the trend-context-then-pattern read in two glances</strong> &mdash; trend before pattern, always.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN THE TREND IS UNCLEAR &mdash; SKIP COUNTER-TREND SWEEPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">If the Cipher Ribbon row reads CHOP, FLAT, or COILED instead of clearly stacked, the trend context is unclear. <strong className="text-white">Counter-trend sweeps in unclear-trend conditions should generally be skipped</strong> &mdash; the &ldquo;reversal&rdquo; read requires a real trend to reverse. Without a clear directional structure, a counter-trend sweep is just a sweep; the reversal interpretation does not apply. With-trend sweeps in unclear-trend conditions can still work as range-bottom or range-top entries, but again with reduced size because the &ldquo;continuation&rdquo; read is also weakened. <strong className="text-white">Trend clarity is upstream of sweep playbook selection</strong>; without it, the playbook degrades into general structure trading rather than sweep trading.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read the trend first. <strong className="text-white">With-trend sweep = shakeout; size full, target tight, expect continuation</strong>. <strong className="text-white">Counter-trend sweep = reversal candidate; size full only if STRONG, target wide, expect trend change</strong>. <strong className="text-white">No clear trend = skip counter-trend, reduce size on with-trend</strong>. The geometry alone does not tell you the trade; the geometry plus the trend context does. CIPHER scores the trend factor automatically; the operator translates the score into playbook selection.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Edge Cases === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Edge Cases</p>
          <h2 className="text-2xl font-extrabold mb-4">Where The Standard Plan Doesn&apos;t Quite Fit</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Not every sweep fits cleanly into the standard playbook. <strong className="text-white">Multi-level sweeps, gap-driven sweeps, very-old levels, and simultaneous bull-and-bear sweeps</strong> all introduce nuances that the standard plan does not fully address. CIPHER detects all of these conditions correctly &mdash; the engine doesn&apos;t skip edge cases &mdash; but the operator&apos;s playbook needs adjustment for each. This section walks through the most common edge conditions, what the engine reports, what the operator should adjust, and when to skip the trade entirely. Edge cases are where pattern-recognition skill compounds; the operator who knows when the standard plan applies versus when it doesn&apos;t outperforms the operator who treats all sweeps identically.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">MULTI-LEVEL SWEEPS &mdash; SIZE UP, TARGET FURTHER</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the tooltip shows <strong className="text-white">&#9889; MULTI-LEVEL &mdash; N levels raided</strong>, two or more swing levels were swept in the same bar. Multi-level sweeps fire factor 5 and visibly stamp the sweep as high-conviction. <strong className="text-white">The standard plan adjusts: size up by 25-50%, target the next structural level beyond T1 directly (skip the FVG midpoint), expect a larger reversal move</strong>. Multi-level sweeps consume concentrated liquidity zones and tend to produce extended reversal moves because multiple cohorts of trapped traders need to unwind. Image 1&apos;s XAU 1M example raided 3 levels in a single bar &mdash; that is institutional-scale activity, not retail noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GAP-DRIVEN SWEEPS &mdash; CHECK GAP DIRECTION FIRST</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a sweep prints on the bar after a session gap (overnight gap on equity, weekend gap on crypto), <strong className="text-white">the gap fill itself may be the dominant move</strong>, not the sweep&apos;s reversal context. The engine still detects the sweep correctly, but the post-sweep price action is often dominated by gap-fill mechanics rather than stop-run mechanics. The operator&apos;s adjustment: <strong className="text-white">if the gap direction matches the sweep&apos;s reversal direction, size standard; if the gap direction OPPOSES the sweep&apos;s reversal direction, reduce size or skip</strong> until the gap fills. Gap-fill flow can override sweep-reversal flow; do not fight it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VERY-OLD LEVELS &mdash; DEEP HISTORY, FRESH STOPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the tooltip reads <strong className="text-white">Level age: 50+ bars</strong>, the swept level held for an unusually long time. Very old levels accumulate multiple cohorts of stops &mdash; long-since-trapped breakeven movers, fresh stops from recent participants, breakout-fakeout sellers. <strong className="text-white">When such a level finally gets raided, the sweep is often unusually meaningful</strong> &mdash; massive accumulated liquidity gets discharged in a single bar. The operator&apos;s adjustment: <strong className="text-white">size full or up, expect larger reversal moves, target the prior swing in the opposite direction (T2) directly without scaling at T1</strong>. Old-level sweeps tend to produce 3-4R moves rather than the standard 2R. CIPHER does not adjust the score for level age, but the tooltip atom is there for the operator to read.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIMULTANEOUS BULL + BEAR SWEEPS &mdash; INSIDE-BAR VOLATILITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A rare condition: a single bar wicks BOTH above a swing high AND below a swing low, then closes back inside both levels. <strong className="text-white">CIPHER fires both a bull sweep diamond and a bear sweep diamond at the same bar</strong>. This is structurally an inside-bar with extended wicks, indicating extreme volatility and bilateral stop-grabbing. The operator&apos;s read: <strong className="text-white">do not take either sweep individually as a directional setup</strong>. The bilateral grabbing means neither side has clear conviction; the next bar&apos;s direction is more important than either sweep&apos;s individual reading. Wait for the bar AFTER the simultaneous sweep to close, then read its close-direction as the actual signal.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FAILED MULTI-LEVEL SWEEPS &mdash; EXPLOSIVE CONTINUATIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A multi-level sweep that fails is the most explosive continuation pattern CIPHER tracks. The setup: 2-3 levels raided in one bar, then the NEXT bar closes BEYOND the deepest swept level. <strong className="text-white">All the trapped reversal entries from a STRONG multi-level setup get stopped simultaneously</strong>, on top of the original sweep&apos;s liquidity, on top of any breakout-traders entering on the close-beyond. Three cohorts of liquidity feed the continuation. The operator&apos;s adjustment: <strong className="text-white">size standard for the failure entry but allow a wider target &mdash; failed multi-level sweeps frequently produce 4-5R moves before stalling</strong>. The cascade verdict still reads FAILED &mdash; CONTINUATION; the operator just trails wider than usual.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWEEPS DURING NEWS RELEASES &mdash; SKIP, ALWAYS</p>
              <p className="text-sm text-gray-400 leading-relaxed">During major news releases (FOMC, NFP, CPI, ECB rate decisions, earnings surprises), <strong className="text-white">price action becomes news-driven rather than structure-driven</strong>. CIPHER will still detect sweeps that print during these periods, but the institutional-stop-run interpretation breaks down &mdash; the moves are reactions to information shocks, not liquidity hunts. The operator&apos;s rule: <strong className="text-white">skip every sweep within 30 minutes of a known news release</strong>, regardless of cascade verdict or strength score. After the news has been digested (typically 60-120 minutes), normal sweep interpretation resumes. Pattern-trading and news-trading are different disciplines; do not conflate them.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWEEPS AT ROUND NUMBERS &mdash; CONFLUENCE WITHOUT FVG</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a swept level coincides with a major round number (BTC 100k, EUR 1.10, XAU 2000), <strong className="text-white">the sweep gains confluence-like importance even without FVG involvement</strong>. Round numbers are psychological liquidity zones &mdash; retail orders cluster at them in ways that mirror institutional liquidity around structural pivots. The operator&apos;s read: a STRONG sweep at a round number deserves the same upsize treatment as a HOT + FVG &#9733; verdict, even if the cascade does not formally tag it. CIPHER does not detect round-number coincidence directly &mdash; this is operator pattern recognition layered on top of the engine&apos;s structural reads.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWEEPS AGAINST CIPHER STRUCTURE FLIPPED LEVELS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a sweep occurs at a level that <strong className="text-white">Cipher Structure has flagged as recently flipped (the &#10227; glyph in Structure&apos;s tooltip)</strong>, the level&apos;s polarity changed within the recent past &mdash; what was support became resistance, or vice versa. Sweeps at recently-flipped levels are unusually meaningful because the flip itself indicates institutional repositioning at that price. The operator&apos;s adjustment: <strong className="text-white">treat sweep + flipped-level as approaching apex priority</strong>, just below HOT + FVG &#9733;. Cross-row reading: Sweep row reads HOT, Structure row shows the flipped glyph &mdash; the operator combines the two reads even though CIPHER does not formally fuse them into a single verdict.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Edge cases are where playbook discipline pays off. <strong className="text-white">Multi-level = size up. Gap-driven = check direction first. Old levels = expect bigger moves. Simultaneous = wait one bar. Failed multi-level = trail wider. News = skip. Round numbers = bonus confluence. Flipped levels = approaching apex</strong>. <strong className="text-white">The standard plan handles 80% of sweeps; the edges handle the other 20%</strong>. Operators who can recognize the edge conditions and adjust their playbook accordingly capture meaningfully more of the engine&apos;s available edge than operators who treat every sweep as identical.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Everything You Need, One Reference Card</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this section. Pin it next to your charts. <strong className="text-white">The cheat sheet collapses every actionable rule from the lesson into a single dense reference</strong> &mdash; geometry, age gate, strength factors, cascade verdicts, signal context priority, trade plan structures, and edge cases. The cheat sheet is intentionally non-narrative &mdash; it assumes you have already read the rest of the lesson and just need a recall scaffold during live trading. Use it to verify a setup before entering, to check stop placement after entering, to recognize an edge case in real time. The whole CIPHER sweep system, distilled.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">GEOMETRY &mdash; TWO CONDITIONS, ONE CANDLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Bull sweep</strong>: low &lt; swing_low AND close &gt; swing_low. <strong className="text-white">Bear sweep</strong>: high &gt; swing_high AND close &lt; swing_high. <strong className="text-white">Age gate</strong>: bar_index &minus; lvl_bar &gt; 3. Both conditions on the same bar. Diamond plants at the level on the close. Dotted line stretches back 15 bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRENGTH FACTORS &mdash; FIVE BINARY CHECKS, 0-5 SCORE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">F1</strong>: wick_depth &gt; 0.3 ATR. <strong className="text-white">F2</strong>: bar_volume &gt; 1.2x avg. <strong className="text-white">F3</strong>: body/range &lt; 0.4. <strong className="text-white">F4</strong>: with-trend (ribbon_dir match). <strong className="text-white">F5</strong>: multi-level (&ge;2 levels raided). <strong className="text-white">Quality</strong>: 4-5 STRONG, 2-3 MODERATE, 0-1 WEAK. <strong className="text-white">Visual</strong>: STRONG = size.normal + width 3 + transp 20; MODERATE = size.small + 2 + 35; WEAK = size.small + 1 + 55.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FVG CONFLUENCE &mdash; THE APEX GATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Both required: <strong className="text-white">|swept_level &minus; fvg_midpoint| &lt; 0.5 ATR</strong> AND <strong className="text-white">sweep_dir == fvg_dir</strong>. When both gates pass: tooltip shows &#9733; FVG CONFLUENCE, cascade reads HOT + FVG &#9733;, signal context tag becomes &ldquo;Sweep + FVG&rdquo; &mdash; top of every cascade in CIPHER.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILED SWEEP &mdash; ONE-BAR-AFTER GEOMETRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Detection: <strong className="text-white">on bar = last_sweep_bar + 1, check if close beyond swept level</strong>. Bull sweep fails when next close &lt; swept_low. Bear sweep fails when next close &gt; swept_high. Cascade flips HOT &rarr; FAILED &mdash; CONTINUATION (amber). 5-bar actionable window. ~30% failure rate. Failure outranks confluence in cascade.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE &mdash; SWEEP ROW (FIRST MATCH WINS)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">1.</strong> NO SWEEPS (last_sweep_bar==0). <strong className="text-white">2.</strong> FAILED &mdash; CONTINUATION (failed && ago&le;5). <strong className="text-white">3.</strong> HOT + FVG &#9733; (ago&le;3 && fvg). <strong className="text-white">4.</strong> HOT &mdash; REVERSAL LIKELY (ago&le;3). <strong className="text-white">5.</strong> COOLING &mdash; WATCH (ago&le;10). <strong className="text-white">6.</strong> COLD (ago&gt;10). Top-down evaluation. Suppressed verdicts never appear.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CASCADE &mdash; SIGNAL CONTEXT (FIRST MATCH WINS)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">1.</strong> Sweep + FVG &#9733;. <strong className="text-white">2.</strong> Sweep. <strong className="text-white">3.</strong> Breakout. <strong className="text-white">4.</strong> Snap. <strong className="text-white">5.</strong> Exhaustion. <strong className="text-white">6.</strong> Momentum. <strong className="text-white">7.</strong> At Support. <strong className="text-white">8.</strong> Trend. Sweep tags require ago&le;3. Read the tag = read the conviction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REVERSAL PLAN (THE 70% CASE)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry</strong>: close-back-inside of sweep bar. <strong className="text-white">Stop</strong>: swept level &plusmn; 0.25 ATR buffer. <strong className="text-white">T1</strong>: next FVG midpoint or structure level. <strong className="text-white">T2</strong>: prior swing high/low. <strong className="text-white">Scale</strong>: 50% at T1 + move to BE on balance. <strong className="text-white">Size</strong>: STRONG 1R, MODERATE 0.5-0.7R, WEAK skip. <strong className="text-white">HOT + FVG &#9733; size 1.5-2R</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONTINUATION PLAN (THE 30% CASE)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Entry</strong>: close-beyond bar&apos;s close. <strong className="text-white">Stop</strong>: inside the original sweep bar with 0.25 ATR buffer. <strong className="text-white">Target</strong>: next structural level in continuation direction. <strong className="text-white">Single target, no scaling</strong>. <strong className="text-white">Size</strong>: same as equivalent-quality reversal would have been. <strong className="text-white">5-bar actionable window only</strong>. Failed multi-level = trail wider.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE-CASE TABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Multi-level</strong>: size up 25-50%, target deeper. <strong className="text-white">Gap-driven</strong>: check gap direction; opposing = skip. <strong className="text-white">Old levels (50+ bars)</strong>: expect bigger moves, target T2 directly. <strong className="text-white">Simultaneous bull+bear</strong>: wait one bar, read its close direction. <strong className="text-white">Round numbers</strong>: treat as approaching apex. <strong className="text-white">Flipped levels</strong>: cross-row read with Structure&apos;s &#10227; glyph. <strong className="text-white">News releases</strong>: skip every sweep within 30min of major release.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WITH-TREND VS COUNTER-TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">With-trend</strong>: shakeout, factor 4 fires, target T1 tight, expect continuation. <strong className="text-white">Counter-trend</strong>: reversal candidate, factor 4 misses (need 4/4 others for STRONG), target T2 wide, expect trend change. <strong className="text-white">No clear trend</strong>: skip counter-trend, reduce with-trend size. Read Ribbon row first; trend before pattern.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZE TABLE (RISK-PER-TRADE)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">WEAK + counter-trend</strong>: skip. <strong className="text-white">WEAK + with-trend</strong>: 0.25R reference only. <strong className="text-white">MODERATE + counter-trend</strong>: 0.5R. <strong className="text-white">MODERATE + with-trend</strong>: 0.7R. <strong className="text-white">STRONG (any)</strong>: 1R. <strong className="text-white">HOT + FVG &#9733;</strong>: 1.5R baseline, 2R if multi-level or flipped level. <strong className="text-white">FAILED &mdash; CONTINUATION</strong>: same R as the equivalent original quality.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ENTIRE LESSON IN ONE SENTENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">A wick that pierces a level then closes back inside is not a breakdown &mdash; it is a sweep, and CIPHER tells you the trade direction, the quality, the apex condition, and the failure flip in one row of two cells.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === MISTAKES — SIX COMMON FAILURES === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The Failure Modes &mdash; Recognize Them, Avoid Them</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every operator new to sweep trading makes the same six mistakes. <strong className="text-white">Each one costs trades, costs money, and reinforces the wrong reading habits</strong>. Recognizing them in your own trading is half the fix; the other half is operationalizing the cheat sheet rules above so the mistakes never happen in the first place. Below are the six failure modes ordered by frequency.</p>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &mdash; ENTERING ON THE WICK ALONE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most common mistake. The trader sees the wick punch beyond a swing low, gets excited, and buys mid-bar before the close confirms. <strong className="text-white">If the body never closes back inside, it&apos;s a breakdown, not a sweep</strong> &mdash; the trader bought a falling knife. <strong className="text-white">Fix</strong>: wait for the close. Always. The sweep diamond does not plant until the close confirms the body is back inside the level. Mid-bar wicks alone are noise.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &mdash; IGNORING THE FAILURE FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sweep prints, the trader enters the reversal, the next bar closes BEYOND, and the trader holds anyway hoping it comes back. <strong className="text-white">FAILED &mdash; CONTINUATION on the cascade is permission to flip, not a suggestion to ignore</strong>. Holding through a failed sweep is how reversal-trade losses balloon from 1R into 2-3R. <strong className="text-white">Fix</strong>: when the cascade flips to FAILED, exit immediately at market. Take the small loss. Re-enter the OPPOSITE direction if conviction returns. Do not hope.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &mdash; SIZING IDENTICALLY ACROSS QUALITY TIERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader treats every sweep as 1R risk regardless of whether it&apos;s STRONG, MODERATE, or WEAK. <strong className="text-white">WEAK sweeps fail meaningfully more than STRONG sweeps</strong> &mdash; sizing them identically guarantees the math punishes the trader on the average sweep. <strong className="text-white">Fix</strong>: lock the size table from the cheat sheet. STRONG 1R, MODERATE 0.5-0.7R, WEAK skip or 0.25R reference. The Command Center shows the quality; the operator sizes accordingly. No exceptions.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &mdash; MISSING THE FVG BONUS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A HOT + FVG &#9733; verdict prints. The trader takes the trade at standard 1R. <strong className="text-white">The apex setup is rare; not sizing up on it leaves the engine&apos;s most reliable signal at the same return as the average</strong>. Edge that does not get sized appropriately is edge that does not get realized. <strong className="text-white">Fix</strong>: when you see the gold star anywhere &mdash; tooltip, cascade row, signal context tag &mdash; size at 1.5-2R baseline. The star earned its position; the operator&apos;s job is to honor the position with size.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &mdash; FIGHTING WITH-TREND SHAKEOUTS AS REVERSALS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader sees a buy sweep in a strong uptrend and reads it as a &ldquo;reversal&rdquo; setup, expecting the trend to flip. <strong className="text-white">With-trend sweeps are continuation plays, not reversal plays</strong> &mdash; the standard plan targets the next FVG midpoint, not the prior trend extreme. Reading the trend wrong inflates target expectations and degrades win rate. <strong className="text-white">Fix</strong>: read the Ribbon row before the Sweep row. With-trend = continuation play, tight targets. Counter-trend = reversal candidate, wider targets. Trend before pattern, always.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &mdash; TREATING COOLING AS COLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">A sweep cascade reads COOLING &mdash; WATCH and the trader writes the level off entirely as if it read COLD. <strong className="text-white">COOLING means the immediate edge has degraded, not that the level is dead</strong> &mdash; price often retests swept levels at bars 5-10 and produces clean re-trigger signals. <strong className="text-white">Fix</strong>: when the cascade reads COOLING, keep the level on the watch list. If price retests it cleanly with a fresh signal-engine fire, take the entry. If price drifts away without retest, then COLD becomes the read. COOLING is &ldquo;watch&rdquo;; COLD is &ldquo;ignore&rdquo;. The verdicts are not synonymous.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === GAME UI — 5-round scenario challenge === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Sweep Operator Challenge</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Live Scenarios &mdash; Pick The Right Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real CIPHER situations. Each scenario gives you a Command Center read or a market condition; you pick what an Operator does next. <strong className="text-white">No partial credit, no points</strong> &mdash; the goal is calibrating your gut instinct to the engine&apos;s reading framework. Pick honestly. Read every explanation. By the end you should be able to glance at any sweep cascade verdict and know without thinking what the playbook says.</p>

          <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-semibold text-amber-400/80 mb-2">PROGRESS</p>
            <div className="flex gap-2 flex-wrap">
              {gameRounds.map((r, i) => {
                const sel = gameSelections[i];
                const correct = r.options.find((o) => o.id === sel)?.correct;
                const dotColor =
                  sel === null
                    ? 'bg-white/10'
                    : correct
                    ? 'bg-teal-400'
                    : 'bg-red-400';
                return (
                  <div key={r.id} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                    <button
                      type="button"
                      onClick={() => setGameRound(i)}
                      className={`text-xs font-mono px-2 py-1 rounded ${i === gameRound ? 'bg-amber-400/15 text-amber-300' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      R{i + 1}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {gameRounds[gameRound] && (
            <div className="p-5 rounded-2xl glass-card mb-6">
              <p className="text-xs font-semibold text-amber-400/70 mb-2">ROUND {gameRound + 1} OF {gameRounds.length}</p>
              <p className="text-sm text-amber-300/90 font-mono mb-4 leading-relaxed">{gameRounds[gameRound].scenario}</p>
              <p className="text-base text-white font-semibold mb-5 leading-relaxed">{gameRounds[gameRound].prompt}</p>

              <div className="space-y-3">
                {gameRounds[gameRound].options.map((opt) => {
                  const selected = gameSelections[gameRound] === opt.id;
                  const revealed = gameSelections[gameRound] !== null;
                  const isCorrect = opt.correct;
                  let optClass = 'border-white/10 hover:border-white/20 bg-white/5';
                  if (revealed && selected && isCorrect) optClass = 'border-teal-400/55 bg-teal-500/10';
                  else if (revealed && selected && !isCorrect) optClass = 'border-red-400/55 bg-red-500/10';
                  else if (revealed && !selected && isCorrect) optClass = 'border-teal-400/30 bg-teal-500/5';
                  else if (revealed && !selected) optClass = 'border-white/5 bg-white/[0.02] opacity-60';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={revealed}
                      onClick={() => {
                        const next = [...gameSelections];
                        next[gameRound] = opt.id;
                        setGameSelections(next);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${optClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-bold mt-0.5 ${revealed && isCorrect ? 'text-teal-300' : revealed && selected ? 'text-red-300' : 'text-amber-400/70'}`}>{opt.id.toUpperCase()}.</span>
                        <span className="text-sm text-gray-200 leading-relaxed flex-1">{opt.text}</span>
                      </div>
                      {revealed && selected && (
                        <p className={`text-xs leading-relaxed mt-3 pt-3 border-t border-white/10 ${isCorrect ? 'text-teal-200/85' : 'text-red-200/85'}`}>
                          <span className="font-bold">{isCorrect ? '\u2713 CORRECT \u2014 ' : '\u2717 INCORRECT \u2014 '}</span>
                          {opt.explain}
                        </p>
                      )}
                      {revealed && !selected && isCorrect && (
                        <p className="text-xs text-teal-200/65 leading-relaxed mt-3 pt-3 border-t border-white/10">
                          <span className="font-bold">{'\u2713 CORRECT ANSWER \u2014 '}</span>
                          {opt.explain}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setGameRound(Math.max(0, gameRound - 1))}
                  disabled={gameRound === 0}
                  className="text-sm font-semibold text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={() => setGameRound(Math.min(gameRounds.length - 1, gameRound + 1))}
                  disabled={gameRound === gameRounds.length - 1}
                  className="text-sm font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; HOW TO USE THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you missed a round, re-read the corresponding lesson section. Round 1 maps to the operator instruction line covered in S06. Round 2 maps to the failure playbook in S08 + S12. Round 3 maps to the cascade priority in S09. Round 4 maps to the apex sizing in S11 + the cheat sheet in S15. Round 5 maps to the news edge case in S14. <strong className="text-white">Calibration first; the quiz comes next</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === QUIZ UI — 8 multiple choice with submit gate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-4">Eight Questions &mdash; Pass At 66% To Earn The Cert</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Eight short-form questions covering geometry, the strength factors, FVG confluence, failure detection, the cascade, the trade plan, and trend context. <strong className="text-white">66% pass threshold (6 of 8 correct)</strong>. Pick all eight, then submit. You&apos;ll see your score, per-question feedback, and &mdash; if you pass &mdash; your Sweep Operator certificate appears at the bottom of the page.</p>

          <div className="space-y-5">
            {quizQuestions.map((q, qi) => {
              const ans = quizAnswers[qi];
              const correct = q.options.find((o) => o.correct)?.id;
              const isCorrect = ans === correct;
              const showFeedback = quizSubmitted && ans !== null;

              return (
                <div key={q.id} className={`p-5 rounded-2xl glass-card ${quizSubmitted ? (isCorrect ? 'border-teal-400/30' : 'border-red-400/30') : ''}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-xs font-bold text-amber-400/70 mt-1">Q{qi + 1}.</span>
                    <p className="text-sm text-white font-semibold leading-relaxed flex-1">{q.question}</p>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = ans === opt.id;
                      const isThisCorrect = opt.correct;
                      let optClass = 'border-white/10 hover:border-white/20 bg-white/[0.02]';
                      if (selected && !quizSubmitted) optClass = 'border-amber-400/40 bg-amber-500/5';
                      if (showFeedback && selected && isThisCorrect) optClass = 'border-teal-400/55 bg-teal-500/10';
                      else if (showFeedback && selected && !isThisCorrect) optClass = 'border-red-400/55 bg-red-500/10';
                      else if (showFeedback && !selected && isThisCorrect) optClass = 'border-teal-400/25 bg-teal-500/5';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => {
                            if (quizSubmitted) return;
                            const next = [...quizAnswers];
                            next[qi] = opt.id;
                            setQuizAnswers(next);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${optClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold mt-0.5 ${showFeedback && isThisCorrect ? 'text-teal-300' : showFeedback && selected ? 'text-red-300' : selected ? 'text-amber-300' : 'text-gray-500'}`}>{opt.id.toUpperCase()}.</span>
                            <span className="text-sm text-gray-200 leading-relaxed flex-1">{opt.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showFeedback && (
                    <p className={`text-xs leading-relaxed mt-4 pt-4 border-t border-white/5 ${isCorrect ? 'text-teal-200/80' : 'text-red-200/80'}`}>
                      <span className="font-bold">{isCorrect ? '\u2713 CORRECT \u2014 ' : '\u2717 INCORRECT \u2014 '}</span>
                      {q.explain}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setQuizSubmitted(true)}
                disabled={quizAnswers.some((a) => a === null)}
                className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-400 to-accent-400 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Submit Quiz &rarr;
              </button>
            </div>
          )}

          {quizSubmitted && (
            <div className={`mt-8 p-6 rounded-2xl ${quizPassed ? 'bg-teal-500/10 border border-teal-400/30' : 'bg-red-500/10 border border-red-400/30'}`}>
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400/70 mb-2">RESULT</p>
              <p className="text-3xl font-extrabold mb-2">{quizScore} / {quizQuestions.length} <span className="text-lg font-mono text-gray-400">({quizPercent}%)</span></p>
              {quizPassed ? (
                <p className="text-sm text-teal-200 leading-relaxed">Pass. Your Sweep Operator certificate is being prepared below. The 66% threshold is calibrated so passing means you can reliably read the engine&apos;s output during live trading without second-guessing the cascade.</p>
              ) : (
                <p className="text-sm text-red-200 leading-relaxed">Below the 66% threshold. Re-read the sections corresponding to the questions you missed and try the quiz again &mdash; specifically the cheat sheet (S15) which collapses every actionable rule into a single reference card.</p>
              )}
              {!quizPassed && (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers(new Array(quizQuestions.length).fill(null));
                  }}
                  className="mt-4 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  &larr; Reset and try again
                </button>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* === CERTIFICATE — Sweep Operator === */}
      {certRevealed && (
        <section className="max-w-2xl mx-auto px-5 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
            <h2 className="text-2xl font-extrabold mb-4">Your Sweep Operator Certificate</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Earned by demonstrating proficiency on the eight-question knowledge check. Your certificate ID below is generated uniquely for this session and ties this completion to your Operator profile across the ATLAS Academy. <strong className="text-white">You can now reliably read every CIPHER sweep verdict in real time</strong> &mdash; geometry, strength factors, confluence, failure mechanics, cascade priority, trade plans, and edge cases.</p>

            <div className="relative p-8 rounded-3xl overflow-hidden border border-amber-400/35 bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.04] to-orange-500/[0.06]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,179,0,0.10), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,140,0,0.06), transparent 50%)' }} />

              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
                </div>

                <p className="text-center text-xs font-bold tracking-[0.3em] uppercase text-amber-400/70 mb-2">ATLAS Academy &middot; Cipher Pro</p>
                <h3 className="text-center text-3xl font-black mb-3 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent">Sweep Operator</h3>
                <p className="text-center text-xs tracking-widest uppercase text-amber-400/55 mb-6">Level 11 &middot; Lesson 19</p>

                <div className="border-t border-amber-400/15 pt-5 mb-5">
                  <p className="text-center text-sm text-gray-300 leading-relaxed mb-3">This certificate confirms its holder has demonstrated proficiency in the CIPHER liquidity-sweep engine &mdash; the geometry, the strength scoring, FVG confluence, failure mechanics, the 6-verdict cascade, the signal context priority, and the standard reversal &amp; continuation playbooks.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Certificate ID</p>
                    <p className="text-gray-200 font-mono break-all">{certId}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Score</p>
                    <p className="text-gray-200 font-mono">{quizScore} / {quizQuestions.length} ({quizPercent}%)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Awarded</p>
                    <p className="text-gray-200 font-mono">{new Date().toISOString().slice(0, 10)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-amber-400/65 font-mono uppercase tracking-wider mb-1">Issued by</p>
                    <p className="text-gray-200 font-mono">Interakktive Ltd</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <p className="text-xs text-amber-400/50 font-mono uppercase tracking-[0.25em]">The Trap Is The Setup</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">You&apos;ve earned the badge by demonstrating you can read the engine. <strong className="text-white">The next phase is paper trading the Sweep dimension on a live demo</strong> &mdash; OANDA MT5 or any chart with CIPHER applied. Track 30 sweep entries with the standard playbook, log each cascade verdict at entry, and review your win rate against the 70% baseline. The cert says you can read; the demo says you can execute. Both matter.</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* === FOOTER — next lesson + back to academy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="border-t border-white/10 pt-8">
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Next In Level 11</p>
            <h2 className="text-2xl font-extrabold mb-4">L11.20 &mdash; Coming Soon</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Lesson 11.19 &mdash; Cipher Sweeps is complete. The next lesson in the Level 11 Gold Rewrite continues the journey through CIPHER&apos;s signal architecture. <strong className="text-white">Your progress is automatically saved to your Operator profile</strong>; the next time you log in, the Academy index will show this lesson as completed and unlock the next one when it ships.</p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/academy"
                className="flex-1 px-5 py-3 rounded-xl text-center font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                &larr; Back to Academy
              </Link>
              <Link
                href="/academy/level/11"
                className="flex-1 px-5 py-3 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-amber-400 to-accent-400 text-black hover:opacity-90 transition-opacity"
              >
                Level 11 Index &rarr;
              </Link>
            </div>

            <p className="text-xs text-gray-600 text-center mt-8 font-mono">
              ATLAS Academy &middot; CIPHER PRO &middot; Level 11 &middot; Lesson 19 &middot; Cipher Sweeps
            </p>
            <p className="text-xs text-gray-600 text-center mt-1 font-mono">
              {scrollY > 0 ? `Scroll: ${scrollY}px` : 'Top of lesson'} &middot; The Trap Is The Setup
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
