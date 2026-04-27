// app/academy/lesson/cipher-px-pipeline/page.tsx
// ATLAS Academy — Lesson 11.11: PX Filter Pipeline [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Four Gates — Why Some Pulse Flips Become PX Signals
// Covers: body filter, pre-cross distance, chop suppression, failed-flip exception
//         + asset/TF routing tables + plain-English logic walkthrough
//         + PX in Command Center + Strong vs Standard + 3 playbooks + diagnostic
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based PX Pipeline challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: gate diagnosis, asset/TF routing literacy, failed-flip
//         override recognition, playbook selection, conviction overlay
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      'You are watching XAUUSD 15m. The Pulse line just flipped from RESISTANCE to SUPPORT — clearly visible on chart. You wait for a Long PX label to appear. Nothing fires. Looking back, you notice the bar before the flip was sitting almost exactly on the Pulse line; price had been hugging it for 8 bars before finally ticking through.',
    prompt: 'Which gate rejected this flip?',
    options: [
      {
        id: 'a',
        text: 'Gate 1 (Body) — the flip bar was probably a wick.',
        correct: false,
        explain:
          'Possible but not the strongest read here. The scenario explicitly says price was hugging Pulse for 8 bars before ticking through — that is the textbook creep-through pattern. Gate 1 rejects wick closes; Gate 2 rejects creep-throughs. Read the scenario again: "had been hugging it for 8 bars" is Gate 2 evidence.',
      },
      {
        id: 'b',
        text: 'Gate 2 (Pre-Cross Distance) — pre_cross_dist was below threshold.',
        correct: true,
        explain:
          'Correct. The scenario describes a creep-through perfectly: price wandering within tiny distance of Pulse for many bars, then finally ticking through. The bar BEFORE the flip had pre_cross_dist near zero — well below the 0.03 ATR forex/commodity threshold for 15m. Gate 2 rejected. The fix is not your indicator setting — it is recognising that creep-through flips are exactly what Gate 2 exists to filter, and they would have lost money if traded.',
      },
      {
        id: 'c',
        text: 'Gate 3 (Chop) — there must have been a recent opposite PX.',
        correct: false,
        explain:
          'The scenario gives no indication of a recent opposite PX. Gate 3 only triggers when the OPPOSITE-direction PX has fired within the flip_window (1-3 bars on forex/commodity). There is no setup for that here. The detail you are meant to lock onto is "hugging Pulse for 8 bars" — that is Gate 2 territory.',
      },
      {
        id: 'd',
        text: 'No gate rejected — the indicator is buggy.',
        correct: false,
        explain:
          'CIPHER is doing exactly what it is designed to do. Creep-through flips have negative expected value historically, which is precisely why Gate 2 exists. Calling the indicator buggy here is mistake number one from section fifteen — calling rejected flips "missed signals" instead of reading the rejection reason.',
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      'You switch from XAUUSD 1H to AAPL 1H. Same indicator, same default settings. After watching for an hour you notice PX signals are firing roughly half as often on AAPL as they did on XAUUSD. You feel like CIPHER is broken on stocks.',
    prompt: 'What is happening?',
    options: [
      {
        id: 'a',
        text: 'CIPHER has a bug on stocks. Lower i_pulse_factor to compensate.',
        correct: false,
        explain:
          'No bug, and that fix would make things worse. Lowering i_pulse_factor tightens Pulse, producing more flips with smaller bodies and tighter pre-cross distances. More flips would now fail Gate 1 and Gate 2. Pipeline rejection rate would go UP, not down. This is mistake 4 from section fifteen.',
      },
      {
        id: 'b',
        text: 'Stocks have a more aggressive pipeline by design — body 0.05, distance 0.05-0.15. PX signals are correctly less frequent.',
        correct: true,
        explain:
          'Correct. The asset routing matrix from section seven shows stocks with the most-restrictive thresholds across all four gates. Body filter is 0.05 ATR (vs forex 0.02). Distance filter is 0.05-0.15 ATR (vs forex 0-0.03). Suppression window is 2-5 bars (vs forex 1-3). Stocks have earnings, gaps, and single-issue noise that demand this filtering. PX frequency on stocks SHOULD be lower than on forex of the same TF — that is the pipeline doing its job.',
      },
      {
        id: 'c',
        text: 'AAPL is in a low-volatility regime. Wait for volatility to return.',
        correct: false,
        explain:
          'Volatility could be a factor, but the scenario describes a structural difference — switching assets at the same TF. The asset routing layer is the primary explanation. Even in normal AAPL volatility, you should expect roughly half the PX signal rate of forex of equivalent TF, simply because the pipeline gates are wider for stocks.',
      },
      {
        id: 'd',
        text: 'Lower the timeframe to 5m to get more signals.',
        correct: false,
        explain:
          'That works for raw frequency but for the wrong reason. Lower TF on stocks still uses the wide stock-asset thresholds — and now you would be on a TF with even more single-issue noise. Better to accept that stocks signals fire less often by design. If you want higher frequency, trade an asset class designed for it (forex, indices) at appropriate TFs.',
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      'A Pulse SHORT flip fires on EURUSD 5m. It gets immediately rejected — no PX label appears. Three bars later, Pulse flips back BULL — and this time a Long PX label fires with a "FAILED-FLIP" tag in the Last Signal row.',
    prompt: 'How should you treat this Long PX signal compared to a normal CONTINUATION-tag PX?',
    options: [
      {
        id: 'a',
        text: 'Treat it as weaker — Gate 4 had to bypass other gates for it to fire.',
        correct: false,
        explain:
          'Common misread, and it is mistake 5 from section fifteen. Failed-flip PX is NOT weaker — Gate 4 exempts Gates 2 and 3 because the failed-flip pattern itself IS the signal CIPHER wants to catch. The body filter (Gate 1) was still required to pass. The pattern catches V-bottoms and W-bottoms, which are some of the highest-edge reversal patterns in price action.',
      },
      {
        id: 'b',
        text: 'Treat it as STRONGER — failed-flip recoveries catch fresh exhausted opposite-side traders, often with bigger runs than continuation patterns.',
        correct: true,
        explain:
          'Correct, and this is the Playbook 3 (Failed-Flip V-Bottom) setup. The pattern means: bears just committed (the failed bear flip), then bulls overpowered them within 8 bars (the recovery flip). Bears are now trapped and likely to reverse, fueling the long. Targets are typically 2.5-3R because V-bottoms run further than continuation patterns. Stop goes below the V apex (the failed-flip swing low). This is a deliberately-included high-edge pattern, not an exception to be cautious about.',
      },
      {
        id: 'c',
        text: 'Treat it the same as any other Long PX — pipeline qualified is pipeline qualified.',
        correct: false,
        explain:
          'Pipeline qualification is the same, but the playbook is different. Treating a failed-flip PX with the same stop and target rules as a CONTINUATION PX would put your stop in the wrong place (continuation logic stops below Pulse; failed-flip logic stops below the V apex). Read the context tag and choose the playbook before sizing.',
      },
      {
        id: 'd',
        text: 'Skip it — Gate 4 overrides are unreliable.',
        correct: false,
        explain:
          'Skipping a high-edge setup because you misread it as marginal is exactly the failure pattern Gate 4 was added to combat. CIPHER built Gate 4 specifically to ENSURE these signals fire. Skipping them defeats the design. The override is reliable; the discipline is to recognise the FAILED-FLIP tag and use Playbook 3.',
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      'Two PX signals fire on different XAUUSD 1H charts at the same time. Setup A: Long PX with the STRONG tag, fired during ESTABLISHED Pulse, HTF bias bullish, all 4 conviction factors lit. Setup B: Long PX, no STRONG tag, fired in YOUNG Pulse, HTF bias bullish, only 1 conviction factor lit (Ribbon Stack).',
    prompt: 'How should you size and treat these two trades differently?',
    options: [
      {
        id: 'a',
        text: 'Treat them identically — both are PX signals from the same instrument and direction.',
        correct: false,
        explain:
          'They are both pipeline-qualified, yes — but the conviction overlay tells you their relative strength. Setup A has 4/4 conviction. Setup B has 1/4. The pipeline qualified both, but the strength overlay is showing you very different setups. Treating them identically ignores the additional information CIPHER is publishing.',
      },
      {
        id: 'b',
        text: 'Setup A gets full size (Strong + ESTABLISHED + 4/4 conviction). Setup B gets reduced size or stays a watcher (Standard, only 1/4 conviction, YOUNG Pulse).',
        correct: true,
        explain:
          'Correct. Setup A is a textbook Playbook 1 (Trend Continuation) with maximum confluence — Strong tag, established trend, full conviction stack. Full 1R sizing or slightly higher is justified. Setup B is also Playbook 1 but with weakest possible conviction — only Ribbon Stack lit, the trend is still YOUNG. Reduced sizing (0.5R or watcher) is the disciplined call. Both are tradeable, but they are not equivalent risk decisions.',
      },
      {
        id: 'c',
        text: 'Setup B gets full size — YOUNG Pulse means earlier entry, better R:R.',
        correct: false,
        explain:
          'Earlier entry sounds appealing but the conviction overlay is publishing weakness — only 1/4 factors lit. ADX is below 20 (no real trend strength), volume is below average (no participation), momentum is below midline (health is weak). The trend-continuation thesis is barely supported. YOUNG Pulse + 1/4 conviction is statistically the riskiest combination for Playbook 1. Reduced sizing or skipping is correct.',
      },
      {
        id: 'd',
        text: 'Setup A is overextended (all 4 factors might mean exhaustion). Take Setup B.',
        correct: false,
        explain:
          'A subtle trap. While extreme readings can sometimes mark exhaustion, the 4-factor conviction overlay is specifically designed to flag the most-tradeable PX signals, not to flag exhaustion. Strong PX in established trends has historically been one of the highest-edge setups in CIPHER. Setup A is not overextended — it is the playbook setup at maximum quality.',
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      'You are running CIPHER on BTC 5m with the Sniper preset. Pulse flips happen but you have not seen a single PX label all morning. You check your settings: i_pulse_factor is at default 1.5, the Signal Engine is set to "Visuals + Signals", Direction filter is "Both", and Strong Only is OFF.',
    prompt: 'What is most likely suppressing your PX signals?',
    options: [
      {
        id: 'a',
        text: 'Lower i_pulse_factor to 1.0 — Pulse is too far out.',
        correct: false,
        explain:
          'That is mistake 4. Tightening Pulse produces more flips, more of which fail Gates 1 and 2. Pipeline rejection rate goes UP. Also, you would be tightening Pulse on top of the Sniper preset multiplier (1.30) which already widened Pulse significantly. The math compounds badly.',
      },
      {
        id: 'b',
        text: 'The Sniper preset uses min_conviction = 3 internally. Even with Strong Only OFF, the preset is filtering Standard PX. Switch to a different preset.',
        correct: true,
        explain:
          'Correct, and this is rejection pattern 6 from section fourteen. Some presets internally apply a higher conviction threshold even when "Strong Only" toggle reads OFF. Sniper preset is one of them — it is designed to fire only the highest-conviction setups. Standard PX signals get suppressed at the strength overlay regardless of your toggle. The fix is to switch to Trend Trader or Reversal preset if you want to see Standard PX signals.',
      },
      {
        id: 'c',
        text: 'BTC 5m has too much chop — the asset/TF routing blocks all signals.',
        correct: false,
        explain:
          'Crypto 5m has wider gates (0.08 ATR distance, 4-bar suppression) but those reduce frequency, not eliminate it entirely. "Not a single PX all morning" suggests something stronger than asset/TF filtering. Look at the preset.',
      },
      {
        id: 'd',
        text: 'Strong Only is somehow stuck ON. Toggle it off and back on.',
        correct: false,
        explain:
          'Strong Only is reported OFF in the scenario. The behaviour you are seeing matches Strong Only being effectively ON, but the actual cause is the preset internally applying min_conviction = 3. Sniper does this by design. The toggle and the preset can produce similar effects through different paths.',
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 mechanics + diagnostic checks
// String-id answers + question-level explanations
// 66% pass threshold (6 of 8 correct)
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How many gates must a Pulse flip pass to fire as a PX signal (under normal, non-failed-flip conditions)?',
    options: [
      { id: 'a', text: 'One — only the body filter.', correct: false },
      { id: 'b', text: 'Two — body and distance.', correct: false },
      { id: 'c', text: 'Three — body, distance, and chop suppression.', correct: true },
      { id: 'd', text: 'Four — including Gate 4.', correct: false },
    ],
    explain:
      'Gates 1, 2, and 3 are mandatory under normal conditions. Gate 4 is an OVERRIDE path that bypasses Gates 2 and 3 for failed-flip recoveries — it is not an additional gate to pass, it is an exception that lets specific patterns through. Under non-failed-flip conditions, three gates rule the pipeline.',
  },
  {
    id: 'q2',
    question: 'A flip bar on AAPL Daily has a body of 0.04 ATR. Does it pass Gate 1?',
    options: [
      { id: 'a', text: 'Yes — 0.04 is above the 0.02 threshold.', correct: false },
      { id: 'b', text: 'Yes — 0.04 is above the 0.03 threshold.', correct: false },
      { id: 'c', text: 'No — Stocks need body greater than 0.05 ATR.', correct: true },
      { id: 'd', text: 'It depends on the timeframe.', correct: false },
    ],
    explain:
      'Stocks have the widest body filter at 0.05 ATR, applied uniformly across timeframes. A 0.04 ATR body fails Gate 1 on any stock chart. This is why PX signals fire less frequently on stocks than on forex of the same TF — the body filter is more demanding. The 0.02 threshold is forex/commodity; 0.03 is crypto/index.',
  },
  {
    id: 'q3',
    question: 'On forex 1H, Gate 2 (pre-cross distance) requires what minimum threshold?',
    options: [
      { id: 'a', text: '0 ATR — distance filter is off at 1H', correct: false },
      { id: 'b', text: '0.02 ATR', correct: true },
      { id: 'c', text: '0.05 ATR', correct: false },
      { id: 'd', text: '0.03 ATR', correct: false },
    ],
    explain:
      'Forex 1H sits in the mid-TF band of the routing matrix at 0.02 ATR. Higher TFs (Daily/4H) are at 0 (no distance filter). Lower TFs (5m/15m) are at 0.03 ATR. Sub-5m drops back to 0. The 0.02 threshold at 1H/30m demands meaningful distance before the flip without being so restrictive it blocks legitimate intraday reversals.',
  },
  {
    id: 'q4',
    question: 'Index CFDs have what value for Gate 2 (pre-cross distance) across all timeframes?',
    options: [
      { id: 'a', text: '0.02 ATR uniform', correct: false },
      { id: 'b', text: '0 — distance filter disabled across all TFs', correct: true },
      { id: 'c', text: '0.03 to 0.08 ATR scaling by TF', correct: false },
      { id: 'd', text: 'Same as forex', correct: false },
    ],
    explain:
      'Indices are the special case. The Pulse asset multiplier (0.95 from Lesson 10) already tightens Pulse for indices, so the Pulse width itself does the distance filtering. Adding Gate 2 on top would block legitimate index breakouts from consolidation. Gate 2 is uniformly disabled (0) across all TFs for indices — Gates 1 and 3 carry all the filtering load.',
  },
  {
    id: 'q5',
    question: 'A bull PX fires on bar 100. On bar 105, Pulse flips back bear. Which clause of the px_short expression decides whether bar 105 fires as a SHORT PX?',
    options: [
      { id: 'a', text: 'pulse_flip_bear AND body greater than min_body — that is enough.', correct: false },
      { id: 'b', text: 'short_after_recent_long is true (5b less than flip_window), so the AND clause requires failed_flip_short to override.', correct: true },
      { id: 'c', text: 'Gate 1 alone — chop suppression does not apply within 8 bars.', correct: false },
      { id: 'd', text: 'The 8-bar lookback for failed-flip is the only check.', correct: false },
    ],
    explain:
      'On forex 5m, flip_window is 3 bars; on most TFs it is 1-3. Either way, 5 bars is within the relevant window for many configurations and definitely within the 8-bar failed-flip lookback. So short_after_recent_long is true, which means clause 4 (NOT short_after_recent_long OR failed_flip_short) requires the override path. The signal fires only if failed_flip_short is true — meaning this recent bear flip qualifies as a recovery from the bull failure. Otherwise, Gate 3 suppresses.',
  },
  {
    id: 'q6',
    question: 'Which gate does the failed-flip override NOT bypass?',
    options: [
      { id: 'a', text: 'Gate 1 (Body filter)', correct: true },
      { id: 'b', text: 'Gate 2 (Pre-cross distance)', correct: false },
      { id: 'c', text: 'Gate 3 (Chop suppression)', correct: false },
      { id: 'd', text: 'It bypasses all three.', correct: false },
    ],
    explain:
      'Gate 4 is structured as an OR-clause inside Gates 2 and 3 only — failed_flip_long appears in clauses 3 and 4 of the px_long expression. Gate 1 (body filter) sits in its own AND-clause with no override path. If the recovery flip is on a wick, body is below threshold, Gate 1 rejects regardless of failed-flip context. The pattern would not fire as PX.',
  },
  {
    id: 'q7',
    question: 'You see a PX signal on chart with the "+" suffix (Long+). What does this tell you definitively?',
    options: [
      { id: 'a', text: 'The signal passed all 4 gates including Gate 4.', correct: false },
      { id: 'b', text: 'The signal passed pipeline qualification AND scored 3+/4 on the conviction overlay.', correct: true },
      { id: 'c', text: 'The signal is from the Sniper preset.', correct: false },
      { id: 'd', text: 'The signal was a failed-flip recovery.', correct: false },
    ],
    explain:
      'The "+" suffix marks Strong, which is a 2-layer condition: (1) the signal must have passed pipeline qualification (Gates 1, 2, 3, with optional Gate 4 override), AND (2) it must have scored 3 or 4 on the conviction overlay (Ribbon Stack, ADX>20, Volume>1×, Momentum>50%). Standard PX is pipeline-qualified but conviction-below-3. The "+" alone tells you both conditions were met — it does not tell you which preset was active or whether Gate 4 was involved.',
  },
  {
    id: 'q8',
    question: 'A Pulse flip happens on chart but no PX label fires. You check the bar: clean body, meaningful pre-cross distance, no recent opposite PX. The Last Signal row shows a Long PX from 4 bars ago. What is the most likely reason?',
    options: [
      { id: 'a', text: 'Gate 1 still rejected — appearance can be deceiving.', correct: false },
      { id: 'b', text: 'A same-direction PX is still considered active within the 8-bar window. The new flip is not refiring as a new signal.', correct: true },
      { id: 'c', text: 'CIPHER is broken.', correct: false },
      { id: 'd', text: 'The Strong Only filter is on.', correct: false },
    ],
    explain:
      'This is rejection pattern 4 from section fourteen — the subtle one. Even with all gates clearing, if the SAME-direction PX fired within roughly 8 bars and the system is tracking it as still-active, a new flip in that same direction will not refire as a new signal label. The Last Signal row showing a Long PX from 4 bars ago is the diagnostic clue. The active signal is still being honoured. This is not a bug; it is CIPHER not double-printing the same directional event.',
  },
];

// ============================================================
// ANIMSCENE — shared canvas wrapper (gold-standard pattern)
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
// CONFETTI — for certificate reveal (gold-standard)
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
// ANIMATION 1 — FourGatesAnim (S01 Groundbreaking Concept)
// The Four Gates pipeline visualisation
//
// 6-flip cycle, ~3s per flip = 18s total. Each flip is a colored token
// that enters from the left, travels through 4 gates, and either passes
// (emerges as PX signal on the right) or fails (drops out at the gate
// that rejected it with a rejection reason shown).
// ============================================================
function FourGatesAnim() {
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
    ctx.fillText('THE FOUR GATES — PX FILTER PIPELINE', w / 2, 22);

    // 6 flip examples, 3s each = 18s loop
    type Flip = {
      dir: 'bull' | 'bear';
      passGate1: boolean;
      passGate2: boolean;
      passGate3: boolean;
      isFailedFlip: boolean;
      label: string;
      rejectAt: number; // 0 = passes all, 1-4 = which gate rejected
    };
    const flips: Flip[] = [
      { dir: 'bull', passGate1: true, passGate2: true, passGate3: true, isFailedFlip: false, label: 'CLEAN BULL FLIP', rejectAt: 0 },
      { dir: 'bear', passGate1: false, passGate2: true, passGate3: true, isFailedFlip: false, label: 'TINY BODY (wick close)', rejectAt: 1 },
      { dir: 'bull', passGate1: true, passGate2: false, passGate3: true, isFailedFlip: false, label: 'CREEP-THROUGH', rejectAt: 2 },
      { dir: 'bear', passGate1: true, passGate2: true, passGate3: false, isFailedFlip: false, label: 'OPPOSITE PX 2b AGO', rejectAt: 3 },
      { dir: 'bull', passGate1: true, passGate2: false, passGate3: false, isFailedFlip: true, label: 'FAILED-FLIP V-BOTTOM', rejectAt: 0 },
      { dir: 'bear', passGate1: true, passGate2: true, passGate3: true, isFailedFlip: false, label: 'CLEAN BEAR FLIP', rejectAt: 0 },
    ];
    const cycleT = t % (flips.length * 3);
    const flipIdx = Math.floor(cycleT / 3);
    const flipT = (cycleT % 3) / 3; // 0..1 within the flip
    const flip = flips[flipIdx];

    // Layout
    const padX = 24;
    const trackY = h * 0.55;
    const trackStartX = padX + 60;
    const trackEndX = w - padX - 60;
    const trackW = trackEndX - trackStartX;

    // 4 gate positions evenly spaced along track
    const gateXs = [
      trackStartX + trackW * 0.18,
      trackStartX + trackW * 0.40,
      trackStartX + trackW * 0.62,
      trackStartX + trackW * 0.84,
    ];
    const gateLabels = ['GATE 1', 'GATE 2', 'GATE 3', 'GATE 4'];
    const gateNames = ['BODY', 'DISTANCE', 'CHOP', 'FAILED-FLIP'];

    // Determine the token's progression along the track
    // 0 = at start, 1 = at end (only for passing tokens)
    // For failed: progresses to the failing gate, then drops
    const pipelinePass = flip.rejectAt === 0;
    let tokenProgress: number;
    let tokenDropping = false;
    let tokenDroppedY = 0;

    if (pipelinePass) {
      tokenProgress = Math.min(1, flipT * 1.15);
    } else {
      // Travel to the rejecting gate, then fall
      const rejectGateIdx = flip.rejectAt - 1;
      const stopT = (gateXs[rejectGateIdx] - trackStartX) / trackW;
      const arrivalT = 0.55; // % through cycle when token reaches the gate
      if (flipT < arrivalT) {
        tokenProgress = (flipT / arrivalT) * stopT;
      } else {
        tokenProgress = stopT;
        tokenDropping = true;
        const dropT = Math.min(1, (flipT - arrivalT) / 0.4);
        tokenDroppedY = dropT * 50;
      }
    }

    // Track baseline (gradient line)
    const trackGrad = ctx.createLinearGradient(trackStartX, 0, trackEndX, 0);
    trackGrad.addColorStop(0, FAINT);
    trackGrad.addColorStop(0.5, FAINT);
    trackGrad.addColorStop(1, FAINT);
    ctx.strokeStyle = trackGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trackStartX, trackY);
    ctx.lineTo(trackEndX, trackY);
    ctx.stroke();

    // Entry label (left of track)
    ctx.fillStyle = DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('PULSE FLIP', trackStartX - 8, trackY - 4);
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText(flip.dir === 'bull' ? '(bull-flip)' : '(bear-flip)', trackStartX - 8, trackY + 8);

    // Exit label (right of track)
    if (pipelinePass && tokenProgress > 0.85) {
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PX SIGNAL', trackEndX + 8, trackY - 4);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(flip.dir === 'bull' ? '▲ LONG' : '▼ SHORT', trackEndX + 8, trackY + 8);
    } else {
      ctx.fillStyle = FAINT;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PX SIGNAL', trackEndX + 8, trackY - 4);
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('— — —', trackEndX + 8, trackY + 8);
    }

    // Draw 4 gates
    gateXs.forEach((gx, i) => {
      const gateNum = i + 1;
      const passingThis = (() => {
        if (gateNum === 1) return flip.passGate1;
        if (gateNum === 2) return flip.passGate2 || flip.isFailedFlip; // Gate 4 exempts Gate 2
        if (gateNum === 3) return flip.passGate3 || flip.isFailedFlip; // Gate 4 exempts Gate 3
        if (gateNum === 4) return flip.isFailedFlip; // Gate 4 only "active" for failed flips
        return false;
      })();
      const isRejecting = flip.rejectAt === gateNum;
      const tokenPastThisGate = tokenProgress > (gx - trackStartX) / trackW;
      const tokenAtThisGate = !tokenPastThisGate &&
        Math.abs(trackStartX + tokenProgress * trackW - gx) < 22;

      // Gate state colour
      let gateColor: string;
      let labelColor: string;
      if (tokenPastThisGate && passingThis) { gateColor = TEAL; labelColor = TEAL; }
      else if (isRejecting && tokenDropping) { gateColor = RED; labelColor = RED; }
      else if (gateNum === 4 && flip.isFailedFlip && tokenPastThisGate) { gateColor = AMBER; labelColor = AMBER; }
      else { gateColor = FAINT; labelColor = DIM; }

      // Gate post (vertical bar)
      const postH = 38;
      ctx.strokeStyle = gateColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gx, trackY - postH / 2);
      ctx.lineTo(gx, trackY + postH / 2);
      ctx.stroke();

      // Glow when active
      if (tokenAtThisGate || (tokenPastThisGate && (passingThis || isRejecting))) {
        ctx.fillStyle = `${gateColor}33`;
        ctx.beginPath();
        ctx.arc(gx, trackY, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gate label (above)
      ctx.fillStyle = labelColor;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gateLabels[i], gx, trackY - postH / 2 - 14);
      ctx.font = '7px Inter, sans-serif';
      ctx.fillStyle = DIM;
      ctx.fillText(gateNames[i], gx, trackY - postH / 2 - 4);

      // Pass / fail tick when token has passed
      if (tokenPastThisGate) {
        ctx.fillStyle = passingThis ? TEAL : RED;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(passingThis ? '✓' : '✗', gx, trackY + postH / 2 + 14);
      } else if (gateNum === 4 && flip.isFailedFlip && tokenAtThisGate) {
        ctx.fillStyle = AMBER;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('OVERRIDE', gx, trackY + postH / 2 + 14);
      }
    });

    // Draw token (the moving Pulse-flip indicator)
    const tokenX = trackStartX + tokenProgress * trackW;
    const tokenY = trackY + tokenDroppedY;
    const tokenColor = flip.dir === 'bull' ? TEAL : MAGENTA;
    // Glow
    ctx.fillStyle = `${tokenColor}66`;
    ctx.beginPath();
    ctx.arc(tokenX, tokenY, 10, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = tokenColor;
    ctx.beginPath();
    ctx.arc(tokenX, tokenY, 6, 0, Math.PI * 2);
    ctx.fill();
    // Direction arrow inside token
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(flip.dir === 'bull' ? '▲' : '▼', tokenX, tokenY + 3);

    // Failed-flip badge (S04 hint) — when token traverses, show OVERRIDE on gates 2/3
    if (flip.isFailedFlip && tokenProgress > 0.3) {
      ctx.fillStyle = `${AMBER}22`;
      ctx.strokeStyle = `${AMBER}88`;
      ctx.lineWidth = 1;
      const bX = w / 2 - 100;
      const bY = trackY - 80;
      const bW = 200;
      const bH = 22;
      const bR = 4;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FAILED-FLIP — gates 2 & 3 bypassed', w / 2, trackY - 65);
    }

    // Bottom: current scenario label
    ctx.fillStyle = pipelinePass ? TEAL : RED;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SCENARIO ${flipIdx + 1} OF ${flips.length}: ${flip.label}`, w / 2, h - 32);

    // Bottom: outcome
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    let outcomeText: string;
    if (pipelinePass) {
      outcomeText = flip.isFailedFlip
        ? 'PASSES via Gate 4 override → PX signal fires'
        : 'PASSES all 4 gates → PX signal fires';
    } else {
      outcomeText = `REJECTED at Gate ${flip.rejectAt} (${gateNames[flip.rejectAt - 1]}) → no signal`;
    }
    ctx.fillText(outcomeText, w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — FlipToPXAnim (S02)
// From Flip to PX — The Bridge
//
// Two stacked panels.
// TOP: a Pulse line on a chart, showing 5 flips happen.
// BOTTOM: a timeline marker showing only 2 of those flips became PX signals.
// Reveals: Pulse flips happen often. PX is the rare subset that survives.
// ============================================================
function FlipToPXAnim() {
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
    ctx.fillText('FROM FLIP TO PX  ·  THE BRIDGE', w / 2, 22);

    // Two stacked panels
    const padX = 24;
    const topPanelTop = 38;
    const topPanelH = h * 0.42;
    const botPanelTop = topPanelTop + topPanelH + 16;
    const botPanelH = h - botPanelTop - 28;

    // ── TOP PANEL: chart with 5 flips ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padX, topPanelTop, w - padX * 2, topPanelH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, topPanelTop, w - padX * 2, topPanelH);

    // Top panel label
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER PULSE  ·  5 flips on this chart segment', padX + 8, topPanelTop + 14);

    // Generate price + ratcheted Pulse with 5 flips
    const N = 90;
    const prices: number[] = [];
    const flipPattern = [10, 25, 38, 55, 75]; // bar indices where flips happen
    for (let i = 0; i < N; i++) {
      // Trend up overall, with reversals at flip points
      let dir = 1;
      for (let f = 0; f < flipPattern.length; f++) {
        if (i >= flipPattern[f]) dir = (f % 2 === 0) ? -1 : 1;
      }
      const drift = i * 0.1 * dir;
      const wave = Math.sin(i * 0.4) * 3;
      prices.push(50 + drift + wave + (i > 30 ? 5 : 0) + (i > 50 ? -3 : 0));
    }
    const flow: number[] = [];
    for (let i = 0; i < N; i++) {
      const f = i === 0 ? prices[0] : flow[i - 1] + (prices[i] - flow[i - 1]) * 0.18;
      flow.push(f);
    }
    const atrDist = 4;
    const ratchet: number[] = [];
    const dirHist: number[] = [];
    let dir = 1;
    let line = flow[0] - atrDist;
    for (let i = 0; i < N; i++) {
      const support = flow[i] - atrDist;
      const resistance = flow[i] + atrDist;
      if (dir === 1) {
        line = Math.max(line, support);
        if (prices[i] < line) { dir = -1; line = resistance; }
      } else {
        line = Math.min(line, resistance);
        if (prices[i] > line) { dir = 1; line = support; }
      }
      ratchet.push(line);
      dirHist.push(dir);
    }

    // Reveal animation — left to right
    const cycleT = (t % 10) / 10;
    const reveal = Math.floor(cycleT * N);

    const minP = Math.min(...prices, ...ratchet) - 3;
    const maxP = Math.max(...prices, ...ratchet) + 3;
    const topChart = topPanelTop + 22;
    const topChartBot = topPanelTop + topPanelH - 8;
    const topChartH = topChartBot - topChart;
    const yScale = (p: number) => topChartBot - ((p - minP) / (maxP - minP)) * topChartH;
    const xScale = (i: number) => padX + 8 + (i / (N - 1)) * (w - padX * 2 - 16);

    // Price (faint)
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = 0; i <= reveal; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse (color by direction)
    ctx.lineWidth = 2;
    for (let i = 1; i <= reveal; i++) {
      ctx.strokeStyle = dirHist[i] === 1 ? TEAL : MAGENTA;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(ratchet[i - 1]));
      ctx.lineTo(xScale(i), yScale(ratchet[i]));
      ctx.stroke();
    }

    // Mark all 5 flip events with vertical dashed lines + small dot at top
    flipPattern.forEach((b) => {
      if (b > reveal) return;
      const fx = xScale(b);
      ctx.strokeStyle = `${AMBER}77`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(fx, topChart);
      ctx.lineTo(fx, topChartBot);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.arc(fx, topChart - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── BOTTOM PANEL: timeline of flips → PX signals ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padX, botPanelTop, w - padX * 2, botPanelH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, botPanelTop, w - padX * 2, botPanelH);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AFTER PIPELINE  ·  only 2 became PX signals', padX + 8, botPanelTop + 14);

    // Show each flip as a card; passes light up, fails dim
    // Pre-decided: flips 1, 4 pass. flips 2, 3, 5 are filtered.
    const flipResults = [true, false, false, true, false];
    const flipLabels = ['CLEAN BULL', 'small body', 'creep-through', 'V-bottom failed-flip', 'opposite recent'];
    const cardW = (w - padX * 2 - 32 - 4 * 6) / 5;
    const cardH = botPanelH - 30;
    const cardY = botPanelTop + 24;
    flipPattern.forEach((b, i) => {
      if (b > reveal) return;
      const cx = padX + 16 + i * (cardW + 6);
      const passes = flipResults[i];
      const cardColor = passes ? TEAL : MAGENTA;
      const bgAlpha = passes ? '22' : '11';
      ctx.fillStyle = cardColor + bgAlpha;
      ctx.strokeStyle = cardColor + (passes ? '88' : '44');
      ctx.lineWidth = passes ? 1.5 : 1;
      const cR = 4;
      ctx.beginPath();
      ctx.moveTo(cx + cR, cardY);
      ctx.lineTo(cx + cardW - cR, cardY);
      ctx.quadraticCurveTo(cx + cardW, cardY, cx + cardW, cardY + cR);
      ctx.lineTo(cx + cardW, cardY + cardH - cR);
      ctx.quadraticCurveTo(cx + cardW, cardY + cardH, cx + cardW - cR, cardY + cardH);
      ctx.lineTo(cx + cR, cardY + cardH);
      ctx.quadraticCurveTo(cx, cardY + cardH, cx, cardY + cardH - cR);
      ctx.lineTo(cx, cardY + cR);
      ctx.quadraticCurveTo(cx, cardY, cx + cR, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Card content
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(passes ? '✓' : '✗', cx + cardW / 2, cardY + 18);
      ctx.fillStyle = passes ? WHITE : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(`FLIP ${i + 1}`, cx + cardW / 2, cardY + 32);
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(flipLabels[i], cx + cardW / 2, cardY + 44);
      ctx.fillStyle = passes ? TEAL : DIM;
      ctx.font = passes ? 'bold 9px Inter, sans-serif' : '8px Inter, sans-serif';
      ctx.fillText(passes ? 'PX' : 'rejected', cx + cardW / 2, cardY + 60);
    });

    // Bottom takeaway
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('5 Pulse flips. 2 PX signals. The pipeline is doing its job.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — BodyFilterAnim (S03 Gate 1)
// The Body Filter — body > min_body
//
// Show 4 candles in a row. Each is a "Pulse flip bar" with different body
// sizes. Below each, show body / ATR ratio + min_body threshold for the
// active asset class. Pass/fail badge per candle.
// Cycle through asset classes (forex, crypto, index, stock) every 3.5s
// to show the threshold change.
// ============================================================
function BodyFilterAnim() {
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
    ctx.fillText('GATE 1  ·  BODY FILTER  ·  body > min_body', w / 2, 22);

    // Asset cycle — 3.5s per asset
    const assets = [
      { name: 'FOREX / COMMODITY', threshold: 0.02, note: 'Tight ranges. Even small bodies are real closes.' },
      { name: 'CRYPTO / INDEX', threshold: 0.03, note: 'Wider ranges. Need slightly bigger bodies for conviction.' },
      { name: 'STOCKS', threshold: 0.05, note: 'Earnings gaps + single-issue noise. Need real-body conviction.' },
    ];
    const cycleT = t % (assets.length * 3.5);
    const assetIdx = Math.floor(cycleT / 3.5);
    const asset = assets[assetIdx];

    // Active asset banner
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = w / 2 - 130;
      const bY = 36;
      const bW = 260;
      const bH = 26;
      const bR = 5;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${asset.name}  ·  min_body = ${asset.threshold.toFixed(2)} × ATR`, w / 2, 53);

    // 4 candles with different body sizes
    // Body sizes are fractions of ATR
    const candles = [
      { body: 0.01, label: 'TINY', isWick: true },
      { body: 0.025, label: 'SMALL' },
      { body: 0.04, label: 'MEDIUM' },
      { body: 0.08, label: 'LARGE' },
    ];

    const candlesY = 80;
    const candlesH = h - candlesY - 50;
    const candleW = 50;
    const candleSpacing = (w - 60 - candles.length * candleW) / (candles.length - 1);
    const candleStartX = 30;

    candles.forEach((c, i) => {
      const cx = candleStartX + i * (candleW + candleSpacing) + candleW / 2;
      const passes = c.body > asset.threshold;

      // Candle range (full)
      const fullRangeH = candlesH - 50;
      // Body height as fraction of ATR (visualised — 1 ATR = 80% of fullRangeH)
      const bodyH = c.body * fullRangeH * 8;
      const wickH = (c.isWick ? 0.18 : 0.04) * fullRangeH * 8;

      const bodyTop = candlesY + 40 + (fullRangeH - bodyH) / 2 - wickH / 2;
      const bodyBot = bodyTop + bodyH;
      const wickTop = bodyTop - wickH;
      const wickBot = bodyBot + (c.isWick ? wickH * 2 : wickH * 0.5);

      // Wick line
      ctx.strokeStyle = passes ? TEAL : DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, wickTop);
      ctx.lineTo(cx, wickBot);
      ctx.stroke();

      // Body rectangle
      ctx.fillStyle = passes ? TEAL : MAGENTA + '88';
      ctx.fillRect(cx - candleW / 2 + 4, bodyTop, candleW - 8, bodyH);
      ctx.strokeStyle = passes ? TEAL : MAGENTA;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - candleW / 2 + 4, bodyTop, candleW - 8, bodyH);

      // Threshold line (where min_body sits)
      const threshFromCenter = asset.threshold * fullRangeH * 8 / 2;
      const thresholdY1 = candlesY + 40 + fullRangeH / 2 - threshFromCenter;
      const thresholdY2 = candlesY + 40 + fullRangeH / 2 + threshFromCenter;
      ctx.strokeStyle = `${AMBER}88`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - candleW / 2 - 4, thresholdY1);
      ctx.lineTo(cx + candleW / 2 + 4, thresholdY1);
      ctx.moveTo(cx - candleW / 2 - 4, thresholdY2);
      ctx.lineTo(cx + candleW / 2 + 4, thresholdY2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Body label below candle
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, cx, candlesY + candlesH - 20);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`body = ${c.body.toFixed(3)} ATR`, cx, candlesY + candlesH - 8);

      // Pass/fail above candle
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(passes ? '✓' : '✗', cx, candlesY + 28);
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(passes ? 'PASS' : 'REJECT', cx, candlesY + 18);
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(asset.note, w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — PreCrossDistanceAnim (S04 Gate 2)
// Pre-Cross Distance — pre_cross_dist > min_dist
//
// Animation shows a flip on the chart, then highlights the previous bar's
// distance from the Pulse line BEFORE the flip. Compares two scenarios:
//   A) Price was creeping along Pulse for 5 bars → pre_cross_dist tiny → REJECT
//   B) Price was meaningfully away from Pulse before flipping through → PASS
// ============================================================
function PreCrossDistanceAnim() {
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
    ctx.fillText('GATE 2  ·  PRE-CROSS DISTANCE  ·  pre_cross_dist > min_dist', w / 2, 22);

    // 2 panels side by side: REJECT scenario (creep) and PASS scenario (clean)
    const padX = 14;
    const gap = 16;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelTop = 40;
    const panelH = h - panelTop - 30;

    // Cycle: 0-5s show building up the chart; 5-10s show the verdict
    const cycleT = (t % 10) / 10;
    const reveal = cycleT;

    const drawScenario = (panelX: number, isClean: boolean) => {
      // Panel background
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(panelX, panelTop, panelW, panelH);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelTop, panelW, panelH);

      // Header
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isClean ? 'CLEAN FLIP' : 'CREEP-THROUGH', panelX + panelW / 2, panelTop + 16);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(isClean ? 'pre_cross_dist large  ·  PASS Gate 2' : 'pre_cross_dist tiny  ·  REJECT Gate 2', panelX + panelW / 2, panelTop + 28);

      // Synthetic chart inside panel
      const chX = panelX + 12;
      const chTop = panelTop + 40;
      const chBot = panelTop + panelH - 22;
      const chW = panelW - 24;
      const chH = chBot - chTop;

      // 30 bars
      const N = 30;
      const flipBar = 22; // bar where flip happens
      const xS = (i: number) => chX + (i / (N - 1)) * chW;
      // Vertical scale 0..1 for synthetic prices
      const yS = (v: number) => chBot - v * chH;

      // Pulse line — flat-ish, ratcheted
      // For both scenarios, Pulse sits around 0.55 (with slight variation)
      const pulseLine: number[] = [];
      for (let i = 0; i < N; i++) {
        pulseLine.push(0.55 + Math.sin(i * 0.2) * 0.02);
      }

      // Price path differs between scenarios
      const prices: number[] = [];
      for (let i = 0; i < N; i++) {
        let p: number;
        if (isClean) {
          // Price stays clearly above Pulse (around 0.72), then drops through fast at flipBar
          if (i < flipBar - 1) p = 0.72 + Math.sin(i * 0.5) * 0.025;
          else if (i === flipBar - 1) p = 0.62; // last bar before flip — still above Pulse
          else if (i === flipBar) p = 0.42; // flip bar — closes below Pulse with big body
          else p = 0.40 - (i - flipBar) * 0.005;
        } else {
          // Price creeps along Pulse (0.56-0.58) for many bars, then ticks below
          if (i < flipBar - 1) p = 0.575 + Math.sin(i * 0.8) * 0.012;
          else if (i === flipBar - 1) p = 0.555; // RIGHT on Pulse
          else if (i === flipBar) p = 0.535; // small drop through
          else p = 0.530 - (i - flipBar) * 0.001;
        }
        prices.push(p);
      }

      // Reveal bars
      const showLen = Math.max(1, Math.floor(reveal * N));

      // Pulse line
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < showLen && i <= flipBar; i++) {
        if (i === 0) ctx.moveTo(xS(i), yS(pulseLine[i])); else ctx.lineTo(xS(i), yS(pulseLine[i]));
      }
      ctx.stroke();
      // After flip, Pulse becomes resistance (magenta)
      if (showLen > flipBar) {
        ctx.strokeStyle = MAGENTA;
        ctx.beginPath();
        for (let i = flipBar; i < showLen; i++) {
          if (i === flipBar) ctx.moveTo(xS(i), yS(pulseLine[i])); else ctx.lineTo(xS(i), yS(pulseLine[i]));
        }
        ctx.stroke();
      }

      // Price line
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < showLen; i++) {
        if (i === 0) ctx.moveTo(xS(i), yS(prices[i])); else ctx.lineTo(xS(i), yS(prices[i]));
      }
      ctx.stroke();

      // Highlight the pre-flip distance (bar [flipBar - 1])
      if (showLen >= flipBar) {
        const x1 = xS(flipBar - 1);
        const yPrice = yS(prices[flipBar - 1]);
        const yPulse = yS(pulseLine[flipBar - 1]);
        // Draw the gap as a vertical bracket
        ctx.strokeStyle = isClean ? TEAL : MAGENTA;
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x1, yPrice);
        ctx.lineTo(x1, yPulse);
        ctx.stroke();
        ctx.setLineDash([]);
        // Distance label
        ctx.fillStyle = isClean ? TEAL : MAGENTA;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left';
        const distText = isClean ? '0.07 ATR' : '0.005 ATR';
        ctx.fillText(distText, x1 + 4, (yPrice + yPulse) / 2);
      }

      // Flip event marker
      if (showLen > flipBar) {
        const fx = xS(flipBar);
        ctx.strokeStyle = `${AMBER}88`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(fx, chTop);
        ctx.lineTo(fx, chBot);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Verdict pill at bottom of panel
      if (showLen >= N - 1) {
        const verdictColor = isClean ? TEAL : MAGENTA;
        const verdictText = isClean ? '✓ PASS' : '✗ REJECT';
        ctx.fillStyle = `${verdictColor}22`;
        ctx.strokeStyle = verdictColor;
        ctx.lineWidth = 1;
        const vX = panelX + panelW / 2 - 36;
        const vY = panelTop + panelH - 18;
        const vW = 72;
        const vH = 16;
        const vR = 3;
        ctx.beginPath();
        ctx.moveTo(vX + vR, vY);
        ctx.lineTo(vX + vW - vR, vY);
        ctx.quadraticCurveTo(vX + vW, vY, vX + vW, vY + vR);
        ctx.lineTo(vX + vW, vY + vH - vR);
        ctx.quadraticCurveTo(vX + vW, vY + vH, vX + vW - vR, vY + vH);
        ctx.lineTo(vX + vR, vY + vH);
        ctx.quadraticCurveTo(vX, vY + vH, vX, vY + vH - vR);
        ctx.lineTo(vX, vY + vR);
        ctx.quadraticCurveTo(vX, vY, vX + vR, vY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = verdictColor;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(verdictText, vX + vW / 2, vY + 11);
      }
    };

    drawScenario(padX, false); // Left = creep-through (REJECT)
    drawScenario(padX + panelW + gap, true); // Right = clean flip (PASS)

    // Bottom takeaway
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A flip from a price already on the Pulse line is NOT a real signal. A flip from real distance IS.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — ChopSuppressionAnim (S05 Gate 3)
// Chop Suppression — flip_window
//
// Show a 60-bar timeline with multiple PX events. After each PX, a
// shaded "suppression window" extends to the right showing the
// flip_window bars during which opposite-direction PX is blocked.
// Demonstrate: in chop, attempted opposite PX inside the window gets
// suppressed (shown as faded/rejected token).
// ============================================================
function ChopSuppressionAnim() {
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
    ctx.fillText('GATE 3  ·  CHOP SUPPRESSION  ·  flip_window', w / 2, 22);

    // Cycle: scrub a "current bar" pointer through 60 bars over 12 seconds
    const N = 60;
    const cycleT = (t % 12) / 12;
    const curBar = Math.floor(cycleT * N);

    // Pre-defined sequence of PX events (some pass, some get suppressed)
    type Event = { bar: number; dir: 'long' | 'short'; suppressed: boolean; reason?: string };
    const events: Event[] = [
      { bar: 6, dir: 'long', suppressed: false },
      { bar: 11, dir: 'short', suppressed: true, reason: 'long fired 5b ago' },
      { bar: 14, dir: 'short', suppressed: true, reason: 'long fired 8b ago' },
      { bar: 22, dir: 'short', suppressed: false },
      { bar: 28, dir: 'long', suppressed: true, reason: 'short fired 6b ago' },
      { bar: 38, dir: 'long', suppressed: false },
      { bar: 50, dir: 'short', suppressed: false },
    ];
    const flipWindow = 10; // For visualization (flip_window value being demonstrated)

    // Layout
    const padX = 24;
    const tlY = h * 0.5;
    const tlX1 = padX;
    const tlX2 = w - padX;
    const tlW = tlX2 - tlX1;
    const xS = (b: number) => tlX1 + (b / (N - 1)) * tlW;

    // Timeline track
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tlX1, tlY);
    ctx.lineTo(tlX2, tlY);
    ctx.stroke();

    // Bar tick marks every 10 bars
    for (let i = 0; i <= N; i += 10) {
      const x = xS(i);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, tlY - 3);
      ctx.lineTo(x, tlY + 3);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}b`, x, tlY + 14);
    }

    // Track which non-suppressed PX events have fired (for current-bar logic)
    let lastLongBar = -100;
    let lastShortBar = -100;

    // Draw events up to curBar
    events.forEach((e) => {
      if (e.bar > curBar) return;

      const ex = xS(e.bar);
      const dirColor = e.dir === 'long' ? TEAL : MAGENTA;

      // Draw suppression window for non-suppressed events
      if (!e.suppressed) {
        // Shaded band extending forward `flipWindow` bars
        const winEnd = Math.min(N - 1, e.bar + flipWindow);
        const x1 = ex;
        const x2 = xS(winEnd);
        ctx.fillStyle = `${dirColor}11`;
        ctx.fillRect(x1, tlY - 30, x2 - x1, 60);
        // Border
        ctx.strokeStyle = `${dirColor}33`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x2, tlY - 30);
        ctx.lineTo(x2, tlY + 30);
        ctx.stroke();
        ctx.setLineDash([]);
        // Update last fired
        if (e.dir === 'long') lastLongBar = e.bar;
        else lastShortBar = e.bar;
      }

      // Event marker
      const markerY = e.dir === 'long' ? tlY - 14 : tlY + 14;
      const arrow = e.dir === 'long' ? '▲' : '▼';
      ctx.fillStyle = e.suppressed ? `${dirColor}55` : dirColor;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(arrow, ex, markerY);

      // Status label
      ctx.fillStyle = e.suppressed ? `${MAGENTA}cc` : `${TEAL}cc`;
      ctx.font = 'bold 7px Inter, sans-serif';
      const statusY = e.dir === 'long' ? markerY - 14 : markerY + 14;
      ctx.fillText(e.suppressed ? '✗ SUPPRESS' : '✓ PX', ex, statusY);

      // Strike-through line for suppressed events
      if (e.suppressed) {
        ctx.strokeStyle = MAGENTA;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex - 6, markerY - 4);
        ctx.lineTo(ex + 6, markerY - 4);
        ctx.stroke();
      }
    });

    // Current bar pointer
    const curX = xS(curBar);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(curX, tlY - 50);
    ctx.lineTo(curX, tlY + 50);
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`bar ${curBar}`, curX, tlY - 56);

    // Status panel at top — what's currently suppressed?
    const longSuppressedFor = lastShortBar > 0 ? Math.max(0, flipWindow - (curBar - lastShortBar)) : 0;
    const shortSuppressedFor = lastLongBar > 0 ? Math.max(0, flipWindow - (curBar - lastLongBar)) : 0;

    ctx.fillStyle = DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`flip_window: ${flipWindow} bars`, padX, 44);

    ctx.textAlign = 'right';
    if (longSuppressedFor > 0) {
      ctx.fillStyle = MAGENTA;
      ctx.fillText(`▲ LONG suppressed for ${longSuppressedFor}b more`, w - padX, 44);
    } else if (shortSuppressedFor > 0) {
      ctx.fillStyle = MAGENTA;
      ctx.fillText(`▼ SHORT suppressed for ${shortSuppressedFor}b more`, w - padX, 44);
    } else {
      ctx.fillStyle = TEAL;
      ctx.fillText('Both directions clear', w - padX, 44);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('After a PX fires, opposite-direction PX is blocked until the flip_window expires.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — FailedFlipAnim (S06 Gate 4)
// The Failed-Flip Exception
//
// Show a V-bottom pattern: bull flip → quickly fails (flips to bear) →
// then flips back to bull within 8 bars. Without the override, this
// second bull flip would be rejected by Gate 3 (recent opposite PX).
// With the override, it fires as PX — the V-bottom signal.
// ============================================================
function FailedFlipAnim() {
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
    ctx.fillText('GATE 4  ·  FAILED-FLIP OVERRIDE  ·  V-bottom catcher', w / 2, 22);

    // Reveal animation — left to right, 10s
    const cycleT = (t % 10) / 10;

    // Synthetic V-bottom price action
    // Bars 0-12: bullish trend (price > Pulse, Pulse is support)
    // Bars 13-16: failed flip — price closes below Pulse, Pulse becomes resistance (bear flip)
    // Bars 17-20: failed-flip recovery — price closes back above Pulse (bull flip again, within 8 bars)
    // Bars 21-30: continued bullish trend
    const N = 32;
    const reveal = Math.floor(cycleT * (N + 4));

    // Synthesize price + flow + ratchet
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let p: number;
      if (i < 12) p = 50 + i * 0.4 + Math.sin(i * 0.4) * 1;
      else if (i === 12) p = 53.5;
      else if (i === 13) p = 50.5; // failed-flip bar 1: closes below Pulse
      else if (i < 17) p = 49 + (i - 13) * 0.3;
      else if (i === 17) p = 51.8; // recovery bar: closes back above Pulse (failed-flip override)
      else p = 51.8 + (i - 17) * 0.5 + Math.sin(i * 0.4) * 1;
      prices.push(p);
    }
    const flow: number[] = [];
    for (let i = 0; i < N; i++) {
      const f = i === 0 ? prices[0] : flow[i - 1] + (prices[i] - flow[i - 1]) * 0.18;
      flow.push(f);
    }
    const atrDist = 2.5;
    const ratchet: number[] = [];
    const dirHist: number[] = [];
    let dir = 1;
    let line = flow[0] - atrDist;
    for (let i = 0; i < N; i++) {
      const support = flow[i] - atrDist;
      const resistance = flow[i] + atrDist;
      if (dir === 1) {
        line = Math.max(line, support);
        if (prices[i] < line) { dir = -1; line = resistance; }
      } else {
        line = Math.min(line, resistance);
        if (prices[i] > line) { dir = 1; line = support; }
      }
      ratchet.push(line);
      dirHist.push(dir);
    }

    // Layout
    const padX = 30;
    const chartTop = 50;
    const chartH = h - chartTop - 80;
    const chartW = w - padX * 2;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padX, chartTop, chartW, chartH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, chartTop, chartW, chartH);

    const minP = Math.min(...prices, ...ratchet) - 2;
    const maxP = Math.max(...prices, ...ratchet) + 2;
    const yScale = (p: number) => chartTop + chartH - ((p - minP) / (maxP - minP)) * chartH;
    const xScale = (i: number) => padX + 10 + (i / (N - 1)) * (chartW - 20);

    const showLen = Math.min(N, Math.max(1, reveal));

    // Price (faint)
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < showLen; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line (color by direction)
    ctx.lineWidth = 2;
    for (let i = 1; i < showLen; i++) {
      ctx.strokeStyle = dirHist[i] === 1 ? TEAL : MAGENTA;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(ratchet[i - 1]));
      ctx.lineTo(xScale(i), yScale(ratchet[i]));
      ctx.stroke();
    }

    // Mark flip events
    const flipEvents = [
      { bar: 13, dir: 'bear', label: 'Failed-flip\n(would-be PX)', isFailedFlip: false, fires: false },
      { bar: 17, dir: 'bull', label: 'Failed-flip\nrecovery', isFailedFlip: true, fires: true },
    ];
    flipEvents.forEach((e) => {
      if (e.bar >= showLen) return;
      const fx = xScale(e.bar);
      // Vertical dashed
      ctx.strokeStyle = e.fires ? `${TEAL}aa` : `${MAGENTA}77`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(fx, chartTop);
      ctx.lineTo(fx, chartTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Marker
      const markerY = chartTop + 16;
      ctx.fillStyle = e.fires ? TEAL : MAGENTA;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.fires ? '▲' : '▼', fx, markerY);

      // Label
      ctx.fillStyle = e.fires ? TEAL : `${DIM}`;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(e.fires ? '✓ PX FIRES' : '(suppressed)', fx, markerY + 12);
    });

    // Override indicator banner — appears after the V-bottom completes
    if (showLen > 17) {
      const bX = w / 2 - 130;
      const bY = chartTop + chartH + 10;
      const bW = 260;
      const bH = 30;
      const bR = 5;
      ctx.fillStyle = `${AMBER}22`;
      ctx.strokeStyle = `${AMBER}88`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GATE 4 OVERRIDE ACTIVE', w / 2, bY + 13);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Bull flip 4b after failed bear flip → Gates 2 & 3 bypassed', w / 2, bY + 24);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Without Gate 4, the recovery flip would be rejected. The V-bottom would be missed.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — AssetRoutingTableAnim (S07)
// The Asset Routing Master Table
//
// Visual matrix: 4 asset classes (rows) × 3 gates (columns).
// Each cell shows the threshold value for that asset/gate combination.
// One row spotlights every 3.5s, with the asset name + summary takeaway.
// ============================================================
function AssetRoutingTableAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASSET ROUTING MATRIX  ·  ALL GATES BY ASSET CLASS', w / 2, 22);

    // Matrix data
    type Row = { asset: string; subtitle: string; gate1: string; gate2: string; gate3: string; takeaway: string };
    const rows: Row[] = [
      {
        asset: 'FOREX / COMMODITY',
        subtitle: 'XAUUSD, EURUSD, USOIL',
        gate1: '0.02 ATR',
        gate2: '0 — 0.03 ATR',
        gate3: '1 — 3 bars',
        takeaway: 'Tightest body filter, low TF distance, short suppression — frequent PX.',
      },
      {
        asset: 'INDEX CFD',
        subtitle: 'NAS100, US30, SPX',
        gate1: '0.03 ATR',
        gate2: '0 ATR (all TFs)',
        gate3: '2 bars (all TFs)',
        takeaway: 'No distance filter (Pulse width does the work). Short suppression.',
      },
      {
        asset: 'CRYPTO',
        subtitle: 'BTC, ETH, SOL',
        gate1: '0.03 ATR',
        gate2: '0 — 0.08 ATR',
        gate3: '2 — 4 bars',
        takeaway: 'Wider distance gate compensates for crypto noise + bigger wicks.',
      },
      {
        asset: 'STOCKS',
        subtitle: 'AAPL, TSLA, NVDA',
        gate1: '0.05 ATR',
        gate2: '0.05 — 0.15 ATR',
        gate3: '2 — 5 bars',
        takeaway: 'Most aggressive filtering. Earnings + single-issue noise demands it.',
      },
    ];

    // Cycle: 3.5s per asset highlight
    const cycleT = t % (rows.length * 3.5);
    const spotIdx = Math.floor(cycleT / 3.5);

    // Layout
    const padX = 20;
    const tableTop = 44;
    const headerH = 24;
    const rowH = (h - tableTop - headerH - 50) / rows.length;

    // Column widths
    const col0W = 145; // Asset name
    const col1W = (w - padX * 2 - col0W) / 3; // 3 gate columns
    const col2W = col1W;
    const col3W = col1W;

    // Header row
    const headers = ['ASSET CLASS', 'GATE 1 · BODY', 'GATE 2 · DISTANCE', 'GATE 3 · CHOP'];
    const widths = [col0W, col1W, col2W, col3W];
    let headerX = padX;
    headers.forEach((h, i) => {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h, headerX + widths[i] / 2, tableTop + 14);
      headerX += widths[i];
    });

    // Header underline
    ctx.strokeStyle = `${AMBER}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, tableTop + headerH);
    ctx.lineTo(w - padX, tableTop + headerH);
    ctx.stroke();

    // Rows
    rows.forEach((r, i) => {
      const ry = tableTop + headerH + i * rowH;
      const isSpot = i === spotIdx;

      // Row highlight background
      if (isSpot) {
        ctx.fillStyle = `${AMBER}11`;
        ctx.fillRect(padX, ry, w - padX * 2, rowH);
      }

      // Row dividers (horizontal)
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, ry + rowH);
      ctx.lineTo(w - padX, ry + rowH);
      ctx.stroke();

      // Cell 0: asset name + subtitle
      let cellX = padX;
      ctx.fillStyle = isSpot ? AMBER : WHITE;
      ctx.font = isSpot ? 'bold 11px Inter, sans-serif' : 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.asset, cellX + 10, ry + rowH / 2 - 2);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(r.subtitle, cellX + 10, ry + rowH / 2 + 12);
      cellX += col0W;

      // Cells 1-3: gate values
      const values = [r.gate1, r.gate2, r.gate3];
      values.forEach((v, vi) => {
        ctx.fillStyle = isSpot ? AMBER : DIM;
        ctx.font = isSpot ? 'bold 12px Inter, sans-serif' : 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v, cellX + widths[vi + 1] / 2, ry + rowH / 2 + 4);
        cellX += widths[vi + 1];
      });
    });

    // Spotlight takeaway at bottom
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = padX;
      const bY = h - 36;
      const bW = w - padX * 2;
      const bH = 28;
      const bR = 5;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rows[spotIdx].asset, w / 2, h - 22);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(rows[spotIdx].takeaway, w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — TFRoutingTableAnim (S08)
// The Timeframe Routing Master Table
//
// 6 columns (timeframes), with rows showing how each gate's threshold
// modifies. Animation cycles through highlighting each TF column.
// Demonstrates the granularity: lower TFs need wider min_dist, higher
// TFs need shorter flip_window.
// ============================================================
function TFRoutingTableAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIMEFRAME ROUTING  ·  HOW TF MODIFIES THE GATES', w / 2, 22);

    // Subtitle: "Forex / Commodity values shown — other assets follow same shape"
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Forex / Commodity CFD values shown — other assets follow the same TF gradient', w / 2, 36);

    // Columns (timeframes) — using forex/commodity routing
    type Col = { tf: string; minDist: string; flipWindow: string; takeaway: string };
    const cols: Col[] = [
      { tf: '1m', minDist: '0', flipWindow: '3 bars', takeaway: 'Scalp — distance filter off, longer suppression' },
      { tf: '5m / 15m', minDist: '0.03 ATR', flipWindow: '2 bars', takeaway: 'Lower intraday — distance filter active' },
      { tf: '30m / 1H', minDist: '0.02 ATR', flipWindow: '2 bars', takeaway: 'Intraday — moderate distance filter' },
      { tf: '4H', minDist: '0.02 ATR', flipWindow: '1 bar', takeaway: 'Mid swing — fastest suppression clear' },
      { tf: 'Daily', minDist: '0', flipWindow: '1 bar', takeaway: 'Daily — distance filter off (HTF flips matter)' },
      { tf: 'Weekly+', minDist: '0', flipWindow: '1 bar', takeaway: 'HTF — every flip matters, minimum filtering' },
    ];

    // Cycle: 2s per TF
    const cycleT = t % (cols.length * 2);
    const spotIdx = Math.floor(cycleT / 2);

    // Layout
    const padX = 18;
    const tableTop = 56;
    const headerH = 24;
    const rowH = 32;
    const totalRows = 2; // GATE 2 + GATE 3
    const colW = (w - padX * 2 - 80) / cols.length;
    const labelColW = 80;

    // Header row — TF labels
    cols.forEach((c, i) => {
      const cx = padX + labelColW + i * colW + colW / 2;
      const isSpot = i === spotIdx;
      ctx.fillStyle = isSpot ? AMBER : DIM;
      ctx.font = isSpot ? 'bold 10px Inter, sans-serif' : 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.tf, cx, tableTop + 14);
      // Underline if spotlighted
      if (isSpot) {
        ctx.fillStyle = AMBER;
        ctx.fillRect(cx - 18, tableTop + 18, 36, 2);
      }
    });

    // Spotlight column background
    if (spotIdx >= 0) {
      const spotX = padX + labelColW + spotIdx * colW;
      ctx.fillStyle = `${AMBER}11`;
      ctx.fillRect(spotX, tableTop + headerH, colW, rowH * totalRows);
    }

    // Row labels (left column) + cell values
    const rowLabels = ['GATE 2 · DIST', 'GATE 3 · CHOP'];
    rowLabels.forEach((label, ri) => {
      const ry = tableTop + headerH + ri * rowH;

      // Row separator
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, ry + rowH);
      ctx.lineTo(w - padX, ry + rowH);
      ctx.stroke();

      // Row label
      ctx.fillStyle = DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, padX + 6, ry + rowH / 2 + 4);

      // Cell values
      cols.forEach((c, i) => {
        const cx = padX + labelColW + i * colW + colW / 2;
        const isSpot = i === spotIdx;
        const value = ri === 0 ? c.minDist : c.flipWindow;
        ctx.fillStyle = isSpot ? AMBER : WHITE;
        ctx.font = isSpot ? 'bold 11px Inter, sans-serif' : 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value, cx, ry + rowH / 2 + 4);
      });
    });

    // Bottom takeaway panel
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = padX;
      const bY = h - 38;
      const bW = w - padX * 2;
      const bH = 30;
      const bR = 5;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${cols[spotIdx].tf}`, w / 2, h - 24);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(cols[spotIdx].takeaway, w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — LogicWalkthroughAnim (S09)
// The Pipeline Logic in Plain English
//
// Display the actual px_long boolean as code, then unpack each clause
// one by one with plain-English glosses. Each clause highlights in
// sequence; below each, the plain-English meaning fades in.
// ============================================================
function LogicWalkthroughAnim() {
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
    ctx.fillText('THE px_long EXPRESSION  ·  CLAUSE BY CLAUSE', w / 2, 22);

    // Code display at top
    const codeY = 50;
    ctx.fillStyle = DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('px_long  =', 30, codeY);

    // 4 clauses with positions
    type Clause = { code: string; gate: string; meaning: string; color: string };
    const clauses: Clause[] = [
      {
        code: 'pulse_flip_bull',
        gate: 'Bridge from L10',
        meaning: 'The Pulse line just changed direction. The structural break event we built on last lesson.',
        color: TEAL,
      },
      {
        code: 'body > min_body',
        gate: 'GATE 1',
        meaning: 'The flip bar\'s body is large enough to be a real close, not a wick rejection.',
        color: AMBER,
      },
      {
        code: '(pre_cross_dist > min_dist OR failed_flip_long)',
        gate: 'GATE 2 + override',
        meaning: 'Price was meaningfully away from Pulse before flipping — OR — this is a failed-flip recovery.',
        color: MAGENTA,
      },
      {
        code: '(NOT long_after_recent_short OR failed_flip_long)',
        gate: 'GATE 3 + override',
        meaning: 'No opposite-direction PX has fired recently — OR — this is a failed-flip recovery.',
        color: '#9C27B0',
      },
    ];

    // Cycle: 3s per clause
    const cycleT = t % (clauses.length * 3);
    const activeIdx = Math.floor(cycleT / 3);
    const fadeT = (cycleT % 3) / 3;

    // Render the full code expression on one row
    let xPos = 80;
    const fullCode = clauses.map(c => c.code);
    const operators = ['  AND  ', '  AND  ', '  AND  ', ''];

    clauses.forEach((c, i) => {
      const isActive = i === activeIdx;
      // Code segment
      ctx.fillStyle = isActive ? c.color : DIM;
      ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
      ctx.textAlign = 'left';
      // Truncate long clauses if needed
      const displayCode = c.code.length > 28 ? c.code.substring(0, 25) + '…' : c.code;
      ctx.fillText(displayCode, xPos, codeY);
      const codeW = ctx.measureText(displayCode).width;
      xPos += codeW;
      // Operator
      if (i < clauses.length - 1) {
        ctx.fillStyle = FAINT;
        ctx.font = '8px monospace';
        ctx.fillText(operators[i], xPos, codeY);
        xPos += ctx.measureText(operators[i]).width;
      }
    });

    // Underline active clause
    if (activeIdx >= 0 && activeIdx < clauses.length) {
      let uX = 80;
      for (let i = 0; i < activeIdx; i++) {
        const segCode = clauses[i].code.length > 28 ? clauses[i].code.substring(0, 25) + '…' : clauses[i].code;
        ctx.font = '9px monospace';
        uX += ctx.measureText(segCode).width;
        ctx.font = '8px monospace';
        if (i < clauses.length - 1) uX += ctx.measureText(operators[i]).width;
      }
      const segCode = clauses[activeIdx].code.length > 28
        ? clauses[activeIdx].code.substring(0, 25) + '…'
        : clauses[activeIdx].code;
      ctx.font = 'bold 9px monospace';
      const uW = ctx.measureText(segCode).width;
      ctx.strokeStyle = clauses[activeIdx].color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(uX, codeY + 4);
      ctx.lineTo(uX + uW, codeY + 4);
      ctx.stroke();
    }

    // Active clause panel below
    const active = clauses[activeIdx];
    const panelY = h * 0.32;
    const panelH = h - panelY - 24;

    // Panel background
    ctx.fillStyle = `${active.color}11`;
    ctx.strokeStyle = `${active.color}66`;
    ctx.lineWidth = 1.5;
    {
      const bX = 30;
      const bY = panelY;
      const bW = w - 60;
      const bH = panelH;
      const bR = 6;
      ctx.beginPath();
      ctx.moveTo(bX + bR, bY);
      ctx.lineTo(bX + bW - bR, bY);
      ctx.quadraticCurveTo(bX + bW, bY, bX + bW, bY + bR);
      ctx.lineTo(bX + bW, bY + bH - bR);
      ctx.quadraticCurveTo(bX + bW, bY + bH, bX + bW - bR, bY + bH);
      ctx.lineTo(bX + bR, bY + bH);
      ctx.quadraticCurveTo(bX, bY + bH, bX, bY + bH - bR);
      ctx.lineTo(bX, bY + bR);
      ctx.quadraticCurveTo(bX, bY, bX + bR, bY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Panel content
    const fadeIn = Math.min(1, fadeT * 4);
    ctx.globalAlpha = fadeIn;

    // Gate label
    ctx.fillStyle = active.color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(active.gate, w / 2, panelY + 26);

    // Code expression (full size, prominent)
    ctx.fillStyle = active.color;
    ctx.font = 'bold 14px monospace';
    const codeText = active.code;
    ctx.fillText(codeText, w / 2, panelY + 56);

    // Plain-English meaning
    ctx.fillStyle = WHITE;
    ctx.font = '11px Inter, sans-serif';
    // Wrap meaning text if too long
    const maxTextW = w - 80;
    const words = active.meaning.split(' ');
    const lines: string[] = [];
    let line = '';
    words.forEach((wd) => {
      const test = line + (line ? ' ' : '') + wd;
      if (ctx.measureText(test).width > maxTextW && line) {
        lines.push(line);
        line = wd;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.forEach((ln, li) => {
      ctx.fillText(ln, w / 2, panelY + 88 + li * 16);
    });

    ctx.globalAlpha = 1;

    // Progress dots at bottom
    const dotsY = h - 12;
    const dotSpacing = 14;
    const dotsW = (clauses.length - 1) * dotSpacing;
    const dotsStartX = w / 2 - dotsW / 2;
    clauses.forEach((c, i) => {
      const dx = dotsStartX + i * dotSpacing;
      ctx.fillStyle = i === activeIdx ? c.color : FAINT;
      ctx.beginPath();
      ctx.arc(dx, dotsY, i === activeIdx ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — CommandCenterPXAnim (S10)
// PX in the Command Center — Last Signal row
//
// Replica of CIPHER's Last Signal row, cycling through different
// PX signal states: Long, Long+, Short, Short+, plus the freshness
// progression (just-fired, 5b, 12b, aged-out).
// ============================================================
function CommandCenterPXAnim() {
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
    ctx.fillText('THE LAST SIGNAL ROW  ·  HOW PX APPEARS', w / 2, 22);

    // 6 states cycling 2.5s each = 15s total
    type State = {
      name: string;
      dir: 'long' | 'short';
      isStrong: boolean;
      bars: string;
      tag: string;
      guidance: string;
      col1Color: string;
      col2Color: string;
    };
    const states: State[] = [
      { name: 'STANDARD LONG · FRESH', dir: 'long', isStrong: false, bars: '0b', tag: 'PX · CONTINUATION', guidance: 'WATCH BUILD', col1Color: TEAL, col2Color: TEAL },
      { name: 'STRONG LONG · FRESH', dir: 'long', isStrong: true, bars: '0b', tag: 'PX · STRONG', guidance: 'TREND IGNITION', col1Color: TEAL, col2Color: TEAL },
      { name: 'LONG · YOUNG', dir: 'long', isStrong: false, bars: '4b', tag: 'PX · CONTINUATION', guidance: 'TREND HOLDING', col1Color: TEAL, col2Color: TEAL },
      { name: 'STANDARD SHORT · FRESH', dir: 'short', isStrong: false, bars: '0b', tag: 'PX · FAILED-FLIP', guidance: 'V-TOP', col1Color: MAGENTA, col2Color: AMBER },
      { name: 'STRONG SHORT · ESTABLISHED', dir: 'short', isStrong: true, bars: '12b', tag: 'PX · STRONG', guidance: 'TREND HOLDING', col1Color: MAGENTA, col2Color: MAGENTA },
      { name: 'LONG · AGED', dir: 'long', isStrong: false, bars: '38b', tag: 'PX · CONTINUATION', guidance: 'AGING', col1Color: TEAL, col2Color: AMBER },
    ];
    const cycleT = t % (states.length * 2.5);
    const stateIdx = Math.floor(cycleT / 2.5);
    const state = states[stateIdx];

    // Layout: replica of Command Center row
    const rowY = h * 0.42;
    const rowH = 32;
    const tableX = 24;
    const tableW = w - tableX * 2;
    const col0W = 92;
    const col1W = tableW * 0.42;
    const col2W = tableW - col0W - col1W;

    // Row background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(tableX, rowY, tableW, rowH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, rowY, tableW, rowH);

    // Vertical separators
    ctx.beginPath();
    ctx.moveTo(tableX + col0W, rowY);
    ctx.lineTo(tableX + col0W, rowY + rowH);
    ctx.moveTo(tableX + col0W + col1W, rowY);
    ctx.lineTo(tableX + col0W + col1W, rowY + rowH);
    ctx.stroke();

    // Column headers above row
    ctx.fillStyle = DIM;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LABEL', tableX + col0W / 2, rowY - 10);
    ctx.fillText('STATE  (col 1)', tableX + col0W + col1W / 2, rowY - 10);
    ctx.fillText('GUIDANCE  (col 2)', tableX + col0W + col1W + col2W / 2, rowY - 10);

    // Col 0: "Last Signal" label
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Last Signal', tableX + 10, rowY + rowH / 2 + 4);

    // Col 1: direction + Strong marker + bars + tag
    const col1X = tableX + col0W + col1W / 2;
    ctx.fillStyle = state.col1Color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    const dirLabel = state.dir === 'long' ? '▲ LONG' : '▼ SHORT';
    const strongMark = state.isStrong ? '+' : '';
    ctx.fillText(`${dirLabel}${strongMark}   ${state.bars}   ${state.tag}`, col1X, rowY + rowH / 2 + 4);

    // Col 2: → guidance
    const col2X = tableX + col0W + col1W + 12;
    ctx.fillStyle = state.col2Color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('→  ' + state.guidance, col2X, rowY + rowH / 2 + 4);

    // State label above
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STATE ${stateIdx + 1} OF ${states.length}  ·  ${state.name}`, w / 2, rowY - 36);

    // Below-row explanation
    let explainText: string;
    if (state.name.includes('STANDARD LONG')) explainText = 'Pipeline qualified, conviction below 3/4. The base PX signal.';
    else if (state.name.includes('STRONG LONG · FRESH')) explainText = 'Pipeline qualified PLUS 3+/4 conviction factors. The "+" suffix marks Strong.';
    else if (state.name.includes('LONG · YOUNG')) explainText = 'A 4-bar-old PX. Trend has confirmed. Bars-since-fire shown explicitly.';
    else if (state.name.includes('STANDARD SHORT · FRESH')) explainText = 'Failed-flip override fired this PX. Tag is FAILED-FLIP, not CONTINUATION.';
    else if (state.name.includes('STRONG SHORT · ESTABLISHED')) explainText = 'A 12-bar-old Strong PX. Conviction stayed strong as trend held.';
    else explainText = 'Aged-out PX. Long enough that the original entry is irrelevant — context only.';

    ctx.fillStyle = state.col2Color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(explainText, w / 2, rowY + rowH + 32);

    // Tag legend at bottom
    const legendY = h - 30;
    const legendItems = [
      { label: 'CONTINUATION', meaning: 'standard PX' },
      { label: 'FAILED-FLIP', meaning: 'V-bottom recovery' },
      { label: 'STRONG', meaning: '3+/4 conviction' },
      { label: '+ suffix', meaning: 'on Long+/Short+' },
    ];
    const legendW = w / 4;
    legendItems.forEach((it, i) => {
      const lx = legendW * i + legendW / 2;
      ctx.fillStyle = DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(it.label, lx, legendY - 4);
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(it.meaning, lx, legendY + 6);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — PXvsTSPreviewAnim (S11)
// PX vs TS — when each fires
//
// Two-panel side-by-side: LEFT shows a Pulse line with a flip + PX label.
// RIGHT shows a tension stretch + snap-back candle + TS label. Same
// underlying instrument, different timing signatures.
// ============================================================
function PXvsTSPreviewAnim() {
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
    ctx.fillText('PX vs TS  ·  TWO PATHWAYS TO A SIGNAL', w / 2, 22);

    // Two panels
    const padX = 14;
    const gap = 16;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelTop = 44;
    const panelH = h - panelTop - 50;

    // Reveal animation — left to right, 8s
    const cycleT = (t % 8) / 8;
    const reveal = cycleT;

    const drawPanel = (panelX: number, isPX: boolean) => {
      // Panel background
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(panelX, panelTop, panelW, panelH);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelTop, panelW, panelH);

      // Header
      ctx.fillStyle = isPX ? TEAL : AMBER;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isPX ? 'PX  ·  PULSE CROSS' : 'TS  ·  TENSION SNAP', panelX + panelW / 2, panelTop + 18);
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(isPX ? 'fires AFTER the move' : 'fires BEFORE the flip', panelX + panelW / 2, panelTop + 32);

      // Chart area
      const chX = panelX + 12;
      const chTop = panelTop + 44;
      const chBot = panelTop + panelH - 20;
      const chH = chBot - chTop;
      const chW = panelW - 24;

      const N = 30;
      const xS = (i: number) => chX + (i / (N - 1)) * chW;

      // Generate price + Pulse for each scenario
      const prices: number[] = [];
      const pulse: number[] = [];
      const dirHist: number[] = [];

      if (isPX) {
        // PX scenario: price moves up, then closes through Pulse → flip + PX fires
        for (let i = 0; i < N; i++) {
          let p: number;
          if (i < 16) p = 0.30 + i * 0.022 + Math.sin(i * 0.5) * 0.015; // climbing
          else if (i === 16) p = 0.55; // last bar before drop
          else if (i === 17) p = 0.40; // flip bar — closes through Pulse
          else p = 0.38 - (i - 17) * 0.008;
          prices.push(p);
        }
        // Pulse: support throughout climb, becomes resistance after flip
        for (let i = 0; i < N; i++) {
          let pl: number;
          if (i < 17) pl = 0.42 + i * 0.005; // ratcheting up as support
          else pl = 0.51 + (i - 17) * 0.003; // resistance after flip
          pulse.push(pl);
          dirHist.push(i < 17 ? 1 : -1);
        }
      } else {
        // TS scenario: price stretches above Pulse, then snaps back without flipping
        for (let i = 0; i < N; i++) {
          let p: number;
          if (i < 14) p = 0.50 + i * 0.022 + Math.sin(i * 0.5) * 0.015; // climbing harder, stretching from Pulse
          else if (i < 18) p = 0.78 + Math.sin(i * 1.5) * 0.02; // stretched far above
          else if (i === 18) p = 0.74; // first weakness
          else if (i === 19) p = 0.62; // snap-back bar (TS fires here)
          else p = 0.60 - (i - 19) * 0.005;
          prices.push(p);
        }
        // Pulse stays as support (no flip — that's the point)
        for (let i = 0; i < N; i++) {
          pulse.push(0.42 + Math.min(i, 19) * 0.004);
          dirHist.push(1);
        }
      }

      // Reveal length
      const showLen = Math.max(1, Math.floor(reveal * N));

      // Price line
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < showLen; i++) {
        const x = xS(i);
        const y = chBot - prices[i] * chH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulse line
      ctx.lineWidth = 2;
      for (let i = 1; i < showLen; i++) {
        ctx.strokeStyle = dirHist[i] === 1 ? TEAL : MAGENTA;
        ctx.beginPath();
        ctx.moveTo(xS(i - 1), chBot - pulse[i - 1] * chH);
        ctx.lineTo(xS(i), chBot - pulse[i] * chH);
        ctx.stroke();
      }

      // Mark the signal event
      const signalBar = isPX ? 17 : 19;
      if (showLen > signalBar) {
        const sx = xS(signalBar);
        // Vertical dashed line
        ctx.strokeStyle = isPX ? `${MAGENTA}aa` : `${AMBER}aa`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, chTop);
        ctx.lineTo(sx, chBot);
        ctx.stroke();
        ctx.setLineDash([]);
        // Signal label
        ctx.fillStyle = isPX ? MAGENTA : AMBER;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isPX ? '▼' : '▼', sx, chTop + 12);
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(isPX ? 'PX SHORT' : 'TS SHORT', sx, chTop + 24);
      }

      // Bottom caption
      ctx.fillStyle = isPX ? TEAL : AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isPX ? 'Trend changed → catch the flip' : 'Stretch reached → catch the snap', panelX + panelW / 2, panelTop + panelH - 6);
    };

    drawPanel(padX, true); // LEFT = PX
    drawPanel(padX + panelW + gap, false); // RIGHT = TS

    // Bottom takeaway
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PX catches the flip. TS catches the snap before the flip. Operators use both.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — StrengthOverlayAnim (S12)
// Strong PX vs Standard PX
//
// Show a Pulse flip producing a PX signal. Below the chart, 4 conviction
// factor bars (Ribbon Stack / ADX / Volume / Momentum) light up
// progressively. As 3+ light up, the signal upgrades from "Long" to
// "Long+" with the gold-colored marker.
// ============================================================
function StrengthOverlayAnim() {
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
    ctx.fillText('STRONG vs STANDARD  ·  THE 4-FACTOR CONVICTION OVERLAY', w / 2, 22);

    // Cycle: 0-3s = Standard PX (only 1 factor lights), 3-7s = Strong PX (3+ factors light)
    const cycleT = t % 8;
    const isStrongPhase = cycleT >= 3.5;
    const phaseT = isStrongPhase ? (cycleT - 3.5) / 4.5 : cycleT / 3.5;

    // Top: chart with PX signal
    const chartTop = 44;
    const chartH = h * 0.42;
    const chartX = 30;
    const chartW = w - 60;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(chartX, chartTop, chartW, chartH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartTop, chartW, chartH);

    // Synthetic chart with PX flip
    const N = 40;
    const flipBar = 25;
    const xS = (i: number) => chartX + 10 + (i / (N - 1)) * (chartW - 20);
    const yS = (v: number) => chartTop + chartH - v * (chartH - 16) - 8;

    // Price walk
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let p: number;
      if (i < flipBar) p = 0.45 - i * 0.012 + Math.sin(i * 0.4) * 0.02;
      else if (i === flipBar) p = 0.42; // flip bar — closes above Pulse, BIG body
      else p = 0.50 + (i - flipBar) * 0.015 + Math.sin(i * 0.4) * 0.015;
      prices.push(p);
    }
    // Pulse: resistance until flip, then support
    const pulse: number[] = [];
    for (let i = 0; i < N; i++) {
      pulse.push(i < flipBar ? 0.40 - i * 0.005 : 0.36 + (i - flipBar) * 0.008);
    }

    // Price
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xS(i);
      const y = yS(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse
    ctx.lineWidth = 2;
    for (let i = 1; i < N; i++) {
      ctx.strokeStyle = i < flipBar ? MAGENTA : TEAL;
      ctx.beginPath();
      ctx.moveTo(xS(i - 1), yS(pulse[i - 1]));
      ctx.lineTo(xS(i), yS(pulse[i]));
      ctx.stroke();
    }

    // Signal label at flip bar
    const sx = xS(flipBar);
    ctx.strokeStyle = `${TEAL}88`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(sx, chartTop + 4);
    ctx.lineTo(sx, chartTop + chartH - 4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Standard vs Strong label
    const labelX = sx;
    const labelY = chartTop + 14;
    if (isStrongPhase) {
      // Long+ (Strong) — gold gradient feel
      ctx.fillStyle = `${AMBER}33`;
      ctx.beginPath();
      ctx.arc(labelX, labelY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲', labelX, labelY + 1);
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('LONG+', labelX, labelY + 28);
    } else {
      // Long (Standard) — teal
      ctx.fillStyle = `${TEAL}33`;
      ctx.beginPath();
      ctx.arc(labelX, labelY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲', labelX, labelY + 1);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('LONG', labelX, labelY + 28);
    }

    // Bottom: 4 conviction factor bars
    const factorsTop = chartTop + chartH + 36;
    const factorsH = h - factorsTop - 36;

    type Factor = { name: string; ribbon: boolean; adx: boolean; volume: boolean; momentum: boolean };
    // Standard phase: only 1 factor active
    // Strong phase: progressive 1→4 then back
    const factors = ['RIBBON STACK', 'ADX > 20', 'VOLUME > 1×', 'MOMENTUM > 50%'];
    const factorSubs = ['Trend layers stacked', 'Trend strength threshold', 'Above-avg participation', 'Health-line strength'];

    // Determine which factors are active
    let activeCount: number;
    if (isStrongPhase) {
      // Build up from 0 to 4 over the phase
      activeCount = Math.min(4, Math.floor(phaseT * 5));
    } else {
      activeCount = Math.min(1, Math.floor(phaseT * 2));
    }

    const factorColW = (w - 60 - 3 * 8) / 4;
    factors.forEach((f, i) => {
      const fx = 30 + i * (factorColW + 8);
      const fy = factorsTop;
      const isActive = i < activeCount;
      const factorColor = isActive ? (isStrongPhase ? AMBER : TEAL) : DIM;
      const cardBg = isActive ? `${factorColor}1f` : 'rgba(255,255,255,0.02)';
      const cardBorder = isActive ? `${factorColor}88` : FAINT;

      // Card
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = isActive ? 1.5 : 1;
      const cR = 5;
      ctx.beginPath();
      ctx.moveTo(fx + cR, fy);
      ctx.lineTo(fx + factorColW - cR, fy);
      ctx.quadraticCurveTo(fx + factorColW, fy, fx + factorColW, fy + cR);
      ctx.lineTo(fx + factorColW, fy + factorsH - cR);
      ctx.quadraticCurveTo(fx + factorColW, fy + factorsH, fx + factorColW - cR, fy + factorsH);
      ctx.lineTo(fx + cR, fy + factorsH);
      ctx.quadraticCurveTo(fx, fy + factorsH, fx, fy + factorsH - cR);
      ctx.lineTo(fx, fy + cR);
      ctx.quadraticCurveTo(fx, fy, fx + cR, fy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tick / dot indicator
      ctx.fillStyle = factorColor;
      ctx.beginPath();
      ctx.arc(fx + factorColW / 2, fy + 14, isActive ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', fx + factorColW / 2, fy + 17);
      }

      // Factor name
      ctx.fillStyle = isActive ? factorColor : DIM;
      ctx.font = isActive ? 'bold 9px Inter, sans-serif' : 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f, fx + factorColW / 2, fy + 32);
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(factorSubs[i], fx + factorColW / 2, fy + 44);
    });

    // Counter / verdict
    ctx.fillStyle = isStrongPhase && activeCount >= 3 ? AMBER : DIM;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${activeCount} OF 4 FACTORS  ·  ${activeCount >= 3 ? 'STRONG' : 'STANDARD'}`, w / 2, h - 16);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — PXPlaybooksAnim (S13)
// Three PX Playbooks
//
// 3 cards stacked or in a row showing:
//   1. TREND CONTINUATION — entry / stop / target
//   2. REVERSAL FROM EXTREME — entry / stop / target
//   3. FAILED-FLIP V-BOTTOM — entry / stop / target
// One card spotlights every 4s.
// ============================================================
function PXPlaybooksAnim() {
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
    ctx.fillText('THE THREE PX PLAYBOOKS', w / 2, 22);

    type Playbook = {
      name: string;
      tag: string;
      icon: string;
      entry: string;
      stop: string;
      target: string;
      color: string;
    };
    const playbooks: Playbook[] = [
      {
        name: 'TREND CONTINUATION',
        tag: 'CONTINUATION',
        icon: '▲',
        entry: 'PX in established trend (Pulse YOUNG/ESTABLISHED), HTF aligned',
        stop: 'Below Pulse line + 0.2 × ATR buffer',
        target: 'Opposite Pulse extreme OR 2R, whichever closer',
        color: TEAL,
      },
      {
        name: 'REVERSAL FROM EXTREME',
        tag: 'REVERSAL',
        icon: '↺',
        entry: 'PX after STRETCHED proximity, MATURE Pulse, regime turning',
        stop: 'Beyond the recent swing extreme',
        target: 'Cipher Flow OR opposite Pulse, sized 1.5-2R',
        color: AMBER,
      },
      {
        name: 'FAILED-FLIP V-BOTTOM',
        tag: 'FAILED-FLIP',
        icon: '⤤',
        entry: 'PX with FAILED-FLIP tag (Gate 4 override fired)',
        stop: 'Below the failed-flip swing low (the V apex)',
        target: 'Prior trend high OR 2.5-3R (V-bottoms run far)',
        color: MAGENTA,
      },
    ];

    // Cycle: 4s per playbook
    const cycleT = t % (playbooks.length * 4);
    const spotIdx = Math.floor(cycleT / 4);

    // Layout: 3 cards stacked vertically
    const padX = 24;
    const cardsTop = 44;
    const cardSpacing = 8;
    const cardH = (h - cardsTop - 28 - cardSpacing * 2) / 3;
    const cardW = w - padX * 2;

    playbooks.forEach((p, i) => {
      const cy = cardsTop + i * (cardH + cardSpacing);
      const isSpot = i === spotIdx;
      const cardBg = isSpot ? `${p.color}1a` : 'rgba(255,255,255,0.025)';
      const cardBorder = isSpot ? `${p.color}aa` : FAINT;

      // Card
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = isSpot ? 1.5 : 1;
      const cR = 6;
      ctx.beginPath();
      ctx.moveTo(padX + cR, cy);
      ctx.lineTo(padX + cardW - cR, cy);
      ctx.quadraticCurveTo(padX + cardW, cy, padX + cardW, cy + cR);
      ctx.lineTo(padX + cardW, cy + cardH - cR);
      ctx.quadraticCurveTo(padX + cardW, cy + cardH, padX + cardW - cR, cy + cardH);
      ctx.lineTo(padX + cR, cy + cardH);
      ctx.quadraticCurveTo(padX, cy + cardH, padX, cy + cardH - cR);
      ctx.lineTo(padX, cy + cR);
      ctx.quadraticCurveTo(padX, cy, padX + cR, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Card content
      // Icon column on left
      ctx.fillStyle = isSpot ? p.color : DIM;
      ctx.font = `bold ${cardH * 0.4}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.icon, padX + 36, cy + cardH / 2 + 10);

      // Name
      ctx.fillStyle = isSpot ? p.color : WHITE;
      ctx.font = isSpot ? 'bold 12px Inter, sans-serif' : 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, padX + 76, cy + 18);

      // Tag pill
      const tagX = padX + 76 + ctx.measureText(p.name).width + 10;
      const tagW = ctx.measureText(p.tag).width + 12;
      ctx.fillStyle = `${p.color}33`;
      ctx.fillRect(tagX, cy + 7, tagW, 14);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.tag, tagX + 6, cy + 17);

      // Entry / Stop / Target rows
      const detailX = padX + 76;
      const detailRowH = (cardH - 30) / 3;
      const labels = ['ENTRY', 'STOP', 'TARGET'];
      const values = [p.entry, p.stop, p.target];
      labels.forEach((label, li) => {
        const ry = cy + 30 + li * detailRowH;
        ctx.fillStyle = DIM;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, detailX, ry);
        ctx.fillStyle = isSpot ? WHITE : DIM;
        ctx.font = isSpot ? '9px Inter, sans-serif' : '8px Inter, sans-serif';
        // Wrap the value
        const valX = detailX + 50;
        const maxW = cardW - 76 - 50 - 10;
        const words = values[li].split(' ');
        let line = '';
        let lineY = ry;
        words.forEach((wd, wi) => {
          const test = line + (line ? ' ' : '') + wd;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, valX, lineY);
            line = wd;
            lineY += 9;
          } else {
            line = test;
          }
          if (wi === words.length - 1) ctx.fillText(line, valX, lineY);
        });
      });
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('All three are pipeline-qualified PX. The setup context determines the playbook.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// Phase 2B: Hero + S00 + S01-S15 + cheat sheet with full glass-card density
// Phases 3A/3B add game/quiz/cert
// ============================================================
export default function CipherPxPipelineLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.11-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 11</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">PX Filter Pipeline<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Why Some Flips Become Signals</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Pulse flips happen often. Most are quietly rejected by a four-gate pipeline. The few that survive become the PX signals you actually trade.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Three flips. One signal. Two silent rejections.</p>
            <p className="text-gray-400 leading-relaxed mb-4">You watch CIPHER through one trading day. The Pulse line flips three times. <strong className="text-amber-400">Only one of those flips produces a PX signal label on your chart.</strong> The other two are silent &mdash; no Long arrow, no Short arrow, no entry in the Last Signal row. Most operators see this and assume CIPHER missed two signals.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER didn&apos;t miss anything. It rejected them. Behind every Pulse flip stands a <strong className="text-white">four-gate pipeline</strong> that decides whether the structural break qualifies as a signal worth firing. Body too small? <strong className="text-amber-400">Rejected.</strong> Pre-cross distance too tight? <strong className="text-amber-400">Rejected.</strong> Opposite-direction PX fired recently? <strong className="text-amber-400">Rejected.</strong> Each gate exists because the kind of flip it filters is the kind of flip that produces losing trades.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where you stop calling rejected flips &ldquo;missed signals&rdquo; and start reading them as <strong className="text-white">CIPHER protecting you from a setup that wouldn&apos;t have worked</strong>. The pipeline is the difference between a Pulse line and a Pulse signal &mdash; and reading it is what separates operators from indicator collectors.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE PULSE CROSS PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know all <strong className="text-white">four gates</strong> by name, the asset and timeframe values they use, the <strong className="text-white">override</strong> that lets failed-flip reversals bypass two of them, and how to <strong className="text-white">diagnose</strong> exactly which gate rejected a flip you thought should have fired. You stop guessing. You start reading.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Four Gates (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Four Gates</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every Pulse flip enters CIPHER&apos;s pipeline. Four sequential gates either pass it through or reject it. <strong className="text-amber-400">Only flips that pass all four (or invoke the failed-flip override) emerge as PX signals.</strong> The pipeline is invisible by design &mdash; you only see what comes out the other end.</p>
          <FourGatesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Six different Pulse flips enter the pipeline one by one. <strong className="text-white">Flip 1</strong>: clean bull flip with strong body, far from Pulse, no recent opposite signal &mdash; passes all four gates and emerges as a PX LONG. <strong className="text-white">Flip 2</strong>: tiny body (a wick close, not a real close) &mdash; rejected at Gate 1. <strong className="text-white">Flip 3</strong>: price was creeping along Pulse for bars before flipping &mdash; rejected at Gate 2. <strong className="text-white">Flip 4</strong>: opposite-direction PX fired two bars ago &mdash; rejected at Gate 3. <strong className="text-white">Flip 5</strong>: a failed-flip V-bottom &mdash; would have failed Gates 2 and 3, but Gate 4&apos;s override lets it through. <strong className="text-white">Flip 6</strong>: clean bear flip &mdash; passes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FOUR GATES IN ORDER</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Gate 1 &middot; Body Filter.</strong> Was the flip bar a real close-through, or just a wick? <strong className="text-white">Gate 2 &middot; Pre-Cross Distance.</strong> Was price meaningfully away from Pulse before the flip, or creeping along it? <strong className="text-white">Gate 3 &middot; Chop Suppression.</strong> Did opposite-direction PX fire recently? <strong className="text-white">Gate 4 &middot; Failed-Flip Override.</strong> Is this a failed-flip pattern that exempts Gates 2 and 3?</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LOGIC IS AND-WITH-EXCEPTIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Gates 1, 2, and 3 are AND-gates &mdash; ALL must pass. Gate 4 is the exception path: when it&apos;s active, it OVERRIDES the requirements of Gates 2 and 3 because the failed-flip pattern itself IS the signal CIPHER wants to catch. The body filter (Gate 1) cannot be bypassed &mdash; if it&apos;s a wick, it&apos;s a wick.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a Pulse flip happens but no PX label appears, you don&apos;t shrug. You ask <strong className="text-white">which gate?</strong> Read the bar, read the recent context, and identify the gate that filtered it. Most rejected flips are rejected for genuinely good reasons &mdash; reasons that, if you had taken the trade, would have lost you money.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — From Flip to PX: The Bridge === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; From Flip to PX</p>
          <h2 className="text-2xl font-extrabold mb-4">The bridge from structural break to tradeable signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Lesson 10 established that a Pulse flip is structurally meaningful &mdash; the ratchet refuses to give back ground until price closes through it, so when it does flip, something real happened. <strong className="text-amber-400">But structural significance is not the same as signal quality.</strong> Many real flips are weak setups. The pipeline filters the weak from the qualified.</p>
          <FlipToPXAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the panels. The top panel shows a chart segment with five Pulse flips happening. The bottom panel shows what survived the pipeline: <strong className="text-white">two PX signals</strong>. Three flips were structurally real but pipeline-rejected. None of them were &ldquo;missed&rdquo; &mdash; CIPHER consciously chose not to fire them.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RECAP &middot; WHAT LESSON 10 ESTABLISHED</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse is Cipher Flow shifted by an ATR distance, ratcheted Supertrend-style, and direction-locked. A flip happens only when price closes through the line &mdash; meaning the line had been defending a level until price overcame it. That break is the structural event PX signals are built on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE PIPELINE ADDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Not every structural break is a tradeable signal. A wick that closes 0.005 ATR through the line is technically a flip, but it&apos;s also indistinguishable from noise. A flip in the middle of a chop sequence is technically a flip, but historical performance of those flips is negative. The pipeline rejects these patterns specifically because their EV is poor.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE PIPELINE EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse alone produces too many flips for direct trading. Most retail Pulse-style indicators (Supertrend, HalfTrend, etc.) hand you every flip and let you sort the wheat from the chaff. CIPHER does the sorting before you see the signal. The pipeline is the difference between a noisy oscillator and a tradeable signal generator.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE MENTAL MODEL SHIFT</p>
            <p className="text-sm text-gray-400 leading-relaxed">Stop thinking &ldquo;Pulse flipped, where is my signal?&rdquo; Start thinking <strong className="text-white">&ldquo;Pulse flipped, did the pipeline qualify it?&rdquo;</strong> The first framing makes the indicator feel broken when signals don&apos;t fire. The second framing makes the indicator a genuine intelligence layer &mdash; one that&apos;s actively protecting you from setups it has determined would not work.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Gate 1: The Body Filter === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Gate 1 &middot; The Body Filter</p>
          <h2 className="text-2xl font-extrabold mb-4">Was that flip a real close, or a wick?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first gate is the simplest and the most-rejected. A Pulse flip happens on the bar where price <em>closes</em> through the line. But every closing bar has a body, and bodies vary in size. CIPHER asks: <strong className="text-amber-400">is this body large enough to call this a real conviction close, or is it small enough that it&apos;s probably a wick that briefly punched through and recovered?</strong></p>
          <BodyFilterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through four candles &mdash; tiny, small, medium, large &mdash; while the asset class cycles between forex, crypto/index, and stocks every 3.5 seconds. Watch the threshold line move as the asset changes. The same body that passes Gate 1 on a forex chart can fail it on a stock chart.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">body = abs(close &minus; open)<br />body &gt; min_body  ? PASS : REJECT</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Where <em>min_body</em> is the asset-routed threshold (a fraction of ATR). The check is run on the flip bar &mdash; the bar where Pulse changed direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX &amp; COMMODITY CFDs &middot; min_body = 0.02 &times; ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tight ranges, thin wicks. Even small bodies represent real closes &mdash; the noise floor is low. A 0.02 ATR threshold catches most wick-rejections without filtering legitimate small-body flips. XAUUSD inherits this value despite being technically a CFD because its behaviour matches forex more than stocks.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO &amp; INDEX CFDs &middot; min_body = 0.03 &times; ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crypto has wider wicks and bigger ranges. Indices like NAS100 trend cleanly but their bars contain more breadth. A slightly higher threshold (0.03) demands more body conviction. Below this, what looks like a flip on the chart is too often a long wick that briefly tagged the line.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS &middot; min_body = 0.05 &times; ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The widest threshold. Individual stocks deal with earnings gaps, single-issue news shocks, and lower liquidity outside RTH. A 0.05 ATR floor demands meaningful body before CIPHER calls a flip a signal. Without this, a single late-session wick on AAPL could fire a PX label that the next bar would invalidate.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THE BODY MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">A close is a vote &mdash; the bar&apos;s final commitment to a direction. A wick is the opposite: price went somewhere and was rejected back. <strong className="text-white">A flip on a body says traders committed to the new direction. A flip on a wick says traders looked at the new direction and said no.</strong> Gate 1 separates the two.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Gate 2: Pre-Cross Distance === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Gate 2 &middot; Pre-Cross Distance</p>
          <h2 className="text-2xl font-extrabold mb-4">Was price meaningfully away from Pulse before flipping?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The second gate filters a specific failure mode: <strong className="text-amber-400">consolidation creep-throughs</strong>. Price drifts along Pulse for many bars, hugging it within tiny distances, then finally ticks just barely through and triggers a flip. Technically a structural break. Practically, it&apos;s the kind of flip that immediately reverses because nothing was decided &mdash; price was already at the line.</p>
          <PreCrossDistanceAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Two scenarios side by side. <strong className="text-white">Left panel:</strong> creep-through. Price has been wandering within 0.01 ATR of Pulse for a dozen bars, then ticks through. Pre-cross distance: 0.005 ATR. Gate 2 rejects. <strong className="text-white">Right panel:</strong> clean flip. Price was 0.07 ATR away from Pulse the bar before, then closed through with conviction. Gate 2 passes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">pre_cross_dist = abs(close[1] &minus; pulse_line[1])<br />pre_cross_dist &gt; min_dist  ? PASS : REJECT</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">The check uses <em>close[1]</em> &mdash; the close of the bar BEFORE the flip bar. It&apos;s asking: how far was price from Pulse the moment before everything changed?</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INDEX CFDs &middot; min_dist = 0.0  ALL TIMEFRAMES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Indices get a special pass &mdash; they don&apos;t need this filter. The asset multiplier on Pulse itself (0.95) is already tighter than baseline, which means Pulse already sits closer to price for indices. A distance filter on top would block legitimate indices flips during consolidation-to-breakdown patterns. The Pulse width IS the filter.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX &amp; COMMODITY &middot; 0 to 0.03 &times; ATR by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Daily and 4H: 0.0 (no filter &mdash; HTF flips are meaningful regardless of pre-cross distance). 1H and 30m: 0.02 ATR. Lower TFs (5m, 15m): 0.03 ATR. Sub-5m: 0.0 (scalp signals fire fast, distance filter would block them).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO &middot; 0 to 0.08 &times; ATR by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Wider thresholds because crypto has bigger noise relative to ATR. Daily/4H: 0.0. 1H/30m: 0.05 ATR. Lower TFs: 0.08 ATR. The deeper distance requirement reflects crypto&apos;s tendency to grind sideways before its real moves &mdash; without this filter, BTC 5m would produce constant chop-flips.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS &middot; 0.05 to 0.15 &times; ATR by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">The most aggressive distance filter. Daily/Weekly: 0.05 ATR. Mid TFs: 0.08 ATR. Low TFs: 0.15 ATR. Stocks consolidate against levels for hours before breaking, and many of those break-attempts fail. The wider distance threshold demands real expansion before CIPHER calls a flip a signal.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY DISTANCE MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">A flip from a meaningful distance is a directional decision &mdash; price moved AWAY from the line, then came back THROUGH it with momentum. A flip from on-the-line is a non-decision &mdash; price was already there, took one tick, and triggered the math. <strong className="text-white">The first behaviour produces winning trades. The second produces noise.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Gate 3: Chop Suppression === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Gate 3 &middot; Chop Suppression</p>
          <h2 className="text-2xl font-extrabold mb-4">Did opposite-direction PX fire recently?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The third gate exists because some market regimes produce alternating flips &mdash; bull, bear, bull, bear &mdash; in quick succession. Each flip is technically real. None of them are tradeable. Gate 3 introduces a <strong className="text-amber-400">cooldown window</strong>: after a PX fires in one direction, opposite-direction PX is blocked until the window expires.</p>
          <ChopSuppressionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the timeline. A current-bar pointer scrubs left to right across 60 bars. Every PX event leaves a shaded suppression band trailing behind it. When an attempted opposite-direction PX falls inside that band, it&apos;s rejected (shown as a faded marker with a strike-through). The status panel at the top shows in real time which direction is currently suppressed and how many bars remain on the cooldown.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">long_after_recent_short  = (bar_index &minus; px_last_short_bar) &lt; flip_window<br />short_after_recent_long  = (bar_index &minus; px_last_long_bar) &lt; flip_window</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">If <em>long_after_recent_short</em> is true, the long PX is blocked. If <em>short_after_recent_long</em> is true, the short is blocked. The override (Gate 4) can still bypass this &mdash; we&apos;ll cover that next section.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INDEX CFDs &middot; flip_window = 2 (all timeframes)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Indices trend cleanly. After a real PX, opposite-direction PX within 2 bars is suspicious enough to suppress. Beyond 2 bars, the original signal has had time to play out &mdash; opposite signals are likely real reversals, not noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX &amp; COMMODITY &middot; 1 to 3 bars by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Higher TFs (Daily/4H): 1 bar &mdash; HTF flips are deliberate, suppressing more than 1 bar would block legitimate same-day reversals. Mid TFs (1H/30m): 2 bars. Lower TFs (5m/15m): 3 bars &mdash; more noise opportunity, longer cooldown.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO &middot; 2 to 4 bars by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Wider windows than forex because crypto&apos;s 24/7 market produces wickier reversals. Daily/4H: 2 bars. 1H/30m: 3 bars. Lower TFs: 4 bars. The longer cooldown filters the wick-driven false reversals that crypto produces especially during low-volume hours.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS &middot; 2 to 5 bars by TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">The most aggressive cooldown. Mid-to-high TFs: 2 bars. Lower TFs: 5 bars. Stocks have intraday session pauses, opening prints, and lunch-hour drift that produce many micro-flips. 5-bar suppression on lower TFs filters this without blocking real reversals on slower-moving stock charts.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS GATE MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Without Gate 3, a chop sequence would produce alternating PX signals. Each one would look real on chart. Each one would lose money. <strong className="text-white">The suppression window is CIPHER refusing to fire signals during conditions where signals statistically don&apos;t work.</strong> When the window clears and the next flip fires, you can trust it &mdash; the chop has resolved.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Gate 4: The Failed-Flip Override === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Gate 4 &middot; The Failed-Flip Override</p>
          <h2 className="text-2xl font-extrabold mb-4">The exception that catches V-bottoms</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Gates 2 and 3 are necessary filters &mdash; they reject creep-throughs and chop. But they have a side effect: they ALSO reject a specific high-conviction pattern. <strong className="text-amber-400">A failed flip followed by a recovery flip in the opposite direction.</strong> This is the V-bottom and W-bottom signature. CIPHER includes a Gate 4 override specifically to let these signals through.</p>
          <FailedFlipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the chart. Bars 0-12: bullish trend, Pulse acting as support. Bar 13: a bear flip fires &mdash; a would-be PX SHORT, but it gets rejected by Gates 1-3 for a different reason (small body and creep-through). Bar 17: just 4 bars later, price closes back above Pulse, triggering a bull flip. <strong className="text-white">Without the override, this bull flip would be rejected by Gate 3 (recent opposite PX).</strong> With the override, Gate 4 detects the failed-flip pattern and lets the bull flip through. The amber banner appears confirming OVERRIDE ACTIVE.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">recent_bull_flip = (bar_index &minus; px_last_long_bar) &lt; 8<br />recent_bear_flip = (bar_index &minus; px_last_short_bar) &lt; 8<br />failed_flip_long  = pulse_flip_bull AND recent_bear_flip<br />failed_flip_short = pulse_flip_bear AND recent_bull_flip</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">An 8-bar lookback. If the OPPOSITE direction PX fired within 8 bars and now Pulse is flipping back, the failed-flip flag triggers. That flag becomes the override allowing this flip to bypass Gates 2 and 3.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN GATE 4 TRIGGERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A long PX fires &mdash; price has just established bullish direction. Within 8 bars, price reverses sharply and a short PX-attempt happens. The short gets rejected (Gate 1 or 2). Then within those same 8 bars, price reverses BACK and Pulse flips bullish again. THAT second bull flip is the failed-flip recovery. It&apos;s the V-bottom in pattern form.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT GATE 4 BYPASSES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Specifically Gates 2 and 3. Gate 2 (pre-cross distance) gets bypassed because after any flip, price sits ON Pulse &mdash; pre_cross_dist is near zero by definition. Gate 3 (chop suppression) gets bypassed because the recent opposite PX is the very thing this pattern depends on. Gate 1 (body filter) is NOT bypassed &mdash; if the recovery flip is on a wick, it&apos;s still rejected.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS PATTERN IS SPECIAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Failed-flip recoveries are some of the highest-edge setups CIPHER tracks. The original flip failed &mdash; meaning the side that caused it lacked follow-through. The recovery in the opposite direction comes against fresh, exhausted opposite-side traders who already committed. The V-bottom and W-bottom patterns are price action&apos;s strongest reversal signatures, and Gate 4 is CIPHER&apos;s way of catching them.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S NOTE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Failed-flip PX signals are sometimes flagged in CIPHER&apos;s Last Signal row with context tags like <em>FailedFlip</em>. These are NOT weaker signals than clean PX &mdash; in many cases they&apos;re STRONGER, because they&apos;re built on a fresh exhaustion of the opposite side. Don&apos;t treat them as exceptions to be cautious about. Treat them as setups CIPHER specifically pulled out of the rejection pile.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Asset Routing Master Table === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Asset Routing Matrix</p>
          <h2 className="text-2xl font-extrabold mb-4">All gates, all asset classes, in one view</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You&apos;ve seen each gate&apos;s asset-routed values in isolation. Here they sit together. <strong className="text-amber-400">This is why &ldquo;CIPHER feels different on every chart&rdquo; &mdash; it IS different on every chart.</strong> The pipeline is asset-aware in ways most operators never notice.</p>
          <AssetRoutingTableAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The matrix cycles through asset classes every 3.5 seconds, highlighting one row at a time. Each cell shows that asset&apos;s threshold for that gate. Read across a row to see how an asset class is filtered. Read down a column to see how the gate&apos;s threshold scales across asset classes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX / COMMODITY &middot; The most-permissive asset class</p>
              <p className="text-sm text-gray-400 leading-relaxed">Body 0.02, distance 0&mdash;0.03, suppression 1&mdash;3. Tight thresholds across the board. Forex and commodity ranges are tight enough that even modest bodies and distances are real signals. <strong className="text-white">XAUUSD inherits these values</strong> because its behaviour matches forex more than equities.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INDEX CFD &middot; The special case</p>
              <p className="text-sm text-gray-400 leading-relaxed">Body 0.03 (slightly higher), distance 0 (always), suppression 2 (uniform). The unique zero-distance filter exists because indices trend cleanly &mdash; the Pulse width itself (0.95&times; multiplier from L10) is already the filter. Adding a distance gate on top would block legitimate index breakouts from consolidation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CRYPTO &middot; The wide-noise asset class</p>
              <p className="text-sm text-gray-400 leading-relaxed">Body 0.03, distance 0&mdash;0.08, suppression 2&mdash;4. Wider distance and longer suppression than forex because 24/7 markets produce more wick-driven false flips, especially during low-liquidity hours. The widened gates compensate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS &middot; The most-restrictive asset class</p>
              <p className="text-sm text-gray-400 leading-relaxed">Body 0.05, distance 0.05&mdash;0.15, suppression 2&mdash;5. The most aggressive filtering. Earnings, gaps, single-issue news, and lower liquidity all demand it. PX signals on stocks fire less frequently than on forex of the same TF &mdash; that frequency difference is the pipeline doing its job.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S CALIBRATION</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you switch from XAUUSD to AAPL and PX signals feel rarer, that&apos;s correct. When you switch from BTC to NAS100 and signals feel different in cadence, that&apos;s correct. <strong className="text-white">The pipeline is asset-tuned by design.</strong> Don&apos;t fight it &mdash; expect it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Timeframe Routing Master Table === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Timeframe Routing</p>
          <h2 className="text-2xl font-extrabold mb-4">How TF modifies the gates</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond asset class, the pipeline reads the <em>timeframe</em> of your chart and modifies Gates 2 and 3 accordingly. <strong className="text-amber-400">Lower TFs need wider distance filters and longer suppression windows. Higher TFs need less filtering because flips at HTF are inherently meaningful.</strong></p>
          <TFRoutingTableAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The matrix cycles through 6 timeframe brackets, highlighting how forex/commodity values change. The same general shape applies to other asset classes &mdash; the absolute numbers differ but the gradient (lower TF = more filtering, higher TF = less) holds across all assets.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY LOWER TFs NEED WIDER FILTERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 5-minute bar contains less information than a 1-hour bar. More of what happens on a 5m chart is noise &mdash; spread, single-trade prints, momentary liquidity gaps. To produce reliable signals, the pipeline must demand more pre-cross distance and longer chop suppression. Without these wider filters, scalp-TF charts would produce constant false PX signals.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY HIGHER TFs NEED LESS FILTERING</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Daily flip means a full session has voted to change direction. The structural significance is already very high &mdash; Gate 2&apos;s distance filter would be redundant and even harmful, blocking legitimate Daily reversals during consolidation-to-trend patterns. Same logic for Gate 3: HTF reversals deserve immediate signals, not 3-bar cooldowns.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 1-MINUTE EDGE CASE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Notice 1m has Gate 2 distance set to 0 &mdash; same as Daily. This isn&apos;t the same reasoning. On 1m, the distance filter is OFF because scalp-tier signals fire fast and any meaningful filter would block legitimate scalp setups. The chop suppression (Gate 3) does the heavy lifting at 1m instead, with a 3-bar window.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRACTICAL IMPLICATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you&apos;re used to PX cadence on 1H and switch to 5m or 15m, you&apos;ll see MANY more signals. That&apos;s not because your tuning changed &mdash; it&apos;s because the pipeline gates are wider in absolute terms but the bar count goes up dramatically. Don&apos;t assume more signals means more profitable signals; the strength overlay (Lesson 12 territory) does additional filtering.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING TF AND ASSET TOGETHER</p>
            <p className="text-sm text-gray-400 leading-relaxed">An operator on EURUSD 5m has a fundamentally different pipeline running than one on AAPL Daily. <strong className="text-white">Same indicator, completely different filtering.</strong> Understanding this is why a single i_pulse_factor doesn&apos;t feel right across all charts &mdash; the pipeline downstream is shifting too.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Pipeline Logic in Plain English === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Pipeline Logic</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading px_long, clause by clause</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s pipeline lives in a single boolean expression. It&apos;s long. It&apos;s nested. It&apos;s also, once you understand it, perfectly readable. Each clause maps to one of the four gates plus the bridge from Lesson 10.</p>
          <LogicWalkthroughAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation walks through each clause one at a time, highlighting the active section in the full expression and revealing its plain-English meaning. By the end of the cycle, the entire pipeline reads as one continuous narrative: <em>flip happened AND body was real AND price was either away or this is a recovery AND no recent opposite signal or this is a recovery</em>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FULL EXPRESSION</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">px_long  =  pulse_flip_bull  AND  body &gt; min_body  AND  (pre_cross_dist &gt; min_dist  OR  failed_flip_long)  AND  (NOT long_after_recent_short  OR  failed_flip_long)</p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">Four AND-joined clauses. Two of them have OR-paths through <em>failed_flip_long</em>. That OR-path is Gate 4&apos;s override.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLAUSE 1 &middot; pulse_flip_bull</p>
              <p className="text-sm text-gray-400 leading-relaxed">The bridge from Lesson 10. The Pulse line just changed direction from bear to bull on this bar. This isn&apos;t a gate &mdash; it&apos;s the precondition. If Pulse hasn&apos;t flipped, none of the rest of the expression even evaluates.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLAUSE 2 &middot; body &gt; min_body  (Gate 1)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The body filter. Pure AND-clause &mdash; no override. If the flip bar&apos;s body is too small, the entire expression fails regardless of what Gates 2-4 say. This is the only gate that has no exception path.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLAUSE 3 &middot; pre_cross_dist &gt; min_dist  OR  failed_flip_long  (Gate 2 + override)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pre-cross distance OR failed-flip override. Either price was meaningfully away from Pulse before the flip (Gate 2 passes naturally) OR this is a failed-flip recovery (Gate 4 overrides). Either condition is sufficient.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLAUSE 4 &middot; NOT long_after_recent_short  OR  failed_flip_long  (Gate 3 + override)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Chop suppression OR failed-flip override. Either no opposite-direction PX has fired recently (Gate 3 passes naturally) OR this is a failed-flip recovery (Gate 4 overrides). Note the same <em>failed_flip_long</em> appears in both clauses 3 and 4 &mdash; that&apos;s how the override bypasses both gates simultaneously.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE READABLE PIPELINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Once you can read this expression, you can predict whether any Pulse flip will fire as PX. <strong className="text-white">That predictability is what makes CIPHER an indicator you trust rather than an oracle you obey.</strong> You don&apos;t hope; you read.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — PX in the Command Center === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; PX in the Command Center</p>
          <h2 className="text-2xl font-extrabold mb-4">Where PX appears, and how to read it</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A PX signal that fires shows up in two places: as a label on the chart (Long, Long+, Short, or Short+) and in the <strong className="text-amber-400">Last Signal row</strong> of the Command Center. The Command Center version carries more information &mdash; bars-since-fired, the context tag that classifies the setup, and a guidance verdict.</p>
          <CommandCenterPXAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation cycles through six representative states. Each shows the standard 3-cell row structure: <strong className="text-white">column zero</strong> always reads &ldquo;Last Signal&rdquo;, <strong className="text-white">column one</strong> reports direction, Strong marker, bars-since-fire, and the context tag, and <strong className="text-white">column two</strong> is the action guidance.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE DIRECTION CELL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reads <em>▲ LONG</em> or <em>▼ SHORT</em>, optionally with a <em>+</em> suffix marking Strong (3+/4 conviction). Color always matches the direction grammar &mdash; teal for long, magenta for short. The Strong suffix doesn&apos;t change the color; it&apos;s a typographic marker, not a color flag.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BARS-SINCE-FIRED COUNT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Always shown as <em>Nb</em>. <em>0b</em> = the signal fired this bar. <em>4b</em> = four bars have passed since it fired. Once a signal hits roughly 30+ bars, it becomes context rather than active &mdash; the original entry has long since played out, and the bars-since count is mainly there to tell you the signal is aged.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE CONTEXT TAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX signals carry one of several context tags. <em>CONTINUATION</em> is the default for clean trend-following PX. <em>FAILED-FLIP</em> appears when Gate 4&apos;s override fired the signal &mdash; this is a V-bottom or W-bottom recovery. <em>STRONG</em> overrides other tags when the conviction overlay is 3+/4. The tag is what classifies the playbook to use.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE GUIDANCE CELL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Plain English. <em>WATCH BUILD</em>, <em>TREND IGNITION</em>, <em>TREND HOLDING</em>, <em>V-TOP</em>, <em>AGING</em>. Each one tells the operator the appropriate action, not raw data. When guidance turns amber (e.g., <em>AGING</em>), the signal is no longer the active edge &mdash; let it inform context but stop sizing trades from it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE 5-SECOND READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Direction. Strong or not. Bars-since-fired. Tag. Guidance. Five fields, one row. After a few hundred chart sessions, you read these in &lt;5 seconds and your decision is set. The Last Signal row is the most-glanced cell on the Command Center for active operators.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — PX vs TS Preview === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; PX vs TS Preview</p>
          <h2 className="text-2xl font-extrabold mb-4">The two pathways CIPHER uses to fire signals</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Everything in this lesson has been about PX (Pulse Cross). But CIPHER actually has TWO signal pathways. <strong className="text-amber-400">PX catches the flip after the move. TS (Tension Snap) catches the snap before the flip.</strong> Together they cover both timing-points of a reversal.</p>
          <PXvsTSPreviewAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the side-by-side scenarios. <strong className="text-white">Left:</strong> a clean PX setup &mdash; price climbs, then closes through Pulse with conviction. PX fires AFTER the structural break has already happened. <strong className="text-white">Right:</strong> a clean TS setup &mdash; price stretches far ABOVE Pulse, then a rejection candle appears as price snaps back. TS fires BEFORE Pulse has flipped &mdash; the reversal is detected by the tension snap pattern, not by a Pulse cross.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PX TIMING &middot; AFTER THE FLIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX requires the Pulse line to actually flip direction. By the time PX fires, the structural break has happened &mdash; price has closed through Pulse and the line has changed direction. The advantage: high confirmation. The cost: signal arrives later in the move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS TIMING &middot; BEFORE THE FLIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">TS detects price stretching far from Pulse, then snapping back &mdash; without Pulse needing to flip. The advantage: signal arrives at the turn, not after. The cost: lower confirmation, higher false-positive rate (many stretches are real continuations, not snap-backs).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY OPERATORS USE BOTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX-only operators miss the early reversal turns. TS-only operators get hit by trend continuations that looked like snaps. Operators using both have access to early entries (TS) AND confirmed entries (PX) on the same chart, with separate qualification pipelines for each. Lesson 12 covers the TS 4-condition system in full.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT TO TAKE FROM THIS</p>
            <p className="text-sm text-gray-400 leading-relaxed">PX and TS are <strong className="text-white">complementary</strong>, not redundant. They catch different timings of the same underlying market behaviour. The Last Signal row distinguishes them via the tag (PX or TS appears explicitly). When you see <em>PX &middot; CONTINUATION</em>, that&apos;s a Pulse cross signal. When you see <em>TS &middot; SNAP</em>, that&apos;s a Tension Snap. Same row, different sources.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Strong PX vs Standard PX === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Strong PX vs Standard PX</p>
          <h2 className="text-2xl font-extrabold mb-4">The conviction overlay sits ON TOP of the pipeline</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The four-gate pipeline is necessary but not sufficient for a Strong PX label. <strong className="text-amber-400">After pipeline qualification, CIPHER runs a separate 4-factor conviction check.</strong> Signals that score 3 or higher get the <em>+</em> suffix and the <em>STRONG</em> tag. Signals that pipeline-qualify but score below 3 are Standard.</p>
          <StrengthOverlayAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The animation shows a PX flip firing. Initially the signal is Standard (Long, teal). As conviction factors light up one by one beneath the chart, the signal upgrades to Strong (Long+, gold) once 3 of 4 factors are aligned.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE PIPELINE DID</p>
              <p className="text-sm text-gray-400 leading-relaxed">By the time you reach the strength overlay, the pipeline has already qualified the signal. The flip is real (body filter passed). The pre-cross distance was meaningful (or it was a failed-flip recovery). No recent opposite signal was suppressing it. <strong className="text-white">Standard PX is already a tradeable signal &mdash; it just doesn&apos;t have additional conviction confirmation.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT THE OVERLAY ADDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Four conviction factors are checked at the signal bar: <em>Ribbon Stack</em> (trend layers aligned with signal direction), <em>ADX &gt; 20</em> (real trend strength present), <em>Volume &gt; 1&times;</em> (above-average participation), and <em>Momentum Health &gt; 50%</em> (the health indicator above its midline). Each factor scores 0 or 1. Signals scoring 3 or 4 get the Strong upgrade.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING THE + SUFFIX</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Long+ has 3 or 4 conviction factors. A Long has fewer. The colour stays teal in both cases &mdash; the &lsquo;+&rsquo; is the only typographic difference, but in the Command Center, Strong signals also get the <em>STRONG</em> context tag in column one. So Long+ on chart corresponds to <em>▲ LONG  Nb  PX &middot; STRONG</em> in the row.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEEPER COVERAGE LATER</p>
              <p className="text-sm text-gray-400 leading-relaxed">This lesson treats the overlay as a brief introduction. Each conviction factor &mdash; what it measures, how it&apos;s computed, when it lights up &mdash; deserves its own deep-dive lesson. For now, know that <strong className="text-white">Strong PX is pipeline-qualified PX with 3+/4 conviction layered on top</strong>. That&apos;s enough to read your charts correctly.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TWO-LAYER MENTAL MODEL</p>
            <p className="text-sm text-gray-400 leading-relaxed">Layer 1: pipeline qualification (this lesson&apos;s 4 gates). Layer 2: conviction overlay (4-factor strength check). A PX signal must pass Layer 1 to even appear. To upgrade to Strong, it ALSO needs to pass Layer 2&apos;s 3-of-4 threshold. <strong className="text-white">Standard PX &ne; Weak PX. Standard PX &equals; pipeline-qualified, conviction-not-yet-stacked.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Three PX Playbooks === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Three PX Playbooks</p>
          <h2 className="text-2xl font-extrabold mb-4">Same pipeline qualification, three different setups</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every PX signal comes through the same four-gate pipeline. But the <em>context</em> in which a PX fires determines how it should be traded. <strong className="text-amber-400">Three primary setups account for nearly every actionable PX signal.</strong> Reading the context first &mdash; before sizing the trade &mdash; is what separates operators from signal-takers.</p>
          <PXPlaybooksAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The three cards cycle one at a time. Each card shows the playbook&apos;s entry condition, stop placement rule, and target methodology. All three are pipeline-qualified PX &mdash; the difference is contextual.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 1 &middot; TREND CONTINUATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX fires in an established trend. Pulse maturity is YOUNG or ESTABLISHED. The HTF bias supports the direction. The signal is a continuation entry &mdash; price has paused, retraced, and resumed. <strong className="text-white">Stop:</strong> below Pulse line + 0.2 ATR buffer. <strong className="text-white">Target:</strong> opposite Pulse extreme OR 2R, whichever comes first. <strong className="text-white">Sizing:</strong> standard 1R risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 2 &middot; REVERSAL FROM EXTREME</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX fires after price has been STRETCHED (far from Pulse) for many bars and Pulse has reached MATURE state. The flip represents a regime change &mdash; a long-held trend finally broke. <strong className="text-white">Stop:</strong> beyond the recent swing extreme (the spot where the prior trend tried to make a new high/low). <strong className="text-white">Target:</strong> Cipher Flow OR opposite Pulse, sized 1.5-2R. <strong className="text-white">Sizing:</strong> reduced (0.5-0.75R) until the new direction confirms.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 3 &middot; FAILED-FLIP V-BOTTOM</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX with the FAILED-FLIP context tag &mdash; Gate 4&apos;s override fired this signal. The pattern is a V-bottom or W-bottom recovery. The original flip failed; the recovery flip is the high-conviction reversal. <strong className="text-white">Stop:</strong> below the failed-flip swing low (the V apex). <strong className="text-white">Target:</strong> prior trend high OR 2.5-3R &mdash; V-bottoms tend to run further than continuation patterns because they catch fresh exhausted opposite traders. <strong className="text-white">Sizing:</strong> standard or slightly larger if Strong (Long+).</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING CONTEXT BEFORE SIZING</p>
            <p className="text-sm text-gray-400 leading-relaxed">The same PX signal label on chart can be any of the three playbooks. <strong className="text-white">Read the context tag first.</strong> CONTINUATION → Playbook 1. STRONG appearing in established trend → Playbook 1 with confidence. FAILED-FLIP → Playbook 3. PX after MATURE-state STRETCHED → Playbook 2. The label is the entry; the context is the playbook.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Reading Why a Flip Didn't Fire === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Reading Why a Flip Didn&apos;t Fire</p>
          <h2 className="text-2xl font-extrabold mb-4">The diagnostic skill that turns frustration into literacy</h2>
          <p className="text-gray-400 leading-relaxed mb-6">You watch a Pulse flip happen. You expect a PX label. Nothing fires. Most operators here either curse the indicator or assume CIPHER is broken. <strong className="text-amber-400">The pipeline-literate operator does neither &mdash; they walk the four gates and identify which one rejected the flip.</strong> Six rejection patterns account for nearly every silent flip.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 1 &middot; TINY BODY (Gate 1)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The flip bar&apos;s body was below the asset-routed minimum. Look at the candle: was it mostly wick? On forex/commodity, body needed &gt; 0.02 ATR. On stocks, &gt; 0.05 ATR. If you&apos;re below threshold, it&apos;s Gate 1. <strong className="text-white">Diagnostic check:</strong> measure abs(close - open) divided by ATR. If &lt; min_body for the asset, this is your answer.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 2 &middot; CREEP-THROUGH (Gate 2)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price was hugging Pulse for many bars before flipping. Pre-cross distance was below threshold. Look at the chart: were the last 5-10 bars within 0.05 ATR of the Pulse line? If yes, the flip was a creep-through and Gate 2 rejected it. <strong className="text-white">Diagnostic check:</strong> visualize the bar before the flip. Was price visibly distant from Pulse? If &ldquo;no, it was sitting on it&rdquo; &mdash; that&apos;s Gate 2.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 3 &middot; CHOP CONTEXT (Gate 3)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Opposite-direction PX fired within the flip_window. Look at the recent history: was there a PX signal in the OPPOSITE direction within the last 1-5 bars (asset-dependent)? If yes, this flip is being suppressed for chop. <strong className="text-white">Diagnostic check:</strong> scroll back and find the most recent PX label. If it&apos;s the opposite direction and within flip_window bars, this is Gate 3.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 4 &middot; SAME-DIRECTION RECENT PX</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle one. If the SAME-direction PX fired very recently (within 8 bars), CIPHER may not refire because it&apos;s tracking the recent signal as still-active. Look at the Last Signal row: is the bars-since-fire count &lt; 8 in the same direction? If yes, this isn&apos;t a new signal &mdash; the active one is still considered live.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 5 &middot; SIGNAL ENGINE FILTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pipeline qualified but the user&apos;s Signal Engine setting blocks PX. If Signal Engine = Reversal Only, PX (a Trend signal) is filtered. If Signal Engine = TS Only, PX is filtered. If Direction Filter excludes the direction, signal is filtered. <strong className="text-white">Diagnostic check:</strong> open the Inputs panel, check Signal Engine and Direction filter values.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REJECTION 6 &middot; CONVICTION BELOW STRONG-ONLY THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">If <em>Strong Only</em> is enabled (or the active preset uses min_conviction = 3), Standard PX signals are suppressed. The pipeline qualified the flip, but the strength overlay rejected it. Standard signals don&apos;t fire under Strong-Only mode. <strong className="text-white">Diagnostic check:</strong> is &ldquo;Strong Only&rdquo; toggled on? Is your preset Sniper or Swing Trader? If yes, Standard PX won&apos;t print.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE DIAGNOSTIC HABIT</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a flip doesn&apos;t fire, run through these six rejections in order. <strong className="text-white">Within 30 seconds, you&apos;ll know exactly why CIPHER skipped the signal.</strong> Once that becomes automatic, you stop being surprised by silent flips and start using them as additional information. A rejected flip is not a missed signal &mdash; it&apos;s CIPHER&apos;s vote against this particular setup.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every PX-user falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable mistakes appear when operators first start trading PX. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  CALLING REJECTED FLIPS &ldquo;MISSED SIGNALS&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Pulse flip that didn&apos;t fire as PX wasn&apos;t missed &mdash; it was rejected. By Gate 1 or 2 or 3 or the strength overlay. The pipeline did its job. Calling these &ldquo;missed&rdquo; reveals an unread pipeline. Walk the gates, find the rejection. Most rejected flips, if traded, would have lost.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  TRADING EVERY PULSE FLIP AS IF IT WERE A PX</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse flips happen often. PX signals only fire when ALL four gates pass. Operators who watch for flips on the chart instead of waiting for PX labels get whipsawed by the flips that the pipeline would have filtered. <strong className="text-white">Trade the label, not the flip.</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  IGNORING ASSET CLASS WHEN JUDGING SIGNAL FREQUENCY</p>
              <p className="text-sm text-gray-400 leading-relaxed">&ldquo;PX seems rarer on AAPL than on EURUSD.&rdquo; Correct, by design. Stocks have wider gates &mdash; 0.05 ATR body filter, 0.05-0.15 ATR distance. The pipeline rejection rate is asset-tuned. Pipeline frequency on stocks SHOULD be lower than on forex of the same TF.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  LOWERING <em>i_pulse_factor</em> TO &ldquo;GET MORE PX SIGNALS&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">That tightens Pulse, which produces more flips. But MORE of those flips fail Gate 1 (smaller bodies relative to ATR) and Gate 2 (no pre-cross distance because Pulse is hugging price). <strong className="text-white">Pipeline rejection rate goes UP, not down.</strong> The fix isn&apos;t tightening Pulse &mdash; it&apos;s loosening the strength overlay if Strong-Only is filtering, or accepting that the asset/TF combo produces few signals by design.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  TREATING FAILED-FLIP PX AS WEAK</p>
              <p className="text-sm text-gray-400 leading-relaxed">They are EXEMPT from Gates 2 and 3 because the failed-flip pattern itself IS the signal. V-bottoms and W-bottoms produce these. The pattern is structurally one of the strongest setups CIPHER catches. <strong className="text-white">Failed-flip PX is not a leftover or a marginal pass &mdash; it&apos;s a deliberately-included high-edge pattern.</strong> Size accordingly.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  CONFUSING PIPELINE REJECTION WITH STRONG-ONLY FILTERING</p>
              <p className="text-sm text-gray-400 leading-relaxed">A flip that fails Gate 1 is rejected at the pipeline level &mdash; the flip never qualifies as a signal at all. A signal that fails the strength overlay (conviction below 3) is rejected AFTER pipeline qualification &mdash; in non-Strong-Only mode it would have fired as Standard PX. Two different filters, two different reasons. Reading one for the other diagnoses the wrong fix.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The PX Pipeline Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to the Pulse Factor cheat sheet. Reference it when a flip silently disappears.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Four Gates</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Gate 1 &middot; Body</strong> &mdash; body &gt; min_body. Real close vs wick.</p>
                <p><strong className="text-white">Gate 2 &middot; Pre-Cross Distance</strong> &mdash; pre_cross_dist &gt; min_dist. Real move vs creep-through.</p>
                <p><strong className="text-white">Gate 3 &middot; Chop Suppression</strong> &mdash; no opposite PX within flip_window bars.</p>
                <p><strong className="text-white">Gate 4 &middot; Failed-Flip Override</strong> &mdash; bypasses Gates 2 &amp; 3 for V-bottom recoveries.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Body Filter Thresholds</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Forex / Commodity</strong> 0.02 ATR &middot; <strong className="text-white">Crypto / Index</strong> 0.03 ATR &middot; <strong className="text-white">Stocks</strong> 0.05 ATR</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Pre-Cross Distance Thresholds</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Index CFD</strong> &mdash; 0 (always, all TFs)</p>
                <p><strong className="text-white">Forex / Commodity</strong> &mdash; 0 to 0.03 ATR by TF</p>
                <p><strong className="text-white">Crypto</strong> &mdash; 0 to 0.08 ATR by TF</p>
                <p><strong className="text-white">Stocks</strong> &mdash; 0.05 to 0.15 ATR by TF</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Chop Suppression Window (flip_window)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Index CFD</strong> 2 (all TFs) &middot; <strong className="text-white">Forex / Commodity</strong> 1-3 by TF &middot; <strong className="text-white">Crypto</strong> 2-4 by TF &middot; <strong className="text-white">Stocks</strong> 2-5 by TF</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Failed-Flip Override (Gate 4)</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Triggers when opposite-direction PX fired within 8 bars. Bypasses Gates 2 &amp; 3 (NOT Gate 1 &mdash; body still required). Catches V-bottoms and W-bottoms.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The px_long Expression</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                pulse_flip_bull AND<br />body &gt; min_body AND<br />(pre_cross_dist &gt; min_dist OR failed_flip_long) AND<br />(NOT long_after_recent_short OR failed_flip_long)
              </p>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Strong Overlay (after pipeline)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>4-factor conviction: <strong className="text-white">Ribbon Stack</strong> &middot; <strong className="text-white">ADX &gt; 20</strong> &middot; <strong className="text-white">Volume &gt; 1&times;</strong> &middot; <strong className="text-white">Momentum &gt; 50%</strong></p>
                <p>Score 3+/4 = Strong (Long+ / Short+, STRONG tag). Score &lt; 3 = Standard.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Three Playbooks</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Trend Continuation</strong> (CONTINUATION tag, YOUNG/ESTABLISHED Pulse)</p>
                <p><strong className="text-white">Reversal from Extreme</strong> (post-STRETCHED, MATURE Pulse)</p>
                <p><strong className="text-white">Failed-Flip V-Bottom</strong> (FAILED-FLIP tag, Gate 4 override fired)</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Six Rejection Patterns</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Tiny body / Creep-through / Chop context / Same-direction recent / Signal Engine filter / Below Strong-Only threshold</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Diagnose the Pipeline Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real-feeling pipeline situation &mdash; gate diagnosis, asset/TF mismatch, failed-flip recognition, conviction-aware sizing, hidden preset filtering. Pick the right call. Explanations appear after every answer, including for the wrong ones.</p>
          <div className="p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase text-amber-400">Round {gameRound + 1} of {gameRounds.length}</p>
              <p className="text-xs text-gray-500">Score: {gameSelections.filter((sel, i) => sel !== null && gameRounds[i].options.find(o => o.id === sel)?.correct).length}/{gameRounds.length}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{gameRounds[gameRound].scenario}</p>
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
                      <span className="text-gray-200">{opt.text}</span>
                    </button>
                    {answered && selected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-3 rounded-lg bg-white/[0.02]">
                        <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '✓' : '✗'} {opt.explain}</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade pipeline reading installed. You read rejections instead of cursing them.' : finalScore >= 3 ? 'Solid grasp. Re-read the diagnostic patterns (S14), the routing matrices (S07-S08), and the playbooks (S13) before the quiz.' : 'Re-study the four gates (S03-S06), the asset routing (S07), and the six rejection patterns (S14) before the quiz.'}</p>
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
                        {opt.text}
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.11: PX Filter Pipeline</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Pulse Cross Operator &mdash;</p>
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
