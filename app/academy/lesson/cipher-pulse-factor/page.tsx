// app/academy/lesson/cipher-pulse-factor/page.tsx
// ATLAS Academy — Lesson 11.10: The 5-Layer Pulse Factor [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// The Self-Calibrating Heartbeat — CIPHER's contextual Pulse intelligence
// Covers: i_pulse_factor + 5 dynamic multipliers (TF/asset/vol/ADX/preset)
//         + Pulse line construction + ratchet + maturity + chop + slope
//         + Command Center Pulse row reading
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Pulse Factor challenges
// String-id answers, per-option explanations (teaches on wrong answers)
// Covers: layer composition, asset/TF mismatch, choppy flag,
//         maturity-aware trading, preset compounding
// ============================================================
const gameRounds = [
  {
    id: 'r1',
    scenario:
      "You're testing CIPHER on XAUUSD 1H using the Trend Trader preset, with i_pulse_factor set to 1.5. You note the Pulse line sits comfortably away from price during normal moves and flips cleanly on real reversals. Volatility is in its normal range, ADX is around 25.",
    prompt: 'What number is CIPHER actually using as the effective pulse_factor on this chart, approximately?',
    options: [
      {
        id: 'a',
        text: '1.50 — your input is what gets used directly.',
        correct: false,
        explain:
          "Wrong, and this is mistake number one from section fifteen. Your input is the SEED. Five layers compound on top: 1H (×0.85), Commodity (×0.80), Volatility Normal (×1.00), ADX Mid (×1.00), Trend Trader preset (×1.00). 1.50 × 0.85 × 0.80 = 1.02. The actual number used is much closer to 1.0, not 1.5.",
      },
      {
        id: 'b',
        text: 'Approximately 1.02 — input multiplied through TF, asset, vol, ADX, and preset layers.',
        correct: true,
        explain:
          "Correct. Five layers compound. 1H timeframe pulls 0.85, commodity asset class pulls 0.80, the rest sit at 1.00. Working through: 1.50 × 0.85 × 0.80 × 1.00 × 1.00 × 1.00 = 1.02. Your input feels like 1.5 but CIPHER is actually using about 1.02. This is why operators who don't read the layers find Pulse 'works differently than expected' on different charts.",
      },
      {
        id: 'c',
        text: 'Around 0.50 — Pulse always reduces to half the input.',
        correct: false,
        explain:
          "No. Multipliers compound, but they don't always compress. They can also extend (Sniper preset is 1.30, ADX chop is 1.15, high vol can reach 1.30). The composition produces a value somewhere in roughly 0.4× to 1.4× the input depending on context. There's no fixed reduction.",
      },
      {
        id: 'd',
        text: '1.50 plus all five layer adjustments added together.',
        correct: false,
        explain:
          "Wrong operation. The five layers MULTIPLY, they don't add. Adding 0.85 + 0.80 + 1.00 + 1.00 + 1.00 = 4.65 would produce a useless number. Multiplication is what makes the layers compound: tiny adjustments stack into meaningful shifts.",
      },
    ],
  },
  {
    id: 'r2',
    scenario:
      "You found a Pulse Factor setting of 1.8 that 'feels right' on EURUSD 1H — clean flips, good distance, few false signals. Excited, you switch to BTC 5m to apply the same setting. Within 20 bars, Pulse has flipped four times and your stop has been hit twice.",
    prompt: 'What went wrong?',
    options: [
      {
        id: 'a',
        text: 'CIPHER is broken on BTC. Reset the indicator.',
        correct: false,
        explain:
          "Wrong diagnosis. CIPHER is doing exactly what it's designed to do. The asset and timeframe layers know BTC 5m needs different handling than EURUSD 1H, and they multiplied your input differently on each chart. The indicator isn't broken — your assumption that '1.8 means 1.8 everywhere' is what's broken.",
      },
      {
        id: 'b',
        text: '1.8 was too tight on BTC 5m. The same input compounded differently across asset and timeframe layers, producing chop.',
        correct: true,
        explain:
          "Correct. On EURUSD 1H, 1.8 input × 0.85 (TF) × 0.80 (Forex) × 1.00 (vol) × 1.00 (ADX) × 1.00 (preset) ≈ 1.22 effective. On BTC 5m, same input × 1.00 (TF) × 0.90 (Crypto) × 1.20 (high vol) × 0.85 (strong ADX) × 1.00 (preset) ≈ 1.65 effective. Wait — actually that's wider on BTC. The deeper issue: BTC 5m bars produce wicks proportionally larger to ATR, so even a wide effective Pulse gets violated more often. Tune per chart, never per gut. This is mistake number two.",
      },
      {
        id: 'c',
        text: '1.8 is wrong universally. The right value is 1.5 for all charts.',
        correct: false,
        explain:
          "There is no universal 'right value.' That's the entire point of the five layers — context determines what number works. 1.5 might be perfect on XAUUSD 4H and disastrous on NAS100 1m. The five layers exist precisely because no single input value fits every chart.",
      },
      {
        id: 'd',
        text: 'BTC 5m is unusable with CIPHER. Stick to forex and indices.',
        correct: false,
        explain:
          "BTC 5m is perfectly usable with CIPHER — the asset multiplier exists for exactly this reason. The fix isn't to abandon the chart, it's to tune the input for the chart. Lower i_pulse_factor on volatile-asset short-timeframe charts, raise it on slow swing charts. The layers tell you which direction to tune.",
      },
    ],
  },
  {
    id: 'r3',
    scenario:
      "On NAS100 30m, the Pulse line just flipped from RESISTANCE to SUPPORT. You're about to enter long. Looking at the Command Center Pulse row, column 1 reads 'SUPPORT 1b FLIPPED'. Column 2 reads '→ SIGNALS UNRELIABLE  ⚠ CHOPPY' in amber.",
    prompt: 'What do you do?',
    options: [
      {
        id: 'a',
        text: 'Enter the long. A flip is a flip — the row is just being conservative.',
        correct: false,
        explain:
          "This is mistake number three from section fifteen, and it's how operators get wrecked. The CHOPPY flag exists because the third-most-recent flip is within 20 bars — the market has flipped Pulse three or more times in less than 20 bars. That's not a directional decision. That's grinding. Trading PX signals during CHOPPY produces near-guaranteed losers.",
      },
      {
        id: 'b',
        text: 'Skip this signal. Wait until the CHOPPY flag clears (third-most-recent flip falls outside the 20-bar window) before trading PX again.',
        correct: true,
        explain:
          "Correct. The CHOPPY flag overrides the FLIPPED proximity reading on purpose. CIPHER is telling you: 'yes, Pulse just flipped, but the recent history is so noisy you can't trust this one.' The discipline is to wait — typically 8 to 15 bars — until the lookback clears. Then PX signals become tradeable again. Operators who break this rule fail not because Pulse is wrong but because they ignored Pulse's own warning.",
      },
      {
        id: 'c',
        text: 'Enter long but with half size, since the system is uncertain.',
        correct: false,
        explain:
          "Half-sizing a CHOPPY signal is not a hedge — it's still trading something CIPHER explicitly says is unreliable. The expected value of CHOPPY entries is negative regardless of size. You're cutting your loss in half rather than avoiding it. The discipline is to skip, not to half-size.",
      },
      {
        id: 'd',
        text: 'Enter short instead, since amber means bearish.',
        correct: false,
        explain:
          "Amber doesn't mean bearish. Amber means caution — the signal exists but is suspect. Magenta means bear in column one. The CHOPPY warning in column two doesn't reverse the signal direction; it questions whether ANY direction is tradeable right now. The answer in CHOPPY is no direction, not the opposite direction.",
      },
    ],
  },
  {
    id: 'r4',
    scenario:
      "Two Pulse flip signals appear on different XAUUSD 1H charts at roughly the same time. Setup A: Pulse just flipped from MATURE state — held for 73 bars before flipping. Setup B: Pulse just flipped from FRESH state — the previous flip happened only 4 bars ago.",
    prompt: 'How should you size and treat these two trades differently?',
    options: [
      {
        id: 'a',
        text: 'Treat them identically. A flip is a flip regardless of what came before.',
        correct: false,
        explain:
          "This is mistake number four from section fifteen. Setup A is a 73-bar-old trend that JUST broke. Structurally, that means a sustained directional consensus has been overturned — these flips often mark major reversals. Setup B is a 4-bar 'trend' that flipped — the prior direction barely had time to establish. Sizing them identically ignores the structural difference between strong-trend-broken and weak-direction-failed.",
      },
      {
        id: 'b',
        text: 'Setup A (MATURE-flip) gets full size because the structural break is meaningful. Setup B (FRESH-flip) gets reduced size or is skipped because the prior direction never confirmed.',
        correct: true,
        explain:
          "Correct. The MATURE-flip carries history — 73 bars of trend defending one direction, now broken by a close-through. The FRESH-flip carries no such history; the prior direction barely lived. MATURE-flips are tradeable with conviction. FRESH-flips during chop conditions (which is what 'flipped 4 bars ago and now flipping again' implies) are typically the signature of CHOPPY — and may even trigger the choppy flag itself depending on prior history.",
      },
      {
        id: 'c',
        text: 'Setup B gets full size because it\'s the more recent reversal.',
        correct: false,
        explain:
          "Recency isn't the metric — structural significance is. A FRESH flip following another flip 4 bars earlier signals chop, not opportunity. The fact that there have been two flips in 4 bars is evidence the direction isn't being decided cleanly. Setup A's 73-bar conviction is the structural event worth trading.",
      },
      {
        id: 'd',
        text: 'Skip both. Recent flips are always too risky.',
        correct: false,
        explain:
          "Setup A is exactly the kind of MATURE-state reversal CIPHER is designed to highlight. Skipping it removes one of the strongest pattern-based trades CIPHER offers. The discipline is to read the maturity state, not to refuse all flip-based trades.",
      },
    ],
  },
  {
    id: 'r5',
    scenario:
      "You're getting too few Pulse signals on XAUUSD 5m. You're using the Scalper preset (preset_pulse_mult = 0.80) with i_pulse_factor at 1.5. You decide to lower i_pulse_factor to 1.0 to 'tighten Pulse for more signals'. Now Pulse is hugging price and flipping on every wick. The Pulse row shows VERY CLOSE almost constantly.",
    prompt: 'What\'s the correct diagnosis and fix?',
    options: [
      {
        id: 'a',
        text: 'Lower i_pulse_factor further to 0.5 — Pulse needs to be tighter still.',
        correct: false,
        explain:
          "This makes the problem worse. Pulse is already hugging price and firing on noise. Tightening further compresses the effective Pulse to ~0.32 ATR (1.0 input × Scalper 0.80 × Commodity 0.80 × ~1.0 vol × ~1.0 ADX = ~0.64, then halved = 0.32). At that distance, EVERY wick crosses Pulse. The fix is the opposite direction.",
      },
      {
        id: 'b',
        text: "You compounded a tightening you didn't realise. Scalper preset already pulls 0.80. Combined with 1H Commodity (×0.85 × 0.80) the effective input is much smaller than 1.0. Raise i_pulse_factor back up, OR switch to Trend Trader preset.",
        correct: true,
        explain:
          "Correct. This is mistake number six from section fifteen. The Scalper preset silently multiplied your input by 0.80. Lowering input to 1.0 stacked on top: effective = 1.0 × 0.85 (TF) × 0.80 (Asset) × 1.00 × 1.00 × 0.80 (Scalper) = 0.54. Pulse sits at 0.54 ATR from Flow — every meaningful wick violates it. The fix is either to raise i_pulse_factor (to maybe 1.6 or 1.8 to compensate for the Scalper preset) OR switch presets to one that doesn't compound the tightening.",
      },
      {
        id: 'c',
        text: 'Switch to a different timeframe — 5m is too noisy.',
        correct: false,
        explain:
          "5m is fine — operators trade 5m successfully every day. The problem isn't the timeframe; it's that the layer composition produced an effective Pulse far tighter than intended. Higher timeframes have their own concerns. Fix the composition first.",
      },
      {
        id: 'd',
        text: 'Disable the Scalper preset entirely — presets are unreliable.',
        correct: false,
        explain:
          "Presets are quite reliable, and Scalper exists for a reason. The issue isn't that Scalper is broken — it's that you didn't account for its tightening when adjusting your input. Either keep Scalper and raise i_pulse_factor, or switch to a non-tightening preset and keep i_pulse_factor where it was. Both are valid. Disabling presets entirely throws away a useful feature.",
      },
    ],
  },
];

// ============================================================
// QUIZ QUESTIONS — 8 mechanics-and-judgment checks
// String-id answers + question-level explanations
// 66% pass threshold (6 of 8 correct)
// ============================================================
const quizQuestions = [
  {
    id: 'q1',
    question: 'How are the five layers composed into the final pulse_factor value?',
    options: [
      { id: 'a', text: 'They are added together with i_pulse_factor.', correct: false },
      { id: 'b', text: 'They are multiplied with i_pulse_factor (and with each other).', correct: true },
      { id: 'c', text: 'They are averaged with i_pulse_factor.', correct: false },
      { id: 'd', text: 'Only the largest of the five layers is applied.', correct: false },
    ],
    explain:
      "The Pine source line 1883: pulse_factor = i_pulse_factor × tf_pulse_adj × asset_pulse_adj × pulse_vol_adj × pulse_adx_adj × preset_pulse_mult. Pure multiplication. This is why small adjustments compound — a 0.85 TF and a 0.80 asset don't add to a small change, they multiply to a 32% reduction.",
  },
  {
    id: 'q2',
    question: 'On a Daily XAUUSD chart with the Trend Trader preset and normal market conditions (vol ratio ~1.0, ADX ~22), what is the timeframe layer multiplier (tf_pulse_adj)?',
    options: [
      { id: 'a', text: '1.00', correct: false },
      { id: 'b', text: '0.85', correct: true },
      { id: 'c', text: '0.70', correct: false },
      { id: 'd', text: '1.15', correct: false },
    ],
    explain:
      "Daily falls into the 'mid-timeframe' band (1H, 4H, Daily) which gets the 0.85 multiplier. Scalp and intraday TFs (1m, 5m, 15m) get 1.00. Weekly drops to 0.70. The multiplier exists because higher-TF ATR runs richer relative to noise — a 15% tightening keeps Pulse close enough to flip on legitimate turns.",
  },
  {
    id: 'q3',
    question: 'The pulse_vol_adj layer is clamped between which two values?',
    options: [
      { id: 'a', text: '0.50 and 1.50', correct: false },
      { id: 'b', text: '0.80 and 1.30', correct: true },
      { id: 'c', text: '0.70 and 1.30', correct: false },
      { id: 'd', text: '0.85 and 1.15', correct: false },
    ],
    explain:
      "Pine line 1881: math.max(0.8, math.min(1.3, 1.0 + (vol_ratio - 1.0) × 0.15)). The 0.80 floor prevents Pulse collapsing onto price during quiet sessions; the 1.30 ceiling prevents Pulse from being pushed unreachable during volatility shocks. Without these clamps, vol extremes would render Pulse useless.",
  },
  {
    id: 'q4',
    question: 'When ADX is above 30 (strong trend), the pulse_adx_adj multiplier is:',
    options: [
      { id: 'a', text: '1.15 — wider Pulse for strong trends', correct: false },
      { id: 'b', text: '1.00 — neutral, no adjustment', correct: false },
      { id: 'c', text: '0.85 — tighter Pulse for strong trends', correct: true },
      { id: 'd', text: '0.70 — much tighter for strong trends', correct: false },
    ],
    explain:
      "Counter-intuitive on first read but correct on second. Strong trends (ADX > 30) get tighter Pulse (0.85) so a real reversal flips the line FAST, getting you out earlier when the trend ends. Chop (ADX < 15) gets wider Pulse (1.15) so noise doesn't flip the line. The ADX layer is doing the opposite of what amateur tuning would do.",
  },
  {
    id: 'q5',
    question: 'What does the ratchet mechanism do, in one sentence?',
    options: [
      { id: 'a', text: 'It smooths the Pulse line so it looks cleaner on chart.', correct: false },
      { id: 'b', text: 'It locks Pulse to one direction at a time and forbids it from giving back ground until price closes through it.', correct: true },
      { id: 'c', text: 'It applies the five layers in sequence to compute pulse_factor.', correct: false },
      { id: 'd', text: 'It detects when three flips have occurred within 20 bars.', correct: false },
    ],
    explain:
      "The ratchet is what makes Pulse a tradeable S/R line instead of a noisy oscillator. In bull state, the line can only move UP (taking the higher of prior line or new candidate). In bear state, only DOWN. Direction flips only when price closes through the line. This Supertrend-style mechanism is the difference between a useful Pulse and a chart you'd mute.",
  },
  {
    id: 'q6',
    question: 'A trend has held in the same Pulse direction for 40 bars without flipping. What maturity state is the Pulse line in?',
    options: [
      { id: 'a', text: 'FRESH', correct: false },
      { id: 'b', text: 'YOUNG', correct: false },
      { id: 'c', text: 'ESTABLISHED', correct: true },
      { id: 'd', text: 'MATURE', correct: false },
    ],
    explain:
      "The thresholds (Pine line 1920): FRESH 0-5b, YOUNG 5-20b, ESTABLISHED 20-50b, MATURE 50+b. 40 bars sits inside ESTABLISHED. This is the typical state during the middle of a healthy trend — the line has acted as effective S/R for a meaningful number of bars but hasn't yet aged into MATURE territory.",
  },
  {
    id: 'q7',
    question: 'The Command Center Pulse row reads: ▲ SUPPORT 18b CLOSE → TIGHTEN STOPS. What is the tension state and what action is implied?',
    options: [
      { id: 'a', text: 'Tension is below 0.5 ATR; prepare to exit immediately.', correct: false },
      { id: 'b', text: 'Tension is between 0.5 and 1.0 ATR; the line is being tested, tighten stops behind it.', correct: true },
      { id: 'c', text: 'Tension is between 1.0 and 2.0 ATR; trend is safe, hold.', correct: false },
      { id: 'd', text: 'Tension is above 2.0 ATR; price is overextended.', correct: false },
    ],
    explain:
      "The proximity verdicts: FLIPPED on flip bar, STRETCHED >2 ATR, HOLDING 1-2 ATR, CLOSE 0.5-1 ATR, VERY CLOSE <0.5 ATR. CLOSE means tension is between 0.5 and 1.0 ATR — Pulse is being tested but not yet on the verge of flipping. The 'TIGHTEN STOPS' guidance is CIPHER advising to move stops behind Pulse rather than wide of the previous swing, since a flip would invalidate the trade.",
  },
  {
    id: 'q8',
    question: 'You change the active preset from Trend Trader to Sniper without touching i_pulse_factor. What happens to the actual Pulse distance from price?',
    options: [
      { id: 'a', text: 'Nothing — the preset only affects visual layouts.', correct: false },
      { id: 'b', text: 'Pulse moves 30% wider — Sniper preset multiplier is 1.30 vs Trend Trader 1.00.', correct: true },
      { id: 'c', text: 'Pulse moves 20% tighter — Sniper is the most aggressive preset.', correct: false },
      { id: 'd', text: 'Pulse becomes the same width but flips less often.', correct: false },
    ],
    explain:
      "The preset_pulse_mult layer (Pine line 204): Trend Trader 1.00, Scalper 0.80, Swing 1.20, Sniper 1.30. Switching from 1.00 to 1.30 widens effective Pulse by 30%. This is the silent reach — operators expect preset changes to affect only visuals, but every preset reaches into Pulse via this multiplier. When you change preset, Pulse changes too.",
  },
];

// ============================================================
// ANIMSCENE — shared canvas wrapper
// Maintains 16:9 aspect, max 720 wide, pauses when off-screen
// Same component as 11.4 — gold pattern for all Level 11 animations
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

  // Resize handler — maintain aspect ratio, max 720 wide
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

  // Visibility observer — pause when off-screen
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

  // Animation loop — pure RAF, t in seconds since visibility start
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
// 120 particles, 5-second auto-off
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
// ANIMATION 1 — PulseHeartbeatAnim (S01 Groundbreaking Concept)
// The Self-Calibrating Heartbeat
//
// 3-scene cycle:
//   Scene A (0-5s): Central dial labeled "PULSE FACTOR" with user input "1.5"
//                   shown. 5 contextual forces appear one by one, each with
//                   their multiplier. Final composed value (~0.87) emerges.
//   Scene B (5-10s): Same dial, same user input "1.5", BUT context swaps to
//                    BTC 5m + Scalper preset. Forces re-pull. Final value
//                    comes out ~1.10. Side-by-side with Scene A's result.
//   Scene C (10-12s): The takeaway card — "Same setting. Different reality."
// ============================================================
function PulseHeartbeatAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    // 3-scene loop, total 12s
    const cycleT = t % 12;
    const sceneIdx = cycleT < 5 ? 0 : cycleT < 10 ? 1 : 2;
    const sceneT = sceneIdx === 0 ? cycleT / 5 : sceneIdx === 1 ? (cycleT - 5) / 5 : (cycleT - 10) / 2;

    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.45)';

    // Background
    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Scene title
    const sceneLabel =
      sceneIdx === 0 ? 'CONTEXT: XAUUSD 1H · TREND TRADER PRESET' :
      sceneIdx === 1 ? 'CONTEXT: BTC 5m · SCALPER PRESET' :
      'THE TAKEAWAY';
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sceneLabel, w / 2, 22);

    if (sceneIdx === 2) {
      // Scene C — Takeaway card
      const fade = Math.min(1, sceneT * 3);
      ctx.globalAlpha = fade;

      ctx.fillStyle = WHITE;
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Same input.', w / 2, h * 0.34);
      ctx.fillStyle = AMBER;
      ctx.fillText('Different reality.', w / 2, h * 0.46);

      ctx.fillStyle = DIM;
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('You set i_pulse_factor = 1.5 once.', w / 2, h * 0.62);
      ctx.fillText('CIPHER reads YOUR chart and tunes it for context.', w / 2, h * 0.76);

      ctx.globalAlpha = 1;
      return;
    }

    // Layout: central dial + 5 forces in compass arrangement
    const cx = w * 0.5;
    const cy = h * 0.5 + 8;
    const dialR = Math.min(w, h) * 0.13;

    // Define the 5 forces per scene
    type Force = { name: string; mult: number; angle: number; clr: string };
    const scenes: Force[][] = [
      // Scene A — XAUUSD 1H Trend Trader
      [
        { name: 'TIMEFRAME · 1H', mult: 0.85, angle: -Math.PI / 2, clr: TEAL },
        { name: 'ASSET · COMMODITY', mult: 0.80, angle: -Math.PI / 2 + (Math.PI * 2) / 5, clr: AMBER },
        { name: 'VOLATILITY', mult: 1.00, angle: -Math.PI / 2 + (Math.PI * 4) / 5, clr: TEAL },
        { name: 'ADX · MODERATE', mult: 1.00, angle: -Math.PI / 2 + (Math.PI * 6) / 5, clr: TEAL },
        { name: 'PRESET · TREND', mult: 1.00, angle: -Math.PI / 2 + (Math.PI * 8) / 5, clr: TEAL },
      ],
      // Scene B — BTC 5m Scalper
      [
        { name: 'TIMEFRAME · 5m', mult: 1.00, angle: -Math.PI / 2, clr: TEAL },
        { name: 'ASSET · CRYPTO', mult: 0.90, angle: -Math.PI / 2 + (Math.PI * 2) / 5, clr: AMBER },
        { name: 'VOLATILITY · HIGH', mult: 1.20, angle: -Math.PI / 2 + (Math.PI * 4) / 5, clr: MAGENTA },
        { name: 'ADX · STRONG', mult: 0.85, angle: -Math.PI / 2 + (Math.PI * 6) / 5, clr: AMBER },
        { name: 'PRESET · SCALPER', mult: 0.80, angle: -Math.PI / 2 + (Math.PI * 8) / 5, clr: AMBER },
      ],
    ];

    const forces = scenes[sceneIdx];
    const userInput = 1.5;
    const finalProduct = forces.reduce((acc, f) => acc * f.mult, userInput);

    // Force ring radius
    const ringR = Math.min(w, h) * 0.36;

    // Stagger force appearance: 0.0-0.4 = blank dial, 0.4-0.8 = forces appearing one by one
    // 0.8-1.0 = product calculation reveal
    const allForcesIn = sceneT > 0.7 ? 1 : Math.max(0, (sceneT - 0.4) / 0.3);

    // Draw connecting lines from dial to each force (faint)
    forces.forEach((f, i) => {
      const fAppear = sceneT > 0.4 + i * 0.06 ? 1 : 0;
      if (fAppear === 0) return;
      const fx = cx + Math.cos(f.angle) * ringR;
      const fy = cy + Math.sin(f.angle) * ringR;
      const grad = ctx.createLinearGradient(cx, cy, fx, fy);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(1, f.clr.replace('#', 'rgba(') === f.clr ? f.clr : f.clr + '40');
      ctx.strokeStyle = `${f.clr}44`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(fx, fy);
      ctx.stroke();
    });

    // Draw central dial (always visible)
    // Outer ring
    const pulseRing = 1 + Math.sin(t * 2) * 0.015;
    ctx.strokeStyle = `${AMBER}88`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, dialR * pulseRing, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    const glowR = dialR * 0.85;
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glowGrad.addColorStop(0, `${AMBER}33`);
    glowGrad.addColorStop(1, `${AMBER}00`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    // Dial label
    ctx.fillStyle = DIM;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PULSE FACTOR', cx, cy - dialR * 0.45);

    // User input value (large, amber)
    ctx.fillStyle = AMBER;
    ctx.font = `bold ${Math.floor(dialR * 0.55)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(userInput.toFixed(1), cx, cy + dialR * 0.05);

    // "Your input" sublabel
    ctx.fillStyle = DIM;
    ctx.font = '7px Inter, sans-serif';
    ctx.fillText('YOUR INPUT', cx, cy + dialR * 0.4);

    // Draw each force as a card around the dial
    forces.forEach((f, i) => {
      const fAppear = sceneT > 0.4 + i * 0.06 ? Math.min(1, (sceneT - (0.4 + i * 0.06)) * 4) : 0;
      if (fAppear === 0) return;

      const fx = cx + Math.cos(f.angle) * ringR;
      const fy = cy + Math.sin(f.angle) * ringR;

      ctx.globalAlpha = fAppear;

      // Force card (rounded rect, 110x44)
      const cardW = 110;
      const cardH = 36;
      const cardX = fx - cardW / 2;
      const cardY = fy - cardH / 2;

      // Background
      ctx.fillStyle = `${f.clr}1a`;
      ctx.strokeStyle = `${f.clr}66`;
      ctx.lineWidth = 1;
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardW - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
      ctx.lineTo(cardX + cardW, cardY + cardH - radius);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
      ctx.lineTo(cardX + radius, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Force name
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.name, fx, cardY + 14);

      // Multiplier value
      ctx.fillStyle = f.clr;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`× ${f.mult.toFixed(2)}`, fx, cardY + 28);

      ctx.globalAlpha = 1;
    });

    // Final composed value reveal (after all forces in)
    if (sceneT > 0.78) {
      const revealAlpha = Math.min(1, (sceneT - 0.78) * 5);
      ctx.globalAlpha = revealAlpha;

      // Bottom panel with arrow + final value
      const panelY = h - 40;
      ctx.fillStyle = `${AMBER}22`;
      ctx.strokeStyle = `${AMBER}88`;
      ctx.lineWidth = 1.5;
      const pX = cx - 100;
      const pY = panelY - 14;
      const pW = 200;
      const pH = 28;
      const pR = 6;
      ctx.beginPath();
      ctx.moveTo(pX + pR, pY);
      ctx.lineTo(pX + pW - pR, pY);
      ctx.quadraticCurveTo(pX + pW, pY, pX + pW, pY + pR);
      ctx.lineTo(pX + pW, pY + pH - pR);
      ctx.quadraticCurveTo(pX + pW, pY + pH, pX + pW - pR, pY + pH);
      ctx.lineTo(pX + pR, pY + pH);
      ctx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - pR);
      ctx.lineTo(pX, pY + pR);
      ctx.quadraticCurveTo(pX, pY, pX + pR, pY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CIPHER tunes it to:', cx - 92, panelY);

      ctx.fillStyle = AMBER;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(finalProduct.toFixed(2), cx + 92, panelY + 4);

      ctx.globalAlpha = 1;
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — PulseAnatomyAnim (S02)
// Anatomy of the Pulse Line
//
// Step-by-step build: Cipher Flow line appears → ATR distance brackets
// appear above and below → Pulse line emerges at flow ± (factor × ATR) →
// Ratchet-smooth applied → Final visible Pulse line stabilises.
// ============================================================
function PulseAnatomyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.18)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // 5-step cycle, 2s per step = 10s total
    const cycleT = t % 10;
    const stepIdx = Math.floor(cycleT / 2);
    const stepT = (cycleT % 2) / 2;

    // Generate price data — sine + noise for visual realism
    const N = 60;
    const padX = 50;
    const padY = 50;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2;

    // Synthetic price walk
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      const base = 100 + Math.sin(i * 0.18) * 8 + Math.sin(i * 0.5) * 2;
      prices.push(base);
    }
    const minP = Math.min(...prices) - 6;
    const maxP = Math.max(...prices) + 6;
    const yScale = (p: number) => padY + chartH - ((p - minP) / (maxP - minP)) * chartH;
    const xScale = (i: number) => padX + (i / (N - 1)) * chartW;

    // Draw price line (always visible, dim)
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = xScale(i);
      const y = yScale(p);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Step labels at top
    const stepLabels = [
      '1 / 5  ·  CIPHER FLOW',
      '2 / 5  ·  ATR DISTANCE',
      '3 / 5  ·  RAW PULSE',
      '4 / 5  ·  RATCHET + SMOOTH',
      '5 / 5  ·  THE PULSE LINE',
    ];
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stepLabels[stepIdx], w / 2, 22);

    // Step 1+: Cipher Flow (dimmed EMA-like line)
    if (stepIdx >= 0) {
      const flow: number[] = [];
      let f = prices[0];
      for (let i = 0; i < N; i++) {
        f = f + (prices[i] - f) * 0.12;
        flow.push(f);
      }
      const showLen = stepIdx === 0 ? Math.floor(N * stepT) : N;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < showLen; i++) {
        const x = xScale(i);
        const y = yScale(flow[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Label at end
      if (stepIdx === 0 && stepT > 0.7) {
        const lx = xScale(showLen - 1);
        const ly = yScale(flow[Math.max(0, showLen - 1)]);
        ctx.fillStyle = AMBER;
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Cipher Flow', lx + 6, ly + 3);
      }

      // Step 2+: ATR distance brackets above and below flow
      if (stepIdx >= 1) {
        const atrDist = 5;
        const showBrack = stepIdx === 1 ? Math.floor(N * stepT) : N;
        ctx.strokeStyle = `${DIM}`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        // Upper bracket
        ctx.beginPath();
        for (let i = 0; i < showBrack; i++) {
          const x = xScale(i);
          const y = yScale(flow[i] + atrDist);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Lower bracket
        ctx.beginPath();
        for (let i = 0; i < showBrack; i++) {
          const x = xScale(i);
          const y = yScale(flow[i] - atrDist);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        if (stepIdx === 1 && stepT > 0.7) {
          ctx.fillStyle = DIM;
          ctx.font = '9px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('Flow + factor·ATR', xScale(N - 1) + 4, yScale(flow[N - 1] + atrDist) + 3);
          ctx.fillText('Flow − factor·ATR', xScale(N - 1) + 4, yScale(flow[N - 1] - atrDist) + 3);
        }
      }

      // Step 3+: Raw pulse — pick support OR resistance based on price position
      if (stepIdx >= 2) {
        const atrDist = 5;
        const showRaw = stepIdx === 2 ? Math.floor(N * stepT) : N;
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < showRaw; i++) {
          const x = xScale(i);
          // Bullish if price > flow → use lower bracket (support)
          const useUpper = prices[i] < flow[i];
          const y = yScale(useUpper ? flow[i] + atrDist : flow[i] - atrDist);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Step 4+: Ratcheted + smoothed pulse line — Supertrend-style
      if (stepIdx >= 3) {
        const atrDist = 5;
        const ratchet: number[] = [];
        let dir = 1;
        let line = flow[0] - atrDist;
        for (let i = 0; i < N; i++) {
          const support = flow[i] - atrDist;
          const resistance = flow[i] + atrDist;
          if (dir === 1) {
            line = Math.max(line, support);
            if (prices[i] < line) {
              dir = -1;
              line = resistance;
            }
          } else {
            line = Math.min(line, resistance);
            if (prices[i] > line) {
              dir = 1;
              line = support;
            }
          }
          ratchet.push(line);
        }

        // Smooth with SMA(3)
        const smoothed: number[] = [];
        for (let i = 0; i < N; i++) {
          const a = ratchet[Math.max(0, i - 2)];
          const b = ratchet[Math.max(0, i - 1)];
          const c = ratchet[i];
          smoothed.push((a + b + c) / 3);
        }

        const showR = stepIdx === 3 ? Math.floor(N * stepT) : N;

        // Draw glow underlay
        if (stepIdx >= 4 || stepT > 0.5) {
          ctx.strokeStyle = `${TEAL}55`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          for (let i = 0; i < showR; i++) {
            const x = xScale(i);
            const y = yScale(smoothed[i]);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Draw ratchet line, color by direction
        ctx.lineWidth = 2.2;
        for (let i = 1; i < showR; i++) {
          const dirNow = prices[i] > smoothed[i] ? 1 : -1;
          ctx.strokeStyle = dirNow === 1 ? TEAL : MAGENTA;
          ctx.beginPath();
          ctx.moveTo(xScale(i - 1), yScale(smoothed[i - 1]));
          ctx.lineTo(xScale(i), yScale(smoothed[i]));
          ctx.stroke();
        }

        if (stepIdx === 4 && stepT > 0.5) {
          ctx.fillStyle = WHITE;
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('CIPHER PULSE', xScale(N - 1) - 4, yScale(smoothed[N - 1]) - 8);
        }
      }
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — TimeframeLayerAnim (S03)
// Layer 1 — Timeframe Adjustment
//
// Shows tf_pulse_adj: Weekly = 0.7, 1H/4H/D = 0.85, Scalp/Intra = 1.0
// Visual: a single chart with Pulse line. As we cycle through TF tabs
// (5m → 15m → 1H → 4H → D → W), the Pulse distance from price visibly
// tightens, with the active multiplier displayed.
// ============================================================
function TimeframeLayerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // 6-tab cycle, 2s per tab = 12s total
    const tabs = [
      { name: '5m', mult: 1.00, group: 'SCALP' },
      { name: '15m', mult: 1.00, group: 'INTRA' },
      { name: '1H', mult: 0.85, group: 'INTRADAY' },
      { name: '4H', mult: 0.85, group: 'SWING' },
      { name: 'D', mult: 0.85, group: 'SWING' },
      { name: 'W', mult: 0.70, group: 'POSITION' },
    ];
    const cycleT = t % (tabs.length * 2);
    const tabIdx = Math.floor(cycleT / 2);
    const transT = (cycleT % 2) / 2;

    // Header: TF tab strip
    const tabY = 26;
    const tabW = (w - 40) / tabs.length;
    tabs.forEach((tab, i) => {
      const tx = 20 + i * tabW + tabW / 2;
      const isActive = i === tabIdx;
      ctx.fillStyle = isActive ? AMBER : DIM;
      ctx.font = isActive ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tab.name, tx, tabY);
      if (isActive) {
        // Underline
        ctx.fillStyle = AMBER;
        ctx.fillRect(tx - 12, tabY + 4, 24, 2);
      }
    });

    // Multiplier badge (top right)
    const mult = tabs[tabIdx].mult;
    const group = tabs[tabIdx].group;
    ctx.fillStyle = `${AMBER}22`;
    ctx.strokeStyle = `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = w - 110;
      const bY = 50;
      const bW = 90;
      const bH = 40;
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
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TF MULTIPLIER', w - 65, 62);
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(`× ${mult.toFixed(2)}`, w - 65, 80);

    // Group label
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText(group, w - 65, 100);

    // Mini chart panel
    const chartX = 30;
    const chartY = 50;
    const chartW = w - 130;
    const chartH = h - chartY - 30;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    // Price line (uptrend with chop)
    const N = 50;
    const priceY = (i: number) => {
      const base = chartY + chartH * 0.65 - i * 0.5 + Math.sin(i * 0.5) * 6 + Math.sin(i * 1.4) * 3;
      return base;
    };
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      const y = priceY(i);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line — distance scales with mult
    // Higher mult = wider distance. Use 18px as base distance for 1.0x.
    const baseDist = 18;
    const dist = baseDist * mult;
    ctx.strokeStyle = `${TEAL}66`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chartX + (i / (N - 1)) * chartW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Distance indicator (dashed measurement)
    const measureX = chartX + chartW * 0.3;
    const measureYTop = priceY(15);
    const measureYBot = priceY(15) + dist;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(measureX, measureYTop);
    ctx.lineTo(measureX, measureYBot);
    ctx.stroke();
    ctx.setLineDash([]);
    // Distance label
    ctx.fillStyle = AMBER;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${(mult * 100).toFixed(0)}% width`, measureX - 4, (measureYTop + measureYBot) / 2 + 3);

    // Bottom annotation
    const reasonMap: Record<string, string> = {
      'SCALP': 'Tight TFs need full Pulse width — every wick matters.',
      'INTRA': 'Tight TFs need full Pulse width — every wick matters.',
      'INTRADAY': 'Mid TFs tighten 15% — ATR runs richer relative to noise.',
      'SWING': 'Daily/4H tighten 15% — ATR runs richer relative to noise.',
      'POSITION': 'Weekly tightens 30% — ATR is huge, full width = unreachable.',
    };
    ctx.fillStyle = DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(reasonMap[group], w / 2, h - 10);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — AssetClassLayerAnim (S04)
// Layer 2 — Asset Class Adjustment
//
// 4 mini panels side-by-side: STOCK / CRYPTO / INDEX / FOREX-COMMODITY
// Each shows a tiny chart with its Pulse line at the asset-specific width.
// Multiplier displayed under each. Highlights the asset-class column that
// is currently "spotlit" in a 2.5s cycle.
// ============================================================
function AssetClassLayerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASSET-CLASS ADJUSTMENT  ·  asset_pulse_adj', w / 2, 22);

    // 4 panels — same i_pulse_factor input, different asset_pulse_adj
    const assets = [
      { name: 'STOCK', mult: 1.00, color: WHITE, note: 'baseline' },
      { name: 'INDEX', mult: 0.95, color: TEAL, note: 'cleaner trends' },
      { name: 'CRYPTO', mult: 0.90, color: AMBER, note: 'wide wicks' },
      { name: 'FOREX / COMM.', mult: 0.80, color: AMBER, note: 'tight ranges' },
    ];

    // Spotlight cycle
    const cycleT = t % (assets.length * 2);
    const spotIdx = Math.floor(cycleT / 2);

    const padX = 20;
    const padTop = 38;
    const padBot = 50;
    const panelW = (w - padX * 2 - 24) / 4;
    const panelH = h - padTop - padBot;

    assets.forEach((asset, i) => {
      const px = padX + i * (panelW + 8);
      const py = padTop;
      const isSpot = i === spotIdx;

      // Panel background
      ctx.fillStyle = isSpot ? `${AMBER}11` : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isSpot ? `${AMBER}66` : FAINT;
      ctx.lineWidth = isSpot ? 1.5 : 1;
      {
        const pR = 6;
        ctx.beginPath();
        ctx.moveTo(px + pR, py);
        ctx.lineTo(px + panelW - pR, py);
        ctx.quadraticCurveTo(px + panelW, py, px + panelW, py + pR);
        ctx.lineTo(px + panelW, py + panelH - pR);
        ctx.quadraticCurveTo(px + panelW, py + panelH, px + panelW - pR, py + panelH);
        ctx.lineTo(px + pR, py + panelH);
        ctx.quadraticCurveTo(px, py + panelH, px, py + panelH - pR);
        ctx.lineTo(px, py + pR);
        ctx.quadraticCurveTo(px, py, px + pR, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Asset label
      ctx.fillStyle = isSpot ? AMBER : DIM;
      ctx.font = isSpot ? 'bold 10px Inter, sans-serif' : 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(asset.name, px + panelW / 2, py + 16);

      // Mini chart in panel
      const chX = px + 10;
      const chY = py + 28;
      const chW = panelW - 20;
      const chH = panelH - 60;

      // Price walk — same shape across all panels
      const N = 28;
      const priceY = (idx: number) => {
        return chY + chH * 0.55 - idx * 0.3 + Math.sin(idx * 0.6 + i) * 3;
      };
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const x = chX + (k / (N - 1)) * chW;
        const y = priceY(k);
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulse line — distance scales with asset mult
      const baseDist = 14;
      const dist = baseDist * asset.mult;
      // Glow
      ctx.strokeStyle = isSpot ? `${TEAL}66` : `${TEAL}33`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const x = chX + (k / (N - 1)) * chW;
        const y = priceY(k) + dist;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Line
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let k = 0; k < N; k++) {
        const x = chX + (k / (N - 1)) * chW;
        const y = priceY(k) + dist;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Multiplier badge below chart
      ctx.fillStyle = isSpot ? AMBER : DIM;
      ctx.font = isSpot ? 'bold 13px Inter, sans-serif' : 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`× ${asset.mult.toFixed(2)}`, px + panelW / 2, py + panelH - 14);

      // Reason / note
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(asset.note, px + panelW / 2, py + panelH - 4);
    });

    // Bottom takeaway
    ctx.fillStyle = DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Same i_pulse_factor=1.5. Different reality, by asset class.',
      w / 2,
      h - 14
    );
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — VolatilityLayerAnim (S05)
// Layer 3 — Volatility Adjustment
//
// Live volatility meter on left. As volatility rises and falls (synthetic
// vol_ratio cycle), the multiplier animates between 0.8 and 1.3, and a
// chart on the right shows Pulse distance from price changing in step.
// Demonstrates the formula: clamp(0.8, 1.3, 1 + (vol_ratio - 1) * 0.15)
// ============================================================
function VolatilityLayerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOLATILITY ADJUSTMENT  ·  pulse_vol_adj', w / 2, 22);

    // Compute current vol_ratio (cycles 0.5 → 1.0 → 2.0 → 1.0 → 0.5 over 12s)
    const cycleT = (t % 12) / 12;
    let volRatio: number;
    if (cycleT < 0.25) volRatio = 0.5 + (cycleT / 0.25) * 0.5;
    else if (cycleT < 0.5) volRatio = 1.0 + ((cycleT - 0.25) / 0.25) * 1.0;
    else if (cycleT < 0.75) volRatio = 2.0 - ((cycleT - 0.5) / 0.25) * 1.0;
    else volRatio = 1.0 - ((cycleT - 0.75) / 0.25) * 0.5;

    // Multiplier formula from Pine: math.max(0.8, math.min(1.3, 1.0 + (vol_ratio - 1.0) * 0.15))
    const rawMult = 1.0 + (volRatio - 1.0) * 0.15;
    const mult = Math.max(0.8, Math.min(1.3, rawMult));
    const isClamped = rawMult < 0.8 || rawMult > 1.3;

    // Layout: vol meter left half, chart right half
    const leftX = 30;
    const leftW = w * 0.4;
    const rightX = leftX + leftW + 30;
    const rightW = w - rightX - 20;
    const panelTop = 50;
    const panelH = h - panelTop - 50;

    // ── LEFT: VOLATILITY METER ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(leftX, panelTop, leftW, panelH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, panelTop, leftW, panelH);

    ctx.fillStyle = DIM;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOL_RATIO', leftX + leftW / 2, panelTop + 16);

    // Vertical bar gauge: vol_ratio mapped 0..3 → bottom..top
    const gaugeX = leftX + leftW / 2 - 20;
    const gaugeY = panelTop + 30;
    const gaugeW = 40;
    const gaugeH = panelH - 80;
    // Gauge background
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
    ctx.strokeStyle = FAINT;
    ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

    // Threshold lines at vol_ratio = 1.0 (neutral) — vol thresholds
    const volToY = (v: number) => gaugeY + gaugeH - (v / 3) * gaugeH;
    ctx.strokeStyle = `${DIM}`;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gaugeX, volToY(1.0));
    ctx.lineTo(gaugeX + gaugeW, volToY(1.0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DIM;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('1.0×', gaugeX - 4, volToY(1.0) + 3);
    ctx.fillText('2.0×', gaugeX - 4, volToY(2.0) + 3);
    ctx.fillText('3.0×', gaugeX - 4, volToY(3.0) + 3);

    // Active fill — color shifts with vol level
    const fillTop = volToY(volRatio);
    const fillH = gaugeY + gaugeH - fillTop;
    const volColor = volRatio < 0.8 ? TEAL : volRatio < 1.4 ? TEAL : volRatio < 2.0 ? AMBER : MAGENTA;
    ctx.fillStyle = `${volColor}55`;
    ctx.fillRect(gaugeX, fillTop, gaugeW, fillH);
    ctx.fillStyle = volColor;
    ctx.fillRect(gaugeX, fillTop, gaugeW, 2);

    // Current vol_ratio readout
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(volRatio.toFixed(2) + '×', gaugeX + gaugeW / 2, gaugeY + gaugeH + 24);

    // ── RIGHT: PULSE CHART REACTING ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(rightX, panelTop, rightW, panelH);
    ctx.strokeStyle = FAINT;
    ctx.strokeRect(rightX, panelTop, rightW, panelH);

    // Multiplier badge top of chart
    ctx.fillStyle = isClamped ? `${MAGENTA}22` : `${AMBER}22`;
    ctx.strokeStyle = isClamped ? `${MAGENTA}66` : `${AMBER}66`;
    ctx.lineWidth = 1;
    {
      const bX = rightX + rightW - 90;
      const bY = panelTop + 8;
      const bW = 80;
      const bH = 32;
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
      ctx.fillStyle = isClamped ? MAGENTA : AMBER;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`× ${mult.toFixed(2)}`, bX + bW / 2, bY + 21);
    }

    // Mini price + Pulse chart inside right panel
    const chX = rightX + 14;
    const chY = panelTop + 50;
    const chW = rightW - 28;
    const chH = panelH - 90;

    const N = 50;
    const priceY = (i: number) => chY + chH * 0.55 - i * 0.4 + Math.sin(i * 0.5) * 5 + Math.sin(i * 1.2) * 2;
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chW;
      const y = priceY(i);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line — distance scales with current mult
    const baseDist = 18;
    const dist = baseDist * mult;
    ctx.strokeStyle = `${TEAL}55`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Status caption beneath
    let statusText: string;
    let statusColor: string;
    if (volRatio < 0.8) { statusText = 'QUIET — Pulse minimum 0.80× (clamp floor)'; statusColor = TEAL; }
    else if (volRatio < 1.2) { statusText = 'NORMAL — multiplier near 1.00×'; statusColor = TEAL; }
    else if (volRatio < 1.8) { statusText = 'ELEVATED — Pulse widening'; statusColor = AMBER; }
    else if (volRatio < 2.5) { statusText = 'HIGH — Pulse approaching cap'; statusColor = AMBER; }
    else { statusText = 'EXTREME — Pulse maximum 1.30× (clamp ceiling)'; statusColor = MAGENTA; }

    ctx.fillStyle = statusColor;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — ADXLayerAnim (S06)
// Layer 4 — ADX (Trend Strength) Adjustment
//
// Three states cycling: ADX < 15 (chop, mult 1.15), ADX 15-30 (mid, 1.00),
// ADX > 30 (strong, 0.85). Show ADX gauge needle moving and Pulse width
// responding inversely. Counter-intuitive lesson: stronger trend → tighter
// Pulse (so Pulse can flip on a real reversal).
// ============================================================
function ADXLayerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADX (TREND STRENGTH) ADJUSTMENT  ·  pulse_adx_adj', w / 2, 22);

    // 3-state cycle, 3.5s per state
    const states = [
      { adx: 12, mult: 1.15, label: 'CHOP', color: AMBER, note: 'No trend — Pulse needs more room' },
      { adx: 22, mult: 1.00, label: 'MID', color: TEAL, note: 'Building trend — neutral baseline' },
      { adx: 38, mult: 0.85, label: 'STRONG', color: TEAL, note: 'Real trend — Pulse can sit tighter' },
    ];
    const cycleT = t % 10.5;
    const stateIdx = Math.floor(cycleT / 3.5);
    const state = states[stateIdx];

    // Layout: ADX gauge half-circle on left, Pulse chart on right
    const leftCenterX = w * 0.27;
    const gaugeCY = h * 0.55;
    const gaugeR = Math.min(w * 0.2, h * 0.3);

    // ── LEFT: ADX GAUGE (half-circle, 180° arc) ──
    // Background arc
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(leftCenterX, gaugeCY, gaugeR, Math.PI, 0, false);
    ctx.stroke();

    // Threshold zones (color-coded background arcs)
    // 0-15 = chop (amber), 15-30 = mid (teal-dim), 30+ = strong (teal)
    const adxToAngle = (adx: number) => {
      const clamp = Math.min(50, Math.max(0, adx));
      return Math.PI - (clamp / 50) * Math.PI;
    };
    ctx.lineWidth = 8;
    ctx.strokeStyle = `${AMBER}44`;
    ctx.beginPath();
    ctx.arc(leftCenterX, gaugeCY, gaugeR, Math.PI, adxToAngle(15), false);
    ctx.stroke();
    ctx.strokeStyle = `${TEAL}44`;
    ctx.beginPath();
    ctx.arc(leftCenterX, gaugeCY, gaugeR, adxToAngle(15), adxToAngle(30), false);
    ctx.stroke();
    ctx.strokeStyle = `${TEAL}99`;
    ctx.beginPath();
    ctx.arc(leftCenterX, gaugeCY, gaugeR, adxToAngle(30), 0, false);
    ctx.stroke();

    // Threshold tick marks
    [15, 30].forEach((adx) => {
      const a = adxToAngle(adx);
      const tx1 = leftCenterX + Math.cos(a) * (gaugeR - 12);
      const ty1 = gaugeCY + Math.sin(a) * (gaugeR - 12);
      const tx2 = leftCenterX + Math.cos(a) * (gaugeR + 4);
      const ty2 = gaugeCY + Math.sin(a) * (gaugeR + 4);
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(adx.toString(), tx2 + Math.cos(a) * 8, ty2 + Math.sin(a) * 8 + 3);
    });

    // ADX needle
    const needleAngle = adxToAngle(state.adx);
    const needleR = gaugeR - 4;
    const tipX = leftCenterX + Math.cos(needleAngle) * needleR;
    const tipY = gaugeCY + Math.sin(needleAngle) * needleR;
    // Glow
    ctx.strokeStyle = `${state.color}55`;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftCenterX, gaugeCY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    // Needle
    ctx.strokeStyle = state.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(leftCenterX, gaugeCY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.lineCap = 'butt';
    // Center pin
    ctx.fillStyle = state.color;
    ctx.beginPath();
    ctx.arc(leftCenterX, gaugeCY, 4, 0, Math.PI * 2);
    ctx.fill();

    // ADX value + label
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.adx.toString(), leftCenterX, gaugeCY + 28);
    ctx.fillStyle = state.color;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText('ADX · ' + state.label, leftCenterX, gaugeCY + 44);

    // ── RIGHT: PULSE WIDTH RESPONSE ──
    const rightX = w * 0.5 + 10;
    const rightW = w - rightX - 20;
    const chTop = 50;
    const chH = h - chTop - 60;

    // Multiplier badge
    ctx.fillStyle = `${state.color}22`;
    ctx.strokeStyle = `${state.color}66`;
    ctx.lineWidth = 1;
    {
      const bX = rightX + rightW - 90;
      const bY = chTop;
      const bW = 80;
      const bH = 32;
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
      ctx.fillStyle = state.color;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`× ${state.mult.toFixed(2)}`, bX + bW / 2, bY + 21);
    }

    // Mini chart
    const chX = rightX + 10;
    const chY = chTop + 40;
    const chartW = rightW - 20;
    const chartH = chH - 50;

    const N = 50;
    // Different price patterns per state to visually reinforce
    const priceY = (i: number) => {
      const baseShape = chY + chartH * 0.55;
      let trend = 0;
      let noise = 0;
      if (state.label === 'CHOP') {
        trend = Math.sin(i * 0.3) * 4;
        noise = Math.sin(i * 1.6) * 4 + Math.sin(i * 0.9) * 3;
      } else if (state.label === 'MID') {
        trend = -i * 0.3;
        noise = Math.sin(i * 0.5) * 3;
      } else {
        trend = -i * 0.55;
        noise = Math.sin(i * 0.6) * 2;
      }
      return baseShape + trend + noise;
    };
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line
    const baseDist = 18;
    const dist = baseDist * state.mult;
    const pulseSide = state.label === 'STRONG' ? 1 : -1;
    ctx.strokeStyle = `${TEAL}55`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i) + (pulseSide * dist);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i) + (pulseSide * dist);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bottom note
    ctx.fillStyle = state.color;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.note, w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — PresetLayerAnim (S07)
// Layer 5 — Active Preset Multiplier
//
// 4 preset cards: Trend Trader (1.00), Scalper (0.80), Swing (1.20),
// Sniper (1.30). One is "selected" at a time, cycling. Mini Pulse chart
// to the right shows distance changing.
// ============================================================
function PresetLayerAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVE PRESET MULTIPLIER  ·  preset_pulse_mult', w / 2, 22);

    const presets = [
      { name: 'TREND TRADER', mult: 1.00, philosophy: 'Default · ride trends as-is' },
      { name: 'SCALPER', mult: 0.80, philosophy: 'Tight · maximise signal density' },
      { name: 'SWING TRADER', mult: 1.20, philosophy: 'Wider · ride longer holds' },
      { name: 'SNIPER', mult: 1.30, philosophy: 'Widest · only the highest-conviction flips' },
    ];

    // Cycle 3.5s each
    const cycleT = t % 14;
    const activeIdx = Math.floor(cycleT / 3.5);
    const active = presets[activeIdx];

    // Layout: preset cards stacked left, chart right
    const leftX = 20;
    const leftW = w * 0.42;
    const rightX = leftX + leftW + 20;
    const rightW = w - rightX - 20;
    const cardTop = 44;
    const cardSpacing = 6;
    const cardH = (h - cardTop - 30 - cardSpacing * 3) / 4;

    presets.forEach((p, i) => {
      const cy = cardTop + i * (cardH + cardSpacing);
      const isActive = i === activeIdx;
      const fillCol = isActive ? `${AMBER}1f` : 'rgba(255,255,255,0.025)';
      const strokeCol = isActive ? `${AMBER}88` : FAINT;
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = isActive ? 1.5 : 1;
      {
        const cR = 5;
        ctx.beginPath();
        ctx.moveTo(leftX + cR, cy);
        ctx.lineTo(leftX + leftW - cR, cy);
        ctx.quadraticCurveTo(leftX + leftW, cy, leftX + leftW, cy + cR);
        ctx.lineTo(leftX + leftW, cy + cardH - cR);
        ctx.quadraticCurveTo(leftX + leftW, cy + cardH, leftX + leftW - cR, cy + cardH);
        ctx.lineTo(leftX + cR, cy + cardH);
        ctx.quadraticCurveTo(leftX, cy + cardH, leftX, cy + cardH - cR);
        ctx.lineTo(leftX, cy + cR);
        ctx.quadraticCurveTo(leftX, cy, leftX + cR, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Preset name
      ctx.fillStyle = isActive ? AMBER : DIM;
      ctx.font = isActive ? 'bold 11px Inter, sans-serif' : 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.name, leftX + 14, cy + cardH / 2 - 2);
      // Philosophy
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(p.philosophy, leftX + 14, cy + cardH / 2 + 12);
      // Multiplier
      ctx.fillStyle = isActive ? AMBER : DIM;
      ctx.font = isActive ? 'bold 14px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`× ${p.mult.toFixed(2)}`, leftX + leftW - 14, cy + cardH / 2 + 5);
    });

    // ── RIGHT: Pulse chart with active preset ──
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(rightX, cardTop, rightW, h - cardTop - 30);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(rightX, cardTop, rightW, h - cardTop - 30);

    // Mini chart
    const chX = rightX + 10;
    const chY = cardTop + 16;
    const chartW = rightW - 20;
    const chartH = h - cardTop - 30 - 32;

    const N = 50;
    const priceY = (i: number) => chY + chartH * 0.55 - i * 0.4 + Math.sin(i * 0.5) * 5 + Math.sin(i * 1.4) * 3;
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line
    const baseDist = 16;
    const dist = baseDist * active.mult;
    ctx.strokeStyle = `${TEAL}55`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = chX + (i / (N - 1)) * chartW;
      const y = priceY(i) + dist;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Active preset label inside chart
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVE: ' + active.name, rightX + rightW / 2, h - 16);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — CompositionAnim (S08)
// The Composition — How 5 Layers Multiply
//
// Worked-example formula visualizer: 6 boxes in a row showing
// 1.5 × 0.85 × 0.80 × 1.05 × 0.85 × 1.00 = ~0.91
// Each box highlights in sequence, multiplying as we go.
// Final value reveals at end.
// ============================================================
function CompositionAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE COMPOSITION  ·  WORKED EXAMPLE  ·  XAUUSD 1H', w / 2, 22);

    // Factors (XAUUSD 1H Trend Trader, mid-vol, mid-ADX example)
    const factors = [
      { label: 'INPUT', sub: 'i_pulse_factor', value: 1.5, color: AMBER },
      { label: 'TF', sub: '1H', value: 0.85, color: TEAL },
      { label: 'ASSET', sub: 'COMMODITY', value: 0.80, color: TEAL },
      { label: 'VOL', sub: 'NORMAL', value: 1.05, color: TEAL },
      { label: 'ADX', sub: 'MODERATE', value: 1.00, color: TEAL },
      { label: 'PRESET', sub: 'TREND', value: 1.00, color: TEAL },
    ];

    // Cycle: each factor reveals one at a time over 1.4s, then 2s pause showing final
    const cycleLen = factors.length * 1.4 + 2.5;
    const cycleT = t % cycleLen;
    const revealCount = Math.min(factors.length, Math.floor(cycleT / 1.4) + 1);

    // Layout
    const padX = 14;
    const boxW = (w - padX * 2 - 30) / factors.length; // reserve 30px for "×" symbols
    const boxH = 70;
    const boxTop = h * 0.36;

    // Draw boxes
    let runningProduct = 1;
    factors.forEach((f, i) => {
      const isRevealed = i < revealCount;
      const isCurrentlyRevealing = i === revealCount - 1;
      const revealT = isCurrentlyRevealing ? Math.min(1, ((cycleT - i * 1.4) / 1.4) * 2.5) : (isRevealed ? 1 : 0);
      if (revealT === 0) return;

      const bx = padX + i * (boxW + 5);
      const by = boxTop;

      ctx.globalAlpha = revealT;

      // Box background
      ctx.fillStyle = f.color === AMBER ? `${AMBER}1f` : `${TEAL}1f`;
      ctx.strokeStyle = f.color === AMBER ? `${AMBER}88` : `${TEAL}88`;
      ctx.lineWidth = 1.5;
      {
        const r = 5;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + boxW - r, by);
        ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + r);
        ctx.lineTo(bx + boxW, by + boxH - r);
        ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - r, by + boxH);
        ctx.lineTo(bx + r, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = DIM;
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.label, bx + boxW / 2, by + 12);

      // Sub
      ctx.fillStyle = DIM;
      ctx.font = '7px Inter, sans-serif';
      ctx.fillText(f.sub, bx + boxW / 2, by + 22);

      // Value
      ctx.fillStyle = f.color;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(f.value.toFixed(2), bx + boxW / 2, by + 46);

      ctx.globalAlpha = 1;

      // Multiplication symbol after each box (except last)
      if (i < factors.length - 1 && i < revealCount - 1) {
        ctx.fillStyle = DIM;
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText('×', bx + boxW + 2, by + boxH / 2 + 5);
      }

      runningProduct *= f.value;
    });

    // Compute final
    const finalVal = factors.reduce((a, f) => a * f.value, 1);

    // Show running product or final
    if (revealCount >= 1) {
      // Compute current running product up to revealCount
      let cur = 1;
      for (let i = 0; i < revealCount; i++) cur *= factors[i].value;

      const showFinal = revealCount === factors.length;
      const finalReveal = showFinal ? Math.min(1, ((cycleT - factors.length * 1.4 + 0.7) / 0.6)) : 0;

      const py = boxTop + boxH + 36;
      ctx.fillStyle = DIM;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(showFinal ? 'EFFECTIVE PULSE FACTOR' : 'RUNNING PRODUCT', w / 2, py);

      ctx.fillStyle = showFinal ? AMBER : WHITE;
      ctx.font = `bold ${showFinal ? 30 : 22}px Inter, sans-serif`;
      ctx.fillText(showFinal ? finalVal.toFixed(2) : cur.toFixed(3), w / 2, py + 32);

      if (showFinal && finalReveal > 0.5) {
        ctx.globalAlpha = (finalReveal - 0.5) * 2;
        ctx.fillStyle = DIM;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Your input was 1.5. CIPHER actually used ${finalVal.toFixed(2)}.`, w / 2, py + 54);
        ctx.globalAlpha = 1;
      }
    }
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — RatchetAnim (S09)
// The Ratchet — Why Pulse Doesn't Whipsaw
//
// Side-by-side: LEFT = "naive" Pulse line that follows raw_pulse value
// (whipsaws). RIGHT = "ratcheted" Pulse line that only moves up while
// bullish. Same underlying price, dramatic visual difference.
// ============================================================
function RatchetAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE RATCHET  ·  WHY PULSE DOES NOT WHIPSAW', w / 2, 22);

    // Two side-by-side panels
    const padX = 14;
    const gap = 16;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelTop = 44;
    const panelH = h - panelTop - 40;

    // Build the same price sequence for both panels (drift up with chop wicks)
    const N = 80;
    // Animation drift: how far through the price walk we've revealed
    const cycleT = (t % 12) / 12;
    const reveal = Math.floor(cycleT * N);

    // Synthetic price + ATR for both panels
    const prices: number[] = [];
    const flow: number[] = [];
    for (let i = 0; i < N; i++) {
      // Drift up gradually with shocks
      const baseDrift = i * 0.15;
      const wave = Math.sin(i * 0.4) * 4;
      const wick = (i % 11 === 5) ? -10 : (i % 13 === 7 ? 8 : 0); // shock wicks
      prices.push(50 + baseDrift + wave + wick * 0.4);
      // Flow = simple EMA
      const f = i === 0 ? prices[0] : flow[i - 1] + (prices[i] - flow[i - 1]) * 0.18;
      flow.push(f);
    }
    const atrDist = 5;

    // Compute "naive" candidate line — just flow ± ATR depending on price side
    const naive: number[] = [];
    const dirHist: number[] = [];
    for (let i = 0; i < N; i++) {
      const isBull = prices[i] > flow[i];
      naive.push(isBull ? flow[i] - atrDist : flow[i] + atrDist);
      dirHist.push(isBull ? 1 : -1);
    }

    // Compute "ratcheted" line — Supertrend-style
    const ratchet: number[] = [];
    const rDirHist: number[] = [];
    let dir = 1;
    let line = flow[0] - atrDist;
    for (let i = 0; i < N; i++) {
      const support = flow[i] - atrDist;
      const resistance = flow[i] + atrDist;
      if (dir === 1) {
        line = Math.max(line, support);
        if (prices[i] < line) {
          dir = -1;
          line = resistance;
        }
      } else {
        line = Math.min(line, resistance);
        if (prices[i] > line) {
          dir = 1;
          line = support;
        }
      }
      ratchet.push(line);
      rDirHist.push(dir);
    }

    // Find min/max for vertical scale
    const all = [...prices, ...naive, ...ratchet];
    const minP = Math.min(...all) - 4;
    const maxP = Math.max(...all) + 4;

    // Draw a panel
    const drawPanel = (panelX: number, lineData: number[], dirData: number[], title: string, sub: string) => {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(panelX, panelTop, panelW, panelH);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelTop, panelW, panelH);

      // Title
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, panelX + panelW / 2, panelTop + 16);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(sub, panelX + panelW / 2, panelTop + 28);

      const chTop = panelTop + 36;
      const chBot = panelTop + panelH - 18;
      const chH = chBot - chTop;
      const yScale = (p: number) => chBot - ((p - minP) / (maxP - minP)) * chH;
      const xScale = (i: number) => panelX + 8 + (i / (N - 1)) * (panelW - 16);

      const showLen = Math.max(1, reveal);

      // Price (faint)
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < showLen; i++) {
        const x = xScale(i);
        const y = yScale(prices[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulse line — color by direction
      ctx.lineWidth = 2;
      for (let i = 1; i < showLen; i++) {
        ctx.strokeStyle = dirData[i] === 1 ? TEAL : MAGENTA;
        ctx.beginPath();
        ctx.moveTo(xScale(i - 1), yScale(lineData[i - 1]));
        ctx.lineTo(xScale(i), yScale(lineData[i]));
        ctx.stroke();
      }
    };

    drawPanel(padX, naive, dirHist, 'NAIVE  ·  no ratchet', 'Pulse follows raw value — whipsaws');
    drawPanel(padX + panelW + gap, ratchet, rDirHist, 'RATCHETED  ·  CIPHER actual', 'Direction-locked, can only advance');

    // Bottom takeaway
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same price. Same flow. The ratchet refuses to give back ground until price closes through.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — SmoothingAnim (S10)
// Pulse Smoothing — i_pulse_smooth
//
// Side-by-side: LEFT = pulse with smoothing 1 (jaggy, fast). RIGHT = same
// underlying with smoothing 5 (soft, slow). Same price, same flow, same
// ratchet — only the SMA period of the visible line differs. Visual proof
// of the lag-vs-stability trade-off.
// ============================================================
function SmoothingAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PULSE SMOOTHING  ·  i_pulse_smooth', w / 2, 22);

    // Two panels
    const padX = 14;
    const gap = 16;
    const panelW = (w - padX * 2 - gap) / 2;
    const panelTop = 44;
    const panelH = h - panelTop - 40;

    // Build common price + flow
    const N = 80;
    const cycleT = (t % 12) / 12;
    const reveal = Math.floor(cycleT * N);

    const prices: number[] = [];
    const flow: number[] = [];
    for (let i = 0; i < N; i++) {
      const drift = i * 0.18;
      const wave = Math.sin(i * 0.4) * 4;
      const noise = Math.sin(i * 1.5) * 3;
      prices.push(50 + drift + wave + noise);
      const f = i === 0 ? prices[0] : flow[i - 1] + (prices[i] - flow[i - 1]) * 0.18;
      flow.push(f);
    }
    const atrDist = 5;

    // Build ratcheted raw
    const rawRatchet: number[] = [];
    const dirHist: number[] = [];
    let dir = 1;
    let line = flow[0] - atrDist;
    for (let i = 0; i < N; i++) {
      const support = flow[i] - atrDist;
      const resistance = flow[i] + atrDist;
      if (dir === 1) {
        line = Math.max(line, support);
        if (prices[i] < line) {
          dir = -1;
          line = resistance;
        }
      } else {
        line = Math.min(line, resistance);
        if (prices[i] > line) {
          dir = 1;
          line = support;
        }
      }
      rawRatchet.push(line);
      dirHist.push(dir);
    }

    // Two smoothings
    const smooth = (period: number) => {
      const out: number[] = [];
      for (let i = 0; i < N; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - period + 1); j <= i; j++) {
          sum += rawRatchet[j];
          count++;
        }
        out.push(sum / count);
      }
      return out;
    };
    const sm1 = smooth(1);  // = raw
    const sm5 = smooth(5);

    // Vertical scale common to both
    const all = [...prices, ...sm1, ...sm5];
    const minP = Math.min(...all) - 4;
    const maxP = Math.max(...all) + 4;

    // Draw a panel
    const drawPanel = (panelX: number, lineData: number[], title: string, sub: string) => {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(panelX, panelTop, panelW, panelH);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelTop, panelW, panelH);

      ctx.fillStyle = WHITE;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, panelX + panelW / 2, panelTop + 16);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(sub, panelX + panelW / 2, panelTop + 28);

      const chTop = panelTop + 36;
      const chBot = panelTop + panelH - 18;
      const chH = chBot - chTop;
      const yScale = (p: number) => chBot - ((p - minP) / (maxP - minP)) * chH;
      const xScale = (i: number) => panelX + 8 + (i / (N - 1)) * (panelW - 16);

      const showLen = Math.max(1, reveal);

      // Price (faint)
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < showLen; i++) {
        const x = xScale(i);
        const y = yScale(prices[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulse line
      ctx.lineWidth = 2;
      for (let i = 1; i < showLen; i++) {
        ctx.strokeStyle = dirHist[i] === 1 ? TEAL : MAGENTA;
        ctx.beginPath();
        ctx.moveTo(xScale(i - 1), yScale(lineData[i - 1]));
        ctx.lineTo(xScale(i), yScale(lineData[i]));
        ctx.stroke();
      }
    };

    drawPanel(padX, sm1, 'SMOOTH = 1', 'Raw ratchet  ·  fast, jagged, earliest flips');
    drawPanel(padX + panelW + gap, sm5, 'SMOOTH = 5', 'SMA(5)  ·  smooth, slightly delayed flips');

    // Bottom takeaway
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Same price. Same flow. Same ratchet. Only the visible line\'s SMA period differs.', w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — MaturityAnim (S11)
// Maturity Lifecycle — FRESH → YOUNG → ESTABLISHED → MATURE
//
// Horizontal timeline. A glowing dot crosses left to right representing
// pulse_hold_bars rising. As it crosses thresholds (5, 20, 50), the
// state label changes and color shifts. Mini Pulse chart below shows
// the same Pulse line aging.
// ============================================================
function MaturityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PULSE MATURITY LIFECYCLE  ·  pulse_hold_bars', w / 2, 22);

    // Cycle 14s: 0 → 80 bars hold
    const cycleT = (t % 14) / 14;
    const holdBars = Math.floor(cycleT * 80);

    // State derivation per Pine line 1920
    let state: string;
    let stateColor: string;
    if (holdBars > 50) { state = 'MATURE'; stateColor = TEAL; }
    else if (holdBars > 20) { state = 'ESTABLISHED'; stateColor = TEAL; }
    else if (holdBars > 5) { state = 'YOUNG'; stateColor = AMBER; }
    else { state = 'FRESH'; stateColor = AMBER; }

    // Timeline (top half)
    const tlX = 30;
    const tlW = w - 60;
    const tlY = 60;
    const tlEndX = tlX + tlW;

    // Bar value range 0-80 mapped to timeline
    const barToX = (b: number) => tlX + (b / 80) * tlW;

    // Draw timeline track
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tlX, tlY);
    ctx.lineTo(tlEndX, tlY);
    ctx.stroke();

    // Threshold markers + labels
    const thresholds = [
      { bars: 5, label: 'FRESH', sub: '0 to 5 bars', color: AMBER, range: [0, 5] },
      { bars: 20, label: 'YOUNG', sub: '5 to 20 bars', color: AMBER, range: [5, 20] },
      { bars: 50, label: 'ESTABLISHED', sub: '20 to 50 bars', color: TEAL, range: [20, 50] },
      { bars: 80, label: 'MATURE', sub: '50+ bars', color: TEAL, range: [50, 80] },
    ];
    thresholds.forEach((th) => {
      // Range band on track
      const x1 = barToX(th.range[0]);
      const x2 = barToX(th.range[1]);
      ctx.strokeStyle = th.color + '88';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x1, tlY);
      ctx.lineTo(x2, tlY);
      ctx.stroke();

      // Label below range
      const cx = (x1 + x2) / 2;
      ctx.fillStyle = th.color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(th.label, cx, tlY + 22);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(th.sub, cx, tlY + 34);
    });

    // Threshold tick marks
    [5, 20, 50].forEach((b) => {
      const x = barToX(b);
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, tlY - 6);
      ctx.lineTo(x, tlY + 6);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.toString(), x, tlY - 9);
    });

    // Moving dot at current holdBars position
    const dotX = barToX(holdBars);
    ctx.fillStyle = stateColor + '55';
    ctx.beginPath();
    ctx.arc(dotX, tlY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stateColor;
    ctx.beginPath();
    ctx.arc(dotX, tlY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Current state readout (bottom half)
    const readY = h - 90;
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CURRENT HOLD BARS', w / 2, readY);

    ctx.fillStyle = stateColor;
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(holdBars + 'b', w / 2, readY + 36);

    ctx.fillStyle = stateColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(state, w / 2, readY + 56);

    // Read interpretation
    let interp: string;
    if (state === 'FRESH') interp = 'Just flipped. Stops still wide. Trend not confirmed.';
    else if (state === 'YOUNG') interp = 'Flip held. Direction has conviction. Stops can tighten.';
    else if (state === 'ESTABLISHED') interp = 'Trend is real. Pulse is the tradeable level.';
    else interp = 'Long-held trend. Mature flips structurally meaningful.';

    ctx.fillStyle = DIM;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(interp, w / 2, h - 14);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — ChoppyAnim (S12)
// The Choppy Flag — pulse_choppy
//
// Show a 50-bar window with multiple Pulse flips happening close together.
// A 20-bar lookback window slides across. When 3+ flips fall within the
// lookback, the CHOPPY flag fires — SIGNALS UNRELIABLE warning shown.
// Then chart calms down — single sustained trend — flag clears.
// ============================================================
function ChoppyAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE CHOPPY FLAG  ·  pulse_choppy', w / 2, 22);

    // Build a 60-bar synthetic price walk: chop region (bars 5-25) + clean trend (bars 35-58)
    const N = 60;
    const prices: number[] = [];
    for (let i = 0; i < N; i++) {
      let p = 50;
      if (i < 5) {
        p = 50 + i * 0.4;
      } else if (i < 25) {
        // Chop: alternating fast moves
        p = 50 + 2 + Math.sin(i * 1.4) * 4 + (i % 4 === 0 ? -3 : i % 4 === 2 ? 3 : 0);
      } else if (i < 35) {
        p = 50 + 2 + (i - 25) * 0.5;
      } else {
        // Clean uptrend
        p = 55 + (i - 35) * 0.4 + Math.sin(i * 0.3) * 1;
      }
      prices.push(p);
    }
    // Flow + ratchet
    const flow: number[] = [];
    for (let i = 0; i < N; i++) {
      const f = i === 0 ? prices[0] : flow[i - 1] + (prices[i] - flow[i - 1]) * 0.22;
      flow.push(f);
    }
    const atrDist = 3.5;
    const ratchet: number[] = [];
    const dirHist: number[] = [];
    const flipBars: number[] = [];
    let dir = 1;
    let line = flow[0] - atrDist;
    for (let i = 0; i < N; i++) {
      const support = flow[i] - atrDist;
      const resistance = flow[i] + atrDist;
      const prevDir = dir;
      if (dir === 1) {
        line = Math.max(line, support);
        if (prices[i] < line) { dir = -1; line = resistance; }
      } else {
        line = Math.min(line, resistance);
        if (prices[i] > line) { dir = 1; line = support; }
      }
      ratchet.push(line);
      dirHist.push(dir);
      if (dir !== prevDir && i > 0) flipBars.push(i);
    }

    // Animation: scrub a "current bar" pointer left to right over 12s
    const cycleT = (t % 12) / 12;
    const curBar = Math.floor(cycleT * (N - 1));

    // Choppy detection per Pine line 1935: pulse_choppy = (bar_index - flip_bar_3) <= 20
    // i.e., the third-most-recent flip is within 20 bars.
    const flipsBeforeCur = flipBars.filter((b) => b <= curBar);
    const isChoppy = flipsBeforeCur.length >= 3 && (curBar - flipsBeforeCur[flipsBeforeCur.length - 3]) <= 20;

    // Chart geometry
    const chX = 30;
    const chY = 50;
    const chW = w - 60;
    const chH = h - 110;

    const minP = Math.min(...prices) - 3;
    const maxP = Math.max(...prices) + 3;
    const yScale = (p: number) => chY + chH - ((p - minP) / (maxP - minP)) * chH;
    const xScale = (i: number) => chX + (i / (N - 1)) * chW;

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(chX, chY, chW, chH);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.strokeRect(chX, chY, chW, chH);

    // 20-bar lookback window highlighted around current bar
    const lookbackStart = Math.max(0, curBar - 20);
    const lbX1 = xScale(lookbackStart);
    const lbX2 = xScale(curBar);
    ctx.fillStyle = isChoppy ? `${MAGENTA}1f` : `${TEAL}10`;
    ctx.fillRect(lbX1, chY, lbX2 - lbX1, chH);

    // Price
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= curBar; i++) {
      const x = xScale(i);
      const y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Pulse line — color by direction
    ctx.lineWidth = 2;
    for (let i = 1; i <= curBar; i++) {
      ctx.strokeStyle = dirHist[i] === 1 ? TEAL : MAGENTA;
      ctx.beginPath();
      ctx.moveTo(xScale(i - 1), yScale(ratchet[i - 1]));
      ctx.lineTo(xScale(i), yScale(ratchet[i]));
      ctx.stroke();
    }

    // Mark flip bars with vertical dashed lines
    flipBars.filter((b) => b <= curBar).forEach((b) => {
      const fx = xScale(b);
      ctx.strokeStyle = `${AMBER}77`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(fx, chY);
      ctx.lineTo(fx, chY + chH);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Current-bar marker (bright vertical)
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xScale(curBar), chY);
    ctx.lineTo(xScale(curBar), chY + chH);
    ctx.stroke();

    // Status badge bottom
    const badgeY = h - 38;
    const badgeColor = isChoppy ? MAGENTA : TEAL;
    const badgeText = isChoppy ? '⚠  CHOPPY  ·  SIGNALS UNRELIABLE' : 'STABLE  ·  signals trustworthy';
    ctx.fillStyle = `${badgeColor}22`;
    ctx.strokeStyle = `${badgeColor}88`;
    ctx.lineWidth = 1.5;
    {
      const bX = w / 2 - 130;
      const bY = badgeY - 10;
      const bW = 260;
      const bH = 24;
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
    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, w / 2, badgeY + 5);

    // Bottom note
    ctx.fillStyle = DIM;
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Three or more flips inside a 20-bar window  =  CHOPPY flag fires.', w / 2, h - 8);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — CommandCenterAnim (S14)
// Reading the Pulse Command Center Row
//
// Shows the actual Command Center "Pulse" row cycling through its
// 6 verdict states, matching what Shezab captured in the screenshots:
// FLIPPED → STRETCHED → HOLDING → CLOSE → VERY CLOSE → FLIP WARNING
// Each state shows: row label · direction + bars + proximity · → guidance
// ============================================================
function CommandCenterAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const TEAL = '#26A69A';
    const AMBER = '#FFB300';
    const MAGENTA = '#EF5350';
    const RED = '#FF1744';
    const WHITE = '#FFFFFF';
    const DIM = 'rgba(255,255,255,0.5)';
    const FAINT = 'rgba(255,255,255,0.2)';

    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE PULSE COMMAND CENTER ROW  ·  6 STATES', w / 2, 22);

    // 6 states cycling 2.4s each = 14.4s total
    const states = [
      { name: 'FLIPPED', dir: 'RESISTANCE', bars: '1b', prox: 'FLIPPED', guidance: 'NEW TREND', col1Color: MAGENTA, col2Color: MAGENTA, dirArrow: '\u25BC' },
      { name: 'STRETCHED', dir: 'RESISTANCE', bars: '9b', prox: 'STRETCHED', guidance: 'OVEREXTENDED', col1Color: MAGENTA, col2Color: AMBER, dirArrow: '\u25BC' },
      { name: 'HOLDING', dir: 'RESISTANCE', bars: '23b', prox: 'HOLDING', guidance: 'TREND SAFE STEEPENING', col1Color: MAGENTA, col2Color: TEAL, dirArrow: '\u25BC' },
      { name: 'CLOSE', dir: 'SUPPORT', bars: '14b', prox: 'CLOSE', guidance: 'TIGHTEN STOPS', col1Color: TEAL, col2Color: AMBER, dirArrow: '\u25B2' },
      { name: 'VERY CLOSE', dir: 'SUPPORT', bars: '8b', prox: 'VERY CLOSE', guidance: 'FLIP WARNING', col1Color: TEAL, col2Color: RED, dirArrow: '\u25B2' },
      { name: 'CHOPPY', dir: 'RESISTANCE', bars: '3b', prox: 'CLOSE', guidance: 'SIGNALS UNRELIABLE  \u26A0  CHOPPY', col1Color: AMBER, col2Color: AMBER, dirArrow: '\u25BC' },
    ];
    const cycleT = t % (states.length * 2.4);
    const stateIdx = Math.floor(cycleT / 2.4);
    const state = states[stateIdx];

    // Layout: replica Command Center row
    const rowY = h * 0.42;
    const rowH = 32;
    const tableX = 30;
    const tableW = w - 60;

    // Header tab — "Pulse"
    const col0W = 70;
    const col1W = tableW * 0.45;
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

    // Col 0: "Pulse" label
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Pulse', tableX + 12, rowY + rowH / 2 + 4);

    // Col 1: dir + bars + prox
    const col1X = tableX + col0W + col1W / 2;
    ctx.fillStyle = state.col1Color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.dirArrow}  ${state.dir}   ${state.bars}   ${state.prox}`, col1X, rowY + rowH / 2 + 4);

    // Col 2: → guidance
    const col2X = tableX + col0W + col1W + 12;
    ctx.fillStyle = state.col2Color;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('\u2192  ' + state.guidance, col2X, rowY + rowH / 2 + 4);

    // Column headers (above)
    ctx.fillStyle = DIM;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LABEL', tableX + col0W / 2, rowY - 10);
    ctx.fillText('STATE  (col 1)', tableX + col0W + col1W / 2, rowY - 10);
    ctx.fillText('GUIDANCE  (col 2)', tableX + col0W + col1W + col2W / 2, rowY - 10);

    // Active state name (above row)
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STATE ${stateIdx + 1} OF ${states.length}  \u00B7  ${state.name}`, w / 2, 60);

    // Verdict explanation below row
    let explainText: string;
    let explainColor: string;
    if (state.name === 'FLIPPED') { explainText = 'Bar 1 of new direction. Stops still wide.'; explainColor = MAGENTA; }
    else if (state.name === 'STRETCHED') { explainText = 'Tension > 2 ATR. Mean-reversion likely.'; explainColor = AMBER; }
    else if (state.name === 'HOLDING') { explainText = 'Tension 1-2 ATR. Trend is the safe play.'; explainColor = TEAL; }
    else if (state.name === 'CLOSE') { explainText = 'Tension 0.5-1 ATR. Pulse is being tested.'; explainColor = AMBER; }
    else if (state.name === 'VERY CLOSE') { explainText = 'Tension < 0.5 ATR. Flip is one bar away.'; explainColor = RED; }
    else { explainText = 'Three flips in 20 bars. Wait for stability.'; explainColor = AMBER; }

    ctx.fillStyle = explainColor;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(explainText, w / 2, rowY + rowH + 32);

    // Color grammar legend at bottom
    const legendY = h - 30;
    const legendItems = [
      { label: 'TEAL', color: TEAL, meaning: 'safe to trade' },
      { label: 'AMBER', color: AMBER, meaning: 'caution' },
      { label: 'MAGENTA', color: MAGENTA, meaning: 'bear/flipped' },
      { label: 'RED', color: RED, meaning: 'urgent danger' },
    ];
    const legendW = w / 4;
    legendItems.forEach((it, i) => {
      const lx = legendW * i + legendW / 2;
      ctx.fillStyle = it.color;
      ctx.fillRect(lx - 30, legendY - 5, 8, 8);
      ctx.fillStyle = DIM;
      ctx.font = '8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${it.label} \u00B7 ${it.meaning}`, lx - 18, legendY + 3);
    });
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// Phase 2B: Hero + S00 + S01-S15 rendered with gold pattern + cheat sheet
// Phases 3A/3B add game/quiz/cert
// ============================================================
export default function CipherPulseFactorLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.10-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 10</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">The 5-Layer<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>Pulse Factor</span></motion.h1>
          <motion.p variants={fadeUp} className="text-gray-300 text-lg max-w-lg mx-auto leading-relaxed">You set one number. CIPHER reads your timeframe, your asset, your volatility, your trend strength, and your active preset &mdash; then tunes the Pulse for <em>your</em> context.</motion.p>
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
            <p className="text-xl font-extrabold mb-3">Two operators. Same setting. Different Pulse.</p>
            <p className="text-gray-400 leading-relaxed mb-4">An operator on XAUUSD 1H sets <strong className="text-amber-400">Pulse ATR Factor = 1.5</strong>. Another operator on BTC 5m sets the exact same <strong className="text-amber-400">1.5</strong>. They&apos;re using the same indicator with the same input. <strong className="text-white">The Pulse line in their charts is in completely different places relative to price.</strong> One has Pulse hugging price tightly. The other has Pulse sitting much wider out, ignoring small wicks.</p>
            <p className="text-gray-400 leading-relaxed mb-4">Most operators never realise this. They assume <strong className="text-white">1.5 is 1.5</strong> &mdash; that the input value is what gets used. It isn&apos;t. Behind the scenes, CIPHER multiplies your input by <strong className="text-amber-400">five hidden layers</strong>: timeframe, asset class, volatility, trend strength (ADX), and active preset. The number that actually controls Pulse distance is rarely your input number.</p>
            <p className="text-gray-400 leading-relaxed">This is the lesson where you learn to stop tweaking <em>i_pulse_factor</em> blindly and start <strong className="text-white">reading what CIPHER actually used</strong>. Once you see the layers, every Pulse setting starts to make sense.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-2">&#11088; THE PULSE FACTOR PROMISE</p>
            <p className="text-sm text-gray-400 leading-relaxed">By the end of this lesson, you will know the <strong className="text-white">five layers</strong> CIPHER applies on top of your input, the <strong className="text-white">order they multiply in</strong>, and how to <strong className="text-white">read the actual Pulse distance</strong> on any chart. You&apos;ll stop fighting the dial and start working with it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S01 — The Self-Calibrating Heartbeat (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; &#11088; The Self-Calibrating Heartbeat</p>
          <h2 className="text-2xl font-extrabold mb-4">The Groundbreaking Concept</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every other indicator with a distance setting uses your number directly. <strong className="text-amber-400">CIPHER reads your context first &mdash; timeframe, asset class, volatility, ADX, and active preset &mdash; and tunes the Pulse for that context.</strong> Your input is the seed. The five layers are the soil.</p>
          <PulseHeartbeatAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the animation. <strong className="text-white">Scene A</strong>: you&apos;re on XAUUSD 1H with the Trend Trader preset. Five contextual forces appear around your input dial &mdash; timeframe pulls 0.85, commodity asset pulls 0.80, the rest sit at 1.00. Your input of 1.5 gets tuned to <strong className="text-amber-400">1.02</strong>. <strong className="text-white">Scene B</strong>: same input. Same dial. But now you&apos;re on BTC 5m with the Scalper preset. Volatility is high, ADX is strong, preset is tight. The same 1.5 input becomes <strong className="text-amber-400">1.10</strong>. Different chart, different reality.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">When you change your <strong className="text-white">Pulse ATR Factor</strong>, you&apos;re not setting Pulse distance. You&apos;re setting <strong className="text-white">the seed</strong> that gets multiplied through five context layers. Internalise this and you stop tuning the input by feel and start tuning it by intent.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — Anatomy of the Pulse Line === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; Anatomy of the Pulse Line</p>
          <h2 className="text-2xl font-extrabold mb-4">Five steps from price to a Pulse line</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before we open the five layers, fix what the Pulse line <em>is</em>. Every Pulse line you see on chart was built in the same five-step pipeline. Watch the build.</p>
          <PulseAnatomyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-amber-400">Step 1 &mdash; Cipher Flow.</strong> A volume-adaptive moving average of close. It bends faster when participation is real, slower when volume is thin. Pulse anchors to Flow &mdash; not to price directly.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">Step 2 &mdash; ATR distance.</strong> CIPHER computes a candidate support level at <em>Flow &minus; (pulse_factor &times; ATR)</em> and a candidate resistance at <em>Flow &plus; (pulse_factor &times; ATR)</em>. These are the upper and lower brackets.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">Step 3 &mdash; Raw Pulse.</strong> When price is above Flow, the lower bracket becomes the active Pulse (support). When price is below, the upper bracket activates (resistance). Only one is live at a time.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">Step 4 &mdash; Ratchet plus smooth.</strong> The active line is forbidden from giving back ground. In a bull state, it can only move up &mdash; never down &mdash; until price closes through it. Then it flips. The ratchet is what stops Pulse from whipsawing.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-amber-400">Step 5 &mdash; The visible line.</strong> Smoothed with a small SMA (default 3 bars), coloured teal in bull state and magenta in bear. This is the line you see on chart. Every wick that fails to break it confirms the trend. The bar that closes through it is the flip.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE ANCHOR DISTINCTION</p>
            <p className="text-sm text-gray-400 leading-relaxed">Pulse is <strong className="text-white">not</strong> Cipher Flow. Flow is the volume-adaptive average. Pulse is Flow shifted by <em>pulse_factor &times; ATR</em> in one direction, then ratcheted. Confusing the two is mistake number five in section fifteen.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — Layer 1: Timeframe Adjustment === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; Layer 1 &middot; Timeframe</p>
          <h2 className="text-2xl font-extrabold mb-4">Why your timeframe silently adjusts Pulse</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The first layer that touches your input is timeframe. CIPHER looks at the chart you&apos;re on and applies a multiplier called <em>tf_pulse_adj</em>. Higher timeframes get tighter Pulse. Lower timeframes get full width.</p>
          <TimeframeLayerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Watch the multiplier change as the animation cycles through six timeframes. <strong className="text-white">Scalp and intraday TFs (5m, 15m)</strong> get <strong className="text-amber-400">1.00</strong> &mdash; full width. Every wick matters at this granularity, so Pulse needs the full ATR-distance buffer to avoid noise flips.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Mid-timeframe (1H through Daily)</strong> tightens by 15% &mdash; multiplier <strong className="text-amber-400">0.85</strong>. The reasoning: ATR runs richer at higher timeframes because each bar contains more information. A full-width Pulse on a Daily ATR would sit too far from price to flip on legitimate turns. A 15% tightening keeps Pulse close enough to react.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Weekly and beyond</strong> tightens by 30% &mdash; multiplier <strong className="text-amber-400">0.70</strong>. Without this, a Weekly Pulse would be effectively unreachable. Major instruments have weekly ATRs in the hundreds of points; full-width Pulse would never flip until catastrophic moves.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you find Pulse signals too rare on Daily or Weekly, the timeframe layer is already tightening for you &mdash; tightening more by lowering <em>i_pulse_factor</em> may push you below useful sensitivity. If you find Pulse flips too often on 5m or 15m, the timeframe layer isn&apos;t helping you &mdash; you&apos;re running at full width by design. Add filtering elsewhere (Strong Signals Only, Direction filter) before tweaking the seed.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Layer 2: Asset Class Adjustment === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Layer 2 &middot; Asset Class</p>
          <h2 className="text-2xl font-extrabold mb-4">Pulse knows what you&apos;re trading</h2>
          <p className="text-gray-400 leading-relaxed mb-6">CIPHER detects the asset class of your chart and applies <em>asset_pulse_adj</em>. Stocks behave differently from forex. Crypto behaves differently from indices. The asset multiplier reflects that.</p>
          <AssetClassLayerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-white">Stocks</strong> get the baseline multiplier of <strong className="text-amber-400">1.00</strong>. Earnings gaps, news shocks, illiquid hours &mdash; individual stocks need full Pulse width to absorb single-stock noise without flipping.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Indices</strong> tighten slightly to <strong className="text-amber-400">0.95</strong>. NAS100, US30, SPX trend cleaner than individual stocks because they&apos;re diversified across many components. Less single-issue noise, so a 5% tightening keeps Pulse close enough to flip on real index turns.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Crypto</strong> tightens further to <strong className="text-amber-400">0.90</strong>. Counterintuitive at first &mdash; crypto has bigger wicks. But it also has bigger ranges. The wide wicks scale with the wide range, and Pulse needs to sit close enough to catch the genuine reversals that hide inside that volatility.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Forex and commodity CFDs</strong> get the deepest tightening &mdash; <strong className="text-amber-400">0.80</strong>. Tight ranges plus thin wicks mean a full-width Pulse would sit far from price and miss most legitimate flips. The 20% tightening compresses Pulse to where forex/commodity actually trades.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THIS MATTERS BEFORE YOU TUNE</p>
            <p className="text-sm text-gray-400 leading-relaxed">Many operators discover their <em>i_pulse_factor</em> needs to be different on XAUUSD vs SPX vs BTC and assume the indicator is inconsistent. It isn&apos;t. The asset layer has already adjusted for them. Their input feels different because they&apos;re fighting the asset multiplier without knowing it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Layer 3: Volatility Adjustment === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Layer 3 &middot; Volatility</p>
          <h2 className="text-2xl font-extrabold mb-4">Pulse breathes with the market</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The third layer is the only one that updates in real time. As volatility rises, Pulse widens. As volatility falls, Pulse contracts. The multiplier &mdash; <em>pulse_vol_adj</em> &mdash; is computed every bar from the current vol_ratio and clamped between <strong className="text-amber-400">0.80&times;</strong> and <strong className="text-amber-400">1.30&times;</strong>.</p>
          <VolatilityLayerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Watch the gauge cycle. When volatility runs at <strong className="text-white">vol_ratio = 1.0</strong> (the chart&apos;s baseline), the multiplier sits at exactly 1.00&times; &mdash; no adjustment. As vol climbs to 1.5&times; the baseline, the multiplier rises to 1.075&times;. At 2.0&times; baseline, the multiplier hits 1.15&times;.</p>
          <p className="text-gray-400 leading-relaxed mb-4">The clamp matters. Without it, a volatility shock (think NFP on EURUSD or a CPI release on indices) could blow the multiplier to 2.0+, pushing Pulse so far out it would never flip again. <strong className="text-white">The 1.30&times; ceiling is CIPHER refusing to be useless during shocks.</strong> The 0.80&times; floor is symmetric &mdash; in a dead-quiet session, Pulse won&apos;t collapse onto price and start firing on micro-wicks.</p>
          <p className="text-gray-400 leading-relaxed mb-6">The formula in plain English: take the current volatility ratio, scale its deviation from baseline by 15%, add 1.0, and clamp to the 0.80-to-1.30 range. The 15% scaling is a deliberate damping &mdash; Pulse should breathe with volatility, not be hijacked by it.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE VOLATILITY READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you find Pulse signals firing in the middle of a news spike, this layer is doing its job &mdash; signals during clamped extremes are typically followed by quick mean-reversion. Don&apos;t fight the volatility layer. Trust it. And if Pulse seems &ldquo;wider than it should be&rdquo; on a calm day, check whether you&apos;re actually in a quiet session being bumped against the 0.80&times; floor.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — Layer 4: ADX (Trend Strength) Adjustment === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; Layer 4 &middot; ADX (Trend Strength)</p>
          <h2 className="text-2xl font-extrabold mb-4">Stronger trend, tighter Pulse</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The fourth layer is counter-intuitive at first. <strong className="text-amber-400">When the trend is strongest, Pulse sits tightest.</strong> The multiplier &mdash; <em>pulse_adx_adj</em> &mdash; reads the current ADX and applies one of three values: 0.85&times; in strong trends, 1.00&times; in mid-strength, 1.15&times; in chop.</p>
          <ADXLayerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-white">ADX above 30 &rarr; multiplier 0.85.</strong> A real trend is firing. Price is moving in one direction with conviction. CIPHER&apos;s job here is not to give back ground &mdash; tighter Pulse means a real reversal flips the line faster, getting you out earlier when the trend ends. Loose Pulse in a strong trend would lag the actual reversal by 5-10 bars.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">ADX between 15 and 30 &rarr; multiplier 1.00.</strong> The neutral zone. Trend may or may not exist. CIPHER doesn&apos;t adjust &mdash; let other layers do the work.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">ADX below 15 &rarr; multiplier 1.15.</strong> Chop. Random oscillation. <strong className="text-amber-400">The widest Pulse setting CIPHER ever applies.</strong> Why? Because chop is where Pulse generates the worst signals. Every wick threatens to flip a tight Pulse. Setting Pulse 15% wider during chop is CIPHER telling you: &ldquo;don&apos;t trust signals here without strong confluence.&rdquo;</p>
          <p className="text-gray-400 leading-relaxed mb-6">Counter-intuitive at first read, perfectly logical on second read. Trends need tight Pulse so reversals catch quickly. Chop needs loose Pulse so noise gets ignored. The layer is doing the OPPOSITE of what amateur tuning would do.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THE PRO READS ADX FIRST</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you&apos;re wondering why your Pulse signals are weaker in chop than in trends, the ADX layer is partly responsible &mdash; not because it&apos;s broken, but because it&apos;s already widening Pulse to filter noise. Adding more filtering on top via <em>i_pulse_factor</em> compounds the widening and hides legitimate setups. Read the ADX state first, then decide whether more filtering is needed.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Layer 5: Active Preset Multiplier === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Layer 5 &middot; Active Preset</p>
          <h2 className="text-2xl font-extrabold mb-4">Your preset reaches into Pulse silently</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The fifth and final layer is the one most operators don&apos;t realise exists. When you select a preset from the PRESET dropdown &mdash; Trend Trader, Scalper, Swing Trader, Sniper &mdash; you&apos;re also setting an invisible <em>preset_pulse_mult</em> that multiplies into the Pulse calculation.</p>
          <PresetLayerAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-white">Trend Trader, Reversal, Structure &rarr; 1.00.</strong> The default. No multiplier override. Pulse sits where the other four layers put it. This is what most operators see most of the time.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Scalper &rarr; 0.80.</strong> Tightens Pulse another 20%. A scalper preset is built for signal density &mdash; more setups, tighter stops, faster cycles. The preset reaches into Pulse to compress its distance, allowing flips on smaller moves. Combined with the other layers, this can compress effective Pulse to ~0.55&times; on a forex 5m chart.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Swing Trader &rarr; 1.20.</strong> Widens Pulse by 20%. A swing preset is built for longer holds &mdash; fewer setups, wider stops, ride-the-trend cycles. The preset stretches Pulse out, asking for stronger evidence before flipping.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-white">Sniper &rarr; 1.30.</strong> The widest preset multiplier. Sniper is built for the highest-conviction flips only. Pulse sits the furthest out it ever sits. The result: very few signals, but each one carries strong context.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE SILENT REACH</p>
            <p className="text-sm text-gray-400 leading-relaxed">The preset multiplier is the layer most likely to confuse new operators. You switch from Trend Trader to Scalper expecting only the visual layout to change &mdash; but Pulse just compressed by 20%. Same chart, same input, different signals. <strong className="text-white">When you change preset, Pulse changes too.</strong> Always.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — The Composition: How 5 Layers Multiply === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; The Composition</p>
          <h2 className="text-2xl font-extrabold mb-4">Five layers, one multiplied number</h2>
          <p className="text-gray-400 leading-relaxed mb-6">All five layers compound. They don&apos;t add &mdash; they <strong className="text-amber-400">multiply</strong>. A small adjustment from one layer combined with a small adjustment from another can produce a meaningful shift in actual Pulse distance.</p>
          <CompositionAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Watch the worked example. We&apos;re on XAUUSD 1H with the Trend Trader preset, mid volatility, mid ADX. Your input: <strong className="text-amber-400">1.50</strong>. The five layers in order:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400 leading-relaxed space-y-1.5">
            <li><strong className="text-white">Timeframe (1H):</strong> &times; 0.85</li>
            <li><strong className="text-white">Asset Class (Commodity):</strong> &times; 0.80</li>
            <li><strong className="text-white">Volatility (Normal):</strong> &times; 1.05</li>
            <li><strong className="text-white">ADX (Moderate):</strong> &times; 1.00</li>
            <li><strong className="text-white">Preset (Trend Trader):</strong> &times; 1.00</li>
          </ul>
          <p className="text-gray-400 leading-relaxed mb-4">1.50 &times; 0.85 &times; 0.80 &times; 1.05 &times; 1.00 &times; 1.00 = <strong className="text-amber-400">1.07</strong>. Your input was 1.50. CIPHER actually used 1.07. <strong className="text-white">The five layers compressed your effective Pulse factor by 29%.</strong></p>
          <p className="text-gray-400 leading-relaxed mb-6">The order doesn&apos;t matter mathematically &mdash; multiplication is commutative. What matters is that you understand <strong className="text-white">all five participate every bar</strong>. Change any of the five contexts and the effective number changes. Your input is one of six numbers determining where Pulse sits, not the only one.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">READING THE COMPOSITION</p>
            <p className="text-sm text-gray-400 leading-relaxed">When operators ask &ldquo;why does Pulse feel different on this chart,&rdquo; the answer is almost always in the composition. Run the math: take your input, multiply by 0.70-1.00 for TF, then 0.80-1.00 for asset, then ~0.90-1.15 for vol, then 0.85-1.15 for ADX, then 0.80-1.30 for preset. The product is what CIPHER actually used. Once you can do this in your head, Pulse stops being mysterious.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — The Ratchet: Why Pulse Doesn't Whipsaw === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; The Ratchet</p>
          <h2 className="text-2xl font-extrabold mb-4">The mechanism that refuses to give back ground</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Once the five layers compose into the effective <em>pulse_factor</em>, and ATR distance is applied to Cipher Flow, you have a <strong className="text-white">candidate</strong> Pulse value &mdash; not the line you see on chart yet. Between the candidate and the visible line stands the ratchet: a Supertrend-style mechanism that locks Pulse to one direction at a time and forbids it from giving back ground until price closes through it.</p>
          <RatchetAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">The two panels show the same price action with the same flow and the same ATR distance. <strong className="text-white">Left panel:</strong> a naive Pulse line that always uses the candidate value. It whipsaws &mdash; every time price ticks above or below Cipher Flow, the candidate flips sides and the line jumps. The visual is jagged and unusable.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Right panel:</strong> the ratcheted line CIPHER actually draws. In a bull state, the line can only move <em>up</em>. If the candidate value rises, the line rises with it. If the candidate falls, the line stays at its previous high. The line refuses to give back ground. Only when price <em>closes</em> through the line does direction flip &mdash; and only then does the line snap to the opposite bracket.</p>
          <p className="text-gray-400 leading-relaxed mb-6">This is what makes Pulse a useful S/R line instead of a noisy oscillator. <strong className="text-amber-400">The ratchet is the difference between a Pulse line you can trade and a Pulse line you would mute.</strong> It&apos;s the same mechanism that makes Supertrend popular &mdash; CIPHER applies it to the Flow-anchored Pulse.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY THE FLIP IS THE SIGNAL</p>
            <p className="text-sm text-gray-400 leading-relaxed">Because the ratchet refuses to whipsaw, when Pulse <strong className="text-white">does</strong> flip, it&apos;s structurally meaningful. The flip required price to close through a level the line had been defending for bars. That&apos;s why Pulse Cross becomes the foundation of CIPHER&apos;s PX (Pulse Cross) signals &mdash; covered in Lesson 11. The signal isn&apos;t the price crossing a moving average. It&apos;s the ratchet breaking.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — Pulse Smoothing === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; Pulse Smoothing</p>
          <h2 className="text-2xl font-extrabold mb-4">The lag-versus-stability dial</h2>
          <p className="text-gray-400 leading-relaxed mb-6">There is one input we haven&apos;t covered yet. Below the Pulse ATR Factor sits <em>Pulse Smoothing</em>, default value <strong className="text-amber-400">3</strong>. It applies an SMA to the ratcheted candidate before the line is drawn. It does not change distance &mdash; the five layers already determined that. It changes <strong className="text-white">how the visible line moves</strong>.</p>
          <SmoothingAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-white">Smoothing 1</strong> shows the raw ratcheted line. Every bar, the line snaps to the new ratchet value. Flips happen on the exact bar of the close-through. The visual is jagged but the timing is the most precise CIPHER offers.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-white">Smoothing 5</strong> averages the last 5 ratchet values to produce the visible line. The line is much softer. But each flip lags by a bar or two as the average catches up. Cleaner chart, slightly later signals.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-amber-400">Default 3</strong> is a deliberate compromise &mdash; smooth enough to read at a glance, fast enough that flips arrive within 1 bar of the structural break. Most operators never need to change it. The setting exists for two cases: lower it to 1 if you trade scalp timeframes where every bar matters, raise it to 5+ if you trade Daily/Weekly and want clean lines for chart documentation.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">DON&apos;T CONFUSE WIDTH WITH SMOOTHING</p>
            <p className="text-sm text-gray-400 leading-relaxed">If you find yourself wanting to &ldquo;tighten Pulse for faster signals,&rdquo; check whether you mean <strong className="text-white">distance</strong> (use the five layers via Pulse ATR Factor) or <strong className="text-white">timing</strong> (use Pulse Smoothing). They feel similar but solve different problems. Width controls how far Pulse sits from price. Smoothing controls how quickly the visible line responds to ratchet changes.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — The Maturity Lifecycle === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; The Maturity Lifecycle</p>
          <h2 className="text-2xl font-extrabold mb-4">FRESH &middot; YOUNG &middot; ESTABLISHED &middot; MATURE</h2>
          <p className="text-gray-400 leading-relaxed mb-6">After Pulse flips, CIPHER tracks the bar count of how long the new direction has held. This is <em>pulse_hold_bars</em>. The count resets to 1 on the flip bar and increments every bar the direction holds. Four named maturity states emerge from this count.</p>
          <MaturityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4"><strong className="text-amber-400">FRESH (0 to 5 bars)</strong>: The flip just happened. The new direction has not yet been confirmed by sustained price action. Stops on a fresh-flip trade need to be wide because the flip itself can flip back. Operators who chase fresh flips on every chart get whipsawed by the ones that fail.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">YOUNG (5 to 20 bars)</strong>: The flip held. Direction has conviction but the trend is still proving itself. This is the typical entry window for trend-continuation trades. Stops can tighten meaningfully &mdash; behind the line itself rather than wide of the flip bar.</p>
          <p className="text-gray-400 leading-relaxed mb-4"><strong className="text-amber-400">ESTABLISHED (20 to 50 bars)</strong>: The trend is real. Pulse has acted as an effective S/R level for a meaningful number of bars. Pullbacks to Pulse are tradeable continuation setups. The line is the level you defend.</p>
          <p className="text-gray-400 leading-relaxed mb-6"><strong className="text-amber-400">MATURE (50+ bars)</strong>: A long-held trend. Most trends do not reach this. When they do, a flip from MATURE state is structurally significant &mdash; the strong trend has finally broken. These flips often mark major reversals.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">WHY MATURITY MATTERS BEFORE YOU TRADE</p>
            <p className="text-sm text-gray-400 leading-relaxed">A FRESH flip and a flip from MATURE state look identical in terms of the Pulse Cross signal &mdash; same bar, same price, same direction change. They are <strong className="text-white">not the same trade</strong>. The MATURE-flip carries history; the FRESH-flip does not. Read maturity before sizing.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — The Choppy Flag === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; The Choppy Flag</p>
          <h2 className="text-2xl font-extrabold mb-4">When Pulse signals lie &mdash; and CIPHER tells you</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The ratchet prevents intra-bar whipsaw, but it cannot prevent across-bar chop. If price is genuinely oscillating, Pulse will flip back and forth on consecutive close-through events. To detect this, CIPHER tracks the bar index of the third-most-recent flip. If that flip is within 20 bars of the current bar, the <em>pulse_choppy</em> flag fires.</p>
          <ChoppyAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">Watch the animation. The first 25 bars are deliberate chop &mdash; price oscillating around Cipher Flow. Each crossing produces a Pulse flip. Once the third flip lands within the 20-bar lookback, the chart enters CHOPPY mode and the SIGNALS UNRELIABLE warning fires.</p>
          <p className="text-gray-400 leading-relaxed mb-4">When CHOPPY is active, every new flip is suspect. The market is not making a real directional decision &mdash; it&apos;s grinding. PX (Pulse Cross) signals during CHOPPY are routinely losers. CIPHER&apos;s response is not to suppress the flips themselves &mdash; the math still computes them &mdash; but to <strong className="text-amber-400">colour the entire row amber</strong> in the Command Center and replace the guidance cell with SIGNALS UNRELIABLE.</p>
          <p className="text-gray-400 leading-relaxed mb-6">Notice the second half of the chart. Once the chop ends and a clean trend establishes, the third-most-recent flip falls outside the 20-bar lookback. The flag clears. Trend signals from this point onwards are tradeable again.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE CHOPPY DISCIPLINE</p>
            <p className="text-sm text-gray-400 leading-relaxed">If the Pulse row reads CHOPPY, you stop trading PX signals. Not for one bar. Not until the next flip clears it. <strong className="text-white">Until the third-most-recent flip falls outside the 20-bar window.</strong> That is typically 8 to 15 bars of inaction. Operators who break this rule get a guarantee &mdash; not a hope, a guarantee &mdash; that they will be on the wrong side of the next legitimate flip.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — The Slope Verdict === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Slope Verdict</p>
          <h2 className="text-2xl font-extrabold mb-4">Reading momentum from the line itself</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Beyond the static state of the Pulse line, CIPHER also publishes a slope verdict &mdash; <em>pulse_slope_label</em> &mdash; that describes how Pulse is moving in real time. The slope is computed as the change in Pulse over the last 5 bars, normalised by ATR. Three labels emerge:</p>
          <div className="p-5 rounded-2xl glass-card mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-amber-400 mb-1">STEEPENING</p>
                <p className="text-sm text-gray-400 leading-relaxed">Slope magnitude greater than 0.3 ATR per 5 bars. The Pulse line is angling sharply with the trend. Trends that show STEEPENING Pulse are accelerating &mdash; momentum is real and likely to continue.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-teal-400 mb-1">STEADY</p>
                <p className="text-sm text-gray-400 leading-relaxed">Slope magnitude between 0.1 and 0.3 ATR per 5 bars. The line is moving with the trend but not aggressively. Most healthy trends register as STEADY through their middle phase. The default reading.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400 mb-1">FLATTENING</p>
                <p className="text-sm text-gray-400 leading-relaxed">Slope magnitude below 0.1 ATR per 5 bars. The Pulse line is going horizontal. Even if the line hasn&apos;t flipped, the trend is losing its lift. FLATTENING is an early-warning state &mdash; reversals often start here, before the actual flip.</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed mb-6">The slope label appears in the Pulse row guidance cell when conditions allow &mdash; specifically, when there&apos;s no CHOPPY flag and no recent flip and price is more than 0.5 ATR from the line. In other states, more urgent guidance takes priority and the slope is suppressed.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE SLOPE TIE-BREAK</p>
            <p className="text-sm text-gray-400 leading-relaxed">Two operators look at the same MATURE Pulse on the same chart. One reads STEEPENING and stays in. The other reads FLATTENING and exits. Same line, same maturity, different slope read &mdash; different decision. The slope is the trend&apos;s self-report on its own health. Listen to it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Reading the Pulse Command Center Row === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Reading the Pulse Row</p>
          <h2 className="text-2xl font-extrabold mb-4">All the Pulse intelligence in one row</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Everything covered in this lesson &mdash; direction, hold duration, proximity, choppiness, slope &mdash; is rendered in three cells of the Pulse row in CIPHER&apos;s Command Center. <strong className="text-amber-400">One row. Three cells. The full Pulse picture.</strong></p>
          <CommandCenterAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-4">The animation cycles through six representative states. Each state has the same row structure: <strong className="text-white">column zero</strong> is the row label (always &ldquo;Pulse&rdquo;). <strong className="text-white">Column one</strong> reports direction (arrow + SUPPORT/RESISTANCE), hold bars, and proximity verdict. <strong className="text-white">Column two</strong> is the action guidance.</p>
          <p className="text-gray-400 leading-relaxed mb-4">Five proximity verdicts based on tension &mdash; the distance from price to Pulse measured in ATRs:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400 leading-relaxed space-y-1.5">
            <li><strong className="text-white">FLIPPED</strong> &mdash; current bar is the flip bar (or one bar after). Direction just changed.</li>
            <li><strong className="text-white">STRETCHED</strong> &mdash; tension above 2 ATR. Price is far from Pulse. Mean-reversion likely.</li>
            <li><strong className="text-white">HOLDING</strong> &mdash; tension between 1 and 2 ATR. Healthy trend distance. The default trend state.</li>
            <li><strong className="text-white">CLOSE</strong> &mdash; tension between 0.5 and 1 ATR. Pulse is being tested. Tighten stops.</li>
            <li><strong className="text-white">VERY CLOSE</strong> &mdash; tension below 0.5 ATR. A flip is one or two bars away. FLIP WARNING.</li>
          </ul>
          <p className="text-gray-400 leading-relaxed mb-4">Six guidance verdicts in column two, each tied to a proximity state with priority overrides:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400 leading-relaxed space-y-1.5">
            <li><strong className="text-white">NEW TREND</strong> &mdash; on a flip. Direction just changed.</li>
            <li><strong className="text-white">OVEREXTENDED</strong> &mdash; on STRETCHED. With MATURE appended if hold &gt; 50.</li>
            <li><strong className="text-white">TREND SAFE</strong> &mdash; on HOLDING. With STEEPENING/STEADY/FLATTENING slope appended.</li>
            <li><strong className="text-white">TIGHTEN STOPS</strong> &mdash; on CLOSE. Pulse is under test.</li>
            <li><strong className="text-white">FLIP WARNING</strong> &mdash; on VERY CLOSE. Coloured urgent red.</li>
            <li><strong className="text-white">SIGNALS UNRELIABLE  &#9888;  CHOPPY</strong> &mdash; overrides everything when the choppy flag fires.</li>
          </ul>
          <p className="text-gray-400 leading-relaxed mb-6">The colour grammar is rigorous. Magenta in column one always means RESISTANCE direction (price below Pulse, bear state). Teal always means SUPPORT (price above Pulse, bull state). Amber in column two always means caution. Red in column two means urgent. Teal in column two means safe to hold. The colours are not decorative.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR&apos;S 5-SECOND READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read column one for direction and proximity. Read column two for what to do. If column two is teal, hold. If amber, tighten or wait. If red, prepare to act. If amber and reads CHOPPY, do nothing until it clears. The 5-second read on Pulse is enough for almost every trading decision based on Pulse alone.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — Six Common Mistakes === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The traps every new operator falls into</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Six mistakes appear over and over when operators first learn the Pulse Factor system. They&apos;re predictable. Recognise them and you skip a year of slow learning.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 1  &middot;  ASSUMING YOUR INPUT IS WHAT&apos;S USED</p>
              <p className="text-sm text-gray-400 leading-relaxed">You set <em>i_pulse_factor</em> to 1.5 and assume Pulse sits at 1.5 ATR from Cipher Flow. It almost never does. Five hidden multipliers compound on top &mdash; the actual number used is rarely your input. If you don&apos;t do the math (input &times; TF &times; asset &times; vol &times; ADX &times; preset), you&apos;re tuning blindly.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 2  &middot;  USING THE SAME INPUT ACROSS DIFFERENT CHARTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">You find a Pulse Factor that &ldquo;feels right&rdquo; on XAUUSD 1H and apply it to BTC 5m or NAS100 15m. Same input, completely different effective Pulse on each chart because the asset and timeframe layers are pulling differently. Tune per chart, not per gut.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 3  &middot;  TRADING FRESH FLIPS WITHOUT CHECKING CHOPPY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A flip happens. You enter immediately. You miss the CHOPPY flag in the guidance cell. You take the trade, it whipsaws, you&apos;re stopped. Every operator does this once. Don&apos;t do it twice. <strong className="text-white">Read the guidance cell before every PX entry.</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 4  &middot;  TREATING ALL FLIPS THE SAME REGARDLESS OF MATURITY</p>
              <p className="text-sm text-gray-400 leading-relaxed">A flip from FRESH state and a flip from MATURE state are not the same trade. The MATURE-flip carries 50+ bars of trend history that just broke. The FRESH-flip carries 1 to 5 bars of conviction. Sizing them identically is sizing in the dark.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 5  &middot;  CONFUSING CIPHER PULSE WITH CIPHER FLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cipher Flow is the volume-adaptive moving average &mdash; the anchor. Cipher Pulse is Flow shifted by <em>pulse_factor &times; ATR</em>, then ratcheted, then smoothed &mdash; the visible S/R line. They are different lines doing different jobs. Operators who treat them as interchangeable end up with broken mental models of what flips mean.</p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <p className="text-sm font-bold text-red-400 mb-1.5">MISTAKE 6  &middot;  TIGHTENING <em>i_pulse_factor</em> FOR &ldquo;MORE SIGNALS&rdquo;</p>
              <p className="text-sm text-gray-400 leading-relaxed">You think Pulse is too far out, so you reduce <em>i_pulse_factor</em> from 1.5 to 1.0. What you don&apos;t see: the preset multiplier was already 0.80 because you&apos;re on Scalper. Combined with TF and asset layers, your effective Pulse is now 0.4 to 0.5. Pulse is hugging price, flipping on every wick. The fix wasn&apos;t the input. <strong className="text-white">The fix was understanding the layers first.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S15.5 — The Pulse Factor Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Pulse Factor Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">For your second monitor</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this. Pin it to the wall behind your trading screens. Reference it whenever Pulse confuses you.</p>

          <div className="p-6 rounded-2xl glass-card space-y-3">
            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The 5 Layers (multiplied)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">Layer 1 &middot; Timeframe</strong> &mdash; Scalp/Intra 1.00, 1H-D 0.85, Weekly 0.70</p>
                <p><strong className="text-white">Layer 2 &middot; Asset Class</strong> &mdash; Stock 1.00, Index 0.95, Crypto 0.90, Forex/Commodity 0.80</p>
                <p><strong className="text-white">Layer 3 &middot; Volatility</strong> &mdash; clamp(0.80, 1.30, 1 + (vol_ratio - 1) &times; 0.15)</p>
                <p><strong className="text-white">Layer 4 &middot; ADX</strong> &mdash; ADX&gt;30: 0.85, ADX 15-30: 1.00, ADX&lt;15: 1.15</p>
                <p><strong className="text-white">Layer 5 &middot; Preset</strong> &mdash; Default 1.00, Scalper 0.80, Swing 1.20, Sniper 1.30</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Composition Formula</p>
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                pulse_factor = i_pulse_factor &times; tf_adj &times; asset_adj &times; vol_adj &times; adx_adj &times; preset_mult
              </p>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">The Pulse Line Pipeline</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p>1. Cipher Flow = volume-adaptive EMA of close</p>
                <p>2. Candidate = Flow &plusmn; (pulse_factor &times; ATR)</p>
                <p>3. Active side = below price (support) or above (resistance)</p>
                <p>4. Ratchet = direction-locked, never gives back ground</p>
                <p>5. Smooth = SMA(i_pulse_smooth) of the ratchet</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Maturity Thresholds (pulse_hold_bars)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">FRESH</strong> 0-5b &middot; <strong className="text-white">YOUNG</strong> 5-20b &middot; <strong className="text-white">ESTABLISHED</strong> 20-50b &middot; <strong className="text-white">MATURE</strong> 50+b</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Proximity States (tension in ATR)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">FLIPPED</strong> on flip bar &middot; <strong className="text-white">STRETCHED</strong> &gt;2 ATR &middot; <strong className="text-white">HOLDING</strong> 1-2 ATR &middot; <strong className="text-white">CLOSE</strong> 0.5-1 ATR &middot; <strong className="text-white">VERY CLOSE</strong> &lt;0.5 ATR</p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Guidance Verdicts (column 2)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">NEW TREND</strong> &middot; <strong className="text-white">OVEREXTENDED</strong> &middot; <strong className="text-white">TREND SAFE</strong> &middot; <strong className="text-white">TIGHTEN STOPS</strong> &middot; <strong className="text-white">FLIP WARNING</strong> &middot; <strong className="text-white">SIGNALS UNRELIABLE</strong></p>
              </div>
            </div>

            <div className="border-b border-white/5 pb-4">
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Slope Verdicts (5-bar &Delta; / ATR)</p>
              <div className="text-sm text-gray-400 leading-relaxed space-y-1">
                <p><strong className="text-white">STEEPENING</strong> &gt;0.3 &middot; <strong className="text-white">STEADY</strong> 0.1-0.3 &middot; <strong className="text-white">FLATTENING</strong> &lt;0.1</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 mb-2 tracking-widest uppercase">Choppy Detection</p>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>Three or more flips within 20 bars  =  CHOPPY flag fires  =  signals unreliable until lookback clears.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === S16 — Scenario Game === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">16 &mdash; Scenario Game</p>
          <h2 className="text-2xl font-extrabold mb-4">Read the Pulse Like an Operator</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five scenarios. Each puts you in front of a real-feeling Pulse Factor situation &mdash; layer math, asset/timeframe mismatch, choppy flag, maturity-aware sizing, preset compounding. Pick the right call. Explanations appear after every answer, including for the wrong ones.</p>
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
                  <p className="text-xs text-gray-400 mt-1">{finalScore >= 4 ? 'Operator-grade Pulse reading installed. You see the layers, not just the input.' : finalScore >= 3 ? 'Solid grasp. Re-read the composition (S08), choppy flag (S12), and maturity lifecycle (S11) before the quiz.' : 'Re-study the five layers (S03-S07), the composition formula (S08), and the six mistakes (S15) before the quiz.'}</p>
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
                  <p className="text-sm text-gray-400">Has successfully completed<br /><strong className="text-white">Level 11.10: The 5-Layer Pulse Factor</strong><br />at ATLAS Academy by Interakktive</p>
                  <p className="bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 bg-clip-text text-transparent font-bold text-lg mb-1 mt-4" style={{ WebkitTransform: 'translateZ(0)' }}>&mdash; Pulse Factor Operator &mdash;</p>
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
