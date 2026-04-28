// app/academy/lesson/cipher-which-signals-to-take/page.tsx
// ATLAS Academy — Lesson 11.13: Which Signals to Take, Which to Skip [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Skip Pile — Patience Is the Edge
// Capstone of the Signal Engine arc (11.10 + 11.11 + 11.12 → 11.13)
// Covers: Engine ≠ Trade, 5-second Command Center scan, Three Filters
//         (Regime Fit, Structure, Conviction Tier), Decision Matrix,
//         Hard Skip Criteria, PX/TS-specific skips, timing/news/sessions,
//         personal skip rules
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
    scenario: 'XAUUSD 15m. Header reads ▲ BULL TREND → TREND INTACT. Trend MODERATE, ADX rising. A clean TS Short fires &mdash; tension was stretched up, now snapping back, rejection candle, velocity shift. All four TS conditions passed. Conviction 3/4 (Strong+).',
    prompt: 'Take or skip?',
    options: [
      { id: 'a', text: 'TAKE &mdash; Strong+ TS, all four conditions confirmed.', correct: false, explain: 'TS fired correctly &mdash; the engine is right. But this is counter-trend TS in a STRONG TREND regime. Per S11 Skip Rule TS 1, snap-backs in strong trends are RETRACEMENTS not reversals; the trend resumes 8-15 bars later and the trade exits at break-even or stops out. Counter-trend TS in STRONG TREND is the single most common loss pattern in TS trading.' },
      { id: 'b', text: 'SKIP &mdash; counter-trend TS in a strong trend regime is a documented loss pattern.', correct: true, explain: '✓ Right. The engine fires correctly because the four conditions passed. The trade fails because the regime context CIPHER doesn\'t see is hostile. In STRONG TREND, snaps are retracements that resume in the trend direction. This is exactly the situation where Filter 1 (Regime Fit) overrides apparent conviction. Skip.' },
      { id: 'c', text: 'TAKE half size as a hedge against the trend.', correct: false, explain: 'Half-sizing a counter-trend TS in STRONG TREND is just smaller losses on the same bad expectancy. The framework doesn\'t use sizing as compensation for failed filters &mdash; if Filter 1 fails, the verdict is SKIP regardless of size. Half-sizing here is negotiating with the rule.' },
      { id: 'd', text: 'TAKE &mdash; only counter-trend TS in MILD trend should be skipped, not strong trend.', correct: false, explain: 'The opposite is true. In MILD or WEAK trend, snap-backs CAN produce real reversals. In STRONG TREND, the trend\'s momentum overwhelms the snap-back &mdash; this is precisely where TS counter-trend has the worst expectancy. Stronger trend = stronger skip on counter-trend TS.' },
    ],
  },
  {
    id: 'g2',
    scenario: 'EURUSD 5m. Regime TREND, Tension BUILDING, Last Signal ▲ Long+ 1 bar JUST FIRED, Conditions show 4/4 Full Strong. Filter 1 passes (TREND + PX continuation). But scrolling up the chart, you can clearly see a fresh Bear FVG sitting 0.8R above current price &mdash; unfilled, fresh from earlier this session.',
    prompt: 'Take or skip?',
    options: [
      { id: 'a', text: 'TAKE &mdash; Full Strong (4/4) is the highest conviction tier; that overrides minor structural concerns.', correct: false, explain: 'This is Mistake 2 from S15 &mdash; "confusing conviction tier with guarantee." Conviction is one of three filters, not the only filter. A pristine Filter 3 cannot compensate for a Filter 2 failure. Fresh counter-FVGs act as magnets for liquidity &mdash; price typically retests them before continuing. Even a Full Strong PX gets stopped on the wick.' },
      { id: 'b', text: 'TAKE &mdash; the FVG is below 1R, not relevant to the 1.5R target zone.', correct: false, explain: 'The FVG sits at 0.8R, which is INSIDE the typical R:R move and well within stop-distance. The standard rule is: any fresh counter-FVG within 1.5R of entry is a Filter 2 fail. 0.8R is even closer than that &mdash; price will almost certainly tag it before continuing.' },
      { id: 'c', text: 'SKIP &mdash; fresh counter-direction FVG within 1.5R is a Filter 2 fail; the matrix verdict is overridden.', correct: true, explain: '✓ Exactly. The decision matrix assumes Filter 2 (Structure) passes. When it fails, the verdict is SKIP regardless of how perfect the cell looks otherwise. Filter 2 fails specifically catch the "engine fired correctly into bad context" pattern. The Bear FVG is a magnet; price retests it; your stop takes the wick. Skip.' },
      { id: 'd', text: 'TAKE with a wider stop above the FVG to avoid the wick.', correct: false, explain: 'Widening the stop fundamentally changes your trade plan &mdash; you\'re now risking 1.5x or 2x the original R for the same target, which collapses your R:R below 1:1. The cleaner answer is to skip the fired signal and wait for a fresh fire AFTER the FVG has been tested or filled. Don\'t alter the plan to fit a flawed setup.' },
    ],
  },
  {
    id: 'g3',
    scenario: 'BTCUSD 1h. The Pulse row reads "⚠ CHOPPY → SIGNALS UNRELIABLE." A PX Long+ has just fired with Full Strong (4/4) conviction, regime TREND, tension BUILDING, structure looks textbook clean. Everything else looks pristine.',
    prompt: 'Take or skip?',
    options: [
      { id: 'a', text: 'TAKE &mdash; the choppy flag is a soft warning; Full Strong + clean structure overrides it.', correct: false, explain: 'This is Mistake 4 from S15 &mdash; negotiating with hard-skip rules. The choppy flag is a HARD skip rule (S09 Hard Skip 1), not a soft warning. Hard skips override the matrix and override conviction by definition. The engine itself is telling you "my pattern math doesn\'t apply right now." Trading anyway is bypassing the framework.' },
      { id: 'b', text: 'TAKE half size as a compromise.', correct: false, explain: 'Half-sizing a hard-skip is just smaller losses on the same broken expectancy. Hard skips exist because the engine\'s assumptions don\'t hold &mdash; size doesn\'t fix that. The right action is no size at all. Negotiating with hard skips degrades the entire framework.' },
      { id: 'c', text: 'SKIP &mdash; choppy Pulse is a hard skip rule; it overrides conviction and matrix verdicts.', correct: true, explain: '✓ Right. The choppy flag fires when Pulse has flipped 3+ times in 20 bars &mdash; the engine\'s own confidence read says "my signals are unreliable here." Hard skips override everything: regime fit, structure, conviction, matrix cell. Even a Full Strong+ in a clean regime is SKIP when choppy is on. Wait for 4-5 stable Pulse bars without a flip before re-engaging.' },
      { id: 'd', text: 'TAKE &mdash; the choppy flag is for PX flips; TS or PX-with-Full-Strong are exempt.', correct: false, explain: 'There is no exemption. The choppy flag applies to all signals on the affected asset/TF until it clears. The flag is the engine\'s own confidence read, and it doesn\'t differentiate by tier or signal type. Trading any signal with choppy active bypasses the engine\'s self-confidence assessment.' },
    ],
  },
  {
    id: 'g4',
    scenario: 'You\'re looking at the chart 12 bars after a PX Long fired. Last Signal row reads ▲ Long 12 bars → ACTIVE. Regime is TREND, conditions are still 3/4. Price has already moved roughly 60% of typical R toward the take zone. The signal is technically still "active" per the engine.',
    prompt: 'Should you enter now?',
    options: [
      { id: 'a', text: 'YES &mdash; the engine still says ACTIVE, the regime is right, and conditions are Strong.', correct: false, explain: 'This is PX Skip Rule 4 from S10 &mdash; bars-old > 8 means you\'re chasing. Even though the signal is still flagged ACTIVE by the engine, the original R:R has collapsed because price has already moved 60% toward the take zone. Entering now means accepting roughly 0.4R reward against a stop that\'s now 2.5x further away than at original entry. The math is upside-down.' },
      { id: 'b', text: 'NO &mdash; bars-old > 8 means original R:R has collapsed; this is chasing, not entering.', correct: true, explain: '✓ Exactly. PX Skip Rule 4 caps fresh entries at roughly 5-8 bars after fire. Beyond that, you\'re paying full stop distance for a fraction of original reward. The signal is "still valid" structurally, but tradeable as a fresh entry it isn\'t. Wait for the next fresh fire on a retest, or skip this move entirely. Chasing stale signals is one of the highest-frequency P&L leaks.' },
      { id: 'c', text: 'YES with a tighter stop just below current price to maintain R:R.', correct: false, explain: 'Tightening the stop on a stale entry means stopping out on normal noise. The wider stop existed for a reason &mdash; it\'s the structural invalidation point. Compressing the stop into noise-range to "preserve R:R" creates a different trade with much lower hit rate. The discipline is to wait for fresh fire, not to engineer the stop around a stale entry.' },
      { id: 'd', text: 'NO &mdash; the engine should have de-activated this signal automatically; this is a CIPHER bug.', correct: false, explain: 'No bug. The engine reports ACTIVE as long as the structural context (Pulse direction, conviction tier) is still valid &mdash; that\'s informationally correct, useful for position management of an already-open trade. But "still valid as engine state" ≠ "still tradeable as fresh entry." That distinction is the operator\'s call, not the engine\'s. PX Skip Rule 4 is exactly this distinction.' },
    ],
  },
  {
    id: 'g5',
    scenario: 'You\'re on hour 4 of your session. You\'ve had 2 consecutive losses. Account is down 2.8% on the day. A perfect-looking PX Long+ just fired on your primary asset &mdash; TREND, Full Strong, clean structure, no hard-skip flags. The 5-second scan returns TAKE+ verdict cleanly.',
    prompt: 'What do you do?',
    options: [
      { id: 'a', text: 'TAKE+ at full size &mdash; the framework verdict is unambiguous, and a Full Strong fire is exactly what you\'ve been waiting for.', correct: false, explain: 'The framework verdict is correct as far as it goes &mdash; the three filters and matrix all pass. But personal Rule 1 from S14 (drawdown circuit breaker) overrides the framework when triggered. 2 consecutive losses + 2.8% account drawdown is at or past your circuit breaker. The reason isn\'t "this signal will fail" &mdash; the reason is your decision-quality has degraded after losses, and revenge-trade psychology is statistically catastrophic.' },
      { id: 'b', text: 'TAKE half size as a compromise between the framework verdict and the drawdown.', correct: false, explain: 'Half-sizing a personal-rule override is the same problem as half-sizing a hard skip. The rule exists because emotional state degrades after losses &mdash; not because position size is the issue. The right answer is no size, full stop, end the session. Half-sizing here is the exact "I can still trade this one" psychology the circuit breaker exists to prevent.' },
      { id: 'c', text: 'SKIP and end the session &mdash; personal rule (drawdown circuit breaker) overrides the framework verdict.', correct: true, explain: '✓ Right. Personal rules sit above the framework in the priority stack. The drawdown circuit breaker (2 losses or 3% drawdown) exists precisely for moments like this &mdash; when a perfect-looking signal appears after losses, the brain wants to "make it back" with a confident trade. The next signal after a circuit-breaker trigger is the highest-FOMO signal of your trading career. End the session. Tomorrow is fine.' },
      { id: 'd', text: 'TAKE+ with a tighter stop to manage the drawdown risk if it loses.', correct: false, explain: 'Same issue as option B. Engineering the trade to "manage drawdown risk" is missing the point of the rule entirely. The rule isn\'t about position-sizing the next trade &mdash; it\'s about not taking the next trade. Your decision-quality after 2 consecutive losses is statistically lower; tightening the stop just ensures you stop out on noise. Skip means skip.' },
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
    question: 'Which signal pattern has the highest expectancy in TREND regime?',
    options: [
      { id: 'a', text: 'TS reversals at trend exhaustion', correct: false },
      { id: 'b', text: 'PX continuations with the trend', correct: true },
      { id: 'c', text: 'PX counter-trend reversals', correct: false },
      { id: 'd', text: 'Standard PX in any direction', correct: false },
    ],
    explain: 'PX continuations align with the trend\'s structural breaks &mdash; each Pulse flip in trend direction is a fresh continuation entry. TS reversals work in RANGE; counter-trend PX is structurally weak in TREND regime. The Filter 1 (Regime Fit) match for TREND is PX with the trend.',
  },
  {
    id: 'q2',
    question: 'The three filters (Regime, Structure, Conviction) are combined using which logic?',
    options: [
      { id: 'a', text: 'OR &mdash; if any one filter passes, take the trade', correct: false },
      { id: 'b', text: 'AND &mdash; all three must pass for TAKE; one fail = SKIP', correct: true },
      { id: 'c', text: 'Weighted average where Conviction gets the most weight', correct: false },
      { id: 'd', text: 'Sequential, where each filter only applies if previous failed', correct: false },
    ],
    explain: 'AND-gating is structurally identical to the engine itself (PX pipeline, TS conditions). Failing any one filter is enough to skip even when the other two are pristine. A perfect-conviction signal in the wrong regime is still wrong-regime; perfect regime against fresh counter-structure is still counter-structure. AND is mathematically aligned with empirical edge.',
  },
  {
    id: 'q3',
    question: 'You see a fired PX Long with Full Strong (4/4) tier in VOLATILE regime, structure clean. What\'s the verdict?',
    options: [
      { id: 'a', text: 'TAKE+ &mdash; Full Strong always trades regardless of regime', correct: false },
      { id: 'b', text: 'TAKE half size &mdash; the matrix cell for VOLATILE × Strong is half-size', correct: false },
      { id: 'c', text: 'SKIP &mdash; HARD SKIP 2 (VOLATILE regime) overrides the matrix', correct: true },
      { id: 'd', text: 'TAKE standard size, the conviction compensates for the regime', correct: false },
    ],
    explain: 'The matrix cell VOLATILE × Strong does technically map to half-size. But HARD SKIP 2 (S09) sits above the matrix &mdash; VOLATILE regime alone is a documented hard skip because both PX and TS underperform when ATR is elevated and ADX is mid. Hard skips override the matrix even for Full Strong. The only exception is VOLATILE + Full Strong with very specific structural confluence (rare); default behaviour: skip.',
  },
  {
    id: 'q4',
    question: 'The Pulse row reads "⚠ CHOPPY → SIGNALS UNRELIABLE." A clean PX fires. What should you do?',
    options: [
      { id: 'a', text: 'Take it &mdash; the choppy flag is a soft warning, not a rule', correct: false },
      { id: 'b', text: 'Skip it &mdash; choppy is a hard skip rule that overrides everything', correct: true },
      { id: 'c', text: 'Take half size as a compromise', correct: false },
      { id: 'd', text: 'Take only if conviction is Full Strong (4/4)', correct: false },
    ],
    explain: 'Choppy Pulse fires when there have been 3+ Pulse flips in the last 20 bars &mdash; the engine\'s OWN confidence read says signals are unreliable. This is HARD SKIP 1 from S09 and overrides every other filter, conviction tier, and matrix cell. Wait until choppy clears (4-5 stable Pulse bars without a flip) before re-engaging.',
  },
  {
    id: 'q5',
    question: 'When does the Failed-Flip Override (Gate 4) PX get traded?',
    options: [
      { id: 'a', text: 'Skip it &mdash; failed-flip means the original PX failed the pipeline', correct: false },
      { id: 'b', text: 'Treat it like Standard tier &mdash; lower edge', correct: false },
      { id: 'c', text: 'Take with confidence &mdash; failed-flip captures V-bottoms and W-bottoms, structurally high edge', correct: true },
      { id: 'd', text: 'Skip unless regime is RANGE', correct: false },
    ],
    explain: 'Per L11.11 and S10 PX Rule 3, the Failed-Flip Override (PX Pipeline Gate 4) catches V-bottom and W-bottom recovery patterns when the OPPOSITE direction PX fired and was rejected within 8 bars. These are structurally one of the highest-edge reversal patterns CIPHER catches by design. Take with confidence &mdash; possibly up-size.',
  },
  {
    id: 'q6',
    question: 'A signal fires 12 minutes before a major news release on your asset. Otherwise the framework verdict is TAKE. What do you do?',
    options: [
      { id: 'a', text: 'Take it &mdash; news is unpredictable but the engine is correct', correct: false },
      { id: 'b', text: 'Take half size to manage the news risk', correct: false },
      { id: 'c', text: 'Skip it &mdash; news window is a hard skip from 30 min before to 15 min after release', correct: true },
      { id: 'd', text: 'Take it but with a wider stop to absorb news volatility', correct: false },
    ],
    explain: 'Within 30 minutes BEFORE and 15 minutes AFTER major releases (FOMC, NFP, CPI, central-bank decisions), signal expectancy collapses because price action is news-driven not pattern-driven. CIPHER doesn\'t track news &mdash; that\'s your calendar. This is HARD SKIP 3 from S09. Inside the window: hands off keyboard regardless of how clean the engine output looks.',
  },
  {
    id: 'q7',
    question: 'What\'s the recommended action for the first 100 trades while building skip discipline?',
    options: [
      { id: 'a', text: 'Trade every fired signal to build base-rate intuition', correct: false },
      { id: 'b', text: 'Turn Strong Signals Only ON and skip all Standard tier signals', correct: true },
      { id: 'c', text: 'Trade only TS reversals, never PX', correct: false },
      { id: 'd', text: 'Take only Full Strong (4/4) and skip everything else', correct: false },
    ],
    explain: 'Per S07, turning Strong Signals Only ON forces the engine to filter Standard tier (2/4) out at the engine level &mdash; you never see them, never have to skip them, never wonder "maybe this one will work." During the first 100 trades, this hardens skip discipline by removing the marginal-edge temptations entirely. After 100 trades, if hit rate is solid, experiment with adding Standard back in selectively.',
  },
  {
    id: 'q8',
    question: 'According to the lesson, what hit rate of fired signals do the strongest CIPHER operators trade?',
    options: [
      { id: 'a', text: '90-100% &mdash; they trade everything the engine fires', correct: false },
      { id: 'b', text: '60-75% &mdash; they skip only obvious losses', correct: false },
      { id: 'c', text: '25-35% &mdash; patience is the edge', correct: true },
      { id: 'd', text: '5-10% &mdash; only Full Strong setups', correct: false },
    ],
    explain: 'Per S01 and S02, the operators with the strongest empirical expectancy across the ATLAS suite trade roughly 25-35% of fired signals. Trading everything (Mistake 1) consistently underperforms; skipping everything (Mistake 3) means no edge ever materialises. The discipline sits between: filter aggressively, take cleanly. Patience is the edge.',
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
// ANIMATION 1 — SkipPileAnim (S01 Groundbreaking Concept)
// "The Skip Pile"
//
// 8 signal triangles stream in from the top. Each falls toward 3 hexagonal
// filter checkpoints (Regime · Structure · Conviction). Pass all 3 → TAKE
// pile (left, teal). Fail any → SKIP pile (right, amber) with reason text.
// Final: 3 take, 5 skip — the "70/30" pattern shown without saying it yet.
// ============================================================
function SkipPileAnim() {
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
    ctx.fillText('THE SKIP PILE  ·  not every signal is a trade', w / 2, 22);

    // Define 8 signals with their fate. Order = order they fire on chart.
    type Sig = { dir: 'long' | 'short'; strong: boolean; verdict: 'TAKE' | 'SKIP'; reason: string };
    const signals: Sig[] = [
      { dir: 'short', strong: true,  verdict: 'TAKE', reason: '' },
      { dir: 'short', strong: false, verdict: 'SKIP', reason: 'Conv 2/4' },
      { dir: 'long',  strong: false, verdict: 'SKIP', reason: 'Wrong regime' },
      { dir: 'short', strong: true,  verdict: 'TAKE', reason: '' },
      { dir: 'long',  strong: false, verdict: 'SKIP', reason: 'Choppy flag' },
      { dir: 'short', strong: false, verdict: 'SKIP', reason: 'Counter-FVG' },
      { dir: 'long',  strong: true,  verdict: 'TAKE', reason: '' },
      { dir: 'short', strong: false, verdict: 'SKIP', reason: 'No follow-through' },
    ];

    // Layout: top zone (signals fire), middle zone (filters), bottom zone (piles)
    const padX = 24;
    const fireY = 50;
    const filterY = h * 0.42;
    const pileY = h - 70;

    // Filter checkpoints: 3 hexagons in a row at filterY
    const filterNames = ['REGIME', 'STRUCTURE', 'CONVICTION'];
    const filterCenterX = w / 2;
    const filterSpacing = 88;
    const filterPositions = [
      filterCenterX - filterSpacing,
      filterCenterX,
      filterCenterX + filterSpacing,
    ];

    // 18s loop: 0–14s reveal signals one by one (8 signals × 1.75s each), 14–18s pause showing final piles
    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const revealTime = 14;
    const perSig = revealTime / signals.length;

    // Compute which signals are revealed and their progression
    const draws: Array<{ idx: number; phase: number; progress: number; signal: Sig }> = [];
    for (let i = 0; i < signals.length; i++) {
      const startT = i * perSig;
      if (cycleT < startT) continue;
      const localT = cycleT - startT;
      // 4 phases: fire (0-0.3s), descend to filters (0.3-0.8s), filter (0.8-1.3s), settle to pile (1.3-1.75s)
      let phase = 0;
      let progress = 0;
      if (localT < 0.3) { phase = 0; progress = localT / 0.3; }
      else if (localT < 0.8) { phase = 1; progress = (localT - 0.3) / 0.5; }
      else if (localT < 1.3) { phase = 2; progress = (localT - 0.8) / 0.5; }
      else if (localT < perSig) { phase = 3; progress = (localT - 1.3) / (perSig - 1.3); }
      else { phase = 4; progress = 1; } // settled
      draws.push({ idx: i, phase, progress, signal: signals[i] });
    }

    // ── Draw filter hexagons ──
    const drawHex = (cx: number, cy: number, size: number, fillAlpha: number, strokeColor: string, fillColor: string) => {
      ctx.fillStyle = fillColor + Math.floor(fillAlpha * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const ang = (Math.PI / 3) * k - Math.PI / 2;
        const px = cx + Math.cos(ang) * size;
        const py = cy + Math.sin(ang) * size;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Determine which filter is "active" based on signals currently in phase 2
    const activeAtFilter = draws.filter((d) => d.phase === 2);
    filterNames.forEach((name, fi) => {
      const cx = filterPositions[fi];
      const isActive = activeAtFilter.length > 0;
      const baseColor = AMBER;
      drawHex(cx, filterY, 32, isActive ? 0.18 : 0.08, baseColor + 'aa', baseColor);
      // Label
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name, cx, filterY + 4);
    });

    // ── Draw take/skip piles ──
    const takeX = padX + 50;
    const skipX = w - padX - 50;
    const pileBoxW = 90;
    const pileBoxH = 50;

    // Take pile box
    ctx.fillStyle = `${TEAL}11`;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1;
    ctx.fillRect(takeX - pileBoxW / 2, pileY - pileBoxH / 2, pileBoxW, pileBoxH);
    ctx.strokeRect(takeX - pileBoxW / 2, pileY - pileBoxH / 2, pileBoxW, pileBoxH);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ TAKE', takeX, pileY - pileBoxH / 2 - 6);

    // Skip pile box
    ctx.fillStyle = `${AMBER}11`;
    ctx.strokeStyle = AMBER;
    ctx.fillRect(skipX - pileBoxW / 2, pileY - pileBoxH / 2, pileBoxW, pileBoxH);
    ctx.strokeRect(skipX - pileBoxW / 2, pileY - pileBoxH / 2, pileBoxW, pileBoxH);
    ctx.fillStyle = AMBER;
    ctx.fillText('✗ SKIP', skipX, pileY - pileBoxH / 2 - 6);

    // ── Draw all signals at their current positions ──
    let takeCount = 0;
    let skipCount = 0;
    // First count settled
    draws.forEach((d) => {
      if (d.phase >= 3) {
        if (d.signal.verdict === 'TAKE') takeCount++;
        else skipCount++;
      }
    });
    let takeStacked = 0;
    let skipStacked = 0;

    draws.forEach((d) => {
      const sig = d.signal;
      const dirColor = sig.dir === 'long' ? TEAL : MAGENTA;
      // Compute (x, y)
      let x = 0, y = 0;
      const startX = padX + 30 + d.idx * ((w - padX * 2 - 60) / 8);
      const startY = fireY;
      const filterCenter = filterY;
      const targetPileX = sig.verdict === 'TAKE' ? takeX : skipX;
      const targetPileY = pileY;

      if (d.phase === 0) {
        // Fire: bounce in at startX/startY
        x = startX;
        y = startY - (1 - d.progress) * 16;
      } else if (d.phase === 1) {
        // Descend toward filters (curve toward middle)
        const fx = filterCenterX;
        x = startX + (fx - startX) * d.progress;
        y = startY + (filterCenter - startY) * d.progress;
      } else if (d.phase === 2) {
        // At filters — pulse in place
        x = filterCenterX;
        y = filterCenter;
      } else {
        // Settle to pile
        if (sig.verdict === 'TAKE') {
          const stackPos = takeStacked;
          takeStacked++;
          const tx = takeX + (stackPos - 1) * 18;
          const ty = pileY;
          x = filterCenterX + (tx - filterCenterX) * d.progress;
          y = filterCenter + (ty - filterCenter) * d.progress;
        } else {
          const stackPos = skipStacked;
          skipStacked++;
          const tx = skipX + (stackPos % 3 - 1) * 18;
          const ty = pileY + Math.floor(stackPos / 3) * 14 - 8;
          x = filterCenterX + (tx - filterCenterX) * d.progress;
          y = filterCenter + (ty - filterCenter) * d.progress;
        }
      }

      // Draw triangle (up for long, down for short, "+" for strong)
      const tSize = sig.strong ? 9 : 7;
      ctx.fillStyle = dirColor;
      if (sig.strong) {
        ctx.shadowColor = dirColor;
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      if (sig.dir === 'long') {
        ctx.moveTo(x, y - tSize);
        ctx.lineTo(x - tSize * 0.9, y + tSize * 0.6);
        ctx.lineTo(x + tSize * 0.9, y + tSize * 0.6);
      } else {
        ctx.moveTo(x, y + tSize);
        ctx.lineTo(x - tSize * 0.9, y - tSize * 0.6);
        ctx.lineTo(x + tSize * 0.9, y - tSize * 0.6);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      if (sig.strong) {
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', x + (sig.dir === 'long' ? tSize : tSize - 1), y + (sig.dir === 'long' ? -tSize - 4 : tSize + 5));
      }

      // Reason label for skipped signals (only when settled)
      if (d.phase >= 3 && sig.verdict === 'SKIP' && d.progress > 0.7) {
        ctx.fillStyle = AMBER;
        ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sig.reason, x, y + 14);
      }
    });

    // ── Counters above piles ──
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(takeCount), takeX, pileY + pileBoxH / 2 + 20);
    ctx.fillStyle = AMBER;
    ctx.fillText(String(skipCount), skipX, pileY + pileBoxH / 2 + 20);

    // ── Bottom caption ──
    if (cycleT > revealTime) {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`8 signals fired.  3 traded.  5 skipped — for specific reasons.`, w / 2, h - 22);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('The engine fires correctly. The operator decides which fires become trades.', w / 2, h - 8);
    } else {
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Watch each signal pass through three filter checkpoints...', w / 2, h - 12);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — EngineVsTradeAnim (S02)
// "The Engine ≠ The Trade"
//
// Split screen. Left: chart with all 8 signals visible (the engine's output).
// Right: an operator's trade journal — only 3 entries, each annotated with
// take-reason and final R:R. The visual punch: same session, very different
// outputs depending on whether you trade everything or filter.
// ============================================================
function EngineVsTradeAnim() {
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
    ctx.fillText('THE ENGINE ≠ THE TRADE  ·  what fires vs what gets traded', w / 2, 22);

    // Two panels — split 50/50
    const padX = 14;
    const panelTop = 42;
    const panelBot = h - 30;
    const panelH = panelBot - panelTop;
    const panelW = (w - padX * 3) / 2;
    const leftX = padX;
    const rightX = padX * 2 + panelW;

    // ── LEFT PANEL — what the engine fires ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(leftX, panelTop, panelW, panelH);
    ctx.strokeRect(leftX, panelTop, panelW, panelH);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CIPHER ENGINE  ·  this session', leftX + 8, panelTop + 14);

    // Mini chart with 8 signals
    const chartTop = panelTop + 24;
    const chartBot = panelBot - 26;
    const chartH = chartBot - chartTop;
    const chartLeft = leftX + 12;
    const chartRight = leftX + panelW - 12;
    const chartW = chartRight - chartLeft;

    // Generate price line (smooth wave)
    const N = 60;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const phase = (i / N) * Math.PI * 3;
      prices.push(50 + Math.sin(phase) * 14 + Math.sin(phase * 2.3) * 4);
    }

    const minP = 30;
    const maxP = 70;
    const yScale = (p: number) => chartTop + ((maxP - p) / (maxP - minP)) * chartH;
    const xScale = (i: number) => chartLeft + (i / (N - 1)) * chartW;

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

    // Place 8 signals along the chart
    type Trig = { idx: number; dir: 'long' | 'short'; strong: boolean; taken: boolean };
    const trigs: Trig[] = [
      { idx: 6,  dir: 'short', strong: true,  taken: true  },
      { idx: 12, dir: 'short', strong: false, taken: false },
      { idx: 18, dir: 'long',  strong: false, taken: false },
      { idx: 25, dir: 'short', strong: true,  taken: true  },
      { idx: 32, dir: 'long',  strong: false, taken: false },
      { idx: 39, dir: 'short', strong: false, taken: false },
      { idx: 46, dir: 'long',  strong: true,  taken: true  },
      { idx: 53, dir: 'short', strong: false, taken: false },
    ];

    // Reveal triggers progressively over 4s, then steady
    const cycleSec = 8;
    const cycleT = t % cycleSec;
    const revealEnd = 4;
    const revealedCount = cycleT < revealEnd ? Math.floor((cycleT / revealEnd) * trigs.length) : trigs.length;

    trigs.forEach((tr, i) => {
      if (i > revealedCount) return;
      const x = xScale(tr.idx);
      const y = yScale(prices[tr.idx]) + (tr.dir === 'long' ? 14 : -14);
      const tSize = tr.strong ? 6 : 5;
      const dirColor = tr.dir === 'long' ? TEAL : MAGENTA;
      ctx.fillStyle = dirColor;
      ctx.beginPath();
      if (tr.dir === 'long') {
        ctx.moveTo(x, y - tSize);
        ctx.lineTo(x - tSize, y + tSize);
        ctx.lineTo(x + tSize, y + tSize);
      } else {
        ctx.moveTo(x, y + tSize);
        ctx.lineTo(x - tSize, y - tSize);
        ctx.lineTo(x + tSize, y - tSize);
      }
      ctx.closePath();
      ctx.fill();
    });

    // Counter at bottom of left panel
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${revealedCount} signals fired`, leftX + panelW / 2, panelBot - 8);

    // ── RIGHT PANEL — what the operator actually traded ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(rightX, panelTop, panelW, panelH);
    ctx.strokeRect(rightX, panelTop, panelW, panelH);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATOR JOURNAL  ·  same session', rightX + 8, panelTop + 14);

    // 3 trade entries — only the "taken" ones
    const trades = trigs.filter((tr) => tr.taken);
    const tradeYStart = panelTop + 30;
    const tradeYStep = 28;

    // Show trades progressively as their corresponding signal reveals
    trades.forEach((tr, ti) => {
      const sigIdx = trigs.indexOf(tr);
      if (sigIdx > revealedCount) return;
      const ty = tradeYStart + ti * tradeYStep;

      // Trade row
      ctx.fillStyle = 'rgba(38, 166, 154, 0.08)';
      ctx.strokeStyle = `${TEAL}55`;
      ctx.lineWidth = 1;
      ctx.fillRect(rightX + 8, ty, panelW - 16, 22);
      ctx.strokeRect(rightX + 8, ty, panelW - 16, 22);

      // Triangle marker
      const tx = rightX + 18;
      const tcy = ty + 11;
      const tSize = 5;
      const dirColor = tr.dir === 'long' ? TEAL : MAGENTA;
      ctx.fillStyle = dirColor;
      ctx.beginPath();
      if (tr.dir === 'long') {
        ctx.moveTo(tx, tcy - tSize);
        ctx.lineTo(tx - tSize, tcy + tSize);
        ctx.lineTo(tx + tSize, tcy + tSize);
      } else {
        ctx.moveTo(tx, tcy + tSize);
        ctx.lineTo(tx - tSize, tcy - tSize);
        ctx.lineTo(tx + tSize, tcy - tSize);
      }
      ctx.closePath();
      ctx.fill();

      // Trade label
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      const dirText = tr.dir === 'long' ? 'LONG' : 'SHORT';
      ctx.fillText(`${dirText}+ Strong`, tx + 12, tcy + 3);

      // R:R outcome
      const rrs = ['+1.5R', '+2.1R', '+1.8R'];
      ctx.fillStyle = TEAL;
      ctx.textAlign = 'right';
      ctx.fillText(rrs[ti], rightX + panelW - 14, tcy + 3);
    });

    // Counter at bottom
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${trades.filter((tr) => trigs.indexOf(tr) <= revealedCount).length} trades taken`, rightX + panelW / 2, panelBot - 8);

    // ── Center divider with arrow ──
    const arrowX = w / 2;
    const arrowY = (panelTop + panelBot) / 2;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(arrowX - 6, arrowY);
    ctx.lineTo(arrowX + 6, arrowY);
    ctx.moveTo(arrowX + 2, arrowY - 4);
    ctx.lineTo(arrowX + 6, arrowY);
    ctx.lineTo(arrowX + 2, arrowY + 4);
    ctx.stroke();

    // ── Bottom caption ──
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER outputs the engine state. Your job is the filter between engine and trade.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — FiveSecondScanAnim (S03)
// "The 5-Second Scan"
//
// Mini Command Center. 5 rows highlighted in sequence with a 1-second timer
// at the top. Builds the read pattern: Tension → Regime → Last Signal →
// Conditions → header guidance. Each row gets a beat of focus, then onto
// the next. Total 5 seconds, then loops.
// ============================================================
function FiveSecondScanAnim() {
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
    ctx.fillText('THE 5-SECOND SCAN  ·  read 5 rows, 1 second each, decide', w / 2, 22);

    // 5 rows, each shown for ~1s. Row hits focus, label appears, then next.
    const rows = [
      {
        name: 'Header',
        cells: ['CIPHER PRO', '▲ BULL TREND', '→ TREND INTACT'],
        cellColors: [WHITE, TEAL, TEAL],
        readout: '1. Direction & regime — bull trend, intact.',
      },
      {
        name: 'Tension',
        cells: ['Tension', '▲ SNAPPING', '→ REVERSAL ACTIVE'],
        cellColors: [WHITE, MAGENTA, MAGENTA],
        readout: '2. Tension state — snapping. TS just fired or about to.',
      },
      {
        name: 'Regime',
        cells: ['Regime', 'TREND', '→ TREND INTACT'],
        cellColors: [WHITE, TEAL, TEAL],
        readout: '3. Regime — TREND, no shift forming. Trend signals work here.',
      },
      {
        name: 'Last Signal',
        cells: ['Last Signal', '▲ Long  2 bars', '→ JUST FIRED'],
        cellColors: [WHITE, TEAL, AMBER],
        readout: '4. Last signal — long, fresh. Just fired this bar window.',
      },
      {
        name: 'Conditions',
        cells: ['Conditions', 'Trend MOD · Mom SURGE', 'Vol QUIET · Tens BUILD'],
        cellColors: [WHITE, TEAL, AMBER],
        readout: '5. Conviction — surging momentum, but volume quiet. 3/4. Standard.',
      },
    ];

    const rowH = 26;
    const totalH = rows.length * rowH;
    const tableTop = 50;
    const tableLeft = 30;
    const tableW = w - 60;
    const cellWidths = [tableW * 0.32, tableW * 0.32, tableW * 0.36];

    // 7-second cycle: 5 second scan + 2 second pause showing the verdict
    const cycleSec = 7;
    const cycleT = t % cycleSec;
    const focusIdx = Math.min(rows.length - 1, Math.floor(cycleT));

    // Draw all rows
    rows.forEach((row, i) => {
      const ry = tableTop + i * rowH;
      const isFocus = i === focusIdx && cycleT < rows.length;
      const isPast = i < focusIdx || (cycleT >= rows.length);

      // Row background
      if (isFocus) {
        ctx.fillStyle = `${AMBER}22`;
      } else if (isPast) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.015)';
      }
      ctx.fillRect(tableLeft, ry, tableW, rowH);

      ctx.strokeStyle = isFocus ? AMBER : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      ctx.strokeRect(tableLeft, ry, tableW, rowH);

      // Row cells
      let cx = tableLeft;
      row.cells.forEach((cell, ci) => {
        const cw = cellWidths[ci];
        const isPastOrFocus = isPast || isFocus;
        ctx.fillStyle = isPastOrFocus ? row.cellColors[ci] : DIM;
        ctx.font = ci === 0 ? 'bold 10px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.textAlign = ci === 0 ? 'left' : ci === 1 ? 'center' : 'left';
        const tx = ci === 0 ? cx + 10 : ci === 1 ? cx + cw / 2 : cx + 10;
        ctx.fillText(cell, tx, ry + rowH / 2 + 3);
        cx += cw;
      });
    });

    // Timer above table — counts up 1..5 then verdict
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'right';
    if (cycleT < rows.length) {
      const seconds = Math.min(rows.length, Math.ceil(cycleT) || 1);
      ctx.fillText(`${seconds}s`, w - 30, 44);
    } else {
      ctx.fillStyle = TEAL;
      ctx.fillText(`✓`, w - 30, 44);
    }

    // Readout zone below table
    const readoutY = tableTop + totalH + 16;
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    ctx.fillRect(tableLeft, readoutY, tableW, 44);
    ctx.strokeRect(tableLeft, readoutY, tableW, 44);

    if (cycleT < rows.length) {
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rows[focusIdx].readout, w / 2, readoutY + 18);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`Reading row ${focusIdx + 1} of ${rows.length}...`, w / 2, readoutY + 33);
    } else {
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VERDICT  ·  TAKE  ·  trend-aligned, fresh, 3/4 conviction', w / 2, readoutY + 18);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('5 rows scanned. Decision reached. Click submitted within 5 seconds.', w / 2, readoutY + 33);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — ThreeFiltersAnim (S04)
// "The Three Filter Dimensions"
//
// 3 hexagonal filter cards in a row. Each cycles through showing its name,
// its core question, and an example pass/fail. The animation builds the
// mental model of the lesson's central framework.
// ============================================================
function ThreeFiltersAnim() {
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
    ctx.fillText('THREE FILTERS  ·  every signal must clear all three', w / 2, 22);

    const filters = [
      {
        num: '1',
        name: 'REGIME FIT',
        question: 'Does this signal pattern work in this regime?',
        bullets: ['TREND: PX continuations win', 'RANGE: TS reversals win', 'VOLATILE: reduce or skip'],
        color: TEAL,
      },
      {
        num: '2',
        name: 'STRUCTURE',
        question: 'Is structural context with the trade or against?',
        bullets: ['No fresh counter-FVG', 'No untested liquidity', 'Pulse not choppy'],
        color: AMBER,
      },
      {
        num: '3',
        name: 'CONVICTION',
        question: 'How many factors aligned (Strong / Standard)?',
        bullets: ['4/4 = full Strong', '3/4 = Strong (the +)', '< 3 = filtered or Standard'],
        color: MAGENTA,
      },
    ];

    // Layout: 3 cards in a row, with a "→ TAKE" or "→ SKIP" output below each
    const padX = 18;
    const cardTop = 46;
    const cardBot = h - 72;
    const cardH = cardBot - cardTop;
    const cardGap = 8;
    const cardW = (w - padX * 2 - cardGap * 2) / 3;

    const cycleSec = 12;
    const cycleT = t % cycleSec;
    const focusIdx = Math.floor(cycleT / 4);

    filters.forEach((f, i) => {
      const cx = padX + i * (cardW + cardGap);
      const cy = cardTop;
      const isFocus = i === focusIdx;

      // Card background
      ctx.fillStyle = isFocus ? `${f.color}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? f.color : FAINT;
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

      // Filter number (big)
      ctx.fillStyle = isFocus ? f.color : DIM;
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.num, cx + cardW / 2, cy + 36);

      // Filter name
      ctx.fillStyle = isFocus ? f.color : WHITE;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.name, cx + cardW / 2, cy + 56);

      // Question
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      // Word-wrap the question into 2 lines max
      const words = f.question.split(' ');
      let line1 = '';
      let line2 = '';
      let lineMax = 22;
      for (const word of words) {
        if (line1.length + word.length + 1 <= lineMax) line1 += (line1 ? ' ' : '') + word;
        else line2 += (line2 ? ' ' : '') + word;
      }
      ctx.fillText(line1, cx + cardW / 2, cy + 76);
      if (line2) ctx.fillText(line2, cx + cardW / 2, cy + 86);

      // Bullets
      const bulletY = cy + 104;
      f.bullets.forEach((b, bi) => {
        ctx.fillStyle = isFocus ? 'rgba(255,255,255,0.78)' : DIM;
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('· ' + b, cx + 10, bulletY + bi * 13);
      });
    });

    // ── Convergence: AND gate at the bottom, leading to ✓ TAKE ──
    const gateY = cardBot + 26;
    const gateXMid = w / 2;

    // Lines from each card to the gate
    filters.forEach((f, i) => {
      const cx = padX + i * (cardW + cardGap) + cardW / 2;
      const isFocus = i === focusIdx;
      ctx.strokeStyle = isFocus ? f.color : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(cx, cardBot + 4);
      ctx.lineTo(cx, gateY - 4);
      ctx.lineTo(gateXMid, gateY - 4);
      ctx.stroke();
    });

    // AND gate (small box)
    ctx.fillStyle = `${TEAL}22`;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    const gateW = 70;
    const gateH = 22;
    ctx.fillRect(gateXMid - gateW / 2, gateY - 4, gateW, gateH);
    ctx.strokeRect(gateXMid - gateW / 2, gateY - 4, gateW, gateH);
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALL 3 PASS', gateXMid, gateY + 11);

    // Output arrow + TAKE label
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gateXMid, gateY + 18);
    ctx.lineTo(gateXMid, gateY + 28);
    ctx.lineTo(gateXMid - 4, gateY + 24);
    ctx.moveTo(gateXMid, gateY + 28);
    ctx.lineTo(gateXMid + 4, gateY + 24);
    ctx.stroke();

    ctx.fillStyle = TEAL;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ TAKE', gateXMid, gateY + 42);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fail any one filter → SKIP. The filters are AND-gated, like the engine itself.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — RegimeFitAnim (S05 — Filter 1: Regime Fit)
// 3-column regime matrix. Cycles spotlight TREND → RANGE → VOLATILE.
// Each column shows: which signal types win, which lose, what the
// Regime row reads, and a verdict-color summary.
// ============================================================
function RegimeFitAnim() {
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
    ctx.fillText('FILTER 1  ·  REGIME FIT  ·  which signal pattern wins where', w / 2, 22);

    const regimes = [
      {
        name: 'TREND',
        rowText: '▲ BULL TREND  →  TREND INTACT',
        rowColor: TEAL,
        win: 'PX continuations',
        winColor: TEAL,
        lose: 'TS counter-trend',
        loseColor: MAGENTA,
        verdict: 'Trade WITH the trend',
        verdictColor: TEAL,
        bgPattern: 'trending',
      },
      {
        name: 'RANGE',
        rowText: '↔ RANGING  →  RANGE HOLDING',
        rowColor: AMBER,
        win: 'TS reversals',
        winColor: TEAL,
        lose: 'PX continuations',
        loseColor: MAGENTA,
        verdict: 'Trade snap-backs',
        verdictColor: TEAL,
        bgPattern: 'ranging',
      },
      {
        name: 'VOLATILE',
        rowText: '⚡ VOLATILE  →  STAY CAUTIOUS',
        rowColor: MAGENTA,
        win: 'Reduce or skip both',
        winColor: AMBER,
        lose: 'Both PX & TS',
        loseColor: MAGENTA,
        verdict: 'Reduce size or skip',
        verdictColor: MAGENTA,
        bgPattern: 'volatile',
      },
    ];

    const cycleT = t % (regimes.length * 4);
    const focusIdx = Math.floor(cycleT / 4);

    const padX = 14;
    const cardTop = 44;
    const cardBot = h - 44;
    const cardH = cardBot - cardTop;
    const gap = 8;
    const cardW = (w - padX * 2 - gap * 2) / 3;

    regimes.forEach((r, i) => {
      const cx = padX + i * (cardW + gap);
      const cy = cardTop;
      const isFocus = i === focusIdx;

      // Card frame
      ctx.fillStyle = isFocus ? `${r.rowColor}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? r.rowColor : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      const rad = 5;
      ctx.beginPath();
      ctx.moveTo(cx + rad, cy);
      ctx.lineTo(cx + cardW - rad, cy);
      ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + rad);
      ctx.lineTo(cx + cardW, cy + cardH - rad);
      ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - rad, cy + cardH);
      ctx.lineTo(cx + rad, cy + cardH);
      ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - rad);
      ctx.lineTo(cx, cy + rad);
      ctx.quadraticCurveTo(cx, cy, cx + rad, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Regime name (large)
      ctx.fillStyle = isFocus ? r.rowColor : DIM;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, cx + cardW / 2, cy + 22);

      // Mini chart pattern
      const miniTop = cy + 32;
      const miniH = 56;
      const miniLeft = cx + 12;
      const miniRight = cx + cardW - 12;
      const miniW = miniRight - miniLeft;

      ctx.strokeStyle = isFocus ? 'rgba(255,255,255,0.7)' : FAINT;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const samples = 28;
      for (let s = 0; s <= samples; s++) {
        const sx = miniLeft + (s / samples) * miniW;
        let sy = 0;
        if (r.bgPattern === 'trending') {
          // Bull trend up
          sy = miniTop + miniH - (s / samples) * (miniH * 0.7) - 4 + Math.sin(s * 0.6) * 4;
        } else if (r.bgPattern === 'ranging') {
          // Sideways oscillation
          sy = miniTop + miniH / 2 + Math.sin(s * 0.45) * (miniH * 0.35);
        } else {
          // Volatile — sharp wide swings
          sy = miniTop + miniH / 2 + Math.sin(s * 0.7) * (miniH * 0.5) + Math.sin(s * 1.8) * (miniH * 0.2);
        }
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Regime row mock readout
      const rowY = miniTop + miniH + 14;
      ctx.fillStyle = `${r.rowColor}22`;
      ctx.strokeStyle = `${r.rowColor}66`;
      ctx.lineWidth = 1;
      ctx.fillRect(cx + 8, rowY, cardW - 16, 22);
      ctx.strokeRect(cx + 8, rowY, cardW - 16, 22);
      ctx.fillStyle = r.rowColor;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.rowText, cx + cardW / 2, rowY + 14);

      // WIN row
      const winY = rowY + 32;
      ctx.fillStyle = isFocus ? r.winColor : DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✓ WIN', cx + 12, winY);
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(r.win, cx + cardW - 12, winY);

      // LOSE row
      const loseY = winY + 14;
      ctx.fillStyle = isFocus ? r.loseColor : DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✗ LOSE', cx + 12, loseY);
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(r.lose, cx + cardW - 12, loseY);

      // Verdict pill at bottom of card
      const vY = loseY + 14;
      ctx.fillStyle = isFocus ? `${r.verdictColor}33` : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = isFocus ? r.verdictColor : FAINT;
      ctx.fillRect(cx + 8, vY, cardW - 16, 18);
      ctx.strokeRect(cx + 8, vY, cardW - 16, 18);
      ctx.fillStyle = isFocus ? r.verdictColor : DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.verdict, cx + cardW / 2, vY + 12);
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Match the signal type to the regime. Mismatch = skip, regardless of conviction.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — StructureAgreementAnim (S06 — Filter 2: Structure)
// Mini chart with a fired signal. Shows three structure-context overlays
// cycling: counter-FVG, untested liquidity, choppy Pulse. Each shows the
// signal getting "trapped" by a structural element above/below.
// ============================================================
function StructureAgreementAnim() {
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
    ctx.fillText('FILTER 2  ·  STRUCTURE  ·  is context with the trade or against?', w / 2, 22);

    const structures = [
      {
        name: 'COUNTER-FVG',
        desc: 'Fresh Fair Value Gap above your stop-loss target zone',
        warning: 'Price often retests FVG before continuing',
        bgY: 0.28,
        bgH: 0.08,
        bgColor: MAGENTA,
        bgLabel: 'BEAR FVG · UNFILLED',
      },
      {
        name: 'UNTESTED LIQUIDITY',
        desc: 'Recent swing high above current price — algos hunt for it',
        warning: 'Move usually sweeps liquidity before reversing',
        bgY: 0.18,
        bgH: 0.04,
        bgColor: AMBER,
        bgLabel: 'BSL · UNTESTED',
      },
      {
        name: 'CHOPPY PULSE',
        desc: 'Pulse has flipped 3+ times in last 20 bars',
        warning: 'Pulse row reads: SIGNALS UNRELIABLE',
        bgY: 0.0,
        bgH: 0,
        bgColor: AMBER,
        bgLabel: 'CHOPPY · SIGNALS UNRELIABLE',
      },
    ];

    const cycleT = t % (structures.length * 4);
    const focusIdx = Math.floor(cycleT / 4);
    const focus = structures[focusIdx];

    // Chart area
    const chartTop = 50;
    const chartBot = h - 80;
    const chartH = chartBot - chartTop;
    const padX = 24;
    const chartW = w - padX * 2;

    // Frame
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, chartTop, chartW, chartH);
    ctx.strokeRect(padX, chartTop, chartW, chartH);

    // Generate price line + signal
    const N = 50;
    const prices: number[] = [];
    if (focus.name === 'CHOPPY PULSE') {
      // Choppy back-and-forth
      for (let i = 0; i < N; i++) {
        prices.push(50 + Math.sin(i * 0.55) * 6 + Math.sin(i * 1.7) * 3);
      }
    } else {
      // Bull move with signal at midpoint
      for (let i = 0; i < N; i++) {
        const phase = i / N;
        prices.push(45 + phase * 14 + Math.sin(i * 0.4) * 2);
      }
    }

    const minP = 38;
    const maxP = 65;
    const yScale = (p: number) => chartTop + 6 + ((maxP - p) / (maxP - minP)) * (chartH - 12);
    const xScale = (i: number) => padX + 8 + (i / (N - 1)) * (chartW - 16);

    // Counter-FVG / liquidity overlay
    if (focus.bgH > 0) {
      const overlayTop = chartTop + chartH * focus.bgY;
      const overlayHeight = chartH * focus.bgH;
      ctx.fillStyle = `${focus.bgColor}33`;
      ctx.strokeStyle = `${focus.bgColor}88`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.fillRect(padX + 8, overlayTop, chartW - 16, overlayHeight);
      ctx.strokeRect(padX + 8, overlayTop, chartW - 16, overlayHeight);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = focus.bgColor;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(focus.bgLabel, padX + 14, overlayTop + overlayHeight / 2 + 3);
    }

    // Choppy: show flip markers
    if (focus.name === 'CHOPPY PULSE') {
      const flipBars = [12, 22, 30, 38];
      flipBars.forEach((b) => {
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.arc(xScale(b), yScale(prices[b]), 3, 0, Math.PI * 2);
        ctx.fill();
      });
      // CHOPPY label at top
      ctx.fillStyle = `${AMBER}33`;
      ctx.fillRect(padX + 8, chartTop + 6, chartW - 16, 18);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 8, chartTop + 6, chartW - 16, 18);
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠  ' + focus.bgLabel, padX + chartW / 2, chartTop + 18);
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

    // Place a Long signal at bar 25
    const sigBar = focus.name === 'CHOPPY PULSE' ? 35 : 25;
    const sx = xScale(sigBar);
    const sy = yScale(prices[sigBar]);

    // Pulsing ring around signal
    const phaseT = (cycleT % 4) / 4;
    const pulseAlpha = 0.4 + 0.4 * Math.sin(phaseT * Math.PI * 2 * 2);
    ctx.strokeStyle = `rgba(255, 179, 0, ${pulseAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 12 + phaseT * 6, 0, Math.PI * 2);
    ctx.stroke();

    // Long triangle
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.moveTo(sx, sy + 14);
    ctx.lineTo(sx - 6, sy + 24);
    ctx.lineTo(sx + 6, sy + 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Long', sx, sy + 35);

    // Annotation arrow from signal to structure
    if (focus.bgH > 0) {
      const overlayMidY = chartTop + chartH * (focus.bgY + focus.bgH / 2);
      ctx.strokeStyle = `${focus.bgColor}aa`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, overlayMidY + 12);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow head
      ctx.fillStyle = focus.bgColor;
      ctx.beginPath();
      ctx.moveTo(sx, overlayMidY + 12);
      ctx.lineTo(sx - 4, overlayMidY + 18);
      ctx.lineTo(sx + 4, overlayMidY + 18);
      ctx.closePath();
      ctx.fill();
    }

    // Verdict box at bottom
    const vY = chartBot + 12;
    ctx.fillStyle = `${MAGENTA}22`;
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, vY, chartW, 32);
    ctx.strokeRect(padX, vY, chartW, 32);
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${focus.name}  ·  SKIP THIS SIGNAL`, w / 2, vY + 14);
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText(focus.warning, w / 2, vY + 26);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CIPHER doesn\'t see structural context. Your eyes do. Skip when context fights you.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — ConvictionTierAnim (S07 — Filter 3: Conviction Tier)
// 4-factor scoring visual. Each factor is a binary gauge (PASS/FAIL).
// Sum determines tier: 4/4 Full Strong · 3/4 Strong (the "+") ·
// 2/4 Standard · 0-1/4 Filtered (Strong-Only suppresses)
// ============================================================
function ConvictionTierAnim() {
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
    ctx.fillText('FILTER 3  ·  CONVICTION TIER  ·  4-factor scoring', w / 2, 22);

    // 4 scenarios cycle: Full Strong · Strong · Standard · Filtered
    const scenarios = [
      { name: 'FULL STRONG', factors: [true, true, true, true], score: 4, tier: '4/4', tierLabel: 'FULL STRONG  ·  Long+', tierColor: TEAL, action: 'Highest tier — size up' },
      { name: 'STRONG', factors: [true, true, true, false], score: 3, tier: '3/4', tierLabel: 'STRONG  ·  Long+', tierColor: TEAL, action: 'Strong tier — standard size' },
      { name: 'STANDARD', factors: [true, true, false, false], score: 2, tier: '2/4', tierLabel: 'STANDARD  ·  Long', tierColor: AMBER, action: 'Standard — half size or skip' },
      { name: 'FILTERED', factors: [false, true, false, false], score: 1, tier: '1/4', tierLabel: 'BELOW STRONG-ONLY', tierColor: MAGENTA, action: 'Strong-Only ON: signal suppressed' },
    ];

    const factorNames = ['Ribbon Stack', 'ADX > 20', 'Volume > 1.0×', 'Momentum > 50%'];

    const cycleT = t % (scenarios.length * 3.5);
    const focusIdx = Math.floor(cycleT / 3.5);
    const scenario = scenarios[focusIdx];

    // Top: scenario banner
    ctx.fillStyle = `${scenario.tierColor}22`;
    ctx.strokeStyle = `${scenario.tierColor}88`;
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
    ctx.fillStyle = scenario.tierColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(scenario.name, w / 2, 53);

    // 4 factor cells in a 2x2 grid
    const gridTop = 80;
    const gridBot = h - 100;
    const gridH = gridBot - gridTop;
    const padX = 30;
    const cellW = (w - padX * 2 - 8) / 2;
    const cellH = (gridH - 8) / 2;

    factorNames.forEach((fn, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = padX + col * (cellW + 8);
      const cy = gridTop + row * (cellH + 8);
      const passes = scenario.factors[i];

      // Cell background
      ctx.fillStyle = passes ? `${TEAL}22` : `${MAGENTA}11`;
      ctx.strokeStyle = passes ? TEAL : `${MAGENTA}66`;
      ctx.lineWidth = 1.2;
      const r = 4;
      ctx.beginPath();
      ctx.moveTo(cx + r, cy);
      ctx.lineTo(cx + cellW - r, cy);
      ctx.quadraticCurveTo(cx + cellW, cy, cx + cellW, cy + r);
      ctx.lineTo(cx + cellW, cy + cellH - r);
      ctx.quadraticCurveTo(cx + cellW, cy + cellH, cx + cellW - r, cy + cellH);
      ctx.lineTo(cx + r, cy + cellH);
      ctx.quadraticCurveTo(cx, cy + cellH, cx, cy + cellH - r);
      ctx.lineTo(cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Factor name
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(fn, cx + 12, cy + 18);

      // Pass/fail icon (large)
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(passes ? '✓' : '✗', cx + cellW - 14, cy + 32);

      // Status label
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(passes ? 'PASS' : 'FAIL', cx + 12, cy + cellH - 8);
    });

    // Score box on right
    const scoreX = w - 70;
    const scoreY = gridTop + 40;
    ctx.fillStyle = `${scenario.tierColor}33`;
    ctx.strokeStyle = scenario.tierColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = scenario.tierColor;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(scenario.tier, scoreX, scoreY + 5);

    // Tier verdict bar
    const vY = h - 70;
    ctx.fillStyle = `${scenario.tierColor}22`;
    ctx.strokeStyle = scenario.tierColor;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, vY, w - padX * 2, 40);
    ctx.strokeRect(padX, vY, w - padX * 2, 40);
    ctx.fillStyle = scenario.tierColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`TIER  ·  ${scenario.tierLabel}`, w / 2, vY + 16);
    ctx.fillStyle = WHITE;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(scenario.action, w / 2, vY + 30);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Strong-Only input filters out anything below 3/4 — they never print as triangles.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — DecisionMatrixAnim (S08 — Decision Matrix)
// 3x3 grid combining the three filters into final verdicts.
// Cycles spotlight through cells, each showing a TAKE/SIZE-DOWN/SKIP
// recommendation based on the Filter 1 + Filter 3 cross.
// ============================================================
function DecisionMatrixAnim() {
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
    ctx.fillText('DECISION MATRIX  ·  Regime × Conviction (Structure assumed clean)', w / 2, 22);

    // 3x3 grid: rows = regime, cols = conviction tier
    type Cell = { verdict: string; color: string; size: string };
    const grid: Cell[][] = [
      // TREND row
      [
        { verdict: 'TAKE+', color: TEAL, size: 'Up-size' },
        { verdict: 'TAKE', color: TEAL, size: 'Standard' },
        { verdict: 'SKIP', color: MAGENTA, size: '—' },
      ],
      // RANGE row
      [
        { verdict: 'TAKE', color: TEAL, size: 'Standard' },
        { verdict: 'TAKE', color: AMBER, size: 'Half' },
        { verdict: 'SKIP', color: MAGENTA, size: '—' },
      ],
      // VOLATILE row
      [
        { verdict: 'TAKE', color: AMBER, size: 'Half' },
        { verdict: 'SKIP', color: MAGENTA, size: '—' },
        { verdict: 'SKIP', color: MAGENTA, size: '—' },
      ],
    ];
    const rowLabels = ['TREND', 'RANGE', 'VOLATILE'];
    const colLabels = ['STRONG (3+/4)', 'STANDARD (2/4)', 'WEAK (<2)'];

    // Layout
    const padX = 20;
    const gridTop = 56;
    const gridBot = h - 60;
    const gridH = gridBot - gridTop;
    const labelColW = 90;
    const labelRowH = 28;
    const cellW = (w - padX * 2 - labelColW) / 3;
    const cellH = (gridH - labelRowH) / 3;

    // Cycle through cells (9 cells, but skip duplicates: highlight 6 distinct verdicts over 12s)
    const totalCells = 9;
    const cycleT = t % (totalCells * 1.4);
    const spotIdx = Math.floor(cycleT / 1.4);
    const spotRow = Math.floor(spotIdx / 3);
    const spotCol = spotIdx % 3;

    // Column headers
    colLabels.forEach((cl, i) => {
      const cx = padX + labelColW + i * cellW;
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cl, cx + cellW / 2, gridTop + 14);
    });

    // Row labels + cells
    rowLabels.forEach((rl, ri) => {
      const ry = gridTop + labelRowH + ri * cellH;

      // Row label
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(rl, padX + labelColW - 8, ry + cellH / 2 + 3);

      // Cells
      for (let ci = 0; ci < 3; ci++) {
        const cx = padX + labelColW + ci * cellW;
        const cell = grid[ri][ci];
        const isSpot = ri === spotRow && ci === spotCol;

        // Cell background
        const baseAlpha = cell.color === TEAL ? '22' : cell.color === AMBER ? '22' : '11';
        ctx.fillStyle = isSpot ? cell.color + '44' : cell.color + baseAlpha;
        ctx.strokeStyle = isSpot ? cell.color : `${cell.color}55`;
        ctx.lineWidth = isSpot ? 1.8 : 1;
        ctx.fillRect(cx + 1, ry + 1, cellW - 2, cellH - 2);
        ctx.strokeRect(cx + 1, ry + 1, cellW - 2, cellH - 2);

        // Verdict (large)
        ctx.fillStyle = cell.color;
        ctx.font = isSpot ? 'bold 14px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cell.verdict, cx + cellW / 2, ry + cellH / 2 - 1);

        // Size below
        ctx.fillStyle = isSpot ? WHITE : DIM;
        ctx.font = '8px Inter, sans-serif';
        ctx.fillText(cell.size, cx + cellW / 2, ry + cellH / 2 + 14);
      }
    });

    // Spotlight verdict pill at bottom
    const spotCell = grid[spotRow][spotCol];
    const spotPath = `${rowLabels[spotRow]}  ·  ${colLabels[spotCol]}  →  ${spotCell.verdict}  ·  ${spotCell.size}`;
    ctx.fillStyle = `${spotCell.color}22`;
    ctx.strokeStyle = spotCell.color;
    ctx.lineWidth = 1;
    {
      const bX = padX;
      const bY = h - 36;
      const bW = w - padX * 2;
      const bH = 24;
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
    ctx.fillStyle = spotCell.color;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(spotPath, w / 2, h - 21);

    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Filter 2 (Structure) overrides everything — bad structure → SKIP regardless of cell.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — HardSkipsAnim (S09 — Hard Skip Criteria)
// 4 hard-skip rules cycle through. Each shows: the trigger, the engine
// readout that surfaces it, and the rule. These OVERRIDE the matrix.
// ============================================================
function HardSkipsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
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
    ctx.fillText('HARD SKIP CRITERIA  ·  these override the decision matrix', w / 2, 22);

    const skips = [
      {
        rule: 'CHOPPY PULSE FLAG',
        trigger: 'Pulse has flipped 3+ times in last 20 bars',
        readout: '⚠ CHOPPY  →  SIGNALS UNRELIABLE',
        location: 'Pulse row · Col 2 + Col 3',
        action: 'Skip ALL signals on this asset/TF until choppy clears',
      },
      {
        rule: 'VOLATILE REGIME',
        trigger: 'Regime row reads VOLATILE',
        readout: '⚡ VOLATILE  →  STAY CAUTIOUS  ·  REDUCE SIZE',
        location: 'Regime row + Header row',
        action: 'Skip or reduce size by 50% on every signal',
      },
      {
        rule: 'NEWS WINDOW',
        trigger: 'Major news release within 30 minutes',
        readout: '(not in CIPHER — your calendar)',
        location: 'External: economic calendar',
        action: 'Skip for 30 mins before, 15 mins after release',
      },
      {
        rule: 'REGIME TRANSITION',
        trigger: 'Regime row reads SHIFTING TO X',
        readout: '→ SHIFTING TO TREND  /  RANGE FORMING',
        location: 'Regime row guidance',
        action: 'Skip — regime is unstable, expectancy is unreliable',
      },
    ];

    const cycleT = t % (skips.length * 4);
    const focusIdx = Math.floor(cycleT / 4);
    const focus = skips[focusIdx];

    // Layout: large card in the middle showing the focused skip rule
    const padX = 30;
    const cardTop = 50;
    const cardBot = h - 50;
    const cardH = cardBot - cardTop;
    const cardW = w - padX * 2;

    // Card frame — strong red border
    ctx.fillStyle = `${MAGENTA}11`;
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 1.5;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(padX + r, cardTop);
    ctx.lineTo(padX + cardW - r, cardTop);
    ctx.quadraticCurveTo(padX + cardW, cardTop, padX + cardW, cardTop + r);
    ctx.lineTo(padX + cardW, cardBot - r);
    ctx.quadraticCurveTo(padX + cardW, cardBot, padX + cardW - r, cardBot);
    ctx.lineTo(padX + r, cardBot);
    ctx.quadraticCurveTo(padX, cardBot, padX, cardBot - r);
    ctx.lineTo(padX, cardTop + r);
    ctx.quadraticCurveTo(padX, cardTop, padX + r, cardTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rule number badge top-left
    ctx.fillStyle = `${MAGENTA}33`;
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 1;
    ctx.fillRect(padX + 14, cardTop + 12, 90, 22);
    ctx.strokeRect(padX + 14, cardTop + 12, 90, 22);
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SKIP RULE  ${focusIdx + 1}/${skips.length}`, padX + 14 + 45, cardTop + 27);

    // Rule name (large)
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(focus.rule, w / 2, cardTop + 64);

    // Sections inside card
    const innerLeft = padX + 24;
    const innerW = cardW - 48;
    const sY = cardTop + 84;

    // Trigger
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TRIGGER', innerLeft, sY);
    ctx.fillStyle = WHITE;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(focus.trigger, innerLeft, sY + 14);

    // Readout
    const sY2 = sY + 32;
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('ENGINE READOUT', innerLeft, sY2);
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(focus.readout, innerLeft, sY2 + 14);

    // Location
    const sY3 = sY2 + 32;
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('WHERE TO SEE IT', innerLeft, sY3);
    ctx.fillStyle = DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(focus.location, innerLeft, sY3 + 14);

    // Action box
    const aY = cardBot - 38;
    ctx.fillStyle = `${MAGENTA}33`;
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 1;
    ctx.fillRect(innerLeft, aY, innerW, 26);
    ctx.strokeRect(innerLeft, aY, innerW, 26);
    ctx.fillStyle = MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(focus.action, innerLeft + innerW / 2, aY + 16);

    // Pagination dots
    const dotsY = h - 24;
    const dotSpace = 16;
    const dotsStart = w / 2 - (skips.length - 1) * dotSpace / 2;
    skips.forEach((_, i) => {
      const dx = dotsStart + i * dotSpace;
      ctx.fillStyle = i === focusIdx ? MAGENTA : `${MAGENTA}33`;
      ctx.beginPath();
      ctx.arc(dx, dotsY, i === focusIdx ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hard skips override the decision matrix. Ignore them and you bypass discipline.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — WorkedExamplesAnim (S12)
// 3 worked examples cycle through. Each shows a Command Center reading
// (mini), the 3 filter checks lighting up green/red, and the verdict
// (TAKE / TAKE half / SKIP).
// ============================================================
function WorkedExamplesAnim() {
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
    ctx.fillText('WORKED EXAMPLES  ·  three signals, three verdicts', w / 2, 22);

    type Example = {
      label: string;
      regime: { text: string; color: string };
      tension: { text: string; color: string };
      lastSig: { text: string; color: string };
      conviction: { text: string; color: string };
      f1Pass: boolean; f1Note: string;
      f2Pass: boolean; f2Note: string;
      f3Pass: boolean; f3Note: string;
      verdict: string;
      verdictColor: string;
    };
    const examples: Example[] = [
      {
        label: 'EXAMPLE 1  ·  XAUUSD 15m',
        regime: { text: 'TREND  →  TREND INTACT', color: TEAL },
        tension: { text: 'BUILDING  →  WATCH', color: AMBER },
        lastSig: { text: '▲ Long+ 2b  →  JUST FIRED', color: TEAL },
        conviction: { text: '3/4  ·  Strong', color: TEAL },
        f1Pass: true, f1Note: 'TREND + PX continuation = match',
        f2Pass: true, f2Note: 'No counter-FVG, no untested liq',
        f3Pass: true, f3Note: 'Strong tier (3+/4)',
        verdict: 'TAKE  ·  Standard size',
        verdictColor: TEAL,
      },
      {
        label: 'EXAMPLE 2  ·  EURUSD 5m',
        regime: { text: 'RANGE  →  RANGE HOLDING', color: AMBER },
        tension: { text: 'SNAPPING  →  REVERSAL', color: MAGENTA },
        lastSig: { text: '▼ Short 4b  →  ACTIVE', color: MAGENTA },
        conviction: { text: '2/4  ·  Standard', color: AMBER },
        f1Pass: true, f1Note: 'RANGE + TS reversal = match',
        f2Pass: true, f2Note: 'Clean structure, fresh fire',
        f3Pass: false, f3Note: 'Standard tier — half edge',
        verdict: 'TAKE  ·  Half size',
        verdictColor: AMBER,
      },
      {
        label: 'EXAMPLE 3  ·  BTCUSD 1h',
        regime: { text: 'VOLATILE  →  STAY CAUTIOUS', color: MAGENTA },
        tension: { text: 'STRETCHED  →  SNAP LIKELY', color: MAGENTA },
        lastSig: { text: '▲ Long+ 1b  →  JUST FIRED', color: TEAL },
        conviction: { text: '4/4  ·  Full Strong', color: TEAL },
        f1Pass: false, f1Note: 'VOLATILE — both engines underperform',
        f2Pass: true, f2Note: 'Structure clean',
        f3Pass: true, f3Note: 'Full Strong (4/4)',
        verdict: 'SKIP  ·  Filter 1 fail',
        verdictColor: MAGENTA,
      },
    ];

    const cycleT = t % (examples.length * 5);
    const focusIdx = Math.floor(cycleT / 5);
    const ex = examples[focusIdx];
    const phaseT = cycleT % 5;

    // Header — example label
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ex.label, w / 2, 42);

    // Top: mini Command Center (4 rows)
    const padX = 24;
    const cmdTop = 56;
    const rowH = 22;
    const cmdW = w - padX * 2;
    const rows = [
      { name: 'Regime', val: ex.regime.text, color: ex.regime.color },
      { name: 'Tension', val: ex.tension.text, color: ex.tension.color },
      { name: 'Last Signal', val: ex.lastSig.text, color: ex.lastSig.color },
      { name: 'Conditions', val: ex.conviction.text, color: ex.conviction.color },
    ];

    rows.forEach((r, i) => {
      const ry = cmdTop + i * rowH;
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.fillRect(padX, ry, cmdW, rowH - 1);
      ctx.strokeRect(padX, ry, cmdW, rowH - 1);

      ctx.fillStyle = WHITE;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.name, padX + 12, ry + rowH / 2 + 2);

      ctx.fillStyle = r.color;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(r.val, padX + cmdW - 12, ry + rowH / 2 + 2);
    });

    // Middle: 3 filter checkpoints
    const filterY = cmdTop + rows.length * rowH + 24;
    const filterH = 38;
    const filterW = (cmdW - 16) / 3;

    const filters = [
      { name: 'F1 REGIME', pass: ex.f1Pass, note: ex.f1Note, lightAt: 1 },
      { name: 'F2 STRUCT', pass: ex.f2Pass, note: ex.f2Note, lightAt: 2 },
      { name: 'F3 CONV', pass: ex.f3Pass, note: ex.f3Note, lightAt: 3 },
    ];

    filters.forEach((f, i) => {
      const fx = padX + i * (filterW + 8);
      const fy = filterY;
      const lit = phaseT >= f.lightAt;
      const passColor = f.pass ? TEAL : MAGENTA;

      ctx.fillStyle = lit ? `${passColor}22` : 'rgba(255,255,255,0.03)';
      ctx.strokeStyle = lit ? passColor : FAINT;
      ctx.lineWidth = lit ? 1.5 : 1;
      const r = 4;
      ctx.beginPath();
      ctx.moveTo(fx + r, fy);
      ctx.lineTo(fx + filterW - r, fy);
      ctx.quadraticCurveTo(fx + filterW, fy, fx + filterW, fy + r);
      ctx.lineTo(fx + filterW, fy + filterH - r);
      ctx.quadraticCurveTo(fx + filterW, fy + filterH, fx + filterW - r, fy + filterH);
      ctx.lineTo(fx + r, fy + filterH);
      ctx.quadraticCurveTo(fx, fy + filterH, fx, fy + filterH - r);
      ctx.lineTo(fx, fy + r);
      ctx.quadraticCurveTo(fx, fy, fx + r, fy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = lit ? passColor : DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.name, fx + filterW / 2, fy + 13);

      // Pass/fail icon
      ctx.fillStyle = lit ? passColor : DIM;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(lit ? (f.pass ? '✓' : '✗') : '·', fx + filterW / 2, fy + 30);
    });

    // Filter notes (only show after lighting)
    const noteY = filterY + filterH + 12;
    filters.forEach((f, i) => {
      const fx = padX + i * (filterW + 8);
      const lit = phaseT >= f.lightAt;
      if (!lit) return;
      ctx.fillStyle = f.pass ? TEAL : MAGENTA;
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      // word-wrap
      const words = f.note.split(' ');
      let line1 = '';
      let line2 = '';
      const maxC = 24;
      for (const w of words) {
        if (line1.length + w.length + 1 <= maxC) line1 += (line1 ? ' ' : '') + w;
        else line2 += (line2 ? ' ' : '') + w;
      }
      ctx.fillText(line1, fx + filterW / 2, noteY);
      if (line2) ctx.fillText(line2, fx + filterW / 2, noteY + 9);
    });

    // Verdict at bottom — appears after all 3 filters resolved
    if (phaseT >= 4) {
      const vY = h - 38;
      ctx.fillStyle = `${ex.verdictColor}22`;
      ctx.strokeStyle = ex.verdictColor;
      ctx.lineWidth = 1.5;
      ctx.fillRect(padX, vY, cmdW, 28);
      ctx.strokeRect(padX, vY, cmdW, 28);
      ctx.fillStyle = ex.verdictColor;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ex.verdict, w / 2, vY + 18);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same engine. Same conditions. Three different verdicts based on filter math.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — TimingSkipsAnim (S13)
// Timeline showing trading day: news windows + session opens highlighted.
// Marker dot moves through the day. SKIP zones bracket high-risk periods.
// ============================================================
function TimingSkipsAnim() {
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
    ctx.fillText('TIMING SKIPS  ·  not all hours of the day are equal', w / 2, 22);

    // 24-hour timeline
    const padX = 30;
    const tlTop = 90;
    const tlH = 60;
    const tlW = w - padX * 2;

    // Hour ticks
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let hr = 0; hr <= 24; hr += 3) {
      const tx = padX + (hr / 24) * tlW;
      const label = hr === 0 || hr === 24 ? '00' : hr.toString().padStart(2, '0');
      ctx.fillText(label + ':00', tx, tlTop - 6);
      // Tick mark
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, tlTop);
      ctx.lineTo(tx, tlTop + 4);
      ctx.stroke();
    }

    // Background timeline track
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(padX, tlTop, tlW, tlH);
    ctx.strokeRect(padX, tlTop, tlW, tlH);

    type Window = { start: number; end: number; name: string; color: string; verdict: string };
    const windows: Window[] = [
      { start: 7, end: 8, name: 'LON OPEN', color: AMBER, verdict: 'Wait 30 min' },
      { start: 12.5, end: 13.5, name: 'NY OPEN', color: AMBER, verdict: 'Wait 30 min' },
      { start: 13.5, end: 14, name: 'NEWS PM', color: MAGENTA, verdict: 'Hard skip' },
      { start: 18, end: 19, name: 'NY CLOSE', color: AMBER, verdict: 'Reduce size' },
      { start: 21.5, end: 23, name: 'ASIA THIN', color: MAGENTA, verdict: 'Skip retail TFs' },
    ];

    // Map hour to x
    const hToX = (hr: number) => padX + (hr / 24) * tlW;

    // Draw skip windows as colored rectangles
    windows.forEach((win) => {
      const x1 = hToX(win.start);
      const x2 = hToX(win.end);
      ctx.fillStyle = `${win.color}33`;
      ctx.strokeStyle = win.color;
      ctx.lineWidth = 1;
      ctx.fillRect(x1, tlTop + 4, x2 - x1, tlH - 8);
      ctx.strokeRect(x1, tlTop + 4, x2 - x1, tlH - 8);

      // Label inside window
      ctx.fillStyle = win.color;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(win.name, (x1 + x2) / 2, tlTop + tlH / 2 - 3);
      ctx.fillStyle = WHITE;
      ctx.font = '6px Inter, sans-serif';
      ctx.fillText(win.verdict, (x1 + x2) / 2, tlTop + tlH / 2 + 8);
    });

    // Animated cursor sweeping through 24h cycle
    const cycleSec = 16;
    const cycleT = t % cycleSec;
    const currentHour = (cycleT / cycleSec) * 24;
    const cursorX = hToX(currentHour);

    // Cursor line
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, tlTop - 4);
    ctx.lineTo(cursorX, tlTop + tlH + 4);
    ctx.stroke();

    // Cursor handle
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(cursorX, tlTop - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Determine current period — is cursor inside any skip window?
    let currentWin: Window | null = null;
    for (const win of windows) {
      if (currentHour >= win.start && currentHour <= win.end) {
        currentWin = win;
        break;
      }
    }

    // Status box below timeline
    const statusY = tlTop + tlH + 26;
    const statusH = 56;
    const isSafe = !currentWin;
    const statusColor = isSafe ? TEAL : currentWin && currentWin.color === MAGENTA ? MAGENTA : AMBER;

    ctx.fillStyle = `${statusColor}22`;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(padX, statusY, tlW, statusH);
    ctx.strokeRect(padX, statusY, tlW, statusH);

    // Hour text (large)
    const hh = Math.floor(currentHour);
    const mm = Math.floor((currentHour - hh) * 60);
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')} UTC`, w / 2, statusY + 22);

    // Status text
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (currentWin) {
      ctx.fillText(`⚠  ${currentWin.name}  ·  ${currentWin.verdict}`, w / 2, statusY + 40);
    } else {
      ctx.fillText('✓  Standard trading hours  ·  filters apply normally', w / 2, statusY + 40);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UTC reference shown. Adjust for your local sessions and primary asset.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherWhichSignalsLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.13-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 13</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Which Signals to Take,<br />Which to Skip<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Patience Is the Edge</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">CIPHER fires correctly. The operator decides which fires become trades. This is the capstone of the Signal Engine arc &mdash; the discipline that separates traders who hit every signal from operators who hit only the ones that matter.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">The engine fires. The operator decides.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Lessons 11.10, 11.11, and 11.12 taught you the engines. <strong className="text-white">How Pulse is built. How PX is filtered. How TS catches snaps.</strong> By now you can read why a signal fired or didn&apos;t fire with full transparency. That&apos;s engine knowledge. It&apos;s necessary, and it&apos;s not enough.</p>
            <p className="text-gray-400 leading-relaxed mb-4">CIPHER does not know your risk frame. It does not know the news calendar. It does not know whether your asset is in a regime where the signal pattern even has positive expectancy. It does not know that a fresh counter-FVG sits 8 ticks above your stop. <strong className="text-amber-400">CIPHER does its job perfectly &mdash; outputting the engine state. Your job is the filter between engine output and trade execution.</strong></p>
            <p className="text-gray-400 leading-relaxed">This lesson teaches the skill that separates the operator who trades 30% of fired signals (and is profitable) from the operator who trades all 100% of them (and is not). Three filter dimensions. Hard skip criteria. A 5-second scan. The discipline of patience as the actual edge.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE SKIP DISCIPLINE PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson you will know the <strong className="text-white">three filter dimensions</strong> that sort signals into TAKE and SKIP piles, the hard-skip criteria that override everything else, the PX-specific and TS-specific skip rules, the 5-second Command Center scan that lets you decide at signal close, and how to build your own personal skip rules around news, sessions, and your risk frame. You will trade fewer signals. You will trade better ones. <strong className="text-amber-400">Patience becomes the edge.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Skip Pile (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Skip Pile</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Watch eight CIPHER signals fire over a single session. Each signal passes through three filter checkpoints: <strong className="text-white">Regime, Structure, Conviction</strong>. Pass all three &mdash; the signal becomes a trade. Fail any one &mdash; the signal becomes a skip, with a specific reason attached. By the end of the session, the engine has fired eight times and the operator has traded three.</p>
          <SkipPileAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Each signal is real. The engine fired correctly each time. <strong className="text-amber-400">Five of the eight got skipped &mdash; for specific, named reasons.</strong> Wrong regime. Choppy flag. Counter-FVG. No follow-through. Conviction 2/4. Not because the indicator was wrong, but because the operator&apos;s filter caught what the engine couldn&apos;t see.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE THREE FILTER CHECKPOINTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Regime filter asks: <strong className="text-white">does this signal pattern even have positive expectancy in the current regime?</strong> PX continuations need TREND. TS reversals work in RANGE and at trend exhaustion. Trying to trade against the regime fights the math. The Structure filter asks: <strong className="text-white">is the structural context with the trade or against?</strong> Fresh counter-FVGs, untested liquidity, choppy Pulse all skew expectancy down. The Conviction filter asks: <strong className="text-white">how many of the four conviction factors aligned?</strong> Strong (3+/4) is the edge tier; sub-3 is filtered out automatically when Strong-Only is on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SKIPS ARE NOT FAILURES</p>
              <p className="text-sm text-gray-400 leading-relaxed">A skip is the operator using information CIPHER doesn&apos;t have. The engine output is one input to the trade decision &mdash; not the entire decision. <strong className="text-white">Skipping a fired signal is a feature of the workflow, not a bug.</strong> Operators who treat every signal as mandatory burn through their conviction, their account, and their patience &mdash; usually in that order. Operators who treat every signal as a candidate and run it through the three filters trade fewer, win more.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE NUMBER NO ONE WANTS TO HEAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">In Shezab&apos;s own backtests across the ATLAS suite, the operators with the strongest expectancy trade roughly <strong className="text-white">25-35%</strong> of fired signals. Those who try to trade everything &mdash; chasing every triangle that prints &mdash; consistently underperform. The math is not subtle. <strong className="text-amber-400">Patience is the edge.</strong> The signals you don&apos;t take are as important as the ones you do.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a signal fires, you don&apos;t ask &ldquo;is this real?&rdquo; CIPHER already answered that. You ask <strong className="text-white">does this fire belong in my TAKE pile or my SKIP pile?</strong> Run the three filters in your head &mdash; or by reading the Command Center. If yes/yes/yes, click. If anything fails, walk away. The fastest way to ruin a working engine is to trade the signals it fires that you should have skipped.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Engine ≠ The Trade === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Engine &ne; The Trade</p>
          <h2 className="text-2xl font-extrabold mb-4">Same session. Two very different outcomes.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">There&apos;s a gap between what CIPHER outputs and what your trading journal records. CIPHER says &ldquo;this is a valid PX Long&rdquo; or &ldquo;this is a valid TS Short.&rdquo; Your journal says &ldquo;I took position X for Y R.&rdquo; <strong className="text-amber-400">The gap between those two outputs is the lesson.</strong> Operators who close the gap to zero (trade every fire) and operators who keep it healthy (trade selectively) have very different P&amp;L curves.</p>
          <EngineVsTradeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The chart on the left shows the engine&apos;s output for the session &mdash; eight signals fired correctly, marked at their bars. The journal on the right shows what was actually traded &mdash; three entries, each tagged Strong+, each closing for positive R. <strong className="text-white">The other five signals weren&apos;t failures &mdash; they were filtered.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER IS THE ENGINE, NOT THE STRATEGY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common operator-error is to treat CIPHER as a complete trading strategy &mdash; just trade the signals as they print, sit back, profit. This conflates the engine layer with the strategy layer. <strong className="text-white">CIPHER outputs engine state.</strong> Your strategy layers on top: which engine outputs to trade given regime, structure, news, your account size, your psychology. The engine is necessary but never sufficient.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE GAP HAS TO EXIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER doesn&apos;t know your risk-of-ruin curve, news calendar, position sizing, drawdown comfort, time-of-day rules, or correlated-pair exposure. It can&apos;t. <strong className="text-white">Those are not engine problems &mdash; they&apos;re operator problems.</strong> The gap between engine output and trade execution is exactly where you bring all of that to bear. Closing the gap means abdicating those decisions. That&apos;s usually expensive.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TWO SIGNATURE FAILURE MODES</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Mode 1: trade everything.</strong> Sees a triangle, clicks the order. No filtering. Believes the engine &ldquo;has it covered.&rdquo; Burns through conviction during chop, holds losers because &ldquo;CIPHER said so,&rdquo; eventually capitulates and either over-tunes the indicator or rage-quits. <strong className="text-white">Mode 2: trade nothing.</strong> Filters every signal out of existence. Endless analysis paralysis. Always finds a reason to skip. The Skip Pile gets full but the Take pile stays empty. The lesson is sit between these two extremes &mdash; a discipline that takes practice.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE JOURNAL TEST</p>
              <p className="text-sm text-gray-400 leading-relaxed">After every session, look at your journal vs the engine&apos;s signal log. <strong className="text-white">Did you trade everything? Did you trade almost nothing? Did the gap have a shape?</strong> The healthy gap looks like: skipped during regime A, took during regime B, skipped after the news event, took after the session opened. The unhealthy gap looks like: random.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE FRAME CHANGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Stop asking &ldquo;was this signal valid?&rdquo; The engine already answered that &mdash; if the triangle printed, the signal is structurally valid by CIPHER&apos;s definition. <strong className="text-white">Start asking &ldquo;was this signal a trade for me, in this context, on this asset, at this time?&rdquo;</strong> Different question, different answer, different P&amp;L.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The 5-Second Scan === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The 5-Second Scan</p>
          <h2 className="text-2xl font-extrabold mb-4">Read 5 rows. Decide in 5 seconds.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">When a signal fires, you have a tight window to decide before price moves and the entry slips. The Command Center is built for this exact moment. <strong className="text-amber-400">Five rows, one second each.</strong> Header for direction and headline action. Tension for snap state. Regime for setup-pattern fit. Last Signal for freshness. Conditions for live conviction. By the time five seconds elapse, you have your answer.</p>
          <FiveSecondScanAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The scan moves through the rows in a fixed order, with a focus highlight and a one-line readout per row. The verdict at the end is the synthesis of all five reads. <strong className="text-white">This is not a checklist you memorise &mdash; it&apos;s a rhythm you internalise.</strong> Hundreds of signals in, the scan happens almost subconsciously.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SECOND 1  ·  HEADER  ·  direction &amp; headline action</p>
              <p className="text-sm text-gray-400 leading-relaxed">Top row tells you the macro state in one glance. <strong className="text-white">▲ BULL TREND</strong>, <strong className="text-white">▼ BEAR TREND</strong>, <strong className="text-white">↔ RANGING</strong>, or <strong className="text-white">⚡ VOLATILE</strong>. Plus a guidance arrow: TREND INTACT, TREND CURVING, RIBBON COILED, SNAP ZONE, BREAKOUT LOADING, REDUCE SIZE. The header alone tells you whether the regime even supports the kind of signal that just fired.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SECOND 2  ·  TENSION  ·  snap state</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tension row in one glance: RELAXED, BUILDING, STRETCHED, or SNAPPING. If the row says SNAPPING and a TS just fired, that&apos;s engine confirmation. If it says RELAXED and a TS just fired, something&apos;s off &mdash; double-check. If a PX fired, tension state tells you whether the move is happening with the rubber band intact (TREND continuation) or against it (potentially exhausted).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SECOND 3  ·  REGIME  ·  setup-pattern fit</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row tells you which signal patterns even have positive expectancy here. <strong className="text-white">TREND</strong> rewards PX continuations. <strong className="text-white">RANGE</strong> rewards TS reversals. <strong className="text-white">VOLATILE</strong> punishes both &mdash; reduce size or skip entirely. Plus the transition state: SHIFTING TO X means the regime is unstable and signals are less reliable. Filter 1 (Regime Fit) lives mostly in this row.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SECOND 4  ·  LAST SIGNAL  ·  freshness</p>
              <p className="text-sm text-gray-400 leading-relaxed">Last Signal row shows direction, bars-ago count, status (FRESH, JUST FIRED, ACTIVE), and engine tag (PX or TS). The engine tag matters &mdash; it tells you which playbook applies (Lessons 11 and 12). Bars-ago tells you whether you&apos;re still inside the optimal entry window or chasing a stale signal &mdash; signals older than 5-8 bars are usually too late to enter at original R.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SECOND 5  ·  CONDITIONS  ·  live conviction</p>
              <p className="text-sm text-gray-400 leading-relaxed">Live Conditions panel shows four mini-bars: Trend, Momentum, Volume, Tension. Read them as the four conviction factors with live data. <strong className="text-white">Trend MODERATE + Momentum SURGING + Volume QUIET + Tension BUILDING</strong> = 3/4 alignment, Strong tier. If three or more bars are deep teal, conviction is high. If half are amber/empty, conviction is marginal &mdash; and your size or your skip-discipline kicks in.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY 5 SECONDS, NOT 30</p>
            <p className="text-sm text-gray-400 leading-relaxed">Decisions have a half-life. The longer you stare at a fired signal, the more you start manufacturing reasons to take it (FOMO) or skip it (paralysis). <strong className="text-white">Five seconds is enough to read the data, not enough to invent a story.</strong> If after 5 seconds the answer isn&apos;t clear, the answer is SKIP. The clear takes are clear inside the window.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The Three Filter Dimensions === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Three Filters</p>
          <h2 className="text-2xl font-extrabold mb-4">Three dimensions. AND-gated. No exceptions.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Skip Pile concept needs a mechanism. Here it is. Every fired signal must clear three independent filter dimensions to qualify as a trade. Filter 1 is <strong className="text-white">Regime Fit</strong> &mdash; does the pattern work in this regime. Filter 2 is <strong className="text-white">Structure</strong> &mdash; is structural context with or against. Filter 3 is <strong className="text-white">Conviction</strong> &mdash; how many factors aligned. Pass all three: take. Fail any one: skip.</p>
          <ThreeFiltersAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through the three filters. Each has its own checkpoint, its own core question, and its own pass/fail criteria. They feed an AND gate at the bottom &mdash; only signals that clear all three reach the TAKE pile. <strong className="text-amber-400">If any filter blocks, no further evaluation matters.</strong> This is the central mental model of the lesson; everything that follows is detail on the three filters.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FILTER 1  ·  REGIME FIT  ·  S05</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reads the Regime row. TREND/RANGE/VOLATILE plus transition state. PX continuations have positive expectancy in TREND, marginal in RANGE, negative in VOLATILE. TS reversals invert &mdash; positive in RANGE, marginal in TREND (only at exhaustion), negative in VOLATILE. <strong className="text-white">If you&apos;re trying to trade against the regime, the engine math is fighting you.</strong> Filter 1 catches that immediately. Section 5 covers the regime fit matrix in full.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FILTER 2  ·  STRUCTURE  ·  S06</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reads the chart context that CIPHER&apos;s engine output doesn&apos;t directly express. <strong className="text-white">Is there a fresh counter-direction FVG between price and the next obvious target? Is there untested liquidity above your stop? Is the Pulse choppy?</strong> A signal that fires correctly into a wall of opposing structure is technically valid and structurally doomed. Filter 2 catches the doomed-from-context fires. Section 6 covers structure reading.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FILTER 3  ·  CONVICTION TIER  ·  S07</p>
              <p className="text-sm text-gray-400 leading-relaxed">Reads the Conditions panel. Four binary factors: Ribbon stacked, ADX&gt;20, Volume&gt;1.0&times;, Momentum health&gt;50%. Score 3+/4 = Strong (the &ldquo;+&rdquo; marker). Score 2/4 = Standard tier. Score 0-1 = filtered out automatically when Strong-Only is on. <strong className="text-white">Conviction is the engine&apos;s own confidence read.</strong> Lower conviction needs higher proof from Filters 1 and 2 to compensate. Section 7 covers conviction in detail.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY AND, NOT OR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Operators who use OR-logic (any one filter clean = take it) talk themselves into trades. The math says AND. <strong className="text-white">Failing one filter is enough to skip even when the other two are pristine.</strong> A perfect-conviction signal in the wrong regime is still a wrong-regime signal &mdash; the engine math is fighting you regardless of conviction. Same for perfect regime against fresh counter-structure. AND-gating is mathematically aligned with empirical edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EXCEPTION THAT DOESN&apos;T EXIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Beware the &ldquo;but this is different&rdquo; trade &mdash; the signal that fails one filter but you take anyway because of a story you tell yourself. <strong className="text-white">Every story you tell yourself about why this filter-failing signal is still good is the brain&apos;s way of bypassing discipline.</strong> The filters are AND-gated for a reason. Trust the mechanism, especially when it costs you a signal you wanted to take.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE NEXT FIVE SECTIONS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Sections 5, 6, and 7 cover each filter in operational detail &mdash; what to read, what passes, what fails, with examples. Section 8 puts them together as a decision matrix. Section 9 covers <strong className="text-white">Hard Skip Criteria</strong> &mdash; rules that override the filter logic when triggered. By the end of S09, the framework is complete.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Filter 1: Regime Fit === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Filter 1: Regime Fit</p>
          <h2 className="text-2xl font-extrabold mb-4">Match the signal type to the regime</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER detects three regimes &mdash; <strong className="text-white">TREND, RANGE, VOLATILE</strong> &mdash; from the underlying ADX-driven math (line 502 of the Pine: <code className="text-amber-400 font-mono text-xs">regime = trend_pct &gt;= range_pct and trend_pct &gt;= volatile_pct ? &quot;TREND&quot; : volatile_pct &gt;= range_pct ? &quot;VOLATILE&quot; : &quot;RANGE&quot;</code>). Each regime has different signal-pattern expectancy. <strong className="text-amber-400">Trying to trade the wrong pattern in the wrong regime fights the math.</strong> Filter 1 catches that immediately.</p>
          <RegimeFitAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the cards cycle. Each regime has a winning signal type, a losing signal type, and a verdict. <strong className="text-white">TREND rewards continuation logic. RANGE rewards reversal logic. VOLATILE punishes both.</strong> The Regime row in your Command Center tells you which column you&apos;re in &mdash; everything else flows from that read.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TREND  ·  trade WITH the trend</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row reads <strong className="text-white">▲ BULL TREND</strong> or <strong className="text-white">▼ BEAR TREND</strong>. ADX is elevated, Pulse is holding direction, Ribbon is stacked. <strong className="text-white">PX continuations are the high-edge pattern here</strong> &mdash; each Pulse flip in trend direction is a fresh continuation entry. Counter-trend TS at exhaustion (deep stretch, post-extended-move) is the lower-frequency but high-conviction variant. Counter-trend PX is the wrong tool &mdash; if Pulse is flipping against the bull trend, that&apos;s a CHOP signal masquerading as a reversal.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANGE  ·  trade snap-backs</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row reads <strong className="text-white">↔ RANGING</strong> with guidance like RANGE HOLDING or COILING. ADX is low, price is bracketed by clear S/R levels. <strong className="text-white">TS reversals dominate</strong> &mdash; price stretches to the band edges and snaps back. PX continuations frequently fail in range because Pulse flips at the band edges and reverses 5-8 bars later. <strong className="text-amber-400">Any PX in RANGE deserves extra scrutiny on Filter 2 (structure) and Filter 3 (conviction)</strong> &mdash; the regime is fighting you, you need overwhelming compensation from the other filters.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VOLATILE  ·  reduce or skip both</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row reads <strong className="text-white">⚡ VOLATILE</strong> with guidance STAY CAUTIOUS or REDUCE SIZE. ADX is mid but ATR is elevated &mdash; big random swings, news-driven moves, gap-and-go behaviour. <strong className="text-white">Both PX and TS underperform here.</strong> Continuation signals fade fast because the volatility re-reverses; reversal signals get steamrolled because the snap-backs don&apos;t hold. Default action: skip. If you must trade, halve your size and tighten your stops &mdash; but the math says even that has marginal edge.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">REGIME TRANSITION STATES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row guidance can also read <strong className="text-white">SHIFTING TO X</strong> (probability &gt; 75%) or <strong className="text-white">X FORMING</strong> (probability &gt; 50%). These are <strong className="text-amber-400">unstable states</strong> &mdash; the engine is mid-transition. Any signal that fires during transition is at higher risk because the underlying regime expectancy is itself shifting. Treat transitions as a Filter 1 fail unless the transition direction explicitly favours your signal (e.g. SHIFTING TO TREND with a fresh PX in the new direction).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING REGIME IN ONE GLANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Toggle the Regime row ON in your Command Center inputs (it&apos;s OFF by default to keep the panel compact). Once on, it&apos;s the single most informative row for skip-discipline. <strong className="text-white">Color coding: TEAL = TREND, AMBER = RANGE, MAGENTA = VOLATILE.</strong> Transition guidance text turns AMBER. Read regime BEFORE every signal decision &mdash; it determines which patterns are even valid candidates.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">FILTER 1 IN PRACTICE</p>
            <p className="text-sm text-gray-400 leading-relaxed">If the Regime row says VOLATILE, your default is SKIP &mdash; full stop. If it says RANGE and a PX just fired, default to SKIP unless the structure read is unusually clean. If it says TREND and a counter-trend TS just fired, only take it on confirmed deep stretch + exhaustion confluence. <strong className="text-white">Match the signal pattern to the regime, or skip.</strong> The match-rate is the foundation of every other filter.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Filter 2: Structure === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Filter 2: Structure</p>
          <h2 className="text-2xl font-extrabold mb-4">Read what CIPHER cannot see</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER reads price action through its math layers &mdash; Pulse, Tension, Ribbon, conviction factors. It does not see the wider structural landscape your eyes see. <strong className="text-amber-400">Fresh fair value gaps. Untested swing highs. Recently-flipped levels that should be holding as new support but are about to be retested.</strong> Filter 2 brings that structural read in &mdash; the human input that complements the engine output.</p>
          <StructureAgreementAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation cycle through three structural skip-conditions. <strong className="text-white">Counter-FVG above your stop. Untested liquidity in the move&apos;s path. Choppy Pulse.</strong> In each case the signal fired correctly &mdash; the engine math passed &mdash; but structure is fighting you. The signal goes to the SKIP pile.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">COUNTER-FVG OR FRESH IMBALANCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Fair Value Gap that opposes your trade direction, sitting between current price and your target zone. Bull FVG above your short&apos;s stop = magnet pulling price up to fill. Bear FVG below your long&apos;s target = wall blocking the move. <strong className="text-white">Price typically retests an unfilled FVG before continuing</strong> &mdash; meaning your stop is more likely to take a wick before the move resumes. If you can see a fresh counter-direction FVG within 1.5R of entry, default to SKIP. Use Cipher Imbalance (the Reversal preset enables it) to make these visible.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">UNTESTED LIQUIDITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A recent swing high or low that hasn&apos;t been swept yet. Algo and institutional flow hunts liquidity at these levels &mdash; price moves <em>toward</em> them, not away. <strong className="text-white">Buy-side liquidity above your short means price likely sweeps up before reversing.</strong> Sell-side liquidity below your long means price likely sweeps down before continuing. The signal still might play out &mdash; but the path is going to take you through the stop first. Skip or wait for the sweep to complete.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CHOPPY PULSE (HARD FLAG)</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER computes <code className="text-amber-400 font-mono text-xs">pulse_choppy</code> internally as &ldquo;3+ Pulse flips in last 20 bars&rdquo;. When true, the Pulse row reads <strong className="text-white">⚠ CHOPPY  &middot;  → SIGNALS UNRELIABLE</strong>. This is the engine itself telling you the structural environment is too noisy for clean reads. <strong className="text-amber-400">Treat this as a hard skip on every fired signal until choppy clears</strong> (4-5 stable Pulse bars without a flip). The engine is already filtering its own confidence; your job is to listen.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECENTLY-FLIPPED S/R</p>
              <p className="text-sm text-gray-400 leading-relaxed">A level that was support two days ago and is now resistance is structurally unproven &mdash; price hasn&apos;t had time to confirm the role-reversal. A long signal pushing into freshly-flipped resistance overhead is structurally risky; a short signal pushing into freshly-flipped support below is the same. <strong className="text-white">Wait for at least one clean retest of the new role before trusting the level.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">USING CIPHER&apos;S STRUCTURE LAYERS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Toggle on Cipher Spine for SMC-style structure (BOS, CHoCH, internal/external structure). Toggle on Cipher Imbalance for FVGs and IFVGs. Toggle on Cipher Risk Envelope to visualise where stops should sit relative to the volatility cloud. <strong className="text-white">The Reversal preset turns all three on at once</strong> &mdash; recommended for any operator running TS or doing structural reads.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">FILTER 2 IN PRACTICE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Before clicking the order, scan the chart 1.5R in your trade direction. <strong className="text-white">If your eyes see a fresh FVG, untested liquidity, or a not-yet-confirmed level in the path, skip.</strong> Then check the Pulse row. If it reads CHOPPY, hard skip regardless of signal type. The structure read is fast &mdash; 2-3 seconds &mdash; but it&apos;s the difference between trades that work and trades that work-but-stop-out-first.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Filter 3: Conviction Tier === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Filter 3: Conviction Tier</p>
          <h2 className="text-2xl font-extrabold mb-4">The engine&apos;s own confidence read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER scores every signal on four binary conviction factors: <strong className="text-white">Ribbon Stack</strong> (trend engine aligned with signal), <strong className="text-white">ADX &gt; 20</strong> (trend strength), <strong className="text-white">Volume &gt; 1.0&times;</strong> (institutional footprint), <strong className="text-white">Momentum health &gt; 50%</strong>. Sum determines tier. The Pine math: <code className="text-amber-400 font-mono text-xs">bull_conviction = (conv_bull_ribbon ? 1 : 0) + (conv_adx ? 1 : 0) + (conv_volume ? 1 : 0) + (conv_health ? 1 : 0)</code>. Score 3+/4 is the &ldquo;Strong&rdquo; tier &mdash; the &ldquo;+&rdquo; mark on the triangle.</p>
          <ConvictionTierAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four scenarios cycle. Full Strong (4/4), Strong (3/4), Standard (2/4), and Filtered (&lt; 2/4 with Strong-Only on). <strong className="text-white">The tier directly affects whether the signal even prints, and how to size if it does.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FULL STRONG  ·  4/4  ·  size up</p>
              <p className="text-sm text-gray-400 leading-relaxed">All four conviction factors aligned. Ribbon stacked with signal direction, ADX above 20 (real trend strength), volume above 1.0&times; average (institutional bars present), Momentum health above 50% (price action is healthy in the new direction). <strong className="text-white">This is the highest-edge tier CIPHER produces.</strong> If Filters 1 and 2 also pass, this is a confident size-up trade. Rare &mdash; you might see 1-2 per session on most assets.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRONG (3/4)  ·  the &ldquo;+&rdquo; tier  ·  standard size</p>
              <p className="text-sm text-gray-400 leading-relaxed">Three of four factors aligned. The signal prints with a &ldquo;+&rdquo; suffix (Long+, Short+) and a slightly larger triangle. <strong className="text-white">This is the workhorse tier</strong> &mdash; high edge, reasonable frequency. If you only ever traded Strong+/Long+ signals (Strong-Only ON), your hit rate would be measurably higher than trading every fired signal. Standard size when Filters 1 and 2 also pass.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STANDARD (2/4)  ·  half size or skip</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two factors aligned. Signal prints without the &ldquo;+&rdquo; suffix &mdash; just &ldquo;Long&rdquo; or &ldquo;Short.&rdquo; <strong className="text-white">This is the marginal tier.</strong> Edge exists, but it&apos;s smaller and more dependent on Filters 1 and 2 being unusually clean. Default behaviour: half size, OR skip and wait for Strong tier setups. New operators should default to skipping all Standard signals while building discipline.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BELOW STRONG-ONLY  ·  &lt; 2/4  ·  filtered</p>
              <p className="text-sm text-gray-400 leading-relaxed">When Strong Signals Only is ON (or you&apos;re running Swing Trader / Sniper preset), the engine sets <code className="text-amber-400 font-mono text-xs">min_conviction = 3</code> and signals below 3/4 <strong className="text-white">never print as triangles</strong>. They&apos;re filtered at the engine level. This is structurally distinct from Standard tier &mdash; Standard prints (you have to skip it actively); Filtered never prints (the engine pre-skipped for you).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">READING TIER FROM THE TRIANGLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Every triangle on your chart tells you the tier instantly. <strong className="text-white">&ldquo;Long+&rdquo; or &ldquo;Short+&rdquo; with a larger glow = Strong tier.</strong> Plain &ldquo;Long&rdquo; or &ldquo;Short&rdquo; without the plus = Standard tier. The Conditions panel in the Command Center shows the live conviction factor breakdown if you want to see which specific factors aligned. The tier read takes half a second once you&apos;ve trained for it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">FILTER 3 IN PRACTICE</p>
            <p className="text-sm text-gray-400 leading-relaxed">A practical default: <strong className="text-white">turn Strong Signals Only ON for the first 100 trades.</strong> This forces the engine to filter Standard tier out automatically &mdash; you never see them, you never have to skip them, you never wonder &ldquo;maybe this one will work.&rdquo; After 100 trades, if your hit rate is solid, experiment with adding Standard signals back in selectively (only when Filters 1 and 2 are pristine). Most operators keep Strong-Only on permanently and don&apos;t miss the Standard fires.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Decision Matrix === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Decision Matrix</p>
          <h2 className="text-2xl font-extrabold mb-4">All three filters, in one grid</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three filters with three states each could produce 27 cells. The actual matrix collapses to nine because Structure is binary &mdash; either clean or not &mdash; and a fail on Structure overrides everything. The remaining 3&times;3 (Regime &times; Conviction Tier) tells you the verdict and the size, assuming Structure passes. Memorise this grid; it lives in your head when the 5-second scan completes.</p>
          <DecisionMatrixAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the spotlight cycle through cells. Strong-tier signals in TREND get TAKE+ with up-size. Strong in RANGE gets standard TAKE. Strong in VOLATILE gets half-size or skip. <strong className="text-white">As regime degrades or conviction degrades, the verdict shifts toward SKIP.</strong> Two specific cells are auto-skip: VOLATILE + Standard, VOLATILE + Weak.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE TAKE+ ZONE  ·  TREND + Strong</p>
              <p className="text-sm text-gray-400 leading-relaxed">Top-left of the matrix. <strong className="text-white">TREND regime + Strong (3+/4) conviction.</strong> Maximum edge. PX continuations in confirmed trend with strong conviction is the textbook high-expectancy setup. Up-size your standard position by 25-50%, target the trend continuation, trail with Pulse. This is the cell every operator should weight heaviest in their session targets.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE STANDARD TAKE ZONE  ·  TREND + Standard, RANGE + Strong</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two cells worth normal-size trades. <strong className="text-white">TREND + Standard tier</strong> = trend agreement compensates for marginal conviction; standard size and standard playbook. <strong className="text-white">RANGE + Strong</strong> = TS reversals at high conviction; the snap-back has all four factors plus regime fit. Standard size, snap-candle stop, 1.5R target.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE HALF-SIZE ZONE  ·  RANGE + Standard, VOLATILE + Strong</p>
              <p className="text-sm text-gray-400 leading-relaxed">Yellow cells. <strong className="text-white">RANGE + Standard</strong> = TS reversal with marginal conviction; half size and tighter stops because the conviction is borderline. <strong className="text-white">VOLATILE + Strong</strong> = even strong conviction in volatile regime is high-variance; half size protects against the volatility tax. <strong className="text-amber-400">If you&apos;re early in your CIPHER journey, treat the half-size cells as skip cells.</strong> Build edge in the high-confidence cells first; expand the matrix later.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE SKIP ZONE  ·  any cell with VOLATILE + Standard/Weak, or Weak in any regime</p>
              <p className="text-sm text-gray-400 leading-relaxed">Five cells of the nine route to SKIP. <strong className="text-white">VOLATILE regime + sub-Strong conviction</strong> has negative expected value historically &mdash; the volatility eats the marginal edge. <strong className="text-white">Weak conviction in any regime</strong> means the engine itself is whispering &ldquo;low confidence&rdquo; &mdash; trying to squeeze edge from these is fighting the conviction math. Skip means SKIP &mdash; not skip-but-watch-and-fomo-in-after-it-moves. Skip and move on.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRUCTURE OVERRIDES THE MATRIX</p>
              <p className="text-sm text-gray-400 leading-relaxed">The matrix assumes Filter 2 (Structure) passes. <strong className="text-white">If Structure fails, the verdict is SKIP regardless of the cell.</strong> A perfect TREND + Full Strong signal pushing into a fresh counter-FVG is still a SKIP. A pristine Conviction tier in the right regime with choppy Pulse is still a SKIP. Always Filter 2 first &mdash; if it fails, you don&apos;t even need to look at the matrix.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">USING THE MATRIX IN REAL TIME</p>
            <p className="text-sm text-gray-400 leading-relaxed">Signal fires. 5-second scan reads regime + tension + last signal + conditions. <strong className="text-white">Mental query:</strong> regime row says X, conviction tier reads Y, structure read is clean/not-clean. Find the cell. The cell tells you take/skip and size. <strong className="text-amber-400">If you can&apos;t find the cell in 3 seconds, skip.</strong> Hesitation is the matrix telling you the cell isn&apos;t clearly TAKE.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Hard Skip Criteria === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Hard Skip Criteria</p>
          <h2 className="text-2xl font-extrabold mb-4">Rules that override everything else</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The decision matrix gives you the default verdict. Hard Skip Criteria sit above it &mdash; <strong className="text-amber-400">when triggered, they override the matrix entirely</strong>. Even a TAKE+ cell becomes a SKIP if a hard-skip rule fires. These exist because some conditions invalidate signal expectancy across the board, regardless of how clean the regime / structure / conviction read otherwise looks.</p>
          <HardSkipsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four rules cycle. Each shows the trigger, the engine readout that surfaces it, and the action. <strong className="text-white">Memorise the readouts</strong> &mdash; they&apos;re the fastest way to catch a hard-skip condition during the 5-second scan.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 1  ·  CHOPPY PULSE FLAG</p>
              <p className="text-sm text-gray-400 leading-relaxed">Pulse has flipped 3+ times in the last 20 bars. The Pine computes <code className="text-amber-400 font-mono text-xs">pulse_choppy = (bar_index - flip_bar_3) &lt;= 20</code> and surfaces it in the Pulse row guidance as <strong className="text-white">⚠ CHOPPY  ·  → SIGNALS UNRELIABLE</strong>. <strong className="text-amber-400">When choppy is on, every signal on this asset/TF is suspect</strong> &mdash; the engine math is operating in a regime its assumptions don&apos;t hold for. Skip ALL signals until choppy clears (4-5 stable Pulse bars without a flip).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 2  ·  VOLATILE REGIME (with sub-Strong)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row reads <strong className="text-white">⚡ VOLATILE  ·  → STAY CAUTIOUS</strong> or the header shows <strong className="text-white">→ REDUCE SIZE</strong>. Combined with sub-Strong conviction (less than 3/4), the matrix already routes this to SKIP &mdash; this hard rule reinforces it. <strong className="text-white">VOLATILE alone with Full Strong is the only combination where you might consider half-size; everything else in VOLATILE is skip territory.</strong> The regime is the engine telling you it can&apos;t reliably distinguish signal from noise.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 3  ·  NEWS WINDOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER doesn&apos;t track news &mdash; that&apos;s your economic calendar. <strong className="text-white">Within 30 minutes BEFORE a major release</strong> (FOMC, NFP, CPI, central-bank decisions) and <strong className="text-white">15 minutes AFTER</strong>, signal expectancy collapses because price action is news-driven not pattern-driven. Skip. The fired signals during these windows are pattern-recognition firing on news-noise &mdash; the rule the engine learned doesn&apos;t apply during the announcement. Build the calendar habit: check before every session.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 4  ·  REGIME TRANSITION (SHIFTING TO X)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row guidance reads <strong className="text-white">→ SHIFTING TO X</strong> (transition probability &gt; 75%) or <strong className="text-white">→ X FORMING</strong> (probability &gt; 50%). The regime itself is unstable. <strong className="text-amber-400">During transitions, the regime expectancy is changing under your feet</strong> &mdash; what was a TREND continuation 5 bars ago is now a RANGE-bound chop signal, and you don&apos;t know which expectancy applies. Default action: skip until the new regime stabilises (2-3 bars after transition completes).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 5  ·  TRADING-DAY DRAWDOWN LIMIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">This one isn&apos;t in CIPHER &mdash; it&apos;s yours. <strong className="text-white">Set a daily drawdown limit (typical: 2 consecutive losses or 3% account drawdown).</strong> When hit, skip the rest of the session regardless of how clean any subsequent signal looks. This rule exists because emotional state degrades after losses &mdash; subsequent decisions get progressively worse, and revenge-trading is statistically the largest source of catastrophic days. Hard rule, not negotiable.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIP 6  ·  SAME-DIRECTION TIMEOUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you just took a same-direction signal and stopped out within the last 30-60 minutes, skip the next same-direction fire on the same asset. <strong className="text-white">Two consecutive losses in the same direction is a strong signal that the prevailing context is hostile to that direction</strong> &mdash; either the regime read was wrong, or the structural read was wrong, or both. Cool down for 30+ minutes before re-engaging that direction.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">HARD SKIPS ARE NON-NEGOTIABLE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Hard skips override the decision matrix and your own &ldquo;but this looks really clean&rdquo; instinct. <strong className="text-white">If you find yourself negotiating with a hard skip rule, you&apos;ve already lost the trade.</strong> The rule exists because the situation has historically failed regardless of how it looked at the moment. Treat hard skips as automatic &mdash; flag triggers, hands off keyboard. The fastest way to ruin good filter discipline is treating any of these as &ldquo;guidelines.&rdquo;</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — PX-Specific Skip Rules === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; PX-Specific Skips</p>
          <h2 className="text-2xl font-extrabold mb-4">When a PX should be skipped even if Filters 1, 2, 3 pass</h2>
          <p className="text-gray-400 leading-relaxed mb-6">PX is the structural-flip engine. The three filters cover most skip decisions, but PX has a few specific patterns where the engine fires correctly and the trade still has poor expectancy. Five rules sit on top of the matrix for PX-specifically.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PX 1  ·  THIRD CONSECUTIVE PX SAME DIRECTION IN A ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">Two PX longs in a row is normal trend continuation. <strong className="text-white">Three or more PX longs in a row, especially with diminishing space between them, signals trend exhaustion.</strong> The market is making higher-highs but the conviction-to-distance ratio is degrading. Skip the third+ PX in the same direction; wait for either a clean retracement or a counter-direction TS to fire.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PX 2  ·  PX FIRES INTO PRIOR-MAJOR-PIVOT IMMEDIATELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX Long fires 2-3 bars below a clear weekly or daily prior swing high; PX Short fires just above a swing low. <strong className="text-white">The major pivot is a magnet for liquidity</strong> &mdash; price typically gets pulled into it before continuing or reversing. Even a Strong+ PX can stop out on the wick. Either skip, or move your entry to AFTER the pivot is tested.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PX 3  ·  POST-FAILED-FLIP PX WITHIN 8 BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">If a Pulse flip recently fired but was rejected by the pipeline (Gates 1/2/3 failed) and then the OPPOSITE direction PX fires within 8 bars &mdash; that&apos;s the Failed-Flip Override (Gate 4) catching a V-bottom or W-bottom pattern. <strong className="text-white">These are HIGH-edge by design</strong> (covered in 11.11). Counter-intuition: don&apos;t skip these &mdash; size up. The skip-rule is the inverse: don&apos;t skip them just because they look like &ldquo;reversal-from-failure.&rdquo;</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PX 4  ·  PX BARS-OLD &gt; 8</p>
              <p className="text-sm text-gray-400 leading-relaxed">Last Signal row reads <strong className="text-white">▲ Long  12 bars  →  ACTIVE</strong>. The signal is still &ldquo;active&rdquo; from the engine&apos;s perspective, but you&apos;re entering 12 bars after fire. <strong className="text-white">By that point the original R:R has collapsed</strong> &mdash; price has already moved 50-70% of the typical take-zone. You&apos;re chasing. Skip stale PX entries; wait for the next fresh fire on a retest.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PX 5  ·  STANDARD-TIER PX IN RANGE REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">RANGE + PX is already a Filter 1 borderline (TS reversals are the regime-fit pattern, not PX continuations). Add Standard-tier (only 2/4 conviction) on top, and you have a sub-threshold setup on every dimension. <strong className="text-white">Skip Standard-tier PX in RANGE regime entirely.</strong> The matrix routes this cell to half-size, but the empirical edge is so marginal that defaulting to full skip during the first 100 trades is the smarter approach.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING PX FOR SKIP-DISCIPLINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a PX fires, the question stack is: <strong className="text-white">(1) is this the 3rd+ same-direction PX in a row? (2) is there a major pivot within 1.5R? (3) is this a Gate-4 failed-flip recovery? (4) how old is the bar? (5) is this Standard-tier in RANGE?</strong> Five quick checks, each takes about 1 second. Hit any of skip-criteria 1, 2, 4, or 5 and the answer is skip regardless of the matrix verdict. Hit criterion 3 (failed-flip) and the answer is take-with-confidence.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — TS-Specific Skip Rules === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; TS-Specific Skips</p>
          <h2 className="text-2xl font-extrabold mb-4">When a TS should be skipped even if conditions all pass</h2>
          <p className="text-gray-400 leading-relaxed mb-6">TS is the snap-back engine. The four conditions plus cooldown handle structural validity. The three filters handle context. A few TS-specific patterns sit on top &mdash; situations where the engine math fires correctly but the trade still doesn&apos;t work in practice.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TS 1  ·  COUNTER-TREND TS IN STRONG TREND REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row reads STRONG TREND with high ADX. Tension stretches against the trend, snaps back, TS fires &mdash; but in this regime, snap-backs are <strong className="text-white">retracements, not reversals</strong>. The trend resumes 8-15 bars later and your TS exits at break-even or stops out. <strong className="text-amber-400">Counter-trend TS in STRONG TREND is the single most common loss pattern.</strong> The engine fires because the four conditions passed; the trade fails because the regime context the engine doesn&apos;t see is hostile. Skip.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS 2  ·  TS WITHOUT SNAPPING IN THE TENSION ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">A TS triangle prints, but the Tension row reads RELAXED or BUILDING (not SNAPPING). <strong className="text-white">This is rare and worth investigating.</strong> The Tension row uses a fixed 0.8 ATR threshold; TS uses asset-adaptive thresholds. On stocks (1.2 ATR threshold), you can get a TS without the row showing SNAPPING. On forex (0.8 ATR), if the row isn&apos;t SNAPPING when TS fires, something subtle is off &mdash; check for choppy Pulse, recent regime transition, or an upcoming news event. Skip until you can identify why the row and signal disagree.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS 3  ·  FRESH STRUCTURE BREAK 5 BARS BEFORE THE TS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A clear BOS or CHoCH printed 3-5 bars before the TS fired. <strong className="text-white">The structure break IS the trend &mdash; and the TS is firing into the impulse leg of the new trend</strong>, not at the end of an exhausted move. TS is structurally a counter-impulse trade in this scenario; the snap-back rarely holds against fresh structural conviction. Skip; wait for the impulse to mature and a real exhaustion stretch to develop.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS 4  ·  STANDARD-TIER TS IN VOLATILE REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">VOLATILE regime + Standard tier (2/4) TS = the matrix already routes this to SKIP. Worth surfacing as its own rule because operators frequently misjudge VOLATILE when on fast TFs (5m/15m). <strong className="text-white">A volatile regime on the higher TF (1H/4H) typically translates to fast whipsaws on lower TFs</strong> &mdash; even tier-3 TS on lower TFs gets eaten by the macro volatility. When in doubt: VOLATILE = skip TS.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS 5  ·  TS DURING IMMEDIATE POST-NEWS RECOVERY</p>
              <p className="text-sm text-gray-400 leading-relaxed">15-30 minutes after a major news release, price often makes a sharp move and then retraces &mdash; producing a TS fire on the retracement. <strong className="text-white">This is news-driven mean-reversion, not the engine&apos;s rubber-band pattern.</strong> The retracement often fails 30-60 minutes later as the news&apos;s real interpretation settles. Skip TS in post-news windows even if all four conditions and three filters look pristine.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS 6  ·  TS ON THIN-LIQUIDITY TIMEFRAMES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Asia session on a USD-pair, late-Friday on indices, holiday-thin sessions on most assets. <strong className="text-white">Snap-backs in thin liquidity are typically reversal-traps</strong> &mdash; the wick that triggers TS gets immediately reversed by the next algo run. The four conditions pass; the trade fails because the liquidity context the engine doesn&apos;t see makes the snap-back unsustainable. Skip TS in thin-liquidity periods, especially on retail timeframes.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING TS FOR SKIP-DISCIPLINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">When a TS fires, the question stack is: <strong className="text-white">(1) is this counter-trend in a STRONG TREND? (2) does the Tension row agree (SNAPPING)? (3) was there a fresh structure break in last 5 bars? (4) is this Standard-tier in VOLATILE? (5) are we within 30 mins of news? (6) is liquidity thin right now?</strong> Six checks, ~5 seconds. Hit any one and skip. TS is the higher-false-positive engine of the two; the skip-discipline matters more here than for PX.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Worked Examples === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Worked Examples</p>
          <h2 className="text-2xl font-extrabold mb-4">Three signals. Three filter walks. Three verdicts.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The framework is built. Time to apply it to specific reads. Three real-feeling Command Center snapshots, each running through the three filters in real time, each ending with a different verdict. <strong className="text-amber-400">Internalise the rhythm</strong> &mdash; this is what the 5-second scan looks like when it lands cleanly.</p>
          <WorkedExamplesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch each example resolve. Same engine, same rhythm of checks, three different outcomes. <strong className="text-white">Example 1 (XAUUSD 15m)</strong>: TREND + Strong + clean structure → TAKE. <strong className="text-white">Example 2 (EURUSD 5m)</strong>: RANGE + Standard + clean structure → TAKE half size. <strong className="text-white">Example 3 (BTCUSD 1h)</strong>: VOLATILE + Full Strong + clean structure → SKIP because Filter 1 fails regardless of conviction.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EXAMPLE 1  ·  TAKE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row says TREND, headline guidance is TREND INTACT. Tension row reads BUILDING (the rubber band is loading, not snapping &mdash; consistent with PX continuation). Last Signal: <strong className="text-white">▲ Long+ 2 bars JUST FIRED.</strong> Conditions show 3/4 conviction. Filter 1 passes (TREND + PX continuation). Filter 2 passes (no counter-FVG, no untested liquidity). Filter 3 passes (Strong tier). Decision matrix cell: TREND &times; Strong = TAKE+. <strong className="text-amber-400">Standard size, click.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EXAMPLE 2  ·  TAKE HALF</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row says RANGE, guidance RANGE HOLDING. Tension SNAPPING → REVERSAL ACTIVE. Last Signal <strong className="text-white">▼ Short 4 bars ACTIVE</strong>, only 2/4 conviction (Standard). Filter 1 passes (RANGE + TS reversal = match). Filter 2 passes (clean structure). Filter 3 borderline (Standard tier &mdash; half edge). Decision matrix cell: RANGE &times; Standard = TAKE half. <strong className="text-amber-400">Half size, tighter stop, snap-candle low.</strong> Edge exists, but the conviction is marginal &mdash; size accordingly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EXAMPLE 3  ·  SKIP (despite Full Strong)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Regime row says VOLATILE, guidance STAY CAUTIOUS. Tension STRETCHED. Last Signal <strong className="text-white">▲ Long+ 1 bar JUST FIRED</strong>, full 4/4 conviction. Filter 2 passes. Filter 3 is pristine. <strong className="text-amber-400">Filter 1 fails because VOLATILE + any signal type underperforms in backtests.</strong> The matrix cell VOLATILE &times; Full Strong CAN take half-size, but a hard skip rule (HARD SKIP 2 from S09) overrides &mdash; VOLATILE alone is a skip. The trader who takes this trade because it&apos;s Full Strong is overweighting the conviction filter and underweighting Filter 1. <strong className="text-white">Skip.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PATTERN ACROSS THE THREE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Notice how the verdict isn&apos;t determined by any single dimension. <strong className="text-white">Example 3 has the highest conviction tier of the three and is the only SKIP.</strong> Example 1 has lower conviction (3/4 vs 4/4) and is the cleanest TAKE. The filters AND together &mdash; high conviction can&apos;t compensate for wrong regime, and right regime with low conviction is still take-able at reduced size. The framework rewards multi-dimensional reads, not single-factor maximisation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRACTICE LOOP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Take 20 historical signals on your primary asset. For each, run the three filters mentally. Predict TAKE / TAKE half / SKIP before checking the actual outcome. <strong className="text-white">Tally your filter-correct rate against the actual P&amp;L.</strong> Within 50-100 reps, the scan becomes second-nature and your filter accuracy approaches 80%+. The remaining 20% is judgement on the edge cases &mdash; which the worked examples here help with.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">KEEP THE RHYTHM TIGHT</p>
            <p className="text-sm text-gray-400 leading-relaxed">The 5-second scan + 3-filter walk should feel like one fluid motion: <strong className="text-white">read regime → read tension → read last signal → read conditions → check structure → call cell → decide.</strong> Total elapsed time: 5-8 seconds. If you&apos;re pausing to debate any single read, that&apos;s the moment to skip &mdash; you&apos;re past the clean-decision window.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Timing Skips === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Timing Skips</p>
          <h2 className="text-2xl font-extrabold mb-4">News, sessions, and liquidity</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Some skip-conditions don&apos;t live in CIPHER&apos;s output at all &mdash; they live in the <strong className="text-amber-400">time</strong> the signal fires. News windows. Session opens. Thin-liquidity hours. Holiday markets. The engine fires correctly during these windows; the trade often fails because the price action during them is not produced by the patterns CIPHER models.</p>
          <TimingSkipsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the cursor sweep through a 24-hour day in UTC. The skip windows light up: London open (wait 30 min), NY open (wait 30 min), PM news window (hard skip), NY close (reduce size), Asia thin-liquidity hours (skip retail TFs). <strong className="text-white">Outside the lit windows, normal filter discipline applies.</strong> Inside them, additional skip rules layer on top.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SESSION OPENS  ·  WAIT 30 MIN</p>
              <p className="text-sm text-gray-400 leading-relaxed">London open (07:00-08:00 UTC) and New York open (12:30-13:30 UTC) produce <strong className="text-white">opening drives</strong> &mdash; sharp directional moves that generate fake-out signals as algos fight for the open price. CIPHER&apos;s pattern recognition fires during these spikes but the moves often reverse 30-90 minutes later. Wait 30 minutes after each major open before trusting fired signals. The first 30 minutes is for the pros and the algos.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRE/POST-NEWS WINDOWS  ·  HARD SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Within 30 minutes <strong className="text-white">before</strong> a major release (FOMC, NFP, CPI, rate decisions) and 15 minutes <strong className="text-white">after</strong>, signal expectancy collapses. Price action is news-driven not pattern-driven. CIPHER doesn&apos;t track the news calendar &mdash; that&apos;s your habit. Default before each session: open the economic calendar, identify the high-impact releases for your asset class, mark the windows. Inside those windows: hands off keyboard regardless of what the engine fires.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SESSION CLOSES  ·  REDUCE SIZE OR EXIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Last hour of the NY session (20:00-21:00 UTC) often sees <strong className="text-white">profit-taking unwinds</strong> &mdash; the day&apos;s trend reverses partially as positions close. Signals firing in this window have lower follow-through because the move you&apos;re catching is itself a closing-driven retrace, not a fresh structural pattern. Reduce size 50% or skip entirely on signals 1 hour before session close.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ASIA THIN-LIQUIDITY  ·  SKIP RETAIL TFS</p>
              <p className="text-sm text-gray-400 leading-relaxed">21:00-23:00 UTC on USD-pairs, indices, and crypto sees thin liquidity as European traders log off and Asian flow hasn&apos;t fully picked up. <strong className="text-white">Signals on retail TFs (5m, 15m, 1h) during this window often have erratic follow-through</strong> &mdash; small orders move price unusually far, generating signal-then-fade patterns. Higher TFs (4h+, daily) are mostly fine because they ignore the noise. Skip retail TFs during Asia thin-liquidity unless you&apos;re specifically trading Asia-session pairs (USDJPY, AUD/JPY).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FRIDAY AFTERNOON, EARLY MONDAY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Late Friday (after 18:00 UTC) and very early Monday (before 06:00 UTC) sit in <strong className="text-white">extended-thin-liquidity zones</strong> on top of normal session-close issues. Combined with weekend gap risk on Friday, signal expectancy degrades. Many operators stop trading entirely after Friday 18:00 UTC and resume Monday after Asia close. This is rule, not preference, for swing operators.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ASSET-SPECIFIC TIMING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The above is general. Your primary asset has specific quirks. <strong className="text-white">Gold</strong> moves heavily during London-NY overlap (12:30-16:00 UTC) and stalls afterward. <strong className="text-white">Crypto</strong> moves 24/7 but sees major moves around the US open and on weekends when traditional markets are shut. <strong className="text-white">Stocks</strong> see most of their movement in the first 90 minutes after open and the last 30 minutes before close. Build asset-specific timing maps; the universal rules are just the foundation.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">TIMING DISCIPLINE IN PRACTICE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Before each session: <strong className="text-white">check the economic calendar, mark the news windows</strong>. During the session, glance at the clock before the 5-second scan &mdash; if you&apos;re in a marked window, skip regardless of what the scan says. <strong className="text-amber-400">Timing skips are independent of engine output and matrix verdicts</strong>; they&apos;re a top-layer override. Operators who track timing carefully trade fewer signals, with cleaner expectancy.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Personal Skip Rules === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Personal Skip Rules</p>
          <h2 className="text-2xl font-extrabold mb-4">Your portfolio of skips, built for you</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The three filters and hard-skip criteria are universal. The timing skips are session-and-asset-specific. <strong className="text-amber-400">Personal skip rules are yours alone</strong> &mdash; built from your own data, your own psychology, your own risk frame. They&apos;re the final layer above the framework, and they&apos;re the difference between operators who run a generic system and operators who run a system tuned to themselves.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 1  ·  YOUR DRAWDOWN CIRCUIT BREAKER</p>
              <p className="text-sm text-gray-400 leading-relaxed">After 2 consecutive losses, OR after a 3% account drawdown in a single session, <strong className="text-white">stop trading for the day</strong>. No matter how clean the next signal looks. This rule exists because emotional state degrades after losses, and revenge-trading is the largest source of catastrophic days. Set the rule cold (when you&apos;re not in a drawdown) and follow it warm. <strong className="text-amber-400">The rule that&apos;s easy to follow when you&apos;re calm is the rule that saves you when you&apos;re not.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 2  ·  YOUR BAD-DAY SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">Slept poorly. Sick. Argument with someone before the session. Major life stressor in progress. <strong className="text-white">These are skip-the-session conditions, not trade-with-discipline conditions.</strong> The 5-second scan demands clear, fast judgement; bad-state operators take 15-30 seconds and second-guess. The signals you take in compromised state have measurably lower expectancy than the same signals taken in clear state. Set a self-honesty bar: bad day = no trading.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 3  ·  YOUR ASSET BLACKLIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Some assets just don&apos;t produce edge for you, no matter how clean the engine output. <strong className="text-white">Track per-asset hit rate over your first 200 trades.</strong> Any asset where your hit rate is 10%+ below your average for 30+ trades goes on the blacklist &mdash; you don&apos;t trade it for at least 30 days. Re-test only after that, with reduced size. Keeping a tight asset list (2-4 names you genuinely understand) outperforms casting wide.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 4  ·  YOUR TF BLACKLIST</p>
              <p className="text-sm text-gray-400 leading-relaxed">Same principle but for timeframes. Some operators read 15m beautifully and lose money on 1m. Others see 1h structure clearly but get whipsawed on 5m. <strong className="text-white">Track per-TF hit rate.</strong> If your 1m hit rate is consistently below your 15m hit rate by 15%+, you have a TF mismatch &mdash; skip 1m for that asset. Personal cognitive style varies; the framework works on every TF, but your reading of it doesn&apos;t.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 5  ·  YOUR FOMO COOLDOWN</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a skipped signal moves dramatically in your would-have-been direction, the brain immediately wants to chase the next signal to &ldquo;not miss again.&rdquo; <strong className="text-amber-400">This is the most expensive psychological mistake in this whole framework.</strong> The next signal after a missed-skip is the highest-FOMO signal of your session. Personal rule: 30-minute cooldown after any signal that visibly ran without you. Reset, breathe, return only when emotionally neutral.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RULE 6  ·  YOUR EVENING JOURNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">After every session, write down: <strong className="text-white">how many signals fired, how many you took, the verdicts you assigned, and the actual outcomes.</strong> Skip-discipline emerges from feedback. Without journaling, you remember the trades you took and forget the ones you skipped &mdash; the asymmetric memory bias hurts your filter accuracy. With journaling, you build a calibrated sense of which filter combinations actually predicted your outcomes. 10 minutes per session, compounding for years.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">PERSONAL RULES &gt; UNIVERSAL RULES</p>
            <p className="text-sm text-gray-400 leading-relaxed">The three filters work for everyone. Personal rules work for YOU specifically. <strong className="text-white">Operators with documented personal rules consistently outperform operators running purely on the universal framework</strong> &mdash; not because the personal rules are better than the framework, but because they account for the operator-shaped gaps the framework can&apos;t see. Build your rules over time, refine them quarterly. The personal rule layer is where the operator becomes the operator.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every new operator falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable mistakes appear when operators first start practising skip-discipline. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  TRADING EVERY FIRED SIGNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Sees a triangle, clicks the order. No filtering. Believes the engine &ldquo;has it covered.&rdquo; <strong className="text-white">CIPHER outputs the engine state, not the trade decision.</strong> Trading every fire bypasses the operator&apos;s job entirely &mdash; and operators who try this consistently underperform operators who skip 60-70% of fires. The engine is necessary, not sufficient. The filters are the rest of the job.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  CONFUSING CONVICTION TIER WITH GUARANTEE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A Full Strong (4/4) signal feels like a sure thing. <strong className="text-white">It&apos;s not.</strong> Conviction tier is one of three filters &mdash; not the only filter. Full Strong in VOLATILE regime is still a SKIP. Full Strong with fresh counter-FVG is still a SKIP. The conviction filter tells you the engine&apos;s confidence; it does not override regime fit or structural context. Trading every Full Strong is just a fancier version of Mistake 1.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  ANALYSIS PARALYSIS  ·  SKIP-EVERYTHING MODE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The opposite failure mode. Filter every signal out of existence. Always finds a reason to skip. The skip pile gets full but the take pile stays empty. <strong className="text-white">No edge ever materialises because no trades ever happen.</strong> Discipline is sitting between &ldquo;trade everything&rdquo; and &ldquo;skip everything.&rdquo; If your take rate over 50 fires drops below 15%, you&apos;ve over-corrected &mdash; loosen something on Filter 2 or Filter 3, not Filter 1.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  NEGOTIATING WITH HARD-SKIP RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">&ldquo;The Pulse is choppy, but this signal looks really clean &mdash; let me take a smaller size.&rdquo; <strong className="text-white">No.</strong> Hard skips are non-negotiable for a reason &mdash; they&apos;re the situations where the engine math itself breaks down. Smaller size on a hard-skip is just smaller losses on the same bad expectancy. The right move is no size at all. If you find yourself negotiating with a hard skip, the framework is already losing.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  FOMO-CHASING THE SIGNAL AFTER A SKIP</p>
              <p className="text-sm text-gray-400 leading-relaxed">You skip a signal correctly. Price runs in the would-have-been direction. The brain screams &ldquo;take the next one or you&apos;ll miss again.&rdquo; The next signal is the highest-FOMO signal of the session &mdash; and it&apos;s the worst-edge signal because the operator is decision-impaired by the missed-skip emotion. <strong className="text-amber-400">A 30-minute cooldown after any visible &ldquo;runner&rdquo; isn&apos;t cowardice &mdash; it&apos;s edge preservation.</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  NEVER UPDATING THE PERSONAL RULES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The framework is a starting point, not the end state. <strong className="text-white">Operators who never journal, never review, never refine their personal rules stay at framework-baseline forever.</strong> The operators who pull ahead are the ones who treat their first 200 trades as data, identify the personal patterns the framework can&apos;t see, and codify those patterns into rules. Quarterly review is non-optional for serious skip-discipline. Without it, you&apos;re running someone else&apos;s system in your account.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Skip Discipline Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to the PX Pipeline and TS cheat sheets. Reference it every time a signal fires until the scan becomes second-nature.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Three Filters (AND-Gated)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Filter 1 &middot; Regime Fit</strong> &mdash; pattern-to-regime match (PX in TREND, TS in RANGE).</p>
                <p><strong className="text-white">Filter 2 &middot; Structure</strong> &mdash; no fresh counter-FVG, no untested liq, no choppy Pulse.</p>
                <p><strong className="text-white">Filter 3 &middot; Conviction Tier</strong> &mdash; 4/4 Full Strong, 3/4 Strong (+), 2/4 Standard, &lt;2 filtered.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 5-Second Scan (in order)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">1s &middot; Header</strong> direction + headline action.</p>
                <p><strong className="text-white">2s &middot; Tension</strong> RELAXED / BUILDING / STRETCHED / SNAPPING.</p>
                <p><strong className="text-white">3s &middot; Regime</strong> TREND / RANGE / VOLATILE + transition state.</p>
                <p><strong className="text-white">4s &middot; Last Signal</strong> direction + bars-ago + status + engine tag.</p>
                <p><strong className="text-white">5s &middot; Conditions</strong> 4-factor live conviction.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Decision Matrix (Regime × Conviction)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">TREND &times; Strong</strong> &mdash; TAKE+ up-size &middot; <strong className="text-white">TREND &times; Standard</strong> &mdash; TAKE std</p>
                <p><strong className="text-white">RANGE &times; Strong</strong> &mdash; TAKE std &middot; <strong className="text-white">RANGE &times; Standard</strong> &mdash; TAKE half</p>
                <p><strong className="text-white">VOLATILE &times; Strong</strong> &mdash; TAKE half &middot; <strong className="text-white">VOLATILE &times; Standard/Weak</strong> &mdash; SKIP</p>
                <p><strong className="text-white">Weak in any regime</strong> &mdash; SKIP</p>
                <p>Filter 2 fail overrides matrix &mdash; bad structure = SKIP.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Hard Skip Criteria (override everything)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Choppy Pulse flag &middot; VOLATILE regime &middot; news window &middot; regime transition &middot; daily DD limit &middot; same-direction timeout</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">PX-Specific Skips</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>3rd same-dir PX in row &middot; PX into major pivot &lt;1.5R &middot; bars-old &gt; 8 &middot; Standard PX in RANGE</p>
                <p><strong className="text-white">Failed-flip PX = take with confidence</strong> (Gate 4 V/W bottom).</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">TS-Specific Skips</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>Counter-trend TS in STRONG TREND &middot; row not SNAPPING &middot; fresh BOS within 5b &middot; Standard TS in VOLATILE</p>
                <p>Post-news TS &middot; thin-liquidity TS on retail TFs</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Timing Skips (UTC)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Wait 30 min</strong> after London open (07-08), NY open (12:30-13:30)</p>
                <p><strong className="text-white">Hard skip</strong> 30 min before / 15 min after major news</p>
                <p><strong className="text-white">Reduce size</strong> last hour of NY session (20-21)</p>
                <p><strong className="text-white">Skip retail TFs</strong> Asia thin-liq (21:30-23:00)</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Personal Rules to Build</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Drawdown circuit breaker (2 losses or 3% DD) &middot; bad-day skip &middot; asset blacklist &middot; TF blacklist &middot; FOMO 30-min cooldown &middot; evening journal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Take or Skip &mdash; the Operator&apos;s Drill</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios, each putting you in front of a real-feeling Command Center read. Filter dimensions in conflict. Hard-skip rules vs perfect-looking signals. The chase-stale-signal trap. Personal-rule overrides. Pick the right call. Explanations appear after every answer, including for the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Skip Discipline Operator-grade reads installed. You see the failed filter before you see the trade.' : finalScore >= 3 ? 'Solid grasp. Re-read the matrix (S08), the hard-skips (S09), and the personal rules (S14) before the quiz.' : 'Re-study the three filters (S05-S07), the hard-skips (S09), and the PX/TS skip rules (S10-S11) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.13: Which Signals to Take, Which to Skip</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Skip Discipline Operator &mdash;</p>
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
