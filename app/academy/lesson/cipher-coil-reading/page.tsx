// app/academy/lesson/cipher-coil-reading/page.tsx
// ATLAS Academy — Lesson 11.15: Reading Coils Live [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The 4-Step Coil Reading Frame — From mechanics to muscle memory.
// Lesson 2 of the Coil Box arc (14 + 15) — operational skill that pairs
// with L11.14's mechanical knowledge.
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// PHASE 1 — Scaffold + 4 animations + Hero + S00 + S01 + S02 + S03 + S04
// Game/quiz/cert arrays are added in Phase 3
// ============================================================
const gameRounds: Array<{
  id: string;
  scenario: string;
  prompt: string;
  options: Array<{ id: string; text: string; correct: boolean; explain: string }>;
}> = [
  {
    id: 'g1',
    scenario: 'XAUUSD 4h. You see <strong class="text-white">3 amber Coil Boxes</strong> on the chart &mdash; one in the middle that&apos;s faded with thin walls, one further right that&apos;s slightly brighter, and one on the far right with bright solid walls touching the live bar. The Volatility row reads "78% BREAKOUT READY".',
    prompt: 'Which coil should you read for a live trade?',
    options: [
      { id: 'a', text: 'All three &mdash; analyse the historical patterns to predict what the active one will do.', correct: false, explain: 'Mistake 1 from S15. Historical Coil Boxes are LOCKED Pine artifacts &mdash; they cannot fire again. They might have produced trades in the past but they cannot now. Trying to "analyse the pattern across all three" wastes attention and produces phantom signals. The right discipline is to read only the active coil.' },
      { id: 'b', text: 'The middle one &mdash; it&apos;s the oldest and most "matured."', correct: false, explain: 'Coils don\'t mature with age &mdash; they DIE when the squeeze ends, then lock as historical artifacts. The faded middle box died long ago. "Maturing" is what an active coil does in real time as it advances through phases; once locked, the box is frozen forever. Read only the active rightmost box.' },
      { id: 'c', text: 'The far-right one with bright walls touching the live bar — it&apos;s the only active coil.', correct: true, explain: '✓ Right. The visual distinction tells you everything: bright walls + right edge touching the live bar = active. Faded walls + gap between right edge and live bar = historical. The Volatility row reading "78% BREAKOUT READY" confirms there\'s an active coil at BREAKOUT READY phase. The other two are locked history.' },
      { id: 'd', text: 'None of them &mdash; multiple coils on a chart means the asset is choppy, skip the asset.', correct: false, explain: 'Multiple coils on one chart is normal &mdash; CIPHER\'s history array holds up to 10 historical boxes plus an active one. A long-running chart accumulates them. The historical coils provide context (what kinds of breakouts this asset produces) but no live trade. The active coil is fully tradeable on its own merits regardless of how many historical coils sit behind it.' },
    ],
  },
  {
    id: 'g2',
    scenario: 'BTCUSD 4h. You spot an active Coil Box at COILING phase. Volatility row: "62% COILING". You glance at the Ribbon Command Center row &mdash; it reads "↔ DOUBLE COIL". The Coil Box has bright amber walls.',
    prompt: 'How do you classify this for the trade plan?',
    options: [
      { id: 'a', text: '{COILING, MODERATE, single} &mdash; Playbook 1, standard size, 1.5R target.', correct: false, explain: 'Wrong on the Tier read. The Ribbon row says "DOUBLE COIL" &mdash; that\'s the explicit signal that BB/KC and Ribbon are BOTH compressed (rs_double_coil = true). Classifying this as single-tier ignores the highest-edge tier marker the engine produces. Without the Tier Reflex catching the ★, you\'d trade this at standard size and leave R on the table.' },
      { id: 'b', text: '{COILING, MODERATE, ★ Double Coil} &mdash; Playbook 3, up-size 25-50%, 2.5R+ target.', correct: true, explain: '✓ Exactly. The Ribbon row reading "DOUBLE COIL" is the definitive Tier signal. Combined with the active Coil Box at COILING phase and 62% compression (MODERATE energy), the tuple is {COILING, MODERATE, ★ Double Coil}. This maps to Playbook 3 &mdash; up-size confidently because Double Coils have higher RUNNER rates than single-tier coils. The Tier Reflex earns its keep on this exact pattern.' },
      { id: 'c', text: '{COILING, HIGH, single} &mdash; Playbook 2, up-size, 2.5R target.', correct: false, explain: 'Two errors. (1) The Volatility row says 62% COILING which is MODERATE energy, not HIGH (HIGH starts around 70%+). (2) Tier read missed: Ribbon says DOUBLE COIL. The combination of mis-reading energy and missing the Double Coil flag would push you toward Playbook 2 thinking when this is actually Playbook 3 territory. Read all three reflexes carefully.' },
      { id: 'd', text: 'The classification doesn\'t matter at COILING &mdash; just wait for BREAKOUT READY and then classify.', correct: false, explain: 'CLASSIFY happens DURING COILING precisely so you can PLAN the trade before BREAKOUT READY arrives. Waiting until BREAKOUT READY to classify means you scramble to compose the plan in 30-60 seconds while the diamond is about to fire. The 4-step frame puts CLASSIFY at the COILING stage so PLAN can be staged calmly. Skipping CLASSIFY at COILING violates the framework rhythm.' },
    ],
  },
  {
    id: 'g3',
    scenario: 'EURUSD 15m. The active coil reaches BREAKOUT READY with bright glowing walls. Volatility row: "82% BREAKOUT READY". You haven&apos;t pre-staged any orders. The diamond drops 3 minutes later on a bull breakout candle.',
    prompt: 'You enter immediately by typing in entry, computing stop, and computing target after the diamond fires. How does this trade typically play out?',
    options: [
      { id: 'a', text: 'Cleanly &mdash; the framework is robust enough to handle delayed execution.', correct: false, explain: 'The framework is robust &mdash; but it depends on the PLAN step happening BEFORE the fire bar, not at it. By the time you compose the trade after fire, price has typically moved 0.5-1.0R in the breakout direction. Your stop is now too far away (relative to the entry) to maintain the original R:R, OR you tighten the stop and stop on noise. Either way you\'re trading a different setup than the framework targets.' },
      { id: 'b', text: 'You miss the entry &mdash; price moves too fast for manual order composition.', correct: false, explain: 'Close, but more nuanced than "miss the entry." You\'ll get filled, but at a worse price relative to the original plan. The bigger issue is what comes AFTER &mdash; the trade you executed isn\'t the trade your framework planned. The CLASSIFY → playbook → R:R chain assumes entry at the fire-bar close. Late entry breaks that chain.' },
      { id: 'c', text: 'Late entry produces a worse R:R &mdash; PLAN should have been pre-staged during COILING.', correct: true, explain: '✓ Right. PLAN happens during COILING precisely so PLAN-the-thinking is finished before BREAKOUT READY arrives. When the diamond drops, only EXECUTION remains &mdash; one click within 5 seconds. Composing the trade at the fire bar means you\'re thinking AND executing simultaneously, which produces slower fills and degraded R:R. The discipline is "think slow during COILING, execute fast at fire."' },
      { id: 'd', text: 'Wait until bar 1 closes before entering &mdash; let the move confirm before committing.', correct: false, explain: 'Waiting for bar 1 close defeats the purpose of entering at the diamond. By bar 1 close, the breakout has already moved 0.3-0.7 ATR &mdash; you\'ve given up R for nothing. The diamond IS the engine\'s confirmation; bar 1 confirmation is just lower R:R chasing. The framework targets the diamond-close entry; deviating from that produces different (worse) trade economics.' },
    ],
  },
  {
    id: 'g4',
    scenario: 'You entered a Long at a CONFIRMED-quality bull diamond on NAS100 1h. The 5-bar tracker reads: <strong class="text-white">Bar 1: SLOW (+0.3 ATR) · Bar 2: MOVING (+0.4 ATR) · Bar 3: STALLED (+0.1 ATR)</strong>. Two more bars to go before the official verdict at bar 5.',
    prompt: 'What do you do?',
    options: [
      { id: 'a', text: 'Wait for bar 5 official verdict &mdash; don&apos;t exit on early-bar reads.', correct: false, explain: 'Waiting for bar 5 means accepting that DUD verdicts will be -0.5R to -1R loss instead of -0.1R clean exits. Bar 3 STALLED is the empirically-strongest exit signal in the entire framework. STALLED-bar-3 trades reverse against the breakout direction within 4-8 bars in the vast majority of cases. The "official" bar-5 verdict is just confirming what bar 3 already told you. Don\'t wait.' },
      { id: 'b', text: 'Tighten stop to break-even and let it ride to bar 5.', correct: false, explain: 'Half-right (defensive) but still the wrong move. Tightening stop to break-even means you stop on minor noise &mdash; the trade exits at break-even on bar 4 or 5 anyway. Same outcome as exiting at bar 3, but with more chart-watching and more emotional friction. The clean rule is: STALLED at bar 3 = exit immediately. Don\'t engineer alternatives that produce the same outcome with extra steps.' },
      { id: 'c', text: 'Exit immediately at break-even or small loss &mdash; STALLED at bar 3 = DUD verdict locked.', correct: true, explain: '✓ Exactly. STALLED at bar 3 is the framework\'s most asymmetric-payoff lever &mdash; honour it without negotiation. Empirically, STALLED-bar-3 trades produce DUD verdicts with very high probability and frequently reverse against the breakout. Exiting at bar 3 turns -1R losses into -0.1R scratches. Across hundreds of trades this is one of the largest contributors to long-run profitability in coil trading.' },
      { id: 'd', text: 'Add to the position to lower the average entry price and improve R:R.', correct: false, explain: 'Mistake 4 from S15 in catastrophic form. The premise of averaging is "the move is delayed but coming"; the tracker is signalling "the move isn\'t coming." Adding to a STALLED-at-bar-3 trade compounds a soon-to-reverse loss. This is one of the most expensive errors operators make &mdash; turning what would be a -0.1R clean exit into a -2R or -3R disaster.' },
    ],
  },
  {
    id: 'g5',
    scenario: 'You&apos;re scanning a 6-asset watchlist mid-session. <strong class="text-white">XAUUSD 15m has just hit BREAKOUT READY (HIGH energy). BTCUSD 4h is in COILING (HIGH priority). NAS100 1h has a Double Coil ★ flag in COILING.</strong> All three want your attention now.',
    prompt: 'How do you handle three HIGH-priority coils at once?',
    options: [
      { id: 'a', text: 'Trade all three simultaneously &mdash; more setups means more R captured.', correct: false, explain: 'Mistake from S11 \"Max 2 HIGH at once.\" Three simultaneous active coils exceed your attention ceiling. Trying to PLAN, MANAGE, and watch the 5-bar tracker on all three at once degrades MANAGE on every trade. You\'ll miss STALLED signals, exit late, hold DUDs. Better to take 2 trades cleanly than 4 sloppily &mdash; the framework requires attention to work, and attention is finite.' },
      { id: 'b', text: 'Pick the 2 highest-edge setups based on phase + energy + tier; ignore the third.', correct: true, explain: '✓ Exactly. The 2-HIGH attention ceiling is a discipline rule from S11. Of the three, the NAS100 Double Coil ★ is the highest-edge (Playbook 3 territory), the XAUUSD BREAKOUT READY is the most time-sensitive, and the BTCUSD COILING is the least urgent. The right call is take NAS100 + XAUUSD, ignore BTCUSD &mdash; even though BTCUSD is "tradeable in isolation." The discipline preserves quality of execution across the trades you DO take.' },
      { id: 'c', text: 'Set alerts on all three and step away &mdash; let CIPHER notify you when something fires.', correct: false, explain: 'Alerts are useful for the SPOT step when you\'re away from charts, but they don\'t replace MANAGE on active trades. By the time the alerts fire, you\'ll be back at three simultaneous fires and the same attention-ceiling problem. The right move is to make the prioritisation decision NOW (during COILING when there\'s time) rather than punting it to alert-driven scrambling.' },
      { id: 'd', text: 'Skip all three &mdash; if multiple coils fire at once it usually means the broader market is choppy.', correct: false, explain: 'Three independent coils on three different asset classes (gold, crypto, indices) firing at the same time is typically a SESSION-OPEN effect or a regime-shift across all assets, not a chop signal. The asset-class diversification of the watchlist is exactly designed to give you independent setup opportunities. Skipping all three because they\'re simultaneous is over-correcting; the right balance is to take the best 2 and skip the third.' },
    ],
  },
];

const quizQuestions: Array<{
  id: string;
  question: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
  explain: string;
}> = [
  {
    id: 'q1',
    question: 'What are the four steps of the Coil Reading Frame, in order?',
    options: [
      { id: 'a', text: 'CLASSIFY → SPOT → PLAN → MANAGE', correct: false },
      { id: 'b', text: 'SPOT → CLASSIFY → PLAN → MANAGE', correct: true },
      { id: 'c', text: 'SPOT → PLAN → CLASSIFY → MANAGE', correct: false },
      { id: 'd', text: 'SPOT → CLASSIFY → MANAGE → PLAN', correct: false },
    ],
    explain: 'SPOT (3s, scan watchlist for amber) → CLASSIFY (5s, phase + energy + tier) → PLAN (10s, stage entry/stop/target during COILING) → MANAGE (live, watch the 5-bar tracker). Each step has its own time budget and depends on the prior step. CLASSIFY before SPOT means classifying without finding; PLAN before CLASSIFY means planning without knowing what to plan for.',
  },
  {
    id: 'q2',
    question: 'Approximately what is the time budget for CLASSIFY?',
    options: [
      { id: 'a', text: '< 1 second', correct: false },
      { id: 'b', text: '~5 seconds', correct: true },
      { id: 'c', text: '~30 seconds', correct: false },
      { id: 'd', text: '1-2 minutes', correct: false },
    ],
    explain: '~5 seconds for a fluent operator (faster &mdash; ~3 seconds &mdash; with reps). Three reads in sequence: phase (1s) + energy (2s) + tier (2s). The reflexes (Wall, Energy, Tier from S04) make CLASSIFY happen on autopilot once trained. Slow CLASSIFY (30+ seconds) means you\'re still rule-checking instead of reflex-reading.',
  },
  {
    id: 'q3',
    question: 'Which Reading Reflex maps a single visual signal directly to phase?',
    options: [
      { id: 'a', text: 'Wall Reflex &mdash; brightness of the box walls → phase', correct: true },
      { id: 'b', text: 'Energy Reflex &mdash; the Volatility row text → phase', correct: false },
      { id: 'c', text: 'Tier Reflex &mdash; the Ribbon row → phase', correct: false },
      { id: 'd', text: 'Shape Reflex &mdash; the size of the Coil Box → phase', correct: false },
    ],
    explain: 'Wall Reflex. From L11.14 S04 box styling: faint walls = BUILDING, medium walls = COILING, solid bright walls = BREAKOUT READY. The Pine transparency values (55 → 30 → 10) make the visual progression sharp. Energy Reflex maps to ENERGY class. Tier Reflex maps to single-vs-Double. Each reflex has one specific visual-to-decision mapping.',
  },
  {
    id: 'q4',
    question: 'Where do all three coil playbooks place the stop-loss?',
    options: [
      { id: 'a', text: 'A fixed 1 ATR below entry', correct: false },
      { id: 'b', text: 'Below the recent swing low', correct: false },
      { id: 'c', text: 'Just outside the Coil Box on the opposite side of breakout direction', correct: true },
      { id: 'd', text: 'Below the Pulse line at fire bar', correct: false },
    ],
    explain: 'Just outside the Coil Box, opposite breakout direction. Universal across all three playbooks (Standard, High-Energy, Double Coil). The box itself is the structural invalidation point &mdash; if price re-enters the box and closes through the opposite wall, the breakout has failed. Fixed-distance and swing-based stops produce different R:R that doesn\'t match the playbook expectations.',
  },
  {
    id: 'q5',
    question: 'The 5-bar tracker reads STALLED at bar 3. The fire-bar quality was CONFIRMED. What\'s the right action?',
    options: [
      { id: 'a', text: 'Hold &mdash; CONFIRMED quality means the tracker will catch up', correct: false },
      { id: 'b', text: 'Add to the position &mdash; DCA the entry', correct: false },
      { id: 'c', text: 'Exit immediately at break-even or small loss', correct: true },
      { id: 'd', text: 'Wait for bar 5 official verdict', correct: false },
    ],
    explain: 'Exit immediately. STALLED at bar 3 is the strongest exit signal in the framework. Even a CONFIRMED-quality fire-bar can produce a DUD if the post-fire follow-through fails &mdash; the tracker sees what the fire-bar quality couldn\'t predict. Empirically, STALLED-bar-3 trades reverse against the breakout direction within 4-8 bars in the vast majority of cases. Exiting at bar 3 turns -1R losses into -0.1R scratches. The bar-3 STALLED rule is the framework\'s biggest asymmetric-payoff lever.',
  },
  {
    id: 'q6',
    question: 'Which CIPHER alert fires BEFORE a coil breakout, giving you time to PLAN?',
    options: [
      { id: 'a', text: 'Squeeze Breakout', correct: false },
      { id: 'b', text: 'Double Coil', correct: true },
      { id: 'c', text: 'Pre-Squeeze Warning', correct: false },
      { id: 'd', text: 'BREAKOUT READY phase advance', correct: false },
    ],
    explain: 'Double Coil. The Pine alert fires on dc_just_started = true &mdash; the bar a Double Coil first activates, BEFORE the breakout. This gives you time to engage the 4-step frame (CLASSIFY → PLAN). Squeeze Breakout fires AT the diamond drop (after the breakout, not before). The other two options aren\'t built-in alerts in CIPHER PRO &mdash; pre-squeeze and phase advances would need custom alert conditions.',
  },
  {
    id: 'q7',
    question: 'How many simultaneous HIGH-priority active coils should you actively monitor at once?',
    options: [
      { id: 'a', text: 'As many as appear &mdash; never miss a setup', correct: false },
      { id: 'b', text: 'A maximum of 2', correct: true },
      { id: 'c', text: 'Only 1 &mdash; never split attention', correct: false },
      { id: 'd', text: 'Up to 6, one per watchlist asset', correct: false },
    ],
    explain: '2 maximum (from S11). Three or more active HIGH-priority coils exceed your attention ceiling. Trying to PLAN, MANAGE, and watch the 5-bar tracker on 3+ trades simultaneously degrades MANAGE on every trade. Better to take 2 cleanly than 4 sloppily. The 2-HIGH ceiling is a discipline, not a frequency target. Pick the 2 highest-edge setups (best phase + energy + tier) and ignore the rest.',
  },
  {
    id: 'q8',
    question: 'In which step of the 4-step frame does PLAN happen?',
    options: [
      { id: 'a', text: 'During BUILDING phase &mdash; as soon as the coil appears', correct: false },
      { id: 'b', text: 'During COILING phase &mdash; before BREAKOUT READY arrives', correct: true },
      { id: 'c', text: 'After the diamond fires &mdash; you respond to the actual direction', correct: false },
      { id: 'd', text: 'After bar 1 of the tracker &mdash; let early movement confirm', correct: false },
    ],
    explain: 'During COILING. The principle: do the thinking during the slow phase (COILING) so the fast phase (fire bar) requires only execution. PLAN at BUILDING is too early &mdash; most BUILDING coils never advance to a tradeable phase. PLAN after fire is too late &mdash; price has already moved 0.5-1.0R in the breakout direction and your R:R is degraded. PLAN during COILING means orders are pre-staged, click is reflexive at fire, R:R matches the playbook expectations.',
  },
];

// ============================================================
// ANIMSCENE — shared canvas component, IntersectionObserver gated
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
// CONFETTI — for certificate reveal
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
// ANIMATION 1 — FourStepFrameAnim (S01 Groundbreaking Concept)
// "The 4-Step Coil Reading Frame"
//
// Horizontal pipeline of 4 stages: SPOT · CLASSIFY · PLAN · MANAGE.
// Each stage takes a beat with its micro-actions. A live chart at the
// top shows the workflow operating on a real-feeling coil.
// ============================================================
function FourStepFrameAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 4-STEP COIL READING FRAME', w / 2, 22);

    const steps = [
      {
        num: '1',
        name: 'SPOT',
        action: 'Scan for amber',
        timing: '3s',
        color: AMBER,
      },
      {
        num: '2',
        name: 'CLASSIFY',
        action: 'Phase · Energy · Tier',
        timing: '5s',
        color: ORANGE,
      },
      {
        num: '3',
        name: 'PLAN',
        action: 'Stage entry · stop · target',
        timing: '10s',
        color: AMBER,
      },
      {
        num: '4',
        name: 'MANAGE',
        action: 'Watch the 5-bar tracker',
        timing: 'Live',
        color: TEAL,
      },
    ];

    // Cycle: 16s loop. 4s per step. Live chart on top, step pipeline at bottom.
    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const focusIdx = Math.floor(cycleT / 4);

    // ── Top chart showing the workflow ──
    const padX = 24;
    const chartTop = 44;
    const chartH = (h - chartTop) * 0.5;
    const chartBot = chartTop + chartH;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price + coil developing
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 8) amp = 8;
      else if (i < 30) amp = 8 - (i - 8) * 0.3;
      else if (i < 33) amp = 1.5;
      else { amp = 2; level = 50 + (i - 33) * 1.6; }
      prices.push(level + Math.sin(i * 0.6) * amp + Math.sin(i * 1.4) * amp * 0.3);
    }

    const minP = 35;
    const maxP = 70;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // Draw progressively based on focusIdx
    // Step 1 SPOT: chart up to bar 25 (BUILDING/COILING coil visible but no annotation)
    // Step 2 CLASSIFY: through 30 (COILING) with classify info overlay
    // Step 3 PLAN: through 33 (BREAKOUT READY just before fire) with entry/stop/target lines
    // Step 4 MANAGE: through end with diamond + tracker dots
    const cursor = focusIdx === 0 ? 25 : focusIdx === 1 ? 30 : focusIdx === 2 ? 33 : N - 1;

    // Coil Box (visible from bar 12)
    const sqStart = 12;
    const sqEnd = focusIdx >= 3 ? 33 : Math.min(cursor, 33);
    if (cursor >= sqStart) {
      let highest = -Infinity, lowest = Infinity;
      for (let i = sqStart; i <= sqEnd; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }
      const boxLeft = xScale(sqStart);
      const boxRight = xScale(sqEnd);
      const boxTop = yScale(highest + 1);
      const boxBot = yScale(lowest - 1);

      const phaseAtBar = sqEnd - sqStart;
      const wallAlpha = phaseAtBar > 12 ? 0.9 : phaseAtBar > 5 ? 0.7 : 0.45;
      const fillAlpha = phaseAtBar > 12 ? 0.18 : phaseAtBar > 5 ? 0.12 : 0.07;

      ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
      ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
      ctx.lineWidth = phaseAtBar > 12 ? 2 : 1.5;
      ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    }

    // Plan overlay during step 3 (entry/stop/target lines)
    if (focusIdx === 2 || focusIdx === 3) {
      // Entry line
      const entryY = yScale(prices[33] + 0.5);
      // Stop line just below box bottom
      let lowest = Infinity;
      for (let i = sqStart; i <= 32; i++) if (prices[i] < lowest) lowest = prices[i];
      const stopY = yScale(lowest - 1.5);
      // Target line
      const targetY = entryY - chartH * 0.35;

      [
        { y: entryY, color: TEAL, label: 'ENTRY' },
        { y: stopY, color: '#EF5350', label: 'STOP' },
        { y: targetY, color: AMBER, label: 'TARGET' },
      ].forEach((line) => {
        ctx.strokeStyle = `${line.color}aa`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(chartLeft + 6, line.y);
        ctx.lineTo(chartRight - 6, line.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = line.color;
        ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(line.label, chartRight - 8, line.y - 3);
      });
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Diamond + tracker dots during MANAGE
    if (focusIdx >= 3) {
      const dx = xScale(33);
      const dy = yScale(prices[33]) + 12;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();

      // 5-bar tracker dots
      const trackerProg = (cycleT - 12) / 4;
      const showTrackerBars = Math.min(5, Math.floor(trackerProg * 5));
      for (let tb = 1; tb <= showTrackerBars; tb++) {
        const tx = xScale(33 + tb);
        const ty = yScale(prices[33 + tb]);
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Bottom: 4-step pipeline ──
    const pipeTop = chartBot + 18;
    const pipeBot = h - 30;
    const pipeH = pipeBot - pipeTop;
    const stepW = (chartW - (steps.length - 1) * 8) / steps.length;

    steps.forEach((step, i) => {
      const sx = chartLeft + i * (stepW + 8);
      const isFocus = i === focusIdx;
      const isPast = i < focusIdx;

      // Card
      ctx.fillStyle = isFocus ? `${step.color}33` : isPast ? `${step.color}11` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? step.color : isPast ? `${step.color}55` : FAINT;
      ctx.lineWidth = isFocus ? 1.8 : 1;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(sx + r, pipeTop);
      ctx.lineTo(sx + stepW - r, pipeTop);
      ctx.quadraticCurveTo(sx + stepW, pipeTop, sx + stepW, pipeTop + r);
      ctx.lineTo(sx + stepW, pipeBot - r);
      ctx.quadraticCurveTo(sx + stepW, pipeBot, sx + stepW - r, pipeBot);
      ctx.lineTo(sx + r, pipeBot);
      ctx.quadraticCurveTo(sx, pipeBot, sx, pipeBot - r);
      ctx.lineTo(sx, pipeTop + r);
      ctx.quadraticCurveTo(sx, pipeTop, sx + r, pipeTop);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Number badge
      ctx.fillStyle = isFocus ? step.color : DIM;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.num, sx + stepW / 2, pipeTop + 24);

      // Step name
      ctx.fillStyle = isFocus ? step.color : isPast ? WHITE : DIM;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(step.name, sx + stepW / 2, pipeTop + 42);

      // Action
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(step.action, sx + stepW / 2, pipeTop + 58);

      // Timing
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(step.timing, sx + stepW / 2, pipeBot - 8);

      // Arrow to next step
      if (i < steps.length - 1) {
        const arrowX = sx + stepW + 4;
        const arrowY = pipeTop + pipeH / 2;
        ctx.strokeStyle = isPast || isFocus ? AMBER : FAINT;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 4, arrowY);
        ctx.stroke();
        ctx.fillStyle = isPast || isFocus ? AMBER : FAINT;
        ctx.beginPath();
        ctx.moveTo(arrowX + 4, arrowY);
        ctx.lineTo(arrowX, arrowY - 2);
        ctx.lineTo(arrowX, arrowY + 2);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOT → CLASSIFY → PLAN → MANAGE  ·  the operator\'s rhythm', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — SpotScanAnim (S02)
// "The 3-second visual scan"
//
// Multi-asset watchlist. Eye sweeps left-to-right looking for amber.
// Asset 3 has an active coil — eye stops on it, zoom pop on the chart.
// ============================================================
function SpotScanAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STEP 1  ·  SPOT  ·  scan for amber across the watchlist', w / 2, 22);

    // 6 watchlist assets in a 2x3 grid. Asset at index 2 (top-right) has an active coil.
    const assets = [
      { name: 'XAUUSD', tf: '15m', hasCoil: false, vol: 'EXPANDING' },
      { name: 'EURUSD', tf: '15m', hasCoil: false, vol: 'NORMAL' },
      { name: 'BTCUSD', tf: '4h', hasCoil: true, vol: '78% COILING' },
      { name: 'NAS100', tf: '1h', hasCoil: false, vol: 'CONTRACTING' },
      { name: 'AAPL', tf: '15m', hasCoil: false, vol: 'NORMAL' },
      { name: 'USDJPY', tf: '15m', hasCoil: false, vol: 'NORMAL' },
    ];

    const padX = 18;
    const gridTop = 44;
    const gridBot = h - 60;
    const gridH = gridBot - gridTop;
    const cols = 3;
    const rows = 2;
    const tileGap = 8;
    const tileW = (w - padX * 2 - (cols - 1) * tileGap) / cols;
    const tileH = (gridH - (rows - 1) * tileGap) / rows;

    // Eye sweep: 8s loop. Eye moves left-to-right top row, then bottom row.
    // 1.2s per asset. Stops at index 2 for full attention.
    const cycleSec = 9;
    const cycleT = t % cycleSec;
    const eyePerAsset = 1.0;
    let eyeIdx = Math.min(assets.length - 1, Math.floor(cycleT / eyePerAsset));

    // When eye reaches the coil-bearing asset (idx 2), it stops and dwells
    if (eyeIdx >= 2) eyeIdx = 2;
    const dwellingOnCoil = cycleT >= 2 * eyePerAsset && cycleT < 7;

    assets.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = padX + col * (tileW + tileGap);
      const ty = gridTop + row * (tileH + tileGap);

      const isEye = i === eyeIdx && cycleT < (i + 1) * eyePerAsset + (dwellingOnCoil && i === 2 ? 5 : 0);
      const focusOnCoil = i === 2 && dwellingOnCoil;

      // Tile background
      ctx.fillStyle = focusOnCoil ? `${AMBER}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = focusOnCoil ? AMBER : isEye ? AMBER : FAINT;
      ctx.lineWidth = focusOnCoil ? 2 : isEye ? 1.5 : 1;
      ctx.fillRect(tx, ty, tileW, tileH);
      ctx.strokeRect(tx, ty, tileW, tileH);

      // Asset name + TF
      ctx.fillStyle = focusOnCoil ? AMBER : WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(a.name, tx + 8, ty + 14);
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(a.tf, tx + 8, ty + 24);

      // Mini chart in tile
      const chartTop = ty + 30;
      const chartBot = ty + tileH - 22;
      const chartLeft = tx + 8;
      const chartRight = tx + tileW - 8;
      const chartHt = chartBot - chartTop;
      const chartWd = chartRight - chartLeft;

      const N = 30;
      const seedOffset = i * 17;
      const prices: number[] = [];
      for (let k = 0; k < N; k++) {
        const phase = (k + seedOffset) * 0.5;
        const amp = a.hasCoil
          ? (k < 8 ? 6 : k < 22 ? 6 - (k - 8) * 0.35 : 1.5)
          : a.vol === 'CONTRACTING' ? (6 - k * 0.1)
          : a.vol === 'EXPANDING' ? (3 + k * 0.15)
          : 4;
        prices.push(50 + Math.sin(phase) * amp + Math.sin(phase * 2) * amp * 0.3);
      }

      const minP = 38;
      const maxP = 62;
      const yScl = (p: number) => chartTop + ((maxP - p) / (maxP - minP)) * chartHt;
      const xScl = (k: number) => chartLeft + (k / (N - 1)) * chartWd;

      // Coil Box on coil-bearing asset
      if (a.hasCoil) {
        let highest = -Infinity, lowest = Infinity;
        for (let k = 8; k < 22; k++) {
          if (prices[k] > highest) highest = prices[k];
          if (prices[k] < lowest) lowest = prices[k];
        }
        const boxLeft = xScl(8);
        const boxRight = xScl(22);
        const boxTop = yScl(highest + 1);
        const boxBot = yScl(lowest - 1);

        const wallAlpha = focusOnCoil ? 0.85 : 0.6;
        const fillAlpha = focusOnCoil ? 0.18 : 0.10;
        ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
        ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
        ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      }

      // Price line
      ctx.strokeStyle = focusOnCoil ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const x = xScl(k);
        const y = yScl(prices[k]);
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Vol state at bottom
      ctx.fillStyle = a.hasCoil ? AMBER : DIM;
      ctx.font = a.hasCoil ? 'bold 7px Inter, sans-serif' : '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.vol, tx + tileW / 2, ty + tileH - 6);
    });

    // Eye cursor — round circle that moves through the assets
    const eyeAsset = assets[eyeIdx];
    const eyeCol = eyeIdx % cols;
    const eyeRow = Math.floor(eyeIdx / cols);
    const eyeX = padX + eyeCol * (tileW + tileGap) + tileW / 2;
    const eyeY = gridTop + eyeRow * (tileH + tileGap) + tileH / 2;

    if (dwellingOnCoil) {
      // Pulsing eye on the coil asset
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 5);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 16 + pulseAmt * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bottom verdict
    ctx.fillStyle = dwellingOnCoil ? AMBER : DIM;
    ctx.font = dwellingOnCoil ? 'bold 10px Inter, sans-serif' : '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (dwellingOnCoil) {
      ctx.fillText(`SPOTTED  ·  ${eyeAsset.name} ${eyeAsset.tf}  ·  ${eyeAsset.vol}`, w / 2, h - 26);
      ctx.fillStyle = WHITE;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Active coil identified — proceed to CLASSIFY', w / 2, h - 12);
    } else {
      ctx.fillText('Sweep eye left-to-right, top-to-bottom. Look for amber.', w / 2, h - 12);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — ClassifyAnim (S03)
// "Step 2 — CLASSIFY: phase, energy, tier"
//
// Three readouts populate in sequence with a 1-second beat each:
// PHASE (BUILDING/COILING/READY), ENERGY (LOW..EXTREME), TIER (single/Double).
// Eye snapshot of the chart on the left, classification card on the right.
// ============================================================
function ClassifyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STEP 2  ·  CLASSIFY  ·  phase + energy + tier in 5 seconds', w / 2, 22);

    // Layout: chart on left ~55%, classify card on right ~45%
    const padX = 22;
    const chartTop = 44;
    const chartBot = h - 30;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = (w - padX * 3) * 0.5;
    const chartRight = chartLeft + chartW;

    const cardLeft = chartRight + padX;
    const cardW = w - cardLeft - padX;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Mini chart with active coil
    const N = 40;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      if (i < 10) amp = 7;
      else if (i < 32) amp = 7 - (i - 10) * 0.27;
      else amp = 1.5;
      prices.push(50 + Math.sin(i * 0.55) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 38;
    const maxP = 62;
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // Coil Box (BREAKOUT READY phase)
    const sqStart = 12;
    const sqEnd = N - 1;
    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    // Pulsing wall to emphasise the box
    const cyclePulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(255, 179, 0, 0.18)`;
    ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.strokeStyle = `rgba(255, 107, 0, ${0.7 + cyclePulse * 0.3})`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = ORANGE;
    ctx.shadowBlur = 4 + cyclePulse * 4;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.shadowBlur = 0;

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mini chart label
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BTCUSD 4h  ·  active coil', chartLeft + 6, chartTop + 14);

    // ── Classification card on right ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(cardLeft, chartTop, cardW, chartH);
    ctx.strokeRect(cardLeft, chartTop, cardW, chartH);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLASSIFY', cardLeft + cardW / 2, chartTop + 16);

    // 3 rows: PHASE, ENERGY, TIER. Reveal sequentially.
    const cycleSec = 7;
    const cycleT = t % cycleSec;
    const showPhase = cycleT >= 1;
    const showEnergy = cycleT >= 2.5;
    const showTier = cycleT >= 4;

    const rowTop = chartTop + 30;
    const rowH = (chartH - 50) / 3;

    type Row = { label: string; value: string; sub: string; color: string; show: boolean };
    const rows: Row[] = [
      { label: 'PHASE', value: 'BREAKOUT READY', sub: '14 effective_bars', color: ORANGE, show: showPhase },
      { label: 'ENERGY', value: 'HIGH', sub: 'score 73 / 100', color: ORANGE, show: showEnergy },
      { label: 'TIER', value: '★ DOUBLE COIL', sub: 'Ribbon + BB/KC both', color: TEAL, show: showTier },
    ];

    rows.forEach((r, i) => {
      const ry = rowTop + i * rowH;
      ctx.fillStyle = r.show ? `${r.color}11` : 'transparent';
      ctx.strokeStyle = r.show ? `${r.color}66` : FAINT;
      ctx.lineWidth = 1;
      ctx.fillRect(cardLeft + 6, ry, cardW - 12, rowH - 6);
      ctx.strokeRect(cardLeft + 6, ry, cardW - 12, rowH - 6);

      ctx.fillStyle = r.show ? r.color : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, cardLeft + 14, ry + 14);

      if (r.show) {
        ctx.fillStyle = r.color;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(r.value, cardLeft + cardW - 14, ry + 18);

        ctx.fillStyle = DIM;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(r.sub, cardLeft + cardW - 14, ry + rowH - 12);
      } else {
        ctx.fillStyle = DIM;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('...', cardLeft + cardW - 14, ry + 18);
      }
    });

    // Final verdict
    if (cycleT >= 5.5) {
      const vY = chartBot - 28;
      ctx.fillStyle = `${TEAL}22`;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1;
      ctx.fillRect(cardLeft + 6, vY, cardW - 12, 22);
      ctx.strokeRect(cardLeft + 6, vY, cardW - 12, 22);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROCEED TO PLAN', cardLeft + cardW / 2, vY + 14);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Phase from wall brightness · Energy from Volatility row · Tier from Ribbon row', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — ReadingReflexesAnim (S04)
// "The 3 reading reflexes"
//
// Three reflex cards cycling: Wall Reflex (instinctive phase read from wall
// brightness), Energy Reflex (read Volatility row in 1 glance), Tier Reflex
// (Ribbon row tells you single vs Double Coil).
// ============================================================
function ReadingReflexesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE 3 READING REFLEXES  ·  build the scan habit', w / 2, 22);

    const reflexes = [
      {
        num: '1',
        name: 'WALL REFLEX',
        signal: 'Brightness of the box walls',
        learns: 'Phase (BUILDING / COILING / READY) at a glance',
        speed: '< 1 second',
        color: AMBER,
      },
      {
        num: '2',
        name: 'ENERGY REFLEX',
        signal: 'Volatility & Squeeze row text',
        learns: 'Compression % + phase label + guidance',
        speed: '1 second',
        color: ORANGE,
      },
      {
        num: '3',
        name: 'TIER REFLEX',
        signal: 'Ribbon row reads DOUBLE COIL',
        learns: 'Single coil vs ★ Double Coil (highest edge)',
        speed: '1 second',
        color: TEAL,
      },
    ];

    const cycleT = t % (reflexes.length * 4);
    const focusIdx = Math.floor(cycleT / 4);

    const padX = 18;
    const cardTop = 44;
    const cardBot = h - 50;
    const cardH = cardBot - cardTop;
    const cardGap = 10;
    const cardW = (w - padX * 2 - cardGap * 2) / 3;

    reflexes.forEach((r, i) => {
      const cx = padX + i * (cardW + cardGap);
      const cy = cardTop;
      const isFocus = i === focusIdx;

      ctx.fillStyle = isFocus ? `${r.color}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? r.color : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      const rd = 6;
      ctx.beginPath();
      ctx.moveTo(cx + rd, cy);
      ctx.lineTo(cx + cardW - rd, cy);
      ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + rd);
      ctx.lineTo(cx + cardW, cy + cardH - rd);
      ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - rd, cy + cardH);
      ctx.lineTo(cx + rd, cy + cardH);
      ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - rd);
      ctx.lineTo(cx, cy + rd);
      ctx.quadraticCurveTo(cx, cy, cx + rd, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Number
      ctx.fillStyle = isFocus ? r.color : DIM;
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.num, cx + cardW / 2, cy + 32);

      // Name
      ctx.fillStyle = isFocus ? r.color : WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(r.name, cx + cardW / 2, cy + 50);

      // SIGNAL section
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SIGNAL', cx + 10, cy + 70);
      ctx.fillStyle = isFocus ? 'rgba(255,255,255,0.78)' : DIM;
      ctx.font = '8px Inter, sans-serif';
      // Word-wrap signal
      const sigWords = r.signal.split(' ');
      let sLine1 = '', sLine2 = '';
      const sMax = 22;
      for (const w of sigWords) {
        if (sLine1.length + w.length + 1 <= sMax) sLine1 += (sLine1 ? ' ' : '') + w;
        else sLine2 += (sLine2 ? ' ' : '') + w;
      }
      ctx.fillText(sLine1, cx + 10, cy + 84);
      if (sLine2) ctx.fillText(sLine2, cx + 10, cy + 94);

      // LEARNS section
      const learnsY = sLine2 ? cy + 112 : cy + 102;
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText('LEARNS', cx + 10, learnsY);
      ctx.fillStyle = isFocus ? 'rgba(255,255,255,0.78)' : DIM;
      ctx.font = '8px Inter, sans-serif';
      // Word-wrap learns into 2 lines
      const learnsWords = r.learns.split(' ');
      let lLine1 = '', lLine2 = '';
      for (const w of learnsWords) {
        if (lLine1.length + w.length + 1 <= sMax) lLine1 += (lLine1 ? ' ' : '') + w;
        else lLine2 += (lLine2 ? ' ' : '') + w;
      }
      ctx.fillText(lLine1, cx + 10, learnsY + 14);
      if (lLine2) ctx.fillText(lLine2, cx + 10, learnsY + 24);

      // Speed pill
      ctx.fillStyle = isFocus ? `${r.color}33` : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = isFocus ? r.color : FAINT;
      ctx.lineWidth = 1;
      const pillH = 16;
      const pillY = cardBot - pillH - 8;
      ctx.fillRect(cx + 10, pillY, cardW - 20, pillH);
      ctx.strokeRect(cx + 10, pillY, cardW - 20, pillH);
      ctx.fillStyle = isFocus ? r.color : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.speed, cx + cardW / 2, pillY + 11);
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three reflexes layered together = full classify in 5 seconds.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — PlanStagingAnim (S05 — Step 3: PLAN)
// During COILING, operator stages entry/stop/target.
// 3-stage build: entry (at hypothetical diamond) → stop (just below box)
// → target (1.5R or 2.5R based on tier). Each stage gets visual treatment.
// ============================================================
function PlanStagingAnim() {
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
    ctx.fillText('STEP 3  ·  PLAN  ·  stage entry, stop, target during COILING', w / 2, 22);

    // 12s loop, 4 stages × 3s each
    // Stage 0: chart with active COILING coil, no plan yet (3s)
    // Stage 1: entry line drawn at hypothetical diamond close (3s)
    // Stage 2: stop line drawn just below box (3s)
    // Stage 3: target line drawn at 1.5R (3s)
    const cycleSec = 12;
    const cycleT = t % cycleSec;
    const stage = Math.floor(cycleT / 3);

    // Layout
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 90;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price compressing into a coil — no breakout yet (we're in COILING)
    const N = 40;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      if (i < 8) amp = 7;
      else if (i < 30) amp = 7 - (i - 8) * 0.27;
      else amp = 1.5;
      prices.push(50 + Math.sin(i * 0.5) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 38;
    const maxP = 62;
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 8 + (i / (N - 1)) * (chartW - 16);

    // Coil Box — COILING phase
    const sqStart = 12;
    const sqEnd = N - 1;
    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    // COILING styling (medium walls)
    ctx.fillStyle = `rgba(255, 179, 0, 0.12)`;
    ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.strokeStyle = `rgba(255, 179, 0, 0.7)`;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);

    // Hypothetical entry point — at the right edge (next bar after coil)
    const entryX = xScale(N - 1);
    const entryPriceY = yScale(prices[N - 1]);

    // Entry line (Stage 1+)
    if (stage >= 1) {
      const lineProgress = stage === 1 ? Math.min(1, (cycleT - 3) / 1.0) : 1;
      const entryX2 = chartLeft + 8 + (chartW - 16) * lineProgress;

      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, entryPriceY);
      ctx.lineTo(entryX2, entryPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ENTRY  (at diamond close)', chartRight - 10, entryPriceY - 4);
    }

    // Stop line (Stage 2+) — just below box bottom
    const stopY = boxBot + 8;
    if (stage >= 2) {
      const lineProgress = stage === 2 ? Math.min(1, (cycleT - 6) / 1.0) : 1;
      const stopX2 = chartLeft + 8 + (chartW - 16) * lineProgress;

      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, stopY);
      ctx.lineTo(stopX2, stopY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('STOP  (just below box)', chartRight - 10, stopY + 13);
    }

    // Target line (Stage 3+) — 1.5R above entry
    const riskDist = stopY - entryPriceY;
    const targetY = entryPriceY - Math.abs(riskDist) * 1.5;
    if (stage >= 3) {
      const lineProgress = Math.min(1, (cycleT - 9) / 1.0);
      const targetX2 = chartLeft + 8 + (chartW - 16) * lineProgress;

      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, targetY);
      ctx.lineTo(targetX2, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('TARGET  (1.5R)', chartRight - 10, targetY - 4);
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Status box at bottom
    const statusTop = chartBot + 12;
    const statusH = 60;

    const stageLabels = [
      { label: 'COIL ACTIVE  ·  PLAN PHASE', detail: 'Coil is COILING. You have time to plan. No fire yet.', color: AMBER },
      { label: '1. ENTRY STAGED', detail: 'Entry will trigger at diamond close — engine commits direction', color: TEAL },
      { label: '2. STOP STAGED', detail: 'Stop just below box bottom — universal across all coil playbooks', color: MAGENTA },
      { label: '3. TARGET STAGED  ·  PLAN COMPLETE', detail: 'Target 1.5R for standard, 2.5R for HIGH energy or Double Coil', color: AMBER },
    ];
    const sl = stageLabels[stage];

    ctx.fillStyle = `${sl.color}22`;
    ctx.strokeStyle = sl.color;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, statusTop, w - padX * 2, statusH);
    ctx.strokeRect(padX, statusTop, w - padX * 2, statusH);
    ctx.fillStyle = sl.color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sl.label, w / 2, statusTop + 22);
    ctx.fillStyle = WHITE;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(sl.detail, w / 2, statusTop + 42);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAN happens during COILING. Orders staged before BREAKOUT READY arrives.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — ManageLiveAnim (S06 — Step 4: MANAGE)
// 5-bar tracker live. Each bar prints with its tracker status.
// At bar 3 STALLED, exit signal lights up. Otherwise continue.
// ============================================================
function ManageLiveAnim() {
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
    ctx.fillText('STEP 4  ·  MANAGE  ·  watch the 5-bar tracker live', w / 2, 22);

    // Cycle: 3 scenarios (RUNNER / NORMAL / DUD-with-exit-at-bar-3) × 6s each
    const scenarios = [
      {
        name: 'RUNNER',
        travels: [0, 0.5, 0.9, 1.3, 1.6, 1.9],
        statuses: ['', 'MOVING', 'RUNNING 0.9', 'RUNNING 1.3', 'RUNNING 1.6', 'RUNNER ✓'],
        finalAction: 'CONTINUE RIDING — trail wider, hold for full target',
        finalColor: TEAL,
      },
      {
        name: 'NORMAL',
        travels: [0, 0.2, 0.4, 0.55, 0.6, 0.65],
        statuses: ['', 'SLOW', 'MOVING', 'MOVING', 'SLOW', 'NORMAL'],
        finalAction: 'MANAGE CAREFULLY — scratch at break-even or take small profit',
        finalColor: AMBER,
      },
      {
        name: 'DUD',
        travels: [0, 0.1, 0.05, 0.0, -0.1, -0.2],
        statuses: ['', 'SLOW', 'STALLED', 'STALLED', 'STALLED', 'DUD ✗'],
        finalAction: 'EXIT IMMEDIATELY — STALLED at bar 3, do not hold',
        finalColor: MAGENTA,
      },
    ];

    const cycleT = t % (scenarios.length * 6);
    const idx = Math.floor(cycleT / 6);
    const sc = scenarios[idx];
    const subT = cycleT % 6;
    const cursor = Math.min(5, Math.floor(subT));
    // For DUD, light up exit-trigger after bar 3
    const exitTrigger = idx === 2 && cursor >= 3;

    // Layout: chart on top, 5-bar tracker below
    const padX = 24;
    const chartTop = 48;
    const chartH = 130;
    const chartBot = chartTop + chartH;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price line: pre-fire compression (3 bars) + 5 post-fire bars
    const N = 10;
    const fireBar = 1;
    const prices: number[] = [];
    const basePrice = 50;
    for (let i = 0; i < N; i++) {
      if (i < fireBar) {
        prices.push(basePrice + Math.sin(i * 1.2) * 0.6);
      } else if (i <= fireBar + 5) {
        const trackerIdx = i - fireBar;
        if (trackerIdx <= cursor) {
          prices.push(basePrice + sc.travels[trackerIdx] * 8);
        } else {
          prices.push(basePrice);
        }
      } else {
        prices.push(prices[i - 1]);
      }
    }

    const minP = 38;
    const maxP = 62;
    const yScale = (p: number) => chartTop + 12 + ((maxP - p) / (maxP - minP)) * (chartH - 24);
    const xScale = (i: number) => chartLeft + 30 + (i / (N - 1)) * (chartW - 50);

    // Diamond at fire bar
    const fireX = xScale(fireBar);
    const fireY = yScale(prices[fireBar]) + 12;

    // Fire-bar vertical line
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(fireX, chartTop + 4);
    ctx.lineTo(fireX, chartBot - 4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Diamond
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.moveTo(fireX, fireY);
    ctx.lineTo(fireX + 5, fireY + 5);
    ctx.lineTo(fireX, fireY + 10);
    ctx.lineTo(fireX - 5, fireY + 5);
    ctx.closePath();
    ctx.fill();

    // Threshold lines
    const runnerY = yScale(basePrice + 1.0 * 8);
    const dudY = yScale(basePrice + 0.3 * 8);
    ctx.strokeStyle = `${TEAL}88`;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(fireX, runnerY);
    ctx.lineTo(chartRight - 6, runnerY);
    ctx.stroke();
    ctx.strokeStyle = `${AMBER}88`;
    ctx.beginPath();
    ctx.moveTo(fireX, dudY);
    ctx.lineTo(chartRight - 6, dudY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = TEAL;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+1.0 RUNNER', chartRight - 8, runnerY - 3);
    ctx.fillStyle = AMBER;
    ctx.fillText('+0.3 DUD', chartRight - 8, dudY - 3);

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= fireBar + cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Cursor dot
    if (cursor > 0) {
      const cx = xScale(fireBar + cursor);
      const cy = yScale(prices[fireBar + cursor]);
      const dotColor = sc.travels[cursor] > 1.0 ? TEAL : sc.travels[cursor] > 0.3 ? AMBER : MAGENTA;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5-bar tracker readout below chart
    const trackerTop = chartBot + 14;
    const trackerH = 50;
    const cellW = (w - padX * 2) / 6;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(padX, trackerTop, w - padX * 2, trackerH);
    ctx.strokeRect(padX, trackerTop, w - padX * 2, trackerH);

    for (let i = 0; i <= 5; i++) {
      const tx = padX + i * cellW;
      const isPast = i <= cursor;

      ctx.fillStyle = isPast ? AMBER : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i === 0 ? 'FIRE' : `+${i}b`, tx + cellW / 2, trackerTop + 14);

      if (isPast && i > 0) {
        const tColor = sc.travels[i] > 1.0 ? TEAL : sc.travels[i] > 0.3 ? AMBER : MAGENTA;
        ctx.fillStyle = tColor;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(`${sc.travels[i] >= 0 ? '+' : ''}${sc.travels[i].toFixed(1)}`, tx + cellW / 2, trackerTop + 28);

        ctx.fillStyle = tColor;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(sc.statuses[i], tx + cellW / 2, trackerTop + 40);
      } else if (i === 0) {
        ctx.fillStyle = AMBER;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText('◆ Diamond', tx + cellW / 2, trackerTop + 28);
      } else {
        ctx.fillStyle = DIM;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText('—', tx + cellW / 2, trackerTop + 28);
      }

      if (i < 5) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx + cellW, trackerTop + 6);
        ctx.lineTo(tx + cellW, trackerTop + trackerH - 6);
        ctx.stroke();
      }
    }

    // Action box at bottom
    const actY = trackerTop + trackerH + 10;
    const actH = 30;

    let actColor = sc.finalColor;
    let actText = '';

    if (exitTrigger && cursor < 5) {
      actColor = MAGENTA;
      actText = '⚠  EXIT NOW  ·  STALLED bar 3 → DUD verdict locked';
    } else if (cursor === 5) {
      actText = sc.finalAction;
    } else if (cursor === 0) {
      actText = 'Diamond just dropped. Watching first 5 bars...';
      actColor = AMBER;
    } else {
      actText = `${sc.statuses[cursor]} (bar ${cursor})  ·  monitoring`;
      actColor = sc.travels[cursor] > 1.0 ? TEAL : sc.travels[cursor] > 0.3 ? AMBER : MAGENTA;
    }

    ctx.fillStyle = `${actColor}22`;
    ctx.strokeStyle = actColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(padX, actY, w - padX * 2, actH);
    ctx.strokeRect(padX, actY, w - padX * 2, actH);
    ctx.fillStyle = actColor;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(actText, w / 2, actY + 19);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STALLED at bar 3 = exit signal. Honour the engine\'s honesty check.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — Example1Anim (S07 — Worked Example 1: Standard Coil)
// Full end-to-end: SPOT → CLASSIFY → PLAN → MANAGE on a Standard coil.
// Single chart with annotations layering as the operator walks the 4 steps.
// Final outcome: clean Playbook 1 trade, +1.5R.
// ============================================================
function Example1Anim() {
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
    ctx.fillText('EXAMPLE 1  ·  STANDARD COIL  ·  Playbook 1 end-to-end', w / 2, 22);

    // 16s loop, 4s per step
    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const step = Math.floor(cycleT / 4);

    // Layout: chart left ~70%, step status right ~30%
    const padX = 22;
    const chartTop = 50;
    const chartBot = h - 30;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = w * 0.65;
    const chartRight = chartLeft + chartW;

    const cardLeft = chartRight + padX;
    const cardW = w - cardLeft - padX;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price + coil + breakout
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 8) amp = 7;
      else if (i < 30) amp = 7 - (i - 8) * 0.3;
      else if (i < 33) { amp = 1.5; level = 50; }
      else { amp = 2; level = 50 + (i - 33) * 1.6; }
      prices.push(level + Math.sin(i * 0.55) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 36;
    const maxP = 70;
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 8 + (i / (N - 1)) * (chartW - 16);

    // Coil Box (Standard, COILING phase visible from step 1+)
    const sqStart = 12;
    const sqEnd = step >= 3 ? 33 : 30;
    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    // Wall styling — COILING then BREAKOUT READY
    const wallAlpha = step >= 1 ? (sqEnd > 32 ? 0.85 : 0.7) : 0.45;
    const fillAlpha = step >= 1 ? (sqEnd > 32 ? 0.18 : 0.12) : 0.07;
    ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
    ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
    ctx.lineWidth = sqEnd > 32 ? 2 : 1.5;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);

    // Step 0 (SPOT): just chart with COILING coil visible
    // Step 1 (CLASSIFY): + classify card on right
    // Step 2 (PLAN): + entry/stop/target lines drawn
    // Step 3 (MANAGE): + diamond + tracker dots

    // PLAN lines (Step 2+)
    if (step >= 2) {
      const entryY = yScale(prices[33] + 1);
      const stopY = yScale(lowest - 2);
      const targetY = yScale(prices[33] + (yScale(lowest - 2) - yScale(prices[33] + 1)) / -8 * 12); // 1.5R above

      // Entry
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, entryY);
      ctx.lineTo(chartRight - 6, entryY);
      ctx.stroke();

      ctx.strokeStyle = MAGENTA;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, stopY);
      ctx.lineTo(chartRight - 6, stopY);
      ctx.stroke();

      ctx.strokeStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, targetY);
      ctx.lineTo(chartRight - 6, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = TEAL;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ENTRY', chartRight - 8, entryY - 3);
      ctx.fillStyle = MAGENTA;
      ctx.fillText('STOP', chartRight - 8, stopY - 3);
      ctx.fillStyle = AMBER;
      ctx.fillText('+1.5R', chartRight - 8, targetY - 3);
    }

    // Diamond + tracker (Step 3)
    if (step >= 3) {
      const dx = xScale(33);
      const dy = yScale(prices[33]) + 12;
      ctx.fillStyle = TEAL;
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tracker dots
      const trackerProg = (cycleT - 12) / 4;
      const showBars = Math.min(5, Math.floor(trackerProg * 5));
      for (let tb = 1; tb <= showBars; tb++) {
        const tx = xScale(33 + tb);
        const ty = yScale(prices[33 + tb]);
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Price line — extends based on step
    const cursor = step === 0 ? 28 : step === 1 ? 30 : step === 2 ? 32 : Math.min(N - 1, 33 + Math.floor((cycleT - 12) * 1.5));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ── Step status card on right ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(cardLeft, chartTop, cardW, chartH);
    ctx.strokeRect(cardLeft, chartTop, cardW, chartH);

    // Card title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STEP ${step + 1}`, cardLeft + cardW / 2, chartTop + 16);

    const stepDetails = [
      { name: 'SPOT', text: 'Amber coil on chart. Active in COILING.', color: AMBER },
      { name: 'CLASSIFY', text: 'COILING · MODERATE energy · single coil', color: AMBER },
      { name: 'PLAN', text: 'Entry at diamond · stop below box · 1.5R target', color: TEAL },
      { name: 'MANAGE', text: 'Diamond ✓ · CONFIRMED · RUNNER · +1.5R', color: TEAL },
    ];
    const sd = stepDetails[step];

    ctx.fillStyle = sd.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(sd.name, cardLeft + cardW / 2, chartTop + 38);

    // Detail text — wrap to 3 lines
    ctx.fillStyle = WHITE;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    const words = sd.text.split(' ');
    let l1 = '', l2 = '', l3 = '';
    const maxC = 22;
    for (const wd of words) {
      if (l1.length + wd.length + 1 <= maxC) l1 += (l1 ? ' ' : '') + wd;
      else if (l2.length + wd.length + 1 <= maxC) l2 += (l2 ? ' ' : '') + wd;
      else l3 += (l3 ? ' ' : '') + wd;
    }
    ctx.fillText(l1, cardLeft + cardW / 2, chartTop + 60);
    if (l2) ctx.fillText(l2, cardLeft + cardW / 2, chartTop + 72);
    if (l3) ctx.fillText(l3, cardLeft + cardW / 2, chartTop + 84);

    // Step progress dots
    const dotsY = chartBot - 50;
    const dotSpace = 18;
    const dotsStart = cardLeft + cardW / 2 - (4 - 1) * dotSpace / 2;
    for (let di = 0; di < 4; di++) {
      const dx = dotsStart + di * dotSpace;
      ctx.fillStyle = di === step ? AMBER : di < step ? TEAL : `${AMBER}33`;
      ctx.beginPath();
      ctx.arc(dx, dotsY, di === step ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Final outcome at bottom of card (only on step 3)
    if (step === 3 && cycleT > 14) {
      ctx.fillStyle = `${TEAL}33`;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1;
      const oY = chartBot - 28;
      ctx.fillRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.strokeRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+1.5R  ·  CLEAN', cardLeft + cardW / 2, oY + 14);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — Example2Anim (S08 — Worked Example 2: Double Coil)
// Full end-to-end: SPOT → CLASSIFY → PLAN → MANAGE on a Double Coil.
// Same structure as Example1 but with ★ DOUBLE COIL classification,
// up-sized position, 2.5R target, RUNNER outcome.
// ============================================================
function Example2Anim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXAMPLE 2  ·  ★ DOUBLE COIL  ·  Playbook 3 end-to-end', w / 2, 22);

    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const step = Math.floor(cycleT / 4);

    const padX = 22;
    const chartTop = 50;
    const chartBot = h - 30;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = w * 0.65;
    const chartRight = chartLeft + chartW;

    const cardLeft = chartRight + padX;
    const cardW = w - cardLeft - padX;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price — bigger move post-fire (Double Coil = larger run)
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 8) amp = 7;
      else if (i < 30) amp = 7 - (i - 8) * 0.3;
      else if (i < 33) { amp = 1.5; level = 50; }
      else { amp = 2; level = 50 + (i - 33) * 2.6; } // bigger move
      prices.push(level + Math.sin(i * 0.55) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 36;
    const maxP = 80; // wider range for bigger move
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 8 + (i / (N - 1)) * (chartW - 16);

    // Cipher Ribbon — for Double Coil, show converging ribbon lines inside the box
    const sqStart = 12;
    const sqEnd = step >= 3 ? 33 : 30;
    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    // Glowing wall (BREAKOUT READY + Double Coil)
    if (step >= 1) {
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 4);
      ctx.shadowColor = ORANGE;
      ctx.shadowBlur = 6 + pulseAmt * 6;
    }
    ctx.fillStyle = `rgba(255, 179, 0, 0.18)`;
    ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.strokeStyle = step >= 1 ? `rgba(255, 107, 0, 0.85)` : `rgba(255, 179, 0, 0.7)`;
    ctx.lineWidth = step >= 1 ? 2.4 : 1.8;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.shadowBlur = 0;

    // Ribbon lines inside box (Double Coil signature)
    if (step >= 1) {
      const ribbonCenter = (boxTop + boxBot) / 2;
      const ribbonSpread = (boxBot - boxTop) * 0.2;
      for (let r = 0; r < 4; r++) {
        const offset = (r - 1.5) * (ribbonSpread / 2);
        ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 - r * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let bi = sqStart; bi <= sqEnd; bi++) {
          const rx = xScale(bi);
          const ry = ribbonCenter + offset + Math.sin(bi * 0.5) * 1.5;
          if (bi === sqStart) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
      }
    }

    // Star marker at top of box (Double Coil ★)
    if (step >= 1) {
      const starX = boxLeft + (boxRight - boxLeft) / 2;
      const starY = boxTop - 8;
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 5);
      ctx.fillStyle = ORANGE;
      ctx.shadowColor = ORANGE;
      ctx.shadowBlur = 4 + pulseAmt * 4;
      ctx.font = `bold ${14 + pulseAmt * 3}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('★', starX, starY);
      ctx.shadowBlur = 0;
    }

    // PLAN lines (step 2+) — 2.5R target
    if (step >= 2) {
      const entryY = yScale(prices[33] + 1);
      const stopY = yScale(lowest - 2);
      const riskAtr = (yScale(lowest - 2) - yScale(prices[33] + 1));
      const targetY = entryY + riskAtr * 2.5;

      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, entryY);
      ctx.lineTo(chartRight - 6, entryY);
      ctx.stroke();

      ctx.strokeStyle = MAGENTA;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, stopY);
      ctx.lineTo(chartRight - 6, stopY);
      ctx.stroke();

      ctx.strokeStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, targetY);
      ctx.lineTo(chartRight - 6, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = TEAL;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ENTRY', chartRight - 8, entryY - 3);
      ctx.fillStyle = MAGENTA;
      ctx.fillText('STOP', chartRight - 8, stopY - 3);
      ctx.fillStyle = AMBER;
      ctx.fillText('+2.5R', chartRight - 8, targetY - 3);
    }

    // Diamond + tracker (step 3)
    if (step >= 3) {
      const dx = xScale(33);
      const dy = yScale(prices[33]) + 12;
      ctx.fillStyle = TEAL;
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      const trackerProg = (cycleT - 12) / 4;
      const showBars = Math.min(5, Math.floor(trackerProg * 5));
      for (let tb = 1; tb <= showBars; tb++) {
        const tx = xScale(33 + tb);
        const ty = yScale(prices[33 + tb]);
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Price line
    const cursor = step === 0 ? 28 : step === 1 ? 30 : step === 2 ? 32 : Math.min(N - 1, 33 + Math.floor((cycleT - 12) * 1.5));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Step status card
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(cardLeft, chartTop, cardW, chartH);
    ctx.strokeRect(cardLeft, chartTop, cardW, chartH);

    ctx.fillStyle = ORANGE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STEP ${step + 1}`, cardLeft + cardW / 2, chartTop + 16);

    const stepDetails = [
      { name: 'SPOT', text: 'Amber coil on BTCUSD 4h. Bright walls — ready phase.', color: AMBER },
      { name: 'CLASSIFY', text: 'BREAKOUT READY · HIGH energy · ★ Double Coil', color: ORANGE },
      { name: 'PLAN', text: 'Entry at diamond · stop below box · 2.5R target · UP-SIZED', color: ORANGE },
      { name: 'MANAGE', text: 'Diamond ✓ · CONFIRMED · RUNNER bar 2 · +2.5R hit', color: TEAL },
    ];
    const sd = stepDetails[step];

    ctx.fillStyle = sd.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(sd.name, cardLeft + cardW / 2, chartTop + 38);

    ctx.fillStyle = WHITE;
    ctx.font = '8px Inter, sans-serif';
    const words = sd.text.split(' ');
    let l1 = '', l2 = '', l3 = '';
    const maxC = 22;
    for (const wd of words) {
      if (l1.length + wd.length + 1 <= maxC) l1 += (l1 ? ' ' : '') + wd;
      else if (l2.length + wd.length + 1 <= maxC) l2 += (l2 ? ' ' : '') + wd;
      else l3 += (l3 ? ' ' : '') + wd;
    }
    ctx.fillText(l1, cardLeft + cardW / 2, chartTop + 60);
    if (l2) ctx.fillText(l2, cardLeft + cardW / 2, chartTop + 72);
    if (l3) ctx.fillText(l3, cardLeft + cardW / 2, chartTop + 84);

    // Progress dots
    const dotsY = chartBot - 50;
    const dotSpace = 18;
    const dotsStart = cardLeft + cardW / 2 - (4 - 1) * dotSpace / 2;
    for (let di = 0; di < 4; di++) {
      const dx = dotsStart + di * dotSpace;
      ctx.fillStyle = di === step ? ORANGE : di < step ? TEAL : `${ORANGE}33`;
      ctx.beginPath();
      ctx.arc(dx, dotsY, di === step ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (step === 3 && cycleT > 14) {
      ctx.fillStyle = `${ORANGE}33`;
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 1;
      const oY = chartBot - 28;
      ctx.fillRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.strokeRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.fillStyle = ORANGE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+2.5R  ·  RUNNER ★', cardLeft + cardW / 2, oY + 14);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — Example3Anim (S09 — Worked Example 3: Failed Coil)
// Same 4-step structure, but the coil produces a SUSPECT-quality
// breakout with STALLED tracker. Operator exits at bar 3 — break-even.
// Demonstrates that the framework catches losers early.
// ============================================================
function Example3Anim() {
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
    ctx.fillText('EXAMPLE 3  ·  FAILED COIL  ·  recognition + recovery', w / 2, 22);

    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const step = Math.floor(cycleT / 4);

    const padX = 22;
    const chartTop = 50;
    const chartBot = h - 30;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = w * 0.65;
    const chartRight = chartLeft + chartW;

    const cardLeft = chartRight + padX;
    const cardW = w - cardLeft - padX;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price — coil that FAILS post-fire (STALLED, then reverses)
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 8) amp = 7;
      else if (i < 30) amp = 7 - (i - 8) * 0.3;
      else if (i < 33) { amp = 1.5; level = 50; }
      else if (i < 36) { amp = 1; level = 50 + (i - 33) * 0.4; } // weak move
      else { amp = 1.5; level = 50.8 - (i - 36) * 0.7; } // reverse
      prices.push(level + Math.sin(i * 0.55) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 36;
    const maxP = 65;
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 8 + (i / (N - 1)) * (chartW - 16);

    // Coil Box
    const sqStart = 12;
    const sqEnd = step >= 3 ? 33 : 30;
    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    const wallAlpha = step >= 1 ? 0.7 : 0.45;
    const fillAlpha = step >= 1 ? 0.12 : 0.07;
    ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
    ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);

    // PLAN lines (step 2+)
    if (step >= 2) {
      const entryY = yScale(prices[33] + 1);
      const stopY = yScale(lowest - 2);
      const riskAtr = (yScale(lowest - 2) - yScale(prices[33] + 1));
      const targetY = entryY + riskAtr * 1.5;

      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, entryY);
      ctx.lineTo(chartRight - 6, entryY);
      ctx.stroke();

      ctx.strokeStyle = MAGENTA;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, stopY);
      ctx.lineTo(chartRight - 6, stopY);
      ctx.stroke();

      ctx.strokeStyle = AMBER;
      ctx.beginPath();
      ctx.moveTo(chartLeft + 8, targetY);
      ctx.lineTo(chartRight - 6, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Diamond + tracker (step 3) — STALLED tracker
    if (step >= 3) {
      const dx = xScale(33);
      const dy = yScale(prices[33]) + 12;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();

      // Tracker dots — show STALLED at bar 3 with magenta
      const trackerProg = (cycleT - 12) / 4;
      const showBars = Math.min(5, Math.floor(trackerProg * 5));
      for (let tb = 1; tb <= showBars; tb++) {
        const tx = xScale(33 + tb);
        const ty = yScale(prices[33 + tb]);
        // Bar 3+ is STALLED — show as magenta
        const dotColor = tb >= 3 ? MAGENTA : AMBER;
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Exit signal at bar 3
      if (showBars >= 3) {
        const exitX = xScale(33 + 3);
        const exitY = yScale(prices[33 + 3]);
        const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 5);
        ctx.strokeStyle = MAGENTA;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(exitX, exitY, 6 + pulseAmt * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', exitX, exitY - 12);
      }
    }

    // Price line
    const cursor = step === 0 ? 28 : step === 1 ? 30 : step === 2 ? 32 : Math.min(N - 1, 33 + Math.floor((cycleT - 12) * 1.5));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Step status card
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(cardLeft, chartTop, cardW, chartH);
    ctx.strokeRect(cardLeft, chartTop, cardW, chartH);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STEP ${step + 1}`, cardLeft + cardW / 2, chartTop + 16);

    const stepDetails = [
      { name: 'SPOT', text: 'Amber coil on EURUSD 15m. Walls medium — COILING.', color: AMBER },
      { name: 'CLASSIFY', text: 'COILING · LOW energy · single coil — marginal setup', color: AMBER },
      { name: 'PLAN', text: 'Entry · stop · 1.5R target — half-size given low energy', color: AMBER },
      { name: 'MANAGE', text: 'Diamond ✓ · SUSPECT quality · STALLED bar 3 · EXIT', color: MAGENTA },
    ];
    const sd = stepDetails[step];

    ctx.fillStyle = sd.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(sd.name, cardLeft + cardW / 2, chartTop + 38);

    ctx.fillStyle = WHITE;
    ctx.font = '8px Inter, sans-serif';
    const words = sd.text.split(' ');
    let l1 = '', l2 = '', l3 = '';
    const maxC = 22;
    for (const wd of words) {
      if (l1.length + wd.length + 1 <= maxC) l1 += (l1 ? ' ' : '') + wd;
      else if (l2.length + wd.length + 1 <= maxC) l2 += (l2 ? ' ' : '') + wd;
      else l3 += (l3 ? ' ' : '') + wd;
    }
    ctx.fillText(l1, cardLeft + cardW / 2, chartTop + 60);
    if (l2) ctx.fillText(l2, cardLeft + cardW / 2, chartTop + 72);
    if (l3) ctx.fillText(l3, cardLeft + cardW / 2, chartTop + 84);

    // Progress dots
    const dotsY = chartBot - 50;
    const dotSpace = 18;
    const dotsStart = cardLeft + cardW / 2 - (4 - 1) * dotSpace / 2;
    for (let di = 0; di < 4; di++) {
      const dx = dotsStart + di * dotSpace;
      ctx.fillStyle = di === step ? AMBER : di < step ? TEAL : `${AMBER}33`;
      ctx.beginPath();
      ctx.arc(dx, dotsY, di === step ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (step === 3 && cycleT > 14) {
      ctx.fillStyle = `${MAGENTA}33`;
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1;
      const oY = chartBot - 28;
      ctx.fillRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.strokeRect(cardLeft + 6, oY, cardW - 12, 22);
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('-0.1R  ·  EXITED CLEAN', cardLeft + cardW / 2, oY + 14);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — MultiCoilAnim (S10)
// Multiple coils on one chart: 1 active + 2-3 historical (locked).
// Shows the visual difference and how the operator reads the active
// one without being distracted by the historical ones.
// ============================================================
function MultiCoilAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MULTIPLE COILS  ·  read the active, not the history', w / 2, 22);

    // Layout
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 60;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price with 4 distinct coil episodes — 3 historical + 1 active
    const N = 100;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;

      if (i < 8) { amp = 6; }
      else if (i < 18) { amp = 6 - (i - 8) * 0.5; } // coil 1: forming
      else if (i < 22) { amp = 1.5; } // coil 1: tight
      else if (i < 28) { amp = 2 + (i - 22); level = 50 + (i - 22) * 0.6; } // coil 1: breakout up
      else if (i < 38) { amp = 7; level = 53; } // expand
      else if (i < 48) { amp = 7 - (i - 38) * 0.5; level = 53; } // coil 2: forming
      else if (i < 52) { amp = 1.5; level = 53; } // coil 2: tight
      else if (i < 58) { amp = 2; level = 53 - (i - 52) * 0.4; } // coil 2: breakdown
      else if (i < 68) { amp = 7; level = 50; } // expand
      else if (i < 76) { amp = 7 - (i - 68) * 0.5; level = 50; } // coil 3: forming
      else if (i < 80) { amp = 1.5; level = 50; } // coil 3: tight
      else if (i < 86) { amp = 2; level = 50 + (i - 80) * 0.5; } // coil 3: breakout up
      else if (i < 92) { amp = 7; level = 53; } // expand
      else { amp = 7 - (i - 92) * 0.6; level = 53; } // coil 4 (ACTIVE): forming

      prices.push(level + Math.sin(i * 0.6) * amp + Math.sin(i * 1.5) * amp * 0.3);
    }

    const minP = 35;
    const maxP = 65;
    const yScale = (p: number) => chartTop + 8 + ((maxP - p) / (maxP - minP)) * (chartH - 16);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // 4 boxes: 3 historical (locked, fadged), 1 active (bright)
    const boxes = [
      { start: 8, end: 22, color: AMBER, alpha: 0.22, fillAlpha: 0.04, label: 'Coil 1', historical: true, dir: 'bull' },
      { start: 38, end: 52, color: AMBER, alpha: 0.22, fillAlpha: 0.04, label: 'Coil 2', historical: true, dir: 'bear' },
      { start: 68, end: 80, color: AMBER, alpha: 0.22, fillAlpha: 0.04, label: 'Coil 3', historical: true, dir: 'bull' },
      { start: 92, end: N - 1, color: AMBER, alpha: 0.85, fillAlpha: 0.18, label: 'Coil 4 ACTIVE', historical: false, dir: 'pending' },
    ];

    // Cycle: highlight which coil the operator is "reading" — only the active one matters
    const cycleSec = 6;
    const cycleT = t % cycleSec;
    const phase = Math.floor(cycleT / 2);

    boxes.forEach((box, bi) => {
      let highest = -Infinity, lowest = Infinity;
      for (let i = box.start; i <= box.end; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }
      const boxLeft = xScale(box.start);
      const boxRight = xScale(box.end);
      const boxTop = yScale(highest + 1);
      const boxBot = yScale(lowest - 1);

      // Active box pulses in phase 2 (focus on active)
      let alpha = box.alpha;
      let lineWidth = 1.5;
      if (!box.historical && phase === 2) {
        const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 4);
        alpha = 0.85 + pulseAmt * 0.15;
        lineWidth = 2.4;
      }

      ctx.fillStyle = `rgba(255, 179, 0, ${box.fillAlpha})`;
      ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);

      // Label below or above the box
      ctx.fillStyle = box.historical ? DIM : ORANGE;
      ctx.font = box.historical ? '7px Inter, sans-serif' : 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(box.label, (boxLeft + boxRight) / 2, boxBot + 12);

      // Diamond on historical breakouts (small)
      if (box.historical) {
        const dirIdx = box.start + (box.end - box.start);
        const dx = xScale(dirIdx);
        const dy = box.dir === 'bull' ? yScale(prices[dirIdx]) + 8 : yScale(prices[dirIdx]) - 8;
        ctx.fillStyle = `${TEAL}99`;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + 3, dy + 3);
        ctx.lineTo(dx, dy + 6);
        ctx.lineTo(dx - 3, dy + 3);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Eye cursor: phase 0 = scanning, phase 1 = dwelling on active
    if (phase >= 1) {
      const activeBox = boxes[3];
      const cx = (xScale(activeBox.start) + xScale(activeBox.end)) / 2;
      const cy = (yScale(50 + 5) + yScale(50 - 5)) / 2;
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 3);
      ctx.strokeStyle = `rgba(255, 107, 0, ${0.7 + pulseAmt * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 + pulseAmt * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bottom verdict
    ctx.fillStyle = phase >= 2 ? ORANGE : DIM;
    ctx.font = phase >= 2 ? 'bold 10px Inter, sans-serif' : '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (phase === 0) {
      ctx.fillText('Chart shows 4 coils — 3 historical (faded), 1 active (bright)', w / 2, h - 30);
    } else if (phase === 1) {
      ctx.fillText('Eye locks on the rightmost active coil — it\'s the only one that can be traded', w / 2, h - 30);
    } else {
      ctx.fillText('READ ONLY THE ACTIVE COIL  ·  history is context, not opportunity', w / 2, h - 30);
    }

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Historical coils are locked Pine boxes — they cannot fire again. Don\'t overthink them.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — CrossAssetAnim (S11)
// 6-asset watchlist with rotating coil activity. Different assets
// show different states at different times. Demonstrates the
// scan-prioritize-deepen workflow across the full watchlist.
// ============================================================
function CrossAssetAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CROSS-ASSET SCANNING  ·  prioritise where to deepen', w / 2, 22);

    // Cycle: 12s loop, 4s per "checkpoint snapshot"
    // T=0-4: morning scan — most assets quiet, BTCUSD has pre-squeeze warning
    // T=4-8: mid-session — XAUUSD coil now BUILDING, BTCUSD COILING
    // T=8-12: late session — BTCUSD BREAKOUT READY, XAUUSD COILING, NAS100 just fired
    const cycleSec = 12;
    const cycleT = t % cycleSec;
    const snapshot = Math.floor(cycleT / 4);

    // Asset states at each snapshot
    const stateBySnapshot: Array<Array<{
      name: string; tf: string; state: string; priority: 'high' | 'med' | 'low'; box?: 'building' | 'coiling' | 'ready' | 'fired';
    }>> = [
      // Snapshot 0: Morning scan
      [
        { name: 'XAUUSD', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'EURUSD', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'BTCUSD', tf: '4h', state: 'WARNING', priority: 'med' },
        { name: 'NAS100', tf: '1h', state: 'EXPANDING', priority: 'low' },
        { name: 'AAPL', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'USDJPY', tf: '15m', state: 'NORMAL', priority: 'low' },
      ],
      // Snapshot 1: Mid-session
      [
        { name: 'XAUUSD', tf: '15m', state: '34% BUILDING', priority: 'med', box: 'building' },
        { name: 'EURUSD', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'BTCUSD', tf: '4h', state: '62% COILING', priority: 'high', box: 'coiling' },
        { name: 'NAS100', tf: '1h', state: 'CONTRACTING', priority: 'low' },
        { name: 'AAPL', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'USDJPY', tf: '15m', state: 'NORMAL', priority: 'low' },
      ],
      // Snapshot 2: Late session
      [
        { name: 'XAUUSD', tf: '15m', state: '54% COILING', priority: 'high', box: 'coiling' },
        { name: 'EURUSD', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'BTCUSD', tf: '4h', state: '81% BREAKOUT READY', priority: 'high', box: 'ready' },
        { name: 'NAS100', tf: '1h', state: 'BREAKOUT ▲', priority: 'med', box: 'fired' },
        { name: 'AAPL', tf: '15m', state: 'NORMAL', priority: 'low' },
        { name: 'USDJPY', tf: '15m', state: 'NORMAL', priority: 'low' },
      ],
    ];

    const assets = stateBySnapshot[snapshot];
    const snapshotLabels = ['MORNING SCAN', 'MID-SESSION', 'LATE SESSION'];

    // Snapshot label at top
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(snapshotLabels[snapshot], w / 2, 38);

    // Layout: 6 assets in 2x3 grid
    const padX = 18;
    const gridTop = 52;
    const gridBot = h - 50;
    const gridH = gridBot - gridTop;
    const cols = 3;
    const rows = 2;
    const tileGap = 8;
    const tileW = (w - padX * 2 - (cols - 1) * tileGap) / cols;
    const tileH = (gridH - (rows - 1) * tileGap) / rows;

    assets.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = padX + col * (tileW + tileGap);
      const ty = gridTop + row * (tileH + tileGap);

      // Tile color by priority
      const priorityColor = a.priority === 'high' ? ORANGE : a.priority === 'med' ? AMBER : DIM;
      const isHigh = a.priority === 'high';

      // Tile background
      ctx.fillStyle = isHigh ? `${ORANGE}11` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isHigh ? ORANGE : a.priority === 'med' ? AMBER : FAINT;
      ctx.lineWidth = isHigh ? 1.8 : 1;
      ctx.fillRect(tx, ty, tileW, tileH);
      ctx.strokeRect(tx, ty, tileW, tileH);

      // Asset name
      ctx.fillStyle = isHigh ? ORANGE : WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(a.name, tx + 8, ty + 14);
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(a.tf, tx + 8, ty + 24);

      // Priority badge top-right
      const badgeText = a.priority.toUpperCase();
      ctx.fillStyle = `${priorityColor}33`;
      ctx.strokeStyle = priorityColor;
      ctx.lineWidth = 1;
      const badgeW = 36;
      ctx.fillRect(tx + tileW - badgeW - 6, ty + 6, badgeW, 12);
      ctx.strokeRect(tx + tileW - badgeW - 6, ty + 6, badgeW, 12);
      ctx.fillStyle = priorityColor;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, tx + tileW - badgeW / 2 - 6, ty + 14);

      // Mini chart with optional coil box
      const chartTop = ty + 30;
      const chartBot = ty + tileH - 22;
      const chartLeft = tx + 8;
      const chartRight = tx + tileW - 8;
      const chartHt = chartBot - chartTop;
      const chartWd = chartRight - chartLeft;

      const N = 30;
      const seedOffset = i * 13 + snapshot * 7;
      const prices: number[] = [];
      for (let k = 0; k < N; k++) {
        const phase = (k + seedOffset) * 0.5;
        let amp = 4;
        if (a.box === 'building') amp = k > 12 ? 4 - (k - 12) * 0.15 : 4;
        else if (a.box === 'coiling') amp = k > 6 ? 4 - (k - 6) * 0.15 : 4;
        else if (a.box === 'ready') amp = k > 4 ? 4 - (k - 4) * 0.13 : 4;
        else if (a.box === 'fired') amp = k > 4 && k < 22 ? 4 - (k - 4) * 0.13 : k >= 22 ? 2 + (k - 22) * 0.5 : 4;

        prices.push(50 + Math.sin(phase) * amp + Math.sin(phase * 1.7) * amp * 0.3);
      }

      const minP = 42;
      const maxP = 58;
      const yScl = (p: number) => chartTop + ((maxP - p) / (maxP - minP)) * chartHt;
      const xScl = (k: number) => chartLeft + (k / (N - 1)) * chartWd;

      // Coil box
      if (a.box && a.box !== 'fired') {
        const sqStart = a.box === 'building' ? 12 : a.box === 'coiling' ? 6 : 4;
        const sqEnd = N - 1;
        let highest = -Infinity, lowest = Infinity;
        for (let k = sqStart; k <= sqEnd; k++) {
          if (prices[k] > highest) highest = prices[k];
          if (prices[k] < lowest) lowest = prices[k];
        }
        const boxLeft = xScl(sqStart);
        const boxRight = xScl(sqEnd);
        const boxTop = yScl(highest + 0.5);
        const boxBot = yScl(lowest - 0.5);

        const wallA = a.box === 'ready' ? 0.85 : a.box === 'coiling' ? 0.65 : 0.4;
        const fillA = a.box === 'ready' ? 0.15 : a.box === 'coiling' ? 0.10 : 0.05;
        ctx.fillStyle = `rgba(255, 179, 0, ${fillA})`;
        ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
        ctx.strokeStyle = `rgba(255, 179, 0, ${wallA})`;
        ctx.lineWidth = a.box === 'ready' ? 1.5 : 1;
        ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      }

      // Fired diamond
      if (a.box === 'fired') {
        const dx = xScl(22);
        const dy = yScl(prices[22]) + 8;
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + 4, dy + 4);
        ctx.lineTo(dx, dy + 8);
        ctx.lineTo(dx - 4, dy + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Price line
      ctx.strokeStyle = isHigh ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const x = xScl(k);
        const y = yScl(prices[k]);
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // State at bottom
      ctx.fillStyle = isHigh ? ORANGE : a.priority === 'med' ? AMBER : DIM;
      ctx.font = isHigh ? 'bold 7px Inter, sans-serif' : '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.state, tx + tileW / 2, ty + tileH - 6);
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (snapshot === 0) {
      ctx.fillText('Most assets quiet. BTCUSD has pre-squeeze warning — flag for monitoring.', w / 2, h - 12);
    } else if (snapshot === 1) {
      ctx.fillText('Two assets advancing: BTCUSD COILING (high priority), XAUUSD BUILDING (medium).', w / 2, h - 12);
    } else {
      ctx.fillText('BTCUSD ready to fire. XAUUSD COILING. NAS100 just fired — manage if positioned.', w / 2, h - 12);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherCoilReadingLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.15-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 15</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Reading Coils Live<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>From Mechanics to Muscle Memory</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">L11.14 taught you how the Coil Box works. This lesson teaches you how to read it in real time on a chart you&apos;ve never seen. SPOT &mdash; CLASSIFY &mdash; PLAN &mdash; MANAGE. The 4-step rhythm that turns mechanics into muscle memory.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Knowing isn&apos;t reading. Reading is doing.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The previous lesson taught the Coil Box state machine in full mechanical detail &mdash; BB/KC trigger math, the three lifecycle phases, energy scoring, breakout quality, runner-vs-dud tracking. That&apos;s the engineer&apos;s view. <strong className="text-white">This lesson teaches the operator&apos;s view</strong> &mdash; how to use that knowledge in real time, on a chart you&apos;ve never seen, while price is moving.</p>
            <p className="text-gray-400 leading-relaxed mb-4">There is a real, observable gap between operators who know the Coil Box mechanics and operators who can <strong className="text-amber-400">read coils as fast as they appear</strong>. The first group can answer test questions about COILING phase. The second group spots a freshly-formed BREAKOUT READY across a 6-asset watchlist in three seconds, classifies it in five, plans the trade in ten, and manages the post-fire 5-bar tracker without thinking. The mechanical knowledge is the same. The reading rhythm is what separates them.</p>
            <p className="text-gray-400 leading-relaxed">The 4-step Coil Reading Frame &mdash; <strong className="text-white">SPOT, CLASSIFY, PLAN, MANAGE</strong> &mdash; is the rhythm. Each step has its own micro-skills, its own time budget, and its own failure mode if you skip it. Master the four steps and reading coils stops being a deliberative analysis and starts being instinctive, like a driver scanning the road. <strong className="text-amber-400">That&apos;s when you become a Coil Reader.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE COIL READER PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">4-step rhythm</strong> for reading any coil on any chart, the <strong className="text-white">3 reading reflexes</strong> that make CLASSIFY happen in five seconds, the <strong className="text-white">staging discipline</strong> that lets you PLAN orders during COILING, the <strong className="text-white">5-bar tracker management</strong> that catches DUDs in real time, the <strong className="text-white">multi-coil reading patterns</strong> when several coils are visible on one chart, the <strong className="text-white">cross-asset scanning workflow</strong> that catches setups across a 6-8 asset watchlist, the <strong className="text-white">5 failure patterns</strong> coils tend to take, and the <strong className="text-white">two CIPHER alerts</strong> that automate the SPOT step when you&apos;re away from the chart. By the end, the rhythm is yours.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The 4-Step Coil Reading Frame (GC) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The 4-Step Coil Reading Frame</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every successful coil trade follows the same 4-step rhythm. <strong className="text-amber-400">SPOT</strong> the active coil among everything else on your charts. <strong className="text-amber-400">CLASSIFY</strong> it &mdash; phase, energy, tier &mdash; in roughly five seconds. <strong className="text-amber-400">PLAN</strong> the trade by staging entry, stop, and target during the COILING phase. <strong className="text-amber-400">MANAGE</strong> the live trade through the 5-bar post-fire tracker. Each step has its own time budget and its own micro-skill. Skip one and the trade decays.</p>
          <FourStepFrameAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The chart on top shows a coil developing through all four phases. The pipeline at the bottom shows which step the operator is on. <strong className="text-white">SPOT happens before you even open the chart with intent</strong> &mdash; it&apos;s your peripheral scan. <strong className="text-white">CLASSIFY happens in five seconds</strong> using three reflexes (taught in S04). <strong className="text-white">PLAN takes ten seconds</strong> while the coil is still in COILING. <strong className="text-white">MANAGE is live</strong> &mdash; you watch the tracker bars print after fire. The total active engagement time per coil is roughly 30 seconds spread across the coil&apos;s lifetime, not 30 seconds of staring.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 1  ·  SPOT  ·  3 seconds  ·  scan for amber</p>
              <p className="text-sm text-gray-400 leading-relaxed">Your eye sweeps the watchlist looking for one thing: <strong className="text-white">amber</strong>. Coils announce themselves visually with the amber wall and fill that no other CIPHER element produces in the same way. SPOT works peripherally &mdash; you don&apos;t need to focus on each chart, just glance at the watchlist and let the amber catch your eye. With practice, this happens at near-instant speed across 6-8 assets. Detail in S02.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 2  ·  CLASSIFY  ·  5 seconds  ·  phase + energy + tier</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once you&apos;ve spotted a coil, three reads in sequence: <strong className="text-white">phase</strong> from wall brightness (BUILDING / COILING / BREAKOUT READY), <strong className="text-white">energy</strong> from the Volatility &amp; Squeeze row (LOW / MODERATE / HIGH / EXTREME), <strong className="text-white">tier</strong> from the Ribbon row (single coil vs ★ Double Coil). All three together tell you what kind of trade this is. Detail in S03.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 3  ·  PLAN  ·  10 seconds  ·  stage the trade</p>
              <p className="text-sm text-gray-400 leading-relaxed">During COILING (before BREAKOUT READY), you have ample time to plan. <strong className="text-white">Entry</strong> is at the diamond close (committed by the engine, not by you). <strong className="text-white">Stop</strong> is just outside the box on the opposite side of breakout direction (universal across all playbooks). <strong className="text-white">Target</strong> depends on tier &mdash; 1.5R standard, 2.5R for HIGH energy or Double Coil. Stage your orders during COILING so when BREAKOUT READY arrives you&apos;re already ready. Detail in S05.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 4  ·  MANAGE  ·  live  ·  watch the tracker</p>
              <p className="text-sm text-gray-400 leading-relaxed">Diamond drops. Quality at fire bar (CONFIRMED / PROBABLE / SUSPECT). Trade entered. The 5-bar tracker now decides whether you ride it or exit. <strong className="text-white">RUNNING by bar 2 = stay aggressive. STALLED by bar 3 = exit at break-even.</strong> The tracker is the engine&apos;s honesty check &mdash; if it says STALLED, the trade is wrong regardless of how clean the entry looked. Detail in S06.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE FRAME IS NOT NEGOTIABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Every step is load-bearing. Skip SPOT and you find coils only after they&apos;ve fired. Skip CLASSIFY and you trade a HIGH-energy Double Coil with the same plan as a LOW-energy single, leaving R on the table. Skip PLAN and you scramble for orders at the fire bar, missing the entry. Skip MANAGE and you hold DUD trades into reversals. <strong className="text-white">The four steps together are the rhythm</strong> &mdash; the parts of the rhythm that look optional are the ones that quietly cost the most.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Step 1: SPOT === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Step 1: SPOT</p>
          <h2 className="text-2xl font-extrabold mb-4">The 3-second visual scan</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most coils get missed because operators are staring at one chart while the coil forms on a different one. The SPOT step exists to fix that. <strong className="text-amber-400">It&apos;s not a deep read &mdash; it&apos;s a peripheral sweep across your watchlist looking for amber</strong>. Done correctly, SPOT takes about three seconds for a 6-asset watchlist and catches every active coil on its first scan.</p>
          <SpotScanAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the eye-cursor sweep through the 6-asset watchlist. It glances at each tile briefly, looking for amber. When it reaches BTCUSD 4h, the amber Coil Box catches its attention &mdash; the eye stops, dwells, and the asset is now flagged for the next step. <strong className="text-white">The other 5 assets are dismissed in under 2 seconds.</strong> SPOT is fast because it&apos;s shallow &mdash; you&apos;re not analysing, you&apos;re scanning for one specific colour.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU&apos;RE LOOKING FOR  ·  one specific visual</p>
              <p className="text-sm text-gray-400 leading-relaxed">Amber walls and fill on the chart. <strong className="text-white">No other CIPHER element produces this exact visual.</strong> Pulse is teal/magenta. Tension Fill is teal/magenta gradient. Risk Envelope is teal cloud. Coil is amber. The exclusivity is by design &mdash; coils are visually unique so they catch your eye even when you&apos;re focused elsewhere on the chart. The brighter the amber, the closer to BREAKOUT READY (more on that in CLASSIFY).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE WATCHLIST ARCHITECTURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">SPOT works best on a watchlist of 6-8 assets, all with CIPHER PRO loaded and Cipher Coil ON. Mix asset classes (forex + indices + crypto + a stock or two) so you have setups developing on different rhythms. <strong className="text-white">Use TradingView&apos;s multi-chart layout</strong> &mdash; 6 charts arranged in a grid means one glance covers all of them. Single-chart workflows force you to flip between assets manually, which kills SPOT speed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PERIPHERAL VS FOCUSED ATTENTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">SPOT is <strong className="text-white">peripheral attention</strong> &mdash; the kind of vision that catches movement at the edge of your eye while you&apos;re focused on something else. You don&apos;t need to consciously look at every chart; you just need to be in the multi-chart view and let the amber catch you when it appears. Most coil-trading operators have CIPHER Coil running passively while they do other work, glancing at the multi-chart every few minutes for a 3-second sweep.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO CIPHER ALERTS  ·  alternative to manual SPOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you can&apos;t maintain a peripheral watch, set CIPHER&apos;s built-in alerts: <strong className="text-white">&ldquo;Squeeze Breakout&rdquo;</strong> fires on diamond release; <strong className="text-white">&ldquo;Double Coil&rdquo;</strong> fires when a Double Coil first activates. These two alerts together cover the most important SPOT moments &mdash; you get notified just as a coil fires or just as a Double Coil starts forming. Set them once, and your phone (or browser) becomes the SPOT step. Detail on alert setup in S14.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRE-SQUEEZE WARNING  ·  earliest possible SPOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">From L11.14 S09: pre-squeeze warning fires before z-score officially triggers, before any Coil Box has formed. <strong className="text-white">The warning IS a SPOT signal</strong> &mdash; one bar earlier than the visual coil. Operators who toggle the Volatility &amp; Squeeze row ON across their watchlist see this warning hit on assets where coils are forming, even before the box is visible. Use it as the earliest layer of the SPOT step.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PRACTICE THE SPEED</p>
            <p className="text-sm text-gray-400 leading-relaxed">Time yourself. Open your watchlist, glance for 3 seconds, look away. Did you spot every active coil? Run this drill 20-30 times across different sessions. Over time, your peripheral vision tunes itself to amber and SPOT becomes effortless. <strong className="text-white">The goal isn&apos;t speed-as-prowess &mdash; it&apos;s speed-as-routine</strong>, so SPOT happens automatically without consuming attention you need for the deeper steps.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Step 2: CLASSIFY === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Step 2: CLASSIFY</p>
          <h2 className="text-2xl font-extrabold mb-4">Phase, energy, tier &mdash; in 5 seconds</h2>
          <p className="text-gray-400 leading-relaxed mb-6">SPOT identified the coil. CLASSIFY tells you what kind it is. Three reads in sequence: <strong className="text-amber-400">phase</strong> (where in the lifecycle), <strong className="text-amber-400">energy</strong> (how much potential), <strong className="text-amber-400">tier</strong> (single vs Double). Each takes about 1-2 seconds; together about 5 seconds for a fluent operator. The classification determines the entire downstream workflow &mdash; same coil different classifications produce different trade plans.</p>
          <ClassifyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the classification card populate. Three rows fill in sequence as the operator reads each indicator: phase from wall brightness (BREAKOUT READY), energy from the Volatility row (HIGH at score 73), tier from the Ribbon row (★ DOUBLE COIL). <strong className="text-white">All three reads together tell you this is a Playbook 3 setup &mdash; up-size, 2.5R+ target, trail wide.</strong> Without all three reads, you&apos;d under-size or under-target this coil.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">READ 1  ·  PHASE  ·  from the wall brightness</p>
              <p className="text-sm text-gray-400 leading-relaxed">First read, fastest. <strong className="text-white">Faint walls = BUILDING. Medium walls = COILING. Solid bright walls = BREAKOUT READY.</strong> The Pine transparency values (55 → 30 → 10) make the visual progression sharp and unmistakable once you&apos;ve seen a few. Phase tells you the time horizon of the trade &mdash; BUILDING means you have many bars to plan, BREAKOUT READY means orders should already be staged. This read takes under 1 second once you&apos;ve trained the visual.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READ 2  ·  ENERGY  ·  from the Volatility &amp; Squeeze row</p>
              <p className="text-sm text-gray-400 leading-relaxed">Second read. The Volatility &amp; Squeeze row of the Command Center reads <strong className="text-white">{'{compression}%'} {'{phase}'}</strong> during squeeze (e.g. &ldquo;73% BREAKOUT READY&rdquo;). The compression number IS your energy proxy &mdash; high compression + duration in BREAKOUT READY = HIGH or EXTREME energy. The row also shows guidance text (PREPARE ENTRY / ALMOST READY / PATIENCE) which encodes the same info in plain English. About 1-2 seconds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READ 3  ·  TIER  ·  from the Ribbon row</p>
              <p className="text-sm text-gray-400 leading-relaxed">Third read. The Ribbon row of the Command Center cascades through priority: <strong className="text-white">DIVERGING → CURVING → COILED → DOUBLE COIL</strong>. When you see DOUBLE COIL on the Ribbon row at the same time as an active Coil Box on the chart, you&apos;re looking at the highest-edge tier (Playbook 3 from L11.14). Without DOUBLE COIL, the coil is single-layer (Playbook 1 or 2 depending on energy). About 1-2 seconds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 3-READ STACK  ·  total ~5 seconds</p>
              <p className="text-sm text-gray-400 leading-relaxed">Phase (1s) + Energy (2s) + Tier (2s) = 5 seconds total. <strong className="text-white">Practice runs this faster as the reads become reflexive</strong> &mdash; experienced Coil Readers do all three in about 3 seconds. The output is a 3-tuple: e.g. {'{BREAKOUT READY, HIGH, ★ Double Coil}'}. That tuple maps directly to a playbook (covered in S05). The classification IS the trade-plan input.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASES  ·  partial reads</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sometimes one read is missing. The Ribbon row might not be on (operators who don&apos;t use the Ribbon Command Center row miss the tier read). Solution: hover the diamond after fire &mdash; the tooltip explicitly shows ★ DOUBLE COIL or omits it. <strong className="text-white">Or look at the chart visually</strong> &mdash; if Ribbon lines are visibly converged inside or near the Coil Box, you&apos;re in Double Coil territory. Don&apos;t classify a coil as single-tier when you can&apos;t see the Ribbon &mdash; you&apos;ll miss Double Coils that way.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">CLASSIFY DRIVES SIZING</p>
            <p className="text-sm text-gray-400 leading-relaxed">A {'{COILING, MODERATE, single}'} coil is Playbook 1 &mdash; standard size, 1.5R. A {'{BREAKOUT READY, HIGH, Double Coil}'} coil is Playbook 3 &mdash; up-sized 25-50%, 2.5R+. Same engine, very different sizing. <strong className="text-white">Without CLASSIFY, you trade everything with the same playbook</strong>, which means leaving R on the table on the high-edge setups and over-sizing the low-edge ones. The 5-second classification is the highest-leverage 5 seconds in coil trading.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The 3 Reading Reflexes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The 3 Reading Reflexes</p>
          <h2 className="text-2xl font-extrabold mb-4">Build the scan habit</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CLASSIFY in 5 seconds requires three reflexes &mdash; trained instincts that fire automatically when you see specific visual cues. <strong className="text-amber-400">Wall reflex.</strong> <strong className="text-amber-400">Energy reflex.</strong> <strong className="text-amber-400">Tier reflex.</strong> Each is a single visual-to-decision mapping you build through repetition. Once trained, they stack together to make CLASSIFY effortless.</p>
          <ReadingReflexesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three reflex cards cycle. Each takes a specific visual signal and maps it directly to a classification output. <strong className="text-white">Wall Reflex</strong> turns wall brightness into phase in under 1 second. <strong className="text-white">Energy Reflex</strong> reads the Volatility row text directly into energy/compression in 1 second. <strong className="text-white">Tier Reflex</strong> reads the Ribbon row to spot Double Coils. Each is trained separately; together they make CLASSIFY happen on autopilot.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">REFLEX 1  ·  WALL REFLEX  ·  visual → phase</p>
              <p className="text-sm text-gray-400 leading-relaxed">The first reflex you train. Look at a Coil Box wall &mdash; instantly know the phase. <strong className="text-white">Faint = BUILDING (don&apos;t trade). Medium = COILING (start planning). Solid bright = BREAKOUT READY (orders staged).</strong> Train this on 30-50 historical coils across multiple assets. Open old charts where coils played out, look at each one, name the phase based on wall brightness alone, then verify by checking the Volatility row. After 20-30 reps, the reflex becomes automatic.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REFLEX 2  ·  ENERGY REFLEX  ·  row text → tier</p>
              <p className="text-sm text-gray-400 leading-relaxed">Second reflex. Look at the Volatility &amp; Squeeze row text &mdash; instantly know the energy class. <strong className="text-white">&ldquo;42% BUILDING&rdquo; = LOW. &ldquo;65% COILING&rdquo; = MODERATE. &ldquo;78% BREAKOUT READY&rdquo; = HIGH. &ldquo;90%+ BREAKOUT READY&rdquo; = EXTREME.</strong> The row also shows guidance text in plain English (PREPARE ENTRY / ALMOST READY / PATIENCE) which is the engine&apos;s own classification &mdash; trust it. Train by reading the row first, predicting the energy class, then verifying via the diamond tooltip when the coil fires.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REFLEX 3  ·  TIER REFLEX  ·  Ribbon row → single vs Double</p>
              <p className="text-sm text-gray-400 leading-relaxed">Third reflex. Look at the Ribbon row of the Command Center &mdash; instantly know if this is a Double Coil. <strong className="text-white">If the row text reads &ldquo;DOUBLE COIL&rdquo; while a Coil Box is active on the chart, you&apos;re in Playbook 3 territory.</strong> If it reads anything else (CURVING, COILED-only, DIVERGING), the coil is single-tier. The Ribbon row priority cascade ensures that DOUBLE COIL displays when both layers are compressed simultaneously. Train this by toggling the Ribbon row ON for a session and noting which active coils show DOUBLE COIL vs not.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REFLEX TRAINING  ·  the daily practice</p>
              <p className="text-sm text-gray-400 leading-relaxed">A 10-minute daily practice for 2 weeks builds all three reflexes. Open your charts. Find every active or recent coil. <strong className="text-white">For each coil:</strong> name the phase from walls, name the energy from the row, name the tier from the Ribbon. Then verify by checking the actual Pine values. Wrong-name reps are valuable &mdash; they recalibrate the visual mapping. Within 14 days the reflexes are automatic; CLASSIFY drops from 5 seconds to 3 seconds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMPOUND EFFECT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reflexes compound. Once Wall Reflex is automatic, you don&apos;t consume attention on phase &mdash; that attention is freed for Energy Reflex. Once Energy Reflex is automatic, attention frees for Tier Reflex. <strong className="text-white">Trained Coil Readers do all three reads with no conscious effort</strong> &mdash; the entire CLASSIFY step takes attention only on edge cases (when a reflex returns ambiguous). Untrained readers consume full attention on each step and burn out before completing the 4-step frame.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Reflexes are what separate operators who &ldquo;know coils&rdquo; from operators who can read them on a chart they&apos;ve never seen. Knowledge without reflex is slow; reflex without knowledge is reckless. <strong className="text-white">L11.14 gave you the knowledge. The reflex training is yours to build.</strong> Without it, every coil takes 30+ seconds to classify and you miss real-time setups; with it, classification is automatic and you actually catch the trades.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Step 3: PLAN === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Step 3: PLAN</p>
          <h2 className="text-2xl font-extrabold mb-4">Stage entry, stop, target during COILING</h2>
          <p className="text-gray-400 leading-relaxed mb-6">By the time CLASSIFY finishes, you know the coil&apos;s phase, energy, and tier. PLAN turns those reads into staged orders. <strong className="text-amber-400">Three orders to set up: entry at the diamond close, stop just outside the box, target at the playbook&apos;s R-multiple.</strong> Done correctly, PLAN takes about 10 seconds and happens entirely during COILING &mdash; before BREAKOUT READY arrives. When the diamond fires, you&apos;re not composing the trade; you&apos;re executing a pre-staged plan.</p>
          <PlanStagingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three lines populate sequentially. ENTRY (teal) goes at the next-bar close where the diamond will hypothetically fire. STOP (magenta) goes just outside the box on the opposite side of the breakout direction. TARGET (amber) goes at 1.5R for standard, 2.5R for HIGH energy or Double Coil. <strong className="text-white">All three orders are pre-staged in your broker before BREAKOUT READY arrives.</strong> The sequence is deliberate &mdash; entry first because it determines stop, stop second because it determines R-multiple, target third because it depends on both.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRY  ·  at the diamond close, not a price</p>
              <p className="text-sm text-gray-400 leading-relaxed">PLAN&apos;s entry order is a <strong className="text-white">market order conditional on the firing-bar close</strong>. You don&apos;t pre-stage a limit at a specific price &mdash; you commit to entering at whatever close fires the diamond. The reason: the squeeze release direction is determined BY the firing candle (close &gt; open = bull, otherwise bear). Pre-staging a limit price is guessing direction; the engine&apos;s job is to tell you direction at fire. Brokers that don&apos;t support &ldquo;market on bar close&rdquo; orders need manual execution &mdash; click within 5-10 seconds of bar close. This is part of why staging matters &mdash; the click should be reflexive, not deliberative.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOP  ·  just outside the box, opposite side</p>
              <p className="text-sm text-gray-400 leading-relaxed">Universal across all three coil playbooks. <strong className="text-white">Bull breakout = stop just below box bottom. Bear breakout = stop just above box top.</strong> The Coil Box itself is the structural invalidation point &mdash; if price re-enters the box and closes through the opposite wall, the breakout has failed. A typical buffer is 0.2-0.5 ATR below the box bottom (or above the box top). Tighter than that risks stopping out on noise; wider than that gives away R for no reason. The box edge is the right answer.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TARGET  ·  R-multiple from the classification</p>
              <p className="text-sm text-gray-400 leading-relaxed">From L11.14 S14 (Three Playbooks): <strong className="text-white">Standard Coil = 1.5R</strong>, <strong className="text-white">HIGH-Energy Coil = 2.5R</strong>, <strong className="text-white">Double Coil ★ = 2.5R+ with wider trail</strong>. The R-multiple is determined by the CLASSIFY output. Once entry and stop are set, the R-distance is computed; multiply by the playbook&apos;s R-multiple to get the target price. Some operators set TP in fractions (e.g. 50% off at 1.5R, 50% trailed) &mdash; valid; the R-multiple is the anchor target, not necessarily the only exit.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRE-STAGE BUFFER  ·  the 5-second click</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pre-stage all three orders during COILING. This means: write the entry-conditional, write the stop-loss, write the take-profit. Have them in the order ticket, ready to fire. <strong className="text-white">When the diamond drops at the firing bar close, you click ONCE.</strong> Total elapsed time from diamond appearing to order filled: under 5 seconds. Operators who compose the entire trade at the fire bar miss the entry by 1-3 bars on average &mdash; price has already moved 0.3-0.6R against the eventual stop, R:R is degraded. The pre-stage discipline pays for itself on every coil.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN PLAN DOESN&apos;T HAPPEN  ·  the failure mode</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator skips PLAN, waits to see the diamond, then composes the trade. Diamond drops, operator types entry, then computes stop, then computes target, then clicks. Elapsed time: 30-60 seconds. By that point, price has moved 0.5-1.0R in the direction. <strong className="text-white">Late entry produces a different trade</strong> &mdash; either a tighter stop (stops on noise) or a wider stop (lower R:R). Either way, the trade isn&apos;t the trade you planned. PLAN is the discipline that ensures the trade you click is the trade you analysed.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PLAN ONCE, FIRE FAST</p>
            <p className="text-sm text-gray-400 leading-relaxed">The principle behind PLAN: <strong className="text-white">do all the thinking during the slow phase (COILING), so the fast phase (BREAKOUT READY → fire) requires only execution</strong>. Operators who think slow and execute fast trade well. Operators who think slow and execute slow miss entries. Operators who think fast and execute fast often think wrong. Reserve thinking for COILING; reserve execution for the fire bar.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Step 4: MANAGE === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Step 4: MANAGE</p>
          <h2 className="text-2xl font-extrabold mb-4">Live trade management through the 5-bar tracker</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Diamond fires. Quality at fire bar (CONFIRMED / PROBABLE / SUSPECT). Trade entered. Now MANAGE takes over. <strong className="text-amber-400">The 5-bar post-fire tracker is your real-time decision tree.</strong> RUNNING by bar 2 = stay aggressive, hold for full target. STALLED by bar 3 = exit at break-even. Every bar from 1-5 has a decision attached; the operator&apos;s job is to read the tracker and execute.</p>
          <ManageLiveAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch three scenarios cycle: RUNNER (continue riding, +1.9R), NORMAL (scratch at break-even, +0.6R), DUD (exit at bar 3 with STALLED warning, -0.1R). <strong className="text-white">Notice how the DUD scenario triggers the EXIT signal at bar 3 well before the official bar-5 verdict.</strong> The framework catches losers early &mdash; you don&apos;t hold a DUD into reversal because the tracker tells you it&apos;s failing in real time.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BAR 1  ·  the early read</p>
              <p className="text-sm text-gray-400 leading-relaxed">First bar after the diamond. Travel value emerges. <strong className="text-white">RUNNING (&gt;0.5 ATR) at bar 1 is the strongest possible signal</strong> &mdash; price is racing in the breakout direction immediately. STALLED at bar 1 isn&apos;t fatal yet (single-bar noise happens), but combined with SUSPECT quality at fire it&apos;s a strong warning. SLOW (0.1-0.5 ATR) at bar 1 is the median &mdash; neutral, watch the next two bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BAR 2  ·  the continuation read</p>
              <p className="text-sm text-gray-400 leading-relaxed">Second bar. <strong className="text-white">RUNNING by bar 2 confirms the breakout</strong>. Trail your stop tighter, expand target to playbook max. SLOW or MOVING at bar 2 means the move is real but slower than ideal &mdash; consider taking 50% off at 1R if it gets there, hold the rest. STALLED by bar 2 (especially with bar 1 also slow) is a strong &ldquo;something is wrong&rdquo; signal &mdash; tighten stop to break-even, prepare to exit.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BAR 3  ·  THE COMMIT-OR-FOLD POINT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most important bar of the tracker. <strong className="text-amber-400">STALLED at bar 3 = DUD verdict locked.</strong> Even though the official verdict comes at bar 5, the empirical pattern is clear: STALLED at bar 3 reverses against the breakout direction within 4-8 bars in the vast majority of cases. Exit immediately at break-even or small loss. If RUNNING at bar 3, you have a real runner &mdash; trail aggressively. If MOVING at bar 3 (the median), hold and watch the next two bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BARS 4-5  ·  the final stretch</p>
              <p className="text-sm text-gray-400 leading-relaxed">For trades still open at bar 4: if RUNNING continues, hold for full target. If MOVING, take partial profit and trail. If STALLED for the first time at bar 4, exit &mdash; the breakout has clearly stalled. Bar 5 locks the official verdict (RUNNER / NORMAL / DUD). After bar 5, the tracker has done its job; from this point on, manage the trade with general trade management (Pulse trail, Risk Map TP levels) rather than the coil-specific tracker.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRIDE IS THE ENEMY OF MANAGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The hardest part of MANAGE is exiting a STALLED trade you were sure would run. The fire-bar quality might have been CONFIRMED. The CLASSIFY might have been textbook. The PLAN might have been perfect. <strong className="text-white">None of that matters once the tracker says STALLED at bar 3.</strong> The tracker is the engine&apos;s real-time honesty check &mdash; it sees follow-through that the fire-bar quality couldn&apos;t predict. Honour it. Operators who hold STALLED trades into reversals routinely lose 1-2R on what would have been a -0.1R clean exit.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">MANAGE IS THE COMPOUNDING EDGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">PLAN sets up the trade. MANAGE keeps the average win/loss favourable. Operators who PLAN well but MANAGE poorly hold DUDs into 1R+ losses, capping their long-run P&amp;L. <strong className="text-white">Operators who MANAGE well lose -0.1R on DUDs and +1.5R on RUNNERS</strong> &mdash; the asymmetry compounds. A trader can be only mediocre at PLAN and be highly profitable, IF MANAGE is sharp. The reverse is much harder.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Worked Example 1: Standard Coil === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Worked Example 1</p>
          <h2 className="text-2xl font-extrabold mb-4">Standard Coil — end-to-end</h2>
          <p className="text-gray-400 leading-relaxed mb-6">First end-to-end walkthrough. A typical Standard Coil &mdash; COILING phase, MODERATE energy, single-tier (no Double). The 4-step frame plays out cleanly. <strong className="text-amber-400">Outcome: +1.5R, RUNNER verdict, Playbook 1.</strong> This is the median tradeable coil &mdash; what about 70% of your tradeable coils will look like.</p>
          <Example1Anim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the operator walk all four steps. SPOT identifies the coil during COILING. CLASSIFY reads phase + energy + tier and decides Playbook 1. PLAN stages entry/stop/1.5R target. MANAGE watches the tracker, confirms RUNNER by bar 2, holds for full +1.5R target. <strong className="text-white">Total active engagement: ~30 seconds spread across the coil&apos;s lifetime.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 1  ·  SPOT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator scanning their 6-asset watchlist. Eye sweeps left to right. Asset 4 has an amber coil &mdash; medium walls, visible Coil Box. Eye stops, asset is flagged. <strong className="text-white">Time: 2 seconds.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 2  ·  CLASSIFY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Wall reflex: medium walls = COILING. Energy reflex: Volatility row reads &ldquo;58% COILING&rdquo; → MODERATE energy. Tier reflex: Ribbon row reads CURVING (not DOUBLE COIL) → single coil. Output tuple: <strong className="text-white">{'{COILING, MODERATE, single}'}</strong>. Maps to Playbook 1 &mdash; Standard Coil. <strong className="text-white">Time: 4 seconds.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 3  ·  PLAN</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry: at next diamond close (committed, conditional order). Stop: 0.3 ATR below box bottom (just outside box). Target: 1.5R above entry (Playbook 1 anchor). Position size: standard (no up-size, no down-size). Pre-staged in broker. <strong className="text-white">Time: 10 seconds.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STEP 4  ·  MANAGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coil advances to BREAKOUT READY. Diamond drops on bull breakout candle. Tooltip: CONFIRMED (3/3 quality factors), MODERATE energy, single coil. Trade fires. Bar 1: SLOW (+0.4 ATR). Bar 2: RUNNING (+0.9 ATR) &mdash; running confirmed, trail tighter. Bar 3: RUNNING (+1.2 ATR). Bar 4: hits 1.5R target — <strong className="text-white">+1.5R locked.</strong> Final verdict at bar 5: RUNNER ✓. <strong className="text-white">Total trade time: ~10-15 minutes on 4h, depending on TF.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHAT MADE IT WORK</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three things: <strong className="text-white">CLASSIFY produced the right tuple</strong> (no over-promotion to Playbook 3 just because the operator wanted a bigger trade); <strong className="text-white">PLAN was pre-staged</strong> (entry filled within 5 seconds of diamond, no slippage); <strong className="text-white">MANAGE trusted the bar-2 RUNNING signal</strong> (operator didn&apos;t take 50% off too early on a clean runner). Each step done correctly compounds. Each step skipped or rushed degrades the outcome.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THIS IS THE BREAD-AND-BUTTER COIL</p>
            <p className="text-sm text-gray-400 leading-relaxed">Standard Coils account for the majority of tradeable coil setups. Master Example 1 and you&apos;ve mastered ~70% of your coil P&amp;L. Examples 2 (Double Coil) and 3 (Failed Coil) are the high-tier and edge-case variants. <strong className="text-white">If only one example sticks, make it this one.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Worked Example 2: Double Coil === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Worked Example 2</p>
          <h2 className="text-2xl font-extrabold mb-4">★ Double Coil — end-to-end</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Second walkthrough &mdash; same 4-step frame, very different outcome scale. <strong className="text-amber-400">A Double Coil ★ in BREAKOUT READY phase with HIGH energy.</strong> Walls glow, Ribbon shows DOUBLE COIL, Coil Box is bright amber with star marker. The classification is unambiguous Playbook 3. The trade is up-sized 25-50% with a 2.5R target. Outcome: +2.5R, RUNNER ★, with the price action extending much further than typical single-tier coils.</p>
          <Example2Anim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the same 4-step structure but notice the differences. The wall is glowing orange-amber (BREAKOUT READY at HIGH energy). Ribbon lines visibly converge inside the box. The ★ marker pulses above the box. PLAN&apos;s target is 2.5R instead of 1.5R. MANAGE&apos;s tracker shows aggressive RUNNING by bar 2. <strong className="text-white">The framework is identical, but the trade output is materially larger.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SPOT  ·  the bright walls catch the eye</p>
              <p className="text-sm text-gray-400 leading-relaxed">BTCUSD 4h. The Coil Box has been visible for 14 bars and is now solid amber with glow. Even at peripheral attention, the brightness pulls the eye. <strong className="text-white">SPOT takes about 1 second on BREAKOUT READY coils &mdash; they shout</strong>, where COILING coils suggest. The longer the coil sits in BREAKOUT READY, the more aggressively it announces itself.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLASSIFY  ·  the Double Coil reflex catches the ★</p>
              <p className="text-sm text-gray-400 leading-relaxed">Wall reflex: bright solid walls = BREAKOUT READY. Energy reflex: row reads &ldquo;82% BREAKOUT READY&rdquo; → HIGH (near EXTREME) energy. Tier reflex: Ribbon row reads <strong className="text-white">DOUBLE COIL</strong>. Output tuple: <strong className="text-white">{'{BREAKOUT READY, HIGH, ★ Double Coil}'}</strong>. Maps to <strong className="text-amber-400">Playbook 3 &mdash; the highest-edge tier.</strong> Operator commits to up-sized position and 2.5R target. The Tier Reflex is the difference-maker here &mdash; without it, this would be classified as a Playbook 2 (HIGH-Energy single) and traded at lower R-multiple.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAN  ·  up-sized + wider target</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry at next diamond close (same as Playbook 1). Stop just outside box (same as Playbook 1). Target at <strong className="text-white">2.5R</strong> &mdash; the Playbook 3 anchor. Position size: <strong className="text-white">+33% over standard</strong> (up-sized to reflect higher conviction). Some operators trail this trade more loosely than standard, allowing room for the typical Double Coil overextension. Pre-staged in broker as a 3-leg conditional order.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MANAGE  ·  the runner verdict locks early</p>
              <p className="text-sm text-gray-400 leading-relaxed">Diamond drops on a powerful bull candle. Tooltip: CONFIRMED quality (3/3 factors), HIGH energy (78%), ★ DOUBLE COIL flag. Bar 1: RUNNING (+1.1 ATR) &mdash; immediately past the runner threshold. Bar 2: RUNNING (+1.6 ATR) &mdash; verdict effectively locked. <strong className="text-white">Operator trails stop wider, lets the trade extend.</strong> Bar 5 locks RUNNER ★. Trade hits 2.5R target by bar 6-7. <strong className="text-white">+2.5R on an up-sized position = ~3.3R equivalent at standard sizing.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY DOUBLE COILS ARE THE GOLD TIER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Double Coils (Ribbon + BB/KC compressed simultaneously) statistically produce <strong className="text-white">higher RUNNER rates than single-tier coils</strong>. The reasoning: when both volatility AND directional momentum are at zero, the eventual release recruits both engines simultaneously &mdash; a bigger combined energy release. This is why the playbook supports 2.5R+ targets and aggressive trail. Most operators trade 2-5 Double Coils per month per asset; each one is worth the patience of waiting through 10-15 single-tier setups.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TIER REFLEX EARNS ITS KEEP HERE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Without the Tier Reflex (S04), this trade would have been classified as Playbook 2 and traded for 1.5R or 2R at standard size. The Tier Reflex catches the ★ DOUBLE COIL signal and unlocks Playbook 3 sizing. <strong className="text-white">The cumulative effect across a year of trading: significantly more R captured on the highest-edge setups.</strong> This is why CLASSIFY&apos;s third reflex matters &mdash; it&apos;s low-frequency but high-leverage.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Worked Example 3: Failed Coil === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Worked Example 3</p>
          <h2 className="text-2xl font-extrabold mb-4">Failed Coil — recognition + recovery</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Third walkthrough &mdash; the cautionary one. <strong className="text-amber-400">A coil that produces a SUSPECT-quality breakout, STALLED tracker, exits at bar 3 break-even.</strong> The framework catches the failure early. The operator loses essentially nothing (-0.1R). Without the framework, this same setup would have held for 1-2R loss. Demonstrates that MANAGE is the asymmetric-payoff step &mdash; small losses on losers, full wins on winners.</p>
          <Example3Anim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the same 4-step structure unfold. The first three steps proceed normally &mdash; SPOT, CLASSIFY, PLAN. Then at fire, quality reads SUSPECT. Tracker confirms STALLED by bar 3. The exit signal lights up. Operator exits cleanly. <strong className="text-white">The trade lost essentially nothing because the framework caught the failure before it became expensive.</strong> This is the asymmetric edge of disciplined coil-reading.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SPOT  ·  another active coil on the watchlist</p>
              <p className="text-sm text-gray-400 leading-relaxed">EURUSD 15m. Coil has been forming for 8 bars, walls are medium (COILING). Spotted on the watchlist sweep. <strong className="text-white">Note: SPOT doesn&apos;t prejudge the trade quality.</strong> Every active coil gets spotted; the filtering happens in CLASSIFY. SPOT is intentionally low-bar &mdash; you spot everything, then classify decides what&apos;s tradeable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CLASSIFY  ·  the warning signs were already there</p>
              <p className="text-sm text-gray-400 leading-relaxed">Wall reflex: medium walls = COILING. Energy reflex: row reads &ldquo;38% COILING&rdquo; → LOW energy (close to MINIMAL). Tier reflex: Ribbon row reads CURVING (not DOUBLE COIL) → single coil. Tuple: <strong className="text-white">{'{COILING, LOW, single}'}</strong>. <strong className="text-amber-400">This already maps to a marginal Playbook 1 setup &mdash; LOW energy means low edge.</strong> The disciplined response would be to skip; the actual operator chose to trade at half-size. Both are defensible; the half-size trade is what plays out below.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAN  ·  half-size given the LOW energy</p>
              <p className="text-sm text-gray-400 leading-relaxed">Entry, stop, target staged at standard ratios (1.5R target). <strong className="text-white">Position size halved because of LOW energy classification.</strong> This is a defensive move &mdash; if the setup proves marginal, the loss is contained. If it works, the win is also halved &mdash; but on a LOW-energy setup, the expected value of full size is too thin to justify standard sizing. Half-size on marginal setups is one of the framework&apos;s self-correcting features.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MANAGE  ·  the framework catches the failure</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coil advances to BREAKOUT READY. Diamond drops on a weak bull candle. Tooltip: <strong className="text-white">SUSPECT quality (1/3 factors)</strong> &mdash; momentum 45% (FAIL), volume 0.7x (FAIL), trend-aligned (PASS). Bar 1: SLOW (+0.2 ATR). Bar 2: STALLED (+0.1 ATR). <strong className="text-amber-400">Bar 3: STALLED (+0.05 ATR) — exit signal triggers.</strong> Operator exits at break-even or marginal loss (-0.1R). At bar 5, official verdict locks: DUD ✗. <strong className="text-white">Without the bar-3 exit, the trade would have reversed and stopped out for -1R.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE LESSON  ·  asymmetric payoffs</p>
              <p className="text-sm text-gray-400 leading-relaxed">The framework didn&apos;t prevent the failure &mdash; the failure was structural to the coil&apos;s LOW energy and SUSPECT quality. <strong className="text-white">What the framework prevented was the loss multiplier.</strong> Without MANAGE, the same setup costs -1R. With MANAGE, it costs -0.1R. Across 100 trades with similar setups, that&apos;s the difference between -100R and -10R from the loser tail. <strong className="text-amber-400">Asymmetric payoffs aren&apos;t about winning more &mdash; they&apos;re about losing less when you&apos;re wrong.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECOVERY  ·  what to do next</p>
              <p className="text-sm text-gray-400 leading-relaxed">Failed coil exited cleanly. Now what? <strong className="text-white">Watch for the reversal pattern.</strong> DUD coils often produce reversal opportunities &mdash; the failed bull breakout often becomes the entry signal for a bear trade in the next 4-8 bars. Your CLASSIFY stack tells you the regime context; if the regime supports a reverse direction (e.g. RANGE regime favours TS reversals after failed breakouts), the post-DUD reversal is sometimes the higher-edge trade. Don&apos;t force it &mdash; but don&apos;t ignore it either.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THIS IS WHAT GOOD MANAGE LOOKS LIKE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Failed coils happen. The framework doesn&apos;t prevent them &mdash; it limits their cost. <strong className="text-white">Operators who internalise the bar-3 STALLED exit rule routinely turn what would be -1R losses into -0.1R scratches.</strong> Across hundreds of trades, this is one of the largest contributors to long-run profitability in coil trading. The CLASSIFY tuple {'{COILING, LOW, single}'} doesn&apos;t guarantee a loser &mdash; but when the loser arrives, the framework is what makes the loss contained.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Multiple Coils on One Chart === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Multiple Coils</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the active. Ignore the history.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A long-running chart accumulates coils. CIPHER&apos;s history array holds up to 10 historical Coil Boxes plus an active one if a squeeze is in progress. Operators new to coil-reading often try to find patterns across the historical boxes &mdash; <strong className="text-amber-400">don&apos;t</strong>. Historical coils are locked Pine artifacts, they cannot fire again. The only one that can produce a trade is the active rightmost box. Train your eye to ignore the rest.</p>
          <MultiCoilAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the chart with 4 coils visible &mdash; 3 historical (faded amber) and 1 active (bright). The eye cursor scans, then locks on the rightmost active box. <strong className="text-white">The historical coils provide context (what kinds of breakouts this asset produced recently) but no opportunity</strong>. Reading them as live setups wastes attention and frequently leads to phantom trades on long-locked boxes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL DISTINCTION  ·  brightness tells you which is which</p>
              <p className="text-sm text-gray-400 leading-relaxed">Active coils have <strong className="text-white">bright walls + saturated fill</strong>. Historical (locked) coils have <strong className="text-white">significantly faded walls and fill</strong> &mdash; the Pine renders them at the post-Death styling, which is intentionally muted. The visual distinction is sharp once you&apos;ve trained for it: bright = read it, faded = ignore it. Operators who confuse the two trade phantom setups on dead coils.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RIGHT-EDGE TEST  ·  the definitive check</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you&apos;re unsure whether a coil is active or historical, <strong className="text-white">look at the right edge</strong>. Active coils touch (or are within 1 bar of) the live bar. Historical coils have a gap between their right edge and the live bar &mdash; usually clearly visible. The Pine ratchets the right edge of the active box each bar; once the box dies, the right edge stops moving and the gap grows over time.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HISTORY AS CONTEXT  ·  what you can learn</p>
              <p className="text-sm text-gray-400 leading-relaxed">Historical coils ARE useful &mdash; just not as trade signals. <strong className="text-white">Look at recent breakout directions</strong>: 3 bull breakouts in a row suggests the asset is in trend regime. <strong className="text-white">Look at how far moves extended</strong>: 2.0+ ATR runners across recent coils suggests the asset produces clean breakouts; 0.4 ATR average suggests it produces duds. <strong className="text-white">Look at coil frequency</strong>: 4 coils in 2 weeks suggests an active compression environment. All of this is context for the next active coil &mdash; not opportunity in itself.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 11TH COIL  ·  oldest is pruned</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine&apos;s <code className="text-amber-400 font-mono text-xs">coil_history</code> array caps at 10 boxes. When the 11th coil dies, the oldest is deleted via <code className="text-amber-400 font-mono text-xs">array.shift</code>. <strong className="text-white">This is by design</strong> &mdash; TradingView has drawing-object limits, and infinite history would eventually crash the script. In practice you rarely see all 10 visible at once unless you&apos;re looking at a heavily-coiled long timeframe. On 4h+ timeframes, 3-5 historical coils visible is typical.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TWO ACTIVE COILS  ·  it doesn&apos;t happen</p>
              <p className="text-sm text-gray-400 leading-relaxed">There is never more than ONE active coil per chart. <strong className="text-white">Pine maintains a single active reference</strong>; when a squeeze ends (Death), the box gets pushed to history and the reference clears until the next BIRTH. If you see what looks like two bright coils overlapping, you&apos;re actually seeing one active and one very recently locked &mdash; the locked one is fading on the next render cycle. Never trade based on the assumption of two simultaneously active coils.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">SIMPLE RULE  ·  read the bright one</p>
            <p className="text-sm text-gray-400 leading-relaxed">Multi-coil charts can look intimidating. <strong className="text-white">The simple rule cuts through the noise: read the bright one</strong>. If only historical coils are visible, no trade. If one bright coil is visible, that&apos;s the only one you read. The rest of the visible amber is past, not future.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Cross-Asset Coil Scanning === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Cross-Asset Scanning</p>
          <h2 className="text-2xl font-extrabold mb-4">Where to look, when</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A single asset gives you ~2-5 tradeable coils per week. A 6-asset watchlist gives you ~20-30. The math heavily favours multi-asset scanning &mdash; if you can SPOT efficiently across the watchlist, you have many more setups to filter against. <strong className="text-amber-400">The discipline is to prioritise where to deepen attention based on coil progression</strong>, not give all assets equal attention.</p>
          <CrossAssetAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch three snapshots through a trading session. Morning: most assets quiet, BTCUSD has a pre-squeeze warning &mdash; flag it for monitoring. Mid-session: BTCUSD now COILING (high priority), XAUUSD BUILDING (medium). Late session: BTCUSD BREAKOUT READY, XAUUSD advanced to COILING, NAS100 just fired. <strong className="text-white">The priority badges shift dynamically as coils advance through their lifecycle.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">3-TIER PRIORITY SYSTEM</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">HIGH</strong> = active coil at COILING or BREAKOUT READY phase. Maximum attention &mdash; PLAN should already be staged. <strong className="text-white">MED</strong> = pre-squeeze warning OR active BUILDING coil. Monitor every 5-10 minutes for advancement. <strong className="text-white">LOW</strong> = NORMAL volatility, no warning, no coil. Glance during scans, no deep attention. The priority assignment is automatic from the engine state &mdash; you don&apos;t decide priority, you read it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WATCHLIST COMPOSITION  ·  diversify the rhythms</p>
              <p className="text-sm text-gray-400 leading-relaxed">Mix asset classes so coils develop on different rhythms: 1-2 forex pairs (slower, quieter) + 1-2 indices (cleaner trends) + 1-2 crypto (faster, bigger moves) + 0-1 stocks (lowest frequency, big setups). <strong className="text-white">A monoculture watchlist (e.g. 6 forex pairs) tends to have correlated coils</strong> &mdash; they all compress together (correlation tax). A diversified watchlist gives independent setups, more frequent opportunities, and lower regime-correlation risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SESSION-AWARE SCANNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Different sessions activate different assets. <strong className="text-white">London open (07-08 UTC)</strong>: forex priority. <strong className="text-white">NY open (12:30-14 UTC)</strong>: indices and US stocks priority. <strong className="text-white">Asia hours (00-06 UTC)</strong>: crypto priority. Adjust which assets you watch most actively by session &mdash; a forex pair coiling at 23:00 UTC is technically valid but the post-fire follow-through depends on when the major sessions reactivate. Asset + session is its own filter.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PRIORITY ROTATION  ·  what to do, when</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every 5-10 minutes during active hours: <strong className="text-white">peripheral SPOT scan across the full watchlist</strong> (3 seconds). Every 1-2 minutes on HIGH priority assets: <strong className="text-white">deeper read of phase + energy + tier</strong> (5-10 seconds). On firing diamonds: <strong className="text-white">execute the staged trade plan</strong>. This rotation is rhythmic &mdash; LOW assets get a glance, MED assets get a check, HIGH assets get attention. Once internalised, it doesn&apos;t feel like work &mdash; it feels like a low-grade hum of attention.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MAX 2 HIGH AT ONCE  ·  the attention ceiling</p>
              <p className="text-sm text-gray-400 leading-relaxed">If 3+ assets reach HIGH priority simultaneously, you&apos;ve hit your attention ceiling. <strong className="text-white">Pick the 2 highest-edge setups (best phase + best energy + best tier) and ignore the rest</strong> &mdash; even if they&apos;re tradeable in isolation. Trying to monitor 3+ active BREAKOUT READY coils at once degrades MANAGE on every trade. Better to take 2 trades cleanly than 4 sloppily. The 2-high ceiling is a discipline, not a frequency target.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">SCANNING IS A LIGHT-TOUCH SKILL</p>
            <p className="text-sm text-gray-400 leading-relaxed">Cross-asset scanning sounds intense; it isn&apos;t. <strong className="text-white">Done correctly, it&apos;s 30-60 seconds of attention per hour</strong> &mdash; a glance, a priority update, a deeper read on what advanced. The rest of your time goes elsewhere. Operators who try to actively watch 6 charts continuously burn out within weeks; operators who scan rhythmically maintain coil discipline for years. The light touch is the sustainable touch.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Coil + PX/TS Confluence === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Signal Engine Confluence</p>
          <h2 className="text-2xl font-extrabold mb-4">When PX or TS fires inside a coil</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sometimes the Signal Engine (PX or TS) fires while a Coil Box is still active. This is a <strong className="text-amber-400">confluence event</strong> &mdash; two engines agreeing on a setup. The reading is different depending on which signal fires inside the coil. Knowing how to interpret these makes the difference between fading the signal and seizing high-confluence setups.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PX FIRES INSIDE COIL  ·  the rare confluence</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX requires a Pulse flip + 4-gate pipeline pass. Inside a coil, Pulse rarely flips because price is compressed and Pulse is ratcheted. <strong className="text-white">When PX does fire inside an active coil, it&apos;s a strong signal</strong> &mdash; the structural break is happening AT the compression point, which often coincides with or precedes the coil firing. Treat it as: take the PX trade with the coil-aware stop (just outside box), expect the diamond to drop within 1-3 bars confirming the direction. If diamond drops in agreement with PX direction = high-confidence trade.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS FIRES INSIDE COIL  ·  the snap-pre-fire</p>
              <p className="text-sm text-gray-400 leading-relaxed">TS detects tension snaps. Inside a coil, tension is by definition compressed &mdash; so TS firing inside a coil is unusual but meaningful. <strong className="text-white">It typically happens near the END of the coil&apos;s life</strong>, when tension built up against one side of the box snaps back. The TS signal frequently precedes the coil&apos;s diamond by 1-2 bars. Treat it as early-direction confirmation: TS Long inside coil = expect bull diamond. TS Short inside coil = expect bear diamond. If diamond agrees, the trade has been pre-confirmed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PX FIRES OPPOSITE COIL DIRECTION  ·  rare and tricky</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coil produces bull diamond, but PX immediately fires Short on the next bar. This is rare but happens on failed breakouts. <strong className="text-white">The PX is responding to the FAILURE of the coil breakout</strong> &mdash; a bull diamond that doesn&apos;t follow through often produces a structural flip in the opposite direction. If the coil&apos;s 5-bar tracker reads STALLED, this is exactly the &ldquo;recovery&rdquo; pattern from S09 example 3. Take the PX in the new direction, not the original coil direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CONFLUENCE QUALITY OVERRIDES  ·  the additive read</p>
              <p className="text-sm text-gray-400 leading-relaxed">When both engines agree, the per-engine quality scoring still applies. <strong className="text-white">Coil quality CONFIRMED + PX Strong = highest-edge confluence trade</strong>. Coil quality SUSPECT + PX Standard = still SUSPECT (low quality + low quality = low quality). Don&apos;t treat confluence as automatic up-tier &mdash; it&apos;s only valuable when both individual signals are themselves high-quality. The reverse is also true: low-quality on either side means low-quality confluence.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING FOR CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Genuine high-quality confluence (both engines agreeing on direction with both producing CONFIRMED quality) deserves up-sizing. <strong className="text-white">Standard rule: +20-40% over individual-engine sizing</strong>. So if a coil-only setup would be standard size, the same setup with a CONFIRMED PX Strong agreement is +25-30% size. The boost reflects the genuinely higher base-rate edge of two independent engines agreeing.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">CONFLUENCE IS THE EXCEPTION, NOT THE RULE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Most coil setups happen without simultaneous PX or TS confluence &mdash; coils and signals don&apos;t share triggers, so simultaneous fires are rare. <strong className="text-white">Don&apos;t WAIT for confluence to take a coil trade</strong> &mdash; the average coil trades cleanly on its own framework. Confluence is a bonus when it appears; absence isn&apos;t a flaw. Coil + PX/TS confluence happens maybe 1-2 times per week on a primary asset.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — The 5 Coil Failure Patterns === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The 5 Failure Patterns</p>
          <h2 className="text-2xl font-extrabold mb-4">Recognise them. Recover quickly.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Coil trades fail in five distinct patterns. Each has its own recognition signature and its own recovery action. Operators who learn the patterns identify failures within 1-2 bars and exit cleanly &mdash; sometimes even taking the reversal as a fresh trade. Operators who don&apos;t recognise patterns hold failed trades for full stop, leaving R on the table.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE 1  ·  IMMEDIATE FAKEOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pattern</strong>: Diamond fires direction X, bar 1 already shows STALLED. Often occurs on SUSPECT-quality breakouts in VOLATILE regime. <strong className="text-white">Recognition</strong>: bar 1 travel below 0.2 ATR, often slightly negative. <strong className="text-white">Recovery</strong>: exit immediately at break-even or small loss; the engine has already self-corrected on bar 1. Don&apos;t wait for bar 3 confirmation &mdash; the bar-1 STALLED on a SUSPECT diamond is the fastest exit signal in the framework.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE 2  ·  STALLED-AND-REVERSED</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pattern</strong>: Bars 1-3 SLOW or STALLED, bar 4 reverses against the breakout, bar 5 prints further against. <strong className="text-white">Recognition</strong>: tracker shows declining travel values 0.3 → 0.2 → 0.1 → -0.1 → -0.3 ATR. The DUD verdict locks at bar 5 with negative travel. <strong className="text-white">Recovery</strong>: standard exit at bar 3 STALLED, then watch for an opposite-direction signal (TS, PX, or another coil) to potentially trade the reversal. The original failed direction often becomes the entry signal for the actual reversal trade.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE 3  ·  EXTENDED CONSOLIDATION (NORMAL VERDICT)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pattern</strong>: Travel hits 0.4-0.7 ATR by bar 3 but never reaches 1.0 ATR. Final NORMAL verdict at bar 5. <strong className="text-white">Recognition</strong>: tracker shows MOVING with travel between dud and runner thresholds. <strong className="text-white">Recovery</strong>: scratch at break-even or take small profit at 0.7-0.8R. NORMAL verdict trades have neutral or slightly negative expected value if held to full target &mdash; the runner threshold isn&apos;t hit, but the move doesn&apos;t reverse fully. Take the small win and move on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE 4  ·  WICK-AND-FAIL</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pattern</strong>: Bar 1 spikes to 0.8 ATR but closes lower. Bar 2 retraces. Bar 3 STALLED. <strong className="text-white">Recognition</strong>: large initial wick (intra-bar) but weak close. The fire-bar quality often reads CONFIRMED (the close was technically directional) but the post-fire structure shows immediate distribution. <strong className="text-white">Recovery</strong>: tighten stop aggressively after bar 1, exit if bar 2 retraces past entry. Often these patterns produce sharp reversal opportunities &mdash; the wick was buying or selling exhaustion, and price tends to move strongly opposite within 5-10 bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FAILURE 5  ·  HEAD-FAKE THEN RUN OPPOSITE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Pattern</strong>: Diamond fires direction X. Bars 1-2 show RUNNING in direction X (looks legit). Bar 3 reverses sharply. By bar 5, price is 1+ ATR in direction NOT-X. <strong className="text-white">Recognition</strong>: tracker shows RUNNING then sharp reversal &mdash; the rare but expensive failure. Often happens on news or institutional flow that wasn&apos;t in CIPHER&apos;s read. <strong className="text-white">Recovery</strong>: this is the hardest failure to manage. Standard rule: stop at the box edge regardless of how good bars 1-2 looked &mdash; if price re-enters and closes through the opposite wall, exit immediately, even at -0.5R. The head-fake-then-run pattern is uncommon but accounts for most of the &ldquo;clean coil that turned into 2R loss&rdquo; stories.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PATTERN FREQUENCY  ·  in aggregate</p>
              <p className="text-sm text-gray-400 leading-relaxed">Across many coil trades: <strong className="text-white">Failure 1 (immediate fakeout)</strong> ~10-15% of fired coils. <strong className="text-white">Failure 2 (stalled-reversed)</strong> ~15-20%. <strong className="text-white">Failure 3 (NORMAL)</strong> ~20-25%. <strong className="text-white">Failure 4 (wick-and-fail)</strong> ~5-8%. <strong className="text-white">Failure 5 (head-fake)</strong> ~3-5%. Combined with successful runners (~30-40%), this accounts for ~100% of coil outcomes. <strong className="text-amber-400">The framework targets the 30-40% runner pile while keeping losses contained on the 60-70% non-runner pile.</strong></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PATTERN RECOGNITION COMPOUNDS</p>
            <p className="text-sm text-gray-400 leading-relaxed">After 50-100 coil trades, you&apos;ll start recognising these patterns within the first 1-2 bars. <strong className="text-white">Pattern recognition is faster than rule-checking</strong> &mdash; instead of verifying &ldquo;is travel below 0.3 ATR?&rdquo; you&apos;ll just see &ldquo;Failure 1&rdquo; and exit. This is the highest-tier coil-reading skill, and it only develops through reps. Track your coil trades by failure pattern in your journal &mdash; the patterns will become visual reflexes within a quarter.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Coil Alerts === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Coil Alerts</p>
          <h2 className="text-2xl font-extrabold mb-4">Two Pine alerts that automate the SPOT step</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When you can&apos;t maintain a peripheral watch, CIPHER has two built-in alerts that handle the SPOT step for you. <strong className="text-amber-400">Squeeze Breakout</strong> fires when a diamond drops on any tracked asset. <strong className="text-amber-400">Double Coil</strong> fires when a Double Coil first activates. Set them once per asset; your phone or browser becomes your Coil Spotter.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ALERT 1  ·  SQUEEZE BREAKOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine alert ID: <code className="text-amber-400 font-mono text-xs">&ldquo;Squeeze Breakout&rdquo;</code>. Fires on <code className="text-amber-400 font-mono text-xs">squeeze_fire = true</code> &mdash; the bar a coil&apos;s squeeze releases. <strong className="text-white">Alert message includes</strong>: &ldquo;CIPHER PRO &mdash; Squeeze released! Compressed energy now firing. Check tooltip for direction, energy score, and breakout quality.&rdquo; This alert tells you a coil JUST FIRED &mdash; you need to be at the chart within minutes to read the diamond&apos;s tooltip and execute. Best for swing TFs (1h+) where you have time between fire and follow-through. On scalp TFs, the alert often arrives after the optimal entry window has closed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ALERT 2  ·  DOUBLE COIL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine alert ID: <code className="text-amber-400 font-mono text-xs">&ldquo;Double Coil&rdquo;</code>. Fires on <code className="text-amber-400 font-mono text-xs">dc_just_started = true</code> &mdash; the bar a Double Coil first activates. <strong className="text-white">Alert message</strong>: &ldquo;CIPHER PRO &mdash; DOUBLE COIL active! Ribbon + BB/KC both compressed simultaneously. Highest energy state &mdash; major breakout imminent.&rdquo; This is the more valuable of the two &mdash; it fires BEFORE the breakout, giving you time to PLAN. Set this on every asset you trade. When it fires, drop what you&apos;re doing and engage the 4-step frame.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ALERT SETUP  ·  per-asset, per-TF</p>
              <p className="text-sm text-gray-400 leading-relaxed">In TradingView: right-click chart &rarr; Add Alert &rarr; Condition: Atlas Cipher Pro &rarr; alert from list (Squeeze Breakout / Double Coil) &rarr; Options (push notification, email, webhook). <strong className="text-white">Set both alerts on each asset/TF combo you trade</strong>. For a 6-asset watchlist on 15m + 4h, that&apos;s 6 &times; 2 &times; 2 = 24 alerts. Sounds like a lot but they&apos;re configured once and run forever. The alerts respect TV&apos;s once-per-bar mechanism, so you won&apos;t get flooded.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PHONE WORKFLOW  ·  the alert-driven trader</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some operators run entirely on alerts: phone vibrates, glance at message, decide whether to engage. <strong className="text-white">Squeeze Breakout</strong> on a low-priority asset = ignore. <strong className="text-white">Double Coil</strong> on your primary asset = open the chart. This pattern fits operators with day jobs or focus-intensive non-trading work. The cost is missing the COILING-phase prep window &mdash; alerts only catch BREAKOUT (post-fire) or DOUBLE COIL (mid-coil), not the early phases. Trade-off: less prep time, more passive operation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIMITATIONS  ·  what alerts don&apos;t cover</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pre-squeeze warnings don&apos;t have a Pine alert in CIPHER PRO. BUILDING / COILING / BREAKOUT READY phase transitions also don&apos;t fire alerts. <strong className="text-white">If you want alerts on those, you&apos;d need to write your own custom alert</strong> (TradingView allows this with custom conditions). Most operators rely on the two built-in alerts plus a 5-10 minute watchlist scan during active sessions &mdash; that combination catches everything important.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">ALERTS &gt; STARING</p>
            <p className="text-sm text-gray-400 leading-relaxed">Operators who try to actively SPOT 8 hours per day burn out. Operators who set the two CIPHER alerts and respond when they fire trade for years. <strong className="text-white">Alerts aren&apos;t a substitute for skill &mdash; they&apos;re the delivery mechanism for it.</strong> The 4-step frame still applies; alerts just remove the SPOT burden so you can focus on the deeper steps.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Reading Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Reading Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every new Coil Reader falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable mistakes appear when operators first start applying the 4-step frame in real time. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  TRADING HISTORICAL COILS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator sees a faded amber Coil Box in the middle of the chart, mistakes it for active, tries to enter on the next bar. <strong className="text-white">Historical coils are locked Pine artifacts &mdash; they cannot fire again.</strong> The visual brightness distinction is sharp once trained: bright = active, faded = historical. The right-edge test is the definitive check &mdash; only coils touching the live bar can produce trades.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  ENTERING DURING COILING (PRE-DIAMOND)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coil reaches BREAKOUT READY. Operator anticipates direction based on recent price bias, enters before the diamond drops. <strong className="text-white">The diamond direction is determined BY the firing candle, not by your bias.</strong> Pre-diamond entries get whipsawed by the final compression bars. Wait for the diamond. Always.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  SKIPPING CLASSIFY  ·  trading every coil the same way</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator spots coil, jumps straight to PLAN with default 1.5R Playbook 1 sizing. Misses HIGH energy and Double Coil opportunities, undertrades them. <strong className="text-white">CLASSIFY is the highest-leverage 5 seconds in coil trading</strong> &mdash; without it you can&apos;t differentiate Playbook 1 (1.5R, standard) from Playbook 3 (2.5R+, up-sized). Skipping it leaves R on the table on every high-tier setup.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  HOLDING STALLED-AT-BAR-3 TRADES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tracker reads STALLED at bar 3. Operator holds, hoping for recovery. <strong className="text-white">STALLED at bar 3 = DUD verdict locked.</strong> The empirical pattern is that STALLED-bar-3 trades reverse against the breakout direction within 4-8 bars in the vast majority of cases. Holding turns a -0.1R clean exit into a -1R full stop. The bar-3 STALLED rule is the framework&apos;s biggest asymmetric-payoff lever &mdash; honour it.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  STARING INSTEAD OF SCANNING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator sits on one chart for hours waiting for a coil. Misses 5 coils on other watchlist assets in the meantime. <strong className="text-white">SPOT is peripheral, not focused</strong> &mdash; the multi-chart layout exists for a reason. A 6-asset watchlist gives 4-6x the setup frequency of a single chart. Single-chart operators trade 2-3 coils per week; multi-chart scanners trade 10-15. The math heavily favours scanning.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  NO ALERTS  ·  trying to manually monitor 8 hours per day</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operator refuses to set CIPHER&apos;s built-in alerts, tries to maintain visual watch all session. <strong className="text-white">Burns out within 2-3 weeks</strong>, then under-trades for the next month while recovering. The two CIPHER alerts (Squeeze Breakout, Double Coil) handle the SPOT step automatically &mdash; they&apos;re the difference between sustainable coil-trading and burnout-driven trading. Set them once per asset/TF; let them work for you indefinitely.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Coil Reader Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to the Coil Operator cheat sheet from L11.14. Reference both as you build the rhythm.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 4-Step Frame</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">1. SPOT</strong> &middot; 3s &middot; scan watchlist for amber</p>
                <p><strong className="text-white">2. CLASSIFY</strong> &middot; 5s &middot; phase + energy + tier</p>
                <p><strong className="text-white">3. PLAN</strong> &middot; 10s &middot; entry + stop + target staged</p>
                <p><strong className="text-white">4. MANAGE</strong> &middot; live &middot; watch the 5-bar tracker</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 3 Reading Reflexes</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Wall Reflex</strong> &mdash; brightness → phase (BUILDING / COILING / READY)</p>
                <p><strong className="text-white">Energy Reflex</strong> &mdash; Volatility row text → energy class</p>
                <p><strong className="text-white">Tier Reflex</strong> &mdash; Ribbon row → single vs ★ Double Coil</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">CLASSIFY Tuple → Playbook</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>{'{*, MODERATE, single}'} &mdash; Playbook 1 (standard, 1.5R)</p>
                <p>{'{*, HIGH, single}'} &mdash; Playbook 2 (2.5R, EXTREME = up-size)</p>
                <p>{'{*, *, ★ Double Coil}'} &mdash; Playbook 3 (2.5R+, up-size)</p>
                <p>{'{*, LOW, *}'} &mdash; consider half-size or skip</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">PLAN Universal Rule</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Entry</strong>: at diamond close (conditional on bar close)</p>
                <p><strong className="text-white">Stop</strong>: just outside box, opposite side (universal)</p>
                <p><strong className="text-white">Target</strong>: 1.5R / 2.5R / 2.5R+ by playbook</p>
                <p>Pre-stage during COILING. Click within 5s of fire bar.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">MANAGE Decision Tree</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Bar 1 RUNNING</strong> &middot; trail tighter, expand target</p>
                <p><strong className="text-white">Bar 2 RUNNING</strong> &middot; verdict locked, hold full target</p>
                <p><strong className="text-white">Bar 3 STALLED</strong> &middot; EXIT &mdash; DUD verdict imminent</p>
                <p><strong className="text-white">Bar 5 verdict</strong> &middot; RUNNER (ride) / NORMAL (scratch) / DUD (exited)</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Cross-Asset Priority</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">HIGH</strong> &mdash; COILING or BREAKOUT READY (active attention)</p>
                <p><strong className="text-white">MED</strong> &mdash; pre-squeeze warning OR BUILDING (monitor)</p>
                <p><strong className="text-white">LOW</strong> &mdash; NORMAL (glance during scans)</p>
                <p>Max 2 HIGH at once &mdash; the attention ceiling.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">5 Failure Patterns (S13)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>1. Immediate fakeout &middot; 2. Stalled-and-reversed</p>
                <p>3. Extended consolidation &middot; 4. Wick-and-fail</p>
                <p>5. Head-fake then run opposite</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">CIPHER Alerts (set on every asset/TF)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Squeeze Breakout</strong> &mdash; fires on diamond drop</p>
                <p><strong className="text-white">Double Coil</strong> &mdash; fires when ★ first activates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read Coils Like a Coil Reader</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five live-reading scenarios spanning the 4-step frame, the 3 reflexes, and the cross-asset attention discipline. Pick the right call. Explanations after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Coil Reader-grade reflexes installed. SPOT, CLASSIFY, PLAN, MANAGE — the rhythm is yours.' : finalScore >= 3 ? 'Solid grasp. Re-read the 4-step frame (S01), the 3 reflexes (S04), and the bar-3 STALLED rule (S06) before the quiz.' : 'Re-study the 4-step frame (S01-S06), the worked examples (S07-S09), and the failure patterns (S13) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.15: Reading Coils Live</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Coil Reader &mdash;</p>
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
