// app/academy/lesson/cipher-ts-system/page.tsx
// ATLAS Academy — Lesson 11.12: TS 4-Condition System [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Snap Before the Flip — Why Some Stretches Snap and Most Don't
// Covers: tension threshold, snap detection, rejection candle, velocity shift,
//         + asset/TF routing tables + plain-English logic walkthrough
//         + TS in Command Center + Tension Fill anatomy + trading playbook
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
    scenario: 'You\'ve been running CIPHER on AAPL 15m for two weeks. You count three TS signals total. The same period on EUR/USD 15m produced fourteen TS signals. The trader next to you says CIPHER is "broken on stocks."',
    prompt: 'What\'s the correct read?',
    options: [
      { id: 'a', text: 'CIPHER\'s TS code has a stock-specific bug — file a support ticket.', correct: false, explain: 'No bug. Stocks use a 1.2 ATR threshold (vs 0.8 for forex), so the same stretch in absolute terms doesn\'t qualify on stocks. The lower TS frequency on stocks is by design — single-issue noise demands a higher bar before declaring "extreme stretch."' },
      { id: 'b', text: 'TS is asset-class adaptive. Stocks fire fewer TS by design (1.2 ATR threshold vs 0.8 for forex). The frequency difference is the engine working correctly.', correct: true, explain: '✓ Exactly right. ts_min_tension is 0.8 ATR on forex, 1.0 on indices/crypto, 1.2 on stocks. Stocks have idiosyncratic noise that other classes don\'t — earnings, gaps, single-news spikes — so the threshold is intentionally higher. Expect lower TS frequency on stocks. That\'s the engine doing its job, not a defect.' },
      { id: 'c', text: 'Lower the asset threshold input on AAPL to 0.8 ATR to match forex frequency.', correct: false, explain: 'There\'s no input that controls ts_min_tension. The thresholds are hard-coded and asset-routed via syminfo.type. The reason they\'re hard-coded is exactly to prevent operators from tuning themselves into bad signals on noisy asset classes.' },
      { id: 'd', text: 'Stocks need a higher Signal Engine setting to enable TS — switch from "Reversal" to "All Signals."', correct: false, explain: 'The Signal Engine input controls whether TS fires at all (Trend = no TS, Reversal/All = TS enabled), but doesn\'t change the threshold. The lower stock frequency is from the 1.2 ATR threshold, not from any Signal Engine setting.' },
    ],
  },
  {
    id: 'g2',
    scenario: 'Your Tension row reads "▼ SNAPPING → REVERSAL ACTIVE." A bullish candle just closed. You\'re ready to enter long. But no TS triangle has printed.',
    prompt: 'What\'s the right action?',
    options: [
      { id: 'a', text: 'Enter long anyway — the row says SNAPPING, that\'s the trade.', correct: false, explain: 'The Tension row uses a fixed 0.8 ATR threshold to alert you. TS itself uses asset-adaptive thresholds (0.8 / 1.0 / 1.2). The row says "something is happening." The triangle says "TS confirmed it." Trading the row is trading without confirmation that all four conditions passed.' },
      { id: 'b', text: 'Wait. The row is the alert; the triangle is the verdict. SNAPPING without a triangle means at least one of Conditions 1, 3, 4, or cooldown failed.', correct: true, explain: '✓ Correct. The Tension row\'s SNAPPING state is more sensitive than TS itself by design — it\'s the early-warning, not the signal. If no triangle prints, walk the conditions: maybe the candle had too much wick (Condition 3 failed), maybe velocity barely shifted (Condition 4 failed), maybe a same-direction TS fired within cooldown. The engine is saying "not yet."' },
      { id: 'c', text: 'Refresh the chart — TradingView is showing stale data; the triangle is missing.', correct: false, explain: 'CIPHER updates in real time on bar close. The triangle missing isn\'t a rendering issue — it\'s the engine confirming that not all four conditions plus cooldown passed. Refreshing won\'t conjure a signal that the math says wasn\'t there.' },
      { id: 'd', text: 'Switch to a lower TF where the threshold is tighter — TS should fire there.', correct: false, explain: 'Lower TFs have shorter lookback (5 vs 12) and shorter cooldown (8 vs 8 or 12), but the same asset-class threshold for ts_min_tension. Switching TFs gives you a different setup, not the missing TS for the current setup.' },
    ],
  },
  {
    id: 'g3',
    scenario: 'XAU/USD is in a STRONG TREND regime to the downside. The Trend row reads "STRONG" with the bear arrow. Tension stretches deep above Cipher Flow. A snap-back candle prints. TS Short fires with all four conditions passing cleanly.',
    prompt: 'How do you trade this TS?',
    options: [
      { id: 'a', text: 'Take it at standard size — all four conditions passed, that\'s the engine\'s say.', correct: false, explain: 'The conditions did all pass — TS will and should fire here. But in a STRONG TREND, snaps in the trend direction are continuations of the trend, not reversals. The engine fires correctly, but the snap doesn\'t produce a tradeable reversal pattern. STRONG TREND regime overrides per Lesson 13.' },
      { id: 'b', text: 'Skip it. STRONG TREND regime is a documented skip-criterion for counter-bias snap-backs. The TS fired correctly but the setup type isn\'t tradeable.', correct: false, explain: 'Close, but read it again — TS fired SHORT on a bear-trend asset. That\'s WITH the trend, not counter to it. The four conditions plus the trend agreement actually make this a higher-edge setup, not a skip.' },
      { id: 'c', text: 'Take it at up-sized confidence. TS Short with STRONG bear trend = trend agreement. This is closer to the HTF Agreement Playbook than counter-trend.', correct: true, explain: '✓ Right. The trader was set up to expect a "counter-trend" trap but this is the opposite — TS fired in the same direction as the strong trend. Tension stretched UP (counter to bear trend), then snapped DOWN (with trend). That\'s a high-conviction continuation entry on a stretched retracement. Up-sized confidence applies.' },
      { id: 'd', text: 'Wait for PX confirmation before entering — TS in trending markets is too risky.', correct: false, explain: 'Waiting for PX in a STRONG TREND that\'s already moving means entering 10-20 bars later, after the obvious continuation move is done. The TS\'s value here is exactly that it fires early. PX confirmation isn\'t a rule, it\'s a different lesson.' },
    ],
  },
  {
    id: 'g4',
    scenario: 'You\'re trading 15m. TS Long fired six bars ago at the bottom of a deep stretch. Right now, after a brief retest, all four conditions visibly align again — tension was stretched, is now snapping, the candle is a clean bullish rejection, velocity shifted. No TS triangle. You\'re sure the engine missed it.',
    prompt: 'What\'s actually happening?',
    options: [
      { id: 'a', text: 'The engine has a bug with rapid re-fire scenarios — file a support ticket.', correct: false, explain: 'No bug. On 15m intraday TS uses a 12-bar cooldown (intra tier). Six bars after the previous TS Long, the cooldown is still active. The engine is correctly suppressing the second signal even though all four conditions align.' },
      { id: 'b', text: 'Cooldown is still active. ts_cooldown is 12 bars on 15m intraday — six bars in, the next same-direction TS is blocked regardless of conditions.', correct: true, explain: '✓ Exactly. The cooldown is the fifth check no one talks about. (bar_index - ts_last_long_bar) >= ts_cooldown must be true for TS to fire. At 6 bars since last fire on a 12-bar cooldown TF, you\'re still 6 bars away from eligibility. The engine isn\'t broken — it\'s spam-protecting against double-firing the same reversal sequence. This is mistake 6 from the lesson.' },
      { id: 'c', text: 'The four conditions only LOOK aligned — at least one is sub-threshold by a tiny margin.', correct: false, explain: 'Possible but unlikely if all four visibly look clean. The far more common cause when conditions are visually aligned but no triangle prints is the cooldown — it\'s the only check that\'s invisible from the chart. Always check cooldown first.' },
      { id: 'd', text: 'Switch to "All Signals" — you must be in Trend-only mode and TS is suppressed.', correct: false, explain: 'You said TS Long fired six bars ago — it can\'t have fired if Signal Engine were Trend-only. The engine is set correctly. The blocker is the cooldown.' },
    ],
  },
  {
    id: 'g5',
    scenario: 'The Last Signal row reads "▲ Long  4 bars  → ACTIVE  ·  TS." You\'re in the trade. Price is moving in your favour. You need to set a stop.',
    prompt: 'Where does the stop go?',
    options: [
      { id: 'a', text: 'Below Cipher Pulse — same as PX continuation trades.', correct: false, explain: 'PX continuation stops below Pulse because PX trades the structural flip. TS is the snap-before-the-flip — Pulse hasn\'t flipped yet (or just barely has). Pulse is too far from entry to be a useful TS stop, and using it gives the wrong R:R.' },
      { id: 'b', text: 'Below the snap candle low — that\'s the structural invalidation point for a TS reversal.', correct: true, explain: '✓ Right. The snap candle is the bar that prints the rejection — its low (for a long) marks where the snap thesis is invalidated. If price closes back below that level, the snap failed and the trade is wrong. This is also why TS stops are tight — typically much smaller than PX stops.' },
      { id: 'c', text: 'A fixed 1 ATR below entry — distance-based stops are most consistent.', correct: false, explain: 'Distance-based stops ignore structure. A 1 ATR stop on a TS where the snap candle is 0.4 ATR will stop you out on minor noise; a 1 ATR stop where the snap candle is 1.5 ATR will be inside the candle and unrealistic. Structure-based stops (snap candle low) are correct.' },
      { id: 'd', text: 'Below recent swing low — gives more room for the trade to develop.', correct: false, explain: 'Using a wider structural stop turns a TS Standard Reversal (Playbook 1, 1.5R target) into something resembling Playbook 3 (HTF Agreement, 3R target with structure stop). Use that wider stop only when you have HTF agreement context — otherwise you\'ve over-sized your risk.' },
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
    question: 'What is the formula for c_tension?',
    options: [
      { id: 'a', text: '(close - cipher_pulse) / atr', correct: false },
      { id: 'b', text: '(close - cipher_flow) / atr', correct: true },
      { id: 'c', text: '(high - low) / atr', correct: false },
      { id: 'd', text: '(close - sma_50) / atr', correct: false },
    ],
    explain: 'c_tension = (close - cipher_flow) / atr. Tension is measured from Cipher Flow (the underlying baseline), not from Pulse. Pulse is Flow plus or minus an offset; Flow is the truer "mean" the rubber band is anchored to. Result is in ATR units, which makes the value self-normalising across assets.',
  },
  {
    id: 'q2',
    question: 'What is ts_min_tension on FOREX assets like EUR/USD?',
    options: [
      { id: 'a', text: '0.5 ATR', correct: false },
      { id: 'b', text: '0.8 ATR', correct: true },
      { id: 'c', text: '1.0 ATR', correct: false },
      { id: 'd', text: '1.2 ATR', correct: false },
    ],
    explain: '0.8 ATR for forex and commodity CFDs. Indices and crypto use 1.0 ATR. Stocks use 1.2 ATR. The thresholds are calibrated to the typical noise envelope of each asset class — forex has tight ranges so smaller stretches are meaningful.',
  },
  {
    id: 'q3',
    question: 'Condition 3 (Rejection Candle) requires body_ratio > 40%. What does body_ratio measure?',
    options: [
      { id: 'a', text: 'The body of this bar divided by the body of the previous bar.', correct: false },
      { id: 'b', text: 'The body of this bar divided by ATR.', correct: false },
      { id: 'c', text: 'The body of this bar divided by the bar\'s full range (high to low).', correct: true },
      { id: 'd', text: 'The body of this bar divided by Cipher Velocity.', correct: false },
    ],
    explain: 'body_ratio = body / candle_range. It measures how much of the candle is actually body versus wick. A 40% threshold rejects long-wicked indecision bars (which have small bodies relative to total range) while allowing reversal candles that have meaningful wicks but still mostly-body structure.',
  },
  {
    id: 'q4',
    question: 'On 15m intraday, what is ts_cooldown for same-direction TS signals?',
    options: [
      { id: 'a', text: '5 bars', correct: false },
      { id: 'b', text: '8 bars', correct: false },
      { id: 'c', text: '12 bars', correct: true },
      { id: 'd', text: '20 bars', correct: false },
    ],
    explain: 'On the intraday tier (2m-3m TFs), cooldown is 12 bars. Scalp tier (≤1m) and Swing/Position tier (5m+) both use 8 bars. The 12-bar intraday cooldown reflects the wider noise envelope on those TFs — without it, TS would re-fire mid-reversal.',
  },
  {
    id: 'q5',
    question: 'You set the Signal Engine input to "Trend." Will TS triangles appear on your chart?',
    options: [
      { id: 'a', text: 'Yes — Trend mode shows both PX and TS.', correct: false },
      { id: 'b', text: 'No — Trend mode fires PX only and suppresses TS output.', correct: true },
      { id: 'c', text: 'Yes — but only in Strong variant.', correct: false },
      { id: 'd', text: 'Only when Reversal preset is also active.', correct: false },
    ],
    explain: 'Trend mode shows PX only. To see TS at all, set Signal Engine to "Reversal" (TS only) or "All Signals" (PX + TS). Default is Trend, which is why many new operators never see a TS fire on their chart — TS output is engine-suppressed, not threshold-suppressed.',
  },
  {
    id: 'q6',
    question: 'The Tension row shows "SNAPPING" but no TS triangle prints. What\'s the most likely reason?',
    options: [
      { id: 'a', text: 'A bug in the indicator — file a ticket.', correct: false },
      { id: 'b', text: 'The chart needs a refresh.', correct: false },
      { id: 'c', text: 'The row uses a fixed 0.8 ATR threshold; TS uses asset-adaptive thresholds. The row is more sensitive than the signal.', correct: true },
      { id: 'd', text: 'Cooldown always blocks TS when the row says SNAPPING.', correct: false },
    ],
    explain: 'The Tension row\'s SNAPPING state uses a flat 0.8 ATR trigger as an early-warning. TS itself uses 0.8/1.0/1.2 ATR by asset class. So the row can show SNAPPING without TS firing — by design. The row is the alert, the triangle is the verdict. (Cooldown CAN also block, but is less common as the cause.)',
  },
  {
    id: 'q7',
    question: 'Which is the correct stop for a Standard TS Reversal long entry?',
    options: [
      { id: 'a', text: 'Below Cipher Pulse', correct: false },
      { id: 'b', text: 'Below the snap candle low', correct: true },
      { id: 'c', text: '1 ATR below entry, fixed', correct: false },
      { id: 'd', text: 'Below recent swing low', correct: false },
    ],
    explain: 'Below the snap candle low. The snap candle is the bar that prints the rejection — its low is where the snap thesis is invalidated. PX trades stop below Pulse (different engine, different setup). TS + Coil uses the coil low, TS + HTF uses structure — but Standard TS Reversal uses the snap candle low.',
  },
  {
    id: 'q8',
    question: 'Why does TS need an explicit cooldown but PX doesn\'t?',
    options: [
      { id: 'a', text: 'PX is slower than TS, so it doesn\'t need protection.', correct: false },
      { id: 'b', text: 'TS has more false positives, so cooldown filters them.', correct: false },
      { id: 'c', text: 'PX is self-limiting (Pulse only flips once) while tension oscillates continuously, so TS would fire multiple times during a single reversal without cooldown.', correct: true },
      { id: 'd', text: 'TS uses a single condition while PX uses four, so TS needs the extra protection.', correct: false },
    ],
    explain: 'PX is self-limiting structurally — once Pulse has flipped to bull, it can\'t fire another bull PX until it flips bear and back. Tension, by contrast, oscillates continuously. Without an explicit cooldown, TS would fire 3-4 times during a single choppy reversal sequence as tension snaps in and out of threshold. The cooldown is the engineering fix for this.',
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
// ANIMATION 1 — SnapBeforeFlipAnim (S01 Groundbreaking Concept)
// "The Snap Before the Flip"
//
// Single chart segment. One scenario plays out:
//   1. Price stretches BELOW Pulse, tension fill brightens magenta
//   2. Snap-back candle prints — TS Long fires AT the snap
//   3. Price recovers toward Pulse, fill dims
//   4. Price keeps climbing, Pulse line itself flips teal
//   5. PX Long fires LATER, after the structural flip
//   6. Caption: "TS caught the snap at bar X. PX caught the flip at bar Y."
// ============================================================
function SnapBeforeFlipAnim() {
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
    ctx.fillText('THE SNAP BEFORE THE FLIP  ·  TS fires early, PX fires late', w / 2, 22);

    // Generate the price + Pulse story. 60 bars total.
    // bars 0-12: price drifts down hard (stretching below Pulse)
    // bar 13:    snap-back candle (strong bullish reversal) — TS LONG fires
    // bars 14-25: price recovers up toward Pulse
    // bars 26-40: price climbs past Pulse, Pulse flips teal
    // bar 30:    PX LONG fires (after the structural flip)
    // bars 41-60: continues higher
    const N = 60;
    const tsBar = 13;
    const pxBar = 30;

    // Pulse line (smooth, roughly horizontal until late, then climbs after flip)
    const pulseAt = (i: number) => {
      // Pulse is the ratcheting line — for this story it stays around 50 then ratchets up after price clearly goes through it
      if (i <= 26) return 50.5;
      // After bar 26 it starts ratcheting up because price went through it on bar 25-26
      return 50.5 + (i - 26) * 0.45;
    };

    // Price story
    const priceAt = (i: number) => {
      if (i <= 12) {
        // Stretch down: roughly linear decline from 50 to ~42
        const progress = i / 12;
        return 50 - progress * 8 + Math.sin(i * 0.7) * 0.5;
      }
      if (i === 13) {
        // Snap-back candle — strong bullish bar (close way above open)
        return 44; // close after the rejection
      }
      if (i <= 25) {
        // Recovery toward Pulse
        const progress = (i - 13) / 12;
        return 44 + progress * 7.5 + Math.sin(i * 0.6) * 0.4;
      }
      if (i <= 40) {
        // Continue climbing past Pulse
        const progress = (i - 25) / 15;
        return 51.5 + progress * 6 + Math.sin(i * 0.5) * 0.4;
      }
      // Continued climb
      const progress = (i - 40) / (N - 40);
      return 57.5 + progress * 3 + Math.sin(i * 0.4) * 0.3;
    };

    const prices: number[] = [];
    const pulse: number[] = [];
    for (let i = 0; i < N; i++) {
      prices.push(priceAt(i));
      pulse.push(pulseAt(i));
    }

    // Pulse direction: bear (magenta) until bar 26, then bull (teal)
    const pulseDir = (i: number) => (i < 26 ? -1 : 1);

    // Tension at each bar: positive = above pulse, negative = below
    const tension = (i: number) => prices[i] - pulse[i];

    // Reveal animation — 12s loop: 0-9s reveal, 9-12s pause/caption
    const cycleSec = 14;
    const cycleT = t % cycleSec;
    const revealT = Math.min(cycleT / 10, 1);
    const reveal = Math.floor(revealT * (N - 1));

    // Chart bounds
    const chartTop = 38;
    const chartBot = h - 50;
    const chartH = chartBot - chartTop;
    const padX = 30;
    const chartW = w - padX * 2;

    const minP = 41;
    const maxP = 62;
    const yScale = (p: number) => chartBot - ((p - minP) / (maxP - minP)) * chartH;
    const xScale = (i: number) => padX + (i / (N - 1)) * chartW;

    // Draw tension fill (between Pulse and price) for revealed bars
    // Brightness = abs(tension) — brighter when more stretched
    for (let i = 1; i <= reveal; i++) {
      const tn = tension(i);
      const absT = Math.abs(tn);
      const alpha = Math.min(0.45, 0.05 + absT * 0.05);
      const fillColor = tn < 0 ? `rgba(239, 83, 80, ${alpha})` : `rgba(38, 166, 154, ${alpha})`;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(pulse[i - 1]));
      ctx.lineTo(xScale(i), yScale(pulse[i]));
      ctx.lineTo(xScale(i), yScale(prices[i]));
      ctx.lineTo(xScale(i - 1), yScale(prices[i - 1]));
      ctx.closePath();
      ctx.fill();
    }

    // Pulse line (color by direction)
    ctx.lineWidth = 2;
    for (let i = 1; i <= reveal; i++) {
      ctx.strokeStyle = pulseDir(i) === 1 ? TEAL : MAGENTA;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(pulse[i - 1]));
      ctx.lineTo(xScale(i), yScale(pulse[i]));
      ctx.stroke();
    }

    // Price line (white-ish)
    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= reveal; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Snap-back candle highlight at bar 13
    if (reveal >= tsBar) {
      const sx = xScale(tsBar);
      const sy = yScale(prices[tsBar]);
      // Pulsing ring around snap bar
      const pulse_anim = 0.5 + 0.5 * Math.sin(cycleT * 4);
      ctx.strokeStyle = `rgba(38, 166, 154, ${0.4 + pulse_anim * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 8 + pulse_anim * 3, 0, Math.PI * 2);
      ctx.stroke();
      // TS Long triangle (teal triangle pointing up, below the bar)
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
      ctx.fillText('TS', sx, sy + 35);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText('LONG', sx, sy + 44);
    }

    // PX Long marker at bar 30
    if (reveal >= pxBar) {
      const px = xScale(pxBar);
      const py = yScale(prices[pxBar]);
      // Smaller, less-pulsing PX label (it fired AFTER, the story emphasizes earliness of TS)
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(px, py + 14);
      ctx.lineTo(px - 6, py + 24);
      ctx.lineTo(px + 6, py + 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PX', px, py + 35);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText('LONG', px, py + 44);
    }

    // Annotation arrows + labels for the two firing points
    if (reveal >= tsBar && cycleT > 4) {
      const sx = xScale(tsBar);
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SNAP', sx, chartTop + 12);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`bar ${tsBar}`, sx, chartTop + 22);
    }
    if (reveal >= pxBar && cycleT > 7) {
      const px = xScale(pxBar);
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FLIP', px, chartTop + 12);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`bar ${pxBar}`, px, chartTop + 22);
    }

    // Bar gap caption (only after both have fired)
    if (reveal >= pxBar && cycleT > 9) {
      const gap = pxBar - tsBar;
      ctx.fillStyle = AMBER;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`TS at bar ${tsBar}.  PX at bar ${pxBar}.  ${gap} bars apart on the same setup.`, w / 2, h - 28);
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('TS catches the snap. PX confirms the flip. Both real, different timing.', w / 2, h - 14);
    } else {
      // Initial caption guides the viewer
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Watch: tension fill brightens, then snap-back candle, then TS fires...', w / 2, h - 14);
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — TwoPathwaysAnim (S02)
// PX vs TS — two pathways, one signal output
//
// Two parallel lanes feed into a single Long/Short triangle output.
// Top lane: PX (Pulse Cross). Bottom lane: TS (Tension Snap).
// Each lane shows its 4 conditions stacking. When both pathways fire,
// they merge into the same triangle on the chart.
// ============================================================
function TwoPathwaysAnim() {
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
    ctx.fillText('TWO PATHWAYS  ·  ONE SIGNAL OUTPUT', w / 2, 22);

    // Two lanes: PX top, TS bottom
    const laneTop = 44;
    const laneH = (h - 90) / 2;
    const laneGap = 12;
    const pxLaneY = laneTop;
    const tsLaneY = laneTop + laneH + laneGap;

    const padX = 24;
    const laneW = w - padX * 2;

    // 8s cycle: 0-3 PX path lights up, 3-6 TS path lights up, 6-8 both → triangle
    const cycleT = t % 9;

    // Helper to draw a lane background
    const drawLane = (yTop: number, name: string, accent: string, gates: string[], activePhase: number) => {
      // Lane bg
      ctx.fillStyle = `${accent}11`;
      ctx.strokeStyle = `${accent}33`;
      ctx.lineWidth = 1;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(padX + r, yTop);
      ctx.lineTo(padX + laneW - r, yTop);
      ctx.quadraticCurveTo(padX + laneW, yTop, padX + laneW, yTop + r);
      ctx.lineTo(padX + laneW, yTop + laneH - r);
      ctx.quadraticCurveTo(padX + laneW, yTop + laneH, padX + laneW - r, yTop + laneH);
      ctx.lineTo(padX + r, yTop + laneH);
      ctx.quadraticCurveTo(padX, yTop + laneH, padX, yTop + laneH - r);
      ctx.lineTo(padX, yTop + r);
      ctx.quadraticCurveTo(padX, yTop, padX + r, yTop);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lane name
      ctx.fillStyle = accent;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name, padX + 10, yTop + 16);

      // 4 gates as boxes inside the lane
      const gateW = (laneW - 60 - gates.length * 8) / gates.length;
      const gateH = laneH - 40;
      const gatesStartX = padX + 50;
      gates.forEach((g, i) => {
        const gx = gatesStartX + i * (gateW + 8);
        const gy = yTop + 26;
        const isActive = activePhase >= i + 1;
        const filled = isActive;
        ctx.fillStyle = filled ? `${accent}33` : `${accent}11`;
        ctx.strokeStyle = filled ? accent : `${accent}55`;
        ctx.lineWidth = filled ? 1.5 : 1;
        const gr = 4;
        ctx.beginPath();
        ctx.moveTo(gx + gr, gy);
        ctx.lineTo(gx + gateW - gr, gy);
        ctx.quadraticCurveTo(gx + gateW, gy, gx + gateW, gy + gr);
        ctx.lineTo(gx + gateW, gy + gateH - gr);
        ctx.quadraticCurveTo(gx + gateW, gy + gateH, gx + gateW - gr, gy + gateH);
        ctx.lineTo(gx + gr, gy + gateH);
        ctx.quadraticCurveTo(gx, gy + gateH, gx, gy + gateH - gr);
        ctx.lineTo(gx, gy + gr);
        ctx.quadraticCurveTo(gx, gy, gx + gr, gy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = filled ? WHITE : DIM;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(g, gx + gateW / 2, gy + gateH / 2 + 3);
      });
    };

    // PX phase: 0-3s lights up gates 1..4
    const pxPhase = cycleT < 3 ? Math.floor(cycleT * 4 / 3) : (cycleT < 6 ? 4 : 4);
    const tsPhase = cycleT < 3 ? 0 : cycleT < 6 ? Math.floor((cycleT - 3) * 4 / 3) : 4;

    drawLane(pxLaneY, 'PX  ·  PULSE CROSS', TEAL, ['BODY', 'PRE-CROSS', 'CHOP', 'OVERRIDE'], pxPhase);
    drawLane(tsLaneY, 'TS  ·  TENSION SNAP', AMBER, ['STRETCH', 'SNAP', 'CANDLE', 'VELOCITY'], tsPhase);

    // Convergence arrow → triangle output
    const outX = w - 30;
    const outY = (pxLaneY + laneH + tsLaneY) / 2;
    if (cycleT > 6) {
      const flash = 0.5 + 0.5 * Math.sin(cycleT * 5);
      // Output triangle (Long signal)
      ctx.fillStyle = TEAL;
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 10 + flash * 6;
      ctx.beginPath();
      ctx.moveTo(outX, outY - 10);
      ctx.lineTo(outX - 9, outY + 4);
      ctx.lineTo(outX + 9, outY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LONG', outX, outY + 16);
    }

    // Bottom caption — phase-aware
    let caption = '';
    if (cycleT < 3) caption = 'PX pathway: 4 gates around a Pulse cross';
    else if (cycleT < 6) caption = 'TS pathway: 4 conditions around a tension snap';
    else caption = 'Both pathways feed the SAME Long/Short triangle on chart';
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption, w / 2, h - 22);
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('Last Signal row in the Command Center is the only place you see PX vs TS labelled', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — TensionFillAnatomyAnim (S03)
// What you actually see on the chart — the Tension Fill
//
// A chart segment with Pulse + price drifting. Tension fill brightens
// proportional to |c_tension|. Side panel shows live c_tension value.
// Demonstrates the visual feedback loop: brighter fill = more stretched.
// ============================================================
function TensionFillAnatomyAnim() {
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
    ctx.fillText('TENSION FILL ANATOMY  ·  brighter fill = more stretched', w / 2, 22);

    // Chart on left 70%, gauge on right 30%
    const chartW = w * 0.68;
    const gaugeX = chartW + 14;
    const gaugeW = w - chartW - 24;
    const chartTop = 38;
    const chartBot = h - 32;
    const chartH = chartBot - chartTop;

    // Chart frame
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(8, chartTop, chartW, chartH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(8, chartTop, chartW, chartH);

    // Generate price oscillating around a flat-ish Pulse
    const N = 70;
    const prices: number[] = [];
    const pulseLine: number[] = [];
    for (let i = 0; i < N; i++) {
      const phase = (t * 0.4 + i * 0.15);
      // Multi-frequency oscillation that creates clear stretch episodes
      const stretch = Math.sin(phase * 0.8) * 6 + Math.sin(phase * 1.7) * 2;
      prices.push(50 + stretch);
      pulseLine.push(50);
    }

    const minP = 42;
    const maxP = 58;
    const yScale = (p: number) => chartBot - 4 - ((p - minP) / (maxP - minP)) * (chartH - 8);
    const xScale = (i: number) => 12 + (i / (N - 1)) * (chartW - 8);

    // Draw tension fill — between Pulse and price, brightness ∝ |stretch|
    for (let i = 1; i < N; i++) {
      const stretch = prices[i] - pulseLine[i];
      const absS = Math.abs(stretch);
      const alpha = Math.min(0.55, 0.05 + absS * 0.07);
      const fillColor = stretch > 0 ? `rgba(38, 166, 154, ${alpha})` : `rgba(239, 83, 80, ${alpha})`;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(pulseLine[i - 1]));
      ctx.lineTo(xScale(i), yScale(pulseLine[i]));
      ctx.lineTo(xScale(i), yScale(prices[i]));
      ctx.lineTo(xScale(i - 1), yScale(prices[i - 1]));
      ctx.closePath();
      ctx.fill();
    }

    // Pulse line
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xScale(i);
      const y = yScale(pulseLine[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Price
    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse label
    ctx.fillStyle = TEAL;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PULSE', 14, yScale(50) - 4);

    // ── Side gauge: live c_tension ──
    const currentStretch = prices[N - 1] - pulseLine[N - 1];
    const tensionATR = currentStretch / 4; // arbitrary ATR scaling for display

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(gaugeX, chartTop, gaugeW, chartH);
    ctx.strokeStyle = FAINT;
    ctx.strokeRect(gaugeX, chartTop, gaugeW, chartH);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('c_tension', gaugeX + gaugeW / 2, chartTop + 18);

    // Vertical bar gauge
    const barX = gaugeX + gaugeW / 2 - 12;
    const barW = 24;
    const barTop = chartTop + 32;
    const barBot = chartBot - 28;
    const barH = barBot - barTop;
    const midY = (barTop + barBot) / 2;
    // Scale: -2 ATR to +2 ATR
    const gaugeYScale = (v: number) => midY - (v / 2) * (barH / 2);

    // Background bar (full range)
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(barX, barTop, barW, barH);

    // Threshold zones
    ctx.fillStyle = `${MAGENTA}22`;
    ctx.fillRect(barX, barTop, barW, gaugeYScale(1) - barTop);
    ctx.fillStyle = `${MAGENTA}22`;
    ctx.fillRect(barX, gaugeYScale(-1), barW, barBot - gaugeYScale(-1));

    // Threshold lines
    ctx.strokeStyle = `${AMBER}88`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [1, -1].forEach((v) => {
      const ly = gaugeYScale(v);
      ctx.beginPath();
      ctx.moveTo(barX - 4, ly);
      ctx.lineTo(barX + barW + 4, ly);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Mid line
    ctx.strokeStyle = FAINT;
    ctx.beginPath();
    ctx.moveTo(barX - 4, midY);
    ctx.lineTo(barX + barW + 4, midY);
    ctx.stroke();

    // Current value indicator
    const currentY = gaugeYScale(Math.max(-2, Math.min(2, tensionATR)));
    const indicatorColor = Math.abs(tensionATR) > 1 ? MAGENTA : Math.abs(tensionATR) > 0.6 ? AMBER : TEAL;
    ctx.fillStyle = indicatorColor;
    ctx.beginPath();
    ctx.moveTo(barX - 6, currentY);
    ctx.lineTo(barX, currentY - 4);
    ctx.lineTo(barX, currentY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(barX, currentY - 1.5, barW, 3);

    // Live value
    ctx.fillStyle = indicatorColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tensionATR.toFixed(2), gaugeX + gaugeW / 2, barBot + 14);
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('ATR units', gaugeX + gaugeW / 2, barBot + 22);

    // Threshold labels
    ctx.fillStyle = AMBER;
    ctx.font = '7px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+1 thresh', barX - 6, gaugeYScale(1) + 2);
    ctx.fillText('-1 thresh', barX - 6, gaugeYScale(-1) + 2);

    // Bottom caption
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('c_tension = (close - cipher_flow) / atr  ·  fill brightness ∝ |c_tension|', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — TensionRowAnim (S04)
// The Tension row of the Command Center
//
// Shows the row cycling through 4 states: RELAXED → BUILDING → STRETCHED
// → SNAPPING. Each state shows the actual color, label text, and guidance
// text from the Pine source (line 3144-3155).
// ============================================================
function TensionRowAnim() {
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
    ctx.fillText('TENSION ROW  ·  4 states cycle as price stretches and snaps', w / 2, 22);

    // 4 states from Pine line 3148-3151
    const states = [
      {
        name: 'RELAXED',
        dir: '▲',
        guidance: '→ NO PRESSURE',
        labelColor: TEAL,
        guideColor: 'rgba(255,255,255,0.6)',
        desc: 'Price near Pulse. No setup. Wait.',
      },
      {
        name: 'BUILDING',
        dir: '▲',
        guidance: '→ WATCH FOR SNAP',
        labelColor: AMBER,
        guideColor: AMBER,
        desc: 'Price drifting away. Setup forming. Eyes up.',
      },
      {
        name: 'STRETCHED',
        dir: '▼',
        guidance: '→ SNAP LIKELY',
        labelColor: MAGENTA,
        guideColor: AMBER,
        desc: 'Past threshold. Rubber band primed.',
      },
      {
        name: 'SNAPPING',
        dir: '▼',
        guidance: '→ REVERSAL ACTIVE',
        labelColor: MAGENTA,
        guideColor: MAGENTA,
        desc: 'Snap-back in progress. TS may fire this bar.',
      },
    ];

    // Each state lasts 2.5s
    const cycleT = t % (states.length * 2.5);
    const stateIdx = Math.floor(cycleT / 2.5);
    const stateProgress = (cycleT % 2.5) / 2.5;
    const state = states[stateIdx];

    // Draw the row — Command Center style
    const rowTop = 60;
    const rowH = 36;
    const rowW = w - 80;
    const rowX = 40;

    // Row background
    ctx.fillStyle = 'rgba(8, 12, 22, 0.95)';
    ctx.strokeStyle = state.labelColor + '44';
    ctx.lineWidth = 1.5;
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(rowX + r, rowTop);
    ctx.lineTo(rowX + rowW - r, rowTop);
    ctx.quadraticCurveTo(rowX + rowW, rowTop, rowX + rowW, rowTop + r);
    ctx.lineTo(rowX + rowW, rowTop + rowH - r);
    ctx.quadraticCurveTo(rowX + rowW, rowTop + rowH, rowX + rowW - r, rowTop + rowH);
    ctx.lineTo(rowX + r, rowTop + rowH);
    ctx.quadraticCurveTo(rowX, rowTop + rowH, rowX, rowTop + rowH - r);
    ctx.lineTo(rowX, rowTop + r);
    ctx.quadraticCurveTo(rowX, rowTop, rowX + r, rowTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3 cells: Label | State | Action
    const cellW = rowW / 3;

    // Cell 0: Label
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Tension', rowX + 14, rowTop + rowH / 2 + 4);

    // Cell 1: State (centered)
    ctx.fillStyle = state.labelColor;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.dir} ${state.name}`, rowX + cellW + cellW / 2, rowTop + rowH / 2 + 4);

    // Cell 2: Guidance
    ctx.fillStyle = state.guideColor;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(state.guidance, rowX + cellW * 2 + 12, rowTop + rowH / 2 + 4);

    // Pulse highlight on transition (briefly)
    if (stateProgress < 0.15) {
      const flash = (1 - stateProgress / 0.15) * 0.5;
      ctx.fillStyle = state.labelColor + Math.floor(flash * 100).toString(16).padStart(2, '0');
      ctx.fillRect(rowX, rowTop, rowW, rowH);
    }

    // Below the row: state progression dots
    const dotsY = rowTop + rowH + 24;
    const dotSpacing = 60;
    const dotsStartX = w / 2 - (states.length - 1) * dotSpacing / 2;
    states.forEach((s, i) => {
      const dx = dotsStartX + i * dotSpacing;
      const isActive = i === stateIdx;
      ctx.fillStyle = isActive ? s.labelColor : `${s.labelColor}33`;
      ctx.beginPath();
      ctx.arc(dx, dotsY, isActive ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isActive ? WHITE : DIM;
      ctx.font = isActive ? 'bold 8px Inter, sans-serif' : '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, dx, dotsY + 18);
    });

    // Connection lines between dots
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dotsStartX, dotsY);
    ctx.lineTo(dotsStartX + (states.length - 1) * dotSpacing, dotsY);
    ctx.stroke();

    // Description below
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.desc, w / 2, dotsY + 42);

    // Bottom caption — fixed
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Each cell is one color. Three cells: Label | State | Action.', w / 2, h - 12);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — GateStretchAnim (S05 — Condition 1: Was Stretched)
// Asset cycle: forex 0.8, index/crypto 1.0, stock 1.2
// Shows a price walk with the threshold band; lookback window highlighted;
// when ANY bar in the lookback exceeds threshold, gate fires
// ============================================================
function GateStretchAnim() {
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
    ctx.fillText('CONDITION 1  ·  WAS STRETCHED  ·  any bar in lookback past threshold', w / 2, 22);

    // Cycle through asset classes
    const assets = [
      { name: 'FOREX / COMMODITY CFD', threshold: 0.8, note: 'Tight ranges. Modest stretch is meaningful.' },
      { name: 'INDEX / CRYPTO', threshold: 1.0, note: 'Wider swings. Need full ATR of stretch.' },
      { name: 'STOCK', threshold: 1.2, note: 'Single-issue noise. Need most stretch for signal.' },
    ];
    const cycleT = t % (assets.length * 4.5);
    const idx = Math.floor(cycleT / 4.5);
    const asset = assets[idx];

    // Active asset banner
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = w / 2 - 150;
      const bY = 36;
      const bW = 300;
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
    ctx.fillText(`${asset.name}  ·  ts_min_tension = ${asset.threshold.toFixed(1)} ATR`, w / 2, 53);

    // Chart area
    const chartTop = 78;
    const chartBot = h - 50;
    const chartH = chartBot - chartTop;
    const padX = 30;
    const chartW = w - padX * 2;

    // Generate c_tension series with a clear stretch episode
    const N = 50;
    const tension: number[] = [];
    for (let i = 0; i < N; i++) {
      // baseline drift + sin oscillation + a stretch episode
      const phase = i * 0.18;
      const stretch = i > 18 && i < 38 ? -1.4 * Math.sin((i - 18) / 20 * Math.PI) : 0;
      tension.push(Math.sin(phase) * 0.3 + stretch);
    }

    // Y scale: -2 to +2 ATR
    const yScale = (v: number) => chartTop + ((2 - v) / 4) * chartH;
    const xScale = (i: number) => padX + (i / (N - 1)) * chartW;

    // Draw threshold zones
    ctx.fillStyle = `${MAGENTA}11`;
    ctx.fillRect(padX, chartTop, chartW, yScale(asset.threshold) - chartTop);
    ctx.fillRect(padX, yScale(-asset.threshold), chartW, chartBot - yScale(-asset.threshold));

    // Threshold lines
    ctx.strokeStyle = `${AMBER}99`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [asset.threshold, -asset.threshold].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(padX, yScale(v));
      ctx.lineTo(padX + chartW, yScale(v));
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Mid line
    ctx.strokeStyle = FAINT;
    ctx.beginPath();
    ctx.moveTo(padX, yScale(0));
    ctx.lineTo(padX + chartW, yScale(0));
    ctx.stroke();

    // Threshold labels
    ctx.fillStyle = AMBER;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`+${asset.threshold.toFixed(1)} ATR`, padX + 4, yScale(asset.threshold) - 3);
    ctx.fillText(`-${asset.threshold.toFixed(1)} ATR`, padX + 4, yScale(-asset.threshold) + 11);

    // Lookback window indicator (fixed at 8 bars for this anim, sliding)
    const lookback = 8;
    const cursorPhase = (cycleT % 4.5) / 4.5;
    const cursor = Math.max(lookback, Math.floor(cursorPhase * (N - 1)));
    const winStart = cursor - lookback;

    // Window highlight
    ctx.fillStyle = `${AMBER}22`;
    ctx.fillRect(xScale(winStart), chartTop, xScale(cursor) - xScale(winStart), chartH);
    ctx.strokeStyle = `${AMBER}88`;
    ctx.lineWidth = 1;
    ctx.strokeRect(xScale(winStart), chartTop, xScale(cursor) - xScale(winStart), chartH);

    // c_tension line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(tension[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Was stretched? (any bar in window past -threshold)
    let lowestInWindow = Infinity;
    let lowestIdx = -1;
    for (let i = winStart; i <= cursor; i++) {
      if (tension[i] < lowestInWindow) {
        lowestInWindow = tension[i];
        lowestIdx = i;
      }
    }
    const wasStretched = lowestInWindow < -asset.threshold;

    // Mark the lowest point in window
    if (lowestIdx >= 0) {
      const lx = xScale(lowestIdx);
      const ly = yScale(lowestInWindow);
      ctx.fillStyle = wasStretched ? MAGENTA : AMBER;
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Verdict box
    const vY = chartBot + 12;
    ctx.fillStyle = wasStretched ? `${MAGENTA}33` : `${AMBER}22`;
    ctx.strokeStyle = wasStretched ? MAGENTA : AMBER;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, vY, chartW, 22);
    ctx.strokeRect(padX, vY, chartW, 22);
    ctx.fillStyle = wasStretched ? MAGENTA : AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      wasStretched
        ? `LOWEST IN WINDOW = ${lowestInWindow.toFixed(2)} ATR  →  CONDITION 1 PASSES`
        : `LOWEST IN WINDOW = ${lowestInWindow.toFixed(2)} ATR  →  CONDITION 1 NOT YET MET`,
      w / 2,
      vY + 14
    );

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(asset.note, w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — GateSnapAnim (S06 — Condition 2: Snapping Back)
// Shows c_tension series with current bar marked.
// Highlights when c_tension(now) > c_tension(prev) for bull snap
// ============================================================
function GateSnapAnim() {
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
    ctx.fillText('CONDITION 2  ·  SNAPPING BACK  ·  c_tension > c_tension[1]', w / 2, 22);

    // Tension series — stretches negative then recovers
    const N = 50;
    const tension: number[] = [];
    for (let i = 0; i < N; i++) {
      // Smooth descent then bounce
      if (i < 20) tension.push(-i / 20 * 1.6);
      else if (i < 24) tension.push(-1.6 + (i - 20) * 0.05); // flat at bottom
      else tension.push(-1.4 + (i - 24) * 0.075); // recover
    }

    // Cycle: cursor sweeps 0..N-1, repeats
    const cycleT = t % 7;
    const cursorPos = Math.floor((cycleT / 6) * (N - 1));
    const cursor = Math.max(1, Math.min(N - 1, cursorPos));

    const chartTop = 50;
    const chartBot = h - 60;
    const chartH = chartBot - chartTop;
    const padX = 36;
    const chartW = w - padX * 2;

    const yMin = -2;
    const yMax = 0.4;
    const yScale = (v: number) => chartTop + ((yMax - v) / (yMax - yMin)) * chartH;
    const xScale = (i: number) => padX + (i / (N - 1)) * chartW;

    // Background grid
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    [-1.6, -0.8, 0].forEach((v) => {
      ctx.setLineDash(v === 0 ? [] : [3, 3]);
      ctx.beginPath();
      ctx.moveTo(padX, yScale(v));
      ctx.lineTo(padX + chartW, yScale(v));
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Y-axis labels
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0', padX - 4, yScale(0) + 3);
    ctx.fillText('-0.8', padX - 4, yScale(-0.8) + 3);
    ctx.fillText('-1.6', padX - 4, yScale(-1.6) + 3);

    // Tension curve up to cursor
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(tension[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current bar comparison: prev vs now
    const prevVal = tension[cursor - 1];
    const nowVal = tension[cursor];
    const isSnapping = nowVal > prevVal;

    // Highlight prev and now
    const px = xScale(cursor - 1);
    const py = yScale(prevVal);
    const cx = xScale(cursor);
    const cy = yScale(nowVal);

    ctx.fillStyle = DIM;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isSnapping ? TEAL : MAGENTA;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Connecting arrow between prev and now
    ctx.strokeStyle = isSnapping ? TEAL : MAGENTA;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Side panel: comparison
    const panelX = w - 130;
    const panelY = chartTop;
    const panelW = 120;
    const panelH = 80;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = FAINT;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE COMPARE', panelX + 8, panelY + 14);

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('c_tension[1]:', panelX + 8, panelY + 30);
    ctx.fillText('c_tension:', panelX + 8, panelY + 44);

    ctx.fillStyle = WHITE;
    ctx.textAlign = 'right';
    ctx.fillText(prevVal.toFixed(2), panelX + panelW - 8, panelY + 30);
    ctx.fillStyle = isSnapping ? TEAL : MAGENTA;
    ctx.fillText(nowVal.toFixed(2), panelX + panelW - 8, panelY + 44);

    ctx.fillStyle = isSnapping ? TEAL : MAGENTA;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isSnapping ? 'SNAPPING ✓' : 'STILL FALLING ✗', panelX + panelW / 2, panelY + 64);

    // Verdict box
    const vY = chartBot + 14;
    ctx.fillStyle = isSnapping ? `${TEAL}22` : `${MAGENTA}22`;
    ctx.strokeStyle = isSnapping ? TEAL : MAGENTA;
    ctx.lineWidth = 1;
    ctx.fillRect(padX, vY, chartW, 22);
    ctx.strokeRect(padX, vY, chartW, 22);
    ctx.fillStyle = isSnapping ? TEAL : MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isSnapping
        ? `c_tension RISING from previous bar  →  CONDITION 2 PASSES (bull snap)`
        : `c_tension still descending  →  CONDITION 2 NOT MET`,
      w / 2,
      vY + 14
    );

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Single-bar comparison. The recoil starts the moment tension stops growing.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — GateCandleAnim (S07 — Condition 3: Rejection Candle)
// Three candles compared: doji, long-wick indecision, real rejection
// Shows body filter (body > min_body) AND body_ratio (body > 40% range)
// ============================================================
function GateCandleAnim() {
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
    ctx.fillText('CONDITION 3  ·  REJECTION CANDLE  ·  body > min_body  AND  body_ratio > 40%', w / 2, 22);

    // 3 candles, each highlighted in turn (4s per candle)
    const candles = [
      { name: 'DOJI', body: 0.005, range: 0.04, bullish: true, label: 'Tiny body. Indecision.', verdict: 'REJECT', reason: 'Fails body > min_body' },
      { name: 'LONG-WICK', body: 0.025, range: 0.10, bullish: true, label: 'Real body, but most of the candle is wick.', verdict: 'REJECT', reason: 'body_ratio = 25% (need 40%+)' },
      { name: 'REAL REJECTION', body: 0.04, range: 0.06, bullish: true, label: 'Strong body, modest wicks. Conviction.', verdict: 'PASS', reason: 'body_ratio = 67%, conviction confirmed' },
    ];

    const cycleT = t % (candles.length * 4);
    const focusIdx = Math.floor(cycleT / 4);

    // Layout: 3 candles in a row
    const candleAreaTop = 56;
    const candleAreaH = h - candleAreaTop - 80;
    const cardW = (w - 60) / 3;

    candles.forEach((c, i) => {
      const cardX = 16 + i * (cardW + 6);
      const cardY = candleAreaTop;
      const isFocus = i === focusIdx;
      const passes = c.verdict === 'PASS';

      // Card background — focus is brighter
      ctx.fillStyle = isFocus
        ? (passes ? `${TEAL}22` : `${MAGENTA}22`)
        : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus
        ? (passes ? TEAL : MAGENTA)
        : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx.lineTo(cardX + cardW, cardY + candleAreaH - r);
      ctx.quadraticCurveTo(cardX + cardW, cardY + candleAreaH, cardX + cardW - r, cardY + candleAreaH);
      ctx.lineTo(cardX + r, cardY + candleAreaH);
      ctx.quadraticCurveTo(cardX, cardY + candleAreaH, cardX, cardY + candleAreaH - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Candle name
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, cardX + cardW / 2, cardY + 18);

      // Draw the candle
      const candleCX = cardX + cardW / 2;
      const candleAreaH2 = candleAreaH - 70;
      const fullRangeH = candleAreaH2 - 20;
      const rangeUnits = c.range; // in arbitrary "ATR" units, scale to fit
      const scale = fullRangeH / 0.10; // 0.10 ATR = full chart height
      const rangeH = rangeUnits * scale;
      const bodyH = c.body * scale;
      const wickH = (rangeH - bodyH) / 2;

      const candleTop = cardY + 36;
      const wickTop = candleTop + (fullRangeH - rangeH) / 2;
      const bodyTop = wickTop + wickH;
      const bodyBot = bodyTop + bodyH;
      const wickBot = bodyBot + wickH;

      // Wick
      ctx.strokeStyle = c.bullish ? TEAL : MAGENTA;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(candleCX, wickTop);
      ctx.lineTo(candleCX, wickBot);
      ctx.stroke();

      // Body
      const bodyW = 22;
      ctx.fillStyle = c.bullish ? TEAL : MAGENTA;
      ctx.fillRect(candleCX - bodyW / 2, bodyTop, bodyW, Math.max(2, bodyH));
      ctx.strokeStyle = c.bullish ? TEAL : MAGENTA;
      ctx.lineWidth = 1;
      ctx.strokeRect(candleCX - bodyW / 2, bodyTop, bodyW, Math.max(2, bodyH));

      // body_ratio annotation (if focus)
      if (isFocus) {
        const ratio = c.body / c.range;
        ctx.fillStyle = AMBER;
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`body = ${c.body.toFixed(3)} ATR`, candleCX, wickBot + 14);
        ctx.fillText(`body_ratio = ${(ratio * 100).toFixed(0)}%`, candleCX, wickBot + 26);
      }

      // Verdict tag at bottom
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(passes ? '✓ PASS' : '✗ REJECT', cardX + cardW / 2, cardY + candleAreaH - 10);
    });

    // Focus card detail bar at bottom
    const focused = candles[focusIdx];
    const detY = candleAreaTop + candleAreaH + 12;
    ctx.fillStyle = focused.verdict === 'PASS' ? `${TEAL}22` : `${MAGENTA}22`;
    ctx.strokeStyle = focused.verdict === 'PASS' ? TEAL : MAGENTA;
    ctx.lineWidth = 1;
    ctx.fillRect(16, detY, w - 32, 32);
    ctx.strokeRect(16, detY, w - 32, 32);
    ctx.fillStyle = focused.verdict === 'PASS' ? TEAL : MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${focused.name}  ·  ${focused.label}`, w / 2, detY + 14);
    ctx.fillStyle = focused.verdict === 'PASS' ? WHITE : DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(focused.reason, w / 2, detY + 26);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Two filters: body must be real, AND body must dominate the candle range.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — GateVelocityAnim (S08 — Condition 4: Velocity Shift)
// c_velocity sparkline. Shift in one bar must exceed vp50 * 0.2
// Compares: micro-tick (rejected) vs meaningful shift (passes)
// ============================================================
function GateVelocityAnim() {
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
    ctx.fillText('CONDITION 4  ·  VELOCITY SHIFT  ·  Δvelocity > vp50 × 0.2', w / 2, 22);

    // Two scenarios cycle: micro-tick (FAIL) vs real shift (PASS)
    const cycleT = t % 8;
    const isReal = cycleT > 4;
    const phaseT = isReal ? cycleT - 4 : cycleT;

    // Generate velocity series
    const N = 30;
    const velocity: number[] = [];
    for (let i = 0; i < N; i++) {
      // Descend, then either micro-blip or strong reversal
      if (i < 18) {
        velocity.push(-30 - i * 1.5);
      } else {
        const rec = i - 18;
        if (isReal) {
          // Strong reversal — meaningful shift bar 19, then continued recovery
          if (rec === 1) velocity.push(velocity[i - 1] + 25); // big shift
          else velocity.push(velocity[i - 1] + 5);
        } else {
          // Micro-tick — barely budging
          velocity.push(velocity[i - 1] + (rec === 1 ? 3 : 1));
        }
      }
    }

    // Cursor sweeps to bar 21
    const targetBar = 21;
    const cursor = Math.min(targetBar, Math.floor((phaseT / 4) * (targetBar + 1)));

    const chartTop = 56;
    const chartBot = h - 60;
    const chartH = chartBot - chartTop;
    const padX = 30;
    const chartW = w * 0.65;

    const yMin = -65;
    const yMax = 10;
    const yScale = (v: number) => chartTop + ((yMax - v) / (yMax - yMin)) * chartH;
    const xScale = (i: number) => padX + (i / (N - 1)) * chartW;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(padX - 6, chartTop, chartW + 12, chartH);
    ctx.strokeStyle = FAINT;
    ctx.strokeRect(padX - 6, chartTop, chartW + 12, chartH);

    // Mid line
    ctx.strokeStyle = FAINT;
    ctx.beginPath();
    ctx.moveTo(padX, yScale(0));
    ctx.lineTo(padX + chartW, yScale(0));
    ctx.stroke();

    // Velocity line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= cursor; i++) {
      const x = xScale(i);
      const y = yScale(velocity[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight last two bars
    if (cursor >= 1) {
      const prevX = xScale(cursor - 1);
      const prevY = yScale(velocity[cursor - 1]);
      const nowX = xScale(cursor);
      const nowY = yScale(velocity[cursor]);

      const shift = velocity[cursor] - velocity[cursor - 1];
      const vp50 = 30; // for display
      const minShift = vp50 * 0.2;
      const passes = shift > minShift;

      ctx.fillStyle = DIM;
      ctx.beginPath();
      ctx.arc(prevX, prevY, 3, 0, Math.PI * 2);
      ctx.fill();

      if (cursor === targetBar) {
        ctx.fillStyle = passes ? TEAL : MAGENTA;
        ctx.beginPath();
        ctx.arc(nowX, nowY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Shift arrow
        ctx.strokeStyle = passes ? TEAL : MAGENTA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(nowX, nowY);
        ctx.stroke();

        // Shift magnitude label
        ctx.fillStyle = passes ? TEAL : MAGENTA;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Δ = ${shift > 0 ? '+' : ''}${shift.toFixed(1)}`, (prevX + nowX) / 2, prevY - 8);
      } else {
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(nowX, nowY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Side panel: scenario + threshold + comparison
    const panelX = padX + chartW + 20;
    const panelW = w - panelX - 14;
    const panelTop = chartTop;
    const panelH = chartH;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(panelX, panelTop, panelW, panelH);
    ctx.strokeStyle = FAINT;
    ctx.strokeRect(panelX, panelTop, panelW, panelH);

    ctx.fillStyle = isReal ? TEAL : MAGENTA;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isReal ? 'REAL SHIFT' : 'MICRO-TICK', panelX + panelW / 2, panelTop + 16);

    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('vp50 × 0.2 =', panelX + 8, panelTop + 36);
    ctx.fillStyle = AMBER;
    ctx.fillText('+6.0', panelX + 8, panelTop + 48);

    if (cursor === targetBar) {
      const shift = velocity[cursor] - velocity[cursor - 1];
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Actual Δ:', panelX + 8, panelTop + 70);
      ctx.fillStyle = shift > 6 ? TEAL : MAGENTA;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText((shift > 0 ? '+' : '') + shift.toFixed(1), panelX + 8, panelTop + 84);

      ctx.fillStyle = shift > 6 ? TEAL : MAGENTA;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shift > 6 ? 'PASS ✓' : 'REJECT ✗', panelX + panelW / 2, panelTop + panelH - 8);
    }

    // Verdict bar
    if (cursor === targetBar) {
      const shift = velocity[cursor] - velocity[cursor - 1];
      const passes = shift > 6;
      const vY = chartBot + 14;
      ctx.fillStyle = passes ? `${TEAL}22` : `${MAGENTA}22`;
      ctx.strokeStyle = passes ? TEAL : MAGENTA;
      ctx.lineWidth = 1;
      ctx.fillRect(padX - 6, vY, w - (padX - 6) * 2, 22);
      ctx.strokeRect(padX - 6, vY, w - (padX - 6) * 2, 22);
      ctx.fillStyle = passes ? TEAL : MAGENTA;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        passes
          ? 'Shift exceeds threshold → real momentum reversal → CONDITION 4 PASSES'
          : 'Shift below threshold → noise, not momentum → CONDITION 4 REJECTS',
        w / 2,
        vY + 14
      );
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Without this gate: every dead-cat bounce would fire TS.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — CooldownAnim (S09 — Cooldown)
// Bar timeline. TS fires → cooldown counter decrements each bar
// During cooldown: even fully-aligned conditions are blocked
// ============================================================
function CooldownAnim() {
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
    ctx.fillText('COOLDOWN  ·  ts_cooldown bars must elapse before next TS', w / 2, 22);

    // 20-bar timeline. TS fires at bar 4. Cooldown = 8 bars. Eligible again at bar 12.
    // A "would-fire" condition cluster at bar 9 is blocked.
    // Another at bar 14 fires.
    const N = 20;
    const fireBar1 = 4;
    const cooldown = 8;
    const blockedBar = 9; // blocked by cooldown
    const fireBar2 = 14;

    const cycleT = t % 9;
    const cursor = Math.min(N - 1, Math.floor((cycleT / 8) * N));

    // Layout
    const barAreaTop = 56;
    const barAreaH = 50;
    const padX = 24;
    const tlW = w - padX * 2;
    const cellW = tlW / N;

    // Cells
    for (let i = 0; i < N; i++) {
      const cx = padX + i * cellW;
      const cy = barAreaTop;
      const inCooldown = i > fireBar1 && i < fireBar1 + cooldown;
      const isPast = i <= cursor;
      const isFire = (i === fireBar1 || i === fireBar2) && isPast;
      const isBlocked = i === blockedBar && isPast;
      const isCursor = i === cursor;

      let bg = 'rgba(255,255,255,0.03)';
      let border = FAINT;
      if (inCooldown && isPast) {
        bg = `${MAGENTA}11`;
        border = `${MAGENTA}55`;
      }
      if (isFire) {
        bg = `${TEAL}33`;
        border = TEAL;
      }
      if (isBlocked) {
        bg = `${MAGENTA}33`;
        border = MAGENTA;
      }
      if (isCursor) {
        bg = `${AMBER}33`;
        border = AMBER;
      }

      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = isFire || isBlocked || isCursor ? 1.5 : 1;
      ctx.fillRect(cx + 1, cy, cellW - 2, barAreaH);
      ctx.strokeRect(cx + 1, cy, cellW - 2, barAreaH);

      // Bar number
      ctx.fillStyle = isPast ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), cx + cellW / 2, cy + barAreaH - 5);

      // Marker
      if (isFire) {
        // Triangle = TS fired
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.moveTo(cx + cellW / 2, cy + 8);
        ctx.lineTo(cx + cellW / 2 - 5, cy + 18);
        ctx.lineTo(cx + cellW / 2 + 5, cy + 18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.fillText('TS', cx + cellW / 2, cy + 28);
      } else if (isBlocked) {
        // X = blocked
        ctx.strokeStyle = MAGENTA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + cellW / 2 - 4, cy + 10);
        ctx.lineTo(cx + cellW / 2 + 4, cy + 18);
        ctx.moveTo(cx + cellW / 2 + 4, cy + 10);
        ctx.lineTo(cx + cellW / 2 - 4, cy + 18);
        ctx.stroke();
        ctx.fillStyle = MAGENTA;
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BLOCKED', cx + cellW / 2, cy + 30);
      }
    }

    // Cooldown bracket
    if (cursor >= fireBar1) {
      const cdStartX = padX + fireBar1 * cellW + cellW / 2;
      const cdEndX = padX + (fireBar1 + cooldown) * cellW + cellW / 2;
      const cdY = barAreaTop + barAreaH + 14;
      ctx.strokeStyle = MAGENTA;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cdStartX, cdY);
      ctx.lineTo(cdStartX, cdY + 4);
      ctx.lineTo(cdEndX, cdY + 4);
      ctx.lineTo(cdEndX, cdY);
      ctx.stroke();
      ctx.fillStyle = MAGENTA;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`COOLDOWN = ${cooldown} bars`, (cdStartX + cdEndX) / 2, cdY + 18);
    }

    // Caption ribbon at bottom
    let caption = 'Watch: TS fires at bar 4...';
    if (cursor >= fireBar2) caption = 'After cooldown clears, the next valid setup fires at bar 14.';
    else if (cursor >= blockedBar) caption = 'Bar 9: all 4 conditions align — but cooldown is still active. BLOCKED.';
    else if (cursor >= fireBar1) caption = 'TS fired at bar 4. Cooldown counter starts. 8 bars must elapse.';

    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    const capY = h - 40;
    ctx.fillRect(padX, capY, w - padX * 2, 24);
    ctx.strokeRect(padX, capY, w - padX * 2, 24);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption, w / 2, capY + 15);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PX is self-limiting (Pulse only flips once). TS needs the explicit timer.', w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — AssetThresholdRoutingAnim (S10)
// 4-row routing matrix. Cycles spotlight through each asset class.
// ============================================================
function AssetThresholdRoutingAnim() {
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
    ctx.fillText('TS THRESHOLDS BY ASSET CLASS  ·  ts_min_tension', w / 2, 22);

    type Row = { asset: string; subtitle: string; threshold: string; rationale: string };
    const rows: Row[] = [
      { asset: 'FOREX', subtitle: 'EURUSD, GBPUSD, USDJPY', threshold: '0.8 ATR', rationale: 'Tight ranges. Modest stretch is meaningful overextension.' },
      { asset: 'COMMODITY CFD', subtitle: 'XAUUSD, USOIL, WTI', threshold: '0.8 ATR', rationale: 'Same regime as forex — narrow normal-range bands.' },
      { asset: 'INDEX', subtitle: 'NAS100, US30, SPX', threshold: '1.0 ATR', rationale: 'Cleaner trends with bigger swings — full ATR for &ldquo;stretched.&rdquo;' },
      { asset: 'CRYPTO', subtitle: 'BTC, ETH, SOL', threshold: '1.0 ATR', rationale: 'Big wicks but big real moves. Same threshold as indices.' },
      { asset: 'STOCK', subtitle: 'AAPL, TSLA, NVDA', threshold: '1.2 ATR', rationale: 'Single-issue noise + earnings gaps. Need most stretch.' },
    ];

    const cycleT = t % (rows.length * 3.0);
    const spotIdx = Math.floor(cycleT / 3.0);

    const padX = 20;
    const tableTop = 44;
    const headerH = 24;
    const rowH = (h - tableTop - headerH - 50) / rows.length;

    const col0W = 165;
    const col1W = (w - padX * 2 - col0W) * 0.4;
    const col2W = w - padX * 2 - col0W - col1W;

    // Headers
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASSET CLASS', padX + col0W / 2, tableTop + 14);
    ctx.fillText('ts_min_tension', padX + col0W + col1W / 2, tableTop + 14);
    ctx.fillText('WHY', padX + col0W + col1W + col2W / 2, tableTop + 14);

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

      if (isSpot) {
        ctx.fillStyle = `${AMBER}11`;
        ctx.fillRect(padX, ry, w - padX * 2, rowH);
      }

      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, ry + rowH);
      ctx.lineTo(w - padX, ry + rowH);
      ctx.stroke();

      // Asset name + subtitle
      ctx.fillStyle = isSpot ? AMBER : WHITE;
      ctx.font = isSpot ? 'bold 11px Inter, sans-serif' : 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.asset, padX + 10, ry + rowH / 2 - 1);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(r.subtitle, padX + 10, ry + rowH / 2 + 11);

      // Threshold
      ctx.fillStyle = isSpot ? AMBER : DIM;
      ctx.font = isSpot ? 'bold 13px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.threshold, padX + col0W + col1W / 2, ry + rowH / 2 + 4);

      // Why
      ctx.fillStyle = isSpot ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'left';
      const wText = r.rationale.replace('&ldquo;', '"').replace('&rdquo;', '"');
      ctx.fillText(wText, padX + col0W + col1W + 6, ry + rowH / 2 + 3);
    });

    // Spotlight footer
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
    ctx.fillText(`${rows[spotIdx].asset}  ·  ${rows[spotIdx].threshold}`, w / 2, h - 22);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(rows[spotIdx].rationale.replace('&ldquo;', '"').replace('&rdquo;', '"'), w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — TFLookbackRoutingAnim (S11)
// Timeframe routing — lookback + cooldown by TF tier
// ============================================================
function TFLookbackRoutingAnim() {
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
    ctx.fillText('TS BY TIMEFRAME  ·  ts_lookback  ·  ts_cooldown', w / 2, 22);

    type Row = { tf: string; tier: string; lookback: string; cooldown: string; note: string };
    const rows: Row[] = [
      { tf: '15s — 1m', tier: 'SCALP', lookback: '5 bars', cooldown: '8 bars', note: 'Snaps fast. Short window catches them, short cooldown lets next setup fire.' },
      { tf: '2m — 3m', tier: 'INTRA', lookback: '8 bars', cooldown: '12 bars', note: 'Wider noise envelope. Need more lookback, longer cooldown to filter chop.' },
      { tf: '5m — 4h', tier: 'SWING', lookback: '12 bars', cooldown: '8 bars', note: 'Slow setups but each bar is expensive — shorter cooldown so good signals fire.' },
      { tf: '1d+', tier: 'POSITION', lookback: '12 bars', cooldown: '8 bars', note: 'Daily bars are scarce — same as swing tier, prioritise signal availability.' },
    ];

    const cycleT = t % (rows.length * 3.0);
    const spotIdx = Math.floor(cycleT / 3.0);

    const padX = 20;
    const tableTop = 44;
    const headerH = 24;
    const rowH = (h - tableTop - headerH - 50) / rows.length;

    const col0W = 130;
    const col1W = 95;
    const col2W = 95;
    const col3W = w - padX * 2 - col0W - col1W - col2W;

    // Headers
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIMEFRAME', padX + col0W / 2, tableTop + 14);
    ctx.fillText('LOOKBACK', padX + col0W + col1W / 2, tableTop + 14);
    ctx.fillText('COOLDOWN', padX + col0W + col1W + col2W / 2, tableTop + 14);
    ctx.fillText('CHARACTER', padX + col0W + col1W + col2W + col3W / 2, tableTop + 14);

    ctx.strokeStyle = `${AMBER}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, tableTop + headerH);
    ctx.lineTo(w - padX, tableTop + headerH);
    ctx.stroke();

    rows.forEach((r, i) => {
      const ry = tableTop + headerH + i * rowH;
      const isSpot = i === spotIdx;

      if (isSpot) {
        ctx.fillStyle = `${AMBER}11`;
        ctx.fillRect(padX, ry, w - padX * 2, rowH);
      }

      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, ry + rowH);
      ctx.lineTo(w - padX, ry + rowH);
      ctx.stroke();

      // TF + tier
      ctx.fillStyle = isSpot ? AMBER : WHITE;
      ctx.font = isSpot ? 'bold 11px Inter, sans-serif' : 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.tf, padX + 10, ry + rowH / 2 - 1);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(r.tier, padX + 10, ry + rowH / 2 + 11);

      // Lookback
      ctx.fillStyle = isSpot ? AMBER : DIM;
      ctx.font = isSpot ? 'bold 12px Inter, sans-serif' : 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.lookback, padX + col0W + col1W / 2, ry + rowH / 2 + 4);

      // Cooldown
      ctx.fillStyle = isSpot ? TEAL : DIM;
      ctx.fillText(r.cooldown, padX + col0W + col1W + col2W / 2, ry + rowH / 2 + 4);

      // Note
      ctx.fillStyle = isSpot ? WHITE : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.note, padX + col0W + col1W + col2W + 6, ry + rowH / 2 + 3);
    });

    // Footer
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
    ctx.fillText(`${rows[spotIdx].tf}  ·  lookback ${rows[spotIdx].lookback}  ·  cooldown ${rows[spotIdx].cooldown}`, w / 2, h - 22);
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(rows[spotIdx].note, w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — TSPineWalkAnim (S12)
// Walks through the ts_long Pine expression, lighting up each clause
// ============================================================
function TSPineWalkAnim() {
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
    ctx.fillText('READING ts_long  ·  one clause at a time', w / 2, 22);

    const clauses = [
      { code: 'ts_was_bear_stretch', label: 'CONDITION 1', desc: 'tension reached extreme bear stretch within lookback', color: AMBER },
      { code: 'and ts_snap_bull', label: 'CONDITION 2', desc: 'tension is now rising (rubber band recoiling)', color: TEAL },
      { code: 'and ts_bull_candle', label: 'CONDITION 3', desc: 'rejection candle: bullish + body real + body_ratio > 40%', color: TEAL },
      { code: 'and ts_vel_shift_bull', label: 'CONDITION 4', desc: 'velocity shifted by more than vp50 × 0.2', color: TEAL },
      { code: 'and (bar_index - ts_last_long_bar) >= ts_cooldown', label: 'COOLDOWN', desc: 'no recent TS long firing', color: MAGENTA },
    ];

    const cycleT = t % (clauses.length * 2.5 + 2);
    const phase = Math.floor(cycleT / 2.5);
    const fullLit = cycleT > clauses.length * 2.5;

    // Code block
    const codeTop = 50;
    const codeH = h - codeTop - 90;
    const padX = 24;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(padX, codeTop, w - padX * 2, codeH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(padX, codeTop, w - padX * 2, codeH);

    // Top-line declaration
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('bool ts_long =', padX + 16, codeTop + 22);

    // Render each clause line
    const lineH = (codeH - 36) / clauses.length;
    clauses.forEach((c, i) => {
      const ly = codeTop + 30 + i * lineH;
      const isLit = i <= phase || fullLit;
      const isFocus = i === phase && !fullLit;

      // Focus row background
      if (isFocus) {
        ctx.fillStyle = `${c.color}22`;
        ctx.fillRect(padX + 6, ly + 2, w - padX * 2 - 12, lineH - 4);
      }

      // Code
      ctx.fillStyle = isLit ? WHITE : DIM;
      ctx.font = '11px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('  ' + c.code, padX + 16, ly + lineH / 2 - 2);

      // Description (right-aligned)
      ctx.fillStyle = isLit ? c.color : DIM;
      ctx.font = isLit ? 'bold 8px Inter, sans-serif' : '8px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(c.label, w - padX - 16, ly + lineH / 2 - 2);
      ctx.fillStyle = isLit ? 'rgba(255,255,255,0.7)' : DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(c.desc, w - padX - 16, ly + lineH / 2 + 10);
    });

    // Final verdict
    if (fullLit) {
      const vY = h - 60;
      ctx.fillStyle = `${TEAL}22`;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.5;
      ctx.fillRect(padX, vY, w - padX * 2, 36);
      ctx.strokeRect(padX, vY, w - padX * 2, 36);
      ctx.fillStyle = TEAL;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('All clauses true on the same bar  →  ts_long fires', w / 2, vY + 14);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('Triangle on chart  ·  Last Signal row tagged TS', w / 2, vY + 28);
    } else {
      ctx.fillStyle = clauses[phase] ? clauses[phase].color : DIM;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Evaluating: ${clauses[phase] ? clauses[phase].label : ''}`, w / 2, h - 50);
    }

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('All clauses joined by AND. One miss = no signal.', w / 2, h - 16);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — TSPlaybooksAnim (S13)
// Three trade playbooks visual: entry/stop/target placement
// ============================================================
function TSPlaybooksAnim() {
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
    ctx.fillText('THREE TS PLAYBOOKS  ·  entry, stop, target by setup type', w / 2, 22);

    const plays = [
      { name: 'STANDARD TS REVERSAL', target: '1.5R', stop: 'Below snap candle low', context: 'Single TS in a stretched move. Most common.', color: TEAL },
      { name: 'TS + COIL CONFLUENCE', target: '2.5R', stop: 'Below coil low', context: 'TS fires inside an active Coil Box squeeze. High edge.', color: AMBER },
      { name: 'TS WITH HTF AGREEMENT', target: '3R', stop: 'Below structure', context: 'TS aligned with higher-TF Tension state and bias.', color: MAGENTA },
    ];

    const cycleT = t % (plays.length * 3.5);
    const playIdx = Math.floor(cycleT / 3.5);
    const play = plays[playIdx];

    const cardTop = 44;
    const cardH = h - cardTop - 16;
    const cardW = (w - 60) / 3;

    plays.forEach((p, i) => {
      const cx = 16 + i * (cardW + 6);
      const cy = cardTop;
      const isFocus = i === playIdx;

      ctx.fillStyle = isFocus ? `${p.color}22` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFocus ? p.color : FAINT;
      ctx.lineWidth = isFocus ? 1.5 : 1;
      const r = 5;
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

      // Title
      ctx.fillStyle = isFocus ? p.color : DIM;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cx + cardW / 2, cy + 16);

      // Mini chart visual
      const chartTop = cy + 28;
      const chartBot = cy + cardH - 60;
      const chartH = chartBot - chartTop;
      const chartW2 = cardW - 16;
      const chartX = cx + 8;

      // Snap-down-and-recover line for visual
      ctx.strokeStyle = isFocus ? 'rgba(255,255,255,0.7)' : FAINT;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const samples = 30;
      for (let s = 0; s <= samples; s++) {
        const px = chartX + (s / samples) * chartW2;
        // Down then up
        const phase = s / samples;
        const dip = Math.exp(-Math.pow((phase - 0.45) * 4, 2)) * 0.7;
        const climb = Math.max(0, phase - 0.45) * 0.8;
        const py = chartTop + chartH * (0.45 + dip - climb);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Entry / Stop / Target lines on chart
      // Entry at bottom of dip (~bar 14 of 30)
      const entryX = chartX + chartW2 * 0.5;
      const entryY = chartTop + chartH * 0.92;
      // Stop below
      const stopY = chartTop + chartH * 1.0;
      // Target at top
      const targetY = chartTop + chartH * 0.1;

      // Entry marker
      if (isFocus) {
        ctx.fillStyle = TEAL;
        ctx.beginPath();
        ctx.moveTo(entryX, entryY - 6);
        ctx.lineTo(entryX - 4, entryY + 2);
        ctx.lineTo(entryX + 4, entryY + 2);
        ctx.closePath();
        ctx.fill();

        // Stop dashed line
        ctx.strokeStyle = MAGENTA;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(chartX, stopY);
        ctx.lineTo(chartX + chartW2, stopY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target dashed line
        ctx.strokeStyle = AMBER;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(chartX, targetY);
        ctx.lineTo(chartX + chartW2, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = TEAL;
        ctx.font = '7px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('ENTRY', chartX + chartW2 - 2, entryY - 2);
        ctx.fillStyle = MAGENTA;
        ctx.fillText('STOP', chartX + chartW2 - 2, stopY - 2);
        ctx.fillStyle = AMBER;
        ctx.fillText('TARGET', chartX + chartW2 - 2, targetY - 2);
      }

      // Footer info
      ctx.fillStyle = isFocus ? WHITE : DIM;
      ctx.font = isFocus ? 'bold 9px Inter, sans-serif' : 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Target: ${p.target}`, cx + cardW / 2, cy + cardH - 36);
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(p.stop, cx + cardW / 2, cy + cardH - 22);
      ctx.fillText(p.context, cx + cardW / 2, cy + cardH - 8);
    });

    // Bottom focus banner
    void play; // referenced in card render above
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CipherTSSystemLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.12-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 12</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">TS 4-Condition System<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Why Some Stretches Snap and Most Don&apos;t</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">Tension stretches every day. Most stretches just continue. The few that snap are caught by a four-condition gate that fires BEFORE Pulse flips &mdash; the early-warning signal in the CIPHER engine.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">PX catches the flip. TS catches the snap before the flip.</p>
            <p className="text-gray-400 leading-relaxed mb-4">In Lesson 11 you learned how a Pulse flip becomes a PX signal &mdash; structural break, four pipeline gates, qualified output. PX is the <strong className="text-white">confirmed reversal</strong>. It fires after Pulse has actually changed direction. Beautiful, reliable, and <strong className="text-amber-400">often late.</strong></p>
            <p className="text-gray-400 leading-relaxed mb-4">TS is the other engine. It fires when price is <strong className="text-white">stretched far from the mean and visibly begins to recoil</strong> &mdash; before Pulse formally flips. The rubber-band model: tension builds as price walks away from Cipher Flow, the band stretches taut, and at some point it snaps. TS catches the snap. Not the eventual flip 14 bars later. <strong className="text-amber-400">The snap.</strong></p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where you stop treating the Pulse line as the only thing that triggers a CIPHER signal. The Tension Fill on your chart &mdash; that bright color between Pulse and price &mdash; is its own engine, with its own four conditions, its own asset-class thresholds, and its own playbook. Master it and you stop missing reversals because Pulse hadn&apos;t flipped yet.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE TENSION SNAP PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know all <strong className="text-white">four conditions</strong> by name, the asset-class thresholds and timeframe lookbacks they use, why TS needs an explicit cooldown that PX doesn&apos;t, the four states of the Tension row in the Command Center, and exactly how to read a TS signal differently from a PX signal &mdash; including stop placement, target sizing, and which one to take when both fire on the same setup.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Snap Before the Flip (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Snap Before the Flip</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Watch a single setup play out twice on the same chart. The same price action, the same Pulse line, the same Tension Fill. Two signals fire at <strong className="text-amber-400">very different bars</strong>. TS fires when the rubber band recoils. PX fires later, after Pulse has formally turned. The chart is the same. The timing is what changes.</p>
          <SnapBeforeFlipAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Price stretches deep below Pulse, Tension Fill brightens magenta as the stretch grows. At bar 13, a strong bullish rejection candle prints &mdash; <strong className="text-white">TS Long fires immediately</strong>, while Pulse is still pointing down. Price recovers, climbs past Pulse around bar 25, and Pulse itself flips bull. <strong className="text-white">PX Long fires at bar 30.</strong> Same setup. Two signals. <strong className="text-amber-400">17 bars apart.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS MATTERS FOR ENTRY TIMING</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you only trade PX, you enter at bar 30. By then, the move from the bottom is largely done &mdash; price has already recovered 7-8 ATR, Pulse has flipped, and the obvious reversal is now obvious to everyone. <strong className="text-white">If you can read TS, you enter at bar 13</strong> &mdash; with a stop just below the snap low. Same direction, half the risk, much bigger run.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TS IS NOT A SHORTCUT &mdash; IT&apos;S A DIFFERENT TOOL</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX has a near-perfect false-positive rate because of its four-gate pipeline. TS fires earlier, which inherently means more false positives &mdash; some snap-backs continue and don&apos;t reverse. That&apos;s why TS has its own four conditions and an explicit cooldown. It&apos;s a separate engine for a separate market behaviour, not a faster version of PX.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BOTH SIGNALS, ONE OUTPUT</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER doesn&apos;t draw two different triangles. PX and TS feed into the <strong className="text-white">same</strong> Long/Short triangle on the chart. The Last Signal row in the Command Center is the only place you see which engine fired the most recent signal &mdash; tagged PX or TS. The unified output is by design: from a position-management view, both signals trade the same way.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When the Tension Fill is bright and a strong rejection candle prints, you don&apos;t wait for Pulse. You ask <strong className="text-white">did the four conditions just align?</strong> If yes, you&apos;re looking at TS &mdash; the snap before the flip. If you wait for PX confirmation, you&apos;re trading the second-best entry on every reversal.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Two Pathways, One Output === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Two Pathways</p>
          <h2 className="text-2xl font-extrabold mb-4">PX and TS feed the same triangle on your chart</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER&apos;s Signal Engine has two parallel pathways. PX (Pulse Cross) detects structural flips and runs them through four pipeline gates. TS (Tension Snap) detects mean-reversion snaps and runs them through four conditions. <strong className="text-amber-400">Both feed into the same Long/Short triangle output.</strong> You rarely see both fire on the same bar &mdash; PX needs a Pulse flip, TS needs a snap-back, and these are usually exclusive events.</p>
          <TwoPathwaysAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The PX lane lights up its four gates &mdash; Body, Pre-Cross, Chop, Override. The TS lane lights up its four conditions &mdash; Stretch, Snap, Candle, Velocity. Both pathways converge into the same Long triangle on the right. The triangle on your chart doesn&apos;t tell you which engine fired it. <strong className="text-white">The Last Signal row does.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CONTROLLING WHICH ENGINE FIRES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The <strong className="text-white">Signal Engine</strong> input has four modes: <strong className="text-white">All Signals</strong> (PX + TS), <strong className="text-white">Trend</strong> (PX only &mdash; default), <strong className="text-white">Reversal</strong> (TS only), and <strong className="text-white">Visuals Only</strong> (no signals at all, just the visual layers). Most operators run on Trend by default and switch to All Signals or Reversal when they specifically want TS coverage on a ranging asset.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE OUTPUT IS UNIFIED</p>
              <p className="text-sm text-gray-400 leading-relaxed">From a trade-management perspective, both signals trade the same way. Long is long, short is short. The unified output keeps your chart clean and prevents you from second-guessing &mdash; "is this PX or TS?" doesn&apos;t change your entry, your stop, or your size at the moment of action. The differentiation matters for <strong className="text-white">analysis after the fact</strong>, which is why it lives in the Last Signal row, not on the candle.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">HOW THEY ALMOST NEVER COLLIDE</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX needs a Pulse flip. TS needs a tension snap-back. A Pulse flip happens when price closes through the line &mdash; meaning tension is small at that moment. A tension snap happens when tension is large and reversing &mdash; meaning Pulse hasn&apos;t flipped yet. The two engines fire in different parts of the same trade, which is exactly why they&apos;re both useful.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THE LAST SIGNAL ROW</p>
            <p className="text-sm text-gray-400 leading-relaxed">After any signal fires, the Last Signal row shows: direction (▲/▼), label (Long/Short), bars-ago count, and a status &mdash; FRESH, ACTIVE, or aging. The engine tag (PX or TS) appears in the row context. If you don&apos;t know which engine fired the signal you&apos;re currently in, you&apos;re missing a piece of trade-management information &mdash; specifically, where the right stop goes.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Tension Fill Anatomy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Tension Fill</p>
          <h2 className="text-2xl font-extrabold mb-4">The visual you&apos;ve been ignoring</h2>
          <p className="text-gray-400 leading-relaxed mb-6">If you&apos;ve been running CIPHER for any length of time, you&apos;ve seen the Tension Fill &mdash; the colored fill between Pulse and price that brightens and dims as the chart moves. Most operators treat it as decoration. <strong className="text-amber-400">It&apos;s the live rendering of the math TS uses.</strong> Brighter fill, more stretched. The fill is your real-time gauge for setup quality before any signal fires.</p>
          <TensionFillAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Price oscillates around Pulse. The Tension Fill brightens magenta when price stretches BELOW Pulse, brightens teal when price stretches ABOVE. The side gauge shows the live <code className="text-amber-400 font-mono text-xs">c_tension</code> value &mdash; the same number TS uses internally. Threshold lines mark where the fill becomes &ldquo;STRETCHED&rdquo; territory.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">c_tension = (close - cipher_flow) / atr</code>. Price minus Cipher Flow, divided by ATR. The result is in <strong className="text-white">ATR units</strong>, so it&apos;s self-normalising across assets. +1 means price closed one ATR above Flow. -1 means one ATR below. Above ±1.5 is considered overextended for most assets.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY CIPHER FLOW, NOT PULSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A common misread: assuming tension is measured from the Pulse line. It&apos;s not. Tension is measured from <strong className="text-white">Cipher Flow</strong>, the underlying baseline that Pulse is shifted from. Pulse is Flow plus or minus an ATR offset, ratcheted. Flow is the smoother, more central anchor &mdash; the &ldquo;true mean&rdquo; the rubber band is attached to.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE VISUAL FEEDBACK LOOP</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Tension Fill brightness is computed live from <code className="text-amber-400 font-mono text-xs">|c_tension|</code> &mdash; same value TS reads. So when you see the fill go from pale to bright, you&apos;re watching <strong className="text-white">Condition 1 of TS</strong> become true in real time. Faint fill = no setup. Bright fill = setup is forming. Your eyes can preempt the signal by 2-5 bars if you train them.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">TRAIN YOUR EYE FOR FILL BRIGHTNESS</p>
            <p className="text-sm text-gray-400 leading-relaxed">Spend a session watching the Tension Fill on your primary asset, ignoring the signals entirely. Notice when it&apos;s pale (relaxed), faintly tinted (drifting), saturated (stretched). The TS signals fire at the saturation peaks &mdash; almost never at the pale phases. Your intuition for &ldquo;is a snap likely?&rdquo; is the fill brightness, calibrated by hundreds of repetitions.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — The Tension Row of the Command Center === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; The Tension Row</p>
          <h2 className="text-2xl font-extrabold mb-4">Four states. Read them in order.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Command Center has a dedicated Tension row &mdash; toggle on with the &ldquo;Tension&rdquo; checkbox in the COMMAND CENTER input group. It has three cells: <strong className="text-white">Label</strong> (the word &ldquo;Tension&rdquo;), <strong className="text-white">State</strong> (one of four words with a directional arrow), and <strong className="text-white">Action</strong> (a guidance phrase). The state advances through four phases as a setup builds.</p>
          <TensionRowAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The row cycles RELAXED &rarr; BUILDING &rarr; STRETCHED &rarr; SNAPPING. Each state has its own color and its own action text. <strong className="text-white">The state alone tells you the setup phase &mdash; without you having to look at the chart.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">RELAXED &middot; teal &middot; &rarr; NO PRESSURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">|c_tension| below 60% of the asset&apos;s threshold. Price is near Cipher Flow. No setup forming. <strong className="text-white">Action: wait.</strong> Most of your trading time is spent here. The row is teal because there&apos;s nothing dangerous &mdash; no stretch, no snap risk in either direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BUILDING &middot; amber &middot; &rarr; WATCH FOR SNAP</p>
              <p className="text-sm text-gray-400 leading-relaxed">|c_tension| between 60% and 100% of threshold. Price has drifted meaningfully but not yet to extreme. <strong className="text-white">Action: eyes up.</strong> The row turning amber is your &ldquo;something is forming&rdquo; alert &mdash; switch to active monitoring on this asset. The Tension Fill on the chart will be visibly tinted but not saturated yet.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STRETCHED &middot; magenta &middot; &rarr; SNAP LIKELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">|c_tension| past the asset&apos;s threshold (1.0 ATR for index/crypto, 0.8 for forex/commodity, 1.2 for stocks). The setup exists. <strong className="text-white">Action: setup is primed.</strong> TS Condition 1 is now true. You&apos;re waiting on the snap candle. Not all stretches snap &mdash; some continue. But the next 5-12 bars are the window where TS could fire.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SNAPPING &middot; magenta &middot; &rarr; REVERSAL ACTIVE</p>
              <p className="text-sm text-gray-400 leading-relaxed">|c_tension| was past 0.8 ATR and is now reducing. The rubber band is recoiling. <strong className="text-white">Action: TS may fire this bar.</strong> The SNAPPING state uses a fixed 0.8 ATR trigger &mdash; independent of the asset-class threshold &mdash; so the row can show SNAPPING without TS firing. The row is your early warning; the signal is the confirmed event.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE NUANCE WORTH KNOWING</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Tension row&apos;s SNAPPING state is <strong className="text-white">more sensitive</strong> than TS itself. The row uses a flat 0.8 ATR threshold to alert you that something is happening. TS uses asset-adaptive thresholds (0.8 / 1.0 / 1.2) so that signal frequency is calibrated per asset class. This means: <strong className="text-amber-400">the row will sometimes show SNAPPING and TS won&apos;t fire</strong>. That&apos;s not a bug. The row is the warning; the signal is the verdict.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Condition 1: Was Stretched === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Condition 1: Was Stretched</p>
          <h2 className="text-2xl font-extrabold mb-4">Did the rubber band actually stretch?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first condition asks a simple question: <strong className="text-white">within the recent past, did tension reach extreme stretch in the opposing direction?</strong> Look back N bars. Find the most extreme tension reading in that window. If it crossed the asset&apos;s threshold, Condition 1 passes. This is the <strong className="text-amber-400">setup-existed</strong> gate &mdash; without a stretch, there&apos;s nothing to snap.</p>
          <GateStretchAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The amber band slides across the chart &mdash; that&apos;s the lookback window. Inside the window, the lowest tension reading is highlighted. If it crossed the magenta threshold zone, Condition 1 passes. Notice how the threshold itself shifts as the asset class changes &mdash; <strong className="text-white">forex needs less stretch (0.8 ATR), stocks need more (1.2 ATR).</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE CODE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">ts_was_bear_stretch = ta.lowest(c_tension, ts_lookback) &lt; -ts_min_tension</code>. Look back <code className="text-amber-400 font-mono text-xs">ts_lookback</code> bars. Find the lowest c_tension in that window. If it&apos;s below the negative threshold, the bear stretch existed &mdash; eligible for a bull snap. Bull stretch is the mirror.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY A LOOKBACK INSTEAD OF JUST CURRENT BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">A snap doesn&apos;t happen on the same bar tension peaks. There&apos;s typically a 2-5 bar gap between the most-stretched bar and the bar that prints the rejection candle. If Condition 1 only checked the current bar, the snap-back candle would never qualify &mdash; tension is already easing at that moment. The lookback lets the gate &ldquo;remember&rdquo; that the setup existed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THE THRESHOLD VARIES BY ASSET</p>
              <p className="text-sm text-gray-400 leading-relaxed">Forex pairs trade in tight ATR ranges &mdash; even a modest 0.8 ATR stretch is meaningful overextension. Stocks have noisier individual moves and earnings gaps &mdash; you need real distance (1.2 ATR) before calling a stretch &ldquo;extreme.&rdquo; Indices and crypto sit in the middle (1.0 ATR). The thresholds were calibrated empirically &mdash; v1 had them too low, normal oscillation triggered &ldquo;stretched&rdquo; on scalp TFs.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">LOOKBACK ALSO VARIES BY TIMEFRAME</p>
              <p className="text-sm text-gray-400 leading-relaxed">Scalp timeframes (1m and below) use a 5-bar lookback &mdash; snaps happen fast. Intraday (2-3m) uses 8 bars. Swing and Daily use 12 bars. The lookback scales with how slowly setups develop on that TF. We&apos;ll cover the full TF routing in Section 11.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THIS GATE FROM YOUR CHART</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Tension Fill brightness is your visual proxy for Condition 1. When the fill <strong className="text-white">went bright</strong> within the last 5-12 bars (depending on TF) and is now easing, Condition 1 has been satisfied. If you&apos;ve never seen the fill go bright on your current asset, no TS will fire &mdash; and that&apos;s correct, the rubber band never stretched.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Condition 2: Snapping Back === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Condition 2: Snapping Back</p>
          <h2 className="text-2xl font-extrabold mb-4">Is the band recoiling right now?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Condition 1 confirmed the stretch <strong className="text-amber-400">happened</strong>. Condition 2 asks whether the recoil <strong className="text-amber-400">is happening right now</strong>. The check is mechanical: <strong className="text-white">is c_tension this bar greater than c_tension last bar?</strong> For a bull snap, yes means tension was deeply negative and is now reducing toward zero &mdash; the rubber band is contracting. The gate fires the instant the recoil starts.</p>
          <GateSnapAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The white line is c_tension over time. It descends to roughly -1.6 ATR, holds, then recovers. The cursor sweeps along, comparing each bar to the previous. The dot turns teal at the moment c_tension stops descending and starts rising &mdash; <strong className="text-white">that&apos;s the snap bar.</strong> One bar earlier, it was magenta (still falling).</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE CODE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">ts_snap_bull = c_tension &gt; c_tension_prev</code>. One line, single-bar comparison. <code className="text-amber-400 font-mono text-xs">c_tension_prev</code> uses ATR from the previous bar so the normalisation is correct. The bear-snap mirror reads <code className="text-white font-mono text-xs">c_tension &lt; c_tension_prev</code> &mdash; tension descending from a high.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY ONE-BAR COMPARISON, NOT A SMOOTH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A smoothed measure (e.g. &ldquo;tension trending up over last 3 bars&rdquo;) would lag the snap by 2-3 bars. By the time it confirmed, you&apos;d have missed half the move. Single-bar comparison means TS fires at the inflection itself &mdash; the same bar the rejection candle prints. The trade-off is more false positives &mdash; some &ldquo;snaps&rdquo; reverse on the next bar &mdash; which is why Conditions 3 and 4 exist to filter them.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS GATE ALONE ISN&apos;T ENOUGH</p>
              <p className="text-sm text-gray-400 leading-relaxed">Tension oscillates constantly &mdash; even in chop, c_tension is always rising or falling tick by tick. If TS fired on every bar where Condition 2 was true, you&apos;d have signals every 2-3 bars indefinitely. Conditions 1 (stretch existed), 3 (rejection candle), and 4 (velocity behind it) are all there to constrain &ldquo;snapping&rdquo; to the moments that actually mark reversals.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE SUBTLE PART</p>
            <p className="text-sm text-gray-400 leading-relaxed">Condition 2 will be true on roughly half of all bars &mdash; tension is rising on roughly half the bars in any sample. So this gate is the <strong className="text-white">least selective</strong> of the four. Read this way: Condition 2 is the <strong className="text-amber-400">timing</strong> gate, not the <strong className="text-amber-400">filter</strong>. It tells WHEN to consider firing. Conditions 1, 3, 4 tell IF.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Condition 3: Rejection Candle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Condition 3: Rejection Candle</p>
          <h2 className="text-2xl font-extrabold mb-4">Does the candle look like real conviction?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Conditions 1 and 2 are math. Condition 3 reads <strong className="text-white">price action</strong>. The bar that prints at the snap inflection has to look like <strong className="text-amber-400">buyers (or sellers) actually showed up</strong> &mdash; not indecision, not a wick from a temporary spike. CIPHER applies two filters: the body has to be real-sized, AND the body has to dominate the candle&apos;s full range.</p>
          <GateCandleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. Three candles cycle in focus. The doji has a tiny body &mdash; fails the first filter (body too small). The long-wick candle has a real-sized body, but most of the candle is wick &mdash; fails the second filter (body_ratio too low). The real rejection candle has a strong body that dominates its range &mdash; passes both. <strong className="text-white">Only the third candle would let TS fire.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE CODE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">ts_bull_candle = bullish_candle and body &gt; min_body and body_ratio &gt; 0.4</code>. Three checks in series: direction matches the snap (bullish for bull snap), body exceeds the minimum threshold, and the body is more than 40% of the candle&apos;s full range. <code className="text-amber-400 font-mono text-xs">body_ratio = body / candle_range</code>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY TWO FILTERS, NOT ONE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A doji with a 0.005 ATR body fails the first filter (body too small in absolute terms). A pin-bar with a 0.04 ATR body but a 0.16 ATR range fails the second filter (body is only 25% of range &mdash; the rest is wick, indicating indecision). Two filters together reject both kinds of weak candle. A real rejection candle is <strong className="text-white">decent-sized AND mostly body</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 40%, NOT 50% OR 60%</p>
              <p className="text-sm text-gray-400 leading-relaxed">40% body_ratio is the empirical cutoff that separates &ldquo;real reversal candle&rdquo; from &ldquo;long-wicked indecision.&rdquo; Higher (50-60%) would reject too many genuine snap-back candles &mdash; reversal bars often have meaningful wicks because they spike to capture stops before reversing. 40% allows for that wick noise while still demanding the body dominates.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTIONAL ALIGNMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">For a bull snap to fire, the snap candle must be bullish (close &gt; open). For a bear snap, bearish. This sounds obvious but it filters out cases where tension reverses but the candle itself is still pointing the wrong way &mdash; e.g. price reversing intra-bar but closing in the original stretch direction. The candle&apos;s own direction must agree with the snap thesis.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THIS GATE BY EYE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Look at the candle that prints at the snap. Is it a <strong className="text-white">solid green or solid red bar</strong>, with the body taking up most of the range? If yes, Condition 3 passed. If it&apos;s a doji, a long-tailed pin, or a candle whose body is dwarfed by its wicks &mdash; Condition 3 failed and TS will not fire even if everything else is aligned.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Condition 4: Velocity Shift === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Condition 4: Velocity Shift</p>
          <h2 className="text-2xl font-extrabold mb-4">Is momentum visibly turning, not just drifting?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Conditions 1, 2, and 3 can all be true while momentum is barely changing &mdash; the chart equivalent of a dead-cat bounce. Condition 4 demands that <strong className="text-white">velocity itself shifts by a meaningful amount in one bar</strong>. Not a micro-tick. Not a drift. A real, measurable change in how fast price is moving in the new direction.</p>
          <GateVelocityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. The first 4 seconds show a micro-tick scenario &mdash; velocity barely budges at the inflection (Δ = +3.0, threshold = +6.0). REJECTED. The next 4 seconds show a real shift &mdash; velocity jumps by +25 in one bar, well past the threshold. PASSES. Same chart shape on the macro level, very different micro-detail. <strong className="text-amber-400">The micro is what Condition 4 reads.</strong></p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE CODE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">ts_vel_shift_bull = (c_velocity - c_velocity[1]) &gt; ts_vel_min_shift</code> where <code className="text-amber-400 font-mono text-xs">ts_vel_min_shift = vp50 * 0.2</code>. The shift must exceed 20% of this asset&apos;s median absolute velocity. <code className="text-amber-400 font-mono text-xs">vp50</code> is the per-asset 50th percentile of |c_velocity|, computed adaptively &mdash; so the threshold scales with how fast the asset typically moves.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 20% OF MEDIAN</p>
              <p className="text-sm text-gray-400 leading-relaxed">A static threshold (e.g. &ldquo;velocity must shift by 5 points&rdquo;) wouldn&apos;t scale across assets &mdash; what&apos;s a meaningful shift on Gold isn&apos;t the same as on EUR/USD. Using 20% of this asset&apos;s typical move size means the threshold auto-calibrates. If the asset is in a low-velocity regime, the threshold drops accordingly. <strong className="text-white">High-velocity assets demand bigger shifts before TS will fire on them.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS GATE EXISTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Without Condition 4, every dead-cat bounce in a downtrend would fire TS Long. Tension stretches, snaps slightly, prints a bullish candle &mdash; but momentum hasn&apos;t actually turned, the move resumes lower minutes later. Condition 4 separates &ldquo;real reversal with momentum&rdquo; from &ldquo;mean-reversion blip in an ongoing trend.&rdquo; It&apos;s the <strong className="text-white">conviction</strong> gate.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RELATIONSHIP TO CONDITION 3</p>
              <p className="text-sm text-gray-400 leading-relaxed">The rejection candle (Condition 3) and the velocity shift (Condition 4) sound similar but measure different things. Condition 3 reads the <strong className="text-white">candle shape</strong> &mdash; static OHLC structure of one bar. Condition 4 reads the <strong className="text-white">change in motion</strong> &mdash; bar-over-bar velocity delta. A bar can pass one without the other. Both must pass for TS to fire.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THIS GATE FROM THE CHART</p>
            <p className="text-sm text-gray-400 leading-relaxed">The proxy for Condition 4 is the <strong className="text-white">Cipher Velocity gradient</strong> on the candles, if you have Cipher Candles set to Trend or Composite. When velocity shifts hard, candles change color saturation &mdash; pale to deep, or deep to pale &mdash; from one bar to the next. A snap candle that prints in a much-deeper color than the prior bar is one that passed Condition 4.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Cooldown === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Cooldown</p>
          <h2 className="text-2xl font-extrabold mb-4">The fifth check no one talks about</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After all four conditions align and TS fires, an explicit cooldown blocks any further TS in the same direction for N bars. <strong className="text-amber-400">PX doesn&apos;t need this.</strong> A Pulse flip is self-limiting &mdash; once Pulse has flipped to bull, it can&apos;t fire another bull PX until it flips bear and back. Tension oscillates continuously, so without a cooldown TS would fire 3-4 times during a single choppy reversal. The cooldown is the engineering fix.</p>
          <CooldownAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. TS fires at bar 4. The cooldown bracket spans 8 bars. At bar 9, all four conditions align again &mdash; but cooldown is still active. <strong className="text-white">BLOCKED.</strong> At bar 14, after cooldown clears, the next valid TS fires. The cooldown is direction-specific &mdash; a long cooldown doesn&apos;t prevent a short TS, and vice versa.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE PINE CODE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-white font-mono text-xs">(bar_index - ts_last_long_bar) &gt;= ts_cooldown</code>. Bar index of the current bar minus bar index of the last TS long fire must be at least the cooldown. <code className="text-amber-400 font-mono text-xs">ts_cooldown</code> is 8 bars on scalp, 12 on intraday, 8 on swing/daily. Daily cooldown is shorter because daily bars are expensive in time.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 8 ON SCALP, 12 ON INTRA</p>
              <p className="text-sm text-gray-400 leading-relaxed">Scalp setups develop fast &mdash; if the first TS misfires, the next valid setup might be only 8 bars away. Intraday timeframes have wider noise envelopes &mdash; the tension oscillation is slower, and a 12-bar buffer prevents the engine from re-firing during the same overall reversal sequence. Both numbers were chosen empirically from backtest results.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION-SPECIFIC COOLDOWN</p>
              <p className="text-sm text-gray-400 leading-relaxed">There are two separate counters: <code className="text-amber-400 font-mono text-xs">ts_last_long_bar</code> and <code className="text-amber-400 font-mono text-xs">ts_last_short_bar</code>. A long fire only blocks future longs &mdash; if the market then fully reverses and a short setup forms, the short fires immediately regardless. This matters in V-shaped reversals where TS catches the bottom long, then 6 bars later catches a short on the new top.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">YOU CANNOT TURN COOLDOWN OFF</p>
              <p className="text-sm text-gray-400 leading-relaxed">There&apos;s no input setting to disable the TS cooldown. It&apos;s a permanent part of the engine because turning it off produces unusably noisy signals on every TF and asset. If you ever feel like &ldquo;TS isn&apos;t firing on this perfect setup,&rdquo; check whether the previous TS in the same direction was within the cooldown window &mdash; that&apos;s usually the answer.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHEN COOLDOWN COSTS YOU A SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">It will happen: a setup forms 6 bars after the previous TS, all four conditions align, and TS doesn&apos;t fire. Frustrating in the moment. Worth absorbing the trade-off: the cooldown is empirically the difference between a tradeable signal generator and one that fires 30 false positives during every choppy session. The blocked signals you notice are visible. <strong className="text-white">The 30 you don&apos;t have to filter manually are invisible.</strong></p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Asset-Class Threshold Routing === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Asset-Class Routing</p>
          <h2 className="text-2xl font-extrabold mb-4">All asset classes, in one view</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER auto-detects the asset class of your symbol and routes Condition 1&apos;s threshold accordingly. Forex and commodity CFDs share the tightest threshold (0.8 ATR). Indices and crypto sit at 1.0 ATR. Stocks need the most stretch (1.2 ATR). <strong className="text-amber-400">You don&apos;t set this manually.</strong> CIPHER reads the symbol type from the chart and applies the right threshold automatically.</p>
          <AssetThresholdRoutingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the spotlight cycle through asset classes. Each row shows the threshold and the rationale. <strong className="text-white">If you&apos;ve been seeing more TS signals on EUR/USD than on AAPL, this is why</strong> &mdash; and it&apos;s the pipeline doing its job, not a bug.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FOREX &amp; COMMODITY  ·  0.8 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">EUR/USD, GBP/USD, USD/JPY, XAU/USD, US oil &mdash; tight intraday ranges. A 0.8 ATR move from Cipher Flow is meaningful overextension. Setting the threshold higher would mean missing real snap setups in a class that doesn&apos;t produce dramatic stretches.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INDEX &amp; CRYPTO  ·  1.0 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">NAS100, US30, S&amp;P 500, BTC, ETH &mdash; bigger moves and bigger wicks. Need a full ATR of stretch before declaring &ldquo;extreme.&rdquo; Index trends are cleaner than stocks but more volatile than forex; crypto has bigger wicks but bigger real moves &mdash; both calibrated to the same threshold.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">STOCKS  ·  1.2 ATR</p>
              <p className="text-sm text-gray-400 leading-relaxed">AAPL, TSLA, NVDA &mdash; single-issue names have idiosyncratic noise that other classes don&apos;t. Earnings, gaps, news-driven spikes regularly stretch tension to 1.0 ATR without indicating reversal. The 1.2 ATR threshold filters that single-issue noise out.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DETECTION HAPPENS IN THE INDICATOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Pine code reads <code className="text-amber-400 font-mono text-xs">syminfo.type</code> and a few derived flags (<code className="text-amber-400 font-mono text-xs">is_index</code>, <code className="text-amber-400 font-mono text-xs">is_forex_asset</code>, <code className="text-amber-400 font-mono text-xs">is_commodity_cfd</code>, <code className="text-amber-400 font-mono text-xs">is_crypto_asset</code>) to set <code className="text-amber-400 font-mono text-xs">ts_min_tension</code>. There&apos;s no dropdown. The chart symbol IS the input.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">EXPECT DIFFERENT FREQUENCIES</p>
            <p className="text-sm text-gray-400 leading-relaxed">A normal session on EUR/USD 15m might produce 3-4 TS signals. The same session on AAPL 15m might produce one. <strong className="text-white">That&apos;s correct.</strong> Stocks fire fewer TS by design. The trader who scales activity to asset frequency stays patient on stocks; the trader who tries to force EUR/USD-style frequency on stocks ends up forcing trades.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Timeframe Routing === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Timeframe Routing</p>
          <h2 className="text-2xl font-extrabold mb-4">How TF modifies the engine</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Asset class sets the threshold. Timeframe sets two other parameters: <strong className="text-white">ts_lookback</strong> (how many bars back to check for the stretch) and <strong className="text-white">ts_cooldown</strong> (how many bars must elapse before another same-direction TS can fire). Both scale with how slowly setups develop on that TF.</p>
          <TFLookbackRoutingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the table cycle through TF tiers. Scalp (1m and below) uses 5 bars back, 8 bars cooldown. Intraday (2-3m) uses 8 bars back, 12 bars cooldown. Swing and Position (5m+) use 12 bars back with a shorter 8-bar cooldown.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCALP  ·  ≤ 1m  ·  5 / 8</p>
              <p className="text-sm text-gray-400 leading-relaxed">Scalp setups develop fast. A 5-bar lookback covers about 5 minutes of price action &mdash; enough to capture the recent stretch without dragging in stale data from the previous swing. Cooldown of 8 bars means after a TS fires, the next earliest re-fire is 8 minutes later. Tight enough that good setups still trade, wide enough to filter chop.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">INTRADAY  ·  2m–3m  ·  8 / 12</p>
              <p className="text-sm text-gray-400 leading-relaxed">Intraday TFs have wider noise envelopes than scalp. Stretches develop more slowly &mdash; 8 bars back is right. The longer 12-bar cooldown reflects the same principle: a single reversal sequence can produce multiple snap-back candles over 8-10 bars, and the cooldown ensures you don&apos;t fire 3 TS during the same overall move.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SWING / POSITION  ·  5m+  ·  12 / 8</p>
              <p className="text-sm text-gray-400 leading-relaxed">Swing setups develop over many bars. 12-bar lookback captures the full stretch episode. The cooldown drops back to 8 because daily and 4H bars are <strong className="text-white">expensive</strong> &mdash; you don&apos;t want to lock out signals for 12 daily bars after a single fire. The lookback grew, the cooldown shrank, prioritising signal availability on slow TFs.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TF DETECTION HAPPENS IN PINE</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER reads the chart&apos;s timeframe and computes a tier number (<code className="text-amber-400 font-mono text-xs">tf_num</code>) that maps to the lookback and cooldown values. Like asset detection, you don&apos;t set anything &mdash; the chart&apos;s TF IS the input.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">CHANGING TF CHANGES THE ENGINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you flip from 15m to 1m on the same symbol, you&apos;re not just looking at the same data on a different scale &mdash; you&apos;re activating a different TS configuration. Lookback drops from 8 to 5, cooldown drops from 12 to 8. <strong className="text-white">Signals that fired on 15m may not fire on 1m and vice versa.</strong> This is by design: each TF is its own engine.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Reading the Pine === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Reading the Pine</p>
          <h2 className="text-2xl font-extrabold mb-4">ts_long, clause by clause</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The actual Pine expression for a TS long signal is short enough to read top-to-bottom. Five clauses, joined by AND. If any one is false, the signal does not fire. Reading the expression as a sentence makes the engine fully transparent &mdash; nothing is hidden, nothing is fudged.</p>
          <TSPineWalkAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the clauses light up one at a time, then together at the end. Notice how the Pine expression reads almost as English: &ldquo;was bear stretched, AND tension is now rising, AND the candle is a bullish rejection, AND velocity has shifted bull, AND we&apos;re past the cooldown.&rdquo; The bear-snap version (<code className="text-amber-400 font-mono text-xs">ts_short</code>) is the same expression with each direction flipped.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CLAUSE-BY-CLAUSE TRANSLATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Clause 1 is your <strong className="text-white">setup</strong> &mdash; did the rubber band stretch? Clause 2 is your <strong className="text-white">trigger</strong> &mdash; is it recoiling now? Clause 3 is your <strong className="text-white">confirmation</strong> &mdash; does the candle agree? Clause 4 is your <strong className="text-white">conviction</strong> &mdash; is momentum behind it? The cooldown is <strong className="text-white">hygiene</strong> &mdash; not a market read, just spam control.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY ALL FIVE MUST BE TRUE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Removing any one clause turns TS into a different signal. Without 1: fires on every micro-snap regardless of whether a setup existed. Without 2: fires randomly on stretched bars. Without 3: fires on dojis and pin-bars. Without 4: fires on every dead-cat bounce. Without cooldown: fires 3-4 times during every reversal sequence. <strong className="text-white">Each clause is load-bearing.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ts_short IS THE MIRROR</p>
              <p className="text-sm text-gray-400 leading-relaxed">For each component there&apos;s a bear-direction equivalent: <code className="text-amber-400 font-mono text-xs">ts_was_bull_stretch</code>, <code className="text-amber-400 font-mono text-xs">ts_snap_bear</code>, <code className="text-amber-400 font-mono text-xs">ts_bear_candle</code>, <code className="text-amber-400 font-mono text-xs">ts_vel_shift_bear</code>, and the <code className="text-amber-400 font-mono text-xs">ts_last_short_bar</code> cooldown counter. They run independently &mdash; a bull cooldown does NOT block a bear signal and vice versa.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NO HIDDEN MAGIC</p>
              <p className="text-sm text-gray-400 leading-relaxed">There&apos;s no machine learning, no proprietary scoring black-box, no &ldquo;CIPHER score&rdquo; voting under the hood. The TS expression is exactly what you see &mdash; five Boolean clauses ANDed together. Every parameter (<code className="text-amber-400 font-mono text-xs">ts_min_tension</code>, <code className="text-amber-400 font-mono text-xs">ts_lookback</code>, <code className="text-amber-400 font-mono text-xs">vp50</code>) is computable from chart data. This is the entire engine.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY READING THE PINE MATTERS</p>
            <p className="text-sm text-gray-400 leading-relaxed">When TS doesn&apos;t fire on a setup you thought it should, you can walk the clauses and find the failed one. Body too small? Clause 3. No recent stretch? Clause 1. Velocity barely shifting? Clause 4. <strong className="text-white">Operators who read the Pine never blame the indicator</strong> &mdash; they read it for what it actually says.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — Trading TS === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; Trading TS</p>
          <h2 className="text-2xl font-extrabold mb-4">Three playbooks, three different setups</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All TS signals trade as Long or Short. But not all TS signals are equal. The setup type around the signal &mdash; whether it&apos;s a clean reversal, fires inside an active Coil Box, or aligns with higher-TF bias &mdash; changes the targets, stops, and sizing. Three named playbooks cover the high-edge variants.</p>
          <TSPlaybooksAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the playbooks cycle. Standard TS Reversal targets 1.5R with stop below the snap candle low. TS + Coil Confluence targets 2.5R with stop below the coil low. TS with HTF Agreement is the high-conviction variant &mdash; targets 3R with stop below structure. <strong className="text-white">All three use the same TS signal as the entry trigger.</strong> The setup context determines the trade plan.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 1  ·  STANDARD TS REVERSAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The default play. TS fires on a stretched move, no other special context. <strong className="text-white">Entry:</strong> at signal close. <strong className="text-white">Stop:</strong> below the snap candle low (long) or above the snap candle high (short). <strong className="text-white">Target:</strong> 1.5R, then trail with Pulse. This is the playbook for 60-70% of TS fires.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 2  ·  TS + COIL CONFLUENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed">TS fires while a Coil Box squeeze is active. The squeeze adds compressed energy on top of the snap-back. <strong className="text-white">Entry:</strong> at signal close. <strong className="text-white">Stop:</strong> below the coil low (long) &mdash; wider than Playbook 1. <strong className="text-white">Target:</strong> 2.5R, looking for the coil-release move to extend the snap. Coil mechanics are covered in Lesson 14.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PLAYBOOK 3  ·  TS WITH HTF AGREEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">TS fires on your trading TF AND the Tension state on a higher TF agrees with the direction (e.g. 15m TS Long while 1H Tension is BUILDING bullish). <strong className="text-white">Entry:</strong> at signal close. <strong className="text-white">Stop:</strong> below recent structure (further from entry &mdash; wider risk). <strong className="text-white">Target:</strong> 3R or trail to opposite-direction TS. The highest-edge variant. Covered fully in Lesson 17.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING ACROSS THE THREE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Standard size on Playbook 1. Standard or up-sized on Playbook 2 (the coil confluence is a real edge). Up-sized confidently on Playbook 3 (HTF agreement is the strongest filter outside the four conditions themselves). Never down-size on a TS &mdash; if the four conditions plus cooldown all passed, the engine has spoken; either trade it at conviction or don&apos;t trade it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHEN TO SKIP A TS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Even with all four conditions passing, some TS fires shouldn&apos;t be traded: against a STRONG TREND regime, against fresh institutional structure (FVG, sweep) that will likely hold, into a major news release within 30 minutes. <strong className="text-white">Lesson 13 covers this in depth.</strong> For now, treat the four conditions as the engine&apos;s say, the regime and structure as your final say.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">STOP MANAGEMENT IS WHAT SEPARATES PLAYBOOKS</p>
            <p className="text-sm text-gray-400 leading-relaxed">The signal entry is identical across all three playbooks &mdash; the TS triangle on the chart. What changes is <strong className="text-white">where the stop goes</strong>, which determines size and target. A wrong-playbook stop (e.g. tight Playbook-1 stop on a Playbook-3 setup) is the most common reason traders lose on otherwise-good TS signals. Read the context first, then place the stop.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Inputs that affect TS === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Inputs Reference</p>
          <h2 className="text-2xl font-extrabold mb-4">Five inputs that change TS behaviour</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Most TS parameters are auto-set from asset class and timeframe and you cannot override them. But a handful of toggles control whether TS appears at all, whether you see only Strong variants, and how the candles render to support visual TS reading. Know these five.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIGNAL ENGINE  ·  i_signal_type</p>
              <p className="text-sm text-gray-400 leading-relaxed">The most important input. Four modes: <strong className="text-white">All Signals</strong> (PX + TS), <strong className="text-white">Trend</strong> (PX only &mdash; default), <strong className="text-white">Reversal</strong> (TS only), <strong className="text-white">Visuals Only</strong> (no signals). To see TS labels at all, set this to Reversal or All Signals. Default is Trend, which is why many new operators never see a TS fire on their chart &mdash; the engine is on, but TS output is suppressed.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CIPHER CANDLES  ·  i_candle_mode</p>
              <p className="text-sm text-gray-400 leading-relaxed">Set to <strong className="text-white">Tension</strong> or <strong className="text-white">Tension Bold</strong> to color candles by the c_tension gradient. Deeper color = more stretched. Visually preempts the Tension row and the TS signal &mdash; you literally see the rubber band brightening before the row updates. Best mode for traders running TS-primary setups.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">PRESET  ·  i_preset = &ldquo;Reversal&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Reversal preset is built specifically for TS workflow. It enables Cipher Spine (structure context), Cipher Imbalance (FVGs to confirm exhaustion), Risk Envelope (visualise stop placement), and switches Cipher Candles to Tension mode. One click and your chart is configured for snap-trading. <strong className="text-white">Highly recommended starting point.</strong></p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER  ·  Tension toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">In the COMMAND CENTER input group, the &ldquo;Tension&rdquo; checkbox toggles the Tension row on or off. Turn it ON whenever you&apos;re trading TS &mdash; the row is your in-flight readout of the system. Turn it off if your Command Center is too tall and you&apos;re running PX-only.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COMMAND CENTER  ·  Live Conditions toggle</p>
              <p className="text-sm text-gray-400 leading-relaxed">Adjacent to the Tension toggle, the Live Conditions sub-panel shows four mini-gauges including Tension (RELAXED &rarr; LIGHT &rarr; BUILDING &rarr; STRETCHED). It&apos;s a more compact view than the dedicated Tension row &mdash; useful when you want the data but not the full row real estate.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHAT YOU CANNOT CHANGE</p>
            <p className="text-sm text-gray-400 leading-relaxed">There are no inputs for <code className="text-amber-400 font-mono text-xs">ts_min_tension</code>, <code className="text-amber-400 font-mono text-xs">ts_lookback</code>, <code className="text-amber-400 font-mono text-xs">ts_cooldown</code>, the body_ratio threshold, or the velocity shift multiplier. They are hard-coded and asset/TF-routed. <strong className="text-white">This is intentional</strong> &mdash; opening these to user control would let operators tune themselves into bad signals. The empirical defaults are the defaults.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every TS-user falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six predictable mistakes appear when operators first start trading TS. Recognise them, skip the year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  TRADING SNAPPING ROW STATE AS A TS SIGNAL</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Tension row showing &ldquo;SNAPPING&rdquo; uses a flat 0.8 ATR threshold &mdash; more sensitive than TS itself, which uses asset-adaptive thresholds. <strong className="text-white">The row alerts. The signal confirms.</strong> Trading the row instead of the triangle means trading setups that haven&apos;t passed Conditions 3 and 4. Many of those continue downward instead of reversing.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  RUNNING TREND-ONLY MODE AND WAITING FOR TS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default Signal Engine is Trend, which fires PX only and suppresses TS output entirely. New operators see no TS labels for weeks, conclude TS doesn&apos;t work on their asset, and never investigate. <strong className="text-white">Check the Signal Engine input.</strong> If it&apos;s on Trend, no TS will ever fire regardless of how clean the setups are.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  USING PX STOPS ON TS TRADES</p>
              <p className="text-sm text-gray-400 leading-relaxed">PX continuation trades stop below Pulse (the line that flipped). TS reversal trades stop below the snap candle low &mdash; usually MUCH closer to entry. Using the PX-style Pulse stop on a TS trade gives you the wrong R:R and almost always sizes the trade incorrectly. <strong className="text-white">Read the Last Signal row tag</strong> &mdash; it tells you which engine, which tells you where the stop goes.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  ASSUMING TS IS &ldquo;FASTER PX&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">TS is not a faster version of PX. They detect different patterns. PX detects structural breaks and is less false-positive-prone but later. TS detects mean-reversion snaps and is earlier but more false-positive-prone. <strong className="text-white">They&apos;re different tools for different patterns</strong> &mdash; not the same tool with different latency. Treating TS as &ldquo;PX with less waiting&rdquo; leads to wrong sizing and wrong stops.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  TRADING TS AGAINST STRONG TREND REGIME</p>
              <p className="text-sm text-gray-400 leading-relaxed">In a STRONG TREND regime, snaps are <strong className="text-white">retracements, not reversals</strong>. Tension stretches against the trend, snaps back briefly, then continues with the trend. TS fires correctly &mdash; the four conditions pass &mdash; but the snap doesn&apos;t produce a tradeable reversal. Always check the Regime row before taking a counter-trend TS. Lesson 13 covers when to skip in detail.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  IGNORING THE COOLDOWN WHEN A &ldquo;PERFECT&rdquo; SETUP DOESN&apos;T FIRE</p>
              <p className="text-sm text-gray-400 leading-relaxed">All four conditions are clearly aligned. Stretched, snapping, real candle, velocity shift. No TS triangle. <strong className="text-white">Check whether the previous TS in the same direction was within the cooldown window</strong> &mdash; that&apos;s usually the answer. Cursing the indicator while standing on top of an active cooldown is the most frequent diagnostic miss in TS reading.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The TS Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it next to the PX Pipeline cheat sheet. Reference it when a TS doesn&apos;t fire on a setup you thought it should.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Four Conditions</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Condition 1 &middot; Was Stretched</strong> &mdash; tension reached extreme within lookback.</p>
                <p><strong className="text-white">Condition 2 &middot; Snapping Back</strong> &mdash; c_tension &gt; c_tension[1] (rubber band recoiling).</p>
                <p><strong className="text-white">Condition 3 &middot; Rejection Candle</strong> &mdash; bullish/bearish + body real + body_ratio &gt; 40%.</p>
                <p><strong className="text-white">Condition 4 &middot; Velocity Shift</strong> &mdash; |Δvelocity| &gt; vp50 × 0.2.</p>
                <p><strong className="text-white">+ Cooldown</strong> &mdash; (bar_index - last_TS_bar) &ge; ts_cooldown.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">ts_min_tension by Asset Class</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Forex / Commodity</strong> 0.8 ATR &middot; <strong className="text-white">Index / Crypto</strong> 1.0 ATR &middot; <strong className="text-white">Stocks</strong> 1.2 ATR</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Lookback &amp; Cooldown by TF</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Scalp</strong> (≤1m) &mdash; lookback 5, cooldown 8</p>
                <p><strong className="text-white">Intra</strong> (2-3m) &mdash; lookback 8, cooldown 12</p>
                <p><strong className="text-white">Swing/Position</strong> (5m+) &mdash; lookback 12, cooldown 8</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Tension Row States</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">RELAXED</strong> teal &middot; <strong className="text-white">BUILDING</strong> amber &middot; <strong className="text-white">STRETCHED</strong> magenta &middot; <strong className="text-white">SNAPPING</strong> magenta</p>
                <p>SNAPPING uses fixed 0.8 ATR (more sensitive than TS itself).</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The ts_long Expression</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                ts_was_bear_stretch AND<br />ts_snap_bull AND<br />ts_bull_candle AND<br />ts_vel_shift_bull AND<br />(bar_index - ts_last_long_bar) &ge; ts_cooldown
              </p>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Three Playbooks</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Standard TS Reversal</strong> &mdash; 1.5R, stop below snap candle low.</p>
                <p><strong className="text-white">TS + Coil Confluence</strong> &mdash; 2.5R, stop below coil low.</p>
                <p><strong className="text-white">TS with HTF Agreement</strong> &mdash; 3R, stop below structure.</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">To See TS at All</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Signal Engine input must be set to <strong className="text-white">Reversal</strong> or <strong className="text-white">All Signals</strong>. Default is Trend (PX only).</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Six Mistakes To Avoid</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Trading the SNAPPING row state &middot; Running Trend-only and waiting for TS &middot; Using PX stops on TS trades &middot; Treating TS as &ldquo;faster PX&rdquo; &middot; Counter-trend TS in STRONG TREND regime &middot; Forgetting the cooldown</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Diagnose the Snap Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real-feeling TS situation &mdash; asset-class diagnosis, row-vs-signal disambiguation, regime-aware judgement, hidden cooldown blocking, stop placement. Pick the right call. Explanations appear after every answer, including for the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Tension Snap Operator-grade reading installed. You read the row and the signal as separate things.' : finalScore >= 3 ? 'Solid grasp. Re-read the routing tables (S10-S11), the cooldown logic (S09), and the playbook stop placements (S13) before the quiz.' : 'Re-study the four conditions (S05-S08), the cooldown (S09), and the trading playbooks (S13) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.12: TS 4-Condition System</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Tension Snap Operator &mdash;</p>
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
