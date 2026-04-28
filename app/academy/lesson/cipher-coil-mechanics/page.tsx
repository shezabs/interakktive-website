// app/academy/lesson/cipher-coil-mechanics/page.tsx
// ATLAS Academy — Lesson 11.14: Coil Box Mechanics: Birth, Growth, Death [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Storage Tank — Energy stored. Energy released. The Coil Box state machine.
// Lesson 1 of the Coil Box arc (14 + 15)
// Covers: BB/KC squeeze math, the 3 lifecycle phases (Birth/Growth/Death),
//         box wall brightness, energy scoring, pre-squeeze warning,
//         breakout diamond, breakout quality, runner-vs-dud, double coil
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
    scenario: 'XAUUSD 15m. You spot an active Coil Box with <strong class="text-white">faint, barely-visible walls</strong> and an almost-invisible amber tint. The Volatility & Squeeze row reads "32% BUILDING". The box has been on the chart for 4 bars.',
    prompt: 'What\'s the right action?',
    options: [
      { id: 'a', text: 'Pre-stage entry orders both directions to capture the breakout when it fires.', correct: false, explain: 'Pre-staging at BUILDING is premature. Most BUILDING coils never advance to a tradeable phase &mdash; the squeeze breaks before bar 6. Pre-staging means you\'d burn through orders on coils that never produce diamonds. Save the order-staging for COILING (preparation) and BREAKOUT READY (trigger armed).' },
      { id: 'b', text: 'Notice the formation and check regime; do not trade. Wait for COILING at minimum.', correct: true, explain: '✓ Right. BUILDING is the spotting phase &mdash; faint walls signal the engine\'s low confidence in the eventual breakout. The action is to NOTICE and PREPARE mentally (which asset, what regime, how compressed). Trading BUILDING coils is the highest-frequency, lowest-edge subset of coil universe. Wait for COILING (bar 6) for visual confirmation that the squeeze is mature enough to plan around.' },
      { id: 'c', text: 'Enter long now anticipating an upward breakout based on the Pulse direction.', correct: false, explain: 'Mistake 1 from S15. The breakout direction is determined by the bar that breaks the squeeze &mdash; not by current Pulse direction, recent structure, or your bias. Entries inside the coil get whipsawed by the final bars of compression. Wait for the diamond. Always.' },
      { id: 'd', text: 'Skip this asset entirely &mdash; only trade coils that start at COILING phase.', correct: false, explain: 'Coils don\'t start at COILING &mdash; they start at BUILDING by definition (sq_just_started fires the Birth, which begins the BUILDING phase). The right discipline is to NOTICE BUILDING coils, monitor them as they advance, and trade once they reach COILING/BREAKOUT READY. Skipping the asset entirely means you miss the eventual COILING-phase setup.' },
    ],
  },
  {
    id: 'g2',
    scenario: 'A coil on EURUSD 1h has just fired &mdash; bull diamond drops at the firing bar. Energy was HIGH (78). You hover the diamond and the tooltip shows: <strong class="text-white">Duration 14 bars · Energy HIGH (78%) · Depth 2.1σ · Volume 0.8x avg · Momentum 42% · Trend: Counter-trend ⚠</strong>. No Double Coil flag.',
    prompt: 'What\'s the breakout quality, and what do you do?',
    options: [
      { id: 'a', text: 'CONFIRMED &mdash; HIGH energy and 14-bar duration override the tooltip details.', correct: false, explain: 'Quality scoring uses 3 factors at the fire bar: momentum > 50%, volume > 1.0x, trend-aligned. This breakout has momentum 42% (FAIL), volume 0.8x (FAIL), and counter-trend (FAIL). Score = 0/3 = SUSPECT. Energy and duration measure stored compression but don\'t guarantee follow-through &mdash; quality measures whether the release is real.' },
      { id: 'b', text: 'PROBABLE &mdash; the HIGH energy compensates for one missing factor, take half size.', correct: false, explain: 'Three of three factors fail, not just one. Momentum 42% < 50% (fail), volume 0.8x < 1.0x (fail), counter-trend (fail). Score = 0/3, not 2/3. The energy score and quality score are independent reads &mdash; energy describes stored potential at the moment of release; quality describes whether the release has the institutional + structural backing to actually follow through.' },
      { id: 'c', text: 'SUSPECT &mdash; 0/3 quality factors. Skip the trade or scratch entry at break-even.', correct: true, explain: '✓ Exactly. SUSPECT breakouts (≤1 factor) have negative expectancy &mdash; the engine fired the diamond because the squeeze released, but the release lacks the momentum, volume, and trend-alignment that predict real follow-through. Default action is skip. If you anticipated and entered before the diamond, exit at break-even. The quality score is the engine\'s honest read at the fire bar; honour it.' },
      { id: 'd', text: 'PROBABLE &mdash; the low momentum is the only real concern; volume and trend are secondary.', correct: false, explain: 'The Pine line 1736 weights all three factors equally: bo_score = (has_momentum) + (has_volume) + (trend_aligned). No factor is "secondary." All three failing is SUSPECT regardless of which combination. Volume is institutional confirmation; without it, the move is retail-driven and reverses quickly. Trend alignment matters because counter-trend breakouts have lower base-rate follow-through.' },
    ],
  },
  {
    id: 'g3',
    scenario: 'You entered a long position at a CONFIRMED-quality bull diamond on BTCUSD 4h. Three bars have printed since the fire bar. The 5-bar tracker shows: <strong class="text-white">Bar 1: SLOW (+0.2 ATR) · Bar 2: STALLED (+0.1) · Bar 3: STALLED (+0.05)</strong>. The diamond was clean &mdash; you were sure this was a runner.',
    prompt: 'What do you do?',
    options: [
      { id: 'a', text: 'Hold &mdash; the diamond was CONFIRMED quality, the tracker is wrong, give it 2 more bars.', correct: false, explain: 'Mistake 3 from S15. The 5-bar tracker is the engine\'s honesty check &mdash; it sees follow-through that the fire-bar quality couldn\'t predict. A CONFIRMED diamond produces RUNNER ~75% of the time, not 100%. The remaining 25% are the cases where the tracker catches what fire-bar quality missed. STALLED at bar 3 means the verdict will be DUD, regardless of how clean the entry looked. Holding past STALLED bar 3 is fighting the engine\'s real-time signal.' },
      { id: 'b', text: 'Exit immediately &mdash; STALLED at bar 3 means DUD verdict at bar 5, expect reversal.', correct: true, explain: '✓ Right. STALLED at bar 3 of 5 is the engine telling you the breakout is failing. DUD verdicts (travel < 0.3 ATR at bar 5) usually reverse against the breakout direction within minutes. The discipline: honour the tracker, exit while the loss is small, watch for the reversal as a potential opposite-direction setup. Pride about the original quality score is irrelevant &mdash; the tracker is more recent information.' },
      { id: 'c', text: 'Add to the position &mdash; price has not moved against you yet, average down for a better entry.', correct: false, explain: 'Adding to a STALLED breakout is exactly the wrong direction. The premise of averaging is "the move is delayed but coming"; the tracker is signalling "the move isn\'t coming." Adding to a position that\'s about to reverse compounds the loss. The trade is wrong; size down or exit, not up.' },
      { id: 'd', text: 'Tighten the stop to break-even and let the runner play out.', correct: false, explain: 'Half-right, half-wrong. Tightening to break-even is a defensive move &mdash; reasonable. But "let the runner play out" misreads the signal. The tracker says this isn\'t a runner. Tightening the stop is okay but you should also be prepared to exit if the next bar prints another STALLED status. Better to exit fully now and re-enter on a clean reversal signal than to babysit a deteriorating trade.' },
    ],
  },
  {
    id: 'g4',
    scenario: 'NAS100 1h. Active Coil Box at COILING phase with 9 squeeze bars. The Volatility & Squeeze row reads "68% COILING". The Ribbon Command Center row reads <strong class="text-white">↔ COILED → DOUBLE COIL</strong>. Energy score live: 71 (HIGH). Regime: TREND, trend-aligned with prior structure.',
    prompt: 'How should you trade this if it advances to BREAKOUT READY and fires?',
    options: [
      { id: 'a', text: 'Standard size, 1.5R target &mdash; treat it like any other COILING-phase coil.', correct: false, explain: 'This setup is materially better than a standard coil. Double Coil ★ status (rs_double_coil = true) means both Ribbon AND BB/KC are compressed simultaneously &mdash; the highest-edge tier CIPHER recognises. Regime TREND + trend-aligned + HIGH energy + Double Coil is roughly the textbook gold setup. Treating this as standard ignores the available edge.' },
      { id: 'b', text: 'Up-size 25-50%, 2.5R target, trail wider after bar 3 to give the runner room.', correct: true, explain: '✓ Right. This is Playbook 3 from S14 &mdash; Double Coil Breakout. The combination of Double Coil ★ + HIGH energy + trend-aligned regime is the highest-edge tier. Up-size confidently, target 2.5R, trail wider on the post-fire move because Double Coils tend to extend further than single-layer breakouts. The base rate of RUNNER verdicts on Double Coil + trend-aligned breakouts is materially higher than on single-layer.' },
      { id: 'c', text: 'Enter long now during COILING based on the bullish trend-aligned context.', correct: false, explain: 'Mistake 1 from S15 &mdash; trading during COILING. The breakout direction is determined by the firing candle, not by trend bias or COILING context. Even with a textbook Double Coil setup, entering inside the box gets whipsawed by the final compression bars. Wait for the diamond to confirm direction. The setup quality justifies AGGRESSIVE trading once it fires &mdash; not premature trading before it fires.' },
      { id: 'd', text: 'Skip &mdash; Double Coils are too rare to develop a reliable read on; stick with single-layer setups.', correct: false, explain: 'Skipping a Double Coil because they\'re rare is the inverse of the right move. They\'re rare BECAUSE they\'re high-edge &mdash; the engine specifically flags them with ★ for this reason. Operators who skip Double Coils miss the highest-edge subset of coil-mechanics trading entirely. The right discipline is to recognise them, trade them per Playbook 3, and accept that you\'ll see only 2-5 per month per asset.' },
    ],
  },
  {
    id: 'g5',
    scenario: 'You\'re monitoring 6 assets pre-session. On EURUSD 15m, the pre-squeeze warning has just fired &mdash; vol_ratio_atr at 0.78, decline_bars at 6, Volatility & Squeeze row indicates compression forming but no Coil Box has appeared yet.',
    prompt: 'What should you do with this signal?',
    options: [
      { id: 'a', text: 'Enter a small long position to capture the eventual breakout from the forming squeeze.', correct: false, explain: 'The pre-squeeze warning is NOT a trade signal. Many warnings never advance to confirmed squeezes &mdash; volatility re-expands and the warning resets. Even when warnings advance, the squeeze, BUILDING, COILING, BREAKOUT READY, and fire bar are 15-30 bars away. Entering at the warning means holding through 4-6 phase transitions before any actual trade trigger; that\'s not a trade, that\'s a guess.' },
      { id: 'b', text: 'Treat it as a multi-asset prioritisation signal &mdash; focus attention on EURUSD over the next 5-10 bars, but do not trade yet.', correct: true, explain: '✓ Exactly. The warning is an attention-direction signal, not a trade trigger. With 6 assets to monitor and limited attention, the warning tells you which asset is "likely to produce something soon." Front-load your attention here over the next 5-10 bars; check periodically for the actual squeeze confirmation and Coil Box birth. Save deep reads for confirmed coils, use warnings to prioritise the watchlist.' },
      { id: 'c', text: 'Set an alert for when a Coil Box appears and stop monitoring the other 5 assets.', correct: false, explain: 'Stopping monitoring on the other 5 assets is overcorrection. Pre-squeeze warnings often resolve without producing tradeable coils. Sticking exclusively to one asset based on a warning means you might miss confirmed setups elsewhere. The right balance is FOCUS attention (more frequent checks on EURUSD) without ABANDONING the rest of the watchlist. Alerts help but don\'t replace active monitoring.' },
      { id: 'd', text: 'The warning fired without a Coil Box appearing, so it\'s a false signal &mdash; ignore it.', correct: false, explain: 'A pre-squeeze warning by definition fires BEFORE the Coil Box appears (before z-score officially triggers). The absence of a Coil Box at warning time is normal, not a false signal. The warning is correctly fired when vol_ratio is declining below 0.85 for 5+ bars; whether the squeeze advances to a confirmed Coil Box is a separate question that resolves over the next 5-15 bars.' },
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
    question: 'What is the formula for squeeze_ratio?',
    options: [
      { id: 'a', text: 'kc_width / bb_width', correct: false },
      { id: 'b', text: 'bb_width / kc_width', correct: true },
      { id: 'c', text: 'atr / bb_width', correct: false },
      { id: 'd', text: '(bb_basis - close) / atr', correct: false },
    ],
    explain: 'squeeze_ratio = bb_width / kc_width. When BB (Bollinger, 20-period stdev × 2) contracts inside KC (Keltner, ATR(10) × 1.5 × 2), the ratio drops below 1.0. CIPHER\'s squeeze trigger requires ratio < 0.95 AND z-score > 1.5 standard deviations below its 150-bar rolling mean.',
  },
  {
    id: 'q2',
    question: 'How many consecutive bars of in_squeeze are needed for squeeze_confirmed to fire?',
    options: [
      { id: 'a', text: '1 bar', correct: false },
      { id: 'b', text: '2 bars', correct: false },
      { id: 'c', text: '3 bars', correct: true },
      { id: 'd', text: '5 bars', correct: false },
    ],
    explain: '3 consecutive bars (Pine line 1592). Single-bar volatility drops happen for many reasons (one quiet candle in chop, low-volume bar). Three consecutive bars filter ~80% of false squeeze prints. The cost is 2 bars of latency; the benefit is that confirmed squeezes are real compression patterns, not noise.',
  },
  {
    id: 'q3',
    question: 'At what effective_bars value does a coil transition from COILING to BREAKOUT READY?',
    options: [
      { id: 'a', text: 'effective_bars > 5', correct: false },
      { id: 'b', text: 'effective_bars > 10', correct: false },
      { id: 'c', text: 'effective_bars > 12', correct: true },
      { id: 'd', text: 'effective_bars > 20', correct: false },
    ],
    explain: 'effective_bars > 12 = BREAKOUT READY. The phase ternary (Pine line 1605): > 12 = BREAKOUT READY, > 5 = COILING, > 0 = BUILDING. effective_bars = squeeze_bars + depth_bonus. Depth_bonus adds +6 if z-score > 2.5σ or +3 if > 2.0σ, so a deep squeeze can reach BREAKOUT READY at raw bar 7.',
  },
  {
    id: 'q4',
    question: 'A coil dies (sq_just_ended fires). What happens to the Coil Box?',
    options: [
      { id: 'a', text: 'It is deleted entirely from the chart.', correct: false },
      { id: 'b', text: 'It is locked permanently and pushed to coil_history (max 10 boxes).', correct: true },
      { id: 'c', text: 'It continues updating bounds based on price action.', correct: false },
      { id: 'd', text: 'It changes color to indicate Death state.', correct: false },
    ],
    explain: 'On Death, Pine pushes the box to coil_history (a max-10 array) and clears the active reference. The box LOCKS in place permanently as a historical marker &mdash; it never grows or moves again. On the 11th coil, the oldest historical box is deleted via array.shift to stay under the drawing budget.',
  },
  {
    id: 'q5',
    question: 'Which combination produces the highest energy score (0-100)?',
    options: [
      { id: 'a', text: 'High depth (z-score 3.0σ), short duration (5 bars), high volume (vol_ratio 1.5)', correct: false },
      { id: 'b', text: 'Moderate depth (z-score 1.7σ), long duration (20 bars), volume drying (vol_ratio 0.6)', correct: false },
      { id: 'c', text: 'High depth (z-score 2.8σ), long duration (18 bars), volume drying (vol_ratio 0.6)', correct: true },
      { id: 'd', text: 'Low depth (z-score 1.6σ), short duration (4 bars), normal volume (vol_ratio 1.0)', correct: false },
    ],
    explain: 'Energy = depth (z-score × 15, capped at 40) + duration (bars × 2, capped at 35) + volume_dry (tier-based, max 25). Option C scores: depth 40 (saturated), duration 35 (saturated at bar 17.5+), volume_dry 25 (vol_ratio < 0.7 = max tier) = 100, EXTREME. Option A misses volume_dry (vol > 1.0 = 0 points) and duration. Option B has duration but only modest depth. Option D fails on all three.',
  },
  {
    id: 'q6',
    question: 'A bull diamond fires. The breakout quality scorer reads: momentum 65%, volume 1.2x, ribbon_dir = bear. What is the quality?',
    options: [
      { id: 'a', text: 'CONFIRMED &mdash; momentum and volume both pass', correct: false },
      { id: 'b', text: 'PROBABLE &mdash; 2 of 3 factors pass', correct: true },
      { id: 'c', text: 'SUSPECT &mdash; counter-trend overrides everything', correct: false },
      { id: 'd', text: 'UNQUALIFIED &mdash; bull diamond with bear ribbon is invalid', correct: false },
    ],
    explain: 'PROBABLE = 2 of 3 factors. Momentum 65% > 50% (PASS), volume 1.2x > 1.0 (PASS), but trend-alignment fails (bull breakout + bear ribbon = counter-trend). Score 2/3 = PROBABLE. The trade is takeable at half size with tighter target. Counter-trend breakouts CAN work (V-bottoms, regime changes) but have lower base-rate follow-through than trend-aligned breakouts.',
  },
  {
    id: 'q7',
    question: 'A breakout fires. The 5-bar tracker reports: bar 1 SLOW, bar 2 STALLED, bar 3 STALLED. What\'s the right action?',
    options: [
      { id: 'a', text: 'Hold &mdash; the diamond was clean, give it 2 more bars to develop.', correct: false },
      { id: 'b', text: 'Add to the position &mdash; price hasn\'t moved against you yet.', correct: false },
      { id: 'c', text: 'Exit &mdash; STALLED at bar 3 means the verdict will be DUD.', correct: true },
      { id: 'd', text: 'Tighten the stop and continue holding.', correct: false },
    ],
    explain: 'Exit. STALLED at bar 3 of 5 is the engine\'s honesty check telling you the breakout has failed. DUD verdicts (travel < 0.3 ATR at bar 5) usually reverse against the breakout direction within minutes. Holding past STALLED bar 3 is fighting the engine\'s real-time signal. Adding to the position is the worst response &mdash; compounding loss on a soon-to-reverse trade.',
  },
  {
    id: 'q8',
    question: 'What does the ★ on a breakout diamond tooltip indicate?',
    options: [
      { id: 'a', text: 'The breakout is CONFIRMED quality (3/3 factors pass)', correct: false },
      { id: 'b', text: 'The energy score is EXTREME (>80)', correct: false },
      { id: 'c', text: 'Both the Cipher Ribbon and BB/KC squeeze were compressed simultaneously (Double Coil)', correct: true },
      { id: 'd', text: 'The breakout is trend-aligned with the daily timeframe', correct: false },
    ],
    explain: '★ marks Double Coil &mdash; rs_double_coil = rs_confirmed AND squeeze_confirmed. Both the Cipher Ribbon (trend engine) and BB/KC (volatility engine) are compressed at the same time. This is the highest-energy state CIPHER recognises and the highest-edge breakout pattern in the suite. Trade with up-sized confidence per Playbook 3 (S14).',
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
// ANIMATION 1 — StorageTankAnim (S01 Groundbreaking Concept)
// "The Storage Tank"
//
// Vertical amber tank fills as squeeze develops. Three labeled levels:
// BUILDING (1-5 bars) · COILING (6-12) · BREAKOUT READY (13+).
// At BREAKOUT READY, tank glows. Squeeze releases → tank ruptures →
// energy releases in direction → diamond appears on chart below.
// ============================================================
function StorageTankAnim() {
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
    ctx.fillText('THE STORAGE TANK  ·  energy stored, energy released', w / 2, 22);

    // 16s loop: 0-12s fill (showing 18 squeeze bars at ~0.65s each), 12-14s rupture, 14-16s aftermath
    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const fillEnd = 12;
    const ruptureBar = 18; // Tank fills to bar 18 then ruptures

    // Compute current "squeeze_bars" — accelerated for animation
    let squeezeBars = 0;
    if (cycleT < fillEnd) {
      squeezeBars = (cycleT / fillEnd) * ruptureBar;
    } else {
      squeezeBars = ruptureBar;
    }

    // Phase derived from squeeze_bars (matches Pine: 1-5 BUILDING, 6-12 COILING, 13+ READY)
    const phase = squeezeBars < 1 ? 'PRE' : squeezeBars < 6 ? 'BUILDING' : squeezeBars <= 12 ? 'COILING' : 'BREAKOUT READY';
    const phaseColor = squeezeBars < 1 ? DIM : squeezeBars < 6 ? AMBER : squeezeBars <= 12 ? AMBER : '#FF6B00'; // brighter amber for ready

    // Layout: tank on left, chart on right
    const padX = 24;
    const tankX = padX + 60;
    const tankWidth = 70;
    const tankTop = 50;
    const tankBot = h - 60;
    const tankH = tankBot - tankTop;

    // Chart on right
    const chartLeft = tankX + tankWidth + 50;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;
    const chartTop = tankTop + 20;
    const chartBot = tankBot - 10;
    const chartH = chartBot - chartTop;

    // ── Tank ──
    // Tank outer shell
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 2;
    ctx.fillRect(tankX, tankTop, tankWidth, tankH);
    ctx.strokeRect(tankX, tankTop, tankWidth, tankH);

    // Phase level markers (lines at 5 bars, 12 bars equivalents)
    const buildingTopY = tankBot - (5 / 18) * tankH;
    const coilingTopY = tankBot - (12 / 18) * tankH;

    ctx.strokeStyle = `${AMBER}33`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [buildingTopY, coilingTopY].forEach((ly) => {
      ctx.beginPath();
      ctx.moveTo(tankX - 4, ly);
      ctx.lineTo(tankX + tankWidth + 4, ly);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Level labels (right of tank)
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('READY', tankX + tankWidth + 8, coilingTopY - 4);
    ctx.fillText('COILING', tankX + tankWidth + 8, buildingTopY - 4);
    ctx.fillText('BUILDING', tankX + tankWidth + 8, tankBot - 4);

    // Tank fill — only if past rupture, drain it; otherwise fill
    let fillRatio = Math.min(1, squeezeBars / 18);
    let isRupturing = cycleT >= fillEnd && cycleT < fillEnd + 1.2;
    let isReleased = cycleT >= fillEnd + 1.2;

    if (isReleased) {
      // Drain
      const drainT = (cycleT - (fillEnd + 1.2)) / 2;
      fillRatio = Math.max(0, 1 - drainT);
    }

    const fillH = fillRatio * tankH;
    const fillY = tankBot - fillH;

    // Fill gradient (warmer as it rises)
    const grad = ctx.createLinearGradient(tankX, tankBot, tankX, tankTop);
    grad.addColorStop(0, `${AMBER}88`);
    grad.addColorStop(0.6, `${AMBER}cc`);
    grad.addColorStop(1, '#FF6B00');
    ctx.fillStyle = grad;
    ctx.fillRect(tankX + 2, fillY, tankWidth - 4, fillH);

    // Glow when BREAKOUT READY
    if (squeezeBars > 12 && !isReleased) {
      const glowT = (squeezeBars - 12) / 6;
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 4);
      ctx.shadowColor = '#FF6B00';
      ctx.shadowBlur = 10 + glowT * 10 + pulseAmt * 6;
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankTop, tankWidth, tankH);
      ctx.shadowBlur = 0;
    }

    // ── Rupture animation ──
    if (isRupturing) {
      const rupT = (cycleT - fillEnd) / 1.2;
      // Crack lines from the top
      ctx.strokeStyle = `rgba(255, 107, 0, ${1 - rupT})`;
      ctx.lineWidth = 1.5;
      for (let cr = 0; cr < 5; cr++) {
        ctx.beginPath();
        ctx.moveTo(tankX + tankWidth / 2, tankTop + 2);
        const dx = (cr - 2) * 8 + Math.sin(cr) * 6;
        const dy = -(rupT * 30);
        ctx.lineTo(tankX + tankWidth / 2 + dx, tankTop + dy);
        ctx.stroke();
      }
      // Energy burst particles
      for (let pi = 0; pi < 14; pi++) {
        const ang = -Math.PI / 2 + (pi - 7) * 0.18;
        const dist = rupT * 50;
        const px = tankX + tankWidth / 2 + Math.cos(ang) * dist;
        const py = tankTop + Math.sin(ang) * dist;
        ctx.fillStyle = `rgba(255, 107, 0, ${1 - rupT})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 - rupT * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Squeeze bar counter (above tank) ──
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(squeezeBars)} bars`, tankX + tankWidth / 2, tankTop - 26);
    ctx.fillStyle = phaseColor;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText(phase, tankX + tankWidth / 2, tankTop - 12);

    // ── Chart on the right ──
    // Chart frame
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price wave compressing into a coil
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      // Pre-squeeze: wide oscillation. Mid-squeeze: tightening. Post: explosive break upward.
      let amp = 0;
      let level = 50;
      if (i < 12) {
        amp = 8;
      } else if (i < 30) {
        const phaseT = (i - 12) / 18;
        amp = 8 - phaseT * 6;
      } else {
        const breakT = (i - 30) / 20;
        amp = 1 + breakT * 8;
        level = 50 + breakT * 18;
      }
      prices.push(level + Math.sin(i * 0.7) * amp + Math.sin(i * 1.5) * amp * 0.4);
    }

    // Reveal cursor based on cycleT
    const cursorIdx = Math.min(N - 1, Math.floor((cycleT / cycleSec) * N));

    const minP = 30;
    const maxP = 80;
    const yScale = (p: number) => chartTop + ((maxP - p) / (maxP - minP)) * chartH;
    const xScale = (i: number) => chartLeft + 4 + (i / (N - 1)) * (chartW - 8);

    // Coil box on the chart — drawn during squeeze phase (bars 12-30 of N)
    const sqStart = 12;
    const sqEnd = 30;
    if (cursorIdx >= sqStart) {
      const drawnEnd = Math.min(cursorIdx, sqEnd);
      let highest = -Infinity;
      let lowest = Infinity;
      for (let i = sqStart; i <= drawnEnd; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }
      const boxLeft = xScale(sqStart);
      const boxRight = xScale(drawnEnd);
      const boxTop = yScale(highest + 1);
      const boxBot = yScale(lowest - 1);

      // Wall transparency by phase
      const phaseAtBar = drawnEnd - sqStart;
      const wallAlpha = phaseAtBar > 12 ? 0.9 : phaseAtBar > 5 ? 0.7 : 0.45;
      const fillAlpha = phaseAtBar > 12 ? 0.20 : phaseAtBar > 5 ? 0.12 : 0.07;

      ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
      ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
      ctx.lineWidth = phaseAtBar > 12 ? 2 : 1.5;
      ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursorIdx; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Diamond at breakout (bar 30)
    if (cursorIdx >= sqEnd) {
      const dx = xScale(sqEnd);
      const dy = yScale(prices[sqEnd]) + 14;
      const flash = 0.5 + 0.5 * Math.sin(cycleT * 6);
      ctx.fillStyle = TEAL;
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 8 + flash * 6;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (squeezeBars < 1) {
      ctx.fillText('Watch: tank fills as squeeze bars accumulate. Walls brighten with phase.', w / 2, h - 14);
    } else if (squeezeBars > 12 && !isReleased) {
      ctx.fillStyle = '#FF6B00';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('TANK AT BREAKOUT READY  ·  energy primed, release imminent', w / 2, h - 14);
    } else if (isRupturing) {
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('SQUEEZE FIRE  ·  ◆ diamond marks direction', w / 2, h - 14);
    } else if (isReleased) {
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('Energy released. Box locks as historical marker.', w / 2, h - 14);
    } else {
      ctx.fillText('Tank filling — squeeze accumulating energy as bars compress.', w / 2, h - 14);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — BBKCSqueezeAnim (S02)
// The BB/KC trigger math.
// Two pairs of bands: Bollinger (white) + Keltner (amber).
// As volatility contracts, BB shrinks INSIDE KC. When ratio < 1.0,
// in_squeeze fires; squeeze_confirmed needs 3 consecutive bars.
// ============================================================
function BBKCSqueezeAnim() {
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
    ctx.fillText('THE TRIGGER MATH  ·  BB inside KC + 3-bar confirmation', w / 2, 22);

    // Layout: chart left ~70%, ratio gauge right ~30%
    const padX = 24;
    const chartTop = 48;
    const chartBot = h - 50;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = w * 0.62;
    const chartRight = chartLeft + chartW;

    // Right panel: ratio gauge
    const gaugeLeft = chartRight + 20;
    const gaugeRight = w - padX;
    const gaugeW = gaugeRight - gaugeLeft;
    const gaugeTop = chartTop;
    const gaugeBot = chartBot;

    // Generate price + bands
    const N = 60;
    const prices: number[] = [];
    const bbWidth: number[] = [];
    const kcWidth: number[] = [];
    for (let i = 0; i < N; i++) {
      // Price oscillates, amplitude varies
      let amp = 0;
      if (i < 15) amp = 10;
      else if (i < 35) amp = 10 - ((i - 15) / 20) * 7;
      else if (i < 50) amp = 3;
      else amp = 3 + (i - 50) * 1.5;
      prices.push(50 + Math.sin(i * 0.7) * amp + Math.sin(i * 1.4) * amp * 0.3);

      // BB width tracks recent stdev — shrinks in middle
      let bb = 0;
      if (i < 15) bb = 18;
      else if (i < 30) bb = 18 - ((i - 15) / 15) * 12;
      else if (i < 45) bb = 6;
      else bb = 6 + (i - 45) * 1.8;
      bbWidth.push(bb);

      // KC width based on ATR — shrinks more slowly
      let kc = 0;
      if (i < 20) kc = 16;
      else if (i < 35) kc = 16 - ((i - 20) / 15) * 6;
      else if (i < 48) kc = 10;
      else kc = 10 + (i - 48) * 1.0;
      kcWidth.push(kc);
    }

    // Reveal cursor
    const cycleSec = 12;
    const cycleT = t % cycleSec;
    const cursor = Math.min(N - 1, Math.floor((cycleT / cycleSec) * N));

    const minP = 25;
    const maxP = 75;
    const yScale = (p: number) => chartTop + ((maxP - p) / (maxP - minP)) * chartH;
    const xScale = (i: number) => chartLeft + 4 + (i / (N - 1)) * (chartW - 8);

    // Compute ratios + squeeze
    const ratios: number[] = bbWidth.map((b, i) => b / kcWidth[i]);
    const inSqueeze: boolean[] = ratios.map((r) => r < 0.95);
    let consecutiveBars = 0;
    const sqBars: number[] = [];
    inSqueeze.forEach((s) => {
      consecutiveBars = s ? consecutiveBars + 1 : 0;
      sqBars.push(consecutiveBars);
    });
    const confirmed: boolean[] = sqBars.map((b) => b >= 3);

    // Draw KC bands (amber, wider)
    ctx.strokeStyle = `${AMBER}aa`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    [1, -1].forEach((side) => {
      ctx.beginPath();
      for (let i = 0; i <= cursor; i++) {
        const x = xScale(i);
        const y = yScale(50 + side * kcWidth[i] / 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw BB bands (white, narrower)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2;
    [1, -1].forEach((side) => {
      ctx.beginPath();
      for (let i = 0; i <= cursor; i++) {
        const x = xScale(i);
        const y = yScale(50 + side * bbWidth[i] / 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Highlight bars where confirmed squeeze
    for (let i = 1; i <= cursor; i++) {
      if (confirmed[i]) {
        const x1 = xScale(i - 1);
        const x2 = xScale(i);
        ctx.fillStyle = `${AMBER}22`;
        ctx.fillRect(x1, chartTop, x2 - x1, chartH);
      }
    }

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('— BB (20, 2σ)', chartLeft + 8, chartTop + 14);
    ctx.fillStyle = AMBER;
    ctx.fillText('· · KC (10, 1.5×)', chartLeft + 8, chartTop + 26);

    // ── Ratio gauge on right ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(gaugeLeft, gaugeTop, gaugeW, gaugeBot - gaugeTop);
    ctx.strokeRect(gaugeLeft, gaugeTop, gaugeW, gaugeBot - gaugeTop);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('squeeze_ratio', gaugeLeft + gaugeW / 2, gaugeTop + 14);

    // Vertical bar gauge for ratio (0 to 2.0 range)
    const barX = gaugeLeft + gaugeW / 2 - 10;
    const barW = 20;
    const barTop = gaugeTop + 32;
    const barBot = gaugeBot - 50;
    const barH = barBot - barTop;
    const ratioToY = (r: number) => barBot - Math.max(0, Math.min(2.0, r)) / 2.0 * barH;

    // Threshold line at 0.95
    const threshY = ratioToY(0.95);
    ctx.fillStyle = `${AMBER}11`;
    ctx.fillRect(barX, threshY, barW, barBot - threshY);
    ctx.strokeStyle = `${AMBER}aa`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(barX - 4, threshY);
    ctx.lineTo(barX + barW + 4, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(barX, barTop, barW, barH);
    ctx.strokeRect(barX, barTop, barW, barH);

    // Current value
    const currentRatio = cursor < N ? ratios[cursor] : ratios[N - 1];
    const valY = ratioToY(currentRatio);
    const inSq = currentRatio < 0.95;
    ctx.fillStyle = inSq ? AMBER : WHITE;
    ctx.fillRect(barX, valY - 1, barW, 3);
    ctx.beginPath();
    ctx.moveTo(barX - 4, valY);
    ctx.lineTo(barX, valY - 4);
    ctx.lineTo(barX, valY + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = inSq ? AMBER : WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentRatio.toFixed(2), gaugeLeft + gaugeW / 2, barBot + 14);

    // Threshold label
    ctx.fillStyle = AMBER;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0.95', barX - 6, threshY + 3);

    // Status pill below
    const statusY = barBot + 24;
    const statusH = 22;
    const statusColor = confirmed[cursor] ? AMBER : inSq ? `${AMBER}88` : WHITE;
    const statusText = confirmed[cursor] ? `CONFIRMED (${sqBars[cursor]}b)` : inSq ? `IN SQUEEZE (${sqBars[cursor]}b)` : 'NORMAL';
    ctx.fillStyle = `${statusColor}22`;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.fillRect(gaugeLeft + 4, statusY, gaugeW - 8, statusH);
    ctx.strokeRect(gaugeLeft + 4, statusY, gaugeW - 8, statusH);
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, gaugeLeft + gaugeW / 2, statusY + 14);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('squeeze_ratio = bb_width / kc_width  ·  must be < 0.95 for 3 consecutive bars', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — LifecycleStatesAnim (S03)
// The Birth/Growth/Death state machine.
// Three labeled boxes in a row, animated transitions between them.
// Pine code excerpt visible below each phase showing the trigger.
// ============================================================
function LifecycleStatesAnim() {
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
    ctx.fillText('LIFECYCLE  ·  Birth → Growth → Death', w / 2, 22);

    const phases = [
      {
        name: 'BIRTH',
        symbol: '◯',
        trigger: 'sq_just_started',
        action: 'box.new() drawn at current high/low',
        desc: 'New coil begins',
        color: AMBER,
      },
      {
        name: 'GROWTH',
        symbol: '◉',
        trigger: 'squeeze_confirmed',
        action: 'box bounds expand, right edge ratchets',
        desc: 'Coil is alive',
        color: '#FF6B00',
      },
      {
        name: 'DEATH',
        symbol: '⬢',
        trigger: 'sq_just_ended',
        action: 'box pushed to coil_history, locks',
        desc: 'Energy released',
        color: TEAL,
      },
    ];

    // Cycle through phases — focus 4s each
    const cycleSec = phases.length * 4;
    const cycleT = t % cycleSec;
    const focusIdx = Math.floor(cycleT / 4);

    // Layout: 3 boxes in a row at top, with arrows between, animated example chart at bottom
    const padX = 20;
    const cardTop = 46;
    const cardH = 100;
    const cardGap = 18;
    const cardW = (w - padX * 2 - cardGap * 2) / 3;

    phases.forEach((p, i) => {
      const cx = padX + i * (cardW + cardGap);
      const cy = cardTop;
      const isFocus = i === focusIdx;

      ctx.fillStyle = isFocus ? `${p.color}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? p.color : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(cx + r, cy);
      ctx.lineTo(cx + cardW - r, cy);
      ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + r);
      ctx.lineTo(cx + cardW, cy + cardH - r);
      ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - r, cy + cardH);
      ctx.lineTo(cx + r, cy + cardH);
      ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - r);
      ctx.lineTo(cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Symbol (large)
      ctx.fillStyle = isFocus ? p.color : DIM;
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.symbol, cx + cardW / 2, cy + 30);

      // Phase name
      ctx.fillStyle = isFocus ? p.color : WHITE;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(p.name, cx + cardW / 2, cy + 50);

      // Trigger code
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = '9px ui-monospace, Menlo, monospace';
      ctx.fillText(p.trigger, cx + cardW / 2, cy + 68);

      // Action
      ctx.fillStyle = isFocus ? 'rgba(255,255,255,0.78)' : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(p.action, cx + cardW / 2, cy + 84);
    });

    // Arrows between cards
    [0, 1].forEach((i) => {
      const x1 = padX + i * (cardW + cardGap) + cardW;
      const x2 = padX + (i + 1) * (cardW + cardGap);
      const y = cardTop + cardH / 2;
      const isActive = focusIdx > i;
      ctx.strokeStyle = isActive ? AMBER : FAINT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1 + 2, y);
      ctx.lineTo(x2 - 2, y);
      ctx.stroke();
      // Arrow head
      ctx.fillStyle = isActive ? AMBER : FAINT;
      ctx.beginPath();
      ctx.moveTo(x2 - 2, y);
      ctx.lineTo(x2 - 6, y - 3);
      ctx.lineTo(x2 - 6, y + 3);
      ctx.closePath();
      ctx.fill();
    });

    // ── Bottom illustrative chart ──
    const chartTop = cardTop + cardH + 30;
    const chartBot = h - 30;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Render a chart with a coil that progresses through Birth/Growth/Death based on focusIdx
    const N = 60;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 15) amp = 8;
      else if (i < 40) amp = 8 - (i - 15) * 0.25;
      else { amp = 1; level = 50 + (i - 40) * 0.8; }
      prices.push(level + Math.sin(i * 0.6) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 35;
    const maxP = 65;
    const yScale = (p: number) => chartTop + 4 + ((maxP - p) / (maxP - minP)) * (chartH - 8);
    const xScale = (i: number) => chartLeft + 4 + (i / (N - 1)) * (chartW - 8);

    // Box appears based on focused phase
    if (focusIdx >= 0) {
      const sqStart = 18;
      const sqEnd = 38;
      const showRight = focusIdx === 0 ? sqStart + 1 : focusIdx === 1 ? sqStart + 12 : sqEnd;
      const drawnEnd = Math.min(showRight, sqEnd);

      let highest = -Infinity;
      let lowest = Infinity;
      for (let i = sqStart; i <= drawnEnd; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }

      const boxLeft = xScale(sqStart);
      const boxRight = xScale(drawnEnd);
      const boxTop = yScale(highest + 0.6);
      const boxBot = yScale(lowest - 0.6);

      const isDeath = focusIdx === 2;
      const wallAlpha = isDeath ? 0.5 : 0.85;
      const fillAlpha = isDeath ? 0.06 : 0.15;

      ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
      ctx.fillRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxLeft, boxTop, boxRight - boxLeft, boxBot - boxTop);

      // Diamond at Death
      if (isDeath) {
        const dx = xScale(sqEnd);
        const dy = yScale(prices[sqEnd]) + 12;
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + 4, dy + 4);
        ctx.lineTo(dx, dy + 8);
        ctx.lineTo(dx - 4, dy + 4);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Price line — extent depends on focus
    const showCursor = focusIdx === 0 ? 22 : focusIdx === 1 ? 32 : N - 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= showCursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three explicit transitions in Pine. Boxes lock at Death — they never re-open.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — BoxStylingAnim (S04)
// Wall transparency by phase + fill transparency by phase.
// Side-by-side comparison of three coil boxes at different phases,
// with explicit transparency values shown.
// ============================================================
function BoxStylingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOX STYLING  ·  walls and fill brighten with phase', w / 2, 22);

    const phases = [
      { name: 'BUILDING', bars: '1-5', wallTransp: 55, fillTransp: 93, wallAlpha: 0.45, fillAlpha: 0.07 },
      { name: 'COILING', bars: '6-12', wallTransp: 30, fillTransp: 88, wallAlpha: 0.7, fillAlpha: 0.12 },
      { name: 'BREAKOUT READY', bars: '13+', wallTransp: 10, fillTransp: 80, wallAlpha: 0.9, fillAlpha: 0.20 },
    ];

    const padX = 20;
    const cardTop = 50;
    const cardBot = h - 60;
    const cardH = cardBot - cardTop;
    const cardGap = 12;
    const cardW = (w - padX * 2 - cardGap * 2) / 3;

    // Cycle: 3s focus per card
    const cycleT = t % (phases.length * 3);
    const focusIdx = Math.floor(cycleT / 3);

    phases.forEach((p, i) => {
      const cx = padX + i * (cardW + cardGap);
      const cy = cardTop;
      const isFocus = i === focusIdx;

      // Card frame
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? AMBER : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Phase title
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cx + cardW / 2, cy + 18);

      // Bars range
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`${p.bars} bars`, cx + cardW / 2, cy + 30);

      // Sample box render
      const sampleTop = cy + 42;
      const sampleH = 60;
      const sampleLeft = cx + 16;
      const sampleW = cardW - 32;

      // Render box with the phase's transparency
      ctx.fillStyle = `rgba(255, 179, 0, ${p.fillAlpha})`;
      ctx.fillRect(sampleLeft, sampleTop, sampleW, sampleH);
      ctx.strokeStyle = `rgba(255, 179, 0, ${p.wallAlpha})`;
      ctx.lineWidth = isFocus ? 2 : 1.5;
      ctx.strokeRect(sampleLeft, sampleTop, sampleW, sampleH);

      // Inside, sketch a few candle outlines
      const candleY = sampleTop + sampleH / 2;
      for (let ci = 0; ci < 5; ci++) {
        const cax = sampleLeft + 8 + ci * ((sampleW - 16) / 4);
        const caH = 8 + Math.sin(ci * 1.4) * 6;
        ctx.fillStyle = ci % 2 === 0 ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)';
        ctx.fillRect(cax - 3, candleY - caH / 2, 6, caH);
      }

      // Transparency values below
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = '7px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`wall transp: ${p.wallTransp}`, cx + 12, cardBot - 28);
      ctx.fillText(`fill transp: ${p.fillTransp}`, cx + 12, cardBot - 16);

      // Pine source ref
      ctx.fillStyle = isFocus ? AMBER : DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Pine line 1636-7', cx + cardW - 12, cardBot - 16);
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lower transparency = brighter. The box visually screams as it nears release.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — PhaseBuildingAnim (S05 — Phase 1: BUILDING)
// 1-5 effective_bars. Faint walls (transp 55), nearly invisible fill (93).
// Shows a coil in BUILDING phase with bar counter ticking from 1 to 5,
// then transitioning visually to COILING.
// ============================================================
function PhaseBuildingAnim() {
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
    ctx.fillText('PHASE 1  ·  BUILDING  ·  1-5 effective_bars', w / 2, 22);

    // Cycle: 1s pre, then 1s per bar through 1-5, 1s pause at end → 7s total
    const cycleSec = 8;
    const cycleT = t % cycleSec;
    const sqBars = cycleT < 1 ? 0 : Math.min(5, Math.floor(cycleT - 1) + 1);

    // Layout: chart on top, status row below
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 110;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price compressing
    const N = 30;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const phase = i / N;
      const amp = 8 - phase * 5;
      prices.push(50 + Math.sin(i * 0.7) * amp + Math.sin(i * 1.3) * amp * 0.3);
    }

    const minP = 38;
    const maxP = 62;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // Determine where the box starts/ends based on sqBars
    const sqStart = 12;
    const sqEnd = sqStart + sqBars - 1;

    // Render box if sqBars >= 1
    if (sqBars >= 1) {
      let highest = -Infinity, lowest = Infinity;
      for (let i = sqStart; i <= sqEnd; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }
      const boxLeft = xScale(sqStart);
      const boxRight = xScale(sqEnd);
      const boxTop = yScale(highest + 1);
      const boxBot = yScale(lowest - 1);

      // BUILDING styling: faint walls (transp 55 = alpha 0.45), fill (transp 93 = alpha 0.07)
      ctx.fillStyle = `rgba(255, 179, 0, 0.07)`;
      ctx.fillRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, 0.45)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
    }

    // Reveal cursor based on sqBars (so price line extends as bars accumulate)
    const cursor = Math.min(N - 1, sqStart + sqBars);

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

    // Status row below chart
    const statusTop = chartBot + 12;
    const statusH = 70;

    ctx.fillStyle = `${AMBER}11`;
    ctx.strokeStyle = `${AMBER}55`;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, statusTop, w - padX * 2, statusH);
    ctx.strokeRect(padX, statusTop, w - padX * 2, statusH);

    // 4-cell readout: bar count · phase · wall transp · fill transp
    const cellW = (w - padX * 2) / 4;
    const cells = [
      { label: 'effective_bars', value: String(sqBars), color: WHITE },
      { label: 'squeeze_phase', value: sqBars >= 1 ? 'BUILDING' : 'WAITING', color: AMBER },
      { label: 'wall transp', value: '55', color: AMBER },
      { label: 'fill transp', value: '93', color: AMBER },
    ];
    cells.forEach((c, i) => {
      const cx = padX + i * cellW;
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, cx + cellW / 2, statusTop + 18);
      ctx.fillStyle = c.color;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(c.value, cx + cellW / 2, statusTop + 38);
      // Vertical separator
      if (i < cells.length - 1) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + cellW, statusTop + 12);
        ctx.lineTo(cx + cellW, statusTop + statusH - 12);
        ctx.stroke();
      }
    });

    // Action footer
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Action: NOTICE the formation, but DO NOT trade until phase advances`, w / 2, statusTop + 60);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUILDING is the spotting phase. Walls are faint by design — the engine is uncertain.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — PhaseCoilingAnim (S06 — Phase 2: COILING)
// 6-12 effective_bars. Medium walls (30), light fill (88).
// Shows a coil progressing from BUILDING into COILING with the visual
// step at bar 6 + maturing through bars 6-12.
// ============================================================
function PhaseCoilingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHASE 2  ·  COILING  ·  6-12 effective_bars', w / 2, 22);

    // Cycle: ramps from bar 4 (BUILDING) through bar 12 (top of COILING)
    // Bar 6 = phase transition. 1s per bar = 9s total cycle + 1s pause
    const cycleSec = 10;
    const cycleT = t % cycleSec;
    const startBar = 4;
    const endBar = 12;
    const sqBars = cycleT < 1 ? startBar : Math.min(endBar, startBar + Math.floor(cycleT - 1));

    const phaseLabel = sqBars <= 5 ? 'BUILDING' : 'COILING';
    const wallTransp = sqBars <= 5 ? 55 : 30;
    const fillTransp = sqBars <= 5 ? 93 : 88;
    const wallAlpha = (100 - wallTransp) / 100;
    const fillAlpha = (100 - fillTransp) / 100;

    // Layout
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 110;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate compressing price
    const N = 40;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const phase = i / N;
      const amp = 8 - phase * 6;
      prices.push(50 + Math.sin(i * 0.6) * amp + Math.sin(i * 1.4) * amp * 0.3);
    }

    const minP = 38;
    const maxP = 62;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // Box from sqStart, extending through sqBars
    const sqStart = 10;
    const sqEnd = sqStart + sqBars - 1;

    if (sqBars >= 1) {
      let highest = -Infinity, lowest = Infinity;
      for (let i = sqStart; i <= sqEnd; i++) {
        if (prices[i] > highest) highest = prices[i];
        if (prices[i] < lowest) lowest = prices[i];
      }
      const boxLeft = xScale(sqStart);
      const boxRight = xScale(sqEnd);
      const boxTop = yScale(highest + 1);
      const boxBot = yScale(lowest - 1);

      ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
      ctx.fillRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
      ctx.strokeStyle = `rgba(255, 179, 0, ${wallAlpha})`;
      ctx.lineWidth = phaseLabel === 'COILING' ? 1.8 : 1.5;
      ctx.strokeRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
    }

    // Phase transition flash at bar 6
    if (sqBars === 6 && cycleT > 1) {
      const flashLocalT = cycleT - 2; // sub-second flash window
      if (flashLocalT < 0.6) {
        const flashAlpha = (0.6 - flashLocalT) / 0.6 * 0.4;
        ctx.fillStyle = `rgba(255, 179, 0, ${flashAlpha})`;
        ctx.fillRect(chartLeft, chartTop, chartW, chartH);
      }
    }

    // Price line
    const cursor = Math.min(N - 1, sqStart + sqBars);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Status row
    const statusTop = chartBot + 12;
    const statusH = 70;
    const statusColor = phaseLabel === 'COILING' ? AMBER : DIM;
    ctx.fillStyle = `${statusColor}11`;
    ctx.strokeStyle = `${statusColor}66`;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, statusTop, w - padX * 2, statusH);
    ctx.strokeRect(padX, statusTop, w - padX * 2, statusH);

    const cellW = (w - padX * 2) / 4;
    const cells = [
      { label: 'effective_bars', value: String(sqBars), color: WHITE },
      { label: 'squeeze_phase', value: phaseLabel, color: phaseLabel === 'COILING' ? AMBER : DIM },
      { label: 'wall transp', value: String(wallTransp), color: AMBER },
      { label: 'fill transp', value: String(fillTransp), color: AMBER },
    ];
    cells.forEach((c, i) => {
      const cx = padX + i * cellW;
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, cx + cellW / 2, statusTop + 18);
      ctx.fillStyle = c.color;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(c.value, cx + cellW / 2, statusTop + 38);
      if (i < cells.length - 1) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + cellW, statusTop + 12);
        ctx.lineTo(cx + cellW, statusTop + statusH - 12);
        ctx.stroke();
      }
    });

    // Action footer
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (phaseLabel === 'COILING') {
      ctx.fillText('Action: PREPARE the trade plan — entry, stops, targets', w / 2, statusTop + 60);
    } else {
      ctx.fillText('Action: still BUILDING. Waiting for phase advance to bar 6...', w / 2, statusTop + 60);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COILING is the preparation phase. Walls visibly step up at bar 6.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — PhaseReadyAnim (S07 — Phase 3: BREAKOUT READY)
// 13+ effective_bars. Solid walls (transp 10), saturated fill (80).
// Shows the bar-13 transition with glow effect.
// ============================================================
function PhaseReadyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const AMBER = '#FFB300';
    const ORANGE = '#FF6B00';
    const TEAL = '#26A69A';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHASE 3  ·  BREAKOUT READY  ·  13+ effective_bars', w / 2, 22);

    // Cycle: ramp from bar 11 (COILING) through 16 (deep ready), pause, then breakout fire
    const cycleSec = 11;
    const cycleT = t % cycleSec;
    const startBar = 11;
    const peakBar = 16;
    const fireBar = 9; // when breakout fires
    let sqBars = startBar;
    let fired = false;
    if (cycleT < 1) sqBars = startBar;
    else if (cycleT < 7) sqBars = Math.min(peakBar, startBar + Math.floor(cycleT - 1));
    else if (cycleT < fireBar) sqBars = peakBar;
    else { sqBars = peakBar; fired = true; }

    const phaseLabel = sqBars >= 13 ? 'BREAKOUT READY' : sqBars >= 6 ? 'COILING' : 'BUILDING';
    const wallTransp = phaseLabel === 'BREAKOUT READY' ? 10 : phaseLabel === 'COILING' ? 30 : 55;
    const fillTransp = phaseLabel === 'BREAKOUT READY' ? 80 : phaseLabel === 'COILING' ? 88 : 93;
    const wallAlpha = (100 - wallTransp) / 100;
    const fillAlpha = (100 - fillTransp) / 100;

    // Layout
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 110;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Generate price — compressing then breaking up after fire
    const N = 50;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let amp = 0;
      let level = 50;
      if (i < 10) amp = 8;
      else if (i < 30) amp = 8 - (i - 10) * 0.35;
      else if (i < 33) { amp = 1; level = 50; }
      else { amp = 2; level = 50 + (i - 33) * 1.2; }
      prices.push(level + Math.sin(i * 0.6) * amp + Math.sin(i * 1.4) * amp * 0.3);
    }

    const minP = 35;
    const maxP = 70;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 6 + (i / (N - 1)) * (chartW - 12);

    // Box bounds (extends through bar 33 if not fired, else locks at 33)
    const sqStart = 12;
    const sqEnd = fired ? 33 : Math.min(33, sqStart + sqBars - 1);

    let highest = -Infinity, lowest = Infinity;
    for (let i = sqStart; i <= sqEnd; i++) {
      if (prices[i] > highest) highest = prices[i];
      if (prices[i] < lowest) lowest = prices[i];
    }
    const boxLeft = xScale(sqStart);
    const boxRight = xScale(sqEnd);
    const boxTop = yScale(highest + 1);
    const boxBot = yScale(lowest - 1);

    // Glow effect for BREAKOUT READY
    if (phaseLabel === 'BREAKOUT READY') {
      const pulseAmt = 0.5 + 0.5 * Math.sin(cycleT * 4);
      ctx.shadowColor = ORANGE;
      ctx.shadowBlur = 10 + pulseAmt * 8;
    }

    ctx.fillStyle = `rgba(255, 179, 0, ${fillAlpha})`;
    ctx.fillRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
    ctx.strokeStyle = phaseLabel === 'BREAKOUT READY' ? `rgba(255, 107, 0, ${wallAlpha})` : `rgba(255, 179, 0, ${wallAlpha})`;
    ctx.lineWidth = phaseLabel === 'BREAKOUT READY' ? 2.4 : phaseLabel === 'COILING' ? 1.8 : 1.5;
    ctx.strokeRect(boxLeft, boxTop, Math.max(2, boxRight - boxLeft), boxBot - boxTop);
    ctx.shadowBlur = 0;

    // Reveal cursor
    const cursor = fired ? Math.min(N - 1, 33 + Math.floor((cycleT - 9) * 4)) : Math.min(33, sqStart + sqBars);

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

    // Diamond if fired
    if (fired) {
      const dx = xScale(33);
      const dy = yScale(prices[33]) + 12;
      const flash = 0.5 + 0.5 * Math.sin(cycleT * 8);
      ctx.fillStyle = TEAL;
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 8 + flash * 6;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 5, dy + 5);
      ctx.lineTo(dx, dy + 10);
      ctx.lineTo(dx - 5, dy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Status row
    const statusTop = chartBot + 12;
    const statusH = 70;
    const statusColor = phaseLabel === 'BREAKOUT READY' ? ORANGE : phaseLabel === 'COILING' ? AMBER : DIM;
    ctx.fillStyle = `${statusColor}11`;
    ctx.strokeStyle = `${statusColor}66`;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, statusTop, w - padX * 2, statusH);
    ctx.strokeRect(padX, statusTop, w - padX * 2, statusH);

    const cellW = (w - padX * 2) / 4;
    const cells = [
      { label: 'effective_bars', value: String(sqBars), color: WHITE },
      { label: 'squeeze_phase', value: phaseLabel, color: statusColor },
      { label: 'wall transp', value: String(wallTransp), color: AMBER },
      { label: 'fill transp', value: String(fillTransp), color: AMBER },
    ];
    cells.forEach((c, i) => {
      const cx = padX + i * cellW;
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, cx + cellW / 2, statusTop + 18);
      ctx.fillStyle = c.color;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(c.value, cx + cellW / 2, statusTop + 38);
      if (i < cells.length - 1) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + cellW, statusTop + 12);
        ctx.lineTo(cx + cellW, statusTop + statusH - 12);
        ctx.stroke();
      }
    });

    // Action footer
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (fired) {
      ctx.fillStyle = TEAL;
      ctx.fillText('FIRED! Diamond drops, box locks. Trade window open.', w / 2, statusTop + 60);
    } else if (phaseLabel === 'BREAKOUT READY') {
      ctx.fillStyle = ORANGE;
      ctx.fillText('Action: TRIGGER ARMED — orders staged, watching for the fire bar', w / 2, statusTop + 60);
    } else {
      ctx.fillText('Action: still COILING. Waiting for phase advance to bar 13...', w / 2, statusTop + 60);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BREAKOUT READY is the strike phase. Walls solid, fill saturated, glow active.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — EnergyScoreAnim (S08 — Energy Score)
// 0-100 score, three additive components.
// Three horizontal bars: depth, duration, volume drying.
// Cycles through scenarios: low, moderate, high, EXTREME.
// ============================================================
function EnergyScoreAnim() {
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
    ctx.fillText('ENERGY SCORE  ·  depth + duration + volume drying  ·  0-100', w / 2, 22);

    // 4 scenarios cycle
    const scenarios = [
      { name: 'LOW',       depth: 12, dur: 8,  vol: 5,  total: 25, label: 'LOW',       color: AMBER },
      { name: 'MODERATE',  depth: 22, dur: 18, vol: 5,  total: 45, label: 'MODERATE',  color: AMBER },
      { name: 'HIGH',      depth: 30, dur: 28, vol: 15, total: 73, label: 'HIGH',      color: ORANGE },
      { name: 'EXTREME',   depth: 37, dur: 34, vol: 25, total: 96, label: 'EXTREME',   color: ORANGE },
    ];

    const cycleT = t % (scenarios.length * 3.5);
    const idx = Math.floor(cycleT / 3.5);
    const target = scenarios[idx];
    const animT = Math.min(1, (cycleT % 3.5) / 1.5); // animate fill over 1.5s

    // 3 horizontal component bars + total
    const padX = 30;
    const barTop = 56;
    const barH = 22;
    const barGap = 10;
    const labelW = 130;
    const valueW = 60;
    const barLeftBound = padX + labelW;
    const barRightBound = w - padX - valueW;
    const barW = barRightBound - barLeftBound;

    const components = [
      { label: 'depth (z-score × 15)', max: 40, value: target.depth, color: TEAL },
      { label: 'duration (bars × 2)', max: 35, value: target.dur, color: TEAL },
      { label: 'volume drying', max: 25, value: target.vol, color: TEAL },
    ];

    components.forEach((c, i) => {
      const by = barTop + i * (barH + barGap);

      // Label
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(c.label, padX + labelW - 8, by + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.fillRect(barLeftBound, by, barW, barH);
      ctx.strokeRect(barLeftBound, by, barW, barH);

      // Max marker
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`/${c.max}`, barLeftBound + barW + 14, by + barH / 2 + 3);

      // Filled portion (animated)
      const animValue = c.value * animT;
      const fillRatio = animValue / c.max;
      const fillW = fillRatio * barW;
      const grad = ctx.createLinearGradient(barLeftBound, 0, barLeftBound + fillW, 0);
      grad.addColorStop(0, c.color);
      grad.addColorStop(1, target.color);
      ctx.fillStyle = grad;
      ctx.fillRect(barLeftBound + 1, by + 1, fillW - 2, barH - 2);

      // Value text
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(Math.round(animValue).toString(), barLeftBound + fillW + 6, by + barH / 2 + 3);
    });

    // Total / verdict box
    const totalY = barTop + components.length * (barH + barGap) + 18;
    const totalH = 60;

    ctx.fillStyle = `${target.color}22`;
    ctx.strokeStyle = target.color;
    ctx.lineWidth = 1.5;
    ctx.fillRect(padX, totalY, w - padX * 2, totalH);
    ctx.strokeRect(padX, totalY, w - padX * 2, totalH);

    // Total bar
    const totalBarY = totalY + 28;
    const totalBarH = 14;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(padX + 16, totalBarY, w - padX * 2 - 32, totalBarH);
    ctx.strokeRect(padX + 16, totalBarY, w - padX * 2 - 32, totalBarH);

    const totalAnimVal = target.total * animT;
    const totalFillW = (totalAnimVal / 100) * (w - padX * 2 - 32);
    const tgrad = ctx.createLinearGradient(padX + 16, 0, padX + 16 + totalFillW, 0);
    tgrad.addColorStop(0, AMBER);
    tgrad.addColorStop(1, target.color);
    ctx.fillStyle = tgrad;
    ctx.fillRect(padX + 17, totalBarY + 1, Math.max(0, totalFillW - 2), totalBarH - 2);

    // Threshold tick marks at 20/40/60/80
    [20, 40, 60, 80].forEach((th) => {
      const tx = padX + 16 + (th / 100) * (w - padX * 2 - 32);
      ctx.strokeStyle = `${AMBER}66`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, totalBarY - 3);
      ctx.lineTo(tx, totalBarY);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(th), tx, totalBarY - 6);
    });

    // Total label + value
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL', padX + 16, totalY + 16);

    ctx.fillStyle = target.color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(totalAnimVal)}  ·  ${target.label}`, w - padX - 16, totalY + 16);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy is bar-count-independent. EXTREME (>80) coils are rare and worth seeing.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — PreSqueezeAnim (S09 — Pre-Squeeze Warning)
// ATR ratio declining for 5+ bars below 0.85 = pre-squeeze warning.
// Shows a falling vol_ratio line crossing 0.85, decline counter advancing.
// At 5 consecutive declining bars, WARNING fires before the squeeze itself.
// ============================================================
function PreSqueezeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
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
    ctx.fillText('PRE-SQUEEZE WARNING  ·  vol_ratio declining 5+ bars below 0.85', w / 2, 22);

    // Cycle: 14s loop. vol_ratio falls from 1.05 to 0.5 over the cycle.
    const cycleSec = 14;
    const cycleT = t % cycleSec;
    const cursorPhase = cycleT / cycleSec; // 0..1

    const N = 30;
    const ratios: number[] = [];
    for (let i = 0; i < N; i++) {
      const phase = i / N;
      // Decline pattern
      const ratio = 1.05 - phase * 0.55 + Math.sin(i * 0.8) * 0.04;
      ratios.push(Math.max(0.4, ratio));
    }

    const cursor = Math.min(N - 1, Math.floor(cursorPhase * N));

    // Compute decline_bars at cursor
    let declineBars = 0;
    for (let i = 1; i <= cursor; i++) {
      const declining = ratios[i] < ratios[Math.max(0, i - 5)];
      const belowThresh = ratios[i] < 0.85;
      if (declining && belowThresh) declineBars++;
      else declineBars = 0;
    }
    const warningActive = declineBars >= 5;
    const fullyConfirmed = ratios[cursor] < 0.7; // arbitrary cue for confirmed squeeze later

    // Layout: chart on left 65%, status on right 35%
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 60;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartW = w * 0.6;
    const chartRight = chartLeft + chartW;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    const yMin = 0.4;
    const yMax = 1.1;
    const yScale = (r: number) => chartTop + 6 + ((yMax - r) / (yMax - yMin)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 10 + (i / (N - 1)) * (chartW - 20);

    // Threshold zones
    // Below 0.85
    const thresh85Y = yScale(0.85);
    ctx.fillStyle = `${AMBER}11`;
    ctx.fillRect(chartLeft + 1, thresh85Y, chartW - 2, chartBot - thresh85Y - 1);

    // Threshold lines
    ctx.strokeStyle = `${AMBER}aa`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [0.85, 1.0].forEach((thr) => {
      const ly = yScale(thr);
      ctx.beginPath();
      ctx.moveTo(chartLeft + 1, ly);
      ctx.lineTo(chartRight - 1, ly);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Threshold labels
    ctx.fillStyle = AMBER;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0.85  warning thresh', chartLeft + 6, yScale(0.85) - 3);
    ctx.fillText('1.00  normal vol', chartLeft + 6, yScale(1.0) - 3);

    // ratio line
    ctx.strokeStyle = warningActive ? ORANGE : 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(ratios[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current value dot
    const cx = xScale(cursor);
    const cy = yScale(ratios[cursor]);
    ctx.fillStyle = warningActive ? ORANGE : WHITE;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Status panel on right
    const panelX = chartRight + 16;
    const panelW = w - panelX - padX;
    const panelTop = chartTop;
    const panelBot = chartBot;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(panelX, panelTop, panelW, panelBot - panelTop);
    ctx.strokeRect(panelX, panelTop, panelW, panelBot - panelTop);

    // Stats
    let yCursor = panelTop + 18;
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE STATE', panelX + panelW / 2, yCursor);
    yCursor += 18;

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('vol_ratio_atr', panelX + panelW / 2, yCursor);
    yCursor += 14;
    ctx.fillStyle = ratios[cursor] < 0.85 ? AMBER : WHITE;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(ratios[cursor].toFixed(2), panelX + panelW / 2, yCursor);
    yCursor += 22;

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('decline_bars', panelX + panelW / 2, yCursor);
    yCursor += 14;
    ctx.fillStyle = declineBars >= 5 ? ORANGE : declineBars > 0 ? AMBER : WHITE;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(String(declineBars), panelX + panelW / 2, yCursor);

    // Status pill
    yCursor = panelBot - 50;
    let statusText = 'NORMAL';
    let statusColor = DIM;
    if (fullyConfirmed) { statusText = 'SQUEEZE'; statusColor = ORANGE; }
    else if (warningActive) { statusText = 'WARNING'; statusColor = AMBER; }
    else if (declineBars > 0) { statusText = 'WATCH'; statusColor = AMBER; }

    ctx.fillStyle = `${statusColor}33`;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.fillRect(panelX + 6, yCursor, panelW - 12, 28);
    ctx.strokeRect(panelX + 6, yCursor, panelW - 12, 28);
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, panelX + panelW / 2, yCursor + 18);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (warningActive && !fullyConfirmed) {
      ctx.fillStyle = ORANGE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('PRE-SQUEEZE WARNING ACTIVE  ·  squeeze likely forming, no Coil Box yet', w / 2, h - 12);
    } else {
      ctx.fillText('Pre-squeeze fires BEFORE z-score triggers. Earliest possible signal.', w / 2, h - 12);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — BreakoutQualityAnim (S11)
// 3-factor breakout quality scorer.
// momentum + volume + trend-aligned → CONFIRMED / PROBABLE / SUSPECT
// Cycles through 3 scenarios: 3/3 CONFIRMED, 2/3 PROBABLE, 1/3 SUSPECT
// ============================================================
function BreakoutQualityAnim() {
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
    ctx.fillText('BREAKOUT QUALITY  ·  3-factor scorer at the fire bar', w / 2, 22);

    const scenarios = [
      { label: 'CONFIRMED', momentum: true, volume: true, trend: true, score: 3, color: TEAL, action: 'Take with confidence — full size, 1.5R+ target' },
      { label: 'PROBABLE', momentum: true, volume: true, trend: false, score: 2, color: AMBER, action: 'Take with care — half size, tighter target' },
      { label: 'SUSPECT', momentum: true, volume: false, trend: false, score: 1, color: MAGENTA, action: 'Skip or scratch entry — high fake-out risk' },
    ];

    const cycleT = t % (scenarios.length * 4);
    const idx = Math.floor(cycleT / 4);
    const s = scenarios[idx];
    const animT = Math.min(1, (cycleT % 4) / 1.5);

    // Scenario banner
    ctx.fillStyle = `${s.color}22`;
    ctx.strokeStyle = `${s.color}88`;
    ctx.lineWidth = 1;
    {
      const bX = w / 2 - 130;
      const bY = 36;
      const bW = 260;
      const bH = 26;
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
    }
    ctx.fillStyle = s.color;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, w / 2, 53);

    // 3 factor cells in a row
    const factorTop = 80;
    const factorH = 80;
    const factorGap = 10;
    const padX = 30;
    const factorW = (w - padX * 2 - factorGap * 2) / 3;

    const factors = [
      { name: 'MOMENTUM', test: 'health_smooth > 50', pass: s.momentum, lightAt: 0.3 },
      { name: 'VOLUME', test: 'vol_ratio > 1.0', pass: s.volume, lightAt: 0.55 },
      { name: 'TREND-ALIGNED', test: 'ribbon_dir matches breakout', pass: s.trend, lightAt: 0.8 },
    ];

    factors.forEach((f, i) => {
      const fx = padX + i * (factorW + factorGap);
      const fy = factorTop;
      const lit = animT >= f.lightAt;
      const pColor = f.pass ? TEAL : MAGENTA;

      // Cell
      ctx.fillStyle = lit ? `${pColor}22` : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = lit ? pColor : FAINT;
      ctx.lineWidth = lit ? 1.5 : 1;
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(fx + r, fy);
      ctx.lineTo(fx + factorW - r, fy);
      ctx.quadraticCurveTo(fx + factorW, fy, fx + factorW, fy + r);
      ctx.lineTo(fx + factorW, fy + factorH - r);
      ctx.quadraticCurveTo(fx + factorW, fy + factorH, fx + factorW - r, fy + factorH);
      ctx.lineTo(fx + r, fy + factorH);
      ctx.quadraticCurveTo(fx, fy + factorH, fx, fy + factorH - r);
      ctx.lineTo(fx, fy + r);
      ctx.quadraticCurveTo(fx, fy, fx + r, fy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Factor name
      ctx.fillStyle = lit ? pColor : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.name, fx + factorW / 2, fy + 18);

      // Test (small monospace)
      ctx.fillStyle = lit ? 'rgba(255,255,255,0.7)' : DIM;
      ctx.font = '8px ui-monospace, Menlo, monospace';
      ctx.fillText(f.test, fx + factorW / 2, fy + 32);

      // Pass/fail icon (large)
      ctx.fillStyle = lit ? pColor : DIM;
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText(lit ? (f.pass ? '✓' : '✗') : '·', fx + factorW / 2, fy + 60);

      // Status label
      ctx.fillStyle = lit ? pColor : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.fillText(lit ? (f.pass ? 'PASS' : 'FAIL') : '...', fx + factorW / 2, fy + 74);
    });

    // Score box
    const scoreY = factorTop + factorH + 14;
    const scoreH = 42;
    ctx.fillStyle = `${s.color}22`;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.5;
    ctx.fillRect(padX, scoreY, w - padX * 2, scoreH);
    ctx.strokeRect(padX, scoreY, w - padX * 2, scoreH);

    // Score readout
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`bo_score: ${s.score}/3`, padX + 14, scoreY + 18);

    ctx.fillStyle = s.color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`last_bo_quality = ${s.label}`, w - padX - 14, scoreY + 18);

    ctx.fillStyle = WHITE;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.action, w / 2, scoreY + 33);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score 3 = CONFIRMED · 2 = PROBABLE · ≤1 = SUSPECT. Check at the fire bar, not after.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — RunnerDudAnim (S12)
// 5-bar post-breakout tracker.
// Cursor sweeps through 5 bars after fire showing ATR-distance traveled.
// At bar 5, final verdict: RUNNER ✓ / NORMAL / DUD ✗
// ============================================================
function RunnerDudAnim() {
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
    ctx.fillText('RUNNER VS DUD  ·  5-bar post-breakout ATR tracker', w / 2, 22);

    // 3 scenarios cycle: RUNNER, NORMAL, DUD
    const scenarios = [
      {
        name: 'RUNNER',
        color: TEAL,
        // Travel pattern: strong move that hits 1.4 ATR by bar 5
        travels: [0, 0.4, 0.7, 1.0, 1.2, 1.4],
        statuses: ['', 'MOVING', 'MOVING', 'RUNNING 1.0', 'RUNNING 1.2', 'RUNNER ✓'],
        finalLabel: 'RUNNER ✓',
        action: 'Real breakout — continue riding, full target',
      },
      {
        name: 'NORMAL',
        color: AMBER,
        travels: [0, 0.2, 0.4, 0.5, 0.55, 0.6],
        statuses: ['', 'SLOW', 'MOVING', 'MOVING', 'MOVING', 'NORMAL'],
        finalLabel: 'NORMAL',
        action: 'Modest follow-through — scratch at break-even or take small profit',
      },
      {
        name: 'DUD',
        color: MAGENTA,
        travels: [0, 0.1, 0.05, 0.0, -0.1, -0.2],
        statuses: ['', 'SLOW', 'STALLED', 'STALLED', 'STALLED', 'DUD ✗'],
        finalLabel: 'DUD ✗',
        action: 'Fake breakout — exit immediately, expect reversal',
      },
    ];

    const cycleT = t % (scenarios.length * 5);
    const idx = Math.floor(cycleT / 5);
    const s = scenarios[idx];
    const subT = cycleT % 5;
    const cursor = Math.min(5, Math.floor(subT));

    // Layout: chart on top, bar-by-bar tracker below
    const padX = 24;
    const chartTop = 50;
    const chartBot = h - 100;
    const chartH = chartBot - chartTop;
    const chartLeft = padX;
    const chartRight = w - padX;
    const chartW = chartRight - chartLeft;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);
    ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

    // Mark fire bar position (bar 0) and 5-bar tracker
    const fireBar = 1; // visual position in N=10 chart
    const N = 10;

    // Generate price line: pre-fire (3 bars wide-flat compression) then 5-bar travel
    const prices: number[] = [];
    const basePrice = 50;
    for (let i = 0; i < N; i++) {
      if (i < fireBar) {
        // Pre-fire compression
        prices.push(basePrice + Math.sin(i * 1.2) * 0.8);
      } else if (i <= fireBar + 5) {
        // Post-fire travel
        const trackerIdx = i - fireBar;
        if (trackerIdx <= cursor) {
          prices.push(basePrice + s.travels[trackerIdx] * 8);
        } else {
          prices.push(basePrice);
        }
      } else {
        prices.push(prices[i - 1]);
      }
    }

    const minP = 35;
    const maxP = 65;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => chartLeft + 30 + (i / (N - 1)) * (chartW - 50);

    // Draw fire-bar line
    const fireX = xScale(fireBar);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(fireX, chartTop + 4);
    ctx.lineTo(fireX, chartBot - 4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Diamond at fire bar
    const fireY = yScale(prices[fireBar]) + 12;
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.moveTo(fireX, fireY);
    ctx.lineTo(fireX + 5, fireY + 5);
    ctx.lineTo(fireX, fireY + 10);
    ctx.lineTo(fireX - 5, fireY + 5);
    ctx.closePath();
    ctx.fill();

    // ATR threshold lines (1.0 ATR = runner threshold, 0.3 ATR = dud threshold)
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

    // Threshold labels
    ctx.fillStyle = TEAL;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+1.0 ATR  RUNNER', chartRight - 8, runnerY - 3);
    ctx.fillStyle = AMBER;
    ctx.fillText('+0.3 ATR  DUD line', chartRight - 8, dudY - 3);

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

    // Cursor dot at current bar
    if (cursor > 0) {
      const cx = xScale(fireBar + cursor);
      const cy = yScale(prices[fireBar + cursor]);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bar-by-bar tracker below chart
    const trackerTop = chartBot + 10;
    const trackerH = 60;
    const trackerCellW = (w - padX * 2) / 6;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, trackerTop, w - padX * 2, trackerH);
    ctx.strokeRect(padX, trackerTop, w - padX * 2, trackerH);

    for (let i = 0; i <= 5; i++) {
      const tx = padX + i * trackerCellW;
      const isPast = i <= cursor;
      const isCurrent = i === cursor;

      // Bar header
      ctx.fillStyle = isPast ? AMBER : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i === 0 ? 'FIRE' : `+${i}b`, tx + trackerCellW / 2, trackerTop + 14);

      // Travel value
      if (isPast && i > 0) {
        const tColor = s.travels[i] > 1.0 ? TEAL : s.travels[i] > 0.3 ? AMBER : MAGENTA;
        ctx.fillStyle = tColor;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(`${s.travels[i] >= 0 ? '+' : ''}${s.travels[i].toFixed(1)}`, tx + trackerCellW / 2, trackerTop + 30);

        // Status
        ctx.fillStyle = isCurrent ? s.color : tColor;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText(s.statuses[i], tx + trackerCellW / 2, trackerTop + 44);
      } else if (i === 0) {
        ctx.fillStyle = AMBER;
        ctx.font = '7px Inter, sans-serif';
        ctx.fillText('◆ Diamond', tx + trackerCellW / 2, trackerTop + 30);
      } else {
        ctx.fillStyle = DIM;
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText('—', tx + trackerCellW / 2, trackerTop + 30);
      }

      // Vertical separator
      if (i < 5) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx + trackerCellW, trackerTop + 6);
        ctx.lineTo(tx + trackerCellW, trackerTop + trackerH - 6);
        ctx.stroke();
      }
    }

    // Bottom verdict text
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (cursor === 5) {
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`Final: ${s.finalLabel}  ·  ${s.action}`, w / 2, h - 12);
    } else {
      ctx.fillText('Tracker runs for 5 bars. Final verdict at bar 5.', w / 2, h - 12);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — DoubleCoilAnim (S13)
// Ribbon coil + BB/KC squeeze simultaneously = DOUBLE COIL.
// Two compression visuals stacked: Ribbon coiling (top), BB/KC tightening
// (bottom). When both coil at the same time, ★ marker appears.
// ============================================================
function DoubleCoilAnim() {
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
    ctx.fillText('DOUBLE COIL ★  ·  Ribbon + BB/KC compression simultaneously', w / 2, 22);

    // Cycle: 14s loop
    // 0-3s: Ribbon coiling alone (no double)
    // 3-7s: BB/KC also compresses → DOUBLE COIL forms
    // 7-12s: Both fully coiled, star pulses, ★ marker visible
    // 12-14s: Release, both expand
    const cycleSec = 14;
    const cycleT = t % cycleSec;

    // Compute coil intensities (0..1)
    let ribbonCoil = 0;
    let bbkcCoil = 0;
    if (cycleT < 3) {
      ribbonCoil = cycleT / 3;
    } else if (cycleT < 7) {
      ribbonCoil = 1.0;
      bbkcCoil = (cycleT - 3) / 4;
    } else if (cycleT < 12) {
      ribbonCoil = 1.0;
      bbkcCoil = 1.0;
    } else {
      const releaseT = (cycleT - 12) / 2;
      ribbonCoil = 1.0 - releaseT;
      bbkcCoil = 1.0 - releaseT;
    }

    const isDoubleCoil = ribbonCoil > 0.7 && bbkcCoil > 0.7;

    // Layout: two stacked panels
    const padX = 24;
    const panelGap = 10;
    const totalH = h - 110;
    const panelH = (totalH - panelGap) / 2;
    const panelTop1 = 50;
    const panelTop2 = panelTop1 + panelH + panelGap;
    const panelW = w - padX * 2;

    // ── PANEL 1: RIBBON ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, panelTop1, panelW, panelH);
    ctx.strokeRect(padX, panelTop1, panelW, panelH);

    // Title
    ctx.fillStyle = ribbonCoil > 0.5 ? AMBER : DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`RIBBON  ·  ${ribbonCoil > 0.7 ? 'COILED' : ribbonCoil > 0.3 ? 'COMPRESSING' : 'NORMAL'}`, padX + 10, panelTop1 + 16);

    // Draw ribbon — multiple lines that converge as coil intensifies
    const ribbonCenterY = panelTop1 + panelH / 2 + 6;
    const ribbonSpread = 22 - ribbonCoil * 18; // 22 → 4 as coil grows

    const ribbonLines = 5;
    const ribbonN = 50;
    for (let line = 0; line < ribbonLines; line++) {
      const offset = (line - (ribbonLines - 1) / 2) * (ribbonSpread / ribbonLines);
      ctx.strokeStyle = ribbonCoil > 0.7 ? AMBER : `rgba(38, 166, 154, ${0.5 + ribbonCoil * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < ribbonN; i++) {
        const x = padX + 8 + (i / (ribbonN - 1)) * (panelW - 16);
        const wave = Math.sin(i * 0.4 + t * 0.5) * (3 - ribbonCoil * 2);
        const y = ribbonCenterY + offset + wave;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Glow when fully coiled
    if (ribbonCoil > 0.85) {
      const pulseAmt = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.shadowColor = AMBER;
      ctx.shadowBlur = 4 + pulseAmt * 4;
      ctx.strokeStyle = `rgba(255, 179, 0, ${pulseAmt * 0.6})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 8, ribbonCenterY - 4, panelW - 16, 8);
      ctx.shadowBlur = 0;
    }

    // ── PANEL 2: BB/KC ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, panelTop2, panelW, panelH);
    ctx.strokeRect(padX, panelTop2, panelW, panelH);

    ctx.fillStyle = bbkcCoil > 0.5 ? AMBER : DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`BB/KC  ·  ${bbkcCoil > 0.7 ? 'SQUEEZED' : bbkcCoil > 0.3 ? 'COMPRESSING' : 'NORMAL'}`, padX + 10, panelTop2 + 16);

    // Draw BB inside KC, BB shrinks as bbkcCoil grows
    const bbCenterY = panelTop2 + panelH / 2 + 6;
    const kcSpread = 24;
    const bbSpread = 24 - bbkcCoil * 20;

    // KC bands (amber dashed)
    ctx.strokeStyle = `${AMBER}88`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    [1, -1].forEach((side) => {
      const y = bbCenterY + side * kcSpread / 2;
      ctx.beginPath();
      ctx.moveTo(padX + 8, y);
      ctx.lineTo(padX + panelW - 8, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // BB bands (white solid)
    ctx.strokeStyle = bbkcCoil > 0.5 ? AMBER : 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2;
    [1, -1].forEach((side) => {
      ctx.beginPath();
      const bbN = 50;
      for (let i = 0; i < bbN; i++) {
        const x = padX + 8 + (i / (bbN - 1)) * (panelW - 16);
        const wave = Math.sin(i * 0.5 + t * 0.6) * (1.5 - bbkcCoil);
        const y = bbCenterY + side * bbSpread / 2 + wave;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Price line
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) {
      const x = padX + 8 + (i / 49) * (panelW - 16);
      const amp = 8 - bbkcCoil * 7;
      const y = bbCenterY + Math.sin(i * 0.6 + t * 0.4) * amp;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ── Star marker when DOUBLE COIL is active ──
    if (isDoubleCoil) {
      const starX = w / 2;
      const starY = panelTop1 + panelH + panelGap / 2;
      const pulseAmt = 0.5 + 0.5 * Math.sin(t * 5);
      ctx.fillStyle = ORANGE;
      ctx.shadowColor = ORANGE;
      ctx.shadowBlur = 8 + pulseAmt * 6;
      ctx.font = `bold ${20 + pulseAmt * 4}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('★', starX, starY + 4);
      ctx.shadowBlur = 0;

      ctx.fillStyle = ORANGE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('DOUBLE COIL', starX + 36, starY + 4);
    }

    // Bottom status box
    const statusY = h - 50;
    const statusH = 36;
    const statusColor = isDoubleCoil ? ORANGE : ribbonCoil > 0.5 || bbkcCoil > 0.5 ? AMBER : DIM;
    ctx.fillStyle = `${statusColor}22`;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, statusY, panelW, statusH);
    ctx.strokeRect(padX, statusY, panelW, statusH);

    let statusText = '';
    if (isDoubleCoil) statusText = 'DOUBLE COIL ★  ·  highest-energy state CIPHER recognises';
    else if (ribbonCoil > 0.7) statusText = 'Ribbon COILED — waiting on BB/KC for double';
    else if (bbkcCoil > 0.7) statusText = 'BB/KC SQUEEZED — waiting on Ribbon for double';
    else if (cycleT > 12) statusText = 'Both released — energy expended';
    else statusText = 'Compression building — neither layer fully coiled yet';

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, w / 2, statusY + 22);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('rs_double_coil = rs_confirmed AND squeeze_confirmed  ·  highest-edge tier', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherCoilMechanicsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.14-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 14</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Coil Box Mechanics<br />Birth, Growth, Death<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Energy Stored. Energy Released.</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">The amber boxes wrapping price during compression are CIPHER&apos;s most powerful pre-trade visual. This lesson teaches the state machine behind them &mdash; the BB/KC trigger math, the three lifecycle phases, the transitions you can see, and the energy that&apos;s building inside.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">The Coil Box is energy you can see.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most operators look at a Coil Box and feel <em>something is coming</em> &mdash; vague intuition, no precise read. <strong className="text-white">After this lesson, you&apos;ll know exactly what the box is telling you.</strong> How much energy is stored. Which phase the squeeze is in. How close it is to release. Whether the breakout that just fired was real or fake.</p>
            <p className="text-gray-400 leading-relaxed mb-4">The Pine math behind the Coil Box is unusually clean. A Bollinger Band contracts inside a Keltner Channel. The ratio between them is z-score normalised against the asset&apos;s own history &mdash; so the box auto-calibrates per asset. Three consecutive bars of true squeeze confirms it. From there, a state machine takes over: <strong className="text-amber-400">Birth, Growth, Death.</strong> Each transition is an explicit Pine event. Each phase has its own visual signature, its own trading implication, and its own readout in the Volatility &amp; Squeeze row of the Command Center.</p>
            <p className="text-gray-400 leading-relaxed">Coil Box mastery is the difference between the operator who treats squeezes as &ldquo;maybe a breakout&rdquo; and the one who reads each phase precisely &mdash; sees the energy filling, recognises the BREAKOUT READY signature, identifies a Double Coil when it forms, and calls runner-vs-dud on the post-breakout 5-bar window. <strong className="text-amber-400">By the end of this lesson, that&apos;s you.</strong></p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE COIL OPERATOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">BB/KC squeeze math</strong> that triggers a Coil Box, the <strong className="text-white">three lifecycle phases</strong> (BUILDING / COILING / BREAKOUT READY) and what each looks like, the <strong className="text-white">Birth / Growth / Death state transitions</strong> in Pine, the <strong className="text-white">energy scoring system</strong> (depth + duration + volume drying), the <strong className="text-white">pre-squeeze warning</strong> that fires before z-score officially triggers, the <strong className="text-white">breakout diamond</strong> and how to read its tooltip, the <strong className="text-white">CONFIRMED / PROBABLE / SUSPECT</strong> quality scoring, the <strong className="text-white">runner-vs-dud 5-bar tracker</strong>, and the <strong className="text-white">Double Coil</strong> &mdash; CIPHER&apos;s highest-energy state. By the end you read coils with precision, not vibes.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Storage Tank (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Storage Tank</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Think of the Coil Box as a vertical storage tank. As price compresses inside Bollinger Bands that are themselves shrinking inside Keltner Channels, the tank fills. Each squeeze-confirmed bar adds energy. Three labeled fill levels mark the lifecycle: <strong className="text-white">BUILDING</strong> at the bottom, <strong className="text-white">COILING</strong> in the middle, <strong className="text-amber-400">BREAKOUT READY</strong> at the top. When the tank reaches BREAKOUT READY, it begins to glow &mdash; energy primed, release imminent. When the squeeze fires, <strong className="text-amber-400">the tank ruptures</strong> and the energy releases in a single direction, marked by a diamond on the chart.</p>
          <StorageTankAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The tank fills as squeeze bars accumulate &mdash; you can read the bar count above it and the phase label tracking the fill level. The chart on the right shows the same story in price action: BB bands compressing, an amber Coil Box appearing, walls brightening with phase. <strong className="text-white">When the tank ruptures, a teal diamond appears on the chart at the breakout bar.</strong> One concept, three Pine outputs, all unified.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE TANK METAPHOR WORKS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The tank captures the central physical intuition: <strong className="text-white">energy released equals energy stored</strong>. A coil that compressed for 18 bars at extreme depth releases more violently than a coil that compressed for 4 bars at modest depth. The tank&apos;s fill level visually encodes both inputs &mdash; depth (how deep it sits below normal volatility) and duration (how many bars it&apos;s been there). Volume drying during the squeeze adds spring-loading on top. Each input is a real Pine variable; the tank fill is just their visual sum.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THREE FILL LEVELS, THREE PHASES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The three tank levels map 1:1 to the Pine&apos;s three phases. <strong className="text-white">BUILDING (1-5 bars)</strong>: tank is filling, walls of the chart-side coil are faint. <strong className="text-white">COILING (6-12 bars)</strong>: tank is mid-fill, walls brighter. <strong className="text-amber-400">BREAKOUT READY (13+ bars)</strong>: tank is full and glowing, walls solid amber. Each phase has explicit Pine transparency values (lines 1636-1637) that determine how the box actually renders on your chart. The visual is not stylistic &mdash; it&apos;s a state readout.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE RUPTURE IS THE BREAKOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">When `squeeze_confirmed` flips from true to false in the Pine, the box locks (Death phase) and a directional diamond drops at the firing bar. The diamond direction is determined by one bar&apos;s candle: <strong className="text-white">close &gt; open = bull diamond (teal)</strong>, otherwise bear diamond (magenta). The tank ruptured, the energy chose a direction, and your trade window is open. The next 5 bars determine whether it was a real release or a fake.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS METAPHOR &gt; OTHERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A &ldquo;pressure cooker&rdquo; or &ldquo;wound spring&rdquo; would also describe stored energy &mdash; but neither has visible fill levels that map to phases. The storage tank is unique in that <strong className="text-white">the metaphor itself teaches the operational layers</strong> &mdash; you read the fill level to know the phase, you read the glow to know readiness, you watch the rupture to know direction. Every visual element corresponds to a Pine variable. Nothing in the metaphor is decorative.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you see a Coil Box, the questions are: <strong className="text-white">how full is the tank? how bright are the walls? how close to BREAKOUT READY?</strong> The brighter the walls, the closer to release. The longer the duration plus the deeper the compression, the more energy stored. The more energy stored, the more decisive the eventual breakout. The tank metaphor gives you the read &mdash; the rest of the lesson gives you the precision.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The BB/KC Squeeze (the trigger math) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Trigger Math</p>
          <h2 className="text-2xl font-extrabold mb-4">BB inside KC + 3-bar confirmation</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A coil starts only when two things are true: <strong className="text-white">Bollinger Bands have contracted inside Keltner Channels</strong> (volatility has dropped below normal), AND that compression has held for at least three consecutive bars (it&apos;s not a single-bar artifact). The math is in <code className="text-amber-400 font-mono text-xs">squeeze_ratio = bb_width / kc_width</code> &mdash; when this ratio drops below a calibrated threshold, the squeeze is on.</p>
          <BBKCSqueezeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The white bands are BB (Bollinger, 20-period stdev × 2). The amber dashed bands are KC (Keltner, 10-period ATR × 1.5). As volatility contracts, the white BB shrinks INSIDE the amber KC. The right gauge tracks <code className="text-amber-400 font-mono text-xs">squeeze_ratio</code> in real time &mdash; when it crosses below 0.95, IN_SQUEEZE fires. After 3 consecutive bars, CONFIRMED. <strong className="text-white">The amber-shaded bars on the chart are confirmed-squeeze bars.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BOLLINGER BANDS  ·  the volatility envelope</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">bb_basis = ta.sma(close, 20)</code> &middot; <code className="text-white font-mono text-xs">bb_dev = ta.stdev(close, 20) × 2</code>. Standard 20-period, 2-sigma BB. <code className="text-amber-400 font-mono text-xs">bb_width = bb_dev × 2</code> = total band width. When stdev drops, BB tightens. <strong className="text-white">BB measures realised volatility.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">KELTNER CHANNELS  ·  the ATR envelope</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">kc_atr_val = ta.atr(10) × 1.5</code> &middot; <code className="text-white font-mono text-xs">kc_width = kc_atr_val × 2</code>. 10-period ATR, 1.5x multiplier. <strong className="text-white">KC measures average price range.</strong> Unlike BB, KC doesn&apos;t care about price direction, only range. KC is more stable than BB &mdash; it doesn&apos;t whip around as much during bursts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE RATIO  ·  bb_width / kc_width</p>
              <p className="text-sm text-gray-400 leading-relaxed">When BB is narrower than KC, the ratio drops below 1.0. <strong className="text-white">Below 0.95 means BB has shrunk to less than 95% of KC&apos;s range</strong> &mdash; volatility has compressed below the asset&apos;s recent average. This is the &ldquo;BB inside KC&rdquo; classical squeeze indicator state. CIPHER goes one step further with z-score adaptive calibration (next sub-section).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">Z-SCORE ADAPTIVE TRIGGER  ·  asset-self-calibrating</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Pine doesn&apos;t just check ratio &lt; 0.95. It also checks <code className="text-amber-400 font-mono text-xs">sq_zscore &gt; 1.5</code> &mdash; the ratio must be 1.5 standard deviations below its own 150-bar rolling mean. <strong className="text-white">Why this matters:</strong> forex pairs naturally run BB/KC ratios around 0.6 (tight ranges). Stocks run them around 1.0. A flat 0.95 threshold would over-trigger on forex and under-trigger on stocks. The z-score normalises across assets &mdash; <strong className="text-amber-400">the squeeze fires only when this asset is unusually compressed by its own history</strong>, not by an absolute number.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">3-BAR CONFIRMATION  ·  filtering single-bar noise</p>
              <p className="text-sm text-gray-400 leading-relaxed">Volatility can drop on a single bar for many reasons &mdash; one quiet candle in choppy noise, a low-volume bar between bursts. CIPHER requires <code className="text-amber-400 font-mono text-xs">squeeze_bars &gt;= 3</code> for <code className="text-white font-mono text-xs">squeeze_confirmed</code> to fire. <strong className="text-white">Three consecutive bars of true compression</strong> is the minimum that distinguishes a real squeeze from random low-vol noise. The cost is two bars of latency. The benefit is filtering ~80% of false squeeze prints.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE INPUT YOU CONTROL</p>
            <p className="text-sm text-gray-400 leading-relaxed">Coil Box rendering is gated by a single input: <code className="text-amber-400 font-mono text-xs">i_show_squeeze</code> (toggle name: <strong className="text-white">Cipher Coil</strong>). It&apos;s OFF by default. To see Coil Boxes, turn it on. The Sniper preset turns it on automatically along with Cipher Pulse (widest) and Strong Signals Only &mdash; tagline: <strong className="text-white">&ldquo;Wait for the squeeze, then strike.&rdquo;</strong> Recommended starting configuration for any operator running coil-led trading.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Lifecycle State Machine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Lifecycle State Machine</p>
          <h2 className="text-2xl font-extrabold mb-4">Birth · Growth · Death</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A Coil Box is not a static drawing &mdash; it&apos;s a state machine with three explicit transitions. <strong className="text-amber-400">Birth</strong> creates the box. <strong className="text-amber-400">Growth</strong> updates its bounds and styling each bar. <strong className="text-amber-400">Death</strong> locks it permanently. Each transition is an explicit Pine event you can map to a single condition. Once you know the three triggers, you can predict exactly what the box will do on the next bar.</p>
          <LifecycleStatesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the cards cycle through Birth, Growth, Death. The chart below illustrates each phase with a real coil progression &mdash; box appears, expands, then locks and fires a diamond. <strong className="text-white">Each transition is one Pine line of code.</strong> No hidden logic, no probabilistic state &mdash; explicit transitions, observable from the chart.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">BIRTH  ·  sq_just_started</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">bool sq_just_started = squeeze_confirmed and not squeeze_confirmed[1]</code>. The single bar where the squeeze flips from unconfirmed to confirmed. On this bar, Pine executes <code className="text-amber-400 font-mono text-xs">box.new()</code> with the current bar&apos;s high and low as initial bounds. <strong className="text-white">Birth always happens at the right edge of the chart</strong> &mdash; you see a fresh box appear in real time at the live bar, on the bar that confirmed the third consecutive squeeze.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">GROWTH  ·  squeeze_confirmed (every bar)</p>
              <p className="text-sm text-gray-400 leading-relaxed">As long as <code className="text-white font-mono text-xs">squeeze_confirmed</code> stays true, the box is alive. Each bar: bounds expand if price extends beyond previous high or low (<code className="text-amber-400 font-mono text-xs">box.set_top</code>, <code className="text-amber-400 font-mono text-xs">box.set_bottom</code>); right edge ratchets to current bar (<code className="text-amber-400 font-mono text-xs">box.set_right</code>); border + fill color update with phase styling (<code className="text-amber-400 font-mono text-xs">box.set_border_color</code>, <code className="text-amber-400 font-mono text-xs">box.set_bgcolor</code>). <strong className="text-white">A growing box visibly extends rightward and brightens as it matures.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEATH  ·  sq_just_ended</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">bool sq_just_ended = squeeze_confirmed[1] and not squeeze_confirmed</code>. The single bar where the squeeze flips from confirmed back to unconfirmed. On this bar, Pine pushes the box to <code className="text-amber-400 font-mono text-xs">coil_history</code> (a max-10 array of historical boxes), clears the active reference, and the box <strong className="text-white">locks in place permanently</strong>. The box never grows again. It becomes a historical marker showing where the squeeze was. <strong className="text-amber-400">Death and breakout fire on the same bar.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HISTORY ARRAY  ·  10 boxes max, oldest pruned</p>
              <p className="text-sm text-gray-400 leading-relaxed">After Death, the box doesn&apos;t disappear &mdash; it persists. Pine maintains a <code className="text-amber-400 font-mono text-xs">coil_history</code> array with up to 10 historical boxes. When the 11th coil dies, the oldest box is deleted (<code className="text-white font-mono text-xs">array.shift</code>) to stay under the drawing budget. <strong className="text-white">On a long-running chart you see up to 10 amber boxes</strong> &mdash; one active (if a squeeze is in progress), the rest historical. They do not interact with each other; each is its own lifecycle artifact.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOGGLE-OFF CLEANUP</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you turn off <code className="text-amber-400 font-mono text-xs">i_show_squeeze</code> mid-chart, Pine wipes everything. <code className="text-white font-mono text-xs">box.delete()</code> on the active box, then a loop deleting all history. <strong className="text-white">No orphaned boxes left behind.</strong> Toggle back on, and new coils start fresh from the next confirmed squeeze. This is unusual cleanliness for a Pine state-machine indicator &mdash; most leak drawings on toggle changes.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THE STATE MACHINE FROM THE CHART</p>
            <p className="text-sm text-gray-400 leading-relaxed">Look at the rightmost edge of an active Coil Box. <strong className="text-white">If it&apos;s touching the live bar and the right edge moves bar by bar, it&apos;s in Growth.</strong> If the right edge stops moving and a diamond drops at that bar, it just transitioned to Death &mdash; the breakout has fired. If you see a Coil Box that&apos;s far from the right edge with no extension happening, it died long ago and is now a historical marker. <strong className="text-amber-400">The state of any box is readable just from its right edge.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Box Styling === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Box Styling</p>
          <h2 className="text-2xl font-extrabold mb-4">Walls and fill brighten with phase</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Coil Box doesn&apos;t just exist or not exist &mdash; <strong className="text-amber-400">its visual intensity tells you which phase it&apos;s in.</strong> Walls go from faint to bright. Fill goes from translucent to saturated. Both progressions are explicit Pine values tied to <code className="text-amber-400 font-mono text-xs">effective_bars</code>. Once you know the styling rules, you can read the phase without checking the Command Center row &mdash; just look at the box.</p>
          <BoxStylingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three phase samples cycle. <strong className="text-white">BUILDING</strong> walls: faint (transparency 55), fill barely visible (transparency 93). <strong className="text-white">COILING</strong>: medium walls (30), light fill (88). <strong className="text-amber-400">BREAKOUT READY</strong>: thick bright walls (10 = nearly solid), saturated fill (80). The numerical values come directly from Pine line 1636-1637.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO PROGRESSIONS  ·  walls vs fill</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two separate transparency values per phase. <strong className="text-white">Wall transparency</strong> (<code className="text-amber-400 font-mono text-xs">sq_line_transp</code>) controls border opacity: 55 → 30 → 10 across phases. <strong className="text-white">Fill transparency</strong> (<code className="text-amber-400 font-mono text-xs">sq_fill_transp</code>) controls background opacity: 93 → 88 → 80. Lower number = more visible. Walls progress more aggressively (45-point swing) than fill (13-point swing) because the eye picks up edges faster than fills.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECTIVE_BARS  ·  the phase driver</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">effective_bars = squeeze_bars + depth_bonus</code>. <code className="text-amber-400 font-mono text-xs">depth_bonus</code> is 6 if z-score &gt; 2.5, 3 if &gt; 2.0, else 0. <strong className="text-white">Deeper compressions accelerate phase advancement.</strong> A violently tight squeeze hits BREAKOUT READY at 7 bars (12 needed - 6 bonus); a shallow long squeeze needs the full 13. This means a brief but extremely deep coil can be visually as urgent as a long shallow one &mdash; <strong className="text-amber-400">walls don&apos;t lie about the underlying state.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PHASE THRESHOLDS  ·  &gt;5, &gt;12</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine line 1605: <code className="text-white font-mono text-xs">squeeze_phase = effective_bars &gt; 12 ? &quot;BREAKOUT READY&quot; : effective_bars &gt; 5 ? &quot;COILING&quot; : effective_bars &gt; 0 ? &quot;BUILDING&quot; : &quot;&quot;</code>. Three thresholds: 1, 6, 13. <strong className="text-white">A box at exactly 5 effective_bars is still BUILDING; at 6 it becomes COILING.</strong> The visual transitions happen at these exact bar counts &mdash; not gradually, but at discrete jumps. Watch a maturing coil and you&apos;ll see the wall opacity make a visible step at 6 and again at 13.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING WALLS WITHOUT THE COMMAND CENTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even with the Volatility &amp; Squeeze row off, you can call the phase by sight. <strong className="text-white">Faint walls you can barely see &mdash; BUILDING.</strong> <strong className="text-white">Walls clearly visible but not solid &mdash; COILING.</strong> <strong className="text-amber-400">Walls bright, almost solid amber, fill noticeably colored &mdash; BREAKOUT READY.</strong> Train this read on 20-30 historical coils on your primary asset and it becomes automatic. The styling is the engine&apos;s loudest signal.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PHASE ≠ ENERGY  ·  important distinction</p>
            <p className="text-sm text-gray-400 leading-relaxed">Wall brightness shows <strong className="text-white">PHASE</strong>, not <strong className="text-white">ENERGY</strong>. Two different things. Phase is bar-count-driven (effective_bars). Energy is depth + duration + volume drying combined into a 0-100 score. <strong className="text-amber-400">A short BREAKOUT READY coil with low volume drying might score MODERATE energy. A long COILING coil with deep z-score and dry volume might score HIGH energy.</strong> Section 8 covers energy scoring in full. For now: walls tell you phase, Command Center tells you energy.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Phase 1: BUILDING === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Phase 1: BUILDING</p>
          <h2 className="text-2xl font-extrabold mb-4">The spotting phase &mdash; 1 to 5 effective_bars</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When <code className="text-amber-400 font-mono text-xs">squeeze_confirmed</code> first fires, the box is born and BUILDING begins. Walls are intentionally faint (transparency 55), fill is barely visible (transparency 93). <strong className="text-amber-400">The engine is whispering, not shouting</strong> &mdash; this phase exists to register the squeeze without committing to it visually. Your job during BUILDING is to notice and prepare, not trade.</p>
          <PhaseBuildingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar counter advance from 0 to 5. The box appears at bar 1 and grows rightward as each new bar confirms continued squeeze. Walls and fill stay deliberately subdued throughout. The <code className="text-amber-400 font-mono text-xs">squeeze_phase</code> readout shows BUILDING the entire time. <strong className="text-white">If the squeeze fails before bar 6, the box dies as a BUILDING coil &mdash; visible historical marker, but never advanced to a serious phase.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EXACT STYLING VALUES</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine line 1636-1637: <code className="text-amber-400 font-mono text-xs">sq_line_transp = 55</code> (wall opacity 45%), <code className="text-amber-400 font-mono text-xs">sq_fill_transp = 93</code> (fill opacity 7%). Both are at the <strong className="text-white">faintest end of their range</strong>. The fill is barely tinted &mdash; you have to look closely to see the box at all on a busy chart. This visual choice is deliberate: BUILDING coils are common, and most don&apos;t advance to a tradeable phase. Subdued styling reflects subdued conviction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN BUILDING ADVANCES, WHEN IT DIES</p>
              <p className="text-sm text-gray-400 leading-relaxed">A BUILDING coil advances to COILING if it reaches <code className="text-amber-400 font-mono text-xs">effective_bars &gt; 5</code> &mdash; either by accumulating 6+ raw squeeze bars, OR by hitting a deep enough z-score early to trigger <code className="text-amber-400 font-mono text-xs">depth_bonus</code>. A z-score &gt; 2.5 adds +6 to effective_bars, which means a 1-bar squeeze of severe depth lands in COILING immediately. <strong className="text-white">More commonly, BUILDING dies</strong> &mdash; the squeeze breaks before bar 6, the box locks as a brief amber smudge, and you move on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER READOUT  ·  Volatility &amp; Squeeze row</p>
              <p className="text-sm text-gray-400 leading-relaxed">Toggle the Volatility &amp; Squeeze input ON to see the BUILDING state in the Command Center. During BUILDING, the row reads: <strong className="text-white">{'{compression}%'} BUILDING</strong> &mdash; e.g. &ldquo;42% BUILDING&rdquo;. The compression percentage is <code className="text-amber-400 font-mono text-xs">(1 - squeeze_ratio) × 100</code>. Higher number means tighter compression. <strong className="text-white">A 10% BUILDING is barely a squeeze; a 60% BUILDING is fierce</strong> &mdash; it&apos;s likely heading to COILING fast.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">YOUR ACTION DURING BUILDING</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">Notice. Do not trade.</strong> The faint walls signal the engine&apos;s low confidence in the eventual breakout. Use this phase to: identify the asset and timeframe involved; check the regime row (BUILDING coils in TREND have different implications than in RANGE); take note of the compression depth. <strong className="text-white">If you trade BUILDING coils, you trade the highest-frequency, lowest-edge subset of the entire coil universe.</strong> Most operators who try this end up frustrated and revert to skipping until COILING at minimum.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE BUILDING-PHASE TRAP</p>
            <p className="text-sm text-gray-400 leading-relaxed">A common operator-error: seeing a BUILDING coil with deep compression (60%+) and assuming it will obviously advance. Sometimes it does. Often the squeeze breaks at bar 4 or 5 and the box dies. <strong className="text-white">Compression depth is a separate read from phase advancement</strong> &mdash; deep BUILDING coils have higher conditional probability of advancing, but unconditional probability of advancement still hovers around 50%. Wait for COILING to confirm.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Phase 2: COILING === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Phase 2: COILING</p>
          <h2 className="text-2xl font-extrabold mb-4">The preparation phase &mdash; 6 to 12 effective_bars</h2>
          <p className="text-gray-400 leading-relaxed mb-6">At bar 6, the visual transitions: walls step from faint (transp 55) to medium (transp 30), fill from barely visible (93) to lightly tinted (88). <strong className="text-amber-400">This step is sharp, not gradual</strong> &mdash; it happens at the exact bar where <code className="text-amber-400 font-mono text-xs">effective_bars</code> crosses 5. From this point, you&apos;re looking at a coil with real conviction. Time to start preparing.</p>
          <PhaseCoilingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar counter advance from 4 to 12. At bar 6, the wall opacity makes a visible step up &mdash; a brief flash highlights the moment. From bar 6 onward, the coil is in COILING phase. The <code className="text-amber-400 font-mono text-xs">squeeze_phase</code> readout flips from BUILDING to COILING. <strong className="text-white">By bar 12, the coil has been compressed for nearly half a normal trading day worth of bars on intraday TFs &mdash; this is meaningful.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EXACT STYLING VALUES</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine line 1636-1637: <code className="text-amber-400 font-mono text-xs">sq_line_transp = 30</code> (wall opacity 70%), <code className="text-amber-400 font-mono text-xs">sq_fill_transp = 88</code> (fill opacity 12%). The wall opacity jump from 45% to 70% is the largest single-step change in the styling progression. <strong className="text-white">Walls become readable from across the chart</strong> &mdash; you can see a COILING box without zooming in or paying close attention. The fill tints slightly amber, distinguishable from the chart background.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BAR-6 STEP TRANSITION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine&apos;s <code className="text-amber-400 font-mono text-xs">squeeze_phase</code> ternary checks <code className="text-amber-400 font-mono text-xs">effective_bars &gt; 5</code>. Until bar 5, BUILDING. At bar 6, COILING. <strong className="text-white">This is a step function, not a gradient</strong> &mdash; one bar earlier the walls were faint; this bar the walls are bright. Operators who watch the chart in real time can literally see the moment a coil promotes itself from BUILDING to COILING. That moment is your &ldquo;start preparing&rdquo; cue.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER READOUT  ·  COILING phase</p>
              <p className="text-sm text-gray-400 leading-relaxed">Volatility &amp; Squeeze row reads: <strong className="text-white">{'{compression}%'} COILING</strong> &mdash; e.g. &ldquo;58% COILING&rdquo;. The label changes from BUILDING to COILING at the same moment the walls step. The compression percentage typically continues to climb as the squeeze deepens &mdash; a COILING that started at 50% might be 70%+ by bar 11. <strong className="text-amber-400">High compression (70%+) during COILING signals an unusually strong setup</strong> &mdash; it suggests the eventual energy score will be high.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">YOUR ACTION DURING COILING</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">Prepare the trade plan.</strong> Not the trade itself &mdash; the plan. Identify where the breakout would have to print to confirm direction. Identify your stop placement (typically just outside the box on the opposite side of the breakout direction). Identify your first target (1.5R for standard, 2.5R if Double Coil &mdash; covered later). Check the regime &mdash; COILING in TREND favours continuation breakouts; COILING in RANGE could go either way. <strong className="text-white">Prep work done in COILING saves seconds at the fire bar &mdash; seconds that matter.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RISK OF EARLY ENTRY DURING COILING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some operators try to enter during COILING based on a directional read (Pulse direction, recent structure bias) anticipating where the coil will break. <strong className="text-white">This is statistically a losing strategy</strong> &mdash; the engine&apos;s own breakout direction is determined by the candle that breaks the squeeze (close &gt; open or not), and that candle hasn&apos;t printed yet. Entries inside the coil get whipsawed by the final bars of compression. Wait for the diamond.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">COILING IS WHERE PATIENCE PAYS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Most operators who lose on coils do so by entering during COILING based on directional bias. Patience during COILING means: <strong className="text-white">stand by your prep, wait for BREAKOUT READY, wait for the diamond, then trade.</strong> The 2-7 bars of waiting between COILING-onset and breakout-fire feel long &mdash; they&apos;re the discipline that separates Coil Operators from coil-watchers.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Phase 3: BREAKOUT READY === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Phase 3: BREAKOUT READY</p>
          <h2 className="text-2xl font-extrabold mb-4">The strike phase &mdash; 13+ effective_bars</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When <code className="text-amber-400 font-mono text-xs">effective_bars</code> crosses 12, the coil enters its final phase. Walls step from medium to nearly solid (transp 30 → 10, opacity 70% → 90%). Fill saturates (transp 88 → 80). On a busy chart, a BREAKOUT READY coil is impossible to miss &mdash; <strong className="text-amber-400">the engine is no longer whispering or speaking, it&apos;s shouting</strong>. From this point, every bar is a potential fire bar.</p>
          <PhaseReadyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar counter advance from 11 to 16, then the breakout fires. The walls glow with an amber-to-orange pulse during BREAKOUT READY. The transition from COILING at bar 12 to BREAKOUT READY at bar 13 is sharp &mdash; once again, a step, not a gradient. <strong className="text-white">When the squeeze releases, a teal diamond drops at the firing bar and the box locks immediately.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EXACT STYLING VALUES</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine line 1636-1637: <code className="text-amber-400 font-mono text-xs">sq_line_transp = 10</code> (wall opacity 90%), <code className="text-amber-400 font-mono text-xs">sq_fill_transp = 80</code> (fill opacity 20%). Walls are nearly solid amber. Fill is a clearly tinted amber wash. <strong className="text-white">A BREAKOUT READY coil is the most visually loud element on a CIPHER chart</strong> &mdash; even more visible than active signals or recent structure breaks. Operators who toggle Cipher Coil ON for the first time often comment on how prominent the BREAKOUT READY phase is.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DEPTH BONUS  ·  fast-track to READY</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-amber-400 font-mono text-xs">depth_bonus</code> can fast-track a coil to BREAKOUT READY without 13 raw squeeze bars. The Pine: <code className="text-white font-mono text-xs">depth_bonus = sq_zscore &gt; 2.5 ? 6 : sq_zscore &gt; 2.0 ? 3 : 0</code>. A z-score above 2.5 adds +6 to effective_bars; above 2.0 adds +3. <strong className="text-white">A coil with z-score 2.7 reaches BREAKOUT READY at raw bar 7</strong> (7 + 6 = 13). Severe compressions promote faster than shallow long ones &mdash; the styling reflects that physics correctly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER READOUT  ·  BREAKOUT READY phase</p>
              <p className="text-sm text-gray-400 leading-relaxed">Volatility &amp; Squeeze row reads: <strong className="text-white">{'{compression}%'} BREAKOUT READY</strong> &mdash; e.g. &ldquo;82% BREAKOUT READY&rdquo;. The label change from COILING to BREAKOUT READY happens at bar 13. <strong className="text-amber-400">A BREAKOUT READY at 80%+ compression is a high-energy setup</strong> &mdash; the longer it stays in this phase without firing, the more energy accumulates, the more decisive the eventual release.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">YOUR ACTION DURING BREAKOUT READY</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-amber-400">TRIGGER ARMED.</strong> Orders staged based on the prep done in COILING. Watch every new bar for the firing condition (<code className="text-amber-400 font-mono text-xs">squeeze_confirmed</code> flipping back to false). When the diamond drops, click. <strong className="text-white">Pre-staged stop and target orders</strong> mean you can fire instantly without composing the trade in the moment. The bar that fires is your entry; the next 5 bars are your runner-vs-dud window (covered in Section 12).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EXTENDED BREAKOUT READY  ·  &ldquo;super-loaded&rdquo; coils</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some coils sit in BREAKOUT READY for many bars before firing &mdash; 5, 10, even 15+ bars past the bar-13 threshold. <strong className="text-white">These are not failed coils &mdash; they are SUPER-LOADED.</strong> The energy score continues climbing the entire time (duration component adds 2 per bar, capped at 35). When a super-loaded coil finally fires, the energy is at or near EXTREME. The trade-management implication: <strong className="text-amber-400">be patient with extended BREAKOUT READY coils &mdash; the longer they hold, the bigger the eventual move</strong>.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE FIRE-BAR DECISION</p>
            <p className="text-sm text-gray-400 leading-relaxed">The bar that breaks the squeeze is the candle that determines direction. <code className="text-white font-mono text-xs">close &gt; open = bull diamond + bull breakout</code>; otherwise bear. <strong className="text-white">You don&apos;t pick the direction &mdash; the engine picks it from the firing candle.</strong> Your job is to recognise the diamond, confirm the playbook (covered in S14), and fire your pre-staged orders. Hesitation here costs the entry; second-guessing here costs the trade. Trust the diamond.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Energy Score === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Energy Score</p>
          <h2 className="text-2xl font-extrabold mb-4">The 0-100 quality dial</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Phase tells you how mature the coil is. Energy tells you how much explosive potential is stored. They&apos;re different reads. The energy score is computed continuously during the squeeze from three additive components: <strong className="text-white">depth</strong> (z-score), <strong className="text-white">duration</strong> (bar count), and <strong className="text-white">volume drying</strong> (vol_ratio decline). The total is capped at 100. Higher = more potential. <strong className="text-amber-400">The energy at the moment of release predicts the size of the resulting move.</strong></p>
          <EnergyScoreAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four scenarios cycle. LOW (25) is a brief shallow squeeze. MODERATE (45) is a typical setup. HIGH (73) is a strong setup. <strong className="text-amber-400">EXTREME (96)</strong> is the rare gold-tier coil &mdash; deep, long, with volume drying. Each component bar fills as the energy accumulates, and the total bar shows where the score sits relative to the labels (MINIMAL / LOW / MODERATE / HIGH / EXTREME).</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DEPTH SCORE  ·  z-score × 15, capped at 40</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine: <code className="text-white font-mono text-xs">sq_depth_score = math.min(40, sq_zscore × 15)</code>. A z-score of 1.5 (the trigger threshold) gives 22 points. A z-score of 2.5 gives 37 points (near the cap). A z-score of 2.7+ saturates at 40. <strong className="text-white">Depth is the single largest component &mdash; up to 40 of 100.</strong> It rewards unusual compression most heavily. The same value drives the depth_bonus that fast-tracks phase advancement &mdash; deep squeezes are doubly rewarded: faster phase progression AND higher energy score.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DURATION SCORE  ·  bars × 2, capped at 35</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine: <code className="text-white font-mono text-xs">sq_duration_score = math.min(35, squeeze_bars × 2)</code>. Each raw squeeze bar adds 2 points, capped at 35 (saturates at 17.5 bars, ~17 bars). <strong className="text-white">Long squeezes accumulate energy.</strong> A 20-bar squeeze gets the full 35 duration points. Shorter squeezes get proportionally less. Combined with depth, this means a long-shallow squeeze (low depth, max duration) and a short-deep squeeze (max depth, modest duration) can both reach moderate energy &mdash; via different paths.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLUME DRY SCORE  ·  tiered by vol_ratio</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine: <code className="text-amber-400 font-mono text-xs">sq_vol_dry = vol_ratio &lt; 0.7 ? 25 : vol_ratio &lt; 0.9 ? 15 : vol_ratio &lt; 1.0 ? 5 : 0</code>. Three tiers based on volume during the squeeze. <strong className="text-white">Volume below 70% of average = 25 points (max). Below 90% = 15. Below 100% = 5. Above 100% = 0.</strong> Volume drying during compression is the &ldquo;spring loading&rdquo; signal &mdash; institutional flow withdrawing while retail noise compresses. The lowest tier (vol &gt; 1.0) earns no volume-dry points; energy in those coils comes purely from depth and duration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ENERGY LABELS  ·  the 5-tier readout</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine: <code className="text-white font-mono text-xs">squeeze_energy_label = energy &gt; 80 ? &quot;EXTREME&quot; : &gt; 60 ? &quot;HIGH&quot; : &gt; 40 ? &quot;MODERATE&quot; : &gt; 20 ? &quot;LOW&quot; : &quot;MINIMAL&quot;</code>. Five labels. <strong className="text-white">EXTREME (&gt;80) requires near-max on all three components</strong> &mdash; deep squeeze, long duration, dry volume. These are rare; you might see 2-3 EXTREME coils per month on a primary asset. <strong className="text-amber-400">HIGH (&gt;60) is the practical &ldquo;take it&rdquo; threshold</strong> &mdash; strong probability of a meaningful breakout. MODERATE and below are skip candidates absent other strong context.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ENERGY PERSISTS AT BREAKOUT  ·  shown in diamond tooltip</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the squeeze fires, Pine captures the final energy score in <code className="text-amber-400 font-mono text-xs">last_squeeze_energy</code>. The breakout diamond&apos;s tooltip displays it: &ldquo;Energy: HIGH (73%)&rdquo;. This tells you what the engine knew about the setup at the moment of release. <strong className="text-white">Diamond tooltips are your primary post-fire analysis tool</strong> &mdash; energy + duration + depth + volume + momentum + trend alignment all displayed in one hover.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PHASE × ENERGY = TRADE QUALITY</p>
            <p className="text-sm text-gray-400 leading-relaxed">A BREAKOUT READY coil with HIGH energy is a different trade than a BREAKOUT READY coil with LOW energy. <strong className="text-white">Phase tells you the coil is ready to fire; energy tells you how big the move could be.</strong> Default trade-management: pair phase with energy to choose target. BREAKOUT READY + HIGH energy = full target. BREAKOUT READY + MODERATE = scale out earlier. BREAKOUT READY + LOW = take only with strong regime alignment, otherwise skip.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Pre-Squeeze Warning === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Pre-Squeeze Warning</p>
          <h2 className="text-2xl font-extrabold mb-4">The earliest possible signal</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER doesn&apos;t just react to confirmed squeezes &mdash; it fires a warning <strong className="text-amber-400">before</strong> the z-score officially triggers. When ATR ratio has been declining for 5 or more consecutive bars and is below 0.85 of the slow ATR, the engine sets <code className="text-amber-400 font-mono text-xs">pre_squeeze_warning = true</code>. This fires earlier than <code className="text-amber-400 font-mono text-xs">squeeze_confirmed</code> &mdash; sometimes 2-5 bars earlier &mdash; giving operators an unusually early heads-up that compression is forming.</p>
          <PreSqueezeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch <code className="text-amber-400 font-mono text-xs">vol_ratio_atr</code> decline through the chart. The amber line crosses 0.85 (the warning threshold). The decline_bars counter advances each bar that satisfies both declining AND below-0.85. <strong className="text-white">At decline_bars = 5, the WARNING state activates &mdash; before any Coil Box has appeared.</strong> If volatility continues to compress, the squeeze will eventually be confirmed and a Coil Box will be born.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRIGGER MATH</p>
              <p className="text-sm text-gray-400 leading-relaxed">From Pine line 1771-1778: <code className="text-white font-mono text-xs">vol_declining = vol_ratio_atr &lt; vol_ratio_5ago and vol_ratio_atr &lt; 0.85</code>. Two conditions: ratio is lower than 5 bars ago AND ratio is below 0.85. <code className="text-amber-400 font-mono text-xs">vol_decline_bars</code> increments each bar both conditions hold, resets to 0 when either fails. <code className="text-amber-400 font-mono text-xs">pre_squeeze_warning = vol_decline_bars &gt;= 5 AND not squeeze_confirmed</code>. <strong className="text-white">Five consecutive declining bars below the threshold, with no confirmed squeeze yet</strong> &mdash; that&apos;s the warning state.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 0.85, NOT THE Z-SCORE THRESHOLD</p>
              <p className="text-sm text-gray-400 leading-relaxed">The squeeze itself triggers on z-score &gt; 1.5 (asset-adaptive). The warning uses a flat 0.85 ratio threshold. <strong className="text-white">This is intentionally simpler and looser</strong> &mdash; the warning is supposed to fire on early-stage compression that hasn&apos;t yet hit the official statistical threshold. The flat 0.85 catches compression earlier and across all asset classes uniformly. The z-score-adaptive math kicks in only for the official squeeze trigger.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE WARNING IS NOT A TRADE SIGNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pre-squeeze warning is an <strong className="text-amber-400">attention-direction signal</strong>, not a trade trigger. It tells you: &ldquo;compression is forming on this asset/TF, watch closely for the next 5-10 bars.&rdquo; Many warnings never advance to confirmed squeezes &mdash; volatility re-expands and the warning resets. <strong className="text-white">Warning → confirmed → BUILDING → COILING → READY → FIRE</strong> is the full pipeline; the warning is step 1 of 6.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">USING THE WARNING IN PRACTICE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who run multi-asset watchlists use pre-squeeze warning as a <strong className="text-white">prioritisation signal</strong>. With 8 assets on the watchlist and limited attention, the warning tells you which assets to focus on. An asset with active warning is &ldquo;likely to produce something soon.&rdquo; An asset with no warning is &ldquo;flat.&rdquo; <strong className="text-amber-400">Front-load attention on warnings, save the deep reads for confirmed coils.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HOW IT SURFACES IN THE COMMAND CENTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The pre-squeeze warning is exposed via the Volatility &amp; Squeeze row when no squeeze is yet confirmed but the warning conditions are met. The label changes from NORMAL or CONTRACTING to a warning indicator. The Header row guidance can also reflect it via &ldquo;COMPRESSION FORMING&rdquo; or similar pre-coil tags &mdash; depending on whether other layers (Ribbon coil, BB compression) also flag concurrent compression.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE WARNING-TO-FIRE TIMELINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">From warning to fire is a multi-bar journey. Warning appears at decline_bars = 5. Z-score eventually crosses 1.5 (squeeze fires, but not yet confirmed). Three more bars confirm the squeeze. Coil Box born. Bars accumulate toward COILING (bar 6) and BREAKOUT READY (bar 13). Eventually the squeeze releases and the diamond drops. <strong className="text-white">Total path: typically 15-30 bars from first warning to breakout fire.</strong> Operators who catch the warning early have ample time to prepare; operators who wait for BREAKOUT READY have minimal lead time.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Breakout Diamond === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Breakout Diamond</p>
          <h2 className="text-2xl font-extrabold mb-4">◆  the fire-bar marker</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When a squeeze releases, the engine drops a diamond on the chart at the firing bar. <strong className="text-amber-400">Direction is determined by one bar&apos;s candle</strong> &mdash; <code className="text-amber-400 font-mono text-xs">close &gt; open</code> = bull diamond (teal, below the low); otherwise bear (magenta, above the high). The diamond also carries a rich tooltip that summarises the entire setup at the moment of release.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DIAMOND DIRECTION  ·  one rule, one bar</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine line 1712-1713: <code className="text-white font-mono text-xs">breakout_bull = squeeze_fire and close &gt; open</code>; <code className="text-white font-mono text-xs">breakout_bear = squeeze_fire and close &lt;= open</code>. The candle that breaks the squeeze decides direction. <strong className="text-white">A green candle that breaks the squeeze fires a bull diamond regardless of where price went</strong> &mdash; the candle&apos;s open-to-close direction is the trigger, not where it ranges. This is intentionally simple to avoid second-guessing the engine&apos;s call.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIAMOND PLACEMENT  ·  below low or above high</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bull diamond: drops below <code className="text-amber-400 font-mono text-xs">low - atr × 0.3</code> &mdash; the diamond sits just under the firing candle&apos;s wick. Bear diamond: above <code className="text-amber-400 font-mono text-xs">high + atr × 0.3</code> &mdash; just above. The 0.3 ATR offset keeps the diamond visible without crowding the candle. <strong className="text-white">Direction-by-position is a redundant signal</strong> &mdash; the colour also signals direction (teal vs magenta) so you have two readable cues at a glance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TOOLTIP  ·  six fields</p>
              <p className="text-sm text-gray-400 leading-relaxed">Hover over the diamond to see: <strong className="text-white">Duration</strong> (squeeze_bars at fire), <strong className="text-white">Energy</strong> (label + percentage), <strong className="text-white">Depth</strong> (z-score in σ), <strong className="text-white">Volume</strong> (vol_ratio at fire), <strong className="text-white">Momentum</strong> (health_smooth %), <strong className="text-white">Trend alignment</strong> (with-trend ✓ or counter-trend ⚠). Optionally: <strong className="text-amber-400">★ DOUBLE COIL</strong> if Ribbon and BB/KC were both compressed at fire. The tooltip is a complete post-fire diagnostic in one hover.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING THE TOOLTIP  ·  what to value</p>
              <p className="text-sm text-gray-400 leading-relaxed">Energy ≥ HIGH = strong setup. Duration &gt; 12 bars = mature coil. Depth &gt; 2σ = serious compression. Volume &gt; 1.0× = institutional confirmation. Momentum &gt; 50% = real follow-through likely. <strong className="text-white">Trend-alignment ✓</strong> = the engine confirms the breakout direction agrees with overall trend. <strong className="text-amber-400">A diamond with all six green is the textbook take-with-confidence trade</strong> &mdash; rare but the operator&apos;s gold. A diamond with multiple amber/red flags is a tactical skip.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIAMOND IS DECISIVE, NOT PROBABILISTIC</p>
              <p className="text-sm text-gray-400 leading-relaxed">Once the diamond drops, the box LOCKS &mdash; it never grows again, never re-opens. Pine pushes it to <code className="text-amber-400 font-mono text-xs">coil_history</code> and the active reference clears. <strong className="text-white">The breakout direction is committed</strong> &mdash; if price reverses an hour later, that&apos;s a new market move, not a redrawn diamond. The diamond is the engine&apos;s decisive read on direction at the firing bar; later moves get evaluated as separate signals (PX, TS, or further coils).</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">FAKE-OUT RISK BY THE NUMBERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Not all diamonds produce real moves. Roughly <strong className="text-white">~40% of fired diamonds are duds or scratches</strong> over the long run. The remaining 60% are the edge. The post-fire quality scorer (next section) and the runner-vs-dud tracker (section 12) exist to identify which 60% you&apos;re looking at &mdash; <strong className="text-amber-400">at the fire bar, before you commit position size</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Breakout Quality === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Breakout Quality</p>
          <h2 className="text-2xl font-extrabold mb-4">CONFIRMED · PROBABLE · SUSPECT</h2>
          <p className="text-gray-400 leading-relaxed mb-6">At the fire bar, the engine runs a 3-factor quality check on the breakout. <strong className="text-white">Has momentum?</strong> (health_smooth &gt; 50). <strong className="text-white">Has volume?</strong> (vol_ratio &gt; 1.0). <strong className="text-white">Trend-aligned?</strong> (ribbon_dir matches breakout direction). Score 3 = CONFIRMED, 2 = PROBABLE, ≤1 = SUSPECT. <strong className="text-amber-400">This score is computed on the fire bar itself</strong> &mdash; you can read the quality before committing position size.</p>
          <BreakoutQualityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three scenarios cycle. CONFIRMED has all three factors ✓ &mdash; momentum, volume, trend alignment all in agreement. PROBABLE has two of three (typically momentum + volume but counter-trend, or trend-aligned but light volume). SUSPECT has just one of three. <strong className="text-white">The action under each label is the operator&apos;s playbook.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 1  ·  MOMENTUM (health_smooth &gt; 50)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-amber-400 font-mono text-xs">health_smooth</code> is the engine&apos;s composite momentum-health score. Above 50% means momentum is at-or-above neutral &mdash; the price action has body conviction. Below 50% means momentum is fading or absent. <strong className="text-white">A breakout with sub-50% momentum is firing on price extension without underlying strength</strong> &mdash; the most common failure mode for fake breakouts. Always read this factor.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 2  ·  VOLUME (vol_ratio &gt; 1.0)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-amber-400 font-mono text-xs">vol_ratio = current_volume / avg_volume</code>. Above 1.0 means current bar is above average volume &mdash; institutional flow confirming the move. Below 1.0 means low-volume breakout &mdash; retail-driven or air-gap move. <strong className="text-white">Low-volume breakouts have notoriously low follow-through rates</strong> &mdash; institutions need to see their own footprint to commit, and the absence of that footprint usually means the breakout will be retraced quickly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FACTOR 3  ·  TREND-ALIGNED (ribbon_dir matches)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Cipher Ribbon&apos;s direction at the fire bar must match the breakout direction. Bull breakout + bull ribbon = aligned ✓. Bull breakout + bear ribbon = counter-trend ⚠. <strong className="text-white">Counter-trend breakouts CAN work</strong> &mdash; they&apos;re V-bottoms, regime changes, or genuine reversals &mdash; but they have lower base-rate follow-through than trend-aligned breakouts. Counter-trend breakouts deserve extra scrutiny on factors 1 and 2 to compensate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE 3  ·  CONFIRMED  ·  full size</p>
              <p className="text-sm text-gray-400 leading-relaxed">All three factors pass. Momentum, volume, trend alignment all confirm the breakout. <strong className="text-amber-400">This is the take-with-confidence tier.</strong> Standard playbook applies: full position size based on your risk frame, target 1.5R+ depending on energy score, stop just outside the box on the opposite side. Most CONFIRMED breakouts land in the runner-vs-dud RUNNER tier within 5 bars (next section).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE 2  ·  PROBABLE  ·  half size</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two of three factors pass. The breakout has real signals but one component is missing. <strong className="text-white">Half size, tighter target.</strong> Specifically: take 50% of your standard position, target 1R instead of 1.5R+, exit at first sign of stalling. PROBABLE breakouts have meaningful win-rate but lower expected R per trade &mdash; right-sizing protects against the higher variance.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE ≤1  ·  SUSPECT  ·  skip or scratch</p>
              <p className="text-sm text-gray-400 leading-relaxed">One or zero factors pass. The breakout is firing on price extension without underlying strength. <strong className="text-amber-400">Default action: skip.</strong> If you&apos;re already positioned (e.g. you traded the BREAKOUT READY anticipation), exit at break-even or scratch the trade. SUSPECT breakouts have negative expectancy &mdash; trading them is paying the engine&apos;s false-positive tax. The discipline is to recognise the score and walk away.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE QUALITY SCORE LIVES IN A VARIABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Pine stores the result in <code className="text-amber-400 font-mono text-xs">last_bo_quality</code> and persists it across bars. <strong className="text-white">You can reference the last breakout&apos;s quality without scrolling back to the diamond</strong> &mdash; the value persists in the engine state. Some operators alert on quality transitions (e.g. notify when last breakout was SUSPECT) to skip subsequent setups during periods of unreliable price action.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Runner vs Dud === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Runner vs Dud</p>
          <h2 className="text-2xl font-extrabold mb-4">The 5-bar post-breakout tracker</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After the diamond drops, the engine tracks how far price travels (in ATR units, in the breakout direction) over the next 5 bars. At bar 5, a final verdict locks: <strong className="text-amber-400">RUNNER ✓</strong> (&gt;1.0 ATR), <strong className="text-amber-400">NORMAL</strong> (0.3-1.0 ATR), or <strong className="text-amber-400">DUD ✗</strong> (&lt;0.3 ATR). This is the engine&apos;s honesty check &mdash; it tells you whether the breakout was real, regardless of how confident the quality score was.</p>
          <RunnerDudAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three scenarios. RUNNER hits +1.4 ATR by bar 5 &mdash; clear continuation. NORMAL plateaus around +0.6 ATR &mdash; modest follow-through, scratch territory. DUD reverses into negative territory by bar 5 &mdash; fake breakout, exit fast. <strong className="text-white">The status pill at each bar shows the live read</strong>: STALLED, MOVING, RUNNING.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TRACKING MATH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine line 1755-1762: <code className="text-white font-mono text-xs">bo_travel = bo_track_dir == 1 ? (close - bo_track_price) / atr : (bo_track_price - close) / atr</code>. ATR-normalised distance from the fire-bar close, in the direction of the breakout. Positive = with the breakout, negative = against. <strong className="text-white">Sign matters</strong> &mdash; a -0.5 ATR travel on a bull breakout means price went DOWN by 0.5 ATR after the bull diamond. That&apos;s a strong DUD signal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LIVE STATUS PHRASES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Each bar 1-5 gets a live status: <strong className="text-white">STALLED</strong> (travel &lt; 0), <strong className="text-white">SLOW</strong> (0 &lt; travel &lt; 0.5 ATR), <strong className="text-white">MOVING</strong> (0.5 &lt; travel &lt; 1.0), <strong className="text-white">RUNNING X.X ATR</strong> (travel &gt; 1.0, with the value). <strong className="text-amber-400">RUNNING in the early bars (1-2) is the strongest possible read</strong> &mdash; price is racing in the breakout direction immediately, almost always indicates a runner. STALLED in the early bars almost always indicates a dud.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FINAL VERDICT AT BAR 5</p>
              <p className="text-sm text-gray-400 leading-relaxed">After 5 bars, the engine locks the verdict. <strong className="text-white">RUNNER ✓</strong>: travel &gt; 1.0 ATR &mdash; real breakout, continue riding. <strong className="text-white">NORMAL</strong>: travel 0.3-1.0 ATR &mdash; modest follow-through, manage trade carefully. <strong className="text-white">DUD ✗</strong>: travel &lt; 0.3 ATR &mdash; fake breakout, exit immediately and expect reversal in opposite direction. <strong className="text-amber-400">Bar 5 is the &ldquo;commit or fold&rdquo; decision point</strong> &mdash; trades held past bar 5 of a DUD verdict have negative expected value.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">USING THE TRACKER FOR TRADE MANAGEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you entered at the diamond, the 5-bar tracker is your trade-management decision tree. <strong className="text-white">RUNNING by bar 2:</strong> trail tighter behind price, target full energy-score-based extension. <strong className="text-white">SLOW or MOVING by bar 3:</strong> consider taking 50% off, hold remainder with break-even stop. <strong className="text-white">STALLED at bar 3:</strong> exit half. <strong className="text-white">STALLED at bar 5:</strong> exit fully &mdash; verdict will be DUD, the next move is reversal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">QUALITY SCORE PREDICTS RUNNER RATE</p>
              <p className="text-sm text-gray-400 leading-relaxed">In aggregate: CONFIRMED quality breakouts produce RUNNER verdicts ~75% of the time. PROBABLE quality produces RUNNER ~50%. SUSPECT quality produces RUNNER ~25% &mdash; and those tend to be reversed within minutes anyway. <strong className="text-amber-400">Quality at the fire bar is your best predictor of the 5-bar verdict</strong> &mdash; which is why CONFIRMED is the take-with-confidence tier.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE TRACKER IS A SAFETY NET</p>
            <p className="text-sm text-gray-400 leading-relaxed">Even if you misread quality at the fire bar &mdash; rare but possible &mdash; the 5-bar tracker catches it. Bar 1 STALLED, bar 2 STALLED, bar 3 STALLED is a near-certain DUD; the engine is screaming exit. <strong className="text-white">Always watch the first 3 bars after a diamond</strong>. If they say STALLED, the trade is already wrong, regardless of how clean the setup looked at fire. Honour the engine&apos;s honesty check.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Double Coil === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Double Coil ★</p>
          <h2 className="text-2xl font-extrabold mb-4">The highest-energy state CIPHER recognises</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Sometimes the BB/KC squeeze AND the Cipher Ribbon both compress at the same time. When that happens, <code className="text-amber-400 font-mono text-xs">rs_double_coil</code> fires &mdash; the engine&apos;s loudest possible compression signal. The breakout from a Double Coil is statistically the highest-edge breakout pattern in the entire CIPHER suite. <strong className="text-amber-400">★ marks these on the diamond tooltip</strong>, and the trading playbook adjusts.</p>
          <DoubleCoilAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two compression layers stack. Top panel: Cipher Ribbon coiling &mdash; the multiple ribbon lines converge as the trend engine runs out of conviction. Bottom panel: BB shrinking inside KC &mdash; the volatility engine compressing. When both are active simultaneously, <strong className="text-amber-400">the ★ marker pulses</strong> and the &ldquo;DOUBLE COIL&rdquo; label appears between the panels.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE TRIGGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pine line 1595: <code className="text-white font-mono text-xs">rs_double_coil = rs_confirmed AND squeeze_confirmed</code>. <strong className="text-white">Both conditions must be true at the same bar.</strong> <code className="text-amber-400 font-mono text-xs">rs_confirmed</code> is the Ribbon Stack confirmation (the Ribbon&apos;s own coil-detection logic). <code className="text-amber-400 font-mono text-xs">squeeze_confirmed</code> is the BB/KC squeeze. Either alone is meaningful; both together is rare and worth seeing.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY DOUBLE COIL HAS HIGHER EDGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">BB/KC squeeze captures volatility compression. Ribbon coil captures trend-engine flatness (no directional conviction). <strong className="text-white">Together they encode &ldquo;volatility AND directional momentum are both at zero.&rdquo;</strong> When both spring back, both engines&apos; energy releases simultaneously &mdash; volatility expansion + new directional conviction. The combined release tends to be more decisive and have stronger follow-through than either layer alone.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VISUAL CUES BEFORE FIRE</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you have both Cipher Coil AND Cipher Ribbon enabled, you see Double Coil forming. The Ribbon shows <strong className="text-white">DIVERGING → CURVING → COILED → DOUBLE COIL</strong> as its priority cascade in the Ribbon Command Center row. When the row reads DOUBLE COIL while a Coil Box is also visible at COILING+, you&apos;re watching the highest-edge setup CIPHER produces. <strong className="text-amber-400">Operators who run the Sniper preset get this configuration by default.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ★ ON THE DIAMOND TOOLTIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a Double Coil fires, the breakout diamond&apos;s tooltip includes a star line: <strong className="text-white">★ DOUBLE COIL — Ribbon + BB/KC both compressed</strong>. This is captured in <code className="text-amber-400 font-mono text-xs">last_squeeze_double_coil</code> at the moment of release. Hovering the diamond is your &ldquo;was this Double Coil?&rdquo; check &mdash; if the star is there, adjust the playbook accordingly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DOUBLE COIL TRADING ADJUSTMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Double Coil setups deserve different sizing and target rules. <strong className="text-white">Up-size by 25-50%</strong> over your standard coil position. <strong className="text-white">Target 2.5R</strong> instead of standard 1.5R &mdash; the move tends to extend further. <strong className="text-white">Trail wider</strong> after bar 3 to give the runner room. The base rate of RUNNER verdicts on Double Coil breakouts is materially higher than on single-layer breakouts &mdash; trade-management can be more aggressive.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">FREQUENCY  ·  RARE BY DESIGN</p>
            <p className="text-sm text-gray-400 leading-relaxed">Double Coils are uncommon &mdash; you might see 2-5 per month on a typical liquid asset. Most coils are single-layer. <strong className="text-white">Don&apos;t force Double Coil reads onto setups that don&apos;t have them.</strong> When you see one, treat it as the gold setup it is. When you don&apos;t, trade single-layer coils on their own merits using the quality-score and runner-vs-dud framework. The framework works for both; Double Coil is just the high-tier subset.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Trading Playbooks === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Trading the Coil</p>
          <h2 className="text-2xl font-extrabold mb-4">Three playbooks for three setup tiers</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All coil breakouts trade as Long or Short. But not all coils are equal. The setup quality &mdash; phase at fire, energy score, breakout quality, single vs Double Coil &mdash; determines sizing, targets, and stops. Three named playbooks cover the high-edge variants.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 1  ·  STANDARD COIL BREAKOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">The default play. BREAKOUT READY phase, MODERATE-to-HIGH energy, CONFIRMED or PROBABLE quality, single-layer coil. <strong className="text-white">Entry:</strong> at diamond close. <strong className="text-white">Stop:</strong> just outside the box on the opposite side of breakout direction (e.g. just below box bottom for bull breakout). <strong className="text-white">Target:</strong> 1.5R, then trail with Pulse direction. <strong className="text-white">Sizing:</strong> standard. This playbook covers ~70% of tradeable coil breakouts.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 2  ·  HIGH-ENERGY COIL  ·  EXTREME score</p>
              <p className="text-sm text-gray-400 leading-relaxed">Energy score &gt; 80 (EXTREME). Long duration, deep z-score, dry volume all aligned. Rare &mdash; 1-2 per month per asset typically. <strong className="text-white">Entry:</strong> at diamond close. <strong className="text-white">Stop:</strong> just outside the box (same as Playbook 1, the box itself is the structural reference). <strong className="text-white">Target:</strong> 2.5R, with trailing &mdash; the move tends to be larger. <strong className="text-white">Sizing:</strong> up-sized 25-50% if overall regime supports the breakout direction. Watch for RUNNER classification within the first 2 bars to confirm.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 3  ·  DOUBLE COIL BREAKOUT  ·  ★</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tooltip shows <strong className="text-white">★ DOUBLE COIL</strong>. Both Ribbon and BB/KC compressed simultaneously, both released. The highest-edge variant. <strong className="text-white">Entry:</strong> at diamond close. <strong className="text-white">Stop:</strong> just outside the box, possibly wider if structure supports. <strong className="text-white">Target:</strong> 2.5R with aggressive trail; some operators hold for 3-4R on Double Coils with EXTREME energy. <strong className="text-white">Sizing:</strong> up-sized confidently. Combine with HTF agreement (Lesson 17) for the ultimate setup.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING ACROSS THE THREE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Standard size on Playbook 1. Up-sized on Playbook 2 if regime supports. Up-sized confidently on Playbook 3 (Double Coil + EXTREME energy is the highest-edge tier). <strong className="text-white">Never down-size on a CONFIRMED quality coil breakout</strong> &mdash; if quality + energy + phase all aligned, the setup is high-conviction; either trade it confidently or skip it entirely. Half-size positions on these are the worst of both worlds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN TO SKIP A COIL ENTIRELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coils that fire during VOLATILE regime, into fresh counter-FVG, with SUSPECT quality, or counter-trend in STRONG TREND &mdash; skip regardless of phase or energy. <strong className="text-white">The three-filter framework from Lesson 13 still applies on top of coil mechanics.</strong> A Double Coil with EXTREME energy in the wrong regime is still wrong-regime; a CONFIRMED quality breakout with bad structure context is still bad-structure. Coil-specific playbooks operate within the broader skip-discipline framework, not above it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">STOPS LIVE OUTSIDE THE BOX  ·  always</p>
            <p className="text-sm text-gray-400 leading-relaxed">For all three playbooks: <strong className="text-white">stops go just outside the locked Coil Box on the opposite side of the breakout direction</strong>. Bull breakout = stop just below box bottom. Bear breakout = stop just above box top. The box itself is the structural invalidation point &mdash; if price re-enters the box and closes through the opposite wall, the breakout has failed. This is universally true across coil breakouts; the variation across playbooks is target and sizing, not stop placement.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every coil-trader falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable mistakes appear when operators first start trading coil breakouts. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  TRADING DURING BUILDING OR EARLY COILING</p>
              <p className="text-sm text-gray-400 leading-relaxed">Spotting a fresh coil and trying to anticipate the breakout direction by entering inside the box. <strong className="text-white">The breakout direction is determined by the bar that breaks the squeeze</strong> &mdash; not by Pulse direction, not by recent structure, not by your bias. Entries inside the coil get whipsawed by the final bars of compression. Wait for the diamond. Always.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  IGNORING THE QUALITY SCORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Diamond drops, you fire instantly without checking quality. The score reads SUSPECT (1/3 factors) but you&apos;re committed. <strong className="text-white">SUSPECT breakouts have negative expectancy</strong> &mdash; trading them is paying a tax. Always hover the diamond, read the quality, then commit size. The 2-3 second pause to check is the highest-leverage micro-decision in coil trading.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  IGNORING THE 5-BAR TRACKER</p>
              <p className="text-sm text-gray-400 leading-relaxed">You entered on a clean diamond. By bar 3 the tracker reads STALLED. You hold because &ldquo;the box was clean.&rdquo; <strong className="text-white">The tracker is the engine&apos;s honesty check &mdash; it sees follow-through that the fire-bar quality couldn&apos;t predict.</strong> STALLED at bar 3 means the verdict will be DUD. Exit. Holding past STALLED bar 3 is fighting the engine&apos;s real-time signal.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  WRONG STOP PLACEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Setting stops at recent swing high/low instead of just outside the box. The box IS the structural reference for a coil breakout &mdash; if price closes back inside and through the opposite wall, the setup has invalidated. <strong className="text-white">Wider structural stops on coils give too much room and produce R:R that doesn&apos;t match the playbook.</strong> Tighter intra-box stops give too little room and stop on noise. The box edge is the right answer.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  TRADING COILS IN VOLATILE REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">A coil fires beautifully &mdash; HIGH energy, CONFIRMED quality, even Double Coil. Regime row says VOLATILE. <strong className="text-white">Skip.</strong> VOLATILE regime breakouts have low follow-through regardless of how clean the coil-mechanics look &mdash; the regime context overwhelms the structural setup. The three-filter framework from Lesson 13 still applies; coil mechanics operate within it, not above it.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  CHASING POST-DIAMOND</p>
              <p className="text-sm text-gray-400 leading-relaxed">You miss the diamond. Price is already 1.5 ATR into the move. You enter chasing at +1.5R-from-fire. <strong className="text-white">The R:R has collapsed</strong> &mdash; you&apos;re paying full stop distance for fractional reward. The original stop was meant for entry-at-diamond; entering 1.5 ATR later means either too-wide stop (bad R:R) or too-tight stop (stops on noise). Skip late entries; wait for the next coil.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Coil Operator Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it. Reference it every time a coil approaches BREAKOUT READY until the rhythm becomes second-nature.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Trigger Math</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">squeeze_ratio</strong> = bb_width / kc_width &middot; below 0.95 + z-score &gt; 1.5σ + 3 consecutive bars = CONFIRMED</p>
                <p>z-score is asset-self-calibrating &mdash; same threshold works on forex and stocks.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 3 Lifecycle Phases</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">BUILDING</strong> 1-5 bars &middot; faint walls (transp 55) &middot; ACTION: notice, do not trade</p>
                <p><strong className="text-white">COILING</strong> 6-12 bars &middot; medium walls (30) &middot; ACTION: prepare the trade plan</p>
                <p><strong className="text-amber-400">BREAKOUT READY</strong> 13+ bars &middot; solid walls (10) &middot; ACTION: trigger armed, watch for fire</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">State Transitions (Pine)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">BIRTH</strong> sq_just_started &middot; box.new() at current bar</p>
                <p><strong className="text-white">GROWTH</strong> squeeze_confirmed &middot; bounds expand, right edge ratchets</p>
                <p><strong className="text-white">DEATH</strong> sq_just_ended &middot; box pushed to coil_history, locks permanently</p>
                <p>10 historical boxes max; oldest pruned at 11.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Energy Score (0-100)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Depth</strong> 0-40 (z-score × 15) &middot; <strong className="text-white">Duration</strong> 0-35 (bars × 2) &middot; <strong className="text-white">Volume Dry</strong> 0-25 (vol_ratio tiers)</p>
                <p>Labels: MINIMAL &lt;20 &middot; LOW &lt;40 &middot; MODERATE &lt;60 &middot; HIGH &lt;80 &middot; EXTREME &gt;80</p>
                <p>HIGH+ is the practical &ldquo;take it&rdquo; threshold.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Pre-Squeeze Warning</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>vol_ratio_atr &lt; 0.85 AND declining for 5+ bars = WARNING (before z-score triggers)</p>
                <p>Use as multi-asset prioritisation signal; not a trade signal.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Diamond Mechanics</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Direction: <strong className="text-white">close &gt; open = bull (teal, below low)</strong>; else bear (magenta, above high)</p>
                <p>Tooltip fields: Duration &middot; Energy &middot; Depth &middot; Volume &middot; Momentum &middot; Trend alignment &middot; ★ Double Coil flag</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Breakout Quality (3-factor)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Momentum (health_smooth &gt; 50) + Volume (vol_ratio &gt; 1.0) + Trend-aligned</p>
                <p><strong className="text-white">3 = CONFIRMED</strong> full size &middot; <strong className="text-white">2 = PROBABLE</strong> half size &middot; <strong className="text-white">≤1 = SUSPECT</strong> skip</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Runner vs Dud (5-bar)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Track ATR-distance traveled in breakout direction over next 5 bars.</p>
                <p><strong className="text-white">RUNNER ✓</strong> &gt;1.0 ATR &middot; <strong className="text-white">NORMAL</strong> 0.3-1.0 &middot; <strong className="text-white">DUD ✗</strong> &lt;0.3</p>
                <p>STALLED at bar 3 → exit; honour the engine&apos;s honesty check.</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Three Playbooks</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Standard Coil</strong> &middot; standard size &middot; 1.5R target &middot; stop just outside box</p>
                <p><strong className="text-white">High-Energy (EXTREME)</strong> &middot; up-size 25-50% &middot; 2.5R target</p>
                <p><strong className="text-white">Double Coil ★</strong> &middot; up-size confidently &middot; 2.5R+ target &middot; trail wider</p>
                <p>Stop placement = just outside box opposite breakout direction (universal).</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Coil Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios spanning phase recognition, quality scoring, runner-vs-dud honesty, Double Coil amplification, and pre-squeeze warning misuse. Pick the right call. Explanations appear after every answer, including the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Coil Operator-grade reads installed. You see the engine\'s honesty checks before you commit position.' : finalScore >= 3 ? 'Solid grasp. Re-read the lifecycle (S03), the energy components (S08), and the runner-vs-dud tracker (S12) before the quiz.' : 'Re-study the three phases (S05-S07), the quality scorer (S11), the runner-vs-dud tracker (S12), and the Double Coil section (S13) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.14: Coil Box Mechanics &mdash; Birth, Growth, Death</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Coil Operator &mdash;</p>
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
