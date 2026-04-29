// app/academy/lesson/cipher-risk-envelope/page.tsx
// ATLAS Academy — Lesson 11.20: Cipher Risk Envelope [PRO]
// Gold/amber PRO styling — Crown badge — PRO · LEVEL 11 · CIPHER
// How Far Is Too Far.
// Covers: Risk Envelope anatomy (EMA(HL2,20) anchor + 3 nested bands at
//         1.2/2.35/3.5 ATR multiples), regime-adaptive band width
//         (ADX-driven 0.85→1.25 scale + VOLATILE +0.10 bonus), directional
//         asymmetry (trend_side vs counter_side ramps with ADX), 4 risk
//         zones (SAFE/WATCH/CAUTION/DANGER), Mean Reversion Score 0-100
//         continuous (NONE/LOW/MODERATE/HIGH/EXTREME labels), 4 zone
//         transition events (entered_danger, entered_caution, exited_danger,
//         returned_safe), 4 dwell phases (SPIKE/VISIT/ESTABLISHED/ENTRENCHED),
//         the 8-tier Command Center Risk row cascade (transitions outrank
//         states), Adaptive Intensity mode (progressive danger glow +
//         band breathing), coil glow override (vol_compression < 0.6 →
//         outer-edge amber pulse), the Fair Value Line dotted reference,
//         the ✕ transition markers on chart, sizing by zone, trading the
//         transitions vs trading the states, edge cases, mistakes.

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown } from 'lucide-react';

// ============================================================
// GAME ROUNDS — 5 scenario-based Risk Envelope challenges
// Tests cascade priority (transitions outrank states), zone-based
// sizing discipline, dwell-context reading, Adaptive Intensity
// recognition, edge-case skip discipline.
// FILLED IN PHASE 3A — placeholder shells for now.
// ============================================================
const gameRounds: {
  id: string;
  scenario: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; explain: string }[];
}[] = [
  {
    id: 'r1-eur-15m-watch-spike',
    scenario: 'EUR 15m  \u00B7  Risk row reads:  \u25BC WATCH  \u2192 STAY ALERT  2b  \u00B7  Trend row: BEAR TREND  \u00B7  Bias row: FAVOR SHORTS',
    prompt: 'You are looking at the cascade reading. Price has been below fair value in the WATCH zone for 2 bars (just past SPIKE phase). The trend is bearish and bias favors shorts. What is the operator\u2019s response?',
    options: [
      { id: 'a', text: 'Enter a counter-trend long immediately \u2014 WATCH means mean reversion is starting', correct: false, explain: 'WATCH zone is the engine\u2019s &ldquo;mild stretch&rdquo; signal, not a counter-trend trigger. The cascade verdict STAY ALERT specifically tells you to monitor, not to act. Counter-trend entries fire on JUST HIT DANGER, not on WATCH state. Entering long here against a confirmed bear trend at minimal stretch is exactly the wrong play.' },
      { id: 'b', text: 'Take normal-size short entry on next signal trigger \u2014 WATCH doesn&apos;t change sizing', correct: true, explain: 'Correct. The sizing table from S13 says SAFE = 1R AND WATCH = 1R. The verdict STAY ALERT means stay engaged but don&apos;t change posture. With trend bearish, bias favoring shorts, and only mild stretch in the same direction, normal-size short trades on signal triggers are still appropriate. The 2b dwell suffix tells you the condition is fresh, not sustained.' },
      { id: 'c', text: 'Skip the trade entirely \u2014 WATCH means CAUTION is coming', correct: false, explain: 'Skipping at WATCH is overreaction. Most trend continuations spend significant time in WATCH zone; treating WATCH as a no-trade zone would mean missing most trend trades. The dwell counter at 2b tells you the condition is in SPIKE phase, not even VISIT. Skip-thresholds in the table only apply to ENTRENCHED DANGER (rare) \u2014 not to WATCH.' },
      { id: 'd', text: 'Add to existing short positions aggressively \u2014 trend confirms add', correct: false, explain: 'New same-direction adds are governed by zone discipline. WATCH is the last zone where adds are still permitted at normal size, but &ldquo;add aggressively&rdquo; violates the consistent-sizing rule. Adds should match your standard add discipline (typically based on structure, not on trend confirmation alone). The Risk row at WATCH allows adds but doesn\u2019t mandate or upsize them.' },
    ],
  },
  {
    id: 'r2-btc-1h-just-hit-caution',
    scenario: 'BTC 1h  \u00B7  Risk row reads:  \u25BC CAUTION  \u2192 JUST HIT CAUTION (amber)  \u00B7  Amber \u2715 marker just printed on chart  \u00B7  You are LONG with 1.5R unrealized profit',
    prompt: 'JUST HIT CAUTION just fired below fair value. You have a profitable long position. The transition event is showing on the cascade. What does the engine prescribe?',
    options: [
      { id: 'a', text: 'Hold the long full size and wait for it to recover \u2014 unrealized P&amp;L is still positive', correct: false, explain: 'P&amp;L psychology shouldn&apos;t override the engine\u2019s reading. JUST HIT CAUTION on the side opposite your position is exactly the news bar where you should adjust posture. Holding through this transition is how 1.5R unrealized profits become 0.5R or worse \u2014 the engine is telling you the conditions changed.' },
      { id: 'b', text: 'Tighten stops on the long and scale 50% off &mdash; the transition is a management trigger', correct: true, explain: 'Correct. JUST HIT CAUTION (transition tier 2) is primarily an existing-position management trigger \u2014 the engine is telling you the situation just changed. The standard play: tighten stops on same-direction positions and scale 50% off. With your long in profit, locking half via scale-out and trailing the rest with a tighter stop is exactly the prescribed posture for a profitable position when the cascade flips to CAUTION.' },
      { id: 'c', text: 'Enter a fresh short at 1R immediately &mdash; treat as counter-trend signal', correct: false, explain: 'JUST HIT CAUTION is a counter-trend entry candidate, but at 0.5R (per S14), not 1R \u2014 and only after you&apos;ve managed the existing long. Skipping the existing-position management to chase a fresh short ignores the active position. Also, JUST HIT CAUTION counter-trend trades have lower win rates than JUST HIT DANGER counter-trend trades; sizing 1R is the wrong call regardless.' },
      { id: 'd', text: 'Add to the long &mdash; CAUTION at this level means a deeper move is coming', correct: false, explain: 'This violates two separate rules at once. First, no new same-direction entries in CAUTION zone (directional blocking). Second, &ldquo;CAUTION means deeper move coming&rdquo; misreads the verdict entirely \u2014 CAUTION means overextension, with mean reversion statistically more likely than continuation. Adding here is the worst-performing trade type in CIPHER backtests.' },
    ],
  },
  {
    id: 'r3-xau-15m-back-to-safe',
    scenario: 'XAU 15m  \u00B7  Risk row reads:  \u25BC SAFE  \u2192 BACK TO SAFE (teal)  \u00B7  An amber \u2715 marker is visible 6 bars back at the prior CAUTION-entry  \u00B7  You opened a counter-trend long at JUST HIT CAUTION 6 bars ago',
    prompt: 'Your counter-trend long has played out. Price has returned to the SAFE zone, and the BACK TO SAFE transition just fired. What is the prescribed action?',
    options: [
      { id: 'a', text: 'Hold the long &mdash; it might extend further if trend reverses', correct: false, explain: 'BACK TO SAFE is the standard exit point for counter-trend reversal trades. Per S14, this transition signals &ldquo;the arc is complete&rdquo; \u2014 the mean-reversion play has finished its mechanical cycle. Holding past BACK TO SAFE hoping for trend reversal turns a clean counter-trend trade into a hopeful trend trade with no fresh setup justification.' },
      { id: 'b', text: 'Exit the counter-trend long fully &mdash; the arc is complete', correct: true, explain: 'Correct. The counter-trend playbook from S14: enter at JUST HIT CAUTION (or JUST HIT DANGER), scale 50% at LEAVING DANGER, exit fully at BACK TO SAFE. Price has returned to fair value territory, which was the trade\u2019s natural target. The chart has reset. Take the win, exit, and the next setup will involve a fresh trend-direction entry on signal trigger, not continued holding of the now-completed counter-trend trade.' },
      { id: 'c', text: 'Reverse to short immediately &mdash; SAFE means trend can resume', correct: false, explain: 'BACK TO SAFE means the chart has reset, but it doesn\u2019t automatically signal a new direction. A trend-resumption short would need its own signal-engine confirmation (Cipher signal firing, structure break, etc.), not just the SAFE zone re-entry. Reversing on the transition alone skips the analysis layer that should drive new entries.' },
      { id: 'd', text: 'Add to the long &mdash; SAFE means free room to size up', correct: false, explain: 'Adding to a counter-trend trade after it has reached its natural target is the opposite of the prescribed playbook. The trade\u2019s premise (mean reversion from CAUTION) has already played out; adding now means scaling into a position with no fresh thesis. SAFE zone allows new entries at 1R, but those should be fresh setups with their own signal triggers, not extensions of completed trades.' },
    ],
  },
  {
    id: 'r4-adaptive-intensity-recognition',
    scenario: 'You see two screenshots of the same EUR 15m chart, same data, same Intensity setting (Bold), but one has Adaptive Intensity ON and the other OFF. The cloud&apos;s red zones in screenshot A look more vivid and brighter on the right side where price has stretched deep; screenshot B has uniform red throughout.',
    prompt: 'Which screenshot has Adaptive Intensity turned ON?',
    options: [
      { id: 'a', text: 'Screenshot A &mdash; brighter red on the right side reflects progressive danger glow', correct: true, explain: 'Correct. Adaptive Intensity ON adds two effects: progressive danger glow (transparency drops by 8 at score &gt; 60, by 15 at score &gt; 80) and band breathing (transparency &plusmn;5 with ATR delta). The brighter red where price is deepest into DANGER reveals the score-driven glow effect. Screenshot B&apos;s uniform red is the static Adaptive OFF rendering &mdash; same Intensity, same Bold setting, but no dynamic response to the underlying score.' },
      { id: 'b', text: 'Screenshot B &mdash; uniform red is the brighter rendering', correct: false, explain: 'Inverted reading. Adaptive Intensity OFF produces the uniform static fill (which is screenshot B per the description). The whole point of Adaptive ON is dynamic responsiveness \u2014 if both screenshots looked identical, the toggle would be doing nothing. The differentiating feature is the brightness gradient that responds to the mr_score.' },
      { id: 'c', text: 'Both have it ON &mdash; the difference is just the chart&apos;s actual conditions', correct: false, explain: 'The scenario specifies same data, same setup, same Intensity \u2014 the only variable is the toggle. If conditions were the variable, the screenshots would show different price action; they don\u2019t. Per S11, Adaptive Intensity is the single source of dynamic visual response on the bands. Recognition of the effect requires identifying which screenshot has the responsive rendering.' },
      { id: 'd', text: 'Neither &mdash; Adaptive Intensity changes the cascade, not the visual', correct: false, explain: 'Common misreading. Adaptive Intensity is purely a visual layer effect \u2014 it does NOT change the cascade verdict, the score, the zones, or any engine output. The Risk row reads identically whether Adaptive is ON or OFF. What changes is only the kinetic responsiveness of the band fills on the chart. The toggle exists for visual feedback amplification only.' },
    ],
  },
  {
    id: 'r5-cascade-priority-transition-vs-state',
    scenario: 'Cascade inputs  \u00B7  rz_entered_caution = TRUE  \u00B7  current zone = DANGER  \u00B7  dwell = 1b',
    prompt: 'A transition fired this bar (rz_entered_caution), but the current zone is actually DANGER (price escalated through CAUTION into DANGER on a single bar). Which Risk row cascade verdict appears?',
    options: [
      { id: 'a', text: 'REDUCE SIZE  1b &mdash; because the current zone is DANGER and dwell is 1b', correct: false, explain: 'REDUCE SIZE is tier 5 (state-based DANGER). With rz_entered_caution active, the cascade has already matched higher in the priority order. Per S10, transitions outrank states &mdash; tier 1 (JUST HIT DANGER), tier 2 (JUST HIT CAUTION), and tier 3 (LEAVING DANGER) all sit above tier 5. The cascade short-circuits before reaching tier 5 in this scenario.' },
      { id: 'b', text: 'JUST HIT CAUTION &mdash; transitions outrank states, even when zone is higher', correct: false, explain: 'Close, but missed the higher-tier transition. JUST HIT CAUTION is tier 2 of the cascade. However, when price escalates through CAUTION and into DANGER on a single bar, BOTH rz_entered_caution AND rz_entered_danger fire \u2014 and rz_entered_danger is tier 1 (JUST HIT DANGER), which outranks tier 2. The cascade matches at tier 1; tier 2 is suppressed.' },
      { id: 'c', text: 'JUST HIT DANGER &mdash; the highest-priority transition fires when price reached DANGER', correct: true, explain: 'Correct. When price escalates through multiple zones in a single bar, both transition flags fire (rz_entered_caution because it crossed the inner-to-mid boundary, AND rz_entered_danger because it crossed the mid-to-outer boundary). The cascade evaluates top-down and the first match wins: tier 1 (JUST HIT DANGER) fires and tier 2 (JUST HIT CAUTION) is suppressed. The verdict displays as JUST HIT DANGER in magenta. The operator response: counter-trend entry at 0.5R, stop beyond outer band, target fair value.' },
      { id: 'd', text: 'TIGHTEN STOPS  1b &mdash; because CAUTION was the last zone change that fired', correct: false, explain: 'TIGHTEN STOPS is tier 6 (state-based CAUTION). Two issues: first, transitions outrank states. Second, the current zone is DANGER, not CAUTION \u2014 even if no transitions had fired, the state-based verdict would be REDUCE SIZE (tier 5), not TIGHTEN STOPS. The reasoning conflates transition direction with current state.' },
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
    id: 'q1-anchor-formula',
    question: 'What is the formula for the Risk Envelope&apos;s Fair Value Line?',
    options: [
      { id: 'a', text: 'SMA(close, 20) &mdash; simple moving average of close', correct: false },
      { id: 'b', text: 'EMA(close, 50) &mdash; longer EMA of close', correct: false },
      { id: 'c', text: 'EMA(HL2, 20) &mdash; exponential MA of (high+low)/2 over 20 bars', correct: true },
      { id: 'd', text: 'EMA(OHLC4, 14) &mdash; EMA of typical price over 14', correct: false },
    ],
    explain: 'The anchor is EMA of HL2 over 20 bars. HL2 (the bar&apos;s midpoint) is more stable than close because it averages over the bar&apos;s entire range, smoothing out close-noise around opens and news events. Twenty bars balances responsiveness against stability \u2014 long enough to filter noise, short enough to track meaningful regime shifts. EMA (vs SMA) responds faster to fresh action without the &ldquo;drop-off&rdquo; effect of older bars leaving an SMA window. Every band, every zone, every transition event is measured relative to this single line.',
  },
  {
    id: 'q2-regime-scale-range',
    question: 'What is the range of the regime-adaptive scale factor (excluding the VOLATILE bonus)?',
    options: [
      { id: 'a', text: '0.50 to 1.50 &mdash; full half-to-double swing', correct: false },
      { id: 'b', text: '0.85 to 1.25 &mdash; ADX-driven smooth ramp', correct: true },
      { id: 'c', text: '0.95 to 1.05 &mdash; tight 10% spread', correct: false },
      { id: 'd', text: '1.00 to 1.40 &mdash; widens only, never tightens', correct: false },
    ],
    explain: 'The scale factor formula is regime_scale = 0.85 + trend_pct * 0.004, producing a continuous range from 0.85 (ADX 0, range conditions) to 1.25 (ADX 100, strong trend). The 0.85-1.25 spread is calibrated empirically: tighter than 0.85 in ranges would push CAUTION onto noise; wider than 1.25 would suppress legitimate overextension warnings. The VOLATILE regime bonus adds +0.10 stacked on top, producing an effective max of 1.35. The continuous ramp avoids stepped thresholds that would cause zone flicker at ADX boundaries.',
  },
  {
    id: 'q3-asymmetry-direction',
    question: 'In a strong bull trend, how does directional asymmetry affect the bands?',
    options: [
      { id: 'a', text: 'Both bands widen by 15% &mdash; symmetric trend bonus', correct: false },
      { id: 'b', text: 'Upper band widens; lower band tightens \u2014 give the trend room, catch pullbacks early', correct: true },
      { id: 'c', text: 'Upper band tightens; lower band widens \u2014 fight the trend', correct: false },
      { id: 'd', text: 'Asymmetry is disabled in strong trends &mdash; only ranges use asymmetry', correct: false },
    ],
    explain: 'In a bull trend, the trend-side (upper band) scales by 1.0 + asym_factor (up to +15% wider) while the counter-side (lower band) scales by 1.0 - asym_factor (up to 15% tighter). The reasoning: upside extension is normal and expected during a bull trend (give the trend room); downside pullbacks are riskier and could be early reversal signals (catch them earlier). This makes CAUTION fire later on the trend-side and earlier on the counter-side. In a bear trend, asymmetry mirrors. In a range (ADX &lt; 15), asymmetry is exactly 0 \u2014 bands are symmetric.',
  },
  {
    id: 'q4-zone-classification-input',
    question: 'Which price input drives zone classification (SAFE/WATCH/CAUTION/DANGER)?',
    options: [
      { id: 'a', text: 'Bar high or low &mdash; whichever is more extended', correct: false },
      { id: 'b', text: 'Bar close &mdash; wicks don&apos;t count', correct: true },
      { id: 'c', text: 'Bar HL2 midpoint &mdash; same as the anchor', correct: false },
      { id: 'd', text: 'Live tick price &mdash; updates intra-bar', correct: false },
    ],
    explain: 'The zone classification uses the bar&apos;s close, not high/low. This is intentional: wicks beyond a band do NOT trigger a zone change \u2014 only the bar&apos;s close. A 5-tick wick that pierces the outer band but closes back inside the inner band registers as SAFE, not DANGER. This design avoids zone flicker on intra-bar wicks that don&apos;t represent sustained price action. Zone transitions therefore fire on bar-close moments, never mid-bar. The Mean Reversion Score, by contrast, IS live and updates intra-bar; the score gives continuous awareness while the zones give confirmed state changes.',
  },
  {
    id: 'q5-mr-score-at-outer-band',
    question: 'When price reaches the outer band, what does the Mean Reversion Score read?',
    options: [
      { id: 'a', text: '50 &mdash; the midpoint of the 0-100 scale', correct: false },
      { id: 'b', text: '80 &mdash; calibrated to reserve 80-100 for beyond-outer extensions', correct: true },
      { id: 'c', text: '100 &mdash; outer band is the maximum extension', correct: false },
      { id: 'd', text: '60 &mdash; the mr_overextended boolean threshold', correct: false },
    ],
    explain: 'The mr_score formula is risk_atr_dist / mr_max_ref &times; 80, capped at 100. The multiplier of 80 is intentional: at the outer band, the score reads 80, NOT 100. The reasoning: price often goes beyond the outer band during news shocks or trend accelerations. If 100 = at outer band, the engine would have nowhere to go for &ldquo;past outer band&rdquo;. By calibrating outer = 80, the engine reserves 80-100 for genuinely extreme overextensions \u2014 a score of 95 is dramatically more meaningful than a score of 81. The calibration preserves resolution at the upper end where it matters most.',
  },
  {
    id: 'q6-cascade-priority',
    question: 'In the 8-tier Risk cascade, what happens when rz_entered_caution fires while the zone is already DANGER?',
    options: [
      { id: 'a', text: 'JUST HIT CAUTION fires &mdash; the active transition wins regardless of zone', correct: false },
      { id: 'b', text: 'REDUCE SIZE fires &mdash; the current zone overrides past transitions', correct: false },
      { id: 'c', text: 'JUST HIT DANGER fires &mdash; price crossing into DANGER also fires that flag, which outranks tier 2', correct: true },
      { id: 'd', text: 'Both verdicts display in cell 2 with a separator', correct: false },
    ],
    explain: 'When price escalates through multiple zones in a single bar, BOTH transition flags fire \u2014 rz_entered_caution because the inner-to-mid boundary was crossed, AND rz_entered_danger because the mid-to-outer boundary was also crossed. The cascade evaluates top-down with first-match-wins: tier 1 (JUST HIT DANGER) fires first, and tier 2 (JUST HIT CAUTION) is suppressed because the cascade short-circuits at the first match. The verdict displays only the highest-priority active condition. The cascade never displays multiple verdicts simultaneously \u2014 the architecture is single-message-per-bar by design.',
  },
  {
    id: 'q7-sizing-caution',
    question: 'In the sizing table, what R-multiplier does the engine prescribe for the CAUTION zone?',
    options: [
      { id: 'a', text: '1R &mdash; same as SAFE and WATCH', correct: false },
      { id: 'b', text: '0.5R &mdash; half size, plus tighten stops and 50% scale-out on existing', correct: true },
      { id: 'c', text: '0.25R &mdash; quarter size, defensive posture', correct: false },
      { id: 'd', text: 'Skip entirely &mdash; no entries in CAUTION', correct: false },
    ],
    explain: 'The sizing table from S13: SAFE = 1R unconstrained, WATCH = 1R alert, CAUTION = 0.5R defensive, DANGER = 0.25R reduce, ENTRENCHED DANGER = SKIP. The 0.5R prescription for CAUTION pairs with three other rules: tighten stops on existing same-direction positions, scale 50% off existing, and no new same-direction entries (directional blocking). The half-size + scale-out + no-add discipline is the core risk management posture for CAUTION. Sizing identically across zones is one of the six common mistakes \u2014 it systematically degrades performance because CAUTION-zone trades have meaningfully lower win rates than SAFE-zone trades.',
  },
  {
    id: 'q8-coil-glow-threshold',
    question: 'At what value of vol_compression does the coil glow override fire?',
    options: [
      { id: 'a', text: 'vol_compression &lt; 0.6 &mdash; ATR has dropped below 60% of baseline', correct: true },
      { id: 'b', text: 'vol_compression &gt; 1.4 &mdash; ATR has expanded above 140% of baseline', correct: false },
      { id: 'c', text: 'vol_compression == 1.0 &mdash; ATR exactly equals baseline', correct: false },
      { id: 'd', text: 'vol_compression &lt; 0.3 &mdash; extreme compression only', correct: false },
    ],
    explain: 'The coil glow override fires when vol_coiled = vol_compression &lt; 0.6, where vol_compression = atr_fast_check / atr_slow_check (typically ATR(20) / ATR(50)). When current ATR drops below 60% of recent baseline, the outer band edges switch from invisible to a pulsing amber glow, and the danger zone fill swaps from teal/magenta to amber. The 0.6 threshold puts the market in roughly the bottom decile of recent volatility \u2014 statistically meaningful compression without false-firing on routine consolidation. Tighter (0.5) would miss real coils; looser (0.7) would false-fire too often. The override is rare, kinetic, and high-conviction when it appears.',
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
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  aspectRatio?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      return;
    }
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const sizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = w / aspectRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(container);

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [visible, draw, aspectRatio]);

  return (
    <div ref={containerRef} className={`w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ============================================================
// CONFETTI — celebratory particles on cert reveal
// ============================================================
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#FFB300', '#26A69A', '#FFC400', '#FFD54F', '#FFA000'];
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vrot: number;
      size: number;
      color: string;
      life: number;
    };
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
      });
    }

    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.rot += p.vrot;
        p.life = Math.max(0, 1 - elapsed / 5);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (elapsed < 5) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// ============================================================
// ANIMATION 1 — HowFarIsTooFarAnim (S01 GC)
// Two side-by-side panels: LEFT = fixed Bollinger-style bands that
// produce false-DANGER signals in strong trends. RIGHT = CIPHER's
// regime-adaptive bands that widen with ADX and give the trend room.
// Same price action, two reads — one wrong, one calibrated.
// ============================================================
function HowFarIsTooFarAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showLeft = phase >= 0.05;
    const showRight = phase >= 0.40;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FIXED BANDS  vs  REGIME-ADAPTIVE BANDS  \u00B7  SAME PRICE, TWO READS', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.14;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.78;

    type Panel = {
      x: number;
      title: string;
      subtitle: string;
      bandType: 'fixed' | 'adaptive';
      verdict: string;
      verdictColor: string;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      {
        x: padX,
        title: 'FIXED BANDS',
        subtitle: 'always 2.0 ATR \u00B7 trend-blind',
        bandType: 'fixed',
        verdict: 'FALSE DANGER \u2014 EXIT TOO EARLY',
        verdictColor: '#EF5350',
        visible: showLeft,
        revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0,
      },
      {
        x: padX + panelW + 20,
        title: 'REGIME-ADAPTIVE',
        subtitle: 'ADX-scaled \u00B7 trend-aware',
        bandType: 'adaptive',
        verdict: 'STILL SAFE \u2014 RIDE THE TREND',
        verdictColor: '#26A69A',
        visible: showRight,
        revealAlpha: showRight ? Math.min(1, (phase - 0.40) / 0.20) : 0,
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

      // Title + subtitle
      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 16);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.subtitle, p.x + panelW / 2, padY + 30);

      // Chart area
      const chartTop = padY + 42;
      const chartBot = padY + panelH - 42;
      const chartH = chartBot - chartTop;
      const chartL = p.x + 14;
      const chartR = p.x + panelW - 14;
      const chartW = chartR - chartL;

      // Generate a synthetic uptrend price series
      const N = 40;
      const priceY: number[] = [];
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        // Strong uptrend with small wiggles
        const trend = chartBot - chartH * (0.20 + x * 0.55);
        const wiggle = Math.sin(i * 0.7) * chartH * 0.04;
        priceY.push(trend + wiggle);
      }

      // Draw the bands
      if (p.bandType === 'fixed') {
        // Fixed bands: parallel to price's mean line, constant width
        for (let i = 0; i < N; i++) {
          const x = chartL + (i / (N - 1)) * chartW;
          // Mean line is the simple average
          const meanY = priceY[i] + chartH * 0.05; // mean drifts behind in uptrend
          const bandUp = meanY - chartH * 0.18;
          const bandDn = meanY + chartH * 0.18;

          // Band fill
          if (i > 0) {
            const xPrev = chartL + ((i - 1) / (N - 1)) * chartW;
            const meanYPrev = priceY[i - 1] + chartH * 0.05;
            const bandUpPrev = meanYPrev - chartH * 0.18;
            const bandDnPrev = meanYPrev + chartH * 0.18;

            // Outer band (red — DANGER in fixed-band view)
            ctx.fillStyle = `rgba(239,83,80,${0.20 * p.revealAlpha})`;
            ctx.beginPath();
            ctx.moveTo(xPrev, bandUpPrev - chartH * 0.08);
            ctx.lineTo(x, bandUp - chartH * 0.08);
            ctx.lineTo(x, bandUp);
            ctx.lineTo(xPrev, bandUpPrev);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(xPrev, bandDnPrev);
            ctx.lineTo(x, bandDn);
            ctx.lineTo(x, bandDn + chartH * 0.08);
            ctx.lineTo(xPrev, bandDnPrev + chartH * 0.08);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Draw mean line (dotted)
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * p.revealAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = chartL + (i / (N - 1)) * chartW;
          const meanY = priceY[i] + chartH * 0.05;
          if (i === 0) ctx.moveTo(x, meanY);
          else ctx.lineTo(x, meanY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Adaptive bands: widen as trend strengthens (right side gets wider)
        for (let i = 1; i < N; i++) {
          const x = chartL + (i / (N - 1)) * chartW;
          const xPrev = chartL + ((i - 1) / (N - 1)) * chartW;
          // Trend strength rises 0 → 1 left to right
          const trendStrength = i / (N - 1);
          // Bands widen 50% from start to end
          const bandHalfWidth = chartH * (0.18 + trendStrength * 0.13);
          const bandHalfWidthPrev = chartH * (0.18 + ((i - 1) / (N - 1)) * 0.13);

          // Asymmetry: in uptrend, upper band wider, lower tighter
          const upperWidth = bandHalfWidth * (1.0 + trendStrength * 0.20);
          const upperWidthPrev = bandHalfWidthPrev * (1.0 + ((i - 1) / (N - 1)) * 0.20);
          const lowerWidth = bandHalfWidth * (1.0 - trendStrength * 0.10);
          const lowerWidthPrev = bandHalfWidthPrev * (1.0 - ((i - 1) / (N - 1)) * 0.10);

          const meanY = priceY[i] + chartH * 0.05;
          const meanYPrev = priceY[i - 1] + chartH * 0.05;

          const bandUp = meanY - upperWidth;
          const bandUpPrev = meanYPrev - upperWidthPrev;
          const bandDn = meanY + lowerWidth;
          const bandDnPrev = meanYPrev + lowerWidthPrev;

          // Outer band — TEAL because direction is bullish
          ctx.fillStyle = `rgba(38,166,154,${0.18 * p.revealAlpha})`;
          ctx.beginPath();
          ctx.moveTo(xPrev, bandUpPrev - chartH * 0.08);
          ctx.lineTo(x, bandUp - chartH * 0.08);
          ctx.lineTo(x, bandUp);
          ctx.lineTo(xPrev, bandUpPrev);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(xPrev, bandDnPrev);
          ctx.lineTo(x, bandDn);
          ctx.lineTo(x, bandDn + chartH * 0.08);
          ctx.lineTo(xPrev, bandDnPrev + chartH * 0.08);
          ctx.closePath();
          ctx.fill();
        }

        // Mean line
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * p.revealAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = chartL + (i / (N - 1)) * chartW;
          const meanY = priceY[i] + chartH * 0.05;
          if (i === 0) ctx.moveTo(x, meanY);
          else ctx.lineTo(x, meanY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw price line
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = chartL + (i / (N - 1)) * chartW;
        if (i === 0) ctx.moveTo(x, priceY[i]);
        else ctx.lineTo(x, priceY[i]);
      }
      ctx.stroke();

      // Verdict at bottom
      const vr = parseInt(p.verdictColor.slice(1, 3), 16);
      const vg = parseInt(p.verdictColor.slice(3, 5), 16);
      const vb = parseInt(p.verdictColor.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${vr},${vg},${vb},${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.verdict, p.x + panelW / 2, padY + panelH - 14);
    });

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Fixed bands miss \u201Chow far is too far\u201D in context.  Adaptive bands answer it correctly.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 2 — FairValueLineAnim (S02)
// EMA(HL2, 20) reveals across a chart of oscillating price.
// Shows price magnetically returning to the fair value line.
// Reinforces: the EMA is the gravitational center every band
// references; everything else is measured relative to it.
// ============================================================
function FairValueLineAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 5.0;
    const phase = (t % cycle) / cycle;
    const lineProgress = Math.min(1, phase / 0.50);
    const showLabel = phase > 0.55;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE FAIR VALUE LINE  \u00B7  EMA(HL2, 20)  \u00B7  THE GRAVITATIONAL CENTER', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.18;
    const chartW = w - padX * 2;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    // Generate oscillating price series + corresponding EMA
    const N = 80;
    const priceY: number[] = [];
    const emaY: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      // Base trend slightly up
      const trend = chartH * (0.55 - x * 0.1);
      // Multi-frequency oscillation
      const osc = Math.sin(i * 0.4) * chartH * 0.18 + Math.sin(i * 0.13) * chartH * 0.08;
      priceY.push(padY + trend + osc);
    }
    // EMA: simple exponential filter
    const alpha = 0.10;
    let ema = priceY[0];
    for (let i = 0; i < N; i++) {
      ema = alpha * priceY[i] + (1 - alpha) * ema;
      emaY.push(ema);
    }

    // Draw price (always full)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padX + (i / (N - 1)) * chartW;
      if (i === 0) ctx.moveTo(x, priceY[i]);
      else ctx.lineTo(x, priceY[i]);
    }
    ctx.stroke();

    // Draw EMA progressively (the fair value line)
    const drawTo = Math.floor(N * lineProgress);
    if (drawTo > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < drawTo; i++) {
        const x = padX + (i / (N - 1)) * chartW;
        if (i === 0) ctx.moveTo(x, emaY[i]);
        else ctx.lineTo(x, emaY[i]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Label callouts when line is fully drawn
    if (showLabel) {
      const labelY = emaY[Math.floor(N * 0.50)];
      const labelX = padX + chartW * 0.50;

      ctx.strokeStyle = 'rgba(255,179,0,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(labelX, labelY);
      ctx.lineTo(labelX, padY + 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,179,0,0.95)';
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('FAIR VALUE  \u00B7  EMA(HL2, 20)', labelX, padY + 4);

      // Bottom-right callout
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('every band measured from this line', padX + chartW - 6, padY + chartH - 6);
    }

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Price oscillates around the EMA.  When it stretches too far, mean reversion pulls it back.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 3 — ThreeBandsAnim (S03)
// Sequential band reveal: anchor (EMA) first, then inner (1.2× ATR),
// then mid (2.35× ATR), then outer (3.5× ATR). Each band gets a
// callout with multiplier + zone label.
// ============================================================
function ThreeBandsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    const showAnchor = phase >= 0.05;
    const showInner = phase >= 0.30;
    const showMid = phase >= 0.50;
    const showOuter = phase >= 0.70;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THREE NESTED BANDS  \u00B7  INNER 1.2x  \u00B7  MID 2.35x  \u00B7  OUTER 3.5x ATR', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.16;
    const chartW = w - padX * 2;
    const chartH = h * 0.66;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    const anchorY = padY + chartH * 0.50;
    const atrPx = chartH * 0.10;

    // Outer band (DANGER zone) - draw first so it's behind
    if (showOuter) {
      const a = Math.min(1, (phase - 0.70) / 0.10);
      const outerUp = anchorY - 3.5 * atrPx;
      const outerDn = anchorY + 3.5 * atrPx;
      const midUp = anchorY - 2.35 * atrPx;
      const midDn = anchorY + 2.35 * atrPx;

      // Upper DANGER fill
      ctx.fillStyle = `rgba(239,83,80,${0.15 * a})`;
      ctx.fillRect(padX + 8, outerUp, chartW - 16, midUp - outerUp);
      // Lower DANGER fill
      ctx.fillStyle = `rgba(239,83,80,${0.15 * a})`;
      ctx.fillRect(padX + 8, midDn, chartW - 16, outerDn - midDn);

      // Outer line (just barely visible)
      ctx.strokeStyle = `rgba(239,83,80,${0.55 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 8, outerUp);
      ctx.lineTo(padX + chartW - 8, outerUp);
      ctx.moveTo(padX + 8, outerDn);
      ctx.lineTo(padX + chartW - 8, outerDn);
      ctx.stroke();

      // Callout
      ctx.fillStyle = `rgba(239,83,80,${0.95 * a})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('OUTER  \u00B7  3.5x ATR  \u00B7  DANGER', padX + 14, outerUp + 12);
    }

    // Mid band (CAUTION zone)
    if (showMid) {
      const a = Math.min(1, (phase - 0.50) / 0.10);
      const midUp = anchorY - 2.35 * atrPx;
      const midDn = anchorY + 2.35 * atrPx;
      const innerUp = anchorY - 1.2 * atrPx;
      const innerDn = anchorY + 1.2 * atrPx;

      // Upper CAUTION fill
      ctx.fillStyle = `rgba(255,179,0,${0.15 * a})`;
      ctx.fillRect(padX + 8, midUp, chartW - 16, innerUp - midUp);
      // Lower CAUTION fill
      ctx.fillRect(padX + 8, innerDn, chartW - 16, midDn - innerDn);

      // Mid line
      ctx.strokeStyle = `rgba(255,179,0,${0.55 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 8, midUp);
      ctx.lineTo(padX + chartW - 8, midUp);
      ctx.moveTo(padX + 8, midDn);
      ctx.lineTo(padX + chartW - 8, midDn);
      ctx.stroke();

      ctx.fillStyle = `rgba(255,179,0,${0.95 * a})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('MID  \u00B7  2.35x ATR  \u00B7  CAUTION', padX + 14, midUp + 12);
    }

    // Inner band (WATCH zone)
    if (showInner) {
      const a = Math.min(1, (phase - 0.30) / 0.10);
      const innerUp = anchorY - 1.2 * atrPx;
      const innerDn = anchorY + 1.2 * atrPx;

      // SAFE zone (inner) — no fill, just lines and label
      ctx.strokeStyle = `rgba(38,166,154,${0.55 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX + 8, innerUp);
      ctx.lineTo(padX + chartW - 8, innerUp);
      ctx.moveTo(padX + 8, innerDn);
      ctx.lineTo(padX + chartW - 8, innerDn);
      ctx.stroke();

      ctx.fillStyle = `rgba(38,166,154,${0.95 * a})`;
      ctx.font = 'bold 10px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('INNER  \u00B7  1.2x ATR  \u00B7  WATCH', padX + 14, innerUp + 12);

      // SAFE zone label center
      ctx.fillStyle = `rgba(38,166,154,${0.7 * a})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('SAFE', padX + chartW / 2, anchorY - 4);
    }

    // Anchor line (Fair Value)
    if (showAnchor) {
      const a = Math.min(1, (phase - 0.05) / 0.15);
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * a})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padX + 8, anchorY);
      ctx.lineTo(padX + chartW - 8, anchorY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = `rgba(255,255,255,${0.95 * a})`;
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('FAIR VALUE \u2014 EMA(HL2, 20)', padX + chartW - 10, anchorY - 4);
    }

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Three bands, four zones.  Inside inner = SAFE.  Past inner = WATCH.  Past mid = CAUTION.  Past outer = DANGER.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 4 — RegimeScaleAnim (S04)
// Three side-by-side panels showing how bands scale with ADX:
//   RANGE (ADX 25 → 0.95 scale)
//   TREND (ADX 50 → 1.05 scale)
//   STRONG TREND (ADX 75 → 1.15 + VOLATILE +0.10 = 1.25 scale)
// Each panel shows the same anchor with bands at the regime-adjusted width.
// ============================================================
function RegimeScaleAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;
    const showA = phase >= 0.05;
    const showB = phase >= 0.35;
    const showC = phase >= 0.65;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('REGIME-ADAPTIVE WIDTH  \u00B7  BANDS SCALE WITH ADX  \u00B7  0.85x \u2192 1.25x', w / 2, 18);

    const padX = w * 0.04;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 30) / 3;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      label: string;
      adx: string;
      scale: number;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      { x: padX, label: 'RANGE', adx: 'ADX 25', scale: 0.95, visible: showA, revealAlpha: showA ? Math.min(1, (phase - 0.05) / 0.15) : 0 },
      { x: padX + panelW + 15, label: 'TREND', adx: 'ADX 50', scale: 1.05, visible: showB, revealAlpha: showB ? Math.min(1, (phase - 0.35) / 0.15) : 0 },
      { x: padX + panelW * 2 + 30, label: 'STRONG TREND  +VOL', adx: 'ADX 75 \u00B7 VOLATILE', scale: 1.25, visible: showC, revealAlpha: showC ? Math.min(1, (phase - 0.65) / 0.15) : 0 },
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

      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x + panelW / 2, padY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.adx, p.x + panelW / 2, padY + 30);

      // Anchor line + bands at adjusted scale
      const anchorY = padY + panelH * 0.55;
      const baseATR = panelH * 0.07;
      const innerW = baseATR * 1.2 * p.scale;
      const midW = baseATR * 2.35 * p.scale;
      const outerW = baseATR * 3.5 * p.scale;

      // Bands
      ctx.fillStyle = `rgba(239,83,80,${0.18 * p.revealAlpha})`;
      ctx.fillRect(p.x + 12, anchorY - outerW, panelW - 24, outerW - midW);
      ctx.fillRect(p.x + 12, anchorY + midW, panelW - 24, outerW - midW);

      ctx.fillStyle = `rgba(255,179,0,${0.18 * p.revealAlpha})`;
      ctx.fillRect(p.x + 12, anchorY - midW, panelW - 24, midW - innerW);
      ctx.fillRect(p.x + 12, anchorY + innerW, panelW - 24, midW - innerW);

      // Boundary lines
      ctx.strokeStyle = `rgba(255,255,255,${0.30 * p.revealAlpha})`;
      ctx.lineWidth = 0.8;
      [outerW, midW, innerW].forEach((bw) => {
        ctx.beginPath();
        ctx.moveTo(p.x + 12, anchorY - bw);
        ctx.lineTo(p.x + panelW - 12, anchorY - bw);
        ctx.moveTo(p.x + 12, anchorY + bw);
        ctx.lineTo(p.x + panelW - 12, anchorY + bw);
        ctx.stroke();
      });

      // Anchor (fair value) dotted
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(p.x + 12, anchorY);
      ctx.lineTo(p.x + panelW - 12, anchorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scale callout
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      const scaleStr = p.scale === 1.25 ? '1.15 + 0.10 VOL' : `\u00D7${p.scale.toFixed(2)}`;
      ctx.fillText(`scale ${scaleStr}`, p.x + panelW / 2, padY + panelH - 10);
    });

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Strong trends get room.  Ranges tighten.  Volatile regime adds 10%.  No more false DANGER in healthy trends.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 5 — DirectionalAsymmetryAnim (S05)
// Side-by-side: BULL TREND (ribbon up, upper band widened, lower
// tightened) and BEAR TREND (mirror image). Same anchor + ATR,
// different shape. Asymmetry visibly produces an asymmetric cloud.
// ============================================================
function DirectionalAsymmetryAnim() {
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
    ctx.fillText('DIRECTIONAL ASYMMETRY  \u00B7  TREND-SIDE WIDENS  \u00B7  COUNTER-SIDE TIGHTENS', w / 2, 18);

    const padX = w * 0.05;
    const padY = h * 0.16;
    const panelW = (w - padX * 2 - 20) / 2;
    const panelH = h * 0.66;

    type Panel = {
      x: number;
      title: string;
      subtitle: string;
      ribbonDir: 1 | -1;
      visible: boolean;
      revealAlpha: number;
    };

    const panels: Panel[] = [
      {
        x: padX,
        title: 'BULL TREND',
        subtitle: 'upper widens \u00B7 lower tightens',
        ribbonDir: 1,
        visible: showLeft,
        revealAlpha: showLeft ? Math.min(1, (phase - 0.05) / 0.20) : 0,
      },
      {
        x: padX + panelW + 20,
        title: 'BEAR TREND',
        subtitle: 'lower widens \u00B7 upper tightens',
        ribbonDir: -1,
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

      ctx.fillStyle = `rgba(255,179,0,${0.95 * p.revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.title, p.x + panelW / 2, padY + 16);

      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(p.subtitle, p.x + panelW / 2, padY + 30);

      const anchorY = padY + panelH * 0.55;
      const baseATR = panelH * 0.07;
      const asym = 0.15; // 15% directional asymmetry

      // Calculate asymmetric widths
      const upperScale = p.ribbonDir === 1 ? 1.0 + asym : 1.0 - asym;
      const lowerScale = p.ribbonDir === 1 ? 1.0 - asym : 1.0 + asym;

      const innerUp = anchorY - baseATR * 1.2 * upperScale;
      const midUp = anchorY - baseATR * 2.35 * upperScale;
      const outerUp = anchorY - baseATR * 3.5 * upperScale;
      const innerDn = anchorY + baseATR * 1.2 * lowerScale;
      const midDn = anchorY + baseATR * 2.35 * lowerScale;
      const outerDn = anchorY + baseATR * 3.5 * lowerScale;

      const trendColor = p.ribbonDir === 1 ? '#26A69A' : '#EF5350';
      const tr = parseInt(trendColor.slice(1, 3), 16);
      const tg = parseInt(trendColor.slice(3, 5), 16);
      const tb = parseInt(trendColor.slice(5, 7), 16);

      // DANGER zone (between mid and outer)
      ctx.fillStyle = `rgba(${tr},${tg},${tb},${0.20 * p.revealAlpha})`;
      ctx.fillRect(p.x + 12, outerUp, panelW - 24, midUp - outerUp);
      ctx.fillRect(p.x + 12, midDn, panelW - 24, outerDn - midDn);

      // CAUTION zone (between inner and mid)
      ctx.fillStyle = `rgba(${tr},${tg},${tb},${0.10 * p.revealAlpha})`;
      ctx.fillRect(p.x + 12, midUp, panelW - 24, innerUp - midUp);
      ctx.fillRect(p.x + 12, innerDn, panelW - 24, midDn - innerDn);

      // Boundary lines
      ctx.strokeStyle = `rgba(${tr},${tg},${tb},${0.55 * p.revealAlpha})`;
      ctx.lineWidth = 0.8;
      [outerUp, midUp, innerUp, innerDn, midDn, outerDn].forEach((bw) => {
        ctx.beginPath();
        ctx.moveTo(p.x + 12, bw);
        ctx.lineTo(p.x + panelW - 12, bw);
        ctx.stroke();
      });

      // Anchor (Fair Value)
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * p.revealAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(p.x + 12, anchorY);
      ctx.lineTo(p.x + panelW - 12, anchorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ribbon arrow
      ctx.fillStyle = `rgba(${tr},${tg},${tb},${p.revealAlpha})`;
      ctx.font = 'bold 14px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(p.ribbonDir === 1 ? '\u25B2' : '\u25BC', p.x + 26, anchorY - 4);

      // Wider/Tighter callouts
      ctx.fillStyle = `rgba(255,255,255,${0.75 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'left';
      const upperLabel = p.ribbonDir === 1 ? 'WIDER (+15%)' : 'TIGHTER (-15%)';
      const lowerLabel = p.ribbonDir === 1 ? 'TIGHTER (-15%)' : 'WIDER (+15%)';
      ctx.fillText(upperLabel, p.x + panelW - 90, outerUp + 14);
      ctx.fillText(lowerLabel, p.x + panelW - 90, outerDn - 6);

      // ADX scaling note
      ctx.fillStyle = `rgba(255,255,255,${0.55 * p.revealAlpha})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('asym scales with ADX  \u00B7  range = symmetric', p.x + panelW / 2, padY + panelH - 10);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Trend-side gets room.  Counter-side tightens.  CAUTION fires sooner on the dangerous side.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 6 — FourZonesAnim (S06)
// Animated price walking through SAFE → WATCH → CAUTION → DANGER
// zones. Each zone lights up its verdict pill as price enters.
// Background colors visibly change as price escalates.
// ============================================================
function FourZonesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR RISK ZONES  \u00B7  SAFE \u2192 WATCH \u2192 CAUTION \u2192 DANGER', w / 2, 18);

    const padX = w * 0.06;
    const padY = h * 0.16;
    const chartW = w - padX * 2;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(padX, padY, chartW, chartH);

    const anchorY = padY + chartH * 0.50;
    const atrPx = chartH * 0.10;

    // Draw bands
    const innerUp = anchorY - 1.2 * atrPx;
    const midUp = anchorY - 2.35 * atrPx;
    const outerUp = anchorY - 3.5 * atrPx;
    const innerDn = anchorY + 1.2 * atrPx;
    const midDn = anchorY + 2.35 * atrPx;
    const outerDn = anchorY + 3.5 * atrPx;

    ctx.fillStyle = 'rgba(38,166,154,0.18)';
    ctx.fillRect(padX + 8, outerUp, chartW - 16, midUp - outerUp);
    ctx.fillRect(padX + 8, midDn, chartW - 16, outerDn - midDn);

    ctx.fillStyle = 'rgba(38,166,154,0.10)';
    ctx.fillRect(padX + 8, midUp, chartW - 16, innerUp - midUp);
    ctx.fillRect(padX + 8, innerDn, chartW - 16, midDn - innerDn);

    // Boundary lines
    ctx.strokeStyle = 'rgba(38,166,154,0.45)';
    ctx.lineWidth = 0.8;
    [outerUp, midUp, innerUp, innerDn, midDn, outerDn].forEach((bw) => {
      ctx.beginPath();
      ctx.moveTo(padX + 8, bw);
      ctx.lineTo(padX + chartW - 8, bw);
      ctx.stroke();
    });

    // Anchor
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padX + 8, anchorY);
    ctx.lineTo(padX + chartW - 8, anchorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price walks up over time
    // 0 → 0.25 → 0.50 → 0.75 → 1.0  : SAFE → WATCH → CAUTION → DANGER → DANGER (held)
    let priceY: number;
    let zoneIdx: number; // 0=SAFE, 1=WATCH, 2=CAUTION, 3=DANGER
    if (phase < 0.20) {
      // SAFE zone: oscillate within inner
      priceY = anchorY + Math.sin(phase * 30) * atrPx * 0.6;
      zoneIdx = 0;
    } else if (phase < 0.40) {
      // Cross into WATCH
      const p = (phase - 0.20) / 0.20;
      priceY = anchorY - atrPx * (0.6 + p * 1.2);
      zoneIdx = 1;
    } else if (phase < 0.60) {
      // Cross into CAUTION
      const p = (phase - 0.40) / 0.20;
      priceY = anchorY - atrPx * (1.8 + p * 1.0);
      zoneIdx = 2;
    } else if (phase < 0.80) {
      // Cross into DANGER
      const p = (phase - 0.60) / 0.20;
      priceY = anchorY - atrPx * (2.8 + p * 1.0);
      zoneIdx = 3;
    } else {
      // Hold deep in DANGER
      priceY = anchorY - atrPx * 3.8;
      zoneIdx = 3;
    }

    const priceX = padX + chartW * (0.10 + phase * 0.80);

    // Price marker
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trail from start
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const sub = phase * (i / 30);
      let py: number;
      if (sub < 0.20) py = anchorY + Math.sin(sub * 30) * atrPx * 0.6;
      else if (sub < 0.40) py = anchorY - atrPx * (0.6 + (sub - 0.20) / 0.20 * 1.2);
      else if (sub < 0.60) py = anchorY - atrPx * (1.8 + (sub - 0.40) / 0.20 * 1.0);
      else if (sub < 0.80) py = anchorY - atrPx * (2.8 + (sub - 0.60) / 0.20 * 1.0);
      else py = anchorY - atrPx * 3.8;
      const px = padX + chartW * (0.10 + sub * 0.80);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Zone labels at right edge
    type ZoneLabel = { y: number; label: string; color: string; idx: number };
    const labels: ZoneLabel[] = [
      { y: anchorY - atrPx * 0.6, label: 'SAFE', color: '#26A69A', idx: 0 },
      { y: (anchorY - atrPx * 1.2 + anchorY - atrPx * 2.35) / 2, label: 'WATCH', color: '#FFB300', idx: 1 },
      { y: (anchorY - atrPx * 2.35 + anchorY - atrPx * 3.5) / 2, label: 'CAUTION', color: '#FFB300', idx: 2 },
      { y: anchorY - atrPx * 3.5 - 8, label: 'DANGER', color: '#EF5350', idx: 3 },
    ];

    labels.forEach((zl) => {
      const isActive = zl.idx === zoneIdx;
      const r = parseInt(zl.color.slice(1, 3), 16);
      const g = parseInt(zl.color.slice(3, 5), 16);
      const b = parseInt(zl.color.slice(5, 7), 16);
      const alpha = isActive ? 1.0 : 0.30;

      if (isActive) {
        // Active pill background
        ctx.fillStyle = `rgba(${r},${g},${b},0.20)`;
        ctx.fillRect(padX + chartW + 6, zl.y - 8, 60, 14);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(padX + chartW + 6, zl.y - 8, 60, 14);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.font = `${isActive ? 'bold ' : ''}10px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(zl.label, padX + chartW + 12, zl.y + 2);
    });

    // Verdict banner
    const verdictMsg = zoneIdx === 0 ? '\u2192 NORMAL SIZE' : zoneIdx === 1 ? '\u2192 STAY ALERT' : zoneIdx === 2 ? '\u2192 TIGHTEN STOPS' : '\u2192 REDUCE SIZE';
    const verdictColor = zoneIdx === 0 ? '#26A69A' : zoneIdx === 3 ? '#EF5350' : '#FFB300';
    const vr = parseInt(verdictColor.slice(1, 3), 16);
    const vg = parseInt(verdictColor.slice(3, 5), 16);
    const vb = parseInt(verdictColor.slice(5, 7), 16);

    ctx.fillStyle = `rgba(${vr},${vg},${vb},0.95)`;
    ctx.font = 'bold 13px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(verdictMsg, w / 2, padY + chartH + 22);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Each zone has a precomputed sizing verdict.  Read the zone, know the size.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 7 — MeanReversionScoreAnim (S07)
// Score gauge 0-100 ticking through NONE/LOW/MODERATE/HIGH/EXTREME
// labels as price stretches from anchor. Visual gauge bar fills.
// ============================================================
function MeanReversionScoreAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 6.0;
    const phase = (t % cycle) / cycle;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MEAN REVERSION SCORE  \u00B7  CONTINUOUS 0\u2013100  \u00B7  NONE / LOW / MODERATE / HIGH / EXTREME', w / 2, 18);

    // Compute current score: oscillates 0 → 100 → 0
    const cyclePhase = (Math.sin(phase * Math.PI * 2) + 1) / 2;
    const score = Math.round(cyclePhase * 100);

    // Determine label
    const label =
      score > 80 ? 'EXTREME' :
      score > 60 ? 'HIGH' :
      score > 40 ? 'MODERATE' :
      score > 20 ? 'LOW' : 'NONE';

    const labelColor =
      score > 80 ? '#EF5350' :
      score > 60 ? '#EF5350' :
      score > 40 ? '#FFB300' :
      score > 20 ? '#FFB300' : '#26A69A';

    // Left side: chart with anchor + price stretching away
    const chartX = w * 0.06;
    const chartW = w * 0.42;
    const chartY = h * 0.18;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    const anchorY = chartY + chartH * 0.55;
    const atrPx = chartH * 0.12;

    // Draw bands (faint reference)
    const outerUp = anchorY - 3.5 * atrPx;
    ctx.fillStyle = 'rgba(239,83,80,0.10)';
    ctx.fillRect(chartX + 6, outerUp, chartW - 12, 2.3 * atrPx);
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.fillRect(chartX + 6, anchorY - 2.35 * atrPx, chartW - 12, 1.15 * atrPx);

    // Anchor (Fair Value)
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 6, anchorY);
    ctx.lineTo(chartX + chartW - 6, anchorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price marker — stretches from anchor based on score
    const priceX = chartX + chartW * 0.65;
    const priceY = anchorY - (score / 100) * 3.8 * atrPx;

    // Distance line from anchor to price
    ctx.strokeStyle = 'rgba(255,179,0,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(priceX, anchorY);
    ctx.lineTo(priceX, priceY);
    ctx.stroke();

    // Price marker dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Distance label
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    const atrDist = (score / 100 * 3.8).toFixed(1);
    ctx.fillText(`${atrDist} ATR`, priceX + 10, (anchorY + priceY) / 2);

    // Anchor label
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('FV', chartX + chartW - 8, anchorY - 4);

    // Right side: score gauge
    const gaugeX = w * 0.55;
    const gaugeY = h * 0.18;
    const gaugeW = w * 0.40;
    const gaugeH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);

    // Big score number
    ctx.fillStyle = `${labelColor}`;
    ctx.font = 'bold 56px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${score}`, gaugeX + gaugeW / 2, gaugeY + 80);

    // Label
    const lr = parseInt(labelColor.slice(1, 3), 16);
    const lg = parseInt(labelColor.slice(3, 5), 16);
    const lb = parseInt(labelColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${lr},${lg},${lb},0.95)`;
    ctx.font = 'bold 18px ui-sans-serif, system-ui';
    ctx.fillText(label, gaugeX + gaugeW / 2, gaugeY + 110);

    // Gauge bar
    const barX = gaugeX + 20;
    const barY = gaugeY + 140;
    const barW = gaugeW - 40;
    const barH = 18;

    // Background bar with zones
    ctx.fillStyle = 'rgba(38,166,154,0.20)';
    ctx.fillRect(barX, barY, barW * 0.20, barH);
    ctx.fillStyle = 'rgba(255,179,0,0.20)';
    ctx.fillRect(barX + barW * 0.20, barY, barW * 0.20, barH);
    ctx.fillStyle = 'rgba(255,179,0,0.30)';
    ctx.fillRect(barX + barW * 0.40, barY, barW * 0.20, barH);
    ctx.fillStyle = 'rgba(239,83,80,0.30)';
    ctx.fillRect(barX + barW * 0.60, barY, barW * 0.20, barH);
    ctx.fillStyle = 'rgba(239,83,80,0.45)';
    ctx.fillRect(barX + barW * 0.80, barY, barW * 0.20, barH);

    // Bar border
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(barX, barY, barW, barH);
    ctx.stroke();

    // Score indicator (vertical bar)
    const scoreX = barX + (score / 100) * barW;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(scoreX, barY - 4);
    ctx.lineTo(scoreX, barY + barH + 4);
    ctx.stroke();

    // Tick labels under bar
    const tickLabels = ['NONE', 'LOW', 'MOD', 'HIGH', 'EXTREME'];
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '8px ui-monospace, monospace';
    ctx.textAlign = 'center';
    tickLabels.forEach((tl, i) => {
      ctx.fillText(tl, barX + barW * (0.10 + i * 0.20), barY + barH + 14);
    });

    // Threshold callouts
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('mr_score = risk_atr_dist / outer_mult \u00D7 80', gaugeX + gaugeW / 2, gaugeY + gaugeH - 14);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Continuous score quantifies overextension.  Powers context tags + tooltips + Risk row intel.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 8 — ZoneTransitionEventsAnim (S08)
// Cycles through 4 transition events firing on first bar of change:
// JUST HIT DANGER, JUST HIT CAUTION, LEAVING DANGER, BACK TO SAFE.
// Each transition shows the zone change + ✕ marker + verdict color.
// ============================================================
function ZoneTransitionEventsAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    const eventIdx = Math.floor(phase * 4);

    type Event = {
      name: string;
      verdict: string;
      verdictColor: string;
      fromLabel: string;
      toLabel: string;
      markerType: 'magenta' | 'amber' | 'teal';
      arrow: 'up' | 'down';
    };

    const events: Event[] = [
      { name: 'rz_entered_danger',  verdict: '\u2192 JUST HIT DANGER',  verdictColor: '#EF5350', fromLabel: 'CAUTION', toLabel: 'DANGER',  markerType: 'magenta', arrow: 'up' },
      { name: 'rz_entered_caution', verdict: '\u2192 JUST HIT CAUTION', verdictColor: '#FFB300', fromLabel: 'WATCH',   toLabel: 'CAUTION', markerType: 'amber',   arrow: 'up' },
      { name: 'rz_exited_danger',   verdict: '\u2192 LEAVING DANGER',   verdictColor: '#26A69A', fromLabel: 'DANGER',  toLabel: 'CAUTION', markerType: 'teal',    arrow: 'down' },
      { name: 'rz_returned_safe',   verdict: '\u2192 BACK TO SAFE',     verdictColor: '#26A69A', fromLabel: 'WATCH',   toLabel: 'SAFE',    markerType: 'teal',    arrow: 'down' },
    ];

    const ev = events[Math.min(eventIdx, events.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('FOUR ZONE TRANSITION EVENTS  \u00B7  FIRE ON FIRST BAR OF CHANGE', w / 2, 18);

    // Sub-phase: how far into this event are we (for cross-fade reveal)
    const subPhase = (phase * 4) - eventIdx;

    // Event name (top)
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ev.name, w / 2, 38);

    // Chart area
    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.20;
    const chartH = h * 0.50;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    const anchorY = chartY + chartH * 0.50;
    const atrPx = chartH * 0.10;

    // Bands faint
    ctx.fillStyle = 'rgba(239,83,80,0.10)';
    ctx.fillRect(chartX + 6, anchorY - 3.5 * atrPx, chartW - 12, 1.15 * atrPx);
    ctx.fillRect(chartX + 6, anchorY + 2.35 * atrPx, chartW - 12, 1.15 * atrPx);
    ctx.fillStyle = 'rgba(255,179,0,0.08)';
    ctx.fillRect(chartX + 6, anchorY - 2.35 * atrPx, chartW - 12, 1.15 * atrPx);
    ctx.fillRect(chartX + 6, anchorY + 1.2 * atrPx, chartW - 12, 1.15 * atrPx);

    // Boundaries
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 0.7;
    [-3.5, -2.35, -1.2, 1.2, 2.35, 3.5].forEach((m) => {
      const y = anchorY + m * atrPx;
      ctx.beginPath();
      ctx.moveTo(chartX + 6, y);
      ctx.lineTo(chartX + chartW - 6, y);
      ctx.stroke();
    });

    // Anchor
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 6, anchorY);
    ctx.lineTo(chartX + chartW - 6, anchorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price trajectory: from-zone position to to-zone position
    const fromY = ev.fromLabel === 'WATCH' ? anchorY - atrPx * 1.8 :
                  ev.fromLabel === 'CAUTION' ? anchorY - atrPx * 2.9 :
                  ev.fromLabel === 'DANGER' ? anchorY - atrPx * 3.2 :
                  anchorY - atrPx * 0.5;
    const toY = ev.toLabel === 'WATCH' ? anchorY - atrPx * 1.8 :
                ev.toLabel === 'CAUTION' ? anchorY - atrPx * 2.9 :
                ev.toLabel === 'DANGER' ? anchorY - atrPx * 4.0 :
                anchorY - atrPx * 0.5;

    const transitionPhase = Math.min(1, subPhase * 1.3);
    const priceX = chartX + chartW * 0.55;
    const priceY = fromY + (toY - fromY) * transitionPhase;

    // Trail showing transition
    ctx.strokeStyle = 'rgba(255,255,255,0.40)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chartX + chartW * 0.30, fromY);
    ctx.lineTo(priceX, priceY);
    ctx.stroke();

    // Price marker
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ✕ marker at transition point (only on rz_changed bar)
    if (transitionPhase > 0.4) {
      const markerColor = ev.markerType === 'magenta' ? '#EF5350' : ev.markerType === 'amber' ? '#FFB300' : '#26A69A';
      const markerAlpha = Math.min(1, (transitionPhase - 0.4) * 3);
      ctx.fillStyle = markerColor;
      ctx.globalAlpha = markerAlpha;
      ctx.font = 'bold 18px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('\u2715', priceX, priceY - 14);
      ctx.globalAlpha = 1;
    }

    // From → To labels
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`from: ${ev.fromLabel}`, chartX + 12, chartY + chartH - 22);
    ctx.fillText(`to:   ${ev.toLabel}`, chartX + 12, chartY + chartH - 8);

    // Verdict banner
    const verdictY = chartY + chartH + 28;
    const vr = parseInt(ev.verdictColor.slice(1, 3), 16);
    const vg = parseInt(ev.verdictColor.slice(3, 5), 16);
    const vb = parseInt(ev.verdictColor.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${vr},${vg},${vb},0.95)`;
    ctx.font = 'bold 14px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ev.verdict, w / 2, verdictY);

    // Bottom note
    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Transitions fire ONCE on the first bar of change.  Outrank state-based verdicts in the cascade.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 9 — DwellPhasesAnim (S09)
// Bar counter ticks up: SPIKE (≤2) → VISIT (≤8) → ESTABLISHED (≤20)
// → ENTRENCHED (>20) with the ⚠ glyph appearing at ENTRENCHED.
// Shows the dwell suffix that gets appended in the cascade.
// ============================================================
function DwellPhasesAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    // Bar count ramps from 1 to 30
    const barCount = Math.floor(1 + phase * 29);

    const dwellPhase =
      barCount <= 2 ? 'SPIKE' :
      barCount <= 8 ? 'VISIT' :
      barCount <= 20 ? 'ESTABLISHED' : 'ENTRENCHED';

    const phaseColor =
      dwellPhase === 'SPIKE' ? '#FFB300' :
      dwellPhase === 'VISIT' ? '#FFB300' :
      dwellPhase === 'ESTABLISHED' ? '#FF5350' :
      '#FF1744';

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('DWELL PHASES  \u00B7  HOW LONG IN ZONE  \u00B7  SPIKE / VISIT / ESTABLISHED / ENTRENCHED', w / 2, 18);

    // Left side: bar counter
    const counterX = w * 0.06;
    const counterY = h * 0.20;
    const counterW = w * 0.42;
    const counterH = h * 0.60;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(counterX, counterY, counterW, counterH);

    // Big bar count number
    const lr = parseInt(phaseColor.slice(1, 3), 16);
    const lg = parseInt(phaseColor.slice(3, 5), 16);
    const lb = parseInt(phaseColor.slice(5, 7), 16);

    ctx.fillStyle = `rgba(${lr},${lg},${lb},0.95)`;
    ctx.font = 'bold 60px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${barCount}`, counterX + counterW / 2, counterY + 80);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('bars in zone', counterX + counterW / 2, counterY + 100);

    // Phase label
    ctx.fillStyle = `rgba(${lr},${lg},${lb},0.95)`;
    ctx.font = 'bold 18px ui-sans-serif, system-ui';
    ctx.fillText(dwellPhase, counterX + counterW / 2, counterY + 140);

    // ⚠ glyph for ENTRENCHED
    if (dwellPhase === 'ENTRENCHED') {
      ctx.fillStyle = '#FF1744';
      ctx.font = 'bold 24px ui-sans-serif, system-ui';
      ctx.fillText('\u26A0', counterX + counterW / 2, counterY + 175);
    }

    // Cascade row preview at the bottom
    const cascadeY = counterY + counterH - 26;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    const dwellSuffix = dwellPhase === 'ENTRENCHED' ? `${barCount}b \u26A0` : `${barCount}b`;
    const cascadeStr = barCount > 0 ? `\u2192 TIGHTEN STOPS  ${dwellSuffix}` : '\u2192 TIGHTEN STOPS';
    ctx.fillText(`Risk row:`, counterX + counterW / 2, cascadeY - 12);
    ctx.fillStyle = `rgba(${lr},${lg},${lb},0.85)`;
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText(cascadeStr, counterX + counterW / 2, cascadeY);

    // Right side: phase ladder
    const ladderX = w * 0.55;
    const ladderY = h * 0.20;
    const ladderW = w * 0.40;
    const ladderH = h * 0.60;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(ladderX, ladderY, ladderW, ladderH);

    type Phase = { y: number; range: string; label: string; color: string; active: boolean };
    const phases: Phase[] = [
      { y: ladderY + 30,  range: '1-2 bars',     label: 'SPIKE',       color: '#FFB300', active: dwellPhase === 'SPIKE' },
      { y: ladderY + 75,  range: '3-8 bars',     label: 'VISIT',       color: '#FFB300', active: dwellPhase === 'VISIT' },
      { y: ladderY + 125, range: '9-20 bars',    label: 'ESTABLISHED', color: '#FF5350', active: dwellPhase === 'ESTABLISHED' },
      { y: ladderY + 175, range: '21+ bars',     label: 'ENTRENCHED',  color: '#FF1744', active: dwellPhase === 'ENTRENCHED' },
    ];

    phases.forEach((p) => {
      const pr = parseInt(p.color.slice(1, 3), 16);
      const pg = parseInt(p.color.slice(3, 5), 16);
      const pb = parseInt(p.color.slice(5, 7), 16);
      const alpha = p.active ? 1.0 : 0.40;

      if (p.active) {
        ctx.fillStyle = `rgba(${pr},${pg},${pb},0.10)`;
        ctx.fillRect(ladderX + 12, p.y - 16, ladderW - 24, 32);
        ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.55)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.rect(ladderX + 12, p.y - 16, ladderW - 24, 32);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`;
      ctx.font = `${p.active ? 'bold ' : ''}11px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(p.label, ladderX + 22, p.y - 2);

      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(p.range, ladderX + ladderW - 22, p.y - 2);

      if (p.active && p.label === 'ENTRENCHED') {
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`;
        ctx.font = 'bold 12px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('\u26A0', ladderX + ladderW - 30, p.y + 14);
      }

      if (p.active) {
        ctx.fillStyle = `rgba(${pr},${pg},${pb},0.95)`;
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u25B6', ladderX + 8, p.y - 2);
      }
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Dwell time turns the Risk row from snapshot into story.  ENTRENCHED is the warning glyph.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 10 — RiskCascadeAnim (S10)
// 8-tier cascade ladder showing transition events outranking
// state-based verdicts. Cycles through scenarios where different
// inputs (transitions + zone state) light up different verdicts.
// ============================================================
function RiskCascadeAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 10.0;
    const phase = (t % cycle) / cycle;
    const sliceIdx = Math.floor(phase * 5);

    type Scenario = { input: string; matchIdx: number };
    const scenarios: Scenario[] = [
      { input: 'rz_entered_danger = TRUE', matchIdx: 0 },
      { input: 'rz_entered_caution = TRUE', matchIdx: 1 },
      { input: 'rz_returned_safe = TRUE', matchIdx: 3 },
      { input: 'risk_zone = DANGER  \u00B7  dwell = 12b', matchIdx: 4 },
      { input: 'risk_zone = SAFE  \u00B7  no transitions', matchIdx: 7 },
    ];
    const current = scenarios[Math.min(sliceIdx, scenarios.length - 1)];

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('THE 8-TIER RISK CASCADE  \u00B7  TRANSITIONS OUTRANK STATES  \u00B7  FIRST MATCH WINS', w / 2, 18);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('INPUT:', w * 0.06, 38);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText(current.input, w * 0.13, 38);

    type Verdict = { label: string; tip: string; color: string };
    const verdicts: Verdict[] = [
      { label: '1.  JUST HIT DANGER',  tip: 'rz_entered_danger',  color: '#EF5350' },
      { label: '2.  JUST HIT CAUTION', tip: 'rz_entered_caution', color: '#FFB300' },
      { label: '3.  LEAVING DANGER',   tip: 'rz_exited_danger',   color: '#26A69A' },
      { label: '4.  BACK TO SAFE',     tip: 'rz_returned_safe',   color: '#26A69A' },
      { label: '5.  REDUCE SIZE + dwell',   tip: 'zone == DANGER',  color: '#EF5350' },
      { label: '6.  TIGHTEN STOPS + dwell', tip: 'zone == CAUTION', color: '#FFB300' },
      { label: '7.  STAY ALERT + dwell',    tip: 'zone == WATCH',   color: '#FFB300' },
      { label: '8.  NORMAL SIZE',           tip: 'zone == SAFE',    color: '#26A69A' },
    ];

    const startY = 58;
    const rowH = (h - startY - 30) / verdicts.length;

    verdicts.forEach((v, i) => {
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

      const r = parseInt(v.color.slice(1, 3), 16);
      const g = parseInt(v.color.slice(3, 5), 16);
      const b = parseInt(v.color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${fadeOpacity})`;
      ctx.font = `${isMatch ? 'bold ' : ''}11px ui-sans-serif, system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText(v.label, w * 0.10, y + rowH / 2 + 2);

      ctx.fillStyle = `rgba(255,255,255,${fadeOpacity * 0.55})`;
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v.tip, w * 0.92, y + rowH / 2 + 2);

      if (isMatch) {
        ctx.fillStyle = 'rgba(255,179,0,0.95)';
        ctx.font = 'bold 11px ui-sans-serif, system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('\u25B6', w * 0.07, y + rowH / 2 + 2);
      } else if (isAbove) {
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('\u2718', w * 0.07, y + rowH / 2 + 2);
      }
    });

    // Divider line between transitions (1-4) and states (5-8)
    const divY = startY + rowH * 4;
    ctx.strokeStyle = 'rgba(255,179,0,0.30)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, divY);
    ctx.lineTo(w * 0.94, divY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,179,0,0.55)';
    ctx.font = '8px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TRANSITIONS (1-bar events)', w * 0.06, divY - 4);
    ctx.fillText('STATES (sustained verdicts)', w * 0.06, divY + 12);

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Transitions checked first.  Any active transition overrides state-based verdict.  Lower verdicts never evaluated.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 11 — AdaptiveIntensityAnim (S11)
// The marquee A/B animation. Two phases:
//   Phase A (0-50%): Adaptive Intensity ON — progressive glow at score >60,
//     band breathing as ATR expands/contracts.
//   Phase B (50-100%): Adaptive Intensity OFF — uniform fill, static.
// Same chart, same data, same intensity setting — the difference is
// purely the Adaptive layer. Header label flips between phases.
// ============================================================
function AdaptiveIntensityAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 10.0;
    const phase = (t % cycle) / cycle;
    const adaptiveOn = phase < 0.50;
    // For the ON phase, simulate live mr_score and breathing
    const subPhase = adaptiveOn ? phase / 0.50 : (phase - 0.50) / 0.50;

    // Title flips
    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(adaptiveOn ? 'ADAPTIVE INTENSITY  ON  \u00B7  PROGRESSIVE GLOW + BAND BREATHING' : 'ADAPTIVE INTENSITY  OFF  \u00B7  UNIFORM STATIC FILL', w / 2, 18);

    // Phase pill at top right
    const pillX = w - 90;
    const pillY = 30;
    ctx.fillStyle = adaptiveOn ? 'rgba(38,166,154,0.20)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(pillX, pillY, 76, 18);
    ctx.strokeStyle = adaptiveOn ? 'rgba(38,166,154,0.65)' : 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(pillX, pillY, 76, 18);
    ctx.stroke();
    ctx.fillStyle = adaptiveOn ? 'rgba(38,166,154,0.95)' : 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 9px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(adaptiveOn ? 'ADAPTIVE: ON' : 'ADAPTIVE: OFF', pillX + 38, pillY + 12);

    // Chart area
    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.20;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    const anchorY = chartY + chartH * 0.50;
    const atrPx = chartH * 0.10;

    // Bands (consistent in both modes)
    const innerUp = anchorY - 1.2 * atrPx;
    const midUp = anchorY - 2.35 * atrPx;
    const outerUp = anchorY - 3.5 * atrPx;
    const innerDn = anchorY + 1.2 * atrPx;
    const midDn = anchorY + 2.35 * atrPx;
    const outerDn = anchorY + 3.5 * atrPx;

    // Compute mr_score for the price marker (oscillates 30-95)
    const scoreOsc = (Math.sin(subPhase * Math.PI * 2) + 1) / 2;
    const score = 30 + scoreOsc * 65;
    const overextended = score > 60;
    const deepDanger = score > 80;

    // Band breathing: in ON mode, bands fade/brighten based on simulated vol_delta
    const breathPhase = Math.sin(subPhase * Math.PI * 4); // faster breath
    const breathOffset = adaptiveOn ? breathPhase * 0.05 : 0;

    // Danger zone fills — in ON mode, brighter when score>60, brightest >80
    let dangerAlpha = 0.20;
    if (adaptiveOn) {
      dangerAlpha = 0.20 + (deepDanger ? 0.20 : overextended ? 0.10 : 0.0);
      dangerAlpha += breathOffset;
    }
    dangerAlpha = Math.max(0.10, Math.min(0.50, dangerAlpha));

    // Caution zone alpha
    let cautionAlpha = 0.10;
    if (adaptiveOn) cautionAlpha = 0.10 + breathOffset;
    cautionAlpha = Math.max(0.05, Math.min(0.30, cautionAlpha));

    // DANGER zones (between mid and outer)
    ctx.fillStyle = `rgba(38,166,154,${dangerAlpha})`;
    ctx.fillRect(chartX + 6, outerUp, chartW - 12, midUp - outerUp);
    ctx.fillRect(chartX + 6, midDn, chartW - 12, outerDn - midDn);

    // CAUTION zones (between inner and mid)
    ctx.fillStyle = `rgba(38,166,154,${cautionAlpha})`;
    ctx.fillRect(chartX + 6, midUp, chartW - 12, innerUp - midUp);
    ctx.fillRect(chartX + 6, innerDn, chartW - 12, midDn - innerDn);

    // Boundary lines
    ctx.strokeStyle = 'rgba(38,166,154,0.40)';
    ctx.lineWidth = 0.7;
    [outerUp, midUp, innerUp, innerDn, midDn, outerDn].forEach((bw) => {
      ctx.beginPath();
      ctx.moveTo(chartX + 6, bw);
      ctx.lineTo(chartX + chartW - 6, bw);
      ctx.stroke();
    });

    // Anchor
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 6, anchorY);
    ctx.lineTo(chartX + chartW - 6, anchorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price marker — extends from anchor based on score
    const priceX = chartX + chartW * 0.55;
    const priceY = anchorY - (score / 100) * 3.5 * atrPx;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Score readout (fixed position bottom-left)
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`mr_score: ${Math.round(score)}`, chartX + 12, chartY + chartH - 8);

    // Effects readout
    if (adaptiveOn) {
      ctx.fillStyle = 'rgba(255,179,0,0.85)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      const glowMsg = deepDanger ? 'glow: -15 (DEEP)' : overextended ? 'glow: -8' : 'glow: 0';
      const breathMsg = breathPhase > 0.1 ? 'breath: +' : breathPhase < -0.1 ? 'breath: -' : 'breath: 0';
      ctx.fillText(`${glowMsg}  \u00B7  ${breathMsg}`, chartX + chartW - 12, chartY + chartH - 8);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('static fill  \u00B7  no breathing', chartX + chartW - 12, chartY + chartH - 8);
    }

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Same chart, same Intensity \u00B7 Adaptive Intensity adds progressive glow + band breathing on top.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 12 — CoilGlowAnim (S12)
// Volatility compression detection: when ATR contracts to <60% of
// recent baseline, the outer band edges glow amber instead of teal/magenta.
// Animation shows ATR contracting, glow appearing, then expansion + breakout.
// ============================================================
function CoilGlowAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;
    // 0-0.30: normal volatility (no coil)
    // 0.30-0.60: compression building (coil firing, amber glow)
    // 0.60-0.85: explosive expansion (breakout)
    // 0.85-1.0: post-breakout normal

    let volRatio = 1.0;
    let coilActive = false;
    if (phase < 0.30) {
      volRatio = 1.0;
    } else if (phase < 0.60) {
      // Compression phase
      volRatio = 1.0 - ((phase - 0.30) / 0.30) * 0.50; // ramp 1.0 → 0.50
      coilActive = volRatio < 0.6;
    } else if (phase < 0.85) {
      // Explosion
      volRatio = 0.50 + ((phase - 0.60) / 0.25) * 0.80; // ramp 0.50 → 1.30
      coilActive = false;
    } else {
      volRatio = 1.0 + Math.sin((phase - 0.85) * 30) * 0.15;
      coilActive = false;
    }

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('COIL GLOW  \u00B7  VOL COMPRESSION < 0.6  \u00B7  OUTER EDGES PULSE AMBER', w / 2, 18);

    // Volatility ratio readout
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('vol_compression:', w * 0.06, 38);
    const ratioColor = volRatio < 0.6 ? '#FFB300' : volRatio > 1.2 ? '#26A69A' : 'rgba(255,255,255,0.95)';
    ctx.fillStyle = ratioColor;
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(`${volRatio.toFixed(2)}`, w * 0.21, 38);

    // State pill
    const stateMsg = coilActive ? 'COIL ACTIVE \u00B7 BREAKOUT IMMINENT' : volRatio > 1.2 ? 'EXPANDING \u00B7 BREAKOUT FIRED' : 'NORMAL';
    ctx.fillStyle = coilActive ? 'rgba(255,179,0,0.95)' : volRatio > 1.2 ? 'rgba(38,166,154,0.95)' : 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px ui-sans-serif, system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(stateMsg, w - w * 0.06, 38);

    // Chart
    const chartX = w * 0.06;
    const chartW = w - chartX * 2;
    const chartY = h * 0.18;
    const chartH = h * 0.62;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

    const anchorY = chartY + chartH * 0.50;
    // ATR scales with volRatio
    const atrPx = chartH * 0.10 * volRatio;

    const innerUp = anchorY - 1.2 * atrPx;
    const midUp = anchorY - 2.35 * atrPx;
    const outerUp = anchorY - 3.5 * atrPx;
    const innerDn = anchorY + 1.2 * atrPx;
    const midDn = anchorY + 2.35 * atrPx;
    const outerDn = anchorY + 3.5 * atrPx;

    // Standard band fills (teal direction - bullish ribbon)
    const bandFill = coilActive ? 'rgba(38,166,154,0.10)' : 'rgba(38,166,154,0.18)';
    ctx.fillStyle = bandFill;
    ctx.fillRect(chartX + 6, outerUp, chartW - 12, midUp - outerUp);
    ctx.fillRect(chartX + 6, midDn, chartW - 12, outerDn - midDn);
    ctx.fillStyle = 'rgba(38,166,154,0.08)';
    ctx.fillRect(chartX + 6, midUp, chartW - 12, innerUp - midUp);
    ctx.fillRect(chartX + 6, innerDn, chartW - 12, midDn - innerDn);

    // Outer edge glow — AMBER PULSE when coil active
    if (coilActive) {
      const glowPulse = (Math.sin(phase * Math.PI * 16) + 1) / 2;
      const glowAlpha = 0.50 + glowPulse * 0.40;
      ctx.strokeStyle = `rgba(255,179,0,${glowAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(chartX + 6, outerUp);
      ctx.lineTo(chartX + chartW - 6, outerUp);
      ctx.moveTo(chartX + 6, outerDn);
      ctx.lineTo(chartX + chartW - 6, outerDn);
      ctx.stroke();

      // Amber halo glow
      ctx.fillStyle = `rgba(255,179,0,${0.15 * glowPulse})`;
      ctx.fillRect(chartX + 6, outerUp - 3, chartW - 12, 6);
      ctx.fillRect(chartX + 6, outerDn - 3, chartW - 12, 6);
    } else {
      // Normal mode: outer edges hidden
      ctx.strokeStyle = 'rgba(38,166,154,0.40)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(chartX + 6, outerUp);
      ctx.lineTo(chartX + chartW - 6, outerUp);
      ctx.moveTo(chartX + 6, outerDn);
      ctx.lineTo(chartX + chartW - 6, outerDn);
      ctx.stroke();
    }

    // Other boundaries
    ctx.strokeStyle = 'rgba(38,166,154,0.30)';
    ctx.lineWidth = 0.6;
    [midUp, innerUp, innerDn, midDn].forEach((bw) => {
      ctx.beginPath();
      ctx.moveTo(chartX + 6, bw);
      ctx.lineTo(chartX + chartW - 6, bw);
      ctx.stroke();
    });

    // Anchor
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(chartX + 6, anchorY);
    ctx.lineTo(chartX + chartW - 6, anchorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price wandering near anchor during coil; explodes during expansion
    const priceX = chartX + chartW * 0.55;
    let priceY: number;
    if (phase < 0.60) {
      // Tight oscillation near anchor during compression
      priceY = anchorY + Math.sin(phase * 30) * atrPx * 0.4;
    } else if (phase < 0.85) {
      // Breakout — price launches up
      const launchPhase = (phase - 0.60) / 0.25;
      priceY = anchorY - launchPhase * 3.0 * atrPx;
    } else {
      priceY = anchorY - 3.0 * atrPx + Math.sin((phase - 0.85) * 30) * atrPx * 0.5;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(priceX, priceY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('When ATR drops below 60% of normal, outer edges pulse amber.  The spring is coiling.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// ANIMATION 13 — RiskSizingPlanAnim (S13)
// Sizing table grid: 4 zones × R-multiplier, with verdict colors.
// Each row reveals sequentially showing the prescribed size.
// Includes the bonus row for ENTRENCHED conditions.
// ============================================================
function RiskSizingPlanAnim() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const cycle = 8.0;
    const phase = (t % cycle) / cycle;

    ctx.fillStyle = 'rgba(255,179,0,0.85)';
    ctx.font = 'bold 11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SIZING BY ZONE  \u00B7  THE OPERATOR\u2019S R-PER-TRADE TABLE', w / 2, 18);

    type Row = {
      zone: string;
      verdict: string;
      size: string;
      action: string;
      color: string;
      threshold: number;
    };

    const rows: Row[] = [
      { zone: 'SAFE',      verdict: 'NORMAL SIZE',     size: '1.0R',           action: 'trade unconstrained',                   color: '#26A69A', threshold: 0.10 },
      { zone: 'WATCH',     verdict: 'STAY ALERT',      size: '1.0R',           action: 'trade normal, monitor closely',        color: '#FFB300', threshold: 0.25 },
      { zone: 'CAUTION',   verdict: 'TIGHTEN STOPS',   size: '0.5R',           action: 'tighten stops, partial scale-out',     color: '#FFB300', threshold: 0.45 },
      { zone: 'DANGER',    verdict: 'REDUCE SIZE',     size: '0.25R',          action: 'half size, expect mean reversion',     color: '#EF5350', threshold: 0.65 },
      { zone: 'ENTRENCHED DANGER', verdict: '+\u26A0',          size: 'SKIP',           action: 'rare condition, analyze explicitly',   color: '#FF1744', threshold: 0.85 },
    ];

    const tableX = w * 0.06;
    const tableY = h * 0.16;
    const tableW = w - tableX * 2;
    const tableH = h * 0.70;

    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    ctx.fillRect(tableX, tableY, tableW, tableH);

    // Header row
    const colZ = tableX + 16;
    const colV = tableX + tableW * 0.32;
    const colS = tableX + tableW * 0.56;
    const colA = tableX + tableW * 0.72;

    ctx.fillStyle = 'rgba(255,179,0,0.55)';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ZONE', colZ, tableY + 18);
    ctx.fillText('VERDICT', colV, tableY + 18);
    ctx.fillText('SIZE', colS, tableY + 18);
    ctx.fillText('ACTION', colA, tableY + 18);

    // Header underline
    ctx.strokeStyle = 'rgba(255,179,0,0.30)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(tableX + 12, tableY + 26);
    ctx.lineTo(tableX + tableW - 12, tableY + 26);
    ctx.stroke();

    const rowHeight = (tableH - 50) / rows.length;
    rows.forEach((r, i) => {
      if (phase < r.threshold) return;
      const revealAlpha = Math.min(1, (phase - r.threshold) / 0.10);
      const y = tableY + 38 + i * rowHeight;

      const cr = parseInt(r.color.slice(1, 3), 16);
      const cg = parseInt(r.color.slice(3, 5), 16);
      const cb = parseInt(r.color.slice(5, 7), 16);

      // Row highlight
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.05 * revealAlpha})`;
      ctx.fillRect(tableX + 12, y - rowHeight / 2 - 2, tableW - 24, rowHeight - 4);

      // Zone name (color-coded)
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${revealAlpha})`;
      ctx.font = 'bold 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(r.zone, colZ, y + 4);

      // Verdict
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.85 * revealAlpha})`;
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.fillText(r.verdict, colV, y + 4);

      // Size (large, bold)
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${revealAlpha})`;
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.fillText(r.size, colS, y + 4);

      // Action description
      ctx.fillStyle = `rgba(255,255,255,${0.65 * revealAlpha})`;
      ctx.font = '9px ui-sans-serif, system-ui';
      ctx.fillText(r.action, colA, y + 4);
    });

    ctx.font = '9px ui-sans-serif, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('Sizing scales inversely to overextension.  When the cascade fires, the size is precomputed.', w / 2, h - 6);
  }, []);

  return <AnimScene draw={draw} aspectRatio={16 / 9} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CipherRiskEnvelopeLesson() {
  const [scrollY, setScrollY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameRound, setGameRound] = useState(0);
  const [gameSelections, setGameSelections] = useState<(string | null)[]>(new Array(gameRounds.length).fill(null));
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(new Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certRevealed, setCertRevealed] = useState(false);
  const [certId] = useState(() => `PRO-CERT-L11.20-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

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
        <div className="h-full bg-gradient-to-r from-amber-400 to-accent-400 transition-all duration-100" style={{ width: `${Math.min(100, (scrollY / (typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1)) * 100)}%` }} />
      </div>

      <nav className="fixed top-1 left-0 right-0 z-40 px-6 py-3 backdrop-blur-md bg-black/40 border-b border-white/5 flex items-center justify-between">
        <Link href="/academy" className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-accent-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>ATLAS ACADEMY</Link>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">PRO &middot; LEVEL 11 &middot; CIPHER</span>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div variants={fadeUp}><p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">Level 11 &middot; Lesson 20</p></motion.div>
          <motion.h1 variants={fadeUp} className="text-[clamp(32px,7vw,52px)] font-black leading-[1.1] tracking-tight mb-5">Cipher Risk Envelope<br /><span className="bg-gradient-to-r from-amber-400 via-accent-400 to-amber-400 bg-clip-text text-transparent" style={{ WebkitTransform: 'translateZ(0)' }}>How Far Is Too Far</span></motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">An adaptive volatility cloud that knows what overextension means in context. Regime-aware bands, four risk zones, a continuous mean-reversion score, and an 8-tier cascade that turns &ldquo;is this too far?&rdquo; into a single glance.</motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 text-xs font-mono text-gray-500">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">17 sections</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">13 animations</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">5-round game</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">8-question quiz</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Risk Envelope Operator cert</span>
          </motion.div>
        </motion.div>
      </section>

      {/* === S00 — First, Why This Matters === */}
      <section className="max-w-2xl mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">First, Why This Matters</p>
          <h2 className="text-2xl font-extrabold mb-4">The Most Universal Question In Trading.</h2>
          <p className="text-gray-400 leading-relaxed mb-4">Every trader, on every chart, on every timeframe, asks the same question every few seconds: <strong className="text-white">is price too far gone?</strong> Too far for the trend to continue? Too far to chase? Too far to fade? The honest answer depends on the context &mdash; on whether the market is trending or ranging, on which direction is favoured, on what volatility looks like right now. <strong className="text-amber-400">Fixed answers are wrong answers</strong>. A 2-ATR move in a strong trend is normal; the same 2 ATR in a tight range is extreme. CIPHER&apos;s Risk Envelope solves this by making the bands themselves adaptive &mdash; they widen when the trend is strong, tighten when the market is ranging, and shift asymmetrically with the direction of bias. The result is the only thing operators actually need: <strong className="text-white">a calibrated answer to &ldquo;how far is too far&rdquo; that updates in real time</strong>.</p>
          <p className="text-gray-400 leading-relaxed">By the end of this lesson you will be able to read the four risk zones (SAFE, WATCH, CAUTION, DANGER) at a glance, understand exactly when the engine flagged a transition versus when it&apos;s describing a state, calibrate position size against the cascade verdict, and recognize the rare edge cases where the standard playbook needs adjustment. <strong className="text-white">The Risk Envelope is the most-glanced row in the Command Center</strong> &mdash; mastering it is mastering one of CIPHER&apos;s highest-value channels.</p>
        </motion.div>
      </section>

      {/* === S01 — How Far Is Too Far (Groundbreaking Concept) === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">01 &mdash; The Groundbreaking Concept</p>
          <h2 className="text-2xl font-extrabold mb-4">How Far Is Too Far &mdash; And Why The Answer Has To Move.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every retail volatility-band indicator answers &ldquo;how far is too far&rdquo; with a fixed multiplier. Bollinger Bands use 2 standard deviations. Keltner Channels use 1.5 ATR. Donchian uses N-bar high/low. <strong className="text-white">All of them treat overextension as a one-size-fits-all concept</strong>. They all break in the same way: in a strong trend, price stays outside the bands for dozens of bars while the trend keeps running &mdash; the &ldquo;DANGER&rdquo; signal is just wrong. In a tight range, price never reaches the bands and the indicator goes quiet exactly when overextension is most relevant. <strong className="text-amber-400">A static answer to a dynamic question is a wrong answer dressed up as certainty</strong>.</p>
          <HowFarIsTooFarAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The two panels show the same uptrend with the same price action. <strong className="text-white">Left</strong>: a fixed-band indicator (2.0 ATR constant) prints DANGER repeatedly as price extends &mdash; an operator following it would exit early on every leg. <strong className="text-white">Right</strong>: CIPHER&apos;s regime-adaptive Risk Envelope widens as the trend strengthens, gives the upside extension room, and only flags actual overextension when price truly exceeds what the regime can sustain. <strong className="text-amber-400">Same chart, two reads &mdash; one wrong, one calibrated</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FIXED-BAND PROBLEM</p>
              <p className="text-sm text-gray-400 leading-relaxed">Bollinger Bands at 2 standard deviations. Keltner Channels at 1.5 ATR. Donchian channels at N-bar extremes. <strong className="text-white">Every retail volatility tool answers &ldquo;is this far?&rdquo; with a constant</strong>. The constant works in average conditions and fails everywhere else. In trending markets the constant is too tight &mdash; price legitimately runs outside the bands for the duration of the move. In ranging markets the same constant is too loose &mdash; meaningful overextension never reaches the bands. <strong className="text-white">A trader who follows fixed bands gets stopped early in trends and has no signal in ranges</strong>. The constant is the problem.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE REGIME-ADAPTIVE ANSWER</p>
              <p className="text-sm text-gray-400 leading-relaxed">CIPHER measures regime continuously via ADX and applies a smooth scale factor to the band multipliers. <strong className="text-white">Range conditions (ADX &lt; 30) tighten bands by 15-20%</strong> &mdash; mean reversion is real here, so what looks like a small extension is actually meaningful. <strong className="text-white">Strong trends (ADX &gt; 70) widen bands by 20-25%</strong> &mdash; aggressive directional moves are normal, so what looks like overextension in a range is just trend continuation. The scale factor is a continuous linear ramp from 0.85 to 1.25, not stepped thresholds &mdash; no sudden visual jumps as ADX crosses round numbers.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE DIRECTIONAL ASYMMETRY LAYER</p>
              <p className="text-sm text-gray-400 leading-relaxed">In a bull trend, upside extension is expected; downside pullback is risky. So the engine widens the upper band and tightens the lower band &mdash; CAUTION fires sooner on the dangerous side, later on the safe side. <strong className="text-white">In a bear trend, the asymmetry flips</strong>. In a range, the engine reverts to symmetric bands. The asymmetry factor scales with ADX (5% at ADX 20, 15% at ADX 40+) so it disappears in low-conviction conditions. <strong className="text-white">The bands aren&apos;t just adaptive in width; they&apos;re biased in direction</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE PROMISE THE ENGINE MAKES</p>
              <p className="text-sm text-gray-400 leading-relaxed">Read the band, know the zone. <strong className="text-white">Inside inner band &rarr; SAFE (no overextension)</strong>. Past inner &rarr; WATCH (mild stretch). Past mid &rarr; CAUTION (real overextension). Past outer &rarr; DANGER (extreme stretch, mean reversion likely). The four zones don&apos;t require interpretation &mdash; they&apos;re binary, derived from price&apos;s position relative to the regime-adjusted bands. <strong className="text-white">The cascade in the Command Center turns this into a one-glance verdict</strong> with sizing guidance attached: NORMAL SIZE / STAY ALERT / TIGHTEN STOPS / REDUCE SIZE. Operator action is precomputed; the operator just reads.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Risk Envelope is the engine&apos;s answer to the universal &ldquo;how far is too far&rdquo; question. <strong className="text-white">It is regime-adaptive, directionally asymmetric, continuously scored, and broadcast as a four-zone cascade verdict</strong>. The operator&apos;s job is not to interpret the bands &mdash; the engine has already done that. The job is to read the cascade and size accordingly. SAFE means trade normally. WATCH means stay engaged. CAUTION means tighten stops. DANGER means reduce size or exit. <strong className="text-white">Static answers to dynamic questions are wrong answers; the Risk Envelope is the correct dynamic answer</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S02 — The Fair Value Anchor === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">02 &mdash; The Fair Value Anchor</p>
          <h2 className="text-2xl font-extrabold mb-4">Every Band Measures From The Same Line.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Before the Risk Envelope can answer how far is too far, it needs a definition of &ldquo;far from where&rdquo;. That reference is the <strong className="text-white">Fair Value Line</strong> &mdash; an exponential moving average of the bar&apos;s midpoint, calculated as <code className="text-amber-400">EMA(HL2, 20)</code>. Twenty-bar EMA of the midpoint of high and low. <strong className="text-white">Every other element in the Risk Envelope is measured relative to this line</strong>. The bands sit at fixed ATR multiples above and below it. The risk zones are defined by which band price has crossed. The Mean Reversion Score is exactly the distance from this line, normalized into 0-100. The line itself is rendered as a faint dotted white line on the chart when Fair Value Line is enabled in the inputs panel.</p>
          <FairValueLineAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the line draw itself across the price action. <strong className="text-white">Notice how price oscillates around it</strong> &mdash; sometimes above, sometimes below, but always pulled back toward it eventually. That magnetic-return behaviour is what mean reversion looks like in raw form. <strong className="text-amber-400">The Risk Envelope is fundamentally a measurement of distance from this line</strong>, calibrated by ATR and adjusted by regime. Everything else in the lesson is built on top of this foundation. If you remember nothing else from the next fifteen sections, remember: <strong className="text-white">EMA of HL2 over 20 bars is the gravitational center, and the bands are stretched ATR-rubber-bands around it</strong>.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">WHY HL2 INSTEAD OF CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The midpoint of high and low (HL2) is more stable than the close. <strong className="text-white">Close prices respond strongly to the final tick of each bar</strong>, which can be noisy on lower timeframes &mdash; especially around session opens and news events. HL2 averages over the bar&apos;s entire range, smoothing out the close-noise while preserving the bar&apos;s actual price territory. The EMA further smooths across bars. <strong className="text-white">The result is a cleaner reference line that doesn&apos;t flinch on every spike</strong> &mdash; which is exactly what you want when computing &ldquo;how far has price stretched from fair value&rdquo;.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 20 BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Twenty bars is the conventional intermediate window &mdash; long enough to filter noise, short enough to track meaningful regime shifts. <strong className="text-white">Shorter EMAs (5-10 bars) hug price too closely</strong>, defeating the purpose of measuring distance from a stable reference. <strong className="text-white">Longer EMAs (50+ bars) drift slowly</strong>, missing the contemporaneous fair value during fast moves and producing artificial overextension readings. Twenty bars balances responsiveness against stability. The choice mirrors the canonical period for many momentum and volatility tools (Bollinger 20, MACD 12/26 with a 9 signal &mdash; close to 20-bar territory in spirit).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY EMA, NOT SMA</p>
              <p className="text-sm text-gray-400 leading-relaxed">An exponential moving average gives more weight to recent bars and less to older ones, decaying smoothly. <strong className="text-white">A simple moving average (SMA) treats all 20 bars equally</strong>, which produces a noticeable lag and a quirky &ldquo;drop-off&rdquo; effect when an old bar leaves the window. EMAs avoid the drop-off and respond faster to fresh price action. For the Risk Envelope&apos;s purpose &mdash; defining a real-time fair value reference &mdash; the EMA&apos;s smoother, faster-reacting curve is structurally correct. <strong className="text-white">Every Cipher line that needs a reactive yet stable reference uses EMA, not SMA</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RENDER &mdash; DOTTED, WHITE, 65 TRANSPARENCY</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Fair Value Line renders as a <strong className="text-white">dotted white line at 65 transparency</strong> &mdash; visible but not loud. Stretched 300 bars back from the current bar, with a small forward extension to bar+10 so it&apos;s clear which direction time is moving. Visibility gates on the &ldquo;Fair Value Line&rdquo; toggle in the Risk Envelope input group; defaults ON. <strong className="text-white">When OFF, the calculation continues unchanged</strong> &mdash; the line just isn&apos;t drawn. Operators who want a cleaner chart can hide the line while still benefiting from every band, zone, and cascade reading derived from it. The visualization is independent of the engine&apos;s internal use of the value.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The Fair Value Line is invisible when off and unobtrusive when on, but it is the foundation everything else stands on. <strong className="text-white">When you see price hugging the line, the engine reads SAFE; when you see price stretched far above or below, the engine escalates the cascade</strong>. The line itself is not a trade trigger &mdash; it&apos;s a reference. Don&apos;t use it as support or resistance; that&apos;s what Cipher Structure is for. The Fair Value Line answers &ldquo;what is fair value right now&rdquo;; the bands answer &ldquo;is current price too far from it&rdquo;. <strong className="text-white">Always read in that order: anchor first, distance second</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S03 — The Three Bands === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">03 &mdash; The Three Bands</p>
          <h2 className="text-2xl font-extrabold mb-4">Inner 1.2&times; ATR. Mid 2.35&times; ATR. Outer 3.5&times; ATR.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Three nested bands sit above and below the Fair Value Line at fixed ATR multiples. <strong className="text-white">Inner band at 1.2&times; ATR. Mid band at 2.35&times; ATR. Outer band at 3.5&times; ATR</strong>. These are the base multipliers &mdash; before regime scaling and directional asymmetry are applied. The choice of multipliers is calibrated empirically across many instruments and timeframes. The 1.2 inner is intentionally just past the noise floor &mdash; price routinely sits within it during normal action. The 3.5 outer is intentionally far enough that price reaching it is a notable event &mdash; less than 5% of bars across most assets cross the outer band on either side. The 2.35 mid sits roughly between the two and defines the boundary between &ldquo;getting stretched&rdquo; and &ldquo;significantly overextended&rdquo;.</p>
          <ThreeBandsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bands reveal sequentially. <strong className="text-white">First the anchor (Fair Value Line)</strong>, then the inner band defining the SAFE zone, then the mid band marking the WATCH-to-CAUTION boundary, then the outer band marking the CAUTION-to-DANGER boundary. The four zones (SAFE / WATCH / CAUTION / DANGER) are derived from price&apos;s position relative to these bands &mdash; covered fully in S06. <strong className="text-amber-400">The bands don&apos;t render as lines on the chart</strong>; they render as filled colored zones that fade from vivid at the outer edge to transparent at the center. The center band (SAFE) has no fill at all &mdash; price travels through clear space when conditions are normal.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">INNER 1.2&times; ATR &mdash; THE NOISE FLOOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price sits inside the inner band during normal conditions &mdash; consolidation, mid-trend pauses, post-news cooldowns. <strong className="text-white">Crossing the inner band is the first signal that something is happening</strong>: the move has enough conviction to push price past 1.2 ATR from fair value. WATCH zone fires at this crossing. The Command Center cascade upgrades from NORMAL SIZE to STAY ALERT. <strong className="text-white">The threshold is intentionally just past the noise band</strong>; tighter would produce too many false WATCH alerts on normal volatility, looser would miss meaningful moves. 1.2 ATR is the empirical sweet spot.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MID 2.35&times; ATR &mdash; THE OVEREXTENSION BOUNDARY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When price crosses the mid band, the move is no longer just stretched &mdash; it&apos;s genuinely overextended. <strong className="text-white">CAUTION zone fires</strong>; the cascade upgrades to TIGHTEN STOPS. The 2.35 multiplier is calibrated so that mid-band crossings represent moves outside the 1-standard-deviation range under normal volatility distributions. <strong className="text-white">In a range, very few bars reach the mid band</strong>; in a strong trend, the regime scaling widens the band so mid-band crossings remain meaningful even in fast-moving conditions. The mid is where active position management begins &mdash; partial scale-outs, tighter stops, no new entries in the same direction.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">OUTER 3.5&times; ATR &mdash; THE EXTREME EVENT BOUNDARY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Crossing the outer band is rare. <strong className="text-white">Across many backtests, fewer than 5% of bars on either side touch or cross the outer</strong>. When it happens, the move is in extreme territory &mdash; the price has stretched 3.5 ATR (after regime scaling, often 4-4.5 ATR effective) from the fair value line. DANGER zone fires; the cascade upgrades to REDUCE SIZE. Mean reversion is statistically very likely from here, but not guaranteed &mdash; in genuine breakaway moves (news shocks, trend accelerations) price can dwell beyond the outer band for many bars. <strong className="text-white">Dwell time becomes the secondary signal</strong>; covered in S09.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FILLED ZONES, NOT LINES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The bands don&apos;t render as discrete lines on the chart. Instead, they render as <strong className="text-white">filled gradient zones</strong> &mdash; the DANGER zone (between mid and outer) fills with the trend color (teal in bull, magenta in bear), the CAUTION zone (between inner and mid) fills with a paler version of the same color, and the SAFE zone (inside inner) has no fill at all. Operators see the chart as a colored cloud with a clear center channel. <strong className="text-white">Reading the chart becomes intuitive</strong> &mdash; price inside the clear channel is SAFE, price entering the colored zones is escalating the read. The zone colors aren&apos;t decoration; they&apos;re the verdict.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three bands, four zones, one anchor. <strong className="text-white">The bands are not horizontal lines; they curve with the Fair Value Line and shift dynamically as ATR breathes</strong>. The base multipliers (1.2 / 2.35 / 3.5) are not user-configurable inputs &mdash; they&apos;re empirically locked into the engine. What IS user-configurable is the Intensity (Subtle / Normal / Bold) which adjusts the visual transparency of the fills, and Adaptive Intensity which adds progressive glow + breathing effects (S11). The bands themselves are immovable; what changes is how loud they look on the chart.</p>
          </div>
        </motion.div>
      </section>

      {/* === S04 — Regime-Adaptive Width === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">04 &mdash; Regime-Adaptive Width</p>
          <h2 className="text-2xl font-extrabold mb-4">Bands Widen With ADX. Tighten In Range. Stretch With Volatility.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The headline mechanism. <strong className="text-white">The Risk Envelope&apos;s base ATR multipliers are scaled by a continuous regime factor derived from ADX</strong>, with an additional volatility regime bonus when conditions are flagged as VOLATILE. The formula in plain English: a smooth linear ramp that takes ADX from 0 to 100 and produces a scale factor from 0.85 to 1.25, then adds 0.10 if the volatility regime is VOLATILE. The result is a band-width multiplier between 0.85 (strong range) and 1.35 (strong trend in volatile conditions). <strong className="text-amber-400">Strong trends widen bands by up to 35% &mdash; ranges tighten them by up to 15%</strong>. This single mechanism eliminates roughly 80% of the false DANGER signals that plague fixed-band indicators.</p>
          <RegimeScaleAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the three panels. <strong className="text-white">Panel 1 (RANGE, ADX 25)</strong> &mdash; bands at 0.95 scale, slightly tighter than baseline. CAUTION fires for moves that would be normal in a trend. <strong className="text-white">Panel 2 (TREND, ADX 50)</strong> &mdash; bands at 1.05 scale, near baseline. The standard view. <strong className="text-white">Panel 3 (STRONG TREND + VOLATILE, ADX 75)</strong> &mdash; bands at 1.25 scale (1.15 from ADX + 0.10 from VOLATILE bonus), 30% wider than baseline. <strong className="text-amber-400">A 2-ATR move on this chart is INSIDE the inner band &mdash; SAFE</strong>. The same 2-ATR move on Panel 1 would be deep into CAUTION. Same price action, different read &mdash; because regime is the missing variable.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE FORMULA &mdash; CONTINUOUS, NOT STEPPED</p>
              <p className="text-sm text-gray-400 leading-relaxed">The scale factor is calculated as <code className="text-amber-400">regime_scale = 0.85 + trend_pct * 0.004</code>. Trend percentage runs from 0 to 100, so the scale ranges from 0.85 (trend_pct = 0) through 1.05 (trend_pct = 50) to 1.25 (trend_pct = 100). <strong className="text-white">It is a smooth continuous ramp</strong>, not a stepped threshold. As ADX rises from 25 to 50 to 75, the bands widen smoothly &mdash; no visual jumps, no sudden zone re-classifications. The continuous nature is critical: stepped thresholds would cause SAFE-to-WATCH flickers right at the edges, which is exactly the kind of noise the engine is designed to filter out.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE VOLATILE BONUS &mdash; +0.10 SCALE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the volatility regime is flagged as VOLATILE (high ATR relative to recent average, typically driven by news or session transitions), the engine adds <strong className="text-white">+0.10 to the scale factor</strong>. This stacks on top of the ADX-driven regime scale, producing band widths up to 1.35x baseline. <strong className="text-white">The bonus reflects a simple reality</strong>: volatile conditions produce larger normal moves. Without the bonus, the engine would generate false CAUTION/DANGER signals during legitimate news-driven moves. With the bonus, the bands give volatile conditions room to breathe while still flagging genuinely extreme overextensions.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 0.85 TO 1.25 (NOT WIDER)</p>
              <p className="text-sm text-gray-400 leading-relaxed">The range was chosen empirically. <strong className="text-white">Tighter than 0.85 in ranges</strong> would push CAUTION onto noise-level moves. <strong className="text-white">Wider than 1.25 in strong trends</strong> would suppress legitimate overextension warnings &mdash; even in a strong trend, 4+ ATR from fair value is genuinely overextended. The 0.85-1.25 range produces a 47% spread between the tightest and widest configurations, which is enough to meaningfully differentiate regimes without breaking the underlying logic. With the VOLATILE bonus stacked, the effective range becomes 0.85-1.35 = 59% spread &mdash; still bounded, still calibrated.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE OPERATOR DOESN&apos;T NEED TO TRACK ADX</p>
              <p className="text-sm text-gray-400 leading-relaxed">The regime scaling is fully internal to the engine. <strong className="text-white">The operator doesn&apos;t need to look up ADX or read a regime indicator</strong>; the bands themselves visibly widen and tighten as conditions change. A trader watching the chart sees the bands stretch out as a strong trend develops, and contract back as the move stalls. The visual is the message. <strong className="text-white">The Cipher Pro Command Center includes a Regime row that broadcasts the current regime state</strong> (TREND / RANGE / VOLATILE / TRANSITION), so the operator can confirm what the bands are responding to &mdash; but the bands themselves communicate the regime visually without requiring a second-glance.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Bands wider than usual = strong trend. Bands tighter than usual = range. Bands suddenly stretched to maximum = volatile event in progress. <strong className="text-white">The visible width of the bands IS the regime</strong>. When you see the bands at their widest, expect aggressive directional moves to be normal &mdash; and don&apos;t panic when price extends 3 ATR. When you see them tightest, expect any extension past the inner band to mean something. <strong className="text-white">Trust the visual; the engine has already done the math</strong>. Regime-blind trading is the single biggest mistake retail volatility-band users make. Don&apos;t make it.</p>
          </div>
        </motion.div>
      </section>

      {/* === S05 — Directional Asymmetry === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">05 &mdash; Directional Asymmetry</p>
          <h2 className="text-2xl font-extrabold mb-4">Trend-Side Wider. Counter-Side Tighter. Asymmetric By Design.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">In a strong bull trend, upside extension is normal &mdash; price legitimately stretches further above fair value than below. <strong className="text-white">A symmetric band would over-warn on the upside and under-warn on the downside</strong>, exactly backwards from operator needs. CIPHER fixes this by applying a directional asymmetry factor that scales with ADX. In bull trends, the upper band widens and the lower band tightens. In bear trends, the asymmetry mirrors. In ranges (low ADX), the bands stay symmetric. The asymmetry factor ranges from 0% (range, no bias) to 15% (strong trend, max bias). The result: <strong className="text-amber-400">CAUTION fires sooner on the dangerous side, later on the safe side</strong>. This single mechanism is what makes the Risk Envelope correctly read trend continuations as SAFE while still flagging counter-trend overextensions early.</p>
          <DirectionalAsymmetryAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the two panels side by side. <strong className="text-white">Left (BULL TREND)</strong>: ribbon arrow points up. The upper band visibly extends further from anchor than the lower band &mdash; +15% on top, -15% on bottom. <strong className="text-white">Right (BEAR TREND)</strong>: mirror image. Lower band extended, upper tightened. <strong className="text-amber-400">Same anchor, same ATR, same base multipliers &mdash; different shape entirely</strong>. The cloud is no longer symmetric around the Fair Value Line; it leans into the direction of the trend. That asymmetry is encoded into every zone classification, every cascade verdict, every transition event downstream.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE ASYMMETRY FORMULA</p>
              <p className="text-sm text-gray-400 leading-relaxed">The asymmetry factor scales linearly with ADX. <code className="text-amber-400">asym_factor = max 0.15, (adx_val - 15) * 0.006</code>, capped at 15%, with a floor of 0% when ADX is below 15. <strong className="text-white">At ADX 20, asymmetry is just 3%</strong> &mdash; barely visible. <strong className="text-white">At ADX 40+, asymmetry is the full 15%</strong> &mdash; dramatic visible bias. The threshold of ADX 15 is the empirical floor below which the market is structurally directionless and asymmetry would be misleading. The 0.006 ramp produces a smooth, continuous transition that mirrors the regime scale curve. Same philosophy: continuous ramps, no stepped thresholds.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TREND-SIDE WIDER &mdash; GIVE THE TREND ROOM</p>
              <p className="text-sm text-gray-400 leading-relaxed">In a bull trend, the upper band scales by <code className="text-amber-400">trend_side = 1.0 + asym_factor</code>. With asymmetry at 15%, that&apos;s a <strong className="text-white">15% wider upper band</strong>. Combined with regime scaling at strong-trend levels (1.15-1.25), the effective upper band can be up to 44% wider than the symmetric baseline. <strong className="text-white">Price extending high in a bull trend stays in SAFE/WATCH for longer</strong>, exactly as it should &mdash; trend extensions are not overextensions in the way mean reversion theory implies. The engine has effectively encoded &ldquo;don&apos;t fight the trend&rdquo; into its overextension definition.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COUNTER-SIDE TIGHTER &mdash; CATCH THE PULLBACK EARLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">In a bull trend, the lower band scales by <code className="text-amber-400">counter_side = 1.0 - asym_factor</code> &mdash; a <strong className="text-white">15% tighter lower band</strong>. CAUTION on the downside fires sooner than it would on a symmetric chart. The reasoning: <strong className="text-white">downside pullbacks in a bull trend are the dangerous direction</strong> &mdash; they could be the start of a real reversal, or just a routine retracement. Either way, an operator should be alerted earlier rather than later. The tightened counter-side band gives them the head start to assess whether to scale out, hedge, or hold.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RANGE = SYMMETRIC (NO BIAS)</p>
              <p className="text-sm text-gray-400 leading-relaxed">When ADX is below 15, asymmetry is exactly zero &mdash; the bands are symmetric around the Fair Value Line. <strong className="text-white">In a range, neither side is the &ldquo;trend side&rdquo; or the &ldquo;counter side&rdquo;</strong>; mean reversion applies in both directions equally. Forcing asymmetry on a directionless market would distort the reading. The engine&apos;s ADX 15 floor turns the asymmetry layer off cleanly, restoring symmetric Bollinger-style behaviour for ranging conditions. <strong className="text-white">As soon as ADX climbs back above 15, asymmetry ramps in smoothly</strong> &mdash; no sudden visual jump.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ASYMMETRY USES RIBBON_DIR, NOT BULLISH/BEARISH FLAGS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Risk Envelope&apos;s asymmetry uses <code className="text-amber-400">ribbon_dir</code> (the +1 / 0 / -1 ribbon stack value computed earlier in the engine), not the ribbon_bullish / ribbon_bearish booleans set later. <strong className="text-white">This is intentional</strong>: ribbon_dir is the cleaner directional signal, available before the polarity-flip checks that produce bullish/bearish flags. By the time the Risk Envelope module runs, ribbon_dir has stabilized for the bar; using it ensures asymmetry is consistent with the Cipher Ribbon row&apos;s reading downstream. The two are nearly always in agreement, but the data ordering in Pine matters.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EUR DAILY EXAMPLE &mdash; ASYMMETRY VISIBLE OVER MONTHS</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real EUR/USD daily chart (April 2026, full year visible) shows the asymmetry mechanism in action across multiple regime shifts. <strong className="text-white">Early Feb at the high, ribbon was bullish, upper band visibly extended, lower band tighter</strong> &mdash; the cloud leans up. <strong className="text-white">Through March, the trend flipped bearish</strong>; the asymmetry mirrored, the cloud now leaned down, with magenta DANGER zones biasing toward the downside extensions. The shape of the cloud at any given moment encodes the prevailing trend direction; an experienced operator can read the trend just by glancing at how the cloud is leaning, before even checking the Ribbon row.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ASYMMETRY STACKS WITH REGIME SCALING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The two adaptive layers compose. <strong className="text-white">Regime scale (0.85-1.25) controls overall band width</strong>; asymmetry (0.85-1.15 per side) controls left-right balance. In a strong bull trend with VOLATILE regime, the upper band scales by <code className="text-amber-400">1.25 (regime) &times; 1.15 (asym) = 1.44</code>, a 44% widening. The lower band scales by <code className="text-amber-400">1.25 &times; 0.85 = 1.06</code>, just barely above baseline. <strong className="text-white">The net result is a heavily lopsided cloud</strong> that gives massive upside room while still tracking downside risk normally &mdash; exactly the right shape for trading a strong bull trend.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ASYMMETRY NEVER INVERTS THE BANDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">The asymmetry factor is capped at 15% per side. <strong className="text-white">No matter how strong the trend, the lower band never crosses inside the upper band</strong> or vice versa. The structural integrity of the four-zone hierarchy (SAFE inside, DANGER outside) is preserved. The 15% cap is an engineering constraint &mdash; without it, extreme ADX readings could theoretically pinch one side too tight and produce visual artifacts. The cap ensures the bands always look like proper bands, just visibly leaning. <strong className="text-white">This bounded design is part of why CIPHER&apos;s adaptive layers compose cleanly</strong> rather than producing chaotic visuals at regime extremes.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Asymmetric bands encode &ldquo;don&apos;t fight the trend&rdquo; directly into the visual. <strong className="text-white">A cloud leaning up means trend is bullish; a cloud leaning down means bearish</strong>. CAUTION on the trend-side requires more extension than CAUTION on the counter-side; the engine prefers being wrong on the easy side and right on the dangerous side. <strong className="text-white">When you see DANGER fire on the counter-side of a strong trend, take it seriously</strong> &mdash; the bands are tight there for a reason. When you see DANGER fire on the trend-side, the move is genuinely extreme, because the bands gave it room and price still exceeded them.</p>
          </div>
        </motion.div>
      </section>

      {/* === S06 — The Four Risk Zones === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">06 &mdash; The Four Risk Zones</p>
          <h2 className="text-2xl font-extrabold mb-4">SAFE. WATCH. CAUTION. DANGER.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Four zones, four verdicts, four sizing instructions. <strong className="text-white">The zone classification is computed from a single conditional</strong>: where is `close` relative to the bands? Inside inner = SAFE. Past inner but inside mid = WATCH. Past mid but inside outer = CAUTION. Past outer = DANGER. Symmetric &mdash; the same logic applies whether price has stretched above or below the Fair Value Line. <strong className="text-amber-400">The zone is binary at any moment</strong>: at any given bar close, exactly one zone is active. The Pine implementation is a single chained ternary: <code className="text-amber-400">close &gt; outer_upper or close &lt; outer_lower ? &quot;DANGER&quot; : close &gt; mid_upper or close &lt; mid_lower ? &quot;CAUTION&quot; : close &gt; inner_upper or close &lt; inner_lower ? &quot;WATCH&quot; : &quot;SAFE&quot;</code>. Deterministic. Auditable. No fuzzy weighting.</p>
          <FourZonesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the price marker walk through each zone in turn. <strong className="text-white">SAFE</strong>: price oscillates near the Fair Value Line, the cloud is mostly transparent around it, the verdict reads NORMAL SIZE. <strong className="text-white">WATCH</strong>: price crosses past inner band, the operator should pay attention, verdict says STAY ALERT. <strong className="text-white">CAUTION</strong>: price punches into the colored mid-zone, real overextension is happening, verdict says TIGHTEN STOPS. <strong className="text-white">DANGER</strong>: price has crossed the outer band into the most vivid colored zone, mean reversion is statistically very likely, verdict says REDUCE SIZE. <strong className="text-amber-400">Each zone has a precomputed sizing verdict baked into the engine</strong>; no operator-side translation needed.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SAFE &mdash; INSIDE THE INNER BAND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price is within 1.2x ATR of the Fair Value Line (after regime scaling and asymmetry adjustment). <strong className="text-white">The clear center channel of the cloud</strong> &mdash; no fill, just the dotted Fair Value Line passing through. <strong className="text-white">SAFE is the default state</strong>, the resting condition between active moves. Roughly 50-65% of bars across most assets/timeframes sit in SAFE. The cascade verdict is NORMAL SIZE, colour teal &mdash; the operator trades unconstrained, takes their normal R-per-trade, no special considerations from the Risk dimension.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WATCH &mdash; PAST INNER, INSIDE MID</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price has crossed the inner band but not yet reached the mid band. <strong className="text-white">Mild stretch</strong> &mdash; not yet overextension, but no longer noise. The CAUTION zone fill begins to show colour at WATCH boundary; the chart visibly changes character. The cascade verdict is STAY ALERT, colour amber. Operators should not panic at WATCH; this is the engine&apos;s &ldquo;heads up&rdquo; level, not a stop signal. <strong className="text-white">Roughly 20-30% of bars sit in WATCH</strong> on average. Active position-management decisions don&apos;t fire here yet, but situational awareness should sharpen.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CAUTION &mdash; PAST MID, INSIDE OUTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price has crossed the mid band &mdash; now it&apos;s genuinely overextended. <strong className="text-white">CAUTION is when active risk management starts</strong>: tighten stops, scale out partially, no new entries in the same direction. The cascade verdict is TIGHTEN STOPS, colour amber. Roughly 8-15% of bars sit in CAUTION. <strong className="text-white">Mean reversion is statistically more likely than continuation from here</strong>, but the move can still extend further on news, momentum, or liquidity events. CAUTION is not an exit signal &mdash; it is a defensive-positioning signal. The trade can still work; the operator just stops adding to it.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DANGER &mdash; PAST OUTER, EXTREME EXTENSION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Price has crossed the outer band. The most vivid coloured zone &mdash; deepest fill, most visible on chart. <strong className="text-white">DANGER is rare</strong>: typically 2-5% of bars across most assets/timeframes. The cascade verdict is REDUCE SIZE, colour magenta. <strong className="text-white">Mean reversion from DANGER is statistically very likely</strong> &mdash; in many backtests, 70-80% of DANGER zone visits are followed by retracement to mid or inner band within 5-15 bars. The operator should significantly reduce position size, take partial profits, and prepare for the snap-back. DANGER is the engine&apos;s &ldquo;reduce exposure&rdquo; flag.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DIRECTION SUFFIX &mdash; ▲ ABOVE OR ▼ BELOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The zone classification is symmetric, but the engine tracks which side of the Fair Value Line price is on. <strong className="text-white">In the cascade row, the zone is prefixed with ▲ or ▼</strong>: ▲ WATCH means price is above fair value in the WATCH zone, ▼ CAUTION means price is below in the CAUTION zone, etc. The arrow gives directional context that the zone alone doesn&apos;t carry. <strong className="text-white">Combined with the trend direction (Ribbon row), the operator instantly knows whether the overextension is with-trend or counter-trend</strong>. ▲ DANGER in a bull trend = trend extension; ▼ DANGER in a bull trend = pullback overextension. Different setups.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ZONES ARE BINARY AT BAR CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The zone classification uses `close`, not high or low. <strong className="text-white">Wicks beyond a band do NOT trigger a zone change</strong> &mdash; only the bar&apos;s close. This intentional design avoids zone flicker on intraday wicks that don&apos;t represent sustained price action. A 5-tick wick that pierces the outer band but closes back inside the inner does not register as DANGER &mdash; the bar closes in SAFE. <strong className="text-white">This is a deliberate choice that mirrors how Cipher Sweeps detects sweeps</strong> &mdash; using close-back-inside as confirmation. The Risk Envelope only escalates on closes; flickers don&apos;t count.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EACH ZONE COLOR-CODED IN THE COMMAND CENTER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Risk row in the Command Center color-codes the zone label: <strong className="text-white">SAFE = teal</strong>, <strong className="text-white">WATCH = amber</strong>, <strong className="text-white">CAUTION = amber</strong>, <strong className="text-white">DANGER = magenta</strong>. The verdict cell to the right uses a slightly different palette to emphasize transitions. ENTRENCHED DANGER bumps the verdict color to a brighter red (#FF1744) for extra visual prominence &mdash; the engine wants the operator to notice when DANGER has been sustained too long. <strong className="text-white">Color is not decoration; it is the engine&apos;s pre-rendered urgency level</strong>, calibrated to match operator attention budget.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ZONE TRANSITIONS DRIVE THE EVENT LAYER</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the zone changes between bars, the engine fires a transition event &mdash; covered in detail in S08. <strong className="text-white">The four zones produce up to twelve possible transitions</strong> (each zone can transition to any other), but only four of them carry standalone verdict significance: entered_danger, entered_caution, exited_danger, returned_safe. These four are what get color-coded prominently in the cascade. <strong className="text-white">The zone is the state; the transition is the news</strong>. Both layers stack: the zone says where you are, the transition says how you got there, the dwell phase (S09) says how long you&apos;ve been there. Three layers, one story.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Four zones, four sizing instructions. <strong className="text-white">SAFE = trade normal R. WATCH = stay engaged, normal R. CAUTION = tighten stops, scale out partially, no new entries. DANGER = reduce size by 50%+, take profits, prepare for snap-back</strong>. Combined with direction (▲ above / ▼ below) and trend context, the operator knows exactly what posture to take. <strong className="text-white">The engine&apos;s job is to tell you where you are; your job is to react with discipline</strong>. The four zones and their sizing verdicts are the most-glanced channel in the entire CIPHER Command Center.</p>
          </div>
        </motion.div>
      </section>

      {/* === S07 — Mean Reversion Score === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">07 &mdash; Mean Reversion Score</p>
          <h2 className="text-2xl font-extrabold mb-4">A Continuous 0&ndash;100 Pressure Gauge.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The four zones are discrete; the Mean Reversion Score is continuous. <strong className="text-white">Score 0 = price exactly at fair value. Score 100 = price at maximum observed extension</strong>. The score is calculated as <code className="text-amber-400">mr_score = risk_atr_dist / mr_max_ref &times; 80</code>, capped at 100, where <code className="text-amber-400">risk_atr_dist</code> is the absolute distance from price to anchor in ATR units, and <code className="text-amber-400">mr_max_ref</code> is the regime-adaptive outer band multiplier. <strong className="text-white">At the outer band edge, the score reads 80</strong>; beyond the outer band, the score climbs into 80-100 territory; inside the inner band, the score stays under 30. The score isn&apos;t just a pretty number &mdash; it powers the signal context tagging system, the tooltip overextension labels, the Adaptive Intensity progressive glow, and the Command Center Risk row intel.</p>
          <MeanReversionScoreAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the score gauge oscillate. <strong className="text-white">Score under 20 reads NONE</strong> &mdash; price is at or near fair value, no overextension at all. <strong className="text-white">Score 20-40 reads LOW</strong> &mdash; mild stretch, normal trading conditions. <strong className="text-white">Score 40-60 reads MODERATE</strong> &mdash; price is meaningfully extended, comparable to the WATCH zone. <strong className="text-white">Score 60-80 reads HIGH</strong> &mdash; deep into CAUTION territory. <strong className="text-white">Score above 80 reads EXTREME</strong> &mdash; DANGER zone or beyond. <strong className="text-amber-400">The score continuously reports overextension intensity</strong> in a way that the four discrete zones can&apos;t. The boolean <code className="text-amber-400">mr_overextended</code> flag fires when the score crosses 60.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">REGIME-ADAPTIVE NORMALIZATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The denominator <code className="text-amber-400">mr_max_ref</code> is the regime-adjusted outer band multiplier, not the base 3.5. <strong className="text-white">In a strong trend, mr_max_ref might be 4.4 (3.5 &times; 1.25); in a tight range, it might be 3.0 (3.5 &times; 0.85)</strong>. The score normalizes against the regime-appropriate outer band, not a fixed reference. This means the score reads consistently across regimes: a score of 80 always means &ldquo;at the outer band&rdquo;, regardless of whether that outer band is at 3 ATR or 4.4 ATR from anchor. <strong className="text-white">The score is regime-relative, not absolute</strong>. An EXTREME reading in a tight range means a different absolute distance than an EXTREME reading in a strong trend, but the operator significance is the same.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FIVE LABEL TIERS &mdash; NONE / LOW / MODERATE / HIGH / EXTREME</p>
              <p className="text-sm text-gray-400 leading-relaxed">The score maps to five labels via 20-point bands. <strong className="text-white">NONE (0-20), LOW (20-40), MODERATE (40-60), HIGH (60-80), EXTREME (80+)</strong>. The labels appear in the signal engine&apos;s tooltips when a buy/sell signal fires, providing a one-word overextension descriptor. They also appear in the context tagging cascade &mdash; signals firing while score is HIGH or EXTREME get tagged with overextension context. <strong className="text-white">The labels match operator intuition</strong>: NONE = no concern, LOW = situational awareness, MODERATE = active risk management, HIGH = defensive posture, EXTREME = reduce or exit. They&apos;re the verbal version of the four-zone color code.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE 60 BOOLEAN THRESHOLD &mdash; mr_overextended</p>
              <p className="text-sm text-gray-400 leading-relaxed">The engine sets <code className="text-amber-400">mr_overextended := mr_score &gt; 60</code> as a boolean flag. <strong className="text-white">When mr_overextended is true, price is in CAUTION or DANGER territory</strong>. The flag is consumed by other engine modules: the signal engine uses it to suppress with-trend continuation signals (which would be entering into overextension), the context tagging system uses it to upgrade buy/sell tags with &ldquo;overextended&rdquo; modifiers, and the Adaptive Intensity layer uses it to start brightening the danger glow. <strong className="text-white">A single boolean threshold becomes a critical input across multiple downstream features</strong>; the score is more than just visual decoration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 80 (NOT 100) AT OUTER BAND</p>
              <p className="text-sm text-gray-400 leading-relaxed">The score formula multiplies by 80, not 100. <strong className="text-white">Crossing the outer band reads 80, not 100</strong>. The reason: price often goes BEYOND the outer band, especially in news-driven moves or trend accelerations. If 100 = at outer band, the engine would have nowhere to go for &ldquo;past outer band&rdquo;. By calibrating outer = 80, the engine reserves 80-100 for the rare cases where price is genuinely beyond outer &mdash; and those cases are the most extreme overextensions on the chart. <strong className="text-white">A score of 95 is dramatically more meaningful than a score of 81</strong>; the calibration preserves resolution at the upper end where it matters most.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE FEEDS THE SIGNAL TOOLTIPS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a CIPHER buy or sell signal fires, the signal&apos;s hover-tooltip includes a <strong className="text-white">Reversion line</strong>: <code className="text-amber-400">Reversion: HIGH (78%) &mdash; FV 1.0825</code>. The label is the score tier; the percentage is the raw score; the FV value is the current Fair Value Line price. <strong className="text-white">Operators can see at a glance whether the signal is firing at fair value or in overextended territory</strong>. A buy signal with Reversion: NONE is a clean entry near anchor; a buy signal with Reversion: EXTREME is a counter-trend reversal attempt at maximum stretch. The tooltip line is identical in format across every signal type; consistency aids muscle memory.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE POWERS PROGRESSIVE DANGER GLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Adaptive Intensity feature (S11) uses the score to drive progressive danger glow. <strong className="text-white">When score &gt; 60, transparency drops by 8 points</strong>; <strong className="text-white">when score &gt; 80, transparency drops by 15 points</strong>. The deeper price pushes into overextension, the brighter the danger zone fill becomes. Visually, the cloud screams louder as the score climbs &mdash; the operator gets an unmissable visual escalation without needing to read the Command Center at all. <strong className="text-white">This is the single most popular Adaptive Intensity feature</strong>: it converts the abstract score number into a continuously breathing visual that demands attention proportional to actual risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE IS ALWAYS COMPUTED, EVEN WHEN ENVELOPE IS HIDDEN</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Mean Reversion Score is a fundamental engine value, computed every bar regardless of whether the Risk Envelope visualization is enabled. <strong className="text-white">Operators who hide the Risk Envelope to declutter the chart still benefit from score-driven features</strong>: signal tooltips still show the Reversion line, the Risk row in the Command Center still updates, the context tagging system still flags overextended signals. The visual rendering is independent of the underlying calculation. <strong className="text-white">Hiding the bands doesn&apos;t hide the intelligence</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SCORE IS LIVE; ZONES ARE BAR-CLOSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle but important distinction. <strong className="text-white">The Mean Reversion Score updates intra-bar as price moves</strong>; you can watch it tick up and down in real time. The four zones, however, only update at bar close. Why? Because the zones drive transition events, and we don&apos;t want those events firing on intra-bar wicks. <strong className="text-white">The score gives operators continuous overextension awareness; the zones give them confirmed state changes</strong>. Both are correct for their purpose; the design separates the live-watching layer from the event-firing layer cleanly.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">The score is the dial; the zones are the dial face. <strong className="text-white">Watch the score for live pressure; check the zones for confirmed state</strong>. A score climbing rapidly from 40 to 60 is a warning the bar might close in CAUTION. A score plateauing at 70 means CAUTION is sustained. A score above 80 means DANGER is imminent or active. <strong className="text-white">The score is the operator&apos;s real-time gauge</strong>; the zones are the engine&apos;s confirmed verdicts. Use both. The score for nowcasting; the zones for action.</p>
          </div>
        </motion.div>
      </section>

      {/* === S08 — Zone Transition Events === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">08 &mdash; Zone Transition Events</p>
          <h2 className="text-2xl font-extrabold mb-4">Four Events. Fire Once. Outrank The State.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Zones describe state. Transitions describe news. <strong className="text-white">When the zone changes between bars, the engine fires a transition event on the first bar of the change</strong>. Four named events carry verdict-grade significance: <code className="text-amber-400">rz_entered_danger</code>, <code className="text-amber-400">rz_entered_caution</code>, <code className="text-amber-400">rz_exited_danger</code>, <code className="text-amber-400">rz_returned_safe</code>. Each fires for exactly one bar &mdash; the bar where the zone changed &mdash; and then resets. <strong className="text-amber-400">In the Command Center cascade, transition events outrank zone-state verdicts</strong>: when an event fires, the Risk row displays the event message (JUST HIT DANGER, JUST HIT CAUTION, LEAVING DANGER, BACK TO SAFE) instead of the static state message (REDUCE SIZE, TIGHTEN STOPS, etc.). The transition is the news; the state is the background. News always overrides background.</p>
          <ZoneTransitionEventsAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch four scenarios cycle. <strong className="text-white">JUST HIT DANGER</strong> &mdash; price escalated from CAUTION into DANGER on this bar; magenta ✕ marker prints above the bar; verdict reads JUST HIT DANGER in magenta. <strong className="text-white">JUST HIT CAUTION</strong> &mdash; price escalated from WATCH into CAUTION; amber ✕ marker; verdict reads JUST HIT CAUTION in amber. <strong className="text-white">LEAVING DANGER</strong> &mdash; price de-escalated from DANGER back into CAUTION; teal verdict, no chart marker (markers only fire on escalation, not de-escalation). <strong className="text-white">BACK TO SAFE</strong> &mdash; price de-escalated all the way back to SAFE from any higher zone; teal verdict. <strong className="text-amber-400">Each event fires on exactly the bar of change, then expires</strong>; the next bar reverts to the state-based verdict.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">EVENT 1 &mdash; rz_entered_danger</p>
              <p className="text-sm text-gray-400 leading-relaxed">Fires when <code className="text-amber-400">rz_escalated and rz_level == 3</code> &mdash; the zone level just escalated AND price is now in DANGER. The previous zone could have been CAUTION, WATCH, or SAFE; what matters is that the new zone is DANGER. <strong className="text-white">The cascade verdict displays as JUST HIT DANGER in magenta</strong>; a magenta ✕ marker prints above the bar (gated on the Zone Transition Markers input toggle). The event fires for one bar only; on the next bar, if price is still in DANGER, the cascade reverts to REDUCE SIZE. <strong className="text-white">Operators receive the news once, then see the state for the duration</strong> &mdash; the design avoids notification spam.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EVENT 2 &mdash; rz_entered_caution</p>
              <p className="text-sm text-gray-400 leading-relaxed">Fires when <code className="text-amber-400">rz_escalated and rz_level == 2</code>. Price escalated INTO CAUTION (could have come from WATCH or SAFE). <strong className="text-white">Cascade verdict: JUST HIT CAUTION in amber</strong>; amber ✕ marker prints. Like rz_entered_danger, fires once per escalation event. <strong className="text-white">CAUTION transitions are the most common transition events</strong>; price reaches CAUTION more often than it reaches DANGER, so this event fires more frequently. Operators learn to read JUST HIT CAUTION as &ldquo;mid-band crossing event&rdquo;: the kind of moment where active position management decisions get made (tighten stops, scale out, no new entries).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EVENT 3 &mdash; rz_exited_danger</p>
              <p className="text-sm text-gray-400 leading-relaxed">Fires when <code className="text-amber-400">rz_deescalated and rz_prev == 3</code>. Price was in DANGER on the previous bar and is now in a lower zone (CAUTION or WATCH). <strong className="text-white">Cascade verdict: LEAVING DANGER in teal</strong> &mdash; the de-escalation colour. No chart marker (markers fire on escalation only). <strong className="text-white">LEAVING DANGER is operationally significant</strong>: it means the snap-back from extreme overextension has begun. Counter-trend trades opened during DANGER often start closing here; trend continuation traders see this as confirmation the move was just a brief excursion. The single bar of LEAVING DANGER is a meaningful checkpoint regardless of strategy.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EVENT 4 &mdash; rz_returned_safe</p>
              <p className="text-sm text-gray-400 leading-relaxed">Fires when <code className="text-amber-400">rz_deescalated and rz_level == 0</code> &mdash; price has returned all the way to SAFE from any higher zone. <strong className="text-white">Cascade verdict: BACK TO SAFE in teal</strong>. The completion of the mean-reversion arc; price has fully returned to fair value territory. <strong className="text-white">BACK TO SAFE often coincides with trade-completion moments</strong>: counter-trend reversals from DANGER reach BACK TO SAFE near their target; sustained trend pullbacks reach BACK TO SAFE near their re-entry zone. The verdict is teal because de-escalation is generally favourable &mdash; the engine treats &ldquo;returning to fair value&rdquo; as a positive system state.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CHART MARKERS &mdash; ✕ ON ESCALATION ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a transition event fires AND it&apos;s an escalation (entered_danger or entered_caution), the engine prints a ✕ marker on the chart above the bar. <strong className="text-white">DANGER markers are magenta; CAUTION markers are amber</strong>. De-escalation events (exited_danger, returned_safe) don&apos;t print markers &mdash; the visual cue is reserved for risk-increasing events. <strong className="text-white">The marker is a one-bar event</strong>: it doesn&apos;t persist after the bar where the event fired. Operators scrolling back through chart history see exactly which bars triggered escalations. The marker visibility gates on both <code className="text-amber-400">show_envelope</code> AND <code className="text-amber-400">i_show_rz_markers</code> &mdash; if either is OFF, no markers print, but the cascade row still reports the event.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EUR DAILY EXAMPLE &mdash; TWO ✕ MARKERS VISIBLE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real EUR/USD daily chart shows two transition markers. <strong className="text-white">Early February at 1.20 high, an amber ✕ marks the bar where price entered CAUTION above the upper band</strong> &mdash; trend exhaustion confirmation, the local top formed shortly after. <strong className="text-white">Late March at 1.13 low, another amber ✕ marks an entered_caution event below the lower band</strong> &mdash; mean reversion candidate, and price did reverse back toward fair value over the following weeks. Both markers fired on the bar of zone change, persisted as visual reminders, and corresponded to operationally significant turning points. The chart history is annotated by the engine itself.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BTC 1H EXAMPLE &mdash; JUST HIT CAUTION FRESH</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real BTC 1h chart caught at the exact moment of escalation. <strong className="text-white">Bear trend in progress; price dropped through the lower mid band; the cascade flipped to JUST HIT CAUTION in amber</strong>. The chart shows an amber ✕ marker on the most recent bar at $76k area. <strong className="text-white">Cell 2 reads ▼ CAUTION; cell 3 reads → JUST HIT CAUTION</strong> &mdash; cell 3 has overridden the static TIGHTEN STOPS verdict for this single bar. On the next bar (after the screenshot was taken), if price stays in CAUTION, cell 3 will revert to TIGHTEN STOPS with a dwell suffix. The screenshot captures the precise news moment.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE XAU 15M EXAMPLE &mdash; BACK TO SAFE DE-ESCALATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real XAU/USD 15m chart shows a de-escalation event in progress. <strong className="text-white">The chart had been in CAUTION earlier (visible amber ✕ marker at the lower extension)</strong>; price rallied back toward fair value, crossed the inner band on the way up, and triggered rz_returned_safe. <strong className="text-white">Cell 2 now reads ▼ SAFE; cell 3 reads → BACK TO SAFE in teal</strong>. The single ✕ marker on the chart documents the original entered_caution event; the current bar is the de-escalation. The de-escalation event itself doesn&apos;t print a marker; the cascade message is the only signal.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Transitions are the news. <strong className="text-white">When the cascade reads JUST HIT DANGER, you have one bar of priority alert &mdash; act, decide, or explicitly choose to wait</strong>. After that, the cascade reverts to REDUCE SIZE and you&apos;re reading the state, not the news. <strong className="text-white">JUST HIT CAUTION is the most actionable transition</strong> for active risk management; LEAVING DANGER and BACK TO SAFE often coincide with target / take-profit moments. The four events plus the four states give you eight different cascade messages, each with a precomputed operator action. <strong className="text-white">The Risk row is the most-glanced row in the Command Center precisely because every possible state has a clear instruction attached</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === S09 — Dwell Phases === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">09 &mdash; Dwell Phases</p>
          <h2 className="text-2xl font-extrabold mb-4">SPIKE. VISIT. ESTABLISHED. ENTRENCHED.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A 1-bar visit to DANGER is noise. A 15-bar dwell in DANGER is structural. <strong className="text-white">The engine tracks how long price has been in the current zone via a bar counter that resets on zone change</strong>. Four named phases describe the dwell duration: <strong className="text-white">SPIKE (≤2 bars), VISIT (3-8 bars), ESTABLISHED (9-20 bars), ENTRENCHED (21+ bars)</strong>. The phase appears as a suffix in the cascade verdict for non-SAFE, non-transition bars: a CAUTION zone with 12 bars dwelt reads as &ldquo;TIGHTEN STOPS  12b&rdquo; in the cascade. ENTRENCHED additionally appends a ⚠ glyph: &ldquo;TIGHTEN STOPS  25b ⚠&rdquo;. <strong className="text-amber-400">The dwell phase transforms the cascade from a snapshot into a narrative</strong> &mdash; you don&apos;t just see what zone price is in, you see how long it&apos;s been there.</p>
          <DwellPhasesAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the bar counter ramp up. <strong className="text-white">SPIKE phase (1-2 bars)</strong>: brief excursion, possibly noise. The phase ladder lights up at SPIKE; the cascade suffix reads &ldquo;1b&rdquo; or &ldquo;2b&rdquo;. <strong className="text-white">VISIT phase (3-8 bars)</strong>: meaningful but not yet sustained. <strong className="text-white">ESTABLISHED phase (9-20 bars)</strong>: price has been here long enough to be a real condition, not a flicker. <strong className="text-white">ENTRENCHED phase (21+ bars)</strong>: the warning level. The ⚠ glyph appears on the cascade row. ENTRENCHED DANGER specifically gets a brighter red verdict color (#FF1744) because price has been deeply overextended for an unusually long time &mdash; either a runaway trend or a stuck liquidity event.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SPIKE &mdash; 1-2 BARS, OFTEN NOISE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A SPIKE-phase visit to a non-SAFE zone is often a wick-level event &mdash; a fast move that touches CAUTION or DANGER for 1-2 bars and quickly returns. <strong className="text-white">Many SPIKE visits don&apos;t require operator action</strong>; they&apos;re the price equivalent of a sneeze. The cascade reads the zone correctly but the dwell suffix tells the operator the visit is fresh and may resolve quickly. <strong className="text-white">SPIKE is the &ldquo;wait one bar&rdquo; signal</strong>: don&apos;t over-react to the first or second bar of a new zone unless the transition itself was unusually significant (multi-zone jump, gap-driven, etc.).</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">VISIT &mdash; 3-8 BARS, MEANINGFUL BUT NOT SUSTAINED</p>
              <p className="text-sm text-gray-400 leading-relaxed">VISIT-phase means the zone change has held past the SPIKE noise floor. <strong className="text-white">Price has committed enough that the zone reading should be taken seriously</strong>. Active position management decisions live here: in CAUTION, tighten stops at the bar that hits VISIT; in DANGER, partial scale-out or hedging. <strong className="text-white">VISIT is also the typical cascade-read for trend continuations</strong>: a healthy bull trend often dwells in WATCH or CAUTION above for several bars at a time before pulling back into SAFE. The 3-8 bar window matches typical pullback-and-continuation timing on most asset/timeframe combinations.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ESTABLISHED &mdash; 9-20 BARS, REAL CONDITION</p>
              <p className="text-sm text-gray-400 leading-relaxed">ESTABLISHED-phase signals that price has been in this zone long enough to be a sustained condition, not a temporary excursion. <strong className="text-white">In CAUTION ESTABLISHED, mean reversion is increasingly likely</strong>; the longer price stays overextended, the more pressure builds for the snap-back. In WATCH ESTABLISHED, the trend is sustained but not extreme. <strong className="text-white">ESTABLISHED is also where the engine starts emphasizing time as a signal</strong> &mdash; not just &ldquo;where is price&rdquo; but &ldquo;how long has it been there&rdquo;. Operators trading mean reversion strategies pay particular attention here; the bias-toward-reversion is highest in this dwell range.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRENCHED &mdash; 21+ BARS, ⚠ GLYPH FIRES</p>
              <p className="text-sm text-gray-400 leading-relaxed">When dwell exceeds 20 bars, the phase escalates to ENTRENCHED and the cascade verdict appends a <strong className="text-white">⚠ warning glyph</strong>. ENTRENCHED conditions are unusual; in DANGER specifically, ENTRENCHED suggests something exceptional is happening &mdash; a runaway breakout, a news shock, a structural regime change. The cascade verdict color upgrades from regular magenta to brighter #FF1744 to call extra operator attention. <strong className="text-white">ENTRENCHED DANGER on any timeframe deserves explicit conscious analysis</strong>: is the trend genuinely runaway and you should ride it, or is the snap-back coming and you should fade? The engine flags the unusual condition; the operator decides.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DWELL SUFFIX FORMAT &mdash; Nb FOR VISIT/ESTABLISHED, Nb ⚠ FOR ENTRENCHED</p>
              <p className="text-sm text-gray-400 leading-relaxed">The dwell suffix appears in the cascade verdict for non-SAFE, non-transition bars. <strong className="text-white">VISIT/ESTABLISHED phases append &ldquo;Nb&rdquo; (number of bars)</strong>: e.g. &ldquo;TIGHTEN STOPS  12b&rdquo;. <strong className="text-white">ENTRENCHED additionally appends &ldquo; ⚠&rdquo;</strong>: &ldquo;TIGHTEN STOPS  25b ⚠&rdquo;. SPIKE phase doesn&apos;t add a suffix &mdash; the bar counter is too low to be useful information. <strong className="text-white">SAFE zone never shows a dwell suffix</strong>; SAFE is the resting state and dwell isn&apos;t actionable there. The Pine code: <code className="text-amber-400">rz_dwell_str = rz_show_dwell ? &quot;  &quot; + str.tostring(rz_dwell) + &quot;b&quot; + (rz_dwell_phase == &quot;ENTRENCHED&quot; ? &quot; ⚠&quot; : &quot;&quot;) : &quot;&quot;</code>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DWELL RESETS ON ZONE CHANGE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The bar counter resets to 1 every time the zone changes. <strong className="text-white">A bar that crosses from WATCH to CAUTION starts CAUTION&apos;s dwell at 1, regardless of how long price was in WATCH</strong>. The dwell is per-zone, not cumulative across zones. <strong className="text-white">This is by design</strong>: the operator cares about how long price has been in the CURRENT zone, not how long it&apos;s been outside SAFE. A 2-bar SPIKE in CAUTION followed by a 1-bar VISIT to DANGER followed by a 1-bar return to CAUTION shows three separate dwell counters &mdash; the engine isn&apos;t aggregating across the excursion. The story it tells is precise and zone-specific.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DWELL DOESN&apos;T APPEAR DURING TRANSITION BARS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When a transition event is firing (JUST HIT DANGER, JUST HIT CAUTION, etc.), the dwell suffix is suppressed in favor of the transition message. <strong className="text-white">The bar where dwell would equal 1 is exactly the bar where the transition fires</strong>; the operator gets the transition message, not the dwell counter. On the next bar, if price stays in the new zone, the dwell suffix appears as &ldquo;2b&rdquo; (SPIKE phase). <strong className="text-white">Transitions and dwell are sequential layers in the cascade</strong>: news first, narrative second. The reader gets the cleanest possible message at every bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EUR 15M EXAMPLE &mdash; ▼ WATCH 2b → STAY ALERT 2b</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real EUR/USD 15m screenshot caught the cascade at a SPIKE-phase WATCH read. <strong className="text-white">Cell 2: ▼ WATCH; cell 3: → STAY ALERT 2b</strong>. The 2b suffix tells the operator price has been in WATCH for exactly 2 bars &mdash; just past SPIKE territory, but the read is still &ldquo;wait, don&apos;t panic&rdquo;. <strong className="text-white">If the next bar prints with WATCH still active, the suffix becomes 3b (VISIT phase begins)</strong>. The dwell suffix is granular &mdash; it ticks up bar-by-bar &mdash; and the phase classification updates in real time. The operator sees both the count and the qualitative phase descriptor without doing any math themselves.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read the zone first, the dwell second. <strong className="text-white">SPIKE = wait. VISIT = act. ESTABLISHED = adjust stance. ENTRENCHED = unusual, analyze explicitly</strong>. The dwell suffix gives you context that turns a snapshot into a story. <strong className="text-white">A 2b CAUTION is barely meaningful; a 15b CAUTION is structurally significant; a 25b ⚠ ENTRENCHED CAUTION is exceptional</strong>. The same zone, three different operator postures based purely on time. The bar counter is one of CIPHER&apos;s most underappreciated features &mdash; once you start reading it, you can&apos;t go back to dwell-blind trading.</p>
          </div>
        </motion.div>
      </section>

      {/* === S10 — The Command Center Risk Row === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">10 &mdash; The Command Center Risk Row</p>
          <h2 className="text-2xl font-extrabold mb-4">Eight Tiers. Transitions Outrank States.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Risk row in the Command Center is one of the most-glanced rows in CIPHER&apos;s entire reporting architecture. <strong className="text-white">It compresses every Risk Envelope reading into three cells</strong>: Cell 0 is the static label (&ldquo;Risk&rdquo;), Cell 1 displays the directional zone (e.g. ▲ CAUTION or ▼ DANGER), and Cell 2 broadcasts the verdict from an 8-tier priority cascade. The cascade is the heart of the row &mdash; it evaluates four transition events first, then four zone states. <strong className="text-amber-400">Any active transition outranks any state-based verdict</strong>; the engine prioritizes news over background by design. The first matching condition wins; lower verdicts never get evaluated. The architecture mirrors the Sweep cascade from L11.19 but with eight tiers instead of six and with an entirely different priority structure.</p>
          <RiskCascadeAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch five scenarios cycle. <strong className="text-white">Scenario 1</strong>: <code className="text-amber-400">rz_entered_danger</code> fires &mdash; cascade locks at position 1 (JUST HIT DANGER), all lower tiers suppressed. <strong className="text-white">Scenario 2</strong>: <code className="text-amber-400">rz_entered_caution</code> fires &mdash; position 2. <strong className="text-white">Scenario 3</strong>: <code className="text-amber-400">rz_returned_safe</code> &mdash; position 4 (BACK TO SAFE). <strong className="text-white">Scenario 4</strong>: no transitions, but zone is DANGER &mdash; cascade falls past the four transition tiers and matches at position 5 (REDUCE SIZE) with dwell suffix. <strong className="text-white">Scenario 5</strong>: zone is SAFE, no transitions &mdash; cascade falls all the way to position 8 (NORMAL SIZE). <strong className="text-amber-400">The first-match-wins discipline is identical to L11.19&apos;s sweep cascade</strong>; only the priority structure differs.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 1 &mdash; DIRECTIONAL ZONE LABEL</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 1 displays the directional indicator + zone name: <strong className="text-white">▲ SAFE, ▲ WATCH, ▼ CAUTION, ▼ DANGER, etc</strong>. The arrow comes from <code className="text-amber-400">rz_upper</code> which is true when <code className="text-amber-400">close &gt; ribbon_anchor_ema</code> &mdash; price is above fair value. The zone name comes from the four-zone classification covered in S06. <strong className="text-white">Color-coded for instant scan</strong>: SAFE = teal, WATCH/CAUTION = amber, DANGER = magenta. The cell tells the operator both where price is (which zone) AND which direction the overextension lies (above or below fair value). Two atoms in one short string.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CELL 2 &mdash; THE 8-TIER CASCADE VERDICT</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 2 is the action-tier broadcast. <strong className="text-white">Top 4 tiers are transition events: JUST HIT DANGER (magenta), JUST HIT CAUTION (amber), LEAVING DANGER (teal), BACK TO SAFE (teal)</strong>. <strong className="text-white">Bottom 4 tiers are zone states with dwell suffix: REDUCE SIZE (magenta) + Nb, TIGHTEN STOPS (amber) + Nb, STAY ALERT (amber) + Nb, NORMAL SIZE (teal)</strong>. Every cell value has a precomputed operator action attached &mdash; the operator never has to decide what to do, only when to do it. The engine maps state to action; the operator just executes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRANSITIONS OUTRANK STATES &mdash; WHY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Transition events are 1-bar news; zone states are sustained backgrounds. <strong className="text-white">News beats background in priority every time</strong>. The reasoning is operator-attention-budget: in a single bar where a transition fires, the operator should see the news (JUST HIT DANGER), not the redundant state description (REDUCE SIZE) which they already knew or will see on subsequent bars. Once the transition bar passes, the cascade reverts to the state-based verdict for the duration of the dwell. <strong className="text-white">The two layers stack temporally</strong>: transitions claim the news bar; states claim the bars after. No information is lost; the priority just optimizes for clarity at every bar.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DWELL SUFFIX FORMAT</p>
              <p className="text-sm text-gray-400 leading-relaxed">For the bottom 4 state tiers, the dwell suffix appends to the verdict. <strong className="text-white">VISIT/ESTABLISHED phases append the bar count: &ldquo;TIGHTEN STOPS  12b&rdquo;</strong>. <strong className="text-white">ENTRENCHED additionally appends the warning glyph: &ldquo;TIGHTEN STOPS  25b ⚠&rdquo;</strong>. SAFE never gets a dwell suffix &mdash; SAFE is the resting state and dwell isn&apos;t actionable. SPIKE phase (1-2 bars) doesn&apos;t suffix either; the bar count is too low to be informative. <strong className="text-white">The suffix turns a snapshot into a story</strong>, exactly as covered in S09. Combined with the cascade verdict, the operator sees: where price is + how long it&apos;s been there + what to do about it. Three atoms, one cell.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">COLOR LOGIC &mdash; ZONE COLOR vs VERDICT COLOR</p>
              <p className="text-sm text-gray-400 leading-relaxed">Cell 1 uses <code className="text-amber-400">risk_clr</code>: SAFE=teal, WATCH/CAUTION=amber, DANGER=magenta. <strong className="text-white">Cell 2 uses risk_guide_clr which can differ from cell 1</strong>: when a transition is active, cell 2 uses the transition color (teal for de-escalation, magenta/amber for escalation) regardless of the underlying zone color. Additionally, ENTRENCHED DANGER bumps cell 2 to a brighter red (#FF1744). <strong className="text-white">The color logic encodes urgency: the brighter the color, the more demanding the situation</strong>. Operators learn to scan the row for &ldquo;hottest visible color&rdquo; as a quick triage step before reading the actual text.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE EUR 15M EXAMPLE &mdash; ▼ WATCH 2b → STAY ALERT 2b</p>
              <p className="text-sm text-gray-400 leading-relaxed">A real EUR/USD 15m screenshot shows a typical state-based read. <strong className="text-white">Cell 0: Risk. Cell 1: ▼ WATCH. Cell 2: → STAY ALERT  2b</strong>. Decoded: the engine reports price is below fair value (▼) in the WATCH zone, has been there for 2 bars (just past SPIKE phase), and the operator action is STAY ALERT. The cascade matched at tier 7 (the lowest non-SAFE state tier). No transitions are firing, so the cascade fell through tiers 1-4. <strong className="text-white">The complete operator instruction in three cells</strong>: stay engaged, monitor, but don&apos;t panic &mdash; this is a mild stretch, not a crisis.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE BTC 1H EXAMPLE &mdash; ▼ CAUTION → JUST HIT CAUTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real BTC/USD 1h screenshot at the moment of escalation. <strong className="text-white">Cell 1: ▼ CAUTION. Cell 2: → JUST HIT CAUTION</strong> in amber. The cascade matched at tier 2 (transition event). <strong className="text-white">Notice cell 2 reads the transition message, not TIGHTEN STOPS</strong> &mdash; even though the zone is CAUTION, the active transition takes priority. On the next bar (assuming price stays in CAUTION), cell 2 will revert to TIGHTEN STOPS  1b (SPIKE phase begins). The screenshot captures the precise news moment that the priority structure is designed to highlight; the next bar shifts to story-mode.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE XAU 15M EXAMPLE &mdash; ▼ SAFE → BACK TO SAFE</p>
              <p className="text-sm text-gray-400 leading-relaxed">Real XAU/USD 15m screenshot showing a de-escalation event. <strong className="text-white">Cell 1: ▼ SAFE. Cell 2: → BACK TO SAFE</strong> in teal. The cascade matched at tier 4 (de-escalation transition). The chart history shows an amber ✕ marker at the prior CAUTION-entry bar; price has now returned to SAFE. <strong className="text-white">Cell 1 confirms the current zone (SAFE), cell 2 confirms how it got there (just returned from a higher zone)</strong>. Without the transition tier, cell 2 would just read NORMAL SIZE which would be technically accurate but lose the narrative context. The transition message preserves the story.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Three cells, eight tiers, complete risk awareness. <strong className="text-white">Read cell 1 first: where is price and which side of fair value? Then cell 2: what action does the engine prescribe?</strong> When cell 2 starts with &ldquo;JUST HIT&rdquo; or &ldquo;LEAVING&rdquo; or &ldquo;BACK TO&rdquo;, you&apos;re seeing news &mdash; act on it now. When cell 2 starts with &ldquo;NORMAL/STAY/TIGHTEN/REDUCE&rdquo; with a dwell suffix, you&apos;re seeing the sustained state &mdash; maintain the prescribed posture. <strong className="text-white">The Risk row is the most complete summary of the Risk Envelope&apos;s entire output</strong>; mastering it is mastering the whole module.</p>
          </div>
        </motion.div>
      </section>

      {/* === S11 — Adaptive Intensity Mode === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">11 &mdash; Adaptive Intensity Mode</p>
          <h2 className="text-2xl font-extrabold mb-4">The Cloud Breathes. The Glow Brightens With Score.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The Adaptive Intensity toggle (default OFF) adds two dynamic visual effects on top of the static band fills: <strong className="text-white">Progressive Danger Glow and Band Breathing</strong>. With it ON, the cloud becomes a living thing &mdash; it visibly changes urgency as conditions evolve. With it OFF, the cloud uses a static transparency based purely on the Intensity setting (Subtle/Normal/Bold). Same chart, same data, same Intensity &mdash; the difference is whether the engine adds dynamic responsiveness to the visual layer. <strong className="text-amber-400">Adaptive ON is for active monitoring; Adaptive OFF is for clean charts</strong>. Both serve different operator workflows. The animation below shows the side-by-side: 5 seconds with Adaptive ON, 5 seconds with it OFF, looping.</p>
          <AdaptiveIntensityAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the toggle flip every five seconds. <strong className="text-white">When Adaptive: ON</strong> &mdash; notice how the danger zone fills brighten as the mr_score climbs above 60 (-8 transparency) and brighten further when score exceeds 80 (-15 transparency). The bands also &ldquo;breathe&rdquo; &mdash; the fills lighten when ATR is expanding and fade when contracting. <strong className="text-white">When Adaptive: OFF</strong> &mdash; same chart, same score, same bands, but the fill stays uniform. The score readout at the bottom-left ticks identically in both phases; only the visual response changes. <strong className="text-amber-400">Two screenshots from the live chart show this exact A/B contrast</strong> &mdash; Adaptive ON in the first (visibly brighter red on the right side as price extends), Adaptive OFF in the second (uniform red throughout). Same EUR 15m chart, same setup, two visual modes.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">PROGRESSIVE DANGER GLOW &mdash; SCORE-DRIVEN BRIGHTENING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The first Adaptive Intensity effect. The mr_score directly drives the danger zone&apos;s transparency. <strong className="text-white">When score &gt; 60, transparency drops by 8 points. When score &gt; 80, transparency drops by 15 points</strong>. The Pine code: <code className="text-amber-400">danger_depth_adj = mr_score &gt; 80 ? -15 : mr_score &gt; 60 ? -8 : 0</code>. The deeper price pushes into overextension territory, the more vivid the colored zones become. <strong className="text-white">Visually, the cloud screams louder as the score climbs</strong>. Operators get an unmissable visual escalation tied directly to the underlying overextension intensity, without needing to read the Risk row or check the score number.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BAND BREATHING &mdash; ATR EXPANSION/CONTRACTION RESPONSE</p>
              <p className="text-sm text-gray-400 leading-relaxed">The second Adaptive Intensity effect. The engine tracks <code className="text-amber-400">vol_compression</code> bar-over-bar deltas, smooths them with a 3-bar EMA, and uses the smoothed delta to add or subtract transparency points. <strong className="text-white">Expanding volatility (delta &gt; 0.01) brightens fills by 5 points; mildly expanding (&gt; 0.003) by 2 points</strong>. <strong className="text-white">Contracting volatility fades fills by the same amount in reverse</strong>. Net effect: the bands brighten when the market is accelerating and fade when consolidating. The visual matches the kinetic energy of the chart in real time. <strong className="text-white">Combined with progressive glow, the cloud has two independent breathing channels</strong> &mdash; one driven by extension, one by acceleration.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EFFECTS STACK ADDITIVELY</p>
              <p className="text-sm text-gray-400 leading-relaxed">Progressive glow and breathing combine via simple addition into the final transparency calculation: <code className="text-amber-400">danger_transp = max(30, min(85, 60 + io_risk + danger_depth_adj + rr_breath_offset))</code>. <strong className="text-white">All four inputs add into the final transparency value</strong>: base (60), Intensity offset (io_risk based on Subtle/Normal/Bold), danger depth adjustment (-15/-8/0), and breath offset (-5/-2/0/+2/+5). The result is clamped between 30 (very vivid) and 85 (very faded). <strong className="text-white">Both effects can fire simultaneously</strong> &mdash; deep danger AND expanding ATR produces the brightest possible state. Both can also cancel: deep danger but contracting ATR moderates the visual.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CAUTION ZONE BREATHES BUT DOESN&apos;T GLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">A subtle but important detail. <strong className="text-white">The progressive danger glow only applies to the DANGER zone fill (between mid and outer bands)</strong>. The CAUTION zone (between inner and mid) breathes with ATR but doesn&apos;t respond to mr_score. The reasoning: the score escalation from 60 to 80 maps to the CAUTION-to-DANGER zone boundary, so visually amplifying the deeper end of the curve makes the operator&apos;s eye gravitate toward the most extreme readings. <strong className="text-white">CAUTION&apos;s response is static (with breathing), DANGER&apos;s response is dynamic (with glow + breathing)</strong>. This is intentional asymmetry, not implementation oversight.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">DEFAULT IS OFF &mdash; OPT-IN BY DESIGN</p>
              <p className="text-sm text-gray-400 leading-relaxed">Adaptive Intensity is OFF by default in CIPHER&apos;s shipped configuration. <strong className="text-white">The reasoning</strong>: dynamic visual elements add cognitive load. Some operators prefer a static, predictable cloud they can scan once per bar; others prefer a kinetic visual that pulls their attention proportional to underlying conditions. The opt-in default respects the more conservative preference. <strong className="text-white">Operators trying it for the first time should leave the Risk Envelope unchanged otherwise and just toggle Adaptive Intensity</strong> to see the difference. The two A/B screenshots in this lesson are exactly that experiment captured.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECOMMENDED: ON FOR ACTIVE MONITORING</p>
              <p className="text-sm text-gray-400 leading-relaxed">If you&apos;re actively watching a trade and want maximum visual feedback as conditions evolve, turn Adaptive Intensity ON. <strong className="text-white">The progressive glow gives you a unmistakable visual when the trade enters DANGER territory</strong>; you&apos;ll see the cloud brighten before you consciously notice the price extension. The band breathing tells you whether momentum is building or fading without checking volatility indicators. <strong className="text-white">Operators monitoring multiple charts simultaneously benefit most</strong>; the kinetic visual on whichever chart is escalating naturally pulls attention away from the calmer ones.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">RECOMMENDED: OFF FOR CHART REVIEW &amp; SCREENSHOTS</p>
              <p className="text-sm text-gray-400 leading-relaxed">For static analysis, journaling, sharing screenshots, or any workflow where chart-clutter matters more than live responsiveness, leave Adaptive Intensity OFF. <strong className="text-white">The static cloud is more readable in printed materials and historical reviews</strong>; the dynamic effects don&apos;t translate well to non-live media. Trading documentation, lesson screenshots (like the ones in this very lesson), backtest reviews, and performance analysis all benefit from the cleaner static version. <strong className="text-white">The choice isn&apos;t Adaptive=better-or-worse; it&apos;s Adaptive=different-purposes</strong>. Pick per your current workflow.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DOES NOT AFFECT THE COMMAND CENTER OR SCORE</p>
              <p className="text-sm text-gray-400 leading-relaxed">A critical clarification. <strong className="text-white">Adaptive Intensity is purely a visual layer effect</strong>; it does not change the Mean Reversion Score, the zone classifications, the transition events, the dwell phases, or any cascade verdicts. Whether Adaptive is ON or OFF, the Risk row reads identically; the score updates identically; transitions fire identically. <strong className="text-white">The engine&apos;s output is invariant to this toggle</strong>. What changes is only the kinetic responsiveness of the band fills on the chart. Operators who hide the Risk Envelope entirely (i_show_envelope = false) still get every cascade verdict and signal context tag exactly as if Adaptive was ON or OFF; the visual layer is decoupled from the intelligence layer.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Adaptive Intensity is a visual feedback amplifier. <strong className="text-white">Turn it ON if you want the chart to scream proportional to actual risk</strong>; turn it OFF if you want a quiet, predictable visual you can scan once per bar. Neither setting affects the engine&apos;s reading or the operator&apos;s cascade-driven actions. <strong className="text-white">Try both, pick the one that fits your monitoring style</strong>. Most operators end up running Adaptive: ON during live trading sessions and OFF for screenshot/review workflows. The toggle is one tap; switch as needed.</p>
          </div>
        </motion.div>
      </section>

      {/* === S12 — Coil Glow Override === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">12 &mdash; Coil Glow Override</p>
          <h2 className="text-2xl font-extrabold mb-4">Spring Coiling. Outer Edges Pulse Amber.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">A specialized override that fires when volatility compresses below 60% of recent baseline. <strong className="text-white">When ATR(20) drops below 60% of ATR(50), the engine flips a flag called <code className="text-amber-400">vol_coiled</code></strong>. While that flag is active, the outer band edges &mdash; normally invisible (rendered with transparent black) &mdash; switch to a pulsing amber glow. The visual message: the spring is coiling, breakout is imminent. <strong className="text-amber-400">The cloud&apos;s outer edges literally light up to alert the operator</strong>. The override is rare; on most bars across most charts, vol_compression sits above 0.6. When it does fire, it&apos;s a high-conviction signal that the market is preparing for a directional move, not just resting.</p>
          <CoilGlowAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">Watch the four phases. <strong className="text-white">Phase 1 (0-30%)</strong>: normal volatility, vol_compression = 1.00, outer edges invisible, cloud unchanged. <strong className="text-white">Phase 2 (30-60%)</strong>: ATR contracting, vol_compression dropping toward 0.50, the bands physically narrowing as ATR shrinks &mdash; and once the ratio crosses below 0.60, the <strong className="text-amber-400">amber glow ignites on the outer edges</strong> with a visible pulse. <strong className="text-white">Phase 3 (60-85%)</strong>: explosive expansion, vol_compression climbs back above 1.0, glow extinguishes, price launches out of the coil. <strong className="text-white">Phase 4 (85-100%)</strong>: post-breakout normal conditions resume. The whole cycle is the lifecycle of a typical compression-then-breakout pattern as captured by the engine.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">THE COMPRESSION FORMULA &mdash; vol_compression</p>
              <p className="text-sm text-gray-400 leading-relaxed">The metric is computed as <code className="text-amber-400">vol_compression = atr_fast_check / atr_slow_check</code>, where atr_fast_check is the standard ATR (typically ATR(20)) and atr_slow_check is a longer-period ATR (typically ATR(50)). <strong className="text-white">At ratio = 1.0, current volatility equals recent baseline</strong>. <strong className="text-white">At ratio &lt; 0.6, current volatility has dropped to 60% of recent baseline</strong> &mdash; meaningful compression. The Pine flag fires: <code className="text-amber-400">vol_coiled = vol_compression &lt; 0.6</code>. Below 0.5 is rare and indicates extreme compression. The 0.6 threshold is calibrated empirically &mdash; tighter would miss real coiling events, looser would false-fire on normal consolidation.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE OVERRIDE &mdash; AMBER, PULSING, OUTER EDGES ONLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">vol_coiled AND show_envelope</code> are both true, the engine overrides the outer edge color from invisible (default rgb 0,0,0 at 100 transparency) to <strong className="text-white">amber at 25-65 transparency depending on Intensity setting</strong>. The amber color is the brand-locked transition signal &mdash; same hue used for WATCH/CAUTION zones. <strong className="text-white">The pulse comes from the natural fact that vol_compression is computed every bar</strong>; as ATR breathes during the compression phase, the ratio fluctuates, and the rendered alpha shifts subtly with each bar update. The visual pulse is emergent, not animated explicitly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DANGER ZONE COLOR ALSO SHIFTS TO AMBER</p>
              <p className="text-sm text-gray-400 leading-relaxed">During coil, the danger zone fill itself swaps from teal/magenta (trend-direction colors) to amber. <strong className="text-white">The Pine: <code className="text-amber-400">danger_color = vol_coiled and show_envelope ? color.new(AMBER, coil_glow_transp) : ribbon_bullish ? ... : ribbon_bearish ? ...</code></strong>. The cloud temporarily abandons its directional color identity to broadcast the compression state. <strong className="text-white">Operators see this and instantly know the directional bias is paused</strong> &mdash; the amber takes over until breakout fires and the original trend color resumes. The visual disruption is intentional; coil is a structural condition that supersedes the direction reading temporarily.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WHY 0.6 THRESHOLD &mdash; EMPIRICAL CALIBRATION</p>
              <p className="text-sm text-gray-400 leading-relaxed">The 0.6 threshold maps to compression that is statistically meaningful but not extreme. <strong className="text-white">Across many backtests, vol_compression sits between 0.7 and 1.3 about 80% of the time</strong>; below 0.6 puts the market in the bottom decile of recent volatility. <strong className="text-white">Coil events at this threshold lead to directional breakouts with high frequency</strong> &mdash; the pattern is well-documented in technical analysis literature (Bollinger Squeeze, NR7, etc.). 0.6 captures these events without flooding the operator with false coil signals during routine consolidation. Tighter (0.5) would miss many real coils; looser (0.7) would false-fire on normal pre-trend lulls.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">COIL GLOW DOESN&apos;T REPLACE THE COMMAND CENTER COIL ROW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The Risk Envelope&apos;s coil glow is a visual overlay specific to this module. <strong className="text-white">CIPHER also has a dedicated Cipher Coil row in the Command Center</strong> (covered in earlier lessons L11.10/L11.13) that broadcasts coil state explicitly with multi-tier verdicts (NORMAL → COMPRESSING → COILED → EXPLOSIVE). The two layers complement each other: the Coil row tells you the discrete state in one cell, the Risk Envelope&apos;s amber glow shows you the visual representation on the chart at the bands themselves. <strong className="text-white">When the Coil row reads COILED, the Risk Envelope outer edges should be glowing amber</strong>; the two readings should always agree. If they don&apos;t (rare), it&apos;s usually a transient mid-bar state that resolves on bar close.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COIL DOESN&apos;T SUPPRESS ZONE LOGIC</p>
              <p className="text-sm text-gray-400 leading-relaxed">Important clarification. <strong className="text-white">During coil, the four zones (SAFE/WATCH/CAUTION/DANGER) still classify normally based on price&apos;s position relative to the bands</strong>. The cascade verdicts still fire correctly. The Mean Reversion Score updates as usual. <strong className="text-white">Coil glow is purely a visual additive layer</strong>; the underlying Risk Envelope intelligence continues unchanged. The amber glow tells the operator about volatility regime; the cascade tells them about overextension. Two parallel reads, neither overriding the other. An operator can be in coil AND in DANGER simultaneously &mdash; the visual reflects both.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">BAND WIDTH NARROWS DURING COIL &mdash; EXPECT SOON-TO-EXPAND</p>
              <p className="text-sm text-gray-400 leading-relaxed">Because the bands are computed as <code className="text-amber-400">anchor &plusmn; ATR &times; multiplier</code>, when ATR contracts during coil, the bands physically narrow. <strong className="text-white">Visually, the cloud gets thin and tight</strong>. This is the classic squeeze pattern. <strong className="text-white">When the breakout fires and ATR expands, the bands snap wider</strong> within a few bars; the cloud visibly explodes outward. Operators watching live see the entire compression-and-release pattern unfold in the cloud&apos;s width. The amber glow during the coil phase is the engine&apos;s confirmation that this isn&apos;t just a quiet moment &mdash; it&apos;s a structurally compressed state that statistically resolves with directional thrust.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING THE COIL &mdash; PREPARE BOTH DIRECTIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Coil tells you a breakout is likely, but not which direction. <strong className="text-white">Operators preparing for coil resolution should not commit to a directional bias until the breakout actually fires</strong>. Have both buy-stop and sell-stop orders staged at logical breakout levels (above/below the recent range high/low). Size conservatively until direction confirms. <strong className="text-white">After the breakout fires, the Risk Envelope&apos;s zone classification quickly catches up</strong> &mdash; the explosive bar will likely push price into CAUTION or DANGER on the breakout side, generating the standard cascade verdicts that guide management thereafter.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Amber outer edges = the spring is coiling. <strong className="text-white">Stage your breakout orders, size conservatively, prepare for both directions</strong>. Don&apos;t enter pre-breakout based on direction guesses; wait for the explosive bar to fire and let the cascade catch up. <strong className="text-white">When the glow extinguishes, the breakout has fired or the coil has dissipated</strong>; either way, the special state is over and the normal Risk Envelope reading resumes. The coil glow is one of CIPHER&apos;s most distinctive visuals &mdash; rare, kinetic, and high-conviction when it appears.</p>
          </div>
        </motion.div>
      </section>

      {/* === S13 — The Trade Plan: Sizing By Zone === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">13 &mdash; The Trade Plan: Sizing By Zone</p>
          <h2 className="text-2xl font-extrabold mb-4">SAFE 1R. WATCH 1R. CAUTION 0.5R. DANGER 0.25R.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The four zones map directly to four position-size prescriptions. <strong className="text-white">SAFE = 1R full size, trade unconstrained</strong>. <strong className="text-white">WATCH = 1R, but stay alert &mdash; new entries OK, existing positions monitored</strong>. <strong className="text-white">CAUTION = 0.5R half size, tighten stops, partial scale-out on existing</strong>. <strong className="text-white">DANGER = 0.25R quarter size, expect mean reversion, take profits, no new same-direction entries</strong>. <strong className="text-white">ENTRENCHED DANGER = SKIP entirely</strong> &mdash; the rare condition warrants explicit conscious analysis rather than rule-following. The sizing scale is inverse to overextension &mdash; the more extreme the zone, the smaller the size. <strong className="text-amber-400">This is the operator&apos;s most important rule for the Risk Envelope</strong>: read the zone, size accordingly, never override. Discipline beats analysis.</p>
          <RiskSizingPlanAnim />
          <p className="text-gray-400 leading-relaxed mt-4 mb-6">The five-row table reveals sequentially. <strong className="text-white">Each row maps zone → verdict → R-multiplier → operator action</strong>. Reading top-down, the size shrinks from 1R to SKIP as the zone escalates from SAFE to ENTRENCHED DANGER. Color-coded by zone: teal for SAFE, amber for WATCH/CAUTION, magenta for DANGER, brighter red (#FF1744) for ENTRENCHED DANGER. <strong className="text-amber-400">No part of the table is optional</strong>; the discipline only works if applied consistently across all setups. Operators who size 1R in DANGER (because the trade &ldquo;looks good&rdquo;) systematically underperform operators who follow the table without exception, even if the SAFE-zone trades look identical between them.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SAFE = 1R &mdash; UNCONSTRAINED</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the cascade reads NORMAL SIZE, the operator trades unconstrained at their normal risk-per-trade. <strong className="text-white">All other CIPHER signals (signals, structure, sweeps, FVGs) drive the trade decision; the Risk Envelope is just confirming &ldquo;no overextension concerns&rdquo;</strong>. SAFE zone trades are typically 50-65% of all trades on most charts. The discipline here is &ldquo;take normal size&rdquo;, not &ldquo;take MORE size&rdquo; &mdash; SAFE zone is the baseline, not a green light to oversize. Operators who push 2R or 3R in SAFE zone violate the same discipline that fails them in DANGER zone in reverse: ignoring the engine&apos;s signal level.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">WATCH = 1R &mdash; STAY ENGAGED</p>
              <p className="text-sm text-gray-400 leading-relaxed">WATCH zone is &ldquo;heads up but not red alert&rdquo;. <strong className="text-white">Size stays at 1R</strong>; new entries are still permitted. The cascade verdict (STAY ALERT) tells the operator to monitor closely &mdash; check the dwell counter, watch for transitions to CAUTION, but don&apos;t change posture yet. <strong className="text-white">Many trend continuations spend significant time in WATCH</strong>; treating WATCH as a danger zone would mean missing most trend trades. The 1R size at WATCH is intentional: this is normal-pricing behavior in a slightly stretched market, not a defensive posture. The defensive shift happens at CAUTION, not before.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">CAUTION = 0.5R &mdash; ACTIVE RISK MANAGEMENT</p>
              <p className="text-sm text-gray-400 leading-relaxed">CAUTION zone is where active risk management starts. <strong className="text-white">Size halves to 0.5R for new entries; existing positions get tightened stops and partial scale-out (typically 50% off)</strong>. The rationale: at CAUTION, mean reversion is statistically more likely than continuation. Reducing size on new entries preserves capital for the snap-back trade if it materializes; partial scale-out on existing positions locks gains before reversal. <strong className="text-white">No new same-direction entries</strong> &mdash; if you&apos;re long and price is in upper-CAUTION, don&apos;t add. The half-size + scale-out + no-add discipline is the core risk management posture for CAUTION zone, applied identically across all instruments and timeframes.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">DANGER = 0.25R &mdash; DEFENSIVE POSTURE</p>
              <p className="text-sm text-gray-400 leading-relaxed">DANGER zone is the engine&apos;s &ldquo;reduce exposure&rdquo; flag. <strong className="text-white">Size drops to 0.25R quarter-position for new entries; existing same-direction positions take profits aggressively or close entirely</strong>. The rare counter-trend reversal trade (entering OPPOSITE the prevailing direction at DANGER extreme) can size 0.5R if the operator has high conviction and clean structure for the entry. <strong className="text-white">DANGER is not a panic signal</strong> &mdash; it&apos;s a defensive-positioning signal. The trade can still work; the operator just operates with reduced exposure to the snap-back risk that statistically follows DANGER readings. About 70-80% of DANGER zone visits resolve with mean reversion within 5-15 bars.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ENTRENCHED DANGER = SKIP &mdash; ANALYZE EXPLICITLY</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the cascade shows ENTRENCHED + ⚠ glyph in DANGER zone, the rule-based table says SKIP. <strong className="text-white">The condition is unusual enough that any pre-set rule is likely wrong</strong>. Either the trend is genuinely runaway (and you should have been long the whole time, not entering now) OR the snap-back is overdue and explosive (and you should fade aggressively but tactically). Either way, no automatic rule applies. <strong className="text-white">Operators encountering ENTRENCHED DANGER should pause, study the chart explicitly, check higher-timeframe context, and decide consciously</strong> whether to skip, ride trend, or fade. This is the one cell in the table where discipline yields to discretion.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EXISTING POSITIONS &mdash; THE SCALE-OUT LADDER</p>
              <p className="text-sm text-gray-400 leading-relaxed">For positions already open when zones escalate, the scale-out ladder is: <strong className="text-white">SAFE → no change. WATCH → no change. CAUTION → scale 50% off, tighten stops to break-even-plus or recent swing. DANGER → close remaining or scale to 25% with very tight stops</strong>. The ladder operates regardless of P&L; whether you&apos;re in profit or loss, the engine&apos;s zone reading drives the management decision. <strong className="text-white">Discipline matters more than P&amp;L psychology here</strong> &mdash; many operators delay scale-out at CAUTION because the trade is profitable and they&apos;re hoping for more; the systematic approach takes the partial regardless and lets the second half ride with reduced risk.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">NEW ENTRIES &mdash; DIRECTION-AWARE BLOCKING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The size table applies to new entries, but with one critical refinement: <strong className="text-white">no new entries in the SAME direction as the overextension</strong>. If price is in upper-CAUTION (▲ CAUTION), new long entries are blocked entirely; only short / mean-reversion entries are permitted at half size. If price is in lower-DANGER (▼ DANGER), new short entries are blocked; only long / counter-trend entries at quarter size. <strong className="text-white">The sizing prescription pairs with directional blocking</strong>; both must be respected. An operator who &ldquo;just wants to add to the trend&rdquo; at upper-DANGER violates both rules simultaneously and is statistically the most punished position type in CIPHER backtests.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE TABLE IS A FLOOR, NOT A CEILING</p>
              <p className="text-sm text-gray-400 leading-relaxed">The R-multipliers in the table are the engine&apos;s recommended sizing for each zone. <strong className="text-white">Operators may always size SMALLER if conviction is low or chart context is messy</strong>. SAFE zone with weak signal alignment can be 0.5R or skipped entirely. CAUTION zone with extra-clean structure (FVG confluence, sweep confluence, etc.) can stay at 0.5R. <strong className="text-white">The table is the engine&apos;s ceiling, not its mandate</strong>. The only direction that&apos;s never permitted is upsizing &mdash; never take 1.5R in CAUTION because &ldquo;the trade looks great&rdquo;. The table answers &ldquo;how much can I size?&rdquo;, not &ldquo;how much must I size?&rdquo;.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Read the zone, size by the table, no exceptions. <strong className="text-white">SAFE = 1R full. WATCH = 1R alert. CAUTION = 0.5R defensive. DANGER = 0.25R reduce. ENTRENCHED = skip + analyze</strong>. Existing positions follow the scale-out ladder regardless of P&amp;L. New entries respect both size AND direction blocking. <strong className="text-white">The engine has done the analysis; the operator&apos;s job is consistent execution</strong>. The single biggest source of underperformance among CIPHER users is over-sizing in CAUTION/DANGER on trades that &ldquo;look good&rdquo;. The table exists to override that bias.</p>
          </div>
        </motion.div>
      </section>

      {/* === S14 — Trading Transitions vs States === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">14 &mdash; Trading Transitions vs States</p>
          <h2 className="text-2xl font-extrabold mb-4">News Bars vs Background Bars. Different Plays.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The cascade gives the operator two kinds of signals: <strong className="text-white">transition events (news, 1-bar duration) and zone states (background, sustained)</strong>. Both are tradable, but they call for different plays. Transitions are entry triggers &mdash; the bar where a transition fires is the bar where action makes sense. States are management contexts &mdash; the bars where the dwell suffix is rising are where you&apos;re managing existing positions or staging for the next transition. <strong className="text-amber-400">Conflating the two leads to confused execution</strong>: trying to enter on every CAUTION bar (treating state as transition) burns through capital; ignoring the entry timing at JUST HIT DANGER (treating transition as state) misses the highest-conviction setups. This section walks through the playbook for each layer.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING JUST HIT DANGER &mdash; THE COUNTER-TREND ENTRY</p>
              <p className="text-sm text-gray-400 leading-relaxed">JUST HIT DANGER is the highest-conviction counter-trend entry in the entire CIPHER framework. <strong className="text-white">Price has just crossed into DANGER &mdash; statistically, mean reversion has 70-80% probability over the next 5-15 bars</strong>. The operator&apos;s play: enter OPPOSITE the overextension direction at the close of the JUST HIT DANGER bar. ▲ JUST HIT DANGER = enter short; ▼ JUST HIT DANGER = enter long. <strong className="text-white">Size 0.5R (counter-trend at extreme), stop just beyond the outer band with ATR buffer, target the inner band or fair value line</strong>. The trade is short-duration; most fills resolve within 10 bars. <strong className="text-white">The rule discipline is critical</strong>: do NOT enter pre-DANGER (FOMO-style); wait for the actual transition to fire.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING JUST HIT CAUTION &mdash; THE TIGHTEN-STOPS BAR</p>
              <p className="text-sm text-gray-400 leading-relaxed">JUST HIT CAUTION is rarely a fresh entry; it&apos;s an existing-position management trigger. <strong className="text-white">When this transition fires, the operator should immediately tighten stops on any same-direction positions and scale 50% off</strong>. New entries against the overextension at JUST HIT CAUTION (counter-trend at moderate stretch) are permitted at 0.5R, but the trade quality is lower than JUST HIT DANGER counter-trend setups. <strong className="text-white">The bar&apos;s primary function is risk management for trades already in motion</strong>, not new entry sourcing. The transition tells you &ldquo;the situation just changed; adjust your existing exposure&rdquo;.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING LEAVING DANGER &mdash; THE COUNTER-TREND EXIT</p>
              <p className="text-sm text-gray-400 leading-relaxed">LEAVING DANGER is the exit trigger for counter-trend reversal trades opened on JUST HIT DANGER. <strong className="text-white">Price was in DANGER, has now de-escalated to CAUTION &mdash; the reversal is in motion, mean reversion is happening</strong>. Operators in counter-trend positions should scale out 50% on this transition; the remaining position rides toward fair value (BACK TO SAFE) with trailing stop. <strong className="text-white">Trend-direction traders also see this as a re-entry signal</strong>: if the original trend was up and DANGER zone fired ▲ during a brief overextension, LEAVING DANGER suggests the pullback is starting and a re-entry on the trend side becomes attractive once price reaches WATCH or SAFE zones again.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING BACK TO SAFE &mdash; THE ARC COMPLETION</p>
              <p className="text-sm text-gray-400 leading-relaxed">BACK TO SAFE means the mean-reversion arc has completed; price has returned to fair value territory. <strong className="text-white">Counter-trend positions exit fully at this transition</strong> (typical T2 target). Trend-direction operators see BACK TO SAFE as a setup completion bar &mdash; the chart has reset, the next trend-continuation entry can be considered. <strong className="text-white">No new counter-trend trades are appropriate at BACK TO SAFE</strong>; the engine is saying &ldquo;the trade you would have taken is now done&rdquo;. New WATCH/CAUTION zone entries on the trend-side become relevant if the original trend resumes.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">TRADING SUSTAINED CAUTION/DANGER STATES &mdash; DWELL-AWARE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the cascade reads TIGHTEN STOPS or REDUCE SIZE with a non-zero dwell suffix, you&apos;re in state-mode, not transition-mode. <strong className="text-white">No fresh entry trigger fires at every bar in CAUTION; the entry was at JUST HIT CAUTION and the management is ongoing</strong>. The dwell suffix tells the operator how committed price is to the zone &mdash; SPIKE means it might resolve quickly, ESTABLISHED means it&apos;s holding, ENTRENCHED means it&apos;s exceptional. <strong className="text-white">In SPIKE/VISIT phases, hold the existing position with tightened stops; in ESTABLISHED, consider scaling out the rest; in ENTRENCHED, treat as edge case (S15)</strong>. The state-mode is mostly waiting and watching, not acting.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASE &mdash; TRANSITION DURING STRONG TREND</p>
              <p className="text-sm text-gray-400 leading-relaxed">In strong trends, JUST HIT DANGER on the trend side is more ambiguous than on the counter side. <strong className="text-white">Price legitimately extends into DANGER during powerful breakouts; the standard counter-trend reversal play has lower win rate here</strong>. The operator&apos;s adjustment: when the Ribbon row shows STRONG TREND aligned with the DANGER direction (e.g. STRONG BULL TREND + ▲ JUST HIT DANGER), reduce counter-trend entry size further (0.25R or skip), and prefer to wait for confirmation via failed-mean-reversion (price holds in DANGER for 5+ bars without snapping back) before considering longer-term reversal. <strong className="text-white">Strong-trend DANGER is the one place where the standard counter-trend rules need modulation</strong>.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASE &mdash; COIL ACTIVE OVER TRANSITIONS</p>
              <p className="text-sm text-gray-400 leading-relaxed">When the coil glow is active (vol_compression &lt; 0.6) AND a zone transition fires, the situation is structurally rare. <strong className="text-white">Compression usually keeps price near fair value; for a transition to fire during coil, an unusual move broke the compression range</strong>. The breakout direction is usually significant; trade with the breakout, not against it. JUST HIT CAUTION during coil is often the start of a real expansion move &mdash; counter-trend entries here have lower win rate than usual. <strong className="text-white">Wait for the coil to fully release (glow extinguishes) before applying standard transition trades</strong>; the underlying structural condition matters more than the surface transition event during this rare overlap.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE CASE &mdash; ENTRENCHED CONDITIONS (RUNAWAY OR SNAP)</p>
              <p className="text-sm text-gray-400 leading-relaxed">ENTRENCHED DANGER means price has been in DANGER zone for 21+ bars. <strong className="text-white">Two scenarios produce this: (1) runaway trend that statistically &ldquo;should have&rdquo; reverted but didn&apos;t, or (2) impending massive snap with delayed execution</strong>. The cascade can&apos;t distinguish between the two; the operator must analyze higher timeframes, news context, and structural levels. <strong className="text-white">Default to skip</strong> &mdash; the standard counter-trend rules have failed here and forcing the trade is statistically unfavorable. If conviction is high after explicit analysis, size the trade at 0.25R maximum and use a tight ATR-based stop. ENTRENCHED is the engine&apos;s &ldquo;you&apos;re on your own&rdquo; flag; respect it.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
            <p className="text-sm text-gray-400 leading-relaxed">Transitions are entry/management triggers. States are management contexts. <strong className="text-white">JUST HIT DANGER = enter counter-trend at 0.5R. JUST HIT CAUTION = tighten stops + scale 50% off existing. LEAVING DANGER = scale out counter-trend, eye trend re-entry. BACK TO SAFE = arc complete, exit and reset</strong>. State-mode bars are about waiting, not acting. <strong className="text-white">Edge cases (strong trend + DANGER, coil + transitions, ENTRENCHED) require explicit analysis</strong>; default to skip and re-engage when the standard cascade rules apply cleanly. The engine&apos;s eight cascade messages give you eight distinct operator responses; match the response to the message and execute consistently.</p>
          </div>
        </motion.div>
      </section>

      {/* === S15 — The Cheat Sheet === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">15 &mdash; The Cheat Sheet</p>
          <h2 className="text-2xl font-extrabold mb-4">Everything You Need, One Reference Card</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Print this section. Pin it next to your charts. <strong className="text-white">The cheat sheet collapses every actionable rule from the lesson into a single dense reference</strong> &mdash; bands, zones, score, transitions, dwell, cascade, sizing table, transition plays. Use it to verify a setup before entering, to check stop placement after entering, to recognize an edge case in real time. The whole CIPHER Risk Envelope system, distilled.</p>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ANCHOR + BANDS</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Anchor</strong>: <code className="text-amber-400">EMA(HL2, 20)</code> &mdash; the Fair Value Line. <strong className="text-white">Three bands at base ATR multiples</strong>: inner 1.2x, mid 2.35x, outer 3.5x. <strong className="text-white">Regime scale</strong>: <code className="text-amber-400">0.85 + trend_pct * 0.004</code>, range 0.85-1.25. <strong className="text-white">VOLATILE bonus</strong>: +0.10 stacked on top. <strong className="text-white">Asymmetry</strong>: trend-side widens, counter-side tightens, capped at &plusmn;15%, ramped by ADX above 15.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOUR ZONES (BAR-CLOSE BINARY)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">SAFE</strong>: inside inner band. <strong className="text-white">WATCH</strong>: past inner, inside mid. <strong className="text-white">CAUTION</strong>: past mid, inside outer. <strong className="text-white">DANGER</strong>: past outer band. <strong className="text-white">Direction prefix</strong>: ▲ above fair value, ▼ below. <strong className="text-white">Classification uses close, not high/low</strong> &mdash; wicks don&apos;t count.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">MEAN REVERSION SCORE (CONTINUOUS)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><code className="text-amber-400">mr_score = risk_atr_dist / mr_max_ref &times; 80</code>, capped 100. <strong className="text-white">Labels</strong>: 0-20 NONE, 20-40 LOW, 40-60 MODERATE, 60-80 HIGH, 80+ EXTREME. <strong className="text-white">mr_overextended boolean fires at score &gt; 60</strong>. Score updates intra-bar (live); zones update at bar close.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">FOUR TRANSITION EVENTS</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">rz_entered_danger</strong>: zone level just escalated to DANGER. <strong className="text-white">rz_entered_caution</strong>: just escalated to CAUTION. <strong className="text-white">rz_exited_danger</strong>: just de-escalated from DANGER. <strong className="text-white">rz_returned_safe</strong>: just returned to SAFE. <strong className="text-white">All fire for one bar only on first bar of change</strong>. ✕ markers on chart for escalations only (gates on i_show_rz_markers).</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">FOUR DWELL PHASES</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">SPIKE</strong>: 1-2 bars (likely noise). <strong className="text-white">VISIT</strong>: 3-8 bars (meaningful). <strong className="text-white">ESTABLISHED</strong>: 9-20 bars (sustained). <strong className="text-white">ENTRENCHED</strong>: 21+ bars (exceptional, ⚠ fires). <strong className="text-white">Dwell counter resets on zone change</strong>; suffix appended in cascade verdict for non-SAFE non-transition bars.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">8-TIER CASCADE (FIRST-MATCH-WINS)</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">1. JUST HIT DANGER</strong> (rz_entered_danger). <strong className="text-white">2. JUST HIT CAUTION</strong> (rz_entered_caution). <strong className="text-white">3. LEAVING DANGER</strong>. <strong className="text-white">4. BACK TO SAFE</strong>. <strong className="text-white">5. REDUCE SIZE</strong> + dwell. <strong className="text-white">6. TIGHTEN STOPS</strong> + dwell. <strong className="text-white">7. STAY ALERT</strong> + dwell. <strong className="text-white">8. NORMAL SIZE</strong>. Top 4 are 1-bar transitions; bottom 4 are sustained states with dwell suffix.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">SIZING TABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">SAFE = 1R</strong>. <strong className="text-white">WATCH = 1R</strong> (alert). <strong className="text-white">CAUTION = 0.5R</strong> + tighten stops + 50% scale-out. <strong className="text-white">DANGER = 0.25R</strong> + take profits + no new same-direction. <strong className="text-white">ENTRENCHED DANGER = SKIP</strong>, analyze explicitly. <strong className="text-white">No upsizing ever</strong>; the table is the ceiling.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">TRANSITION PLAYS</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">JUST HIT DANGER</strong>: counter-trend entry 0.5R, stop beyond outer band, target fair value. <strong className="text-white">JUST HIT CAUTION</strong>: tighten stops + 50% scale-out on existing same-direction. <strong className="text-white">LEAVING DANGER</strong>: scale 50% off counter-trend, eye trend re-entry. <strong className="text-white">BACK TO SAFE</strong>: counter-trend full exit; chart reset for next setup.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl glass-card mb-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">ADAPTIVE INTENSITY (OPT-IN)</p>
              <p className="text-sm text-gray-400 leading-relaxed">Default OFF. <strong className="text-white">When ON: progressive danger glow (transparency -8 at score &gt; 60, -15 at score &gt; 80) + band breathing (transparency &plusmn;5 with ATR delta)</strong>. Recommended ON for active monitoring; OFF for chart review and screenshots. Does NOT affect engine output &mdash; cascade verdicts and score are invariant to this toggle.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">COIL GLOW OVERRIDE</p>
              <p className="text-sm text-gray-400 leading-relaxed">When <code className="text-amber-400">vol_compression &lt; 0.6</code>, outer edges pulse amber. <strong className="text-white">Spring is coiling, breakout imminent</strong>. Stage breakout orders both directions, size conservatively, wait for the explosive bar. Glow extinguishes when ratio recovers above 0.6 (post-breakout) or compression dissipates without break.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">EDGE-CASE TABLE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">Strong trend + trend-side DANGER</strong>: reduce counter-trend size (0.25R or skip); wait for failed-mean-reversion confirmation. <strong className="text-white">Coil active during transition</strong>: respect the breakout direction; standard transition rules don&apos;t apply. <strong className="text-white">ENTRENCHED conditions</strong>: skip default; if entering, 0.25R max with tight ATR stop. <strong className="text-white">News events</strong>: Risk Envelope still works but transitions can fire on news shocks &mdash; don&apos;t fade news-driven moves blindly.</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-amber-400 mb-1">THE ENTIRE LESSON IN ONE SENTENCE</p>
              <p className="text-sm text-gray-400 leading-relaxed"><strong className="text-white">An adaptive cloud that knows what overextension means in context, with four zones, a continuous score, four transition events, and an 8-tier cascade that turns &ldquo;is this too far?&rdquo; into a single glance with sizing prescribed for every state.</strong></p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === MISTAKES — SIX COMMON FAILURES === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Six Common Mistakes</p>
          <h2 className="text-2xl font-extrabold mb-4">The Failure Modes &mdash; Recognize Them, Avoid Them</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Every operator new to the Risk Envelope makes the same six mistakes. <strong className="text-white">Each one costs trades, costs money, and reinforces the wrong reading habits</strong>. Recognizing them in your own trading is half the fix; the other half is operationalizing the cheat sheet rules above so the mistakes never happen in the first place. Below are the six failure modes ordered by frequency.</p>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 1 &mdash; TRADING THE BANDS LIKE FIXED BOLLINGER BANDS</p>
              <p className="text-sm text-gray-400 leading-relaxed">Most common mistake. The trader sees price at the outer band and assumes mean reversion is imminent &mdash; the same reflex that fixed-band indicators teach. <strong className="text-white">In a strong trend, the outer band has been adaptively widened by 25-35%; reaching it means price is genuinely at extreme stretch, not just &ldquo;at the band&rdquo;</strong>. Counter-trend entries at the outer band in strong trends fail at high rates. <strong className="text-white">Fix</strong>: read the cascade verdict, not just the band crossing. JUST HIT DANGER + counter-trend setup = play the reversion. Static at upper-DANGER in strong trend without transition firing = wait, the engine hasn&apos;t given you the entry yet.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 2 &mdash; IGNORING THE DWELL SUFFIX</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader sees ▼ CAUTION and reacts identically whether dwell is 1b or 15b. <strong className="text-white">A 1b CAUTION (SPIKE phase) is barely meaningful; a 15b CAUTION (ESTABLISHED phase) is structurally significant</strong>. Reacting identically means over-reacting on noise (SPIKE) and under-reacting on sustained conditions (ESTABLISHED). <strong className="text-white">Fix</strong>: read the dwell suffix. SPIKE = wait one bar. VISIT = act with standard sizing. ESTABLISHED = scale out aggressively. ENTRENCHED = unusual, analyze explicitly. The dwell turns a snapshot into a story; ignore it and you&apos;re reading half the chart.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 3 &mdash; SIZING IDENTICALLY ACROSS ZONES</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader takes 1R risk in every zone because the trade &ldquo;looks good&rdquo;. <strong className="text-white">This is the systematic underperformance pattern that the sizing table exists to prevent</strong>. CAUTION-zone trades have meaningfully lower win rates than SAFE-zone trades; sizing them identically guarantees the math works against you over time. <strong className="text-white">Fix</strong>: lock the sizing table. SAFE/WATCH = 1R. CAUTION = 0.5R. DANGER = 0.25R. ENTRENCHED = skip. The Risk row tells you the size; you don&apos;t override.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 4 &mdash; ADDING TO TREND TRADES IN UPPER-CAUTION/DANGER</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader is long, the trend is up, price has just entered ▲ CAUTION or ▲ DANGER &mdash; and they want to add. <strong className="text-white">The directional blocking rule says NO new same-direction entries at CAUTION or DANGER</strong>; same-direction adds in these zones are statistically the worst-performing trade type in CIPHER backtests. The reasoning: you&apos;re adding right where mean reversion is most likely. <strong className="text-white">Fix</strong>: when zone is CAUTION/DANGER + same direction as existing position, freeze. Don&apos;t add. If anything, scale out. Adds happen in SAFE/WATCH zones, not stretched ones.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 5 &mdash; ENTERING AT JUST HIT DANGER WITHOUT CONFIRMING DIRECTION</p>
              <p className="text-sm text-gray-400 leading-relaxed">JUST HIT DANGER is a high-conviction counter-trend entry, but only against the direction of the overextension. <strong className="text-white">▲ JUST HIT DANGER = enter SHORT (because price is overextended UP, reversion is DOWN)</strong>. The trader who reads &ldquo;DANGER fires&rdquo; and enters with the existing trend direction (long because the trend was up) is doing the opposite of what the engine prescribes. <strong className="text-white">Fix</strong>: read the direction prefix. ▲ DANGER = short. ▼ DANGER = long. The arrow is critical; the entry direction is OPPOSITE the arrow. Counter-trend is the play, not trend continuation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/15">
              <p className="text-xs font-bold text-red-400 mb-2">MISTAKE 6 &mdash; FIGHTING THE COIL GLOW</p>
              <p className="text-sm text-gray-400 leading-relaxed">The trader sees the amber outer-edge glow during coil and tries to fade the compression with a counter-trend trade. <strong className="text-white">Coil glow is a directional setup, not a counter-trend signal</strong>. The compressed range is about to release; trading against the eventual breakout is fighting the structural condition. <strong className="text-white">Fix</strong>: when coil glow is active, trade WITH the breakout, not against it. Stage breakout orders both directions, take whichever fires, ride the expansion. Counter-trend trades only after the coil has fully released and a standard JUST HIT DANGER transition fires &mdash; not before.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === GAME UI — 5-round scenario challenge === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">The Risk Envelope Operator Challenge</p>
          <h2 className="text-2xl font-extrabold mb-4">Five Live Scenarios &mdash; Pick The Right Read</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Five real CIPHER situations using the Risk Envelope and its Command Center row. Each scenario gives you a cascade reading or a market condition; you pick what an Operator does next. <strong className="text-white">No partial credit, no points</strong> &mdash; the goal is calibrating your gut instinct to the engine&apos;s reading framework. Pick honestly. Read every explanation. By the end you should be able to glance at any Risk row verdict and know without thinking what the playbook says.</p>

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
            <p className="text-sm text-gray-400 leading-relaxed">If you missed a round, re-read the corresponding lesson section. Round 1 maps to the dwell phase reading covered in S09. Round 2 maps to the JUST HIT CAUTION management trigger in S08 + S14. Round 3 maps to the BACK TO SAFE arc completion in S08 + S14. Round 4 maps to the Adaptive Intensity recognition covered in S11. Round 5 maps to the cascade priority structure in S10. <strong className="text-white">Calibration first; the quiz comes next</strong>.</p>
          </div>
        </motion.div>
      </section>

      {/* === QUIZ UI — 8 multiple choice with submit gate === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Knowledge Check</p>
          <h2 className="text-2xl font-extrabold mb-4">Eight Questions &mdash; Pass At 66% To Earn The Cert</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Eight short-form questions covering the anchor formula, regime scaling, directional asymmetry, zone classification, the Mean Reversion Score, cascade priority, the sizing table, and the coil glow override. <strong className="text-white">66% pass threshold (6 of 8 correct)</strong>. Pick all eight, then submit. You&apos;ll see your score, per-question feedback, and &mdash; if you pass &mdash; your Risk Envelope Operator certificate appears at the bottom of the page.</p>

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
                <p className="text-sm text-teal-200 leading-relaxed">Pass. Your Risk Envelope Operator certificate is being prepared below. The 66% threshold is calibrated so passing means you can reliably read the engine&apos;s output during live trading without second-guessing the cascade.</p>
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

      {/* === CERTIFICATE — Risk Envelope Operator === */}
      {certRevealed && (
        <section className="max-w-2xl mx-auto px-5 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Lesson Complete</p>
            <h2 className="text-2xl font-extrabold mb-4">Your Risk Envelope Operator Certificate</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Earned by demonstrating proficiency on the eight-question knowledge check. Your certificate ID below is generated uniquely for this session and ties this completion to your Operator profile across the ATLAS Academy. <strong className="text-white">You can now reliably read every CIPHER Risk Envelope verdict in real time</strong> &mdash; the anchor and bands, regime-adaptive width, directional asymmetry, the four zones, the Mean Reversion Score, the four transition events, the four dwell phases, the 8-tier cascade, the sizing table, the coil glow override, and the trade plan for transitions vs sustained states.</p>

            <div className="relative p-8 rounded-3xl overflow-hidden border border-amber-400/35 bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.04] to-orange-500/[0.06]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,179,0,0.10), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,140,0,0.06), transparent 50%)' }} />

              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
                </div>

                <p className="text-center text-xs font-bold tracking-[0.3em] uppercase text-amber-400/70 mb-2">ATLAS Academy &middot; Cipher Pro</p>
                <h3 className="text-center text-3xl font-black mb-3 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent">Risk Envelope Operator</h3>
                <p className="text-center text-xs tracking-widest uppercase text-amber-400/55 mb-6">Level 11 &middot; Lesson 20</p>

                <div className="border-t border-amber-400/15 pt-5 mb-5">
                  <p className="text-center text-sm text-gray-300 leading-relaxed mb-3">This certificate confirms its holder has demonstrated proficiency in the CIPHER Risk Envelope module &mdash; the EMA(HL2,20) anchor, the three nested ATR-multiple bands, regime-adaptive width with directional asymmetry, the four risk zones with bar-close classification, the continuous Mean Reversion Score, the four transition events, the four dwell phases, the 8-tier cascade with transition-outranks-state priority, the zone-based sizing discipline, and the Adaptive Intensity / coil glow visual layers.</p>
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
                  <p className="text-xs text-amber-400/50 font-mono uppercase tracking-[0.25em]">How Far Is Too Far</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-bold text-amber-400 mb-1">&#11088; THE OPERATOR&apos;S READ</p>
              <p className="text-sm text-gray-400 leading-relaxed">You&apos;ve earned the badge by demonstrating you can read the engine. <strong className="text-white">The next phase is paper trading the Risk Envelope dimension on a live demo</strong> &mdash; OANDA MT5 or any chart with CIPHER applied. Track 30 trades that triggered cascade verdict changes, log the verdict at entry, log the operator action you took, and compare against the prescribed action. The cert says you can read; the demo says you can execute. Both matter, and the muscle memory only forms with reps.</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* === FOOTER — next lesson + back to academy === */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="border-t border-white/10 pt-8">
            <p className="text-xs font-bold tracking-widest uppercase text-amber-400/60 mb-3">Next In Level 11</p>
            <h2 className="text-2xl font-extrabold mb-4">L11.21 &mdash; Cipher Risk Map</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Lesson 11.20 &mdash; Cipher Risk Envelope is complete. <strong className="text-white">L11.21 (Risk Map) closes out the Visual Layer arc</strong> &mdash; where Risk Envelope answers &ldquo;how far is too far in real time&rdquo;, Risk Map answers &ldquo;where are the structural risk zones across the chart&rdquo;. The two modules are complementary: Risk Envelope is dynamic and price-relative; Risk Map is static and level-relative. Your progress is automatically saved to your Operator profile; the next time you log in, the Academy index will show this lesson as completed and unlock L11.21 when it ships.</p>

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
              ATLAS Academy &middot; CIPHER PRO &middot; Level 11 &middot; Lesson 20 &middot; Cipher Risk Envelope
            </p>
            <p className="text-xs text-gray-600 text-center mt-1 font-mono">
              {scrollY > 0 ? `Scroll: ${scrollY}px` : 'Top of lesson'} &middot; How Far Is Too Far
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
